/**
 * Event Grid Component Generator
 */

export interface EventGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateEventGrid(options: EventGridOptions = {}): string {
  const { componentName = 'EventGrid', endpoint = '/events' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, MapPin, Users, Clock, Ticket } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  category?: string;
  date?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category, date }) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events', category, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (date) params.append('date', date);
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events && events.length > 0 ? (
        events.map((event: any) => (
          <Link
            key={event.id}
            to={\`/events/\${event.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {event.image_url && (
              <div className="relative">
                <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                {event.category && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                    {event.category}
                  </span>
                )}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col">
                  {event.date && (
                    <div className="text-center bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2 mr-3 flex-shrink-0">
                      <p className="text-xs text-purple-600 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{new Date(event.date).getDate()}</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{event.title}</h3>
                  {event.organizer && (
                    <p className="text-sm text-gray-500">by {event.organizer}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                {event.time && (
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </p>
                )}
                {event.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </p>
                )}
                {event.attendees_count !== undefined && (
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {event.attendees_count} attending
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {event.price !== undefined && (
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {event.price === 0 ? 'Free' : \`$\${event.price}\`}
                  </span>
                )}
                <span className="text-purple-600 font-medium flex items-center gap-1">
                  <Ticket className="w-4 h-4" />
                  Get Tickets
                </span>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No events found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateEventFilters(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'EventFilters';

  return `import React from 'react';
import { Search, Calendar } from 'lucide-react';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  categories?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  date,
  onDateChange,
  categories = ['All', 'Conference', 'Workshop', 'Concert', 'Festival', 'Sports', 'Networking', 'Webinar'],
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto mt-4 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat === 'All' ? '' : cat)}
            className={\`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors \${
              (cat === 'All' && !category) || category === cat
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }\`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
