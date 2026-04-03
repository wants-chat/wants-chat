/**
 * Time Tracking Component Generators (React Native)
 *
 * Generates time tracking components including:
 * - TimeTracker: General time tracking widget
 * - TimeTrackerConsulting: Consulting-specific time tracker with billable hours
 */

export interface TimeTrackerOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTimeTracker(options: TimeTrackerOptions = {}): string {
  const { componentName = 'TimeTracker', endpoint = '/time-entries' } = options;

  return `import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
  taskId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ projectId, taskId }) => {
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: entries, isLoading, refetch } = useQuery({
    queryKey: ['time-entries', projectId, taskId],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = [];
      if (projectId) params.push('project_id=' + projectId);
      if (taskId) params.push('task_id=' + taskId);
      if (params.length) url += '?' + params.join('&');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setDescription('');
      setElapsedTime(0);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save time entry');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete time entry');
    },
  });

  // Timer effect
  useEffect(() => {
    if (isTracking && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, startTime]);

  const startTimer = useCallback(() => {
    setStartTime(new Date());
    setIsTracking(true);
  }, []);

  const stopTimer = useCallback(() => {
    if (startTime && elapsedTime > 0) {
      createMutation.mutate({
        project_id: projectId,
        task_id: taskId,
        description,
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
        duration: elapsedTime,
      });
    }
    setIsTracking(false);
    setStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [startTime, elapsedTime, description, projectId, taskId, createMutation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return \`\${hours}h \${minutes}m\`;
    return \`\${minutes}m\`;
  };

  const getTotalTime = () => {
    return entries?.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) || 0;
  };

  const handleDeleteEntry = useCallback((id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this time entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]
    );
  }, [deleteMutation]);

  const renderEntry = useCallback(({ item }: { item: any }) => (
    <View style={styles.entryItem}>
      <View style={styles.entryContent}>
        <Text style={styles.entryDescription} numberOfLines={1}>
          {item.description || 'No description'}
        </Text>
        <View style={styles.entryMeta}>
          {item.project_name && (
            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={12} color="#9CA3AF" />
              <Text style={styles.metaText}>{item.project_name}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text style={styles.metaText}>
              {new Date(item.start_time || item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.entryActions}>
        <Text style={styles.entryDuration}>{formatDuration(item.duration)}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteEntry(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleDeleteEntry]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Timer Section */}
      <View style={styles.timerSection}>
        <View style={styles.timerHeader}>
          <View style={styles.timerTitleRow}>
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
            <Text style={styles.timerTitle}>Time Tracker</Text>
          </View>
          <View style={styles.totalTime}>
            <Text style={styles.totalTimeLabel}>Total Tracked</Text>
            <Text style={styles.totalTimeValue}>{formatDuration(getTotalTime())}</Text>
          </View>
        </View>

        {/* Timer Display */}
        <View style={styles.timerDisplay}>
          <Text style={[styles.timerText, isTracking && styles.timerTextActive]}>
            {formatTime(elapsedTime)}
          </Text>
        </View>

        {/* Description Input */}
        <TextInput
          style={styles.descriptionInput}
          placeholder="What are you working on?"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
        />

        {/* Start/Stop Button */}
        <TouchableOpacity
          style={[styles.timerButton, isTracking && styles.timerButtonStop]}
          onPress={isTracking ? stopTimer : startTimer}
        >
          <Ionicons
            name={isTracking ? 'pause' : 'play'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.timerButtonText}>
            {isTracking ? 'Stop Timer' : 'Start Timer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Entries List */}
      <View style={styles.entriesSection}>
        <Text style={styles.entriesTitle}>Recent Entries</Text>
        {entries && entries.length > 0 ? (
          <FlatList
            data={entries.slice(0, 10)}
            renderItem={renderEntry}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
              />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No time entries yet</Text>
          </View>
        )}
      </View>
    </View>
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
  timerSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalTime: {
    alignItems: 'flex-end',
  },
  totalTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    color: '#111827',
  },
  timerTextActive: {
    color: '#3B82F6',
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    gap: 8,
  },
  timerButtonStop: {
    backgroundColor: '#EF4444',
  },
  timerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  entriesSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  entryContent: {
    flex: 1,
  },
  entryDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  entryMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
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

export function generateTimeTrackerConsulting(options: TimeTrackerOptions = {}): string {
  const { componentName = 'TimeTrackerConsulting', endpoint = '/time-entries' } = options;

  return `import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  Modal,
  Switch,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
}

const billingRates: Record<string, number> = {
  'senior-consultant': 250,
  'consultant': 175,
  'analyst': 125,
  'associate': 100,
};

