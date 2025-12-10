# Internal Documentation

This document contains internal notes, development guidelines, and project-specific information.

## 📁 Project Structure

```
dental-clinic-system/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Auth pages
│   └── ...
├── backend/              # Express API
│   ├── src/             # Source code
│   ├── database/        # SQL scripts
│   └── api/             # Vercel serverless entry
├── components/           # React components
├── lib/                 # Utilities and API client
└── public/              # Static assets
```

## 🔐 Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Backend (.env)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `CORS_ORIGIN` - Allowed CORS origins
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## 🗄️ Database Setup

1. Run `database/schema.sql` in Supabase SQL Editor
2. Run `database/rls_policies.sql` in Supabase SQL Editor
3. If RLS errors occur, run `database/fix-rls.sql`
4. Run `npm run seed` in backend to create initial data

## 🚀 Development Workflow

### Local Development

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   # From root
   npm install
   npm run dev
   ```

3. **Access:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

### Testing

- Backend: `cd backend && npm test`
- Frontend: Manual testing in browser

## 📝 API Integration

The frontend uses `lib/api.ts` to communicate with the backend. All API calls are centralized here.

### Authentication Flow

1. User logs in via `api.login()`
2. Token stored in `localStorage`
3. Token included in all subsequent requests via `Authorization` header
4. Token validated by backend middleware

## 🔒 Security Notes

- Never commit `.env` files
- Service role key should only be used server-side
- CORS is configured to allow specific origins
- RLS policies enforce database-level security
- JWT tokens expire (handled by Supabase)

## 🐛 Common Issues

### CORS Errors
- Check `CORS_ORIGIN` in backend matches frontend URL
- Ensure URL includes protocol (https://)

### Authentication Failures
- Verify Supabase credentials are correct
- Check token is being sent in requests
- Verify RLS policies are applied

### Database Connection
- Verify Supabase project is active
- Check environment variables are set
- Ensure schema and RLS policies are applied

## 📦 Deployment Checklist

### Backend
- [ ] Environment variables set in Vercel
- [ ] Database schema applied
- [ ] RLS policies applied
- [ ] CORS_ORIGIN updated with frontend URL
- [ ] Health check endpoint working

### Frontend
- [ ] NEXT_PUBLIC_API_URL set to backend URL
- [ ] Build succeeds without errors
- [ ] API calls work correctly
- [ ] Authentication flow works

## 🔄 Update Process

1. Make changes locally
2. Test thoroughly
3. Commit to git
4. Push to GitHub (if connected)
5. Vercel auto-deploys (if connected)
6. Or manually deploy: `vercel --prod`

## 📚 Key Files

- `lib/api.ts` - API client for backend communication
- `lib/auth-context.tsx` - Authentication context
- `backend/src/app.js` - Express app setup
- `backend/src/middlewares/auth.js` - Auth middleware
- `backend/database/schema.sql` - Database schema
- `backend/database/rls_policies.sql` - RLS policies

## 🎯 Default Credentials

After seeding:
- Admin: `admin@dentalclinic.com` / `Admin@123456`
- Doctors: `doctor@dentalclinic.com` / `Doctor@123456`

## 📞 Support

For issues:
1. Check logs in Vercel Dashboard
2. Check browser console for frontend errors
3. Check backend logs for API errors
4. Verify environment variables are set correctly

