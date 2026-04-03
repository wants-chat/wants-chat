'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChefHat,
  Plus,
  Trash2,
  Edit2,
  Save,
  Clock,
  Users,
  Heart,
  ShoppingCart,
  Calendar,
  X,
  Search,
  Scale,
  BookOpen,
  Sparkles,
  Check,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Apple,
  Loader2,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface RecipeCollectionToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: string[];
  notes: string;
  imageUrl: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MealPlanDay {
  date: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
}

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  recipeId?: string;
}

type Category = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';
type ViewMode = 'recipes' | 'mealplanner' | 'shoppinglist';

const CATEGORIES: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Recipes', icon: BookOpen },
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'lunch', label: 'Lunch', icon: Sun },
  { id: 'dinner', label: 'Dinner', icon: Moon },
  { id: 'dessert', label: 'Dessert', icon: Cookie },
  { id: 'snack', label: 'Snack', icon: Apple },
];

const CUISINES = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'Thai',
  'French',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'Greek',
  'Other',
];

const UNITS = ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'whole', 'pinch'];

// Column configuration for useToolData hook
const RECIPE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Recipe Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'cuisine', header: 'Cuisine', type: 'string' },
  { key: 'prepTime', header: 'Prep Time (min)', type: 'number' },
  { key: 'cookTime', header: 'Cook Time (min)', type: 'number' },
  { key: 'servings', header: 'Servings', type: 'number' },
  { key: 'difficulty', header: 'Difficulty', type: 'string' },
  { key: 'isFavorite', header: 'Favorite', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

export const RecipeCollectionTool: React.FC<RecipeCollectionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use hook for recipe data persistence with backend sync
  const {
    data: recipes,
    addItem: addRecipe,
    updateItem: updateRecipe,
    deleteItem: deleteRecipe,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Recipe>('recipe-collection', [], RECIPE_COLUMNS);

  // Local state for UI that doesn't need backend sync
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('recipes');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [scaleServings, setScaleServings] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copiedList, setCopiedList] = useState(false);

  // New recipe form state
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    category: 'dinner',
    cuisine: 'American',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'medium',
    ingredients: [],
    instructions: [''],
    notes: '',
    imageUrl: '',
    isFavorite: false,
  });

  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: '',
    quantity: 1,
    unit: 'piece',
  });

  // Save meal plan and shopping list to localStorage
  useEffect(() => {
    const data = { mealPlan, shoppingList };
    localStorage.setItem('recipe-meal-plan-data', JSON.stringify(data));
  }, [mealPlan, shoppingList]);

  // Load meal plan and shopping list from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recipe-meal-plan-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.mealPlan) setMealPlan(data.mealPlan);
        if (data.shoppingList) setShoppingList(data.shoppingList);
      } catch (e) {
        console.error('Failed to load meal plan data:', e);
      }
    }
  }, []);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description || params.content) {
        setNewRecipe((prev) => ({
          ...prev,
          name: params.title || prev.name,
          notes: params.description || params.content || prev.notes,
        }));
        setShowRecipeForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Initialize meal plan for current week
  useEffect(() => {
    if (mealPlan.length === 0) {
      const today = new Date();
      const weekPlan: MealPlanDay[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        weekPlan.push({
          date: date.toISOString().split('T')[0],
        });
      }
      setMealPlan(weekPlan);
    }
  }, [mealPlan.length]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFavorite = !showFavoritesOnly || recipe.isFavorite;
      return matchesCategory && matchesSearch && matchesFavorite;
    });
  }, [recipes, selectedCategory, searchQuery, showFavoritesOnly]);

  // Stats
  const stats = useMemo(() => {
    const byCategory = {
      breakfast: recipes.filter((r) => r.category === 'breakfast').length,
      lunch: recipes.filter((r) => r.category === 'lunch').length,
      dinner: recipes.filter((r) => r.category === 'dinner').length,
      dessert: recipes.filter((r) => r.category === 'dessert').length,
      snack: recipes.filter((r) => r.category === 'snack').length,
    };
    return {
      total: recipes.length,
      favorites: recipes.filter((r) => r.isFavorite).length,
      byCategory,
    };
  }, [recipes]);

  // Handlers
  const handleAddIngredient = (isEditing: boolean = false) => {
    if (!newIngredient.name) return;

    const ingredient: Ingredient = {
      id: `ing-${Date.now()}`,
      name: newIngredient.name || '',
      quantity: newIngredient.quantity || 1,
      unit: newIngredient.unit || 'piece',
    };

    if (isEditing && editingRecipe) {
      setEditingRecipe({
        ...editingRecipe,
        ingredients: [...editingRecipe.ingredients, ingredient],
      });
    } else {
      setNewRecipe({
        ...newRecipe,
        ingredients: [...(newRecipe.ingredients || []), ingredient],
      });
    }

    setNewIngredient({ name: '', quantity: 1, unit: 'piece' });
  };

  const handleRemoveIngredient = (id: string, isEditing: boolean = false) => {
    if (isEditing && editingRecipe) {
      setEditingRecipe({
        ...editingRecipe,
        ingredients: editingRecipe.ingredients.filter((i) => i.id !== id),
      });
    } else {
      setNewRecipe({
        ...newRecipe,
        ingredients: (newRecipe.ingredients || []).filter((i) => i.id !== id),
      });
    }
  };

  const handleAddInstruction = (isEditing: boolean = false) => {
    if (isEditing && editingRecipe) {
      setEditingRecipe({
        ...editingRecipe,
        instructions: [...editingRecipe.instructions, ''],
      });
    } else {
      setNewRecipe({
        ...newRecipe,
        instructions: [...(newRecipe.instructions || []), ''],
      });
    }
  };

  const handleUpdateInstruction = (index: number, value: string, isEditing: boolean = false) => {
    if (isEditing && editingRecipe) {
      const instructions = [...editingRecipe.instructions];
      instructions[index] = value;
      setEditingRecipe({ ...editingRecipe, instructions });
    } else {
      const instructions = [...(newRecipe.instructions || [])];
      instructions[index] = value;
      setNewRecipe({ ...newRecipe, instructions });
    }
  };

  const handleRemoveInstruction = (index: number, isEditing: boolean = false) => {
    if (isEditing && editingRecipe) {
      setEditingRecipe({
        ...editingRecipe,
        instructions: editingRecipe.instructions.filter((_, i) => i !== index),
      });
    } else {
      setNewRecipe({
        ...newRecipe,
        instructions: (newRecipe.instructions || []).filter((_, i) => i !== index),
      });
    }
  };

  const handleSaveRecipe = () => {
    if (!newRecipe.name) return;

    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      name: newRecipe.name || '',
      category: newRecipe.category || 'dinner',
      cuisine: newRecipe.cuisine || 'American',
      prepTime: newRecipe.prepTime || 15,
      cookTime: newRecipe.cookTime || 30,
      servings: newRecipe.servings || 4,
      difficulty: newRecipe.difficulty || 'medium',
      ingredients: newRecipe.ingredients || [],
      instructions: (newRecipe.instructions || []).filter((i) => i.trim() !== ''),
      notes: newRecipe.notes || '',
      imageUrl: newRecipe.imageUrl || '',
      isFavorite: newRecipe.isFavorite || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRecipe(recipe);
    setShowRecipeForm(false);
    resetNewRecipe();
  };

  const handleUpdateRecipe = () => {
    if (!editingRecipe) return;

    updateRecipe(editingRecipe.id, {
      ...editingRecipe,
      updatedAt: new Date().toISOString(),
    });
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = (id: string) => {
    deleteRecipe(id);
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  };

  const handleToggleFavorite = (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      updateRecipe(id, { isFavorite: !recipe.isFavorite });
    }
  };

  const resetNewRecipe = () => {
    setNewRecipe({
      name: '',
      category: 'dinner',
      cuisine: 'American',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: 'medium',
      ingredients: [],
      instructions: [''],
      notes: '',
      imageUrl: '',
      isFavorite: false,
    });
    setNewIngredient({ name: '', quantity: 1, unit: 'piece' });
  };

  // Scale ingredients
  const getScaledIngredients = (recipe: Recipe, targetServings: number) => {
    const scale = targetServings / recipe.servings;
    return recipe.ingredients.map((ing) => ({
      ...ing,
      quantity: Math.round(ing.quantity * scale * 100) / 100,
    }));
  };

  // Meal planner handlers
  const handleAssignRecipe = (date: string, mealType: keyof MealPlanDay, recipeId: string) => {
    setMealPlan(
      mealPlan.map((day) => (day.date === date ? { ...day, [mealType]: recipeId || undefined } : day))
    );
  };

  // Shopping list handlers
  const handleGenerateShoppingList = (selectedRecipeIds: string[]) => {
    const ingredientMap = new Map<string, ShoppingListItem>();

    selectedRecipeIds.forEach((recipeId) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (recipe) {
        recipe.ingredients.forEach((ing) => {
          const key = `${ing.name.toLowerCase()}-${ing.unit}`;
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.quantity += ing.quantity;
          } else {
            ingredientMap.set(key, {
              id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              checked: false,
              recipeId,
            });
          }
        });
      }
    });

    setShoppingList(Array.from(ingredientMap.values()));
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingList(shoppingList.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const handleRemoveShoppingItem = (id: string) => {
    setShoppingList(shoppingList.filter((item) => item.id !== id));
  };

  const handleClearCheckedItems = () => {
    setShoppingList(shoppingList.filter((item) => !item.checked));
  };

  const handleCopyShoppingList = () => {
    const listText = shoppingList
      .map((item) => `${item.checked ? '[x]' : '[ ]'} ${item.quantity} ${item.unit} ${item.name}`)
      .join('\n');
    navigator.clipboard.writeText(listText);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2000);
  };

  // Input classes
  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all`;

  const selectClass = `px-4 py-2.5 border ${
    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'
  } rounded-xl focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all`;

  const cardClass = `rounded-xl border ${
    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`;

  // Render recipe form
  const renderRecipeForm = (recipe: Partial<Recipe>, isEditing: boolean = false) => {
    const setRecipeData = isEditing
      ? (updates: Partial<Recipe>) => setEditingRecipe({ ...editingRecipe!, ...updates })
      : (updates: Partial<Recipe>) => setNewRecipe({ ...newRecipe, ...updates });

    const ingredients = isEditing ? editingRecipe?.ingredients || [] : newRecipe.ingredients || [];
    const instructions = isEditing ? editingRecipe?.instructions || [] : newRecipe.instructions || [];

    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.recipeCollection.recipeName', 'Recipe Name *')}
            </label>
            <input
              type="text"
              value={recipe.name || ''}
              onChange={(e) => setRecipeData({ name: e.target.value })}
              placeholder={t('tools.recipeCollection.eGSpaghettiCarbonara', 'e.g., Spaghetti Carbonara')}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.recipeCollection.category', 'Category')}
            </label>
            <select
              value={recipe.category || 'dinner'}
              onChange={(e) => setRecipeData({ category: e.target.value as Recipe['category'] })}
              className={selectClass + ' w-full'}
            >
              <option value="breakfast">{t('tools.recipeCollection.breakfast', 'Breakfast')}</option>
              <option value="lunch">{t('tools.recipeCollection.lunch', 'Lunch')}</option>
              <option value="dinner">{t('tools.recipeCollection.dinner', 'Dinner')}</option>
              <option value="dessert">{t('tools.recipeCollection.dessert', 'Dessert')}</option>
              <option value="snack">{t('tools.recipeCollection.snack', 'Snack')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.recipeCollection.cuisine', 'Cuisine')}
            </label>
            <select
              value={recipe.cuisine || 'American'}
              onChange={(e) => setRecipeData({ cuisine: e.target.value })}
              className={selectClass + ' w-full'}
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.recipeCollection.difficulty', 'Difficulty')}
            </label>
            <select
              value={recipe.difficulty || 'medium'}
              onChange={(e) => setRecipeData({ difficulty: e.target.value as Recipe['difficulty'] })}
              className={selectClass + ' w-full'}
            >
              <option value="easy">{t('tools.recipeCollection.easy', 'Easy')}</option>
              <option value="medium">{t('tools.recipeCollection.medium', 'Medium')}</option>
              <option value="hard">{t('tools.recipeCollection.hard', 'Hard')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.recipeCollection.prepTimeMin', 'Prep Time (min)')}
            </label>
            <input
              type="number"
              value={recipe.prepTime || ''}
              onChange={(e) => setRecipeData({ prepTime: parseInt(e.target.value) || 0 })}
              min="0"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.recipeCollection.cookTimeMin', 'Cook Time (min)')}
            </label>
            <input
              type="number"
              value={recipe.cookTime || ''}
              onChange={(e) => setRecipeData({ cookTime: parseInt(e.target.value) || 0 })}
              min="0"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.recipeCollection.servings', 'Servings')}
            </label>
            <input
              type="number"
              value={recipe.servings || ''}
              onChange={(e) => setRecipeData({ servings: parseInt(e.target.value) || 1 })}
              min="1"
              className={inputClass}
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.recipeCollection.imageUrlOptional', 'Image URL (Optional)')}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={recipe.imageUrl || ''}
              onChange={(e) => setRecipeData({ imageUrl: e.target.value })}
              placeholder={t('tools.recipeCollection.httpsExampleComImageJpg', 'https://example.com/image.jpg')}
              className={inputClass}
            />
            {recipe.imageUrl && (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                <img src={recipe.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.recipeCollection.ingredients', 'Ingredients')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={newIngredient.quantity || ''}
              onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 1 })}
              placeholder={t('tools.recipeCollection.qty', 'Qty')}
              min="0"
              step="0.1"
              className={`w-20 ${inputClass}`}
            />
            <select
              value={newIngredient.unit || 'piece'}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              className={selectClass}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newIngredient.name || ''}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              placeholder={t('tools.recipeCollection.ingredientName', 'Ingredient name')}
              className={`flex-1 ${inputClass}`}
              onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient(isEditing)}
            />
            <button
              onClick={() => handleAddIngredient(isEditing)}
              disabled={!newIngredient.name}
              className="px-4 py-2.5 bg-lime-500 text-white rounded-xl hover:bg-lime-600 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {ingredients.map((ing) => (
              <div
                key={ing.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  {ing.quantity} {ing.unit} {ing.name}
                </span>
                <button
                  onClick={() => handleRemoveIngredient(ing.id, isEditing)}
                  className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.recipeCollection.instructions', 'Instructions')}
            </label>
            <button
              onClick={() => handleAddInstruction(isEditing)}
              className="text-sm text-lime-500 hover:text-lime-600 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Step
            </button>
          </div>

          <div className="space-y-2">
            {instructions.map((step, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span
                  className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-medium ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {index + 1}
                </span>
                <textarea
                  value={step}
                  onChange={(e) => handleUpdateInstruction(index, e.target.value, isEditing)}
                  placeholder={`Step ${index + 1}...`}
                  rows={2}
                  className={`flex-1 ${inputClass} resize-none`}
                />
                <button
                  onClick={() => handleRemoveInstruction(index, isEditing)}
                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.recipeCollection.notesOptional', 'Notes (Optional)')}
          </label>
          <textarea
            value={recipe.notes || ''}
            onChange={(e) => setRecipeData({ notes: e.target.value })}
            placeholder={t('tools.recipeCollection.tipsVariationsOrAdditionalNotes', 'Tips, variations, or additional notes...')}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Favorite */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={recipe.isFavorite || false}
            onChange={(e) => setRecipeData({ isFavorite: e.target.checked })}
            className="w-4 h-4 text-lime-500 rounded focus:ring-lime-500"
          />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.recipeCollection.markAsFavorite', 'Mark as favorite')}
          </span>
        </label>
      </div>
    );
  };

  // Render recipe card
  const renderRecipeCard = (recipe: Recipe) => {
    const CategoryIcon = CATEGORIES.find((c) => c.id === recipe.category)?.icon || Utensils;

    return (
      <div
        key={recipe.id}
        className={`${cardClass} overflow-hidden hover:shadow-lg transition-all cursor-pointer group`}
        onClick={() => setSelectedRecipe(recipe)}
      >
        {recipe.imageUrl ? (
          <div className="h-40 overflow-hidden">
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div
            className={`h-40 flex items-center justify-center ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <ChefHat className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          </div>
        )}

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {recipe.name}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(recipe.id);
              }}
              className={`p-1 rounded transition-colors ${
                recipe.isFavorite
                  ? 'text-red-500'
                  : isDark
                  ? 'text-gray-500 hover:text-red-400'
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                isDark ? 'bg-lime-900/30 text-lime-400' : 'bg-lime-100 text-lime-700'
              }`}
            >
              <CategoryIcon className="w-3 h-3" />
              {recipe.category}
            </span>
            <span
              className={`px-2 py-1 rounded-lg text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
            >
              {recipe.cuisine}
            </span>
          </div>

          <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.prepTime + recipe.cookTime}m
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {recipe.servings}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                recipe.difficulty === 'easy'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : recipe.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render recipe detail modal
  const renderRecipeDetail = () => {
    if (!selectedRecipe) return null;

    const displayServings = scaleServings || selectedRecipe.servings;
    const displayIngredients =
      scaleServings && scaleServings !== selectedRecipe.servings
        ? getScaledIngredients(selectedRecipe, scaleServings)
        : selectedRecipe.ingredients;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={() => {
          setSelectedRecipe(null);
          setScaleServings(null);
        }}
      >
        <div
          className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative">
            {selectedRecipe.imageUrl ? (
              <div className="h-48 overflow-hidden">
                <img
                  src={selectedRecipe.imageUrl}
                  alt={selectedRecipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className={`h-32 flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <ChefHat className={`w-16 h-16 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              </div>
            )}
            <button
              onClick={() => {
                setSelectedRecipe(null);
                setScaleServings(null);
              }}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRecipe.name}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                      isDark ? 'bg-lime-900/30 text-lime-400' : 'bg-lime-100 text-lime-700'
                    }`}
                  >
                    {selectedRecipe.category}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-lg text-sm ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedRecipe.cuisine}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-lg text-sm ${
                      selectedRecipe.difficulty === 'easy'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : selectedRecipe.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {selectedRecipe.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleFavorite(selectedRecipe.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedRecipe.isFavorite
                      ? 'text-red-500 bg-red-100 dark:bg-red-900/20'
                      : isDark
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${selectedRecipe.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    setEditingRecipe(selectedRecipe);
                    setSelectedRecipe(null);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    handleDeleteRecipe(selectedRecipe.id);
                    setSelectedRecipe(null);
                  }}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Time & Servings */}
            <div
              className={`grid grid-cols-3 gap-4 p-4 rounded-xl ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.recipeCollection.prepTime', 'Prep Time')}
                </div>
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRecipe.prepTime} min
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.recipeCollection.cookTime', 'Cook Time')}
                </div>
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRecipe.cookTime} min
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.recipeCollection.servings2', 'Servings')}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setScaleServings(Math.max(1, displayServings - 1))}
                    className={`p-1 rounded ${
                      isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    -
                  </button>
                  <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {displayServings}
                  </span>
                  <button
                    onClick={() => setScaleServings(displayServings + 1)}
                    className={`p-1 rounded ${
                      isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    +
                  </button>
                </div>
                {scaleServings && scaleServings !== selectedRecipe.servings && (
                  <div className="text-xs text-lime-500 flex items-center justify-center gap-1 mt-1">
                    <Scale className="w-3 h-3" /> Scaled
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.recipeCollection.ingredients2', 'Ingredients')}
              </h3>
              <ul className="space-y-2">
                {displayIngredients.map((ing) => (
                  <li
                    key={ing.id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-lime-500" />
                    <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                      {ing.quantity} {ing.unit} {ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.recipeCollection.instructions2', 'Instructions')}
              </h3>
              <ol className="space-y-4">
                {selectedRecipe.instructions.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span
                      className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-medium bg-lime-500 text-white`}
                    >
                      {index + 1}
                    </span>
                    <p className={`pt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Notes */}
            {selectedRecipe.notes && (
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.recipeCollection.notes', 'Notes')}
                </h3>
                <p className={`p-4 rounded-xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                  {selectedRecipe.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => {
                handleGenerateShoppingList([selectedRecipe.id]);
                setViewMode('shoppinglist');
                setSelectedRecipe(null);
              }}
              className="w-full py-3 px-6 bg-lime-500 hover:bg-lime-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {t('tools.recipeCollection.addToShoppingList', 'Add to Shopping List')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render meal planner
  const renderMealPlanner = () => {
    const getDayName = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.recipeCollection.weeklyMealPlan', 'Weekly Meal Plan')}
          </h3>
          <button
            onClick={() => {
              const recipeIds = mealPlan.flatMap((day) =>
                [day.breakfast, day.lunch, day.dinner, day.snack].filter(Boolean)
              ) as string[];
              if (recipeIds.length > 0) {
                handleGenerateShoppingList([...new Set(recipeIds)]);
                setViewMode('shoppinglist');
              }
            }}
            disabled={!mealPlan.some((day) => day.breakfast || day.lunch || day.dinner || day.snack)}
            className="px-4 py-2 bg-lime-500 text-white rounded-xl hover:bg-lime-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {t('tools.recipeCollection.generateShoppingList', 'Generate Shopping List')}
          </button>
        </div>

        <div className="grid gap-4">
          {mealPlan.map((day) => (
            <div key={day.date} className={`${cardClass} p-4`}>
              <div className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getDayName(day.date)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => (
                  <div key={mealType} className="space-y-1">
                    <label
                      className={`text-xs font-medium uppercase ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {mealType}
                    </label>
                    <select
                      value={day[mealType] || ''}
                      onChange={(e) => handleAssignRecipe(day.date, mealType, e.target.value)}
                      className={`w-full text-sm ${selectClass}`}
                    >
                      <option value="">{t('tools.recipeCollection.selectRecipe', 'Select recipe...')}</option>
                      {recipes
                        .filter((r) => r.category === mealType || r.category === 'snack' || mealType === 'snack')
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render shopping list
  const renderShoppingList = () => {
    const uncheckedCount = shoppingList.filter((i) => !i.checked).length;
    const checkedCount = shoppingList.filter((i) => i.checked).length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.recipeCollection.shoppingList', 'Shopping List')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {uncheckedCount} items remaining
              {checkedCount > 0 && `, ${checkedCount} checked`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyShoppingList}
              disabled={shoppingList.length === 0}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copiedList ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedList ? t('tools.recipeCollection.copied', 'Copied!') : t('tools.recipeCollection.copyList', 'Copy List')}
            </button>
            <button
              onClick={handleClearCheckedItems}
              disabled={checkedCount === 0}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('tools.recipeCollection.clearChecked', 'Clear Checked')}
            </button>
          </div>
        </div>

        {shoppingList.length === 0 ? (
          <div className={`text-center py-12 ${cardClass}`}>
            <ShoppingCart className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t('tools.recipeCollection.yourShoppingListIsEmpty', 'Your shopping list is empty. Generate one from recipes or the meal planner.')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {shoppingList.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${cardClass} ${
                  item.checked ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => handleToggleShoppingItem(item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.checked
                      ? 'bg-lime-500 border-lime-500 text-white'
                      : isDark
                      ? 'border-gray-500'
                      : 'border-gray-300'
                  }`}
                >
                  {item.checked && <Check className="w-4 h-4" />}
                </button>
                <span
                  className={`flex-1 ${item.checked ? 'line-through' : ''} ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  {item.quantity} {item.unit} {item.name}
                </span>
                <button
                  onClick={() => handleRemoveShoppingItem(item.id)}
                  className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-lime-500/10 rounded-xl border border-lime-500/20">
            <Sparkles className="w-4 h-4 text-lime-500" />
            <span className="text-sm text-lime-500 font-medium">{t('tools.recipeCollection.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-lime-500/10 rounded-xl">
                <ChefHat className="w-6 h-6 text-lime-500" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.recipeCollection.recipeCollection', 'Recipe Collection')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.recipeCollection.manageYourRecipesAndMeal', 'Manage your recipes and meal plans')}
                </p>
              </div>
            </div>

            {/* Sync Status */}
            <WidgetEmbedButton toolSlug="recipe-collection" toolName="Recipe Collection" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />

            {/* View Toggle */}
            <div className={`flex rounded-xl p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {[
                { id: 'recipes', label: 'Recipes', icon: BookOpen },
                { id: 'mealplanner', label: 'Meal Plan', icon: Calendar },
                { id: 'shoppinglist', label: 'Shopping', icon: ShoppingCart },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id as ViewMode)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    viewMode === id
                      ? 'bg-lime-500 text-white'
                      : isDark
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeCollection.totalRecipes', 'Total Recipes')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeCollection.favorites', 'Favorites')}</div>
              <div className="text-2xl font-bold text-red-500">{stats.favorites}</div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeCollection.mostPopular', 'Most Popular')}</div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeCollection.shoppingItems', 'Shopping Items')}</div>
              <div className="text-2xl font-bold text-lime-500">{shoppingList.length}</div>
            </div>
          </div>
        </div>

        {/* Recipes View */}
        {viewMode === 'recipes' && (
          <>
            {/* Search & Filters */}
            <div className={`${cardClass} p-4`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('tools.recipeCollection.searchRecipes', 'Search recipes...')}
                    className={`w-full pl-10 ${inputClass}`}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors ${
                      showFavoritesOnly
                        ? 'bg-red-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                    {t('tools.recipeCollection.favorites2', 'Favorites')}
                  </button>
                  <ExportDropdown
                    onExportCSV={() => exportCSV({ filename: 'recipes' })}
                    onExportExcel={() => exportExcel({ filename: 'recipes' })}
                    onExportJSON={() => exportJSON({ filename: 'recipes' })}
                    onExportPDF={() => exportPDF({
                      filename: 'recipes',
                      title: 'Recipe Collection',
                      subtitle: `${recipes.length} recipes`,
                    })}
                    onPrint={() => print('Recipe Collection')}
                    onCopyToClipboard={() => copyToClipboard('tab')}
                    onImportCSV={async (file) => { await importCSV(file); }}
                    onImportJSON={async (file) => { await importJSON(file); }}
                    disabled={recipes.length === 0}
                    theme={isDark ? 'dark' : 'light'}
                  />
                  <button
                    onClick={() => {
                      setShowRecipeForm(true);
                      resetNewRecipe();
                    }}
                    className="px-4 py-2.5 bg-lime-500 text-white rounded-xl hover:bg-lime-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.recipeCollection.addRecipe', 'Add Recipe')}
                  </button>
                </div>
              </div>

              {/* Category filters */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {CATEGORIES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedCategory(id)}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
                      selectedCategory === id
                        ? 'bg-lime-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe Grid */}
            {filteredRecipes.length === 0 ? (
              <div className={`${cardClass} text-center py-12`}>
                <ChefHat className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {recipes.length === 0
                    ? t('tools.recipeCollection.noRecipesYetAddYour', 'No recipes yet. Add your first recipe!') : t('tools.recipeCollection.noRecipesMatchYourFilters', 'No recipes match your filters.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map(renderRecipeCard)}
              </div>
            )}
          </>
        )}

        {/* Meal Planner View */}
        {viewMode === 'mealplanner' && renderMealPlanner()}

        {/* Shopping List View */}
        {viewMode === 'shoppinglist' && renderShoppingList()}

        {/* Add/Edit Recipe Modal */}
        {(showRecipeForm || editingRecipe) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => {
              setShowRecipeForm(false);
              setEditingRecipe(null);
            }}
          >
            <div
              className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingRecipe ? t('tools.recipeCollection.editRecipe', 'Edit Recipe') : t('tools.recipeCollection.addNewRecipe', 'Add New Recipe')}
                </h2>
                <button
                  onClick={() => {
                    setShowRecipeForm(false);
                    setEditingRecipe(null);
                  }}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {renderRecipeForm(editingRecipe || newRecipe, !!editingRecipe)}
              </div>

              <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex gap-3`}>
                <button
                  onClick={() => {
                    setShowRecipeForm(false);
                    setEditingRecipe(null);
                  }}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.recipeCollection.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingRecipe ? handleUpdateRecipe : handleSaveRecipe}
                  disabled={!(editingRecipe?.name || newRecipe.name)}
                  className="flex-1 py-3 px-6 bg-lime-500 hover:bg-lime-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingRecipe ? t('tools.recipeCollection.updateRecipe', 'Update Recipe') : t('tools.recipeCollection.saveRecipe', 'Save Recipe')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && renderRecipeDetail()}
      </div>
    </div>
  );
};

export default RecipeCollectionTool;
