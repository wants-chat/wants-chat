/**
 * Task hooks for Todo1 feature
 * Provides data fetching and mutations for tasks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '../../types/todo1';
import { taskApi, withErrorHandling } from '../../services/todo1Api';

// Hook return types
export interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseTaskMutationReturn {
  mutate: (...args: any[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch tasks by category
 */
export function useTasksByCategory(categoryId: string | null): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!categoryId) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await withErrorHandling(
        () => taskApi.getTasksByCategory(categoryId),
        'Failed to fetch tasks'
      );
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  };
}

/**
 * Hook to create a new task
 */
export function useCreateTask(onSuccess?: (task: Task) => void): UseTaskMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newTask = await withErrorHandling(
        () => taskApi.createTask(data),
        'Failed to create task'
      );
      onSuccess?.(newTask);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { mutate, loading, error };
}

/**
 * Hook to update a task
 */
export function useUpdateTask(onSuccess?: (task: Task) => void): UseTaskMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await withErrorHandling(
        () => taskApi.updateTask(id, data),
        'Failed to update task'
      );
      onSuccess?.(updatedTask);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { mutate, loading, error };
}

/**
 * Hook to delete a task
 */
export function useDeleteTask(onSuccess?: () => void): UseTaskMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await withErrorHandling(
        () => taskApi.deleteTask(id),
        'Failed to delete task'
      );
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { mutate, loading, error };
}

/**
 * Hook to toggle task status
 */
export function useToggleTaskStatus(onSuccess?: (task: Task) => void): UseTaskMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, currentStatus: Task['status']) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await withErrorHandling(
        () => taskApi.toggleTaskStatus(id, currentStatus),
        'Failed to toggle task status'
      );
      onSuccess?.(updatedTask);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { mutate, loading, error };
}

/**
 * Combined hook for task management
 */
export function useTaskManager(categoryId: string | null) {
  const tasksData = useTasksByCategory(categoryId);
  
  const createTask = useCreateTask(() => {
    tasksData.refetch();
  });
  
  const updateTask = useUpdateTask(() => {
    tasksData.refetch();
  });
  
  const deleteTask = useDeleteTask(() => {
    tasksData.refetch();
  });
  
  const toggleStatus = useToggleTaskStatus(() => {
    tasksData.refetch();
  });

  // Computed values
  const taskStats = useMemo(() => {
    const total = tasksData.tasks.length;
    const completed = tasksData.tasks.filter(t => t.status === 'done').length;
    const inProgress = tasksData.tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasksData.tasks.filter(t => t.status === 'todo').length;
    const highPriority = tasksData.tasks.filter(t => t.priority === 'high').length;
    
    return {
      total,
      completed,
      inProgress,
      todo,
      highPriority,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [tasksData.tasks]);

  // Sort tasks: completed tasks at bottom, then by priority and status
  const sortedTasks = useMemo(() => {
    return [...tasksData.tasks].sort((a, b) => {
      // First, separate completed from uncompleted
      // Status order: in_progress > todo > done (done always at bottom)
      const statusOrder = { in_progress: 0, todo: 1, done: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Within same status, sort by priority: high > medium > low
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasksData.tasks]);

  return {
    // Data
    tasks: sortedTasks,
    taskStats,
    loading: tasksData.loading,
    error: tasksData.error,
    
    // Actions
    createTask: createTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
    toggleStatus: toggleStatus.mutate,
    refetch: tasksData.refetch,
    
    // Loading states
    isCreating: createTask.loading,
    isUpdating: updateTask.loading,
    isDeleting: deleteTask.loading,
    isToggling: toggleStatus.loading,
  };
}

/**
 * Hook for filtering and searching tasks
 */
export function useTaskFilters(tasks: Task[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !task.notes?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  return {
    filteredTasks,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    clearFilters: () => {
      setSearchQuery('');
      setStatusFilter('all');
      setPriorityFilter('all');
    },
  };
}