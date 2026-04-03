/**
 * Wedding Venue Component Generators
 *
 * Generates venue-related components for wedding planning including calendar, stats, filters, and client profiles.
 */

export interface VenueOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVenueCalendar(options: VenueOptions = {}): string {
  const { componentName = 'VenueCalendar', endpoint = '/venues/bookings' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Clock,
  Users,
  X,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  venueId?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const bookingTypeColors: Record<string, string> = {
  wedding: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400',
  reception: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
  ceremony: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  rehearsal: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  tasting: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  tour: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400',
  default: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-400',
};

const ${componentName}: React.FC<${componentName}Props> = ({ className, venueId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['venue-bookings', venueId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (venueId) params.append('venueId', venueId);
      params.append('month', String(currentDate.getMonth() + 1));
      params.append('year', String(currentDate.getFullYear()));
      const url = '${endpoint}?' + params.toString();
      const response = await api.get<any>(url);
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
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const getBookingsForDate = (date: Date) => {
    return (bookings || []).filter((booking: any) => {
      const bookingDate = new Date(booking.date || booking.eventDate || booking.startDate);
      return (
        bookingDate.getFullYear() === date.getFullYear() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getDate() === date.getDate()
      );
    });
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

  const getBookingColor = (type: string) => {
    return bookingTypeColors[type?.toLowerCase()] || bookingTypeColors.default;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={navigatePrev}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Today
                </button>
                <button
                  onClick={navigateNext}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Booking
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {Object.entries(bookingTypeColors).filter(([key]) => key !== 'default').map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={\`w-3 h-3 rounded-full \${color.split(' ')[0]}\`} />
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {WEEKDAYS.map(day => (
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
              const dayBookings = getBookingsForDate(day.date);
              return (
                <div
                  key={idx}
                  className={\`min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors \${
                    !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                  } \${idx % 7 === 6 ? 'border-r-0' : ''}\`}
                >
                  <div
                    className={\`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1 \${
                      isToday(day.date)
                        ? 'bg-rose-600 text-white'
                        : !day.isCurrentMonth
                        ? 'text-gray-400'
                        : 'text-gray-900 dark:text-white'
                    }\`}
                  >
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking: any, i: number) => (
                      <div
                        key={booking.id || i}
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                        className={\`px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2 \${getBookingColor(booking.type || booking.eventType)}\`}
                      >
                        {booking.clientName || booking.title || booking.name}
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
              <div>
                <span className={\`inline-block px-2 py-0.5 text-xs rounded-full mb-2 capitalize \${getBookingColor(selectedBooking.type || selectedBooking.eventType)}\`}>
                  {selectedBooking.type || selectedBooking.eventType || 'Event'}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedBooking.clientName || selectedBooking.title}
                </h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                {new Date(selectedBooking.date || selectedBooking.eventDate).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
              {selectedBooking.time && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {selectedBooking.time}
                </div>
              )}
              {selectedBooking.guestCount && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  {selectedBooking.guestCount} guests
                </div>
              )}
              {selectedBooking.venue && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {selectedBooking.venue}
                </div>
              )}
              {selectedBooking.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {selectedBooking.notes}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
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

export function generateVenueStats(options: VenueOptions = {}): string {
  const { componentName = 'VenueStats', endpoint = '/venues/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  venueId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, venueId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['venue-stats', venueId],
    queryFn: async () => {
      const url = venueId ? '${endpoint}?venueId=' + venueId : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      subtext: \`\${stats?.upcomingBookings || 0} upcoming\`,
      icon: Calendar,
      color: 'blue',
    },
    {
      label: 'Revenue This Month',
      value: \`$\${(stats?.monthlyRevenue || 0).toLocaleString()}\`,
      subtext: stats?.revenueChange ? \`\${stats.revenueChange > 0 ? '+' : ''}\${stats.revenueChange}% vs last month\` : 'No data',
      icon: DollarSign,
      color: 'green',
      trend: stats?.revenueChange,
    },
    {
      label: 'Average Rating',
      value: stats?.averageRating?.toFixed(1) || '--',
      subtext: \`\${stats?.totalReviews || 0} reviews\`,
      icon: Star,
      color: 'yellow',
    },
    {
      label: 'Confirmed Events',
      value: stats?.confirmedEvents || 0,
      subtext: \`\${stats?.pendingEvents || 0} pending\`,
      icon: CheckCircle2,
      color: 'purple',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
  };

  return (
    <div className={\`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 \${className || ''}\`}>
      {statItems.map((stat, index) => {
        const colors = colorClasses[stat.color];
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
          >
            <div className="flex items-center gap-4">
              <div className={\`w-12 h-12 rounded-xl flex items-center justify-center \${colors.bg}\`}>
                <stat.icon className={\`w-6 h-6 \${colors.icon}\`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <div className="flex items-center gap-1">
                  {stat.trend !== undefined && (
                    <TrendingUp className={\`w-3 h-3 \${stat.trend >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'}\`} />
                  )}
                  <p className={\`text-xs \${stat.trend !== undefined ? (stat.trend >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}\`}>
                    {stat.subtext}
                  </p>
                </div>
              </div>
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

export function generateBookingFiltersVenue(options: VenueOptions = {}): string {
  const { componentName = 'BookingFiltersVenue', endpoint = '/venues' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Filter,
  X,
  ChevronDown,
  DollarSign,
  Star,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  search: string;
  venueId: string;
  eventType: string;
  dateRange: { start: string; end: string };
  status: string;
  guestCountMin: number | null;
  guestCountMax: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
}

const eventTypes = [
  'All Types',
  'Wedding',
  'Reception',
  'Ceremony',
  'Rehearsal',
  'Tasting',
  'Tour',
];

const statusOptions = ['All Status', 'Confirmed', 'Pending', 'Cancelled', 'Completed'];

const ${componentName}: React.FC<${componentName}Props> = ({ className, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    venueId: '',
    eventType: '',
    dateRange: { start: '', end: '' },
    status: '',
    guestCountMin: null,
    guestCountMax: null,
    budgetMin: null,
    budgetMax: null,
  });

  const { data: venues } = useQuery({
    queryKey: ['venues-list'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      venueId: '',
      eventType: '',
      dateRange: { start: '', end: '' },
      status: '',
      guestCountMin: null,
      guestCountMax: null,
      budgetMin: null,
      budgetMax: null,
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'dateRange') return value.start || value.end;
    if (typeof value === 'number') return value !== null;
    return Boolean(value);
  });

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name, event..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.venueId}
            onChange={(e) => updateFilter('venueId', e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          >
            <option value="">All Venues</option>
            {(venues || []).map((venue: any) => (
              <option key={venue.id} value={venue.id}>{venue.name}</option>
            ))}
          </select>

          <select
            value={filters.eventType}
            onChange={(e) => updateFilter('eventType', e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          >
            {eventTypes.map((type) => (
              <option key={type} value={type === 'All Types' ? '' : type}>{type}</option>
            ))}
          </select>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={\`px-4 py-2.5 border rounded-lg flex items-center gap-2 \${
              hasActiveFilters
                ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }\`}
          >
            <Filter className="w-4 h-4" />
            More Filters
            <ChevronDown className={\`w-4 h-4 transition-transform \${isExpanded ? 'rotate-180' : ''}\`} />
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status === 'All Status' ? '' : status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Guest Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Guest Count
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.guestCountMin ?? ''}
                  onChange={(e) => updateFilter('guestCountMin', e.target.value ? Number(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.guestCountMax ?? ''}
                  onChange={(e) => updateFilter('guestCountMax', e.target.value ? Number(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Budget Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budgetMin ?? ''}
                  onChange={(e) => updateFilter('budgetMin', e.target.value ? Number(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budgetMax ?? ''}
                  onChange={(e) => updateFilter('budgetMax', e.target.value ? Number(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
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

export function generateClientProfileVenue(options: VenueOptions = {}): string {
  const { componentName = 'ClientProfileVenue', endpoint = '/venues/clients' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Users,
  DollarSign,
  Clock,
  Star,
  MessageSquare,
  Edit2,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  clientId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, clientId }) => {
  const { data: client, isLoading } = useQuery({
    queryKey: ['venue-client', clientId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + clientId);
      return response?.data || response;
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        Client not found
      </div>
    );
  }

  const upcomingEvents = client.events?.filter((e: any) => new Date(e.date) >= new Date()) || [];
  const pastEvents = client.events?.filter((e: any) => new Date(e.date) < new Date()) || [];

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-rose-400 to-pink-500" />

        <div className="p-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-xl bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
              {client.avatar ? (
                <img src={client.avatar} alt={client.name} className="w-full h-full rounded-lg object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {client.name}
                  </h2>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <Heart className="w-4 h-4 text-rose-500" />
                    {client.partnerName ? \`& \${client.partnerName}\` : 'Wedding Planning'}
                  </p>
                </div>
                <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{client.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Wedding Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {client.weddingDate ? new Date(client.weddingDate).toLocaleDateString() : 'TBD'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Quick Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Spend</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                \${(client.totalSpend || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Guest Count</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {client.guestCount || '--'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bookings</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {(client.events?.length || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Client Since</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '--'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              Upcoming Events
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: any) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{event.title || event.type}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString()}
                        {event.time && \` at \${event.time}\`}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {event.status || 'Confirmed'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No upcoming events
              </div>
            )}
          </div>
        </div>

        {/* Notes & Communication */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              Notes & Preferences
            </h3>
          </div>
          <div className="p-4">
            {client.notes ? (
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{client.notes}</p>
            ) : (
              <p className="text-gray-500 text-center py-4">No notes yet</p>
            )}

            {client.preferences && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {(client.preferences.split(',') || []).map((pref: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    >
                      {pref.trim()}
                    </span>
                  ))}
                </div>
              </div>
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
