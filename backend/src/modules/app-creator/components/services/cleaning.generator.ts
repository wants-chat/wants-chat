/**
 * Cleaning Service Component Generators
 *
 * Generates components for cleaning service management:
 * - CleaningStats: Dashboard statistics
 * - BookingCalendarCleaning: Calendar view of cleaning bookings
 * - CleanerProfile: Cleaner profile and performance
 * - CleanerSchedule: Cleaner's daily/weekly schedule
 * - CustomerProfileCleaning: Customer profile with booking history
 */

export interface CleaningStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCleaningStats(options: CleaningStatsOptions = {}): string {
  const { componentName = 'CleaningStats', endpoint = '/cleaning/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Calendar, Clock, DollarSign, Users, Star, CheckCircle, TrendingUp, Home, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['cleaning-stats'],
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
    { key: 'todayBookings', label: "Today's Bookings", icon: Calendar, color: 'blue' },
    { key: 'activeCleaners', label: 'Active Cleaners', icon: Users, color: 'green' },
    { key: 'completedToday', label: 'Completed Today', icon: CheckCircle, color: 'emerald' },
    { key: 'recurringCustomers', label: 'Recurring Customers', icon: RefreshCw, color: 'purple' },
    { key: 'avgRating', label: 'Avg Rating', icon: Star, color: 'yellow', suffix: '/5' },
    { key: 'homesServiced', label: 'Homes Serviced', icon: Home, color: 'indigo' },
    { key: 'revenueToday', label: "Today's Revenue", icon: DollarSign, color: 'emerald', type: 'currency' },
    { key: 'avgCleaningTime', label: 'Avg Cleaning Time', icon: Clock, color: 'orange', suffix: ' hrs' },
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

export interface BookingCalendarCleaningOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateBookingCalendarCleaning(options: BookingCalendarCleaningOptions = {}): string {
  const { componentName = 'BookingCalendarCleaning', endpoint = '/cleaning/bookings' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, Home, Loader2, X } from 'lucide-react';
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
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['cleaning-bookings', currentDate.getMonth(), currentDate.getFullYear()],
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

  const getBookingsForDate = (date: Date) => {
    return (bookings || []).filter((booking: any) => {
      const bookingDate = new Date(booking.scheduled_date || booking.date);
      return (
        bookingDate.getFullYear() === date.getFullYear() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getDate() === date.getDate()
      );
    });
  };

  const getBookingColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'deep_clean':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
      case 'move_out':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
      case 'recurring':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
            onClick={() => navigate('/bookings/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Deep Clean</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Recurring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">Move Out</span>
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
              const dayBookings = getBookingsForDate(day.date);
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
                    {dayBookings.slice(0, 3).map((booking: any) => (
                      <div
                        key={booking.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                        className={cn(
                          'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2',
                          getBookingColor(booking.cleaning_type || booking.type)
                        )}
                      >
                        {booking.scheduled_time || booking.time} - {booking.customer_name}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">+{dayBookings.length - 3} more</div>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedBooking.customer_name}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.customer_phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.address}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.property_size || 'Standard'} | {selectedBooking.bedrooms || 0} bed, {selectedBooking.bathrooms || 0} bath</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedBooking.scheduled_date || selectedBooking.date).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <p className="text-gray-900 dark:text-white">
                  {selectedBooking.scheduled_time || selectedBooking.time} ({selectedBooking.duration || 2} hours)
                </p>
              </div>

              {selectedBooking.cleaner_name && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500">Assigned Cleaner</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedBooking.cleaner_name}</p>
                </div>
              )}

              {selectedBooking.special_instructions && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500">Special Instructions</p>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.special_instructions}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`/bookings/\${selectedBooking.id}\`); setSelectedBooking(null); }}
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

export interface CleanerProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCleanerProfile(options: CleanerProfileOptions = {}): string {
  const { componentName = 'CleanerProfile', endpoint = '/cleaning/cleaners' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Star, Calendar, Clock, Award, MapPin, ArrowLeft, Edit, Loader2, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  cleanerId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ cleanerId: propId, className }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const cleanerId = propId || paramId;

  const { data: cleaner, isLoading } = useQuery({
    queryKey: ['cleaner', cleanerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${cleanerId}\`);
      return response?.data || response;
    },
    enabled: !!cleanerId,
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['cleaner-bookings', cleanerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${cleanerId}/bookings?limit=5\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!cleanerId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['cleaner-reviews', cleanerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${cleanerId}/reviews?limit=3\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!cleanerId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!cleaner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Cleaner not found</p>
      </div>
    );
  }

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
        <button
          onClick={() => navigate(\`/cleaners/\${cleanerId}/edit\`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center overflow-hidden">
            {cleaner.avatar_url ? (
              <img src={cleaner.avatar_url} alt={cleaner.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cleaner.name}</h1>
              {cleaner.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900 dark:text-white">{cleaner.rating || 0}</span>
              <span className="text-gray-500">({cleaner.review_count || 0} reviews)</span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{cleaner.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{cleaner.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{cleaner.service_area || 'All areas'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(cleaner.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{cleaner.total_cleanings || 0}</div>
            <div className="text-sm text-gray-500">Total Cleanings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{cleaner.this_month || 0}</div>
            <div className="text-sm text-gray-500">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{cleaner.on_time_rate || 100}%</div>
            <div className="text-sm text-gray-500">On-Time Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${(cleaner.earnings_this_month || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Earnings (Month)</div>
          </div>
        </div>
      </div>

      {/* Specialties */}
      {cleaner.specialties && cleaner.specialties.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {cleaner.specialties.map((specialty: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm">
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        {recentBookings && recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{booking.customer_name}</p>
                  <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                </div>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  booking.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                )}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">No recent bookings</p>
        )}
      </div>

      {/* Recent Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reviews</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 dark:text-white">{review.customer_name}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn('w-4 h-4', i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">No reviews yet</p>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface CleanerScheduleOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCleanerSchedule(options: CleanerScheduleOptions = {}): string {
  const { componentName = 'CleanerSchedule', endpoint = '/cleaning/cleaners' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, Home, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  cleanerId?: string;
  className?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

const ${componentName}: React.FC<${componentName}Props> = ({ cleanerId: propId, className }) => {
  const { id: paramId } = useParams();
  const cleanerId = propId || paramId;
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['cleaner-schedule', cleanerId, weekStart.toISOString()],
    queryFn: async () => {
      const start = weekStart.toISOString();
      const end = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await api.get<any>(\`${endpoint}/\${cleanerId}/schedule?start=\${start}&end=\${end}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!cleanerId,
  });

  const getBookingsForDateTime = (date: Date, hour: number) => {
    return (schedule || []).filter((booking: any) => {
      const bookingDate = new Date(booking.scheduled_date || booking.date);
      const bookingHour = parseInt(booking.scheduled_time?.split(':')[0] || booking.start_hour || '0');
      return (
        bookingDate.toDateString() === date.toDateString() &&
        bookingHour === hour
      );
    });
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
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Schedule</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              This Week
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
            <div className="p-3 text-sm text-gray-500">Time</div>
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={cn(
                  'p-3 text-center',
                  isToday(day) && 'bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                <div className="text-sm text-gray-500">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={cn(
                  'text-lg font-semibold',
                  isToday(day) ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                )}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="p-3 text-sm text-gray-500 border-r border-gray-200 dark:border-gray-700">
                {hour > 12 ? \`\${hour - 12}:00 PM\` : \`\${hour}:00 AM\`}
              </div>
              {weekDays.map((day, i) => {
                const bookings = getBookingsForDateTime(day, hour);
                return (
                  <div
                    key={i}
                    className={cn(
                      'p-2 min-h-[80px] border-r border-gray-200 dark:border-gray-700 last:border-r-0',
                      isToday(day) && 'bg-blue-50/50 dark:bg-blue-900/10'
                    )}
                  >
                    {bookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-xs mb-1"
                      >
                        <div className="font-medium text-green-800 dark:text-green-300 truncate">
                          {booking.customer_name}
                        </div>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {booking.duration || 2}h
                        </div>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 truncate">
                          <MapPin className="w-3 h-3" />
                          {booking.address?.split(',')[0] || 'TBD'}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
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

export interface CustomerProfileCleaningOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileCleaning(options: CustomerProfileCleaningOptions = {}): string {
  const { componentName = 'CustomerProfileCleaning', endpoint = '/cleaning/customers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Home, Calendar, DollarSign, Star, ArrowLeft, Edit, Loader2, Clock, RefreshCw, CheckCircle } from 'lucide-react';
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
    queryKey: ['cleaning-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: bookingHistory } = useQuery({
    queryKey: ['cleaning-customer-bookings', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/bookings\`);
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
            onClick={() => navigate(\`/bookings/new?customer=\${customerId}\`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Calendar className="w-4 h-4" />
            Book Cleaning
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
              {customer.recurring && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium rounded-full">
                  <RefreshCw className="w-4 h-4" />
                  Recurring
                </span>
              )}
            </div>
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
                <span>{customer.address || 'No address'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Home className="w-4 h-4" />
                <span>{customer.property_size || 'Standard'} | {customer.bedrooms || 0} bed, {customer.bathrooms || 0} bath</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.total_bookings || 0}</div>
            <div className="text-sm text-gray-500">Total Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">\${(customer.total_spent || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{customer.avg_rating || '-'}</span>
            </div>
            <div className="text-sm text-gray-500">Avg Rating Given</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.next_booking ? new Date(customer.next_booking).toLocaleDateString() : 'None'}
            </div>
            <div className="text-sm text-gray-500">Next Booking</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      {customer.preferences && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {customer.preferences.preferred_day && (
              <div>
                <p className="text-sm text-gray-500">Preferred Day</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{customer.preferences.preferred_day}</p>
              </div>
            )}
            {customer.preferences.preferred_time && (
              <div>
                <p className="text-sm text-gray-500">Preferred Time</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.preferences.preferred_time}</p>
              </div>
            )}
            {customer.preferences.cleaning_products && (
              <div>
                <p className="text-sm text-gray-500">Products</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.preferences.cleaning_products}</p>
              </div>
            )}
            {customer.preferences.preferred_cleaner && (
              <div>
                <p className="text-sm text-gray-500">Preferred Cleaner</p>
                <p className="font-medium text-gray-900 dark:text-white">{customer.preferences.preferred_cleaner}</p>
              </div>
            )}
          </div>
          {customer.preferences.special_instructions && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-2">Special Instructions</p>
              <p className="text-gray-900 dark:text-white">{customer.preferences.special_instructions}</p>
            </div>
          )}
        </div>
      )}

      {/* Booking History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Booking History</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        {bookingHistory && bookingHistory.length > 0 ? (
          <div className="space-y-3">
            {bookingHistory.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    booking.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                  )}>
                    {booking.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Calendar className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.cleaning_type || 'Standard Cleaning'}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                      <span>{booking.time}</span>
                      {booking.cleaner_name && <span>by {booking.cleaner_name}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">\${booking.price || 0}</p>
                  {booking.rating && (
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-500">{booking.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500">No booking history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
