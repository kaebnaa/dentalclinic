# Fix CORS Error on Vercel

## 🔴 Current Error

Your frontend at `https://dentalclinic-psi.vercel.app` is being blocked by CORS when calling the backend API.

## ✅ Quick Fix (2 minutes)

### Step 1: Go to Vercel Dashboard

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **backend project** (the one with the API)

### Step 2: Add Environment Variable

1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Click **Add New**
4. Set:
   - **Key:** `CORS_ORIGIN`
   - **Value:** `https://dentalclinic-psi.vercel.app`
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or run in terminal:
   ```bash
   cd backend
   vercel --prod
   ```

## ✅ That's It!

After redeploy, CORS should work. The backend will now accept requests from `https://dentalclinic-psi.vercel.app`.

## 🔍 Verify It Works

After redeploy, test:
```bash
curl -H "Origin: https://dentalclinic-psi.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-backend.vercel.app/api/auth/login \
     -v
```

Should see:
```
Access-Control-Allow-Origin: https://dentalclinic-psi.vercel.app
```

## 📝 Multiple Origins

If you have multiple frontend domains, separate with commas:
```
CORS_ORIGIN=https://dentalclinic-psi.vercel.app,https://www.yourdomain.com
```

## 🐛 Still Not Working?

1. **Check the URL** - No trailing slash: `https://dentalclinic-psi.vercel.app` ✅ (not `https://dentalclinic-psi.vercel.app/` ❌)
2. **Redeploy** - Environment variables only apply after redeploy
3. **Check logs** - Vercel Dashboard → Deployments → View logs
4. **Clear browser cache** - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

---

**The code is already configured correctly - you just need to set the environment variable in Vercel!**

