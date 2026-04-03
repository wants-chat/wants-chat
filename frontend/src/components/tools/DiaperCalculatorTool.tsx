import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, DollarSign, Calendar, Package, Info, Sparkles, TrendingDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DiaperCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface DiaperResult {
  dailyDiapers: number;
  weeklyDiapers: number;
  monthlyDiapers: number;
  yearlyDiapers: number;
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  currentSize: string;
  sizeRecommendation: string;
  diapersBySize: { size: string; count: number; months: string }[];
  totalFirstYearDiapers: number;
  totalFirstYearCost: number;
}

const diaperSizes = [
  { size: 'Newborn', minWeight: 0, maxWeight: 10, dailyChanges: 10, months: '0-1' },
  { size: 'Size 1', minWeight: 8, maxWeight: 14, dailyChanges: 10, months: '0-3' },
  { size: 'Size 2', minWeight: 12, maxWeight: 18, dailyChanges: 8, months: '2-6' },
  { size: 'Size 3', minWeight: 16, maxWeight: 28, dailyChanges: 7, months: '5-12' },
  { size: 'Size 4', minWeight: 22, maxWeight: 37, dailyChanges: 6, months: '9-18' },
  { size: 'Size 5', minWeight: 27, maxWeight: 45, dailyChanges: 5, months: '15-24+' },
  { size: 'Size 6', minWeight: 35, maxWeight: 50, dailyChanges: 5, months: '24+' },
];

