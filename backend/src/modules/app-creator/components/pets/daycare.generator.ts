/**
 * Pet Daycare Component Generators
 *
 * Generates components for pet daycare facilities:
 * - DaycareStats: Dashboard statistics for daycare
 * - ActivityCalendarDaycare: Activity and event calendar
 * - CheckinListToday: Today's check-in/check-out list
 * - ChildProfile: Pet profile in daycare context (referring to pets as "children" in daycare terminology)
 */

export interface DaycareStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface ActivityCalendarOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface CheckinListOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface ChildProfileOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate DaycareStats component
 */
export function generateDaycareStats(options: DaycareStatsOptions = {}): string {
  const {
    componentName = 'DaycareStats',
    endpoint = '/daycare/stats',
    queryKey = 'daycare-stats',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dog,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

interface StatsData {
  checkedInToday: number;
  checkedInChange?: number;
  expectedToday: number;
  totalCapacity: number;
  capacityUtilization: number;
  capacityChange?: number;
  weeklyVisits: number;
  weeklyVisitsChange?: number;
  monthlyRevenue: number;
  revenueChange?: number;
  pendingCheckins: number;
  pendingCheckouts: number;
  activePackages: number;
  averageRating: number;
}

const statsConfig = [
  { key: 'checkedInToday', label: 'Checked In Today', icon: 'Dog', color: 'blue', type: 'number' },
  { key: 'capacityUtilization', label: 'Capacity Utilization', icon: 'Users', color: 'green', type: 'percentage' },
  { key: 'weeklyVisits', label: 'Weekly Visits', icon: 'Calendar', color: 'purple', type: 'number' },
  { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: 'DollarSign', color: 'emerald', type: 'currency' },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
};

const iconMap: Record<string, React.FC<any>> = {
  Dog,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<StatsData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch daycare stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    if (type === 'percentage') return value + '%';
    return Number(value).toLocaleString();
  };

  const getChangeKey = (key: string) => {
    const changeMap: Record<string, string> = {
      checkedInToday: 'checkedInChange',
      capacityUtilization: 'capacityChange',
      weeklyVisits: 'weeklyVisitsChange',
      monthlyRevenue: 'revenueChange',
    };
    return changeMap[key];
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
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

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat) => {
          const Icon = iconMap[stat.icon] || Dog;
          const colors = colorClasses[stat.color] || colorClasses.blue;
          const value = stats?.[stat.key as keyof StatsData];
          const changeKey = getChangeKey(stat.key);
          const change = changeKey ? stats?.[changeKey as keyof StatsData] : undefined;

          return (
            <div
              key={stat.key}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-lg', colors.bg)}>
                  <Icon className={cn('w-6 h-6', colors.icon)} />
                </div>
                {change !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    Number(change) >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {Number(change) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(Number(change))}%
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {formatValue(value, stat.type)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expected Today</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.expectedToday || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Check-ins</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.pendingCheckins || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Checkouts</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.pendingCheckouts || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.averageRating?.toFixed(1) || '-'} / 5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Today's Capacity</h3>
          <span className="text-sm text-gray-500">
            {stats?.checkedInToday || 0} / {stats?.totalCapacity || 0} spots filled
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className={cn(
              'h-4 rounded-full transition-all',
              (stats?.capacityUtilization || 0) >= 90 ? 'bg-red-500' :
              (stats?.capacityUtilization || 0) >= 70 ? 'bg-yellow-500' : 'bg-green-500'
            )}
            style={{ width: \`\${Math.min(stats?.capacityUtilization || 0, 100)}%\` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate ActivityCalendarDaycare component
 */
export function generateActivityCalendarDaycare(options: ActivityCalendarOptions = {}): string {
  const {
    componentName = 'ActivityCalendarDaycare',
    endpoint = '/daycare/activities',
    queryKey = 'daycare-activities',
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Utensils,
  Moon,
  Activity,
  Users,
  X,
  Loader2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface DaycareActivity {
  id: string;
  title: string;
  type: 'playtime' | 'feeding' | 'rest' | 'training' | 'group_activity' | 'individual';
  start_time: string;
  end_time: string;
  date: string;
  location?: string;
  staff_assigned?: string;
  participants?: { id: string; name: string }[];
  description?: string;
  recurring?: boolean;
}

interface ${componentName}Props {
  data?: DaycareActivity[];
  className?: string;
  onActivityClick?: (activity: DaycareActivity) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

const activityConfig: Record<string, { icon: React.FC<any>; color: string }> = {
  playtime: { icon: Play, color: 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400' },
  feeding: { icon: Utensils, color: 'bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-400' },
  rest: { icon: Moon, color: 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400' },
  training: { icon: Activity, color: 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-400' },
  group_activity: { icon: Users, color: 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400' },
  individual: { icon: Activity, color: 'bg-pink-100 border-pink-300 text-pink-700 dark:bg-pink-900/30 dark:border-pink-700 dark:text-pink-400' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  className,
  onActivityClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  const [selectedActivity, setSelectedActivity] = useState<DaycareActivity | null>(null);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.toISOString()],
    queryFn: async () => {
      try {
        const response = await api.get<DaycareActivity[]>(\`${endpoint}?date=\${currentDate.toISOString()}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const activities = propData || fetchedData || [];

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const getActivitiesForDateAndHour = (date: Date, hour: number) => {
    return activities.filter((activity: DaycareActivity) => {
      const activityDate = new Date(activity.date);
      const [activityHour] = activity.start_time.split(':').map(Number);
      return (
        activityDate.getFullYear() === date.getFullYear() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getDate() === date.getDate() &&
        activityHour === hour
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const handleActivityClick = (activity: DaycareActivity) => {
    if (onActivityClick) onActivityClick(activity);
    else setSelectedActivity(activity);
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Activity Schedule
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateWeek('prev')}
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
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('week')}
              className={cn(
                'px-3 py-1.5 text-sm',
                view === 'week' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={cn(
                'px-3 py-1.5 text-sm',
                view === 'day' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              Day
            </button>
          </div>
        </div>

        {/* Week View */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-20">
                  Time
                </th>
                {weekDays.map((day, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      'py-3 px-2 text-center text-sm font-medium',
                      isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <div>{WEEKDAYS[day.getDay()]}</div>
                    <div className="text-xs">{day.getMonth() + 1}/{day.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-2 px-2 text-xs text-gray-500 align-top">
                    {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </td>
                  {weekDays.map((day, idx) => {
                    const hourActivities = getActivitiesForDateAndHour(day, hour);
                    return (
                      <td
                        key={idx}
                        className={cn(
                          'py-1 px-1 align-top min-h-[60px]',
                          isToday(day) && 'bg-blue-50/50 dark:bg-blue-900/10'
                        )}
                      >
                        <div className="space-y-1">
                          {hourActivities.map((activity: DaycareActivity) => {
                            const config = activityConfig[activity.type] || activityConfig.individual;
                            const Icon = config.icon;
                            return (
                              <div
                                key={activity.id}
                                onClick={() => handleActivityClick(activity)}
                                className={cn(
                                  'px-2 py-1 text-xs rounded border cursor-pointer',
                                  config.color
                                )}
                              >
                                <div className="flex items-center gap-1 font-medium truncate">
                                  <Icon className="w-3 h-3 flex-shrink-0" />
                                  {activity.title}
                                </div>
                                <div className="text-[10px] opacity-75">
                                  {activity.start_time} - {activity.end_time}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {Object.entries(activityConfig).map(([type, { color }]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={cn('w-4 h-4 rounded border', color.split(' ').slice(0, 2).join(' '))} />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {type.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedActivity(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedActivity.title}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {selectedActivity.type.replace('_', ' ')}
                </p>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{selectedActivity.start_time} - {selectedActivity.end_time}</span>
              </div>
              {selectedActivity.location && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Location: {selectedActivity.location}
                </p>
              )}
              {selectedActivity.staff_assigned && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Staff: {selectedActivity.staff_assigned}
                </p>
              )}
              {selectedActivity.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedActivity.description}
                </p>
              )}
              {selectedActivity.participants && selectedActivity.participants.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Participants ({selectedActivity.participants.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivity.participants.map((pet) => (
                      <span
                        key={pet.id}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                      >
                        {pet.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedActivity(null)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
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
 * Generate CheckinListToday component
 */
export function generateCheckinListToday(options: CheckinListOptions = {}): string {
  const {
    componentName = 'CheckinListToday',
    endpoint = '/daycare/checkins/today',
    queryKey = 'daycare-checkins-today',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Dog,
  Cat,
  Clock,
  User,
  Search,
  LogIn,
  LogOut,
  Check,
  Loader2,
  Phone,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface CheckinEntry {
  id: string;
  pet_id: string;
  pet_name: string;
  pet_type: 'dog' | 'cat' | 'other';
  breed: string;
  avatar_url?: string;
  owner_name: string;
  owner_phone: string;
  scheduled_checkin: string;
  scheduled_checkout: string;
  actual_checkin?: string;
  actual_checkout?: string;
  status: 'expected' | 'checked_in' | 'checked_out' | 'no_show';
  package_type?: string;
  special_notes?: string;
  pickup_authorized?: string[];
}

interface ${componentName}Props {
  className?: string;
  onPetClick?: (entry: CheckinEntry) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, onPetClick }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expected' | 'checked_in' | 'checked_out'>('all');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<CheckinEntry[]>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch checkins:', err);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const checkinMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return api.post(\`${endpoint.replace('/today', '')}/\${entryId}/checkin\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return api.post(\`${endpoint.replace('/today', '')}/\${entryId}/checkout\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const filteredEntries = (entries || []).filter((entry: CheckinEntry) => {
    const matchesSearch =
      entry.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      expected: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      checked_in: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      checked_out: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      no_show: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || colors.expected;
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handlePetClick = (entry: CheckinEntry) => {
    if (onPetClick) onPetClick(entry);
    else navigate(\`/daycare/pets/\${entry.pet_id}\`);
  };

  const stats = {
    expected: (entries || []).filter((e: CheckinEntry) => e.status === 'expected').length,
    checkedIn: (entries || []).filter((e: CheckinEntry) => e.status === 'checked_in').length,
    checkedOut: (entries || []).filter((e: CheckinEntry) => e.status === 'checked_out').length,
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Check-ins
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {stats.expected} expected, {stats.checkedIn} checked in, {stats.checkedOut} checked out
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pets or owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="expected">Expected</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Check-in List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No check-ins found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pet
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEntries.map((entry: CheckinEntry) => {
                  const PetIcon = entry.pet_type === 'dog' ? Dog : Cat;
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => handlePetClick(entry)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt={entry.pet_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <PetIcon className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{entry.pet_name}</p>
                            <p className="text-sm text-gray-500">{entry.breed}</p>
                          </div>
                          {entry.special_notes && (
                            <AlertCircle className="w-4 h-4 text-yellow-500" title="Has special notes" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {entry.owner_name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {entry.owner_phone}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white flex items-center gap-1">
                            <LogIn className="w-3 h-3 text-green-500" />
                            {formatTime(entry.scheduled_checkin)}
                          </p>
                          <p className="text-gray-500 flex items-center gap-1">
                            <LogOut className="w-3 h-3 text-red-500" />
                            {formatTime(entry.scheduled_checkout)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(entry.status))}>
                          {entry.status.replace('_', ' ')}
                        </span>
                        {entry.actual_checkin && entry.status === 'checked_in' && (
                          <p className="text-xs text-gray-500 mt-1">
                            In: {formatTime(entry.actual_checkin)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.package_type || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {entry.status === 'expected' && (
                          <button
                            onClick={() => checkinMutation.mutate(entry.id)}
                            disabled={checkinMutation.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            Check In
                          </button>
                        )}
                        {entry.status === 'checked_in' && (
                          <button
                            onClick={() => checkoutMutation.mutate(entry.id)}
                            disabled={checkoutMutation.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Check Out
                          </button>
                        )}
                        {entry.status === 'checked_out' && (
                          <span className="text-sm text-gray-500">
                            Out: {formatTime(entry.actual_checkout)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate ChildProfile component (Pet profile in daycare context)
 */
export function generateChildProfile(options: ChildProfileOptions = {}): string {
  const {
    componentName = 'ChildProfile',
    endpoint = '/daycare/pets',
  } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Dog,
  Cat,
  Phone,
  Mail,
  User,
  Calendar,
  AlertCircle,
  Heart,
  Star,
  Clock,
  Package,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface DaycarePetData {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight?: number;
  size?: 'small' | 'medium' | 'large';
  color: string;
  gender: 'male' | 'female';
  avatar_url?: string;
  is_neutered?: boolean;
  allergies?: string[];
  medical_notes?: string;
  dietary_requirements?: string;
  temperament?: string;
  socialization_level?: 'great' | 'good' | 'needs_work' | 'prefers_alone';
  play_style?: string;
  favorite_activities?: string[];
  fears_triggers?: string[];
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  emergency_contact?: { name: string; phone: string; relationship: string };
  pickup_authorized?: { name: string; phone: string; relationship: string }[];
  special_instructions?: string;
  membership?: {
    type: string;
    visits_remaining?: number;
    expires_at?: string;
  };
  stats?: {
    total_visits: number;
    current_streak: number;
    favorite_playmate?: string;
    avg_rating?: number;
  };
  recent_visits?: {
    date: string;
    duration: string;
    notes?: string;
    rating?: number;
  }[];
}

interface ${componentName}Props {
  petId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ petId: propPetId, className }) => {
  const { id } = useParams<{ id: string }>();
  const petId = propPetId || id;

  const { data: pet, isLoading } = useQuery({
    queryKey: ['daycare-pet', petId],
    queryFn: async () => {
      const response = await api.get<DaycarePetData>(\`${endpoint}/\${petId}\`);
      return response?.data || response;
    },
    enabled: !!petId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!pet) {
    return <div className="text-center py-12 text-gray-500">Pet not found</div>;
  }

  const PetIcon = pet.type === 'dog' ? Dog : Cat;

  const getSocializationColor = (level?: string) => {
    const colors: Record<string, string> = {
      great: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      needs_work: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      prefers_alone: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[level || 'good'] || colors.good;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pet Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {pet.avatar_url ? (
            <img src={pet.avatar_url} alt={pet.name} className="w-32 h-32 rounded-xl object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <PetIcon className="w-16 h-16 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pet.name}</h1>
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                pet.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
              )}>
                {pet.gender}
              </span>
              {pet.socialization_level && (
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getSocializationColor(pet.socialization_level))}>
                  {pet.socialization_level.replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{pet.breed} - {pet.age} years old</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              {pet.weight && <span>Weight: {pet.weight} lbs</span>}
              {pet.size && <span>Size: {pet.size}</span>}
              <span>Color: {pet.color}</span>
            </div>

            {/* Quick Stats */}
            {pet.stats && (
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{pet.stats.total_visits} visits</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{pet.stats.current_streak} day streak</span>
                </div>
                {pet.stats.avg_rating && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{pet.stats.avg_rating.toFixed(1)} avg rating</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Membership Status */}
          {pet.membership && (
            <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5" />
                <span className="font-medium">{pet.membership.type}</span>
              </div>
              {pet.membership.visits_remaining !== undefined && (
                <p className="text-sm opacity-90">{pet.membership.visits_remaining} visits remaining</p>
              )}
              {pet.membership.expires_at && (
                <p className="text-xs opacity-75 mt-1">
                  Expires: {new Date(pet.membership.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Behavior & Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Behavior & Preferences
          </h2>

          {pet.temperament && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temperament</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{pet.temperament}</p>
            </div>
          )}

          {pet.play_style && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Play Style</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{pet.play_style}</p>
            </div>
          )}

          {pet.favorite_activities && pet.favorite_activities.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favorite Activities</p>
              <div className="flex flex-wrap gap-2">
                {pet.favorite_activities.map((activity, i) => (
                  <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pet.fears_triggers && pet.fears_triggers.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-medium mb-2">
                <AlertCircle className="w-4 h-4" />
                Fears / Triggers
              </div>
              <div className="flex flex-wrap gap-2">
                {pet.fears_triggers.map((trigger, i) => (
                  <span key={i} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded text-xs">
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pet.stats?.favorite_playmate && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Best Buddy</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{pet.stats.favorite_playmate}</p>
            </div>
          )}
        </div>

        {/* Health & Care */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Health & Care
          </h2>

          {pet.allergies && pet.allergies.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
                <AlertCircle className="w-4 h-4" />
                Allergies
              </div>
              <div className="flex flex-wrap gap-2">
                {pet.allergies.map((allergy, i) => (
                  <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-xs">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pet.medical_notes && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Notes</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{pet.medical_notes}</p>
            </div>
          )}

          {pet.dietary_requirements && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dietary Requirements</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{pet.dietary_requirements}</p>
            </div>
          )}

          {pet.special_instructions && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Special Instructions</p>
              <p className="text-sm text-blue-600 dark:text-blue-300">{pet.special_instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Owner & Contacts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Owner
          </h2>
          <div className="space-y-3">
            <p className="font-medium text-gray-900 dark:text-white">{pet.owner.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              {pet.owner.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              {pet.owner.phone}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Authorized Pickup</h2>
          {pet.pickup_authorized && pet.pickup_authorized.length > 0 ? (
            <div className="space-y-3">
              {pet.pickup_authorized.map((person, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.relationship}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{person.phone}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Only owner is authorized for pickup</p>
          )}
        </div>
      </div>

      {/* Recent Visits */}
      {pet.recent_visits && pet.recent_visits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Recent Visits
          </h2>
          <div className="space-y-3">
            {pet.recent_visits.map((visit, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {new Date(visit.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">{visit.duration}</p>
                  </div>
                  {visit.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{visit.notes}</p>
                  )}
                </div>
                {visit.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{visit.rating}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
