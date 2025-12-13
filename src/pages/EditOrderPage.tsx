import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";
import { deviceTypeService } from "../services/deviceTypeService";
import { serviceTypeService } from "../services/serviceTypeService";
import { customerService } from "../services/customerService";
import type { ServiceOrder, DeviceType, ServiceType } from "../types";
import { ArrowLeft, X, Save } from "lucide-react";

const EditOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Customer state
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Service state
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [serviceSuggestions, setServiceSuggestions] = useState<ServiceType[]>(
    []
  );
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // Data states
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  // Form fields
  const [voucherNo, setVoucherNo] = useState("");
  const [deviceTypeId, setDeviceTypeId] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [password, setPassword] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");

  // Services/Products state
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchOrder();
    fetchDeviceTypes();
    fetchServiceTypes();
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customerSearchQuery.length >= 2) {
        try {
          const response = await customerService.search(customerSearchQuery);
          setCustomerSuggestions(response.data || []);
          setShowCustomerDropdown(true);
        } catch (error) {
          console.error("Error searching customers:", error);
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
      if (!orderData) {
        throw new Error("Order not found");
      }
      setOrder(orderData);

      // Set customer
      setSelectedCustomer(orderData.customer);
      setCustomerSearchQuery(orderData.customer.name);

      // Set form values for service orders
      if (orderData.orderType === "service" || !orderData.orderType) {
        // Extract deviceTypeId - could be populated object or string
        const deviceTypeIdRaw = orderData.device?.deviceTypeId;
        const extractedDeviceTypeId =
          typeof deviceTypeIdRaw === "object" && deviceTypeIdRaw !== null
            ? (deviceTypeIdRaw as any)._id
            : deviceTypeIdRaw || "";

        setVoucherNo(orderData.voucherNo || "");
        setDeviceTypeId(extractedDeviceTypeId);
        setBrand(orderData.device?.brand || "");
        setModel(orderData.device?.model || "");
        setSerialNumber(orderData.device?.serialNumber || "");
        setPassword(orderData.device?.password || "");
        setProblemDescription(orderData.problemDescription || "");
        setPriority(orderData.priority);
        setSelectedServices(orderData.services || []);
      } else {
        // Product order
        setPriority(orderData.priority);
        setSelectedProducts(orderData.products || []);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Error loading order");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await deviceTypeService.getAll({ isActive: true });
      setDeviceTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching device types:", error);
    }
  };

  const fetchServiceTypes = async () => {
    try {
      const response = await serviceTypeService.getAll({ isActive: true });
      setServiceTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching service types:", error);
    }
  };

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.fullName);
    setShowCustomerDropdown(false);
  };

  const handleServiceSearch = (query: string) => {
    setServiceSearchQuery(query);

    if (query.length >= 1) {
      const filtered = serviceTypes.filter((st) =>
        st.name.toLowerCase().includes(query.toLowerCase())
      );
      setServiceSuggestions(filtered);
      setShowServiceDropdown(true);
    } else {
      setServiceSuggestions([]);
      setShowServiceDropdown(false);
    }
  };

  const handleServiceSelect = (serviceType: ServiceType) => {
    const serviceIdToCheck = serviceType._id.toString();
    const alreadyExists = selectedServices.some(
      (s) =>
        (s.serviceTypeId?._id || s.serviceTypeId)?.toString() ===
        serviceIdToCheck
    );

    if (alreadyExists) {
      alert("This service is already added");
      return;
    }

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
    setServiceSearchQuery("");
    setShowServiceDropdown(false);
  };

  const removeService = (serviceTypeId: string) => {
    setSelectedServices(
      selectedServices.filter(
        (s) =>
          (s.serviceTypeId?._id || s.serviceTypeId)?.toString() !==
          serviceTypeId?.toString()
      )
    );
  };

  const updateServiceQuantity = (serviceTypeId: string, quantity: number) => {
    setSelectedServices(
      selectedServices.map((s) =>
        (s.serviceTypeId?._id || s.serviceTypeId)?.toString() ===
        serviceTypeId?.toString()
          ? { ...s, quantity }
          : s
      )
    );
  };

  const handleSave = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        customer: {
          name: selectedCustomer.fullName || selectedCustomer.name,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email,
          address:
            selectedCustomer.customerDetails?.address ||
            selectedCustomer.address,
        },
        priority,
      };

      // Update service-specific fields
      if (order?.orderType === "service" || !order?.orderType) {
        const deviceType = deviceTypes.find((d) => d._id === deviceTypeId);
        updateData.device = {
          deviceTypeId,
          deviceTypeName: deviceType?.name || "",
          brand,
          model,
          attributes: {},
          serialNumber,
          password,
        };
        updateData.problemDescription = problemDescription;
        updateData.voucherNo = voucherNo || undefined;

        // Normalize services - extract IDs from populated objects
        updateData.services = selectedServices.map((service) => ({
          ...service,
          serviceTypeId: service.serviceTypeId?._id || service.serviceTypeId,
        }));
      } else {
        // Update product-specific fields
        updateData.products = selectedProducts;
      }

      await orderService.update(id!, updateData);
      alert("Order updated successfully!");
      navigate(`/orders/${id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Error updating order");
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

      {/* Table Format - Desktop */}
      <div className="hidden lg:block rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                  Voucher No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[220px]">
                  Customer *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[280px]">
                  Services
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[180px]">
                  Device Type *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                  Model *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[240px]">
                  Problem *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="hover:bg-gray-50">
                {/* Voucher No Cell */}
                <td className="px-4 py-3 border-r border-gray-200">
                  <input
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    placeholder="Enter voucher no..."
                    className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>

                {/* Customer Cell */}
                <td className="px-4 py-3 border-r border-gray-200 relative">
                  {selectedCustomer ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md text-sm font-medium">
                        {selectedCustomer.fullName || selectedCustomer.name}
                        <button
                          onClick={() => {
                            setSelectedCustomer(null);
                            setCustomerSearchQuery("");
                          }}
                          className="hover:text-purple-900"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        onFocus={() => {
                          if (customerSuggestions.length > 0)
                            setShowCustomerDropdown(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowCustomerDropdown(false), 200);
                        }}
                        placeholder="Search customer..."
                        className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {showCustomerDropdown &&
                        customerSuggestions.length > 0 && (
                          <div className="absolute z-50 w-72 mt-1 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto shadow-lg">
                            {customerSuggestions.map((customer) => (
                              <button
                                key={customer._id}
                                type="button"
                                onClick={() => handleCustomerSelect(customer)}
                                className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b"
                              >
                                <div className="font-medium text-sm text-gray-900">
                                  {customer.fullName}
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  {customer.phone}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                    </>
                  )}
                </td>

                {/* Services Cell */}
                <td className="px-4 py-3 border-r border-gray-200 relative">
                  <div className="space-y-1.5">
                    {selectedServices.map((service) => {
                      const serviceId = (
                        service.serviceTypeId?._id || service.serviceTypeId
                      )?.toString();
                      const serviceName =
                        service.serviceTypeId?.name ||
                        service.serviceTypeName ||
                        "Unknown Service";
                      return (
                        <div
                          key={serviceId}
                          className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md text-sm"
                        >
                          <span className="flex-1 font-medium text-blue-900">
                            {serviceName}
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={service.quantity}
                            onChange={(e) =>
                              updateServiceQuantity(
                                serviceId,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                          <button
                            onClick={() => removeService(serviceId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    <input
                      type="text"
                      value={serviceSearchQuery}
                      onChange={(e) => handleServiceSearch(e.target.value)}
                      onFocus={() => setShowServiceDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowServiceDropdown(false), 200);
                      }}
                      placeholder="Add service..."
                      className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {showServiceDropdown && (
                      <div className="absolute z-50 w-72 mt-1 bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto shadow-lg">
                        {serviceSuggestions.length > 0 ? (
                          serviceSuggestions.map((serviceType) => (
                            <button
                              key={serviceType._id}
                              type="button"
                              onClick={() => handleServiceSelect(serviceType)}
                              className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b"
                            >
                              <div className="font-medium text-sm text-gray-900">
                                {serviceType.name}
                              </div>
                              {serviceType.description && (
                                <div className="text-xs text-gray-600 mt-0.5">
                                  {serviceType.description}
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            {serviceSearchQuery
                              ? "No services found"
                              : "Start typing to search services"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Device Type Cell */}
                <td className="px-4 py-3 border-r border-gray-200">
                  <select
                    value={deviceTypeId}
                    onChange={(e) => setDeviceTypeId(e.target.value)}
                    className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select device...</option>
                    {deviceTypes.map((dt) => (
                      <option key={dt._id} value={dt._id}>
                        {dt.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Brand Cell */}
                <td className="px-4 py-3 border-r border-gray-200">
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Enter brand..."
                    className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>

                {/* Model Cell */}
                <td className="px-4 py-3 border-r border-gray-200">
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Enter model..."
                    className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>

                {/* Problem Cell */}
                <td className="px-4 py-3 border-r border-gray-200">
                  <textarea
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="Describe the problem..."
                    rows={2}
                    className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  />
                </td>

                {/* Priority Cell */}
                <td className="px-4 py-3">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons - Desktop */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/orders/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
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
      </div>

      {/* Card Format - Mobile */}
      <div className="lg:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-purple-600 text-white px-4 py-3">
          <h3 className="font-semibold">Edit Order</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Voucher No */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Voucher No
            </label>
            <input
              type="text"
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              placeholder="Enter voucher number..."
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer *
            </label>
            {selectedCustomer ? (
              <div className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md text-sm font-medium">
                  {selectedCustomer.fullName || selectedCustomer.name}
                </span>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearchQuery("");
                  }}
                  className="p-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (customerSuggestions.length > 0)
                      setShowCustomerDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowCustomerDropdown(false), 200);
                  }}
                  placeholder="Search customer..."
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {showCustomerDropdown && customerSuggestions.length > 0 && (
                  <div className="relative z-50 mt-2 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                    {customerSuggestions.map((customer) => (
                      <button
                        key={customer._id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b"
                      >
                        <div className="font-medium text-base text-gray-900">
                          {customer.fullName}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {customer.phone}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Services
            </label>
            <div className="space-y-2">
              {selectedServices.map((service) => {
                const serviceId = (
                  service.serviceTypeId?._id || service.serviceTypeId
                )?.toString();
                const serviceName =
                  service.serviceTypeId?.name ||
                  service.serviceTypeName ||
                  "Unknown Service";
                return (
                  <div
                    key={serviceId}
                    className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md"
                  >
                    <span className="flex-1 text-sm font-medium text-blue-900">
                      {serviceName}
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(e) =>
                        updateServiceQuantity(
                          serviceId,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center text-sm"
                    />
                    <button
                      onClick={() => removeService(serviceId)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
              <input
                type="text"
                value={serviceSearchQuery}
                onChange={(e) => handleServiceSearch(e.target.value)}
                onFocus={() => setShowServiceDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowServiceDropdown(false), 200);
                }}
                placeholder="Add service..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {showServiceDropdown && (
                <div className="relative z-50 mt-2 bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {serviceSuggestions.length > 0 ? (
                    serviceSuggestions.map((serviceType) => (
                      <button
                        key={serviceType._id}
                        type="button"
                        onClick={() => handleServiceSelect(serviceType)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b"
                      >
                        <div className="font-medium text-base text-gray-900">
                          {serviceType.name}
                        </div>
                        {serviceType.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {serviceType.description}
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-base text-gray-500">
                      {serviceSearchQuery
                        ? "No services found"
                        : "Start typing to search services"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Device Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Device Type *
            </label>
            <select
              value={deviceTypeId}
              onChange={(e) => setDeviceTypeId(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select device...</option>
              {deviceTypes.map((dt) => (
                <option key={dt._id} value={dt._id}>
                  {dt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Enter brand..."
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Model *
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Enter model..."
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Problem Description *
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe the problem..."
              rows={4}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Action Buttons - Mobile */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full btn-primary flex items-center justify-center gap-2"
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
            <button
              type="button"
              onClick={() => navigate(`/orders/${id}`)}
              className="w-full btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderPage;
