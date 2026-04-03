/**
 * Schedule & Calendar Component Generators
 * Includes scheduling, calendar, and time-based components
 */

export interface ScheduleOptions {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export function generateTodaySchedule(options: ScheduleOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Clock, MapPin, User, Calendar, ChevronRight, CheckCircle } from 'lucide-react';

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  endTime?: string;
  location?: string;
  client?: string;
  type: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
}

interface TodayScheduleProps {
  items: ScheduleItem[];
  date?: Date;
  onItemClick?: (item: ScheduleItem) => void;
  onViewAll?: () => void;
}

export function TodaySchedule({ items, date = new Date(), onItemClick, onViewAll }: TodayScheduleProps) {
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getStatusColor = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const currentHour = new Date().getHours();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Schedule</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4" />
              {formatDate(date)}
            </p>
          </div>
          <button
            onClick={onViewAll}
            className="text-sm text-${primary}-600 hover:text-${primary}-700 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schedule Items */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments scheduled for today</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={\`px-6 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors \${
                item.status === 'completed' ? 'opacity-60' : ''
              }\`}
            >
              {/* Time */}
              <div className="flex-shrink-0 w-16 text-right">
                <p className="font-medium text-gray-900 dark:text-white">{item.time}</p>
                {item.endTime && (
                  <p className="text-sm text-gray-500">{item.endTime}</p>
                )}
              </div>

              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className={\`w-3 h-3 rounded-full \${
                  item.status === 'in-progress' ? 'bg-green-500 ring-4 ring-green-100' :
                  item.status === 'completed' ? 'bg-gray-400' :
                  item.status === 'cancelled' ? 'bg-red-400' :
                  'bg-${primary}-500'
                }\`} />
                <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={\`font-medium \${
                      item.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'
                    }\`}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      {item.client && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {item.client}
                        </span>
                      )}
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={\`px-2 py-0.5 rounded-full text-xs font-medium capitalize \${getStatusColor(item.status)}\`}>
                    {item.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {item.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}`;
}

export function generateScheduleCalendar(options: ScheduleOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, MapPin, Plus } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  client?: string;
  location?: string;
  color?: string;
}

interface ScheduleCalendarProps {
  events: Event[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: Event) => void;
  onAddEvent?: (date: Date) => void;
}

