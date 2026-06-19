import { Request, Response, NextFunction } from 'express';
import { Partnership } from '../models/Partnership';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getPartnerships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string || 'active';
    const type = req.query.type as string | undefined;

    const query: Record<string, unknown> = { status };
    if (type) query.organizationType = type;

    const partnerships = await Partnership.find(query)
      .select('organizationName organizationType country logo website status partnerSince')
      .sort({ partnerSince: -1 });

    res.json({ success: true, data: { partnerships } });
  } catch (error) {
    next(error);
  }
};

export const getAllPartnerships = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (type) query.organizationType = type;

    const total = await Partnership.countDocuments(query);
    const partnerships = await Partnership.find(query)
      .populate('managedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        partnerships,
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

export const createPartnership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const partnership = await Partnership.create({
      ...req.body,
      managedBy: req.user!._id,
    });

    res.status(201).json({
      success: true,
      message: 'Partnership created',
      data: { partnership },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePartnership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const partnership = await Partnership.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!partnership) {
      throw new AppError('Partnership not found', 404);
    }

    res.json({ success: true, data: { partnership } });
  } catch (error) {
    next(error);
  }
};

export const deletePartnership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const partnership = await Partnership.findByIdAndDelete(id);

    if (!partnership) {
      throw new AppError('Partnership not found', 404);
    }

    res.json({ success: true, message: 'Partnership deleted' });
  } catch (error) {
    next(error);
  }
};
