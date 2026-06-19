import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPartnerships,
  getAllPartnerships,
  createPartnership,
  updatePartnership,
  deletePartnership,
} from '../controllers/partnershipController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import { validateRequest } from './middleware';

const router = Router();

router.get('/', getPartnerships);

router.get('/all', authenticate, requireAdmin, getAllPartnerships);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('organizationName').trim().notEmpty().withMessage('Organization name required'),
    body('organizationType').notEmpty().withMessage('Organization type required'),
    body('country').trim().notEmpty().withMessage('Country required'),
    body('contactName').trim().notEmpty().withMessage('Contact name required'),
    body('contactEmail').isEmail().withMessage('Valid contact email required'),
  ],
  validateRequest,
  createPartnership
);

router.patch('/:id', authenticate, requireAdmin, updatePartnership);
router.delete('/:id', authenticate, requireAdmin, deletePartnership);

export default router;
