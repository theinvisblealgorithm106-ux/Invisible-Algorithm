import { Response, NextFunction } from 'express';
import { Research } from '../models/Research';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const featured = req.query.featured;
    const status = req.query.status as string || 'published';

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';

    const query: Record<string, unknown> = {};

    if (!isAdmin) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$text = { $search: search };
    }

    const total = await Research.countDocuments(query);
    const research = await Research.find(query)
      .populate('submittedBy', 'firstName lastName')
      .sort(search ? { score: { $meta: 'textScore' } } : { publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        research,
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

export const getResearchById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const isSlug = !id.match(/^[0-9a-fA-F]{24}$/);

    const query = isSlug ? { slug: id } : { _id: id };
    const paper = await Research.findOne(query)
      .populate('submittedBy', 'firstName lastName bio avatar school');

    if (!paper) {
      throw new AppError('Research paper not found', 404);
    }

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
    if (paper.status !== 'published' && !isAdmin && paper.submittedBy.toString() !== req.user?._id.toString()) {
      throw new AppError('Research paper not found', 404);
    }

    await Research.findByIdAndUpdate(paper._id, { $inc: { views: 1 } });

    res.json({ success: true, data: { research: paper } });
  } catch (error) {
    next(error);
  }
};

export const createResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, abstract, content, authors, category, tags, pdfUrl, externalUrl, doi } = req.body;

    const research = await Research.create({
      title,
      abstract,
      content,
      authors: authors || [{ name: req.user!.fullName, user: req.user!._id }],
      category,
      tags,
      pdfUrl,
      externalUrl,
      doi,
      submittedBy: req.user!._id,
      status: 'submitted',
    });

    res.status(201).json({
      success: true,
      message: 'Research paper submitted for review',
      data: { research },
    });
  } catch (error) {
    next(error);
  }
};

export const updateResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const paper = await Research.findById(id);

    if (!paper) {
      throw new AppError('Research paper not found', 404);
    }

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
    const isOwner = paper.submittedBy.toString() === req.user!._id.toString();

    if (!isAdmin && !isOwner) {
      throw new AppError('Unauthorized to update this paper', 403);
    }

    const allowedUpdates = isAdmin
      ? ['title', 'abstract', 'content', 'authors', 'category', 'tags', 'status', 'featured', 'pdfUrl', 'externalUrl', 'doi']
      : ['title', 'abstract', 'content', 'authors', 'category', 'tags', 'pdfUrl', 'externalUrl', 'doi'];

    const updates: Record<string, unknown> = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = await Research.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    res.json({ success: true, message: 'Research paper updated', data: { research: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteResearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const paper = await Research.findById(id);

    if (!paper) {
      throw new AppError('Research paper not found', 404);
    }

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
    const isOwner = paper.submittedBy.toString() === req.user!._id.toString();

    if (!isAdmin && !isOwner) {
      throw new AppError('Unauthorized to delete this paper', 403);
    }

    await Research.findByIdAndDelete(id);

    res.json({ success: true, message: 'Research paper deleted' });
  } catch (error) {
    next(error);
  }
};

export const getResearchStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [total, categoryStats, statusStats] = await Promise.all([
      Research.countDocuments(),
      Research.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Research.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    res.json({ success: true, data: { total, categoryStats, statusStats } });
  } catch (error) {
    next(error);
  }
};
