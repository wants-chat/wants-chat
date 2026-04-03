/**
 * Todo management hooks
 */

import { useCallback, useState } from 'react';
import { api } from '../lib/api';
import { useApi, useMutation, usePaginatedApi } from './useApi';

// Define Todo-related types
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  listId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoQuery {
  listId?: string;
  completed?: boolean;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  filter?: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: Record<string, number>;
  byList: Record<string, number>;
}

// Types
export interface CreateTodoListData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateTodoListData extends Partial<CreateTodoListData> {}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  listId?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateTodoData extends Partial<CreateTodoData> {
  completed?: boolean;
}

// Todo List hooks

/**
 * Get all todo lists for the current user
 */
export function useTodoLists() {
  return useApi<TodoList[]>(() => api.getTodoLists(), {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Create a new todo list
 */
export function useCreateTodoList() {
  return useMutation<TodoList, CreateTodoListData>(
    (data) => api.createTodoList(data),
    {
      onSuccess: (data) => {
        console.log('Todo list created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create todo list:', error);
      },
    }
  );
}

/**
 * Update a todo list
 */
export function useUpdateTodoList() {
  return useMutation<TodoList, { id: string; data: UpdateTodoListData }>(
    ({ id, data }) => api.updateTodoList(id, data),
    {
      onSuccess: (data) => {
        console.log('Todo list updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update todo list:', error);
      },
    }
  );
}

/**
 * Delete a todo list
 */
export function useDeleteTodoList() {
  return useMutation<void, string>(
    (id) => api.deleteTodoList(id),
    {
      onSuccess: () => {
        console.log('Todo list deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete todo list:', error);
      },
    }
  );
}

// Todo hooks

/**
 * Get todos with filtering and pagination
 */
export function useTodos(query: TodoQuery) {
  return usePaginatedApi(
    useCallback(
      ({ page, limit }) => api.getTodos({ ...query, page, limit }),
      [query]
    ),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Get all todos for the current user (across all lists)
 */
export function useAllTodos(query: Omit<TodoQuery, 'listId'>) {
  return useTodos(query);
}

/**
 * Get a single todo by ID
 */
export function useTodo(id: string) {
  return useApi<Todo>(() => api.request(`/todos/${id}`), {
    refetchOnMount: true,
  });
}

/**
 * Create a new todo
 */
export function useCreateTodo() {
  return useMutation<Todo, CreateTodoData>(
    (data) => api.createTodo(data),
    {
      onSuccess: (data) => {
        console.log('Todo created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create todo:', error);
      },
    }
  );
}

/**
 * Update a todo
 */
export function useUpdateTodo() {
  return useMutation<Todo, { id: string; data: UpdateTodoData }>(
    ({ id, data }) => api.updateTodo(id, data),
    {
      onSuccess: (data) => {
        console.log('Todo updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update todo:', error);
      },
    }
  );
}

/**
 * Delete a todo
 */
export function useDeleteTodo() {
  return useMutation<void, string>(
    (id) => api.deleteTodo(id),
    {
      onSuccess: () => {
        console.log('Todo deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete todo:', error);
      },
    }
  );
}

/**
 * Toggle a todo's completion status
 */
export function useToggleTodo() {
  return useMutation<Todo, string>(
    (id) => api.request(`/todos/${id}/toggle`, { method: 'POST', body: JSON.stringify({}) }),
    {
      onSuccess: (data) => {
        console.log('Todo toggled successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to toggle todo:', error);
      },
    }
  );
}

/**
 * Reorder todos
 */
export function useReorderTodos() {
  return useMutation<void, { listId?: string; todoIds: string[] }>(
    (data) => api.request('/todos/reorder', { method: 'POST', body: JSON.stringify(data) }),
    {
      onSuccess: () => {
        console.log('Todos reordered successfully');
      },
      onError: (error) => {
        console.error('Failed to reorder todos:', error);
      },
    }
  );
}

/**
 * Upload an attachment to a todo
 */
export function useUploadAttachment() {
  return useMutation<any, { todoId: string; file: File }>(
    ({ todoId, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.request(`/todos/${todoId}/attachment`, {
        method: 'POST',
        body: formData,
      });
    },
    {
      onSuccess: (data) => {
        console.log('Attachment uploaded successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to upload attachment:', error);
      },
    }
  );
}


// Utility hooks

/**
 * Combined hook for todo actions
 */
export function useTodoActions() {
  const toggleTodo = useToggleTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  return {
    toggle: toggleTodo.mutate,
    update: updateTodo.mutate,
    delete: deleteTodo.mutate,
    isToggling: toggleTodo.loading,
    isUpdating: updateTodo.loading,
    isDeleting: deleteTodo.loading,
  };
}

/**
 * Hook for managing todo list actions
 */
export function useTodoListActions() {
  const updateList = useUpdateTodoList();
  const deleteList = useDeleteTodoList();

  return {
    update: updateList.mutate,
    delete: deleteList.mutate,
    isUpdating: updateList.loading,
    isDeleting: deleteList.loading,
  };
}

/**
 * Hook for todo statistics
 */
export function useTodoStats() {
  return useApi<TodoStats>(() => api.request('/todos/statistics'), {
    refetchOnMount: true,
  });
}

/**
 * Get available todo categories
 */
export function useTodoCategories() {
  return useApi<string[]>(() => api.request('/todos/categories/list'));
}

/**
 * Get available priority levels
 */
export function useTodoPriorities() {
  return useApi<string[]>(() => api.request('/todos/priorities/list'));
}

/**
 * Hook to manage todo query state
 */
export function useTodoQuery(initialQuery: TodoQuery = {}) {
  const [query, setQuery] = useState<TodoQuery>(initialQuery);

  const setSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setQuery((prev: TodoQuery) => ({ ...prev, sortBy, sortOrder }));
  };

  const setFilter = (filter: string) => {
    setQuery((prev: TodoQuery) => ({ ...prev, filter, page: 1 }));
  };

  const setPage = (page: number) => {
    setQuery((prev: TodoQuery) => ({ ...prev, page }));
  };

  return [query, setQuery, { setSort, setFilter, setPage }];
}
