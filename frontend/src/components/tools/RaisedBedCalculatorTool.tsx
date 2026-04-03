import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flower2, Ruler, Package, Leaf, DollarSign, Info, Grid3X3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RaisedBedCalculatorToolProps {
  uiConfig?: UIConfig;
}

type WoodType = '2x6' | '2x8' | '2x10' | '2x12';
type SoilMix = 'basic' | 'premium' | 'organic';

interface WoodConfig {
  name: string;
  heightInches: number;
  pricePerFoot: number;
}

interface SoilMixConfig {
  name: string;
  description: string;
  topsoil: number; // percentage
  compost: number;
  other: number;
  otherName: string;
  pricePerCuFt: number;
}

interface PlantSpacing {
  name: string;
  spacing: number; // inches between plants
  plantsPerSqFt: number;
}

export const RaisedBedCalculatorTool: React.FC<RaisedBedCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [length, setLength] = useState('8');
  const [width, setWidth] = useState('4');
  const [height, setHeight] = useState('12');
  const [woodType, setWoodType] = useState<WoodType>('2x6');
  const [soilMix, setSoilMix] = useState<SoilMix>('basic');
  const [lumberPrice, setLumberPrice] = useState('');
  const [soilPrice, setSoilPrice] = useState('');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.length) setLength(String(prefillData.length));
      if (prefillData.width) setWidth(String(prefillData.width));
      if (prefillData.height) setHeight(String(prefillData.height));
      if (prefillData.woodType) setWoodType(prefillData.woodType as WoodType);
      if (prefillData.soilMix) setSoilMix(prefillData.soilMix as SoilMix);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const woodTypes: Record<WoodType, WoodConfig> = {
    '2x6': { name: '2x6 Lumber', heightInches: 5.5, pricePerFoot: 0.85 },
    '2x8': { name: '2x8 Lumber', heightInches: 7.25, pricePerFoot: 1.15 },
    '2x10': { name: '2x10 Lumber', heightInches: 9.25, pricePerFoot: 1.45 },
    '2x12': { name: '2x12 Lumber', heightInches: 11.25, pricePerFoot: 1.85 },
  };

  const soilMixes: Record<SoilMix, SoilMixConfig> = {
    basic: {
      name: 'Basic Mix',
      description: 'Good for most vegetables and flowers',
      topsoil: 60,
      compost: 30,
      other: 10,
      otherName: 'Peat Moss',
      pricePerCuFt: 0.75,
    },
    premium: {
      name: 'Premium Mix',
      description: 'Enhanced drainage and nutrients',
      topsoil: 40,
      compost: 40,
      other: 20,
      otherName: 'Perlite/Vermiculite',
      pricePerCuFt: 1.25,
    },
    organic: {
      name: 'Organic Mix',
      description: 'All-natural, nutrient-rich blend',
      topsoil: 33,
      compost: 50,
      other: 17,
      otherName: 'Worm Castings',
      pricePerCuFt: 1.75,
    },
  };

  const plantSpacings: PlantSpacing[] = [
    { name: 'Tomatoes', spacing: 24, plantsPerSqFt: 0.25 },
    { name: 'Peppers', spacing: 18, plantsPerSqFt: 0.44 },
    { name: 'Lettuce', spacing: 6, plantsPerSqFt: 4 },
    { name: 'Carrots', spacing: 3, plantsPerSqFt: 16 },
    { name: 'Beans', spacing: 4, plantsPerSqFt: 9 },
    { name: 'Cucumbers', spacing: 12, plantsPerSqFt: 1 },
    { name: 'Squash', spacing: 24, plantsPerSqFt: 0.25 },
    { name: 'Herbs', spacing: 6, plantsPerSqFt: 4 },
  ];

  const woodConfig = woodTypes[woodType];
  const soilConfig = soilMixes[soilMix];

  const calculations = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;

    // Calculate number of board layers needed
    const boardHeight = woodConfig.heightInches;
    const layersNeeded = Math.ceil(h / boardHeight);
    const actualHeight = layersNeeded * boardHeight;

    // Lumber requirements (perimeter * layers)
    const perimeter = 2 * (l + w);
    const totalLumberFeet = perimeter * layersNeeded;

    // Number of boards needed (standard 8ft boards)
    const boardsNeeded8ft = Math.ceil(totalLumberFeet / 8);
    const boardsNeeded10ft = Math.ceil(totalLumberFeet / 10);
    const boardsNeeded12ft = Math.ceil(totalLumberFeet / 12);

    // Corner posts (4x4) - 4 corners, height of bed
    const cornerPostLength = (actualHeight / 12) * 4; // 4 posts
    const cornerPostsNeeded = Math.ceil(cornerPostLength / 8);

    // Screws needed (approximately 4 screws per corner per layer)
    const screwsNeeded = layersNeeded * 4 * 4;

    // Soil volume in cubic feet
    const soilVolumeCuFt = (l * w * (actualHeight / 12));
    // Convert to cubic yards (27 cu ft per cu yard)
    const soilVolumeCuYd = soilVolumeCuFt / 27;
    // Convert to gallons (7.48 gallons per cu ft)
    const soilVolumeGallons = soilVolumeCuFt * 7.48;

    // Soil mix breakdown
    const topsoilCuFt = soilVolumeCuFt * (soilConfig.topsoil / 100);
    const compostCuFt = soilVolumeCuFt * (soilConfig.compost / 100);
    const otherCuFt = soilVolumeCuFt * (soilConfig.other / 100);

    // Cost estimates
    const actualLumberPrice = lumberPrice ? parseFloat(lumberPrice) : woodConfig.pricePerFoot;
    const actualSoilPrice = soilPrice ? parseFloat(soilPrice) : soilConfig.pricePerCuFt;

    const lumberCost = totalLumberFeet * actualLumberPrice;
    const cornerPostCost = cornerPostsNeeded * 8 * 2.50; // Assume $2.50/ft for 4x4
    const screwsCost = Math.ceil(screwsNeeded / 100) * 12; // ~$12 per 100 screws
    const soilCost = soilVolumeCuFt * actualSoilPrice;
    const totalCost = lumberCost + cornerPostCost + screwsCost + soilCost;

    // Planting area
    const plantingAreaSqFt = l * w;

    return {
      layersNeeded,
      actualHeight: actualHeight.toFixed(1),
      totalLumberFeet: totalLumberFeet.toFixed(0),
      boardsNeeded8ft,
      boardsNeeded10ft,
      boardsNeeded12ft,
      cornerPostsNeeded,
      screwsNeeded,
      soilVolumeCuFt: soilVolumeCuFt.toFixed(1),
      soilVolumeCuYd: soilVolumeCuYd.toFixed(2),
      soilVolumeGallons: soilVolumeGallons.toFixed(0),
      topsoilCuFt: topsoilCuFt.toFixed(1),
      compostCuFt: compostCuFt.toFixed(1),
      otherCuFt: otherCuFt.toFixed(1),
      lumberCost: lumberCost.toFixed(2),
      cornerPostCost: cornerPostCost.toFixed(2),
      screwsCost: screwsCost.toFixed(2),
      soilCost: soilCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      plantingAreaSqFt: plantingAreaSqFt.toFixed(0),
    };
  }, [length, width, height, woodType, soilMix, lumberPrice, soilPrice, woodConfig, soilConfig]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Flower2 className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.raisedBedCalculator.raisedGardenBedCalculator', 'Raised Garden Bed Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.raisedBedCalculator.calculateMaterialsSoilAndCosts', 'Calculate materials, soil, and costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bed Dimensions */}
        <div className="space-y-4">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 text-teal-500" />
            {t('tools.raisedBedCalculator.bedDimensionsFeet', 'Bed Dimensions (feet)')}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.length', 'Length')}</label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                min="1"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.width', 'Width')}</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min="1"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.heightInches', 'Height (inches)')}</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="1"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          {/* Quick height presets */}
          <div className="flex gap-2">
            {[6, 12, 18, 24].map((h) => (
              <button
                key={h}
                onClick={() => setHeight(h.toString())}
                className={`flex-1 py-2 rounded-lg text-sm ${parseInt(height) === h ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {h}"
              </button>
            ))}
          </div>
        </div>

        {/* Wood Type Selection */}
        <div className="space-y-3">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 text-teal-500" />
            {t('tools.raisedBedCalculator.lumberType', 'Lumber Type')}
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(woodTypes) as WoodType[]).map((w) => (
              <button
                key={w}
                onClick={() => setWoodType(w)}
                className={`py-2 px-3 rounded-lg text-sm ${woodType === w ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {w}
              </button>
            ))}
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Actual height: {woodConfig.heightInches}" per board
          </p>
        </div>

        {/* Soil Mix Selection */}
        <div className="space-y-3">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Leaf className="w-4 h-4 text-teal-500" />
            {t('tools.raisedBedCalculator.soilMix', 'Soil Mix')}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(soilMixes) as SoilMix[]).map((s) => (
              <button
                key={s}
                onClick={() => setSoilMix(s)}
                className={`py-2 px-3 rounded-lg text-sm ${soilMix === s ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {soilMixes[s].name}
              </button>
            ))}
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{soilConfig.description}</p>
            <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {soilConfig.topsoil}% Topsoil | {soilConfig.compost}% Compost | {soilConfig.other}% {soilConfig.otherName}
            </div>
          </div>
        </div>

        {/* Lumber Requirements */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 text-amber-500" />
            {t('tools.raisedBedCalculator.lumberRequirements', 'Lumber Requirements')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.layersNeeded', 'Layers Needed')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.layersNeeded}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.actualHeight', 'Actual Height')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.actualHeight}"</div>
            </div>
            <div className="col-span-2">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.totalLumber', 'Total Lumber')}</div>
              <div className="text-3xl font-bold text-teal-500">{calculations.totalLumberFeet} linear ft</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>8ft boards</div>
              <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.boardsNeeded8ft}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>10ft boards</div>
              <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.boardsNeeded10ft}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>12ft boards</div>
              <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.boardsNeeded12ft}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>4x4 Corner Posts (8ft)</div>
              <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.cornerPostsNeeded}</div>
            </div>
            <div className="col-span-2">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.deckScrews3', 'Deck Screws (3")')}</div>
              <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>~{calculations.screwsNeeded} screws</div>
            </div>
          </div>
        </div>

        {/* Soil Volume */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Leaf className="w-4 h-4 text-amber-500" />
            {t('tools.raisedBedCalculator.soilRequirements', 'Soil Requirements')}
          </h4>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.cubicFeet', 'Cubic Feet')}</div>
              <div className="text-2xl font-bold text-teal-500">{calculations.soilVolumeCuFt}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.cubicYards', 'Cubic Yards')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.soilVolumeCuYd}</div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.raisedBedCalculator.gallons', 'Gallons')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.soilVolumeGallons}</div>
            </div>
          </div>
          <div className={`border-t pt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {soilConfig.name} Breakdown:
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                <span className="font-medium">{t('tools.raisedBedCalculator.topsoil', 'Topsoil:')}</span> {calculations.topsoilCuFt} cu ft
              </div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                <span className="font-medium">{t('tools.raisedBedCalculator.compost', 'Compost:')}</span> {calculations.compostCuFt} cu ft
              </div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                <span className="font-medium">{soilConfig.otherName}:</span> {calculations.otherCuFt} cu ft
              </div>
            </div>
          </div>
        </div>

        {/* Plant Spacing Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Grid3X3 className="w-4 h-4 text-teal-500" />
            Plant Spacing Guide ({calculations.plantingAreaSqFt} sq ft bed)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {plantSpacings.map((plant) => {
              const plantsCount = Math.floor(parseFloat(calculations.plantingAreaSqFt) * plant.plantsPerSqFt);
              return (
                <div key={plant.name} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{plant.name}</div>
                  <div className="text-lg font-bold text-teal-500">{plantsCount}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{plant.spacing}" spacing</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Pricing */}
        <div className="space-y-3">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 text-teal-500" />
            {t('tools.raisedBedCalculator.customPricingOptional', 'Custom Pricing (optional)')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.raisedBedCalculator.lumberFt', 'Lumber $/ft')}
              </label>
              <input
                type="number"
                value={lumberPrice}
                onChange={(e) => setLumberPrice(e.target.value)}
                placeholder={woodConfig.pricePerFoot.toFixed(2)}
                step="0.01"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.raisedBedCalculator.soilCuFt', 'Soil $/cu ft')}
              </label>
              <input
                type="number"
                value={soilPrice}
                onChange={(e) => setSoilPrice(e.target.value)}
                placeholder={soilConfig.pricePerCuFt.toFixed(2)}
                step="0.01"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 text-teal-500" />
            {t('tools.raisedBedCalculator.estimatedCost', 'Estimated Cost')}
          </h4>
          <div className="space-y-2">
            <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Lumber ({woodType})</span>
              <span>${calculations.lumberCost}</span>
            </div>
            <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{t('tools.raisedBedCalculator.cornerPosts4x4', 'Corner Posts (4x4)')}</span>
              <span>${calculations.cornerPostCost}</span>
            </div>
            <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{t('tools.raisedBedCalculator.screws', 'Screws')}</span>
              <span>${calculations.screwsCost}</span>
            </div>
            <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Soil ({soilConfig.name})</span>
              <span>${calculations.soilCost}</span>
            </div>
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-teal-800' : 'border-teal-200'}`}>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.raisedBedCalculator.total', 'Total')}</span>
              <span className="text-2xl font-bold text-teal-500">${calculations.totalCost}</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.raisedBedCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.raisedBedCalculator.useCedarRedwoodOrTreated', 'Use cedar, redwood, or treated lumber for longevity')}</li>
                <li>{t('tools.raisedBedCalculator.addHardwareClothToBottom', 'Add hardware cloth to bottom to prevent burrowing pests')}</li>
                <li>{t('tools.raisedBedCalculator.considerAddingADripIrrigation', 'Consider adding a drip irrigation system')}</li>
                <li>{t('tools.raisedBedCalculator.lineWithLandscapeFabricTo', 'Line with landscape fabric to prevent soil loss')}</li>
                <li>12" depth is ideal for most vegetables; 18"+ for root crops</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaisedBedCalculatorTool;
