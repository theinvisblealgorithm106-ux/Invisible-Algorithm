import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { Newsletter } from '../models/Newsletter';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { sendContactConfirmation } from '../utils/email';

export const submitContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, subject, message, category } = req.body;

    const contact = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      category: category || 'general',
      ipAddress: req.ip,
    });

    await sendContactConfirmation(email, name, subject);

    res.status(201).json({
      success: true,
      message: 'Message received. We will respond within 2-3 business days.',
      data: { id: contact._id },
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const total = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query)
      .populate('repliedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        messages,
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

export const updateMessageStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      {
        status,
        ...(status === 'replied' ? { repliedBy: req.user!._id, repliedAt: new Date() } : {}),
      },
      { new: true }
    );

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    res.json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
};

export const subscribeNewsletter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, firstName } = req.body;

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.unsubscribedAt = undefined;
        await existing.save();
        res.json({ success: true, message: 'You have been re-subscribed to our newsletter.' });
        return;
      }
      res.json({ success: true, message: 'You are already subscribed to our newsletter.' });
      return;
    }

    await Newsletter.create({ email, firstName, isActive: true });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
    });
  } catch (error) {
    next(error);
  }
};

export const unsubscribeNewsletter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const sub = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!sub || !sub.isActive) {
      res.json({ success: true, message: 'Email not found in newsletter list.' });
      return;
    }

    sub.isActive = false;
    sub.unsubscribedAt = new Date();
    await sub.save();

    res.json({ success: true, message: 'Successfully unsubscribed from newsletter.' });
  } catch (error) {
    next(error);
  }
};

export const getNewsletterSubscribers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const isActive = req.query.isActive !== 'false';

    const total = await Newsletter.countDocuments({ isActive });
    const subscribers = await Newsletter.find({ isActive })
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: { subscribers, total },
    });
  } catch (error) {
    next(error);
  }
};
