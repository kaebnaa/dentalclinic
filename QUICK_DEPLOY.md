# Quick Deployment Guide

## 🚀 Deploy Both Frontend & Backend to Vercel

### Step 1: Deploy Backend (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy backend
cd backend
vercel
```

**Set Environment Variables in Vercel Dashboard:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGIN` (update after frontend deploy)
- `NODE_ENV=production`

**Deploy to production:**
```bash
vercel --prod
```

**Save your backend URL:** `https://your-backend.vercel.app`

---

### Step 2: Deploy Frontend (5 minutes)

```bash
# From root directory
cd ..
vercel
```

**Set Environment Variable in Vercel Dashboard:**
- `NEXT_PUBLIC_API_URL=https://your-backend.vercel.app`

**Deploy to production:**
```bash
vercel --prod
```

**Save your frontend URL:** `https://your-frontend.vercel.app`

---

### Step 3: Update Backend CORS

Go to Backend project → Settings → Environment Variables

Update `CORS_ORIGIN`:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

Redeploy backend:
```bash
cd backend
vercel --prod
```

---

### Step 4: Test

1. Visit: `https://your-frontend.vercel.app`
2. Try to login with:
   - Email: `admin@dentalclinic.com`
   - Password: `Admin@123456`

---

## 📝 Environment Variables Summary

### Backend (Vercel)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

---

## ✅ Done!

Your app is now live! 🎉

- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app/api`

For detailed instructions, see `DEPLOYMENT.md`

