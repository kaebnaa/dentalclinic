# Security Fixes Implementation Guide

## Quick Fix Summary

**Total Issues: 12**
- Critical: 2 ⚠️
- High: 3 🔴
- Medium: 4 🟡
- Low: 3 🟢

---

## 🔴 Critical Fixes

### Fix 1: Secure Token Storage

**File:** `lib/auth-context.tsx`, `lib/api.ts`

**Current (Vulnerable):**
```typescript
localStorage.setItem("token", response.token);
```

**Fixed (Secure):**
```typescript
// Option 1: Use httpOnly cookies (requires backend changes)
// Backend: Set httpOnly cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000
});

// Option 2: Use sessionStorage (better than localStorage)
sessionStorage.setItem("token", response.token);

// Option 3: Use secure storage library
import SecureLS from 'secure-ls';
const ls = new SecureLS({ encodingType: 'aes' });
ls.set('token', response.token);
```

---

### Fix 2: Sanitize Error Messages

**File:** `backend/src/middlewares/security.js`

**Current (Vulnerable):**
```javascript
res.status(err.status || 500).json({
  error: err.message || 'Internal Server Error',
  ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
});
```

**Fixed (Secure):**
```javascript
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Never expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Sanitize error message
  let errorMessage = 'An error occurred';
  let statusCode = err.status || 500;
  
  if (isDevelopment) {
    errorMessage = err.message || 'Internal Server Error';
  } else {
    // In production, use generic messages
    if (statusCode === 500) {
      errorMessage = 'Internal Server Error';
    } else if (statusCode === 400) {
      errorMessage = 'Invalid request';
    } else if (statusCode === 401) {
      errorMessage = 'Unauthorized';
    } else if (statusCode === 403) {
      errorMessage = 'Forbidden';
    } else if (statusCode === 404) {
      errorMessage = 'Resource not found';
    }
  }

  const response = {
    error: errorMessage,
    ...(isDevelopment && { 
      stack: err.stack,
      details: err.message 
    })
  };

  res.status(statusCode).json(response);
};
```

---

## 🔴 High Priority Fixes

### Fix 3: Strong Password Policy

**File:** `backend/src/middlewares/validation.js`

**Current:**
```javascript
password: z.string().min(8)
```

**Fixed:**
```javascript
password: z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
```

---

### Fix 4: CSRF Protection

**File:** `backend/src/middlewares/security.js`

**Add:**
```javascript
import csrf from 'csurf';

// CSRF protection
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply to state-changing operations
app.use('/api', csrfProtection);

// Add CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**Frontend:** Include CSRF token in requests
```typescript
// Get CSRF token
const { csrfToken } = await api.request('/api/csrf-token');

// Include in requests
headers: {
  'X-CSRF-Token': csrfToken
}
```

---

### Fix 5: Per-User Rate Limiting

**File:** `backend/src/middlewares/security.js`

**Add:**
```javascript
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Per-user rate limiter
export const userLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:user:'
  }),
  windowMs: 15 * 60 * 1000,
  max: async (req) => {
    // Different limits based on user role
    if (req.user?.role === 'admin') return 1000;
    if (req.user?.role === 'doctor') return 500;
    return 100;
  },
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  message: 'Too many requests, please try again later.'
});

// Account lockout after failed attempts
const loginAttempts = new Map();

export const checkLoginAttempts = (req, res, next) => {
  const key = `login:${req.body.email}`;
  const attempts = loginAttempts.get(key) || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };
  
  if (attempts.count >= 5) {
    if (Date.now() < attempts.resetTime) {
      return res.status(429).json({
        error: 'Too many login attempts',
        message: 'Account temporarily locked. Try again in 15 minutes.'
      });
    } else {
      // Reset after timeout
      attempts.count = 0;
    }
  }
  
  req.loginAttempts = attempts;
  next();
};
```

---

## 🟡 Medium Priority Fixes

### Fix 6: HTML Input Sanitization

**Install:**
```bash
npm install dompurify
npm install @types/dompurify
```

**File:** `backend/src/middlewares/validation.js`

**Add:**
```javascript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML in notes fields
export const sanitizeHtml = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []
  });
};

// Update validation schemas
notes: z.string().max(500).transform(sanitizeHtml).optional()
```

---

### Fix 7: Additional Security Headers

**File:** `backend/src/middlewares/security.js`

**Update:**
```javascript
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});
```

---

### Fix 8: Request Size Limits

**File:** `backend/src/app.js`

**Update:**
```javascript
// Limit body size
app.use(express.json({ limit: '1mb' })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Limit query parameters
app.use((req, res, next) => {
  if (Object.keys(req.query).length > 50) {
    return res.status(400).json({ error: 'Too many query parameters' });
  }
  next();
});

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});
```

---

### Fix 9: Mask Sensitive Data in Logs

**File:** `backend/src/services/auditService.js`

**Add:**
```javascript
const maskSensitiveFields = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card'];
  const masked = { ...data };
  
  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***REDACTED***';
    }
  }
  
  return masked;
};

static async log({ actorId, action, entity, oldData = null, newData = null }) {
  // Mask sensitive data
  const safeOldData = oldData ? maskSensitiveFields(oldData) : null;
  const safeNewData = newData ? maskSensitiveFields(newData) : null;
  
  // ... rest of the code
}
```

---

## 🟢 Low Priority Fixes

### Fix 10: API Versioning

**File:** `backend/src/routes/*.js`

**Update all routes:**
```javascript
// Change from:
app.use('/api/auth', authRoutes);

// To:
app.use('/api/v1/auth', authRoutes);
```

---

### Fix 11: Request ID Tracking

**File:** `backend/src/middlewares/security.js`

**Add:**
```javascript
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Use in app.js
app.use(requestIdMiddleware);
```

---

### Fix 12: Environment Variable Validation

**File:** `backend/src/config/supabase.js`

**Add:**
```javascript
const validateEnv = () => {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate URL format
  if (!process.env.SUPABASE_URL.match(/^https?:\/\/.+/)) {
    throw new Error('SUPABASE_URL must be a valid URL');
  }
  
  // Validate key format (should be JWT-like)
  if (process.env.SUPABASE_ANON_KEY.length < 100) {
    throw new Error('SUPABASE_ANON_KEY appears to be invalid');
  }
};

validateEnv();
```

---

## 📦 Required Dependencies

```bash
# For CSRF protection
npm install csurf
npm install @types/csurf

# For Redis rate limiting
npm install ioredis rate-limit-redis

# For HTML sanitization
npm install isomorphic-dompurify

# For request IDs
npm install uuid
npm install @types/uuid
```

---

## ✅ Testing Checklist

After implementing fixes:

- [ ] Test token storage (should not be in localStorage)
- [ ] Test error messages (should not leak info)
- [ ] Test password requirements (should enforce complexity)
- [ ] Test CSRF protection (should reject requests without token)
- [ ] Test rate limiting (should limit per user)
- [ ] Test HTML sanitization (should strip HTML)
- [ ] Test security headers (should be present)
- [ ] Test request limits (should reject oversized requests)
- [ ] Test audit logs (should mask sensitive data)

---

**Priority Order:**
1. Critical fixes (2) - Do immediately
2. High priority (3) - Do within 1 week
3. Medium priority (4) - Do within 1 month
4. Low priority (3) - Do when time permits

