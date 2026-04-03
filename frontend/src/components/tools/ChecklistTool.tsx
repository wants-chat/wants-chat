import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckSquare, Plus, Trash2, Copy, Check, Download, Upload, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData, { type UseToolDataReturn } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ChecklistToolProps {
  uiConfig?: UIConfig;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdAt: string;
}

// Column configuration for export
const COLUMNS: ColumnConfig[] = [
  { key: 'text', header: 'Item', type: 'string' },
  { key: 'completed', header: 'Completed', type: 'boolean' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

export const ChecklistTool: React.FC<ChecklistToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  // Initialize useToolData hook
  const toolData = useToolData<Checklist>('checklist', [], COLUMNS, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  const { data: checklists, addItem: addChecklistItem, updateItem: updateChecklistItem, deleteItem: deleteChecklistItem } = toolData;

  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [copied, setCopied] = useState(false);

  // Set initial active list when checklists load
  useEffect(() => {
    if (checklists.length > 0 && !activeListId) {
      setActiveListId(checklists[0].id);
    }
  }, [checklists, activeListId]);

  const activeList = checklists.find(l => l.id === activeListId);

  const createChecklist = () => {
    const title = newListTitle.trim() || `Checklist ${checklists.length + 1}`;
    const newList: Checklist = {
      id: Date.now().toString(),
      title,
      items: [],
      createdAt: new Date().toISOString(),
    };
    addChecklistItem(newList);
    setActiveListId(newList.id);
    setNewListTitle('');
  };

  const deleteChecklist = (id: string) => {
    deleteChecklistItem(id);
    if (activeListId === id) {
      const remaining = checklists.filter(l => l.id !== id);
      setActiveListId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const addItem = () => {
    if (!newItemText.trim() || !activeListId) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    updateChecklistItem(activeListId, {
      items: [...(activeList?.items || []), newItem],
    } as Partial<Checklist>);
    setNewItemText('');
  };

  const toggleItem = (itemId: string) => {
    if (!activeList) return;
    const updatedItems = activeList.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateChecklistItem(activeListId, { items: updatedItems } as Partial<Checklist>);
  };

  const deleteItem = (itemId: string) => {
    if (!activeList) return;
    const updatedItems = activeList.items.filter(item => item.id !== itemId);
    updateChecklistItem(activeListId, { items: updatedItems } as Partial<Checklist>);
  };

  const clearCompleted = () => {
    if (!activeList) return;
    const updatedItems = activeList.items.filter(item => !item.completed);
    updateChecklistItem(activeListId, { items: updatedItems } as Partial<Checklist>);
  };

  const copyChecklist = () => {
    if (!activeList) return;
    const text = `${activeList.title}\n${activeList.items.map(i =>
      `${i.completed ? '✓' : '○'} ${i.text}`
    ).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = activeList?.items.filter(i => i.completed).length || 0;
  const totalCount = activeList?.items.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <CheckSquare className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.checklist.checklist', 'Checklist')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.checklist.createAndManageTaskLists', 'Create and manage task lists')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="checklist" toolName="Checklist" />

          <SyncStatus
            isSynced={toolData.isSynced}
            isSaving={toolData.isSaving}
            lastSaved={toolData.lastSaved}
            syncError={toolData.syncError}
            onForceSync={toolData.forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.checklist.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Checklist Tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          {checklists.map(list => (
            <button
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                activeListId === list.id
                  ? 'bg-teal-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {list.title}
              <button
                onClick={(e) => { e.stopPropagation(); deleteChecklist(list.id); }}
                className="opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </button>
          ))}
          <div className="flex gap-1">
            <input
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder={t('tools.checklist.newList', 'New list...')}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              onKeyPress={(e) => e.key === 'Enter' && createChecklist()}
            />
            <button
              onClick={createChecklist}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeList ? (
          <>
            {/* Progress */}
            {totalCount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {completedCount} of {totalCount} completed
                  </span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Add Item */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder={t('tools.checklist.addANewItem', 'Add a new item...')}
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
              />
              <button
                onClick={addItem}
                className="px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {activeList.items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-teal-500 border-teal-500 text-white'
                        : isDark
                        ? 'border-gray-600 hover:border-teal-500'
                        : 'border-gray-300 hover:border-teal-500'
                    }`}
                  >
                    {item.completed && <Check className="w-4 h-4" />}
                  </button>
                  <span className={`flex-1 ${item.completed ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className={`p-1 rounded transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {t('tools.checklist.clearCompleted', 'Clear Completed')}
                </button>
              )}
              <button
                onClick={copyChecklist}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.checklist.copied', 'Copied!') : t('tools.checklist.copyList', 'Copy List')}
              </button>
              {activeList && activeList.items.length > 0 && (
                <ExportDropdown
                  onExportCSV={() => exportToCSV(activeList.items, COLUMNS, { filename: `checklist-${activeList.title}` })}
                  onExportExcel={() => exportToExcel(activeList.items, COLUMNS, { filename: `checklist-${activeList.title}` })}
                  onExportJSON={() => exportToJSON(activeList.items, { filename: `checklist-${activeList.title}` })}
                  onExportPDF={async () => {
                    await exportToPDF(activeList.items, COLUMNS, {
                      filename: `checklist-${activeList.title}`,
                      title: activeList.title,
                      subtitle: `${completedCount} of ${totalCount} items completed`,
                    });
                  }}
                  onPrint={() => printData(activeList.items, COLUMNS, { title: activeList.title })}
                  onCopyToClipboard={() => copyUtil(activeList.items, COLUMNS, 'tab')}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                />
              )}
            </div>
          </>
        ) : (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('tools.checklist.noChecklistsYetCreateOne', 'No checklists yet. Create one to get started!')}</p>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.checklist.tip', 'Tip:')}</strong> Your checklists are saved locally in your browser.
            Great for shopping lists, daily tasks, or project tracking!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChecklistTool;
