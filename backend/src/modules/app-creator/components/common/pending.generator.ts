/**
 * Pending Generator
 *
 * Generates PendingItems components with:
 * - Pending items list/grid
 * - Action buttons (approve/reject)
 * - Bulk actions
 * - Status indicators
 * - Time waiting display
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface PendingItemsOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  itemType?: string;
  showApprove?: boolean;
  showReject?: boolean;
  showBulkActions?: boolean;
  showTimeWaiting?: boolean;
  showPriority?: boolean;
  showAssignee?: boolean;
  layout?: 'list' | 'cards' | 'table';
}

/**
 * Generate a PendingItems component
 */
export function generatePendingItems(options: PendingItemsOptions = {}): string {
  const {
    entity = 'item',
    itemType = 'request',
    showApprove = true,
    showReject = true,
    showBulkActions = true,
    showTimeWaiting = true,
    showPriority = true,
    showAssignee = true,
    layout = 'list',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || 'PendingItems';
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Filter,
  Search,
  Loader2,
  MoreVertical,
  ChevronDown,
  Flag,
  Eye,
  MessageSquare,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface PendingItem {
  id: string;
  title: string;
  description?: string;
  type?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  requestedBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

interface ${componentName}Props {
  className?: string;
  data?: PendingItem[];
  onApprove?: (item: PendingItem) => void;
  onReject?: (item: PendingItem) => void;
  onView?: (item: PendingItem) => void;
  onBulkApprove?: (items: PendingItem[]) => void;
  onBulkReject?: (items: PendingItem[]) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  data: propData,
  onApprove,
  onReject,
  onView,
  onBulkApprove,
  onBulkReject,
}) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    action: 'approve' | 'reject';
    item: PendingItem | null;
  }>({ open: false, action: 'approve', item: null });

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['${queryKey}', 'pending'],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?status=pending\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch pending items:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(\`${endpoint}/\${id}/approve\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(\`${endpoint}/\${id}/reject\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const items = propData && propData.length > 0 ? propData : (fetchedData || []);

  // Get unique types for filter
  const itemTypes = useMemo(() => {
    return Array.from(new Set(items.map((item: PendingItem) => item.type).filter(Boolean)));
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item: PendingItem) => {
      const matchesSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = !priorityFilter || item.priority === priorityFilter;
      const matchesType = !typeFilter || item.type === typeFilter;
      return matchesSearch && matchesPriority && matchesType;
    });
  }, [items, searchQuery, priorityFilter, typeFilter]);

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { color: string; bgColor: string; label: string }> = {
      urgent: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Urgent',
      },
      high: {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        label: 'High',
      },
      medium: {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        label: 'Medium',
      },
      low: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        label: 'Low',
      },
    };
    return configs[priority] || configs.medium;
  };

  const getTimeWaiting = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return \`\${days} day\${days > 1 ? 's' : ''} ago\`;
    if (hours > 0) return \`\${hours} hour\${hours > 1 ? 's' : ''} ago\`;
    return 'Just now';
  };

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item: PendingItem) => item.id)));
    }
  };

  const handleApprove = async (item: PendingItem) => {
    if (onApprove) {
      onApprove(item);
    } else {
      await approveMutation.mutateAsync(item.id);
    }
    setActionModal({ open: false, action: 'approve', item: null });
  };

  const handleReject = async (item: PendingItem) => {
    if (onReject) {
      onReject(item);
    } else {
      await rejectMutation.mutateAsync(item.id);
    }
    setActionModal({ open: false, action: 'reject', item: null });
  };

  const handleBulkApprove = () => {
    const selectedList = filteredItems.filter((item: PendingItem) => selectedItems.has(item.id));
    if (onBulkApprove) {
      onBulkApprove(selectedList);
    } else {
      selectedList.forEach((item: PendingItem) => approveMutation.mutate(item.id));
    }
    setSelectedItems(new Set());
  };

  const handleBulkReject = () => {
    const selectedList = filteredItems.filter((item: PendingItem) => selectedItems.has(item.id));
    if (onBulkReject) {
      onBulkReject(selectedList);
    } else {
      selectedList.forEach((item: PendingItem) => rejectMutation.mutate(item.id));
    }
    setSelectedItems(new Set());
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pending ${formatFieldLabel(itemType)}s
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Clock className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search pending items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            ${showPriority ? `<select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>` : ''}

            {itemTypes.length > 0 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                {itemTypes.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        ${showBulkActions ? `{/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-3 py-1 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
              >
                Clear selection
              </button>
              ${showReject ? `<button
                onClick={handleBulkReject}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <XCircle className="w-4 h-4" />
                Reject All
              </button>` : ''}
              ${showApprove ? `<button
                onClick={handleBulkApprove}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Approve All
              </button>` : ''}
            </div>
          </div>
        )}` : ''}

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No pending items to review</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Select All Header */}
            ${showBulkActions ? `<div className="flex items-center gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {selectedItems.size === filteredItems.length ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                Select All
              </button>
            </div>` : ''}

            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map((item: PendingItem) => {
                const priorityConfig = getPriorityConfig(item.priority || 'medium');
                const isSelected = selectedItems.has(item.id);

                return (
                  <li
                    key={item.id}
                    className={cn(
                      'p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                      isSelected && 'bg-blue-50 dark:bg-blue-900/10'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      ${showBulkActions ? `<button
                        onClick={() => toggleItemSelection(item.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>` : ''}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              ${showPriority ? `{item.priority && (
                                <span className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                                  priorityConfig.bgColor,
                                  priorityConfig.color
                                )}>
                                  <Flag className="w-3 h-3" />
                                  {priorityConfig.label}
                                </span>
                              )}` : ''}
                              {item.type && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                  {item.type}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>

                          ${showTimeWaiting ? `<span className="flex-shrink-0 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            {getTimeWaiting(item.createdAt)}
                          </span>` : ''}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {item.requestedBy && (
                              <div className="flex items-center gap-2">
                                {item.requestedBy.avatar ? (
                                  <img
                                    src={item.requestedBy.avatar}
                                    alt={item.requestedBy.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="w-3 h-3 text-gray-500" />
                                  </div>
                                )}
                                <span>Requested by {item.requestedBy.name}</span>
                              </div>
                            )}

                            ${showAssignee ? `{item.assignedTo && (
                              <div className="flex items-center gap-2">
                                {item.assignedTo.avatar ? (
                                  <img
                                    src={item.assignedTo.avatar}
                                    alt={item.assignedTo.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <User className="w-3 h-3 text-blue-600" />
                                  </div>
                                )}
                                <span>Assigned to {item.assignedTo.name}</span>
                              </div>
                            )}` : ''}
                          </div>

                          <div className="flex items-center gap-2">
                            {onView && (
                              <button
                                onClick={() => onView(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            )}
                            ${showReject ? `<button
                              onClick={() => setActionModal({ open: true, action: 'reject', item })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>` : ''}
                            ${showApprove ? `<button
                              onClick={() => setActionModal({ open: true, action: 'approve', item })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {actionModal.open && actionModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setActionModal({ open: false, action: 'approve', item: null })}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {actionModal.action === 'approve' ? (
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {actionModal.action === 'approve' ? 'Approve' : 'Reject'} Item
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {actionModal.item.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionModal({ open: false, action: 'approve', item: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {actionModal.action} this ${itemType}?
              {actionModal.action === 'reject' && ' This action cannot be undone.'}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActionModal({ open: false, action: 'approve', item: null })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => actionModal.action === 'approve'
                  ? handleApprove(actionModal.item!)
                  : handleReject(actionModal.item!)
                }
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className={cn(
                  'px-4 py-2 rounded-lg disabled:opacity-50',
                  actionModal.action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                )}
              >
                {(approveMutation.isPending || rejectMutation.isPending)
                  ? 'Processing...'
                  : actionModal.action === 'approve' ? 'Approve' : 'Reject'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate pending approvals component
 */
export function generatePendingApprovals(options?: Partial<PendingItemsOptions>): string {
  return generatePendingItems({
    itemType: 'approval',
    ...options,
  });
}
