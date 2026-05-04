#!/bin/bash
# Deploy script for production
# Usage: ./deploy.sh

set -e

echo "🚀 Starting GigFlow Deployment..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

echo "📦 Committing changes..."
git add .
git commit -m "Production deployment - $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment scripts triggered!"
echo ""
echo "Next steps:"
echo "1. Wait for Vercel to auto-deploy frontend"
echo "2. Wait for Render to auto-deploy backend"
echo "3. Check deployment status:"
echo "   - Vercel: https://vercel.com/dashboard"
echo "   - Render: https://dashboard.render.com"
echo ""
echo "🎉 Your app will be live shortly!"
