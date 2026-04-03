/**
 * Bakery Component Generator for React Native
 *
 * Generates bakery-specific components:
 * - BakeryStats: Dashboard stats for bakery operations
 * - ProductListFeatured: Featured bakery items list
 * - OrderListRecent: Recent orders list for bakery
 */

export interface BakeryOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate bakery stats dashboard component
 */
export function generateBakeryStats(options: BakeryOptions = {}): string {
  const { componentName = 'BakeryStats', endpoint = '/bakery/stats' } = options;

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

interface ${componentName}Props {
  className?: string;
}

const STATS_CONFIG = [
  { key: 'todaySales', label: "Today's Sales", icon: 'cash', color: '#16A34A', type: 'currency' },
  { key: 'todayOrders', label: "Today's Orders", icon: 'receipt', color: '#3B82F6', type: 'number' },
  { key: 'itemsSold', label: 'Items Sold', icon: 'basket', color: '#8B5CF6', type: 'number' },
  { key: 'customOrders', label: 'Custom Orders', icon: 'create', color: '#F59E0B', type: 'number' },
  { key: 'lowStockItems', label: 'Low Stock', icon: 'alert-circle', color: '#EF4444', type: 'number' },
  { key: 'avgOrderValue', label: 'Avg Order Value', icon: 'trending-up', color: '#06B6D4', type: 'currency' },
];

function ${componentName}() {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['bakery-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch bakery stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Bakery Dashboard</Text>
        <View style={styles.dateRow}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {STATS_CONFIG.map((stat) => {
          const value = stats[stat.key];
          const change = stats[stat.key + 'Change'];

          return (
            <View key={stat.key} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{formatValue(value, stat.type)}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {change !== undefined && (
                <View style={styles.changeRow}>
                  <Ionicons
                    name={change >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={change >= 0 ? '#16A34A' : '#EF4444'}
                  />
                  <Text style={[
                    styles.changeText,
                    { color: change >= 0 ? '#16A34A' : '#EF4444' },
                  ]}>
                    {Math.abs(change)}%
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate featured bakery products list component
 */
export function generateProductListFeatured(options: BakeryOptions = {}): string {
  const { componentName = 'ProductListFeatured', endpoint = '/bakery/products/featured' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

interface BakeryProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  is_new?: boolean;
  is_bestseller?: boolean;
  rating?: number;
  category?: string;
}

interface ${componentName}Props {
  limit?: number;
  onAddToCart?: (product: BakeryProduct) => void;
}

function ${componentName}({ limit = 8, onAddToCart }: ${componentName}Props) {
  const navigation = useNavigation();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['bakery-featured-products', limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: BakeryProduct }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="cafe" size={40} color="#D1D5DB" />
          </View>
        )}
        <View style={styles.badges}>
          {item.is_new && (
            <View style={styles.badgeNew}>
              <Text style={styles.badgeText}>New</Text>
            </View>
          )}
          {item.is_bestseller && (
            <View style={styles.badgeBestseller}>
              <Text style={styles.badgeText}>Bestseller</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          {item.rating && (
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
        </View>
        {item.category && (
          <Text style={styles.category}>{item.category}</Text>
        )}
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.priceRow}>
          <View style={styles.prices}>
            {item.sale_price && item.sale_price < item.price ? (
              <>
                <Text style={styles.salePrice}>\${item.sale_price.toFixed(2)}</Text>
                <Text style={styles.originalPrice}>\${item.price.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.price}>\${(item.price || 0).toFixed(2)}</Text>
            )}
          </View>
          {onAddToCart && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddToCart(item)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cafe-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No featured products</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Items</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Products' as never)}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  loadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badges: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  badgeNew: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeBestseller: {
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  prices: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F97316',
  },
  salePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

/**
 * Generate recent orders list component for bakery
 */
export function generateOrderListRecent(options: BakeryOptions = {}): string {
  const { componentName = 'OrderListRecent', endpoint = '/bakery/orders' } = options;

  return `import React from 'react';
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

interface Order {
  id: string;
  order_number?: string;
  status: string;
  customer_name?: string;
  total: number;
  items_count?: number;
  items?: any[];
  created_at: string;
  pickup_time?: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  pending: { color: '#FEF3C7', icon: 'time', label: 'Pending' },
  confirmed: { color: '#DBEAFE', icon: 'checkmark-circle', label: 'Confirmed' },
  preparing: { color: '#FED7AA', icon: 'restaurant', label: 'Baking' },
  ready: { color: '#E9D5FF', icon: 'gift', label: 'Ready' },
  completed: { color: '#DCFCE7', icon: 'checkmark-done-circle', label: 'Completed' },
  cancelled: { color: '#FEE2E2', icon: 'close-circle', label: 'Cancelled' },
};

interface ${componentName}Props {
  limit?: number;
}

function ${componentName}({ limit = 10 }: ${componentName}Props) {
  const navigation = useNavigation();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['bakery-orders-recent', limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=\${limit}&sort=created_at:desc\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const renderItem = ({ item: order }: { item: Order }) => {
    const status = STATUS_CONFIG[order.status?.toLowerCase()] || STATUS_CONFIG.pending;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail' as never, { id: order.id } as never)}
      >
        <View style={styles.orderRow}>
          <View style={styles.orderIconContainer}>
            <Ionicons name="cafe" size={20} color="#F97316" />
          </View>
          <View style={styles.orderInfo}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>
                Order #{order.order_number || order.id?.slice(-8)}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Ionicons name={status.icon as any} size={12} color="#374151" />
                <Text style={styles.statusText}>{status.label}</Text>
              </View>
            </View>
            <Text style={styles.customerName}>
              {order.customer_name || 'Guest'}
            </Text>
            <View style={styles.orderMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color="#6B7280" />
                <Text style={styles.metaText}>
                  {new Date(order.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="cube-outline" size={12} color="#6B7280" />
                <Text style={styles.metaText}>
                  {order.items_count || order.items?.length || 0} items
                </Text>
              </View>
              {order.pickup_time && (
                <View style={styles.metaItem}>
                  <Ionicons name="alarm-outline" size={12} color="#F97316" />
                  <Text style={[styles.metaText, { color: '#F97316' }]}>
                    Pickup: {order.pickup_time}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.orderTotal}>
            <Text style={styles.totalValue}>\${(order.total || 0).toFixed(2)}</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No recent orders</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="receipt" size={20} color="#F97316" />
          <Text style={styles.title}>Recent Orders</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Orders' as never)}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  listContent: {
    padding: 8,
  },
  orderCard: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  customerName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  orderMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  orderTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
