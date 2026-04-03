'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Scale,
  AlertTriangle,
  Star,
  Copy,
  Printer,
  ChefHat,
  Flame,
  Thermometer,
  Package,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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
import { useTheme } from '@/contexts/ThemeContext';

interface RecipeManagerToolProps {
  uiConfig?: UIConfig;
}

// Types
type RecipeCategory = 'bread' | 'pastry' | 'cake' | 'cookies' | 'filling' | 'frosting' | 'dough' | 'specialty';
type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
type MeasurementUnit = 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'L' | 'cup' | 'tbsp' | 'tsp' | 'each';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: MeasurementUnit;
  cost: number;
  notes?: string;
}

interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  duration?: number; // in minutes
  temperature?: number; // in fahrenheit
  tips?: string;
}

interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  description: string;
  yield: number;
  yieldUnit: string;
  prepTime: number; // in minutes
  restTime: number; // in minutes
  bakeTime: number; // in minutes
  totalTime: number;
  difficulty: DifficultyLevel;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  allergens: string[];
  costPerUnit: number;
  sellingPrice: number;
  profitMargin: number;
  notes: string;
  isActive: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Constants
const RECIPE_CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: 'bread', label: 'Breads & Rolls' },
  { value: 'pastry', label: 'Pastries' },
  { value: 'cake', label: 'Cakes' },
  { value: 'cookies', label: 'Cookies & Bars' },
  { value: 'filling', label: 'Fillings & Creams' },
  { value: 'frosting', label: 'Frostings & Icings' },
  { value: 'dough', label: 'Base Doughs' },
  { value: 'specialty', label: 'Specialty Items' },
];

const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'hard', label: 'Hard', color: 'orange' },
  { value: 'expert', label: 'Expert', color: 'red' },
];

const MEASUREMENT_UNITS: { value: MeasurementUnit; label: string }[] = [
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'cup', label: 'Cups' },
  { value: 'tbsp', label: 'Tablespoons' },
  { value: 'tsp', label: 'Teaspoons' },
  { value: 'each', label: 'Each' },
];

const COMMON_ALLERGENS = ['Wheat', 'Gluten', 'Milk', 'Eggs', 'Soy', 'Nuts', 'Peanuts', 'Sesame'];

