# CORS Error Fix Guide

## 🔴 Error Message

```
Access to fetch at 'https://your-project.vercel.app/api/auth/login' 
from origin 'https://dentalclinic-psi.vercel.app' has been blocked by CORS policy
```

## 🔍 Problem

The backend is not allowing requests from your frontend domain `https://dentalclinic-psi.vercel.app`.

## ✅ Solution

### Option 1: Update Environment Variable in Vercel (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **backend project**
3. Go to **Settings** → **Environment Variables**
4. Find or add `CORS_ORIGIN`
5. Set the value to:
   ```
   https://dentalclinic-psi.vercel.app
   ```
   Or if you have multiple origins:
   ```
   https://dentalclinic-psi.vercel.app,https://www.yourdomain.com
   ```
6. **Redeploy** the backend:
   ```bash
   cd backend
   vercel --prod
   ```

### Option 2: If Using Single Project Deployment

If both frontend and backend are in the same Vercel project:

1. The API should be at the same domain: `https://dentalclinic-psi.vercel.app/api`
2. Update `NEXT_PUBLIC_API_URL` in Vercel to:
   ```
   NEXT_PUBLIC_API_URL=https://dentalclinic-psi.vercel.app
   ```
3. The frontend should use relative URLs: `/api` (already configured)

### Option 3: Quick Test - Allow All Origins (Development Only)

**⚠️ WARNING: Only for testing, NOT for production!**

Temporarily update `backend/src/app.js`:

```javascript
const corsOptions = {
  origin: true, // Allow all origins (REMOVE IN PRODUCTION!)
  credentials: true,
  optionsSuccessStatus: 200
};
```

Then redeploy and test. **Remember to revert this and set proper CORS_ORIGIN!**

## 🔧 Verification Steps

1. **Check Backend CORS_ORIGIN:**
   - Should include: `https://dentalclinic-psi.vercel.app`
   - Should NOT have trailing slash

2. **Check Frontend API URL:**
   - Should be: `https://your-backend.vercel.app` (if separate projects)
   - Or: `https://dentalclinic-psi.vercel.app` (if single project)

3. **Test CORS:**
   ```bash
   curl -H "Origin: https://dentalclinic-psi.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -X OPTIONS \
        https://your-backend.vercel.app/api/auth/login \
        -v
   ```

   Should return:
   ```
   Access-Control-Allow-Origin: https://dentalclinic-psi.vercel.app
   ```

## 📝 Environment Variables Checklist

### Backend (Vercel)
```
CORS_ORIGIN=https://dentalclinic-psi.vercel.app
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

## 🐛 Common Issues

### Issue: Still getting CORS error after setting CORS_ORIGIN
- **Solution:** Make sure you redeployed after changing environment variables
- **Solution:** Check for typos in the URL (no trailing slash, correct protocol)

### Issue: Preflight (OPTIONS) request fails
- **Solution:** The CORS configuration now includes proper OPTIONS handling
- **Solution:** Check that `methods` and `allowedHeaders` are correct

### Issue: Credentials not working
- **Solution:** Ensure `credentials: true` in CORS config
- **Solution:** Frontend must include `credentials: 'include'` in fetch (if needed)

## ✅ After Fix

Your API calls should work:
```javascript
// This should now work
fetch('https://your-backend.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

---

**Quick Fix:** Set `CORS_ORIGIN=https://dentalclinic-psi.vercel.app` in Vercel backend environment variables and redeploy!

