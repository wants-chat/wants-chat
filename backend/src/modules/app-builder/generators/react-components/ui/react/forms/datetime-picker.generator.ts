import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDatetimePicker = (
  resolved: ResolvedComponent,
  variant: 'combined' | 'separate' | 'preset' = 'combined'
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
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Globe, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    combined: `
${commonImports}

interface DatetimePickerCombinedProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const DatetimePickerCombined: React.FC<DatetimePickerCombinedProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [isPM, setIsPM] = useState(false);
  const [timezone, setTimezone] = useState('UTC');

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

  const datetimePickerData = propData || fetchedData || {};

  const datetimeTitle = ${getField('datetimeTitle')};
  const monthNames = ${getField('monthNames')};
  const dayNames = ${getField('dayNames')};
  const timezoneLabel = ${getField('timezoneLabel')};
  const timezones = ${getField('timezones')};
  const amLabel = ${getField('amLabel')};
  const pmLabel = ${getField('pmLabel')};
  const applyButton = ${getField('applyButton')};

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    console.log('Date selected:', clickedDate.toDateString());
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
            "p-2 text-sm rounded-lg transition-colors",
            isSelected(day)
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formatDateTime = () => {
    if (!selectedDate) return '';
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return \`\${selectedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })} at \${hour}:\${m} \${isPM ? pmLabel : amLabel} (\${timezone})\`;
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{datetimeTitle}</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
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

              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Time</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hour
                    </label>
                    <select
                      value={hour}
                      onChange={(e) => setHour(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minute
                    </label>
                    <select
                      value={minute}
                      onChange={(e) => setMinute(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setIsPM(false)}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg font-medium transition-colors",
                      !isPM
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {amLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPM(true)}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg font-medium transition-colors",
                      isPM
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {pmLabel}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <label className="font-semibold text-gray-900 dark:text-white">
                    {timezoneLabel}
                  </label>
                </div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timezones.map((tz: any) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Selected Date & Time
            </p>
            <p className="text-base text-blue-700 dark:text-blue-300">
              {formatDateTime()}
            </p>
          </div>

          <button
            type="button"
            onClick={() => console.log('Applied:', formatDateTime())}
            className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {applyButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatetimePickerCombined;
    `,

    separate: `
${commonImports}

interface DatetimePickerSeparateProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const DatetimePickerSeparate: React.FC<DatetimePickerSeparateProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [timezone, setTimezone] = useState('UTC');

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

  const datetimePickerData = propData || fetchedData || {};

  const datetimeTitle = ${getField('datetimeTitle')};
  const dateLabel = ${getField('dateLabel')};
  const timeLabel = ${getField('timeLabel')};
  const timezoneLabel = ${getField('timezoneLabel')};
  const timezones = ${getField('timezones')};
  const datePlaceholder = ${getField('datePlaceholder')};
  const timePlaceholder = ${getField('timePlaceholder')};
  const applyButton = ${getField('applyButton')};
  const clearButton = ${getField('clearButton')};

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setSelectedDate(date);
    console.log('Date changed:', date?.toDateString());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
    console.log('Time changed:', e.target.value);
  };

  const handleClear = () => {
    setSelectedDate(null);
    setSelectedTime('12:00');
    setTimezone('UTC');
    console.log('Cleared');
  };

  const formatDateTime = () => {
    if (!selectedDate) return '';
    return \`\${selectedDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })} at \${selectedTime} (\${timezone})\`;
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{datetimeTitle}</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {dateLabel}
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  onChange={handleDateChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {timeLabel}
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {timezoneLabel}
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timezones.map((tz: any) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedDate && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Selected Date & Time
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatDateTime()}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => console.log('Applied:', formatDateTime())}
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
      </div>
    </div>
  );
};

export default DatetimePickerSeparate;
    `,

    preset: `
${commonImports}

interface DatetimePickerPresetProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const DatetimePickerPreset: React.FC<DatetimePickerPresetProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [timezone, setTimezone] = useState('UTC');

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

  const datetimePickerData = propData || fetchedData || {};

  const datetimeTitle = ${getField('datetimeTitle')};
  const nowButton = ${getField('nowButton')};
  const tomorrowButton = ${getField('tomorrowButton')};
  const nextWeekButton = ${getField('nextWeekButton')};
  const timezoneLabel = ${getField('timezoneLabel')};
  const timezones = ${getField('timezones')};
  const clearButton = ${getField('clearButton')};
  const formatPreviewLabel = ${getField('formatPreviewLabel')};

  const handleNow = () => {
    setSelectedDateTime(new Date());
    console.log('Now selected:', new Date().toString());
  };

  const handleTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setSelectedDateTime(tomorrow);
    console.log('Tomorrow selected:', tomorrow.toString());
  };

  const handleNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0);
    setSelectedDateTime(nextWeek);
    console.log('Next week selected:', nextWeek.toString());
  };

  const handleClear = () => {
    setSelectedDateTime(null);
    console.log('Cleared');
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{datetimeTitle}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              type="button"
              onClick={handleNow}
              className="p-4 border-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
            >
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">{nowButton}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current time</p>
            </button>

            <button
              type="button"
              onClick={handleTomorrow}
              className="p-4 border-2 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors group"
            >
              <CalendarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">{tomorrowButton}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tomorrow 9:00 AM</p>
            </button>

            <button
              type="button"
              onClick={handleNextWeek}
              className="p-4 border-2 border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
            >
              <CalendarIcon className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">{nextWeekButton}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+7 days, 9:00 AM</p>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {timezoneLabel}
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timezones.map((tz: any) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedDateTime ? (
            <>
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formatPreviewLabel}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {formatDateTime(selectedDateTime)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Timezone: {timezone}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                {clearButton}
              </button>
            </>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a preset to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatetimePickerPreset;
    `
  };

  return variants[variant] || variants.combined;
};
