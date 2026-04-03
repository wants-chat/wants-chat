import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Fish, Gauge, Moon, Thermometer, Clock, Info, CloudRain, Sun, Sunrise, Sunset, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type MoonPhase = 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
type WaterType = 'freshwater' | 'saltwater';
type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface SpeciesActivity {
  name: string;
  activity: 'low' | 'moderate' | 'high' | 'excellent';
  lures: string[];
  tips: string;
}

interface FishingTime {
  period: string;
  icon: React.ReactNode;
  rating: number;
  description: string;
}

const moonPhaseLabels: Record<MoonPhase, string> = {
  new: 'New Moon',
  waxing_crescent: 'Waxing Crescent',
  first_quarter: 'First Quarter',
  waxing_gibbous: 'Waxing Gibbous',
  full: 'Full Moon',
  waning_gibbous: 'Waning Gibbous',
  last_quarter: 'Last Quarter',
  waning_crescent: 'Waning Crescent',
};

const moonPhaseEmojis: Record<MoonPhase, string> = {
  new: '🌑',
  waxing_crescent: '🌒',
  first_quarter: '🌓',
  waxing_gibbous: '🌔',
  full: '🌕',
  waning_gibbous: '🌖',
  last_quarter: '🌗',
  waning_crescent: '🌘',
};

interface FishingConditionsToolProps {
  uiConfig?: UIConfig;
}

