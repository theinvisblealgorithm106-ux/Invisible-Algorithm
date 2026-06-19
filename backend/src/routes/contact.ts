import { Router } from 'express';
import { body } from 'express-validator';
import {
  submitContact,
  getMessages,
  updateMessageStatus,
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers,
} from '../controllers/contactController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import { validateRequest } from './middleware';

const router = Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('subject').trim().notEmpty().withMessage('Subject required'),
    body('message').isLength({ min: 10, max: 5000 }).withMessage('Message must be 10-5000 characters'),
  ],
  validateRequest,
  submitContact
);

router.get('/messages', authenticate, requireAdmin, getMessages);
router.patch('/messages/:id/status', authenticate, requireAdmin, updateMessageStatus);

router.post(
  '/newsletter/subscribe',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  validateRequest,
  subscribeNewsletter
);

router.post(
  '/newsletter/unsubscribe',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  validateRequest,
  unsubscribeNewsletter
);

router.get('/newsletter/subscribers', authenticate, requireAdmin, getNewsletterSubscribers);

export default router;
