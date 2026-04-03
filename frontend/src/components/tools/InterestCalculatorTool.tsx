import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PiggyBank, TrendingUp, Calendar, DollarSign, Percent, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type InterestType = 'simple' | 'compound';
type CompoundFrequency = 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily';

interface InterestCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const InterestCalculatorTool: React.FC<InterestCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [interestType, setInterestType] = useState<InterestType>('compound');
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');
  const [compoundFrequency, setCompoundFrequency] = useState<CompoundFrequency>('monthly');
  const [additionalContribution, setAdditionalContribution] = useState('100');
  const [contributionTiming, setContributionTiming] = useState<'beginning' | 'end'>('end');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setPrincipal(params.amount.toString());
        setIsPrefilled(true);
      } else if (params.numbers && params.numbers.length > 0) {
        setPrincipal(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setRate(params.numbers[1].toString());
        }
        if (params.numbers.length > 2) {
          setYears(params.numbers[2].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const frequencyMap: Record<CompoundFrequency, { n: number; label: string }> = {
    annually: { n: 1, label: 'Annually' },
    semiannually: { n: 2, label: 'Semi-annually' },
    quarterly: { n: 4, label: 'Quarterly' },
    monthly: { n: 12, label: 'Monthly' },
    daily: { n: 365, label: 'Daily' },
  };

  const calculations = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const t = parseFloat(years) || 0;
    const PMT = parseFloat(additionalContribution) || 0;
    const n = frequencyMap[compoundFrequency].n;

    let finalAmount: number;
    let totalContributions: number;
    let totalInterest: number;
    const yearlyBreakdown: { year: number; balance: number; interest: number; contributions: number }[] = [];

    if (interestType === 'simple') {
      // Simple Interest: A = P(1 + rt)
      finalAmount = P * (1 + r * t);
      totalContributions = P + PMT * t * 12; // Monthly contributions
      totalInterest = finalAmount + PMT * t * 12 - P - PMT * t * 12;
      finalAmount += PMT * t * 12;

      for (let year = 1; year <= t; year++) {
        const interest = P * r * year;
        const contributions = P + PMT * 12 * year;
        yearlyBreakdown.push({
          year,
          balance: P + interest + PMT * 12 * year,
          interest,
          contributions,
        });
      }
    } else {
      // Compound Interest with contributions
      // A = P(1 + r/n)^(nt) + PMT × (((1 + r/n)^(nt) - 1) / (r/n))
      const compoundFactor = Math.pow(1 + r / n, n * t);
      let principalGrowth = P * compoundFactor;

      // Future value of series (contributions)
      let contributionGrowth = 0;
      if (r > 0 && PMT > 0) {
        const periodicRate = r / n;
        const periods = n * t;
        const monthlyToPeriodic = PMT * (12 / n);

        if (contributionTiming === 'beginning') {
          contributionGrowth = monthlyToPeriodic * ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate) * (1 + periodicRate);
        } else {
          contributionGrowth = monthlyToPeriodic * ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate);
        }
      } else if (PMT > 0) {
        contributionGrowth = PMT * 12 * t;
      }

      finalAmount = principalGrowth + contributionGrowth;
      totalContributions = P + PMT * 12 * t;
      totalInterest = finalAmount - totalContributions;

      // Yearly breakdown
      let runningBalance = P;
      let totalContrib = P;
      for (let year = 1; year <= t; year++) {
        const yearFactor = Math.pow(1 + r / n, n * year);
        let yearPrincipalGrowth = P * yearFactor;

        let yearContributionGrowth = 0;
        if (r > 0 && PMT > 0) {
          const periodicRate = r / n;
          const periods = n * year;
          const monthlyToPeriodic = PMT * (12 / n);
          yearContributionGrowth = monthlyToPeriodic * ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate);
        } else if (PMT > 0) {
          yearContributionGrowth = PMT * 12 * year;
        }

        const yearBalance = yearPrincipalGrowth + yearContributionGrowth;
        const yearContributions = P + PMT * 12 * year;
        const yearInterest = yearBalance - yearContributions;

        yearlyBreakdown.push({
          year,
          balance: yearBalance,
          interest: yearInterest,
          contributions: yearContributions,
        });
      }
    }

    return {
      finalAmount,
      totalContributions,
      totalInterest,
      yearlyBreakdown,
      effectiveRate: interestType === 'compound' ? (Math.pow(1 + r / n, n) - 1) * 100 : r * 100,
    };
  }, [interestType, principal, rate, years, compoundFrequency, additionalContribution, contributionTiming]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg"><PiggyBank className="w-5 h-5 text-green-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.interestCalculator.interestCalculator', 'Interest Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.interestCalculator.calculateSimpleCompoundInterest', 'Calculate simple & compound interest')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.interestCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}
        {/* Interest Type */}
        <div className="flex gap-2">
          <button
            onClick={() => setInterestType('simple')}
            className={`flex-1 py-2 rounded-lg ${interestType === 'simple' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.interestCalculator.simpleInterest', 'Simple Interest')}
          </button>
          <button
            onClick={() => setInterestType('compound')}
            className={`flex-1 py-2 rounded-lg ${interestType === 'compound' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.interestCalculator.compoundInterest', 'Compound Interest')}
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.interestCalculator.principalAmount', 'Principal Amount')}
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Percent className="w-4 h-4 inline mr-1" />
              {t('tools.interestCalculator.annualInterestRate', 'Annual Interest Rate (%)')}
            </label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.interestCalculator.timePeriodYears', 'Time Period (Years)')}
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.interestCalculator.monthlyContribution', 'Monthly Contribution')}
            </label>
            <input
              type="number"
              value={additionalContribution}
              onChange={(e) => setAdditionalContribution(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Compound Frequency */}
        {interestType === 'compound' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.interestCalculator.compoundFrequency', 'Compound Frequency')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(frequencyMap).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setCompoundFrequency(key as CompoundFrequency)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${compoundFrequency === key ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.interestCalculator.finalBalance', 'Final Balance')}</div>
          <div className="text-5xl font-bold text-green-500 my-2">
            {formatCurrency(calculations.finalAmount)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            After {years} years at {rate}% {interestType} interest
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.interestCalculator.totalContributions', 'Total Contributions')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.totalContributions)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.interestCalculator.interestEarned', 'Interest Earned')}</div>
            <div className="text-xl font-bold text-green-500">
              {formatCurrency(calculations.totalInterest)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {interestType === 'compound' ? t('tools.interestCalculator.effectiveRate', 'Effective Rate') : t('tools.interestCalculator.annualRate', 'Annual Rate')}
            </div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.effectiveRate.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Visual Growth */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.interestCalculator.growthOverTime', 'Growth Over Time')}</h4>
          </div>
          <div className="h-24 flex items-end gap-1">
            {calculations.yearlyBreakdown.map((year, idx) => {
              const maxBalance = calculations.yearlyBreakdown[calculations.yearlyBreakdown.length - 1]?.balance || 1;
              const height = (year.balance / maxBalance) * 100;
              const interestPercent = year.balance > 0 ? (year.interest / year.balance) * 100 : 0;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col justify-end rounded-t overflow-hidden"
                  style={{ height: `${height}%` }}
                  title={`Year ${year.year}: ${formatCurrency(year.balance)}`}
                >
                  <div className="bg-green-500" style={{ height: `${interestPercent}%` }} />
                  <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} style={{ height: `${100 - interestPercent}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.interestCalculator.year1', 'Year 1')}</span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Year {years}</span>
          </div>
          <div className="flex gap-4 justify-center mt-2">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.interestCalculator.interest', 'Interest')}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className={`w-3 h-3 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.interestCalculator.principal', 'Principal')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestCalculatorTool;
