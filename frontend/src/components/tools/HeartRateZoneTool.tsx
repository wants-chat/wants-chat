import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Activity, Copy, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HeartRateZoneToolProps {
  uiConfig?: UIConfig;
}

export const HeartRateZoneTool: React.FC<HeartRateZoneToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [age, setAge] = useState('30');
  const [restingHR, setRestingHR] = useState('60');
  const [method, setMethod] = useState<'standard' | 'karvonen'>('standard');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        age?: number | string;
        restingHR?: number | string;
        method?: string;
      };
      if (params.age) setAge(String(params.age));
      if (params.restingHR) setRestingHR(String(params.restingHR));
      if (params.method && (params.method === 'standard' || params.method === 'karvonen')) {
        setMethod(params.method);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const zones = useMemo(() => {
    const ageNum = parseInt(age) || 30;
    const restingNum = parseInt(restingHR) || 60;

    // Maximum Heart Rate (220 - age is most common formula)
    const maxHR = 220 - ageNum;

    // Heart Rate Reserve (for Karvonen method)
    const hrReserve = maxHR - restingNum;

    const zoneDefinitions = [
      { name: 'Zone 1 - Recovery', min: 50, max: 60, color: 'gray', description: 'Very light, recovery pace' },
      { name: 'Zone 2 - Fat Burn', min: 60, max: 70, color: 'blue', description: 'Light aerobic, fat burning' },
      { name: 'Zone 3 - Aerobic', min: 70, max: 80, color: 'green', description: 'Moderate, endurance training' },
      { name: 'Zone 4 - Threshold', min: 80, max: 90, color: 'yellow', description: 'Hard, anaerobic threshold' },
      { name: 'Zone 5 - Maximum', min: 90, max: 100, color: 'red', description: 'Maximum effort, VO2 max' },
    ];

    return zoneDefinitions.map(zone => {
      let minBPM: number, maxBPM: number;

      if (method === 'karvonen') {
        // Karvonen formula: Target HR = ((max HR − resting HR) × %Intensity) + resting HR
        minBPM = Math.round((hrReserve * (zone.min / 100)) + restingNum);
        maxBPM = Math.round((hrReserve * (zone.max / 100)) + restingNum);
      } else {
        // Standard percentage of max HR
        minBPM = Math.round(maxHR * (zone.min / 100));
        maxBPM = Math.round(maxHR * (zone.max / 100));
      }

      return { ...zone, minBPM, maxBPM };
    });
  }, [age, restingHR, method]);

  const maxHR = 220 - (parseInt(age) || 30);

  const handleCopy = () => {
    const text = `Heart Rate Zones (Age: ${age}, Max HR: ${maxHR} BPM)\n\n` +
      zones.map(z => `${z.name}: ${z.minBPM}-${z.maxBPM} BPM`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getZoneColor = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      gray: { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-500' },
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-500' },
      green: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-500' },
      yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-500' },
      red: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-500' },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-rose-900/20' : 'bg-gradient-to-r from-white to-rose-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.heartRateZone.heartRateZoneCalculator', 'Heart Rate Zone Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.heartRateZone.calculateYourTrainingHeartRate', 'Calculate your training heart rate zones')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.heartRateZone.age', 'Age')}
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="10"
              max="100"
              className={`w-full px-4 py-3 rounded-lg border text-lg ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.heartRateZone.restingHeartRateBpm', 'Resting Heart Rate (BPM)')}
            </label>
            <input
              type="number"
              value={restingHR}
              onChange={(e) => setRestingHR(e.target.value)}
              min="40"
              max="100"
              className={`w-full px-4 py-3 rounded-lg border text-lg ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Method Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.heartRateZone.calculationMethod', 'Calculation Method')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMethod('standard')}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                method === 'standard'
                  ? 'bg-rose-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium">{t('tools.heartRateZone.standard', 'Standard')}</div>
              <div className="text-xs opacity-75">% of Max HR</div>
            </button>
            <button
              onClick={() => setMethod('karvonen')}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                method === 'karvonen'
                  ? 'bg-rose-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium">{t('tools.heartRateZone.karvonen', 'Karvonen')}</div>
              <div className="text-xs opacity-75">{t('tools.heartRateZone.usesRestingHr', 'Uses Resting HR')}</div>
            </button>
          </div>
        </div>

        {/* Max HR Display */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-rose-900/20 border-rose-800' : 'bg-rose-50 border-rose-100'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.heartRateZone.maximumHeartRate', 'Maximum Heart Rate')}</div>
          <div className={`text-4xl font-bold text-rose-500`}>
            {maxHR} <span className="text-xl">{t('tools.heartRateZone.bpm', 'BPM')}</span>
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>220 - age formula</div>
        </div>

        {/* Heart Rate Zones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.heartRateZone.trainingZones', 'Training Zones')}
            </label>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.heartRateZone.copied', 'Copied!') : t('tools.heartRateZone.copy', 'Copy')}
            </button>
          </div>

          {zones.map((zone) => {
            const colors = getZoneColor(zone.color);
            return (
              <div
                key={zone.name}
                className={`p-4 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {zone.name}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {zone.description}
                    </div>
                  </div>
                  <div className={`text-right`}>
                    <div className={`text-2xl font-bold ${colors.text}`}>
                      {zone.minBPM}-{zone.maxBPM}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.heartRateZone.bpm2', 'BPM')}</div>
                  </div>
                </div>
                {/* Progress bar showing zone range */}
                <div className={`mt-2 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                  <div
                    className={`h-full ${colors.border.replace('border', 'bg')}`}
                    style={{
                      marginLeft: `${(zone.min / 100) * 100}%`,
                      width: `${((zone.max - zone.min) / 100) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.heartRateZone.tips', 'Tips:')}</strong> Measure resting HR first thing in the morning.
            Zone 2 is ideal for building aerobic base. Zone 4-5 should be used sparingly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeartRateZoneTool;
