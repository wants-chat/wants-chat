import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Utensils,
  ShoppingCart,
  Calendar,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Save,
  Copy,
  Trash2,
  Check,
  Download,
  Upload,
  BookOpen,
  Printer,
  Clock,
  Users,
  Tag,
  Edit2,
  PieChart,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MealPlannerToolProps {
  uiConfig?: UIConfig;
}

// Types
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
type MealCategory = 'homemade' | 'restaurant' | 'takeout';
type StoreSection = 'produce' | 'dairy' | 'meat' | 'bakery' | 'frozen' | 'pantry' | 'beverages' | 'other';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  section: StoreSection;
}

interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  prepTime: number;
  servings: number;
  ingredients: Ingredient[];
  notes: string;
  calories: number;
  tags: string[];
}

interface DayMeals {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

interface WeekPlan {
  [date: string]: DayMeals;
}

interface SavedRecipe extends Meal {
  isFavorite: boolean;
}

interface GroceryItem extends Ingredient {
  checked: boolean;
  mealId?: string;
}

interface WeekTemplate {
  id: string;
  name: string;
  plan: WeekPlan;
}

type Tab = 'calendar' | 'recipes' | 'grocery' | 'nutrition';

// Column configurations for export
const RECIPE_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Recipe Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'prepTime', header: 'Prep Time (min)', type: 'number' },
  { key: 'servings', header: 'Servings', type: 'number' },
  { key: 'calories', header: 'Calories', type: 'number' },
  { key: 'tags', header: 'Tags', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : '' },
  { key: 'isFavorite', header: 'Favorite', type: 'boolean' },
];

const GROCERY_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Item', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'string' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'section', header: 'Store Section', type: 'string' },
  { key: 'checked', header: 'Checked', type: 'boolean' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
const STORE_SECTIONS: StoreSection[] = ['produce', 'dairy', 'meat', 'bakery', 'frozen', 'pantry', 'beverages', 'other'];

const STORAGE_KEY = 'mealPlannerData';

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const getWeekDates = (weekOffset: number): string[] => {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date.toISOString().split('T')[0];
  });
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getEmptyDayMeals = (): DayMeals => ({
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
});

