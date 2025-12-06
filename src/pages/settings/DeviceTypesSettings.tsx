import React, { useEffect, useState } from 'react';
import { deviceTypeService } from '../../services/deviceTypeService';
import type { DeviceType } from '../../types';
import { Plus, Smartphone, Check, X, Settings, RefreshCw } from 'lucide-react';

const defaultDeviceSuggestions = [
  { name: 'Laptop', requiresSerialNumber: true, requiresIMEI: false, requiresPassword: true },
  { name: 'Desktop', requiresSerialNumber: true, requiresIMEI: false, requiresPassword: true },
  { name: 'Mobile Phone', requiresSerialNumber: false, requiresIMEI: true, requiresPassword: true },
  { name: 'Tablet', requiresSerialNumber: true, requiresIMEI: true, requiresPassword: true },
  { name: 'Printer', requiresSerialNumber: true, requiresIMEI: false, requiresPassword: false },
  { name: 'Monitor', requiresSerialNumber: true, requiresIMEI: false, requiresPassword: false },
  { name: 'Smart Watch', requiresSerialNumber: true, requiresIMEI: false, requiresPassword: true },
  { name: 'Gaming Console', requiresSerialNumber: true, requiresIMEI: false, requiresPassword: true },
  { name: 'Router', requiresSerialNumber: true, requiresIMEI: false, requiresPassword: true },
  { name: 'External Hard Drive', requiresSerialNumber: true, requiresIMEI: false, requiresPassword: false },
];

const DeviceTypesSettings: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deviceForm, setDeviceForm] = useState({ name: '', requiresSerialNumber: false, requiresIMEI: false, requiresPassword: false });

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const fetchDeviceTypes = async () => {
    try {
      const res = await deviceTypeService.getAll();
      setDeviceTypes(res.data || []);
    } catch (error) {
      console.error('Error fetching device types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDeviceTypes = async () => {
    setSeeding(true);
    try {
      await deviceTypeService.seed();
      await fetchDeviceTypes();
      alert('Device types seeded successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error seeding device types');
    } finally {
      setSeeding(false);
    }
  };

  const openModal = () => {
    setDeviceForm({ name: '', requiresSerialNumber: false, requiresIMEI: false, requiresPassword: false });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setDeviceForm({ name: '', requiresSerialNumber: false, requiresIMEI: false, requiresPassword: false });
  };

  const handleSaveDevice = async () => {
    if (!deviceForm.name) return alert('Name is required');
    setSaving(true);
    try {
      await deviceTypeService.create({
        name: deviceForm.name,
        slug: deviceForm.name.toLowerCase().replace(/\s+/g, '-'),
        requiresSerialNumber: deviceForm.requiresSerialNumber,
        requiresIMEI: deviceForm.requiresIMEI,
        requiresPassword: deviceForm.requiresPassword,
        fieldDefinitions: [],
        isActive: true
      });
      await fetchDeviceTypes();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating device type');
    } finally {
      setSaving(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
    setDeviceForm({
      name: suggestion.name,
      requiresSerialNumber: suggestion.requiresSerialNumber,
      requiresIMEI: suggestion.requiresIMEI,
      requiresPassword: suggestion.requiresPassword
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading device types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Device Types</h1>
          <p className="text-gray-500 text-sm mt-1">Manage device types and their configurations</p>
        </div>
        <div className="flex gap-2">
          {deviceTypes.length === 0 && (
            <button onClick={handleSeedDeviceTypes} disabled={seeding} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
              Seed Device Types
            </button>
          )}
          <button onClick={openModal} className="btn-primary flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Add Device Type
          </button>
        </div>
      </div>

      {/* Device Types List */}
      <div className="space-y-3">
        {deviceTypes.map((deviceType) => (
          <div key={deviceType._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section - Icon and Name */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">{deviceType.name}</h3>
                  <p className="text-sm text-gray-500">{deviceType.slug}</p>
                </div>
              </div>

              {/* Middle Section - Requirements */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {deviceType.requiresSerialNumber ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <Check className="w-4 h-4" /> Serial#
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <X className="w-4 h-4" /> Serial#
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {deviceType.requiresIMEI ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <Check className="w-4 h-4" /> IMEI
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <X className="w-4 h-4" /> IMEI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {deviceType.requiresPassword ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <Check className="w-4 h-4" /> Password
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <X className="w-4 h-4" /> Password
                    </span>
                  )}
                </div>
              </div>

              {/* Right Section - Custom Fields and Status */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    {deviceType.fieldDefinitions.length} Fields
                  </span>
                </div>
                <span className={`badge ${deviceType.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                  {deviceType.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {deviceTypes.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500">No device types found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Add Device Type</h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Suggestions */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {defaultDeviceSuggestions.map((s, i) => (
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

              {/* Device Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    value={deviceForm.name}
                    onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                    className="input-field"
                    placeholder="Laptop"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deviceForm.requiresSerialNumber}
                      onChange={(e) => setDeviceForm({ ...deviceForm, requiresSerialNumber: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Requires Serial Number</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deviceForm.requiresIMEI}
                      onChange={(e) => setDeviceForm({ ...deviceForm, requiresIMEI: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Requires IMEI</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deviceForm.requiresPassword}
                      onChange={(e) => setDeviceForm({ ...deviceForm, requiresPassword: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Requires Password</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button
                onClick={handleSaveDevice}
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
                    Add Device
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

export default DeviceTypesSettings;
