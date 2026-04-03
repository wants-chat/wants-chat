import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Percent, Calendar, Info, Sparkles, Calculator, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RentIncreaseCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const RentIncreaseCalculatorTool: React.FC<RentIncreaseCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [calculationMode, setCalculationMode] = useState<'percentage' | 'amount' | 'market'>('percentage');

  // Percentage mode
  const [currentRent, setCurrentRent] = useState('1500');
  const [increasePercent, setIncreasePercent] = useState('3');

  // Amount mode
  const [newRentAmount, setNewRentAmount] = useState('1545');

  // Market mode
  const [marketRent, setMarketRent] = useState('1600');

  // Common
  const [yearsToProject, setYearsToProject] = useState('5');
  const [inflationRate, setInflationRate] = useState('2.5');

  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.rent !== undefined) {
        setCurrentRent(String(params.rent));
        setIsPrefilled(true);
      }
      if (params.percentage !== undefined) {
        setIncreasePercent(String(params.percentage));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const current = parseFloat(currentRent) || 0;
    const years = parseInt(yearsToProject) || 5;
    const inflation = parseFloat(inflationRate) || 2.5;

    let newRent = 0;
    let increaseAmount = 0;
    let percentageIncrease = 0;

    if (calculationMode === 'percentage') {
      const percent = parseFloat(increasePercent) || 0;
      increaseAmount = current * (percent / 100);
      newRent = current + increaseAmount;
      percentageIncrease = percent;
    } else if (calculationMode === 'amount') {
      newRent = parseFloat(newRentAmount) || 0;
      increaseAmount = newRent - current;
      percentageIncrease = current > 0 ? (increaseAmount / current) * 100 : 0;
    } else {
      newRent = parseFloat(marketRent) || 0;
      increaseAmount = newRent - current;
      percentageIncrease = current > 0 ? (increaseAmount / current) * 100 : 0;
    }

    // Annual impact
    const annualCurrent = current * 12;
    const annualNew = newRent * 12;
    const annualIncrease = annualNew - annualCurrent;

    // Real vs nominal (adjusted for inflation)
    const realIncreasePercent = percentageIncrease - inflation;
    const realAnnualIncrease = annualIncrease - (annualCurrent * (inflation / 100));

    // Projections
    const projections = [];
    let projectedRent = newRent;
    let cumulativeIncrease = 0;

    for (let year = 0; year <= years; year++) {
      if (year === 0) {
        projections.push({
          year: 'Current',
          rent: current,
          annual: current * 12,
          increase: 0,
          cumulative: 0,
        });
      } else {
        const yearIncrease = year === 1 ? increaseAmount : projectedRent * (parseFloat(increasePercent) / 100 || 0.03);
        if (year > 1) {
          projectedRent = projectedRent * (1 + (parseFloat(increasePercent) / 100 || 0.03));
        } else {
          projectedRent = newRent;
        }
        cumulativeIncrease += (projectedRent - (year === 1 ? current : projections[year - 1].rent)) * 12;

        projections.push({
          year: `Year ${year}`,
          rent: projectedRent,
          annual: projectedRent * 12,
          increase: yearIncrease,
          cumulative: cumulativeIncrease,
        });
      }
    }

    // Common increase benchmarks
    const isReasonable = percentageIncrease <= 5;
    const isHighButLegal = percentageIncrease > 5 && percentageIncrease <= 10;
    const isVeryHigh = percentageIncrease > 10;

    return {
      currentRent: current,
      newRent,
      increaseAmount,
      percentageIncrease,
      annualCurrent,
      annualNew,
      annualIncrease,
      realIncreasePercent,
      realAnnualIncrease,
      projections,
      isReasonable,
      isHighButLegal,
      isVeryHigh,
      fiveYearTotal: projections[years]?.cumulative || 0,
    };
  }, [calculationMode, currentRent, increasePercent, newRentAmount, marketRent, yearsToProject, inflationRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRatingInfo = () => {
    if (calculations.isReasonable) {
      return { label: 'Typical Increase', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' };
    }
    if (calculations.isHighButLegal) {
      return { label: 'Above Average', color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' };
    }
    return { label: 'Very High Increase', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' };
  };

  const rating = getRatingInfo();

  const commonIncreases = [
    { label: 'Cost of Living (2-3%)', value: '2.5' },
    { label: 'Moderate (3-5%)', value: '4' },
    { label: 'Above Average (5-7%)', value: '6' },
    { label: 'High (8-10%)', value: '9' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentIncreaseCalculator.rentIncreaseCalculator', 'Rent Increase Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentIncreaseCalculator.calculateAndProjectRentIncreases', 'Calculate and project rent increases')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.rentIncreaseCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Calculation Mode */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calculator className="w-4 h-4 inline mr-1" />
            {t('tools.rentIncreaseCalculator.calculateBy', 'Calculate By')}
          </label>
          <div className="flex gap-2">
            {[
              { value: 'percentage', label: 'Percentage' },
              { value: 'amount', label: 'New Amount' },
              { value: 'market', label: 'Market Rate' },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setCalculationMode(mode.value as any)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  calculationMode === mode.value
                    ? 'bg-[#0D9488] text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Rent */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.rentIncreaseCalculator.currentMonthlyRent', 'Current Monthly Rent')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={currentRent}
              onChange={(e) => setCurrentRent(e.target.value)}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Mode-specific inputs */}
        {calculationMode === 'percentage' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Percent className="w-4 h-4 inline mr-1" />
              {t('tools.rentIncreaseCalculator.increasePercentage', 'Increase Percentage')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={increasePercent}
                onChange={(e) => setIncreasePercent(e.target.value)}
                className={`w-full pl-4 pr-8 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonIncreases.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setIncreasePercent(preset.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg ${
                    increasePercent === preset.value
                      ? 'bg-[#0D9488] text-white'
                      : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {calculationMode === 'amount' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.rentIncreaseCalculator.proposedNewRent', 'Proposed New Rent')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={newRentAmount}
                onChange={(e) => setNewRentAmount(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        )}

        {calculationMode === 'market' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.rentIncreaseCalculator.marketRateForSimilarUnits', 'Market Rate for Similar Units')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={marketRent}
                onChange={(e) => setMarketRent(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        )}

        {/* Result Summary */}
        <div className={`p-6 rounded-xl ${rating.bgColor} border ${rating.borderColor}`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-medium ${rating.color}`}>{rating.label}</span>
            {calculations.isVeryHigh && (
              <div className="flex items-center gap-1 text-red-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">{t('tools.rentIncreaseCalculator.checkLocalRentControlLaws', 'Check local rent control laws')}</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rentIncreaseCalculator.newMonthlyRent', 'New Monthly Rent')}</div>
            <div className={`text-5xl font-bold ${rating.color}`}>
              {formatCurrency(calculations.newRent)}
            </div>
            <div className={`text-lg ${rating.color}`}>
              +{formatCurrency(calculations.increaseAmount)}/mo ({calculations.percentageIncrease.toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Annual Impact */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rentIncreaseCalculator.currentAnnualCost', 'Current Annual Cost')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.annualCurrent)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rentIncreaseCalculator.newAnnualCost', 'New Annual Cost')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">
              {formatCurrency(calculations.annualNew)}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>{t('tools.rentIncreaseCalculator.annualIncrease', 'Annual Increase')}</div>
          <div className="text-2xl font-bold text-red-500">
            +{formatCurrency(calculations.annualIncrease)}/year
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Real increase (after {inflationRate}% inflation): {formatCurrency(calculations.realAnnualIncrease)}
          </div>
        </div>

        {/* Projection Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.rentIncreaseCalculator.yearsToProject', 'Years to Project')}
            </label>
            <select
              value={yearsToProject}
              onChange={(e) => setYearsToProject(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {[1, 2, 3, 5, 10].map((y) => (
                <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.rentIncreaseCalculator.inflationRate', 'Inflation Rate (%)')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                className={`w-full pl-4 pr-8 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
            </div>
          </div>
        </div>

        {/* Projections Table */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Rent Projections (assuming {increasePercent}% annual increases)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2">{t('tools.rentIncreaseCalculator.year', 'Year')}</th>
                  <th className="text-right py-2">{t('tools.rentIncreaseCalculator.monthlyRent', 'Monthly Rent')}</th>
                  <th className="text-right py-2">{t('tools.rentIncreaseCalculator.annualCost', 'Annual Cost')}</th>
                  <th className="text-right py-2">{t('tools.rentIncreaseCalculator.cumulativeExtra', 'Cumulative Extra')}</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {calculations.projections.map((row, index) => (
                  <tr key={index} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-2">{row.year}</td>
                    <td className="text-right py-2">{formatCurrency(row.rent)}</td>
                    <td className="text-right py-2">{formatCurrency(row.annual)}</td>
                    <td className={`text-right py-2 ${row.cumulative > 0 ? 'text-red-500' : ''}`}>
                      {row.cumulative > 0 ? `+${formatCurrency(row.cumulative)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Extra Cost */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Extra Cost Over {yearsToProject} Years
          </div>
          <div className="text-2xl font-bold text-red-500">
            +{formatCurrency(calculations.fiveYearTotal)}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.rentIncreaseCalculator.knowYourRights', 'Know Your Rights:')}</strong> Many areas have rent control or stabilization laws that limit annual increases (typically 3-10%). Check local regulations before accepting large increases. You may be able to negotiate or request repairs in exchange for increases.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentIncreaseCalculatorTool;
