import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Calendar,
  User as UserIcon,
  Phone,
  Filter,
  X,
  Eye,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import type { Invoice } from '../types';

interface PaymentStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  totalInvoices: number;
}

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PaymentStats>({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalInvoices: 0
  });

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, fromDate, toDate, paymentStatus, searchQuery]);

  const fetchInvoices = async () => {
    try {
      // Fetch all invoices (not deleted)
      const response = await api.get('/invoices');
      const invoicesData = response.data.data || [];

      // Filter out deleted invoices on client side if needed
      const activeInvoices = invoicesData.filter((inv: Invoice) => !inv.isDeleted);

      setInvoices(activeInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter(inv =>
        new Date(inv.invoiceDate) >= new Date(fromDate)
      );
    }
    if (toDate) {
      filtered = filtered.filter(inv =>
        new Date(inv.invoiceDate) <= new Date(toDate)
      );
    }

    // Filter by payment status
    if (paymentStatus !== 'all') {
      filtered = filtered.filter(inv => inv.paymentStatus === paymentStatus);
    }

    // Filter by search query (customer name, invoice number, order number)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.customer.name.toLowerCase().includes(query) ||
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.orderNumber.toLowerCase().includes(query)
      );
    }

    setFilteredInvoices(filtered);

    // Calculate stats
    const totalAmount = filtered.reduce((sum, inv) => sum + inv.finalAmount, 0);
    const paidAmount = filtered.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pendingAmount = filtered.reduce((sum, inv) => sum + inv.balanceAmount, 0);

    setStats({
      totalAmount,
      paidAmount,
      pendingAmount,
      totalInvoices: filtered.length
    });
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setPaymentStatus('all');
    setSearchQuery('');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/orders/${invoice.orderId}/invoices`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and track all payment transactions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">{stats.totalInvoices} invoices</p>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.paidAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {((stats.paidAmount / stats.totalAmount) * 100 || 0).toFixed(1)}% collected
          </p>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.pendingAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {((stats.pendingAmount / stats.totalAmount) * 100 || 0).toFixed(1)}% pending
          </p>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalInvoices}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {invoices.length} total records
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {(fromDate || toDate || paymentStatus !== 'all' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Customer, Invoice, Order..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Records ({filteredInvoices.length})
          </h3>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="card text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No payment records found</p>
            {(fromDate || toDate || paymentStatus !== 'all' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice._id} className="card hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Receipt className="w-4 h-4 text-purple-600" />
                      <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <span className={`badge text-xs ${
                    invoice.paymentStatus === 'paid' ? 'badge-completed' :
                    invoice.paymentStatus === 'partial' ? 'badge-in-progress' :
                    'badge-pending'
                  }`}>
                    {invoice.paymentStatus === 'paid' && <CheckCircle className="w-3 h-3" />}
                    {invoice.paymentStatus === 'partial' && <Clock className="w-3 h-3" />}
                    {invoice.paymentStatus === 'unpaid' && <AlertCircle className="w-3 h-3" />}
                    {invoice.paymentStatus}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-start gap-2 mb-2">
                    <UserIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{invoice.customer.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {invoice.customer.phone}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Order: {invoice.orderNumber}</p>
                </div>

                {/* Payment Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-gray-900">₹{invoice.finalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid Amount:</span>
                    <span className="font-semibold text-green-600">₹{invoice.paidAmount}</span>
                  </div>
                  {invoice.balanceAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Balance Due:</span>
                      <span className="font-semibold text-orange-600">₹{invoice.balanceAmount}</span>
                    </div>
                  )}
                </div>

                {/* GST Details */}
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-1">GST Breakdown:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {invoice.taxBreakdown.cgst > 0 && (
                      <div>
                        <span className="text-gray-500">CGST:</span>
                        <span className="ml-1 font-medium text-gray-900">₹{invoice.taxBreakdown.cgst.toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.taxBreakdown.sgst > 0 && (
                      <div>
                        <span className="text-gray-500">SGST:</span>
                        <span className="ml-1 font-medium text-gray-900">₹{invoice.taxBreakdown.sgst.toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.taxBreakdown.igst > 0 && (
                      <div>
                        <span className="text-gray-500">IGST:</span>
                        <span className="ml-1 font-medium text-gray-900">₹{invoice.taxBreakdown.igst.toFixed(2)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Total Tax:</span>
                      <span className="ml-1 font-medium text-gray-900">₹{invoice.totalTax.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleViewInvoice(invoice)}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
