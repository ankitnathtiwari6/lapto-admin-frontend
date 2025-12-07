import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, User, Mail, Phone } from "lucide-react";
import api from "../../lib/api";

interface Staff {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Company {
  _id: string;
  companyName: string;
  gstin: string;
}

const CompanyStaffPage: React.FC = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    staffId: string;
    staffName: string;
  }>({ show: false, staffId: "", staffName: "" });

  const [newStaffData, setNewStaffData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
  });

  const fetchCompanyAndStaff = async () => {
    try {
      setLoading(true);
      const [companyRes, staffRes] = await Promise.all([
        api.get(`/companies/${companyId}`),
        api.get(`/lapto-admin/companies/${companyId}/users`),
      ]);
      setCompany(companyRes.data.data);
      setStaff(staffRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyAndStaff();
  }, [companyId]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/lapto-admin/company-users", {
        ...newStaffData,
        companyId,
      });
      setShowAddModal(false);
      setNewStaffData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "admin",
      });
      fetchCompanyAndStaff();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add staff");
    }
  };

  const handleDeleteStaff = async () => {
    try {
      await api.delete(`/lapto-admin/company-users/${deleteModal.staffId}`);
      setDeleteModal({ show: false, staffId: "", staffName: "" });
      fetchCompanyAndStaff();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete staff");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      case "engineer":
        return "bg-green-100 text-green-700";
      case "accountant":
        return "bg-yellow-100 text-yellow-700";
      case "reception":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/lapto-admin/companies")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Companies
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {company?.companyName}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage staff members for this company
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Staff List */}
      {staff.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No staff members added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add First Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {member.fullName}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        member.role
                      )}`}
                    >
                      {member.role.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setDeleteModal({
                      show: true,
                      staffId: member._id,
                      staffName: member.fullName,
                    })
                  }
                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {member.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {member.phone}
                </div>
                <div className="text-sm text-gray-500">
                  Status:{" "}
                  <span
                    className={
                      member.status === "active"
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Add New Staff Member
            </h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newStaffData.fullName}
                  onChange={(e) =>
                    setNewStaffData({ ...newStaffData, fullName: e.target.value })
                  }
                  required
                  className="input-field"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newStaffData.email}
                  onChange={(e) =>
                    setNewStaffData({ ...newStaffData, email: e.target.value })
                  }
                  required
                  className="input-field"
                  placeholder="staff@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={newStaffData.phone}
                  onChange={(e) =>
                    setNewStaffData({ ...newStaffData, phone: e.target.value })
                  }
                  required
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newStaffData.password}
                  onChange={(e) =>
                    setNewStaffData({ ...newStaffData, password: e.target.value })
                  }
                  required
                  className="input-field"
                  placeholder="Create password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={newStaffData.role}
                  onChange={(e) =>
                    setNewStaffData({ ...newStaffData, role: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="admin">Admin</option>
                  <option value="engineer">Engineer</option>
                  <option value="accountant">Accountant</option>
                  <option value="reception">Reception</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewStaffData({
                      fullName: "",
                      email: "",
                      phone: "",
                      password: "",
                      role: "admin",
                    });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Staff Member
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{deleteModal.staffName}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ show: false, staffId: "", staffName: "" })
                }
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyStaffPage;
