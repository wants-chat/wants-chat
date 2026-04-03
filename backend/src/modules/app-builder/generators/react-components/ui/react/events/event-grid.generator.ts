/**
 * Event Grid Generator
 *
 * Generates a responsive grid of event cards with:
 * - Event image with date overlay
 * - Event title and venue
 * - Date and time display
 * - Starting price
 * - Category badges
 * - Search and filter functionality
 *
 * Follows the same pattern as product-grid - receives data via props
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateEventGrid(resolved: ResolvedComponent): string {
  const dataSource = resolved.dataSource || 'events';
  const title = resolved.title || 'Events';
  const props = resolved.props || {};

  // Helper to get field name from mappings
  const getFieldName = (targetField: string, fallback: string): string => {
    const mapping = resolved.fieldMappings?.find(m => m.targetField === targetField);
    return mapping?.sourceField || fallback;
  };

  // Extract field names from mappings or use defaults
  const titleField = getFieldName('title', 'title');
  const imageField = getFieldName('image_url', 'image_url');
  const dateField = getFieldName('start_date', 'start_date');
  const venueField = getFieldName('venue_name', 'venue_name');
  const categoryField = getFieldName('category_id', 'category_id');

  const columns = props?.columns || 3;
  const showSearch = props?.showSearch !== false;
  const showCategoryFilter = props?.showCategoryFilter !== false;
  const showDateFilter = props?.showDateFilter !== false;

  // Sanitize data source for variable name
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const dataName = sanitizeVariableName(dataSource);

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource}`;
  };

  const apiRoute = getApiRoute();

  return `
'use client';

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, Search, ChevronRight, Ticket, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Event {
  id: string;
  ${titleField}: string;
  description?: string;
  ${dateField}: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  ${venueField}: string;
  venue_address?: string;
  ${imageField}?: string;
  ${categoryField}?: string;
  category?: { id: string; name: string; slug?: string };
  is_featured?: boolean;
  ticket_types?: Array<{ price: number }>;
}

interface EventGridProps {
  [key: string]: any;
  title?: string;
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  showDateFilter?: boolean;
  featuredOnly?: boolean;
  limit?: number;
  className?: string;
}

const EventGridComponent: React.FC<EventGridProps> = ({
  ${dataName}: propData,
  data,
  title = '${title}',
  showSearch = ${showSearch},
  showCategoryFilter = ${showCategoryFilter},
  showDateFilter = ${showDateFilter},
  featuredOnly = false,
  limit,
  className,
  onEventClick,
  ...props
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Use either the specific prop name or generic 'data' prop
  const inputData = propData || data;

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        return [];
      }
    },
    enabled: !inputData || (Array.isArray(inputData) && inputData.length === 0),
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const sourceData = inputData || fetchedData || {};

  // Loading state
  if (isLoading && !inputData) {
    return (
      <div className={cn('space-y-6', className)}>
        {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>}
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading events...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !inputData) {
    return (
      <div className={cn('space-y-6', className)}>
        {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>}
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center text-red-500">
            <p>Failed to load events. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Normalize data structure - handle both array and object with events property
  let eventsList = Array.isArray(sourceData)
    ? sourceData
    : (sourceData?.events || sourceData?.items || sourceData?.data || []);

  // Extract unique categories from events
  const categories = useMemo(() => {
    const cats = new Map<string, string>();
    eventsList.forEach((event: Event) => {
      if (event.category?.id && event.category?.name) {
        cats.set(event.category.id, event.category.name);
      }
    });
    return Array.from(cats.entries()).map(([id, name]) => ({ id, name }));
  }, [eventsList]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = [...eventsList];

    // Featured only filter
    if (featuredOnly) {
      filtered = filtered.filter((event: Event) => event.is_featured);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((event: Event) =>
        event.${titleField}?.toLowerCase().includes(query) ||
        event.${venueField}?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((event: Event) =>
        event.${categoryField} === selectedCategory ||
        event.category?.id === selectedCategory
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'upcoming') {
      filtered = filtered.filter((event: Event) => new Date(event.${dateField}) >= now);
    } else if (dateFilter === 'this-week') {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      filtered = filtered.filter((event: Event) => {
        const eventDate = new Date(event.${dateField});
        return eventDate >= now && eventDate <= weekEnd;
      });
    } else if (dateFilter === 'this-month') {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filtered = filtered.filter((event: Event) => {
        const eventDate = new Date(event.${dateField});
        return eventDate >= now && eventDate <= monthEnd;
      });
    }

    // Sort by date
    filtered.sort((a: Event, b: Event) => new Date(a.${dateField}).getTime() - new Date(b.${dateField}).getTime());

    // Apply limit
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [eventsList, searchQuery, selectedCategory, dateFilter, limit, featuredOnly]);

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

  const getLowestPrice = (event: Event) => {
    if (event.ticket_types && event.ticket_types.length > 0) {
      const prices = event.ticket_types.map(t => t.price).filter(p => p > 0);
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }
    return null;
  };

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      navigate(\`/events/\${event.id}\`);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {filteredEvents.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      )}

      {/* Filters */}
      {(showSearch || showCategoryFilter || showDateFilter) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {showCategoryFilter && categories.length > 0 && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {showDateFilter && (
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="When" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try adjusting your search or filters' : 'Check back later for upcoming events'}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6">
          {filteredEvents.map((event: Event) => {
            const dateInfo = formatDate(event.${dateField});
            const lowestPrice = getLowestPrice(event);
            const categoryName = event.category?.name;

            return (
              <Card
                key={event.id}
                className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                onClick={() => handleEventClick(event)}
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
                  {categoryName && (
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
                    {event.start_time && (
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

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                    {lowestPrice !== null && (
                      <div className="flex items-center gap-1">
                        <Ticket className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">From</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          \${lowestPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="gap-1 text-blue-600 dark:text-blue-400 ml-auto">
                      View <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventGridComponent;
`;
}
