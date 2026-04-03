import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, ArrowRightLeft, Calculator, Briefcase, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type SalaryType = 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'annual';

interface SalaryBreakdown {
  hourly: number;
  daily: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  annual: number;
}

interface SalaryCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SalaryCalculatorTool: React.FC<SalaryCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [amount, setAmount] = useState(50000);
  const [salaryType, setSalaryType] = useState<SalaryType>('annual');
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [federalTax, setFederalTax] = useState(22);
  const [stateTax, setStateTax] = useState(5);
  const [deductions, setDeductions] = useState(0);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setAmount(params.amount);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setAmount(params.numbers[0]);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo((): { gross: SalaryBreakdown; net: SalaryBreakdown; taxes: number } => {
    const hoursPerYear = hoursPerWeek * weeksPerYear;
    const workDaysPerYear = weeksPerYear * 5;

    // Convert to annual first
    let annual = 0;
    switch (salaryType) {
      case 'hourly':
        annual = amount * hoursPerYear;
        break;
      case 'daily':
        annual = amount * workDaysPerYear;
        break;
      case 'weekly':
        annual = amount * weeksPerYear;
        break;
      case 'biweekly':
        annual = amount * (weeksPerYear / 2);
        break;
      case 'monthly':
        annual = amount * 12;
        break;
      case 'annual':
        annual = amount;
        break;
    }

    // Calculate gross breakdown
    const gross: SalaryBreakdown = {
      hourly: annual / hoursPerYear,
      daily: annual / workDaysPerYear,
      weekly: annual / weeksPerYear,
      biweekly: annual / (weeksPerYear / 2),
      monthly: annual / 12,
      annual,
    };

    // Calculate taxes and net
    const totalTaxRate = (federalTax + stateTax) / 100;
    const annualTaxes = annual * totalTaxRate;
    const netAnnual = annual - annualTaxes - (deductions * 12);

    const net: SalaryBreakdown = {
      hourly: netAnnual / hoursPerYear,
      daily: netAnnual / workDaysPerYear,
      weekly: netAnnual / weeksPerYear,
      biweekly: netAnnual / (weeksPerYear / 2),
      monthly: netAnnual / 12,
      annual: netAnnual,
    };

    return { gross, net, taxes: annualTaxes };
  }, [amount, salaryType, hoursPerWeek, weeksPerYear, federalTax, stateTax, deductions]);

  const formatCurrency = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const salaryTypes: { value: SalaryType; label: string }[] = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
  ];

  const breakdownRows: { key: keyof SalaryBreakdown; label: string }[] = [
    { key: 'hourly', label: 'Hourly' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'biweekly', label: 'Bi-weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'annual', label: 'Annual' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.salaryCalculator.salaryCalculator', 'Salary Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.salaryCalculator.convertBetweenSalaryPeriodsAnd', 'Convert between salary periods and calculate take-home pay')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.salaryCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.salaryCalculator.salaryAmount', 'Salary Amount')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className={`w-full pl-8 pr-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.salaryCalculator.payPeriod', 'Pay Period')}
            </label>
            <select
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value as SalaryType)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {salaryTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.salaryCalculator.hoursWeek', 'Hours/Week')}
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.salaryCalculator.weeksYear', 'Weeks/Year')}
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={weeksPerYear}
              onChange={(e) => setWeeksPerYear(Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Tax Settings */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calculator className="w-4 h-4" />
            {t('tools.salaryCalculator.taxDeductions', 'Tax & Deductions')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.salaryCalculator.federalTaxRate', 'Federal Tax Rate (%)')}
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={federalTax}
                onChange={(e) => setFederalTax(Number(e.target.value))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.salaryCalculator.stateTaxRate', 'State Tax Rate (%)')}
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={stateTax}
                onChange={(e) => setStateTax(Number(e.target.value))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.salaryCalculator.monthlyDeductions', 'Monthly Deductions ($)')}
              </label>
              <input
                type="number"
                min="0"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{t('tools.salaryCalculator.grossAnnual', 'Gross Annual')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.gross.annual, 0)}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{t('tools.salaryCalculator.annualTaxes', 'Annual Taxes')}</p>
            <p className={`text-2xl font-bold text-red-500`}>
              -{formatCurrency(calculations.taxes, 0)}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'} border`}>
            <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'}`}>{t('tools.salaryCalculator.netAnnualTakeHome', 'Net Annual (Take-Home)')}</p>
            <p className={`text-2xl font-bold text-green-500`}>
              {formatCurrency(calculations.net.annual, 0)}
            </p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salaryCalculator.period', 'Period')}</th>
                <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salaryCalculator.gross', 'Gross')}</th>
                <th className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.salaryCalculator.netTakeHome', 'Net (Take-Home)')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {breakdownRows.map((row) => (
                <tr key={row.key} className={`${salaryType === row.key ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50') : (isDark ? 'bg-gray-900' : 'bg-white')}`}>
                  <td className={`px-4 py-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {row.label}
                    {salaryType === row.key && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Input</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(calculations.gross[row.key])}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono text-green-500`}>
                    {formatCurrency(calculations.net[row.key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Work Stats */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Briefcase className="w-4 h-4" />
            {t('tools.salaryCalculator.workStatistics', 'Work Statistics')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.salaryCalculator.hoursYear', 'Hours/Year')}</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {(hoursPerWeek * weeksPerYear).toLocaleString()}
              </p>
            </div>
            <div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.salaryCalculator.workDaysYear', 'Work Days/Year')}</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {(weeksPerYear * 5).toLocaleString()}
              </p>
            </div>
            <div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.salaryCalculator.effectiveTaxRate', 'Effective Tax Rate')}</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {(federalTax + stateTax).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.salaryCalculator.ptoDays', 'PTO Days')}</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {52 - weeksPerYear > 0 ? (52 - weeksPerYear) * 5 : 0} days off
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculatorTool;
