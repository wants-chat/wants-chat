import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Square, Layers, DollarSign, Info, Package, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type RoomShape = 'rectangle' | 'l-shape';
type FlooringType = 'hardwood' | 'laminate' | 'vinyl' | 'carpet';
type Unit = 'feet' | 'meters';

interface FlooringConfig {
  name: string;
  coveragePerBox: number; // sq ft per box
  coveragePerRoll: number; // sq ft per roll (for carpet)
  pricePerSqFt: number; // average price
  needsUnderlayment: boolean;
  underlaymentCoverage: number; // sq ft per roll
  description: string;
}

interface FlooringCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const FlooringCalculatorTool: React.FC<FlooringCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Room shape and flooring type
  const [roomShape, setRoomShape] = useState<RoomShape>('rectangle');
  const [flooringType, setFlooringType] = useState<FlooringType>('hardwood');
  const [unit, setUnit] = useState<Unit>('feet');

  // Rectangle dimensions
  const [length, setLength] = useState('12');
  const [width, setWidth] = useState('10');

  // L-shape dimensions (main section + extension)
  const [mainLength, setMainLength] = useState('15');
  const [mainWidth, setMainWidth] = useState('12');
  const [extLength, setExtLength] = useState('8');
  const [extWidth, setExtWidth] = useState('6');

  // Waste factor and custom pricing
  const [wasteFactor, setWasteFactor] = useState('10');
  const [customPrice, setCustomPrice] = useState('');

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

  const flooringTypes: Record<FlooringType, FlooringConfig> = {
    hardwood: {
      name: 'Hardwood',
      coveragePerBox: 20,
      coveragePerRoll: 0,
      pricePerSqFt: 8.00,
      needsUnderlayment: true,
      underlaymentCoverage: 100,
      description: 'Classic, durable, increases home value',
    },
    laminate: {
      name: 'Laminate',
      coveragePerBox: 24,
      coveragePerRoll: 0,
      pricePerSqFt: 3.50,
      needsUnderlayment: true,
      underlaymentCoverage: 100,
      description: 'Affordable, easy installation, wood-look',
    },
    vinyl: {
      name: 'Vinyl/LVP',
      coveragePerBox: 20,
      coveragePerRoll: 0,
      pricePerSqFt: 4.00,
      needsUnderlayment: false,
      underlaymentCoverage: 0,
      description: 'Waterproof, durable, versatile',
    },
    carpet: {
      name: 'Carpet',
      coveragePerBox: 0,
      coveragePerRoll: 144, // 12ft x 12ft roll
      pricePerSqFt: 5.00,
      needsUnderlayment: true,
      underlaymentCoverage: 180, // carpet pad
      description: 'Soft, warm, sound-absorbing',
    },
  };

  const config = flooringTypes[flooringType];
  const pricePerSqFt = customPrice ? parseFloat(customPrice) : config.pricePerSqFt;

  // Convert meters to feet if needed
  const toFeet = (value: number): number => {
    return unit === 'meters' ? value * 3.28084 : value;
  };

  const calculations = useMemo(() => {
    let rawSquareFootage = 0;
    const waste = parseFloat(wasteFactor) || 10;

    if (roomShape === 'rectangle') {
      const l = toFeet(parseFloat(length) || 0);
      const w = toFeet(parseFloat(width) || 0);
      rawSquareFootage = l * w;
    } else {
      // L-shape: main rectangle + extension rectangle
      const ml = toFeet(parseFloat(mainLength) || 0);
      const mw = toFeet(parseFloat(mainWidth) || 0);
      const el = toFeet(parseFloat(extLength) || 0);
      const ew = toFeet(parseFloat(extWidth) || 0);
      rawSquareFootage = (ml * mw) + (el * ew);
    }

    // Add waste factor
    const totalSquareFootage = rawSquareFootage * (1 + waste / 100);

    // Calculate boxes or rolls needed
    let boxesNeeded = 0;
    let rollsNeeded = 0;

    if (flooringType === 'carpet') {
      rollsNeeded = Math.ceil(totalSquareFootage / config.coveragePerRoll);
    } else {
      boxesNeeded = Math.ceil(totalSquareFootage / config.coveragePerBox);
    }

    // Calculate underlayment
    let underlaymentRolls = 0;
    if (config.needsUnderlayment && config.underlaymentCoverage > 0) {
      underlaymentRolls = Math.ceil(totalSquareFootage / config.underlaymentCoverage);
    }

    // Calculate costs
    const flooringCost = totalSquareFootage * pricePerSqFt;
    const underlaymentCost = underlaymentRolls * 35; // avg $35 per roll
    const totalCost = flooringCost + underlaymentCost;

    // Convert back to display units
    const displaySqFt = rawSquareFootage;
    const displaySqM = rawSquareFootage / 10.764;
    const displayTotalSqFt = totalSquareFootage;
    const displayTotalSqM = totalSquareFootage / 10.764;

    return {
      rawSquareFootage: displaySqFt.toFixed(1),
      rawSquareMeters: displaySqM.toFixed(2),
      totalSquareFootage: displayTotalSqFt.toFixed(1),
      totalSquareMeters: displayTotalSqM.toFixed(2),
      boxesNeeded,
      rollsNeeded,
      underlaymentRolls,
      flooringCost: flooringCost.toFixed(2),
      underlaymentCost: underlaymentCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      wasteSquareFootage: (totalSquareFootage - rawSquareFootage).toFixed(1),
    };
  }, [roomShape, length, width, mainLength, mainWidth, extLength, extWidth, wasteFactor, flooringType, config, pricePerSqFt, unit]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><Layers className="w-5 h-5 text-emerald-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flooringCalculator.flooringCalculator', 'Flooring Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.flooringCalculator.calculateMaterialsForAnyRoom', 'Calculate materials for any room')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Flooring Type Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(flooringTypes) as FlooringType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFlooringType(type)}
              className={`py-2 px-3 rounded-lg text-sm ${flooringType === type ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {flooringTypes[type].name}
            </button>
          ))}
        </div>

        {/* Flooring Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-emerald-500 font-bold">${pricePerSqFt.toFixed(2)}/sq ft</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.flooringCalculator.coverage', 'Coverage:')}</span> {flooringType === 'carpet' ? `${config.coveragePerRoll} sq ft/roll` : `${config.coveragePerBox} sq ft/box`}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.flooringCalculator.underlayment', 'Underlayment:')}</span> {config.needsUnderlayment ? t('tools.flooringCalculator.required', 'Required') : t('tools.flooringCalculator.notNeeded', 'Not needed')}
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {config.description}
          </p>
        </div>

        {/* Room Shape Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.flooringCalculator.roomShape', 'Room Shape')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setRoomShape('rectangle')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${roomShape === 'rectangle' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <Square className="w-4 h-4" />
              {t('tools.flooringCalculator.rectangle', 'Rectangle')}
            </button>
            <button
              onClick={() => setRoomShape('l-shape')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${roomShape === 'l-shape' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18v-8h-10v-10z" />
              </svg>
              {t('tools.flooringCalculator.lShape', 'L-Shape')}
            </button>
          </div>
        </div>

        {/* Unit Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('feet')}
            className={`flex-1 py-2 rounded-lg ${unit === 'feet' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.flooringCalculator.feet', 'Feet')}
          </button>
          <button
            onClick={() => setUnit('meters')}
            className={`flex-1 py-2 rounded-lg ${unit === 'meters' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.flooringCalculator.meters', 'Meters')}
          </button>
        </div>

        {/* Dimensions Input */}
        {roomShape === 'rectangle' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                Length ({unit})
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
                <Ruler className="w-4 h-4 inline mr-1" />
                Width ({unit})
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.flooringCalculator.mainSection', 'Main Section')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Length ({unit})
                  </label>
                  <input
                    type="number"
                    value={mainLength}
                    onChange={(e) => setMainLength(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Width ({unit})
                  </label>
                  <input
                    type="number"
                    value={mainWidth}
                    onChange={(e) => setMainWidth(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.flooringCalculator.extensionSection', 'Extension Section')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Length ({unit})
                  </label>
                  <input
                    type="number"
                    value={extLength}
                    onChange={(e) => setExtLength(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Width ({unit})
                  </label>
                  <input
                    type="number"
                    value={extWidth}
                    onChange={(e) => setExtWidth(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waste Factor */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.flooringCalculator.wasteFactor', 'Waste Factor (%)')}
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setWasteFactor(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(wasteFactor) === n ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}%
              </button>
            ))}
          </div>
          <input
            type="number"
            value={wasteFactor}
            onChange={(e) => setWasteFactor(e.target.value)}
            placeholder={t('tools.flooringCalculator.custom', 'Custom %')}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Custom Price */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.flooringCalculator.customPricePerSqFt', 'Custom Price per sq ft (optional)')}
          </label>
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>$</span>
            <input
              type="number"
              step="0.01"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder={config.pricePerSqFt.toFixed(2)}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flooringCalculator.roomArea', 'Room Area')}</span>
            </div>
            <div className="text-3xl font-bold text-emerald-500">{calculations.rawSquareFootage} sq ft</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.rawSquareMeters} sq m
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flooringCalculator.totalNeeded', 'Total Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.totalSquareFootage} sq ft</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              +{calculations.wasteSquareFootage} sq ft waste
            </div>
          </div>
        </div>

        {/* Materials Needed */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 inline mr-2" />
            {t('tools.flooringCalculator.materialsNeeded', 'Materials Needed')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {flooringType === 'carpet' ? t('tools.flooringCalculator.carpetRolls', 'Carpet Rolls') : t('tools.flooringCalculator.flooringBoxes', 'Flooring Boxes')}
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {flooringType === 'carpet' ? calculations.rollsNeeded : calculations.boxesNeeded}
              </div>
            </div>
            {config.needsUnderlayment && (
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {flooringType === 'carpet' ? t('tools.flooringCalculator.carpetPadRolls', 'Carpet Pad Rolls') : t('tools.flooringCalculator.underlaymentRolls', 'Underlayment Rolls')}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.underlaymentRolls}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 inline mr-2" />
            {t('tools.flooringCalculator.costEstimate', 'Cost Estimate')}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.flooringCalculator.flooringMaterial', 'Flooring Material')}</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.flooringCost}</span>
            </div>
            {config.needsUnderlayment && (
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {flooringType === 'carpet' ? t('tools.flooringCalculator.carpetPad', 'Carpet Pad') : t('tools.flooringCalculator.underlayment2', 'Underlayment')}
                </span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>${calculations.underlaymentCost}</span>
              </div>
            )}
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flooringCalculator.totalEstimate', 'Total Estimate')}</span>
              <span className="text-xl font-bold text-emerald-500">${calculations.totalCost}</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.flooringCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Add 10-15% waste for standard rooms, 15-20% for complex layouts</li>
                <li>- Measure at the widest points of each wall</li>
                <li>- Account for closets and alcoves in L-shape mode</li>
                <li>- Prices shown are material only; installation costs vary</li>
                <li>- Buy all materials from same lot to ensure color consistency</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlooringCalculatorTool;
