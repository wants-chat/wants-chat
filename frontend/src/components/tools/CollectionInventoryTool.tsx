'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Archive,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  DollarSign,
  Star,
  Heart,
  X,
  BarChart3,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  Package,
  Sparkles,
  Coins,
  Stamp,
  CreditCard,
  BookOpen,
  Disc,
  Landmark,
  Palette,
  Trophy,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '@/hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CollectionInventoryToolProps {
  uiConfig?: UIConfig;
}

// Types
type CollectionCategory =
  | 'Coins'
  | 'Stamps'
  | 'Cards'
  | 'Comics'
  | 'Vinyl Records'
  | 'Antiques'
  | 'Art'
  | 'Sports Memorabilia';

type ConditionGrade =
  | 'Mint'
  | 'Near Mint'
  | 'Excellent'
  | 'Good'
  | 'Fair'
  | 'Poor';

interface CollectionItem {
  id: string;
  name: string;
  description: string;
  category: CollectionCategory;
  year: number | null;
  condition: ConditionGrade;
  purchasePrice: number;
  currentValue: number;
  insuranceValue: number;
  acquisitionDate: string;
  acquisitionSource: string;
  notes: string;
  isWishlist: boolean;
  imageUrl: string;
  serialNumber: string;
  manufacturer: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
  createdAt: string;
  updatedAt: string;
}

interface CategoryOption {
  id: CollectionCategory;
  name: string;
  icon: React.ReactNode;
}

// Categories with icons
const CATEGORIES: CategoryOption[] = [
  { id: 'Coins', name: 'Coins', icon: <Coins className="w-4 h-4" /> },
  { id: 'Stamps', name: 'Stamps', icon: <Stamp className="w-4 h-4" /> },
  { id: 'Cards', name: 'Cards', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'Comics', name: 'Comics', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'Vinyl Records', name: 'Vinyl Records', icon: <Disc className="w-4 h-4" /> },
  { id: 'Antiques', name: 'Antiques', icon: <Landmark className="w-4 h-4" /> },
  { id: 'Art', name: 'Art', icon: <Palette className="w-4 h-4" /> },
  { id: 'Sports Memorabilia', name: 'Sports Memorabilia', icon: <Trophy className="w-4 h-4" /> },
];

const CONDITIONS: ConditionGrade[] = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor'];

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'] as const;

// Storage key
const STORAGE_KEY = 'collection-inventory-data';

