import api from '../lib/api';

export interface TaskType {
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

export interface CreateTaskTypeData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export const taskTypeService = {
  getAll: (params?: { isActive?: boolean }) => {
    return api.get('/task-types', { params });
  },

  getById: (id: string) => {
    return api.get(`/task-types/${id}`);
  },

  create: (data: CreateTaskTypeData) => {
    return api.post('/task-types', data);
  },

  update: (id: string, data: Partial<CreateTaskTypeData>) => {
    return api.put(`/task-types/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/task-types/${id}`);
  },
};

export default taskTypeService;
