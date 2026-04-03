import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Square, Circle, Ruler, Package, Truck, Info, Calculator, Shovel } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type LawnShape = 'rectangle' | 'circle' | 'irregular';

interface SodType {
  name: string;
  sqFtPerPallet: number;
  sqFtPerRoll: number;
  description: string;
  bestFor: string;
}

interface SodCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SodCalculatorTool: React.FC<SodCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [shape, setShape] = useState<LawnShape>('rectangle');
  const [length, setLength] = useState('50');
  const [width, setWidth] = useState('30');
  const [diameter, setDiameter] = useState('30');
  const [irregularSqFt, setIrregularSqFt] = useState('1500');
  const [wasteFactor, setWasteFactor] = useState('10');
  const [sodType, setSodType] = useState<'pallet' | 'roll'>('pallet');

  // Soil prep calculator
  const [soilDepth, setSoilDepth] = useState('4');
  const [showSoilPrep, setShowSoilPrep] = useState(false);

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
      } else if (params.area) {
        setShape('irregular');
        setIrregularSqFt(params.area.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const sodTypes: Record<string, SodType> = {
    bermuda: {
      name: 'Bermuda Grass',
      sqFtPerPallet: 450,
      sqFtPerRoll: 10,
      description: 'Drought-tolerant, heat-loving grass',
      bestFor: 'Southern climates, full sun areas',
    },
    fescue: {
      name: 'Tall Fescue',
      sqFtPerPallet: 500,
      sqFtPerRoll: 10,
      description: 'Cool-season grass with deep roots',
      bestFor: 'Transition zones, shade tolerance',
    },
    kentucky: {
      name: 'Kentucky Bluegrass',
      sqFtPerPallet: 450,
      sqFtPerRoll: 10,
      description: 'Classic lawn grass, self-repairing',
      bestFor: 'Northern climates, high-traffic areas',
    },
    zoysia: {
      name: 'Zoysia Grass',
      sqFtPerPallet: 450,
      sqFtPerRoll: 10,
      description: 'Dense, carpet-like texture',
      bestFor: 'Warm climates, low maintenance',
    },
    staugustine: {
      name: 'St. Augustine',
      sqFtPerPallet: 400,
      sqFtPerRoll: 9,
      description: 'Thick, lush blades',
      bestFor: 'Coastal areas, shade tolerant',
    },
  };

  const [selectedGrass, setSelectedGrass] = useState('bermuda');
  const currentSod = sodTypes[selectedGrass];

  const calculations = useMemo(() => {
    let baseSqFt = 0;

    switch (shape) {
      case 'rectangle':
        baseSqFt = (parseFloat(length) || 0) * (parseFloat(width) || 0);
        break;
      case 'circle':
        const radius = (parseFloat(diameter) || 0) / 2;
        baseSqFt = Math.PI * radius * radius;
        break;
      case 'irregular':
        baseSqFt = parseFloat(irregularSqFt) || 0;
        break;
    }

    const wastePercentage = (parseFloat(wasteFactor) || 0) / 100;
    const totalSqFt = baseSqFt * (1 + wastePercentage);

    const pallets = Math.ceil(totalSqFt / currentSod.sqFtPerPallet);
    const rolls = Math.ceil(totalSqFt / currentSod.sqFtPerRoll);

    // Soil prep calculations (cubic yards for topsoil/compost)
    const depthInches = parseFloat(soilDepth) || 0;
    const depthFeet = depthInches / 12;
    const cubicFeet = baseSqFt * depthFeet;
    const cubicYards = cubicFeet / 27;

    // Starter fertilizer (typically 1 lb per 100 sq ft)
    const fertilizerLbs = Math.ceil(baseSqFt / 100);

    return {
      baseSqFt: baseSqFt.toFixed(0),
      wasteAmount: (baseSqFt * wastePercentage).toFixed(0),
      totalSqFt: totalSqFt.toFixed(0),
      pallets,
      rolls,
      cubicYards: cubicYards.toFixed(1),
      cubicFeet: cubicFeet.toFixed(0),
      fertilizerLbs,
    };
  }, [shape, length, width, diameter, irregularSqFt, wasteFactor, soilDepth, currentSod]);

  const shapeIcons = {
    rectangle: Square,
    circle: Circle,
    irregular: Leaf,
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg"><Leaf className="w-5 h-5 text-green-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sodCalculator.sodCalculator', 'Sod Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sodCalculator.calculateSodNeededForYour', 'Calculate sod needed for your lawn')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Lawn Shape Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sodCalculator.lawnShape', 'Lawn Shape')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['rectangle', 'circle', 'irregular'] as LawnShape[]).map((s) => {
              const Icon = shapeIcons[s];
              return (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm capitalize ${
                    shape === s
                      ? 'bg-green-500 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimension Inputs based on shape */}
        {shape === 'rectangle' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                {t('tools.sodCalculator.lengthFeet', 'Length (feet)')}
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="50"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                {t('tools.sodCalculator.widthFeet', 'Width (feet)')}
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
        )}

        {shape === 'circle' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ruler className="w-4 h-4 inline mr-1" />
              {t('tools.sodCalculator.diameterFeet', 'Diameter (feet)')}
            </label>
            <input
              type="number"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="30"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        )}

        {shape === 'irregular' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calculator className="w-4 h-4 inline mr-1" />
              {t('tools.sodCalculator.totalSquareFootage', 'Total Square Footage')}
            </label>
            <input
              type="number"
              value={irregularSqFt}
              onChange={(e) => setIrregularSqFt(e.target.value)}
              placeholder="1500"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.sodCalculator.tipDivideIrregularAreasInto', 'Tip: Divide irregular areas into smaller rectangles/circles, calculate each, and add together')}
            </p>
          </div>
        )}

        {/* Grass Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sodCalculator.grassType', 'Grass Type')}
          </label>
          <select
            value={selectedGrass}
            onChange={(e) => setSelectedGrass(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {Object.entries(sodTypes).map(([key, sod]) => (
              <option key={key} value={key}>{sod.name}</option>
            ))}
          </select>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{currentSod.description}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Best for: {currentSod.bestFor}</p>
          </div>
        </div>

        {/* Waste Factor */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Waste Factor: {wasteFactor}%
          </label>
          <input
            type="range"
            min="5"
            max="20"
            value={wasteFactor}
            onChange={(e) => setWasteFactor(e.target.value)}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs">
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>5% (Simple)</span>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>20% (Complex)</span>
          </div>
        </div>

        {/* Sod Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setSodType('pallet')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
              sodType === 'pallet'
                ? 'bg-green-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Package className="w-4 h-4" />
            {t('tools.sodCalculator.pallets', 'Pallets')}
          </button>
          <button
            onClick={() => setSodType('roll')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
              sodType === 'roll'
                ? 'bg-green-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            {t('tools.sodCalculator.rolls', 'Rolls')}
          </button>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Square className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sodCalculator.area', 'Area')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.baseSqFt}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.sodCalculator.sqFtBase', 'sq ft base')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sodCalculator.totalNeeded', 'Total Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.totalSqFt}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              sq ft (+{calculations.wasteAmount} waste)
            </div>
          </div>
        </div>

        {/* Pallets/Rolls Result */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sodCalculator.youNeedApproximately', 'You need approximately')}</div>
          <div className="text-4xl font-bold text-green-500 my-2">
            {sodType === 'pallet' ? calculations.pallets : calculations.rolls}
          </div>
          <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {sodType === 'pallet' ? t('tools.sodCalculator.pallets2', 'Pallets') : t('tools.sodCalculator.rolls2', 'Rolls')}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {sodType === 'pallet'
              ? `(${currentSod.sqFtPerPallet} sq ft per pallet)`
              : `(${currentSod.sqFtPerRoll} sq ft per roll)`
            }
          </div>
        </div>

        {/* Soil Prep Calculator Toggle */}
        <button
          onClick={() => setShowSoilPrep(!showSoilPrep)}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
            isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Shovel className="w-4 h-4" />
          {showSoilPrep ? t('tools.sodCalculator.hide', 'Hide') : t('tools.sodCalculator.show', 'Show')} Soil Prep Calculator
        </button>

        {/* Soil Prep Section */}
        {showSoilPrep && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sodCalculator.soilPreparation', 'Soil Preparation')}</h4>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.sodCalculator.topsoilCompostDepthInches', 'Topsoil/Compost Depth (inches)')}
              </label>
              <div className="flex gap-2">
                {[2, 4, 6].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSoilDepth(d.toString())}
                    className={`flex-1 py-2 rounded-lg ${
                      parseInt(soilDepth) === d
                        ? 'bg-green-500 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {d}"
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={soilDepth}
                onChange={(e) => setSoilDepth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sodCalculator.topsoilCompost', 'Topsoil/Compost')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.cubicYards} cu yd
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  ({calculations.cubicFeet} cu ft)
                </div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sodCalculator.starterFertilizer', 'Starter Fertilizer')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.fertilizerLbs} lbs
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.sodCalculator.1LbPer100Sq', '(1 lb per 100 sq ft)')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Installation Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.sodCalculator.installationTips', 'Installation Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Install sod within 24 hours of delivery</li>
                <li>- Lay sod in a brick-like pattern (stagger joints)</li>
                <li>- Ensure sod edges are tightly butted together</li>
                <li>- Water immediately and deeply after installation</li>
                <li>- Avoid walking on new sod for 2-3 weeks</li>
                <li>- First mow after 2-3 weeks (only remove 1/3 of blade)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Best Time to Install */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 text-amber-500" />
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>{t('tools.sodCalculator.bestTimeToInstall', 'Best Time to Install:')}</strong>
              <p className="mt-1">
                Cool-season grasses (Fescue, Kentucky Bluegrass): Early fall or spring<br />
                {t('tools.sodCalculator.warmSeasonGrassesBermudaZoysia', 'Warm-season grasses (Bermuda, Zoysia, St. Augustine): Late spring to early summer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SodCalculatorTool;
