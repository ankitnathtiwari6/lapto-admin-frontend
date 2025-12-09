import api from '../lib/api';

export interface OutcomeType {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutcomeTypeData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export const outcomeTypeService = {
  getAll: (params?: { isActive?: boolean }) => {
    return api.get('/outcome-types', { params });
  },

  getById: (id: string) => {
    return api.get(`/outcome-types/${id}`);
  },

  create: (data: CreateOutcomeTypeData) => {
    return api.post('/outcome-types', data);
  },

  update: (id: string, data: Partial<CreateOutcomeTypeData>) => {
    return api.put(`/outcome-types/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/outcome-types/${id}`);
  },
};

export default outcomeTypeService;
