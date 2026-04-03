'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import {
  Utensils,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Apple,
  Milk,
  Egg,
  Fish,
  Wheat,
  Leaf,
  Cookie,
  Coffee,
  Sun,
  Moon,
  Copy,
  FileText,
  Printer,
  ShoppingCart,
  Users,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface MealPlanningDaycareToolProps {
  uiConfig?: UIConfig;
}

// Types
interface AllergenInfo {
  allergen: string;
  childrenAffected: string[];
}

interface MealItem {
  id: string;
  name: string;
  category: 'main' | 'side' | 'fruit' | 'vegetable' | 'dairy' | 'grain' | 'protein' | 'beverage';
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  calories?: number;
  notes?: string;
}

interface Meal {
  id: string;
  date: string;
  type: 'breakfast' | 'morning-snack' | 'lunch' | 'afternoon-snack' | 'dinner';
  items: MealItem[];
  notes?: string;
  preparedBy?: string;
  servings: number;
  classrooms: string[];
}

interface WeeklyMenu {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  meals: Meal[];
  isPublished: boolean;
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DietaryRestriction {
  id: string;
  childId: string;
  childName: string;
  classroomId: string;
  type: 'allergy' | 'intolerance' | 'preference' | 'religious' | 'medical';
  item: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  notes?: string;
  doctorNote?: string;
  parentConfirmed: boolean;
}

// Column configurations for export
const mealColumns: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'type', header: 'Meal Type', type: 'string' },
  { key: 'servings', header: 'Servings', type: 'number' },
];

const restrictionColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'childName', header: 'Child Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'severity', header: 'Severity', type: 'string' },
];

// Constants
const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee, time: '8:00 AM' },
  { value: 'morning-snack', label: 'Morning Snack', icon: Apple, time: '10:00 AM' },
  { value: 'lunch', label: 'Lunch', icon: Utensils, time: '12:00 PM' },
  { value: 'afternoon-snack', label: 'Afternoon Snack', icon: Cookie, time: '3:00 PM' },
  { value: 'dinner', label: 'Dinner', icon: Moon, time: '5:30 PM' },
];

const FOOD_CATEGORIES = [
  { value: 'main', label: 'Main Dish' },
  { value: 'side', label: 'Side Dish' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'grain', label: 'Grain' },
  { value: 'protein', label: 'Protein' },
  { value: 'beverage', label: 'Beverage' },
];

const COMMON_ALLERGENS = [
  'Milk', 'Eggs', 'Peanuts', 'Tree Nuts', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame',
];

