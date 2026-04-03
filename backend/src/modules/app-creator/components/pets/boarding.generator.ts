/**
 * Pet Boarding Component Generators
 *
 * Generates components for pet boarding facilities:
 * - PetboardingStats: Dashboard statistics for boarding facility
 * - CalendarPetboarding: Booking calendar for pet boarding
 * - StaffScheduleBoarding: Staff scheduling for boarding facility
 * - PetProfileBoarding: Pet profile view for boarding context
 * - CurrentPets: List of currently boarded pets
 * - PetActivities: Activity tracking for boarded pets
 * - FeedingSchedule: Feeding schedule management
 */

export interface BoardingStatsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface CalendarBoardingOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  createRoute?: string;
  detailRoute?: string;
}

export interface StaffScheduleOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface PetProfileBoardingOptions {
  componentName?: string;
  endpoint?: string;
}

export interface CurrentPetsOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  showActions?: boolean;
}

export interface PetActivitiesOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

export interface FeedingScheduleOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate PetboardingStats component
 */
export function generatePetboardingStats(options: BoardingStatsOptions = {}): string {
  const {
    componentName = 'PetboardingStats',
    endpoint = '/boarding/stats',
    queryKey = 'boarding-stats',
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
  BedDouble,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

interface StatsData {
  currentPets: number;
  currentPetsChange?: number;
  totalCapacity: number;
  occupancyRate: number;
  occupancyChange?: number;
  weeklyBookings: number;
  weeklyBookingsChange?: number;
  monthlyRevenue: number;
  revenueChange?: number;
  avgStayDuration: number;
  upcomingCheckouts: number;
  upcomingCheckins: number;
}

const statsConfig = [
  { key: 'currentPets', label: 'Current Pets', icon: 'Dog', color: 'blue', type: 'number' },
  { key: 'occupancyRate', label: 'Occupancy Rate', icon: 'BedDouble', color: 'green', type: 'percentage' },
  { key: 'weeklyBookings', label: 'Weekly Bookings', icon: 'Calendar', color: 'purple', type: 'number' },
  { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: 'DollarSign', color: 'emerald', type: 'currency' },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
};

const iconMap: Record<string, React.FC<any>> = {
  Dog,
  Calendar,
  Users,
  DollarSign,
  BedDouble,
  Clock,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<StatsData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch boarding stats:', err);
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
      currentPets: 'currentPetsChange',
      occupancyRate: 'occupancyChange',
      weeklyBookings: 'weeklyBookingsChange',
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

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Stay Duration</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.avgStayDuration || 0} days
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Check-ins</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.upcomingCheckins || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Check-outs</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.upcomingCheckouts || 0}
              </p>
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
 * Generate CalendarPetboarding component
 */
export function generateCalendarPetboarding(options: CalendarBoardingOptions = {}): string {
  const {
    componentName = 'CalendarPetboarding',
    endpoint = '/boarding/bookings',
    queryKey = 'boarding-bookings',
    createRoute = '/boarding/new',
    detailRoute = '/boarding',
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Dog,
  Cat,
  X,
  Loader2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Booking {
  id: string;
  pet_name: string;
  pet_type: 'dog' | 'cat' | 'other';
  owner_name: string;
  check_in: string;
  check_out: string;
  status: 'confirmed' | 'pending' | 'checked_in' | 'completed' | 'cancelled';
  room_number?: string;
  special_instructions?: string;
}

interface ${componentName}Props {
  data?: Booking[];
  className?: string;
  onEventClick?: (booking: Booking) => void;
  onDateClick?: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  className,
  onEventClick,
  onDateClick,
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<Booking[]>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const bookings = propData || fetchedData || [];

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

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking: Booking) => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      return checkIn <= dateEnd && checkOut >= dateStart;
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
      checked_in: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const handleBookingClick = (booking: Booking) => {
    if (onEventClick) onEventClick(booking);
    else setSelectedBooking(booking);
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
            onClick={() => navigate('${createRoute}')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>

        {/* Calendar Grid */}
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
              const dayBookings = getBookingsForDate(day.date);
              return (
                <div
                  key={idx}
                  onClick={() => onDateClick?.(day.date)}
                  className={cn(
                    'min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
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
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking: Booking, i: number) => (
                      <div
                        key={booking.id || i}
                        onClick={(e) => { e.stopPropagation(); handleBookingClick(booking); }}
                        className={cn(
                          'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2 flex items-center gap-1',
                          getStatusColor(booking.status)
                        )}
                      >
                        {booking.pet_type === 'dog' ? <Dog className="w-3 h-3" /> : <Cat className="w-3 h-3" />}
                        {booking.pet_name}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedBooking(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  {selectedBooking.pet_type === 'dog' ? (
                    <Dog className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Cat className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBooking.pet_name}
                  </h3>
                  <p className="text-sm text-gray-500">Owner: {selectedBooking.owner_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span>Check-in: {new Date(selectedBooking.check_in).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Check-out: {new Date(selectedBooking.check_out).toLocaleDateString()}</span>
              </div>
              {selectedBooking.room_number && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Room: {selectedBooking.room_number}
                </div>
              )}
              <div className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', getStatusColor(selectedBooking.status))}>
                {selectedBooking.status.replace('_', ' ').charAt(0).toUpperCase() + selectedBooking.status.slice(1).replace('_', ' ')}
              </div>
              {selectedBooking.special_instructions && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    <strong>Special Instructions:</strong> {selectedBooking.special_instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  navigate(\`${detailRoute}/\${selectedBooking.id}\`);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Details
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
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

/**
 * Generate StaffScheduleBoarding component
 */
export function generateStaffScheduleBoarding(options: StaffScheduleOptions = {}): string {
  const {
    componentName = 'StaffScheduleBoarding',
    endpoint = '/boarding/staff-schedule',
    queryKey = 'boarding-staff-schedule',
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Loader2,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
}

interface Shift {
  id: string;
  staff_id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  notes?: string;
}

interface ScheduleData {
  staff: StaffMember[];
  shifts: Shift[];
}

interface ${componentName}Props {
  className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const shiftColors: Record<string, string> = {
  morning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  afternoon: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  evening: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  night: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff));
  });

  const { data, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentWeekStart.toISOString()],
    queryFn: async () => {
      try {
        const response = await api.get<ScheduleData>(\`${endpoint}?week_start=\${currentWeekStart.toISOString()}\`);
        return response?.data || response || { staff: [], shifts: [] };
      } catch (err) {
        console.error('Failed to fetch staff schedule:', err);
        return { staff: [], shifts: [] };
      }
    },
  });

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

  const getShiftsForStaffAndDate = (staffId: string, date: Date) => {
    return (data?.shifts || []).filter((shift: Shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shift.staff_id === staffId &&
        shiftDate.getFullYear() === date.getFullYear() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getDate() === date.getDate()
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
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Staff Schedule
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[200px] text-center">
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-48">
                Staff Member
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
                  <div className="text-xs">{day.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {(data?.staff || []).map((staff: StaffMember) => (
              <tr key={staff.id}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {staff.avatar_url ? (
                      <img src={staff.avatar_url} alt={staff.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.role}</p>
                    </div>
                  </div>
                </td>
                {weekDays.map((day, idx) => {
                  const shifts = getShiftsForStaffAndDate(staff.id, day);
                  return (
                    <td
                      key={idx}
                      className={cn(
                        'py-2 px-2 text-center',
                        isToday(day) && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                    >
                      {shifts.length > 0 ? (
                        <div className="space-y-1">
                          {shifts.map((shift: Shift) => (
                            <div
                              key={shift.id}
                              className={cn(
                                'px-2 py-1 text-xs rounded',
                                shiftColors[shift.type] || shiftColors.morning
                              )}
                            >
                              <div className="flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" />
                                {shift.start_time} - {shift.end_time}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
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
        {Object.entries(shiftColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={cn('w-4 h-4 rounded', color.split(' ')[0])} />
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate PetProfileBoarding component
 */
export function generatePetProfileBoarding(options: PetProfileBoardingOptions = {}): string {
  const {
    componentName = 'PetProfileBoarding',
    endpoint = '/boarding/pets',
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
  Pill,
  Weight,
  Ruler,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface PetData {
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
  microchip_id?: string;
  is_neutered?: boolean;
  allergies?: string[];
  medical_conditions?: string[];
  medications?: string[];
  dietary_requirements?: string;
  vaccinations?: { name: string; date: string; expiry?: string }[];
  vet_info?: { name: string; phone: string; address?: string };
  emergency_contact?: { name: string; phone: string; relationship: string };
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  special_instructions?: string;
  temperament?: string;
  favorite_activities?: string[];
}

interface ${componentName}Props {
  petId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ petId: propPetId, className }) => {
  const { id } = useParams<{ id: string }>();
  const petId = propPetId || id;

  const { data: pet, isLoading } = useQuery({
    queryKey: ['boarding-pet', petId],
    queryFn: async () => {
      const response = await api.get<PetData>(\`${endpoint}/\${petId}\`);
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

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pet Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-6">
          {pet.avatar_url ? (
            <img src={pet.avatar_url} alt={pet.name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <PetIcon className="w-12 h-12 text-blue-600" />
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
            </div>
            <p className="text-gray-600 dark:text-gray-400">{pet.breed}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {pet.age} years old
              </span>
              {pet.weight && (
                <span className="flex items-center gap-1">
                  <Weight className="w-4 h-4" />
                  {pet.weight} lbs
                </span>
              )}
              {pet.size && (
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  {pet.size}
                </span>
              )}
              <span>Color: {pet.color}</span>
            </div>
            {pet.microchip_id && (
              <p className="text-xs text-gray-500 mt-2">Microchip: {pet.microchip_id}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Medical Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Medical Information
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

          {pet.medical_conditions && pet.medical_conditions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medical Conditions</p>
              <div className="flex flex-wrap gap-2">
                {pet.medical_conditions.map((condition, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pet.medications && pet.medications.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                <Pill className="w-4 h-4" />
                Current Medications
              </p>
              <ul className="space-y-1">
                {pet.medications.map((med, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400">- {med}</li>
                ))}
              </ul>
            </div>
          )}

          {pet.dietary_requirements && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dietary Requirements</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{pet.dietary_requirements}</p>
            </div>
          )}

          {pet.vaccinations && pet.vaccinations.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vaccinations</p>
              <div className="space-y-2">
                {pet.vaccinations.map((vax, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <span className="text-gray-700 dark:text-gray-300">{vax.name}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(vax.date).toLocaleDateString()}
                      {vax.expiry && \` (Exp: \${new Date(vax.expiry).toLocaleDateString()})\`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Owner & Contact Information */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Owner Information
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
              {pet.owner.address && (
                <p className="text-sm text-gray-500">{pet.owner.address}</p>
              )}
            </div>
          </div>

          {pet.emergency_contact && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{pet.emergency_contact.name}</p>
                <p className="text-sm text-gray-500">{pet.emergency_contact.relationship}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  {pet.emergency_contact.phone}
                </div>
              </div>
            </div>
          )}

          {pet.vet_info && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Veterinarian</h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{pet.vet_info.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  {pet.vet_info.phone}
                </div>
                {pet.vet_info.address && (
                  <p className="text-sm text-gray-500">{pet.vet_info.address}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Special Instructions & Temperament */}
      {(pet.special_instructions || pet.temperament || pet.favorite_activities) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Care Notes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pet.temperament && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temperament</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pet.temperament}</p>
              </div>
            )}
            {pet.favorite_activities && pet.favorite_activities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Favorite Activities</p>
                <div className="flex flex-wrap gap-2">
                  {pet.favorite_activities.map((activity, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {pet.special_instructions && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Instructions</p>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">{pet.special_instructions}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate CurrentPets component
 */
export function generateCurrentPets(options: CurrentPetsOptions = {}): string {
  const {
    componentName = 'CurrentPets',
    endpoint = '/boarding/current-pets',
    queryKey = 'current-pets',
    showActions = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Dog,
  Cat,
  Clock,
  User,
  Search,
  MoreVertical,
  Eye,
  FileText,
  LogOut,
  Loader2,
  BedDouble,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface BoardedPet {
  id: string;
  pet_name: string;
  pet_type: 'dog' | 'cat' | 'other';
  breed: string;
  avatar_url?: string;
  owner_name: string;
  room_number: string;
  check_in: string;
  check_out: string;
  days_remaining: number;
  status: 'checked_in' | 'needs_attention' | 'ready_for_checkout';
  last_activity?: string;
  feeding_status?: 'fed' | 'pending' | 'overdue';
}

interface ${componentName}Props {
  className?: string;
  onPetClick?: (pet: BoardedPet) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, onPetClick }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: pets, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<BoardedPet[]>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch current pets:', err);
        return [];
      }
    },
  });

  const filteredPets = (pets || []).filter((pet: BoardedPet) =>
    pet.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      checked_in: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      needs_attention: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      ready_for_checkout: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colors[status] || colors.checked_in;
  };

  const getFeedingStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      fed: 'text-green-600',
      pending: 'text-yellow-600',
      overdue: 'text-red-600',
    };
    return colors[status || 'pending'] || colors.pending;
  };

  const handlePetClick = (pet: BoardedPet) => {
    if (onPetClick) onPetClick(pet);
    else navigate(\`/boarding/pets/\${pet.id}\`);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BedDouble className="w-5 h-5" />
          Current Pets ({filteredPets.length})
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pets, owners, rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Pet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No pets currently boarded
          </div>
        ) : (
          filteredPets.map((pet: BoardedPet) => {
            const PetIcon = pet.pet_type === 'dog' ? Dog : Cat;
            return (
              <div
                key={pet.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePetClick(pet)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {pet.avatar_url ? (
                      <img src={pet.avatar_url} alt={pet.pet_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <PetIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{pet.pet_name}</h3>
                      <p className="text-sm text-gray-500">{pet.breed}</p>
                    </div>
                  </div>
                  ${showActions ? `<div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenu(openMenu === pet.id ? null : pet.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {openMenu === pet.id && (
                      <div className="absolute right-0 top-8 z-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                        <button
                          onClick={() => { navigate(\`/boarding/pets/\${pet.id}\`); setOpenMenu(null); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> View Profile
                        </button>
                        <button
                          onClick={() => { navigate(\`/boarding/pets/\${pet.id}/activity\`); setOpenMenu(null); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" /> Log Activity
                        </button>
                        <button
                          onClick={() => { navigate(\`/boarding/checkout/\${pet.id}\`); setOpenMenu(null); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Check Out
                        </button>
                      </div>
                    )}
                  </div>` : ''}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <User className="w-4 h-4" /> Owner
                    </span>
                    <span className="text-gray-900 dark:text-white">{pet.owner_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <BedDouble className="w-4 h-4" /> Room
                    </span>
                    <span className="text-gray-900 dark:text-white">{pet.room_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Days Left
                    </span>
                    <span className={cn(
                      'font-medium',
                      pet.days_remaining <= 1 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                    )}>
                      {pet.days_remaining}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(pet.status))}>
                    {pet.status.replace(/_/g, ' ')}
                  </span>
                  {pet.feeding_status && (
                    <span className={cn('text-xs', getFeedingStatusColor(pet.feeding_status))}>
                      Feeding: {pet.feeding_status}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate PetActivities component
 */
export function generatePetActivities(options: PetActivitiesOptions = {}): string {
  const {
    componentName = 'PetActivities',
    endpoint = '/boarding/activities',
    queryKey = 'pet-activities',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Dog,
  Utensils,
  Pill,
  Heart,
  Play,
  Moon,
  Loader2,
  Plus,
  Clock,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ActivityLog {
  id: string;
  pet_id: string;
  pet_name: string;
  activity_type: 'feeding' | 'medication' | 'exercise' | 'grooming' | 'health_check' | 'playtime' | 'rest';
  description: string;
  staff_name: string;
  timestamp: string;
  notes?: string;
}

interface ${componentName}Props {
  petId?: string;
  className?: string;
}

const activityConfig: Record<string, { icon: React.FC<any>; color: string; label: string }> = {
  feeding: { icon: Utensils, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', label: 'Feeding' },
  medication: { icon: Pill, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', label: 'Medication' },
  exercise: { icon: Activity, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', label: 'Exercise' },
  grooming: { icon: Heart, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', label: 'Grooming' },
  health_check: { icon: Heart, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', label: 'Health Check' },
  playtime: { icon: Play, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', label: 'Playtime' },
  rest: { icon: Moon, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'Rest' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ petId, className }) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activity_type: 'feeding',
    description: '',
    notes: '',
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ['${queryKey}', petId],
    queryFn: async () => {
      try {
        const url = petId ? \`${endpoint}?pet_id=\${petId}\` : '${endpoint}';
        const response = await api.get<ActivityLog[]>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        return [];
      }
    },
  });

  const addActivityMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('${endpoint}', { ...data, pet_id: petId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}', petId] });
      setShowAddModal(false);
      setNewActivity({ activity_type: 'feeding', description: '', notes: '' });
    },
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return \`\${minutes}m ago\`;
    if (hours < 24) return \`\${hours}h ago\`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Log
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Log Activity
          </button>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(activities || []).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No activities logged yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {(activities || []).map((activity: ActivityLog) => {
                const config = activityConfig[activity.activity_type] || activityConfig.feeding;
                const Icon = config.icon;
                return (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2 rounded-lg', config.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {config.label}
                              {activity.pet_name && !petId && (
                                <span className="text-gray-500 font-normal"> - {activity.pet_name}</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {activity.description}
                            </p>
                            {activity.notes && (
                              <p className="text-xs text-gray-500 mt-2 italic">
                                Note: {activity.notes}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.staff_name}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Activity</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addActivityMutation.mutate(newActivity); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Type
                </label>
                <select
                  value={newActivity.activity_type}
                  onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {Object.entries(activityConfig).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="e.g., Morning meal - 1 cup dry food"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addActivityMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {addActivityMutation.isPending ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
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
 * Generate FeedingSchedule component
 */
export function generateFeedingSchedule(options: FeedingScheduleOptions = {}): string {
  const {
    componentName = 'FeedingSchedule',
    endpoint = '/boarding/feeding-schedule',
    queryKey = 'feeding-schedule',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Utensils,
  Clock,
  Dog,
  Cat,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface FeedingEntry {
  id: string;
  pet_id: string;
  pet_name: string;
  pet_type: 'dog' | 'cat' | 'other';
  room_number: string;
  scheduled_time: string;
  food_type: string;
  portion: string;
  dietary_notes?: string;
  status: 'pending' | 'completed' | 'skipped';
  completed_at?: string;
  completed_by?: string;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const queryClient = useQueryClient();
  const [expandedPet, setExpandedPet] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<FeedingEntry[]>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch feeding schedule:', err);
        return [];
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const markFedMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return api.post(\`${endpoint}/\${entryId}/complete\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const filteredSchedule = (schedule || []).filter((entry: FeedingEntry) => {
    if (filterStatus === 'all') return true;
    return entry.status === filterStatus;
  });

  const groupedByTime = filteredSchedule.reduce((acc: Record<string, FeedingEntry[]>, entry: FeedingEntry) => {
    const time = entry.scheduled_time;
    if (!acc[time]) acc[time] = [];
    acc[time].push(entry);
    return acc;
  }, {});

  const sortedTimes = Object.keys(groupedByTime).sort();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      skipped: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || colors.pending;
  };

  const isOverdue = (time: string, status: string) => {
    if (status !== 'pending') return false;
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    return now > scheduledTime;
  };

  const pendingCount = (schedule || []).filter((e: FeedingEntry) => e.status === 'pending').length;
  const completedCount = (schedule || []).filter((e: FeedingEntry) => e.status === 'completed').length;

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Feeding Schedule
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {pendingCount} pending, {completedCount} completed
          </p>
        </div>
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                'px-3 py-1.5 text-sm capitalize',
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="space-y-4">
        {sortedTimes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
            No feeding entries found
          </div>
        ) : (
          sortedTimes.map((time) => {
            const entries = groupedByTime[time];
            const hasOverdue = entries.some((e: FeedingEntry) => isOverdue(time, e.status));

            return (
              <div
                key={time}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className={cn(
                  'px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3',
                  hasOverdue && 'bg-red-50 dark:bg-red-900/20'
                )}>
                  <Clock className={cn('w-5 h-5', hasOverdue ? 'text-red-500' : 'text-gray-500')} />
                  <span className="font-medium text-gray-900 dark:text-white">{time}</span>
                  {hasOverdue && (
                    <span className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" /> Overdue
                    </span>
                  )}
                  <span className="ml-auto text-sm text-gray-500">
                    {entries.filter((e: FeedingEntry) => e.status === 'completed').length}/{entries.length} completed
                  </span>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {entries.map((entry: FeedingEntry) => {
                    const PetIcon = entry.pet_type === 'dog' ? Dog : Cat;
                    const isExpanded = expandedPet === entry.id;
                    const overdue = isOverdue(time, entry.status);

                    return (
                      <div key={entry.id} className={cn('p-4', overdue && 'bg-red-50/50 dark:bg-red-900/10')}>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'p-2 rounded-lg',
                            entry.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-blue-100 dark:bg-blue-900/30'
                          )}>
                            <PetIcon className={cn(
                              'w-5 h-5',
                              entry.status === 'completed'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-blue-600 dark:text-blue-400'
                            )} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">{entry.pet_name}</span>
                              <span className="text-sm text-gray-500">Room {entry.room_number}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {entry.food_type} - {entry.portion}
                            </p>
                          </div>

                          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(entry.status))}>
                            {entry.status}
                          </span>

                          {entry.status === 'pending' && (
                            <button
                              onClick={() => markFedMutation.mutate(entry.id)}
                              disabled={markFedMutation.isPending}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {entry.dietary_notes && (
                            <button
                              onClick={() => setExpandedPet(isExpanded ? null : entry.id)}
                              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>

                        {isExpanded && entry.dietary_notes && (
                          <div className="mt-3 ml-12 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {entry.dietary_notes}
                            </p>
                          </div>
                        )}

                        {entry.status === 'completed' && entry.completed_by && (
                          <p className="text-xs text-gray-500 mt-2 ml-12">
                            Completed by {entry.completed_by} at {entry.completed_at && new Date(entry.completed_at).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
