import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest, JwtPayload } from '../types';
import { env } from '../config/env';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access token required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (decoded.type !== 'access') {
      res.status(401).json({ success: false, message: 'Invalid token type' });
      return;
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User not found or deactivated' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Access token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Invalid access token' });
      return;
    }
    next(error);
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // Token invalid or expired — proceed without user
  }

  next();
};
