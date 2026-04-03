/**
 * Calendar Events Generator
 *
 * Generates calendar event-related components:
 * - EventCalendar: Full calendar view with events
 * - EventRegistrations: List of event registrations
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface EventCalendarOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showCreateButton?: boolean;
  showFilters?: boolean;
  views?: ('month' | 'week' | 'day' | 'agenda')[];
  defaultView?: 'month' | 'week' | 'day' | 'agenda';
}

export interface EventRegistrationsOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showStatus?: boolean;
  showActions?: boolean;
  showTicketInfo?: boolean;
}

/**
 * Generate an EventCalendar component
 */
export function generateEventCalendar(options: EventCalendarOptions = {}): string {
  const {
    componentName = 'EventCalendar',
    entity = 'event',
    showCreateButton = true,
    showFilters = true,
    views = ['month', 'week', 'day', 'agenda'],
    defaultView = 'month',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || `/${tableName}`;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  List,
  Grid,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

type ViewType = ${views.map(v => `'${v}'`).join(' | ')};

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  attendees?: number;
  maxAttendees?: number;
  color?: string;
  category?: string;
  isAllDay?: boolean;
}

interface ${componentName}Props {
  events?: Event[];
  className?: string;
  onEventClick?: (event: Event) => void;
  onDateClick?: (date: Date) => void;
  onCreate?: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EVENT_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 border-l-blue-500 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-700 border-l-green-500 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-700 border-l-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-700 border-l-red-500 dark:bg-red-900/30 dark:text-red-400',
  purple: 'bg-purple-100 text-purple-700 border-l-purple-500 dark:bg-purple-900/30 dark:text-purple-400',
  pink: 'bg-pink-100 text-pink-700 border-l-pink-500 dark:bg-pink-900/30 dark:text-pink-400',
  orange: 'bg-orange-100 text-orange-700 border-l-orange-500 dark:bg-orange-900/30 dark:text-orange-400',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  events: propEvents,
  className,
  onEventClick,
  onDateClick,
  onCreate,
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('${defaultView}');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const { data: fetchedEvents, isLoading } = useQuery({
    queryKey: ['${queryKey}', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?month=\${currentDate.getMonth() + 1}&year=\${currentDate.getFullYear()}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        return [];
      }
    },
    enabled: !propEvents,
  });

  const events = propEvents || fetchedEvents || [];

  const filteredEvents = useMemo(() => {
    if (!categoryFilter) return events;
    return events.filter((e: Event) => e.category === categoryFilter);
  }, [events, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(events.map((e: Event) => e.category).filter(Boolean));
    return Array.from(cats);
  }, [events]);

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
    return filteredEvents.filter((event: Event) => {
      const eventStart = new Date(event.startDate);
      return (
        eventStart.getFullYear() === date.getFullYear() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getDate() === date.getDate()
      );
    });
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return filteredEvents
      .filter((e: Event) => new Date(e.startDate) >= now)
      .sort((a: Event, b: Event) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 10);
  }, [filteredEvents]);

  const navigatePrev = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
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

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      setSelectedEvent(event);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

          <div className="flex items-center gap-3">
            {/* View Selector */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              ${views.map(v => `<button
                onClick={() => setView('${v}')}
                className={cn(
                  'px-3 py-1.5 text-sm capitalize',
                  view === '${v}' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                ${v}
              </button>`).join('\n              ')}
            </div>

            ${showFilters ? `<button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-2 rounded-lg border transition-colors',
                showFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Filter className="w-5 h-5" />
            </button>` : ''}

            ${showCreateButton ? `<button
              onClick={onCreate || (() => navigate('/${tableName}/new'))}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>` : ''}
          </div>
        </div>

        ${showFilters ? `{/* Filters */}
        {showFilters && categories.length > 0 && (
          <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All</option>
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {categoryFilter && (
              <button
                onClick={() => setCategoryFilter('')}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}` : ''}

        {/* Calendar / Agenda View */}
        {view === 'agenda' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingEvents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No upcoming events</div>
              ) : (
                upcomingEvents.map((event: Event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Date(event.startDate).getDate()}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">
                        {MONTHS[new Date(event.startDate).getMonth()].slice(0, 3)}
                      </div>
                    </div>
                    <div className={cn('w-1 self-stretch rounded-full', EVENT_COLORS[event.color || 'blue']?.split(' ')[0] || 'bg-blue-500')} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(event.startDate)}
                          {event.endDate && <> - {formatTime(event.endDate)}</>}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        )}
                        {event.attendees !== undefined && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendees}{event.maxAttendees && \`/\${event.maxAttendees}\`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
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
                const dayEvents = getEventsForDate(day.date);
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
                    <div className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                      isToday(day.date) && 'bg-blue-600 text-white',
                      !isToday(day.date) && !day.isCurrentMonth && 'text-gray-400'
                    )}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event: Event, i: number) => (
                        <div
                          key={event.id || i}
                          onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                          className={cn(
                            'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2',
                            EVENT_COLORS[event.color || 'blue'] || EVENT_COLORS.blue
                          )}
                        >
                          {event.title}
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
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                {new Date(selectedEvent.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {formatTime(selectedEvent.startDate)}
                {selectedEvent.endDate && <> - {formatTime(selectedEvent.endDate)}</>}
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {selectedEvent.location}
                </div>
              )}
              {selectedEvent.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`/${tableName}/\${selectedEvent.id}\`); setSelectedEvent(null); }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
 * Generate an EventRegistrations component
 */
export function generateEventRegistrations(options: EventRegistrationsOptions = {}): string {
  const {
    componentName = 'EventRegistrations',
    entity = 'registration',
    showStatus = true,
    showActions = true,
    showTicketInfo = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || `/${tableName}`;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Ticket,
  User,
  Calendar,
  MoreVertical,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Registration {
  id: string;
  eventId: string;
  eventName?: string;
  eventDate?: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  ticketType?: string;
  ticketQuantity?: number;
  ticketPrice?: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'waitlist' | 'attended';
  registeredAt: string;
  checkInAt?: string;
}

interface ${componentName}Props {
  registrations?: Registration[];
  eventId?: string;
  className?: string;
  onRegistrationClick?: (registration: Registration) => void;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  waitlist: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  attended: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  registrations: propRegistrations,
  eventId,
  className,
  onRegistrationClick,
}) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  const { data: fetchedRegistrations, isLoading } = useQuery({
    queryKey: ['${queryKey}', eventId],
    queryFn: async () => {
      try {
        const url = eventId ? \`${endpoint}?eventId=\${eventId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch registrations:', err);
        return [];
      }
    },
    enabled: !propRegistrations,
  });

  const registrations = propRegistrations || fetchedRegistrations || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(\`${endpoint}/\${id}\`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const filteredRegistrations = registrations.filter((reg: Registration) => {
    const matchesSearch = !searchQuery ||
      reg.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Event', 'Ticket', 'Quantity', 'Status', 'Registered At'],
      ...filteredRegistrations.map((r: Registration) => [
        r.userName,
        r.userEmail,
        r.eventName || '',
        r.ticketType || '',
        r.ticketQuantity || 1,
        r.status,
        new Date(r.registeredAt).toLocaleDateString(),
      ]),
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
    setOpenMenu(null);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registrations</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search registrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="waitlist">Waitlist</option>
              <option value="attended">Attended</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['confirmed', 'pending', 'waitlist', 'attended', 'cancelled'].map((status) => {
            const count = registrations.filter((r: Registration) => r.status === status).length;
            return (
              <div
                key={status}
                onClick={() => setStatusFilter(status === statusFilter ? '' : status)}
                className={cn(
                  'p-4 rounded-lg cursor-pointer transition-colors border',
                  statusFilter === status
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status}</div>
              </div>
            );
          })}
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredRegistrations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No registrations found</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRegistrations.map((registration: Registration) => (
                <div
                  key={registration.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {registration.userAvatar ? (
                        <img
                          src={registration.userAvatar}
                          alt={registration.userName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {registration.userName}
                        </h4>
                        ${showStatus ? `<span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', STATUS_STYLES[registration.status])}>
                          {registration.status}
                        </span>` : ''}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{registration.userEmail}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        {registration.eventName && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {registration.eventName}
                          </span>
                        )}
                        ${showTicketInfo ? `{registration.ticketType && (
                          <span className="flex items-center gap-1">
                            <Ticket className="w-3 h-3" />
                            {registration.ticketType} x{registration.ticketQuantity || 1}
                          </span>
                        )}` : ''}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(registration.registeredAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    ${showActions ? `{/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.location.href = \`mailto:\${registration.userEmail}\`}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Send email"
                      >
                        <Mail className="w-4 h-4 text-gray-500" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === registration.id ? null : registration.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {openMenu === registration.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                              <button
                                onClick={() => handleStatusChange(registration.id, 'confirmed')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Mark Confirmed
                              </button>
                              <button
                                onClick={() => handleStatusChange(registration.id, 'attended')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                Mark Attended
                              </button>
                              <button
                                onClick={() => handleStatusChange(registration.id, 'cancelled')}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel Registration
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate calendar event components for a specific domain
 */
export function generateCalendarEventComponents(domain: string): { calendar: string; registrations: string } {
  const pascalDomain = pascalCase(domain);

  return {
    calendar: generateEventCalendar({
      componentName: `${pascalDomain}EventCalendar`,
      entity: domain,
    }),
    registrations: generateEventRegistrations({
      componentName: `${pascalDomain}EventRegistrations`,
      entity: `${domain}Registration`,
    }),
  };
}
