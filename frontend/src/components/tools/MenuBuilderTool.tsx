'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  Save,
  Eye,
  DollarSign,
  Image,
  Tag,
  AlertTriangle,
  Leaf,
  Wheat,
  X,
  ChevronDown,
  ChevronUp,
  Calculator,
  RefreshCw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface MenuBuilderToolProps {
  uiConfig?: UIConfig;
}

// Types
interface PriceTier {
  size: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceTiers: PriceTier[];
  calories: number;
  allergens: string[];
  dietaryTags: string[];
  imageUrl: string;
  categoryId: string;
  isSpecial: boolean;
  foodCost: number;
}

interface MenuCategory {
  id: string;
  name: string;
  order: number;
}

interface DailySpecial {
  id: string;
  dayOfWeek: string;
  menuItemId: string;
  discountPercent: number;
  description: string;
}

type MenuStyle = 'classic' | 'modern' | 'casual';

const DEFAULT_CATEGORIES: MenuCategory[] = [
  { id: 'appetizers', name: 'Appetizers', order: 1 },
  { id: 'mains', name: 'Main Courses', order: 2 },
  { id: 'desserts', name: 'Desserts', order: 3 },
  { id: 'drinks', name: 'Drinks', order: 4 },
  { id: 'specials', name: 'Specials', order: 5 },
];

const ALLERGENS = [
  'Gluten',
  'Dairy',
  'Eggs',
  'Nuts',
  'Peanuts',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
  'Sulfites',
];

const DIETARY_TAGS = [
  { id: 'vegan', label: 'Vegan', icon: Leaf },
  { id: 'vegetarian', label: 'Vegetarian', icon: Leaf },
  { id: 'gluten-free', label: 'Gluten-Free', icon: Wheat },
  { id: 'dairy-free', label: 'Dairy-Free', icon: Tag },
  { id: 'keto', label: 'Keto', icon: Tag },
  { id: 'low-carb', label: 'Low-Carb', icon: Tag },
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Column configuration for exports
const MENU_ITEM_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Item Name', type: 'string' },
  { key: 'categoryId', header: 'Category', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'basePrice', header: 'Price', type: 'currency' },
  { key: 'foodCost', header: 'Food Cost', type: 'currency' },
  { key: 'calories', header: 'Calories', type: 'number' },
  { key: 'allergens', header: 'Allergens', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : '' },
  { key: 'dietaryTags', header: 'Dietary Tags', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : '' },
  { key: 'isSpecial', header: 'Featured', type: 'boolean' },
];

