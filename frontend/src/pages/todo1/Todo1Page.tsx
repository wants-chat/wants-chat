// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Flag, ChevronDown, ChevronUp, Pencil, FolderOpen } from 'lucide-react';
import TaskList from '../../components/todo1/TaskList';
import { Task } from '../../types/todo1';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { GlassCard } from '../../components/ui/GlassCard';
import RichTextEditor from '../../components/ui/rich-text-editor';
import { toast } from '../../components/ui/sonner';

interface Todo1PageProps {
  tasks?: Task[];
  selectedCategoryId?: string | null;
  selectedCategoryName?: string | null;
  onAddTask?: (taskData?: Partial<Task>) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onCompleteTask?: (id: string) => void;
  onSubmitTask?: (taskData: Partial<Task>) => Promise<void>;
  onUpdateTask?: (id: string, taskData: Partial<Task>) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  isQuickFilter?: boolean;
  categoriesLoading?: boolean;
}

const Todo1Page: React.FC<Todo1PageProps> = ({
  tasks = [],
  selectedCategoryId = null,
  selectedCategoryName = null,
  onAddTask = () => {},
  onEditTask = () => {},
  onDeleteTask = () => {},
  onCompleteTask = () => {},
  onSubmitTask,
  onUpdateTask,
  loading = false,
  error = null,
  isQuickFilter = false,
  categoriesLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Task form state (used for both add and edit)
  const [taskForm, setTaskForm] = useState({
    title: '',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in_progress' | 'done',
  });

  // Filter and sort tasks (newest first)
  const filteredTasks = useMemo(() => {
    // Sort tasks by createdAt descending (newest first)
    const sortedTasks = [...tasks].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    if (!searchQuery.trim()) {
      return sortedTasks;
    }

    const query = searchQuery.toLowerCase();
    return sortedTasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.notes?.toLowerCase().includes(query) ||
      task.status.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleStartAddTask = () => {
    setEditingTaskId(null);
    setIsAddingTask(true);
    setTaskForm({
      title: '',
      notes: '',
      priority: 'medium',
      status: 'todo',
    });
  };

  const handleStartEditTask = (task: Task) => {
    setIsAddingTask(false);
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      notes: task.notes || '',
      priority: task.priority,
      status: task.status,
    });
  };

  const handleCancelForm = () => {
    setIsAddingTask(false);
    setEditingTaskId(null);
    setShowAdvanced(false);
    setTaskForm({
      title: '',
      notes: '',
      priority: 'medium',
      status: 'todo',
    });
  };

  const handleSubmitForm = async () => {
    if (!taskForm.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      if (editingTaskId) {
        // Update existing task
        if (onUpdateTask) {
          await onUpdateTask(editingTaskId, taskForm);
          toast.success('Task updated successfully!');
        }
      } else {
        // Create new task
        if (onSubmitTask) {
          await onSubmitTask(taskForm);
        } else {
          onAddTask(taskForm);
        }
        toast.success('Task created successfully!');
      }
      handleCancelForm();
    } catch (err) {
      toast.error(editingTaskId ? 'Failed to update task' : 'Failed to create task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-white/50';
    }
  };

  const isFormOpen = isAddingTask || editingTaskId !== null;

  // Show loading while categories are being fetched (auto-select will happen)
  if (categoriesLoading) {
    return (
      <div className="relative max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400"></div>
        </div>
      </div>
    );
  }

  // If no category is selected and not in quick filter mode, show a message
  if (!selectedCategoryId && !isQuickFilter) {
    return (
      <div className="relative max-w-4xl mx-auto">
        <GlassCard className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
            <FolderOpen className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Select a Category
          </h2>
          <p className="text-white/60 max-w-md mx-auto">
            Choose a category from the sidebar to view and manage your tasks.
            Each task belongs to a specific category to keep things organized.
          </p>
        </GlassCard>
      </div>
    );
  }

  // Check if we can add tasks (allow in quick filter mode too - will use first category)
  const canAddTasks = selectedCategoryId;

  return (
    <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {selectedCategoryName || 'Tasks'}
            </h1>
            <p className="text-sm text-white/60 mt-1">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} {isQuickFilter ? 'total' : 'in this category'}
            </p>
          </div>
          {!isFormOpen && canAddTasks && (
            <Button
              onClick={handleStartAddTask}
              disabled={loading}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>

        {/* Inline Task Form (Add/Edit) */}
        {isFormOpen && (
          <GlassCard className="mb-6">
            {/* Form Header */}
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/20">
              {editingTaskId ? (
                <>
                  <Pencil className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-medium text-white/60">
                    Editing Task
                  </span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-medium text-white/60">
                    New Task
                  </span>
                </>
              )}
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="What needs to be done?"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="text-lg font-medium border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-teal-400 bg-transparent text-white placeholder:text-white/40"
                autoFocus
              />
            </div>

            {/* Rich Text Editor for Notes */}
            <div className="mb-4">
              <Label className="text-sm text-white/60 mb-2 block">Notes</Label>
              <RichTextEditor
                content={taskForm.notes}
                onChange={(content) => setTaskForm({ ...taskForm, notes: content })}
                placeholder="Add details, links, or checklist..."
              />
            </div>

            {/* Quick Options Row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Priority Select */}
              <div className="flex items-center gap-2">
                <Flag className={`h-4 w-4 ${getPriorityColor(taskForm.priority)}`} />
                <Select
                  value={taskForm.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => setTaskForm({ ...taskForm, priority: value })}
                >
                  <SelectTrigger className="w-[120px] h-9 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Low
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        High
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Select */}
              <Select
                value={taskForm.status}
                onValueChange={(value: 'todo' | 'in_progress' | 'done') => setTaskForm({ ...taskForm, status: value })}
              >
                <SelectTrigger className="w-[140px] h-9 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              {/* Toggle Advanced */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-white/60 hover:text-white"
              >
                {showAdvanced ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Less options
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    More options
                  </>
                )}
              </Button>
            </div>

            {/* Advanced Options (Expandable) */}
            {showAdvanced && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/40">
                  Additional options like due date, tags, and subtasks coming soon...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-white/20">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelForm}
                className="border border-white/20 text-white/80 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitForm}
                disabled={!taskForm.title.trim()}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              >
                {editingTaskId ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/40" />
            </div>
            <Input
              type="text"
              placeholder="Search tasks by title, notes, status, or priority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/40"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-2 text-sm text-white/60">
              {filteredTasks.length === 0
                ? `No tasks found matching "${searchQuery}"`
                : `${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'} found${tasks.length !== filteredTasks.length ? ` out of ${tasks.length}` : ''}`
              }
            </div>
          )}
        </div>

        {error && (
          <GlassCard className="mb-4 border-red-500/50">
            <p className="text-red-400">Error: {error}</p>
          </GlassCard>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : tasks.length === 0 ? (
          <GlassCard className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <p className="text-white/60 mb-4">No tasks yet in this category</p>
            <Button
              onClick={handleStartAddTask}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              Create your first task
            </Button>
          </GlassCard>
        ) : filteredTasks.length === 0 && searchQuery ? (
          <GlassCard className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/60 mb-4">
              No tasks match your search criteria
            </p>
            <Button
              onClick={clearSearch}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Clear search
            </Button>
          </GlassCard>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEditTask={handleStartEditTask}
            onDeleteTask={onDeleteTask}
            onCompleteTask={onCompleteTask}
          />
        )}
    </div>
  );
};

export default Todo1Page;