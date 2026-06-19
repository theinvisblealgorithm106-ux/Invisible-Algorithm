import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthRequest, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const role = req.query.role as UserRole | undefined;
    const search = req.query.search as string | undefined;
    const country = req.query.country as string | undefined;
    const isActive = req.query.isActive;

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (country) query.country = country;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { school: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const country = req.query.country as string | undefined;
    const search = req.query.search as string | undefined;

    const query: Record<string, unknown> = {
      role: { $in: ['member', 'researcher', 'admin', 'super_admin'] },
      isActive: true,
    };

    if (country) query.country = country;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { school: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const members = await User.find(query)
      .select('firstName lastName role bio school country avatar socialLinks interests joinedAt')
      .sort({ joinedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        members,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-refreshToken');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Non-admin users can only see public profiles of active members
    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      if (!user.isActive) {
        throw new AppError('User not found', 404);
      }
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, bio, school, country, socialLinks, interests } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { firstName, lastName, bio, school, country, socialLinks, interests },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!._id).select('+password');

    if (!user || !(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (id === req.user!._id.toString()) {
      throw new AppError('Cannot change your own role', 400);
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ success: true, message: 'User role updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user!._id.toString()) {
      throw new AppError('Cannot deactivate your own account', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalUsers, roleStats, countryStats] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.aggregate([
        { $match: { country: { $exists: true, $ne: '' } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: { totalUsers, roleStats, countryStats },
    });
  } catch (error) {
    next(error);
  }
};
