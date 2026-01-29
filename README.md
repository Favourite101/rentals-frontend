# ChurchRent - Equipment Rental System

A modern, production-ready React application for managing church equipment rentals with an intuitive interface, real-time availability, and secure payment processing via Stripe.

## Features

### User Features
- 🔐 **Authentication**: Secure login and registration
- 🔍 **Equipment Browse**: Search, filter, and view available equipment
- 📅 **Easy Booking**: Select dates and book equipment instantly
- 💳 **Secure Payments**: Stripe integration for safe transactions
- 📊 **Dashboard**: View and manage your bookings
- 👤 **Profile Management**: Update your account information

### Admin Features
- 🛠️ **Equipment Management**: Create, edit, and delete equipment
- 📂 **Category Management**: Organize equipment into categories
- 📋 **Booking Management**: View and update booking statuses
- 📈 **Analytics Dashboard**: Track bookings and revenue

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **UI Components**: Custom components with shadcn/ui patterns
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Payment**: Stripe React SDK
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see backend documentation)
- Stripe account for payment processing

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd church-equipment-rental
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://rentals-backend-h8jj.onrender.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

### 4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout components
│   ├── ui/              # Reusable UI components (Button, Card, Input, etc.)
│   ├── equipment/       # Equipment-specific components
│   ├── booking/         # Booking-related components
│   ├── auth/            # Authentication components
│   └── common/          # Common/shared components
├── pages/
│   ├── Home.tsx         # Landing page
│   ├── Login.tsx        # Login page
│   ├── Register.tsx     # Registration page
│   ├── EquipmentCatalog.tsx  # Equipment listing
│   ├── EquipmentDetail.tsx   # Equipment details
│   ├── BookingPage.tsx       # Create booking
│   ├── PaymentPage.tsx       # Payment processing
│   ├── Dashboard.tsx         # User dashboard
│   ├── Profile.tsx           # User profile
│   └── admin/           # Admin pages
│       ├── AdminDashboard.tsx
│       ├── EquipmentManagement.tsx
│       ├── CategoryManagement.tsx
│       └── BookingManagement.tsx
├── lib/
│   ├── api/             # API client functions
│   │   ├── axios.ts     # Axios configuration
│   │   ├── auth.ts      # Authentication API
│   │   ├── equipment.ts # Equipment API
│   │   └── bookings.ts  # Bookings API
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts   # Authentication hook
│   │   └── useToast.ts  # Toast notifications hook
│   └── utils/           # Utility functions
│       ├── formatters.ts  # Date/currency formatters
│       ├── validators.ts  # Form validation schemas
│       └── helpers.ts     # Helper functions
├── types/               # TypeScript type definitions
├── constants/           # App constants
├── styles/              # Global styles
└── App.tsx             # Main app component
```

## Key Features Implementation

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Automatic token refresh on API calls
- Protected routes for authenticated users
- Admin-only routes

### Equipment Management
- Real-time search and filtering
- Category-based organization
- Availability status tracking
- Image upload support
- Detailed equipment views

### Booking System
- Date range selection
- Price calculation based on days
- Booking status tracking (pending, confirmed, cancelled)
- Conflict prevention
- Payment integration

### Payment Processing
- Stripe Payment Element integration
- Secure payment handling
- Payment confirmation
- Receipt generation
- Payment status tracking

### Responsive Design
- Mobile-first approach
- Responsive navigation
- Adaptive layouts
- Touch-friendly interfaces
- Cross-browser compatibility

## API Integration

The application integrates with a FastAPI backend. All API endpoints are configured in the `src/lib/api` directory.

### Base URL
Configure in `.env`:
```
VITE_API_BASE_URL=https://rentals-backend-h8jj.onrender.com/api/v1
```

### Authentication
- Token included in `Authorization: Bearer {token}` header
- Automatic logout on 401 responses
- Token persisted in localStorage

## Styling Guide

### Color Scheme
- **Primary**: Deep blue (#1e40af) - Trust and spirituality
- **Secondary**: Warm gold (#f59e0b) - Warmth and community
- **Accent**: Soft green (#10b981) - Success states
- **Background**: Light gray (#f9fafb) with white cards

### Typography
- **Font**: Outfit (Google Fonts)
- **Headings**: Bold, larger sizes
- **Body**: Regular weight, readable sizes

### Design Principles
- Clean and modern aesthetic
- Generous whitespace
- Clear visual hierarchy
- Smooth animations and transitions
- Accessible color contrasts

## Deployment

### Build for Production
```bash
npm run build
```

The build output will be in the `dist` directory.

### Deploy to Hosting Service
The application can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables
Ensure all environment variables are configured in your deployment platform:
- `VITE_API_BASE_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Screen reader compatible
- WCAG 2.1 AA compliant color contrasts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, contact:
- Email: support@churchrent.com
- Phone: +44 20 1234 5678

