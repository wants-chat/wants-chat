import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Ruler, ArrowLeftRight, Info, Lightbulb, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RingSizeData {
  us: number;
  uk: string;
  eu: number;
  diameter: number;
  circumference: number;
}

const ringSizeData: RingSizeData[] = [
  { us: 3, uk: 'D½', eu: 44, diameter: 14.1, circumference: 44.2 },
  { us: 3.5, uk: 'E½', eu: 45, diameter: 14.5, circumference: 45.5 },
  { us: 4, uk: 'G½', eu: 47, diameter: 14.9, circumference: 46.8 },
  { us: 4.5, uk: 'H½', eu: 48, diameter: 15.3, circumference: 48.0 },
  { us: 5, uk: 'J½', eu: 49, diameter: 15.7, circumference: 49.3 },
  { us: 5.5, uk: 'K½', eu: 50, diameter: 16.1, circumference: 50.6 },
  { us: 6, uk: 'L', eu: 52, diameter: 16.5, circumference: 51.9 },
  { us: 6.5, uk: 'M', eu: 53, diameter: 16.9, circumference: 53.1 },
  { us: 7, uk: 'N½', eu: 54, diameter: 17.3, circumference: 54.4 },
  { us: 7.5, uk: 'O½', eu: 55, diameter: 17.7, circumference: 55.7 },
  { us: 8, uk: 'P½', eu: 57, diameter: 18.1, circumference: 56.9 },
  { us: 8.5, uk: 'Q½', eu: 58, diameter: 18.5, circumference: 58.2 },
  { us: 9, uk: 'R½', eu: 59, diameter: 18.9, circumference: 59.5 },
  { us: 9.5, uk: 'S½', eu: 61, diameter: 19.4, circumference: 60.8 },
  { us: 10, uk: 'T½', eu: 62, diameter: 19.8, circumference: 62.1 },
  { us: 10.5, uk: 'U½', eu: 63, diameter: 20.2, circumference: 63.4 },
  { us: 11, uk: 'V½', eu: 64, diameter: 20.6, circumference: 64.6 },
  { us: 11.5, uk: 'W½', eu: 66, diameter: 21.0, circumference: 65.9 },
  { us: 12, uk: 'X½', eu: 67, diameter: 21.4, circumference: 67.2 },
  { us: 12.5, uk: 'Z', eu: 68, diameter: 21.8, circumference: 68.5 },
  { us: 13, uk: 'Z+1', eu: 69, diameter: 22.2, circumference: 69.7 },
  { us: 13.5, uk: 'Z+1½', eu: 70, diameter: 22.6, circumference: 71.0 },
  { us: 14, uk: 'Z+2', eu: 72, diameter: 23.0, circumference: 72.3 },
];

type InputMethod = 'circumference' | 'us' | 'uk' | 'eu';
type MeasurementUnit = 'mm' | 'inches';

