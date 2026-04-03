/**
 * Task Component Generators (React Native)
 *
 * Generates task management components including:
 * - TaskDetail: Detailed view of a single task
 * - TaskBoard: Kanban-style task board (for wedding planning, etc.)
 * - TaskListWedding: Wedding-specific task list
 */

export interface TaskOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTaskDetail(options: TaskOptions = {}): string {
  const { componentName = 'TaskDetail', endpoint = '/tasks' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  taskId?: string;
  onBack?: () => void;
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: '#D1FAE5', text: '#059669' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  high: { bg: '#FED7AA', text: '#EA580C' },
  urgent: { bg: '#FEE2E2', text: '#DC2626' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ taskId: propId, onBack }) => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const taskId = propId || route.params?.id;
  const [refreshing, setRefreshing] = useState(false);

  const { data: task, isLoading, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + taskId);
      return response?.data || response;
    },
    enabled: !!taskId,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: any) => api.put('${endpoint}/' + taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: () => api.put('${endpoint}/' + taskId, {
      completed: !task?.completed,
      status: task?.completed ? 'pending' : 'completed',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete('${endpoint}/' + taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      handleBack();
    },
  });

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  }, [onBack, navigation]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  }, [deleteMutation]);

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

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCompleted = task.completed || task.status === 'completed';
  const priority = task.priority || 'medium';
  const colors = priorityColors[priority] || priorityColors.medium;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="pencil-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Task Title and Status */}
        <View style={styles.titleSection}>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => toggleCompleteMutation.mutate()}
          >
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
              size={28}
              color={isCompleted ? '#059669' : '#D1D5DB'}
            />
          </TouchableOpacity>
          <Text style={[styles.title, isCompleted && styles.titleCompleted]}>
            {task.title || task.name}
          </Text>
        </View>

        {task.description && (
          <Text style={styles.description}>{task.description}</Text>
        )}

        {/* Meta Info */}
        <View style={styles.metaGrid}>
          {task.due_date && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Due</Text>
                <Text style={styles.metaValue}>
                  {new Date(task.due_date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
          {task.assignee_name && (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={18} color="#6B7280" />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Assigned</Text>
                <Text style={styles.metaValue}>{task.assignee_name}</Text>
              </View>
            </View>
          )}
          {task.priority && (
            <View style={styles.metaItem}>
              <Ionicons name="flag-outline" size={18} color="#6B7280" />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Priority</Text>
                <View style={[styles.priorityBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.priorityText, { color: colors.text }]}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          {task.estimated_hours && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Estimated</Text>
                <Text style={styles.metaValue}>{task.estimated_hours}h</Text>
              </View>
            </View>
          )}
        </View>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagsContainer}>
              {task.tags.map((tag: string, i: number) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="attach" size={18} color="#374151" />
              <Text style={styles.sectionTitle}>Attachments</Text>
            </View>
            {task.attachments.map((file: any, i: number) => (
              <TouchableOpacity key={i} style={styles.attachmentItem}>
                <Ionicons name="document-outline" size={20} color="#6B7280" />
                <Text style={styles.attachmentName}>{file.name || 'Attachment'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Comments */}
        {task.comments && task.comments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubbles-outline" size={18} color="#374151" />
              <Text style={styles.sectionTitle}>Comments ({task.comments.length})</Text>
            </View>
            {task.comments.map((comment: any, i: number) => (
              <View key={i} style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {(comment.user_name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.user_name || 'Unknown'}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  checkButton: {
    paddingTop: 2,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 28,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagsSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4B5563',
  },
  section: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentName: {
    fontSize: 14,
    color: '#374151',
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  commentDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});

export default ${componentName};
`;
}

export function generateTaskBoard(options: TaskOptions = {}): string {
  const { componentName = 'TaskBoard', endpoint = '/tasks' } = options;

  return `import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
  stages?: Array<{ id: string; name: string; color?: string }>;
}

const defaultStages = [
  { id: 'todo', name: 'To Do', color: '#6B7280' },
  { id: 'in-progress', name: 'In Progress', color: '#3B82F6' },
  { id: 'review', name: 'Review', color: '#F59E0B' },
  { id: 'done', name: 'Done', color: '#10B981' },
];

const { width: screenWidth } = Dimensions.get('window');
const COLUMN_WIDTH = screenWidth * 0.75;

const ${componentName}: React.FC<${componentName}Props> = ({
  projectId,
  stages = defaultStages,
}) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      let url = '${endpoint}';
      if (projectId) url += '?project_id=' + projectId;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.put('${endpoint}/' + id, { stage, status: stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getTasksByStage = (stageId: string) =>
    tasks?.filter((task: any) => task.stage === stageId || task.status === stageId) || [];

  const moveTask = useCallback((taskId: string, direction: 'left' | 'right') => {
    const task = tasks?.find((t: any) => t.id === taskId);
    if (!task) return;

    const currentIndex = stages.findIndex(s => s.id === task.stage || s.id === task.status);
    const newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < stages.length) {
      updateStageMutation.mutate({ id: taskId, stage: stages[newIndex].id });
    }
  }, [tasks, stages, updateStageMutation]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.boardContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
        />
      }
    >
      {stages.map((stage, stageIndex) => {
        const stageTasks = getTasksByStage(stage.id);
        const isFirst = stageIndex === 0;
        const isLast = stageIndex === stages.length - 1;

        return (
          <View key={stage.id} style={styles.column}>
            <View style={[styles.columnHeader, { borderTopColor: stage.color }]}>
              <Text style={styles.columnTitle}>{stage.name}</Text>
              <View style={styles.columnCount}>
                <Text style={styles.columnCountText}>{stageTasks.length}</Text>
              </View>
            </View>

            <ScrollView style={styles.columnContent} showsVerticalScrollIndicator={false}>
              {stageTasks.map((task: any) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => navigation.navigate('TaskDetail' as never, { id: task.id } as never)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.taskTitle} numberOfLines={2}>
                    {task.title || task.name}
                  </Text>

                  {task.category && (
                    <View style={styles.categoryRow}>
                      <Ionicons name="pricetag-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.categoryText}>{task.category}</Text>
                    </View>
                  )}

                  <View style={styles.taskMeta}>
                    {task.due_date && (
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.metaText}>
                          {new Date(task.due_date).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    {task.assignee_name && (
                      <View style={styles.metaItem}>
                        <Ionicons name="person-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.metaText}>{task.assignee_name}</Text>
                      </View>
                    )}
                  </View>

                  {task.budget && (
                    <Text style={styles.budget}>\${task.budget.toLocaleString()}</Text>
                  )}

                  {/* Move buttons */}
                  <View style={styles.moveButtons}>
                    {!isFirst && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => moveTask(task.id, 'left')}
                      >
                        <Ionicons name="chevron-back" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                    {!isLast && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => moveTask(task.id, 'right')}
                      >
                        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.addTaskButton}>
                <Ionicons name="add" size={20} color="#6B7280" />
                <Text style={styles.addTaskText}>Add task</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardContainer: {
    padding: 16,
    paddingRight: 0,
  },
  column: {
    width: COLUMN_WIDTH,
    marginRight: 12,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  columnCount: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  columnCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  columnContent: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    minHeight: 200,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  budget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginTop: 8,
  },
  moveButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  moveButton: {
    padding: 4,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  addTaskText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateTaskListWedding(options: TaskOptions = {}): string {
  const { componentName = 'TaskListWedding', endpoint = '/tasks' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal,
  Switch,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  weddingId?: string;
}

const categories = [
  { id: 'venue', name: 'Venue', icon: 'location', color: '#EC4899' },
  { id: 'catering', name: 'Catering', icon: 'restaurant', color: '#F97316' },
  { id: 'photography', name: 'Photography', icon: 'camera', color: '#8B5CF6' },
  { id: 'music', name: 'Music & Entertainment', icon: 'musical-notes', color: '#3B82F6' },
  { id: 'flowers', name: 'Flowers & Decor', icon: 'heart', color: '#EC4899' },
  { id: 'cake', name: 'Cake & Desserts', icon: 'nutrition', color: '#F59E0B' },
  { id: 'transportation', name: 'Transportation', icon: 'car', color: '#6B7280' },
  { id: 'attire', name: 'Attire & Beauty', icon: 'shirt', color: '#EC4899' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ weddingId }) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['wedding-tasks', weddingId, selectedCategory],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = [];
      if (weddingId) params.push('wedding_id=' + weddingId);
      if (selectedCategory) params.push('category=' + selectedCategory);
      if (params.length) url += '?' + params.join('&');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.put('${endpoint}/' + id, { completed, status: completed ? 'completed' : 'pending' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-tasks'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getTasksByCategory = (categoryId: string) => {
    let filtered = tasks?.filter((task: any) => task.category === categoryId) || [];
    if (!showCompleted) {
      filtered = filtered.filter((task: any) => !task.completed && task.status !== 'completed');
    }
    return filtered;
  };

  const getTotalBudget = () => {
    return tasks?.reduce((sum: number, task: any) => sum + (task.budget || 0), 0) || 0;
  };

  const getSpentBudget = () => {
    return tasks?.reduce((sum: number, task: any) => sum + (task.spent || 0), 0) || 0;
  };

  const getCompletedCount = () => {
    return tasks?.filter((task: any) => task.completed || task.status === 'completed').length || 0;
  };

  const getCategoryIcon = (iconName: string): keyof typeof Ionicons.glyphMap => {
    return iconName as keyof typeof Ionicons.glyphMap;
  };

  const sections = categories
    .filter(cat => !selectedCategory || selectedCategory === cat.id)
    .map(cat => ({
      ...cat,
      data: getTasksByCategory(cat.id),
    }))
    .filter(cat => cat.data.length > 0 || selectedCategory === cat.id);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#FCE7F3' }]}>
            <Ionicons name="heart" size={20} color="#EC4899" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>
              {getCompletedCount()} / {tasks?.length || 0}
            </Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="cash" size={20} color="#059669" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryValue}>\${getTotalBudget().toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="wallet" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={styles.summaryValue}>\${getSpentBudget().toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={18} color="#6B7280" />
          <Text style={styles.filterButtonText}>
            {selectedCategory
              ? categories.find(c => c.id === selectedCategory)?.name
              : 'All Categories'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
        <View style={styles.showCompletedToggle}>
          <Text style={styles.toggleLabel}>Show completed</Text>
          <Switch
            value={showCompleted}
            onValueChange={setShowCompleted}
            trackColor={{ false: '#E5E7EB', true: '#FBCFE8' }}
            thumbColor={showCompleted ? '#EC4899' : '#9CA3AF'}
          />
        </View>
      </View>

      {/* Task List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
              <Ionicons
                name={getCategoryIcon(section.icon)}
                size={16}
                color={section.color}
              />
            </View>
            <Text style={styles.sectionTitle}>{section.name}</Text>
            <Text style={styles.sectionCount}>({section.data.length})</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isCompleted = item.completed || item.status === 'completed';
          return (
            <TouchableOpacity
              style={styles.taskItem}
              onPress={() => toggleTaskMutation.mutate({
                id: item.id,
                completed: !isCompleted,
              })}
            >
              <Ionicons
                name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={isCompleted ? '#EC4899' : '#D1D5DB'}
              />
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                  {item.title || item.name}
                </Text>
                <View style={styles.taskMeta}>
                  {item.due_date && (
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.metaText}>
                        {new Date(item.due_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {item.vendor_name && (
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.metaText}>{item.vendor_name}</Text>
                    </View>
                  )}
                  {item.budget && (
                    <View style={styles.metaItem}>
                      <Ionicons name="cash-outline" size={12} color="#059669" />
                      <Text style={[styles.metaText, { color: '#059669' }]}>
                        \${item.budget.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No tasks in this category</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EC4899"
          />
        }
        stickySectionHeadersEnabled={false}
      />

      {/* Category Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={[styles.modalOption, !selectedCategory && styles.modalOptionSelected]}
                onPress={() => {
                  setSelectedCategory('');
                  setShowFilterModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, !selectedCategory && styles.modalOptionTextSelected]}>
                  All Categories
                </Text>
                {!selectedCategory && <Ionicons name="checkmark" size={20} color="#EC4899" />}
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.modalOption, selectedCategory === cat.id && styles.modalOptionSelected]}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setShowFilterModal(false);
                  }}
                >
                  <View style={styles.categoryOptionContent}>
                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                      <Ionicons name={getCategoryIcon(cat.icon)} size={16} color={cat.color} />
                    </View>
                    <Text style={[
                      styles.modalOptionText,
                      selectedCategory === cat.id && styles.modalOptionTextSelected
                    ]}>
                      {cat.name}
                    </Text>
                  </View>
                  {selectedCategory === cat.id && <Ionicons name="checkmark" size={20} color="#EC4899" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  summaryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryCard: {
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
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  showCompletedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  sectionCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskMeta: {
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
    color: '#9CA3AF',
  },
  emptyState: {
    padding: 48,
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
    backgroundColor: '#FDF2F8',
  },
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#EC4899',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}
