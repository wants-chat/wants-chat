/**
 * Moving Service Component Generators
 *
 * Generates components for moving service management:
 * - MovingStats: Dashboard statistics
 * - MoveCalendar: Calendar view of scheduled moves
 * - UpcomingMoves: List of upcoming moves
 * - CustomerProfileMoving: Customer profile with move history
 */

export interface MovingStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMovingStats(options: MovingStatsOptions = {}): string {
  const { componentName = 'MovingStats', endpoint = '/moving/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, Calendar, Clock, DollarSign, Users, Package, CheckCircle, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['moving-stats'],
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
    { key: 'todayMoves', label: "Today's Moves", icon: Truck, color: 'blue' },
    { key: 'scheduledThisWeek', label: 'Scheduled This Week', icon: Calendar, color: 'purple' },
    { key: 'completedToday', label: 'Completed Today', icon: CheckCircle, color: 'green' },
    { key: 'pendingQuotes', label: 'Pending Quotes', icon: AlertTriangle, color: 'yellow' },
    { key: 'activeCrews', label: 'Active Crews', icon: Users, color: 'indigo' },
    { key: 'trucksInUse', label: 'Trucks In Use', icon: Truck, color: 'orange' },
    { key: 'revenueToday', label: "Today's Revenue", icon: DollarSign, color: 'emerald', type: 'currency' },
    { key: 'avgMoveTime', label: 'Avg Move Time', icon: Clock, color: 'red', suffix: ' hrs' },
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

export interface MoveCalendarOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMoveCalendar(options: MoveCalendarOptions = {}): string {
  const { componentName = 'MoveCalendar', endpoint = '/moving/jobs' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Truck, MapPin, Clock, Users, Loader2, X } from 'lucide-react';
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
  const [selectedMove, setSelectedMove] = useState<any | null>(null);

  const { data: moves, isLoading } = useQuery({
    queryKey: ['moving-jobs', currentDate.getMonth(), currentDate.getFullYear()],
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

  const getMovesForDate = (date: Date) => {
    return (moves || []).filter((move: any) => {
      const moveDate = new Date(move.move_date || move.scheduled_date);
      return (
        moveDate.getFullYear() === date.getFullYear() &&
        moveDate.getMonth() === date.getMonth() &&
        moveDate.getDate() === date.getDate()
      );
    });
  };

  const getMoveTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'local':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
      case 'long_distance':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
      case 'commercial':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
      case 'packing_only':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
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
            onClick={() => navigate('/moves/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Schedule Move
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Local</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Long Distance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">Commercial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Packing Only</span>
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
              const dayMoves = getMovesForDate(day.date);
              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50',
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
                    {dayMoves.slice(0, 2).map((move: any) => (
                      <div
                        key={move.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedMove(move); }}
                        className={cn(
                          'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2',
                          getMoveTypeColor(move.move_type || move.type)
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {move.customer_name}
                        </div>
                      </div>
                    ))}
                    {dayMoves.length > 2 && (
                      <div className="text-xs text-gray-500 pl-2">+{dayMoves.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Move Detail Modal */}
      {selectedMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedMove(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Move Details</h3>
              <button onClick={() => setSelectedMove(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedMove.customer_name}</p>
                {selectedMove.customer_phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMove.customer_phone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                    <p className="text-gray-900 dark:text-white text-sm">{selectedMove.origin_address}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                    <p className="text-gray-900 dark:text-white text-sm">{selectedMove.destination_address}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedMove.move_date || selectedMove.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-gray-900 dark:text-white">{selectedMove.start_time || '8:00 AM'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Est. Duration</p>
                  <p className="text-gray-900 dark:text-white">{selectedMove.estimated_hours || 4} hours</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Crew Size</p>
                  <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                    <Users className="w-4 h-4" />
                    {selectedMove.crew_size || 2} movers
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Truck</p>
                  <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                    <Truck className="w-4 h-4" />
                    {selectedMove.truck_size || '26ft'}
                  </div>
                </div>
              </div>

              {selectedMove.notes && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-900 dark:text-white">{selectedMove.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`/moves/\${selectedMove.id}\`); setSelectedMove(null); }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Details
              </button>
              <button
                onClick={() => setSelectedMove(null)}
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

export interface UpcomingMovesOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateUpcomingMoves(options: UpcomingMovesOptions = {}): string {
  const { componentName = 'UpcomingMoves', endpoint = '/moving/jobs/upcoming' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Clock, Users, Calendar, DollarSign, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, limit = 10 }) => {
  const navigate = useNavigate();

  const { data: moves, isLoading } = useQuery({
    queryKey: ['upcoming-moves', limit],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getMoveTypeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'local':
        return 'bg-blue-500';
      case 'long_distance':
        return 'bg-purple-500';
      case 'commercial':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Moves</h2>
          <button
            onClick={() => navigate('/moves')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
      </div>

      {moves && moves.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {moves.map((move: any) => (
            <li
              key={move.id}
              onClick={() => navigate(\`/moves/\${move.id}\`)}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center relative">
                  <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div className={cn(
                    'absolute -top-1 -right-1 w-3 h-3 rounded-full',
                    getMoveTypeStyle(move.move_type || move.type)
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 dark:text-white">{move.customer_name}</p>
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', getStatusStyle(move.status))}>
                      {move.status}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span className="truncate">{move.origin_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <span className="truncate">{move.destination_address}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(move.move_date || move.scheduled_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{move.start_time || '8:00 AM'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{move.crew_size || 2} movers</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <DollarSign className="w-4 h-4" />
                      <span>{(move.estimated_cost || move.price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No upcoming moves scheduled</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface CustomerProfileMovingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileMoving(options: CustomerProfileMovingOptions = {}): string {
  const { componentName = 'CustomerProfileMoving', endpoint = '/moving/customers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Truck, Calendar, DollarSign, ArrowLeft, Edit, Loader2, Clock, CheckCircle, Package } from 'lucide-react';
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
    queryKey: ['moving-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: moveHistory } = useQuery({
    queryKey: ['customer-moves', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/moves\`);
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

  const getMoveStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'scheduled':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
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
            onClick={() => navigate(\`/quotes/new?customer=\${customerId}\`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Truck className="w-4 h-4" />
            New Quote
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
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
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
                <MapPin className="w-4 h-4" />
                <span>{customer.current_address || customer.address || 'No address'}</span>
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.total_moves || 0}</div>
            <div className="text-sm text-gray-500">Total Moves</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${(customer.total_spent || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.referrals || 0}</div>
            <div className="text-sm text-gray-500">Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.last_move ? new Date(customer.last_move).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Last Move</div>
          </div>
        </div>
      </div>

      {/* Move History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Move History</h2>
        </div>
        {moveHistory && moveHistory.length > 0 ? (
          <div className="space-y-4">
            {moveHistory.map((move: any) => (
              <div
                key={move.id}
                onClick={() => navigate(\`/moves/\${move.id}\`)}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      move.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    )}>
                      {move.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Truck className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {move.move_type || 'Local'} Move
                      </p>
                      <div className="mt-1 space-y-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span className="truncate">{move.origin_address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-400" />
                          <span className="truncate">{move.destination_address}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{new Date(move.move_date).toLocaleDateString()}</span>
                        {move.crew_size && <span>{move.crew_size} movers</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">\${(move.total_cost || move.price || 0).toLocaleString()}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', getMoveStatusStyle(move.status))}>
                      {move.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Truck className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500">No move history</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
