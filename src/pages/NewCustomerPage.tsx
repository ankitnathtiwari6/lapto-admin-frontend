import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { customerService } from "../services/customerService";
import { ArrowLeft, Save } from "lucide-react";

interface CustomerFormData {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  alternatePhone?: string;
}

const NewCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const prefillPhone = searchParams.get("prefillPhone");
  const prefillName = searchParams.get("prefillName");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    defaultValues: {
      phone: prefillPhone || '',
      fullName: prefillName || ''
    }
  });

  const [loading, setLoading] = useState(false);

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

      alert("Customer created successfully!");

      // Store newly created customer in sessionStorage for auto-selection
      if (newCustomer && returnTo === '/orders/new') {
        const savedState = sessionStorage.getItem('newOrderFormState');
        if (savedState) {
          const state = JSON.parse(savedState);
          state.selectedCustomer = newCustomer;
          state.customerSearchQuery = newCustomer.fullName;
          sessionStorage.setItem('newOrderFormState', JSON.stringify(state));
        }
      }

      // Navigate back to where we came from or to orders
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate("/orders/new");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">New Customer</h1>
          <p className="text-gray-500 text-sm mt-1">
            Add a new customer to the system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                {...register("address")}
                className="input-field"
                placeholder="123 Main Street, City"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
                <Save className="w-4 h-4" />
                Save Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCustomerPage;
