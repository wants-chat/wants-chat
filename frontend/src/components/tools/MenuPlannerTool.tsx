'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  DollarSign,
  Clock,
  ChefHat,
  Leaf,
  Flame,
  Star,
  Eye,
  EyeOff,
  Copy,
  Tag,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface MenuPlannerToolProps {
  uiConfig?: UIConfig;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  subcategory: string;
  price: number;
  cost: number;
  profitMargin: number;
  preparationTime: number;
  calories: number;
  allergens: string[];
  dietaryTags: DietaryTag[];
  ingredients: string[];
  isAvailable: boolean;
  isPopular: boolean;
  isNew: boolean;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

type MenuCategory = 'appetizer' | 'soup' | 'salad' | 'main-course' | 'side' | 'dessert' | 'beverage' | 'special';
type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'halal' | 'kosher' | 'spicy' | 'low-carb' | 'keto';

const MENU_CATEGORIES: { value: MenuCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'appetizer', label: 'Appetizers', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { value: 'soup', label: 'Soups', icon: <ChefHat className="w-4 h-4" /> },
  { value: 'salad', label: 'Salads', icon: <Leaf className="w-4 h-4" /> },
  { value: 'main-course', label: 'Main Courses', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { value: 'side', label: 'Sides', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { value: 'dessert', label: 'Desserts', icon: <Star className="w-4 h-4" /> },
  { value: 'beverage', label: 'Beverages', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { value: 'special', label: 'Specials', icon: <Flame className="w-4 h-4" /> },
];

const DIETARY_TAGS: { value: DietaryTag; label: string; color: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian', color: 'green' },
  { value: 'vegan', label: 'Vegan', color: 'emerald' },
  { value: 'gluten-free', label: 'Gluten-Free', color: 'yellow' },
  { value: 'dairy-free', label: 'Dairy-Free', color: 'blue' },
  { value: 'nut-free', label: 'Nut-Free', color: 'orange' },
  { value: 'halal', label: 'Halal', color: 'purple' },
  { value: 'kosher', label: 'Kosher', color: 'indigo' },
  { value: 'spicy', label: 'Spicy', color: 'red' },
  { value: 'low-carb', label: 'Low-Carb', color: 'cyan' },
  { value: 'keto', label: 'Keto', color: 'pink' },
];

const COMMON_ALLERGENS = ['Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soybeans', 'Sesame'];

const menuItemColumns: ColumnConfig[] = [
  { key: 'id', header: 'Item ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'cost', header: 'Cost', type: 'currency' },
  { key: 'profitMargin', header: 'Margin %', type: 'number' },
  { key: 'preparationTime', header: 'Prep Time (min)', type: 'number' },
  { key: 'calories', header: 'Calories', type: 'number' },
  { key: 'isAvailable', header: 'Available', type: 'boolean' },
  { key: 'isPopular', header: 'Popular', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const generateSampleMenuItems = (): MenuItem[] => {
  return [
    {
      id: 'MENU-001',
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce, parmesan cheese, croutons, and house-made Caesar dressing',
      category: 'salad',
      subcategory: 'Classic',
      price: 14.99,
      cost: 4.50,
      profitMargin: 70,
      preparationTime: 10,
      calories: 320,
      allergens: ['Milk', 'Eggs', 'Wheat', 'Fish'],
      dietaryTags: [],
      ingredients: ['Romaine lettuce', 'Parmesan', 'Croutons', 'Caesar dressing', 'Anchovies'],
      isAvailable: true,
      isPopular: true,
      isNew: false,
      imageUrl: '',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MENU-002',
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon grilled to perfection, served with seasonal vegetables and lemon butter sauce',
      category: 'main-course',
      subcategory: 'Seafood',
      price: 32.99,
      cost: 12.00,
      profitMargin: 64,
      preparationTime: 25,
      calories: 480,
      allergens: ['Fish', 'Milk'],
      dietaryTags: ['gluten-free'],
      ingredients: ['Salmon fillet', 'Asparagus', 'Cherry tomatoes', 'Lemon', 'Butter', 'Herbs'],
      isAvailable: true,
      isPopular: true,
      isNew: false,
      imageUrl: '',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MENU-003',
      name: 'Vegan Buddha Bowl',
      description: 'Quinoa, roasted chickpeas, avocado, sweet potato, and tahini dressing',
      category: 'main-course',
      subcategory: 'Plant-Based',
      price: 18.99,
      cost: 5.50,
      profitMargin: 71,
      preparationTime: 15,
      calories: 520,
      allergens: ['Sesame'],
      dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
      ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Sweet potato', 'Kale', 'Tahini'],
      isAvailable: true,
      isPopular: false,
      isNew: true,
      imageUrl: '',
      sortOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MENU-004',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
      category: 'dessert',
      subcategory: 'Chocolate',
      price: 12.99,
      cost: 3.00,
      profitMargin: 77,
      preparationTime: 20,
      calories: 680,
      allergens: ['Milk', 'Eggs', 'Wheat'],
      dietaryTags: ['vegetarian'],
      ingredients: ['Dark chocolate', 'Butter', 'Eggs', 'Flour', 'Sugar', 'Vanilla ice cream'],
      isAvailable: true,
      isPopular: true,
      isNew: false,
      imageUrl: '',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MENU-005',
      name: 'Thai Chicken Curry',
      description: 'Tender chicken in aromatic red curry with coconut milk, Thai basil, and jasmine rice',
      category: 'main-course',
      subcategory: 'Asian',
      price: 24.99,
      cost: 7.50,
      profitMargin: 70,
      preparationTime: 20,
      calories: 620,
      allergens: ['Tree Nuts'],
      dietaryTags: ['gluten-free', 'dairy-free', 'spicy'],
      ingredients: ['Chicken thigh', 'Coconut milk', 'Red curry paste', 'Thai basil', 'Bamboo shoots', 'Jasmine rice'],
      isAvailable: true,
      isPopular: false,
      isNew: false,
      imageUrl: '',
      sortOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

export const MenuPlannerTool: React.FC<MenuPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const menuData = useToolData<MenuItem>(
    'menu-planner',
    generateSampleMenuItems(),
    menuItemColumns,
    { autoSave: true }
  );

  const menuItems = menuData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<MenuCategory | ''>('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    category: 'main-course',
    subcategory: '',
    price: 0,
    cost: 0,
    preparationTime: 15,
    calories: 0,
    allergens: [],
    dietaryTags: [],
    ingredients: [],
    isAvailable: true,
    isPopular: false,
    isNew: true,
    imageUrl: '',
    sortOrder: 0,
  });

  const calculateProfitMargin = (price: number, cost: number): number => {
    if (price === 0) return 0;
    return Math.round(((price - cost) / price) * 100);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;

    const price = newItem.price || 0;
    const cost = newItem.cost || 0;

    const menuItem: MenuItem = {
      id: `MENU-${Date.now().toString().slice(-6)}`,
      name: newItem.name || '',
      description: newItem.description || '',
      category: newItem.category as MenuCategory || 'main-course',
      subcategory: newItem.subcategory || '',
      price: price,
      cost: cost,
      profitMargin: calculateProfitMargin(price, cost),
      preparationTime: newItem.preparationTime || 15,
      calories: newItem.calories || 0,
      allergens: newItem.allergens || [],
      dietaryTags: newItem.dietaryTags || [],
      ingredients: newItem.ingredients || [],
      isAvailable: newItem.isAvailable ?? true,
      isPopular: newItem.isPopular || false,
      isNew: true,
      imageUrl: newItem.imageUrl || '',
      sortOrder: newItem.sortOrder || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    menuData.addItem(menuItem);
    resetNewItem();
    setShowForm(false);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    const profitMargin = calculateProfitMargin(editingItem.price, editingItem.cost);
    menuData.updateItem(editingItem.id, {
      ...editingItem,
      profitMargin,
      updatedAt: new Date().toISOString(),
    });
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    menuData.deleteItem(id);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleToggleAvailability = (item: MenuItem) => {
    menuData.updateItem(item.id, {
      isAvailable: !item.isAvailable,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDuplicateItem = (item: MenuItem) => {
    const duplicatedItem: MenuItem = {
      ...item,
      id: `MENU-${Date.now().toString().slice(-6)}`,
      name: `${item.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    menuData.addItem(duplicatedItem);
  };

  const resetNewItem = () => {
    setNewItem({
      name: '',
      description: '',
      category: 'main-course',
      subcategory: '',
      price: 0,
      cost: 0,
      preparationTime: 15,
      calories: 0,
      allergens: [],
      dietaryTags: [],
      ingredients: [],
      isAvailable: true,
      isPopular: false,
      isNew: true,
      imageUrl: '',
      sortOrder: 0,
    });
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || item.category === filterCategory;
      const matchesAvailability = filterAvailability === 'all' ||
        (filterAvailability === 'available' && item.isAvailable) ||
        (filterAvailability === 'unavailable' && !item.isAvailable);
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [menuItems, searchQuery, filterCategory, filterAvailability]);

  const stats = useMemo(() => {
    return {
      total: menuItems.length,
      available: menuItems.filter(i => i.isAvailable).length,
      popular: menuItems.filter(i => i.isPopular).length,
      avgMargin: menuItems.length > 0
        ? Math.round(menuItems.reduce((sum, i) => sum + i.profitMargin, 0) / menuItems.length)
        : 0,
    };
  }, [menuItems]);

  const groupedItems = useMemo(() => {
    const grouped: Record<MenuCategory, MenuItem[]> = {
      'appetizer': [],
      'soup': [],
      'salad': [],
      'main-course': [],
      'side': [],
      'dessert': [],
      'beverage': [],
      'special': [],
    };
    filteredItems.forEach(item => {
      grouped[item.category].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const getTagColor = (tag: DietaryTag) => {
    const tagObj = DIETARY_TAGS.find(t => t.value === tag);
    const colors: Record<string, string> = {
      green: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      emerald: isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      yellow: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      blue: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      orange: isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
      purple: isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800',
      indigo: isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-800',
      red: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
      cyan: isDark ? 'bg-cyan-900/50 text-cyan-300' : 'bg-cyan-100 text-cyan-800',
      pink: isDark ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-100 text-pink-800',
    };
    return colors[tagObj?.color || 'gray'];
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7 text-orange-500" />
              {t('tools.menuPlanner.menuPlanner', 'Menu Planner')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.menuPlanner.planAndManageYourRestaurant', 'Plan and manage your restaurant menu items')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="menu-planner" toolName="Menu Planner" />

            <SyncStatus
              isSynced={menuData.isSynced}
              isSaving={menuData.isSaving}
              lastSaved={menuData.lastSaved}
              syncError={menuData.syncError}
              onForceSync={menuData.forceSync}
            />
            <ExportDropdown
              onExportCSV={() => menuData.exportCSV()}
              onExportExcel={() => menuData.exportExcel()}
              onExportJSON={() => menuData.exportJSON()}
              onExportPDF={() => menuData.exportPDF()}
              onCopy={() => menuData.copyToClipboard()}
              onPrint={() => menuData.print('Menu Items')}
            />
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.menuPlanner.addItem', 'Add Item')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.menuPlanner.totalItems', 'Total Items')}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.menuPlanner.available', 'Available')}</p>
            <p className="text-2xl font-bold text-green-500">{stats.available}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.menuPlanner.popular', 'Popular')}</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.popular}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.menuPlanner.avgMargin', 'Avg Margin')}</p>
            <p className="text-2xl font-bold text-blue-500">{stats.avgMargin}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.menuPlanner.searchMenuItems', 'Search menu items...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as MenuCategory | '')}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">{t('tools.menuPlanner.allCategories', 'All Categories')}</option>
              {MENU_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value as 'all' | 'available' | 'unavailable')}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.menuPlanner.allItems', 'All Items')}</option>
              <option value="available">{t('tools.menuPlanner.availableOnly', 'Available Only')}</option>
              <option value="unavailable">{t('tools.menuPlanner.unavailableOnly', 'Unavailable Only')}</option>
            </select>
          </div>
        </div>

        {/* Menu Items by Category */}
        <div className="space-y-6">
          {MENU_CATEGORIES.map(category => {
            const items = groupedItems[category.value];
            if (items.length === 0 && filterCategory) return null;

            return (
              <div key={category.value} className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
                <div className={`px-4 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex items-center gap-2`}>
                  {category.icon}
                  <h2 className="font-semibold">{category.label}</h2>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({items.length})
                  </span>
                </div>
                {items.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className={`p-4 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{item.name}</h3>
                              {item.isPopular && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                              {item.isNew && (
                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">{t('tools.menuPlanner.new', 'NEW')}</span>
                              )}
                              {!item.isAvailable && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{t('tools.menuPlanner.unavailable', 'UNAVAILABLE')}</span>
                              )}
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                              {item.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.dietaryTags.map(tag => (
                                <span
                                  key={tag}
                                  className={`px-2 py-0.5 rounded-full text-xs ${getTagColor(tag)}`}
                                >
                                  {DIETARY_TAGS.find(t => t.value === tag)?.label}
                                </span>
                              ))}
                            </div>
                            <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {item.preparationTime} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3" /> {item.calories} cal
                              </span>
                              <span className="flex items-center gap-1">
                                Cost: ${item.cost.toFixed(2)}
                              </span>
                              <span className="flex items-center gap-1">
                                Margin: {item.profitMargin}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">${item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => handleToggleAvailability(item)}
                                className={`p-1 rounded ${item.isAvailable ? 'text-green-500' : 'text-red-500'} hover:bg-gray-200 dark:hover:bg-gray-600`}
                                title={item.isAvailable ? t('tools.menuPlanner.markUnavailable', 'Mark Unavailable') : t('tools.menuPlanner.markAvailable', 'Mark Available')}
                              >
                                {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDuplicateItem(item)}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                title={t('tools.menuPlanner.duplicate', 'Duplicate')}
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingItem(item)}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                title={t('tools.menuPlanner.edit', 'Edit')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.menuPlanner.noItemsInThisCategory', 'No items in this category')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add/Edit Item Modal */}
        {(showForm || editingItem) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingItem ? t('tools.menuPlanner.editMenuItem', 'Edit Menu Item') : t('tools.menuPlanner.addMenuItem', 'Add Menu Item')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    resetNewItem();
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.itemName', 'Item Name *')}</label>
                  <input
                    type="text"
                    value={editingItem?.name || newItem.name}
                    onChange={(e) => editingItem
                      ? setEditingItem({...editingItem, name: e.target.value})
                      : setNewItem({...newItem, name: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.description', 'Description')}</label>
                  <textarea
                    rows={2}
                    value={editingItem?.description || newItem.description}
                    onChange={(e) => editingItem
                      ? setEditingItem({...editingItem, description: e.target.value})
                      : setNewItem({...newItem, description: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.category', 'Category *')}</label>
                  <select
                    value={editingItem?.category || newItem.category}
                    onChange={(e) => editingItem
                      ? setEditingItem({...editingItem, category: e.target.value as MenuCategory})
                      : setNewItem({...newItem, category: e.target.value as MenuCategory})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {MENU_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.subcategory', 'Subcategory')}</label>
                  <input
                    type="text"
                    value={editingItem?.subcategory || newItem.subcategory}
                    onChange={(e) => editingItem
                      ? setEditingItem({...editingItem, subcategory: e.target.value})
                      : setNewItem({...newItem, subcategory: e.target.value})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.price', 'Price *')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingItem?.price || newItem.price}
                    onChange={(e) => editingItem
                      ? setEditingItem({...editingItem, price: parseFloat(e.target.value)})
                      : setNewItem({...newItem, price: parseFloat(e.target.value)})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.cost', 'Cost')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingItem?.cost || newItem.cost}
                    onChange={(e) => editingItem
                      ? setEditingItem({...editingItem, cost: parseFloat(e.target.value)})
                      : setNewItem({...newItem, cost: parseFloat(e.target.value)})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.prepTimeMin', 'Prep Time (min)')}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem?.preparationTime || newItem.preparationTime}
                    onChange={(e) => editingItem
                      ? setEditingItem({...editingItem, preparationTime: parseInt(e.target.value)})
                      : setNewItem({...newItem, preparationTime: parseInt(e.target.value)})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.calories', 'Calories')}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem?.calories || newItem.calories}
                    onChange={(e) => editingItem
                      ? setEditingItem({...editingItem, calories: parseInt(e.target.value)})
                      : setNewItem({...newItem, calories: parseInt(e.target.value)})
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.dietaryTags', 'Dietary Tags')}</label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_TAGS.map(tag => {
                      const isSelected = editingItem
                        ? editingItem.dietaryTags.includes(tag.value)
                        : newItem.dietaryTags?.includes(tag.value);
                      return (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => {
                            if (editingItem) {
                              const newTags = isSelected
                                ? editingItem.dietaryTags.filter(t => t !== tag.value)
                                : [...editingItem.dietaryTags, tag.value];
                              setEditingItem({...editingItem, dietaryTags: newTags});
                            } else {
                              const newTags = isSelected
                                ? (newItem.dietaryTags || []).filter(t => t !== tag.value)
                                : [...(newItem.dietaryTags || []), tag.value];
                              setNewItem({...newItem, dietaryTags: newTags});
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            isSelected
                              ? getTagColor(tag.value)
                              : isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('tools.menuPlanner.allergens', 'Allergens')}</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_ALLERGENS.map(allergen => {
                      const isSelected = editingItem
                        ? editingItem.allergens.includes(allergen)
                        : newItem.allergens?.includes(allergen);
                      return (
                        <button
                          key={allergen}
                          type="button"
                          onClick={() => {
                            if (editingItem) {
                              const newAllergens = isSelected
                                ? editingItem.allergens.filter(a => a !== allergen)
                                : [...editingItem.allergens, allergen];
                              setEditingItem({...editingItem, allergens: newAllergens});
                            } else {
                              const newAllergens = isSelected
                                ? (newItem.allergens || []).filter(a => a !== allergen)
                                : [...(newItem.allergens || []), allergen];
                              setNewItem({...newItem, allergens: newAllergens});
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            isSelected
                              ? isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                              : isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          {allergen}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem?.isAvailable ?? newItem.isAvailable}
                      onChange={(e) => editingItem
                        ? setEditingItem({...editingItem, isAvailable: e.target.checked})
                        : setNewItem({...newItem, isAvailable: e.target.checked})
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">{t('tools.menuPlanner.available2', 'Available')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem?.isPopular ?? newItem.isPopular}
                      onChange={(e) => editingItem
                        ? setEditingItem({...editingItem, isPopular: e.target.checked})
                        : setNewItem({...newItem, isPopular: e.target.checked})
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">{t('tools.menuPlanner.popular2', 'Popular')}</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    resetNewItem();
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.menuPlanner.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? t('tools.menuPlanner.update', 'Update') : t('tools.menuPlanner.add', 'Add')} Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPlannerTool;
