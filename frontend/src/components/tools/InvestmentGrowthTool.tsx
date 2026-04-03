import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Copy, Check, DollarSign, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface InvestmentGrowthToolProps {
  uiConfig?: UIConfig;
}

export const InvestmentGrowthTool: React.FC<InvestmentGrowthToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [principal, setPrincipal] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [annualReturn, setAnnualReturn] = useState('7');
  const [years, setYears] = useState('30');
  const [copied, setCopied] = useState(false);
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
          setMonthlyContribution(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const results = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const m = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(annualReturn) || 0) / 100;
    const t = parseInt(years) || 0;

    const monthlyRate = r / 12;
    const totalMonths = t * 12;

    // Future value calculation
    let balance = p;
    const yearlyData: { year: number; balance: number; contributions: number; earnings: number }[] = [];

    for (let year = 1; year <= t; year++) {
      const startBalance = balance;
      for (let month = 0; month < 12; month++) {
        balance = balance * (1 + monthlyRate) + m;
      }
      const yearContributions = m * 12;
      const yearEarnings = balance - startBalance - yearContributions;
      yearlyData.push({
        year,
        balance,
        contributions: p + (m * 12 * year),
        earnings: balance - (p + m * 12 * year),
      });
    }

    const totalContributions = p + (m * totalMonths);
    const totalEarnings = balance - totalContributions;

    return {
      finalBalance: balance,
      totalContributions,
      totalEarnings,
      yearlyData,
    };
  }, [principal, monthlyContribution, annualReturn, years]);

  const handleCopy = () => {
    const text = `Investment Growth Projection\nFinal Balance: $${results.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}\nTotal Contributions: $${results.totalContributions.toLocaleString()}\nTotal Earnings: $${results.totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const presets = [
    { label: 'Conservative', return: '5' },
    { label: 'Moderate', return: '7' },
    { label: 'Aggressive', return: '10' },
    { label: 'S&P 500 Avg', return: '10.5' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.investmentGrowth.investmentGrowthCalculator', 'Investment Growth Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.investmentGrowth.projectYourInvestmentGrowthOver', 'Project your investment growth over time')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.investmentGrowth.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.investmentGrowth.initialInvestment', 'Initial Investment ($)')}</label>
            <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.investmentGrowth.monthlyContribution', 'Monthly Contribution ($)')}</label>
            <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.investmentGrowth.annualReturn', 'Annual Return (%)')}</label>
            <input type="number" step="0.1" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.investmentGrowth.investmentPeriodYears', 'Investment Period (years)')}</label>
            <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
        </div>

        {/* Return Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button key={preset.label} onClick={() => setAnnualReturn(preset.return)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${annualReturn === preset.return ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              {preset.label} ({preset.return}%)
            </button>
          ))}
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{t('tools.investmentGrowth.projectionResults', 'Projection Results')}</h4>
            <button onClick={handleCopy} className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.investmentGrowth.copied', 'Copied!') : t('tools.investmentGrowth.copy', 'Copy')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-3xl font-bold text-blue-500`}>{formatCurrency(results.finalBalance)}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.investmentGrowth.finalBalance', 'Final Balance')}</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(results.totalContributions)}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.investmentGrowth.yourContributions', 'Your Contributions')}</div>
            </div>
            <div>
              <div className={`text-3xl font-bold text-green-500`}>{formatCurrency(results.totalEarnings)}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.investmentGrowth.investmentEarnings', 'Investment Earnings')}</div>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.investmentGrowth.growthOverTime', 'Growth Over Time')}</h4>
          <div className="space-y-2">
            {results.yearlyData.filter((_, i) => i % 5 === 4 || i === results.yearlyData.length - 1).map((data) => (
              <div key={data.year} className="flex items-center gap-3">
                <span className={`text-sm w-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Year {data.year}</span>
                <div className={`flex-1 h-6 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-full flex">
                    <div className="bg-gray-400" style={{ width: `${(data.contributions / results.finalBalance) * 100}%` }} />
                    <div className="bg-green-500" style={{ width: `${(data.earnings / results.finalBalance) * 100}%` }} />
                  </div>
                </div>
                <span className={`text-sm w-20 text-right font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(data.balance)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-400 rounded"></span> {t('tools.investmentGrowth.contributions', 'Contributions')}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> {t('tools.investmentGrowth.earnings', 'Earnings')}</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.investmentGrowth.note', 'Note:')}</strong> This calculator assumes consistent monthly contributions and a fixed annual return rate. Actual investment returns will vary.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentGrowthTool;
