import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Edit2, Trash2, Bell, ChevronLeft, ChevronRight, Clock, MapPin, Tag, AlertCircle } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  category: string;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notificationEnabled: boolean;
  notificationMinutes: number;
  createdAt: string;
}

const categories = ['Meeting', 'Personal', 'Work', 'Birthday', 'Holiday', 'Appointment', 'Other'];
const notificationOptions = [
  { label: 'At time of event', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
];

const EventReminder: React.FC = () => {
  const { confirm } = useConfirm();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Other',
    isRecurring: false,
    recurringType: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    notificationEnabled: true,
    notificationMinutes: 15,
  });

  // Load events from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('eventReminders');
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading events:', error);
      }
    }

    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setPermissionGranted(permission === 'granted');
        });
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('eventReminders', JSON.stringify(events));
    }
  }, [events]);

  // Check for upcoming events and send notifications
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();

      events.forEach(event => {
        if (!event.notificationEnabled || !permissionGranted) return;

        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const notificationTime = new Date(eventDateTime.getTime() - event.notificationMinutes * 60000);

        // Check if it's time to notify (within 1 minute window)
        const timeDiff = notificationTime.getTime() - now.getTime();
        if (timeDiff > 0 && timeDiff < 60000) {
          new Notification(event.title, {
            body: `${event.description || 'Upcoming event'}\n${event.location || ''}`,
            icon: '/favicon.ico',
            tag: event.id,
          });
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events, permissionGranted]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      // Update existing event
      setEvents(events.map(ev =>
        ev.id === editingEvent.id
          ? { ...formData, id: ev.id, createdAt: ev.createdAt }
          : ev
      ));
    } else {
      // Add new event
      const newEvent: Event = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setEvents([...events, newEvent]);
    }

    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'Other',
      isRecurring: false,
      recurringType: 'weekly',
      notificationEnabled: true,
      notificationMinutes: 15,
    });
    setEditingEvent(null);
    setShowModal(false);
  };

  // Edit event
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      location: event.location || '',
      category: event.category,
      isRecurring: event.isRecurring,
      recurringType: event.recurringType || 'weekly',
      notificationEnabled: event.notificationEnabled,
      notificationMinutes: event.notificationMinutes,
    });
    setShowModal(true);
  };

  // Delete event
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (confirmed) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (e.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get events for current month
  const getEventsForMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  // Calendar functions
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

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return getEventsForMonth().filter(e => e.date === dateStr);
  };

  // Sort events by date and time
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Get upcoming events
  const upcomingEvents = sortedEvents.filter(e => {
    const eventDateTime = new Date(`${e.date}T${e.time}`);
    return eventDateTime.getTime() > Date.now();
  });

  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = new Date().getDate() === day &&
                     new Date().getMonth() === currentDate.getMonth() &&
                     new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <div
          key={day}
          className={`aspect-square p-2 border border-white/10 rounded-lg ${
            isToday ? 'bg-teal-500/30 border-teal-400' : 'bg-white/5'
          } hover:bg-white/10 transition-all`}
        >
          <div className="text-white font-semibold mb-1">{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className="text-xs bg-teal-500/50 text-white px-1 py-0.5 rounded truncate cursor-pointer hover:bg-teal-500/70"
                onClick={() => handleEdit(event)}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-teal-300">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900">
      <BackgroundEffects />
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="w-12 h-12 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Event Reminder</h1>
          <p className="text-teal-200">Never miss an important event</p>
          {!permissionGranted && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Enable notifications to get reminders</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* View toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/10 text-teal-200 hover:bg-white/20'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/10 text-teal-200 hover:bg-white/20'
                }`}
              >
                List
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </button>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === 'All'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-200 hover:bg-white/20'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/10 text-teal-200 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousMonth}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-2xl font-bold text-white">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-teal-300 font-semibold py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {/* Upcoming events */}
            {upcomingEvents.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-teal-400" />
                  Upcoming Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingEvents.slice(0, 4).map(event => (
                    <div
                      key={event.id}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                          <span className="inline-block px-3 py-1 bg-teal-500/30 text-teal-200 rounded-full text-xs font-medium">
                            {event.category}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                          >
                            <Edit2 className="w-4 h-4 text-teal-300" />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 bg-white/10 rounded-lg hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-300" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white">
                          <Calendar className="w-4 h-4 text-teal-400" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Clock className="w-4 h-4 text-teal-400" />
                          <span>{event.time}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-white">
                            <MapPin className="w-4 h-4 text-teal-400" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.description && (
                          <p className="text-white/70 text-sm mt-2">{event.description}</p>
                        )}
                        {event.isRecurring && (
                          <div className="flex items-center gap-2 text-teal-300 text-sm">
                            <Tag className="w-4 h-4" />
                            <span>Repeats {event.recurringType}</span>
                          </div>
                        )}
                        {event.notificationEnabled && (
                          <div className="flex items-center gap-2 text-cyan-300 text-sm">
                            <Bell className="w-4 h-4" />
                            <span>Reminder: {notificationOptions.find(o => o.value === event.notificationMinutes)?.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All events */}
            <h2 className="text-2xl font-bold text-white mb-4">All Events</h2>
            {sortedEvents.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                <Calendar className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                <p className="text-teal-200 mb-6">Start by adding your first event</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedEvents.map(event => (
                  <div
                    key={event.id}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">{event.title}</h3>
                          <span className="px-3 py-1 bg-teal-500/30 text-teal-200 rounded-full text-xs font-medium">
                            {event.category}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-teal-400" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-teal-400" />
                            <span>{event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-teal-400" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-white/70 text-sm">{event.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                        >
                          <Edit2 className="w-4 h-4 text-teal-300" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 bg-white/10 rounded-lg hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-teal-500/30">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g., Team Meeting"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-teal-300 mb-2">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-teal-300 mb-2">Time *</label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Meeting room, address, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                    placeholder="Event details..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="w-4 h-4 rounded border-teal-500 text-teal-500 focus:ring-teal-400"
                    />
                    <span className="text-sm font-medium">Recurring Event</span>
                  </label>
                </div>

                {formData.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-teal-300 mb-2">Repeat</label>
                    <select
                      value={formData.recurringType}
                      onChange={(e) => setFormData({ ...formData, recurringType: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <option value="daily" className="bg-slate-900">Daily</option>
                      <option value="weekly" className="bg-slate-900">Weekly</option>
                      <option value="monthly" className="bg-slate-900">Monthly</option>
                      <option value="yearly" className="bg-slate-900">Yearly</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-white cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.notificationEnabled}
                      onChange={(e) => setFormData({ ...formData, notificationEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-teal-500 text-teal-500 focus:ring-teal-400"
                    />
                    <span className="text-sm font-medium">Enable Notifications</span>
                  </label>

                  {formData.notificationEnabled && (
                    <select
                      value={formData.notificationMinutes}
                      onChange={(e) => setFormData({ ...formData, notificationMinutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      {notificationOptions.map(option => (
                        <option key={option.value} value={option.value} className="bg-slate-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
                  >
                    {editingEvent ? 'Update' : 'Add'} Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EventReminder;
