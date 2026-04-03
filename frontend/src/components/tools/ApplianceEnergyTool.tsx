import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plug, Plus, Trash2, DollarSign, Zap, Clock, Info, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface ApplianceEnergyToolProps {
  uiConfig?: UIConfig;
}

interface Appliance {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  daysPerWeek: number;
}

const commonAppliances = [
  { name: 'Refrigerator', watts: 150, hoursPerDay: 24, daysPerWeek: 7 },
  { name: 'Freezer', watts: 100, hoursPerDay: 24, daysPerWeek: 7 },
  { name: 'Microwave', watts: 1000, hoursPerDay: 0.5, daysPerWeek: 7 },
  { name: 'Electric Oven', watts: 2500, hoursPerDay: 1, daysPerWeek: 5 },
  { name: 'Dishwasher', watts: 1800, hoursPerDay: 1, daysPerWeek: 5 },
  { name: 'Washing Machine', watts: 500, hoursPerDay: 1, daysPerWeek: 3 },
  { name: 'Clothes Dryer', watts: 3000, hoursPerDay: 1, daysPerWeek: 3 },
  { name: 'TV (55" LED)', watts: 100, hoursPerDay: 4, daysPerWeek: 7 },
  { name: 'Gaming Console', watts: 150, hoursPerDay: 2, daysPerWeek: 5 },
  { name: 'Desktop Computer', watts: 200, hoursPerDay: 6, daysPerWeek: 7 },
  { name: 'Laptop', watts: 50, hoursPerDay: 6, daysPerWeek: 7 },
  { name: 'Router/Modem', watts: 20, hoursPerDay: 24, daysPerWeek: 7 },
  { name: 'Air Conditioner (Window)', watts: 1200, hoursPerDay: 8, daysPerWeek: 7 },
  { name: 'Central AC', watts: 3500, hoursPerDay: 6, daysPerWeek: 7 },
  { name: 'Space Heater', watts: 1500, hoursPerDay: 4, daysPerWeek: 7 },
  { name: 'Ceiling Fan', watts: 75, hoursPerDay: 8, daysPerWeek: 7 },
  { name: 'Hair Dryer', watts: 1500, hoursPerDay: 0.25, daysPerWeek: 7 },
  { name: 'Coffee Maker', watts: 1000, hoursPerDay: 0.5, daysPerWeek: 7 },
  { name: 'Toaster', watts: 1100, hoursPerDay: 0.1, daysPerWeek: 7 },
  { name: 'Electric Kettle', watts: 1500, hoursPerDay: 0.25, daysPerWeek: 7 },
  { name: 'Vacuum Cleaner', watts: 1000, hoursPerDay: 0.5, daysPerWeek: 2 },
  { name: 'Iron', watts: 1000, hoursPerDay: 0.5, daysPerWeek: 2 },
  { name: 'Water Heater', watts: 4500, hoursPerDay: 3, daysPerWeek: 7 },
  { name: 'Pool Pump', watts: 1500, hoursPerDay: 8, daysPerWeek: 7 },
  { name: 'Hot Tub', watts: 6000, hoursPerDay: 3, daysPerWeek: 7 },
];

