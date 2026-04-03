/**
 * Ticket Sales Component Generators for React Native
 *
 * Generates ticket sales components with:
 * - Stats dashboard
 * - Today's sales
 * - Recent sales with filters
 */

export interface TicketSalesOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTicketStats(options: TicketSalesOptions = {}): string {
  const { componentName = 'TicketStats', endpoint = '/tickets/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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

  const statCards = [
    {
      label: 'Tickets Sold Today',
      value: stats?.tickets_sold_today || 0,
      icon: 'ticket',
      color: '#7C3AED',
      bg: '#F3E8FF',
      change: stats?.tickets_change,
    },
    {
      label: 'Revenue Today',
      value: stats?.revenue_today ? \`$\${stats.revenue_today.toLocaleString()}\` : '$0',
      icon: 'cash',
      color: '#10B981',
      bg: '#D1FAE5',
      change: stats?.revenue_change,
    },
    {
      label: 'Avg. Ticket Price',
      value: stats?.avg_ticket_price ? \`$\${stats.avg_ticket_price.toFixed(2)}\` : '$0',
      icon: 'stats-chart',
      color: '#3B82F6',
      bg: '#DBEAFE',
    },
    {
      label: 'Total Customers',
      value: stats?.total_customers || 0,
      icon: 'people',
      color: '#F59E0B',
      bg: '#FEF3C7',
    },
    {
      label: 'Conversion Rate',
      value: stats?.conversion_rate ? \`\${stats.conversion_rate}%\` : '0%',
      icon: 'trending-up',
      color: '#EC4899',
      bg: '#FCE7F3',
    },
    {
      label: 'Pending Orders',
      value: stats?.pending_orders || 0,
      icon: 'time',
      color: '#F97316',
      bg: '#FFEDD5',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statCards.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </Text>
              </View>
              {stat.change !== undefined && (
                <View style={[
                  styles.changeBadge,
                  { backgroundColor: stat.change >= 0 ? '#D1FAE5' : '#FEE2E2' },
                ]}>
                  <Text style={[
                    styles.changeText,
                    { color: stat.change >= 0 ? '#059669' : '#DC2626' },
                  ]}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  cardContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  changeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

export function generateTicketSalesToday(options: TicketSalesOptions = {}): string {
  const { componentName = 'TicketSalesToday', endpoint = '/tickets/sales/today' } = options;

  return `import React, { useCallback, useMemo } from 'react';
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

  const { data: sales, isLoading } = useQuery({
    queryKey: ['ticket-sales-today'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const totals = useMemo(() => {
    if (!sales) return { revenue: 0, tickets: 0 };
    return {
      revenue: sales.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.amount || 0), 0),
      tickets: sales.reduce((sum: number, sale: any) => sum + (sale.ticket_count || sale.quantity || 1), 0),
    };
  }, [sales]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return { icon: 'checkmark-circle', color: '#059669', bg: '#D1FAE5' };
      case 'pending':
        return { icon: 'time', color: '#D97706', bg: '#FEF3C7' };
      case 'failed':
      case 'cancelled':
        return { icon: 'close-circle', color: '#DC2626', bg: '#FEE2E2' };
      default:
        return { icon: 'ticket', color: '#7C3AED', bg: '#F3E8FF' };
    }
  };

  const handleSalePress = useCallback((sale: any) => {
    navigation.navigate('OrderDetail' as never, { id: sale.order_id || sale.id } as never);
  }, [navigation]);

  const renderSale = useCallback(({ item: sale }: { item: any }) => {
    const statusConfig = getStatusConfig(sale.status);

    return (
      <TouchableOpacity
        style={styles.saleCard}
        onPress={() => handleSalePress(sale)}
        activeOpacity={0.7}
      >
        <View style={[styles.statusIcon, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon as any} size={24} color={statusConfig.color} />
        </View>
        <View style={styles.saleContent}>
          <View style={styles.saleHeader}>
            <View style={styles.saleTitleSection}>
              <Text style={styles.saleTitle}>
                {sale.event_title || sale.event_name || 'Event Ticket'}
              </Text>
              <Text style={styles.orderNumber}>
                Order #{sale.order_number || sale.id?.slice(-8)}
              </Text>
            </View>
            <View style={styles.amountSection}>
              <Text style={styles.amountText}>
                \${(sale.total_amount || sale.amount || 0).toFixed(2)}
              </Text>
              <Text style={styles.ticketCount}>
                {sale.ticket_count || sale.quantity || 1} ticket(s)
              </Text>
            </View>
          </View>
          <View style={styles.saleMeta}>
            {sale.customer_name && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{sale.customer_name}</Text>
              </View>
            )}
            {sale.purchase_time && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{sale.purchase_time}</Text>
              </View>
            )}
            {sale.payment_method && (
              <View style={styles.metaItem}>
                <Ionicons name="card-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{sale.payment_method}</Text>
              </View>
            )}
            {sale.ticket_type && (
              <View style={styles.ticketTypeBadge}>
                <Text style={styles.ticketTypeText}>{sale.ticket_type}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleSalePress]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="ticket-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No sales today</Text>
        <Text style={styles.emptySubtitle}>No ticket sales recorded today yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="ticket" size={20} color="#7C3AED" />
          <Text style={styles.headerTitle}>Today's Ticket Sales</Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statText}>
            <Text style={styles.statValue}>{totals.tickets}</Text> tickets
          </Text>
          <Text style={styles.statText}>
            <Text style={[styles.statValue, styles.revenueText]}>\${totals.revenue.toLocaleString()}</Text> revenue
          </Text>
        </View>
      </View>
      <FlatList
        data={sales}
        renderItem={renderSale}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontWeight: '700',
    color: '#111827',
  },
  revenueText: {
    color: '#059669',
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  saleCard: {
    flexDirection: 'row',
  },
  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saleContent: {
    flex: 1,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  saleTitleSection: {
    flex: 1,
    marginRight: 8,
  },
  saleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  orderNumber: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  ticketCount: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  saleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  ticketTypeBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  ticketTypeText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '600',
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

export function generateTicketSalesRecent(options: TicketSalesOptions = {}): string {
  const { componentName = 'TicketSalesRecent', endpoint = '/tickets/sales/recent' } = options;

  return `import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  showFilters?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 10, showFilters = true }) => {
  const navigation = useNavigation();
  const [dateRange, setDateRange] = useState('7d');

  const { data: sales, isLoading } = useQuery({
    queryKey: ['ticket-sales-recent', dateRange, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        range: dateRange,
        limit: limit.toString(),
      });
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const groupedSales = useMemo(() => {
    if (!sales) return [];

    const grouped = sales.reduce((acc: any, sale: any) => {
      const date = sale.purchase_date || sale.created_at?.split('T')[0] || 'Unknown';
      if (!acc[date]) acc[date] = [];
      acc[date].push(sale);
      return acc;
    }, {});

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    return Object.entries(grouped).map(([date, dateSales]: [string, any]) => ({
      title: date === today ? 'Today' :
             date === yesterday ? 'Yesterday' :
             new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      total: dateSales.reduce((sum: number, s: any) => sum + (s.total_amount || s.amount || 0), 0),
      count: dateSales.length,
      data: dateSales,
    }));
  }, [sales]);

  const handleSalePress = useCallback((sale: any) => {
    navigation.navigate('OrderDetail' as never, { id: sale.order_id || sale.id } as never);
  }, [navigation]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return '#059669';
      case 'pending':
        return '#D97706';
      case 'refunded':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const dateRangeOptions = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  const renderSale = useCallback(({ item: sale }: { item: any }) => (
    <TouchableOpacity
      style={styles.saleItem}
      onPress={() => handleSalePress(sale)}
      activeOpacity={0.7}
    >
      <View style={styles.saleIcon}>
        <Ionicons name="ticket" size={20} color="#7C3AED" />
      </View>
      <View style={styles.saleInfo}>
        <View style={styles.saleHeader}>
          <Text style={styles.saleTitle} numberOfLines={1}>
            {sale.event_title || sale.event_name || 'Event Ticket'}
          </Text>
          {sale.ticket_type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{sale.ticket_type}</Text>
            </View>
          )}
        </View>
        <View style={styles.saleMeta}>
          {sale.customer_name && (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{sale.customer_name}</Text>
            </View>
          )}
          <Text style={styles.metaText}>
            {sale.ticket_count || sale.quantity || 1}x tickets
          </Text>
          {sale.purchase_time && (
            <Text style={styles.metaText}>{sale.purchase_time}</Text>
          )}
        </View>
      </View>
      <View style={styles.amountSection}>
        <Text style={styles.amountText}>
          \${(sale.total_amount || sale.amount || 0).toFixed(2)}
        </Text>
        <Text style={[styles.statusText, { color: getStatusStyle(sale.status) }]}>
          {sale.status || 'Completed'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  ), [handleSalePress]);

  const renderSectionHeader = useCallback(({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <Text style={styles.sectionStats}>
        {section.count} sale(s) - \${section.total.toLocaleString()}
      </Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="ticket-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No recent sales</Text>
        <Text style={styles.emptySubtitle}>No ticket sales found in this period</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trending-up" size={20} color="#10B981" />
          <Text style={styles.headerTitle}>Recent Sales</Text>
        </View>
        {showFilters && (
          <View style={styles.filterRow}>
            {dateRangeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterChip,
                  dateRange === option.value && styles.filterChipSelected,
                ]}
                onPress={() => setDateRange(option.value)}
              >
                <Text style={[
                  styles.filterChipText,
                  dateRange === option.value && styles.filterChipTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <SectionList
        sections={groupedSales}
        renderItem={renderSale}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {sales.length >= limit && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Sales' as never)}
        >
          <Text style={styles.viewAllText}>View All Sales</Text>
        </TouchableOpacity>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#7C3AED',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  sectionStats: {
    fontSize: 12,
    color: '#6B7280',
  },
  saleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saleInfo: {
    flex: 1,
    marginRight: 12,
  },
  saleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  saleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    color: '#6B7280',
  },
  saleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 2,
    marginRight: 8,
  },
  amountSection: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },
  viewAllButton: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
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
