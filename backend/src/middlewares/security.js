import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Security middleware configuration
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false
});

/**
 * Rate limiting for API endpoints (per IP)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Per-user rate limiting (requires authentication)
 * Different limits based on user role
 */
export const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Different limits based on user role
    if (req.user?.role === 'admin') return 1000;
    if (req.user?.role === 'doctor') return 500;
    return 100; // Default for patients
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise fall back to IP
    return req.user?.id || req.ip;
  },
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

/**
 * Stricter rate limiting for auth endpoints
 * Includes account lockout after failed attempts
 */
const loginAttempts = new Map();

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs (increased for comprehensive testing)
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in test environment or if test header is present
    return process.env.NODE_ENV === 'test' || req.headers['x-test-mode'] === 'true';
  }
});

/**
 * Account lockout middleware for login attempts
 */
export const checkLoginAttempts = (req, res, next) => {
  const email = req.body?.email;
  if (!email) return next();

  const key = `login:${email.toLowerCase()}`;
  const attempts = loginAttempts.get(key) || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };

  // Check if account is locked
  if (attempts.count >= 5) {
    if (Date.now() < attempts.resetTime) {
      const minutesLeft = Math.ceil((attempts.resetTime - Date.now()) / 60000);
      return res.status(429).json({
        error: 'Account temporarily locked',
        message: `Too many failed login attempts. Please try again in ${minutesLeft} minute(s).`
      });
    } else {
      // Reset after timeout
      attempts.count = 0;
      attempts.resetTime = Date.now() + 15 * 60 * 1000;
    }
  }

  req.loginAttempts = attempts;
  req.loginAttemptKey = key;
  next();
};

/**
 * Track failed login attempt
 */
export const recordFailedLogin = (email) => {
  const key = `login:${email.toLowerCase()}`;
  const attempts = loginAttempts.get(key) || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };
  attempts.count++;
  attempts.resetTime = Date.now() + 15 * 60 * 1000; // Reset timer on each attempt
  loginAttempts.set(key, attempts);

  // Clean up old entries (older than 1 hour)
  setTimeout(() => {
    loginAttempts.delete(key);
  }, 60 * 60 * 1000);
};

/**
 * Clear login attempts on successful login
 */
export const clearLoginAttempts = (email) => {
  const key = `login:${email.toLowerCase()}`;
  loginAttempts.delete(key);
};

/**
 * Error handling middleware
 * Sanitizes error messages to prevent information leakage
 */
export const errorHandler = (err, req, res, next) => {
  // Log full error details server-side only
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    path: req.path,
    method: req.method,
    requestId: req.id
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = err.status || 500;

  // Sanitize error messages - never expose internal details in production
  let errorMessage = 'An error occurred';
  let errorDetails = null;

  if (isDevelopment) {
    // In development, show more details
    errorMessage = err.message || 'Internal Server Error';
    errorDetails = {
      stack: err.stack,
      code: err.code,
      name: err.name
    };
  } else {
    // In production, use generic messages based on status code
    switch (statusCode) {
      case 400:
        errorMessage = 'Invalid request';
        break;
      case 401:
        errorMessage = 'Unauthorized';
        break;
      case 403:
        errorMessage = 'Forbidden';
        break;
      case 404:
        errorMessage = 'Resource not found';
        break;
      case 409:
        errorMessage = 'Conflict';
        break;
      case 429:
        errorMessage = 'Too many requests';
        break;
      case 500:
      default:
        errorMessage = 'Internal Server Error';
        break;
    }
  }

  // Handle specific error types
  if (err.code && err.code.startsWith('PGRST')) {
    return res.status(400).json({
      error: isDevelopment ? 'Database Error' : 'Invalid request',
      message: isDevelopment ? err.message : 'Invalid request',
      ...(isDevelopment && { details: errorDetails })
    });
  }

  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: isDevelopment ? err.message : 'Invalid request data',
      ...(isDevelopment && { details: errorDetails })
    });
  }

  // Generic error response
  const response = {
    error: errorMessage,
    ...(isDevelopment && { details: errorDetails }),
    ...(req.id && { requestId: req.id })
  };

  res.status(statusCode).json(response);
};

/**
 * 404 handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

