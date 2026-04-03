import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wine, AlertTriangle, Plus, Trash2, Clock, Car, Info, Shield, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type Gender = 'male' | 'female';
type WeightUnit = 'kg' | 'lbs';

interface Drink {
  id: string;
  type: DrinkType;
  quantity: number;
  customOz?: number;
  customAbv?: number;
  timeAgo: number; // hours ago
}

type DrinkType = 'beer' | 'wine' | 'spirit' | 'cocktail' | 'custom';

interface DrinkInfo {
  name: string;
  standardDrinks: number;
  oz: number;
  abv: number;
}

const DRINK_TYPES: Record<DrinkType, DrinkInfo> = {
  beer: { name: 'Beer (12 oz, 5%)', standardDrinks: 1, oz: 12, abv: 5 },
  wine: { name: 'Wine (5 oz, 12%)', standardDrinks: 1, oz: 5, abv: 12 },
  spirit: { name: 'Spirit (1.5 oz, 40%)', standardDrinks: 1, oz: 1.5, abv: 40 },
  cocktail: { name: 'Cocktail (avg 1.5 std)', standardDrinks: 1.5, oz: 6, abv: 15 },
  custom: { name: 'Custom', standardDrinks: 0, oz: 0, abv: 0 },
};

interface BacResult {
  currentBac: number;
  peakBac: number;
  timeToZero: number; // hours
  timeToLegalUS: number; // hours (0.08)
  timeToLegalStrict: number; // hours (0.05)
  totalStandardDrinks: number;
  impairmentLevel: 'none' | 'mild' | 'moderate' | 'significant' | 'severe' | 'dangerous';
  canDriveUS: boolean;
  canDriveStrict: boolean;
}

// Widmark formula constants
const WIDMARK_MALE = 0.68;
const WIDMARK_FEMALE = 0.55;
const ALCOHOL_METABOLISM_RATE = 0.015; // BAC reduction per hour

interface AlcoholCalculatorToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'currentBac', header: 'Current BAC (%)', type: 'number', format: (v) => (v as number).toFixed(3) },
  { key: 'peakBac', header: 'Peak BAC (%)', type: 'number', format: (v) => (v as number).toFixed(3) },
  { key: 'totalStandardDrinks', header: 'Total Standard Drinks', type: 'number', format: (v) => (v as number).toFixed(1) },
  { key: 'impairmentLevel', header: 'Impairment Level', type: 'string' },
  { key: 'timeToZero', header: 'Time to 0.00% (hours)', type: 'number', format: (v) => (v as number).toFixed(1) },
  { key: 'timeToLegalUS', header: 'Time to 0.08% (hours)', type: 'number', format: (v) => (v as number).toFixed(1) },
  { key: 'timeToLegalStrict', header: 'Time to 0.05% (hours)', type: 'number', format: (v) => (v as number).toFixed(1) },
  { key: 'canDriveUS', header: 'Can Drive (US Legal)', type: 'boolean' },
  { key: 'canDriveStrict', header: 'Can Drive (Strict)', type: 'boolean' },
];

