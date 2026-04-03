import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Battery, Smartphone, Laptop, Tablet, BatteryCharging, Zap, Info, Lightbulb, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type DeviceType = 'phone' | 'laptop' | 'tablet' | 'powerbank' | 'custom';
type ActivityType = 'gaming' | 'video' | 'browsing' | 'standby' | 'calls' | 'music';

interface DevicePreset {
  name: string;
  capacity: number;
  icon: React.ReactNode;
  avgConsumption: number;
}

interface ActivityInfo {
  name: string;
  consumption: number; // mA
  description: string;
}

interface BatteryResult {
  totalHours: number;
  totalMinutes: number;
  usageBreakdown: { activity: string; hours: number; percentage: number }[];
  chargingTime: number;
  chargingTimeMinutes: number;
}

const DEVICE_PRESETS: Record<DeviceType, DevicePreset> = {
  phone: {
    name: 'Smartphone',
    capacity: 4500,
    icon: <Smartphone className="w-5 h-5" />,
    avgConsumption: 300,
  },
  laptop: {
    name: 'Laptop',
    capacity: 60000,
    icon: <Laptop className="w-5 h-5" />,
    avgConsumption: 3000,
  },
  tablet: {
    name: 'Tablet',
    capacity: 8000,
    icon: <Tablet className="w-5 h-5" />,
    avgConsumption: 500,
  },
  powerbank: {
    name: 'Power Bank',
    capacity: 20000,
    icon: <BatteryCharging className="w-5 h-5" />,
    avgConsumption: 500,
  },
  custom: {
    name: 'Custom',
    capacity: 0,
    icon: <Battery className="w-5 h-5" />,
    avgConsumption: 0,
  },
};

const ACTIVITIES: Record<ActivityType, ActivityInfo> = {
  gaming: {
    name: 'Gaming',
    consumption: 800,
    description: 'High GPU/CPU usage, max brightness',
  },
  video: {
    name: 'Video Streaming',
    consumption: 400,
    description: 'Medium screen brightness, network active',
  },
  browsing: {
    name: 'Web Browsing',
    consumption: 250,
    description: 'Light usage, intermittent network',
  },
  standby: {
    name: 'Standby',
    consumption: 50,
    description: 'Screen off, background processes only',
  },
  calls: {
    name: 'Voice Calls',
    consumption: 200,
    description: 'Screen on, cellular active',
  },
  music: {
    name: 'Music Playback',
    consumption: 100,
    description: 'Screen off, audio processing',
  },
};

const BATTERY_TIPS = [
  'Lower screen brightness to extend battery life by up to 30%',
  'Enable dark mode on OLED screens to save power',
  'Close background apps that you are not using',
  'Turn off location services when not needed',
  'Disable Bluetooth and Wi-Fi when not in use',
  'Use airplane mode in low signal areas',
  'Reduce screen timeout duration',
  'Avoid extreme temperatures (below 0C or above 35C)',
  'Keep your battery between 20% and 80% for optimal health',
  'Use original or certified chargers only',
];

const COLUMNS: ColumnConfig[] = [
  { key: 'activity', header: 'Activity' },
  { key: 'hours', header: 'Hours', type: 'number' },
  { key: 'percentage', header: 'Percentage', type: 'number', format: (val) => `${val.toFixed(1)}%` },
];

interface BatteryLifeEstimatorToolProps {
  uiConfig?: UIConfig;
}

