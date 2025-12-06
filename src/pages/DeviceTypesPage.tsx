import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import type { DeviceType } from '../types';
import { Plus, Smartphone, Check, X, Settings } from 'lucide-react';

const DeviceTypesPage: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const fetchDeviceTypes = async () => {
    try {
      const { data } = await api.get('/device-types');
      setDeviceTypes(data.data);
    } catch (error) {
      console.error('Error fetching device types:', error);
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-500 text-sm mt-1">Configure device categories for repairs</p>
        </div>
        <button className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Add Device Type
        </button>
      </div>

      {/* Device Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deviceTypes.map((deviceType) => (
          <div key={deviceType._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{deviceType.name}</h3>
                  <p className="text-sm text-gray-500">{deviceType.slug}</p>
                </div>
              </div>
              <span className={`badge ${deviceType.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                {deviceType.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Serial Number</span>
                {deviceType.requiresSerialNumber ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="w-4 h-4" /> Required
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <X className="w-4 h-4" /> Not Required
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">IMEI</span>
                {deviceType.requiresIMEI ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="w-4 h-4" /> Required
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <X className="w-4 h-4" /> Not Required
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Password</span>
                {deviceType.requiresPassword ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="w-4 h-4" /> Required
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <X className="w-4 h-4" /> Not Required
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">Custom Fields</span>
                <span className="flex items-center gap-1 text-purple-600 font-semibold text-sm">
                  <Settings className="w-4 h-4" />
                  {deviceType.fieldDefinitions.length}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deviceTypes.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No device types found</p>
        </div>
      )}
    </div>
  );
};

export default DeviceTypesPage;
