import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HardDrive, ArrowRightLeft, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Unit = 'b' | 'kb' | 'mb' | 'gb' | 'tb' | 'pb';
type Base = 'binary' | 'decimal';

interface DataStorageConverterToolProps {
  uiConfig?: UIConfig;
}

export const DataStorageConverterTool: React.FC<DataStorageConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState<Unit>('gb');
  const [base, setBase] = useState<Base>('binary');
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

  const units: { value: Unit; label: string; binaryMultiplier: number; decimalMultiplier: number }[] = [
    { value: 'b', label: 'Bytes (B)', binaryMultiplier: 1, decimalMultiplier: 1 },
    { value: 'kb', label: 'Kilobytes (KB)', binaryMultiplier: 1024, decimalMultiplier: 1000 },
    { value: 'mb', label: 'Megabytes (MB)', binaryMultiplier: 1024 ** 2, decimalMultiplier: 1000 ** 2 },
    { value: 'gb', label: 'Gigabytes (GB)', binaryMultiplier: 1024 ** 3, decimalMultiplier: 1000 ** 3 },
    { value: 'tb', label: 'Terabytes (TB)', binaryMultiplier: 1024 ** 4, decimalMultiplier: 1000 ** 4 },
    { value: 'pb', label: 'Petabytes (PB)', binaryMultiplier: 1024 ** 5, decimalMultiplier: 1000 ** 5 },
  ];

  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    if (num < 0.001) return num.toExponential(4);
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    if (num < 1000000) return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return num.toExponential(4);
  };

  const conversions = useMemo(() => {
    const inputValue = parseFloat(value) || 0;
    const fromUnitData = units.find(u => u.value === fromUnit)!;

    // Convert to bytes first
    const multiplier = base === 'binary' ? fromUnitData.binaryMultiplier : fromUnitData.decimalMultiplier;
    const bytes = inputValue * multiplier;

    // Convert to all units
    return units.map(unit => {
      const divisor = base === 'binary' ? unit.binaryMultiplier : unit.decimalMultiplier;
      const converted = bytes / divisor;
      return {
        ...unit,
        value: converted,
        formatted: formatNumber(converted),
      };
    });
  }, [value, fromUnit, base]);

  const handleCopy = () => {
    const text = conversions.map(c => `${c.label}: ${c.formatted}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: '1 Photo (~5MB)', value: '5', unit: 'mb' as Unit },
    { label: '1 Song (~4MB)', value: '4', unit: 'mb' as Unit },
    { label: '1 Movie (~4GB)', value: '4', unit: 'gb' as Unit },
    { label: 'iPhone Storage', value: '256', unit: 'gb' as Unit },
    { label: 'External HDD', value: '2', unit: 'tb' as Unit },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <HardDrive className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dataStorageConverter.dataStorageConverter', 'Data Storage Converter')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dataStorageConverter.convertBetweenBytesKbMb', 'Convert between bytes, KB, MB, GB, TB, PB')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.dataStorageConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
          </div>
        )}

        {/* Base Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.dataStorageConverter.calculationBase', 'Calculation Base')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setBase('binary')}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                base === 'binary'
                  ? 'bg-purple-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium">{t('tools.dataStorageConverter.binary1024', 'Binary (1024)')}</div>
              <div className="text-xs opacity-75">{t('tools.dataStorageConverter.kibMibGibUsedBy', 'KiB, MiB, GiB - Used by OS')}</div>
            </button>
            <button
              onClick={() => setBase('decimal')}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                base === 'decimal'
                  ? 'bg-purple-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium">{t('tools.dataStorageConverter.decimal1000', 'Decimal (1000)')}</div>
              <div className="text-xs opacity-75">{t('tools.dataStorageConverter.kbMbGbUsedBy', 'KB, MB, GB - Used by storage')}</div>
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.dataStorageConverter.value', 'Value')}
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
              {t('tools.dataStorageConverter.unit', 'Unit')}
            </label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value as Unit)}
              className={`w-full px-4 py-3 rounded-lg border text-lg ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {units.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
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
                isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Conversions */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
              {t('tools.dataStorageConverter.allConversions', 'All Conversions')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.dataStorageConverter.copied', 'Copied!') : t('tools.dataStorageConverter.copyAll', 'Copy All')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {conversions.map((c) => (
              <div
                key={c.value}
                className={`p-3 rounded-lg ${
                  fromUnit === c.value
                    ? isDark ? 'bg-purple-500/20 ring-2 ring-purple-500' : 'bg-purple-100 ring-2 ring-purple-500'
                    : isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {c.label}
                </div>
                <div className={`text-lg font-mono font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {c.formatted}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bytes Display */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dataStorageConverter.totalBytes', 'Total Bytes')}</div>
          <div className={`text-2xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {(conversions.find(c => c.value === 'b')?.value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dataStorageConverter.binaryVsDecimal', 'Binary vs Decimal')}</h4>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.dataStorageConverter.binary10242', 'Binary (1024):')}</strong> Used by operating systems. 1 KB = 1024 bytes.<br/>
            <strong>{t('tools.dataStorageConverter.decimal10002', 'Decimal (1000):')}</strong> Used by storage manufacturers. 1 KB = 1000 bytes.<br/>
            {t('tools.dataStorageConverter.thisIsWhyA1', 'This is why a "1 TB" drive shows as ~931 GB in Windows.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataStorageConverterTool;
