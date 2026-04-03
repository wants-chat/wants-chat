/**
 * Warehouse Component Generators (React Native)
 *
 * Generates warehouse management and inventory components for React Native.
 * Features: Stats cards, order lists, stock levels, receiving forms.
 */

export interface WarehouseOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateWarehouseStats(options: WarehouseOptions = {}): string {
  const { componentName = 'WarehouseStats', endpoint = '/warehouse' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Stats {
  total_inventory: number;
  inventory_change: number;
  pending_orders: number;
  orders_change: number;
  low_stock_items: number;
  receiving_today: number;
  shipping_today: number;
  utilization_percent: number;
}

interface ${componentName}Props {
  warehouseId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ warehouseId }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['warehouse-stats', warehouseId],
    queryFn: async () => {
      const url = warehouseId
        ? \`${endpoint}/\${warehouseId}/stats\`
        : '${endpoint}/stats';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statCards = [
    {
      label: 'Total Inventory',
      value: stats?.total_inventory?.toLocaleString() || '0',
      change: stats?.inventory_change,
      icon: 'cube',
      color: '#3B82F6',
    },
    {
      label: 'Pending Orders',
      value: stats?.pending_orders?.toLocaleString() || '0',
      change: stats?.orders_change,
      icon: 'time',
      color: '#F59E0B',
    },
    {
      label: 'Low Stock Items',
      value: stats?.low_stock_items?.toLocaleString() || '0',
      icon: 'warning',
      color: '#EF4444',
      alert: (stats?.low_stock_items || 0) > 0,
    },
    {
      label: 'Receiving Today',
      value: stats?.receiving_today?.toLocaleString() || '0',
      icon: 'arrow-down-circle',
      color: '#10B981',
    },
    {
      label: 'Shipping Today',
      value: stats?.shipping_today?.toLocaleString() || '0',
      icon: 'checkmark-circle',
      color: '#8B5CF6',
    },
    {
      label: 'Utilization',
      value: \`\${stats?.utilization_percent || 0}%\`,
      icon: 'analytics',
      color: '#06B6D4',
      progress: stats?.utilization_percent || 0,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
        />
      }
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {statCards.map((stat, index) => (
        <View
          key={stat.label}
          style={[
            styles.statCard,
            stat.alert && styles.statCardAlert,
            index === statCards.length - 1 && styles.statCardLast,
          ]}
        >
          <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            {stat.change !== undefined && (
              <View style={styles.changeContainer}>
                <Ionicons
                  name={stat.change >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={stat.change >= 0 ? '#10B981' : '#EF4444'}
                />
                <Text style={[
                  styles.changeText,
                  { color: stat.change >= 0 ? '#10B981' : '#EF4444' },
                ]}>
                  {Math.abs(stat.change)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
          {stat.progress !== undefined && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: \`\${stat.progress}%\`,
                    backgroundColor: stat.progress > 90 ? '#EF4444' : stat.progress > 70 ? '#F59E0B' : '#10B981',
                  },
                ]}
              />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardAlert: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  statCardLast: {
    marginRight: 0,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ${componentName};
`;
}

export function generateOrderListWarehouse(options: WarehouseOptions = {}): string {
  const { componentName = 'OrderListWarehouse', endpoint = '/warehouse/orders' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'picking' | 'packing' | 'ready' | 'shipped';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  customer_name: string;
  shipping_address: string;
  items_count: number;
  created_at: string;
  due_date?: string;
}

interface ${componentName}Props {
  warehouseId?: string;
  status?: string;
  onSelectOrder?: (order: Order) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  status,
  onSelectOrder,
}) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['warehouse-orders', warehouseId, status],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (status) params.append('status', status);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 30000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const updateStatus = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }) =>
      api.put(\`${endpoint}/\${orderId}/status\`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-orders'] });
      Alert.alert('Success', 'Order status updated');
    },
  });

  const priorityColors: Record<string, string> = {
    urgent: '#EF4444',
    high: '#F59E0B',
    normal: '#3B82F6',
    low: '#9CA3AF',
  };

  const statusColors: Record<string, string> = {
    pending: '#F59E0B',
    picking: '#3B82F6',
    packing: '#8B5CF6',
    ready: '#10B981',
    shipped: '#6B7280',
  };

  const statusFlow = ['pending', 'picking', 'packing', 'ready', 'shipped'];

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderOrder = ({ item }: { item: Order }) => {
    const currentIndex = statusFlow.indexOf(item.status);
    const nextStatus = statusFlow[currentIndex + 1];
    const overdue = isOverdue(item.due_date);

    return (
      <TouchableOpacity
        style={[styles.orderCard, overdue && styles.orderCardOverdue]}
        onPress={() => onSelectOrder?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>#{item.order_number}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColors[item.priority] }]}>
                {item.priority}
              </Text>
            </View>
            {overdue && (
              <View style={styles.overdueBadge}>
                <Ionicons name="alert-circle" size={10} color="#EF4444" />
                <Text style={styles.overdueText}>Overdue</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.customerRow}>
          <View style={styles.customerItem}>
            <Ionicons name="person-outline" size={12} color="#6B7280" />
            <Text style={styles.customerText}>{item.customer_name}</Text>
          </View>
          <View style={styles.customerItem}>
            <Ionicons name="cube-outline" size={12} color="#6B7280" />
            <Text style={styles.customerText}>{item.items_count} items</Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={12} color="#6B7280" />
          <Text style={styles.addressText} numberOfLines={1}>{item.shipping_address}</Text>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.footerMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="#9CA3AF" />
              <Text style={styles.metaText}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            {item.due_date && (
              <Text style={[styles.metaText, overdue && styles.metaTextOverdue]}>
                Due: {new Date(item.due_date).toLocaleDateString()}
              </Text>
            )}
          </View>

          {nextStatus && (
            <TouchableOpacity
              style={styles.advanceButton}
              onPress={() => updateStatus.mutate({ orderId: item.id, newStatus: nextStatus })}
              disabled={updateStatus.isPending}
            >
              <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
              <Text style={styles.advanceButtonText}>{nextStatus}</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cube" size={20} color="#3B82F6" />
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerCount}>({orders?.length || 0})</Text>
        </View>
      </View>

      {orders && orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  headerCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  orderCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  priorityBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  overdueText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  customerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  customerText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  metaTextOverdue: {
    color: '#EF4444',
  },
  advanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  advanceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateStockLevels(options: WarehouseOptions = {}): string {
  const { componentName = 'StockLevels', endpoint = '/warehouse/inventory' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  location: string;
  zone: string;
  last_updated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

interface ${componentName}Props {
  warehouseId?: string;
  showFilters?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  showFilters = true,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: inventory, isLoading, refetch } = useQuery({
    queryKey: ['stock-levels', warehouseId, statusFilter],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (statusFilter) params.append('status', statusFilter);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const statusColors: Record<string, string> = {
    in_stock: '#10B981',
    low_stock: '#F59E0B',
    out_of_stock: '#EF4444',
    overstock: '#3B82F6',
  };

  const filteredInventory = inventory?.filter((item: InventoryItem) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) &&
        !item.sku.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  }) || [];

  const getStockPercentage = (item: InventoryItem) => {
    return Math.min(100, Math.round((item.quantity / item.max_quantity) * 100));
  };

  const getProgressColor = (item: InventoryItem) => {
    const pct = getStockPercentage(item);
    if (item.quantity <= item.min_quantity) return '#EF4444';
    if (pct > 90) return '#3B82F6';
    if (pct < 30) return '#F59E0B';
    return '#10B981';
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const lowStockCount = inventory?.filter(
    (i: InventoryItem) => i.status === 'low_stock' || i.status === 'out_of_stock'
  ).length || 0;

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const percentage = getStockPercentage(item);
    const progressColor = getProgressColor(item);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSku}>{item.sku}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <Text style={styles.locationText}>
          Zone {item.zone} - {item.location}
        </Text>

        <View style={styles.stockRow}>
          <View style={styles.stockInfo}>
            <View style={styles.stockHeader}>
              <Text style={styles.stockQuantity}>{item.quantity}</Text>
              <Text style={styles.stockMax}>/ {item.max_quantity}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: \`\${percentage}%\`, backgroundColor: progressColor }]} />
            </View>
            {item.quantity <= item.min_quantity && (
              <View style={styles.warningRow}>
                <Ionicons name="trending-down" size={12} color="#EF4444" />
                <Text style={styles.warningText}>Below min ({item.min_quantity})</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Ionicons name="cube" size={20} color="#3B82F6" />
            <Text style={styles.headerTitle}>Stock Levels</Text>
          </View>
          {lowStockCount > 0 && (
            <View style={styles.alertBadge}>
              <Ionicons name="warning" size={12} color="#EF4444" />
              <Text style={styles.alertText}>{lowStockCount} items need attention</Text>
            </View>
          )}
        </View>

        {showFilters && (
          <View style={styles.filters}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by SKU or name..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <View style={styles.statusFilters}>
              {['', 'low_stock', 'out_of_stock', 'in_stock'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>
                    {status ? status.replace('_', ' ') : 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {filteredInventory.length > 0 ? (
        <FlatList
          data={filteredInventory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No inventory items found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 200,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
  },
  filters: {
    marginTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 4,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  itemSku: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockInfo: {
    flex: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  stockQuantity: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  stockMax: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateReceivingForm(options: WarehouseOptions = {}): string {
  const { componentName = 'ReceivingForm', endpoint = '/warehouse/receiving' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ReceivingItem {
  sku: string;
  name: string;
  expected_quantity: number;
  received_quantity: number;
  damaged_quantity: number;
  location?: string;
}

interface ${componentName}Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  purchaseOrder?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onSuccess,
  onCancel,
  purchaseOrder,
}) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    po_number: purchaseOrder?.po_number || '',
    supplier: purchaseOrder?.supplier || '',
    carrier: '',
    tracking_number: '',
    received_date: new Date().toISOString().split('T')[0],
    received_by: '',
    items: purchaseOrder?.items?.map((item: any) => ({
      sku: item.sku,
      name: item.name,
      expected_quantity: item.quantity,
      received_quantity: item.quantity,
      damaged_quantity: 0,
      location: '',
    })) || [] as ReceivingItem[],
    notes: '',
  });

  const submitReceiving = useMutation({
    mutationFn: (data: typeof formData) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-receiving'] });
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] });
      Alert.alert('Success', 'Receiving completed successfully');
      onSuccess?.();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit receiving');
    },
  });

  const updateItem = (index: number, field: keyof ReceivingItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { sku: '', name: '', expected_quantity: 0, received_quantity: 0, damaged_quantity: 0, location: '' },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const totalExpected = formData.items.reduce((sum, item) => sum + (item.expected_quantity || 0), 0);
  const totalReceived = formData.items.reduce((sum, item) => sum + (item.received_quantity || 0), 0);
  const totalDamaged = formData.items.reduce((sum, item) => sum + (item.damaged_quantity || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cube" size={20} color="#3B82F6" />
        <Text style={styles.headerTitle}>Receiving Form</Text>
      </View>

      {/* Header Info */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>PO Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="PO-12345"
              placeholderTextColor="#9CA3AF"
              value={formData.po_number}
              onChangeText={(text) => setFormData({ ...formData, po_number: text })}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Supplier *</Text>
            <TextInput
              style={styles.input}
              placeholder="Supplier name"
              placeholderTextColor="#9CA3AF"
              value={formData.supplier}
              onChangeText={(text) => setFormData({ ...formData, supplier: text })}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Carrier</Text>
            <TextInput
              style={styles.input}
              placeholder="Carrier name"
              placeholderTextColor="#9CA3AF"
              value={formData.carrier}
              onChangeText={(text) => setFormData({ ...formData, carrier: text })}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Tracking Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Tracking number"
              placeholderTextColor="#9CA3AF"
              value={formData.tracking_number}
              onChangeText={(text) => setFormData({ ...formData, tracking_number: text })}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Received By *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#9CA3AF"
            value={formData.received_by}
            onChangeText={(text) => setFormData({ ...formData, received_by: text })}
          />
        </View>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Ionicons name="add" size={16} color="#3B82F6" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {formData.items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={styles.itemField}>
                <Text style={styles.itemLabel}>SKU</Text>
                <TextInput
                  style={styles.itemInput}
                  placeholder="SKU"
                  placeholderTextColor="#9CA3AF"
                  value={item.sku}
                  onChangeText={(text) => updateItem(index, 'sku', text)}
                />
              </View>
              <View style={[styles.itemField, styles.itemFieldWide]}>
                <Text style={styles.itemLabel}>Name</Text>
                <TextInput
                  style={styles.itemInput}
                  placeholder="Product name"
                  placeholderTextColor="#9CA3AF"
                  value={item.name}
                  onChangeText={(text) => updateItem(index, 'name', text)}
                />
              </View>
            </View>
            <View style={styles.itemRow}>
              <View style={styles.itemField}>
                <Text style={styles.itemLabel}>Received</Text>
                <TextInput
                  style={styles.itemInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={String(item.received_quantity || '')}
                  onChangeText={(text) => updateItem(index, 'received_quantity', parseInt(text) || 0)}
                />
              </View>
              <View style={styles.itemField}>
                <Text style={styles.itemLabel}>Damaged</Text>
                <TextInput
                  style={styles.itemInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={String(item.damaged_quantity || '')}
                  onChangeText={(text) => updateItem(index, 'damaged_quantity', parseInt(text) || 0)}
                />
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(index)}>
                <Ionicons name="close" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalExpected}</Text>
            <Text style={styles.summaryLabel}>Expected</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.summaryValueGreen]}>{totalReceived}</Text>
            <Text style={styles.summaryLabel}>Received</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.summaryValueRed]}>{totalDamaged}</Text>
            <Text style={styles.summaryLabel}>Damaged</Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional notes..."
          placeholderTextColor="#9CA3AF"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.submitButton, formData.items.length === 0 && styles.submitButtonDisabled]}
          onPress={() => submitReceiving.mutate(formData)}
          disabled={submitReceiving.isPending || formData.items.length === 0}
        >
          {submitReceiving.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          )}
          <Text style={styles.submitButtonText}>Complete Receiving</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  field: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 13,
    color: '#3B82F6',
    marginLeft: 4,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  itemField: {
    flex: 1,
    marginRight: 8,
  },
  itemFieldWide: {
    flex: 2,
  },
  itemLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemInput: {
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  removeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  summaryValueGreen: {
    color: '#10B981',
  },
  summaryValueRed: {
    color: '#EF4444',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default ${componentName};
`;
}