## Acknowledgments

- Design inspiration from modern SaaS applications
- UI components based on shadcn/ui patterns
- Icons from Lucide React

---


---

# Handover & Developer Guide

## Project Overview
ChurchRent is a modern React + TypeScript application for managing church equipment rentals. It features user and admin flows, Stripe payments, a robust booking system, and a clean, accessible UI. The codebase is production-ready, fully documented, and follows best practices for maintainability and extensibility.

---

## 1. Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Access to the backend API (see backend docs)
- Stripe account for payment processing

### Setup Steps
1. **Clone the repository**
	```bash
	git clone <repository-url>
	cd rentals-frontend
	```
2. **Install dependencies**
	```bash
	npm install
	```
3. **Configure environment variables**
	- Copy `.env.example` to `.env` and fill in:
	  - `VITE_API_BASE_URL`
	  - `VITE_STRIPE_PUBLISHABLE_KEY`
4. **Start the development server**
	```bash
	npm run dev
	```
	The app runs at http://localhost:5173

---

## 2. Project Structure
- See `PROJECT_SUMMARY.md` and above for a detailed breakdown.
- Key folders:
  - `src/components/` – UI, layout, and feature components
  - `src/pages/` – Page-level components (user/admin)
  - `src/lib/api/` – API client logic (auth, equipment, bookings)
  - `src/types/` – TypeScript types/interfaces
  - `src/constants/` – App-wide constants (routes, query keys, status labels)
  - `src/styles/` – Global and Tailwind styles

---

## 3. Key Flows & Features

### Authentication
- JWT-based, stored in localStorage
- React context for auth state
- Protected routes via `ProtectedRoute`
- Admin role checks for admin pages

### Equipment Management
- CRUD for equipment and categories (admin)
- Image upload support (admin)
- Real-time search/filter for users

### Booking & Payment
- Date-based booking with conflict prevention
- Stripe Payment Element integration
- Refund request and management system
- Booking and refund status tracking

### Password Reset
- User can request password reset (email link)
- Reset form for new password

### Admin Panel
- Dashboard with stats
- Equipment, category, booking, and refund management
- User management (if enabled in backend)

---

## 4. Adding/Modifying Features
- **Add a page:** Create in `src/pages/`, add to `src/routes.tsx`, update navigation if needed.
- **Add a component:** Place in the relevant `src/components/` subfolder, export if needed.
- **API changes:** Update or add methods in `src/lib/api/`, update types in `src/types/`.
- **Styling:** Use Tailwind classes, update `globals.css` or `tailwind.config.js` for global changes.

---

## 5. Environment Variables
- `.env.example` documents all required variables.
- Main variables:
  - `VITE_API_BASE_URL` – Backend API base URL
  - `VITE_STRIPE_PUBLISHABLE_KEY` – Stripe publishable key

---

## 6. Deployment
- Build with `npm run build` (output in `dist/`)
- Deploy to Vercel, Netlify, AWS S3, or any static host
- Ensure environment variables are set in your deployment platform

---

## 7. Testing & Maintenance
- Type safety enforced throughout (TypeScript)
- Lint with `npm run lint`
- Test flows manually (no automated tests included by default)
- Update dependencies regularly

---

## 8. Support & Handover Notes
- All business logic is in the frontend; backend API must be available and documented
- Stripe test keys are used by default; switch to live keys for production
- For new developers: read `README.md`, `PROJECT_SUMMARY.md`, and code comments
- For questions, check code comments, API docs, or contact the last maintainer

---

## 9. Useful References
- `README.md` – Full user and developer documentation
- `PROJECT_SUMMARY.md` – Feature and architecture overview
- `src/constants/index.ts` – All routes, query keys, and status labels
- `src/types/index.ts` – All TypeScript types/interfaces
- `src/lib/api/` – API integration logic

---

## 10. Contact
- For support, see the contacts above or in project documentation.

---

**This section is intended for developers and maintainers. For user-facing help, see the in-app guidance and documentation.**
