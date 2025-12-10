import express from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { userLimiter } from '../middlewares/security.js';
import { validateCsrfToken } from '../middlewares/csrf.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
// Apply per-user rate limiting
router.use(userLimiter);

router.get('/', getAppointments);
router.post('/', validateCsrfToken, validate(schemas.createAppointment), createAppointment);
router.patch('/:id', validateCsrfToken, validate(schemas.updateAppointment), updateAppointment);
router.delete('/:id', validateCsrfToken, deleteAppointment);

export default router;

