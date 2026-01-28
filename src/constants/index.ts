/// <reference types="vite/client" />

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rentals-backend-h8jj.onrender.com/api/v1';
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EQUIPMENT: '/equipment',
  EQUIPMENT_DETAIL: '/equipment/:slug',
  EQUIPMENT_BOOK: '/equipment/:slug/book',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  BOOKING_PAYMENT: '/booking/:id/payment',
  BOOKING_SUCCESS: '/booking/:id/success',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_EQUIPMENT: '/admin/equipment',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_BOOKINGS: '/admin/bookings',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const;

export const QUERY_KEYS = {
  USER: 'user',
  EQUIPMENT: 'equipment',
  EQUIPMENT_LIST: 'equipment-list',
  EQUIPMENT_AVAILABLE: 'equipment-available',
  CATEGORIES: 'categories',
  BOOKINGS: 'bookings',
  MY_BOOKINGS: 'my-bookings',
  ALL_BOOKINGS: 'all-bookings',
} as const;

export const BOOKING_STATUS_LABELS = {
  pending: 'Pending Payment',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  expired: 'Expired',
} as const;

export const BOOKING_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
} as const;
