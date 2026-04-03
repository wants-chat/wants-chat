/**
 * Event & Calendar Component Generators
 *
 * Generates React components for various event and calendar displays
 */

export interface EventCalendarOptions {
  title?: string;
  className?: string;
  entityName?: string;
}

/**
 * Generates EventCalendarBrewery component
 */
export function generateEventCalendarBrewery(options: EventCalendarOptions = {}): string {
  const { title = 'Brewery Events', className = '' } = options;

  return `import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Beer, Music, Users, Clock } from 'lucide-react';

interface BreweryEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'tasting' | 'tour' | 'music' | 'private' | 'release';
  capacity?: number;
  attendees?: number;
  description?: string;
}

interface EventCalendarBreweryProps {
  events?: BreweryEvent[];
  onEventClick?: (event: BreweryEvent) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const eventTypeColors = {
  tasting: 'bg-amber-100 text-amber-800 border-amber-200',
  tour: 'bg-blue-100 text-blue-800 border-blue-200',
  music: 'bg-purple-100 text-purple-800 border-purple-200',
  private: 'bg-gray-100 text-gray-800 border-gray-200',
  release: 'bg-green-100 text-green-800 border-green-200',
};

const eventTypeIcons = {
  tasting: Beer,
  tour: Users,
  music: Music,
  private: Calendar,
  release: Beer,
};

export default function EventCalendarBrewery({
  events = [],
  onEventClick,
  onDateSelect,
  className = '',
}: EventCalendarBreweryProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const getEventsForDay = (day: number) => {
    const dateStr = \`\${currentDate.getFullYear()}-\${String(currentDate.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return events.filter(event => event.date === dateStr);
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">${title}</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium min-w-[150px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(eventTypeColors).map(([type, colorClass]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={\`w-3 h-3 rounded \${colorClass.split(' ')[0]}\`} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-24" />;
            }

            const dayEvents = getEventsForDay(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                onClick={() => onDateSelect?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={\`h-24 border rounded-lg p-1 cursor-pointer hover:bg-gray-50 transition-colors \${
                  isToday ? 'border-amber-500 bg-amber-50' : 'border-gray-100'
                }\`}
              >
                <div className={\`text-sm font-medium mb-1 \${isToday ? 'text-amber-600' : 'text-gray-700'}\`}>
                  {day}
                </div>
                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => {
                    const Icon = eventTypeIcons[event.type];
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className={\`text-xs px-1 py-0.5 rounded flex items-center gap-1 truncate \${eventTypeColors[event.type]}\`}
                      >
                        <Icon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}`;
}

/**
 * Generates EventCalendarCatering component
 */
export function generateEventCalendarCatering(options: EventCalendarOptions = {}): string {
  const { title = 'Catering Events', className = '' } = options;

  return `import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users, MapPin, DollarSign, Clock } from 'lucide-react';

interface CateringEvent {
  id: string;
  clientName: string;
  eventName: string;
  date: string;
  time: string;
  type: 'wedding' | 'corporate' | 'private' | 'social';
  guests: number;
  venue?: string;
  total?: number;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

interface EventCalendarCateringProps {
  events?: CateringEvent[];
  onEventClick?: (event: CateringEvent) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  tentative: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

const typeColors = {
  wedding: 'border-l-pink-500',
  corporate: 'border-l-blue-500',
  private: 'border-l-purple-500',
  social: 'border-l-orange-500',
};

export default function EventCalendarCatering({
  events = [],
  onEventClick,
  onDateSelect,
  className = '',
}: EventCalendarCateringProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const getEventsForDay = (day: number) => {
    const dateStr = \`\${currentDate.getFullYear()}-\${String(currentDate.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return events.filter(event => event.date === dateStr);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">${title}</h2>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setView('month')}
                className={\`px-3 py-1 text-sm \${view === 'month' ? 'bg-gray-100 font-medium' : ''}\`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={\`px-3 py-1 text-sm \${view === 'week' ? 'bg-gray-100 font-medium' : ''}\`}
              >
                Week
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium min-w-[150px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) return <div key={index} className="h-28" />;

            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                onClick={() => onDateSelect?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={\`h-28 border rounded-lg p-1 cursor-pointer hover:bg-gray-50 \${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}\`}
              >
                <div className={\`text-sm font-medium mb-1 \${isToday ? 'text-blue-600' : 'text-gray-700'}\`}>{day}</div>
                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                      className={\`text-xs px-2 py-1 bg-white rounded border-l-2 shadow-sm \${typeColors[event.type]}\`}
                    >
                      <div className="font-medium truncate">{event.clientName}</div>
                      <div className="text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />{event.guests}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}`;
}

