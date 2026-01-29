export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'renter';
  created_at: string;
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
  created_at: string;
  category: Category;
}

export interface Booking {
  id: number;
  user_id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
  equipment: Equipment;
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
  status: RefundStatus;
  admin_notes: string | null;
  refund_amount: number;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  booking: Booking;
  user?: User;
}

export interface CreateRefundRequestData {
  booking_id: number;
  reason: string;
}

export interface ProcessRefundData {
  approved: boolean;
  admin_notes?: string;
}

// Image Upload
export interface ImageUploadResponse {
  url: string;
  public_id: string;
}