export const BatteryLifeEstimatorTool: React.FC<BatteryLifeEstimatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [deviceType, setDeviceType] = useState<DeviceType>('phone');
  const [customCapacity, setCustomCapacity] = useState('');
  const [customConsumption, setCustomConsumption] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>(['browsing']);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.deviceType) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [activityHours, setActivityHours] = useState<Record<ActivityType, string>>({
    gaming: '0',
    video: '0',
    browsing: '1',
    standby: '0',
    calls: '0',
    music: '0',
  });
  const [chargerWattage, setChargerWattage] = useState('20');
  const [result, setResult] = useState<BatteryResult | null>(null);
  const [showTips, setShowTips] = useState(false);

  const toggleActivity = (activity: ActivityType) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const calculateBatteryLife = () => {
    let capacity: number;
    let avgConsumption: number;

    if (deviceType === 'custom') {
      capacity = parseFloat(customCapacity);
      avgConsumption = parseFloat(customConsumption);

      if (isNaN(capacity) || isNaN(avgConsumption) || capacity <= 0 || avgConsumption <= 0) {
        setValidationMessage('Please enter valid capacity and consumption values');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }
    } else {
      capacity = DEVICE_PRESETS[deviceType].capacity;
      avgConsumption = DEVICE_PRESETS[deviceType].avgConsumption;
    }

    // Calculate weighted average consumption based on selected activities
    let totalConsumption = 0;
    let totalHours = 0;
    const breakdown: { activity: string; hours: number; percentage: number }[] = [];

    selectedActivities.forEach((activity) => {
      const hours = parseFloat(activityHours[activity]) || 0;
      if (hours > 0) {
        totalConsumption += ACTIVITIES[activity].consumption * hours;
        totalHours += hours;
        breakdown.push({
          activity: ACTIVITIES[activity].name,
          hours,
          percentage: 0, // Will be calculated after
        });
      }
    });

    if (totalHours === 0) {
      // If no hours specified, use average consumption
      totalHours = capacity / avgConsumption;
    } else {
      // Calculate actual battery life based on usage
      const weightedAvgConsumption = totalConsumption / totalHours;
      totalHours = capacity / weightedAvgConsumption;
    }

    // Update breakdown percentages
    breakdown.forEach((item) => {
      item.percentage = (item.hours / totalHours) * 100;
    });

    // Calculate charging time (assuming voltage of 3.7V for batteries)
    const wattage = parseFloat(chargerWattage) || 20;
    // Charging efficiency ~85%
    const chargingHours = (capacity * 3.7) / (wattage * 1000 * 0.85);

    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    const chargingTimeHours = Math.floor(chargingHours);
    const chargingTimeMinutes = Math.round((chargingHours - chargingTimeHours) * 60);

    setResult({
      totalHours: hours,
      totalMinutes: minutes,
      usageBreakdown: breakdown,
      chargingTime: chargingTimeHours,
      chargingTimeMinutes: chargingTimeMinutes,
    });
  };

  const reset = () => {
    setDeviceType('phone');
    setCustomCapacity('');
    setCustomConsumption('');
    setSelectedActivities(['browsing']);
    setActivityHours({
      gaming: '0',
      video: '0',
      browsing: '1',
      standby: '0',
      calls: '0',
      music: '0',
    });
    setChargerWattage('20');
    setResult(null);
  };

  const getBatteryColor = (hours: number): string => {
    if (hours >= 12) return '#10b981'; // Green
    if (hours >= 6) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const handleExportCSV = () => {
    if (!result) return;
    exportToCSV(result.usageBreakdown, COLUMNS, {
      filename: 'battery-life-usage-breakdown',
    });
  };

  const handleExportExcel = () => {
    if (!result) return;
    exportToExcel(result.usageBreakdown, COLUMNS, {
      filename: 'battery-life-usage-breakdown',
    });
  };

  const handleExportJSON = () => {
    if (!result) return;
    const exportData = {
      batteryLife: {
        hours: result.totalHours,
        minutes: result.totalMinutes,
        totalFormatted: `${result.totalHours}h ${result.totalMinutes}m`,
      },
      charging: {
        hours: result.chargingTime,
        minutes: result.chargingTimeMinutes,
        chargerWattage: parseInt(chargerWattage),
        totalFormatted: `${result.chargingTime}h ${result.chargingTimeMinutes}m`,
      },
      usageBreakdown: result.usageBreakdown,
    };
    exportToJSON([exportData], {
      filename: 'battery-life-estimate',
    });
  };

  const handleExportPDF = async () => {
    if (!result) return;
    await exportToPDF(result.usageBreakdown, COLUMNS, {
      filename: 'battery-life-usage-breakdown',
      title: 'Battery Life Estimator Report',
      subtitle: `${result.totalHours}h ${result.totalMinutes}m estimated battery life`,
    });
  };

  const handleCopyToClipboard = async () => {
    if (!result) return false;
    return await copyUtil(result.usageBreakdown, COLUMNS, 'tab');
  };

  const handlePrint = () => {
    if (!result) return;
    printData(result.usageBreakdown, COLUMNS, {
      title: 'Battery Life Estimator - Usage Breakdown',
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Battery className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.batteryLifeEstimator.batteryLifeEstimator', 'Battery Life Estimator')}
              </h1>
            </div>
            {result && (
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onCopyToClipboard={handleCopyToClipboard}
                onPrint={handlePrint}
                showImport={false}
                theme={theme}
              />
            )}
          </div>

          {/* Prefill Indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.batteryLifeEstimator.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
            </div>
          )}

          {/* Validation Message Toast */}
          {validationMessage && (
            <div className="flex items-center gap-2 px-4 py-3 mb-6 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800">
              <div className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-sm text-red-800 dark:text-red-200 font-medium">{validationMessage}</span>
            </div>
          )}

          {/* Device Type Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.batteryLifeEstimator.deviceType', 'Device Type')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(DEVICE_PRESETS) as DeviceType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setDeviceType(type)}
                  className={`flex flex-col items-center py-3 px-2 rounded-lg font-medium transition-colors ${
                    deviceType === type
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {DEVICE_PRESETS[type].icon}
                  <span className="text-xs mt-1">{DEVICE_PRESETS[type].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Device Preset Info */}
          {deviceType !== 'custom' && (
            <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {t('tools.batteryLifeEstimator.defaultCapacity', 'Default Capacity:')}
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {DEVICE_PRESETS[deviceType].capacity.toLocaleString()} mAh
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {t('tools.batteryLifeEstimator.avgPowerConsumption', 'Avg. Power Consumption:')}
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {DEVICE_PRESETS[deviceType].avgConsumption} mA
                </span>
              </div>
            </div>
          )}

          {/* Custom Device Inputs */}
          {deviceType === 'custom' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.batteryLifeEstimator.batteryCapacityMah', 'Battery Capacity (mAh)')}
                </label>
                <input
                  type="number"
                  value={customCapacity}
                  onChange={(e) => setCustomCapacity(e.target.value)}
                  placeholder="e.g., 4500"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.batteryLifeEstimator.averagePowerConsumptionMa', 'Average Power Consumption (mA)')}
                </label>
                <input
                  type="number"
                  value={customConsumption}
                  onChange={(e) => setCustomConsumption(e.target.value)}
                  placeholder="e.g., 300"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          )}

          {/* Usage Activities */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.batteryLifeEstimator.selectUsageActivities', 'Select Usage Activities')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(Object.keys(ACTIVITIES) as ActivityType[]).map((activity) => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  className={`py-2 px-3 rounded-lg font-medium transition-colors text-left ${
                    selectedActivities.includes(activity)
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{ACTIVITIES[activity].name}</div>
                  <div className={`text-xs ${
                    selectedActivities.includes(activity)
                      ? 'text-white/70'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    ~{ACTIVITIES[activity].consumption} mA
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Hours */}
          {selectedActivities.length > 0 && (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.batteryLifeEstimator.hoursPerActivityDailyUsage', 'Hours per Activity (Daily Usage)')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {selectedActivities.map((activity) => (
                  <div key={activity} className="flex items-center gap-2">
                    <span className={`text-sm flex-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {ACTIVITIES[activity].name}:
                    </span>
                    <input
                      type="number"
                      value={activityHours[activity]}
                      onChange={(e) =>
                        setActivityHours((prev) => ({ ...prev, [activity]: e.target.value }))
                      }
                      min="0"
                      max="24"
                      step="0.5"
                      className={`w-20 px-3 py-2 rounded-lg border text-center ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>hrs</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charger Wattage */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.batteryLifeEstimator.chargerWattageWForCharging', 'Charger Wattage (W) - for charging time calculation')}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={chargerWattage}
                onChange={(e) => setChargerWattage(e.target.value)}
                placeholder="e.g., 20"
                min="1"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <div className="flex gap-1">
                {[5, 20, 45, 65, 100].map((watt) => (
                  <button
                    key={watt}
                    onClick={() => setChargerWattage(watt.toString())}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      chargerWattage === watt.toString()
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {watt}W
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateBatteryLife}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {t('tools.batteryLifeEstimator.calculateBatteryLife', 'Calculate Battery Life')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.batteryLifeEstimator.reset', 'Reset')}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Main Result */}
              <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.batteryLifeEstimator.estimatedBatteryLife', 'Estimated Battery Life')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div
                      className="text-5xl font-bold mb-2"
                      style={{ color: getBatteryColor(result.totalHours) }}
                    >
                      {result.totalHours}h {result.totalMinutes}m
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.batteryLifeEstimator.basedOnYourUsagePattern', 'Based on your usage pattern')}
                    </div>
                  </div>

                  {/* Battery Visual */}
                  <div className="mt-4">
                    <div className={`w-full h-8 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((result.totalHours / 24) * 100, 100)}%`,
                          backgroundColor: getBatteryColor(result.totalHours),
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>0h</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>12h</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>24h+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Breakdown */}
              {result.usageBreakdown.length > 0 && (
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.batteryLifeEstimator.projectedUsageBreakdown', 'Projected Usage Breakdown')}
                  </h3>
                  <div className="space-y-3">
                    {result.usageBreakdown.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.activity}
                          </span>
                          <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.hours}h ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}>
                          <div
                            className="h-2 rounded-full bg-[#0D9488] transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Charging Time */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.batteryLifeEstimator.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <div className="flex items-center gap-3">
                  <BatteryCharging className="w-8 h-8 text-[#0D9488]" />
                  <div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Estimated Charging Time ({chargerWattage}W)
                    </div>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.chargingTime}h {result.chargingTimeMinutes}m
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.batteryLifeEstimator.from0To100', 'From 0% to 100%')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Battery Tips Section */}
          <div className="mt-6">
            <button
              onClick={() => setShowTips(!showTips)}
              className={`w-full flex items-center justify-between p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.batteryLifeEstimator.batteryHealthTips', 'Battery Health Tips')}
                </span>
              </div>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {showTips ? '-' : '+'}
              </span>
            </button>

            {showTips && (
              <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <ul className="space-y-2">
                  {BATTERY_TIPS.map((tip, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-2 text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-[#0D9488] mt-0.5">-</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.batteryLifeEstimator.howItWorks', 'How It Works')}
              </h3>
            </div>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                <strong>{t('tools.batteryLifeEstimator.batteryLifeFormula', 'Battery Life Formula:')}</strong> Hours = Capacity (mAh) / Average Consumption (mA)
              </p>
              <p>
                <strong>{t('tools.batteryLifeEstimator.chargingTimeFormula', 'Charging Time Formula:')}</strong> Hours = (Capacity x Voltage) / (Charger Wattage x Efficiency)
              </p>
              <p className="text-xs mt-3 italic">
                Note: Actual battery life may vary based on screen brightness, temperature,
                battery age, signal strength, and other factors.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default BatteryLifeEstimatorTool;
