import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Clock, MapPin, DollarSign, Calendar, Info, Sparkles, Calculator, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ParkingOption {
  id: string;
  name: string;
  type: 'hourly' | 'daily' | 'monthly';
  rate: number;
  maxDaily?: number;
}

interface ParkingCostToolProps {
  uiConfig?: UIConfig;
}

export const ParkingCostTool: React.FC<ParkingCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'calculator' | 'compare'>('calculator');

  // Single calculation mode
  const [parkingType, setParkingType] = useState<'hourly' | 'daily' | 'event' | 'monthly'>('hourly');
  const [hourlyRate, setHourlyRate] = useState('3');
  const [dailyRate, setDailyRate] = useState('15');
  const [monthlyRate, setMonthlyRate] = useState('150');
  const [eventRate, setEventRate] = useState('25');
  const [hours, setHours] = useState('4');
  const [days, setDays] = useState('1');
  const [daysPerWeek, setDaysPerWeek] = useState('5');
  const [dailyMax, setDailyMax] = useState('20');
  const [hasDailyMax, setHasDailyMax] = useState(true);

  // Validation/meter mode
  const [meterTime, setMeterTime] = useState('120'); // minutes
  const [arrivalTime, setArrivalTime] = useState('09:00');
  const [departureTime, setDepartureTime] = useState('17:00');

  // Compare mode
  const [options, setOptions] = useState<ParkingOption[]>([
    { id: '1', name: 'Street Meter', type: 'hourly', rate: 2, maxDaily: 12 },
    { id: '2', name: 'Garage A', type: 'hourly', rate: 4, maxDaily: 20 },
    { id: '3', name: 'Lot B', type: 'daily', rate: 15 },
  ]);
  const [compareHours, setCompareHours] = useState('8');
  const [compareDays, setCompareDays] = useState('20');

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.hours !== undefined) {
        setHours(String(params.hours));
        setIsPrefilled(true);
      }
      if (params.rate !== undefined || params.hourlyRate !== undefined) {
        setHourlyRate(String(params.rate || params.hourlyRate));
        setIsPrefilled(true);
      }
      if (params.days !== undefined) {
        setDays(String(params.days));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate single parking cost
  const singleCalc = useMemo(() => {
    const hrRate = parseFloat(hourlyRate) || 0;
    const dayRate = parseFloat(dailyRate) || 0;
    const monthRate = parseFloat(monthlyRate) || 0;
    const evtRate = parseFloat(eventRate) || 0;
    const numHours = parseFloat(hours) || 0;
    const numDays = parseFloat(days) || 1;
    const perWeek = parseFloat(daysPerWeek) || 5;
    const maxDaily = parseFloat(dailyMax) || 0;

    let cost = 0;
    let breakdown = '';

    switch (parkingType) {
      case 'hourly':
        cost = hrRate * numHours;
        if (hasDailyMax && maxDaily > 0 && cost > maxDaily) {
          cost = maxDaily;
          breakdown = `Capped at daily max of $${maxDaily}`;
        } else {
          breakdown = `${numHours} hours x $${hrRate}/hr`;
        }
        break;
      case 'daily':
        cost = dayRate * numDays;
        breakdown = `${numDays} days x $${dayRate}/day`;
        break;
      case 'event':
        cost = evtRate;
        breakdown = `Flat event rate`;
        break;
      case 'monthly':
        cost = monthRate;
        breakdown = `Monthly pass`;
        break;
    }

    // Calculate weekly and monthly projections
    const dailyCost = parkingType === 'hourly'
      ? Math.min(hrRate * numHours, hasDailyMax && maxDaily > 0 ? maxDaily : Infinity)
      : parkingType === 'daily' ? dayRate : parkingType === 'monthly' ? monthRate / 22 : evtRate;

    const weeklyCost = dailyCost * perWeek;
    const monthlyCost = parkingType === 'monthly' ? monthRate : weeklyCost * 4.33;
    const yearlyCost = monthlyCost * 12;

    return {
      cost,
      breakdown,
      dailyCost,
      weeklyCost,
      monthlyCost,
      yearlyCost,
    };
  }, [parkingType, hourlyRate, dailyRate, monthlyRate, eventRate, hours, days, daysPerWeek, dailyMax, hasDailyMax]);

  // Meter expiration calculation
  const meterCalc = useMemo(() => {
    const minutes = parseInt(meterTime) || 0;
    const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
    const [depHour, depMin] = departureTime.split(':').map(Number);

    const arrivalMinutes = arrHour * 60 + arrMin;
    const departureMinutes = depHour * 60 + depMin;
    const totalMinutes = departureMinutes - arrivalMinutes;

    const expiresAt = new Date();
    expiresAt.setHours(arrHour, arrMin + minutes, 0, 0);

    const refillsNeeded = Math.max(0, Math.ceil(totalMinutes / minutes) - 1);
    const hoursParked = totalMinutes / 60;

    return {
      expiresAt: expiresAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      totalMinutes,
      refillsNeeded,
      hoursParked,
    };
  }, [meterTime, arrivalTime, departureTime]);

  // Compare calculations
  const compareCalc = useMemo(() => {
    const hrs = parseFloat(compareHours) || 0;
    const dys = parseFloat(compareDays) || 1;

    return options.map((opt) => {
      let dailyCost = 0;
      if (opt.type === 'hourly') {
        dailyCost = opt.rate * hrs;
        if (opt.maxDaily && dailyCost > opt.maxDaily) {
          dailyCost = opt.maxDaily;
        }
      } else if (opt.type === 'daily') {
        dailyCost = opt.rate;
      } else {
        dailyCost = opt.rate / 22; // Monthly prorated
      }

      const totalCost = dailyCost * dys;
      const monthlyCost = opt.type === 'monthly' ? opt.rate : dailyCost * 22;

      return {
        ...opt,
        dailyCost,
        totalCost,
        monthlyCost,
      };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }, [options, compareHours, compareDays]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const addOption = () => {
    setOptions([
      ...options,
      {
        id: Date.now().toString(),
        name: `Option ${options.length + 1}`,
        type: 'hourly',
        rate: 5,
      },
    ]);
  };

  const updateOption = (id: string, field: keyof ParkingOption, value: string | number) => {
    setOptions(options.map((opt) =>
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
  };

  const removeOption = (id: string) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Car className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.parkingCost.parkingCostCalculator', 'Parking Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.parkingCost.calculateAndCompareParkingCosts', 'Calculate and compare parking costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.parkingCost.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('calculator')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === 'calculator' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Calculator className="w-4 h-4" /> Calculator
          </button>
          <button
            onClick={() => setMode('compare')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === 'compare' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Compare Options
          </button>
        </div>

        {mode === 'calculator' ? (
          <>
            {/* Parking Type Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <MapPin className="w-4 h-4 inline mr-1" />
                {t('tools.parkingCost.parkingType', 'Parking Type')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'hourly', label: 'Hourly' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'event', label: 'Event' },
                  { value: 'monthly', label: 'Monthly' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setParkingType(opt.value as typeof parkingType)}
                    className={`py-2 rounded-lg text-sm font-medium ${
                      parkingType === opt.value
                        ? 'bg-teal-500 text-white'
                        : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate and Duration Inputs */}
            <div className="grid grid-cols-2 gap-4">
              {parkingType === 'hourly' && (
                <>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      {t('tools.parkingCost.hourlyRate', 'Hourly Rate')}
                    </label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                      <input
                        type="number"
                        step="0.5"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {t('tools.parkingCost.hours', 'Hours')}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </>
              )}

              {parkingType === 'daily' && (
                <>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      {t('tools.parkingCost.dailyRate', 'Daily Rate')}
                    </label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                      <input
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value)}
                        className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t('tools.parkingCost.numberOfDays', 'Number of Days')}
                    </label>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </>
              )}

              {parkingType === 'event' && (
                <div className="col-span-2 space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    {t('tools.parkingCost.eventParkingRate', 'Event Parking Rate')}
                  </label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                    <input
                      type="number"
                      value={eventRate}
                      onChange={(e) => setEventRate(e.target.value)}
                      className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              )}

              {parkingType === 'monthly' && (
                <div className="col-span-2 space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    {t('tools.parkingCost.monthlyRate', 'Monthly Rate')}
                  </label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                    <input
                      type="number"
                      value={monthlyRate}
                      onChange={(e) => setMonthlyRate(e.target.value)}
                      className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Daily Max Option (for hourly) */}
            {parkingType === 'hourly' && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDailyMax}
                    onChange={(e) => setHasDailyMax(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-500"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.parkingCost.dailyMaximum', 'Daily maximum')}</span>
                </label>
                {hasDailyMax && (
                  <div className="relative flex-1">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                    <input
                      type="number"
                      value={dailyMax}
                      onChange={(e) => setDailyMax(e.target.value)}
                      className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Days per week (for projections) */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.parkingCost.daysPerWeekForProjections', 'Days per Week (for projections)')}
              </label>
              <div className="flex gap-2">
                {['1', '2', '3', '4', '5', '6', '7'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDaysPerWeek(d)}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      daysPerWeek === d
                        ? 'bg-teal-500 text-white'
                        : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.parkingCost', 'Parking Cost')}</div>
              <div className="text-5xl font-bold text-teal-500 my-2">
                {formatCurrency(singleCalc.cost)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {singleCalc.breakdown}
              </div>
            </div>

            {/* Projections */}
            <div className="grid grid-cols-4 gap-4">
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.daily', 'Daily')}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(singleCalc.dailyCost)}
                </div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.weekly', 'Weekly')}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(singleCalc.weeklyCost)}
                </div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.monthly', 'Monthly')}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(singleCalc.monthlyCost)}
                </div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.yearly', 'Yearly')}</div>
                <div className="text-lg font-bold text-teal-500">
                  {formatCurrency(singleCalc.yearlyCost)}
                </div>
              </div>
            </div>

            {/* Meter Timer */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-teal-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.parkingCost.meterExpirationCalculator', 'Meter Expiration Calculator')}</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.meterTimeMin', 'Meter Time (min)')}</label>
                  <input
                    type="number"
                    value={meterTime}
                    onChange={(e) => setMeterTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.arrivalTime', 'Arrival Time')}</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.departureTime', 'Departure Time')}</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} grid grid-cols-3 gap-4 text-center`}>
                <div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.expiresAt', 'Expires At')}</div>
                  <div className={`font-bold text-teal-500`}>{meterCalc.expiresAt}</div>
                </div>
                <div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.totalTime', 'Total Time')}</div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{meterCalc.hoursParked.toFixed(1)} hrs</div>
                </div>
                <div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.parkingCost.refillsNeeded', 'Refills Needed')}</div>
                  <div className={`font-bold ${meterCalc.refillsNeeded > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {meterCalc.refillsNeeded}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Compare Mode */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.parkingCost.hoursPerDay', 'Hours per Day')}
                </label>
                <input
                  type="number"
                  value={compareHours}
                  onChange={(e) => setCompareHours(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.parkingCost.daysPerMonth', 'Days per Month')}
                </label>
                <input
                  type="number"
                  value={compareDays}
                  onChange={(e) => setCompareDays(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {/* Parking Options */}
            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={opt.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-green-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => updateOption(opt.id, 'name', e.target.value)}
                      className={`flex-1 px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={() => removeOption(opt.id)}
                      className="text-red-500 text-sm"
                    >
                      {t('tools.parkingCost.remove', 'Remove')}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={opt.type}
                      onChange={(e) => updateOption(opt.id, 'type', e.target.value)}
                      className={`px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="hourly">{t('tools.parkingCost.hourly', 'Hourly')}</option>
                      <option value="daily">{t('tools.parkingCost.daily2', 'Daily')}</option>
                      <option value="monthly">{t('tools.parkingCost.monthly2', 'Monthly')}</option>
                    </select>
                    <input
                      type="number"
                      value={opt.rate}
                      onChange={(e) => updateOption(opt.id, 'rate', parseFloat(e.target.value) || 0)}
                      placeholder={t('tools.parkingCost.rate', 'Rate')}
                      className={`px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    {opt.type === 'hourly' && (
                      <input
                        type="number"
                        value={opt.maxDaily || ''}
                        onChange={(e) => updateOption(opt.id, 'maxDaily', parseFloat(e.target.value) || undefined)}
                        placeholder={t('tools.parkingCost.maxDaily', 'Max Daily')}
                        className={`px-2 py-1 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={addOption}
                className={`w-full py-2 rounded-lg font-medium ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('tools.parkingCost.addOption', '+ Add Option')}
              </button>
            </div>

            {/* Comparison Results */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cost Comparison ({compareDays} days)
              </h4>
              <div className="space-y-2">
                {compareCalc.map((opt, idx) => (
                  <div key={opt.id} className={`flex items-center justify-between p-3 rounded-lg ${
                    idx === 0 ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200' : ''
                  } ${idx === 0 ? 'border' : ''}`}>
                    <div className="flex items-center gap-2">
                      {idx === 0 && <span className="text-green-500 text-xs font-medium">{t('tools.parkingCost.best', 'BEST')}</span>}
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{opt.name}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        (${opt.rate}/{opt.type === 'hourly' ? 'hr' : opt.type === 'daily' ? 'day' : 'mo'})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${idx === 0 ? 'text-green-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(opt.totalCost)}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatCurrency(opt.monthlyCost)}/mo
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.parkingCost.parkingTips', 'Parking Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.parkingCost.monthlyPassesOftenSaveMoney', 'Monthly passes often save money if you park 15+ days/month')}</li>
                <li>{t('tools.parkingCost.lookForEarlyBirdSpecials', 'Look for early bird specials (in before 9am)')}</li>
                <li>{t('tools.parkingCost.checkForValidationOptionsWith', 'Check for validation options with nearby businesses')}</li>
                <li>{t('tools.parkingCost.useParkingAppsForReal', 'Use parking apps for real-time rates and availability')}</li>
                <li>{t('tools.parkingCost.streetParkingMayBeFree', 'Street parking may be free after certain hours')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingCostTool;
