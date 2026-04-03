'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '@/components/ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '@/hooks/useToolData';
import type { ColumnConfig } from '@/lib/toolDataUtils';
import {
  DollarSign,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  TrendingUp,
  Clock,
  Printer,
  BarChart3,
  Percent,
  ChevronDown,
  ChevronUp,
  Copy,
  Search,
  Filter,
  Gift,
  History,
  Eye,
  Building2,
  Package,
  Tag,
} from 'lucide-react';

// Types
interface PriceTier {
  id: string;
  name: string;
  multiplier: number;
}

interface PricingItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  cost: number;
  category: string;
  markup: number;
  isActive: boolean;
  createdAt: string;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  isActive: boolean;
}

interface Promotion {
  id: string;
  name: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Competitor {
  id: string;
  name: string;
  price: number;
}

// Default data
const defaultPricingItems: PricingItem[] = [];

const defaultPriceTiers: PriceTier[] = [
  { id: 'basic', name: 'Basic', multiplier: 0.8 },
  { id: 'standard', name: 'Standard', multiplier: 1.0 },
  { id: 'premium', name: 'Premium', multiplier: 1.3 },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Product/Service Name', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'basePrice', header: 'Base Price', type: 'currency' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'markup', header: 'Markup %', type: 'number' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

type TabType = 'pricing' | 'addons' | 'packages' | 'promotions' | 'competitors' | 'analytics';

interface PricingCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const PricingCalculatorTool: React.FC<PricingCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use useToolData hook for backend sync
  const {
    data: pricingItems,
    addItem: addPricingItem,
    updateItem: updatePricingItem,
    deleteItem: deletePricingItem,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<PricingItem>('pricing-calculator', defaultPricingItems, COLUMNS);

  // Local state for UI
  const [activeTab, setActiveTab] = useState<TabType>('pricing');
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(defaultPriceTiers);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);

  // Form State
  const [newItem, setNewItem] = useState<Partial<PricingItem>>({
    name: '',
    description: '',
    basePrice: 0,
    cost: 0,
    category: 'general',
    markup: 0,
    isActive: true,
  });

  // Apply prefill data from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.serviceName) {
        setNewItem(prev => ({ ...prev, name: params.serviceName as string }));
        hasChanges = true;
      }
      if (params.price || params.basePrice) {
        setNewItem(prev => ({ ...prev, basePrice: Number(params.price || params.basePrice) }));
        hasChanges = true;
      }

      if (hasChanges) {
        setShowAddModal(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return pricingItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [pricingItems, selectedCategory, searchQuery]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalItems = pricingItems.length;
    const activeItems = pricingItems.filter(i => i.isActive).length;
    const avgPrice = pricingItems.length > 0
      ? pricingItems.reduce((sum, i) => sum + i.basePrice, 0) / pricingItems.length
      : 0;
    const avgMarkup = pricingItems.length > 0
      ? pricingItems.reduce((sum, i) => sum + i.markup, 0) / pricingItems.length
      : 0;
    const totalRevenue = pricingItems.reduce((sum, i) => sum + i.basePrice, 0);
    const totalCost = pricingItems.reduce((sum, i) => sum + i.cost, 0);
    const totalProfit = totalRevenue - totalCost;

    return { totalItems, activeItems, avgPrice, avgMarkup, totalRevenue, totalCost, totalProfit };
  }, [pricingItems]);

  // Helper functions
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const calculateMarkup = (basePrice: number, cost: number) => {
    if (cost === 0) return 0;
    return ((basePrice - cost) / cost) * 100;
  };

