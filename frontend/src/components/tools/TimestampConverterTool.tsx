import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Calendar, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type TimestampUnit = 'seconds' | 'milliseconds';

interface TimestampConverterToolProps {
  uiConfig?: UIConfig;
}

const TimestampConverterTool: React.FC<TimestampConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [timestamp, setTimestamp] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>('seconds');
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().slice(0, 16));
  const [humanReadable, setHumanReadable] = useState<string>('');
  const [timestampFromDate, setTimestampFromDate] = useState<string>('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.amount !== undefined) {
        setTimestamp(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        // Try to extract a timestamp (large number)
        const numMatch = textContent.match(/\d{10,13}/);
        if (numMatch) {
          setTimestamp(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const timestampToDate = () => {
    const ts = parseFloat(timestamp);
    if (isNaN(ts)) {
      setHumanReadable('Invalid timestamp');
      return;
    }

    const date = timestampUnit === 'seconds'
      ? new Date(ts * 1000)
      : new Date(ts);

    if (isNaN(date.getTime())) {
      setHumanReadable('Invalid timestamp');
      return;
    }

    const formatted = date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    setHumanReadable(formatted);
  };

  const dateToTimestamp = () => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      setTimestampFromDate('Invalid date');
      return;
    }

    const ts = timestampUnit === 'seconds'
      ? Math.floor(date.getTime() / 1000)
      : date.getTime();

    setTimestampFromDate(String(ts));
  };

  const getCurrentTimestamp = () => {
    const ts = timestampUnit === 'seconds'
      ? Math.floor(Date.now() / 1000)
      : Date.now();
    setTimestamp(String(ts));
  };

  const handleTimestampChange = (value: string) => {
    setTimestamp(value);
    setHumanReadable('');
  };

  const handleDateChange = (value: string) => {
    setDateInput(value);
    setTimestampFromDate('');
  };

  const handleUnitChange = (unit: TimestampUnit) => {
    const currentTs = parseFloat(timestamp);
    if (!isNaN(currentTs)) {
      if (unit === 'milliseconds' && timestampUnit === 'seconds') {
        setTimestamp(String(currentTs * 1000));
      } else if (unit === 'seconds' && timestampUnit === 'milliseconds') {
        setTimestamp(String(Math.floor(currentTs / 1000)));
      }
    }
    setTimestampUnit(unit);
    setHumanReadable('');
    setTimestampFromDate('');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.timestampConverter.timestampConverter', 'Timestamp Converter')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.timestampConverter.convertBetweenUnixTimestampsAnd', 'Convert between Unix timestamps and human-readable dates')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.timestampConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Unit Selector */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.timestampConverter.timestampUnit', 'Timestamp Unit')}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => handleUnitChange('seconds')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  timestampUnit === 'seconds'
                    ? 'bg-[#0D9488] text-white border-[#0D9488]'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('tools.timestampConverter.seconds', 'Seconds')}
              </button>
              <button
                onClick={() => handleUnitChange('milliseconds')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  timestampUnit === 'milliseconds'
                    ? 'bg-[#0D9488] text-white border-[#0D9488]'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('tools.timestampConverter.milliseconds', 'Milliseconds')}
              </button>
            </div>
          </div>

          {/* Timestamp to Date */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {t('tools.timestampConverter.timestampToDate', 'Timestamp to Date')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Unix Timestamp ({timestampUnit})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={timestamp}
                    onChange={(e) => handleTimestampChange(e.target.value)}
                    className={`flex-1 px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={`Enter timestamp in ${timestampUnit}`}
                  />
                  <button
                    onClick={getCurrentTimestamp}
                    className="px-4 py-3 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors whitespace-nowrap"
                  >
                    {t('tools.timestampConverter.currentTime', 'Current Time')}
                  </button>
                </div>
              </div>
              <button
                onClick={timestampToDate}
                className="w-full px-4 py-3 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
              >
                {t('tools.timestampConverter.convertToDate', 'Convert to Date')}
              </button>
              {humanReadable && (
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {humanReadable}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Date to Timestamp */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {t('tools.timestampConverter.dateToTimestamp', 'Date to Timestamp')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.timestampConverter.dateAndTime', 'Date and Time')}
                </label>
                <input
                  type="datetime-local"
                  value={dateInput}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <button
                onClick={dateToTimestamp}
                className="w-full px-4 py-3 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
              >
                {t('tools.timestampConverter.convertToTimestamp', 'Convert to Timestamp')}
              </button>
              {timestampFromDate && (
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Timestamp: {timestampFromDate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Unix timestamp represents the number of {timestampUnit} that have elapsed since January 1, 1970 (UTC).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverterTool;
