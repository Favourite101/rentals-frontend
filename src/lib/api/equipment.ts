import { api } from './axios';
import { Equipment, Category, CreateEquipmentData, CreateCategoryData, ImageUploadResponse } from '@/types';

export const equipmentApi = {
  // Equipment endpoints
  getAll: async (): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>('/equipment/');
    return response.data;
  },

  getAvailable: async (): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>('/equipment/available');
    return response.data;
  },

  search: async (query: string): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>(`/equipment/search?name=${query}`);
    return response.data;
  },

  getByCategory: async (categoryId: number): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>(`/equipment/category/${categoryId}`);
    return response.data;
  },

  getById: async (id: number): Promise<Equipment> => {
    const response = await api.get<Equipment>(`/equipment/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Equipment> => {
    const response = await api.get<Equipment>(`/equipment/slug/${slug}`);
    return response.data;
  },

  create: async (data: CreateEquipmentData): Promise<Equipment> => {
    const response = await api.post<Equipment>('/equipment/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateEquipmentData>): Promise<Equipment> => {
    const response = await api.put<Equipment>(`/equipment/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },

  // Category endpoints
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/equipment/categories/all');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/equipment/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await api.post<Category>('/equipment/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: CreateCategoryData): Promise<Category> => {
    const response = await api.put<Category>(`/equipment/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/equipment/categories/${id}`);
  },

  // Image upload endpoints
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ImageUploadResponse>('/equipment/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadAndUpdateImage: async (equipmentId: number, file: File): Promise<Equipment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<Equipment>(`/equipment/${equipmentId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
