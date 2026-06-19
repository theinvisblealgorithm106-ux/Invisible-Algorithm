import { Router } from 'express';
import { body } from 'express-validator';
import {
  getResearch,
  getResearchById,
  createResearch,
  updateResearch,
  deleteResearch,
  getResearchStats,
} from '../controllers/researchController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireResearcher, requireAdmin } from '../middleware/roles';
import { validateRequest } from './middleware';

const router = Router();

router.get('/', optionalAuth, getResearch);
router.get('/stats', authenticate, requireAdmin, getResearchStats);
router.get('/:id', optionalAuth, getResearchById);

router.post(
  '/',
  authenticate,
  requireResearcher,
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('abstract').trim().notEmpty().withMessage('Abstract required'),
    body('content').trim().notEmpty().withMessage('Content required'),
    body('category').notEmpty().withMessage('Category required'),
  ],
  validateRequest,
  createResearch
);

router.patch('/:id', authenticate, updateResearch);
router.delete('/:id', authenticate, deleteResearch);

export default router;
