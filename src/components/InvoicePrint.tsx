import React from 'react';

interface InvoiceItem {
  serviceTypeName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxBreakdown: {
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  };
  totalTax: number;
  roundOff: number;
  finalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
}

interface InvoicePrintProps {
  invoice: InvoiceData;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gstin?: string;
  };
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ invoice, companyInfo }) => {
  const defaultCompanyInfo = {
    name: 'Your Company Name',
    address: '123 Business Street, City, State - 123456',
    phone: '+91 98765 43210',
    email: 'info@company.com',
    gstin: '29XXXXX1234X1Z5',
    ...companyInfo
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Print Button - Hidden in print */}
      <div className="mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="btn-primary"
        >
          Print Invoice
        </button>
      </div>

      {/* Invoice Container */}
      <div className="border border-gray-300 p-8 print:border-0">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900">{defaultCompanyInfo.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{defaultCompanyInfo.address}</p>
          <p className="text-sm text-gray-600">
            Phone: {defaultCompanyInfo.phone} | Email: {defaultCompanyInfo.email}
          </p>
          {defaultCompanyInfo.gstin && (
            <p className="text-sm text-gray-600">GSTIN: {defaultCompanyInfo.gstin}</p>
          )}
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">TAX INVOICE</h2>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <p className="text-sm"><strong>{invoice.customer.name}</strong></p>
            <p className="text-sm">{invoice.customer.phone}</p>
            {invoice.customer.email && <p className="text-sm">{invoice.customer.email}</p>}
            {invoice.customer.address && <p className="text-sm">{invoice.customer.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-sm mb-1">
              <strong>Invoice No:</strong> {invoice.invoiceNumber}
            </p>
            <p className="text-sm mb-1">
              <strong>Order No:</strong> {invoice.orderNumber}
            </p>
            <p className="text-sm mb-1">
              <strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
            </p>
            <p className="text-sm">
              <strong>Status:</strong>{' '}
              <span className={`font-semibold ${
                invoice.paymentStatus === 'paid' ? 'text-green-600' :
                invoice.paymentStatus === 'partial' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {invoice.paymentStatus.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">S.No</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Description</th>
              <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Qty</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Rate (₹)</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Disc (₹)</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Taxable (₹)</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Tax (₹)</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const taxableAmount = (item.quantity * item.unitPrice) - item.discount;
              return (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {item.serviceTypeName}
                    {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{item.unitPrice.toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{item.discount.toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{taxableAmount.toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{item.taxAmount.toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">
                    {item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-1/2 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span className="font-semibold text-red-600">-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t pt-2">
              <span>Taxable Amount:</span>
              <span className="font-semibold">₹{(invoice.subtotal - invoice.discount).toFixed(2)}</span>
            </div>
            {invoice.taxBreakdown.cgst > 0 && (
              <div className="flex justify-between text-sm">
                <span>CGST:</span>
                <span className="font-semibold">₹{invoice.taxBreakdown.cgst.toFixed(2)}</span>
              </div>
            )}
            {invoice.taxBreakdown.sgst > 0 && (
              <div className="flex justify-between text-sm">
                <span>SGST:</span>
                <span className="font-semibold">₹{invoice.taxBreakdown.sgst.toFixed(2)}</span>
              </div>
            )}
            {invoice.taxBreakdown.igst > 0 && (
              <div className="flex justify-between text-sm">
                <span>IGST:</span>
                <span className="font-semibold">₹{invoice.taxBreakdown.igst.toFixed(2)}</span>
              </div>
            )}
            {invoice.roundOff !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Round Off:</span>
                <span className="font-semibold">{invoice.roundOff > 0 ? '+' : ''}₹{invoice.roundOff.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t-2 border-gray-800 pt-2">
              <span>Total Amount:</span>
              <span>₹{invoice.finalAmount.toFixed(2)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Paid Amount:</span>
                  <span className="font-semibold text-green-600">₹{invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Balance Due:</span>
                  <span className="text-red-600">₹{invoice.balanceAmount.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <h4 className="font-semibold text-sm mb-2">Terms & Conditions:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Payment is due within 30 days of invoice date.</li>
            <li>• Please include invoice number on all correspondence.</li>
            <li>• Warranty terms as per company policy.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center">
          <p className="text-sm font-semibold">Thank you for your business!</p>
          <p className="text-xs text-gray-500 mt-1">This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:border-0, .print\\:border-0 * {
            visibility: visible;
          }
          .print\\:border-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePrint;
