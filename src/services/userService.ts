import api from '../lib/api';
import type { User, ApiResponse } from '../types';

export const userService = {
  getEngineers: async (): Promise<ApiResponse<User[]>> => {
    const { data } = await api.get('/users/engineers');
    return data;
  },

  getAll: async (params?: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<User[]>> => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  update: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};

export default userService;
