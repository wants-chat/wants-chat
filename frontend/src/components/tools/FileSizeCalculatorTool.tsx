import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HardDrive, ArrowRightLeft, Copy, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FileSizeCalculatorToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

type SizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

interface UnitInfo {
  label: string;
  bytes: number;
  binaryBytes: number;
}

const units: Record<SizeUnit, UnitInfo> = {
  B: { label: 'Bytes', bytes: 1, binaryBytes: 1 },
  KB: { label: 'Kilobytes', bytes: 1000, binaryBytes: 1024 },
  MB: { label: 'Megabytes', bytes: 1000000, binaryBytes: 1048576 },
  GB: { label: 'Gigabytes', bytes: 1000000000, binaryBytes: 1073741824 },
  TB: { label: 'Terabytes', bytes: 1000000000000, binaryBytes: 1099511627776 },
  PB: { label: 'Petabytes', bytes: 1000000000000000, binaryBytes: 1125899906842624 },
};

const unitList: SizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export const FileSizeCalculatorTool: React.FC<FileSizeCalculatorToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [inputValue, setInputValue] = useState<string>('1');

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.value) setInputValue(prefillData.params.value);
      if (prefillData.params.unit) setInputUnit(prefillData.params.unit);
      if (prefillData.params.useBinary !== undefined) setUseBinaryMode(prefillData.params.useBinary);
      setIsPrefilled(true);
    }
  }, [prefillData]);
  const [inputUnit, setInputUnit] = useState<SizeUnit>('GB');
  const [useBinaryMode, setUseBinaryMode] = useState(false);

  const conversions = useMemo(() => {
    const value = parseFloat(inputValue) || 0;
    const multiplier = useBinaryMode ? units[inputUnit].binaryBytes : units[inputUnit].bytes;
    const totalBytes = value * multiplier;

    return unitList.map((unit) => {
      const divisor = useBinaryMode ? units[unit].binaryBytes : units[unit].bytes;
      const converted = totalBytes / divisor;
      return {
        unit,
        label: units[unit].label,
        value: converted,
        formatted: formatNumber(converted),
      };
    });
  }, [inputValue, inputUnit, useBinaryMode]);

  function formatNumber(num: number): string {
    if (num === 0) return '0';
    if (num < 0.001) return num.toExponential(2);
    if (num < 1) return num.toFixed(6).replace(/\.?0+$/, '');
    if (num < 1000) return num.toFixed(2).replace(/\.?0+$/, '');
    if (num < 1000000) return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return num.toExponential(2);
  }

  const handleCopyAll = () => {
    const text = conversions
      .map((c) => `${c.formatted} ${c.unit}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleCopy = (value: string, unit: string) => {
    navigator.clipboard.writeText(`${value} ${unit}`);
  };

  // Common file size references
  const references = [
    { name: 'Text Document (1 page)', size: '10 KB' },
    { name: 'High-res Photo (JPEG)', size: '5 MB' },
    { name: 'MP3 Song (4 min)', size: '8 MB' },
    { name: 'HD Video (1 hour)', size: '3 GB' },
    { name: '4K Video (1 hour)', size: '20 GB' },
    { name: 'Blu-ray Movie', size: '50 GB' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <HardDrive className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fileSizeCalculator.fileSizeCalculator', 'File Size Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.fileSizeCalculator.convertBetweenFileSizeUnits', 'Convert between file size units')}</p>
            </div>
            {isPrefilled && (
              <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.fileSizeCalculator.preFilled', 'Pre-filled')}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fileSizeCalculator.binary1024', 'Binary (1024)')}</span>
            <button
              onClick={() => setUseBinaryMode(!useBinaryMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                useBinaryMode
                  ? 'bg-cyan-500'
                  : isDark
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  useBinaryMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.fileSizeCalculator.enterValue', 'Enter Value')}
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('tools.fileSizeCalculator.enterSize', 'Enter size...')}
              className={`w-full px-4 py-3 rounded-lg border text-lg font-mono ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.fileSizeCalculator.unit', 'Unit')}
            </label>
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value as SizeUnit)}
              className={`w-full px-4 py-3 rounded-lg border text-lg ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
            >
              {unitList.map((unit) => (
                <option key={unit} value={unit}>
                  {unit} ({units[unit].label})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversion Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <ArrowRightLeft className="w-4 h-4 inline mr-2" />
              {t('tools.fileSizeCalculator.conversions', 'Conversions')}
            </h4>
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Copy className="w-4 h-4" />
              {t('tools.fileSizeCalculator.copyAll', 'Copy All')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {conversions.map((conv) => (
              <div
                key={conv.unit}
                onClick={() => handleCopy(conv.formatted, conv.unit)}
                className={`${
                  conv.unit === inputUnit
                    ? isDark
                      ? 'bg-cyan-900/30 border-cyan-700'
                      : 'bg-cyan-50 border-cyan-200'
                    : isDark
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                } rounded-lg p-4 border cursor-pointer hover:border-cyan-500 transition-colors group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {conv.label}
                  </span>
                  <Copy className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <p className={`text-lg font-mono font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {conv.formatted}
                  <span className={`text-sm ml-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{conv.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Binary vs Decimal Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-100'} border`}>
          <div className="flex items-start gap-3">
            <Info className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <div>
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {useBinaryMode ? t('tools.fileSizeCalculator.binaryIec', 'Binary (IEC)') : t('tools.fileSizeCalculator.decimalSi', 'Decimal (SI)')} Mode
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {useBinaryMode
                  ? t('tools.fileSizeCalculator.usingPowersOf1024This', 'Using powers of 1024. This is how operating systems typically report file sizes (KiB, MiB, GiB).') : t('tools.fileSizeCalculator.usingPowersOf1000This', 'Using powers of 1000. This is the SI standard and how hard drive manufacturers report capacity.')}
              </p>
            </div>
          </div>
        </div>

        {/* Common File Size References */}
        <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.fileSizeCalculator.commonFileSizeReferences', 'Common File Size References')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {references.map((ref, index) => (
              <div key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">{ref.size}</span>
                <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{ref.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSizeCalculatorTool;
