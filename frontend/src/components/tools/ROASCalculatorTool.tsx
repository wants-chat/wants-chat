import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Target, Sparkles, BarChart3, Calculator, Info, ArrowUpRight, PieChart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ROASCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculationMode = 'roas' | 'revenue' | 'adspend';

export const ROASCalculatorTool: React.FC<ROASCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [calculationMode, setCalculationMode] = useState<CalculationMode>('roas');
  const [adSpend, setAdSpend] = useState('1000');
  const [revenue, setRevenue] = useState('4000');
  const [targetROAS, setTargetROAS] = useState('4');
  const [targetRevenue, setTargetRevenue] = useState('10000');
  const [profitMargin, setProfitMargin] = useState('40');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.adSpend !== undefined) {
        setAdSpend(String(params.adSpend));
        setIsPrefilled(true);
      }
      if (params.revenue !== undefined) {
        setRevenue(String(params.revenue));
        setIsPrefilled(true);
      }
      if (params.roas !== undefined) {
        setTargetROAS(String(params.roas));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setRevenue(String(params.numbers[0]));
        if (params.numbers.length > 1) setAdSpend(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const adSpendNum = parseFloat(adSpend) || 0;
    const revenueNum = parseFloat(revenue) || 0;
    const targetROASNum = parseFloat(targetROAS) || 0;
    const targetRevenueNum = parseFloat(targetRevenue) || 0;
    const profitMarginNum = parseFloat(profitMargin) || 0;

    let calculatedROAS = 0;
    let calculatedRevenue = 0;
    let calculatedAdSpend = 0;

    switch (calculationMode) {
      case 'roas':
        calculatedROAS = adSpendNum > 0 ? revenueNum / adSpendNum : 0;
        calculatedRevenue = revenueNum;
        calculatedAdSpend = adSpendNum;
        break;
      case 'revenue':
        calculatedRevenue = adSpendNum * targetROASNum;
        calculatedROAS = targetROASNum;
        calculatedAdSpend = adSpendNum;
        break;
      case 'adspend':
        calculatedAdSpend = targetROASNum > 0 ? targetRevenueNum / targetROASNum : 0;
        calculatedROAS = targetROASNum;
        calculatedRevenue = targetRevenueNum;
        break;
    }

    // Profitability calculations
    const grossProfit = calculatedRevenue * (profitMarginNum / 100);
    const netProfit = grossProfit - calculatedAdSpend;
    const netProfitMargin = calculatedRevenue > 0 ? (netProfit / calculatedRevenue) * 100 : 0;
    const roi = calculatedAdSpend > 0 ? ((netProfit) / calculatedAdSpend) * 100 : 0;

    // Break-even ROAS
    const breakEvenROAS = profitMarginNum > 0 ? 100 / profitMarginNum : 0;

    // ROAS rating
    let rating: string;
    let ratingColor: string;
    const effectiveROAS = calculatedROAS;

    if (effectiveROAS >= 5) {
      rating = 'Excellent';
      ratingColor = 'text-green-500';
    } else if (effectiveROAS >= 4) {
      rating = 'Very Good';
      ratingColor = 'text-teal-500';
    } else if (effectiveROAS >= 3) {
      rating = 'Good';
      ratingColor = 'text-blue-500';
    } else if (effectiveROAS >= 2) {
      rating = 'Average';
      ratingColor = 'text-yellow-500';
    } else if (effectiveROAS >= breakEvenROAS) {
      rating = 'Break Even';
      ratingColor = 'text-orange-500';
    } else {
      rating = 'Unprofitable';
      ratingColor = 'text-red-500';
    }

    // ROAS scenarios
    const roasScenarios = [2, 3, 4, 5, 6, 8].map(roas => ({
      roas,
      revenue: calculatedAdSpend * roas,
      profit: (calculatedAdSpend * roas * (profitMarginNum / 100)) - calculatedAdSpend,
    }));

    // Spending efficiency
    const costPerDollarRevenue = calculatedRevenue > 0 ? calculatedAdSpend / calculatedRevenue : 0;
    const revenuePerDollarSpent = calculatedROAS;

    return {
      calculatedROAS,
      calculatedRevenue,
      calculatedAdSpend,
      grossProfit,
      netProfit,
      netProfitMargin,
      roi,
      breakEvenROAS,
      rating,
      ratingColor,
      roasScenarios,
      costPerDollarRevenue,
      revenuePerDollarSpent,
      isProfitable: calculatedROAS >= breakEvenROAS,
    };
  }, [calculationMode, adSpend, revenue, targetROAS, targetRevenue, profitMargin]);

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
    return '$' + num.toFixed(2);
  };

  const industryBenchmarks = [
    { industry: 'E-commerce', roas: '4:1 - 10:1' },
    { industry: 'Lead Gen', roas: '5:1 - 15:1' },
    { industry: 'SaaS', roas: '3:1 - 7:1' },
    { industry: 'Fashion', roas: '4:1 - 8:1' },
    { industry: 'Electronics', roas: '3:1 - 6:1' },
    { industry: 'Home Goods', roas: '4:1 - 8:1' },
    { industry: 'Beauty', roas: '5:1 - 10:1' },
    { industry: 'B2B Services', roas: '4:1 - 12:1' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rOASCalculator.roasCalculator', 'ROAS Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rOASCalculator.calculateReturnOnAdSpend', 'Calculate Return on Ad Spend')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.rOASCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Calculation Mode */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.rOASCalculator.whatDoYouWantTo', 'What do you want to calculate?')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCalculationMode('roas')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'roas' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.rOASCalculator.roas', 'ROAS')}</div>
              <div className="text-xs opacity-75">{t('tools.rOASCalculator.fromRevenueSpend', 'From revenue & spend')}</div>
            </button>
            <button
              onClick={() => setCalculationMode('revenue')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'revenue' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.rOASCalculator.revenue', 'Revenue')}</div>
              <div className="text-xs opacity-75">{t('tools.rOASCalculator.fromSpendTargetRoas', 'From spend & target ROAS')}</div>
            </button>
            <button
              onClick={() => setCalculationMode('adspend')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'adspend' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.rOASCalculator.adSpend', 'Ad Spend')}</div>
              <div className="text-xs opacity-75">{t('tools.rOASCalculator.forRevenueGoal', 'For revenue goal')}</div>
            </button>
          </div>
        </div>

        {/* Dynamic Inputs */}
        <div className="grid grid-cols-2 gap-4">
          {calculationMode === 'roas' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <ArrowUpRight className="w-4 h-4 inline mr-1" />
                  {t('tools.rOASCalculator.revenue4', 'Revenue ($)')}
                </label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="4000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.rOASCalculator.adSpend3', 'Ad Spend ($)')}
                </label>
                <input
                  type="number"
                  value={adSpend}
                  onChange={(e) => setAdSpend(e.target.value)}
                  placeholder="1000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}

          {calculationMode === 'revenue' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.rOASCalculator.adSpend4', 'Ad Spend ($)')}
                </label>
                <input
                  type="number"
                  value={adSpend}
                  onChange={(e) => setAdSpend(e.target.value)}
                  placeholder="1000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4 inline mr-1" />
                  {t('tools.rOASCalculator.targetRoasX', 'Target ROAS (x)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetROAS}
                  onChange={(e) => setTargetROAS(e.target.value)}
                  placeholder="4"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}

          {calculationMode === 'adspend' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <ArrowUpRight className="w-4 h-4 inline mr-1" />
                  {t('tools.rOASCalculator.targetRevenue', 'Target Revenue ($)')}
                </label>
                <input
                  type="number"
                  value={targetRevenue}
                  onChange={(e) => setTargetRevenue(e.target.value)}
                  placeholder="10000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4 inline mr-1" />
                  {t('tools.rOASCalculator.expectedRoasX', 'Expected ROAS (x)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetROAS}
                  onChange={(e) => setTargetROAS(e.target.value)}
                  placeholder="4"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}
        </div>

        {/* Profit Margin Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <PieChart className="w-4 h-4 inline mr-1" />
            {t('tools.rOASCalculator.productProfitMargin', 'Product Profit Margin (%)')}
          </label>
          <input
            type="number"
            step="1"
            value={profitMargin}
            onChange={(e) => setProfitMargin(e.target.value)}
            placeholder="40"
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
          />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Your break-even ROAS is {calculations.breakEvenROAS.toFixed(2)}x at this margin
          </p>
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${calculations.isProfitable ? (isDark ? t('tools.rOASCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200') : (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200')} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {calculationMode === 'roas' ? 'Your ROAS' : calculationMode === 'revenue' ? t('tools.rOASCalculator.expectedRevenue', 'Expected Revenue') : t('tools.rOASCalculator.requiredAdSpend', 'Required Ad Spend')}
          </div>
          <div className={`text-5xl font-bold my-2 ${calculations.isProfitable ? t('tools.rOASCalculator.text0d9488', 'text-[#0D9488]') : 'text-red-500'}`}>
            {calculationMode === 'roas'
              ? calculations.calculatedROAS.toFixed(2) + 'x'
              : calculationMode === 'revenue'
                ? formatCurrency(calculations.calculatedRevenue)
                : formatCurrency(calculations.calculatedAdSpend)}
          </div>
          <div className={`text-sm font-medium ${calculations.ratingColor}`}>
            {calculations.rating}
          </div>
          {calculationMode === 'roas' && (
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Every $1 spent generates ${calculations.calculatedROAS.toFixed(2)} in revenue
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOASCalculator.adSpend2', 'Ad Spend')}</div>
            <div className={`text-xl font-bold text-red-500`}>
              {formatCurrency(calculations.calculatedAdSpend)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOASCalculator.revenue2', 'Revenue')}</div>
            <div className="text-xl font-bold text-green-500">
              {formatCurrency(calculations.calculatedRevenue)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOASCalculator.grossProfit', 'Gross Profit')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.grossProfit)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOASCalculator.netProfit', 'Net Profit')}</div>
            <div className={`text-xl font-bold ${calculations.netProfit >= 0 ? t('tools.rOASCalculator.text0d94882', 'text-[#0D9488]') : 'text-red-500'}`}>
              {formatCurrency(calculations.netProfit)}
            </div>
          </div>
        </div>

        {/* Profitability Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOASCalculator.breakEvenRoas', 'Break-even ROAS')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.breakEvenROAS.toFixed(2)}x
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOASCalculator.netMargin', 'Net Margin')}</div>
            <div className={`text-xl font-bold ${calculations.netProfitMargin >= 0 ? t('tools.rOASCalculator.text0d94883', 'text-[#0D9488]') : 'text-red-500'}`}>
              {calculations.netProfitMargin.toFixed(1)}%
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rOASCalculator.roi', 'ROI')}</div>
            <div className={`text-xl font-bold ${calculations.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {calculations.roi.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* ROAS Scenarios */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-4 h-4" />
            {t('tools.rOASCalculator.roasScenarioAnalysis', 'ROAS Scenario Analysis')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <th className="text-left py-2">{t('tools.rOASCalculator.roas2', 'ROAS')}</th>
                  <th className="text-right py-2">{t('tools.rOASCalculator.revenue3', 'Revenue')}</th>
                  <th className="text-right py-2">{t('tools.rOASCalculator.netProfit2', 'Net Profit')}</th>
                </tr>
              </thead>
              <tbody>
                {calculations.roasScenarios.map((scenario, idx) => (
                  <tr key={idx} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`py-2 font-medium ${scenario.roas === Math.round(calculations.calculatedROAS) ? 'text-[#0D9488]' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {scenario.roas}x {scenario.roas === Math.round(calculations.calculatedROAS) && '(current)'}
                    </td>
                    <td className={`py-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatCurrency(scenario.revenue)}
                    </td>
                    <td className={`py-2 text-right ${scenario.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(scenario.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Industry Benchmarks */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Target className="w-4 h-4" />
            {t('tools.rOASCalculator.industryRoasBenchmarks', 'Industry ROAS Benchmarks')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {industryBenchmarks.map((benchmark, idx) => (
              <div key={idx} className={`p-2 rounded text-center ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{benchmark.industry}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{benchmark.roas}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rOASCalculator.improveYourRoas', 'Improve Your ROAS')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>* Optimize ad targeting to reach high-intent buyers</li>
            <li>* Improve landing page conversion rates</li>
            <li>* Increase average order value with upsells</li>
            <li>* Retarget visitors who didn't convert</li>
            <li>* Pause underperforming ad sets</li>
          </ul>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rOASCalculator.whatIsRoas', 'What is ROAS?')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ROAS (Return on Ad Spend) measures the revenue generated for every dollar spent on advertising.
                A ROAS of 4x means you earn $4 for every $1 spent on ads.
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>{t('tools.rOASCalculator.formula', 'Formula:')}</strong> ROAS = Revenue / Ad Spend
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>{t('tools.rOASCalculator.note', 'Note:')}</strong> ROAS doesn't account for profit margins. A 4x ROAS with 25% margins means break-even.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROASCalculatorTool;
