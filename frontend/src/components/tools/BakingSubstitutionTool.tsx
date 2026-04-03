import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChefHat, ArrowRightLeft, Search, Star, Heart, Lightbulb, Info, X, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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

// Types
interface Substitution {
  id: string;
  name: string;
  ratio: string;
  notes: string;
  dietaryTags: DietaryTag[];
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  substitutions: Substitution[];
}

type DietaryTag = 'vegan' | 'dairy-free' | 'gluten-free' | 'nut-free' | 'low-sugar';

interface FavoriteSubstitution {
  id: string;
  ingredientId: string;
  substitutionId: string;
}

// Substitutions database
const substitutionsDatabase: Ingredient[] = [
  {
    id: 'eggs',
    name: 'Eggs',
    category: 'Binding & Leavening',
    unit: 'egg(s)',
    substitutions: [
      {
        id: 'flax-egg',
        name: 'Flax Egg',
        ratio: '1 tbsp ground flaxseed + 3 tbsp water per egg',
        notes: 'Let sit 5 minutes to gel. Best for cookies, muffins, and quick breads. Adds slight nutty flavor.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free']
      },
      {
        id: 'applesauce-egg',
        name: 'Applesauce',
        ratio: '1/4 cup per egg',
        notes: 'Best for moist cakes and muffins. Adds subtle sweetness. Reduce sugar slightly in recipe.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'mashed-banana',
        name: 'Mashed Banana',
        ratio: '1/4 cup (half a banana) per egg',
        notes: 'Adds banana flavor and moisture. Best for quick breads, pancakes, and brownies.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'chia-egg',
        name: 'Chia Egg',
        ratio: '1 tbsp chia seeds + 3 tbsp water per egg',
        notes: 'Let sit 5-10 minutes. Similar to flax egg but slightly more binding power.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'silken-tofu',
        name: 'Silken Tofu',
        ratio: '1/4 cup blended silken tofu per egg',
        notes: 'Blend until smooth. Best for dense, moist baked goods like brownies.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'aquafaba',
        name: 'Aquafaba',
        ratio: '3 tbsp per egg (whipped for meringues)',
        notes: 'Chickpea water. Can be whipped like egg whites. Perfect for meringues and macarons.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      }
    ]
  },
  {
    id: 'butter',
    name: 'Butter',
    category: 'Fats',
    unit: 'cup(s)',
    substitutions: [
      {
        id: 'coconut-oil',
        name: 'Coconut Oil',
        ratio: '1:1 ratio',
        notes: 'Use refined for neutral flavor, unrefined for coconut taste. Solid at room temp.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'vegetable-oil',
        name: 'Vegetable Oil',
        ratio: '3/4 cup oil per 1 cup butter',
        notes: 'Best for moist cakes and quick breads. Not suitable for recipes needing creaming.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'applesauce-butter',
        name: 'Unsweetened Applesauce',
        ratio: '1/2 cup applesauce per 1 cup butter',
        notes: 'Reduces fat significantly. Best combined with some oil for texture. Adds moisture.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free', 'low-sugar']
      },
      {
        id: 'greek-yogurt',
        name: 'Greek Yogurt',
        ratio: '1/2 cup yogurt per 1 cup butter',
        notes: 'Adds protein and tanginess. Best for cakes and muffins. Not vegan.',
        dietaryTags: ['gluten-free', 'nut-free']
      },
      {
        id: 'avocado',
        name: 'Mashed Avocado',
        ratio: '1:1 ratio',
        notes: 'Adds healthy fats and moisture. May add slight green tint. Best for brownies and chocolate cakes.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'vegan-butter',
        name: 'Vegan Butter',
        ratio: '1:1 ratio',
        notes: 'Direct substitute. Works well for all butter applications including creaming.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free']
      }
    ]
  },
  {
    id: 'milk',
    name: 'Milk',
    category: 'Dairy',
    unit: 'cup(s)',
    substitutions: [
      {
        id: 'oat-milk',
        name: 'Oat Milk',
        ratio: '1:1 ratio',
        notes: 'Creamy texture, slightly sweet. Great for most baking. Not gluten-free unless certified.',
        dietaryTags: ['vegan', 'dairy-free', 'nut-free']
      },
      {
        id: 'almond-milk',
        name: 'Almond Milk',
        ratio: '1:1 ratio',
        notes: 'Light and slightly nutty. Use unsweetened for savory bakes. Contains nuts.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free']
      },
      {
        id: 'soy-milk',
        name: 'Soy Milk',
        ratio: '1:1 ratio',
        notes: 'High protein, creamy. Best all-purpose dairy-free option. Can curdle with acids.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'coconut-milk',
        name: 'Coconut Milk',
        ratio: '1:1 ratio (use light for similar consistency)',
        notes: 'Rich and creamy. Full-fat adds richness, light is more similar to regular milk.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'cashew-milk',
        name: 'Cashew Milk',
        ratio: '1:1 ratio',
        notes: 'Very creamy and neutral flavor. Excellent for baking. Contains nuts.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free']
      }
    ]
  },
  {
    id: 'sugar',
    name: 'White Sugar',
    category: 'Sweeteners',
    unit: 'cup(s)',
    substitutions: [
      {
        id: 'coconut-sugar',
        name: 'Coconut Sugar',
        ratio: '1:1 ratio',
        notes: 'Lower glycemic index. Has caramel-like flavor. Brown color affects appearance.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'maple-syrup',
        name: 'Maple Syrup',
        ratio: '3/4 cup per 1 cup sugar, reduce liquid by 3 tbsp',
        notes: 'Adds maple flavor. Reduce oven temp by 25F. Best for brownies, muffins.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'honey',
        name: 'Honey',
        ratio: '3/4 cup per 1 cup sugar, reduce liquid by 3 tbsp',
        notes: 'Adds moisture and distinct flavor. Reduce oven temp by 25F. Not vegan.',
        dietaryTags: ['dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'stevia',
        name: 'Stevia',
        ratio: '1 tsp liquid stevia per 1 cup sugar',
        notes: 'Zero calories but lacks bulk. Combine with another bulking agent for texture.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free', 'low-sugar']
      },
      {
        id: 'monk-fruit',
        name: 'Monk Fruit Sweetener',
        ratio: '1:1 ratio (granulated blend)',
        notes: 'Zero calories, no aftertaste. Works well in most baking applications.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free', 'low-sugar']
      },
      {
        id: 'date-paste',
        name: 'Date Paste',
        ratio: '1:1 ratio',
        notes: 'Blend dates with water. Adds fiber and nutrients. Changes color of baked goods.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      }
    ]
  },
  {
    id: 'flour',
    name: 'All-Purpose Flour',
    category: 'Flours',
    unit: 'cup(s)',
    substitutions: [
      {
        id: 'almond-flour',
        name: 'Almond Flour',
        ratio: '1:1 ratio (may need binding agent)',
        notes: 'Adds moisture and density. Best for cookies, cakes. Add 1/4 tsp xanthan gum per cup.',
        dietaryTags: ['gluten-free', 'dairy-free', 'vegan']
      },
      {
        id: 'oat-flour',
        name: 'Oat Flour',
        ratio: '1 1/4 cups per 1 cup AP flour',
        notes: 'Make by blending oats. Slightly denser texture. Check oats are certified GF.',
        dietaryTags: ['vegan', 'dairy-free', 'nut-free']
      },
      {
        id: 'coconut-flour',
        name: 'Coconut Flour',
        ratio: '1/4 to 1/3 cup per 1 cup AP flour',
        notes: 'Very absorbent! Increase eggs/liquid significantly. Adds coconut flavor.',
        dietaryTags: ['gluten-free', 'vegan', 'dairy-free', 'nut-free']
      },
      {
        id: 'gf-flour-blend',
        name: 'Gluten-Free Flour Blend',
        ratio: '1:1 ratio',
        notes: 'Pre-made blends work best. Look for ones with xanthan gum included.',
        dietaryTags: ['gluten-free', 'vegan', 'dairy-free', 'nut-free']
      },
      {
        id: 'whole-wheat',
        name: 'Whole Wheat Flour',
        ratio: '3/4 cup per 1 cup AP flour (or 1:1 with more liquid)',
        notes: 'Denser, nuttier flavor. Can substitute half for lighter texture.',
        dietaryTags: ['vegan', 'dairy-free', 'nut-free']
      },
      {
        id: 'cassava-flour',
        name: 'Cassava Flour',
        ratio: '1:1 ratio (use slightly less)',
        notes: 'Most similar to AP flour in texture. Grain-free and paleo-friendly.',
        dietaryTags: ['gluten-free', 'vegan', 'dairy-free', 'nut-free']
      }
    ]
  },
  {
    id: 'baking-powder',
    name: 'Baking Powder',
    category: 'Leavening',
    unit: 'tsp',
    substitutions: [
      {
        id: 'baking-soda-cream-tartar',
        name: 'Baking Soda + Cream of Tartar',
        ratio: '1/4 tsp baking soda + 1/2 tsp cream of tartar per 1 tsp baking powder',
        notes: 'Mix fresh for each use. Acts immediately so bake right away.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'baking-soda-lemon',
        name: 'Baking Soda + Lemon Juice',
        ratio: '1/4 tsp baking soda + 1/2 tsp lemon juice per 1 tsp baking powder',
        notes: 'May add slight lemon flavor. Use immediately after mixing.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'baking-soda-vinegar',
        name: 'Baking Soda + Vinegar',
        ratio: '1/4 tsp baking soda + 1/2 tsp white vinegar per 1 tsp baking powder',
        notes: 'Use immediately. Vinegar flavor dissipates during baking.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'self-rising-flour',
        name: 'Self-Rising Flour (replace flour)',
        ratio: 'Replace AP flour with self-rising, omit baking powder',
        notes: 'Self-rising flour contains baking powder. Adjust salt accordingly.',
        dietaryTags: ['vegan', 'dairy-free', 'nut-free']
      }
    ]
  },
  {
    id: 'baking-soda',
    name: 'Baking Soda',
    category: 'Leavening',
    unit: 'tsp',
    substitutions: [
      {
        id: 'baking-powder-sub',
        name: 'Baking Powder',
        ratio: '3 tsp baking powder per 1 tsp baking soda',
        notes: 'Triple the amount needed. Recipe must have acidic ingredient for full effect.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      },
      {
        id: 'potassium-bicarbonate',
        name: 'Potassium Bicarbonate',
        ratio: '1:1 ratio',
        notes: 'Sodium-free alternative. May need to add salt to recipe.',
        dietaryTags: ['vegan', 'dairy-free', 'gluten-free', 'nut-free']
      }
    ]
  }
];