  // Pricing CRUD
  const addNewItem = () => {
    if (!newItem.name || !newItem.basePrice) {
      setValidationMessage('Please fill in all required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const markup = calculateMarkup(newItem.basePrice || 0, newItem.cost || 0);

    const item: PricingItem = {
      id: generateId(),
      name: newItem.name || '',
      description: newItem.description || '',
      basePrice: newItem.basePrice || 0,
      cost: newItem.cost || 0,
      category: newItem.category || 'general',
      markup,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    addPricingItem(item);
    setNewItem({
      name: '',
      description: '',
      basePrice: 0,
      cost: 0,
      category: 'general',
      markup: 0,
      isActive: true,
    });
    setShowAddModal(false);
  };

  const updateItem = (updatedItem: PricingItem) => {
    const markup = calculateMarkup(updatedItem.basePrice, updatedItem.cost);
    updatePricingItem(updatedItem.id, { ...updatedItem, markup });
    setEditingItem(null);
  };

  const deleteItem = async (id: string) => {
    const result = await confirm('Are you sure you want to delete this item?');
    if (result) {
      deletePricingItem(id);
    }
  };

  // Add-on CRUD
  const addAddOn = (addOn: Omit<AddOn, 'id'>) => {
    setAddOns([...addOns, { ...addOn, id: generateId() }]);
  };

  const deleteAddOn = async (id: string) => {
    const result = await confirm('Are you sure?');
    if (result) {
      setAddOns(addOns.filter(a => a.id !== id));
    }
  };

  // Package CRUD
  const addPackage = (pkg: Omit<Package, 'id'>) => {
    setPackages([...packages, { ...pkg, id: generateId() }]);
  };

  const deletePackage = async (id: string) => {
    const result = await confirm('Are you sure?');
    if (result) {
      setPackages(packages.filter(p => p.id !== id));
    }
  };

  // Promotion CRUD
  const addPromotion = (promo: Omit<Promotion, 'id'>) => {
    setPromotions([...promotions, { ...promo, id: generateId() }]);
  };

  const deletePromotion = async (id: string) => {
    const result = await confirm('Are you sure?');
    if (result) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };

  // Competitor CRUD
  const addCompetitor = (competitor: Omit<Competitor, 'id'>) => {
    setCompetitors([...competitors, { ...competitor, id: generateId() }]);
  };

  const deleteCompetitor = async (id: string) => {
    const result = await confirm('Are you sure?');
    if (result) {
      setCompetitors(competitors.filter(c => c.id !== id));
    }
  };

  // Tab navigation
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'addons', label: 'Add-ons', icon: <Plus className="w-4 h-4" /> },
    { id: 'packages', label: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'promotions', label: 'Promotions', icon: <Tag className="w-4 h-4" /> },
    { id: 'competitors', label: 'Competitors', icon: <Building2 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const getCategories = () => {
    const cats = new Set(pricingItems.map(item => item.category));
    return Array.from(cats);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pricingCalculator.pricingCalculator', 'Pricing Calculator')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.pricingCalculator.managePricingMarkupsAndCompetitive', 'Manage pricing, markups, and competitive analysis')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <WidgetEmbedButton toolSlug="pricing-calculator" toolName="Pricing Calculator" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {}}
                onExportExcel={() => {}}
                onExportJSON={() => {}}
                onExportPDF={() => {}}
                onPrint={() => {}}
                onCopyToClipboard={() => {}}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder={t('tools.pricingCalculator.searchItems', 'Search items...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="all">{t('tools.pricingCalculator.allCategories', 'All Categories')}</option>
                    {getCategories().map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.pricingCalculator.addItem', 'Add Item')}
                </button>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <Card key={item.id} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </CardTitle>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingItem(item)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit3 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className={`p-1.5 rounded-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/30`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description || 'No description'}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.pricingCalculator.basePrice', 'Base Price')}
                        </span>
                        <span className="text-lg font-bold text-[#0D9488]">
                          ${item.basePrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.pricingCalculator.cost2', 'Cost')}
                        </span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          ${item.cost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-300 dark:border-gray-600">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.pricingCalculator.markup2', 'Markup')}
                        </span>
                        <span className={`text-lg font-bold ${
                          item.markup >= 50 ? 'text-green-500' : item.markup >= 30 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {item.markup.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.pricingCalculator.noItemsFoundAddYour', 'No items found. Add your first item to get started!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Add-ons Tab */}
        {activeTab === 'addons' && (
          <div className="space-y-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pricingCalculator.addOnServices', 'Add-on Services')}
                </h2>
                <button
                  onClick={() => {
                    const name = prompt('Add-on name:');
                    const price = prompt('Price:');
                    const category = prompt('Category:');
                    if (name && price && category) {
                      addAddOn({
                        name,
                        price: parseFloat(price),
                        category,
                      });
                    }
                  }}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.pricingCalculator.addAddOn', 'Add Add-on')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addOns.map(addon => (
                  <div
                    key={addon.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {addon.name}
                        </h3>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {addon.category}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteAddOn(addon.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <span className="text-lg font-bold text-[#0D9488]">
                      +${addon.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {addOns.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.pricingCalculator.noAddOnsYet', 'No add-ons yet.')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pricingCalculator.packageDeals', 'Package Deals')}
                </h2>
                <button
                  onClick={() => {
                    const name = prompt('Package name:');
                    const originalPrice = prompt('Original price:');
                    const discountedPrice = prompt('Discounted price:');
                    if (name && originalPrice && discountedPrice) {
                      addPackage({
                        name,
                        description: '',
                        originalPrice: parseFloat(originalPrice),
                        discountedPrice: parseFloat(discountedPrice),
                        isActive: true,
                      });
                    }
                  }}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.pricingCalculator.addPackage', 'Add Package')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map(pkg => {
                  const savings = pkg.originalPrice - pkg.discountedPrice;
                  const savingsPercent = (savings / pkg.originalPrice) * 100;

                  return (
                    <div
                      key={pkg.id}
                      className={`p-6 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {pkg.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {pkg.description}
                          </p>
                        </div>
                        <button
                          onClick={() => deletePackage(pkg.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className={`text-sm line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            ${pkg.originalPrice.toFixed(2)}
                          </div>
                          <div className="text-2xl font-bold text-[#0D9488]">
                            ${pkg.discountedPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-green-500 text-white text-sm font-medium px-2 py-1 rounded">
                          Save {savingsPercent.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {packages.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.pricingCalculator.noPackagesYet', 'No packages yet.')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pricingCalculator.promotions', 'Promotions')}
                </h2>
                <button
                  onClick={() => {
                    const name = prompt('Promotion name:');
                    const discountPercent = prompt('Discount percentage:');
                    const startDate = prompt('Start date (YYYY-MM-DD):');
                    const endDate = prompt('End date (YYYY-MM-DD):');
                    if (name && discountPercent && startDate && endDate) {
                      addPromotion({
                        name,
                        discountPercent: parseFloat(discountPercent),
                        startDate,
                        endDate,
                        isActive: true,
                      });
                    }
                  }}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.pricingCalculator.addPromotion', 'Add Promotion')}
                </button>
              </div>

              <div className="space-y-4">
                {promotions.map(promo => {
                  const isActive = new Date(promo.startDate) <= new Date() && new Date(promo.endDate) >= new Date();

                  return (
                    <div
                      key={promo.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                            <Gift className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {promo.name}
                            </h3>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-[#0D9488]">
                            {promo.discountPercent}% OFF
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-400'
                          }`}>
                            {isActive ? t('tools.pricingCalculator.active2', 'Active') : t('tools.pricingCalculator.inactive', 'Inactive')}
                          </span>
                          <button
                            onClick={() => deletePromotion(promo.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {promotions.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.pricingCalculator.noPromotionsYet', 'No promotions yet.')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Competitors Tab */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pricingCalculator.competitorAnalysis', 'Competitor Analysis')}
                </h2>
                <button
                  onClick={() => {
                    const name = prompt('Competitor name:');
                    const price = prompt('Price:');
                    if (name && price) {
                      addCompetitor({
                        name,
                        price: parseFloat(price),
                      });
                    }
                  }}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.pricingCalculator.addCompetitor', 'Add Competitor')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitors.map(comp => {
                  const yourAvgPrice = pricingItems.length > 0
                    ? pricingItems.reduce((sum, i) => sum + i.basePrice, 0) / pricingItems.length
                    : 0;
                  const diff = yourAvgPrice - comp.price;

                  return (
                    <div
                      key={comp.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {comp.name}
                        </h3>
                        <button
                          onClick={() => deleteCompetitor(comp.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('tools.pricingCalculator.theirPrice', 'Their Price')}
                          </span>
                          <span className="font-semibold">${comp.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('tools.pricingCalculator.yourAvg', 'Your Avg')}
                          </span>
                          <span className="font-semibold">${yourAvgPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('tools.pricingCalculator.difference', 'Difference')}
                          </span>
                          <span className={`font-bold ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {competitors.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.pricingCalculator.noCompetitorsAddedYet', 'No competitors added yet.')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.pricingCalculator.totalItems', 'Total Items')}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.totalItems}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {analytics.activeItems} active
                </div>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.pricingCalculator.avgMarkup', 'Avg Markup')}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.avgMarkup.toFixed(1)}%
                </div>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.pricingCalculator.totalRevenue', 'Total Revenue')}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${analytics.totalRevenue.toFixed(2)}
                </div>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.pricingCalculator.totalProfit', 'Total Profit')}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${
                  analytics.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ${analytics.totalProfit.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.pricingCalculator.itemAnalysis', 'Item Analysis')}
              </h2>

              <div className="space-y-4">
                {pricingItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </h3>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-4 text-center">
                      <div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pricingCalculator.price', 'Price')}</div>
                        <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${item.basePrice.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pricingCalculator.cost', 'Cost')}</div>
                        <div className="font-semibold text-red-500">
                          ${item.cost.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pricingCalculator.profit', 'Profit')}</div>
                        <div className="font-semibold text-green-500">
                          ${(item.basePrice - item.cost).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pricingCalculator.markup', 'Markup')}</div>
                        <div className={`font-semibold ${
                          item.markup >= 50 ? 'text-green-500' : item.markup >= 30 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {item.markup.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pricingCalculator.status', 'Status')}</div>
                        <div className={`font-semibold ${item.isActive ? 'text-green-500' : 'text-gray-500'}`}>
                          {item.isActive ? t('tools.pricingCalculator.active3', 'Active') : t('tools.pricingCalculator.inactive2', 'Inactive')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pricingItems.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.pricingCalculator.addItemsToSeeAnalysis', 'Add items to see analysis.')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pricingCalculator.addNewItem', 'Add New Item')}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pricingCalculator.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.pricingCalculator.productOrServiceName', 'Product or service name')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pricingCalculator.description', 'Description')}
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    rows={2}
                    placeholder={t('tools.pricingCalculator.briefDescription', 'Brief description')}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pricingCalculator.category', 'Category')}
                  </label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.pricingCalculator.eGElectronicsSoftware', 'e.g., Electronics, Software')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pricingCalculator.basePrice2', 'Base Price ($) *')}
                    </label>
                    <input
                      type="number"
                      value={newItem.basePrice || ''}
                      onChange={(e) => setNewItem({ ...newItem, basePrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pricingCalculator.cost3', 'Cost ($) *')}
                    </label>
                    <input
                      type="number"
                      value={newItem.cost || ''}
                      onChange={(e) => setNewItem({ ...newItem, cost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {newItem.basePrice && newItem.cost && (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.pricingCalculator.calculatedMarkup', 'Calculated Markup')}
                      </span>
                      <span className="font-semibold text-[#0D9488]">
                        {calculateMarkup(newItem.basePrice, newItem.cost).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addNewItem}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.pricingCalculator.addItem2', 'Add Item')}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.pricingCalculator.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.pricingCalculator.editItem', 'Edit Item')}
                </h2>
                <button
                  onClick={() => setEditingItem(null)}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pricingCalculator.name2', 'Name')}
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pricingCalculator.description2', 'Description')}
                  </label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    rows={2}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pricingCalculator.category2', 'Category')}
                  </label>
                  <input
                    type="text"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pricingCalculator.basePrice3', 'Base Price ($)')}
                    </label>
                    <input
                      type="number"
                      value={editingItem.basePrice}
                      onChange={(e) => setEditingItem({ ...editingItem, basePrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.pricingCalculator.cost4', 'Cost ($)')}
                    </label>
                    <input
                      type="number"
                      value={editingItem.cost}
                      onChange={(e) => setEditingItem({ ...editingItem, cost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingItem.isActive}
                    onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                  />
                  <label htmlFor="isActive" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pricingCalculator.active', 'Active')}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => updateItem(editingItem)}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.pricingCalculator.saveChanges', 'Save Changes')}
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.pricingCalculator.cancel2', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PricingCalculatorTool;
