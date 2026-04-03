import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Ruler, Package, DollarSign, Scale, Info, Circle, Square, Layers } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ShapeType = 'rectangle' | 'circle' | 'irregular';
type BagSize = '2cf' | '3cf' | '1cy';

interface BagConfig {
  name: string;
  cubicFeet: number;
  typicalWeight: number; // lbs
}

interface MulchCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const MulchCalculatorTool: React.FC<MulchCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [shape, setShape] = useState<ShapeType>('rectangle');
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('10');
  const [diameter, setDiameter] = useState('10');
  const [irregularArea, setIrregularArea] = useState('100');
  const [depth, setDepth] = useState('3');
  const [bagSize, setBagSize] = useState<BagSize>('2cf');
  const [pricePerBag, setPricePerBag] = useState('4.50');
  const [pricePerCubicYard, setPricePerCubicYard] = useState('35');
  const [useBulk, setUseBulk] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setLength(params.numbers[0].toString());
        setWidth(params.numbers[1].toString());
        if (params.numbers[2]) {
          setDepth(params.numbers[2].toString());
        }
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setLength(params.length.toString());
        setWidth(params.width.toString());
        if (params.depth) {
          setDepth(params.depth.toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const bagSizes: Record<BagSize, BagConfig> = {
    '2cf': {
      name: '2 cu ft bag',
      cubicFeet: 2,
      typicalWeight: 40,
    },
    '3cf': {
      name: '3 cu ft bag',
      cubicFeet: 3,
      typicalWeight: 60,
    },
    '1cy': {
      name: '1 cu yd (27 cu ft)',
      cubicFeet: 27,
      typicalWeight: 400,
    },
  };

  const depthOptions = [
    { value: '2', label: '2"', description: 'Light coverage' },
    { value: '3', label: '3"', description: 'Recommended' },
    { value: '4', label: '4"', description: 'Heavy coverage' },
    { value: '6', label: '6"', description: 'Deep beds' },
  ];

  const calculations = useMemo(() => {
    const depthFeet = parseFloat(depth) / 12; // Convert inches to feet
    let areaSqFt = 0;

    switch (shape) {
      case 'rectangle':
        areaSqFt = (parseFloat(length) || 0) * (parseFloat(width) || 0);
        break;
      case 'circle':
        const radius = (parseFloat(diameter) || 0) / 2;
        areaSqFt = Math.PI * radius * radius;
        break;
      case 'irregular':
        areaSqFt = parseFloat(irregularArea) || 0;
        break;
    }

    // Calculate volume
    const cubicFeet = areaSqFt * depthFeet;
    const cubicYards = cubicFeet / 27;

    // Bag calculations
    const selectedBag = bagSizes[bagSize];
    const bagsNeeded = Math.ceil(cubicFeet / selectedBag.cubicFeet);
    const totalWeight = bagsNeeded * selectedBag.typicalWeight;

    // Cost calculations
    const bagCost = bagsNeeded * (parseFloat(pricePerBag) || 0);
    const bulkCost = cubicYards * (parseFloat(pricePerCubicYard) || 0);

    return {
      areaSqFt: areaSqFt.toFixed(1),
      cubicFeet: cubicFeet.toFixed(2),
      cubicYards: cubicYards.toFixed(2),
      bagsNeeded,
      totalWeight: totalWeight.toFixed(0),
      totalWeightTons: (totalWeight / 2000).toFixed(2),
      bagCost: bagCost.toFixed(2),
      bulkCost: bulkCost.toFixed(2),
      savings: (bagCost - bulkCost).toFixed(2),
    };
  }, [shape, length, width, diameter, irregularArea, depth, bagSize, pricePerBag, pricePerCubicYard]);

  const ShapeIcon = shape === 'circle' ? Circle : shape === 'irregular' ? Layers : Square;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg"><Leaf className="w-5 h-5 text-green-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.mulchCalculator.mulchCalculator', 'Mulch Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.mulchCalculator.calculateMulchNeededForYour', 'Calculate mulch needed for your landscaping project')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Shape Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.mulchCalculator.areaShape', 'Area Shape')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShape('rectangle')}
              className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${shape === 'rectangle' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <Square className="w-5 h-5" />
              {t('tools.mulchCalculator.rectangle', 'Rectangle')}
            </button>
            <button
              onClick={() => setShape('circle')}
              className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${shape === 'circle' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <Circle className="w-5 h-5" />
              {t('tools.mulchCalculator.circle', 'Circle')}
            </button>
            <button
              onClick={() => setShape('irregular')}
              className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${shape === 'irregular' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <Layers className="w-5 h-5" />
              {t('tools.mulchCalculator.irregular', 'Irregular')}
            </button>
          </div>
        </div>

        {/* Dimension Inputs */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <ShapeIcon className="w-4 h-4 text-green-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {shape === 'rectangle' ? 'Rectangle Dimensions' : shape === 'circle' ? t('tools.mulchCalculator.circleDimensions', 'Circle Dimensions') : t('tools.mulchCalculator.irregularArea', 'Irregular Area')}
            </h4>
          </div>

          {shape === 'rectangle' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.mulchCalculator.lengthFeet', 'Length (feet)')}
                </label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.mulchCalculator.widthFeet', 'Width (feet)')}
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          )}

          {shape === 'circle' && (
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.mulchCalculator.diameterFeet', 'Diameter (feet)')}
              </label>
              <input
                type="number"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          )}

          {shape === 'irregular' && (
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.mulchCalculator.totalAreaSquareFeet', 'Total Area (square feet)')}
              </label>
              <input
                type="number"
                value={irregularArea}
                onChange={(e) => setIrregularArea(e.target.value)}
                placeholder={t('tools.mulchCalculator.enterMeasuredOrEstimatedArea', 'Enter measured or estimated area')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.mulchCalculator.tipBreakIrregularAreasInto', 'Tip: Break irregular areas into sections and add them together')}
              </p>
            </div>
          )}
        </div>

        {/* Depth Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Ruler className="w-4 h-4 inline mr-1" />
            {t('tools.mulchCalculator.mulchDepth', 'Mulch Depth')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {depthOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDepth(option.value)}
                className={`py-2 px-3 rounded-lg text-sm flex flex-col items-center ${depth === option.value ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <span className="font-bold">{option.label}</span>
                <span className={`text-xs ${depth === option.value ? 'text-green-100' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mulchCalculator.customDepth', 'Custom depth:')}</span>
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className={`w-20 px-3 py-1 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>inches</span>
          </div>
        </div>

        {/* Volume Results */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Square className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mulchCalculator.area', 'Area')}</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{calculations.areaSqFt}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.mulchCalculator.sqFt', 'sq ft')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-amber-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mulchCalculator.volume', 'Volume')}</span>
            </div>
            <div className="text-2xl font-bold text-amber-500">{calculations.cubicFeet}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.mulchCalculator.cuFt', 'cu ft')}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mulchCalculator.cubicYards', 'Cubic Yards')}</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{calculations.cubicYards}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.mulchCalculator.cuYd', 'cu yd')}</div>
          </div>
        </div>

        {/* Bag Size Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.mulchCalculator.bagSize', 'Bag Size')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(bagSizes) as BagSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setBagSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${bagSize === size ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {bagSizes[size].name}
              </button>
            ))}
          </div>
        </div>

        {/* Bags Needed & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.mulchCalculator.bagsNeeded', 'Bags Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.bagsNeeded}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {bagSizes[bagSize].name} bags
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.mulchCalculator.totalWeight', 'Total Weight')}</span>
            </div>
            <div className="text-3xl font-bold text-purple-500">{calculations.totalWeight}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              lbs ({calculations.totalWeightTons} tons)
            </div>
          </div>
        </div>

        {/* Cost Estimation */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.mulchCalculator.costEstimation', 'Cost Estimation')}</h4>
          </div>

          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setUseBulk(false)}
                className={`flex-1 py-2 rounded-lg ${!useBulk ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.mulchCalculator.baggedMulch', 'Bagged Mulch')}
              </button>
              <button
                onClick={() => setUseBulk(true)}
                className={`flex-1 py-2 rounded-lg ${useBulk ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.mulchCalculator.bulkMulch', 'Bulk Mulch')}
              </button>
            </div>

            {!useBulk ? (
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.mulchCalculator.pricePerBag', 'Price per bag ($)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pricePerBag}
                  onChange={(e) => setPricePerBag(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.mulchCalculator.pricePerCubicYard', 'Price per cubic yard ($)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pricePerCubicYard}
                  onChange={(e) => setPricePerCubicYard(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            )}

            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.mulchCalculator.estimatedTotalCost', 'Estimated Total Cost')}</div>
              <div className="text-3xl font-bold text-green-500">
                ${useBulk ? calculations.bulkCost : calculations.bagCost}
              </div>
              {parseFloat(calculations.savings) > 0 && !useBulk && (
                <div className={`text-sm mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  Bulk could save you ${calculations.savings}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.mulchCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- 2-3 inches is ideal for weed suppression</li>
                <li>- Keep mulch 2-3 inches away from plant stems</li>
                <li>- Add 10% extra for settling and waste</li>
                <li>- Bulk is usually cheaper for large areas (3+ cu yd)</li>
                <li>- Consider delivery fees when comparing prices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MulchCalculatorTool;
