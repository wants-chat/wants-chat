/**
 * Expiring Generator
 *
 * Generates ExpiringRentals components with:
 * - Upcoming expiry alerts
 * - Rental item cards
 * - Return/renew actions
 * - Timeline view
 * - Filtering options
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface ExpiringRentalsOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  warningDays?: number;
  criticalDays?: number;
  showImage?: boolean;
  showPrice?: boolean;
  showLocation?: boolean;
  showRenewAction?: boolean;
  showReturnAction?: boolean;
  layout?: 'grid' | 'list' | 'timeline';
}

/**
 * Generate an ExpiringRentals component
 */
export function generateExpiringRentals(options: ExpiringRentalsOptions = {}): string {
  const {
    entity = 'rental',
    warningDays = 7,
    criticalDays = 2,
    showImage = true,
    showPrice = true,
    showLocation = true,
    showRenewAction = true,
    showReturnAction = true,
    layout = 'grid',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || 'ExpiringRentals';
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  MapPin,
  DollarSign,
  RefreshCw,
  RotateCcw,
  ChevronRight,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  Bell,
  X,
  Eye,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface RentalItem {
  id: string;
  name: string;
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  type?: string;
  status: 'active' | 'expiring' | 'expired' | 'returned' | 'renewed';
  startDate: string;
  endDate: string;
  daysRemaining?: number;
  price?: number;
  totalPrice?: number;
  currency?: string;
  location?: string;
  pickupLocation?: string;
  returnLocation?: string;
  renter?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  lateFee?: number;
  canRenew?: boolean;
  renewalPrice?: number;
}

interface ${componentName}Props {
  className?: string;
  data?: RentalItem[];
  warningDays?: number;
  criticalDays?: number;
  onRenew?: (item: RentalItem) => void;
  onReturn?: (item: RentalItem) => void;
  onView?: (item: RentalItem) => void;
  onNotify?: (item: RentalItem) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  data: propData,
  warningDays = ${warningDays},
  criticalDays = ${criticalDays},
  onRenew,
  onReturn,
  onView,
  onNotify,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    action: 'renew' | 'return';
    item: RentalItem | null;
  }>({ open: false, action: 'renew', item: null });

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['${queryKey}', 'expiring'],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/expiring\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch expiring rentals:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const renewMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(\`${endpoint}/\${id}/renew\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(\`${endpoint}/\${id}/return\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const rentals = propData && propData.length > 0 ? propData : (fetchedData || []);

  // Calculate days remaining
  const rentalsWithDays = useMemo(() => {
    return rentals.map((rental: RentalItem) => {
      const endDate = new Date(rental.endDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...rental, daysRemaining };
    });
  }, [rentals]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(rentalsWithDays.map((r: RentalItem) => r.category).filter(Boolean)));
  }, [rentalsWithDays]);

  // Filter and sort
  const filteredRentals = useMemo(() => {
    let result = rentalsWithDays;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r: RentalItem) =>
        r.name?.toLowerCase().includes(query) ||
        r.title?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      result = result.filter((r: RentalItem) => r.status === statusFilter);
    }

    if (categoryFilter) {
      result = result.filter((r: RentalItem) => r.category === categoryFilter);
    }

    // Sort by days remaining (most urgent first)
    return [...result].sort((a: RentalItem, b: RentalItem) =>
      (a.daysRemaining || 0) - (b.daysRemaining || 0)
    );
  }, [rentalsWithDays, searchQuery, statusFilter, categoryFilter]);

  // Group by urgency
  const groupedRentals = useMemo(() => {
    const expired: RentalItem[] = [];
    const critical: RentalItem[] = [];
    const warning: RentalItem[] = [];
    const upcoming: RentalItem[] = [];

    filteredRentals.forEach((rental: RentalItem) => {
      const days = rental.daysRemaining || 0;
      if (days < 0) {
        expired.push(rental);
      } else if (days <= criticalDays) {
        critical.push(rental);
      } else if (days <= warningDays) {
        warning.push(rental);
      } else {
        upcoming.push(rental);
      }
    });

    return { expired, critical, warning, upcoming };
  }, [filteredRentals, criticalDays, warningDays]);

  const getExpiryConfig = (days: number) => {
    if (days < 0) {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-300 dark:border-red-700',
        icon: AlertCircle,
        label: \`Overdue by \${Math.abs(days)} day\${Math.abs(days) !== 1 ? 's' : ''}\`,
      };
    }
    if (days === 0) {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-300 dark:border-red-700',
        icon: AlertCircle,
        label: 'Due today',
      };
    }
    if (days <= criticalDays) {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-300 dark:border-red-700',
        icon: AlertTriangle,
        label: \`\${days} day\${days !== 1 ? 's' : ''} left\`,
      };
    }
    if (days <= warningDays) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        icon: Clock,
        label: \`\${days} days left\`,
      };
    }
    return {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-300 dark:border-green-700',
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleView = (item: RentalItem) => {
    if (onView) onView(item);
    else navigate(\`/${tableName}/\${item.id}\`);
  };

  const handleRenew = async (item: RentalItem) => {
    if (onRenew) {
      onRenew(item);
    } else {
      await renewMutation.mutateAsync(item.id);
    }
    setActionModal({ open: false, action: 'renew', item: null });
  };

  const handleReturn = async (item: RentalItem) => {
    if (onReturn) {
      onReturn(item);
    } else {
      await returnMutation.mutateAsync(item.id);
    }
    setActionModal({ open: false, action: 'return', item: null });
  };

  const renderRentalCard = (rental: RentalItem) => {
    const expiryConfig = getExpiryConfig(rental.daysRemaining || 0);
    const ExpiryIcon = expiryConfig.icon;

    return (
      <div
        key={rental.id}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-lg transition-all',
          expiryConfig.borderColor
        )}
      >
        ${showImage ? `{/* Image */}
        <div className="relative h-40 bg-gray-100 dark:bg-gray-900">
          {rental.image ? (
            <img
              src={rental.image}
              alt={rental.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
              expiryConfig.bgColor,
              expiryConfig.color
            )}>
              <ExpiryIcon className="w-3 h-3" />
              {expiryConfig.label}
            </span>
          </div>
        </div>` : `<div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
            expiryConfig.bgColor,
            expiryConfig.color
          )}>
            <ExpiryIcon className="w-3 h-3" />
            {expiryConfig.label}
          </span>
        </div>`}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {rental.name || rental.title}
              </h3>
              {rental.category && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {rental.category}
                </span>
              )}
            </div>
            ${showPrice ? `{rental.price && (
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(rental.price, rental.currency)}
                </p>
                <p className="text-xs text-gray-500">/day</p>
              </div>
            )}` : ''}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Due: {formatDate(rental.endDate)}</span>
            </div>

            ${showLocation ? `{(rental.location || rental.returnLocation) && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{rental.returnLocation || rental.location}</span>
              </div>
            )}` : ''}

            {rental.lateFee && rental.daysRemaining < 0 && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <DollarSign className="w-4 h-4" />
                <span>Late fee: {formatCurrency(rental.lateFee * Math.abs(rental.daysRemaining), rental.currency)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleView(rental)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
            ${showReturnAction ? `<button
              onClick={() => setActionModal({ open: true, action: 'return', item: rental })}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              Return
            </button>` : ''}
            ${showRenewAction ? `{rental.canRenew !== false && (
              <button
                onClick={() => setActionModal({ open: true, action: 'renew', item: rental })}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Renew
              </button>
            )}` : ''}
          </div>
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

  const totalExpiring = groupedRentals.expired.length + groupedRentals.critical.length + groupedRentals.warning.length;

  return (
    <>
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Expiring Rentals
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {totalExpiring} rental{totalExpiring !== 1 ? 's' : ''} need attention
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {groupedRentals.expired.length}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">Overdue</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {groupedRentals.critical.length}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">Critical</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {groupedRentals.warning.length}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Warning</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {groupedRentals.upcoming.length}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">On Track</p>
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
                placeholder="Search rentals..."
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
            </select>
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Categories</option>
                {categories.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Rentals by Section */}
        {filteredRentals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No expiring rentals found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overdue */}
            {groupedRentals.expired.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                  <AlertCircle className="w-5 h-5" />
                  Overdue - Immediate Action Required
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedRentals.expired.map(renderRentalCard)}
                </div>
              </div>
            )}

            {/* Critical */}
            {groupedRentals.critical.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  Due Within {criticalDays} Days
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedRentals.critical.map(renderRentalCard)}
                </div>
              </div>
            )}

            {/* Warning */}
            {groupedRentals.warning.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
                  <Clock className="w-5 h-5" />
                  Due Within {warningDays} Days
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedRentals.warning.map(renderRentalCard)}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {groupedRentals.upcoming.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  <Calendar className="w-5 h-5" />
                  Upcoming Expirations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedRentals.upcoming.map(renderRentalCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal.open && actionModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setActionModal({ open: false, action: 'renew', item: null })}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {actionModal.action === 'renew' ? (
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <RotateCcw className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {actionModal.action === 'renew' ? 'Renew Rental' : 'Return Item'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {actionModal.item.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionModal({ open: false, action: 'renew', item: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionModal.action === 'renew' && actionModal.item.renewalPrice && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Renewal Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(actionModal.item.renewalPrice, actionModal.item.currency)}
                </p>
              </div>
            )}

            {actionModal.action === 'return' && actionModal.item.daysRemaining < 0 && actionModal.item.lateFee && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                <p className="text-sm text-red-600 dark:text-red-400">Late Fee</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(actionModal.item.lateFee * Math.abs(actionModal.item.daysRemaining), actionModal.item.currency)}
                </p>
              </div>
            )}

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {actionModal.action === 'renew'
                ? 'Would you like to extend the rental period for this item?'
                : 'Confirm that you are returning this item.'}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActionModal({ open: false, action: 'renew', item: null })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => actionModal.action === 'renew'
                  ? handleRenew(actionModal.item!)
                  : handleReturn(actionModal.item!)
                }
                disabled={renewMutation.isPending || returnMutation.isPending}
                className={cn(
                  'px-4 py-2 rounded-lg disabled:opacity-50',
                  actionModal.action === 'renew'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                )}
              >
                {(renewMutation.isPending || returnMutation.isPending)
                  ? 'Processing...'
                  : actionModal.action === 'renew' ? 'Confirm Renewal' : 'Confirm Return'
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
 * Generate equipment returns component
 */
export function generateEquipmentReturns(options?: Partial<ExpiringRentalsOptions>): string {
  return generateExpiringRentals({
    entity: 'equipment',
    ...options,
  });
}
