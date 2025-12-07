import api from '../lib/api';

export interface EngineerStats {
  totalAssigned: number;
  assignedToday: number;
  pending: number;
  inProgress: number;
  completed: number;
  blocked: number;
  onHold: number;
  reopened: number;
}

export interface EngineerTask {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    device?: {
      deviceTypeName: string;
      brand: string;
      model: string;
      serialNumber?: string;
      accessories?: string[];
    };
    problemDescription?: string;
    diagnosedIssues?: string[];
    stageName?: string;
    status: string;
    estimatedCost: number;
    finalCost?: number;
    receivedDate?: string;
    estimatedCompletionDate?: string;
    partsUsed?: Array<{
      partName: string;
      quantity: number;
      cost: number;
      addedAt: string;
    }>;
    images?: Array<{
      url: string;
      type: string;
      uploadedAt: string;
    }>;
    priority?: string;
  };
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked' | 'on_hold';
  progress: number;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  amount?: number;
  isPaid: boolean;
  partsUsed?: Array<{
    partName: string;
    quantity: number;
    cost: number;
    addedAt: string;
  }>;
  updates: Array<{
    note: string;
    addedByName: string;
    timestamp: string;
    type: string;
    oldValue?: string;
    newValue?: string;
  }>;
  isOrderTask?: boolean; // Flag to identify order-level tasks vs subtasks
}

export interface CreateTaskData {
  orderId: string;
  engineerId: string;
  title: string;
  description?: string;
}

export interface AssignedTask {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
  };
  engineerId: {
    _id: string;
    fullName: string;
  };
  title: string;
  status: string;
  assignedAt: string;
}

class EngineerService {
  async getStats() {
    const response = await api.get<{ success: boolean; data: EngineerStats }>('/engineer/stats');
    return response.data;
  }

  async getTasks(status?: string, sortBy: string = 'assignedAt', order: string = 'desc') {
    const params: any = { sortBy, order };
    if (status) params.status = status;

    const response = await api.get<{ success: boolean; count: number; data: EngineerTask[] }>('/engineer/tasks', { params });
    return response.data;
  }

  async getTaskById(id: string) {
    const response = await api.get<{ success: boolean; data: EngineerTask }>(`/engineer/tasks/${id}`);
    return response.data;
  }

  async updateTaskStatus(id: string, status: string, notes?: string) {
    const response = await api.put<{ success: boolean; message: string; data: EngineerTask }>(
      `/engineer/tasks/${id}/status`,
      { status, notes }
    );
    return response.data;
  }

  async getEngineers() {
    const response = await api.get<{ success: boolean; data: any[] }>('/users/engineers');
    return response.data;
  }

  async createTask(taskData: CreateTaskData) {
    const { orderId, engineerId, title, description } = taskData;
    const response = await api.post<{ success: boolean; data: EngineerTask }>(
      `/orders/${orderId}/subtasks`,
      {
        assignedTo: engineerId,
        title,
        description
      }
    );
    return response.data;
  }

  async getAssignedTasks() {
    const response = await api.get<{ success: boolean; data: AssignedTask[] }>('/engineer/assigned-tasks');
    return response.data;
  }
}

export default new EngineerService();
