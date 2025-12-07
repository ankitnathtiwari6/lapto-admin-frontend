import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Trash2,
  Users,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import api from "../../lib/api";

interface Company {
  _id: string;
  companyName: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

const CompanyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    companyId: string;
    companyName: string;
  }>({ show: false, companyId: "", companyName: "" });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/lapto-admin/companies", {
        params: { search: search || undefined },
      });
      setCompanies(data.data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const handleDelete = async () => {
    try {
      await api.delete(`/lapto-admin/companies/${deleteModal.companyId}`);
      setDeleteModal({ show: false, companyId: "", companyName: "" });
      fetchCompanies();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete company");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">
            Manage all companies and their staff
          </p>
        </div>
        <button
          onClick={() => navigate("/lapto-admin/companies/new")}
          className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Add Company
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading companies...</div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No companies found</p>
          <button
            onClick={() => navigate("/lapto-admin/companies/new")}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add First Company
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company._id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {company.companyName}
                    </h3>
                    <p className="text-sm text-gray-500">GSTIN: {company.gstin}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {company.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </div>
                <div className="text-sm text-gray-600">
                  {company.city}, {company.state}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() =>
                    navigate(`/lapto-admin/companies/${company._id}/staff`)
                  }
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <Users className="w-4 h-4" />
                  Manage Staff
                </button>
                <button
                  onClick={() =>
                    setDeleteModal({
                      show: true,
                      companyId: company._id,
                      companyName: company.companyName,
                    })
                  }
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Company
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete{" "}
              <strong>{deleteModal.companyName}</strong>? This will also delete
              all staff members associated with this company. This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ show: false, companyId: "", companyName: "" })
                }
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyListPage;