export const ApplianceEnergyTool: React.FC<ApplianceEnergyToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [appliances, setAppliances] = useState<Appliance[]>([
    { id: '1', name: 'Refrigerator', watts: 150, hoursPerDay: 24, daysPerWeek: 7 },
    { id: '2', name: 'TV (55" LED)', watts: 100, hoursPerDay: 4, daysPerWeek: 7 },
    { id: '3', name: 'Washing Machine', watts: 500, hoursPerDay: 1, daysPerWeek: 3 },
  ]);
  const [electricityRate, setElectricityRate] = useState('0.12');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');

  const addAppliance = (preset?: typeof commonAppliances[0]) => {
    const newAppliance: Appliance = {
      id: Date.now().toString(),
      name: preset?.name || 'New Appliance',
      watts: preset?.watts || 100,
      hoursPerDay: preset?.hoursPerDay || 1,
      daysPerWeek: preset?.daysPerWeek || 7,
    };
    setAppliances([...appliances, newAppliance]);
    setShowAddForm(false);
    setSelectedPreset('');
  };

  const removeAppliance = (id: string) => {
    setAppliances(appliances.filter((a) => a.id !== id));
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    setAppliances(
      appliances.map((a) =>
        a.id === id ? { ...a, [field]: typeof value === 'string' && field !== 'name' ? parseFloat(value) || 0 : value } : a
      )
    );
  };

  const calculations = useMemo(() => {
    const rate = parseFloat(electricityRate) || 0.12;

    const applianceData = appliances.map((a) => {
      const weeklyHours = a.hoursPerDay * a.daysPerWeek;
      const monthlyHours = weeklyHours * 4.33; // Average weeks per month
      const yearlyHours = weeklyHours * 52;

      const dailyKwh = (a.watts * a.hoursPerDay) / 1000;
      const weeklyKwh = (a.watts * weeklyHours) / 1000;
      const monthlyKwh = (a.watts * monthlyHours) / 1000;
      const yearlyKwh = (a.watts * yearlyHours) / 1000;

      return {
        ...a,
        dailyKwh,
        weeklyKwh,
        monthlyKwh,
        yearlyKwh,
        dailyCost: dailyKwh * rate,
        weeklyCost: weeklyKwh * rate,
        monthlyCost: monthlyKwh * rate,
        yearlyCost: yearlyKwh * rate,
      };
    });

    const totals = applianceData.reduce(
      (acc, curr) => ({
        dailyKwh: acc.dailyKwh + curr.dailyKwh,
        weeklyKwh: acc.weeklyKwh + curr.weeklyKwh,
        monthlyKwh: acc.monthlyKwh + curr.monthlyKwh,
        yearlyKwh: acc.yearlyKwh + curr.yearlyKwh,
        dailyCost: acc.dailyCost + curr.dailyCost,
        weeklyCost: acc.weeklyCost + curr.weeklyCost,
        monthlyCost: acc.monthlyCost + curr.monthlyCost,
        yearlyCost: acc.yearlyCost + curr.yearlyCost,
      }),
      { dailyKwh: 0, weeklyKwh: 0, monthlyKwh: 0, yearlyKwh: 0, dailyCost: 0, weeklyCost: 0, monthlyCost: 0, yearlyCost: 0 }
    );

    // Sort by monthly cost for top consumers
    const topConsumers = [...applianceData].sort((a, b) => b.monthlyCost - a.monthlyCost);

    return {
      appliances: applianceData,
      totals,
      topConsumers,
    };
  }, [appliances, electricityRate]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Plug className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.applianceEnergy.applianceEnergyCostCalculator', 'Appliance Energy Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.applianceEnergy.calculateEnergyCostsForIndividual', 'Calculate energy costs for individual appliances')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Electricity Rate */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.applianceEnergy.electricityRateKwh', 'Electricity Rate ($/kWh)')}
          </label>
          <input
            type="number"
            step="0.01"
            value={electricityRate}
            onChange={(e) => setElectricityRate(e.target.value)}
            placeholder="0.12"
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
          />
        </div>

        {/* Summary Cards */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.applianceEnergy.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-4 h-4 text-[#0D9488]" />
            {t('tools.applianceEnergy.totalEnergyCostSummary', 'Total Energy Cost Summary')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.applianceEnergy.daily', 'Daily')}</div>
              <div className="text-lg font-bold text-[#0D9488]">${calculations.totals.dailyCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.totals.dailyKwh.toFixed(2)} kWh</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.applianceEnergy.weekly', 'Weekly')}</div>
              <div className="text-lg font-bold text-[#0D9488]">${calculations.totals.weeklyCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.totals.weeklyKwh.toFixed(1)} kWh</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.applianceEnergy.monthly', 'Monthly')}</div>
              <div className="text-lg font-bold text-[#0D9488]">${calculations.totals.monthlyCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.totals.monthlyKwh.toFixed(0)} kWh</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.applianceEnergy.yearly', 'Yearly')}</div>
              <div className="text-lg font-bold text-[#0D9488]">${calculations.totals.yearlyCost.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.totals.yearlyKwh.toFixed(0)} kWh</div>
            </div>
          </div>
        </div>

        {/* Add Appliance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.applianceEnergy.yourAppliances', 'Your Appliances')}</h4>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0D9488] text-white text-sm rounded-lg hover:bg-[#0F766E] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.applianceEnergy.addAppliance', 'Add Appliance')}
            </button>
          </div>

          {showAddForm && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.applianceEnergy.chooseFromPresets', 'Choose from Presets')}
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto mb-3">
                {commonAppliances.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => addAppliance(preset)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => addAppliance()}
                className={`w-full py-2 text-sm rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('tools.applianceEnergy.addCustomAppliance', 'Add Custom Appliance')}
              </button>
            </div>
          )}
        </div>

        {/* Appliances Table */}
        <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`grid grid-cols-12 gap-2 p-3 text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
            <div className="col-span-3">{t('tools.applianceEnergy.appliance', 'Appliance')}</div>
            <div className="col-span-2 text-center">{t('tools.applianceEnergy.watts', 'Watts')}</div>
            <div className="col-span-2 text-center">{t('tools.applianceEnergy.hrsDay', 'Hrs/Day')}</div>
            <div className="col-span-2 text-center">{t('tools.applianceEnergy.daysWk', 'Days/Wk')}</div>
            <div className="col-span-2 text-center">$/Month</div>
            <div className="col-span-1"></div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {calculations.appliances.map((appliance) => (
              <div
                key={appliance.id}
                className={`grid grid-cols-12 gap-2 p-3 text-sm items-center ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'} border-t`}
              >
                <div className="col-span-3">
                  <input
                    type="text"
                    value={appliance.name}
                    onChange={(e) => updateAppliance(appliance.id, 'name', e.target.value)}
                    className={`w-full px-2 py-1 text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={appliance.watts}
                    onChange={(e) => updateAppliance(appliance.id, 'watts', e.target.value)}
                    className={`w-full px-2 py-1 text-center text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.5"
                    value={appliance.hoursPerDay}
                    onChange={(e) => updateAppliance(appliance.id, 'hoursPerDay', e.target.value)}
                    className={`w-full px-2 py-1 text-center text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={appliance.daysPerWeek}
                    onChange={(e) => updateAppliance(appliance.id, 'daysPerWeek', e.target.value)}
                    className={`w-full px-2 py-1 text-center text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className={`col-span-2 text-center font-medium ${isDark ? t('tools.applianceEnergy.text0d9488', 'text-[#0D9488]') : t('tools.applianceEnergy.text0d94882', 'text-[#0D9488]')}`}>
                  ${appliance.monthlyCost.toFixed(2)}
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeAppliance(appliance.id)}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Energy Consumers */}
        {calculations.topConsumers.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Zap className="w-4 h-4 text-amber-500" />
              {t('tools.applianceEnergy.topEnergyConsumers', 'Top Energy Consumers')}
            </h4>
            <div className="space-y-3">
              {calculations.topConsumers.slice(0, 5).map((appliance, index) => {
                const percentage = calculations.totals.monthlyCost > 0 ? (appliance.monthlyCost / calculations.totals.monthlyCost) * 100 : 0;
                return (
                  <div key={appliance.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {index + 1}. {appliance.name}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ${appliance.monthlyCost.toFixed(2)}/mo ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-gradient-to-r from-[#0D9488] to-[#0F766E] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Cost Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Clock className="w-4 h-4 text-[#0D9488]" />
            {t('tools.applianceEnergy.detailedBreakdownByAppliance', 'Detailed Breakdown by Appliance')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <th className="text-left py-2">{t('tools.applianceEnergy.appliance2', 'Appliance')}</th>
                  <th className="text-right py-2">{t('tools.applianceEnergy.daily2', 'Daily')}</th>
                  <th className="text-right py-2">{t('tools.applianceEnergy.weekly2', 'Weekly')}</th>
                  <th className="text-right py-2">{t('tools.applianceEnergy.monthly2', 'Monthly')}</th>
                  <th className="text-right py-2">{t('tools.applianceEnergy.yearly2', 'Yearly')}</th>
                </tr>
              </thead>
              <tbody>
                {calculations.appliances.map((a) => (
                  <tr key={a.id} className={`${isDark ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                    <td className={`py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{a.name}</td>
                    <td className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${a.dailyCost.toFixed(2)}</td>
                    <td className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${a.weeklyCost.toFixed(2)}</td>
                    <td className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${a.monthlyCost.toFixed(2)}</td>
                    <td className={`text-right font-medium ${isDark ? t('tools.applianceEnergy.text0d94883', 'text-[#0D9488]') : t('tools.applianceEnergy.text0d94884', 'text-[#0D9488]')}`}>${a.yearlyCost.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className={`${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-100'} border-t font-medium`}>
                  <td className={`py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.applianceEnergy.total', 'TOTAL')}</td>
                  <td className={`text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.totals.dailyCost.toFixed(2)}</td>
                  <td className={`text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.totals.weeklyCost.toFixed(2)}</td>
                  <td className={`text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.totals.monthlyCost.toFixed(2)}</td>
                  <td className={`text-right text-[#0D9488]`}>${calculations.totals.yearlyCost.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.applianceEnergy.energySavingTips', 'Energy Saving Tips:')}</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>{t('tools.applianceEnergy.unplugDevicesWhenNotIn', 'Unplug devices when not in use to avoid standby power consumption')}</li>
                <li>{t('tools.applianceEnergy.useSmartPowerStripsTo', 'Use smart power strips to eliminate phantom loads')}</li>
                <li>{t('tools.applianceEnergy.replaceOldAppliancesWithEnergy', 'Replace old appliances with ENERGY STAR rated models')}</li>
                <li>{t('tools.applianceEnergy.runDishwashersAndWashingMachines', 'Run dishwashers and washing machines with full loads')}</li>
                <li>{t('tools.applianceEnergy.useColdWaterForLaundry', 'Use cold water for laundry when possible')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplianceEnergyTool;
