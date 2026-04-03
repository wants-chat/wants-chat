import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Globe, DollarSign, Package, Sparkles, Info, AlertTriangle, Calculator, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CustomsDutyCalculatorToolProps {
  uiConfig?: UIConfig;
}

type Country = 'US' | 'UK' | 'EU' | 'CA' | 'AU' | 'CN' | 'JP' | 'MX' | 'IN' | 'BR';

interface CountryInfo {
  name: string;
  currency: string;
  currencySymbol: string;
  vatRate: number;
  dutyThreshold: number;
  vatThreshold: number;
}

interface ProductCategory {
  name: string;
  hsCode: string;
  avgDutyRate: number;
}

export const CustomsDutyCalculatorTool: React.FC<CustomsDutyCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [originCountry, setOriginCountry] = useState<Country>('CN');
  const [destCountry, setDestCountry] = useState<Country>('US');
  const [productValue, setProductValue] = useState('1000');
  const [shippingCost, setShippingCost] = useState('150');
  const [insuranceCost, setInsuranceCost] = useState('25');
  const [productCategory, setProductCategory] = useState('electronics');
  const [customDutyRate, setCustomDutyRate] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [hsCode, setHsCode] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.value !== undefined || params.productValue !== undefined) {
        setProductValue(String(params.value || params.productValue));
        setIsPrefilled(true);
      }
      if (params.shippingCost !== undefined) {
        setShippingCost(String(params.shippingCost));
        setIsPrefilled(true);
      }
      if (params.origin !== undefined) {
        setOriginCountry(params.origin as Country);
        setIsPrefilled(true);
      }
      if (params.destination !== undefined) {
        setDestCountry(params.destination as Country);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const countries: Record<Country, CountryInfo> = {
    US: { name: 'United States', currency: 'USD', currencySymbol: '$', vatRate: 0, dutyThreshold: 800, vatThreshold: 800 },
    UK: { name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', vatRate: 20, dutyThreshold: 135, vatThreshold: 0 },
    EU: { name: 'European Union', currency: 'EUR', currencySymbol: '€', vatRate: 21, dutyThreshold: 150, vatThreshold: 0 },
    CA: { name: 'Canada', currency: 'CAD', currencySymbol: 'C$', vatRate: 5, dutyThreshold: 20, vatThreshold: 20 },
    AU: { name: 'Australia', currency: 'AUD', currencySymbol: 'A$', vatRate: 10, dutyThreshold: 1000, vatThreshold: 1000 },
    CN: { name: 'China', currency: 'CNY', currencySymbol: '¥', vatRate: 13, dutyThreshold: 50, vatThreshold: 50 },
    JP: { name: 'Japan', currency: 'JPY', currencySymbol: '¥', vatRate: 10, dutyThreshold: 10000, vatThreshold: 10000 },
    MX: { name: 'Mexico', currency: 'MXN', currencySymbol: '$', vatRate: 16, dutyThreshold: 50, vatThreshold: 50 },
    IN: { name: 'India', currency: 'INR', currencySymbol: '₹', vatRate: 18, dutyThreshold: 0, vatThreshold: 0 },
    BR: { name: 'Brazil', currency: 'BRL', currencySymbol: 'R$', vatRate: 17, dutyThreshold: 50, vatThreshold: 50 },
  };

  const productCategories: Record<string, ProductCategory> = {
    electronics: { name: 'Electronics & Computers', hsCode: '8471', avgDutyRate: 0 },
    clothing: { name: 'Clothing & Textiles', hsCode: '6109', avgDutyRate: 12 },
    footwear: { name: 'Footwear', hsCode: '6403', avgDutyRate: 20 },
    jewelry: { name: 'Jewelry & Watches', hsCode: '7113', avgDutyRate: 6.5 },
    furniture: { name: 'Furniture', hsCode: '9403', avgDutyRate: 0 },
    toys: { name: 'Toys & Games', hsCode: '9503', avgDutyRate: 0 },
    cosmetics: { name: 'Cosmetics & Beauty', hsCode: '3304', avgDutyRate: 0 },
    food: { name: 'Food & Beverages', hsCode: '2106', avgDutyRate: 10 },
    auto_parts: { name: 'Auto Parts', hsCode: '8708', avgDutyRate: 2.5 },
    machinery: { name: 'Machinery', hsCode: '8479', avgDutyRate: 0 },
    sports: { name: 'Sports Equipment', hsCode: '9506', avgDutyRate: 0 },
    musical: { name: 'Musical Instruments', hsCode: '9201', avgDutyRate: 4.5 },
    artwork: { name: 'Art & Antiques', hsCode: '9701', avgDutyRate: 0 },
    other: { name: 'Other Goods', hsCode: '9999', avgDutyRate: 5 },
  };

  const calculations = useMemo(() => {
    const value = parseFloat(productValue) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const insurance = parseFloat(insuranceCost) || 0;
    const qty = parseInt(quantity) || 1;

    const totalProductValue = value * qty;
    const destInfo = countries[destCountry];
    const category = productCategories[productCategory];

    // CIF (Cost, Insurance, Freight) value - basis for duty calculation
    const cifValue = totalProductValue + shipping + insurance;

    // Determine duty rate
    const dutyRate = customDutyRate !== ''
      ? parseFloat(customDutyRate) / 100
      : category.avgDutyRate / 100;

    // Check if below de minimis threshold
    const isBelowDutyThreshold = cifValue < destInfo.dutyThreshold;
    const isBelowVatThreshold = cifValue < destInfo.vatThreshold;

    // Calculate duty
    const dutyAmount = isBelowDutyThreshold ? 0 : cifValue * dutyRate;

    // Calculate VAT/GST (applied on CIF + duty)
    const vatableAmount = cifValue + dutyAmount;
    const vatAmount = isBelowVatThreshold && destInfo.vatThreshold > 0 ? 0 : vatableAmount * (destInfo.vatRate / 100);

    // Merchandise Processing Fee (US specific)
    let mpfAmount = 0;
    if (destCountry === 'US' && cifValue > 2500) {
      mpfAmount = Math.min(Math.max(cifValue * 0.003464, 27.75), 528.33);
    }

    // Harbor Maintenance Fee (US specific, ocean shipments)
    let hmfAmount = 0;
    if (destCountry === 'US') {
      hmfAmount = cifValue * 0.00125;
    }

    // Total customs charges
    const totalCustomsCharges = dutyAmount + vatAmount + mpfAmount + hmfAmount;

    // Landed cost
    const landedCost = totalProductValue + shipping + insurance + totalCustomsCharges;

    // Effective tax rate
    const effectiveTaxRate = totalProductValue > 0 ? (totalCustomsCharges / totalProductValue) * 100 : 0;

    return {
      cifValue,
      dutyRate: dutyRate * 100,
      dutyAmount,
      vatRate: destInfo.vatRate,
      vatAmount,
      mpfAmount,
      hmfAmount,
      totalCustomsCharges,
      landedCost,
      effectiveTaxRate,
      isBelowDutyThreshold,
      isBelowVatThreshold,
      destInfo,
      category,
      totalProductValue,
    };
  }, [productValue, shippingCost, insuranceCost, productCategory, customDutyRate, quantity, destCountry]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <FileText className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.customsDutyCalculator.customsDutyCalculator', 'Customs Duty Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.customsDutyCalculator.estimateImportDutiesTaxesAnd', 'Estimate import duties, taxes, and landed cost')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.customsDutyCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Origin and Destination */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Globe className="w-4 h-4 inline mr-1" />
              {t('tools.customsDutyCalculator.originCountry', 'Origin Country')}
            </label>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value as Country)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              {Object.entries(countries).map(([code, info]) => (
                <option key={code} value={code}>{info.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Globe className="w-4 h-4 inline mr-1" />
              {t('tools.customsDutyCalculator.destinationCountry', 'Destination Country')}
            </label>
            <select
              value={destCountry}
              onChange={(e) => setDestCountry(e.target.value as Country)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              {Object.entries(countries).map(([code, info]) => (
                <option key={code} value={code}>{info.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Category */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.customsDutyCalculator.productCategory', 'Product Category')}
          </label>
          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
          >
            {Object.entries(productCategories).map(([key, cat]) => (
              <option key={key} value={key}>
                {cat.name} (Avg. {cat.avgDutyRate}% duty)
              </option>
            ))}
          </select>
        </div>

        {/* HS Code (Optional) */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Search className="w-4 h-4 inline mr-1" />
            {t('tools.customsDutyCalculator.hsCodeOptional', 'HS Code (Optional)')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hsCode}
              onChange={(e) => setHsCode(e.target.value)}
              placeholder={`e.g., ${calculations.category.hsCode}`}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
            <input
              type="number"
              value={customDutyRate}
              onChange={(e) => setCustomDutyRate(e.target.value)}
              placeholder={`Custom rate %`}
              className={`w-32 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.customsDutyCalculator.leaveCustomRateEmptyTo', 'Leave custom rate empty to use category average')}
          </div>
        </div>

        {/* Value Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.customsDutyCalculator.productValueUsd', 'Product Value (USD)')}
            </label>
            <input
              type="number"
              value={productValue}
              onChange={(e) => setProductValue(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.customsDutyCalculator.quantity', 'Quantity')}
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.customsDutyCalculator.shippingCostUsd', 'Shipping Cost (USD)')}
            </label>
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.customsDutyCalculator.insuranceCostUsd', 'Insurance Cost (USD)')}
            </label>
            <input
              type="number"
              value={insuranceCost}
              onChange={(e) => setInsuranceCost(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
        </div>

        {/* De Minimis Notice */}
        {(calculations.isBelowDutyThreshold || calculations.isBelowVatThreshold) && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} border ${isDark ? 'border-green-800' : 'border-green-200'}`}>
            <Info className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">
              {calculations.isBelowDutyThreshold && `Value below ${calculations.destInfo.dutyThreshold} ${calculations.destInfo.currency} duty threshold. `}
              {calculations.isBelowVatThreshold && calculations.destInfo.vatThreshold > 0 && `Value below VAT/GST threshold.`}
            </span>
          </div>
        )}

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customsDutyCalculator.totalLandedCost', 'Total Landed Cost')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            ${calculations.landedCost.toFixed(2)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Total customs charges: ${calculations.totalCustomsCharges.toFixed(2)} ({calculations.effectiveTaxRate.toFixed(1)}% of product value)
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calculator className="w-4 h-4 inline mr-1" />
            {t('tools.customsDutyCalculator.costBreakdown', 'Cost Breakdown')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>Product Value ({parseInt(quantity)} x ${parseFloat(productValue).toFixed(2)})</span>
              <span className="font-medium">${calculations.totalProductValue.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.customsDutyCalculator.shipping', 'Shipping')}</span>
              <span className="font-medium">${parseFloat(shippingCost).toFixed(2)}</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.customsDutyCalculator.insurance', 'Insurance')}</span>
              <span className="font-medium">${parseFloat(insuranceCost).toFixed(2)}</span>
            </div>
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-gray-900'}`}>
              <span className="font-medium">{t('tools.customsDutyCalculator.cifValue', 'CIF Value')}</span>
              <span className="font-medium">${calculations.cifValue.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>Import Duty ({calculations.dutyRate.toFixed(1)}%)</span>
              <span className={`font-medium ${calculations.isBelowDutyThreshold ? 'text-green-500' : ''}`}>
                {calculations.isBelowDutyThreshold ? 'Exempt' : `$${calculations.dutyAmount.toFixed(2)}`}
              </span>
            </div>
            {calculations.vatRate > 0 && (
              <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>VAT/GST ({calculations.vatRate}%)</span>
                <span className={`font-medium ${calculations.isBelowVatThreshold && calculations.destInfo.vatThreshold > 0 ? 'text-green-500' : ''}`}>
                  {calculations.isBelowVatThreshold && calculations.destInfo.vatThreshold > 0 ? 'Exempt' : `$${calculations.vatAmount.toFixed(2)}`}
                </span>
              </div>
            )}
            {calculations.mpfAmount > 0 && (
              <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>{t('tools.customsDutyCalculator.merchandiseProcessingFee', 'Merchandise Processing Fee')}</span>
                <span className="font-medium">${calculations.mpfAmount.toFixed(2)}</span>
              </div>
            )}
            {calculations.hmfAmount > 0 && (
              <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>{t('tools.customsDutyCalculator.harborMaintenanceFee', 'Harbor Maintenance Fee')}</span>
                <span className="font-medium">${calculations.hmfAmount.toFixed(2)}</span>
              </div>
            )}
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className="font-medium text-teal-500">{t('tools.customsDutyCalculator.totalCustomsCharges', 'Total Customs Charges')}</span>
              <span className="font-medium text-teal-500">${calculations.totalCustomsCharges.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Destination Info */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customsDutyCalculator.vatGstRate', 'VAT/GST Rate')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.destInfo.vatRate}%
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customsDutyCalculator.dutyThreshold', 'Duty Threshold')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.destInfo.currencySymbol}{calculations.destInfo.dutyThreshold}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.customsDutyCalculator.effectiveRate', 'Effective Rate')}</div>
            <div className="text-xl font-bold text-teal-500">
              {calculations.effectiveTaxRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
            <p className="font-medium mb-1">{t('tools.customsDutyCalculator.disclaimer', 'Disclaimer')}</p>
            <p>{t('tools.customsDutyCalculator.thisIsAnEstimateOnly', 'This is an estimate only. Actual duties and taxes may vary based on exact HS classification, trade agreements, product composition, and customs valuation. Consult a licensed customs broker for accurate calculations.')}</p>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">{t('tools.customsDutyCalculator.reducingImportCosts', 'Reducing Import Costs')}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('tools.customsDutyCalculator.checkForApplicableFreeTrade', 'Check for applicable Free Trade Agreements (FTAs)')}</li>
              <li>{t('tools.customsDutyCalculator.verifyCorrectHsCodeClassification', 'Verify correct HS code classification')}</li>
              <li>{t('tools.customsDutyCalculator.considerDutyDrawbackForRe', 'Consider duty drawback for re-exported goods')}</li>
              <li>{t('tools.customsDutyCalculator.useBondedWarehousesForDeferred', 'Use bonded warehouses for deferred duty payment')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomsDutyCalculatorTool;
