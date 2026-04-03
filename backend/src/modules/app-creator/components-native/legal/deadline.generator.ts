/**
 * Deadline List Component Generators (React Native)
 *
 * Generates deadline management components for law firm applications.
 */

export interface DeadlineOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDeadlineListLawfirm(options: DeadlineOptions = {}): string {
  const { componentName = 'DeadlineListLawfirm', endpoint = '/lawfirm/deadlines' } = options;

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
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Deadline {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  case_id: string;
  case_number: string;
  case_title: string;
  deadline_type: 'filing' | 'hearing' | 'response' | 'discovery' | 'statute' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'completed' | 'overdue' | 'extended';
  assigned_to?: string;
  assigned_name?: string;
  reminder_sent?: boolean;
  created_at: string;
  completed_at?: string;
}

interface ${componentName}Props {
  caseId?: string;
  attorneyId?: string;
  showAddButton?: boolean;
  limit?: number;
  onDeadlinePress?: (deadline: Deadline) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  caseId,
  attorneyId,
  showAddButton = true,
  limit,
  onDeadlinePress,
}) => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<string | null>(null);

  const buildQueryUrl = () => {
    let url = '${endpoint}?';
    const params: string[] = [];
    if (caseId) params.push('case_id=' + caseId);
    if (attorneyId) params.push('attorney_id=' + attorneyId);
    if (filterStatus !== 'all') params.push('status=' + filterStatus);
    if (filterType !== 'all') params.push('type=' + filterType);
    if (limit) params.push('limit=' + limit);
    return url + params.join('&');
  };

  const { data: deadlines, isLoading, refetch } = useQuery({
    queryKey: ['lawfirm-deadlines', caseId, attorneyId, filterStatus, filterType, limit],
    queryFn: async () => {
      const response = await api.get<any>(buildQueryUrl());
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (deadlineId: string) => api.put('${endpoint}/' + deadlineId + '/complete', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawfirm-deadlines'] });
      Alert.alert('Success', 'Deadline marked as completed');
    },
    onError: () => Alert.alert('Error', 'Failed to update deadline'),
  });

  const deleteMutation = useMutation({
    mutationFn: (deadlineId: string) => api.delete('${endpoint}/' + deadlineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawfirm-deadlines'] });
      Alert.alert('Success', 'Deadline deleted');
    },
    onError: () => Alert.alert('Error', 'Failed to delete deadline'),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDeadlinePress = (deadline: Deadline) => {
    if (onDeadlinePress) {
      onDeadlinePress(deadline);
    } else {
      navigation.navigate('DeadlineDetail', { id: deadline.id });
    }
  };

  const handleComplete = (deadlineId: string) => {
    Alert.alert(
      'Complete Deadline',
      'Mark this deadline as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => completeMutation.mutate(deadlineId) },
      ]
    );
    setSelectedDeadline(null);
  };

  const handleDelete = (deadlineId: string) => {
    Alert.alert(
      'Delete Deadline',
      'Are you sure you want to delete this deadline?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(deadlineId) },
      ]
    );
    setSelectedDeadline(null);
  };

  const getDeadlineTypeColor = (type: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      filing: { bg: '#DBEAFE', text: '#1D4ED8' },
      hearing: { bg: '#EDE9FE', text: '#7C3AED' },
      response: { bg: '#FFEDD5', text: '#C2410C' },
      discovery: { bg: '#CCFBF1', text: '#0D9488' },
      statute: { bg: '#FEE2E2', text: '#DC2626' },
      custom: { bg: '#F3F4F6', text: '#4B5563' },
    };
    return colors[type] || { bg: '#F3F4F6', text: '#4B5563' };
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: '#9CA3AF',
      medium: '#F59E0B',
      high: '#F97316',
      critical: '#EF4444',
    };
    return colors[priority] || '#9CA3AF';
  };

  const getStatusIcon = (status: string, dueDate: string) => {
    if (status === 'completed') {
      return { name: 'checkmark-circle', color: '#10B981' };
    }

    const daysUntil = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0 || status === 'overdue') {
      return { name: 'alert-circle', color: '#EF4444' };
    } else if (daysUntil <= 3) {
      return { name: 'time', color: '#F97316' };
    } else if (daysUntil <= 7) {
      return { name: 'time', color: '#F59E0B' };
    }
    return { name: 'time', color: '#9CA3AF' };
  };

  const getTimeUntil = (dueDate: string) => {
    const daysUntil = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return { text: Math.abs(daysUntil) + 'd overdue', urgent: true };
    } else if (daysUntil === 0) {
      return { text: 'Due today', urgent: true };
    } else if (daysUntil === 1) {
      return { text: 'Due tomorrow', urgent: true };
    } else if (daysUntil <= 7) {
      return { text: daysUntil + ' days left', urgent: daysUntil <= 3 };
    }
    return { text: daysUntil + ' days left', urgent: false };
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'completed', label: 'Completed' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'filing', label: 'Filing' },
    { value: 'hearing', label: 'Hearing' },
    { value: 'response', label: 'Response' },
    { value: 'discovery', label: 'Discovery' },
    { value: 'statute', label: 'Statute' },
    { value: 'custom', label: 'Custom' },
  ];

  const renderDeadline = ({ item }: { item: Deadline }) => {
    const typeColors = getDeadlineTypeColor(item.deadline_type);
    const statusIcon = getStatusIcon(item.status, item.due_date);
    const timeUntil = getTimeUntil(item.due_date);

    return (
      <TouchableOpacity
        style={[styles.deadlineCard, item.status === 'completed' && styles.completedCard]}
        onPress={() => handleDeadlinePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.deadlineHeader}>
          <Ionicons name={statusIcon.name as any} size={20} color={statusIcon.color} />
          <View style={styles.deadlineHeaderContent}>
            <View style={styles.badgeRow}>
              <View style={[styles.typeBadge, { backgroundColor: typeColors.bg }]}>
                <Text style={[styles.typeText, { color: typeColors.text }]}>
                  {item.deadline_type.replace(/_/g, ' ')}
                </Text>
              </View>
              <Ionicons name="alert-circle" size={12} color={getPriorityColor(item.priority)} />
              {item.reminder_sent && (
                <Ionicons name="notifications" size={12} color="#3B82F6" />
              )}
            </View>

            <Text
              style={[styles.deadlineTitle, item.status === 'completed' && styles.completedTitle]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {item.description && (
              <Text style={styles.deadlineDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}

            <View style={styles.metaRow}>
              <TouchableOpacity
                style={styles.metaItem}
                onPress={() => navigation.navigate('CaseDetail', { id: item.case_id })}
              >
                <Ionicons name="briefcase-outline" size={12} color="#6B7280" />
                <Text style={styles.metaText}>{item.case_number}</Text>
              </TouchableOpacity>
              {item.assigned_name && (
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={12} color="#6B7280" />
                  <Text style={styles.metaText}>{item.assigned_name}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.dateColumn}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.dateText}>
                {new Date(item.due_date).toLocaleDateString()}
              </Text>
            </View>
            {item.due_time && (
              <Text style={styles.timeText}>{item.due_time}</Text>
            )}
            {item.status !== 'completed' && (
              <Text style={[styles.urgencyText, timeUntil.urgent && styles.urgencyTextUrgent]}>
                {timeUntil.text}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setSelectedDeadline(selectedDeadline === item.id ? null : item.id)}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {selectedDeadline === item.id && (
          <View style={styles.actionsMenu}>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                navigation.navigate('DeadlineDetail', { id: item.id });
                setSelectedDeadline(null);
              }}
            >
              <Ionicons name="eye-outline" size={18} color="#374151" />
              <Text style={styles.actionMenuText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                navigation.navigate('DeadlineEdit', { id: item.id });
                setSelectedDeadline(null);
              }}
            >
              <Ionicons name="create-outline" size={18} color="#374151" />
              <Text style={styles.actionMenuText}>Edit</Text>
            </TouchableOpacity>
            {item.status !== 'completed' && (
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => handleComplete(item.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                <Text style={[styles.actionMenuText, { color: '#10B981' }]}>Complete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.actionMenuText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time" size={20} color="#3B82F6" />
          <Text style={styles.headerTitle}>Deadlines</Text>
          {deadlines && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{deadlines.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={20} color="#374151" />
          </TouchableOpacity>
          {showAddButton && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('NewDeadline', { caseId })}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersSection}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.filterOptions}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    filterStatus === option.value && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterStatus(option.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterStatus === option.value && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Type</Text>
            <View style={styles.filterOptions}>
              {typeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    filterType === option.value && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterType(option.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterType === option.value && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {deadlines && deadlines.length > 0 ? (
        <FlatList
          data={deadlines}
          renderItem={renderDeadline}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No deadlines found</Text>
          {showAddButton && (
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => navigation.navigate('NewDeadline', { caseId })}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddText}>Add Deadline</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {deadlines && deadlines.length > 0 && !limit && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Deadlines')}
        >
          <Text style={styles.viewAllText}>View All Deadlines</Text>
        </TouchableOpacity>
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
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersSection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  deadlineCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },
  completedCard: {
    opacity: 0.7,
  },
  deadlineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  deadlineHeaderContent: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deadlineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deadlineDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateColumn: {
    alignItems: 'flex-end',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  urgencyTextUrgent: {
    color: '#EF4444',
  },
  moreButton: {
    padding: 4,
  },
  actionsMenu: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    gap: 6,
  },
  actionMenuText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    gap: 8,
  },
  emptyAddText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewAllButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}
