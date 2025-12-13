import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  FileText,
  UserIcon,
} from "lucide-react";
import type { SubTask, CreateSubTaskData } from "../types";
import type { TaskType } from "../services/taskTypeService";
import type { EngineerWithStats } from "../services/engineerService";
import subTaskService from "../services/subTaskService";
import taskTypeService from "../services/taskTypeService";
import SubTaskForm from "./SubTaskForm";

interface WorkAssignmentPipelineProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  stageName?: string;
  assignedToName?: string;
  subTasks: SubTask[];
  users: EngineerWithStats[];
  onUpdate: () => void;
}

const WorkAssignmentPipeline: React.FC<WorkAssignmentPipelineProps> = ({
  orderId,
  orderNumber,
  stageName,
  assignedToName,
  subTasks,
  users,
  onUpdate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [editForm, setEditForm] = useState<Partial<SubTask>>({});
  const [creating, setCreating] = useState(false);

  // Fetch task types
  useEffect(() => {
    const fetchTaskTypes = async () => {
      try {
        const response = await taskTypeService.getAll({ isActive: true });
        setTaskTypes(response.data.data || []);
      } catch (error) {
        console.error("Error fetching task types:", error);
      }
    };
    fetchTaskTypes();
  }, []);

  const handleCreateSubTask = async (formData: CreateSubTaskData) => {
    setCreating(true);
    try {
      await subTaskService.create(orderId, formData);
      alert("Work assigned successfully!");
      setShowAddForm(false);
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error assigning work");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await subTaskService.updateStatus(taskId, status);
      alert("Work status updated!");
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error updating work status");
    }
  };

  const handleEditTask = (task: SubTask) => {
    setEditingTaskId(task._id);
    setEditForm({
      title: task.title,
      taskType: task.taskType,
      startDate: task.startDate,
      dueDate: task.dueDate,
      outcome: task.outcome,
      outcomeNotes: task.outcomeNotes,
    });
  };

  const handleUpdateTask = async (taskId: string) => {
    try {
      // Convert Date objects to strings for the API
      const updateData: any = { ...editForm };
      if (updateData.startDate instanceof Date) {
        updateData.startDate = updateData.startDate.toISOString().split("T")[0];
      }
      if (updateData.dueDate instanceof Date) {
        updateData.dueDate = updateData.dueDate.toISOString().split("T")[0];
      }

      await subTaskService.update(taskId, updateData);
      alert("Work details updated!");
      setEditingTaskId(null);
      setEditForm({});
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error updating work");
    }
  };

  const getStageBadge = (stage: string) => {
    const normalized = stage.toLowerCase();
    if (normalized.includes("pending")) return "badge-pending";
    if (normalized.includes("assigned") || normalized.includes("progress"))
      return "badge-in-progress";
    if (normalized.includes("completed") || normalized.includes("delivered"))
      return "badge-completed";
    if (normalized.includes("cancelled") || normalized.includes("hold"))
      return "badge-cancelled";
    return "badge-pending";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "badge-completed";
      case "in_progress":
        return "badge-in-progress";
      case "pending":
        return "badge-pending";
      case "blocked":
      case "cancelled":
        return "badge-cancelled";
      default:
        return "badge-pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3 text-white" />;
      case "in_progress":
        return <Clock className="w-3 h-3 text-white" />;
      case "blocked":
        return <AlertCircle className="w-3 h-3 text-white" />;
      default:
        return <Clock className="w-3 h-3 text-white" />;
    }
  };

  // Get unique engineers with their names
  const uniqueEngineers = Array.from(
    new Set(subTasks.map((t) => t.assignedTo))
  ).map((id) => {
    const task = subTasks.find((t) => t.assignedTo === id);
    return { id, name: task?.assignedToName || "" };
  });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Work Assignment Pipeline
        </h3>
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
              <p className="text-xs text-purple-600 font-medium">
                Total Assigned
              </p>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {subTasks.length}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {uniqueEngineers.slice(0, 3).map((eng) => (
                <span
                  key={eng.id}
                  className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded"
                >
                  {eng.name.split(" ")[0]}
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
              {subTasks.filter((t) => t.status === "in_progress").length}
            </p>
            <p className="text-xs text-blue-600 mt-1">working now</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-orange-600 font-medium">Pending</p>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {subTasks.filter((t) => t.status === "pending").length}
            </p>
            <p className="text-xs text-orange-600 mt-1">not started</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Completed</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {subTasks.filter((t) => t.status === "completed").length}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {subTasks.length > 0
                ? Math.round(
                    (subTasks.filter((t) => t.status === "completed").length /
                      subTasks.length) *
                      100
                  )
                : 0}
              % done
            </p>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <SubTaskForm
          users={users}
          onSubmit={handleCreateSubTask}
          onCancel={() => setShowAddForm(false)}
          isLoading={creating}
          title="Assign New Work"
        />
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
                  <p className="text-xs text-purple-600 font-medium">
                    MAIN ORDER
                  </p>
                  <p className="font-bold text-gray-900 truncate">
                    {orderNumber}
                  </p>
                </div>
                {assignedToName && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Lead</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {assignedToName}
                    </p>
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
                        <div
                          key={idx}
                          className="w-0.5 h-3 bg-purple-300"
                        ></div>
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
                <div
                  key={task._id}
                  className="flex-shrink-0"
                  style={{ width: "240px" }}
                >
                  {editingTaskId === task._id ? (
                    <div className="border-2 border-purple-400 rounded-lg p-3 bg-purple-50 h-full space-y-2">
                      <div className="flex items-center gap-1 mb-2">
                        <Edit className="w-3 h-3 text-purple-600" />
                        <p className="text-xs font-semibold text-gray-900">
                          Edit Task
                        </p>
                      </div>
                      <input
                        type="text"
                        value={editForm.title || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="input-field text-xs"
                        placeholder="Work title"
                      />
                      <select
                        value={editForm.taskType || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            taskType: e.target.value || undefined,
                          })
                        }
                        className="input-field text-xs"
                      >
                        <option value="">Task Type</option>
                        {taskTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editForm.outcome || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            outcome: e.target.value as any,
                          })
                        }
                        className="input-field text-xs"
                      >
                        <option value="">Outcome</option>
                        <option value="completed">Completed</option>
                        <option value="returned">Returned</option>
                        <option value="parts_ordered">Parts Ordered</option>
                        <option value="replaced">Replaced</option>
                        <option value="repaired">Repaired</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="date"
                        value={
                          editForm.startDate?.toString().split("T")[0] || ""
                        }
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            startDate: e.target.value
                              ? new Date(e.target.value)
                              : undefined,
                          })
                        }
                        className="input-field text-xs"
                        placeholder="Start Date"
                      />
                      <input
                        type="date"
                        value={editForm.dueDate?.toString().split("T")[0] || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            dueDate: e.target.value
                              ? new Date(e.target.value)
                              : undefined,
                          })
                        }
                        className="input-field text-xs"
                        placeholder="Due Date"
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
                        task.status === "completed"
                          ? "bg-green-50 border-green-300 hover:border-green-400 hover:shadow-md"
                          : task.status === "in_progress"
                          ? "bg-blue-50 border-blue-300 hover:border-blue-400 hover:shadow-md"
                          : task.status === "blocked"
                          ? "bg-red-50 border-red-300 hover:border-red-400 hover:shadow-md"
                          : "bg-gray-50 border-gray-300 hover:border-gray-400 hover:shadow-md"
                      }`}
                      onClick={() => handleEditTask(task)}
                    >
                      {/* Status Icon */}
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            task.status === "completed"
                              ? "bg-green-600"
                              : task.status === "in_progress"
                              ? "bg-blue-600"
                              : task.status === "blocked"
                              ? "bg-red-600"
                              : "bg-gray-400"
                          }`}
                        >
                          {getStatusIcon(task.status)}
                        </div>
                        <span
                          className={`badge text-xs ${getStatusBadge(
                            task.status
                          )}`}
                        >
                          {task.status === "in_progress"
                            ? "Active"
                            : task.status === "completed"
                            ? "Done"
                            : task.status === "pending"
                            ? "Pending"
                            : task.status}
                        </span>
                      </div>

                      {/* Title */}
                      <h5 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2">
                        {task.title}
                      </h5>

                      {/* Task Type */}
                      {task.taskTypeName && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {task.taskTypeName}
                          </span>
                        </div>
                      )}

                      {/* Engineer */}
                      <div className="flex items-center gap-1 mb-2 pb-2 border-b border-gray-200">
                        <UserIcon className="w-3 h-3 text-purple-600" />
                        <p className="text-xs text-gray-700 font-medium truncate">
                          {task.assignedToName}
                        </p>
                      </div>

                      {/* Dates */}
                      {(task.startDate || task.dueDate) && (
                        <div className="mb-2 space-y-1 text-xs">
                          {task.startDate && (
                            <div className="text-gray-600">
                              <span className="font-medium">Start:</span>{" "}
                              {new Date(task.startDate).toLocaleDateString()}
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="text-gray-600">
                              <span className="font-medium">Due:</span>{" "}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Outcome */}
                      {task.outcome && (
                        <div className="mb-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              task.outcome === "completed"
                                ? "bg-green-100 text-green-700"
                                : task.outcome === "returned"
                                ? "bg-red-100 text-red-700"
                                : task.outcome === "repaired"
                                ? "bg-blue-100 text-blue-700"
                                : task.outcome === "replaced"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {task.outcome.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div onClick={(e) => e.stopPropagation()}>
                        {task.status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task._id, "in_progress");
                            }}
                            className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Start
                          </button>
                        )}
                        {task.status === "in_progress" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task._id, "completed");
                            }}
                            className="w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                        {task.status === "completed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task._id, "in_progress");
                            }}
                            className="w-full px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                          >
                            Reopen
                          </button>
                        )}
                        {(task.status === "blocked" ||
                          task.status === "on_hold") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task._id, "in_progress");
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