// Column configuration for exports
const COLLECTION_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'year', header: 'Year', type: 'number' },
  { key: 'condition', header: 'Condition', type: 'string' },
  { key: 'rarity', header: 'Rarity', type: 'string' },
  { key: 'purchasePrice', header: 'Purchase Price', type: 'currency' },
  { key: 'currentValue', header: 'Current Value', type: 'currency' },
  { key: 'insuranceValue', header: 'Insurance Value', type: 'currency' },
  { key: 'acquisitionDate', header: 'Acquisition Date', type: 'date' },
  { key: 'acquisitionSource', header: 'Source', type: 'string' },
  { key: 'manufacturer', header: 'Manufacturer', type: 'string' },
  { key: 'serialNumber', header: 'Serial Number', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Sample data generator
const generateSampleData = (): CollectionItem[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'sample-1',
      name: '1909-S VDB Lincoln Cent',
      description: 'Key date penny with VDB initials on reverse',
      category: 'Coins',
      year: 1909,
      condition: 'Good',
      purchasePrice: 850,
      currentValue: 1200,
      insuranceValue: 1500,
      acquisitionDate: '2022-03-15',
      acquisitionSource: 'Heritage Auctions',
      notes: 'One of the most sought-after Lincoln cents',
      isWishlist: false,
      imageUrl: '',
      serialNumber: '',
      manufacturer: 'US Mint',
      rarity: 'Rare',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-2',
      name: '1952 Topps Mickey Mantle #311',
      description: 'Rookie card of baseball legend',
      category: 'Cards',
      year: 1952,
      condition: 'Fair',
      purchasePrice: 25000,
      currentValue: 45000,
      insuranceValue: 50000,
      acquisitionDate: '2021-08-20',
      acquisitionSource: 'Private collector',
      notes: 'PSA graded, iconic card',
      isWishlist: false,
      imageUrl: '',
      serialNumber: 'PSA-12345678',
      manufacturer: 'Topps',
      rarity: 'Legendary',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-3',
      name: 'Action Comics #1 (Replica)',
      description: 'First appearance of Superman - high quality reprint',
      category: 'Comics',
      year: 1938,
      condition: 'Near Mint',
      purchasePrice: 150,
      currentValue: 200,
      insuranceValue: 250,
      acquisitionDate: '2023-01-10',
      acquisitionSource: 'Comic convention',
      notes: 'Official DC licensed reprint',
      isWishlist: false,
      imageUrl: '',
      serialNumber: '',
      manufacturer: 'DC Comics',
      rarity: 'Uncommon',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-4',
      name: 'The Beatles - Abbey Road (First Press)',
      description: 'Original UK pressing with misaligned Apple logo',
      category: 'Vinyl Records',
      year: 1969,
      condition: 'Excellent',
      purchasePrice: 500,
      currentValue: 800,
      insuranceValue: 1000,
      acquisitionDate: '2020-11-25',
      acquisitionSource: 'Record store',
      notes: 'Plays beautifully, minor sleeve wear',
      isWishlist: false,
      imageUrl: '',
      serialNumber: 'PCS 7088',
      manufacturer: 'Apple Records',
      rarity: 'Rare',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'wishlist-1',
      name: 'Inverted Jenny Stamp',
      description: '24-cent 1918 US airmail stamp with inverted airplane',
      category: 'Stamps',
      year: 1918,
      condition: 'Good',
      purchasePrice: 0,
      currentValue: 1500000,
      insuranceValue: 0,
      acquisitionDate: '',
      acquisitionSource: '',
      notes: 'Dream item - one of the rarest US stamps',
      isWishlist: true,
      imageUrl: '',
      serialNumber: '',
      manufacturer: 'USPS',
      rarity: 'Legendary',
      createdAt: now,
      updatedAt: now,
    },
  ];
};

