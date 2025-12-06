import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import engineerService, { type EngineerTask } from '../services/engineerService';
import {
  ArrowLeft,
  Smartphone,
  Package,
  CheckCircle,
  Clock,
  Play,
  CheckSquare,
  Calendar,
  Wrench
} from 'lucide-react';
import { format } from 'date-fns';

const EngineerTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<EngineerTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await engineerService.getTaskById(id!);
      setTask(response.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error fetching task');
      navigate('/engineer/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    if (!task) return;

    try {
      await engineerService.updateTaskStatus(task._id, 'in_progress', 'Task started');
      alert('Task started successfully!');
      fetchTask();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error starting task');
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;

    try {
      await engineerService.updateTaskStatus(
        task._id,
        'completed',
        'Task completed and item ready for submission'
      );
      alert('Task marked as complete! Please submit the item.');
      setShowCompleteModal(false);
      fetchTask();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error completing task');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500">Task not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <button
          onClick={() => navigate('/engineer/tasks')}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors self-start"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{task.title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Assigned on {format(new Date(task.assignedAt), 'MMM dd, yyyy')}
          </p>
        </div>
        <span className={`badge ${getStatusBadge(task.status)} self-start md:self-auto`}>
          {task.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Task Details */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Task Details</h3>
            {task.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{task.description}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-purple-600">{task.progress}%</span>
                </div>
              </div>
              {task.amount && task.amount > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Commission</p>
                  <p className="font-semibold text-green-600">₹{task.amount.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Information (No Customer Details) */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-semibold text-gray-900">Order Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="font-semibold text-purple-600 text-lg">{task.orderId.orderNumber}</p>
              </div>
              {task.orderId.problemDescription && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Problem Description</p>
                  <p className="text-gray-700">{task.orderId.problemDescription}</p>
                </div>
              )}
              {task.orderId.diagnosedIssues && task.orderId.diagnosedIssues.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Diagnosed Issues</p>
                  <ul className="list-disc list-inside space-y-1">
                    {task.orderId.diagnosedIssues.map((issue, idx) => (
                      <li key={idx} className="text-gray-700 text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Device Details */}
          {task.orderId.device && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Device Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Device Type</p>
                  <p className="font-semibold text-gray-900">{task.orderId.device.deviceTypeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Brand & Model</p>
                  <p className="font-semibold text-gray-900">
                    {task.orderId.device.brand} {task.orderId.device.model}
                  </p>
                </div>
                {task.orderId.device.serialNumber && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Serial Number</p>
                    <p className="font-medium text-gray-700">{task.orderId.device.serialNumber}</p>
                  </div>
                )}
                {task.orderId.device.accessories && task.orderId.device.accessories.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-2">Accessories</p>
                    <div className="flex flex-wrap gap-2">
                      {task.orderId.device.accessories.map((acc, idx) => (
                        <span key={idx} className="badge badge-pending text-xs">
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parts Used */}
          {task.partsUsed && task.partsUsed.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-semibold text-gray-900">Parts Used</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Part Name</th>
                      <th>Quantity</th>
                      <th>Cost</th>
                      <th>Added At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.partsUsed.map((part, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">{part.partName}</td>
                        <td>{part.quantity}</td>
                        <td className="font-semibold text-green-600">
                          ₹{part.cost.toLocaleString('en-IN')}
                        </td>
                        <td className="text-gray-600">
                          {format(new Date(part.addedAt), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Updates/Timeline */}
          {task.updates && task.updates.length > 0 && (
            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              <div className="space-y-3">
                {task.updates.map((update, idx) => (
                  <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      update.type === 'status_change' ? 'bg-blue-500' :
                      update.type === 'completion' ? 'bg-green-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{update.note}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{update.addedByName}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">
                          {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Action Card */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {task.status === 'pending' && (
                <button
                  onClick={handleStartTask}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Task
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium w-full flex items-center justify-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  Mark Complete
                </button>
              )}
              {task.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">Task Completed</p>
                  {task.completedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      {format(new Date(task.completedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timeline Card */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Assigned</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(task.assignedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              {task.startedAt && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Started</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(task.startedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}
              {task.completedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(task.completedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Status */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-3">
              {task.orderId.stageName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Stage</p>
                  <span className="badge badge-in-progress">{task.orderId.stageName}</span>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Order Status</p>
                <span className={`badge ${getStatusBadge(task.orderId.status)}`}>
                  {task.orderId.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {task.orderId.estimatedCost && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Estimated Cost</p>
                  <p className="font-semibold text-gray-900">
                    ₹{task.orderId.estimatedCost.toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Confirmation Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Complete Task?</h3>
                <p className="text-sm text-gray-500">Order: {task.orderId.orderNumber}</p>
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
              <p className="text-sm font-medium text-gray-900 mb-1">{task.title}</p>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
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
                onClick={() => setShowCompleteModal(false)}
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

export default EngineerTaskDetailPage;
