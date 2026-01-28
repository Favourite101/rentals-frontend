# Deployment Guide - ChurchRent

This guide covers deploying the ChurchRent frontend application to various hosting platforms.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Backend API is deployed and accessible
- [ ] Stripe keys are set up (use test keys for staging)
- [ ] Build process completes successfully
- [ ] Application tested locally

## Environment Variables

Required environment variables:
```
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to your project settings in Vercel dashboard
   - Add environment variables under "Environment Variables"
   - Redeploy

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_API_BASE_URL "https://your-api.com/api/v1"
   netlify env:set VITE_STRIPE_PUBLISHABLE_KEY "pk_live_..."
   ```

### Option 3: AWS S3 + CloudFront

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://churchrent-frontend
   ```

3. **Configure for Static Website Hosting**
   ```bash
   aws s3 website s3://churchrent-frontend \
     --index-document index.html \
     --error-document index.html
   ```

4. **Upload Build Files**
   ```bash
   aws s3 sync dist/ s3://churchrent-frontend --delete
   ```

5. **Set Up CloudFront Distribution**
   - Create CloudFront distribution
   - Point origin to S3 bucket
   - Configure custom error responses for SPA routing
   - Set up SSL certificate

### Option 4: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/churchrent"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## Production Build

To create a production build locally:

```bash
npm run build
```

The optimized files will be in the `dist` directory.

### Build Optimization Tips

1. **Code Splitting**: Already configured via Vite
2. **Tree Shaking**: Automatic with Vite
3. **Minification**: Enabled in production mode
4. **Image Optimization**: Consider using CDN for images

## Performance Optimization

### 1. Enable Compression
Configure your hosting to serve files with gzip/brotli compression.

### 2. Set Cache Headers
```
# Example Netlify _headers file
/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: no-cache
```

### 3. Use CDN
Point your domain to a CDN for faster global delivery.

### 4. Lazy Loading
Images and routes are already lazy-loaded in the code.

## Monitoring and Analytics

### Google Analytics
Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry for Error Tracking
1. Install Sentry:
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. Initialize in `main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     environment: import.meta.env.MODE,
   });
   ```

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}
        
    - name: Deploy to Vercel
      run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env` files
3. **API Keys**: Use separate keys for dev/staging/production
4. **Content Security Policy**: Configure CSP headers
5. **CORS**: Ensure API allows requests from frontend domain

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`

### 404 Errors on Refresh
- Configure hosting to redirect all routes to index.html
- For Netlify, create `_redirects` file: `/* /index.html 200`
- For Vercel, this is automatic

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Restart dev server after changing `.env`
- In production, set variables in hosting platform settings

## Post-Deployment

1. **Test all features**
   - Authentication
   - Equipment browsing
   - Booking creation
   - Payment processing

2. **Check performance**
   - Use Lighthouse in Chrome DevTools
   - Aim for scores > 90

3. **Monitor errors**
   - Set up error tracking
   - Monitor console for warnings

4. **Set up backups**
   - Backend database backups
   - Consider versioning for deployments

## Rollback Strategy

If issues arise after deployment:

1. **Vercel/Netlify**: Use dashboard to revert to previous deployment
2. **AWS**: Deploy previous build from S3 version
3. **Keep previous builds**: Don't delete old build artifacts immediately

## Support

For deployment issues:
- Frontend: Check browser console and network tab
- Backend: Check API logs
- Payment: Check Stripe dashboard

---

**Remember**: Always test deployments in a staging environment before production!
