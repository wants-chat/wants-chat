import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/landing/Header';
import CategorySidebar, { QuickFilter } from '../components/todo1/CategorySidebar';
import Modal from '../components/todo1/Modal';
import CategoryForm from '../components/todo1/CategoryForm';
import TaskForm from '../components/todo1/TaskForm';
import { Category, Task } from '../types/todo1';
import { useCategoryManager } from '../hooks/todo1/useCategories';
import { useTaskManager } from '../hooks/todo1/useTasks';
import { taskApi } from '../services/todo1Api';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';

const Todo1Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Quick filter state
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allTasksLoading, setAllTasksLoading] = useState(false);

  // Use API hooks instead of local state
  const categoryManager = useCategoryManager();
  const taskManager = useTaskManager(categoryManager.selectedCategoryId);

  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch all tasks - both on mount and when quick filter changes
  const fetchAllTasks = async () => {
    setAllTasksLoading(true);
    try {
      const tasks = await taskApi.getAllTasks();
      setAllTasks(Array.isArray(tasks) ? tasks : []);
    } catch (error) {
      console.error('Failed to fetch all tasks:', error);
      setAllTasks([]);
    } finally {
      setAllTasksLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Refetch when quick filter is activated or tasks change
  useEffect(() => {
    if (quickFilter) {
      fetchAllTasks();
    }
  }, [quickFilter]);

  // Refetch when category tasks change (to update counts)
  useEffect(() => {
    if (taskManager.tasks.length >= 0) {
      fetchAllTasks();
    }
  }, [taskManager.tasks.length]);

  // Calculate task counts for sidebar
  const taskCounts = useMemo(() => {
    return {
      all: allTasks.length,
      inProgress: allTasks.filter(t => t.status === 'in_progress').length,
      completed: allTasks.filter(t => t.status === 'done').length,
    };
  }, [allTasks]);

  // Filter tasks based on quick filter
  const filteredTasks = useMemo(() => {
    if (!quickFilter) return taskManager.tasks;

    switch (quickFilter) {
      case 'all':
        return allTasks;
      case 'in_progress':
        return allTasks.filter(t => t.status === 'in_progress');
      case 'completed':
        return allTasks.filter(t => t.status === 'done');
      default:
        return taskManager.tasks;
    }
  }, [quickFilter, allTasks, taskManager.tasks]);

  // Get selected category name
  const selectedCategory = categoryManager.categories.find(
    c => c.id === categoryManager.selectedCategoryId
  );

  // Get display title based on filter
  const getDisplayTitle = () => {
    if (quickFilter === 'all') return 'All Tasks';
    if (quickFilter === 'in_progress') return 'In Progress';
    if (quickFilter === 'completed') return 'Completed';
    return selectedCategory?.name || null;
  };

  // Category Handlers
  const handleOpenCategoryModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };
  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };
  const handleCategorySubmit = async (categoryData: Partial<Category>) => {
    try {
      if (editingCategory) {
        await categoryManager.updateCategory(editingCategory.id, categoryData);
      } else {
        await categoryManager.createCategory(categoryData as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>);
      }
      handleCloseCategoryModal();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };
  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryManager.deleteCategory(id);
      // Auto-select another category if the deleted one was selected
      if (categoryManager.selectedCategoryId === id && categoryManager.categories.length > 1) {
        const remainingCategories = categoryManager.categories.filter(c => c.id !== id);
        if (remainingCategories.length > 0) {
          categoryManager.selectCategory(remainingCategories[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  // Task Handlers
  const handleOpenTaskModal = (task: Task | null = null) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };
  const handleCloseTaskModal = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
  };
  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    if (!categoryManager.selectedCategoryId) return;

    try {
      if (editingTask) {
        await taskManager.updateTask(editingTask.id, taskData);
      } else {
        await taskManager.createTask({
          ...taskData,
          categoryId: categoryManager.selectedCategoryId,
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          isActive: true,
        } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
      }
      handleCloseTaskModal();
      // Refresh all tasks count
      await fetchAllTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };
  const handleDeleteTask = async (id: string) => {
    try {
      await taskManager.deleteTask(id);
      // Refresh all tasks count
      await fetchAllTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await taskManager.updateTask(id, { status: 'done' });
      // Refresh all tasks count
      await fetchAllTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  // Handle inline task submission (no modal)
  const handleInlineTaskSubmit = async (taskData: Partial<Task>) => {
    if (!categoryManager.selectedCategoryId && !quickFilter) return;

    try {
      // If in quick filter mode, we need a category
      if (quickFilter && !taskData.categoryId) {
        // Use first category as default
        if (categoryManager.categories.length > 0) {
          taskData.categoryId = categoryManager.categories[0].id;
        } else {
          throw new Error('Please create a category first');
        }
      }

      await taskManager.createTask({
        ...taskData,
        categoryId: taskData.categoryId || categoryManager.selectedCategoryId!,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        isActive: true,
      } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);

      // Refresh all tasks count
      await fetchAllTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  // Handle inline task update
  const handleInlineTaskUpdate = async (id: string, taskData: Partial<Task>) => {
    try {
      await taskManager.updateTask(id, taskData);
      // Refresh all tasks count
      await fetchAllTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        tasks: filteredTasks,
        selectedCategoryId: quickFilter ? 'quick-filter' : categoryManager.selectedCategoryId,
        selectedCategoryName: getDisplayTitle(),
        onAddTask: () => handleOpenTaskModal(),
        onEditTask: handleOpenTaskModal,
        onDeleteTask: handleDeleteTask,
        onCompleteTask: handleCompleteTask,
        onSubmitTask: handleInlineTaskSubmit,
        onUpdateTask: handleInlineTaskUpdate,
        loading: quickFilter ? allTasksLoading : taskManager.loading,
        error: taskManager.error,
        isQuickFilter: !!quickFilter,
        categoriesLoading: categoryManager.loading,
      } as any);
    }
    return child;
  });

  return (
    <div className="flex flex-col h-screen relative">
      <BackgroundEffects variant="default" />
      <Header />
      <div className="flex flex-1 overflow-hidden relative z-20">
        <CategorySidebar
          categories={categoryManager.categories}
          onSelectCategory={categoryManager.selectCategory}
          onAddCategory={() => handleOpenCategoryModal()}
          onEditCategory={handleOpenCategoryModal}
          onDeleteCategory={handleDeleteCategory}
          selectedCategoryId={categoryManager.selectedCategoryId}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
          taskCounts={taskCounts}
          loading={categoryManager.loading}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative z-10">
          {childrenWithProps}
        </main>
      </div>
      <Modal isOpen={isCategoryModalOpen} onClose={handleCloseCategoryModal} title={editingCategory ? 'Edit Category' : 'Add Category'}>
        <CategoryForm onSubmit={handleCategorySubmit} category={editingCategory} />
      </Modal>
      <Modal isOpen={isTaskModalOpen} onClose={handleCloseTaskModal} title={editingTask ? 'Edit Task' : 'Add Task'}>
        <TaskForm onSubmit={handleTaskSubmit} task={editingTask} />
      </Modal>
    </div>
  );
};

export default Todo1Layout;
