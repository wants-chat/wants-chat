import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Fish, Droplets, Thermometer, Filter, Layers, RefreshCw, Clock, Info, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface AquariumCalculatorToolProps {
  uiConfig?: UIConfig;
}

type TankShape = 'rectangular' | 'bowfront' | 'cylinder' | 'hexagonal' | 'corner';
type UnitSystem = 'imperial' | 'metric';

interface TankConfig {
  name: string;
  volumeMultiplier: number;
  description: string;
}

export const AquariumCalculatorTool: React.FC<AquariumCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Tank dimensions
  const [tankShape, setTankShape] = useState<TankShape>('rectangular');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [length, setLength] = useState('24');
  const [width, setWidth] = useState('12');
  const [height, setHeight] = useState('16');
  const [diameter, setDiameter] = useState('18');

  // Fish stocking
  const [fishSize, setFishSize] = useState<'small' | 'medium' | 'large'>('small');

  // Water change
  const [waterChangePercent, setWaterChangePercent] = useState('25');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.tankShape) setTankShape(prefillData.tankShape as TankShape);
      if (prefillData.length) setLength(String(prefillData.length));
      if (prefillData.width) setWidth(String(prefillData.width));
      if (prefillData.height) setHeight(String(prefillData.height));
      if (prefillData.diameter) setDiameter(String(prefillData.diameter));
      if (prefillData.fishSize) setFishSize(prefillData.fishSize as 'small' | 'medium' | 'large');
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const tankShapes: Record<TankShape, TankConfig> = {
    rectangular: {
      name: 'Rectangular',
      volumeMultiplier: 1,
      description: 'Standard rectangular tank',
    },
    bowfront: {
      name: 'Bow Front',
      volumeMultiplier: 1.1,
      description: 'Curved front glass tank',
    },
    cylinder: {
      name: 'Cylinder',
      volumeMultiplier: 0.785, // pi/4
      description: 'Round cylindrical tank',
    },
    hexagonal: {
      name: 'Hexagonal',
      volumeMultiplier: 0.866, // sqrt(3)/2
      description: 'Six-sided tank',
    },
    corner: {
      name: 'Corner',
      volumeMultiplier: 0.5,
      description: 'Quarter-circle corner tank',
    },
  };

  const fishSizeRules = {
    small: { name: 'Small (1-2")', gallonsPerFish: 1, inchPerGallon: 1 },
    medium: { name: 'Medium (2-4")', gallonsPerFish: 2, inchPerGallon: 1.5 },
    large: { name: 'Large (4-6"+)', gallonsPerFish: 5, inchPerGallon: 3 },
  };

  const calculations = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const d = parseFloat(diameter) || 0;
    const waterChange = parseFloat(waterChangePercent) || 25;

    const shapeConfig = tankShapes[tankShape];

    // Calculate volume in cubic inches
    let volumeCubicInches = 0;
    if (tankShape === 'cylinder' || tankShape === 'hexagonal') {
      // Use diameter for these shapes
      volumeCubicInches = d * d * h * shapeConfig.volumeMultiplier;
    } else if (tankShape === 'corner') {
      // Corner tank uses length as radius
      volumeCubicInches = l * l * h * shapeConfig.volumeMultiplier;
    } else {
      // Rectangular and bow front
      volumeCubicInches = l * w * h * shapeConfig.volumeMultiplier;
    }

    // Convert based on unit system
    let volumeGallons: number;
    let volumeLiters: number;

    if (unitSystem === 'imperial') {
      // Input is in inches
      volumeGallons = volumeCubicInches / 231; // 231 cubic inches per gallon
      volumeLiters = volumeGallons * 3.785;
    } else {
      // Input is in cm, recalculate
      const lCm = l;
      const wCm = w;
      const hCm = h;
      const dCm = d;

      let volumeCubicCm = 0;
      if (tankShape === 'cylinder' || tankShape === 'hexagonal') {
        volumeCubicCm = dCm * dCm * hCm * shapeConfig.volumeMultiplier;
      } else if (tankShape === 'corner') {
        volumeCubicCm = lCm * lCm * hCm * shapeConfig.volumeMultiplier;
      } else {
        volumeCubicCm = lCm * wCm * hCm * shapeConfig.volumeMultiplier;
      }

      volumeLiters = volumeCubicCm / 1000;
      volumeGallons = volumeLiters / 3.785;
    }

    // Water weight
    const waterWeightLbs = volumeGallons * 8.34;
    const waterWeightKg = volumeLiters;

    // Fish stocking calculator (conservative rule)
    const fishRule = fishSizeRules[fishSize];
    const maxFish = Math.floor(volumeGallons / fishRule.gallonsPerFish);

    // Heater wattage (3-5 watts per gallon, use 4 as average)
    const heaterWattsMin = Math.ceil(volumeGallons * 3);
    const heaterWattsMax = Math.ceil(volumeGallons * 5);
    const heaterWattsRecommended = Math.ceil(volumeGallons * 4);

    // Filter GPH (gallons per hour) - should cycle tank 4-6x per hour
    const filterGphMin = Math.ceil(volumeGallons * 4);
    const filterGphMax = Math.ceil(volumeGallons * 6);
    const filterGphRecommended = Math.ceil(volumeGallons * 5);

    // Substrate amount (1-2 lbs per gallon for 2-3 inch depth)
    const substrateLbsMin = Math.ceil(volumeGallons * 1);
    const substrateLbsMax = Math.ceil(volumeGallons * 2);
    const substrateKgMin = Math.ceil(substrateLbsMin * 0.453);
    const substrateKgMax = Math.ceil(substrateLbsMax * 0.453);

    // Water change volume
    const waterChangeGallons = (volumeGallons * waterChange) / 100;
    const waterChangeLiters = (volumeLiters * waterChange) / 100;

    // Cycle time estimate (4-8 weeks typically)
    const cycleTimeWeeksMin = 4;
    const cycleTimeWeeksMax = 8;

    // Surface area for gas exchange
    let surfaceArea = 0;
    if (tankShape === 'cylinder' || tankShape === 'hexagonal') {
      surfaceArea = d * d * shapeConfig.volumeMultiplier;
    } else if (tankShape === 'corner') {
      surfaceArea = l * l * shapeConfig.volumeMultiplier;
    } else {
      surfaceArea = l * w;
    }

    return {
      volumeGallons: volumeGallons.toFixed(1),
      volumeLiters: volumeLiters.toFixed(1),
      waterWeightLbs: waterWeightLbs.toFixed(1),
      waterWeightKg: waterWeightKg.toFixed(1),
      maxFish,
      heaterWattsMin,
      heaterWattsMax,
      heaterWattsRecommended,
      filterGphMin,
      filterGphMax,
      filterGphRecommended,
      substrateLbsMin,
      substrateLbsMax,
      substrateKgMin,
      substrateKgMax,
      waterChangeGallons: waterChangeGallons.toFixed(1),
      waterChangeLiters: waterChangeLiters.toFixed(1),
      cycleTimeWeeksMin,
      cycleTimeWeeksMax,
      surfaceArea: unitSystem === 'imperial' ? surfaceArea.toFixed(0) : surfaceArea.toFixed(0),
    };
  }, [tankShape, unitSystem, length, width, height, diameter, fishSize, waterChangePercent]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Fish className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aquariumCalculator.aquariumCalculator', 'Aquarium Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aquariumCalculator.calculateTankVolumeStockingAnd', 'Calculate tank volume, stocking, and equipment needs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Unit System Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnitSystem('imperial')}
            className={`flex-1 py-2 rounded-lg ${unitSystem === 'imperial' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.aquariumCalculator.imperialInGal', 'Imperial (in/gal)')}
          </button>
          <button
            onClick={() => setUnitSystem('metric')}
            className={`flex-1 py-2 rounded-lg ${unitSystem === 'metric' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.aquariumCalculator.metricCmL', 'Metric (cm/L)')}
          </button>
        </div>

        {/* Tank Shape Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.aquariumCalculator.tankShape', 'Tank Shape')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(tankShapes) as TankShape[]).map((shape) => (
              <button
                key={shape}
                onClick={() => setTankShape(shape)}
                className={`py-2 px-3 rounded-lg text-sm ${tankShape === shape ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {tankShapes[shape].name}
              </button>
            ))}
          </div>
        </div>

        {/* Tank Dimensions */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Tank Dimensions ({unitSystem === 'imperial' ? 'inches' : 'cm'})
          </h4>

          {(tankShape === 'cylinder' || tankShape === 'hexagonal') ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.aquariumCalculator.diameter', 'Diameter')}</label>
                <input
                  type="number"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.aquariumCalculator.height', 'Height')}</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          ) : tankShape === 'corner' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.aquariumCalculator.sideLength', 'Side Length')}</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.aquariumCalculator.height2', 'Height')}</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.aquariumCalculator.length', 'Length')}</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.aquariumCalculator.width', 'Width')}</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.aquariumCalculator.height3', 'Height')}</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Volume Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-cyan-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aquariumCalculator.volume', 'Volume')}</span>
            </div>
            <div className="text-3xl font-bold text-cyan-500">
              {unitSystem === 'imperial' ? calculations.volumeGallons : calculations.volumeLiters}
              <span className="text-lg ml-1">{unitSystem === 'imperial' ? 'gal' : 'L'}</span>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {unitSystem === 'imperial' ? `${calculations.volumeLiters} L` : `${calculations.volumeGallons} gal`}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aquariumCalculator.waterWeight', 'Water Weight')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">
              {unitSystem === 'imperial' ? calculations.waterWeightLbs : calculations.waterWeightKg}
              <span className="text-lg ml-1">{unitSystem === 'imperial' ? 'lbs' : 'kg'}</span>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {unitSystem === 'imperial' ? `${calculations.waterWeightKg} kg` : `${calculations.waterWeightLbs} lbs`}
            </div>
          </div>
        </div>

        {/* Fish Stocking Calculator */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Fish className="w-4 h-4 text-orange-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aquariumCalculator.fishStockingCalculator', 'Fish Stocking Calculator')}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {(Object.keys(fishSizeRules) as Array<'small' | 'medium' | 'large'>).map((size) => (
              <button
                key={size}
                onClick={() => setFishSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${fishSize === size ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                {fishSizeRules[size].name}
              </button>
            ))}
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">{calculations.maxFish}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Maximum {fishSizeRules[fishSize].name.toLowerCase()} fish (conservative)
            </div>
          </div>
        </div>

        {/* Equipment Recommendations */}
        <div className="grid grid-cols-2 gap-4">
          {/* Heater */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-red-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aquariumCalculator.heaterSize', 'Heater Size')}</span>
            </div>
            <div className="text-2xl font-bold text-red-500">{calculations.heaterWattsRecommended}W</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Range: {calculations.heaterWattsMin}-{calculations.heaterWattsMax}W
            </div>
          </div>

          {/* Filter */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aquariumCalculator.filterSize', 'Filter Size')}</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{calculations.filterGphRecommended} GPH</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Range: {calculations.filterGphMin}-{calculations.filterGphMax} GPH
            </div>
          </div>
        </div>

        {/* Substrate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aquariumCalculator.substrateAmount', 'Substrate Amount')}</span>
          </div>
          <div className="text-2xl font-bold text-amber-500">
            {unitSystem === 'imperial'
              ? `${calculations.substrateLbsMin}-${calculations.substrateLbsMax} lbs`
              : `${calculations.substrateKgMin}-${calculations.substrateKgMax} kg`
            }
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.aquariumCalculator.for23InchSubstrate', 'For 2-3 inch substrate depth')}
          </div>
        </div>

        {/* Water Change Calculator */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-4 h-4 text-cyan-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aquariumCalculator.waterChangeCalculator', 'Water Change Calculator')}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="50"
                value={waterChangePercent}
                onChange={(e) => setWaterChangePercent(e.target.value)}
                className="flex-1 accent-cyan-500"
              />
              <span className={`font-bold text-cyan-500 w-12`}>{waterChangePercent}%</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-500">
                {unitSystem === 'imperial' ? calculations.waterChangeGallons : calculations.waterChangeLiters}
                <span className="text-lg ml-1">{unitSystem === 'imperial' ? 'gal' : 'L'}</span>
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.aquariumCalculator.perWaterChange', 'per water change')}
              </div>
            </div>
          </div>
        </div>

        {/* Cycle Time Estimate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aquariumCalculator.nitrogenCycleTime', 'Nitrogen Cycle Time')}</span>
          </div>
          <div className="text-2xl font-bold text-purple-500">
            {calculations.cycleTimeWeeksMin}-{calculations.cycleTimeWeeksMax} weeks
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.aquariumCalculator.typicalTimeToCompleteFishless', 'Typical time to complete fishless cycling')}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.aquariumCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Always cycle your tank before adding fish</li>
                <li>• Stock slowly - add few fish at a time</li>
                <li>• Weekly 20-25% water changes are recommended</li>
                <li>• Test water parameters regularly (ammonia, nitrite, nitrate)</li>
                <li>• Consider tank weight when choosing location (water is heavy!)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AquariumCalculatorTool;