interface RingSizeCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const RingSizeCalculatorTool: React.FC<RingSizeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [inputMethod, setInputMethod] = useState<InputMethod>('circumference');
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('mm');
  const [circumferenceValue, setCircumferenceValue] = useState<string>('');
  const [selectedUS, setSelectedUS] = useState<string>('');
  const [selectedUK, setSelectedUK] = useState<string>('');
  const [selectedEU, setSelectedEU] = useState<string>('');
  const [showTips, setShowTips] = useState<boolean>(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setCircumferenceValue(String(params.amount));
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.circumference) setCircumferenceValue(params.formData.circumference);
        if (params.formData.inputMethod) setInputMethod(params.formData.inputMethod as InputMethod);
        if (params.formData.measurementUnit) setMeasurementUnit(params.formData.measurementUnit as MeasurementUnit);
        if (params.formData.usSize) setSelectedUS(params.formData.usSize);
        if (params.formData.ukSize) setSelectedUK(params.formData.ukSize);
        if (params.formData.euSize) setSelectedEU(params.formData.euSize);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const findClosestSize = (circumference: number): RingSizeData | null => {
    if (circumference < ringSizeData[0].circumference) return ringSizeData[0];
    if (circumference > ringSizeData[ringSizeData.length - 1].circumference) {
      return ringSizeData[ringSizeData.length - 1];
    }

    let closest = ringSizeData[0];
    let minDiff = Math.abs(circumference - closest.circumference);

    for (const size of ringSizeData) {
      const diff = Math.abs(circumference - size.circumference);
      if (diff < minDiff) {
        minDiff = diff;
        closest = size;
      }
    }

    return closest;
  };

  const convertedSize = useMemo((): RingSizeData | null => {
    switch (inputMethod) {
      case 'circumference': {
        if (!circumferenceValue) return null;
        let circMm = parseFloat(circumferenceValue);
        if (isNaN(circMm)) return null;
        if (measurementUnit === 'inches') {
          circMm = circMm * 25.4;
        }
        return findClosestSize(circMm);
      }
      case 'us': {
        if (!selectedUS) return null;
        const usSize = parseFloat(selectedUS);
        return ringSizeData.find(s => s.us === usSize) || null;
      }
      case 'uk': {
        if (!selectedUK) return null;
        return ringSizeData.find(s => s.uk === selectedUK) || null;
      }
      case 'eu': {
        if (!selectedEU) return null;
        const euSize = parseInt(selectedEU);
        return ringSizeData.find(s => s.eu === euSize) || null;
      }
      default:
        return null;
    }
  }, [inputMethod, circumferenceValue, measurementUnit, selectedUS, selectedUK, selectedEU]);

  const resetInputs = () => {
    setCircumferenceValue('');
    setSelectedUS('');
    setSelectedUK('');
    setSelectedEU('');
  };

  const handleMethodChange = (method: InputMethod) => {
    setInputMethod(method);
    resetInputs();
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            isDark ? 'bg-purple-900/50' : 'bg-purple-100'
          }`}>
            <Circle className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.ringSizeCalculator.ringSizeCalculator', 'Ring Size Calculator')}
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.ringSizeCalculator.convertBetweenUsUkAnd', 'Convert between US, UK, and EU ring sizes or measure your finger')}
          </p>
        </div>

        {isPrefilled && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20 max-w-4xl mx-auto">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.ringSizeCalculator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Input Method Selection */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <ArrowLeftRight className="w-5 h-5" />
            {t('tools.ringSizeCalculator.selectInputMethod', 'Select Input Method')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'circumference', label: 'Circumference' },
              { value: 'us', label: 'US Size' },
              { value: 'uk', label: 'UK Size' },
              { value: 'eu', label: 'EU Size' },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => handleMethodChange(method.value as InputMethod)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  inputMethod === method.value
                    ? isDark
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-500 text-white'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Ruler className="w-5 h-5" />
            {t('tools.ringSizeCalculator.enterMeasurement', 'Enter Measurement')}
          </h2>

          {inputMethod === 'circumference' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setMeasurementUnit('mm')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    measurementUnit === 'mm'
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.ringSizeCalculator.millimetersMm', 'Millimeters (mm)')}
                </button>
                <button
                  onClick={() => setMeasurementUnit('inches')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    measurementUnit === 'inches'
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.ringSizeCalculator.inchesIn', 'Inches (in)')}
                </button>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Finger Circumference ({measurementUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={circumferenceValue}
                  onChange={(e) => setCircumferenceValue(e.target.value)}
                  placeholder={measurementUnit === 'mm' ? 'e.g., 54.4' : 'e.g., 2.14'}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>
            </div>
          )}

          {inputMethod === 'us' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('tools.ringSizeCalculator.usRingSize', 'US Ring Size')}
              </label>
              <select
                value={selectedUS}
                onChange={(e) => setSelectedUS(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              >
                <option value="">{t('tools.ringSizeCalculator.selectUsSize', 'Select US size...')}</option>
                {ringSizeData.map((size) => (
                  <option key={size.us} value={size.us}>
                    US {size.us}
                  </option>
                ))}
              </select>
            </div>
          )}

          {inputMethod === 'uk' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('tools.ringSizeCalculator.ukRingSize', 'UK Ring Size')}
              </label>
              <select
                value={selectedUK}
                onChange={(e) => setSelectedUK(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              >
                <option value="">{t('tools.ringSizeCalculator.selectUkSize', 'Select UK size...')}</option>
                {ringSizeData.map((size) => (
                  <option key={size.uk} value={size.uk}>
                    UK {size.uk}
                  </option>
                ))}
              </select>
            </div>
          )}

          {inputMethod === 'eu' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('tools.ringSizeCalculator.euRingSize', 'EU Ring Size')}
              </label>
              <select
                value={selectedEU}
                onChange={(e) => setSelectedEU(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              >
                <option value="">{t('tools.ringSizeCalculator.selectEuSize', 'Select EU size...')}</option>
                {ringSizeData.map((size) => (
                  <option key={size.eu} value={size.eu}>
                    EU {size.eu}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Conversion Result */}
        {convertedSize && (
          <div className={`rounded-xl p-6 mb-6 ${
            isDark ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50' : 'bg-gradient-to-br from-purple-50 to-blue-50'
          } shadow-lg border ${isDark ? 'border-purple-700/50' : 'border-purple-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.ringSizeCalculator.yourRingSize', 'Your Ring Size')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.ringSizeCalculator.usSize', 'US Size')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {convertedSize.us}
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.ringSizeCalculator.ukSize', 'UK Size')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {convertedSize.uk}
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.ringSizeCalculator.euSize', 'EU Size')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {convertedSize.eu}
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.ringSizeCalculator.diameter', 'Diameter')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  {convertedSize.diameter}mm
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800/50' : 'bg-white/80'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.ringSizeCalculator.circumference', 'Circumference')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                  {convertedSize.circumference}mm
                </p>
              </div>
            </div>

            {/* Visual Ring Size Guide */}
            <div className="mt-6 flex justify-center">
              <div className="relative">
                <div
                  className={`rounded-full border-4 ${isDark ? 'border-purple-500' : 'border-purple-400'}`}
                  style={{
                    width: `${convertedSize.diameter * 4}px`,
                    height: `${convertedSize.diameter * 4}px`,
                  }}
                />
                <div className={`absolute inset-0 flex items-center justify-center text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {convertedSize.diameter}mm
                </div>
              </div>
            </div>
            <p className={`text-center text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.ringSizeCalculator.visualRepresentation4xActualSize', 'Visual representation (4x actual size)')}
            </p>
          </div>
        )}

        {/* Tips Section */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <button
            onClick={() => setShowTips(!showTips)}
            className={`w-full flex items-center justify-between text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              {t('tools.ringSizeCalculator.tipsForMeasuringRingSize', 'Tips for Measuring Ring Size at Home')}
            </span>
            <span className={`transform transition-transform ${showTips ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {showTips && (
            <div className={`mt-4 space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.ringSizeCalculator.stringPaperMethod', 'String/Paper Method')}
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>{t('tools.ringSizeCalculator.cutAThinStripOf', 'Cut a thin strip of paper or string')}</li>
                  <li>{t('tools.ringSizeCalculator.wrapItAroundTheBase', 'Wrap it around the base of your finger')}</li>
                  <li>{t('tools.ringSizeCalculator.markWhereThePaperString', 'Mark where the paper/string overlaps')}</li>
                  <li>{t('tools.ringSizeCalculator.measureTheLengthInMm', 'Measure the length in mm - this is your circumference')}</li>
                </ol>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.ringSizeCalculator.existingRingMethod', 'Existing Ring Method')}
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>{t('tools.ringSizeCalculator.findARingThatFits', 'Find a ring that fits the intended finger well')}</li>
                  <li>{t('tools.ringSizeCalculator.measureTheInsideDiameterOf', 'Measure the inside diameter of the ring in mm')}</li>
                  <li>{t('tools.ringSizeCalculator.multiplyBy314159To', 'Multiply by 3.14159 to get the circumference')}</li>
                </ol>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-2">
                  <Info className={`w-5 h-5 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <div>
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      {t('tools.ringSizeCalculator.importantTips', 'Important Tips')}
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>{t('tools.ringSizeCalculator.measureAtTheEndOf', 'Measure at the end of the day when fingers are largest')}</li>
                      <li>{t('tools.ringSizeCalculator.measureMultipleTimesForAccuracy', 'Measure multiple times for accuracy')}</li>
                      <li>{t('tools.ringSizeCalculator.considerTheRingWidthWider', 'Consider the ring width - wider bands need a larger size')}</li>
                      <li>{t('tools.ringSizeCalculator.temperatureAffectsFingerSizeAvoid', 'Temperature affects finger size - avoid extreme cold/heat')}</li>
                      <li>{t('tools.ringSizeCalculator.whenInDoubtSizeUp', 'When in doubt, size up - rings can be resized smaller easier')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Size Conversion Table */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.ringSizeCalculator.ringSizeConversionChart', 'Ring Size Conversion Chart')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                  <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.ringSizeCalculator.us', 'US')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.ringSizeCalculator.uk', 'UK')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.ringSizeCalculator.eu', 'EU')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.ringSizeCalculator.diameterMm', 'Diameter (mm)')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.ringSizeCalculator.circumferenceMm', 'Circumference (mm)')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ringSizeData.map((size, index) => (
                  <tr
                    key={size.us}
                    className={`border-t ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    } ${
                      convertedSize?.us === size.us
                        ? isDark
                          ? 'bg-purple-900/30'
                          : 'bg-purple-100'
                        : index % 2 === 0
                          ? isDark
                            ? 'bg-gray-800'
                            : 'bg-white'
                          : isDark
                            ? 'bg-gray-750'
                            : 'bg-gray-50'
                    }`}
                  >
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {size.us}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {size.uk}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {size.eu}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {size.diameter}
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {size.circumference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingSizeCalculatorTool;
