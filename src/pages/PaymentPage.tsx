import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Download,
  Mail,
  ArrowLeft,
  Calendar,
  CheckCircle,
  AlertCircle,
  Building2,
  Save,
  Eye,
  User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import api from '../lib/api';
import type { Invoice, ServiceOrder, CompanySettings } from '../types';

interface ServiceItem {
  serviceTypeId: string;
  serviceTypeName: string;
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
}

// Custom WhatsApp Icon Component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');

  // Editable service items
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Payment details
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'bank_transfer'>('cash');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  // GST details
  const [gstRate, setGstRate] = useState(18);
  const [taxType, setTaxType] = useState<'intrastate' | 'interstate'>('intrastate');

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const fetchData = async () => {
    try {
      const [orderRes, invoicesRes, companyRes] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get(`/invoices/order/${orderId}`),
        api.get('/company-settings')
      ]);

      const fetchedOrder = orderRes.data.data;
      setOrder(fetchedOrder);
      // Get the first (and only) invoice for this order
      const invoicesData = invoicesRes.data.data || [];
      setInvoice(invoicesData.length > 0 ? invoicesData[0] : null);
      setCompanySettings(companyRes.data.data);

      // Initialize customer details
      setCustomerName(fetchedOrder.customer.name);
      setCustomerPhone(fetchedOrder.customer.phone);
      setCustomerEmail(fetchedOrder.customer.email || '');
      setCustomerAddress(fetchedOrder.customer.address || '');
      setCustomerGSTIN('');

      // Initialize services
      setServices(fetchedOrder.services.map((s: any) => ({
        serviceTypeId: s.serviceTypeId,
        serviceTypeName: s.serviceTypeName,
        estimatedCost: s.estimatedCost,
        actualCost: s.actualCost || s.estimatedCost,
        notes: s.notes
      })));

      // Initialize payment details
      setPaidAmount(fetchedOrder.advancePayment);

      if (companyRes.data.data?.defaultGstRate) {
        setGstRate(companyRes.data.data.defaultGstRate);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    // Calculate subtotal from services
    const subtotal = services.reduce((sum, service) => sum + (service.actualCost || 0), 0);

    // Calculate discount
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }

    const taxableAmount = subtotal - discountAmount;

    // Calculate GST
    let cgst = 0, sgst = 0, igst = 0;
    if (taxType === 'intrastate') {
      cgst = (taxableAmount * gstRate) / 200;
      sgst = (taxableAmount * gstRate) / 200;
    } else {
      igst = (taxableAmount * gstRate) / 100;
    }

    const totalTax = cgst + sgst + igst;
    const totalAmount = taxableAmount + totalTax;
    const roundOff = Math.round(totalAmount) - totalAmount;
    const finalAmount = Math.round(totalAmount);
    const balanceAmount = finalAmount - paidAmount;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      cgst,
      sgst,
      igst,
      totalTax,
      totalAmount,
      roundOff,
      finalAmount,
      paidAmount,
      balanceAmount
    };
  };

  const handleUpdateServiceCost = (index: number, cost: number) => {
    const updated = [...services];
    updated[index].actualCost = cost;
    setServices(updated);
  };

  const handleSaveAndGenerateInvoice = async () => {
    if (!companySettings) {
      alert('Please configure company settings first');
      navigate('/settings');
      return;
    }

    const totals = calculateTotals();

    setSaving(true);
    try {
      // Update order with new details (without payment - we'll handle that separately)
      await api.put(`/orders/${orderId}`, {
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress
        },
        services: services.map(s => ({
          serviceTypeId: s.serviceTypeId,
          serviceTypeName: s.serviceTypeName,
          estimatedCost: s.estimatedCost,
          actualCost: s.actualCost,
          notes: s.notes
        })),
        finalCost: totals.finalAmount
      });

      // Generate/update invoice
      const invoiceResponse = await api.post('/invoices/generate', {
        orderId,
        gstRate,
        taxType,
        discount: totals.discountAmount,
        customerDetails: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress,
          gstin: customerGSTIN
        }
      });

      const generatedInvoice = invoiceResponse.data.data;

      // If there's a new payment amount (greater than current), record the payment
      const currentPaidAmount = order?.advancePayment || 0;
      const paymentDifference = paidAmount - currentPaidAmount;

      if (paymentDifference > 0 && generatedInvoice) {
        // Record the payment properly through Payment API
        await api.post('/payments', {
          invoiceId: generatedInvoice._id,
          amount: paymentDifference,
          paymentMethod: paymentMethod,
          paymentDate: new Date().toISOString(),
          notes: 'Payment recorded from invoice generation'
        });
      }

      alert('Invoice generated and payment recorded successfully!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating payment');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadInvoice = (invoiceToDownload: Invoice) => {
    if (!companySettings) {
      alert('Company settings not available');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Company Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(companySettings.companyName, pageWidth / 2, yPos, { align: 'center' });

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(companySettings.address, pageWidth / 2, yPos, { align: 'center' });

      yPos += 5;
      doc.text(`${companySettings.city}, ${companySettings.state} - ${companySettings.pincode}`, pageWidth / 2, yPos, { align: 'center' });

      yPos += 5;
      doc.text(`Phone: ${companySettings.phone}`, pageWidth / 2, yPos, { align: 'center' });

      if (companySettings.email) {
        yPos += 5;
        doc.text(`Email: ${companySettings.email}`, pageWidth / 2, yPos, { align: 'center' });
      }

      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text(`GSTIN: ${companySettings.gstin}`, pageWidth / 2, yPos, { align: 'center' });

      // Line separator
      yPos += 8;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);

      // Invoice details section
      yPos += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', pageWidth / 2, yPos, { align: 'center' });

      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Left side - Bill To
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceToDownload.customer.name, margin, yPos);
      yPos += 5;
      doc.text(invoiceToDownload.customer.phone, margin, yPos);

      if (invoiceToDownload.customer.address) {
        yPos += 5;
        const addressLines = doc.splitTextToSize(invoiceToDownload.customer.address, 80);
        doc.text(addressLines, margin, yPos);
        yPos += addressLines.length * 5;
      }

      if (invoiceToDownload.customer.gstin) {
        yPos += 5;
        doc.text(`GSTIN: ${invoiceToDownload.customer.gstin}`, margin, yPos);
      }

      // Right side - Invoice details
      const rightX = pageWidth - margin;
      let rightY = yPos - (invoiceToDownload.customer.address ? 25 : 20);

      doc.setFont('helvetica', 'bold');
      doc.text('Invoice No:', rightX - 60, rightY);
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceToDownload.invoiceNumber, rightX, rightY, { align: 'right' });

      rightY += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Order No:', rightX - 60, rightY);
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceToDownload.orderNumber, rightX, rightY, { align: 'right' });

      rightY += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Date:', rightX - 60, rightY);
      doc.setFont('helvetica', 'normal');
      doc.text(format(new Date(invoiceToDownload.invoiceDate), 'dd MMM yyyy'), rightX, rightY, { align: 'right' });

      // Items table
      yPos += 15;
      const tableHeaders = ['Service', 'Amount'];

      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(tableHeaders[0], margin + 2, yPos + 6);
      doc.text(tableHeaders[1], pageWidth - margin - 2, yPos + 6, { align: 'right' });

      yPos += 8;

      // Table rows
      doc.setFont('helvetica', 'normal');
      invoiceToDownload.items.forEach((item) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.text(item.serviceTypeName || '', margin + 2, yPos + 5);
        doc.text(`₹${item.totalAmount.toFixed(2)}`, pageWidth - margin - 2, yPos + 5, { align: 'right' });
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPos + 8, pageWidth - margin, yPos + 8);
        yPos += 8;
      });

      // Totals section
      yPos += 5;
      const totalsX = pageWidth - margin - 80;

      doc.text('Subtotal:', totalsX, yPos);
      doc.text(`₹${invoiceToDownload.subtotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });

      if (invoiceToDownload.discount > 0) {
        yPos += 6;
        doc.setTextColor(0, 128, 0);
        doc.text('Discount:', totalsX, yPos);
        doc.text(`-₹${invoiceToDownload.discount.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      }

      if (invoiceToDownload.taxBreakdown.cgst > 0) {
        yPos += 6;
        doc.text('CGST:', totalsX, yPos);
        doc.text(`₹${invoiceToDownload.taxBreakdown.cgst.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
      }

      if (invoiceToDownload.taxBreakdown.sgst > 0) {
        yPos += 6;
        doc.text('SGST:', totalsX, yPos);
        doc.text(`₹${invoiceToDownload.taxBreakdown.sgst.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
      }

      if (invoiceToDownload.taxBreakdown.igst > 0) {
        yPos += 6;
        doc.text('IGST:', totalsX, yPos);
        doc.text(`₹${invoiceToDownload.taxBreakdown.igst.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
      }

      if (invoiceToDownload.roundOff !== 0) {
        yPos += 6;
        doc.text('Round Off:', totalsX, yPos);
        doc.text(`₹${invoiceToDownload.roundOff.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
      }

      yPos += 8;
      doc.setDrawColor(0, 0, 0);
      doc.line(totalsX - 5, yPos, pageWidth - margin, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total Amount:', totalsX, yPos);
      doc.text(`₹${invoiceToDownload.finalAmount}`, pageWidth - margin - 2, yPos, { align: 'right' });

      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 128, 0);
      doc.text('Paid Amount:', totalsX, yPos);
      doc.text(`₹${invoiceToDownload.paidAmount}`, pageWidth - margin - 2, yPos, { align: 'right' });

      if (invoiceToDownload.balanceAmount > 0) {
        yPos += 6;
        doc.setTextColor(255, 140, 0);
        doc.text('Balance Due:', totalsX, yPos);
        doc.text(`₹${invoiceToDownload.balanceAmount}`, pageWidth - margin - 2, yPos, { align: 'right' });
      }

      doc.setTextColor(0, 0, 0);

      // Terms & Conditions
      if (companySettings.termsAndConditions) {
        yPos += 15;
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Terms & Conditions:', margin, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const termsLines = doc.splitTextToSize(companySettings.termsAndConditions, pageWidth - 2 * margin);
        doc.text(termsLines, margin, yPos);
      }

      // Save PDF
      doc.save(`Invoice-${invoiceToDownload.invoiceNumber}.pdf`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleSendWhatsApp = (invoiceToSend: Invoice) => {
    try {
      // Remove non-digit characters from phone number
      const phoneNumber = customerPhone.replace(/\D/g, '');

      // Create WhatsApp message
      const message = `Hello ${customerName},\n\nYour invoice for Order ${invoiceToSend.orderNumber} is ready.\n\nInvoice Number: ${invoiceToSend.invoiceNumber}\nTotal Amount: ₹${invoiceToSend.finalAmount}\nPaid Amount: ₹${invoiceToSend.paidAmount}\nBalance Due: ₹${invoiceToSend.balanceAmount}\n\nThank you for your business!`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);

      // Open WhatsApp Web with pre-filled message
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } catch (error: any) {
      console.error('Error opening WhatsApp:', error);
      alert('Error opening WhatsApp. Please check the phone number.');
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      await api.post(`/invoices/${invoice._id}/send-email`, {
        email: customerEmail
      });
      alert('Invoice sent via email successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error sending invoice via email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading payment details...</p>
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

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Payment & Invoice</h1>
          <p className="text-gray-500 text-sm mt-1">
            Order {order.orderNumber}
          </p>
        </div>
        <button
          onClick={handleSaveAndGenerateInvoice}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save & Generate Invoice'}
        </button>
      </div>

      {/* Company Settings Warning */}
      {!companySettings && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Company Settings Not Configured</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please configure your company details in Settings before generating invoices.
              </p>
              <button
                onClick={() => navigate('/settings')}
                className="mt-3 text-sm font-medium text-yellow-900 underline hover:text-yellow-800"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Editable Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  value={customerGSTIN}
                  onChange={(e) => setCustomerGSTIN(e.target.value)}
                  className="input-field"
                  placeholder="27XXXXX1234X1ZX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Services & Pricing */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Pricing</h3>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{service.serviceTypeName}</p>
                      <p className="text-sm text-gray-500">Est: ₹{service.estimatedCost}</p>
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Actual Cost
                      </label>
                      <input
                        type="number"
                        value={service.actualCost || ''}
                        onChange={(e) => handleUpdateServiceCost(index, parseFloat(e.target.value) || 0)}
                        className="input-field text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GST & Discount */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax & Discount</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Rate (%)
                </label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(parseFloat(e.target.value))}
                  className="input-field"
                >
                  <option value="0">0% (Exempted)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Type
                </label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value as any)}
                  className="input-field"
                >
                  <option value="intrastate">Intra-State (CGST+SGST)</option>
                  <option value="interstate">Inter-State (IGST)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="input-field"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount {discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Taxable Amount:</span>
                <span className="font-medium">₹{totals.taxableAmount.toFixed(2)}</span>
              </div>
              {taxType === 'intrastate' ? (
                <>
                  <div className="flex justify-between text-blue-600">
                    <span>CGST ({gstRate / 2}%):</span>
                    <span>₹{totals.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>SGST ({gstRate / 2}%):</span>
                    <span>₹{totals.sgst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-blue-600">
                  <span>IGST ({gstRate}%):</span>
                  <span>₹{totals.igst.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-base">
                <span>Total Amount:</span>
                <span className="text-purple-600">₹{totals.finalAmount}</span>
              </div>
            </div>

            {/* Paid Amount Input */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid Amount
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="input-field"
                min="0"
                step="0.01"
                placeholder="Enter paid amount"
              />
            </div>

            {/* Payment Method */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Balance */}
            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Balance Due:</span>
                <span className={`font-bold text-lg ${totals.balanceAmount <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  ₹{Math.max(0, totals.balanceAmount).toFixed(2)}
                </span>
              </div>
              <div className="mt-2">
                <span className={`badge ${
                  totals.balanceAmount <= 0 ? 'badge-completed' :
                  paidAmount > 0 ? 'badge-in-progress' :
                  'badge-pending'
                }`}>
                  {totals.balanceAmount <= 0 ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {totals.balanceAmount <= 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>

          {/* Generated Invoice */}
          {invoice && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice</h3>
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}
                    </p>
                    {invoice.updatedAt && new Date(invoice.updatedAt).getTime() !== new Date(invoice.invoiceDate).getTime() && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        Updated: {format(new Date(invoice.updatedAt), 'dd MMM yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                  <span className={`badge text-xs ${
                    invoice.paymentStatus === 'paid' ? 'badge-completed' :
                    invoice.paymentStatus === 'partial' ? 'badge-in-progress' :
                    'badge-pending'
                  }`}>
                    {invoice.paymentStatus}
                  </span>
                </div>
                <p className="text-sm font-semibold text-purple-600 mb-3">₹{invoice.finalAmount}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowInvoicePreview(true)}
                    className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View Invoice
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(invoice)}
                    className="btn-secondary text-xs flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(invoice)}
                    className="btn-secondary text-xs flex items-center justify-center gap-1"
                  >
                    <WhatsAppIcon className="w-3 h-3" />
                  </button>
                  {customerEmail && (
                    <button
                      onClick={() => handleSendEmail(invoice)}
                      className="btn-secondary text-xs flex items-center justify-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {showInvoicePreview && invoice && companySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Invoice Preview</h3>
                <button
                  onClick={() => setShowInvoicePreview(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Invoice Content */}
              <div className="border border-gray-200 rounded-lg p-8 space-y-6">
                {/* Company Header */}
                <div className="text-center border-b pb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Building2 className="w-8 h-8 text-purple-600" />
                    <h2 className="text-3xl font-bold text-gray-900">{companySettings.companyName}</h2>
                  </div>
                  <p className="text-sm text-gray-600">{companySettings.address}</p>
                  <p className="text-sm text-gray-600">{companySettings.city}, {companySettings.state} - {companySettings.pincode}</p>
                  <p className="text-sm text-gray-600">Phone: {companySettings.phone}</p>
                  {companySettings.email && <p className="text-sm text-gray-600">Email: {companySettings.email}</p>}
                  <p className="text-sm font-semibold text-gray-900 mt-3">GSTIN: {companySettings.gstin}</p>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
                    <p className="text-gray-700 font-medium">{invoice.customer.name}</p>
                    <p className="text-gray-600 text-sm">{invoice.customer.phone}</p>
                    {invoice.customer.address && (
                      <p className="text-gray-600 text-sm">{invoice.customer.address}</p>
                    )}
                    {invoice.customer.gstin && (
                      <p className="text-gray-600 text-sm">GSTIN: {invoice.customer.gstin}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Invoice: {invoice.invoiceNumber}</p>
                    <p className="text-gray-600 text-sm">Order: {invoice.orderNumber}</p>
                    <p className="text-gray-600 text-sm">Date: {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-900">Service</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="p-3 text-sm text-gray-700">{item.serviceTypeName}</td>
                        <td className="text-right p-3 text-sm text-gray-900">₹{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{invoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.taxBreakdown.cgst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">CGST:</span>
                      <span>₹{invoice.taxBreakdown.cgst.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.taxBreakdown.sgst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">SGST:</span>
                      <span>₹{invoice.taxBreakdown.sgst.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.taxBreakdown.igst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">IGST:</span>
                      <span>₹{invoice.taxBreakdown.igst.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.roundOff !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Round Off:</span>
                      <span>₹{invoice.roundOff.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t-2 border-gray-300 font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-purple-600">₹{invoice.finalAmount}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid Amount:</span>
                    <span>₹{invoice.paidAmount}</span>
                  </div>
                  {invoice.balanceAmount > 0 && (
                    <div className="flex justify-between text-orange-600 font-semibold">
                      <span>Balance Due:</span>
                      <span>₹{invoice.balanceAmount}</span>
                    </div>
                  )}
                </div>

                {/* Terms & Conditions */}
                {companySettings.termsAndConditions && (
                  <div className="text-xs text-gray-600 border-t pt-4">
                    <p className="font-semibold mb-2">Terms & Conditions:</p>
                    <p className="whitespace-pre-wrap">{companySettings.termsAndConditions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
