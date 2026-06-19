import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { AuthRequest, JwtPayload } from '../types';
import { env } from '../config/env';
import { sendPasswordReset } from '../utils/email';
import { AppError } from '../middleware/errorHandler';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, role, type: 'access' } as JwtPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' } as JwtPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, school, country } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      school,
      country,
      role: 'student',
    });

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    await User.findByIdAndUpdate(user._id, { refreshToken, lastLogin: new Date() });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact support.', 403);
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    await User.findByIdAndUpdate(user._id, { refreshToken, lastLogin: new Date() });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token required', 400);
    }

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401);
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid or revoked refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString(),
      user.role
    );

    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid refresh token', 401));
      return;
    }
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await sendPasswordReset(user.email, user.firstName, resetToken);

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};
