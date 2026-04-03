import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, DollarSign, Percent, Calculator, Info, Sparkles, PiggyBank } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface AffordabilityResult {
  maxHomePrice: number;
  maxLoanAmount: number;
  monthlyPayment: number;
  downPaymentAmount: number;
  frontEndRatio: number;
  backEndRatio: number;
  breakdown: {
    principal: number;
    interest: number;
    taxes: number;
    insurance: number;
    pmi: number;
    hoa: number;
  };
}

interface AffordabilityCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const AffordabilityCalculatorTool: React.FC<AffordabilityCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [annualIncome, setAnnualIncome] = useState('85000');
  const [monthlyDebts, setMonthlyDebts] = useState('500');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanTermYears, setLoanTermYears] = useState('30');
  const [propertyTaxRate, setPropertyTaxRate] = useState('1.2');
  const [insuranceRate, setInsuranceRate] = useState('0.35');
  const [hoaMonthly, setHoaMonthly] = useState('0');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.income !== undefined || params.amount !== undefined) {
        setAnnualIncome(String(params.income || params.amount));
        setIsPrefilled(true);
      }
      if (params.debts !== undefined) {
        setMonthlyDebts(String(params.debts));
        setIsPrefilled(true);
      }
      if (params.downPayment !== undefined) {
        setDownPaymentPercent(String(params.downPayment));
        setIsPrefilled(true);
      }
      if (params.interestRate !== undefined) {
        setInterestRate(String(params.interestRate));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const result = useMemo<AffordabilityResult | null>(() => {
    const income = parseFloat(annualIncome) || 0;
    const debts = parseFloat(monthlyDebts) || 0;
    const downPercent = parseFloat(downPaymentPercent) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseInt(loanTermYears) || 30;
    const taxRate = parseFloat(propertyTaxRate) || 0;
    const insRate = parseFloat(insuranceRate) || 0;
    const hoa = parseFloat(hoaMonthly) || 0;

    if (income <= 0 || rate <= 0) {
      return null;
    }

    const monthlyIncome = income / 12;

    // Standard DTI limits: 28% front-end (housing only), 36% back-end (all debts)
    const maxHousingPayment = monthlyIncome * 0.28;
    const maxTotalDebtPayment = monthlyIncome * 0.36;

    // Calculate max housing payment based on back-end ratio
    const maxHousingFromBackEnd = maxTotalDebtPayment - debts;

    // Use the lower of front-end or back-end constrained payment
    const effectiveMaxPayment = Math.min(maxHousingPayment, maxHousingFromBackEnd);

    if (effectiveMaxPayment <= 0) {
      return null;
    }

    // Iteratively calculate max home price
    // P&I payment = effectiveMaxPayment - taxes - insurance - PMI - HOA
    // We need to solve for home price where all these balance

    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;

    // Iterate to find max home price
    let maxHomePrice = 0;
    let tolerance = 100;
    let lowerBound = 0;
    let upperBound = income * 10; // Initial upper bound

    while (upperBound - lowerBound > tolerance) {
      const testPrice = (lowerBound + upperBound) / 2;
      const downPayment = testPrice * (downPercent / 100);
      const loanAmount = testPrice - downPayment;

      // Monthly taxes and insurance
      const monthlyTax = (testPrice * (taxRate / 100)) / 12;
      const monthlyInsurance = (testPrice * (insRate / 100)) / 12;

      // PMI (if down payment < 20%)
      const monthlyPMI = downPercent < 20 ? (loanAmount * 0.005) / 12 : 0;

      // P&I calculation
      let monthlyPI = 0;
      if (loanAmount > 0 && monthlyRate > 0) {
        monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                    (Math.pow(1 + monthlyRate, numPayments) - 1);
      }

      const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + hoa;

      if (totalMonthlyPayment <= effectiveMaxPayment) {
        lowerBound = testPrice;
        maxHomePrice = testPrice;
      } else {
        upperBound = testPrice;
      }
    }

    // Calculate final breakdown
    const downPaymentAmount = maxHomePrice * (downPercent / 100);
    const maxLoanAmount = maxHomePrice - downPaymentAmount;
    const monthlyTax = (maxHomePrice * (taxRate / 100)) / 12;
    const monthlyInsurance = (maxHomePrice * (insRate / 100)) / 12;
    const monthlyPMI = downPercent < 20 ? (maxLoanAmount * 0.005) / 12 : 0;

    let monthlyPI = 0;
    if (maxLoanAmount > 0 && monthlyRate > 0) {
      monthlyPI = maxLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                  (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    // Calculate interest portion (first month)
    const firstMonthInterest = maxLoanAmount * monthlyRate;
    const firstMonthPrincipal = monthlyPI - firstMonthInterest;

    const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + hoa;

    // Calculate actual ratios
    const frontEndRatio = (totalMonthlyPayment / monthlyIncome) * 100;
    const backEndRatio = ((totalMonthlyPayment + debts) / monthlyIncome) * 100;

    return {
      maxHomePrice,
      maxLoanAmount,
      monthlyPayment: totalMonthlyPayment,
      downPaymentAmount,
      frontEndRatio,
      backEndRatio,
      breakdown: {
        principal: firstMonthPrincipal,
        interest: firstMonthInterest,
        taxes: monthlyTax,
        insurance: monthlyInsurance,
        pmi: monthlyPMI,
        hoa,
      },
    };
  }, [annualIncome, monthlyDebts, downPaymentPercent, interestRate, loanTermYears, propertyTaxRate, insuranceRate, hoaMonthly]);

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
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Home className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.affordabilityCalculator.homeAffordabilityCalculator', 'Home Affordability Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.affordabilityCalculator.findOutHowMuchHome', 'Find out how much home you can afford')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.affordabilityCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Income Section */}
        <div className="space-y-4">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.affordabilityCalculator.incomeDebts', 'Income & Debts')}</h4>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.affordabilityCalculator.annualGrossIncome', 'Annual Gross Income')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="85000"
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.affordabilityCalculator.monthlyDebtPayments', 'Monthly Debt Payments')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={monthlyDebts}
                onChange={(e) => setMonthlyDebts(e.target.value)}
                placeholder="500"
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.affordabilityCalculator.carPaymentsStudentLoansCredit', 'Car payments, student loans, credit cards, etc.')}
            </p>
          </div>
        </div>

        {/* Loan Details */}
        <div className="space-y-4">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.affordabilityCalculator.loanDetails', 'Loan Details')}</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <PiggyBank className="w-4 h-4 inline mr-1" />
                {t('tools.affordabilityCalculator.downPayment2', 'Down Payment (%)')}
              </label>
              <input
                type="number"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(e.target.value)}
                min="0"
                max="100"
                placeholder="20"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <div className="flex gap-2">
                {[3.5, 5, 10, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDownPaymentPercent(pct.toString())}
                    className={`flex-1 py-1 text-xs rounded ${
                      parseFloat(downPaymentPercent) === pct
                        ? 'bg-teal-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Percent className="w-4 h-4 inline mr-1" />
                {t('tools.affordabilityCalculator.interestRate', 'Interest Rate (%)')}
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                step="0.125"
                placeholder="7.0"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.affordabilityCalculator.loanTerm', 'Loan Term')}
            </label>
            <div className="flex gap-2">
              {['15', '20', '30'].map((term) => (
                <button
                  key={term}
                  onClick={() => setLoanTermYears(term)}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    loanTermYears === term
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {term} years
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Costs */}
        <div className="space-y-4">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.affordabilityCalculator.additionalCosts', 'Additional Costs')}</h4>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.affordabilityCalculator.propertyTax', 'Property Tax (%)')}
              </label>
              <input
                type="number"
                value={propertyTaxRate}
                onChange={(e) => setPropertyTaxRate(e.target.value)}
                step="0.1"
                placeholder="1.2"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.affordabilityCalculator.insurance', 'Insurance (%)')}
              </label>
              <input
                type="number"
                value={insuranceRate}
                onChange={(e) => setInsuranceRate(e.target.value)}
                step="0.05"
                placeholder="0.35"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.affordabilityCalculator.hoaMo', 'HOA ($/mo)')}
              </label>
              <input
                type="number"
                value={hoaMonthly}
                onChange={(e) => setHoaMonthly(e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
              <div className="text-center mb-4">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.affordabilityCalculator.youCanAffordUpTo', 'You Can Afford Up To')}</div>
                <div className="text-5xl font-bold text-teal-500">
                  {formatCurrency(result.maxHomePrice)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Monthly payment: {formatCurrency(result.monthlyPayment)}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.affordabilityCalculator.downPayment', 'Down Payment')}</div>
                <div className="text-2xl font-bold text-blue-500">{formatCurrency(result.downPaymentAmount)}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.affordabilityCalculator.loanAmount', 'Loan Amount')}</div>
                <div className="text-2xl font-bold text-purple-500">{formatCurrency(result.maxLoanAmount)}</div>
              </div>
            </div>

            {/* DTI Ratios */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.affordabilityCalculator.debtToIncomeRatios', 'Debt-to-Income Ratios')}</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.affordabilityCalculator.frontEndHousing', 'Front-End (Housing)')}</span>
                    <span className={`text-sm font-medium ${result.frontEndRatio <= 28 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {result.frontEndRatio.toFixed(1)}% / 28%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${result.frontEndRatio <= 28 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(100, (result.frontEndRatio / 28) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.affordabilityCalculator.backEndTotalDebt', 'Back-End (Total Debt)')}</span>
                    <span className={`text-sm font-medium ${result.backEndRatio <= 36 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {result.backEndRatio.toFixed(1)}% / 36%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${result.backEndRatio <= 36 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(100, (result.backEndRatio / 36) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.affordabilityCalculator.monthlyPaymentBreakdown', 'Monthly Payment Breakdown')}</h4>
              <div className="space-y-2">
                {[
                  { label: 'Principal & Interest', value: result.breakdown.principal + result.breakdown.interest, color: 'teal' },
                  { label: 'Property Taxes', value: result.breakdown.taxes, color: 'blue' },
                  { label: 'Home Insurance', value: result.breakdown.insurance, color: 'purple' },
                  ...(result.breakdown.pmi > 0 ? [{ label: 'PMI', value: result.breakdown.pmi, color: 'orange' }] : []),
                  ...(result.breakdown.hoa > 0 ? [{ label: 'HOA', value: result.breakdown.hoa, color: 'pink' }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                    <span className={`font-medium text-${item.color}-500`}>{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className={`border-t pt-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.affordabilityCalculator.totalMonthly', 'Total Monthly')}</span>
                    <span className="font-bold text-teal-500">{formatCurrency(result.monthlyPayment)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.affordabilityCalculator.aboutThisCalculation', 'About this calculation:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.affordabilityCalculator.usesStandard2836Dti', 'Uses standard 28/36 DTI guidelines used by most lenders')}</li>
                <li>{t('tools.affordabilityCalculator.pmiIsEstimatedAt0', 'PMI is estimated at 0.5% of loan amount if down payment is below 20%')}</li>
                <li>{t('tools.affordabilityCalculator.actualAffordabilityMayVaryBased', 'Actual affordability may vary based on credit score and lender requirements')}</li>
                <li>{t('tools.affordabilityCalculator.considerReservingFundsForMaintenance', 'Consider reserving funds for maintenance, utilities, and emergencies')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffordabilityCalculatorTool;
