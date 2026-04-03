import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Clock, Shield, AlertTriangle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface UVLevel {
  min: number;
  max: number;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  protectionTips: string[];
  outdoorRecommendation: string;
}

interface SkinType {
  type: string;
  name: string;
  description: string;
  burnTime: number; // Base minutes to burn at UV index 1
}

const UV_LEVELS: UVLevel[] = [
  {
    min: 0,
    max: 2,
    label: 'Low',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
    description: 'Minimal sun protection required for normal activity.',
    protectionTips: [
      'Wear sunglasses on bright days',
      'Use sunscreen if you burn easily',
      'Safe for extended outdoor activities'
    ],
    outdoorRecommendation: 'Safe to be outside at any time'
  },
  {
    min: 3,
    max: 5,
    label: 'Moderate',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    description: 'Some protection needed. Stay in shade near midday.',
    protectionTips: [
      'Wear protective clothing',
      'Use SPF 30+ sunscreen',
      'Wear a hat and sunglasses',
      'Seek shade during midday hours'
    ],
    outdoorRecommendation: 'Best to limit sun exposure between 10am-4pm'
  },
  {
    min: 6,
    max: 7,
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    description: 'Protection essential. Reduce time in the sun.',
    protectionTips: [
      'Reduce sun exposure between 10am-4pm',
      'Apply SPF 30+ sunscreen every 2 hours',
      'Wear protective clothing, hat, and sunglasses',
      'Seek shade whenever possible'
    ],
    outdoorRecommendation: 'Limit outdoor activities during peak hours (10am-4pm)'
  },
  {
    min: 8,
    max: 10,
    label: 'Very High',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    description: 'Extra protection needed. Avoid being outside during midday.',
    protectionTips: [
      'Minimize sun exposure between 10am-4pm',
      'Apply SPF 50+ sunscreen generously',
      'Wear sun-protective clothing and wide-brim hat',
      'Stay in shade as much as possible',
      'Reapply sunscreen every 90 minutes'
    ],
    outdoorRecommendation: 'Avoid outdoor activities between 10am-4pm if possible'
  },
  {
    min: 11,
    max: 20,
    label: 'Extreme',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    description: 'Take all precautions. Unprotected skin can burn in minutes.',
    protectionTips: [
      'Avoid sun exposure between 10am-4pm',
      'Apply SPF 50+ sunscreen every hour',
      'Seek shade at all times',
      'Wear long sleeves, pants, and wide-brim hat',
      'Use UV-blocking sunglasses',
      'Check UV forecast before going outside'
    ],
    outdoorRecommendation: 'Stay indoors during peak UV hours (10am-4pm)'
  }
];

const SKIN_TYPES: SkinType[] = [
  {
    type: 'I',
    name: 'Very Fair',
    description: 'Pale white skin, light eyes, freckles. Always burns, never tans.',
    burnTime: 67
  },
  {
    type: 'II',
    name: 'Fair',
    description: 'White skin, light eyes. Burns easily, tans minimally.',
    burnTime: 100
  },
  {
    type: 'III',
    name: 'Medium',
    description: 'Light brown skin. Sometimes burns, tans uniformly.',
    burnTime: 200
  },
  {
    type: 'IV',
    name: 'Olive',
    description: 'Moderate brown skin. Burns minimally, tans well.',
    burnTime: 300
  },
  {
    type: 'V',
    name: 'Brown',
    description: 'Dark brown skin. Rarely burns, tans easily.',
    burnTime: 400
  },
  {
    type: 'VI',
    name: 'Dark Brown/Black',
    description: 'Very dark brown to black skin. Never burns.',
    burnTime: 500
  }
];

