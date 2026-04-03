import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, DollarSign, TrendingUp, TrendingDown, Info, Sparkles, PlusCircle, MinusCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CashFlowCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const CashFlowCalculatorTool: React.FC<CashFlowCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Income
  const [monthlyRent, setMonthlyRent] = useState('2500');
  const [otherIncome, setOtherIncome] = useState('100');
  const [vacancyRate, setVacancyRate] = useState('5');

  // Fixed Expenses
  const [mortgage, setMortgage] = useState('1200');
  const [propertyTax, setPropertyTax] = useState('300');
  const [insurance, setInsurance] = useState('150');
  const [hoa, setHoa] = useState('0');

  // Variable Expenses
  const [maintenance, setMaintenance] = useState('100');
  const [utilities, setUtilities] = useState('0');
  const [propertyMgmt, setPropertyMgmt] = useState('250');
  const [lawnCare, setLawnCare] = useState('50');
  const [pestControl, setPestControl] = useState('25');
  const [capexReserve, setCapexReserve] = useState('100');

  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.rent !== undefined) {
        setMonthlyRent(String(params.rent));
        setIsPrefilled(true);
      }
      if (params.mortgage !== undefined) {
        setMortgage(String(params.mortgage));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const rent = parseFloat(monthlyRent) || 0;
    const other = parseFloat(otherIncome) || 0;
    const vacancy = parseFloat(vacancyRate) || 0;

    const mortgageAmt = parseFloat(mortgage) || 0;
    const taxAmt = parseFloat(propertyTax) || 0;
    const insAmt = parseFloat(insurance) || 0;
    const hoaAmt = parseFloat(hoa) || 0;

    const maintAmt = parseFloat(maintenance) || 0;
    const utilAmt = parseFloat(utilities) || 0;
    const mgmtAmt = parseFloat(propertyMgmt) || 0;
    const lawnAmt = parseFloat(lawnCare) || 0;
    const pestAmt = parseFloat(pestControl) || 0;
    const capexAmt = parseFloat(capexReserve) || 0;

    // Gross Income
    const grossMonthlyIncome = rent + other;
    const vacancyLoss = grossMonthlyIncome * (vacancy / 100);
    const effectiveGrossIncome = grossMonthlyIncome - vacancyLoss;

    // Fixed Expenses
    const totalFixedExpenses = mortgageAmt + taxAmt + insAmt + hoaAmt;

    // Variable Expenses
    const totalVariableExpenses = maintAmt + utilAmt + mgmtAmt + lawnAmt + pestAmt + capexAmt;

    // Total Expenses
    const totalMonthlyExpenses = totalFixedExpenses + totalVariableExpenses;

    // Cash Flow
    const monthlyCashFlow = effectiveGrossIncome - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // NOI (excludes mortgage)
    const monthlyNoi = effectiveGrossIncome - (totalMonthlyExpenses - mortgageAmt);
    const annualNoi = monthlyNoi * 12;

    // Expense breakdown percentages
    const expenseBreakdown = [
      { name: 'Mortgage (P&I)', amount: mortgageAmt, percentage: totalMonthlyExpenses > 0 ? (mortgageAmt / totalMonthlyExpenses) * 100 : 0 },
      { name: 'Property Tax', amount: taxAmt, percentage: totalMonthlyExpenses > 0 ? (taxAmt / totalMonthlyExpenses) * 100 : 0 },
      { name: 'Insurance', amount: insAmt, percentage: totalMonthlyExpenses > 0 ? (insAmt / totalMonthlyExpenses) * 100 : 0 },
      { name: 'HOA', amount: hoaAmt, percentage: totalMonthlyExpenses > 0 ? (hoaAmt / totalMonthlyExpenses) * 100 : 0 },
      { name: 'Property Mgmt', amount: mgmtAmt, percentage: totalMonthlyExpenses > 0 ? (mgmtAmt / totalMonthlyExpenses) * 100 : 0 },
      { name: 'Maintenance', amount: maintAmt, percentage: totalMonthlyExpenses > 0 ? (maintAmt / totalMonthlyExpenses) * 100 : 0 },
      { name: 'CapEx Reserve', amount: capexAmt, percentage: totalMonthlyExpenses > 0 ? (capexAmt / totalMonthlyExpenses) * 100 : 0 },
      { name: 'Other', amount: utilAmt + lawnAmt + pestAmt, percentage: totalMonthlyExpenses > 0 ? ((utilAmt + lawnAmt + pestAmt) / totalMonthlyExpenses) * 100 : 0 },
    ].filter(e => e.amount > 0);

    // Operating expense ratio
    const operatingExpenseRatio = effectiveGrossIncome > 0 ? ((totalMonthlyExpenses - mortgageAmt) / effectiveGrossIncome) * 100 : 0;

    return {
      grossMonthlyIncome,
      vacancyLoss,
      effectiveGrossIncome,
      totalFixedExpenses,
      totalVariableExpenses,
      totalMonthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      monthlyNoi,
      annualNoi,
      expenseBreakdown,
      operatingExpenseRatio,
      isPositive: monthlyCashFlow > 0,
    };
  }, [monthlyRent, otherIncome, vacancyRate, mortgage, propertyTax, insurance, hoa, maintenance, utilities, propertyMgmt, lawnCare, pestControl, capexReserve]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Wallet className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cashFlowCalculator.rentalCashFlowCalculator', 'Rental Cash Flow Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cashFlowCalculator.calculateMonthlyRentalPropertyCash', 'Calculate monthly rental property cash flow')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.cashFlowCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Income Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
            <PlusCircle className="w-4 h-4" />
            {t('tools.cashFlowCalculator.monthlyIncome', 'Monthly Income')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.monthlyRent', 'Monthly Rent')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.otherIncome', 'Other Income')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.vacancyRate', 'Vacancy Rate (%)')}</label>
              <div className="relative">
                <input
                  type="number"
                  value={vacancyRate}
                  onChange={(e) => setVacancyRate(e.target.value)}
                  className={`w-full pl-4 pr-8 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Expenses Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            <MinusCircle className="w-4 h-4" />
            {t('tools.cashFlowCalculator.fixedMonthlyExpenses', 'Fixed Monthly Expenses')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.mortgagePI', 'Mortgage (P&I)')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={mortgage}
                  onChange={(e) => setMortgage(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.propertyTax', 'Property Tax')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.insurance', 'Insurance')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.hoa', 'HOA')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={hoa}
                  onChange={(e) => setHoa(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Variable Expenses Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            <MinusCircle className="w-4 h-4" />
            {t('tools.cashFlowCalculator.variableMonthlyExpenses', 'Variable Monthly Expenses')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.propertyMgmt', 'Property Mgmt')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={propertyMgmt}
                  onChange={(e) => setPropertyMgmt(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.maintenance', 'Maintenance')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={maintenance}
                  onChange={(e) => setMaintenance(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.capexReserve', 'CapEx Reserve')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={capexReserve}
                  onChange={(e) => setCapexReserve(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.utilities', 'Utilities')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={utilities}
                  onChange={(e) => setUtilities(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.lawnCare', 'Lawn Care')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={lawnCare}
                  onChange={(e) => setLawnCare(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.pestControl', 'Pest Control')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={pestControl}
                  onChange={(e) => setPestControl(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Summary */}
        <div className={`p-6 rounded-xl ${calculations.isPositive ? (isDark ? t('tools.cashFlowCalculator.bg0d948820Border0d9488', 'bg-[#0D9488]/20 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200') : (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200')} border`}>
          <div className="text-center mb-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.monthlyCashFlow', 'Monthly Cash Flow')}</div>
            <div className={`text-5xl font-bold flex items-center justify-center gap-2 ${calculations.isPositive ? t('tools.cashFlowCalculator.text0d9488', 'text-[#0D9488]') : 'text-red-500'}`}>
              {calculations.isPositive ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
              {formatCurrency(calculations.monthlyCashFlow)}
            </div>
            <div className={`text-lg ${calculations.isPositive ? t('tools.cashFlowCalculator.text0d94882', 'text-[#0D9488]') : 'text-red-500'}`}>
              {formatCurrency(calculations.annualCashFlow)}/year
            </div>
          </div>
        </div>

        {/* Summary Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.grossIncome', 'Gross Income')}</div>
            <div className="text-xl font-bold text-green-500">{formatCurrency(calculations.grossMonthlyIncome)}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.vacancyLoss', 'Vacancy Loss')}</div>
            <div className="text-xl font-bold text-amber-500">-{formatCurrency(calculations.vacancyLoss)}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.totalExpenses', 'Total Expenses')}</div>
            <div className="text-xl font-bold text-red-500">-{formatCurrency(calculations.totalMonthlyExpenses)}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.monthlyNoi', 'Monthly NOI')}</div>
            <div className="text-xl font-bold text-[#0D9488]">{formatCurrency(calculations.monthlyNoi)}</div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.cashFlowCalculator.expenseBreakdown', 'Expense Breakdown')}
          </h4>
          <div className="space-y-2">
            {calculations.expenseBreakdown.map((expense) => (
              <div key={expense.name} className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{expense.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0D9488] rounded-full"
                      style={{ width: `${Math.min(expense.percentage, 100)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-20 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Expense Ratio */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cashFlowCalculator.operatingExpenseRatio', 'Operating Expense Ratio')}</div>
          <div className={`text-2xl font-bold ${calculations.operatingExpenseRatio > 50 ? 'text-amber-500' : t('tools.cashFlowCalculator.text0d94883', 'text-[#0D9488]')}`}>
            {calculations.operatingExpenseRatio.toFixed(1)}%
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {calculations.operatingExpenseRatio > 50 ? t('tools.cashFlowCalculator.aboveAverageReviewExpenses', 'Above average - review expenses') : t('tools.cashFlowCalculator.healthyOperatingRatio', 'Healthy operating ratio')}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.cashFlowCalculator.tips', 'Tips:')}</strong> Aim for a positive cash flow of at least $100-200/month per unit. Set aside 5-10% for CapEx reserves (roof, HVAC, appliances). A typical operating expense ratio is 35-45% of gross rent (excluding mortgage).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowCalculatorTool;
