/**
 * Event Detail Component Generator
 */

export interface EventDetailOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateEventHeader(options: EventDetailOptions = {}): string {
  const { componentName = 'EventHeader', endpoint = '/events' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, Clock, MapPin, Users, Share2, Heart } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-12 text-gray-500">Event not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {event.image_url && (
        <img src={event.image_url} alt={event.title} className="w-full h-64 object-cover" />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            {event.category && (
              <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium mb-2">
                {event.category}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h1>
            {event.organizer && (
              <p className="text-gray-500">Organized by {event.organizer}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Heart className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Share2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {event.date && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}
          {event.time && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900 dark:text-white">{event.time}</p>
              </div>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{event.location}</p>
              </div>
            </div>
          )}
          {event.attendees_count !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Attendees</p>
                <p className="font-medium text-gray-900 dark:text-white">{event.attendees_count} going</p>
              </div>
            </div>
          )}
        </div>

        {event.description && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About This Event</h2>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateEventSchedule(options: EventDetailOptions = {}): string {
  const { componentName = 'EventSchedule', endpoint = '/event-schedule' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Clock, MapPin, User } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['event-schedule', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?event_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Event Schedule</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {schedule && schedule.length > 0 ? (
          schedule.map((session: any, index: number) => (
            <div key={session.id || index} className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-center min-w-[60px]">
                  <p className="text-sm font-medium text-purple-600">{session.start_time}</p>
                  {session.end_time && (
                    <p className="text-xs text-gray-500">- {session.end_time}</p>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{session.title}</h3>
                  {session.description && (
                    <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {session.speaker_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {session.speaker_name}
                      </span>
                    )}
                    {session.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </span>
                    )}
                    {session.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration}
                      </span>
                    )}
                  </div>
                </div>
                {session.type && (
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${
                    session.type === 'break' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' :
                    session.type === 'keynote' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }\`}>
                    {session.type}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">No schedule available</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateVenueInfo(options: EventDetailOptions = {}): string {
  const componentName = options.componentName || 'VenueInfo';

  return `import React from 'react';
import { MapPin, Phone, Globe, Clock, Car, Train } from 'lucide-react';

interface ${componentName}Props {
  venue?: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    website?: string;
    image_url?: string;
    directions?: string;
    parking?: string;
    transit?: string;
  };
}

const ${componentName}: React.FC<${componentName}Props> = ({ venue }) => {
  if (!venue) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {venue.image_url && (
        <img src={venue.image_url} alt={venue.name} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Venue</h2>

        {venue.name && (
          <h3 className="font-medium text-gray-900 dark:text-white">{venue.name}</h3>
        )}

        <div className="space-y-3 mt-4 text-sm">
          {venue.address && (
            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p>{venue.address}</p>
                {venue.city && <p>{venue.city}</p>}
              </div>
            </div>
          )}
          {venue.phone && (
            <a href={\`tel:\${venue.phone}\`} className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
              <Phone className="w-4 h-4" />
              {venue.phone}
            </a>
          )}
          {venue.website && (
            <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
              <Globe className="w-4 h-4" />
              Visit Website
            </a>
          )}
        </div>

        {(venue.parking || venue.transit) && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Getting There</h4>
            {venue.parking && (
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Car className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{venue.parking}</p>
              </div>
            )}
            {venue.transit && (
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Train className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{venue.transit}</p>
              </div>
            )}
          </div>
        )}

        <button className="w-full mt-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" />
          Get Directions
        </button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