const SPF_RECOMMENDATIONS = [
  { uvMin: 0, uvMax: 2, spf: 15, reapply: 'every 2 hours' },
  { uvMin: 3, uvMax: 5, spf: 30, reapply: 'every 2 hours' },
  { uvMin: 6, uvMax: 7, spf: 30, reapply: 'every 2 hours' },
  { uvMin: 8, uvMax: 10, spf: 50, reapply: 'every 90 minutes' },
  { uvMin: 11, uvMax: 20, spf: 50, reapply: 'every hour' }
];

interface UVIndexCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const UVIndexCalculatorTool: React.FC<UVIndexCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [uvIndex, setUvIndex] = useState<number>(5);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setUvIndex(Number(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setUvIndex(Number(numMatch[0]));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);
  const [selectedSkinType, setSelectedSkinType] = useState<string>('II');

  const currentUVLevel = useMemo(() => {
    return UV_LEVELS.find(level => uvIndex >= level.min && uvIndex <= level.max) || UV_LEVELS[0];
  }, [uvIndex]);

  const selectedSkin = useMemo(() => {
    return SKIN_TYPES.find(skin => skin.type === selectedSkinType) || SKIN_TYPES[1];
  }, [selectedSkinType]);

  const timeToSunburn = useMemo(() => {
    if (uvIndex === 0) return Infinity;
    const minutes = selectedSkin.burnTime / uvIndex;
    return Math.round(minutes);
  }, [uvIndex, selectedSkin]);

  const spfRecommendation = useMemo(() => {
    return SPF_RECOMMENDATIONS.find(rec => uvIndex >= rec.uvMin && uvIndex <= rec.uvMax) || SPF_RECOMMENDATIONS[0];
  }, [uvIndex]);

  const formatBurnTime = (minutes: number): string => {
    if (minutes === Infinity || minutes > 480) return 'Very unlikely to burn';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minutes`;
  };

  const getUVScalePosition = (): number => {
    const maxUV = 11;
    return Math.min((uvIndex / maxUV) * 100, 100);
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
              <Sun className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.uVIndexCalculator.uvIndexCalculator', 'UV Index Calculator')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.uVIndexCalculator.calculateSunExposureRisksAnd', 'Calculate sun exposure risks and get protection recommendations')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mt-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.uVIndexCalculator.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}
        </div>

        {/* UV Index Input */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.uVIndexCalculator.currentUvIndex', 'Current UV Index')}
          </h2>

          {/* UV Scale Meter */}
          <div className="mb-6">
            <div className="relative h-8 rounded-full overflow-hidden bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 via-red-500 to-purple-500">
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-300"
                style={{ left: `${getUVScalePosition()}%`, transform: 'translateX(-50%)' }}
              >
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-bold ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                  {uvIndex}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>0</span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>11+</span>
            </div>
          </div>

          {/* UV Index Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="11"
              step="1"
              value={uvIndex}
              onChange={(e) => setUvIndex(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              style={{
                background: isDark
                  ? t('tools.uVIndexCalculator.linearGradientToRight22c55e', 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444, #a855f7)') : t('tools.uVIndexCalculator.linearGradientToRight22c55e2', 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444, #a855f7)')
              }}
            />
            <div className="flex justify-center">
              <input
                type="number"
                min="0"
                max="15"
                value={uvIndex}
                onChange={(e) => setUvIndex(Math.max(0, Math.min(15, Number(e.target.value))))}
                className={`w-20 text-center text-2xl font-bold rounded-lg p-2 ${
                  isDark
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-gray-100 text-gray-900 border-gray-300'
                } border`}
              />
            </div>
          </div>

          {/* Current Level Display */}
          <div className={`mt-4 p-4 rounded-lg border-2 ${currentUVLevel.borderColor} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${currentUVLevel.bgColor}`} />
              <span className={`text-xl font-bold ${currentUVLevel.color}`}>
                {currentUVLevel.label}
              </span>
            </div>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentUVLevel.description}
            </p>
          </div>
        </div>

        {/* Skin Type Selector */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.uVIndexCalculator.yourSkinTypeFitzpatrickScale', 'Your Skin Type (Fitzpatrick Scale)')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SKIN_TYPES.map((skin) => (
              <button
                key={skin.type}
                onClick={() => setSelectedSkinType(skin.type)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedSkinType === skin.type
                    ? isDark
                      ? 'border-yellow-500 bg-yellow-500/20'
                      : 'border-yellow-500 bg-yellow-50'
                    : isDark
                      ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Type {skin.type}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {skin.name}
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {skin.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Time to Sunburn */}
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <Clock className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.uVIndexCalculator.timeToSunburn', 'Time to Sunburn')}
              </h2>
            </div>
            <div className={`text-3xl font-bold mb-2 ${
              timeToSunburn <= 15
                ? 'text-red-500'
                : timeToSunburn <= 30
                  ? 'text-orange-500'
                  : timeToSunburn <= 60
                    ? 'text-yellow-500'
                    : isDark
                      ? 'text-green-400'
                      : 'text-green-600'
            }`}>
              {formatBurnTime(timeToSunburn)}
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Estimated time without sun protection for {selectedSkin.name.toLowerCase()} skin at UV index {uvIndex}
            </p>
            {timeToSunburn <= 30 && (
              <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${isDark ? 'bg-red-500/20' : 'bg-red-50'}`}>
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                  {t('tools.uVIndexCalculator.highBurnRiskSunProtection', 'High burn risk! Sun protection is essential.')}
                </span>
              </div>
            )}
          </div>

          {/* SPF Recommendation */}
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Shield className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.uVIndexCalculator.spfRecommendation', 'SPF Recommendation')}
              </h2>
            </div>
            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              SPF {spfRecommendation.spf}+
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Reapply {spfRecommendation.reapply}
            </p>
            <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                {t('tools.uVIndexCalculator.applySunscreen1530Minutes', 'Apply sunscreen 15-30 minutes before sun exposure. Use about 1 oz (shot glass) for full body coverage.')}
              </p>
            </div>
          </div>
        </div>

        {/* Protection Tips */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <Shield className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Protection Tips for {currentUVLevel.label} UV
            </h2>
          </div>
          <ul className="space-y-2">
            {currentUVLevel.protectionTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${currentUVLevel.bgColor}`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Outdoor Activity Recommendation */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Sun className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.uVIndexCalculator.recommendedOutdoorActivityTimes', 'Recommended Outdoor Activity Times')}
            </h2>
          </div>
          <div className={`p-4 rounded-lg border-2 ${currentUVLevel.borderColor} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className={`text-lg ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {currentUVLevel.outdoorRecommendation}
            </p>
          </div>
          <div className={`mt-4 grid grid-cols-2 gap-4`}>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.uVIndexCalculator.bestTimes', 'Best Times')}
              </p>
              <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {t('tools.uVIndexCalculator.before10amAfter4pm', 'Before 10am, After 4pm')}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.uVIndexCalculator.peakUvHours', 'Peak UV Hours')}
              </p>
              <p className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                10am - 4pm
              </p>
            </div>
          </div>
        </div>

        {/* UV Index Reference */}
        <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.uVIndexCalculator.uvIndexReference', 'UV Index Reference')}
          </h2>
          <div className="space-y-2">
            {UV_LEVELS.map((level) => (
              <div
                key={level.label}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  currentUVLevel.label === level.label
                    ? isDark
                      ? 'bg-gray-700 ring-2 ring-yellow-500'
                      : 'bg-gray-100 ring-2 ring-yellow-500'
                    : ''
                }`}
              >
                <div className={`w-16 h-8 rounded flex items-center justify-center text-white font-bold ${level.bgColor}`}>
                  {level.min}-{level.max === 20 ? '11+' : level.max}
                </div>
                <div className="flex-1">
                  <span className={`font-medium ${level.color}`}>{level.label}</span>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {level.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UVIndexCalculatorTool;
