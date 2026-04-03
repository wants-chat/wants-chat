import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, DollarSign, TrendingUp, Building2, Key, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BuyingInputs {
  homePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: 15 | 20 | 30;
  propertyTaxPercent: number;
  insurancePerYear: number;
  hoaPerMonth: number;
  maintenancePercent: number;
  appreciationPercent: number;
}

interface RentingInputs {
  monthlyRent: number;
  rentIncreasePercent: number;
  rentersInsurancePerYear: number;
}

interface Settings {
  yearsToCompare: number;
  investmentReturnPercent: number;
}

interface CalculationResults {
  monthlyMortgagePI: number;
  totalBuyingCost: number;
  totalRentingCost: number;
  finalHomeValue: number;
  totalEquity: number;
  totalInterestPaid: number;
  renterInvestmentValue: number;
  buyerNetWorth: number;
  renterNetWorth: number;
  netAdvantage: number;
  recommendation: 'BUY' | 'RENT';
}

interface RentVsBuyToolProps {
  uiConfig?: UIConfig;
}

export const RentVsBuyTool: React.FC<RentVsBuyToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [buyingInputs, setBuyingInputs] = useState<BuyingInputs>({
    homePrice: 400000,
    downPaymentPercent: 20,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTaxPercent: 1.2,
    insurancePerYear: 1500,
    hoaPerMonth: 200,
    maintenancePercent: 1,
    appreciationPercent: 3,
  });

  const [rentingInputs, setRentingInputs] = useState<RentingInputs>({
    monthlyRent: 2000,
    rentIncreasePercent: 3,
    rentersInsurancePerYear: 200,
  });

  const [settings, setSettings] = useState<Settings>({
    yearsToCompare: 10,
    investmentReturnPercent: 7,
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setBuyingInputs(prev => ({ ...prev, homePrice: params.amount! }));
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.homePrice) setBuyingInputs(prev => ({ ...prev, homePrice: parseFloat(params.formData!.homePrice) }));
        if (params.formData.monthlyRent) setRentingInputs(prev => ({ ...prev, monthlyRent: parseFloat(params.formData!.monthlyRent) }));
        if (params.formData.downPaymentPercent) setBuyingInputs(prev => ({ ...prev, downPaymentPercent: parseFloat(params.formData!.downPaymentPercent) }));
        if (params.formData.interestRate) setBuyingInputs(prev => ({ ...prev, interestRate: parseFloat(params.formData!.interestRate) }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const results = useMemo<CalculationResults>(() => {
    const { homePrice, downPaymentPercent, interestRate, loanTerm, propertyTaxPercent, insurancePerYear, hoaPerMonth, maintenancePercent, appreciationPercent } = buyingInputs;
    const { monthlyRent, rentIncreasePercent, rentersInsurancePerYear } = rentingInputs;
    const { yearsToCompare, investmentReturnPercent } = settings;

    // Calculate mortgage details
    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyInterestRate = interestRate / 100 / 12;
    const totalPayments = loanTerm * 12;

    // Monthly mortgage P&I calculation
    const monthlyMortgagePI = monthlyInterestRate > 0
      ? (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1)
      : loanAmount / totalPayments;

    // Calculate buying costs over the comparison period
    let totalBuyingCost = downPayment;
    let remainingBalance = loanAmount;
    let totalInterestPaid = 0;
    let currentHomeValue = homePrice;

    for (let year = 1; year <= yearsToCompare; year++) {
      // Annual costs
      const annualPropertyTax = currentHomeValue * (propertyTaxPercent / 100);
      const annualMaintenance = currentHomeValue * (maintenancePercent / 100);
      const annualHOA = hoaPerMonth * 12;

      totalBuyingCost += (monthlyMortgagePI * 12) + annualPropertyTax + insurancePerYear + annualHOA + annualMaintenance;

      // Calculate interest paid this year
      for (let month = 1; month <= 12; month++) {
        if (remainingBalance > 0) {
          const interestPayment = remainingBalance * monthlyInterestRate;
          const principalPayment = monthlyMortgagePI - interestPayment;
          totalInterestPaid += interestPayment;
          remainingBalance = Math.max(0, remainingBalance - principalPayment);
        }
      }

      // Home appreciation
      currentHomeValue *= (1 + appreciationPercent / 100);
    }

    const finalHomeValue = currentHomeValue;
    const totalEquity = finalHomeValue - Math.max(0, remainingBalance);

    // Calculate renting costs over the comparison period
    let totalRentingCost = 0;
    let currentMonthlyRent = monthlyRent;
    let renterInvestmentValue = downPayment; // Start with what would have been down payment

    const monthlyInvestmentReturn = investmentReturnPercent / 100 / 12;

    for (let year = 1; year <= yearsToCompare; year++) {
      const annualRent = currentMonthlyRent * 12;
      totalRentingCost += annualRent + rentersInsurancePerYear;

      // Calculate monthly savings (difference between buying and renting monthly costs)
      const monthlyBuyingCost = monthlyMortgagePI +
        (homePrice * propertyTaxPercent / 100 / 12) +
        (insurancePerYear / 12) +
        hoaPerMonth +
        (homePrice * maintenancePercent / 100 / 12);

      const monthlyRentingCost = currentMonthlyRent + (rentersInsurancePerYear / 12);
      const monthlySavings = Math.max(0, monthlyBuyingCost - monthlyRentingCost);

      // Compound investment growth monthly
      for (let month = 1; month <= 12; month++) {
        renterInvestmentValue *= (1 + monthlyInvestmentReturn);
        renterInvestmentValue += monthlySavings;
      }

      // Rent increase for next year
      currentMonthlyRent *= (1 + rentIncreasePercent / 100);
    }

    const buyerNetWorth = totalEquity;
    const renterNetWorth = renterInvestmentValue;
    const netAdvantage = buyerNetWorth - renterNetWorth;
    const recommendation: 'BUY' | 'RENT' = netAdvantage > 0 ? 'BUY' : 'RENT';

    return {
      monthlyMortgagePI,
      totalBuyingCost,
      totalRentingCost,
      finalHomeValue,
      totalEquity,
      totalInterestPaid,
      renterInvestmentValue,
      buyerNetWorth,
      renterNetWorth,
      netAdvantage,
      recommendation,
    };
  }, [buyingInputs, rentingInputs, settings]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const inputClasses = `w-full px-3 py-2 rounded-lg border ${
    isDark
      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`;

  const labelClasses = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClasses = `rounded-xl p-6 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`;

  const sectionTitleClasses = `text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.rentVsBuy.rentVsBuyCalculator', 'Rent vs Buy Calculator')}
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.rentVsBuy.compareTheFinancialImpactOf', 'Compare the financial impact of renting versus buying a home over time')}
          </p>
        </div>

        {isPrefilled && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.rentVsBuy.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Settings Row */}
        <div className={`${cardClasses} mb-6`}>
          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className={labelClasses}>{t('tools.rentVsBuy.yearsToCompare130', 'Years to Compare (1-30)')}</label>
              <input
                type="range"
                min="1"
                max="30"
                value={settings.yearsToCompare}
                onChange={(e) => setSettings({ ...settings, yearsToCompare: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className={`text-center mt-1 font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {settings.yearsToCompare} years
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className={labelClasses}>{t('tools.rentVsBuy.investmentReturnForRenter', 'Investment Return % (for renter)')}</label>
              <input
                type="number"
                value={settings.investmentReturnPercent}
                onChange={(e) => setSettings({ ...settings, investmentReturnPercent: parseFloat(e.target.value) || 0 })}
                className={inputClasses}
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buying Inputs */}
          <div className={cardClasses}>
            <h2 className={sectionTitleClasses}>
              <Home className={isDark ? 'text-blue-400' : 'text-blue-600'} size={24} />
              {t('tools.rentVsBuy.buyingInputs', 'Buying Inputs')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.homePrice', 'Home Price')}</label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                  <input
                    type="number"
                    value={buyingInputs.homePrice}
                    onChange={(e) => setBuyingInputs({ ...buyingInputs, homePrice: parseFloat(e.target.value) || 0 })}
                    className={`${inputClasses} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.downPayment', 'Down Payment %')}</label>
                <input
                  type="number"
                  value={buyingInputs.downPaymentPercent}
                  onChange={(e) => setBuyingInputs({ ...buyingInputs, downPaymentPercent: parseFloat(e.target.value) || 0 })}
                  className={inputClasses}
                  step="1"
                />
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.interestRate', 'Interest Rate %')}</label>
                <input
                  type="number"
                  value={buyingInputs.interestRate}
                  onChange={(e) => setBuyingInputs({ ...buyingInputs, interestRate: parseFloat(e.target.value) || 0 })}
                  className={inputClasses}
                  step="0.125"
                />
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.loanTerm', 'Loan Term')}</label>
                <select
                  value={buyingInputs.loanTerm}
                  onChange={(e) => setBuyingInputs({ ...buyingInputs, loanTerm: parseInt(e.target.value) as 15 | 20 | 30 })}
                  className={inputClasses}
                >
                  <option value={15}>15 years</option>
                  <option value={20}>20 years</option>
                  <option value={30}>30 years</option>
                </select>
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.propertyTaxAnnual', 'Property Tax % (annual)')}</label>
                <input
                  type="number"
                  value={buyingInputs.propertyTaxPercent}
                  onChange={(e) => setBuyingInputs({ ...buyingInputs, propertyTaxPercent: parseFloat(e.target.value) || 0 })}
                  className={inputClasses}
                  step="0.1"
                />
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.homeInsurancePerYear', 'Home Insurance (per year)')}</label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                  <input
                    type="number"
                    value={buyingInputs.insurancePerYear}
                    onChange={(e) => setBuyingInputs({ ...buyingInputs, insurancePerYear: parseFloat(e.target.value) || 0 })}
                    className={`${inputClasses} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.hoaPerMonth', 'HOA (per month)')}</label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                  <input
                    type="number"
                    value={buyingInputs.hoaPerMonth}
                    onChange={(e) => setBuyingInputs({ ...buyingInputs, hoaPerMonth: parseFloat(e.target.value) || 0 })}
                    className={`${inputClasses} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.maintenanceAnnual', 'Maintenance % (annual)')}</label>
                <input
                  type="number"
                  value={buyingInputs.maintenancePercent}
                  onChange={(e) => setBuyingInputs({ ...buyingInputs, maintenancePercent: parseFloat(e.target.value) || 0 })}
                  className={inputClasses}
                  step="0.1"
                />
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.appreciationAnnual', 'Appreciation % (annual)')}</label>
                <input
                  type="number"
                  value={buyingInputs.appreciationPercent}
                  onChange={(e) => setBuyingInputs({ ...buyingInputs, appreciationPercent: parseFloat(e.target.value) || 0 })}
                  className={inputClasses}
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Renting Inputs */}
          <div className={cardClasses}>
            <h2 className={sectionTitleClasses}>
              <Key className={isDark ? 'text-green-400' : 'text-green-600'} size={24} />
              {t('tools.rentVsBuy.rentingInputs', 'Renting Inputs')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.monthlyRent', 'Monthly Rent')}</label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                  <input
                    type="number"
                    value={rentingInputs.monthlyRent}
                    onChange={(e) => setRentingInputs({ ...rentingInputs, monthlyRent: parseFloat(e.target.value) || 0 })}
                    className={`${inputClasses} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.annualRentIncrease', 'Annual Rent Increase %')}</label>
                <input
                  type="number"
                  value={rentingInputs.rentIncreasePercent}
                  onChange={(e) => setRentingInputs({ ...rentingInputs, rentIncreasePercent: parseFloat(e.target.value) || 0 })}
                  className={inputClasses}
                  step="0.1"
                />
              </div>

              <div>
                <label className={labelClasses}>{t('tools.rentVsBuy.rentersInsurancePerYear', 'Renters Insurance (per year)')}</label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                  <input
                    type="number"
                    value={rentingInputs.rentersInsurancePerYear}
                    onChange={(e) => setRentingInputs({ ...rentingInputs, rentersInsurancePerYear: parseFloat(e.target.value) || 0 })}
                    className={`${inputClasses} pl-9`}
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
              <div className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Info size={18} className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <p className="text-sm">
                  The calculator assumes the renter invests the down payment and any monthly savings
                  (difference between buying and renting costs) at the specified investment return rate.
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className={cardClasses}>
            <h2 className={sectionTitleClasses}>
              <TrendingUp className={isDark ? 'text-purple-400' : 'text-purple-600'} size={24} />
              {t('tools.rentVsBuy.results', 'Results')}
            </h2>

            {/* Recommendation Banner */}
            <div
              className={`p-4 rounded-lg mb-6 text-center ${
                results.recommendation === 'BUY'
                  ? isDark
                    ? 'bg-blue-900/50 border border-blue-700'
                    : 'bg-blue-100 border border-blue-300'
                  : isDark
                  ? 'bg-green-900/50 border border-green-700'
                  : 'bg-green-100 border border-green-300'
              }`}
            >
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                After {settings.yearsToCompare} years, you should
              </div>
              <div
                className={`text-3xl font-bold ${
                  results.recommendation === 'BUY'
                    ? isDark
                      ? 'text-blue-400'
                      : 'text-blue-600'
                    : isDark
                    ? 'text-green-400'
                    : 'text-green-600'
                }`}
              >
                {results.recommendation}
              </div>
              <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Net advantage: {formatCurrency(Math.abs(results.netAdvantage))}
              </div>
            </div>

            {/* Monthly Payment */}
            <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.rentVsBuy.monthlyMortgagePI', 'Monthly Mortgage (P&I)')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(results.monthlyMortgagePI)}
              </div>
            </div>

            {/* Buying Summary */}
            <div className="mb-6">
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <Building2 size={18} />
                {t('tools.rentVsBuy.buyingSummary', 'Buying Summary')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.rentVsBuy.totalCost', 'Total Cost')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(results.totalBuyingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.rentVsBuy.finalHomeValue', 'Final Home Value')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(results.finalHomeValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.rentVsBuy.totalInterestPaid', 'Total Interest Paid')}</span>
                  <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {formatCurrency(results.totalInterestPaid)}
                  </span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentVsBuy.totalEquity', 'Total Equity')}</span>
                  <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatCurrency(results.totalEquity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Renting Summary */}
            <div className="mb-6">
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                <Key size={18} />
                {t('tools.rentVsBuy.rentingSummary', 'Renting Summary')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.rentVsBuy.totalCost2', 'Total Cost')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(results.totalRentingCost)}
                  </span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.rentVsBuy.investmentValue', 'Investment Value')}</span>
                  <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {formatCurrency(results.renterInvestmentValue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Worth Comparison */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Net Worth After {settings.yearsToCompare} Years
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.rentVsBuy.buyerEquity', 'Buyer (Equity)')}</span>
                    <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {formatCurrency(results.buyerNetWorth)}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-500'}`}
                      style={{
                        width: `${Math.min(100, (results.buyerNetWorth / Math.max(results.buyerNetWorth, results.renterNetWorth)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.rentVsBuy.renterInvestments', 'Renter (Investments)')}</span>
                    <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(results.renterNetWorth)}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isDark ? 'bg-green-500' : 'bg-green-500'}`}
                      style={{
                        width: `${Math.min(100, (results.renterNetWorth / Math.max(results.buyerNetWorth, results.renterNetWorth)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentVsBuyTool;
