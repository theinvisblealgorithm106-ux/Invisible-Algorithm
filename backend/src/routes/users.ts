import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getUsers,
  getMembers,
  getUserById,
  updateProfile,
  changePassword,
  updateUserRole,
  toggleUserStatus,
  getStats,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireSuperAdmin } from '../middleware/roles';
import { validateRequest } from './middleware';

const router = Router();

router.get('/members', getMembers);
router.get('/:id', authenticate, getUserById);

router.patch(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('bio').optional().isLength({ max: 500 }),
  ],
  validateRequest,
  updateProfile
);

router.patch(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validateRequest,
  changePassword
);

router.get('/', authenticate, requireAdmin, getUsers);
router.get('/stats/overview', authenticate, requireAdmin, getStats);

router.patch(
  '/:id/role',
  authenticate,
  requireSuperAdmin,
  [
    param('id').isMongoId(),
    body('role').isIn(['student', 'member', 'researcher', 'admin', 'super_admin']),
  ],
  validateRequest,
  updateUserRole
);

router.patch('/:id/toggle-status', authenticate, requireAdmin, toggleUserStatus);

export default router;
