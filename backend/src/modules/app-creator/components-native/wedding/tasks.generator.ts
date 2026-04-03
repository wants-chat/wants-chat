/**
 * Wedding Task Component Generators (React Native)
 *
 * Generates task board and task list components for wedding planning.
 * Uses React Native patterns with ScrollView, FlatList, and touch interactions.
 */

export interface WeddingTaskOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTaskBoardWedding(options: WeddingTaskOptions = {}): string {
  const { componentName = 'TaskBoardWedding', endpoint = '/wedding/tasks' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  weddingId?: string;
  onTaskPress?: (task: Task) => void;
}

interface Task {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  status?: string;
  stage?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
  due_date?: string;
  assignee?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

const STAGES: Stage[] = [
  { id: 'todo', name: 'To Do', color: '#6B7280', bgColor: '#F3F4F6' },
  { id: 'in_progress', name: 'In Progress', color: '#3B82F6', bgColor: '#DBEAFE' },
  { id: 'review', name: 'Review', color: '#F59E0B', bgColor: '#FEF3C7' },
  { id: 'completed', name: 'Completed', color: '#10B981', bgColor: '#D1FAE5' },
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: '#FEE2E2', text: '#DC2626' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  low: { bg: '#D1FAE5', text: '#059669' },
};

const CATEGORY_COLORS: Record<string, string> = {
  venue: '#8B5CF6',
  catering: '#F97316',
  photography: '#3B82F6',
  music: '#EC4899',
  flowers: '#F43F5E',
  attire: '#06B6D4',
  invitations: '#F59E0B',
  default: '#6B7280',
};

const ${componentName}: React.FC<${componentName}Props> = ({ weddingId, onTaskPress }) => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['wedding-tasks', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put('${endpoint}/' + id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-tasks', weddingId] });
    },
  });

  const getTasksByStage = (stageId: string): Task[] =>
    (tasks || []).filter((task: Task) => task.status === stageId || task.stage === stageId);

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getCategoryColor = (category?: string) => {
    return CATEGORY_COLORS[category?.toLowerCase() || ''] || CATEGORY_COLORS.default;
  };

