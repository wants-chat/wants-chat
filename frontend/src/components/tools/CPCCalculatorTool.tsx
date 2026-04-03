import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MousePointer, DollarSign, Target, Sparkles, TrendingUp, Calculator, BarChart3, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CPCCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculationMode = 'cpc' | 'clicks' | 'cost';

export const CPCCalculatorTool: React.FC<CPCCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [calculationMode, setCalculationMode] = useState<CalculationMode>('cpc');
  const [totalCost, setTotalCost] = useState('500');
  const [clicks, setClicks] = useState('250');
  const [cpc, setCpc] = useState('2');
  const [budget, setBudget] = useState('1000');
  const [conversionRate, setConversionRate] = useState('3');
  const [avgOrderValue, setAvgOrderValue] = useState('50');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.cost !== undefined || params.totalCost !== undefined) {
        setTotalCost(String(params.cost || params.totalCost));
        setIsPrefilled(true);
      }
      if (params.clicks !== undefined) {
        setClicks(String(params.clicks));
        setIsPrefilled(true);
      }
      if (params.cpc !== undefined) {
        setCpc(String(params.cpc));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setTotalCost(String(params.numbers[0]));
        if (params.numbers.length > 1) setClicks(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const costNum = parseFloat(totalCost) || 0;
    const clicksNum = parseFloat(clicks) || 0;
    const cpcNum = parseFloat(cpc) || 0;
    const budgetNum = parseFloat(budget) || 0;
    const convRateNum = parseFloat(conversionRate) || 0;
    const aovNum = parseFloat(avgOrderValue) || 0;

    let calculatedCPC = 0;
    let calculatedClicks = 0;
    let calculatedCost = 0;

    switch (calculationMode) {
      case 'cpc':
        calculatedCPC = clicksNum > 0 ? costNum / clicksNum : 0;
        calculatedClicks = clicksNum;
        calculatedCost = costNum;
        break;
      case 'clicks':
        calculatedClicks = cpcNum > 0 ? budgetNum / cpcNum : 0;
        calculatedCPC = cpcNum;
        calculatedCost = budgetNum;
        break;
      case 'cost':
        calculatedCost = clicksNum * cpcNum;
        calculatedCPC = cpcNum;
        calculatedClicks = clicksNum;
        break;
    }

    // ROI Calculations
    const projectedConversions = calculatedClicks * (convRateNum / 100);
    const projectedRevenue = projectedConversions * aovNum;
    const projectedProfit = projectedRevenue - calculatedCost;
    const roi = calculatedCost > 0 ? ((projectedRevenue - calculatedCost) / calculatedCost) * 100 : 0;

    // Cost per conversion
    const costPerConversion = projectedConversions > 0 ? calculatedCost / projectedConversions : 0;

    // Max CPC for break-even
    const maxCPCBreakeven = convRateNum > 0 ? aovNum * (convRateNum / 100) : 0;

    // Budget projections
    const clicksFor100 = cpcNum > 0 ? 100 / cpcNum : 0;
    const clicksFor500 = cpcNum > 0 ? 500 / cpcNum : 0;
    const clicksFor1000 = cpcNum > 0 ? 1000 / cpcNum : 0;

    // CPC rating
    let rating: string;
    let ratingColor: string;
    const effectiveCPC = calculationMode === 'cpc' ? calculatedCPC : cpcNum;

    if (effectiveCPC <= 0.5) {
      rating = 'Excellent';
      ratingColor = 'text-green-500';
    } else if (effectiveCPC <= 1) {
      rating = 'Very Good';
      ratingColor = 'text-teal-500';
    } else if (effectiveCPC <= 2) {
      rating = 'Good';
      ratingColor = 'text-blue-500';
    } else if (effectiveCPC <= 4) {
      rating = 'Average';
      ratingColor = 'text-yellow-500';
    } else {
      rating = 'High';
      ratingColor = 'text-red-500';
    }

    return {
      calculatedCPC,
      calculatedClicks,
      calculatedCost,
      projectedConversions,
      projectedRevenue,
      projectedProfit,
      roi,
      costPerConversion,
      maxCPCBreakeven,
      clicksFor100,
      clicksFor500,
      clicksFor1000,
      rating,
      ratingColor,
    };
  }, [calculationMode, totalCost, clicks, cpc, budget, conversionRate, avgOrderValue]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return '$' + num.toFixed(2);
  };

  const industryBenchmarks = [
    { industry: 'E-commerce', cpc: '$0.45 - $1.50' },
    { industry: 'Finance', cpc: '$2.00 - $6.00' },
    { industry: 'Insurance', cpc: '$3.00 - $8.00' },
    { industry: 'Legal', cpc: '$4.00 - $10.00' },
    { industry: 'Technology', cpc: '$1.00 - $3.50' },
    { industry: 'Travel', cpc: '$0.80 - $2.50' },
    { industry: 'Health', cpc: '$1.50 - $4.00' },
    { industry: 'Real Estate', cpc: '$1.80 - $5.00' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <MousePointer className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cPCCalculator.cpcCalculator', 'CPC Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cPCCalculator.calculateCostPerClickFor', 'Calculate Cost Per Click for your ads')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.cPCCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Calculation Mode */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.cPCCalculator.whatDoYouWantTo', 'What do you want to calculate?')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCalculationMode('cpc')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'cpc' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.cPCCalculator.cpc', 'CPC')}</div>
              <div className="text-xs opacity-75">{t('tools.cPCCalculator.fromCostClicks', 'From cost & clicks')}</div>
            </button>
            <button
              onClick={() => setCalculationMode('clicks')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'clicks' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.cPCCalculator.clicks', 'Clicks')}</div>
              <div className="text-xs opacity-75">{t('tools.cPCCalculator.fromBudgetCpc', 'From budget & CPC')}</div>
            </button>
            <button
              onClick={() => setCalculationMode('cost')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'cost' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.cPCCalculator.cost', 'Cost')}</div>
              <div className="text-xs opacity-75">{t('tools.cPCCalculator.fromClicksCpc', 'From clicks & CPC')}</div>
            </button>
          </div>
        </div>

        {/* Dynamic Inputs */}
        <div className="grid grid-cols-2 gap-4">
          {calculationMode === 'cpc' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.cPCCalculator.totalAdSpend', 'Total Ad Spend ($)')}
                </label>
                <input
                  type="number"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  placeholder="500"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <MousePointer className="w-4 h-4 inline mr-1" />
                  {t('tools.cPCCalculator.totalClicks', 'Total Clicks')}
                </label>
                <input
                  type="number"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  placeholder="250"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}

          {calculationMode === 'clicks' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.cPCCalculator.budget', 'Budget ($)')}
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="1000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4 inline mr-1" />
                  {t('tools.cPCCalculator.cpcRate', 'CPC Rate ($)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cpc}
                  onChange={(e) => setCpc(e.target.value)}
                  placeholder="2"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}

          {calculationMode === 'cost' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <MousePointer className="w-4 h-4 inline mr-1" />
                  {t('tools.cPCCalculator.targetClicks', 'Target Clicks')}
                </label>
                <input
                  type="number"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  placeholder="250"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4 inline mr-1" />
                  {t('tools.cPCCalculator.cpcRate2', 'CPC Rate ($)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cpc}
                  onChange={(e) => setCpc(e.target.value)}
                  placeholder="2"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}
        </div>

        {/* Conversion Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cPCCalculator.roiCalculationOptional', 'ROI Calculation (Optional)')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.cPCCalculator.conversionRate', 'Conversion Rate (%)')}
              </label>
              <input
                type="number"
                step="0.1"
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
                placeholder="3"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.cPCCalculator.avgOrderValue', 'Avg Order Value ($)')}
              </label>
              <input
                type="number"
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(e.target.value)}
                placeholder="50"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? t('tools.cPCCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {calculationMode === 'cpc' ? 'Your CPC' : calculationMode === 'clicks' ? t('tools.cPCCalculator.projectedClicks', 'Projected Clicks') : t('tools.cPCCalculator.estimatedCost', 'Estimated Cost')}
          </div>
          <div className="text-5xl font-bold text-[#0D9488] my-2">
            {calculationMode === 'cpc'
              ? formatCurrency(calculations.calculatedCPC)
              : calculationMode === 'clicks'
                ? formatNumber(calculations.calculatedClicks)
                : formatCurrency(calculations.calculatedCost)}
          </div>
          {calculationMode === 'cpc' && (
            <div className={`text-sm font-medium ${calculations.ratingColor}`}>
              {calculations.rating} CPC Rate
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPCCalculator.totalCost', 'Total Cost')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.calculatedCost)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPCCalculator.clicks2', 'Clicks')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatNumber(calculations.calculatedClicks)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPCCalculator.conversions', 'Conversions')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.projectedConversions.toFixed(1)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPCCalculator.projRevenue', 'Proj. Revenue')}</div>
            <div className="text-xl font-bold text-[#0D9488]">
              {formatCurrency(calculations.projectedRevenue)}
            </div>
          </div>
        </div>

        {/* ROI Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPCCalculator.costPerConversion', 'Cost per Conversion')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.costPerConversion)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPCCalculator.maxCpcBreakEven', 'Max CPC (Break-even)')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.maxCPCBreakeven)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPCCalculator.projectedRoi', 'Projected ROI')}</div>
            <div className={`text-xl font-bold ${calculations.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {calculations.roi.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Industry Benchmarks */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-4 h-4" />
            {t('tools.cPCCalculator.industryCpcBenchmarksGoogleAds', 'Industry CPC Benchmarks (Google Ads)')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {industryBenchmarks.map((benchmark, idx) => (
              <div key={idx} className={`p-2 rounded text-center ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{benchmark.industry}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{benchmark.cpc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cPCCalculator.whatIsCpc', 'What is CPC?')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                CPC (Cost Per Click) is the amount you pay each time someone clicks on your ad.
                It's the most common pricing model for search and social advertising.
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>{t('tools.cPCCalculator.formula', 'Formula:')}</strong> CPC = Total Cost / Total Clicks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPCCalculatorTool;
