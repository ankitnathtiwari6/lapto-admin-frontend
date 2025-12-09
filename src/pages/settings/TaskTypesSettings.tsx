import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import taskTypeService from '../../services/taskTypeService';
import type { TaskType } from '../../services/taskTypeService';

const TaskTypesSettings: React.FC = () => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTaskTypes();
  }, []);

  const fetchTaskTypes = async () => {
    try {
      const { data } = await taskTypeService.getAll();
      setTaskTypes(data.data || []);
    } catch (error) {
      console.error('Error fetching task types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (taskType?: TaskType) => {
    if (taskType) {
      setEditingId(taskType._id);
      setFormData({
        name: taskType.name,
        description: taskType.description || '',
        color: taskType.color || '#8B5CF6',
        isActive: taskType.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        color: '#8B5CF6',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      color: '#8B5CF6',
      isActive: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a task type name');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await taskTypeService.update(editingId, formData);
        alert('Task type updated successfully');
      } else {
        await taskTypeService.create(formData);
        alert('Task type created successfully');
      }
      handleCloseModal();
      fetchTaskTypes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving task type');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await taskTypeService.delete(id);
        alert('Task type deleted successfully');
        fetchTaskTypes();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error deleting task type');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading task types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Task Types</h2>
          <p className="text-sm text-gray-500 mt-1">Manage task types for work assignments</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task Type
        </button>
      </div>

      {/* Task Types Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Color</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taskTypes.map((taskType) => (
                <tr key={taskType._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: taskType.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{taskType.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-600">{taskType.description || '-'}</td>
                  <td>
                    <span className="text-sm text-gray-500">{taskType.color}</span>
                  </td>
                  <td>
                    <span className={`badge ${taskType.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                      {taskType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(taskType)}
                        className="action-btn"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(taskType._id, taskType.name)}
                        className="action-btn hover:text-red-500! hover:bg-red-50!"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {taskTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No task types found</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Create your first task type
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Task Type' : 'New Task Type'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Motherboard Repair"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20 cursor-pointer rounded border border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{formData.color}</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="checkbox"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTypesSettings;
