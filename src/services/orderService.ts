import api from '../lib/api';
import type { ServiceOrder, ApiResponse } from '../types';

export interface CreateOrderData {
  orderType?: 'service' | 'product';
  customer: {
    customerId?: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  // Service order fields (optional)
  device?: {
    deviceTypeId: string;
    deviceTypeName: string;
    brand: string;
    model: string;
    attributes?: Record<string, any>;
    serialNumber?: string;
    password?: string;
  };
  problemDescription?: string;
  customerComplaints?: string[];
  services?: Array<{
    serviceTypeId: string;
    serviceTypeName: string;
    estimatedCost: number;
  }>;
  engineerId?: string;
  // Product order fields (optional)
  products?: Array<{
    productId: string;
    productName: string;
    sku?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
  }>;
  // Common fields
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  discount?: number;
  taxRate?: number;
  paidAmount?: number;
  estimatedCost?: number;
  advancePayment?: number;
}

export const orderService = {
  getAll: async (params?: {
    stageId?: string;
    technicianId?: string;
    deviceTypeId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<ServiceOrder[]>> => {
    const { data } = await api.get('/orders', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<ServiceOrder>> => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  create: async (orderData: CreateOrderData): Promise<ApiResponse<ServiceOrder>> => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  update: async (id: string, orderData: Partial<CreateOrderData>): Promise<ApiResponse<ServiceOrder>> => {
    const { data } = await api.put(`/orders/${id}`, orderData);
    return data;
  },

  updateStage: async (id: string, stageId: string, notes?: string): Promise<ApiResponse<ServiceOrder>> => {
    const { data } = await api.put(`/orders/${id}/stage`, { stageId, notes });
    return data;
  },

  assignTechnician: async (id: string, technicianId: string, notes?: string): Promise<ApiResponse<ServiceOrder>> => {
    const { data } = await api.put(`/orders/${id}/assign`, { technicianId, notes });
    return data;
  },

  addNote: async (id: string, note: string, type: 'internal' | 'customer' = 'internal'): Promise<ApiResponse<ServiceOrder>> => {
    const { data } = await api.post(`/orders/${id}/notes`, { note, type });
    return data;
  },

  checkStatusByPhone: async (phone: string): Promise<ApiResponse<ServiceOrder[]>> => {
    const { data } = await api.get(`/orders/status/${phone}`);
    return data;
  },
};

export default orderService;
