/**
 * Work Order Component Generators
 *
 * Generates work order management components including:
 * - ActiveWorkOrders: Grid/list of active work orders
 * - WorkOrderFilters: Filter controls for work orders
 * - WorkOrderTimeline: Timeline view of work order activities
 * - WorkFilters: Generic work item filters
 */

export interface WorkOrderOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateActiveWorkOrders(options: WorkOrderOptions = {}): string {
  const { componentName = 'ActiveWorkOrders', endpoint = '/work-orders' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Wrench, Clock, User, AlertCircle, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  filter?: string;
  limit?: number;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ filter, limit, className }) => {
  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['work-orders', filter, limit],
    queryFn: async () => {
      let url = '${endpoint}?status=active';
      if (filter) url += '&type=' + filter;
      if (limit) url += '&limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    'in-progress': <Wrench className="w-4 h-4 text-blue-500" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    cancelled: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-600" />
          Active Work Orders
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {workOrders && workOrders.length > 0 ? (
          workOrders.map((order: any) => (
            <Link
              key={order.id}
              to={\`/work-orders/\${order.id}\`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {statusIcons[order.status] || statusIcons.pending}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.title || order.name || \`WO-\${order.id}\`}
                  </span>
                </div>
                <span className={\`px-2 py-1 rounded-full text-xs font-medium \${priorityColors[order.priority] || priorityColors.medium}\`}>
                  {order.priority || 'Medium'}
                </span>
              </div>
              {order.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{order.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                {order.assignee_name && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {order.assignee_name}
                  </span>
                )}
                {order.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {order.location}
                  </span>
                )}
                {order.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No active work orders
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateWorkOrderFilters(options: WorkOrderOptions = {}): string {
  const { componentName = 'WorkOrderFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';

interface FilterValues {
  search: string;
  status: string;
  priority: string;
  type: string;
  assignee: string;
  dateRange: { start: string; end: string };
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  priority: '',
  type: '',
  assignee: '',
  dateRange: { start: '', end: '' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: any) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status ||
    currentFilters.priority || currentFilters.type || currentFilters.assignee ||
    currentFilters.dateRange.start || currentFilters.dateRange.end;

  const baseInputClasses = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500';

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 \${className || ''}\`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-900 dark:text-white">Filter Work Orders</span>
        {hasActiveFilters && (
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={currentFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search work orders..."
              className={\`\${baseInputClasses} pl-10\`}
            />
            {currentFilters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            value={currentFilters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
          <select
            value={currentFilters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Work Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
          <select
            value={currentFilters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className={baseInputClasses}
          >
            <option value="">All Types</option>
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
            <option value="installation">Installation</option>
            <option value="inspection">Inspection</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.start}
                onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, start: e.target.value })}
                className={\`\${baseInputClasses} pl-10\`}
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentFilters.dateRange.end}
                onChange={(e) => updateFilter('dateRange', { ...currentFilters.dateRange, end: e.target.value })}
                className={\`\${baseInputClasses} pl-10\`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={clearAll}
          disabled={!hasActiveFilters}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
        >
          Clear all filters
        </button>
        {onSearch && (
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateWorkOrderTimeline(options: WorkOrderOptions = {}): string {
  const { componentName = 'WorkOrderTimeline', endpoint = '/work-orders' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Clock, CheckCircle, Wrench, AlertCircle, User, MessageSquare, FileText, Camera } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  workOrderId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ workOrderId: propId, className }) => {
  const { id: routeId } = useParams<{ id: string }>();
  const workOrderId = propId || routeId;

  const { data: activities, isLoading } = useQuery({
    queryKey: ['work-order-timeline', workOrderId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + workOrderId + '/activities');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!workOrderId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'assigned': return <User className="w-4 h-4 text-purple-500" />;
      case 'started': return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-gray-500" />;
      case 'photo': return <Camera className="w-4 h-4 text-pink-500" />;
      case 'issue': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'assigned': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'started': return 'bg-orange-100 dark:bg-orange-900/30';
      case 'completed': return 'bg-green-100 dark:bg-green-900/30';
      case 'issue': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 \${className || ''}\`}>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Work Order Timeline
      </h3>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-6">
          {activities && activities.length > 0 ? (
            activities.map((activity: any, index: number) => (
              <div key={activity.id || index} className="relative flex items-start gap-4 pl-10">
                <div className={\`absolute left-1.5 w-6 h-6 rounded-full flex items-center justify-center \${getActivityColor(activity.type)}\`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title || activity.description || activity.message}
                      </p>
                      {activity.user_name && (
                        <p className="text-xs text-gray-500 mt-0.5">by {activity.user_name}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                  {activity.details && (
                    <p className="text-sm text-gray-500 mt-2">{activity.details}</p>
                  )}
                  {activity.photos && activity.photos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {activity.photos.slice(0, 4).map((photo: string, i: number) => (
                        <img
                          key={i}
                          src={photo}
                          alt="Work photo"
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 pl-10">
              No activity recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateWorkFilters(options: WorkOrderOptions = {}): string {
  const { componentName = 'WorkFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterValues {
  search: string;
  status: string;
  category: string;
  worker: string;
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
  collapsible?: boolean;
  statusOptions?: Array<{ value: string; label: string }>;
  categoryOptions?: Array<{ value: string; label: string }>;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  category: '',
  worker: '',
};

const defaultStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

const defaultCategoryOptions = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'construction', label: 'Construction' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'general', label: 'General' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
  collapsible = false,
  statusOptions = defaultStatusOptions,
  categoryOptions = defaultCategoryOptions,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [expanded, setExpanded] = useState(true);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: string) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status ||
    currentFilters.category || currentFilters.worker;

  const baseInputClasses = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500';

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {collapsible ? (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-white">Filters</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                Active
              </span>
            )}
          </div>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      ) : (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              Active
            </span>
          )}
        </div>
      )}

      {(!collapsible || expanded) && (
        <div className={\`p-4 \${collapsible ? 'border-t border-gray-200 dark:border-gray-700' : ''}\`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={currentFilters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search work items..."
                  className={\`\${baseInputClasses} pl-10\`}
                />
                {currentFilters.search && (
                  <button
                    onClick={() => updateFilter('search', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={currentFilters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className={baseInputClasses}
              >
                <option value="">All Statuses</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={currentFilters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className={baseInputClasses}
              >
                <option value="">All Categories</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearAll}
              disabled={!hasActiveFilters}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
            >
              Clear all
            </button>
            {onSearch && (
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Apply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
