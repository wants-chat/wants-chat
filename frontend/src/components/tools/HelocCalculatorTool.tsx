import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, DollarSign, Percent, Calendar, CreditCard, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HelocCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const HelocCalculatorTool: React.FC<HelocCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homeValue, setHomeValue] = useState('400000');
  const [mortgageBalance, setMortgageBalance] = useState('250000');
  const [cltv, setCltv] = useState('80');
  const [interestRate, setInterestRate] = useState('8.5');
  const [drawAmount, setDrawAmount] = useState('50000');
  const [repaymentYears, setRepaymentYears] = useState('10');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.price !== undefined || params.amount !== undefined) {
        setHomeValue(String(params.price || params.amount));
        setIsPrefilled(true);
      }
      if (params.mortgageBalance !== undefined) {
        setMortgageBalance(String(params.mortgageBalance));
        setIsPrefilled(true);
      }
      if (params.interestRate !== undefined) {
        setInterestRate(String(params.interestRate));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const value = parseFloat(homeValue) || 0;
    const mortgage = parseFloat(mortgageBalance) || 0;
    const cltvPercent = parseFloat(cltv) || 80;
    const rate = parseFloat(interestRate) || 8.5;
    const draw = parseFloat(drawAmount) || 0;
    const years = parseInt(repaymentYears) || 10;

    // Maximum HELOC available
    const maxCombinedLoan = value * (cltvPercent / 100);
    const maxHelocAmount = Math.max(0, maxCombinedLoan - mortgage);

    // Current equity
    const currentEquity = value - mortgage;
    const equityPercentage = value > 0 ? (currentEquity / value) * 100 : 0;

    // Interest-only payment (draw period)
    const monthlyRate = rate / 100 / 12;
    const interestOnlyPayment = draw * monthlyRate;

    // Fully amortized payment (repayment period)
    const termMonths = years * 12;
    let fullyAmortizedPayment = 0;
    if (draw > 0 && monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, termMonths);
      fullyAmortizedPayment = draw * (monthlyRate * factor) / (factor - 1);
    } else if (draw > 0) {
      fullyAmortizedPayment = draw / termMonths;
    }

    // Total interest over repayment period
    const totalInterest = (fullyAmortizedPayment * termMonths) - draw;

    // Annual cost comparison
    const annualInterestOnly = interestOnlyPayment * 12;

    return {
      maxHelocAmount,
      currentEquity,
      equityPercentage,
      interestOnlyPayment,
      fullyAmortizedPayment,
      totalInterest,
      annualInterestOnly,
      drawAmount: draw,
      isEligible: maxHelocAmount > 0,
      remainingAvailable: maxHelocAmount - draw,
    };
  }, [homeValue, mortgageBalance, cltv, interestRate, drawAmount, repaymentYears]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const cltvOptions = [
    { value: '75', label: '75% - Conservative' },
    { value: '80', label: '80% - Standard' },
    { value: '85', label: '85% - Higher Risk' },
    { value: '90', label: '90% - Maximum (if available)' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <CreditCard className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.helocCalculator.helocCalculator', 'HELOC Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.helocCalculator.homeEquityLineOfCredit', 'Home Equity Line of Credit estimator')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.helocCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Home Value */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.helocCalculator.homeValue', 'Home Value')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={homeValue}
              onChange={(e) => setHomeValue(e.target.value)}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Mortgage Balance */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.helocCalculator.currentMortgageBalance', 'Current Mortgage Balance')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={mortgageBalance}
              onChange={(e) => setMortgageBalance(e.target.value)}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* CLTV */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.helocCalculator.combinedLoanToValueCltv', 'Combined Loan-to-Value (CLTV) Limit')}
          </label>
          <select
            value={cltv}
            onChange={(e) => setCltv(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {cltvOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Max HELOC Available */}
        <div className={`p-6 rounded-xl ${calculations.isEligible ? (isDark ? t('tools.helocCalculator.bg0d948820Border0d9488', 'bg-[#0D9488]/20 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200') : (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200')} border`}>
          <div className="text-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.helocCalculator.maximumHelocAvailable', 'Maximum HELOC Available')}</div>
            <div className={`text-4xl font-bold ${calculations.isEligible ? t('tools.helocCalculator.text0d9488', 'text-[#0D9488]') : 'text-red-500'}`}>
              {formatCurrency(calculations.maxHelocAmount)}
            </div>
            <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Based on {cltv}% CLTV | Current Equity: {formatCurrency(calculations.currentEquity)}
            </div>
          </div>
        </div>

        {/* Draw Amount */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.helocCalculator.amountToDrawBorrow', 'Amount to Draw / Borrow')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={drawAmount}
              onChange={(e) => setDrawAmount(e.target.value)}
              max={calculations.maxHelocAmount}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((pct) => {
              const amount = Math.round(calculations.maxHelocAmount * pct / 100);
              return (
                <button
                  key={pct}
                  onClick={() => setDrawAmount(amount.toString())}
                  className={`flex-1 py-1.5 text-xs rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {pct}%
                </button>
              );
            })}
          </div>
        </div>

        {/* Interest Rate & Term */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Percent className="w-4 h-4 inline mr-1" />
              {t('tools.helocCalculator.interestRateApr', 'Interest Rate (APR)')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className={`w-full pl-4 pr-8 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.helocCalculator.repaymentPeriod', 'Repayment Period')}
            </label>
            <select
              value={repaymentYears}
              onChange={(e) => setRepaymentYears(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {[5, 10, 15, 20].map((y) => (
                <option key={y} value={y}>{y} years</option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Estimates */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.helocCalculator.interestOnlyPayment', 'Interest-Only Payment')}</div>
            <div className="text-2xl font-bold text-amber-500">
              {formatCurrency(calculations.interestOnlyPayment)}/mo
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.helocCalculator.duringDrawPeriod', 'During draw period')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.helocCalculator.fullyAmortizedPayment', 'Fully Amortized Payment')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">
              {formatCurrency(calculations.fullyAmortizedPayment)}/mo
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.helocCalculator.duringRepaymentPeriod', 'During repayment period')}
            </div>
          </div>
        </div>

        {/* Total Interest */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Interest (if repaid over {repaymentYears} yrs)</div>
              <div className="text-xl font-bold text-red-500">{formatCurrency(calculations.totalInterest)}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.helocCalculator.remainingCreditAvailable', 'Remaining Credit Available')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(Math.max(0, calculations.remainingAvailable))}
              </div>
            </div>
          </div>
        </div>

        {/* HELOC Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.helocCalculator.aboutHelocs', 'About HELOCs:')}</strong> A HELOC is a revolving credit line secured by your home. During the draw period (typically 5-10 years), you pay interest only on what you borrow. After that, you enter the repayment period where you pay both principal and interest. HELOC rates are usually variable and tied to the prime rate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelocCalculatorTool;
