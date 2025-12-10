import express from 'express';
import { register, login, updateProfile } from '../controllers/authController.js';
import { validate, schemas } from '../middlewares/validation.js';
import { authLimiter, checkLoginAttempts, userLimiter } from '../middlewares/security.js';
import { authenticate } from '../middlewares/auth.js';
import { validateCsrfToken } from '../middlewares/csrf.js';

const router = express.Router();

router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, checkLoginAttempts, validate(schemas.login), login);
router.patch('/profile', authenticate, userLimiter, validateCsrfToken, validate(schemas.updateProfile), updateProfile);

export default router;

