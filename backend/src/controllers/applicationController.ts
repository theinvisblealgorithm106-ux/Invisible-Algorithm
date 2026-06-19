import { Request, Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { sendApplicationConfirmation, sendApplicationStatusUpdate } from '../utils/email';

export const submitApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const existingApp = await Application.findOne({ email: email.toLowerCase(), status: { $in: ['pending', 'reviewing', 'accepted'] } });
    if (existingApp) {
      throw new AppError('An application with this email already exists or has been accepted', 409);
    }

    const application = await Application.create({
      ...req.body,
      status: 'pending',
    });

    await sendApplicationConfirmation(email, req.body.firstName);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. You will receive a confirmation email.',
      data: { applicationId: application._id },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const country = req.query.country as string | undefined;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (country) query.country = country;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { school: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        applications,
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

export const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).populate('reviewedBy', 'firstName lastName');

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    res.json({ success: true, data: { application } });
  } catch (error) {
    next(error);
  }
};

export const reviewApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const application = await Application.findById(id);

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const prevStatus = application.status;
    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = req.user!._id;
    application.reviewedAt = new Date();
    await application.save();

    if (prevStatus !== status && (status === 'accepted' || status === 'rejected' || status === 'waitlisted')) {
      await sendApplicationStatusUpdate(
        application.email,
        application.firstName,
        status,
        reviewNotes
      );
    }

    res.json({
      success: true,
      message: `Application ${status}`,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const countryStats = await Application.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const total = await Application.countDocuments();

    res.json({ success: true, data: { total, stats, countryStats } });
  } catch (error) {
    next(error);
  }
};
