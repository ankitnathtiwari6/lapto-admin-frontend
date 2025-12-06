import React, { useEffect, useState } from "react";
import engineerService, { type AssignedTask } from "../../services/engineerService";
import { CheckCircle, Clock, XCircle, Package, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const AssignedTasksStatus: React.FC = () => {
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const response = await engineerService.getAssignedTasks();
      setAssignedTasks(response.data);
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "blocked":
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200 text-green-700";
      case "in_progress":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "blocked":
      case "cancelled":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-semibold text-gray-900">Tasks I Assigned</h3>
        </div>
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-semibold text-gray-900">Tasks I Assigned</h3>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {assignedTasks.length} {assignedTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {assignedTasks.length === 0 ? (
        <div className="text-center py-6">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No tasks assigned yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {assignedTasks.map((task) => (
            <div
              key={task._id}
              className={`p-3 rounded-lg border ${getStatusColor(task.status)} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/50 shrink-0">
                      {task.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="text-gray-600">
                      <span className="font-medium">Order:</span> {task.orderId.orderNumber}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Engineer:</span> {task.engineerId.fullName}
                    </p>
                    <p className="text-gray-500">
                      {format(new Date(task.assignedAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedTasksStatus;
