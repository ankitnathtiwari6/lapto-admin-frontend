import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { customerService } from "../services/customerService";
import { X, Save } from "lucide-react";
import type { Customer } from "../services/customerService";

interface CustomerFormData {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  alternatePhone?: string;
}

interface CustomerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
  prefillData?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

const CustomerCreateModal: React.FC<CustomerCreateModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
  prefillData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    defaultValues: {
      fullName: prefillData?.name || "",
      phone: prefillData?.phone || "",
      email: prefillData?.email || "",
      address: prefillData?.address || "",
    },
  });

  const [loading, setLoading] = useState(false);

  // Update form values when prefillData changes
  useEffect(() => {
    if (prefillData && isOpen) {
      reset({
        fullName: prefillData.name || "",
        phone: prefillData.phone || "",
        email: prefillData.email || "",
        address: prefillData.address || "",
      });
    }
  }, [prefillData, isOpen, reset]);

  const onSubmit = async (formData: CustomerFormData) => {
    setLoading(true);
    try {
      const customerData = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        customerDetails: {
          address: formData.address,
          alternatePhone: formData.alternatePhone,
          totalOrders: 0,
          totalSpent: 0,
        },
        status: "active" as const,
      };

      const response = await customerService.create(customerData);
      const newCustomer = response.data;

      // Reset form and close modal
      reset();
      onClose();

      // Notify parent component
      if (newCustomer) {
        onCustomerCreated(newCustomer);
      }
      
      alert("Customer created successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating customer");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              New Customer
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Add a new customer to the system
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6"
        >
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register("fullName", { required: "Full name is required" })}
                className="input-field"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone and Alternate Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: "Invalid phone number format",
                    },
                  })}
                  className="input-field"
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  {...register("alternatePhone")}
                  className="input-field"
                  placeholder="+91 98765 43211"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="input-field"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                {...register("address", { required: "Address is required" })}
                className="input-field resize-none"
                rows={3}
                placeholder="123 Main Street, City, State, PIN"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
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
                  <Save className="w-4 h-4" />
                  Save Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerCreateModal;
