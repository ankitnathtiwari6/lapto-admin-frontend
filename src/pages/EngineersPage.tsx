import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { User } from '../types';
import { Plus, Star, Briefcase, CheckCircle, Phone, Edit } from 'lucide-react';

const EngineersPage: React.FC = () => {
  const navigate = useNavigate();
  const [engineers, setEngineers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const { data } = await api.get('/users/engineers');
      setEngineers(data.data);
    } catch (error) {
      console.error('Error fetching engineers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading engineers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Engineers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your repair engineers</p>
        </div>
        <button
          onClick={() => navigate('/engineers/new?type=engineer')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Engineer
        </button>
      </div>

      {/* Engineers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engineers.map((engineer) => (
          <div key={engineer._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <span className="text-purple-600 font-bold text-xl">
                  {engineer.fullName?.charAt(0) || 'E'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{engineer.fullName}</h3>
                  <span className={`badge ${engineer.status === 'active' ? 'badge-completed' : 'badge-cancelled'}`}>
                    {engineer.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <Phone className="w-4 h-4" />
                  {engineer.phone}
                </div>
              </div>
              <button
                onClick={() => navigate(`/engineers/${engineer._id}/edit`)}
                className="action-btn"
                title="Edit Engineer"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            {engineer.engineerDetails && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      Current Workload
                    </div>
                    <p className="text-lg font-bold text-gray-900">{engineer.engineerDetails.currentWorkload}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </div>
                    <p className="text-lg font-bold text-gray-900">{engineer.engineerDetails.totalRepairsCompleted}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">{engineer.engineerDetails.rating.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">/5</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ID: {engineer.engineerDetails.employeeId || 'N/A'}
                  </span>
                </div>

                {engineer.engineerDetails.specialization && engineer.engineerDetails.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {engineer.engineerDetails.specialization.map((spec) => (
                      <span key={spec} className="badge badge-in-progress">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {engineers.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No engineers found</p>
        </div>
      )}
    </div>
  );
};

export default EngineersPage;
