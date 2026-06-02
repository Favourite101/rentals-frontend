import { api } from './axios';
import type { AuthResponse, LoginCredentials, RegisterData, User, ForgotPasswordData, ResetPasswordData, UpdateProfileData } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post<{ access_token: string; token_type: string }>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    // Store token temporarily to make authenticated request for user
    const token = response.data.access_token;
    
    // Fetch user data with the new token
    const userResponse = await api.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      access_token: token,
      token_type: response.data.token_type,
      user: userResponse.data,
    };
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    // First, register the user
    await api.post('/auth/register', data);
    
    // Then automatically log them in
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const loginResponse = await api.post<{ access_token: string; token_type: string }>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const token = loginResponse.data.access_token;
    
    // Fetch user data with the new token
    const userResponse = await api.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      access_token: token,
      token_type: loginResponse.data.token_type,
      user: userResponse.data,
    };
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch<User>('/auth/me', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<User>('/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  verifyNin: async (nin: string): Promise<User> => {
    const response = await api.post<User>('/auth/me/verify-nin', { nin });
    return response.data;
  },

  changePassword: async (data: { current_password: string; new_password: string }): Promise<void> => {
    await api.post('/auth/me/change-password', data);
  },

  deleteAccount: async (password: string): Promise<void> => {
    await api.delete('/auth/me', { data: { password } });
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  resolveAccount: async (accountNumber: string, bankCode: string): Promise<{ account_name: string }> => {
    const response = await api.get<{ account_name: string }>('/auth/me/resolve-account', {
      params: { account_number: accountNumber, bank_code: bankCode },
    });
    return response.data;
  },
};
