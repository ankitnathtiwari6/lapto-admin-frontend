import api from '../lib/api';
import type { DeviceType, ApiResponse } from '../types';

export const deviceTypeService = {
  getAll: async (params?: { isActive?: boolean }): Promise<ApiResponse<DeviceType[]>> => {
    const { data } = await api.get('/device-types', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<DeviceType>> => {
    const { data } = await api.get(`/device-types/${id}`);
    return data;
  },

  create: async (deviceTypeData: Partial<DeviceType>): Promise<ApiResponse<DeviceType>> => {
    const { data } = await api.post('/device-types', deviceTypeData);
    return data;
  },

  update: async (id: string, deviceTypeData: Partial<DeviceType>): Promise<ApiResponse<DeviceType>> => {
    const { data } = await api.put(`/device-types/${id}`, deviceTypeData);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/device-types/${id}`);
    return data;
  },

  seed: async (): Promise<ApiResponse<DeviceType[]>> => {
    const { data } = await api.post('/device-types/seed');
    return data;
  },
};

export default deviceTypeService;
