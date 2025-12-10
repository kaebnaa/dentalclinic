# Deploying to Vercel

This guide will help you deploy the Dental Clinic Backend API to Vercel.

## Prerequisites

- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project with database set up
- Environment variables ready

## Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

## Step 3: Navigate to Backend Directory

```bash
cd backend
```

## Step 4: Deploy to Vercel

### First Deployment (Preview)

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? (e.g., `dental-clinic-backend`)
- Directory? **./** (current directory)
- Override settings? **No**

### Production Deployment

```bash
vercel --prod
```

## Step 5: Configure Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
NODE_ENV=production
PORT=3001
```

5. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

## Step 6: Update CORS Origin

After deployment, update `CORS_ORIGIN` in Vercel environment variables to match your frontend URL.

## Step 7: Test Your Deployment

Your API will be available at:
```
https://your-project-name.vercel.app/api
```

Test endpoints:
- Health: `https://your-project-name.vercel.app/health`
- Login: `POST https://your-project-name.vercel.app/api/auth/login`

## Alternative: Deploy via GitHub

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **Add New Project**
   - Import your GitHub repository
   - Set **Root Directory** to `backend`
   - Add environment variables
   - Click **Deploy**

## Project Structure for Vercel

```
backend/
├── api/
│   └── index.js          # Vercel serverless entry point
├── src/
│   ├── app.js            # Express app
│   └── ...
├── vercel.json           # Vercel configuration
└── package.json
```

## Troubleshooting

### Issue: Environment variables not working
- Make sure you've added them in Vercel Dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Issue: CORS errors
- Update `CORS_ORIGIN` in environment variables
- Include your frontend domain (with https://)
- Redeploy after updating

### Issue: Database connection errors
- Verify Supabase credentials are correct
- Check Supabase project is active
- Ensure database schema and RLS policies are applied

### Issue: Function timeout
- Vercel free tier has 10s timeout for serverless functions
- Upgrade to Pro for longer timeouts if needed
- Optimize database queries

## Monitoring

- View logs in Vercel Dashboard → **Deployments** → Select deployment → **Functions** tab
- Check **Analytics** for API usage and performance

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CORS_ORIGIN` to include custom domain

## Continuous Deployment

Once connected to GitHub, Vercel will automatically deploy on every push to your main branch.

---

**Your API is now live! 🚀**

