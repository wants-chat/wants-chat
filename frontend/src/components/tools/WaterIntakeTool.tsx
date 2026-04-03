import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplet, Plus, Minus, RotateCcw, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface WaterIntakeEntry {
  id: string;
  date: string;
  amount: number;
  weight: string;
  unit: 'kg' | 'lbs';
  activityLevel: 'sedentary' | 'moderate' | 'active' | 'very_active';
  climate: 'normal' | 'hot' | 'humid';
  recommendation: number;
  notes?: string;
}

interface WaterIntakeToolProps {
  uiConfig?: UIConfig;
}

const WATER_INTAKE_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'amount', header: 'Amount (ml)', type: 'number' },
  { key: 'weight', header: 'Weight', type: 'string' },
  { key: 'unit', header: 'Unit', type: 'string' },
  { key: 'activityLevel', header: 'Activity Level', type: 'string' },
  { key: 'climate', header: 'Climate', type: 'string' },
  { key: 'recommendation', header: 'Daily Goal (ml)', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

export const WaterIntakeTool: React.FC<WaterIntakeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [weight, setWeight] = useState('70');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [climate, setClimate] = useState<'normal' | 'hot' | 'humid'>('normal');
  const [consumed, setConsumed] = useState(0);
  const [isPrefilled, setIsPrefilled] = useState(false);

  const {
    data: entries,
    addItem: addEntry,
    exportCSV,
    exportJSON,
    exportExcel,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<WaterIntakeEntry>('water-intake', [], WATER_INTAKE_COLUMNS);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setWeight(String(params.amount));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setWeight(String(params.numbers[0]));
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.weight) setWeight(params.formData.weight);
        if (params.formData.unit) setUnit(params.formData.unit as 'kg' | 'lbs');
        if (params.formData.activityLevel) setActivityLevel(params.formData.activityLevel);
        if (params.formData.climate) setClimate(params.formData.climate);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const recommendation = useMemo(() => {
    let weightKg = parseFloat(weight) || 0;
    if (unit === 'lbs') {
      weightKg = weightKg * 0.453592;
    }

    // Base calculation: 30-35ml per kg of body weight
    let baseIntake = weightKg * 33; // ml

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.0,
      moderate: 1.2,
      active: 1.4,
      very_active: 1.6,
    };

    // Climate multiplier
    const climateMultipliers = {
      normal: 1.0,
      hot: 1.2,
      humid: 1.15,
    };

    const adjustedIntake = baseIntake * activityMultipliers[activityLevel] * climateMultipliers[climate];
    const liters = adjustedIntake / 1000;
    const glasses = adjustedIntake / 250; // 250ml per glass
    const ounces = adjustedIntake * 0.033814;

    return {
      ml: adjustedIntake,
      liters: liters,
      glasses: glasses,
      ounces: ounces,
    };
  }, [weight, unit, activityLevel, climate]);

  const progress = useMemo(() => {
    const percent = recommendation.ml > 0 ? (consumed / recommendation.ml) * 100 : 0;
    return Math.min(percent, 100);
  }, [consumed, recommendation.ml]);

  const addWater = (amount: number) => {
    setConsumed(prev => Math.max(0, prev + amount));
  };

  const saveIntake = () => {
    const today = new Date().toISOString().split('T')[0];
    const entry: WaterIntakeEntry = {
      id: `${today}-${Date.now()}`,
      date: today,
      amount: consumed,
      weight,
      unit,
      activityLevel,
      climate,
      recommendation: Math.round(recommendation.ml),
      notes: '',
    };
    addEntry(entry);
    setConsumed(0);
  };

  const quickAddAmounts = [250, 500, 750];

  const getProgressColor = () => {
    if (progress >= 100) return 'from-green-400 to-emerald-500';
    if (progress >= 75) return 'from-blue-400 to-cyan-500';
    if (progress >= 50) return 'from-yellow-400 to-amber-500';
    return 'from-red-400 to-orange-500';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Droplet className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterIntake.waterIntakeCalculator', 'Water Intake Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.waterIntake.calculateYourDailyHydrationNeeds', 'Calculate your daily hydration needs')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="water-intake" toolName="Water Intake" />

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
              onExportCSV={exportCSV}
              onExportJSON={exportJSON}
              onExportExcel={exportExcel}
              onExportPDF={exportPDF}
              onPrint={() => print('Water Intake History')}
              onCopyToClipboard={() => copyToClipboard('csv')}
              onImportCSV={importCSV}
              onImportJSON={importJSON}
              showImport={true}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.waterIntake.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.waterIntake.bodyWeight', 'Body Weight')}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'kg' | 'lbs')}
                className={`px-3 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.waterIntake.activityLevel', 'Activity Level')}
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="sedentary">{t('tools.waterIntake.sedentaryLittleExercise', 'Sedentary (little exercise)')}</option>
              <option value="moderate">{t('tools.waterIntake.moderateLightExercise', 'Moderate (light exercise)')}</option>
              <option value="active">{t('tools.waterIntake.activeRegularExercise', 'Active (regular exercise)')}</option>
              <option value="very_active">{t('tools.waterIntake.veryActiveIntenseExercise', 'Very Active (intense exercise)')}</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.waterIntake.climate', 'Climate')}
            </label>
            <div className="flex gap-2">
              {[
                { value: 'normal', label: 'Normal' },
                { value: 'hot', label: 'Hot' },
                { value: 'humid', label: 'Humid' },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => setClimate(c.value as any)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    climate === c.value
                      ? 'bg-cyan-500 text-white'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Recommendation */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-100'} border`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
            {t('tools.waterIntake.dailyWaterIntakeRecommendation', 'Daily Water Intake Recommendation')}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {recommendation.liters.toFixed(1)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.waterIntake.liters', 'Liters')}</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Math.round(recommendation.ml)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ml</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Math.round(recommendation.glasses)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.waterIntake.glasses250ml', 'glasses (250ml)')}</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Math.round(recommendation.ounces)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>oz</div>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.waterIntake.todaySProgress', 'Today\'s Progress')}
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConsumed(0)}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {t('tools.waterIntake.reset', 'Reset')}
              </button>
              <button
                onClick={saveIntake}
                disabled={consumed === 0}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  consumed === 0
                    ? isDark
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                {t('tools.waterIntake.saveEntry', 'Save Entry')}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`h-8 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden relative`}>
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 rounded-full`}
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {consumed}ml / {Math.round(recommendation.ml)}ml ({Math.round(progress)}%)
              </span>
            </div>
          </div>

          {/* Quick Add */}
          <div className="flex flex-wrap gap-2">
            {quickAddAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => addWater(amount)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                {amount}ml
              </button>
            ))}
            <button
              onClick={() => addWater(-250)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Minus className="w-4 h-4" />
              {t('tools.waterIntake.250ml', '250ml')}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterIntake.hydrationTips', 'Hydration Tips')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• Drink a glass of water first thing in the morning</li>
            <li>• Keep a water bottle with you throughout the day</li>
            <li>• Drink before, during, and after exercise</li>
            <li>• If you're thirsty, you're already mildly dehydrated</li>
            <li>• Foods like fruits and vegetables also contribute to hydration</li>
          </ul>
        </div>

        {/* History Section */}
        {entries.length > 0 && (
          <div className="space-y-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recent Entries ({entries.length})
            </h4>
            <div className={`rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                {entries.slice(-5).reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 flex items-center justify-between ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex-1">
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {entry.amount} ml
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(entry.date).toLocaleDateString()} • Goal: {entry.recommendation} ml
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {entry.weight}{entry.unit} • {entry.activityLevel}
                      </div>
                    </div>
                    <div className={`text-right font-semibold ${entry.amount >= entry.recommendation ? 'text-green-500' : 'text-amber-500'}`}>
                      {Math.round((entry.amount / entry.recommendation) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterIntakeTool;
