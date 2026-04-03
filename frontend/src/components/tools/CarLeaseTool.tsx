import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, DollarSign, Calendar, Percent, Calculator, Info, Sparkles, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CarLeaseToolProps {
  uiConfig?: UIConfig;
}

export const CarLeaseTool: React.FC<CarLeaseToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [msrp, setMsrp] = useState('40000');
  const [negotiatedPrice, setNegotiatedPrice] = useState('38000');
  const [downPayment, setDownPayment] = useState('2000');
  const [tradeInValue, setTradeInValue] = useState('0');
  const [residualPercent, setResidualPercent] = useState('55');
  const [moneyFactor, setMoneyFactor] = useState('0.00125');
  const [leaseTerm, setLeaseTerm] = useState('36');
  const [annualMileage, setAnnualMileage] = useState('12000');
  const [salesTaxRate, setSalesTaxRate] = useState('6');
  const [acquisitionFee, setAcquisitionFee] = useState('650');
  const [docFee, setDocFee] = useState('350');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.price !== undefined || params.msrp !== undefined) {
        setMsrp(String(params.price || params.msrp));
        setIsPrefilled(true);
      }
      if (params.negotiatedPrice !== undefined) {
        setNegotiatedPrice(String(params.negotiatedPrice));
        setIsPrefilled(true);
      }
      if (params.downPayment !== undefined) {
        setDownPayment(String(params.downPayment));
        setIsPrefilled(true);
      }
      if (params.residual !== undefined) {
        setResidualPercent(String(params.residual));
        setIsPrefilled(true);
      }
      if (params.term !== undefined || params.leaseTerm !== undefined) {
        setLeaseTerm(String(params.term || params.leaseTerm));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const msrpVal = parseFloat(msrp) || 0;
    const capCost = parseFloat(negotiatedPrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const tradeIn = parseFloat(tradeInValue) || 0;
    const residualPct = parseFloat(residualPercent) || 0;
    const mf = parseFloat(moneyFactor) || 0;
    const term = parseInt(leaseTerm) || 36;
    const taxRate = parseFloat(salesTaxRate) || 0;
    const acqFee = parseFloat(acquisitionFee) || 0;
    const docFeeVal = parseFloat(docFee) || 0;

    // Calculate residual value
    const residualValue = msrpVal * (residualPct / 100);

    // Calculate adjusted cap cost (what you're financing)
    const grossCapCost = capCost + acqFee + docFeeVal;
    const capReduction = down + tradeIn;
    const adjustedCapCost = grossCapCost - capReduction;

    // Calculate depreciation (what the car loses in value during lease)
    const depreciation = adjustedCapCost - residualValue;
    const monthlyDepreciation = depreciation / term;

    // Calculate rent charge (finance charge)
    const rentCharge = (adjustedCapCost + residualValue) * mf;

    // Calculate base monthly payment (before tax)
    const baseMonthlyPayment = monthlyDepreciation + rentCharge;

    // Calculate monthly payment with tax
    const monthlyTax = baseMonthlyPayment * (taxRate / 100);
    const monthlyPayment = baseMonthlyPayment + monthlyTax;

    // Total cost of lease
    const totalMonthlyPayments = monthlyPayment * term;
    const totalCost = totalMonthlyPayments + capReduction;

    // Due at signing
    const dueAtSigning = down + monthlyPayment + acqFee;

    // Convert money factor to APR
    const apr = mf * 2400;

    // Effective monthly cost (including down payment amortized)
    const effectiveMonthly = totalCost / term;

    return {
      residualValue,
      grossCapCost,
      adjustedCapCost,
      depreciation,
      monthlyDepreciation,
      rentCharge,
      baseMonthlyPayment,
      monthlyTax,
      monthlyPayment,
      totalMonthlyPayments,
      totalCost,
      dueAtSigning,
      apr,
      effectiveMonthly,
    };
  }, [msrp, negotiatedPrice, downPayment, tradeInValue, residualPercent, moneyFactor, leaseTerm, salesTaxRate, acquisitionFee, docFee]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const leaseTermOptions = [
    { value: '24', label: '24 months' },
    { value: '36', label: '36 months' },
    { value: '39', label: '39 months' },
    { value: '48', label: '48 months' },
  ];

  const mileageOptions = [
    { value: '10000', label: '10,000 miles/year' },
    { value: '12000', label: '12,000 miles/year' },
    { value: '15000', label: '15,000 miles/year' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><FileText className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carLease.carLeaseCalculator', 'Car Lease Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.carLease.calculateMonthlyLeasePaymentsAnd', 'Calculate monthly lease payments and total cost')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.carLease.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Vehicle Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.carLease.msrpStickerPrice', 'MSRP (Sticker Price)')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={msrp}
                onChange={(e) => setMsrp(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Car className="w-4 h-4 inline mr-1" />
              {t('tools.carLease.negotiatedPrice', 'Negotiated Price')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={negotiatedPrice}
                onChange={(e) => setNegotiatedPrice(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Cap Reduction */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carLease.downPayment', 'Down Payment')}
            </label>
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
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carLease.tradeInValue', 'Trade-In Value')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={tradeInValue}
                onChange={(e) => setTradeInValue(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Lease Terms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Percent className="w-4 h-4 inline mr-1" />
              {t('tools.carLease.residualValue', 'Residual Value %')}
            </label>
            <input
              type="number"
              step="1"
              value={residualPercent}
              onChange={(e) => setResidualPercent(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              = {formatCurrency(parseFloat(msrp) * (parseFloat(residualPercent) / 100))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calculator className="w-4 h-4 inline mr-1" />
              {t('tools.carLease.moneyFactor', 'Money Factor')}
            </label>
            <input
              type="number"
              step="0.00001"
              value={moneyFactor}
              onChange={(e) => setMoneyFactor(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              = {calculations.apr.toFixed(2)}% APR
            </div>
          </div>
        </div>

        {/* Term and Mileage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.carLease.leaseTerm', 'Lease Term')}
            </label>
            <select
              value={leaseTerm}
              onChange={(e) => setLeaseTerm(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {leaseTermOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carLease.annualMileage', 'Annual Mileage')}
            </label>
            <select
              value={annualMileage}
              onChange={(e) => setAnnualMileage(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {mileageOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fees and Tax */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carLease.salesTax2', 'Sales Tax %')}
            </label>
            <input
              type="number"
              step="0.1"
              value={salesTaxRate}
              onChange={(e) => setSalesTaxRate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carLease.acquisitionFee', 'Acquisition Fee')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={acquisitionFee}
                onChange={(e) => setAcquisitionFee(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carLease.docFee', 'Doc Fee')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={docFee}
                onChange={(e) => setDocFee(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Monthly Payment Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carLease.estimatedMonthlyPayment', 'Estimated Monthly Payment')}</div>
          <div className="text-4xl font-bold text-teal-500 my-2">
            {formatCurrency(calculations.monthlyPayment)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            for {leaseTerm} months
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carLease.dueAtSigning', 'Due at Signing')}</div>
            <div className="text-2xl font-bold text-teal-500">{formatCurrency(calculations.dueAtSigning)}</div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.carLease.down1stMonthFees', 'Down + 1st month + fees')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carLease.totalLeaseCost', 'Total Lease Cost')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(calculations.totalCost)}</div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.carLease.allPaymentsDown', 'All payments + down')}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.carLease.monthlyPaymentBreakdown', 'Monthly Payment Breakdown')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.carLease.depreciation', 'Depreciation')}</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.monthlyDepreciation)}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.carLease.rentChargeFinance', 'Rent Charge (Finance)')}</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.rentCharge)}</span>
            </div>
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.carLease.basePayment', 'Base Payment')}</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.baseMonthlyPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.carLease.salesTax', 'Sales Tax')}</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.monthlyTax)}</span>
            </div>
            <div className={`flex justify-between pt-2 border-t font-medium ${isDark ? 'border-gray-700 text-teal-400' : 'border-gray-200 text-teal-600'}`}>
              <span>{t('tools.carLease.totalMonthly', 'Total Monthly')}</span>
              <span>{formatCurrency(calculations.monthlyPayment)}</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.carLease.leaseTips', 'Lease Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>Higher residual value = lower monthly payment</li>
                <li>Lower money factor = less interest paid</li>
                <li>Money factor x 2400 = equivalent APR</li>
                <li>{t('tools.carLease.negotiateTheCapCostNot', 'Negotiate the cap cost, not just the monthly payment')}</li>
                <li>{t('tools.carLease.considerPuttingLessDownLost', 'Consider putting less down (lost if car is totaled)')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarLeaseTool;
