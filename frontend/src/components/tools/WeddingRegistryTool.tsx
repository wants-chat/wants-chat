import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Plus, Trash2, CheckCircle, ShoppingCart, DollarSign, Package, Sparkles, ExternalLink, Tag, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WeddingRegistryToolProps {
  uiConfig?: UIConfig;
}

interface RegistryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  quantityNeeded: number;
  priority: 'high' | 'medium' | 'low';
  store: string;
  url: string;
  notes: string;
  purchasedBy: string;
  purchased: boolean;
}

const categories = [
  'Kitchen',
  'Dining',
  'Bedroom',
  'Bathroom',
  'Living Room',
  'Outdoor',
  'Electronics',
  'Experiences',
  'Honeymoon Fund',
  'Other',
];

export const WeddingRegistryTool: React.FC<WeddingRegistryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [items, setItems] = useState<RegistryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [newItem, setNewItem] = useState<Omit<RegistryItem, 'id'>>({
    name: '',
    category: 'Kitchen',
    price: 0,
    quantity: 1,
    quantityNeeded: 1,
    priority: 'medium',
    store: '',
    url: '',
    notes: '',
    purchasedBy: '',
    purchased: false,
  });

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.items && Array.isArray(params.items)) {
        const prefillItems: RegistryItem[] = params.items.map((item, idx) => ({
          id: `item-${idx}-${Date.now()}`,
          name: typeof item === 'string' ? item : item.name || '',
          category: typeof item === 'object' && item.category ? item.category : 'Other',
          price: typeof item === 'object' && item.price ? item.price : 0,
          quantity: 1,
          quantityNeeded: 1,
          priority: 'medium',
          store: '',
          url: '',
          notes: '',
          purchasedBy: '',
          purchased: false,
        }));
        setItems(prefillItems);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    if (filterCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    if (filterStatus === 'purchased') {
      filtered = filtered.filter((item) => item.purchased);
    } else if (filterStatus === 'needed') {
      filtered = filtered.filter((item) => !item.purchased);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, filterCategory, filterStatus, sortBy]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const purchasedItems = items.filter((i) => i.purchased).length;
    const totalValue = items.reduce((sum, i) => sum + i.price * i.quantityNeeded, 0);
    const purchasedValue = items.filter((i) => i.purchased).reduce((sum, i) => sum + i.price * i.quantity, 0);
    const remainingValue = totalValue - purchasedValue;
    const completionRate = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

    // Category breakdown
    const categoryStats: Record<string, { total: number; purchased: number }> = {};
    items.forEach((item) => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { total: 0, purchased: 0 };
      }
      categoryStats[item.category].total++;
      if (item.purchased) {
        categoryStats[item.category].purchased++;
      }
    });

    return { totalItems, purchasedItems, totalValue, purchasedValue, remainingValue, completionRate, categoryStats };
  }, [items]);

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    const item: RegistryItem = {
      ...newItem,
      id: `item-${Date.now()}`,
    };
    setItems((prev) => [...prev, item]);
    setNewItem({
      name: '',
      category: 'Kitchen',
      price: 0,
      quantity: 1,
      quantityNeeded: 1,
      priority: 'medium',
      store: '',
      url: '',
      notes: '',
      purchasedBy: '',
      purchased: false,
    });
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<RegistryItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const handleMarkAsPurchased = (id: string, purchasedBy: string = 'Guest') => {
    handleUpdateItem(id, { purchased: true, purchasedBy });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDark ? 'bg-red-900/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
      case 'low':
        return isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return isDark ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Gift className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingRegistry.weddingRegistryChecklist', 'Wedding Registry Checklist')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.weddingRegistry.trackYourWeddingGiftRegistry', 'Track your wedding gift registry')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.weddingRegistry.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalItems}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRegistry.totalItems', 'Total Items')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <div className="text-2xl font-bold text-green-500">{stats.purchasedItems}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRegistry.purchased', 'Purchased')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
            <div className="text-xl font-bold text-teal-500">{formatCurrency(stats.purchasedValue)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRegistry.giftedValue', 'Gifted Value')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
            <div className="text-xl font-bold text-purple-500">{formatCurrency(stats.remainingValue)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.weddingRegistry.stillNeeded', 'Still Needed')}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.weddingRegistry.registryCompletion', 'Registry Completion')}</span>
            <span className={`text-sm font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{stats.completionRate.toFixed(0)}%</span>
          </div>
          <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">{t('tools.weddingRegistry.allCategories', 'All Categories')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">{t('tools.weddingRegistry.allItems', 'All Items')}</option>
            <option value="needed">{t('tools.weddingRegistry.stillNeeded2', 'Still Needed')}</option>
            <option value="purchased">{t('tools.weddingRegistry.purchased2', 'Purchased')}</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="priority">{t('tools.weddingRegistry.sortByPriority', 'Sort by Priority')}</option>
            <option value="price-high">{t('tools.weddingRegistry.priceHighToLow', 'Price: High to Low')}</option>
            <option value="price-low">{t('tools.weddingRegistry.priceLowToHigh', 'Price: Low to High')}</option>
            <option value="name">{t('tools.weddingRegistry.nameAZ', 'Name A-Z')}</option>
          </select>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingRegistry.addRegistryItem', 'Add Registry Item')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder={t('tools.weddingRegistry.itemName', 'Item Name *')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  placeholder={t('tools.weddingRegistry.price', 'Price')}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <input
                type="number"
                value={newItem.quantityNeeded}
                onChange={(e) => setNewItem({ ...newItem, quantityNeeded: parseInt(e.target.value) || 1 })}
                placeholder={t('tools.weddingRegistry.quantityNeeded', 'Quantity Needed')}
                min="1"
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as RegistryItem['priority'] })}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="high">{t('tools.weddingRegistry.highPriority', 'High Priority')}</option>
                <option value="medium">{t('tools.weddingRegistry.mediumPriority', 'Medium Priority')}</option>
                <option value="low">{t('tools.weddingRegistry.lowPriority', 'Low Priority')}</option>
              </select>
              <input
                type="text"
                value={newItem.store}
                onChange={(e) => setNewItem({ ...newItem, store: e.target.value })}
                placeholder={t('tools.weddingRegistry.storeName', 'Store Name')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <input
                type="url"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                placeholder={t('tools.weddingRegistry.productUrl', 'Product URL')}
                className={`md:col-span-2 lg:col-span-3 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddItem} className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium">
                {t('tools.weddingRegistry.addItem', 'Add Item')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {t('tools.weddingRegistry.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Registry Items */}
        <div className="space-y-3">
          {filteredAndSortedItems.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {items.length === 0 ? (
                <>
                  <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.weddingRegistry.noItemsInYourRegistry', 'No items in your registry yet. Click "Add Item" to start building your wishlist.')}</p>
                </>
              ) : (
                <p>{t('tools.weddingRegistry.noItemsMatchTheCurrent', 'No items match the current filters.')}</p>
              )}
            </div>
          ) : (
            filteredAndSortedItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  item.purchased
                    ? isDark ? 'bg-green-900/10 border-green-500/30' : 'bg-green-50 border-green-200'
                    : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.purchased && <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span className={`font-medium ${item.purchased ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      {item.quantityNeeded > 1 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                          x{item.quantityNeeded}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm flex flex-wrap items-center gap-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {item.category}
                      </span>
                      {item.store && (
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3" /> {item.store}
                        </span>
                      )}
                      <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    {item.purchased && item.purchasedBy && (
                      <div className={`text-sm mt-1 flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        <Users className="w-3 h-3" /> Purchased by {item.purchasedBy}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-teal-400' : 'hover:bg-gray-200 text-teal-600'}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {!item.purchased && (
                      <button
                        onClick={() => {
                          const name = prompt('Who purchased this item?', 'Guest');
                          if (name) handleMarkAsPurchased(item.id, name);
                        }}
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-gray-200 text-green-600'}`}
                        title={t('tools.weddingRegistry.markAsPurchased', 'Mark as Purchased')}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Category Summary */}
        {Object.keys(stats.categoryStats).length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.weddingRegistry.categorySummary', 'Category Summary')}</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(stats.categoryStats).map(([category, data]) => (
                <div key={category} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{category}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-lg font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{data.purchased}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/ {data.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeddingRegistryTool;
