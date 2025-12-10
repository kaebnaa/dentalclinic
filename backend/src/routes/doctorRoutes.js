import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from '../controllers/doctorController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { validateCsrfToken } from '../middlewares/csrf.js';

const router = express.Router();

// Public routes (authenticated users can view doctors)
router.get('/', authenticate, getDoctors);
router.get('/:id', authenticate, getDoctorById);

// Admin routes with CSRF protection
router.post('/', authenticate, requireAdmin, validateCsrfToken, validate(schemas.createDoctor), createDoctor);
router.patch('/:id', authenticate, requireAdmin, validateCsrfToken, updateDoctor);
router.delete('/:id', authenticate, requireAdmin, validateCsrfToken, deleteDoctor);

export default router;