export const DiaperCalculatorTool: React.FC<DiaperCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [ageMonths, setAgeMonths] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [costPerDiaper, setCostPerDiaper] = useState('0.25');
  const [diaperBrand, setDiaperBrand] = useState<'budget' | 'mid' | 'premium'>('mid');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        const numbers = params.content.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          setWeightLbs(numbers[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Update cost per diaper based on brand selection
  useEffect(() => {
    switch (diaperBrand) {
      case 'budget':
        setCostPerDiaper('0.15');
        break;
      case 'mid':
        setCostPerDiaper('0.25');
        break;
      case 'premium':
        setCostPerDiaper('0.40');
        break;
    }
  }, [diaperBrand]);

  const result = useMemo((): DiaperResult | null => {
    const age = parseFloat(ageMonths);
    const weight = parseFloat(weightLbs);
    const cost = parseFloat(costPerDiaper);

    if ((isNaN(age) && isNaN(weight)) || cost <= 0) return null;

    // Find current size based on weight or age
    let currentSizeData = diaperSizes[2]; // Default to Size 2

    if (!isNaN(weight) && weight > 0) {
      currentSizeData = diaperSizes.find(
        (s) => weight >= s.minWeight && weight <= s.maxWeight
      ) || diaperSizes[2];
    } else if (!isNaN(age)) {
      if (age < 1) currentSizeData = diaperSizes[0];
      else if (age < 3) currentSizeData = diaperSizes[1];
      else if (age < 6) currentSizeData = diaperSizes[2];
      else if (age < 12) currentSizeData = diaperSizes[3];
      else if (age < 18) currentSizeData = diaperSizes[4];
      else currentSizeData = diaperSizes[5];
    }

    const dailyDiapers = currentSizeData.dailyChanges;
    const weeklyDiapers = dailyDiapers * 7;
    const monthlyDiapers = dailyDiapers * 30;
    const yearlyDiapers = dailyDiapers * 365;

    // Calculate first year totals by size
    const diapersBySize = [
      { size: 'Newborn', count: 10 * 14, months: 'Weeks 1-2' },       // 2 weeks
      { size: 'Size 1', count: 10 * 60, months: 'Weeks 3-10' },       // ~8 weeks
      { size: 'Size 2', count: 8 * 90, months: 'Months 3-5' },        // ~3 months
      { size: 'Size 3', count: 7 * 180, months: 'Months 6-12' },      // ~6 months
    ];

    const totalFirstYearDiapers = diapersBySize.reduce((sum, s) => sum + s.count, 0);
    const totalFirstYearCost = totalFirstYearDiapers * cost;

    let sizeRecommendation = '';
    if (!isNaN(weight)) {
      if (weight >= currentSizeData.maxWeight - 2) {
        sizeRecommendation = `Baby is near the upper weight limit. Consider moving to the next size soon.`;
      } else if (weight <= currentSizeData.minWeight + 2) {
        sizeRecommendation = `Baby is at the lower end of this size range. This size should work well.`;
      } else {
        sizeRecommendation = `Weight is in the middle of the ${currentSizeData.size} range. Good fit!`;
      }
    }

    return {
      dailyDiapers,
      weeklyDiapers,
      monthlyDiapers,
      yearlyDiapers,
      dailyCost: dailyDiapers * cost,
      weeklyCost: weeklyDiapers * cost,
      monthlyCost: monthlyDiapers * cost,
      yearlyCost: yearlyDiapers * cost,
      currentSize: currentSizeData.size,
      sizeRecommendation,
      diapersBySize,
      totalFirstYearDiapers,
      totalFirstYearCost,
    };
  }, [ageMonths, weightLbs, costPerDiaper]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
          {/* Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <Package className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.diaperCalculator.diaperCalculator', 'Diaper Calculator')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.diaperCalculator.estimateDiaperNeedsAndCosts', 'Estimate diaper needs and costs')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Prefill indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">
                  {t('tools.diaperCalculator.dataLoadedFromYourConversation', 'Data loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Age Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.diaperCalculator.babySAgeMonths', 'Baby\'s Age (months)')}
              </label>
              <input
                type="number"
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value)}
                min="0"
                max="36"
                placeholder="e.g., 6"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.diaperCalculator.babySWeightLbs', 'Baby\'s Weight (lbs)')}
              </label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                min="0"
                step="0.5"
                placeholder="e.g., 15"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Diaper Brand/Price Tier */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.diaperCalculator.diaperPriceRange', 'Diaper Price Range')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'budget', name: 'Budget', price: '$0.15/diaper' },
                  { id: 'mid', name: 'Mid-Range', price: '$0.25/diaper' },
                  { id: 'premium', name: 'Premium', price: '$0.40/diaper' },
                ].map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setDiaperBrand(brand.id as 'budget' | 'mid' | 'premium')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      diaperBrand === brand.id
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div>{brand.name}</div>
                    <div className={`text-xs ${diaperBrand === brand.id ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {brand.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Price Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.diaperCalculator.customPricePerDiaper', 'Custom Price Per Diaper ($)')}
              </label>
              <input
                type="number"
                value={costPerDiaper}
                onChange={(e) => setCostPerDiaper(e.target.value)}
                min="0.01"
                step="0.01"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Results */}
            {result && (
              <>
                {/* Current Size */}
                <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.diaperCalculator.recommendedDiaperSize', 'Recommended Diaper Size')}
                  </div>
                  <div className="text-3xl font-bold text-[#0D9488] my-2">
                    {result.currentSize}
                  </div>
                  {result.sizeRecommendation && (
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {result.sizeRecommendation}
                    </div>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Baby className="w-5 h-5 mx-auto mb-1 text-[#0D9488]" />
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.dailyDiapers}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.diaperCalculator.diapersDay', 'Diapers/Day')}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-[#0D9488]" />
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.monthlyDiapers}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.diaperCalculator.diapersMonth', 'Diapers/Month')}
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <DollarSign className="w-4 h-4 text-[#0D9488]" />
                    {t('tools.diaperCalculator.costEstimates', 'Cost Estimates')}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.diaperCalculator.dailyCost', 'Daily Cost')}</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(result.dailyCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.diaperCalculator.weeklyCost', 'Weekly Cost')}</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(result.weeklyCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.diaperCalculator.monthlyCost', 'Monthly Cost')}</span>
                      <span className={`font-medium text-[#0D9488]`}>
                        {formatCurrency(result.monthlyCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {t('tools.diaperCalculator.yearlyCost', 'Yearly Cost')}
                      </span>
                      <span className={`font-bold text-lg text-[#0D9488]`}>
                        {formatCurrency(result.yearlyCost)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* First Year Breakdown */}
                <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-700' : 'bg-teal-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.diaperCalculator.firstYearOverview', 'First Year Overview')}
                  </h4>
                  <div className="space-y-2">
                    {result.diapersBySize.map((size, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {size.size} ({size.months})
                        </span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ~{size.count.toLocaleString()} diapers
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {t('tools.diaperCalculator.firstYearTotal', 'First Year Total')}
                      </span>
                      <div className="text-right">
                        <div className={`font-bold text-[#0D9488]`}>
                          ~{result.totalFirstYearDiapers.toLocaleString()} diapers
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatCurrency(result.totalFirstYearCost)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Money Saving Tips */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    {t('tools.diaperCalculator.moneySavingTips', 'Money-Saving Tips')}
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.diaperCalculator.buyInBulkWhenOn', 'Buy in bulk when on sale to save 20-30%')}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.diaperCalculator.useStoreBrandsOftenSame', 'Use store brands - often same quality as name brands')}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.diaperCalculator.signUpForDiaperSubscription', 'Sign up for diaper subscription services for discounts')}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.diaperCalculator.donTStockUpToo', 'Don\'t stock up too much on one size - babies grow fast!')}
                      </span>
                    </li>
                  </ul>
                </div>
              </>
            )}

            {/* Diaper Size Guide */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.diaperCalculator.diaperSizeGuide', 'Diaper Size Guide')}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <th className="text-left py-1">{t('tools.diaperCalculator.size', 'Size')}</th>
                      <th className="text-left py-1">{t('tools.diaperCalculator.weightLbs', 'Weight (lbs)')}</th>
                      <th className="text-left py-1">{t('tools.diaperCalculator.changesDay', 'Changes/Day')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diaperSizes.map((size) => (
                      <tr
                        key={size.size}
                        className={`${
                          result?.currentSize === size.size
                            ? isDark
                              ? 'bg-teal-900/30 text-teal-300'
                              : 'bg-teal-100 text-teal-800'
                            : isDark
                            ? 'text-gray-300'
                            : 'text-gray-700'
                        }`}
                      >
                        <td className="py-1 font-medium">{size.size}</td>
                        <td className="py-1">{size.minWeight}-{size.maxWeight}</td>
                        <td className="py-1">{size.dailyChanges}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Note */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.diaperCalculator.theseAreEstimatesBasedOn', 'These are estimates based on average usage. Actual needs vary by baby. Consider cloth diapers as an eco-friendly and cost-saving alternative.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaperCalculatorTool;