/**
 * Generates EventListUpcoming component
 */
export function generateEventListUpcoming(options: EventCalendarOptions = {}): string {
  const { title = 'Upcoming Events', className = '' } = options;

  return `import React from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  attendees?: number;
  type: string;
  image?: string;
}

interface EventListUpcomingProps {
  events?: UpcomingEvent[];
  onEventClick?: (event: UpcomingEvent) => void;
  maxItems?: number;
  className?: string;
}

export default function EventListUpcoming({
  events = [],
  onEventClick,
  maxItems = 5,
  className = '',
}: EventListUpcomingProps) {
  const displayEvents = events.slice(0, maxItems);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">${title}</h3>
        <span className="text-sm text-gray-500">{events.length} events</span>
      </div>

      <div className="divide-y divide-gray-100">
        {displayEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No upcoming events</p>
          </div>
        ) : (
          displayEvents.map((event) => {
            const { day, month, weekday } = formatDate(event.date);
            return (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="p-4 flex items-start gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Date Badge */}
                <div className="flex-shrink-0 w-14 text-center">
                  <div className="text-xs text-gray-500 uppercase">{weekday}</div>
                  <div className="text-2xl font-bold text-gray-900">{day}</div>
                  <div className="text-xs text-gray-500 uppercase">{month}</div>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    )}
                    {event.attendees !== undefined && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees}
                      </span>
                    )}
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                    {event.type}
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            );
          })
        )}
      </div>

      {events.length > maxItems && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All Events
          </button>
        </div>
      )}
    </div>
  );
}`;
}

/**
 * Generates CampaignFilters component
 */
