/**
 * Ticket Selector Generator
 *
 * Generates a standalone ticket selection component with:
 * - Ticket type listing with prices
 * - Quantity selectors
 * - Price calculation
 * - Add to cart functionality
 * - Availability indicators
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTicketSelector(resolved: ResolvedComponent): string {
  const dataSource = resolved.dataSource || 'ticket_types';
  const props = resolved.props || {};

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'ticket-types'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'ticketTypes';

  const showDescription = props?.showDescription !== false;
  const showAvailability = props?.showAvailability !== false;
  const maxPerOrder = props?.maxPerOrder || 10;

  // Generate component name from dataSource
  const componentName = `${dataSource.charAt(0).toUpperCase()}${dataSource.slice(1).replace(/[_-](\w)/g, (_, c) => c.toUpperCase())}Selector`;

  return `
'use client';

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Ticket, Minus, Plus, ShoppingCart, AlertCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
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
  title: string;
  start_date: string;
  image_url?: string;
}

interface ${componentName}Props {
  event?: Event;
  ticketTypes?: TicketType[];
  loading?: boolean;
  className?: string;
  showDescription?: boolean;
  showAvailability?: boolean;
  maxPerOrder?: number;
  onAddToCart?: (selections: Array<{ ticketTypeId: string; quantity: number }>) => void;
  title?: string;
  showQuantitySelector?: boolean;
  data?: any;
}

export default function ${componentName}({
  event,
  ticketTypes: propTicketTypes,
  loading = false,
  className,
  showDescription = ${showDescription},
  showAvailability = ${showAvailability},
  maxPerOrder = ${maxPerOrder},
  onAddToCart
}: ${componentName}Props) {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: fetchedData, isLoading: isFetchingTickets } = useQuery({
    queryKey: ['${entity}', event?.id],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.ticketTypes || []);
    },
    enabled: !propTicketTypes || propTicketTypes.length === 0,
    retry: 1,
  });

  const ticketTypes = (propTicketTypes && propTicketTypes.length > 0) ? propTicketTypes : (fetchedData || []);

  if ((isFetchingTickets || loading) && (!propTicketTypes || propTicketTypes.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeTickets = useMemo(() => {
    return ticketTypes.filter(ticket => {
      if (!ticket.is_active) return false;

      // Check sale dates
      const now = new Date();
      if (ticket.sale_start_date && new Date(ticket.sale_start_date) > now) return false;
      if (ticket.sale_end_date && new Date(ticket.sale_end_date) < now) return false;

      return true;
    });
  }, [ticketTypes]);

  const handleQuantityChange = (ticketId: string, delta: number) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, current + delta);
      const ticket = ticketTypes.find(t => t.id === ticketId);
      const max = Math.min(
        ticket?.max_per_order || maxPerOrder,
        ticket?.quantity_available || 0
      );
      return {
        ...prev,
        [ticketId]: Math.min(newValue, max)
      };
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === ticketId);
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
      if (onAddToCart) {
        const selections = Object.entries(selectedTickets)
          .filter(([_, quantity]) => quantity > 0)
          .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));
        onAddToCart(selections);
      } else {
        // Build cart items from selected tickets
        const cartItems = Object.entries(selectedTickets)
          .filter(([_, quantity]) => quantity > 0)
          .map(([ticketId, quantity]) => {
            const ticket = ticketTypes.find(t => t.id === ticketId);
            return {
              event_id: event?.id || '',
              ticket_type_id: ticketId,
              quantity,
              price: ticket?.price || 0,
              event_title: event?.title || '',
              ticket_name: ticket?.name || '',
              event_date: event?.start_date || '',
              event_image: event?.image_url || ''
            };
          });

        // Store in localStorage for checkout page
        localStorage.setItem('checkout_items', JSON.stringify(cartItems));

        // Navigate to checkout
        navigate('/checkout');
      }
      setSelectedTickets({});
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTicketStatus = (ticket: TicketType) => {
    const now = new Date();

    if (ticket.quantity_available === 0) {
      return { label: 'Sold Out', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    }

    if (ticket.sale_start_date && new Date(ticket.sale_start_date) > now) {
      return { label: 'Coming Soon', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    }

    if (ticket.sale_end_date && new Date(ticket.sale_end_date) < now) {
      return { label: 'Sales Ended', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' };
    }

    if (ticket.quantity_available < 10) {
      return { label: 'Almost Gone', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
    }

    return { label: 'Available', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  if (loading) {
    return (
      <Card className={cn("dark:bg-gray-800 dark:border-gray-700", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border rounded-lg dark:border-gray-600">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activeTickets.length === 0) {
    return (
      <Card className={cn("dark:bg-gray-800 dark:border-gray-700", className)}>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Tickets Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Tickets are not currently available for this event.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("dark:bg-gray-800 dark:border-gray-700", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-blue-600" />
          Select Tickets
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeTickets.map(ticket => {
          const quantity = selectedTickets[ticket.id] || 0;
          const status = getTicketStatus(ticket);
          const isSoldOut = ticket.quantity_available === 0;
          const maxQty = Math.min(
            ticket.max_per_order || maxPerOrder,
            ticket.quantity_available
          );

          return (
            <div
              key={ticket.id}
              className={cn(
                "p-4 border rounded-lg transition-all",
                "dark:border-gray-600",
                isSoldOut
                  ? "opacity-60 bg-gray-50 dark:bg-gray-800/50"
                  : "hover:border-blue-400 dark:hover:border-blue-500",
                quantity > 0 && "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
              )}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {ticket.name}
                    </h4>
                    <Badge className={cn("text-xs", status.color)}>
                      {status.label}
                    </Badge>
                  </div>
                  {showDescription && ticket.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ticket.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {Number(ticket.price) > 0 ? \`$\${Number(ticket.price).toFixed(2)}\` : 'Free'}
                  </span>
                </div>
              </div>

              {/* Availability & Selector */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-600">
                {showAvailability && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {isSoldOut ? (
                      'No tickets left'
                    ) : ticket.quantity_available < 20 ? (
                      <span className="text-orange-600 dark:text-orange-400">
                        Only {ticket.quantity_available} left
                      </span>
                    ) : (
                      \`\${ticket.quantity_available} available\`
                    )}
                  </span>
                )}

                {!isSoldOut && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(ticket.id, -1)}
                      disabled={quantity === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(ticket.id, 1)}
                      disabled={quantity >= maxQty}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Selected indicator */}
              {quantity > 0 && (
                <div className="flex items-center gap-2 mt-3 text-sm text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>\${(ticket.price * quantity).toFixed(2)} for {quantity} ticket{quantity > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      {/* Footer with Total and Add to Cart */}
      <CardFooter className="flex-col gap-4 border-t dark:border-gray-700 pt-4">
        {/* Summary */}
        <div className="w-full space-y-2">
          {Object.entries(selectedTickets)
            .filter(([_, qty]) => qty > 0)
            .map(([ticketId, qty]) => {
              const ticket = ticketTypes.find(t => t.id === ticketId);
              if (!ticket) return null;
              return (
                <div key={ticketId} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {ticket.name} x {qty}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    \${(ticket.price * qty).toFixed(2)}
                  </span>
                </div>
              );
            })}
        </div>

        <Separator />

        {/* Total */}
        <div className="w-full flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              ({getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''})
            </span>
          </div>
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
            <>
              <Clock className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Proceed to Checkout
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
`;
}
