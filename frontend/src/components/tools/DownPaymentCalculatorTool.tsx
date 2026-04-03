import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, DollarSign, PiggyBank, Calendar, TrendingUp, Info, Sparkles, Target } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DownPaymentResult {
  downPaymentAmount: number;
  loanAmount: number;
  monthlyPayment: number;
  pmiMonthly: number;
  savingsNeeded: number;
  monthlySavings: number;
  savingsProgress: number;
}

interface SavingsPlan {
  months: number;
  monthlySavings: number;
  totalSaved: number;
  interestEarned: number;
}

interface DownPaymentCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const DownPaymentCalculatorTool: React.FC<DownPaymentCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homePrice, setHomePrice] = useState('350000');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [currentSavings, setCurrentSavings] = useState('25000');
  const [targetMonths, setTargetMonths] = useState('24');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanTermYears, setLoanTermYears] = useState('30');
  const [savingsInterestRate, setSavingsInterestRate] = useState('4.5');
  const [closingCostPercent, setClosingCostPercent] = useState('3');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.price !== undefined || params.amount !== undefined) {
        setHomePrice(String(params.price || params.amount));
        setIsPrefilled(true);
      }
      if (params.downPayment !== undefined) {
        setDownPaymentPercent(String(params.downPayment));
        setIsPrefilled(true);
      }
      if (params.savings !== undefined) {
        setCurrentSavings(String(params.savings));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const result = useMemo<DownPaymentResult | null>(() => {
    const price = parseFloat(homePrice) || 0;
    const downPercent = parseFloat(downPaymentPercent) || 0;
    const savings = parseFloat(currentSavings) || 0;
    const months = parseInt(targetMonths) || 24;
    const rate = parseFloat(interestRate) || 0;
    const years = parseInt(loanTermYears) || 30;
    const closingPercent = parseFloat(closingCostPercent) || 0;

    if (price <= 0) {
      return null;
    }

    const downPaymentAmount = price * (downPercent / 100);
    const closingCosts = price * (closingPercent / 100);
    const totalNeeded = downPaymentAmount + closingCosts;
    const loanAmount = price - downPaymentAmount;

    // Calculate monthly mortgage payment
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    let monthlyPayment = 0;

    if (loanAmount > 0 && monthlyRate > 0) {
      monthlyPayment =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    // Calculate PMI (if down payment < 20%)
    let pmiMonthly = 0;
    if (downPercent < 20) {
      pmiMonthly = (loanAmount * 0.005) / 12; // ~0.5% annual PMI rate
    }

    // Calculate savings needed
    const savingsNeeded = Math.max(0, totalNeeded - savings);

    // Calculate monthly savings required
    const monthlySavings = savingsNeeded / months;

    // Calculate savings progress
    const savingsProgress = Math.min(100, (savings / totalNeeded) * 100);

    return {
      downPaymentAmount,
      loanAmount,
      monthlyPayment,
      pmiMonthly,
      savingsNeeded,
      monthlySavings,
      savingsProgress,
    };
  }, [homePrice, downPaymentPercent, currentSavings, targetMonths, interestRate, loanTermYears, closingCostPercent]);

  const savingsPlans = useMemo<SavingsPlan[]>(() => {
    const price = parseFloat(homePrice) || 0;
    const downPercent = parseFloat(downPaymentPercent) || 0;
    const savings = parseFloat(currentSavings) || 0;
    const savingsRate = parseFloat(savingsInterestRate) || 0;
    const closingPercent = parseFloat(closingCostPercent) || 0;

    if (price <= 0) return [];

    const downPaymentAmount = price * (downPercent / 100);
    const closingCosts = price * (closingPercent / 100);
    const totalNeeded = downPaymentAmount + closingCosts;
    const savingsNeeded = Math.max(0, totalNeeded - savings);

    if (savingsNeeded <= 0) return [];

    const monthlyRate = savingsRate / 100 / 12;
    const plans: SavingsPlan[] = [];

    [12, 24, 36, 48, 60].forEach((months) => {
      // Calculate monthly savings needed with compound interest
      let monthlySavings: number;
      if (monthlyRate > 0) {
        // FV = P * ((1 + r)^n - 1) / r
        // Solve for P: P = FV * r / ((1 + r)^n - 1)
        monthlySavings = savingsNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
      } else {
        monthlySavings = savingsNeeded / months;
      }

      // Calculate total saved and interest earned
      let totalSaved = 0;
      let balance = 0;
      for (let i = 0; i < months; i++) {
        balance = balance * (1 + monthlyRate) + monthlySavings;
        totalSaved += monthlySavings;
      }
      const interestEarned = balance - totalSaved;

      plans.push({
        months,
        monthlySavings,
        totalSaved,
        interestEarned,
      });
    });

    return plans;
  }, [homePrice, downPaymentPercent, currentSavings, savingsInterestRate, closingCostPercent]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const downPaymentOptions = [
    { percent: 3.5, label: '3.5%', description: 'FHA Minimum' },
    { percent: 5, label: '5%', description: 'Conventional Min' },
    { percent: 10, label: '10%', description: 'Low PMI' },
    { percent: 20, label: '20%', description: 'No PMI' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <PiggyBank className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.downPaymentCalculator.downPaymentCalculator', 'Down Payment Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.downPaymentCalculator.planYourHomeDownPayment', 'Plan your home down payment savings')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.downPaymentCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Home Price */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.downPaymentCalculator.targetHomePrice', 'Target Home Price')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
              placeholder="350000"
              className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>

        {/* Down Payment Percentage */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.downPaymentCalculator.downPaymentPercentage', 'Down Payment Percentage')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {downPaymentOptions.map((option) => (
              <button
                key={option.percent}
                onClick={() => setDownPaymentPercent(option.percent.toString())}
                className={`py-2 px-2 rounded-lg text-center ${
                  parseFloat(downPaymentPercent) === option.percent
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs opacity-75">{option.description}</div>
              </button>
            ))}
          </div>
          <input
            type="number"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(e.target.value)}
            min="0"
            max="100"
            step="0.5"
            placeholder="20"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
        </div>

        {/* Current Savings & Timeline */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.downPaymentCalculator.currentSavings', 'Current Savings')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                placeholder="25000"
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.downPaymentCalculator.targetTimelineMonths', 'Target Timeline (months)')}
            </label>
            <input
              type="number"
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
              min="1"
              placeholder="24"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.downPaymentCalculator.mortgageRate', 'Mortgage Rate (%)')}
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              step="0.125"
              placeholder="7.0"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.downPaymentCalculator.savingsApy', 'Savings APY (%)')}
            </label>
            <input
              type="number"
              value={savingsInterestRate}
              onChange={(e) => setSavingsInterestRate(e.target.value)}
              step="0.1"
              placeholder="4.5"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.downPaymentCalculator.closingCosts', 'Closing Costs (%)')}
            </label>
            <input
              type="number"
              value={closingCostPercent}
              onChange={(e) => setClosingCostPercent(e.target.value)}
              step="0.5"
              placeholder="3"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.downPaymentCalculator.savingsProgress', 'Savings Progress')}
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {result.savingsProgress.toFixed(1)}%
                </span>
              </div>
              <div className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                  style={{ width: `${result.savingsProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {formatCurrency(parseFloat(currentSavings))} saved
                </span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {formatCurrency(result.downPaymentAmount + parseFloat(homePrice) * (parseFloat(closingCostPercent) / 100))} needed
                </span>
              </div>
            </div>

            {/* Key Stats */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downPaymentCalculator.downPayment', 'Down Payment')}</div>
                  <div className="text-3xl font-bold text-green-500">
                    {formatCurrency(result.downPaymentAmount)}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {downPaymentPercent}% of home price
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downPaymentCalculator.stillNeedToSave', 'Still Need to Save')}</div>
                  <div className="text-3xl font-bold text-blue-500">
                    {formatCurrency(result.savingsNeeded)}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('tools.downPaymentCalculator.includingClosingCosts', 'Including closing costs')}
                  </div>
                </div>
              </div>
              {result.savingsNeeded > 0 && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-green-800' : 'border-green-200'}`}>
                  <div className="text-center">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downPaymentCalculator.saveMonthlyToReachGoal', 'Save Monthly to Reach Goal')}</div>
                    <div className="text-2xl font-bold text-purple-500">
                      {formatCurrency(result.monthlySavings)}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      for {targetMonths} months
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mortgage Impact */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.downPaymentCalculator.mortgageImpact', 'Mortgage Impact')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downPaymentCalculator.loanAmount', 'Loan Amount')}</div>
                  <div className="text-xl font-bold text-blue-500">{formatCurrency(result.loanAmount)}</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.downPaymentCalculator.monthlyPayment', 'Monthly Payment')}</div>
                  <div className="text-xl font-bold text-purple-500">{formatCurrency(result.monthlyPayment)}</div>
                </div>
              </div>
              {result.pmiMonthly > 0 && (
                <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-500" />
                    <span className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      PMI Required: ~{formatCurrency(result.pmiMonthly)}/mo until you reach 20% equity
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Savings Timeline Options */}
            {savingsPlans.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  {t('tools.downPaymentCalculator.savingsTimelineOptions', 'Savings Timeline Options')}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        <th className="text-left py-2">{t('tools.downPaymentCalculator.timeline', 'Timeline')}</th>
                        <th className="text-right py-2">{t('tools.downPaymentCalculator.monthly', 'Monthly')}</th>
                        <th className="text-right py-2">{t('tools.downPaymentCalculator.interestEarned', 'Interest Earned')}</th>
                      </tr>
                    </thead>
                    <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {savingsPlans.map((plan) => (
                        <tr
                          key={plan.months}
                          className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} ${
                            plan.months === parseInt(targetMonths) ? (isDark ? 'bg-green-900/20' : 'bg-green-50') : ''
                          }`}
                        >
                          <td className="py-2">
                            {plan.months} months ({(plan.months / 12).toFixed(1)} years)
                          </td>
                          <td className="text-right py-2 font-medium text-green-500">
                            {formatCurrency(plan.monthlySavings)}
                          </td>
                          <td className="text-right py-2 text-blue-500">
                            +{formatCurrency(plan.interestEarned)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.downPaymentCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>20% down eliminates PMI and gets better rates</li>
                <li>{t('tools.downPaymentCalculator.highYieldSavingsAccountsCan', 'High-yield savings accounts can help you reach your goal faster')}</li>
                <li>{t('tools.downPaymentCalculator.rememberToBudgetForMoving', 'Remember to budget for moving costs and initial home expenses')}</li>
                <li>{t('tools.downPaymentCalculator.someAreasOfferFirstTime', 'Some areas offer first-time buyer assistance programs')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownPaymentCalculatorTool;
