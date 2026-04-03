'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Calculator, Copy, Check, Info, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface InventoryTurnoverToolProps {
  uiConfig?: any;
}

export const InventoryTurnoverTool: React.FC<InventoryTurnoverToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'cogs' | 'sales'>('cogs');

  // Cost of Goods Sold Method
  const [cogs, setCogs] = useState('500000');
  const [beginningInventory, setBeginningInventory] = useState('60000');
  const [endingInventory, setEndingInventory] = useState('40000');

  // Sales Method (alternative)
  const [annualSales, setAnnualSales] = useState('750000');
  const [averageInventory, setAverageInventory] = useState('50000');

  // Industry benchmark
  const [industryBenchmark, setIndustryBenchmark] = useState('8');

  const [copied, setCopied] = useState(false);

  const calculations = useMemo(() => {
    let turnoverRatio: number;
    let avgInventory: number;
    let costOrSales: number;

    if (mode === 'cogs') {
      const cogsValue = parseFloat(cogs) || 0;
      const beginning = parseFloat(beginningInventory) || 0;
      const ending = parseFloat(endingInventory) || 0;

      if (cogsValue <= 0) return null;

      avgInventory = (beginning + ending) / 2;
      if (avgInventory <= 0) return null;

      turnoverRatio = cogsValue / avgInventory;
      costOrSales = cogsValue;
    } else {
      const sales = parseFloat(annualSales) || 0;
      const avgInv = parseFloat(averageInventory) || 0;

      if (sales <= 0 || avgInv <= 0) return null;

      avgInventory = avgInv;
      turnoverRatio = sales / avgInv;
      costOrSales = sales;
    }

    // Days Sales of Inventory (DSI)
    const daysInInventory = 365 / turnoverRatio;

    // Weekly turnover
    const weeklyTurnover = 52 / turnoverRatio;

    // Monthly turnover
    const monthlyTurnover = 12 / turnoverRatio;

    // Inventory carrying cost (estimated at 20-30% of inventory value annually)
    const carryingCostRate = 0.25; // 25% average
    const annualCarryingCost = avgInventory * carryingCostRate;

    // Benchmark comparison
    const benchmark = parseFloat(industryBenchmark) || 0;
    const benchmarkDiff = benchmark > 0 ? ((turnoverRatio - benchmark) / benchmark) * 100 : null;

    // Classification
    let classification: 'excellent' | 'good' | 'average' | 'poor';
    if (turnoverRatio >= 12) classification = 'excellent';
    else if (turnoverRatio >= 6) classification = 'good';
    else if (turnoverRatio >= 3) classification = 'average';
    else classification = 'poor';

    return {
      turnoverRatio,
      avgInventory,
      costOrSales,
      daysInInventory,
      weeklyTurnover,
      monthlyTurnover,
      annualCarryingCost,
      benchmarkDiff,
      classification,
      turnsPerMonth: turnoverRatio / 12,
      turnsPerWeek: turnoverRatio / 52,
    };
  }, [mode, cogs, beginningInventory, endingInventory, annualSales, averageInventory, industryBenchmark]);

  const handleCopy = () => {
    if (!calculations) return;
    const text = `Inventory Turnover Analysis

Method: ${mode === 'cogs' ? 'Cost of Goods Sold' : 'Sales'}
${mode === 'cogs' ? `COGS: $${cogs}` : `Annual Sales: $${annualSales}`}
Average Inventory: $${calculations.avgInventory.toLocaleString()}

Results:
- Inventory Turnover Ratio: ${calculations.turnoverRatio.toFixed(2)}x
- Days in Inventory: ${calculations.daysInInventory.toFixed(1)} days
- Weeks in Inventory: ${calculations.weeklyTurnover.toFixed(1)} weeks
- Monthly Turnover: ${calculations.turnsPerMonth.toFixed(2)}x

Estimated Annual Carrying Cost: $${calculations.annualCarryingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
Classification: ${calculations.classification.toUpperCase()}
${calculations.benchmarkDiff !== null ? `vs Industry Benchmark: ${calculations.benchmarkDiff > 0 ? '+' : ''}${calculations.benchmarkDiff.toFixed(1)}%` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-teal-500';
      case 'average': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getClassificationBg = (classification: string) => {
    switch (classification) {
      case 'excellent': return isDark ? 'bg-green-500/10' : 'bg-green-50';
      case 'good': return isDark ? 'bg-teal-500/10' : 'bg-teal-50';
      case 'average': return isDark ? 'bg-yellow-500/10' : 'bg-yellow-50';
      case 'poor': return isDark ? 'bg-red-500/10' : 'bg-red-50';
      default: return isDark ? 'bg-gray-800' : 'bg-gray-50';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <RefreshCw className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.inventoryTurnover.inventoryTurnoverCalculator', 'Inventory Turnover Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.inventoryTurnover.calculateHowEfficientlyInventoryMoves', 'Calculate how efficiently inventory moves')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('cogs')}
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              mode === 'cogs'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.inventoryTurnover.cogsMethod', 'COGS Method')}
          </button>
          <button
            onClick={() => setMode('sales')}
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              mode === 'sales'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.inventoryTurnover.salesMethod', 'Sales Method')}
          </button>
        </div>

        {mode === 'cogs' ? (
          /* COGS Method Inputs */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.inventoryTurnover.costOfGoodsSoldAnnual', 'Cost of Goods Sold (Annual) ($)')}
              </label>
              <input
                type="number"
                value={cogs}
                onChange={(e) => setCogs(e.target.value)}
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.inventoryTurnover.beginningInventory', 'Beginning Inventory ($)')}
                </label>
                <input
                  type="number"
                  value={beginningInventory}
                  onChange={(e) => setBeginningInventory(e.target.value)}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.inventoryTurnover.endingInventory', 'Ending Inventory ($)')}
                </label>
                <input
                  type="number"
                  value={endingInventory}
                  onChange={(e) => setEndingInventory(e.target.value)}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Sales Method Inputs */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.inventoryTurnover.annualSales', 'Annual Sales ($)')}
              </label>
              <input
                type="number"
                value={annualSales}
                onChange={(e) => setAnnualSales(e.target.value)}
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.inventoryTurnover.averageInventory', 'Average Inventory ($)')}
              </label>
              <input
                type="number"
                value={averageInventory}
                onChange={(e) => setAverageInventory(e.target.value)}
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          </div>
        )}

        {/* Industry Benchmark */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.inventoryTurnover.industryBenchmarkTurnsYearOptional', 'Industry Benchmark (turns/year) - Optional')}
          </label>
          <input
            type="number"
            value={industryBenchmark}
            onChange={(e) => setIndustryBenchmark(e.target.value)}
            min="0"
            step="0.1"
            placeholder={t('tools.inventoryTurnover.eG8ForRetail', 'e.g., 8 for retail')}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
          />
        </div>

        {/* Results */}
        {calculations && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {t('tools.inventoryTurnover.turnoverAnalysis', 'Turnover Analysis')}
                </h4>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.inventoryTurnover.copied', 'Copied!') : t('tools.inventoryTurnover.copy', 'Copy')}
              </button>
            </div>

            {/* Main Turnover Display */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center mb-6`}>
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.inventoryTurnover.inventoryTurnoverRatio', 'Inventory Turnover Ratio')}</div>
              <div className="text-4xl font-bold text-teal-500">
                {calculations.turnoverRatio.toFixed(2)}x
              </div>
              <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.inventoryTurnover.perYear', 'per year')}
              </div>
              <div className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${getClassificationBg(calculations.classification)} ${getClassificationColor(calculations.classification)}`}>
                {calculations.classification.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.inventoryTurnover.daysInInventory', 'Days in Inventory')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.daysInInventory.toFixed(1)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>days</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.inventoryTurnover.weeksInInventory', 'Weeks in Inventory')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.weeklyTurnover.toFixed(1)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>weeks</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-purple-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.inventoryTurnover.monthlyTurns', 'Monthly Turns')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.turnsPerMonth.toFixed(2)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.inventoryTurnover.timesMonth', 'times/month')}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-teal-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.inventoryTurnover.avgInventory', 'Avg Inventory')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${(calculations.avgInventory / 1000).toFixed(0)}K
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.inventoryTurnover.estAnnualCarryingCost', 'Est. Annual Carrying Cost')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${calculations.annualCarryingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.inventoryTurnover.at25HoldingCostRate', 'at 25% holding cost rate')}</div>
              </div>

              {calculations.benchmarkDiff !== null && (
                <div className={`p-4 rounded-lg ${calculations.benchmarkDiff >= 0 ? (isDark ? 'bg-green-500/10' : 'bg-green-50') : (isDark ? 'bg-red-500/10' : 'bg-red-50')}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className={`w-4 h-4 ${calculations.benchmarkDiff >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.inventoryTurnover.vsIndustryBenchmark', 'vs Industry Benchmark')}</span>
                  </div>
                  <div className={`text-xl font-bold ${calculations.benchmarkDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {calculations.benchmarkDiff > 0 ? '+' : ''}{calculations.benchmarkDiff.toFixed(1)}%
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {calculations.benchmarkDiff >= 0 ? t('tools.inventoryTurnover.above', 'Above') : t('tools.inventoryTurnover.below', 'Below')} benchmark of {industryBenchmark}x
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Industry Benchmarks Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.inventoryTurnover.industryBenchmarksTypical', 'Industry Benchmarks (Typical)')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.inventoryTurnover.grocery', 'Grocery')}</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>14-20x</div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.inventoryTurnover.retail', 'Retail')}</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>6-12x</div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.inventoryTurnover.manufacturing', 'Manufacturing')}</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>4-8x</div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.inventoryTurnover.heavyEquipment', 'Heavy Equipment')}</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>2-4x</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
              <p><strong>{t('tools.inventoryTurnover.turnoverRatio', 'Turnover Ratio')}</strong> = COGS / Average Inventory</p>
              <p><strong>{t('tools.inventoryTurnover.daysInInventory2', 'Days in Inventory')}</strong> = 365 / Turnover Ratio</p>
              <p><strong>{t('tools.inventoryTurnover.higherTurnover', 'Higher turnover')}</strong> = More efficient use of inventory capital</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTurnoverTool;
