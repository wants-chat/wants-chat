import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Plus, Trash2, Edit2, Check, X, Calendar, MapPin, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WeddingTimelineToolProps {
  uiConfig?: UIConfig;
}

interface TimelineEvent {
  id: string;
  time: string;
  endTime: string;
  title: string;
  location: string;
  description: string;
  category: 'preparation' | 'ceremony' | 'reception' | 'photos' | 'other';
  assignedTo: string;
}

const defaultEvents: TimelineEvent[] = [
  { id: '1', time: '08:00', endTime: '09:00', title: 'Hair & Makeup - Bride', location: 'Bridal Suite', description: 'Professional hair and makeup for the bride', category: 'preparation', assignedTo: 'Bride' },
  { id: '2', time: '09:00', endTime: '10:00', title: 'Hair & Makeup - Bridesmaids', location: 'Bridal Suite', description: 'Hair and makeup for bridesmaids', category: 'preparation', assignedTo: 'Bridesmaids' },
  { id: '3', time: '10:00', endTime: '10:30', title: 'Groom & Groomsmen Get Ready', location: 'Groom Suite', description: 'Groomsmen preparation', category: 'preparation', assignedTo: 'Groom' },
  { id: '4', time: '10:30', endTime: '11:00', title: 'First Look Photos', location: 'Garden', description: 'First look and couple photos', category: 'photos', assignedTo: 'Couple' },
  { id: '5', time: '11:00', endTime: '12:00', title: 'Wedding Party Photos', location: 'Garden & Venue', description: 'Group photos with wedding party', category: 'photos', assignedTo: 'Wedding Party' },
  { id: '6', time: '12:30', endTime: '13:00', title: 'Guests Arrive', location: 'Ceremony Venue', description: 'Guest arrival and seating', category: 'ceremony', assignedTo: 'Ushers' },
  { id: '7', time: '13:00', endTime: '13:30', title: 'Wedding Ceremony', location: 'Ceremony Venue', description: 'The wedding ceremony', category: 'ceremony', assignedTo: 'All' },
  { id: '8', time: '13:30', endTime: '14:00', title: 'Cocktail Hour', location: 'Terrace', description: 'Cocktails and appetizers', category: 'reception', assignedTo: 'Guests' },
  { id: '9', time: '14:00', endTime: '14:30', title: 'Grand Entrance', location: 'Reception Hall', description: 'Wedding party entrance and introduction', category: 'reception', assignedTo: 'Wedding Party' },
  { id: '10', time: '14:30', endTime: '16:00', title: 'Dinner Service', location: 'Reception Hall', description: 'Dinner and toasts', category: 'reception', assignedTo: 'All' },
  { id: '11', time: '16:00', endTime: '16:15', title: 'First Dance', location: 'Dance Floor', description: 'Couple\'s first dance', category: 'reception', assignedTo: 'Couple' },
  { id: '12', time: '16:15', endTime: '16:30', title: 'Parent Dances', location: 'Dance Floor', description: 'Father-daughter and mother-son dances', category: 'reception', assignedTo: 'Parents' },
  { id: '13', time: '16:30', endTime: '17:00', title: 'Cake Cutting', location: 'Reception Hall', description: 'Cutting the wedding cake', category: 'reception', assignedTo: 'Couple' },
  { id: '14', time: '17:00', endTime: '20:00', title: 'Open Dancing', location: 'Dance Floor', description: 'Dancing and celebration', category: 'reception', assignedTo: 'All' },
  { id: '15', time: '20:00', endTime: '20:15', title: 'Bouquet & Garter Toss', location: 'Dance Floor', description: 'Traditional tosses', category: 'reception', assignedTo: 'Single Guests' },
  { id: '16', time: '20:30', endTime: '21:00', title: 'Sparkler Send-Off', location: 'Exit', description: 'Grand exit with sparklers', category: 'other', assignedTo: 'All' },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  preparation: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500' },
  ceremony: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500' },
  reception: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500' },
  photos: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' },
  other: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500' },
};

