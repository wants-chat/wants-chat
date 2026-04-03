import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, DollarSign, Percent, Calendar, TrendingDown, RefreshCw, Info, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RefinanceResult {
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
  monthlySavings: number;
  totalCurrentInterest: number;
  totalNewInterest: number;
  interestSavings: number;
  breakEvenMonths: number;
  closingCosts: number;
  netSavings: number;
  recommendation: 'refinance' | 'stay' | 'maybe';
  recommendationReason: string;
}

interface RefinanceCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const RefinanceCalculatorTool: React.FC<RefinanceCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Current loan details
  const [currentBalance, setCurrentBalance] = useState('280000');
  const [currentRate, setCurrentRate] = useState('7.5');
  const [currentTermRemaining, setCurrentTermRemaining] = useState('25');
  const [currentPayment, setCurrentPayment] = useState('');

  // New loan details
  const [newRate, setNewRate] = useState('6.5');
  const [newTerm, setNewTerm] = useState('30');
  const [closingCostPercent, setClosingCostPercent] = useState('2');
  const [rollClosingCosts, setRollClosingCosts] = useState(false);
  const [cashOut, setCashOut] = useState('0');

  const [isPrefilled, setIsPrefilled] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined || params.balance !== undefined) {
        setCurrentBalance(String(params.amount || params.balance));
        setIsPrefilled(true);
      }
      if (params.interestRate !== undefined) {
        setCurrentRate(String(params.interestRate));
        setIsPrefilled(true);
      }
      if (params.newRate !== undefined) {
        setNewRate(String(params.newRate));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const result = useMemo<RefinanceResult | null>(() => {
    const balance = parseFloat(currentBalance) || 0;
    const oldRate = parseFloat(currentRate) || 0;
    const remainingYears = parseInt(currentTermRemaining) || 0;
    const newRateValue = parseFloat(newRate) || 0;
    const newTermYears = parseInt(newTerm) || 30;
    const closingPercent = parseFloat(closingCostPercent) || 0;
    const cashOutAmount = parseFloat(cashOut) || 0;

    if (balance <= 0 || oldRate <= 0 || remainingYears <= 0 || newRateValue <= 0) {
      return null;
    }

    // Calculate current monthly payment
    const currentMonthlyRate = oldRate / 100 / 12;
    const currentNumPayments = remainingYears * 12;
    let currentMonthlyPayment: number;

    if (currentPayment && parseFloat(currentPayment) > 0) {
      currentMonthlyPayment = parseFloat(currentPayment);
    } else {
      currentMonthlyPayment =
        (balance * (currentMonthlyRate * Math.pow(1 + currentMonthlyRate, currentNumPayments))) /
        (Math.pow(1 + currentMonthlyRate, currentNumPayments) - 1);
    }

    // Calculate closing costs
    const closingCosts = balance * (closingPercent / 100);

    // Calculate new loan amount
    let newLoanAmount = balance + cashOutAmount;
    if (rollClosingCosts) {
      newLoanAmount += closingCosts;
    }

    // Calculate new monthly payment
    const newMonthlyRate = newRateValue / 100 / 12;
    const newNumPayments = newTermYears * 12;
    const newMonthlyPayment =
      (newLoanAmount * (newMonthlyRate * Math.pow(1 + newMonthlyRate, newNumPayments))) /
      (Math.pow(1 + newMonthlyRate, newNumPayments) - 1);

    // Calculate monthly savings
    const monthlySavings = currentMonthlyPayment - newMonthlyPayment;

    // Calculate total interest for current loan
    const totalCurrentInterest = (currentMonthlyPayment * currentNumPayments) - balance;

    // Calculate total interest for new loan
    const totalNewInterest = (newMonthlyPayment * newNumPayments) - newLoanAmount;

    // Calculate interest savings (accounting for any difference in loan amounts)
    const interestSavings = totalCurrentInterest - totalNewInterest;

    // Calculate break-even point (months to recoup closing costs)
    const effectiveClosingCosts = rollClosingCosts ? 0 : closingCosts;
    const breakEvenMonths = monthlySavings > 0 ? effectiveClosingCosts / monthlySavings : Infinity;

    // Calculate net savings over remaining current term
    const monthsToCompare = Math.min(currentNumPayments, newNumPayments);
    const netSavings = (monthlySavings * monthsToCompare) - effectiveClosingCosts;

    // Determine recommendation
    let recommendation: 'refinance' | 'stay' | 'maybe';
    let recommendationReason: string;

    const rateDifference = oldRate - newRateValue;

    if (breakEvenMonths <= 24 && monthlySavings > 100 && rateDifference >= 0.5) {
      recommendation = 'refinance';
      recommendationReason = `Great opportunity! You'll break even in ${Math.ceil(breakEvenMonths)} months and save ${formatCurrency(netSavings)} over the loan term.`;
    } else if (breakEvenMonths <= 48 && monthlySavings > 50) {
      recommendation = 'maybe';
      recommendationReason = `Consider refinancing if you plan to stay in the home for at least ${Math.ceil(breakEvenMonths)} months to break even.`;
    } else if (monthlySavings <= 0) {
      recommendation = 'stay';
      recommendationReason = 'Refinancing would increase your monthly payment. Not recommended unless you need cash out.';
    } else {
      recommendation = 'stay';
      recommendationReason = `The break-even point of ${Math.ceil(breakEvenMonths)} months is too long. Consider waiting for better rates.`;
    }

    return {
      currentMonthlyPayment,
      newMonthlyPayment,
      monthlySavings,
      totalCurrentInterest,
      totalNewInterest,
      interestSavings,
      breakEvenMonths,
      closingCosts,
      netSavings,
      recommendation,
      recommendationReason,
    };
  }, [currentBalance, currentRate, currentTermRemaining, currentPayment, newRate, newTerm, closingCostPercent, rollClosingCosts, cashOut]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <RefreshCw className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.refinanceCalculator.refinanceCalculator', 'Refinance Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.refinanceCalculator.shouldYouRefinanceYourMortgage', 'Should you refinance your mortgage?')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.refinanceCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Current Loan Section */}
        <div className="space-y-4">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Home className="w-4 h-4" />
            {t('tools.refinanceCalculator.currentLoan', 'Current Loan')}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.refinanceCalculator.currentBalance', 'Current Balance')}
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  placeholder="280000"
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.refinanceCalculator.currentRate', 'Current Rate (%)')}
              </label>
              <input
                type="number"
                value={currentRate}
                onChange={(e) => setCurrentRate(e.target.value)}
                step="0.125"
                placeholder="7.5"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.refinanceCalculator.yearsRemaining', 'Years Remaining')}
              </label>
              <input
                type="number"
                value={currentTermRemaining}
                onChange={(e) => setCurrentTermRemaining(e.target.value)}
                placeholder="25"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.refinanceCalculator.currentPaymentOptional', 'Current Payment (optional)')}
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={currentPayment}
                  onChange={(e) => setCurrentPayment(e.target.value)}
                  placeholder={t('tools.refinanceCalculator.autoCalculated', 'Auto-calculated')}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider with Arrow */}
        <div className="flex items-center gap-4">
          <div className={`flex-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
          <ArrowRight className={`w-6 h-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <div className={`flex-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
        </div>

        {/* New Loan Section */}
        <div className="space-y-4">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <RefreshCw className="w-4 h-4" />
            {t('tools.refinanceCalculator.newLoanTerms', 'New Loan Terms')}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Percent className="w-4 h-4 inline mr-1" />
                {t('tools.refinanceCalculator.newInterestRate', 'New Interest Rate (%)')}
              </label>
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                step="0.125"
                placeholder="6.5"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('tools.refinanceCalculator.newLoanTerm', 'New Loan Term')}
              </label>
              <select
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="15">15 years</option>
                <option value="20">20 years</option>
                <option value="25">25 years</option>
                <option value="30">30 years</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.refinanceCalculator.closingCosts2', 'Closing Costs (%)')}
              </label>
              <input
                type="number"
                value={closingCostPercent}
                onChange={(e) => setClosingCostPercent(e.target.value)}
                step="0.5"
                placeholder="2"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <DollarSign className="w-4 h-4 inline mr-1" />
                {t('tools.refinanceCalculator.cashOutAmount', 'Cash-Out Amount')}
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={cashOut}
                  onChange={(e) => setCashOut(e.target.value)}
                  placeholder="0"
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rollClosingCosts"
              checked={rollClosingCosts}
              onChange={(e) => setRollClosingCosts(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
            />
            <label htmlFor="rollClosingCosts" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.refinanceCalculator.rollClosingCostsIntoNew', 'Roll closing costs into new loan')}
            </label>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Recommendation */}
            <div
              className={`p-4 rounded-lg border ${
                result.recommendation === 'refinance'
                  ? isDark
                    ? 'bg-green-900/20 border-green-800'
                    : 'bg-green-50 border-green-200'
                  : result.recommendation === 'maybe'
                  ? isDark
                    ? 'bg-yellow-900/20 border-yellow-800'
                    : 'bg-yellow-50 border-yellow-200'
                  : isDark
                  ? 'bg-red-900/20 border-red-800'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full ${
                    result.recommendation === 'refinance'
                      ? 'bg-green-500'
                      : result.recommendation === 'maybe'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                >
                  {result.recommendation === 'refinance' ? (
                    <TrendingDown className="w-5 h-5 text-white" />
                  ) : result.recommendation === 'maybe' ? (
                    <RefreshCw className="w-5 h-5 text-white" />
                  ) : (
                    <Home className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      result.recommendation === 'refinance'
                        ? 'text-green-500'
                        : result.recommendation === 'maybe'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    {result.recommendation === 'refinance'
                      ? 'Refinancing Recommended'
                      : result.recommendation === 'maybe'
                      ? t('tools.refinanceCalculator.considerYourOptions', 'Consider Your Options') : t('tools.refinanceCalculator.keepCurrentLoan', 'Keep Current Loan')}
                  </h4>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {result.recommendationReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Comparison */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.refinanceCalculator.currentPayment', 'Current Payment')}</div>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(result.currentMonthlyPayment)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.refinanceCalculator.newPayment', 'New Payment')}</div>
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(result.newMonthlyPayment)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.refinanceCalculator.monthlySavings', 'Monthly Savings')}</div>
                  <div className={`text-2xl font-bold ${result.monthlySavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {result.monthlySavings >= 0 ? '+' : ''}{formatCurrency(result.monthlySavings)}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.refinanceCalculator.financialImpact', 'Financial Impact')}</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.refinanceCalculator.closingCosts', 'Closing Costs')}</span>
                  <span className="text-red-500">-{formatCurrency(result.closingCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.refinanceCalculator.breakEvenPoint', 'Break-Even Point')}</span>
                  <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>
                    {result.breakEvenMonths === Infinity ? 'Never' : `${Math.ceil(result.breakEvenMonths)} months`}
                  </span>
                </div>
                <div className={`border-t pt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.refinanceCalculator.totalInterestCurrent', 'Total Interest (Current)')}</span>
                    <span className="text-red-500">{formatCurrency(result.totalCurrentInterest)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.refinanceCalculator.totalInterestNew', 'Total Interest (New)')}</span>
                    <span className="text-red-500">{formatCurrency(result.totalNewInterest)}</span>
                  </div>
                  <div className="flex justify-between mt-2 font-medium">
                    <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{t('tools.refinanceCalculator.interestSavings', 'Interest Savings')}</span>
                    <span className={result.interestSavings >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {result.interestSavings >= 0 ? '+' : ''}{formatCurrency(result.interestSavings)}
                    </span>
                  </div>
                </div>
                <div className={`border-t pt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between font-bold">
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.refinanceCalculator.netLifetimeSavings', 'Net Lifetime Savings')}</span>
                    <span className={result.netSavings >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {result.netSavings >= 0 ? '+' : ''}{formatCurrency(result.netSavings)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.refinanceCalculator.considerRefinancingWhen', 'Consider refinancing when:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.refinanceCalculator.interestRatesDrop05', 'Interest rates drop 0.5% or more below your current rate')}</li>
                <li>{t('tools.refinanceCalculator.youCanBreakEvenOn', 'You can break even on closing costs within 24-36 months')}</li>
                <li>{t('tools.refinanceCalculator.youPlanToStayIn', 'You plan to stay in your home past the break-even point')}</li>
                <li>{t('tools.refinanceCalculator.yourCreditScoreHasImproved', 'Your credit score has improved significantly')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefinanceCalculatorTool;
