import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Plus, Trash2, Lightbulb, DollarSign, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Appliance {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  quantity: number;
}

interface ElectricityBillToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Appliance', type: 'string' },
  { key: 'watts', header: 'Watts', type: 'number' },
  { key: 'hoursPerDay', header: 'Hours/Day', type: 'number' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'dailyKwh', header: 'Daily kWh', type: 'number' },
  { key: 'monthlyKwh', header: 'Monthly kWh', type: 'number' },
  { key: 'dailyCost', header: 'Daily Cost', type: 'currency' },
  { key: 'monthlyCost', header: 'Monthly Cost', type: 'currency' },
  { key: 'yearlyCost', header: 'Yearly Cost', type: 'currency' },
];

const DEFAULT_APPLIANCES: Appliance[] = [
  { id: '1', name: 'LED Light', watts: 10, hoursPerDay: 5, quantity: 10 },
  { id: '2', name: 'Refrigerator', watts: 150, hoursPerDay: 24, quantity: 1 },
  { id: '3', name: 'Air Conditioner', watts: 1500, hoursPerDay: 8, quantity: 1 },
];

export const ElectricityBillTool: React.FC<ElectricityBillToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [electricityRate, setElectricityRate] = useState('0.12'); // per kWh
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: appliances,
    setData: setAppliances,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Appliance>('electricity-bill', DEFAULT_APPLIANCES, COLUMNS);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        electricityRate?: string;
      };
      if (params.electricityRate) setElectricityRate(params.electricityRate);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const commonAppliances = [
    { name: 'LED Light', watts: 10 },
    { name: 'CFL Light', watts: 20 },
    { name: 'Incandescent Light', watts: 60 },
    { name: 'Ceiling Fan', watts: 75 },
    { name: 'TV (LED 50")', watts: 100 },
    { name: 'Laptop', watts: 50 },
    { name: 'Desktop PC', watts: 250 },
    { name: 'Refrigerator', watts: 150 },
    { name: 'Washing Machine', watts: 500 },
    { name: 'Dryer', watts: 3000 },
    { name: 'Microwave', watts: 1000 },
    { name: 'Air Conditioner', watts: 1500 },
    { name: 'Space Heater', watts: 1500 },
    { name: 'Hair Dryer', watts: 1200 },
    { name: 'Electric Kettle', watts: 1500 },
    { name: 'Dishwasher', watts: 1800 },
    { name: 'Vacuum Cleaner', watts: 1200 },
    { name: 'WiFi Router', watts: 10 },
    { name: 'Phone Charger', watts: 5 },
    { name: 'Gaming Console', watts: 150 },
  ];

  const addAppliance = (preset?: { name: string; watts: number }) => {
    const newAppliance: Appliance = {
      id: Date.now().toString(),
      name: preset?.name || 'New Appliance',
      watts: preset?.watts || 100,
      hoursPerDay: 4,
      quantity: 1,
    };
    addItem(newAppliance);
  };

  const removeAppliance = (id: string) => {
    deleteItem(id);
  };

  const handleUpdateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    updateItem(id, { [field]: value });
  };

  const calculations = useMemo(() => {
    const rate = parseFloat(electricityRate) || 0;

    const applianceDetails = appliances.map((a) => {
      const dailyKwh = (a.watts * a.hoursPerDay * a.quantity) / 1000;
      const monthlyKwh = dailyKwh * 30;
      const dailyCost = dailyKwh * rate;
      const monthlyCost = monthlyKwh * rate;
      const yearlyCost = monthlyCost * 12;

      return {
        ...a,
        dailyKwh,
        monthlyKwh,
        dailyCost,
        monthlyCost,
        yearlyCost,
      };
    });

    const totalDailyKwh = applianceDetails.reduce((sum, a) => sum + a.dailyKwh, 0);
    const totalMonthlyKwh = totalDailyKwh * 30;
    const totalYearlyKwh = totalMonthlyKwh * 12;
    const totalDailyCost = totalDailyKwh * rate;
    const totalMonthlyCost = totalMonthlyKwh * rate;
    const totalYearlyCost = totalYearlyKwh * rate;

    return {
      appliances: applianceDetails,
      totalDailyKwh,
      totalMonthlyKwh,
      totalYearlyKwh,
      totalDailyCost,
      totalMonthlyCost,
      totalYearlyCost,
    };
  }, [appliances, electricityRate]);

  // Find top consumers
  const topConsumers = [...calculations.appliances]
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, 3);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg"><Zap className="w-5 h-5 text-yellow-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.electricityBill.electricityBillEstimator', 'Electricity Bill Estimator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.electricityBill.estimateYourElectricityCostsBy', 'Estimate your electricity costs by appliance')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="electricity-bill" toolName="Electricity Bill" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'electricity-bill' })}
              onExportExcel={() => exportExcel({ filename: 'electricity-bill' })}
              onExportJSON={() => exportJSON({ filename: 'electricity-bill' })}
              onExportPDF={() => exportPDF({
                filename: 'electricity-bill',
                title: 'Electricity Bill Estimate',
                subtitle: `Estimated Monthly Bill: $${calculations.totalMonthlyCost.toFixed(2)}`
              })}
              onPrint={() => print('Electricity Bill Estimate')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
              disabled={calculations.appliances.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.electricityBill.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Electricity Rate */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.electricityBill.electricityRatePerKwh', 'Electricity Rate (per kWh)')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                step="0.01"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            {[0.10, 0.12, 0.15, 0.20].map((rate) => (
              <button
                key={rate}
                onClick={() => setElectricityRate(rate.toString())}
                className={`px-3 py-2 rounded-lg text-sm ${parseFloat(electricityRate) === rate ? 'bg-yellow-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                ${rate}
              </button>
            ))}
          </div>
        </div>

        {/* Appliances List */}
        <div className="space-y-3">
          {appliances.map((appliance) => {
            const details = calculations.appliances.find((a) => a.id === appliance.id);
            return (
              <div key={appliance.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={appliance.name}
                    onChange={(e) => handleUpdateAppliance(appliance.id, 'name', e.target.value)}
                    className={`flex-1 font-medium bg-transparent border-b ${isDark ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}
                  />
                  <button onClick={() => removeAppliance(appliance.id)} className="text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityBill.watts', 'Watts')}</label>
                    <input
                      type="number"
                      value={appliance.watts}
                      onChange={(e) => handleUpdateAppliance(appliance.id, 'watts', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityBill.hoursDay', 'Hours/Day')}</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={appliance.hoursPerDay}
                      onChange={(e) => {
                        let value = parseFloat(e.target.value) || 0;
                        if (value > 24) value = 24;
                        if (value < 0) value = 0;
                        handleUpdateAppliance(appliance.id, 'hoursPerDay', value);
                      }}
                      className={`w-full px-3 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityBill.quantity', 'Quantity')}</label>
                    <input
                      type="number"
                      value={appliance.quantity}
                      onChange={(e) => handleUpdateAppliance(appliance.id, 'quantity', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-1.5 rounded border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityBill.monthly', 'Monthly')}</label>
                    <div className={`px-3 py-1.5 rounded text-sm font-medium text-yellow-500 ${isDark ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                      ${details?.monthlyCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Appliance */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const preset = commonAppliances.find((a) => a.name === e.target.value);
                  if (preset) addAppliance(preset);
                  e.target.value = '';
                }
              }}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="">{t('tools.electricityBill.addCommonAppliance', 'Add common appliance...')}</option>
              {commonAppliances.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name} ({a.watts}W)
                </option>
              ))}
            </select>
            <button
              onClick={() => addAppliance()}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Custom
            </button>
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityBill.estimatedMonthlyBill', 'Estimated Monthly Bill')}</div>
          <div className="text-5xl font-bold text-yellow-500 my-2">
            ${calculations.totalMonthlyCost.toFixed(2)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.totalMonthlyKwh.toFixed(1)} kWh/month
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityBill.daily', 'Daily')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.totalDailyCost.toFixed(2)}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.totalDailyKwh.toFixed(2)} kWh
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityBill.monthly2', 'Monthly')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.totalMonthlyCost.toFixed(2)}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.totalMonthlyKwh.toFixed(1)} kWh
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityBill.yearly', 'Yearly')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.totalYearlyCost.toFixed(2)}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.totalYearlyKwh.toFixed(0)} kWh
            </div>
          </div>
        </div>

        {/* Top Consumers */}
        {topConsumers.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.electricityBill.topEnergyConsumers', 'Top Energy Consumers')}</h4>
            </div>
            <div className="space-y-2">
              {topConsumers.map((a, idx) => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {idx + 1}. {a.name}
                  </span>
                  <span className="text-yellow-500 font-medium">${a.monthlyCost.toFixed(2)}/mo</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectricityBillTool;
