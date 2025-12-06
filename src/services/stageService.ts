import api from '../lib/api';
import type { Stage, ApiResponse } from '../types';

export const stageService = {
  getAll: async (): Promise<ApiResponse<Stage[]>> => {
    const { data } = await api.get('/stages');
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Stage>> => {
    const { data } = await api.get(`/stages/${id}`);
    return data;
  },

  create: async (stageData: Partial<Stage>): Promise<ApiResponse<Stage>> => {
    const { data } = await api.post('/stages', stageData);
    return data;
  },

  update: async (id: string, stageData: Partial<Stage>): Promise<ApiResponse<Stage>> => {
    const { data } = await api.put(`/stages/${id}`, stageData);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/stages/${id}`);
    return data;
  },

  seed: async (): Promise<ApiResponse<Stage[]>> => {
    const { data } = await api.post('/stages/seed');
    return data;
  },
};

export default stageService;
