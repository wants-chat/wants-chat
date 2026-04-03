/**
 * Campground Management Component Generators
 *
 * Generates components for campground/RV park management including:
 * - CampgroundStats, ReservationCalendarCampground, ActivityCalendarCampground
 * - SiteAvailability, SiteSchedule
 */

export interface CampgroundOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCampgroundStats(options: CampgroundOptions = {}): string {
  const { componentName = 'CampgroundStats', endpoint = '/campground/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tent, Users, Calendar, DollarSign, TrendingUp, TrendingDown, Loader2, MapPin, Sun, Moon } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['campground-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch campground stats:', err);
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
    { key: 'occupiedSites', label: 'Occupied Sites', icon: Tent, color: 'green', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'availableSites', label: 'Available Sites', icon: MapPin, color: 'blue', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'checkInsToday', label: 'Check-ins Today', icon: Sun, color: 'yellow', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'checkOutsToday', label: 'Check-outs Today', icon: Moon, color: 'purple', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'totalGuests', label: 'Total Guests', icon: Users, color: 'emerald', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'upcomingReservations', label: 'Upcoming Reservations', icon: Calendar, color: 'orange', format: (v: number) => v?.toLocaleString() || '0' },
    { key: 'todayRevenue', label: "Today's Revenue", icon: DollarSign, color: 'indigo', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
    { key: 'occupancyRate', label: 'Occupancy Rate', icon: TrendingUp, color: 'red', format: (v: number) => \`\${v || 0}%\` },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
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

export function generateReservationCalendarCampground(options: CampgroundOptions = {}): string {
  const { componentName = 'ReservationCalendarCampground', endpoint = '/campground/reservations/calendar' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Tent, Users, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  siteId?: string;
  onReservationClick?: (reservation: any) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ siteId, onReservationClick, onDateSelect, className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['campground-reservations', siteId, currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
          ...(siteId ? { site_id: siteId } : {}),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
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

  const getReservationsForDate = (date: Date) => {
    return reservations?.filter((res: any) => {
      const checkIn = new Date(res.check_in || res.checkIn || res.start_date || res.arrival);
      const checkOut = new Date(res.check_out || res.checkOut || res.end_date || res.departure);
      return date >= checkIn && date <= checkOut;
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Tent className="w-5 h-5 text-green-600" />
            Reservation Calendar
          </h3>
          <div className="flex items-center gap-2">
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
            const dayReservations = getReservationsForDate(day.date);
            const hasReservations = dayReservations.length > 0;
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(day.date)}
                className={\`
                  min-h-[90px] p-2 rounded-lg cursor-pointer transition-all border
                  \${!day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 border-transparent' : 'border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'}
                  \${isToday(day.date) ? 'ring-2 ring-green-500' : ''}
                  \${isSelected ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : ''}
                \`}
              >
                <div className={\`text-sm font-medium mb-1 \${isToday(day.date) ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}\`}>
                  {day.date.getDate()}
                </div>
                {hasReservations && (
                  <div className="space-y-1">
                    {dayReservations.slice(0, 2).map((res: any, i: number) => (
                      <div
                        key={i}
                        onClick={(e) => { e.stopPropagation(); onReservationClick?.(res); }}
                        className={\`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer \${
                          res.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                          res.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }\`}
                      >
                        {res.site_number || res.siteNumber || 'Site'}: {res.guest_name || res.guestName || 'Guest'}
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayReservations.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Checked In</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateActivityCalendarCampground(options: CampgroundOptions = {}): string {
  const { componentName = 'ActivityCalendarCampground', endpoint = '/campground/activities' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Calendar, Clock, Users, MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onActivityClick?: (activity: any) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onActivityClick, className }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');

  const { data: activities, isLoading } = useQuery({
    queryKey: ['campground-activities', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          month: String(currentDate.getMonth() + 1),
          year: String(currentDate.getFullYear()),
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        return [];
      }
    },
  });

  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const getActivitiesForDate = (date: Date) => {
    return activities?.filter((activity: any) => {
      const activityDate = new Date(activity.date || activity.start_date || activity.scheduled_at);
      return activityDate.getFullYear() === date.getFullYear() &&
             activityDate.getMonth() === date.getMonth() &&
             activityDate.getDate() === date.getDate();
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hiking: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      swimming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      campfire: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      fishing: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
      workshop: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      kids: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
      tour: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const navigatePrev = () => {
    if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Activity Calendar
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('week')}
                className={\`px-3 py-1.5 text-sm \${view === 'week' ? 'bg-green-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
              >
                Week
              </button>
              <button
                onClick={() => setView('month')}
                className={\`px-3 py-1.5 text-sm \${view === 'month' ? 'bg-green-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
              >
                Month
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={navigatePrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-gray-900 dark:text-white font-medium min-w-[150px] text-center">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button onClick={navigateNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <button
              onClick={() => navigate('/campground/activities/new')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const dayActivities = getActivitiesForDate(day);

            return (
              <div key={idx} className="min-h-[200px]">
                <div className={\`text-center p-2 rounded-t-lg \${isToday(day) ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}\`}>
                  <div className="text-xs font-medium">{WEEKDAYS[day.getDay()].slice(0, 3)}</div>
                  <div className="text-lg font-bold">{day.getDate()}</div>
                </div>
                <div className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg p-2 space-y-2 min-h-[150px]">
                  {dayActivities.map((activity: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => onActivityClick?.(activity)}
                      className={\`p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity \${getActivityTypeColor(activity.type || activity.activity_type)}\`}
                    >
                      <div className="font-medium text-sm truncate">{activity.name || activity.title}</div>
                      <div className="flex items-center gap-2 text-xs mt-1 opacity-75">
                        <Clock className="w-3 h-3" />
                        {activity.time || activity.start_time || '9:00 AM'}
                      </div>
                      {activity.location && (
                        <div className="flex items-center gap-1 text-xs mt-1 opacity-75">
                          <MapPin className="w-3 h-3" />
                          {activity.location}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayActivities.length === 0 && (
                    <div className="text-center text-gray-400 dark:text-gray-500 text-xs py-4">
                      No activities
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Activity Types:</span>
          {['hiking', 'swimming', 'campfire', 'fishing', 'workshop', 'kids', 'tour'].map((type) => (
            <span key={type} className={\`px-2 py-1 rounded capitalize \${getActivityTypeColor(type)}\`}>
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSiteAvailability(options: CampgroundOptions = {}): string {
  const { componentName = 'SiteAvailability', endpoint = '/campground/sites/availability' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tent, CheckCircle, XCircle, Clock, Wrench, Loader2, Filter, MapPin, Zap, Droplets, Wifi } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onSiteClick?: (site: any) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSiteClick, className }) => {
  const [filterType, setFilterType] = useState<string>('');
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);

  const { data: sites, isLoading } = useQuery({
    queryKey: ['campground-sites', filterType, filterAmenities],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filterType) params.set('type', filterType);
        if (filterAmenities.length > 0) params.set('amenities', filterAmenities.join(','));
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch site availability:', err);
        return [];
      }
    },
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; bg: string; text: string; label: string }> = {
      available: { icon: CheckCircle, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Available' },
      occupied: { icon: Tent, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Occupied' },
      reserved: { icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Reserved' },
      maintenance: { icon: Wrench, bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', label: 'Maintenance' },
    };
    return configs[status?.toLowerCase()] || configs.available;
  };

  const siteTypes = ['tent', 'rv', 'cabin', 'glamping', 'group'];
  const amenityOptions = [
    { id: 'electric', label: 'Electric', icon: Zap },
    { id: 'water', label: 'Water', icon: Droplets },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
  ];

  const toggleAmenity = (amenity: string) => {
    setFilterAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const statusCounts = sites?.reduce((acc: Record<string, number>, site: any) => {
    const status = site.status?.toLowerCase() || 'available';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      <div className="flex flex-wrap gap-4">
        {['available', 'occupied', 'reserved', 'maintenance'].map((status) => {
          const config = getStatusConfig(status);
          const Icon = config.icon;
          return (
            <div key={status} className={\`flex items-center gap-3 px-4 py-3 rounded-lg \${config.bg}\`}>
              <Icon className={\`w-5 h-5 \${config.text}\`} />
              <div>
                <div className={\`text-xl font-bold \${config.text}\`}>{statusCounts[status] || 0}</div>
                <div className={\`text-sm \${config.text}\`}>{config.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Site Types</option>
            {siteTypes.map((type) => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            {amenityOptions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => toggleAmenity(id)}
                className={\`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors \${
                  filterAmenities.includes(id)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }\`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sites?.map((site: any) => {
            const config = getStatusConfig(site.status);
            const Icon = config.icon;

            return (
              <div
                key={site.id || site.site_number}
                onClick={() => onSiteClick?.(site)}
                className={\`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg \${config.bg} border-transparent hover:border-green-400\`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={\`text-lg font-bold \${config.text}\`}>
                    {site.site_number || site.number || site.name}
                  </span>
                  <Icon className={\`w-5 h-5 \${config.text}\`} />
                </div>
                <div className={\`text-sm capitalize mb-2 \${config.text}\`}>
                  {site.site_type || site.type || 'Standard'}
                </div>
                <div className="flex items-center gap-2">
                  {site.electric && <Zap className="w-4 h-4 text-yellow-500" />}
                  {site.water && <Droplets className="w-4 h-4 text-blue-500" />}
                  {site.wifi && <Wifi className="w-4 h-4 text-purple-500" />}
                </div>
                {site.guest_name && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                    {site.guest_name}
                  </div>
                )}
                {site.price && (
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                    \${site.price}/night
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {(!sites || sites.length === 0) && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No sites found matching your filters
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSiteSchedule(options: CampgroundOptions = {}): string {
  const { componentName = 'SiteSchedule', endpoint = '/campground/sites/schedule' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Tent, Users, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onReservationClick?: (reservation: any) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onReservationClick, className }) => {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay());
    return today;
  });

  const { data, isLoading } = useQuery({
    queryKey: ['site-schedule', startDate.toISOString()],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          start_date: startDate.toISOString().split('T')[0],
        });
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return response?.data || response || { sites: [], reservations: [] };
      } catch (err) {
        console.error('Failed to fetch site schedule:', err);
        return { sites: [], reservations: [] };
      }
    },
  });

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      result.push(day);
    }
    return result;
  }, [startDate]);

  const getReservationsForSiteAndDate = (siteId: string, date: Date) => {
    return data?.reservations?.filter((res: any) => {
      if ((res.site_id || res.siteId) !== siteId) return false;
      const checkIn = new Date(res.check_in || res.checkIn || res.start_date);
      const checkOut = new Date(res.check_out || res.checkOut || res.end_date);
      return date >= checkIn && date < checkOut;
    }) || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const formatDateHeader = (date: Date) => {
    return \`\${WEEKDAYS[date.getDay()]} \${date.getDate()}\`;
  };

  const navigatePrev = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() - 7);
    setStartDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + 7);
    setStartDate(newDate);
  };

  if (isLoading) {
    return (
      <div className={\`flex items-center justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const sites = data?.sites || [];

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Site Schedule (2 Weeks)
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={navigatePrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[180px] text-center">
            {days[0].toLocaleDateString()} - {days[days.length - 1].toLocaleDateString()}
          </span>
          <button onClick={navigateNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50">
              <th className="sticky left-0 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-32">
                Site
              </th>
              {days.map((day, idx) => (
                <th
                  key={idx}
                  className={\`px-2 py-3 text-center text-xs font-medium border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-w-[70px] \${
                    isToday(day) ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                  }\`}
                >
                  {formatDateHeader(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sites.map((site: any) => (
              <tr key={site.id || site.site_number} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="sticky left-0 bg-white dark:bg-gray-800 px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Tent className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900 dark:text-white">{site.site_number || site.number}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{site.site_type || site.type}</div>
                </td>
                {days.map((day, idx) => {
                  const reservations = getReservationsForSiteAndDate(site.id || site.site_number, day);
                  const hasReservation = reservations.length > 0;
                  const reservation = reservations[0];

                  return (
                    <td
                      key={idx}
                      onClick={() => hasReservation && onReservationClick?.(reservation)}
                      className={\`px-1 py-2 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 \${
                        hasReservation ? 'cursor-pointer' : ''
                      } \${isToday(day) ? 'bg-green-50 dark:bg-green-900/10' : ''}\`}
                    >
                      {hasReservation ? (
                        <div className={\`text-xs px-1 py-1 rounded \${
                          reservation.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                          reservation.status === 'checked_in' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }\`}>
                          <div className="truncate">{reservation.guest_name || reservation.guestName || 'Reserved'}</div>
                        </div>
                      ) : (
                        <div className="w-full h-6 bg-gray-50 dark:bg-gray-700/30 rounded" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {sites.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No sites found
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Checked In</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/40 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 dark:bg-gray-700/30 rounded" />
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
