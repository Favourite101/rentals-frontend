# Handover & Developer Documentation

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
- See `PROJECT_SUMMARY.md` and `README.md` for a detailed breakdown.
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
- For support, see the contacts in `README.md` or project documentation.

---

**This document is intended for developers and maintainers. For user-facing help, see the in-app guidance and documentation.**
