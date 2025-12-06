import React, { useEffect, useState } from 'react';
import subTaskService, { type SubTask } from '../services/subTaskService';
import { CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import { format } from 'date-fns';

interface AssignedTasksStatusProps {
  engineerId: string;
}

const AssignedTasksStatus: React.FC<AssignedTasksStatusProps> = ({ engineerId }) => {
  const [assignedTasks, setAssignedTasks] = useState<SubTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedTasks();
  }, [engineerId]);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      // Get tasks created by this engineer (assigned to others)
      const response = await subTaskService.getAll();
      const tasksCreatedByMe = response.data.filter(
        (task: SubTask) => task.createdBy === engineerId && task.assignedTo !== engineerId
      );
      setAssignedTasks(tasksCreatedByMe);
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-3 h-3 text-blue-600" />;
      default:
        return <AlertCircle className="w-3 h-3 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-completed';
      case 'in_progress':
        return 'badge-in-progress';
      case 'pending':
        return 'badge-pending';
      default:
        return 'badge-pending';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tasks I Assigned</h3>
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (assignedTasks.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tasks I Assigned</h3>
        <p className="text-xs text-gray-500 text-center py-4">No tasks assigned yet</p>
      </div>
    );
  }

  const stats = {
    total: assignedTasks.length,
    pending: assignedTasks.filter(t => t.status === 'pending').length,
    inProgress: assignedTasks.filter(t => t.status === 'in_progress').length,
    completed: assignedTasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Tasks I Assigned</h3>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-purple-900">{stats.total}</p>
          <p className="text-xs text-purple-600">Total</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-orange-900">{stats.pending}</p>
          <p className="text-xs text-orange-600">Pending</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-blue-900">{stats.inProgress}</p>
          <p className="text-xs text-blue-600">Active</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-900">{stats.completed}</p>
          <p className="text-xs text-green-600">Done</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {assignedTasks.map((task) => (
          <div
            key={task._id}
            className="bg-gray-50 rounded-lg p-2 border border-gray-200 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {getStatusIcon(task.status)}
                <p className="text-xs font-medium text-gray-900 truncate">{task.title}</p>
              </div>
              <span className={`badge text-xs ${getStatusBadge(task.status)}`}>
                {task.status === 'in_progress' ? 'Active' :
                 task.status === 'completed' ? 'Done' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">{task.assignedToName}</span>
              </div>
              <span>•</span>
              <span>{format(new Date(task.assignedAt), 'MMM dd')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedTasksStatus;
