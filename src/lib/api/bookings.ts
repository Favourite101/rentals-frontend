import { api } from './axios';
import type { Booking, CreateBookingData, UpdateBookingStatusData, PaymentIntent, EquipmentAvailability } from '@/types';

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

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings/my-bookings');
    return response.data;
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings/all');
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

  cancel: async (id: number): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  },

  createPayment: async (bookingId: number): Promise<PaymentIntent> => {
    const response = await api.post<PaymentIntent>(`/bookings/${bookingId}/create-payment`);
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string, bookingId: number): Promise<{ success: boolean; booking: Booking }> => {
    const response = await api.post<{ success: boolean; booking: Booking }>(
      '/bookings/confirm-payment',
      { payment_intent_id: paymentIntentId, booking_id: bookingId }
    );
    return response.data;
  },
};
