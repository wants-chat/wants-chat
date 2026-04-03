/**
 * Print Shop Component Generators (React Native)
 *
 * Generates components for print shop management:
 * - PrintshopStats: Dashboard statistics
 * - CustomerProfilePrintshop: Customer profile with order history
 */

export interface PrintshopStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePrintshopStats(options: PrintshopStatsOptions = {}): string {
  const { componentName = 'PrintshopStats', endpoint = '/printshop/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['printshop-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  const statCards = [
    { key: 'ordersToday', label: "Today's Orders", icon: 'document-text', color: '#3B82F6' },
    { key: 'inProduction', label: 'In Production', icon: 'print', color: '#F59E0B' },
    { key: 'readyForPickup', label: 'Ready for Pickup', icon: 'checkmark-circle', color: '#10B981' },
    { key: 'rushOrders', label: 'Rush Orders', icon: 'warning', color: '#EF4444' },
    { key: 'totalPrints', label: 'Total Prints Today', icon: 'layers', color: '#8B5CF6' },
    { key: 'activeCustomers', label: 'Active Customers', icon: 'people', color: '#6366F1' },
    { key: 'revenueToday', label: "Today's Revenue", icon: 'cash', color: '#10B981', type: 'currency' },
    { key: 'avgTurnaround', label: 'Avg Turnaround', icon: 'time', color: '#F97316', suffix: ' hrs' },
  ];

  const formatValue = (value: any, type?: string, suffix?: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString() + (suffix || '');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statCards.map((stat) => (
          <View key={stat.key} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.value}>
              {formatValue(stats?.[stat.key], stat.type, stat.suffix)}
            </Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: '50%',
    padding: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface CustomerProfilePrintshopOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfilePrintshop(options: CustomerProfilePrintshopOptions = {}): string {
  const { componentName = 'CustomerProfilePrintshop', endpoint = '/printshop/customers' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const customerId = propId || (route.params as any)?.id;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['printshop-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: orderHistory } = useQuery({
    queryKey: ['printshop-customer-orders', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/orders\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const { data: savedDesigns } = useQuery({
    queryKey: ['printshop-customer-designs', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/designs\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const getOrderStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'in_production':
      case 'printing':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'ready':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'pending_approval':
        return { bg: '#E9D5FF', text: '#7C3AED' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const getProductIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type?.toLowerCase()) {
      case 'business_cards':
      case 'cards':
        return 'card';
      case 'banner':
      case 'poster':
      case 'sign':
        return 'image';
      case 'booklet':
      case 'brochure':
        return 'layers';
      default:
        return 'print';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Customer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewOrder' as never, { customerId } as never)}
            style={styles.orderButton}
          >
            <Ionicons name="print" size={18} color="#3B82F6" />
            <Text style={styles.orderButtonText}>New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditCustomer' as never, { id: customerId } as never)}
            style={styles.editButton}
          >
            <Ionicons name="create" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Info Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: customer.is_business ? '#DBEAFE' : '#E9D5FF' }]}>
            <Ionicons
              name={customer.is_business ? 'business' : 'person'}
              size={40}
              color={customer.is_business ? '#3B82F6' : '#8B5CF6'}
            />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{customer.name}</Text>
              {customer.is_business && (
                <View style={styles.businessBadge}>
                  <Text style={styles.businessText}>Business</Text>
                </View>
              )}
              {customer.discount_tier && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{customer.discount_tier}% Off</Text>
                </View>
              )}
            </View>
            {customer.company_name && (
              <Text style={styles.companyName}>{customer.company_name}</Text>
            )}
            <View style={styles.contactRow}>
              <Ionicons name="call" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.phone || 'No phone'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.email || 'No email'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.contactText}>
                Customer since {new Date(customer.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.total_orders || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              \${(customer.total_spent || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{savedDesigns?.length || 0}</Text>
            <Text style={styles.statLabel}>Saved Designs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Last Order</Text>
          </View>
        </View>
      </View>

      {/* Saved Designs */}
      {savedDesigns && savedDesigns.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Designs</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.designsRow}>
              {savedDesigns.slice(0, 4).map((design: any) => (
                <TouchableOpacity
                  key={design.id}
                  style={styles.designItem}
                  onPress={() => navigation.navigate('DesignDetail' as never, { id: design.id } as never)}
                >
                  {design.thumbnail_url ? (
                    <Image
                      source={{ uri: design.thumbnail_url }}
                      style={styles.designThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.designPlaceholder}>
                      <Ionicons name="image" size={32} color="#9CA3AF" />
                    </View>
                  )}
                  <Text style={styles.designName} numberOfLines={1}>{design.name}</Text>
                  <Text style={styles.designType}>{design.product_type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Order History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {orderHistory && orderHistory.length > 0 ? (
          orderHistory.slice(0, 5).map((order: any) => {
            const statusStyle = getOrderStatusStyle(order.status);
            const productIcon = getProductIcon(order.product_type);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItem}
                onPress={() => navigation.navigate('OrderDetail' as never, { id: order.id } as never)}
              >
                <View style={[
                  styles.orderIcon,
                  { backgroundColor: order.status === 'completed' ? '#D1FAE5' : '#DBEAFE' }
                ]}>
                  {order.status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  ) : (
                    <Ionicons name={productIcon} size={20} color="#3B82F6" />
                  )}
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderProduct}>
                    {order.product_name || order.product_type}
                  </Text>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderMetaText}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={styles.orderMetaText}>Qty: {order.quantity || 1}</Text>
                    {order.paper_type && (
                      <Text style={styles.orderMetaText}>{order.paper_type}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>\${(order.total || 0).toFixed(2)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {order.status?.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="cube" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No order history</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {customer.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{customer.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 6,
  },
  orderButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  businessBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  businessText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E40AF',
  },
  discountBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#065F46',
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  designsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  designItem: {
    width: 120,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  designThumbnail: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
  },
  designPlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  designName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  designType: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderProduct: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  orderMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  orderMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default ${componentName};
`;
}
