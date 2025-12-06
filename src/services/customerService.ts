import api from '../lib/api';
import type { ApiResponse } from '../types';

export interface Customer {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  customerDetails: {
    address?: string;
    alternatePhone?: string;
    totalOrders: number;
    totalSpent: number;
    lastVisit?: Date;
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export const customerService = {
  search: async (query: string): Promise<ApiResponse<Customer[]>> => {
    const { data } = await api.get('/customers/search', { params: { query } });
    return data;
  },

  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<Customer[]>> => {
    const { data } = await api.get('/customers', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Customer>> => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  create: async (customerData: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    const { data } = await api.post('/customers', customerData);
    return data;
  },

  update: async (id: string, customerData: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    const { data } = await api.put(`/customers/${id}`, customerData);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/customers/${id}`);
    return data;
  },
};

export default customerService;
