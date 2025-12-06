import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Filter, Download } from "lucide-react";
import { format } from "date-fns";

interface SaleRecord {
  _id: string;
  saleNumber: string;
  saleDate: string;
  financialYear: string;
  month: number;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  customerName: string;
  customerGSTIN?: string;
  invoiceNumber: string;
  orderNumber: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  finalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  taxType: "intrastate" | "interstate";
  gstRate: number;
}

interface SalesSummary {
  totalSales: number;
  totalTaxableValue: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
}

const SalesListPage: React.FC = () => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [summary, setSummary] = useState<SalesSummary>({
    totalSales: 0,
    totalTaxableValue: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalGST: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [quarter, setQuarter] = useState("");
  const [month, setMonth] = useState("");

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (financialYear) params.financialYear = financialYear;
      if (quarter) params.quarter = quarter;
      if (month) params.month = month;

      const { data } = await api.get("/accounting/sales-summary", { params });
      setSales(data.data.sales);
      setSummary(data.data.summary);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchSales();
  };

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    setFinancialYear("");
    setQuarter("");
    setMonth("");
    setTimeout(() => fetchSales(), 100);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "badge-completed";
      case "partial":
        return "badge-in-progress";
      case "unpaid":
        return "badge-pending";
      default:
        return "badge";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Sales Records
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            GST compliant sales transactions
          </p>
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
                  {new Date(2024, m - 1).toLocaleString("default", {
                    month: "long",
                  })}
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
              <p className="text-sm font-medium text-purple-600 mb-1">
                Total Sales
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalSales}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ₹{summary.totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">
                Total GST Collected
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{summary.totalGST.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                CGST: ₹{summary.totalCGST.toLocaleString("en-IN")} | SGST: ₹
                {summary.totalSGST.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">
                Amount Received
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{summary.totalPaid.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">
                Pending Amount
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{summary.totalPending.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading sales records...</p>
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale #</th>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>GSTIN</th>
                  <th>Taxable Value</th>
                  <th>GST</th>
                  <th>Final Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>
                      <span className="font-semibold text-purple-600">
                        {sale.saleNumber}
                      </span>
                    </td>
                    <td className="text-gray-600">
                      {format(new Date(sale.saleDate), "dd MMM yyyy")}
                    </td>
                    <td>
                      <span className="font-medium text-gray-900">
                        {sale.invoiceNumber}
                      </span>
                      <p className="text-xs text-gray-500">
                        {sale.orderNumber}
                      </p>
                    </td>
                    <td>
                      <p className="font-medium text-gray-900">
                        {sale.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.taxType === "intrastate"
                          ? "Intrastate"
                          : "Interstate"}{" "}
                        • {sale.gstRate}%
                      </p>
                    </td>
                    <td className="text-sm text-gray-600">
                      {sale.customerGSTIN || "-"}
                    </td>
                    <td className="text-right font-medium">
                      ₹{sale.taxableValue.toLocaleString("en-IN")}
                    </td>
                    <td className="text-right">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          ₹{sale.totalGST.toLocaleString("en-IN")}
                        </p>
                        {sale.taxType === "intrastate" ? (
                          <p className="text-xs text-gray-500">
                            C: ₹{sale.cgst.toFixed(2)} S: ₹
                            {sale.sgst.toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            I: ₹{sale.igst.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-right font-semibold text-gray-900">
                      ₹{sale.finalAmount.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span
                        className={`badge ${getPaymentStatusBadge(
                          sale.paymentStatus
                        )}`}
                      >
                        {sale.paymentStatus}
                      </span>
                      {sale.paymentStatus !== "paid" && (
                        <p className="text-xs text-orange-600 mt-1">
                          Due: ₹{sale.balanceAmount.toLocaleString("en-IN")}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sales.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No sales records found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesListPage;