const roleOptions = [
  { value: 'senior-consultant', label: 'Senior Consultant', rate: 250 },
  { value: 'consultant', label: 'Consultant', rate: 175 },
  { value: 'analyst', label: 'Analyst', rate: 125 },
  { value: 'associate', label: 'Associate', rate: 100 },
];

const activityTypes = [
  { value: 'client-meeting', label: 'Client Meeting', billable: true },
  { value: 'internal-meeting', label: 'Internal Meeting', billable: false },
  { value: 'research', label: 'Research & Analysis', billable: true },
  { value: 'documentation', label: 'Documentation', billable: true },
  { value: 'presentation', label: 'Presentation Prep', billable: true },
  { value: 'travel', label: 'Travel', billable: true },
  { value: 'admin', label: 'Administrative', billable: false },
];

const ${componentName}: React.FC<${componentName}Props> = ({ projectId }) => {
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('');
  const [role, setRole] = useState('consultant');
  const [isBillable, setIsBillable] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [refreshing, setRefreshing] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: entries, isLoading, refetch } = useQuery({
    queryKey: ['time-entries', projectId, viewMode],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = [];
      if (projectId) params.push('project_id=' + projectId);
      params.push('view=' + viewMode);
      if (params.length) url += '?' + params.join('&');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setDescription('');
      setElapsedTime(0);
      setActivityType('');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save time entry');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete time entry');
    },
  });

  // Timer effect
  useEffect(() => {
    if (isTracking && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, startTime]);

  // Update billable when activity type changes
  useEffect(() => {
    const activity = activityTypes.find(a => a.value === activityType);
    if (activity) {
      setIsBillable(activity.billable);
    }
  }, [activityType]);

  const startTimer = useCallback(() => {
    setStartTime(new Date());
    setIsTracking(true);
  }, []);

  const stopTimer = useCallback(() => {
    if (startTime && elapsedTime > 0) {
      const hourlyRate = billingRates[role] || 175;
      const hours = elapsedTime / 3600;
      const billableAmount = isBillable ? hours * hourlyRate : 0;

      createMutation.mutate({
        project_id: projectId,
        description,
        activity_type: activityType,
        role,
        is_billable: isBillable,
        hourly_rate: hourlyRate,
        billable_amount: billableAmount,
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
        duration: elapsedTime,
      });
    }
    setIsTracking(false);
    setStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [startTime, elapsedTime, description, projectId, activityType, role, isBillable, createMutation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return \`\${hours}h \${minutes}m\`;
    return \`\${minutes}m\`;
  };

  const getTotalTime = () => {
    return entries?.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) || 0;
  };

  const getBillableTime = () => {
    return entries?.filter((e: any) => e.is_billable)
      .reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) || 0;
  };

  const getTotalBillable = () => {
    return entries?.filter((e: any) => e.is_billable)
      .reduce((sum: number, entry: any) => sum + (entry.billable_amount || 0), 0) || 0;
  };

  const handleDeleteEntry = useCallback((id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this time entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]
    );
  }, [deleteMutation]);

  const renderEntry = useCallback(({ item }: { item: any }) => (
    <View style={styles.entryItem}>
      <View style={styles.entryContent}>
        <Text style={styles.entryDescription} numberOfLines={1}>
          {item.description || 'No description'}
        </Text>
        <View style={styles.entryMeta}>
          {item.activity_type && (
            <Text style={styles.activityTag}>
              {activityTypes.find(a => a.value === item.activity_type)?.label || item.activity_type}
            </Text>
          )}
          <Text style={styles.entryDate}>
            {new Date(item.start_time || item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.entryRight}>
        <Text style={styles.entryDuration}>{formatDuration(item.duration)}</Text>
        {item.is_billable ? (
          <View style={styles.billableBadge}>
            <Ionicons name="cash-outline" size={12} color="#059669" />
            <Text style={styles.billableAmount}>
              \${(item.billable_amount || 0).toFixed(2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.nonBillable}>Non-billable</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteEntry(item.id)}
      >
        <Ionicons name="trash-outline" size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  ), [handleDeleteEntry]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.statLabel}>Total Time</Text>
            <Text style={styles.statValue}>{formatDuration(getTotalTime())}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="cash-outline" size={20} color="#059669" />
          </View>
          <View>
            <Text style={styles.statLabel}>Billable Amount</Text>
            <Text style={styles.statValue}>
              \${getTotalBillable().toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="briefcase-outline" size={20} color="#8B5CF6" />
          </View>
          <View>
            <Text style={styles.statLabel}>Billable Hours</Text>
            <Text style={styles.statValue}>{formatDuration(getBillableTime())}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Timer Section */}
      <View style={styles.timerSection}>
        <View style={styles.timerHeader}>
          <View style={styles.timerTitleRow}>
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
            <Text style={styles.timerTitle}>Time Tracker</Text>
          </View>
          <View style={styles.viewModeToggle}>
            {(['day', 'week', 'month'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
                onPress={() => setViewMode(mode)}
              >
                <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timer Display */}
        <View style={styles.timerDisplay}>
          <Text style={[styles.timerText, isTracking && styles.timerTextActive]}>
            {formatTime(elapsedTime)}
          </Text>
          {isTracking && (
            <Text style={styles.trackingInfo}>
              Tracking at \${billingRates[role]}/hr {isBillable ? '(Billable)' : '(Non-billable)'}
            </Text>
          )}
        </View>

        {/* Description Input */}
        <TextInput
          style={styles.descriptionInput}
          placeholder="What are you working on?"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
        />

        {/* Selection Grid */}
        <View style={styles.selectionGrid}>
          <TouchableOpacity
            style={[styles.selectButton, activityType && styles.selectButtonActive]}
            onPress={() => setShowActivityModal(true)}
          >
            <Text style={styles.selectButtonLabel}>Activity</Text>
            <Text style={[styles.selectButtonValue, activityType && styles.selectButtonValueActive]}>
              {activityTypes.find(a => a.value === activityType)?.label || 'Select'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectButton, styles.selectButtonActive]}
            onPress={() => setShowRoleModal(true)}
          >
            <Text style={styles.selectButtonLabel}>Role</Text>
            <Text style={[styles.selectButtonValue, styles.selectButtonValueActive]}>
              {roleOptions.find(r => r.value === role)?.label || 'Select'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Billable Toggle */}
        <View style={styles.billableToggle}>
          <Text style={styles.billableLabel}>Billable</Text>
          <Switch
            value={isBillable}
            onValueChange={setIsBillable}
            trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
            thumbColor={isBillable ? '#059669' : '#9CA3AF'}
          />
        </View>

        {/* Start/Stop Button */}
        <TouchableOpacity
          style={[styles.timerButton, isTracking && styles.timerButtonStop]}
          onPress={isTracking ? stopTimer : startTimer}
        >
          <Ionicons
            name={isTracking ? 'pause' : 'play'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.timerButtonText}>
            {isTracking ? 'Stop Timer' : 'Start Timer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Entries List */}
      <View style={styles.entriesSection}>
        <Text style={styles.entriesTitle}>Time Entries</Text>
        {entries && entries.length > 0 ? (
          entries.map((entry: any) => renderEntry({ item: entry }))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No time entries yet</Text>
          </View>
        )}
      </View>

      {/* Activity Type Modal */}
      <Modal
        visible={showActivityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowActivityModal(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Activity Type</Text>
              <TouchableOpacity onPress={() => setShowActivityModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {activityTypes.map((activity) => (
                <TouchableOpacity
                  key={activity.value}
                  style={[styles.modalOption, activityType === activity.value && styles.modalOptionSelected]}
                  onPress={() => {
                    setActivityType(activity.value);
                    setShowActivityModal(false);
                  }}
                >
                  <View>
                    <Text style={[styles.modalOptionText, activityType === activity.value && styles.modalOptionTextSelected]}>
                      {activity.label}
                    </Text>
                    <Text style={styles.modalOptionSubtext}>
                      {activity.billable ? 'Billable' : 'Non-billable'}
                    </Text>
                  </View>
                  {activityType === activity.value && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Role Modal */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowRoleModal(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Role</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {roleOptions.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.modalOption, role === r.value && styles.modalOptionSelected]}
                  onPress={() => {
                    setRole(r.value);
                    setShowRoleModal(false);
                  }}
                >
                  <View>
                    <Text style={[styles.modalOptionText, role === r.value && styles.modalOptionTextSelected]}>
                      {r.label}
                    </Text>
                    <Text style={styles.modalOptionSubtext}>\${r.rate}/hr</Text>
                  </View>
                  {role === r.value && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  statsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timerSection: {
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
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  viewModeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewModeTextActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    color: '#111827',
  },
  timerTextActive: {
    color: '#3B82F6',
  },
  trackingInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  selectButtonLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  selectButtonValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectButtonValueActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  billableToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  billableLabel: {
    fontSize: 14,
    color: '#374151',
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    gap: 8,
  },
  timerButtonStop: {
    backgroundColor: '#EF4444',
  },
  timerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  entriesSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  entryContent: {
    flex: 1,
  },
  entryDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityTag: {
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  entryDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  entryRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  entryDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  billableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  billableAmount: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  nonBillable: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  modalOptionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}
