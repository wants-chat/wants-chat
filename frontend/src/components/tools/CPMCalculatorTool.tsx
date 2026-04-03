import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, DollarSign, Target, Sparkles, TrendingUp, Calculator, BarChart3, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CPMCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculationMode = 'cpm' | 'impressions' | 'cost';

export const CPMCalculatorTool: React.FC<CPMCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [calculationMode, setCalculationMode] = useState<CalculationMode>('cpm');
  const [totalCost, setTotalCost] = useState('500');
  const [impressions, setImpressions] = useState('100000');
  const [cpm, setCpm] = useState('5');
  const [budget, setBudget] = useState('1000');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.cost !== undefined || params.totalCost !== undefined) {
        setTotalCost(String(params.cost || params.totalCost));
        setIsPrefilled(true);
      }
      if (params.impressions !== undefined) {
        setImpressions(String(params.impressions));
        setIsPrefilled(true);
      }
      if (params.cpm !== undefined) {
        setCpm(String(params.cpm));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setTotalCost(String(params.numbers[0]));
        if (params.numbers.length > 1) setImpressions(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const costNum = parseFloat(totalCost) || 0;
    const impressionsNum = parseFloat(impressions) || 0;
    const cpmNum = parseFloat(cpm) || 0;
    const budgetNum = parseFloat(budget) || 0;

    let calculatedCPM = 0;
    let calculatedImpressions = 0;
    let calculatedCost = 0;

    switch (calculationMode) {
      case 'cpm':
        // Calculate CPM from cost and impressions
        calculatedCPM = impressionsNum > 0 ? (costNum / impressionsNum) * 1000 : 0;
        calculatedImpressions = impressionsNum;
        calculatedCost = costNum;
        break;
      case 'impressions':
        // Calculate impressions from budget and CPM
        calculatedImpressions = cpmNum > 0 ? (budgetNum / cpmNum) * 1000 : 0;
        calculatedCPM = cpmNum;
        calculatedCost = budgetNum;
        break;
      case 'cost':
        // Calculate cost from impressions and CPM
        calculatedCost = (impressionsNum / 1000) * cpmNum;
        calculatedCPM = cpmNum;
        calculatedImpressions = impressionsNum;
        break;
    }

    // Additional metrics
    const costPer1kImpressions = calculatedCPM;
    const costPer10kImpressions = calculatedCPM * 10;
    const costPer100kImpressions = calculatedCPM * 100;
    const costPer1mImpressions = calculatedCPM * 1000;

    // Budget projections
    const impressionsFor100 = cpmNum > 0 ? (100 / cpmNum) * 1000 : 0;
    const impressionsFor500 = cpmNum > 0 ? (500 / cpmNum) * 1000 : 0;
    const impressionsFor1000 = cpmNum > 0 ? (1000 / cpmNum) * 1000 : 0;
    const impressionsFor5000 = cpmNum > 0 ? (5000 / cpmNum) * 1000 : 0;

    // CPM rating
    let rating: string;
    let ratingColor: string;
    const effectiveCPM = calculationMode === 'cpm' ? calculatedCPM : cpmNum;

    if (effectiveCPM <= 2) {
      rating = 'Excellent';
      ratingColor = 'text-green-500';
    } else if (effectiveCPM <= 5) {
      rating = 'Good';
      ratingColor = 'text-teal-500';
    } else if (effectiveCPM <= 10) {
      rating = 'Average';
      ratingColor = 'text-yellow-500';
    } else if (effectiveCPM <= 20) {
      rating = 'Above Average';
      ratingColor = 'text-orange-500';
    } else {
      rating = 'High';
      ratingColor = 'text-red-500';
    }

    return {
      calculatedCPM,
      calculatedImpressions,
      calculatedCost,
      costPer1kImpressions,
      costPer10kImpressions,
      costPer100kImpressions,
      costPer1mImpressions,
      impressionsFor100,
      impressionsFor500,
      impressionsFor1000,
      impressionsFor5000,
      rating,
      ratingColor,
    };
  }, [calculationMode, totalCost, impressions, cpm, budget]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return '$' + num.toFixed(2);
  };

  const industryBenchmarks = [
    { platform: 'Facebook', range: '$5 - $15' },
    { platform: 'Instagram', range: '$5 - $12' },
    { platform: 'YouTube', range: '$2 - $10' },
    { platform: 'Google Display', range: '$0.50 - $4' },
    { platform: 'LinkedIn', range: '$6 - $30' },
    { platform: 'TikTok', range: '$1 - $5' },
    { platform: 'Twitter/X', range: '$3 - $10' },
    { platform: 'Programmatic', range: '$0.50 - $3' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Calculator className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cPMCalculator.cpmCalculator', 'CPM Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cPMCalculator.calculateCostPerMille1000', 'Calculate Cost Per Mille (1000 impressions)')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.cPMCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Calculation Mode */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.cPMCalculator.whatDoYouWantTo', 'What do you want to calculate?')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCalculationMode('cpm')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'cpm' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.cPMCalculator.cpm', 'CPM')}</div>
              <div className="text-xs opacity-75">{t('tools.cPMCalculator.fromCostImpressions', 'From cost & impressions')}</div>
            </button>
            <button
              onClick={() => setCalculationMode('impressions')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'impressions' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.cPMCalculator.impressions', 'Impressions')}</div>
              <div className="text-xs opacity-75">{t('tools.cPMCalculator.fromBudgetCpm', 'From budget & CPM')}</div>
            </button>
            <button
              onClick={() => setCalculationMode('cost')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'cost' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.cPMCalculator.cost', 'Cost')}</div>
              <div className="text-xs opacity-75">{t('tools.cPMCalculator.fromImpressionsCpm', 'From impressions & CPM')}</div>
            </button>
          </div>
        </div>

        {/* Dynamic Inputs based on mode */}
        <div className="grid grid-cols-2 gap-4">
          {calculationMode === 'cpm' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.cPMCalculator.totalAdSpend', 'Total Ad Spend ($)')}
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
                  <Eye className="w-4 h-4 inline mr-1" />
                  {t('tools.cPMCalculator.totalImpressions', 'Total Impressions')}
                </label>
                <input
                  type="number"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  placeholder="100000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}

          {calculationMode === 'impressions' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.cPMCalculator.budget', 'Budget ($)')}
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
                  {t('tools.cPMCalculator.cpmRate', 'CPM Rate ($)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cpm}
                  onChange={(e) => setCpm(e.target.value)}
                  placeholder="5"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}

          {calculationMode === 'cost' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Eye className="w-4 h-4 inline mr-1" />
                  {t('tools.cPMCalculator.targetImpressions', 'Target Impressions')}
                </label>
                <input
                  type="number"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  placeholder="100000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4 inline mr-1" />
                  {t('tools.cPMCalculator.cpmRate2', 'CPM Rate ($)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cpm}
                  onChange={(e) => setCpm(e.target.value)}
                  placeholder="5"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? t('tools.cPMCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {calculationMode === 'cpm' ? 'Your CPM' : calculationMode === 'impressions' ? t('tools.cPMCalculator.projectedImpressions', 'Projected Impressions') : t('tools.cPMCalculator.estimatedCost', 'Estimated Cost')}
          </div>
          <div className="text-5xl font-bold text-[#0D9488] my-2">
            {calculationMode === 'cpm'
              ? formatCurrency(calculations.calculatedCPM)
              : calculationMode === 'impressions'
                ? formatNumber(calculations.calculatedImpressions)
                : formatCurrency(calculations.calculatedCost)}
          </div>
          {calculationMode === 'cpm' && (
            <div className={`text-sm font-medium ${calculations.ratingColor}`}>
              {calculations.rating} CPM Rate
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPMCalculator.totalCost', 'Total Cost')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.calculatedCost)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPMCalculator.impressions2', 'Impressions')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatNumber(calculations.calculatedImpressions)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cPMCalculator.cpm2', 'CPM')}</div>
            <div className="text-xl font-bold text-[#0D9488]">
              {formatCurrency(calculations.calculatedCPM)}
            </div>
          </div>
        </div>

        {/* Cost Scaling */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4" />
            {t('tools.cPMCalculator.costAtScale', 'Cost at Scale')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>1K Impressions</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(calculations.costPer1kImpressions)}</div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>10K Impressions</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(calculations.costPer10kImpressions)}</div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>100K Impressions</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(calculations.costPer100kImpressions)}</div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>1M Impressions</div>
              <div className="font-bold text-[#0D9488]">{formatCurrency(calculations.costPer1mImpressions)}</div>
            </div>
          </div>
        </div>

        {/* Industry Benchmarks */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-4 h-4" />
            {t('tools.cPMCalculator.industryCpmBenchmarks', 'Industry CPM Benchmarks')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {industryBenchmarks.map((benchmark, idx) => (
              <div key={idx} className={`p-2 rounded text-center ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{benchmark.platform}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{benchmark.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cPMCalculator.whatIsCpm', 'What is CPM?')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                CPM (Cost Per Mille) is the cost an advertiser pays for 1,000 impressions of their ad.
                It's a standard metric for measuring the cost-efficiency of ad campaigns, especially
                for brand awareness goals.
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>{t('tools.cPMCalculator.formula', 'Formula:')}</strong> CPM = (Total Cost / Total Impressions) x 1,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPMCalculatorTool;
