# Setup Guide

Complete setup instructions for the Dental Clinic System.

## Prerequisites

- Node.js 18+ installed
- npm or pnpm
- Supabase account
- Git (optional)

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd dental-clinic-system
```

## Step 2: Install Dependencies

### Frontend
```bash
npm install
```

### Backend
```bash
cd backend
npm install
cd ..
```

## Step 3: Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings → API
4. Copy:
   - Project URL
   - Anon key
   - Service role key

## Step 4: Configure Environment Variables

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Frontend
```bash
# From root directory
cp .env.local.example .env.local
# Edit .env.local with backend URL (http://localhost:3001 for local)
```

## Step 5: Set Up Database

1. Go to Supabase Dashboard → SQL Editor
2. Run `backend/database/schema.sql`
3. Run `backend/database/rls_policies.sql`
4. If you get RLS errors, run `backend/database/fix-rls.sql`

## Step 6: Seed Database

```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@dentalclinic.com` / `Admin@123456`
- 4 sample branches
- 4 sample doctors

## Step 7: Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
# From root directory
npm run dev
```

## Step 8: Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Step 9: Test Login

1. Go to http://localhost:3000/login
2. Login with:
   - Email: `admin@dentalclinic.com`
   - Password: `Admin@123456`

## Troubleshooting

### Port Already in Use
- Change port in `.env` (backend) or `package.json` (frontend)

### Database Connection Error
- Verify Supabase credentials
- Check Supabase project is active
- Ensure schema is applied

### CORS Errors
- Verify `CORS_ORIGIN` in backend `.env`
- Check frontend URL matches

### Module Not Found
- Delete `node_modules` and reinstall
- Check Node.js version (18+)

## Next Steps

- See `DEPLOYMENT.md` for production deployment
- See `INTERNAL.md` for development notes
- See `QUICK_DEPLOY.md` for quick Vercel deployment

