import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, DollarSign, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/sonner';

interface LoanResult {
  principal: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffDate: string;
}

interface LoanCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const LoanCalculatorTool: React.FC<LoanCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [termYears, setTermYears] = useState('');
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setPrincipal(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setPrincipal(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setInterestRate(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateLoan = () => {
    const principalAmount = parseFloat(principal);
    const rate = parseFloat(interestRate);

    // Calculate total months from years and months
    const years = parseInt(termYears) || 0;
    const months = parseInt(termMonths) || 0;
    const totalMonths = years * 12 + months;

    if (isNaN(principalAmount) || isNaN(rate) || totalMonths === 0) {
      toast.error('Please enter valid numbers');
      return;
    }

    if (principalAmount <= 0) {
      toast.error('Principal amount must be greater than 0');
      return;
    }

    if (rate < 0) {
      toast.error('Interest rate cannot be negative');
      return;
    }

    if (totalMonths <= 0) {
      toast.error('Loan term must be greater than 0');
      return;
    }

    // Convert annual rate to monthly rate
    const monthlyRate = rate / 100 / 12;

    // Calculate monthly payment
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      // If no interest, simple division
      monthlyPayment = principalAmount / totalMonths;
    } else {
      monthlyPayment =
        (principalAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - principalAmount;

    // Calculate payoff date
    const today = new Date();
    const payoffDate = new Date(today);
    payoffDate.setMonth(payoffDate.getMonth() + totalMonths);

    setResult({
      principal: principalAmount,
      interestRate: rate,
      termMonths: totalMonths,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      payoffDate: payoffDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });
  };

  const reset = () => {
    setPrincipal('');
    setInterestRate('');
    setTermMonths('');
    setTermYears('');
    setResult(null);
  };

  const setQuickTerm = (years: number) => {
    setTermYears(years.toString());
    setTermMonths('0');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-3xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.loanCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.loanCalculator.loanCalculator', 'Loan Calculator')}
            </h1>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.loanCalculator.principalAmount', 'Principal Amount ($)')}
              </label>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder={t('tools.loanCalculator.enterPrincipalAmount', 'Enter principal amount')}
                  step="100"
                  min="0"
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.loanCalculator.annualInterestRate', 'Annual Interest Rate (%)')}
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder={t('tools.loanCalculator.enterInterestRate', 'Enter interest rate')}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.loanCalculator.loanTerm', 'Loan Term')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="number"
                    value={termYears}
                    onChange={(e) => setTermYears(e.target.value)}
                    placeholder={t('tools.loanCalculator.years', 'Years')}
                    min="0"
                    step="1"
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <input
                  type="number"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  placeholder={t('tools.loanCalculator.months', 'Months')}
                  min="0"
                  max="11"
                  step="1"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Quick Term Buttons */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.loanCalculator.quickTerm', 'Quick Term')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 5, 7].map((years) => (
                  <button
                    key={years}
                    onClick={() => setQuickTerm(years)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                      termYears === years.toString() && (termMonths === '' || termMonths === '0')
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {years}Y
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateLoan}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.loanCalculator.calculate', 'Calculate')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.loanCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Monthly Payment - Main Display */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.loanCalculator.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <div className="text-center mb-6">
                  <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.loanCalculator.monthlyPayment', 'Monthly Payment')}
                  </div>
                  <div className="text-5xl font-bold text-[#0D9488]">
                    ${result.monthlyPayment.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.loanCalculator.totalPayment', 'Total Payment')}
                    </div>
                    <div className="text-xl font-bold text-green-500">
                      ${result.totalPayment.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.loanCalculator.totalInterest', 'Total Interest')}
                    </div>
                    <div className="text-xl font-bold text-orange-500">
                      ${result.totalInterest.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.loanCalculator.payoffDate', 'Payoff Date')}
                    </div>
                    <div className={`text-sm font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {result.payoffDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.loanCalculator.loanDetails', 'Loan Details')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.loanCalculator.principalAmount2', 'Principal Amount:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${result.principal.toLocaleString()}
                    </span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.loanCalculator.interestRate', 'Interest Rate:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.interestRate}% APR
                    </span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.loanCalculator.loanTerm2', 'Loan Term:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {Math.floor(result.termMonths / 12)} years, {result.termMonths % 12} months
                    </span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.loanCalculator.totalPayments', 'Total Payments:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.termMonths} monthly payments
                    </span>
                  </div>
                  <div className={`border-t-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.loanCalculator.interestAsOfTotal', 'Interest as % of Total:')}
                    </span>
                    <span className="font-bold text-xl text-orange-500">
                      {((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown Chart */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.loanCalculator.paymentBreakdown', 'Payment Breakdown')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.loanCalculator.principal', 'Principal')}
                      </span>
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${result.principal.toLocaleString()} ({((result.principal / result.totalPayment) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(result.principal / result.totalPayment) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.loanCalculator.interest', 'Interest')}
                      </span>
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${result.totalInterest.toLocaleString()} ({((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculation Formula */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {t('tools.loanCalculator.calculation', 'Calculation:')}
                </div>
                <div className={`font-mono text-xs space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div>Monthly Rate = {result.interestRate}% ÷ 12 = {(result.interestRate / 12).toFixed(4)}%</div>
                  <div>Number of Payments = {result.termMonths}</div>
                  <div>Monthly Payment = ${result.monthlyPayment.toLocaleString()}</div>
                  <div>Total Payment = ${result.monthlyPayment.toLocaleString()} × {result.termMonths} = ${result.totalPayment.toLocaleString()}</div>
                  <div>Total Interest = ${result.totalPayment.toLocaleString()} - ${result.principal.toLocaleString()} = ${result.totalInterest.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.loanCalculator.commonLoanTypes', 'Common Loan Types')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex justify-between">
                <span>{t('tools.loanCalculator.personalLoan', 'Personal Loan:')}</span>
                <span className="font-medium">1-7 years, 6-36% APR</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tools.loanCalculator.autoLoan', 'Auto Loan:')}</span>
                <span className="font-medium">3-7 years, 3-10% APR</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tools.loanCalculator.studentLoan', 'Student Loan:')}</span>
                <span className="font-medium">10-25 years, 3-8% APR</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tools.loanCalculator.businessLoan', 'Business Loan:')}</span>
                <span className="font-medium">1-10 years, 5-30% APR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};
