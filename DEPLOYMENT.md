# Comet A/B Testing App - Deployment Guide

This guide will help you deploy your Comet A/B Testing application on Vercel with Supabase as the database.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Account**: For connecting your repository

## Step 1: Set Up Supabase Database

### 1.1 Create a New Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a name like "comet-abtest" and select a region close to your users
3. Note down your project URL and anon key from the project settings

### 1.2 Set Up Database Schema
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `sql/schema.sql` into the editor
3. Run the SQL script to create all necessary tables and sample data

### 1.3 Verify Tables
Make sure these tables are created:
- `users` - stores user information
- `groups` - stores A/B test groups (control, variant)
- `clicks` - tracks user interactions

## Step 2: Deploy Backend to Vercel

### 2.1 Prepare Backend
The backend is already configured in `src/backend/` with:
- `vercel.json` - Vercel configuration
- `requirements.txt` - Python dependencies
- `main.py` - FastAPI application

### 2.2 Deploy Backend
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Set the **Root Directory** to `src/backend`
5. Vercel will automatically detect it's a Python project
6. Add these environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
7. Click "Deploy"

### 2.3 Note Backend URL
After deployment, note your backend URL (e.g., `https://your-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend
The frontend is in `src/nextjs-app/` and is already configured for Vercel.

### 3.2 Deploy Frontend
1. In Vercel, create another "New Project"
2. Import the same GitHub repository
3. Set the **Root Directory** to `src/nextjs-app`
4. Vercel will automatically detect it's a Next.js project
5. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend Vercel URL from Step 2
6. Click "Deploy"

## Step 4: Update CORS Configuration

After both deployments are complete, update the backend CORS settings:

1. Go to your backend Vercel project
2. In the project settings, add your frontend URL to the allowed origins
3. Or update the `main.py` file with your actual frontend URL

## Step 5: Test Your Deployment

### 5.1 Test Backend
Visit your backend URL + `/health` to ensure it's running:
```
https://your-backend.vercel.app/health
```

### 5.2 Test Frontend
Visit your frontend URL and:
1. Check if the A/B test landing page loads
2. Try clicking the sign-up button
3. Fill out the form and submit
4. Check your Supabase database to see if data is being recorded

### 5.3 Test A/B Test Assignment
1. Open the frontend in an incognito window
2. Refresh the page multiple times
3. You should see different A/B test groups assigned
4. Check the browser console for A/B test assignment logs

## Step 6: Monitor and Analyze

### 6.1 View Analytics
- Visit your backend URL + `/stats/all` to see overall statistics
- Visit your backend URL + `/stats/group/1` for control group stats
- Visit your backend URL + `/stats/group/2` for variant group stats

### 6.2 Database Queries
Use the SQL queries in `sql/abtest_queries.sql` to analyze your A/B test results in Supabase.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your frontend URL is added to the backend CORS configuration
2. **Database Connection**: Verify your Supabase credentials are correct
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Failures**: Check the Vercel build logs for specific error messages

### Environment Variables Checklist

**Backend (Vercel):**
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`

**Frontend (Vercel):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_BACKEND_URL`

## Next Steps

1. **Custom Domain**: Set up a custom domain in Vercel
2. **Analytics**: Integrate with Google Analytics or Mixpanel
3. **Link Tracking**: Set up Dub.co for advanced link tracking
4. **Monitoring**: Set up error monitoring with Sentry
5. **CI/CD**: Configure automatic deployments on git push

## Support

If you encounter any issues:
1. Check the Vercel deployment logs
2. Check the Supabase logs
3. Verify all environment variables are set correctly
4. Test locally first with `npm run dev-all`

