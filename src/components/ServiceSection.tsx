import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import type { ServiceType } from "../types";
import { serviceTypeService } from "../services/serviceTypeService";

interface SelectedService {
  serviceTypeId: string;
  serviceTypeName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  estimatedCost: number;
  isCustom?: boolean;
}

interface ServiceSectionProps {
  selectedServices: SelectedService[];
  serviceTypes: ServiceType[];
  customServiceName: string;
  customServicePrice: number;
  onAddService: (serviceType: ServiceType) => void;
  onAddCustomService: () => void;
  onUpdateServiceField: (serviceTypeId: string, field: string, value: any) => void;
  onRemoveService: (serviceTypeId: string) => void;
  onCustomServiceNameChange: (name: string) => void;
  onCustomServicePriceChange: (price: number) => void;
  invoiceAmounts: {
    subtotal: number;
    totalDiscount: number;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    totalTax: number;
    totalAmount: number;
    roundOff: number;
    finalAmount: number;
    balance: number;
  };
  taxRate: number;
  additionalDiscount?: number;
  onAdditionalDiscountChange?: (value: number) => void;
  paidAmount?: number;
  onPaidAmountChange?: (value: number) => void;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({
  selectedServices,
  onAddService,
  onAddCustomService,
  onUpdateServiceField,
  onRemoveService,
  onCustomServiceNameChange,
  onCustomServicePriceChange,
  additionalDiscount = 0,
  onAdditionalDiscountChange,
  paidAmount = 0,
  onPaidAmountChange,
}) => {
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [serviceSuggestions, setServiceSuggestions] = useState<ServiceType[]>([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [searchingServices, setSearchingServices] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(0);

  // Search services with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (serviceSearchQuery.length >= 2) {
        setSearchingServices(true);
        try {
          const response = await serviceTypeService.search(serviceSearchQuery);
          setServiceSuggestions(response.data || []);
          setShowServiceDropdown(true);
        } catch (error) {
          console.error("Error searching services:", error);
          setServiceSuggestions([]);
        } finally {
          setSearchingServices(false);
        }
      } else {
        setServiceSuggestions([]);
        setShowServiceDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [serviceSearchQuery]);

  const handleAddServiceOrCustom = () => {
    if (!serviceSearchQuery.trim()) {
      alert("Please enter a service name");
      return;
    }

    // Check if there's a matching service in suggestions
    const matchingService = serviceSuggestions.find(
      (s) => s.name.toLowerCase() === serviceSearchQuery.toLowerCase()
    );

    if (matchingService) {
      // Add predefined service
      onAddService(matchingService);
    } else {
      // Add custom service
      onCustomServiceNameChange(serviceSearchQuery);
      onCustomServicePriceChange(customPrice);
      onAddCustomService();
    }

    // Reset form
    setServiceSearchQuery("");
    setCustomPrice(0);
    setShowServiceDropdown(false);
  };

  const handleServiceSelect = (service: ServiceType) => {
    onAddService(service);
    setServiceSearchQuery("");
    setCustomPrice(0);
    setShowServiceDropdown(false);
  };
  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Services</h2>

      {/* Add Service Section - Unified Search and Add */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Add Service
        </p>
        <div className="relative">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-7 relative">
              <input
                type="text"
                value={serviceSearchQuery}
                onChange={(e) => setServiceSearchQuery(e.target.value)}
                className="w-full input-field"
                placeholder="Search or enter service name..."
              />

              {/* Service Suggestions Dropdown */}
              {showServiceDropdown && serviceSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {serviceSuggestions.map((service) => (
                    <button
                      key={service._id}
                      type="button"
                      onClick={() => handleServiceSelect(service)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {service.name}
                      </div>
                      {service.category && (
                        <div className="text-xs text-gray-500">
                          {service.category}
                        </div>
                      )}
                      {service.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {service.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {searchingServices && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
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
            </div>

            <div className="relative col-span-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                ₹
              </span>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                className="w-full input-field pl-7"
                placeholder="Price"
              />
            </div>

            <button
              type="button"
              onClick={handleAddServiceOrCustom}
              className="col-span-1 btn-primary whitespace-nowrap px-4"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {serviceSearchQuery.length >= 2 && serviceSuggestions.length === 0 && !searchingServices && (
            <p className="text-xs text-gray-500 mt-2">
              No matching services found. Enter a price and click + to add as custom service.
            </p>
          )}
        </div>
      </div>

      {/* Selected Services - Invoice Style Table */}
      {selectedServices.length > 0 && (
        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-purple-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">
                    Service
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800 w-20">
                    Qty
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800 w-28">
                    Price (₹)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800 w-28">
                    Disc. (₹)
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800 w-24">
                    GST (%)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800 w-32">
                    Amount (₹)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800 w-32">
                    Total + GST (₹)
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {selectedServices.map((service, index) => {
                  const itemAmount =
                    service.quantity * service.unitPrice - service.discount;
                  const gstAmount = (itemAmount * service.taxRate) / 100;
                  const totalWithGst = itemAmount + gstAmount;
                  return (
                    <tr
                      key={service.serviceTypeId}
                      className={`transition-colors hover:bg-purple-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {service.serviceTypeName}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) =>
                            onUpdateServiceField(
                              service.serviceTypeId,
                              "quantity",
                              Number(e.target.value) || 1
                            )
                          }
                          className="w-full px-2 py-1.5 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={service.unitPrice}
                          onChange={(e) =>
                            onUpdateServiceField(
                              service.serviceTypeId,
                              "unitPrice",
                              Number(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1.5 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={service.discount}
                          onChange={(e) =>
                            onUpdateServiceField(
                              service.serviceTypeId,
                              "discount",
                              Number(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1.5 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={service.taxRate}
                          onChange={(e) =>
                            onUpdateServiceField(
                              service.serviceTypeId,
                              "taxRate",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1.5 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow bg-white"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ₹{itemAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-purple-600 bg-purple-50/50">
                        ₹{totalWithGst.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveService(service.serviceTypeId)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          title="Remove service"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals Footer */}
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-right font-semibold text-gray-800">
                    Subtotal:
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    ₹{selectedServices.reduce((sum, s) => sum + (s.quantity * s.unitPrice - s.discount), 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-purple-600">
                    ₹{selectedServices.reduce((sum, s) => {
                      const itemAmount = s.quantity * s.unitPrice - s.discount;
                      const gstAmount = (itemAmount * s.taxRate) / 100;
                      return sum + itemAmount + gstAmount;
                    }, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4"></td>
                </tr>
                {onAdditionalDiscountChange && (
                  <tr>
                    <td colSpan={5} className="py-2 px-4 text-right text-sm text-gray-700">
                      Additional Discount (₹):
                    </td>
                    <td colSpan={2} className="py-2 px-4">
                      <input
                        type="number"
                        value={additionalDiscount}
                        onChange={(e) => onAdditionalDiscountChange(Number(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-4"></td>
                  </tr>
                )}
                {onPaidAmountChange && (
                  <>
                    <tr>
                      <td colSpan={5} className="py-2 px-4 text-right text-sm text-gray-700">
                        Paid Amount (₹):
                      </td>
                      <td colSpan={2} className="py-2 px-4">
                        <input
                          type="number"
                          value={paidAmount}
                          onChange={(e) => onPaidAmountChange(Number(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="py-2 px-4"></td>
                    </tr>
                    <tr className="bg-purple-50">
                      <td colSpan={5} className="py-3 px-4 text-right font-semibold text-gray-800">
                        Balance/Remaining Amount (₹):
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-right font-bold text-lg">
                        <span className={`${
                          (() => {
                            const total = selectedServices.reduce((sum, s) => {
                              const itemAmount = s.quantity * s.unitPrice - s.discount;
                              const gstAmount = (itemAmount * s.taxRate) / 100;
                              return sum + itemAmount + gstAmount;
                            }, 0);
                            const balance = total - additionalDiscount - paidAmount;
                            return balance <= 0 ? "text-green-600" : "text-orange-600";
                          })()
                        }`}>
                          ₹{(() => {
                            const total = selectedServices.reduce((sum, s) => {
                              const itemAmount = s.quantity * s.unitPrice - s.discount;
                              const gstAmount = (itemAmount * s.taxRate) / 100;
                              return sum + itemAmount + gstAmount;
                            }, 0);
                            const balance = total - additionalDiscount - paidAmount;
                            return balance.toFixed(2);
                          })()}
                        </span>
                      </td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSection;
