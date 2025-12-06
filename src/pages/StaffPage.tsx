import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Phone, Briefcase, CheckCircle, Clock, TrendingUp, DollarSign, Eye, X, Users, Target, Award, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface StaffMember {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: string;
  status: string;
  compensationType?: string;
  fixedSalary?: number;
  commissionRate?: number;
  commissionType?: string;
  fixedCommissionAmount?: number;
  orderStats: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalOrderValue: number;
    totalOrderCommission: number;
    totalSubTasks: number;
    completedSubTasks: number;
    pendingSubTasks: number;
    totalSubTaskCommission: number;
    totalCommission: number;
  };
}

interface Analytics {
  totalStaff: number;
  activeStaff: number;
  totalOrders: number;
  totalOrderValue: number;
  totalCommissionPaid: number;
  avgOrdersPerStaff: number;
  avgCommissionPerStaff: number;
  topPerformer?: StaffMember;
  completionRate: number;
}

interface StaffOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  device?: {
    deviceTypeName: string;
    brand: string;
    model: string;
  };
  stageName?: string;
  receivedDate?: string;
  estimatedCost: number;
  finalCost?: number;
  commission: number;
  orderCommission?: number;
  subTaskCommission?: number;
  subTasks?: Array<{
    _id: string;
    title: string;
    status: string;
    amount: number;
  }>;
}

