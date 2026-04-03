import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Copy, RefreshCw, Calendar, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CronPart {
  value: string;
  label: string;
  options: { value: string; label: string }[];
}

const presets = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every 5 minutes', cron: '*/5 * * * *' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
  { label: 'Every 30 minutes', cron: '*/30 * * * *' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at midnight', cron: '0 0 * * *' },
  { label: 'Every day at noon', cron: '0 12 * * *' },
  { label: 'Every Sunday at midnight', cron: '0 0 * * 0' },
  { label: 'Every Monday at 9 AM', cron: '0 9 * * 1' },
  { label: 'First of every month', cron: '0 0 1 * *' },
  { label: 'Every weekday at 9 AM', cron: '0 9 * * 1-5' },
  { label: 'Every year (Jan 1)', cron: '0 0 1 1 *' },
];

const daysOfWeek = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const months = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

interface CronBuilderToolProps {
  uiConfig?: UIConfig;
}

export const CronBuilderTool: React.FC<CronBuilderToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        minute?: string;
        hour?: string;
        dayOfMonth?: string;
        month?: string;
        dayOfWeek?: string;
        expression?: string;
      };
      if (params.expression) {
        const parts = params.expression.split(' ');
        if (parts.length === 5) {
          setMinute(parts[0]);
          setHour(parts[1]);
          setDayOfMonth(parts[2]);
          setMonth(parts[3]);
          setDayOfWeek(parts[4]);
        }
      } else {
        if (params.minute) setMinute(params.minute);
        if (params.hour) setHour(params.hour);
        if (params.dayOfMonth) setDayOfMonth(params.dayOfMonth);
        if (params.month) setMonth(params.month);
        if (params.dayOfWeek) setDayOfWeek(params.dayOfWeek);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const cronExpression = useMemo(() => {
    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const humanReadable = useMemo(() => {
    // Helper to format time
    const formatTime = (h: string, m: string): string => {
      const hourNum = parseInt(h, 10);
      const minNum = parseInt(m, 10);
      if (isNaN(hourNum) || isNaN(minNum)) return '';
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      const displayMin = minNum.toString().padStart(2, '0');
      return `${displayHour}:${displayMin} ${period}`;
    };

    const parts: string[] = [];

    // Handle specific time (both minute and hour are specific numbers)
    const isSpecificMinute = !minute.includes('*') && !minute.includes('/') && !minute.includes(',') && !minute.includes('-');
    const isSpecificHour = !hour.includes('*') && !hour.includes('/') && !hour.includes(',') && !hour.includes('-');

    if (isSpecificMinute && isSpecificHour) {
      parts.push(`At ${formatTime(hour, minute)}`);
    } else {
      // Minute
      if (minute === '*') {
        parts.push('Every minute');
      } else if (minute.startsWith('*/')) {
        parts.push(`Every ${minute.slice(2)} minutes`);
      } else if (minute.includes(',')) {
        parts.push(`At minutes ${minute}`);
      } else if (minute.includes('-')) {
        const [start, end] = minute.split('-');
        parts.push(`From minute ${start} through ${end}`);
      } else {
        parts.push(`At minute ${minute}`);
      }

      // Hour
      if (hour === '*') {
        if (minute !== '*') {
          parts.push('of every hour');
        }
      } else if (hour.startsWith('*/')) {
        parts.push(`every ${hour.slice(2)} hours`);
      } else if (hour.includes(',')) {
        const hours = hour.split(',').map(h => {
          const num = parseInt(h, 10);
          return num >= 12 ? `${num === 12 ? 12 : num - 12} PM` : `${num === 0 ? 12 : num} AM`;
        });
        parts.push(`at ${hours.join(', ')}`);
      } else if (hour.includes('-')) {
        const [start, end] = hour.split('-');
        parts.push(`between ${start}:00 and ${end}:00`);
      }
    }

    // Day of Month
    if (dayOfMonth !== '*') {
      if (dayOfMonth.startsWith('*/')) {
        parts.push(`every ${dayOfMonth.slice(2)} days`);
      } else if (dayOfMonth.includes(',')) {
        parts.push(`on days ${dayOfMonth} of the month`);
      } else {
        const day = parseInt(dayOfMonth, 10);
        const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
        parts.push(`on the ${day}${suffix}`);
      }
    }

    // Month
    if (month !== '*') {
      if (month.includes(',')) {
        const monthNames = month.split(',').map(m => months.find(mo => mo.value === m)?.label || m);
        parts.push(`in ${monthNames.join(', ')}`);
      } else {
        const monthName = months.find(m => m.value === month)?.label || month;
        parts.push(`in ${monthName}`);
      }
    }

    // Day of Week
    if (dayOfWeek !== '*') {
      if (dayOfWeek.includes('-')) {
        const [start, end] = dayOfWeek.split('-');
        const startDay = daysOfWeek.find(d => d.value === start)?.label || start;
        const endDay = daysOfWeek.find(d => d.value === end)?.label || end;
        parts.push(`${startDay} through ${endDay}`);
      } else if (dayOfWeek.includes(',')) {
        const dayNames = dayOfWeek.split(',').map(d => daysOfWeek.find(day => day.value === d)?.label || d);
        parts.push(`on ${dayNames.join(', ')}`);
      } else {
        const dayName = daysOfWeek.find(d => d.value === dayOfWeek)?.label || dayOfWeek;
        parts.push(`on ${dayName}`);
      }
    }

    return parts.join(' ') || 'Every minute';
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const handlePreset = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMinute('*');
    setHour('*');
    setDayOfMonth('*');
    setMonth('*');
    setDayOfWeek('*');
  };

  const getNextRuns = () => {
    // Simple calculation for next runs (approximate)
    const runs: Date[] = [];
    const now = new Date();

    // This is a simplified version - for accurate scheduling, use a proper cron parser
    for (let i = 0; i < 5; i++) {
      const next = new Date(now);
      next.setMinutes(next.getMinutes() + i + 1);
      next.setSeconds(0);
      next.setMilliseconds(0);
      runs.push(next);
    }

    return runs;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cronBuilder.cronExpressionBuilder', 'Cron Expression Builder')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cronBuilder.buildAndUnderstandCronExpressions', 'Build and understand cron expressions')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.cronBuilder.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Cron Expression Display */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
              {t('tools.cronBuilder.cronExpression', 'Cron Expression')}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-blue-800 hover:bg-blue-700 text-blue-200'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? t('tools.cronBuilder.copied', 'Copied!') : t('tools.cronBuilder.copy', 'Copy')}
              </button>
              <button
                onClick={handleReset}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'bg-blue-800 hover:bg-blue-700 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <code className={`text-2xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {cronExpression}
          </code>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {humanReadable}
          </p>
        </div>

        {/* Field Editors */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Minute */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.cronBuilder.minute', 'Minute')}
            </label>
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="0-59"
              className={`w-full px-3 py-2 rounded-lg border font-mono text-center ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>0-59</p>
          </div>

          {/* Hour */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.cronBuilder.hour', 'Hour')}
            </label>
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              placeholder="0-23"
              className={`w-full px-3 py-2 rounded-lg border font-mono text-center ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>0-23</p>
          </div>

          {/* Day of Month */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.cronBuilder.dayMonth', 'Day (Month)')}
            </label>
            <input
              type="text"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              placeholder="1-31"
              className={`w-full px-3 py-2 rounded-lg border font-mono text-center ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>1-31</p>
          </div>

          {/* Month */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.cronBuilder.month', 'Month')}
            </label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="1-12"
              className={`w-full px-3 py-2 rounded-lg border font-mono text-center ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>1-12</p>
          </div>

          {/* Day of Week */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.cronBuilder.dayWeek', 'Day (Week)')}
            </label>
            <input
              type="text"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              placeholder="0-6"
              className={`w-full px-3 py-2 rounded-lg border font-mono text-center ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>0-6 (Sun-Sat)</p>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.cronBuilder.commonPresets', 'Common Presets')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.cron}
                onClick={() => handlePreset(preset.cron)}
                className={`p-3 rounded-lg text-left transition-all text-sm ${
                  cronExpression === preset.cron
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <p className="font-medium">{preset.label}</p>
                <code className={`text-xs ${cronExpression === preset.cron ? 'text-blue-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {preset.cron}
                </code>
              </button>
            ))}
          </div>
        </div>

        {/* Syntax Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-3">
            <Info className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <div>
              <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.cronBuilder.cronSyntaxReference', 'Cron Syntax Reference')}
              </p>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">*</code> - Any value</p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">*/n</code> - Every n units</p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">n,m</code> - At n and m</p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">n-m</code> - From n to m</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronBuilderTool;
