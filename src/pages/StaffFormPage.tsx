import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../lib/api";
import { ArrowLeft, Save, User as UserIcon, DollarSign } from "lucide-react";

interface FormData {
  fullName: string;
  email?: string;
  phone: string;
  password?: string;
  role: "super_admin" | "admin" | "engineer" | "accountant" | "reception";
  status: "active" | "inactive" | "suspended";

  // Compensation Details
  compensationType?: "fixed" | "commission" | "both";
  fixedSalary?: number;
  commissionRate?: number;
  commissionType?: "percentage" | "fixed_per_order";
  fixedCommissionAmount?: number;
}

const StaffFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      role: "engineer",
      status: "active",
      compensationType: "fixed",
      commissionType: "percentage",
      fixedSalary: 0,
      commissionRate: 0,
      fixedCommissionAmount: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);

  const compensationType = watch("compensationType");
  const commissionType = watch("commissionType");

  useEffect(() => {
    if (isEdit) {
      fetchStaff();
    }
  }, [id]);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get(`/staff/${id}`);
      const staff = data.data;

      setValue("fullName", staff.fullName);
      setValue("email", staff.email || "");
      setValue("phone", staff.phone);
      setValue("role", staff.role);
      setValue("status", staff.status);
      setValue("compensationType", staff.compensationType || "fixed");
      setValue("fixedSalary", staff.fixedSalary || 0);
      setValue("commissionRate", staff.commissionRate || 0);
      setValue("commissionType", staff.commissionType || "percentage");
      setValue("fixedCommissionAmount", staff.fixedCommissionAmount || 0);
    } catch (error) {
      console.error("Error fetching staff:", error);
      alert("Error loading staff data");
    } finally {
      setFetchingData(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const staffData: any = {
        fullName: formData.fullName,
        email: formData.email || undefined,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        compensationType: formData.compensationType,
        fixedSalary: formData.fixedSalary || 0,
        commissionRate: formData.commissionRate || 0,
        commissionType: formData.commissionType,
        fixedCommissionAmount: formData.fixedCommissionAmount || 0,
      };

      // Only include password if creating new staff or if password is provided
      if (!isEdit && formData.password) {
        staffData.password = formData.password;
      } else if (isEdit && formData.password) {
        staffData.password = formData.password;
      }

      if (isEdit) {
        await api.put(`/staff/${id}`, staffData);
        alert("Staff updated successfully!");
      } else {
        await api.post("/staff", staffData);
        alert("Staff created successfully!");
      }

      navigate("/staff");
    } catch (error: any) {
      alert(error.response?.data?.message || `Error ${isEdit ? "updating" : "creating"} staff`);
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
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? "Edit Staff Member" : "Add New Staff Member"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEdit ? "Update staff member information" : "Create a new staff member account"}
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

        {/* Role & Status Card */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Role & Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select {...register("role")} className="input-field">
                <option value="engineer">Engineer</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="accountant">Accountant</option>
                <option value="reception">Reception</option>
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

        {/* Compensation Details Card */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Compensation Details
          </h2>

          <div className="space-y-4">
            {/* Compensation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compensation Type *
              </label>
              <select {...register("compensationType")} className="input-field">
                <option value="fixed">Fixed Salary Only</option>
                <option value="commission">Commission Only</option>
                <option value="both">Fixed Salary + Commission</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose how this staff member will be compensated
              </p>
            </div>

            {/* Fixed Salary */}
            {(compensationType === "fixed" || compensationType === "both") && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Fixed Salary</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    {...register("fixedSalary", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Salary cannot be negative" }
                    })}
                    className="input-field"
                    placeholder="25000"
                    min="0"
                  />
                  {errors.fixedSalary && (
                    <p className="text-red-500 text-xs mt-1">{errors.fixedSalary.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Commission Details */}
            {(compensationType === "commission" || compensationType === "both") && (
              <div className="p-4 bg-green-50 rounded-lg space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Commission Details</h3>

                {/* Commission Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Type *
                  </label>
                  <select {...register("commissionType")} className="input-field">
                    <option value="percentage">Percentage of Order Value</option>
                    <option value="fixed_per_order">Fixed Amount Per Order</option>
                  </select>
                </div>

                {/* Percentage Commission */}
                {commissionType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      {...register("commissionRate", {
                        valueAsNumber: true,
                        min: { value: 0, message: "Rate cannot be negative" },
                        max: { value: 100, message: "Rate cannot exceed 100%" }
                      })}
                      className="input-field"
                      placeholder="10"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    {errors.commissionRate && (
                      <p className="text-red-500 text-xs mt-1">{errors.commissionRate.message}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Example: 10% means ₹1,000 commission on a ₹10,000 order
                    </p>
                  </div>
                )}

                {/* Fixed Per Order Commission */}
                {commissionType === "fixed_per_order" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fixed Commission Per Order (₹)
                    </label>
                    <input
                      type="number"
                      {...register("fixedCommissionAmount", {
                        valueAsNumber: true,
                        min: { value: 0, message: "Amount cannot be negative" }
                      })}
                      className="input-field"
                      placeholder="500"
                      min="0"
                    />
                    {errors.fixedCommissionAmount && (
                      <p className="text-red-500 text-xs mt-1">{errors.fixedCommissionAmount.message}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      This fixed amount will be paid per completed order
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-900 mb-2">Compensation Summary</h4>
              <div className="text-sm text-gray-700 space-y-1">
                {compensationType === "fixed" && (
                  <p>• This staff member will receive a fixed monthly salary only</p>
                )}
                {compensationType === "commission" && (
                  <p>• This staff member will receive commission only (no fixed salary)</p>
                )}
                {compensationType === "both" && (
                  <>
                    <p>• This staff member will receive both fixed salary and commission</p>
                    <p>• Total compensation = Fixed Salary + Commission from orders</p>
                  </>
                )}
              </div>
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
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Update Staff" : "Create Staff"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffFormPage;
