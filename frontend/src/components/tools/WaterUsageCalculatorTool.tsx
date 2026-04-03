import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Shower, Home, Leaf, DollarSign, Info, TrendingDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface WaterUsageCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface WaterUsage {
  id: string;
  name: string;
  category: string;
  gallonsPerUse: number;
  usesPerDay: number;
  icon: string;
}

export const WaterUsageCalculatorTool: React.FC<WaterUsageCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [householdSize, setHouseholdSize] = useState('3');
  const [waterRate, setWaterRate] = useState('0.005');
  const [showTips, setShowTips] = useState(false);

  const [usages, setUsages] = useState<WaterUsage[]>([
    { id: '1', name: 'Shower', category: 'Bathroom', gallonsPerUse: 17, usesPerDay: 1, icon: 'shower' },
    { id: '2', name: 'Bath', category: 'Bathroom', gallonsPerUse: 36, usesPerDay: 0.1, icon: 'bath' },
    { id: '3', name: 'Toilet Flush', category: 'Bathroom', gallonsPerUse: 1.6, usesPerDay: 6, icon: 'toilet' },
    { id: '4', name: 'Brushing Teeth', category: 'Bathroom', gallonsPerUse: 2, usesPerDay: 2, icon: 'teeth' },
    { id: '5', name: 'Hand Washing', category: 'Bathroom', gallonsPerUse: 1, usesPerDay: 8, icon: 'hands' },
    { id: '6', name: 'Dishwasher', category: 'Kitchen', gallonsPerUse: 6, usesPerDay: 0.5, icon: 'dishes' },
    { id: '7', name: 'Hand Washing Dishes', category: 'Kitchen', gallonsPerUse: 20, usesPerDay: 0.5, icon: 'sink' },
    { id: '8', name: 'Washing Machine', category: 'Laundry', gallonsPerUse: 20, usesPerDay: 0.3, icon: 'washer' },
    { id: '9', name: 'Lawn Watering', category: 'Outdoor', gallonsPerUse: 1000, usesPerDay: 0.14, icon: 'lawn' },
    { id: '10', name: 'Car Washing', category: 'Outdoor', gallonsPerUse: 100, usesPerDay: 0.03, icon: 'car' },
  ]);

  const updateUsage = (id: string, field: 'gallonsPerUse' | 'usesPerDay', value: string) => {
    setUsages(
      usages.map((u) =>
        u.id === id ? { ...u, [field]: parseFloat(value) || 0 } : u
      )
    );
  };

  const calculations = useMemo(() => {
    const household = parseInt(householdSize) || 1;
    const rate = parseFloat(waterRate) || 0.005;

    let dailyGallons = 0;
    const categoryBreakdown: Record<string, number> = {};

    usages.forEach((usage) => {
      const dailyUsage = usage.gallonsPerUse * usage.usesPerDay * household;
      dailyGallons += dailyUsage;

      if (!categoryBreakdown[usage.category]) {
        categoryBreakdown[usage.category] = 0;
      }
      categoryBreakdown[usage.category] += dailyUsage;
    });

    const monthlyGallons = dailyGallons * 30;
    const yearlyGallons = dailyGallons * 365;
    const monthlyCost = monthlyGallons * rate;
    const yearlyCost = yearlyGallons * rate;

    // Calculate potential savings
    const efficientDailyGallons = dailyGallons * 0.65; // 35% reduction with efficiency measures
    const potentialYearlySavings = (yearlyGallons - efficientDailyGallons * 365) * rate;

    // US average comparison (80-100 gallons per person per day)
    const usAverage = 80 * household;
    const comparedToAverage = ((dailyGallons - usAverage) / usAverage) * 100;

    return {
      daily: dailyGallons,
      monthly: monthlyGallons,
      yearly: yearlyGallons,
      monthlyCost,
      yearlyCost,
      perPerson: dailyGallons / household,
      categoryBreakdown,
      usAverage,
      comparedToAverage,
      potentialYearlySavings,
      efficientDailyGallons,
    };
  }, [usages, householdSize, waterRate]);

  const categories = ['Bathroom', 'Kitchen', 'Laundry', 'Outdoor'];
  const categoryColors: Record<string, string> = {
    Bathroom: 'bg-blue-500',
    Kitchen: 'bg-green-500',
    Laundry: 'bg-purple-500',
    Outdoor: 'bg-amber-500',
  };

  const waterSavingTips = [
    { tip: 'Install low-flow showerheads', savings: '2.5 gal/min saved', category: 'Bathroom' },
    { tip: 'Fix leaky faucets promptly', savings: 'Up to 20 gal/day', category: 'General' },
    { tip: 'Turn off water while brushing teeth', savings: '4 gal/day', category: 'Bathroom' },
    { tip: 'Run dishwasher only when full', savings: '15 gal/load', category: 'Kitchen' },
    { tip: 'Install dual-flush toilets', savings: '3-4 gal/flush', category: 'Bathroom' },
    { tip: 'Use mulch in garden beds', savings: 'Reduces watering 50%', category: 'Outdoor' },
    { tip: 'Water lawn in early morning', savings: 'Reduces evaporation 30%', category: 'Outdoor' },
    { tip: 'Take shorter showers (5 min)', savings: '10-15 gal/shower', category: 'Bathroom' },
    { tip: 'Use high-efficiency washing machine', savings: '15 gal/load', category: 'Laundry' },
    { tip: 'Collect rainwater for plants', savings: 'Varies by location', category: 'Outdoor' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Droplets className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterUsageCalculator.waterUsageCalculator', 'Water Usage Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.waterUsageCalculator.trackAndOptimizeYourHousehold', 'Track and optimize your household water consumption')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Home className="w-4 h-4 inline mr-1" />
              {t('tools.waterUsageCalculator.householdSize', 'Household Size')}
            </label>
            <select
              value={householdSize}
              onChange={(e) => setHouseholdSize(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'person' : 'people'}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.waterUsageCalculator.waterRateGallon', 'Water Rate ($/gallon)')}
            </label>
            <input
              type="number"
              step="0.001"
              value={waterRate}
              onChange={(e) => setWaterRate(e.target.value)}
              placeholder="0.005"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
        </div>

        {/* Usage Summary */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.waterUsageCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.waterUsageCalculator.dailyUsage', 'Daily Usage')}</div>
              <div className="text-xl font-bold text-[#0D9488]">{calculations.daily.toFixed(0)} gal</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.waterUsageCalculator.monthlyUsage', 'Monthly Usage')}</div>
              <div className="text-xl font-bold text-[#0D9488]">{calculations.monthly.toFixed(0)} gal</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.waterUsageCalculator.monthlyCost', 'Monthly Cost')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.monthlyCost.toFixed(2)}</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.waterUsageCalculator.perPerson', 'Per Person')}</div>
              <div className="text-xl font-bold text-[#0D9488]">{calculations.perPerson.toFixed(0)} gal/day</div>
            </div>
          </div>
        </div>

        {/* Comparison to Average */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterUsageCalculator.comparedToUsAverage', 'Compared to US Average')}</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Your Usage: {calculations.daily.toFixed(0)} gal/day</span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>US Avg: {calculations.usAverage} gal/day</span>
            </div>
            <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-full rounded-full transition-all ${
                  calculations.comparedToAverage < 0 ? 'bg-green-500' : calculations.comparedToAverage < 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (calculations.daily / (calculations.usAverage * 1.5)) * 100)}%` }}
              />
            </div>
            <p className={`text-sm ${calculations.comparedToAverage < 0 ? 'text-green-500' : 'text-amber-500'}`}>
              {calculations.comparedToAverage < 0
                ? `${Math.abs(calculations.comparedToAverage).toFixed(0)}% below average - Great job!`
                : `${calculations.comparedToAverage.toFixed(0)}% above average`}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterUsageCalculator.usageByCategory', 'Usage by Category')}</h4>
          <div className="space-y-3">
            {categories.map((category) => {
              const categoryUsage = calculations.categoryBreakdown[category] || 0;
              const percentage = calculations.daily > 0 ? (categoryUsage / calculations.daily) * 100 : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{category}</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {categoryUsage.toFixed(0)} gal ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${categoryColors[category]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Usage Table */}
        <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`grid grid-cols-12 gap-2 p-3 text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
            <div className="col-span-4">{t('tools.waterUsageCalculator.activity', 'Activity')}</div>
            <div className="col-span-3 text-center">{t('tools.waterUsageCalculator.galUse', 'Gal/Use')}</div>
            <div className="col-span-3 text-center">{t('tools.waterUsageCalculator.usesDay', 'Uses/Day')}</div>
            <div className="col-span-2 text-center">{t('tools.waterUsageCalculator.daily', 'Daily')}</div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {usages.map((usage) => {
              const dailyUsage = usage.gallonsPerUse * usage.usesPerDay * parseInt(householdSize);
              return (
                <div
                  key={usage.id}
                  className={`grid grid-cols-12 gap-2 p-3 text-sm items-center ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'} border-t`}
                >
                  <div className={`col-span-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${categoryColors[usage.category]}`}></span>
                    {usage.name}
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.1"
                      value={usage.gallonsPerUse}
                      onChange={(e) => updateUsage(usage.id, 'gallonsPerUse', e.target.value)}
                      className={`w-full px-2 py-1 text-center text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.1"
                      value={usage.usesPerDay}
                      onChange={(e) => updateUsage(usage.id, 'usesPerDay', e.target.value)}
                      className={`w-full px-2 py-1 text-center text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div className={`col-span-2 text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {dailyUsage.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Potential Savings */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h4 className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>{t('tools.waterUsageCalculator.potentialSavingsWithEfficiencyMeasures', 'Potential Savings with Efficiency Measures')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.waterUsageCalculator.waterSavings', 'Water Savings')}</div>
              <div className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                {((calculations.daily - calculations.efficientDailyGallons) * 365).toFixed(0)} gal/year
              </div>
            </div>
            <div>
              <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.waterUsageCalculator.costSavings', 'Cost Savings')}</div>
              <div className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                ${calculations.potentialYearlySavings.toFixed(2)}/year
              </div>
            </div>
          </div>
        </div>

        {/* Water Saving Tips */}
        <div className="space-y-3">
          <button
            onClick={() => setShowTips(!showTips)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
          >
            <div className="flex items-center gap-2">
              <TrendingDown className={`w-5 h-5 ${isDark ? t('tools.waterUsageCalculator.text0d9488', 'text-[#0D9488]') : t('tools.waterUsageCalculator.text0d94882', 'text-[#0D9488]')}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.waterUsageCalculator.waterSavingTips', 'Water Saving Tips')}</span>
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {showTips ? t('tools.waterUsageCalculator.hide', 'Hide') : t('tools.waterUsageCalculator.show', 'Show')}
            </span>
          </button>

          {showTips && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {waterSavingTips.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                  >
                    <div className="flex items-start gap-2">
                      <Droplets className={`w-4 h-4 mt-0.5 text-[#0D9488]`} />
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.tip}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Saves: {item.savings}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.waterUsageCalculator.note', 'Note:')}</strong> Default values are US averages. Adjust based on your actual usage patterns.
              Water rates vary by location - check your utility bill for accurate pricing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterUsageCalculatorTool;