const StaffPage: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [staffOrders, setStaffOrders] = useState<StaffOrder[]>([]);
  const [ordersSummary, setOrdersSummary] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null);
  const [selectedSubTask, setSelectedSubTask] = useState<{ task: any; order: StaffOrder } | null>(null);
  const [showAllSubTasks, setShowAllSubTasks] = useState(false);
  const [allSubTasks, setAllSubTasks] = useState<Array<{ task: any; order: StaffOrder }>>([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const calculateAnalytics = (staffData: StaffMember[]): Analytics => {
    const totalStaff = staffData.length;
    const activeStaff = staffData.filter(s => s.status === 'active').length;

    const totalOrders = staffData.reduce((sum, s) => sum + s.orderStats.totalOrders, 0);
    const totalCompletedOrders = staffData.reduce((sum, s) => sum + s.orderStats.completedOrders, 0);
    const totalOrderValue = staffData.reduce((sum, s) => sum + s.orderStats.totalOrderValue, 0);
    const totalCommissionPaid = staffData.reduce((sum, s) => sum + s.orderStats.totalCommission, 0);

    const avgOrdersPerStaff = totalStaff > 0 ? totalOrders / totalStaff : 0;
    const avgCommissionPerStaff = totalStaff > 0 ? totalCommissionPaid / totalStaff : 0;
    const completionRate = totalOrders > 0 ? (totalCompletedOrders / totalOrders) * 100 : 0;

    // Find top performer (most completed orders)
    const topPerformer = staffData.reduce((top, current) => {
      if (!top || current.orderStats.completedOrders > top.orderStats.completedOrders) {
        return current;
      }
      return top;
    }, undefined as StaffMember | undefined);

    return {
      totalStaff,
      activeStaff,
      totalOrders,
      totalOrderValue,
      totalCommissionPaid,
      avgOrdersPerStaff,
      avgCommissionPerStaff,
      topPerformer,
      completionRate
    };
  };

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/staff/with-stats');
      setStaff(data.data);
      setAnalytics(calculateAnalytics(data.data));
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffOrders = async (staffId: string) => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get(`/staff/${staffId}/orders`);
      setStaffOrders(data.data.orders);
      setOrdersSummary(data.data.summary);
      setSelectedStaff(staffId);
    } catch (error) {
      console.error('Error fetching staff orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStageBadge = (stageName: string) => {
    const normalizedName = stageName?.toLowerCase() || '';
    if (normalizedName.includes('pending')) return 'badge-pending';
    if (normalizedName.includes('assigned') || normalizedName.includes('progress') || normalizedName.includes('diagnosis')) return 'badge-in-progress';
    if (normalizedName.includes('completed') || normalizedName.includes('delivered') || normalizedName.includes('ready')) return 'badge-completed';
    if (normalizedName.includes('cancelled') || normalizedName.includes('hold')) return 'badge-cancelled';
    return 'badge';
  };

  const getCompensationBadge = (type?: string) => {
    if (!type) return 'Fixed';
    if (type === 'fixed') return 'Fixed Salary';
    if (type === 'commission') return 'Commission Only';
    if (type === 'both') return 'Fixed + Commission';
    return type;
  };

  const closeModal = () => {
    setSelectedStaff(null);
    setStaffOrders([]);
    setOrdersSummary(null);
  };

  const handleViewAllSubTasks = (staffId: string) => {
    // Collect all subtasks from the staff orders
    const tasks: Array<{ task: any; order: StaffOrder }> = [];
    staffOrders.forEach(order => {
      if (order.subTasks && order.subTasks.length > 0) {
        order.subTasks.forEach(subTask => {
          tasks.push({ task: subTask, order });
        });
      }
    });
    setAllSubTasks(tasks);
    setShowAllSubTasks(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading staff...</p>
        </div>
      </div>
    );
  }

  const selectedStaffMember = staff.find(s => s._id === selectedStaff);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">View staff members with order statistics and commission details</p>
        </div>
        <button
          onClick={() => navigate('/staff/new')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Staff */}
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Staff</p>
                <p className="text-3xl font-bold text-blue-900">{analytics.totalStaff}</p>
                <p className="text-xs text-blue-600 mt-1">{analytics.activeStaff} Active</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-purple-900">{analytics.totalOrders}</p>
                <p className="text-xs text-purple-600 mt-1">{analytics.avgOrdersPerStaff.toFixed(1)} Avg/Staff</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Order Value */}
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Total Order Value</p>
                <p className="text-3xl font-bold text-green-900">₹{(analytics.totalOrderValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-green-600 mt-1">{analytics.completionRate.toFixed(1)}% Completed</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Commission Paid */}
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Commission Paid</p>
                <p className="text-3xl font-bold text-orange-900">₹{(analytics.totalCommissionPaid / 1000).toFixed(0)}K</p>
                <p className="text-xs text-orange-600 mt-1">₹{analytics.avgCommissionPerStaff.toFixed(0)} Avg/Staff</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performer Card */}
      {analytics?.topPerformer && analytics.topPerformer.orderStats.completedOrders > 0 && (
        <div className="card bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shrink-0">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-600 mb-1">🏆 Top Performer</p>
              <p className="text-xl font-bold text-gray-900">{analytics.topPerformer.fullName}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {analytics.topPerformer.orderStats.completedOrders} Orders Completed
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  ₹{analytics.topPerformer.orderStats.totalOrderValue.toLocaleString('en-IN')} Value
                </span>
                {(analytics.topPerformer.compensationType === 'commission' || analytics.topPerformer.compensationType === 'both') && (
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-purple-600" />
                    ₹{analytics.topPerformer.orderStats.totalCommission.toLocaleString('en-IN')} Commission
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => fetchStaffOrders(analytics.topPerformer!._id)}
                className="btn-secondary text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff List - Desktop: Table, Mobile: Cards */}
      {/* Desktop Table */}
      <div className="hidden lg:block card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Sub-Tasks</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Compensation</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Commission</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((member) => (
                <tr
                  key={member._id}
                  className="hover:bg-purple-50 transition-colors cursor-pointer"
                  onClick={() => fetchStaffOrders(member._id)}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
                        <span className="text-purple-600 font-bold text-xs">
                          {member.fullName?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 text-sm">{member.fullName}</p>
                          <span className={`badge ${member.status === 'active' ? 'badge-completed' : 'badge-cancelled'} text-xs px-1.5 py-0.5`}>
                            {member.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="badge badge-in-progress text-xs px-1.5 py-0.5">
                      {member.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-sm font-bold text-gray-900">{member.orderStats.totalOrders}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="flex items-center gap-0.5 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          {member.orderStats.completedOrders}
                        </span>
                        <span className="flex items-center gap-0.5 text-orange-600">
                          <Clock className="w-3 h-3" />
                          {member.orderStats.pendingOrders}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {member.orderStats.totalSubTasks > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-sm font-bold text-gray-900">{member.orderStats.totalSubTasks}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span className="flex items-center gap-0.5 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            {member.orderStats.completedSubTasks}
                          </span>
                          <span className="flex items-center gap-0.5 text-orange-600">
                            <Clock className="w-3 h-3" />
                            {member.orderStats.pendingSubTasks}
                          </span>
                        </div>
                        {member.orderStats.totalSubTaskCommission > 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            ₹{member.orderStats.totalSubTaskCommission.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No tasks</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{member.orderStats.totalOrderValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-0.5">
                      <span className="badge badge-pending text-xs px-1.5 py-0.5">
                        {getCompensationBadge(member.compensationType)}
                      </span>
                      {(member.compensationType === 'fixed' || member.compensationType === 'both') && member.fixedSalary && (
                        <p className="text-xs text-gray-500">₹{member.fixedSalary.toLocaleString('en-IN')}/mo</p>
                      )}
                      {member.commissionType === 'percentage' && member.commissionRate && (
                        <p className="text-xs text-gray-500">{member.commissionRate}%</p>
                      )}
                      {member.commissionType === 'fixed_per_order' && member.fixedCommissionAmount && (
                        <p className="text-xs text-gray-500">₹{member.fixedCommissionAmount}/order</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {(member.compensationType === 'commission' || member.compensationType === 'both') ? (
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-green-600">
                          ₹{member.orderStats.totalCommission.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchStaffOrders(member._id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {staff.map((member) => (
          <div
            key={member._id}
            onClick={() => fetchStaffOrders(member._id)}
            className="card p-4 hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
                  <span className="text-purple-600 font-bold text-lg">
                    {member.fullName?.charAt(0) || 'S'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{member.fullName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">{member.phone}</p>
                  </div>
                </div>
              </div>
              <span className={`badge ${member.status === 'active' ? 'badge-completed' : 'badge-cancelled'} text-xs`}>
                {member.status}
              </span>
            </div>

            {/* Role */}
            <div className="mb-3">
              <span className="badge badge-in-progress text-xs">
                {member.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Orders</span>
                </div>
                <p className="text-lg font-bold text-blue-900">{member.orderStats.totalOrders}</p>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="text-green-600">{member.orderStats.completedOrders} done</span>
                  <span className="text-orange-600">{member.orderStats.pendingOrders} pending</span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Activity className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">Sub-Tasks</span>
                </div>
                <p className="text-lg font-bold text-purple-900">{member.orderStats.totalSubTasks}</p>
                {member.orderStats.totalSubTasks > 0 && (
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-green-600">{member.orderStats.completedSubTasks} done</span>
                    <span className="text-orange-600">{member.orderStats.pendingSubTasks} pending</span>
                  </div>
                )}
              </div>

              <div className="bg-green-50 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Value</span>
                </div>
                <p className="text-lg font-bold text-green-900">
                  ₹{(member.orderStats.totalOrderValue / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">Commission</span>
                </div>
                {(member.compensationType === 'commission' || member.compensationType === 'both') ? (
                  <p className="text-lg font-bold text-orange-900">
                    ₹{(member.orderStats.totalCommission / 1000).toFixed(1)}K
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">N/A</p>
                )}
              </div>
            </div>

            {/* Compensation */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Compensation</p>
                <span className="badge badge-pending text-xs">
                  {getCompensationBadge(member.compensationType)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchStaffOrders(member._id);
                }}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No staff found</p>
        </div>
      )}

      {/* Orders Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedStaffMember?.fullName}'s Orders</h2>
                <p className="text-gray-500 text-sm mt-1">{selectedStaffMember?.role.replace('_', ' ').toUpperCase()}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                {ordersSummary && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{ordersSummary.totalOrders}</p>
                    </div>
                    <div
                      onClick={() => handleViewAllSubTasks(selectedStaff!)}
                      className="bg-white rounded-lg p-4 cursor-pointer hover:bg-purple-50 hover:shadow-md transition-all active:scale-95 border-2 border-transparent hover:border-purple-200"
                    >
                      <p className="text-sm text-gray-500 mb-1 flex items-center justify-between">
                        Sub-Tasks
                        <Eye className="w-3.5 h-3.5 text-purple-600" />
                      </p>
                      <p className="text-2xl font-bold text-purple-600">{ordersSummary.totalSubTasks || 0}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ordersSummary.completedSubTasks || 0} done</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Order Value</p>
                      <p className="text-xl font-bold text-blue-600">₹{ordersSummary.totalOrderValue.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Order Commission</p>
                      <p className="text-xl font-bold text-green-600">₹{ordersSummary.totalOrderCommission?.toLocaleString('en-IN') || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Task Commission</p>
                      <p className="text-xl font-bold text-orange-600">₹{ordersSummary.totalSubTaskCommission?.toLocaleString('en-IN') || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Total Commission</p>
                      <p className="text-xl font-bold text-green-600">₹{ordersSummary.totalCommission.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )}

                {/* Orders - Desktop: Table, Mobile: Cards */}
                <div className="flex-1 overflow-auto p-4 md:p-6">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Device</th>
                          <th>Stage</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Order Commission</th>
                          <th>Task Commission</th>
                          <th>Total Commission</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffOrders.map((order) => (
                          <React.Fragment key={order._id}>
                            <tr className="hover:bg-purple-50 cursor-pointer" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}>
                              <td>
                                <span className="font-semibold text-purple-600">{order.orderNumber}</span>
                              </td>
                              <td>
                                <div>
                                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                                  <p className="text-sm text-gray-500">{order.customer.phone}</p>
                                </div>
                              </td>
                              <td>
                                {order.device ? (
                                  <div>
                                    <p className="font-medium text-gray-900">{order.device.deviceTypeName}</p>
                                    <p className="text-sm text-gray-500">
                                      {order.device.brand} {order.device.model}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Product Order</span>
                                )}
                              </td>
                              <td>
                                {order.stageName ? (
                                  <span className={`badge ${getStageBadge(order.stageName)}`}>
                                    {order.stageName}
                                  </span>
                                ) : (
                                  <span className="badge badge-pending">New</span>
                                )}
                              </td>
                              <td className="text-gray-600">
                                {order.receivedDate ? format(new Date(order.receivedDate), 'dd/MM/yy') : 'N/A'}
                              </td>
                              <td className="font-semibold text-gray-900">
                                ₹{(order.finalCost || order.estimatedCost).toLocaleString('en-IN')}
                              </td>
                              <td className="font-bold text-blue-600">
                                ₹{(order.orderCommission || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="font-bold text-orange-600">
                                ₹{(order.subTaskCommission || 0).toLocaleString('en-IN')}
                                {order.subTasks && order.subTasks.length > 0 && (
                                  <span className="text-xs text-gray-500 ml-1">({order.subTasks.length})</span>
                                )}
                              </td>
                              <td className="font-bold text-green-600">
                                ₹{order.commission.toLocaleString('en-IN')}
                              </td>
                              <td>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/orders/${order._id}`);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                              </td>
                            </tr>
                            {/* Sub-tasks rows */}
                            {order.subTasks && order.subTasks.map((subTask) => (
                              <tr
                                key={subTask._id}
                                className="bg-purple-25 hover:bg-purple-50 cursor-pointer border-l-4 border-purple-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubTask({ task: subTask, order });
                                }}
                              >
                                <td colSpan={2} className="pl-8">
                                  <div className="flex items-center gap-2">
                                    <span className="text-purple-400">└─</span>
                                    <span className="text-sm font-medium text-gray-700">{subTask.title}</span>
                                  </div>
                                </td>
                                <td colSpan={2}>
                                  <span className={`badge text-xs ${
                                    subTask.status === 'completed' ? 'badge-completed' :
                                    subTask.status === 'in_progress' ? 'badge-in-progress' :
                                    'badge-pending'
                                  }`}>
                                    {subTask.status.replace('_', ' ')}
                                  </span>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="font-bold text-orange-600">
                                  ₹{subTask.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="font-bold text-green-600">
                                  ₹{subTask.amount.toLocaleString('en-IN')}
                                </td>
                                <td></td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {staffOrders.map((order) => (
                      <div key={order._id} className="space-y-2">
                        {/* Order Card */}
                        <div
                          onClick={() => setSelectedOrder(order)}
                          className="card p-4 hover:shadow-lg transition-all cursor-pointer active:scale-[0.99] border-l-4 border-purple-500"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="font-bold text-purple-600 text-lg">{order.orderNumber}</span>
                              {order.stageName && (
                                <span className={`badge ${getStageBadge(order.stageName)} text-xs ml-2`}>
                                  {order.stageName}
                                </span>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                {order.receivedDate ? format(new Date(order.receivedDate), 'dd/MM/yy') : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Customer & Device */}
                          <div className="mb-3 space-y-1">
                            <p className="font-semibold text-gray-900">{order.customer.name}</p>
                            <p className="text-sm text-gray-500">{order.customer.phone}</p>
                            {order.device && (
                              <p className="text-sm text-gray-600">
                                {order.device.deviceTypeName} - {order.device.brand} {order.device.model}
                              </p>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-blue-50 rounded-lg p-2">
                              <p className="text-xs text-blue-600 mb-0.5">Amount</p>
                              <p className="text-lg font-bold text-blue-900">
                                ₹{(order.finalCost || order.estimatedCost).toLocaleString('en-IN')}
                              </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2">
                              <p className="text-xs text-green-600 mb-0.5">Total Commission</p>
                              <p className="text-lg font-bold text-green-900">
                                ₹{order.commission.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          {/* Commission Breakdown */}
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                            <div>
                              <span className="text-gray-500">Order: </span>
                              <span className="font-bold text-blue-600">₹{(order.orderCommission || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tasks: </span>
                              <span className="font-bold text-orange-600">₹{(order.subTaskCommission || 0).toLocaleString('en-IN')}</span>
                              {order.subTasks && order.subTasks.length > 0 && (
                                <span className="text-gray-400 ml-1">({order.subTasks.length})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sub-tasks */}
                        {order.subTasks && order.subTasks.length > 0 && (
                          <div className="ml-4 space-y-2">
                            {order.subTasks.map((subTask) => (
                              <div
                                key={subTask._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubTask({ task: subTask, order });
                                }}
                                className="card p-3 bg-purple-50 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] border-l-2 border-purple-400"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-purple-400 text-xs">└─</span>
                                      <p className="font-medium text-gray-900 text-sm">{subTask.title}</p>
                                    </div>
                                    <span className={`badge text-xs ${
                                      subTask.status === 'completed' ? 'badge-completed' :
                                      subTask.status === 'in_progress' ? 'badge-in-progress' :
                                      'badge-pending'
                                    }`}>
                                      {subTask.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-orange-600">
                                      ₹{subTask.amount.toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {staffOrders.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No orders assigned to this staff member</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <p className="text-sm text-purple-600 font-semibold mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Status & Date */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  {selectedOrder.stageName ? (
                    <span className={`badge ${getStageBadge(selectedOrder.stageName)}`}>
                      {selectedOrder.stageName}
                    </span>
                  ) : (
                    <span className="badge badge-pending">New</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {selectedOrder.receivedDate ? format(new Date(selectedOrder.receivedDate), 'dd MMM yyyy') : 'N/A'}
                </p>
              </div>

              {/* Customer Info */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Customer</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-gray-900">{selectedOrder.customer.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-600">{selectedOrder.customer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              {selectedOrder.device && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Device</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-semibold text-gray-900">{selectedOrder.device.deviceTypeName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedOrder.device.brand} {selectedOrder.device.model}
                    </p>
                  </div>
                </div>
              )}

              {/* Amounts */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pricing</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 mb-1">Order Amount</p>
                    <p className="text-xl font-bold text-blue-900">
                      ₹{(selectedOrder.finalCost || selectedOrder.estimatedCost).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 mb-1">Total Commission</p>
                    <p className="text-xl font-bold text-green-900">
                      ₹{selectedOrder.commission.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Commission Breakdown */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Commission Breakdown</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Order Commission</span>
                    <span className="font-bold text-blue-600">
                      ₹{(selectedOrder.orderCommission || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Task Commission
                      {selectedOrder.subTasks && selectedOrder.subTasks.length > 0 && (
                        <span className="text-xs text-gray-400 ml-1">({selectedOrder.subTasks.length} tasks)</span>
                      )}
                    </span>
                    <span className="font-bold text-orange-600">
                      ₹{(selectedOrder.subTaskCommission || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-green-600 text-lg">
                      ₹{selectedOrder.commission.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-tasks */}
              {selectedOrder.subTasks && selectedOrder.subTasks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Sub-Tasks</p>
                  <div className="space-y-2">
                    {selectedOrder.subTasks.map((subTask) => (
                      <div
                        key={subTask._id}
                        onClick={() => setSelectedSubTask({ task: subTask, order: selectedOrder })}
                        className="bg-purple-50 rounded-lg p-3 hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{subTask.title}</p>
                            <span className={`badge text-xs mt-1 ${
                              subTask.status === 'completed' ? 'badge-completed' :
                              subTask.status === 'in_progress' ? 'badge-in-progress' :
                              'badge-pending'
                            }`}>
                              {subTask.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="font-bold text-orange-600">
                            ₹{subTask.amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => navigate(`/orders/${selectedOrder._id}`)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Full Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtask Detail Modal */}
      {selectedSubTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sub-Task Details</h3>
                <p className="text-sm text-gray-500 mt-0.5">Assigned to {selectedStaffMember?.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedSubTask(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Task Info */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Task</p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="font-bold text-gray-900 text-lg mb-2">{selectedSubTask.task.title}</p>
                  <span className={`badge ${
                    selectedSubTask.task.status === 'completed' ? 'badge-completed' :
                    selectedSubTask.task.status === 'in_progress' ? 'badge-in-progress' :
                    'badge-pending'
                  }`}>
                    {selectedSubTask.task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Commission */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Commission</p>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-orange-900">
                    ₹{selectedSubTask.task.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Associated Order */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Associated Order</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Number</p>
                    <p className="font-bold text-purple-600 text-lg">{selectedSubTask.order.orderNumber}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="font-medium text-gray-900">{selectedSubTask.order.customer.name}</p>
                      <p className="text-xs text-gray-500">{selectedSubTask.order.customer.phone}</p>
                    </div>
                    {selectedSubTask.order.device && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Device</p>
                        <p className="font-medium text-gray-900 text-sm">{selectedSubTask.order.device.deviceTypeName}</p>
                        <p className="text-xs text-gray-500">
                          {selectedSubTask.order.device.brand} {selectedSubTask.order.device.model}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedSubTask.order.receivedDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Received Date</p>
                      <p className="text-sm text-gray-700">
                        {format(new Date(selectedSubTask.order.receivedDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  )}

                  {selectedSubTask.order.stageName && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Order Status</p>
                      <span className={`badge ${getStageBadge(selectedSubTask.order.stageName)}`}>
                        {selectedSubTask.order.stageName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setSelectedSubTask(null);
                    setSelectedOrder(selectedSubTask.order);
                  }}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  View Full Order Details
                </button>
                <button
                  onClick={() => navigate(`/orders/${selectedSubTask.order._id}`)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Open Order Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Sub-Tasks Modal */}
      {showAllSubTasks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">All Sub-Tasks</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedStaffMember?.fullName} • {allSubTasks.length} total tasks
                </p>
              </div>
              <button
                onClick={() => setShowAllSubTasks(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-6">
              {allSubTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No sub-tasks assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allSubTasks.map(({ task, order }, index) => (
                    <div
                      key={`${order._id}-${task._id}-${index}`}
                      onClick={() => {
                        setShowAllSubTasks(false);
                        setSelectedSubTask({ task, order });
                      }}
                      className="card p-4 hover:shadow-lg transition-all cursor-pointer active:scale-[0.99] border-l-4 border-purple-500"
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
                          <span className={`badge text-xs ${
                            task.status === 'completed' ? 'badge-completed' :
                            task.status === 'in_progress' ? 'badge-in-progress' :
                            'badge-pending'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">
                            ₹{task.amount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500">Commission</p>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Associated Order</p>
                          <p className="font-semibold text-purple-600">{order.orderNumber}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Customer</p>
                            <p className="font-medium text-gray-900 text-sm">{order.customer.name}</p>
                            <p className="text-xs text-gray-500">{order.customer.phone}</p>
                          </div>
                          {order.device && (
                            <div>
                              <p className="text-xs text-gray-500">Device</p>
                              <p className="font-medium text-gray-900 text-sm">{order.device.deviceTypeName}</p>
                              <p className="text-xs text-gray-500">
                                {order.device.brand} {order.device.model}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          {order.receivedDate && (
                            <div>
                              <p className="text-xs text-gray-500">Assigned Date</p>
                              <p className="text-xs text-gray-700 font-medium">
                                {format(new Date(order.receivedDate), 'dd MMM yyyy')}
                              </p>
                            </div>
                          )}
                          {order.stageName && (
                            <span className={`badge text-xs ${getStageBadge(order.stageName)}`}>
                              {order.stageName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Click hint */}
                      <div className="flex items-center justify-end mt-3 text-purple-600 text-xs font-medium">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Click for details
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
