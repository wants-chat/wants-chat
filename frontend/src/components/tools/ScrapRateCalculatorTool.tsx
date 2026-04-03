'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Calculator, Copy, Check, Info, TrendingDown, DollarSign, AlertTriangle, Package } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ScrapRateCalculatorToolProps {
  uiConfig?: any;
}

export const ScrapRateCalculatorTool: React.FC<ScrapRateCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'basic' | 'detailed'>('basic');

  // Basic mode
  const [totalUnits, setTotalUnits] = useState('1000');
  const [defectiveUnits, setDefectiveUnits] = useState('25');

  // Detailed mode - defect categories
  const [materialDefects, setMaterialDefects] = useState('10');
  const [processDefects, setProcessDefects] = useState('8');
  const [handlingDefects, setHandlingDefects] = useState('5');
  const [otherDefects, setOtherDefects] = useState('2');

  // Cost analysis
  const [costPerUnit, setCostPerUnit] = useState('15');
  const [laborCostPerUnit, setLaborCostPerUnit] = useState('5');
  const [targetScrapRate, setTargetScrapRate] = useState('2');

  const [copied, setCopied] = useState(false);

  const calculations = useMemo(() => {
    const total = parseFloat(totalUnits) || 0;
    const unitCost = parseFloat(costPerUnit) || 0;
    const laborCost = parseFloat(laborCostPerUnit) || 0;
    const target = parseFloat(targetScrapRate) || 0;

    if (total <= 0) return null;

    let defective: number;
    let defectBreakdown: { material: number; process: number; handling: number; other: number } | null = null;

    if (mode === 'basic') {
      defective = parseFloat(defectiveUnits) || 0;
    } else {
      const material = parseFloat(materialDefects) || 0;
      const process = parseFloat(processDefects) || 0;
      const handling = parseFloat(handlingDefects) || 0;
      const other = parseFloat(otherDefects) || 0;
      defective = material + process + handling + other;
      defectBreakdown = { material, process, handling, other };
    }

    const goodUnits = total - defective;
    const scrapRate = (defective / total) * 100;
    const yieldRate = (goodUnits / total) * 100;

    // Cost calculations
    const totalScrapCost = defective * (unitCost + laborCost);
    const materialScrapCost = defective * unitCost;
    const laborScrapCost = defective * laborCost;

    // If we hit target
    const targetDefects = total * (target / 100);
    const potentialSavings = (defective - targetDefects) * (unitCost + laborCost);

    // Per million calculations (PPM)
    const ppm = (defective / total) * 1000000;

    // Sigma level approximation (simplified)
    let sigmaLevel = 0;
    if (yieldRate >= 99.99966) sigmaLevel = 6;
    else if (yieldRate >= 99.9937) sigmaLevel = 5;
    else if (yieldRate >= 99.379) sigmaLevel = 4;
    else if (yieldRate >= 93.32) sigmaLevel = 3;
    else if (yieldRate >= 69.15) sigmaLevel = 2;
    else if (yieldRate >= 30.85) sigmaLevel = 1;

    return {
      total,
      defective,
      goodUnits,
      scrapRate,
      yieldRate,
      totalScrapCost,
      materialScrapCost,
      laborScrapCost,
      targetDefects,
      potentialSavings: Math.max(0, potentialSavings),
      ppm,
      sigmaLevel,
      defectBreakdown,
      isAboveTarget: scrapRate > target,
    };
  }, [mode, totalUnits, defectiveUnits, materialDefects, processDefects, handlingDefects, otherDefects, costPerUnit, laborCostPerUnit, targetScrapRate]);

  const handleCopy = () => {
    if (!calculations) return;
    let text = `Scrap Rate Analysis

Total Units Produced: ${calculations.total}
Defective Units: ${calculations.defective}
Good Units: ${calculations.goodUnits}

Scrap Rate: ${calculations.scrapRate.toFixed(2)}%
Yield Rate: ${calculations.yieldRate.toFixed(2)}%
PPM (Parts Per Million): ${calculations.ppm.toFixed(0)}
Sigma Level: ${calculations.sigmaLevel}

Cost Analysis:
Total Scrap Cost: $${calculations.totalScrapCost.toFixed(2)}
- Material Cost: $${calculations.materialScrapCost.toFixed(2)}
- Labor Cost: $${calculations.laborScrapCost.toFixed(2)}

Target Scrap Rate: ${targetScrapRate}%
Potential Savings: $${calculations.potentialSavings.toFixed(2)}`;

    if (calculations.defectBreakdown) {
      text += `

Defect Breakdown:
- Material: ${calculations.defectBreakdown.material} units
- Process: ${calculations.defectBreakdown.process} units
- Handling: ${calculations.defectBreakdown.handling} units
- Other: ${calculations.defectBreakdown.other} units`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScrapColor = (rate: number) => {
    if (rate <= 1) return 'text-green-500';
    if (rate <= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScrapBg = (rate: number) => {
    if (rate <= 1) return isDark ? 'bg-green-500/10' : 'bg-green-50';
    if (rate <= 3) return isDark ? 'bg-yellow-500/10' : 'bg-yellow-50';
    return isDark ? 'bg-red-500/10' : 'bg-red-50';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Trash2 className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.scrapRateCalculator.scrapRateCalculator', 'Scrap Rate Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.calculateDefectRatesYieldAnd', 'Calculate defect rates, yield, and scrap costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('basic')}
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              mode === 'basic'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.scrapRateCalculator.basicCalculation', 'Basic Calculation')}
          </button>
          <button
            onClick={() => setMode('detailed')}
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              mode === 'detailed'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.scrapRateCalculator.detailedAnalysis', 'Detailed Analysis')}
          </button>
        </div>

        {/* Production Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.scrapRateCalculator.totalUnitsProduced', 'Total Units Produced')}
            </label>
            <input
              type="number"
              value={totalUnits}
              onChange={(e) => setTotalUnits(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>

          {mode === 'basic' ? (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.scrapRateCalculator.defectiveUnits', 'Defective Units')}
              </label>
              <input
                type="number"
                value={defectiveUnits}
                onChange={(e) => setDefectiveUnits(e.target.value)}
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.scrapRateCalculator.targetScrapRate', 'Target Scrap Rate (%)')}
              </label>
              <input
                type="number"
                value={targetScrapRate}
                onChange={(e) => setTargetScrapRate(e.target.value)}
                min="0"
                step="0.1"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          )}
        </div>

        {/* Detailed Mode - Defect Categories */}
        {mode === 'detailed' && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              {t('tools.scrapRateCalculator.defectCategoriesUnits', 'Defect Categories (units)')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.scrapRateCalculator.material', 'Material')}
                </label>
                <input
                  type="number"
                  value={materialDefects}
                  onChange={(e) => setMaterialDefects(e.target.value)}
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.scrapRateCalculator.process', 'Process')}
                </label>
                <input
                  type="number"
                  value={processDefects}
                  onChange={(e) => setProcessDefects(e.target.value)}
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.scrapRateCalculator.handling', 'Handling')}
                </label>
                <input
                  type="number"
                  value={handlingDefects}
                  onChange={(e) => setHandlingDefects(e.target.value)}
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.scrapRateCalculator.other', 'Other')}
                </label>
                <input
                  type="number"
                  value={otherDefects}
                  onChange={(e) => setOtherDefects(e.target.value)}
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Cost Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 text-green-500" />
            {t('tools.scrapRateCalculator.costAnalysis', 'Cost Analysis')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.scrapRateCalculator.materialCostUnit', 'Material Cost/Unit ($)')}
              </label>
              <input
                type="number"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.scrapRateCalculator.laborCostUnit', 'Labor Cost/Unit ($)')}
              </label>
              <input
                type="number"
                value={laborCostPerUnit}
                onChange={(e) => setLaborCostPerUnit(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.scrapRateCalculator.targetScrapRate2', 'Target Scrap Rate (%)')}
              </label>
              <input
                type="number"
                value={targetScrapRate}
                onChange={(e) => setTargetScrapRate(e.target.value)}
                min="0"
                step="0.1"
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
                <TrendingDown className="w-5 h-5 text-teal-500" />
                <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {t('tools.scrapRateCalculator.scrapAnalysisResults', 'Scrap Analysis Results')}
                </h4>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.scrapRateCalculator.copied', 'Copied!') : t('tools.scrapRateCalculator.copy', 'Copy')}
              </button>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${getScrapBg(calculations.scrapRate)}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.scrapRate', 'Scrap Rate')}</div>
                <div className={`text-2xl font-bold ${getScrapColor(calculations.scrapRate)}`}>
                  {calculations.scrapRate.toFixed(2)}%
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.yieldRate', 'Yield Rate')}</div>
                <div className="text-2xl font-bold text-green-500">
                  {calculations.yieldRate.toFixed(2)}%
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.ppm', 'PPM')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.ppm.toFixed(0)}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.sigmaLevel', 'Sigma Level')}</div>
                <div className={`text-2xl font-bold ${calculations.sigmaLevel >= 4 ? 'text-green-500' : calculations.sigmaLevel >= 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {calculations.sigmaLevel}σ
                </div>
              </div>
            </div>

            {/* Units Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.totalUnits', 'Total Units')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.total.toLocaleString()}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.goodUnits', 'Good Units')}</span>
                </div>
                <div className="text-xl font-bold text-green-500">
                  {calculations.goodUnits.toLocaleString()}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.defective', 'Defective')}</span>
                </div>
                <div className="text-xl font-bold text-red-500">
                  {calculations.defective.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Defect Breakdown */}
            {calculations.defectBreakdown && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} mb-6`}>
                <div className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.scrapRateCalculator.defectBreakdown', 'Defect Breakdown')}</div>
                <div className="flex h-6 rounded-lg overflow-hidden mb-3">
                  <div
                    className="bg-red-500"
                    style={{ width: `${(calculations.defectBreakdown.material / calculations.defective) * 100}%` }}
                  />
                  <div
                    className="bg-orange-500"
                    style={{ width: `${(calculations.defectBreakdown.process / calculations.defective) * 100}%` }}
                  />
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${(calculations.defectBreakdown.handling / calculations.defective) * 100}%` }}
                  />
                  <div
                    className="bg-gray-500"
                    style={{ width: `${(calculations.defectBreakdown.other / calculations.defective) * 100}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> Material ({calculations.defectBreakdown.material})</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded" /> Process ({calculations.defectBreakdown.process})</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded" /> Handling ({calculations.defectBreakdown.handling})</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-500 rounded" /> Other ({calculations.defectBreakdown.other})</span>
                </div>
              </div>
            )}

            {/* Cost Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.totalScrapCost', 'Total Scrap Cost')}</span>
                </div>
                <div className="text-xl font-bold text-red-500">
                  ${calculations.totalScrapCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`w-4 h-4 ${calculations.isAboveTarget ? 'text-red-500' : 'text-green-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>vs Target ({targetScrapRate}%)</span>
                </div>
                <div className={`text-xl font-bold ${calculations.isAboveTarget ? 'text-red-500' : 'text-green-500'}`}>
                  {calculations.isAboveTarget ? t('tools.scrapRateCalculator.above', 'Above') : t('tools.scrapRateCalculator.below', 'Below')} Target
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.scrapRateCalculator.potentialSavings', 'Potential Savings')}</span>
                </div>
                <div className="text-xl font-bold text-green-500">
                  ${calculations.potentialSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              <p><strong>{t('tools.scrapRateCalculator.scrapRate2', 'Scrap Rate')}</strong> = (Defective Units / Total Units) x 100</p>
              <p><strong>{t('tools.scrapRateCalculator.yieldRate2', 'Yield Rate')}</strong> = (Good Units / Total Units) x 100</p>
              <p><strong>{t('tools.scrapRateCalculator.worldClass', 'World-class:')}</strong> {t('tools.scrapRateCalculator.lessThan1ScrapRate', 'Less than 1% scrap rate (4+ Sigma)')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapRateCalculatorTool;
