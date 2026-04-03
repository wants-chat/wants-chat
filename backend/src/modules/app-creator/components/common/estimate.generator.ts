/**
 * Estimate Generator
 *
 * Generates estimate/quote-related components:
 * - EstimateFilters: Filter estimates by status, date, client
 * - EstimateListPending: List pending estimates awaiting approval
 * - QuoteRequests: Manage incoming quote requests
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface EstimateFiltersOptions {
  componentName?: string;
  statuses?: string[];
  showDateRange?: boolean;
  showClientFilter?: boolean;
  showAmountRange?: boolean;
  clientsEndpoint?: string;
}

export interface EstimateListPendingOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showActions?: boolean;
  showTotals?: boolean;
}

export interface QuoteRequestsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showAssign?: boolean;
  showPriority?: boolean;
}

/**
 * Generate an EstimateFilters component
 */
export function generateEstimateFilters(options: EstimateFiltersOptions = {}): string {
  const {
    componentName = 'EstimateFilters',
    statuses = ['All', 'Draft', 'Pending', 'Approved', 'Rejected', 'Expired'],
    showDateRange = true,
    showClientFilter = true,
    showAmountRange = true,
    clientsEndpoint = '/clients',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface FilterValues {
  search: string;
  status: string;
  clientId: string;
  dateStart: string;
  dateEnd: string;
  amountMin: string;
  amountMax: string;
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
  collapsible?: boolean;
}

const statuses = ${JSON.stringify(statuses)};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
  collapsible = false,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    status: 'All',
    clientId: '',
    dateStart: '',
    dateEnd: '',
    amountMin: '',
    amountMax: '',
  });

  ${showClientFilter ? `// Fetch clients for filter
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-filter'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${clientsEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        return [];
      }
    },
  });` : ''}

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: string) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    const cleared: FilterValues = {
      search: '',
      status: 'All',
      clientId: '',
      dateStart: '',
      dateEnd: '',
      amountMin: '',
      amountMax: '',
    };
    setFilters(cleared);
    if (onChange) onChange(cleared);
    if (onSearch) onSearch(cleared);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.status !== 'All' ||
    currentFilters.clientId ||
    currentFilters.dateStart ||
    currentFilters.dateEnd ||
    currentFilters.amountMin ||
    currentFilters.amountMax;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Expired: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700', className)}>
      {collapsible && (
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
      )}

      {(!collapsible || expanded) && (
        <div className={cn('p-4', collapsible && 'border-t border-gray-200 dark:border-gray-700')}>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={currentFilters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search estimates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateFilter('status', status)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full transition-colors',
                      currentFilters.status === status
                        ? status === 'All'
                          ? 'bg-blue-600 text-white'
                          : getStatusColor(status)
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${showClientFilter ? `{/* Client Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Client
                </label>
                <select
                  value={currentFilters.clientId}
                  onChange={(e) => updateFilter('clientId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Clients</option>
                  {clients.map((client: any) => (
                    <option key={client.id || client._id} value={client.id || client._id}>
                      {client.name || client.companyName}
                    </option>
                  ))}
                </select>
              </div>` : ''}

              ${showDateRange ? `{/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={currentFilters.dateStart}
                    onChange={(e) => updateFilter('dateStart', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={currentFilters.dateEnd}
                    onChange={(e) => updateFilter('dateEnd', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>
              </div>` : ''}

              ${showAmountRange ? `{/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Amount Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentFilters.amountMin}
                    onChange={(e) => updateFilter('amountMin', e.target.value)}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    value={currentFilters.amountMax}
                    onChange={(e) => updateFilter('amountMax', e.target.value)}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>
              </div>` : ''}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Search className="w-4 h-4" />
                  Apply Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate an EstimateListPending component
 */
export function generateEstimateListPending(options: EstimateListPendingOptions = {}): string {
  const {
    componentName = 'EstimateListPending',
    endpoint = '/estimates?status=pending',
    queryKey = 'pending-estimates',
    showActions = true,
    showTotals = true,
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  User,
  DollarSign,
  Calendar,
  Check,
  X,
  Eye,
  Send,
  MoreVertical,
  AlertCircle,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Estimate {
  id: string;
  number?: string;
  title?: string;
  clientName?: string;
  clientId?: string;
  amount: number;
  status: string;
  createdAt: string;
  expiresAt?: string;
  items?: any[];
  notes?: string;
}

interface ${componentName}Props {
  estimates?: Estimate[];
  className?: string;
  onApprove?: (estimate: Estimate) => void;
  onReject?: (estimate: Estimate) => void;
  onView?: (estimate: Estimate) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  estimates: propEstimates,
  className,
  onApprove,
  onReject,
  onView,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch pending estimates
  const { data: fetchedEstimates = [], isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch estimates:', err);
        return [];
      }
    },
    enabled: !propEstimates || propEstimates.length === 0,
  });

  const estimates = propEstimates && propEstimates.length > 0 ? propEstimates : fetchedEstimates;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(\`/estimates/\${id}/approve\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(\`/estimates/\${id}/reject\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  ${showTotals ? `// Calculate totals
  const totals = useMemo(() => {
    return {
      count: estimates.length,
      totalAmount: estimates.reduce((sum: number, e: Estimate) => sum + (e.amount || 0), 0),
      expiringSoon: estimates.filter((e: Estimate) => {
        if (!e.expiresAt) return false;
        const days = Math.ceil((new Date(e.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 7 && days > 0;
      }).length,
    };
  }, [estimates]);` : ''}

  const handleApprove = async (estimate: Estimate) => {
    if (onApprove) {
      onApprove(estimate);
    } else {
      setProcessingId(estimate.id);
      try {
        await approveMutation.mutateAsync(estimate.id);
      } finally {
        setProcessingId(null);
      }
    }
    setOpenMenu(null);
  };

  const handleReject = async (estimate: Estimate) => {
    if (onReject) {
      onReject(estimate);
    } else {
      setProcessingId(estimate.id);
      try {
        await rejectMutation.mutateAsync(estimate.id);
      } finally {
        setProcessingId(null);
      }
    }
    setOpenMenu(null);
  };

  const handleView = (estimate: Estimate) => {
    if (onView) {
      onView(estimate);
    } else {
      navigate(\`/estimates/\${estimate.id}\`);
    }
    setOpenMenu(null);
  };

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Estimates</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Estimates awaiting approval or response
          </p>
        </div>
      </div>

      ${showTotals ? `{/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.count}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                \${totals.totalAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.expiringSoon}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
            </div>
          </div>
        </div>
      </div>` : ''}

      {/* Estimates List */}
      {estimates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No pending estimates</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {estimates.map((estimate: Estimate) => {
              const daysUntilExpiry = getDaysUntilExpiry(estimate.expiresAt);
              const isProcessing = processingId === estimate.id;

              return (
                <li
                  key={estimate.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => handleView(estimate)}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                        >
                          {estimate.number || estimate.title || \`Estimate #\${estimate.id}\`}
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            daysUntilExpiry <= 3
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          )}>
                            {daysUntilExpiry <= 0 ? 'Expired' : \`\${daysUntilExpiry} days left\`}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {estimate.clientName && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {estimate.clientName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          \${estimate.amount?.toLocaleString() || '0'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(estimate.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    ${showActions ? `<div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(estimate)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(estimate)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === estimate.id ? null : estimate.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {openMenu === estimate.id && (
                          <div className="absolute right-0 top-10 z-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                            <button
                              onClick={() => handleView(estimate)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button
                              onClick={() => { /* Send reminder logic */ setOpenMenu(null); }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Send className="w-4 h-4" /> Send Reminder
                            </button>
                          </div>
                        )}
                      </div>
                    </div>` : ''}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a QuoteRequests component
 */
export function generateQuoteRequests(options: QuoteRequestsOptions = {}): string {
  const {
    componentName = 'QuoteRequests',
    endpoint = '/quote-requests',
    queryKey = 'quote-requests',
    showAssign = true,
    showPriority = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  Flag,
  UserPlus,
  FileText,
  Check,
  X,
  MoreVertical,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface QuoteRequest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'quoted' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  services?: string[];
  budget?: string;
}

interface ${componentName}Props {
  requests?: QuoteRequest[];
  className?: string;
  onAssign?: (request: QuoteRequest) => void;
  onConvertToEstimate?: (request: QuoteRequest) => void;
  onClose?: (request: QuoteRequest) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  requests: propRequests,
  className,
  onAssign,
  onConvertToEstimate,
  onClose,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<{ open: boolean; request: QuoteRequest | null }>({ open: false, request: null });

  // Fetch quote requests
  const { data: fetchedRequests = [], isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch quote requests:', err);
        return [];
      }
    },
    enabled: !propRequests || propRequests.length === 0,
  });

  // Fetch team members for assignment
  ${showAssign ? `const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/team-members');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        return [];
      }
    },
  });` : ''}

  const requests = propRequests && propRequests.length > 0 ? propRequests : fetchedRequests;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await api.put(\`${endpoint}/\${id}\`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const handleAssign = async (request: QuoteRequest, assigneeId: string) => {
    if (onAssign) {
      onAssign(request);
    } else {
      await updateMutation.mutateAsync({
        id: request.id,
        data: { assignedTo: assigneeId, status: 'in_progress' },
      });
    }
    setAssignModal({ open: false, request: null });
  };

  const handleConvertToEstimate = (request: QuoteRequest) => {
    if (onConvertToEstimate) {
      onConvertToEstimate(request);
    } else {
      navigate(\`/estimates/new?from=quote&quoteId=\${request.id}\`);
    }
    setOpenMenu(null);
  };

  const handleClose = async (request: QuoteRequest) => {
    if (onClose) {
      onClose(request);
    } else {
      await updateMutation.mutateAsync({
        id: request.id,
        data: { status: 'closed' },
      });
    }
    setOpenMenu(null);
  };

  const getPriorityColor = (priority?: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[priority || ''] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      quoted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || colors.new;
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return \`\${hours}h ago\`;
    if (days < 7) return \`\${days}d ago\`;
    return date.toLocaleDateString();
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
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quote Requests</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {requests.filter((r: QuoteRequest) => r.status === 'new').length} new requests awaiting response
            </p>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No quote requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request: QuoteRequest) => {
              const isExpanded = expandedId === request.id;

              return (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Main Row */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {request.name}
                          </span>
                          <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(request.status))}>
                            {request.status.replace('_', ' ')}
                          </span>
                          ${showPriority ? `{request.priority && (
                            <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1', getPriorityColor(request.priority))}>
                              <Flag className="w-3 h-3" />
                              {request.priority}
                            </span>
                          )}` : ''}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {request.email && (
                            <a href={\`mailto:\${request.email}\`} className="flex items-center gap-1 hover:text-blue-600">
                              <Mail className="w-4 h-4" />
                              {request.email}
                            </a>
                          )}
                          {request.phone && (
                            <a href={\`tel:\${request.phone}\`} className="flex items-center gap-1 hover:text-blue-600">
                              <Phone className="w-4 h-4" />
                              {request.phone}
                            </a>
                          )}
                          {request.company && (
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {request.company}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeAgo(request.createdAt)}
                          </span>
                        </div>

                        {request.assignedToName && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Assigned to: {request.assignedToName}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        ${showAssign ? `<button
                          onClick={() => setAssignModal({ open: true, request })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        >
                          <UserPlus className="w-4 h-4" />
                          Assign
                        </button>` : ''}
                        <button
                          onClick={() => handleConvertToEstimate(request)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          <FileText className="w-4 h-4" />
                          Create Estimate
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : request.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <ChevronRight className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-90')} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      {request.message && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {request.message}
                          </p>
                        </div>
                      )}
                      {request.services && request.services.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Services Requested</p>
                          <div className="flex flex-wrap gap-2">
                            {request.services.map((service, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {request.budget && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{request.budget}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleClose(request)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          <X className="w-4 h-4" />
                          Close Request
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      ${showAssign ? `{/* Assign Modal */}
      {assignModal.open && assignModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setAssignModal({ open: false, request: null })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Request</h3>
              <button onClick={() => setAssignModal({ open: false, request: null })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Assign this quote request to a team member:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {teamMembers.map((member: any) => (
                <button
                  key={member.id || member._id}
                  onClick={() => handleAssign(assignModal.request!, member.id || member._id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                    {member.role && <p className="text-sm text-gray-500">{member.role}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}` : ''}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate estimate filters for specific domain
 */
export function generateDomainEstimateFilters(
  domain: string,
  options?: Partial<EstimateFiltersOptions>
): string {
  return generateEstimateFilters({
    componentName: pascalCase(domain) + 'EstimateFilters',
    ...options,
  });
}

/**
 * Generate estimate list pending for specific domain
 */
export function generateDomainEstimateListPending(
  domain: string,
  options?: Partial<EstimateListPendingOptions>
): string {
  return generateEstimateListPending({
    componentName: pascalCase(domain) + 'EstimateListPending',
    ...options,
  });
}

/**
 * Generate quote requests for specific domain
 */
export function generateDomainQuoteRequests(
  domain: string,
  options?: Partial<QuoteRequestsOptions>
): string {
  return generateQuoteRequests({
    componentName: pascalCase(domain) + 'QuoteRequests',
    ...options,
  });
}
