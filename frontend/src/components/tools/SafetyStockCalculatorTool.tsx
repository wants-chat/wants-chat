'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Calculator, Copy, Check, Info, TrendingUp, AlertTriangle, Package, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface SafetyStockCalculatorToolProps {
  uiConfig?: any;
}

type CalculationMethod = 'basic' | 'statistical' | 'service-level';

export const SafetyStockCalculatorTool: React.FC<SafetyStockCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [method, setMethod] = useState<CalculationMethod>('basic');

  // Basic method inputs
  const [maxDailyUsage, setMaxDailyUsage] = useState('150');
  const [avgDailyUsage, setAvgDailyUsage] = useState('100');
  const [maxLeadTime, setMaxLeadTime] = useState('10');
  const [avgLeadTime, setAvgLeadTime] = useState('7');

  // Statistical method inputs
  const [demandStdDev, setDemandStdDev] = useState('20');
  const [leadTimeStdDev, setLeadTimeStdDev] = useState('2');

  // Service level inputs
  const [serviceLevel, setServiceLevel] = useState('95');

  // Cost analysis
  const [unitCost, setUnitCost] = useState('25');
  const [holdingCostPercent, setHoldingCostPercent] = useState('25');
  const [stockoutCost, setStockoutCost] = useState('100');

  const [copied, setCopied] = useState(false);

  // Z-scores for common service levels
  const getZScore = (sl: number): number => {
    if (sl >= 99.9) return 3.09;
    if (sl >= 99) return 2.33;
    if (sl >= 98) return 2.05;
    if (sl >= 97) return 1.88;
    if (sl >= 96) return 1.75;
    if (sl >= 95) return 1.65;
    if (sl >= 94) return 1.55;
    if (sl >= 93) return 1.48;
    if (sl >= 92) return 1.41;
    if (sl >= 91) return 1.34;
    if (sl >= 90) return 1.28;
    if (sl >= 85) return 1.04;
    if (sl >= 80) return 0.84;
    return 0.67; // 75%
  };

  const calculations = useMemo(() => {
    const avgUsage = parseFloat(avgDailyUsage) || 0;
    const maxUsage = parseFloat(maxDailyUsage) || 0;
    const avgLT = parseFloat(avgLeadTime) || 0;
    const maxLT = parseFloat(maxLeadTime) || 0;
    const demandSD = parseFloat(demandStdDev) || 0;
    const leadTimeSD = parseFloat(leadTimeStdDev) || 0;
    const sl = parseFloat(serviceLevel) || 95;
    const cost = parseFloat(unitCost) || 0;
    const holdingPct = parseFloat(holdingCostPercent) || 25;
    const stockout = parseFloat(stockoutCost) || 0;

    if (avgUsage <= 0 || avgLT <= 0) return null;

    let safetyStock: number;
    let methodDescription: string;

    const zScore = getZScore(sl);

    if (method === 'basic') {
      // Basic method: (Max Daily Usage × Max Lead Time) - (Avg Daily Usage × Avg Lead Time)
      safetyStock = (maxUsage * maxLT) - (avgUsage * avgLT);
      methodDescription = 'Basic (Max - Avg) Method';
    } else if (method === 'statistical') {
      // Statistical method with demand and lead time variability
      // SS = Z × √(LT × σD² + D² × σLT²)
      const variance = (avgLT * Math.pow(demandSD, 2)) + (Math.pow(avgUsage, 2) * Math.pow(leadTimeSD, 2));
      safetyStock = zScore * Math.sqrt(variance);
      methodDescription = 'Statistical (Combined Variability) Method';
    } else {
      // Service level method (simplified)
      // SS = Z × σD × √LT
      safetyStock = zScore * demandSD * Math.sqrt(avgLT);
      methodDescription = 'Service Level Method';
    }

    safetyStock = Math.max(0, Math.ceil(safetyStock));

    // Reorder point = (Avg Daily Usage × Avg Lead Time) + Safety Stock
    const reorderPoint = Math.ceil(avgUsage * avgLT + safetyStock);

    // Coverage days = Safety Stock / Average Daily Usage
    const coverageDays = safetyStock / avgUsage;

    // Cost analysis
    const safetyStockValue = safetyStock * cost;
    const annualHoldingCost = safetyStockValue * (holdingPct / 100);

    // Expected stockout cost without safety stock (simplified estimate)
    const stockoutProbability = 1 - (sl / 100);
    const expectedAnnualStockouts = 365 / avgLT * stockoutProbability;
    const expectedStockoutCostWithoutSS = expectedAnnualStockouts * stockout * avgUsage;

    // Net benefit of safety stock
    const netBenefit = expectedStockoutCostWithoutSS - annualHoldingCost;

    return {
      safetyStock,
      reorderPoint,
      coverageDays,
      safetyStockValue,
      annualHoldingCost,
      expectedStockoutCostWithoutSS,
      netBenefit,
      methodDescription,
      zScore,
      serviceLevel: sl,
    };
  }, [method, avgDailyUsage, maxDailyUsage, avgLeadTime, maxLeadTime, demandStdDev, leadTimeStdDev, serviceLevel, unitCost, holdingCostPercent, stockoutCost]);

  const handleCopy = () => {
    if (!calculations) return;
    const text = `Safety Stock Calculation

Method: ${calculations.methodDescription}
Service Level: ${calculations.serviceLevel}% (Z-score: ${calculations.zScore.toFixed(2)})

Average Daily Usage: ${avgDailyUsage} units
Average Lead Time: ${avgLeadTime} days

Results:
- Safety Stock: ${calculations.safetyStock.toLocaleString()} units
- Reorder Point: ${calculations.reorderPoint.toLocaleString()} units
- Coverage: ${calculations.coverageDays.toFixed(1)} days

Cost Analysis:
- Safety Stock Value: $${calculations.safetyStockValue.toLocaleString()}
- Annual Holding Cost: $${calculations.annualHoldingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
- Net Benefit: $${calculations.netBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const serviceLevelOptions = [
    { value: '99.9', label: '99.9% (Premium)' },
    { value: '99', label: '99% (High)' },
    { value: '97', label: '97%' },
    { value: '95', label: '95% (Standard)' },
    { value: '90', label: '90%' },
    { value: '85', label: '85%' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.safetyStockCalculator.safetyStockCalculator', 'Safety Stock Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.safetyStockCalculator.calculateBufferInventoryToPrevent', 'Calculate buffer inventory to prevent stockouts')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Method Toggle */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMethod('basic')}
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              method === 'basic'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.safetyStockCalculator.basic2', 'Basic')}
          </button>
          <button
            onClick={() => setMethod('statistical')}
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              method === 'statistical'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.safetyStockCalculator.statistical2', 'Statistical')}
          </button>
          <button
            onClick={() => setMethod('service-level')}
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              method === 'service-level'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.safetyStockCalculator.serviceLevel', 'Service Level')}
          </button>
        </div>

        {/* Demand Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 text-teal-500" />
            {t('tools.safetyStockCalculator.demandParameters', 'Demand Parameters')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.safetyStockCalculator.avgDailyUsage', 'Avg Daily Usage')}
              </label>
              <input
                type="number"
                value={avgDailyUsage}
                onChange={(e) => setAvgDailyUsage(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            {method === 'basic' && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.safetyStockCalculator.maxDailyUsage', 'Max Daily Usage')}
                </label>
                <input
                  type="number"
                  value={maxDailyUsage}
                  onChange={(e) => setMaxDailyUsage(e.target.value)}
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
            )}
            {(method === 'statistical' || method === 'service-level') && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.safetyStockCalculator.demandStdDev', 'Demand Std Dev')}
                </label>
                <input
                  type="number"
                  value={demandStdDev}
                  onChange={(e) => setDemandStdDev(e.target.value)}
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.safetyStockCalculator.avgLeadTimeDays', 'Avg Lead Time (days)')}
              </label>
              <input
                type="number"
                value={avgLeadTime}
                onChange={(e) => setAvgLeadTime(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            {method === 'basic' && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.safetyStockCalculator.maxLeadTimeDays', 'Max Lead Time (days)')}
                </label>
                <input
                  type="number"
                  value={maxLeadTime}
                  onChange={(e) => setMaxLeadTime(e.target.value)}
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
            )}
            {method === 'statistical' && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.safetyStockCalculator.leadTimeStdDev', 'Lead Time Std Dev')}
                </label>
                <input
                  type="number"
                  value={leadTimeStdDev}
                  onChange={(e) => setLeadTimeStdDev(e.target.value)}
                  min="0"
                  step="0.1"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Service Level Selection */}
        {(method === 'statistical' || method === 'service-level') && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.safetyStockCalculator.targetServiceLevel', 'Target Service Level')}
            </label>
            <div className="flex flex-wrap gap-2">
              {serviceLevelOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setServiceLevel(option.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    serviceLevel === option.value
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cost Analysis Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            {t('tools.safetyStockCalculator.costAnalysisOptional', 'Cost Analysis (Optional)')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.safetyStockCalculator.unitCost', 'Unit Cost ($)')}
              </label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.safetyStockCalculator.holdingCostAnnual', 'Holding Cost (% annual)')}
              </label>
              <input
                type="number"
                value={holdingCostPercent}
                onChange={(e) => setHoldingCostPercent(e.target.value)}
                min="0"
                max="100"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.safetyStockCalculator.stockoutCostEvent', 'Stockout Cost/Event ($)')}
              </label>
              <input
                type="number"
                value={stockoutCost}
                onChange={(e) => setStockoutCost(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {calculations && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {t('tools.safetyStockCalculator.safetyStockResults', 'Safety Stock Results')}
                </h4>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.safetyStockCalculator.copied', 'Copied!') : t('tools.safetyStockCalculator.copy', 'Copy')}
              </button>
            </div>

            {/* Main Results Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="flex justify-center mb-2">
                  <Shield className="w-8 h-8 text-teal-500" />
                </div>
                <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.safetyStockCalculator.safetyStock', 'Safety Stock')}</div>
                <div className="text-3xl font-bold text-teal-500">
                  {calculations.safetyStock.toLocaleString()}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="flex justify-center mb-2">
                  <Package className="w-8 h-8 text-orange-500" />
                </div>
                <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.safetyStockCalculator.reorderPoint', 'Reorder Point')}</div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.reorderPoint.toLocaleString()}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className="flex justify-center mb-2">
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
                <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.safetyStockCalculator.coverage', 'Coverage')}</div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.coverageDays.toFixed(1)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.safetyStockCalculator.daysOfBuffer', 'days of buffer')}</div>
              </div>
            </div>

            {/* Method Info */}
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} mb-4`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">{t('tools.safetyStockCalculator.method', 'Method:')}</span> {calculations.methodDescription}
                {(method === 'statistical' || method === 'service-level') && (
                  <span className="ml-4">
                    <span className="font-medium">{t('tools.safetyStockCalculator.zScore', 'Z-score:')}</span> {calculations.zScore.toFixed(2)} for {calculations.serviceLevel}% service level
                  </span>
                )}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.safetyStockCalculator.safetyStockValue', 'Safety Stock Value')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${calculations.safetyStockValue.toLocaleString()}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.safetyStockCalculator.annualHoldingCost', 'Annual Holding Cost')}</div>
                <div className="text-xl font-bold text-red-500">
                  ${calculations.annualHoldingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${calculations.netBenefit >= 0 ? (isDark ? 'bg-green-500/10' : 'bg-green-50') : (isDark ? 'bg-red-500/10' : 'bg-red-50')}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.safetyStockCalculator.netBenefitVsNoSafety', 'Net Benefit vs No Safety Stock')}</div>
                <div className={`text-xl font-bold ${calculations.netBenefit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${calculations.netBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
              <p><strong>{t('tools.safetyStockCalculator.basic', 'Basic:')}</strong> (Max Usage x Max LT) - (Avg Usage x Avg LT)</p>
              <p><strong>{t('tools.safetyStockCalculator.statistical', 'Statistical:')}</strong> Z x sqrt(LT x sigma-D^2 + D^2 x sigma-LT^2)</p>
              <p><strong>{t('tools.safetyStockCalculator.reorderPoint2', 'Reorder Point:')}</strong> (Avg Usage x Avg Lead Time) + Safety Stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyStockCalculatorTool;