const dietaryFilters: { id: DietaryTag; label: string; color: string }[] = [
  { id: 'vegan', label: 'Vegan', color: 'bg-green-500' },
  { id: 'dairy-free', label: 'Dairy-Free', color: 'bg-blue-500' },
  { id: 'gluten-free', label: 'Gluten-Free', color: 'bg-amber-500' },
  { id: 'nut-free', label: 'Nut-Free', color: 'bg-purple-500' },
  { id: 'low-sugar', label: 'Low Sugar', color: 'bg-pink-500' }
];

const bakingTips = [
  'Always measure substitutions accurately - baking is a science!',
  'Test substitutions in small batches first before making large quantities.',
  'Combining two half-substitutes often works better than one full substitute.',
  'Room temperature ingredients blend better and create better texture.',
  'When using liquid sweeteners, reduce other liquids and lower oven temp by 25F.',
  'Add 1/4 tsp xanthan gum per cup of gluten-free flour for better structure.',
  'Let flax and chia eggs gel for at least 5 minutes before using.',
  'Coconut flour is very absorbent - use 1/4 the amount and add extra eggs/liquid.'
];

interface BakingSubstitutionToolProps {
  uiConfig?: UIConfig;
}

// Column configuration for exports
const SUBSTITUTION_COLUMNS: ColumnConfig[] = [
  { key: 'ingredient', header: 'Ingredient' },
  { key: 'substituteName', header: 'Substitute Name' },
  { key: 'ratio', header: 'Substitution Ratio' },
  { key: 'notes', header: 'Notes' },
  { key: 'dietaryTags', header: 'Dietary Tags' },
];

