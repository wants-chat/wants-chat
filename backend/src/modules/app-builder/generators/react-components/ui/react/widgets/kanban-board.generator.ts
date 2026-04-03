import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateKanbanBoard = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'sprint' | 'progress' = 'standard'
) => {
  const dataSource = resolved.dataSource;
  
  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming
  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const variants = {
    standard: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, MoreVertical, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  tags: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

interface KanbanProps {
  ${dataName}?: any;
  className?: string;
  onTaskClick?: (task: Task, columnId: string) => void;
  onAddTask?: (columnId: string) => void;
  onTaskMenu?: (task: Task, columnId: string) => void;
}

export default function Kanban({ ${dataName}: propData, className, onTaskClick, onAddTask, onTaskMenu }: KanbanProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const kanbanData = ${dataName} || {};
  
  const pageTitle = ${getField('pageTitle')};
  const pageDescription = ${getField('pageDescription')};
  const addTaskText = ${getField('addTaskText')};
  const columns = ${getField('standardColumns')};
  
  const [boardColumns] = useState<Column[]>(columns);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleTaskClick = (task: Task, columnId: string) => {
    if (onTaskClick) {
      onTaskClick(task, columnId);
    } else {
      console.log('Task clicked:', task.title, 'in column:', columnId);
    }
  };

  const handleAddTask = (columnId: string) => {
    if (onAddTask) {
      onAddTask(columnId);
    } else {
      console.log('Add task clicked for column:', columnId);
    }
  };

  const handleTaskMenu = (e: React.MouseEvent, task: Task, columnId: string) => {
    e.stopPropagation();
    if (onTaskMenu) {
      onTaskMenu(task, columnId);
    } else {
      console.log('Task menu clicked:', task.title);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {pageTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {pageDescription}
          </p>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {boardColumns.map((column: Column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={cn('rounded-t-xl p-4 border-b-2', column.color)}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h2>
                  <span className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
                <button 
                  onClick={() => handleAddTask(column.id)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {addTaskText}
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-b-xl p-4 space-y-3">
                {column.tasks.map((task: Task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task, column.id)}
                    className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {task.title}
                      </h3>
                      <button 
                        onClick={(e) => handleTaskMenu(e, task, column.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {task.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs px-2 py-1 rounded font-medium', getPriorityColor(task.priority))}>
                          {task.priority}
                        </span>
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {task.assignee.charAt(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
    `,

    sprint: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Clock, MessageSquare, Paperclip, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  comments: number;
  attachments: number;
  dueDate: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanProps {
  ${dataName}?: any;
  className?: string;
  onNewTask?: () => void;
  onTaskClick?: (task: Task, columnId: string) => void;
  onAddColumnTask?: (columnId: string) => void;
}

export default function Kanban({ ${dataName}: propData, className, onNewTask, onTaskClick, onAddColumnTask }: KanbanProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const kanbanData = ${dataName} || {};

  const sprintTitle = ${getField('sprintTitle')};
  const sprintSubtitle = ${getField('sprintSubtitle')};
  const newTaskText = ${getField('newTaskText')};
  const columns = ${getField('sprintColumns')};
  
  const [boardColumns] = useState<Column[]>(columns);

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleNewTask = () => {
    if (onNewTask) {
      onNewTask();
    } else {
      console.log('New task button clicked');
    }
  };

  const handleTaskClick = (task: Task, columnId: string) => {
    if (onTaskClick) {
      onTaskClick(task, columnId);
    } else {
      console.log('Task clicked:', task.title, 'in column:', columnId);
    }
  };

  const handleAddColumnTask = (columnId: string) => {
    if (onAddColumnTask) {
      onAddColumnTask(columnId);
    } else {
      console.log('Add task to column:', columnId);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {sprintTitle}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sprintSubtitle}
              </p>
            </div>
            <button 
              onClick={handleNewTask}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {newTaskText}
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {boardColumns.map((column: Column) => (
            <div
              key={column.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h2>
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
                <button 
                  onClick={() => handleAddColumnTask(column.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {column.tasks.map((task: Task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task, column.id)}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-gray-600 group"
                  >
                    <div className="flex items-start gap-2 mb-3">
                      <div className={cn('w-2 h-2 rounded-full mt-2', getPriorityDot(task.priority))}></div>
                      <h3 className="flex-1 font-medium text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.dueDate}</span>
                        </div>
                        {task.comments > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{task.comments}</span>
                          </div>
                        )}
                        {task.attachments > 0 && (
                          <div className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            <span>{task.attachments}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex -space-x-2">
                        {task.assignees.map((assignee: string, index: number) => (
                          <div
                            key={index}
                            className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-50 dark:border-gray-700"
                          >
                            {assignee}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
    `,

    progress: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, MoreHorizontal, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  category: string;
  subtasks: Subtask[];
  progress: number;
  avatar: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

interface KanbanProps {
  ${dataName}?: any;
  className?: string;
  onTaskClick?: (task: Task, columnId: string) => void;
  onSubtaskToggle?: (task: Task, subtask: Subtask, columnId: string) => void;
  onAddColumnTask?: (columnId: string) => void;
  onTaskMenu?: (task: Task, columnId: string) => void;
}

export default function Kanban({
  ${dataName}: propData,
  className,
  onTaskClick,
  onSubtaskToggle,
  onAddColumnTask,
  onTaskMenu
}: KanbanProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const kanbanData = ${dataName} || {};

  const timelineTitle = ${getField('timelineTitle')};
  const timelineDescription = ${getField('timelineDescription')};
  const columns = ${getField('progressColumns')};
  
  const [boardColumns] = useState<Column[]>(columns);

  const handleTaskClick = (task: Task, columnId: string) => {
    if (onTaskClick) {
      onTaskClick(task, columnId);
    } else {
      console.log('Task clicked:', task.title, 'in column:', columnId);
    }
  };

  const handleSubtaskToggle = (e: React.MouseEvent, task: Task, subtask: Subtask, columnId: string) => {
    e.stopPropagation();
    if (onSubtaskToggle) {
      onSubtaskToggle(task, subtask, columnId);
    } else {
      console.log('Subtask toggled:', subtask.title, 'completed:', subtask.completed);
    }
  };

  const handleAddColumnTask = (columnId: string) => {
    if (onAddColumnTask) {
      onAddColumnTask(columnId);
    } else {
      console.log('Add task to column:', columnId);
    }
  };

  const handleTaskMenu = (e: React.MouseEvent, task: Task, columnId: string) => {
    e.stopPropagation();
    if (onTaskMenu) {
      onTaskMenu(task, columnId);
    } else {
      console.log('Task menu clicked:', task.title);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-900 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {timelineTitle}
          </h1>
          <p className="text-gray-400">
            {timelineDescription}
          </p>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {boardColumns.map((column: Column) => (
            <div key={column.id}>
              {/* Column Header */}
              <div className={cn('bg-gradient-to-r rounded-t-xl p-4', column.color)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-white text-lg">
                      {column.title}
                    </h2>
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {column.tasks.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleAddColumnTask(column.id)}
                    className="text-white hover:bg-white/20 p-1 rounded transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tasks Container */}
              <div className="bg-gray-800 rounded-b-xl p-4 space-y-4 min-h-[200px]">
                {column.tasks.map((task: Task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task, column.id)}
                    className="bg-gray-700 rounded-xl p-4 hover:bg-gray-650 transition-colors cursor-pointer border border-gray-600"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span className="text-xs text-gray-400 font-medium">
                          {task.category}
                        </span>
                        <h3 className="font-semibold text-white mt-1">
                          {task.title}
                        </h3>
                      </div>
                      <button 
                        onClick={(e) => handleTaskMenu(e, task, column.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-2 mb-4">
                      {task.subtasks.map((subtask: Subtask) => (
                        <div 
                          key={subtask.id} 
                          onClick={(e) => handleSubtaskToggle(e, task, subtask, column.id)}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-600 p-1 rounded"
                        >
                          <CheckCircle2
                            className={cn(
                              'w-4 h-4',
                              subtask.completed
                                ? 'text-green-500 fill-green-500'
                                : 'text-gray-500'
                            )}
                          />
                          <span
                            className={cn(
                              subtask.completed
                                ? 'text-gray-400 line-through'
                                : 'text-gray-300'
                            )}
                          >
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full bg-gradient-to-r transition-all',
                            column.color
                          )}
                          style={{ width: \`\${task.progress}%\` }}
                        ></div>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-end">
                      <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-semibold', column.color)}>
                        {task.avatar}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.standard;
};
