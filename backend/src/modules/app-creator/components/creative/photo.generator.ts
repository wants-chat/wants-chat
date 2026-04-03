/**
 * Photo Component Generators for Creative/Design Apps
 *
 * Generates photography-related components including:
 * - PhotoStats - Statistics dashboard for photographers
 * - BookingCalendarPhoto - Booking calendar for photo sessions
 * - ClientProfilePhoto - Client profile for photography business
 */

export interface PhotoGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate PhotoStats component - statistics for photography business
 */
export function generatePhotoStats(options: PhotoGeneratorOptions = {}): string {
  const {
    componentName = 'PhotoStats',
    endpoint = '/photography/stats',
    queryKey = 'photo-stats',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Camera,
  Users,
  Calendar,
  DollarSign,
  Image,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Eye,
  Heart,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  photographerId?: string;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

const ${componentName}: React.FC<${componentName}Props> = ({ className, photographerId }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', photographerId, timeRange],
    queryFn: async () => {
      let url = '${endpoint}?period=' + timeRange;
      if (photographerId) url += '&photographer_id=' + photographerId;
      const response = await api.get<any>(url);
      return response?.data || response || {};
    },
  });

  const timeRangeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  if (isLoading) {
    return (
      <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 \${className || ''}\`}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={\`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center \${className || ''}\`}>
        <p className="text-red-600 dark:text-red-400">Failed to load statistics</p>
      </div>
    );
  }

  const mainStats = [
    {
      label: 'Total Sessions',
      value: stats?.totalSessions || 0,
      change: stats?.sessionsChange,
      icon: Camera,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Total Clients',
      value: stats?.totalClients || 0,
      change: stats?.clientsChange,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Photos Delivered',
      value: (stats?.photosDelivered || 0).toLocaleString(),
      change: stats?.photosChange,
      icon: Image,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Revenue',
      value: '$' + (stats?.revenue || 0).toLocaleString(),
      change: stats?.revenueChange,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
  ];

  const secondaryStats = [
    {
      label: 'Upcoming Sessions',
      value: stats?.upcomingSessions || 0,
      icon: Calendar,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Avg. Rating',
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : '-',
      icon: Star,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Avg. Session Duration',
      value: stats?.avgDuration ? stats.avgDuration + ' hrs' : '-',
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Repeat Clients',
      value: stats?.repeatClients ? stats.repeatClients + '%' : '-',
      icon: TrendingUp,
      color: 'text-pink-600 dark:text-pink-400',
    },
  ];

  const portfolioStats = [
    { label: 'Total Views', value: stats?.portfolioViews || 0, icon: Eye },
    { label: 'Total Likes', value: stats?.portfolioLikes || 0, icon: Heart },
    { label: 'Downloads', value: stats?.portfolioDownloads || 0, icon: Download },
  ];

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Photography Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your photography business performance</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={\`p-3 rounded-lg \${stat.bgColor}\`}>
                    <Icon className={\`w-6 h-6 \${stat.color}\`} />
                  </div>
                  {stat.change !== undefined && (
                    <div className={\`flex items-center gap-1 text-sm font-medium \${
                      stat.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }\`}>
                      {stat.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Stats & Portfolio Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            {secondaryStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Icon className={\`w-5 h-5 \${stat.color}\`} />
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio Engagement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Engagement</h3>
          <div className="space-y-4">
            {portfolioStats.map((stat, index) => {
              const Icon = stat.icon;
              const percentage = stats?.portfolioViews
                ? Math.round((stat.value / stats.portfolioViews) * 100)
                : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: \`\${Math.min(percentage, 100)}%\` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {stats?.recentSessions && stats.recentSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {stats.recentSessions.slice(0, 5).map((session: any, index: number) => (
              <div
                key={session.id || index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 overflow-hidden">
                    {session.client_avatar ? (
                      <img src={session.client_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{session.client_name || 'Client'}</p>
                    <p className="text-sm text-gray-500">{session.session_type || 'Photo Session'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.date ? new Date(session.date).toLocaleDateString() : ''}
                  </p>
                  {session.status && (
                    <span className={\`inline-block px-2 py-0.5 text-xs rounded-full mt-1 \${
                      session.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : session.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                    }\`}>
                      {session.status}
                    </span>
                  )}
                </div>
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

/**
 * Generate BookingCalendarPhoto component - calendar for photo session bookings
 */
export function generateBookingCalendarPhoto(options: PhotoGeneratorOptions = {}): string {
  const {
    componentName = 'BookingCalendarPhoto',
    endpoint = '/photography/bookings',
    queryKey = 'photo-bookings',
  } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Clock,
  User,
  Camera,
  MapPin,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Booking {
  id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  session_type: string;
  date: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  location?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price?: number;
}

interface ${componentName}Props {
  className?: string;
  photographerId?: string;
  onBookingClick?: (booking: Booking) => void;
  onNewBooking?: (date: Date) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  photographerId,
  onBookingClick,
  onNewBooking,
}) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['${queryKey}', photographerId, year, month],
    queryFn: async () => {
      let url = '${endpoint}?year=' + year + '&month=' + (month + 1);
      if (photographerId) url += '&photographer_id=' + photographerId;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const confirmBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await api.put('${endpoint}/' + bookingId, { status: 'confirmed' });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfWeek }, () => null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach((booking: Booking) => {
      const dateKey = new Date(booking.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(booking);
    });
    return grouped;
  }, [bookings]);

  const getDateKey = (day: number) => {
    return new Date(year, month, day).toISOString().split('T')[0];
  };

  const getDayBookings = (day: number) => {
    return bookingsByDate[getDateKey(day)] || [];
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-green-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-500',
  };

  const statusBadgeColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const sessionTypeColors: Record<string, string> = {
    portrait: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    wedding: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    event: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    commercial: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    family: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  if (isLoading) {
    return (
      <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 \${className || ''}\`}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white min-w-[180px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Today
            </button>
            {onNewBooking && (
              <button
                onClick={() => onNewBooking(selectedDate || new Date())}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {[...paddingDays, ...days].map((day, index) => {
            if (!day) {
              return <div key={'pad-' + index} className="aspect-square" />;
            }

            const dayBookings = getDayBookings(day);
            const hasBookings = dayBookings.length > 0;

            return (
              <div
                key={day}
                onClick={() => {
                  setSelectedDate(new Date(year, month, day));
                  if (dayBookings.length === 1 && onBookingClick) {
                    onBookingClick(dayBookings[0]);
                  }
                }}
                className={\`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all \${
                  isSelected(day)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : isToday(day)
                    ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }\`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={\`text-sm font-medium \${
                    isToday(day)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }\`}>
                    {day}
                  </span>
                  {hasBookings && (
                    <span className="text-xs text-gray-500">{dayBookings.length}</span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onBookingClick) onBookingClick(booking);
                      }}
                      className={\`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate \${
                        sessionTypeColors[booking.session_type.toLowerCase()] || 'bg-gray-100 dark:bg-gray-700'
                      }\`}
                    >
                      <div className={\`w-1.5 h-1.5 rounded-full \${statusColors[booking.status]}\`} />
                      <span className="truncate">{booking.client_name}</span>
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-gray-500 px-1.5">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          {getDayBookings(selectedDate.getDate()).length > 0 ? (
            <div className="space-y-4">
              {getDayBookings(selectedDate.getDate()).map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => onBookingClick?.(booking)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{booking.client_name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{booking.session_type}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.start_time}
                            {booking.end_time && ' - ' + booking.end_time}
                          </span>
                          {booking.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {booking.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={\`px-2 py-1 text-xs rounded-full capitalize \${statusBadgeColors[booking.status]}\`}>
                        {booking.status}
                      </span>
                      {booking.price !== undefined && (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          \${booking.price}
                        </span>
                      )}
                    </div>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmBooking.mutate(booking.id);
                        }}
                        disabled={confirmBooking.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No bookings for this day</p>
              {onNewBooking && (
                <button
                  onClick={() => onNewBooking(selectedDate)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Booking
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="px-6 pb-6">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="font-medium">Status:</span>
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div className={\`w-2 h-2 rounded-full \${color}\`} />
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate ClientProfilePhoto component - client profile for photography business
 */
export function generateClientProfilePhoto(options: PhotoGeneratorOptions = {}): string {
  const {
    componentName = 'ClientProfilePhoto',
    endpoint = '/photography/clients',
    queryKey = 'photo-client',
  } = options;

  return `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Image,
  DollarSign,
  Clock,
  Star,
  MessageCircle,
  Edit,
  Download,
  Eye,
  Heart,
  ChevronRight,
  User,
  Folder,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Session {
  id: string;
  session_type: string;
  date: string;
  status: string;
  photos_count?: number;
  price?: number;
}

interface Gallery {
  id: string;
  name: string;
  thumbnail_url?: string;
  photos_count: number;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  address?: string;
  notes?: string;
  created_at?: string;
  stats?: {
    totalSessions: number;
    totalPhotos: number;
    totalSpent: number;
    lastSession?: string;
  };
  sessions?: Session[];
  galleries?: Gallery[];
  preferences?: {
    preferred_style?: string;
    preferred_locations?: string[];
    special_requests?: string;
  };
}

interface ${componentName}Props {
  clientId?: string;
  className?: string;
}

type TabType = 'overview' | 'sessions' | 'galleries' | 'preferences';

const ${componentName}: React.FC<${componentName}Props> = ({ clientId: propClientId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = propClientId || paramId;

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', clientId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className={\`flex justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className={\`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center \${className || ''}\`}>
        <p className="text-red-600 dark:text-red-400">Client not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sessions', label: 'Sessions', count: client.sessions?.length },
    { id: 'galleries', label: 'Galleries', count: client.galleries?.length },
    { id: 'preferences', label: 'Preferences' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className={className}>
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {client.avatar_url ? (
                <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-2xl font-bold text-white">
                    {(client.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                {client.email && (
                  <a href={\`mailto:\${client.email}\`} className="flex items-center gap-1 hover:text-blue-600">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </a>
                )}
                {client.phone && (
                  <a href={\`tel:\${client.phone}\`} className="flex items-center gap-1 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </a>
                )}
              </div>
              {client.address && (
                <p className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {client.address}
                </p>
              )}
              {client.created_at && (
                <p className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  Client since {new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Book Session
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats */}
        {client.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Camera className="w-5 h-5 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.stats.totalSessions || 0}</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Image className="w-5 h-5 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.stats.totalPhotos || 0}</p>
              <p className="text-xs text-gray-500">Photos</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <DollarSign className="w-5 h-5 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">\${(client.stats.totalSpent || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Clock className="w-5 h-5 mx-auto text-orange-500 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {client.stats.lastSession ? new Date(client.stats.lastSession).toLocaleDateString() : '-'}
              </p>
              <p className="text-xs text-gray-500">Last Session</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={\`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors \${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {client.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                  <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {client.notes}
                  </p>
                </div>
              )}
              {client.sessions && client.sessions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent Sessions</h3>
                  <div className="space-y-2">
                    {client.sessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        onClick={() => navigate('/sessions/' + session.id)}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">{session.session_type}</p>
                            <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={\`px-2 py-1 text-xs rounded-full capitalize \${statusColors[session.status]}\`}>
                            {session.status}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              {client.sessions && client.sessions.length > 0 ? (
                <div className="space-y-3">
                  {client.sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => navigate('/sessions/' + session.id)}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">{session.session_type}</p>
                          <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {session.photos_count !== undefined && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Image className="w-4 h-4" />
                            {session.photos_count}
                          </span>
                        )}
                        {session.price !== undefined && (
                          <span className="font-medium text-gray-900 dark:text-white">\${session.price}</span>
                        )}
                        <span className={\`px-2 py-1 text-xs rounded-full capitalize \${statusColors[session.status]}\`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No sessions yet</p>
                </div>
              )}
            </div>
          )}

          {/* Galleries Tab */}
          {activeTab === 'galleries' && (
            <div>
              {client.galleries && client.galleries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {client.galleries.map((gallery) => (
                    <div
                      key={gallery.id}
                      onClick={() => navigate('/galleries/' + gallery.id)}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-gray-200 dark:bg-gray-600">
                        {gallery.thumbnail_url ? (
                          <img src={gallery.thumbnail_url} alt={gallery.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">{gallery.name}</h4>
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Image className="w-4 h-4" />
                            {gallery.photos_count} photos
                          </span>
                          <span>{new Date(gallery.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Folder className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No galleries yet</p>
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {client.preferences ? (
                <>
                  {client.preferences.preferred_style && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Preferred Style</h4>
                      <p className="text-gray-900 dark:text-white">{client.preferences.preferred_style}</p>
                    </div>
                  )}
                  {client.preferences.preferred_locations && client.preferences.preferred_locations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Preferred Locations</h4>
                      <div className="flex flex-wrap gap-2">
                        {client.preferences.preferred_locations.map((location, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm"
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {client.preferences.special_requests && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Special Requests</h4>
                      <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        {client.preferences.special_requests}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No preferences recorded</p>
                </div>
              )}
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
