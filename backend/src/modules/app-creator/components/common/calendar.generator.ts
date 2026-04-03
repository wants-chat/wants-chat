/**
 * Calendar Generator
 *
 * Generates calendar components with:
 * - Month/week/day views
 * - Event display
 * - Event creation
 * - Navigation controls
 * - Responsive design
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface CalendarEventConfig {
  titleField: string;
  startField: string;
  endField?: string;
  colorField?: string;
  descriptionField?: string;
}

export interface CalendarOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  endpoint?: string;
  queryKey?: string;
  eventConfig: CalendarEventConfig;
  views?: ('month' | 'week' | 'day')[];
  defaultView?: 'month' | 'week' | 'day';
  showCreateButton?: boolean;
  createRoute?: string;
  detailRoute?: string;
}

/**
 * Generate a calendar component
 */
export function generateCalendar(options: CalendarOptions): string {
  const {
    entity,
    eventConfig,
    views = ['month', 'week', 'day'],
    defaultView = 'month',
    showCreateButton = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'Calendar';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const createRoute = options.createRoute || `/${tableName}/new`;
  const detailRoute = options.detailRoute || `/${tableName}/\${id}`;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

type ViewType = ${views.map(v => `'${v}'`).join(' | ')};

interface ${componentName}Props {
  data?: any[];
  className?: string;
  onEventClick?: (event: any) => void;
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
  const [view, setView] = useState<ViewType>('${defaultView}');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const events = propData || fetchedData || [];

  // Get calendar days for the current month view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remaining = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event: any) => {
      const eventStart = new Date(event.${eventConfig.startField});
      return (
        eventStart.getFullYear() === date.getFullYear() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getDate() === date.getDate()
      );
    });
  };

  // Navigation
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

  const handleEventClick = (event: any) => {
    if (onEventClick) onEventClick(event);
    else setSelectedEvent(event);
  };

  const handleDateClick = (date: Date) => {
    if (onDateClick) onDateClick(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const getEventColor = (event: any) => {
    ${eventConfig.colorField ? `const color = event.${eventConfig.colorField};
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[color?.toLowerCase()] || 'bg-blue-100 text-blue-700 border-blue-200';` : `return 'bg-blue-100 text-blue-700 border-blue-200';`}
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

          <div className="flex items-center gap-3">
            {/* View Selector */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              ${views.map(v => `<button
                onClick={() => setView('${v}')}
                className={cn(
                  'px-3 py-1.5 text-sm capitalize',
                  view === '${v}'
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                ${v}
              </button>`).join('\n              ')}
            </div>

            ${showCreateButton ? `<button
              onClick={() => navigate('${createRoute}')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add ${displayName}
            </button>` : ''}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
              const dayEvents = getEventsForDate(day.date);
              return (
                <div
                  key={idx}
                  onClick={() => handleDateClick(day.date)}
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
                    {dayEvents.slice(0, 3).map((event: any, i: number) => (
                      <div
                        key={event.id || event._id || i}
                        onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                        className={cn(
                          'px-2 py-1 text-xs rounded truncate cursor-pointer border-l-2',
                          getEventColor(event)
                        )}
                      >
                        {event.${eventConfig.titleField}}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedEvent.${eventConfig.titleField}}
              </h3>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                {new Date(selectedEvent.${eventConfig.startField}).toLocaleDateString()}
              </div>
              ${eventConfig.endField ? `{selectedEvent.${eventConfig.endField} && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {new Date(selectedEvent.${eventConfig.startField}).toLocaleTimeString()} - {new Date(selectedEvent.${eventConfig.endField}).toLocaleTimeString()}
                </div>
              )}` : ''}
              ${eventConfig.descriptionField ? `{selectedEvent.${eventConfig.descriptionField} && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedEvent.${eventConfig.descriptionField}}
                </p>
              )}` : ''}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  navigate(\`${detailRoute.replace('${id}', '${selectedEvent.id || selectedEvent._id}')}\`);
                  setSelectedEvent(null);
                }}
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
 * Generate calendar for a specific domain
 */
export function generateDomainCalendar(
  domain: string,
  eventConfig: CalendarEventConfig,
  options?: Partial<CalendarOptions>
): string {
  return generateCalendar({
    entity: domain,
    eventConfig,
    ...options,
  });
}
