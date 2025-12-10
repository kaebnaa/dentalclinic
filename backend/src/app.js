import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { securityMiddleware, apiLimiter, userLimiter, errorHandler, notFoundHandler } from './middlewares/security.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Security middleware
app.use(securityMiddleware);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:3000'];
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Request size limits - reduced from 10mb to prevent DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Limit query parameters
app.use((req, res, next) => {
  if (Object.keys(req.query).length > 50) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'Too many query parameters' 
    });
  }
  next();
});

// Request timeout (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(408).json({ 
        error: 'Request timeout',
        message: 'Request took too long to process' 
      });
    }
  });
  next();
});

// Rate limiting - IP-based for unauthenticated, user-based for authenticated
app.use('/api/', apiLimiter);
// Per-user rate limiting will be applied in routes that require authentication

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CSRF token endpoint (before CSRF protection)
import { getCsrfToken, validateCsrfToken } from './middlewares/csrf.js';
app.get('/api/csrf-token', getCsrfToken);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;

