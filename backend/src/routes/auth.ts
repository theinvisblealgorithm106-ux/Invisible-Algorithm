import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from './middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validateRequest,
  login
);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token required')],
  validateRequest,
  refreshToken
);

router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  validateRequest,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validateRequest,
  resetPassword
);

export default router;
