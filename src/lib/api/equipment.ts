import { api } from './axios';
import {
  Equipment, Category, CreateEquipmentData, CreateCategoryData,
  UpdateCategoryData, ImageUploadResponse, EquipmentImage, PaginatedResponse,
} from '@/types';

export type EquipmentSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export const equipmentApi = {
  // Equipment endpoints
  getAll: async (sort?: EquipmentSort, location?: string, skip = 0, limit = 20): Promise<PaginatedResponse<Equipment>> => {
    const params: Record<string, string | number> = { skip, limit };
    if (sort) params.sort = sort;
    if (location) params.location = location;
    const response = await api.get<PaginatedResponse<Equipment>>('/equipment/', { params });
    return response.data;
  },

  getAvailable: async (sort?: EquipmentSort, location?: string): Promise<Equipment[]> => {
    const params: Record<string, string> = {};
    if (sort) params.sort = sort;
    if (location) params.location = location;
    const response = await api.get<Equipment[]>('/equipment/available', { params });
    return response.data;
  },

  search: async (query: string, sort?: EquipmentSort, location?: string, skip = 0, limit = 20): Promise<PaginatedResponse<Equipment>> => {
    const params: Record<string, string | number> = { name: query, skip, limit };
    if (sort) params.sort = sort;
    if (location) params.location = location;
    const response = await api.get<PaginatedResponse<Equipment>>('/equipment/search', { params });
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

  getMyListings: async (): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>('/equipment/my-listings');
    return response.data;
  },

  getUserListings: async (userId: number): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>(`/equipment/user/${userId}`);
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

  updateCategory: async (id: number, data: UpdateCategoryData): Promise<Category> => {
    const response = await api.put<Category>(`/equipment/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/equipment/categories/${id}`);
  },

  // Image upload
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

  addImage: async (equipmentId: number, file: File): Promise<EquipmentImage> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<EquipmentImage>(`/equipment/${equipmentId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteImage: async (equipmentId: number, imageId: number): Promise<void> => {
    await api.delete(`/equipment/${equipmentId}/images/${imageId}`);
  },
};
