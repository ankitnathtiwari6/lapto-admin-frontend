import api from '../lib/api';
import type { ServiceType, ApiResponse } from '../types';

export const serviceTypeService = {
  getAll: async (params?: { isActive?: boolean }): Promise<ApiResponse<ServiceType[]>> => {
    const { data } = await api.get('/service-types', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<ServiceType>> => {
    const { data } = await api.get(`/service-types/${id}`);
    return data;
  },

  create: async (serviceTypeData: Partial<ServiceType>): Promise<ApiResponse<ServiceType>> => {
    const { data } = await api.post('/service-types', serviceTypeData);
    return data;
  },

  update: async (id: string, serviceTypeData: Partial<ServiceType>): Promise<ApiResponse<ServiceType>> => {
    const { data } = await api.put(`/service-types/${id}`, serviceTypeData);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/service-types/${id}`);
    return data;
  },

  seed: async (): Promise<ApiResponse<ServiceType[]>> => {
    const { data } = await api.post('/service-types/seed');
    return data;
  },

  search: async (query: string): Promise<ApiResponse<ServiceType[]>> => {
    const { data } = await api.get('/service-types/search', { params: { query } });
    return data;
  },
};

export default serviceTypeService;