export const MealPlannerTool: React.FC<MealPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);

  // useToolData for saved recipes with backend sync
  const {
    data: savedRecipes,
    addItem: addRecipe,
    updateItem: updateRecipe,
    deleteItem: deleteRecipe,
    isSynced: recipesIsSynced,
    isSaving: recipesIsSaving,
    lastSaved: recipesLastSaved,
    syncError: recipesSyncError,
    forceSync: forceRecipeSync,
  } = useToolData<SavedRecipe>('meal-planner-recipes', [], RECIPE_COLUMNS);

  // useToolData for grocery items with backend sync
  const {
    data: customGroceryItems,
    addItem: addGroceryItem,
    updateItem: updateGroceryItem,
    deleteItem: deleteGroceryItem,
  } = useToolData<GroceryItem>('meal-planner-grocery', [], GROCERY_COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({});
  const [weekTemplates, setWeekTemplates] = useState<WeekTemplate[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);

  // Modal states
  const [showMealModal, setShowMealModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Form states
  const [mealForm, setMealForm] = useState<Partial<Meal>>({
    name: '',
    category: 'homemade',
    prepTime: 30,
    servings: 2,
    ingredients: [],
    notes: '',
    calories: 0,
    tags: [],
  });
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: '',
    quantity: '',
    unit: '',
    section: 'other',
  });
  const [newTag, setNewTag] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [customGroceryInput, setCustomGroceryInput] = useState('');

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // Load week plan from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setWeekPlan(data.weekPlan || {});
        setWeekTemplates(data.weekTemplates || []);
      } catch (e) {
        console.error('Failed to load meal planner data', e);
      }
    }
  }, []);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        // Pre-fill meal form with the name
        setMealForm(prev => ({ ...prev, name: params.text || params.content || '' }));
        setShowMealModal(true);
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.mealName) setMealForm(prev => ({ ...prev, name: params.formData!.mealName }));
        if (params.formData.prepTime) setMealForm(prev => ({ ...prev, prepTime: parseInt(params.formData!.prepTime) }));
        if (params.formData.servings) setMealForm(prev => ({ ...prev, servings: parseInt(params.formData!.servings) }));
        if (params.formData.calories) setMealForm(prev => ({ ...prev, calories: parseInt(params.formData!.calories) }));
        setShowMealModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Save week plan and templates to localStorage
  useEffect(() => {
    const data = {
      weekPlan,
      weekTemplates,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [weekPlan, weekTemplates]);

  // Generate grocery list from current week's meals
  useEffect(() => {
    const ingredientMap = new Map<string, GroceryItem>();

    weekDates.forEach((date) => {
      const dayMeals = weekPlan[date] || getEmptyDayMeals();
      MEAL_TYPES.forEach((mealType) => {
        dayMeals[mealType].forEach((meal) => {
          meal.ingredients.forEach((ingredient) => {
            const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key)!;
              const existingQty = parseFloat(existing.quantity) || 0;
              const newQty = parseFloat(ingredient.quantity) || 0;
              existing.quantity = (existingQty + newQty).toString();
            } else {
              ingredientMap.set(key, {
                ...ingredient,
                id: generateId(),
                checked: false,
                mealId: meal.id,
              });
            }
          });
        });
      });
    });

    setGroceryList(Array.from(ingredientMap.values()));
  }, [weekPlan, weekDates]);

  // Calculate nutrition data
  const nutritionData = useMemo(() => {
    const dailyCalories: { [date: string]: number } = {};
    let totalCalories = 0;
    let mealCount = 0;

    weekDates.forEach((date) => {
      const dayMeals = weekPlan[date] || getEmptyDayMeals();
      let dayTotal = 0;
      MEAL_TYPES.forEach((mealType) => {
        dayMeals[mealType].forEach((meal) => {
          dayTotal += meal.calories;
          mealCount++;
        });
      });
      dailyCalories[date] = dayTotal;
      totalCalories += dayTotal;
    });

    return {
      dailyCalories,
      totalCalories,
      weeklyAverage: mealCount > 0 ? Math.round(totalCalories / 7) : 0,
      mealDistribution: weekDates.map((date) => {
        const dayMeals = weekPlan[date] || getEmptyDayMeals();
        return {
          date,
          breakfast: dayMeals.breakfast.reduce((sum, m) => sum + m.calories, 0),
          lunch: dayMeals.lunch.reduce((sum, m) => sum + m.calories, 0),
          dinner: dayMeals.dinner.reduce((sum, m) => sum + m.calories, 0),
          snacks: dayMeals.snacks.reduce((sum, m) => sum + m.calories, 0),
        };
      }),
    };
  }, [weekPlan, weekDates]);

  // Handlers
  const openAddMealModal = (date: string, mealType: MealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setEditingMeal(null);
    setMealForm({
      name: '',
      category: 'homemade',
      prepTime: 30,
      servings: 2,
      ingredients: [],
      notes: '',
      calories: 0,
      tags: [],
    });
    setShowMealModal(true);
  };

  const openEditMealModal = (date: string, mealType: MealType, meal: Meal) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setEditingMeal(meal);
    setMealForm({ ...meal });
    setShowMealModal(true);
  };

  const addIngredient = () => {
    if (!newIngredient.name) return;
    const ingredient: Ingredient = {
      id: generateId(),
      name: newIngredient.name || '',
      quantity: newIngredient.quantity || '',
      unit: newIngredient.unit || '',
      section: newIngredient.section || 'other',
    };
    setMealForm({
      ...mealForm,
      ingredients: [...(mealForm.ingredients || []), ingredient],
    });
    setNewIngredient({ name: '', quantity: '', unit: '', section: 'other' });
  };

  const removeIngredient = (id: string) => {
    setMealForm({
      ...mealForm,
      ingredients: (mealForm.ingredients || []).filter((i) => i.id !== id),
    });
  };

  const addTag = () => {
    if (!newTag || (mealForm.tags || []).includes(newTag)) return;
    setMealForm({
      ...mealForm,
      tags: [...(mealForm.tags || []), newTag],
    });
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setMealForm({
      ...mealForm,
      tags: (mealForm.tags || []).filter((t) => t !== tag),
    });
  };

  const saveMeal = () => {
    if (!mealForm.name || !selectedDate || !selectedMealType) return;

    const meal: Meal = {
      id: editingMeal?.id || generateId(),
      name: mealForm.name || '',
      category: mealForm.category || 'homemade',
      prepTime: mealForm.prepTime || 30,
      servings: mealForm.servings || 2,
      ingredients: mealForm.ingredients || [],
      notes: mealForm.notes || '',
      calories: mealForm.calories || 0,
      tags: mealForm.tags || [],
    };

    setWeekPlan((prev) => {
      const dayMeals = prev[selectedDate] || getEmptyDayMeals();
      let updatedMeals: Meal[];

      if (editingMeal) {
        updatedMeals = dayMeals[selectedMealType].map((m) => (m.id === editingMeal.id ? meal : m));
      } else {
        updatedMeals = [...dayMeals[selectedMealType], meal];
      }

      return {
        ...prev,
        [selectedDate]: {
          ...dayMeals,
          [selectedMealType]: updatedMeals,
        },
      };
    });

    setShowMealModal(false);
  };

  const deleteMeal = (date: string, mealType: MealType, mealId: string) => {
    setWeekPlan((prev) => {
      const dayMeals = prev[date] || getEmptyDayMeals();
      return {
        ...prev,
        [date]: {
          ...dayMeals,
          [mealType]: dayMeals[mealType].filter((m) => m.id !== mealId),
        },
      };
    });
  };

  const saveAsRecipe = (meal: Meal) => {
    const recipe: SavedRecipe = {
      ...meal,
      id: generateId(),
      isFavorite: false,
    };
    addRecipe(recipe);
  };

  const addRecipeToMeal = (recipe: SavedRecipe, date: string, mealType: MealType) => {
    const meal: Meal = {
      ...recipe,
      id: generateId(),
    };

    setWeekPlan((prev) => {
      const dayMeals = prev[date] || getEmptyDayMeals();
      return {
        ...prev,
        [date]: {
          ...dayMeals,
          [mealType]: [...dayMeals[mealType], meal],
        },
      };
    });
    setShowRecipeModal(false);
  };

  const toggleRecipeFavorite = (recipeId: string) => {
    const recipe = savedRecipes.find(r => r.id === recipeId);
    if (recipe) {
      updateRecipe(recipeId, { isFavorite: !recipe.isFavorite });
    }
  };

  const removeRecipe = (recipeId: string) => {
    deleteRecipe(recipeId);
  };

  const copyPreviousWeek = () => {
    const prevWeekDates = getWeekDates(weekOffset - 1);
    const newPlan = { ...weekPlan };

    prevWeekDates.forEach((prevDate, index) => {
      const currentDate = weekDates[index];
      if (weekPlan[prevDate]) {
        newPlan[currentDate] = JSON.parse(JSON.stringify(weekPlan[prevDate]));
        // Regenerate IDs for copied meals
        MEAL_TYPES.forEach((mealType) => {
          newPlan[currentDate][mealType] = newPlan[currentDate][mealType].map((meal: Meal) => ({
            ...meal,
            id: generateId(),
          }));
        });
      }
    });

    setWeekPlan(newPlan);
  };

  const saveAsTemplate = () => {
    if (!templateName) return;

    const currentWeekPlan: WeekPlan = {};
    weekDates.forEach((date, index) => {
      currentWeekPlan[`day${index}`] = weekPlan[date] || getEmptyDayMeals();
    });

    const template: WeekTemplate = {
      id: generateId(),
      name: templateName,
      plan: currentWeekPlan,
    };

    setWeekTemplates((prev) => [...prev, template]);
    setTemplateName('');
    setShowTemplateModal(false);
  };

  const loadTemplate = (template: WeekTemplate) => {
    const newPlan = { ...weekPlan };
    weekDates.forEach((date, index) => {
      const templateDay = template.plan[`day${index}`];
      if (templateDay) {
        newPlan[date] = JSON.parse(JSON.stringify(templateDay));
        MEAL_TYPES.forEach((mealType) => {
          newPlan[date][mealType] = newPlan[date][mealType].map((meal: Meal) => ({
            ...meal,
            id: generateId(),
          }));
        });
      }
    });
    setWeekPlan(newPlan);
  };

  const deleteTemplate = (templateId: string) => {
    setWeekTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const toggleGroceryItem = (itemId: string) => {
    setGroceryList((prev) => prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)));
  };

  const toggleCustomGroceryItem = (itemId: string) => {
    const item = customGroceryItems.find(i => i.id === itemId);
    if (item) {
      updateGroceryItem(itemId, { checked: !item.checked });
    }
  };

  const addCustomGroceryItem = () => {
    if (!customGroceryInput) return;
    const item: GroceryItem = {
      id: generateId(),
      name: customGroceryInput,
      quantity: '',
      unit: '',
      section: 'other',
      checked: false,
    };
    addGroceryItem(item);
    setCustomGroceryInput('');
  };

  const removeCustomGroceryItem = (itemId: string) => {
    deleteGroceryItem(itemId);
  };

  const printGroceryList = () => {
    const allItems = [...groceryList, ...customGroceryItems];
    const groupedItems = STORE_SECTIONS.reduce(
      (acc, section) => {
        acc[section] = allItems.filter((item) => item.section === section && !item.checked);
        return acc;
      },
      {} as { [key: string]: GroceryItem[] }
    );

    const printContent = `
      <html>
        <head>
          <title>Grocery List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0D9488; }
            h2 { color: #374151; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-top: 20px; }
            ul { list-style-type: none; padding: 0; }
            li { padding: 4px 0; display: flex; align-items: center; }
            li::before { content: '[ ]'; margin-right: 8px; font-family: monospace; }
            .quantity { color: #6B7280; margin-left: 8px; }
          </style>
        </head>
        <body>
          <h1>Grocery List</h1>
          <p>${weekDates[0]} - ${weekDates[6]}</p>
          ${STORE_SECTIONS.map((section) => {
            const items = groupedItems[section];
            if (items.length === 0) return '';
            return `
              <h2>${section.charAt(0).toUpperCase() + section.slice(1)}</h2>
              <ul>
                ${items.map((item) => `<li>${item.name}<span class="quantity">${item.quantity ? `${item.quantity} ${item.unit}` : ''}</span></li>`).join('')}
              </ul>
            `;
          }).join('')}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredRecipes = savedRecipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(recipeSearch.toLowerCase()))
  );

  // Render helpers
  const renderMealCard = (meal: Meal, date: string, mealType: MealType) => (
    <div
      key={meal.id}
      className={`p-2 rounded-lg mb-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {meal.name}
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {meal.calories} cal
          </div>
        </div>
        <div className="flex gap-1 ml-1">
          <button
            onClick={() => openEditMealModal(date, mealType, meal)}
            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => deleteMeal(date, mealType, meal.id)}
            className={`p-1 rounded text-red-500 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.mealPlanner.mealPlanner', 'Meal Planner')}
              </h1>
            </div>
            <WidgetEmbedButton toolSlug="meal-planner" toolName="Meal Planner" />

            <SyncStatus
              isSynced={recipesIsSynced}
              isSaving={recipesIsSaving}
              lastSaved={recipesLastSaved}
              syncError={recipesSyncError}
              onForceSync={forceRecipeSync}
              theme={theme === 'dark' ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.mealPlanner.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'calendar' as Tab, label: 'Calendar', icon: Calendar },
              { id: 'recipes' as Tab, label: 'Recipes', icon: BookOpen },
              { id: 'grocery' as Tab, label: 'Grocery List', icon: ShoppingCart },
              { id: 'nutrition' as Tab, label: 'Nutrition', icon: PieChart },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div>
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                </div>
                <button
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Week Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={copyPreviousWeek}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {t('tools.mealPlanner.copyPreviousWeek', 'Copy Previous Week')}
                </button>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.mealPlanner.templates', 'Templates')}
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDates.map((date, index) => (
                      <div
                        key={date}
                        className={`text-center py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                      >
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {DAYS_OF_WEEK[index]}
                        </div>
                        <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatDate(date)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Meal Rows */}
                  {MEAL_TYPES.map((mealType) => (
                    <div key={mealType} className="grid grid-cols-7 gap-2 mb-2">
                      {weekDates.map((date) => {
                        const dayMeals = weekPlan[date] || getEmptyDayMeals();
                        const meals = dayMeals[mealType];
                        return (
                          <div
                            key={`${date}-${mealType}`}
                            className={`min-h-[100px] p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}
                          >
                            <div
                              className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                            </div>
                            {meals.map((meal) => renderMealCard(meal, date, mealType))}
                            <button
                              onClick={() => openAddMealModal(date, mealType)}
                              className={`w-full p-2 rounded-lg border-2 border-dashed flex items-center justify-center ${
                                theme === 'dark'
                                  ? 'border-gray-600 text-gray-500 hover:border-gray-500 hover:text-gray-400'
                                  : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500'
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  />
                  <input
                    type="text"
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    placeholder={t('tools.mealPlanner.searchRecipesByNameOr', 'Search recipes by name or tag...')}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                {savedRecipes.length > 0 && (
                  <ExportDropdown
                    onExportCSV={() => exportToCSV(savedRecipes, RECIPE_COLUMNS.slice(1), { filename: 'meal-planner-recipes' })}
                    onExportExcel={() => exportToExcel(savedRecipes, RECIPE_COLUMNS.slice(1), { filename: 'meal-planner-recipes' })}
                    onExportJSON={() => exportToJSON(savedRecipes, { filename: 'meal-planner-recipes' })}
                    onExportPDF={async () => {
                      await exportToPDF(savedRecipes, RECIPE_COLUMNS.slice(1), {
                        filename: 'meal-planner-recipes',
                        title: 'Saved Recipes',
                        subtitle: `${savedRecipes.length} recipes`,
                      });
                    }}
                    onPrint={() => printData(savedRecipes, RECIPE_COLUMNS.slice(1), { title: 'Saved Recipes' })}
                    onCopyToClipboard={() => copyUtil(savedRecipes, RECIPE_COLUMNS.slice(1), 'tab')}
                    showImport={false}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                  />
                )}
              </div>

              {filteredRecipes.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('tools.mealPlanner.noSavedRecipesYet', 'No saved recipes yet')}</p>
                  <p className="text-sm">{t('tools.mealPlanner.addMealsToYourCalendar', 'Add meals to your calendar and save them as recipes')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {recipe.name}
                        </h3>
                        <button
                          onClick={() => toggleRecipeFavorite(recipe.id)}
                          className={`p-1 rounded ${recipe.isFavorite ? 'text-yellow-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          <Tag className="w-5 h-5" fill={recipe.isFavorite ? t('tools.mealPlanner.currentcolor', 'currentColor') : 'none'} />
                        </button>
                      </div>
                      <div className={`flex flex-wrap gap-2 mb-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.prepTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.servings} servings
                        </span>
                        <span>{recipe.calories} cal</span>
                      </div>
                      {recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {recipe.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-2 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowRecipeModal(true);
                            setEditingMeal(recipe);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          {t('tools.mealPlanner.addToPlan', 'Add to Plan')}
                        </button>
                        <button
                          onClick={() => removeRecipe(recipe.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
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

          {/* Grocery List Tab */}
          {activeTab === 'grocery' && (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={printGroceryList}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium"
                >
                  <Printer className="w-4 h-4" />
                  {t('tools.mealPlanner.printList', 'Print List')}
                </button>
                {(groceryList.length > 0 || customGroceryItems.length > 0) && (
                  <ExportDropdown
                    onExportCSV={() => exportToCSV([...groceryList, ...customGroceryItems], GROCERY_COLUMNS.slice(1), { filename: 'grocery-list' })}
                    onExportExcel={() => exportToExcel([...groceryList, ...customGroceryItems], GROCERY_COLUMNS.slice(1), { filename: 'grocery-list' })}
                    onExportJSON={() => exportToJSON([...groceryList, ...customGroceryItems], { filename: 'grocery-list' })}
                    onExportPDF={async () => {
                      await exportToPDF([...groceryList, ...customGroceryItems], GROCERY_COLUMNS.slice(1), {
                        filename: 'grocery-list',
                        title: 'Grocery List',
                        subtitle: `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`,
                      });
                    }}
                    onPrint={() => printData([...groceryList, ...customGroceryItems], GROCERY_COLUMNS.slice(1), { title: 'Grocery List' })}
                    onCopyToClipboard={() => copyUtil([...groceryList, ...customGroceryItems], GROCERY_COLUMNS.slice(1), 'tab')}
                    showImport={false}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                  />
                )}
              </div>

              {/* Add Custom Item */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={customGroceryInput}
                  onChange={(e) => setCustomGroceryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomGroceryItem()}
                  placeholder={t('tools.mealPlanner.addCustomItem', 'Add custom item...')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <button
                  onClick={addCustomGroceryItem}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Grocery Items by Section */}
              {STORE_SECTIONS.map((section) => {
                const sectionItems = [...groceryList, ...customGroceryItems].filter((item) => item.section === section);
                if (sectionItems.length === 0) return null;

                return (
                  <div key={section} className="mb-6">
                    <h3 className={`text-lg font-semibold mb-3 capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {section}
                    </h3>
                    <div className="space-y-2">
                      {sectionItems.map((item) => {
                        const isCustom = customGroceryItems.some((c) => c.id === item.id);
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                          >
                            <button
                              onClick={() =>
                                isCustom ? toggleCustomGroceryItem(item.id) : toggleGroceryItem(item.id)
                              }
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                item.checked
                                  ? 'bg-[#0D9488] border-[#0D9488]'
                                  : theme === 'dark'
                                    ? 'border-gray-500'
                                    : 'border-gray-300'
                              }`}
                            >
                              {item.checked && <Check className="w-4 h-4 text-white" />}
                            </button>
                            <span
                              className={`flex-1 ${item.checked ? 'line-through opacity-50' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                            >
                              {item.name}
                              {item.quantity && (
                                <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  ({item.quantity} {item.unit})
                                </span>
                              )}
                            </span>
                            {isCustom && (
                              <button
                                onClick={() => removeCustomGroceryItem(item.id)}
                                className="p-1 rounded text-red-500 hover:bg-red-500/10"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {groceryList.length === 0 && customGroceryItems.length === 0 && (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('tools.mealPlanner.noItemsInGroceryList', 'No items in grocery list')}</p>
                  <p className="text-sm">{t('tools.mealPlanner.addMealsWithIngredientsTo', 'Add meals with ingredients to generate your grocery list')}</p>
                </div>
              )}
            </div>
          )}

          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && (
            <div>
              {/* Weekly Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.mealPlanner.totalWeeklyCalories', 'Total Weekly Calories')}
                  </div>
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {nutritionData.totalCalories.toLocaleString()}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.mealPlanner.dailyAverage', 'Daily Average')}
                  </div>
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {nutritionData.weeklyAverage.toLocaleString()}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.mealPlanner.plannedMeals', 'Planned Meals')}
                  </div>
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {weekDates.reduce((sum, date) => {
                      const dayMeals = weekPlan[date] || getEmptyDayMeals();
                      return sum + MEAL_TYPES.reduce((s, t) => s + dayMeals[t].length, 0);
                    }, 0)}
                  </div>
                </div>
              </div>

              {/* Daily Breakdown */}
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.mealPlanner.dailyCalorieBreakdown', 'Daily Calorie Breakdown')}
              </h3>
              <div className="space-y-4">
                {nutritionData.mealDistribution.map((day, index) => {
                  const total = day.breakfast + day.lunch + day.dinner + day.snacks;
                  const maxCalories = 2500;
                  return (
                    <div key={day.date} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between mb-2">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {DAYS_OF_WEEK[index]} ({formatDate(day.date)})
                        </span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {total} cal
                        </span>
                      </div>
                      <div className="h-4 rounded-full overflow-hidden flex bg-gray-300 dark:bg-gray-600">
                        {day.breakfast > 0 && (
                          <div
                            className="bg-yellow-500 h-full"
                            style={{ width: `${(day.breakfast / maxCalories) * 100}%` }}
                            title={`Breakfast: ${day.breakfast} cal`}
                          />
                        )}
                        {day.lunch > 0 && (
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: `${(day.lunch / maxCalories) * 100}%` }}
                            title={`Lunch: ${day.lunch} cal`}
                          />
                        )}
                        {day.dinner > 0 && (
                          <div
                            className="bg-blue-500 h-full"
                            style={{ width: `${(day.dinner / maxCalories) * 100}%` }}
                            title={`Dinner: ${day.dinner} cal`}
                          />
                        )}
                        {day.snacks > 0 && (
                          <div
                            className="bg-purple-500 h-full"
                            style={{ width: `${(day.snacks / maxCalories) * 100}%` }}
                            title={`Snacks: ${day.snacks} cal`}
                          />
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-yellow-500"></span>
                          Breakfast: {day.breakfast}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-green-500"></span>
                          Lunch: {day.lunch}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-blue-500"></span>
                          Dinner: {day.dinner}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-purple-500"></span>
                          Snacks: {day.snacks}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingMeal ? t('tools.mealPlanner.editMeal', 'Edit Meal') : t('tools.mealPlanner.addMeal', 'Add Meal')}
              </h2>
              <button onClick={() => setShowMealModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Meal Name */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mealPlanner.mealName', 'Meal Name *')}
                </label>
                <input
                  type="text"
                  value={mealForm.name}
                  onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                  placeholder={t('tools.mealPlanner.eGGrilledChickenSalad', 'e.g., Grilled Chicken Salad')}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mealPlanner.category', 'Category')}
                </label>
                <select
                  value={mealForm.category}
                  onChange={(e) => setMealForm({ ...mealForm, category: e.target.value as MealCategory })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="homemade">{t('tools.mealPlanner.homemade', 'Homemade')}</option>
                  <option value="restaurant">{t('tools.mealPlanner.restaurant', 'Restaurant')}</option>
                  <option value="takeout">{t('tools.mealPlanner.takeout', 'Takeout')}</option>
                </select>
              </div>

              {/* Prep Time & Servings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.mealPlanner.prepTimeMin', 'Prep Time (min)')}
                  </label>
                  <input
                    type="number"
                    value={mealForm.prepTime}
                    onChange={(e) => setMealForm({ ...mealForm, prepTime: parseInt(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.mealPlanner.servings', 'Servings')}
                  </label>
                  <input
                    type="number"
                    value={mealForm.servings}
                    onChange={(e) => setMealForm({ ...mealForm, servings: parseInt(e.target.value) || 1 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              {/* Calories */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mealPlanner.caloriesEstimate', 'Calories (estimate)')}
                </label>
                <input
                  type="number"
                  value={mealForm.calories}
                  onChange={(e) => setMealForm({ ...mealForm, calories: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 450"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mealPlanner.ingredients', 'Ingredients')}
                </label>
                <div className="space-y-2 mb-2">
                  {(mealForm.ingredients || []).map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className={`flex items-center gap-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      <span className="flex-1 text-sm">
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {ingredient.section}
                      </span>
                      <button onClick={() => removeIngredient(ingredient.id)} className="p-1 text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredient.quantity}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                    placeholder={t('tools.mealPlanner.qty', 'Qty')}
                    className={`w-16 px-2 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <input
                    type="text"
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    placeholder={t('tools.mealPlanner.unit', 'Unit')}
                    className={`w-20 px-2 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <input
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    placeholder={t('tools.mealPlanner.ingredientName', 'Ingredient name')}
                    className={`flex-1 px-2 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <select
                    value={newIngredient.section}
                    onChange={(e) => setNewIngredient({ ...newIngredient, section: e.target.value as StoreSection })}
                    className={`w-24 px-2 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {STORE_SECTIONS.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addIngredient}
                    className="p-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mealPlanner.tags', 'Tags')}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(mealForm.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder={t('tools.mealPlanner.addTagEGVegetarian', 'Add tag (e.g., vegetarian, quick)')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <button onClick={addTag} className="p-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mealPlanner.recipeNotes', 'Recipe Notes')}
                </label>
                <textarea
                  value={mealForm.notes}
                  onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                  placeholder={t('tools.mealPlanner.cookingInstructionsTipsEtc', 'Cooking instructions, tips, etc.')}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveMeal}
                disabled={!mealForm.name}
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {editingMeal ? t('tools.mealPlanner.updateMeal', 'Update Meal') : t('tools.mealPlanner.addMeal2', 'Add Meal')}
              </button>
              {editingMeal && (
                <button
                  onClick={() => {
                    saveAsRecipe(editingMeal);
                    setShowMealModal(false);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowMealModal(false)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.mealPlanner.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Selection Modal */}
      {showRecipeModal && editingMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-md rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Add "{editingMeal.name}" to Plan
              </h2>
              <button onClick={() => setShowRecipeModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mealPlanner.selectDay', 'Select Day')}
                </label>
                <select
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.mealPlanner.selectADay', 'Select a day...')}</option>
                  {weekDates.map((date, index) => (
                    <option key={date} value={date}>
                      {DAYS_OF_WEEK[index]} ({formatDate(date)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.mealPlanner.selectMeal', 'Select Meal')}
                </label>
                <select
                  value={selectedMealType || ''}
                  onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="">{t('tools.mealPlanner.selectAMeal', 'Select a meal...')}</option>
                  {MEAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (selectedDate && selectedMealType) {
                    addRecipeToMeal(editingMeal as SavedRecipe, selectedDate, selectedMealType);
                  }
                }}
                disabled={!selectedDate || !selectedMealType}
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {t('tools.mealPlanner.addToPlan2', 'Add to Plan')}
              </button>
              <button
                onClick={() => setShowRecipeModal(false)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.mealPlanner.cancel2', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-md max-h-[80vh] overflow-y-auto rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.mealPlanner.weekTemplates', 'Week Templates')}
              </h2>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Save Current Week */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.mealPlanner.saveCurrentWeekAsTemplate', 'Save Current Week as Template')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder={t('tools.mealPlanner.templateName', 'Template name...')}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <button
                  onClick={saveAsTemplate}
                  disabled={!templateName}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-400 text-white rounded-lg"
                >
                  <Save className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Saved Templates */}
            <div>
              <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.mealPlanner.savedTemplates', 'Saved Templates')}
              </h3>
              {weekTemplates.length === 0 ? (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.mealPlanner.noTemplatesSavedYet', 'No templates saved yet')}
                </p>
              ) : (
                <div className="space-y-2">
                  {weekTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{template.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadTemplate(template)}
                          className="p-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg"
                          title={t('tools.mealPlanner.loadTemplate', 'Load template')}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowTemplateModal(false)}
              className={`w-full mt-6 px-4 py-2 rounded-lg font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.mealPlanner.close', 'Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlannerTool;
