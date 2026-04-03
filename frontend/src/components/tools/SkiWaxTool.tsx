import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Snowflake, Thermometer, Mountain, Info, Timer, Gauge, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type SkiType = 'alpine' | 'crosscountry';
type WaxType = 'cold' | 'warm' | 'universal' | 'glide' | 'grip';

interface WaxRecommendation {
  type: WaxType;
  name: string;
  color: string;
  tempRange: string;
  description: string;
  applicationTips: string[];
}

interface FrequencyGuide {
  condition: string;
  frequency: string;
}

interface SkiWaxToolProps {
  uiConfig?: UIConfig;
}

export const SkiWaxTool: React.FC<SkiWaxToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [skiType, setSkiType] = useState<SkiType>('alpine');
  const [snowTemp, setSnowTemp] = useState('');
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.skiType) {
        setSkiType(params.skiType as SkiType);
        setIsPrefilled(true);
      }
      if (params.temperature !== undefined) {
        setSnowTemp(String(params.temperature));
        setIsPrefilled(true);
      }
      if (params.tempUnit) {
        setTempUnit(params.tempUnit as 'celsius' | 'fahrenheit');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const waxTypes: Record<WaxType, WaxRecommendation> = {
    cold: {
      type: 'cold',
      name: 'Cold Wax',
      color: 'Blue/Green',
      tempRange: '-12°C to -6°C (10°F to 21°F)',
      description: 'Hard wax for cold, dry snow conditions. Provides excellent glide on icy or packed snow.',
      applicationTips: [
        'Use a lower iron temperature (110-120°C)',
        'Apply thin, even layers',
        'Allow to cool completely before scraping',
        'Brush thoroughly with a stiff nylon brush',
      ],
    },
    warm: {
      type: 'warm',
      name: 'Warm Wax',
      color: 'Red/Yellow',
      tempRange: '-1°C to +3°C (30°F to 37°F)',
      description: 'Soft wax for warm, wet snow. Repels water and prevents suction on slushy conditions.',
      applicationTips: [
        'Use a higher iron temperature (130-140°C)',
        'Apply a thicker base layer',
        'Scrape while still slightly warm',
        'Finish with a soft brush for best results',
      ],
    },
    universal: {
      type: 'universal',
      name: 'Universal/All-Temp Wax',
      color: 'Purple/White',
      tempRange: '-10°C to 0°C (14°F to 32°F)',
      description: 'Versatile wax for varied conditions. Great for recreational skiers and changing weather.',
      applicationTips: [
        'Iron at medium temperature (120-130°C)',
        'Good for base maintenance',
        'Ideal for travel or uncertain conditions',
        'Can be mixed with specialty waxes',
      ],
    },
    glide: {
      type: 'glide',
      name: 'Glide Wax (XC)',
      color: 'Varies by temp',
      tempRange: 'Full ski length zones',
      description: 'Applied to tips and tails of cross-country skis. Maximizes speed on downhills and flats.',
      applicationTips: [
        'Apply to glide zones only (tips and tails)',
        'Match temperature to snow conditions',
        'Use fluorocarbon overlays for racing',
        'Cork in after hot waxing for extra speed',
      ],
    },
    grip: {
      type: 'grip',
      name: 'Grip/Kick Wax (XC)',
      color: 'Temp-specific colors',
      tempRange: 'Kick zone only',
      description: 'Applied to the kick zone under the binding. Provides traction for classic skiing technique.',
      applicationTips: [
        'Apply only to kick zone (under foot)',
        'Layer thin coats, cork between layers',
        'Test grip before full application',
        'Carry spare waxes for changing conditions',
      ],
    },
  };

  const frequencyGuide: FrequencyGuide[] = [
    { condition: 'Racing/Competition', frequency: 'Every run or race' },
    { condition: 'Aggressive/Daily skiing', frequency: 'Every 2-3 days on snow' },
    { condition: 'Recreational (weekly)', frequency: 'Every 4-6 ski days' },
    { condition: 'Casual/Occasional', frequency: 'Start and mid-season' },
    { condition: 'Base/Storage prep', frequency: 'End of season' },
  ];

  const tempInCelsius = useMemo(() => {
    const temp = parseFloat(snowTemp);
    if (isNaN(temp)) return null;
    return tempUnit === 'fahrenheit' ? (temp - 32) * (5 / 9) : temp;
  }, [snowTemp, tempUnit]);

  const recommendedWax = useMemo((): WaxRecommendation | null => {
    if (tempInCelsius === null) return null;

    if (skiType === 'crosscountry') {
      // For cross-country, recommend both glide and grip
      return null; // Will show special XC section instead
    }

    // Alpine/downhill recommendations
    if (tempInCelsius < -6) {
      return waxTypes.cold;
    } else if (tempInCelsius > 0) {
      return waxTypes.warm;
    } else {
      return waxTypes.universal;
    }
  }, [tempInCelsius, skiType, waxTypes]);

  const getXCRecommendations = useMemo(() => {
    if (tempInCelsius === null || skiType !== 'crosscountry') return null;

    let glideType: 'cold' | 'warm' | 'universal';
    let gripAdvice: string;

    if (tempInCelsius < -6) {
      glideType = 'cold';
      gripAdvice = 'Use hard grip wax (blue/green). Apply thin layers and cork well.';
    } else if (tempInCelsius > 0) {
      glideType = 'warm';
      gripAdvice = 'Use klister or soft grip wax. Be prepared for challenging grip conditions.';
    } else {
      glideType = 'universal';
      gripAdvice = 'Use medium grip wax (violet/red). Layering may be needed.';
    }

    return {
      glide: waxTypes[glideType],
      gripAdvice,
    };
  }, [tempInCelsius, skiType, waxTypes]);

  const getWaxColorClass = (type: WaxType) => {
    switch (type) {
      case 'cold':
        return 'text-blue-500';
      case 'warm':
        return 'text-red-500';
      case 'universal':
        return 'text-purple-500';
      case 'glide':
        return 'text-cyan-500';
      case 'grip':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Snowflake className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiWax.skiWaxAdvisor', 'Ski Wax Advisor')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.skiWax.getTheRightWaxFor', 'Get the right wax for your conditions')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Ski Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.skiWax.skiType', 'Ski Type')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSkiType('alpine')}
              className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${skiType === 'alpine' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <Mountain className="w-4 h-4" />
              {t('tools.skiWax.alpineDownhill', 'Alpine/Downhill')}
            </button>
            <button
              onClick={() => setSkiType('crosscountry')}
              className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${skiType === 'crosscountry' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <Gauge className="w-4 h-4" />
              {t('tools.skiWax.crossCountry', 'Cross-Country')}
            </button>
          </div>
        </div>

        {/* Temperature Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Thermometer className="w-4 h-4 inline mr-1" />
            {t('tools.skiWax.snowTemperature', 'Snow Temperature')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={snowTemp}
              onChange={(e) => setSnowTemp(e.target.value)}
              placeholder={t('tools.skiWax.enterTemperature', 'Enter temperature')}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
            />
            <button
              onClick={() => setTempUnit('celsius')}
              className={`px-4 py-2 rounded-lg ${tempUnit === 'celsius' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              °C
            </button>
            <button
              onClick={() => setTempUnit('fahrenheit')}
              className={`px-4 py-2 rounded-lg ${tempUnit === 'fahrenheit' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              °F
            </button>
          </div>
        </div>

        {/* Recommendation Result - Alpine */}
        {recommendedWax && skiType === 'alpine' && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiWax.recommendedWax', 'Recommended Wax')}</h4>
              <span className={`font-bold ${getWaxColorClass(recommendedWax.type)}`}>{recommendedWax.name}</span>
            </div>
            <div className="space-y-2">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">{t('tools.skiWax.color', 'Color:')}</span> {recommendedWax.color}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">{t('tools.skiWax.tempRange', 'Temp Range:')}</span> {recommendedWax.tempRange}
              </div>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {recommendedWax.description}
              </p>
            </div>
          </div>
        )}

        {/* Recommendation Result - Cross-Country */}
        {getXCRecommendations && skiType === 'crosscountry' && (
          <div className="space-y-4">
            {/* Glide Wax */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiWax.glideWaxTipsTails', 'Glide Wax (Tips & Tails)')}</h4>
                <span className={`font-bold ${getWaxColorClass(getXCRecommendations.glide.type)}`}>
                  {getXCRecommendations.glide.name}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {getXCRecommendations.glide.description}
              </p>
            </div>

            {/* Grip Wax */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiWax.gripKickWaxUnderBinding', 'Grip/Kick Wax (Under Binding)')}</h4>
                <span className="font-bold text-orange-500">{t('tools.skiWax.gripZone', 'Grip Zone')}</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {getXCRecommendations.gripAdvice}
              </p>
            </div>
          </div>
        )}

        {/* Application Tips */}
        {recommendedWax && skiType === 'alpine' && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiWax.applicationTips', 'Application Tips')}</h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {recommendedWax.applicationTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Wax Type Overview */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiWax.waxTypesOverview', 'Wax Types Overview')}</h4>
          <div className="grid grid-cols-1 gap-2">
            {(['cold', 'universal', 'warm'] as WaxType[]).map((type) => (
              <div
                key={type}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${getWaxColorClass(type)}`}>{waxTypes[type].name}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {waxTypes[type].tempRange}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequency Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-cyan-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.skiWax.waxingFrequencyGuide', 'Waxing Frequency Guide')}</h4>
          </div>
          <div className="space-y-2">
            {frequencyGuide.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{item.condition}</span>
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.frequency}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.skiWax.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Always start with a clean, dry base</li>
                <li>• Use a proper waxing iron, not a household iron</li>
                <li>• Let wax cool for 20-30 minutes before scraping</li>
                <li>• Scrape tip-to-tail, never tail-to-tip</li>
                <li>• Brush thoroughly for best glide performance</li>
                <li>• Store skis with a thick wax coat to protect the base</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkiWaxTool;
