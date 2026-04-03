'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Calculator, Copy, Check, Info, TrendingUp, Package, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ReorderPointCalculatorToolProps {
  uiConfig?: any;
}

type DemandUnit = 'daily' | 'weekly' | 'monthly';

export const ReorderPointCalculatorTool: React.FC<ReorderPointCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Demand inputs
  const [demandValue, setDemandValue] = useState('700');
  const [demandUnit, setDemandUnit] = useState<DemandUnit>('weekly');
  const [demandVariability, setDemandVariability] = useState('10'); // percentage

  // Lead time inputs
  const [leadTimeDays, setLeadTimeDays] = useState('14');
  const [leadTimeVariability, setLeadTimeVariability] = useState('3'); // days

  // Safety stock inputs
  const [safetyStock, setSafetyStock] = useState('200');
  const [autoCalculateSS, setAutoCalculateSS] = useState(true);
  const [serviceLevel, setServiceLevel] = useState('95');

  // Current inventory
  const [currentInventory, setCurrentInventory] = useState('1500');
  const [onOrder, setOnOrder] = useState('0');

  const [copied, setCopied] = useState(false);

  // Z-scores for service levels
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
    return 0.67;
  };

  const calculations = useMemo(() => {
    const demand = parseFloat(demandValue) || 0;
    const leadTime = parseFloat(leadTimeDays) || 0;
    const demandVar = parseFloat(demandVariability) || 0;
    const ltVar = parseFloat(leadTimeVariability) || 0;
    const sl = parseFloat(serviceLevel) || 95;
    const current = parseFloat(currentInventory) || 0;
    const ordered = parseFloat(onOrder) || 0;

    if (demand <= 0 || leadTime <= 0) return null;

    // Convert demand to daily
    let dailyDemand: number;
    switch (demandUnit) {
      case 'weekly':
        dailyDemand = demand / 7;
        break;
      case 'monthly':
        dailyDemand = demand / 30;
        break;
      default:
        dailyDemand = demand;
    }

    // Calculate demand during lead time
    const demandDuringLeadTime = dailyDemand * leadTime;

    // Calculate safety stock if auto-calculate is enabled
    let ss: number;
    if (autoCalculateSS) {
      const zScore = getZScore(sl);
      // Simplified safety stock calculation
      const demandStdDev = dailyDemand * (demandVar / 100);
      ss = Math.ceil(zScore * Math.sqrt(leadTime * Math.pow(demandStdDev, 2) + Math.pow(dailyDemand, 2) * Math.pow(ltVar, 2)));
    } else {
      ss = parseFloat(safetyStock) || 0;
    }

    // Reorder point = Demand during lead time + Safety stock
    const reorderPoint = Math.ceil(demandDuringLeadTime + ss);

    // Available inventory = Current + On Order
    const availableInventory = current + ordered;

    // Days of supply remaining
    const daysOfSupply = dailyDemand > 0 ? availableInventory / dailyDemand : 0;

    // Days until reorder needed (if positive, have buffer; if negative, should have ordered already)
    const daysUntilReorder = dailyDemand > 0 ? (availableInventory - reorderPoint) / dailyDemand : 0;

    // Status
    let status: 'critical' | 'warning' | 'ok' | 'excess';
    let statusMessage: string;
    if (availableInventory <= ss) {
      status = 'critical';
      statusMessage = 'Below safety stock! Order immediately';
    } else if (availableInventory <= reorderPoint) {
      status = 'warning';
      statusMessage = 'At or below reorder point - Place order now';
    } else if (daysUntilReorder <= 7) {
      status = 'warning';
      statusMessage = `Order needed within ${Math.ceil(daysUntilReorder)} days`;
    } else if (daysOfSupply > leadTime * 3) {
      status = 'excess';
      statusMessage = 'Excess inventory - May be overstocked';
    } else {
      status = 'ok';
      statusMessage = 'Inventory levels healthy';
    }

    // Coverage breakdown
    const safetyStockCoverage = ss / dailyDemand;
    const leadTimeCoverage = demandDuringLeadTime / dailyDemand;
    const totalCoverage = reorderPoint / dailyDemand;

    return {
      dailyDemand,
      demandDuringLeadTime,
      safetyStock: ss,
      reorderPoint,
      availableInventory,
      daysOfSupply,
      daysUntilReorder,
      status,
      statusMessage,
      safetyStockCoverage,
      leadTimeCoverage,
      totalCoverage,
      shouldReorder: availableInventory <= reorderPoint,
      weeklyDemand: dailyDemand * 7,
      monthlyDemand: dailyDemand * 30,
    };
  }, [demandValue, demandUnit, demandVariability, leadTimeDays, leadTimeVariability, safetyStock, autoCalculateSS, serviceLevel, currentInventory, onOrder]);

  const handleCopy = () => {
    if (!calculations) return;
    const text = `Reorder Point Analysis

Demand: ${demandValue} units/${demandUnit}
Daily Demand: ${calculations.dailyDemand.toFixed(1)} units
Lead Time: ${leadTimeDays} days

Calculations:
- Demand During Lead Time: ${calculations.demandDuringLeadTime.toFixed(0)} units
- Safety Stock: ${calculations.safetyStock.toLocaleString()} units
- Reorder Point: ${calculations.reorderPoint.toLocaleString()} units

Current Status:
- Available Inventory: ${calculations.availableInventory.toLocaleString()} units
- Days of Supply: ${calculations.daysOfSupply.toFixed(1)} days
- Status: ${calculations.statusMessage}
- Should Reorder: ${calculations.shouldReorder ? 'YES' : 'NO'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'ok': return 'text-green-500';
      case 'excess': return 'text-blue-500';
      default: return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical': return isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200';
      case 'warning': return isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200';
      case 'ok': return isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200';
      case 'excess': return isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200';
      default: return isDark ? 'bg-gray-800' : 'bg-gray-50';
    }
  };

  const demandUnits: { value: DemandUnit; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Bell className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.reorderPointCalculator.reorderPointCalculator', 'Reorder Point Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.reorderPointCalculator.calculateWhenToPlaceNew', 'Calculate when to place new orders')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Demand Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4 text-teal-500" />
            {t('tools.reorderPointCalculator.demandParameters', 'Demand Parameters')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.reorderPointCalculator.averageDemand', 'Average Demand')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={demandValue}
                  onChange={(e) => setDemandValue(e.target.value)}
                  min="0"
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
                <select
                  value={demandUnit}
                  onChange={(e) => setDemandUnit(e.target.value as DemandUnit)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {demandUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.reorderPointCalculator.demandVariability', 'Demand Variability (%)')}
              </label>
              <input
                type="number"
                value={demandVariability}
                onChange={(e) => setDemandVariability(e.target.value)}
                min="0"
                max="100"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.reorderPointCalculator.serviceLevel', 'Service Level (%)')}
              </label>
              <input
                type="number"
                value={serviceLevel}
                onChange={(e) => setServiceLevel(e.target.value)}
                min="50"
                max="99.9"
                step="0.1"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>

        {/* Lead Time Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.reorderPointCalculator.leadTimeDays', 'Lead Time (days)')}
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
              {t('tools.reorderPointCalculator.leadTimeVariabilityDays', 'Lead Time Variability (days)')}
            </label>
            <input
              type="number"
              value={leadTimeVariability}
              onChange={(e) => setLeadTimeVariability(e.target.value)}
              min="0"
              step="0.5"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>
        </div>

        {/* Safety Stock Toggle */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              {t('tools.reorderPointCalculator.safetyStock2', 'Safety Stock')}
            </h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.reorderPointCalculator.autoCalculate', 'Auto-calculate')}</span>
              <input
                type="checkbox"
                checked={autoCalculateSS}
                onChange={(e) => setAutoCalculateSS(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
            </label>
          </div>
          {!autoCalculateSS && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.reorderPointCalculator.manualSafetyStockUnits', 'Manual Safety Stock (units)')}
              </label>
              <input
                type="number"
                value={safetyStock}
                onChange={(e) => setSafetyStock(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          )}
        </div>

        {/* Current Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.reorderPointCalculator.currentInventoryUnits', 'Current Inventory (units)')}
            </label>
            <input
              type="number"
              value={currentInventory}
              onChange={(e) => setCurrentInventory(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.reorderPointCalculator.onOrderUnits', 'On Order (units)')}
            </label>
            <input
              type="number"
              value={onOrder}
              onChange={(e) => setOnOrder(e.target.value)}
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
                  {t('tools.reorderPointCalculator.reorderPointAnalysis', 'Reorder Point Analysis')}
                </h4>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.reorderPointCalculator.copied', 'Copied!') : t('tools.reorderPointCalculator.copy', 'Copy')}
              </button>
            </div>

            {/* Status Alert */}
            <div className={`p-4 rounded-lg border mb-6 ${getStatusBg(calculations.status)}`}>
              <div className="flex items-center gap-3">
                {calculations.status === 'critical' && <AlertTriangle className="w-6 h-6 text-red-500" />}
                {calculations.status === 'warning' && <Bell className="w-6 h-6 text-yellow-500" />}
                {calculations.status === 'ok' && <Package className="w-6 h-6 text-green-500" />}
                {calculations.status === 'excess' && <Package className="w-6 h-6 text-blue-500" />}
                <div>
                  <div className={`font-medium ${getStatusColor(calculations.status)}`}>
                    {calculations.shouldReorder ? t('tools.reorderPointCalculator.orderNow', 'ORDER NOW') : t('tools.reorderPointCalculator.noOrderNeeded', 'No Order Needed')}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {calculations.statusMessage}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.reorderPointCalculator.reorderPoint', 'Reorder Point')}</div>
                <div className="text-2xl font-bold text-teal-500">
                  {calculations.reorderPoint.toLocaleString()}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.reorderPointCalculator.availableInventory', 'Available Inventory')}</div>
                <div className={`text-2xl font-bold ${calculations.shouldReorder ? 'text-red-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                  {calculations.availableInventory.toLocaleString()}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.reorderPointCalculator.daysOfSupply', 'Days of Supply')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.daysOfSupply.toFixed(1)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>days</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.reorderPointCalculator.safetyStock', 'Safety Stock')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.safetyStock.toLocaleString()}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.reorderPointCalculator.reorderPointBreakdown', 'Reorder Point Breakdown')}</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.reorderPointCalculator.demandDuringLeadTime', 'Demand During Lead Time:')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.demandDuringLeadTime.toFixed(0)} units ({calculations.leadTimeCoverage.toFixed(1)} days)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>+ Safety Stock:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.safetyStock.toLocaleString()} units ({calculations.safetyStockCoverage.toFixed(1)} days)
                  </span>
                </div>
                <div className={`pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>= Reorder Point:</span>
                    <span className="font-bold text-teal-500">
                      {calculations.reorderPoint.toLocaleString()} units ({calculations.totalCoverage.toFixed(1)} days)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demand Summary */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.reorderPointCalculator.daily', 'Daily')}</div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.dailyDemand.toFixed(0)}</div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.reorderPointCalculator.weekly', 'Weekly')}</div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.weeklyDemand.toFixed(0)}</div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.reorderPointCalculator.monthly', 'Monthly')}</div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.monthlyDemand.toFixed(0)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
              <p><strong>{t('tools.reorderPointCalculator.reorderPoint2', 'Reorder Point')}</strong> = (Daily Demand x Lead Time) + Safety Stock</p>
              <p><strong>{t('tools.reorderPointCalculator.orderWhen', 'Order when')}</strong> {t('tools.reorderPointCalculator.inventoryPositionFallsToOr', 'inventory position falls to or below the reorder point')}</p>
              <p><strong>{t('tools.reorderPointCalculator.inventoryPosition', 'Inventory Position')}</strong> = On-Hand + On-Order - Backorders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReorderPointCalculatorTool;
