import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Plus, Trash2, Calculator, DollarSign, Clock, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface Appliance {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  quantity: number;
}

interface ElectricityUsageCalculatorToolProps {
  uiConfig?: UIConfig;
}

const commonAppliances = [
  { name: 'LED Light Bulb', watts: 10 },
  { name: 'Incandescent Bulb', watts: 60 },
  { name: 'Ceiling Fan', watts: 75 },
  { name: 'Laptop', watts: 50 },
  { name: 'Desktop Computer', watts: 200 },
  { name: 'TV (LED 50")', watts: 100 },
  { name: 'Refrigerator', watts: 150 },
  { name: 'Microwave', watts: 1000 },
  { name: 'Air Conditioner (Window)', watts: 1200 },
  { name: 'Central AC', watts: 3500 },
  { name: 'Space Heater', watts: 1500 },
  { name: 'Washing Machine', watts: 500 },
  { name: 'Dryer', watts: 3000 },
  { name: 'Dishwasher', watts: 1800 },
  { name: 'Hair Dryer', watts: 1500 },
  { name: 'Electric Oven', watts: 2500 },
  { name: 'Toaster', watts: 1100 },
  { name: 'Coffee Maker', watts: 1000 },
  { name: 'Water Heater', watts: 4500 },
  { name: 'Pool Pump', watts: 1500 },
  { name: 'Electric Vehicle Charger', watts: 7200 },
  { name: 'Gaming Console', watts: 150 },
  { name: 'Router/Modem', watts: 20 },
  { name: 'Phone Charger', watts: 5 },
];