const FAVORITES_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID' },
  { key: 'ingredientId', header: 'Ingredient ID' },
  { key: 'substitutionId', header: 'Substitution ID' },
];

export function BakingSubstitutionTool({ uiConfig }: BakingSubstitutionToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [amount, setAmount] = useState('1');
  const [activeDietaryFilters, setActiveDietaryFilters] = useState<DietaryTag[]>([]);

  // Use useToolData hook for favorites with backend sync
  const {
    data: favorites,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    addItem: addFavorite,
    deleteItem: deleteFavorite,
  } = useToolData<FavoriteSubstitution>(
    'baking-substitution-favorites',
    [],
    FAVORITES_COLUMNS,
    { autoSave: true }
  );

  const [showTips, setShowTips] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        setIsPrefilled(true);
        if (params.searchQuery) setSearchQuery(String(params.searchQuery));
        if (params.amount) setAmount(String(params.amount));
        if (params.ingredient) {
          const found = substitutionsDatabase.find(i => i.id === params.ingredient || i.name.toLowerCase() === String(params.ingredient).toLowerCase());
          if (found) setSelectedIngredient(found);
        }
      }
    } else if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.searchQuery) setSearchQuery(String(data.searchQuery));
      if (data.amount) setAmount(String(data.amount));
      if (data.ingredient) {
        const found = substitutionsDatabase.find(i => i.id === data.ingredient || i.name.toLowerCase() === String(data.ingredient).toLowerCase());
        if (found) setSelectedIngredient(found);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Filter ingredients based on search
  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return substitutionsDatabase;
    return substitutionsDatabase.filter(
      ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             ing.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filter substitutions based on dietary preferences
  const filteredSubstitutions = useMemo(() => {
    if (!selectedIngredient) return [];
    if (activeDietaryFilters.length === 0) return selectedIngredient.substitutions;
    return selectedIngredient.substitutions.filter(sub =>
      activeDietaryFilters.every(filter => sub.dietaryTags.includes(filter))
    );
  }, [selectedIngredient, activeDietaryFilters]);

  // Toggle favorite using useToolData hook
  const toggleFavorite = (ingredientId: string, substitutionId: string) => {
    const existingFavorite = favorites.find(
      f => f.ingredientId === ingredientId && f.substitutionId === substitutionId
    );

    if (existingFavorite) {
      // Remove from favorites
      deleteFavorite(existingFavorite.id);
    } else {
      // Add to favorites
      const newFavorite: FavoriteSubstitution = {
        id: `${ingredientId}-${substitutionId}`,
        ingredientId,
        substitutionId,
      };
      addFavorite(newFavorite);
    }
  };

  const isFavorite = (ingredientId: string, substitutionId: string) => {
    return favorites.some(
      f => f.ingredientId === ingredientId && f.substitutionId === substitutionId
    );
  };

  const toggleDietaryFilter = (filter: DietaryTag) => {
    setActiveDietaryFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const scaleRatio = (ratio: string, multiplier: number): string => {
    // Simple scaling - multiply numbers in the ratio
    return ratio.replace(/(\d+(?:\/\d+)?(?:\.\d+)?)/g, (match) => {
      if (match.includes('/')) {
        const [num, denom] = match.split('/').map(Number);
        const result = (num / denom) * multiplier;
        return result % 1 === 0 ? result.toString() : result.toFixed(2);
      }
      const result = parseFloat(match) * multiplier;
      return result % 1 === 0 ? result.toString() : result.toFixed(2);
    });
  };

  const reset = () => {
    setSelectedIngredient(null);
    setSearchQuery('');
    setAmount('1');
    setActiveDietaryFilters([]);
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % bakingTips.length);
  };

  // Get favorite substitutions for quick access
  const favoriteSubstitutions = useMemo(() => {
    return favorites.map(fav => {
      const ingredient = substitutionsDatabase.find(i => i.id === fav.ingredientId);
      const substitution = ingredient?.substitutions.find(s => s.id === fav.substitutionId);
      return ingredient && substitution ? { ingredient, substitution } : null;
    }).filter(Boolean);
  }, [favorites]);

  // Prepare substitutions data for export
  const substitutionsForExport = useMemo(() => {
    if (!selectedIngredient) return [];
    const amountNum = parseFloat(amount) || 1;
    return filteredSubstitutions.map(sub => ({
      ingredient: selectedIngredient.name,
      substituteName: sub.name,
      ratio: scaleRatio(sub.ratio, amountNum),
      notes: sub.notes,
      dietaryTags: sub.dietaryTags.join(', '),
    }));
  }, [selectedIngredient, filteredSubstitutions, amount]);

  // Prepare favorites data for export
  const favoritesForExport = useMemo(() => {
    return favoriteSubstitutions
      .filter((fav): fav is NonNullable<typeof fav> => fav !== null)
      .map(fav => ({
        ingredientName: fav.ingredient.name,
        substituteName: fav.substitution.name,
        ratio: fav.substitution.ratio,
      }));
  }, [favoriteSubstitutions]);

  // Export handlers
  const handleExportCSV = () => {
    if (selectedIngredient && substitutionsForExport.length > 0) {
      exportToCSV(substitutionsForExport, SUBSTITUTION_COLUMNS, {
        filename: `baking-substitutions-${selectedIngredient.name.toLowerCase().replace(/\s+/g, '-')}`,
      });
    }
  };

  const handleExportExcel = () => {
    if (selectedIngredient && substitutionsForExport.length > 0) {
      exportToExcel(substitutionsForExport, SUBSTITUTION_COLUMNS, {
        filename: `baking-substitutions-${selectedIngredient.name.toLowerCase().replace(/\s+/g, '-')}`,
      });
    }
  };

  const handleExportJSON = () => {
    if (selectedIngredient && substitutionsForExport.length > 0) {
      exportToJSON(substitutionsForExport, {
        filename: `baking-substitutions-${selectedIngredient.name.toLowerCase().replace(/\s+/g, '-')}`,
      });
    }
  };

  const handleExportPDF = async () => {
    if (selectedIngredient && substitutionsForExport.length > 0) {
      await exportToPDF(substitutionsForExport, SUBSTITUTION_COLUMNS, {
        filename: `baking-substitutions-${selectedIngredient.name.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Baking Substitutions: ${selectedIngredient.name}`,
        subtitle: `Amount: ${amount} ${selectedIngredient.unit}`,
      });
    }
  };

  const handlePrint = () => {
    if (selectedIngredient && substitutionsForExport.length > 0) {
      printData(substitutionsForExport, SUBSTITUTION_COLUMNS, {
        title: `Baking Substitutions: ${selectedIngredient.name}`,
      });
    }
  };

  const handleCopyToClipboard = async () => {
    if (selectedIngredient && substitutionsForExport.length > 0) {
      return await copyUtil(substitutionsForExport, SUBSTITUTION_COLUMNS, 'tab');
    }
    return false;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.bakingSubstitution.bakingSubstitutionTool', 'Baking Substitution Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.bakingSubstitution.findThePerfectIngredientSubstitutes', 'Find the perfect ingredient substitutes for your baking needs')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="baking-substitution" toolName="Baking Substitution" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme === 'dark' ? 'dark' : 'light'}
                size="sm"
              />
              {selectedIngredient && substitutionsForExport.length > 0 && (
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportJSON={handleExportJSON}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                  onCopyToClipboard={handleCopyToClipboard}
                  showImport={false}
                  theme={theme}
                />
              )}
              <button
                onClick={() => setShowTips(!showTips)}
                className={`p-2 rounded-lg transition-colors ${
                  showTips
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={t('tools.bakingSubstitution.bakingTips', 'Baking Tips')}
              >
                <Lightbulb className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="mb-4 p-3 bg-[#0D9488]/10 border border-[#0D9488]/20 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {isEditFromGallery ? t('tools.bakingSubstitution.dataRestoredFromYourSaved', 'Data restored from your saved gallery') : t('tools.bakingSubstitution.fieldsHaveBeenPrefilledFrom', 'Fields have been prefilled from AI suggestions')}
              </span>
            </div>
          )}

          {/* Tips Section */}
          {showTips && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.bakingSubstitution.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.bakingSubstitution.proTip', 'Pro Tip')}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {bakingTips[currentTipIndex]}
                    </p>
                  </div>
                </div>
                <button
                  onClick={nextTip}
                  className={`text-sm font-medium text-[#0D9488] hover:underline flex-shrink-0`}
                >
                  {t('tools.bakingSubstitution.nextTip', 'Next Tip')}
                </button>
              </div>
            </div>
          )}

          {/* Dietary Filters */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.bakingSubstitution.dietaryFilters', 'Dietary Filters')}
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => toggleDietaryFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeDietaryFilters.includes(filter.id)
                      ? `${filter.color} text-white`
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              {activeDietaryFilters.length > 0 && (
                <button
                  onClick={() => setActiveDietaryFilters([])}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {t('tools.bakingSubstitution.clearAll', 'Clear All')}
                </button>
              )}
            </div>
          </div>

          {/* Search and Select */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.bakingSubstitution.searchOrSelectIngredient', 'Search or Select Ingredient')}
            </label>
            <div className="relative mb-3">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tools.bakingSubstitution.searchIngredients', 'Search ingredients...')}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Ingredient Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredIngredients.map(ingredient => (
                <button
                  key={ingredient.id}
                  onClick={() => {
                    setSelectedIngredient(ingredient);
                    setSearchQuery('');
                  }}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedIngredient?.id === ingredient.id
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium text-sm">{ingredient.name}</div>
                  <div className={`text-xs ${
                    selectedIngredient?.id === ingredient.id
                      ? 'text-white/70'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {ingredient.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          {selectedIngredient && (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.bakingSubstitution.amountToSubstitute', 'Amount to Substitute')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.25"
                  step="0.25"
                  className={`w-32 px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <span className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedIngredient.unit}
                </span>
                <ArrowRightLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.bakingSubstitution.scaledSubstitutionsBelow', 'Scaled substitutions below')}
                </span>
              </div>
            </div>
          )}

          {/* Substitutions List */}
          {selectedIngredient && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Substitutions for {selectedIngredient.name}
                </h2>
                <button
                  onClick={reset}
                  className={`text-sm font-medium px-3 py-1 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <X className="w-4 h-4 inline mr-1" />
                  {t('tools.bakingSubstitution.clear', 'Clear')}
                </button>
              </div>

              {filteredSubstitutions.length === 0 ? (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.bakingSubstitution.noSubstitutionsMatchYourDietary', 'No substitutions match your dietary filters.')}</p>
                  <p className="text-sm mt-1">{t('tools.bakingSubstitution.tryRemovingSomeFiltersTo', 'Try removing some filters to see more options.')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubstitutions.map(sub => {
                    const amountNum = parseFloat(amount) || 1;
                    const scaledRatio = scaleRatio(sub.ratio, amountNum);
                    const isFav = isFavorite(selectedIngredient.id, sub.id);

                    return (
                      <Card
                        key={sub.id}
                        className={`${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-200'
                        } border`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {sub.name}
                            </CardTitle>
                            <button
                              onClick={() => toggleFavorite(selectedIngredient.id, sub.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isFav
                                  ? 'text-red-500'
                                  : theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                              }`}
                              title={isFav ? t('tools.bakingSubstitution.removeFromFavorites', 'Remove from favorites') : t('tools.bakingSubstitution.addToFavorites', 'Add to favorites')}
                            >
                              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className={`p-3 rounded-lg mb-3 ${
                            theme === 'dark' ? 'bg-gray-600' : t('tools.bakingSubstitution.bg0d9488102', 'bg-[#0D9488]/10')
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <ArrowRightLeft className="w-4 h-4 text-[#0D9488]" />
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {t('tools.bakingSubstitution.scaledRatio', 'Scaled Ratio:')}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {scaledRatio}
                            </p>
                          </div>

                          <div className="mb-3">
                            <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.bakingSubstitution.notes', 'Notes:')}
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {sub.notes}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {sub.dietaryTags.map(tag => {
                              const filterInfo = dietaryFilters.find(f => f.id === tag);
                              return (
                                <span
                                  key={tag}
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${filterInfo?.color} text-white`}
                                >
                                  {filterInfo?.label}
                                </span>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Favorite Substitutions */}
          {!selectedIngredient && favoriteSubstitutions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber-500" />
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.bakingSubstitution.yourFavoriteSubstitutions', 'Your Favorite Substitutions')}
                </h2>
              </div>
              <div className="grid gap-3">
                {favoriteSubstitutions.map((fav, index) => (
                  fav && (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {fav.ingredient.name}
                          </span>
                          <ArrowRightLeft className={`inline w-4 h-4 mx-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`font-medium text-[#0D9488]`}>
                            {fav.substitution.name}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedIngredient(fav.ingredient);
                          }}
                          className={`text-sm px-3 py-1 rounded-lg ${
                            theme === 'dark'
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {t('tools.bakingSubstitution.view', 'View')}
                        </button>
                      </div>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {fav.substitution.ratio}
                      </p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Quick Reference */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.bakingSubstitution.quickReference', 'Quick Reference')}
            </h3>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex items-start gap-2">
                <span className="text-[#0D9488]">1 egg =</span>
                <span>1/4 cup applesauce or mashed banana</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#0D9488]">1 cup butter =</span>
                <span>3/4 cup vegetable oil</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#0D9488]">1 cup milk =</span>
                <span>1 cup any plant milk</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#0D9488]">1 cup sugar =</span>
                <span>3/4 cup maple syrup (reduce liquid)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BakingSubstitutionTool;
