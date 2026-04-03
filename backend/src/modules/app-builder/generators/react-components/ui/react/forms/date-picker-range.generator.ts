import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDatePickerRange = (
  resolved: ResolvedComponent,
  variant: 'calendar' | 'dropdown' | 'preset' = 'calendar'
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

interface DatePickerRangeCalendarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const DatePickerRangeCalendar: React.FC<DatePickerRangeCalendarProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
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

  const rangePickerData = propData || fetchedData || {};

  const rangeTitle = ${getField('rangeTitle')};
  const monthNames = ${getField('monthNames')};
  const dayNames = ${getField('dayNames')};
  const applyButton = ${getField('applyButton')};
  const clearButton = ${getField('clearButton')};
  const startPlaceholder = ${getField('startPlaceholder')};
  const endPlaceholder = ${getField('endPlaceholder')};

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

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
      console.log('Start date selected:', clickedDate.toDateString());
    } else if (clickedDate < startDate) {
      setStartDate(clickedDate);
      setEndDate(null);
      console.log('Start date changed:', clickedDate.toDateString());
    } else {
      setEndDate(clickedDate);
      console.log('End date selected:', clickedDate.toDateString());
    }
  };

  const handleApply = () => {
    setIsOpen(false);
    console.log('Range applied:', { start: startDate?.toDateString(), end: endDate?.toDateString() });
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    console.log('Range cleared');
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date > startDate && date < endDate;
  };

  const isRangeStart = (day: number) => {
    if (!startDate) return false;
    return day === startDate.getDate() &&
      currentDate.getMonth() === startDate.getMonth() &&
      currentDate.getFullYear() === startDate.getFullYear();
  };

  const isRangeEnd = (day: number) => {
    if (!endDate) return false;
    return day === endDate.getDate() &&
      currentDate.getMonth() === endDate.getMonth() &&
      currentDate.getFullYear() === endDate.getFullYear();
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={\`empty-\${i}\`} className="p-2"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const isStart = isRangeStart(day);
      const isEnd = isRangeEnd(day);
      const inRange = isInRange(day);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={cn(
            "p-2 text-sm rounded-lg transition-colors",
            (isStart || isEnd) && "bg-blue-600 text-white hover:bg-blue-700",
            inRange && "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100",
            !isStart && !isEnd && !inRange && "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{rangeTitle}</h2>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={cn(!startDate && "text-gray-400")}>
                  {startDate ? formatDate(startDate) : startPlaceholder}
                </span>
                <span className="text-gray-400">→</span>
                <span className={cn(!endDate && "text-gray-400")}>
                  {endDate ? formatDate(endDate) : endPlaceholder}
                </span>
              </div>
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
                    onClick={handleApply}
                    disabled={!startDate || !endDate}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {applyButton}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    {clearButton}
                  </button>
                </div>
              </div>
            )}
          </div>

          {startDate && endDate && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Selected Range
              </p>
              <p className="text-base text-blue-700 dark:text-blue-300">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatePickerRangeCalendar;
    `,

    dropdown: `
${commonImports}

interface DatePickerRangeDropdownProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const DatePickerRangeDropdown: React.FC<DatePickerRangeDropdownProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [startDay, setStartDay] = useState(1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [endDay, setEndDay] = useState(new Date().getDate());
  const [endYear, setEndYear] = useState(new Date().getFullYear());

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

  const rangePickerData = propData || fetchedData || {};

  const rangeTitle = ${getField('rangeTitle')};
  const startDateLabel = ${getField('startDateLabel')};
  const endDateLabel = ${getField('endDateLabel')};
  const monthNames = ${getField('monthNames')};
  const applyButton = ${getField('applyButton')};
  const clearButton = ${getField('clearButton')};

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
  const startDays = Array.from({ length: getDaysInMonth(startMonth, startYear) }, (_, i) => i + 1);
  const endDays = Array.from({ length: getDaysInMonth(endMonth, endYear) }, (_, i) => i + 1);

  const handleApply = () => {
    const start = new Date(startYear, startMonth, startDay);
    const end = new Date(endYear, endMonth, endDay);
    console.log('Range applied:', { start: start.toDateString(), end: end.toDateString() });
  };

  const handleClear = () => {
    const today = new Date();
    setStartMonth(today.getMonth());
    setStartDay(1);
    setStartYear(today.getFullYear());
    setEndMonth(today.getMonth());
    setEndDay(today.getDate());
    setEndYear(today.getFullYear());
    console.log('Range cleared');
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{rangeTitle}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{startDateLabel}</h3>
              <div className="space-y-4">
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {monthNames.map((month: string, index: number) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={startDay}
                    onChange={(e) => setStartDay(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {startDays.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{endDateLabel}</h3>
              <div className="space-y-4">
                <select
                  value={endMonth}
                  onChange={(e) => setEndMonth(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {monthNames.map((month: string, index: number) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={endDay}
                    onChange={(e) => setEndDay(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {endDays.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
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

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Range:
            </p>
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="font-bold">{monthNames[startMonth]} {startDay}, {startYear}</span>
              <span className="text-gray-400">→</span>
              <span className="font-bold">{monthNames[endMonth]} {endDay}, {endYear}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerRangeDropdown;
    `,

    preset: `
${commonImports}

interface DatePickerRangePresetProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const DatePickerRangePreset: React.FC<DatePickerRangePresetProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

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

  const rangePickerData = propData || fetchedData || {};

  const rangeTitle = ${getField('rangeTitle')};
  const presetRanges = ${getField('presetRanges')};
  const applyButton = ${getField('applyButton')};
  const clearButton = ${getField('clearButton')};

  const handlePresetClick = (preset: any) => {
    const end = new Date();
    let start = new Date();

    if (preset.days === 0) {
      start = new Date();
    } else if (preset.days === -1) {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset.days === -2) {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0);
    } else {
      start.setDate(start.getDate() - preset.days);
    }

    setStartDate(start);
    setEndDate(end);
    setSelectedPreset(preset.label);
    console.log('Preset selected:', preset.label, { start: start.toDateString(), end: end.toDateString() });
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedPreset(null);
    console.log('Range cleared');
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{rangeTitle}</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {presetRanges.map((preset: any) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "px-4 py-3 border-2 rounded-lg font-medium transition-all",
                  selectedPreset === preset.label
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {startDate && endDate && (
            <>
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected Range
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {formatDate(startDate)}
                    </p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</p>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {formatDate(endDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Duration: <span className="font-semibold">
                      {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => console.log('Applied:', { start: startDate, end: endDate })}
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
            </>
          )}

          {!startDate && !endDate && (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a preset range to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatePickerRangePreset;
    `
  };

  return variants[variant] || variants.calendar;
};
