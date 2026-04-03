'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Calculator, Copy, Check, Info, TrendingUp, DollarSign, Package, Calendar, Truck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface EOQCalculatorToolProps {
  uiConfig?: any;
}

type DemandPeriod = 'daily' | 'weekly' | 'monthly' | 'annual';

export const EOQCalculatorTool: React.FC<EOQCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Demand inputs
  const [demandValue, setDemandValue] = useState('12000');
  const [demandPeriod, setDemandPeriod] = useState<DemandPeriod>('annual');

  // Cost inputs
  const [orderingCost, setOrderingCost] = useState('50'); // Cost per order
  const [unitCost, setUnitCost] = useState('25'); // Cost per unit
  const [holdingCostPercent, setHoldingCostPercent] = useState('25'); // Annual holding cost as % of unit cost
  const [holdingCostDirect, setHoldingCostDirect] = useState(''); // Or direct holding cost per unit
  const [usePercentageHolding, setUsePercentageHolding] = useState(true);

  // Lead time for additional calculations
  const [leadTimeDays, setLeadTimeDays] = useState('7');
  const [safetyStock, setSafetyStock] = useState('200');

  const [copied, setCopied] = useState(false);

  const calculations = useMemo(() => {
    const demand = parseFloat(demandValue) || 0;
    const S = parseFloat(orderingCost) || 0; // Ordering/setup cost
    const C = parseFloat(unitCost) || 0; // Unit cost
    const holdingPct = parseFloat(holdingCostPercent) || 0;
    const holdingDirect = parseFloat(holdingCostDirect) || 0;
    const lt = parseFloat(leadTimeDays) || 0;
    const ss = parseFloat(safetyStock) || 0;

    if (demand <= 0 || S <= 0) return null;

    // Convert demand to annual
    let D: number; // Annual demand
    switch (demandPeriod) {
      case 'daily':
        D = demand * 365;
        break;
      case 'weekly':
        D = demand * 52;
        break;
      case 'monthly':
        D = demand * 12;
        break;
      default:
        D = demand;
    }

    // Calculate holding cost per unit per year
    const H = usePercentageHolding ? C * (holdingPct / 100) : holdingDirect;

    if (H <= 0) return null;

    // EOQ Formula: sqrt(2DS / H)
    const EOQ = Math.sqrt((2 * D * S) / H);
    const roundedEOQ = Math.ceil(EOQ);

    // Number of orders per year
    const ordersPerYear = D / roundedEOQ;

    // Time between orders (in days)
    const orderCycleDays = 365 / ordersPerYear;

    // Average inventory (without safety stock)
    const averageInventory = roundedEOQ / 2;

    // Average inventory with safety stock
    const averageInventoryWithSS = averageInventory + ss;

    // Total costs at EOQ
    const annualOrderingCost = (D / roundedEOQ) * S;
    const annualHoldingCost = (roundedEOQ / 2) * H;
    const safetyStockHoldingCost = ss * H;
    const totalInventoryCost = annualOrderingCost + annualHoldingCost + safetyStockHoldingCost;

    // Purchase cost
    const annualPurchaseCost = D * C;

    // Total annual cost
    const totalAnnualCost = totalInventoryCost + annualPurchaseCost;

    // Reorder point
    const dailyDemand = D / 365;
    const reorderPoint = Math.ceil(dailyDemand * lt + ss);

    // Maximum inventory level
    const maxInventory = roundedEOQ + ss;

    // Turnover rate
    const turnoverRate = D / averageInventoryWithSS;

    // Days of supply per order
    const daysOfSupply = roundedEOQ / dailyDemand;

    // Sensitivity analysis - what if we order different quantities
    const sensitivityAnalysis = [0.5, 0.75, 1, 1.25, 1.5].map((multiplier) => {
      const qty = Math.ceil(roundedEOQ * multiplier);
      const orderCost = (D / qty) * S;
      const holdCost = (qty / 2) * H;
      const total = orderCost + holdCost;
      const percentIncrease = ((total - (annualOrderingCost + annualHoldingCost)) / (annualOrderingCost + annualHoldingCost)) * 100;
      return {
        multiplier,
        quantity: qty,
        orderingCost: orderCost,
        holdingCost: holdCost,
        totalCost: total,
        percentIncrease,
      };
    });

    return {
      EOQ: roundedEOQ,
      exactEOQ: EOQ,
      ordersPerYear,
      orderCycleDays,
      averageInventory,
      averageInventoryWithSS,
      annualOrderingCost,
      annualHoldingCost,
      safetyStockHoldingCost,
      totalInventoryCost,
      annualPurchaseCost,
      totalAnnualCost,
      reorderPoint,
      maxInventory,
      turnoverRate,
      daysOfSupply,
      dailyDemand,
      annualDemand: D,
      holdingCostPerUnit: H,
      sensitivityAnalysis,
    };
  }, [demandValue, demandPeriod, orderingCost, unitCost, holdingCostPercent, holdingCostDirect, usePercentageHolding, leadTimeDays, safetyStock]);

  const handleCopy = () => {
    if (!calculations) return;
    const text = `Economic Order Quantity (EOQ) Analysis

Demand: ${calculations.annualDemand.toLocaleString()} units/year
Ordering Cost: $${orderingCost} per order
Unit Cost: $${unitCost}
Holding Cost: $${calculations.holdingCostPerUnit.toFixed(2)} per unit/year

EOQ Results:
- Economic Order Quantity: ${calculations.EOQ.toLocaleString()} units
- Orders Per Year: ${calculations.ordersPerYear.toFixed(1)}
- Order Cycle: ${calculations.orderCycleDays.toFixed(1)} days
- Days of Supply per Order: ${calculations.daysOfSupply.toFixed(1)} days

Inventory Levels:
- Average Inventory: ${calculations.averageInventoryWithSS.toLocaleString()} units
- Maximum Inventory: ${calculations.maxInventory.toLocaleString()} units
- Reorder Point: ${calculations.reorderPoint.toLocaleString()} units

Annual Costs:
- Ordering Cost: $${calculations.annualOrderingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
- Holding Cost: $${calculations.annualHoldingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
- Total Inventory Cost: $${calculations.totalInventoryCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const demandPeriods: { value: DemandPeriod; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Box className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eOQCalculator.eoqCalculator', 'EOQ Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eOQCalculator.economicOrderQuantityOptimizer', 'Economic Order Quantity optimizer')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Demand Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.eOQCalculator.productDemand', 'Product Demand')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={demandValue}
              onChange={(e) => setDemandValue(e.target.value)}
              min="0"
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              placeholder={t('tools.eOQCalculator.enterDemand', 'Enter demand')}
            />
            <select
              value={demandPeriod}
              onChange={(e) => setDemandPeriod(e.target.value as DemandPeriod)}
              className={`px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {demandPeriods.map((period) => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cost Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 text-green-500" />
            {t('tools.eOQCalculator.costParameters', 'Cost Parameters')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.eOQCalculator.orderingCostOrder', 'Ordering Cost ($/order)')}
              </label>
              <input
                type="number"
                value={orderingCost}
                onChange={(e) => setOrderingCost(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.eOQCalculator.unitCost', 'Unit Cost ($)')}
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
              <div className="flex items-center justify-between">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.eOQCalculator.holdingCost3', 'Holding Cost')}
                </label>
                <button
                  onClick={() => setUsePercentageHolding(!usePercentageHolding)}
                  className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                >
                  {usePercentageHolding ? t('tools.eOQCalculator.ofCost', '% of cost') : t('tools.eOQCalculator.perUnit', 'per unit')}
                </button>
              </div>
              {usePercentageHolding ? (
                <input
                  type="number"
                  value={holdingCostPercent}
                  onChange={(e) => setHoldingCostPercent(e.target.value)}
                  min="0"
                  max="100"
                  placeholder={t('tools.eOQCalculator.perYear', '% per year')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              ) : (
                <input
                  type="number"
                  value={holdingCostDirect}
                  onChange={(e) => setHoldingCostDirect(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder={t('tools.eOQCalculator.unitYear', '$/unit/year')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Additional Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.eOQCalculator.leadTimeDays', 'Lead Time (days)')}
            </label>
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.eOQCalculator.safetyStockUnits', 'Safety Stock (units)')}
            </label>
            <input
              type="number"
              value={safetyStock}
              onChange={(e) => setSafetyStock(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>
        </div>

        {/* Results */}
        {calculations && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {t('tools.eOQCalculator.eoqResults', 'EOQ Results')}
                </h4>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.eOQCalculator.copied', 'Copied!') : t('tools.eOQCalculator.copy', 'Copy')}
              </button>
            </div>

            {/* Main EOQ Display */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center mb-6`}>
              <div className="flex justify-center mb-2">
                <Box className="w-10 h-10 text-teal-500" />
              </div>
              <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eOQCalculator.economicOrderQuantity', 'Economic Order Quantity')}</div>
              <div className="text-4xl font-bold text-teal-500">
                {calculations.EOQ.toLocaleString()}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eOQCalculator.unitsPerOrder', 'units per order')}</div>
            </div>

            {/* Order Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eOQCalculator.ordersYear', 'Orders/Year')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.ordersPerYear.toFixed(1)}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eOQCalculator.orderCycle', 'Order Cycle')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.orderCycleDays.toFixed(0)} days
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-orange-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eOQCalculator.reorderPoint', 'Reorder Point')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.reorderPoint.toLocaleString()}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.eOQCalculator.turnoverRate', 'Turnover Rate')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.turnoverRate.toFixed(1)}x
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} mb-6`}>
              <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eOQCalculator.annualCostAnalysis', 'Annual Cost Analysis')}</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Ordering Cost ({calculations.ordersPerYear.toFixed(1)} orders x ${orderingCost}):</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${calculations.annualOrderingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Holding Cost ({calculations.averageInventory.toFixed(0)} avg units):</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${calculations.annualHoldingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.eOQCalculator.safetyStockHolding', 'Safety Stock Holding:')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${calculations.safetyStockHoldingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className={`pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eOQCalculator.totalInventoryCost', 'Total Inventory Cost:')}</span>
                    <span className="font-bold text-teal-500">
                      ${calculations.totalInventoryCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sensitivity Analysis */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.eOQCalculator.orderQuantitySensitivity', 'Order Quantity Sensitivity')}</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      <th className="text-left py-2">{t('tools.eOQCalculator.quantity', 'Quantity')}</th>
                      <th className="text-right py-2">{t('tools.eOQCalculator.orderCost', 'Order Cost')}</th>
                      <th className="text-right py-2">{t('tools.eOQCalculator.holdingCost', 'Holding Cost')}</th>
                      <th className="text-right py-2">{t('tools.eOQCalculator.total', 'Total')}</th>
                      <th className="text-right py-2">{t('tools.eOQCalculator.vsEoq', 'vs EOQ')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {calculations.sensitivityAnalysis.map((row) => (
                      <tr
                        key={row.multiplier}
                        className={row.multiplier === 1 ? (isDark ? 'bg-teal-500/10' : 'bg-teal-50') : ''}
                      >
                        <td className={`py-2 ${row.multiplier === 1 ? 'font-bold text-teal-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                          {row.quantity.toLocaleString()}
                          {row.multiplier === 1 && ' (EOQ)'}
                        </td>
                        <td className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          ${row.orderingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          ${row.holdingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className={`text-right py-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${row.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className={`text-right py-2 ${row.percentIncrease > 0 ? 'text-red-500' : row.percentIncrease < 0 ? 'text-green-500' : 'text-teal-500'}`}>
                          {row.percentIncrease > 0 ? '+' : ''}{row.percentIncrease.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
              <p><strong>{t('tools.eOQCalculator.eoqFormula', 'EOQ Formula:')}</strong> {t('tools.eOQCalculator.sqrt2XDemandX', 'sqrt(2 x Demand x Ordering Cost / Holding Cost)')}</p>
              <p><strong>{t('tools.eOQCalculator.atEoq', 'At EOQ:')}</strong> {t('tools.eOQCalculator.annualOrderingCostEqualsAnnual', 'Annual ordering cost equals annual holding cost')}</p>
              <p><strong>{t('tools.eOQCalculator.holdingCost2', 'Holding Cost:')}</strong> {t('tools.eOQCalculator.typically2030OfItem', 'Typically 20-30% of item value per year (storage, insurance, obsolescence)')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EOQCalculatorTool;
