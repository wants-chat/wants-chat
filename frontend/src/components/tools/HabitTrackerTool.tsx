'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Plus, Trash2, Edit2, Save, X, Target, Sparkles, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface HabitTrackerToolProps {
  uiConfig?: UIConfig;
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Column configuration for export
const habitColumns: ColumnConfig[] = [
  { key: 'name', header: 'Habit Name', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const defaultHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning Exercise',
    description: '30 minutes of physical activity',
    frequency: 'daily',
    category: 'Health',
    color: '#ef4444',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Reading',
    description: 'Read for 30 minutes',
    frequency: 'daily',
    category: 'Learning',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Meditation',
    description: '10 minutes mindfulness',
    frequency: 'daily',
    category: 'Wellness',
    color: '#8b5cf6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const CATEGORIES = ['Health', 'Learning', 'Wellness', 'Productivity', 'Social', 'Personal'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export const HabitTrackerTool: React.FC<HabitTrackerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use useToolData hook for backend sync
  const {
    data: habits,
    addItem: addHabit,
    updateItem: updateHabit,
    deleteItem: deleteHabit,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    isLoading,
  } = useToolData<Habit>('habit-tracker', defaultHabits, habitColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily' as const,
    category: 'Health',
    color: COLORS[0],
  });

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title) {
        setFormData(prev => ({
          ...prev,
          name: params.title || prev.name,
        }));
        setShowForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filter habits
  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (habit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [habits, searchTerm, selectedCategory]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalHabits: habits.length,
      byCategory: habits.reduce((acc, h) => {
        acc[h.category] = (acc[h.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byFrequency: habits.reduce((acc, h) => {
        acc[h.frequency] = (acc[h.frequency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [habits]);

  // Handle form submission
  const handleSaveHabit = () => {
    if (!formData.name.trim()) return;

    const now = new Date().toISOString();
    if (editingHabit) {
      updateHabit(editingHabit.id, {
        ...formData,
        updatedAt: now,
      });
    } else {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      addHabit(newHabit);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'daily',
      category: 'Health',
      color: COLORS[0],
    });
    setEditingHabit(null);
    setShowForm(false);
  };

  const handleEditHabit = (habit: Habit) => {
    setFormData({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency,
      category: habit.category,
      color: habit.color,
    });
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleDeleteHabit = (id: string) => {
    deleteHabit(id);
  };

  const frequencyColors = {
    daily: 'bg-blue-100 text-blue-800',
    weekly: 'bg-purple-100 text-purple-800',
    monthly: 'bg-green-100 text-green-800',
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.habitTracker.habitTracker', 'Habit Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.habitTracker.trackAndManageYourDaily', 'Track and manage your daily habits')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="habit-tracker" toolName="Habit Tracker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="sm"
            />
            {isPrefilled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-xs text-[#0D9488] font-medium">{t('tools.habitTracker.prefilled', 'Prefilled')}</span>
              </div>
            )}
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'habit-tracker' })}
              onExportExcel={() => exportExcel({ filename: 'habit-tracker' })}
              onExportJSON={() => exportJSON({ filename: 'habit-tracker' })}
              onExportPDF={() => exportPDF({ filename: 'habit-tracker', title: 'Habit Tracker Report' })}
              onPrint={() => print('Habit Tracker Report')}
              onCopyToClipboard={() => copyToClipboard('csv')}
              disabled={habits.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalHabits}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.habitTracker.totalHabits', 'Total Habits')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold text-blue-500`}>{stats.byFrequency.daily || 0}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.habitTracker.daily', 'Daily')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold text-purple-500`}>{stats.byFrequency.weekly || 0}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.habitTracker.weekly', 'Weekly')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold text-green-500`}>{stats.byFrequency.monthly || 0}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.habitTracker.monthly', 'Monthly')}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('tools.habitTracker.searchHabits', 'Search habits...')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}`}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="all">{t('tools.habitTracker.allCategories', 'All Categories')}</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center gap-2 hover:bg-purple-600"
          >
            <Plus className="w-4 h-4" /> Add Habit
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className={`p-4 rounded-lg border-2 border-purple-300 ${isDark ? 'bg-gray-800' : 'bg-purple-50'}`}>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.habitTracker.habitName', 'Habit Name *')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('tools.habitTracker.eGMorningJog', 'e.g., Morning Jog')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.habitTracker.description', 'Description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('tools.habitTracker.whyIsThisHabitImportant', 'Why is this habit important to you?')}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.habitTracker.frequency', 'Frequency')}
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="daily">{t('tools.habitTracker.daily2', 'Daily')}</option>
                    <option value="weekly">{t('tools.habitTracker.weekly2', 'Weekly')}</option>
                    <option value="monthly">{t('tools.habitTracker.monthly2', 'Monthly')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.habitTracker.category', 'Category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.habitTracker.color', 'Color')}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color ? 'border-white scale-110' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSaveHabit}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center gap-2 hover:bg-purple-600"
                >
                  <Save className="w-4 h-4" /> {editingHabit ? t('tools.habitTracker.update', 'Update') : t('tools.habitTracker.create', 'Create')} Habit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Habits List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.habitTracker.loadingHabits', 'Loading habits...')}</div>
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
            <Calendar className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm || selectedCategory !== 'all' ? t('tools.habitTracker.noHabitsMatchYourFilters', 'No habits match your filters') : t('tools.habitTracker.noHabitsYetCreateOne', 'No habits yet. Create one to get started!')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHabits.map((habit) => (
              <div
                key={habit.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {habit.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${frequencyColors[habit.frequency]} ${isDark ? 'opacity-80' : ''}`}>
                        {habit.frequency}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                        {habit.category}
                      </span>
                    </div>
                    {habit.description && (
                      <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {habit.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      title={t('tools.habitTracker.editHabit', 'Edit habit')}
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      title={t('tools.habitTracker.deleteHabit', 'Delete habit')}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tip */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.habitTracker.tip', 'Tip:')}</strong> Create habits that align with your goals. You can edit or delete them anytime. Your data is automatically synced to the cloud!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerTool;
