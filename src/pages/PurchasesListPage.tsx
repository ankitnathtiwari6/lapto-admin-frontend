import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

interface PurchaseRecord {
  _id: string;
  purchaseNumber: string;
  purchaseDate: string;
  financialYear: string;
  month: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  vendorName: string;
  vendorGSTIN?: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  finalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  taxType: 'intrastate' | 'interstate';
  purchaseType: 'parts' | 'equipment' | 'consumables' | 'services' | 'other';
}

interface PurchasesSummary {
  totalPurchases: number;
  totalTaxableValue: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
}

const PurchasesListPage: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [summary, setSummary] = useState<PurchasesSummary>({
    totalPurchases: 0,
    totalTaxableValue: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalGST: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0
  });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [financialYear, setFinancialYear] = useState('');
  const [quarter, setQuarter] = useState('');
  const [month, setMonth] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (financialYear) params.financialYear = financialYear;
      if (quarter) params.quarter = quarter;
      if (month) params.month = month;

      const { data } = await api.get('/accounting/purchases-summary', { params });
      setPurchases(data.data.purchases);
      setSummary(data.data.summary);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchPurchases();
  };

  const handleClearFilter = () => {
    setFromDate('');
    setToDate('');
    setFinancialYear('');
    setQuarter('');
    setMonth('');
    setTimeout(() => fetchPurchases(), 100);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'badge-completed';
      case 'partial':
        return 'badge-in-progress';
      case 'unpaid':
        return 'badge-pending';
      default:
        return 'badge';
    }
  };

  const getPurchaseTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      parts: 'bg-blue-100 text-blue-700',
      equipment: 'bg-purple-100 text-purple-700',
      consumables: 'bg-green-100 text-green-700',
      services: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return badges[type] || badges.other;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Purchase Records</h1>
          <p className="text-gray-500 text-sm mt-1">Track purchases and input tax credit</p>
        </div>
        <button className="btn-secondary flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
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
          <div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Financial Year
            </label>
            <input
              type="text"
              placeholder="e.g., 2024-25"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quarter
            </label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="input-field"
            >
              <option value="">All Quarters</option>
              <option value="Q1">Q1 (Apr-Jun)</option>
              <option value="Q2">Q2 (Jul-Sep)</option>
              <option value="Q3">Q3 (Oct-Dec)</option>
              <option value="Q4">Q4 (Jan-Mar)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-field"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleApplyFilter} className="btn-primary">
            Apply Filters
          </button>
          {(fromDate || toDate || financialYear || quarter || month) && (
            <button onClick={handleClearFilter} className="btn-secondary">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalPurchases}</p>
              <p className="text-xs text-gray-500 mt-1">
                ₹{summary.totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Input Tax Credit</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{summary.totalGST.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                CGST: ₹{summary.totalCGST.toLocaleString('en-IN')} | SGST: ₹{summary.totalSGST.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{summary.totalPaid.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Pending Payment</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{summary.totalPending.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading purchase records...</p>
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Purchase #</th>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Vendor</th>
                  <th>Type</th>
                  <th>Taxable Value</th>
                  <th>GST (ITC)</th>
                  <th>Final Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase._id}>
                    <td>
                      <span className="font-semibold text-purple-600">{purchase.purchaseNumber}</span>
                    </td>
                    <td className="text-gray-600">
                      {format(new Date(purchase.purchaseDate), 'dd MMM yyyy')}
                    </td>
                    <td>
                      <p className="font-medium text-gray-900">{purchase.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(purchase.invoiceDate), 'dd MMM yyyy')}
                      </p>
                    </td>
                    <td>
                      <p className="font-medium text-gray-900">{purchase.vendorName}</p>
                      <p className="text-xs text-gray-500">
                        {purchase.vendorGSTIN || 'No GSTIN'}
                      </p>
                    </td>
                    <td>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPurchaseTypeBadge(purchase.purchaseType)}`}>
                        {purchase.purchaseType}
                      </span>
                    </td>
                    <td className="text-right font-medium">
                      ₹{purchase.taxableValue.toLocaleString('en-IN')}
                    </td>
                    <td className="text-right">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          ₹{purchase.totalGST.toLocaleString('en-IN')}
                        </p>
                        {purchase.taxType === 'intrastate' ? (
                          <p className="text-xs text-gray-500">
                            C: ₹{purchase.cgst.toFixed(2)} S: ₹{purchase.sgst.toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            I: ₹{purchase.igst.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-right font-semibold text-gray-900">
                      ₹{purchase.finalAmount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${getPaymentStatusBadge(purchase.paymentStatus)}`}>
                        {purchase.paymentStatus}
                      </span>
                      {purchase.paymentStatus !== 'paid' && (
                        <p className="text-xs text-orange-600 mt-1">
                          Due: ₹{purchase.balanceAmount.toLocaleString('en-IN')}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {purchases.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No purchase records found</p>
              <p className="text-sm text-gray-400 mt-2">
                Purchase records are created when you record vendor invoices
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchasesListPage;
