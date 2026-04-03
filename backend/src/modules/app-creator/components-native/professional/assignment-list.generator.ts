/**
 * Assignment List Component Generator (React Native)
 *
 * Generates an assignment tracking component with filtering.
 * Features: FlatList with assignments, status filter, priority badges, due dates.
 */

export interface AssignmentListOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateAssignmentList(options: AssignmentListOptions = {}): string {
  const {
    componentName = 'AssignmentList',
    endpoint = '/assignments',
    title = 'Assignments',
  } = options;

  return `import React, { useState, useCallback, useMemo } from 'react';
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

interface Assignment {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
}

type FilterStatus = 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue';

interface ${componentName}Props {
  data?: Assignment[];
  onAssignmentPress?: (assignment: Assignment) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ data: propData, onAssignmentPress }) => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
  });

  const assignments = propData && propData.length > 0 ? propData : (fetchedData || []);

  const filteredAssignments = useMemo(() => {
    if (filter === 'all') return assignments;
    return assignments.filter((a: Assignment) => a.status === filter);
  }, [assignments, filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusConfig = (status: string): { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap } => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'time-outline' };
      case 'in-progress':
        return { bg: '#DBEAFE', text: '#1D4ED8', icon: 'play-circle-outline' };
      case 'completed':
        return { bg: '#DCFCE7', text: '#16A34A', icon: 'checkmark-circle-outline' };
      case 'overdue':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'alert-circle-outline' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'ellipse-outline' };
    }
  };

  const getPriorityConfig = (priority: string): { color: string } => {
    switch (priority) {
      case 'high':
        return { color: '#EF4444' };
      case 'medium':
        return { color: '#F59E0B' };
      case 'low':
        return { color: '#10B981' };
      default:
        return { color: '#6B7280' };
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace(/-/g, ' ').replace(/\\b\\w/g, (l) => l.toUpperCase());
  };

  const handleAssignmentPress = (assignment: Assignment) => {
    if (onAssignmentPress) {
      onAssignmentPress(assignment);
    } else {
      navigation.navigate('AssignmentDetail', { id: assignment.id });
    }
  };

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      {filterOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.filterButton,
            filter === option.value && styles.filterButtonActive,
          ]}
          onPress={() => setFilter(option.value)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === option.value && styles.filterButtonTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = useCallback(({ item }: { item: Assignment }) => {
    const statusConfig = getStatusConfig(item.status);
    const priorityConfig = getPriorityConfig(item.priority);
    const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'completed';

    return (
      <TouchableOpacity
        style={styles.assignmentCard}
        onPress={() => handleAssignmentPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.priorityIndicator}>
            <View style={[styles.priorityDot, { backgroundColor: priorityConfig.color }]} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon} size={12} color={statusConfig.text} />
              <Text style={[styles.statusText, { color: statusConfig.text }]}>
                {formatStatus(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text style={styles.footerText}>{item.assignedTo}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isOverdue ? '#EF4444' : '#6B7280'}
            />
            <Text style={[styles.footerText, isOverdue && styles.overdueText]}>
              {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: Assignment) => item.id, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>${title}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AssignmentCreate')}
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
      {renderFilterBar()}
      <FlatList
        data={filteredAssignments}
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
            <Ionicons name="clipboard-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No assignments found</Text>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  assignmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priorityIndicator: {
    marginRight: 12,
    paddingTop: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  overdueText: {
    color: '#EF4444',
    fontWeight: '500',
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
