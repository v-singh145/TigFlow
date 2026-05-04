# 🚀 Quick Start: Deploy in 10 Minutes

## Prerequisites (5 minutes)
Before you start, you need:
- [ ] GitHub account (free at github.com)
- [ ] Vercel account (free at vercel.com)
- [ ] Render account (free at render.com)
- [ ] MongoDB Atlas account (free at mongodb.com/cloud/atlas)

---

## Step 1: Set Up MongoDB Atlas (2 minutes)

```bash
1. Go to mongodb.com/cloud/atlas
2. Click "Create Free Account"
3. Create a new project
4. Build a Cluster → M0 Free tier → Create
5. Username/Password → Save these!
6. Network Access → Add IP Address → 0.0.0.0/0
7. Database → Clusters → Connect → Copy connection string
```

Save this: `mongodb+srv://username:password@cluster.mongodb.net/gigflow?...`

---

## Step 2: Push to GitHub (2 minutes)

```bash
cd Desktop/Gigflow

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/gigflow.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Render (2 minutes)

```
1. Go to render.com → Sign up with GitHub
2. Click "New +" → "Web Service"
3. Select "gigflow" repository
4. Fill in:
   - Name: gigflow-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
5. Add Environment Variables (click "Add Secret File"):
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow?retryWrites=true&w=majority
   JWT_SECRET=super-secret-key-12345678901234567890
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://gigflow-XXXX.vercel.app (update later)
6. Click "Create Web Service"
7. Wait for deployment ✅
8. Copy URL: https://gigflow-backend.onrender.com
```

---

## Step 4: Deploy Frontend to Vercel (2 minutes)

```
1. Go to vercel.com → Sign up with GitHub
2. Click "New Project"
3. Select "gigflow" repository
4. Edit:
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
5. Add Environment Variables:
   VITE_API_URL=https://gigflow-backend.onrender.com
6. Click "Deploy"
7. Wait for deployment ✅
8. Copy URL: https://gigflow-XXXX.vercel.app
```

---

## Step 5: Final Update (1 minute)

```
1. Go back to Render dashboard
2. Open "gigflow-backend" service
3. Go to "Environment"
4. Update FRONTEND_URL:
   https://gigflow-XXXX.vercel.app (from Step 4)
5. Click "Save"
6. It will redeploy automatically ✅
```

---

## 🎉 You're Live!

Your app is now live at:
**https://gigflow-XXXX.vercel.app**

### Test It
- Create account
- Post a gig
- Submit a bid
- Hire a freelancer
- Open in 2 tabs → watch real-time updates

### Share
- Send link to friends
- Test on mobile
- Monitor performance

---

## 📊 What You Get (FREE)

| Service | What's Included |
|---------|-----------------|
| **Vercel** | Unlimited builds, custom domain, auto-deploy on push |
| **Render** | Free tier: 750 free hours/month, auto-restart, logging |
| **MongoDB Atlas** | 512MB storage, 512MB backups, monitoring, 3 replicas |
| **Total** | **COMPLETELY FREE** 🎉 |

---

## 🔗 Dashboard Links

After deployment, you can manage your app from:
- **Frontend**: https://vercel.com/dashboard
- **Backend**: https://dashboard.render.com
- **Database**: https://cloud.mongodb.com

---

## 🚨 Troubleshooting

### App shows error page
→ Check backend logs in Render dashboard

### Cannot submit forms
→ Frontend API URL is wrong
→ Go to Vercel → Settings → Environment Variables → Fix `VITE_API_URL`

### MongoDB connection error
→ Check MongoDB Atlas → Network Access → Verify IP is 0.0.0.0/0

### CORS errors in console
→ Backend CORS not set correctly
→ Go to Render → Environment → Update `FRONTEND_URL`

---

## 📝 Next Steps

After getting online:
1. Get custom domain (optional)
2. Set up monitoring
3. Add more features
4. Scale if needed

---

**That's it!** Your app is now a live website! 🚀

Deployed on: _______________
Frontend: _______________
Backend: _______________
