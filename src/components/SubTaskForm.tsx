import React, { useState, useEffect } from 'react';
import type { CreateSubTaskData } from '../types';
import type { TaskType } from '../services/taskTypeService';
import { type EngineerWithStats } from '../services/engineerService';
import taskTypeService from '../services/taskTypeService';

interface SubTaskFormProps {
  users: EngineerWithStats[];
  onSubmit: (data: CreateSubTaskData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateSubTaskData>;
  showDescription?: boolean;
  title?: string;
}

const SubTaskForm: React.FC<SubTaskFormProps> = ({
  users,
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
  showDescription = false,
  title = 'Assign New Work',
}) => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [formData, setFormData] = useState<CreateSubTaskData>({
    title: initialData.title || '',
    description: initialData.description || '',
    assignedTo: initialData.assignedTo || '',
    taskType: initialData.taskType || undefined,
    startDate: initialData.startDate || undefined,
    dueDate: initialData.dueDate || undefined,
    amount: initialData.amount || undefined,
    isPaid: initialData.isPaid || false,
  });

  useEffect(() => {
    const fetchTaskTypes = async () => {
      try {
        const response = await taskTypeService.getAll({ isActive: true });
        setTaskTypes(response.data.data || []);
      } catch (error) {
        console.error('Error fetching task types:', error);
      }
    };
    fetchTaskTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo) {
      alert('Please enter work description and assign to an engineer');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={showDescription ? 'md:col-span-2' : 'md:col-span-2'}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Description *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="e.g., Motherboard Repair, Screen Replacement"
            required
          />
        </div>

        {showDescription && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Add any additional details or instructions..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To Engineer *
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="input-field"
            required
          >
            <option value="">Select Engineer</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.fullName} (P: {user.taskStats.pending}, I:{' '}
                {user.taskStats.in_progress}, C: {user.taskStats.completed})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Type
          </label>
          <select
            value={formData.taskType || ''}
            onChange={(e) => setFormData({ ...formData, taskType: e.target.value || undefined })}
            className="input-field"
          >
            <option value="">Select Task Type</option>
            {taskTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value || undefined })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate || ''}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || undefined })}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1"
        >
          {isLoading ? 'Assigning...' : 'Assign Work'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SubTaskForm;
