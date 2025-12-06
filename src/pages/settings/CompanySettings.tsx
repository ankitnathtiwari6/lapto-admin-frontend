import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { CompanySettings as CompanySettingsType } from '../../types';
import { Building2, Check, RefreshCw } from 'lucide-react';

const CompanySettings: React.FC = () => {
  const [companySettings, setCompanySettings] = useState<Partial<CompanySettingsType>>({
    companyName: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    defaultGstRate: 18,
    termsAndConditions: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const res = await api.get('/company-settings');
      if (res.data.data) {
        setCompanySettings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanySettings = async () => {
    setSaving(true);
    try {
      await api.post('/company-settings', companySettings);
      alert('Company settings saved successfully!');
      await fetchCompanySettings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving company settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading company settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Company Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your business information for invoices and documents</p>
      </div>

      {/* Company Settings Card */}
      <div className="card max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Company & Proprietor Details</h2>
            <p className="text-sm text-gray-500">Update your business information</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Business Information */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company/Business Name *
                </label>
                <input
                  type="text"
                  value={companySettings.companyName}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                  className="input-field"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GSTIN *
                </label>
                <input
                  type="text"
                  value={companySettings.gstin}
                  onChange={(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })}
                  className="input-field"
                  placeholder="27XXXXX1234X1ZX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default GST Rate (%)
                </label>
                <input
                  type="number"
                  value={companySettings.defaultGstRate}
                  onChange={(e) => setCompanySettings({ ...companySettings, defaultGstRate: parseFloat(e.target.value) })}
                  className="input-field"
                  min="0"
                  max="28"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  className="input-field"
                  placeholder="Enter street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={companySettings.city}
                  onChange={(e) => setCompanySettings({ ...companySettings, city: e.target.value })}
                  className="input-field"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={companySettings.state}
                  onChange={(e) => setCompanySettings({ ...companySettings, state: e.target.value })}
                  className="input-field"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={companySettings.pincode}
                  onChange={(e) => setCompanySettings({ ...companySettings, pincode: e.target.value })}
                  className="input-field"
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  className="input-field"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
            <textarea
              value={companySettings.termsAndConditions}
              onChange={(e) => setCompanySettings({ ...companySettings, termsAndConditions: e.target.value })}
              className="input-field resize-none"
              rows={5}
              placeholder="Enter terms and conditions for invoices"
            />
            <p className="text-xs text-gray-500 mt-1">
              These terms will appear on all generated invoices
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={handleSaveCompanySettings}
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
                  <Check className="w-4 h-4" />
                  Save Company Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
