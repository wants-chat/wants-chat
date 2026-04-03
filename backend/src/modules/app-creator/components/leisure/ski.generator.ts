/**
 * Ski Resort Component Generators
 *
 * Generates ski resort-specific components including:
 * - SkiResortStats: Key resort statistics and conditions
 * - LessonCalendarSki: Ski/snowboard lessons scheduling calendar
 * - TrailStatusOverview: Trail conditions and status overview
 */

export interface SkiResortStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface LessonCalendarSkiOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface TrailStatusOverviewOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate Ski Resort Stats component
 */
export function generateSkiResortStats(options: SkiResortStatsOptions = {}): string {
  const {
    componentName = 'SkiResortStats',
    endpoint = '/ski/resort/stats',
    queryKey = 'ski-resort-stats',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Mountain,
  Snowflake,
  Wind,
  Thermometer,
  Sunrise,
  Sunset,
  CloudSnow,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  resortId?: string;
}

interface ResortStats {
  resort_name?: string;
  last_updated?: string;
  weather?: {
    temperature?: number;
    wind_speed?: number;
    wind_direction?: string;
    conditions?: string;
    visibility?: string;
    snow_last_24h?: number;
    snow_last_48h?: number;
    snow_last_7d?: number;
    base_depth?: number;
    summit_depth?: number;
  };
  lifts?: {
    total?: number;
    open?: number;
    scheduled?: number;
    on_hold?: number;
    closed?: number;
  };
  trails?: {
    total?: number;
    open?: number;
    groomed?: number;
    beginner?: { open: number; total: number };
    intermediate?: { open: number; total: number };
    advanced?: { open: number; total: number };
    expert?: { open: number; total: number };
  };
  terrain_parks?: {
    total?: number;
    open?: number;
  };
  hours?: {
    opens?: string;
    closes?: string;
    night_skiing?: boolean;
    night_closes?: string;
  };
  avalanche_danger?: 'low' | 'moderate' | 'considerable' | 'high' | 'extreme';
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, resortId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}', resortId],
    queryFn: async () => {
      try {
        const url = resortId ? \`${endpoint}?resortId=\${resortId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return (response?.data || response || {}) as ResortStats;
      } catch (err) {
        console.error('Failed to fetch resort stats:', err);
        return {} as ResortStats;
      }
    },
  });

  const getAvalancheDangerColor = (danger?: string) => {
    switch (danger) {
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'considerable':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'extreme':
        return 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const liftsOpenPercent = stats?.lifts?.total
    ? Math.round(((stats.lifts.open || 0) / stats.lifts.total) * 100)
    : 0;
  const trailsOpenPercent = stats?.trails?.total
    ? Math.round(((stats.trails.open || 0) / stats.trails.total) * 100)
    : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mountain className="w-7 h-7 text-blue-600" />
            {stats?.resort_name || 'Resort Conditions'}
          </h2>
          {stats?.last_updated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(stats.last_updated).toLocaleString()}
            </p>
          )}
        </div>

        {stats?.avalanche_danger && (
          <div
            className={cn(
              'px-4 py-2 rounded-lg flex items-center gap-2',
              getAvalancheDangerColor(stats.avalanche_danger)
            )}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium capitalize">
              Avalanche: {stats.avalanche_danger}
            </span>
          </div>
        )}
      </div>

      {/* Weather Conditions */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-900 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CloudSnow className="w-5 h-5" />
          Current Conditions
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Thermometer className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-3xl font-bold">
                {stats?.weather?.temperature ?? '--'}°F
              </p>
              <p className="text-sm opacity-80">Temperature</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Wind className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-3xl font-bold">
                {stats?.weather?.wind_speed ?? '--'} mph
              </p>
              <p className="text-sm opacity-80">
                Wind {stats?.weather?.wind_direction || ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Snowflake className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-3xl font-bold">
                {stats?.weather?.snow_last_24h ?? '--}"
              </p>
              <p className="text-sm opacity-80">New Snow (24h)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mountain className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-3xl font-bold">
                {stats?.weather?.base_depth ?? '--}"
              </p>
              <p className="text-sm opacity-80">Base Depth</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="opacity-80">48hr Snow:</span>{' '}
            <span className="font-semibold">{stats?.weather?.snow_last_48h ?? '--}"</span>
          </div>
          <div>
            <span className="opacity-80">7-day Snow:</span>{' '}
            <span className="font-semibold">{stats?.weather?.snow_last_7d ?? '--}"</span>
          </div>
          <div>
            <span className="opacity-80">Summit Depth:</span>{' '}
            <span className="font-semibold">{stats?.weather?.summit_depth ?? '--}"</span>
          </div>
        </div>
      </div>

      {/* Lifts and Trails */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Lifts Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Lift Status
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={\`\${liftsOpenPercent * 2.51} 251\`}
                  className="text-green-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {liftsOpenPercent}%
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Open</span>
                <span className="font-semibold text-green-600">
                  {stats?.lifts?.open || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Scheduled</span>
                <span className="font-semibold text-blue-600">
                  {stats?.lifts?.scheduled || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">On Hold</span>
                <span className="font-semibold text-yellow-600">
                  {stats?.lifts?.on_hold || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Closed</span>
                <span className="font-semibold text-gray-500">
                  {stats?.lifts?.closed || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {stats?.lifts?.open || 0} of {stats?.lifts?.total || 0} lifts operating
          </div>
        </div>

        {/* Trails Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Trail Status
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={\`\${trailsOpenPercent * 2.51} 251\`}
                  className="text-blue-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {trailsOpenPercent}%
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Beginner</span>
                </div>
                <span className="font-semibold">
                  {stats?.trails?.beginner?.open || 0}/{stats?.trails?.beginner?.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Intermediate</span>
                </div>
                <span className="font-semibold">
                  {stats?.trails?.intermediate?.open || 0}/{stats?.trails?.intermediate?.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-900 dark:bg-gray-300" />
                  <span className="text-gray-600 dark:text-gray-400">Advanced</span>
                </div>
                <span className="font-semibold">
                  {stats?.trails?.advanced?.open || 0}/{stats?.trails?.advanced?.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-400">Expert</span>
                </div>
                <span className="font-semibold">
                  {stats?.trails?.expert?.open || 0}/{stats?.trails?.expert?.total || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>
              {stats?.trails?.open || 0} of {stats?.trails?.total || 0} trails open
            </span>
            <span>{stats?.trails?.groomed || 0} groomed</span>
          </div>
        </div>
      </div>

      {/* Operating Hours & Terrain Parks */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Operating Hours
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Sunrise className="w-5 h-5 text-yellow-500" />
                <span>Opens</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.hours?.opens || '--'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Sunset className="w-5 h-5 text-orange-500" />
                <span>Closes</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.hours?.closes || '--'}
              </span>
            </div>

            {stats?.hours?.night_skiing && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Snowflake className="w-5 h-5 text-blue-400" />
                    <span>Night Skiing</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Until {stats.hours.night_closes || '--'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Terrain Parks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Terrain Parks
          </h3>

          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {stats?.terrain_parks?.open || 0}
              <span className="text-lg text-gray-500">
                /{stats?.terrain_parks?.total || 0}
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              terrain parks open
            </div>
          </div>

          {stats?.terrain_parks?.open && stats.terrain_parks.open > 0 && (
            <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Parks are open for session</span>
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

/**
 * Generate Ski Lesson Calendar component
 */
export function generateLessonCalendarSki(options: LessonCalendarSkiOptions = {}): string {
  const {
    componentName = 'LessonCalendarSki',
    endpoint = '/ski/lessons',
    queryKey = 'ski-lessons',
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Loader2,
  X,
  Calendar,
  DollarSign,
  Users,
  Snowflake,
  Mountain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  instructorId?: string;
  resortId?: string;
}

interface SkiLesson {
  id: string;
  title: string;
  instructor_name: string;
  instructor_id?: string;
  instructor_avatar?: string;
  instructor_certifications?: string[];
  date: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  meeting_location?: string;
  lesson_type?: 'private' | 'group' | 'semi-private';
  sport?: 'ski' | 'snowboard' | 'both';
  skill_level?: 'first-timer' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  age_group?: 'kids' | 'teens' | 'adults' | 'all';
  specialty?: string;
  max_students?: number;
  current_students?: number;
  price?: number;
  status?: 'available' | 'booked' | 'waitlist' | 'cancelled';
  description?: string;
  equipment_included?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({ className, instructorId, resortId }) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<SkiLesson | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.getMonth(), currentDate.getFullYear(), instructorId, resortId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        if (instructorId) params.append('instructorId', instructorId);
        if (resortId) params.append('resortId', resortId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as SkiLesson[];
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
        return [];
      }
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return api.post('/ski/lessons/book', { lesson_id: lessonId });
    },
    onSuccess: () => {
      toast.success('Lesson booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
      setShowBookingModal(false);
      setSelectedLesson(null);
    },
    onError: () => {
      toast.error('Failed to book lesson');
    },
  });

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    return lessons.filter((lesson) => {
      if (filterSport !== 'all' && lesson.sport !== filterSport) return false;
      if (filterLevel !== 'all' && lesson.skill_level !== filterLevel) return false;
      return true;
    });
  }, [lessons, filterSport, filterLevel]);

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

  const getLessonsForDate = (date: Date) => {
    return filteredLessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return (
        lessonDate.getFullYear() === date.getFullYear() &&
        lessonDate.getMonth() === date.getMonth() &&
        lessonDate.getDate() === date.getDate()
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

  const navigatePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const getSportColor = (sport?: string) => {
    switch (sport) {
      case 'ski':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'snowboard':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      case 'both':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200';
    }
  };

  const getLevelBadgeColor = (level?: string) => {
    switch (level) {
      case 'first-timer':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced':
        return 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900';
      case 'expert':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLessonTypeBadge = (type?: string) => {
    switch (type) {
      case 'private':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'group':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'semi-private':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      default:
        return 'bg-gray-100 text-gray-700';
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Snowflake className="w-6 h-6 text-blue-500" />
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={navigatePrev}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={navigateNext}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="all">All Sports</option>
              <option value="ski">Ski</option>
              <option value="snowboard">Snowboard</option>
              <option value="both">Both</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="all">All Levels</option>
              <option value="first-timer">First Timer</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Ski</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Snowboard</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-teal-500" />
            <span className="text-gray-600 dark:text-gray-400">Both</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayLessons = getLessonsForDate(day.date);
              const availableCount = dayLessons.filter((l) => l.status === 'available').length;

              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700',
                    !day.isCurrentMonth && 'bg-gray-50 dark:bg-gray-800/50',
                    idx % 7 === 6 && 'border-r-0'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                      isToday(day.date) && 'bg-blue-600 text-white',
                      !isToday(day.date) && !day.isCurrentMonth && 'text-gray-400'
                    )}
                  >
                    {day.date.getDate()}
                  </div>

                  {availableCount > 0 && day.isCurrentMonth && (
                    <div className="text-xs text-green-600 dark:text-green-400 mb-1">
                      {availableCount} available
                    </div>
                  )}

                  <div className="space-y-1">
                    {dayLessons.slice(0, 3).map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          setSelectedLesson(lesson);
                          if (lesson.status === 'available') {
                            setShowBookingModal(true);
                          }
                        }}
                        className={cn(
                          'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2',
                          getSportColor(lesson.sport)
                        )}
                      >
                        {lesson.start_time} {lesson.sport}
                      </div>
                    ))}
                    {dayLessons.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">
                        +{dayLessons.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Book Ski Lesson
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selectedLesson.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {selectedLesson.sport && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full capitalize',
                        getSportColor(selectedLesson.sport)
                      )}
                    >
                      {selectedLesson.sport}
                    </span>
                  )}
                  {selectedLesson.lesson_type && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full capitalize',
                        getLessonTypeBadge(selectedLesson.lesson_type)
                      )}
                    >
                      {selectedLesson.lesson_type}
                    </span>
                  )}
                  {selectedLesson.skill_level && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full capitalize',
                        getLevelBadgeColor(selectedLesson.skill_level)
                      )}
                    >
                      {selectedLesson.skill_level}
                    </span>
                  )}
                  {selectedLesson.age_group && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                      {selectedLesson.age_group}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <User className="w-5 h-5" />
                <div className="flex items-center gap-2">
                  {selectedLesson.instructor_avatar && (
                    <img
                      src={selectedLesson.instructor_avatar}
                      alt={selectedLesson.instructor_name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{selectedLesson.instructor_name}</span>
                </div>
              </div>

              {selectedLesson.instructor_certifications && selectedLesson.instructor_certifications.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedLesson.instructor_certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>{new Date(selectedLesson.date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5" />
                <span>
                  {selectedLesson.start_time}
                  {selectedLesson.end_time && \` - \${selectedLesson.end_time}\`}
                  {selectedLesson.duration && \` (\${selectedLesson.duration} hrs)\`}
                </span>
              </div>

              {selectedLesson.meeting_location && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>Meet at: {selectedLesson.meeting_location}</span>
                </div>
              )}

              {selectedLesson.lesson_type !== 'private' && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Users className="w-5 h-5" />
                  <span>
                    {selectedLesson.current_students || 0} / {selectedLesson.max_students || 6} students
                  </span>
                </div>
              )}

              {selectedLesson.specialty && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Mountain className="w-5 h-5" />
                  <span>Focus: {selectedLesson.specialty}</span>
                </div>
              )}

              {selectedLesson.equipment_included && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                  <Snowflake className="w-4 h-4" />
                  <span>Equipment included</span>
                </div>
              )}

              {selectedLesson.price && (
                <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
                  <DollarSign className="w-5 h-5" />
                  <span>\${selectedLesson.price}</span>
                  {selectedLesson.lesson_type === 'group' && (
                    <span className="text-sm font-normal text-gray-500">per person</span>
                  )}
                </div>
              )}

              {selectedLesson.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedLesson.description}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => bookMutation.mutate(selectedLesson.id)}
                disabled={bookMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Book Lesson'
                )}
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
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
 * Generate Trail Status Overview component
 */
export function generateTrailStatusOverview(options: TrailStatusOverviewOptions = {}): string {
  const {
    componentName = 'TrailStatusOverview',
    endpoint = '/ski/trails',
    queryKey = 'ski-trails',
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Mountain,
  Snowflake,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  resortId?: string;
}

interface Trail {
  id: string;
  name: string;
  difficulty: 'green' | 'blue' | 'black' | 'double-black' | 'terrain-park';
  status: 'open' | 'closed' | 'grooming' | 'on-hold';
  groomed?: boolean;
  snowmaking?: boolean;
  conditions?: string;
  last_groomed?: string;
  vertical_drop?: number;
  length?: number;
  exposure?: string;
  features?: string[];
  lifts?: string[];
  area?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, resortId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGroomed, setFilterGroomed] = useState<string>('all');

  const { data: trails, isLoading } = useQuery({
    queryKey: ['${queryKey}', resortId],
    queryFn: async () => {
      try {
        const url = resortId ? \`${endpoint}?resortId=\${resortId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return (Array.isArray(response) ? response : (response?.data || [])) as Trail[];
      } catch (err) {
        console.error('Failed to fetch trails:', err);
        return [];
      }
    },
  });

  const filteredTrails = useMemo(() => {
    if (!trails) return [];
    return trails.filter((trail) => {
      if (searchQuery && !trail.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterDifficulty !== 'all' && trail.difficulty !== filterDifficulty) {
        return false;
      }
      if (filterStatus !== 'all' && trail.status !== filterStatus) {
        return false;
      }
      if (filterGroomed === 'groomed' && !trail.groomed) {
        return false;
      }
      if (filterGroomed === 'ungroomed' && trail.groomed) {
        return false;
      }
      return true;
    });
  }, [trails, searchQuery, filterDifficulty, filterStatus, filterGroomed]);

  const groupedTrails = useMemo(() => {
    const groups: Record<string, Trail[]> = {};
    filteredTrails.forEach((trail) => {
      const area = trail.area || 'Main Mountain';
      if (!groups[area]) groups[area] = [];
      groups[area].push(trail);
    });
    return groups;
  }, [filteredTrails]);

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'green':
        return <div className="w-4 h-4 rounded-full bg-green-500" />;
      case 'blue':
        return <div className="w-4 h-4 rounded bg-blue-500 transform rotate-45" />;
      case 'black':
        return <div className="w-4 h-4 bg-black dark:bg-white transform rotate-45" />;
      case 'double-black':
        return (
          <div className="flex gap-0.5">
            <div className="w-3 h-3 bg-black dark:bg-white transform rotate-45" />
            <div className="w-3 h-3 bg-black dark:bg-white transform rotate-45" />
          </div>
        );
      case 'terrain-park':
        return (
          <div className="w-4 h-4 border-2 border-orange-500 rounded flex items-center justify-center">
            <span className="text-[8px] font-bold text-orange-500">TP</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Open
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
            <XCircle className="w-3 h-3" />
            Closed
          </span>
        );
      case 'grooming':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
            <Clock className="w-3 h-3" />
            Grooming
          </span>
        );
      case 'on-hold':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            On Hold
          </span>
        );
      default:
        return null;
    }
  };

  const stats = useMemo(() => {
    if (!trails) return { open: 0, total: 0, groomed: 0 };
    return {
      open: trails.filter((t) => t.status === 'open').length,
      total: trails.length,
      groomed: trails.filter((t) => t.groomed).length,
    };
  }, [trails]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mountain className="w-7 h-7 text-blue-600" />
            Trail Status
          </h2>
          <p className="text-gray-500 mt-1">
            {stats.open} of {stats.total} trails open | {stats.groomed} groomed
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {trails?.filter((t) => t.difficulty === 'green' && t.status === 'open').length || 0} Beginner
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-3 h-3 rounded bg-blue-500 transform rotate-45" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {trails?.filter((t) => t.difficulty === 'blue' && t.status === 'open').length || 0} Intermediate
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="w-3 h-3 bg-black dark:bg-white transform rotate-45" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {trails?.filter((t) => (t.difficulty === 'black' || t.difficulty === 'double-black') && t.status === 'open').length || 0} Expert
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="all">All Difficulties</option>
              <option value="green">Beginner (Green)</option>
              <option value="blue">Intermediate (Blue)</option>
              <option value="black">Advanced (Black)</option>
              <option value="double-black">Expert (Double Black)</option>
              <option value="terrain-park">Terrain Park</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="grooming">Grooming</option>
              <option value="on-hold">On Hold</option>
            </select>

            <select
              value={filterGroomed}
              onChange={(e) => setFilterGroomed(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="all">All Conditions</option>
              <option value="groomed">Groomed Only</option>
              <option value="ungroomed">Ungroomed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trail List by Area */}
      <div className="space-y-6">
        {Object.entries(groupedTrails).map(([area, areaTrails]) => (
          <div
            key={area}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {area}
                <span className="text-sm font-normal text-gray-500">
                  ({areaTrails.filter((t) => t.status === 'open').length}/{areaTrails.length} open)
                </span>
              </h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {areaTrails.map((trail) => (
                <Link
                  key={trail.id}
                  to={\`/ski/trails/\${trail.id}\`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">
                      {getDifficultyIcon(trail.difficulty)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {trail.name}
                        </h4>
                        {getStatusBadge(trail.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        {trail.groomed && (
                          <span className="flex items-center gap-1">
                            <Snowflake className="w-3 h-3 text-blue-500" />
                            Groomed
                          </span>
                        )}
                        {trail.snowmaking && (
                          <span className="flex items-center gap-1">
                            <Snowflake className="w-3 h-3 text-cyan-500" />
                            Snowmaking
                          </span>
                        )}
                        {trail.conditions && (
                          <span>{trail.conditions}</span>
                        )}
                        {trail.vertical_drop && (
                          <span>{trail.vertical_drop}' vertical</span>
                        )}
                      </div>

                      {trail.features && trail.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {trail.features.slice(0, 3).map((feature, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {trail.features.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-500">
                              +{trail.features.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filteredTrails.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No trails match your filters
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Trail Difficulty Legend</h4>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Beginner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 transform rotate-45" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Intermediate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black dark:bg-white transform rotate-45" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Advanced</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-3 h-3 bg-black dark:bg-white transform rotate-45" />
              <div className="w-3 h-3 bg-black dark:bg-white transform rotate-45" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Expert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-500 rounded flex items-center justify-center">
              <span className="text-[8px] font-bold text-orange-500">TP</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Terrain Park</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
