import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ship, Anchor, Waves, DollarSign, MapPin, Layers, Check, Plus, Trash2, Info, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface CruisePlannerToolProps {
  uiConfig?: UIConfig;
}

type TabType = 'packing' | 'portdays' | 'seadays' | 'budget' | 'excursions' | 'decks';

interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}

interface PortDay {
  id: string;
  day: number;
  port: string;
  arrivalTime: string;
  departureTime: string;
  activities: string[];
}

interface SeaActivity {
  id: string;
  time: string;
  activity: string;
  location: string;
}

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

interface Excursion {
  id: string;
  port: string;
  name: string;
  notes: string;
  booked: boolean;
  cost: number;
}

interface DeckInfo {
  deck: number;
  name: string;
  features: string[];
}

// Combined data structure for all cruise planner data
interface CruiseDataItem {
  id: string;
  type: 'packing' | 'portday' | 'seaactivity' | 'budget' | 'excursion';
  data: PackingItem | PortDay | SeaActivity | BudgetItem | Excursion;
}

// Column configurations for each data type
const PACKING_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Item', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'packed', header: 'Packed', type: 'boolean' },
];

const PORT_DAYS_COLUMNS: ColumnConfig[] = [
  { key: 'day', header: 'Day', type: 'number' },
  { key: 'port', header: 'Port', type: 'string' },
  { key: 'arrivalTime', header: 'Arrival', type: 'string' },
  { key: 'departureTime', header: 'Departure', type: 'string' },
];

const SEA_ACTIVITIES_COLUMNS: ColumnConfig[] = [
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'activity', header: 'Activity', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
];

const BUDGET_COLUMNS: ColumnConfig[] = [
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
];

