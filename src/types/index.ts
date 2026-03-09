export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface OwnerBrief {
  id: number;
  name: string;
  username: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Equipment {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category_id: number;
  daily_rate: number;
  image_url: string | null;
  is_available: boolean;
  owner_id: number;
  condition: string | null;
  location: string | null;
  created_at: string;
  category: Category;
  owner?: OwnerBrief;
}

export interface Booking {
  id: number;
  borrower_id: number;
  lender_id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
  equipment: Equipment;
  borrower?: User;
  lender?: User;
  // backward compat alias
  user?: User;
}

export interface UnavailableDateRange {
  start_date: string;
  end_date: string;
  reason: 'confirmed' | 'pending';
}

export interface EquipmentAvailability {
  equipment_id: number;
  unavailable_dates: UnavailableDateRange[];
}

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CreateEquipmentData {
  name: string;
  description: string;
  category_id: number;
  daily_rate: number;
  image_url: string;
  is_available: boolean;
  condition?: string;
  location?: string;
}

export interface CreateBookingData {
  equipment_id: number;
  start_date: string;
  end_date: string;
}

export interface UpdateBookingStatusData {
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

// Password Reset
export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

// Refund Types
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';

export interface RefundRequest {
  id: number;
  booking_id: number;
  user_id: number;
  reason: string;
  amount: number;
  status: RefundStatus;
  resolution_notes: string | null;
  stripe_refund_id: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  booking: Booking;
  user: User;
}

export interface CreateRefundRequestData {
  booking_id: number;
  reason: string;
}

export interface ProcessRefundData {
  approved: boolean;
  resolution_notes?: string;
}

// Image Upload
export interface ImageUploadResponse {
  url: string;
  public_id: string;
}

// Admin Types
export interface AdminUserUpdate {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
}

export interface PlatformStats {
  total_users: number;
  total_listings: number;
  total_bookings: number;
  active_bookings: number;
  total_revenue: number;
  pending_refunds: number;
}
