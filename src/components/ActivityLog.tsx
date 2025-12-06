import React from 'react';
import { format } from 'date-fns';
import type { OrderActivityLog } from '../types';

interface ActivityLogProps {
  activities: OrderActivityLog[];
  loading?: boolean;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities, loading = false }) => {
  if (loading) {
    return (
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Activity Log</h3>
        <div className="text-center py-8 text-gray-500">Loading activities...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Activity Log</h3>
        <div className="text-center py-8 text-gray-500">No activities yet</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Activity Log</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity._id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${
                activity.activityType.includes('created') ? 'bg-green-600' :
                activity.activityType.includes('updated') ? 'bg-blue-600' :
                activity.activityType.includes('deleted') ? 'bg-red-600' :
                activity.activityType.includes('assigned') ? 'bg-purple-600' :
                activity.activityType.includes('payment') ? 'bg-yellow-600' :
                'bg-gray-600'
              }`}></div>
              {index < activities.length - 1 && (
                <div className="w-0.5 flex-1 bg-gray-200 mt-1"></div>
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div className="space-y-1">
                {activity.description && (
                  <p className="text-sm text-gray-600">{activity.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  By {activity.performedByName}
                </p>
                {activity.stageName && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-purple-600">Stage:</span> {activity.stageName}
                  </p>
                )}
                {activity.assignedTo && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-purple-600">Assigned to:</span> {activity.assignedTo}
                  </p>
                )}
                {activity.subTaskTitle && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-blue-600">Task:</span> {activity.subTaskTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
