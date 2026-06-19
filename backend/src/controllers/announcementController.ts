import { Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getAnnouncements = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const category = req.query.category as string | undefined;
    const featured = req.query.featured;
    const pinned = req.query.pinned;

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';

    const query: Record<string, unknown> = {};

    if (!isAdmin) {
      query.status = 'published';
      query.$or = [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }];
    }

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (pinned === 'true') query.pinned = true;

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate('author', 'firstName lastName')
      .sort({ pinned: -1, publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        announcements,
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

export const getAnnouncementById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const isSlug = !id.match(/^[0-9a-fA-F]{24}$/);

    const query = isSlug ? { slug: id } : { _id: id };
    const announcement = await Announcement.findOne(query).populate('author', 'firstName lastName');

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
    if (!isAdmin && announcement.status !== 'published') {
      throw new AppError('Announcement not found', 404);
    }

    await Announcement.findByIdAndUpdate(announcement._id, { $inc: { views: 1 } });

    res.json({ success: true, data: { announcement } });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      author: req.user!._id,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created',
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    res.json({ success: true, message: 'Announcement updated', data: { announcement } });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
};
