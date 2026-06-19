import { Router } from 'express';
import { body } from 'express-validator';
import {
  submitApplication,
  getApplications,
  getApplicationById,
  reviewApplication,
  getApplicationStats,
} from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import { validateRequest } from './middleware';

const router = Router();

router.post(
  '/',
  [
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('school').trim().notEmpty().withMessage('School required'),
    body('country').trim().notEmpty().withMessage('Country required'),
    body('gradeLevel').notEmpty().withMessage('Grade level required'),
    body('age').isInt({ min: 10, max: 30 }).withMessage('Age must be between 10 and 30'),
    body('interests').isArray({ min: 1 }).withMessage('At least one interest required'),
    body('motivation').isLength({ min: 100, max: 2000 }).withMessage('Motivation must be 100-2000 characters'),
    body('experience').isLength({ max: 2000 }).withMessage('Experience cannot exceed 2000 characters'),
    body('contributionPlan').isLength({ min: 100, max: 2000 }).withMessage('Contribution plan must be 100-2000 characters'),
    body('referralSource').notEmpty().withMessage('Referral source required'),
  ],
  validateRequest,
  submitApplication
);

router.get('/', authenticate, requireAdmin, getApplications);
router.get('/stats', authenticate, requireAdmin, getApplicationStats);
router.get('/:id', authenticate, requireAdmin, getApplicationById);

router.patch(
  '/:id/review',
  authenticate,
  requireAdmin,
  [
    body('status').isIn(['pending', 'reviewing', 'accepted', 'rejected', 'waitlisted']).withMessage('Valid status required'),
  ],
  validateRequest,
  reviewApplication
);

export default router;
