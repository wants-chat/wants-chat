import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Bell,
  X,
  Check,
  Repeat,
  Tag,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Toast } from '../ui/toast';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes
  category: EventCategory;
  recurring: RecurringType;
  reminder: ReminderType;
  description?: string;
  createdAt: string;
}

type EventCategory = 'meeting' | 'personal' | 'work' | 'other';
type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly';
type ReminderType = 'none' | '5min' | '15min' | '30min' | '1hour' | '1day';

// Constants
const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; dot: string }> = {
  meeting: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  personal: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  work: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  other: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  meeting: 'Meeting',
  personal: 'Personal',
  work: 'Work',
  other: 'Other',
};

const RECURRING_LABELS: Record<RecurringType, string> = {
  none: 'Does not repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const REMINDER_LABELS: Record<ReminderType, string> = {
  none: 'No reminder',
  '5min': '5 minutes before',
  '15min': '15 minutes before',
  '30min': '30 minutes before',
  '1hour': '1 hour before',
  '1day': '1 day before',
};

// Column configuration for export
const COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'recurring', header: 'Recurring', type: 'string' },
  { key: 'reminder', header: 'Reminder', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper functions
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

const isToday = (dateStr: string): boolean => {
  return dateStr === formatDate(new Date());
};

const isPastDate = (dateStr: string): boolean => {
  const today = formatDate(new Date());
  return dateStr < today;
};

const getUpcomingEvents = (events: Event[], days: number = 7): Event[] => {
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  const todayStr = formatDate(today);
  const endDateStr = formatDate(endDate);

  return events
    .filter((event) => event.date >= todayStr && event.date <= endDateStr)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
};

interface EventSchedulerToolProps {
  uiConfig?: UIConfig;
}

// Main component
export const EventSchedulerTool: React.FC<EventSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: events,
    setData: setEvents,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Event>('event-scheduler', [], COLUMNS);

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Event form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '09:00',
    duration: 60,
    category: 'meeting' as EventCategory,
    recurring: 'none' as RecurringType,
    reminder: 'none' as ReminderType,
    description: '',
  });

  // Validation message state
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      // Prefill with event date if provided
      if (params.content) {
        // Try to parse as a date
        const parsedDate = new Date(params.content);
        if (!isNaN(parsedDate.getTime())) {
          const dateStr = formatDate(parsedDate);
          setSelectedDate(dateStr);
          setCurrentDate(parsedDate);
          setShowDayDetail(true);
          setIsPrefilled(true);
        }
      }

      // Prefill with event title/description from text
      if (params.text) {
        setFormData(prev => ({
          ...prev,
          title: params.text || '',
          date: formatDate(new Date()),
        }));
        setShowEventModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Filter events based on search and category
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, categoryFilter]);

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents
      .filter((event) => isSameDay(event.date, selectedDate))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredEvents, selectedDate]);

  // Upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(filteredEvents, 7);
  }, [filteredEvents]);

  // Get events for a specific date
  const getEventsForDate = (dateStr: string): Event[] => {
    return filteredEvents.filter((event) => isSameDay(event.date, dateStr));
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(formatDate(new Date()));
    setShowDayDetail(true);
  };

  // Event handlers
  const handleDayClick = (day: number) => {
    const dateStr = formatDate(new Date(year, month, day));
    setSelectedDate(dateStr);
    setShowDayDetail(true);
  };

  const openAddEventModal = (date?: string) => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: date || selectedDate || formatDate(new Date()),
      time: '09:00',
      duration: 60,
      category: 'meeting',
      recurring: 'none',
      reminder: 'none',
      description: '',
    });
    setShowEventModal(true);
  };

  const openEditEventModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      duration: event.duration,
      category: event.category,
      recurring: event.recurring,
      reminder: event.reminder,
      description: event.description || '',
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!formData.title.trim() || !formData.date || !formData.time) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingEvent) {
      // Update existing event using hook's updateItem
      updateItem(editingEvent.id, {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        category: formData.category,
        recurring: formData.recurring,
        reminder: formData.reminder,
        description: formData.description || undefined,
      });
    } else {
      // Create new event using hook's addItem
      const newEvent: Event = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addItem(newEvent);
    }

    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const confirmed = await confirm({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(eventId);
    }
  };

  // Render calendar grid
  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDayOfMonth + 1;
      const isCurrentMonth = day > 0 && day <= daysInMonth;
      const dateStr = isCurrentMonth ? formatDate(new Date(year, month, day)) : '';
      const dayEvents = isCurrentMonth ? getEventsForDate(dateStr) : [];
      const isSelected = selectedDate === dateStr;
      const isTodayDate = isCurrentMonth && isToday(dateStr);
      const isPast = isCurrentMonth && isPastDate(dateStr);

      days.push(
        <div
          key={i}
          onClick={() => isCurrentMonth && handleDayClick(day)}
          className={`
            min-h-[80px] p-1 border-b border-r transition-colors cursor-pointer
            ${isDark ? 'border-gray-700' : 'border-gray-200'}
            ${isCurrentMonth ? '' : 'invisible'}
            ${isPast && !isTodayDate ? (isDark ? 'bg-gray-800/50' : 'bg-gray-50') : ''}
            ${isSelected ? (isDark ? 'bg-teal-900/30' : 'bg-teal-50') : ''}
            ${isCurrentMonth && !isPast ? (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100') : ''}
          `}
        >
          {isCurrentMonth && (
            <>
              <div
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1
                  ${isTodayDate ? 'bg-[#0D9488] text-white' : ''}
                  ${isPast && !isTodayDate ? (isDark ? 'text-gray-500' : 'text-gray-400') : ''}
                  ${!isTodayDate && !isPast ? (isDark ? 'text-white' : 'text-gray-900') : ''}
                `}
              >
                {day}
              </div>
              {dayEvents.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[event.category].dot}`}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    return days;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`max-w-6xl mx-auto p-4 md:p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-4 md:p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0D9488] rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.eventScheduler.eventScheduler', 'Event Scheduler')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs text-[#0D9488] font-medium">{t('tools.eventScheduler.prefilled', 'Prefilled')}</span>
            </div>
          )}
          <WidgetEmbedButton toolSlug="event-scheduler" toolName="Event Scheduler" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'event-scheduler' })}
            onExportExcel={() => exportExcel({ filename: 'event-scheduler' })}
            onExportJSON={() => exportJSON({ filename: 'event-scheduler' })}
            onExportPDF={() => exportPDF({ filename: 'event-scheduler', title: 'Event Scheduler Report' })}
            onPrint={() => print('Event Scheduler Report')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            onImportCSV={async (file) => { await importCSV(file); }}
            onImportJSON={async (file) => { await importJSON(file); }}
            disabled={events.length === 0}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.eventScheduler.searchEvents', 'Search events...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>
        <div className="relative">
          <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as EventCategory | 'all')}
            className={`pl-10 pr-8 py-2 rounded-lg border appearance-none ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="all">{t('tools.eventScheduler.allCategories', 'All Categories')}</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openAddEventModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {t('tools.eventScheduler.addEvent', 'Add Event')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <h3 className={`text-lg font-semibold min-w-[160px] text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {MONTHS[month]} {year}
              </h3>
              <button
                onClick={goToNextMonth}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronRight className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>
            <button
              onClick={goToToday}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {t('tools.eventScheduler.today', 'Today')}
            </button>
          </div>

          {/* Days of Week Header */}
          <div className={`grid grid-cols-7 border-t border-l ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className={`py-2 text-center text-sm font-medium border-r border-b ${
                  isDark ? 'border-gray-700 text-gray-400 bg-gray-900' : 'border-gray-200 text-gray-600 bg-gray-50'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className={`grid grid-cols-7 border-l ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {renderCalendarDays()}
          </div>

          {/* Category Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[key as EventCategory].dot}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Day Detail View */}
          {showDayDetail && selectedDate && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h4>
                <button
                  onClick={() => setShowDayDetail(false)}
                  className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                >
                  <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              {selectedDateEvents.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.eventScheduler.noEventsScheduled', 'No events scheduled')}
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg ${CATEGORY_COLORS[event.category].bg}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className={`font-medium truncate ${CATEGORY_COLORS[event.category].text}`}>
                            {event.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatTime(event.time)} ({event.duration} min)
                            </span>
                          </div>
                          {event.recurring !== 'none' && (
                            <div className="flex items-center gap-2 mt-1">
                              <Repeat className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {RECURRING_LABELS[event.recurring]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => openEditEventModal(event)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-white/50'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-white/50'}`}
                          >
                            <Trash2 className={`w-4 h-4 text-red-500`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => openAddEventModal(selectedDate)}
                className={`w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                {t('tools.eventScheduler.addEvent2', 'Add Event')}
              </button>
            </div>
          )}

          {/* Upcoming Events */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.eventScheduler.upcomingEvents7Days', 'Upcoming Events (7 days)')}
            </h4>

            {upcomingEvents.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.eventScheduler.noUpcomingEvents', 'No upcoming events')}
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedDate(event.date);
                      setShowDayDetail(true);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${CATEGORY_COLORS[event.category].dot}`} />
                      <div className="flex-1 min-w-0">
                        <h5 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {event.title}
                        </h5>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })} at {formatTime(event.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <Toast
          message={validationMessage}
          type="error"
          onClose={() => setValidationMessage(null)}
        />
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingEvent ? t('tools.eventScheduler.editEvent', 'Edit Event') : t('tools.eventScheduler.addEvent3', 'Add Event')}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventScheduler.title', 'Title *')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('tools.eventScheduler.eventTitle', 'Event title')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventScheduler.date', 'Date *')}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.eventScheduler.time', 'Time *')}
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventScheduler.durationMinutes', 'Duration (minutes)')}
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Tag className="w-4 h-4 inline mr-1" />
                  {t('tools.eventScheduler.category', 'Category')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: key as EventCategory })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        formData.category === key
                          ? `${CATEGORY_COLORS[key as EventCategory].bg} ${CATEGORY_COLORS[key as EventCategory].text} border-transparent`
                          : isDark
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[key as EventCategory].dot}`} />
                      {label}
                      {formData.category === key && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recurring */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Repeat className="w-4 h-4 inline mr-1" />
                  {t('tools.eventScheduler.repeat', 'Repeat')}
                </label>
                <select
                  value={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.value as RecurringType })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {Object.entries(RECURRING_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Reminder */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Bell className="w-4 h-4 inline mr-1" />
                  {t('tools.eventScheduler.reminder', 'Reminder')}
                </label>
                <select
                  value={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.value as ReminderType })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {Object.entries(REMINDER_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eventScheduler.description', 'Description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('tools.eventScheduler.addDescriptionOptional', 'Add description (optional)')}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowEventModal(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {t('tools.eventScheduler.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveEvent}
                className="flex-1 py-2 px-4 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
              >
                {editingEvent ? t('tools.eventScheduler.saveChanges', 'Save Changes') : t('tools.eventScheduler.addEvent4', 'Add Event')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default EventSchedulerTool;
