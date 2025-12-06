import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { orderService } from '../services/orderService';
import { deviceTypeService } from '../services/deviceTypeService';
import { serviceTypeService } from '../services/serviceTypeService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import type { ServiceOrder, DeviceType, ServiceType, Customer } from '../types';
import type { Product } from '../services/productService';
import { ArrowLeft, X, Plus, Save } from 'lucide-react';

interface FormData {
  deviceTypeId: string;
  brand: string;
  model: string;
  serialNumber?: string;
  password?: string;
  problemDescription: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const EditOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Customer state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Data states
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Services/Products state
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const deviceTypeId = watch('deviceTypeId');

  useEffect(() => {
    fetchOrder();
    fetchDeviceTypes();
    fetchServiceTypes();
    fetchProducts();
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customerSearchQuery.length >= 2) {
        try {
          const response = await customerService.search(customerSearchQuery);
          setCustomerSuggestions(response.data || []);
          setShowCustomerDropdown(true);
        } catch (error) {
          console.error('Error searching customers:', error);
        }
      } else {
        setCustomerSuggestions([]);
        setShowCustomerDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchQuery]);

  const fetchOrder = async () => {
    try {
      const response = await orderService.getById(id!);
      const orderData = response.data;
      setOrder(orderData);

      // Set customer
      setSelectedCustomer(orderData.customer);
      setCustomerSearchQuery(orderData.customer.name);

      // Set form values for service orders
      if (orderData.orderType === 'service' || !orderData.orderType) {
        setValue('deviceTypeId', orderData.device?.deviceTypeId || '');
        setValue('brand', orderData.device?.brand || '');
        setValue('model', orderData.device?.model || '');
        setValue('serialNumber', orderData.device?.serialNumber || '');
        setValue('password', orderData.device?.password || '');
        setValue('problemDescription', orderData.problemDescription || '');
        setValue('priority', orderData.priority);
        setSelectedServices(orderData.services || []);
      } else {
        // Product order
        setValue('priority', orderData.priority);
        setSelectedProducts(orderData.products || []);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Error loading order');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await deviceTypeService.getAll({ isActive: true });
      setDeviceTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching device types:', error);
    }
  };

  const fetchServiceTypes = async () => {
    try {
      const response = await serviceTypeService.getAll({ isActive: true });
      setServiceTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching service types:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.fullName);
    setShowCustomerDropdown(false);
  };

  const updateServiceField = (serviceTypeId: string, field: string, value: any) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s.serviceTypeId === serviceTypeId ? { ...s, [field]: value } : s
      )
    );
  };

  const removeService = (serviceTypeId: string) => {
    setSelectedServices(selectedServices.filter((s) => s.serviceTypeId !== serviceTypeId));
  };

  const addService = (serviceType: ServiceType) => {
    if (!selectedServices.find((s) => s.serviceTypeId === serviceType._id)) {
      setSelectedServices([
        ...selectedServices,
        {
          serviceTypeId: serviceType._id,
          serviceTypeName: serviceType.name,
          description: serviceType.description,
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: 18,
          estimatedCost: 0,
        },
      ]);
    }
  };

  const updateProductField = (productId: string, field: string, value: any) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.productId === productId ? { ...p, [field]: value } : p
      )
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.productId !== productId));
  };

  const addProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.productId === product._id)) {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          quantity: 1,
          unitPrice: product.unitPrice,
          discount: 0,
          taxRate: product.taxRate,
        },
      ]);
    }
  };

  const onSubmit = async (formData: FormData) => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        customer: {
          name: selectedCustomer.fullName || selectedCustomer.name,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email,
          address: selectedCustomer.customerDetails?.address || selectedCustomer.address,
        },
        priority: formData.priority,
      };

      // Update service-specific fields
      if (order?.orderType === 'service' || !order?.orderType) {
        const deviceType = deviceTypes.find((d) => d._id === formData.deviceTypeId);
        updateData.device = {
          deviceTypeId: formData.deviceTypeId,
          deviceTypeName: deviceType?.name || '',
          brand: formData.brand,
          model: formData.model,
          attributes: {},
          serialNumber: formData.serialNumber,
          password: formData.password,
        };
        updateData.problemDescription = formData.problemDescription;
        updateData.services = selectedServices;
      } else {
        // Update product-specific fields
        updateData.products = selectedProducts;
      }

      await orderService.update(id!, updateData);
      alert('Order updated successfully!');
      navigate(`/orders/${id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating order');
    } finally {
      setSaving(false);
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
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const isServiceOrder = order.orderType === 'service' || !order.orderType;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/orders/${id}`)}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Order</h1>
          <p className="text-gray-500 text-sm mt-1">{order.orderNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Selection */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Customer *
            </label>
            <input
              type="text"
              value={customerSearchQuery}
              onChange={(e) => {
                setCustomerSearchQuery(e.target.value);
                if (!e.target.value) setSelectedCustomer(null);
              }}
              onFocus={() => customerSuggestions.length > 0 && setShowCustomerDropdown(true)}
              className="input-field"
              placeholder="Search by name, phone, or email..."
            />

            {showCustomerDropdown && customerSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {customerSuggestions.map((customer) => (
                  <button
                    key={customer._id}
                    type="button"
                    onClick={() => handleCustomerSelect(customer)}
                    className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{customer.fullName}</div>
                    <div className="text-sm text-gray-600">{customer.phone}</div>
                    {customer.email && <div className="text-xs text-gray-500">{customer.email}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Service Order Fields */}
        {isServiceOrder && (
          <>
            {/* Device Information */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Device Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device Type *</label>
                  <select {...register('deviceTypeId', { required: true })} className="input-field">
                    <option value="">Select Device Type</option>
                    {deviceTypes.map((dt) => (
                      <option key={dt._id} value={dt._id}>{dt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                  <input {...register('brand', { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                  <input {...register('model', { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                  <input {...register('serialNumber')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input {...register('password')} type="password" className="input-field" />
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Problem Description</h2>
              <textarea
                {...register('problemDescription', { required: true })}
                className="input-field resize-none"
                rows={4}
              />
            </div>

            {/* Services */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Services</h2>

              {/* Selected Services */}
              {selectedServices.length > 0 && (
                <div className="mb-4 space-y-2">
                  {selectedServices.map((service) => (
                    <div key={service.serviceTypeId} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">{service.serviceTypeName}</div>
                        <button
                          type="button"
                          onClick={() => removeService(service.serviceTypeId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={service.quantity}
                          onChange={(e) => updateServiceField(service.serviceTypeId, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder="Quantity"
                          className="input-field text-sm"
                        />
                        <input
                          type="number"
                          value={service.unitPrice}
                          onChange={(e) => updateServiceField(service.serviceTypeId, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="Price"
                          className="input-field text-sm"
                        />
                        <input
                          type="number"
                          value={service.discount}
                          onChange={(e) => updateServiceField(service.serviceTypeId, 'discount', parseFloat(e.target.value) || 0)}
                          placeholder="Discount"
                          className="input-field text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Service</label>
                <select
                  onChange={(e) => {
                    const service = serviceTypes.find(s => s._id === e.target.value);
                    if (service) addService(service);
                    e.target.value = '';
                  }}
                  className="input-field"
                >
                  <option value="">Select service to add</option>
                  {serviceTypes.map((st) => (
                    <option key={st._id} value={st._id}>{st.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Product Order Fields */}
        {!isServiceOrder && (
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Products</h2>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="mb-4 space-y-2">
                {selectedProducts.map((product) => (
                  <div key={product.productId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">{product.productName}</div>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.productId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateProductField(product.productId, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="Quantity"
                        className="input-field text-sm"
                      />
                      <input
                        type="number"
                        value={product.unitPrice}
                        onChange={(e) => updateProductField(product.productId, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Price"
                        className="input-field text-sm"
                      />
                      <input
                        type="number"
                        value={product.discount}
                        onChange={(e) => updateProductField(product.productId, 'discount', parseFloat(e.target.value) || 0)}
                        placeholder="Discount"
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Product</label>
              <select
                onChange={(e) => {
                  const product = products.find(p => p._id === e.target.value);
                  if (product) addProduct(product);
                  e.target.value = '';
                }}
                className="input-field"
              >
                <option value="">Select product to add</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} - ₹{p.unitPrice}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Priority */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Priority</h2>
          <select {...register('priority')} className="input-field">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/orders/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOrderPage;
