/**
 * Ticket Component Generator for React Native
 *
 * Generates ticket components with:
 * - Ticket selector with quantity controls
 * - Ticket list with QR codes
 * - Ticket detail view
 */

export interface TicketOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTicketSelector(options: TicketOptions = {}): string {
  const { componentName = 'TicketSelector', endpoint = '/tickets' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
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
      showToast('success', 'Tickets purchased!');
      navigation.navigate('OrderDetail' as never, { id: response?.data?.id || response?.id } as never);
    },
    onError: () => showToast('error', 'Failed to purchase tickets'),
  });

  const updateQuantity = useCallback((ticketId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketId] || 0;
      const newQty = Math.max(0, current + delta);
      return { ...prev, [ticketId]: newQty };
    });
  }, []);

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

  const renderTicketType = ({ item: ticket }: { item: any }) => {
    const quantity = quantities[ticket.id] || 0;
    const maxReached = ticket.available !== undefined && quantity >= ticket.available;

    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketName}>{ticket.name}</Text>
          {ticket.description && (
            <Text style={styles.ticketDescription}>{ticket.description}</Text>
          )}
          <Text style={styles.ticketPrice}>\${ticket.price}</Text>
          {ticket.available !== undefined && (
            <Text style={styles.availableText}>{ticket.available} remaining</Text>
          )}
          {ticket.perks && ticket.perks.length > 0 && (
            <View style={styles.perksContainer}>
              {ticket.perks.map((perk: string, i: number) => (
                <View key={i} style={styles.perkItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, quantity === 0 && styles.quantityButtonDisabled]}
            onPress={() => updateQuantity(ticket.id, -1)}
            disabled={quantity === 0}
          >
            <Ionicons name="remove" size={20} color={quantity === 0 ? '#D1D5DB' : '#111827'} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, maxReached && styles.quantityButtonDisabled]}
            onPress={() => updateQuantity(ticket.id, 1)}
            disabled={maxReached}
          >
            <Ionicons name="add" size={20} color={maxReached ? '#D1D5DB' : '#111827'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="ticket-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No tickets available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="ticket-outline" size={20} color="#111827" />
        <Text style={styles.headerTitle}>Select Tickets</Text>
      </View>

      <FlatList
        data={ticketTypes}
        renderItem={renderTicketType}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {totalTickets > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{totalTickets} ticket(s)</Text>
            <Text style={styles.totalAmount}>\${totalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.purchaseButton, purchaseMutation.isPending && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={purchaseMutation.isPending}
          >
            {purchaseMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.purchaseButtonText}>Get Tickets</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  ticketCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketInfo: {
    flex: 1,
    marginRight: 16,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  ticketPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
  },
  availableText: {
    fontSize: 12,
    color: '#6B7280',
  },
  perksContainer: {
    marginTop: 12,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  perkText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    width: 40,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  purchaseButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#C4B5FD',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateTicketList(options: TicketOptions = {}): string {
  const { componentName = 'TicketList', endpoint = '/my-tickets' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'valid':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'used':
        return { bg: '#F3F4F6', text: '#6B7280' };
      default:
        return { bg: '#FEE2E2', text: '#DC2626' };
    }
  };

  const handleTicketPress = useCallback((ticket: any) => {
    navigation.navigate('TicketDetail' as never, { id: ticket.id } as never);
  }, [navigation]);

  const renderTicket = ({ item: ticket }: { item: any }) => {
    const statusStyle = getStatusStyle(ticket.status);
    const eventDate = ticket.event_date ? new Date(ticket.event_date) : null;

    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => handleTicketPress(ticket)}
        activeOpacity={0.7}
      >
        <View style={styles.ticketStripe} />
        <View style={styles.ticketContent}>
          <View style={styles.ticketHeader}>
            <View style={styles.ticketInfo}>
              <Text style={styles.eventTitle}>{ticket.event_title}</Text>
              <Text style={styles.ticketType}>{ticket.ticket_type}</Text>
              <View style={styles.eventDetails}>
                {eventDate && (
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {eventDate.toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {ticket.event_location && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.detailText}>{ticket.event_location}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.ticketMeta}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {ticket.status}
                </Text>
              </View>
              <Text style={styles.ticketNumber}>#{ticket.ticket_number || ticket.id}</Text>
            </View>
          </View>
        </View>
        <View style={styles.qrSection}>
          <Ionicons name="qr-code-outline" size={32} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="ticket-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No tickets yet</Text>
        <Text style={styles.emptySubtitle}>Your purchased tickets will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  ticketStripe: {
    width: 6,
    backgroundColor: '#7C3AED',
  },
  ticketContent: {
    flex: 1,
    padding: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  ticketType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  eventDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  ticketMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ticketNumber: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  qrSection: {
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateTicketDetail(options: TicketOptions = {}): string {
  const { componentName = 'TicketDetail', endpoint = '/tickets' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="ticket-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>Ticket not found</Text>
      </View>
    );
  }

  const eventDate = ticket.event_date ? new Date(ticket.event_date) : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.ticketContainer}>
        <View style={styles.ticketHeader}>
          <Text style={styles.eventTitle}>{ticket.event_title}</Text>
          <Text style={styles.ticketType}>{ticket.ticket_type}</Text>
        </View>

        <View style={styles.qrContainer}>
          {ticket.qr_code_url ? (
            <Image
              source={{ uri: ticket.qr_code_url }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>
                {ticket.ticket_number || ticket.id}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.dashedLine} />

        <View style={styles.detailsSection}>
          {ticket.attendee_name && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Attendee</Text>
                <Text style={styles.detailValue}>{ticket.attendee_name}</Text>
              </View>
            </View>
          )}

          {eventDate && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          )}

          {ticket.event_time && (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{ticket.event_time}</Text>
              </View>
            </View>
          )}

          {ticket.event_location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Venue</Text>
                <Text style={styles.detailValue}>{ticket.event_location}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.dashedLine} />

        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download-outline" size={20} color="#6B7280" />
          <Text style={styles.downloadButtonText}>Download Ticket</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  ticketContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  ticketHeader: {
    backgroundColor: '#7C3AED',
    padding: 24,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  ticketType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  qrContainer: {
    padding: 24,
    alignItems: 'center',
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  dashedLine: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  detailsSection: {
    padding: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
