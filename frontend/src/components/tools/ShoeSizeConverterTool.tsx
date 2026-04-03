import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Footprints, ArrowRightLeft, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Gender = 'men' | 'women' | 'kids';
type Region = 'us' | 'uk' | 'eu' | 'cm';

interface ShoeSizeConverterToolProps {
  uiConfig?: UIConfig;
}

export const ShoeSizeConverterTool: React.FC<ShoeSizeConverterToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gender, setGender] = useState<Gender>('men');
  const [fromRegion, setFromRegion] = useState<Region>('us');
  const [size, setSize] = useState('10');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.amount !== undefined) {
        setSize(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setSize(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Conversion tables (approximate)
  const menSizes: Record<string, Record<Region, number>> = {
    '6': { us: 6, uk: 5.5, eu: 39, cm: 24 },
    '6.5': { us: 6.5, uk: 6, eu: 39.5, cm: 24.5 },
    '7': { us: 7, uk: 6.5, eu: 40, cm: 25 },
    '7.5': { us: 7.5, uk: 7, eu: 40.5, cm: 25.5 },
    '8': { us: 8, uk: 7.5, eu: 41, cm: 26 },
    '8.5': { us: 8.5, uk: 8, eu: 42, cm: 26.5 },
    '9': { us: 9, uk: 8.5, eu: 42.5, cm: 27 },
    '9.5': { us: 9.5, uk: 9, eu: 43, cm: 27.5 },
    '10': { us: 10, uk: 9.5, eu: 44, cm: 28 },
    '10.5': { us: 10.5, uk: 10, eu: 44.5, cm: 28.5 },
    '11': { us: 11, uk: 10.5, eu: 45, cm: 29 },
    '11.5': { us: 11.5, uk: 11, eu: 46, cm: 29.5 },
    '12': { us: 12, uk: 11.5, eu: 46.5, cm: 30 },
    '13': { us: 13, uk: 12.5, eu: 48, cm: 31 },
  };

  const womenSizes: Record<string, Record<Region, number>> = {
    '5': { us: 5, uk: 2.5, eu: 35, cm: 21.5 },
    '5.5': { us: 5.5, uk: 3, eu: 36, cm: 22 },
    '6': { us: 6, uk: 3.5, eu: 36.5, cm: 22.5 },
    '6.5': { us: 6.5, uk: 4, eu: 37, cm: 23 },
    '7': { us: 7, uk: 4.5, eu: 37.5, cm: 23.5 },
    '7.5': { us: 7.5, uk: 5, eu: 38, cm: 24 },
    '8': { us: 8, uk: 5.5, eu: 39, cm: 24.5 },
    '8.5': { us: 8.5, uk: 6, eu: 39.5, cm: 25 },
    '9': { us: 9, uk: 6.5, eu: 40, cm: 25.5 },
    '9.5': { us: 9.5, uk: 7, eu: 41, cm: 26 },
    '10': { us: 10, uk: 7.5, eu: 41.5, cm: 26.5 },
    '10.5': { us: 10.5, uk: 8, eu: 42, cm: 27 },
    '11': { us: 11, uk: 8.5, eu: 43, cm: 27.5 },
  };

  const kidsSizes: Record<string, Record<Region, number>> = {
    '1': { us: 1, uk: 0.5, eu: 16, cm: 9 },
    '2': { us: 2, uk: 1, eu: 17, cm: 10 },
    '3': { us: 3, uk: 2, eu: 18, cm: 10.5 },
    '4': { us: 4, uk: 3, eu: 19, cm: 11.5 },
    '5': { us: 5, uk: 4, eu: 20, cm: 12 },
    '6': { us: 6, uk: 5, eu: 22, cm: 13 },
    '7': { us: 7, uk: 6, eu: 23, cm: 14 },
    '8': { us: 8, uk: 7, eu: 24, cm: 15 },
    '9': { us: 9, uk: 8, eu: 25, cm: 15.5 },
    '10': { us: 10, uk: 9, eu: 27, cm: 16.5 },
    '11': { us: 11, uk: 10, eu: 28, cm: 17.5 },
    '12': { us: 12, uk: 11, eu: 30, cm: 18.5 },
    '13': { us: 13, uk: 12, eu: 31, cm: 19.5 },
  };

  const getSizeTable = () => {
    switch (gender) {
      case 'men': return menSizes;
      case 'women': return womenSizes;
      case 'kids': return kidsSizes;
    }
  };

  const conversions = useMemo(() => {
    const table = getSizeTable();
    const inputSize = parseFloat(size);

    // Find the closest matching size
    let closestKey = '';
    let minDiff = Infinity;

    Object.entries(table).forEach(([key, values]) => {
      const diff = Math.abs(values[fromRegion] - inputSize);
      if (diff < minDiff) {
        minDiff = diff;
        closestKey = key;
      }
    });

    if (closestKey && minDiff <= 1) {
      return table[closestKey];
    }

    return null;
  }, [size, gender, fromRegion]);

  const handleCopy = () => {
    if (!conversions) return;
    const text = `US: ${conversions.us} | UK: ${conversions.uk} | EU: ${conversions.eu} | CM: ${conversions.cm}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regions: { value: Region; label: string; flag: string }[] = [
    { value: 'us', label: 'US', flag: '🇺🇸' },
    { value: 'uk', label: 'UK', flag: '🇬🇧' },
    { value: 'eu', label: 'EU', flag: '🇪🇺' },
    { value: 'cm', label: 'CM', flag: '📏' },
  ];

  const availableSizes = Object.keys(getSizeTable());

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Footprints className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.shoeSizeConverter.shoeSizeConverter', 'Shoe Size Converter')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.shoeSizeConverter.convertBetweenInternationalShoeSizes', 'Convert between international shoe sizes')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.shoeSizeConverter.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
          </div>
        )}

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.shoeSizeConverter.category', 'Category')}
          </label>
          <div className="flex gap-2">
            {[
              { value: 'men', label: "Men's", icon: '👞' },
              { value: 'women', label: "Women's", icon: '👠' },
              { value: 'kids', label: "Kids'", icon: '👟' },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => { setGender(g.value as Gender); setSize(availableSizes[4] || '8'); }}
                className={`flex-1 py-3 rounded-lg text-center transition-colors ${
                  gender === g.value
                    ? 'bg-orange-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span className="text-2xl mr-2">{g.icon}</span>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size Input */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.shoeSizeConverter.fromRegion', 'From Region')}
            </label>
            <select
              value={fromRegion}
              onChange={(e) => setFromRegion(e.target.value as Region)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {regions.map((r) => (
                <option key={r.value} value={r.value}>{r.flag} {r.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.shoeSizeConverter.size', 'Size')}
            </label>
            <input
              type="number"
              step="0.5"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border text-center text-xl ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Quick Size Buttons */}
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                size === s
                  ? 'bg-orange-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Conversion Results */}
        {conversions ? (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-100'} border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-medium ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                {t('tools.shoeSizeConverter.sizeConversions', 'Size Conversions')}
              </h4>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.shoeSizeConverter.copied', 'Copied!') : t('tools.shoeSizeConverter.copy', 'Copy')}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {regions.map((r) => (
                <div
                  key={r.value}
                  className={`p-4 rounded-lg text-center ${
                    fromRegion === r.value
                      ? isDark ? 'bg-orange-500/20 ring-2 ring-orange-500' : 'bg-orange-100 ring-2 ring-orange-500'
                      : isDark ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{r.flag}</div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {conversions[r.value]}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t('tools.shoeSizeConverter.enterAValidSizeTo', 'Enter a valid size to see conversions')}
            </p>
          </div>
        )}

        {/* Size Chart */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {gender === 'men' ? "Men's" : gender === 'women' ? "Women's" : "Kids'"} Size Chart
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left p-2">US</th>
                  <th className="text-left p-2">UK</th>
                  <th className="text-left p-2">EU</th>
                  <th className="text-left p-2">CM</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(getSizeTable()).slice(0, 6).map(([key, values]) => (
                  <tr key={key} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <td className="p-2">{values.us}</td>
                    <td className="p-2">{values.uk}</td>
                    <td className="p-2">{values.eu}</td>
                    <td className="p-2">{values.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.shoeSizeConverter.note', 'Note:')}</strong> Sizes are approximate and may vary by brand. CM measurements are
            foot length. Always try shoes on when possible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShoeSizeConverterTool;
