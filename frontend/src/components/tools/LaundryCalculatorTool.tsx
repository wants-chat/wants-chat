import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shirt, Droplets, Thermometer, Clock, Zap, Info, Sparkles, Scale } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface LaundryCalculatorToolProps {
  uiConfig?: UIConfig;
}

type LoadSize = 'small' | 'medium' | 'large' | 'extra-large';
type FabricType = 'cotton' | 'synthetic' | 'delicate' | 'wool' | 'denim' | 'towels' | 'bedding';
type StainType = 'grease' | 'grass' | 'blood' | 'wine' | 'coffee' | 'ink' | 'mud' | 'sweat';
type CycleType = 'normal' | 'delicate' | 'heavy-duty' | 'quick' | 'sanitize';

interface LoadConfig {
  name: string;
  weightLbs: number;
  weightKg: number;
  items: string;
  detergentOz: number;
  detergentMl: number;
  waterGallons: number;
  waterLiters: number;
}

interface FabricConfig {
  name: string;
  tempF: string;
  tempC: string;
  cycle: CycleType;
  tips: string;
}

interface StainConfig {
  name: string;
  treatment: string;
  pretreatTime: string;
  waterTemp: string;
}

interface CycleConfig {
  name: string;
  duration: string;
  agitation: string;
  spin: string;
  bestFor: string;
}

