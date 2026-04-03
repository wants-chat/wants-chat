/**
 * Coworking Space Management Component Generators
 *
 * Generates components for coworking space management including:
 * - CoworkingStats, BookingCalendarCoworking, BookingListCoworking
 * - MemberProfileCoworking, SpaceCalendar
 */

export interface CoworkingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCoworkingStats(options: CoworkingOptions = {}): string {
  const { componentName = 'CoworkingStats', endpoint = '/coworking/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, Calendar, DollarSign, TrendingUp, TrendingDown, Loader2, Coffee, Wifi, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['coworking-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch coworking stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 \${className || ''}\`}>
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

  const statItems = [
    { key: 'activeMembers', label: 'Active Members', icon: Users, color: 'blue', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'occupancyRate', label: 'Occupancy Rate', icon: Building2, color: 'green', format: (v: number) => \`\${v || 0}%\` },
    { key: 'availableDesks', label: 'Available Desks', icon: Coffee, color: 'purple', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'bookingsToday', label: 'Bookings Today', icon: Calendar, color: 'emerald', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'meetingRoomsInUse', label: 'Meeting Rooms in Use', icon: Building2, color: 'orange', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'checkInsToday', label: 'Check-ins Today', icon: Clock, color: 'yellow', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: DollarSign, color: 'indigo', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
    { key: 'newMembersThisMonth', label: 'New Members', icon: TrendingUp, color: 'red', format: (v: number) => v?.toLocaleString() || '0' },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  };

  return (
    <div className={\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 \${className || ''}\`}>
      {statItems.slice(0, 8).map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        const value = stats?.[stat.key];
        const change = stats?.[stat.key + 'Change'];

        return (
          <div
            key={stat.key}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={\`p-3 rounded-lg \${colors.bg}\`}>
                <Icon className={\`w-6 h-6 \${colors.icon}\`} />
              </div>
              {change !== undefined && (
                <div className={\`flex items-center gap-1 text-sm font-medium \${change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                  {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.format(value)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
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

export function generateBookingCalendarCoworking(options: CoworkingOptions = {}): string {
  const { componentName = 'BookingCalendarCoworking', endpoint = '/coworking/bookings/calendar' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Building2, Users, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface ${componentName}Props {
  spaceId?: string;
  onBookingClick?: (booking: any) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ spaceId, onBookingClick, onDateSelect, className }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['coworking-bookings', spaceId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
          ...(spaceId ? { space_id: spaceId } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        return [];
      }
    },
  });

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
    return bookings?.filter((booking: any) => {
      const bookingDate = new Date(booking.date || booking.start_date || booking.booking_date);
      return bookingDate.getFullYear() === date.getFullYear() &&
             bookingDate.getMonth() === date.getMonth() &&
             bookingDate.getDate() === date.getDate();
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const getBookingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      desk: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      meeting_room: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      private_office: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      event_space: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    };
    return colors[type?.toLowerCase()] || colors.desk;
  };

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Booking Calendar
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-gray-900 dark:text-white font-medium min-w-[150px] text-center">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <button
              onClick={() => navigate('/coworking/bookings/new')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dayBookings = getBookingsForDate(day.date);
            const hasBookings = dayBookings.length > 0;
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(day.date)}
                className={\`
                  min-h-[100px] p-2 rounded-lg cursor-pointer transition-all border
                  \${!day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 border-transparent' : 'border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'}
                  \${isToday(day.date) ? 'ring-2 ring-purple-500' : ''}
                  \${isSelected ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' : ''}
                  \${isWeekend(day.date) && day.isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}
                \`}
              >
                <div className={\`text-sm font-medium mb-1 \${isToday(day.date) ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}\`}>
                  {day.date.getDate()}
                </div>
                {hasBookings && (
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking: any, i: number) => (
                      <div
                        key={i}
                        onClick={(e) => { e.stopPropagation(); onBookingClick?.(booking); }}
                        className={\`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer \${getBookingTypeColor(booking.space_type || booking.type)}\`}
                      >
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.start_time || booking.time || '9:00'}
                        </span>
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayBookings.length - 3} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Hot Desk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Meeting Room</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Private Office</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Event Space</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBookingListCoworking(options: CoworkingOptions = {}): string {
  const { componentName = 'BookingListCoworking', endpoint = '/coworking/bookings' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Building2, Clock, User, Calendar, Loader2, Search, Filter, ChevronRight, MapPin, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('today');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['coworking-bookings-list', filter, searchTerm],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.set('filter', filter);
        if (searchTerm) params.set('search', searchTerm);
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        return [];
      }
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      checked_in: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const getSpaceTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'meeting_room':
        return <Users className="w-5 h-5" />;
      case 'private_office':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Bookings
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-64"
              />
            </div>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {(['all', 'today', 'upcoming', 'past'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={\`px-3 py-2 text-sm capitalize \${
                    filter === f ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }\`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {bookings?.map((booking: any) => (
          <div
            key={booking.id}
            onClick={() => navigate(\`/coworking/bookings/\${booking.id}\`)}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  {getSpaceTypeIcon(booking.space_type || booking.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {booking.space_name || booking.spaceName || 'Workspace'}
                    </h4>
                    <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${getStatusColor(booking.status)}\`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {booking.member_name || booking.memberName || booking.booked_by}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.date || booking.booking_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {booking.start_time} - {booking.end_time}
                    </span>
                    {booking.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {booking.location}
                      </span>
                    )}
                  </div>
                  {booking.attendees && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4 inline mr-1" />
                      {booking.attendees} attendees
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {booking.amount && (
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">\${booking.amount}</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        ))}

        {(!bookings || bookings.length === 0) && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMemberProfileCoworking(options: CoworkingOptions = {}): string {
  const { componentName = 'MemberProfileCoworking', endpoint = '/coworking/members' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Building2, Calendar, ArrowLeft, Edit, CreditCard, History, Clock, Briefcase, Star, Wifi, Coffee, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  memberId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ memberId: propMemberId, className }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const memberId = propMemberId || paramId;

  const { data: member, isLoading } = useQuery({
    queryKey: ['coworking-member', memberId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${memberId}\`);
      return response?.data || response;
    },
    enabled: !!memberId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Member not found</p>
      </div>
    );
  }

  const recentBookings = member.recent_bookings || member.recentBookings || [];

  const getMembershipColor = (type: string) => {
    const colors: Record<string, string> = {
      basic: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      professional: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      enterprise: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[type?.toLowerCase()] || colors.basic;
  };

  return (
    <div className={\`max-w-4xl mx-auto \${className || ''}\`}>
      <div className="mb-6">
        <Link to="${endpoint}" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-600">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                {member.avatar_url || member.photo ? (
                  <img src={member.avatar_url || member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {member.name || \`\${member.first_name || ''} \${member.last_name || ''}\`.trim()}
                </h1>
                {member.company && (
                  <p className="text-white/80 flex items-center gap-1 mt-1">
                    <Briefcase className="w-4 h-4" /> {member.company}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={\`px-3 py-1 rounded-full text-xs font-medium \${getMembershipColor(member.membership_type)}\`}>
                    {member.membership_type || 'Basic'} Member
                  </span>
                  {member.is_active && (
                    <span className="px-2 py-1 bg-green-400 text-green-900 rounded-full text-xs">Active</span>
                  )}
                </div>
              </div>
            </div>
            <Link
              to={\`${endpoint}/\${memberId}/edit\`}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" /> Contact Information
            </h3>
            {member.email && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={\`mailto:\${member.email}\`} className="hover:text-purple-600">{member.email}</a>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={\`tel:\${member.phone}\`} className="hover:text-purple-600">{member.phone}</a>
              </div>
            )}
            {member.member_since && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Member since {new Date(member.member_since).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Workspace Details
            </h3>
            {member.assigned_desk && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span>Assigned Desk: {member.assigned_desk}</span>
              </div>
            )}
            {member.preferred_location && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{member.preferred_location}</span>
              </div>
            )}
            {member.access_hours && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>{member.access_hours} Access</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Star className="w-5 h-5" /> Membership Benefits
          </h3>
          <div className="flex flex-wrap gap-3">
            {(member.benefits || ['WiFi', 'Coffee', 'Meeting Room Credits', 'Printing']).map((benefit: string, idx: number) => (
              <span key={idx} className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm flex items-center gap-2">
                {benefit.toLowerCase().includes('wifi') && <Wifi className="w-4 h-4" />}
                {benefit.toLowerCase().includes('coffee') && <Coffee className="w-4 h-4" />}
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <History className="w-5 h-5" /> Usage Statistics
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{member.total_bookings || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{member.total_hours || 0}h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hours Used</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{member.meeting_room_hours || 0}h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Meeting Room</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{member.credits_remaining || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Credits Left</div>
            </div>
          </div>
        </div>

        {recentBookings.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" /> Recent Bookings
            </h3>
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map((booking: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {booking.space_name || booking.spaceName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(booking.date).toLocaleDateString()} | {booking.start_time} - {booking.end_time}
                      </div>
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs \${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }\`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {member.subscription_expires && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-yellow-600" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Subscription</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Expires: {new Date(member.subscription_expires).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                Renew Membership
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSpaceCalendar(options: CoworkingOptions = {}): string {
  const { componentName = 'SpaceCalendar', endpoint = '/coworking/spaces/calendar' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Building2, Clock, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onSlotClick?: (space: any, time: string, date: Date) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSlotClick, className }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSpace, setSelectedSpace] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['space-calendar', currentDate.toISOString().split('T')[0], selectedSpace],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          date: currentDate.toISOString().split('T')[0],
          ...(selectedSpace !== 'all' ? { space_id: selectedSpace } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return response?.data || response || { spaces: [], bookings: [] };
      } catch (err) {
        console.error('Failed to fetch space calendar:', err);
        return { spaces: [], bookings: [] };
      }
    },
  });

  const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatHour = (hour: number) => {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return \`\${displayHour}:00 \${suffix}\`;
  };

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isSlotBooked = (spaceId: string, hour: number) => {
    return data?.bookings?.some((booking: any) => {
      if ((booking.space_id || booking.spaceId) !== spaceId) return false;
      const startHour = parseInt(booking.start_time?.split(':')[0] || '0');
      const endHour = parseInt(booking.end_time?.split(':')[0] || '0');
      return hour >= startHour && hour < endHour;
    });
  };

  const getBookingForSlot = (spaceId: string, hour: number) => {
    return data?.bookings?.find((booking: any) => {
      if ((booking.space_id || booking.spaceId) !== spaceId) return false;
      const startHour = parseInt(booking.start_time?.split(':')[0] || '0');
      return hour === startHour;
    });
  };

  const getBookingDuration = (booking: any) => {
    const startHour = parseInt(booking.start_time?.split(':')[0] || '0');
    const endHour = parseInt(booking.end_time?.split(':')[0] || '0');
    return endHour - startHour;
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  const spaces = data?.spaces || [];

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Space Availability
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={selectedSpace}
              onChange={(e) => setSelectedSpace(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Spaces</option>
              {spaces.map((space: any) => (
                <option key={space.id} value={space.id}>{space.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <button onClick={navigatePrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={goToToday}
                className={\`px-3 py-1.5 text-sm rounded-lg \${isToday ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
              >
                Today
              </button>
              <button onClick={navigateNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="text-gray-900 dark:text-white font-medium">
              {WEEKDAYS[currentDate.getDay()]}, {currentDate.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50">
              <th className="sticky left-0 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-48">
                Space
              </th>
              {HOURS.map((hour) => (
                <th
                  key={hour}
                  className="px-2 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-w-[80px]"
                >
                  {formatHour(hour)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spaces.map((space: any) => (
              <tr key={space.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="sticky left-0 bg-white dark:bg-gray-800 px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{space.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {space.capacity} people
                      </div>
                    </div>
                  </div>
                </td>
                {HOURS.map((hour) => {
                  const booked = isSlotBooked(space.id, hour);
                  const booking = getBookingForSlot(space.id, hour);
                  const duration = booking ? getBookingDuration(booking) : 1;

                  if (booked && !booking) {
                    return null; // This slot is part of a longer booking
                  }

                  return (
                    <td
                      key={hour}
                      colSpan={booking ? duration : 1}
                      onClick={() => !booked && onSlotClick?.(space, formatHour(hour), currentDate)}
                      className={\`px-1 py-2 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 \${
                        !booked ? 'cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20' : ''
                      }\`}
                    >
                      {booking ? (
                        <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded px-2 py-1 text-xs">
                          <div className="font-medium truncate">{booking.member_name || booking.booked_by || 'Booked'}</div>
                          <div className="text-[10px] opacity-75">{booking.start_time} - {booking.end_time}</div>
                        </div>
                      ) : (
                        <div className="h-8 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {spaces.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No spaces configured
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
