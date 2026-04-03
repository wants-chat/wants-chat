/**
 * Recipe Component Generators
 *
 * Generates recipe-specific components:
 * - RecipeHeader: Recipe title, image, and meta info
 * - RecipeSteps: Step-by-step cooking instructions
 * - IngredientList: Recipe ingredients list with quantities
 * - ShoppingList: Aggregated shopping list from recipes
 * - NutritionInfo: Nutritional information display
 * - MealPlanner: Weekly meal planning calendar
 */

export interface RecipeOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate recipe header component
 */
export function generateRecipeHeader(options: RecipeOptions = {}): string {
  const { componentName = 'RecipeHeader' } = options;

  return `import React from 'react';
import { Clock, Users, ChefHat, Star, Heart, Share2, Printer, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  recipe: {
    id?: string;
    title?: string;
    name?: string;
    image_url?: string;
    description?: string;
    prep_time?: number;
    cook_time?: number;
    total_time?: number;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | string;
    rating?: number;
    reviews_count?: number;
    author?: {
      name?: string;
      avatar_url?: string;
    };
    cuisine?: string;
    course?: string;
    tags?: string[];
  };
  onSave?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  isSaved?: boolean;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  recipe,
  onSave,
  onShare,
  onPrint,
  isSaved = false,
  className,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700',
    };
    return colors[difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const formatTime = (minutes: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return \`\${minutes} min\`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? \`\${hours}h \${mins}m\` : \`\${hours}h\`;
  };

  const totalTime = recipe.total_time || (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      {/* Hero Image */}
      {recipe.image_url && (
        <div className="relative aspect-video md:aspect-[21/9] overflow-hidden">
          <img
            src={recipe.image_url}
            alt={recipe.title || recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {recipe.title || recipe.name}
            </h1>
            {recipe.description && (
              <p className="text-white/80 text-lg max-w-3xl line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recipe Meta */}
      <div className="p-6">
        {!recipe.image_url && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {recipe.title || recipe.name}
            </h1>
            {recipe.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {recipe.description}
              </p>
            )}
          </>
        )}

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {recipe.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={\`w-5 h-5 \${i < Math.floor(recipe.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}\`}
                  />
                ))}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{recipe.rating}</span>
              {recipe.reviews_count && (
                <span className="text-gray-500">({recipe.reviews_count} reviews)</span>
              )}
            </div>
          )}

          {recipe.difficulty && (
            <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getDifficultyColor(recipe.difficulty)}\`}>
              {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
            </span>
          )}

          {recipe.cuisine && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {recipe.cuisine}
            </span>
          )}

          {recipe.course && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {recipe.course}
            </span>
          )}
        </div>

        {/* Time & Servings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Prep Time</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatTime(recipe.prep_time || 0)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
              <ChefHat className="w-4 h-4" />
              <span className="text-sm">Cook Time</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatTime(recipe.cook_time || 0)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Total Time</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatTime(totalTime)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Servings</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {recipe.servings || '-'}
            </p>
          </div>
        </div>

        {/* Author & Actions */}
        <div className="flex items-center justify-between">
          {recipe.author && (
            <div className="flex items-center gap-3">
              {recipe.author.avatar_url ? (
                <img src={recipe.author.avatar_url} alt={recipe.author.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-orange-600" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Recipe by</p>
                <p className="font-medium text-gray-900 dark:text-white">{recipe.author.name}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={onSave}
                className={\`p-2 rounded-lg transition-colors \${
                  isSaved
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }\`}
              >
                <Bookmark className={\`w-5 h-5 \${isSaved ? 'fill-current' : ''}\`} />
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            {onPrint && (
              <button
                onClick={onPrint}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Printer className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {recipe.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate recipe steps component
 */
export function generateRecipeSteps(options: RecipeOptions = {}): string {
  const { componentName = 'RecipeSteps' } = options;

  return `import React, { useState } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeStep {
  id?: string;
  step_number?: number;
  title?: string;
  instruction: string;
  image_url?: string;
  duration_minutes?: number;
  tip?: string;
}

interface ${componentName}Props {
  steps: RecipeStep[];
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ steps, className }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Instructions</h2>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: \`\${progress}%\` }}
            />
          </div>
          <span className="text-sm text-gray-500">
            {completedSteps.size}/{steps.length}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const stepNumber = step.step_number || index + 1;

          return (
            <div
              key={step.id || index}
              className={cn(
                'relative pl-12 pb-6 border-l-2 last:pb-0 last:border-l-0',
                isCompleted ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'
              )}
            >
              {/* Step Number Circle */}
              <button
                onClick={() => toggleStep(index)}
                className={cn(
                  'absolute -left-5 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-500 hover:text-orange-500'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </button>

              {/* Step Content */}
              <div className={cn(isCompleted && 'opacity-60')}>
                {step.title && (
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                )}

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {step.instruction}
                </p>

                {step.image_url && (
                  <img
                    src={step.image_url}
                    alt={\`Step \${stepNumber}\`}
                    className="mt-4 rounded-lg max-w-md"
                  />
                )}

                <div className="flex flex-wrap gap-4 mt-3">
                  {step.duration_minutes && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {step.duration_minutes} min
                    </span>
                  )}
                </div>

                {step.tip && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <span className="font-medium">Tip:</span> {step.tip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {completedSteps.size === steps.length && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
          <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-medium text-green-800 dark:text-green-200">Recipe Complete!</p>
          <p className="text-sm text-green-600 dark:text-green-400">Enjoy your meal!</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate ingredient list component
 */
export function generateIngredientList(options: RecipeOptions = {}): string {
  const { componentName = 'IngredientList' } = options;

  return `import React, { useState } from 'react';
import { Check, ShoppingCart, Users, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ingredient {
  id?: string;
  name: string;
  amount?: number;
  unit?: string;
  notes?: string;
  optional?: boolean;
  category?: string;
}

interface ${componentName}Props {
  ingredients: Ingredient[];
  defaultServings?: number;
  onAddToShoppingList?: (ingredients: Ingredient[]) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  ingredients,
  defaultServings = 4,
  onAddToShoppingList,
  className,
}) => {
  const [servings, setServings] = useState(defaultServings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  const multiplier = servings / defaultServings;

  const toggleIngredient = (id: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    const adjusted = amount * multiplier;
    // Format as fraction if needed
    if (adjusted < 1) {
      if (adjusted === 0.25) return '1/4';
      if (adjusted === 0.33 || adjusted === 0.34) return '1/3';
      if (adjusted === 0.5) return '1/2';
      if (adjusted === 0.66 || adjusted === 0.67) return '2/3';
      if (adjusted === 0.75) return '3/4';
    }
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
  };

  // Group by category if available
  const groupedIngredients = ingredients.reduce((acc, ing) => {
    const category = ing.category || 'Ingredients';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const handleAddToShoppingList = () => {
    const adjustedIngredients = ingredients.map(ing => ({
      ...ing,
      amount: ing.amount ? ing.amount * multiplier : undefined,
    }));
    onAddToShoppingList?.(adjustedIngredients);
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ingredients</h2>

        {/* Servings Adjuster */}
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-400" />
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
              disabled={servings <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 font-medium text-gray-900 dark:text-white min-w-[60px] text-center">
              {servings}
            </span>
            <button
              onClick={() => setServings(servings + 1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ingredient Groups */}
      <div className="space-y-6">
        {Object.entries(groupedIngredients).map(([category, items]) => (
          <div key={category}>
            {Object.keys(groupedIngredients).length > 1 && (
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category}
              </h3>
            )}
            <ul className="space-y-2">
              {items.map((ingredient, idx) => {
                const id = ingredient.id || \`\${category}-\${idx}\`;
                const isChecked = checkedIngredients.has(id);

                return (
                  <li key={id}>
                    <button
                      onClick={() => toggleIngredient(id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                        isChecked
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                        isChecked
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-gray-600'
                      )}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className={cn(
                          'text-gray-900 dark:text-white',
                          isChecked && 'line-through opacity-60'
                        )}>
                          {formatAmount(ingredient.amount)} {ingredient.unit} <span className="font-medium">{ingredient.name}</span>
                        </span>
                        {ingredient.notes && (
                          <span className="text-gray-500 text-sm ml-1">({ingredient.notes})</span>
                        )}
                      </div>
                      {ingredient.optional && (
                        <span className="text-xs text-gray-400">optional</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Add to Shopping List */}
      {onAddToShoppingList && (
        <button
          onClick={handleAddToShoppingList}
          className="w-full mt-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Add All to Shopping List
        </button>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate shopping list component
 */
export function generateShoppingList(options: RecipeOptions = {}): string {
  const { componentName = 'ShoppingList', endpoint = '/recipes/shopping-list' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Check, Trash2, ShoppingCart, Plus, Share2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ShoppingItem {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  category?: string;
  recipe_name?: string;
  is_checked?: boolean;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['shopping-list'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch shopping list:', err);
        return [];
      }
    },
  });

  const toggleItem = useMutation({
    mutationFn: (id: string) => api.put(\`${endpoint}/\${id}/toggle\`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-list'] }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => api.delete(\`${endpoint}/\${id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
      toast.success('Item removed');
    },
  });

  const addItem = useMutation({
    mutationFn: (name: string) => api.post('${endpoint}', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
      setNewItem('');
    },
  });

  const clearChecked = useMutation({
    mutationFn: () => api.delete('${endpoint}/checked'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
      toast.success('Checked items cleared');
    },
  });

  // Group by category
  const groupedItems = items.reduce((acc: Record<string, ShoppingItem[]>, item: ShoppingItem) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const checkedCount = items.filter((i: ShoppingItem) => i.is_checked).length;
  const totalCount = items.length;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      addItem.mutate(newItem.trim());
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shopping List</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {checkedCount}/{totalCount} items
            </span>
            {checkedCount > 0 && (
              <button
                onClick={() => clearChecked.mutate()}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear checked
              </button>
            )}
          </div>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add an item..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
          <button
            type="submit"
            disabled={!newItem.trim() || addItem.isPending}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      {totalCount > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {categoryItems.map((item: ShoppingItem) => (
                  <li key={item.id} className="flex items-center gap-3 group">
                    <button
                      onClick={() => toggleItem.mutate(item.id)}
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        item.is_checked
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-gray-600 hover:border-orange-500'
                      )}
                    >
                      {item.is_checked && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className={cn(
                      'flex-1',
                      item.is_checked && 'line-through opacity-60'
                    )}>
                      <span className="text-gray-900 dark:text-white">
                        {item.amount && \`\${item.amount} \${item.unit || ''} \`}
                        <span className="font-medium">{item.name}</span>
                      </span>
                      {item.recipe_name && (
                        <span className="text-xs text-gray-400 ml-2">from {item.recipe_name}</span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteItem.mutate(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Your shopping list is empty</p>
          <p className="text-sm">Add items from recipes or manually above</p>
        </div>
      )}

      {totalCount > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate nutrition info component
 */
export function generateNutritionInfo(options: RecipeOptions = {}): string {
  const { componentName = 'NutritionInfo' } = options;

  return `import React from 'react';
import { cn } from '@/lib/utils';

interface NutritionData {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturated_fat?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  calcium?: number;
  iron?: number;
}

interface ${componentName}Props {
  nutrition: NutritionData;
  servingSize?: string;
  servingsPerRecipe?: number;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  nutrition,
  servingSize = '1 serving',
  servingsPerRecipe,
  className,
}) => {
  // Daily values based on 2000 calorie diet
  const dailyValues = {
    calories: 2000,
    protein: 50,
    carbohydrates: 300,
    fat: 65,
    fiber: 25,
    sugar: 50,
    sodium: 2300,
    cholesterol: 300,
    saturated_fat: 20,
    vitamin_a: 900,
    vitamin_c: 90,
    calcium: 1000,
    iron: 18,
  };

  const getPercentDV = (value: number | undefined, daily: number) => {
    if (!value) return 0;
    return Math.round((value / daily) * 100);
  };

  const mainNutrients = [
    { key: 'calories', label: 'Calories', unit: '', bold: true },
    { key: 'fat', label: 'Total Fat', unit: 'g', indent: false },
    { key: 'saturated_fat', label: 'Saturated Fat', unit: 'g', indent: true },
    { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', indent: false },
    { key: 'sodium', label: 'Sodium', unit: 'mg', indent: false },
    { key: 'carbohydrates', label: 'Total Carbohydrate', unit: 'g', indent: false },
    { key: 'fiber', label: 'Dietary Fiber', unit: 'g', indent: true },
    { key: 'sugar', label: 'Total Sugars', unit: 'g', indent: true },
    { key: 'protein', label: 'Protein', unit: 'g', indent: false },
  ];

  const vitamins = [
    { key: 'vitamin_a', label: 'Vitamin A' },
    { key: 'vitamin_c', label: 'Vitamin C' },
    { key: 'calcium', label: 'Calcium' },
    { key: 'iron', label: 'Iron' },
  ];

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nutrition Facts</h2>

      {servingsPerRecipe && (
        <p className="text-sm text-gray-500 mb-1">{servingsPerRecipe} servings per recipe</p>
      )}
      <p className="text-sm text-gray-500 mb-4">Serving size: {servingSize}</p>

      <div className="border-t-8 border-gray-900 dark:border-white pt-2">
        <p className="text-sm text-gray-500">Amount per serving</p>
        <div className="flex justify-between items-baseline py-2 border-b-4 border-gray-900 dark:border-white">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">Calories</span>
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{nutrition.calories || 0}</span>
        </div>

        <div className="text-right text-sm font-medium py-1 border-b border-gray-300 dark:border-gray-600">
          % Daily Value*
        </div>

        {/* Main Nutrients */}
        {mainNutrients.slice(1).map((nutrient) => {
          const value = nutrition[nutrient.key as keyof NutritionData] as number | undefined;
          const dv = dailyValues[nutrient.key as keyof typeof dailyValues];
          const percent = dv ? getPercentDV(value, dv) : null;

          return (
            <div
              key={nutrient.key}
              className={cn(
                'flex justify-between py-1 border-b border-gray-300 dark:border-gray-600',
                nutrient.indent && 'pl-4'
              )}
            >
              <span className={cn(
                'text-gray-900 dark:text-white',
                !nutrient.indent && 'font-semibold'
              )}>
                {nutrient.label} {value !== undefined && (
                  <span className="font-normal">{value}{nutrient.unit}</span>
                )}
              </span>
              {percent !== null && (
                <span className="font-semibold text-gray-900 dark:text-white">{percent}%</span>
              )}
            </div>
          );
        })}

        {/* Vitamins & Minerals */}
        <div className="border-t-4 border-gray-900 dark:border-white pt-2 mt-2">
          <div className="grid grid-cols-2 gap-2">
            {vitamins.map((vitamin) => {
              const value = nutrition[vitamin.key as keyof NutritionData] as number | undefined;
              const dv = dailyValues[vitamin.key as keyof typeof dailyValues];
              const percent = dv ? getPercentDV(value, dv) : 0;

              return (
                <div key={vitamin.key} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{vitamin.label}</span>
                  <span className="text-gray-900 dark:text-white">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
        </p>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate meal planner component
 */
export function generateMealPlanner(options: RecipeOptions = {}): string {
  const { componentName = 'MealPlanner', endpoint = '/recipes/meal-plan' } = options;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Utensils, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PlannedMeal {
  id: string;
  recipe_id: string;
  recipe_name: string;
  recipe_image?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

interface ${componentName}Props {
  className?: string;
  onAddRecipe?: (date: string, mealType: string) => void;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const ${componentName}: React.FC<${componentName}Props> = ({ className, onAddRecipe }) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['meal-plan', weekDays[0].toISOString(), weekDays[6].toISOString()],
    queryFn: async () => {
      try {
        const start = weekDays[0].toISOString().split('T')[0];
        const end = weekDays[6].toISOString().split('T')[0];
        const response = await api.get<any>(\`${endpoint}?start=\${start}&end=\${end}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch meal plan:', err);
        return [];
      }
    },
  });

  const removeMeal = useMutation({
    mutationFn: (id: string) => api.delete(\`${endpoint}/\${id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast.success('Meal removed');
    },
  });

  const generateShoppingList = useMutation({
    mutationFn: () => api.post(\`${endpoint}/shopping-list\`, {
      start: weekDays[0].toISOString().split('T')[0],
      end: weekDays[6].toISOString().split('T')[0],
    }),
    onSuccess: () => {
      toast.success('Shopping list generated!');
    },
  });

  const getMealsForSlot = (date: Date, mealType: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return meals.filter((m: PlannedMeal) => m.date === dateStr && m.meal_type === mealType);
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const getMealTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      breakfast: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      lunch: 'bg-green-100 border-green-300 text-green-800',
      dinner: 'bg-purple-100 border-purple-300 text-purple-800',
      snack: 'bg-blue-100 border-blue-300 text-blue-800',
    };
    return colors[type] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meal Planner</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - 7);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              This Week
            </button>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + 7);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => generateShoppingList.mutate()}
          disabled={generateShoppingList.isPending || meals.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          <ShoppingCart className="w-4 h-4" />
          Generate Shopping List
        </button>
      </div>

      <div className="text-sm text-gray-500">
        {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>

      {/* Planner Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 w-24">Meal</th>
              {weekDays.map((day, idx) => (
                <th key={idx} className={cn(
                  'py-3 px-2 text-center text-sm font-medium',
                  isToday(day) ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'text-gray-500'
                )}>
                  <div>{WEEKDAYS[day.getDay()].slice(0, 3)}</div>
                  <div className={cn(
                    'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm mt-1',
                    isToday(day) && 'bg-orange-600 text-white'
                  )}>
                    {day.getDate()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_TYPES.map((mealType) => (
              <tr key={mealType} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <td className="py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {mealType}
                </td>
                {weekDays.map((day, idx) => {
                  const slotMeals = getMealsForSlot(day, mealType);
                  const dateStr = day.toISOString().split('T')[0];

                  return (
                    <td key={idx} className={cn(
                      'py-2 px-2 align-top min-h-[80px]',
                      isToday(day) && 'bg-orange-50/50 dark:bg-orange-900/10'
                    )}>
                      {slotMeals.map((meal: PlannedMeal) => (
                        <div
                          key={meal.id}
                          className={cn(
                            'p-2 mb-1 rounded-lg border text-xs relative group',
                            getMealTypeColor(mealType)
                          )}
                        >
                          {meal.recipe_image && (
                            <img src={meal.recipe_image} alt="" className="w-full h-12 object-cover rounded mb-1" />
                          )}
                          <div className="font-medium truncate">{meal.recipe_name}</div>
                          <button
                            onClick={() => removeMeal.mutate(meal.id)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {onAddRecipe && (
                        <button
                          onClick={() => onAddRecipe(dateStr, mealType)}
                          className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors"
                        >
                          <Plus className="w-4 h-4 mx-auto" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MEAL_TYPES.map((type) => {
          const count = meals.filter((m: PlannedMeal) => m.meal_type === type).length;
          return (
            <div key={type} className={cn('p-3 rounded-lg border', getMealTypeColor(type))}>
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                <span className="font-medium capitalize">{type}</span>
              </div>
              <p className="text-lg font-bold mt-1">{count} planned</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