export const FishingConditionsTool: React.FC<FishingConditionsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [barometricPressure, setBarometricPressure] = useState('30.00');
  const [pressureTrend, setPressureTrend] = useState<'rising' | 'stable' | 'falling'>('stable');
  const [moonPhase, setMoonPhase] = useState<MoonPhase>('new');
  const [waterTemp, setWaterTemp] = useState('65');
  const [waterType, setWaterType] = useState<WaterType>('freshwater');
  const [season, setSeason] = useState<Season>('summer');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.barometricPressure !== undefined) {
        setBarometricPressure(String(params.barometricPressure));
        setIsPrefilled(true);
      }
      if (params.pressureTrend) {
        setPressureTrend(params.pressureTrend as 'rising' | 'stable' | 'falling');
        setIsPrefilled(true);
      }
      if (params.moonPhase) {
        setMoonPhase(params.moonPhase as MoonPhase);
        setIsPrefilled(true);
      }
      if (params.waterTemp !== undefined) {
        setWaterTemp(String(params.waterTemp));
        setIsPrefilled(true);
      }
      if (params.waterType) {
        setWaterType(params.waterType as WaterType);
        setIsPrefilled(true);
      }
      if (params.season) {
        setSeason(params.season as Season);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const getPressureRating = (pressure: number, trend: string): { rating: string; score: number; color: string } => {
    // Barometric pressure effects on fishing
    if (trend === 'falling' && pressure >= 29.80 && pressure <= 30.20) {
      return { rating: 'Excellent', score: 95, color: 'text-green-500' };
    }
    if (trend === 'rising' && pressure >= 30.00 && pressure <= 30.20) {
      return { rating: 'Good', score: 75, color: 'text-blue-500' };
    }
    if (pressure >= 30.20) {
      return { rating: 'Fair', score: 50, color: 'text-yellow-500' };
    }
    if (pressure < 29.80) {
      return { rating: 'Poor', score: 25, color: 'text-red-500' };
    }
    return { rating: 'Moderate', score: 60, color: 'text-blue-400' };
  };

  const getMoonPhaseRating = (phase: MoonPhase): { rating: string; score: number } => {
    const ratings: Record<MoonPhase, { rating: string; score: number }> = {
      new: { rating: 'Excellent', score: 90 },
      full: { rating: 'Excellent', score: 90 },
      first_quarter: { rating: 'Good', score: 70 },
      last_quarter: { rating: 'Good', score: 70 },
      waxing_crescent: { rating: 'Moderate', score: 55 },
      waning_crescent: { rating: 'Moderate', score: 55 },
      waxing_gibbous: { rating: 'Fair', score: 45 },
      waning_gibbous: { rating: 'Fair', score: 45 },
    };
    return ratings[phase];
  };

  const getWaterTempAnalysis = (temp: number, type: WaterType): { rating: string; description: string } => {
    if (type === 'freshwater') {
      if (temp >= 55 && temp <= 75) return { rating: 'Optimal', description: 'Ideal temperature range for most freshwater species' };
      if (temp >= 45 && temp < 55) return { rating: 'Good', description: 'Fish are active but slower metabolism' };
      if (temp > 75 && temp <= 85) return { rating: 'Fair', description: 'Fish may be deeper seeking cooler water' };
      if (temp < 45) return { rating: 'Poor', description: 'Cold water reduces fish activity significantly' };
      return { rating: 'Poor', description: 'Water too warm - fish stressed and inactive' };
    } else {
      if (temp >= 60 && temp <= 80) return { rating: 'Optimal', description: 'Ideal temperature range for most saltwater species' };
      if (temp >= 50 && temp < 60) return { rating: 'Good', description: 'Good for cold-water species' };
      if (temp > 80 && temp <= 85) return { rating: 'Fair', description: 'Some species may move to deeper, cooler water' };
      if (temp < 50) return { rating: 'Poor', description: 'Too cold for most species' };
      return { rating: 'Poor', description: 'Water too warm - limited activity' };
    }
  };

  const calculations = useMemo(() => {
    const pressure = parseFloat(barometricPressure) || 30.00;
    const temp = parseFloat(waterTemp) || 65;

    const pressureAnalysis = getPressureRating(pressure, pressureTrend);
    const moonAnalysis = getMoonPhaseRating(moonPhase);
    const tempAnalysis = getWaterTempAnalysis(temp, waterType);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (pressureAnalysis.score * 0.35) +
      (moonAnalysis.score * 0.25) +
      (tempAnalysis.rating === 'Optimal' ? 90 : tempAnalysis.rating === 'Good' ? 70 : tempAnalysis.rating === 'Fair' ? 50 : 30) * 0.40
    );

    return {
      pressureAnalysis,
      moonAnalysis,
      tempAnalysis,
      overallScore,
    };
  }, [barometricPressure, pressureTrend, moonPhase, waterTemp, waterType]);

  const bestFishingTimes: FishingTime[] = useMemo(() => {
    const moonScore = calculations.moonAnalysis.score;
    const baseModifier = moonPhase === 'new' || moonPhase === 'full' ? 1.2 : 1;

    return [
      {
        period: 'Dawn (First Light)',
        icon: <Sunrise className="w-4 h-4" />,
        rating: Math.min(100, Math.round(85 * baseModifier)),
        description: 'Fish actively feed before sunrise',
      },
      {
        period: 'Morning (6-9 AM)',
        icon: <Sun className="w-4 h-4" />,
        rating: Math.min(100, Math.round(75 * baseModifier)),
        description: 'Good surface activity continues',
      },
      {
        period: 'Midday (11 AM-2 PM)',
        icon: <Sun className="w-4 h-4" />,
        rating: Math.round(40 * baseModifier),
        description: 'Fish move to deeper, cooler water',
      },
      {
        period: 'Afternoon (3-5 PM)',
        icon: <Sun className="w-4 h-4" />,
        rating: Math.round(60 * baseModifier),
        description: 'Activity picks up as temps cool',
      },
      {
        period: 'Dusk (Sunset)',
        icon: <Sunset className="w-4 h-4" />,
        rating: Math.min(100, Math.round(90 * baseModifier)),
        description: 'Peak feeding time for many species',
      },
      {
        period: 'Night',
        icon: <Moon className="w-4 h-4" />,
        rating: moonPhase === 'full' ? 80 : moonPhase === 'new' ? 70 : 50,
        description: moonPhase === 'full' ? 'Full moon increases night activity' : 'Some species feed actively at night',
      },
    ];
  }, [moonPhase, calculations.moonAnalysis.score]);

  const speciesActivity: SpeciesActivity[] = useMemo(() => {
    const temp = parseFloat(waterTemp) || 65;
    const pressure = parseFloat(barometricPressure) || 30.00;

    if (waterType === 'freshwater') {
      return [
        {
          name: 'Bass (Largemouth)',
          activity: temp >= 60 && temp <= 75 && pressureTrend === 'falling' ? 'excellent' :
            temp >= 55 && temp <= 80 ? 'high' : temp >= 45 ? 'moderate' : 'low',
          lures: ['Soft plastics', 'Crankbaits', 'Spinnerbaits', 'Topwater frogs'],
          tips: temp > 75 ? 'Fish deeper structure' : temp < 55 ? 'Slow your presentation' : 'Cover lots of water',
        },
        {
          name: 'Trout',
          activity: temp >= 50 && temp <= 65 ? 'excellent' :
            temp >= 45 && temp <= 70 ? 'high' : temp >= 40 ? 'moderate' : 'low',
          lures: ['Inline spinners', 'Spoons', 'Flies', 'Small crankbaits'],
          tips: temp > 65 ? 'Fish early morning in cooler water' : 'Match the hatch with natural presentations',
        },
        {
          name: 'Walleye',
          activity: temp >= 55 && temp <= 70 && (moonPhase === 'new' || moonPhase === 'full') ? 'excellent' :
            temp >= 50 && temp <= 75 ? 'high' : 'moderate',
          lures: ['Jigs with minnows', 'Crankbaits', 'Worm harnesses', 'Blade baits'],
          tips: 'Low light conditions are best - fish dawn, dusk, or cloudy days',
        },
        {
          name: 'Catfish',
          activity: temp >= 70 && temp <= 85 ? 'excellent' :
            temp >= 60 && temp <= 90 ? 'high' : temp >= 50 ? 'moderate' : 'low',
          lures: ['Cut bait', 'Chicken liver', 'Nightcrawlers', 'Stink baits'],
          tips: 'Best after dark or during rain events',
        },
      ];
    } else {
      return [
        {
          name: 'Redfish',
          activity: temp >= 65 && temp <= 80 ? 'excellent' :
            temp >= 55 && temp <= 85 ? 'high' : 'moderate',
          lures: ['Gold spoons', 'Soft plastic shrimp', 'Topwater plugs', 'Jigs'],
          tips: pressureTrend === 'falling' ? 'Fish shallow flats aggressively' : 'Target deeper channels',
        },
        {
          name: 'Snook',
          activity: temp >= 70 && temp <= 82 ? 'excellent' :
            temp >= 65 && temp <= 85 ? 'high' : temp >= 60 ? 'moderate' : 'low',
          lures: ['Live bait', 'Soft plastics', 'Topwater plugs', 'Swimbaits'],
          tips: 'Focus on structure near moving water',
        },
        {
          name: 'Flounder',
          activity: temp >= 55 && temp <= 75 ? 'excellent' :
            temp >= 50 && temp <= 80 ? 'high' : 'moderate',
          lures: ['Gulp shrimp', 'Bucktail jigs', 'Live minnows', 'Soft plastics'],
          tips: 'Work baits slowly along the bottom near structure',
        },
        {
          name: 'Speckled Trout',
          activity: temp >= 60 && temp <= 75 ? 'excellent' :
            temp >= 55 && temp <= 80 ? 'high' : 'moderate',
          lures: ['MirrOlure', 'Soft plastics', 'Popping corks', 'Topwater'],
          tips: moonPhase === 'full' ? 'Fish the night bite' : 'Target grass flats at dawn',
        },
      ];
    }
  }, [waterTemp, waterType, pressureTrend, moonPhase, barometricPressure]);

  const getActivityColor = (activity: string): string => {
    switch (activity) {
      case 'excellent': return 'text-green-500';
      case 'high': return 'text-blue-500';
      case 'moderate': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  const getActivityBg = (activity: string): string => {
    switch (activity) {
      case 'excellent': return isDark ? 'bg-green-900/30' : 'bg-green-50';
      case 'high': return isDark ? 'bg-blue-900/30' : 'bg-blue-50';
      case 'moderate': return isDark ? 'bg-yellow-900/30' : 'bg-yellow-50';
      default: return isDark ? 'bg-red-900/30' : 'bg-red-50';
    }
  };

  const getOverallRating = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-500' };
    if (score >= 65) return { label: 'Good', color: 'text-blue-500' };
    if (score >= 45) return { label: 'Fair', color: 'text-yellow-500' };
    return { label: 'Poor', color: 'text-red-500' };
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Fish className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fishingConditions.fishingConditionsEvaluator', 'Fishing Conditions Evaluator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.fishingConditions.analyzeConditionsForOptimalFishing', 'Analyze conditions for optimal fishing')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Water Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setWaterType('freshwater')}
            className={`py-2 px-3 rounded-lg text-sm ${waterType === 'freshwater' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.fishingConditions.freshwater', 'Freshwater')}
          </button>
          <button
            onClick={() => setWaterType('saltwater')}
            className={`py-2 px-3 rounded-lg text-sm ${waterType === 'saltwater' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.fishingConditions.saltwater', 'Saltwater')}
          </button>
        </div>

        {/* Barometric Pressure Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Gauge className="w-4 h-4 inline mr-1" />
            {t('tools.fishingConditions.barometricPressureInhg', 'Barometric Pressure (inHg)')}
          </label>
          <input
            type="number"
            step="0.01"
            min="28.00"
            max="31.00"
            value={barometricPressure}
            onChange={(e) => setBarometricPressure(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <div className="flex gap-2 mt-2">
            {(['rising', 'stable', 'falling'] as const).map((trend) => (
              <button
                key={trend}
                onClick={() => setPressureTrend(trend)}
                className={`flex-1 py-2 rounded-lg text-sm capitalize ${pressureTrend === trend ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {trend === 'rising' ? 'Rising' : trend === 'falling' ? t('tools.fishingConditions.falling', 'Falling') : t('tools.fishingConditions.stable', 'Stable')}
              </button>
            ))}
          </div>
        </div>

        {/* Moon Phase Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Moon className="w-4 h-4 inline mr-1" />
            {t('tools.fishingConditions.moonPhase', 'Moon Phase')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(moonPhaseLabels) as MoonPhase[]).map((phase) => (
              <button
                key={phase}
                onClick={() => setMoonPhase(phase)}
                className={`py-2 px-2 rounded-lg text-xs flex flex-col items-center gap-1 ${moonPhase === phase ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <span className="text-lg">{moonPhaseEmojis[phase]}</span>
                <span className="truncate w-full text-center">{moonPhaseLabels[phase].split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Water Temperature */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Thermometer className="w-4 h-4 inline mr-1" />
            {t('tools.fishingConditions.waterTemperatureF', 'Water Temperature (F)')}
          </label>
          <input
            type="number"
            value={waterTemp}
            onChange={(e) => setWaterTemp(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <div className="flex gap-2 mt-2">
            {[45, 55, 65, 75, 85].map((temp) => (
              <button
                key={temp}
                onClick={() => setWaterTemp(temp.toString())}
                className={`flex-1 py-2 rounded-lg text-sm ${parseInt(waterTemp) === temp ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {temp}F
              </button>
            ))}
          </div>
        </div>

        {/* Overall Conditions Score */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fishingConditions.overallFishingConditions', 'Overall Fishing Conditions')}</h4>
            <span className={`text-2xl font-bold ${getOverallRating(calculations.overallScore).color}`}>
              {calculations.overallScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                calculations.overallScore >= 80 ? 'bg-green-500' :
                calculations.overallScore >= 65 ? 'bg-blue-500' :
                calculations.overallScore >= 45 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${calculations.overallScore}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.fishingConditions.pressure', 'Pressure:')}</span>
              <span className={`ml-1 ${calculations.pressureAnalysis.color}`}>{calculations.pressureAnalysis.rating}</span>
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.fishingConditions.moon', 'Moon:')}</span>
              <span className="ml-1">{calculations.moonAnalysis.rating}</span>
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.fishingConditions.temp', 'Temp:')}</span>
              <span className="ml-1">{calculations.tempAnalysis.rating}</span>
            </div>
          </div>
        </div>

        {/* Best Fishing Times */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <Clock className="w-4 h-4 text-cyan-500" />
            {t('tools.fishingConditions.bestFishingTimes', 'Best Fishing Times')}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {bestFishingTimes.map((time, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan-500">{time.icon}</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{time.period}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        time.rating >= 80 ? 'bg-green-500' :
                        time.rating >= 60 ? 'bg-blue-500' :
                        time.rating >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${time.rating}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{time.rating}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Species Activity Predictor */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <Fish className="w-4 h-4 text-cyan-500" />
            {t('tools.fishingConditions.speciesActivityLureRecommendations', 'Species Activity & Lure Recommendations')}
          </h4>
          <div className="space-y-3">
            {speciesActivity.map((species, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${getActivityBg(species.activity)} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{species.name}</span>
                  <span className={`text-sm font-semibold capitalize ${getActivityColor(species.activity)}`}>
                    {species.activity} Activity
                  </span>
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  <span className="font-medium">{t('tools.fishingConditions.recommendedLures', 'Recommended Lures:')}</span> {species.lures.join(', ')}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} italic`}>
                  Tip: {species.tips}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pressure Trend Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.fishingConditions.barometricPressureTips', 'Barometric Pressure Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- <strong>{t('tools.fishingConditions.fallingPressure', 'Falling pressure:')}</strong> {t('tools.fishingConditions.fishFeedAggressivelyBeforeStorms', 'Fish feed aggressively before storms')}</li>
                <li>- <strong>{t('tools.fishingConditions.stablePressure', 'Stable pressure:')}</strong> {t('tools.fishingConditions.consistentButModerateActivity', 'Consistent but moderate activity')}</li>
                <li>- <strong>{t('tools.fishingConditions.risingPressure', 'Rising pressure:')}</strong> {t('tools.fishingConditions.fishAreCautiousSlowPresentations', 'Fish are cautious, slow presentations work best')}</li>
                <li>- <strong>{t('tools.fishingConditions.newFullMoon', 'New/Full moon:')}</strong> {t('tools.fishingConditions.increasedFeedingActivityEspeciallyAt', 'Increased feeding activity, especially at night')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishingConditionsTool;
