/**
 * Tailor Service Component Generators
 *
 * Generates components for tailor/alteration service management:
 * - TailorStats: Dashboard statistics
 * - FittingCalendar: Calendar view of fitting appointments
 * - FittingListToday: Today's fitting appointments
 * - CustomerProfileTailor: Customer profile with measurements
 */

export interface TailorStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTailorStats(options: TailorStatsOptions = {}): string {
  const { componentName = 'TailorStats', endpoint = '/tailor/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Scissors, Calendar, Clock, DollarSign, Users, Ruler, CheckCircle, AlertTriangle, Shirt, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['tailor-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  const statCards = [
    { key: 'fittingsToday', label: "Today's Fittings", icon: Calendar, color: 'blue' },
    { key: 'ordersInProgress', label: 'Orders In Progress', icon: Scissors, color: 'yellow' },
    { key: 'readyForPickup', label: 'Ready for Pickup', icon: CheckCircle, color: 'green' },
    { key: 'rushOrders', label: 'Rush Orders', icon: AlertTriangle, color: 'red' },
    { key: 'customOrders', label: 'Custom Orders', icon: Shirt, color: 'purple' },
    { key: 'activeCustomers', label: 'Active Customers', icon: Users, color: 'indigo' },
    { key: 'revenueToday', label: "Today's Revenue", icon: DollarSign, color: 'emerald', type: 'currency' },
    { key: 'avgCompletionTime', label: 'Avg Completion', icon: Clock, color: 'orange', suffix: ' days' },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  };

  const formatValue = (value: any, type?: string, suffix?: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString() + (suffix || '');
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        const value = stats?.[stat.key];

        return (
          <div
            key={stat.key}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-lg', colors.bg)}>
                <Icon className={cn('w-6 h-6', colors.icon)} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatValue(value, stat.type, stat.suffix)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

export interface FittingCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFittingCalendar(options: FittingCalendarOptions = {}): string {
  const { componentName = 'FittingCalendar', endpoint = '/tailor/fittings' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Ruler, User, Clock, Scissors, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFitting, setSelectedFitting] = useState<any | null>(null);

  const { data: fittings, isLoading } = useQuery({
    queryKey: ['fittings', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      const response = await api.get<any>(\`${endpoint}?start=\${startDate}&end=\${endDate}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

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

  const getFittingsForDate = (date: Date) => {
    return (fittings || []).filter((fitting: any) => {
      const fittingDate = new Date(fitting.appointment_date || fitting.date);
      return (
        fittingDate.getFullYear() === date.getFullYear() &&
        fittingDate.getMonth() === date.getMonth() &&
        fittingDate.getDate() === date.getDate()
      );
    });
  };

  const getFittingTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'initial':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'final':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      case 'pickup':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/fittings/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Schedule Fitting
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Initial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Follow-up</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Final</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Pickup</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {WEEKDAYS.map(day => (
              <div key={day} className="py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayFittings = getFittingsForDate(day.date);
              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    !day.isCurrentMonth && 'bg-gray-50 dark:bg-gray-800/50',
                    idx % 7 === 6 && 'border-r-0'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                    isToday(day.date) && 'bg-blue-600 text-white',
                    !isToday(day.date) && !day.isCurrentMonth && 'text-gray-400'
                  )}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayFittings.slice(0, 3).map((fitting: any) => (
                      <div
                        key={fitting.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedFitting(fitting); }}
                        className={cn(
                          'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2',
                          getFittingTypeColor(fitting.fitting_type || fitting.type)
                        )}
                      >
                        {fitting.time} - {fitting.customer_name}
                      </div>
                    ))}
                    {dayFittings.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">+{dayFittings.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fitting Detail Modal */}
      {selectedFitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedFitting(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fitting Details</h3>
              <button onClick={() => setSelectedFitting(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFitting.customer_name}</p>
                  <p className="text-sm text-gray-500">{selectedFitting.customer_phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedFitting.appointment_date || selectedFitting.date).toLocaleDateString()} at {selectedFitting.time}
                  </p>
                  <p className="text-sm text-gray-500">{selectedFitting.duration || 30} minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedFitting.fitting_type || selectedFitting.type} Fitting</p>
                </div>
              </div>

              {selectedFitting.garment_type && (
                <div className="flex items-center gap-3">
                  <Scissors className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{selectedFitting.garment_type}</p>
                </div>
              )}

              {selectedFitting.notes && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-900 dark:text-white">{selectedFitting.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`/fittings/\${selectedFitting.id}\`); setSelectedFitting(null); }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Details
              </button>
              <button
                onClick={() => setSelectedFitting(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Close
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

export interface FittingListTodayOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFittingListToday(options: FittingListTodayOptions = {}): string {
  const { componentName = 'FittingListToday', endpoint = '/tailor/fittings/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Ruler, User, Clock, Scissors, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  onItemClick?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, onItemClick }) => {
  const navigate = useNavigate();

  const { data: fittings, isLoading } = useQuery({
    queryKey: ['today-fittings'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle };
      case 'in_progress':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Ruler };
      case 'scheduled':
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Clock };
      case 'no_show':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertCircle };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: Clock };
    }
  };

  const getFittingTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'initial':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'final':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pickup':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleClick = (fitting: any) => {
    if (onItemClick) {
      onItemClick(fitting);
    } else {
      navigate(\`/fittings/\${fitting.id}\`);
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Fittings</h2>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
            {fittings?.length || 0} appointments
          </span>
        </div>
      </div>

      {fittings && fittings.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {fittings.map((fitting: any) => {
            const statusStyle = getStatusStyle(fitting.status);
            const StatusIcon = statusStyle.icon;

            return (
              <li
                key={fitting.id}
                onClick={() => handleClick(fitting)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', statusStyle.bg)}>
                    <StatusIcon className={cn('w-5 h-5', statusStyle.text)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 dark:text-white">{fitting.customer_name}</p>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', getFittingTypeBadge(fitting.fitting_type || fitting.type))}>
                        {fitting.fitting_type || fitting.type}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{fitting.time}</span>
                      </div>
                      {fitting.garment_type && (
                        <div className="flex items-center gap-1">
                          <Scissors className="w-4 h-4" />
                          <span>{fitting.garment_type}</span>
                        </div>
                      )}
                      {fitting.order_number && (
                        <span className="text-gray-500">Order #{fitting.order_number}</span>
                      )}
                    </div>

                    {fitting.notes && (
                      <p className="mt-2 text-sm text-gray-500 truncate">{fitting.notes}</p>
                    )}
                  </div>

                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full capitalize', statusStyle.bg, statusStyle.text)}>
                    {fitting.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-12">
          <Ruler className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No fittings scheduled for today</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface CustomerProfileTailorOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileTailor(options: CustomerProfileTailorOptions = {}): string {
  const { componentName = 'CustomerProfileTailor', endpoint = '/tailor/customers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Ruler, Calendar, DollarSign, ArrowLeft, Edit, Loader2, Scissors, CheckCircle, Package } from 'lucide-react';
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
    queryKey: ['tailor-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: orderHistory } = useQuery({
    queryKey: ['tailor-customer-orders', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/orders\`);
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

  const getOrderStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ready':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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
            onClick={() => navigate(\`/orders/new?customer=\${customerId}\`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Scissors className="w-4 h-4" />
            New Order
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

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
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
                <Calendar className="w-4 h-4" />
                <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.total_orders || 0}</div>
            <div className="text-sm text-gray-500">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${(customer.total_spent || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.garments_made || 0}</div>
            <div className="text-sm text-gray-500">Garments Made</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Last Visit</div>
          </div>
        </div>
      </div>

      {/* Measurements */}
      {customer.measurements && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Measurements</h2>
            <button
              onClick={() => navigate(\`/customers/\${customerId}/measurements\`)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Update
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(customer.measurements).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-center">
                <p className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{value as string}"</p>
              </div>
            ))}
          </div>
          {customer.measurements_updated_at && (
            <p className="mt-4 text-sm text-gray-500">
              Last updated: {new Date(customer.measurements_updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Style Preferences */}
      {customer.preferences && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Style Preferences</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {customer.preferences.preferred_fabrics && (
              <div>
                <p className="text-sm text-gray-500">Preferred Fabrics</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {customer.preferences.preferred_fabrics.map((fabric: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">{fabric}</span>
                  ))}
                </div>
              </div>
            )}
            {customer.preferences.fit_preference && (
              <div>
                <p className="text-sm text-gray-500">Fit Preference</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.preferences.fit_preference}</p>
              </div>
            )}
            {customer.preferences.collar_style && (
              <div>
                <p className="text-sm text-gray-500">Collar Style</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.preferences.collar_style}</p>
              </div>
            )}
          </div>
          {customer.preferences.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-2">Special Notes</p>
              <p className="text-gray-900 dark:text-white">{customer.preferences.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Order History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order History</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        {orderHistory && orderHistory.length > 0 ? (
          <div className="space-y-3">
            {orderHistory.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                onClick={() => navigate(\`/orders/\${order.id}\`)}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                  )}>
                    {order.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Scissors className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.garment_type} - {order.service_type || 'Custom'}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      {order.fabric && <span>{order.fabric}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">\${(order.price || 0).toLocaleString()}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', getOrderStatusStyle(order.status))}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500">No order history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
