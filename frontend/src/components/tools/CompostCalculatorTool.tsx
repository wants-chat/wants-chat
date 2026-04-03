import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Recycle, Leaf, Scale, ThermometerSun, Info, Calculator, Clock, Droplets } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface CompostCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface CompostMaterial {
  name: string;
  type: 'green' | 'brown';
  cnRatio: number; // Carbon to Nitrogen ratio
  moistureContent: number; // percentage
  bulkDensity: number; // lbs per cubic foot
  description: string;
}

const materials: CompostMaterial[] = [
  // Green (Nitrogen-rich) materials
  { name: 'Fresh Grass Clippings', type: 'green', cnRatio: 20, moistureContent: 80, bulkDensity: 20, description: 'Add in thin layers to prevent matting' },
  { name: 'Kitchen Scraps (Vegetable)', type: 'green', cnRatio: 15, moistureContent: 80, bulkDensity: 30, description: 'Chop for faster decomposition' },
  { name: 'Coffee Grounds', type: 'green', cnRatio: 20, moistureContent: 65, bulkDensity: 35, description: 'Also attracts worms' },
  { name: 'Fresh Manure (Cow)', type: 'green', cnRatio: 20, moistureContent: 80, bulkDensity: 45, description: 'Hot compost activator' },
  { name: 'Fresh Manure (Chicken)', type: 'green', cnRatio: 7, moistureContent: 75, bulkDensity: 40, description: 'Very high nitrogen, use sparingly' },
  { name: 'Fresh Manure (Horse)', type: 'green', cnRatio: 25, moistureContent: 70, bulkDensity: 35, description: 'Contains bedding, good balance' },
  { name: 'Seaweed/Kelp', type: 'green', cnRatio: 19, moistureContent: 80, bulkDensity: 25, description: 'Rich in micronutrients' },
  { name: 'Legume Plants', type: 'green', cnRatio: 15, moistureContent: 75, bulkDensity: 15, description: 'Nitrogen-fixing plants' },
  { name: 'Fresh Weeds (No Seeds)', type: 'green', cnRatio: 25, moistureContent: 70, bulkDensity: 12, description: 'Avoid weeds that have gone to seed' },

  // Brown (Carbon-rich) materials
  { name: 'Dry Leaves', type: 'brown', cnRatio: 60, moistureContent: 30, bulkDensity: 4, description: 'Shred for faster breakdown' },
  { name: 'Straw', type: 'brown', cnRatio: 80, moistureContent: 15, bulkDensity: 5, description: 'Good for aeration' },
  { name: 'Hay', type: 'brown', cnRatio: 40, moistureContent: 20, bulkDensity: 8, description: 'May contain weed seeds' },
  { name: 'Cardboard (Shredded)', type: 'brown', cnRatio: 350, moistureContent: 5, bulkDensity: 8, description: 'Remove tape and staples' },
  { name: 'Newspaper (Shredded)', type: 'brown', cnRatio: 175, moistureContent: 5, bulkDensity: 6, description: 'Avoid glossy paper' },
  { name: 'Wood Chips', type: 'brown', cnRatio: 400, moistureContent: 40, bulkDensity: 15, description: 'Best for top mulch or paths' },
  { name: 'Sawdust', type: 'brown', cnRatio: 500, moistureContent: 40, bulkDensity: 20, description: 'Use sparingly, can compact' },
  { name: 'Corn Stalks', type: 'brown', cnRatio: 60, moistureContent: 20, bulkDensity: 6, description: 'Chop before adding' },
  { name: 'Pine Needles', type: 'brown', cnRatio: 80, moistureContent: 20, bulkDensity: 4, description: 'Acidic, use in moderation' },
  { name: 'Dried Grass', type: 'brown', cnRatio: 40, moistureContent: 15, bulkDensity: 6, description: 'Sun-dried clippings become brown material' },
];

interface BinSize {
  name: string;
  width: number;
  depth: number;
  height: number;
  volumeCuFt: number;
}

