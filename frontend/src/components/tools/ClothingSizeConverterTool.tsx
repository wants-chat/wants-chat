import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, ArrowRightLeft, Copy, Check, Sparkles, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ClothingSizeConverterToolProps {
  uiConfig?: UIConfig;
}

type GarmentCategory = 'tops' | 'bottoms' | 'dresses' | 'bras' | 'jeans';
type Gender = 'women' | 'men';
type Region = 'us' | 'uk' | 'eu' | 'au' | 'jp' | 'it' | 'fr';

interface SizeMapping {
  us: string;
  uk: string;
  eu: string;
  au: string;
  jp?: string;
  it?: string;
  fr?: string;
  bust?: string;
  waist?: string;
  hip?: string;
}

const ClothingSizeConverterTool: React.FC<ClothingSizeConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);

  const [gender, setGender] = useState<Gender>('women');
  const [category, setCategory] = useState<GarmentCategory>('tops');
  const [fromRegion, setFromRegion] = useState<Region>('us');
  const [selectedSize, setSelectedSize] = useState('M');
  const [showMeasurements, setShowMeasurements] = useState(false);

  const regions: { value: Region; label: string; flag: string }[] = [
    { value: 'us', label: 'US', flag: '🇺🇸' },
    { value: 'uk', label: 'UK', flag: '🇬🇧' },
    { value: 'eu', label: 'EU', flag: '🇪🇺' },
    { value: 'au', label: 'AU', flag: '🇦🇺' },
    { value: 'jp', label: 'Japan', flag: '🇯🇵' },
    { value: 'it', label: 'Italy', flag: '🇮🇹' },
    { value: 'fr', label: 'France', flag: '🇫🇷' },
  ];

  // Women's size charts
  const womenTops: SizeMapping[] = [
    { us: 'XS (0-2)', uk: '4-6', eu: '32-34', au: '4-6', jp: 'XS', it: '36-38', fr: '34-36', bust: '31-32', waist: '23-24', hip: '33-34' },
    { us: 'S (4-6)', uk: '8-10', eu: '36-38', au: '8-10', jp: 'S', it: '40-42', fr: '38-40', bust: '33-34', waist: '25-26', hip: '35-36' },
    { us: 'M (8-10)', uk: '12-14', eu: '40-42', au: '12-14', jp: 'M', it: '44-46', fr: '42-44', bust: '35-36', waist: '27-28', hip: '37-38' },
    { us: 'L (12-14)', uk: '16-18', eu: '44-46', au: '16-18', jp: 'L', it: '48-50', fr: '46-48', bust: '38-40', waist: '30-32', hip: '40-42' },
    { us: 'XL (16-18)', uk: '20-22', eu: '48-50', au: '20-22', jp: 'XL', it: '52-54', fr: '50-52', bust: '41-43', waist: '33-35', hip: '43-45' },
    { us: 'XXL (20-22)', uk: '24-26', eu: '52-54', au: '24-26', jp: 'XXL', it: '56-58', fr: '54-56', bust: '44-46', waist: '36-38', hip: '46-48' },
  ];

  const womenBottoms: SizeMapping[] = [
    { us: '0', uk: '4', eu: '32', au: '4', it: '36', fr: '34', waist: '23', hip: '33' },
    { us: '2', uk: '6', eu: '34', au: '6', it: '38', fr: '36', waist: '24', hip: '34' },
    { us: '4', uk: '8', eu: '36', au: '8', it: '40', fr: '38', waist: '25', hip: '35' },
    { us: '6', uk: '10', eu: '38', au: '10', it: '42', fr: '40', waist: '26', hip: '36' },
    { us: '8', uk: '12', eu: '40', au: '12', it: '44', fr: '42', waist: '27', hip: '37' },
    { us: '10', uk: '14', eu: '42', au: '14', it: '46', fr: '44', waist: '28', hip: '38' },
    { us: '12', uk: '16', eu: '44', au: '16', it: '48', fr: '46', waist: '30', hip: '40' },
    { us: '14', uk: '18', eu: '46', au: '18', it: '50', fr: '48', waist: '32', hip: '42' },
    { us: '16', uk: '20', eu: '48', au: '20', it: '52', fr: '50', waist: '34', hip: '44' },
  ];

  const womenDresses: SizeMapping[] = [
    { us: '0', uk: '4', eu: '30', au: '4', it: '36', fr: '32', bust: '31', waist: '23', hip: '33' },
    { us: '2', uk: '6', eu: '32', au: '6', it: '38', fr: '34', bust: '32', waist: '24', hip: '34' },
    { us: '4', uk: '8', eu: '34', au: '8', it: '40', fr: '36', bust: '33', waist: '25', hip: '35' },
    { us: '6', uk: '10', eu: '36', au: '10', it: '42', fr: '38', bust: '34', waist: '26', hip: '36' },
    { us: '8', uk: '12', eu: '38', au: '12', it: '44', fr: '40', bust: '35', waist: '27', hip: '37' },
    { us: '10', uk: '14', eu: '40', au: '14', it: '46', fr: '42', bust: '36', waist: '28', hip: '38' },
    { us: '12', uk: '16', eu: '42', au: '16', it: '48', fr: '44', bust: '38', waist: '30', hip: '40' },
    { us: '14', uk: '18', eu: '44', au: '18', it: '50', fr: '46', bust: '40', waist: '32', hip: '42' },
  ];

  const womenBras: SizeMapping[] = [
    { us: '32A', uk: '32A', eu: '70A', au: '10A', fr: '85A', it: '1A' },
    { us: '32B', uk: '32B', eu: '70B', au: '10B', fr: '85B', it: '1B' },
    { us: '34A', uk: '34A', eu: '75A', au: '12A', fr: '90A', it: '2A' },
    { us: '34B', uk: '34B', eu: '75B', au: '12B', fr: '90B', it: '2B' },
    { us: '34C', uk: '34C', eu: '75C', au: '12C', fr: '90C', it: '2C' },
    { us: '36B', uk: '36B', eu: '80B', au: '14B', fr: '95B', it: '3B' },
    { us: '36C', uk: '36C', eu: '80C', au: '14C', fr: '95C', it: '3C' },
    { us: '36D', uk: '36D', eu: '80D', au: '14D', fr: '95D', it: '3D' },
    { us: '38C', uk: '38C', eu: '85C', au: '16C', fr: '100C', it: '4C' },
    { us: '38D', uk: '38D', eu: '85D', au: '16D', fr: '100D', it: '4D' },
  ];

  const womenJeans: SizeMapping[] = [
    { us: '24', uk: '6', eu: '32', au: '6', waist: '24', hip: '34' },
    { us: '25', uk: '6-8', eu: '34', au: '6-8', waist: '25', hip: '35' },
    { us: '26', uk: '8', eu: '34', au: '8', waist: '26', hip: '36' },
    { us: '27', uk: '8-10', eu: '36', au: '8-10', waist: '27', hip: '37' },
    { us: '28', uk: '10', eu: '38', au: '10', waist: '28', hip: '38' },
    { us: '29', uk: '10-12', eu: '38', au: '10-12', waist: '29', hip: '39' },
    { us: '30', uk: '12', eu: '40', au: '12', waist: '30', hip: '40' },
    { us: '31', uk: '12-14', eu: '40', au: '12-14', waist: '31', hip: '41' },
    { us: '32', uk: '14', eu: '42', au: '14', waist: '32', hip: '42' },
  ];

  // Men's size charts
  const menTops: SizeMapping[] = [
    { us: 'XS', uk: 'XS', eu: '44', au: 'XS', jp: 'S', it: '44', bust: '34-36', waist: '28-30' },
    { us: 'S', uk: 'S', eu: '46-48', au: 'S', jp: 'M', it: '46', bust: '36-38', waist: '30-32' },
    { us: 'M', uk: 'M', eu: '48-50', au: 'M', jp: 'L', it: '48', bust: '38-40', waist: '32-34' },
    { us: 'L', uk: 'L', eu: '50-52', au: 'L', jp: 'XL', it: '50', bust: '40-42', waist: '34-36' },
    { us: 'XL', uk: 'XL', eu: '52-54', au: 'XL', jp: 'XXL', it: '52', bust: '42-44', waist: '36-38' },
    { us: 'XXL', uk: 'XXL', eu: '54-56', au: 'XXL', jp: 'XXXL', it: '54', bust: '44-46', waist: '38-40' },
  ];

  const menBottoms: SizeMapping[] = [
    { us: '28', uk: '28', eu: '44', au: '28', waist: '28', hip: '36' },
    { us: '30', uk: '30', eu: '46', au: '30', waist: '30', hip: '38' },
    { us: '32', uk: '32', eu: '48', au: '32', waist: '32', hip: '40' },
    { us: '34', uk: '34', eu: '50', au: '34', waist: '34', hip: '42' },
    { us: '36', uk: '36', eu: '52', au: '36', waist: '36', hip: '44' },
    { us: '38', uk: '38', eu: '54', au: '38', waist: '38', hip: '46' },
    { us: '40', uk: '40', eu: '56', au: '40', waist: '40', hip: '48' },
  ];

  const menJeans: SizeMapping[] = [
    { us: '28', uk: '28', eu: '44', au: '28', waist: '28' },
    { us: '29', uk: '29', eu: '44', au: '29', waist: '29' },
    { us: '30', uk: '30', eu: '46', au: '30', waist: '30' },
    { us: '31', uk: '31', eu: '46', au: '31', waist: '31' },
    { us: '32', uk: '32', eu: '48', au: '32', waist: '32' },
    { us: '33', uk: '33', eu: '48', au: '33', waist: '33' },
    { us: '34', uk: '34', eu: '50', au: '34', waist: '34' },
    { us: '36', uk: '36', eu: '52', au: '36', waist: '36' },
    { us: '38', uk: '38', eu: '54', au: '38', waist: '38' },
  ];

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.gender) {
        setGender(params.gender as Gender);
        hasChanges = true;
      }
      if (params.category) {
        setCategory(params.category as GarmentCategory);
        hasChanges = true;
      }
      if (params.size) {
        setSelectedSize(String(params.size));
        hasChanges = true;
      }
      if (params.fromRegion) {
        setFromRegion(params.fromRegion as Region);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const getSizeChart = (): SizeMapping[] => {
    if (gender === 'women') {
      switch (category) {
        case 'tops': return womenTops;
        case 'bottoms': return womenBottoms;
        case 'dresses': return womenDresses;
        case 'bras': return womenBras;
        case 'jeans': return womenJeans;
      }
    } else {
      switch (category) {
        case 'tops': return menTops;
        case 'bottoms': return menBottoms;
        case 'jeans': return menJeans;
        default: return menTops;
      }
    }
  };

  const sizeChart = getSizeChart();
  const availableSizes = sizeChart.map(s => s[fromRegion] || s.us).filter(Boolean) as string[];

  const currentConversion = useMemo(() => {
    return sizeChart.find(s => s[fromRegion] === selectedSize || s.us === selectedSize);
  }, [selectedSize, fromRegion, sizeChart]);

  const handleCopy = () => {
    if (!currentConversion) return;
    const text = regions
      .filter(r => currentConversion[r.value])
      .map(r => `${r.label}: ${currentConversion[r.value]}`)
      .join(' | ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableCategories = gender === 'women'
    ? [
      { value: 'tops', label: 'Tops/Shirts', icon: '👚' },
      { value: 'bottoms', label: 'Pants/Skirts', icon: '👖' },
      { value: 'dresses', label: 'Dresses', icon: '👗' },
      { value: 'bras', label: 'Bras', icon: '👙' },
      { value: 'jeans', label: 'Jeans', icon: '👖' },
    ]
    : [
      { value: 'tops', label: 'Shirts/Tops', icon: '👔' },
      { value: 'bottoms', label: 'Pants', icon: '👖' },
      { value: 'jeans', label: 'Jeans', icon: '👖' },
    ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-teal-500 flex items-center justify-center">
              <Ruler className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.clothingSizeConverter.clothingSizeConverter', 'Clothing Size Converter')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.clothingSizeConverter.convertBetweenInternationalClothingSizes', 'Convert between international clothing sizes')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-teal-500/10 rounded-xl border border-teal-500/20">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.clothingSizeConverter.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
            </div>
          )}

          {/* Gender Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.clothingSizeConverter.gender', 'Gender')}
            </label>
            <div className="flex gap-2">
              {[
                { value: 'women', label: "Women's", icon: '👩' },
                { value: 'men', label: "Men's", icon: '👨' },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => {
                    setGender(g.value as Gender);
                    setCategory('tops');
                    setSelectedSize(g.value === 'women' ? 'M (8-10)' : 'M');
                  }}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                    gender === g.value
                      ? 'bg-teal-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.clothingSizeConverter.category', 'Category')}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    setCategory(c.value as GarmentCategory);
                    setSelectedSize(availableSizes[Math.floor(availableSizes.length / 2)] || 'M');
                  }}
                  className={`py-2 px-4 rounded-lg flex items-center gap-2 ${
                    category === c.value
                      ? 'bg-teal-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.clothingSizeConverter.fromRegion', 'From Region')}
              </label>
              <select
                value={fromRegion}
                onChange={(e) => {
                  setFromRegion(e.target.value as Region);
                  const newSizes = sizeChart.map(s => s[e.target.value as Region]).filter(Boolean);
                  if (newSizes.length > 0 && !newSizes.includes(selectedSize)) {
                    setSelectedSize(newSizes[Math.floor(newSizes.length / 2)] || '');
                  }
                }}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              >
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.flag} {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.clothingSizeConverter.yourSize', 'Your Size')}
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              >
                {availableSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Size Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedSize === size
                    ? 'bg-teal-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Conversion Results */}
          {currentConversion ? (
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                  <ArrowRightLeft className="w-5 h-5 inline mr-2" />
                  {t('tools.clothingSizeConverter.sizeConversions', 'Size Conversions')}
                </h3>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 ${
                    copied
                      ? 'bg-green-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-white hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('tools.clothingSizeConverter.copied', 'Copied!') : t('tools.clothingSizeConverter.copy', 'Copy')}
                </button>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {regions.map((r) => {
                  const size = currentConversion[r.value];
                  if (!size) return null;

                  return (
                    <div
                      key={r.value}
                      className={`p-3 rounded-lg text-center ${
                        fromRegion === r.value
                          ? isDarkMode ? 'bg-teal-500/30 ring-2 ring-teal-500' : 'bg-teal-100 ring-2 ring-teal-500'
                          : isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}
                    >
                      <div className="text-2xl mb-1">{r.flag}</div>
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {size}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {r.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Body Measurements */}
              {(currentConversion.bust || currentConversion.waist || currentConversion.hip) && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowMeasurements(!showMeasurements)}
                    className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {showMeasurements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showMeasurements ? t('tools.clothingSizeConverter.hide', 'Hide') : t('tools.clothingSizeConverter.show', 'Show')} Body Measurements
                  </button>

                  {showMeasurements && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {currentConversion.bust && (
                        <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clothingSizeConverter.bust', 'Bust')}</p>
                          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currentConversion.bust}"
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {(parseFloat(currentConversion.bust.split('-')[0]) * 2.54).toFixed(0)}-
                            {(parseFloat(currentConversion.bust.split('-')[1] || currentConversion.bust) * 2.54).toFixed(0)} cm
                          </p>
                        </div>
                      )}
                      {currentConversion.waist && (
                        <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clothingSizeConverter.waist', 'Waist')}</p>
                          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currentConversion.waist}"
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {(parseFloat(currentConversion.waist.split('-')[0]) * 2.54).toFixed(0)}-
                            {(parseFloat(currentConversion.waist.split('-')[1] || currentConversion.waist) * 2.54).toFixed(0)} cm
                          </p>
                        </div>
                      )}
                      {currentConversion.hip && (
                        <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.clothingSizeConverter.hip', 'Hip')}</p>
                          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currentConversion.hip}"
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {(parseFloat(currentConversion.hip.split('-')[0]) * 2.54).toFixed(0)}-
                            {(parseFloat(currentConversion.hip.split('-')[1] || currentConversion.hip) * 2.54).toFixed(0)} cm
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={`p-6 rounded-xl text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {t('tools.clothingSizeConverter.selectASizeToSee', 'Select a size to see conversions')}
              </p>
            </div>
          )}

          {/* Size Chart Table */}
          <div className="mb-6">
            <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.clothingSizeConverter.fullSizeChart', 'Full Size Chart')}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {regions.filter(r => sizeChart[0][r.value]).map((r) => (
                      <th key={r.value} className="text-left p-2">
                        {r.flag} {r.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.slice(0, 6).map((row, index) => (
                    <tr
                      key={index}
                      className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${
                        row[fromRegion] === selectedSize ? (isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50') : ''
                      }`}
                    >
                      {regions.filter(r => sizeChart[0][r.value]).map((r) => (
                        <td key={r.value} className="p-2">
                          {row[r.value] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium mb-1">{t('tools.clothingSizeConverter.sizingNotes', 'Sizing Notes:')}</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{t('tools.clothingSizeConverter.sizesAreApproximateAndVary', 'Sizes are approximate and vary by brand and style')}</li>
                <li>{t('tools.clothingSizeConverter.alwaysCheckTheSpecificBrand', 'Always check the specific brand\'s size chart when possible')}</li>
                <li>{t('tools.clothingSizeConverter.measurementsShownAreBodyMeasurements', 'Measurements shown are body measurements, not garment measurements')}</li>
                <li>{t('tools.clothingSizeConverter.whenBetweenSizesConsiderSizing', 'When between sizes, consider sizing up for comfort')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingSizeConverterTool;
