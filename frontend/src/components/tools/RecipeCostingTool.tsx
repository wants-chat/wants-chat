'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  DollarSign,
  Package,
  Scale,
  Calculator,
  Copy,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface RecipeCostingToolProps {
  uiConfig?: UIConfig;
}

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  yield: number;
  yieldUnit: string;
  ingredients: Ingredient[];
  totalCost: number;
  costPerServing: number;
  targetMargin: number;
  suggestedPrice: number;
  laborCost: number;
  overheadPercent: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ['Appetizers', 'Entrees', 'Sides', 'Desserts', 'Beverages', 'Sauces', 'Baked Goods'];
const UNITS = ['oz', 'lb', 'g', 'kg', 'cup', 'tbsp', 'tsp', 'ml', 'L', 'each', 'bunch', 'can'];

const RECIPE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Recipe Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'yield', header: 'Yield', type: 'number' },
  { key: 'totalCost', header: 'Total Cost', type: 'currency' },
  { key: 'costPerServing', header: 'Cost/Serving', type: 'currency' },
  { key: 'suggestedPrice', header: 'Suggested Price', type: 'currency' },
];

export const RecipeCostingTool: React.FC<RecipeCostingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: recipes,
    setData: setRecipes,
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
  } = useToolData<Recipe>('recipe-costing', [], RECIPE_COLUMNS);

  const [showAddForm, setShowAddForm] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());

  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    category: 'Entrees',
    yield: 1,
    yieldUnit: 'servings',
    ingredients: [],
    laborCost: 0,
    overheadPercent: 15,
    targetMargin: 70,
    notes: '',
  });

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: 0,
    unit: 'oz',
    unitCost: 0,
  });

  const filteredRecipes = useMemo(() => {
    if (selectedCategory === 'all') return recipes;
    return recipes.filter((r) => r.category === selectedCategory);
  }, [recipes, selectedCategory]);

  const stats = useMemo(() => {
    const totalRecipes = recipes.length;
    const avgCostPerServing = recipes.length > 0
      ? recipes.reduce((sum, r) => sum + r.costPerServing, 0) / recipes.length
      : 0;
    const totalIngredientCost = recipes.reduce((sum, r) => sum + r.totalCost, 0);
    const avgMargin = recipes.length > 0
      ? recipes.reduce((sum, r) => sum + r.targetMargin, 0) / recipes.length
      : 0;

    return { totalRecipes, avgCostPerServing, totalIngredientCost, avgMargin };
  }, [recipes]);

  const calculateRecipeCost = (ingredients: Ingredient[], laborCost: number, overheadPercent: number, recipeYield: number, targetMargin: number) => {
    const ingredientCost = ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
    const overhead = ingredientCost * (overheadPercent / 100);
    const totalCost = ingredientCost + laborCost + overhead;
    const costPerServing = recipeYield > 0 ? totalCost / recipeYield : 0;
    const suggestedPrice = targetMargin > 0 ? costPerServing / (1 - targetMargin / 100) : costPerServing * 3;

    return { totalCost, costPerServing, suggestedPrice };
  };

  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity) return;

    const ingredient: Ingredient = {
      id: `ing-${Date.now()}`,
      name: newIngredient.name,
      quantity: newIngredient.quantity,
      unit: newIngredient.unit,
      unitCost: newIngredient.unitCost,
      totalCost: newIngredient.quantity * newIngredient.unitCost,
    };

    setNewRecipe({
      ...newRecipe,
      ingredients: [...(newRecipe.ingredients || []), ingredient],
    });
    setNewIngredient({ name: '', quantity: 0, unit: 'oz', unitCost: 0 });
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: (newRecipe.ingredients || []).filter((i) => i.id !== ingredientId),
    });
  };

  const handleAddRecipe = () => {
    if (!newRecipe.name || !(newRecipe.ingredients?.length)) return;

    const costs = calculateRecipeCost(
      newRecipe.ingredients || [],
      newRecipe.laborCost || 0,
      newRecipe.overheadPercent || 15,
      newRecipe.yield || 1,
      newRecipe.targetMargin || 70
    );

    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      name: newRecipe.name || '',
      category: newRecipe.category || 'Entrees',
      yield: newRecipe.yield || 1,
      yieldUnit: newRecipe.yieldUnit || 'servings',
      ingredients: newRecipe.ingredients || [],
      totalCost: costs.totalCost,
      costPerServing: costs.costPerServing,
      targetMargin: newRecipe.targetMargin || 70,
      suggestedPrice: costs.suggestedPrice,
      laborCost: newRecipe.laborCost || 0,
      overheadPercent: newRecipe.overheadPercent || 15,
      notes: newRecipe.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(recipe);
    setNewRecipe({
      name: '',
      category: 'Entrees',
      yield: 1,
      yieldUnit: 'servings',
      ingredients: [],
      laborCost: 0,
      overheadPercent: 15,
      targetMargin: 70,
      notes: '',
    });
  };

  const handleDuplicateRecipe = (recipe: Recipe) => {
    const duplicated: Recipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      name: `${recipe.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(duplicated);
  };

  const toggleRecipeExpand = (id: string) => {
    const newExpanded = new Set(expandedRecipes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecipes(newExpanded);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Clear All Recipes',
      message: 'Are you sure you want to clear all recipes? This action cannot be undone.',
      confirmText: 'Yes, Clear All',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setRecipes([]);
    }
  };

  const previewCosts = useMemo(() => {
    if (!(newRecipe.ingredients?.length)) return null;
    return calculateRecipeCost(
      newRecipe.ingredients || [],
      newRecipe.laborCost || 0,
      newRecipe.overheadPercent || 15,
      newRecipe.yield || 1,
      newRecipe.targetMargin || 70
    );
  }, [newRecipe]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                  <BookOpen className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.recipeCosting.recipeCosting', 'Recipe Costing')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.recipeCosting.calculateRecipeCostsAndPricing', 'Calculate recipe costs and pricing by ingredient')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="recipe-costing" toolName="Recipe Costing" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={isDark ? 'dark' : 'light'}
                  size="sm"
                />
                <ExportDropdown
                  onExportCSV={() => exportCSV({ filename: 'recipe-costing' })}
                  onExportExcel={() => exportExcel({ filename: 'recipe-costing' })}
                  onExportJSON={() => exportJSON({ filename: 'recipe-costing' })}
                  onExportPDF={() => exportPDF({
                    filename: 'recipe-costing',
                    title: 'Recipe Costing',
                    subtitle: `${recipes.length} recipes`,
                  })}
                  onPrint={() => print('Recipe Costing')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={recipes.length === 0}
                />
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                    isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.recipeCosting.reset', 'Reset')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeCosting.totalRecipes', 'Total Recipes')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalRecipes}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeCosting.avgCostServing', 'Avg Cost/Serving')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.avgCostPerServing.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeCosting.totalIngredientCost', 'Total Ingredient Cost')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.totalIngredientCost.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeCosting.avgTargetMargin', 'Avg Target Margin')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">{stats.avgMargin.toFixed(0)}%</div>
          </div>
        </div>

        {/* Filter */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.recipeCosting.filter', 'Filter:')}</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-2 border ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-200 bg-white text-gray-900'
                } rounded-lg`}
              >
                <option value="all">{t('tools.recipeCosting.allCategories', 'All Categories')}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Recipe Form */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Plus className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.recipeCosting.newRecipe', 'New Recipe')}
                </CardTitle>
                {showAddForm ? (
                  <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent className="space-y-4 overflow-hidden">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recipeCosting.recipeName', 'Recipe Name *')}
                    </label>
                    <input
                      type="text"
                      value={newRecipe.name}
                      onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                      placeholder={t('tools.recipeCosting.eGTomatoSauce', 'e.g., Tomato Sauce')}
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recipeCosting.category', 'Category')}
                    </label>
                    <select
                      value={newRecipe.category}
                      onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value })}
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recipeCosting.yield', 'Yield')}
                    </label>
                    <input
                      type="number"
                      value={newRecipe.yield || ''}
                      onChange={(e) => setNewRecipe({ ...newRecipe, yield: parseInt(e.target.value) || 1 })}
                      min="1"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recipeCosting.yieldUnit', 'Yield Unit')}
                    </label>
                    <input
                      type="text"
                      value={newRecipe.yieldUnit}
                      onChange={(e) => setNewRecipe({ ...newRecipe, yieldUnit: e.target.value })}
                      placeholder="servings"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recipeCosting.targetMargin', 'Target Margin %')}
                    </label>
                    <input
                      type="number"
                      value={newRecipe.targetMargin || ''}
                      onChange={(e) => setNewRecipe({ ...newRecipe, targetMargin: parseFloat(e.target.value) || 70 })}
                      min="0"
                      max="100"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    />
                  </div>
                </div>

                {/* Add Ingredients */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Package className="w-4 h-4 inline mr-2" />
                    {t('tools.recipeCosting.ingredients', 'Ingredients')}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <input
                      type="text"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      placeholder={t('tools.recipeCosting.ingredient', 'Ingredient')}
                      className={`px-3 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-600 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg text-sm`}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newIngredient.quantity || ''}
                        onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 0 })}
                        placeholder={t('tools.recipeCosting.qty', 'Qty')}
                        min="0"
                        step="0.01"
                        className={`w-20 px-3 py-2 border ${
                          isDark
                            ? 'border-gray-600 bg-gray-600 text-white placeholder:text-gray-400'
                            : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                        } rounded-lg text-sm`}
                      />
                      <select
                        value={newIngredient.unit}
                        onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                        className={`w-20 px-2 py-2 border ${
                          isDark
                            ? 'border-gray-600 bg-gray-600 text-white'
                            : 'border-gray-200 bg-white text-gray-900'
                        } rounded-lg text-sm`}
                      >
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="number"
                      value={newIngredient.unitCost || ''}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unitCost: parseFloat(e.target.value) || 0 })}
                      placeholder={t('tools.recipeCosting.costPerUnit', 'Cost per unit ($)')}
                      min="0"
                      step="0.01"
                      className={`px-3 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-600 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg text-sm`}
                    />
                    <button
                      onClick={handleAddIngredient}
                      disabled={!newIngredient.name || !newIngredient.quantity}
                      className="px-3 py-2 bg-[#0D9488] text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tools.recipeCosting.add', 'Add')}
                    </button>
                  </div>

                  {/* Ingredients List */}
                  {newRecipe.ingredients && newRecipe.ingredients.length > 0 && (
                    <div className="space-y-2">
                      {newRecipe.ingredients.map((ing) => (
                        <div
                          key={ing.id}
                          className={`flex items-center justify-between p-2 rounded ${
                            isDark ? 'bg-gray-600' : 'bg-white'
                          }`}
                        >
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {ing.quantity} {ing.unit} {ing.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#0D9488] font-medium">${ing.totalCost.toFixed(2)}</span>
                            <button
                              onClick={() => handleRemoveIngredient(ing.id)}
                              className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recipeCosting.laborCost', 'Labor Cost ($)')}
                    </label>
                    <input
                      type="number"
                      value={newRecipe.laborCost || ''}
                      onChange={(e) => setNewRecipe({ ...newRecipe, laborCost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.recipeCosting.overhead2', 'Overhead %')}
                    </label>
                    <input
                      type="number"
                      value={newRecipe.overheadPercent || ''}
                      onChange={(e) => setNewRecipe({ ...newRecipe, overheadPercent: parseFloat(e.target.value) || 15 })}
                      placeholder="15"
                      min="0"
                      max="100"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                </div>

                {/* Cost Preview */}
                {previewCosts && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'} border-2 border-[#0D9488]/30`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Calculator className="w-4 h-4 inline mr-2" />
                      {t('tools.recipeCosting.costSummary', 'Cost Summary')}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.recipeCosting.totalCost', 'Total Cost:')}</span>
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${previewCosts.totalCost.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.recipeCosting.costServing', 'Cost/Serving:')}</span>
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${previewCosts.costPerServing.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.recipeCosting.suggestedPrice', 'Suggested Price:')}</span>
                        <div className="font-bold text-[#0D9488]">
                          ${previewCosts.suggestedPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddRecipe}
                  disabled={!newRecipe.name || !(newRecipe.ingredients?.length)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  {t('tools.recipeCosting.saveRecipe', 'Save Recipe')}
                </button>
              </CardContent>
            )}
          </Card>

          {/* Recipes List */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <BookOpen className="w-5 h-5 text-[#0D9488]" />
                Recipes ({filteredRecipes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRecipes.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.recipeCosting.noRecipesFound', 'No recipes found')}</p>
                  <p className="text-sm mt-1">{t('tools.recipeCosting.addARecipeToGet', 'Add a recipe to get started')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className={`rounded-xl border ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => toggleRecipeExpand(recipe.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {recipe.name}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                {recipe.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                Yield: {recipe.yield} {recipe.yieldUnit}
                              </span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                Cost: ${recipe.costPerServing.toFixed(2)}/serving
                              </span>
                              <span className="text-[#0D9488] font-medium">
                                Price: ${recipe.suggestedPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDuplicateRecipe(recipe); }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteItem(recipe.id); }}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {expandedRecipes.has(recipe.id) ? (
                              <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            ) : (
                              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </div>
                        </div>
                      </div>

                      {expandedRecipes.has(recipe.id) && (
                        <div className={`px-4 pb-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                          <h5 className={`text-sm font-medium mt-3 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('tools.recipeCosting.ingredients2', 'Ingredients:')}
                          </h5>
                          <div className="space-y-1">
                            {recipe.ingredients.map((ing) => (
                              <div key={ing.id} className="flex justify-between text-sm">
                                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                  {ing.quantity} {ing.unit} {ing.name}
                                </span>
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                  ${ing.totalCost.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'} grid grid-cols-3 gap-2 text-sm`}>
                            <div>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.recipeCosting.totalCost2', 'Total Cost:')}</span>
                              <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${recipe.totalCost.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.recipeCosting.labor', 'Labor:')}</span>
                              <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${recipe.laborCost.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.recipeCosting.overhead', 'Overhead:')}</span>
                              <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {recipe.overheadPercent}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default RecipeCostingTool;
