import type { User, Equipment, Booking, Category, PaginatedResponse, NonReturnReport, RefundRequest } from '@/types';

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  nin_verified: true,
  avatar_url: null,
  whatsapp_number: null,
  location: 'Lagos',
  bank_name: null,
  bank_code: null,
  account_number: null,
  account_name: null,
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const makeAdmin = (overrides: Partial<User> = {}): User =>
  makeUser({ id: 99, role: 'admin', username: 'admin', name: 'Admin User', ...overrides });

export const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: 'Audio',
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const makeEquipment = (overrides: Partial<Equipment> = {}): Equipment => ({
  id: 1,
  slug: 'sony-camera-1',
  name: 'Sony Camera',
  description: 'Professional camera for rent',
  category_id: 1,
  daily_rate: 50,
  item_value: 500,
  security_deposit: 100,
  image_url: null,
  images: [],
  is_available: true,
  owner_id: 2,
  condition: 'Excellent',
  location: 'Lagos',
  status: 'approved',
  requires_approval: false,
  min_notice_hours: null,
  pickup_location: null,
  created_at: '2025-01-01T00:00:00Z',
  category: makeCategory(),
  owner: { id: 2, name: 'Lender Name', username: 'lender', whatsapp_number: null, avatar_url: null },
  ...overrides,
});

export const makeBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 1,
  borrower_id: 1,
  lender_id: 2,
  equipment_id: 1,
  start_date: '2025-06-10T00:00:00Z',
  end_date: '2025-06-12T00:00:00Z',
  total_price: 150,
  rental_fee: 150,
  platform_fee: 15,
  lender_payout_amount: 135,
  total_charged: 250,
  security_deposit_amount: 100,
  security_deposit_status: 'held',
  security_deposit_release_at: null,
  status: 'confirmed',
  payment_reference: 'ref_abc123',
  payout_status: null,
  payout_reference: null,
  created_at: '2025-06-01T00:00:00Z',
  updated_at: '2025-06-01T00:00:00Z',
  equipment: makeEquipment(),
  borrower: makeUser(),
  lender: makeUser({ id: 2, name: 'Lender Name', username: 'lender' }),
  ...overrides,
});

export const makeNonReturnReport = (overrides: Partial<NonReturnReport> = {}): NonReturnReport => ({
  id: 1,
  booking_id: 1,
  lender_id: 2,
  notes: 'Borrower has not returned the equipment',
  status: 'open',
  created_at: '2025-06-15T00:00:00Z',
  ...overrides,
});

export const makePaginated = <T>(items: T[], total?: number): PaginatedResponse<T> => ({
  items,
  total: total ?? items.length,
  skip: 0,
  limit: 50,
});

export const makeRefundRequest = (overrides: Partial<RefundRequest> = {}): RefundRequest => ({
  id: 1,
  booking_id: 1,
  user_id: 1,
  reason: 'Equipment was not as described',
  amount: 150,
  status: 'pending',
  resolution_notes: null,
  paystack_transfer_id: null,
  created_at: '2025-06-01T00:00:00Z',
  updated_at: '2025-06-01T00:00:00Z',
  processed_at: null,
  booking: makeBooking(),
  user: makeUser(),
  ...overrides,
});