const standardBins: BinSize[] = [
  { name: 'Small Tumbler', width: 24, depth: 24, height: 30, volumeCuFt: 5 },
  { name: 'Medium Tumbler', width: 28, depth: 28, height: 36, volumeCuFt: 9.5 },
  { name: 'Standard Bin (3x3x3)', width: 36, depth: 36, height: 36, volumeCuFt: 27 },
  { name: 'Large Bin (4x4x3)', width: 48, depth: 48, height: 36, volumeCuFt: 48 },
  { name: 'Extra Large (4x4x4)', width: 48, depth: 48, height: 48, volumeCuFt: 64 },
];

export const CompostCalculatorTool: React.FC<CompostCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [calculationMode, setCalculationMode] = useState<'binSize' | 'recipe'>('binSize');

  // Bin sizing inputs
  const [binType, setBinType] = useState<'custom' | string>('Standard Bin (3x3x3)');
  const [customWidth, setCustomWidth] = useState('36');
  const [customDepth, setCustomDepth] = useState('36');
  const [customHeight, setCustomHeight] = useState('36');

  // Recipe inputs
  const [selectedMaterials, setSelectedMaterials] = useState<{material: string; volume: number}[]>([]);
  const [targetVolume, setTargetVolume] = useState('27');

  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.binType) setBinType(String(prefillData.binType));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const binCalculations = useMemo(() => {
    let width: number, depth: number, height: number;

    if (binType === 'custom') {
      width = parseFloat(customWidth) || 0;
      depth = parseFloat(customDepth) || 0;
      height = parseFloat(customHeight) || 0;
    } else {
      const bin = standardBins.find(b => b.name === binType);
      if (bin) {
        width = bin.width;
        depth = bin.depth;
        height = bin.height;
      } else {
        return null;
      }
    }

    const volumeCuIn = width * depth * height;
    const volumeCuFt = volumeCuIn / 1728;
    const volumeGallons = volumeCuFt * 7.48;
    const volumeLiters = volumeGallons * 3.785;

    // Material estimates (assuming 3:1 brown:green ratio by volume)
    const brownVolume = volumeCuFt * 0.75;
    const greenVolume = volumeCuFt * 0.25;

    // Finished compost (typically 50-60% of original volume)
    const finishedVolume = volumeCuFt * 0.5;

    // Surface area for heat retention
    const surfaceArea = 2 * (width * depth + width * height + depth * height) / 144; // sq ft

    // Is it large enough for hot composting? (minimum ~1 cubic yard)
    const isHotCompostable = volumeCuFt >= 27;

    return {
      width,
      depth,
      height,
      volumeCuFt: volumeCuFt.toFixed(1),
      volumeGallons: volumeGallons.toFixed(0),
      volumeLiters: volumeLiters.toFixed(0),
      brownVolume: brownVolume.toFixed(1),
      greenVolume: greenVolume.toFixed(1),
      finishedVolume: finishedVolume.toFixed(1),
      surfaceArea: surfaceArea.toFixed(1),
      isHotCompostable,
    };
  }, [binType, customWidth, customDepth, customHeight]);

  const recipeCalculations = useMemo(() => {
    if (selectedMaterials.length === 0) return null;

    let totalCarbon = 0;
    let totalNitrogen = 0;
    let totalVolume = 0;
    let totalWeight = 0;
    let greenVolume = 0;
    let brownVolume = 0;

    selectedMaterials.forEach(({ material, volume }) => {
      const mat = materials.find(m => m.name === material);
      if (mat && volume > 0) {
        const weight = volume * mat.bulkDensity;
        const carbon = weight * (mat.cnRatio / (mat.cnRatio + 1));
        const nitrogen = weight / (mat.cnRatio + 1);

        totalCarbon += carbon;
        totalNitrogen += nitrogen;
        totalVolume += volume;
        totalWeight += weight;

        if (mat.type === 'green') greenVolume += volume;
        else brownVolume += volume;
      }
    });

    const cnRatio = totalNitrogen > 0 ? totalCarbon / totalNitrogen : 0;
    const idealCN = 30;
    const cnStatus = cnRatio < 20 ? 'Too wet/smelly (add browns)'
                   : cnRatio > 40 ? 'Too dry/slow (add greens)'
                   : 'Good balance!';

    // Estimate composting time based on C:N ratio
    let compostTime: string;
    if (cnRatio >= 25 && cnRatio <= 35) {
      compostTime = '2-3 months (hot composting)';
    } else if (cnRatio >= 20 && cnRatio <= 40) {
      compostTime = '3-6 months';
    } else {
      compostTime = '6-12 months (cold composting)';
    }

    return {
      cnRatio: cnRatio.toFixed(1),
      cnStatus,
      totalVolume: totalVolume.toFixed(1),
      totalWeight: totalWeight.toFixed(0),
      greenVolume: greenVolume.toFixed(1),
      brownVolume: brownVolume.toFixed(1),
      greenPercent: ((greenVolume / totalVolume) * 100).toFixed(0),
      brownPercent: ((brownVolume / totalVolume) * 100).toFixed(0),
      compostTime,
      finishedVolume: (totalVolume * 0.5).toFixed(1),
    };
  }, [selectedMaterials]);

  const addMaterial = (materialName: string) => {
    if (!selectedMaterials.find(m => m.material === materialName)) {
      setSelectedMaterials([...selectedMaterials, { material: materialName, volume: 1 }]);
    }
  };

  const updateMaterialVolume = (materialName: string, volume: number) => {
    setSelectedMaterials(prev =>
      prev.map(m => m.material === materialName ? { ...m, volume } : m)
    );
  };

  const removeMaterial = (materialName: string) => {
    setSelectedMaterials(prev => prev.filter(m => m.material !== materialName));
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Recycle className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.compostCalculator.compostCalculator', 'Compost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.compostCalculator.calculateBinSizeAndMaterial', 'Calculate bin size and material ratios')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Calculation Mode */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCalculationMode('binSize')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              calculationMode === 'binSize'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('tools.compostCalculator.binSizeCalculator', 'Bin Size Calculator')}
          </button>
          <button
            onClick={() => setCalculationMode('recipe')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              calculationMode === 'recipe'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('tools.compostCalculator.recipeMixer', 'Recipe Mixer')}
          </button>
        </div>

        {calculationMode === 'binSize' && (
          <>
            {/* Bin Selection */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.compostCalculator.binType', 'Bin Type')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {standardBins.map(bin => (
                  <button
                    key={bin.name}
                    onClick={() => setBinType(bin.name)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                      binType === bin.name
                        ? 'bg-teal-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div>{bin.name}</div>
                    <div className="opacity-75">{bin.volumeCuFt} cu ft</div>
                  </button>
                ))}
                <button
                  onClick={() => setBinType('custom')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    binType === 'custom'
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.compostCalculator.customSize', 'Custom Size')}
                </button>
              </div>
            </div>

            {/* Custom Dimensions */}
            {binType === 'custom' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostCalculator.widthIn', 'Width (in)')}</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    min="12"
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostCalculator.depthIn', 'Depth (in)')}</label>
                  <input
                    type="number"
                    value={customDepth}
                    onChange={(e) => setCustomDepth(e.target.value)}
                    min="12"
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostCalculator.heightIn', 'Height (in)')}</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    min="12"
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            )}

            {/* Bin Results */}
            {binCalculations && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Calculator className="w-4 h-4 text-teal-500" />
                  {t('tools.compostCalculator.binSpecifications', 'Bin Specifications')}
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-teal-500/10">
                    <div className="text-2xl font-bold text-teal-500">{binCalculations.volumeCuFt}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostCalculator.cubicFeet', 'cubic feet')}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-500/10">
                    <div className="text-2xl font-bold text-blue-500">{binCalculations.volumeGallons}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>gallons</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-500/10">
                    <div className="text-2xl font-bold text-purple-500">{binCalculations.finishedVolume}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostCalculator.cuFtFinished', 'cu ft finished')}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-500/10">
                    <div className="text-2xl font-bold text-amber-500">{binCalculations.surfaceArea}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostCalculator.sqFtSurface', 'sq ft surface')}</div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg mb-4 ${binCalculations.isHotCompostable ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                  <div className="flex items-center gap-2">
                    <ThermometerSun className={`w-5 h-5 ${binCalculations.isHotCompostable ? 'text-green-500' : 'text-amber-500'}`} />
                    <span className={`font-medium ${binCalculations.isHotCompostable ? 'text-green-500' : 'text-amber-500'}`}>
                      {binCalculations.isHotCompostable
                        ? t('tools.compostCalculator.largeEnoughForHotComposting', 'Large enough for hot composting!') : t('tools.compostCalculator.coldCompostingOnlyNeed27', 'Cold composting only (need 27+ cu ft for hot)')}
                    </span>
                  </div>
                </div>

                <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.compostCalculator.materialRequirements31Ratio', 'Material Requirements (3:1 ratio):')}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-600 rounded"></div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Brown materials: <strong className="text-amber-500">{binCalculations.brownVolume} cu ft</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded"></div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Green materials: <strong className="text-green-500">{binCalculations.greenVolume} cu ft</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {calculationMode === 'recipe' && (
          <>
            {/* Material Selection */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.compostCalculator.addMaterials', 'Add Materials')}
              </label>

              {/* Green Materials */}
              <div>
                <div className={`text-xs font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  {t('tools.compostCalculator.greenNitrogenRich', 'Green (Nitrogen-rich)')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {materials.filter(m => m.type === 'green').map(m => (
                    <button
                      key={m.name}
                      onClick={() => addMaterial(m.name)}
                      disabled={selectedMaterials.some(s => s.material === m.name)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        selectedMaterials.some(s => s.material === m.name)
                          ? 'bg-green-500/30 text-green-400 cursor-not-allowed'
                          : isDark
                          ? 'bg-gray-800 text-gray-300 hover:bg-green-900/30 hover:text-green-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brown Materials */}
              <div>
                <div className={`text-xs font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  <div className="w-3 h-3 bg-amber-600 rounded"></div>
                  {t('tools.compostCalculator.brownCarbonRich', 'Brown (Carbon-rich)')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {materials.filter(m => m.type === 'brown').map(m => (
                    <button
                      key={m.name}
                      onClick={() => addMaterial(m.name)}
                      disabled={selectedMaterials.some(s => s.material === m.name)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        selectedMaterials.some(s => s.material === m.name)
                          ? 'bg-amber-500/30 text-amber-400 cursor-not-allowed'
                          : isDark
                          ? 'bg-gray-800 text-gray-300 hover:bg-amber-900/30 hover:text-amber-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-700'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Materials with Volume */}
            {selectedMaterials.length > 0 && (
              <div className="space-y-3">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.compostCalculator.yourRecipeAdjustVolumesIn', 'Your Recipe (adjust volumes in cubic feet)')}
                </label>
                {selectedMaterials.map(({ material, volume }) => {
                  const mat = materials.find(m => m.name === material);
                  return (
                    <div key={material} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className={`w-3 h-3 rounded ${mat?.type === 'green' ? 'bg-green-500' : 'bg-amber-600'}`}></div>
                      <span className={`flex-1 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{material}</span>
                      <input
                        type="number"
                        value={volume}
                        onChange={(e) => updateMaterialVolume(material, parseFloat(e.target.value) || 0)}
                        min="0.1"
                        step="0.5"
                        className={`w-20 px-2 py-1 text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.compostCalculator.cuFt', 'cu ft')}</span>
                      <button
                        onClick={() => removeMaterial(material)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        {t('tools.compostCalculator.remove', 'Remove')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recipe Results */}
            {recipeCalculations && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Scale className="w-4 h-4 text-teal-500" />
                  {t('tools.compostCalculator.recipeAnalysis', 'Recipe Analysis')}
                </h4>

                {/* C:N Ratio Visual */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostCalculator.carbonNitrogenRatio', 'Carbon:Nitrogen Ratio')}</span>
                    <span className={`text-lg font-bold ${
                      parseFloat(recipeCalculations.cnRatio) >= 25 && parseFloat(recipeCalculations.cnRatio) <= 35
                        ? 'text-green-500'
                        : 'text-amber-500'
                    }`}>
                      {recipeCalculations.cnRatio}:1
                    </span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        parseFloat(recipeCalculations.cnRatio) >= 25 && parseFloat(recipeCalculations.cnRatio) <= 35
                          ? 'bg-green-500'
                          : parseFloat(recipeCalculations.cnRatio) < 25
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (parseFloat(recipeCalculations.cnRatio) / 50) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-blue-400">Too Wet ({"<"}20)</span>
                    <span className="text-green-400">{t('tools.compostCalculator.ideal2535', 'Ideal (25-35)')}</span>
                    <span className="text-amber-400">Too Dry ({">"}40)</span>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${
                    recipeCalculations.cnStatus.includes('Good') ? 'text-green-500' : 'text-amber-500'
                  }`}>
                    {recipeCalculations.cnStatus}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-teal-500/10">
                    <div className="text-2xl font-bold text-teal-500">{recipeCalculations.totalVolume}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostCalculator.cuFtTotal', 'cu ft total')}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/10">
                    <div className="text-2xl font-bold text-green-500">{recipeCalculations.greenPercent}%</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>green</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-500/10">
                    <div className="text-2xl font-bold text-amber-500">{recipeCalculations.brownPercent}%</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>brown</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-500/10">
                    <div className="text-2xl font-bold text-purple-500">{recipeCalculations.finishedVolume}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostCalculator.cuFtFinished2', 'cu ft finished')}</div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Estimated time: <strong className="text-teal-500">{recipeCalculations.compostTime}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Composting Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.compostCalculator.quickCompostingGuide', 'Quick Composting Guide')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Droplets className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <strong className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.compostCalculator.moisture', 'Moisture')}</strong>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('tools.compostCalculator.keepAsDampAsA', 'Keep as damp as a wrung-out sponge (40-60% moisture)')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ThermometerSun className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <strong className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.compostCalculator.temperature', 'Temperature')}</strong>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('tools.compostCalculator.hotPilesReach130160', 'Hot piles reach 130-160°F, turn when temp drops')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-teal-500 mt-0.5" />
              <div>
                <strong className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.compostCalculator.balance', 'Balance')}</strong>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('tools.compostCalculator.idealCNRatioIs', 'Ideal C:N ratio is 25-35:1, adjust as needed')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Recycle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <strong className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.compostCalculator.turning', 'Turning')}</strong>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('tools.compostCalculator.turnEvery12Weeks', 'Turn every 1-2 weeks for faster decomposition')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.compostCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.compostCalculator.minimumPileSizeForHot', 'Minimum pile size for hot composting: 3\' x 3\' x 3\' (27 cu ft)')}</li>
                <li>{t('tools.compostCalculator.chopMaterialsIntoSmallerPieces', 'Chop materials into smaller pieces for faster decomposition')}</li>
                <li>{t('tools.compostCalculator.layerGreensAndBrownsLike', 'Layer greens and browns like a lasagna')}</li>
                <li>{t('tools.compostCalculator.tooSmellyAddMoreBrowns', 'Too smelly? Add more browns. Too slow? Add more greens.')}</li>
                <li>{t('tools.compostCalculator.finishedCompostSmellsEarthyAnd', 'Finished compost smells earthy and looks dark brown')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompostCalculatorTool;
