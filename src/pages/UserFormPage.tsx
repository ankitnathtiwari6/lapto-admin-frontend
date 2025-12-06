import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { userService } from "../services/userService";
import type { User } from "../types";
import { ArrowLeft, Save, User as UserIcon } from "lucide-react";

interface FormData {
  fullName: string;
  email?: string;
  phone: string;
  password?: string;
  userTypes: Array<"customer" | "engineer" | "admin">; // Changed to array
  role: "super_admin" | "admin" | "engineer" | "customer";
  status: "active" | "inactive" | "suspended";

  // Customer Details
  customerAddress?: string;
  customerAlternatePhone?: string;

  // Engineer Details
  engineerEmployeeId?: string;
  engineerSpecialization?: string;
  engineerJoinDate?: string;

  // Admin Details
  adminEmployeeId?: string;
  adminPermissions?: string;
  adminJoinDate?: string;
}

const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const defaultUserType = (searchParams.get("type") as "customer" | "engineer" | "admin") || "customer";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      userTypes: [defaultUserType], // Initialize with array
      role: defaultUserType === "admin" ? "admin" : defaultUserType,
      status: "active",
    },
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);
  const [selectedUserTypes, setSelectedUserTypes] = useState<Array<"customer" | "engineer" | "admin">>([defaultUserType]);

  const userTypes = watch("userTypes");

  useEffect(() => {
    if (isEdit) {
      fetchUser();
    }
  }, [id]);

  useEffect(() => {
    // Update role when userTypes changes (use the first/primary type)
    if (userTypes && userTypes.length > 0) {
      const primaryType = userTypes[0];
      if (primaryType === "admin") {
        setValue("role", "admin");
      } else {
        setValue("role", primaryType);
      }
    }
  }, [userTypes, setValue]);

  // Handle checkbox changes for userTypes
  const handleUserTypeToggle = (type: "customer" | "engineer" | "admin") => {
    const currentTypes = selectedUserTypes;
    let newTypes: Array<"customer" | "engineer" | "admin">;

    if (currentTypes.includes(type)) {
      // Remove if already selected (but keep at least one)
      newTypes = currentTypes.filter(t => t !== type);
      if (newTypes.length === 0) {
        // Don't allow removing all types
        return;
      }
    } else {
      // Add new type
      newTypes = [...currentTypes, type];
    }

    setSelectedUserTypes(newTypes);
    setValue("userTypes", newTypes);
  };

  const fetchUser = async () => {
    try {
      const response = await userService.getById(id!);
      const user = response.data!;

      // Set basic fields
      setValue("fullName", user.fullName);
      setValue("email", user.email || "");
      setValue("phone", user.phone);
      setValue("userTypes", user.userTypes);
      setSelectedUserTypes(user.userTypes);
      setValue("role", user.role);
      setValue("status", user.status);

      // Set customer details
      if (user.customerDetails) {
        setValue("customerAddress", user.customerDetails.address || "");
        setValue("customerAlternatePhone", user.customerDetails.alternatePhone || "");
      }

      // Set engineer details
      if (user.engineerDetails) {
        setValue("engineerEmployeeId", user.engineerDetails.employeeId || "");
        setValue("engineerSpecialization", user.engineerDetails.specialization?.join(", ") || "");
        setValue("engineerJoinDate", user.engineerDetails.joinDate?.split("T")[0] || "");
      }

      // Set admin details
      if (user.adminDetails) {
        setValue("adminEmployeeId", user.adminDetails.employeeId || "");
        setValue("adminPermissions", user.adminDetails.permissions?.join(", ") || "");
        setValue("adminJoinDate", user.adminDetails.joinDate?.split("T")[0] || "");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Error loading user data");
    } finally {
      setFetchingData(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const userData: any = {
        fullName: formData.fullName,
        email: formData.email || undefined,
        phone: formData.phone,
        userTypes: formData.userTypes,
        role: formData.role,
        status: formData.status,
      };

      // Only include password if creating new user or if password is provided
      if (!isEdit && formData.password) {
        userData.password = formData.password;
      } else if (isEdit && formData.password) {
        userData.password = formData.password;
      }

      // Add type-specific details based on selected userTypes
      if (formData.userTypes.includes("customer")) {
        userData.customerDetails = {
          address: formData.customerAddress || undefined,
          alternatePhone: formData.customerAlternatePhone || undefined,
          totalOrders: 0,
          totalSpent: 0,
        };
      }

      if (formData.userTypes.includes("engineer")) {
        userData.engineerDetails = {
          employeeId: formData.engineerEmployeeId || undefined,
          specialization: formData.engineerSpecialization
            ? formData.engineerSpecialization.split(",").map((s) => s.trim())
            : [],
          currentWorkload: 0,
          rating: 0,
          totalRepairsCompleted: 0,
          joinDate: formData.engineerJoinDate || undefined,
        };
      }

      if (formData.userTypes.includes("admin")) {
        userData.adminDetails = {
          employeeId: formData.adminEmployeeId || undefined,
          permissions: formData.adminPermissions
            ? formData.adminPermissions.split(",").map((p) => p.trim())
            : [],
          joinDate: formData.adminJoinDate || undefined,
        };
      }

      if (isEdit) {
        await userService.update(id!, userData);
        alert("User updated successfully!");
      } else {
        await userService.create(userData);
        alert("User created successfully!");
      }

      // Navigate based on primary user type
      const primaryType = formData.userTypes[0];
      if (primaryType === "engineer") {
        navigate("/engineers");
      } else if (primaryType === "customer") {
        navigate("/customers");
      } else {
        navigate("/users");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || `Error ${isEdit ? "updating" : "creating"} user`);
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
            {isEdit ? "Edit User" : "Add New User"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEdit ? "Update user information" : "Create a new user account"}
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

        {/* User Type & Role Card */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            User Type & Access
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              User Types * (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUserTypes.includes("customer")}
                  onChange={() => handleUserTypeToggle("customer")}
                  disabled={isEdit}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Customer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUserTypes.includes("engineer")}
                  onChange={() => handleUserTypeToggle("engineer")}
                  disabled={isEdit}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Engineer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUserTypes.includes("admin")}
                  onChange={() => handleUserTypeToggle("admin")}
                  disabled={isEdit}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Admin</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isEdit
                ? "User types cannot be changed after creation"
                : "A user can have multiple roles (e.g., Customer + Engineer)"
              }
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select {...register("role")} className="input-field">
                <option value="customer">Customer</option>
                <option value="engineer">Engineer</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
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

        {/* Customer Details */}
        {selectedUserTypes.includes("customer") && (
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Customer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  {...register("customerAddress")}
                  className="input-field"
                  placeholder="123 Main Street, City"
                />
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
            </div>
          </div>
        )}

        {/* Engineer Details */}
        {selectedUserTypes.includes("engineer") && (
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Engineer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  {...register("engineerEmployeeId")}
                  className="input-field"
                  placeholder="EMP001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date
                </label>
                <input
                  type="date"
                  {...register("engineerJoinDate")}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  {...register("engineerSpecialization")}
                  className="input-field"
                  placeholder="Laptop Repair, Mobile Repair (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter specializations separated by commas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Details */}
        {selectedUserTypes.includes("admin") && (
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Admin Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  {...register("adminEmployeeId")}
                  className="input-field"
                  placeholder="ADM001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date
                </label>
                <input
                  type="date"
                  {...register("adminJoinDate")}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <input
                  {...register("adminPermissions")}
                  className="input-field"
                  placeholder="orders.create, orders.edit, users.view (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter permissions separated by commas
                </p>
              </div>
            </div>
          </div>
        )}

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
                {isEdit ? "Update User" : "Create User"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormPage;
