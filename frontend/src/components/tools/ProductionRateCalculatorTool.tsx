'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Factory, Calculator, Copy, Check, Info, TrendingUp, Clock, Package } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ProductionRateCalculatorToolProps {
  uiConfig?: any;
}

type TimeUnit = 'minutes' | 'hours' | 'shifts' | 'days';

export const ProductionRateCalculatorTool: React.FC<ProductionRateCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [unitsProduced, setUnitsProduced] = useState('1000');
  const [timeValue, setTimeValue] = useState('8');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('hours');
  const [targetRate, setTargetRate] = useState('');
  const [copied, setCopied] = useState(false);

  const timeInMinutes = useMemo(() => {
    const value = parseFloat(timeValue) || 0;
    switch (timeUnit) {
      case 'minutes': return value;
      case 'hours': return value * 60;
      case 'shifts': return value * 8 * 60; // Assuming 8-hour shifts
      case 'days': return value * 24 * 60;
      default: return value;
    }
  }, [timeValue, timeUnit]);

  const calculations = useMemo(() => {
    const units = parseFloat(unitsProduced) || 0;
    const minutes = timeInMinutes;

    if (minutes <= 0) return null;

    const unitsPerMinute = units / minutes;
    const unitsPerHour = unitsPerMinute * 60;
    const unitsPerShift = unitsPerHour * 8;
    const unitsPerDay = unitsPerHour * 24;
    const minutesPerUnit = minutes / units;
    const cycleTimeSeconds = (minutesPerUnit * 60);

    const target = parseFloat(targetRate) || 0;
    const efficiencyVsTarget = target > 0 ? (unitsPerHour / target) * 100 : null;

    return {
      unitsPerMinute: isFinite(unitsPerMinute) ? unitsPerMinute : 0,
      unitsPerHour: isFinite(unitsPerHour) ? unitsPerHour : 0,
      unitsPerShift: isFinite(unitsPerShift) ? unitsPerShift : 0,
      unitsPerDay: isFinite(unitsPerDay) ? unitsPerDay : 0,
      minutesPerUnit: isFinite(minutesPerUnit) ? minutesPerUnit : 0,
      cycleTimeSeconds: isFinite(cycleTimeSeconds) ? cycleTimeSeconds : 0,
      efficiencyVsTarget,
    };
  }, [unitsProduced, timeInMinutes, targetRate]);

  const handleCopy = () => {
    if (!calculations) return;
    const text = `Production Rate Analysis
Units Produced: ${unitsProduced}
Time Period: ${timeValue} ${timeUnit}

Production Rates:
- Per Minute: ${calculations.unitsPerMinute.toFixed(2)} units
- Per Hour: ${calculations.unitsPerHour.toFixed(2)} units
- Per Shift (8h): ${calculations.unitsPerShift.toFixed(2)} units
- Per Day (24h): ${calculations.unitsPerDay.toFixed(2)} units

Cycle Time: ${calculations.cycleTimeSeconds.toFixed(2)} seconds/unit
${calculations.efficiencyVsTarget ? `Efficiency vs Target: ${calculations.efficiencyVsTarget.toFixed(1)}%` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeUnits: { value: TimeUnit; label: string }[] = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'shifts', label: 'Shifts (8h)' },
    { value: 'days', label: 'Days' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Factory className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.productionRateCalculator.productionRateCalculator', 'Production Rate Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.productionRateCalculator.calculateOutputRatesAndCycle', 'Calculate output rates and cycle times')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.productionRateCalculator.unitsProduced', 'Units Produced')}
            </label>
            <input
              type="number"
              value={unitsProduced}
              onChange={(e) => setUnitsProduced(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              placeholder={t('tools.productionRateCalculator.enterUnitsProduced', 'Enter units produced')}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.productionRateCalculator.timePeriod', 'Time Period')}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                min="0"
                step="0.1"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                placeholder={t('tools.productionRateCalculator.time', 'Time')}
              />
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
                className={`px-3 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              >
                {timeUnits.map((unit) => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.productionRateCalculator.targetRateUnitsHourOptional', 'Target Rate (units/hour) - Optional')}
          </label>
          <input
            type="number"
            value={targetRate}
            onChange={(e) => setTargetRate(e.target.value)}
            min="0"
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            placeholder={t('tools.productionRateCalculator.enterTargetRateForComparison', 'Enter target rate for comparison')}
          />
        </div>

        {/* Results */}
        {calculations && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {t('tools.productionRateCalculator.productionRates', 'Production Rates')}
                </h4>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.productionRateCalculator.copied', 'Copied!') : t('tools.productionRateCalculator.copy', 'Copy')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.productionRateCalculator.perMinute', 'Per Minute')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.unitsPerMinute.toFixed(2)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.productionRateCalculator.perHour', 'Per Hour')}</div>
                <div className="text-2xl font-bold text-teal-500">
                  {calculations.unitsPerHour.toFixed(2)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.productionRateCalculator.perShift8h', 'Per Shift (8h)')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.unitsPerShift.toFixed(0)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.productionRateCalculator.perDay24h', 'Per Day (24h)')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.unitsPerDay.toFixed(0)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>units</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} flex items-center gap-4`}>
                <div className="p-3 bg-teal-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.productionRateCalculator.cycleTime', 'Cycle Time')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.cycleTimeSeconds.toFixed(2)} seconds/unit
                  </div>
                </div>
              </div>

              {calculations.efficiencyVsTarget !== null && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} flex items-center gap-4`}>
                  <div className={`p-3 rounded-lg ${
                    calculations.efficiencyVsTarget >= 100 ? 'bg-green-500/10' : 'bg-yellow-500/10'
                  }`}>
                    <Package className={`w-6 h-6 ${
                      calculations.efficiencyVsTarget >= 100 ? 'text-green-500' : 'text-yellow-500'
                    }`} />
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.productionRateCalculator.vsTarget', 'vs Target')}</div>
                    <div className={`text-xl font-bold ${
                      calculations.efficiencyVsTarget >= 100 ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {calculations.efficiencyVsTarget.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="mb-2"><strong>{t('tools.productionRateCalculator.productionRate', 'Production Rate')}</strong> = Units Produced / Time Period</p>
              <p><strong>{t('tools.productionRateCalculator.cycleTime2', 'Cycle Time')}</strong> = Time Period / Units Produced (time to produce one unit)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionRateCalculatorTool;
