import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Calculator, PiggyBank, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface YearlyData {
  year: number;
  principal: number;
  interest: number;
  total: number;
}

interface CompoundInterestToolProps {
  uiConfig?: UIConfig;
}

export const CompoundInterestTool: React.FC<CompoundInterestToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);
  const [compoundFrequency, setCompoundFrequency] = useState(12);
  const [monthlyContribution, setMonthlyContribution] = useState(100);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setPrincipal(params.amount);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setPrincipal(params.numbers[0]);
        if (params.numbers.length > 1) {
          setRate(params.numbers[1]);
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const r = rate / 100;
    const n = compoundFrequency;
    const t = years;
    const P = principal;
    const PMT = monthlyContribution;

    // Compound interest formula: A = P(1 + r/n)^(nt)
    // With monthly contributions: A = P(1 + r/n)^(nt) + PMT × (((1 + r/n)^(nt) - 1) / (r/n))

    const yearlyData: YearlyData[] = [];
    let totalContributions = P;

    for (let year = 1; year <= t; year++) {
      const periods = n * year;
      const compoundFactor = Math.pow(1 + r / n, periods);

      // Future value of initial principal
      const fvPrincipal = P * compoundFactor;

      // Future value of monthly contributions (treating as end-of-period payments)
      let fvContributions = 0;
      if (PMT > 0 && r > 0) {
        fvContributions = PMT * ((compoundFactor - 1) / (r / n));
      } else if (PMT > 0) {
        fvContributions = PMT * periods;
      }

      const total = fvPrincipal + fvContributions;
      totalContributions = P + PMT * 12 * year;
      const interest = total - totalContributions;

      yearlyData.push({
        year,
        principal: totalContributions,
        interest,
        total,
      });
    }

    const finalAmount = yearlyData[yearlyData.length - 1]?.total || P;
    const totalInterest = finalAmount - (P + PMT * 12 * t);
    const totalContributionsEnd = P + PMT * 12 * t;

    return {
      finalAmount,
      totalInterest,
      totalContributions: totalContributionsEnd,
      yearlyData,
      effectiveRate: (Math.pow(1 + r / n, n) - 1) * 100,
    };
  }, [principal, rate, years, compoundFrequency, monthlyContribution]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const frequencies = [
    { value: 1, label: t('tools.compoundInterest.frequencies.annually', 'Annually') },
    { value: 2, label: t('tools.compoundInterest.frequencies.semiAnnually', 'Semi-annually') },
    { value: 4, label: t('tools.compoundInterest.frequencies.quarterly', 'Quarterly') },
    { value: 12, label: t('tools.compoundInterest.frequencies.monthly', 'Monthly') },
    { value: 365, label: t('tools.compoundInterest.frequencies.daily', 'Daily') },
  ];

  const maxTotal = Math.max(...calculations.yearlyData.map(d => d.total));

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {isPrefilled && (
        <div className="flex items-center gap-2 px-6 py-3 bg-[#0D9488]/10 border-b border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.compoundInterest.prefilled', 'Values loaded from AI response')}</span>
        </div>
      )}
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.compoundInterest.title', 'Compound Interest Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.compoundInterest.description', 'See how your money grows over time')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.compoundInterest.initialInvestment', 'Initial Investment')}
            </label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="number"
                min="0"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.compoundInterest.monthlyContribution', 'Monthly Contribution')}
            </label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="number"
                min="0"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.compoundInterest.annualInterestRate', 'Annual Interest Rate (%)')}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.compoundInterest.timePeriod', 'Time Period (Years)')}
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.compoundInterest.compoundFrequency', 'Compound Frequency')}
            </label>
            <select
              value={compoundFrequency}
              onChange={(e) => setCompoundFrequency(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {frequencies.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'}`}>{t('tools.compoundInterest.finalAmount', 'Final Amount')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.finalAmount)}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.compoundInterest.totalContributions', 'Total Contributions')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.totalContributions)}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{t('tools.compoundInterest.totalInterestEarned', 'Total Interest Earned')}</p>
            <p className={`text-2xl font-bold text-green-500`}>
              {formatCurrency(calculations.totalInterest)}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>{t('tools.compoundInterest.effectiveAnnualRate', 'Effective Annual Rate')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.effectiveRate.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Visual Chart */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.compoundInterest.growthOverTime', 'Growth Over Time')}</h4>
          <div className="space-y-2">
            {calculations.yearlyData.map((data) => (
              <div key={data.year} className="flex items-center gap-3">
                <span className={`w-12 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.compoundInterest.year', 'Year')} {data.year}
                </span>
                <div className="flex-1 h-6 rounded-full overflow-hidden flex" style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}>
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(data.principal / maxTotal) * 100}%` }}
                    title={`Contributions: ${formatCurrency(data.principal)}`}
                  />
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${(data.interest / maxTotal) * 100}%` }}
                    title={`Interest: ${formatCurrency(data.interest)}`}
                  />
                </div>
                <span className={`w-24 text-sm text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(data.total)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.compoundInterest.contributions', 'Contributions')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.compoundInterest.interest', 'Interest')}</span>
            </div>
          </div>
        </div>

        {/* Year-by-Year Table */}
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.compoundInterest.year', 'Year')}</th>
                <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.compoundInterest.totalContributions', 'Total Contributions')}</th>
                <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.compoundInterest.interestEarned', 'Interest Earned')}</th>
                <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.compoundInterest.totalBalance', 'Total Balance')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {calculations.yearlyData.map((data) => (
                <tr key={data.year} className={isDark ? 'bg-gray-900' : 'bg-white'}>
                  <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{data.year}</td>
                  <td className={`px-4 py-3 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(data.principal)}
                  </td>
                  <td className={`px-4 py-3 text-right text-green-500`}>
                    {formatCurrency(data.interest)}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(data.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompoundInterestTool;