export const CollectionInventoryTool: React.FC<CollectionInventoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize useToolData hook
  const {
    data: items,
    addItem,
    updateItem,
    deleteItem,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<CollectionItem>('collection-inventory', generateSampleData(), COLLECTION_COLUMNS, {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterYearMin, setFilterYearMin] = useState<string>('');
  const [filterYearMax, setFilterYearMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'year' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [activeTab, setActiveTab] = useState<'collection' | 'wishlist' | 'values' | 'reports'>('collection');

  // Form state
  const [itemForm, setItemForm] = useState<Partial<CollectionItem>>({
    name: '',
    description: '',
    category: 'Coins',
    year: null,
    condition: 'Good',
    purchasePrice: 0,
    currentValue: 0,
    insuranceValue: 0,
    acquisitionDate: '',
    acquisitionSource: '',
    notes: '',
    isWishlist: false,
    imageUrl: '',
    serialNumber: '',
    manufacturer: '',
    rarity: 'Common',
  });

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

  // Get collection items (not wishlist)
  const collectionItems = useMemo(() => items.filter(item => !item.isWishlist), [items]);

  // Get wishlist items
  const wishlistItems = useMemo(() => items.filter(item => item.isWishlist), [items]);

  // Filtered and sorted items based on active tab
  const filteredItems = useMemo(() => {
    let result = activeTab === 'wishlist' ? [...wishlistItems] : [...collectionItems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.manufacturer.toLowerCase().includes(query) ||
          item.serialNumber.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((item) => item.category === filterCategory);
    }

    // Condition filter
    if (filterCondition !== 'all') {
      result = result.filter((item) => item.condition === filterCondition);
    }

    // Year range filter
    if (filterYearMin) {
      result = result.filter((item) => item.year && item.year >= parseInt(filterYearMin));
    }
    if (filterYearMax) {
      result = result.filter((item) => item.year && item.year <= parseInt(filterYearMax));
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
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [collectionItems, wishlistItems, activeTab, searchQuery, filterCategory, filterCondition, filterYearMin, filterYearMax, sortBy, sortOrder]);

  // Calculate reports data
  const reportsData = useMemo(() => {
    const totalPurchaseValue = collectionItems.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalCurrentValue = collectionItems.reduce((sum, item) => sum + item.currentValue, 0);
    const totalInsuranceValue = collectionItems.reduce((sum, item) => sum + item.insuranceValue, 0);
    const valueChange = totalCurrentValue - totalPurchaseValue;
    const valueChangePercent = totalPurchaseValue > 0 ? ((valueChange / totalPurchaseValue) * 100) : 0;

    const valueByCategory: Record<string, number> = {};
    const countByCategory: Record<string, number> = {};
    const valueByCondition: Record<string, number> = {};

    collectionItems.forEach((item) => {
      valueByCategory[item.category] = (valueByCategory[item.category] || 0) + item.currentValue;
      countByCategory[item.category] = (countByCategory[item.category] || 0) + 1;
      valueByCondition[item.condition] = (valueByCondition[item.condition] || 0) + item.currentValue;
    });

    const topValueItems = [...collectionItems]
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5);

    const topGainers = [...collectionItems]
      .filter(item => item.purchasePrice > 0)
      .map(item => ({
        ...item,
        gainPercent: ((item.currentValue - item.purchasePrice) / item.purchasePrice) * 100
      }))
      .sort((a, b) => b.gainPercent - a.gainPercent)
      .slice(0, 5);

    return {
      totalItems: collectionItems.length,
      totalPurchaseValue,
      totalCurrentValue,
      totalInsuranceValue,
      valueChange,
      valueChangePercent,
      valueByCategory,
      countByCategory,
      valueByCondition,
      topValueItems,
      topGainers,
      wishlistCount: wishlistItems.length,
      wishlistValue: wishlistItems.reduce((sum, item) => sum + item.currentValue, 0),
    };
  }, [collectionItems, wishlistItems]);

  // Handlers
  const handleAddItem = () => {
    if (!itemForm.name) return;

    const now = new Date().toISOString();
    const newItem: CollectionItem = {
      id: `item-${Date.now()}`,
      name: itemForm.name || '',
      description: itemForm.description || '',
      category: (itemForm.category as CollectionCategory) || 'Coins',
      year: itemForm.year || null,
      condition: (itemForm.condition as ConditionGrade) || 'Good',
      purchasePrice: itemForm.purchasePrice || 0,
      currentValue: itemForm.currentValue || 0,
      insuranceValue: itemForm.insuranceValue || 0,
      acquisitionDate: itemForm.acquisitionDate || '',
      acquisitionSource: itemForm.acquisitionSource || '',
      notes: itemForm.notes || '',
      isWishlist: activeTab === 'wishlist' ? true : itemForm.isWishlist || false,
      imageUrl: itemForm.imageUrl || '',
      serialNumber: itemForm.serialNumber || '',
      manufacturer: itemForm.manufacturer || '',
      rarity: (itemForm.rarity as CollectionItem['rarity']) || 'Common',
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

  const handleEditItem = (item: CollectionItem) => {
    setEditingItem(item);
    setItemForm(item);
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const handleMoveToCollection = (item: CollectionItem) => {
    updateItem(item.id, { isWishlist: false, updatedAt: new Date().toISOString() });
  };

  const handleMoveToWishlist = (item: CollectionItem) => {
    updateItem(item.id, { isWishlist: true, updatedAt: new Date().toISOString() });
  };

  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      category: 'Coins',
      year: null,
      condition: 'Good',
      purchasePrice: 0,
      currentValue: 0,
      insuranceValue: 0,
      acquisitionDate: '',
      acquisitionSource: '',
      notes: '',
      isWishlist: activeTab === 'wishlist',
      imageUrl: '',
      serialNumber: '',
      manufacturer: '',
      rarity: 'Common',
    });
  };

  const getCategoryIcon = (category: CollectionCategory) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || <Package className="w-4 h-4" />;
  };

  const getConditionColor = (condition: ConditionGrade) => {
    switch (condition) {
      case 'Mint':
        return 'text-emerald-500';
      case 'Near Mint':
        return 'text-green-500';
      case 'Excellent':
        return 'text-blue-500';
      case 'Good':
        return 'text-yellow-500';
      case 'Fair':
        return 'text-orange-500';
      case 'Poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getRarityColor = (rarity: CollectionItem['rarity']) => {
    switch (rarity) {
      case 'Legendary':
        return 'text-amber-500 bg-amber-500/10';
      case 'Very Rare':
        return 'text-purple-500 bg-purple-500/10';
      case 'Rare':
        return 'text-blue-500 bg-blue-500/10';
      case 'Uncommon':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.collectionInventory.collectionInventory', 'Collection Inventory')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.collectionInventory.trackAndManageYourCollectibles', 'Track and manage your collectibles')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WidgetEmbedButton toolSlug="collection-inventory" toolName="Collection Inventory" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={isDark ? 'dark' : 'light'}
                showLabel={true}
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredItems, COLLECTION_COLUMNS, { filename: 'collection-inventory' })}
                onExportExcel={() => exportToExcel(filteredItems, COLLECTION_COLUMNS, { filename: 'collection-inventory' })}
                onExportJSON={() => exportToJSON(filteredItems, { filename: 'collection-inventory' })}
                onExportPDF={() => exportToPDF(filteredItems, COLLECTION_COLUMNS, {
                  filename: 'collection-inventory',
                  title: 'Collection Inventory',
                  subtitle: `${filteredItems.length} items | Total Value: $${filteredItems.reduce((sum, item) => sum + item.currentValue, 0).toLocaleString()}`,
                })}
                onPrint={() => printData(filteredItems, COLLECTION_COLUMNS, { title: 'Collection Inventory' })}
                onCopyToClipboard={() => copyUtil(filteredItems, COLLECTION_COLUMNS)}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          </div>

          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mt-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.collectionInventory.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Package className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.collectionInventory.collection', 'Collection')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {reportsData.totalItems}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.collectionInventory.currentValue', 'Current Value')}</span>
              </div>
              <div className="text-2xl font-bold text-[#0D9488]">
                ${reportsData.totalCurrentValue.toLocaleString()}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                {reportsData.valueChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.collectionInventory.valueChange', 'Value Change')}</span>
              </div>
              <div className={`text-2xl font-bold ${reportsData.valueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {reportsData.valueChange >= 0 ? '+' : ''}{reportsData.valueChangePercent.toFixed(1)}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Heart className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.collectionInventory.wishlist', 'Wishlist')}</span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {reportsData.wishlistCount}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'collection', label: 'Collection', icon: <Archive className="w-4 h-4" /> },
              { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
              { id: 'values', label: 'Values', icon: <DollarSign className="w-4 h-4" /> },
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

          {/* Collection & Wishlist Tab */}
          {(activeTab === 'collection' || activeTab === 'wishlist') && (
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
                      placeholder={t('tools.collectionInventory.searchItems', 'Search items...')}
                      className={`w-full pl-11 pr-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.collectionInventory.allCategories', 'All Categories')}</option>
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
                  <option value="all">{t('tools.collectionInventory.allConditions', 'All Conditions')}</option>
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filterYearMin}
                    onChange={(e) => setFilterYearMin(e.target.value)}
                    placeholder={t('tools.collectionInventory.yearMin', 'Year min')}
                    className={`w-24 px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>-</span>
                  <input
                    type="number"
                    value={filterYearMax}
                    onChange={(e) => setFilterYearMax(e.target.value)}
                    placeholder={t('tools.collectionInventory.yearMax', 'Year max')}
                    className={`w-24 px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

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
                    <option value="name">{t('tools.collectionInventory.sortByName', 'Sort by Name')}</option>
                    <option value="value">{t('tools.collectionInventory.sortByValue', 'Sort by Value')}</option>
                    <option value="year">{t('tools.collectionInventory.sortByYear', 'Sort by Year')}</option>
                    <option value="date">{t('tools.collectionInventory.sortByDateAdded', 'Sort by Date Added')}</option>
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
                  {t('tools.collectionInventory.addItem', 'Add Item')}
                </button>
              </div>

              {/* Items Grid */}
              {filteredItems.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {activeTab === 'wishlist' ? t('tools.collectionInventory.noWishlistItems', 'No wishlist items') : t('tools.collectionInventory.noItemsFound', 'No items found')}
                  </p>
                  <p className="text-sm">
                    {activeTab === 'wishlist'
                      ? t('tools.collectionInventory.addItemsYouWantTo', 'Add items you want to acquire') : t('tools.collectionInventory.addYourFirstCollectibleTo', 'Add your first collectible to get started')}
                  </p>
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
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {activeTab === 'collection' && (
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className={`p-1.5 rounded hover:bg-opacity-80 ${
                                isDark ? 'text-gray-400 hover:text-pink-400 hover:bg-gray-600' : 'text-gray-500 hover:text-pink-500 hover:bg-gray-200'
                              }`}
                              title={t('tools.collectionInventory.moveToWishlist', 'Move to Wishlist')}
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                          )}
                          {activeTab === 'wishlist' && (
                            <button
                              onClick={() => handleMoveToCollection(item)}
                              className={`p-1.5 rounded hover:bg-opacity-80 ${
                                isDark ? 'text-gray-400 hover:text-green-400 hover:bg-gray-600' : 'text-gray-500 hover:text-green-500 hover:bg-gray-200'
                              }`}
                              title={t('tools.collectionInventory.moveToCollection', 'Move to Collection')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
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
                          <Tag className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {item.category}
                          </span>
                          {item.year && (
                            <>
                              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>|</span>
                              <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                {item.year}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`font-medium ${getConditionColor(item.condition)}`}>
                            {item.condition}
                          </span>
                          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>|</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xl font-bold text-[#0D9488]">
                              ${item.currentValue.toLocaleString()}
                            </div>
                            {item.purchasePrice > 0 && !item.isWishlist && (
                              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Paid: ${item.purchasePrice.toLocaleString()}
                              </div>
                            )}
                          </div>
                          {item.purchasePrice > 0 && !item.isWishlist && (
                            <div className={`text-sm font-medium ${
                              item.currentValue >= item.purchasePrice ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {item.currentValue >= item.purchasePrice ? '+' : ''}
                              {(((item.currentValue - item.purchasePrice) / item.purchasePrice) * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Values Tab */}
          {activeTab === 'values' && (
            <div className="p-6 space-y-6">
              {/* Value Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.collectionInventory.totalPurchaseValue', 'Total Purchase Value')}
                  </h3>
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${reportsData.totalPurchaseValue.toLocaleString()}
                  </div>
                </div>
                <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.collectionInventory.totalCurrentValue', 'Total Current Value')}
                  </h3>
                  <div className="text-3xl font-bold text-[#0D9488]">
                    ${reportsData.totalCurrentValue.toLocaleString()}
                  </div>
                </div>
                <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.collectionInventory.insuranceValue', 'Insurance Value')}
                  </h3>
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${reportsData.totalInsuranceValue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Top Value Items */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Star className="w-5 h-5 text-amber-500" />
                  {t('tools.collectionInventory.mostValuableItems', 'Most Valuable Items')}
                </h3>
                {reportsData.topValueItems.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.collectionInventory.noItemsInCollectionYet', 'No items in collection yet')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reportsData.topValueItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center p-3 rounded ${
                          isDark ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-amber-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-amber-700 text-white' :
                            isDark ? 'bg-gray-500 text-gray-300' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.name}</span>
                            <span className={`ml-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-[#0D9488] font-bold">
                          ${item.currentValue.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Gainers */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  {t('tools.collectionInventory.bestPerformingItems', 'Best Performing Items')}
                </h3>
                {reportsData.topGainers.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.collectionInventory.noItemsWithPurchasePrice', 'No items with purchase price recorded')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reportsData.topGainers.map((item) => (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center p-3 rounded ${
                          isDark ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <div>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{item.name}</span>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ${item.purchasePrice.toLocaleString()} → ${item.currentValue.toLocaleString()}
                          </div>
                        </div>
                        <span className={`font-bold ${item.gainPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.gainPercent >= 0 ? '+' : ''}{item.gainPercent.toFixed(1)}%
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
                  {t('tools.collectionInventory.insuranceDocumentation', 'Insurance Documentation')}
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.collectionInventory.exportYourCollectionForInsurance', 'Export your collection for insurance purposes')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => exportToCSV(collectionItems, COLLECTION_COLUMNS, { filename: 'collection-insurance' })}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {t('tools.collectionInventory.exportCsv', 'Export CSV')}
                  </button>
                  <button
                    onClick={() => printData(collectionItems, COLLECTION_COLUMNS, { title: 'Collection Inventory - Insurance Report' })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isDark
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                    {t('tools.collectionInventory.printReport', 'Print Report')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6 space-y-6">
              {/* Value by Category */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Tag className="w-5 h-5" />
                  {t('tools.collectionInventory.valueByCategory', 'Value by Category')}
                </h3>
                <div className="space-y-3">
                  {Object.entries(reportsData.valueByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, value]) => (
                      <div key={category} className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          {getCategoryIcon(category as CollectionCategory)}
                        </div>
                        <span className={`w-32 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {category}
                        </span>
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0D9488]"
                            style={{ width: `${reportsData.totalCurrentValue > 0 ? (value / reportsData.totalCurrentValue) * 100 : 0}%` }}
                          />
                        </div>
                        <span className={`w-28 text-sm text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${value.toLocaleString()}
                        </span>
                        <span className={`w-12 text-xs text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({reportsData.countByCategory[category]} items)
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Value by Condition */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <AlertCircle className="w-5 h-5" />
                  {t('tools.collectionInventory.valueByCondition', 'Value by Condition')}
                </h3>
                <div className="space-y-3">
                  {CONDITIONS.filter(cond => reportsData.valueByCondition[cond])
                    .map((condition) => (
                      <div key={condition} className="flex items-center gap-3">
                        <span className={`w-24 text-sm font-medium ${getConditionColor(condition)}`}>
                          {condition}
                        </span>
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0D9488]"
                            style={{ width: `${reportsData.totalCurrentValue > 0 ? (reportsData.valueByCondition[condition] / reportsData.totalCurrentValue) * 100 : 0}%` }}
                          />
                        </div>
                        <span className={`w-28 text-sm text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${reportsData.valueByCondition[condition]?.toLocaleString() || 0}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Wishlist Summary */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Heart className="w-5 h-5 text-pink-500" />
                  {t('tools.collectionInventory.wishlistSummary', 'Wishlist Summary')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.collectionInventory.itemsOnWishlist', 'Items on Wishlist')}</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {reportsData.wishlistCount}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.collectionInventory.estimatedValue', 'Estimated Value')}</p>
                    <p className="text-2xl font-bold text-pink-500">
                      ${reportsData.wishlistValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Collection Statistics */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Clock className="w-5 h-5" />
                  {t('tools.collectionInventory.collectionStatistics', 'Collection Statistics')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.collectionInventory.totalItems', 'Total Items')}</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {reportsData.totalItems}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.collectionInventory.categories', 'Categories')}</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {Object.keys(reportsData.valueByCategory).length}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.collectionInventory.avgItemValue', 'Avg. Item Value')}</p>
                    <p className="text-xl font-bold text-[#0D9488]">
                      ${reportsData.totalItems > 0 ? Math.round(reportsData.totalCurrentValue / reportsData.totalItems).toLocaleString() : 0}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.collectionInventory.totalGainLoss', 'Total Gain/Loss')}</p>
                    <p className={`text-xl font-bold ${reportsData.valueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {reportsData.valueChange >= 0 ? '+' : ''}${reportsData.valueChange.toLocaleString()}
                    </p>
                  </div>
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
                  {editingItem ? 'Edit Item' : `Add ${activeTab === 'wishlist' ? t('tools.collectionInventory.wishlist2', 'Wishlist') : t('tools.collectionInventory.collection2', 'Collection')} Item`}
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
                      {t('tools.collectionInventory.itemName', 'Item Name *')}
                    </label>
                    <input
                      type="text"
                      value={itemForm.name || ''}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      placeholder={t('tools.collectionInventory.eG1909SVdb', 'e.g., 1909-S VDB Lincoln Cent')}
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
                      {t('tools.collectionInventory.description', 'Description')}
                    </label>
                    <textarea
                      value={itemForm.description || ''}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      placeholder={t('tools.collectionInventory.briefDescriptionOfTheItem', 'Brief description of the item')}
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
                      {t('tools.collectionInventory.category', 'Category')}
                    </label>
                    <select
                      value={itemForm.category || 'Coins'}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as CollectionCategory })}
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

                  {/* Year */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.collectionInventory.year', 'Year')}
                    </label>
                    <input
                      type="number"
                      value={itemForm.year || ''}
                      onChange={(e) => setItemForm({ ...itemForm, year: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="e.g., 1909"
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
                      {t('tools.collectionInventory.condition', 'Condition')}
                    </label>
                    <select
                      value={itemForm.condition || 'Good'}
                      onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value as ConditionGrade })}
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

                  {/* Rarity */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.collectionInventory.rarity', 'Rarity')}
                    </label>
                    <select
                      value={itemForm.rarity || 'Common'}
                      onChange={(e) => setItemForm({ ...itemForm, rarity: e.target.value as CollectionItem['rarity'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      {RARITIES.map((rarity) => (
                        <option key={rarity} value={rarity}>
                          {rarity}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.collectionInventory.purchasePrice', 'Purchase Price ($)')}
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
                      {t('tools.collectionInventory.currentValue2', 'Current Value ($)')}
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

                  {/* Insurance Value */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.collectionInventory.insuranceValue2', 'Insurance Value ($)')}
                    </label>
                    <input
                      type="number"
                      value={itemForm.insuranceValue || ''}
                      onChange={(e) => setItemForm({ ...itemForm, insuranceValue: parseFloat(e.target.value) || 0 })}
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

                  {/* Acquisition Date */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.collectionInventory.acquisitionDate', 'Acquisition Date')}
                    </label>
                    <input
                      type="date"
                      value={itemForm.acquisitionDate || ''}
                      onChange={(e) => setItemForm({ ...itemForm, acquisitionDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Acquisition Source */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.collectionInventory.acquisitionSource', 'Acquisition Source')}
                    </label>
                    <input
                      type="text"
                      value={itemForm.acquisitionSource || ''}
                      onChange={(e) => setItemForm({ ...itemForm, acquisitionSource: e.target.value })}
                      placeholder={t('tools.collectionInventory.eGEbayAuctionHouse', 'e.g., eBay, Auction house, Estate sale')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Manufacturer */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.collectionInventory.manufacturerMaker', 'Manufacturer/Maker')}
                    </label>
                    <input
                      type="text"
                      value={itemForm.manufacturer || ''}
                      onChange={(e) => setItemForm({ ...itemForm, manufacturer: e.target.value })}
                      placeholder={t('tools.collectionInventory.eGUsMintTopps', 'e.g., US Mint, Topps, Marvel')}
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
                      {t('tools.collectionInventory.serialCertNumber', 'Serial/Cert Number')}
                    </label>
                    <input
                      type="text"
                      value={itemForm.serialNumber || ''}
                      onChange={(e) => setItemForm({ ...itemForm, serialNumber: e.target.value })}
                      placeholder={t('tools.collectionInventory.eGPsa12345678', 'e.g., PSA-12345678')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.collectionInventory.notes', 'Notes')}
                    </label>
                    <textarea
                      value={itemForm.notes || ''}
                      onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                      placeholder={t('tools.collectionInventory.additionalNotesAboutTheItem', 'Additional notes about the item')}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>

                  {/* Wishlist checkbox (only when editing or not on wishlist tab) */}
                  {(editingItem || activeTab !== 'wishlist') && (
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemForm.isWishlist || false}
                          onChange={(e) => setItemForm({ ...itemForm, isWishlist: e.target.checked })}
                          className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.collectionInventory.addToWishlistItemNot', 'Add to wishlist (item not yet acquired)')}
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddItem}
                    disabled={!itemForm.name}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingItem ? t('tools.collectionInventory.updateItem', 'Update Item') : t('tools.collectionInventory.addItem2', 'Add Item')}
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
                    {t('tools.collectionInventory.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default CollectionInventoryTool;
