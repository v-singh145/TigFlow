# 📤 GitHub Setup for Deployment

Guide to push your code to GitHub and enable auto-deployment.

---

## Step 1: Create GitHub Repository

### Option A: Command Line
```bash
# Go to your project directory
cd Desktop/Gigflow

# Initialize git
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: GigFlow project"

# Create repo on GitHub.com first, then add remote:
git remote add origin https://github.com/YOUR_USERNAME/gigflow.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Option B: GitHub Desktop
1. Download GitHub Desktop
2. Create new repository
3. Publish to GitHub.com
4. Commit and push

---

## Step 2: Configure `.gitignore`

Ensure your `.gitignore` file contains:

```
# Environment variables (SECRET!)
.env
.env.local
.env.*.local

# Node modules (Very large!)
node_modules/
frontend/node_modules/
backend/node_modules/

# Build outputs
dist/
build/
*.log

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Dependencies cache
.npm
yarn-error.log
```

---

## Step 3: Verify Repository Structure

Your GitHub repo should look like:

```
gigflow/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── server.config.js
├── README.md
├── DEPLOYMENT_GUIDE.md
├── QUICK_DEPLOY.md
├── PRODUCTION_CHECKLIST.md
├── DEPLOYMENT_SUMMARY.md
├── DEPLOYMENT_STATUS.md
└── deploy.sh
```

---

## Step 4: Configure Deployment Platforms

### For Vercel (Frontend)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select `gigflow` repository
5. Configure:
   ```
   Framework: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
6. Environment Variables:
   ```
   VITE_API_URL: https://your-backend-url.onrender.com
   ```
7. Deploy!

### For Render (Backend)

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select `gigflow` repository
5. Configure:
   ```
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
6. Environment Variables:
   ```
   MONGO_URI: mongodb+srv://...
   JWT_SECRET: your-secret-key
   PORT: 5000
   NODE_ENV: production
   FRONTEND_URL: https://your-vercel-url.vercel.app
   ```
7. Deploy!

---

## Step 5: Auto-Deploy Setup

### How Auto-Deploy Works

```
You push to GitHub
        ↓
GitHub sends webhook
        ↓
Vercel/Render receives webhook
        ↓
Build runs automatically
        ↓
Deploy to production
        ↓
Your app updates (within 2-5 minutes)
```

### Verify Auto-Deploy

1. Make a small change to a file
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push
   ```
3. Watch Vercel/Render dashboard
4. Deployment should start automatically
5. Changes live in 2-5 minutes

---

## Step 6: Protect Main Branch (Optional)

Prevent accidental deployments:

1. Go to GitHub repository
2. Settings → Branches
3. Add rule for `main` branch:
   - Require pull request review
   - Require status checks to pass
   - Allow auto-merge

---

## Useful Git Commands

### Pushing Changes
```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push
```

### Pulling Changes
```bash
# Get latest from GitHub
git pull origin main
```

### Creating Branches (Optional)
```bash
# Create new branch
git checkout -b feature/new-feature

# Switch to branch
git checkout feature/new-feature

# Push to GitHub
git push -u origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
git push
```

### View History
```bash
# See all commits
git log --oneline

# See recent commits
git log --oneline -10
```

---

## Troubleshooting

### "fatal: not a git repository"
```bash
# Fix: Initialize git
git init
```

### "permission denied (publickey)"
```bash
# Fix: Set up SSH key
# See: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
```

### "rejected... (failed to push)"
```bash
# Fix: Pull latest first
git pull origin main
git push origin main
```

### ".env file not ignored"
```bash
# Fix: Add to .gitignore and remove from git
echo ".env" >> .gitignore
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

---

## Best Practices

### Commit Messages
Use clear, descriptive messages:
```
✅ Good:    "Add atomic hiring logic"
❌ Bad:     "fixed stuff"

✅ Good:    "Update dark theme colors"
❌ Bad:     "colors"
```

### Commit Frequency
- Commit after each feature is complete
- Don't commit broken code
- Keep commits focused (one feature per commit)

### Branch Strategy
```
main branch
├── frontend fixes
├── backend fixes
└── documentation

Feature branches (optional)
├── feature/search-functionality
├── feature/user-ratings
└── bugfix/cors-errors
```

---

## GitHub Workflow Summary

```
1. Make changes locally
   ↓
2. Test everything works
   ↓
3. Commit changes
   ↓
4. Push to GitHub
   ↓
5. Vercel/Render auto-deploys
   ↓
6. App updates live (2-5 min)
   ↓
7. Test in production
   ↓
8. Done! ✅
```

---

## Deployment Workflow

```
Local Development
    ↓
    └─→ git add .
    └─→ git commit -m "feature"
    └─→ git push
        ↓
GitHub Repository
        ↓
Webhook Trigger
    ↓
    ├─→ Vercel (Frontend)
    │   └─→ Build & Deploy
    │
    └─→ Render (Backend)
        └─→ Build & Deploy
        ↓
Live Application
```

---

## Monitoring Deployments

### Vercel Dashboard
- https://vercel.com/dashboard
- Shows build logs
- Shows deployment history
- Shows performance metrics

### Render Dashboard  
- https://dashboard.render.com
- Shows build logs
- Shows deployment history
- Shows server logs

### Check Status After Push
```bash
# After git push, check:
1. Vercel dashboard (2-5 min to deploy)
2. Render dashboard (2-5 min to deploy)
3. Test your app
4. Check browser console for errors
5. Test new features
```

---

## Undo Mistakes

### Undo Last Commit (Not Pushed)
```bash
git reset HEAD~1
```

### Undo Last Push
```bash
# (Careful! Only if not pushed yet)
git push --force-with-lease origin main
```

### Revert to Previous Version
```bash
git log --oneline
git revert [commit-hash]
git push
```

---

## Repository Settings

### Essential Settings
1. Go to repository → Settings
2. Set:
   - Default branch: `main`
   - Visibility: Public or Private
   - HTTPS enforcement: Enabled
   - Delete branches: Auto-delete

---

## For Teams (Optional)

### Add Collaborators
1. Settings → Collaborators
2. Add team members
3. Set permissions (Admin, Write, Read)

### Code Review (Optional)
1. Settings → Branches
2. Require pull request reviews
3. Team reviews code before merge

---

## Continuous Integration (CI) Optional

### Enable GitHub Actions
1. Create `.github/workflows/deploy.yml`
2. Set up tests to run on push
3. Only deploy if tests pass
4. Add status badges to README

---

## Summary

✅ Initialize local git repository
✅ Push code to GitHub
✅ Connect GitHub to Vercel (frontend)
✅ Connect GitHub to Render (backend)
✅ Enable auto-deploy webhooks
✅ Make changes → commit → push → auto-deploy
✅ Your app updates live automatically!

---

**GitHub is now your deployment pipeline!** 🚀

Every push = automatic deployment to production.
