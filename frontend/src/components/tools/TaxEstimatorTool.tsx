import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, DollarSign, TrendingDown, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_household';
type IncomeType = 'salary' | 'self_employed';
type StateCode = 'CA' | 'NY' | 'TX' | 'FL' | 'WA' | 'IL' | 'GA' | 'AK';

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface StateTax {
  name: string;
  type: 'flat' | 'progressive' | 'none';
  rate?: number;
  brackets?: TaxBracket[];
}

// 2024 Federal Tax Brackets
const FEDERAL_TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married_joint: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  married_separate: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 365600, rate: 0.35 },
    { min: 365600, max: Infinity, rate: 0.37 },
  ],
  head_household: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

// 2024 Standard Deductions
const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 14600,
  married_joint: 29200,
  married_separate: 14600,
  head_household: 21900,
};

// State Tax Information (2024)
const STATE_TAXES: Record<StateCode, StateTax> = {
  CA: {
    name: 'California',
    type: 'progressive',
    brackets: [
      { min: 0, max: 10412, rate: 0.01 },
      { min: 10412, max: 24684, rate: 0.02 },
      { min: 24684, max: 38959, rate: 0.04 },
      { min: 38959, max: 54081, rate: 0.06 },
      { min: 54081, max: 68350, rate: 0.08 },
      { min: 68350, max: 349137, rate: 0.093 },
      { min: 349137, max: 418961, rate: 0.103 },
      { min: 418961, max: 698271, rate: 0.113 },
      { min: 698271, max: Infinity, rate: 0.123 },
    ],
  },
  NY: {
    name: 'New York',
    type: 'progressive',
    brackets: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.055 },
      { min: 80650, max: 215400, rate: 0.06 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 },
    ],
  },
  TX: {
    name: 'Texas',
    type: 'none',
  },
  FL: {
    name: 'Florida',
    type: 'none',
  },
  WA: {
    name: 'Washington',
    type: 'none',
  },
  IL: {
    name: 'Illinois',
    type: 'flat',
    rate: 0.0495,
  },
  GA: {
    name: 'Georgia',
    type: 'flat',
    rate: 0.0549,
  },
  AK: {
    name: 'Alaska',
    type: 'none',
  },
};

// FICA rates for 2024
const SOCIAL_SECURITY_RATE = 0.062;
const SOCIAL_SECURITY_WAGE_BASE = 168600;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLD = 200000;

// Self-employment tax rates
const SELF_EMPLOYMENT_DEDUCTION_RATE = 0.9235; // 92.35% of net earnings

// 401k contribution limits for 2024
const MAX_401K_CONTRIBUTION = 23000;
const MAX_401K_CATCH_UP = 7500; // For age 50+

interface TaxEstimatorToolProps {
  uiConfig?: UIConfig;
}

