import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChefHat, Plus, Trash2, Copy, Check, Users, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface RecipeScalerToolProps {
  uiConfig?: UIConfig;
}

interface Ingredient {
  id: string;
  amount: string;
  unit: string;
  name: string;
}

interface ScaledIngredient extends Ingredient {
  scaledAmount: string;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Ingredient', type: 'string' },
  { key: 'amount', header: 'Original Amount', type: 'string' },
  { key: 'unit', header: 'Unit', type: 'string' },
];

// Default ingredients for new users
const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: '1', amount: '2', unit: 'cups', name: 'flour' },
  { id: '2', amount: '1', unit: 'cup', name: 'sugar' },
  { id: '3', amount: '0.5', unit: 'cup', name: 'butter' },
  { id: '4', amount: '3', unit: '', name: 'eggs' },
  { id: '5', amount: '1', unit: 'tsp', name: 'vanilla extract' },
];

export const RecipeScalerTool: React.FC<RecipeScalerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [originalServings, setOriginalServings] = useState('4');
  const [targetServings, setTargetServings] = useState('8');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: ingredients,
    setData: setIngredients,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard: copyToClipboardHook,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Ingredient>('recipe-scaler', DEFAULT_INGREDIENTS, COLUMNS);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setOriginalServings(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [copied, setCopied] = useState(false);

  const units = ['', 'cups', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'pieces', 'slices'];

  const scaleFactor = useMemo(() => {
    const original = parseFloat(originalServings) || 1;
    const target = parseFloat(targetServings) || 1;
    return target / original;
  }, [originalServings, targetServings]);

  const scaledIngredients = useMemo(() => {
    return ingredients.map((ing) => {
      const originalAmount = parseFloat(ing.amount) || 0;
      const scaled = originalAmount * scaleFactor;

      // Format nicely
      let formatted: string;
      if (scaled === Math.floor(scaled)) {
        formatted = scaled.toString();
      } else if (scaled < 1) {
        // Convert to fractions
        const fractions: [number, string][] = [
          [0.125, '1/8'], [0.25, '1/4'], [0.333, '1/3'], [0.375, '3/8'],
          [0.5, '1/2'], [0.625, '5/8'], [0.666, '2/3'], [0.75, '3/4'], [0.875, '7/8']
        ];
        const closest = fractions.reduce((prev, curr) =>
          Math.abs(curr[0] - scaled) < Math.abs(prev[0] - scaled) ? curr : prev
        );
        formatted = Math.abs(closest[0] - scaled) < 0.05 ? closest[1] : scaled.toFixed(2);
      } else {
        const whole = Math.floor(scaled);
        const decimal = scaled - whole;
        if (decimal < 0.1) {
          formatted = whole.toString();
        } else if (Math.abs(decimal - 0.25) < 0.05) {
          formatted = `${whole} 1/4`;
        } else if (Math.abs(decimal - 0.5) < 0.05) {
          formatted = `${whole} 1/2`;
        } else if (Math.abs(decimal - 0.75) < 0.05) {
          formatted = `${whole} 3/4`;
        } else {
          formatted = scaled.toFixed(2);
        }
      }

      return { ...ing, scaledAmount: formatted };
    });
  }, [ingredients, scaleFactor]);

  const addIngredient = () => {
    const newIngredient: Ingredient = { id: Date.now().toString(), amount: '', unit: '', name: '' };
    addItem(newIngredient);
  };

  const handleUpdateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    updateItem(id, { [field]: value });
  };

  const removeIngredient = (id: string) => {
    deleteItem(id);
  };

  const handleCopy = () => {
    const text = scaledIngredients.map(i => `${i.scaledAmount} ${i.unit} ${i.name}`.trim()).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickScale = (factor: number) => {
    const original = parseFloat(originalServings) || 4;
    setTargetServings((original * factor).toString());
  };

  // Export columns with scaled amount for export
  const EXPORT_COLUMNS: ColumnConfig[] = [
    { key: 'name', header: 'Ingredient', type: 'string' },
    { key: 'amount', header: 'Original Amount', type: 'string' },
    { key: 'unit', header: 'Unit', type: 'string' },
    { key: 'scaledAmount', header: 'Scaled Amount', type: 'string' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg"><ChefHat className="w-5 h-5 text-amber-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.recipeScaler.title')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeScaler.description')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="recipe-scaler" toolName="Recipe Scaler" />

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
              onExportCSV={() => exportCSV({ filename: `scaled-recipe-${originalServings}-to-${targetServings}-servings` })}
              onExportExcel={() => exportExcel({ filename: `scaled-recipe-${originalServings}-to-${targetServings}-servings` })}
              onExportJSON={() => exportJSON({ filename: `scaled-recipe-${originalServings}-to-${targetServings}-servings` })}
              onExportPDF={() => exportPDF({
                filename: `scaled-recipe-${originalServings}-to-${targetServings}-servings`,
                title: `Scaled Recipe (${originalServings} to ${targetServings} servings)`,
              })}
              onPrint={() => print(`Scaled Recipe (${originalServings} to ${targetServings} servings)`)}
              onCopyToClipboard={() => copyToClipboardHook('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.common.contentLoadedFromConversation')}</span>
          </div>
        )}

        {/* Servings */}
        <div className="grid grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.recipeScaler.originalServings')}</label>
            <input type="number" value={originalServings} onChange={(e) => setOriginalServings(e.target.value)} className={`w-full px-4 py-3 rounded-lg border text-center text-xl ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div className="flex justify-center pb-3">
            <Users className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.recipeScaler.targetServings')}</label>
            <input type="number" value={targetServings} onChange={(e) => setTargetServings(e.target.value)} className={`w-full px-4 py-3 rounded-lg border text-center text-xl ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
        </div>

        {/* Quick Scale Buttons */}
        <div className="flex flex-wrap gap-2">
          {[0.5, 1, 1.5, 2, 3, 4].map((factor) => (
            <button key={factor} onClick={() => quickScale(factor)} className={`px-4 py-2 rounded-lg text-sm ${scaleFactor === factor ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              {factor === 1 ? t('tools.recipeScaler.original') : `×${factor}`}
            </button>
          ))}
        </div>

        {/* Scale Factor Display */}
        <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
          <span className={`text-lg font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {t('tools.recipeScaler.scaleFactor')}: {scaleFactor.toFixed(2)}×
          </span>
        </div>

        {/* Ingredients */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.recipeScaler.ingredients')}</h4>
            <button onClick={handleCopy} className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.common.copied') : t('tools.recipeScaler.copyScaled')}
            </button>
          </div>

          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-medium px-1">
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recipeScaler.original')}</div>
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recipeScaler.unit')}</div>
            <div className={`col-span-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.recipeScaler.ingredient')}</div>
            <div className={`col-span-3 text-amber-500`}>{t('tools.recipeScaler.scaled')}</div>
            <div className="col-span-1"></div>
          </div>

          {scaledIngredients.map((ing) => (
            <div key={ing.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <input type="text" value={ing.amount} onChange={(e) => handleUpdateIngredient(ing.id, 'amount', e.target.value)} placeholder={t('tools.recipeScaler.amtPlaceholder')} className={`col-span-2 px-2 py-2 rounded-lg border text-sm text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
              <select value={ing.unit} onChange={(e) => handleUpdateIngredient(ing.id, 'unit', e.target.value)} className={`col-span-2 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                {units.map((u) => <option key={u} value={u}>{u || '—'}</option>)}
              </select>
              <input type="text" value={ing.name} onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)} placeholder={t('tools.recipeScaler.ingredientNamePlaceholder')} className={`col-span-4 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
              <div className={`col-span-3 px-2 py-2 rounded-lg text-center font-medium ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                {ing.scaledAmount} {ing.unit}
              </div>
              <button onClick={() => removeIngredient(ing.id)} className={`col-span-1 p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button onClick={addIngredient} className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
            <Plus className="w-4 h-4" /> {t('tools.recipeScaler.addIngredient')}
          </button>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.recipeScaler.tips')}:</strong> {t('tools.recipeScaler.tipsContent')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecipeScalerTool;
