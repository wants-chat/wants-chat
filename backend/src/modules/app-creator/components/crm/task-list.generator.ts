/**
 * Task List Component Generator
 *
 * Generates a task list with status management and filtering.
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

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Circle, Clock, Plus, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  showFilters?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, showFilters = true }) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.put('${endpoint}/' + id, { completed, status: completed ? 'completed' : 'pending' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => toast.error('Failed to update task'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const filteredTasks = tasks?.filter((task: any) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed || task.status === 'completed';
    return !task.completed && task.status !== 'completed';
  }) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">${title}</h3>
        <div className="flex items-center gap-2">
          {showFilters && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={\`px-3 py-1 text-sm rounded-md transition-colors \${
                    filter === f
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }\`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}
          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task: any) => (
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
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
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
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {task.priority && (
                      <span className={\`capitalize \${getPriorityColor(task.priority)}\`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            {filter === 'all' ? 'No tasks yet' : \`No \${filter} tasks\`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateNotesList(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'NotesList', endpoint = '/notes' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, StickyNote, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  entityType?: string;
  entityId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ entityType, entityId, className }) => {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');

  const queryKey = entityType && entityId ? ['notes', entityType, entityId] : ['notes'];

  const { data: notes, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let url = '${endpoint}';
      if (entityType && entityId) {
        url += \`?entity_type=\${entityType}&entity_id=\${entityId}\`;
      }
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => api.post('${endpoint}', {
      content,
      entity_type: entityType,
      entity_id: entityId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setNewNote('');
      toast.success('Note added');
    },
    onError: () => toast.error('Failed to add note'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Note deleted');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      createMutation.mutate(newNote.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          Notes
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200 dark:border-gray-700">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        <button
          type="submit"
          disabled={!newNote.trim() || createMutation.isPending}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </form>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {notes && notes.length > 0 ? (
          notes.map((note: any) => (
            <div key={note.id} className="p-4 group">
              <div className="flex items-start justify-between">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                <button
                  onClick={() => deleteMutation.mutate(note.id)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(note.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No notes yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
