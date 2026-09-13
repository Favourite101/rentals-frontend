import { api } from './axios';
import type { PaginatedResponse, WaitlistEntry, WaitlistInterest, WaitlistJoinResponse, WaitlistSignup } from '@/types';

export const waitlistApi = {
  join: async (data: WaitlistSignup): Promise<WaitlistJoinResponse> => {
    const res = await api.post<WaitlistJoinResponse>('/waitlist/', data);
    return res.data;
  },

  getCount: async (): Promise<number> => {
    const res = await api.get<{ count: number }>('/waitlist/count');
    return res.data.count;
  },

  // Admin
  getEntries: async (
    skip = 0,
    limit = 50,
    search?: string,
    interest?: WaitlistInterest,
  ): Promise<PaginatedResponse<WaitlistEntry>> => {
    const res = await api.get<PaginatedResponse<WaitlistEntry>>('/waitlist/entries', {
      params: { skip, limit, search: search || undefined, interest: interest || undefined },
    });
    return res.data;
  },

  removeEntry: async (id: number): Promise<void> => {
    await api.delete(`/waitlist/entries/${id}`);
  },
};