export const ElectricityUsageCalculatorTool: React.FC<ElectricityUsageCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [appliances, setAppliances] = useState<Appliance[]>([
    { id: '1', name: 'LED Light Bulb', watts: 10, hoursPerDay: 6, quantity: 10 },
    { id: '2', name: 'Refrigerator', watts: 150, hoursPerDay: 24, quantity: 1 },
    { id: '3', name: 'TV (LED 50")', watts: 100, hoursPerDay: 4, quantity: 2 },
  ]);
  const [electricityRate, setElectricityRate] = useState('0.12');
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [newAppliance, setNewAppliance] = useState({ name: '', watts: '', hoursPerDay: '', quantity: '1' });
  const [selectedPreset, setSelectedPreset] = useState('');

  const addAppliance = () => {
    if (!newAppliance.name || !newAppliance.watts || !newAppliance.hoursPerDay) return;

    const appliance: Appliance = {
      id: Date.now().toString(),
      name: newAppliance.name,
      watts: parseFloat(newAppliance.watts) || 0,
      hoursPerDay: parseFloat(newAppliance.hoursPerDay) || 0,
      quantity: parseInt(newAppliance.quantity) || 1,
    };

    setAppliances([...appliances, appliance]);
    setNewAppliance({ name: '', watts: '', hoursPerDay: '', quantity: '1' });
    setShowAddAppliance(false);
    setSelectedPreset('');
  };

  const addPresetAppliance = (preset: typeof commonAppliances[0]) => {
    setNewAppliance({
      name: preset.name,
      watts: preset.watts.toString(),
      hoursPerDay: '4',
      quantity: '1',
    });
    setSelectedPreset(preset.name);
  };

  const removeAppliance = (id: string) => {
    setAppliances(appliances.filter((a) => a.id !== id));
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    setAppliances(
      appliances.map((a) =>
        a.id === id ? { ...a, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value } : a
      )
    );
  };

  const calculations = useMemo(() => {
    const rate = parseFloat(electricityRate) || 0.12;

    let totalDailyKwh = 0;
    const applianceBreakdown = appliances.map((a) => {
      const dailyKwh = (a.watts * a.hoursPerDay * a.quantity) / 1000;
      totalDailyKwh += dailyKwh;
      return {
        ...a,
        dailyKwh,
        dailyCost: dailyKwh * rate,
        monthlyKwh: dailyKwh * 30,
        monthlyCost: dailyKwh * 30 * rate,
        yearlyKwh: dailyKwh * 365,
        yearlyCost: dailyKwh * 365 * rate,
      };
    });

    const monthlyKwh = totalDailyKwh * 30;
    const yearlyKwh = totalDailyKwh * 365;

    return {
      applianceBreakdown,
      daily: {
        kwh: totalDailyKwh,
        cost: totalDailyKwh * rate,
      },
      monthly: {
        kwh: monthlyKwh,
        cost: monthlyKwh * rate,
      },
      yearly: {
        kwh: yearlyKwh,
        cost: yearlyKwh * rate,
      },
      topConsumers: [...applianceBreakdown].sort((a, b) => b.monthlyKwh - a.monthlyKwh).slice(0, 5),
    };
  }, [appliances, electricityRate]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Zap className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.electricityUsageCalculator.electricityUsageCalculator', 'Electricity Usage Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.electricityUsageCalculator.estimateYourEnergyConsumptionAnd', 'Estimate your energy consumption and costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Electricity Rate */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.electricityUsageCalculator.electricityRateKwh', 'Electricity Rate ($/kWh)')}
          </label>
          <input
            type="number"
            step="0.01"
            value={electricityRate}
            onChange={(e) => setElectricityRate(e.target.value)}
            placeholder="0.12"
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
          />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.electricityUsageCalculator.usAverage012Kwh', 'US average: $0.12/kWh (check your utility bill for exact rate)')}
          </p>
        </div>

        {/* Appliances List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.electricityUsageCalculator.yourAppliances', 'Your Appliances')}</h4>
            <button
              onClick={() => setShowAddAppliance(!showAddAppliance)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0D9488] text-white text-sm rounded-lg hover:bg-[#0F766E] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.electricityUsageCalculator.addAppliance', 'Add Appliance')}
            </button>
          </div>

          {/* Add Appliance Form */}
          {showAddAppliance && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.electricityUsageCalculator.quickAddFromPresets', 'Quick Add from Presets')}
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {commonAppliances.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => addPresetAppliance(preset)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedPreset === preset.name
                          ? 'bg-[#0D9488] text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {preset.name} ({preset.watts}W)
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityUsageCalculator.name', 'Name')}</label>
                  <input
                    type="text"
                    value={newAppliance.name}
                    onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                    placeholder={t('tools.electricityUsageCalculator.applianceName', 'Appliance name')}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityUsageCalculator.watts', 'Watts')}</label>
                  <input
                    type="number"
                    value={newAppliance.watts}
                    onChange={(e) => setNewAppliance({ ...newAppliance, watts: e.target.value })}
                    placeholder="100"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityUsageCalculator.hoursDay', 'Hours/Day')}</label>
                  <input
                    type="number"
                    value={newAppliance.hoursPerDay}
                    onChange={(e) => setNewAppliance({ ...newAppliance, hoursPerDay: e.target.value })}
                    placeholder="4"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityUsageCalculator.quantity', 'Quantity')}</label>
                  <input
                    type="number"
                    value={newAppliance.quantity}
                    onChange={(e) => setNewAppliance({ ...newAppliance, quantity: e.target.value })}
                    placeholder="1"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <button
                onClick={addAppliance}
                className="w-full py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                {t('tools.electricityUsageCalculator.addToList', 'Add to List')}
              </button>
            </div>
          )}

          {/* Appliances Table */}
          <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`grid grid-cols-12 gap-2 p-3 text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
              <div className="col-span-4">{t('tools.electricityUsageCalculator.appliance', 'Appliance')}</div>
              <div className="col-span-2 text-center">{t('tools.electricityUsageCalculator.watts2', 'Watts')}</div>
              <div className="col-span-2 text-center">{t('tools.electricityUsageCalculator.hours', 'Hours')}</div>
              <div className="col-span-1 text-center">{t('tools.electricityUsageCalculator.qty', 'Qty')}</div>
              <div className="col-span-2 text-center">{t('tools.electricityUsageCalculator.kwhMo', 'kWh/mo')}</div>
              <div className="col-span-1"></div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {appliances.map((appliance) => {
                const breakdown = calculations.applianceBreakdown.find((a) => a.id === appliance.id);
                return (
                  <div
                    key={appliance.id}
                    className={`grid grid-cols-12 gap-2 p-3 text-sm items-center ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'} border-t`}
                  >
                    <div className={`col-span-4 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{appliance.name}</div>
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
                        value={appliance.hoursPerDay}
                        onChange={(e) => updateAppliance(appliance.id, 'hoursPerDay', e.target.value)}
                        className={`w-full px-2 py-1 text-center text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        value={appliance.quantity}
                        onChange={(e) => updateAppliance(appliance.id, 'quantity', e.target.value)}
                        className={`w-full px-1 py-1 text-center text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div className={`col-span-2 text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {breakdown?.monthlyKwh.toFixed(1)}
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
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Results */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.electricityUsageCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calculator className="w-4 h-4 text-[#0D9488]" />
            {t('tools.electricityUsageCalculator.usageSummary', 'Usage Summary')}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.electricityUsageCalculator.daily', 'Daily')}</div>
              <div className="text-2xl font-bold text-[#0D9488]">{calculations.daily.kwh.toFixed(1)} kWh</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>${calculations.daily.cost.toFixed(2)}</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.electricityUsageCalculator.monthly', 'Monthly')}</div>
              <div className="text-2xl font-bold text-[#0D9488]">{calculations.monthly.kwh.toFixed(0)} kWh</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>${calculations.monthly.cost.toFixed(2)}</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.electricityUsageCalculator.yearly', 'Yearly')}</div>
              <div className="text-2xl font-bold text-[#0D9488]">{calculations.yearly.kwh.toFixed(0)} kWh</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>${calculations.yearly.cost.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Top Consumers */}
        {calculations.topConsumers.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.electricityUsageCalculator.topEnergyConsumers', 'Top Energy Consumers')}</h4>
            <div className="space-y-2">
              {calculations.topConsumers.map((consumer, index) => {
                const percentage = (consumer.monthlyKwh / calculations.monthly.kwh) * 100;
                return (
                  <div key={consumer.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {index + 1}. {consumer.name}
                      </span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {consumer.monthlyKwh.toFixed(1)} kWh ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-[#0D9488] rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.electricityUsageCalculator.energySavingTips', 'Energy Saving Tips:')}</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>{t('tools.electricityUsageCalculator.replaceIncandescentBulbsWithLeds', 'Replace incandescent bulbs with LEDs to save up to 80% on lighting')}</li>
                <li>{t('tools.electricityUsageCalculator.unplugDevicesWhenNotIn', 'Unplug devices when not in use to avoid phantom power draw')}</li>
                <li>{t('tools.electricityUsageCalculator.useSmartPowerStripsTo', 'Use smart power strips to completely cut power to devices')}</li>
                <li>{t('tools.electricityUsageCalculator.setYourAcTo78f', 'Set your AC to 78F in summer and 68F in winter for optimal efficiency')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricityUsageCalculatorTool;
