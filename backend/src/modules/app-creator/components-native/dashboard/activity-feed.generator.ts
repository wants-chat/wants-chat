/**
 * Activity Feed Component Generator (React Native)
 *
 * Generates activity feed and timeline components.
 * Features: FlatList with activity items, timeline view with connecting lines, icons per activity type.
 */

export interface ActivityFeedOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateActivityFeed(options: ActivityFeedOptions = {}): string {
  const {
    componentName = 'ActivityFeed',
    endpoint = '/activities',
    title = 'Recent Activity',
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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['activities', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += '?limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'created':
        return 'add-circle';
      case 'updated':
        return 'create';
      case 'deleted':
        return 'trash';
      case 'completed':
        return 'checkmark-circle';
      case 'login':
        return 'log-in';
      case 'logout':
        return 'log-out';
      case 'comment':
        return 'chatbubble';
      case 'like':
        return 'heart';
      case 'share':
        return 'share-social';
      default:
        return 'pulse';
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'created':
        return '#10B981';
      case 'updated':
        return '#3B82F6';
      case 'deleted':
        return '#EF4444';
      case 'completed':
        return '#8B5CF6';
      case 'login':
        return '#06B6D4';
      case 'logout':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    if (diffDays < 7) return diffDays + 'd ago';
    return date.toLocaleDateString();
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const iconName = getActivityIcon(item.type);
    const iconColor = getActivityColor(item.type);

    return (
      <TouchableOpacity style={styles.activityItem} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityDescription} numberOfLines={2}>
            {item.description || item.message || item.action}
          </Text>
          <View style={styles.timestampContainer}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.timestamp}>{formatTimestamp(item.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="pulse" size={20} color="#111827" />
        <Text style={styles.headerTitle}>${title}</Text>
      </View>
      {activities && activities.length > 0 ? (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="pulse" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No recent activity</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
  activityItem: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 64,
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

export function generateActivityTimeline(
  options: { componentName?: string; endpoint?: string } = {}
): string {
  const { componentName = 'ActivityTimeline', endpoint = '/activities' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusColor = (type: string): string => {
    switch (type) {
      case 'created':
        return '#10B981';
      case 'updated':
        return '#3B82F6';
      case 'deleted':
        return '#EF4444';
      case 'completed':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isLast = activities && index === activities.length - 1;
    const statusColor = getStatusColor(item.type || 'default');

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          {!isLast && <View style={styles.line} />}
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineDescription}>
            {item.description || item.message}
          </Text>
          <Text style={styles.timelineTimestamp}>
            {formatTimestamp(item.created_at)}
          </Text>
        </View>
      </View>
    );
  }, [activities]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={20} color="#111827" />
        <Text style={styles.headerTitle}>Activity Timeline</Text>
      </View>
      {activities && activities.length > 0 ? (
        <FlatList
          data={activities}
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
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No activity yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  timelineDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}
