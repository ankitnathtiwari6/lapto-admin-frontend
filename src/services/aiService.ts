import api from '../lib/api';
import type { ApiResponse } from '../types';

export interface AIGeneratedOrder {
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  device: {
    deviceTypeId: string;
    deviceTypeName: string;
    brand: string;
    model: string;
    serialNumber: string;
  };
  problemDescription: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  services: Array<{
    serviceTypeId: string;
    serviceTypeName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    estimatedCost: number;
    isCustom?: boolean;
  }>;
}

export const aiService = {
  generateOrder: async (jobDetails: string): Promise<ApiResponse<AIGeneratedOrder>> => {
    const { data } = await api.post('/ai/generate-order', { jobDetails });
    return data;
  },
};

export default aiService;