export function AlcoholCalculatorTool({ uiConfig }: AlcoholCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [gender, setGender] = useState<Gender>('male');
  const [drinks, setDrinks] = useState<Drink[]>([
    { id: '1', type: 'beer', quantity: 1, timeAgo: 0 }
  ]);
  const [result, setResult] = useState<BacResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasPrefill = false;

      if (params.numbers && params.numbers.length >= 1) {
        setWeight(params.numbers[0].toString());
        hasPrefill = true;
      }
      if (params.amount) {
        setWeight(params.amount.toString());
        hasPrefill = true;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const addDrink = () => {
    setDrinks([
      ...drinks,
      { id: Date.now().toString(), type: 'beer', quantity: 1, timeAgo: 0 }
    ]);
  };

  const removeDrink = (id: string) => {
    if (drinks.length > 1) {
      setDrinks(drinks.filter(d => d.id !== id));
    }
  };

  const updateDrink = (id: string, field: keyof Drink, value: number | DrinkType) => {
    setDrinks(drinks.map(d =>
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const calculateStandardDrinks = (drink: Drink): number => {
    if (drink.type === 'custom') {
      const oz = drink.customOz || 0;
      const abv = drink.customAbv || 0;
      // Standard drink = 0.6 oz of pure alcohol
      return (oz * (abv / 100) * drink.quantity) / 0.6;
    }
    return DRINK_TYPES[drink.type].standardDrinks * drink.quantity;
  };

  const calculateBac = () => {
    const weightValue = parseFloat(weight);
    if (!weightValue || weightValue <= 0) {
      setValidationMessage('Please enter a valid weight');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Convert weight to grams
    let weightInGrams = weightUnit === 'kg'
      ? weightValue * 1000
      : weightValue * 453.592;

    const widmarkFactor = gender === 'male' ? WIDMARK_MALE : WIDMARK_FEMALE;

    // Calculate total standard drinks and peak BAC
    let totalStandardDrinks = 0;
    let peakBac = 0;
    let currentBac = 0;

    drinks.forEach(drink => {
      const standardDrinks = calculateStandardDrinks(drink);
      totalStandardDrinks += standardDrinks;

      // Each standard drink = 14 grams of alcohol (US standard)
      const alcoholGrams = standardDrinks * 14;

      // Widmark formula: BAC = (A / (r * W)) * 100
      // Where A = alcohol in grams, r = Widmark factor, W = body weight in grams
      const bacFromDrink = (alcoholGrams / (widmarkFactor * weightInGrams)) * 100;

      // Subtract metabolism since drink was consumed
      const metabolizedBac = drink.timeAgo * ALCOHOL_METABOLISM_RATE;
      const remainingBac = Math.max(0, bacFromDrink - metabolizedBac);

      peakBac += bacFromDrink;
      currentBac += remainingBac;
    });

    // Round to 3 decimal places
    currentBac = Math.round(currentBac * 1000) / 1000;
    peakBac = Math.round(peakBac * 1000) / 1000;

    // Calculate time to sober
    const timeToZero = currentBac > 0 ? currentBac / ALCOHOL_METABOLISM_RATE : 0;
    const timeToLegalUS = currentBac > 0.08 ? (currentBac - 0.08) / ALCOHOL_METABOLISM_RATE : 0;
    const timeToLegalStrict = currentBac > 0.05 ? (currentBac - 0.05) / ALCOHOL_METABOLISM_RATE : 0;

    // Determine impairment level
    let impairmentLevel: BacResult['impairmentLevel'];
    if (currentBac === 0) {
      impairmentLevel = 'none';
    } else if (currentBac < 0.03) {
      impairmentLevel = 'mild';
    } else if (currentBac < 0.06) {
      impairmentLevel = 'moderate';
    } else if (currentBac < 0.10) {
      impairmentLevel = 'significant';
    } else if (currentBac < 0.20) {
      impairmentLevel = 'severe';
    } else {
      impairmentLevel = 'dangerous';
    }

    setResult({
      currentBac,
      peakBac,
      timeToZero: Math.round(timeToZero * 10) / 10,
      timeToLegalUS: Math.round(timeToLegalUS * 10) / 10,
      timeToLegalStrict: Math.round(timeToLegalStrict * 10) / 10,
      totalStandardDrinks: Math.round(totalStandardDrinks * 10) / 10,
      impairmentLevel,
      canDriveUS: currentBac < 0.08,
      canDriveStrict: currentBac < 0.05,
    });
  };

  const reset = () => {
    setWeight('');
    setGender('male');
    setDrinks([{ id: '1', type: 'beer', quantity: 1, timeAgo: 0 }]);
    setResult(null);
  };

  const handleExportCSV = () => {
    if (!result) return;
    const data = [result];
    exportToCSV(data, COLUMNS, { filename: 'bac-calculator-results' });
  };

  const handleExportExcel = () => {
    if (!result) return;
    const data = [result];
    exportToExcel(data, COLUMNS, { filename: 'bac-calculator-results' });
  };

  const handleExportJSON = () => {
    if (!result) return;
    const data = [result];
    exportToJSON(data, { filename: 'bac-calculator-results' });
  };

  const handleExportPDF = async () => {
    if (!result) return;
    const data = [result];
    await exportToPDF(data, COLUMNS, {
      filename: 'bac-calculator-results',
      title: 'BAC Calculator Results',
      subtitle: 'Blood Alcohol Content Report'
    });
  };

  const handlePrint = () => {
    if (!result) return;
    const data = [result];
    printData(data, COLUMNS, { title: 'BAC Calculator Results' });
  };

  const handleCopyToClipboard = async () => {
    if (!result) return;
    const data = [result];
    return await copyUtil(data, COLUMNS, 'tab');
  };

  const getImpairmentColor = (level: BacResult['impairmentLevel']): string => {
    switch (level) {
      case 'none': return '#10b981';
      case 'mild': return '#84cc16';
      case 'moderate': return '#eab308';
      case 'significant': return '#f97316';
      case 'severe': return '#ef4444';
      case 'dangerous': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getImpairmentText = (level: BacResult['impairmentLevel']): string => {
    switch (level) {
      case 'none': return 'No Impairment';
      case 'mild': return 'Mild Impairment - Relaxation, slight euphoria';
      case 'moderate': return 'Moderate Impairment - Lowered inhibitions, impaired judgment';
      case 'significant': return 'Significant Impairment - Slurred speech, poor coordination';
      case 'severe': return 'Severe Impairment - Confusion, nausea, impaired vision';
      case 'dangerous': return 'Dangerous - Risk of alcohol poisoning, seek help';
      default: return '';
    }
  };

  const formatTime = (hours: number): string => {
    if (hours === 0) return 'Now';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Wine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.alcoholCalculator.bacCalculator', 'BAC Calculator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.alcoholCalculator.bloodAlcoholContentEstimator', 'Blood Alcohol Content Estimator')}
              </p>
            </div>
          </div>

          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.alcoholCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
            </div>
          )}

          {/* Warning Banner */}
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className={`text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>
                <p className="font-semibold mb-1">{t('tools.alcoholCalculator.importantDisclaimer', 'Important Disclaimer')}</p>
                <p>{t('tools.alcoholCalculator.thisCalculatorProvidesEstimatesOnly', 'This calculator provides estimates only. Actual BAC varies based on many factors including food intake, medications, metabolism, and tolerance. Never drive after drinking. When in doubt, wait or use alternative transportation.')}</p>
              </div>
            </div>
          </div>

          {/* Personal Info Section */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.alcoholCalculator.gender', 'Gender')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    gender === 'male'
                      ? 'bg-purple-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.alcoholCalculator.male', 'Male')}
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    gender === 'female'
                      ? 'bg-purple-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.alcoholCalculator.female', 'Female')}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.alcoholCalculator.weight', 'Weight')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={`Enter weight in ${weightUnit}`}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                  className={`px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
          </div>

          {/* Drinks Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.alcoholCalculator.drinksConsumed', 'Drinks Consumed')}
              </label>
              <button
                onClick={addDrink}
                className="flex items-center gap-1 text-sm text-purple-500 hover:text-purple-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.alcoholCalculator.addDrink', 'Add Drink')}
              </button>
            </div>

            <div className="space-y-3">
              {drinks.map((drink, index) => (
                <div
                  key={drink.id}
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Drink #{index + 1}
                    </span>
                    {drinks.length > 1 && (
                      <button
                        onClick={() => removeDrink(drink.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <select
                        value={drink.type}
                        onChange={(e) => updateDrink(drink.id, 'type', e.target.value as DrinkType)}
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      >
                        {Object.entries(DRINK_TYPES).map(([key, info]) => (
                          <option key={key} value={key}>{info.name}</option>
                        ))}
                      </select>
                    </div>

                    {drink.type === 'custom' && (
                      <>
                        <div>
                          <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.alcoholCalculator.volumeOz', 'Volume (oz)')}
                          </label>
                          <input
                            type="number"
                            value={drink.customOz || ''}
                            onChange={(e) => updateDrink(drink.id, 'customOz', parseFloat(e.target.value) || 0)}
                            placeholder="oz"
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('tools.alcoholCalculator.abv', 'ABV (%)')}
                          </label>
                          <input
                            type="number"
                            value={drink.customAbv || ''}
                            onChange={(e) => updateDrink(drink.id, 'customAbv', parseFloat(e.target.value) || 0)}
                            placeholder="%"
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.alcoholCalculator.quantity', 'Quantity')}
                      </label>
                      <input
                        type="number"
                        value={drink.quantity}
                        onChange={(e) => updateDrink(drink.id, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.alcoholCalculator.hoursAgo', 'Hours Ago')}
                      </label>
                      <input
                        type="number"
                        value={drink.timeAgo}
                        onChange={(e) => updateDrink(drink.id, 'timeAgo', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateBac}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Wine className="w-5 h-5" />
              {t('tools.alcoholCalculator.calculateBac', 'Calculate BAC')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.alcoholCalculator.reset', 'Reset')}
            </button>
            {result && (
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
          </div>

          {/* Results Display */}
          {result && (
            <div className="space-y-4">
              {/* Main BAC Display */}
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: `${getImpairmentColor(result.impairmentLevel)}15`,
                  borderLeft: `4px solid ${getImpairmentColor(result.impairmentLevel)}`
                }}
              >
                <div className="text-center mb-4">
                  <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.alcoholCalculator.estimatedBloodAlcoholContent', 'Estimated Blood Alcohol Content')}
                  </div>
                  <div
                    className="text-5xl font-bold"
                    style={{ color: getImpairmentColor(result.impairmentLevel) }}
                  >
                    {result.currentBac.toFixed(3)}%
                  </div>
                  <div
                    className="text-lg font-semibold mt-2"
                    style={{ color: getImpairmentColor(result.impairmentLevel) }}
                  >
                    {getImpairmentText(result.impairmentLevel)}
                  </div>
                </div>

                <div className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total: {result.totalStandardDrinks} standard drinks | Peak BAC: {result.peakBac.toFixed(3)}%
                </div>
              </div>

              {/* Driving Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${
                  result.canDriveUS
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Car className={`w-5 h-5 ${result.canDriveUS ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.alcoholCalculator.usLegal008', 'US Legal (0.08)')}
                    </span>
                  </div>
                  <div className={`text-sm ${result.canDriveUS ? 'text-green-500' : 'text-red-500'}`}>
                    {result.canDriveUS ? 'Under legal limit' : `Wait ${formatTime(result.timeToLegalUS)}`}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  result.canDriveStrict
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-amber-500/10 border border-amber-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className={`w-5 h-5 ${result.canDriveStrict ? 'text-green-500' : 'text-amber-500'}`} />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.alcoholCalculator.strict005', 'Strict (0.05)')}
                    </span>
                  </div>
                  <div className={`text-sm ${result.canDriveStrict ? 'text-green-500' : 'text-amber-500'}`}>
                    {result.canDriveStrict ? 'Under limit' : `Wait ${formatTime(result.timeToLegalStrict)}`}
                  </div>
                </div>
              </div>

              {/* Time to Sober */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.alcoholCalculator.timeToSober', 'Time to Sober')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(result.timeToZero)}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.alcoholCalculator.to000', 'To 0.00%')}
                    </div>
                  </div>
                  {!result.canDriveUS && (
                    <div>
                      <div className="text-2xl font-bold text-amber-500">
                        {formatTime(result.timeToLegalUS)}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.alcoholCalculator.to008', 'To 0.08%')}
                      </div>
                    </div>
                  )}
                  {!result.canDriveStrict && (
                    <div>
                      <div className="text-2xl font-bold text-blue-500">
                        {formatTime(result.timeToLegalStrict)}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.alcoholCalculator.to005', 'To 0.05%')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety Warning for High BAC */}
              {result.currentBac >= 0.15 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                        {t('tools.alcoholCalculator.healthWarning', 'Health Warning')}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-600'}`}>
                        {t('tools.alcoholCalculator.yourEstimatedBacIsDangerously', 'Your estimated BAC is dangerously high. Signs of alcohol poisoning include confusion, vomiting, seizures, slow breathing, and unconsciousness. If you or someone else experiences these symptoms, call emergency services immediately.')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standard Drink Reference */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`w-full mt-6 flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.alcoholCalculator.standardDrinkReference', 'Standard Drink Reference')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showInfo ? '-' : '+'}
            </span>
          </button>

          {showInfo && (
            <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="font-semibold">One Standard Drink (US) = 14g pure alcohol:</p>
                <ul className="space-y-1 ml-4">
                  <li>12 oz Beer (5% ABV)</li>
                  <li>5 oz Wine (12% ABV)</li>
                  <li>1.5 oz Spirits (40% ABV)</li>
                  <li>8-9 oz Malt Liquor (7% ABV)</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <p className="font-semibold mb-2">{t('tools.alcoholCalculator.bacImpairmentLevels', 'BAC Impairment Levels:')}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>0.02 - 0.03%</span>
                      <span className="text-green-500">{t('tools.alcoholCalculator.mildRelaxation', 'Mild relaxation')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>0.04 - 0.06%</span>
                      <span className="text-yellow-500">{t('tools.alcoholCalculator.loweredInhibitions', 'Lowered inhibitions')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>0.07 - 0.09%</span>
                      <span className="text-orange-500">{t('tools.alcoholCalculator.impairedBalanceSpeech', 'Impaired balance/speech')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>0.10 - 0.15%</span>
                      <span className="text-red-500">{t('tools.alcoholCalculator.significantImpairment', 'Significant impairment')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>0.16%+</span>
                      <span className="text-red-600">{t('tools.alcoholCalculator.dangerous', 'Dangerous')}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs opacity-75">
                  {t('tools.alcoholCalculator.theBodyMetabolizesAlcoholAt', 'The body metabolizes alcohol at approximately 0.015% BAC per hour. This calculator uses the Widmark formula, which provides estimates based on average metabolic rates. Individual results may vary significantly.')}
                </p>
              </div>
            </div>
          )}

          {/* Final Disclaimer */}
          <div className={`mt-4 p-3 rounded-lg text-xs ${theme === 'dark' ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            <p>
              <strong>{t('tools.alcoholCalculator.disclaimer', 'Disclaimer:')}</strong> This tool provides estimates only and should not be used to determine fitness to drive. Actual BAC depends on many factors not accounted for here, including food intake, hydration, medications, liver function, and individual metabolism. The only safe amount of alcohol before driving is zero. Always use designated drivers, rideshare services, or public transportation after drinking.
            </p>
          </div>

          {/* Validation Toast */}
          {validationMessage && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4">
              {validationMessage}
            </div>
          )}

          <ConfirmDialog />
        </div>
      </div>
    </div>
  );
}

export default AlcoholCalculatorTool;
