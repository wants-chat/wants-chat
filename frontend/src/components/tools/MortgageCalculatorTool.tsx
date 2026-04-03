import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Calculator, Home, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MortgageResult {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  numberOfPayments: number;
}

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface MortgageCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const MortgageCalculatorTool: React.FC<MortgageCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTermYears, setLoanTermYears] = useState('30');
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [showAmortization, setShowAmortization] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setLoanAmount(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setLoanAmount(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setInterestRate(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateMortgage = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);
    const years = parseInt(loanTermYears);

    if (isNaN(principal) || isNaN(rate) || isNaN(years)) {
      setValidationMessage('Please enter valid numbers');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (principal <= 0) {
      setValidationMessage('Loan amount must be greater than 0');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (rate < 0) {
      setValidationMessage('Interest rate cannot be negative');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (years <= 0) {
      setValidationMessage('Loan term must be greater than 0');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Convert annual rate to monthly rate
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;

    // Calculate monthly payment using mortgage formula
    // M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      // If no interest, simple division
      monthlyPayment = principal / numberOfPayments;
    } else {
      monthlyPayment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    setResult({
      loanAmount: principal,
      interestRate: rate,
      loanTermYears: years,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      numberOfPayments,
    });
  };

  const generateAmortizationSchedule = (): AmortizationRow[] => {
    if (!result) return [];

    const schedule: AmortizationRow[] = [];
    const monthlyRate = result.interestRate / 100 / 12;
    let balance = result.loanAmount;

    for (let month = 1; month <= result.numberOfPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = result.monthlyPayment - interestPayment;
      balance -= principalPayment;

      // Prevent negative balance due to rounding
      if (balance < 0) balance = 0;

      schedule.push({
        month,
        payment: result.monthlyPayment,
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
      });
    }

    return schedule;
  };

  const reset = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTermYears('30');
    setResult(null);
    setShowAmortization(false);
  };

  const setQuickTerm = (years: number) => {
    setLoanTermYears(years.toString());
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.mortgageCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.mortgageCalculator.mortgageCalculator', 'Mortgage Calculator')}
            </h1>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.mortgageCalculator.loanAmount', 'Loan Amount ($)')}
              </label>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder={t('tools.mortgageCalculator.enterLoanAmount', 'Enter loan amount')}
                  step="1000"
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
                {t('tools.mortgageCalculator.annualInterestRate', 'Annual Interest Rate (%)')}
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder={t('tools.mortgageCalculator.enterInterestRate', 'Enter interest rate')}
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
                {t('tools.mortgageCalculator.loanTermYears', 'Loan Term (Years)')}
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="number"
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(e.target.value)}
                  placeholder={t('tools.mortgageCalculator.enterLoanTerm', 'Enter loan term')}
                  min="1"
                  step="1"
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
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
                {t('tools.mortgageCalculator.quickTerm', 'Quick Term')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 30].map((years) => (
                  <button
                    key={years}
                    onClick={() => setQuickTerm(years)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                      loanTermYears === years.toString()
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
              onClick={calculateMortgage}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.mortgageCalculator.calculate', 'Calculate')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.mortgageCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Monthly Payment - Main Display */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.mortgageCalculator.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <div className="text-center mb-6">
                  <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.mortgageCalculator.monthlyPayment', 'Monthly Payment')}
                  </div>
                  <div className="text-5xl font-bold text-[#0D9488]">
                    ${result.monthlyPayment.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.mortgageCalculator.totalPayment', 'Total Payment')}
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      ${result.totalPayment.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.mortgageCalculator.totalInterest', 'Total Interest')}
                    </div>
                    <div className="text-2xl font-bold text-orange-500">
                      ${result.totalInterest.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.mortgageCalculator.loanDetails', 'Loan Details')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.mortgageCalculator.loanAmount2', 'Loan Amount:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${result.loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.mortgageCalculator.interestRate', 'Interest Rate:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.interestRate}% APR
                    </span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.mortgageCalculator.loanTerm', 'Loan Term:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.loanTermYears} years ({result.numberOfPayments} payments)
                    </span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.mortgageCalculator.principalPercentage', 'Principal Percentage:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {((result.loanAmount / result.totalPayment) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.mortgageCalculator.interestPercentage', 'Interest Percentage:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Amortization Toggle */}
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showAmortization ? t('tools.mortgageCalculator.hide', 'Hide') : t('tools.mortgageCalculator.show', 'Show')} Amortization Schedule
              </button>

              {/* Amortization Schedule */}
              {showAmortization && (
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} max-h-96 overflow-y-auto`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.mortgageCalculator.amortizationSchedule', 'Amortization Schedule')}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                          <th className={`py-2 px-2 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.mortgageCalculator.month', 'Month')}</th>
                          <th className={`py-2 px-2 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.mortgageCalculator.payment', 'Payment')}</th>
                          <th className={`py-2 px-2 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.mortgageCalculator.principal', 'Principal')}</th>
                          <th className={`py-2 px-2 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.mortgageCalculator.interest', 'Interest')}</th>
                          <th className={`py-2 px-2 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.mortgageCalculator.balance', 'Balance')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateAmortizationSchedule().map((row, index) => (
                          <tr
                            key={row.month}
                            className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} ${
                              index % 12 === 11 ? (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200') : ''
                            }`}
                          >
                            <td className={`py-2 px-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{row.month}</td>
                            <td className={`py-2 px-2 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              ${row.payment.toLocaleString()}
                            </td>
                            <td className={`py-2 px-2 text-right ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                              ${row.principal.toLocaleString()}
                            </td>
                            <td className={`py-2 px-2 text-right ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                              ${row.interest.toLocaleString()}
                            </td>
                            <td className={`py-2 px-2 text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              ${row.balance.toLocaleString()}
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

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.mortgageCalculator.aboutMortgageCalculation', 'About Mortgage Calculation')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                Monthly payment is calculated using the formula: M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
              </p>
              <p>
                Where: M = Monthly Payment, P = Principal Amount, r = Monthly Interest Rate, n = Number of Payments
              </p>
              <p className="text-xs mt-2 italic">
                {t('tools.mortgageCalculator.noteThisCalculatorDoesNot', 'Note: This calculator does not include property taxes, insurance, HOA fees, or PMI.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
