'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Trash2,
  Check,
  Edit2,
  CheckCircle2,
  X,
  Calendar,
  Flag,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  createdAt?: string;
}

const TODO_COLUMNS = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'completed', header: 'Completed', type: 'boolean' },
];

const PRIORITIES = ['low', 'medium', 'high'] as const;
const CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Finance',
  'Learning',
  'Other',
];

interface TodoListToolProps {
  uiConfig?: UIConfig;
}

export const TodoListTool: React.FC<TodoListToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize useToolData hook
  const {
    data: items,
    addItem,
    updateItem,
    deleteItem,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    exportCSV,
    exportJSON,
    exportExcel,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    forceSync,
  } = useToolData<TodoItem>('todo-list', [], TODO_COLUMNS, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Local state for form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'pending'>('all');
  const [newItem, setNewItem] = useState<Omit<TodoItem, 'id'>>({
    title: '',
    description: '',
    completed: false,
    priority: 'medium',
    category: 'Other',
  });

  // Handle add/update
  const handleAddItem = () => {
    if (!newItem.title.trim()) return;

    if (editingId) {
      updateItem(editingId, newItem);
      setEditingId(null);
    } else {
      const item: TodoItem = {
        id: Date.now().toString(),
        ...newItem,
        createdAt: new Date().toISOString(),
      };
      addItem(item);
    }

    setNewItem({
      title: '',
      description: '',
      completed: false,
      priority: 'medium',
      category: 'Other',
    });
  };

  // Handle edit
  const handleEditItem = (item: TodoItem) => {
    setEditingId(item.id);
    setNewItem({
      title: item.title,
      description: item.description,
      completed: item.completed,
      priority: item.priority,
      category: item.category,
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setNewItem({
      title: '',
      description: '',
      completed: false,
      priority: 'medium',
      category: 'Other',
    });
  };

  // Toggle completed
  const handleToggleCompleted = (item: TodoItem) => {
    updateItem(item.id, { completed: !item.completed });
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const priorityMatch = filterPriority === 'all' || item.priority === filterPriority;
    const completedMatch =
      filterCompleted === 'all' ||
      (filterCompleted === 'completed' && item.completed) ||
      (filterCompleted === 'pending' && !item.completed);
    return priorityMatch && completedMatch;
  });

  // Calculate stats
  const totalItems = items.length;
  const completedItems = items.filter(item => item.completed).length;
  const pendingItems = totalItems - completedItems;
  const highPriorityItems = items.filter(item => item.priority === 'high' && !item.completed).length;

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDark ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50';
      case 'medium':
        return isDark ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50';
      case 'low':
        return isDark ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-50';
      default:
        return isDark ? 'text-gray-400 bg-gray-900/20' : 'text-gray-600 bg-gray-50';
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Flag className="w-3 h-3 text-red-500" />;
      case 'medium':
        return <Flag className="w-3 h-3 text-yellow-500" />;
      case 'low':
        return <Flag className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-8 flex items-center justify-center min-h-96`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.todoList.loadingTodoList', 'Loading todo list...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.todoList.todoList', 'Todo List')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.todoList.manageYourTasksAndStay', 'Manage your tasks and stay organized')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="todo-list" toolName="Todo List" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        {totalItems > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {totalItems}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.todoList.totalTasks', 'Total Tasks')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <div className={`text-xl font-bold text-green-500`}>
                {completedItems}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.todoList.completed', 'Completed')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
              <div className={`text-xl font-bold text-orange-500`}>
                {pendingItems}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.todoList.pending', 'Pending')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <div className={`text-xl font-bold text-red-500`}>
                {highPriorityItems}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.todoList.highPriority', 'High Priority')}</div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? t('tools.todoList.editTask', 'Edit Task') : t('tools.todoList.addNewTask', 'Add New Task')}
          </h4>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.todoList.taskTitle', 'Task Title *')}
              </label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder={t('tools.todoList.eGFinishProjectReport', 'e.g., Finish project report...')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.todoList.description', 'Description')}
              </label>
              <textarea
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder={t('tools.todoList.addMoreDetailsAboutThe', 'Add more details about the task...')}
                rows={2}
                className={`w-full px-4 py-2 rounded-lg border resize-none ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Priority, Category, Due Date */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.todoList.priority', 'Priority')}
                </label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.todoList.category', 'Category')}
                </label>
                <select
                  value={newItem.category || 'Other'}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.todoList.dueDate', 'Due Date')}
                </label>
                <input
                  type="date"
                  value={newItem.dueDate || ''}
                  onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                disabled={!newItem.title.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  newItem.title.trim()
                    ? isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                {editingId ? t('tools.todoList.updateTask', 'Update Task') : t('tools.todoList.addTask', 'Add Task')}
              </button>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        {totalItems > 0 && (
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.todoList.filterByPriority', 'Filter by Priority')}
              </label>
              <div className="flex gap-2">
                {(['all', 'low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filterPriority === p
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.todoList.filterByStatus', 'Filter by Status')}
              </label>
              <div className="flex gap-2">
                {(['all', 'pending', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterCompleted(s)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filterCompleted === s
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        {totalItems === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('tools.todoList.noTasksInYourTodo', 'No tasks in your todo list')}</p>
            <p className="text-sm">{t('tools.todoList.addYourFirstTaskAbove', 'Add your first task above to get started')}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>{t('tools.todoList.noTasksMatchYourFilters', 'No tasks match your filters')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.completed;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    item.completed
                      ? isDark
                        ? 'bg-gray-800 border-gray-700 opacity-60'
                        : 'bg-gray-100 border-gray-200 opacity-60'
                      : isDark
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleCompleted(item)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-green-500 border-green-500'
                          : isDark
                          ? 'border-gray-600 hover:border-green-400'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {item.completed && <Check className="w-4 h-4 text-white" />}
                    </button>

                    {/* Task Details */}
                    <div className="flex-1">
                      <div className={`font-medium ${item.completed ? 'line-through' : ''} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Priority Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {getPriorityBadge(item.priority)}
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>

                        {/* Category Badge */}
                        {item.category && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {item.category}
                          </span>
                        )}

                        {/* Due Date Badge */}
                        {item.dueDate && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isOverdue
                              ? isDark
                                ? 'bg-red-900/30 text-red-300'
                                : 'bg-red-100 text-red-700'
                              : isDark
                              ? 'bg-blue-900/30 text-blue-300'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className={`p-2 rounded transition-colors ${
                          isDark
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400'
                            : 'hover:bg-gray-200 text-gray-500 hover:text-blue-600'
                        }`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className={`p-2 rounded transition-colors ${
                          isDark
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                            : 'hover:bg-gray-200 text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Export Dropdown */}
        {totalItems > 0 && (
          <div className="flex gap-2 pt-4 border-t border-gray-700">
            <ExportDropdown
              onExportCSV={() => exportCSV()}
              onExportJSON={() => exportJSON()}
              onExportExcel={() => exportExcel()}
              onPrint={() => print('Todo List')}
              onCopyToClipboard={() => copyToClipboard('csv')}
              onImportCSV={importCSV}
              onImportJSON={importJSON}
              showImport={true}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoListTool;
