/**
 * Marina Management Component Generators
 *
 * Generates components for marina/boat slip management including:
 * - MarinaStats, ReservationCalendarMarina, ReservationListTodayMarina
 * - SlipAvailability, CustomerProfileMarina
 */

export interface MarinaOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMarinaStats(options: MarinaOptions = {}): string {
  const { componentName = 'MarinaStats', endpoint = '/marina/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Anchor, Ship, Users, DollarSign, TrendingUp, TrendingDown, Loader2, Calendar, Waves, Fuel } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['marina-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch marina stats:', err);
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
    { key: 'occupiedSlips', label: 'Occupied Slips', icon: Anchor, color: 'blue', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'availableSlips', label: 'Available Slips', icon: Waves, color: 'green', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'totalBoats', label: 'Total Boats', icon: Ship, color: 'purple', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'activeCustomers', label: 'Active Customers', icon: Users, color: 'emerald', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'arrivalsToday', label: 'Arrivals Today', icon: Calendar, color: 'yellow', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'departuresToday', label: 'Departures Today', icon: Calendar, color: 'orange', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'fuelSalesToday', label: 'Fuel Sales Today', icon: Fuel, color: 'red', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: DollarSign, color: 'indigo', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
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

export function generateReservationCalendarMarina(options: MarinaOptions = {}): string {
  const { componentName = 'ReservationCalendarMarina', endpoint = '/marina/reservations/calendar' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Anchor, Ship, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  slipId?: string;
  onReservationClick?: (reservation: any) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ slipId, onReservationClick, onDateSelect, className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['marina-reservations', slipId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
          ...(slipId ? { slip_id: slipId } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch marina reservations:', err);
        return [];
      }
    },
  });

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const getReservationsForDate = (date: Date) => {
    return reservations?.filter((res: any) => {
      const arrival = new Date(res.arrival_date || res.arrivalDate || res.start_date);
      const departure = new Date(res.departure_date || res.departureDate || res.end_date);
      return date >= arrival && date <= departure;
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Anchor className="w-5 h-5 text-blue-600" />
            Marina Reservations
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-gray-900 dark:text-white font-medium min-w-[150px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dayReservations = getReservationsForDate(day.date);
            const hasReservations = dayReservations.length > 0;
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(day.date)}
                className={\`
                  min-h-[90px] p-2 rounded-lg cursor-pointer transition-all border
                  \${!day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 border-transparent' : 'border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}
                  \${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}
                  \${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : ''}
                \`}
              >
                <div className={\`text-sm font-medium mb-1 \${isToday(day.date) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}\`}>
                  {day.date.getDate()}
                </div>
                {hasReservations && (
                  <div className="space-y-1">
                    {dayReservations.slice(0, 2).map((res: any, i: number) => (
                      <div
                        key={i}
                        onClick={(e) => { e.stopPropagation(); onReservationClick?.(res); }}
                        className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded truncate cursor-pointer flex items-center gap-1"
                      >
                        <Ship className="w-3 h-3" />
                        {res.slip_number || res.slipNumber || 'Slip'}: {res.boat_name || res.boatName || res.customer_name || 'Boat'}
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayReservations.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-blue-500 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateReservationListTodayMarina(options: MarinaOptions = {}): string {
  const { componentName = 'ReservationListTodayMarina', endpoint = '/marina/reservations/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Anchor, Ship, User, Clock, ArrowRight, Loader2, Calendar, Phone, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['marina-reservations-today'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || { arrivals: [], departures: [] };
      } catch (err) {
        console.error('Failed to fetch today reservations:', err);
        return { arrivals: [], departures: [] };
      }
    },
  });

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const arrivals = data?.arrivals || [];
  const departures = data?.departures || [];

  return (
    <div className={\`grid md:grid-cols-2 gap-6 \${className || ''}\`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-600" />
            Arrivals Today
          </h3>
          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm rounded-full">
            {arrivals.length}
          </span>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
          {arrivals.map((res: any, idx: number) => (
            <div
              key={res.id || idx}
              onClick={() => navigate(\`/marina/reservations/\${res.id}\`)}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{res.boat_name || res.boatName || 'Unnamed Boat'}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Slip {res.slip_number || res.slipNumber}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {res.customer_name || res.customerName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {res.arrival_time || res.arrivalTime || 'TBD'}
                </span>
              </div>
              {res.boat_length && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {res.boat_length}ft {res.boat_type || ''}
                </div>
              )}
            </div>
          ))}
          {arrivals.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No arrivals scheduled today
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-orange-600 rotate-180" />
            Departures Today
          </h3>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-sm rounded-full">
            {departures.length}
          </span>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
          {departures.map((res: any, idx: number) => (
            <div
              key={res.id || idx}
              onClick={() => navigate(\`/marina/reservations/\${res.id}\`)}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{res.boat_name || res.boatName || 'Unnamed Boat'}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Slip {res.slip_number || res.slipNumber}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {res.customer_name || res.customerName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {res.departure_time || res.departureTime || 'TBD'}
                </span>
              </div>
              {res.balance_due !== undefined && res.balance_due > 0 && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                  Balance Due: \${res.balance_due.toLocaleString()}
                </div>
              )}
            </div>
          ))}
          {departures.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No departures scheduled today
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

export function generateSlipAvailability(options: MarinaOptions = {}): string {
  const { componentName = 'SlipAvailability', endpoint = '/marina/slips/availability' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Anchor, CheckCircle, Ship, Clock, Wrench, Loader2, Filter, Waves, Zap, Droplets } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onSlipClick?: (slip: any) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSlipClick, className }) => {
  const [filterSize, setFilterSize] = useState<string>('');
  const [filterDock, setFilterDock] = useState<string>('');

  const { data: slips, isLoading } = useQuery({
    queryKey: ['marina-slips', filterSize, filterDock],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filterSize) params.set('size', filterSize);
        if (filterDock) params.set('dock', filterDock);
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch slip availability:', err);
        return [];
      }
    },
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; bg: string; text: string; label: string }> = {
      available: { icon: CheckCircle, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Available' },
      occupied: { icon: Ship, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Occupied' },
      reserved: { icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Reserved' },
      maintenance: { icon: Wrench, bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', label: 'Maintenance' },
    };
    return configs[status?.toLowerCase()] || configs.available;
  };

  const slipSizes = ['small', 'medium', 'large', 'xlarge'];
  const docks = ['A', 'B', 'C', 'D', 'E', 'F'];

  const statusCounts = slips?.reduce((acc: Record<string, number>, slip: any) => {
    const status = slip.status?.toLowerCase() || 'available';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Group slips by dock
  const slipsByDock = slips?.reduce((acc: Record<string, any[]>, slip: any) => {
    const dock = slip.dock || slip.dock_id || 'A';
    if (!acc[dock]) acc[dock] = [];
    acc[dock].push(slip);
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      <div className="flex flex-wrap gap-4">
        {['available', 'occupied', 'reserved', 'maintenance'].map((status) => {
          const config = getStatusConfig(status);
          const Icon = config.icon;
          return (
            <div key={status} className={\`flex items-center gap-3 px-4 py-3 rounded-lg \${config.bg}\`}>
              <Icon className={\`w-5 h-5 \${config.text}\`} />
              <div>
                <div className={\`text-xl font-bold \${config.text}\`}>{statusCounts[status] || 0}</div>
                <div className={\`text-sm \${config.text}\`}>{config.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Sizes</option>
            {slipSizes.map((size) => (
              <option key={size} value={size}>{size.charAt(0).toUpperCase() + size.slice(1)} (up to {size === 'small' ? '25' : size === 'medium' ? '40' : size === 'large' ? '60' : '100'}ft)</option>
            ))}
          </select>
          <select
            value={filterDock}
            onChange={(e) => setFilterDock(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Docks</option>
            {docks.map((dock) => (
              <option key={dock} value={dock}>Dock {dock}</option>
            ))}
          </select>
        </div>

        {Object.entries(slipsByDock).map(([dock, dockSlips]) => (
          <div key={dock} className="mb-6 last:mb-0">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Waves className="w-5 h-5 text-blue-500" />
              Dock {dock}
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {(dockSlips as any[]).map((slip: any) => {
                const config = getStatusConfig(slip.status);
                const Icon = config.icon;

                return (
                  <div
                    key={slip.id || slip.slip_number}
                    onClick={() => onSlipClick?.(slip)}
                    className={\`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md \${config.bg} border-transparent hover:border-blue-400\`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={\`font-bold text-sm \${config.text}\`}>
                        {slip.slip_number || slip.number}
                      </span>
                      <Icon className={\`w-4 h-4 \${config.text}\`} />
                    </div>
                    <div className={\`text-xs \${config.text}\`}>
                      {slip.max_length || slip.length}ft
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {slip.power && <Zap className="w-3 h-3 text-yellow-500" />}
                      {slip.water && <Droplets className="w-3 h-3 text-blue-500" />}
                    </div>
                    {slip.boat_name && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 flex items-center gap-1">
                        <Ship className="w-3 h-3" />
                        {slip.boat_name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {(!slips || slips.length === 0) && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No slips found matching your filters
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCustomerProfileMarina(options: MarinaOptions = {}): string {
  const { componentName = 'CustomerProfileMarina', endpoint = '/marina/customers' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, MapPin, Calendar, Ship, Anchor, ArrowLeft, Edit, CreditCard, History, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propCustomerId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const customerId = propCustomerId || paramId;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['marina-customer', customerId],
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

  const boats = customer.boats || [];

  return (
    <div className={\`max-w-4xl mx-auto \${className || ''}\`}>
      <div className="mb-6">
        <Link to="${endpoint}" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-cyan-600">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                {customer.avatar_url || customer.photo ? (
                  <img src={customer.avatar_url || customer.photo} alt={customer.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {customer.name || \`\${customer.first_name || ''} \${customer.last_name || ''}\`.trim()}
                </h1>
                {customer.membership_type && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs mt-1">
                    <Star className="w-3 h-3" /> {customer.membership_type}
                  </span>
                )}
                {customer.member_since && (
                  <p className="text-white/80 text-sm mt-1">Member since {new Date(customer.member_since).getFullYear()}</p>
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
            {(customer.address || customer.city || customer.state) && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{[customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Anchor className="w-5 h-5" /> Current Slip
            </h3>
            {customer.current_slip ? (
              <>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Anchor className="w-5 h-5 text-gray-400" />
                  <span>Slip {customer.current_slip} (Dock {customer.current_dock || 'A'})</span>
                </div>
                {customer.slip_start_date && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Since {new Date(customer.slip_start_date).toLocaleDateString()}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No current slip assigned</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Ship className="w-5 h-5" /> Registered Boats
          </h3>
          {boats.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {boats.map((boat: any, idx: number) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Ship className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{boat.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {boat.make && <div>Make: {boat.make}</div>}
                    {boat.model && <div>Model: {boat.model}</div>}
                    {boat.year && <div>Year: {boat.year}</div>}
                    {boat.length && <div>Length: {boat.length}ft</div>}
                    {boat.registration && <div className="col-span-2">Reg: {boat.registration}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No boats registered</p>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <History className="w-5 h-5" /> Account Summary
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{customer.total_visits || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Visits</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{customer.total_nights || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Nights</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">\${(customer.total_spent || 0).toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{customer.loyalty_points || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Loyalty Points</div>
            </div>
          </div>
        </div>

        {customer.balance_due !== undefined && customer.balance_due > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-red-600" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Outstanding Balance</div>
                  <div className="text-2xl font-bold text-red-600">\${customer.balance_due.toLocaleString()}</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Process Payment
              </button>
            </div>
          </div>
        )}

        {customer.notes && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
            <p className="text-gray-600 dark:text-gray-400">{customer.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
