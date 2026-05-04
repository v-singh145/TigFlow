# 🚀 GigFlow Deployment Guide

Complete guide to deploy GigFlow to production with live hosting options.

---

## 📋 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) ⭐ RECOMMENDED
- **Frontend**: Vercel (free tier available)
- **Backend**: Render (free tier available)
- **Database**: MongoDB Atlas (free tier: 512MB)
- **Cost**: FREE
- **Ease**: ⭐⭐⭐⭐⭐ Very easy

### Option 2: Netlify (Frontend) + Railway (Backend)
- **Frontend**: Netlify (free tier)
- **Backend**: Railway (free trial: $5/month credits)
- **Database**: MongoDB Atlas (free tier)
- **Cost**: FREE (with trial)
- **Ease**: ⭐⭐⭐⭐⭐ Very easy

### Option 3: GitHub Pages (Frontend) + Heroku (Backend)
- **Frontend**: GitHub Pages (free)
- **Backend**: Heroku (paid: ~$7/month)
- **Database**: MongoDB Atlas (free tier)
- **Cost**: Paid
- **Ease**: ⭐⭐⭐⭐ Medium

### Option 4: AWS (Full Stack)
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or Elastic Beanstalk
- **Database**: MongoDB Atlas or AWS DocumentDB
- **Cost**: Varies ($5-50+/month)
- **Ease**: ⭐⭐⭐ Medium

---

## 🟢 Option 1: Vercel + Render (RECOMMENDED)

### Prerequisites
- GitHub account (to push code)
- MongoDB Atlas account (free)
- Vercel account (free)
- Render account (free)

### Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project
4. Create a free cluster (M0)
5. Add a database user (username/password)
6. Add IP address: `0.0.0.0/0` (allow all IPs)
7. Click "Connect" → Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/gigflow?retryWrites=true&w=majority
   ```

### Step 2: Push Code to GitHub

```bash
# Initialize git (if not already)
cd Desktop/Gigflow
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/gigflow.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy Backend to Render