export function ScheduleCalendar({ events, onDateSelect, onEventClick, onAddEvent }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm font-medium text-${primary}-600 hover:bg-${primary}-50 dark:hover:bg-${primary}-900/20 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => navigate(1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['month', 'week', 'day'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={\`px-3 py-1 text-sm font-medium rounded-md capitalize \${
                    view === v
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }\`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={() => onAddEvent?.(currentDate)}
              className="flex items-center gap-2 px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {getDaysInMonth(currentDate).map((date, index) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div
                key={index}
                onClick={() => date && onDateSelect?.(date)}
                className={\`min-h-[100px] bg-white dark:bg-gray-800 p-2 \${
                  date ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
                }\`}
              >
                {date && (
                  <>
                    <span className={\`inline-flex w-7 h-7 items-center justify-center text-sm rounded-full \${
                      isToday(date)
                        ? 'bg-${primary}-600 text-white font-bold'
                        : 'text-gray-900 dark:text-white'
                    }\`}>
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          className={\`px-2 py-1 text-xs rounded truncate \${
                            event.color || 'bg-${primary}-100 text-${primary}-700 dark:bg-${primary}-900/30 dark:text-${primary}-400'
                          }\`}
                        >
                          {event.time} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 pl-2">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}`;
}

export function generateSessionListActive(options: ScheduleOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Clock, User, MapPin, Video, Phone, Calendar, MoreVertical } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  client: { name: string; avatar?: string };
  startTime: string;
  duration: number;
  type: 'in-person' | 'video' | 'phone';
  location?: string;
  status: 'active' | 'starting-soon' | 'scheduled';
  progress?: number;
}

interface SessionListActiveProps {
  sessions: Session[];
  onJoin?: (session: Session) => void;
  onDetails?: (session: Session) => void;
}

export function SessionListActive({ sessions, onJoin, onDetails }: SessionListActiveProps) {
  const getTypeIcon = (type: Session['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusStyles = (status: Session['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'starting-soon': return 'bg-yellow-500 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-${primary}-600" />
          Active Sessions
        </h2>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sessions.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No active sessions
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start gap-4">
                {/* Status indicator */}
                <div className="flex-shrink-0 mt-1">
                  <div className={\`w-3 h-3 rounded-full \${getStatusStyles(session.status)}\`} />
                </div>

                {/* Client avatar */}
                <div className="flex-shrink-0">
                  {session.client.avatar ? (
                    <img
                      src={session.client.avatar}
                      alt={session.client.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-${primary}-100 dark:bg-${primary}-900/30 flex items-center justify-center">
                      <span className="text-${primary}-600 font-medium">{session.client.name[0]}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white">{session.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{session.client.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.startTime} ({session.duration} min)
                    </span>
                    <span className="flex items-center gap-1">
                      {getTypeIcon(session.type)}
                      {session.type === 'in-person' && session.location ? session.location : session.type}
                    </span>
                  </div>

                  {/* Progress bar for active sessions */}
                  {session.status === 'active' && session.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{session.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-${primary}-500 rounded-full transition-all"
                          style={{ width: \`\${session.progress}%\` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {(session.status === 'active' || session.status === 'starting-soon') && session.type !== 'in-person' && (
                    <button
                      onClick={() => onJoin?.(session)}
                      className={\`px-4 py-2 rounded-lg text-sm font-medium \${
                        session.status === 'active'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-${primary}-600 hover:bg-${primary}-700 text-white'
                      }\`}
                    >
                      {session.status === 'active' ? 'Rejoin' : 'Join Now'}
                    </button>
                  )}
                  <button
                    onClick={() => onDetails?.(session)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}`;
}

export function generateTherapistSchedule(options: ScheduleOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState } from 'react';
import { Clock, User, Calendar, ChevronLeft, ChevronRight, Video, MapPin, Phone } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  clientAvatar?: string;
  time: string;
  endTime: string;
  type: 'initial' | 'follow-up' | 'emergency' | 'group';
  mode: 'in-person' | 'video' | 'phone';
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

interface TherapistScheduleProps {
  appointments: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function TherapistSchedule({
  appointments,
  selectedDate,
  onDateChange,
  onAppointmentClick
}: TherapistScheduleProps) {
  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8am to 5pm

  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'initial': return 'bg-blue-100 border-blue-400 text-blue-700';
      case 'follow-up': return 'bg-green-100 border-green-400 text-green-700';
      case 'emergency': return 'bg-red-100 border-red-400 text-red-700';
      case 'group': return 'bg-purple-100 border-purple-400 text-purple-700';
      default: return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  const getModeIcon = (mode: Appointment['mode']) => {
    switch (mode) {
      case 'video': return <Video className="w-3 h-3" />;
      case 'phone': return <Phone className="w-3 h-3" />;
      default: return <MapPin className="w-3 h-3" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    onDateChange(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDay(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(selectedDate)}
              </h2>
              {isToday && (
                <span className="text-sm text-${primary}-600">Today</span>
              )}
            </div>
            <button
              onClick={() => navigateDay(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-full bg-blue-400" /> Initial
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-full bg-green-400" /> Follow-up
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-full bg-purple-400" /> Group
            </span>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="relative">
        {hours.map((hour) => {
          const hourAppointments = appointments.filter(apt => {
            const aptHour = parseInt(apt.time.split(':')[0]);
            return aptHour === hour;
          });

          return (
            <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700 min-h-[80px]">
              {/* Time label */}
              <div className="w-20 flex-shrink-0 py-2 px-4 text-right border-r border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500">
                  {hour > 12 ? \`\${hour - 12}:00 PM\` : \`\${hour}:00 AM\`}
                </span>
              </div>

              {/* Appointments */}
              <div className="flex-1 p-2 relative">
                {hourAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => onAppointmentClick?.(apt)}
                    className={\`mb-1 p-2 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow \${getTypeColor(apt.type)} \${
                      apt.status === 'cancelled' ? 'opacity-50 line-through' : ''
                    }\`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {apt.clientAvatar ? (
                          <img src={apt.clientAvatar} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-current opacity-20 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-medium text-sm">{apt.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {getModeIcon(apt.mode)}
                        <span>{apt.time} - {apt.endTime}</span>
                      </div>
                    </div>
                    {apt.notes && (
                      <p className="text-xs mt-1 opacity-75 truncate">{apt.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

export function generateTechnicianSchedule(options: ScheduleOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Clock, MapPin, Wrench, Phone, Navigation, CheckCircle, AlertCircle } from 'lucide-react';

interface Job {
  id: string;
  customer: string;
  address: string;
  phone: string;
  serviceType: string;
  scheduledTime: string;
  estimatedDuration: number;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'pending' | 'en-route' | 'in-progress' | 'completed';
  notes?: string;
}

interface TechnicianScheduleProps {
  jobs: Job[];
  currentLocation?: { lat: number; lng: number };
  onStartJob?: (job: Job) => void;
  onCompleteJob?: (job: Job) => void;
  onNavigate?: (job: Job) => void;
  onCall?: (job: Job) => void;
}

export function TechnicianSchedule({
  jobs,
  onStartJob,
  onCompleteJob,
  onNavigate,
  onCall
}: TechnicianScheduleProps) {
  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'urgent': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Wrench className="w-5 h-5 text-${primary}-500 animate-pulse" />;
      case 'en-route': return <Navigation className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const activeJob = jobs.find(j => j.status === 'in-progress' || j.status === 'en-route');
  const upcomingJobs = jobs.filter(j => j.status === 'pending');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Active Job */}
      {activeJob && (
        <div className="bg-${primary}-50 dark:bg-${primary}-900/20 rounded-xl p-6 border-2 border-${primary}-200 dark:border-${primary}-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-${primary}-900 dark:text-${primary}-100 flex items-center gap-2">
              {getStatusIcon(activeJob.status)}
              {activeJob.status === 'en-route' ? 'En Route' : 'Current Job'}
            </h3>
            <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getPriorityColor(activeJob.priority)}\`}>
              {activeJob.priority}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{activeJob.customer}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activeJob.serviceType}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {activeJob.address}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {activeJob.scheduledTime} ({activeJob.estimatedDuration} min)
              </span>
            </div>

            {activeJob.notes && (
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {activeJob.notes}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {activeJob.status === 'en-route' && (
                <button
                  onClick={() => onStartJob?.(activeJob)}
                  className="flex-1 px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg font-medium"
                >
                  Start Job
                </button>
              )}
              {activeJob.status === 'in-progress' && (
                <button
                  onClick={() => onCompleteJob?.(activeJob)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Complete Job
                </button>
              )}
              <button
                onClick={() => onNavigate?.(activeJob)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Navigation className="w-5 h-5" />
              </button>
              <button
                onClick={() => onCall?.(activeJob)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Jobs ({upcomingJobs.length})</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {upcomingJobs.map(job => (
            <div key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{job.customer}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.serviceType}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.scheduledTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.address}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getPriorityColor(job.priority)}\`}>
                  {job.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Completed Today ({completedJobs.length})</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {completedJobs.map(job => (
              <div key={job.id} className="p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{job.customer}</p>
                    <p className="text-sm text-gray-500">{job.serviceType} - {job.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;
}

export function generateSessionCalendar(options: ScheduleOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, Video, MapPin, Plus } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'individual' | 'group' | 'workshop';
  mode: 'online' | 'in-person';
  participants: number;
  maxParticipants?: number;
  instructor?: string;
  color?: string;
}

interface SessionCalendarProps {
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
  onAddSession?: (date: Date) => void;
  onDateChange?: (date: Date) => void;
}

export function SessionCalendar({
  sessions,
  onSessionClick,
  onAddSession,
  onDateChange
}: SessionCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays(currentWeek);
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7am to 6pm

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
    onDateChange?.(newDate);
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const getSessionsForDateHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(s => {
      const sessionHour = parseInt(s.startTime.split(':')[0]);
      return s.date === dateStr && sessionHour === hour;
    });
  };

  const getTypeColor = (type: Session['type']) => {
    switch (type) {
      case 'individual': return 'bg-${primary}-100 border-${primary}-400 text-${primary}-700 dark:bg-${primary}-900/30 dark:text-${primary}-400';
      case 'group': return 'bg-purple-100 border-purple-400 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'workshop': return 'bg-orange-100 border-orange-400 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => onAddSession?.(new Date())}
            className="flex items-center gap-2 px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Session
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700">
            <div className="w-20" />
            {weekDays.map(day => (
              <div
                key={day.toISOString()}
                className={\`py-3 text-center border-l border-gray-100 dark:border-gray-700 \${
                  isToday(day) ? 'bg-${primary}-50 dark:bg-${primary}-900/20' : ''
                }\`}
              >
                <p className="text-sm text-gray-500">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={\`text-lg font-semibold \${
                  isToday(day) ? 'text-${primary}-600' : 'text-gray-900 dark:text-white'
                }\`}>
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700">
              <div className="w-20 py-2 px-3 text-right text-sm text-gray-500 border-r border-gray-100 dark:border-gray-700">
                {hour > 12 ? \`\${hour - 12}:00 PM\` : hour === 12 ? '12:00 PM' : \`\${hour}:00 AM\`}
              </div>
              {weekDays.map(day => {
                const daySessions = getSessionsForDateHour(day, hour);
                return (
                  <div
                    key={day.toISOString()}
                    className={\`min-h-[60px] p-1 border-l border-gray-100 dark:border-gray-700 \${
                      isToday(day) ? 'bg-${primary}-50/50 dark:bg-${primary}-900/10' : ''
                    }\`}
                  >
                    {daySessions.map(session => (
                      <div
                        key={session.id}
                        onClick={() => onSessionClick?.(session)}
                        className={\`p-1.5 rounded text-xs cursor-pointer border-l-2 \${session.color || getTypeColor(session.type)}\`}
                      >
                        <p className="font-medium truncate">{session.title}</p>
                        <div className="flex items-center gap-1 text-[10px] opacity-75">
                          <Clock className="w-3 h-3" />
                          {session.startTime}
                          {session.mode === 'online' ? (
                            <Video className="w-3 h-3 ml-1" />
                          ) : (
                            <MapPin className="w-3 h-3 ml-1" />
                          )}
                          {session.type === 'group' && (
                            <>
                              <Users className="w-3 h-3 ml-1" />
                              {session.participants}/{session.maxParticipants}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}
