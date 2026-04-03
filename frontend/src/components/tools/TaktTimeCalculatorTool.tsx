'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Calculator, Copy, Check, Info, TrendingUp, Users, Target, AlertTriangle, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface TaktTimeCalculatorToolProps {
  uiConfig?: any;
}

type TimeUnit = 'seconds' | 'minutes' | 'hours';

export const TaktTimeCalculatorTool: React.FC<TaktTimeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Available time inputs
  const [shiftHours, setShiftHours] = useState('8');
  const [breaksMinutes, setBreaksMinutes] = useState('60');
  const [plannedDowntimeMinutes, setPlannedDowntimeMinutes] = useState('30');

  // Demand inputs
  const [customerDemand, setCustomerDemand] = useState('400');
  const [demandPeriod, setDemandPeriod] = useState<'shift' | 'day' | 'week'>('shift');

  // Comparison inputs
  const [actualCycleTime, setActualCycleTime] = useState('');
  const [numberOfOperators, setNumberOfOperators] = useState('5');

  const [copied, setCopied] = useState(false);

  const calculations = useMemo(() => {
    const hours = parseFloat(shiftHours) || 0;
    const breaks = parseFloat(breaksMinutes) || 0;
    const downtime = parseFloat(plannedDowntimeMinutes) || 0;
    const demand = parseFloat(customerDemand) || 0;

    if (hours <= 0 || demand <= 0) return null;

    // Calculate available time in seconds
    const totalShiftSeconds = hours * 3600;
    const breakSeconds = breaks * 60;
    const downtimeSeconds = downtime * 60;
    const availableTimeSeconds = totalShiftSeconds - breakSeconds - downtimeSeconds;

    // Adjust demand based on period
    let demandPerShift = demand;
    if (demandPeriod === 'day') {
      demandPerShift = demand; // Assuming one shift per day
    } else if (demandPeriod === 'week') {
      demandPerShift = demand / 5; // Assuming 5-day work week
    }

    // Calculate Takt Time
    const taktTimeSeconds = availableTimeSeconds / demandPerShift;
    const taktTimeMinutes = taktTimeSeconds / 60;

    // Theoretical capacity
    const theoreticalCapacity = availableTimeSeconds / taktTimeSeconds;

    // Cycle time comparison
    const cycleTime = parseFloat(actualCycleTime) || 0;
    let efficiency = null;
    let capacityStatus: 'over' | 'under' | 'balanced' | null = null;

    if (cycleTime > 0) {
      efficiency = (taktTimeSeconds / cycleTime) * 100;
      if (cycleTime > taktTimeSeconds * 1.1) {
        capacityStatus = 'under';
      } else if (cycleTime < taktTimeSeconds * 0.9) {
        capacityStatus = 'over';
      } else {
        capacityStatus = 'balanced';
      }
    }

    // Operator balance
    const operators = parseFloat(numberOfOperators) || 0;
    const workContentPerUnit = operators > 0 ? taktTimeSeconds * operators : 0;
    const balanceEfficiency = operators > 0 && cycleTime > 0
      ? (cycleTime * operators / workContentPerUnit) * 100
      : null;

    return {
      availableTimeSeconds,
      availableTimeMinutes: availableTimeSeconds / 60,
      taktTimeSeconds,
      taktTimeMinutes,
      theoreticalCapacity,
      demandPerShift,
      efficiency,
      capacityStatus,
      workContentPerUnit,
      balanceEfficiency,
      unitsPerHour: 3600 / taktTimeSeconds,
    };
  }, [shiftHours, breaksMinutes, plannedDowntimeMinutes, customerDemand, demandPeriod, actualCycleTime, numberOfOperators]);

  const handleCopy = () => {
    if (!calculations) return;
    const text = `Takt Time Analysis

Available Time:
- Shift: ${shiftHours} hours
- Breaks: ${breaksMinutes} minutes
- Downtime: ${plannedDowntimeMinutes} minutes
- Net Available: ${calculations.availableTimeMinutes.toFixed(1)} minutes

Customer Demand: ${customerDemand} units per ${demandPeriod}
Demand per Shift: ${calculations.demandPerShift.toFixed(0)} units

Takt Time: ${calculations.taktTimeSeconds.toFixed(2)} seconds
Takt Time: ${calculations.taktTimeMinutes.toFixed(3)} minutes
Theoretical Output: ${calculations.unitsPerHour.toFixed(1)} units/hour
${calculations.efficiency ? `Efficiency vs Cycle Time: ${calculations.efficiency.toFixed(1)}%` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'over': return 'text-yellow-500';
      case 'under': return 'text-red-500';
      case 'balanced': return 'text-green-500';
      default: return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusBg = (status: string | null) => {
    switch (status) {
      case 'over': return isDark ? 'bg-yellow-500/10' : 'bg-yellow-50';
      case 'under': return isDark ? 'bg-red-500/10' : 'bg-red-50';
      case 'balanced': return isDark ? 'bg-green-500/10' : 'bg-green-50';
      default: return isDark ? 'bg-gray-800' : 'bg-gray-50';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.taktTimeCalculator.taktTimeCalculator', 'Takt Time Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.taktTimeCalculator.calculateProductionPaceToMeet', 'Calculate production pace to meet demand')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Available Time Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Clock className="w-4 h-4 text-teal-500" />
            {t('tools.taktTimeCalculator.availableProductionTime', 'Available Production Time')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taktTimeCalculator.shiftLengthHours', 'Shift Length (hours)')}
              </label>
              <input
                type="number"
                value={shiftHours}
                onChange={(e) => setShiftHours(e.target.value)}
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taktTimeCalculator.breaksMinutes', 'Breaks (minutes)')}
              </label>
              <input
                type="number"
                value={breaksMinutes}
                onChange={(e) => setBreaksMinutes(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taktTimeCalculator.plannedDowntimeMin', 'Planned Downtime (min)')}
              </label>
              <input
                type="number"
                value={plannedDowntimeMinutes}
                onChange={(e) => setPlannedDowntimeMinutes(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>

        {/* Demand Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.taktTimeCalculator.customerDemandUnits', 'Customer Demand (units)')}
            </label>
            <input
              type="number"
              value={customerDemand}
              onChange={(e) => setCustomerDemand(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.taktTimeCalculator.demandPeriod', 'Demand Period')}
            </label>
            <div className="flex gap-2">
              {(['shift', 'day', 'week'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setDemandPeriod(period)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors capitalize ${
                    demandPeriod === period
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Target className="w-4 h-4 text-teal-500" />
            {t('tools.taktTimeCalculator.compareWithActualOptional', 'Compare with Actual (Optional)')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taktTimeCalculator.actualCycleTimeSeconds', 'Actual Cycle Time (seconds)')}
              </label>
              <input
                type="number"
                value={actualCycleTime}
                onChange={(e) => setActualCycleTime(e.target.value)}
                min="0"
                step="0.1"
                placeholder={t('tools.taktTimeCalculator.enterActualCycleTime', 'Enter actual cycle time')}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.taktTimeCalculator.numberOfOperators', 'Number of Operators')}
              </label>
              <input
                type="number"
                value={numberOfOperators}
                onChange={(e) => setNumberOfOperators(e.target.value)}
                min="1"
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
                <Zap className="w-5 h-5 text-teal-500" />
                <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {t('tools.taktTimeCalculator.taktTimeResults', 'Takt Time Results')}
                </h4>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.taktTimeCalculator.copied', 'Copied!') : t('tools.taktTimeCalculator.copy', 'Copy')}
              </button>
            </div>

            {/* Main Takt Time Display */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} text-center mb-6`}>
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.taktTimeCalculator.taktTime', 'Takt Time')}</div>
              <div className="text-4xl font-bold text-teal-500">
                {calculations.taktTimeSeconds.toFixed(2)} seconds
              </div>
              <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                ({calculations.taktTimeMinutes.toFixed(3)} minutes)
              </div>
              <div className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Produce 1 unit every {calculations.taktTimeSeconds.toFixed(1)} seconds to meet demand
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.taktTimeCalculator.availableTime', 'Available Time')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.availableTimeMinutes.toFixed(0)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>minutes</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.taktTimeCalculator.demand', 'Demand')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.demandPerShift.toFixed(0)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.taktTimeCalculator.unitsShift', 'units/shift')}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.taktTimeCalculator.unitsHour', 'Units/Hour')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.unitsPerHour.toFixed(1)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>required</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.taktTimeCalculator.capacity', 'Capacity')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.theoreticalCapacity.toFixed(0)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
            </div>

            {calculations.capacityStatus && (
              <div className={`p-4 rounded-lg ${getStatusBg(calculations.capacityStatus)} flex items-center gap-4`}>
                {calculations.capacityStatus === 'under' ? (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                ) : calculations.capacityStatus === 'over' ? (
                  <TrendingUp className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Target className="w-6 h-6 text-green-500" />
                )}
                <div>
                  <div className={`font-medium ${getStatusColor(calculations.capacityStatus)}`}>
                    {calculations.capacityStatus === 'under' && 'Capacity Constraint - Cycle time exceeds Takt time'}
                    {calculations.capacityStatus === 'over' && 'Overcapacity - Cycle time is below Takt time'}
                    {calculations.capacityStatus === 'balanced' && 'Well Balanced - Cycle time matches Takt time'}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Efficiency: {calculations.efficiency?.toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
              <p><strong>{t('tools.taktTimeCalculator.taktTime2', 'Takt Time')}</strong> = Available Production Time / Customer Demand</p>
              <p><strong>{t('tools.taktTimeCalculator.balanced', 'Balanced:')}</strong> {t('tools.taktTimeCalculator.cycleTimeApproximatelyEqualsTakt', 'Cycle Time approximately equals Takt Time')}</p>
              <p><strong>{t('tools.taktTimeCalculator.goal', 'Goal:')}</strong> {t('tools.taktTimeCalculator.produceAtThePaceOf', 'Produce at the pace of customer demand - no faster, no slower')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaktTimeCalculatorTool;
