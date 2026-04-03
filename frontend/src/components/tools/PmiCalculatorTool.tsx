import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Home, DollarSign, Percent, Calendar, Info, Sparkles, TrendingDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PmiCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const PmiCalculatorTool: React.FC<PmiCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homePrice, setHomePrice] = useState('400000');
  const [downPayment, setDownPayment] = useState('40000');
  const [loanTerm, setLoanTerm] = useState('30');
  const [interestRate, setInterestRate] = useState('7');
  const [creditScore, setCreditScore] = useState('720');
  const [pmiRate, setPmiRate] = useState('0.5');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.price !== undefined || params.amount !== undefined) {
        setHomePrice(String(params.price || params.amount));
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
    }
  }, [uiConfig?.params]);

  // Auto-adjust PMI rate based on LTV and credit score
  useEffect(() => {
    const price = parseFloat(homePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const score = parseInt(creditScore) || 720;
    const ltv = price > 0 ? ((price - down) / price) * 100 : 0;

    // PMI rate estimation based on LTV and credit score
    let estimatedRate = 0.5;
    if (ltv > 95) {
      estimatedRate = score >= 760 ? 0.75 : score >= 700 ? 1.1 : score >= 660 ? 1.5 : 2.0;
    } else if (ltv > 90) {
      estimatedRate = score >= 760 ? 0.5 : score >= 700 ? 0.8 : score >= 660 ? 1.2 : 1.7;
    } else if (ltv > 85) {
      estimatedRate = score >= 760 ? 0.35 : score >= 700 ? 0.55 : score >= 660 ? 0.85 : 1.3;
    } else {
      estimatedRate = score >= 760 ? 0.25 : score >= 700 ? 0.4 : score >= 660 ? 0.65 : 1.0;
    }

    setPmiRate(estimatedRate.toFixed(2));
  }, [homePrice, downPayment, creditScore]);

  const calculations = useMemo(() => {
    const price = parseFloat(homePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const term = parseInt(loanTerm) || 30;
    const rate = parseFloat(interestRate) || 7;
    const pmi = parseFloat(pmiRate) || 0.5;

    const loanAmount = price - down;
    const ltv = price > 0 ? (loanAmount / price) * 100 : 0;
    const downPaymentPercent = price > 0 ? (down / price) * 100 : 0;

    // Calculate monthly mortgage payment
    const monthlyRate = rate / 100 / 12;
    const termMonths = term * 12;
    let monthlyMortgage = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, termMonths);
      monthlyMortgage = loanAmount * (monthlyRate * factor) / (factor - 1);
    }

    // PMI calculations
    const annualPmi = (loanAmount * pmi) / 100;
    const monthlyPmi = annualPmi / 12;
    const pmiRequired = ltv > 80;

    // Calculate when PMI can be removed (when LTV reaches 80%)
    let monthsToRemovePmi = 0;
    let balance = loanAmount;
    if (pmiRequired) {
      const targetBalance = price * 0.80;
      while (balance > targetBalance && monthsToRemovePmi < termMonths) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyMortgage - interestPayment;
        balance -= principalPayment;
        monthsToRemovePmi++;
      }
    }

    const yearsToRemovePmi = monthsToRemovePmi / 12;
    const totalPmiPaid = monthlyPmi * monthsToRemovePmi;

    // Calculate automatic PMI removal at 78% LTV
    let monthsToAutoRemove = 0;
    balance = loanAmount;
    const autoRemoveBalance = price * 0.78;
    while (balance > autoRemoveBalance && monthsToAutoRemove < termMonths) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyMortgage - interestPayment;
      balance -= principalPayment;
      monthsToAutoRemove++;
    }

    return {
      loanAmount,
      ltv,
      downPaymentPercent,
      monthlyMortgage,
      monthlyPmi,
      annualPmi,
      pmiRequired,
      monthsToRemovePmi,
      yearsToRemovePmi,
      monthsToAutoRemove,
      yearsToAutoRemove: monthsToAutoRemove / 12,
      totalPmiPaid,
      totalMonthlyWithPmi: monthlyMortgage + monthlyPmi,
      totalMonthlyWithoutPmi: monthlyMortgage,
    };
  }, [homePrice, downPayment, loanTerm, interestRate, pmiRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const creditScoreOptions = [
    { value: '760', label: '760+ (Excellent)' },
    { value: '720', label: '720-759 (Very Good)' },
    { value: '680', label: '680-719 (Good)' },
    { value: '660', label: '660-679 (Fair)' },
    { value: '620', label: '620-659 (Poor)' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Shield className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pmiCalculator.pmiCalculator', 'PMI Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pmiCalculator.privateMortgageInsuranceEstimator', 'Private Mortgage Insurance estimator')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.pmiCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Home Price */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.pmiCalculator.homePrice', 'Home Price')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.pmiCalculator.downPayment', 'Down Payment')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="flex gap-2">
            {[3, 5, 10, 15, 20].map((pct) => {
              const amount = Math.round((parseFloat(homePrice) || 0) * pct / 100);
              return (
                <button
                  key={pct}
                  onClick={() => setDownPayment(amount.toString())}
                  className={`flex-1 py-1.5 text-xs rounded-lg ${pct === 20 ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {pct}%{pct === 20 && ' (No PMI)'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Credit Score & Interest Rate */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.pmiCalculator.creditScoreRange', 'Credit Score Range')}
            </label>
            <select
              value={creditScore}
              onChange={(e) => setCreditScore(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {creditScoreOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Percent className="w-4 h-4 inline mr-1" />
              {t('tools.pmiCalculator.interestRate', 'Interest Rate')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.125"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className={`w-full pl-4 pr-8 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
            </div>
          </div>
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calendar className="w-4 h-4 inline mr-1" />
            {t('tools.pmiCalculator.loanTerm', 'Loan Term')}
          </label>
          <div className="flex gap-2">
            {['15', '20', '30'].map((term) => (
              <button
                key={term}
                onClick={() => setLoanTerm(term)}
                className={`flex-1 py-2 rounded-lg font-medium ${loanTerm === term ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {term} years
              </button>
            ))}
          </div>
        </div>

        {/* LTV Display */}
        <div className={`p-4 rounded-xl ${calculations.pmiRequired ? (isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200') : (isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')} border`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pmiCalculator.loanToValueRatio', 'Loan-to-Value Ratio')}</div>
              <div className={`text-3xl font-bold ${calculations.pmiRequired ? 'text-amber-500' : 'text-green-500'}`}>
                {calculations.ltv.toFixed(1)}%
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${calculations.pmiRequired ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>
              {calculations.pmiRequired ? t('tools.pmiCalculator.pmiRequired', 'PMI Required') : t('tools.pmiCalculator.noPmiNeeded', 'No PMI Needed')}
            </div>
          </div>
        </div>

        {/* PMI Details */}
        {calculations.pmiRequired && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pmiCalculator.estimatedPmiRate', 'Estimated PMI Rate')}</div>
                <div className="text-2xl font-bold text-amber-500">{pmiRate}%</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.pmiCalculator.annualRate', 'Annual rate')}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pmiCalculator.monthlyPmi', 'Monthly PMI')}</div>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(calculations.monthlyPmi)}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatCurrency(calculations.annualPmi)}/year</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-[#0D9488]" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pmiCalculator.pmiRemovalTimeline', 'PMI Removal Timeline')}</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pmiCalculator.requestRemoval80Ltv', 'Request Removal (80% LTV)')}</div>
                  <div className="text-xl font-bold text-[#0D9488]">{calculations.yearsToRemovePmi.toFixed(1)} years</div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.monthsToRemovePmi} months</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pmiCalculator.autoRemoval78Ltv', 'Auto Removal (78% LTV)')}</div>
                  <div className="text-xl font-bold text-[#0D9488]">{calculations.yearsToAutoRemove.toFixed(1)} years</div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.monthsToAutoRemove} months</div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>{t('tools.pmiCalculator.totalPmiCostUntilRemoval', 'Total PMI Cost Until Removal')}</div>
              <div className="text-2xl font-bold text-red-500">{formatCurrency(calculations.totalPmiPaid)}</div>
            </div>
          </>
        )}

        {/* Monthly Payment Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.pmiCalculator.monthlyPayment', 'Monthly Payment')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pmiCalculator.mortgageOnly', 'Mortgage Only')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(calculations.monthlyMortgage)}
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pmiCalculator.withPmi', 'With PMI')}</div>
              <div className="text-xl font-bold text-[#0D9488]">
                {formatCurrency(calculations.totalMonthlyWithPmi)}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.pmiCalculator.aboutPmi', 'About PMI:')}</strong> Private Mortgage Insurance protects lenders when you put less than 20% down. You can request PMI removal when your LTV reaches 80%, and it's automatically removed at 78% LTV. PMI rates vary based on your credit score, LTV ratio, and loan type.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PmiCalculatorTool;