export const WeddingTimelineTool: React.FC<WeddingTimelineToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [events, setEvents] = useState<TimelineEvent[]>(defaultEvents);
  const [weddingDate, setWeddingDate] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    preparation: true,
    ceremony: true,
    reception: true,
    photos: true,
    other: true,
  });
  const [newEvent, setNewEvent] = useState<Omit<TimelineEvent, 'id'>>({
    time: '',
    endTime: '',
    title: '',
    location: '',
    description: '',
    category: 'other',
    assignedTo: '',
  });
  const [eventErrors, setEventErrors] = useState<Record<string, string>>({});

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.date) {
        setWeddingDate(params.date.toString());
        setIsPrefilled(true);
      }
      if (params.formData?.weddingDate) {
        setWeddingDate(params.formData.weddingDate.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {
      preparation: [],
      photos: [],
      ceremony: [],
      reception: [],
      other: [],
    };
    const sortedEvents = [...events].sort((a, b) => a.time.localeCompare(b.time));
    sortedEvents.forEach((event) => {
      if (groups[event.category]) {
        groups[event.category].push(event);
      } else {
        groups.other.push(event);
      }
    });
    return groups;
  }, [events]);

  const stats = useMemo(() => {
    const sortedEvents = [...events].sort((a, b) => a.time.localeCompare(b.time));
    const firstEvent = sortedEvents[0];
    const lastEvent = sortedEvents[sortedEvents.length - 1];

    return {
      totalEvents: events.length,
      startTime: firstEvent?.time || '--:--',
      endTime: lastEvent?.endTime || '--:--',
      categories: Object.keys(groupedEvents).filter(k => groupedEvents[k].length > 0).length,
    };
  }, [events, groupedEvents]);

  const validateEvent = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newEvent.title.trim()) {
      errors.title = 'Event title is required';
    }
    if (!newEvent.time) {
      errors.time = 'Start time is required';
    }
    setEventErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEvent = () => {
    if (!validateEvent()) return;
    const event: TimelineEvent = {
      ...newEvent,
      id: `event-${Date.now()}`,
    };
    setEvents((prev) => [...prev, event]);
    setNewEvent({
      time: '',
      endTime: '',
      title: '',
      location: '',
      description: '',
      category: 'other',
      assignedTo: '',
    });
    setEventErrors({});
    setShowAddForm(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    const diff = endMins - startMins;
    if (diff <= 0) return '';
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingTimeline.weddingDayTimeline', 'Wedding Day Timeline')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingTimeline.planYourPerfectWeddingDay', 'Plan your perfect wedding day schedule')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.weddingTimeline.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Wedding Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.weddingTimeline.weddingDate', 'Wedding Date:')}</span>
          </div>
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalEvents}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingTimeline.totalEvents', 'Total Events')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
            <div className="text-xl font-bold text-teal-500">{formatTime(stats.startTime)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingTimeline.dayStarts', 'Day Starts')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-pink-900/20' : 'bg-pink-50'}`}>
            <div className="text-xl font-bold text-pink-500">{formatTime(stats.endTime)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingTimeline.dayEnds', 'Day Ends')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
            <div className="text-2xl font-bold text-purple-500">{stats.categories}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingTimeline.categories', 'Categories')}</div>
          </div>
        </div>

        {/* Add Event Form */}
        {showAddForm && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingTimeline.addNewEvent', 'Add New Event')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => {
                    setNewEvent({ ...newEvent, title: e.target.value });
                    if (eventErrors.title) setEventErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder={t('tools.weddingTimeline.eventTitle', 'Event Title *')}
                  className={`w-full px-4 py-2 rounded-lg border ${eventErrors.title ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                />
                {eventErrors.title && <p className="text-red-500 text-xs mt-1">{eventErrors.title}</p>}
              </div>
              <div>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => {
                    setNewEvent({ ...newEvent, time: e.target.value });
                    if (eventErrors.time) setEventErrors((prev) => ({ ...prev, time: '' }));
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${eventErrors.time ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                />
                {eventErrors.time && <p className="text-red-500 text-xs mt-1">{eventErrors.time}</p>}
              </div>
              <input
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder={t('tools.weddingTimeline.location', 'Location')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as TimelineEvent['category'] })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="preparation">{t('tools.weddingTimeline.preparation', 'Preparation')}</option>
                <option value="photos">{t('tools.weddingTimeline.photos', 'Photos')}</option>
                <option value="ceremony">{t('tools.weddingTimeline.ceremony', 'Ceremony')}</option>
                <option value="reception">{t('tools.weddingTimeline.reception', 'Reception')}</option>
                <option value="other">{t('tools.weddingTimeline.other', 'Other')}</option>
              </select>
              <input
                type="text"
                value={newEvent.assignedTo}
                onChange={(e) => setNewEvent({ ...newEvent, assignedTo: e.target.value })}
                placeholder={t('tools.weddingTimeline.assignedTo', 'Assigned To')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder={t('tools.weddingTimeline.description', 'Description')}
              rows={2}
              className={`mt-4 w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddEvent} className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium">
                {t('tools.weddingTimeline.addEvent', 'Add Event')}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEventErrors({});
                }}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {t('tools.weddingTimeline.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Timeline by Category */}
        <div className="space-y-4">
          {Object.entries(groupedEvents).map(([category, categoryEvents]) => {
            if (categoryEvents.length === 0) return null;
            const colors = categoryColors[category];
            const isExpanded = expandedCategories[category];

            return (
              <div key={category} className={`rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => toggleCategory(category)}
                  className={`w-full px-4 py-3 flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-t-lg`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors.border} border-2`} />
                    <span className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{category}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({categoryEvents.length})</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {categoryEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-lg border-l-4 ${colors.border} ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold ${colors.text}`}>
                                {formatTime(event.time)}
                                {event.endTime && ` - ${formatTime(event.endTime)}`}
                              </span>
                              {event.endTime && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                  {getDuration(event.time, event.endTime)}
                                </span>
                              )}
                            </div>
                            <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.title}</h5>
                            {event.location && (
                              <div className={`flex items-center gap-1 text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <MapPin className="w-3 h-3" /> {event.location}
                              </div>
                            )}
                            {event.description && (
                              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{event.description}</p>
                            )}
                            {event.assignedTo && (
                              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                                {event.assignedTo}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('tools.weddingTimeline.noEventsAddedYetClick', 'No events added yet. Click "Add Event" to start planning.')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeddingTimelineTool;
