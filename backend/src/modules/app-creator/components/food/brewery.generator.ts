/**
 * Brewery Component Generators
 *
 * Generates brewery-specific components:
 * - BreweryStats: Dashboard stats for brewery operations
 * - EventCalendarBrewery: Event calendar for brewery events
 * - TourCalendarBrewery: Tour scheduling calendar
 * - TourListToday: Today's scheduled tours list
 * - MemberProfileBrewery: Member/club profile view
 * - OrderListRecentBrewery: Recent orders list for brewery
 */

export interface BreweryOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate brewery stats dashboard component
 */
export function generateBreweryStats(options: BreweryOptions = {}): string {
  const { componentName = 'BreweryStats', endpoint = '/brewery/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, Beer, Users, DollarSign, Calendar, Package, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const statsConfig = [
  { key: 'todaySales', label: "Today's Sales", icon: 'DollarSign', color: 'green', type: 'currency' },
  { key: 'beersOnTap', label: 'Beers on Tap', icon: 'Beer', color: 'yellow', type: 'number' },
  { key: 'todayVisitors', label: "Today's Visitors", icon: 'Users', color: 'blue', type: 'number' },
  { key: 'upcomingTours', label: 'Tours Today', icon: 'Calendar', color: 'purple', type: 'number' },
  { key: 'batchesInProgress', label: 'Batches Brewing', icon: 'Thermometer', color: 'orange', type: 'number' },
  { key: 'lowStockBeers', label: 'Low Stock', icon: 'Package', color: 'red', type: 'number' },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
};

const iconMap: Record<string, React.FC<any>> = {
  DollarSign,
  Beer,
  Users,
  Calendar,
  Thermometer,
  Package,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['brewery-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch brewery stats:', err);
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

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {[...Array(6)].map((_, i) => (
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Brewery Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Beer className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsConfig.map((stat) => {
          const Icon = iconMap[stat.icon] || Loader2;
          const colors = colorClasses[stat.color] || colorClasses.blue;
          const value = stats?.[stat.key];
          const change = stats?.[stat.key + 'Change'];

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
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(change)}%
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
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate brewery event calendar component
 */
export function generateEventCalendarBrewery(options: BreweryOptions = {}): string {
  const { componentName = 'EventCalendarBrewery', endpoint = '/brewery/events' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users, Music, Loader2, X, Beer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  onEventClick?: (event: any) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ${componentName}: React.FC<${componentName}Props> = ({ className, onEventClick }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['brewery-events'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        return [];
      }
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

  const getEventsForDate = (date: Date) => {
    return events.filter((event: any) => {
      const eventDate = new Date(event.event_date || event.start_date || event.date);
      return eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'live_music': 'bg-purple-100 text-purple-700 border-purple-200',
      'tasting': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'release': 'bg-green-100 text-green-700 border-green-200',
      'trivia': 'bg-blue-100 text-blue-700 border-blue-200',
      'private': 'bg-gray-100 text-gray-700 border-gray-200',
      'festival': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[type?.toLowerCase()] || 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const handleEventClick = (event: any) => {
    if (onEventClick) onEventClick(event);
    else setSelectedEvent(event);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
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
            onClick={() => navigate('/brewery/events/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

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
              const dayEvents = getEventsForDate(day.date);
              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    !day.isCurrentMonth && 'bg-gray-50 dark:bg-gray-800/50',
                    idx % 7 === 6 && 'border-r-0'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                    isToday(day.date) && 'bg-amber-600 text-white',
                    !isToday(day.date) && !day.isCurrentMonth && 'text-gray-400'
                  )}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event: any, i: number) => (
                      <div
                        key={event.id || i}
                        onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                        className={cn('px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2', getEventTypeColor(event.event_type || event.type))}
                      >
                        {event.name || event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={cn('px-2 py-1 rounded text-xs font-medium', getEventTypeColor(selectedEvent.event_type || selectedEvent.type))}>
                  {selectedEvent.event_type || selectedEvent.type || 'Event'}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                  {selectedEvent.name || selectedEvent.title}
                </h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                {new Date(selectedEvent.event_date || selectedEvent.start_date || selectedEvent.date).toLocaleDateString()}
              </div>
              {(selectedEvent.start_time || selectedEvent.time) && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {selectedEvent.start_time || selectedEvent.time}
                  {selectedEvent.end_time && \` - \${selectedEvent.end_time}\`}
                </div>
              )}
              {selectedEvent.capacity && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  Capacity: {selectedEvent.attendees_count || 0} / {selectedEvent.capacity}
                </div>
              )}
              {selectedEvent.performer && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Music className="w-4 h-4" />
                  {selectedEvent.performer}
                </div>
              )}
              {selectedEvent.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`/brewery/events/\${selectedEvent.id}\`); setSelectedEvent(null); }}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                View Details
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
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
 * Generate brewery tour calendar component
 */
export function generateTourCalendarBrewery(options: BreweryOptions = {}): string {
  const { componentName = 'TourCalendarBrewery', endpoint = '/brewery/tours' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Clock, Users, Loader2, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  onTourClick?: (tour: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, onTourClick }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTour, setSelectedTour] = useState<any | null>(null);
  const [view, setView] = useState<'week' | 'day'>('week');

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['brewery-tours', currentDate.toISOString().split('T')[0]],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch tours:', err);
        return [];
      }
    },
  });

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

  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const getToursForSlot = (date: Date, time: string) => {
    return tours.filter((tour: any) => {
      const tourDate = new Date(tour.tour_date || tour.date);
      const tourTime = tour.tour_time || tour.time || '';
      return tourDate.getFullYear() === date.getFullYear() &&
        tourDate.getMonth() === date.getMonth() &&
        tourDate.getDate() === date.getDate() &&
        tourTime.startsWith(time.split(':')[0]);
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTourStatusColor = (tour: any) => {
    const spotsLeft = (tour.capacity || 20) - (tour.attendees_count || 0);
    if (tour.status === 'cancelled') return 'bg-red-100 text-red-700 border-red-300';
    if (spotsLeft <= 0) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (spotsLeft <= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const handleTourClick = (tour: any) => {
    if (onTourClick) onTourClick(tour);
    else setSelectedTour(tour);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Schedule</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() - 7);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                This Week
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() + 7);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate('/brewery/tours/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            <Plus className="w-4 h-4" />
            Schedule Tour
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 w-20">Time</th>
                {weekDays.map((day, idx) => (
                  <th key={idx} className={cn(
                    'py-3 px-2 text-center text-sm font-medium',
                    isToday(day) ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'text-gray-500'
                  )}>
                    <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</div>
                    <div className={cn(
                      'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm mt-1',
                      isToday(day) && 'bg-amber-600 text-white'
                    )}>
                      {day.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <td className="py-2 px-4 text-sm text-gray-500">{time}</td>
                  {weekDays.map((day, idx) => {
                    const slotTours = getToursForSlot(day, time);
                    return (
                      <td key={idx} className={cn(
                        'py-2 px-2 align-top',
                        isToday(day) && 'bg-amber-50/50 dark:bg-amber-900/10'
                      )}>
                        {slotTours.map((tour: any) => (
                          <div
                            key={tour.id}
                            onClick={() => handleTourClick(tour)}
                            className={cn(
                              'px-2 py-1 mb-1 text-xs rounded border cursor-pointer hover:opacity-80',
                              getTourStatusColor(tour)
                            )}
                          >
                            <div className="font-medium truncate">{tour.tour_name || tour.name || 'Brewery Tour'}</div>
                            <div className="flex items-center gap-1 mt-0.5 opacity-75">
                              <Users className="w-3 h-3" />
                              {tour.attendees_count || 0}/{tour.capacity || 20}
                            </div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Almost Full</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Full</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
          </div>
        </div>
      </div>

      {selectedTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedTour(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedTour.tour_name || selectedTour.name || 'Brewery Tour'}
              </h3>
              <button onClick={() => setSelectedTour(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {selectedTour.tour_time || selectedTour.time} ({selectedTour.duration || 60} mins)
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                {selectedTour.attendees_count || 0} / {selectedTour.capacity || 20} guests
              </div>
              {selectedTour.guide_name && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  Guide: {selectedTour.guide_name}
                </div>
              )}
              {selectedTour.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTour.notes}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`/brewery/tours/\${selectedTour.id}\`); setSelectedTour(null); }}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Manage Tour
              </button>
              <button
                onClick={() => setSelectedTour(null)}
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
 * Generate today's tours list component
 */
export function generateTourListToday(options: BreweryOptions = {}): string {
  const { componentName = 'TourListToday', endpoint = '/brewery/tours/today' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, Users, ChevronRight, MapPin, Beer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['brewery-tours-today'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch tours:', err);
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const getStatusBadge = (tour: any) => {
    const now = new Date();
    const tourTime = new Date();
    const [hours, minutes] = (tour.tour_time || tour.time || '12:00').split(':');
    tourTime.setHours(parseInt(hours), parseInt(minutes));

    if (tour.status === 'in_progress') {
      return { text: 'In Progress', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    }
    if (tour.status === 'completed') {
      return { text: 'Completed', class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
    }
    if (tour.status === 'cancelled') {
      return { text: 'Cancelled', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    }
    if (now > tourTime) {
      return { text: 'Completed', class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
    }
    return { text: 'Upcoming', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  };

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Beer className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Today's Tours</h3>
        </div>
        <Link to="/brewery/tours" className="text-sm text-amber-600 hover:text-amber-700">
          View All
        </Link>
      </div>

      {tours.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tours.map((tour: any) => {
            const status = getStatusBadge(tour);
            const spotsLeft = (tour.capacity || 20) - (tour.attendees_count || 0);

            return (
              <Link
                key={tour.id}
                to={\`/brewery/tours/\${tour.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tour.tour_time || tour.time}
                      </p>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', status.class)}>
                        {status.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{tour.tour_name || tour.name || 'Brewery Tour'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tour.attendees_count || 0}/{tour.capacity || 20} guests
                      </span>
                      {tour.guide_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {tour.guide_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {spotsLeft > 0 && spotsLeft <= 5 && (
                    <span className="text-xs text-amber-600 font-medium">{spotsLeft} spots left</span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <Beer className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No tours scheduled for today
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate brewery member profile component
 */
export function generateMemberProfileBrewery(options: BreweryOptions = {}): string {
  const { componentName = 'MemberProfileBrewery', endpoint = '/brewery/members' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, Phone, Calendar, ArrowLeft, Edit, Beer, Star, Gift, CreditCard, Clock, Award } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: member, isLoading } = useQuery({
    queryKey: ['brewery-member', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: visitHistory = [] } = useQuery({
    queryKey: ['brewery-member-visits', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/visits');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
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
        <p className="text-gray-500">Member not found</p>
      </div>
    );
  }

  const getMembershipColor = (tier: string) => {
    const colors: Record<string, string> = {
      'gold': 'from-yellow-400 to-amber-600',
      'silver': 'from-gray-300 to-gray-500',
      'bronze': 'from-orange-400 to-orange-700',
      'platinum': 'from-slate-300 to-slate-600',
    };
    return colors[tier?.toLowerCase()] || 'from-amber-500 to-amber-700';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="${endpoint}" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Link>
      </div>

      {/* Member Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={cn('h-24 bg-gradient-to-r', getMembershipColor(member.membership_tier))} />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-amber-600">
                    {(member.name || member.first_name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {member.name || \`\${member.first_name || ''} \${member.last_name || ''}\`.trim()}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <Award className="w-3 h-3" />
                    {member.membership_tier || 'Standard'} Member
                  </span>
                  <span className="text-sm text-gray-500">#{member.member_number || member.id}</span>
                </div>
              </div>
            </div>
            <Link
              to={\`${endpoint}/\${id}/edit\`}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pb-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-600">
              <Beer className="w-5 h-5" />
              {member.total_visits || 0}
            </div>
            <p className="text-sm text-gray-500">Total Visits</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
              <CreditCard className="w-5 h-5" />
              \${(member.total_spent || 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-600">
              <Star className="w-5 h-5" />
              {member.rewards_points || 0}
            </div>
            <p className="text-sm text-gray-500">Reward Points</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
              <Gift className="w-5 h-5" />
              {member.rewards_redeemed || 0}
            </div>
            <p className="text-sm text-gray-500">Rewards Redeemed</p>
          </div>
        </div>

        {/* Contact & Preferences */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            {member.email && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={\`mailto:\${member.email}\`} className="hover:text-amber-600">{member.email}</a>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={\`tel:\${member.phone}\`} className="hover:text-amber-600">{member.phone}</a>
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
            <h3 className="font-semibold text-gray-900 dark:text-white">Beer Preferences</h3>
            {member.favorite_styles && member.favorite_styles.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Favorite Styles</p>
                <div className="flex flex-wrap gap-2">
                  {member.favorite_styles.map((style: string) => (
                    <span key={style} className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {member.favorite_beers && member.favorite_beers.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Favorite Beers</p>
                <div className="flex flex-wrap gap-2">
                  {member.favorite_beers.map((beer: string) => (
                    <span key={beer} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      {beer}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visit History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Visits</h3>
          <Link to={\`${endpoint}/\${id}/visits\`} className="text-sm text-amber-600 hover:text-amber-700">
            View All
          </Link>
        </div>
        {visitHistory.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {visitHistory.slice(0, 5).map((visit: any) => (
              <div key={visit.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(visit.visit_date || visit.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {visit.check_in_time || 'N/A'} - {visit.check_out_time || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">\${(visit.amount_spent || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{visit.beers_ordered || 0} beers</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No visit history
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
 * Generate recent brewery orders list component
 */
export function generateOrderListRecentBrewery(options: BreweryOptions = {}): string {
  const { componentName = 'OrderListRecentBrewery', endpoint = '/brewery/orders' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Clock, ChevronRight, Beer, Package, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, limit = 10 }) => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['brewery-orders-recent', limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=\${limit}&sort=created_at:desc\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const statusConfig: Record<string, { color: string; icon: React.FC<any> }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
    processing: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Package },
    ready: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Beer },
    shipped: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck },
    delivered: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: Package },
    cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Clock },
  };

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
        <Link to="/brewery/orders" className="text-sm text-amber-600 hover:text-amber-700">
          View All
        </Link>
      </div>

      {orders.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order: any) => {
            const status = statusConfig[order.status?.toLowerCase()] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <Link
                key={order.id}
                to={\`/brewery/orders/\${order.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <Beer className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Order #{order.order_number || order.id?.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer_name || 'Walk-in'} - {order.items_count || order.items?.length || 0} items
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium text-green-600">\${(order.total || 0).toFixed(2)}</p>
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', status.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <Beer className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No recent orders
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
