import React, { useState } from 'react';
import { Users, Clock, AlertCircle, CheckCircle, Plus, Edit, User as UserIcon, FileText } from 'lucide-react';
import type { SubTask, CreateSubTaskData, User } from '../types';
import subTaskService from '../services/subTaskService';

interface WorkAssignmentPipelineProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  stageName?: string;
  assignedToName?: string;
  subTasks: SubTask[];
  users: User[];
  onUpdate: () => void;
}

const WorkAssignmentPipeline: React.FC<WorkAssignmentPipelineProps> = ({
  orderId,
  orderNumber,
  customerName,
  stageName,
  assignedToName,
  subTasks,
  users,
  onUpdate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [subTaskForm, setSubTaskForm] = useState<CreateSubTaskData>({
    title: '',
    assignedTo: '',
    amount: undefined,
    isPaid: true,
  });
  const [editForm, setEditForm] = useState<Partial<SubTask>>({});
  const [creating, setCreating] = useState(false);

  const handleCreateSubTask = async () => {
    if (!subTaskForm.title || !subTaskForm.assignedTo) {
      alert('Please enter work description and assign to an engineer');
      return;
    }

    setCreating(true);
    try {
      await subTaskService.create(orderId, subTaskForm);
      alert('Work assigned successfully!');
      setShowAddForm(false);
      setSubTaskForm({
        title: '',
        assignedTo: '',
        amount: undefined,
        isPaid: true,
      });
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error assigning work');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await subTaskService.updateStatus(taskId, status);
      alert('Work status updated!');
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating work status');
    }
  };

  const handleEditTask = (task: SubTask) => {
    setEditingTaskId(task._id);
    setEditForm({
      title: task.title,
      amount: task.amount,
    });
  };

  const handleUpdateTask = async (taskId: string) => {
    try {
      await subTaskService.update(taskId, editForm);
      alert('Work details updated!');
      setEditingTaskId(null);
      setEditForm({});
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating work');
    }
  };

  const getStageBadge = (stage: string) => {
    const normalized = stage.toLowerCase();
    if (normalized.includes('pending')) return 'badge-pending';
    if (normalized.includes('assigned') || normalized.includes('progress')) return 'badge-in-progress';
    if (normalized.includes('completed') || normalized.includes('delivered')) return 'badge-completed';
    if (normalized.includes('cancelled') || normalized.includes('hold')) return 'badge-cancelled';
    return 'badge-pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-completed';
      case 'in_progress': return 'badge-in-progress';
      case 'pending': return 'badge-pending';
      case 'blocked':
      case 'cancelled': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3 text-white" />;
      case 'in_progress': return <Clock className="w-3 h-3 text-white" />;
      case 'blocked': return <AlertCircle className="w-3 h-3 text-white" />;
      default: return <Clock className="w-3 h-3 text-white" />;
    }
  };

  // Get unique engineers with their names
  const uniqueEngineers = Array.from(new Set(subTasks.map(t => t.assignedTo)))
    .map(id => {
      const task = subTasks.find(t => t.assignedTo === id);
      return { id, name: task?.assignedToName || '' };
    });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Work Assignment Pipeline</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Assign Work
        </button>
      </div>

      {/* Statistics */}
      {subTasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-purple-600 font-medium">Total Assigned</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{subTasks.length}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {uniqueEngineers.slice(0, 3).map(eng => (
                <span key={eng.id} className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                  {eng.name.split(' ')[0]}
                </span>
              ))}
              {uniqueEngineers.length > 3 && (
                <span className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                  +{uniqueEngineers.length - 3}
                </span>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">In Progress</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {subTasks.filter(t => t.status === 'in_progress').length}
            </p>
            <p className="text-xs text-blue-600 mt-1">working now</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-orange-600 font-medium">Pending</p>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {subTasks.filter(t => t.status === 'pending').length}
            </p>
            <p className="text-xs text-orange-600 mt-1">not started</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Completed</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {subTasks.filter(t => t.status === 'completed').length}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {subTasks.length > 0 ? Math.round((subTasks.filter(t => t.status === 'completed').length / subTasks.length) * 100) : 0}% done
            </p>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Assign New Work</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Description *</label>
              <input
                type="text"
                value={subTaskForm.title}
                onChange={(e) => setSubTaskForm({ ...subTaskForm, title: e.target.value })}
                className="input-field"
                placeholder="e.g., Motherboard Repair, Screen Replacement"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Engineer *</label>
              <select
                value={subTaskForm.assignedTo}
                onChange={(e) => setSubTaskForm({ ...subTaskForm, assignedTo: e.target.value })}
                className="input-field"
              >
                <option value="">Select Engineer</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullName} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission (₹)</label>
              <input
                type="number"
                value={subTaskForm.amount || ''}
                onChange={(e) => setSubTaskForm({ ...subTaskForm, amount: parseFloat(e.target.value) || undefined })}
                className="input-field"
                placeholder="Amount"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateSubTask} disabled={creating} className="btn-primary flex-1">
              {creating ? 'Assigning...' : 'Assign Work'}
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Pipeline Visualization */}
      {subTasks.length > 0 ? (
        <div className="space-y-4">
          {/* Main Order Card */}
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-600 font-medium">MAIN ORDER</p>
                  <p className="font-bold text-gray-900 truncate">{orderNumber}</p>
                </div>
                {assignedToName && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Lead</p>
                    <p className="font-semibold text-gray-900 text-sm">{assignedToName}</p>
                  </div>
                )}
                {stageName && (
                  <span className={`badge text-xs ${getStageBadge(stageName)}`}>
                    {stageName}
                  </span>
                )}
              </div>
            </div>
            {/* Connector lines */}
            <div className="flex justify-center py-2">
              <div className="relative w-full max-w-4xl">
                <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-purple-300 transform -translate-x-1/2"></div>
                {subTasks.length > 1 ? (
                  <>
                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-purple-300"></div>
                    <div className="absolute top-3 w-full flex justify-around">
                      {subTasks.map((_, idx) => (
                        <div key={idx} className="w-0.5 h-3 bg-purple-300"></div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="absolute top-3 left-1/2 w-0.5 h-3 bg-purple-300 transform -translate-x-1/2"></div>
                )}
              </div>
            </div>
          </div>

          {/* Task Cards - Horizontal Scroll */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-min">
              {subTasks.map((task) => (
                <div key={task._id} className="flex-shrink-0" style={{ width: '200px' }}>
                  {editingTaskId === task._id ? (
                    <div className="border-2 border-purple-400 rounded-lg p-3 bg-purple-50 h-full">
                      <div className="flex items-center gap-1 mb-2">
                        <Edit className="w-3 h-3 text-purple-600" />
                        <p className="text-xs font-semibold text-gray-900">Edit</p>
                      </div>
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="input-field text-sm mb-2"
                        placeholder="Work title"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateTask(task._id)}
                          className="flex-1 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingTaskId(null);
                            setEditForm({});
                          }}
                          className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all h-full ${
                        task.status === 'completed'
                          ? 'bg-green-50 border-green-300 hover:border-green-400 hover:shadow-md'
                          : task.status === 'in_progress'
                          ? 'bg-blue-50 border-blue-300 hover:border-blue-400 hover:shadow-md'
                          : task.status === 'blocked'
                          ? 'bg-red-50 border-red-300 hover:border-red-400 hover:shadow-md'
                          : 'bg-gray-50 border-gray-300 hover:border-gray-400 hover:shadow-md'
                      }`}
                      onClick={() => handleEditTask(task)}
                    >
                      {/* Status Icon */}
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          task.status === 'completed' ? 'bg-green-600' :
                          task.status === 'in_progress' ? 'bg-blue-600' :
                          task.status === 'blocked' ? 'bg-red-600' : 'bg-gray-400'
                        }`}>
                          {getStatusIcon(task.status)}
                        </div>
                        <span className={`badge text-xs ${getStatusBadge(task.status)}`}>
                          {task.status === 'in_progress' ? 'Active' :
                           task.status === 'completed' ? 'Done' :
                           task.status === 'pending' ? 'Pending' : task.status}
                        </span>
                      </div>

                      {/* Title */}
                      <h5 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                        {task.title}
                      </h5>

                      {/* Engineer */}
                      <div className="flex items-center gap-1 mb-3 pb-2 border-b border-gray-200">
                        <UserIcon className="w-3 h-3 text-purple-600" />
                        <p className="text-xs text-gray-700 font-medium truncate">
                          {task.assignedToName}
                        </p>
                      </div>

                      {/* Actions */}
                      <div onClick={(e) => e.stopPropagation()}>
                        {task.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task._id, 'in_progress');
                            }}
                            className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task._id, 'completed');
                            }}
                            className="w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                        {task.status === 'completed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task._id, 'in_progress');
                            }}
                            className="w-full px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                          >
                            Reopen
                          </button>
                        )}
                        {(task.status === 'blocked' || task.status === 'on_hold') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task._id, 'in_progress');
                            }}
                            className="w-full px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-6">
          No work assigned yet. Click "Assign Work" to delegate tasks.
        </p>
      )}
    </div>
  );
};

export default WorkAssignmentPipeline;
