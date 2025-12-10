# Deploying Frontend & Backend to Vercel

This guide will help you deploy both the Next.js frontend and Express backend to Vercel.

## 🏗️ Architecture

- **Frontend**: Next.js app (root directory)
- **Backend**: Express API (`backend/` directory)
- **Deployment**: Two separate Vercel projects (recommended)

## 📋 Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- Supabase project with database set up
- GitHub account (for automatic deployments)

## 🚀 Deployment Strategy

### Option 1: Separate Projects (Recommended)

Deploy frontend and backend as separate Vercel projects for better:
- Independent scaling
- Separate environment variables
- Independent deployments
- Better performance

### Option 2: Monorepo (Single Project)

Deploy everything in one project (more complex, not recommended for this setup)

---

## 📦 Step 1: Deploy Backend First

### 1.1 Install Vercel CLI

```bash
npm i -g vercel
```

### 1.2 Login to Vercel

```bash
vercel login
```

### 1.3 Deploy Backend

```bash
cd backend
vercel
```

Follow prompts:
- Set up and deploy? **Yes**
- Link to existing project? **No**
- Project name: `dental-clinic-backend` (or your choice)
- Directory: `./` (current directory)
- Override settings? **No**

### 1.4 Set Backend Environment Variables

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your backend project → **Settings** → **Environment Variables**

Add:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

**Note:** You'll update `CORS_ORIGIN` after deploying the frontend.

### 1.5 Deploy Backend to Production

```bash
vercel --prod
```

**Save your backend URL:** `https://your-backend-project.vercel.app`

---

## 🎨 Step 2: Deploy Frontend

### 2.1 Create Frontend Environment File

Create `.env.production.local` in the root directory:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app
```

### 2.2 Deploy Frontend

```bash
# From root directory
cd ..
vercel
```

Follow prompts:
- Set up and deploy? **Yes**
- Link to existing project? **No**
- Project name: `dental-clinic-frontend` (or your choice)
- Directory: `./` (current directory)
- Override settings? **No**

### 2.3 Set Frontend Environment Variables

Go to Vercel Dashboard → Frontend project → **Settings** → **Environment Variables**

Add:
```
NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app
```

### 2.4 Update Backend CORS

Go back to Backend project → **Settings** → **Environment Variables**

Update `CORS_ORIGIN`:
```
CORS_ORIGIN=https://your-frontend-project.vercel.app
```

Redeploy backend:
```bash
cd backend
vercel --prod
```

### 2.5 Deploy Frontend to Production

```bash
# From root directory
vercel --prod
```

---

## 🔄 Step 3: Update Frontend to Use Backend API

The frontend currently uses mock data. Update `lib/auth-context.tsx` to use the backend API.

### 3.1 Create API Utility

Create `lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  async register(data: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
```

### 3.2 Update Auth Context

Update `lib/auth-context.tsx` to use the API utility instead of mock data.

---

## 🌐 Step 4: GitHub Integration (Optional but Recommended)

### 4.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/dental-clinic-system.git
git push -u origin main
```

### 4.2 Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. For **Backend Project**:
   - Root Directory: `backend`
   - Framework Preset: **Other**
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. For **Frontend Project**:
   - Root Directory: `.` (root)
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 4.3 Set Environment Variables

Add environment variables in Vercel Dashboard for both projects.

---

## ✅ Step 5: Verify Deployment

### Test Backend

```bash
curl https://your-backend-project.vercel.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### Test Frontend

Visit: `https://your-frontend-project.vercel.app`

### Test API Connection

1. Open browser console on frontend
2. Try to login
3. Check network tab for API calls

---

## 🔧 Troubleshooting

### CORS Errors

- Ensure `CORS_ORIGIN` in backend matches frontend URL exactly
- Include `https://` in the URL
- Redeploy backend after updating CORS

### Environment Variables Not Working

- Variables must start with `NEXT_PUBLIC_` for frontend
- Redeploy after adding variables
- Check variable names are exact (case-sensitive)

### API Connection Failed

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is deployed and accessible
- Verify CORS is configured correctly

### Build Errors

- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel Dashboard

---

## 📊 Project URLs

After deployment, you'll have:

- **Frontend**: `https://your-frontend-project.vercel.app`
- **Backend API**: `https://your-backend-project.vercel.app/api`
- **Health Check**: `https://your-backend-project.vercel.app/health`

---

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Automatic rollback on deployment failures

---

## 🎉 Success!

Your dental clinic system is now live on Vercel! 🚀

