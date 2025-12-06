import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import type { DashboardAnalytics } from '../types';
import { Package, Users, DollarSign, TrendingUp, Calendar, MoreVertical } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/dashboard/analytics');
        setAnalytics(data.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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

  const stats = [
    {
      name: 'Total Orders',
      value: analytics.totalOrders,
      subtext: 'This Month',
      icon: Package,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Total Revenue',
      value: `₹${analytics.revenue.totalRevenue.toLocaleString()}`,
      subtext: 'Total Earnings',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      name: 'Active Engineers',
      value: analytics.activeTechnicians,
      subtext: 'Currently Working',
      icon: Users,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      name: 'Customers',
      value: analytics.totalCustomers,
      subtext: 'Total Registered',
      icon: TrendingUp,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.subtext}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700 mt-3">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Orders by Status</h2>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {analytics.ordersByStatus.map((item, index) => {
              const colors = ['bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-red-500'];
              return (
                <div key={item._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item._id ? item._id.replace('_', ' ') : 'Unknown'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Services */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Popular Services</h2>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {analytics.popularServices.slice(0, 5).map((item, index) => (
              <div key={item._id.serviceTypeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{item._id.serviceTypeName}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="card bg-gradient-to-br from-purple-600 to-purple-800 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quick Stats</h2>
            <Calendar className="w-5 h-5 opacity-80" />
          </div>
          <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-purple-200 text-sm">Pending Orders</p>
              <p className="text-3xl font-bold mt-1">
                {analytics.ordersByStatus.find(s => s._id === 'pending')?.count || 0}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-purple-200 text-sm">In Progress</p>
              <p className="text-3xl font-bold mt-1">
                {analytics.ordersByStatus.find(s => s._id === 'in_progress')?.count || 0}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-purple-200 text-sm">Completed Today</p>
              <p className="text-3xl font-bold mt-1">
                {analytics.ordersByStatus.find(s => s._id === 'completed')?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technician Performance Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Top Engineers</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name"
                className="h-9 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
              <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Engineer</th>
                <th>Orders</th>
                <th>Avg. Time (days)</th>
                <th>Revenue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics.technicianPerformance.slice(0, 5).map((tech) => (
                <tr key={tech._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">
                          {tech.technicianName?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <span className="font-medium">{tech.technicianName}</span>
                    </div>
                  </td>
                  <td>{tech.totalOrders}</td>
                  <td>{tech.avgCompletionTime.toFixed(1)}</td>
                  <td className="font-semibold text-green-600">₹{tech.totalRevenue.toLocaleString()}</td>
                  <td>
                    <button className="action-btn">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
