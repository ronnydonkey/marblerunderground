# GravityPlay Deployment Guide

## Prerequisites

Before deploying GravityPlay, ensure you have:

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Domain**: gravityplay.fun is configured and ready

## Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### 2. Run Database Migrations
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref YOUR_PROJECT_ID`
4. Run migrations: `supabase db push`
5. Seed database: `supabase db seed`

### 3. Configure Authentication
1. Go to Authentication > Settings in Supabase dashboard
2. Configure email templates and redirects
3. Set up OAuth providers if needed:
   - Google OAuth
   - GitHub OAuth
   - Others as required

### 4. Set up Storage
1. Go to Storage in Supabase dashboard
2. Create bucket named `piece-photos`
3. Set appropriate policies for public read access

## Vercel Deployment

### 1. Connect Repository
1. Go to Vercel dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. Environment Variables
Add these environment variables in Vercel dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://gravityplay.fun
NODE_ENV=production
```

### 3. Domain Configuration
1. Go to Project Settings > Domains in Vercel
2. Add your custom domain: `gravityplay.fun`
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Vercel)

### 4. Deploy
1. Push to main branch to trigger automatic deployment
2. Verify deployment at your domain
3. Test all functionality including authentication and database queries

## GitHub Secrets

For CI/CD, add these secrets to your GitHub repository:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

## Post-Deployment Checklist

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Authentication flow works (sign up, sign in, sign out)
- [ ] Catalog page displays pieces
- [ ] Admin dashboard accessible (create admin user first)
- [ ] File uploads work correctly
- [ ] Database queries return expected results

### Performance Tests
- [ ] Lighthouse score > 90 for all metrics
- [ ] Page load times < 2 seconds
- [ ] Images optimized and loading properly
- [ ] Mobile responsiveness confirmed

### Security Tests
- [ ] HTTPS working correctly
- [ ] Authentication required for protected routes
- [ ] RLS policies preventing unauthorized access
- [ ] No sensitive data exposed in client

## Monitoring and Maintenance

### Error Monitoring
- Set up error tracking with Vercel Analytics
- Monitor database performance in Supabase dashboard
- Set up uptime monitoring

### Regular Maintenance
- Monitor database growth and performance
- Review and rotate API keys quarterly
- Keep dependencies updated
- Regular database backups

## Troubleshooting

### Common Issues

**Build Failures**
- Check environment variables are set correctly
- Ensure all dependencies are installed
- Verify TypeScript compilation passes

**Database Connection Issues**
- Verify Supabase URL and keys
- Check RLS policies aren't too restrictive
- Ensure database is running and accessible

**Authentication Problems**
- Check auth redirect URLs are correct
- Verify email templates are configured
- Ensure OAuth apps are set up properly

**Performance Issues**
- Review database query performance
- Check image optimization settings
- Monitor bundle size and split if needed

For additional help, check the logs in Vercel dashboard and Supabase dashboard.