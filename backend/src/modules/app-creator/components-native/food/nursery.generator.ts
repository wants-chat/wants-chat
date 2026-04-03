/**
 * Nursery/Garden Center Component Generators for React Native
 *
 * Generates nursery-specific components:
 * - NurseryStats: Dashboard stats for nursery operations
 * - PlantListFeatured: Featured plants list
 * - OrderListRecentNursery: Recent orders list for nursery
 */

export interface NurseryOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate nursery stats dashboard component
 */
export function generateNurseryStats(options: NurseryOptions = {}): string {
  const { componentName = 'NurseryStats', endpoint = '/nursery/stats' } = options;

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

const STATS_CONFIG = [
  { key: 'todaySales', label: "Today's Sales", icon: 'cash', color: '#16A34A', type: 'currency' },
  { key: 'todayOrders', label: "Today's Orders", icon: 'receipt', color: '#3B82F6', type: 'number' },
  { key: 'plantsInStock', label: 'Plants in Stock', icon: 'leaf', color: '#22C55E', type: 'number' },
  { key: 'lowStockItems', label: 'Low Stock Items', icon: 'alert-circle', color: '#F59E0B', type: 'number' },
  { key: 'plantsNeedingWater', label: 'Need Watering', icon: 'water', color: '#06B6D4', type: 'number' },
  { key: 'greenhouseTemp', label: 'Greenhouse Temp', icon: 'thermometer', color: '#EF4444', type: 'temp' },
];

function ${componentName}() {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['nursery-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch nursery stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    if (type === 'temp') return value + '\u00B0F';
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Nursery Dashboard</Text>
        <View style={styles.dateRow}>
          <Ionicons name="leaf" size={16} color="#16A34A" />
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
              {change !== undefined && stat.type !== 'temp' && (
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
 * Generate featured plants list component
 */
export function generatePlantListFeatured(options: NurseryOptions = {}): string {
  const { componentName = 'PlantListFeatured', endpoint = '/nursery/plants/featured' } = options;

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
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface Plant {
  id: string;
  name: string;
  botanical_name?: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  light_requirement?: string;
  sunlight?: string;
  water_requirement?: string;
  watering?: string;
  hardiness_zone?: string;
  is_new?: boolean;
  on_sale?: boolean;
  rating?: number;
  stock?: number;
  sizes?: string[];
}

interface ${componentName}Props {
  limit?: number;
  onAddToCart?: (plant: Plant) => void;
}

function ${componentName}({ limit = 8, onAddToCart }: ${componentName}Props) {
  const navigation = useNavigation();

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ['nursery-featured-plants', limit],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=\${limit}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch featured plants:', err);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const getLightLabel = (light?: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      full_sun: { text: 'Full Sun', color: '#F59E0B' },
      partial_sun: { text: 'Partial Sun', color: '#FB923C' },
      partial_shade: { text: 'Partial Shade', color: '#3B82F6' },
      full_shade: { text: 'Full Shade', color: '#6B7280' },
    };
    return labels[light?.toLowerCase() || ''] || { text: light || 'Various', color: '#6B7280' };
  };

  const getWaterLabel = (water?: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      low: { text: 'Low Water', color: '#D97706' },
      moderate: { text: 'Moderate', color: '#3B82F6' },
      high: { text: 'High Water', color: '#06B6D4' },
    };
    return labels[water?.toLowerCase() || ''] || { text: water || 'Moderate', color: '#3B82F6' };
  };

  const renderItem = ({ item }: { item: Plant }) => {
    const light = getLightLabel(item.light_requirement || item.sunlight);
    const water = getWaterLabel(item.water_requirement || item.watering);

    return (
      <TouchableOpacity
        style={styles.plantCard}
        onPress={() => navigation.navigate('PlantDetail' as never, { id: item.id } as never)}
      >
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.plantImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="leaf" size={32} color="#86EFAC" />
            </View>
          )}
          <View style={styles.badges}>
            {item.is_new && (
              <View style={styles.newBadge}>
                <Text style={styles.badgeText}>New</Text>
              </View>
            )}
            {item.on_sale && (
              <View style={styles.saleBadge}>
                <Text style={styles.badgeText}>Sale</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.plantInfo}>
          <Text style={styles.plantName} numberOfLines={1}>{item.name}</Text>
          {item.botanical_name && (
            <Text style={styles.botanicalName} numberOfLines={1}>{item.botanical_name}</Text>
          )}
          <View style={styles.requirementsRow}>
            <View style={styles.requirement}>
              <Ionicons name="sunny" size={12} color={light.color} />
              <Text style={[styles.requirementText, { color: light.color }]} numberOfLines={1}>
                {light.text}
              </Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="water" size={12} color={water.color} />
              <Text style={[styles.requirementText, { color: water.color }]} numberOfLines={1}>
                {water.text}
              </Text>
            </View>
          </View>
          {item.hardiness_zone && (
            <View style={styles.zoneBadge}>
              <Ionicons name="thermometer-outline" size={10} color="#6B7280" />
              <Text style={styles.zoneText}>Zone {item.hardiness_zone}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            {item.sale_price && item.sale_price < item.price ? (
              <>
                <Text style={styles.salePrice}>\${item.sale_price.toFixed(2)}</Text>
                <Text style={styles.originalPrice}>\${item.price.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.price}>\${(item.price || 0).toFixed(2)}</Text>
            )}
            {item.stock !== undefined && item.stock <= 5 && item.stock > 0 && (
              <Text style={styles.lowStock}>Only {item.stock} left</Text>
            )}
            {item.stock === 0 && (
              <Text style={styles.outOfStock}>Out of stock</Text>
            )}
          </View>
          {item.sizes && item.sizes.length > 0 && (
            <View style={styles.sizesRow}>
              {item.sizes.slice(0, 3).map((size) => (
                <View key={size} style={styles.sizeChip}>
                  <Text style={styles.sizeText}>{size}</Text>
                </View>
              ))}
            </View>
          )}
          {onAddToCart && item.stock !== 0 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddToCart(item)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (plants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="leaf-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No featured plants available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Plants</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Plants' as never)}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={plants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    color: '#16A34A',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  plantCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
  },
  badges: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  newBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saleBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  plantInfo: {
    padding: 10,
  },
  plantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  botanicalName: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  requirementsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  requirementText: {
    fontSize: 10,
  },
  zoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  zoneText: {
    fontSize: 10,
    color: '#6B7280',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  lowStock: {
    fontSize: 10,
    color: '#F97316',
    marginLeft: 'auto',
  },
  outOfStock: {
    fontSize: 10,
    color: '#EF4444',
    marginLeft: 'auto',
  },
  sizesRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  sizeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sizeText: {
    fontSize: 10,
    color: '#374151',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
 * Generate recent nursery orders list component
 */
export function generateOrderListRecentNursery(options: NurseryOptions = {}): string {
  const { componentName = 'OrderListRecentNursery', endpoint = '/nursery/orders' } = options;

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
  fulfillment_type?: 'delivery' | 'pickup';
  plants_summary?: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  pending: { color: '#FEF3C7', icon: 'time', label: 'Pending' },
  processing: { color: '#DBEAFE', icon: 'cube', label: 'Processing' },
  ready: { color: '#E9D5FF', icon: 'leaf', label: 'Ready' },
  shipped: { color: '#FED7AA', icon: 'car', label: 'Shipped' },
  delivered: { color: '#DCFCE7', icon: 'checkmark-circle', label: 'Delivered' },
  picked_up: { color: '#DCFCE7', icon: 'checkmark-circle', label: 'Picked Up' },
  cancelled: { color: '#FEE2E2', icon: 'close-circle', label: 'Cancelled' },
};

interface ${componentName}Props {
  limit?: number;
}

function ${componentName}({ limit = 10 }: ${componentName}Props) {
  const navigation = useNavigation();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['nursery-orders-recent', limit],
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
        <ActivityIndicator size="large" color="#16A34A" />
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
            <Ionicons name="leaf" size={20} color="#16A34A" />
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
              {order.customer_name || 'Guest'} - {order.items_count || order.items?.length || 0} plants
            </Text>
            <View style={styles.orderMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color="#6B7280" />
                <Text style={styles.metaText}>
                  {new Date(order.created_at).toLocaleDateString()}
                </Text>
              </View>
              {order.fulfillment_type && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name={order.fulfillment_type === 'delivery' ? 'car-outline' : 'location-outline'}
                    size={12}
                    color="#6B7280"
                  />
                  <Text style={styles.metaText}>
                    {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'}
                  </Text>
                </View>
              )}
            </View>
            {order.plants_summary && (
              <Text style={styles.plantsSummary} numberOfLines={1}>
                {order.plants_summary}
              </Text>
            )}
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
        <Ionicons name="leaf-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No recent orders</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="leaf" size={20} color="#16A34A" />
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
    color: '#16A34A',
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
    backgroundColor: '#DCFCE7',
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
  plantsSummary: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
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
