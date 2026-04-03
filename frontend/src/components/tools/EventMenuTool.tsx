'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Save,
  Edit2,
  Search,
  ChefHat,
  Salad,
  Cake,
  Coffee,
  Wine,
  Check,
  X,
  GripVertical,
  Copy,
  FileText,
  Sparkles,
  Users,
  DollarSign,
  Clock,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface EventMenuToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';

// Types
type MenuCategory = 'appetizer' | 'soup' | 'salad' | 'entree' | 'side' | 'dessert' | 'beverage' | 'special';
type CourseType = 'first' | 'second' | 'third' | 'fourth' | 'dessert' | 'coffee';
type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'halal' | 'kosher' | 'pescatarian';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  course: CourseType;
  pricePerPerson: number;
  costPerPerson: number;
  prepTime: number; // minutes
  dietaryTags: DietaryTag[];
  allergens: string[];
  ingredients: string[];
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface EventMenu {
  id: string;
  name: string;
  eventType: string;
  guestCount: number;
  courses: MenuCourse[];
  totalPricePerPerson: number;
  totalCostPerPerson: number;
  profitMargin: number;
  notes: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuCourse {
  id: string;
  name: string;
  courseType: CourseType;
  items: string[]; // MenuItem IDs
  order: number;
}

// Constants
const MENU_CATEGORIES: { category: MenuCategory; label: string; icon: React.ReactNode }[] = [
  { category: 'appetizer', label: 'Appetizers', icon: <Salad className="w-4 h-4" /> },
  { category: 'soup', label: 'Soups', icon: <Coffee className="w-4 h-4" /> },
  { category: 'salad', label: 'Salads', icon: <Salad className="w-4 h-4" /> },
  { category: 'entree', label: 'Entrees', icon: <ChefHat className="w-4 h-4" /> },
  { category: 'side', label: 'Sides', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { category: 'dessert', label: 'Desserts', icon: <Cake className="w-4 h-4" /> },
  { category: 'beverage', label: 'Beverages', icon: <Wine className="w-4 h-4" /> },
  { category: 'special', label: 'Specials', icon: <ChefHat className="w-4 h-4" /> },
];

const COURSE_TYPES: { type: CourseType; label: string }[] = [
  { type: 'first', label: 'First Course' },
  { type: 'second', label: 'Second Course' },
  { type: 'third', label: 'Third Course' },
  { type: 'fourth', label: 'Fourth Course' },
  { type: 'dessert', label: 'Dessert Course' },
  { type: 'coffee', label: 'Coffee & Petit Fours' },
];

const DIETARY_TAGS: { tag: DietaryTag; label: string; color: string }[] = [
  { tag: 'vegetarian', label: 'Vegetarian', color: 'bg-green-100 text-green-700' },
  { tag: 'vegan', label: 'Vegan', color: 'bg-green-100 text-green-700' },
  { tag: 'gluten-free', label: 'Gluten-Free', color: 'bg-yellow-100 text-yellow-700' },
  { tag: 'dairy-free', label: 'Dairy-Free', color: 'bg-blue-100 text-blue-700' },
  { tag: 'nut-free', label: 'Nut-Free', color: 'bg-orange-100 text-orange-700' },
  { tag: 'halal', label: 'Halal', color: 'bg-purple-100 text-purple-700' },
  { tag: 'kosher', label: 'Kosher', color: 'bg-purple-100 text-purple-700' },
  { tag: 'pescatarian', label: 'Pescatarian', color: 'bg-cyan-100 text-cyan-700' },
];

// Sample menu items
const SAMPLE_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Beef Carpaccio',
    description: 'Thinly sliced raw beef with arugula, capers, and parmesan',
    category: 'appetizer',
    course: 'first',
    pricePerPerson: 14.00,
    costPerPerson: 5.50,
    prepTime: 15,
    dietaryTags: ['gluten-free'],
    allergens: ['dairy'],
    ingredients: ['beef tenderloin', 'arugula', 'capers', 'parmesan', 'olive oil', 'lemon'],
    isActive: true,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-2',
    name: 'Roasted Butternut Squash Soup',
    description: 'Creamy soup with sage and toasted pumpkin seeds',
    category: 'soup',
    course: 'first',
    pricePerPerson: 8.00,
    costPerPerson: 2.50,
    prepTime: 45,
    dietaryTags: ['vegetarian', 'gluten-free'],
    allergens: ['dairy'],
    ingredients: ['butternut squash', 'onion', 'cream', 'sage', 'pumpkin seeds'],
    isActive: true,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-3',
    name: 'Caesar Salad',
    description: 'Romaine hearts with classic dressing, croutons, and parmesan',
    category: 'salad',
    course: 'second',
    pricePerPerson: 10.00,
    costPerPerson: 3.00,
    prepTime: 10,
    dietaryTags: [],
    allergens: ['gluten', 'dairy', 'eggs', 'fish'],
    ingredients: ['romaine', 'parmesan', 'croutons', 'caesar dressing', 'anchovies'],
    isActive: true,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-4',
    name: 'Grilled Filet Mignon',
    description: '8oz center cut with red wine reduction',
    category: 'entree',
    course: 'third',
    pricePerPerson: 45.00,
    costPerPerson: 18.00,
    prepTime: 25,
    dietaryTags: ['gluten-free'],
    allergens: [],
    ingredients: ['beef tenderloin', 'red wine', 'shallots', 'butter', 'thyme'],
    isActive: true,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-5',
    name: 'Pan-Seared Salmon',
    description: 'Atlantic salmon with lemon beurre blanc',
    category: 'entree',
    course: 'third',
    pricePerPerson: 38.00,
    costPerPerson: 14.00,
    prepTime: 20,
    dietaryTags: ['gluten-free', 'pescatarian'],
    allergens: ['fish', 'dairy'],
    ingredients: ['salmon', 'butter', 'lemon', 'white wine', 'shallots'],
    isActive: true,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-6',
    name: 'Roasted Garlic Mashed Potatoes',
    description: 'Creamy yukon gold with roasted garlic',
    category: 'side',
    course: 'third',
    pricePerPerson: 6.00,
    costPerPerson: 1.50,
    prepTime: 30,
    dietaryTags: ['vegetarian', 'gluten-free'],
    allergens: ['dairy'],
    ingredients: ['potatoes', 'butter', 'cream', 'garlic'],
    isActive: true,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-7',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center and vanilla ice cream',
    category: 'dessert',
    course: 'dessert',
    pricePerPerson: 12.00,
    costPerPerson: 3.50,
    prepTime: 20,
    dietaryTags: ['vegetarian'],
    allergens: ['gluten', 'dairy', 'eggs'],
    ingredients: ['chocolate', 'butter', 'eggs', 'flour', 'sugar', 'vanilla ice cream'],
    isActive: true,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Column configurations
const MENU_ITEM_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'course', header: 'Course', type: 'string' },
  { key: 'pricePerPerson', header: 'Price/Person', type: 'currency' },
  { key: 'costPerPerson', header: 'Cost/Person', type: 'currency' },
  { key: 'prepTime', header: 'Prep Time (min)', type: 'number' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
];

const EVENT_MENU_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Menu Name', type: 'string' },
  { key: 'eventType', header: 'Event Type', type: 'string' },
  { key: 'guestCount', header: 'Guest Count', type: 'number' },
  { key: 'totalPricePerPerson', header: 'Price/Person', type: 'currency' },
  { key: 'profitMargin', header: 'Margin %', type: 'percent' },
  { key: 'isTemplate', header: 'Template', type: 'boolean' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Main Component
export const EventMenuTool: React.FC<EventMenuToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: menuItems,
    addItem: addMenuItemToBackend,
    updateItem: updateMenuItemBackend,
    deleteItem: deleteMenuItemBackend,
    isSynced: menuItemsSynced,
    isSaving: menuItemsSaving,
    lastSaved: menuItemsLastSaved,
    syncError: menuItemsSyncError,
    forceSync: forceMenuItemsSync,
  } = useToolData<MenuItem>('event-menu-items', SAMPLE_MENU_ITEMS, MENU_ITEM_COLUMNS);

  const {
    data: eventMenus,
    addItem: addEventMenuToBackend,
    updateItem: updateEventMenuBackend,
    deleteItem: deleteEventMenuBackend,
    isSynced: eventMenusSynced,
    isSaving: eventMenusSaving,
    lastSaved: eventMenusLastSaved,
    syncError: eventMenusSyncError,
    forceSync: forceEventMenusSync,
  } = useToolData<EventMenu>('event-menus', [], EVENT_MENU_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'menus' | 'items' | 'builder'>('menus');
  const [showItemForm, setShowItemForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingMenu, setEditingMenu] = useState<EventMenu | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Menu builder state
  const [builderMenu, setBuilderMenu] = useState<Partial<EventMenu>>({
    name: '',
    eventType: '',
    guestCount: 50,
    courses: [],
    notes: '',
    isTemplate: false,
  });

  // Item form state
  const [itemForm, setItemForm] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    category: 'entree',
    course: 'third',
    pricePerPerson: 0,
    costPerPerson: 0,
    prepTime: 30,
    dietaryTags: [],
    allergens: [],
    ingredients: [],
    isActive: true,
    notes: '',
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.menuName || params.eventType) {
        setBuilderMenu(prev => ({
          ...prev,
          name: params.menuName || '',
          eventType: params.eventType || '',
          guestCount: params.guestCount || 50,
        }));
        setActiveTab('builder');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate menu totals
  const calculateMenuTotals = (courses: MenuCourse[]) => {
    let totalPrice = 0;
    let totalCost = 0;

    courses.forEach(course => {
      course.items.forEach(itemId => {
        const item = menuItems.find(i => i.id === itemId);
        if (item) {
          totalPrice += item.pricePerPerson;
          totalCost += item.costPerPerson;
        }
      });
    });

    const margin = totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice) * 100 : 0;

    return { totalPrice, totalCost, margin };
  };

  // Save menu item
  const saveMenuItem = () => {
    if (!itemForm.name || !itemForm.category) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const item: MenuItem = {
      id: editingItem?.id || generateId(),
      name: itemForm.name || '',
      description: itemForm.description || '',
      category: itemForm.category as MenuCategory,
      course: itemForm.course as CourseType,
      pricePerPerson: itemForm.pricePerPerson || 0,
      costPerPerson: itemForm.costPerPerson || 0,
      prepTime: itemForm.prepTime || 30,
      dietaryTags: itemForm.dietaryTags || [],
      allergens: itemForm.allergens || [],
      ingredients: itemForm.ingredients || [],
      isActive: itemForm.isActive ?? true,
      notes: itemForm.notes || '',
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingItem) {
      updateMenuItemBackend(item.id, item);
    } else {
      addMenuItemToBackend(item);
    }

    resetItemForm();
  };

  // Reset item form
  const resetItemForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      category: 'entree',
      course: 'third',
      pricePerPerson: 0,
      costPerPerson: 0,
      prepTime: 30,
      dietaryTags: [],
      allergens: [],
      ingredients: [],
      isActive: true,
      notes: '',
    });
    setIngredientInput('');
    setAllergenInput('');
  };

  // Edit item
  const editItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({ ...item });
    setShowItemForm(true);
  };

  // Delete item
  const deleteItem = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Menu Item',
      message: 'Are you sure you want to delete this menu item?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteMenuItemBackend(id);
    }
  };

  // Add course to builder
  const addCourseToBuilder = (courseType: CourseType) => {
    const newCourse: MenuCourse = {
      id: generateId(),
      name: COURSE_TYPES.find(c => c.type === courseType)?.label || courseType,
      courseType,
      items: [],
      order: (builderMenu.courses?.length || 0) + 1,
    };
    setBuilderMenu(prev => ({
      ...prev,
      courses: [...(prev.courses || []), newCourse],
    }));
  };

  // Add item to course
  const addItemToCourse = (courseId: string, itemId: string) => {
    setBuilderMenu(prev => ({
      ...prev,
      courses: prev.courses?.map(course =>
        course.id === courseId
          ? { ...course, items: [...course.items, itemId] }
          : course
      ),
    }));
  };

  // Remove item from course
  const removeItemFromCourse = (courseId: string, itemId: string) => {
    setBuilderMenu(prev => ({
      ...prev,
      courses: prev.courses?.map(course =>
        course.id === courseId
          ? { ...course, items: course.items.filter(id => id !== itemId) }
          : course
      ),
    }));
  };

  // Remove course
  const removeCourse = (courseId: string) => {
    setBuilderMenu(prev => ({
      ...prev,
      courses: prev.courses?.filter(c => c.id !== courseId),
    }));
  };

  // Save event menu
  const saveEventMenu = () => {
    if (!builderMenu.name || !builderMenu.courses?.length) {
      setValidationMessage('Please add a name and at least one course');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const totals = calculateMenuTotals(builderMenu.courses || []);

    const menu: EventMenu = {
      id: editingMenu?.id || generateId(),
      name: builderMenu.name || '',
      eventType: builderMenu.eventType || '',
      guestCount: builderMenu.guestCount || 50,
      courses: builderMenu.courses || [],
      totalPricePerPerson: totals.totalPrice,
      totalCostPerPerson: totals.totalCost,
      profitMargin: totals.margin,
      notes: builderMenu.notes || '',
      isTemplate: builderMenu.isTemplate || false,
      createdAt: editingMenu?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingMenu) {
      updateEventMenuBackend(menu.id, menu);
    } else {
      addEventMenuToBackend(menu);
    }

    resetBuilderForm();
  };

  // Reset builder form
  const resetBuilderForm = () => {
    setEditingMenu(null);
    setBuilderMenu({
      name: '',
      eventType: '',
      guestCount: 50,
      courses: [],
      notes: '',
      isTemplate: false,
    });
  };

  // Edit menu
  const editMenu = (menu: EventMenu) => {
    setEditingMenu(menu);
    setBuilderMenu({ ...menu });
    setActiveTab('builder');
  };

  // Duplicate menu
  const duplicateMenu = (menu: EventMenu) => {
    const newMenu: EventMenu = {
      ...menu,
      id: generateId(),
      name: `${menu.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addEventMenuToBackend(newMenu);
  };

  // Delete menu
  const deleteMenu = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Menu',
      message: 'Are you sure you want to delete this menu?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteEventMenuBackend(id);
    }
  };

  // Toggle dietary tag
  const toggleDietaryTag = (tag: DietaryTag) => {
    const tags = itemForm.dietaryTags || [];
    if (tags.includes(tag)) {
      setItemForm({ ...itemForm, dietaryTags: tags.filter(t => t !== tag) });
    } else {
      setItemForm({ ...itemForm, dietaryTags: [...tags, tag] });
    }
  };

  // Add ingredient
  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setItemForm({
        ...itemForm,
        ingredients: [...(itemForm.ingredients || []), ingredientInput.trim()],
      });
      setIngredientInput('');
    }
  };

  // Add allergen
  const addAllergen = () => {
    if (allergenInput.trim()) {
      setItemForm({
        ...itemForm,
        allergens: [...(itemForm.allergens || []), allergenInput.trim()],
      });
      setAllergenInput('');
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, filterCategory]);

  // Builder totals
  const builderTotals = calculateMenuTotals(builderMenu.courses || []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.eventMenu.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.eventMenu.eventMenuPlanner', 'Event Menu Planner')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.eventMenu.createAndManageMenusFor', 'Create and manage menus for catering events')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="event-menu" toolName="Event Menu" />

              <SyncStatus
                isSynced={menuItemsSynced && eventMenusSynced}
                isSaving={menuItemsSaving || eventMenusSaving}
                lastSaved={menuItemsLastSaved || eventMenusLastSaved}
                syncError={menuItemsSyncError || eventMenusSyncError}
                onForceSync={() => { forceMenuItemsSync(); forceEventMenusSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(menuItems, MENU_ITEM_COLUMNS, { filename: 'menu-items' })}
                onExportExcel={() => exportToExcel(menuItems, MENU_ITEM_COLUMNS, { filename: 'menu-items' })}
                onExportJSON={() => exportToJSON(menuItems, { filename: 'menu-items' })}
                onExportPDF={async () => {
                  await exportToPDF(menuItems, MENU_ITEM_COLUMNS, {
                    filename: 'menu-items',
                    title: 'Menu Items Catalog',
                  });
                }}
                onPrint={() => printData(menuItems, MENU_ITEM_COLUMNS, { title: 'Menu Items' })}
                onCopyToClipboard={async () => await copyUtil(menuItems, MENU_ITEM_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'menus', label: 'Event Menus', icon: <FileText className="w-4 h-4" /> },
              { id: 'items', label: 'Menu Items', icon: <UtensilsCrossed className="w-4 h-4" /> },
              { id: 'builder', label: 'Menu Builder', icon: <ChefHat className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event Menus Tab */}
        {activeTab === 'menus' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.eventMenu.eventMenus', 'Event Menus')}</h2>
              <button
                onClick={() => { resetBuilderForm(); setActiveTab('builder'); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.eventMenu.createMenu', 'Create Menu')}
              </button>
            </div>

            <div className="space-y-4">
              {eventMenus.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.eventMenu.noMenusCreatedYetStart', 'No menus created yet. Start by building your first menu!')}</p>
                </div>
              ) : (
                eventMenus.map(menu => (
                  <div key={menu.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{menu.name}</h3>
                          {menu.isTemplate && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">{t('tools.eventMenu.template', 'Template')}</span>
                          )}
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {menu.eventType} | {menu.courses.length} courses | {menu.guestCount} guests
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#0D9488]">{formatCurrency(menu.totalPricePerPerson)}/pp</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {menu.profitMargin.toFixed(1)}% margin
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => duplicateMenu(menu)}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <Copy className="w-3 h-3" />
                        {t('tools.eventMenu.duplicate', 'Duplicate')}
                      </button>
                      <button
                        onClick={() => editMenu(menu)}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        <Edit2 className="w-3 h-3" />
                        {t('tools.eventMenu.edit', 'Edit')}
                      </button>
                      <button
                        onClick={() => deleteMenu(menu.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Menu Items Tab */}
        {activeTab === 'items' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.eventMenu.searchItems', 'Search items...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="all">{t('tools.eventMenu.allCategories', 'All Categories')}</option>
                  {MENU_CATEGORIES.map(cat => (
                    <option key={cat.category} value={cat.category}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowItemForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.eventMenu.addItem', 'Add Item')}
              </button>
            </div>

            {/* Item Form Modal */}
            {showItemForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {editingItem ? t('tools.eventMenu.editMenuItem', 'Edit Menu Item') : t('tools.eventMenu.addMenuItem', 'Add Menu Item')}
                      </h2>
                      <button onClick={resetItemForm} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.name', 'Name *')}</label>
                          <input
                            type="text"
                            value={itemForm.name}
                            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.description', 'Description')}</label>
                          <textarea
                            value={itemForm.description}
                            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                            rows={2}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.category', 'Category *')}</label>
                          <select
                            value={itemForm.category}
                            onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as MenuCategory })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          >
                            {MENU_CATEGORIES.map(cat => (
                              <option key={cat.category} value={cat.category}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.course', 'Course')}</label>
                          <select
                            value={itemForm.course}
                            onChange={(e) => setItemForm({ ...itemForm, course: e.target.value as CourseType })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          >
                            {COURSE_TYPES.map(c => (
                              <option key={c.type} value={c.type}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.pricePerson', 'Price/Person')}</label>
                          <input
                            type="number"
                            value={itemForm.pricePerPerson}
                            onChange={(e) => setItemForm({ ...itemForm, pricePerPerson: parseFloat(e.target.value) || 0 })}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.costPerson', 'Cost/Person')}</label>
                          <input
                            type="number"
                            value={itemForm.costPerPerson}
                            onChange={(e) => setItemForm({ ...itemForm, costPerPerson: parseFloat(e.target.value) || 0 })}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.prepTimeMin', 'Prep Time (min)')}</label>
                          <input
                            type="number"
                            value={itemForm.prepTime}
                            onChange={(e) => setItemForm({ ...itemForm, prepTime: parseInt(e.target.value) || 0 })}
                            min="0"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={itemForm.isActive}
                              onChange={(e) => setItemForm({ ...itemForm, isActive: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.eventMenu.active', 'Active')}</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.dietaryTags', 'Dietary Tags')}</label>
                        <div className="flex flex-wrap gap-2">
                          {DIETARY_TAGS.map(({ tag, label, color }) => (
                            <button
                              key={tag}
                              onClick={() => toggleDietaryTag(tag)}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                itemForm.dietaryTags?.includes(tag)
                                  ? color
                                  : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {itemForm.dietaryTags?.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.ingredients', 'Ingredients')}</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={ingredientInput}
                            onChange={(e) => setIngredientInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                            placeholder={t('tools.eventMenu.addIngredient', 'Add ingredient...')}
                            className={`flex-1 px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                          <button onClick={addIngredient} className="px-4 py-2 bg-[#0D9488] text-white rounded-lg">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {itemForm.ingredients?.map((ing, idx) => (
                            <span key={idx} className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              {ing}
                              <button onClick={() => setItemForm({ ...itemForm, ingredients: itemForm.ingredients?.filter((_, i) => i !== idx) })}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.allergens', 'Allergens')}</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={allergenInput}
                            onChange={(e) => setAllergenInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addAllergen()}
                            placeholder={t('tools.eventMenu.addAllergen', 'Add allergen...')}
                            className={`flex-1 px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                          <button onClick={addAllergen} className="px-4 py-2 bg-[#0D9488] text-white rounded-lg">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {itemForm.allergens?.map((allergen, idx) => (
                            <span key={idx} className="px-2 py-1 rounded text-sm flex items-center gap-1 bg-red-100 text-red-700">
                              {allergen}
                              <button onClick={() => setItemForm({ ...itemForm, allergens: itemForm.allergens?.filter((_, i) => i !== idx) })}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={resetItemForm} className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        {t('tools.eventMenu.cancel', 'Cancel')}
                      </button>
                      <button onClick={saveMenuItem} className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90">
                        <Save className="w-4 h-4" />
                        {editingItem ? t('tools.eventMenu.updateItem', 'Update Item') : t('tools.eventMenu.addItem2', 'Add Item')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} ${!item.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {MENU_CATEGORIES.find(c => c.category === item.category)?.label}
                      </p>
                    </div>
                    <span className="text-[#0D9488] font-semibold">{formatCurrency(item.pricePerPerson)}</span>
                  </div>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                  {item.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.dietaryTags.map(tag => {
                        const tagInfo = DIETARY_TAGS.find(t => t.tag === tag);
                        return <span key={tag} className={`px-2 py-0.5 text-xs rounded ${tagInfo?.color}`}>{tagInfo?.label}</span>;
                      })}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Clock className="w-3 h-3 inline mr-1" />{item.prepTime} min
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => editItem(item)} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="p-1 rounded hover:bg-red-100 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Builder Tab */}
        {activeTab === 'builder' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingMenu ? t('tools.eventMenu.editMenu', 'Edit Menu') : t('tools.eventMenu.buildNewMenu', 'Build New Menu')}
              </h2>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventMenu.pricePerson2', 'Price/Person')}</p>
                  <p className="text-lg font-bold text-[#0D9488]">{formatCurrency(builderTotals.totalPrice)}</p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.eventMenu.margin', 'Margin')}</p>
                  <p className="text-lg font-bold text-green-500">{builderTotals.margin.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Menu Details */}
              <div className="col-span-1">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.menuName', 'Menu Name *')}</label>
                    <input
                      type="text"
                      value={builderMenu.name}
                      onChange={(e) => setBuilderMenu({ ...builderMenu, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={t('tools.eventMenu.eGSummerWeddingMenu', 'e.g., Summer Wedding Menu')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.eventType', 'Event Type')}</label>
                    <input
                      type="text"
                      value={builderMenu.eventType}
                      onChange={(e) => setBuilderMenu({ ...builderMenu, eventType: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder={t('tools.eventMenu.eGWeddingCorporate', 'e.g., Wedding, Corporate')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.guestCount', 'Guest Count')}</label>
                    <input
                      type="number"
                      value={builderMenu.guestCount}
                      onChange={(e) => setBuilderMenu({ ...builderMenu, guestCount: parseInt(e.target.value) || 0 })}
                      min="1"
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.notes', 'Notes')}</label>
                    <textarea
                      value={builderMenu.notes}
                      onChange={(e) => setBuilderMenu({ ...builderMenu, notes: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={builderMenu.isTemplate}
                        onChange={(e) => setBuilderMenu({ ...builderMenu, isTemplate: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.eventMenu.saveAsTemplate', 'Save as template')}</span>
                    </label>
                  </div>

                  {/* Add Course Buttons */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.eventMenu.addCourse', 'Add Course')}</label>
                    <div className="flex flex-wrap gap-2">
                      {COURSE_TYPES.map(course => (
                        <button
                          key={course.type}
                          onClick={() => addCourseToBuilder(course.type)}
                          className={`px-3 py-1 text-sm rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          {course.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Courses */}
              <div className="col-span-2">
                <div className="space-y-4">
                  {builderMenu.courses?.length === 0 ? (
                    <div className={`text-center py-12 border-2 border-dashed rounded-lg ${theme === 'dark' ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                      <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.eventMenu.addCoursesToBuildYour', 'Add courses to build your menu')}</p>
                    </div>
                  ) : (
                    builderMenu.courses?.map(course => (
                      <div key={course.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{course.name}</h3>
                          <button onClick={() => removeCourse(course.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Selected Items */}
                        <div className="space-y-2 mb-3">
                          {course.items.length === 0 ? (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.eventMenu.noItemsSelected', 'No items selected')}</p>
                          ) : (
                            course.items.map(itemId => {
                              const item = menuItems.find(i => i.id === itemId);
                              return item ? (
                                <div key={itemId} className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{item.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#0D9488]">{formatCurrency(item.pricePerPerson)}</span>
                                    <button onClick={() => removeItemFromCourse(course.id, itemId)} className="text-red-500">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : null;
                            })
                          )}
                        </div>

                        {/* Add Items Dropdown */}
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              addItemToCourse(course.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          <option value="">+ Add menu item...</option>
                          {menuItems
                            .filter(item => item.isActive && !course.items.includes(item.id))
                            .map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({formatCurrency(item.pricePerPerson)})
                              </option>
                            ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={resetBuilderForm}
                    className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {t('tools.eventMenu.cancel2', 'Cancel')}
                  </button>
                  <button
                    onClick={saveEventMenu}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Save className="w-4 h-4" />
                    {editingMenu ? t('tools.eventMenu.updateMenu', 'Update Menu') : t('tools.eventMenu.saveMenu', 'Save Menu')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg z-50 max-w-sm">
          <p className="text-sm font-medium">{validationMessage}</p>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default EventMenuTool;
