import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Sun, Moon, Plus, Trash2, AlertTriangle, CheckCircle, Info, Clock, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type SkinType = 'normal' | 'oily' | 'dry' | 'combination' | 'sensitive';
type RoutineTime = 'am' | 'pm';
type ProductCategory = 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'exfoliant' | 'retinoid' | 'eyecream' | 'faceoil' | 'mask';

interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  ingredients: string[];
}

interface RoutineStep {
  id: string;
  product: Product;
  order: number;
}

interface TrackerEntry {
  date: string;
  amCompleted: boolean;
  pmCompleted: boolean;
  notes: string;
}

interface IngredientConflict {
  ingredient1: string;
  ingredient2: string;
  reason: string;
  severity: 'warning' | 'avoid';
}

const SKIN_TYPES: Record<SkinType, { name: string; description: string; tips: string[] }> = {
  normal: {
    name: 'Normal',
    description: 'Balanced skin with few imperfections',
    tips: ['Maintain balance with gentle products', 'Focus on prevention and hydration', 'Use SPF daily'],
  },
  oily: {
    name: 'Oily',
    description: 'Excess sebum, enlarged pores, prone to acne',
    tips: ['Use oil-free, non-comedogenic products', 'Consider niacinamide and salicylic acid', 'Dont skip moisturizer'],
  },
  dry: {
    name: 'Dry',
    description: 'Tight feeling, flaky patches, fine lines',
    tips: ['Use cream-based cleansers', 'Layer hydrating products', 'Include hyaluronic acid and ceramides'],
  },
  combination: {
    name: 'Combination',
    description: 'Oily T-zone with dry cheeks',
    tips: ['Use different products for different zones', 'Balance oil control with hydration', 'Gel-cream moisturizers work well'],
  },
  sensitive: {
    name: 'Sensitive',
    description: 'Easily irritated, redness, reactions',
    tips: ['Patch test new products', 'Avoid fragrance and harsh ingredients', 'Focus on barrier repair'],
  },
};

const PRODUCT_ORDER: Record<RoutineTime, ProductCategory[]> = {
  am: ['cleanser', 'toner', 'serum', 'eyecream', 'moisturizer', 'sunscreen'],
  pm: ['cleanser', 'exfoliant', 'toner', 'serum', 'retinoid', 'eyecream', 'moisturizer', 'faceoil', 'mask'],
};

const CATEGORY_LABELS: Record<ProductCategory, { name: string; description: string }> = {
  cleanser: { name: 'Cleanser', description: 'Removes dirt, oil, and makeup' },
  toner: { name: 'Toner', description: 'Balances pH and preps skin' },
  serum: { name: 'Serum', description: 'Concentrated active ingredients' },
  moisturizer: { name: 'Moisturizer', description: 'Hydrates and seals in products' },
  sunscreen: { name: 'Sunscreen', description: 'Protects from UV damage (AM only)' },
  exfoliant: { name: 'Exfoliant', description: 'Removes dead skin cells (2-3x/week)' },
  retinoid: { name: 'Retinoid', description: 'Anti-aging and cell turnover (PM only)' },
  eyecream: { name: 'Eye Cream', description: 'Targets delicate eye area' },
  faceoil: { name: 'Face Oil', description: 'Seals in moisture (PM only)' },
  mask: { name: 'Mask', description: 'Intensive treatment (1-2x/week)' },
};

