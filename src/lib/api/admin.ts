import { api } from './axios';
import type { User, Equipment, PlatformStats, AdminUserUpdate, NonReturnReport, Booking, PaginatedResponse } from '@/types';

export const adminApi = {
    // User management
    getUsers: async (skip = 0, limit = 50): Promise<PaginatedResponse<User>> => {
        const response = await api.get<PaginatedResponse<User>>('/admin/users', { params: { skip, limit } });
        return response.data;
    },

    getUserById: async (id: number): Promise<User> => {
        const response = await api.get<User>(`/admin/users/${id}`);
        return response.data;
    },

    updateUser: async (id: number, data: AdminUserUpdate): Promise<User> => {
        const response = await api.patch<User>(`/admin/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    },

    // Platform stats
    getStats: async (): Promise<PlatformStats> => {
        const response = await api.get<PlatformStats>('/admin/stats');
        return response.data;
    },

    // Listing moderation
    getListings: async (skip = 0, limit = 50): Promise<PaginatedResponse<Equipment>> => {
        const response = await api.get<PaginatedResponse<Equipment>>('/admin/listings', { params: { skip, limit } });
        return response.data;
    },

    deleteListing: async (id: number): Promise<void> => {
        await api.delete(`/admin/listings/${id}`);
    },

    approveListing: async (id: number): Promise<Equipment> => {
        const response = await api.post<Equipment>(`/admin/listings/${id}/approve`);
        return response.data;
    },

    rejectListing: async (id: number, reason?: string): Promise<Equipment> => {
        const response = await api.post<Equipment>(`/admin/listings/${id}/reject`, { reason });
        return response.data;
    },

    // Non-return reports
    getNonReturnReports: async (skip = 0, limit = 50): Promise<NonReturnReport[]> => {
        const response = await api.get<NonReturnReport[]>('/admin/non-return-reports', { params: { skip, limit } });
        return response.data;
    },

    processNonReturnReport: async (id: number, forfeitDeposit: boolean): Promise<NonReturnReport> => {
        const response = await api.patch<NonReturnReport>(`/admin/non-return-reports/${id}`, { forfeit_deposit: forfeitDeposit });
        return response.data;
    },

    // Payouts
    getPayouts: async (skip = 0, limit = 50): Promise<PaginatedResponse<Booking>> => {
        const response = await api.get<PaginatedResponse<Booking>>('/admin/payouts', { params: { skip, limit } });
        return response.data;
    },
};