const CLASSROOMS = [
  { id: 'infant', name: 'Infant Room' },
  { id: 'toddler', name: 'Toddler Room' },
  { id: 'preschool', name: 'Preschool Room' },
  { id: 'prek', name: 'Pre-K Room' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getWeekDates = (startDate: Date): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const getMonday = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  return monday;
};

type TabType = 'weekly-menu' | 'restrictions' | 'shopping-list';

export const MealPlanningDaycareTool: React.FC<MealPlanningDaycareToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('weekly-menu');
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // useToolData hooks for backend sync
  const {
    data: meals,
    addItem: addMeal,
    updateItem: updateMeal,
    deleteItem: deleteMeal,
    isSynced: mealsSynced,
    isSaving: mealsSaving,
    lastSaved: mealsLastSaved,
    syncError: mealsSyncError,
    forceSync: forceMealsSync,
  } = useToolData<Meal>('daycare-meals', [], mealColumns);

  const {
    data: restrictions,
    addItem: addRestriction,
    updateItem: updateRestriction,
    deleteItem: deleteRestriction,
  } = useToolData<DietaryRestriction>('daycare-dietary-restrictions', [], restrictionColumns);

  // Form states
  const [mealForm, setMealForm] = useState<Partial<Meal>>({
    type: 'lunch',
    items: [],
    servings: 20,
    classrooms: ['infant', 'toddler', 'preschool', 'prek'],
  });

  const [mealItemForm, setMealItemForm] = useState<Partial<MealItem>>({
    category: 'main',
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
  });

  const [restrictionForm, setRestrictionForm] = useState<Partial<DietaryRestriction>>({
    type: 'allergy',
    severity: 'moderate',
    parentConfirmed: false,
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.date) setSelectedDate(params.date as string);
      if (params.mealType) setSelectedMealType(params.mealType as string);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  // Week dates
  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Get meals for a specific date and type
  const getMealsForDateAndType = (date: string, type: string): Meal | undefined => {
    return meals.find(m => m.date === date && m.type === type);
  };

  // Get allergens that affect children in the daycare
  const activeAllergens = useMemo(() => {
    const allergenMap = new Map<string, string[]>();
    restrictions.forEach(r => {
      if (r.type === 'allergy') {
        const existing = allergenMap.get(r.item) || [];
        allergenMap.set(r.item, [...existing, r.childName]);
      }
    });
    return Array.from(allergenMap.entries()).map(([allergen, children]) => ({
      allergen,
      childrenAffected: children,
    }));
  }, [restrictions]);

  // Check if meal contains allergens
  const checkMealAllergens = (meal: Meal): AllergenInfo[] => {
    const mealAllergens = new Set<string>();
    meal.items.forEach(item => {
      item.allergens.forEach(a => mealAllergens.add(a));
    });

    return activeAllergens.filter(a => mealAllergens.has(a.allergen));
  };

  // Generate shopping list
  const shoppingList = useMemo(() => {
    const itemMap = new Map<string, { name: string; category: string; count: number }>();

    const weekMeals = meals.filter(m => weekDates.includes(m.date));
    weekMeals.forEach(meal => {
      meal.items.forEach(item => {
        const key = item.name.toLowerCase();
        const existing = itemMap.get(key);
        if (existing) {
          itemMap.set(key, { ...existing, count: existing.count + 1 });
        } else {
          itemMap.set(key, { name: item.name, category: item.category, count: 1 });
        }
      });
    });

    return Array.from(itemMap.values()).sort((a, b) => a.category.localeCompare(b.category));
  }, [meals, weekDates]);

  // Add meal item
  const addMealItem = () => {
    if (!mealItemForm.name) {
      setValidationMessage('Please enter item name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newItem: MealItem = {
      id: generateId(),
      name: mealItemForm.name || '',
      category: mealItemForm.category || 'main',
      allergens: mealItemForm.allergens || [],
      isVegetarian: mealItemForm.isVegetarian || false,
      isVegan: mealItemForm.isVegan || false,
      isGlutenFree: mealItemForm.isGlutenFree || false,
      isDairyFree: mealItemForm.isDairyFree || false,
      calories: mealItemForm.calories,
      notes: mealItemForm.notes,
    };

    setMealForm(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));

    setMealItemForm({
      category: 'main',
      allergens: [],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isDairyFree: false,
    });
  };

  // Remove meal item
  const removeMealItem = (id: string) => {
    setMealForm(prev => ({
      ...prev,
      items: (prev.items || []).filter(i => i.id !== id),
    }));
  };

  // Save meal
  const saveMeal = () => {
    if (!selectedDate || !mealForm.type) {
      setValidationMessage('Please select a date and meal type');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if ((mealForm.items || []).length === 0) {
      setValidationMessage('Please add at least one item to the meal');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const meal: Meal = {
      id: editingMeal?.id || generateId(),
      date: selectedDate,
      type: mealForm.type as Meal['type'],
      items: mealForm.items || [],
      notes: mealForm.notes,
      preparedBy: mealForm.preparedBy,
      servings: mealForm.servings || 20,
      classrooms: mealForm.classrooms || [],
    };

    if (editingMeal) {
      updateMeal(editingMeal.id, meal);
    } else {
      addMeal(meal);
    }

    resetMealForm();
  };

  // Save restriction
  const saveRestriction = () => {
    if (!restrictionForm.childName || !restrictionForm.item) {
      setValidationMessage('Please fill in child name and dietary item');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const restriction: DietaryRestriction = {
      id: generateId(),
      childId: generateId(),
      childName: restrictionForm.childName || '',
      classroomId: restrictionForm.classroomId || '',
      type: restrictionForm.type || 'allergy',
      item: restrictionForm.item || '',
      severity: restrictionForm.severity || 'moderate',
      notes: restrictionForm.notes,
      doctorNote: restrictionForm.doctorNote,
      parentConfirmed: restrictionForm.parentConfirmed || false,
    };

    addRestriction(restriction);
    resetRestrictionForm();
  };

  // Reset forms
  const resetMealForm = () => {
    setMealForm({
      type: 'lunch',
      items: [],
      servings: 20,
      classrooms: ['infant', 'toddler', 'preschool', 'prek'],
    });
    setEditingMeal(null);
    setShowMealModal(false);
    setSelectedDate(null);
    setSelectedMealType(null);
  };

  const resetRestrictionForm = () => {
    setRestrictionForm({
      type: 'allergy',
      severity: 'moderate',
      parentConfirmed: false,
    });
    setShowRestrictionModal(false);
  };

  // Open meal modal for specific cell
  const openMealModal = (date: string, type: string) => {
    const existingMeal = getMealsForDateAndType(date, type);
    if (existingMeal) {
      setMealForm(existingMeal);
      setEditingMeal(existingMeal);
    } else {
      setMealForm({
        type: type as Meal['type'],
        items: [],
        servings: 20,
        classrooms: ['infant', 'toddler', 'preschool', 'prek'],
      });
    }
    setSelectedDate(date);
    setSelectedMealType(type);
    setShowMealModal(true);
  };

  // Copy meal to another day
  const copyMealToDay = (meal: Meal, targetDate: string) => {
    const newMeal: Meal = {
      ...meal,
      id: generateId(),
      date: targetDate,
    };
    addMeal(newMeal);
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  const tabClass = (active: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    active
      ? 'bg-[#0D9488] text-white'
      : theme === 'dark'
        ? 'text-gray-400 hover:bg-gray-700'
        : 'text-gray-600 hover:bg-gray-100'
  }`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.mealPlanningDaycare.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.mealPlanningDaycare.daycareMealPlanning', 'Daycare Meal Planning')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.mealPlanningDaycare.planWeeklyMenusAndTrack', 'Plan weekly menus and track dietary restrictions')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="meal-planning-daycare" toolName="Meal Planning Daycare" />

              <SyncStatus
                isSynced={mealsSynced}
                isSaving={mealsSaving}
                lastSaved={mealsLastSaved}
                syncError={mealsSyncError}
                onForceSync={forceMealsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(meals, mealColumns, 'daycare-meals')}
                onExportExcel={() => exportToExcel(meals, mealColumns, 'daycare-meals')}
                onExportJSON={() => exportToJSON(meals, 'daycare-meals')}
                onExportPDF={() => exportToPDF(meals, mealColumns, 'Daycare Meals')}
                onCopy={() => copyUtil(meals, mealColumns)}
                onPrint={() => printData(meals, mealColumns, 'Daycare Meals')}
                theme={theme}
              />
            </div>
          </div>

          {/* Allergen Warnings */}
          {activeAllergens.length > 0 && (
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} border border-red-200 dark:border-red-900/50`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                    {t('tools.mealPlanningDaycare.activeAllergenAlerts', 'Active Allergen Alerts')}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeAllergens.map((a, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                        {a.allergen} ({a.childrenAffected.length} children)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('weekly-menu')} className={tabClass(activeTab === 'weekly-menu')}>
              <Calendar className="w-4 h-4 inline mr-2" />
              {t('tools.mealPlanningDaycare.weeklyMenu', 'Weekly Menu')}
            </button>
            <button onClick={() => setActiveTab('restrictions')} className={tabClass(activeTab === 'restrictions')}>
              <AlertCircle className="w-4 h-4 inline mr-2" />
              {t('tools.mealPlanningDaycare.dietaryRestrictions', 'Dietary Restrictions')}
            </button>
            <button onClick={() => setActiveTab('shopping-list')} className={tabClass(activeTab === 'shopping-list')}>
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              {t('tools.mealPlanningDaycare.shoppingList', 'Shopping List')}
            </button>
          </div>
        </div>

        {/* Weekly Menu Tab */}
        {activeTab === 'weekly-menu' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPreviousWeek}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Week of {formatDate(weekDates[0])} - {formatDate(weekDates[4])}
                </h3>
                <button
                  onClick={goToCurrentWeek}
                  className="text-sm text-[#0D9488] hover:underline"
                >
                  {t('tools.mealPlanningDaycare.goToCurrentWeek', 'Go to Current Week')}
                </button>
              </div>
              <button
                onClick={goToNextWeek}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Grid */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className={`p-2 text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.mealPlanningDaycare.meal', 'Meal')}
                    </th>
                    {weekDates.map((date, idx) => (
                      <th key={date} className={`p-2 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="font-medium">{DAYS_OF_WEEK[idx]}</div>
                        <div className="text-xs font-normal">{formatDate(date)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEAL_TYPES.map((mealType) => (
                    <tr key={mealType.value} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`p-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <mealType.icon className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{mealType.label}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{mealType.time}</p>
                          </div>
                        </div>
                      </td>
                      {weekDates.map((date) => {
                        const meal = getMealsForDateAndType(date, mealType.value);
                        const allergenWarnings = meal ? checkMealAllergens(meal) : [];

                        return (
                          <td key={`${date}-${mealType.value}`} className="p-2">
                            <div
                              onClick={() => openMealModal(date, mealType.value)}
                              className={`min-h-[80px] p-2 rounded-lg cursor-pointer transition-colors ${
                                meal
                                  ? theme === 'dark'
                                    ? 'bg-gray-700 hover:bg-gray-600'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                  : theme === 'dark'
                                    ? 'bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600'
                                    : 'bg-gray-50/50 hover:bg-gray-100 border-2 border-dashed border-gray-200'
                              }`}
                            >
                              {meal ? (
                                <div>
                                  <div className="space-y-1">
                                    {meal.items.slice(0, 3).map((item) => (
                                      <p key={item.id} className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {item.name}
                                      </p>
                                    ))}
                                    {meal.items.length > 3 && (
                                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                        +{meal.items.length - 3} more
                                      </p>
                                    )}
                                  </div>
                                  {allergenWarnings.length > 0 && (
                                    <div className="mt-2 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3 text-red-500" />
                                      <span className="text-xs text-red-500">
                                        {allergenWarnings.length} allergen{allergenWarnings.length > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Plus className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dietary Restrictions Tab */}
        {activeTab === 'restrictions' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
            <div className="p-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}">
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Dietary Restrictions ({restrictions.length})
              </h3>
              <button
                onClick={() => setShowRestrictionModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.mealPlanningDaycare.addRestriction', 'Add Restriction')}
              </button>
            </div>

            {restrictions.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.mealPlanningDaycare.noDietaryRestrictions', 'No Dietary Restrictions')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.mealPlanningDaycare.addDietaryRestrictionsToTrack', 'Add dietary restrictions to track allergies and preferences.')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {restrictions.map((restriction) => (
                  <div key={restriction.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          restriction.severity === 'life-threatening' ? 'bg-red-100 dark:bg-red-900/30' :
                          restriction.severity === 'severe' ? 'bg-orange-100 dark:bg-orange-900/30' :
                          restriction.severity === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <AlertTriangle className={`w-5 h-5 ${
                            restriction.severity === 'life-threatening' ? 'text-red-500' :
                            restriction.severity === 'severe' ? 'text-orange-500' :
                            restriction.severity === 'moderate' ? 'text-yellow-500' :
                            'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {restriction.childName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {restriction.type}: {restriction.item}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              restriction.severity === 'life-threatening' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              restriction.severity === 'severe' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                              restriction.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {restriction.severity}
                            </span>
                            {restriction.parentConfirmed && (
                              <span className="flex items-center gap-1 text-xs text-green-500">
                                <CheckCircle className="w-3 h-3" />
                                {t('tools.mealPlanningDaycare.confirmed', 'Confirmed')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteRestriction(restriction.id)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shopping List Tab */}
        {activeTab === 'shopping-list' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Shopping List for Week of {formatDate(weekDates[0])}
              </h3>
              <button
                onClick={() => printData(shoppingList as any, [
                  { key: 'name', header: 'Item', type: 'string' },
                  { key: 'category', header: 'Category', type: 'string' },
                  { key: 'count', header: 'Times Used', type: 'number' },
                ], 'Weekly Shopping List')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Printer className="w-4 h-4" />
                {t('tools.mealPlanningDaycare.printList', 'Print List')}
              </button>
            </div>

            {shoppingList.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.mealPlanningDaycare.noItemsYet', 'No Items Yet')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.mealPlanningDaycare.addMealsToTheWeekly', 'Add meals to the weekly menu to generate a shopping list.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FOOD_CATEGORIES.map((category) => {
                  const items = shoppingList.filter(i => i.category === category.value);
                  if (items.length === 0) return null;

                  return (
                    <div key={category.value} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {category.label}
                      </h4>
                      <ul className="space-y-2">
                        {items.map((item, idx) => (
                          <li key={idx} className={`flex items-center justify-between text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span>{item.name}</span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              x{item.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Meal Modal */}
        {showMealModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingMeal ? t('tools.mealPlanningDaycare.editMeal', 'Edit Meal') : t('tools.mealPlanningDaycare.addMeal', 'Add Meal')} - {selectedDate && formatDate(selectedDate)}
                </h2>
                <button
                  onClick={resetMealForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.mealPlanningDaycare.mealType', 'Meal Type')}</label>
                    <select
                      value={mealForm.type || 'lunch'}
                      onChange={(e) => setMealForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className={inputClass}
                    >
                      {MEAL_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.mealPlanningDaycare.servings', 'Servings')}</label>
                    <input
                      type="number"
                      value={mealForm.servings || 20}
                      onChange={(e) => setMealForm(prev => ({ ...prev, servings: parseInt(e.target.value) || 0 }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Meal Items */}
                <div>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.mealPlanningDaycare.mealItems', 'Meal Items')}
                  </h4>

                  {/* Existing Items */}
                  {(mealForm.items || []).length > 0 && (
                    <div className="space-y-2 mb-4">
                      {mealForm.items?.map((item) => (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {FOOD_CATEGORIES.find(c => c.value === item.category)?.label}
                              </span>
                              {item.allergens.length > 0 && (
                                <span className="text-xs text-red-500">
                                  {item.allergens.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeMealItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Item Form */}
                  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={labelClass}>{t('tools.mealPlanningDaycare.itemName', 'Item Name')}</label>
                        <input
                          type="text"
                          value={mealItemForm.name || ''}
                          onChange={(e) => setMealItemForm(prev => ({ ...prev, name: e.target.value }))}
                          className={inputClass}
                          placeholder={t('tools.mealPlanningDaycare.eGGrilledChicken', 'e.g., Grilled Chicken')}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.mealPlanningDaycare.category', 'Category')}</label>
                        <select
                          value={mealItemForm.category || 'main'}
                          onChange={(e) => setMealItemForm(prev => ({ ...prev, category: e.target.value as any }))}
                          className={inputClass}
                        >
                          {FOOD_CATEGORIES.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className={labelClass}>{t('tools.mealPlanningDaycare.allergens', 'Allergens')}</label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_ALLERGENS.map((allergen) => (
                          <button
                            key={allergen}
                            type="button"
                            onClick={() => {
                              const current = mealItemForm.allergens || [];
                              const updated = current.includes(allergen)
                                ? current.filter(a => a !== allergen)
                                : [...current, allergen];
                              setMealItemForm(prev => ({ ...prev, allergens: updated }));
                            }}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              (mealItemForm.allergens || []).includes(allergen)
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {allergen}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mealItemForm.isVegetarian || false}
                          onChange={(e) => setMealItemForm(prev => ({ ...prev, isVegetarian: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.mealPlanningDaycare.vegetarian', 'Vegetarian')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mealItemForm.isGlutenFree || false}
                          onChange={(e) => setMealItemForm(prev => ({ ...prev, isGlutenFree: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.mealPlanningDaycare.glutenFree', 'Gluten-Free')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mealItemForm.isDairyFree || false}
                          onChange={(e) => setMealItemForm(prev => ({ ...prev, isDairyFree: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.mealPlanningDaycare.dairyFree', 'Dairy-Free')}</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={addMealItem}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E]"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.mealPlanningDaycare.addItem', 'Add Item')}
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelClass}>{t('tools.mealPlanningDaycare.notes', 'Notes')}</label>
                  <textarea
                    value={mealForm.notes || ''}
                    onChange={(e) => setMealForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className={inputClass}
                    placeholder={t('tools.mealPlanningDaycare.specialInstructionsSubstitutionsEtc', 'Special instructions, substitutions, etc.')}
                  />
                </div>
              </div>

              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={resetMealForm}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.mealPlanningDaycare.cancel', 'Cancel')}
                </button>
                <button
                  onClick={saveMeal}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.mealPlanningDaycare.saveMeal', 'Save Meal')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restriction Modal */}
        {showRestrictionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.mealPlanningDaycare.addDietaryRestriction', 'Add Dietary Restriction')}
                </h2>
                <button
                  onClick={resetRestrictionForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.mealPlanningDaycare.childName', 'Child Name *')}</label>
                  <input
                    type="text"
                    value={restrictionForm.childName || ''}
                    onChange={(e) => setRestrictionForm(prev => ({ ...prev, childName: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.mealPlanningDaycare.childSName', 'Child\'s name')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.mealPlanningDaycare.type', 'Type')}</label>
                    <select
                      value={restrictionForm.type || 'allergy'}
                      onChange={(e) => setRestrictionForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className={inputClass}
                    >
                      <option value="allergy">{t('tools.mealPlanningDaycare.allergy', 'Allergy')}</option>
                      <option value="intolerance">{t('tools.mealPlanningDaycare.intolerance', 'Intolerance')}</option>
                      <option value="preference">{t('tools.mealPlanningDaycare.preference', 'Preference')}</option>
                      <option value="religious">{t('tools.mealPlanningDaycare.religious', 'Religious')}</option>
                      <option value="medical">{t('tools.mealPlanningDaycare.medical', 'Medical')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.mealPlanningDaycare.severity', 'Severity')}</label>
                    <select
                      value={restrictionForm.severity || 'moderate'}
                      onChange={(e) => setRestrictionForm(prev => ({ ...prev, severity: e.target.value as any }))}
                      className={inputClass}
                    >
                      <option value="mild">{t('tools.mealPlanningDaycare.mild', 'Mild')}</option>
                      <option value="moderate">{t('tools.mealPlanningDaycare.moderate', 'Moderate')}</option>
                      <option value="severe">{t('tools.mealPlanningDaycare.severe', 'Severe')}</option>
                      <option value="life-threatening">{t('tools.mealPlanningDaycare.lifeThreatening', 'Life-Threatening')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.mealPlanningDaycare.dietaryItem', 'Dietary Item *')}</label>
                  <input
                    type="text"
                    value={restrictionForm.item || ''}
                    onChange={(e) => setRestrictionForm(prev => ({ ...prev, item: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.mealPlanningDaycare.eGPeanutsGlutenDairy', 'e.g., Peanuts, Gluten, Dairy')}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t('tools.mealPlanningDaycare.notes2', 'Notes')}</label>
                  <textarea
                    value={restrictionForm.notes || ''}
                    onChange={(e) => setRestrictionForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className={inputClass}
                    placeholder={t('tools.mealPlanningDaycare.additionalDetails', 'Additional details...')}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restrictionForm.parentConfirmed || false}
                    onChange={(e) => setRestrictionForm(prev => ({ ...prev, parentConfirmed: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.mealPlanningDaycare.parentConfirmed', 'Parent Confirmed')}
                  </span>
                </label>
              </div>

              <div className={`flex items-center justify-end gap-3 p-4 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={resetRestrictionForm}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.mealPlanningDaycare.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={saveRestriction}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.mealPlanningDaycare.saveRestriction', 'Save Restriction')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanningDaycareTool;