const INGREDIENT_CONFLICTS: IngredientConflict[] = [
  { ingredient1: 'retinol', ingredient2: 'vitamin c', reason: 'Can cause irritation; use at different times', severity: 'warning' },
  { ingredient1: 'retinol', ingredient2: 'aha', reason: 'Both exfoliating; may over-sensitize skin', severity: 'warning' },
  { ingredient1: 'retinol', ingredient2: 'bha', reason: 'Both exfoliating; may cause dryness', severity: 'warning' },
  { ingredient1: 'retinol', ingredient2: 'benzoyl peroxide', reason: 'Benzoyl peroxide deactivates retinol', severity: 'avoid' },
  { ingredient1: 'aha', ingredient2: 'vitamin c', reason: 'Both acidic; may irritate skin', severity: 'warning' },
  { ingredient1: 'aha', ingredient2: 'bha', reason: 'Double acid exfoliation can damage barrier', severity: 'warning' },
  { ingredient1: 'niacinamide', ingredient2: 'vitamin c', reason: 'May reduce efficacy; wait 15 min between', severity: 'warning' },
  { ingredient1: 'benzoyl peroxide', ingredient2: 'vitamin c', reason: 'Benzoyl peroxide oxidizes vitamin C', severity: 'avoid' },
];

const COMMON_INGREDIENTS = [
  'retinol', 'vitamin c', 'niacinamide', 'hyaluronic acid', 'salicylic acid',
  'aha', 'bha', 'benzoyl peroxide', 'ceramides', 'peptides', 'squalane',
  'glycerin', 'aloe vera', 'tea tree', 'zinc oxide', 'titanium dioxide',
];

// Combined data structure for backend sync
interface SkinCareData {
  id: string;
  skinType: SkinType;
  amRoutine: RoutineStep[];
  pmRoutine: RoutineStep[];
  trackerEntries: TrackerEntry[];
  updatedAt: string;
}

