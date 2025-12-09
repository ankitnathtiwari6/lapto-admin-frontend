import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { ServiceOrder, User, OrderActivityLog, Stage } from '../types';
import subTaskService, { type SubTask } from '../services/subTaskService';
import { ArrowLeft, User as UserIcon, Smartphone, CreditCard, FileText, Plus, Edit, CheckCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import ActivityLog from '../components/ActivityLog';
import WorkAssignmentPipeline from '../components/WorkAssignmentPipeline';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'bank_transfer'>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [addingPayment, setAddingPayment] = useState(false);

  // Sub-task states
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);

  // Activity log state
  const [activityLogs, setActivityLogs] = useState<OrderActivityLog[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    fetchOrder();
    fetchUsers();
    fetchStages();
    if (id) {
      fetchSubTasks();
      fetchActivityLogs();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch staff from the current company - auth middleware filters by company automatically
      const { data } = await api.get('/staff', {
        params: {
          status: 'active',
          role: 'engineer,admin,super_admin'
        }
      });
      setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStages = async () => {
    try {
      const { data } = await api.get('/stages');
      setStages(data.data);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechnician) return;

    try {
      await api.put(`/orders/${id}/assign`, {
        technicianId: selectedTechnician,
        notes: `Assigned to user`,
      });
      alert('User assigned successfully! Order stage updated automatically.');
      fetchOrder();
      fetchActivityLogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error assigning user');
    }
  };

  const handleUpdateStage = async () => {
    if (!selectedStage) {
      alert('Please select a stage');
      return;
    }

    setUpdatingStage(true);
    try {
      await api.put(`/orders/${id}/stage`, {
        stageId: selectedStage,
        notes: 'Status updated manually'
      });
      alert('Order status updated successfully!');
      setSelectedStage('');
      fetchOrder();
      fetchActivityLogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating status');
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }

    setUpdatingStatus(true);
    try {
      await api.put(`/orders/${id}/status`, {
        status: selectedStatus,
        notes: 'Order status updated manually'
      });
      alert('Order status updated successfully!');
      setSelectedStatus('');
      fetchOrder();
      fetchActivityLogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    setAddingPayment(true);
    try {
      await api.post(`/orders/${id}/payment`, {
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        notes: paymentNotes
      });

      alert('Payment added successfully!');
      setShowAddPayment(false);
      setPaymentAmount('');
      setPaymentNotes('');
      fetchOrder();
      fetchActivityLogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding payment');
    } finally {
      setAddingPayment(false);
    }
  };

  // Sub-task functions
  const fetchSubTasks = async () => {
    try {
      const response = await subTaskService.getByOrder(id!);
      setSubTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching sub-tasks:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      setLoadingActivities(true);
      const { data } = await api.get(`/activity-logs/order/${id}`);
      setActivityLogs(data.data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const getStageBadge = (stageName: string) => {
    const normalizedName = stageName.toLowerCase();
    if (normalizedName.includes('pending')) return 'badge-pending';
    if (normalizedName.includes('assigned') || normalizedName.includes('progress') || normalizedName.includes('diagnosis')) return 'badge-in-progress';
    if (normalizedName.includes('completed') || normalizedName.includes('delivered') || normalizedName.includes('ready')) return 'badge-completed';
    if (normalizedName.includes('cancelled') || normalizedName.includes('hold')) return 'badge-cancelled';
    return 'badge-pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-completed';
      case 'in_progress':
        return 'badge-in-progress';
      case 'pending':
        return 'badge-pending';
      case 'cancelled':
        return 'badge-cancelled';
      case 'returned':
        return 'badge-cancelled';
      case 'reopened':
        return 'badge-in-progress';
      default:
        return 'badge-pending';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {order.voucherNo || order.orderNumber}
            </h1>
            {order.stageName && (
              <span className={`badge ${getStageBadge(order.stageName)}`}>
                {order.stageName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-500 text-sm">
              Created on {order.receivedDate ? format(new Date(order.receivedDate), 'MMM dd, yyyy') : 'N/A'}
            </p>
            <p className="text-gray-500 text-sm">
              • Order: <span className="font-medium text-gray-700">{order.orderNumber}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/orders/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Order Information</h3>
              <button
                onClick={() => navigate(`/orders/${id}/edit`)}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-900">{order.customer.name}</p>
                  <p className="text-sm text-gray-600">{order.customer.phone}</p>
                </div>
              </div>
              {order.device && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Device</p>
                    <p className="font-semibold text-gray-900">{order.device.deviceTypeName}</p>
                    <p className="text-sm text-gray-600">{order.device.brand} {order.device.model}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Problem Description */}
          {order.problemDescription && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">Problem Description</h3>
                <button
                  onClick={() => navigate(`/orders/${id}/edit`)}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
              <p className="text-gray-600 leading-relaxed">{order.problemDescription}</p>
            </div>
          )}

          {/* Activity Log */}
          <ActivityLog activities={activityLogs} loading={loadingActivities} />

          {/* Work Assignment Pipeline */}
          <WorkAssignmentPipeline
            orderId={id!}
            orderNumber={order.voucherNo || order.orderNumber}
            customerName={order.customer.name}
            stageName={order.stageName}
            assignedToName={order.assignedTo?.userName}
            subTasks={subTasks}
            users={users}
            onUpdate={() => {
              fetchSubTasks();
              fetchOrder();
              fetchActivityLogs();
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-semibold text-gray-900">Update Status</h3>
            </div>
            {order.stageName && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 mb-1">Current Status</p>
                <span className={`badge ${getStageBadge(order.stageName)}`}>
                  {order.stageName}
                </span>
              </div>
            )}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="input-field mb-3"
            >
              <option value="">Select New Status</option>
              {stages.map((stage) => (
                <option key={stage._id} value={stage._id}>
                  {stage.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateStage}
              disabled={updatingStage || !selectedStage}
              className="btn-primary w-full"
            >
              {updatingStage ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          {/* Update Order Status */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-900">Order Status</h3>
            </div>
            {order.status && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 mb-1">Current Status</p>
                <span className={`badge ${getStatusBadge(order.status)}`}>
                  {order.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            )}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field mb-3"
            >
              <option value="">Select New Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
              <option value="reopened">Reopened</option>
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={updatingStatus || !selectedStatus}
              className="btn-primary w-full"
            >
              {updatingStatus ? 'Updating...' : 'Update Order Status'}
            </button>
          </div>

          {/* Assign User */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Assign User</h3>
            {order.assignedTo && (
              <div className="mb-4 p-3 bg-purple-50 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">
                    {order.assignedTo.userName?.charAt(0) || 'T'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-purple-600">Currently Assigned</p>
                  <p className="font-medium text-gray-900">{order.assignedTo.userName}</p>
                </div>
              </div>
            )}
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="input-field mb-3"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullName} ({user.role})
                </option>
              ))}
            </select>
            <button onClick={handleAssignTechnician} className="btn-primary w-full">
              Assign
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Stage updates automatically based on sub-task progress
            </p>
          </div>

          {/* Payment Info */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-semibold text-gray-900">Payment</h3>
              </div>
              <button
                onClick={() => setShowAddPayment(!showAddPayment)}
                className="btn-secondary text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Payment
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Estimated Cost</span>
                <span className="font-semibold text-gray-900">₹{order.estimatedCost}</span>
              </div>
              {order.finalCost && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Final Cost</span>
                  <span className="font-semibold text-gray-900">₹{order.finalCost}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Advance Paid</span>
                <span className="font-semibold text-green-600">₹{order.advancePayment}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Balance Due</span>
                <span className="font-semibold text-orange-600">₹{order.balancePayment}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="font-medium text-gray-700">Status</span>
                <span className={`badge ${
                  order.paymentStatus === 'paid' ? 'badge-completed' :
                  order.paymentStatus === 'partial' ? 'badge-in-progress' :
                  'badge-pending'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Add Payment Form */}
            {showAddPayment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Add New Payment</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="input-field"
                    placeholder="Enter amount"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Add payment notes"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPayment}
                    disabled={addingPayment}
                    className="btn-primary flex-1"
                  >
                    {addingPayment ? 'Processing...' : 'Add Payment'}
                  </button>
                  <button
                    onClick={() => setShowAddPayment(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Payment Details Button */}
            <button
              onClick={() => navigate(`/orders/${id}/invoices`)}
              className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Payment Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
