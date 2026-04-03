import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Ruler, Package, Layers, Info, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ShingleType = '3tab' | 'architectural';
type RoofPitch = '2:12' | '3:12' | '4:12' | '5:12' | '6:12' | '7:12' | '8:12' | '9:12' | '10:12' | '12:12';

interface ShingleConfig {
  name: string;
  coveragePerBundle: number; // sq ft per bundle
  priceRange: string;
  lifespan: string;
  description: string;
}

interface PitchConfig {
  multiplier: number;
  difficulty: string;
}

interface RoofingCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const RoofingCalculatorTool: React.FC<RoofingCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [length, setLength] = useState('40');
  const [width, setWidth] = useState('30');
  const [pitch, setPitch] = useState<RoofPitch>('4:12');
  const [shingleType, setShingleType] = useState<ShingleType>('architectural');
  const [wasteFactor, setWasteFactor] = useState('10');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setLength(params.numbers[0].toString());
        setWidth(params.numbers[1].toString());
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setLength(params.length.toString());
        setWidth(params.width.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const shingleTypes: Record<ShingleType, ShingleConfig> = {
    '3tab': {
      name: '3-Tab Shingles',
      coveragePerBundle: 33.33, // 3 bundles = 1 square (100 sq ft)
      priceRange: '$70-$100 per square',
      lifespan: '15-20 years',
      description: 'Economical, flat appearance, lightweight',
    },
    architectural: {
      name: 'Architectural Shingles',
      coveragePerBundle: 33.33,
      priceRange: '$100-$150 per square',
      lifespan: '25-30 years',
      description: 'Dimensional look, more durable, wind resistant',
    },
  };

  const pitchMultipliers: Record<RoofPitch, PitchConfig> = {
    '2:12': { multiplier: 1.014, difficulty: 'Walkable' },
    '3:12': { multiplier: 1.031, difficulty: 'Walkable' },
    '4:12': { multiplier: 1.054, difficulty: 'Walkable' },
    '5:12': { multiplier: 1.083, difficulty: 'Walkable' },
    '6:12': { multiplier: 1.118, difficulty: 'Walkable' },
    '7:12': { multiplier: 1.158, difficulty: 'Moderate' },
    '8:12': { multiplier: 1.202, difficulty: 'Moderate' },
    '9:12': { multiplier: 1.250, difficulty: 'Steep' },
    '10:12': { multiplier: 1.302, difficulty: 'Steep' },
    '12:12': { multiplier: 1.414, difficulty: 'Very Steep' },
  };

  const shingleConfig = shingleTypes[shingleType];
  const pitchConfig = pitchMultipliers[pitch];

  const calculations = useMemo(() => {
    const roofLength = parseFloat(length) || 0;
    const roofWidth = parseFloat(width) || 0;
    const waste = parseFloat(wasteFactor) || 10;

    // Base area calculation
    const flatArea = roofLength * roofWidth;

    // Adjust for pitch
    const actualArea = flatArea * pitchConfig.multiplier;

    // Add waste factor
    const totalAreaWithWaste = actualArea * (1 + waste / 100);

    // Calculate squares (1 square = 100 sq ft)
    const squares = totalAreaWithWaste / 100;

    // Bundles needed (3 bundles per square)
    const bundles = Math.ceil(squares * 3);

    // Underlayment rolls (1 roll covers ~400 sq ft with overlap)
    const underlaymentRolls = Math.ceil(totalAreaWithWaste / 400);

    // Ridge cap calculation (perimeter of ridge)
    // Assuming standard gable roof, ridge length = width
    const ridgeLength = roofWidth;
    // Ridge cap bundles cover about 20-25 linear feet
    const ridgeCapBundles = Math.ceil(ridgeLength / 20);

    // Nails estimate (about 4 nails per shingle, ~21 shingles per bundle)
    // Plus extra for underlayment and ridge cap
    const nailsPerBundle = 84; // 4 nails x 21 shingles
    const totalNails = bundles * nailsPerBundle + (underlaymentRolls * 50) + (ridgeCapBundles * 40);
    const nailBoxes = Math.ceil(totalNails / 250); // Standard box = 250 nails

    // Drip edge (linear feet around perimeter)
    const perimeter = 2 * (roofLength + roofWidth);
    const dripEdgePieces = Math.ceil(perimeter / 10); // 10 ft pieces

    return {
      flatArea: flatArea.toFixed(0),
      actualArea: actualArea.toFixed(0),
      totalAreaWithWaste: totalAreaWithWaste.toFixed(0),
      squares: squares.toFixed(2),
      bundles,
      underlaymentRolls,
      ridgeCapBundles,
      totalNails: totalNails.toFixed(0),
      nailBoxes,
      dripEdgePieces,
      perimeter: perimeter.toFixed(0),
    };
  }, [length, width, pitch, wasteFactor, pitchConfig]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Home className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roofingCalculator.roofingMaterialCalculator', 'Roofing Material Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roofingCalculator.calculateShinglesUnderlaymentAndMore', 'Calculate shingles, underlayment, and more')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Roof Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              {t('tools.roofingCalculator.lengthFt', 'Length (ft)')}
            </label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="40"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              {t('tools.roofingCalculator.widthFt', 'Width (ft)')}
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="30"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Shingle Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.roofingCalculator.shingleType', 'Shingle Type')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(shingleTypes) as ShingleType[]).map((type) => (
              <button
                key={type}
                onClick={() => setShingleType(type)}
                className={`py-3 px-4 rounded-lg text-sm ${shingleType === type ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {shingleTypes[type].name}
              </button>
            ))}
          </div>
        </div>

        {/* Shingle Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{shingleConfig.name}</h4>
            <span className="text-orange-500 font-bold">{shingleConfig.lifespan}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.roofingCalculator.price', 'Price:')}</span> {shingleConfig.priceRange}
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {shingleConfig.description}
          </p>
        </div>

        {/* Roof Pitch Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.roofingCalculator.roofPitch', 'Roof Pitch')}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(pitchMultipliers) as RoofPitch[]).map((p) => (
              <button
                key={p}
                onClick={() => setPitch(p)}
                className={`py-2 px-2 rounded-lg text-xs ${pitch === p ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">{t('tools.roofingCalculator.difficulty', 'Difficulty:')}</span> {pitchConfig.difficulty} (multiplier: {pitchConfig.multiplier.toFixed(3)})
          </div>
        </div>

        {/* Waste Factor */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.roofingCalculator.wasteFactor', 'Waste Factor (%)')}
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setWasteFactor(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(wasteFactor) === n ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}%
              </button>
            ))}
          </div>
          <input
            type="number"
            value={wasteFactor}
            onChange={(e) => setWasteFactor(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Area Calculations */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingCalculator.flatArea', 'Flat Area')}</div>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.flatArea}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.roofingCalculator.sqFt', 'sq ft')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingCalculator.pitchedArea', 'Pitched Area')}</div>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.actualArea}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.roofingCalculator.sqFt2', 'sq ft')}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingCalculator.withWaste', 'With Waste')}</div>
            <div className={`text-lg font-bold text-orange-500`}>{calculations.totalAreaWithWaste}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.roofingCalculator.sqFt3', 'sq ft')}</div>
          </div>
        </div>

        {/* Main Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roofingCalculator.squares', 'Squares')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.squares}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              (1 square = 100 sq ft)
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roofingCalculator.bundles', 'Bundles')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.bundles}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.roofingCalculator.shingleBundlesNeeded', 'shingle bundles needed')}
            </div>
          </div>
        </div>

        {/* Additional Materials */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Layers className="w-4 h-4 inline mr-2" />
            {t('tools.roofingCalculator.additionalMaterials', 'Additional Materials')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roofingCalculator.underlaymentRolls', 'Underlayment Rolls:')}</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.underlaymentRolls}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roofingCalculator.ridgeCapBundles', 'Ridge Cap Bundles:')}</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.ridgeCapBundles}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roofingCalculator.dripEdgePieces', 'Drip Edge Pieces:')}</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.dripEdgePieces}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roofingCalculator.nailBoxes250ct', 'Nail Boxes (250ct):')}</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.nailBoxes}</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.roofingCalculator.estimatedTotalNails', 'Estimated Total Nails:')}</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.totalNails}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofingCalculator.totalRoofAreaWithWaste', 'Total Roof Area (with waste)')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.totalAreaWithWaste} sq ft
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Perimeter: {calculations.perimeter} linear ft
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.roofingCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.roofingCalculator.add1015WasteFor', 'Add 10-15% waste for simple roofs, 15-20% for complex designs')}</li>
                <li>{t('tools.roofingCalculator.ridgeCapBundlesCoverApproximately', 'Ridge cap bundles cover approximately 20 linear feet')}</li>
                <li>{t('tools.roofingCalculator.considerIceAndWaterShield', 'Consider ice and water shield for eaves in cold climates')}</li>
                <li>{t('tools.roofingCalculator.alwaysCheckLocalBuildingCodes', 'Always check local building codes for underlayment requirements')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoofingCalculatorTool;