// Column configuration for exports
const RECIPE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Recipe Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'yield', header: 'Yield', type: 'number' },
  { key: 'yieldUnit', header: 'Unit', type: 'string' },
  { key: 'totalTime', header: 'Total Time (min)', type: 'number' },
  { key: 'difficulty', header: 'Difficulty', type: 'string' },
  { key: 'costPerUnit', header: 'Cost/Unit', type: 'currency' },
  { key: 'sellingPrice', header: 'Selling Price', type: 'currency' },
  { key: 'profitMargin', header: 'Profit %', type: 'percent' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Main Component
export const RecipeManagerTool: React.FC<RecipeManagerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: recipes,
    addItem: addRecipeToBackend,
    updateItem: updateRecipeBackend,
    deleteItem: deleteRecipeBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Recipe>('bakery-recipes', [], RECIPE_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'recipes' | 'new' | 'view'>('recipes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  // New recipe form state
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    category: 'bread',
    description: '',
    yield: 1,
    yieldUnit: 'loaves',
    prepTime: 30,
    restTime: 0,
    bakeTime: 30,
    difficulty: 'medium',
    ingredients: [],
    steps: [],
    allergens: [],
    sellingPrice: 0,
    notes: '',
    createdBy: 'Baker',
  });

  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: '',
    quantity: 0,
    unit: 'g',
    cost: 0,
  });

  const [newStep, setNewStep] = useState<Partial<RecipeStep>>({
    instruction: '',
    duration: 0,
    temperature: 0,
    tips: '',
  });

  // Calculate recipe cost
  const calculateCost = (ingredients: Ingredient[]) => {
    return ingredients.reduce((sum, ing) => sum + ing.cost, 0);
  };

  // Add ingredient to new recipe
  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity) return;

    const ingredient: Ingredient = {
      id: generateId(),
      name: newIngredient.name || '',
      quantity: newIngredient.quantity || 0,
      unit: newIngredient.unit || 'g',
      cost: newIngredient.cost || 0,
      notes: newIngredient.notes,
    };

    setNewRecipe({
      ...newRecipe,
      ingredients: [...(newRecipe.ingredients || []), ingredient],
    });
    setNewIngredient({ name: '', quantity: 0, unit: 'g', cost: 0 });
  };

  // Remove ingredient
  const removeIngredient = (id: string) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients?.filter(i => i.id !== id) || [],
    });
  };

  // Add step to new recipe
  const addStep = () => {
    if (!newStep.instruction) return;

    const step: RecipeStep = {
      id: generateId(),
      stepNumber: (newRecipe.steps?.length || 0) + 1,
      instruction: newStep.instruction || '',
      duration: newStep.duration,
      temperature: newStep.temperature,
      tips: newStep.tips,
    };

    setNewRecipe({
      ...newRecipe,
      steps: [...(newRecipe.steps || []), step],
    });
    setNewStep({ instruction: '', duration: 0, temperature: 0, tips: '' });
  };

  // Remove step
  const removeStep = (id: string) => {
    const updatedSteps = newRecipe.steps?.filter(s => s.id !== id) || [];
    // Renumber steps
    updatedSteps.forEach((step, idx) => {
      step.stepNumber = idx + 1;
    });
    setNewRecipe({ ...newRecipe, steps: updatedSteps });
  };

  // Toggle allergen
  const toggleAllergen = (allergen: string) => {
    const current = newRecipe.allergens || [];
    if (current.includes(allergen)) {
      setNewRecipe({ ...newRecipe, allergens: current.filter(a => a !== allergen) });
    } else {
      setNewRecipe({ ...newRecipe, allergens: [...current, allergen] });
    }
  };

  // Add new recipe
  const addRecipe = () => {
    if (!newRecipe.name || !newRecipe.ingredients?.length || !newRecipe.steps?.length) {
      setValidationMessage('Please fill in recipe name, at least one ingredient, and at least one step');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const totalTime = (newRecipe.prepTime || 0) + (newRecipe.restTime || 0) + (newRecipe.bakeTime || 0);
    const costPerUnit = calculateCost(newRecipe.ingredients || []) / (newRecipe.yield || 1);
    const profitMargin = newRecipe.sellingPrice
      ? ((newRecipe.sellingPrice - costPerUnit) / newRecipe.sellingPrice) * 100
      : 0;

    const recipe: Recipe = {
      id: generateId(),
      name: newRecipe.name || '',
      category: newRecipe.category || 'bread',
      description: newRecipe.description || '',
      yield: newRecipe.yield || 1,
      yieldUnit: newRecipe.yieldUnit || 'items',
      prepTime: newRecipe.prepTime || 0,
      restTime: newRecipe.restTime || 0,
      bakeTime: newRecipe.bakeTime || 0,
      totalTime,
      difficulty: newRecipe.difficulty || 'medium',
      ingredients: newRecipe.ingredients || [],
      steps: newRecipe.steps || [],
      allergens: newRecipe.allergens || [],
      costPerUnit,
      sellingPrice: newRecipe.sellingPrice || 0,
      profitMargin,
      notes: newRecipe.notes || '',
      isActive: true,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: newRecipe.createdBy || 'Baker',
    };

    addRecipeToBackend(recipe);
    setActiveTab('recipes');
    setNewRecipe({
      name: '',
      category: 'bread',
      description: '',
      yield: 1,
      yieldUnit: 'loaves',
      prepTime: 30,
      restTime: 0,
      bakeTime: 30,
      difficulty: 'medium',
      ingredients: [],
      steps: [],
      allergens: [],
      sellingPrice: 0,
      notes: '',
      createdBy: 'Baker',
    });
  };

  // Toggle favorite
  const toggleFavorite = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      updateRecipeBackend(recipeId, { isFavorite: !recipe.isFavorite, updatedAt: new Date().toISOString() });
    }
  };

  // Delete recipe
  const deleteRecipe = async (recipeId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this recipe?');
    if (confirmed) {
      deleteRecipeBackend(recipeId);
    }
  };

  // View recipe details
  const viewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setScaleMultiplier(1);
    setActiveTab('view');
  };

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        searchTerm === '' ||
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
      const matchesDifficulty = filterDifficulty === 'all' || recipe.difficulty === filterDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [recipes, searchTerm, filterCategory, filterDifficulty]);

  // Stats
  const stats = useMemo(() => {
    const total = recipes.length;
    const favorites = recipes.filter(r => r.isFavorite).length;
    const avgMargin = recipes.length > 0
      ? recipes.reduce((sum, r) => sum + r.profitMargin, 0) / recipes.length
      : 0;
    const categories = new Set(recipes.map(r => r.category)).size;

    return { total, favorites, avgMargin, categories };
  }, [recipes]);

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    const colors = {
      easy: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      medium: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
      hard: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      expert: theme === 'dark' ? 'text-red-400' : 'text-red-600',
    };
    return colors[difficulty];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.recipeManager.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.recipeManager.recipeManager', 'Recipe Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.recipeManager.manageBakeryRecipesIngredientsAnd', 'Manage bakery recipes, ingredients, and costing')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="recipe-manager" toolName="Recipe Manager" />

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
                onExportCSV={() => exportToCSV(recipes, RECIPE_COLUMNS, { filename: 'bakery-recipes' })}
                onExportExcel={() => exportToExcel(recipes, RECIPE_COLUMNS, { filename: 'bakery-recipes' })}
                onExportJSON={() => exportToJSON(recipes, { filename: 'bakery-recipes' })}
                onExportPDF={async () => {
                  await exportToPDF(recipes, RECIPE_COLUMNS, {
                    filename: 'bakery-recipes',
                    title: 'Bakery Recipe Book',
                    subtitle: `${recipes.length} recipes`,
                  });
                }}
                onPrint={() => printData(recipes, RECIPE_COLUMNS, { title: 'Recipe Book' })}
                onCopyToClipboard={async () => await copyUtil(recipes, RECIPE_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recipeManager.totalRecipes', 'Total Recipes')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-yellow-500`}>{stats.favorites}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recipeManager.favorites', 'Favorites')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold text-green-500`}>{stats.avgMargin.toFixed(1)}%</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recipeManager.avgMargin', 'Avg. Margin')}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.categories}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recipeManager.categories', 'Categories')}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'recipes', label: 'All Recipes', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'new', label: 'New Recipe', icon: <Plus className="w-4 h-4" /> },
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

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.recipeManager.searchRecipes', 'Search recipes...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.recipeManager.allCategories', 'All Categories')}</option>
                {RECIPE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{t('tools.recipeManager.allDifficulties', 'All Difficulties')}</option>
                {DIFFICULTY_LEVELS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.recipeManager.noRecipesFound', 'No recipes found')}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {recipe.name}
                          </h3>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleFavorite(recipe.id)}
                          className={`p-1 rounded ${recipe.isFavorite ? 'text-yellow-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                        >
                          <Star className={`w-5 h-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {recipe.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(recipe.totalTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.yield} {recipe.yieldUnit}
                        </span>
                        <span className={getDifficultyColor(recipe.difficulty)}>
                          {DIFFICULTY_LEVELS.find(d => d.value === recipe.difficulty)?.label}
                        </span>
                      </div>
                    </div>
                    <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Cost: {formatCurrency(recipe.costPerUnit)}/unit
                        </span>
                        <span className={`text-sm font-medium ${recipe.profitMargin >= 50 ? 'text-green-500' : recipe.profitMargin >= 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {recipe.profitMargin.toFixed(1)}% margin
                        </span>
                      </div>
                      {recipe.allergens.length > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-orange-500">
                            {recipe.allergens.join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewRecipe(recipe)}
                          className="flex-1 py-2 bg-[#0D9488] text-white rounded text-sm hover:bg-[#0B7C71] transition-colors"
                        >
                          {t('tools.recipeManager.viewRecipe', 'View Recipe')}
                        </button>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View Recipe Tab */}
        {activeTab === 'view' && selectedRecipe && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRecipe.name}
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedRecipe.description}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('recipes')}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('tools.recipeManager.backToRecipes', 'Back to Recipes')}
              </button>
            </div>

            {/* Recipe Info */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <div>
                    <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(selectedRecipe.totalTime)}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.recipeManager.totalTime', 'Total Time')}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <div>
                    <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedRecipe.yield} {selectedRecipe.yieldUnit}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.recipeManager.yield', 'Yield')}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  <div>
                    <div className={`font-semibold ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                      {DIFFICULTY_LEVELS.find(d => d.value === selectedRecipe.difficulty)?.label}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.recipeManager.difficulty', 'Difficulty')}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  <div>
                    <div className={`font-semibold text-green-500`}>
                      {selectedRecipe.profitMargin.toFixed(1)}%
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.recipeManager.profitMargin2', 'Profit Margin')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scale Recipe */}
            <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-4">
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.recipeManager.scaleRecipe', 'Scale Recipe:')}</span>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={scaleMultiplier}
                  onChange={(e) => setScaleMultiplier(parseFloat(e.target.value) || 1)}
                  className={`w-20 px-3 py-1 rounded border ${
                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  = {(selectedRecipe.yield * scaleMultiplier).toFixed(1)} {selectedRecipe.yieldUnit}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Ingredients */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.recipeManager.ingredients2', 'Ingredients')}
                </h3>
                <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div
                      key={ing.id}
                      className={`p-3 flex items-center justify-between ${
                        idx !== 0 ? `border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}` : ''
                      }`}
                    >
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {ing.name}
                      </span>
                      <span className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {(ing.quantity * scaleMultiplier).toFixed(1)} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Allergens */}
                {selectedRecipe.allergens.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Contains: {selectedRecipe.allergens.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.recipeManager.instructions2', 'Instructions')}
                </h3>
                <div className="space-y-4">
                  {selectedRecipe.steps.map((step) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0D9488] text-white font-bold text-sm">
                          {step.stepNumber}
                        </span>
                        <div className="flex-1">
                          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {step.instruction}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            {step.duration && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-4 h-4" /> {step.duration} min
                              </span>
                            )}
                            {step.temperature && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Thermometer className="w-4 h-4" /> {step.temperature}F
                              </span>
                            )}
                          </div>
                          {step.tips && (
                            <p className="mt-2 text-sm italic text-gray-500">
                              Tip: {step.tips}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Recipe Tab */}
        {activeTab === 'new' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.recipeManager.createNewRecipe', 'Create New Recipe')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.recipeManager.basicInformation', 'Basic Information')}</h3>
                <input
                  type="text"
                  placeholder={t('tools.recipeManager.recipeName', 'Recipe Name *')}
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <select
                  value={newRecipe.category}
                  onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value as RecipeCategory })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {RECIPE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <textarea
                  placeholder={t('tools.recipeManager.description', 'Description')}
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="1"
                    placeholder={t('tools.recipeManager.yield2', 'Yield')}
                    value={newRecipe.yield}
                    onChange={(e) => setNewRecipe({ ...newRecipe, yield: parseInt(e.target.value) || 1 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.recipeManager.unitLoavesPcsEtc', 'Unit (loaves, pcs, etc.)')}
                    value={newRecipe.yieldUnit}
                    onChange={(e) => setNewRecipe({ ...newRecipe, yieldUnit: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.recipeManager.prepMin', 'Prep (min)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newRecipe.prepTime}
                      onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.recipeManager.restMin', 'Rest (min)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newRecipe.restTime}
                      onChange={(e) => setNewRecipe({ ...newRecipe, restTime: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.recipeManager.bakeMin', 'Bake (min)')}</label>
                    <input
                      type="number"
                      min="0"
                      value={newRecipe.bakeTime}
                      onChange={(e) => setNewRecipe({ ...newRecipe, bakeTime: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <select
                  value={newRecipe.difficulty}
                  onChange={(e) => setNewRecipe({ ...newRecipe, difficulty: e.target.value as DifficultyLevel })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {DIFFICULTY_LEVELS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.recipeManager.ingredients', 'Ingredients')}</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('tools.recipeManager.ingredientName', 'Ingredient name')}
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder={t('tools.recipeManager.qty', 'Qty')}
                    value={newIngredient.quantity || ''}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 0 })}
                    className={`w-20 px-2 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <select
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value as MeasurementUnit })}
                    className={`w-24 px-2 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    {MEASUREMENT_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.value}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t('tools.recipeManager.cost', 'Cost')}
                    value={newIngredient.cost || ''}
                    onChange={(e) => setNewIngredient({ ...newIngredient, cost: parseFloat(e.target.value) || 0 })}
                    className={`w-20 px-2 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <button
                    onClick={addIngredient}
                    className="px-3 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C71]"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className={`rounded-lg border max-h-48 overflow-y-auto ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  {newRecipe.ingredients?.length === 0 ? (
                    <p className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.recipeManager.noIngredientsAddedYet', 'No ingredients added yet')}
                    </p>
                  ) : (
                    newRecipe.ingredients?.map((ing) => (
                      <div
                        key={ing.id}
                        className={`p-3 flex items-center justify-between border-b last:border-b-0 ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {ing.name} - {ing.quantity} {ing.unit} ({formatCurrency(ing.cost)})
                        </span>
                        <button
                          onClick={() => removeIngredient(ing.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.recipeManager.instructions', 'Instructions')}</h3>
                <textarea
                  placeholder={t('tools.recipeManager.instructionStep', 'Instruction step')}
                  value={newStep.instruction}
                  onChange={(e) => setNewStep({ ...newStep, instruction: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder={t('tools.recipeManager.durationMin', 'Duration (min)')}
                    value={newStep.duration || ''}
                    onChange={(e) => setNewStep({ ...newStep, duration: parseInt(e.target.value) || 0 })}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder={t('tools.recipeManager.tempF', 'Temp (F)')}
                    value={newStep.temperature || ''}
                    onChange={(e) => setNewStep({ ...newStep, temperature: parseInt(e.target.value) || 0 })}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <button
                    onClick={addStep}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C71]"
                  >
                    {t('tools.recipeManager.addStep', 'Add Step')}
                  </button>
                </div>
                <div className={`rounded-lg border max-h-48 overflow-y-auto ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  {newRecipe.steps?.length === 0 ? (
                    <p className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.recipeManager.noStepsAddedYet', 'No steps added yet')}
                    </p>
                  ) : (
                    newRecipe.steps?.map((step) => (
                      <div
                        key={step.id}
                        className={`p-3 flex items-start gap-3 border-b last:border-b-0 ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#0D9488] text-white text-sm font-medium">
                          {step.stepNumber}
                        </span>
                        <p className={`flex-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {step.instruction}
                        </p>
                        <button
                          onClick={() => removeStep(step.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Allergens & Pricing */}
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.recipeManager.allergensPricing', 'Allergens & Pricing')}</h3>
                <div>
                  <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.recipeManager.allergens', 'Allergens')}</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_ALLERGENS.map((allergen) => (
                      <button
                        key={allergen}
                        onClick={() => toggleAllergen(allergen)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          newRecipe.allergens?.includes(allergen)
                            ? 'bg-orange-500 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {allergen}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.recipeManager.sellingPricePerUnit', 'Selling Price (per unit)')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newRecipe.sellingPrice || ''}
                    onChange={(e) => setNewRecipe({ ...newRecipe, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.recipeManager.costSummary', 'Cost Summary')}</h4>
                  <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex justify-between">
                      <span>{t('tools.recipeManager.totalIngredientCost', 'Total Ingredient Cost:')}</span>
                      <span>{formatCurrency(calculateCost(newRecipe.ingredients || []))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('tools.recipeManager.costPerUnit', 'Cost per Unit:')}</span>
                      <span>{formatCurrency(calculateCost(newRecipe.ingredients || []) / (newRecipe.yield || 1))}</span>
                    </div>
                    {newRecipe.sellingPrice && newRecipe.sellingPrice > 0 && (
                      <div className="flex justify-between font-medium text-green-500">
                        <span>{t('tools.recipeManager.profitMargin', 'Profit Margin:')}</span>
                        <span>
                          {(((newRecipe.sellingPrice - (calculateCost(newRecipe.ingredients || []) / (newRecipe.yield || 1))) / newRecipe.sellingPrice) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  placeholder={t('tools.recipeManager.additionalNotes', 'Additional notes')}
                  value={newRecipe.notes}
                  onChange={(e) => setNewRecipe({ ...newRecipe, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={addRecipe}
                  className="w-full py-3 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7C71] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t('tools.recipeManager.saveRecipe', 'Save Recipe')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default RecipeManagerTool;
