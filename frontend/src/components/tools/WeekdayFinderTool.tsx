import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CalendarDays, Copy, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WeekdayFinderToolProps {
  uiConfig?: UIConfig;
}

export const WeekdayFinderTool: React.FC<WeekdayFinderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        // Try to parse date from content
        const parsedDate = new Date(params.content);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate.toISOString().split('T')[0]);
          setIsPrefilled(true);
        }
      } else if (params.text) {
        // Try to parse date from text
        const parsedDate = new Date(params.text);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate.toISOString().split('T')[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const result = useMemo(() => {
    const d = new Date(date + 'T00:00:00');
    if (isNaN(d.getTime())) return null;

    const dayOfWeek = d.getDay();
    const dayName = weekdays[dayOfWeek];
    const monthName = months[d.getMonth()];
    const dayOfMonth = d.getDate();
    const year = d.getFullYear();

    // Calculate day of year
    const start = new Date(year, 0, 0);
    const diff = d.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Calculate week number
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    // Calculate quarter
    const quarter = Math.ceil((d.getMonth() + 1) / 3);

    // Is it a weekend?
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Days until end of year
    const endOfYear = new Date(year, 11, 31);
    const daysRemaining = Math.ceil((endOfYear.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    // Days from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysFromToday = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      dayName,
      dayOfWeek,
      monthName,
      dayOfMonth,
      year,
      dayOfYear,
      weekNumber,
      quarter,
      isWeekend,
      daysRemaining,
      daysFromToday,
      formatted: `${dayName}, ${monthName} ${dayOfMonth}, ${year}`,
    };
  }, [date]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const historicalDates = [
    { label: 'Moon Landing', date: '1969-07-20' },
    { label: 'Fall of Berlin Wall', date: '1989-11-09' },
    { label: 'Y2K', date: '2000-01-01' },
    { label: 'Your Birthday?', date: '2000-01-15' },
  ];

  const getDayColor = (dayIndex: number) => {
    if (dayIndex === 0) return 'text-red-500';
    if (dayIndex === 6) return 'text-blue-500';
    return isDark ? 'text-white' : 'text-gray-900';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <CalendarDays className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weekdayFinder.weekdayFinder', 'Weekday Finder')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weekdayFinder.findWhatDayOfThe', 'Find what day of the week any date falls on')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Date Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.weekdayFinder.selectDate', 'Select Date')}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border text-lg ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Quick Dates */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.weekdayFinder.today', 'Today')}
          </button>
          {historicalDates.map((hd) => (
            <button
              key={hd.label}
              onClick={() => setDate(hd.date)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {hd.label}
            </button>
          ))}
        </div>

        {/* Result */}
        {result && (
          <>
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} border`}>
              <div className={`text-5xl font-bold mb-2 ${getDayColor(result.dayOfWeek)}`}>
                {result.dayName}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {result.formatted}
                </span>
                <button
                  onClick={handleCopy}
                  className={`p-1 rounded transition-colors ${
                    copied ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {result.isWeekend && (
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                  isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                }`}>
                  {t('tools.weekdayFinder.weekend', 'Weekend!')}
                </span>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {result.dayOfYear}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weekdayFinder.dayOfYear', 'Day of Year')}</div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Week {result.weekNumber}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weekdayFinder.weekNumber', 'Week Number')}</div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Q{result.quarter}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weekdayFinder.quarter', 'Quarter')}</div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {result.daysRemaining}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weekdayFinder.daysToYearEnd', 'Days to Year End')}</div>
              </div>
            </div>

            {/* Days from Today */}
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {result.daysFromToday === 0 ? (
                  <span className="text-green-500 font-medium">{t('tools.weekdayFinder.thisIsToday', 'This is today!')}</span>
                ) : result.daysFromToday > 0 ? (
                  <><span className="font-bold text-indigo-500">{result.daysFromToday}</span> {t('tools.weekdayFinder.daysFromNow', 'days from now')}</>
                ) : (
                  <><span className="font-bold text-indigo-500">{Math.abs(result.daysFromToday)}</span> {t('tools.weekdayFinder.daysAgo', 'days ago')}</>
                )}
              </span>
            </div>
          </>
        )}

        {/* Week Legend */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex justify-between text-sm">
            {weekdays.map((day, idx) => (
              <span key={day} className={getDayColor(idx)}>
                {day.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekdayFinderTool;