export function generateCampaignFilters(options: EventCalendarOptions = {}): string {
  const { title = 'Filter Campaigns', className = '' } = options;

  return `import React, { useState } from 'react';
import { Search, Filter, Calendar, ChevronDown } from 'lucide-react';

interface CampaignFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

interface FilterState {
  search: string;
  status: string;
  type: string;
  dateRange: { start: string; end: string };
}

const statuses = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
  { value: 'scheduled', label: 'Scheduled' },
];

const types = [
  { value: '', label: 'All Types' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social Media' },
  { value: 'ppc', label: 'PPC/Ads' },
  { value: 'content', label: 'Content' },
  { value: 'seo', label: 'SEO' },
  { value: 'affiliate', label: 'Affiliate' },
];

export default function CampaignFilters({ onFilterChange, className = '' }: CampaignFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    type: '',
    dateRange: { start: '', end: '' },
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 p-4 \${className}\`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        {/* Type */}
        <select
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {types.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        {/* Date Range */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Date Range</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;
}

/**
 * Generates CampaignHeader component
 */
export function generateCampaignHeader(options: EventCalendarOptions = {}): string {
  const { className = '' } = options;

  return `import React from 'react';
import { Play, Pause, Edit, Trash2, BarChart2, Calendar, Target, DollarSign, Copy } from 'lucide-react';

interface CampaignHeaderProps {
  campaign: {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'draft' | 'completed';
    type: string;
    startDate: string;
    endDate?: string;
    budget?: number;
    spent?: number;
    goal?: string;
    description?: string;
  };
  onStatusChange?: (status: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  className?: string;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
};

export default function CampaignHeader({
  campaign,
  onStatusChange,
  onEdit,
  onDelete,
  onDuplicate,
  className = '',
}: CampaignHeaderProps) {
  const config = statusConfig[campaign.status];
  const budgetProgress = campaign.budget && campaign.spent ? (campaign.spent / campaign.budget) * 100 : 0;

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      {/* Main Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
              <span className={\`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 \${config.color}\`}>
                <span className={\`w-2 h-2 rounded-full \${config.dot}\`} />
                {config.label}
              </span>
            </div>
            <p className="text-gray-600">{campaign.description}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(campaign.startDate).toLocaleDateString()}
                {campaign.endDate && \` - \${new Date(campaign.endDate).toLocaleDateString()}\`}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{campaign.type}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {campaign.status === 'active' ? (
              <button
                onClick={() => onStatusChange?.('paused')}
                className="flex items-center gap-2 px-4 py-2 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            ) : campaign.status === 'paused' || campaign.status === 'draft' ? (
              <button
                onClick={() => onStatusChange?.('active')}
                className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                {campaign.status === 'draft' ? 'Launch' : 'Resume'}
              </button>
            ) : null}
            <button
              onClick={onDuplicate}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Duplicate"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {campaign.goal && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Target className="w-4 h-4" />
              Goal
            </div>
            <p className="font-semibold text-gray-900">{campaign.goal}</p>
          </div>
        )}
        {campaign.budget !== undefined && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <DollarSign className="w-4 h-4" />
              Budget
            </div>
            <p className="font-semibold text-gray-900">\${campaign.budget.toLocaleString()}</p>
          </div>
        )}
        {campaign.spent !== undefined && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <BarChart2 className="w-4 h-4" />
              Spent
            </div>
            <p className="font-semibold text-gray-900">\${campaign.spent.toLocaleString()}</p>
          </div>
        )}
        {campaign.budget && campaign.spent !== undefined && (
          <div>
            <div className="text-sm text-gray-500 mb-1">Budget Used</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={\`h-full rounded-full \${budgetProgress > 90 ? 'bg-red-500' : budgetProgress > 70 ? 'bg-yellow-500' : 'bg-green-500'}\`}
                  style={{ width: \`\${Math.min(budgetProgress, 100)}%\` }}
                />
              </div>
              <span className="text-sm font-medium">{budgetProgress.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`;
}

/**
 * Generates VenueCalendar component
 */
export function generateVenueCalendar(options: EventCalendarOptions = {}): string {
  const { title = 'Venue Bookings', className = '' } = options;

  return `import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Clock } from 'lucide-react';

interface VenueBooking {
  id: string;
  eventName: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId?: string;
  roomName?: string;
  attendees?: number;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

interface VenueCalendarProps {
  bookings?: VenueBooking[];
  rooms?: { id: string; name: string; capacity: number; color: string }[];
  onBookingClick?: (booking: VenueBooking) => void;
  onSlotClick?: (date: Date, roomId?: string) => void;
  className?: string;
}

export default function VenueCalendar({
  bookings = [],
  rooms = [],
  onBookingClick,
  onSlotClick,
  className = '',
}: VenueCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(currentDate);
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 10 PM

  const getBookingsForSlot = (date: Date, hour: number, roomId?: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      if (booking.date !== dateStr) return false;
      if (roomId && booking.roomId !== roomId) return false;
      const bookingHour = parseInt(booking.startTime.split(':')[0]);
      return bookingHour === hour;
    });
  };

  const statusColors = {
    confirmed: 'bg-green-100 border-green-300 text-green-800',
    tentative: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    cancelled: 'bg-red-100 border-red-300 text-red-800 line-through',
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">${title}</h2>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={\`px-3 py-1 text-sm capitalize \${viewMode === mode ? 'bg-gray-100 font-medium' : ''}\`}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - 7);
              setCurrentDate(newDate);
            }} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded-lg">
              Today
            </button>
            <button onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() + 7);
              setCurrentDate(newDate);
            }} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Week View */}
      <div className="overflow-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-2 text-center text-sm font-medium text-gray-500"></div>
            {weekDates.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={\`p-2 text-center border-l border-gray-200 \${isToday ? 'bg-blue-50' : ''}\`}>
                  <div className="text-xs text-gray-500">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className={\`text-lg font-semibold \${isToday ? 'text-blue-600' : 'text-gray-900'}\`}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-2 text-right text-sm text-gray-500 pr-4">
                {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
              </div>
              {weekDates.map((date, i) => {
                const slotBookings = getBookingsForSlot(date, hour);
                return (
                  <div
                    key={i}
                    onClick={() => slotBookings.length === 0 && onSlotClick?.(date)}
                    className={\`min-h-[60px] border-l border-gray-100 p-1 hover:bg-gray-50 cursor-pointer\`}
                  >
                    {slotBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={(e) => { e.stopPropagation(); onBookingClick?.(booking); }}
                        className={\`text-xs p-1 rounded border \${statusColors[booking.status]} cursor-pointer\`}
                      >
                        <div className="font-medium truncate">{booking.eventName}</div>
                        <div className="text-gray-600 truncate">{booking.clientName}</div>
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

/**
 * Generates ReservationCalendar component
 */
export function generateReservationCalendar(options: EventCalendarOptions = {}): string {
  const { title = 'Reservations', className = '' } = options;

  return `import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, Clock, Phone, Mail } from 'lucide-react';

interface Reservation {
  id: string;
  name: string;
  date: string;
  time: string;
  partySize: number;
  phone?: string;
  email?: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  tableNumber?: string;
}

interface ReservationCalendarProps {
  reservations?: Reservation[];
  onReservationClick?: (reservation: Reservation) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  className?: string;
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  seated: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  'no-show': 'bg-red-100 text-red-800 border-red-200',
};

export default function ReservationCalendar({
  reservations = [],
  onReservationClick,
  onTimeSlotClick,
  className = '',
}: ReservationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 11;
    const minutes = i % 2 === 0 ? '00' : '30';
    return \`\${hour}:\${minutes}\`;
  });

  const getReservationsForSlot = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(r => r.date === dateStr && r.time === time);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">${title}</h2>
          <div className="flex items-center gap-4">
            <button onClick={prevDay} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg">
              Today
            </button>
            <span className="font-medium min-w-[200px] text-center">{formatDate(selectedDate)}</span>
            <button onClick={nextDay} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {timeSlots.map((time) => {
          const slotReservations = getReservationsForSlot(selectedDate, time);
          const hour = parseInt(time.split(':')[0]);
          const displayTime = hour > 12 ? \`\${hour - 12}:\${time.split(':')[1]} PM\` : \`\${time} \${hour === 12 ? 'PM' : 'AM'}\`;

          return (
            <div key={time} className="flex">
              <div className="w-24 flex-shrink-0 p-3 text-right text-sm text-gray-500 border-r border-gray-100">
                {displayTime}
              </div>
              <div
                onClick={() => slotReservations.length === 0 && onTimeSlotClick?.(selectedDate, time)}
                className={\`flex-1 min-h-[60px] p-2 \${slotReservations.length === 0 ? 'hover:bg-gray-50 cursor-pointer' : ''}\`}
              >
                <div className="flex flex-wrap gap-2">
                  {slotReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      onClick={(e) => { e.stopPropagation(); onReservationClick?.(reservation); }}
                      className={\`flex-1 min-w-[200px] max-w-[300px] p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow \${statusColors[reservation.status]}\`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{reservation.name}</span>
                        <span className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4" />
                          {reservation.partySize}
                        </span>
                      </div>
                      {reservation.tableNumber && (
                        <div className="text-sm mt-1">Table {reservation.tableNumber}</div>
                      )}
                      <div className="text-xs capitalize mt-1">{reservation.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}
