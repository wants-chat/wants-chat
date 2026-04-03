/**
 * Activity Feed Component Generator
 *
 * Generates an activity feed/timeline component.
 */

export interface ActivityFeedOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateActivityFeed(options: ActivityFeedOptions = {}): string {
  const {
    componentName = 'ActivityFeed',
    endpoint = '/activities',
    title = 'Recent Activity',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Activity, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit, className }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += '?limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          ${title}
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities && activities.length > 0 ? (
          activities.map((activity: any) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.description || activity.message || activity.action}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateActivityTimeline(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'ActivityTimeline', endpoint = '/activities' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Clock } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'created': return 'bg-green-500';
      case 'updated': return 'bg-blue-500';
      case 'deleted': return 'bg-red-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5" /> Activity Timeline
      </h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-6">
          {activities && activities.length > 0 ? (
            activities.map((activity: any, index: number) => (
              <div key={activity.id} className="relative flex items-start gap-4 pl-10">
                <div className={\`absolute left-2.5 w-3 h-3 rounded-full \${getStatusColor(activity.type || 'default')} ring-4 ring-white dark:ring-gray-800\`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.description || activity.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
