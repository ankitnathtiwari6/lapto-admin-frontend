import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { deviceTypeService } from "../services/deviceTypeService";
import { serviceTypeService } from "../services/serviceTypeService";
import { orderService } from "../services/orderService";
import { userService } from "../services/userService";
import { customerService } from "../services/customerService";
import { aiService } from "../services/aiService";
import { productService, type Product } from "../services/productService";
import type { CreateOrderData } from "../services/orderService";
import type { DeviceType, ServiceType, User } from "../types";
import type { Customer } from "../services/customerService";
import { Plus, ArrowLeft, X, Sparkles } from "lucide-react";
import CustomerCreateModal from "../components/CustomerCreateModal";
import OrderItemsSection from "../components/OrderItemsSection";

interface FormData {
  voucherNo?: string;
  deviceTypeId: string;
  brand: string;
  model: string;
  serialNumber?: string;
  password?: string;
  problemDescription: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedCost?: number;
  advancePayment?: number;
}

const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      priority: "medium",
    },
  });

  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>("");
  const [selectedDeviceType, setSelectedDeviceType] =
    useState<DeviceType | null>(null);
  const [selectedServices, setSelectedServices] = useState<
    Array<{
      serviceTypeId: string;
      serviceTypeName: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      taxRate: number;
      estimatedCost: number;
      isCustom?: boolean;
    }>
  >([]);
  const [customServiceName, setCustomServiceName] = useState("");
  const [customServicePrice, setCustomServicePrice] = useState<number>(0);
  const [additionalDiscount, setAdditionalDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [taxRate] = useState<number>(18);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // New state for AI features
  const [jobDetails, setJobDetails] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGeneratedCustomerInfo, setAiGeneratedCustomerInfo] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  } | null>(null);

  // Customer search state
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>(
    []
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  // Order type state
  const [orderType, setOrderType] = useState<"service" | "product" | "mixed">(
    "service"
  );

  // Product order state
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{
      productId: string;
      productName: string;
      sku?: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      taxRate: number;
    }>
  >([]);

  // Customer creation modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const deviceTypeId = watch("deviceTypeId");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (deviceTypeId) {
      const device = deviceTypes.find((d) => d._id === deviceTypeId);
      setSelectedDeviceType(device || null);
    }
  }, [deviceTypeId, deviceTypes]);

  // Customer search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customerSearchQuery.length >= 2) {
        setSearchingCustomers(true);
        try {
          const response = await customerService.search(customerSearchQuery);
          setCustomerSuggestions(response.data || []);
          setShowCustomerDropdown(true);
        } catch (error) {
          console.error("Error searching customers:", error);
          setCustomerSuggestions([]);
        } finally {
          setSearchingCustomers(false);
        }
      } else {
        setCustomerSuggestions([]);
        setShowCustomerDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchQuery]);

  // Product search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (productSearchQuery.length >= 2) {
        setSearchingProducts(true);
        try {
          const response = await productService.search(productSearchQuery);
          setProductSuggestions(response.data || []);
          setShowProductDropdown(true);
        } catch (error) {
          console.error("Error searching products:", error);
          setProductSuggestions([]);
        } finally {
          setSearchingProducts(false);
        }
      } else {
        setProductSuggestions([]);
        setShowProductDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearchQuery]);

  const fetchInitialData = async () => {
    try {
      const [devicesRes, servicesRes, engineersRes] = await Promise.all([
        deviceTypeService.getAll({ isActive: true }),
        serviceTypeService.getAll({ isActive: true }),
        userService.getEngineers(),
      ]);
      setDeviceTypes(devicesRes.data || []);
      setServiceTypes(servicesRes.data || []);
      setEngineers(engineersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.fullName);
    setShowCustomerDropdown(false);
  };

  const handleCustomerSearchChange = (value: string) => {
    setCustomerSearchQuery(value);
    if (!value) {
      setSelectedCustomer(null);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!jobDetails.trim()) {
      alert("Please enter job details to generate order");
      return;
    }

    setGeneratingAI(true);
    try {
      const response = await aiService.generateOrder(jobDetails);
      const generatedData = response.data;

      if (!generatedData) {
        throw new Error("Failed to generate order details.");
      }

      // Store AI-generated customer info for modal prefill
      if (generatedData.customerInfo) {
        setAiGeneratedCustomerInfo({
          name: generatedData.customerInfo.name || "",
          phone: generatedData.customerInfo.phone || "",
          email: generatedData.customerInfo.email || "",
          address: generatedData.customerInfo.address || "",
        });

        // Try to find existing customer by phone or name
        if (generatedData.customerInfo.name) {
          setCustomerSearchQuery(generatedData.customerInfo.name);
        } else if (generatedData.customerInfo.phone) {
          setCustomerSearchQuery(generatedData.customerInfo.phone);
        }
      }

      // Fill device info
      if (generatedData.device.deviceTypeId) {
        setValue("deviceTypeId", generatedData.device.deviceTypeId);
      }
      if (generatedData.device.brand) {
        setValue("brand", generatedData.device.brand);
      }
      if (generatedData.device.model) {
        setValue("model", generatedData.device.model);
      }
      if (generatedData.device.serialNumber) {
        setValue("serialNumber", generatedData.device.serialNumber);
      }

      // Fill problem description
      if (generatedData.problemDescription) {
        setValue("problemDescription", generatedData.problemDescription);
      }

      // Fill priority
      if (generatedData.priority) {
        setValue("priority", generatedData.priority);
      }

      // Fill services
      if (generatedData.services && generatedData.services.length > 0) {
        setSelectedServices(generatedData.services);
      }

      alert(
        "Order details generated successfully! You can now review and edit before creating."
      );
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Failed to generate order. Please try again."
      );
    } finally {
      setGeneratingAI(false);
    }
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

  const addCustomService = () => {
    if (!customServiceName.trim()) {
      alert("Please enter a service name");
      return;
    }
    const customId = `custom-${Date.now()}`;
    setSelectedServices([
      ...selectedServices,
      {
        serviceTypeId: customId,
        serviceTypeName: customServiceName,
        description: "",
        quantity: 1,
        unitPrice: customServicePrice,
        discount: 0,
        taxRate: 18,
        estimatedCost: customServicePrice,
        isCustom: true,
      },
    ]);
    setCustomServiceName("");
    setCustomServicePrice(0);
  };

  const updateServiceField = (
    serviceTypeId: string,
    field: string,
    value: any
  ) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s.serviceTypeId === serviceTypeId ? { ...s, [field]: value } : s
      )
    );
  };

  const removeService = (serviceTypeId: string) => {
    setSelectedServices(
      selectedServices.filter((s) => s.serviceTypeId !== serviceTypeId)
    );
  };

  // Product handlers
  const addProduct = (product: Product) => {
    console.log(product, "product");
    if (!selectedProducts.find((p) => p.productId === product._id)) {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          description: product.description,
          quantity: 1,
          unitPrice: product.unitPrice,
          discount: 0,
          taxRate: product.taxRate,
        },
      ]);
      setProductSearchQuery("");
      setShowProductDropdown(false);
    }
  };

  const addCustomProduct = (name: string, price: number, sku?: string) => {
    const customId = `custom-product-${Date.now()}`;
    setSelectedProducts([
      ...selectedProducts,
      {
        productId: customId,
        productName: name,
        sku: sku,
        description: "",
        quantity: 1,
        unitPrice: price,
        discount: 0,
        taxRate: 18,
      },
    ]);
  };

  const updateProductField = (productId: string, field: string, value: any) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.productId === productId ? { ...p, [field]: value } : p
      )
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.productId !== productId)
    );
  };

  // Calculate invoice amounts
  const calculateInvoiceAmounts = () => {
    // Subtotal from all services and products combined
    const serviceSubtotal = selectedServices.reduce(
      (sum, s) => sum + s.quantity * s.unitPrice,
      0
    );
    const productSubtotal = selectedProducts.reduce(
      (sum, p) => sum + p.quantity * p.unitPrice,
      0
    );
    const subtotal = serviceSubtotal + productSubtotal;

    // Total item-level discounts from both services and products
    const serviceDiscounts = selectedServices.reduce(
      (sum, s) => sum + s.discount,
      0
    );
    const productDiscounts = selectedProducts.reduce(
      (sum, p) => sum + p.discount,
      0
    );
    const itemDiscounts = serviceDiscounts + productDiscounts;

    // Total discount (item + additional)
    const totalDiscount = itemDiscounts + additionalDiscount;

    // Taxable amount after discount
    const taxableAmount = subtotal - totalDiscount;

    // Calculate GST (CGST + SGST for intra-state)
    const cgst = (taxableAmount * (taxRate / 2)) / 100;
    const sgst = (taxableAmount * (taxRate / 2)) / 100;
    const totalTax = cgst + sgst;

    // Total amount before rounding
    const totalAmount = taxableAmount + totalTax;

    // Round off to nearest rupee
    const finalAmount = Math.round(totalAmount);
    const roundOff = finalAmount - totalAmount;

    // Balance calculation
    const balance = finalAmount - paidAmount;

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      cgst,
      sgst,
      totalTax,
      totalAmount,
      roundOff,
      finalAmount,
      balance,
    };
  };

  const invoiceAmounts = calculateInvoiceAmounts();

  const onSubmit = async (formData: FormData) => {
    // Validate customer selection
    if (!selectedCustomer) {
      alert(
        "Please select a customer. If the customer doesn't exist, create one first."
      );
      return;
    }

    // Validate order items - at least one service or product is required
    if (selectedServices.length === 0 && selectedProducts.length === 0) {
      alert("Please add at least one service or product to the order.");
      return;
    }

    // Determine actual order type based on what's added
    let actualOrderType: "service" | "product" | "mixed" = orderType;
    if (selectedServices.length > 0 && selectedProducts.length > 0) {
      actualOrderType = "mixed";
    } else if (selectedServices.length > 0) {
      actualOrderType = "service";
    } else if (selectedProducts.length > 0) {
      actualOrderType = "product";
    }

    setLoading(true);
    try {
      const orderData: CreateOrderData = {
        orderType: actualOrderType,
        voucherNo: formData.voucherNo,
        customer: {
          customerId: selectedCustomer._id,
          name: selectedCustomer.fullName,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email,
          address: selectedCustomer.customerDetails?.address,
        },
        priority: formData.priority,
        discount: additionalDiscount,
        taxRate: taxRate,
        paidAmount: paidAmount,
        estimatedCost: invoiceAmounts.finalAmount || 0,
        advancePayment: paidAmount,
      } as any;

      // Add service-specific fields if services are present
      if (selectedServices.length > 0) {
        // Only add device info if device type is selected
        if (formData.deviceTypeId) {
          const deviceType = deviceTypes.find(
            (d) => d._id === formData.deviceTypeId
          );
          orderData.device = {
            deviceTypeId: formData.deviceTypeId,
            deviceTypeName: deviceType?.name || "",
            brand: formData.brand,
            model: formData.model,
            attributes: {},
            serialNumber: formData.serialNumber,
            password: formData.password,
          };
        }
        if (formData.problemDescription) {
          orderData.problemDescription = formData.problemDescription;
          orderData.customerComplaints = [formData.problemDescription];
        }
        orderData.services = selectedServices;
        orderData.engineerId = selectedEngineerId || undefined;
      }

      // Add product-specific fields if products are present
      if (selectedProducts.length > 0) {
        orderData.products = selectedProducts;
      }

      const response = await orderService.create(orderData);
      const responseData: any = response.data;
      const order = responseData?.order || responseData;
      const invoice = responseData?.invoice;

      alert(
        `Order created successfully!\nOrder Number: ${
          order.orderNumber
        }\nInvoice Number: ${invoice?.invoiceNumber || "N/A"}`
      );

      // Navigate to order detail page
      navigate(`/orders/${order._id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating order");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">New Order</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create a new repair order
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Type Selection */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Order Type
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setOrderType("service")}
              className={`p-4 border-2 rounded-lg transition-all ${
                orderType === "service"
                  ? "border-purple-600 bg-purple-50 text-purple-900"
                  : "border-gray-300 bg-white text-gray-700 hover:border-purple-300"
              }`}
            >
              <div className="font-semibold">Service Order</div>
              <div className="text-sm mt-1 opacity-75">
                Device repair & services
              </div>
            </button>
            <button
              type="button"
              onClick={() => setOrderType("product")}
              className={`p-4 border-2 rounded-lg transition-all ${
                orderType === "product"
                  ? "border-purple-600 bg-purple-50 text-purple-900"
                  : "border-gray-300 bg-white text-gray-700 hover:border-purple-300"
              }`}
            >
              <div className="font-semibold">Product Order</div>
              <div className="text-sm mt-1 opacity-75">Product sales</div>
            </button>
            <button
              type="button"
              onClick={() => setOrderType("mixed")}
              className={`p-4 border-2 rounded-lg transition-all ${
                orderType === "mixed"
                  ? "border-purple-600 bg-purple-50 text-purple-900"
                  : "border-gray-300 bg-white text-gray-700 hover:border-purple-300"
              }`}
            >
              <div className="font-semibold">Mixed Order</div>
              <div className="text-sm mt-1 opacity-75">Services + Products</div>
            </button>
          </div>
        </div>

        {/* Voucher Number */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Voucher Number
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voucher No. (Optional)
            </label>
            <input
              {...register("voucherNo")}
              className="input-field"
              placeholder="Enter voucher number if applicable"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional reference number for this order
            </p>
          </div>
        </div>

        {/* AI Job Details Card - Available for all order types */}
        <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-semibold text-gray-900">
              AI-Powered Order Generation
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Details
              </label>
              <textarea
                value={jobDetails}
                onChange={(e) => setJobDetails(e.target.value)}
                className="input-field resize-none"
                rows={4}
                placeholder={
                  orderType === "service"
                    ? "Example: Customer John Doe called, his iPhone 13 Pro screen is cracked and battery drains fast. Phone: 9876543210. Need urgent repair."
                    : orderType === "product"
                    ? "Example: Customer Jane Smith wants to buy 2 iPhone cases and 1 screen protector. Phone: 9876543210."
                    : "Example: Customer needs iPhone screen repair and wants to buy a protective case. Phone: 9876543210."
                }
              />
              <p className="text-xs text-gray-600 mt-1">
                Describe the order in natural language. Include customer info,
                {orderType === "service" && " device details, problems,"}
                {orderType === "product" && " product details,"}
                {orderType === "mixed" && " device/product details,"} and any
                other relevant information. AI will auto-fill the form below.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={generatingAI || !jobDetails.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {generatingAI ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Order with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Customer Selection Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Select Customer
            </h2>
            <button
              type="button"
              onClick={() => setShowCustomerModal(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Customer
            </button>
          </div>

          {/* Customer Search/Select */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Customer *
            </label>
            <input
              type="text"
              value={customerSearchQuery}
              onChange={(e) => handleCustomerSearchChange(e.target.value)}
              onFocus={() =>
                customerSuggestions.length > 0 && setShowCustomerDropdown(true)
              }
              className="input-field"
              placeholder="Search by name, phone, or email..."
            />

            {/* Customer Suggestions Dropdown */}
            {showCustomerDropdown && customerSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {customerSuggestions.map((customer) => (
                  <button
                    key={customer._id}
                    type="button"
                    onClick={() => handleCustomerSelect(customer)}
                    className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {customer.fullName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="text-xs text-gray-500">
                        {customer.email}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {searchingCustomers && (
              <div className="absolute right-3 top-11 text-gray-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}

            {customerSearchQuery &&
              customerSuggestions.length === 0 &&
              !searchingCustomers && (
                <p className="text-sm text-gray-500 mt-2">
                  No customers found. Click "New Customer" to create one.
                </p>
              )}
          </div>

          {/* Selected Customer Display */}
          {selectedCustomer && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Selected Customer
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedCustomer.fullName}
                    </p>
                    <p className="text-sm text-gray-700">
                      Phone: {selectedCustomer.phone}
                    </p>
                    {selectedCustomer.email && (
                      <p className="text-sm text-gray-700">
                        Email: {selectedCustomer.email}
                      </p>
                    )}
                    {selectedCustomer.customerDetails?.address && (
                      <p className="text-sm text-gray-700">
                        Address: {selectedCustomer.customerDetails.address}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearchQuery("");
                  }}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Service Order Specific Fields - Show for service and mixed orders */}
        {(orderType === "service" || orderType === "mixed") && (
          <>
            {/* Device Information Card */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Device Information {orderType === "mixed" && "(Optional)"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Type {orderType === "service" && "*"}
                  </label>
                  <select
                    {...register("deviceTypeId", {
                      required:
                        orderType === "service"
                          ? "Device type is required"
                          : false,
                    })}
                    className="input-field"
                  >
                    <option value="">Select Device Type</option>
                    {deviceTypes.map((dt) => (
                      <option key={dt._id} value={dt._id}>
                        {dt.name}
                      </option>
                    ))}
                  </select>
                  {errors.deviceTypeId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.deviceTypeId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand {orderType === "service" && "*"}
                  </label>
                  <input
                    {...register("brand", {
                      required:
                        orderType === "service" ? "Brand is required" : false,
                    })}
                    className="input-field"
                    placeholder="Apple, Dell, HP..."
                  />
                  {errors.brand && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.brand.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model {orderType === "service" && "*"}
                  </label>
                  <input
                    {...register("model", {
                      required:
                        orderType === "service" ? "Model is required" : false,
                    })}
                    className="input-field"
                    placeholder="MacBook Pro 14"
                  />
                  {errors.model && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.model.message}
                    </p>
                  )}
                </div>
                {selectedDeviceType?.requiresSerialNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serial Number
                    </label>
                    <input
                      {...register("serialNumber")}
                      className="input-field"
                    />
                  </div>
                )}
                {selectedDeviceType?.requiresPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Device Password
                    </label>
                    <input
                      type="password"
                      {...register("password")}
                      className="input-field"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Problem Description Card */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Problem Description {orderType === "mixed" && "(Optional)"}
              </h2>
              <textarea
                {...register("problemDescription", {
                  required:
                    orderType === "service"
                      ? "Problem description is required"
                      : false,
                })}
                className="input-field resize-none"
                rows={4}
                placeholder="Describe the issue in detail..."
              />
              {errors.problemDescription && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.problemDescription.message}
                </p>
              )}
            </div>

            {/* Engineer Assignment Card */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Assign Engineer
              </h2>
              {engineers.length === 0 ? (
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      No engineers available
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Add an engineer to assign orders
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/users/new?type=engineer")}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add Engineer
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Engineer (Optional)
                  </label>
                  <select
                    value={selectedEngineerId}
                    onChange={(e) => setSelectedEngineerId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Assign Later</option>
                    {engineers.map((engineer) => (
                      <option key={engineer._id} value={engineer._id}>
                        {engineer.fullName}
                        {engineer.engineerDetails?.currentWorkload !==
                          undefined &&
                          ` (Workload: ${engineer.engineerDetails.currentWorkload})`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    You can assign or change the engineer later from the order
                    details page
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Order Items Section - Services and/or Products */}
        <OrderItemsSection
          orderType={orderType}
          selectedServices={selectedServices}
          serviceTypes={serviceTypes}
          customServiceName={customServiceName}
          customServicePrice={customServicePrice}
          onAddService={addService}
          onAddCustomService={addCustomService}
          onUpdateServiceField={updateServiceField}
          onRemoveService={removeService}
          onCustomServiceNameChange={setCustomServiceName}
          onCustomServicePriceChange={setCustomServicePrice}
          selectedProducts={selectedProducts}
          productSuggestions={productSuggestions}
          showProductDropdown={showProductDropdown}
          searchingProducts={searchingProducts}
          onProductSearchChange={setProductSearchQuery}
          onAddProduct={addProduct}
          onUpdateProductField={updateProductField}
          onRemoveProduct={removeProduct}
          onAddCustomProduct={addCustomProduct}
          invoiceAmounts={invoiceAmounts}
          taxRate={taxRate}
          additionalDiscount={additionalDiscount}
          onAdditionalDiscountChange={setAdditionalDiscount}
          paidAmount={paidAmount}
          onPaidAmountChange={setPaidAmount}
        />

        {/* Priority & Payment Status Card */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Priority & Payment Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select {...register("priority")} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <div className="input-field bg-gray-50 flex items-center">
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    paidAmount === 0
                      ? "bg-red-100 text-red-700"
                      : paidAmount >= invoiceAmounts.finalAmount
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {paidAmount === 0
                    ? "Unpaid"
                    : paidAmount >= invoiceAmounts.finalAmount
                    ? "Paid"
                    : "Partial"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Order
              </>
            )}
          </button>
        </div>
      </form>

      {/* Customer Creation Modal - Outside the form to prevent conflicts */}
      <CustomerCreateModal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          // Clear AI-generated customer info when modal is closed
          setAiGeneratedCustomerInfo(null);
        }}
        onCustomerCreated={(customer) => {
          setSelectedCustomer(customer);
          setCustomerSearchQuery(customer.fullName);
          setShowCustomerModal(false);
          // Clear AI-generated customer info after use
          setAiGeneratedCustomerInfo(null);
        }}
        prefillData={
          aiGeneratedCustomerInfo || {
            name: customerSearchQuery,
            phone: customerSearchQuery,
          }
        }
      />
    </div>
  );
};

export default NewOrderPage;
