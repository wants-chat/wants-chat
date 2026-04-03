import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDatePickerSingle = (
  resolved: ResolvedComponent,
  variant: 'calendar' | 'dropdown' | 'inline' = 'calendar'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    calendar: `
${commonImports}

interface DatePickerCalendarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const datePickerData = propData || fetchedData || {};

  const calendarTitle = ${getField('calendarTitle')};
  const monthNames = ${getField('monthNames')};
  const dayNames = ${getField('dayNames')};
  const todayButton = ${getField('todayButton')};
  const clearButton = ${getField('clearButton')};
  const datePlaceholder = ${getField('datePlaceholder')};

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    console.log('Previous month clicked');
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    console.log('Next month clicked');
  };

  const selectToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
    setIsOpen(false);
    console.log('Today selected:', today.toDateString());
  };

  const clearDate = () => {
    setSelectedDate(null);
    console.log('Date cleared');
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setIsOpen(false);
    console.log('Date selected:', clickedDate.toDateString());
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

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={\`empty-\${i}\`} className="p-2"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={cn(
            "p-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
            isToday(day) && "border-2 border-blue-500",
            isSelected(day) && "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return datePlaceholder;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{calendarTitle}</h2>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className={cn(!selectedDate && "text-gray-400")}>
                {formatDate(selectedDate)}
              </span>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </button>

            {isOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day: string) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {renderCalendarDays()}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={selectToday}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {todayButton}
                  </button>
                  <button
                    type="button"
                    onClick={clearDate}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    {clearButton}
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedDate && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Selected: {formatDate(selectedDate)}
              </span>
              <button
                type="button"
                onClick={clearDate}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatePickerCalendar;
    `,

    dropdown: `
${commonImports}

interface DatePickerDropdownProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const DatePickerDropdown: React.FC<DatePickerDropdownProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const datePickerData = propData || fetchedData || {};

  const mainTitle = ${getField('mainTitle')};
  const monthNames = ${getField('monthNames')};
  const applyButton = ${getField('applyButton')};
  const clearButton = ${getField('clearButton')};

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

  const handleApply = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    console.log('Date applied:', selectedDate.toDateString());
  };

  const handleClear = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedDay(today.getDate());
    setSelectedYear(today.getFullYear());
    console.log('Date cleared');
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{mainTitle}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {monthNames.map((month: string, index: number) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Day
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {applyButton}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                {clearButton}
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected Date:
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {monthNames[selectedMonth]} {selectedDay}, {selectedYear}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerDropdown;
    `,

    inline: `
${commonImports}

interface DatePickerInlineProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const DatePickerInline: React.FC<DatePickerInlineProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const datePickerData = propData || fetchedData || {};

  const mainTitle = ${getField('mainTitle')};
  const monthNames = ${getField('monthNames')};
  const dayNames = ${getField('dayNames')};
  const todayButton = ${getField('todayButton')};

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    console.log('Previous month clicked');
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    console.log('Next month clicked');
  };

  const selectToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
    console.log('Today selected:', today.toDateString());
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    console.log('Date selected:', clickedDate.toDateString());
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

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={\`empty-\${i}\`} className="p-3"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={cn(
            "p-3 text-center rounded-lg transition-all font-medium",
            isToday(day) && "border-2 border-blue-500",
            isSelected(day)
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{mainTitle}</h2>
            <button
              type="button"
              onClick={selectToday}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {todayButton}
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-3">
            {dayNames.map((day: string) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>

          {selectedDate && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Selected Date
              </p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatePickerInline;
    `
  };

  return variants[variant] || variants.calendar;
};
