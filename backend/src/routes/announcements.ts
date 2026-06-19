import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import { validateRequest } from './middleware';

const router = Router();

router.get('/', optionalAuth, getAnnouncements);
router.get('/:id', optionalAuth, getAnnouncementById);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('content').trim().notEmpty().withMessage('Content required'),
  ],
  validateRequest,
  createAnnouncement
);

router.patch('/:id', authenticate, requireAdmin, updateAnnouncement);
router.delete('/:id', authenticate, requireAdmin, deleteAnnouncement);

export default router;
