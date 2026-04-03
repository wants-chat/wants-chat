import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTimePicker = (
  resolved: ResolvedComponent,
  variant: 'dropdown' | 'slider' | 'inline' = 'dropdown'
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
import { Clock, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    dropdown: `
${commonImports}

interface TimePickerDropdownProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const TimePickerDropdown: React.FC<TimePickerDropdownProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [is24Hour, setIs24Hour] = useState(false);
  const [isPM, setIsPM] = useState(false);
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

  const timePickerData = propData || fetchedData || {};

  const timeTitle = ${getField('timeTitle')};
  const hourLabel = ${getField('hourLabel')};
  const minuteLabel = ${getField('minuteLabel')};
  const nowButton = ${getField('nowButton')};
  const clearButton = ${getField('clearButton')};
  const amLabel = ${getField('amLabel')};
  const pmLabel = ${getField('pmLabel')};
  const timePlaceholder = ${getField('timePlaceholder')};

  const hours24 = Array.from({ length: 24 }, (_, i) => i);
  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleNow = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (is24Hour) {
      setHour(currentHour);
    } else {
      setHour(currentHour % 12 || 12);
      setIsPM(currentHour >= 12);
    }
    setMinute(currentMinute);
    console.log('Now selected:', now.toLocaleTimeString());
  };

  const handleClear = () => {
    setHour(is24Hour ? 0 : 12);
    setMinute(0);
    setIsPM(false);
    console.log('Time cleared');
  };

  const formatTime = () => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');

    if (is24Hour) {
      return \`\${h}:\${m}\`;
    } else {
      return \`\${hour}:\${m} \${isPM ? pmLabel : amLabel}\`;
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{timeTitle}</h2>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span>{formatTime()}</span>
              <Clock className="h-5 w-5 text-gray-400" />
            </button>

            {isOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={is24Hour}
                      onChange={(e) => {
                        setIs24Hour(e.target.checked);
                        if (e.target.checked) {
                          setHour(isPM ? hour + 12 : hour);
                        } else {
                          setHour(hour > 12 ? hour - 12 : hour || 12);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">24-hour format</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {hourLabel}
                    </label>
                    <select
                      value={hour}
                      onChange={(e) => setHour(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {(is24Hour ? hours24 : hours12).map((h) => (
                        <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {minuteLabel}
                    </label>
                    <select
                      value={minute}
                      onChange={(e) => setMinute(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!is24Hour && (
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setIsPM(false)}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg font-medium transition-colors",
                        !isPM
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}
                    >
                      {pmLabel}
                    </button>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      handleNow();
                      setIsOpen(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {nowButton}
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

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Selected: {formatTime()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePickerDropdown;
    `,

    slider: `
${commonImports}

interface TimePickerSliderProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const TimePickerSlider: React.FC<TimePickerSliderProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [is24Hour, setIs24Hour] = useState(false);
  const [isPM, setIsPM] = useState(false);

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

  const timePickerData = propData || fetchedData || {};

  const timeTitle = ${getField('timeTitle')};
  const hourLabel = ${getField('hourLabel')};
  const minuteLabel = ${getField('minuteLabel')};
  const nowButton = ${getField('nowButton')};
  const amLabel = ${getField('amLabel')};
  const pmLabel = ${getField('pmLabel')};

  const handleNow = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (is24Hour) {
      setHour(currentHour);
    } else {
      setHour(currentHour % 12 || 12);
      setIsPM(currentHour >= 12);
    }
    setMinute(currentMinute);
    console.log('Now selected:', now.toLocaleTimeString());
  };

  const formatTime = () => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');

    if (is24Hour) {
      return \`\${h}:\${m}\`;
    } else {
      return \`\${hour}:\${m} \${isPM ? pmLabel : amLabel}\`;
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{timeTitle}</h2>
            <button
              type="button"
              onClick={handleNow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {nowButton}
            </button>
          </div>

          <div className="mb-6 text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {formatTime()}
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={is24Hour}
                onChange={(e) => {
                  setIs24Hour(e.target.checked);
                  if (e.target.checked) {
                    setHour(isPM ? hour + 12 : hour);
                  } else {
                    setHour(hour > 12 ? hour - 12 : hour || 12);
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">24-hour format</span>
            </label>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {hourLabel}
                </label>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {hour.toString().padStart(2, '0')}
                </span>
              </div>
              <input
                type="range"
                min={is24Hour ? 0 : 1}
                max={is24Hour ? 23 : 12}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {minuteLabel}
                </label>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {minute.toString().padStart(2, '0')}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {!is24Hour && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPM(false)}
                  className={cn(
                    "flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all",
                    !isPM
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  {amLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPM(true)}
                  className={cn(
                    "flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all",
                    isPM
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  {pmLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePickerSlider;
    `,

    inline: `
${commonImports}

interface TimePickerInlineProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const TimePickerInline: React.FC<TimePickerInlineProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [is24Hour, setIs24Hour] = useState(false);
  const [isPM, setIsPM] = useState(false);

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

  const timePickerData = propData || fetchedData || {};

  const timeTitle = ${getField('timeTitle')};
  const hourLabel = ${getField('hourLabel')};
  const minuteLabel = ${getField('minuteLabel')};
  const secondLabel = ${getField('secondLabel')};
  const nowButton = ${getField('nowButton')};
  const amLabel = ${getField('amLabel')};
  const pmLabel = ${getField('pmLabel')};

  const hours = is24Hour
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  const handleNow = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    if (is24Hour) {
      setHour(currentHour);
    } else {
      setHour(currentHour % 12 || 12);
      setIsPM(currentHour >= 12);
    }
    setMinute(currentMinute);
    setSecond(currentSecond);
    console.log('Now selected:', now.toLocaleTimeString());
  };

  const handleTimePartClick = (value: number, type: 'hour' | 'minute' | 'second') => {
    if (type === 'hour') setHour(value);
    if (type === 'minute') setMinute(value);
    if (type === 'second') setSecond(value);
    console.log(\`\${type} selected:\`, value);
  };

  const formatTime = () => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    const s = second.toString().padStart(2, '0');

    if (is24Hour) {
      return \`\${h}:\${m}:\${s}\`;
    } else {
      return \`\${hour}:\${m}:\${s} \${isPM ? pmLabel : amLabel}\`;
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{timeTitle}</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={is24Hour}
                  onChange={(e) => {
                    setIs24Hour(e.target.checked);
                    if (e.target.checked) {
                      setHour(isPM ? hour + 12 : hour);
                    } else {
                      setHour(hour > 12 ? hour - 12 : hour || 12);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">24-hour</span>
              </label>
              <button
                type="button"
                onClick={handleNow}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {nowButton}
              </button>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected Time</p>
            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              {formatTime()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                {hourLabel}
              </h3>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleTimePartClick(h, 'hour')}
                    className={cn(
                      "p-3 rounded-lg font-medium transition-colors",
                      hour === h
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {h.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                {minuteLabel}
              </h3>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {minutes.filter((m) => m % 5 === 0).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleTimePartClick(m, 'minute')}
                    className={cn(
                      "p-3 rounded-lg font-medium transition-colors",
                      minute === m
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {m.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                {secondLabel}
              </h3>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {seconds.filter((s) => s % 5 === 0).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleTimePartClick(s, 'second')}
                    className={cn(
                      "p-3 rounded-lg font-medium transition-colors",
                      second === s
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {s.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!is24Hour && (
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsPM(false)}
                className={cn(
                  "flex-1 px-6 py-3 rounded-lg font-bold transition-all",
                  !isPM
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {amLabel}
              </button>
              <button
                type="button"
                onClick={() => setIsPM(true)}
                className={cn(
                  "flex-1 px-6 py-3 rounded-lg font-bold transition-all",
                  isPM
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {pmLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimePickerInline;
    `
  };

  return variants[variant] || variants.dropdown;
};
