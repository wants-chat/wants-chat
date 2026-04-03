import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shirt, Thermometer, Droplets, ListOrdered, AlertCircle, Tag, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface IroningGuideToolProps {
  uiConfig?: UIConfig;
}

type FabricType = 'cotton' | 'linen' | 'silk' | 'wool' | 'polyester' | 'nylon' | 'rayon' | 'denim';

interface FabricConfig {
  name: string;
  temperature: string;
  tempRange: string;
  ironSetting: string;
  steam: string;
  tips: string[];
  wrinkleProne: string[];
  order: number; // Lower = iron first (delicates first)
}

interface CareSymbol {
  symbol: string;
  meaning: string;
  description: string;
}

export const IroningGuideTool: React.FC<IroningGuideToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [selectedFabric, setSelectedFabric] = useState<FabricType>('cotton');
  const [activeTab, setActiveTab] = useState<'guide' | 'order' | 'symbols'>('guide');

  const fabrics: Record<FabricType, FabricConfig> = {
    silk: {
      name: 'Silk',
      temperature: 'Low',
      tempRange: '230-275°F (110-135°C)',
      ironSetting: '1 dot (•)',
      steam: 'No steam - use pressing cloth',
      tips: [
        'Always iron on reverse side',
        'Use a pressing cloth to prevent shine',
        'Iron while slightly damp',
        'Never spray water directly on silk',
      ],
      wrinkleProne: ['Entire garment', 'Collar area', 'Cuffs'],
      order: 1,
    },
    wool: {
      name: 'Wool',
      temperature: 'Low-Medium',
      tempRange: '275-300°F (135-150°C)',
      ironSetting: '2 dots (••)',
      steam: 'Steam hover - don\'t press directly',
      tips: [
        'Use a pressing cloth always',
        'Steam rather than press to avoid shine',
        'Iron on reverse side',
        'Let garment cool before moving',
      ],
      wrinkleProne: ['Lapels', 'Shoulders', 'Pleats', 'Hems'],
      order: 2,
    },
    polyester: {
      name: 'Polyester',
      temperature: 'Low',
      tempRange: '250-300°F (120-150°C)',
      ironSetting: '1-2 dots (• to ••)',
      steam: 'Light steam or none',
      tips: [
        'Test on hidden area first',
        'Iron on reverse side',
        'Keep iron moving to prevent melting',
        'Use pressing cloth for blends',
      ],
      wrinkleProne: ['Seams', 'Hems', 'Collar points'],
      order: 3,
    },
    nylon: {
      name: 'Nylon',
      temperature: 'Very Low',
      tempRange: '200-250°F (95-120°C)',
      ironSetting: '1 dot (•)',
      steam: 'No steam',
      tips: [
        'Use lowest setting possible',
        'Always use pressing cloth',
        'Iron quickly - don\'t linger',
        'Can melt easily - be cautious',
      ],
      wrinkleProne: ['Entire garment - wrinkle resistant'],
      order: 4,
    },
    rayon: {
      name: 'Rayon/Viscose',
      temperature: 'Medium',
      tempRange: '275-300°F (135-150°C)',
      ironSetting: '2 dots (••)',
      steam: 'Light steam on reverse',
      tips: [
        'Iron while damp or use spray',
        'Always iron on reverse side',
        'Use pressing cloth for delicate rayon',
        'Avoid over-wetting',
      ],
      wrinkleProne: ['Entire garment', 'Button placket', 'Collar'],
      order: 5,
    },
    cotton: {
      name: 'Cotton',
      temperature: 'High',
      tempRange: '350-400°F (175-205°C)',
      ironSetting: '3 dots (•••)',
      steam: 'Heavy steam recommended',
      tips: [
        'Iron while slightly damp',
        'Use spray starch for crisp finish',
        'Can iron on either side',
        'Apply more pressure for stubborn wrinkles',
      ],
      wrinkleProne: ['Collar', 'Cuffs', 'Button placket', 'Yoke', 'Between buttons'],
      order: 6,
    },
    linen: {
      name: 'Linen',
      temperature: 'High',
      tempRange: '375-445°F (190-230°C)',
      ironSetting: '3 dots (•••) - Maximum',
      steam: 'Maximum steam',
      tips: [
        'Iron while very damp',
        'Highest heat tolerance of natural fibers',
        'Use lots of steam',
        'Embrace slight wrinkles - it\'s natural',
      ],
      wrinkleProne: ['Entire garment', 'Hems', 'Seams', 'Collar'],
      order: 7,
    },
    denim: {
      name: 'Denim',
      temperature: 'High',
      tempRange: '350-400°F (175-205°C)',
      ironSetting: '3 dots (•••)',
      steam: 'Heavy steam',
      tips: [
        'Iron inside out to prevent shine',
        'Use lots of steam for stubborn creases',
        'Pay attention to seams and pockets',
        'Steam while hanging for light refresh',
      ],
      wrinkleProne: ['Waistband', 'Seams', 'Pocket areas', 'Creases'],
      order: 8,
    },
  };

  const careSymbols: CareSymbol[] = [
    { symbol: '•', meaning: 'Low Heat', description: '110°C / 230°F - Synthetics, silk' },
    { symbol: '••', meaning: 'Medium Heat', description: '150°C / 300°F - Wool, polyester blends' },
    { symbol: '•••', meaning: 'High Heat', description: '200°C / 390°F - Cotton, linen' },
    { symbol: '⊘', meaning: 'Do Not Iron', description: 'Ironing will damage the fabric' },
    { symbol: '⚠', meaning: 'No Steam', description: 'Steam may damage or watermark fabric' },
    { symbol: '△', meaning: 'Use Pressing Cloth', description: 'Iron with a cloth barrier' },
  ];

  const config = fabrics[selectedFabric];

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.tab && ['guide', 'order', 'symbols'].includes(params.tab)) {
        setActiveTab(params.tab as typeof activeTab);
        hasChanges = true;
      }
      if (params.fabricType && ['cotton', 'linen', 'silk', 'wool', 'polyester', 'nylon', 'rayon', 'denim'].includes(params.fabricType)) {
        setSelectedFabric(params.fabricType as FabricType);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Sort fabrics by ironing order
  const sortedFabrics = Object.entries(fabrics)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, value]) => ({ key: key as FabricType, ...value }));

  const getTemperatureColor = (temp: string) => {
    if (temp.includes('Very Low') || temp === 'Low') return 'text-blue-500';
    if (temp.includes('Medium') || temp === 'Low-Medium') return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Shirt className="w-5 h-5 text-blue-500" /></div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.ironingGuide.ironingGuide', 'Ironing Guide')}</h3>
              {isPrefilled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Sparkles className="w-3 h-3" />
                  {t('tools.ironingGuide.autoFilled', 'Auto-filled')}
                </span>
              )}
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.ironingGuide.temperatureSettingsAndTipsFor', 'Temperature settings and tips for every fabric')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${activeTab === 'guide' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Thermometer className="w-4 h-4 inline mr-1" />
            {t('tools.ironingGuide.fabricGuide', 'Fabric Guide')}
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${activeTab === 'order' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <ListOrdered className="w-4 h-4 inline mr-1" />
            {t('tools.ironingGuide.ironingOrder', 'Ironing Order')}
          </button>
          <button
            onClick={() => setActiveTab('symbols')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${activeTab === 'symbols' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Tag className="w-4 h-4 inline mr-1" />
            {t('tools.ironingGuide.careLabels', 'Care Labels')}
          </button>
        </div>

        {/* Fabric Guide Tab */}
        {activeTab === 'guide' && (
          <>
            {/* Fabric Selection */}
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(fabrics) as FabricType[]).map((fabric) => (
                <button
                  key={fabric}
                  onClick={() => setSelectedFabric(fabric)}
                  className={`py-2 px-3 rounded-lg text-sm ${selectedFabric === fabric ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {fabrics[fabric].name}
                </button>
              ))}
            </div>

            {/* Temperature Settings */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
                <span className={`font-bold ${getTemperatureColor(config.temperature)}`}>
                  {config.ironSetting}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Thermometer className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="font-medium">{t('tools.ironingGuide.temperature', 'Temperature:')}</span>
                    <div className={getTemperatureColor(config.temperature)}>{config.temperature}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="font-medium">{t('tools.ironingGuide.steam', 'Steam:')}</span>
                    <div>{config.steam}</div>
                  </div>
                </div>
              </div>
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Range: {config.tempRange}
                </span>
              </div>
            </div>

            {/* Wrinkle-Prone Areas */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.ironingGuide.wrinkleProneAreas', 'Wrinkle-Prone Areas')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.wrinkleProne.map((area, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'}`}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Tips for {config.name}:</strong>
                  <ul className="mt-1 space-y-1">
                    {config.tips.map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ironing Order Tab */}
        {activeTab === 'order' && (
          <>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border mb-4`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>{t('tools.ironingGuide.whyOrderMatters', 'Why order matters:')}</strong> Start with delicate fabrics at low heat, then increase temperature as you progress. This prevents accidentally damaging delicates with a too-hot iron.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {sortedFabrics.map((fabric, index) => (
                <div
                  key={fabric.key}
                  className={`p-4 rounded-lg flex items-center gap-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index < 2 ? 'bg-blue-500 text-white' :
                    index < 5 ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{fabric.name}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {fabric.ironSetting} - {fabric.temperature}
                    </div>
                  </div>
                  <div className={`text-sm ${getTemperatureColor(fabric.temperature)}`}>
                    {fabric.tempRange.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-4 h-4 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.ironingGuide.proTip', 'Pro Tip:')}</strong> Sort your laundry by fabric type before ironing. Let the iron cool down if switching from high to low heat fabrics.
                </div>
              </div>
            </div>
          </>
        )}

        {/* Care Symbols Tab */}
        {activeTab === 'symbols' && (
          <>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border mb-4`}>
              <div className="flex items-start gap-2">
                <Tag className={`w-4 h-4 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>{t('tools.ironingGuide.readingCareLabels', 'Reading care labels:')}</strong> The iron symbol with dots indicates the maximum temperature setting. Always check care labels before ironing.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {careSymbols.map((symbol, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg flex items-center gap-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-mono ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                    {symbol.symbol}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{symbol.meaning}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{symbol.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.ironingGuide.whenInDoubt', 'When in doubt:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Start with the lowest heat setting</li>
                    <li>• Test on a hidden area first</li>
                    <li>• Use a pressing cloth for extra protection</li>
                    <li>• Check blended fabric labels - use lowest recommended temp</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IroningGuideTool;
