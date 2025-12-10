import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import engineerService, {
  type EngineerTask,
  type EngineerStats,
} from "../services/engineerService";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Play,
  CheckSquare,
  XCircle,
  TrendingUp,
  Plus,
  ListTodo,
  GripVertical,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import CreateTaskModal from "../components/engineer/CreateTaskModal";
import AssignedTasksStatus from "../components/engineer/AssignedTasksStatus";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

const EngineerTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<EngineerTask[]>([]);
  const [stats, setStats] = useState<EngineerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EngineerTask | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"todo" | "in_progress" | "completed">("todo");

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await engineerService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await engineerService.getTasks();
      console.log("Tasks response:", response);
      console.log("Tasks count:", response.count);
      console.log("Tasks data:", response.data);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task: EngineerTask) => {
    try {
      await engineerService.updateTaskStatus(
        task._id,
        "in_progress",
        "Task started"
      );
      alert("Task started successfully!");
      fetchStats();
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error starting task");
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    try {
      await engineerService.updateTaskStatus(
        selectedTask._id,
        "completed",
        "Task completed and item ready for submission"
      );
      alert("Task marked as complete! Please submit the item.");
      setShowCompleteModal(false);
      setSelectedTask(null);
      fetchStats();
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error completing task");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (source.droppableId === destination.droppableId) return;

    // Map droppable IDs to status
    const statusMap: Record<string, "pending" | "in_progress" | "completed"> = {
      todo: "pending",
      in_progress: "in_progress",
      completed: "completed",
    };

    const newStatus = statusMap[destination.droppableId];
    if (!newStatus) return;

    // Find the task
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    // Optimistically update UI
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await engineerService.updateTaskStatus(
        draggableId,
        newStatus,
        `Status changed to ${newStatus.replace("_", " ")}`
      );
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error updating task status");
      // Revert on error
      fetchTasks();
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

  // Group tasks by status
  const todoTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const renderTaskCard = (task: EngineerTask) => (
    <div
      key={task._id}
      className="group bg-white rounded-xl border border-gray-200 p-3 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]"
      onClick={() => navigate(`/engineer/tasks/${task._id}`)}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon - Animated */}
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
            task.status === "completed"
              ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-200"
              : task.status === "in_progress"
              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200"
              : "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200"
          }`}
        >
          {task.status === "completed" ? (
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
          ) : task.status === "in_progress" ? (
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
          )}
        </div>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 group-hover:text-purple-600 transition-colors">
              {task.title}
            </h3>
            {task.isOrderTask && (
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold shrink-0">
                Order
              </span>
            )}
          </div>

          <div className="space-y-1 text-xs mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <p className="text-purple-600 font-semibold">
                {task.orderId.voucherNo}
              </p>
            </div>
            <p className="text-gray-600 line-clamp-1 pl-3">
              {task.orderId.device?.deviceTypeName || "N/A"} • {task.orderId.device?.brand} {task.orderId.device?.model}
            </p>
            <p className="text-gray-500 pl-3">
              {format(new Date(task.assignedAt), "MMM dd, yyyy")}
            </p>
          </div>

          {/* Action Buttons - Modern */}
          <div
            className="flex gap-2 mt-3"
            onClick={(e) => e.stopPropagation()}
          >
            {task.status === "pending" && (
              <button
                onClick={() => handleStartTask(task)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-3 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                Start Task
              </button>
            )}
            {task.status === "in_progress" && (
              <button
                onClick={() => {
                  setSelectedTask(task);
                  setShowCompleteModal(true);
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-3 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-95"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Manage and track your assigned work
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-sm flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Task</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Statistics Dashboard - Compact on mobile */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
          <div className="card p-2 md:p-3 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <Package className="w-4 h-4 text-purple-600 mb-1" />
            <p className="text-lg md:text-2xl font-bold text-purple-900">
              {stats.totalAssigned}
            </p>
            <p className="text-xs text-purple-600">Total</p>
          </div>

          <div className="card p-2 md:p-3 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <TrendingUp className="w-4 h-4 text-green-600 mb-1" />
            <p className="text-lg md:text-2xl font-bold text-green-900">
              {stats.assignedToday}
            </p>
            <p className="text-xs text-green-600">Today</p>
          </div>

          <div className="card p-2 md:p-3 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-600 mb-1" />
            <p className="text-lg md:text-2xl font-bold text-orange-900">
              {stats.pending}
            </p>
            <p className="text-xs text-orange-600">Pending</p>
          </div>

          <div className="card p-2 md:p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <Clock className="w-4 h-4 text-blue-600 mb-1" />
            <p className="text-lg md:text-2xl font-bold text-blue-900">
              {stats.inProgress}
            </p>
            <p className="text-xs text-blue-600">Active</p>
          </div>

          <div className="card p-2 md:p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 mb-1" />
            <p className="text-lg md:text-2xl font-bold text-emerald-900">
              {stats.completed}
            </p>
            <p className="text-xs text-emerald-600">Done</p>
          </div>

          <div className="card p-2 md:p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <XCircle className="w-4 h-4 text-yellow-600 mb-1" />
            <p className="text-lg md:text-2xl font-bold text-yellow-900">
              {stats.reopened}
            </p>
            <p className="text-xs text-yellow-600">Reopened</p>
          </div>
        </div>
      )}

      {/* Assigned Tasks Status Component */}
      <AssignedTasksStatus />

      {/* Task Sections - Mobile: Tabs, Desktop: Sections */}
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
        <>
          {/* Mobile: Tabbed Interface */}
          <div className="md:hidden">
            {/* Modern Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-1.5 mb-4 sticky top-0 z-10">
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setActiveTab("todo")}
                  className={`relative py-3 px-3 rounded-xl font-semibold text-xs transition-all duration-300 ${
                    activeTab === "todo"
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                      : "text-gray-600 hover:bg-gray-50 active:scale-95"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <ListTodo className={`w-4 h-4 ${activeTab === "todo" ? "animate-bounce" : ""}`} />
                    <span>To Do</span>
                    {todoTasks.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === "todo" ? "bg-white/20" : "bg-orange-100 text-orange-600"
                      }`}>
                        {todoTasks.length}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("in_progress")}
                  className={`relative py-3 px-3 rounded-xl font-semibold text-xs transition-all duration-300 ${
                    activeTab === "in_progress"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-50 active:scale-95"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Clock className={`w-4 h-4 ${activeTab === "in_progress" ? "animate-pulse" : ""}`} />
                    <span>Active</span>
                    {inProgressTasks.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === "in_progress" ? "bg-white/20" : "bg-blue-100 text-blue-600"
                      }`}>
                        {inProgressTasks.length}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("completed")}
                  className={`relative py-3 px-3 rounded-xl font-semibold text-xs transition-all duration-300 ${
                    activeTab === "completed"
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-200"
                      : "text-gray-600 hover:bg-gray-50 active:scale-95"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle className={`w-4 h-4 ${activeTab === "completed" ? "animate-bounce" : ""}`} />
                    <span>Done</span>
                    {completedTasks.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === "completed" ? "bg-white/20" : "bg-green-100 text-green-600"
                      }`}>
                        {completedTasks.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content with Animation */}
            <div className="space-y-3">
              {activeTab === "todo" && (
                <div className="animate-fadeIn space-y-3">
                  {todoTasks.length > 0 ? (
                    todoTasks.map(renderTaskCard)
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                      <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">No pending tasks</p>
                      <p className="text-gray-400 text-xs mt-1">All caught up!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "in_progress" && (
                <div className="animate-fadeIn space-y-3">
                  {inProgressTasks.length > 0 ? (
                    inProgressTasks.map(renderTaskCard)
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">No active tasks</p>
                      <p className="text-gray-400 text-xs mt-1">Start working on pending tasks</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "completed" && (
                <div className="animate-fadeIn space-y-3">
                  {completedTasks.length > 0 ? (
                    completedTasks.map(renderTaskCard)
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                      <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">No completed tasks</p>
                      <p className="text-gray-400 text-xs mt-1">Complete tasks to see them here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop/Tablet: Kanban Board */}
          <div className="hidden md:block">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-3 gap-4 lg:gap-6">
                {/* To Do Column */}
                <Droppable droppableId="todo">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 transition-all duration-300 ${
                        snapshot.isDraggingOver ? "ring-2 ring-orange-400 shadow-lg" : ""
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <ListTodo className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-gray-900">To Do</h2>
                            <p className="text-xs text-gray-600">{todoTasks.length} tasks</p>
                          </div>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-3 min-h-[200px]">
                        {todoTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-all duration-200 ${
                                  snapshot.isDragging ? "rotate-2 scale-105" : ""
                                }`}
                              >
                                <div className="group bg-white rounded-xl border-2 border-gray-200 p-3 hover:shadow-xl transition-all duration-300 cursor-move relative">
                                  {/* Drag Handle */}
                                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>

                                  <div
                                    onClick={() => navigate(`/engineer/tasks/${task._id}`)}
                                    className="cursor-pointer"
                                  >
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 pr-6 group-hover:text-purple-600 transition-colors">
                                      {task.title}
                                    </h3>

                                    <div className="space-y-1.5 text-xs mb-3">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        <p className="text-purple-600 font-semibold">
                                          {task.orderId.voucherNo}
                                        </p>
                                      </div>
                                      <p className="text-gray-600 line-clamp-1 pl-3">
                                        {task.orderId.device?.deviceTypeName || "N/A"}
                                      </p>
                                      <p className="text-gray-500 pl-3 text-xs">
                                        {format(new Date(task.assignedAt), "MMM dd")}
                                      </p>
                                    </div>

                                    {/* Action Button */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => handleStartTask(task)}
                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-3 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                                      >
                                        <Play className="w-3.5 h-3.5" />
                                        Start Task
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {todoTasks.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <ListTodo className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">No pending tasks</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>

                {/* In Progress Column */}
                <Droppable droppableId="in_progress">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 transition-all duration-300 ${
                        snapshot.isDraggingOver ? "ring-2 ring-blue-400 shadow-lg" : ""
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-gray-900">In Progress</h2>
                            <p className="text-xs text-gray-600">{inProgressTasks.length} tasks</p>
                          </div>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-3 min-h-[200px]">
                        {inProgressTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-all duration-200 ${
                                  snapshot.isDragging ? "rotate-2 scale-105" : ""
                                }`}
                              >
                                <div className="group bg-white rounded-xl border-2 border-gray-200 p-3 hover:shadow-xl transition-all duration-300 cursor-move relative">
                                  {/* Drag Handle */}
                                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>

                                  <div
                                    onClick={() => navigate(`/engineer/tasks/${task._id}`)}
                                    className="cursor-pointer"
                                  >
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 pr-6 group-hover:text-purple-600 transition-colors">
                                      {task.title}
                                    </h3>

                                    <div className="space-y-1.5 text-xs mb-3">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        <p className="text-purple-600 font-semibold">
                                          {task.orderId.voucherNo}
                                        </p>
                                      </div>
                                      <p className="text-gray-600 line-clamp-1 pl-3">
                                        {task.orderId.device?.deviceTypeName || "N/A"}
                                      </p>
                                      <p className="text-gray-500 pl-3 text-xs">
                                        {format(new Date(task.assignedAt), "MMM dd")}
                                      </p>
                                    </div>

                                    {/* Action Button */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => {
                                          setSelectedTask(task);
                                          setShowCompleteModal(true);
                                        }}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-3 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                                      >
                                        <CheckSquare className="w-3.5 h-3.5" />
                                        Complete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {inProgressTasks.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">No active tasks</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>

                {/* Completed Column */}
                <Droppable droppableId="completed">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 transition-all duration-300 ${
                        snapshot.isDraggingOver ? "ring-2 ring-green-400 shadow-lg" : ""
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-gray-900">Completed</h2>
                            <p className="text-xs text-gray-600">{completedTasks.length} tasks</p>
                          </div>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-3 min-h-[200px]">
                        {completedTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-all duration-200 ${
                                  snapshot.isDragging ? "rotate-2 scale-105" : ""
                                }`}
                              >
                                <div className="group bg-white rounded-xl border-2 border-gray-200 p-3 hover:shadow-xl transition-all duration-300 cursor-move relative opacity-75 hover:opacity-100">
                                  {/* Drag Handle */}
                                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>

                                  <div
                                    onClick={() => navigate(`/engineer/tasks/${task._id}`)}
                                    className="cursor-pointer"
                                  >
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 pr-6 group-hover:text-purple-600 transition-colors">
                                      {task.title}
                                    </h3>

                                    <div className="space-y-1.5 text-xs mb-3">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        <p className="text-purple-600 font-semibold">
                                          {task.orderId.voucherNo}
                                        </p>
                                      </div>
                                      <p className="text-gray-600 line-clamp-1 pl-3">
                                        {task.orderId.device?.deviceTypeName || "N/A"}
                                      </p>
                                      <p className="text-gray-500 pl-3 text-xs">
                                        {format(new Date(task.assignedAt), "MMM dd")}
                                      </p>
                                    </div>

                                    {/* Completed Badge */}
                                    <div className="flex items-center justify-center gap-1.5 text-green-600 bg-green-100 rounded-lg py-2 px-3">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span className="text-xs font-semibold">Completed</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {completedTasks.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">No completed tasks</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          </div>
        </>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Complete Task?
                </h3>
                <p className="text-sm text-gray-500">
                  Order: {selectedTask.orderId.voucherNo}
                </p>
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
              <p className="text-sm font-medium text-gray-900 mb-1">
                {selectedTask.title}
              </p>
              {selectedTask.description && (
                <p className="text-sm text-gray-600">
                  {selectedTask.description}
                </p>
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

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUserId={user?._id || ""}
        onSuccess={() => {
          fetchTasks();
          fetchStats();
        }}
      />
    </div>
  );
};

export default EngineerTasksPage;
