import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Plus, Trash2, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
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
}

interface ElectricityCostToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Appliance', type: 'string' },
  { key: 'watts', header: 'Watts (W)', type: 'number' },
  { key: 'hoursPerDay', header: 'Hours/Day', type: 'number' },
  { key: 'kwhPerDay', header: 'kWh/Day', type: 'number' },
  { key: 'dailyCost', header: 'Daily Cost ($)', type: 'number' },
  { key: 'monthlyCost', header: 'Monthly Cost ($)', type: 'number' },
];

export const ElectricityCostTool: React.FC<ElectricityCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Default appliances for new users
  const defaultAppliances: Appliance[] = [
    { id: '1', name: 'Air Conditioner', watts: 1500, hoursPerDay: 8 },
    { id: '2', name: 'LED TV', watts: 100, hoursPerDay: 4 },
    { id: '3', name: 'Refrigerator', watts: 150, hoursPerDay: 24 },
  ];

  // Use the useToolData hook for backend persistence
  const {
    data: appliances,
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
  } = useToolData<Appliance>('electricity-cost', defaultAppliances, COLUMNS);

  const [ratePerKwh, setRatePerKwh] = useState('0.12');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setRatePerKwh(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setRatePerKwh(params.numbers[0].toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const presetAppliances = [
    { name: 'LED Bulb', watts: 10 },
    { name: 'Incandescent Bulb', watts: 60 },
    { name: 'Ceiling Fan', watts: 75 },
    { name: 'Laptop', watts: 50 },
    { name: 'Desktop PC', watts: 200 },
    { name: 'Gaming PC', watts: 500 },
    { name: 'LED TV (55")', watts: 100 },
    { name: 'Washing Machine', watts: 500 },
    { name: 'Dryer', watts: 3000 },
    { name: 'Microwave', watts: 1000 },
    { name: 'Electric Oven', watts: 2500 },
    { name: 'Hair Dryer', watts: 1500 },
  ];

  const addAppliance = (preset?: { name: string; watts: number }) => {
    const newAppliance: Appliance = {
      id: Date.now().toString(),
      name: preset?.name || '',
      watts: preset?.watts || 100,
      hoursPerDay: 1,
    };
    addItem(newAppliance);
  };

  const removeAppliance = (id: string) => {
    deleteItem(id);
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    updateItem(id, { [field]: value });
  };

  const calculations = useMemo(() => {
    const rate = parseFloat(ratePerKwh) || 0;

    let totalWatts = 0;
    let totalKwhPerDay = 0;

    const applianceCosts = appliances.map(a => {
      const kwhPerDay = (a.watts * a.hoursPerDay) / 1000;
      const dailyCost = kwhPerDay * rate;
      totalWatts += a.watts;
      totalKwhPerDay += kwhPerDay;
      return { ...a, kwhPerDay, dailyCost };
    });

    const dailyCost = totalKwhPerDay * rate;
    const monthlyCost = dailyCost * 30;
    const yearlyCost = dailyCost * 365;

    return {
      applianceCosts,
      totalWatts,
      totalKwhPerDay,
      dailyCost,
      monthlyCost,
      yearlyCost,
    };
  }, [appliances, ratePerKwh]);

  const handleCopy = () => {
    const text = `Electricity Cost Estimate
Rate: $${ratePerKwh}/kWh
Daily Usage: ${calculations.totalKwhPerDay.toFixed(2)} kWh
Daily Cost: $${calculations.dailyCost.toFixed(2)}
Monthly Cost: $${calculations.monthlyCost.toFixed(2)}
Yearly Cost: $${calculations.yearlyCost.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.electricityCost.electricityCostCalculator', 'Electricity Cost Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.electricityCost.estimateYourPowerConsumptionCosts', 'Estimate your power consumption costs')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="electricity-cost" toolName="Electricity Cost" />

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
              onExportCSV={() => exportCSV({ filename: 'electricity-costs' })}
              onExportExcel={() => exportExcel({ filename: 'electricity-costs' })}
              onExportJSON={() => exportJSON({ filename: 'electricity-costs' })}
              onExportPDF={() => exportPDF({
                filename: 'electricity-costs',
                title: 'Electricity Cost Calculator',
                subtitle: `Total: $${calculations.monthlyCost.toFixed(2)}/month`
              })}
              onPrint={() => print('Electricity Cost Calculator')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.electricityCost.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Electricity Rate */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.electricityCost.electricityRateKwh', 'Electricity Rate ($/kWh)')}
          </label>
          <input
            type="number"
            step="0.01"
            value={ratePerKwh}
            onChange={(e) => setRatePerKwh(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.electricityCost.averageUsRate012', 'Average US rate: $0.12/kWh (varies by state)')}
          </p>
        </div>

        {/* Preset Appliances */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.electricityCost.quickAddAppliance', 'Quick Add Appliance')}
          </label>
          <div className="flex flex-wrap gap-2">
            {presetAppliances.slice(0, 6).map((preset) => (
              <button
                key={preset.name}
                onClick={() => addAppliance(preset)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {preset.name} ({preset.watts}W)
              </button>
            ))}
          </div>
        </div>

        {/* Appliance List */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.electricityCost.yourAppliances', 'Your Appliances')}
          </label>

          {appliances.map((appliance) => {
            const appData = calculations.applianceCosts.find(a => a.id === appliance.id);
            return (
              <div
                key={appliance.id}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={appliance.name}
                    onChange={(e) => updateAppliance(appliance.id, 'name', e.target.value)}
                    placeholder={t('tools.electricityCost.applianceName', 'Appliance name')}
                    className={`col-span-4 px-3 py-2 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <div className="col-span-3 flex items-center gap-1">
                    <input
                      type="number"
                      value={appliance.watts}
                      onChange={(e) => updateAppliance(appliance.id, 'watts', parseInt(e.target.value) || 0)}
                      className={`w-full px-2 py-2 rounded-lg border text-sm text-center ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>W</span>
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={appliance.hoursPerDay}
                      onChange={(e) => updateAppliance(appliance.id, 'hoursPerDay', parseFloat(e.target.value) || 0)}
                      className={`w-full px-2 py-2 rounded-lg border text-sm text-center ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>h/day</span>
                  </div>
                  <button
                    onClick={() => removeAppliance(appliance.id)}
                    className={`col-span-2 p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {appData?.kwhPerDay.toFixed(2)} kWh/day • ${appData?.dailyCost.toFixed(2)}/day • ${((appData?.dailyCost || 0) * 30).toFixed(2)}/month
                </div>
              </div>
            );
          })}

          <button
            onClick={() => addAppliance()}
            className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
              isDark ? 'border-gray-700 hover:border-gray-600 text-gray-400' : 'border-gray-300 hover:border-gray-400 text-gray-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.electricityCost.addCustomAppliance', 'Add Custom Appliance')}
          </button>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
              {t('tools.electricityCost.costEstimate', 'Cost Estimate')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.electricityCost.copied', 'Copied!') : t('tools.electricityCost.copy', 'Copy')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.totalKwhPerDay.toFixed(1)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityCost.kwhDay', 'kWh/day')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-yellow-500`}>
                ${calculations.dailyCost.toFixed(2)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityCost.perDay', 'per day')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-yellow-500`}>
                ${calculations.monthlyCost.toFixed(2)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityCost.perMonth', 'per month')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-yellow-500`}>
                ${calculations.yearlyCost.toFixed(0)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.electricityCost.perYear', 'per year')}</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.electricityCost.energySavingTips', 'Energy Saving Tips:')}</strong> Use LED bulbs, unplug devices when not in use,
            and run high-wattage appliances during off-peak hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElectricityCostTool;
