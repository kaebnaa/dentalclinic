import express from 'express';
import {
  getRecords,
  createRecord,
  deleteRecord
} from '../controllers/recordController.js';
import { authenticate, requireDoctor, requireAdmin } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { userLimiter } from '../middlewares/security.js';
import { validateCsrfToken } from '../middlewares/csrf.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
// Apply per-user rate limiting
router.use(userLimiter);

router.get('/:patientId', validate(schemas.getRecords), getRecords);
router.post('/', requireDoctor, validateCsrfToken, validate(schemas.createRecord), createRecord);
router.delete('/:id', requireDoctor, validateCsrfToken, deleteRecord);

// Admin can also create/delete records
router.post('/admin', requireAdmin, validateCsrfToken, validate(schemas.createRecord), createRecord);
router.delete('/admin/:id', requireAdmin, validateCsrfToken, deleteRecord);

export default router;

