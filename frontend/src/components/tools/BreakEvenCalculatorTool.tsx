import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Package, Target, Calculator, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BreakEvenInputs {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  targetProfit: number;
  currentSalesUnits: number;
}

interface WhatIfScenario {
  label: string;
  priceChange: number;
  variableCostChange: number;
  fixedCostChange: number;
}

interface BreakEvenCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const BreakEvenCalculatorTool: React.FC<BreakEvenCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [inputs, setInputs] = useState<BreakEvenInputs>({
    fixedCosts: 10000,
    variableCostPerUnit: 15,
    sellingPricePerUnit: 25,
    targetProfit: 5000,
    currentSalesUnits: 1500,
  });
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setInputs(prev => ({ ...prev, fixedCosts: params.amount! }));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setInputs(prev => ({
          ...prev,
          fixedCosts: params.numbers![0],
          ...(params.numbers!.length > 1 && { sellingPricePerUnit: params.numbers![1] }),
          ...(params.numbers!.length > 2 && { variableCostPerUnit: params.numbers![2] }),
        }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const { fixedCosts, variableCostPerUnit, sellingPricePerUnit, targetProfit, currentSalesUnits } = inputs;

    // Contribution Margin
    const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
    const contributionMarginRatio = sellingPricePerUnit > 0
      ? (contributionMargin / sellingPricePerUnit) * 100
      : 0;

    // Break-even calculations
    const breakEvenUnits = contributionMargin > 0
      ? Math.ceil(fixedCosts / contributionMargin)
      : 0;
    const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;

    // Units to reach target profit
    const unitsForTargetProfit = contributionMargin > 0
      ? Math.ceil((fixedCosts + targetProfit) / contributionMargin)
      : 0;
    const revenueForTargetProfit = unitsForTargetProfit * sellingPricePerUnit;

    // Margin of Safety
    const marginOfSafetyUnits = currentSalesUnits - breakEvenUnits;
    const marginOfSafetyPercentage = currentSalesUnits > 0
      ? (marginOfSafetyUnits / currentSalesUnits) * 100
      : 0;

    // Current profit/loss
    const currentRevenue = currentSalesUnits * sellingPricePerUnit;
    const currentTotalVariableCosts = currentSalesUnits * variableCostPerUnit;
    const currentProfit = currentRevenue - currentTotalVariableCosts - fixedCosts;

    return {
      contributionMargin,
      contributionMarginRatio,
      breakEvenUnits,
      breakEvenRevenue,
      unitsForTargetProfit,
      revenueForTargetProfit,
      marginOfSafetyUnits,
      marginOfSafetyPercentage,
      currentRevenue,
      currentProfit,
    };
  }, [inputs]);

  const whatIfScenarios: WhatIfScenario[] = [
    { label: 'Price +10%', priceChange: 0.10, variableCostChange: 0, fixedCostChange: 0 },
    { label: 'Price -10%', priceChange: -0.10, variableCostChange: 0, fixedCostChange: 0 },
    { label: 'Variable Cost -15%', priceChange: 0, variableCostChange: -0.15, fixedCostChange: 0 },
    { label: 'Variable Cost +15%', priceChange: 0, variableCostChange: 0.15, fixedCostChange: 0 },
    { label: 'Fixed Cost -20%', priceChange: 0, variableCostChange: 0, fixedCostChange: -0.20 },
    { label: 'Fixed Cost +20%', priceChange: 0, variableCostChange: 0, fixedCostChange: 0.20 },
  ];

  const calculateScenario = (scenario: WhatIfScenario) => {
    const newPrice = inputs.sellingPricePerUnit * (1 + scenario.priceChange);
    const newVariableCost = inputs.variableCostPerUnit * (1 + scenario.variableCostChange);
    const newFixedCost = inputs.fixedCosts * (1 + scenario.fixedCostChange);
    const newCM = newPrice - newVariableCost;
    const newBreakEven = newCM > 0 ? Math.ceil(newFixedCost / newCM) : 0;
    const changeFromCurrent = calculations.breakEvenUnits > 0
      ? ((newBreakEven - calculations.breakEvenUnits) / calculations.breakEvenUnits) * 100
      : 0;

    return {
      breakEvenUnits: newBreakEven,
      breakEvenRevenue: newBreakEven * newPrice,
      changeFromCurrent,
    };
  };

  const handleInputChange = (field: keyof BreakEvenInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Visual representation data
  const maxUnits = Math.max(calculations.breakEvenUnits * 2, inputs.currentSalesUnits * 1.2, 100);
  const breakEvenPercentage = (calculations.breakEvenUnits / maxUnits) * 100;
  const currentSalesPercentage = (inputs.currentSalesUnits / maxUnits) * 100;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.breakEvenCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
            <Calculator className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.breakEvenCalculator.breakEvenCalculator', 'Break-Even Calculator')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.breakEvenCalculator.analyzeYourBusinessProfitabilityAnd', 'Analyze your business profitability and find your break-even point')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className={`lg:col-span-1 rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.breakEvenCalculator.businessParameters', 'Business Parameters')}
            </h2>

            <div className="space-y-4">
              {/* Fixed Costs */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4" />
                  {t('tools.breakEvenCalculator.fixedCostsPerMonth', 'Fixed Costs per Month')}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$</span>
                  <input
                    type="number"
                    value={inputs.fixedCosts}
                    onChange={(e) => handleInputChange('fixedCosts', e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="10000"
                  />
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.breakEvenCalculator.rentSalariesUtilitiesInsuranceEtc', 'Rent, salaries, utilities, insurance, etc.')}
                </p>
              </div>

              {/* Variable Cost per Unit */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Package className="w-4 h-4" />
                  {t('tools.breakEvenCalculator.variableCostPerUnit', 'Variable Cost per Unit')}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$</span>
                  <input
                    type="number"
                    value={inputs.variableCostPerUnit}
                    onChange={(e) => handleInputChange('variableCostPerUnit', e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="15"
                  />
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.breakEvenCalculator.materialsLaborPerItemPackaging', 'Materials, labor per item, packaging')}
                </p>
              </div>

              {/* Selling Price per Unit */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <TrendingUp className="w-4 h-4" />
                  {t('tools.breakEvenCalculator.sellingPricePerUnit', 'Selling Price per Unit')}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$</span>
                  <input
                    type="number"
                    value={inputs.sellingPricePerUnit}
                    onChange={(e) => handleInputChange('sellingPricePerUnit', e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Target Profit */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4" />
                  {t('tools.breakEvenCalculator.targetProfitOptional', 'Target Profit (Optional)')}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>$</span>
                  <input
                    type="number"
                    value={inputs.targetProfit}
                    onChange={(e) => handleInputChange('targetProfit', e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="5000"
                  />
                </div>
              </div>

              {/* Current Sales Units */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Package className="w-4 h-4" />
                  {t('tools.breakEvenCalculator.currentSalesUnitsMonth', 'Current Sales (Units/Month)')}
                </label>
                <input
                  type="number"
                  value={inputs.currentSalesUnits}
                  onChange={(e) => handleInputChange('currentSalesUnits', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="1500"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.breakEvenCalculator.forMarginOfSafetyCalculation', 'For margin of safety calculation')}
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Results Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Break-Even Units */}
              <div className={`rounded-2xl p-5 ${isDark ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'}`}>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {t('tools.breakEvenCalculator.breakEvenUnits2', 'Break-Even Units')}
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(calculations.breakEvenUnits)}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.breakEvenCalculator.unitsPerMonth', 'units per month')}
                </p>
              </div>

              {/* Break-Even Revenue */}
              <div className={`rounded-2xl p-5 ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  {t('tools.breakEvenCalculator.breakEvenRevenue', 'Break-Even Revenue')}
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.breakEvenRevenue)}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.breakEvenCalculator.perMonth', 'per month')}
                </p>
              </div>

              {/* Contribution Margin */}
              <div className={`rounded-2xl p-5 ${isDark ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10' : 'bg-gradient-to-br from-purple-50 to-purple-100'}`}>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                  {t('tools.breakEvenCalculator.contributionMargin2', 'Contribution Margin')}
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.contributionMargin)}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {calculations.contributionMarginRatio.toFixed(1)}% ratio
                </p>
              </div>

              {/* Margin of Safety */}
              <div className={`rounded-2xl p-5 ${
                calculations.marginOfSafetyUnits >= 0
                  ? isDark ? 'bg-gradient-to-br from-green-500/20 to-green-600/10' : 'bg-gradient-to-br from-green-50 to-green-100'
                  : isDark ? 'bg-gradient-to-br from-red-500/20 to-red-600/10' : 'bg-gradient-to-br from-red-50 to-red-100'
              }`}>
                <p className={`text-sm font-medium mb-1 ${
                  calculations.marginOfSafetyUnits >= 0
                    ? isDark ? 'text-green-300' : 'text-green-700'
                    : isDark ? 'text-red-300' : 'text-red-700'
                }`}>
                  {t('tools.breakEvenCalculator.marginOfSafety2', 'Margin of Safety')}
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.marginOfSafetyPercentage.toFixed(1)}%
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatNumber(Math.abs(calculations.marginOfSafetyUnits))} units {calculations.marginOfSafetyUnits >= 0 ? 'above' : 'below'}
                </p>
              </div>
            </div>

            {/* Target Profit Section */}
            {inputs.targetProfit > 0 && (
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.breakEvenCalculator.targetProfitAnalysis', 'Target Profit Analysis')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.breakEvenCalculator.targetProfit', 'Target Profit')}</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      {formatCurrency(inputs.targetProfit)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.breakEvenCalculator.unitsRequired', 'Units Required')}</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(calculations.unitsForTargetProfit)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.breakEvenCalculator.revenueRequired', 'Revenue Required')}</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(calculations.revenueForTargetProfit)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Representation */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.breakEvenCalculator.breakEvenVisualization', 'Break-Even Visualization')}
              </h3>

              {/* Chart Container */}
              <div className="relative h-48 mb-6">
                {/* Background zones */}
                <div className="absolute inset-0 flex rounded-xl overflow-hidden">
                  {/* Loss Zone */}
                  <div
                    className={`${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}
                    style={{ width: `${breakEvenPercentage}%` }}
                  >
                    <div className="h-full flex items-center justify-center">
                      <span className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {t('tools.breakEvenCalculator.lossZone', 'Loss Zone')}
                      </span>
                    </div>
                  </div>
                  {/* Profit Zone */}
                  <div
                    className={`flex-1 ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}
                  >
                    <div className="h-full flex items-center justify-center">
                      <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {t('tools.breakEvenCalculator.profitZone2', 'Profit Zone')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Break-Even Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-amber-500 z-10"
                  style={{ left: `${breakEvenPercentage}%` }}
                >
                  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${isDark ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                    Break-Even: {formatNumber(calculations.breakEvenUnits)} units
                  </div>
                </div>

                {/* Current Sales Marker */}
                {inputs.currentSalesUnits > 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-blue-500 z-10"
                    style={{ left: `${currentSalesPercentage}%` }}
                  >
                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${isDark ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      Current: {formatNumber(inputs.currentSalesUnits)} units
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${isDark ? 'bg-red-500/40' : 'bg-red-200'}`}></div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.breakEvenCalculator.fixedCostsLoss', 'Fixed Costs (Loss)')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500"></div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.breakEvenCalculator.breakEvenPoint', 'Break-Even Point')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${isDark ? 'bg-green-500/40' : 'bg-green-200'}`}></div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.breakEvenCalculator.profitZone', 'Profit Zone')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.breakEvenCalculator.currentSales', 'Current Sales')}</span>
                </div>
              </div>

              {/* Current Status */}
              <div className={`mt-6 p-4 rounded-xl ${
                calculations.currentProfit >= 0
                  ? isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                  : isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.breakEvenCalculator.currentMonthlyStatus', 'Current Monthly Status')}</p>
                    <p className={`text-lg font-bold ${
                      calculations.currentProfit >= 0
                        ? isDark ? 'text-green-400' : 'text-green-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {calculations.currentProfit >= 0 ? t('tools.breakEvenCalculator.profit', 'Profit') : t('tools.breakEvenCalculator.loss', 'Loss')}: {formatCurrency(Math.abs(calculations.currentProfit))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.breakEvenCalculator.currentRevenue', 'Current Revenue')}</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(calculations.currentRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What-If Scenarios Table */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.breakEvenCalculator.whatIfScenarios', 'What-If Scenarios')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.breakEvenCalculator.scenario', 'Scenario')}
                      </th>
                      <th className={`text-right py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.breakEvenCalculator.breakEvenUnits3', 'Break-Even Units')}
                      </th>
                      <th className={`text-right py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.breakEvenCalculator.breakEvenRevenue2', 'Break-Even Revenue')}
                      </th>
                      <th className={`text-right py-3 px-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.breakEvenCalculator.change', 'Change')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Current baseline row */}
                    <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-100 bg-gray-50'}`}>
                      <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.breakEvenCalculator.currentBaseline', 'Current (Baseline)')}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(calculations.breakEvenUnits)}
                      </td>
                      <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatCurrency(calculations.breakEvenRevenue)}
                      </td>
                      <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        -
                      </td>
                    </tr>
                    {whatIfScenarios.map((scenario, index) => {
                      const result = calculateScenario(scenario);
                      const isPositive = result.changeFromCurrent < 0;
                      return (
                        <tr
                          key={index}
                          className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                        >
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {scenario.label}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatNumber(result.breakEvenUnits)}
                          </td>
                          <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatCurrency(result.breakEvenRevenue)}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${
                            isPositive
                              ? isDark ? 'text-green-400' : 'text-green-600'
                              : isDark ? 'text-red-400' : 'text-red-600'
                          }`}>
                            {isPositive ? '' : '+'}{result.changeFromCurrent.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className={`mt-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                * Negative change means fewer units needed to break even (better)
              </p>
            </div>

            {/* Formula Reference */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.breakEvenCalculator.formulasUsed', 'Formulas Used')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">{t('tools.breakEvenCalculator.breakEvenUnits', 'Break-Even Units:')}</span> Fixed Costs / (Price - Variable Cost)
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">{t('tools.breakEvenCalculator.contributionMargin', 'Contribution Margin:')}</span> Price - Variable Cost per Unit
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">{t('tools.breakEvenCalculator.cmRatio', 'CM Ratio:')}</span> (Contribution Margin / Price) x 100
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">{t('tools.breakEvenCalculator.marginOfSafety', 'Margin of Safety:')}</span> (Current Sales - Break-Even) / Current Sales x 100
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakEvenCalculatorTool;
