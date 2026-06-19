import { Router } from 'express';
import { body } from 'express-validator';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventStats,
} from '../controllers/eventController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import { validateRequest } from './middleware';

const router = Router();

router.get('/', optionalAuth, getEvents);
router.get('/stats', authenticate, requireAdmin, getEventStats);
router.get('/:id', optionalAuth, getEventById);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('description').trim().notEmpty().withMessage('Description required'),
    body('type').notEmpty().withMessage('Event type required'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').isISO8601().withMessage('Valid end date required'),
  ],
  validateRequest,
  createEvent
);

router.patch('/:id', authenticate, requireAdmin, updateEvent);
router.delete('/:id', authenticate, requireAdmin, deleteEvent);

router.post(
  '/:id/register',
  optionalAuth,
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
  ],
  validateRequest,
  registerForEvent
);

export default router;
