import api from '../lib/api';

export interface SubTask {
  _id: string;
  orderId: string;
  orderNumber: string;
  parentTaskId?: string;
  taskLevel: number;
  title: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  assignedTo: string;
  assignedToName: string;
  assignedAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked' | 'on_hold';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  amount?: number;
  isPaid: boolean;
  partsUsed?: Array<{
    partName: string;
    quantity: number;
    cost: number;
    addedAt: Date;
  }>;
  updates: Array<{
    note: string;
    addedBy: string;
    addedByName: string;
    timestamp: Date;
    type: 'comment' | 'status_change' | 'assignment' | 'completion' | 'progress_update';
    oldValue?: string;
    newValue?: string;
  }>;
  dependencies?: string[];
  blockedBy?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CreateSubTaskData {
  title: string;
  description?: string;
  assignedTo: string;
  parentTaskId?: string;
  amount?: number;
  isPaid?: boolean;
  dependencies?: string[];
}

export interface UpdateSubTaskData {
  title?: string;
  description?: string;
  progress?: number;
  amount?: number;
  isPaid?: boolean;
  blockedBy?: string;
  partsUsed?: Array<{
    partName: string;
    quantity: number;
    cost: number;
  }>;
}

export interface SubTaskStats {
  totalSubTasks: number;
  completedSubTasks: number;
  inProgressSubTasks: number;
  pendingSubTasks: number;
  blockedSubTasks: number;
  completionRate: number;
  totalSubTaskCommission: number;
  avgCompletionTime: number;
}

const subTaskService = {
  // Create a new sub-task for an order
  create: async (orderId: string, data: CreateSubTaskData) => {
    const response = await api.post(`/orders/${orderId}/subtasks`, data);
    return response.data;
  },

  // Get all sub-tasks for an order
  getByOrder: async (orderId: string, params?: { status?: string; assignedTo?: string }) => {
    const response = await api.get(`/orders/${orderId}/subtasks`, { params });
    return response.data;
  },

  // Get a specific sub-task by ID
  getById: async (id: string) => {
    const response = await api.get(`/subtasks/${id}`);
    return response.data;
  },

  // Update sub-task
  update: async (id: string, data: UpdateSubTaskData) => {
    const response = await api.put(`/subtasks/${id}`, data);
    return response.data;
  },

  // Update sub-task status
  updateStatus: async (id: string, status: string, notes?: string) => {
    const response = await api.put(`/subtasks/${id}/status`, { status, notes });
    return response.data;
  },

  // Reassign sub-task
  reassign: async (id: string, assignedTo: string, notes?: string) => {
    const response = await api.put(`/subtasks/${id}/assign`, { assignedTo, notes });
    return response.data;
  },

  // Add comment/update
  addUpdate: async (id: string, note: string, type: string = 'comment') => {
    const response = await api.post(`/subtasks/${id}/updates`, { note, type });
    return response.data;
  },

  // Delete sub-task
  delete: async (id: string) => {
    const response = await api.delete(`/subtasks/${id}`);
    return response.data;
  },

  // Get sub-tasks assigned to staff
  getStaffTasks: async (staffId: string, params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get(`/staff/${staffId}/subtasks`, { params });
    return response.data;
  },

  // Get sub-tasks created by staff
  getStaffCreatedTasks: async (staffId: string, params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get(`/staff/${staffId}/subtasks/created`, { params });
    return response.data;
  },

  // Get staff sub-task statistics
  getStaffStats: async (staffId: string, params?: { fromDate?: string; toDate?: string }) => {
    const response = await api.get(`/staff/${staffId}/subtasks/stats`, { params });
    return response.data;
  },

  // Get sub-task history
  getHistory: async (id: string) => {
    const response = await api.get(`/subtasks/${id}/history`);
    return response.data;
  },
};

export default subTaskService;
