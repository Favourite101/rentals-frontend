import { api } from './axios';
import { WishlistItem } from '@/types';

export const wishlistApi = {
  getIds: async (): Promise<number[]> => {
    const res = await api.get<number[]>('/wishlist/ids');
    return res.data;
  },

  getAll: async (): Promise<WishlistItem[]> => {
    const res = await api.get<WishlistItem[]>('/wishlist/');
    return res.data;
  },

  add: async (equipmentId: number): Promise<void> => {
    await api.post(`/wishlist/${equipmentId}`);
  },

  remove: async (equipmentId: number): Promise<void> => {
    await api.delete(`/wishlist/${equipmentId}`);
  },
};
