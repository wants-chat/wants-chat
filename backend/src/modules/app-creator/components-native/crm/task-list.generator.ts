/**
 * Task List Component Generator (React Native)
 *
 * Generates task list and notes list components for CRM.
 * Features: Task items with checkbox and due date, notes list with timestamps.
 */

export interface TaskListOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateTaskList(options: TaskListOptions = {}): string {
  const {
    componentName = 'TaskList',
    endpoint = '/tasks',
    title = 'Tasks',
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
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  entityType?: string;
  entityId?: string;
  showFilters?: boolean;
  showHeader?: boolean;
  onAddTask?: () => void;
  onTaskPress?: (task: any) => void;
}

type FilterType = 'all' | 'pending' | 'completed';

const ${componentName}: React.FC<${componentName}Props> = ({
  entityType,
  entityId,
  showFilters = true,
  showHeader = true,
  onAddTask,
  onTaskPress,
}) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const queryKey = entityType && entityId
    ? ['tasks', entityType, entityId]
    : ['tasks'];

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let url = '${endpoint}';
      if (entityType && entityId) {
        url += '?entity_type=' + entityType + '&entity_id=' + entityId;
      }
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.put('${endpoint}/' + id, { completed, status: completed ? 'completed' : 'pending' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update task');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleToggleTask = (task: any) => {
    const isCompleted = task.completed || task.status === 'completed';
    toggleTaskMutation.mutate({ id: task.id, completed: !isCompleted });
  };

  const getPriorityColor = (priority: string): { text: string; bg: string } => {
    const colors: Record<string, { text: string; bg: string }> = {
      high: { text: '#DC2626', bg: '#FEE2E2' },
      medium: { text: '#F59E0B', bg: '#FEF3C7' },
      low: { text: '#10B981', bg: '#D1FAE5' },
    };
    return colors[priority?.toLowerCase()] || { text: '#6B7280', bg: '#F3F4F6' };
  };

  const formatDueDate = (dueDate: string): { text: string; isOverdue: boolean } => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: Math.abs(diffDays) + 'd overdue', isOverdue: true };
    }
    if (diffDays === 0) {
      return { text: 'Today', isOverdue: false };
    }
    if (diffDays === 1) {
      return { text: 'Tomorrow', isOverdue: false };
    }
    if (diffDays <= 7) {
      return { text: 'In ' + diffDays + ' days', isOverdue: false };
    }
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isOverdue: false };
  };

  const filteredTasks = tasks?.filter((task: any) => {
    if (filter === 'all') return true;
    const isCompleted = task.completed || task.status === 'completed';
    if (filter === 'completed') return isCompleted;
    return !isCompleted;
  }) || [];

  const renderFilterButton = (filterValue: FilterType, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterValue && styles.filterButtonActive]}
      onPress={() => setFilter(filterValue)}
    >
      <Text style={[styles.filterButtonText, filter === filterValue && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTask = useCallback(({ item }: { item: any }) => {
    const isCompleted = item.completed || item.status === 'completed';
    const priorityColors = getPriorityColor(item.priority);
    const dueInfo = item.due_date ? formatDueDate(item.due_date) : null;

    return (
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => onTaskPress?.(item)}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleToggleTask(item)}
        >
          {isCompleted ? (
            <View style={styles.checkboxChecked}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.checkboxUnchecked} />
          )}
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text
            style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}
            numberOfLines={2}
          >
            {item.title || item.name}
          </Text>

          <View style={styles.taskMeta}>
            {dueInfo && (
              <View style={[styles.dueDateBadge, dueInfo.isOverdue && styles.dueDateOverdue]}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={dueInfo.isOverdue ? '#DC2626' : '#6B7280'}
                />
                <Text
                  style={[styles.dueDateText, dueInfo.isOverdue && styles.dueDateTextOverdue]}
                >
                  {dueInfo.text}
                </Text>
              </View>
            )}

            {item.priority && (
              <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg }]}>
                <Text style={[styles.priorityText, { color: priorityColors.text }]}>
                  {item.priority}
                </Text>
              </View>
            )}
          </View>

          {item.assignee_name && (
            <View style={styles.assigneeRow}>
              <Ionicons name="person-outline" size={12} color="#9CA3AF" />
              <Text style={styles.assigneeText}>{item.assignee_name}</Text>
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      </TouchableOpacity>
    );
  }, [filter, onTaskPress]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="checkbox-outline" size={22} color="#111827" />
        <Text style={styles.headerTitle}>${title}</Text>
        {tasks && tasks.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{tasks.length}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onAddTask}>
        <Ionicons name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {renderFilterButton('all', 'All')}
      {renderFilterButton('pending', 'Pending')}
      {renderFilterButton('completed', 'Completed')}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="checkbox-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>
        {filter === 'all' ? 'No tasks yet' : 'No ' + filter + ' tasks'}
      </Text>
      {filter === 'all' && onAddTask && (
        <TouchableOpacity style={styles.emptyAddButton} onPress={onAddTask}>
          <Ionicons name="add" size={18} color="#3B82F6" />
          <Text style={styles.emptyAddText}>Add Task</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        {showHeader && renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && renderHeader()}
      {showFilters && renderFilters()}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
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
    padding: 32,
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkboxUnchecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  dueDateOverdue: {
    backgroundColor: '#FEE2E2',
  },
  dueDateText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  dueDateTextOverdue: {
    color: '#DC2626',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  assigneeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  emptyAddText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 4,
  },
});

export default ${componentName};
`;
}

export interface NotesListOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateNotesList(options: NotesListOptions = {}): string {
  const { componentName = 'NotesList', endpoint = '/notes' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  entityType?: string;
  entityId?: string;
  showHeader?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  entityType,
  entityId,
  showHeader = true,
}) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = entityType && entityId
    ? ['notes', entityType, entityId]
    : ['notes'];

  const { data: notes, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let url = '${endpoint}';
      if (entityType && entityId) {
        url += '?entity_type=' + entityType + '&entity_id=' + entityId;
      }
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (content: string) =>
      api.post('${endpoint}', {
        content,
        entity_type: entityType,
        entity_id: entityId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setNewNote('');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add note');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete note');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await createNoteMutation.mutateAsync(newNote.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNoteMutation.mutate(id),
        },
      ]
    );
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

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNote = useCallback(({ item }: { item: any }) => (
    <View style={styles.noteItem}>
      <View style={styles.noteHeader}>
        <View style={styles.noteAuthor}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {(item.author_name || item.user_name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          {(item.author_name || item.user_name) && (
            <Text style={styles.authorName}>{item.author_name || item.user_name}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.noteContent}>{item.content}</Text>

      <Text style={styles.noteTimestamp}>
        {formatTimestamp(item.created_at)}
      </Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Ionicons name="document-text-outline" size={20} color="#111827" />
      <Text style={styles.headerTitle}>Notes</Text>
      {notes && notes.length > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{notes.length}</Text>
        </View>
      )}
    </View>
  );

  const renderInput = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Add a note..."
        placeholderTextColor="#9CA3AF"
        value={newNote}
        onChangeText={setNewNote}
        multiline
        maxLength={1000}
      />
      <TouchableOpacity
        style={[styles.submitButton, (!newNote.trim() || isSubmitting) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!newNote.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="send" size={18} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No notes yet</Text>
      <Text style={styles.emptySubtext}>Add a note to get started</Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        {showHeader && renderHeader()}
        {renderInput()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {showHeader && renderHeader()}
      {renderInput()}
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
    marginRight: 10,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  noteItem: {
    padding: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  deleteButton: {
    padding: 6,
  },
  noteContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}
