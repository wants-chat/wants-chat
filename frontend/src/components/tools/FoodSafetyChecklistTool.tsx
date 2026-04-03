'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Check,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  Shield,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface FoodSafetyChecklistToolProps {
  uiConfig?: UIConfig;
}

type CheckFrequency = 'daily' | 'weekly' | 'monthly';
type CheckStatus = 'pending' | 'pass' | 'fail' | 'na';

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  description: string;
  frequency: CheckFrequency;
  status: CheckStatus;
  completedAt: string;
  completedBy: string;
  correctiveAction: string;
  notes: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  'Personal Hygiene',
  'Food Storage',
  'Temperature Control',
  'Cross-Contamination',
  'Cleaning & Sanitation',
  'Pest Control',
  'Equipment',
  'Receiving',
];

const DEFAULT_CHECKLIST_ITEMS = [
  { category: 'Personal Hygiene', task: 'Staff handwashing compliance', description: 'Verify all staff wash hands properly' },
  { category: 'Personal Hygiene', task: 'Hair restraints worn', description: 'All staff wearing appropriate hair restraints' },
  { category: 'Personal Hygiene', task: 'No jewelry policy', description: 'Staff not wearing prohibited jewelry' },
  { category: 'Food Storage', task: 'FIFO rotation', description: 'First In First Out rotation being followed' },
  { category: 'Food Storage', task: 'Proper labeling', description: 'All food items properly dated and labeled' },
  { category: 'Food Storage', task: 'Storage temperatures', description: 'Check all storage area temperatures' },
  { category: 'Temperature Control', task: 'Refrigerator temps', description: 'All refrigerators at 40°F or below' },
  { category: 'Temperature Control', task: 'Freezer temps', description: 'All freezers at 0°F or below' },
  { category: 'Temperature Control', task: 'Hot holding temps', description: 'Hot food at 135°F or above' },
  { category: 'Cross-Contamination', task: 'Cutting board colors', description: 'Correct cutting boards being used' },
  { category: 'Cross-Contamination', task: 'Raw/ready separation', description: 'Raw and ready-to-eat foods separated' },
  { category: 'Cleaning & Sanitation', task: 'Sanitizer concentration', description: 'Check sanitizer concentration levels' },
  { category: 'Cleaning & Sanitation', task: 'Clean equipment', description: 'All equipment clean and sanitized' },
  { category: 'Pest Control', task: 'No pest activity', description: 'Check for signs of pest activity' },
  { category: 'Equipment', task: 'Thermometer calibration', description: 'Verify thermometers are calibrated' },
];

const CHECKLIST_COLUMNS: ColumnConfig[] = [
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'task', header: 'Task', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'completedAt', header: 'Completed At', type: 'string' },
  { key: 'completedBy', header: 'Completed By', type: 'string' },
];

