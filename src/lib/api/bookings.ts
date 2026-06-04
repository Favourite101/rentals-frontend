import { api } from './axios';
import type {
  Booking,
  CreateBookingData,
  UpdateBookingStatusData,
  PaystackPaymentInit,
  EquipmentAvailability,
  RefundRequest,
  CreateRefundRequestData,
  ProcessRefundData,
  PaginatedResponse,
  NonReturnReport,
} from '@/types';

export const bookingsApi = {
  create: async (data: CreateBookingData): Promise<Booking> => {
    const bookingData = {
      equipment_id: data.equipment_id,
      start_date: new Date(data.start_date).toISOString(),
      end_date: new Date(data.end_date).toISOString(),
    };
    const response = await api.post<Booking>('/bookings/', bookingData);
    return response.data;
  },

  getMyBookings: async (skip = 0, limit = 20): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/bookings/my-bookings', {
      params: { skip, limit },
    });
    return response.data;
  },

  getAllBookings: async (skip = 0, limit = 50): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/bookings/all', {
      params: { skip, limit },
    });
    return response.data;
  },

  getMyLendingRequests: async (skip = 0, limit = 20): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/bookings/my-lending-requests', {
      params: { skip, limit },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  getEquipmentAvailability: async (
    equipmentId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<EquipmentAvailability> => {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    const queryString = params.toString();
    const url = `/bookings/equipment/${equipmentId}/availability${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<EquipmentAvailability>(url);
    return response.data;
  },

  updateStatus: async (id: number, data: UpdateBookingStatusData): Promise<Booking> => {
    const response = await api.patch<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  cancel: async (id: number, reason?: string): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${id}/cancel`, { reason: reason ?? '' });
    return response.data;
  },

  approve: async (id: number): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${id}/approve`);
    return response.data;
  },

  decline: async (id: number): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${id}/decline`);
    return response.data;
  },

  reportNonReturn: async (id: number, notes?: string): Promise<NonReturnReport> => {
    const response = await api.post<NonReturnReport>(`/bookings/${id}/report-non-return`, { notes });
    return response.data;
  },

  createPayment: async (bookingId: number): Promise<PaystackPaymentInit> => {
    const response = await api.post<PaystackPaymentInit>(`/bookings/${bookingId}/create-payment`);
    return response.data;
  },

  confirmPayment: async (reference: string, bookingId: number): Promise<Booking> => {
    const response = await api.post<Booking>(
      '/bookings/confirm-payment',
      { reference, booking_id: bookingId }
    );
    return response.data;
  },

  // Refund endpoints
  requestRefund: async (data: CreateRefundRequestData): Promise<RefundRequest> => {
    const response = await api.post<RefundRequest>('/bookings/refund-request', data);
    return response.data;
  },

  getMyRefunds: async (): Promise<RefundRequest[]> => {
    const response = await api.get<RefundRequest[]>('/bookings/my-refunds');
    return response.data;
  },

  getRefundById: async (id: number): Promise<RefundRequest> => {
    const response = await api.get<RefundRequest>(`/bookings/refund/${id}`);
    return response.data;
  },

  // Admin refund endpoints
  getAllRefunds: async (): Promise<RefundRequest[]> => {
    const response = await api.get<RefundRequest[]>('/bookings/admin/refunds');
    return response.data;
  },

  getPendingRefunds: async (): Promise<RefundRequest[]> => {
    const response = await api.get<RefundRequest[]>('/bookings/admin/refunds/pending');
    return response.data;
  },

  processRefund: async (id: number, data: ProcessRefundData): Promise<RefundRequest> => {
    const response = await api.post<RefundRequest>(`/bookings/admin/refunds/${id}/process`, data);
    return response.data;
  },
};
