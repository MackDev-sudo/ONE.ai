# Vercel Deployment Guide

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to the GitHub repository: https://github.com/MackDev-sudo/ONE.ai.git
2. **Vercel Account**: Sign up at https://vercel.com (you can use your GitHub account)
3. **Environment Variables**: You'll need to set up the following environment variables in Vercel

## Required Environment Variables

Copy these from your `.env.local` file and add them to your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in with your GitHub account
2. Click "New Project"
3. Import your GitHub repository: `MackDev-sudo/ONE.ai`
4. Vercel will automatically detect it's a Next.js project
5. In the "Environment Variables" section, add all the required variables listed above
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. In your project directory, run:
   ```bash
   vercel
   ```

4. Follow the prompts to link to your GitHub repository
5. Add environment variables via the Vercel dashboard

## Post-Deployment Configuration

### Supabase Setup
1. In your Supabase project, go to Authentication > URL Configuration
2. Add your Vercel domain to the "Site URL" and "Redirect URLs"
3. Format: `https://your-app-name.vercel.app`

### Google OAuth Setup
1. Go to Google Cloud Console
2. Update your OAuth redirect URIs to include your Vercel domain
3. Add: `https://your-app-name.vercel.app/auth/callback`

## Troubleshooting

### Build Errors
- Check the build logs in Vercel dashboard
- Ensure all dependencies are listed in package.json
- Verify TypeScript errors are ignored in next.config.mjs

### Runtime Errors
- Check the function logs in Vercel dashboard
- Verify all environment variables are set correctly
- Ensure API routes have proper error handling

### Performance Optimization
- The app is configured with a 60-second timeout for AI responses
- Images are set to unoptimized for faster builds
- ESLint and TypeScript errors are ignored during builds

## Domain Configuration

After deployment, you can:
1. Use the default Vercel domain: `your-app-name.vercel.app`
2. Add a custom domain in the Vercel dashboard under Project Settings > Domains

## Monitoring

- View deployment logs in the Vercel dashboard
- Monitor function performance and errors
- Set up analytics if needed

Your app will be available at: `https://your-app-name.vercel.app`
