import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import type { ServiceOrder } from '../types';
import { Plus, Search, Eye, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { workStatus } = useParams<{ workStatus?: string }>();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const workStatusFilter = (workStatus || 'all') as 'all' | 'todo' | 'pending' | 'completed';

  useEffect(() => {
    fetchOrders();
  }, [workStatusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
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
      {/* Loading Bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-purple-600 animate-pulse" style={{
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
        </div>
      )}

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

      {/* Work Status Filter Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          <button
            onClick={() => navigate('/orders')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              workStatusFilter === 'all'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => navigate('/orders/status/todo')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              workStatusFilter === 'todo'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            To Do
          </button>
          <button
            onClick={() => navigate('/orders/status/pending')}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
              workStatusFilter === 'pending'
                ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => navigate('/orders/status/completed')}
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
                  <th>Assigned Engineer</th>
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
                          <p className="font-medium text-gray-900">
                            {order.device.deviceTypeName} - {order.device.model}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.device.brand}
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
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-700 font-semibold text-xs">
                              {order.assignedTo.userName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EN'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.assignedTo.userName}</p>
                            <p className="text-xs text-gray-500">Engineer</p>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Not Assigned
                        </span>
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

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default OrdersPage;
