import { api } from './axios';
import type { User, Equipment, PlatformStats, AdminUserUpdate } from '@/types';

export const adminApi = {
    // User management
    getUsers: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/admin/users');
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
    getListings: async (): Promise<Equipment[]> => {
        const response = await api.get<Equipment[]>('/admin/listings');
        return response.data;
    },

    deleteListing: async (id: number): Promise<void> => {
        await api.delete(`/admin/listings/${id}`);
    },
};
