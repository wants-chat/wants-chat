/**
 * Active Jobs Component Generator (React Native)
 *
 * Generates a job tracking component with progress indicators and priority badges.
 * Features: FlatList with job items, priority colors, progress bars, status badges.
 */

export interface ActiveJobsOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateActiveJobs(options: ActiveJobsOptions = {}): string {
  const {
    componentName = 'ActiveJobs',
    endpoint = '/jobs',
    title = 'Active Jobs',
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

interface Job {
  id: string;
  title: string;
  client: string;
  status: 'in-progress' | 'pending' | 'review' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignee: string;
  progress: number;
}

interface ${componentName}Props {
  data?: Job[];
  onJobPress?: (job: Job) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ data: propData, onJobPress }) => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData || propData.length === 0,
  });

  const jobs = propData && propData.length > 0 ? propData : (fetchedData || []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getPriorityColor = (priority: string): { bg: string; text: string } => {
    switch (priority) {
      case 'high':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'low':
        return { bg: '#DCFCE7', text: '#16A34A' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'in-progress':
        return '#3B82F6';
      case 'pending':
        return '#6B7280';
      case 'review':
        return '#8B5CF6';
      case 'completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace(/-/g, ' ').replace(/\\b\\w/g, (l) => l.toUpperCase());
  };

  const handleJobPress = (job: Job) => {
    if (onJobPress) {
      onJobPress(job);
    } else {
      navigation.navigate('JobDetail', { id: job.id });
    }
  };

  const renderItem = useCallback(({ item }: { item: Job }) => {
    const priorityColors = getPriorityColor(item.priority);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => handleJobPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {formatStatus(item.status)}
            </Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg }]}>
            <Text style={[styles.priorityText, { color: priorityColors.text }]}>
              {item.priority}
            </Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.client}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.assignee}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{item.progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: \`\${item.progress}%\`, backgroundColor: statusColor },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: Job) => item.id, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>${title}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('JobCreate')}
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
        data={jobs}
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
            <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No active jobs</Text>
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
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  progressContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
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
