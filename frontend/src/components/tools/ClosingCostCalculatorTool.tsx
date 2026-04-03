import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, DollarSign, FileText, Calculator, Info, Sparkles, Percent } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ClosingCostResult {
  totalClosingCosts: number;
  percentOfHomePrice: number;
  cashNeededAtClosing: number;
  breakdown: {
    lenderFees: {
      loanOrigination: number;
      applicationFee: number;
      creditReport: number;
      appraisal: number;
      underwriting: number;
    };
    thirdPartyFees: {
      titleSearch: number;
      titleInsurance: number;
      escrow: number;
      survey: number;
      homeInspection: number;
    };
    prepaidItems: {
      propertyTaxes: number;
      homeownerInsurance: number;
      mortgageInsurance: number;
      prepaidInterest: number;
    };
    governmentFees: {
      recordingFees: number;
      transferTaxes: number;
    };
  };
}

interface ClosingCostCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const ClosingCostCalculatorTool: React.FC<ClosingCostCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homePrice, setHomePrice] = useState('350000');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [loanType, setLoanType] = useState<'conventional' | 'fha' | 'va'>('conventional');
  const [state, setState] = useState('');
  const [propertyTaxRate, setPropertyTaxRate] = useState('1.2');
  const [closingDate, setClosingDate] = useState('15');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // State transfer tax rates (simplified, per $1000)
  const stateTransferTaxes: Record<string, number> = {
    'AL': 0.5, 'AK': 0, 'AZ': 0, 'AR': 2, 'CA': 1.1,
    'CO': 0.01, 'CT': 7.5, 'DE': 4, 'FL': 7, 'GA': 1,
    'HI': 0.1, 'ID': 0, 'IL': 0.5, 'IN': 0, 'IA': 1.6,
    'KS': 0, 'KY': 0.5, 'LA': 0, 'ME': 2.2, 'MD': 5,
    'MA': 4.56, 'MI': 8.6, 'MN': 3.3, 'MS': 0, 'MO': 0,
    'MT': 0, 'NE': 2.25, 'NV': 3.9, 'NH': 7.5, 'NJ': 5,
    'NM': 0, 'NY': 4, 'NC': 2, 'ND': 0, 'OH': 1,
    'OK': 0.75, 'OR': 0, 'PA': 10, 'RI': 2.3, 'SC': 1.85,
    'SD': 0, 'TN': 3.7, 'TX': 0, 'UT': 0, 'VT': 5,
    'VA': 2.5, 'WA': 2.78, 'WV': 2.2, 'WI': 3, 'WY': 0,
    '': 2, // Default
  };

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.price !== undefined || params.amount !== undefined) {
        setHomePrice(String(params.price || params.amount));
        setIsPrefilled(true);
      }
      if (params.downPayment !== undefined) {
        setDownPaymentPercent(String(params.downPayment));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const result = useMemo<ClosingCostResult | null>(() => {
    const price = parseFloat(homePrice) || 0;
    const downPercent = parseFloat(downPaymentPercent) || 0;
    const taxRate = parseFloat(propertyTaxRate) || 1.2;
    const closingDay = parseInt(closingDate) || 15;

    if (price <= 0) {
      return null;
    }

    const downPayment = price * (downPercent / 100);
    const loanAmount = price - downPayment;

    // Lender Fees
    const loanOrigination = loanAmount * 0.01; // 1% of loan
    const applicationFee = 350;
    const creditReport = 50;
    const appraisal = 500;
    const underwriting = 700;

    // Third Party Fees
    const titleSearch = 400;
    const titleInsurance = price * 0.005; // ~0.5% of home price
    const escrow = price * 0.01; // ~1% escrow/closing fee
    const survey = 400;
    const homeInspection = 450;

    // Prepaid Items
    const monthlyPropertyTax = (price * (taxRate / 100)) / 12;
    const propertyTaxes = monthlyPropertyTax * 3; // ~3 months prepaid

    const annualInsurance = price * 0.0035; // ~0.35% of home value
    const homeownerInsurance = annualInsurance; // First year prepaid

    // PMI (for less than 20% down)
    let mortgageInsurance = 0;
    if (downPercent < 20 && loanType !== 'va') {
      mortgageInsurance = (loanAmount * 0.01) / 12 * 2; // ~2 months prepaid
    }

    // FHA upfront MIP
    if (loanType === 'fha') {
      mortgageInsurance += loanAmount * 0.0175; // 1.75% upfront MIP
    }

    // VA funding fee
    if (loanType === 'va') {
      mortgageInsurance = loanAmount * 0.0215; // 2.15% for first-time use
    }

    // Prepaid interest (days remaining in month * daily interest)
    const monthlyRate = 0.07 / 12; // Assuming 7% interest rate
    const daysRemaining = 30 - closingDay;
    const prepaidInterest = loanAmount * monthlyRate * (daysRemaining / 30);

    // Government Fees
    const recordingFees = 150;
    const transferTaxRate = stateTransferTaxes[state.toUpperCase()] || stateTransferTaxes[''];
    const transferTaxes = (price / 1000) * transferTaxRate;

    // Calculate totals
    const lenderFeesTotal = loanOrigination + applicationFee + creditReport + appraisal + underwriting;
    const thirdPartyTotal = titleSearch + titleInsurance + escrow + survey + homeInspection;
    const prepaidTotal = propertyTaxes + homeownerInsurance + mortgageInsurance + prepaidInterest;
    const governmentTotal = recordingFees + transferTaxes;

    const totalClosingCosts = lenderFeesTotal + thirdPartyTotal + prepaidTotal + governmentTotal;

    return {
      totalClosingCosts,
      percentOfHomePrice: (totalClosingCosts / price) * 100,
      cashNeededAtClosing: totalClosingCosts + downPayment,
      breakdown: {
        lenderFees: {
          loanOrigination,
          applicationFee,
          creditReport,
          appraisal,
          underwriting,
        },
        thirdPartyFees: {
          titleSearch,
          titleInsurance,
          escrow,
          survey,
          homeInspection,
        },
        prepaidItems: {
          propertyTaxes,
          homeownerInsurance,
          mortgageInsurance,
          prepaidInterest,
        },
        governmentFees: {
          recordingFees,
          transferTaxes,
        },
      },
    };
  }, [homePrice, downPaymentPercent, loanType, state, propertyTaxRate, closingDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const stateOptions = [
    { code: '', name: 'Select State (for transfer tax)' },
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closingCostCalculator.closingCostCalculator', 'Closing Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.closingCostCalculator.estimateRealEstateClosingCosts', 'Estimate real estate closing costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.closingCostCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Home Price */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.closingCostCalculator.homePurchasePrice', 'Home Purchase Price')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
              placeholder="350000"
              className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Percent className="w-4 h-4 inline mr-1" />
            {t('tools.closingCostCalculator.downPayment', 'Down Payment (%)')}
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
            } focus:outline-none focus:ring-2 focus:ring-amber-500`}
          />
          <div className="flex gap-2">
            {[3.5, 5, 10, 20].map((pct) => (
              <button
                key={pct}
                onClick={() => setDownPaymentPercent(pct.toString())}
                className={`flex-1 py-1 text-xs rounded ${
                  parseFloat(downPaymentPercent) === pct
                    ? 'bg-amber-500 text-white'
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

        {/* Loan Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.closingCostCalculator.loanType', 'Loan Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'conventional', label: 'Conventional' },
              { value: 'fha', label: 'FHA' },
              { value: 'va', label: 'VA' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setLoanType(type.value as any)}
                className={`py-2 px-3 text-sm rounded-lg ${
                  loanType === type.value
                    ? 'bg-amber-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* State Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.closingCostCalculator.stateForTransferTaxes', 'State (for transfer taxes)')}
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-amber-500`}
          >
            {stateOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>{opt.name}</option>
            ))}
          </select>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.closingCostCalculator.propertyTaxRate', 'Property Tax Rate (%)')}
            </label>
            <input
              type="number"
              value={propertyTaxRate}
              onChange={(e) => setPropertyTaxRate(e.target.value)}
              step="0.1"
              placeholder="1.2"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.closingCostCalculator.closingDayOfMonth', 'Closing Day of Month')}
            </label>
            <input
              type="number"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              min="1"
              max="31"
              placeholder="15"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
              <div className="text-center mb-4">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closingCostCalculator.estimatedClosingCosts', 'Estimated Closing Costs')}</div>
                <div className="text-4xl font-bold text-amber-500">
                  {formatCurrency(result.totalClosingCosts)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {result.percentOfHomePrice.toFixed(1)}% of home price
                </div>
              </div>
              <div className={`text-center pt-4 border-t ${isDark ? 'border-amber-800' : 'border-amber-200'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.closingCostCalculator.totalCashNeededAtClosing', 'Total Cash Needed at Closing')}</div>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(result.cashNeededAtClosing)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.closingCostCalculator.downPaymentClosingCosts', 'Down payment + Closing costs')}
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.closingCostCalculator.costBreakdown', 'Cost Breakdown')}</h4>

              {/* Lender Fees */}
              <div className="mb-4">
                <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.closingCostCalculator.lenderFees', 'Lender Fees')}</h5>
                <div className="space-y-1 pl-4">
                  {Object.entries(result.breakdown.lenderFees).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Third Party Fees */}
              <div className="mb-4">
                <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.closingCostCalculator.thirdPartyFees', 'Third Party Fees')}</h5>
                <div className="space-y-1 pl-4">
                  {Object.entries(result.breakdown.thirdPartyFees).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prepaid Items */}
              <div className="mb-4">
                <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.closingCostCalculator.prepaidItems', 'Prepaid Items')}</h5>
                <div className="space-y-1 pl-4">
                  {Object.entries(result.breakdown.prepaidItems).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Government Fees */}
              <div>
                <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.closingCostCalculator.governmentFees', 'Government Fees')}</h5>
                <div className="space-y-1 pl-4">
                  {Object.entries(result.breakdown.governmentFees).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{formatCurrency(value)}</span>
                    </div>
                  ))}
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
              <strong>{t('tools.closingCostCalculator.note', 'Note:')}</strong> Actual closing costs may vary. Some fees are negotiable, and sellers may agree to pay some costs. Ask your lender for a detailed Loan Estimate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingCostCalculatorTool;
