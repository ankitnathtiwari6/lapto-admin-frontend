import api from '../lib/api';

export interface EngineerWorkload {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  blockedTasks: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  currentWorkload: number;
  completionRate: number;
}

export interface EngineerWithWorkload {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  role: string;
  workload: EngineerWorkload;
}

class StaffService {
  async getEngineersWithWorkload() {
    const response = await api.get<{ success: boolean; count: number; data: EngineerWithWorkload[] }>('/staff/engineers/workload');
    return response.data;
  }
}

export default new StaffService();
