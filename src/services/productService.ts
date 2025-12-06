import api from '../lib/api';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  category?: string;
  brand?: string;
  unitPrice: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  unit: string;
  taxRate: number;
  images?: string[];
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  brand?: string;
  unitPrice: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  unit?: string;
  taxRate?: number;
  images?: string[];
}

export const productService = {
  getAll: (params?: any) => api.get('/products', { params }),

  getById: (id: string) => api.get(`/products/${id}`),

  search: (query: string) => api.get('/products', { params: { search: query, limit: 20 } }),

  create: (data: CreateProductData) => api.post('/products', data),

  update: (id: string, data: Partial<CreateProductData>) => api.put(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),

  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract') =>
    api.put(`/products/${id}/stock`, { quantity, operation }),
};
