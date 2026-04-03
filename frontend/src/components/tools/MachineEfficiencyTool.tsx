'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Cog, Calculator, Copy, Check, Info, TrendingUp, Clock, AlertTriangle, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface MachineEfficiencyToolProps {
  uiConfig?: any;
}

export const MachineEfficiencyTool: React.FC<MachineEfficiencyToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [scheduledTime, setScheduledTime] = useState('480'); // 8 hours in minutes
  const [actualRunTime, setActualRunTime] = useState('420');
  const [plannedDowntime, setPlannedDowntime] = useState('30');
  const [unplannedDowntime, setUnplannedDowntime] = useState('30');
  const [idealOutput, setIdealOutput] = useState('1000');
  const [actualOutput, setActualOutput] = useState('850');
  const [copied, setCopied] = useState(false);

  const calculations = useMemo(() => {
    const scheduled = parseFloat(scheduledTime) || 0;
    const running = parseFloat(actualRunTime) || 0;
    const planned = parseFloat(plannedDowntime) || 0;
    const unplanned = parseFloat(unplannedDowntime) || 0;
    const ideal = parseFloat(idealOutput) || 0;
    const actual = parseFloat(actualOutput) || 0;

    if (scheduled <= 0) return null;

    // Available time = Scheduled - Planned Downtime
    const availableTime = scheduled - planned;

    // Availability = Actual Run Time / Available Time
    const availability = availableTime > 0 ? (running / availableTime) * 100 : 0;

    // Performance = Actual Output / Ideal Output (if running at capacity)
    const performance = ideal > 0 ? (actual / ideal) * 100 : 0;

    // Overall Efficiency = Availability * Performance / 100
    const overallEfficiency = (availability * performance) / 100;

    // Utilization = Actual Run Time / Scheduled Time
    const utilization = scheduled > 0 ? (running / scheduled) * 100 : 0;

    // Downtime percentage
    const totalDowntime = planned + unplanned;
    const downtimePercentage = scheduled > 0 ? (totalDowntime / scheduled) * 100 : 0;

    // Lost production
    const lostProduction = ideal - actual;
    const lostProductionPercentage = ideal > 0 ? (lostProduction / ideal) * 100 : 0;

    return {
      availableTime,
      availability: Math.min(availability, 100),
      performance: Math.min(performance, 100),
      overallEfficiency: Math.min(overallEfficiency, 100),
      utilization: Math.min(utilization, 100),
      totalDowntime,
      downtimePercentage,
      lostProduction: Math.max(lostProduction, 0),
      lostProductionPercentage: Math.max(lostProductionPercentage, 0),
    };
  }, [scheduledTime, actualRunTime, plannedDowntime, unplannedDowntime, idealOutput, actualOutput]);

  const handleCopy = () => {
    if (!calculations) return;
    const text = `Machine Efficiency Analysis

Scheduled Time: ${scheduledTime} minutes
Actual Run Time: ${actualRunTime} minutes
Planned Downtime: ${plannedDowntime} minutes
Unplanned Downtime: ${unplannedDowntime} minutes

Ideal Output: ${idealOutput} units
Actual Output: ${actualOutput} units

Results:
- Availability: ${calculations.availability.toFixed(1)}%
- Performance: ${calculations.performance.toFixed(1)}%
- Overall Efficiency: ${calculations.overallEfficiency.toFixed(1)}%
- Utilization: ${calculations.utilization.toFixed(1)}%
- Total Downtime: ${calculations.totalDowntime} minutes (${calculations.downtimePercentage.toFixed(1)}%)
- Lost Production: ${calculations.lostProduction} units (${calculations.lostProductionPercentage.toFixed(1)}%)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEfficiencyColor = (value: number) => {
    if (value >= 85) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getEfficiencyBg = (value: number) => {
    if (value >= 85) return isDark ? 'bg-green-500/10' : 'bg-green-50';
    if (value >= 60) return isDark ? 'bg-yellow-500/10' : 'bg-yellow-50';
    return isDark ? 'bg-red-500/10' : 'bg-red-50';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Cog className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.machineEfficiency.machineEfficiencyCalculator', 'Machine Efficiency Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.machineEfficiency.analyzeAvailabilityPerformanceUtilization', 'Analyze availability, performance & utilization')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Time Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Clock className="w-4 h-4 text-teal-500" />
            {t('tools.machineEfficiency.timeMetricsMinutes', 'Time Metrics (minutes)')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.machineEfficiency.scheduledTime', 'Scheduled Time')}
              </label>
              <input
                type="number"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.machineEfficiency.actualRunTime', 'Actual Run Time')}
              </label>
              <input
                type="number"
                value={actualRunTime}
                onChange={(e) => setActualRunTime(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.machineEfficiency.plannedDowntime', 'Planned Downtime')}
              </label>
              <input
                type="number"
                value={plannedDowntime}
                onChange={(e) => setPlannedDowntime(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.machineEfficiency.unplannedDowntime', 'Unplanned Downtime')}
              </label>
              <input
                type="number"
                value={unplannedDowntime}
                onChange={(e) => setUnplannedDowntime(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>

        {/* Output Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.machineEfficiency.idealOutputUnits', 'Ideal Output (units)')}
            </label>
            <input
              type="number"
              value={idealOutput}
              onChange={(e) => setIdealOutput(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              placeholder={t('tools.machineEfficiency.maximumPossibleOutput', 'Maximum possible output')}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.machineEfficiency.actualOutputUnits', 'Actual Output (units)')}
            </label>
            <input
              type="number"
              value={actualOutput}
              onChange={(e) => setActualOutput(e.target.value)}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              placeholder={t('tools.machineEfficiency.actualProduction', 'Actual production')}
            />
          </div>
        </div>

        {/* Results */}
        {calculations && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-500" />
                <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {t('tools.machineEfficiency.efficiencyMetrics', 'Efficiency Metrics')}
                </h4>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.machineEfficiency.copied', 'Copied!') : t('tools.machineEfficiency.copy', 'Copy')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${getEfficiencyBg(calculations.availability)}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.machineEfficiency.availability', 'Availability')}</div>
                <div className={`text-2xl font-bold ${getEfficiencyColor(calculations.availability)}`}>
                  {calculations.availability.toFixed(1)}%
                </div>
              </div>
              <div className={`p-4 rounded-lg ${getEfficiencyBg(calculations.performance)}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.machineEfficiency.performance', 'Performance')}</div>
                <div className={`text-2xl font-bold ${getEfficiencyColor(calculations.performance)}`}>
                  {calculations.performance.toFixed(1)}%
                </div>
              </div>
              <div className={`p-4 rounded-lg ${getEfficiencyBg(calculations.overallEfficiency)}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.machineEfficiency.overallEfficiency', 'Overall Efficiency')}</div>
                <div className={`text-2xl font-bold ${getEfficiencyColor(calculations.overallEfficiency)}`}>
                  {calculations.overallEfficiency.toFixed(1)}%
                </div>
              </div>
              <div className={`p-4 rounded-lg ${getEfficiencyBg(calculations.utilization)}`}>
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.machineEfficiency.utilization', 'Utilization')}</div>
                <div className={`text-2xl font-bold ${getEfficiencyColor(calculations.utilization)}`}>
                  {calculations.utilization.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.machineEfficiency.totalDowntime', 'Total Downtime')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.totalDowntime} min
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {calculations.downtimePercentage.toFixed(1)}% of scheduled
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.machineEfficiency.availableTime', 'Available Time')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.availableTime} min
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.machineEfficiency.lostProduction', 'Lost Production')}</span>
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.lostProduction} units
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {calculations.lostProductionPercentage.toFixed(1)}% of ideal
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
              <p><strong>{t('tools.machineEfficiency.availability2', 'Availability:')}</strong> {t('tools.machineEfficiency.actualRunTimeScheduledTime', 'Actual Run Time / (Scheduled Time - Planned Downtime)')}</p>
              <p><strong>{t('tools.machineEfficiency.performance2', 'Performance:')}</strong> {t('tools.machineEfficiency.actualOutputIdealOutput', 'Actual Output / Ideal Output')}</p>
              <p><strong>{t('tools.machineEfficiency.utilization2', 'Utilization:')}</strong> {t('tools.machineEfficiency.actualRunTimeScheduledTime2', 'Actual Run Time / Scheduled Time')}</p>
              <p><strong>{t('tools.machineEfficiency.worldClassEfficiency', 'World-class efficiency:')}</strong> 85%+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineEfficiencyTool;
