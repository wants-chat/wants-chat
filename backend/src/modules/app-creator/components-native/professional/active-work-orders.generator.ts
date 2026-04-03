/**
 * Active Work Orders Component Generator (React Native)
 *
 * Generates a work order tracking component with status badges and priority indicators.
 * Features: FlatList with work orders, priority borders, status badges, technician assignment.
 */

export interface ActiveWorkOrdersOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateActiveWorkOrders(options: ActiveWorkOrdersOptions = {}): string {
  const {
    componentName = 'ActiveWorkOrders',
    endpoint = '/work-orders',
    title = 'Active Work Orders',
  } = options;

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
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface WorkOrder {
  id: string;
  orderNumber: string;
  description: string;
  customer: string;
  technician: string;
  status: 'assigned' | 'in-progress' | 'on-hold' | 'completed';
  priority: 'urgent' | 'high' | 'normal';
  scheduledDate: string;
  type: string;
}

interface ${componentName}Props {
  data?: WorkOrder[];
  onWorkOrderPress?: (workOrder: WorkOrder) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ data: propData, onWorkOrderPress }) => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
  });

  const workOrders = propData && propData.length > 0 ? propData : (fetchedData || []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusConfig = (status: string): { bg: string; text: string } => {
    switch (status) {
      case 'assigned':
        return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'in-progress':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'on-hold':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'completed':
        return { bg: '#DCFCE7', text: '#16A34A' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getPriorityBorderColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'normal':
        return '#D1D5DB';
      default:
        return '#D1D5DB';
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace(/-/g, ' ').replace(/\\b\\w/g, (l) => l.toUpperCase());
  };

  const handleWorkOrderPress = (workOrder: WorkOrder) => {
    if (onWorkOrderPress) {
      onWorkOrderPress(workOrder);
    } else {
      navigation.navigate('WorkOrderDetail', { id: workOrder.id });
    }
  };

  const renderItem = useCallback(({ item }: { item: WorkOrder }) => {
    const statusConfig = getStatusConfig(item.status);
    const borderColor = getPriorityBorderColor(item.priority);

    return (
      <TouchableOpacity
        style={[styles.workOrderCard, { borderLeftColor: borderColor }]}
        onPress={() => handleWorkOrderPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusText, { color: statusConfig.text }]}>
                {formatStatus(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.customer}>{item.customer}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.footerRow}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.footerText}>{item.technician}</Text>
            </View>
            <View style={styles.footerRow}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.footerText}>
                {new Date(item.scheduledDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: WorkOrder) => item.id, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>${title}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('WorkOrderCreate')}
      >
        <Ionicons name="add-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !propData) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={workOrders}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No active work orders</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  workOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  customer: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  footerLeft: {
    gap: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  typeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    color: '#374151',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
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
