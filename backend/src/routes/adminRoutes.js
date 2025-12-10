import express from 'express';
import {
  getUsers,
  getAuditLogs,
  getAnalytics
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { userLimiter } from '../middlewares/security.js';
import { validateCsrfToken } from '../middlewares/csrf.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);
// Apply per-user rate limiting (admins have higher limits)
router.use(userLimiter);
// Note: Admin GET routes don't need CSRF, but if you add POST/PATCH/DELETE, add validateCsrfToken

router.get('/users', getUsers);
router.get('/audit-logs', getAuditLogs);
router.get('/analytics', getAnalytics);

export default router;

