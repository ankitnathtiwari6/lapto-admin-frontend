import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { ServiceOrder } from '../types';
import { Plus, Search, Eye, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workStatusFilter, setWorkStatusFilter] = useState<'all' | 'todo' | 'pending' | 'completed'>('all');

  // Statistics state
  const [stats, setStats] = useState({
    totalOrderValue: 0,
    totalPaymentReceived: 0,
    totalPending: 0,
    totalCompletedValue: 0
  });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [workStatusFilter]);

  const fetchOrders = async () => {
    try {
      const params: any = { search };
      if (workStatusFilter !== 'all') {
        params.workStatus = workStatusFilter;
      }

      const { data } = await api.get('/orders', { params });
      setOrders(data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const { data } = await api.get('/orders/stats', { params });
      setStats({
        totalOrderValue: data.data.totalOrderValue || 0,
        totalPaymentReceived: data.data.totalPaymentReceived || 0,
        totalPending: data.data.totalPending || 0,
        totalCompletedValue: data.data.totalCompletedValue || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApplyFilter = () => {
    fetchStats();
  };

  const getStageBadge = (stageName: string) => {
    const normalizedName = stageName.toLowerCase();
    if (normalizedName.includes('pending')) return 'badge-pending';
    if (normalizedName.includes('assigned') || normalizedName.includes('progress') || normalizedName.includes('diagnosis')) return 'badge-in-progress';
    if (normalizedName.includes('completed') || normalizedName.includes('delivered') || normalizedName.includes('ready')) return 'badge-completed';
    if (normalizedName.includes('cancelled') || normalizedName.includes('hold')) return 'badge-cancelled';
    return 'badge';
  };

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      alert('Order deleted successfully!');
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your repair orders</p>
        </div>
        <Link to="/orders/new" className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          New Order
        </Link>
      </div>

      {/* Date Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field"
            />
          </div>
          <button onClick={handleApplyFilter} className="btn-primary whitespace-nowrap">
            Apply Filter
          </button>
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                fetchStats();
              }}
              className="btn-secondary whitespace-nowrap"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Order Value */}
        <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Total Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.totalOrderValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Payment Received */}
        <div className="card bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Payment Received</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.totalPaymentReceived.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Pending */}
        <div className="card bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.totalPending.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Completed Value */}
        <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Completed Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.totalCompletedValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Work Status Filter Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          <button
            onClick={() => setWorkStatusFilter('all')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              workStatusFilter === 'all'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setWorkStatusFilter('todo')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              workStatusFilter === 'todo'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            To Do
          </button>
          <button
            onClick={() => setWorkStatusFilter('pending')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              workStatusFilter === 'pending'
                ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setWorkStatusFilter('completed')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              workStatusFilter === 'completed'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Search Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <button onClick={fetchOrders} className="btn-primary">
            Search
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" className="checkbox" />
                  </th>
                  <th>Order #</th>
                  <th>Voucher #</th>
                  <th>Customer</th>
                  <th>Device</th>
                  <th>Stage</th>
                  <th>Technician</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <input type="checkbox" className="checkbox" />
                    </td>
                    <td>
                      <span className="font-semibold text-purple-600">{order.orderNumber}</span>
                    </td>
                    <td>
                      {order.voucherNo ? (
                        <span className="text-gray-700">{order.voucherNo}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
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
                    <td>
                      {order.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-xs">
                              {order.assignedTo.userName?.charAt(0) || 'E'}
                            </span>
                          </div>
                          <span className="text-sm">{order.assignedTo.userName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="text-gray-600">
                      {order.receivedDate ? format(new Date(order.receivedDate), 'dd/MM/yy') : 'N/A'}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/orders/${order._id}`}
                          className="action-btn"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => navigate(`/orders/${order._id}/edit`)}
                          className="action-btn"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order._id, order.orderNumber)}
                          className="action-btn hover:!text-red-500 hover:!bg-red-50"
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

          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
