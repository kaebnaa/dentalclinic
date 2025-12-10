import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validate, schemas } from '../middlewares/validation.js';
import { authLimiter, checkLoginAttempts } from '../middlewares/security.js';

const router = express.Router();

router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, checkLoginAttempts, validate(schemas.login), login);

export default router;

