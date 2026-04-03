/**
 * Event Card Generator
 *
 * Generates a single event card component with:
 * - Event image with date overlay
 * - Event title and venue
 * - Date, time, and price display
 * - Category badge
 * - Hover effects and click navigation
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateEventCard(resolved: ResolvedComponent): string {
  const dataSource = resolved.dataSource || 'events';
  const props = resolved.props || {};

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'events'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'events';

  // Helper to get field name from mappings
  const getFieldName = (targetField: string, fallback: string): string => {
    const mapping = resolved.fieldMappings?.find(m => m.targetField === targetField);
    return mapping?.sourceField || fallback;
  };

  // Extract field names
  const titleField = getFieldName('title', 'title');
  const imageField = getFieldName('image_url', 'image_url');
  const dateField = getFieldName('start_date', 'start_date');
  const venueField = getFieldName('venue_name', 'venue_name');

  const showPrice = props?.showPrice !== false;
  const showCategory = props?.showCategory !== false;
  const showTime = props?.showTime !== false;

  // Generate component name from dataSource
  const componentName = `${dataSource.charAt(0).toUpperCase()}${dataSource.slice(1).replace(/[_-](\w)/g, (_, c) => c.toUpperCase())}Card`;

  return `
'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Calendar, MapPin, Clock, Ticket, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  ${titleField}: string;
  description?: string;
  ${dateField}: string;
  start_time?: string;
  end_time?: string;
  ${venueField}: string;
  ${imageField}?: string;
  category?: { id: string; name: string };
  is_featured?: boolean;
  ticket_types?: Array<{ price: number }>;
}

interface ${componentName}Props {
  event?: Event;
  className?: string;
  showPrice?: boolean;
  showCategory?: boolean;
  showTime?: boolean;
  onClick?: (event: Event) => void;
}

export default function ${componentName}({
  event: propEvent,
  className,
  showPrice = ${showPrice},
  showCategory = ${showCategory},
  showTime = ${showTime},
  onClick
}: ${componentName}Props) {
  const navigate = useNavigate();

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response || {});
    },
    enabled: !propEvent,
    retry: 1,
  });

  const event = propEvent || fetchedData || {};

  if (isLoading && !propEvent) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event.id) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeString;
    }
  };

  const getLowestPrice = () => {
    if (event.ticket_types && event.ticket_types.length > 0) {
      const prices = event.ticket_types.map(t => t.price).filter(p => p > 0);
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }
    return null;
  };

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    } else {
      navigate(\`/events/\${event.id}\`);
    }
  };

  const dateInfo = formatDate(event.${dateField});
  const lowestPrice = getLowestPrice();
  const categoryName = event.category?.name;

  return (
    <Card
      className={cn(
        "group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:border-gray-700",
        className
      )}
      onClick={handleClick}
    >
      {/* Image with Date Overlay */}
      <div className="relative h-48 overflow-hidden">
        {event.${imageField} ? (
          <img
            src={event.${imageField}}
            alt={event.${titleField}}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-white/50" />
          </div>
        )}

        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2 text-center min-w-[60px]">
          <span className="block text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">
            {dateInfo.month}
          </span>
          <span className="block text-2xl font-bold text-gray-900 dark:text-white leading-none">
            {dateInfo.day}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {dateInfo.weekday}
          </span>
        </div>

        {/* Featured Badge */}
        {event.is_featured && (
          <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
            Featured
          </Badge>
        )}

        {/* Category Badge */}
        {showCategory && categoryName && (
          <Badge
            variant="secondary"
            className="absolute bottom-4 left-4 bg-black/60 text-white border-0"
          >
            {categoryName}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.${titleField}}
        </h3>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {/* Time */}
          {showTime && event.start_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                {formatTime(event.start_time)}
                {event.end_time && \` - \${formatTime(event.end_time)}\`}
              </span>
            </div>
          )}

          {/* Venue */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.${venueField}}</span>
          </div>
        </div>

        {/* Price */}
        {showPrice && lowestPrice !== null && (
          <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
            <div className="flex items-center gap-1">
              <Ticket className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">From</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                \${lowestPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
`;
}
