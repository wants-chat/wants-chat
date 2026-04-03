import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCalendar = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'event' | 'week' | 'agenda' = 'simple'
) => {
  const dataSource = resolved.dataSource;
  
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'events'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'events';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}

interface CalendarSimpleProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const CalendarSimple: React.FC<CalendarSimpleProps> = ({ ${dataName}: propData, className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sourceData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Default values for calendar data - make it work without requiring specific fields
  const defaultMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const defaultDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames = Array.isArray(${getField('monthNames')}) ? ${getField('monthNames')} : defaultMonthNames;
  const dayNames = Array.isArray(${getField('dayNames')}) ? ${getField('dayNames')} : defaultDayNames;
  const events = Array.isArray(${getField('events')}) ? ${getField('events')} : [];

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    console.log('Previous month clicked:', monthNames[newDate.getMonth()], newDate.getFullYear());
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    console.log('Next month clicked:', monthNames[newDate.getMonth()], newDate.getFullYear());
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    console.log('Date clicked:', clickedDate.toDateString());
  };

  const hasEvent = (day: number) => {
    return events.find((event: any) =>
      new Date(event.date).getDate() === day &&
      new Date(event.date).getMonth() === currentDate.getMonth() &&
      new Date(event.date).getFullYear() === currentDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={\`empty-\${i}\`} className="p-2"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const event = hasEvent(day);
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={cn(
            "p-2 text-center cursor-pointer rounded-xl transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl",
            isToday(day)
              ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 text-white font-bold'
              : isSelected(day)
              ? 'bg-gradient-to-br from-purple-100 via-purple-50 to-purple-100 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 text-purple-900 dark:text-purple-100 border border-purple-200/50 dark:border-purple-700/50'
              : 'hover:bg-gradient-to-br hover:from-gray-100 hover:via-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:via-gray-700 dark:hover:to-gray-800'
          )}
        >
          <div className="text-sm">{day}</div>
          {event && (
            <div className={cn("w-1.5 h-1.5 rounded-full mx-auto mt-1", event.color)}></div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 flex items-center justify-center p-4", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day: string) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>

        {selectedDate && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Selected: {selectedDate.toDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSimple;
    `,

    event: `
${commonImports}
import { Plus, Clock, MapPin } from 'lucide-react';

interface CalendarEventProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const CalendarEvent: React.FC<CalendarEventProps> = ({ ${dataName}: propData, className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sourceData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Default values for calendar data
  const defaultMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const defaultDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames = Array.isArray(${getField('monthNames')}) ? ${getField('monthNames')} : defaultMonthNames;
  const dayNames = Array.isArray(${getField('dayNames')}) ? ${getField('dayNames')} : defaultDayNames;
  const events = Array.isArray(${getField('events')}) ? ${getField('events')} : [];
  const noEventsText = ${getField('noEventsText')} || 'No events scheduled for this date';

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    console.log('Previous month clicked:', monthNames[newDate.getMonth()], newDate.getFullYear());
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    console.log('Next month clicked:', monthNames[newDate.getMonth()], newDate.getFullYear());
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    console.log('Date clicked:', clickedDate.toDateString());
  };

  const handleAddEvent = () => {
    console.log('Add event clicked for date:', selectedDate.toDateString());
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event.title);
  };

  const getEventsForDate = (day: number) => {
    return events.filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const getEventsForSelectedDate = () => {
    return events.filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={\`empty-\${i}\`} className="p-2 min-h-[80px]"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dayEvents = getEventsForDate(day);
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={cn(
            "p-2 min-h-[80px] border border-gray-200/50 dark:border-gray-700/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl",
            isToday(day)
              ? 'bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-900/20 border-blue-500/50'
              : isSelected(day)
              ? 'bg-gradient-to-br from-purple-100 via-purple-50 to-purple-100 dark:from-purple-900/30 dark:via-purple-800/40 dark:to-purple-900/30 border-purple-500/50'
              : 'hover:bg-gradient-to-br hover:from-gray-50 hover:via-purple-50/10 hover:to-gray-50 dark:hover:from-gray-800/50 dark:hover:via-purple-900/10 dark:hover:to-gray-800/50'
          )}
        >
          <div className={cn(
            "text-sm font-medium mb-1",
            isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
          )}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event: any) => (
              <div
                key={event.id}
                className={cn(event.color, "text-white text-xs px-1.5 py-0.5 rounded truncate")}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedEvents = getEventsForSelectedDate();

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 p-4 lg:p-8", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-0">
                {dayNames.map((day: string) => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 p-2 border-b border-gray-200 dark:border-gray-700">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent">
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h3>
                <button
                  onClick={handleAddEvent}
                  className="p-2 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((event: any) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="p-3 bg-gradient-to-br from-gray-50 via-purple-50/10 to-gray-50 dark:from-gray-800 dark:via-purple-900/10 dark:to-gray-800 rounded-2xl cursor-pointer hover:from-gray-100 hover:via-purple-100/20 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:via-purple-800/20 dark:hover:to-gray-700 border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn("w-1 h-full rounded", event.color)}></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">{noEventsText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarEvent;
    `,

    week: `
${commonImports}

interface CalendarWeekProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const CalendarWeek: React.FC<CalendarWeekProps> = ({ ${dataName}: propData, className }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sourceData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const defaultMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const defaultWeekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const defaultTimeSlots = Array.from({ length: 12 }, (_, i) => ({ hour: i + 8, label: \`\${i + 8}:00\` }));

  const monthNames = Array.isArray(${getField('monthNames')}) ? ${getField('monthNames')} : defaultMonthNames;
  const weekDayNames = Array.isArray(${getField('weekDayNames')}) ? ${getField('weekDayNames')} : defaultWeekDayNames;
  const events = Array.isArray(${getField('events')}) ? ${getField('events')} : [];
  const timeSlots = Array.isArray(${getField('timeSlots')}) ? ${getField('timeSlots')} : defaultTimeSlots;

  const getWeekDays = (date: Date) => {
    const week = [];
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);

    current.setDate(diff);

    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return week;
  };

  const weekDays = getWeekDays(currentWeek);

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
    console.log('Previous week clicked');
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
    console.log('Next week clicked');
  };

  const handleTimeSlotClick = (day: number, hour: number) => {
    console.log(\`Time slot clicked: \${weekDayNames[day]} at \${hour}:00\`);
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event.title);
  };

  const getEventsForSlot = (day: number, hour: number) => {
    return events.filter((event: any) =>
      event.day === day &&
      event.startHour === hour
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const monthYear = \`\${monthNames[weekDays[0].getMonth()]} \${weekDays[0].getFullYear()}\`;

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 p-4 lg:p-8", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent">
              {monthYear}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousWeek}
                className="p-2 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextWeek}
                className="p-2 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-0 mb-2">
                <div className="p-2"></div>
                {weekDays.map((date, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-center p-2",
                      isToday(date)
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-gray-900 dark:text-white'
                    )}
                  >
                    <div className="text-sm font-medium">{weekDayNames[index]}</div>
                    <div className={cn(
                      "text-lg",
                      isToday(date) && 'w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto'
                    )}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {timeSlots.map((slot: any) => (
                <div key={slot.hour} className="grid grid-cols-8 gap-0 border-t border-gray-200 dark:border-gray-700">
                  <div className="p-2 text-xs text-gray-500 dark:text-gray-400">
                    {slot.label}
                  </div>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const slotEvents = getEventsForSlot(day, slot.hour);
                    return (
                      <div
                        key={day}
                        onClick={() => handleTimeSlotClick(day, slot.hour)}
                        className="p-1 min-h-[60px] border-l border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-br hover:from-gray-50 hover:via-purple-50/10 hover:to-gray-50 dark:hover:from-gray-800/50 dark:hover:via-purple-900/10 dark:hover:to-gray-800/50 cursor-pointer transition-all duration-300 rounded-xl"
                      >
                        {slotEvents.map((event: any) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                            className={cn(event.color, "text-white text-xs p-2 rounded-xl mb-1 cursor-pointer hover:opacity-90 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105")}
                            style={{ minHeight: \`\${event.duration * 60}px\` }}
                          >
                            {event.title}
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
      </div>
    </div>
  );
};

export default CalendarWeek;
    `,

    agenda: `
${commonImports}
import { Calendar, Clock, MapPin, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface CalendarAgendaProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const CalendarAgenda: React.FC<CalendarAgendaProps> = ({ ${dataName}: propData, className }) => {
  const [expandedEvents, setExpandedEvents] = useState<number[]>([]);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sourceData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Default values for agenda calendar
  const agendaTitle = ${getField('agendaTitle')} || 'Event Agenda';
  const agendaDescription = ${getField('agendaDescription')} || 'View all your upcoming events';
  const events = Array.isArray(${getField('events')}) ? ${getField('events')} : [];
  const todayLabel = ${getField('todayLabel')} || 'Today';
  const summaryTitle = ${getField('summaryTitle')} || 'Summary';
  const totalEventsLabel = ${getField('totalEventsLabel')} || 'Total Events';
  const daysWithEventsLabel = ${getField('daysWithEventsLabel')} || 'Days with Events';
  const totalAttendeesLabel = ${getField('totalAttendeesLabel')} || 'Total Attendees';

  const toggleEventExpand = (eventId: number) => {
    setExpandedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
    console.log('Event toggled:', eventId);
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event.title);
  };

  const groupEventsByDate = () => {
    const grouped: { [key: string]: any[] } = {};

    events.forEach((event: any) => {
      const eventDate = new Date(event.date);
      const dateKey = eventDate.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return Object.entries(grouped).sort(([dateA], [dateB]) =>
      new Date(dateA).getTime() - new Date(dateB).getTime()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const groupedEvents = groupEventsByDate();

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 p-4 lg:p-8", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent mb-2">
            {agendaTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {agendaDescription}
          </p>
        </div>

        <div className="space-y-6">
          {groupedEvents.map(([dateString, dateEvents]) => {
            const date = new Date(dateString);
            return (
              <div key={dateString}>
                <div className={cn(
                  "flex items-center gap-3 mb-4",
                  isToday(date) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                )}>
                  <Calendar className="h-5 w-5" />
                  <h2 className="text-lg font-bold">
                    {date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h2>
                  {isToday(date) && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                      {todayLabel}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {dateEvents.map((event: any) => {
                    const isExpanded = expandedEvents.includes(event.id);
                    return (
                      <div key={event.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div
                          onClick={() => handleEventClick(event)}
                          className="cursor-pointer hover:bg-gradient-to-br hover:from-gray-50 hover:via-purple-50/10 hover:to-gray-50 dark:hover:from-gray-800/50 dark:hover:via-purple-900/10 dark:hover:to-gray-800/50 transition-all duration-300"
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={cn("w-1 h-full rounded flex-shrink-0", event.color)}></div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {event.title}
                                  </h3>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleEventExpand(event.id);
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    )}
                                  </button>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{event.time} • {event.duration}</span>
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{event.location}</span>
                                    </div>
                                  )}
                                  {event.attendees && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      <span>{event.attendees} attendees</span>
                                    </div>
                                  )}
                                </div>

                                {isExpanded && event.description && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {event.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 mt-8 p-6">
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {summaryTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {events.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {totalEventsLabel}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {groupedEvents.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {daysWithEventsLabel}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {events.reduce((sum: number, e: any) => sum + (e.attendees || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {totalAttendeesLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarAgenda;
    `
  };

  return variants[variant] || variants.simple;
};
