/**
 * Wedding Task Component Generators
 *
 * Generates task board and task list components for wedding planning.
 */

export interface WeddingTaskOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTaskBoardWedding(options: WeddingTaskOptions = {}): string {
  const { componentName = 'TaskBoardWedding', endpoint = '/wedding/tasks' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  weddingId?: string;
}

const stages = [
  { id: 'todo', name: 'To Do', color: 'gray' },
  { id: 'in_progress', name: 'In Progress', color: 'blue' },
  { id: 'review', name: 'Review', color: 'yellow' },
  { id: 'completed', name: 'Completed', color: 'green' },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const categoryColors: Record<string, string> = {
  venue: 'border-l-purple-500',
  catering: 'border-l-orange-500',
  photography: 'border-l-blue-500',
  music: 'border-l-pink-500',
  flowers: 'border-l-rose-500',
  attire: 'border-l-cyan-500',
  invitations: 'border-l-amber-500',
  default: 'border-l-gray-500',
};

const ${componentName}: React.FC<${componentName}Props> = ({ className, weddingId }) => {
  const queryClient = useQueryClient();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

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
      toast.success('Task updated');
    },
    onError: () => toast.error('Failed to update task'),
  });

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (draggedTask) {
      updateTaskMutation.mutate({ id: draggedTask, status: stageId });
      setDraggedTask(null);
    }
  };

  const getStageColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-100 dark:bg-gray-700',
      blue: 'bg-blue-100 dark:bg-blue-900/30',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
      green: 'bg-green-100 dark:bg-green-900/30',
    };
    return colors[color] || colors.gray;
  };

  const getHeaderColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'border-gray-300',
      blue: 'border-blue-500',
      yellow: 'border-yellow-500',
      green: 'border-green-500',
    };
    return colors[color] || colors.gray;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getTasksByStage = (stageId: string) =>
    tasks?.filter((task: any) => task.status === stageId || task.stage === stageId) || [];

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className={\`overflow-x-auto \${className || ''}\`}>
      <div className="flex gap-4 min-w-max p-4">
        {stages.map((stage) => {
          const stageTasks = getTasksByStage(stage.id);

          return (
            <div
              key={stage.id}
              className="w-80 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className={\`rounded-t-lg p-3 border-t-4 \${getHeaderColor(stage.color)} \${getStageColor(stage.color)}\`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                  <span className="text-sm text-gray-500 bg-white dark:bg-gray-600 px-2 py-0.5 rounded-full">
                    {stageTasks.length}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-b-lg p-2 min-h-[400px] space-y-2">
                {stageTasks.map((task: any) => {
                  const categoryColor = categoryColors[task.category?.toLowerCase()] || categoryColors.default;
                  const taskOverdue = stage.id !== 'completed' && isOverdue(task.dueDate || task.due_date);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className={\`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 \${categoryColor} p-3 cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing\`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {task.title || task.name}
                          </h4>
                        </div>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {task.priority && (
                          <span className={\`text-xs px-2 py-0.5 rounded-full font-medium capitalize \${priorityColors[task.priority?.toLowerCase()] || priorityColors.low}\`}>
                            {task.priority}
                          </span>
                        )}
                        {task.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                            {task.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {(task.dueDate || task.due_date) && (
                          <div className={\`flex items-center gap-1 \${taskOverdue ? 'text-red-600' : ''}\`}>
                            {taskOverdue ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <Calendar className="w-3 h-3" />
                            )}
                            {new Date(task.dueDate || task.due_date).toLocaleDateString()}
                          </div>
                        )}
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.assignee}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button className="w-full p-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center gap-1 border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTaskListWedding(options: WeddingTaskOptions = {}): string {
  const { componentName = 'TaskListWedding', endpoint = '/wedding/tasks' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  User,
  Filter,
  Plus,
  ChevronDown,
  AlertCircle,
  Trash2,
  Edit2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  weddingId?: string;
  showFilters?: boolean;
}

const priorityOrder = { high: 0, medium: 1, low: 2 };

const ${componentName}: React.FC<${componentName}Props> = ({ className, weddingId, showFilters = true }) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'category'>('dueDate');

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
      toast.success('Task updated');
    },
    onError: () => toast.error('Failed to update task'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-tasks', weddingId] });
      toast.success('Task deleted');
    },
    onError: () => toast.error('Failed to delete task'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  };

  const categories = [...new Set((tasks || []).map((t: any) => t.category).filter(Boolean))];

  const filteredTasks = (tasks || [])
    .filter((task: any) => {
      const isCompleted = task.completed || task.status === 'completed';
      const taskOverdue = isOverdue(task.dueDate || task.due_date, isCompleted);

      if (filter === 'completed') return isCompleted;
      if (filter === 'pending') return !isCompleted;
      if (filter === 'overdue') return taskOverdue;
      return true;
    })
    .filter((task: any) => {
      if (categoryFilter === 'all') return true;
      return task.category?.toLowerCase() === categoryFilter.toLowerCase();
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'priority') {
        const aPriority = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] ?? 3;
        const bPriority = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] ?? 3;
        return aPriority - bPriority;
      }
      if (sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '');
      }
      const aDate = new Date(a.dueDate || a.due_date || '9999-12-31');
      const bDate = new Date(b.dueDate || b.due_date || '9999-12-31');
      return aDate.getTime() - bDate.getTime();
    });

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const completedCount = (tasks || []).filter((t: any) => t.completed || t.status === 'completed').length;
  const totalCount = (tasks || []).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header with Progress */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-rose-500" />
            Wedding Tasks
          </h3>
          <button className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-1 text-sm">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">{completedCount} of {totalCount} tasks completed</span>
            <span className="font-medium text-rose-600">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-rose-500 transition-all"
              style={{ width: \`\${progress}%\` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['all', 'pending', 'completed', 'overdue'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={\`px-3 py-1 text-sm rounded-md transition-colors capitalize \${
                  filter === f
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }\`}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      )}

      {/* Task List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task: any) => {
            const isCompleted = task.completed || task.status === 'completed';
            const taskOverdue = isOverdue(task.dueDate || task.due_date, isCompleted);

            return (
              <div
                key={task.id}
                className={\`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group \${isCompleted ? 'opacity-60' : ''}\`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskMutation.mutate({
                      id: task.id,
                      completed: !isCompleted,
                    })}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 hover:text-rose-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={\`font-medium \${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}\`}>
                          {task.title || task.name}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {(task.dueDate || task.due_date) && (
                        <span className={\`text-xs flex items-center gap-1 \${taskOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}\`}>
                          {taskOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                          {new Date(task.dueDate || task.due_date).toLocaleDateString()}
                          {taskOverdue && ' (Overdue)'}
                        </span>
                      )}
                      {task.priority && (
                        <span className={\`text-xs px-2 py-0.5 rounded-full capitalize \${getPriorityColor(task.priority)}\`}>
                          {task.priority}
                        </span>
                      )}
                      {task.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 capitalize">
                          {task.category}
                        </span>
                      )}
                      {task.assignee && (
                        <span className="text-xs flex items-center gap-1 text-gray-500">
                          <User className="w-3 h-3" />
                          {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            {filter === 'all' ? 'No tasks yet. Start planning your wedding!' :
             filter === 'overdue' ? 'No overdue tasks. Great job!' :
             \`No \${filter} tasks\`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
