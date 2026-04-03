/**
 * Todo1 API Service Layer
 * Implements API endpoints from the design specification
 */

import { api } from '../lib/api';
import { Category, Task } from '../types/todo1';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Category API endpoints
export const categoryApi = {
  /**
   * Get all categories for the current user
   */
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.request('/todos/category');
    return response.data || response;
  },

  /**
   * Create a new category
   */
  createCategory: async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const response = await api.request('/todos/category', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  /**
   * Update an existing category
   */
  updateCategory: async (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category> => {
    const response = await api.request(`/todos/category/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  /**
   * Delete a category and all its tasks
   */
  deleteCategory: async (id: string): Promise<void> => {
    await api.request(`/todos/category/${id}`, {
      method: 'DELETE',
    });
  },
};

// Task API endpoints
export const taskApi = {
  /**
   * Get all tasks for a specific category
   */
  getTasksByCategory: async (categoryId: string): Promise<Task[]> => {
    const response = await api.request(`/todos/category/todos/${categoryId}`);
    return response.data || response;
  },

  /**
   * Get all tasks across all categories (optional)
   */
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.request('/todos');
    // Backend returns { todos: [...], pagination: {...} }
    if (response && Array.isArray(response.todos)) {
      return response.todos;
    }
    // Fallback for other structures
    if (Array.isArray(response)) {
      return response;
    }
    if (response && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  /**
   * Create a new task
   */
  createTask: async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const response = await api.request('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  /**
   * Update an existing task
   */
  updateTask: async (id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> => {
    const response = await api.request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: string): Promise<void> => {
    await api.request(`/todos/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle task status (helper method)
   */
  toggleTaskStatus: async (id: string, currentStatus: Task['status']): Promise<Task> => {
    const nextStatus = currentStatus === 'done' ? 'todo' : 
                      currentStatus === 'todo' ? 'in_progress' : 'done';
    
    return taskApi.updateTask(id, { status: nextStatus });
  },

  /**
   * Update task priority (helper method)
   */
  updateTaskPriority: async (id: string, priority: Task['priority']): Promise<Task> => {
    return taskApi.updateTask(id, { priority });
  },
};

// Combined API export for convenience
export const todo1Api = {
  categories: categoryApi,
  tasks: taskApi,
};

// Error handling wrapper
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    console.error(`${errorMessage}:`, error);
    throw new Error(error?.message || errorMessage);
  }
};

// Batch operations (for future use)
export const batchApi = {
  /**
   * Delete multiple tasks at once
   */
  deleteTasks: async (ids: string[]): Promise<void> => {
    await Promise.all(ids.map(id => taskApi.deleteTask(id)));
  },

  /**
   * Update multiple tasks at once
   */
  updateTasks: async (updates: { id: string; data: Partial<Task> }[]): Promise<Task[]> => {
    return Promise.all(
      updates.map(({ id, data }) => taskApi.updateTask(id, data))
    );
  },
};