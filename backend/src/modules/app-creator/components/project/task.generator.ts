/**
 * Task Component Generators
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

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Calendar, User, Tag, Clock, CheckCircle, Circle, Edit2, Trash2, MessageSquare, Paperclip } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  taskId?: string;
  className?: string;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ taskId: propId, className, onBack }) => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const taskId = propId || routeId;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<any>(null);

  const { data: task, isLoading } = useQuery({
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
      setIsEditing(false);
      toast.success('Task updated');
    },
    onError: () => toast.error('Failed to update task'),
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: () => api.put('${endpoint}/' + taskId, {
      completed: !task?.completed,
      status: task?.completed ? 'pending' : 'completed',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(task?.completed ? 'Task reopened' : 'Task completed');
    },
    onError: () => toast.error('Failed to update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete('${endpoint}/' + taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
      if (onBack) onBack();
      else navigate(-1);
    },
    onError: () => toast.error('Failed to delete task'),
  });

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Task not found</p>
        <button onClick={handleBack} className="mt-4 text-blue-600 hover:text-blue-700">
          Go back
        </button>
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditedTask(task);
                setIsEditing(true);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this task?')) {
                  deleteMutation.mutate();
                }
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => toggleCompleteMutation.mutate()}
            className="mt-1 flex-shrink-0"
          >
            {task.completed || task.status === 'completed' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400" />
            )}
          </button>
          <div className="flex-1">
            <h1 className={\`text-xl font-semibold text-gray-900 dark:text-white \${
              task.completed || task.status === 'completed' ? 'line-through text-gray-500' : ''
            }\`}>
              {task.title || task.name}
            </h1>
            {task.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-300">{task.description}</p>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {task.due_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Due:</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {task.assignee_name && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Assigned:</span>
              <span className="text-gray-900 dark:text-white">{task.assignee_name}</span>
            </div>
          )}
          {task.priority && (
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${priorityColors[task.priority] || priorityColors.medium}\`}>
                {task.priority}
              </span>
            </div>
          )}
          {task.estimated_hours && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Est:</span>
              <span className="text-gray-900 dark:text-white">{task.estimated_hours}h</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {task.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments
            </h3>
            <div className="flex flex-wrap gap-2">
              {task.attachments.map((file: any, i: number) => (
                <a
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  {file.name || 'Attachment'}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Comments section */}
        {task.comments && task.comments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({task.comments.length})
            </h3>
            <div className="space-y-4">
              {task.comments.map((comment: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {(comment.user_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user_name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTaskBoard(options: TaskOptions = {}): string {
  const { componentName = 'TaskBoard', endpoint = '/tasks' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, MoreHorizontal, Calendar, User, Heart, Cake, Camera, Music, Utensils, Car } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  projectId?: string;
  className?: string;
  stages?: Array<{ id: string; name: string; color?: string; icon?: string }>;
}

const defaultStages = [
  { id: 'todo', name: 'To Do', color: 'gray' },
  { id: 'in-progress', name: 'In Progress', color: 'blue' },
  { id: 'review', name: 'Review', color: 'yellow' },
  { id: 'done', name: 'Done', color: 'green' },
];

const weddingStages = [
  { id: 'planning', name: 'Planning', color: 'gray', icon: 'heart' },
  { id: 'booking', name: 'Booking', color: 'blue', icon: 'calendar' },
  { id: 'confirmed', name: 'Confirmed', color: 'purple', icon: 'check' },
  { id: 'completed', name: 'Completed', color: 'green', icon: 'cake' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  projectId,
  className,
  stages = defaultStages,
}) => {
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const { data: tasks, isLoading } = useQuery({
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
    onError: () => toast.error('Failed to move task'),
  });

  const getStageColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-100 dark:bg-gray-700',
      blue: 'bg-blue-100 dark:bg-blue-900/30',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
      purple: 'bg-purple-100 dark:bg-purple-900/30',
      green: 'bg-green-100 dark:bg-green-900/30',
      pink: 'bg-pink-100 dark:bg-pink-900/30',
      orange: 'bg-orange-100 dark:bg-orange-900/30',
    };
    return colors[color] || colors.gray;
  };

  const getHeaderColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'border-gray-300',
      blue: 'border-blue-500',
      yellow: 'border-yellow-500',
      purple: 'border-purple-500',
      green: 'border-green-500',
      pink: 'border-pink-500',
      orange: 'border-orange-500',
    };
    return colors[color] || colors.gray;
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'venue': return <Heart className="w-3 h-3 text-pink-500" />;
      case 'catering': return <Utensils className="w-3 h-3 text-orange-500" />;
      case 'photography': return <Camera className="w-3 h-3 text-purple-500" />;
      case 'music': return <Music className="w-3 h-3 text-blue-500" />;
      case 'transportation': return <Car className="w-3 h-3 text-gray-500" />;
      case 'cake': return <Cake className="w-3 h-3 text-pink-500" />;
      default: return null;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId') || draggedItem;
    if (taskId) {
      updateStageMutation.mutate({ id: taskId, stage: stageId });
      setDraggedItem(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getTasksByStage = (stageId: string) =>
    tasks?.filter((task: any) => task.stage === stageId || task.status === stageId) || [];

  return (
    <div className={\`overflow-x-auto \${className || ''}\`}>
      <div className="flex gap-4 min-w-max p-4">
        {stages.map((stage) => {
          const stageTasks = getTasksByStage(stage.id);

          return (
            <div
              key={stage.id}
              className="w-72 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className={\`rounded-t-lg p-3 border-t-4 \${getHeaderColor(stage.color || 'gray')} \${getStageColor(stage.color || 'gray')}\`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                  <span className="text-sm text-gray-500">{stageTasks.length}</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-b-lg p-2 min-h-[400px] space-y-2">
                {stageTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('taskId', task.id);
                      setDraggedItem(task.id);
                    }}
                    onDragEnd={() => setDraggedItem(null)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {task.title || task.name}
                      </h4>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {task.category && (
                      <div className="flex items-center gap-1 mb-2">
                        {getCategoryIcon(task.category)}
                        <span className="text-xs text-gray-500">{task.category}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.assignee_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignee_name}
                        </span>
                      )}
                    </div>

                    {task.budget && (
                      <p className="mt-2 text-sm font-medium text-green-600">
                        \${task.budget.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
                <button className="w-full p-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add task
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

export function generateTaskListWedding(options: TaskOptions = {}): string {
  const { componentName = 'TaskListWedding', endpoint = '/tasks' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Circle, Calendar, Heart, Cake, Camera, Music, Utensils, Car, MapPin, DollarSign, Filter, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  weddingId?: string;
  className?: string;
}

const categories = [
  { id: 'venue', name: 'Venue', icon: MapPin, color: 'pink' },
  { id: 'catering', name: 'Catering', icon: Utensils, color: 'orange' },
  { id: 'photography', name: 'Photography', icon: Camera, color: 'purple' },
  { id: 'music', name: 'Music & Entertainment', icon: Music, color: 'blue' },
  { id: 'flowers', name: 'Flowers & Decor', icon: Heart, color: 'pink' },
  { id: 'cake', name: 'Cake & Desserts', icon: Cake, color: 'yellow' },
  { id: 'transportation', name: 'Transportation', icon: Car, color: 'gray' },
  { id: 'attire', name: 'Attire & Beauty', icon: Heart, color: 'pink' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ weddingId, className }) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories.map(c => c.id));

  const { data: tasks, isLoading } = useQuery({
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
    onError: () => toast.error('Failed to update task'),
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

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

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className={\`\${className || ''}\`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {getCompletedCount()} / {tasks?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                \${getTotalBudget().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Spent</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                \${getSpentBudget().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filter by:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-pink-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">Show completed</span>
          </label>
        </div>
      </div>

      {/* Task List by Category */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryTasks = getTasksByCategory(category.id);
          const isExpanded = expandedCategories.includes(category.id);
          const CategoryIcon = category.icon;

          if (selectedCategory && selectedCategory !== category.id) return null;
          if (categoryTasks.length === 0 && !selectedCategory) return null;

          return (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={\`w-8 h-8 rounded-lg flex items-center justify-center \${getCategoryColor(category.color)}\`}>
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                  <span className="text-sm text-gray-500">({categoryTasks.length})</span>
                </div>
                <ChevronDown className={\`w-5 h-5 text-gray-400 transition-transform \${isExpanded ? 'rotate-180' : ''}\`} />
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {categoryTasks.length > 0 ? (
                    categoryTasks.map((task: any) => (
                      <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleTaskMutation.mutate({
                              id: task.id,
                              completed: !(task.completed || task.status === 'completed'),
                            })}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {task.completed || task.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-pink-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={\`text-gray-900 dark:text-white \${
                              task.completed || task.status === 'completed' ? 'line-through text-gray-500' : ''
                            }\`}>
                              {task.title || task.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                              {task.due_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}
                              {task.vendor_name && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {task.vendor_name}
                                </span>
                              )}
                              {task.budget && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <DollarSign className="w-3 h-3" />
                                  {task.budget.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No tasks in this category
                    </div>
                  )}
                </div>
              )}
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
