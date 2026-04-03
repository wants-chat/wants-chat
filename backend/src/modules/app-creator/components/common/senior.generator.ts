/**
 * Senior Care Generator
 *
 * Generates senior care/elderly management components:
 * - SeniorStats: Dashboard stats for senior care metrics
 * - ActivityCalendarSenior: Calendar showing senior activities
 * - ActivityListTodaySenior: Today's activities for seniors
 */

import { pascalCase } from 'change-case';

export interface SeniorStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showMedication?: boolean;
  showActivities?: boolean;
  showHealth?: boolean;
}

export interface ActivityCalendarSeniorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showCategories?: boolean;
  showReminders?: boolean;
}

export interface ActivityListTodaySeniorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showStatus?: boolean;
  showParticipants?: boolean;
  showNotes?: boolean;
}

/**
 * Generate a SeniorStats component
 */
export function generateSeniorStats(options: SeniorStatsOptions = {}): string {
  const {
    componentName = 'SeniorStats',
    endpoint = '/seniors/stats',
    queryKey = 'senior-stats',
    showMedication = true,
    showActivities = true,
    showHealth = true,
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Activity,
  Pill,
  Heart,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  seniorId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  seniorId,
}) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}', seniorId],
    queryFn: async () => {
      try {
        const url = seniorId ? \`${endpoint}?seniorId=\${seniorId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
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
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Residents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            {stats?.residentsChange !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                stats.residentsChange >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {stats.residentsChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(stats.residentsChange)}%
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats?.totalResidents ?? '-'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Residents
          </div>
        </div>

        ${showActivities ? `{/* Today's Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            {stats?.activitiesCompleted !== undefined && stats?.totalActivities && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stats.activitiesCompleted}/{stats.totalActivities}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats?.todayActivities ?? '-'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Today's Activities
          </div>
          {stats?.totalActivities > 0 && (
            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: \`\${(stats.activitiesCompleted / stats.totalActivities) * 100}%\` }}
              />
            </div>
          )}
        </div>` : ''}

        ${showMedication ? `{/* Medication Reminders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Pill className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            {stats?.pendingMedications > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                {stats.pendingMedications} pending
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats?.medicationsGiven ?? '-'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Medications Given Today
          </div>
        </div>` : ''}

        ${showHealth ? `{/* Health Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              'p-3 rounded-lg',
              stats?.healthAlerts > 0
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-green-100 dark:bg-green-900/30'
            )}>
              {stats?.healthAlerts > 0 ? (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : (
                <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats?.healthAlerts ?? 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Health Alerts
          </div>
        </div>` : ''}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Doctor Visits</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.upcomingDoctorVisits ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Family Visits</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.upcomingFamilyVisits ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Therapy Sessions</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.upcomingTherapy ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Care Tasks Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Care Tasks</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              <span className="text-sm font-medium text-green-600">{stats?.tasksCompleted ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
              <span className="text-sm font-medium text-yellow-600">{stats?.tasksInProgress ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              <span className="text-sm font-medium text-gray-600">{stats?.tasksPending ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Staff On Duty */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Staff On Duty</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Nurses</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.nursesOnDuty ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Caregivers</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.caregiversOnDuty ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Support Staff</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.supportStaffOnDuty ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate an ActivityCalendarSenior component
 */
export function generateActivityCalendarSenior(options: ActivityCalendarSeniorOptions = {}): string {
  const {
    componentName = 'ActivityCalendarSenior',
    endpoint = '/seniors/activities',
    queryKey = 'senior-activities',
    showCategories = true,
    showReminders = true,
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Activity,
  Music,
  Utensils,
  Heart,
  Users,
  Brain,
  Loader2,
  X,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface SeniorActivity {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  category: string;
  location?: string;
  participants?: number;
  maxParticipants?: number;
  description?: string;
  reminder?: boolean;
}

interface ${componentName}Props {
  activities?: SeniorActivity[];
  seniorId?: string;
  className?: string;
  onActivityClick?: (activity: SeniorActivity) => void;
  onAddActivity?: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORIES = [
  { key: 'all', label: 'All Activities', icon: Activity, color: 'blue' },
  { key: 'exercise', label: 'Exercise', icon: Heart, color: 'red' },
  { key: 'social', label: 'Social', icon: Users, color: 'green' },
  { key: 'music', label: 'Music & Arts', icon: Music, color: 'purple' },
  { key: 'dining', label: 'Dining', icon: Utensils, color: 'orange' },
  { key: 'cognitive', label: 'Cognitive', icon: Brain, color: 'indigo' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  activities: propActivities,
  seniorId,
  className,
  onActivityClick,
  onAddActivity,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<SeniorActivity | null>(null);

  // Fetch activities
  const { data: fetchedActivities = [], isLoading } = useQuery({
    queryKey: ['${queryKey}', seniorId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (seniorId) params.append('seniorId', seniorId);
        params.append('month', String(currentDate.getMonth() + 1));
        params.append('year', String(currentDate.getFullYear()));
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        return [];
      }
    },
    enabled: !propActivities || propActivities.length === 0,
  });

  const activities = propActivities && propActivities.length > 0 ? propActivities : fetchedActivities;

  // Filter by category
  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'all') return activities;
    return activities.filter((a: SeniorActivity) => a.category === selectedCategory);
  }, [activities, selectedCategory]);

  // Generate calendar days
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

  // Get activities for a specific date
  const getActivitiesForDate = (date: Date) => {
    return filteredActivities.filter((activity: SeniorActivity) => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getFullYear() === date.getFullYear() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getDate() === date.getDate()
      );
    });
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.key === category);
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
      orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    };
    return colors[cat?.color || 'blue'];
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.key === category);
    return cat?.icon || Activity;
  };

  const navigatePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const handleActivityClick = (activity: SeniorActivity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else {
      setSelectedActivity(activity);
    }
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={navigatePrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goToToday} className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Today
              </button>
              <button onClick={navigateNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          {onAddActivity && (
            <button
              onClick={() => onAddActivity(new Date())}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          )}
        </div>

        ${showCategories ? `{/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-colors',
                  selectedCategory === cat.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>` : ''}

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {WEEKDAYS.map(day => (
              <div key={day} className="py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayActivities = getActivitiesForDate(day.date);
              return (
                <div
                  key={idx}
                  onClick={() => onAddActivity && onAddActivity(day.date)}
                  className={cn(
                    'min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 transition-colors',
                    !day.isCurrentMonth && 'bg-gray-50 dark:bg-gray-800/50',
                    onAddActivity && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50',
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
                    {dayActivities.slice(0, 3).map((activity: SeniorActivity) => {
                      const Icon = getCategoryIcon(activity.category);
                      return (
                        <div
                          key={activity.id}
                          onClick={(e) => { e.stopPropagation(); handleActivityClick(activity); }}
                          className={cn(
                            'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2 flex items-center gap-1',
                            getCategoryColor(activity.category)
                          )}
                        >
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{activity.title}</span>
                          ${showReminders ? `{activity.reminder && <Bell className="w-3 h-3 flex-shrink-0" />}` : ''}
                        </div>
                      );
                    })}
                    {dayActivities.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">+{dayActivities.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedActivity(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {React.createElement(getCategoryIcon(selectedActivity.category), {
                  className: 'w-6 h-6 text-blue-600 dark:text-blue-400'
                })}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedActivity.title}
                </h3>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Date: </span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(selectedActivity.date).toLocaleDateString()}
                </span>
              </div>
              {selectedActivity.time && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Time: </span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedActivity.time}{selectedActivity.endTime ? \` - \${selectedActivity.endTime}\` : ''}
                  </span>
                </div>
              )}
              {selectedActivity.location && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Location: </span>
                  <span className="text-gray-900 dark:text-white">{selectedActivity.location}</span>
                </div>
              )}
              {selectedActivity.participants !== undefined && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Participants: </span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedActivity.participants}{selectedActivity.maxParticipants ? \`/\${selectedActivity.maxParticipants}\` : ''}
                  </span>
                </div>
              )}
              {selectedActivity.description && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Description: </span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedActivity.description}</p>
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
 * Generate an ActivityListTodaySenior component
 */
export function generateActivityListTodaySenior(options: ActivityListTodaySeniorOptions = {}): string {
  const {
    componentName = 'ActivityListTodaySenior',
    endpoint = '/seniors/activities/today',
    queryKey = 'senior-activities-today',
    showStatus = true,
    showParticipants = true,
    showNotes = false,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Circle,
  PlayCircle,
  Music,
  Heart,
  Brain,
  Utensils,
  ChevronRight,
  Loader2,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface TodayActivity {
  id: string;
  title: string;
  time: string;
  endTime?: string;
  category: string;
  location?: string;
  status: 'pending' | 'in_progress' | 'completed';
  participants?: number;
  maxParticipants?: number;
  notes?: string;
  instructor?: string;
}

interface ${componentName}Props {
  activities?: TodayActivity[];
  seniorId?: string;
  className?: string;
  onActivityClick?: (activity: TodayActivity) => void;
  onStatusChange?: (activity: TodayActivity, status: string) => void;
}

const CATEGORY_ICONS: Record<string, React.FC<any>> = {
  exercise: Heart,
  social: Users,
  music: Music,
  dining: Utensils,
  cognitive: Brain,
  default: Activity,
};

const ${componentName}: React.FC<${componentName}Props> = ({
  activities: propActivities,
  seniorId,
  className,
  onActivityClick,
  onStatusChange,
}) => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch today's activities
  const { data: fetchedActivities = [], isLoading } = useQuery({
    queryKey: ['${queryKey}', seniorId],
    queryFn: async () => {
      try {
        const url = seniorId ? \`${endpoint}?seniorId=\${seniorId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        return [];
      }
    },
    enabled: !propActivities || propActivities.length === 0,
  });

  const activities = propActivities && propActivities.length > 0 ? propActivities : fetchedActivities;

  // Update status mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(\`/seniors/activities/\${id}\`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const handleStatusChange = (activity: TodayActivity, newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(activity, newStatus);
    } else {
      updateMutation.mutate({ id: activity.id, status: newStatus });
    }
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatTime = (time: string) => {
    return new Date(\`2000-01-01T\${time}\`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sort activities by time
  const sortedActivities = [...activities].sort((a: TodayActivity, b: TodayActivity) => {
    return a.time.localeCompare(b.time);
  });

  // Group by status
  const groupedActivities = {
    in_progress: sortedActivities.filter((a: TodayActivity) => a.status === 'in_progress'),
    pending: sortedActivities.filter((a: TodayActivity) => a.status === 'pending'),
    completed: sortedActivities.filter((a: TodayActivity) => a.status === 'completed'),
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const renderActivity = (activity: TodayActivity) => {
    const CategoryIcon = getCategoryIcon(activity.category);
    const isExpanded = expandedId === activity.id;

    return (
      <div
        key={activity.id}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div
          onClick={() => onActivityClick ? onActivityClick(activity) : setExpandedId(isExpanded ? null : activity.id)}
          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextStatus = activity.status === 'pending' ? 'in_progress' : activity.status === 'in_progress' ? 'completed' : 'pending';
                handleStatusChange(activity, nextStatus);
              }}
              className="flex-shrink-0 mt-1"
            >
              {getStatusIcon(activity.status)}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 dark:text-white">{activity.title}</span>
                ${showStatus ? `<span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(activity.status))}>
                  {activity.status.replace('_', ' ')}
                </span>` : ''}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(activity.time)}{activity.endTime ? \` - \${formatTime(activity.endTime)}\` : ''}
                </span>
                {activity.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {activity.location}
                  </span>
                )}
                ${showParticipants ? `{activity.participants !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {activity.participants}{activity.maxParticipants ? \`/\${activity.maxParticipants}\` : ''}
                  </span>
                )}` : ''}
              </div>
            </div>

            {/* Category Icon */}
            <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <CategoryIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>

            <ChevronRight className={cn('w-5 h-5 text-gray-400 transition-transform', isExpanded && 'rotate-90')} />
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-3 text-sm">
              {activity.instructor && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Instructor: </span>
                  <span className="text-gray-900 dark:text-white">{activity.instructor}</span>
                </div>
              )}
              ${showNotes ? `{activity.notes && (
                <div className="flex items-start gap-2">
                  <StickyNote className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-gray-600 dark:text-gray-400">{activity.notes}</p>
                </div>
              )}` : ''}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-gray-500 dark:text-gray-400">Update status:</span>
                {['pending', 'in_progress', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(activity, status)}
                    disabled={activity.status === status}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full transition-colors',
                      activity.status === status
                        ? getStatusColor(status)
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                    )}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Activities</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {sortedActivities.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No activities scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* In Progress */}
          {groupedActivities.in_progress.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                In Progress ({groupedActivities.in_progress.length})
              </h3>
              <div className="space-y-3">
                {groupedActivities.in_progress.map(renderActivity)}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {groupedActivities.pending.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Upcoming ({groupedActivities.pending.length})
              </h3>
              <div className="space-y-3">
                {groupedActivities.pending.map(renderActivity)}
              </div>
            </div>
          )}

          {/* Completed */}
          {groupedActivities.completed.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed ({groupedActivities.completed.length})
              </h3>
              <div className="space-y-3">
                {groupedActivities.completed.map(renderActivity)}
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
 * Generate senior stats for specific domain
 */
export function generateDomainSeniorStats(
  domain: string,
  options?: Partial<SeniorStatsOptions>
): string {
  return generateSeniorStats({
    componentName: pascalCase(domain) + 'SeniorStats',
    ...options,
  });
}

/**
 * Generate activity calendar senior for specific domain
 */
export function generateDomainActivityCalendarSenior(
  domain: string,
  options?: Partial<ActivityCalendarSeniorOptions>
): string {
  return generateActivityCalendarSenior({
    componentName: pascalCase(domain) + 'ActivityCalendarSenior',
    ...options,
  });
}

/**
 * Generate activity list today senior for specific domain
 */
export function generateDomainActivityListTodaySenior(
  domain: string,
  options?: Partial<ActivityListTodaySeniorOptions>
): string {
  return generateActivityListTodaySenior({
    componentName: pascalCase(domain) + 'ActivityListTodaySenior',
    ...options,
  });
}
