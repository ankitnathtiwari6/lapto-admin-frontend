import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import engineerService, { type EngineerTask, type EngineerStats } from '../services/engineerService';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Play,
  CheckSquare,
  XCircle,
  Pause,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

const EngineerTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<EngineerTask[]>([]);
  const [stats, setStats] = useState<EngineerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EngineerTask | null>(null);

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, [selectedStatus]);

  const fetchStats = async () => {
    try {
      const response = await engineerService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await engineerService.getTasks(selectedStatus);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task: EngineerTask) => {
    try {
      await engineerService.updateTaskStatus(task._id, 'in_progress', 'Task started');
      alert('Task started successfully!');
      fetchStats();
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error starting task');
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    try {
      await engineerService.updateTaskStatus(
        selectedTask._id,
        'completed',
        'Task completed and item ready for submission'
      );
      alert('Task marked as complete! Please submit the item.');
      setShowCompleteModal(false);
      setSelectedTask(null);
      fetchStats();
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error completing task');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'on_hold':
        return <Pause className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
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
      case 'blocked':
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-pending';
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track your assigned work</p>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          <div className="card p-3 md:p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              <p className="text-xs md:text-sm text-purple-600 font-medium">Total</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-purple-900">{stats.totalAssigned}</p>
            <p className="text-xs text-purple-600 mt-1">Assigned</p>
          </div>

          <div className="card p-3 md:p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              <p className="text-xs md:text-sm text-green-600 font-medium">Today</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-green-900">{stats.assignedToday}</p>
            <p className="text-xs text-green-600 mt-1">New tasks</p>
          </div>

          <div className="card p-3 md:p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
              <p className="text-xs md:text-sm text-orange-600 font-medium">Pending</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-orange-900">{stats.pending}</p>
            <p className="text-xs text-orange-600 mt-1">Not started</p>
          </div>

          <div className="card p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              <p className="text-xs md:text-sm text-blue-600 font-medium">Active</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-blue-900">{stats.inProgress}</p>
            <p className="text-xs text-blue-600 mt-1">In progress</p>
          </div>

          <div className="card p-3 md:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              <p className="text-xs md:text-sm text-emerald-600 font-medium">Done</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-emerald-900">{stats.completed}</p>
            <p className="text-xs text-emerald-600 mt-1">Completed</p>
          </div>

          <div className="card p-3 md:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              <p className="text-xs md:text-sm text-yellow-600 font-medium">Reopened</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-yellow-900">{stats.reopened}</p>
            <p className="text-xs text-yellow-600 mt-1">Reopened</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`card hover:shadow-lg transition-all cursor-pointer ${
                task.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : task.status === 'in_progress'
                  ? 'bg-blue-50 border-blue-200'
                  : task.status === 'blocked'
                  ? 'bg-red-50 border-red-200'
                  : ''
              }`}
              onClick={() => navigate(`/engineer/tasks/${task._id}`)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Status Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  task.status === 'completed'
                    ? 'bg-green-600'
                    : task.status === 'in_progress'
                    ? 'bg-blue-600'
                    : task.status === 'blocked'
                    ? 'bg-red-600'
                    : 'bg-gray-400'
                }`}>
                  {getStatusIcon(task.status)}
                </div>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-base md:text-lg">{task.title}</h3>
                    <span className={`badge ${getStatusBadge(task.status)} self-start md:self-auto`}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Order</p>
                      <p className="font-semibold text-purple-600">{task.orderId.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Device</p>
                      <p className="font-medium text-gray-900">
                        {task.orderId.device?.deviceTypeName || 'N/A'}
                      </p>
                      {task.orderId.device && (
                        <p className="text-xs text-gray-600">
                          {task.orderId.device.brand} {task.orderId.device.model}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Assigned</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(task.assignedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row md:flex-col gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleStartTask(task)}
                      className="btn-primary text-sm flex items-center gap-1.5 justify-center"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowCompleteModal(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1.5 justify-center"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Complete Confirmation Modal */}
      {showCompleteModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Complete Task?</h3>
                <p className="text-sm text-gray-500">Order: {selectedTask.orderId.orderNumber}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 font-medium">
                Are you sure you want to mark this task as complete?
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Please ensure you have submitted the item before confirming.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900 mb-1">{selectedTask.title}</p>
              {selectedTask.description && (
                <p className="text-sm text-gray-600">{selectedTask.description}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCompleteTask}
                className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Yes, Mark Complete
              </button>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedTask(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerTasksPage;
