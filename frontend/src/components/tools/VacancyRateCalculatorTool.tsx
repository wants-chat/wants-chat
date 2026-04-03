import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, DollarSign, TrendingDown, Info, Sparkles, Calculator, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface VacancyRateCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const VacancyRateCalculatorTool: React.FC<VacancyRateCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [calculationMode, setCalculationMode] = useState<'units' | 'days' | 'historical'>('units');

  // Units mode
  const [totalUnits, setTotalUnits] = useState('10');
  const [vacantUnits, setVacantUnits] = useState('1');
  const [monthlyRent, setMonthlyRent] = useState('1500');

  // Days mode
  const [totalDays, setTotalDays] = useState('365');
  const [vacantDays, setVacantDays] = useState('30');
  const [dailyRent, setDailyRent] = useState('50');

  // Historical mode
  const [monthlyData, setMonthlyData] = useState<{ occupied: string; vacant: string }[]>([
    { occupied: '10', vacant: '0' },
    { occupied: '9', vacant: '1' },
    { occupied: '10', vacant: '0' },
    { occupied: '8', vacant: '2' },
    { occupied: '9', vacant: '1' },
    { occupied: '10', vacant: '0' },
    { occupied: '10', vacant: '0' },
    { occupied: '9', vacant: '1' },
    { occupied: '10', vacant: '0' },
    { occupied: '10', vacant: '0' },
    { occupied: '9', vacant: '1' },
    { occupied: '10', vacant: '0' },
  ]);

  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.units !== undefined) {
        setTotalUnits(String(params.units));
        setIsPrefilled(true);
      }
      if (params.rent !== undefined) {
        setMonthlyRent(String(params.rent));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    if (calculationMode === 'units') {
      const total = parseInt(totalUnits) || 0;
      const vacant = parseInt(vacantUnits) || 0;
      const rent = parseFloat(monthlyRent) || 0;

      const vacancyRate = total > 0 ? (vacant / total) * 100 : 0;
      const occupancyRate = 100 - vacancyRate;
      const potentialRent = total * rent;
      const actualRent = (total - vacant) * rent;
      const lostRent = vacant * rent;
      const annualLostRent = lostRent * 12;

      return {
        vacancyRate,
        occupancyRate,
        potentialRent,
        actualRent,
        lostRent,
        annualLostRent,
        occupied: total - vacant,
        vacant,
        total,
      };
    } else if (calculationMode === 'days') {
      const total = parseInt(totalDays) || 0;
      const vacant = parseInt(vacantDays) || 0;
      const rent = parseFloat(dailyRent) || 0;

      const vacancyRate = total > 0 ? (vacant / total) * 100 : 0;
      const occupancyRate = 100 - vacancyRate;
      const potentialRent = total * rent;
      const actualRent = (total - vacant) * rent;
      const lostRent = vacant * rent;

      return {
        vacancyRate,
        occupancyRate,
        potentialRent,
        actualRent,
        lostRent,
        annualLostRent: lostRent,
        occupied: total - vacant,
        vacant,
        total,
      };
    } else {
      // Historical mode
      let totalOccupied = 0;
      let totalVacant = 0;
      const rent = parseFloat(monthlyRent) || 0;

      monthlyData.forEach((month) => {
        totalOccupied += parseInt(month.occupied) || 0;
        totalVacant += parseInt(month.vacant) || 0;
      });

      const totalUnitMonths = totalOccupied + totalVacant;
      const vacancyRate = totalUnitMonths > 0 ? (totalVacant / totalUnitMonths) * 100 : 0;
      const occupancyRate = 100 - vacancyRate;
      const lostRent = totalVacant * rent;

      // Calculate average units per month
      const avgUnitsPerMonth = totalUnitMonths / 12;

      return {
        vacancyRate,
        occupancyRate,
        potentialRent: totalUnitMonths * rent,
        actualRent: totalOccupied * rent,
        lostRent,
        annualLostRent: lostRent,
        occupied: totalOccupied,
        vacant: totalVacant,
        total: avgUnitsPerMonth,
      };
    }
  }, [calculationMode, totalUnits, vacantUnits, monthlyRent, totalDays, vacantDays, dailyRent, monthlyData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getVacancyRating = (rate: number) => {
    if (rate <= 3) return { label: 'Excellent', color: 'text-green-500', bgColor: 'bg-green-500' };
    if (rate <= 5) return { label: 'Very Good', color: 'text-[#0D9488]', bgColor: 'bg-[#0D9488]' };
    if (rate <= 8) return { label: 'Good', color: 'text-blue-500', bgColor: 'bg-blue-500' };
    if (rate <= 10) return { label: 'Average', color: 'text-amber-500', bgColor: 'bg-amber-500' };
    return { label: 'High', color: 'text-red-500', bgColor: 'bg-red-500' };
  };

  const rating = getVacancyRating(calculations.vacancyRate);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const updateMonthlyData = (index: number, field: 'occupied' | 'vacant', value: string) => {
    const newData = [...monthlyData];
    newData[index] = { ...newData[index], [field]: value };
    setMonthlyData(newData);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Home className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vacancyRateCalculator.vacancyRateCalculator', 'Vacancy Rate Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.vacancyRateCalculator.calculatePropertyVacancyAndLost', 'Calculate property vacancy and lost income')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.vacancyRateCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Calculation Mode */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calculator className="w-4 h-4 inline mr-1" />
            {t('tools.vacancyRateCalculator.calculationMethod', 'Calculation Method')}
          </label>
          <div className="flex gap-2">
            {[
              { value: 'units', label: 'By Units' },
              { value: 'days', label: 'By Days' },
              { value: 'historical', label: '12-Month History' },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setCalculationMode(mode.value as any)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  calculationMode === mode.value
                    ? 'bg-[#0D9488] text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Units Mode Inputs */}
        {calculationMode === 'units' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Users className="w-4 h-4 inline mr-1" />
                {t('tools.vacancyRateCalculator.totalUnits', 'Total Units')}
              </label>
              <input
                type="number"
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.vacancyRateCalculator.vacantUnits', 'Vacant Units')}
              </label>
              <input
                type="number"
                value={vacantUnits}
                onChange={(e) => setVacantUnits(e.target.value)}
                max={totalUnits}
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <DollarSign className="w-4 h-4 inline mr-1" />
                {t('tools.vacancyRateCalculator.monthlyRentUnit', 'Monthly Rent/Unit')}
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Days Mode Inputs */}
        {calculationMode === 'days' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('tools.vacancyRateCalculator.totalDays', 'Total Days')}
              </label>
              <input
                type="number"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.vacancyRateCalculator.vacantDays', 'Vacant Days')}
              </label>
              <input
                type="number"
                value={vacantDays}
                onChange={(e) => setVacantDays(e.target.value)}
                max={totalDays}
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <DollarSign className="w-4 h-4 inline mr-1" />
                {t('tools.vacancyRateCalculator.dailyRent', 'Daily Rent')}
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={dailyRent}
                  onChange={(e) => setDailyRent(e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Historical Mode Inputs */}
        {calculationMode === 'historical' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <DollarSign className="w-4 h-4 inline mr-1" />
                {t('tools.vacancyRateCalculator.monthlyRentUnit2', 'Monthly Rent/Unit')}
              </label>
              <div className="relative w-48">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.vacancyRateCalculator.monthlyUnitData', 'Monthly Unit Data')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {monthlyData.map((month, index) => (
                  <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{monthNames[index]}</div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-green-500">{t('tools.vacancyRateCalculator.occ', 'Occ')}</label>
                        <input
                          type="number"
                          value={month.occupied}
                          onChange={(e) => updateMonthlyData(index, 'occupied', e.target.value)}
                          className={`w-full px-2 py-1 text-sm rounded border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-red-500">{t('tools.vacancyRateCalculator.vac', 'Vac')}</label>
                        <input
                          type="number"
                          value={month.vacant}
                          onChange={(e) => updateMonthlyData(index, 'vacant', e.target.value)}
                          className={`w-full px-2 py-1 text-sm rounded border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vacancy Rate Result */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="text-center mb-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacancyRateCalculator.vacancyRate', 'Vacancy Rate')}</div>
            <div className={`text-5xl font-bold ${rating.color}`}>
              {calculations.vacancyRate.toFixed(1)}%
            </div>
            <div className={`text-lg ${rating.color}`}>{rating.label}</div>
          </div>

          {/* Visual Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Occupied: {calculations.occupancyRate.toFixed(1)}%</span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Vacant: {calculations.vacancyRate.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#0D9488]"
                style={{ width: `${calculations.occupancyRate}%` }}
              />
              <div
                className="h-full bg-red-500"
                style={{ width: `${calculations.vacancyRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Financial Impact */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacancyRateCalculator.potentialIncome', 'Potential Income')}</div>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(calculations.potentialRent)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculationMode === 'historical' ? t('tools.vacancyRateCalculator.annualIf100Occupied', 'Annual (if 100% occupied)') : t('tools.vacancyRateCalculator.monthlyIf100Occupied', 'Monthly (if 100% occupied)')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacancyRateCalculator.actualIncome', 'Actual Income')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">{formatCurrency(calculations.actualRent)}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculationMode === 'historical' ? t('tools.vacancyRateCalculator.annual', 'Annual') : t('tools.vacancyRateCalculator.monthly', 'Monthly')}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h4 className={`font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>{t('tools.vacancyRateCalculator.lostIncomeDueToVacancy', 'Lost Income Due to Vacancy')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {calculationMode === 'historical' ? t('tools.vacancyRateCalculator.annualLoss', 'Annual Loss') : t('tools.vacancyRateCalculator.monthlyLoss', 'Monthly Loss')}
              </div>
              <div className="text-2xl font-bold text-red-500">{formatCurrency(calculations.lostRent)}</div>
            </div>
            {calculationMode !== 'historical' && (
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vacancyRateCalculator.projectedAnnualLoss', 'Projected Annual Loss')}</div>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(calculations.annualLostRent)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Market Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.vacancyRateCalculator.typicalVacancyRatesByMarket', 'Typical Vacancy Rates by Market')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'Class A', rate: '3-5%' },
              { type: 'Class B', rate: '5-8%' },
              { type: 'Class C', rate: '8-12%' },
              { type: 'Student Housing', rate: '5-10%' },
            ].map((item) => (
              <div key={item.type} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.type}</div>
                <div className="text-[#0D9488] font-bold">{item.rate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.vacancyRateCalculator.formula', 'Formula:')}</strong> Vacancy Rate = (Vacant Units / Total Units) x 100. A healthy vacancy rate is typically 5-8%. Lower rates indicate strong demand, while higher rates may suggest rent is too high or property needs improvements.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacancyRateCalculatorTool;
