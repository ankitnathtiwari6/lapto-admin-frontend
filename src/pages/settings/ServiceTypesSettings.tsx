import React, { useEffect, useState } from "react";
import { serviceTypeService } from "../../services/serviceTypeService";
import type { ServiceType } from "../../types";
import { Plus, Wrench, Clock, Shield, Tag, RefreshCw, X } from "lucide-react";

const defaultServiceSuggestions = [
  {
    name: "Screen Replacement",
    description: "Complete screen/display replacement",
    category: "Hardware",
    duration: 2,
    warranty: 90,
  },
  {
    name: "Battery Replacement",
    description: "Replace old or damaged battery",
    category: "Hardware",
    duration: 1,
    warranty: 180,
  },
  {
    name: "Keyboard Replacement",
    description: "Replace damaged keyboard",
    category: "Hardware",
    duration: 2,
    warranty: 90,
  },
  {
    name: "OS Installation",
    description: "Fresh operating system installation",
    category: "Software",
    duration: 2,
    warranty: 30,
  },
  {
    name: "Virus Removal",
    description: "Complete virus and malware removal",
    category: "Software",
    duration: 1,
    warranty: 30,
  },
  {
    name: "Data Recovery",
    description: "Recover lost or deleted data",
    category: "Data",
    duration: 4,
    warranty: 0,
  },
  {
    name: "RAM Upgrade",
    description: "Upgrade system RAM",
    category: "Hardware",
    duration: 1,
    warranty: 365,
  },
  {
    name: "SSD Upgrade",
    description: "Upgrade to faster SSD storage",
    category: "Hardware",
    duration: 2,
    warranty: 365,
  },
  {
    name: "Motherboard Repair",
    description: "Diagnose and repair motherboard",
    category: "Hardware",
    duration: 4,
    warranty: 90,
  },
  {
    name: "General Checkup",
    description: "System diagnostic and cleaning",
    category: "Maintenance",
    duration: 1,
    warranty: 7,
  },
];

const ServiceTypesSettings: React.FC = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    category: "",
    estimatedDuration: 1,
    warrantyPeriod: 30,
  });

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      const res = await serviceTypeService.getAll();
      setServiceTypes(res.data || []);
    } catch (error) {
      console.error("Error fetching service types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedServiceTypes = async () => {
    setSeeding(true);
    try {
      await serviceTypeService.seed();
      await fetchServiceTypes();
      alert("Service types seeded successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error seeding service types");
    } finally {
      setSeeding(false);
    }
  };

  const openModal = () => {
    setServiceForm({
      name: "",
      description: "",
      category: "",
      estimatedDuration: 1,
      warrantyPeriod: 30,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setServiceForm({
      name: "",
      description: "",
      category: "",
      estimatedDuration: 1,
      warrantyPeriod: 30,
    });
  };

  const handleSaveService = async () => {
    if (!serviceForm.name) return alert("Name is required");
    setSaving(true);
    try {
      await serviceTypeService.create({
        name: serviceForm.name,
        slug: serviceForm.name.toLowerCase().replace(/\s+/g, "-"),
        description: serviceForm.description,
        estimatedDuration: serviceForm.estimatedDuration,
        category: serviceForm.category,
        warrantyPeriod: serviceForm.warrantyPeriod,
        isActive: true,
      });
      await fetchServiceTypes();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating service type");
    } finally {
      setSaving(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
    setServiceForm({
      name: suggestion.name,
      description: suggestion.description,
      category: suggestion.category,
      estimatedDuration: suggestion.duration,
      warrantyPeriod: suggestion.warranty,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading service types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Service Types
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage service types and their configurations
          </p>
        </div>
        <div className="flex gap-2">
          {serviceTypes.length === 0 && (
            <button
              onClick={handleSeedServiceTypes}
              disabled={seeding}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`}
              />
              Seed Service Types
            </button>
          )}
          <button
            onClick={openModal}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </div>
      </div>

      {/* Service Types List */}
      <div className="space-y-3">
        {serviceTypes.map((serviceType) => (
          <div
            key={serviceType._id}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left Section - Icon and Name */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Wrench className="w-6 h-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {serviceType.name}
                    </h3>
                    {serviceType.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded">
                        <Tag className="w-3 h-3" />
                        {serviceType.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {serviceType.description}
                  </p>
                </div>
              </div>

              {/* Middle Section - Duration and Warranty */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium text-gray-900">
                      {serviceType.estimatedDuration || "N/A"} hrs
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Warranty</p>
                    <p className="text-sm font-medium text-gray-900">
                      {serviceType.warrantyPeriod || 0} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Section - Status */}
              <div className="shrink-0">
                <span
                  className={`badge ${
                    serviceType.isActive
                      ? "badge-completed"
                      : "badge-cancelled"
                  }`}
                >
                  {serviceType.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        ))}
        {serviceTypes.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500">No service types found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Service Type
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Suggestions */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Quick Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {defaultServiceSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => applySuggestion(s)}
                      className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Screen Replacement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Brief description of the service"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        category: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="">Select Category</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Data">Data</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={serviceForm.estimatedDuration}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          estimatedDuration: Number(e.target.value),
                        })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty (days)
                    </label>
                    <input
                      type="number"
                      value={serviceForm.warrantyPeriod}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          warrantyPeriod: Number(e.target.value),
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={closeModal} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Service
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTypesSettings;