  const getPriorityStyle = (priority?: string) => {
    return PRIORITY_COLORS[priority?.toLowerCase() || ''] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View style={styles.boardContainer}>
        {STAGES.map((stage) => {
          const stageTasks = getTasksByStage(stage.id);

          return (
            <View key={stage.id} style={styles.column}>
              {/* Column Header */}
              <View style={[styles.columnHeader, { backgroundColor: stage.bgColor }]}>
                <View style={[styles.columnHeaderBorder, { backgroundColor: stage.color }]} />
                <View style={styles.columnHeaderContent}>
                  <Text style={styles.columnTitle}>{stage.name}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{stageTasks.length}</Text>
                  </View>
                </View>
              </View>

              {/* Tasks */}
              <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
                {stageTasks.map((task: Task) => {
                  const categoryColor = getCategoryColor(task.category);
                  const priorityStyle = getPriorityStyle(task.priority);
                  const taskOverdue = stage.id !== 'completed' && isOverdue(task.dueDate || task.due_date);

                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[styles.taskCard, { borderLeftColor: categoryColor }]}
                      onPress={() => onTaskPress?.(task)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.taskHeader}>
                        <Text style={styles.taskTitle} numberOfLines={2}>
                          {task.title || task.name}
                        </Text>
                      </View>

                      {task.description && (
                        <Text style={styles.taskDescription} numberOfLines={2}>
                          {task.description}
                        </Text>
                      )}

                      <View style={styles.taskTags}>
                        {task.priority && (
                          <View style={[styles.tag, { backgroundColor: priorityStyle.bg }]}>
                            <Text style={[styles.tagText, { color: priorityStyle.text }]}>
                              {task.priority}
                            </Text>
                          </View>
                        )}
                        {task.category && (
                          <View style={[styles.tag, { backgroundColor: '#F3F4F6' }]}>
                            <Text style={styles.tagText}>{task.category}</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.taskFooter}>
                        {(task.dueDate || task.due_date) && (
                          <View style={styles.taskMeta}>
                            <Ionicons
                              name={taskOverdue ? 'alert-circle-outline' : 'calendar-outline'}
                              size={12}
                              color={taskOverdue ? '#DC2626' : '#6B7280'}
                            />
                            <Text style={[
                              styles.taskMetaText,
                              taskOverdue && { color: '#DC2626' }
                            ]}>
                              {new Date(task.dueDate || task.due_date || '').toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                        {task.assignee && (
                          <View style={styles.taskMeta}>
                            <Ionicons name="person-outline" size={12} color="#6B7280" />
                            <Text style={styles.taskMetaText}>{task.assignee}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Add Task Button */}
                <TouchableOpacity style={styles.addTaskButton} activeOpacity={0.7}>
                  <Ionicons name="add-outline" size={16} color="#6B7280" />
                  <Text style={styles.addTaskText}>Add Task</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          );
        })}
      </View>
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
    paddingVertical: 32,
  },
  boardContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  column: {
    width: 280,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  columnHeader: {
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  columnHeaderBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  columnHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskList: {
    padding: 8,
    maxHeight: 500,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  taskDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  taskTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
    color: '#6B7280',
  },
  taskFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addTaskText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateTaskListWedding(options: WeddingTaskOptions = {}): string {
  const { componentName = 'TaskListWedding', endpoint = '/wedding/tasks' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  weddingId?: string;
  showFilters?: boolean;
  onTaskPress?: (task: Task) => void;
}

interface Task {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  completed?: boolean;
  status?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
  due_date?: string;
  assignee?: string;
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: '#FEE2E2', text: '#DC2626' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  low: { bg: '#D1FAE5', text: '#059669' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  weddingId,
  showFilters = true,
  onTaskPress,
}) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['wedding-tasks', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.put('${endpoint}/' + id, { completed, status: completed ? 'completed' : 'todo' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-tasks', weddingId] });
    },
  });

  const isOverdue = (dueDate?: string, completed?: boolean) => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = (tasks || [])
    .filter((task: Task) => {
      const isCompleted = task.completed || task.status === 'completed';
      const taskOverdue = isOverdue(task.dueDate || task.due_date, isCompleted);

      if (filter === 'completed') return isCompleted;
      if (filter === 'pending') return !isCompleted;
      if (filter === 'overdue') return taskOverdue;
      return true;
    })
    .sort((a: Task, b: Task) => {
      const aPriority = PRIORITY_ORDER[a.priority?.toLowerCase() || ''] ?? 3;
      const bPriority = PRIORITY_ORDER[b.priority?.toLowerCase() || ''] ?? 3;
      return aPriority - bPriority;
    });

  const getPriorityStyle = (priority?: string) => {
    return PRIORITY_COLORS[priority?.toLowerCase() || ''] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const completedCount = (tasks || []).filter(
    (t: Task) => t.completed || t.status === 'completed'
  ).length;
  const totalCount = (tasks || []).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const renderTask = ({ item: task }: { item: Task }) => {
    const isCompleted = task.completed || task.status === 'completed';
    const taskOverdue = isOverdue(task.dueDate || task.due_date, isCompleted);
    const priorityStyle = getPriorityStyle(task.priority);

    return (
      <TouchableOpacity
        style={[styles.taskItem, isCompleted && styles.taskItemCompleted]}
        onPress={() => onTaskPress?.(task)}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleTaskMutation.mutate({ id: task.id, completed: !isCompleted })}
        >
          {isCompleted ? (
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />
          )}
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
            {task.title || task.name}
          </Text>

          {task.description && (
            <Text style={styles.taskDescription} numberOfLines={1}>
              {task.description}
            </Text>
          )}

          <View style={styles.taskMeta}>
            {(task.dueDate || task.due_date) && (
              <View style={styles.metaItem}>
                <Ionicons
                  name={taskOverdue ? 'alert-circle-outline' : 'calendar-outline'}
                  size={12}
                  color={taskOverdue ? '#DC2626' : '#6B7280'}
                />
                <Text style={[styles.metaText, taskOverdue && { color: '#DC2626' }]}>
                  {new Date(task.dueDate || task.due_date || '').toLocaleDateString()}
                  {taskOverdue && ' (Overdue)'}
                </Text>
              </View>
            )}

            {task.priority && (
              <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                  {task.priority}
                </Text>
              </View>
            )}

            {task.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{task.category}</Text>
              </View>
            )}

            {task.assignee && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={12} color="#6B7280" />
                <Text style={styles.metaText}>{task.assignee}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="checkmark-circle-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>
        {filter === 'all' ? 'No tasks yet. Start planning your wedding!' :
         filter === 'overdue' ? 'No overdue tasks. Great job!' :
         \`No \${filter} tasks\`}
      </Text>
    </View>
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitle}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#F43F5E" />
            <Text style={styles.title}>Wedding Tasks</Text>
          </View>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
            <Ionicons name="add-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {completedCount} of {totalCount} tasks completed
            </Text>
            <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
          </View>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filters}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterButton, filter === f.key && styles.filterButtonActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
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
    marginBottom: 12,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F43F5E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F43F5E',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F43F5E',
    borderRadius: 4,
  },
  filtersContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filters: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#111827',
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 8,
  },
  taskItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  taskTitleCompleted: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#F43F5E',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default ${componentName};
`;
}
