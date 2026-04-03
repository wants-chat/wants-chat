/**
 * Contract Generator
 *
 * Generates ContractRenewalDue components with:
 * - Upcoming renewal alerts
 * - Contract status indicators
 * - Expiration countdown
 * - Renewal action buttons
 * - Filtering and sorting
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface ContractRenewalDueOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  warningDays?: number;
  criticalDays?: number;
  showValue?: boolean;
  showParty?: boolean;
  showCategory?: boolean;
  layout?: 'list' | 'cards' | 'table';
}

/**
 * Generate a ContractRenewalDue component
 */
export function generateContractRenewalDue(options: ContractRenewalDueOptions = {}): string {
  const {
    entity = 'contract',
    warningDays = 30,
    criticalDays = 7,
    showValue = true,
    showParty = true,
    showCategory = true,
    layout = 'list',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || 'ContractRenewalDue';
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Clock,
  DollarSign,
  Building2,
  Tag,
  ChevronRight,
  Bell,
  RefreshCw,
  Filter,
  Search,
  Loader2,
  CheckCircle,
  X,
  MoreVertical,
  Eye,
  Edit,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Contract {
  id: string;
  name: string;
  title?: string;
  party?: string;
  partyName?: string;
  category?: string;
  type?: string;
  value?: number;
  currency?: string;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  autoRenew?: boolean;
  status: 'active' | 'expiring' | 'expired' | 'renewed' | 'cancelled';
  renewalStatus?: 'pending' | 'sent' | 'accepted' | 'declined';
  daysUntilExpiry?: number;
}

interface ${componentName}Props {
  className?: string;
  data?: Contract[];
  warningDays?: number;
  criticalDays?: number;
  onRenew?: (contract: Contract) => void;
  onView?: (contract: Contract) => void;
  onEdit?: (contract: Contract) => void;
  onSendReminder?: (contract: Contract) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  data: propData,
  warningDays = ${warningDays},
  criticalDays = ${criticalDays},
  onRenew,
  onView,
  onEdit,
  onSendReminder,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'expiry' | 'value' | 'name'>('expiry');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['${queryKey}', 'renewals'],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/renewals\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch contracts:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const contracts = propData && propData.length > 0 ? propData : (fetchedData || []);

  // Calculate days until expiry for each contract
  const contractsWithExpiry = useMemo(() => {
    return contracts.map((contract: Contract) => {
      const endDate = new Date(contract.endDate || contract.renewalDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...contract, daysUntilExpiry };
    });
  }, [contracts]);

  // Filter and sort
  const filteredContracts = useMemo(() => {
    let result = contractsWithExpiry;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c: Contract) =>
        c.name?.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query) ||
        c.party?.toLowerCase().includes(query) ||
        c.partyName?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((c: Contract) => c.status === statusFilter);
    }

    // Sort
    result = [...result].sort((a: Contract, b: Contract) => {
      if (sortBy === 'expiry') {
        return (a.daysUntilExpiry || 0) - (b.daysUntilExpiry || 0);
      }
      if (sortBy === 'value') {
        return (b.value || 0) - (a.value || 0);
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    return result;
  }, [contractsWithExpiry, searchQuery, statusFilter, sortBy]);

  // Group by urgency
  const groupedContracts = useMemo(() => {
    const critical: Contract[] = [];
    const warning: Contract[] = [];
    const upcoming: Contract[] = [];

    filteredContracts.forEach((contract: Contract) => {
      const days = contract.daysUntilExpiry || 0;
      if (days <= criticalDays) {
        critical.push(contract);
      } else if (days <= warningDays) {
        warning.push(contract);
      } else {
        upcoming.push(contract);
      }
    });

    return { critical, warning, upcoming };
  }, [filteredContracts, criticalDays, warningDays]);

  const getExpiryConfig = (days: number) => {
    if (days <= 0) {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertCircle,
        label: 'Expired',
      };
    }
    if (days <= criticalDays) {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertTriangle,
        label: \`\${days} day\${days === 1 ? '' : 's'} left\`,
      };
    }
    if (days <= warningDays) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: Clock,
        label: \`\${days} days left\`,
      };
    }
    return {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: CheckCircle,
      label: \`\${days} days left\`,
    };
  };

  const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleView = (contract: Contract) => {
    if (onView) onView(contract);
    else navigate(\`/${tableName}/\${contract.id}\`);
  };

  const handleRenew = (contract: Contract) => {
    if (onRenew) onRenew(contract);
  };

  const renderContractCard = (contract: Contract) => {
    const expiryConfig = getExpiryConfig(contract.daysUntilExpiry || 0);
    const ExpiryIcon = expiryConfig.icon;

    return (
      <div
        key={contract.id}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-md transition-all',
          expiryConfig.borderColor
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {contract.name || contract.title}
              </h3>
            </div>

            <div className="space-y-2 text-sm">
              ${showParty ? `{(contract.party || contract.partyName) && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <span>{contract.party || contract.partyName}</span>
                </div>
              )}` : ''}

              ${showCategory ? `{(contract.category || contract.type) && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span>{contract.category || contract.type}</span>
                </div>
              )}` : ''}

              ${showValue ? `{contract.value && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatCurrency(contract.value, contract.currency)}</span>
                </div>
              )}` : ''}

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Expires {formatDate(contract.endDate)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
              expiryConfig.bgColor,
              expiryConfig.color
            )}>
              <ExpiryIcon className="w-3 h-3" />
              {expiryConfig.label}
            </span>

            {contract.autoRenew && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Auto-renews
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleView(contract)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          {onRenew && (
            <button
              onClick={() => handleRenew(contract)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Renew
            </button>
          )}
          {onSendReminder && (
            <button
              onClick={() => onSendReminder(contract)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Send reminder"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalExpiring = groupedContracts.critical.length + groupedContracts.warning.length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contract Renewals
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalExpiring} contract{totalExpiring !== 1 ? 's' : ''} expiring soon
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {groupedContracts.critical.length}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">Critical (within {criticalDays} days)</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {groupedContracts.warning.length}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Warning (within {warningDays} days)</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {groupedContracts.upcoming.length}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
            <option value="renewed">Renewed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="expiry">Sort by Expiry</option>
            <option value="value">Sort by Value</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Contract List */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No contracts due for renewal</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Critical Section */}
          {groupedContracts.critical.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                <AlertCircle className="w-5 h-5" />
                Critical - Action Required
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedContracts.critical.map(renderContractCard)}
              </div>
            </div>
          )}

          {/* Warning Section */}
          {groupedContracts.warning.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
                <AlertTriangle className="w-5 h-5" />
                Expiring Soon
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedContracts.warning.map(renderContractCard)}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {groupedContracts.upcoming.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <Clock className="w-5 h-5" />
                Upcoming Renewals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedContracts.upcoming.map(renderContractCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate contract list with custom options
 */
export function generateContractList(options?: Partial<ContractRenewalDueOptions>): string {
  return generateContractRenewalDue({
    layout: 'list',
    ...options,
  });
}
