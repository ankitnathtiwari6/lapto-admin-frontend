import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deviceTypeService } from "../services/deviceTypeService";
import { serviceTypeService } from "../services/serviceTypeService";
import { orderService } from "../services/orderService";
import { userService } from "../services/userService";
import { customerService } from "../services/customerService";
import type { CreateOrderData } from "../services/orderService";
import type { DeviceType, ServiceType, User } from "../types";
import type { Customer } from "../services/customerService";
import { Plus, ArrowLeft, X, Trash2 } from "lucide-react";
import CustomerCreateModal from "../components/CustomerCreateModal";
import BulkImportPanel from "../components/BulkImportPanel";

interface OrderRow {
  id: string;
  customer: Customer | null;
  customerSearchQuery: string;
  showCustomerDropdown: boolean;
  services: Array<{
    serviceType: ServiceType;
    quantity: number;
  }>;
  serviceSearchQuery: string;
  showServiceDropdown: boolean;
  deviceTypeId: string;
  brand: string;
  model: string;
  serialNumber: string;
  password: string;
  problemDescription: string;
  engineerId: string;
}

const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"manual" | "bulk">("manual");
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [savingRows, setSavingRows] = useState<{ [rowId: string]: boolean }>(
    {}
  );
  const [fetchingData, setFetchingData] = useState(true);

  // Orders data - array of rows
  const [orderRows, setOrderRows] = useState<OrderRow[]>([
    createEmptyOrderRow(),
  ]);

  // Customer suggestions per row
  const [customerSuggestions, setCustomerSuggestions] = useState<{
    [rowId: string]: Customer[];
  }>({});

  // Service suggestions per row
  const [serviceSuggestions, setServiceSuggestions] = useState<{
    [rowId: string]: ServiceType[];
  }>({});

  // Customer creation modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string>("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  function createEmptyOrderRow(): OrderRow {
    return {
      id: `row-${Date.now()}-${Math.random()}`,
      customer: null,
      customerSearchQuery: "",
      showCustomerDropdown: false,
      services: [],
      serviceSearchQuery: "",
      showServiceDropdown: false,
      deviceTypeId: "",
      brand: "",
      model: "",
      serialNumber: "",
      password: "",
      problemDescription: "",
      engineerId: "",
    };
  }

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

  const addNewOrderRow = () => {
    setOrderRows((prevRows) => [...prevRows, createEmptyOrderRow()]);
  };

  const removeOrderRow = (rowId: string) => {
    setOrderRows((prevRows) => {
      if (prevRows.length === 1) {
        alert("You must have at least one order row");
        return prevRows;
      }
      return prevRows.filter((row) => row.id !== rowId);
    });
  };

  const updateOrderRow = (rowId: string, updates: Partial<OrderRow>) => {
    setOrderRows((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, ...updates } : row))
    );
  };

  // Customer search with debounce
  const handleCustomerSearch = async (rowId: string, query: string) => {
    updateOrderRow(rowId, {
      customerSearchQuery: query,
      customer: null,
      showCustomerDropdown: true,
    });

    if (query.length >= 2) {
      try {
        const response = await customerService.search(query);
        setCustomerSuggestions((prev) => ({
          ...prev,
          [rowId]: response.data || [],
        }));
      } catch (error) {
        console.error("Error searching customers:", error);
        setCustomerSuggestions((prev) => ({ ...prev, [rowId]: [] }));
      }
    } else {
      setCustomerSuggestions((prev) => ({ ...prev, [rowId]: [] }));
    }
  };

  const handleCustomerSelect = (rowId: string, customer: Customer) => {
    updateOrderRow(rowId, {
      customer,
      customerSearchQuery: customer.fullName,
      showCustomerDropdown: false,
    });
  };

  const handleServiceSearch = (rowId: string, query: string) => {
    updateOrderRow(rowId, {
      serviceSearchQuery: query,
      showServiceDropdown: false,
    });

    if (query.length >= 1) {
      const filtered = serviceTypes.filter((st) =>
        st.name.toLowerCase().includes(query.toLowerCase())
      );
      setServiceSuggestions((prev) => ({ ...prev, [rowId]: filtered }));
      updateOrderRow(rowId, { showServiceDropdown: true });
    } else {
      setServiceSuggestions((prev) => ({ ...prev, [rowId]: [] }));
    }
  };

  const handleServiceSelect = (rowId: string, serviceType: ServiceType) => {
    setOrderRows((prevRows) => {
      const row = prevRows.find((r) => r.id === rowId);
      if (!row) return prevRows;

      // Check if service already added
      if (row.services.find((s) => s.serviceType._id === serviceType._id)) {
        alert("This service is already added");
        return prevRows;
      }

      return prevRows.map((r) =>
        r.id === rowId
          ? {
              ...r,
              services: [...r.services, { serviceType, quantity: 1 }],
              serviceSearchQuery: "",
              showServiceDropdown: false,
            }
          : r
      );
    });
  };

  const removeService = (rowId: string, serviceTypeId: string) => {
    setOrderRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              services: row.services.filter(
                (s) => s.serviceType._id !== serviceTypeId
              ),
            }
          : row
      )
    );
  };

  const updateServiceQuantity = (
    rowId: string,
    serviceTypeId: string,
    quantity: number
  ) => {
    setOrderRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              services: row.services.map((s) =>
                s.serviceType._id === serviceTypeId ? { ...s, quantity } : s
              ),
            }
          : row
      )
    );
  };

  const handleBulkImport = async (parsedData: any[]) => {
    // Convert parsed data to OrderRow format
    const newOrderRows: OrderRow[] = parsedData.map((data) => ({
      ...createEmptyOrderRow(),
      customerSearchQuery: data.customerName,
      model: data.model,
      problemDescription: data.description,
      serviceSearchQuery: data.problem,
    }));

    // Replace current order rows with imported ones
    setOrderRows(newOrderRows);

    // Switch to manual tab
    setActiveTab("manual");

    // Trigger customer search for each row after state has been updated
    setTimeout(() => {
      newOrderRows.forEach((row) => {
        if (row.customerSearchQuery) {
          handleCustomerSearch(row.id, row.customerSearchQuery);
        }
        // Also trigger service search to show suggestions
        if (row.serviceSearchQuery) {
          handleServiceSearch(row.id, row.serviceSearchQuery);
        }
      });
    }, 300);
  };

  const handleSaveRow = async (rowId: string) => {
    // Get the current row state
    let currentRow: OrderRow | undefined;
    setOrderRows((prevRows) => {
      currentRow = prevRows.find((r) => r.id === rowId);
      return prevRows;
    });

    if (!currentRow) return;

    const row = currentRow; // For TypeScript to recognize it's defined

    // Validate row
    if (!row.customer) {
      alert("Please select a customer");
      return;
    }
    if (row.services.length === 0) {
      alert("Please add at least one service");
      return;
    }
    if (!row.deviceTypeId) {
      alert("Please select a device type");
      return;
    }
    if (!row.model) {
      alert("Please enter device model");
      return;
    }
    if (!row.problemDescription) {
      alert("Please enter problem description");
      return;
    }

    setSavingRows((prev) => ({ ...prev, [rowId]: true }));
    try {
      const deviceType = deviceTypes.find((d) => d._id === row.deviceTypeId);
      const orderData: CreateOrderData = {
        orderType: "service",
        customer: {
          customerId: row.customer._id,
          name: row.customer.fullName,
          phone: row.customer.phone,
          email: row.customer.email,
          address: row.customer.customerDetails?.address,
        },
        device: {
          deviceTypeId: row.deviceTypeId,
          deviceTypeName: deviceType?.name || "",
          brand: row.brand,
          model: row.model,
          attributes: {},
          serialNumber: row.serialNumber,
          password: row.password,
        },
        problemDescription: row.problemDescription,
        customerComplaints: [row.problemDescription],
        priority: "medium",
        services: row.services.map((s) => ({
          serviceTypeId: s.serviceType._id,
          serviceTypeName: s.serviceType.name,
          description: s.serviceType.description,
          quantity: s.quantity,
          unitPrice: 0,
          discount: 0,
          taxRate: 18,
          estimatedCost: 0,
        })),
        engineerId: row.engineerId || undefined,
        discount: 0,
        taxRate: 18,
        paidAmount: 0,
        estimatedCost: 0,
        advancePayment: 0,
      } as any;

      const response = await orderService.create(orderData);
      const responseData: any = response.data;
      const order = responseData?.order || responseData;

      alert(`Order created successfully!\nOrder Number: ${order.orderNumber}`);

      // Remove the saved row
      setOrderRows((prevRows) => {
        const filteredRows = prevRows.filter((r) => r.id !== rowId);
        // If no rows left, add a new empty row
        return filteredRows.length === 0 ? [createEmptyOrderRow()] : filteredRows;
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating order");
    } finally {
      setSavingRows((prev) => ({ ...prev, [rowId]: false }));
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
    <div className="">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            New Service Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Add multiple orders in spreadsheet style or bulk import from Google Sheets
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("manual")}
              className={`${
                activeTab === "manual"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`${
                activeTab === "bulk"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Bulk Import
            </button>
          </nav>
        </div>
      </div>

      {/* Manual Entry Tab */}
      {activeTab === "manual" && (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden lg:block rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 w-12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[220px]">
                  Customer *
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[280px]">
                  Services *
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[180px]">
                  Engineer
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-200 text-sm text-gray-600 text-center font-medium">
                    {index + 1}
                  </td>

                  {/* Customer Cell */}
                  <td className="px-4 py-3 border-r border-gray-200 relative">
                    {row.customer ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md text-sm font-medium">
                          {row.customer.fullName}
                          <button
                            onClick={() =>
                              updateOrderRow(row.id, {
                                customer: null,
                                customerSearchQuery: "",
                              })
                            }
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
                          value={row.customerSearchQuery}
                          onChange={(e) =>
                            handleCustomerSearch(row.id, e.target.value)
                          }
                          onFocus={() => {
                            updateOrderRow(row.id, {
                              showCustomerDropdown: true,
                            });
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              updateOrderRow(row.id, {
                                showCustomerDropdown: false,
                              });
                            }, 200);
                          }}
                          placeholder="Search customer..."
                          className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {row.showCustomerDropdown && (
                          <div className="absolute z-50 w-72 mt-1 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                            {row.customerSearchQuery.length >= 2 ? (
                              customerSuggestions[row.id]?.length > 0 ? (
                                customerSuggestions[row.id].map((customer) => (
                                  <button
                                    key={customer._id}
                                    type="button"
                                    onClick={() =>
                                      handleCustomerSelect(row.id, customer)
                                    }
                                    className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b"
                                  >
                                    <div className="font-medium text-sm text-gray-900">
                                      {customer.fullName}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-0.5">
                                      {customer.phone}
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-sm text-gray-500">
                                  No customers found
                                </div>
                              )
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                Type at least 2 characters to search
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setActiveRowId(row.id);
                                setShowCustomerModal(true);
                                updateOrderRow(row.id, {
                                  showCustomerDropdown: false,
                                });
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-purple-50 text-purple-600 font-medium text-sm border-t border-gray-200"
                            >
                              + New Customer
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </td>

                  {/* Services Cell */}
                  <td className="px-4 py-3 border-r border-gray-200 relative">
                    <div className="space-y-1.5">
                      {row.services.map((service) => (
                        <div
                          key={service.serviceType._id}
                          className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md text-sm"
                        >
                          <span className="flex-1 font-medium text-blue-900">
                            {service.serviceType.name}
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={service.quantity}
                            onChange={(e) =>
                              updateServiceQuantity(
                                row.id,
                                service.serviceType._id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                          <button
                            onClick={() =>
                              removeService(row.id, service.serviceType._id)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={row.serviceSearchQuery}
                        onChange={(e) =>
                          handleServiceSearch(row.id, e.target.value)
                        }
                        onFocus={() => {
                          if (serviceSuggestions[row.id]?.length > 0) {
                            updateOrderRow(row.id, {
                              showServiceDropdown: true,
                            });
                          }
                        }}
                        placeholder="Add service..."
                        className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {row.showServiceDropdown &&
                        serviceSuggestions[row.id]?.length > 0 && (
                          <div className="absolute z-50 w-72 mt-1 bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                            {serviceSuggestions[row.id].map((serviceType) => (
                              <button
                                key={serviceType._id}
                                type="button"
                                onClick={() =>
                                  handleServiceSelect(row.id, serviceType)
                                }
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0"
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
                            ))}
                          </div>
                        )}
                    </div>
                  </td>

                  {/* Device Type Cell */}
                  <td className="px-4 py-3 border-r border-gray-200">
                    <select
                      value={row.deviceTypeId}
                      onChange={(e) =>
                        updateOrderRow(row.id, { deviceTypeId: e.target.value })
                      }
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
                      value={row.brand}
                      onChange={(e) =>
                        updateOrderRow(row.id, { brand: e.target.value })
                      }
                      placeholder="Enter brand..."
                      className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>

                  {/* Model Cell */}
                  <td className="px-4 py-3 border-r border-gray-200">
                    <input
                      type="text"
                      value={row.model}
                      onChange={(e) =>
                        updateOrderRow(row.id, { model: e.target.value })
                      }
                      placeholder="Enter model..."
                      className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>

                  {/* Problem Cell - Made resizable */}
                  <td className="px-4 py-3 border-r border-gray-200">
                    <textarea
                      value={row.problemDescription}
                      onChange={(e) =>
                        updateOrderRow(row.id, {
                          problemDescription: e.target.value,
                        })
                      }
                      placeholder="Describe the problem..."
                      rows={2}
                      className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                    />
                  </td>

                  {/* Engineer Cell */}
                  <td className="px-4 py-3 border-r border-gray-200">
                    <select
                      value={row.engineerId}
                      onChange={(e) =>
                        updateOrderRow(row.id, { engineerId: e.target.value })
                      }
                      className="w-full h-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Assign later...</option>
                      {engineers.map((eng) => (
                        <option key={eng._id} value={eng._id}>
                          {eng.fullName}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Actions Cell */}
                  <td className="px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleSaveRow(row.id)}
                        disabled={savingRows[row.id]}
                        className="px-2.5 py-1.5 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        title="Save order"
                      >
                        {savingRows[row.id] ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
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
                        ) : (
                          "Save"
                        )}
                      </button>
                      <button
                        onClick={() => removeOrderRow(row.id)}
                        disabled={orderRows.length === 1}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        title="Delete row"
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

        {/* Add Row Button */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-center">
          <button
            onClick={addNewOrderRow}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add New Order Row
          </button>
        </div>
      </div>

      {/* Mobile Card View - Hidden on desktop */}
      <div className="lg:hidden space-y-4">
        {orderRows.map((row, index) => (
          <div
            key={row.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold">Order #{index + 1}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveRow(row.id)}
                  disabled={savingRows[row.id]}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium disabled:opacity-50"
                  title="Save order"
                >
                  {savingRows[row.id] ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  ) : (
                    "Save"
                  )}
                </button>
                {orderRows.length > 1 && (
                  <button
                    onClick={() => removeOrderRow(row.id)}
                    className="p-2 bg-white text-red-600 rounded-full"
                    title="Delete order"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
              {/* Customer */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer *
                </label>
                {row.customer ? (
                  <div className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md text-sm font-medium">
                      {row.customer.fullName}
                    </span>
                    <button
                      onClick={() =>
                        updateOrderRow(row.id, {
                          customer: null,
                          customerSearchQuery: "",
                        })
                      }
                      className="p-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={row.customerSearchQuery}
                      onChange={(e) =>
                        handleCustomerSearch(row.id, e.target.value)
                      }
                      onFocus={() => {
                        updateOrderRow(row.id, {
                          showCustomerDropdown: true,
                        });
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          updateOrderRow(row.id, {
                            showCustomerDropdown: false,
                          });
                        }, 200);
                      }}
                      placeholder="Search customer..."
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {row.showCustomerDropdown && (
                      <div className="relative z-50 mt-2 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                        {row.customerSearchQuery.length >= 2 ? (
                          customerSuggestions[row.id]?.length > 0 ? (
                            customerSuggestions[row.id].map((customer) => (
                              <button
                                key={customer._id}
                                type="button"
                                onClick={() =>
                                  handleCustomerSelect(row.id, customer)
                                }
                                className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b"
                              >
                                <div className="font-medium text-base text-gray-900">
                                  {customer.fullName}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {customer.phone}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-base text-gray-500">
                              No customers found
                            </div>
                          )
                        ) : (
                          <div className="px-4 py-3 text-base text-gray-500">
                            Type at least 2 characters to search
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setActiveRowId(row.id);
                            setShowCustomerModal(true);
                            updateOrderRow(row.id, {
                              showCustomerDropdown: false,
                            });
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-purple-50 text-purple-600 font-medium text-base border-t border-gray-200"
                        >
                          + New Customer
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Services *
                </label>
                <div className="space-y-2">
                  {row.services.map((service) => (
                    <div
                      key={service.serviceType._id}
                      className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md"
                    >
                      <span className="flex-1 text-sm font-medium text-blue-900">
                        {service.serviceType.name}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) =>
                          updateServiceQuantity(
                            row.id,
                            service.serviceType._id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center text-sm"
                      />
                      <button
                        onClick={() =>
                          removeService(row.id, service.serviceType._id)
                        }
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={row.serviceSearchQuery}
                    onChange={(e) =>
                      handleServiceSearch(row.id, e.target.value)
                    }
                    onFocus={() => {
                      if (serviceSuggestions[row.id]?.length > 0) {
                        updateOrderRow(row.id, {
                          showServiceDropdown: true,
                        });
                      }
                    }}
                    placeholder="Add service..."
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {row.showServiceDropdown &&
                    serviceSuggestions[row.id]?.length > 0 && (
                      <div className="relative z-50 mt-2 bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                        {serviceSuggestions[row.id].map((serviceType) => (
                          <button
                            key={serviceType._id}
                            type="button"
                            onClick={() =>
                              handleServiceSelect(row.id, serviceType)
                            }
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0"
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
                        ))}
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
                  value={row.deviceTypeId}
                  onChange={(e) =>
                    updateOrderRow(row.id, { deviceTypeId: e.target.value })
                  }
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
                  value={row.brand}
                  onChange={(e) =>
                    updateOrderRow(row.id, { brand: e.target.value })
                  }
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
                  value={row.model}
                  onChange={(e) =>
                    updateOrderRow(row.id, { model: e.target.value })
                  }
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
                  value={row.problemDescription}
                  onChange={(e) =>
                    updateOrderRow(row.id, {
                      problemDescription: e.target.value,
                    })
                  }
                  placeholder="Describe the problem..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                />
              </div>

              {/* Engineer */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Engineer
                </label>
                <select
                  value={row.engineerId}
                  onChange={(e) =>
                    updateOrderRow(row.id, { engineerId: e.target.value })
                  }
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Assign later...</option>
                  {engineers.map((eng) => (
                    <option key={eng._id} value={eng._id}>
                      {eng.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Order Button - Mobile */}
        <button
          onClick={addNewOrderRow}
          className="flex items-center justify-center gap-2 px-4 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Order
        </button>
      </div>

          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orderRows.length}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Import Tab */}
      {activeTab === "bulk" && <BulkImportPanel onImport={handleBulkImport} />}

      {/* Customer Creation Modal */}
      <CustomerCreateModal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setActiveRowId("");
        }}
        onCustomerCreated={(customer) => {
          if (activeRowId) {
            updateOrderRow(activeRowId, {
              customer,
              customerSearchQuery: customer.fullName,
            });
          }
          setShowCustomerModal(false);
          setActiveRowId("");
        }}
        prefillData={{}}
      />
    </div>
  );
};

export default NewOrderPage;
