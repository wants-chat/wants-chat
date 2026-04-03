import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, DollarSign, TrendingUp, Calculator, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CapRateCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const CapRateCalculatorTool: React.FC<CapRateCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [calculationMode, setCalculationMode] = useState<'capRate' | 'value' | 'noi'>('capRate');

  // Cap Rate mode inputs
  const [propertyValue, setPropertyValue] = useState('500000');
  const [annualRent, setAnnualRent] = useState('48000');
  const [vacancyRate, setVacancyRate] = useState('5');
  const [operatingExpenses, setOperatingExpenses] = useState('12000');

  // Value mode inputs
  const [targetCapRate, setTargetCapRate] = useState('6');
  const [noiForValue, setNoiForValue] = useState('30000');

  // NOI mode inputs
  const [capRateForNoi, setCapRateForNoi] = useState('6');
  const [valueForNoi, setValueForNoi] = useState('500000');

  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.price !== undefined || params.amount !== undefined) {
        setPropertyValue(String(params.price || params.amount));
        setIsPrefilled(true);
      }
      if (params.rent !== undefined) {
        setAnnualRent(String(params.rent * 12));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    if (calculationMode === 'capRate') {
      const value = parseFloat(propertyValue) || 0;
      const rent = parseFloat(annualRent) || 0;
      const vacancy = parseFloat(vacancyRate) || 0;
      const expenses = parseFloat(operatingExpenses) || 0;

      const effectiveGrossIncome = rent * (1 - vacancy / 100);
      const noi = effectiveGrossIncome - expenses;
      const capRate = value > 0 ? (noi / value) * 100 : 0;
      const expenseRatio = rent > 0 ? (expenses / rent) * 100 : 0;

      return {
        mode: 'capRate',
        capRate,
        noi,
        effectiveGrossIncome,
        expenseRatio,
        propertyValue: value,
      };
    } else if (calculationMode === 'value') {
      const noi = parseFloat(noiForValue) || 0;
      const capRate = parseFloat(targetCapRate) || 0;
      const estimatedValue = capRate > 0 ? (noi / (capRate / 100)) : 0;

      return {
        mode: 'value',
        capRate,
        noi,
        propertyValue: estimatedValue,
        effectiveGrossIncome: 0,
        expenseRatio: 0,
      };
    } else {
      const value = parseFloat(valueForNoi) || 0;
      const capRate = parseFloat(capRateForNoi) || 0;
      const requiredNoi = value * (capRate / 100);

      return {
        mode: 'noi',
        capRate,
        noi: requiredNoi,
        propertyValue: value,
        effectiveGrossIncome: 0,
        expenseRatio: 0,
      };
    }
  }, [calculationMode, propertyValue, annualRent, vacancyRate, operatingExpenses, targetCapRate, noiForValue, capRateForNoi, valueForNoi]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCapRateRating = (rate: number) => {
    if (rate >= 10) return { label: 'Excellent', color: 'text-green-500' };
    if (rate >= 8) return { label: 'Very Good', color: 'text-[#0D9488]' };
    if (rate >= 6) return { label: 'Good', color: 'text-blue-500' };
    if (rate >= 4) return { label: 'Fair', color: 'text-amber-500' };
    return { label: 'Low', color: 'text-red-500' };
  };

  const rating = getCapRateRating(calculations.capRate);

  const marketComparisons = [
    { type: 'Class A Apartments', range: '4-5%' },
    { type: 'Class B Apartments', range: '5-7%' },
    { type: 'Class C Apartments', range: '7-10%' },
    { type: 'Retail', range: '5-8%' },
    { type: 'Office', range: '5-8%' },
    { type: 'Industrial', range: '5-7%' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Building className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.capRateCalculator.capRateCalculator', 'Cap Rate Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.capRateCalculator.capitalizationRateForRealEstate', 'Capitalization rate for real estate investments')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.capRateCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Calculation Mode Selector */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calculator className="w-4 h-4 inline mr-1" />
            {t('tools.capRateCalculator.calculate', 'Calculate')}
          </label>
          <div className="flex gap-2">
            {[
              { value: 'capRate', label: 'Cap Rate' },
              { value: 'value', label: 'Property Value' },
              { value: 'noi', label: 'Required NOI' },
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

        {/* Cap Rate Mode Inputs */}
        {calculationMode === 'capRate' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.capRateCalculator.propertyValue', 'Property Value')}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                  <input
                    type="number"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.capRateCalculator.annualGrossRent', 'Annual Gross Rent')}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                  <input
                    type="number"
                    value={annualRent}
                    onChange={(e) => setAnnualRent(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.capRateCalculator.vacancyRate', 'Vacancy Rate (%)')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={vacancyRate}
                    onChange={(e) => setVacancyRate(e.target.value)}
                    className={`w-full pl-4 pr-8 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.capRateCalculator.annualOperatingExpenses', 'Annual Operating Expenses')}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                  <input
                    type="number"
                    value={operatingExpenses}
                    onChange={(e) => setOperatingExpenses(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Value Mode Inputs */}
        {calculationMode === 'value' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.capRateCalculator.netOperatingIncomeNoi2', 'Net Operating Income (NOI)')}
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={noiForValue}
                  onChange={(e) => setNoiForValue(e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.capRateCalculator.targetCapRate', 'Target Cap Rate (%)')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={targetCapRate}
                  onChange={(e) => setTargetCapRate(e.target.value)}
                  className={`w-full pl-4 pr-8 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
              </div>
            </div>
          </div>
        )}

        {/* NOI Mode Inputs */}
        {calculationMode === 'noi' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.capRateCalculator.propertyValue2', 'Property Value')}
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={valueForNoi}
                  onChange={(e) => setValueForNoi(e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.capRateCalculator.desiredCapRate', 'Desired Cap Rate (%)')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={capRateForNoi}
                  onChange={(e) => setCapRateForNoi(e.target.value)}
                  className={`w-full pl-4 pr-8 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? t('tools.capRateCalculator.bg0d948820Border0d9488', 'bg-[#0D9488]/20 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className="text-center mb-4">
            {calculationMode === 'capRate' && (
              <>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.capRateCalculator.capitalizationRate', 'Capitalization Rate')}</div>
                <div className={`text-5xl font-bold ${rating.color}`}>
                  {calculations.capRate.toFixed(2)}%
                </div>
                <div className={`text-lg ${rating.color}`}>{rating.label}</div>
              </>
            )}
            {calculationMode === 'value' && (
              <>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.capRateCalculator.estimatedPropertyValue', 'Estimated Property Value')}</div>
                <div className="text-5xl font-bold text-[#0D9488]">
                  {formatCurrency(calculations.propertyValue)}
                </div>
                <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  at {calculations.capRate}% cap rate
                </div>
              </>
            )}
            {calculationMode === 'noi' && (
              <>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.capRateCalculator.requiredNoi', 'Required NOI')}</div>
                <div className="text-5xl font-bold text-[#0D9488]">
                  {formatCurrency(calculations.noi)}
                </div>
                <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  to achieve {calculations.capRate}% cap rate
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Metrics (Cap Rate Mode) */}
        {calculationMode === 'capRate' && (
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.capRateCalculator.netOperatingIncomeNoi', 'Net Operating Income (NOI)')}</div>
              <div className="text-2xl font-bold text-[#0D9488]">{formatCurrency(calculations.noi)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.capRateCalculator.annual', 'Annual')}</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.capRateCalculator.expenseRatio', 'Expense Ratio')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.expenseRatio.toFixed(1)}%
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.capRateCalculator.ofGrossRent', 'Of gross rent')}</div>
            </div>
          </div>
        )}

        {/* Market Comparisons */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4 inline mr-2" />
            {t('tools.capRateCalculator.typicalCapRateRanges', 'Typical Cap Rate Ranges')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {marketComparisons.map((item) => (
              <div key={item.type} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.type}</div>
                <div className="text-[#0D9488] font-bold">{item.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Formula */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.capRateCalculator.capRateFormula', 'Cap Rate Formula')}
          </h4>
          <div className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div><strong>{t('tools.capRateCalculator.capRate', 'Cap Rate')}</strong> = (NOI / Property Value) x 100</div>
            <div className="mt-1"><strong>{t('tools.capRateCalculator.noi', 'NOI')}</strong> = Effective Gross Income - Operating Expenses</div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.capRateCalculator.aboutCapRate', 'About Cap Rate:')}</strong> The capitalization rate is a key metric for comparing real estate investments. Higher cap rates generally indicate higher risk and potentially higher returns. Cap rates vary by property type, location, and market conditions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapRateCalculatorTool;