export function generateReceivingList(options: WarehouseOptions = {}): string {
  const { componentName = 'ReceivingList', endpoint = '/warehouse/receiving' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ReceivingRecord {
  id: string;
  po_number: string;
  supplier: string;
  carrier: string;
  tracking_number?: string;
  received_date: string;
  received_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'issue';
  items_count: number;
  total_received: number;
  total_expected: number;
}

interface ${componentName}Props {
  warehouseId?: string;
  limit?: number;
  onSelectRecord?: (record: ReceivingRecord) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  limit,
  onSelectRecord,
}) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: records, isLoading, refetch } = useQuery({
    queryKey: ['receiving-list', warehouseId, limit],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (limit) params.append('limit', limit.toString());
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const statusColors: Record<string, string> = {
    pending: '#F59E0B',
    in_progress: '#3B82F6',
    completed: '#10B981',
    issue: '#EF4444',
  };

  const statusIcons: Record<string, string> = {
    pending: 'time',
    in_progress: 'cube',
    completed: 'checkmark-circle',
    issue: 'alert-circle',
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderRecord = ({ item }: { item: ReceivingRecord }) => {
    const receivingRate = item.total_expected > 0
      ? Math.round((item.total_received / item.total_expected) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.recordCard}
        onPress={() => onSelectRecord?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.recordHeader}>
          <View style={styles.recordHeaderLeft}>
            <Text style={styles.poNumber}>{item.po_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
              <Ionicons name={statusIcons[item.status] as any} size={10} color={statusColors[item.status]} />
              <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>

        <Text style={styles.supplierName}>{item.supplier}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text style={styles.metaText}>
              {new Date(item.received_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{item.received_by}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{item.items_count} items</Text>
          </View>
        </View>

        {item.status !== 'completed' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Receiving Progress</Text>
              <Text style={styles.progressCount}>{item.total_received} / {item.total_expected}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: \`\${receivingRate}%\` },
                receivingRate === 100 && styles.progressFillComplete,
              ]} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="arrow-down-circle" size={20} color="#10B981" />
          <Text style={styles.headerTitle}>Recent Receiving</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('WarehouseReceiving' as never)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {records && records.length > 0 ? (
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="arrow-down-circle-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No receiving records found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  listContent: {
    padding: 16,
  },
  recordCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  supplierName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  progressSection: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressFillComplete: {
    backgroundColor: '#10B981',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
