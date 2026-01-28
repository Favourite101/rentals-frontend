# Quick Start Guide - ChurchRent

Get up and running with the ChurchRent equipment rental system in minutes!

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git** ([Download](https://git-scm.com/))

## Installation Steps

### 1. Navigate to the Project Directory

```bash
cd church-equipment-rental
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Query
- Axios
- React Hook Form
- Zod
- Stripe React SDK
- And more...

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your values:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

**Important:** 
- Get your Stripe test key from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- Ensure your backend API is running at the specified URL

### 4. Start the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## First Time Setup

### Create an Admin User

You'll need to create an admin user through the backend API first:

```bash
# Using curl
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "username": "admin",
    "email": "admin@churchrent.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Or register through the app UI and manually update the role in the database.

### Add Sample Equipment

1. Login as admin
2. Navigate to Admin Dashboard
3. Go to Equipment Management
4. Click "Add Equipment"
5. Fill in the details

### Add Categories

1. Go to Category Management
2. Add categories like:
   - Sound Equipment
   - Projection
   - Lighting
   - Staging
   - Video Equipment

## Testing the Application

### Test as a Renter

1. **Register a new account**
   - Go to `/register`
   - Fill in your details
   - Submit

2. **Browse equipment**
   - Go to `/equipment`
   - Search and filter
   - View equipment details

3. **Make a booking**
   - Select equipment
   - Choose dates
   - Complete booking
   - Process payment (test mode)

### Test as an Admin

1. **Login as admin**
   - Use admin credentials

2. **Manage equipment**
   - Add new equipment
   - Edit existing
   - Toggle availability

3. **Manage bookings**
   - View all bookings
   - Update statuses
   - Track payments

## Common Issues and Solutions

### Port Already in Use

If port 5173 is already in use:

```bash
# Kill the process using the port
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

### Cannot Connect to Backend

Verify:
1. Backend is running
2. Backend URL in `.env` is correct
3. No CORS issues (backend should allow frontend origin)

### Stripe Not Working

1. Verify Stripe key in `.env`
2. Use test keys (starts with `pk_test_`)
3. Check Stripe dashboard for errors

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure Overview

```
church-equipment-rental/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities, hooks, API
│   ├── types/          # TypeScript types
│   ├── constants/      # Constants and config
│   ├── styles/         # Global styles
│   └── App.tsx         # Main app component
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── tsconfig.json       # TypeScript configuration
```

## Key Features

✅ User authentication (login/register)
✅ Equipment catalog with search and filters
✅ Date-based booking system
✅ Stripe payment integration
✅ User dashboard
✅ Admin panel for management
✅ Responsive design
✅ Real-time form validation
✅ Toast notifications
✅ Protected routes

## Next Steps

1. **Customize the design**
   - Edit colors in `tailwind.config.js`
   - Modify styles in `src/styles/globals.css`

2. **Add more features**
   - Email notifications
   - PDF receipts
   - Equipment reviews
   - Image uploads

3. **Deploy to production**
   - See `DEPLOYMENT.md` for detailed instructions
   - Set up production environment variables
   - Configure hosting platform

## Getting Help

- **Documentation**: See README.md for detailed documentation
- **Deployment**: See DEPLOYMENT.md for deployment guide
- **Issues**: Check the console for error messages
- **Backend**: Ensure backend API documentation is consulted

## Tips for Development

1. **Use Browser DevTools**: Press F12 to inspect network requests and console logs
2. **React DevTools**: Install the React Developer Tools browser extension
3. **Hot Reload**: Changes are automatically reflected (no manual refresh needed)
4. **API Errors**: Check Network tab in DevTools for failed requests

## Production Checklist

Before deploying to production:

- [ ] All features tested
- [ ] Forms validated
- [ ] Payment flow works end-to-end
- [ ] Responsive on mobile devices
- [ ] Environment variables configured
- [ ] Backend API accessible
- [ ] Stripe production keys set
- [ ] Error tracking configured
- [ ] Analytics set up (optional)

---

**Congratulations!** You're now ready to use ChurchRent! 🎉

For detailed information, consult:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Production deployment guide

Happy coding! 🚀
