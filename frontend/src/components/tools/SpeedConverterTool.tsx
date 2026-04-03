import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gauge, ArrowRightLeft, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type SpeedUnit = 'mph' | 'kph' | 'mps' | 'fps' | 'knots' | 'mach';

interface SpeedConverterToolProps {
  uiConfig?: UIConfig;
}

export const SpeedConverterTool: React.FC<SpeedConverterToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [value, setValue] = useState('60');
  const [fromUnit, setFromUnit] = useState<SpeedUnit>('mph');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.amount !== undefined) {
        setValue(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setValue(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const units: { value: SpeedUnit; label: string; toMps: number; icon: string }[] = [
    { value: 'mph', label: 'Miles per hour', toMps: 0.44704, icon: '🚗' },
    { value: 'kph', label: 'Kilometers per hour', toMps: 0.277778, icon: '🚙' },
    { value: 'mps', label: 'Meters per second', toMps: 1, icon: '🏃' },
    { value: 'fps', label: 'Feet per second', toMps: 0.3048, icon: '🦶' },
    { value: 'knots', label: 'Knots', toMps: 0.514444, icon: '⛵' },
    { value: 'mach', label: 'Mach', toMps: 343, icon: '✈️' },
  ];

  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    if (Math.abs(num) < 0.001) return num.toExponential(4);
    if (Math.abs(num) < 1) return num.toFixed(4);
    if (Math.abs(num) < 1000) return num.toFixed(2);
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const conversions = useMemo(() => {
    const inputValue = parseFloat(value) || 0;
    const fromUnitData = units.find(u => u.value === fromUnit)!;

    // Convert to m/s first
    const mps = inputValue * fromUnitData.toMps;

    // Convert to all units
    return units.map(unit => ({
      ...unit,
      converted: mps / unit.toMps,
      formatted: formatNumber(mps / unit.toMps),
    }));
  }, [value, fromUnit]);

  const handleCopy = () => {
    const text = conversions.map(c => `${c.label}: ${c.formatted}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: 'Walking', value: '3', unit: 'mph' as SpeedUnit },
    { label: 'City Speed', value: '30', unit: 'mph' as SpeedUnit },
    { label: 'Highway', value: '65', unit: 'mph' as SpeedUnit },
    { label: '100 km/h', value: '100', unit: 'kph' as SpeedUnit },
    { label: 'Speed of Sound', value: '1', unit: 'mach' as SpeedUnit },
    { label: 'Usain Bolt', value: '10.44', unit: 'mps' as SpeedUnit },
  ];

  const comparisons = useMemo(() => {
    const inputValue = parseFloat(value) || 0;
    const fromUnitData = units.find(u => u.value === fromUnit)!;
    const mps = inputValue * fromUnitData.toMps;
    const mph = mps / 0.44704;

    const items = [
      { name: 'Walking', speed: 3, emoji: '🚶' },
      { name: 'Cycling', speed: 15, emoji: '🚴' },
      { name: 'Car (City)', speed: 30, emoji: '🚗' },
      { name: 'Car (Highway)', speed: 70, emoji: '🚙' },
      { name: 'Train', speed: 150, emoji: '🚄' },
      { name: 'Airplane', speed: 575, emoji: '✈️' },
      { name: 'Sound', speed: 767, emoji: '🔊' },
    ];

    return items.map(item => ({
      ...item,
      percentage: Math.min((mph / item.speed) * 100, 100),
      faster: mph >= item.speed,
    }));
  }, [value, fromUnit]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Gauge className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.speedConverter.speedConverter', 'Speed Converter')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.speedConverter.convertBetweenSpeedUnits', 'Convert between speed units')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.speedConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
          </div>
        )}

        {/* Input */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.speedConverter.speed', 'Speed')}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border text-xl ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.speedConverter.unit', 'Unit')}
            </label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value as SpeedUnit)}
              className={`w-full px-4 py-3 rounded-lg border text-lg ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {units.map((u) => (
                <option key={u.value} value={u.value}>{u.icon} {u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => { setValue(preset.value); setFromUnit(preset.unit); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Conversions */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              {t('tools.speedConverter.allConversions', 'All Conversions')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.speedConverter.copied', 'Copied!') : t('tools.speedConverter.copyAll', 'Copy All')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {conversions.map((c) => (
              <div
                key={c.value}
                className={`p-3 rounded-lg ${
                  fromUnit === c.value
                    ? isDark ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-red-100 ring-2 ring-red-500'
                    : isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{c.icon}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {c.label}
                  </span>
                </div>
                <div className={`text-lg font-mono font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {c.formatted}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speed Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.speedConverter.speedComparison', 'Speed Comparison')}
          </h4>
          <div className="space-y-2">
            {comparisons.map((comp) => (
              <div key={comp.name} className="flex items-center gap-3">
                <span className="text-xl w-8">{comp.emoji}</span>
                <span className={`text-sm w-20 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {comp.name}
                </span>
                <div className={`flex-1 h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full transition-all ${comp.faster ? 'bg-red-500' : 'bg-gray-400'}`}
                    style={{ width: `${comp.percentage}%` }}
                  />
                </div>
                <span className={`text-xs w-12 text-right ${
                  comp.faster ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {comp.speed} mph
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.speedConverter.funFact', 'Fun fact:')}</strong> The speed of sound (Mach 1) varies with temperature.
            At sea level and 20°C, it's about 767 mph or 1,235 km/h.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeedConverterTool;
