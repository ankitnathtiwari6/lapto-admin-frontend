import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../lib/api";
import { ArrowLeft, Save, User as UserIcon } from "lucide-react";

interface FormData {
  fullName: string;
  email?: string;
  phone: string;
  password?: string;
  customerAddress: string;
  customerAlternatePhone?: string;
  customerType: "Retail" | "Dealer";
  status: "active" | "inactive" | "suspended";
}

const CustomerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      customerType: "Retail",
      status: "active",
    },
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${id}`);
      const customer = response.data.data;

      setValue("fullName", customer.fullName);
      setValue("email", customer.email || "");
      setValue("phone", customer.phone);
      setValue("status", customer.status);
      setValue("customerAddress", customer.customerDetails?.address || "");
      setValue("customerAlternatePhone", customer.customerDetails?.alternatePhone || "");
      setValue("customerType", customer.customerDetails?.customerType || "Retail");
    } catch (error) {
      console.error("Error fetching customer:", error);
      alert("Error loading customer data");
    } finally {
      setFetchingData(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const customerData: any = {
        fullName: formData.fullName,
        email: formData.email || undefined,
        phone: formData.phone,
        status: formData.status,
        customerDetails: {
          address: formData.customerAddress,
          alternatePhone: formData.customerAlternatePhone || undefined,
          customerType: formData.customerType,
          totalOrders: 0,
          totalSpent: 0,
        },
      };

      // Only include password if provided
      if (formData.password) {
        customerData.password = formData.password;
      }

      if (isEdit) {
        await api.put(`/customers/${id}`, customerData);
        alert("Customer updated successfully!");
      } else {
        await api.post("/customers", customerData);
        alert("Customer created successfully!");
      }

      navigate("/customers");
    } catch (error: any) {
      alert(error.response?.data?.message || `Error ${isEdit ? "updating" : "creating"} customer`);
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
          onClick={() => navigate("/customers")}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? "Edit Customer" : "Add New Customer"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEdit ? "Update customer information" : "Create a new customer account"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                {...register("phone", { required: "Phone is required" })}
                className="input-field"
                placeholder="+91 98765 43210"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="input-field"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {!isEdit && "*"}
              </label>
              <input
                type="password"
                {...register("password", {
                  required: !isEdit ? "Password is required" : false,
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="input-field"
                placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Details Card */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Customer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                {...register("customerAddress", { required: "Address is required" })}
                className="input-field"
                placeholder="123 Main Street, City"
              />
              {errors.customerAddress && (
                <p className="text-red-500 text-xs mt-1">{errors.customerAddress.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternate Phone
              </label>
              <input
                {...register("customerAlternatePhone")}
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type *
              </label>
              <select {...register("customerType")} className="input-field">
                <option value="Retail">Retail</option>
                <option value="Dealer">Dealer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select {...register("status")} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/customers")}
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
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Update Customer" : "Create Customer"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerFormPage;
