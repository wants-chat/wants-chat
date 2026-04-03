/**
 * Parking Management Component Generators
 *
 * Generates components for parking lot/garage management including:
 * - ParkingStats, OccupancyOverviewParking, ReservationFiltersParking
 * - CustomerProfileParking
 */

export interface ParkingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateParkingStats(options: ParkingOptions = {}): string {
  const { componentName = 'ParkingStats', endpoint = '/parking/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, ParkingCircle, Users, DollarSign, TrendingUp, TrendingDown, Loader2, Clock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['parking-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch parking stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 \${className || ''}\`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    { key: 'occupancyRate', label: 'Occupancy Rate', icon: ParkingCircle, color: 'blue', format: (v: number) => \`\${v || 0}%\` },
    { key: 'availableSpots', label: 'Available Spots', icon: ParkingCircle, color: 'green', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'occupiedSpots', label: 'Occupied Spots', icon: Car, color: 'red', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'totalSpots', label: 'Total Capacity', icon: ParkingCircle, color: 'purple', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'entriestoday', label: 'Entries Today', icon: ArrowUpCircle, color: 'emerald', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'exitsToday', label: 'Exits Today', icon: ArrowDownCircle, color: 'orange', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'avgDuration', label: 'Avg. Duration', icon: Clock, color: 'yellow', format: (v: number) => \`\${v || 0}h\` },
    { key: 'todayRevenue', label: "Today's Revenue", icon: DollarSign, color: 'indigo', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
  };

  return (
    <div className={\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 \${className || ''}\`}>
      {statItems.slice(0, 8).map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        const value = stats?.[stat.key];
        const change = stats?.[stat.key + 'Change'];

        return (
          <div
            key={stat.key}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={\`p-3 rounded-lg \${colors.bg}\`}>
                <Icon className={\`w-6 h-6 \${colors.icon}\`} />
              </div>
              {change !== undefined && (
                <div className={\`flex items-center gap-1 text-sm font-medium \${change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                  {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.format(value)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateOccupancyOverviewParking(options: ParkingOptions = {}): string {
  const { componentName = 'OccupancyOverviewParking', endpoint = '/parking/occupancy' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, ParkingCircle, CheckCircle, XCircle, Clock, Wheelchair, Zap, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onSpotClick?: (spot: any) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSpotClick, className }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['parking-occupancy', selectedLevel, selectedType],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (selectedLevel !== 'all') params.set('level', selectedLevel);
        if (selectedType !== 'all') params.set('type', selectedType);
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return response?.data || response || { spots: [], summary: {} };
      } catch (err) {
        console.error('Failed to fetch parking occupancy:', err);
        return { spots: [], summary: {} };
      }
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; bg: string; border: string; text: string }> = {
      available: { icon: CheckCircle, bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700', text: 'text-green-700 dark:text-green-400' },
      occupied: { icon: Car, bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700', text: 'text-red-700 dark:text-red-400' },
      reserved: { icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-700 dark:text-yellow-400' },
      maintenance: { icon: XCircle, bg: 'bg-gray-100 dark:bg-gray-700', border: 'border-gray-300 dark:border-gray-600', text: 'text-gray-700 dark:text-gray-400' },
    };
    return configs[status?.toLowerCase()] || configs.available;
  };

  const getSpotTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'handicap':
      case 'accessible':
        return <Wheelchair className="w-3 h-3" />;
      case 'ev':
      case 'electric':
        return <Zap className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const levels = ['all', 'P1', 'P2', 'P3', 'G'];
  const types = ['all', 'standard', 'compact', 'handicap', 'ev', 'motorcycle'];

  const spots = data?.spots || [];
  const summary = data?.summary || {};

  // Group spots by level
  const spotsByLevel = spots.reduce((acc: Record<string, any[]>, spot: any) => {
    const level = spot.level || 'P1';
    if (!acc[level]) acc[level] = [];
    acc[level].push(spot);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ParkingCircle className="w-5 h-5 text-blue-600" />
              Parking Occupancy
            </h3>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Available: {summary.available || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-400">Occupied: {summary.occupied || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Reserved: {summary.reserved || 0}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {levels.map((level) => (
                <option key={level} value={level}>{level === 'all' ? 'All Levels' : \`Level \${level}\`}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {types.map((type) => (
                <option key={type} value={type}>{type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Overall Occupancy</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{summary.occupancyRate || 0}%</span>
          </div>
          <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={\`h-full rounded-full transition-all \${
                (summary.occupancyRate || 0) > 90 ? 'bg-red-500' :
                (summary.occupancyRate || 0) > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }\`}
              style={{ width: \`\${summary.occupancyRate || 0}%\` }}
            />
          </div>
        </div>

        {Object.entries(spotsByLevel).map(([level, levelSpots]) => (
          <div key={level} className="mb-6 last:mb-0">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ParkingCircle className="w-4 h-4" />
              Level {level}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({(levelSpots as any[]).filter((s: any) => s.status === 'available').length} available)
              </span>
            </h4>
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-2">
              {(levelSpots as any[]).map((spot: any) => {
                const config = getStatusConfig(spot.status);
                const typeIcon = getSpotTypeIcon(spot.spot_type || spot.type);

                return (
                  <div
                    key={spot.id || spot.spot_number}
                    onClick={() => onSpotClick?.(spot)}
                    className={\`
                      relative p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md text-center
                      \${config.bg} \${config.border}
                    \`}
                    title={\`Spot \${spot.spot_number || spot.number} - \${spot.status}\`}
                  >
                    <div className={\`text-xs font-bold \${config.text}\`}>
                      {spot.spot_number || spot.number}
                    </div>
                    {typeIcon && (
                      <div className={\`absolute top-0.5 right-0.5 \${config.text}\`}>
                        {typeIcon}
                      </div>
                    )}
                    {spot.status === 'occupied' && spot.duration && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {spot.duration}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {spots.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No parking spots found
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
            <Wheelchair className="w-4 h-4" />
            <span className="text-sm">Accessible</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.accessibleAvailable || 0} / {summary.accessibleTotal || 0}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-sm">EV Charging</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.evAvailable || 0} / {summary.evTotal || 0}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
            <Car className="w-4 h-4" />
            <span className="text-sm">Compact</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.compactAvailable || 0} / {summary.compactTotal || 0}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Reserved</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.reservedCount || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateReservationFiltersParking(options: ParkingOptions = {}): string {
  const { componentName = 'ReservationFiltersParking' } = options;

  return `import React, { useState } from 'react';
import { Filter, Search, Calendar, Clock, Car, DollarSign, ParkingCircle, User } from 'lucide-react';

interface ${componentName}Props {
  onFilterChange?: (filters: ParkingReservationFilters) => void;
  className?: string;
}

interface ParkingReservationFilters {
  search: string;
  status: string;
  spotType: string;
  level: string;
  dateRange: { start: string; end: string };
  duration: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange, className }) => {
  const [filters, setFilters] = useState<ParkingReservationFilters>({
    search: '',
    status: '',
    spotType: '',
    level: '',
    dateRange: { start: '', end: '' },
    duration: '',
  });

  const handleChange = (key: keyof ParkingReservationFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const statuses = ['active', 'upcoming', 'completed', 'cancelled', 'expired'];
  const spotTypes = ['standard', 'compact', 'handicap', 'ev', 'motorcycle', 'oversized'];
  const levels = ['P1', 'P2', 'P3', 'G'];
  const durations = ['hourly', 'daily', 'weekly', 'monthly'];

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 \${className || ''}\`}>
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Filter Reservations</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="License plate, name, spot..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Car className="w-4 h-4 inline mr-1" /> Spot Type
          </label>
          <select
            value={filters.spotType}
            onChange={(e) => handleChange('spotType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            {spotTypes.map((type) => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <ParkingCircle className="w-4 h-4 inline mr-1" /> Level
          </label>
          <select
            value={filters.level}
            onChange={(e) => handleChange('level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Levels</option>
            {levels.map((level) => (
              <option key={level} value={level}>Level {level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-1" /> Duration Type
          </label>
          <select
            value={filters.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Durations</option>
            {durations.map((dur) => (
              <option key={dur} value={dur}>{dur.charAt(0).toUpperCase() + dur.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" /> Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              const resetFilters: ParkingReservationFilters = {
                search: '',
                status: '',
                spotType: '',
                level: '',
                dateRange: { start: '', end: '' },
                duration: '',
              };
              setFilters(resetFilters);
              onFilterChange?.(resetFilters);
            }}
            className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => onFilterChange?.(filters)}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCustomerProfileParking(options: ParkingOptions = {}): string {
  const { componentName = 'CustomerProfileParking', endpoint = '/parking/customers' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Car, Calendar, ArrowLeft, Edit, CreditCard, History, Clock, ParkingCircle, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propCustomerId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const customerId = propCustomerId || paramId;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['parking-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
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

  const vehicles = customer.vehicles || [];
  const recentParkings = customer.recent_parkings || customer.recentParkings || [];

  return (
    <div className={\`max-w-4xl mx-auto \${className || ''}\`}>
      <div className="mb-6">
        <Link to="${endpoint}" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                {customer.avatar_url || customer.photo ? (
                  <img src={customer.avatar_url || customer.photo} alt={customer.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {customer.name || \`\${customer.first_name || ''} \${customer.last_name || ''}\`.trim()}
                </h1>
                {customer.membership_type && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs mt-1">
                    <Star className="w-3 h-3" /> {customer.membership_type} Member
                  </span>
                )}
              </div>
            </div>
            <Link
              to={\`${endpoint}/\${customerId}/edit\`}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" /> Contact Information
            </h3>
            {customer.email && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={\`mailto:\${customer.email}\`} className="hover:text-blue-600">{customer.email}</a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={\`tel:\${customer.phone}\`} className="hover:text-blue-600">{customer.phone}</a>
              </div>
            )}
            {customer.member_since && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Member since {new Date(customer.member_since).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ParkingCircle className="w-5 h-5" /> Assigned Spot
            </h3>
            {customer.assigned_spot ? (
              <>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <ParkingCircle className="w-5 h-5 text-gray-400" />
                  <span>Spot {customer.assigned_spot} (Level {customer.assigned_level || 'P1'})</span>
                </div>
                {customer.subscription_expires && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Expires: {new Date(customer.subscription_expires).toLocaleDateString()}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No assigned spot</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Car className="w-5 h-5" /> Registered Vehicles
          </h3>
          {vehicles.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {vehicles.map((vehicle: any, idx: number) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{vehicle.license_plate || vehicle.licensePlate}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ')}
                    </div>
                    {vehicle.color && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{vehicle.color}</div>
                    )}
                  </div>
                  {vehicle.is_primary && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No vehicles registered</p>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <History className="w-5 h-5" /> Parking Statistics
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{customer.total_visits || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Visits</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{customer.total_hours || 0}h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">\${(customer.total_spent || 0).toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{customer.loyalty_points || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reward Points</div>
            </div>
          </div>
        </div>

        {recentParkings.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" /> Recent Parking Sessions
            </h3>
            <div className="space-y-3">
              {recentParkings.slice(0, 5).map((parking: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ParkingCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Spot {parking.spot_number} (Level {parking.level})
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(parking.entry_time || parking.entryTime).toLocaleDateString()} - {parking.duration || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">\${parking.amount || 0}</div>
                    <div className={\`text-xs px-2 py-0.5 rounded \${
                      parking.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }\`}>
                      {parking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {customer.balance !== undefined && customer.balance !== 0 && (
          <div className={\`p-6 border-t border-gray-200 dark:border-gray-700 \${customer.balance > 0 ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}\`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className={\`w-6 h-6 \${customer.balance > 0 ? 'text-green-600' : 'text-red-600'}\`} />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {customer.balance > 0 ? 'Account Credit' : 'Outstanding Balance'}
                  </div>
                  <div className={\`text-2xl font-bold \${customer.balance > 0 ? 'text-green-600' : 'text-red-600'}\`}>
                    \${Math.abs(customer.balance).toLocaleString()}
                  </div>
                </div>
              </div>
              <button className={\`px-4 py-2 rounded-lg \${customer.balance > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white\`}>
                {customer.balance > 0 ? 'Use Credit' : 'Process Payment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
