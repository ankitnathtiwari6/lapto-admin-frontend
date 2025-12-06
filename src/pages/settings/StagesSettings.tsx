import React, { useEffect, useState } from 'react';
import { stageService } from '../../services/stageService';
import type { Stage } from '../../types';
import { Plus, RefreshCw, X } from 'lucide-react';

const defaultStageSuggestions = [
  { name: 'Pending', color: '#6B7280', order: 1, isFinal: false },
  { name: 'Assigned', color: '#3B82F6', order: 2, isFinal: false },
  { name: 'In Diagnosis', color: '#8B5CF6', order: 3, isFinal: false },
  { name: 'Awaiting Approval', color: '#F59E0B', order: 4, isFinal: false },
  { name: 'In Progress', color: '#6366F1', order: 5, isFinal: false },
  { name: 'Parts Ordered', color: '#EC4899', order: 6, isFinal: false },
  { name: 'Quality Check', color: '#14B8A6', order: 7, isFinal: false },
  { name: 'Completed', color: '#10B981', order: 8, isFinal: true },
  { name: 'Ready for Pickup', color: '#22C55E', order: 9, isFinal: false },
  { name: 'Delivered', color: '#059669', order: 10, isFinal: true },
];

const StagesSettings: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stageForm, setStageForm] = useState({ name: '', description: '', color: '#7C3AED', order: 1, isFinal: false });

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const res = await stageService.getAll();
      setStages(res.data || []);
    } catch (error) {
      console.error('Error fetching stages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedStages = async () => {
    setSeeding(true);
    try {
      await stageService.seed();
      await fetchStages();
      alert('Stages seeded successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error seeding stages');
    } finally {
      setSeeding(false);
    }
  };

  const openModal = () => {
    setStageForm({ name: '', description: '', color: '#7C3AED', order: stages.length + 1, isFinal: false });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setStageForm({ name: '', description: '', color: '#7C3AED', order: 1, isFinal: false });
  };

  const handleSaveStage = async () => {
    if (!stageForm.name) return alert('Name is required');
    setSaving(true);
    try {
      await stageService.create({
        name: stageForm.name,
        slug: stageForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: stageForm.description,
        color: stageForm.color,
        order: stageForm.order,
        isFinal: stageForm.isFinal,
        isActive: true
      });
      await fetchStages();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating stage');
    } finally {
      setSaving(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
    setStageForm({
      name: suggestion.name,
      description: '',
      color: suggestion.color,
      order: suggestion.order,
      isFinal: suggestion.isFinal
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading stages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Order Stages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage workflow stages for service orders</p>
        </div>
        <div className="flex gap-2">
          {stages.length === 0 && (
            <button onClick={handleSeedStages} disabled={seeding} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
              Seed Stages
            </button>
          )}
          <button onClick={openModal} className="btn-primary flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Add Stage
          </button>
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-3">
        {stages.sort((a, b) => a.order - b.order).map((stage) => (
          <div key={stage._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section - Order Badge and Name */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: stage.color }}
                >
                  {stage.order}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
                  <p className="text-sm text-gray-500">{stage.slug}</p>
                </div>
              </div>

              {/* Middle Section - Description */}
              {stage.description && (
                <div className="hidden lg:block flex-1 max-w-md">
                  <p className="text-sm text-gray-600 line-clamp-1">{stage.description}</p>
                </div>
              )}

              {/* Right Section - Badges */}
              <div className="flex items-center gap-2 shrink-0">
                {stage.isFinal && (
                  <span className="badge badge-in-progress">Final Stage</span>
                )}
                <span className={`badge ${stage.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                  {stage.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {stages.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No stages found</p>
            <button onClick={handleSeedStages} disabled={seeding} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
              Seed Default Stages
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Add Stage</h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Suggestions */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {defaultStageSuggestions.map((s, i) => (
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

              {/* Stage Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    value={stageForm.name}
                    onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                    className="input-field"
                    placeholder="In Progress"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={stageForm.description}
                    onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <input
                      type="number"
                      value={stageForm.order}
                      onChange={(e) => setStageForm({ ...stageForm, order: Number(e.target.value) })}
                      className="input-field"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={stageForm.color}
                        onChange={(e) => setStageForm({ ...stageForm, color: e.target.value })}
                        className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={stageForm.color}
                        onChange={(e) => setStageForm({ ...stageForm, color: e.target.value })}
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stageForm.isFinal}
                    onChange={(e) => setStageForm({ ...stageForm, isFinal: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Is Final Stage (workflow ends here)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button
                onClick={handleSaveStage}
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
                    Add Stage
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

export default StagesSettings;
