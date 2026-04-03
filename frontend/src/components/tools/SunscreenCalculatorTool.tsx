import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Droplets, Clock, AlertTriangle, Info, User, Shield, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type SkinType = 'type1' | 'type2' | 'type3' | 'type4' | 'type5' | 'type6';
type ActivityLevel = 'indoor' | 'outdoor_light' | 'outdoor_active' | 'water_sports';

interface SkinTypeConfig {
  name: string;
  description: string;
  burnTime: number; // minutes to burn without protection
  recommendedSPF: number;
  characteristics: string;
}

interface ActivityConfig {
  name: string;
  reapplyInterval: number; // minutes
  multiplier: number; // amount multiplier
}

interface SunscreenCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SunscreenCalculatorTool: React.FC<SunscreenCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [skinType, setSkinType] = useState<SkinType>('type2');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('outdoor_light');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [exposureHours, setExposureHours] = useState('2');
  const [uvIndex, setUvIndex] = useState('6');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.skinType && ['type1', 'type2', 'type3', 'type4', 'type5', 'type6'].includes(params.skinType)) {
        setSkinType(params.skinType as SkinType);
        hasChanges = true;
      }
      if (params.activityLevel && ['indoor', 'outdoor_light', 'outdoor_active', 'water_sports'].includes(params.activityLevel)) {
        setActivityLevel(params.activityLevel as ActivityLevel);
        hasChanges = true;
      }
      if (params.height && !isNaN(Number(params.height))) {
        setHeight(String(params.height));
        hasChanges = true;
      }
      if (params.weight && !isNaN(Number(params.weight))) {
        setWeight(String(params.weight));
        hasChanges = true;
      }
      if (params.exposureHours && !isNaN(Number(params.exposureHours))) {
        setExposureHours(String(params.exposureHours));
        hasChanges = true;
      }
      if (params.uvIndex && !isNaN(Number(params.uvIndex))) {
        setUvIndex(String(params.uvIndex));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const skinTypes: Record<SkinType, SkinTypeConfig> = {
    type1: {
      name: 'Type I - Very Fair',
      description: 'Always burns, never tans',
      burnTime: 10,
      recommendedSPF: 50,
      characteristics: 'Very pale skin, red/blonde hair, blue/green eyes, freckles',
    },
    type2: {
      name: 'Type II - Fair',
      description: 'Burns easily, tans minimally',
      burnTime: 15,
      recommendedSPF: 50,
      characteristics: 'Fair skin, blonde/light brown hair, blue/green/hazel eyes',
    },
    type3: {
      name: 'Type III - Medium',
      description: 'Burns moderately, tans gradually',
      burnTime: 20,
      recommendedSPF: 30,
      characteristics: 'Light brown skin, brown hair, brown eyes',
    },
    type4: {
      name: 'Type IV - Olive',
      description: 'Burns minimally, tans easily',
      burnTime: 30,
      recommendedSPF: 30,
      characteristics: 'Olive/moderate brown skin, dark brown hair, brown eyes',
    },
    type5: {
      name: 'Type V - Brown',
      description: 'Rarely burns, tans darkly',
      burnTime: 40,
      recommendedSPF: 15,
      characteristics: 'Brown skin, dark hair, dark eyes',
    },
    type6: {
      name: 'Type VI - Dark Brown/Black',
      description: 'Never burns, deeply pigmented',
      burnTime: 60,
      recommendedSPF: 15,
      characteristics: 'Dark brown to black skin, black hair, dark eyes',
    },
  };

  const activities: Record<ActivityLevel, ActivityConfig> = {
    indoor: {
      name: 'Mostly Indoor',
      reapplyInterval: 240,
      multiplier: 0.5,
    },
    outdoor_light: {
      name: 'Light Outdoor',
      reapplyInterval: 120,
      multiplier: 1,
    },
    outdoor_active: {
      name: 'Active Outdoor',
      reapplyInterval: 80,
      multiplier: 1.5,
    },
    water_sports: {
      name: 'Swimming/Water Sports',
      reapplyInterval: 40,
      multiplier: 2,
    },
  };

  const skinConfig = skinTypes[skinType];
  const activityConfig = activities[activityLevel];

  const calculations = useMemo(() => {
    const heightCm = parseFloat(height) || 170;
    const weightKg = parseFloat(weight) || 70;
    const hours = parseFloat(exposureHours) || 2;
    const uv = parseFloat(uvIndex) || 6;

    // Body Surface Area calculation using Du Bois formula
    // BSA (m2) = 0.007184 x Height(cm)^0.725 x Weight(kg)^0.425
    const bsa = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);

    // Standard recommendation: 2mg/cm2 = 20ml/m2 of body surface
    // For full body coverage: ~30-35ml (1 oz) for average adult
    const baseAmountMl = bsa * 20;

    // Adjust for activity level
    const adjustedAmountMl = baseAmountMl * activityConfig.multiplier;

    // Calculate number of applications needed
    const reapplyIntervalHours = activityConfig.reapplyInterval / 60;
    const numApplications = Math.ceil(hours / reapplyIntervalHours);

    // Total amount needed for the day
    const totalAmountMl = adjustedAmountMl * numApplications;

    // Calculate protected time with SPF
    // Protected time = burn time x SPF
    const protectedMinutes = skinConfig.burnTime * skinConfig.recommendedSPF;

    // UV Index risk level
    let uvRiskLevel = 'Low';
    let uvRiskColor = 'green';
    if (uv >= 11) {
      uvRiskLevel = 'Extreme';
      uvRiskColor = 'purple';
    } else if (uv >= 8) {
      uvRiskLevel = 'Very High';
      uvRiskColor = 'red';
    } else if (uv >= 6) {
      uvRiskLevel = 'High';
      uvRiskColor = 'orange';
    } else if (uv >= 3) {
      uvRiskLevel = 'Moderate';
      uvRiskColor = 'yellow';
    }

    // Recommended SPF based on UV index
    let recommendedSPF = skinConfig.recommendedSPF;
    if (uv >= 8) {
      recommendedSPF = Math.max(recommendedSPF, 50);
    } else if (uv >= 6) {
      recommendedSPF = Math.max(recommendedSPF, 30);
    }

    return {
      bsa: bsa.toFixed(2),
      amountPerApplication: adjustedAmountMl.toFixed(1),
      amountPerApplicationOz: (adjustedAmountMl / 29.57).toFixed(2),
      amountPerApplicationTsp: (adjustedAmountMl / 5).toFixed(1),
      numApplications,
      totalAmount: totalAmountMl.toFixed(1),
      totalAmountOz: (totalAmountMl / 29.57).toFixed(2),
      protectedMinutes,
      protectedHours: (protectedMinutes / 60).toFixed(1),
      reapplyInterval: activityConfig.reapplyInterval,
      recommendedSPF,
      uvRiskLevel,
      uvRiskColor,
    };
  }, [height, weight, exposureHours, uvIndex, skinConfig, activityConfig]);

  const getUvColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-500';
      case 'yellow':
        return 'text-yellow-500';
      case 'orange':
        return 'text-orange-500';
      case 'red':
        return 'text-red-500';
      case 'purple':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Sun className="w-5 h-5 text-orange-500" /></div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sunscreenCalculator.sunscreenCalculator', 'Sunscreen Calculator')}</h3>
              {isPrefilled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  <Sparkles className="w-3 h-3" />
                  {t('tools.sunscreenCalculator.autoFilled', 'Auto-filled')}
                </span>
              )}
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sunscreenCalculator.calculateYourSunProtectionNeeds', 'Calculate your sun protection needs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Skin Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <User className="w-4 h-4 inline mr-1" />
            {t('tools.sunscreenCalculator.skinTypeFitzpatrickScale', 'Skin Type (Fitzpatrick Scale)')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(skinTypes) as SkinType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSkinType(type)}
                className={`py-2 px-3 rounded-lg text-sm text-left ${skinType === type ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {skinTypes[type].name}
              </button>
            ))}
          </div>
        </div>

        {/* Skin Type Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{skinConfig.name}</h4>
            <span className="text-orange-500 font-bold">SPF {skinConfig.recommendedSPF}+</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{skinConfig.description}</p>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <span className="font-medium">{t('tools.sunscreenCalculator.characteristics', 'Characteristics:')}</span> {skinConfig.characteristics}
          </p>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <span className="font-medium">{t('tools.sunscreenCalculator.burnsIn', 'Burns in:')}</span> ~{skinConfig.burnTime} minutes without protection
          </p>
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sunscreenCalculator.activityLevel', 'Activity Level')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(activities) as ActivityLevel[]).map((activity) => (
              <button
                key={activity}
                onClick={() => setActivityLevel(activity)}
                className={`py-2 px-3 rounded-lg text-sm ${activityLevel === activity ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {activities[activity].name}
              </button>
            ))}
          </div>
        </div>

        {/* Body Measurements */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.sunscreenCalculator.heightCm', 'Height (cm)')}
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.sunscreenCalculator.weightKg', 'Weight (kg)')}
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Exposure Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {t('tools.sunscreenCalculator.sunExposureHours', 'Sun Exposure (hours)')}
            </label>
            <input
              type="number"
              value={exposureHours}
              onChange={(e) => setExposureHours(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Sun className="w-4 h-4 inline mr-1" />
              {t('tools.sunscreenCalculator.uvIndex111', 'UV Index (1-11+)')}
            </label>
            <input
              type="number"
              value={uvIndex}
              onChange={(e) => setUvIndex(e.target.value)}
              min="1"
              max="15"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* UV Risk Level */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunscreenCalculator.uvRiskLevel', 'UV Risk Level:')}</span>
            <span className={`font-bold ${getUvColorClass(calculations.uvRiskColor)}`}>
              {calculations.uvRiskLevel}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sunscreenCalculator.perApplication', 'Per Application')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.amountPerApplication}ml</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.amountPerApplicationOz} oz / ~{calculations.amountPerApplicationTsp} tsp
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sunscreenCalculator.recommendedSpf', 'Recommended SPF')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">SPF {calculations.recommendedSPF}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.sunscreenCalculator.broadSpectrumUvaUvb', 'Broad spectrum UVA/UVB')}
            </div>
          </div>
        </div>

        {/* Reapplication Schedule */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sunscreenCalculator.reapplicationSchedule', 'Reapplication Schedule')}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunscreenCalculator.reapplyEvery', 'Reapply Every')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.reapplyInterval} min
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunscreenCalculator.applications', 'Applications')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.numApplications}x
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunscreenCalculator.totalNeeded', 'Total Needed')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.totalAmount}ml
              </div>
            </div>
          </div>
        </div>

        {/* Body Surface Area */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunscreenCalculator.yourBodySurfaceArea', 'Your Body Surface Area')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.bsa} m²
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.sunscreenCalculator.usingDuBoisFormula', 'Using Du Bois formula')}</div>
        </div>

        {/* Warning for high UV */}
        {parseInt(uvIndex) >= 8 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className={`font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>{t('tools.sunscreenCalculator.highUvAlert', 'High UV Alert')}</h4>
                <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                  {t('tools.sunscreenCalculator.considerLimitingSunExposureBetween', 'Consider limiting sun exposure between 10 AM - 4 PM. Seek shade, wear protective clothing, and use sunglasses.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sun Safety Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.sunscreenCalculator.sunProtectionTips', 'Sun Protection Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Apply sunscreen 15-30 minutes before sun exposure</li>
                <li>• Use approximately 1 oz (shot glass) for full body coverage</li>
                <li>• Don't forget ears, neck, feet, and back of hands</li>
                <li>• Reapply after swimming, sweating, or toweling off</li>
                <li>• Check expiration date - sunscreen loses effectiveness</li>
                <li>• Wear protective clothing, hats, and UV-blocking sunglasses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SunscreenCalculatorTool;
