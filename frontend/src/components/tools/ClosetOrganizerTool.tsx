import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shirt, Ruler, Archive, Grid3X3, RotateCcw, Heart, Info, Plus, Trash2, Package, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface ClosetOrganizerToolProps {
  uiConfig?: UIConfig;
}

type ClothingCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';
type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';

interface ClothingItem {
  id: string;
  category: ClothingCategory;
  name: string;
  season: Season;
  forDonation: boolean;
}

interface ClosetDimensions {
  width: number;
  height: number;
  depth: number;
}

interface DrawerConfig {
  count: number;
  itemsPerDrawer: number;
}

const HANGING_SPACE_PER_ITEM = 2; // inches per hanging item
const SHELF_DEPTH_MIN = 12; // inches minimum shelf depth
const FOLDED_ITEM_HEIGHT = 3; // inches per folded item stack

const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'season', header: 'Season', type: 'string' },
  { key: 'forDonation', header: 'For Donation', type: 'boolean' },
];

export const ClosetOrganizerTool: React.FC<ClosetOrganizerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: inventory,
    addItem: addInventoryItem,
    updateItem: updateInventoryItem,
    deleteItem: deleteInventoryItem,
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
  } = useToolData<ClothingItem>('closet-organizer', [], COLUMNS);

  // Closet Dimensions
  const [dimensions, setDimensions] = useState<ClosetDimensions>({
    width: 72,
    height: 84,
    depth: 24,
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dimensions' | 'inventory' | 'hanging' | 'shelves' | 'drawers' | 'seasonal' | 'donations'>('dimensions');

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ClothingCategory>('tops');
  const [newItemSeason, setNewItemSeason] = useState<Season>('all');

  // Drawer Configuration
  const [drawerConfig, setDrawerConfig] = useState<DrawerConfig>({
    count: 4,
    itemsPerDrawer: 10,
  });

  // Shelf Configuration
  const [shelfCount, setShelfCount] = useState(3);
  const [shelfHeight, setShelfHeight] = useState(12);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        hasChanges = true;
        // Data is managed by useToolData hook automatically
      }

      if (params.tab && ['dimensions', 'inventory', 'hanging', 'shelves', 'drawers', 'seasonal', 'donations'].includes(params.tab)) {
        setActiveTab(params.tab as typeof activeTab);
        hasChanges = true;
      }
      if (params.category && ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'].includes(params.category)) {
        setNewItemCategory(params.category as ClothingCategory);
        hasChanges = true;
      }
      if (params.season && ['spring', 'summer', 'fall', 'winter', 'all'].includes(params.season)) {
        setNewItemSeason(params.season as Season);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const categoryLabels: Record<ClothingCategory, string> = {
    tops: 'Tops & Shirts',
    bottoms: 'Pants & Shorts',
    dresses: 'Dresses & Jumpsuits',
    outerwear: 'Jackets & Coats',
    shoes: 'Shoes & Footwear',
    accessories: 'Accessories',
  };

  const seasonLabels: Record<Season, string> = {
    spring: 'Spring',
    summer: 'Summer',
    fall: 'Fall',
    winter: 'Winter',
    all: 'All Seasons',
  };

  const calculations = useMemo(() => {
    // Hanging space calculations
    const hangingWidth = dimensions.width;
    const maxHangingItems = Math.floor(hangingWidth / HANGING_SPACE_PER_ITEM);

    // Double rod potential (if height allows)
    const canDoubleRod = dimensions.height >= 72;
    const doubleRodItems = canDoubleRod ? maxHangingItems * 2 : maxHangingItems;

    // Shelf space calculations
    const usableShelfWidth = dimensions.width;
    const usableShelfDepth = Math.max(dimensions.depth, SHELF_DEPTH_MIN);
    const shelfArea = usableShelfWidth * usableShelfDepth;
    const totalShelfArea = shelfArea * shelfCount;

    // Items per shelf (folded items)
    const foldedItemsPerShelf = Math.floor(usableShelfWidth / 8) * Math.floor(shelfHeight / FOLDED_ITEM_HEIGHT);

    // Drawer capacity
    const totalDrawerCapacity = drawerConfig.count * drawerConfig.itemsPerDrawer;

    // Inventory stats
    const inventoryByCategory = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<ClothingCategory, number>);

    const inventoryBySeason = inventory.reduce((acc, item) => {
      acc[item.season] = (acc[item.season] || 0) + 1;
      return acc;
    }, {} as Record<Season, number>);

    const donationItems = inventory.filter(item => item.forDonation);
    const hangingItems = inventory.filter(item =>
      ['tops', 'dresses', 'outerwear'].includes(item.category) && !item.forDonation
    );

    return {
      hangingWidth,
      maxHangingItems,
      canDoubleRod,
      doubleRodItems,
      shelfArea,
      totalShelfArea,
      foldedItemsPerShelf,
      totalDrawerCapacity,
      inventoryByCategory,
      inventoryBySeason,
      donationItems,
      hangingItems,
      totalItems: inventory.length,
      activeItems: inventory.filter(i => !i.forDonation).length,
    };
  }, [dimensions, shelfCount, shelfHeight, drawerConfig, inventory]);

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: newItemCategory,
      season: newItemSeason,
      forDonation: false,
    };
    addInventoryItem(newItem);
    setNewItemName('');
  };

  const removeItem = (id: string) => {
    deleteInventoryItem(id);
  };

  const toggleDonation = (id: string) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      updateInventoryItem(id, { forDonation: !item.forDonation });
    }
  };

  const tabs = [
    { id: 'dimensions', label: 'Dimensions', icon: Ruler },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'hanging', label: 'Hanging', icon: Shirt },
    { id: 'shelves', label: 'Shelves', icon: Grid3X3 },
    { id: 'drawers', label: 'Drawers', icon: Archive },
    { id: 'seasonal', label: 'Seasonal', icon: RotateCcw },
    { id: 'donations', label: 'Donate', icon: Heart },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Shirt className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.closetOrganizer', 'Closet Organizer')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    <Sparkles className="w-3 h-3" />
                    {isEditFromGallery ? t('tools.closetOrganizer.restoredFromGallery', 'Restored from gallery') : t('tools.closetOrganizer.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.closetOrganizer.planAndOrganizeYourWardrobe', 'Plan and organize your wardrobe efficiently')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="closet-organizer" toolName="Closet Organizer" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'closet-inventory' })}
              onExportExcel={() => exportExcel({ filename: 'closet-inventory' })}
              onExportJSON={() => exportJSON({ filename: 'closet-inventory' })}
              onExportPDF={() => exportPDF({
                filename: 'closet-inventory',
                title: 'Closet Inventory',
                subtitle: `${inventory.length} items total`
              })}
              onPrint={() => print('Closet Inventory')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dimensions Tab */}
        {activeTab === 'dimensions' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.closetDimensionsInches', 'Closet Dimensions (inches)')}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.closetOrganizer.width', 'Width')}</label>
                  <input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.closetOrganizer.height', 'Height')}</label>
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.closetOrganizer.depth', 'Depth')}</label>
                  <input
                    type="number"
                    value={dimensions.depth}
                    onChange={(e) => setDimensions({ ...dimensions, depth: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.totalVolume', 'Total Volume')}</div>
                <div className="text-2xl font-bold text-purple-500">
                  {((dimensions.width * dimensions.height * dimensions.depth) / 1728).toFixed(1)} cu ft
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.linearFeet', 'Linear Feet')}</div>
                <div className="text-2xl font-bold text-purple-500">
                  {(dimensions.width / 12).toFixed(1)} ft
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.addNewItem', 'Add New Item')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={t('tools.closetOrganizer.itemName', 'Item name...')}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as ClothingCategory)}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={newItemSeason}
                  onChange={(e) => setNewItemSeason(e.target.value as Season)}
                  className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {Object.entries(seasonLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={addItem}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.closetOrganizer.add', 'Add')}
                </button>
              </div>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="text-xl font-bold text-purple-500">
                    {calculations.inventoryByCategory[key as ClothingCategory] || 0}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label.split(' ')[0]}</div>
                </div>
              ))}
            </div>

            {/* Item List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inventory.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.closetOrganizer.noItemsAddedYetStart', 'No items added yet. Start building your inventory!')}
                </div>
              ) : (
                inventory.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.forDonation
                        ? isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                        : isDark ? 'bg-gray-800' : 'bg-gray-50'
                    } ${item.forDonation ? 'border' : ''}`}
                  >
                    <div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                      <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {categoryLabels[item.category]} - {seasonLabels[item.season]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDonation(item.id)}
                        className={`p-2 rounded-lg ${item.forDonation ? 'bg-red-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-red-400' : 'bg-gray-200 text-red-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Hanging Space Tab */}
        {activeTab === 'hanging' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.hangingSpaceCalculator', 'Hanging Space Calculator')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Based on your closet width of {dimensions.width} inches
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.singleRodCapacity', 'Single Rod Capacity')}</div>
                <div className="text-3xl font-bold text-purple-500">{calculations.maxHangingItems}</div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>items</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.doubleRodCapacity', 'Double Rod Capacity')}</div>
                <div className="text-3xl font-bold text-purple-500">
                  {calculations.canDoubleRod ? calculations.doubleRodItems : 'N/A'}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {calculations.canDoubleRod ? 'items' : t('tools.closetOrganizer.height72', 'Height < 72"')}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.currentHangingItems', 'Current Hanging Items')}</div>
              <div className="text-2xl font-bold text-purple-500">{calculations.hangingItems.length}</div>
              <div className="mt-2 w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min((calculations.hangingItems.length / calculations.maxHangingItems) * 100, 100)}%` }}
                />
              </div>
              <div className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {Math.round((calculations.hangingItems.length / calculations.maxHangingItems) * 100)}% capacity used
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.closetOrganizer.tips', 'Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Use slim velvet hangers to maximize space</li>
                    <li>- Hang similar items together (shirts, pants, dresses)</li>
                    <li>- Double rod works great for shirts and folded pants</li>
                    <li>- Reserve single rod height for dresses and coats</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shelves Tab */}
        {activeTab === 'shelves' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.shelfConfiguration', 'Shelf Configuration')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.closetOrganizer.numberOfShelves', 'Number of Shelves')}</label>
                  <input
                    type="number"
                    value={shelfCount}
                    onChange={(e) => setShelfCount(Number(e.target.value))}
                    min={1}
                    max={10}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.closetOrganizer.heightBetweenInches', 'Height Between (inches)')}</label>
                  <input
                    type="number"
                    value={shelfHeight}
                    onChange={(e) => setShelfHeight(Number(e.target.value))}
                    min={6}
                    max={24}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.totalShelfArea', 'Total Shelf Area')}</div>
                <div className="text-2xl font-bold text-purple-500">
                  {(calculations.totalShelfArea / 144).toFixed(1)} sq ft
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.foldedItemsCapacity', 'Folded Items Capacity')}</div>
                <div className="text-2xl font-bold text-purple-500">
                  {calculations.foldedItemsPerShelf * shelfCount}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.closetOrganizer.shelfIdeas', 'Shelf Ideas:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Use shelf dividers for neat stacks</li>
                    <li>- Store sweaters folded, not hung</li>
                    <li>- Add baskets for small accessories</li>
                    <li>- Reserve top shelves for off-season items</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drawers Tab */}
        {activeTab === 'drawers' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.drawerConfiguration', 'Drawer Configuration')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.closetOrganizer.numberOfDrawers', 'Number of Drawers')}</label>
                  <input
                    type="number"
                    value={drawerConfig.count}
                    onChange={(e) => setDrawerConfig({ ...drawerConfig, count: Number(e.target.value) })}
                    min={1}
                    max={12}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.closetOrganizer.itemsPerDrawer', 'Items Per Drawer')}</label>
                  <input
                    type="number"
                    value={drawerConfig.itemsPerDrawer}
                    onChange={(e) => setDrawerConfig({ ...drawerConfig, itemsPerDrawer: Number(e.target.value) })}
                    min={1}
                    max={30}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.totalDrawerCapacity', 'Total Drawer Capacity')}</div>
              <div className="text-4xl font-bold text-purple-500">{calculations.totalDrawerCapacity}</div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>items</div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h5 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.suggestedDrawerOrganization', 'Suggested Drawer Organization')}</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.closetOrganizer.drawer1UnderwearSocks', 'Drawer 1: Underwear & Socks')}</div>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.closetOrganizer.drawer2TShirts', 'Drawer 2: T-shirts')}</div>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.closetOrganizer.drawer3ShortsLoungewear', 'Drawer 3: Shorts & Loungewear')}</div>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.closetOrganizer.drawer4WorkoutClothes', 'Drawer 4: Workout Clothes')}</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.closetOrganizer.drawerTips', 'Drawer Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Use drawer dividers for organization</li>
                    <li>- Roll items to see everything at once</li>
                    <li>- KonMari fold for maximum visibility</li>
                    <li>- Keep frequently used items at front</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seasonal Rotation Tab */}
        {activeTab === 'seasonal' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.seasonalRotationPlanner', 'Seasonal Rotation Planner')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.closetOrganizer.organizeYourWardrobeBySeasons', 'Organize your wardrobe by seasons for easy rotation')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(seasonLabels).map(([key, label]) => (
                <div key={key} className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-purple-500">
                    {calculations.inventoryBySeason[key as Season] || 0}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.rotationSchedule', 'Rotation Schedule')}</h5>
              <div className="space-y-3">
                <div className={`flex justify-between items-center p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.closetOrganizer.springRotation', 'Spring Rotation')}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.closetOrganizer.marchMay', 'March - May')}</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.closetOrganizer.summerRotation', 'Summer Rotation')}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.closetOrganizer.juneAugust', 'June - August')}</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.closetOrganizer.fallRotation', 'Fall Rotation')}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.closetOrganizer.septemberNovember', 'September - November')}</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.closetOrganizer.winterRotation', 'Winter Rotation')}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.closetOrganizer.decemberFebruary', 'December - February')}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.closetOrganizer.seasonalTips', 'Seasonal Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Store off-season clothes in vacuum bags</li>
                    <li>- Use top shelves for seasonal storage</li>
                    <li>- Clean items before storing long-term</li>
                    <li>- Rotate every 3 months for fresh options</li>
                    <li>- Add cedar blocks to prevent moths</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closetOrganizer.donationTracker', 'Donation Tracker')}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.closetOrganizer.markItemsForDonationIn', 'Mark items for donation in the Inventory tab')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">{calculations.donationItems.length}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.closetOrganizer.itemsToDonate', 'items to donate')}</div>
                </div>
              </div>
            </div>

            {calculations.donationItems.length > 0 ? (
              <div className="space-y-2">
                {calculations.donationItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                      <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {categoryLabels[item.category]}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleDonation(item.id)}
                      className={`text-sm px-3 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {t('tools.closetOrganizer.keep', 'Keep')}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.closetOrganizer.noItemsMarkedForDonation', 'No items marked for donation yet.')}
              </div>
            )}

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Heart className={`w-4 h-4 mt-0.5 text-red-500`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.closetOrganizer.donationGuidelines', 'Donation Guidelines:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Donate items you have not worn in 12 months</li>
                    <li>- Ensure items are clean and in good condition</li>
                    <li>- Consider local shelters and charities</li>
                    <li>- Document donations for tax purposes</li>
                    <li>- Host a clothing swap with friends</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.totalItems', 'Total Items')}</div>
              <div className="text-xl font-bold text-purple-500">{calculations.totalItems}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.activeItems', 'Active Items')}</div>
              <div className="text-xl font-bold text-green-500">{calculations.activeItems}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closetOrganizer.forDonation', 'For Donation')}</div>
              <div className="text-xl font-bold text-red-500">{calculations.donationItems.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosetOrganizerTool;
