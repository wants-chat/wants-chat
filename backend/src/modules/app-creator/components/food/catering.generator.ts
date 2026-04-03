/**
 * Catering Component Generators
 *
 * Generates catering-specific components:
 * - CateringStats: Dashboard stats for catering operations
 * - EventCalendarCatering: Event calendar for catering bookings
 * - ClientProfileCatering: Client profile view for catering clients
 */

export interface CateringOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate catering stats dashboard component
 */
export function generateCateringStats(options: CateringOptions = {}): string {
  const { componentName = 'CateringStats', endpoint = '/catering/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, Calendar, DollarSign, Users, Utensils, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const statsConfig = [
  { key: 'upcomingEvents', label: 'Upcoming Events', icon: 'Calendar', color: 'blue', type: 'number' },
  { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: 'DollarSign', color: 'green', type: 'currency' },
  { key: 'totalGuests', label: 'Guests This Month', icon: 'Users', color: 'purple', type: 'number' },
  { key: 'activeQuotes', label: 'Active Quotes', icon: 'Clock', color: 'yellow', type: 'number' },
  { key: 'eventsCompleted', label: 'Events Completed', icon: 'CheckCircle', color: 'emerald', type: 'number' },
  { key: 'averageEventSize', label: 'Avg Event Size', icon: 'Utensils', color: 'orange', type: 'number' },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
};

const iconMap: Record<string, React.FC<any>> = {
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  Utensils,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['catering-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch catering stats:', err);
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Catering Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Utensils className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
 * Generate catering event calendar component
 */
export function generateEventCalendarCatering(options: CateringOptions = {}): string {
  const { componentName = 'EventCalendarCatering', endpoint = '/catering/events' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users, MapPin, Loader2, X, Utensils, DollarSign } from 'lucide-react';
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
    queryKey: ['catering-events'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch catering events:', err);
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
      const eventDate = new Date(event.event_date || event.date);
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

  const getEventTypeColor = (type: string, status: string) => {
    if (status === 'confirmed') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';

    const colors: Record<string, string> = {
      'wedding': 'bg-pink-100 text-pink-700 border-pink-200',
      'corporate': 'bg-blue-100 text-blue-700 border-blue-200',
      'birthday': 'bg-purple-100 text-purple-700 border-purple-200',
      'graduation': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'holiday': 'bg-red-100 text-red-700 border-red-200',
      'private': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[type?.toLowerCase()] || 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const handleEventClick = (event: any) => {
    if (onEventClick) onEventClick(event);
    else setSelectedEvent(event);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
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
            onClick={() => navigate('/catering/events/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            New Event
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
                    'min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    !day.isCurrentMonth && 'bg-gray-50 dark:bg-gray-800/50',
                    idx % 7 === 6 && 'border-r-0'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                    isToday(day.date) && 'bg-emerald-600 text-white',
                    !isToday(day.date) && !day.isCurrentMonth && 'text-gray-400'
                  )}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event: any, i: number) => (
                      <div
                        key={event.id || i}
                        onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                        className={cn('px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2', getEventTypeColor(event.event_type || event.type, event.status))}
                      >
                        <div className="font-medium truncate">{event.client_name || event.name}</div>
                        <div className="text-[10px] opacity-75">{event.guest_count || 0} guests</div>
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

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-pink-500" />
            <span className="text-gray-600 dark:text-gray-400">Wedding</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Corporate</span>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={cn('px-2 py-1 rounded text-xs font-medium', getEventTypeColor(selectedEvent.event_type || selectedEvent.type, selectedEvent.status))}>
                  {selectedEvent.event_type || selectedEvent.type || 'Event'}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                  {selectedEvent.event_name || selectedEvent.name || 'Catering Event'}
                </h3>
                <p className="text-sm text-gray-500">{selectedEvent.client_name}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                {new Date(selectedEvent.event_date || selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              {selectedEvent.event_time && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {selectedEvent.event_time}
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                {selectedEvent.guest_count || 0} guests
              </div>
              {selectedEvent.venue && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {selectedEvent.venue}
                </div>
              )}
              {selectedEvent.total_amount && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  \${selectedEvent.total_amount.toLocaleString()}
                </div>
              )}
              {selectedEvent.menu_type && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Utensils className="w-4 h-4" />
                  {selectedEvent.menu_type}
                </div>
              )}
              {selectedEvent.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {selectedEvent.notes}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`/catering/events/\${selectedEvent.id}\`); setSelectedEvent(null); }}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
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
 * Generate catering client profile component
 */
export function generateClientProfileCatering(options: CateringOptions = {}): string {
  const { componentName = 'ClientProfileCatering', endpoint = '/catering/clients' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, Phone, MapPin, Calendar, ArrowLeft, Edit, Building, DollarSign, Users, Utensils, Star, Clock } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: client, isLoading } = useQuery({
    queryKey: ['catering-client', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ['catering-client-events', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/events');
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

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  const upcomingEvents = events.filter((e: any) => new Date(e.event_date || e.date) >= new Date());
  const pastEvents = events.filter((e: any) => new Date(e.event_date || e.date) < new Date());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="${endpoint}" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
      </div>

      {/* Client Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                {client.avatar_url || client.logo_url ? (
                  <img src={client.avatar_url || client.logo_url} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {(client.name || client.company_name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {client.name || client.company_name}
                </h1>
                {client.company_name && client.name && (
                  <p className="text-gray-500 flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {client.company_name}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {client.client_type && (
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                      client.client_type === 'corporate' ? 'bg-blue-100 text-blue-700' :
                      client.client_type === 'wedding' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }\`}>
                      {client.client_type.charAt(0).toUpperCase() + client.client_type.slice(1)}
                    </span>
                  )}
                  {client.is_vip && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3 fill-current" /> VIP
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              to={\`${endpoint}/\${id}/edit\`}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white">
              <Utensils className="w-5 h-5 text-emerald-600" />
              {client.total_events || events.length || 0}
            </div>
            <p className="text-sm text-gray-500">Total Events</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
              <DollarSign className="w-5 h-5" />
              {(client.total_revenue || 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
              <Users className="w-5 h-5" />
              {client.total_guests_served || 0}
            </div>
            <p className="text-sm text-gray-500">Guests Served</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-600">
              <Calendar className="w-5 h-5" />
              {upcomingEvents.length}
            </div>
            <p className="text-sm text-gray-500">Upcoming Events</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            {client.contact_name && (
              <div className="text-gray-600 dark:text-gray-400">
                <span className="text-sm text-gray-500">Primary Contact</span>
                <p className="font-medium">{client.contact_name}</p>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={\`mailto:\${client.email}\`} className="hover:text-emerald-600">{client.email}</a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={\`tel:\${client.phone}\`} className="hover:text-emerald-600">{client.phone}</a>
              </div>
            )}
            {(client.address || client.city) && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{[client.address, client.city, client.state, client.zip_code].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Preferences</h3>
            {client.preferred_cuisine && client.preferred_cuisine.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Preferred Cuisines</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(client.preferred_cuisine) ? client.preferred_cuisine : [client.preferred_cuisine]).map((cuisine: string) => (
                    <span key={cuisine} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {client.dietary_requirements && client.dietary_requirements.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Dietary Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {client.dietary_requirements.map((req: string) => (
                    <span key={req} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {client.created_at && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Client since {new Date(client.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingEvents.slice(0, 5).map((event: any) => (
              <Link
                key={event.id}
                to={\`/catering/events/\${event.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{event.event_name || event.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.event_date || event.date).toLocaleDateString()}
                    <span className="mx-1">-</span>
                    <Users className="w-3 h-3" />
                    {event.guest_count} guests
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">\${(event.total_amount || 0).toLocaleString()}</p>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                    event.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }\`}>
                    {event.status || 'Pending'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Past Events</h3>
          <Link to={\`${endpoint}/\${id}/events\`} className="text-sm text-emerald-600 hover:text-emerald-700">
            View All
          </Link>
        </div>
        {pastEvents.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pastEvents.slice(0, 5).map((event: any) => (
              <div key={event.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{event.event_name || event.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(event.event_date || event.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-600">\${(event.total_amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{event.guest_count} guests</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No past events
          </div>
        )}
      </div>

      {/* Notes */}
      {client.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
