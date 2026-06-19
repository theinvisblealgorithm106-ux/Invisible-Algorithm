import { Response, NextFunction } from 'express';
import { Event } from '../models/Event';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);
    const type = req.query.type as string | undefined;
    const format = req.query.format as string | undefined;
    const status = req.query.status as string | undefined;
    const featured = req.query.featured;
    const upcoming = req.query.upcoming;

    const query: Record<string, unknown> = { isPublic: true };

    if (type) query.type = type;
    if (format) query.format = format;
    if (status) query.status = status;
    if (featured === 'true') query.featured = true;
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
      query.status = { $in: ['upcoming', 'ongoing'] };
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName')
      .select('-registrations')
      .sort({ startDate: upcoming === 'true' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        events,
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

export const getEventById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const isSlug = !id.match(/^[0-9a-fA-F]{24}$/);

    const query = isSlug ? { slug: id } : { _id: id };
    const event = await Event.findOne(query)
      .populate('organizer', 'firstName lastName bio avatar');

    if (!event || (!event.isPublic && req.user?.role !== 'admin' && req.user?.role !== 'super_admin')) {
      throw new AppError('Event not found', 404);
    }

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
    const eventData = isAdmin ? event : { ...event.toObject(), registrations: undefined };

    res.json({ success: true, data: { event: eventData } });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.create({
      ...req.body,
      organizer: req.user!._id,
      registeredCount: 0,
      registrations: [],
    });

    res.status(201).json({
      success: true,
      message: 'Event created',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const updated = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Event updated', data: { event: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const event = await Event.findById(id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      throw new AppError('Registration is closed for this event', 400);
    }

    if (event.capacity && event.registeredCount >= event.capacity) {
      throw new AppError('This event is at full capacity', 400);
    }

    const existingReg = event.registrations.find(
      (r) => r.email === email || (req.user && r.user?.toString() === req.user._id.toString())
    );

    if (existingReg) {
      throw new AppError('You are already registered for this event', 400);
    }

    event.registrations.push({
      user: req.user?._id,
      name: name || req.user?.fullName || 'Guest',
      email: email || req.user?.email || '',
      registeredAt: new Date(),
    });
    event.registeredCount += 1;
    await event.save();

    res.json({ success: true, message: 'Successfully registered for the event' });
  } catch (error) {
    next(error);
  }
};

export const getEventStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [total, typeStats, statusStats] = await Promise.all([
      Event.countDocuments(),
      Event.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    res.json({ success: true, data: { total, typeStats, statusStats } });
  } catch (error) {
    next(error);
  }
};
