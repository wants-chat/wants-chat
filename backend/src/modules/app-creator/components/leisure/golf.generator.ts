/**
 * Golf Component Generators
 *
 * Generates golf-specific components including:
 * - GolfStats: Key performance metrics and statistics
 * - TeeTimeCalendar: Calendar view for tee time scheduling
 * - TeeTimeListToday: Today's tee time schedule list
 * - MemberProfileGolf: Member profile with golf-specific data
 * - TournamentListUpcoming: Upcoming tournaments list
 * - LessonCalendarGolf: Golf lessons scheduling calendar
 */

export interface GolfStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface TeeTimeCalendarOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface TeeTimeListOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface MemberProfileGolfOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface TournamentListOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface LessonCalendarGolfOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate Golf Stats component
 */
export function generateGolfStats(options: GolfStatsOptions = {}): string {
  const {
    componentName = 'GolfStats',
    endpoint = '/golf/stats',
    queryKey = 'golf-stats',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Target,
  TrendingUp,
  Award,
  MapPin,
  Flag,
  Loader2,
  TrendingDown,
  Users,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  memberId?: string;
}

interface GolfStatsData {
  handicap?: number;
  handicapChange?: number;
  roundsPlayed?: number;
  roundsPlayedChange?: number;
  averageScore?: number;
  averageScoreChange?: number;
  bestScore?: number;
  fairwayHitPercent?: number;
  greensInRegulationPercent?: number;
  puttsPerRound?: number;
  birdies?: number;
  pars?: number;
  eagles?: number;
  coursesPlayed?: number;
  tournamentsWon?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, memberId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}', memberId],
    queryFn: async () => {
      try {
        const url = memberId ? \`${endpoint}?memberId=\${memberId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return (response?.data || response || {}) as GolfStatsData;
      } catch (err) {
        console.error('Failed to fetch golf stats:', err);
        return {} as GolfStatsData;
      }
    },
  });

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

  const statCards = [
    {
      key: 'handicap',
      label: 'Handicap Index',
      value: stats?.handicap ?? '-',
      change: stats?.handicapChange,
      icon: Target,
      color: 'green',
      inverseChange: true,
    },
    {
      key: 'roundsPlayed',
      label: 'Rounds Played',
      value: stats?.roundsPlayed ?? 0,
      change: stats?.roundsPlayedChange,
      icon: Flag,
      color: 'blue',
    },
    {
      key: 'averageScore',
      label: 'Average Score',
      value: stats?.averageScore ?? '-',
      change: stats?.averageScoreChange,
      icon: TrendingUp,
      color: 'purple',
      inverseChange: true,
    },
    {
      key: 'bestScore',
      label: 'Best Score',
      value: stats?.bestScore ?? '-',
      icon: Award,
      color: 'yellow',
    },
    {
      key: 'fairwayHit',
      label: 'Fairways Hit',
      value: stats?.fairwayHitPercent ? \`\${stats.fairwayHitPercent}%\` : '-',
      icon: MapPin,
      color: 'emerald',
    },
    {
      key: 'gir',
      label: 'Greens in Regulation',
      value: stats?.greensInRegulationPercent ? \`\${stats.greensInRegulationPercent}%\` : '-',
      icon: Target,
      color: 'teal',
    },
    {
      key: 'putts',
      label: 'Putts per Round',
      value: stats?.puttsPerRound ?? '-',
      icon: Flag,
      color: 'indigo',
    },
    {
      key: 'birdies',
      label: 'Total Birdies',
      value: stats?.birdies ?? 0,
      icon: Award,
      color: 'orange',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    teal: {
      bg: 'bg-teal-100 dark:bg-teal-900/30',
      icon: 'text-teal-600 dark:text-teal-400',
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      icon: 'text-indigo-600 dark:text-indigo-400',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      icon: 'text-orange-600 dark:text-orange-400',
    },
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Golf Statistics</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>This Season</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color] || colorClasses.blue;
          const showChange = stat.change !== undefined && stat.change !== null;
          const isPositive = stat.inverseChange ? stat.change! < 0 : stat.change! > 0;

          return (
            <div
              key={stat.key}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-lg', colors.bg)}>
                  <Icon className={cn('w-6 h-6', colors.icon)} />
                </div>
                {showChange && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stat.change!)}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.coursesPlayed ?? 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Courses Played</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.tournamentsWon ?? 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tournaments Won</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.eagles ?? 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Eagles</div>
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
 * Generate Tee Time Calendar component
 */
export function generateTeeTimeCalendar(options: TeeTimeCalendarOptions = {}): string {
  const {
    componentName = 'TeeTimeCalendar',
    endpoint = '/golf/tee-times',
    queryKey = 'golf-tee-times',
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  MapPin,
  Loader2,
  X,
  Calendar,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  courseId?: string;
}

interface TeeTime {
  id: string;
  time: string;
  date: string;
  course_name?: string;
  course_id?: string;
  holes?: number;
  players?: number;
  max_players?: number;
  status?: 'available' | 'booked' | 'pending';
  price?: number;
  member_names?: string[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({ className, courseId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: teeTimes, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.getMonth(), currentDate.getFullYear(), courseId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        if (courseId) params.append('courseId', courseId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as TeeTime[];
      } catch (err) {
        console.error('Failed to fetch tee times:', err);
        return [];
      }
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (teeTimeId: string) => {
      return api.post('/golf/bookings', { tee_time_id: teeTimeId });
    },
    onSuccess: () => {
      toast.success('Tee time booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
      setShowBookingModal(false);
      setSelectedTeeTime(null);
    },
    onError: () => {
      toast.error('Failed to book tee time');
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

  const getTeeTimesForDate = (date: Date) => {
    if (!teeTimes) return [];
    return teeTimes.filter((tt) => {
      const teeDate = new Date(tt.date);
      return (
        teeDate.getFullYear() === date.getFullYear() &&
        teeDate.getMonth() === date.getMonth() &&
        teeDate.getDate() === date.getDate()
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'booked':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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

          <button
            onClick={() => navigate('/golf/tee-times/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Book Tee Time
          </button>
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
              const dayTeeTimes = getTeeTimesForDate(day.date);
              const availableCount = dayTeeTimes.filter((t) => t.status === 'available').length;

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
                      isToday(day.date) && 'bg-green-600 text-white',
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
                    {dayTeeTimes.slice(0, 3).map((teeTime) => (
                      <div
                        key={teeTime.id}
                        onClick={() => {
                          setSelectedTeeTime(teeTime);
                          if (teeTime.status === 'available') {
                            setShowBookingModal(true);
                          }
                        }}
                        className={cn(
                          'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2',
                          getStatusColor(teeTime.status)
                        )}
                      >
                        {teeTime.time} - {teeTime.holes || 18}H
                      </div>
                    ))}
                    {dayTeeTimes.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">
                        +{dayTeeTimes.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Pending</span>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTeeTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Book Tee Time
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>{new Date(selectedTeeTime.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5" />
                <span>{selectedTeeTime.time}</span>
              </div>
              {selectedTeeTime.course_name && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>{selectedTeeTime.course_name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Flag className="w-5 h-5" />
                <span>{selectedTeeTime.holes || 18} Holes</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5" />
                <span>
                  {selectedTeeTime.players || 0} / {selectedTeeTime.max_players || 4} Players
                </span>
              </div>
              {selectedTeeTime.price && (
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  \${selectedTeeTime.price} per player
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => bookMutation.mutate(selectedTeeTime.id)}
                disabled={bookMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Confirm Booking'
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
 * Generate Tee Time List Today component
 */
export function generateTeeTimeListToday(options: TeeTimeListOptions = {}): string {
  const {
    componentName = 'TeeTimeListToday',
    endpoint = '/golf/tee-times/today',
    queryKey = 'golf-tee-times-today',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Clock,
  Users,
  MapPin,
  Flag,
  Loader2,
  ChevronRight,
  Sun,
  Cloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  courseId?: string;
  limit?: number;
}

interface TeeTime {
  id: string;
  time: string;
  date: string;
  course_name?: string;
  course_id?: string;
  holes?: number;
  players?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    handicap?: number;
  }>;
  max_players?: number;
  status?: 'available' | 'booked' | 'in_progress' | 'completed';
  weather?: {
    temp?: number;
    condition?: string;
  };
  starting_hole?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, courseId, limit = 10 }) => {
  const { data: teeTimes, isLoading } = useQuery({
    queryKey: ['${queryKey}', courseId, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (courseId) params.append('courseId', courseId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as TeeTime[];
      } catch (err) {
        console.error('Failed to fetch today tee times:', err);
        return [];
      }
    },
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            Available
          </span>
        );
      case 'booked':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            Booked
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Tee Times</h2>
        <Link
          to="/golf/tee-times"
          className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {teeTimes && teeTimes.length > 0 ? (
          teeTimes.map((teeTime) => (
            <Link
              key={teeTime.id}
              to={\`/golf/tee-times/\${teeTime.id}\`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {teeTime.time}
                  </p>
                  <p className="text-xs text-gray-500">
                    Hole {teeTime.starting_hole || 1}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {teeTime.course_name && (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {teeTime.course_name}
                      </span>
                    )}
                    {getStatusBadge(teeTime.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Flag className="w-4 h-4" />
                      {teeTime.holes || 18} holes
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {teeTime.players?.length || 0}/{teeTime.max_players || 4}
                    </span>
                    {teeTime.weather && (
                      <span className="flex items-center gap-1">
                        {teeTime.weather.condition === 'sunny' ? (
                          <Sun className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Cloud className="w-4 h-4 text-gray-400" />
                        )}
                        {teeTime.weather.temp}°F
                      </span>
                    )}
                  </div>

                  {teeTime.players && teeTime.players.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex -space-x-2">
                        {teeTime.players.slice(0, 4).map((player) => (
                          <div
                            key={player.id}
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden"
                          >
                            {player.avatar_url ? (
                              <img
                                src={player.avatar_url}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {player.name.charAt(0)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {teeTime.players.map((p) => p.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">No tee times scheduled for today</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate Member Profile Golf component
 */
export function generateMemberProfileGolf(options: MemberProfileGolfOptions = {}): string {
  const {
    componentName = 'MemberProfileGolf',
    endpoint = '/golf/members',
    queryKey = 'golf-member',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Target,
  Trophy,
  Calendar,
  MapPin,
  Flag,
  Loader2,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  memberId?: string;
}

interface MemberProfile {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  member_since?: string;
  membership_type?: string;
  home_course?: string;
  handicap?: number;
  handicap_trend?: 'up' | 'down' | 'stable';
  stats?: {
    rounds_played?: number;
    average_score?: number;
    best_score?: number;
    tournaments_played?: number;
    tournaments_won?: number;
    birdies?: number;
    eagles?: number;
    holes_in_one?: number;
  };
  recent_rounds?: Array<{
    id: string;
    date: string;
    course_name: string;
    score: number;
    par: number;
  }>;
  achievements?: Array<{
    id: string;
    title: string;
    description?: string;
    earned_at: string;
    icon?: string;
  }>;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, memberId: propMemberId }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const memberId = propMemberId || paramId;

  const { data: member, isLoading } = useQuery({
    queryKey: ['${queryKey}', memberId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${memberId}\`);
        return (response?.data || response) as MemberProfile;
      } catch (err) {
        console.error('Failed to fetch member:', err);
        return null;
      }
    },
    enabled: !!memberId,
  });

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500">Member not found</p>
      </div>
    );
  }

  const getHandicapTrend = () => {
    switch (member.handicap_trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Back Link */}
      <Link
        to="/golf/members"
        className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Members
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h1>
            {member.membership_type && (
              <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm mt-2">
                {member.membership_type}
              </span>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              {member.home_course && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {member.home_course}
                </span>
              )}
              {member.member_since && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(member.member_since).getFullYear()}
                </span>
              )}
            </div>
          </div>

          {/* Handicap Card */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center min-w-[120px]">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Handicap</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-bold text-green-700 dark:text-green-300">
                {member.handicap ?? '-'}
              </span>
              {getHandicapTrend()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Flag className="w-4 h-4" />
            <span className="text-sm">Rounds</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {member.stats?.rounds_played ?? 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm">Avg Score</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {member.stats?.average_score ?? '-'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Trophy className="w-4 h-4" />
            <span className="text-sm">Best Score</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {member.stats?.best_score ?? '-'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-sm">Birdies</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {member.stats?.birdies ?? 0}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Rounds */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Rounds</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {member.recent_rounds && member.recent_rounds.length > 0 ? (
              member.recent_rounds.map((round) => (
                <div key={round.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {round.course_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(round.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {round.score}
                    </p>
                    <p
                      className={cn(
                        'text-sm',
                        round.score < round.par
                          ? 'text-green-600'
                          : round.score > round.par
                          ? 'text-red-600'
                          : 'text-gray-500'
                      )}
                    >
                      {round.score - round.par === 0
                        ? 'Even'
                        : round.score - round.par > 0
                        ? \`+\${round.score - round.par}\`
                        : round.score - round.par}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No recent rounds</div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Achievements</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {member.achievements && member.achievements.length > 0 ? (
              member.achievements.map((achievement) => (
                <div key={achievement.id} className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {achievement.title}
                    </p>
                    {achievement.description && (
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No achievements yet</div>
            )}
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
 * Generate Tournament List Upcoming component
 */
export function generateTournamentListUpcoming(options: TournamentListOptions = {}): string {
  const {
    componentName = 'TournamentListUpcoming',
    endpoint = '/golf/tournaments/upcoming',
    queryKey = 'golf-tournaments-upcoming',
  } = options;

  return `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Loader2,
  ChevronRight,
  Clock,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  limit?: number;
}

interface Tournament {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  course_name?: string;
  course_id?: string;
  format?: string;
  entry_fee?: number;
  prize_pool?: number;
  max_participants?: number;
  current_participants?: number;
  registration_deadline?: string;
  status?: 'open' | 'closed' | 'in_progress' | 'completed';
  image_url?: string;
  is_registered?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, limit = 6 }) => {
  const queryClient = useQueryClient();

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['${queryKey}', limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as Tournament[];
      } catch (err) {
        console.error('Failed to fetch tournaments:', err);
        return [];
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      return api.post('/golf/tournaments/register', { tournament_id: tournamentId });
    },
    onSuccess: () => {
      toast.success('Successfully registered for tournament!');
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
    onError: () => {
      toast.error('Failed to register for tournament');
    },
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            Registration Open
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
            Closed
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
            In Progress
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return 'Started';
    return \`\${days} days\`;
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Upcoming Tournaments
        </h2>
        <Link
          to="/golf/tournaments"
          className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tournaments && tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {tournament.image_url && (
                <img
                  src={tournament.image_url}
                  alt={tournament.name}
                  className="w-full h-32 object-cover"
                />
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {tournament.name}
                  </h3>
                  {getStatusBadge(tournament.status)}
                </div>

                {tournament.format && (
                  <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded mb-3">
                    {tournament.format}
                  </span>
                )}

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(tournament.start_date)}</span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ({getDaysUntil(tournament.start_date)})
                    </span>
                  </div>

                  {tournament.course_name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{tournament.course_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {tournament.current_participants || 0} / {tournament.max_participants || '∞'}{' '}
                      registered
                    </span>
                  </div>

                  {tournament.prize_pool && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>\${tournament.prize_pool.toLocaleString()} prize pool</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={\`/golf/tournaments/\${tournament.id}\`}
                    className="flex-1 px-3 py-2 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Details
                  </Link>

                  {tournament.status === 'open' && !tournament.is_registered && (
                    <button
                      onClick={() => registerMutation.mutate(tournament.id)}
                      disabled={registerMutation.isPending}
                      className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {registerMutation.isPending ? 'Registering...' : 'Register'}
                    </button>
                  )}

                  {tournament.is_registered && (
                    <span className="flex-1 px-3 py-2 text-sm text-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">
                      Registered
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No upcoming tournaments
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
 * Generate Lesson Calendar Golf component
 */
export function generateLessonCalendarGolf(options: LessonCalendarGolfOptions = {}): string {
  const {
    componentName = 'LessonCalendarGolf',
    endpoint = '/golf/lessons',
    queryKey = 'golf-lessons',
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
  Target,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  instructorId?: string;
}

interface GolfLesson {
  id: string;
  title: string;
  instructor_name: string;
  instructor_id?: string;
  instructor_avatar?: string;
  date: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  location?: string;
  lesson_type?: 'private' | 'group' | 'playing';
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  focus_area?: string;
  price?: number;
  spots_available?: number;
  max_spots?: number;
  status?: 'available' | 'booked' | 'completed' | 'cancelled';
  description?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({ className, instructorId }) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<GolfLesson | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.getMonth(), currentDate.getFullYear(), instructorId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        if (instructorId) params.append('instructorId', instructorId);
        const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
        return (Array.isArray(response) ? response : (response?.data || [])) as GolfLesson[];
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
        return [];
      }
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return api.post('/golf/lessons/book', { lesson_id: lessonId });
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
    if (!lessons) return [];
    return lessons.filter((lesson) => {
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

  const getLessonTypeColor = (type?: string) => {
    switch (type) {
      case 'private':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      case 'group':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'playing':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200';
    }
  };

  const getSkillLevelBadge = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">Private</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Group</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Playing</span>
            </div>
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
                      isToday(day.date) && 'bg-green-600 text-white',
                      !isToday(day.date) && !day.isCurrentMonth && 'text-gray-400'
                    )}
                  >
                    {day.date.getDate()}
                  </div>

                  {availableCount > 0 && day.isCurrentMonth && (
                    <div className="text-xs text-green-600 dark:text-green-400 mb-1">
                      {availableCount} lesson{availableCount > 1 ? 's' : ''} available
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
                          getLessonTypeColor(lesson.lesson_type)
                        )}
                      >
                        {lesson.start_time} - {lesson.instructor_name}
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
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Book Golf Lesson
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
                <div className="flex items-center gap-2 mt-1">
                  {selectedLesson.lesson_type && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full capitalize',
                        getLessonTypeColor(selectedLesson.lesson_type)
                      )}
                    >
                      {selectedLesson.lesson_type}
                    </span>
                  )}
                  {selectedLesson.skill_level && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full capitalize',
                        getSkillLevelBadge(selectedLesson.skill_level)
                      )}
                    >
                      {selectedLesson.skill_level}
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

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>{new Date(selectedLesson.date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5" />
                <span>
                  {selectedLesson.start_time}
                  {selectedLesson.end_time && \` - \${selectedLesson.end_time}\`}
                  {selectedLesson.duration && \` (\${selectedLesson.duration} min)\`}
                </span>
              </div>

              {selectedLesson.location && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>{selectedLesson.location}</span>
                </div>
              )}

              {selectedLesson.focus_area && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Target className="w-5 h-5" />
                  <span>Focus: {selectedLesson.focus_area}</span>
                </div>
              )}

              {selectedLesson.price && (
                <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
                  <DollarSign className="w-5 h-5" />
                  <span>\${selectedLesson.price}</span>
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
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
