import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Car, Calendar, AlertTriangle, Bell, Info, Sparkles, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface OilChangeToolProps {
  uiConfig?: UIConfig;
}

export const OilChangeTool: React.FC<OilChangeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentMileage, setCurrentMileage] = useState('45000');
  const [lastOilChangeMileage, setLastOilChangeMileage] = useState('42000');
  const [lastOilChangeDate, setLastOilChangeDate] = useState(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [oilType, setOilType] = useState<'conventional' | 'synthetic-blend' | 'full-synthetic' | 'high-mileage'>('full-synthetic');
  const [drivingCondition, setDrivingCondition] = useState<'normal' | 'severe'>('normal');
  const [averageMonthlyMiles, setAverageMonthlyMiles] = useState('1000');
  const [oilCapacity, setOilCapacity] = useState('5');
  const [oilPricePerQuart, setOilPricePerQuart] = useState('8');
  const [filterPrice, setFilterPrice] = useState('12');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.mileage !== undefined || params.currentMileage !== undefined) {
        setCurrentMileage(String(params.mileage || params.currentMileage));
        setIsPrefilled(true);
      }
      if (params.lastOilChange !== undefined) {
        setLastOilChangeMileage(String(params.lastOilChange));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Oil change intervals by type and condition
  const intervals: Record<string, Record<string, { miles: number; months: number }>> = {
    'conventional': {
      normal: { miles: 5000, months: 6 },
      severe: { miles: 3000, months: 3 },
    },
    'synthetic-blend': {
      normal: { miles: 7500, months: 6 },
      severe: { miles: 5000, months: 4 },
    },
    'full-synthetic': {
      normal: { miles: 10000, months: 12 },
      severe: { miles: 7500, months: 6 },
    },
    'high-mileage': {
      normal: { miles: 7500, months: 6 },
      severe: { miles: 5000, months: 4 },
    },
  };

  const calculations = useMemo(() => {
    const current = parseFloat(currentMileage) || 0;
    const lastMileage = parseFloat(lastOilChangeMileage) || 0;
    const monthlyMiles = parseFloat(averageMonthlyMiles) || 1;
    const capacity = parseFloat(oilCapacity) || 0;
    const oilPrice = parseFloat(oilPricePerQuart) || 0;
    const filter = parseFloat(filterPrice) || 0;

    const interval = intervals[oilType][drivingCondition];
    const mileInterval = interval.miles;
    const monthInterval = interval.months;

    // Miles since last change
    const milesDriven = current - lastMileage;
    const milesRemaining = Math.max(0, mileInterval - milesDriven);
    const milePercentUsed = (milesDriven / mileInterval) * 100;

    // Time since last change
    const lastChangeDate = new Date(lastOilChangeDate);
    const now = new Date();
    const daysSinceChange = Math.floor((now.getTime() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsSinceChange = daysSinceChange / 30;
    const monthsRemaining = Math.max(0, monthInterval - monthsSinceChange);
    const timePercentUsed = (monthsSinceChange / monthInterval) * 100;

    // Next oil change prediction
    const milesUntilDue = milesRemaining;
    const monthsUntilMilesDue = milesUntilDue / monthlyMiles;

    // Choose the sooner deadline
    const monthsUntilDue = Math.min(monthsRemaining, monthsUntilMilesDue);
    const nextChangeMileage = current + milesRemaining;
    const nextChangeDate = new Date(now.getTime() + monthsUntilDue * 30 * 24 * 60 * 60 * 1000);

    // Status
    const overdue = milesDriven > mileInterval || monthsSinceChange > monthInterval;
    const dueSoon = !overdue && (milePercentUsed > 80 || timePercentUsed > 80);
    const status = overdue ? 'overdue' : dueSoon ? 'due-soon' : 'good';

    // Cost calculation
    const oilChangeCost = (capacity * oilPrice) + filter;
    const annualChanges = 12 / monthInterval;
    const annualCost = oilChangeCost * annualChanges;

    return {
      milesDriven,
      milesRemaining,
      milePercentUsed: Math.min(100, milePercentUsed),
      daysSinceChange,
      monthsSinceChange,
      monthsRemaining,
      timePercentUsed: Math.min(100, timePercentUsed),
      nextChangeMileage,
      nextChangeDate,
      monthsUntilDue,
      status,
      mileInterval,
      monthInterval,
      oilChangeCost,
      annualCost,
    };
  }, [currentMileage, lastOilChangeMileage, lastOilChangeDate, oilType, drivingCondition, averageMonthlyMiles, oilCapacity, oilPricePerQuart, filterPrice]);

  const oilTypes = [
    { value: 'conventional', label: 'Conventional', description: '3,000-5,000 miles' },
    { value: 'synthetic-blend', label: 'Synthetic Blend', description: '5,000-7,500 miles' },
    { value: 'full-synthetic', label: 'Full Synthetic', description: '7,500-10,000 miles' },
    { value: 'high-mileage', label: 'High Mileage', description: '5,000-7,500 miles' },
  ];

  const getStatusColor = () => {
    switch (calculations.status) {
      case 'overdue': return 'red';
      case 'due-soon': return 'yellow';
      default: return 'teal';
    }
  };

  const statusColor = getStatusColor();

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Droplets className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChange.oilChangeCalculator', 'Oil Change Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.oilChange.trackAndPlanYourOil', 'Track and plan your oil changes')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.oilChange.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Status Banner */}
        <div className={`p-4 rounded-xl border ${
          calculations.status === 'overdue'
            ? isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            : calculations.status === 'due-soon'
            ? isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
            : isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'
        }`}>
          <div className="flex items-center gap-3">
            {calculations.status === 'overdue' ? (
              <AlertTriangle className="w-6 h-6 text-red-500" />
            ) : calculations.status === 'due-soon' ? (
              <Bell className="w-6 h-6 text-yellow-500" />
            ) : (
              <Clock className="w-6 h-6 text-teal-500" />
            )}
            <div>
              <div className={`font-semibold ${
                calculations.status === 'overdue' ? 'text-red-500'
                : calculations.status === 'due-soon' ? 'text-yellow-500'
                : 'text-teal-500'
              }`}>
                {calculations.status === 'overdue' ? 'Oil Change Overdue!'
                : calculations.status === 'due-soon' ? t('tools.oilChange.oilChangeDueSoon', 'Oil Change Due Soon') : t('tools.oilChange.oilChangeStatusGood', 'Oil Change Status: Good')}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {calculations.milesRemaining > 0
                  ? `${Math.round(calculations.milesRemaining).toLocaleString()} miles remaining`
                  : `${Math.abs(Math.round(calculations.milesRemaining)).toLocaleString()} miles overdue`}
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Car className="w-4 h-4 inline mr-1" />
              {t('tools.oilChange.currentMileage', 'Current Mileage')}
            </label>
            <input
              type="number"
              value={currentMileage}
              onChange={(e) => setCurrentMileage(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.oilChange.lastOilChangeMiles', 'Last Oil Change (miles)')}
            </label>
            <input
              type="number"
              value={lastOilChangeMileage}
              onChange={(e) => setLastOilChangeMileage(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Date and Monthly Miles */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.oilChange.lastOilChangeDate', 'Last Oil Change Date')}
            </label>
            <input
              type="date"
              value={lastOilChangeDate}
              onChange={(e) => setLastOilChangeDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.oilChange.avgMonthlyMiles', 'Avg Monthly Miles')}
            </label>
            <input
              type="number"
              value={averageMonthlyMiles}
              onChange={(e) => setAverageMonthlyMiles(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Oil Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Droplets className="w-4 h-4 inline mr-1" />
            {t('tools.oilChange.oilType', 'Oil Type')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {oilTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setOilType(type.value as typeof oilType)}
                className={`p-3 rounded-lg text-left transition-all ${
                  oilType === type.value
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium text-sm">{type.label}</div>
                <div className={`text-xs ${oilType === type.value ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {type.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Driving Conditions */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.oilChange.drivingConditions', 'Driving Conditions')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setDrivingCondition('normal')}
              className={`flex-1 py-2 rounded-lg font-medium ${
                drivingCondition === 'normal'
                  ? 'bg-teal-500 text-white'
                  : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {t('tools.oilChange.normal', 'Normal')}
            </button>
            <button
              onClick={() => setDrivingCondition('severe')}
              className={`flex-1 py-2 rounded-lg font-medium ${
                drivingCondition === 'severe'
                  ? 'bg-teal-500 text-white'
                  : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {t('tools.oilChange.severe', 'Severe')}
            </button>
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.oilChange.severeShortTripsExtremeTemps', 'Severe: Short trips, extreme temps, dusty conditions, towing, stop-and-go traffic')}
          </div>
        </div>

        {/* Progress Bars */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChange.oilLifeStatus', 'Oil Life Status')}</h4>

          {/* Miles Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.oilChange.mileage', 'Mileage')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {Math.round(calculations.milesDriven).toLocaleString()} / {calculations.mileInterval.toLocaleString()} miles
              </span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-full rounded-full transition-all ${
                  calculations.milePercentUsed > 100 ? 'bg-red-500'
                  : calculations.milePercentUsed > 80 ? 'bg-yellow-500'
                  : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, calculations.milePercentUsed)}%` }}
              />
            </div>
          </div>

          {/* Time Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.oilChange.time', 'Time')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {calculations.daysSinceChange} days / {calculations.monthInterval} months
              </span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-full rounded-full transition-all ${
                  calculations.timePercentUsed > 100 ? 'bg-red-500'
                  : calculations.timePercentUsed > 80 ? 'bg-yellow-500'
                  : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, calculations.timePercentUsed)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Next Oil Change Prediction */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.oilChange.nextChangeAt', 'Next Change At')}</div>
            <div className="text-2xl font-bold text-teal-500">
              {Math.round(calculations.nextChangeMileage).toLocaleString()}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>miles</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.oilChange.estimatedDate', 'Estimated Date')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.nextChangeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              ~{Math.round(calculations.monthsUntilDue * 30)} days
            </div>
          </div>
        </div>

        {/* Cost Calculator */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.oilChange.diyCostCalculator', 'DIY Cost Calculator')}</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.oilChange.oilCapacityQt', 'Oil Capacity (qt)')}
              </label>
              <input
                type="number"
                step="0.5"
                value={oilCapacity}
                onChange={(e) => setOilCapacity(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-1">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.oilChange.oilPriceQt', 'Oil Price/Qt')}
              </label>
              <input
                type="number"
                step="0.5"
                value={oilPricePerQuart}
                onChange={(e) => setOilPricePerQuart(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-1">
              <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.oilChange.filterPrice', 'Filter Price')}
              </label>
              <input
                type="number"
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.oilChange.perOilChange', 'Per Oil Change')}</span>
            <span className="text-xl font-bold text-teal-500">${calculations.oilChangeCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('tools.oilChange.estimatedAnnualCost', 'Estimated Annual Cost')}</span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>${calculations.annualCost.toFixed(2)}/year</span>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.oilChange.oilChangeTips', 'Oil Change Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.oilChange.checkYourOwnerSManual', 'Check your owner\'s manual for manufacturer recommendations')}</li>
                <li>{t('tools.oilChange.syntheticOilCostsMoreBut', 'Synthetic oil costs more but allows longer intervals')}</li>
                <li>{t('tools.oilChange.alwaysReplaceTheOilFilter', 'Always replace the oil filter with each change')}</li>
                <li>{t('tools.oilChange.checkOilLevelMonthlyBetween', 'Check oil level monthly between changes')}</li>
                <li>{t('tools.oilChange.darkOilColorAloneDoesn', 'Dark oil color alone doesn\'t mean it needs changing')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OilChangeTool;
