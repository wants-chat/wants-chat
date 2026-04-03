import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, DollarSign, TrendingUp, Calculator, Info, Sparkles, PiggyBank } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RentalRoicalculatorToolProps {
  uiConfig?: UIConfig;
}

export const RentalRoicalculatorTool: React.FC<RentalRoicalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [purchasePrice, setPurchasePrice] = useState('300000');
  const [downPayment, setDownPayment] = useState('60000');
  const [closingCosts, setClosingCosts] = useState('9000');
  const [renovationCosts, setRenovationCosts] = useState('10000');
  const [monthlyRent, setMonthlyRent] = useState('2200');
  const [monthlyMortgage, setMonthlyMortgage] = useState('1400');
  const [propertyTax, setPropertyTax] = useState('250');
  const [insurance, setInsurance] = useState('100');
  const [hoa, setHoa] = useState('0');
  const [maintenance, setMaintenance] = useState('150');
  const [propertyMgmt, setPropertyMgmt] = useState('0');
  const [vacancyRate, setVacancyRate] = useState('8');
  const [appreciationRate, setAppreciationRate] = useState('3');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.price !== undefined || params.amount !== undefined) {
        setPurchasePrice(String(params.price || params.amount));
        setIsPrefilled(true);
      }
      if (params.rent !== undefined) {
        setMonthlyRent(String(params.rent));
        setIsPrefilled(true);
      }
      if (params.downPayment !== undefined) {
        setDownPayment(String(params.downPayment));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const price = parseFloat(purchasePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const closing = parseFloat(closingCosts) || 0;
    const reno = parseFloat(renovationCosts) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const mortgage = parseFloat(monthlyMortgage) || 0;
    const tax = parseFloat(propertyTax) || 0;
    const ins = parseFloat(insurance) || 0;
    const hoaFee = parseFloat(hoa) || 0;
    const maint = parseFloat(maintenance) || 0;
    const mgmt = parseFloat(propertyMgmt) || 0;
    const vacancy = parseFloat(vacancyRate) || 0;
    const appreciation = parseFloat(appreciationRate) || 0;

    // Total investment (cash required)
    const totalInvestment = down + closing + reno;

    // Monthly income (accounting for vacancy)
    const effectiveMonthlyRent = rent * (1 - vacancy / 100);
    const annualGrossRent = rent * 12;
    const annualEffectiveRent = effectiveMonthlyRent * 12;

    // Monthly expenses
    const totalMonthlyExpenses = mortgage + tax + ins + hoaFee + maint + mgmt;
    const annualExpenses = totalMonthlyExpenses * 12;

    // Cash flow
    const monthlyCashFlow = effectiveMonthlyRent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // Cash-on-Cash ROI
    const cashOnCashROI = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

    // Cap Rate (based on property value, not investment)
    const noi = annualEffectiveRent - (annualExpenses - mortgage * 12); // NOI excludes mortgage
    const capRate = price > 0 ? (noi / price) * 100 : 0;

    // Gross Rent Multiplier
    const grm = rent > 0 ? price / annualGrossRent : 0;

    // 1% Rule (monthly rent should be >= 1% of purchase price)
    const onePercentRule = price > 0 ? (rent / price) * 100 : 0;
    const passesOnePercent = onePercentRule >= 1;

    // 5-year projection with appreciation
    const projections = [];
    let propertyValue = price;
    let totalEquity = down;
    let cumulativeCashFlow = 0;
    let loanBalance = price - down;
    const annualPrincipalPaydown = mortgage * 12 * 0.25; // Rough estimate: 25% goes to principal

    for (let year = 1; year <= 5; year++) {
      propertyValue = propertyValue * (1 + appreciation / 100);
      loanBalance = Math.max(0, loanBalance - annualPrincipalPaydown);
      totalEquity = propertyValue - loanBalance;
      cumulativeCashFlow += annualCashFlow;

      const totalReturn = (totalEquity - down) + cumulativeCashFlow;
      const totalROI = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

      projections.push({
        year,
        propertyValue,
        equity: totalEquity,
        cumulativeCashFlow,
        totalReturn,
        totalROI,
      });
    }

    return {
      totalInvestment,
      effectiveMonthlyRent,
      totalMonthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCashROI,
      capRate,
      noi,
      grm,
      onePercentRule,
      passesOnePercent,
      projections,
      isPositiveCashFlow: monthlyCashFlow > 0,
    };
  }, [purchasePrice, downPayment, closingCosts, renovationCosts, monthlyRent, monthlyMortgage, propertyTax, insurance, hoa, maintenance, propertyMgmt, vacancyRate, appreciationRate]);

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
            <Building2 className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentalROICalculator.rentalRoiCalculator', 'Rental ROI Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.rentalROICalculator.analyzeRentalPropertyInvestmentReturns', 'Analyze rental property investment returns')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.rentalROICalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Purchase Details */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Building2 className="w-4 h-4 inline mr-2" />
            {t('tools.rentalROICalculator.purchaseDetails', 'Purchase Details')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.purchasePrice', 'Purchase Price')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.downPayment', 'Down Payment')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.closingCosts', 'Closing Costs')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={closingCosts}
                  onChange={(e) => setClosingCosts(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.renovationCosts', 'Renovation Costs')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={renovationCosts}
                  onChange={(e) => setRenovationCosts(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Income & Expenses */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 inline mr-2" />
            {t('tools.rentalROICalculator.monthlyIncomeExpenses', 'Monthly Income & Expenses')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.monthlyRent', 'Monthly Rent')}</label>
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
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.mortgagePayment', 'Mortgage Payment')}</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={monthlyMortgage}
                  onChange={(e) => setMonthlyMortgage(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.propertyTax', 'Property Tax')}</label>
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
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.insurance', 'Insurance')}</label>
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
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.hoaFees', 'HOA Fees')}</label>
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
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.maintenance', 'Maintenance')}</label>
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
          </div>
        </div>

        {/* Vacancy & Appreciation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.rentalROICalculator.vacancyRate', 'Vacancy Rate (%)')}
            </label>
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
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.rentalROICalculator.annualAppreciation', 'Annual Appreciation (%)')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={appreciationRate}
                onChange={(e) => setAppreciationRate(e.target.value)}
                className={`w-full pl-4 pr-8 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
            </div>
          </div>
        </div>

        {/* Cash Flow Summary */}
        <div className={`p-6 rounded-xl ${calculations.isPositiveCashFlow ? (isDark ? t('tools.rentalROICalculator.bg0d948820Border0d9488', 'bg-[#0D9488]/20 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200') : (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200')} border`}>
          <div className="text-center mb-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.monthlyCashFlow', 'Monthly Cash Flow')}</div>
            <div className={`text-4xl font-bold ${calculations.isPositiveCashFlow ? t('tools.rentalROICalculator.text0d9488', 'text-[#0D9488]') : 'text-red-500'}`}>
              {formatCurrency(calculations.monthlyCashFlow)}
            </div>
            <div className={`text-lg ${calculations.isPositiveCashFlow ? t('tools.rentalROICalculator.text0d94882', 'text-[#0D9488]') : 'text-red-500'}`}>
              {formatCurrency(calculations.annualCashFlow)}/year
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.cashOnCashRoi', 'Cash-on-Cash ROI')}</div>
            <div className={`text-2xl font-bold ${calculations.cashOnCashROI > 8 ? 'text-[#0D9488]' : calculations.cashOnCashROI > 0 ? 'text-amber-500' : 'text-red-500'}`}>
              {calculations.cashOnCashROI.toFixed(1)}%
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.capRate', 'Cap Rate')}</div>
            <div className={`text-2xl font-bold ${calculations.capRate > 6 ? t('tools.rentalROICalculator.text0d94883', 'text-[#0D9488]') : 'text-amber-500'}`}>
              {calculations.capRate.toFixed(1)}%
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rentalROICalculator.grm', 'GRM')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.grm.toFixed(1)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>1% Rule</div>
            <div className={`text-2xl font-bold ${calculations.passesOnePercent ? t('tools.rentalROICalculator.text0d94884', 'text-[#0D9488]') : 'text-red-500'}`}>
              {calculations.onePercentRule.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Total Investment */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-5 h-5 text-[#0D9488]" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentalROICalculator.totalCashRequired', 'Total Cash Required')}</h4>
          </div>
          <div className="text-2xl font-bold text-[#0D9488]">{formatCurrency(calculations.totalInvestment)}</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.rentalROICalculator.downPaymentClosingCostsRenovations', 'Down payment + Closing costs + Renovations')}
          </div>
        </div>

        {/* 5-Year Projection */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4 inline mr-2" />
            {t('tools.rentalROICalculator.5YearProjection', '5-Year Projection')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2">{t('tools.rentalROICalculator.year', 'Year')}</th>
                  <th className="text-right py-2">{t('tools.rentalROICalculator.propertyValue', 'Property Value')}</th>
                  <th className="text-right py-2">{t('tools.rentalROICalculator.equity', 'Equity')}</th>
                  <th className="text-right py-2">{t('tools.rentalROICalculator.cashFlow', 'Cash Flow')}</th>
                  <th className="text-right py-2">{t('tools.rentalROICalculator.totalRoi', 'Total ROI')}</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {calculations.projections.map((row) => (
                  <tr key={row.year} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-2">Year {row.year}</td>
                    <td className="text-right py-2">{formatCurrency(row.propertyValue)}</td>
                    <td className="text-right py-2 text-[#0D9488]">{formatCurrency(row.equity)}</td>
                    <td className="text-right py-2">{formatCurrency(row.cumulativeCashFlow)}</td>
                    <td className="text-right py-2 font-medium text-[#0D9488]">{row.totalROI.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.rentalROICalculator.keyMetrics', 'Key Metrics:')}</strong> Cash-on-Cash ROI measures annual return relative to your cash invested. Cap Rate is NOI divided by property value. The 1% Rule suggests monthly rent should be at least 1% of purchase price for a good deal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalRoicalculatorTool;