export const TaxEstimatorTool: React.FC<TaxEstimatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [grossIncome, setGrossIncome] = useState<string>('75000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [incomeType, setIncomeType] = useState<IncomeType>('salary');
  const [state, setState] = useState<StateCode>('CA');
  const [contribution401k, setContribution401k] = useState<string>('0');
  const [showBrackets, setShowBrackets] = useState<boolean>(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setGrossIncome(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setGrossIncome(params.numbers[0].toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateProgressiveTax = (income: number, brackets: TaxBracket[]): number => {
    let tax = 0;
    let remainingIncome = income;

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.max - bracket.min
      );

      if (income > bracket.min) {
        tax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
      }
    }

    return tax;
  };

  const getMarginalRate = (income: number, brackets: TaxBracket[]): number => {
    for (const bracket of brackets) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket.rate;
      }
    }
    return brackets[brackets.length - 1].rate;
  };

  const taxCalculations = useMemo(() => {
    const income = parseFloat(grossIncome) || 0;
    const retirement = Math.min(parseFloat(contribution401k) || 0, MAX_401K_CONTRIBUTION);

    // Adjusted Gross Income (AGI)
    let agi = income - retirement;

    // Self-employment deduction (half of SE tax)
    let selfEmploymentTax = 0;
    if (incomeType === 'self_employed') {
      const netEarnings = income * SELF_EMPLOYMENT_DEDUCTION_RATE;
      selfEmploymentTax = Math.min(netEarnings, SOCIAL_SECURITY_WAGE_BASE) * 0.124 +
        netEarnings * 0.029;
      // Deduct half of SE tax from AGI
      agi -= selfEmploymentTax / 2;
    }

    // Standard deduction
    const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
    const taxableIncome = Math.max(0, agi - standardDeduction);

    // Federal tax calculation
    const federalBrackets = FEDERAL_TAX_BRACKETS[filingStatus];
    const federalTax = calculateProgressiveTax(taxableIncome, federalBrackets);
    const marginalRate = getMarginalRate(taxableIncome, federalBrackets);

    // State tax calculation
    let stateTax = 0;
    const stateInfo = STATE_TAXES[state];
    if (stateInfo.type === 'flat' && stateInfo.rate) {
      stateTax = taxableIncome * stateInfo.rate;
    } else if (stateInfo.type === 'progressive' && stateInfo.brackets) {
      stateTax = calculateProgressiveTax(taxableIncome, stateInfo.brackets);
    }

    // FICA calculation (for W-2 employees)
    let ficaTax = 0;
    if (incomeType === 'salary') {
      // Social Security (up to wage base)
      const socialSecurity = Math.min(income, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE;
      // Medicare
      let medicare = income * MEDICARE_RATE;
      // Additional Medicare for high earners
      if (income > ADDITIONAL_MEDICARE_THRESHOLD) {
        medicare += (income - ADDITIONAL_MEDICARE_THRESHOLD) * ADDITIONAL_MEDICARE_RATE;
      }
      ficaTax = socialSecurity + medicare;
    }

    // Total tax
    const employmentTax = incomeType === 'salary' ? ficaTax : selfEmploymentTax;
    const totalTax = federalTax + stateTax + employmentTax;

    // Take-home calculations
    const takeHomeAnnual = income - totalTax - retirement;
    const takeHomeMonthly = takeHomeAnnual / 12;

    // Effective rates
    const effectiveFederalRate = income > 0 ? (federalTax / income) * 100 : 0;
    const effectiveStateRate = income > 0 ? (stateTax / income) * 100 : 0;
    const effectiveTotalRate = income > 0 ? (totalTax / income) * 100 : 0;

    return {
      grossIncome: income,
      agi,
      standardDeduction,
      taxableIncome,
      federalTax,
      stateTax,
      ficaTax,
      selfEmploymentTax,
      employmentTax,
      totalTax,
      takeHomeAnnual,
      takeHomeMonthly,
      effectiveFederalRate,
      effectiveStateRate,
      effectiveTotalRate,
      marginalRate: marginalRate * 100,
      retirement401k: retirement,
    };
  }, [grossIncome, filingStatus, incomeType, state, contribution401k]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.taxEstimator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <Calculator className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.taxEstimator.2024TaxEstimator', '2024 Tax Estimator')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.taxEstimator.estimateYourFederalAndState', 'Estimate your federal and state income taxes')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.taxEstimator.yourInformation', 'Your Information')}
            </h2>

            {/* Gross Income */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taxEstimator.annualGrossIncome', 'Annual Gross Income')}
              </label>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="number"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="75000"
                />
              </div>
            </div>

            {/* Filing Status */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taxEstimator.filingStatus', 'Filing Status')}
              </label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="single">{t('tools.taxEstimator.single', 'Single')}</option>
                <option value="married_joint">{t('tools.taxEstimator.marriedFilingJointly', 'Married Filing Jointly')}</option>
                <option value="married_separate">{t('tools.taxEstimator.marriedFilingSeparately', 'Married Filing Separately')}</option>
                <option value="head_household">{t('tools.taxEstimator.headOfHousehold', 'Head of Household')}</option>
              </select>
            </div>

            {/* Income Type */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taxEstimator.incomeType', 'Income Type')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIncomeType('salary')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    incomeType === 'salary'
                      ? isDark
                        ? 'border-blue-500 bg-blue-900/30 text-blue-400'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDark
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {t('tools.taxEstimator.w2Employee', 'W-2 Employee')}
                </button>
                <button
                  onClick={() => setIncomeType('self_employed')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    incomeType === 'self_employed'
                      ? isDark
                        ? 'border-blue-500 bg-blue-900/30 text-blue-400'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDark
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {t('tools.taxEstimator.selfEmployed', 'Self-Employed')}
                </button>
              </div>
            </div>

            {/* State */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taxEstimator.state', 'State')}
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value as StateCode)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                {Object.entries(STATE_TAXES).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.name} {info.type === 'none' ? '(No State Tax)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 401k Contribution */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taxEstimator.401KContribution', '401(k) Contribution')}
              </label>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="number"
                  value={contribution401k}
                  onChange={(e) => setContribution401k(e.target.value)}
                  max={MAX_401K_CONTRIBUTION}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0"
                />
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                2024 limit: {formatCurrency(MAX_401K_CONTRIBUTION)} (+ {formatCurrency(MAX_401K_CATCH_UP)} catch-up if 50+)
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Take Home Pay */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-800' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'} shadow-lg`}>
              <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                {t('tools.taxEstimator.estimatedTakeHomePay', 'Estimated Take-Home Pay')}
              </h3>
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(taxCalculations.takeHomeAnnual)}
                <span className={`text-lg font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}> /year</span>
              </div>
              <div className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatCurrency(taxCalculations.takeHomeMonthly)}
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}> /month</span>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.taxEstimator.taxBreakdown', 'Tax Breakdown')}
              </h3>

              <div className="space-y-3">
                <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.taxEstimator.grossIncome', 'Gross Income')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(taxCalculations.grossIncome)}
                  </span>
                </div>

                <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>401(k) Contribution</span>
                  <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    -{formatCurrency(taxCalculations.retirement401k)}
                  </span>
                </div>

                <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.taxEstimator.standardDeduction', 'Standard Deduction')}</span>
                  <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    -{formatCurrency(taxCalculations.standardDeduction)}
                  </span>
                </div>

                <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.taxEstimator.taxableIncome', 'Taxable Income')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(taxCalculations.taxableIncome)}
                  </span>
                </div>

                <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.taxEstimator.federalTax', 'Federal Tax')}</span>
                  <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    -{formatCurrency(taxCalculations.federalTax)}
                  </span>
                </div>

                <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    State Tax ({STATE_TAXES[state].name})
                  </span>
                  <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    -{formatCurrency(taxCalculations.stateTax)}
                  </span>
                </div>

                <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {incomeType === 'salary' ? t('tools.taxEstimator.ficaSocialSecurityMedicare', 'FICA (Social Security + Medicare)') : t('tools.taxEstimator.selfEmploymentTax', 'Self-Employment Tax')}
                  </span>
                  <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    -{formatCurrency(taxCalculations.employmentTax)}
                  </span>
                </div>

                <div className={`flex justify-between items-center py-3 rounded-lg px-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.taxEstimator.totalTax', 'Total Tax')}</span>
                  <span className={`font-bold text-lg ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    -{formatCurrency(taxCalculations.totalTax)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tax Rates */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.taxEstimator.taxRates', 'Tax Rates')}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.taxEstimator.effectiveFederalRate', 'Effective Federal Rate')}
                  </div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPercent(taxCalculations.effectiveFederalRate)}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.taxEstimator.effectiveStateRate', 'Effective State Rate')}
                  </div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPercent(taxCalculations.effectiveStateRate)}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    {t('tools.taxEstimator.marginalRate', 'Marginal Rate')}
                  </div>
                  <div className={`text-xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                    {formatPercent(taxCalculations.marginalRate)}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/30 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
                  <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                    {t('tools.taxEstimator.totalEffectiveRate', 'Total Effective Rate')}
                  </div>
                  <div className={`text-xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                    {formatPercent(taxCalculations.effectiveTotalRate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Brackets Accordion */}
            <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <button
                onClick={() => setShowBrackets(!showBrackets)}
                className={`w-full p-6 flex items-center justify-between ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    2024 Federal Tax Brackets ({filingStatus.replace('_', ' ')})
                  </span>
                </div>
                {showBrackets ? (
                  <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </button>

              {showBrackets && (
                <div className={`px-6 pb-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="mt-4 space-y-2">
                    {FEDERAL_TAX_BRACKETS[filingStatus].map((bracket, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center py-2 px-3 rounded ${
                          taxCalculations.taxableIncome >= bracket.min &&
                          taxCalculations.taxableIncome < bracket.max
                            ? isDark
                              ? 'bg-blue-900/30 border border-blue-800'
                              : 'bg-blue-50 border border-blue-200'
                            : isDark
                              ? 'bg-gray-700'
                              : 'bg-gray-100'
                        }`}
                      >
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                          {formatCurrency(bracket.min)} - {bracket.max === Infinity ? '\u221E' : formatCurrency(bracket.max)}
                        </span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {(bracket.rate * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className={`rounded-xl p-4 ${isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex gap-3">
                <Info className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    <strong>{t('tools.taxEstimator.disclaimer', 'Disclaimer:')}</strong> This is an estimate only. Actual taxes may vary based on deductions, credits, and other factors. Consult a tax professional for accurate tax advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxEstimatorTool;
