import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Box,
  DollarSign,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  MapPin,
  AlertTriangle,
  Package,
  Sofa,
  Tv,
  Utensils,
  Car,
  Bed,
  Bath,
  Briefcase,
  Wrench,
  Music,
  Shirt,
  Gem,
  Palette,
  Dumbbell,
  X,
  BarChart3,
  Clock,
  Shield,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface HomeInventoryToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Room {
  id: string;
  name: string;
  icon: string;
  isCustom: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  roomId: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  warrantyExpiration: string;
  serialNumber: string;
  modelNumber: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Default rooms
const DEFAULT_ROOMS: Room[] = [
  { id: 'living-room', name: 'Living Room', icon: 'Sofa', isCustom: false },
  { id: 'bedroom', name: 'Bedroom', icon: 'Bed', isCustom: false },
  { id: 'kitchen', name: 'Kitchen', icon: 'Utensils', isCustom: false },
  { id: 'bathroom', name: 'Bathroom', icon: 'Bath', isCustom: false },
  { id: 'garage', name: 'Garage', icon: 'Car', isCustom: false },
  { id: 'office', name: 'Office', icon: 'Briefcase', isCustom: false },
];

// Categories
const CATEGORIES: CategoryOption[] = [
  { id: 'electronics', name: 'Electronics', icon: <Tv className="w-4 h-4" /> },
  { id: 'furniture', name: 'Furniture', icon: <Sofa className="w-4 h-4" /> },
  { id: 'appliances', name: 'Appliances', icon: <Package className="w-4 h-4" /> },
  { id: 'jewelry', name: 'Jewelry', icon: <Gem className="w-4 h-4" /> },
  { id: 'art', name: 'Art', icon: <Palette className="w-4 h-4" /> },
  { id: 'clothing', name: 'Clothing', icon: <Shirt className="w-4 h-4" /> },
  { id: 'tools', name: 'Tools', icon: <Wrench className="w-4 h-4" /> },
  { id: 'sports', name: 'Sports Equipment', icon: <Dumbbell className="w-4 h-4" /> },
  { id: 'musical', name: 'Musical Instruments', icon: <Music className="w-4 h-4" /> },
  { id: 'other', name: 'Other', icon: <Box className="w-4 h-4" /> },
];

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;

const ROOM_ICONS: Record<string, React.ReactNode> = {
  Sofa: <Sofa className="w-4 h-4" />,
  Bed: <Bed className="w-4 h-4" />,
  Utensils: <Utensils className="w-4 h-4" />,
  Bath: <Bath className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'roomId', header: 'Room', type: 'string' },
  { key: 'purchaseDate', header: 'Purchase Date', type: 'date' },
  { key: 'purchasePrice', header: 'Purchase Price', type: 'currency' },
  { key: 'currentValue', header: 'Current Value', type: 'currency' },
  { key: 'warrantyExpiration', header: 'Warranty Expiration', type: 'date' },
  { key: 'serialNumber', header: 'Serial Number', type: 'string' },
  { key: 'modelNumber', header: 'Model Number', type: 'string' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
];

// Storage key for rooms (items use backend via useToolData)
const ROOMS_STORAGE_KEY = 'home-inventory-rooms';

export const HomeInventoryTool: React.FC<HomeInventoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Use the new useToolData hook for backend persistence
  const {
    data: items,
    setData: setItems,
    addItem,
    updateItem,
    deleteItem: removeItem,
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
  } = useToolData<InventoryItem>('home-inventory', [], COLUMNS);

  // Rooms state (stays in localStorage as it's configuration)
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'rooms' | 'reports'>('inventory');

  // Form state
  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    name: '',
    description: '',
    category: 'electronics',
    roomId: rooms[0]?.id || '',
    purchaseDate: '',
    purchasePrice: 0,
    currentValue: 0,
    warrantyExpiration: '',
    serialNumber: '',
    modelNumber: '',
    condition: 'Good',
    quantity: 1,
  });

  const [roomForm, setRoomForm] = useState({ name: '', icon: 'Home' });

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        setItemForm(prev => ({ ...prev, name: params.content || '' }));
        setShowItemModal(true);
        setIsPrefilled(true);
      }
      if (params.amount) {
        setItemForm(prev => ({ ...prev, currentValue: params.amount || 0 }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Load rooms from localStorage (items handled by useToolData)
  useEffect(() => {
    const savedRooms = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (savedRooms) {
      try {
        setRooms(JSON.parse(savedRooms));
      } catch (e) {
        console.error('Failed to parse saved rooms:', e);
      }
    }
  }, []);

  // Save rooms to localStorage
  useEffect(() => {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.serialNumber.toLowerCase().includes(query) ||
          item.modelNumber.toLowerCase().includes(query)
      );
    }

    // Room filter
    if (filterRoom !== 'all') {
      result = result.filter((item) => item.roomId === filterRoom);
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((item) => item.category === filterCategory);
    }

    // Condition filter
    if (filterCondition !== 'all') {
      result = result.filter((item) => item.condition === filterCondition);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.currentValue - b.currentValue;
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, searchQuery, filterRoom, filterCategory, filterCondition, sortBy, sortOrder]);

  // Calculate reports data
  const reportsData = useMemo(() => {
    const totalValue = items.reduce((sum, item) => sum + item.currentValue * item.quantity, 0);

    const valueByRoom: Record<string, number> = {};
    const valueByCategory: Record<string, number> = {};

    items.forEach((item) => {
      const itemTotal = item.currentValue * item.quantity;
      valueByRoom[item.roomId] = (valueByRoom[item.roomId] || 0) + itemTotal;
      valueByCategory[item.category] = (valueByCategory[item.category] || 0) + itemTotal;
    });

    const today = new Date();
    const expiredWarranties = items.filter(
      (item) => item.warrantyExpiration && new Date(item.warrantyExpiration) < today
    );

    const recentItems = [...items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalValue,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      valueByRoom,
      valueByCategory,
      expiredWarranties,
      recentItems,
    };
  }, [items]);

  // Handlers
  const handleAddItem = () => {
    if (!itemForm.name) return;

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: itemForm.name || '',
      description: itemForm.description || '',
      category: itemForm.category || 'other',
      roomId: itemForm.roomId || rooms[0]?.id || '',
      purchaseDate: itemForm.purchaseDate || '',
      purchasePrice: itemForm.purchasePrice || 0,
      currentValue: itemForm.currentValue || 0,
      warrantyExpiration: itemForm.warrantyExpiration || '',
      serialNumber: itemForm.serialNumber || '',
      modelNumber: itemForm.modelNumber || '',
      condition: itemForm.condition || 'Good',
      quantity: itemForm.quantity || 1,
      createdAt: now,
      updatedAt: now,
    };

    if (editingItem) {
      updateItem(editingItem.id, { ...newItem, id: editingItem.id, createdAt: editingItem.createdAt });
    } else {
      addItem(newItem);
    }

    resetItemForm();
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemForm(item);
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      removeItem(id);
    }
  };

  const handleAddRoom = () => {
    if (!roomForm.name) return;

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: roomForm.name,
      icon: roomForm.icon,
      isCustom: true,
    };

    setRooms([...rooms, newRoom]);
    setRoomForm({ name: '', icon: 'Home' });
    setShowRoomModal(false);
  };

  const handleDeleteRoom = (id: string) => {
    const roomItems = items.filter((item) => item.roomId === id);
    if (roomItems.length > 0) {
      setValidationMessage('Cannot delete room with items. Please move or delete items first.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    setRooms(rooms.filter((room) => room.id !== id));
  };

  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      category: 'electronics',
      roomId: rooms[0]?.id || '',
      purchaseDate: '',
      purchasePrice: 0,
      currentValue: 0,
      warrantyExpiration: '',
      serialNumber: '',
      modelNumber: '',
      condition: 'Good',
      quantity: 1,
    });
  };

  const getRoomName = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.name || 'Unknown';
  };

  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId;
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return 'text-green-500';
      case 'Good':
        return 'text-blue-500';
      case 'Fair':
        return 'text-yellow-500';
      case 'Poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.homeInventory.homeInventory', 'Home Inventory')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.homeInventory.trackAndManageYourHome', 'Track and manage your home possessions')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="home-inventory" toolName="Home Inventory" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
              />
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'home-inventory' })}
                onExportExcel={() => exportExcel({ filename: 'home-inventory' })}
                onExportJSON={() => exportJSON({ filename: 'home-inventory' })}
                onExportPDF={() => exportPDF({
                  filename: 'home-inventory',
                  title: 'Home Inventory Report',
                  subtitle: `Total Value: $${reportsData.totalValue.toLocaleString()}`
                })}
                onPrint={() => print('Home Inventory Report')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>

          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mt-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.homeInventory.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Package className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeInventory.totalItems', 'Total Items')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {reportsData.totalItems}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeInventory.totalValue', 'Total Value')}</span>
              </div>
              <div className="text-2xl font-bold text-[#0D9488]">
                ${reportsData.totalValue.toLocaleString()}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeInventory.rooms', 'Rooms')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {rooms.length}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeInventory.expiredWarranties', 'Expired Warranties')}</span>
              </div>
              <div className="text-2xl font-bold text-orange-500">
                {reportsData.expiredWarranties.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'inventory', label: 'Inventory', icon: <Box className="w-4 h-4" /> },
              { id: 'rooms', label: 'Rooms', icon: <Home className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
                    : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="p-6">
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('tools.homeInventory.searchItems', 'Search items...')}
                      className={`w-full pl-11 pr-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <select
                  value={filterRoom}
                  onChange={(e) => setFilterRoom(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.homeInventory.allRooms', 'All Rooms')}</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.homeInventory.allCategories', 'All Categories')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.homeInventory.allConditions', 'All Conditions')}</option>
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="name">{t('tools.homeInventory.sortByName', 'Sort by Name')}</option>
                    <option value="value">{t('tools.homeInventory.sortByValue', 'Sort by Value')}</option>
                    <option value="date">{t('tools.homeInventory.sortByDate', 'Sort by Date')}</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`p-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  onClick={() => {
                    resetItemForm();
                    setEditingItem(null);
                    setShowItemModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.homeInventory.addItem', 'Add Item')}
                </button>
              </div>

              {/* Items Grid */}
              {filteredItems.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('tools.homeInventory.noItemsFound', 'No items found')}</p>
                  <p className="text-sm">{t('tools.homeInventory.addYourFirstItemTo', 'Add your first item to get started')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditItem(item)}
                            className={`p-1.5 rounded hover:bg-opacity-80 ${
                              isDark ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {getRoomName(item.roomId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {getCategoryName(item.category)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`font-medium ${getConditionColor(item.condition)}`}>
                            {item.condition}
                          </span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>|</span>
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                        <div className="text-xl font-bold text-[#0D9488]">
                          ${(item.currentValue * item.quantity).toLocaleString()}
                        </div>
                        {item.warrantyExpiration && new Date(item.warrantyExpiration) < new Date() && (
                          <div className="flex items-center gap-1 text-orange-500 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            {t('tools.homeInventory.warrantyExpired', 'Warranty expired')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.homeInventory.manageRooms', 'Manage Rooms')}
                </h2>
                <button
                  onClick={() => setShowRoomModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.homeInventory.addRoom', 'Add Room')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => {
                  const roomItems = items.filter((item) => item.roomId === room.id);
                  const roomValue = roomItems.reduce((sum, item) => sum + item.currentValue * item.quantity, 0);

                  return (
                    <div
                      key={room.id}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            {ROOM_ICONS[room.icon] || <Home className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {room.name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {roomItems.length} items
                            </p>
                          </div>
                        </div>
                        {room.isCustom && (
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-lg font-bold text-[#0D9488]">
                        ${roomValue.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6 space-y-6">
              {/* Value by Room */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Home className="w-5 h-5" />
                  {t('tools.homeInventory.valueByRoom', 'Value by Room')}
                </h3>
                <div className="space-y-3">
                  {Object.entries(reportsData.valueByRoom)
                    .sort(([, a], [, b]) => b - a)
                    .map(([roomId, value]) => (
                      <div key={roomId} className="flex items-center gap-3">
                        <span className={`w-32 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {getRoomName(roomId)}
                        </span>
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0D9488]"
                            style={{ width: `${(value / reportsData.totalValue) * 100}%` }}
                          />
                        </div>
                        <span className={`w-24 text-sm text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Value by Category */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Tag className="w-5 h-5" />
                  {t('tools.homeInventory.valueByCategory', 'Value by Category')}
                </h3>
                <div className="space-y-3">
                  {Object.entries(reportsData.valueByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([categoryId, value]) => (
                      <div key={categoryId} className="flex items-center gap-3">
                        <span className={`w-32 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {getCategoryName(categoryId)}
                        </span>
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0D9488]"
                            style={{ width: `${(value / reportsData.totalValue) * 100}%` }}
                          />
                        </div>
                        <span className={`w-24 text-sm text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Expired Warranties */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Items with Expired Warranties ({reportsData.expiredWarranties.length})
                </h3>
                {reportsData.expiredWarranties.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.homeInventory.noItemsWithExpiredWarranties', 'No items with expired warranties')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reportsData.expiredWarranties.map((item) => (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center p-2 rounded ${
                          isDark ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.name}</span>
                        <span className="text-sm text-orange-500">
                          Expired: {new Date(item.warrantyExpiration).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recently Added */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Clock className="w-5 h-5" />
                  {t('tools.homeInventory.recentlyAddedItems', 'Recently Added Items')}
                </h3>
                {reportsData.recentItems.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.homeInventory.noItemsAddedYet', 'No items added yet')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reportsData.recentItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center p-2 rounded ${
                          isDark ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.name}</span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Insurance Documentation */}
              <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Shield className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.homeInventory.insuranceDocumentation', 'Insurance Documentation')}
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.homeInventory.exportYourCompleteInventoryFor', 'Export your complete inventory for insurance purposes. Use the export menu in the header for CSV, Excel, JSON, and PDF exports.')}
                </p>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {items.length} items tracked • Total value: ${reportsData.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-inherit">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingItem ? t('tools.homeInventory.editItem', 'Edit Item') : t('tools.homeInventory.addNewItem', 'Add New Item')}
                </h2>
                <button
                  onClick={() => {
                    setShowItemModal(false);
                    setEditingItem(null);
                    resetItemForm();
                  }}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.itemName', 'Item Name *')}
                    </label>
                    <input
                      type="text"
                      value={itemForm.name || ''}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      placeholder={t('tools.homeInventory.eGSamsung65Tv', 'e.g., Samsung 65\' TV')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.description', 'Description')}
                    </label>
                    <textarea
                      value={itemForm.description || ''}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      placeholder={t('tools.homeInventory.briefDescriptionOfTheItem', 'Brief description of the item')}
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.category', 'Category')}
                    </label>
                    <select
                      value={itemForm.category || 'electronics'}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Room */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.roomLocation', 'Room/Location')}
                    </label>
                    <select
                      value={itemForm.roomId || rooms[0]?.id || ''}
                      onChange={(e) => setItemForm({ ...itemForm, roomId: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.purchaseDate', 'Purchase Date')}
                    </label>
                    <input
                      type="date"
                      value={itemForm.purchaseDate || ''}
                      onChange={(e) => setItemForm({ ...itemForm, purchaseDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Warranty Expiration */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.warrantyExpiration', 'Warranty Expiration')}
                    </label>
                    <input
                      type="date"
                      value={itemForm.warrantyExpiration || ''}
                      onChange={(e) => setItemForm({ ...itemForm, warrantyExpiration: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.purchasePrice', 'Purchase Price ($)')}
                    </label>
                    <input
                      type="number"
                      value={itemForm.purchasePrice || ''}
                      onChange={(e) => setItemForm({ ...itemForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Current Value */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.currentValue', 'Current Value ($)')}
                    </label>
                    <input
                      type="number"
                      value={itemForm.currentValue || ''}
                      onChange={(e) => setItemForm({ ...itemForm, currentValue: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.serialNumber', 'Serial Number')}
                    </label>
                    <input
                      type="text"
                      value={itemForm.serialNumber || ''}
                      onChange={(e) => setItemForm({ ...itemForm, serialNumber: e.target.value })}
                      placeholder={t('tools.homeInventory.enterSerialNumber', 'Enter serial number')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Model Number */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.modelNumber', 'Model Number')}
                    </label>
                    <input
                      type="text"
                      value={itemForm.modelNumber || ''}
                      onChange={(e) => setItemForm({ ...itemForm, modelNumber: e.target.value })}
                      placeholder={t('tools.homeInventory.enterModelNumber', 'Enter model number')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Condition */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.condition', 'Condition')}
                    </label>
                    <select
                      value={itemForm.condition || 'Good'}
                      onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value as InventoryItem['condition'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.homeInventory.quantity', 'Quantity')}
                    </label>
                    <input
                      type="number"
                      value={itemForm.quantity || 1}
                      onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                      min="1"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddItem}
                    disabled={!itemForm.name}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingItem ? t('tools.homeInventory.updateItem', 'Update Item') : t('tools.homeInventory.addItem2', 'Add Item')}
                  </button>
                  <button
                    onClick={() => {
                      setShowItemModal(false);
                      setEditingItem(null);
                      resetItemForm();
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.homeInventory.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Room Modal */}
        {showRoomModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.homeInventory.addNewRoom', 'Add New Room')}
                </h2>
                <button
                  onClick={() => {
                    setShowRoomModal(false);
                    setRoomForm({ name: '', icon: 'Home' });
                  }}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.homeInventory.roomName', 'Room Name *')}
                  </label>
                  <input
                    type="text"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    placeholder={t('tools.homeInventory.eGBasementAttic', 'e.g., Basement, Attic')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.homeInventory.icon', 'Icon')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ROOM_ICONS).map(([iconName, icon]) => (
                      <button
                        key={iconName}
                        onClick={() => setRoomForm({ ...roomForm, icon: iconName })}
                        className={`p-3 rounded-lg border transition-colors ${
                          roomForm.icon === iconName
                            ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                            : isDark
                            ? 'border-gray-600 hover:border-gray-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddRoom}
                    disabled={!roomForm.name}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {t('tools.homeInventory.addRoom2', 'Add Room')}
                  </button>
                  <button
                    onClick={() => {
                      setShowRoomModal(false);
                      setRoomForm({ name: '', icon: 'Home' });
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.homeInventory.cancel2', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 px-4 py-3 bg-orange-500 text-white rounded-lg shadow-lg z-50">
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default HomeInventoryTool;
