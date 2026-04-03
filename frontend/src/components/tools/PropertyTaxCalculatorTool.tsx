import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, DollarSign, MapPin, Calculator, Info, Sparkles, Building2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PropertyTaxResult {
  annualTax: number;
  monthlyTax: number;
  effectiveRate: number;
  assessedValue: number;
  taxableValue: number;
}

interface PropertyTaxCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const PropertyTaxCalculatorTool: React.FC<PropertyTaxCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homeValue, setHomeValue] = useState('350000');
  const [assessmentRatio, setAssessmentRatio] = useState('100');
  const [taxRate, setTaxRate] = useState('1.2');
  const [useMillage, setUseMillage] = useState(false);
  const [millageRate, setMillageRate] = useState('12');
  const [exemptions, setExemptions] = useState('0');
  const [state, setState] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Average property tax rates by state (2023 data)
  const stateRates: Record<string, { rate: number; name: string }> = {
    'AL': { rate: 0.41, name: 'Alabama' },
    'AK': { rate: 1.19, name: 'Alaska' },
    'AZ': { rate: 0.62, name: 'Arizona' },
    'AR': { rate: 0.62, name: 'Arkansas' },
    'CA': { rate: 0.76, name: 'California' },
    'CO': { rate: 0.51, name: 'Colorado' },
    'CT': { rate: 2.14, name: 'Connecticut' },
    'DE': { rate: 0.57, name: 'Delaware' },
    'FL': { rate: 0.89, name: 'Florida' },
    'GA': { rate: 0.92, name: 'Georgia' },
    'HI': { rate: 0.28, name: 'Hawaii' },
    'ID': { rate: 0.69, name: 'Idaho' },
    'IL': { rate: 2.27, name: 'Illinois' },
    'IN': { rate: 0.85, name: 'Indiana' },
    'IA': { rate: 1.57, name: 'Iowa' },
    'KS': { rate: 1.41, name: 'Kansas' },
    'KY': { rate: 0.86, name: 'Kentucky' },
    'LA': { rate: 0.55, name: 'Louisiana' },
    'ME': { rate: 1.36, name: 'Maine' },
    'MD': { rate: 1.09, name: 'Maryland' },
    'MA': { rate: 1.23, name: 'Massachusetts' },
    'MI': { rate: 1.54, name: 'Michigan' },
    'MN': { rate: 1.12, name: 'Minnesota' },
    'MS': { rate: 0.81, name: 'Mississippi' },
    'MO': { rate: 0.97, name: 'Missouri' },
    'MT': { rate: 0.84, name: 'Montana' },
    'NE': { rate: 1.73, name: 'Nebraska' },
    'NV': { rate: 0.60, name: 'Nevada' },
    'NH': { rate: 2.18, name: 'New Hampshire' },
    'NJ': { rate: 2.49, name: 'New Jersey' },
    'NM': { rate: 0.80, name: 'New Mexico' },
    'NY': { rate: 1.72, name: 'New York' },
    'NC': { rate: 0.84, name: 'North Carolina' },
    'ND': { rate: 0.98, name: 'North Dakota' },
    'OH': { rate: 1.56, name: 'Ohio' },
    'OK': { rate: 0.90, name: 'Oklahoma' },
    'OR': { rate: 0.97, name: 'Oregon' },
    'PA': { rate: 1.58, name: 'Pennsylvania' },
    'RI': { rate: 1.63, name: 'Rhode Island' },
    'SC': { rate: 0.57, name: 'South Carolina' },
    'SD': { rate: 1.31, name: 'South Dakota' },
    'TN': { rate: 0.71, name: 'Tennessee' },
    'TX': { rate: 1.80, name: 'Texas' },
    'UT': { rate: 0.63, name: 'Utah' },
    'VT': { rate: 1.90, name: 'Vermont' },
    'VA': { rate: 0.82, name: 'Virginia' },
    'WA': { rate: 0.98, name: 'Washington' },
    'WV': { rate: 0.58, name: 'West Virginia' },
    'WI': { rate: 1.85, name: 'Wisconsin' },
    'WY': { rate: 0.61, name: 'Wyoming' },
  };

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.price !== undefined || params.amount !== undefined) {
        setHomeValue(String(params.price || params.amount));
        setIsPrefilled(true);
      }
      if (params.taxRate !== undefined) {
        setTaxRate(String(params.taxRate));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Update tax rate when state changes
  useEffect(() => {
    if (state && stateRates[state]) {
      setTaxRate(stateRates[state].rate.toString());
    }
  }, [state]);

  const result = useMemo<PropertyTaxResult | null>(() => {
    const value = parseFloat(homeValue) || 0;
    const ratio = parseFloat(assessmentRatio) || 100;
    const exempt = parseFloat(exemptions) || 0;

    if (value <= 0) {
      return null;
    }

    // Calculate assessed value
    const assessedValue = value * (ratio / 100);

    // Calculate taxable value (after exemptions)
    const taxableValue = Math.max(0, assessedValue - exempt);

    // Calculate annual tax
    let annualTax: number;
    let effectiveRate: number;

    if (useMillage) {
      const mills = parseFloat(millageRate) || 0;
      // Millage: mills per $1,000 of taxable value
      annualTax = (taxableValue / 1000) * mills;
      effectiveRate = (mills / 1000) * (ratio / 100) * 100;
    } else {
      const rate = parseFloat(taxRate) || 0;
      annualTax = taxableValue * (rate / 100);
      effectiveRate = rate * (ratio / 100);
    }

    const monthlyTax = annualTax / 12;

    return {
      annualTax,
      monthlyTax,
      effectiveRate,
      assessedValue,
      taxableValue,
    };
  }, [homeValue, assessmentRatio, taxRate, useMillage, millageRate, exemptions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const stateOptions = [
    { code: '', name: 'Select State (optional)' },
    ...Object.entries(stateRates)
      .map(([code, data]) => ({ code, name: `${data.name} (${data.rate}%)` }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyTaxCalculator.propertyTaxCalculator', 'Property Tax Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.propertyTaxCalculator.estimateYourPropertyTaxes', 'Estimate your property taxes')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.propertyTaxCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Home Value */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.propertyTaxCalculator.homeMarketValue', 'Home Market Value')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={homeValue}
              onChange={(e) => setHomeValue(e.target.value)}
              placeholder="350000"
              className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* State Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('tools.propertyTaxCalculator.stateAutoFillsAverageRate', 'State (auto-fills average rate)')}
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {stateOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>{opt.name}</option>
            ))}
          </select>
        </div>

        {/* Tax Rate Type Toggle */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.propertyTaxCalculator.taxRateType', 'Tax Rate Type')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setUseMillage(false)}
              className={`flex-1 py-2 rounded-lg font-medium ${
                !useMillage
                  ? 'bg-blue-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.propertyTaxCalculator.percentage', 'Percentage (%)')}
            </button>
            <button
              onClick={() => setUseMillage(true)}
              className={`flex-1 py-2 rounded-lg font-medium ${
                useMillage
                  ? 'bg-blue-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.propertyTaxCalculator.millageRate', 'Millage Rate')}
            </button>
          </div>
        </div>

        {/* Tax Rate Input */}
        {useMillage ? (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.propertyTaxCalculator.millageRateMillsPer1', 'Millage Rate (mills per $1,000)')}
            </label>
            <input
              type="number"
              value={millageRate}
              onChange={(e) => setMillageRate(e.target.value)}
              step="0.1"
              placeholder="12"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.propertyTaxCalculator.taxRate2', 'Tax Rate (%)')}
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              step="0.01"
              placeholder="1.2"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="flex gap-2">
              {[0.5, 1.0, 1.5, 2.0, 2.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setTaxRate(rate.toString())}
                  className={`flex-1 py-1 text-xs rounded ${
                    parseFloat(taxRate) === rate
                      ? 'bg-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Ratio */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.propertyTaxCalculator.assessmentRatio2', 'Assessment Ratio (%)')}
          </label>
          <input
            type="number"
            value={assessmentRatio}
            onChange={(e) => setAssessmentRatio(e.target.value)}
            min="1"
            max="100"
            placeholder="100"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.propertyTaxCalculator.percentageOfMarketValueUsed', 'Percentage of market value used for tax assessment (varies by jurisdiction)')}
          </p>
        </div>

        {/* Exemptions */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.propertyTaxCalculator.exemptionsHomesteadSeniorEtc', 'Exemptions (Homestead, Senior, etc.)')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={exemptions}
              onChange={(e) => setExemptions(e.target.value)}
              placeholder="0"
              className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex gap-2">
            {[0, 25000, 50000, 75000].map((amt) => (
              <button
                key={amt}
                onClick={() => setExemptions(amt.toString())}
                className={`flex-1 py-1 text-xs rounded ${
                  parseFloat(exemptions) === amt
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {amt === 0 ? 'None' : `$${amt / 1000}K`}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.propertyTaxCalculator.annualPropertyTax', 'Annual Property Tax')}</div>
                  <div className="text-3xl font-bold text-blue-500">
                    {formatCurrency(result.annualTax)}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.propertyTaxCalculator.monthlyEscrow', 'Monthly Escrow')}</div>
                  <div className="text-3xl font-bold text-green-500">
                    {formatCurrency(result.monthlyTax)}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyTaxCalculator.taxCalculationBreakdown', 'Tax Calculation Breakdown')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.propertyTaxCalculator.marketValue', 'Market Value')}</span>
                  <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{formatCurrency(parseFloat(homeValue))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.propertyTaxCalculator.assessmentRatio', 'Assessment Ratio')}</span>
                  <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{assessmentRatio}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.propertyTaxCalculator.assessedValue', 'Assessed Value')}</span>
                  <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{formatCurrency(result.assessedValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.propertyTaxCalculator.exemptions', 'Exemptions')}</span>
                  <span className="text-green-500">-{formatCurrency(parseFloat(exemptions))}</span>
                </div>
                <div className={`flex justify-between text-sm pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyTaxCalculator.taxableValue', 'Taxable Value')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(result.taxableValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.propertyTaxCalculator.taxRate', 'Tax Rate')}</span>
                  <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>
                    {useMillage ? `${millageRate} mills` : `${taxRate}%`}
                  </span>
                </div>
                <div className={`flex justify-between text-sm pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyTaxCalculator.effectiveRate', 'Effective Rate')}</span>
                  <span className="font-medium text-blue-500">{result.effectiveRate.toFixed(3)}%</span>
                </div>
              </div>
            </div>

            {/* Comparison by State */}
            {state && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.propertyTaxCalculator.stateComparison', 'State Comparison')}</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stateRates[state].name} has an average property tax rate of {stateRates[state].rate}%.
                  {stateRates[state].rate < 1.0 && ' This is below the national average.'}
                  {stateRates[state].rate >= 1.0 && stateRates[state].rate < 1.5 && ' This is around the national average.'}
                  {stateRates[state].rate >= 1.5 && ' This is above the national average.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.propertyTaxCalculator.note', 'Note:')}</strong> Property tax rates vary significantly by county and municipality. Check with your local tax assessor for exact rates. Common exemptions include homestead, senior citizen, veteran, and disability exemptions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyTaxCalculatorTool;
