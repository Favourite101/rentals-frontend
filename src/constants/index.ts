/// <reference types="vite/client" />

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rentals-backend-h8jj.onrender.com/api/v1';
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  EQUIPMENT: '/browse',
  EQUIPMENT_DETAIL: '/browse/:slug',
  EQUIPMENT_BOOK: '/browse/:slug/book',
  DASHBOARD: '/dashboard',
  MY_LISTINGS: '/my-listings',
  LENDING_REQUESTS: '/lending-requests',
  MY_REFUNDS: '/my-refunds',
  MY_WISHLIST: '/wishlist',
  PROFILE: '/profile',
  BOOKING_PAYMENT: '/booking/:id/payment',
  BOOKING_SUCCESS: '/booking/:id/success',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_LISTINGS: '/admin/listings',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_REFUNDS: '/admin/refunds',
  ADMIN_LISTING_APPROVAL: '/admin/listing-approval',
  ADMIN_NON_RETURN_REPORTS: '/admin/non-return-reports',
  ADMIN_PAYOUTS: '/admin/payouts',
  TERMS: '/terms',
  PRIVACY: '/privacy',
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
  MY_LISTINGS: 'my-listings',
  LENDING_REQUESTS: 'lending-requests',
  ALL_BOOKINGS: 'all-bookings',
  MY_REFUNDS: 'my-refunds',
  ALL_REFUNDS: 'all-refunds',
  PENDING_REFUNDS: 'pending-refunds',
  REFUND: 'refund',
  ADMIN_USERS: 'admin-users',
  ADMIN_STATS: 'admin-stats',
  ADMIN_LISTINGS: 'admin-listings',
  NOTIFICATIONS: 'notifications',
  NOTIFICATIONS_UNREAD: 'notifications-unread',
  WISHLIST: 'wishlist',
  WISHLIST_IDS: 'wishlist-ids',
  NON_RETURN_REPORTS: 'non-return-reports',
  PAYOUTS: 'payouts',
} as const;

export const BOOKING_STATUS_LABELS = {
  requested: 'Awaiting Approval',
  pending: 'Pending Payment',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
  expired: 'Expired',
  failed: 'Payment Failed',
} as const;

export const BOOKING_STATUS_COLORS = {
  requested: 'bg-blue-100 text-blue-800 border-blue-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-teal-100 text-teal-800 border-teal-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  declined: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
} as const;

export const EQUIPMENT_STATUS_LABELS = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
} as const;

export const EQUIPMENT_STATUS_COLORS = {
  pending_review: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
} as const;

export const REFUND_STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  processed: 'Refund Processed',
} as const;

export const REFUND_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  processed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
} as const;
