/**
 * Picking Component Generators (React Native)
 *
 * Generates warehouse picking and fulfillment components for React Native.
 * Features: FlatList with pick items, barcode scanning, pick queue management.
 */

export interface PickingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePickList(options: PickingOptions = {}): string {
  const { componentName = 'PickList', endpoint = '/picking' } = options;

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
  Alert,
  Image,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface PickItem {
  id: string;
  sku: string;
  name: string;
  quantity_required: number;
  quantity_picked: number;
  location: {
    zone: string;
    aisle: string;
    rack: string;
    shelf: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'issue';
  barcode?: string;
  image_url?: string;
  notes?: string;
}

interface PickOrder {
  id: string;
  order_number: string;
  customer_name: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'partial';
  items: PickItem[];
  assigned_to?: string;
  started_at?: string;
  due_by?: string;
  wave?: string;
}

interface ${componentName}Props {
  orderId?: string;
  showScanner?: boolean;
  onComplete?: (orderId: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  orderId,
  showScanner = true,
  onComplete,
}) => {
  const queryClient = useQueryClient();
  const [scanInput, setScanInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: pickOrder, isLoading, refetch } = useQuery({
    queryKey: ['pick-list', orderId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${orderId}\`);
      return response?.data || response;
    },
    enabled: !!orderId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const updateItemStatus = useMutation({
    mutationFn: ({ itemId, status, quantity }: { itemId: string; status: string; quantity?: number }) =>
      api.put(\`${endpoint}/\${orderId}/items/\${itemId}\`, { status, quantity_picked: quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pick-list', orderId] });
    },
  });

  const completePicking = useMutation({
    mutationFn: () => api.post(\`${endpoint}/\${orderId}/complete\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pick-list', orderId] });
      Alert.alert('Success', 'Picking completed');
      onComplete?.(orderId!);
    },
  });

  const handleScan = (barcode: string) => {
    if (!pickOrder) return;

    const item = pickOrder.items.find(
      (i: PickItem) => i.barcode === barcode || i.sku === barcode
    );
    if (item) {
      if (item.status === 'completed') {
        Alert.alert('Info', 'Item already picked');
      } else {
        updateItemStatus.mutate({
          itemId: item.id,
          status: 'completed',
          quantity: item.quantity_required,
        });
        Alert.alert('Success', \`Picked: \${item.name}\`);
      }
    } else {
      Alert.alert('Error', 'Item not found in pick list');
    }
    setScanInput('');
  };

  const reportIssue = (itemId: string) => {
    Alert.alert(
      'Report Issue',
      'Are you sure you want to report an issue with this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => updateItemStatus.mutate({ itemId, status: 'issue' }),
        },
      ]
    );
  };

  const priorityColors: Record<string, string> = {
    urgent: '#EF4444',
    high: '#F59E0B',
    normal: '#3B82F6',
    low: '#9CA3AF',
  };

  const itemStatusColors: Record<string, string> = {
    pending: '#9CA3AF',
    in_progress: '#3B82F6',
    completed: '#10B981',
    issue: '#EF4444',
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!pickOrder) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No pick order found</Text>
      </View>
    );
  }

  const completedItems = pickOrder.items.filter((i: PickItem) => i.status === 'completed').length;
  const totalItems = pickOrder.items.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isComplete = completedItems === totalItems;

  // Sort items by location for efficient picking
  const sortedItems = [...pickOrder.items].sort((a, b) => {
    const locA = \`\${a.location.zone}-\${a.location.aisle}-\${a.location.rack}-\${a.location.shelf}\`;
    const locB = \`\${b.location.zone}-\${b.location.aisle}-\${b.location.rack}-\${b.location.shelf}\`;
    return locA.localeCompare(locB);
  });

  const renderItem = ({ item, index }: { item: PickItem; index: number }) => {
    const nextPendingIndex = sortedItems.findIndex((i) => i.status === 'pending');
    const isNext = index === nextPendingIndex;

    return (
      <View style={[
        styles.itemCard,
        item.status === 'completed' && styles.itemCardCompleted,
        item.status === 'issue' && styles.itemCardIssue,
        isNext && styles.itemCardNext,
      ]}>
        <View style={styles.itemRow}>
          {/* Status Icon */}
          <View style={styles.statusIcon}>
            {item.status === 'completed' ? (
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            ) : item.status === 'issue' ? (
              <Ionicons name="warning" size={24} color="#EF4444" />
            ) : (
              <View style={[
                styles.pendingCircle,
                isNext && styles.pendingCircleActive,
              ]}>
                <Text style={[
                  styles.pendingNumber,
                  isNext && styles.pendingNumberActive,
                ]}>
                  {index + 1}
                </Text>
              </View>
            )}
          </View>

          {/* Item Details */}
          <View style={styles.itemDetails}>
            <View style={styles.itemHeader}>
              <View style={styles.itemHeaderLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSku}>{item.sku}</Text>
              </View>
              <Text style={styles.itemQuantity}>x{item.quantity_required}</Text>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.locationText}>
                Zone {item.location.zone} {'>'} Aisle {item.location.aisle} {'>'} Rack {item.location.rack} {'>'} Shelf {item.location.shelf}
              </Text>
            </View>

            {item.notes && (
              <Text style={styles.itemNotes}>{item.notes}</Text>
            )}

            {/* Actions */}
            {item.status !== 'completed' && (
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.pickButton}
                  onPress={() => updateItemStatus.mutate({
                    itemId: item.id,
                    status: 'completed',
                    quantity: item.quantity_required,
                  })}
                  disabled={updateItemStatus.isPending}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.pickButtonText}>Mark Picked</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.issueButton}
                  onPress={() => reportIssue(item.id)}
                  disabled={updateItemStatus.isPending}
                >
                  <Ionicons name="warning-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}

            {item.status === 'issue' && (
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.resolveButton}
                  onPress={() => updateItemStatus.mutate({
                    itemId: item.id,
                    status: 'completed',
                    quantity: item.quantity_required,
                  })}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.resolveButtonText}>Resolved</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => updateItemStatus.mutate({ itemId: item.id, status: 'pending' })}
                >
                  <Ionicons name="refresh" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Item Image */}
          {item.image_url && (
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.orderRow}>
              <Text style={styles.orderNumber}>Pick List #{pickOrder.order_number}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColors[pickOrder.priority] + '20' }]}>
                <Text style={[styles.priorityText, { color: priorityColors[pickOrder.priority] }]}>
                  {pickOrder.priority}
                </Text>
              </View>
            </View>
            <Text style={styles.customerName}>{pickOrder.customer_name}</Text>
            {pickOrder.wave && (
              <Text style={styles.wave}>Wave: {pickOrder.wave}</Text>
            )}
          </View>
          {pickOrder.due_by && (
            <View style={styles.dueBadge}>
              <Text style={styles.dueLabel}>Due By</Text>
              <Text style={[
                styles.dueTime,
                new Date(pickOrder.due_by) < new Date() && styles.dueTimeOverdue,
              ]}>
                {new Date(pickOrder.due_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressCount}>{completedItems} / {totalItems} items</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: \`\${progress}%\` },
              isComplete && styles.progressFillComplete,
            ]} />
          </View>
        </View>

        {/* Scanner Input */}
        {showScanner && (
          <View style={styles.scannerContainer}>
            <Ionicons name="barcode-outline" size={20} color="#9CA3AF" style={styles.scannerIcon} />
            <TextInput
              style={styles.scannerInput}
              placeholder="Scan barcode or enter SKU..."
              placeholderTextColor="#9CA3AF"
              value={scanInput}
              onChangeText={setScanInput}
              onSubmitEditing={() => handleScan(scanInput)}
              autoCapitalize="none"
            />
          </View>
        )}
      </View>

      {/* Items List */}
      <FlatList
        data={sortedItems}
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

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeButton, !isComplete && styles.completeButtonDisabled]}
          onPress={() => completePicking.mutate()}
          disabled={!isComplete || completePicking.isPending}
        >
          {completePicking.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.completeButtonText}>
            {isComplete ? 'Complete Picking' : \`\${totalItems - completedItems} items remaining\`}
          </Text>
        </TouchableOpacity>
      </View>
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
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
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
  customerName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  wave: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dueBadge: {
    alignItems: 'flex-end',
  },
  dueLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  dueTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dueTimeOverdue: {
    color: '#EF4444',
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },
  progressFillComplete: {
    backgroundColor: '#10B981',
  },
  scannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  scannerIcon: {
    marginRight: 8,
  },
  scannerInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  itemCardCompleted: {
    backgroundColor: '#F0FDF4',
  },
  itemCardIssue: {
    backgroundColor: '#FEF2F2',
  },
  itemCardNext: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIcon: {
    marginRight: 12,
  },
  pendingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCircleActive: {
    backgroundColor: '#3B82F6',
  },
  pendingNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  pendingNumberActive: {
    color: '#FFFFFF',
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemHeaderLeft: {
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
  itemQuantity: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  itemNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  itemActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  issueButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resolveButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  resetButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginLeft: 12,
  },
  separator: {
    height: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  completeButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default ${componentName};
`;
}

export function generatePickQueue(options: PickingOptions = {}): string {
  const { componentName = 'PickQueue', endpoint = '/picking' } = options;

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
  Image,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface QueueItem {
  id: string;
  order_number: string;
  customer_name: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  items_count: number;
  items_picked: number;
  assigned_to?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  due_by?: string;
  wave?: string;
  zone?: string;
  estimated_time?: number;
}

interface ${componentName}Props {
  warehouseId?: string;
  zone?: string;
  onSelectOrder?: (orderId: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  zone,
  onSelectOrder,
}) => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [refreshing, setRefreshing] = useState(false);

  const { data: queue, isLoading, refetch } = useQuery({
    queryKey: ['pick-queue', warehouseId, zone, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (zone) params.append('zone', zone);
      if (statusFilter) params.append('status', statusFilter);
      const response = await api.get<any>(\`${endpoint}/queue?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 15000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const startPicking = useMutation({
    mutationFn: (orderId: string) => api.post(\`${endpoint}/\${orderId}/start\`, {}),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['pick-queue'] });
      Alert.alert('Success', 'Picking started');
      onSelectOrder?.(orderId);
    },
  });

  const assignToSelf = useMutation({
    mutationFn: (orderId: string) => api.post(\`${endpoint}/\${orderId}/assign\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pick-queue'] });
      Alert.alert('Success', 'Order assigned to you');
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
    in_progress: '#3B82F6',
    completed: '#10B981',
  };

  const isOverdue = (dueBy?: string) => {
    if (!dueBy) return false;
    return new Date(dueBy) < new Date();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const urgentCount = queue?.filter((q: QueueItem) => q.priority === 'urgent' && q.status === 'pending').length || 0;
  const overdueCount = queue?.filter((q: QueueItem) => isOverdue(q.due_by) && q.status !== 'completed').length || 0;

  const renderItem = ({ item }: { item: QueueItem }) => {
    const overdue = isOverdue(item.due_by);
    const progress = item.items_count > 0 ? (item.items_picked / item.items_count) * 100 : 0;

    return (
      <TouchableOpacity
        style={[styles.itemCard, overdue && item.status !== 'completed' && styles.itemCardOverdue]}
        onPress={() => item.status === 'in_progress' ? onSelectOrder?.(item.id) : null}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemHeaderLeft}>
            <Text style={styles.orderNumber}>#{item.order_number}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColors[item.priority] }]}>
                {item.priority}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
              <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
            {overdue && item.status !== 'completed' && (
              <View style={styles.overdueBadge}>
                <Ionicons name="warning" size={10} color="#EF4444" />
                <Text style={styles.overdueText}>Overdue</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.customerName}>{item.customer_name}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{item.items_count} items</Text>
          </View>
          {item.wave && (
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{item.wave}</Text>
            </View>
          )}
          {item.zone && (
            <Text style={styles.metaText}>Zone: {item.zone}</Text>
          )}
          {item.estimated_time && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text style={styles.metaText}>~{item.estimated_time} min</Text>
            </View>
          )}
        </View>

        {item.due_by && (
          <Text style={[styles.dueText, overdue && styles.dueTextOverdue]}>
            Due: {new Date(item.due_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}

        {item.status === 'in_progress' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressCount}>{item.items_picked} / {item.items_count}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
            </View>
          </View>
        )}

        {/* Assigned User */}
        {item.assigned_to && (
          <View style={styles.assignedRow}>
            {item.assigned_to.avatar_url ? (
              <Image source={{ uri: item.assigned_to.avatar_url }} style={styles.assignedAvatar} />
            ) : (
              <View style={styles.assignedAvatarPlaceholder}>
                <Ionicons name="person" size={10} color="#9CA3AF" />
              </View>
            )}
            <Text style={styles.assignedName}>{item.assigned_to.name}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {item.status === 'pending' && !item.assigned_to && (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => assignToSelf.mutate(item.id)}
              disabled={assignToSelf.isPending}
            >
              <Ionicons name="person" size={14} color="#6B7280" />
              <Text style={styles.claimButtonText}>Claim</Text>
            </TouchableOpacity>
          )}

          {(item.status === 'pending' || item.status === 'in_progress') && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => item.status === 'in_progress' ? onSelectOrder?.(item.id) : startPicking.mutate(item.id)}
              disabled={startPicking.isPending}
            >
              <Ionicons name={item.status === 'in_progress' ? 'chevron-forward' : 'play'} size={14} color="#FFFFFF" />
              <Text style={styles.startButtonText}>
                {item.status === 'in_progress' ? 'Continue' : 'Start'}
              </Text>
            </TouchableOpacity>
          )}

          {item.status === 'completed' && (
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => onSelectOrder?.(item.id)}
            >
              <Ionicons name="chevron-forward" size={14} color="#6B7280" />
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Ionicons name="layers" size={20} color="#3B82F6" />
            <Text style={styles.headerTitle}>Pick Queue</Text>
            <Text style={styles.headerCount}>({queue?.length || 0} orders)</Text>
          </View>

          <View style={styles.alertsRow}>
            {urgentCount > 0 && (
              <View style={styles.alertBadge}>
                <Ionicons name="warning" size={10} color="#EF4444" />
                <Text style={styles.alertText}>{urgentCount} urgent</Text>
              </View>
            )}
            {overdueCount > 0 && (
              <View style={[styles.alertBadge, styles.alertBadgeOrange]}>
                <Ionicons name="time" size={10} color="#F59E0B" />
                <Text style={[styles.alertText, styles.alertTextOrange]}>{overdueCount} overdue</Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Filters */}
        <View style={styles.filters}>
          {['pending', 'in_progress', 'completed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>
                {status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Queue List */}
      {queue && queue.length > 0 ? (
        <FlatList
          data={queue}
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
          <Text style={styles.emptyText}>No orders in queue</Text>
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
  headerCount: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  alertsRow: {
    flexDirection: 'row',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  alertBadgeOrange: {
    backgroundColor: '#FEF3C7',
  },
  alertText: {
    fontSize: 11,
    color: '#EF4444',
    marginLeft: 4,
  },
  alertTextOrange: {
    color: '#F59E0B',
  },
  filters: {
    flexDirection: 'row',
    marginTop: 12,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  filterTextActive: {
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
  itemCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemHeaderLeft: {
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
  statusBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
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
  customerName: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
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
  dueText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  dueTextOverdue: {
    color: '#EF4444',
  },
  progressSection: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
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
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  assignedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  assignedAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignedName: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  claimButtonText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewButtonText: {
    fontSize: 13,
    color: '#6B7280',
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