1. Go to [Render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name**: `gigflow-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Region**: Choose closest to you

6. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow?retryWrites=true&w=majority
   JWT_SECRET=your-random-secret-key-here
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

7. Click "Create Web Service"
8. Wait for deployment (2-5 minutes)
9. Copy the backend URL: `https://gigflow-backend.onrender.com`

### Step 4: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
   ```
   VITE_API_URL=https://gigflow-backend.onrender.com
   ```

7. Click "Deploy"
8. Wait for deployment (1-3 minutes)
9. Copy the frontend URL: `https://gigflow-xxxx.vercel.app`

### Step 5: Update Backend Configuration

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://gigflow-xxxx.vercel.app
   ```
5. Click "Save" (auto-redeploys)

### ✅ Done!
Your app is now live at: **https://gigflow-xxxx.vercel.app**

---

## 🔵 Option 2: Netlify + Railway

### Prerequisites
- GitHub account
- MongoDB Atlas account
- Netlify account (free)
- Railway account (free trial)

### Step 1: MongoDB Atlas (same as Option 1)
Follow Step 1 from Option 1 above

### Step 2: GitHub Setup (same as Option 1)
Follow Step 2 from Option 1 above

### Step 3: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your gigflow repository
5. Click "Add variables":
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow?retryWrites=true&w=majority
   JWT_SECRET=your-random-secret-key-here
   PORT=5000
   NODE_ENV=production
   ```

6. Railway auto-detects it's Node.js
7. Click "Deploy"
8. Copy the backend URL from Railway dashboard

### Step 4: Deploy Frontend to Netlify

1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your gigflow repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

6. Add build environment variables:
   ```
   VITE_API_URL=your-railway-backend-url
   ```

7. Click "Deploy site"
8. Copy frontend URL

### ✅ Done!
Your app is live at: **your-netlify-url.netlify.app**

---

## 📋 Pre-Deployment Checklist

### Backend (`backend/.env` production)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow?retryWrites=true&w=majority
JWT_SECRET=generate-strong-random-string-here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (`frontend/.env.production`)
```
VITE_API_URL=https://your-backend-domain.com
```

### Files to Check

**backend/server.js**
```javascript
// Ensure CORS is configured
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**backend/package.json**
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

**frontend/package.json**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🔧 Post-Deployment Configuration

### Update Backend API URL
After backend is deployed, update in backend:
1. Go to backend service settings
2. Set environment variable:
   ```
   FRONTEND_URL=https://your-vercel-app.com
   ```

### Update Frontend API URL
After backend is deployed, update:
1. Go to frontend deployment settings
2. Set environment variable:
   ```
   VITE_API_URL=https://your-render-backend.onrender.com
   ```
3. Trigger redeploy

### Test Backend Connection
```bash
# Frontend console
fetch('https://your-backend-url.com/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 🐛 Troubleshooting Deployment

### Frontend Won't Load
```
❌ "Cannot GET /"
→ Check vite.config.js base path
→ Verify build output in dist folder
→ Check deployment logs
```

### Backend 503 Error
```
❌ "Service Unavailable"
→ Check MongoDB connection string
→ Verify MongoDB Atlas IP whitelist
→ Check backend logs for errors
```

### CORS Errors
```
❌ "Access-Control-Allow-Origin" missing
→ Ensure backend CORS configured with FRONTEND_URL
→ Update frontend VITE_API_URL
→ Redeploy both services
```

### MongoDB Connection Timeout
```
❌ "Connection refused"
→ Verify MONGO_URI in environment variables
→ Check MongoDB Atlas: Network Access → Add Current IP
→ Use 0.0.0.0/0 to allow all IPs
```

### Socket.io Not Connecting
```
❌ Socket.io connection refused
→ Backend needs to serve socket endpoint
→ Update Socket.io CORS in backend
→ Check firewall/port restrictions
```

---

## 📊 Performance Tips

### Frontend (Vercel)
- Enable automatic image optimization
- Enable edge caching
- Use ISR (Incremental Static Regeneration)
- Monitor bundle size

### Backend (Render)
- Use connection pooling for MongoDB
- Enable gzip compression
- Set up monitoring and alerts
- Use caching headers appropriately

### Database (MongoDB Atlas)
- Monitor connection count
- Set up auto-scaling for free tier
- Use indexes on frequently queried fields
- Enable compression

---

## 🔐 Production Security

### Environment Variables
Never commit `.env` files. Use platform's secret management:
- Render: Environment variables section
- Vercel: Settings → Environment Variables
- Railway: Variables tab

### HTTPS
- ✅ All platforms provide free HTTPS
- ✅ Automatic SSL certificates
- ✅ Auto-renewal

### Database Security
1. Use strong password (32+ chars, random)
2. Enable IP whitelist (or use 0.0.0.0/0 for testing)
3. Use `useUnifiedTopology: true` in Mongoose
4. Enable encryption at rest (Atlas paid feature)

### API Security
1. Set appropriate CORS origins
2. Enable rate limiting (add later)
3. Validate all inputs
4. Use HTTPS only
5. Set secure cookies

---

## 📈 Monitoring & Logs

### Render Backend Logs
```
Dashboard → Your Service → Logs
View real-time server logs
```

### Vercel Frontend Logs
```
Deployments → Click deployment → Logs
View build and function logs
```

### MongoDB Atlas Logs
```
Atlas Dashboard → Logs
Monitor query performance
```

---

## 💳 Cost Breakdown (Monthly)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel (Frontend) | ✅ Unlimited | $20+ |
| Render (Backend) | ✅ 750 hrs/month | $12+ |
| Railway | ✅ $5 credits | $5+ |
| Netlify | ✅ Unlimited builds | $19+ |
| MongoDB Atlas | ✅ 512MB storage | $57+ |
| **TOTAL** | **FREE** | **$50+** |

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push
Both Vercel and Render support automatic deployment:
1. Push to GitHub
2. Webhook triggers deployment
3. Automatic build and deploy
4. No manual steps needed

### Deployment Status
- Vercel: Shows in comment on GitHub PR
- Render: Shows in dashboard
- Railway: Shows in UI

---

## 🎯 Next Steps After Deployment

1. **Test Everything**
   - Create account
   - Post a gig
   - Submit a bid
   - Test hire functionality
   - Test real-time updates

2. **Set Up Custom Domain** (Optional)
   - Point domain to Vercel
   - Point subdomain to Render
   - Configure DNS

3. **Enable Monitoring**
   - Set up error tracking (Sentry)
   - Enable analytics (Vercel Analytics)
   - Monitor database performance

4. **Optimize Performance**
   - Minify assets
   - Enable caching
   - Optimize images
   - Lazy load components

5. **Scale If Needed**
   - Upgrade tier as traffic grows
   - Add CDN for global users
   - Implement database sharding

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Netlify Docs**: https://docs.netlify.com
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com

---

## ✨ Final Checklist

- [ ] MongoDB Atlas cluster created
- [ ] MongoDB user credentials saved
- [ ] Repository pushed to GitHub
- [ ] Backend deployed to Render/Railway
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Frontend API URL updated
- [ ] All features tested in production
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backup plan documented

---

**Status**: Ready to Deploy 🚀

