/**
 * Schedule Generator
 *
 * Generates schedule/calendar view components:
 * - TodaySchedule: Today's schedule timeline view
 * - ScheduleCalendar: Full calendar with schedule items
 * - SessionCalendar: Sessions/appointments calendar
 *
 * Features:
 * - Timeline view for daily schedules
 * - Full calendar view with event display
 * - Time slot management
 * - Responsive design
 * - Dark mode support
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface ScheduleItemConfig {
  title: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  type?: string;
  color?: string;
  location?: string;
  attendee?: string;
  status?: string;
}

export interface ScheduleOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  endpoint?: string;
  queryKey?: string;
  itemConfig: ScheduleItemConfig;
  variant?: 'today' | 'calendar' | 'sessions';
  showCreateButton?: boolean;
  showTimeSlots?: boolean;
  timeSlotInterval?: number;
  workingHoursStart?: number;
  workingHoursEnd?: number;
  createRoute?: string;
  detailRoute?: string;
}

/**
 * Generate a schedule component
 */
export function generateSchedule(options: ScheduleOptions): string {
  const {
    entity,
    itemConfig,
    variant = 'today',
    showCreateButton = true,
    showTimeSlots = true,
    timeSlotInterval = 30,
    workingHoursStart = 8,
    workingHoursEnd = 18,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'Schedule';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const createRoute = options.createRoute || `/${tableName}/new`;
  const detailRoute = options.detailRoute || `/${tableName}/\${id}`;

  // Determine icons based on variant
  const variantIcons: Record<string, string[]> = {
    today: ['Clock', 'MapPin', 'User', 'CheckCircle', 'AlertCircle'],
    calendar: ['ChevronLeft', 'ChevronRight', 'Calendar', 'Clock'],
    sessions: ['Video', 'Users', 'Clock', 'MapPin'],
  };

  const baseIcons = ['Plus', 'Loader2', 'X'];
  const icons = [...new Set([...baseIcons, ...variantIcons[variant]])];

  if (variant === 'today') {
    return generateTodayScheduleComponent(options, componentName, displayName, endpoint, queryKey, createRoute, detailRoute, itemConfig, icons, showCreateButton, showTimeSlots, timeSlotInterval, workingHoursStart, workingHoursEnd);
  } else if (variant === 'sessions') {
    return generateSessionCalendarComponent(options, componentName, displayName, endpoint, queryKey, createRoute, detailRoute, itemConfig, icons, showCreateButton);
  } else {
    return generateScheduleCalendarComponent(options, componentName, displayName, endpoint, queryKey, createRoute, detailRoute, itemConfig, icons, showCreateButton);
  }
}

function generateTodayScheduleComponent(
  options: ScheduleOptions,
  componentName: string,
  displayName: string,
  endpoint: string,
  queryKey: string,
  createRoute: string,
  detailRoute: string,
  itemConfig: ScheduleItemConfig,
  icons: string[],
  showCreateButton: boolean,
  showTimeSlots: boolean,
  timeSlotInterval: number,
  workingHoursStart: number,
  workingHoursEnd: number
): string {
  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ${icons.join(', ')} } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  date?: Date;
  className?: string;
  onItemClick?: (item: any) => void;
  onTimeSlotClick?: (time: Date) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  date = new Date(),
  className,
  onItemClick,
  onTimeSlotClick,
}) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(date);

  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}', dateStr],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?date=\${dateStr}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const items = propData || fetchedData || [];

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    const current = new Date(selectedDate);
    current.setHours(${workingHoursStart}, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(${workingHoursEnd}, 0, 0, 0);

    while (current < end) {
      slots.push(new Date(current));
      current.setMinutes(current.getMinutes() + ${timeSlotInterval});
    }
    return slots;
  }, [selectedDate]);

  // Get items for a specific time slot
  const getItemsForTimeSlot = (slotTime: Date) => {
    return items.filter((item: any) => {
      const itemStart = new Date(item.${itemConfig.startTime});
      const slotEnd = new Date(slotTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + ${timeSlotInterval});

      return itemStart >= slotTime && itemStart < slotEnd;
    });
  };

  const handleItemClick = (item: any) => {
    if (onItemClick) onItemClick(item);
    else navigate(\`${detailRoute.replace('${id}', '${item.id || item._id}')}\`);
  };

  const handleTimeSlotClick = (time: Date) => {
    if (onTimeSlotClick) onTimeSlotClick(time);
    else navigate(\`${createRoute}?time=\${time.toISOString()}\`);
  };

  const getTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300',
      appointment: 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
      task: 'bg-purple-100 border-purple-400 text-purple-800 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-300',
      event: 'bg-orange-100 border-orange-400 text-orange-800 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-300',
      break: 'bg-gray-100 border-gray-400 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300',
    };
    return colors[type?.toLowerCase() || ''] || colors.meeting;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentTimeSlot = (slotTime: Date) => {
    const now = new Date();
    const slotEnd = new Date(slotTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + ${timeSlotInterval});
    return now >= slotTime && now < slotEnd;
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Today's Schedule
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {selectedDate.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        ${showCreateButton ? `<button
          onClick={() => navigate('${createRoute}')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add ${displayName}
        </button>` : ''}
      </div>

      {/* Schedule Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {timeSlots.map((slot, idx) => {
            const slotItems = getItemsForTimeSlot(slot);
            const isCurrent = isCurrentTimeSlot(slot);

            return (
              <div
                key={idx}
                className={cn(
                  'flex min-h-[60px]',
                  isCurrent && 'bg-blue-50 dark:bg-blue-900/10'
                )}
              >
                {/* Time Label */}
                <div className="w-20 flex-shrink-0 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  {formatTime(slot)}
                </div>

                {/* Content Area */}
                <div
                  className={cn(
                    'flex-1 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                    slotItems.length === 0 && 'min-h-[60px]'
                  )}
                  onClick={() => slotItems.length === 0 && handleTimeSlotClick(slot)}
                >
                  {slotItems.length > 0 ? (
                    <div className="space-y-2">
                      {slotItems.map((item: any) => (
                        <div
                          key={item.id || item._id}
                          onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                          className={cn(
                            'p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow',
                            getTypeColor(item.${itemConfig.type || 'type'})
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{item.${itemConfig.title}}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm opacity-80">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(new Date(item.${itemConfig.startTime}))}
                                  ${itemConfig.endTime ? `{item.${itemConfig.endTime} && \` - \${formatTime(new Date(item.${itemConfig.endTime}))}\`}` : ''}
                                </span>
                                ${itemConfig.location ? `{item.${itemConfig.location} && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {item.${itemConfig.location}}
                                  </span>
                                )}` : ''}
                              </div>
                            </div>
                            ${itemConfig.status ? `{item.${itemConfig.status} && (
                              <span className={cn(
                                'px-2 py-0.5 text-xs rounded-full',
                                item.${itemConfig.status} === 'completed'
                                  ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              )}>
                                {item.${itemConfig.status}}
                              </span>
                            )}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-2">
        <span>{items.length} scheduled items today</span>
        <span>Working hours: ${workingHoursStart}:00 - ${workingHoursEnd}:00</span>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

function generateScheduleCalendarComponent(
  options: ScheduleOptions,
  componentName: string,
  displayName: string,
  endpoint: string,
  queryKey: string,
  createRoute: string,
  detailRoute: string,
  itemConfig: ScheduleItemConfig,
  icons: string[],
  showCreateButton: boolean
): string {
  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ${icons.join(', ')} } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

type ViewType = 'month' | 'week' | 'day';

interface ${componentName}Props {
  data?: any[];
  className?: string;
  onItemClick?: (item: any) => void;
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
  onItemClick,
  onDateClick,
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}', year, month],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?year=\${year}&month=\${month + 1}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const items = propData || fetchedData || [];

  // Generate calendar days
  const calendarDays = useMemo(() => {
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
  }, [year, month]);

  const getItemsForDate = (date: Date) => {
    return items.filter((item: any) => {
      const itemDate = new Date(item.${itemConfig.startTime});
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });
  };

  const navigatePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const navigateNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleItemClick = (item: any) => {
    if (onItemClick) onItemClick(item);
    else setSelectedItem(item);
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

  const getTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-500',
      appointment: 'bg-green-500',
      task: 'bg-purple-500',
      event: 'bg-orange-500',
      session: 'bg-pink-500',
    };
    return colors[type?.toLowerCase() || ''] || 'bg-blue-500';
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
              {MONTHS[month]} {year}
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
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {(['month', 'week', 'day'] as ViewType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'px-3 py-1.5 text-sm capitalize',
                    view === v ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {v}
                </button>
              ))}
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
              <div key={day} className="py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayItems = getItemsForDate(day.date);
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
                  <div className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                    isToday(day.date) && 'bg-blue-600 text-white',
                    !isToday(day.date) && !day.isCurrentMonth && 'text-gray-400'
                  )}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((item: any, i: number) => (
                      <div
                        key={item.id || item._id || i}
                        onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                        className={cn(
                          'px-2 py-1 text-xs rounded truncate cursor-pointer text-white',
                          getTypeColor(item.${itemConfig.type || 'type'})
                        )}
                      >
                        {item.${itemConfig.title}}
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">+{dayItems.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedItem(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedItem.${itemConfig.title}}
              </h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                {new Date(selectedItem.${itemConfig.startTime}).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {new Date(selectedItem.${itemConfig.startTime}).toLocaleTimeString()}
                ${itemConfig.endTime ? `{selectedItem.${itemConfig.endTime} && \` - \${new Date(selectedItem.${itemConfig.endTime}).toLocaleTimeString()}\`}` : ''}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(\`${detailRoute.replace('${id}', '${selectedItem.id || selectedItem._id}')}\`); setSelectedItem(null); }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Details
              </button>
              <button onClick={() => setSelectedItem(null)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
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

function generateSessionCalendarComponent(
  options: ScheduleOptions,
  componentName: string,
  displayName: string,
  endpoint: string,
  queryKey: string,
  createRoute: string,
  detailRoute: string,
  itemConfig: ScheduleItemConfig,
  icons: string[],
  showCreateButton: boolean
): string {
  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ${icons.join(', ')}, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  className?: string;
  onSessionClick?: (session: any) => void;
  onSlotClick?: (date: Date, time: string) => void;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? '00' : '30';
  return \`\${hour.toString().padStart(2, '0')}:\${minute}\`;
});

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  className,
  onSessionClick,
  onSlotClick,
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the week's start date (Sunday)
  const weekStart = useMemo(() => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - date.getDay());
    return date;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}', weekStart.toISOString()],
    queryFn: async () => {
      try {
        const endDate = new Date(weekStart);
        endDate.setDate(endDate.getDate() + 7);
        const response = await api.get<any>(\`${endpoint}?start=\${weekStart.toISOString()}&end=\${endDate.toISOString()}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const sessions = propData || fetchedData || [];

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const getSessionsForSlot = (date: Date, time: string) => {
    return sessions.filter((session: any) => {
      const sessionDate = new Date(session.${itemConfig.startTime});
      const sessionTime = sessionDate.toTimeString().slice(0, 5);
      return (
        sessionDate.getFullYear() === date.getFullYear() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getDate() === date.getDate() &&
        sessionTime === time
      );
    });
  };

  const handleSessionClick = (session: any) => {
    if (onSessionClick) onSessionClick(session);
    else navigate(\`${detailRoute.replace('${id}', '${session.id || session._id}')}\`);
  };

  const handleSlotClick = (date: Date, time: string) => {
    if (onSlotClick) onSlotClick(date, time);
    else navigate(\`${createRoute}?date=\${date.toISOString().split('T')[0]}&time=\${time}\`);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const getSessionColor = (session: any) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
      pending: 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300',
      cancelled: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300',
    };
    return colors[session.${itemConfig.status || 'status'}?.toLowerCase()] || colors.confirmed;
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
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Session Calendar
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

        ${showCreateButton ? `<button
          onClick={() => navigate('${createRoute}')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>` : ''}
      </div>

      {/* Week Header */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {weekStart.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} - {weekDays[6].toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
            <div className="w-20" />
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  'py-3 px-2 text-center border-l border-gray-200 dark:border-gray-700',
                  isToday(day) && 'bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {WEEKDAYS[idx].slice(0, 3)}
                </div>
                <div className={cn(
                  'text-lg font-semibold',
                  isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                )}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {TIME_SLOTS.map((time) => (
              <div key={time} className="grid grid-cols-8 min-h-[50px]">
                <div className="w-20 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                  {time}
                </div>
                {weekDays.map((day, dayIdx) => {
                  const slotSessions = getSessionsForSlot(day, time);
                  return (
                    <div
                      key={dayIdx}
                      onClick={() => slotSessions.length === 0 && handleSlotClick(day, time)}
                      className={cn(
                        'border-l border-gray-200 dark:border-gray-700 p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50',
                        isToday(day) && 'bg-blue-50/50 dark:bg-blue-900/10'
                      )}
                    >
                      {slotSessions.map((session: any) => (
                        <div
                          key={session.id || session._id}
                          onClick={(e) => { e.stopPropagation(); handleSessionClick(session); }}
                          className={cn(
                            'p-2 rounded border-l-2 text-xs cursor-pointer hover:shadow-md transition-shadow',
                            getSessionColor(session)
                          )}
                        >
                          <div className="font-medium truncate">{session.${itemConfig.title}}</div>
                          ${itemConfig.attendee ? `{session.${itemConfig.attendee} && (
                            <div className="flex items-center gap-1 mt-1 opacity-80">
                              <Users className="w-3 h-3" />
                              <span className="truncate">{session.${itemConfig.attendee}}</span>
                            </div>
                          )}` : ''}
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

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-400" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-400" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-400" />
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate TodaySchedule component
 */
export function generateTodaySchedule(options?: Partial<ScheduleOptions>): string {
  return generateSchedule({
    entity: 'schedule',
    displayName: 'Schedule',
    componentName: 'TodaySchedule',
    variant: 'today',
    itemConfig: {
      title: 'title',
      startTime: 'start_time',
      endTime: 'end_time',
      type: 'type',
      location: 'location',
      status: 'status',
    },
    showCreateButton: true,
    showTimeSlots: true,
    timeSlotInterval: 30,
    workingHoursStart: 8,
    workingHoursEnd: 18,
    ...options,
  });
}

/**
 * Generate ScheduleCalendar component
 */
export function generateScheduleCalendar(options?: Partial<ScheduleOptions>): string {
  return generateSchedule({
    entity: 'schedule',
    displayName: 'Schedule',
    componentName: 'ScheduleCalendar',
    variant: 'calendar',
    itemConfig: {
      title: 'title',
      startTime: 'start_time',
      endTime: 'end_time',
      type: 'type',
    },
    showCreateButton: true,
    ...options,
  });
}

/**
 * Generate SessionCalendar component
 */
export function generateSessionCalendar(options?: Partial<ScheduleOptions>): string {
  return generateSchedule({
    entity: 'session',
    displayName: 'Session',
    componentName: 'SessionCalendar',
    variant: 'sessions',
    itemConfig: {
      title: 'title',
      startTime: 'scheduled_at',
      duration: 'duration',
      attendee: 'attendee_name',
      status: 'status',
    },
    showCreateButton: true,
    ...options,
  });
}