const EXCURSIONS_COLUMNS: ColumnConfig[] = [
  { key: 'port', header: 'Port', type: 'string' },
  { key: 'name', header: 'Excursion', type: 'string' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'booked', header: 'Booked', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Combined columns for the hook (used for general operations)
const CRUISE_DATA_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
];

const defaultPackingItems: PackingItem[] = [
  { id: '1', name: 'Passport', category: 'Documents', packed: false },
  { id: '2', name: 'Cruise Documents', category: 'Documents', packed: false },
  { id: '3', name: 'Sunscreen', category: 'Essentials', packed: false },
  { id: '4', name: 'Swimsuits', category: 'Clothing', packed: false },
  { id: '5', name: 'Formal Attire', category: 'Clothing', packed: false },
  { id: '6', name: 'Medications', category: 'Health', packed: false },
  { id: '7', name: 'Motion Sickness Pills', category: 'Health', packed: false },
  { id: '8', name: 'Phone Charger', category: 'Electronics', packed: false },
  { id: '9', name: 'Camera', category: 'Electronics', packed: false },
  { id: '10', name: 'Comfortable Walking Shoes', category: 'Clothing', packed: false },
];

const defaultDeckInfo: DeckInfo[] = [
  { deck: 16, name: 'Sun Deck', features: ['Water Slides', 'Adult Pool', 'Sports Court'] },
  { deck: 15, name: 'Lido Deck', features: ['Main Pool', 'Buffet', 'Outdoor Bar'] },
  { deck: 14, name: 'Resort Deck', features: ['Spa', 'Gym', 'Thermal Suite'] },
  { deck: 12, name: 'Promenade Deck', features: ['Shops', 'Photo Gallery', 'Art Gallery'] },
  { deck: 10, name: 'Entertainment Deck', features: ['Main Theater', 'Casino', 'Nightclub'] },
  { deck: 8, name: 'Dining Deck', features: ['Main Dining Room', 'Specialty Restaurants'] },
  { deck: 5, name: 'Plaza Deck', features: ['Guest Services', 'Atrium', 'Shore Excursions'] },
  { deck: 3, name: 'Medical Deck', features: ['Medical Center', 'Chapel'] },
];

// Convert default packing items to CruiseDataItem format
const defaultCruiseData: CruiseDataItem[] = defaultPackingItems.map(item => ({
  id: `packing-${item.id}`,
  type: 'packing' as const,
  data: item,
}));

export const CruisePlannerTool: React.FC<CruisePlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: cruiseData,
    setData: setCruiseData,
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
  } = useToolData<CruiseDataItem>('cruise-planner', defaultCruiseData, CRUISE_DATA_COLUMNS);

  const [activeTab, setActiveTab] = useState<TabType>('packing');
  const [newPackingItem, setNewPackingItem] = useState({ name: '', category: 'Essentials' });
  const [newPortDay, setNewPortDay] = useState({ day: 1, port: '', arrivalTime: '08:00', departureTime: '17:00' });
  const [newSeaActivity, setNewSeaActivity] = useState({ time: '09:00', activity: '', location: '' });
  const [newBudgetItem, setNewBudgetItem] = useState({ category: 'Excursions', description: '', amount: 0 });
  const [newExcursion, setNewExcursion] = useState({ port: '', name: '', notes: '', cost: 0 });

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

      if (params.tab && ['packing', 'portdays', 'seadays', 'budget', 'excursions', 'decks'].includes(params.tab)) {
        setActiveTab(params.tab);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Derive individual arrays from combined data
  const packingItems = useMemo(() =>
    cruiseData.filter(item => item.type === 'packing').map(item => item.data as PackingItem),
    [cruiseData]
  );

  const portDays = useMemo(() =>
    cruiseData.filter(item => item.type === 'portday').map(item => item.data as PortDay),
    [cruiseData]
  );

  const seaActivities = useMemo(() =>
    cruiseData.filter(item => item.type === 'seaactivity').map(item => item.data as SeaActivity),
    [cruiseData]
  );

  const budgetItems = useMemo(() =>
    cruiseData.filter(item => item.type === 'budget').map(item => item.data as BudgetItem),
    [cruiseData]
  );

  const excursions = useMemo(() =>
    cruiseData.filter(item => item.type === 'excursion').map(item => item.data as Excursion),
    [cruiseData]
  );

  const categories = ['Documents', 'Clothing', 'Essentials', 'Health', 'Electronics', 'Entertainment', 'Other'];
  const budgetCategories = ['Excursions', 'Drinks', 'Specialty Dining', 'Spa', 'Shopping', 'Tips', 'Casino', 'Other'];

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.tab && ['packing', 'portdays', 'seadays', 'budget', 'excursions', 'decks'].includes(params.tab)) {
        setActiveTab(params.tab as TabType);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'packing', label: 'Packing', icon: <Check className="w-4 h-4" /> },
    { id: 'portdays', label: 'Port Days', icon: <Anchor className="w-4 h-4" /> },
    { id: 'seadays', label: 'Sea Days', icon: <Waves className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'excursions', label: 'Excursions', icon: <MapPin className="w-4 h-4" /> },
    { id: 'decks', label: 'Decks', icon: <Layers className="w-4 h-4" /> },
  ];

  // Helper to find the wrapper ID from the inner item ID
  const findWrapperId = useCallback((type: CruiseDataItem['type'], innerId: string): string | undefined => {
    const item = cruiseData.find(d => d.type === type && (d.data as { id: string }).id === innerId);
    return item?.id;
  }, [cruiseData]);

  const togglePacked = useCallback((id: string) => {
    const wrapperId = findWrapperId('packing', id);
    if (!wrapperId) return;
    const item = packingItems.find(i => i.id === id);
    if (item) {
      updateItem(wrapperId, { data: { ...item, packed: !item.packed } });
    }
  }, [findWrapperId, packingItems, updateItem]);

  const handleAddPackingItem = useCallback(() => {
    if (!newPackingItem.name.trim()) return;
    const newId = Date.now().toString();
    const newItem: PackingItem = {
      id: newId,
      name: newPackingItem.name,
      category: newPackingItem.category,
      packed: false,
    };
    addItem({
      id: `packing-${newId}`,
      type: 'packing',
      data: newItem,
    });
    setNewPackingItem({ name: '', category: 'Essentials' });
  }, [newPackingItem, addItem]);

  const removePackingItem = useCallback((id: string) => {
    const wrapperId = findWrapperId('packing', id);
    if (wrapperId) deleteItem(wrapperId);
  }, [findWrapperId, deleteItem]);

  const handleAddPortDay = useCallback(() => {
    if (!newPortDay.port.trim()) return;
    const newId = Date.now().toString();
    const newPort: PortDay = {
      id: newId,
      ...newPortDay,
      activities: [],
    };
    addItem({
      id: `portday-${newId}`,
      type: 'portday',
      data: newPort,
    });
    setNewPortDay({ day: portDays.length + 2, port: '', arrivalTime: '08:00', departureTime: '17:00' });
  }, [newPortDay, portDays.length, addItem]);

  const removePortDay = useCallback((id: string) => {
    const wrapperId = findWrapperId('portday', id);
    if (wrapperId) deleteItem(wrapperId);
  }, [findWrapperId, deleteItem]);

  const handleAddSeaActivity = useCallback(() => {
    if (!newSeaActivity.activity.trim()) return;
    const newId = Date.now().toString();
    const newActivity: SeaActivity = {
      id: newId,
      ...newSeaActivity,
    };
    addItem({
      id: `seaactivity-${newId}`,
      type: 'seaactivity',
      data: newActivity,
    });
    setNewSeaActivity({ time: '09:00', activity: '', location: '' });
  }, [newSeaActivity, addItem]);

  const removeSeaActivity = useCallback((id: string) => {
    const wrapperId = findWrapperId('seaactivity', id);
    if (wrapperId) deleteItem(wrapperId);
  }, [findWrapperId, deleteItem]);

  const handleAddBudgetItem = useCallback(() => {
    if (!newBudgetItem.description.trim()) return;
    const newId = Date.now().toString();
    const newBudget: BudgetItem = {
      id: newId,
      ...newBudgetItem,
    };
    addItem({
      id: `budget-${newId}`,
      type: 'budget',
      data: newBudget,
    });
    setNewBudgetItem({ category: 'Excursions', description: '', amount: 0 });
  }, [newBudgetItem, addItem]);

  const removeBudgetItem = useCallback((id: string) => {
    const wrapperId = findWrapperId('budget', id);
    if (wrapperId) deleteItem(wrapperId);
  }, [findWrapperId, deleteItem]);

  const handleAddExcursion = useCallback(() => {
    if (!newExcursion.name.trim()) return;
    const newId = Date.now().toString();
    const newExc: Excursion = {
      id: newId,
      ...newExcursion,
      booked: false,
    };
    addItem({
      id: `excursion-${newId}`,
      type: 'excursion',
      data: newExc,
    });
    setNewExcursion({ port: '', name: '', notes: '', cost: 0 });
  }, [newExcursion, addItem]);

  const toggleExcursionBooked = useCallback((id: string) => {
    const wrapperId = findWrapperId('excursion', id);
    if (!wrapperId) return;
    const item = excursions.find(i => i.id === id);
    if (item) {
      updateItem(wrapperId, { data: { ...item, booked: !item.booked } });
    }
  }, [findWrapperId, excursions, updateItem]);

  const removeExcursion = useCallback((id: string) => {
    const wrapperId = findWrapperId('excursion', id);
    if (wrapperId) deleteItem(wrapperId);
  }, [findWrapperId, deleteItem]);

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const excursionsCost = excursions.reduce((sum, item) => sum + item.cost, 0);
  const packedCount = packingItems.filter(item => item.packed).length;

  // Get current data and columns based on active tab for exports
  const getExportConfig = useCallback(() => {
    switch (activeTab) {
      case 'packing':
        return { data: packingItems, columns: PACKING_COLUMNS, title: 'Cruise Packing List' };
      case 'portdays':
        return { data: portDays, columns: PORT_DAYS_COLUMNS, title: 'Cruise Port Days' };
      case 'seadays':
        return { data: seaActivities, columns: SEA_ACTIVITIES_COLUMNS, title: 'Sea Day Activities' };
      case 'budget':
        return { data: budgetItems, columns: BUDGET_COLUMNS, title: 'Cruise Budget' };
      case 'excursions':
        return { data: excursions, columns: EXCURSIONS_COLUMNS, title: 'Cruise Excursions' };
      default:
        return { data: [], columns: [], title: 'Cruise Planner' };
    }
  }, [activeTab, packingItems, portDays, seaActivities, budgetItems, excursions]);

  // Export handlers using hook's export functions for synced data
  const handleExportCSV = useCallback(() => {
    const { title } = getExportConfig();
    exportCSV({ filename: title.toLowerCase().replace(/\s+/g, '_') });
  }, [getExportConfig, exportCSV]);

  const handleExportExcel = useCallback(() => {
    const { title } = getExportConfig();
    exportExcel({ filename: title.toLowerCase().replace(/\s+/g, '_') });
  }, [getExportConfig, exportExcel]);

  const handleExportJSON = useCallback(() => {
    const { title } = getExportConfig();
    exportJSON({ filename: title.toLowerCase().replace(/\s+/g, '_') });
  }, [getExportConfig, exportJSON]);

  const handleExportPDF = useCallback(async () => {
    const { title } = getExportConfig();
    await exportPDF({
      filename: title.toLowerCase().replace(/\s+/g, '_'),
      title: title,
      subtitle: `Exported on ${new Date().toLocaleDateString()}`,
    });
  }, [getExportConfig, exportPDF]);

  const handlePrint = useCallback(() => {
    const { title } = getExportConfig();
    print(title);
  }, [getExportConfig, print]);

  const handleCopyToClipboard = useCallback(async (): Promise<boolean> => {
    return copyToClipboard('tab');
  }, [copyToClipboard]);

  const handleImportCSV = useCallback(async (file: File) => {
    await importCSV(file);
  }, [importCSV]);

  const handleImportJSON = useCallback(async (file: File) => {
    await importJSON(file);
  }, [importJSON]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      </div>
    );
  }

  const renderPackingTab = () => (
    <div className="space-y-4">
      {/* Progress */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cruisePlanner.packingProgress', 'Packing Progress')}</span>
          <span className="text-cyan-500 font-bold">{packedCount}/{packingItems.length}</span>
        </div>
        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className="h-full bg-cyan-500 rounded-full transition-all"
            style={{ width: `${packingItems.length > 0 ? (packedCount / packingItems.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Add Item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newPackingItem.name}
          onChange={(e) => setNewPackingItem({ ...newPackingItem, name: e.target.value })}
          placeholder={t('tools.cruisePlanner.addItem', 'Add item...')}
          className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        />
        <select
          value={newPackingItem.category}
          onChange={(e) => setNewPackingItem({ ...newPackingItem, category: e.target.value })}
          className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={handleAddPackingItem} className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Items by Category */}
      {categories.map(category => {
        const categoryItems = packingItems.filter(item => item.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <div key={category} className="space-y-2">
            <h4 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{category}</h4>
            {categoryItems.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <button
                  onClick={() => togglePacked(item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    item.packed
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : isDark ? 'border-gray-600' : 'border-gray-300'
                  }`}
                >
                  {item.packed && <Check className="w-4 h-4" />}
                </button>
                <span className={`flex-1 ${item.packed ? 'line-through opacity-50' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.name}
                </span>
                <button onClick={() => removePackingItem(item.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  const renderPortDaysTab = () => (
    <div className="space-y-4">
      {/* Add Port Day */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-3`}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.day', 'Day #')}</label>
            <input
              type="number"
              value={newPortDay.day}
              onChange={(e) => setNewPortDay({ ...newPortDay, day: parseInt(e.target.value) || 1 })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.portName', 'Port Name')}</label>
            <input
              type="text"
              value={newPortDay.port}
              onChange={(e) => setNewPortDay({ ...newPortDay, port: e.target.value })}
              placeholder={t('tools.cruisePlanner.eGNassauBahamas', 'e.g., Nassau, Bahamas')}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.arrival', 'Arrival')}</label>
            <input
              type="time"
              value={newPortDay.arrivalTime}
              onChange={(e) => setNewPortDay({ ...newPortDay, arrivalTime: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.departure', 'Departure')}</label>
            <input
              type="time"
              value={newPortDay.departureTime}
              onChange={(e) => setNewPortDay({ ...newPortDay, departureTime: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        <button onClick={handleAddPortDay} className="w-full py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Port Day
        </button>
      </div>

      {/* Port Days List */}
      {portDays.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Anchor className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('tools.cruisePlanner.noPortDaysAddedYet', 'No port days added yet')}</p>
        </div>
      ) : (
        portDays.sort((a, b) => a.day - b.day).map(day => (
          <div key={day.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
                  {day.day}
                </span>
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{day.port}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day.arrivalTime} - {day.departureTime}
                  </p>
                </div>
              </div>
              <button onClick={() => removePortDay(day.id)} className="text-red-500 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderSeaDaysTab = () => (
    <div className="space-y-4">
      {/* Add Activity */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-3`}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.time', 'Time')}</label>
            <input
              type="time"
              value={newSeaActivity.time}
              onChange={(e) => setNewSeaActivity({ ...newSeaActivity, time: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.activity', 'Activity')}</label>
            <input
              type="text"
              value={newSeaActivity.activity}
              onChange={(e) => setNewSeaActivity({ ...newSeaActivity, activity: e.target.value })}
              placeholder={t('tools.cruisePlanner.eGPoolParty', 'e.g., Pool Party')}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.location', 'Location')}</label>
            <input
              type="text"
              value={newSeaActivity.location}
              onChange={(e) => setNewSeaActivity({ ...newSeaActivity, location: e.target.value })}
              placeholder={t('tools.cruisePlanner.eGDeck15', 'e.g., Deck 15')}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        <button onClick={handleAddSeaActivity} className="w-full py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Sea Day Activity
        </button>
      </div>

      {/* Activities List */}
      {seaActivities.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Waves className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('tools.cruisePlanner.noSeaDayActivitiesPlanned', 'No sea day activities planned')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {seaActivities.sort((a, b) => a.time.localeCompare(b.time)).map(activity => (
            <div key={activity.id} className={`flex items-center gap-4 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <span className="text-cyan-500 font-mono font-bold">{activity.time}</span>
              <div className="flex-1">
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{activity.activity}</span>
                {activity.location && (
                  <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>@ {activity.location}</span>
                )}
              </div>
              <button onClick={() => removeSeaActivity(activity.id)} className="text-red-500 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBudgetTab = () => (
    <div className="space-y-4">
      {/* Total */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border text-center`}>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cruisePlanner.totalOnboardSpending', 'Total Onboard Spending')}</div>
        <div className="text-3xl font-bold text-cyan-500">${totalBudget.toFixed(2)}</div>
      </div>

      {/* Add Budget Item */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-3`}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.category', 'Category')}</label>
            <select
              value={newBudgetItem.category}
              onChange={(e) => setNewBudgetItem({ ...newBudgetItem, category: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {budgetCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.description', 'Description')}</label>
            <input
              type="text"
              value={newBudgetItem.description}
              onChange={(e) => setNewBudgetItem({ ...newBudgetItem, description: e.target.value })}
              placeholder={t('tools.cruisePlanner.eGDinnerAtSteakhouse', 'e.g., Dinner at steakhouse')}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.amount', 'Amount ($)')}</label>
            <input
              type="number"
              value={newBudgetItem.amount || ''}
              onChange={(e) => setNewBudgetItem({ ...newBudgetItem, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        <button onClick={handleAddBudgetItem} className="w-full py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Budget Items by Category */}
      {budgetCategories.map(category => {
        const categoryItems = budgetItems.filter(item => item.category === category);
        if (categoryItems.length === 0) return null;
        const categoryTotal = categoryItems.reduce((sum, item) => sum + item.amount, 0);
        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{category}</h4>
              <span className="text-cyan-500 font-bold">${categoryTotal.toFixed(2)}</span>
            </div>
            {categoryItems.map(item => (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.description}</span>
                <div className="flex items-center gap-3">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>${item.amount.toFixed(2)}</span>
                  <button onClick={() => removeBudgetItem(item.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {budgetItems.length === 0 && (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('tools.cruisePlanner.noExpensesTrackedYet', 'No expenses tracked yet')}</p>
        </div>
      )}
    </div>
  );

  const renderExcursionsTab = () => (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cruisePlanner.totalExcursions', 'Total Excursions')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{excursions.length}</div>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cruisePlanner.totalCost', 'Total Cost')}</div>
          <div className="text-2xl font-bold text-cyan-500">${excursionsCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Add Excursion */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-3`}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.port', 'Port')}</label>
            <input
              type="text"
              value={newExcursion.port}
              onChange={(e) => setNewExcursion({ ...newExcursion, port: e.target.value })}
              placeholder={t('tools.cruisePlanner.eGCozumel', 'e.g., Cozumel')}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.excursionName', 'Excursion Name')}</label>
            <input
              type="text"
              value={newExcursion.name}
              onChange={(e) => setNewExcursion({ ...newExcursion, name: e.target.value })}
              placeholder={t('tools.cruisePlanner.eGSnorkelingTour', 'e.g., Snorkeling Tour')}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.cost', 'Cost ($)')}</label>
            <input
              type="number"
              value={newExcursion.cost || ''}
              onChange={(e) => setNewExcursion({ ...newExcursion, cost: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cruisePlanner.notes', 'Notes')}</label>
            <input
              type="text"
              value={newExcursion.notes}
              onChange={(e) => setNewExcursion({ ...newExcursion, notes: e.target.value })}
              placeholder={t('tools.cruisePlanner.bringSunscreenEtc', 'Bring sunscreen, etc.')}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        <button onClick={handleAddExcursion} className="w-full py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Excursion
        </button>
      </div>

      {/* Excursions List */}
      {excursions.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('tools.cruisePlanner.noExcursionsAddedYet', 'No excursions added yet')}</p>
        </div>
      ) : (
        excursions.map(excursion => (
          <div key={excursion.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleExcursionBooked(excursion.id)}
                  className={`w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                    excursion.booked
                      ? 'bg-green-500 border-green-500 text-white'
                      : isDark ? 'border-gray-600' : 'border-gray-300'
                  }`}
                >
                  {excursion.booked && <Check className="w-4 h-4" />}
                </button>
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{excursion.name}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MapPin className="w-3 h-3 inline mr-1" />{excursion.port}
                  </p>
                  {excursion.notes && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{excursion.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-cyan-500 font-bold">${excursion.cost.toFixed(2)}</span>
                <button onClick={() => removeExcursion(excursion.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {excursion.booked && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">{t('tools.cruisePlanner.booked', 'Booked')}</span>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderDecksTab = () => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
        <div className="flex items-start gap-2">
          <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.cruisePlanner.thisIsAGeneralReference', 'This is a general reference. Check your ship\'s deck plan for exact locations.')}
          </p>
        </div>
      </div>

      {defaultDeckInfo.map(deck => (
        <div key={deck.deck} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 bg-cyan-500 text-white rounded-lg flex items-center justify-center font-bold">
              {deck.deck}
            </span>
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{deck.name}</h4>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {deck.features.map(feature => (
              <span
                key={feature}
                className={`px-2 py-1 rounded-full text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg"><Ship className="w-5 h-5 text-cyan-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cruisePlanner.cruisePlanner', 'Cruise Planner')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.cruisePlanner.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cruisePlanner.planYourPerfectCruiseVacation', 'Plan your perfect cruise vacation')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="cruise-planner" toolName="Cruise Planner" />

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
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              onImportCSV={handleImportCSV}
              onImportJSON={handleImportJSON}
              disabled={activeTab === 'decks' || getExportConfig().data.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white'
                  : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'packing' && renderPackingTab()}
        {activeTab === 'portdays' && renderPortDaysTab()}
        {activeTab === 'seadays' && renderSeaDaysTab()}
        {activeTab === 'budget' && renderBudgetTab()}
        {activeTab === 'excursions' && renderExcursionsTab()}
        {activeTab === 'decks' && renderDecksTab()}
      </div>
    </div>
  );
};

export default CruisePlannerTool;
