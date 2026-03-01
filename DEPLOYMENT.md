# Deployment Guide - Vercel

## Quick Start

### Step 1: Prepare Your Code

Make sure your project is ready:
- ✅ All code is saved
- ✅ `.env.local` exists (or you have your environment variables ready)
- ✅ No sensitive data committed (check `.gitignore`)

### Step 2: Push to GitHub

If you don't have git initialized:

1. **Install Git** (if not installed):
   - Download from [git-scm.com](https://git-scm.com/download/win)
   - Or install via GitHub Desktop

2. **Initialize Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Create GitHub Repository**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it (e.g., `acm-panel-configurator`)
   - Don't initialize with README (you already have one)
   - Click "Create repository"

4. **Push to GitHub**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 3: Deploy on Vercel

1. **Sign Up/Login**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account (recommended)

2. **Import Project**:
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   | Name | Value | Notes |
   |------|-------|-------|
   | `RESEND_API_KEY` | `re_...` | Get from [resend.com/api-keys](https://resend.com/api-keys) |
   | `BUSINESS_EMAIL` | `quotes@yourcompany.com` | Where quotes are sent |
   | `EMAIL_FROM` | `onboarding@resend.dev` | Or verified domain email |
   | `ADMIN_PASSWORD` | `your-password` | Optional, for admin page |

5. **Deploy**:
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your site is live! 🎉

### Step 4: Get Your Live URL

After deployment, you'll get:
- **Production URL**: `your-project.vercel.app`
- **Preview URLs**: For each commit/pull request

Share this URL with anyone!

## Updating Your Site

Every time you push to GitHub:
1. Vercel automatically redeploys
2. Your changes go live in ~1-2 minutes
3. You get a preview URL for each commit

## Custom Domain (Optional)

1. In Vercel dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `allcladding.com`)
3. Follow DNS setup instructions
4. SSL certificate is automatic

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build` locally

### Environment Variables Not Working
- Make sure they're added in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Email Not Sending
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for API usage/limits
- Ensure `EMAIL_FROM` is verified in Resend

### Images Not Loading
- Ensure images are in `public/` folder
- Check file paths are correct
- Rebuild after adding new images

## Need Help?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