export const MenuBuilderTool: React.FC<MenuBuilderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: menuItems,
    setData: setMenuItems,
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
  } = useToolData<MenuItem>('menu-builder', [], MENU_ITEM_COLUMNS);

  // Local state
  const [categories, setCategories] = useState<MenuCategory[]>(DEFAULT_CATEGORIES);
  const [dailySpecials, setDailySpecials] = useState<DailySpecial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('appetizers');
  const [menuStyle, setMenuStyle] = useState<MenuStyle>('modern');
  const [showPreview, setShowPreview] = useState(false);
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingSpecial, setEditingSpecial] = useState<DailySpecial | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    items: true,
    specials: true,
    categories: false,
  });

  // New item form state
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    basePrice: 0,
    priceTiers: [],
    calories: 0,
    allergens: [],
    dietaryTags: [],
    imageUrl: '',
    categoryId: 'appetizers',
    isSpecial: false,
    foodCost: 0,
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description || params.amount) {
        setNewItem(prev => ({
          ...prev,
          name: params.title || prev.name,
          description: params.description || prev.description,
          basePrice: params.amount || prev.basePrice,
        }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    categories.forEach((cat) => {
      grouped[cat.id] = menuItems.filter((item) => item.categoryId === cat.id);
    });
    return grouped;
  }, [menuItems, categories]);

  const costAnalysis = useMemo(() => {
    const analysis = menuItems.map((item) => {
      const costPercentage = item.basePrice > 0 ? (item.foodCost / item.basePrice) * 100 : 0;
      const markup = item.foodCost > 0 ? ((item.basePrice - item.foodCost) / item.foodCost) * 100 : 0;
      const profit = item.basePrice - item.foodCost;
      return {
        ...item,
        costPercentage,
        markup,
        profit,
      };
    });

    const totalRevenue = analysis.reduce((sum, item) => sum + item.basePrice, 0);
    const totalCost = analysis.reduce((sum, item) => sum + item.foodCost, 0);
    const averageCostPercentage = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;
    const averageMarkup = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

    return {
      items: analysis,
      totalRevenue,
      totalCost,
      averageCostPercentage,
      averageMarkup,
      totalProfit: totalRevenue - totalCost,
    };
  }, [menuItems]);

  // Handlers
  const handleAddItem = () => {
    if (!newItem.name || !newItem.basePrice) return;

    const item: MenuItem = {
      id: `item-${Date.now()}`,
      name: newItem.name || '',
      description: newItem.description || '',
      basePrice: newItem.basePrice || 0,
      priceTiers: newItem.priceTiers || [],
      calories: newItem.calories || 0,
      allergens: newItem.allergens || [],
      dietaryTags: newItem.dietaryTags || [],
      imageUrl: newItem.imageUrl || '',
      categoryId: newItem.categoryId || selectedCategory,
      isSpecial: newItem.isSpecial || false,
      foodCost: newItem.foodCost || 0,
    };

    addItem(item);
    setNewItem({
      name: '',
      description: '',
      basePrice: 0,
      priceTiers: [],
      calories: 0,
      allergens: [],
      dietaryTags: [],
      imageUrl: '',
      categoryId: selectedCategory,
      isSpecial: false,
      foodCost: 0,
    });
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    updateItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    deleteItem(id);
    setDailySpecials(dailySpecials.filter((special) => special.menuItemId !== id));
  };

  const handleAddPriceTier = (isEditing: boolean = false) => {
    const newTier = { size: '', price: 0 };
    if (isEditing && editingItem) {
      setEditingItem({
        ...editingItem,
        priceTiers: [...editingItem.priceTiers, newTier],
      });
    } else {
      setNewItem({
        ...newItem,
        priceTiers: [...(newItem.priceTiers || []), newTier],
      });
    }
  };

  const handleRemovePriceTier = (index: number, isEditing: boolean = false) => {
    if (isEditing && editingItem) {
      setEditingItem({
        ...editingItem,
        priceTiers: editingItem.priceTiers.filter((_, i) => i !== index),
      });
    } else {
      setNewItem({
        ...newItem,
        priceTiers: (newItem.priceTiers || []).filter((_, i) => i !== index),
      });
    }
  };

  const handleAddSpecial = () => {
    const special: DailySpecial = {
      id: `special-${Date.now()}`,
      dayOfWeek: 'Monday',
      menuItemId: '',
      discountPercent: 10,
      description: '',
    };
    setDailySpecials([...dailySpecials, special]);
    setEditingSpecial(special);
  };

  const handleUpdateSpecial = (special: DailySpecial) => {
    setDailySpecials(dailySpecials.map((s) => (s.id === special.id ? special : s)));
  };

  const handleDeleteSpecial = (id: string) => {
    setDailySpecials(dailySpecials.filter((s) => s.id !== id));
    if (editingSpecial?.id === id) setEditingSpecial(null);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Confirm Reset',
      message: 'Are you sure you want to reset all menu data?',
      confirmText: 'Yes, Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setCategories(DEFAULT_CATEGORIES);
      setMenuItems([]);
      setDailySpecials([]);
      setMenuStyle('modern');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleAllergen = (allergen: string, isEditing: boolean = false) => {
    if (isEditing && editingItem) {
      const allergens = editingItem.allergens.includes(allergen)
        ? editingItem.allergens.filter((a) => a !== allergen)
        : [...editingItem.allergens, allergen];
      setEditingItem({ ...editingItem, allergens });
    } else {
      const allergens = (newItem.allergens || []).includes(allergen)
        ? (newItem.allergens || []).filter((a) => a !== allergen)
        : [...(newItem.allergens || []), allergen];
      setNewItem({ ...newItem, allergens });
    }
  };

  const toggleDietaryTag = (tag: string, isEditing: boolean = false) => {
    if (isEditing && editingItem) {
      const tags = editingItem.dietaryTags.includes(tag)
        ? editingItem.dietaryTags.filter((t) => t !== tag)
        : [...editingItem.dietaryTags, tag];
      setEditingItem({ ...editingItem, dietaryTags: tags });
    } else {
      const tags = (newItem.dietaryTags || []).includes(tag)
        ? (newItem.dietaryTags || []).filter((t) => t !== tag)
        : [...(newItem.dietaryTags || []), tag];
      setNewItem({ ...newItem, dietaryTags: tags });
    }
  };

  // Render menu item form
  const renderItemForm = (item: Partial<MenuItem>, isEditing: boolean = false) => {
    const setItem = isEditing
      ? (updates: Partial<MenuItem>) => setEditingItem({ ...editingItem!, ...updates })
      : (updates: Partial<MenuItem>) => setNewItem({ ...newItem, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.menuBuilder.itemName', 'Item Name *')}
            </label>
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => setItem({ name: e.target.value })}
              placeholder={t('tools.menuBuilder.eGCaesarSalad', 'e.g., Caesar Salad')}
              className={`w-full px-4 py-2.5 border ${
                isDark
                  ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                  : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
              } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.menuBuilder.category', 'Category')}
            </label>
            <select
              value={item.categoryId || selectedCategory}
              onChange={(e) => setItem({ categoryId: e.target.value })}
              className={`w-full px-4 py-2.5 border ${
                isDark
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-200 bg-white text-gray-900'
              } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.menuBuilder.description', 'Description')}
          </label>
          <textarea
            value={item.description || ''}
            onChange={(e) => setItem({ description: e.target.value })}
            placeholder={t('tools.menuBuilder.describeTheDish', 'Describe the dish...')}
            rows={2}
            className={`w-full px-4 py-2.5 border ${
              isDark
                ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
            } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.menuBuilder.basePrice', 'Base Price ($) *')}
            </label>
            <input
              type="number"
              value={item.basePrice || ''}
              onChange={(e) => setItem({ basePrice: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-4 py-2.5 border ${
                isDark
                  ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                  : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
              } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.menuBuilder.calories', 'Calories')}
            </label>
            <input
              type="number"
              value={item.calories || ''}
              onChange={(e) => setItem({ calories: parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              className={`w-full px-4 py-2.5 border ${
                isDark
                  ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                  : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
              } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.menuBuilder.foodCost', 'Food Cost ($)')}
            </label>
            <input
              type="number"
              value={item.foodCost || ''}
              onChange={(e) => setItem({ foodCost: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-4 py-2.5 border ${
                isDark
                  ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                  : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
              } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>
        </div>

        {/* Price Tiers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.menuBuilder.priceTiersOptional', 'Price Tiers (Optional)')}
            </label>
            <button
              onClick={() => handleAddPriceTier(isEditing)}
              className="text-sm text-[#0D9488] hover:text-[#0D9488]/80 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Tier
            </button>
          </div>
          {(item.priceTiers || []).map((tier, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                value={tier.size}
                onChange={(e) => {
                  const tiers = [...(item.priceTiers || [])];
                  tiers[index] = { ...tiers[index], size: e.target.value };
                  setItem({ priceTiers: tiers });
                }}
                placeholder={t('tools.menuBuilder.sizeEGSmall', 'Size (e.g., Small)')}
                className={`flex-1 px-3 py-2 border ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                    : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                } rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-sm`}
              />
              <input
                type="number"
                value={tier.price || ''}
                onChange={(e) => {
                  const tiers = [...(item.priceTiers || [])];
                  tiers[index] = { ...tiers[index], price: parseFloat(e.target.value) || 0 };
                  setItem({ priceTiers: tiers });
                }}
                placeholder={t('tools.menuBuilder.price2', 'Price')}
                min="0"
                step="0.01"
                className={`w-24 px-3 py-2 border ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                    : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                } rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-sm`}
              />
              <button
                onClick={() => handleRemovePriceTier(index, isEditing)}
                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.menuBuilder.imageUrlOptional', 'Image URL (Optional)')}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={item.imageUrl || ''}
              onChange={(e) => setItem({ imageUrl: e.target.value })}
              placeholder={t('tools.menuBuilder.httpsExampleComImageJpg', 'https://example.com/image.jpg')}
              className={`flex-1 px-4 py-2.5 border ${
                isDark
                  ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                  : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
              } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
            {item.imageUrl && (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <img src={item.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Allergens */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.menuBuilder.allergens', 'Allergens')}
          </label>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((allergen) => (
              <button
                key={allergen}
                onClick={() => toggleAllergen(allergen, isEditing)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  (item.allergens || []).includes(allergen)
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {allergen}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Tags */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.menuBuilder.dietaryTags', 'Dietary Tags')}
          </label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleDietaryTag(tag.id, isEditing)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                  (item.dietaryTags || []).includes(tag.id)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tag.icon className="w-3.5 h-3.5" />
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mark as Special */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={isEditing ? 'edit-special' : 'new-special'}
            checked={item.isSpecial || false}
            onChange={(e) => setItem({ isSpecial: e.target.checked })}
            className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
          />
          <label
            htmlFor={isEditing ? 'edit-special' : 'new-special'}
            className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {t('tools.menuBuilder.markAsFeaturedSpecialItem', 'Mark as featured/special item')}
          </label>
        </div>
      </div>
    );
  };

  // Menu Preview Component
  const renderMenuPreview = () => {
    const styleClasses = {
      classic: {
        container: 'font-serif bg-amber-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100',
        header: 'text-center border-b-2 border-amber-800 dark:border-amber-600 pb-4 mb-6',
        title: 'text-4xl font-bold text-amber-900 dark:text-amber-400',
        category: 'text-2xl font-bold text-amber-800 dark:text-amber-500 border-b border-amber-300 dark:border-amber-700 pb-2 mb-4',
        item: 'flex justify-between items-start mb-3',
        itemName: 'font-semibold text-gray-900 dark:text-gray-100',
        itemDesc: 'text-sm text-gray-600 dark:text-gray-400 italic',
        price: 'font-bold text-amber-800 dark:text-amber-500',
      },
      modern: {
        container: 'font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
        header: 'text-center mb-8',
        title: 'text-5xl font-light tracking-wide text-gray-800 dark:text-gray-200',
        category: 'text-xl font-semibold uppercase tracking-widest text-[#0D9488] mb-4',
        item: 'flex justify-between items-start mb-4 pb-4 border-b border-gray-100 dark:border-gray-800',
        itemName: 'font-medium text-gray-900 dark:text-gray-100',
        itemDesc: 'text-sm text-gray-500 dark:text-gray-400 mt-1',
        price: 'font-semibold text-[#0D9488]',
      },
      casual: {
        container: 'font-sans bg-orange-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100',
        header: 'text-center mb-6',
        title: 'text-3xl font-bold text-orange-600 dark:text-orange-400',
        category: 'text-lg font-bold text-orange-700 dark:text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg mb-4',
        item: 'flex justify-between items-start mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm',
        itemName: 'font-bold text-gray-800 dark:text-gray-200',
        itemDesc: 'text-sm text-gray-600 dark:text-gray-400',
        price: 'font-bold text-orange-600 dark:text-orange-400',
      },
    };

    const styles = styleClasses[menuStyle];

    return (
      <div className={`${styles.container} p-8 min-h-[600px] print:bg-white print:text-black`}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('tools.menuBuilder.ourMenu', 'Our Menu')}</h1>
        </div>

        {categories
          .sort((a, b) => a.order - b.order)
          .map((category) => {
            const items = itemsByCategory[category.id] || [];
            if (items.length === 0) return null;

            return (
              <div key={category.id} className="mb-8">
                <h2 className={styles.category}>{category.name}</h2>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className={styles.item}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={styles.itemName}>{item.name}</span>
                          {item.dietaryTags.includes('vegan') && (
                            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">V</span>
                          )}
                          {item.dietaryTags.includes('gluten-free') && (
                            <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">GF</span>
                          )}
                          {item.isSpecial && (
                            <span className="text-xs px-1.5 py-0.5 bg-[#0D9488]/10 text-[#0D9488] rounded">{t('tools.menuBuilder.special', 'Special')}</span>
                          )}
                        </div>
                        {item.description && <p className={styles.itemDesc}>{item.description}</p>}
                        {item.calories > 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">{item.calories} cal</span>
                        )}
                        {item.priceTiers.length > 0 && (
                          <div className="flex gap-2 mt-1">
                            {item.priceTiers.map((tier, i) => (
                              <span key={i} className="text-xs text-gray-500">
                                {tier.size}: ${tier.price.toFixed(2)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={styles.price}>${item.basePrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        {/* Daily Specials Section */}
        {dailySpecials.length > 0 && (
          <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300 dark:border-gray-700">
            <h2 className={styles.category}>{t('tools.menuBuilder.dailySpecials', 'Daily Specials')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailySpecials.map((special) => {
                const menuItem = menuItems.find((item) => item.menuItemId === special.menuItemId);
                return (
                  <div
                    key={special.id}
                    className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="font-bold text-[#0D9488]">{special.dayOfWeek}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {menuItem?.name || special.description}
                    </div>
                    {special.discountPercent > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        {special.discountPercent}% OFF
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Allergen Notice */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Please inform your server of any allergies. V = Vegan, GF = Gluten-Free
          </p>
        </div>
      </div>
    );
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.menuBuilder.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                  <UtensilsCrossed className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.menuBuilder.restaurantMenuBuilder', 'Restaurant Menu Builder')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.menuBuilder.createAndManageYourRestaurant', 'Create and manage your restaurant menu')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="menu-builder" toolName="Menu Builder" />

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
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    showPreview
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {t('tools.menuBuilder.preview', 'Preview')}
                </button>
                <button
                  onClick={() => setShowCostAnalysis(!showCostAnalysis)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    showCostAnalysis
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  {t('tools.menuBuilder.costAnalysis', 'Cost Analysis')}
                </button>
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'menu-items' })}
                  onExportExcel={() => exportExcel({ filename: 'menu-items' })}
                  onExportJSON={() => exportJSON({ filename: 'menu-items' })}
                  onExportPDF={() => exportPDF({
                    filename: 'menu-items',
                    title: 'Restaurant Menu Items',
                    subtitle: `${menuItems.length} items across ${categories.length} categories`,
                  })}
                  onPrint={() => print('Restaurant Menu Items')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={menuItems.length === 0}
                />
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                    isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.menuBuilder.reset', 'Reset')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Cost Analysis Panel */}
        {showCostAnalysis && (
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <DollarSign className="w-5 h-5 text-[#0D9488]" />
                {t('tools.menuBuilder.costAnalysis2', 'Cost Analysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.totalRevenue', 'Total Revenue')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${costAnalysis.totalRevenue.toFixed(2)}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.totalFoodCost', 'Total Food Cost')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${costAnalysis.totalCost.toFixed(2)}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.avgCost', 'Avg Cost %')}</div>
                  <div className={`text-2xl font-bold ${costAnalysis.averageCostPercentage > 35 ? 'text-red-500' : 'text-green-500'}`}>
                    {costAnalysis.averageCostPercentage.toFixed(1)}%
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.avgMarkup', 'Avg Markup')}</div>
                  <div className={`text-2xl font-bold text-[#0D9488]`}>
                    {costAnalysis.averageMarkup.toFixed(1)}%
                  </div>
                </div>
              </div>

              {costAnalysis.items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                        <th className={`text-left py-2 px-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.item', 'Item')}</th>
                        <th className={`text-right py-2 px-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.price', 'Price')}</th>
                        <th className={`text-right py-2 px-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.cost', 'Cost')}</th>
                        <th className={`text-right py-2 px-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.cost2', 'Cost %')}</th>
                        <th className={`text-right py-2 px-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.markup', 'Markup')}</th>
                        <th className={`text-right py-2 px-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.menuBuilder.profit', 'Profit')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costAnalysis.items.map((item) => (
                        <tr key={item.id} className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-100'}>
                          <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.name}</td>
                          <td className={`py-2 px-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${item.basePrice.toFixed(2)}</td>
                          <td className={`py-2 px-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${item.foodCost.toFixed(2)}</td>
                          <td className={`py-2 px-3 text-right ${item.costPercentage > 35 ? 'text-red-500' : 'text-green-500'}`}>
                            {item.costPercentage.toFixed(1)}%
                          </td>
                          <td className={`py-2 px-3 text-right text-[#0D9488]`}>{item.markup.toFixed(1)}%</td>
                          <td className={`py-2 px-3 text-right font-medium ${item.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${item.profit.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Menu Preview */}
        {showPreview && (
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Eye className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.menuBuilder.menuPreview', 'Menu Preview')}
                </CardTitle>
                <div className="flex gap-2">
                  {(['classic', 'modern', 'casual'] as MenuStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setMenuStyle(style)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                        menuStyle === style
                          ? 'bg-[#0D9488] text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden rounded-b-lg">
              {renderMenuPreview()}
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Add/Edit Item */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add New Item */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('items')}
                >
                  <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Plus className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.menuBuilder.addMenuItem', 'Add Menu Item')}
                  </CardTitle>
                  {expandedSections.items ? (
                    <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
              </CardHeader>
              {expandedSections.items && (
                <CardContent>
                  {renderItemForm(newItem)}
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.name || !newItem.basePrice}
                    className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.menuBuilder.addItemToMenu', 'Add Item to Menu')}
                  </button>
                </CardContent>
              )}
            </Card>

            {/* Edit Item Modal */}
            {editingItem && (
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Edit2 className="w-5 h-5 text-[#0D9488]" />
                      {t('tools.menuBuilder.editMenuItem', 'Edit Menu Item')}
                    </CardTitle>
                    <button
                      onClick={() => setEditingItem(null)}
                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderItemForm(editingItem, true)}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleUpdateItem}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
                    >
                      <Save className="w-5 h-5" />
                      {t('tools.menuBuilder.saveChanges', 'Save Changes')}
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                        isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t('tools.menuBuilder.cancel', 'Cancel')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Daily Specials */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('specials')}
                >
                  <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Tag className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.menuBuilder.dailySpecials2', 'Daily Specials')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSpecial();
                      }}
                      className="text-sm text-[#0D9488] hover:text-[#0D9488]/80 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Special
                    </button>
                    {expandedSections.specials ? (
                      <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedSections.specials && (
                <CardContent>
                  {dailySpecials.length === 0 ? (
                    <p className={`text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('tools.menuBuilder.noDailySpecialsAddedYet', 'No daily specials added yet')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {dailySpecials.map((special) => (
                        <div
                          key={special.id}
                          className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select
                              value={special.dayOfWeek}
                              onChange={(e) =>
                                handleUpdateSpecial({ ...special, dayOfWeek: e.target.value })
                              }
                              className={`px-3 py-2 border ${
                                isDark
                                  ? 'border-gray-600 bg-gray-600 text-white'
                                  : 'border-gray-200 bg-white text-gray-900'
                              } rounded-lg text-sm`}
                            >
                              {DAYS_OF_WEEK.map((day) => (
                                <option key={day} value={day}>
                                  {day}
                                </option>
                              ))}
                            </select>
                            <select
                              value={special.menuItemId}
                              onChange={(e) =>
                                handleUpdateSpecial({ ...special, menuItemId: e.target.value })
                              }
                              className={`px-3 py-2 border ${
                                isDark
                                  ? 'border-gray-600 bg-gray-600 text-white'
                                  : 'border-gray-200 bg-white text-gray-900'
                              } rounded-lg text-sm`}
                            >
                              <option value="">{t('tools.menuBuilder.selectItem', 'Select item...')}</option>
                              {menuItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={special.discountPercent}
                              onChange={(e) =>
                                handleUpdateSpecial({
                                  ...special,
                                  discountPercent: parseInt(e.target.value) || 0,
                                })
                              }
                              placeholder={t('tools.menuBuilder.discount', 'Discount %')}
                              min="0"
                              max="100"
                              className={`px-3 py-2 border ${
                                isDark
                                  ? 'border-gray-600 bg-gray-600 text-white placeholder:text-gray-400'
                                  : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                              } rounded-lg text-sm`}
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={special.description}
                                onChange={(e) =>
                                  handleUpdateSpecial({ ...special, description: e.target.value })
                                }
                                placeholder={t('tools.menuBuilder.descriptionOptional', 'Description (optional)')}
                                className={`flex-1 px-3 py-2 border ${
                                  isDark
                                    ? 'border-gray-600 bg-gray-600 text-white placeholder:text-gray-400'
                                    : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                                } rounded-lg text-sm`}
                              />
                              <button
                                onClick={() => handleDeleteSpecial(special.id)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right Column - Menu Items List */}
          <div className="space-y-6">
            {/* Category Tabs */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Menu Items ({menuItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-[#0D9488] text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name} ({itemsByCategory[cat.id]?.length || 0})
                    </button>
                  ))}
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {(itemsByCategory[selectedCategory] || []).length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('tools.menuBuilder.noItemsInThisCategory', 'No items in this category')}
                    </p>
                  ) : (
                    (itemsByCategory[selectedCategory] || []).map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        } ${item.isSpecial ? 'ring-2 ring-[#0D9488]/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div
                              className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                                isDark ? 'bg-gray-600' : 'bg-gray-200'
                              }`}
                            >
                              <Image className={`w-6 h-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {item.name}
                              </h4>
                              {item.isSpecial && (
                                <span className="text-xs px-1.5 py-0.5 bg-[#0D9488]/10 text-[#0D9488] rounded">
                                  {t('tools.menuBuilder.special2', 'Special')}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[#0D9488] font-semibold">
                                ${item.basePrice.toFixed(2)}
                              </span>
                              {item.calories > 0 && (
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {item.calories} cal
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.dietaryTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {item.allergens.slice(0, 2).map((allergen) => (
                                <span
                                  key={allergen}
                                  className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded"
                                >
                                  {allergen}
                                </span>
                              ))}
                              {item.allergens.length > 2 && (
                                <span className="text-xs text-gray-500">+{item.allergens.length - 2}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => setEditingItem(item)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-white,
          .print\\:bg-white * {
            visibility: visible;
          }
          .print\\:bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <ConfirmDialog />
    </div>
  );
};

export default MenuBuilderTool;
