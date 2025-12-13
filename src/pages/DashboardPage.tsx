import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
} from "lucide-react";

interface DashboardAnalytics {
  totalOrders: number;
  ordersByStatus: Array<{ _id: string; count: number }>;
  ordersByPriority: Array<{ _id: string; count: number }>;
  ordersByDeviceType: Array<any>;
  revenue: {
    totalRevenue: number;
    totalEstimated: number;
    totalAdvance: number;
    totalBalance: number;
  };
  payments: {
    totalPayments: number;
    count: number;
  };
  technicianPerformance: Array<any>;
  popularServices: Array<any>;
  revenueTrends: Array<any>;
  orderTrends: Array<any>;
  activeEngineers: number;
  totalCustomers: number;
  taskStats: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    blockedTasks: number;
    cancelledTasks: number;
    onHoldTasks: number;
  };
  tasksByType: Array<any>;
  engineerWorkload: Array<any>;
  taskCompletionTrend: Array<any>;
  criticalItems: {
    overdueTasks: Array<any>;
    urgentOrders: Array<any>;
    blockedTasks: Array<any>;
    todoOrders: Array<any>;
    pendingPayments: Array<any>;
  };
}

const COLORS = [
  "#9333ea",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get("/dashboard/analytics");
      setAnalytics(data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const orderStatusData = analytics.ordersByStatus.map((item) => ({
    name: item._id.replace("_", " ").toUpperCase(),
    value: item.count,
  }));

  const taskStatusData = [
    {
      name: "Pending",
      value: analytics.taskStats.pendingTasks,
      color: "#f59e0b",
    },
    {
      name: "In Progress",
      value: analytics.taskStats.inProgressTasks,
      color: "#3b82f6",
    },
    {
      name: "Completed",
      value: analytics.taskStats.completedTasks,
      color: "#10b981",
    },
    {
      name: "Blocked",
      value: analytics.taskStats.blockedTasks,
      color: "#ef4444",
    },
    {
      name: "On Hold",
      value: analytics.taskStats.onHoldTasks,
      color: "#6b7280",
    },
  ];

  const orderTrendData = analytics.orderTrends.map((item) => ({
    date: `${item._id.month}/${item._id.day}`,
    orders: item.count,
  }));

  const engineerWorkloadData = analytics.engineerWorkload.map((item) => ({
    name: item.engineerName || "Unknown",
    totalAssigned: item.totalAssigned || 0,
    pending: item.pendingTasks,
    completed: item.completedTasks || 0,
  }));

  // Orders vs Subtasks comparison data
  const ordersVsSubtasksData = [
    {
      category: "Pending",
      Orders:
        analytics.ordersByStatus.find((s: any) => s._id === "pending")?.count ||
        0,
      Tasks: analytics.taskStats.pendingTasks,
    },
    {
      category: "In Progress",
      Orders:
        analytics.ordersByStatus.find((s: any) => s._id === "in_progress")
          ?.count || 0,
      Tasks: analytics.taskStats.inProgressTasks,
    },
    {
      category: "Completed",
      Orders:
        analytics.ordersByStatus.find((s: any) => s._id === "completed")
          ?.count || 0,
      Tasks: analytics.taskStats.completedTasks,
    },
  ];

  const stats = [
    {
      name: "Total Orders",
      value: analytics.totalOrders,
      subtext: "All Time",
      icon: Package,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      name: "Pending Orders",
      value:
        analytics.ordersByStatus.find((s: any) => s._id === "pending")?.count ||
        0,
      subtext: "Needs Attention",
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      name: "In Progress",
      value:
        analytics.ordersByStatus.find((s: any) => s._id === "in_progress")
          ?.count || 0,
      subtext: "Active Orders",
      icon: Activity,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      name: "Completed Orders",
      value:
        analytics.ordersByStatus.find((s: any) => s._id === "completed")
          ?.count || 0,
      subtext: "Finished",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  const taskStatsCards = [
    {
      name: "Total Tasks",
      value: analytics.taskStats.totalTasks,
      icon: Activity,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      name: "Pending",
      value: analytics.taskStats.pendingTasks,
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      name: "In Progress",
      value: analytics.taskStats.inProgressTasks,
      icon: Activity,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      name: "Completed",
      value: analytics.taskStats.completedTasks,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back! Here's your business overview.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.subtext}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700 mt-3">
                {stat.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Task Statistics Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Task Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {taskStatsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="card">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => {
                  console.log(entry);
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  );
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tasks by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Orders vs Subtasks Comparison */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Orders vs Tasks Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersVsSubtasksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Orders" fill="#9333ea" name="Orders" />
              <Bar dataKey="Tasks" fill="#3b82f6" name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Trends Line Chart */}
        {orderTrendData.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Trends (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#9333ea"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Engineer Workload Bar Chart */}
        {engineerWorkloadData.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Engineer Workload Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engineerWorkloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="totalAssigned"
                  fill="#9333ea"
                  name="Total Assigned"
                />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Critical Items Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Critical Items
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Overdue Tasks */}
          {analytics.criticalItems.overdueTasks.length > 0 && (
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-red-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Overdue Tasks ({analytics.criticalItems.overdueTasks.length})
                </h3>
              </div>
              <div className="space-y-2">
                {analytics.criticalItems.overdueTasks
                  .slice(0, 5)
                  .map((task: any) => (
                    <div
                      key={task._id}
                      onClick={() => navigate(`/orders/${task.orderId._id}`)}
                      className="p-2 bg-white rounded cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        Order: {task.orderNumber}
                      </p>
                      <p className="text-xs text-red-600">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Urgent Orders */}
          {analytics.criticalItems.urgentOrders.length > 0 && (
            <div className="card bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Urgent Orders ({analytics.criticalItems.urgentOrders.length})
                </h3>
              </div>
              <div className="space-y-2">
                {analytics.criticalItems.urgentOrders
                  .slice(0, 5)
                  .map((order: any) => (
                    <div
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="p-2 bg-white rounded cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-orange-600 capitalize">
                        {order.status.replace("_", " ")}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Blocked Tasks */}
          {analytics.criticalItems.blockedTasks.length > 0 && (
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-yellow-900 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Blocked Tasks ({analytics.criticalItems.blockedTasks.length})
                </h3>
              </div>
              <div className="space-y-2">
                {analytics.criticalItems.blockedTasks
                  .slice(0, 5)
                  .map((task: any) => (
                    <div
                      key={task._id}
                      onClick={() => navigate(`/orders/${task.orderId._id}`)}
                      className="p-2 bg-white rounded cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        Order: {task.orderNumber}
                      </p>
                      {task.blockedBy && (
                        <p className="text-xs text-yellow-600">
                          Blocked by: {task.blockedBy}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TODO Orders */}
          {analytics.criticalItems.todoOrders.length > 0 && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Unassigned Orders ({analytics.criticalItems.todoOrders.length}
                  )
                </h3>
              </div>
              <div className="space-y-2">
                {analytics.criticalItems.todoOrders
                  .slice(0, 5)
                  .map((order: any) => (
                    <div
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="p-2 bg-white rounded cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-blue-600 capitalize">
                        Priority: {order.priority}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Pending Payments */}
          {analytics.criticalItems.pendingPayments.length > 0 && (
            <div className="card bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pending Payments (
                  {analytics.criticalItems.pendingPayments.length})
                </h3>
              </div>
              <div className="space-y-2">
                {analytics.criticalItems.pendingPayments
                  .slice(0, 5)
                  .map((order: any) => (
                    <div
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="p-2 bg-white rounded cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-purple-600 font-semibold">
                        ₹{order.balancePayment.toLocaleString()} pending
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popular Services */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Popular Services
        </h3>
        <div className="space-y-3">
          {analytics.popularServices.slice(0, 5).map((item, index) => (
            <div
              key={item._id.serviceTypeId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {item._id.serviceTypeName}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
