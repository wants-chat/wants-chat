import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Scale, Clock, Info, Layers, Thermometer, AlertTriangle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type MoldShape = 'rectangular' | 'cylindrical' | 'spherical' | 'custom';
type ResinType = 'standard' | 'deep-pour' | 'fast-cure' | 'uv-resin';

interface ResinConfig {
  name: string;
  ratio: string; // resin to hardener ratio
  ratioValue: number; // decimal ratio for calculations
  maxPourDepth: string;
  cureTime: string;
  workingTime: string;
  description: string;
}

interface ResinCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const ResinCalculatorTool: React.FC<ResinCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [moldShape, setMoldShape] = useState<MoldShape>('rectangular');
  const [resinType, setResinType] = useState<ResinType>('standard');
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('10');
  const [depth, setDepth] = useState('2');
  const [diameter, setDiameter] = useState('10');
  const [customVolume, setCustomVolume] = useState('');
  const [numberOfLayers, setNumberOfLayers] = useState('1');
  const [wastePercentage, setWastePercentage] = useState('10');
  const [activeTab, setActiveTab] = useState<'calculator' | 'tips' | 'bubbles'>('calculator');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.moldShape && ['rectangular', 'cylindrical', 'spherical', 'custom'].includes(params.moldShape)) {
        setMoldShape(params.moldShape as MoldShape);
        hasChanges = true;
      }
      if (params.resinType && ['standard', 'deep-pour', 'fast-cure', 'uv-resin'].includes(params.resinType)) {
        setResinType(params.resinType as ResinType);
        hasChanges = true;
      }
      if (params.length) {
        setLength(String(params.length));
        hasChanges = true;
      }
      if (params.width) {
        setWidth(String(params.width));
        hasChanges = true;
      }
      if (params.depth) {
        setDepth(String(params.depth));
        hasChanges = true;
      }
      if (params.diameter) {
        setDiameter(String(params.diameter));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const resinTypes: Record<ResinType, ResinConfig> = {
    'standard': {
      name: 'Standard Epoxy',
      ratio: '1:1',
      ratioValue: 1,
      maxPourDepth: '1/4 inch (6mm)',
      cureTime: '24-72 hours',
      workingTime: '30-45 minutes',
      description: 'Best for thin coatings, art, and multiple layer projects',
    },
    'deep-pour': {
      name: 'Deep Pour Epoxy',
      ratio: '2:1',
      ratioValue: 0.5,
      maxPourDepth: '2-4 inches (5-10cm)',
      cureTime: '48-72 hours',
      workingTime: '45-60 minutes',
      description: 'Ideal for river tables, thick castings, and embedments',
    },
    'fast-cure': {
      name: 'Fast Cure Epoxy',
      ratio: '1:1',
      ratioValue: 1,
      maxPourDepth: '1/8 inch (3mm)',
      cureTime: '4-6 hours',
      workingTime: '15-20 minutes',
      description: 'Quick projects, repairs, and time-sensitive work',
    },
    'uv-resin': {
      name: 'UV Resin',
      ratio: 'No mixing',
      ratioValue: 0,
      maxPourDepth: '1/8 inch (3mm)',
      cureTime: '2-5 minutes (UV)',
      workingTime: 'Until UV exposure',
      description: 'Jewelry, small crafts, instant curing with UV light',
    },
  };

  const config = resinTypes[resinType];

  const calculations = useMemo(() => {
    let volumeCm3 = 0;
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const d = parseFloat(depth) || 0;
    const dia = parseFloat(diameter) || 0;
    const layers = parseInt(numberOfLayers) || 1;
    const waste = parseFloat(wastePercentage) || 0;

    switch (moldShape) {
      case 'rectangular':
        volumeCm3 = l * w * d;
        break;
      case 'cylindrical':
        volumeCm3 = Math.PI * Math.pow(dia / 2, 2) * d;
        break;
      case 'spherical':
        volumeCm3 = (4 / 3) * Math.PI * Math.pow(dia / 2, 3);
        break;
      case 'custom':
        volumeCm3 = parseFloat(customVolume) || 0;
        break;
    }

    // Add waste percentage
    const volumeWithWaste = volumeCm3 * (1 + waste / 100);

    // Volume per layer
    const volumePerLayer = volumeWithWaste / layers;

    // Convert to different units
    const volumeMl = volumeWithWaste;
    const volumeOz = volumeWithWaste / 29.5735;
    const volumeGallons = volumeOz / 128;
    const volumeLiters = volumeWithWaste / 1000;

    // Calculate resin and hardener amounts based on ratio
    let resinAmount = 0;
    let hardenerAmount = 0;

    if (resinType === 'uv-resin') {
      resinAmount = volumeMl;
      hardenerAmount = 0;
    } else if (config.ratioValue === 1) {
      // 1:1 ratio
      resinAmount = volumeMl / 2;
      hardenerAmount = volumeMl / 2;
    } else if (config.ratioValue === 0.5) {
      // 2:1 ratio
      resinAmount = volumeMl * (2 / 3);
      hardenerAmount = volumeMl * (1 / 3);
    }

    // Weight calculation (epoxy density ~1.1 g/ml)
    const totalWeightGrams = volumeMl * 1.1;
    const resinWeightGrams = resinAmount * 1.1;
    const hardenerWeightGrams = hardenerAmount * 1.1;

    return {
      totalVolume: volumeMl.toFixed(1),
      volumeOz: volumeOz.toFixed(2),
      volumeGallons: volumeGallons.toFixed(3),
      volumeLiters: volumeLiters.toFixed(3),
      volumePerLayer: volumePerLayer.toFixed(1),
      resinMl: resinAmount.toFixed(1),
      hardenerMl: hardenerAmount.toFixed(1),
      resinOz: (resinAmount / 29.5735).toFixed(2),
      hardenerOz: (hardenerAmount / 29.5735).toFixed(2),
      totalWeight: totalWeightGrams.toFixed(1),
      resinWeight: resinWeightGrams.toFixed(1),
      hardenerWeight: hardenerWeightGrams.toFixed(1),
      layers,
    };
  }, [moldShape, length, width, depth, diameter, customVolume, numberOfLayers, wastePercentage, resinType, config.ratioValue]);

  const mixingTips = [
    'Measure resin and hardener precisely using separate containers',
    'Mix slowly for 3-5 minutes to minimize air bubbles',
    'Scrape the sides and bottom of the mixing container',
    'Pour into a second container and mix again for best results',
    'Work in a well-ventilated area at 70-75°F (21-24°C)',
    'Use a heat gun or torch to pop surface bubbles after pouring',
    'Let mixed resin sit 2-3 minutes before pouring to release bubbles',
  ];

  const bubblePrevention = [
    { title: 'Warm Your Resin', tip: 'Place resin bottles in warm water (100°F/38°C) for 15 minutes before mixing. Warmer resin is thinner and releases bubbles easier.' },
    { title: 'Mix Slowly', tip: 'Stir gently in a figure-8 pattern. Fast mixing introduces air bubbles.' },
    { title: 'Seal Porous Materials', tip: 'Apply a thin seal coat to wood, paper, or fabric and let cure before the flood coat.' },
    { title: 'Use a Pressure Pot', tip: 'For bubble-free castings, cure resin under pressure (40-60 PSI).' },
    { title: 'Heat Gun Technique', tip: 'Pass a heat gun 6-8 inches above surface in sweeping motions to pop bubbles.' },
    { title: 'Torch Method', tip: 'Quick passes with a butane torch pop surface bubbles instantly. Keep moving!' },
    { title: 'Avoid Humidity', tip: 'High humidity can cause bubbles and cloudiness. Work below 50% humidity.' },
    { title: 'Degas Your Resin', tip: 'After mixing, vacuum degas for 2-3 minutes to remove trapped air.' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Droplets className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resinCalculator.epoxyResinCalculator', 'Epoxy Resin Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.resinCalculator.calculateResinNeedsForYour', 'Calculate resin needs for your project')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-500 font-medium">{t('tools.resinCalculator.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2 rounded-lg ${activeTab === 'calculator' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.resinCalculator.calculator', 'Calculator')}
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 py-2 rounded-lg ${activeTab === 'tips' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.resinCalculator.mixingTips', 'Mixing Tips')}
          </button>
          <button
            onClick={() => setActiveTab('bubbles')}
            className={`flex-1 py-2 rounded-lg ${activeTab === 'bubbles' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.resinCalculator.bubbleGuide', 'Bubble Guide')}
          </button>
        </div>

        {activeTab === 'calculator' && (
          <>
            {/* Resin Type Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.resinCalculator.resinType', 'Resin Type')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(resinTypes) as ResinType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setResinType(type)}
                    className={`py-2 px-3 rounded-lg text-sm ${resinType === type ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {resinTypes[type].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Resin Info */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
                <span className="text-purple-500 font-bold">{config.ratio}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">{t('tools.resinCalculator.maxDepth', 'Max Depth:')}</span> {config.maxPourDepth}
                </div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">{t('tools.resinCalculator.workTime', 'Work Time:')}</span> {config.workingTime}
                </div>
                <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-medium">{t('tools.resinCalculator.cureTime', 'Cure Time:')}</span> {config.cureTime}
                </div>
              </div>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {config.description}
              </p>
            </div>

            {/* Mold Shape Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.resinCalculator.moldShape', 'Mold Shape')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['rectangular', 'cylindrical', 'spherical', 'custom'] as MoldShape[]).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setMoldShape(shape)}
                    className={`py-2 px-3 rounded-lg text-sm capitalize ${moldShape === shape ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension Inputs */}
            {moldShape === 'rectangular' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.resinCalculator.lengthCm', 'Length (cm)')}
                  </label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.resinCalculator.widthCm', 'Width (cm)')}
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.resinCalculator.depthCm', 'Depth (cm)')}
                  </label>
                  <input
                    type="number"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            )}

            {moldShape === 'cylindrical' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.resinCalculator.diameterCm', 'Diameter (cm)')}
                  </label>
                  <input
                    type="number"
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.resinCalculator.heightCm', 'Height (cm)')}
                  </label>
                  <input
                    type="number"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            )}

            {moldShape === 'spherical' && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.resinCalculator.diameterCm2', 'Diameter (cm)')}
                </label>
                <input
                  type="number"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            )}

            {moldShape === 'custom' && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.resinCalculator.customVolumeMlCm', 'Custom Volume (mL / cm³)')}
                </label>
                <input
                  type="number"
                  value={customVolume}
                  onChange={(e) => setCustomVolume(e.target.value)}
                  placeholder={t('tools.resinCalculator.enterVolumeInMl', 'Enter volume in mL')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            )}

            {/* Layers and Waste */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Layers className="w-4 h-4 inline mr-1" />
                  {t('tools.resinCalculator.numberOfLayers', 'Number of Layers')}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumberOfLayers(n.toString())}
                      className={`flex-1 py-2 rounded-lg ${parseInt(numberOfLayers) === n ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.resinCalculator.wasteBuffer', 'Waste Buffer (%)')}
                </label>
                <input
                  type="number"
                  value={wastePercentage}
                  onChange={(e) => setWastePercentage(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resinCalculator.totalVolume', 'Total Volume')}</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{calculations.totalVolume} mL</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {calculations.volumeOz} oz | {calculations.volumeLiters} L
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resinCalculator.totalWeight', 'Total Weight')}</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{calculations.totalWeight} g</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.resinCalculator.density11GMl', 'Density: ~1.1 g/mL')}
                </div>
              </div>
            </div>

            {/* Resin & Hardener Breakdown */}
            {resinType !== 'uv-resin' && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Mix Ratio: {config.ratio}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.resinCalculator.resinPartA', 'Resin (Part A)')}</div>
                    <div className="text-xl font-bold text-purple-500">{calculations.resinMl} mL</div>
                    <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {calculations.resinOz} oz | {calculations.resinWeight} g
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.resinCalculator.hardenerPartB', 'Hardener (Part B)')}</div>
                    <div className="text-xl font-bold text-pink-500">{calculations.hardenerMl} mL</div>
                    <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {calculations.hardenerOz} oz | {calculations.hardenerWeight} g
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Per Layer Info */}
            {calculations.layers > 1 && (
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.resinCalculator.pourPerLayer', 'Pour per layer')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.volumePerLayer} mL
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  across {calculations.layers} layers
                </div>
              </div>
            )}

            {/* Cure Time Info */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.resinCalculator.cureTime2', 'Cure Time')}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.resinCalculator.workingTime', 'Working Time:')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.workingTime}</span>
                </div>
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.resinCalculator.fullCure', 'Full Cure:')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.cureTime}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'tips' && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="flex items-start gap-2">
              <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.resinCalculator.mixingTipsForBestResults', 'Mixing Tips for Best Results:')}</strong>
                <ul className="mt-2 space-y-2">
                  {mixingTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold">{index + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
              <div className="flex items-start gap-2">
                <Thermometer className={`w-4 h-4 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div>
                  <strong className={isDark ? 'text-yellow-400' : 'text-yellow-700'}>{t('tools.resinCalculator.temperatureMatters', 'Temperature Matters!')}</strong>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.resinCalculator.workIn7075F', 'Work in 70-75°F (21-24°C) for optimal results. Cold temperatures slow curing and can cause cloudiness. Hot temperatures speed up curing and reduce working time.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bubbles' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                <div>
                  <strong className={isDark ? 'text-red-400' : 'text-red-700'}>{t('tools.resinCalculator.bubblesAreThe1Enemy', 'Bubbles are the #1 enemy of resin!')}</strong>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.resinCalculator.followTheseTipsToAchieve', 'Follow these tips to achieve crystal-clear, bubble-free results.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {bubblePrevention.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-500">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResinCalculatorTool;
