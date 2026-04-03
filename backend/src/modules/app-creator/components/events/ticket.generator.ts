/**
 * Ticket Component Generator
 */

export interface TicketOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTicketSelector(options: TicketOptions = {}): string {
  const { componentName = 'TicketSelector', endpoint = '/tickets' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Ticket, Plus, Minus, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: ticketTypes, isLoading } = useQuery({
    queryKey: ['ticket-types', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?event_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: (tickets: any) => api.post('/orders', { event_id: id, tickets }),
    onSuccess: (response: any) => {
      toast.success('Tickets purchased!');
      navigate('/orders/' + (response?.data?.id || response?.id));
    },
    onError: () => toast.error('Failed to purchase tickets'),
  });

  const updateQuantity = (ticketId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketId] || 0;
      const newQty = Math.max(0, current + delta);
      return { ...prev, [ticketId]: newQty };
    });
  };

  const totalAmount = ticketTypes?.reduce((sum: number, ticket: any) => {
    return sum + (ticket.price * (quantities[ticket.id] || 0));
  }, 0) || 0;

  const totalTickets = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const handlePurchase = () => {
    const selectedTickets = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketId, quantity]) => ({ ticket_type_id: ticketId, quantity }));
    purchaseMutation.mutate(selectedTickets);
  };

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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Select Tickets
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {ticketTypes && ticketTypes.length > 0 ? (
          ticketTypes.map((ticket: any) => (
            <div key={ticket.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{ticket.name}</h3>
                  {ticket.description && (
                    <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                  )}
                  <p className="text-lg font-bold text-purple-600 mt-2">\${ticket.price}</p>
                  {ticket.available !== undefined && (
                    <p className="text-xs text-gray-500">{ticket.available} remaining</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(ticket.id, -1)}
                    disabled={(quantities[ticket.id] || 0) === 0}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                    {quantities[ticket.id] || 0}
                  </span>
                  <button
                    onClick={() => updateQuantity(ticket.id, 1)}
                    disabled={ticket.available !== undefined && (quantities[ticket.id] || 0) >= ticket.available}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {ticket.perks && ticket.perks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ticket.perks.map((perk: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs text-green-600">
                      <Check className="w-3 h-3" />
                      {perk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">No tickets available</div>
        )}
      </div>
      {totalTickets > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between mb-4">
            <span className="text-gray-500">{totalTickets} ticket(s)</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">\${totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={handlePurchase}
            disabled={purchaseMutation.isPending}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {purchaseMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Get Tickets'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTicketList(options: TicketOptions = {}): string {
  const { componentName = 'TicketList', endpoint = '/my-tickets' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Ticket, Calendar, MapPin, QrCode } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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
    <div className="space-y-4">
      {tickets && tickets.length > 0 ? (
        tickets.map((ticket: any) => (
          <Link
            key={ticket.id}
            to={\`/tickets/\${ticket.id}\`}
            className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="flex">
              <div className="w-2 bg-purple-600" />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.event_title}</h3>
                    <p className="text-sm text-gray-500">{ticket.ticket_type}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {ticket.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(ticket.event_date).toLocaleDateString()}
                        </span>
                      )}
                      {ticket.event_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {ticket.event_location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={\`px-3 py-1 rounded-full text-xs font-medium \${
                      ticket.status === 'valid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      ticket.status === 'used' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }\`}>
                      {ticket.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-2">#{ticket.ticket_number || ticket.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center px-4 border-l border-dashed border-gray-200 dark:border-gray-700">
                <QrCode className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No tickets yet
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTicketDetail(options: TicketOptions = {}): string {
  const { componentName = 'TicketDetail', endpoint = '/tickets' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, Clock, MapPin, User, Download } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
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

  if (!ticket) {
    return <div className="text-center py-12 text-gray-500">Ticket not found</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-purple-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold">{ticket.event_title}</h1>
          <p className="opacity-90">{ticket.ticket_type}</p>
        </div>

        <div className="p-6">
          {ticket.qr_code_url ? (
            <img src={ticket.qr_code_url} alt="QR Code" className="w-48 h-48 mx-auto mb-6" />
          ) : (
            <div className="w-48 h-48 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-4xl font-mono text-gray-400">{ticket.ticket_number || ticket.id}</span>
            </div>
          )}

          <div className="space-y-3 text-sm">
            {ticket.attendee_name && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Attendee</p>
                  <p className="font-medium text-gray-900 dark:text-white">{ticket.attendee_name}</p>
                </div>
              </div>
            )}
            {ticket.event_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(ticket.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {ticket.event_time && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">{ticket.event_time}</p>
                </div>
              </div>
            )}
            {ticket.event_location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Venue</p>
                  <p className="font-medium text-gray-900 dark:text-white">{ticket.event_location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 p-4">
          <button className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
