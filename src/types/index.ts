export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  whatsapp_number?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  email_verified?: boolean;
  nin_verified?: boolean;
  bank_name?: string | null;
  bank_code?: string | null;
  account_number?: string | null;
  account_name?: string | null;
  created_at: string;
}

export interface OwnerBrief {
  id: number;
  name: string;
  username: string;
  whatsapp_number?: string | null;
  avatar_url?: string | null;
  email_verified?: boolean;
  account_number?: string | null;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface EquipmentImage {
  id: number;
  url: string;
  display_order: number;
}

export type EquipmentStatus = 'pending_review' | 'approved' | 'rejected';

export interface Equipment {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category_id: number;
  daily_rate: number;
  item_value?: number | null;
  security_deposit?: number | null;
  image_url: string | null;
  images: EquipmentImage[];
  is_available: boolean;
  owner_id: number;
  condition: string | null;
  location: string | null;
  status: EquipmentStatus;
  requires_approval: boolean;
  min_notice_hours?: number | null;
  pickup_location?: string | null;
  created_at: string;
  category: Category;
  owner?: OwnerBrief;
}

export type BookingStatus =
  | 'requested'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'declined'
  | 'expired'
  | 'failed';

export interface Booking {
  id: number;
  borrower_id: number;
  lender_id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  rental_fee?: number | null;
  platform_fee?: number | null;
  lender_payout_amount?: number | null;
  total_charged?: number | null;
  security_deposit_amount: number;
  security_deposit_status: 'held' | 'refunded' | 'forfeited';
  security_deposit_release_at?: string | null;
  status: BookingStatus;
  payment_reference: string | null;
  payout_status?: string | null;
  payout_reference?: string | null;
  created_at: string;
  updated_at: string;
  equipment: Equipment;
  borrower?: User;
  lender?: User;
  user?: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
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

export interface PaystackPaymentInit {
  authorization_url: string;
  access_code: string;
  reference: string;
  amount_kobo: number;
}

export interface NonReturnReport {
  id: number;
  booking_id: number;
  lender_id: number;
  notes?: string | null;
  status: 'open' | 'reviewed';
  created_at: string;
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
  location?: string;
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
  item_value?: number;
  security_deposit?: number;
  image_url: string;
  is_available: boolean;
  condition?: string;
  location: string;
  requires_approval?: boolean;
  min_notice_hours?: number;
  pickup_location?: string;
}

export interface CreateBookingData {
  equipment_id: number;
  start_date: string;
  end_date: string;
}

export interface UpdateBookingStatusData {
  status: BookingStatus;
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  whatsapp_number?: string;
  location?: string;
  bank_name?: string;
  bank_code?: string;
  account_number?: string;
  account_name?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';

export interface RefundRequest {
  id: number;
  booking_id: number;
  user_id: number;
  reason: string;
  amount: number;
  status: RefundStatus;
  resolution_notes: string | null;
  paystack_transfer_id: string | null;
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

export interface ImageUploadResponse {
  url: string;
  public_id: string;
}

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

export interface WishlistItem {
  id: number;
  user_id: number;
  equipment_id: number;
  created_at: string;
  equipment: Equipment;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
