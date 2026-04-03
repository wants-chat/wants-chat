'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Trash2,
  Check,
  Edit2,
  ShoppingCart,
  X,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
  category: string;
  notes?: string;
  createdAt?: string;
}

const SHOPPING_COLUMNS = [
  { key: 'name', label: 'Item Name', width: '30%' },
  { key: 'quantity', label: 'Quantity', width: '15%' },
  { key: 'unit', label: 'Unit', width: '15%' },
  { key: 'category', label: 'Category', width: '20%' },
  { key: 'notes', label: 'Notes', width: '20%' },
];

const CATEGORIES = [
  'Produce',
  'Dairy',
  'Meat',
  'Pantry',
  'Frozen',
  'Snacks',
  'Beverages',
  'Other',
];

const UNITS = ['pcs', 'lb', 'kg', 'oz', 'ml', 'l', 'cup', 'tbsp', 'tsp'];

interface ShoppingListToolProps {
  uiConfig?: UIConfig;
}

export const ShoppingListTool: React.FC<ShoppingListToolProps> = ({
  uiConfig }) => {
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
  } = useToolData<ShoppingItem>('shopping-list', [], SHOPPING_COLUMNS, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Local state for form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<ShoppingItem, 'id'>>({
    name: '',
    quantity: 1,
    unit: 'pcs',
    completed: false,
    category: 'Other',
  });

  // Handle add/update
  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    if (editingId) {
      updateItem(editingId, newItem);
      setEditingId(null);
    } else {
      const item: ShoppingItem = {
        id: Date.now().toString(),
        ...newItem,
        createdAt: new Date().toISOString(),
      };
      addItem(item);
    }

    setNewItem({
      name: '',
      quantity: 1,
      unit: 'pcs',
      completed: false,
      category: 'Other',
    });
  };

  // Handle edit
  const handleEditItem = (item: ShoppingItem) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      notes: item.notes,
      completed: item.completed,
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setNewItem({
      name: '',
      quantity: 1,
      unit: 'pcs',
      completed: false,
      category: 'Other',
    });
  };

  // Toggle completed
  const handleToggleCompleted = (item: ShoppingItem) => {
    updateItem(item.id, { completed: !item.completed });
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  // Calculate stats
  const totalItems = items.length;
  const completedItems = items.filter(item => item.completed).length;
  const remainingItems = totalItems - completedItems;

  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-8 flex items-center justify-center min-h-96`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.shoppingList.loadingShoppingList', 'Loading shopping list...')}</p>
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
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.shoppingList.shoppingList', 'Shopping List')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.shoppingList.manageYourShoppingItemsAnd', 'Manage your shopping items and track progress')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="shopping-list" toolName="Shopping List" />

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
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {totalItems}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shoppingList.totalItems', 'Total Items')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <div className={`text-xl font-bold text-green-500`}>
                {completedItems}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shoppingList.completed', 'Completed')}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
              <div className={`text-xl font-bold text-orange-500`}>
                {remainingItems}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.shoppingList.remaining', 'Remaining')}</div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? t('tools.shoppingList.editItem', 'Edit Item') : t('tools.shoppingList.addNewItem', 'Add New Item')}
          </h4>
          <div className="space-y-4">
            {/* Item Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.shoppingList.itemName', 'Item Name *')}
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder={t('tools.shoppingList.eGMilkBreadTomatoes', 'e.g., Milk, Bread, Tomatoes...')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Quantity, Unit, Category */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.shoppingList.quantity', 'Quantity')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.shoppingList.unit', 'Unit')}
                </label>
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.shoppingList.category', 'Category')}
                </label>
                <select
                  value={newItem.category}
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
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.shoppingList.notes', 'Notes')}
              </label>
              <input
                type="text"
                value={newItem.notes || ''}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder={t('tools.shoppingList.eGBuyOrganicLow', 'e.g., Buy organic, low-fat...')}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  newItem.name.trim()
                    ? isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                {editingId ? t('tools.shoppingList.updateItem', 'Update Item') : t('tools.shoppingList.addItem', 'Add Item')}
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

        {/* Items List */}
        {totalItems === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('tools.shoppingList.noItemsInYourShopping', 'No items in your shopping list')}</p>
            <p className="text-sm">{t('tools.shoppingList.addYourFirstItemAbove', 'Add your first item above to get started')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category}>
                <h4 className={`font-semibold mb-2 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {category}
                </h4>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
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

                        {/* Item Details */}
                        <div className="flex-1">
                          <div className={`font-medium ${item.completed ? 'line-through' : ''} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                            {item.name}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.quantity} {item.unit}
                            {item.notes && ` • ${item.notes}`}
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Dropdown */}
        {totalItems > 0 && (
          <div className="flex gap-2 pt-4 border-t border-gray-700">
            <ExportDropdown
              onExportCSV={() => exportCSV()}
              onExportJSON={() => exportJSON()}
              onExportExcel={() => exportExcel()}
              onPrint={() => print('Shopping List')}
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

export default ShoppingListTool;
