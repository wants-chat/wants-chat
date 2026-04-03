import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, DollarSign, Percent, Calendar, TrendingDown, Info, Calculator, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface CarLoanCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const CarLoanCalculatorTool: React.FC<CarLoanCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [vehiclePrice, setVehiclePrice] = useState('35000');
  const [downPayment, setDownPayment] = useState('5000');
  const [tradeInValue, setTradeInValue] = useState('0');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTerm, setLoanTerm] = useState('60');
  const [showAmortization, setShowAmortization] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.price !== undefined || params.amount !== undefined) {
        setVehiclePrice(String(params.price || params.amount));
        setIsPrefilled(true);
      }
      if (params.downPayment !== undefined) {
        setDownPayment(String(params.downPayment));
        setIsPrefilled(true);
      }
      if (params.interestRate !== undefined) {
        setInterestRate(String(params.interestRate));
        setIsPrefilled(true);
      }
      if (params.loanTerm !== undefined) {
        setLoanTerm(String(params.loanTerm));
        setIsPrefilled(true);
      }
      if (params.tradeIn !== undefined) {
        setTradeInValue(String(params.tradeIn));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.price && !params.amount) {
        const priceMatch = textContent.match(/\$?([\d,]+(?:\.\d{2})?)/);
        if (priceMatch) {
          setVehiclePrice(priceMatch[1].replace(/,/g, ''));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const loanTermOptions = [
    { value: '24', label: '24 months (2 years)' },
    { value: '36', label: '36 months (3 years)' },
    { value: '48', label: '48 months (4 years)' },
    { value: '60', label: '60 months (5 years)' },
    { value: '72', label: '72 months (6 years)' },
    { value: '84', label: '84 months (7 years)' },
  ];

  const calculations = useMemo(() => {
    const price = parseFloat(vehiclePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const tradeIn = parseFloat(tradeInValue) || 0;
    const rate = parseFloat(interestRate) || 0;
    const termMonths = parseInt(loanTerm) || 60;

    // Calculate loan amount
    const loanAmount = Math.max(0, price - down - tradeIn);

    // Calculate monthly payment using the loan payment formula
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyRate = rate / 100 / 12;
    let monthlyPayment = 0;
    let totalPayment = 0;
    let totalInterest = 0;

    if (loanAmount > 0 && monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, termMonths);
      monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1);
      totalPayment = monthlyPayment * termMonths;
      totalInterest = totalPayment - loanAmount;
    } else if (loanAmount > 0 && monthlyRate === 0) {
      // 0% interest rate
      monthlyPayment = loanAmount / termMonths;
      totalPayment = loanAmount;
      totalInterest = 0;
    }

    // Generate amortization schedule (first 12 months and summary)
    const amortization: AmortizationEntry[] = [];
    let balance = loanAmount;

    for (let month = 1; month <= termMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(0, balance - principalPayment);

      amortization.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      });
    }

    // Calculate yearly summaries
    const yearlySummary = [];
    for (let year = 1; year <= Math.ceil(termMonths / 12); year++) {
      const startMonth = (year - 1) * 12;
      const endMonth = Math.min(year * 12, termMonths);
      const yearEntries = amortization.slice(startMonth, endMonth);

      const yearPrincipal = yearEntries.reduce((sum, e) => sum + e.principal, 0);
      const yearInterest = yearEntries.reduce((sum, e) => sum + e.interest, 0);
      const endBalance = yearEntries[yearEntries.length - 1]?.balance || 0;

      yearlySummary.push({
        year,
        principal: yearPrincipal,
        interest: yearInterest,
        endBalance,
      });
    }

    return {
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      amortization,
      yearlySummary,
      downPaymentPercent: price > 0 ? ((down + tradeIn) / price) * 100 : 0,
    };
  }, [vehiclePrice, downPayment, tradeInValue, interestRate, loanTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Car className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carLoanCalculator.carLoanCalculator', 'Car Loan Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.carLoanCalculator.calculateYourAutoLoanPayments', 'Calculate your auto loan payments and total cost')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.carLoanCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Vehicle Price */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.carLoanCalculator.vehiclePrice', 'Vehicle Price')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={vehiclePrice}
              onChange={(e) => setVehiclePrice(e.target.value)}
              placeholder="35000"
              className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <TrendingDown className="w-4 h-4 inline mr-1" />
            {t('tools.carLoanCalculator.downPayment', 'Down Payment')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="5000"
              className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="flex gap-2">
            {[10, 15, 20, 25].map((percent) => {
              const amount = Math.round((parseFloat(vehiclePrice) || 0) * percent / 100);
              return (
                <button
                  key={percent}
                  onClick={() => setDownPayment(amount.toString())}
                  className={`flex-1 py-1.5 text-xs rounded-lg ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {percent}%
                </button>
              );
            })}
          </div>
        </div>

        {/* Trade-In Value */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Car className="w-4 h-4 inline mr-1" />
            {t('tools.carLoanCalculator.tradeInValueOptional', 'Trade-In Value (optional)')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={tradeInValue}
              onChange={(e) => setTradeInValue(e.target.value)}
              placeholder="0"
              className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Percent className="w-4 h-4 inline mr-1" />
            {t('tools.carLoanCalculator.interestRateApr', 'Interest Rate (APR)')}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="6.5"
              className={`w-full pl-4 pr-8 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
          </div>
          <div className="flex gap-2">
            {[4.5, 5.5, 6.5, 7.5, 8.5].map((rate) => (
              <button
                key={rate}
                onClick={() => setInterestRate(rate.toString())}
                className={`flex-1 py-1.5 text-xs rounded-lg ${parseFloat(interestRate) === rate ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calendar className="w-4 h-4 inline mr-1" />
            {t('tools.carLoanCalculator.loanTerm', 'Loan Term')}
          </label>
          <select
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {loanTermOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results Summary */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="text-center mb-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carLoanCalculator.estimatedMonthlyPayment', 'Estimated Monthly Payment')}</div>
            <div className="text-4xl font-bold text-blue-500">
              {formatCurrency(calculations.monthlyPayment)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              for {loanTerm} months
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carLoanCalculator.loanAmount', 'Loan Amount')}</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(calculations.loanAmount)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              After {formatCurrency(parseFloat(downPayment) + parseFloat(tradeInValue))} down
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carLoanCalculator.totalPayment', 'Total Payment')}</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">{formatCurrency(calculations.totalPayment)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.carLoanCalculator.overTheLifeOfThe', 'Over the life of the loan')}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-red-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carLoanCalculator.totalInterestPaid', 'Total Interest Paid')}</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(calculations.totalInterest)}</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {((calculations.totalInterest / calculations.loanAmount) * 100 || 0).toFixed(1)}% of loan amount
          </div>
        </div>

        {/* Amortization Summary Toggle */}
        <button
          onClick={() => setShowAmortization(!showAmortization)}
          className={`w-full py-2 rounded-lg font-medium ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {showAmortization ? t('tools.carLoanCalculator.hide', 'Hide') : t('tools.carLoanCalculator.show', 'Show')} Amortization Summary
        </button>

        {/* Amortization Summary */}
        {showAmortization && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.carLoanCalculator.yearlyAmortizationSummary', 'Yearly Amortization Summary')}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    <th className="text-left py-2">{t('tools.carLoanCalculator.year', 'Year')}</th>
                    <th className="text-right py-2">{t('tools.carLoanCalculator.principal', 'Principal')}</th>
                    <th className="text-right py-2">{t('tools.carLoanCalculator.interest', 'Interest')}</th>
                    <th className="text-right py-2">{t('tools.carLoanCalculator.balance', 'Balance')}</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {calculations.yearlySummary.map((row) => (
                    <tr key={row.year} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-2">Year {row.year}</td>
                      <td className="text-right py-2 text-green-500">{formatCurrency(row.principal)}</td>
                      <td className="text-right py-2 text-red-500">{formatCurrency(row.interest)}</td>
                      <td className="text-right py-2">{formatCurrency(row.endBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.carLoanCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.carLoanCalculator.aimForADownPayment', 'Aim for a down payment of at least 20% to avoid being underwater on your loan')}</li>
                <li>{t('tools.carLoanCalculator.shorterLoanTermsMeanHigher', 'Shorter loan terms mean higher payments but less total interest')}</li>
                <li>{t('tools.carLoanCalculator.yourCreditScoreSignificantlyAffects', 'Your credit score significantly affects the interest rate you qualify for')}</li>
                <li>{t('tools.carLoanCalculator.considerTotalCostOfOwnership', 'Consider total cost of ownership including insurance, fuel, and maintenance')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarLoanCalculatorTool;
