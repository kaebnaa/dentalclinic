import express from 'express';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch
} from '../controllers/branchController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { validateCsrfToken } from '../middlewares/csrf.js';

const router = express.Router();

// Public routes
router.get('/', getBranches);
router.get('/:id', getBranchById);

// Admin routes with CSRF protection
router.post('/', authenticate, requireAdmin, validateCsrfToken, validate(schemas.createBranch), createBranch);
router.patch('/:id', authenticate, requireAdmin, validateCsrfToken, validate(schemas.updateBranch), updateBranch);
router.delete('/:id', authenticate, requireAdmin, validateCsrfToken, deleteBranch);

export default router;