export const FoodSafetyChecklistTool: React.FC<FoodSafetyChecklistToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: checklist,
    setData: setChecklist,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ChecklistItem>('food-safety-checklist', [], CHECKLIST_COLUMNS);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [inspectorName, setInspectorName] = useState('');

  const [newItem, setNewItem] = useState({
    category: 'Personal Hygiene',
    task: '',
    description: '',
    frequency: 'daily' as CheckFrequency,
  });

  const filteredChecklist = useMemo(() => {
    return checklist.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      return matchesCategory && matchesStatus;
    });
  }, [checklist, selectedCategory, selectedStatus]);

  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, ChecklistItem[]> = {};
    filteredChecklist.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [filteredChecklist]);

  const stats = useMemo(() => {
    const total = checklist.length;
    const passed = checklist.filter((i) => i.status === 'pass').length;
    const failed = checklist.filter((i) => i.status === 'fail').length;
    const pending = checklist.filter((i) => i.status === 'pending').length;
    const completionRate = total > 0 ? ((passed + failed) / total) * 100 : 0;
    const passRate = (passed + failed) > 0 ? (passed / (passed + failed)) * 100 : 0;

    return { total, passed, failed, pending, completionRate, passRate };
  }, [checklist]);

  const loadDefaultChecklist = () => {
    const items = DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
      id: `check-${Date.now()}-${index}`,
      category: item.category,
      task: item.task,
      description: item.description,
      frequency: 'daily' as CheckFrequency,
      status: 'pending' as CheckStatus,
      completedAt: '',
      completedBy: '',
      correctiveAction: '',
      notes: '',
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setChecklist(items);
  };

  const handleAddItem = () => {
    if (!newItem.task) return;

    const item: ChecklistItem = {
      id: `check-${Date.now()}`,
      category: newItem.category,
      task: newItem.task,
      description: newItem.description,
      frequency: newItem.frequency,
      status: 'pending',
      completedAt: '',
      completedBy: '',
      correctiveAction: '',
      notes: '',
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(item);
    setNewItem({
      category: 'Personal Hygiene',
      task: '',
      description: '',
      frequency: 'daily',
    });
    setShowAddForm(false);
  };

  const handleStatusChange = (id: string, status: CheckStatus, correctiveAction?: string) => {
    const updates: Partial<ChecklistItem> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status !== 'pending') {
      updates.completedAt = new Date().toISOString();
      updates.completedBy = inspectorName || 'Inspector';
    }

    if (status === 'fail' && correctiveAction) {
      updates.correctiveAction = correctiveAction;
    }

    updateItem(id, updates);
  };

  const handleResetChecklist = async () => {
    const confirmed = await confirm({
      title: 'Reset Checklist',
      message: 'Reset all items to pending status?',
      confirmText: 'Yes, Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      checklist.forEach((item) => {
        updateItem(item.id, {
          status: 'pending',
          completedAt: '',
          completedBy: '',
          correctiveAction: '',
          updatedAt: new Date().toISOString(),
        });
      });
    }
  };

  const handleClearChecklist = async () => {
    const confirmed = await confirm({
      title: 'Clear Checklist',
      message: 'Are you sure you want to clear all checklist items? This action cannot be undone.',
      confirmText: 'Yes, Clear',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setChecklist([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                  <ClipboardCheck className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.foodSafetyChecklist.foodSafetyChecklist', 'Food Safety Checklist')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.foodSafetyChecklist.dailyFoodSafetyInspectionChecklist', 'Daily food safety inspection checklist')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="food-safety-checklist" toolName="Food Safety Checklist" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={isDark ? 'dark' : 'light'}
                  size="sm"
                />
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg flex items-center gap-2 hover:bg-[#0D9488]/90"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.foodSafetyChecklist.addItem', 'Add Item')}
                </button>
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'food-safety-checklist' })}
                  onExportExcel={() => exportExcel({ filename: 'food-safety-checklist' })}
                  onExportJSON={() => exportJSON({ filename: 'food-safety-checklist' })}
                  onExportPDF={() => exportPDF({
                    filename: 'food-safety-checklist',
                    title: 'Food Safety Checklist',
                    subtitle: new Date().toLocaleDateString(),
                  })}
                  onPrint={() => print('Food Safety Checklist')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={checklist.length === 0}
                />
                <button
                  onClick={handleResetChecklist}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.foodSafetyChecklist.reset', 'Reset')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.foodSafetyChecklist.totalItems', 'Total Items')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-green-500">{t('tools.foodSafetyChecklist.passed', 'Passed')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-red-500">{t('tools.foodSafetyChecklist.failed', 'Failed')}</div>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-yellow-500">{t('tools.foodSafetyChecklist.pending', 'Pending')}</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.foodSafetyChecklist.completion', 'Completion')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">{stats.completionRate.toFixed(0)}%</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.foodSafetyChecklist.passRate', 'Pass Rate')}</div>
            <div className={`text-2xl font-bold ${stats.passRate >= 90 ? 'text-green-500' : stats.passRate >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
              {stats.passRate.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Inspector & Filters */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#0D9488]" />
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder={t('tools.foodSafetyChecklist.inspectorName', 'Inspector name')}
                  className={`px-4 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                  } rounded-lg`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0D9488]" />
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded-lg`}
                >
                  <option value="all">{t('tools.foodSafetyChecklist.allCategories', 'All Categories')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded-lg`}
                >
                  <option value="all">{t('tools.foodSafetyChecklist.allStatus', 'All Status')}</option>
                  <option value="pending">{t('tools.foodSafetyChecklist.pending2', 'Pending')}</option>
                  <option value="pass">{t('tools.foodSafetyChecklist.pass', 'Pass')}</option>
                  <option value="fail">{t('tools.foodSafetyChecklist.fail', 'Fail')}</option>
                  <option value="na">N/A</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Load Default or Empty State */}
        {checklist.length === 0 ? (
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-12">
              <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-4">{t('tools.foodSafetyChecklist.noChecklistItems', 'No checklist items')}</p>
                <button
                  onClick={loadDefaultChecklist}
                  className="px-6 py-3 bg-[#0D9488] text-white rounded-xl font-medium hover:bg-[#0D9488]/90"
                >
                  {t('tools.foodSafetyChecklist.loadDefaultFoodSafetyChecklist', 'Load Default Food Safety Checklist')}
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Checklist by Category */
          <div className="space-y-4">
            {Object.entries(groupedByCategory).map(([category, items]) => (
              <Card key={category} className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Shield className="w-5 h-5 text-[#0D9488]" />
                      {category}
                      <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({items.filter((i) => i.status === 'pass').length}/{items.length} complete)
                      </span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border ${
                          item.status === 'pass'
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-500'
                            : item.status === 'fail'
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-500'
                            : isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {item.task}
                              </span>
                              {item.status === 'pass' && (
                                <Check className="w-5 h-5 text-green-500" />
                              )}
                              {item.status === 'fail' && (
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            {item.description && (
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.description}
                              </p>
                            )}
                            {item.completedAt && (
                              <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(item.completedAt).toLocaleTimeString()} by {item.completedBy}
                              </div>
                            )}
                            {item.status === 'fail' && item.correctiveAction && (
                              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-700 dark:text-red-400">
                                <strong>{t('tools.foodSafetyChecklist.correctiveAction', 'Corrective Action:')}</strong> {item.correctiveAction}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleStatusChange(item.id, 'pass')}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                                >
                                  {t('tools.foodSafetyChecklist.pass2', 'Pass')}
                                </button>
                                <button
                                  onClick={() => {
                                    const action = prompt('Enter corrective action taken:');
                                    if (action !== null) {
                                      handleStatusChange(item.id, 'fail', action);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                                >
                                  {t('tools.foodSafetyChecklist.fail2', 'Fail')}
                                </button>
                                <button
                                  onClick={() => handleStatusChange(item.id, 'na')}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                    isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                >
                                  N/A
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(item.id, 'pending')}
                                className={`px-3 py-1.5 rounded-lg text-sm ${
                                  isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {t('tools.foodSafetyChecklist.undo', 'Undo')}
                              </button>
                            )}
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className={`w-full max-w-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.foodSafetyChecklist.addChecklistItem', 'Add Checklist Item')}
                  </CardTitle>
                  <button onClick={() => setShowAddForm(false)}>
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.foodSafetyChecklist.category', 'Category')}
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.foodSafetyChecklist.task', 'Task *')}
                  </label>
                  <input
                    type="text"
                    value={newItem.task}
                    onChange={(e) => setNewItem({ ...newItem, task: e.target.value })}
                    placeholder={t('tools.foodSafetyChecklist.eGCheckRefrigeratorTemperature', 'e.g., Check refrigerator temperature')}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.foodSafetyChecklist.description', 'Description')}
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder={t('tools.foodSafetyChecklist.additionalDetails', 'Additional details...')}
                    rows={2}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-lg resize-none`}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.task}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.foodSafetyChecklist.addItem2', 'Add Item')}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`px-6 py-3 rounded-xl font-medium ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.foodSafetyChecklist.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default FoodSafetyChecklistTool;
