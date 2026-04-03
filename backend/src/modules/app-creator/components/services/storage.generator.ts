/**
 * Storage Service Component Generators
 *
 * Generates components for self-storage facility management:
 * - UnitAvailability: Unit availability grid/list
 * - UnitFilters: Filter interface for units
 * - CustomerProfileStorage: Customer profile with unit details
 * - RenewalList: Upcoming rental renewals
 */

export interface UnitAvailabilityOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateUnitAvailability(options: UnitAvailabilityOptions = {}): string {
  const { componentName = 'UnitAvailability', endpoint = '/storage/units' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Box, Check, X, Grid, List, Loader2, DollarSign, Ruler, Lock, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  onUnitSelect?: (unit: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, onUnitSelect }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const { data: units, isLoading } = useQuery({
    queryKey: ['storage-units', showOnlyAvailable],
    queryFn: async () => {
      let url = '${endpoint}';
      if (showOnlyAvailable) url += '?status=available';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getSizeLabel = (size: string) => {
    const sizes: Record<string, string> = {
      small: "5'x5' - 5'x10'",
      medium: "10'x10' - 10'x15'",
      large: "10'x20' - 10'x30'",
      extra_large: "15'x20'+",
    };
    return sizes[size?.toLowerCase()] || size;
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-500' };
      case 'occupied':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-500' };
      case 'reserved':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-500' };
      case 'maintenance':
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-500' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-400' };
    }
  };

  const handleUnitClick = (unit: any) => {
    if (onUnitSelect) {
      onUnitSelect(unit);
    } else if (unit.status === 'available') {
      navigate(\`/units/\${unit.id}/rent\`);
    } else {
      navigate(\`/units/\${unit.id}\`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const availableCount = units?.filter((u: any) => u.status === 'available').length || 0;
  const occupiedCount = units?.filter((u: any) => u.status === 'occupied').length || 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Unit Availability</h2>
          <p className="text-sm text-gray-500 mt-1">
            {availableCount} available | {occupiedCount} occupied | {units?.length || 0} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-gray-600 dark:text-gray-400">Available only</span>
          </label>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2', viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2', viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-gray-600 dark:text-gray-400">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-gray-600 dark:text-gray-400">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
        </div>
      </div>

      {/* Units Grid/List */}
      {units && units.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {units.map((unit: any) => {
              const statusStyle = getStatusStyle(unit.status);
              return (
                <div
                  key={unit.id}
                  onClick={() => handleUnitClick(unit)}
                  className={cn(
                    'p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg',
                    statusStyle.bg,
                    statusStyle.border,
                    unit.status !== 'available' && 'opacity-75'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 dark:text-white">{unit.unit_number}</span>
                    {unit.status === 'available' ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <X className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{unit.dimensions || getSizeLabel(unit.size)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{unit.monthly_rate || unit.price}/mo</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {unit.climate_controlled && <Thermometer className="w-4 h-4 text-blue-500" title="Climate Controlled" />}
                    {unit.has_power && <Lock className="w-4 h-4 text-yellow-500" title="Has Power" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Features</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {units.map((unit: any) => {
                  const statusStyle = getStatusStyle(unit.status);
                  return (
                    <tr
                      key={unit.id}
                      onClick={() => handleUnitClick(unit)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{unit.unit_number}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{unit.dimensions || getSizeLabel(unit.size)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {unit.climate_controlled && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded">Climate</span>
                          )}
                          {unit.ground_floor && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded">Ground</span>
                          )}
                          {unit.drive_up && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded">Drive-up</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">\${unit.monthly_rate || unit.price}/mo</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full capitalize', statusStyle.bg, statusStyle.text)}>
                          {unit.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Box className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No units found</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface UnitFiltersOptions {
  componentName?: string;
}

export function generateUnitFilters(options: UnitFiltersOptions = {}): string {
  const { componentName = 'UnitFilters' } = options;

  return `import React from 'react';
import { Search, X, Thermometer, Zap, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterState {
  search: string;
  size: string;
  priceRange: string;
  status: string;
  climateControlled: boolean;
  groundFloor: boolean;
  driveUp: boolean;
}

interface ${componentName}Props {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

const sizeOptions = [
  { value: '', label: 'All Sizes' },
  { value: 'small', label: "Small (5'x5' - 5'x10')" },
  { value: 'medium', label: "Medium (10'x10' - 10'x15')" },
  { value: 'large', label: "Large (10'x20' - 10'x30')" },
  { value: 'extra_large', label: "Extra Large (15'x20'+)" },
];

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-50', label: 'Under $50/mo' },
  { value: '50-100', label: '$50 - $100/mo' },
  { value: '100-200', label: '$100 - $200/mo' },
  { value: '200+', label: '$200+/mo' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ filters, onFilterChange, className }) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      size: '',
      priceRange: '',
      status: '',
      climateControlled: false,
      groundFloor: false,
      driveUp: false,
    });
  };

  const hasActiveFilters = filters.search || filters.size || filters.priceRange || filters.status ||
    filters.climateControlled || filters.groundFloor || filters.driveUp;

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4', className)}>
      <div className="flex flex-col gap-4">
        {/* Search and Dropdowns */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search units..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={filters.size}
            onChange={(e) => updateFilter('size', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            {sizeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={filters.priceRange}
            onChange={(e) => updateFilter('priceRange', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            {priceRanges.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Feature Checkboxes */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.climateControlled}
              onChange={(e) => updateFilter('climateControlled', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Thermometer className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Climate Controlled</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.groundFloor}
              onChange={(e) => updateFilter('groundFloor', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Ground Floor</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.driveUp}
              onChange={(e) => updateFilter('driveUp', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Car className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Drive-Up Access</span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface CustomerProfileStorageOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileStorage(options: CustomerProfileStorageOptions = {}): string {
  const { componentName = 'CustomerProfileStorage', endpoint = '/storage/customers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Box, Calendar, DollarSign, ArrowLeft, Edit, Loader2, CreditCard, AlertTriangle, CheckCircle, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId, className }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const customerId = propId || paramId;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['storage-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: rentals } = useQuery({
    queryKey: ['storage-customer-rentals', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/rentals\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ['storage-customer-payments', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/payments\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Customer not found</p>
      </div>
    );
  }

  const getRentalStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'ending_soon':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ended':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const activeRentals = rentals?.filter((r: any) => r.status === 'active') || [];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(\`/rentals/new?customer=\${customerId}\`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Box className="w-4 h-4" />
            Rent Unit
          </button>
          <button
            onClick={() => navigate(\`/customers/\${customerId}/edit\`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Overdue Alert */}
      {customer.has_overdue && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Payment Overdue</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Amount due: \${customer.overdue_amount?.toFixed(2) || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
              {customer.autopay_enabled && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  AutoPay
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{customer.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{customer.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{customer.address || 'No address'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeRentals.length}</div>
            <div className="text-sm text-gray-500">Active Units</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">\${customer.monthly_total || 0}</div>
            <div className="text-sm text-gray-500">Monthly Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${(customer.total_paid || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Lifetime Paid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.next_payment ? new Date(customer.next_payment).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Next Payment</div>
          </div>
        </div>
      </div>

      {/* Active Rentals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Rentals</h2>
        {activeRentals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRentals.map((rental: any) => (
              <div
                key={rental.id}
                onClick={() => navigate(\`/units/\${rental.unit_id}\`)}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Unit {rental.unit_number}</p>
                      <p className="text-sm text-gray-500">{rental.dimensions || rental.size}</p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getRentalStatusStyle(rental.status))}>
                    {rental.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Started: {new Date(rental.start_date).toLocaleDateString()}</span>
                    {rental.access_code && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Key className="w-3 h-3" /> {rental.access_code}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">\${rental.monthly_rate}/mo</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Box className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500">No active rentals</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        {paymentHistory && paymentHistory.length > 0 ? (
          <div className="space-y-3">
            {paymentHistory.slice(0, 5).map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    payment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                  )}>
                    {payment.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.description || 'Monthly Rent'}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">\${payment.amount?.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{payment.method}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500">No payment history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface RenewalListOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateRenewalList(options: RenewalListOptions = {}): string {
  const { componentName = 'RenewalList', endpoint = '/storage/renewals/upcoming' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Box, User, DollarSign, ChevronRight, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  limit?: number;
  daysAhead?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, limit = 10, daysAhead = 30 }) => {
  const navigate = useNavigate();

  const { data: renewals, isLoading } = useQuery({
    queryKey: ['upcoming-renewals', limit, daysAhead],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?limit=\${limit}&days=\${daysAhead}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getDaysUntilRenewal = (date: string) => {
    const renewalDate = new Date(date);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyStyle = (daysLeft: number) => {
    if (daysLeft <= 3) {
      return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' };
    } else if (daysLeft <= 7) {
      return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' };
    } else {
      return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Renewals</h2>
          </div>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
            Next {daysAhead} days
          </span>
        </div>
      </div>

      {renewals && renewals.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {renewals.map((renewal: any) => {
            const daysLeft = getDaysUntilRenewal(renewal.renewal_date || renewal.next_payment_date);
            const urgencyStyle = getUrgencyStyle(daysLeft);

            return (
              <li
                key={renewal.id}
                onClick={() => navigate(\`/rentals/\${renewal.id}\`)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-white">Unit {renewal.unit_number}</p>
                      {renewal.auto_renew ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full">
                          Auto-renew
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded-full">
                          Manual
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{renewal.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(renewal.renewal_date || renewal.next_payment_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                      <DollarSign className="w-4 h-4" />
                      {renewal.monthly_rate}/mo
                    </div>
                    <span className={cn('inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full', urgencyStyle.bg, urgencyStyle.text)}>
                      {daysLeft <= 0 ? 'Due today' : daysLeft === 1 ? '1 day left' : \`\${daysLeft} days left\`}
                    </span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {!renewal.auto_renew && daysLeft <= 7 && (
                  <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Customer has not set up auto-renewal. Contact recommended.
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No upcoming renewals in the next {daysAhead} days</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