// Column configuration for routine export
const ROUTINE_COLUMNS: ColumnConfig[] = [
  { key: 'routineType', header: 'Routine', type: 'string' },
  { key: 'order', header: 'Step', type: 'number' },
  { key: 'productName', header: 'Product Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'ingredients', header: 'Key Ingredients', type: 'string' },
];

// Column configuration for tracker export
const TRACKER_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'amCompleted', header: 'AM Completed', type: 'boolean' },
  { key: 'pmCompleted', header: 'PM Completed', type: 'boolean' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Columns for combined sync data (used internally)
const SYNC_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'skinType', header: 'Skin Type', type: 'string' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

interface SkinCareRoutineToolProps {
  uiConfig?: UIConfig;
}

// Default data structure
const DEFAULT_SKINCARE_DATA: SkinCareData = {
  id: 'skincare-data',
  skinType: 'normal',
  amRoutine: [],
  pmRoutine: [],
  trackerEntries: [],
  updatedAt: new Date().toISOString(),
};

export const SkinCareRoutineTool: React.FC<SkinCareRoutineToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: syncData,
    setData: setSyncData,
    updateItem,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<SkinCareData>('skincare-routine', [DEFAULT_SKINCARE_DATA], SYNC_COLUMNS);

  // Get the current data (always first item in array)
  const currentData = syncData[0] || DEFAULT_SKINCARE_DATA;

  // Derived states from synced data
  const skinType = currentData.skinType;
  const amRoutine = currentData.amRoutine;
  const pmRoutine = currentData.pmRoutine;
  const trackerEntries = currentData.trackerEntries;

  // Helper to update the synced data
  const updateSyncedData = (updates: Partial<SkinCareData>) => {
    const newData: SkinCareData = {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setSyncData([newData]);
  };

  // Setters that update synced data
  const setSkinType = (newSkinType: SkinType) => {
    updateSyncedData({ skinType: newSkinType });
  };

  const setAmRoutine = (newRoutine: RoutineStep[] | ((prev: RoutineStep[]) => RoutineStep[])) => {
    const routine = typeof newRoutine === 'function' ? newRoutine(amRoutine) : newRoutine;
    updateSyncedData({ amRoutine: routine });
  };

  const setPmRoutine = (newRoutine: RoutineStep[] | ((prev: RoutineStep[]) => RoutineStep[])) => {
    const routine = typeof newRoutine === 'function' ? newRoutine(pmRoutine) : newRoutine;
    updateSyncedData({ pmRoutine: routine });
  };

  const setTrackerEntries = (newEntries: TrackerEntry[] | ((prev: TrackerEntry[]) => TrackerEntry[])) => {
    const entries = typeof newEntries === 'function' ? newEntries(trackerEntries) : newEntries;
    updateSyncedData({ trackerEntries: entries });
  };

  const [activeTab, setActiveTab] = useState<'routine' | 'order' | 'compatibility' | 'tracker'>('routine');
  const [routineTime, setRoutineTime] = useState<RoutineTime>('am');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.tab && ['routine', 'order', 'compatibility', 'tracker'].includes(params.tab)) {
        setActiveTab(params.tab as typeof activeTab);
        hasChanges = true;
      }
      if (params.skinType && ['normal', 'oily', 'dry', 'combination', 'sensitive'].includes(params.skinType)) {
        setSkinType(params.skinType as SkinType);
        hasChanges = true;
      }
      if (params.routineTime && ['am', 'pm'].includes(params.routineTime)) {
        setRoutineTime(params.routineTime as RoutineTime);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('cleanser');
  const [newProductIngredients, setNewProductIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const currentRoutine = routineTime === 'am' ? amRoutine : pmRoutine;
  const setCurrentRoutine = routineTime === 'am' ? setAmRoutine : setPmRoutine;

  // Prepare export data combining routines
  const exportData = useMemo(() => {
    const routineData = [
      ...amRoutine.map((step, idx) => ({
        routineType: 'AM',
        order: idx + 1,
        productName: step.product.name,
        category: CATEGORY_LABELS[step.product.category].name,
        ingredients: step.product.ingredients.join(', '),
      })),
      ...pmRoutine.map((step, idx) => ({
        routineType: 'PM',
        order: idx + 1,
        productName: step.product.name,
        category: CATEGORY_LABELS[step.product.category].name,
        ingredients: step.product.ingredients.join(', '),
      })),
    ];
    return routineData;
  }, [amRoutine, pmRoutine]);

  // Export handlers using hook functions (for consistent sync)
  const handleExportCSV = () => {
    hookExportCSV({ filename: activeTab === 'tracker' ? 'skincare-tracker' : 'skincare-routine' });
  };

  const handleExportExcel = () => {
    hookExportExcel({ filename: activeTab === 'tracker' ? 'skincare-tracker' : 'skincare-routine' });
  };

  const handleExportJSON = () => {
    hookExportJSON({ filename: activeTab === 'tracker' ? 'skincare-tracker' : 'skincare-routine' });
  };

  const handleExportPDF = async () => {
    await hookExportPDF({
      filename: activeTab === 'tracker' ? 'skincare-tracker' : 'skincare-routine',
      title: activeTab === 'tracker' ? 'Skincare Routine Tracker' : 'My Skincare Routine',
      subtitle: `Skin Type: ${SKIN_TYPES[skinType].name}`,
    });
  };

  const handlePrint = () => {
    hookPrint(activeTab === 'tracker' ? 'Skincare Routine Tracker' : 'My Skincare Routine');
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    return hookCopyToClipboard('tab');
  };

  const addProduct = () => {
    if (!newProductName.trim()) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: newProductName,
      category: newProductCategory,
      ingredients: newProductIngredients,
    };

    const recommendedOrder = PRODUCT_ORDER[routineTime].indexOf(newProductCategory);
    const newStep: RoutineStep = {
      id: Date.now().toString(),
      product: newProduct,
      order: recommendedOrder >= 0 ? recommendedOrder : currentRoutine.length,
    };

    const newRoutine = [...currentRoutine, newStep].sort((a, b) => a.order - b.order);
    setCurrentRoutine(newRoutine);

    setNewProductName('');
    setNewProductIngredients([]);
    setShowAddProduct(false);
  };

  const removeProduct = (id: string) => {
    setCurrentRoutine(currentRoutine.filter(step => step.id !== id));
  };

  const moveProduct = (id: string, direction: 'up' | 'down') => {
    const index = currentRoutine.findIndex(step => step.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === currentRoutine.length - 1)) return;

    const newRoutine = [...currentRoutine];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newRoutine[index], newRoutine[swapIndex]] = [newRoutine[swapIndex], newRoutine[index]];
    newRoutine.forEach((step, i) => step.order = i);
    setCurrentRoutine(newRoutine);
  };

  const toggleIngredient = (ingredient: string) => {
    if (newProductIngredients.includes(ingredient)) {
      setNewProductIngredients(newProductIngredients.filter(i => i !== ingredient));
    } else {
      setNewProductIngredients([...newProductIngredients, ingredient]);
    }
  };

  const toggleSelectedIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const ingredientConflicts = useMemo(() => {
    const conflicts: IngredientConflict[] = [];
    const allIngredients = [...amRoutine, ...pmRoutine].flatMap(step => step.product.ingredients);
    const uniqueIngredients = [...new Set(allIngredients)];

    for (const conflict of INGREDIENT_CONFLICTS) {
      if (uniqueIngredients.includes(conflict.ingredient1) && uniqueIngredients.includes(conflict.ingredient2)) {
        conflicts.push(conflict);
      }
    }

    return conflicts;
  }, [amRoutine, pmRoutine]);

  const selectedConflicts = useMemo(() => {
    const conflicts: IngredientConflict[] = [];
    for (const conflict of INGREDIENT_CONFLICTS) {
      if (selectedIngredients.includes(conflict.ingredient1) && selectedIngredients.includes(conflict.ingredient2)) {
        conflicts.push(conflict);
      }
    }
    return conflicts;
  }, [selectedIngredients]);

  const todayEntry = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return trackerEntries.find(e => e.date === today);
  }, [trackerEntries]);

  const toggleRoutineCompletion = (time: 'am' | 'pm') => {
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = trackerEntries.find(e => e.date === today);

    if (existingEntry) {
      setTrackerEntries(trackerEntries.map(e =>
        e.date === today
          ? { ...e, [time === 'am' ? 'amCompleted' : 'pmCompleted']: !e[time === 'am' ? 'amCompleted' : 'pmCompleted'] }
          : e
      ));
    } else {
      setTrackerEntries([...trackerEntries, {
        date: today,
        amCompleted: time === 'am',
        pmCompleted: time === 'pm',
        notes: '',
      }]);
    }
  };

  const getStreakCount = () => {
    let streak = 0;
    const sortedEntries = [...trackerEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const entry of sortedEntries) {
      if (entry.amCompleted && entry.pmCompleted) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg"><Sparkles className="w-5 h-5 text-pink-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skinCareRoutine.skincareRoutineBuilder', 'Skincare Routine Builder')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.skinCareRoutine.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skinCareRoutine.buildAndTrackYourPersonalized', 'Build and track your personalized skincare routine')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="skin-care-routine" toolName="Skin Care Routine" />

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
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              disabled={exportData.length === 0 && trackerEntries.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Skin Type Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.skinCareRoutine.yourSkinType', 'Your Skin Type')}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(SKIN_TYPES) as SkinType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSkinType(type)}
                className={`py-2 px-3 rounded-lg text-sm ${skinType === type ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {SKIN_TYPES[type].name}
              </button>
            ))}
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{SKIN_TYPES[skinType].description}</p>
            <ul className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
              {SKIN_TYPES[skinType].tips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['routine', 'order', 'compatibility', 'tracker'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-lg text-sm capitalize ${activeTab === tab ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {tab === 'compatibility' ? 'Ingredients' : tab}
            </button>
          ))}
        </div>

        {/* Routine Builder Tab */}
        {activeTab === 'routine' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setRoutineTime('am')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${routineTime === 'am' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <Sun className="w-4 h-4" /> AM Routine
              </button>
              <button
                onClick={() => setRoutineTime('pm')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${routineTime === 'pm' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <Moon className="w-4 h-4" /> PM Routine
              </button>
            </div>

            {/* Current Routine */}
            <div className="space-y-2">
              {currentRoutine.length === 0 ? (
                <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    No products added yet. Build your {routineTime.toUpperCase()} routine!
                  </p>
                </div>
              ) : (
                currentRoutine.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${routineTime === 'am' ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.product.name}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {CATEGORY_LABELS[step.product.category].name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveProduct(step.id, 'up')}
                        disabled={index === 0}
                        className={`p-2 rounded ${index === 0 ? 'opacity-30' : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      >
                        <ArrowUp className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => moveProduct(step.id, 'down')}
                        disabled={index === currentRoutine.length - 1}
                        className={`p-2 rounded ${index === currentRoutine.length - 1 ? 'opacity-30' : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      >
                        <ArrowDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={() => removeProduct(step.id)}
                        className={`p-2 rounded ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Product Form */}
            {showAddProduct ? (
              <div className={`p-4 rounded-lg space-y-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.skinCareRoutine.productName', 'Product Name')}
                  </label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder={t('tools.skinCareRoutine.eGCeraveHydratingCleanser', 'e.g., CeraVe Hydrating Cleanser')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.skinCareRoutine.category', 'Category')}
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as ProductCategory)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_LABELS[cat].name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.skinCareRoutine.keyIngredientsOptional', 'Key Ingredients (optional)')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_INGREDIENTS.map((ing) => (
                      <button
                        key={ing}
                        onClick={() => toggleIngredient(ing)}
                        className={`px-3 py-1 rounded-full text-xs ${newProductIngredients.includes(ing) ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {ing}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addProduct}
                    disabled={!newProductName.trim()}
                    className="flex-1 py-2 bg-pink-500 text-white rounded-lg disabled:opacity-50"
                  >
                    {t('tools.skinCareRoutine.addProduct', 'Add Product')}
                  </button>
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className={`flex-1 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.skinCareRoutine.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddProduct(true)}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}

            {/* Conflicts Warning */}
            {ingredientConflicts.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>{t('tools.skinCareRoutine.ingredientConflictsDetected', 'Ingredient Conflicts Detected')}</p>
                    <ul className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                      {ingredientConflicts.map((conflict, i) => (
                        <li key={i}>
                          <span className="capitalize">{conflict.ingredient1}</span> + <span className="capitalize">{conflict.ingredient2}</span>: {conflict.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Order Guide Tab */}
        {activeTab === 'order' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.skinCareRoutine.applyProductsFromThinnestTo', 'Apply products from thinnest to thickest consistency. Water-based before oil-based. Actives on clean skin.')}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* AM Order */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skinCareRoutine.amRoutineOrder', 'AM Routine Order')}</h4>
                </div>
                <ol className="space-y-2">
                  {PRODUCT_ORDER.am.map((cat, i) => (
                    <li key={cat} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{CATEGORY_LABELS[cat].name}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{CATEGORY_LABELS[cat].description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* PM Order */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skinCareRoutine.pmRoutineOrder', 'PM Routine Order')}</h4>
                </div>
                <ol className="space-y-2">
                  {PRODUCT_ORDER.pm.map((cat, i) => (
                    <li key={cat} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{CATEGORY_LABELS[cat].name}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{CATEGORY_LABELS[cat].description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Ingredient Compatibility Tab */}
        {activeTab === 'compatibility' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.skinCareRoutine.selectIngredientsToCheckCompatibility', 'Select ingredients to check compatibility')}
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_INGREDIENTS.map((ing) => (
                  <button
                    key={ing}
                    onClick={() => toggleSelectedIngredient(ing)}
                    className={`px-3 py-1 rounded-full text-sm ${selectedIngredients.includes(ing) ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {ing}
                  </button>
                ))}
              </div>
            </div>

            {selectedIngredients.length >= 2 && (
              <div className={`p-4 rounded-lg ${selectedConflicts.length > 0 ? (isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200') : (isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200')} border`}>
                {selectedConflicts.length > 0 ? (
                  <div className="space-y-3">
                    {selectedConflicts.map((conflict, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {conflict.severity === 'avoid' ? (
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        )}
                        <div>
                          <p className={`font-medium ${conflict.severity === 'avoid' ? 'text-red-500' : (isDark ? 'text-yellow-400' : 'text-yellow-700')}`}>
                            <span className="capitalize">{conflict.ingredient1}</span> + <span className="capitalize">{conflict.ingredient2}</span>
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{conflict.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className={isDark ? 'text-green-400' : 'text-green-700'}>
                      {t('tools.skinCareRoutine.theseIngredientsAreCompatibleAnd', 'These ingredients are compatible and can be used together!')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedIngredients.length < 2 && (
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {t('tools.skinCareRoutine.selectAtLeast2Ingredients', 'Select at least 2 ingredients to check compatibility')}
                </p>
              </div>
            )}

            {/* Known Conflicts Reference */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skinCareRoutine.commonIngredientConflicts', 'Common Ingredient Conflicts')}</h4>
              <div className="space-y-2">
                {INGREDIENT_CONFLICTS.map((conflict, i) => (
                  <div key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className={`px-2 py-0.5 rounded text-xs ${conflict.severity === 'avoid' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {conflict.severity}
                    </span>
                    <span className="capitalize">{conflict.ingredient1}</span> + <span className="capitalize">{conflict.ingredient2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tracker Tab */}
        {activeTab === 'tracker' && (
          <div className="space-y-4">
            {/* Today's Status */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => toggleRoutineCompletion('am')}
                className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${todayEntry?.amCompleted ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <Sun className="w-6 h-6" />
                <span className="font-medium">{t('tools.skinCareRoutine.amRoutine', 'AM Routine')}</span>
                {todayEntry?.amCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm opacity-70">{t('tools.skinCareRoutine.tapToComplete', 'Tap to complete')}</span>
                )}
              </button>
              <button
                onClick={() => toggleRoutineCompletion('pm')}
                className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${todayEntry?.pmCompleted ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <Moon className="w-6 h-6" />
                <span className="font-medium">{t('tools.skinCareRoutine.pmRoutine', 'PM Routine')}</span>
                {todayEntry?.pmCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm opacity-70">{t('tools.skinCareRoutine.tapToComplete2', 'Tap to complete')}</span>
                )}
              </button>
            </div>

            {/* Streak */}
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-pink-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skinCareRoutine.currentStreak', 'Current Streak')}</span>
              </div>
              <div className="text-4xl font-bold text-pink-500 mt-2">{getStreakCount()} days</div>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.skinCareRoutine.completeBothAmAndPm', 'Complete both AM and PM routines to keep your streak!')}
              </p>
            </div>

            {/* Recent History */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skinCareRoutine.recentHistory', 'Recent History')}</h4>
              {trackerEntries.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.skinCareRoutine.noTrackingDataYetStart', 'No tracking data yet. Start by marking your routines complete!')}
                </p>
              ) : (
                <div className="space-y-2">
                  {[...trackerEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7).map((entry) => (
                    <div key={entry.date} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${entry.amCompleted ? 'bg-amber-500/20 text-amber-500' : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`}>
                          AM {entry.amCompleted ? '✓' : '✗'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${entry.pmCompleted ? 'bg-indigo-500/20 text-indigo-500' : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`}>
                          PM {entry.pmCompleted ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.skinCareRoutine.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Wait 30-60 seconds between product layers</li>
                <li>• Introduce new actives slowly (2-3x/week)</li>
                <li>• Apply sunscreen as the last step every morning</li>
                <li>• Consistency is key - track your routine daily</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinCareRoutineTool;
