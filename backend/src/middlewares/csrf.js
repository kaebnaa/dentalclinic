/**
 * CSRF Protection Middleware
 * Note: For API-only applications, CSRF is less critical but still recommended
 * This implementation uses a simple token-based approach
 */

import crypto from 'crypto';

// In-memory CSRF token store (use Redis in production)
const csrfTokens = new Map();

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (req) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 3600000; // 1 hour
  
  csrfTokens.set(token, {
    expiresAt,
    createdAt: Date.now()
  });
  
  // Clean up expired tokens
  setTimeout(() => {
    csrfTokens.delete(token);
  }, 3600000);
  
  return token;
};

/**
 * Validate CSRF token middleware factory
 * Can be used as route-level middleware
 */
export const validateCsrfToken = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for public endpoints (auth endpoints use rate limiting instead)
  if (req.path.startsWith('/api/auth') || req.path === '/api/csrf-token') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body?._csrf;
  
  if (!token) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CSRF token missing'
    });
  }
  
  const tokenData = csrfTokens.get(token);
  
  if (!tokenData) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid CSRF token'
    });
  }
  
  if (Date.now() > tokenData.expiresAt) {
    csrfTokens.delete(token);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CSRF token expired'
    });
  }
  
  // Token is valid, continue
  next();
};

/**
 * CSRF token endpoint
 */
export const getCsrfToken = (req, res) => {
  const token = generateCsrfToken(req);
  res.json({ csrfToken: token });
};

