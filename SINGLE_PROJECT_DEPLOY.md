# Deploy Frontend & Backend to Single Vercel Project

This guide shows how to deploy both frontend and backend as a single Vercel project.

## 🎯 Benefits

- ✅ Single deployment
- ✅ Single project to manage
- ✅ Shared environment variables
- ✅ Simpler setup
- ✅ Single URL for everything

## 📋 Prerequisites

- Vercel account
- Supabase project set up
- All code ready

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy from Root Directory

```bash
# From root directory (dental-clinic-system/)
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name: `dental-clinic-system` (or your choice)
- Directory: `./` (current directory)
- Override settings? **No**

### Step 4: Set Environment Variables

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your project → **Settings** → **Environment Variables**

Add **ALL** these variables:

#### Backend Variables
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGIN=https://your-project.vercel.app
NODE_ENV=production
PORT=3001
```

#### Frontend Variables
```
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

**Important:** 
- Replace `your-project.vercel.app` with your actual Vercel project URL
- The API will be at the same domain: `https://your-project.vercel.app/api`

### Step 5: Deploy to Production

```bash
vercel --prod
```

## 📁 Project Structure

Vercel will automatically:
- Deploy Next.js frontend as the main app
- Deploy Express backend as serverless functions under `/api/*`

```
your-project.vercel.app/          → Next.js frontend
your-project.vercel.app/api/*     → Express backend API
```

## 🔧 Configuration

The `vercel.json` file is already configured to:
- Build Next.js frontend
- Route `/api/*` to Express backend
- Handle all other routes with Next.js

## ✅ Verify Deployment

### Test Frontend
Visit: `https://your-project.vercel.app`

### Test Backend Health
```bash
curl https://your-project.vercel.app/api/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### Test API Endpoint
```bash
curl https://your-project.vercel.app/api/branches
```

## 🔄 Update Frontend API URL

Since everything is on the same domain, update `lib/api.ts`:

```typescript
// For production, use relative URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
```

Or keep it as is and set `NEXT_PUBLIC_API_URL` to your Vercel URL.

## 🐛 Troubleshooting

### Build Fails

1. **Check Node.js version:**
   - Vercel uses Node.js 18+ by default
   - You can specify in `package.json`:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

2. **Check build logs:**
   - Go to Vercel Dashboard → Deployments → Select deployment → View logs

### API Routes Not Working

1. **Check `vercel.json` configuration:**
   - Ensure routes are correctly configured
   - Backend should be at `backend/api/index.js`

2. **Check environment variables:**
   - All backend env vars must be set
   - CORS_ORIGIN should match your domain

### CORS Errors

- Set `CORS_ORIGIN` to your Vercel domain: `https://your-project.vercel.app`
- Redeploy after updating

## 📝 Environment Variables Summary

All in one place in Vercel Dashboard:

```
# Backend
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CORS_ORIGIN=https://your-project.vercel.app
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

## 🎉 Success!

Your entire application is now deployed as a single Vercel project!

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-project.vercel.app/api`
- **Health Check**: `https://your-project.vercel.app/api/health`

## 🔄 Continuous Deployment

If connected to GitHub:
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests
- Automatic rollback on failures

---

**Single project deployment complete! 🚀**

