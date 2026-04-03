/**
 * Event Detail Page Generator
 *
 * Generates a comprehensive event detail page with:
 * - Hero image with event info overlay
 * - Event description and details
 * - Venue information with map link
 * - Ticket type selection
 * - Add to cart functionality
 * - Related events section
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateEventDetailPage(resolved: ResolvedComponent): string {
  const dataSource = resolved.dataSource || 'events';
  const props = resolved.props || {};

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
  const descriptionField = getFieldName('description', 'description');

  const showRelatedEvents = props?.showRelatedEvents !== false;
  const showOrganizer = props?.showOrganizer !== false;

  // Generate component name from dataSource
  const componentName = `${dataSource.charAt(0).toUpperCase()}${dataSource.slice(1).replace(/[_-](\w)/g, (_, c) => c.toUpperCase())}DetailPage`;

  return `
'use client';

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Ticket, Share2, Heart,
  ChevronLeft, Users, ArrowRight, ExternalLink, Minus, Plus,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity_available: number;
  max_per_order?: number;
  sale_start_date?: string;
  sale_end_date?: string;
  is_active: boolean;
}

interface Event {
  id: string;
  ${titleField}: string;
  ${descriptionField}?: string;
  ${dateField}: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  ${venueField}: string;
  venue_address?: string;
  ${imageField}?: string;
  category_id?: string;
  category?: { id: string; name: string; slug?: string };
  organizer_name?: string;
  organizer_email?: string;
  is_featured?: boolean;
  is_published?: boolean;
  ticket_types?: TicketType[];
  max_attendees?: number;
  tickets_sold?: number;
}

interface ${componentName}Props {
  className?: string;
  title?: string;
  showTicketSelection?: boolean;
  showVenueMap?: boolean;
  showOrganizerInfo?: boolean;
  showShareButtons?: boolean;
  data?: any;
}

export default function ${componentName}({ className }: ${componentName}Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch event details
  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['${dataSource}', id],
    queryFn: async () => {
      const response = await api.get<Event>(\`/${dataSource}/\${id}\`);
      return (response as any)?.data?.data || (response as any)?.data || response;
    },
    enabled: !!id
  });

  // Fetch ticket types for this event
  const { data: ticketTypesData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['ticket_types', 'event', id],
    queryFn: async () => {
      const response = await api.get<TicketType[]>(\`/ticket_types?event_id=\${id}\`);
      return (response as any)?.data?.data || (response as any)?.data || [];
    },
    enabled: !!id
  });

  // Combine event with ticket types
  const event = eventData ? {
    ...eventData,
    ticket_types: ticketTypesData || []
  } : undefined;

  const loading = eventLoading || ticketsLoading;
  const error = null;

  // Fetch related events
  const { data: relatedEvents } = useQuery({
    queryKey: ['${dataSource}', 'related', event?.category_id],
    queryFn: async () => {
      const queryParams = event?.category_id
        ? \`?category_id=\${event.category_id}&limit=4\`
        : '?limit=4';
      const response = await api.get<Event[]>(\`/${dataSource}\${queryParams}\`);
      return (response as any)?.data || response || [];
    },
    enabled: !!event
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
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

  const handleTicketQuantityChange = (ticketId: string, delta: number) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, current + delta);
      const ticket = event?.ticket_types?.find((t: TicketType) => t.id === ticketId);
      const max = Math.min(ticket?.max_per_order || 10, ticket?.quantity_available || 0);
      return {
        ...prev,
        [ticketId]: Math.min(newValue, max)
      };
    });
  };

  const getTotalPrice = () => {
    if (!event?.ticket_types) return 0;
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = event.ticket_types?.find((t: TicketType) => t.id === ticketId);
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handleProceedToCheckout = () => {
    if (getTotalTickets() === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    setIsProcessing(true);
    try {
      // Build cart items from selected tickets
      const cartItems = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketId, quantity]) => {
          const ticket = event?.ticket_types?.find((t: TicketType) => t.id === ticketId);
          return {
            event_id: event?.id || '',
            ticket_type_id: ticketId,
            quantity,
            price: ticket?.price || 0,
            event_title: event?.${titleField} || '',
            ticket_name: ticket?.name || '',
            event_date: event?.${dateField} || '',
            event_image: event?.${imageField} || ''
          };
        });

      // Store in localStorage for checkout page
      localStorage.setItem('checkout_items', JSON.stringify(cartItems));

      // Navigate to checkout
      navigate('/checkout');
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.${titleField},
          text: \`Check out this event: \${event?.${titleField}}\`,
          url: window.location.href
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const isEventPast = () => {
    if (!event?.${dateField}) return false;
    // Use end_date if available, otherwise use start_date
    const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(event.${dateField});
    // Add end_time if available, or assume end of day
    if (event.end_time) {
      const [hours, minutes] = event.end_time.split(':').map(Number);
      eventEndDate.setHours(hours || 23, minutes || 59, 59);
    } else {
      eventEndDate.setHours(23, 59, 59);
    }
    return eventEndDate < new Date();
  };

  const getAvailabilityStatus = () => {
    if (!event) return null;
    if (isEventPast()) return { text: 'Event Ended', color: 'bg-gray-500' };

    const totalAvailable = event.ticket_types?.reduce((sum: number, t: TicketType) => sum + (t.quantity_available || 0), 0) || 0;
    if (totalAvailable === 0) return { text: 'Sold Out', color: 'bg-red-500' };
    if (totalAvailable < 20) return { text: 'Almost Sold Out', color: 'bg-orange-500' };
    return { text: 'Available', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
        <Skeleton className="h-96 w-full" />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center", className)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/events')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const availability = getAvailabilityStatus();
  const dateInfo = formatShortDate(event.${dateField});
  const filteredRelated = relatedEvents?.filter((e: Event) => e.id !== event.id).slice(0, 3) || [];

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Hero Section */}
      <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
        {event.${imageField} ? (
          <img
            src={event.${imageField}}
            alt={event.${titleField}}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Back Button */}
        <Button
          variant="ghost"
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          onClick={() => navigate('/events')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {event.category?.name && (
                  <Badge className="bg-blue-600 text-white">
                    {event.category.name}
                  </Badge>
                )}
                {event.is_featured && (
                  <Badge className="bg-yellow-500 text-white">Featured</Badge>
                )}
                {availability && (
                  <Badge className={cn("text-white", availability.color)}>
                    {availability.text}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-white">
                {event.${titleField}}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(event.${dateField})}</span>
                </div>
                {event.start_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>
                      {formatTime(event.start_time)}
                      {event.end_time && \` - \${formatTime(event.end_time)}\`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Date Card (Desktop) */}
            <div className="hidden lg:flex bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 text-center min-w-[100px]">
              <div>
                <span className="block text-sm font-medium text-blue-600 dark:text-blue-400 uppercase">
                  {dateInfo.month}
                </span>
                <span className="block text-4xl font-bold text-gray-900 dark:text-white">
                  {dateInfo.day}
                </span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  {dateInfo.weekday}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {event.${descriptionField} ? (
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {event.${descriptionField}}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No description available for this event.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Venue */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Venue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {event.${venueField}}
                    </h4>
                    {event.venue_address && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {event.venue_address}
                      </p>
                    )}
                  </div>
                  {event.venue_address && (
                    <a
                      href={\`https://maps.google.com/?q=\${encodeURIComponent(event.venue_address)}\`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Map
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            ${showOrganizer ? `{/* Organizer */}
            {event.organizer_name && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Organizer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {event.organizer_name}
                      </h4>
                      {event.organizer_email && (
                        <a
                          href={\`mailto:\${event.organizer_email}\`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Contact Organizer
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}` : ''}
          </div>

          {/* Right Column - Ticket Selection */}
          <div className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  Select Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEventPast() ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">
                      This event has already ended
                    </p>
                  </div>
                ) : event.ticket_types && event.ticket_types.length > 0 ? (
                  <>
                    {event.ticket_types
                      .filter((ticket: TicketType) => ticket.is_active)
                      .map((ticket: TicketType) => {
                        const quantity = selectedTickets[ticket.id] || 0;
                        const isSoldOut = ticket.quantity_available === 0;

                        return (
                          <div
                            key={ticket.id}
                            className={cn(
                              "p-4 border rounded-lg dark:border-gray-600",
                              isSoldOut ? "opacity-50" : "hover:border-blue-500 dark:hover:border-blue-400"
                            )}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {ticket.name}
                                </h4>
                                {ticket.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {ticket.description}
                                  </p>
                                )}
                              </div>
                              <span className="font-bold text-lg text-gray-900 dark:text-white">
                                {Number(ticket.price) > 0 ? \`$\${Number(ticket.price).toFixed(2)}\` : 'Free'}
                              </span>
                            </div>

                            {isSoldOut ? (
                              <Badge variant="secondary" className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                Sold Out
                              </Badge>
                            ) : (
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {ticket.quantity_available} available
                                </span>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleTicketQuantityChange(ticket.id, -1)}
                                    disabled={quantity === 0}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                                    {quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleTicketQuantityChange(ticket.id, 1)}
                                    disabled={quantity >= Math.min(ticket.max_per_order || 10, ticket.quantity_available)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Total ({getTotalTickets()} tickets)
                      </span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        \${getTotalPrice().toFixed(2)}
                      </span>
                    </div>

                    {/* Proceed to Checkout Button */}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleProceedToCheckout}
                      disabled={getTotalTickets() === 0 || isProcessing}
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Proceed to Checkout
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">
                      No tickets available for this event
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        ${showRelatedEvents ? `{/* Related Events */}
        {filteredRelated.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Related Events
              </h2>
              <Button variant="ghost" onClick={() => navigate('/events')}>
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredRelated.map((relatedEvent: Event) => {
                const relatedDateInfo = formatShortDate(relatedEvent.${dateField});
                const lowestPrice = relatedEvent.ticket_types?.reduce((min: number, t: TicketType) =>
                  Number(t.price) > 0 && Number(t.price) < min ? Number(t.price) : min, Infinity
                );

                return (
                  <Card
                    key={relatedEvent.id}
                    className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700"
                    onClick={() => navigate(\`/events/\${relatedEvent.id}\`)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      {relatedEvent.${imageField} ? (
                        <img
                          src={relatedEvent.${imageField}}
                          alt={relatedEvent.${titleField}}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                      )}
                      <div className="absolute top-3 left-3 bg-white dark:bg-gray-900 rounded-lg shadow p-2 text-center">
                        <span className="block text-xs font-medium text-blue-600 uppercase">
                          {relatedDateInfo.month}
                        </span>
                        <span className="block text-xl font-bold text-gray-900 dark:text-white leading-none">
                          {relatedDateInfo.day}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedEvent.${titleField}}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{relatedEvent.${venueField}}</span>
                      </div>
                      {lowestPrice && lowestPrice !== Infinity && (
                        <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                          From \${lowestPrice.toFixed(2)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}` : ''}
      </div>
    </div>
  );
}
`;
}
