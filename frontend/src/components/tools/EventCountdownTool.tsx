import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Plus, Trash2, Calendar, Share2, Copy, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface CountdownEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  color: string;
}

interface EventCountdownToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for export
const EVENT_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Event Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
];

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isPast: boolean;
}

export const EventCountdownTool: React.FC<EventCountdownToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [events, setEvents] = useState<CountdownEvent[]>([
    {
      id: '1',
      name: 'New Year 2026',
      date: '2026-01-01',
      time: '00:00',
      color: '#F59E0B',
    },
  ]);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', time: '00:00', color: '#6366F1' });
  const [timeRemaining, setTimeRemaining] = useState<Record<string, TimeRemaining>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        // Try to parse date and set for new event
        const parsedDate = new Date(params.content);
        if (!isNaN(parsedDate.getTime())) {
          setNewEvent(prev => ({
            ...prev,
            date: parsedDate.toISOString().split('T')[0],
            name: params.text || '',
          }));
          setIsPrefilled(true);
        }
      } else if (params.text) {
        // Set event name from text
        setNewEvent(prev => ({ ...prev, name: params.text || '' }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const colors = [
    '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16',
  ];

  const calculateTimeRemaining = (date: string, time: string): TimeRemaining => {
    const eventDate = new Date(`${date}T${time}`);
    const now = new Date();
    const total = eventDate.getTime() - now.getTime();
    const isPast = total < 0;

    const absDiff = Math.abs(total);

    return {
      days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((absDiff % (1000 * 60)) / 1000),
      total,
      isPast,
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: Record<string, TimeRemaining> = {};
      events.forEach((event) => {
        newTimeRemaining[event.id] = calculateTimeRemaining(event.date, event.time);
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const addEvent = () => {
    if (!newEvent.name || !newEvent.date) return;

    setEvents([
      ...events,
      {
        id: Date.now().toString(),
        ...newEvent,
      },
    ]);
    setNewEvent({ name: '', date: '', time: '00:00', color: '#6366F1' });
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const copyCountdown = (event: CountdownEvent) => {
    const remaining = timeRemaining[event.id];
    if (!remaining) return;

    const text = remaining.isPast
      ? `${event.name}: ${remaining.days}d ${remaining.hours}h ${remaining.minutes}m ago`
      : `${event.name}: ${remaining.days}d ${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s remaining`;

    navigator.clipboard.writeText(text);
    setCopied(event.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eventCountdown.eventCountdown', 'Event Countdown')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eventCountdown.countDownToImportantDates', 'Count down to important dates')}</p>
            </div>
          </div>
          <ExportDropdown
            onExportCSV={() => exportToCSV(events, EVENT_EXPORT_COLUMNS, { filename: 'event-countdown' })}
            onExportExcel={() => exportToExcel(events, EVENT_EXPORT_COLUMNS, { filename: 'event-countdown' })}
            onExportJSON={() => exportToJSON(events, { filename: 'event-countdown' })}
            onExportPDF={() => exportToPDF(events, EVENT_EXPORT_COLUMNS, { filename: 'event-countdown', title: 'Event Countdown', subtitle: `${events.length} events` })}
            onPrint={() => printData(events, EVENT_EXPORT_COLUMNS, { title: 'Event Countdown' })}
            onCopyToClipboard={() => copyUtil(events, EVENT_EXPORT_COLUMNS)}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Add New Event */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eventCountdown.addNewEvent', 'Add New Event')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventCountdown.eventName', 'Event Name')}</label>
              <input
                type="text"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                placeholder={t('tools.eventCountdown.myBirthdayVacationEtc', 'My Birthday, Vacation, etc.')}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventCountdown.date', 'Date')}</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventCountdown.time', 'Time')}</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventCountdown.color', 'Color:')}</span>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                      newEvent.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={addEvent}
              disabled={!newEvent.name || !newEvent.date}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {t('tools.eventCountdown.addEvent', 'Add Event')}
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('tools.eventCountdown.noEventsYetAddOne', 'No events yet. Add one above!')}</p>
            </div>
          ) : (
            events.map((event) => {
              const remaining = timeRemaining[event.id];
              return (
                <div
                  key={event.id}
                  className={`p-6 rounded-xl border-l-4 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}
                  style={{ borderLeftColor: event.color }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {event.name}
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(event.date)} at {event.time}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyCountdown(event)}
                        className={`p-2 rounded-lg transition-colors ${
                          copied === event.id
                            ? 'bg-green-500 text-white'
                            : isDark
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {copied === event.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => removeEvent(event.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white'
                            : 'bg-gray-100 hover:bg-red-500 text-gray-700 hover:text-white'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {remaining && (
                    <>
                      {remaining.isPast ? (
                        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.eventCountdown.thisEventHasPassed', 'This event has passed')}
                        </p>
                      ) : null}

                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Days', value: remaining.days },
                          { label: 'Hours', value: remaining.hours },
                          { label: 'Minutes', value: remaining.minutes },
                          { label: 'Seconds', value: remaining.seconds },
                        ].map((unit) => (
                          <div
                            key={unit.label}
                            className={`text-center p-3 rounded-xl ${
                              remaining.isPast
                                ? isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                                : isDark ? 'bg-gray-700' : 'bg-gray-50'
                            }`}
                          >
                            <div
                              className="text-3xl font-bold"
                              style={{ color: remaining.isPast ? (isDark ? '#6B7280' : '#9CA3AF') : event.color }}
                            >
                              {unit.value.toString().padStart(2, '0')}
                            </div>
                            <div className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {unit.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Popular Events */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.eventCountdown.popularEventsToTrack', 'Popular Events to Track:')}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'New Year 2026', date: '2026-01-01' },
              { name: 'Valentine\'s Day', date: '2026-02-14' },
              { name: 'Summer Solstice', date: '2026-06-21' },
              { name: 'Christmas 2026', date: '2026-12-25' },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => setNewEvent({ ...newEvent, name: preset.name, date: preset.date })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCountdownTool;