export const LaundryCalculatorTool: React.FC<LaundryCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [activeTab, setActiveTab] = useState<'load' | 'fabric' | 'stain' | 'energy'>('load');
  const [loadSize, setLoadSize] = useState<LoadSize>('medium');
  const [fabricType, setFabricType] = useState<FabricType>('cotton');
  const [stainType, setStainType] = useState<StainType>('grease');
  const [cycleType, setCycleType] = useState<CycleType>('normal');
  const [isHighEfficiency, setIsHighEfficiency] = useState(true);
  const [loadsPerWeek, setLoadsPerWeek] = useState('4');

  const loadConfigs: Record<LoadSize, LoadConfig> = {
    small: {
      name: 'Small',
      weightLbs: 3,
      weightKg: 1.4,
      items: '2-3 shirts, underwear, socks',
      detergentOz: 1,
      detergentMl: 30,
      waterGallons: 15,
      waterLiters: 57,
    },
    medium: {
      name: 'Medium',
      weightLbs: 6,
      weightKg: 2.7,
      items: '5-6 shirts, pants, underwear',
      detergentOz: 1.5,
      detergentMl: 45,
      waterGallons: 20,
      waterLiters: 76,
    },
    large: {
      name: 'Large',
      weightLbs: 11,
      weightKg: 5,
      items: 'Full basket of clothes',
      detergentOz: 2,
      detergentMl: 60,
      waterGallons: 30,
      waterLiters: 114,
    },
    'extra-large': {
      name: 'Extra Large',
      weightLbs: 15,
      weightKg: 6.8,
      items: 'Bulky items, comforters',
      detergentOz: 2.5,
      detergentMl: 75,
      waterGallons: 40,
      waterLiters: 151,
    },
  };

  const fabricConfigs: Record<FabricType, FabricConfig> = {
    cotton: {
      name: 'Cotton',
      tempF: '60-90°F',
      tempC: '15-32°C',
      cycle: 'normal',
      tips: 'Warm water for colors, hot for whites. Turn inside out to preserve color.',
    },
    synthetic: {
      name: 'Synthetic/Polyester',
      tempF: '60-80°F',
      tempC: '15-27°C',
      cycle: 'normal',
      tips: 'Cool to warm water. Use low heat when drying to prevent damage.',
    },
    delicate: {
      name: 'Delicates/Silk',
      tempF: '60-70°F',
      tempC: '15-21°C',
      cycle: 'delicate',
      tips: 'Cold water only. Use mesh bag. Air dry recommended.',
    },
    wool: {
      name: 'Wool',
      tempF: '60-70°F',
      tempC: '15-21°C',
      cycle: 'delicate',
      tips: 'Cold water, gentle detergent. Lay flat to dry to prevent stretching.',
    },
    denim: {
      name: 'Denim',
      tempF: '60-80°F',
      tempC: '15-27°C',
      cycle: 'normal',
      tips: 'Turn inside out. Wash with similar colors. Air dry to prevent shrinking.',
    },
    towels: {
      name: 'Towels',
      tempF: '90-140°F',
      tempC: '32-60°C',
      cycle: 'heavy-duty',
      tips: 'Hot water kills bacteria. Use less detergent. Add vinegar for freshness.',
    },
    bedding: {
      name: 'Bedding/Sheets',
      tempF: '90-140°F',
      tempC: '32-60°C',
      cycle: 'normal',
      tips: 'Hot water for sanitizing. Wash separately from clothes. Shake out before drying.',
    },
  };

  const stainConfigs: Record<StainType, StainConfig> = {
    grease: {
      name: 'Grease/Oil',
      treatment: 'Apply dish soap directly, let sit. Use baking soda to absorb excess oil.',
      pretreatTime: '15-30 minutes',
      waterTemp: 'Hot',
    },
    grass: {
      name: 'Grass',
      treatment: 'Rub with white vinegar or rubbing alcohol. Apply enzyme-based stain remover.',
      pretreatTime: '15 minutes',
      waterTemp: 'Cold',
    },
    blood: {
      name: 'Blood',
      treatment: 'Rinse immediately with cold water. Apply hydrogen peroxide or salt paste.',
      pretreatTime: '10-15 minutes',
      waterTemp: 'Cold (never hot!)',
    },
    wine: {
      name: 'Red Wine',
      treatment: 'Blot immediately. Cover with salt, then apply club soda or white wine.',
      pretreatTime: '5-10 minutes',
      waterTemp: 'Cold',
    },
    coffee: {
      name: 'Coffee/Tea',
      treatment: 'Rinse with cold water. Apply white vinegar or baking soda paste.',
      pretreatTime: '5-10 minutes',
      waterTemp: 'Cold then warm',
    },
    ink: {
      name: 'Ink',
      treatment: 'Dab with rubbing alcohol using cotton ball. Do not rub - blot only.',
      pretreatTime: '10-15 minutes',
      waterTemp: 'Cold',
    },
    mud: {
      name: 'Mud/Dirt',
      treatment: 'Let dry completely first! Brush off dried mud, then pretreat with detergent.',
      pretreatTime: '15 minutes (after drying)',
      waterTemp: 'Warm',
    },
    sweat: {
      name: 'Sweat/Deodorant',
      treatment: 'Apply white vinegar or baking soda paste. For yellowing, use hydrogen peroxide.',
      pretreatTime: '30 minutes',
      waterTemp: 'Warm',
    },
  };

  const cycleConfigs: Record<CycleType, CycleConfig> = {
    normal: {
      name: 'Normal/Regular',
      duration: '45-60 minutes',
      agitation: 'Medium',
      spin: 'High',
      bestFor: 'Everyday clothes, cotton, mixed loads',
    },
    delicate: {
      name: 'Delicate/Gentle',
      duration: '30-40 minutes',
      agitation: 'Low',
      spin: 'Low',
      bestFor: 'Silk, lace, lingerie, wool',
    },
    'heavy-duty': {
      name: 'Heavy Duty',
      duration: '60-90 minutes',
      agitation: 'High',
      spin: 'High',
      bestFor: 'Work clothes, heavily soiled items, towels',
    },
    quick: {
      name: 'Quick Wash',
      duration: '15-30 minutes',
      agitation: 'Medium',
      spin: 'High',
      bestFor: 'Lightly worn clothes, freshening up items',
    },
    sanitize: {
      name: 'Sanitize/Hot',
      duration: '90-120 minutes',
      agitation: 'Medium',
      spin: 'High',
      bestFor: 'Baby clothes, pet bedding, sick household items',
    },
  };

  const loadConfig = loadConfigs[loadSize];
  const fabricConfig = fabricConfigs[fabricType];
  const stainConfig = stainConfigs[stainType];
  const cycleConfig = cycleConfigs[cycleType];

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.tab && ['load', 'fabric', 'stain', 'energy'].includes(params.tab)) {
        setActiveTab(params.tab as typeof activeTab);
        hasChanges = true;
      }
      if (params.loadSize && ['small', 'medium', 'large', 'extra-large'].includes(params.loadSize)) {
        setLoadSize(params.loadSize as LoadSize);
        hasChanges = true;
      }
      if (params.fabricType && ['cotton', 'synthetic', 'delicate', 'wool', 'denim', 'towels', 'bedding'].includes(params.fabricType)) {
        setFabricType(params.fabricType as FabricType);
        hasChanges = true;
      }
      if (params.stainType && ['grease', 'grass', 'blood', 'wine', 'coffee', 'ink', 'mud', 'sweat'].includes(params.stainType)) {
        setStainType(params.stainType as StainType);
        hasChanges = true;
      }
      if (params.cycleType && ['normal', 'delicate', 'heavy-duty', 'quick', 'sanitize'].includes(params.cycleType)) {
        setCycleType(params.cycleType as CycleType);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const energyEstimates = useMemo(() => {
    const loads = parseFloat(loadsPerWeek) || 0;
    const waterPerLoad = isHighEfficiency ? loadConfig.waterGallons * 0.5 : loadConfig.waterGallons;
    const kwhPerLoad = isHighEfficiency ? 0.3 : 0.5;
    const costPerKwh = 0.12;
    const costPerGallon = 0.005;

    const weeklyWater = waterPerLoad * loads;
    const monthlyWater = weeklyWater * 4.33;
    const yearlyWater = weeklyWater * 52;

    const weeklyEnergy = kwhPerLoad * loads;
    const monthlyEnergy = weeklyEnergy * 4.33;
    const yearlyEnergy = weeklyEnergy * 52;

    const weeklyCost = (weeklyEnergy * costPerKwh) + (weeklyWater * costPerGallon);
    const monthlyCost = (monthlyEnergy * costPerKwh) + (monthlyWater * costPerGallon);
    const yearlyCost = (yearlyEnergy * costPerKwh) + (yearlyWater * costPerGallon);

    return {
      waterPerLoad: waterPerLoad.toFixed(0),
      weeklyWater: weeklyWater.toFixed(0),
      monthlyWater: monthlyWater.toFixed(0),
      yearlyWater: yearlyWater.toFixed(0),
      weeklyEnergy: weeklyEnergy.toFixed(1),
      monthlyEnergy: monthlyEnergy.toFixed(1),
      yearlyEnergy: yearlyEnergy.toFixed(0),
      weeklyCost: weeklyCost.toFixed(2),
      monthlyCost: monthlyCost.toFixed(2),
      yearlyCost: yearlyCost.toFixed(2),
    };
  }, [loadsPerWeek, isHighEfficiency, loadConfig.waterGallons]);

  const tabs = [
    { id: 'load', label: 'Load Size', icon: Scale },
    { id: 'fabric', label: 'Fabric Guide', icon: Shirt },
    { id: 'stain', label: 'Stain Guide', icon: Sparkles },
    { id: 'energy', label: 'Energy', icon: Zap },
  ] as const;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Shirt className="w-5 h-5 text-blue-500" /></div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCalculator.laundryCalculator', 'Laundry Calculator')}</h3>
              {isPrefilled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Sparkles className="w-3 h-3" />
                  {t('tools.laundryCalculator.autoFilled', 'Auto-filled')}
                </span>
              )}
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.laundryCalculator.loadSizeDetergentAndCare', 'Load size, detergent, and care guide')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-2 rounded-lg text-xs sm:text-sm ${activeTab === tab.id ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <tab.icon className="w-4 h-4 mb-1" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Load Size Tab */}
        {activeTab === 'load' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(loadConfigs) as LoadSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setLoadSize(size)}
                  className={`py-2 px-3 rounded-lg text-sm ${loadSize === size ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {loadConfigs[size].name}
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{loadConfig.name} Load</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">{t('tools.laundryCalculator.weight', 'Weight:')}</span> {loadConfig.weightLbs} lbs ({loadConfig.weightKg} kg)
                </div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">{t('tools.laundryCalculator.example', 'Example:')}</span> {loadConfig.items}
                </div>
              </div>
            </div>

            {/* Detergent Calculator */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCalculator.detergent', 'Detergent')}</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{loadConfig.detergentOz} oz</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {loadConfig.detergentMl} mL
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-cyan-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCalculator.water', 'Water')}</span>
                </div>
                <div className="text-3xl font-bold text-cyan-500">{loadConfig.waterGallons} gal</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {loadConfig.waterLiters} L (standard washer)
                </div>
              </div>
            </div>

            {/* Cycle Selector */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.laundryCalculator.washCycle', 'Wash Cycle')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(Object.keys(cycleConfigs) as CycleType[]).map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setCycleType(cycle)}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm ${cycleType === cycle ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {cycleConfigs[cycle].name.split('/')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{cycleConfig.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">{t('tools.laundryCalculator.duration', 'Duration:')}</span> {cycleConfig.duration}
                </div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">{t('tools.laundryCalculator.agitation', 'Agitation:')}</span> {cycleConfig.agitation}
                </div>
                <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-medium">{t('tools.laundryCalculator.bestFor', 'Best for:')}</span> {cycleConfig.bestFor}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fabric Guide Tab */}
        {activeTab === 'fabric' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(Object.keys(fabricConfigs) as FabricType[]).map((fabric) => (
                <button
                  key={fabric}
                  onClick={() => setFabricType(fabric)}
                  className={`py-2 px-2 rounded-lg text-xs sm:text-sm ${fabricType === fabric ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {fabricConfigs[fabric].name}
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{fabricConfig.name}</h4>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCalculator.waterTemp', 'Water Temp')}</span>
                  </div>
                  <div className="text-xl font-bold text-orange-500">{fabricConfig.tempF}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{fabricConfig.tempC}</div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCalculator.cycle', 'Cycle')}</span>
                  </div>
                  <div className="text-xl font-bold text-purple-500 capitalize">{fabricConfig.cycle}</div>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <div className="flex items-start gap-2">
                  <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {fabricConfig.tips}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Reference */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h5 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCalculator.quickTemperatureGuide', 'Quick Temperature Guide')}</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Cold (60-80°F)</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.laundryCalculator.delicatesDarksBloodStains', 'Delicates, darks, blood stains')}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Warm (90-110°F)</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.laundryCalculator.permanentPressSynthetics', 'Permanent press, synthetics')}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Hot (120-140°F)</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.laundryCalculator.whitesTowelsSheets', 'Whites, towels, sheets')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stain Guide Tab */}
        {activeTab === 'stain' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(stainConfigs) as StainType[]).map((stain) => (
                <button
                  key={stain}
                  onClick={() => setStainType(stain)}
                  className={`py-2 px-2 rounded-lg text-xs sm:text-sm ${stainType === stain ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {stainConfigs[stain].name.split('/')[0]}
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stainConfig.name} Stain</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.laundryCalculator.treatment', 'Treatment:')}</span>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stainConfig.treatment}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.laundryCalculator.pretreatTime', 'Pretreat Time')}</span>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stainConfig.pretreatTime}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.laundryCalculator.waterTemp2', 'Water Temp')}</span>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stainConfig.waterTemp}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Stain Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.laundryCalculator.generalTips', 'General Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Act quickly - fresh stains are easier to remove</li>
                    <li>- Blot, don't rub - rubbing spreads the stain</li>
                    <li>- Test treatments on hidden area first</li>
                    <li>- Check stain is gone before drying (heat sets stains)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Energy Tab */}
        {activeTab === 'energy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  checked={isHighEfficiency}
                  onChange={(e) => setIsHighEfficiency(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm">{t('tools.laundryCalculator.highEfficiencyHeWasher', 'High-Efficiency (HE) Washer')}</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.laundryCalculator.loadsPerWeek', 'Loads per Week')}
              </label>
              <div className="flex gap-2">
                {[2, 4, 6, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setLoadsPerWeek(n.toString())}
                    className={`flex-1 py-2 rounded-lg ${parseInt(loadsPerWeek) === n ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={loadsPerWeek}
                onChange={(e) => setLoadsPerWeek(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder={t('tools.laundryCalculator.customNumber', 'Custom number')}
              />
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Usage Estimates ({isHighEfficiency ? 'HE' : 'Standard'} Washer)
              </h4>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.laundryCalculator.perLoad', 'Per Load')}</span>
                  <div className="text-lg font-bold text-cyan-500">{energyEstimates.waterPerLoad} gal</div>
                </div>
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.laundryCalculator.weekly', 'Weekly')}</span>
                  <div className="text-lg font-bold text-cyan-500">{energyEstimates.weeklyWater} gal</div>
                </div>
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.laundryCalculator.yearly', 'Yearly')}</span>
                  <div className="text-lg font-bold text-cyan-500">{energyEstimates.yearlyWater} gal</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCalculator.energy', 'Energy')}</span>
                  </div>
                  <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div>Weekly: {energyEstimates.weeklyEnergy} kWh</div>
                    <div>Monthly: {energyEstimates.monthlyEnergy} kWh</div>
                    <div>Yearly: {energyEstimates.yearlyEnergy} kWh</div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCalculator.estCost', 'Est. Cost')}</span>
                  </div>
                  <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div>Weekly: ${energyEstimates.weeklyCost}</div>
                    <div>Monthly: ${energyEstimates.monthlyCost}</div>
                    <div className="text-lg font-bold text-green-500">Yearly: ${energyEstimates.yearlyCost}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.laundryCalculator.energySavingTips', 'Energy Saving Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Wash with cold water when possible (saves 90% of energy)</li>
                    <li>- Wait for full loads instead of small loads</li>
                    <li>- Clean lint filter regularly for dryer efficiency</li>
                    <li>- Use high spin speed to reduce drying time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaundryCalculatorTool;
