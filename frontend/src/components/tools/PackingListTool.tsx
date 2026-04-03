import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Luggage, Plus, Check, Trash2, Copy, Download, Tag, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface PackingListToolProps {
  uiConfig?: UIConfig;
}

interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
  quantity: number;
}

interface TripPreset {
  name: string;
  items: { name: string; category: string; quantity: number }[];
}


export const PackingListTool: React.FC<PackingListToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('misc');
  const [tripDays, setTripDays] = useState(5);
  const [tripType, setTripType] = useState('leisure');

  // Default packing items
  const defaultItems: PackingItem[] = [
    { id: '1', name: 'Passport', category: 'documents', packed: true, quantity: 1 },
    { id: '2', name: 'Phone Charger', category: 'electronics', packed: false, quantity: 1 },
    { id: '3', name: 'T-Shirts', category: 'clothing', packed: false, quantity: 5 },
    { id: '4', name: 'Toothbrush', category: 'toiletries', packed: false, quantity: 1 },
    { id: '5', name: 'Sunscreen', category: 'toiletries', packed: false, quantity: 1 },
  ];

  // Column configuration for export
  const packingListColumns: ColumnConfig[] = [
    { key: 'name', header: 'Item', type: 'string' },
    { key: 'category', header: 'Category', type: 'string' },
    { key: 'quantity', header: 'Quantity', type: 'number' },
    { key: 'packed', header: 'Packed', type: 'boolean' },
  ];

  // Use hook for data management with backend sync
  const {
    data: items,
    addItem: hookAddItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
  } = useToolData<PackingItem>('packing-list', defaultItems, packingListColumns);

  // Wrapper for printData that includes columns
  const handlePrint = (title?: string) => {
    printData(items, packingListColumns, { title: title || 'Packing List' });
  };

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        // Restore all saved form fields
        if (params.tripDays !== undefined) setTripDays(params.tripDays);
        if (params.tripType) setTripType(params.tripType);
        if (params.newItemCategory) setNewItemCategory(params.newItemCategory);
        if (params.newItemName) setNewItemName(params.newItemName);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Normal prefill
        if (params.tripDays !== undefined) {
          setTripDays(params.tripDays);
          hasChanges = true;
        }
        if (params.tripType) {
          setTripType(params.tripType);
          hasChanges = true;
        }
        if (params.category && ['documents', 'clothing', 'toiletries', 'electronics', 'health', 'accessories', 'misc'].includes(params.category)) {
          setNewItemCategory(params.category);
          hasChanges = true;
        }

        if (hasChanges) {
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const categories = [
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'toiletries', name: 'Toiletries', icon: '🧴' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'health', name: 'Health', icon: '💊' },
    { id: 'accessories', name: 'Accessories', icon: '👓' },
    { id: 'misc', name: 'Miscellaneous', icon: '📦' },
  ];

  const presets: TripPreset[] = [
    {
      name: 'Beach Vacation',
      items: [
        { name: 'Swimsuit', category: 'clothing', quantity: 2 },
        { name: 'Sunscreen', category: 'toiletries', quantity: 1 },
        { name: 'Sunglasses', category: 'accessories', quantity: 1 },
        { name: 'Flip Flops', category: 'clothing', quantity: 1 },
        { name: 'Beach Towel', category: 'misc', quantity: 1 },
        { name: 'Hat', category: 'accessories', quantity: 1 },
      ],
    },
    {
      name: 'Business Trip',
      items: [
        { name: 'Laptop', category: 'electronics', quantity: 1 },
        { name: 'Business Cards', category: 'documents', quantity: 1 },
        { name: 'Dress Shirts', category: 'clothing', quantity: 3 },
        { name: 'Dress Pants', category: 'clothing', quantity: 2 },
        { name: 'Tie', category: 'accessories', quantity: 2 },
        { name: 'Dress Shoes', category: 'clothing', quantity: 1 },
      ],
    },
    {
      name: 'Camping',
      items: [
        { name: 'Tent', category: 'misc', quantity: 1 },
        { name: 'Sleeping Bag', category: 'misc', quantity: 1 },
        { name: 'Flashlight', category: 'electronics', quantity: 1 },
        { name: 'First Aid Kit', category: 'health', quantity: 1 },
        { name: 'Hiking Boots', category: 'clothing', quantity: 1 },
        { name: 'Water Bottle', category: 'misc', quantity: 1 },
      ],
    },
  ];

  const essentials: { name: string; category: string }[] = [
    { name: 'Passport/ID', category: 'documents' },
    { name: 'Phone Charger', category: 'electronics' },
    { name: 'Wallet', category: 'accessories' },
    { name: 'Medications', category: 'health' },
    { name: 'Toothbrush', category: 'toiletries' },
    { name: 'Underwear', category: 'clothing' },
  ];

  const stats = useMemo(() => {
    const total = items.length;
    const packed = items.filter(i => i.packed).length;
    const byCategory: Record<string, { total: number; packed: number }> = {};
    items.forEach(i => {
      if (!byCategory[i.category]) byCategory[i.category] = { total: 0, packed: 0 };
      byCategory[i.category].total++;
      if (i.packed) byCategory[i.category].packed++;
    });
    return { total, packed, progress: total > 0 ? (packed / total) * 100 : 0, byCategory };
  }, [items]);

  const addItem = () => {
    if (!newItemName.trim()) return;
    hookAddItem({
      id: Date.now().toString(),
      name: newItemName,
      category: newItemCategory,
      packed: false,
      quantity: 1,
      metadata: {
        toolId: 'packing-list',
        tripDays,
        tripType,
        newItemCategory,
      },
    } as PackingItem);

    // Call onSaveCallback if provided (for gallery saves)
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }

    setNewItemName('');
  };

  const togglePacked = (id: string | number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      updateItem(id, { packed: !item.packed });
    }
  };

  const removeItem = (id: string | number) => {
    deleteItem(id);
  };

  const updateQuantity = (id: string | number, qty: number) => {
    updateItem(id, { quantity: Math.max(1, qty) });
  };

  const addPreset = (preset: TripPreset) => {
    const newItems = preset.items.map((item, idx) => ({
      id: Date.now().toString() + idx,
      ...item,
      packed: false,
    }));
    newItems.forEach(item => hookAddItem(item));
  };

  const addEssentials = () => {
    const existing = items.map(i => i.name.toLowerCase());
    const newItems = essentials
      .filter(e => !existing.includes(e.name.toLowerCase()))
      .map((e, idx) => ({
        id: Date.now().toString() + idx,
        name: e.name,
        category: e.category,
        packed: false,
        quantity: 1,
      }));
    newItems.forEach(item => hookAddItem(item));
  };

  const exportList = async () => {
    await copyToClipboard('tab');
  };

  const groupedItems = useMemo(() => {
    const grouped: Record<string, PackingItem[]> = {};
    categories.forEach(cat => {
      const catItems = items.filter(i => i.category === cat.id);
      if (catItems.length > 0) grouped[cat.id] = catItems;
    });
    return grouped;
  }, [items]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Luggage className="w-5 h-5 text-blue-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.packingList.packingList', 'Packing List')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.packingList.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.packingList.neverForgetAnythingWhenTraveling', 'Never forget anything when traveling')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="packing-list" toolName="Packing List" />

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
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.packingList.packingProgress', 'Packing Progress')}</span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.packed}/{stats.total} items</span>
          </div>
          <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          {stats.progress === 100 && (
            <div className="text-center mt-2 text-green-500 font-medium">All packed! Ready to go! 🎉</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={addEssentials} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <Tag className="w-4 h-4" /> Add Essentials
          </button>
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => addPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              + {preset.name}
            </button>
          ))}
          <button onClick={exportList} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <Copy className="w-4 h-4" /> Copy List
          </button>
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'packing-list' })}
            onExportExcel={() => exportExcel({ filename: 'packing-list' })}
            onExportJSON={() => exportJSON({ filename: 'packing-list' })}
            onExportPDF={() => exportPDF({ filename: 'packing-list', title: 'Packing List' })}
            onPrint={() => handlePrint('Packing List')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={items.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>

        {/* Add Item */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder={t('tools.packingList.addItem', 'Add item...')}
            className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
          <button onClick={addItem} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Items by Category */}
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([catId, catItems]) => {
            const cat = categories.find(c => c.id === catId)!;
            const catStats = stats.byCategory[catId];
            return (
              <div key={catId}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{cat.name}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ({catStats.packed}/{catStats.total})
                  </span>
                </div>
                <div className="space-y-1">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${item.packed ? (isDark ? 'bg-green-900/20' : 'bg-green-50') : (isDark ? 'bg-gray-800' : 'bg-gray-50')}`}
                    >
                      <button
                        onClick={() => togglePacked(item.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.packed
                            ? 'bg-green-500 text-white'
                            : isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        } border`}
                      >
                        {item.packed && <Check className="w-4 h-4" />}
                      </button>
                      <span className={`flex-1 ${item.packed ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </span>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className={`w-14 px-2 py-1 rounded border text-center text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <button onClick={() => removeItem(item.id)} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className={`p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Luggage className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t('tools.packingList.noItemsYetAddItems', 'No items yet. Add items or use a preset to get started!')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingListTool;
