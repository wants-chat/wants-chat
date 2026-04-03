'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Timer, Calculator, Copy, Check, Info, Clock, TrendingDown, Target, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface CycleTimeCalculatorToolProps {
  uiConfig?: any;
}

type TimeUnit = 'seconds' | 'minutes' | 'hours';

export const CycleTimeCalculatorTool: React.FC<CycleTimeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'calculate' | 'analyze'>('calculate');

  // Calculate mode
  const [totalTime, setTotalTime] = useState('480');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('minutes');
  const [unitsProduced, setUnitsProduced] = useState('960');

  // Analyze mode
  const [processingTime, setProcessingTime] = useState('25');
  const [waitTime, setWaitTime] = useState('5');
  const [moveTime, setMoveTime] = useState('3');
  const [inspectionTime, setInspectionTime] = useState('2');

  const [targetCycleTime, setTargetCycleTime] = useState('');
  const [copied, setCopied] = useState(false);

  const timeInSeconds = useMemo(() => {
    const value = parseFloat(totalTime) || 0;
    switch (timeUnit) {
      case 'seconds': return value;
      case 'minutes': return value * 60;
      case 'hours': return value * 3600;
      default: return value;
    }
  }, [totalTime, timeUnit]);

  const calculations = useMemo(() => {
    if (mode === 'calculate') {
      const units = parseFloat(unitsProduced) || 0;
      const seconds = timeInSeconds;

      if (units <= 0 || seconds <= 0) return null;

      const cycleTimeSeconds = seconds / units;
      const cycleTimeMinutes = cycleTimeSeconds / 60;
      const unitsPerHour = 3600 / cycleTimeSeconds;
      const unitsPerMinute = 60 / cycleTimeSeconds;

      const target = parseFloat(targetCycleTime) || 0;
      const efficiency = target > 0 ? (target / cycleTimeSeconds) * 100 : null;

      return {
        mode: 'calculate' as const,
        cycleTimeSeconds,
        cycleTimeMinutes,
        unitsPerHour,
        unitsPerMinute,
        efficiency,
      };
    } else {
      const processing = parseFloat(processingTime) || 0;
      const wait = parseFloat(waitTime) || 0;
      const move = parseFloat(moveTime) || 0;
      const inspection = parseFloat(inspectionTime) || 0;

      const totalCycleTime = processing + wait + move + inspection;
      const valueAddedTime = processing; // Only processing adds value
      const nonValueAddedTime = wait + move + inspection;
      const valueAddedRatio = totalCycleTime > 0 ? (valueAddedTime / totalCycleTime) * 100 : 0;
      const unitsPerHour = totalCycleTime > 0 ? 3600 / totalCycleTime : 0;

      const target = parseFloat(targetCycleTime) || 0;
      const efficiency = target > 0 && totalCycleTime > 0 ? (target / totalCycleTime) * 100 : null;

      return {
        mode: 'analyze' as const,
        totalCycleTime,
        valueAddedTime,
        nonValueAddedTime,
        valueAddedRatio,
        unitsPerHour,
        efficiency,
        breakdown: {
          processing,
          wait,
          move,
          inspection,
        },
      };
    }
  }, [mode, timeInSeconds, unitsProduced, processingTime, waitTime, moveTime, inspectionTime, targetCycleTime]);

  const handleCopy = () => {
    if (!calculations) return;
    let text = 'Cycle Time Analysis\n\n';

    if (calculations.mode === 'calculate') {
      text += `Total Time: ${totalTime} ${timeUnit}
Units Produced: ${unitsProduced}

Cycle Time: ${calculations.cycleTimeSeconds.toFixed(2)} seconds
Cycle Time: ${calculations.cycleTimeMinutes.toFixed(3)} minutes
Units Per Hour: ${calculations.unitsPerHour.toFixed(2)}
Units Per Minute: ${calculations.unitsPerMinute.toFixed(2)}
${calculations.efficiency ? `Efficiency vs Target: ${calculations.efficiency.toFixed(1)}%` : ''}`;
    } else {
      text += `Processing Time: ${processingTime}s
Wait Time: ${waitTime}s
Move Time: ${moveTime}s
Inspection Time: ${inspectionTime}s

Total Cycle Time: ${calculations.totalCycleTime.toFixed(2)} seconds
Value-Added Time: ${calculations.valueAddedTime.toFixed(2)} seconds
Non-Value-Added Time: ${calculations.nonValueAddedTime.toFixed(2)} seconds
Value-Added Ratio: ${calculations.valueAddedRatio.toFixed(1)}%
Theoretical Output: ${calculations.unitsPerHour.toFixed(2)} units/hour
${calculations.efficiency ? `Efficiency vs Target: ${calculations.efficiency.toFixed(1)}%` : ''}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeUnits: { value: TimeUnit; label: string }[] = [
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Timer className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cycleTimeCalculator.cycleTimeCalculator', 'Cycle Time Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.calculateAndAnalyzeProductionCycle', 'Calculate and analyze production cycle times')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('calculate')}
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              mode === 'calculate'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.cycleTimeCalculator.calculateCycleTime', 'Calculate Cycle Time')}
          </button>
          <button
            onClick={() => setMode('analyze')}
            className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
              mode === 'analyze'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.cycleTimeCalculator.analyzeComponents', 'Analyze Components')}
          </button>
        </div>

        {mode === 'calculate' ? (
          /* Calculate Mode Inputs */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.cycleTimeCalculator.totalProductionTime', 'Total Production Time')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={totalTime}
                    onChange={(e) => setTotalTime(e.target.value)}
                    min="0"
                    step="0.1"
                    className={`flex-1 px-4 py-3 rounded-lg border ${
                      isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
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
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.cycleTimeCalculator.unitsProduced', 'Units Produced')}
                </label>
                <input
                  type="number"
                  value={unitsProduced}
                  onChange={(e) => setUnitsProduced(e.target.value)}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Analyze Mode Inputs */
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Clock className="w-4 h-4 text-teal-500" />
              {t('tools.cycleTimeCalculator.cycleTimeComponentsSeconds', 'Cycle Time Components (seconds)')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.cycleTimeCalculator.processing2', 'Processing')}
                </label>
                <input
                  type="number"
                  value={processingTime}
                  onChange={(e) => setProcessingTime(e.target.value)}
                  min="0"
                  step="0.1"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.cycleTimeCalculator.waitTime', 'Wait Time')}
                </label>
                <input
                  type="number"
                  value={waitTime}
                  onChange={(e) => setWaitTime(e.target.value)}
                  min="0"
                  step="0.1"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.cycleTimeCalculator.moveTime', 'Move Time')}
                </label>
                <input
                  type="number"
                  value={moveTime}
                  onChange={(e) => setMoveTime(e.target.value)}
                  min="0"
                  step="0.1"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.cycleTimeCalculator.inspection2', 'Inspection')}
                </label>
                <input
                  type="number"
                  value={inspectionTime}
                  onChange={(e) => setInspectionTime(e.target.value)}
                  min="0"
                  step="0.1"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Target Cycle Time */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.cycleTimeCalculator.targetCycleTimeSecondsOptional', 'Target Cycle Time (seconds) - Optional')}
          </label>
          <input
            type="number"
            value={targetCycleTime}
            onChange={(e) => setTargetCycleTime(e.target.value)}
            min="0"
            step="0.1"
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            placeholder={t('tools.cycleTimeCalculator.enterTargetForComparison', 'Enter target for comparison')}
          />
        </div>

        {/* Results */}
        {calculations && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-500" />
                <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {calculations.mode === 'calculate' ? t('tools.cycleTimeCalculator.cycleTimeResults', 'Cycle Time Results') : t('tools.cycleTimeCalculator.cycleTimeAnalysis', 'Cycle Time Analysis')}
                </h4>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.cycleTimeCalculator.copied', 'Copied!') : t('tools.cycleTimeCalculator.copy', 'Copy')}
              </button>
            </div>

            {calculations.mode === 'calculate' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.cycleTime', 'Cycle Time')}</div>
                    <div className="text-2xl font-bold text-teal-500">
                      {calculations.cycleTimeSeconds.toFixed(2)}s
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.cycleTime2', 'Cycle Time')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {calculations.cycleTimeMinutes.toFixed(3)}m
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.unitsHour', 'Units/Hour')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {calculations.unitsPerHour.toFixed(1)}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.unitsMin', 'Units/Min')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {calculations.unitsPerMinute.toFixed(2)}
                    </div>
                  </div>
                </div>

                {calculations.efficiency !== null && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} flex items-center gap-4`}>
                    <div className={`p-3 rounded-lg ${calculations.efficiency >= 100 ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <Target className={`w-6 h-6 ${calculations.efficiency >= 100 ? 'text-green-500' : 'text-yellow-500'}`} />
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.efficiencyVsTarget', 'Efficiency vs Target')}</div>
                      <div className={`text-xl font-bold ${calculations.efficiency >= 100 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {calculations.efficiency.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.totalCycleTime', 'Total Cycle Time')}</div>
                    <div className="text-2xl font-bold text-teal-500">
                      {calculations.totalCycleTime.toFixed(1)}s
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.valueAdded', 'Value-Added')}</div>
                    <div className="text-2xl font-bold text-green-500">
                      {calculations.valueAddedTime.toFixed(1)}s
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.nonValueAdded', 'Non-Value-Added')}</div>
                    <div className="text-2xl font-bold text-orange-500">
                      {calculations.nonValueAddedTime.toFixed(1)}s
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.vaRatio', 'VA Ratio')}</div>
                    <div className={`text-2xl font-bold ${calculations.valueAddedRatio >= 50 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {calculations.valueAddedRatio.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Breakdown Bar */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.cycleTimeCalculator.timeBreakdown', 'Time Breakdown')}</div>
                  <div className="flex h-6 rounded-lg overflow-hidden">
                    <div
                      className="bg-green-500"
                      style={{ width: `${(calculations.breakdown.processing / calculations.totalCycleTime) * 100}%` }}
                      title={`Processing: ${calculations.breakdown.processing}s`}
                    />
                    <div
                      className="bg-orange-500"
                      style={{ width: `${(calculations.breakdown.wait / calculations.totalCycleTime) * 100}%` }}
                      title={`Wait: ${calculations.breakdown.wait}s`}
                    />
                    <div
                      className="bg-blue-500"
                      style={{ width: `${(calculations.breakdown.move / calculations.totalCycleTime) * 100}%` }}
                      title={`Move: ${calculations.breakdown.move}s`}
                    />
                    <div
                      className="bg-purple-500"
                      style={{ width: `${(calculations.breakdown.inspection / calculations.totalCycleTime) * 100}%` }}
                      title={`Inspection: ${calculations.breakdown.inspection}s`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> {t('tools.cycleTimeCalculator.processing', 'Processing')}</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded" /> {t('tools.cycleTimeCalculator.wait', 'Wait')}</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" /> {t('tools.cycleTimeCalculator.move', 'Move')}</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 rounded" /> {t('tools.cycleTimeCalculator.inspection', 'Inspection')}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cycleTimeCalculator.theoreticalOutput', 'Theoretical Output')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.unitsPerHour.toFixed(1)} units/hour
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
              <p><strong>{t('tools.cycleTimeCalculator.cycleTime3', 'Cycle Time')}</strong> = Total Production Time / Units Produced</p>
              <p><strong>{t('tools.cycleTimeCalculator.valueAddedTime', 'Value-Added Time')}</strong> = Time spent on processing that adds value</p>
              <p><strong>{t('tools.cycleTimeCalculator.goal', 'Goal:')}</strong> {t('tools.cycleTimeCalculator.reduceNonValueAddedTime', 'Reduce non-value-added time (wait, move, inspection)')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleTimeCalculatorTool;
