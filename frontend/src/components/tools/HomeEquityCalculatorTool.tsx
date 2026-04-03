import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, DollarSign, TrendingUp, Info, Sparkles, PiggyBank } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HomeEquityCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const HomeEquityCalculatorTool: React.FC<HomeEquityCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homeValue, setHomeValue] = useState('400000');
  const [mortgageBalance, setMortgageBalance] = useState('250000');
  const [additionalLoans, setAdditionalLoans] = useState('0');
  const [appreciationRate, setAppreciationRate] = useState('3');
  const [yearsToProject, setYearsToProject] = useState('5');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined || params.price !== undefined) {
        setHomeValue(String(params.price || params.amount));
        setIsPrefilled(true);
      }
      if (params.mortgageBalance !== undefined) {
        setMortgageBalance(String(params.mortgageBalance));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length >= 2) {
        setHomeValue(String(params.numbers[0]));
        setMortgageBalance(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const value = parseFloat(homeValue) || 0;
    const mortgage = parseFloat(mortgageBalance) || 0;
    const otherLoans = parseFloat(additionalLoans) || 0;
    const appreciation = parseFloat(appreciationRate) || 0;
    const years = parseInt(yearsToProject) || 5;

    const totalDebt = mortgage + otherLoans;
    const currentEquity = value - totalDebt;
    const equityPercentage = value > 0 ? (currentEquity / value) * 100 : 0;
    const ltvRatio = value > 0 ? (totalDebt / value) * 100 : 0;

    // Project future values
    const projections = [];
    for (let year = 0; year <= years; year++) {
      const futureValue = value * Math.pow(1 + appreciation / 100, year);
      // Assume mortgage decreases by roughly 5% per year (simplified)
      const futureMortgage = mortgage * Math.pow(0.95, year);
      const futureEquity = futureValue - futureMortgage - otherLoans;
      const futureEquityPercent = futureValue > 0 ? (futureEquity / futureValue) * 100 : 0;

      projections.push({
        year,
        homeValue: futureValue,
        mortgage: futureMortgage,
        equity: futureEquity,
        equityPercent: futureEquityPercent,
      });
    }

    // Borrowable equity (typically 80-85% LTV minus current debt)
    const maxBorrowableAt80 = value * 0.80 - totalDebt;
    const maxBorrowableAt85 = value * 0.85 - totalDebt;

    return {
      currentEquity,
      equityPercentage,
      ltvRatio,
      totalDebt,
      projections,
      maxBorrowableAt80: Math.max(0, maxBorrowableAt80),
      maxBorrowableAt85: Math.max(0, maxBorrowableAt85),
      isPositiveEquity: currentEquity > 0,
    };
  }, [homeValue, mortgageBalance, additionalLoans, appreciationRate, yearsToProject]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Home className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeEquityCalculator.homeEquityCalculator', 'Home Equity Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.homeEquityCalculator.calculateYourHomeEquityAnd', 'Calculate your home equity and borrowing power')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.homeEquityCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Current Home Value */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.homeEquityCalculator.currentHomeValue', 'Current Home Value')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={homeValue}
              onChange={(e) => setHomeValue(e.target.value)}
              placeholder="400000"
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Mortgage Balance */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.homeEquityCalculator.currentMortgageBalance', 'Current Mortgage Balance')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={mortgageBalance}
              onChange={(e) => setMortgageBalance(e.target.value)}
              placeholder="250000"
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Additional Loans */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.homeEquityCalculator.additionalLiensLoansHelocEtc', 'Additional Liens/Loans (HELOC, etc.)')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={additionalLoans}
              onChange={(e) => setAdditionalLoans(e.target.value)}
              placeholder="0"
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Appreciation Rate & Years */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {t('tools.homeEquityCalculator.annualAppreciation', 'Annual Appreciation %')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={appreciationRate}
                onChange={(e) => setAppreciationRate(e.target.value)}
                className={`w-full pl-4 pr-8 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.homeEquityCalculator.yearsToProject', 'Years to Project')}
            </label>
            <select
              value={yearsToProject}
              onChange={(e) => setYearsToProject(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {[1, 2, 3, 5, 7, 10].map((y) => (
                <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Equity Summary */}
        <div className={`p-6 rounded-xl ${calculations.isPositiveEquity ? (isDark ? t('tools.homeEquityCalculator.bg0d948820Border0d9488', 'bg-[#0D9488]/20 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200') : (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200')} border`}>
          <div className="text-center mb-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeEquityCalculator.yourCurrentHomeEquity', 'Your Current Home Equity')}</div>
            <div className={`text-4xl font-bold ${calculations.isPositiveEquity ? t('tools.homeEquityCalculator.text0d9488', 'text-[#0D9488]') : 'text-red-500'}`}>
              {formatCurrency(calculations.currentEquity)}
            </div>
            <div className={`text-lg ${calculations.isPositiveEquity ? t('tools.homeEquityCalculator.text0d94882', 'text-[#0D9488]') : 'text-red-500'}`}>
              {calculations.equityPercentage.toFixed(1)}% equity
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeEquityCalculator.loanToValueLtv', 'Loan-to-Value (LTV)')}</div>
            <div className={`text-2xl font-bold ${calculations.ltvRatio > 80 ? 'text-amber-500' : t('tools.homeEquityCalculator.text0d94883', 'text-[#0D9488]')}`}>
              {calculations.ltvRatio.toFixed(1)}%
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.ltvRatio > 80 ? t('tools.homeEquityCalculator.above80PmiMayApply', 'Above 80% - PMI may apply') : t('tools.homeEquityCalculator.below80NoPmi', 'Below 80% - No PMI')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeEquityCalculator.totalDebtOnHome', 'Total Debt on Home')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.totalDebt)}
            </div>
          </div>
        </div>

        {/* Borrowable Equity */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank className="w-5 h-5 text-[#0D9488]" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.homeEquityCalculator.borrowableEquity', 'Borrowable Equity')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeEquityCalculator.at80Ltv', 'At 80% LTV')}</div>
              <div className="text-xl font-bold text-[#0D9488]">{formatCurrency(calculations.maxBorrowableAt80)}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.homeEquityCalculator.at85Ltv', 'At 85% LTV')}</div>
              <div className="text-xl font-bold text-[#0D9488]">{formatCurrency(calculations.maxBorrowableAt85)}</div>
            </div>
          </div>
        </div>

        {/* Projections Table */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Equity Projection ({appreciationRate}% annual appreciation)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2">{t('tools.homeEquityCalculator.year', 'Year')}</th>
                  <th className="text-right py-2">{t('tools.homeEquityCalculator.homeValue', 'Home Value')}</th>
                  <th className="text-right py-2">{t('tools.homeEquityCalculator.estMortgage', 'Est. Mortgage')}</th>
                  <th className="text-right py-2">{t('tools.homeEquityCalculator.equity', 'Equity')}</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {calculations.projections.map((row) => (
                  <tr key={row.year} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-2">{row.year === 0 ? 'Now' : `Year ${row.year}`}</td>
                    <td className="text-right py-2">{formatCurrency(row.homeValue)}</td>
                    <td className="text-right py-2">{formatCurrency(row.mortgage)}</td>
                    <td className="text-right py-2 text-[#0D9488] font-medium">{formatCurrency(row.equity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.homeEquityCalculator.aboutHomeEquity', 'About Home Equity:')}</strong> Home equity is the difference between your home's market value and what you owe. You can tap into this equity through a home equity loan, HELOC, or cash-out refinance. Most lenders require at least 15-20% equity remaining after borrowing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeEquityCalculatorTool;
