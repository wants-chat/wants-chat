import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Waves, Ruler, DollarSign, Beaker, Info, Droplets } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type PoolShape = 'rectangular' | 'round' | 'oval' | 'kidney';

interface ShapeConfig {
  name: string;
  description: string;
  icon: string;
}

interface PoolVolumeCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const PoolVolumeCalculatorTool: React.FC<PoolVolumeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [shape, setShape] = useState<PoolShape>('rectangular');
  const [length, setLength] = useState('40');
  const [width, setWidth] = useState('20');
  const [diameter, setDiameter] = useState('24');
  const [shallowDepth, setShallowDepth] = useState('3');
  const [deepDepth, setDeepDepth] = useState('8');
  const [waterCostPerGallon, setWaterCostPerGallon] = useState('0.004');
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setLength(params.numbers[0].toString());
        setWidth(params.numbers[1].toString());
        if (params.numbers[2] && params.numbers[3]) {
          setShallowDepth(params.numbers[2].toString());
          setDeepDepth(params.numbers[3].toString());
        }
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setLength(params.length.toString());
        setWidth(params.width.toString());
        if (params.depth) {
          setShallowDepth(params.depth.toString());
          setDeepDepth(params.depth.toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const shapes: Record<PoolShape, ShapeConfig> = {
    rectangular: {
      name: 'Rectangular',
      description: 'Standard rectangular or square pool',
      icon: '[ ]',
    },
    round: {
      name: 'Round',
      description: 'Circular above-ground or in-ground pool',
      icon: 'O',
    },
    oval: {
      name: 'Oval',
      description: 'Elongated circular pool shape',
      icon: '( )',
    },
    kidney: {
      name: 'Kidney',
      description: 'Curved, organic kidney shape',
      icon: '~',
    },
  };

  const calculations = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const d = parseFloat(diameter) || 0;
    const shallow = parseFloat(shallowDepth) || 0;
    const deep = parseFloat(deepDepth) || 0;
    const costPerGallon = parseFloat(waterCostPerGallon) || 0;

    // Average depth
    const avgDepth = (shallow + deep) / 2;

    // Convert to feet if using meters
    const conversionFactor = unit === 'meters' ? 3.28084 : 1;
    const lFeet = l * conversionFactor;
    const wFeet = w * conversionFactor;
    const dFeet = d * conversionFactor;
    const avgDepthFeet = avgDepth * conversionFactor;

    let volumeCubicFeet = 0;

    switch (shape) {
      case 'rectangular':
        volumeCubicFeet = lFeet * wFeet * avgDepthFeet;
        break;
      case 'round':
        // Area = pi * r^2, Volume = Area * depth
        const radiusFeet = dFeet / 2;
        volumeCubicFeet = Math.PI * radiusFeet * radiusFeet * avgDepthFeet;
        break;
      case 'oval':
        // Oval = pi * (length/2) * (width/2) * depth
        volumeCubicFeet = Math.PI * (lFeet / 2) * (wFeet / 2) * avgDepthFeet;
        break;
      case 'kidney':
        // Kidney shape approximation: 0.45 * (A + B) * length * depth
        // Where A and B are the widths at the two ends (we use width for both)
        volumeCubicFeet = 0.45 * (wFeet + wFeet) * lFeet * avgDepthFeet;
        break;
    }

    // Conversions
    const gallons = volumeCubicFeet * 7.48052; // 1 cubic foot = 7.48052 gallons
    const liters = gallons * 3.78541; // 1 gallon = 3.78541 liters
    const cubicMeters = volumeCubicFeet * 0.0283168; // 1 cubic foot = 0.0283168 cubic meters

    // Water cost estimate
    const waterCost = gallons * costPerGallon;

    // Chemical dosing guide (based on gallons)
    // These are general guidelines for initial treatment
    const chlorineShockLbs = gallons / 10000; // 1 lb per 10,000 gallons
    const chlorineTabletsWeekly = Math.ceil(gallons / 5000); // 1 tablet per 5,000 gallons per week
    const algaecideOz = gallons / 5000 * 4; // 4 oz per 5,000 gallons
    const phIncreaserLbs = gallons / 10000 * 0.75; // To raise pH by 0.1
    const phDecreaserLbs = gallons / 10000 * 1.5; // To lower pH by 0.1

    return {
      volumeCubicFeet: volumeCubicFeet.toFixed(0),
      gallons: gallons.toFixed(0),
      liters: liters.toFixed(0),
      cubicMeters: cubicMeters.toFixed(2),
      avgDepth: avgDepth.toFixed(1),
      waterCost: waterCost.toFixed(2),
      chlorineShockLbs: chlorineShockLbs.toFixed(2),
      chlorineTabletsWeekly: chlorineTabletsWeekly,
      algaecideOz: algaecideOz.toFixed(1),
      phIncreaserLbs: phIncreaserLbs.toFixed(2),
      phDecreaserLbs: phDecreaserLbs.toFixed(2),
    };
  }, [shape, length, width, diameter, shallowDepth, deepDepth, waterCostPerGallon, unit]);

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString();
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Waves className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolVolumeCalculator.poolVolumeCalculator', 'Pool Volume Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolVolumeCalculator.calculateWaterVolumeCostAnd', 'Calculate water volume, cost, and chemical dosing')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Pool Shape Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(shapes) as PoolShape[]).map((s) => (
            <button
              key={s}
              onClick={() => setShape(s)}
              className={`py-3 px-3 rounded-lg text-sm transition-all ${shape === s ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="text-lg font-mono mb-1">{shapes[s].icon}</div>
              {shapes[s].name}
            </button>
          ))}
        </div>

        {/* Shape Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{shapes[shape].name} Pool</h4>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {shapes[shape].description}
          </p>
        </div>

        {/* Unit Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('feet')}
            className={`flex-1 py-2 rounded-lg ${unit === 'feet' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.poolVolumeCalculator.feet', 'Feet')}
          </button>
          <button
            onClick={() => setUnit('meters')}
            className={`flex-1 py-2 rounded-lg ${unit === 'meters' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.poolVolumeCalculator.meters', 'Meters')}
          </button>
        </div>

        {/* Dimension Inputs */}
        <div className="space-y-4">
          {(shape === 'rectangular' || shape === 'oval' || shape === 'kidney') && (
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
                  placeholder="40"
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
                  placeholder="20"
                />
              </div>
            </div>
          )}

          {shape === 'round' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                Diameter ({unit})
              </label>
              <input
                type="number"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="24"
              />
            </div>
          )}

          {/* Depth Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Droplets className="w-4 h-4 inline mr-1" />
                Shallow End ({unit})
              </label>
              <input
                type="number"
                value={shallowDepth}
                onChange={(e) => setShallowDepth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="3"
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Droplets className="w-4 h-4 inline mr-1" />
                Deep End ({unit})
              </label>
              <input
                type="number"
                value={deepDepth}
                onChange={(e) => setDeepDepth(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="8"
                step="0.5"
              />
            </div>
          </div>

          {/* Water Cost Input */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.poolVolumeCalculator.waterCostPerGallon', 'Water Cost per Gallon ($)')}
            </label>
            <input
              type="number"
              value={waterCostPerGallon}
              onChange={(e) => setWaterCostPerGallon(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              placeholder="0.004"
              step="0.001"
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.poolVolumeCalculator.averageUsRate0004', 'Average US rate: $0.004/gallon ($4 per 1,000 gallons)')}
            </p>
          </div>
        </div>

        {/* Volume Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-cyan-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolVolumeCalculator.gallons', 'Gallons')}</span>
            </div>
            <div className="text-3xl font-bold text-cyan-500">{formatNumber(calculations.gallons)}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.poolVolumeCalculator.usGallons', 'US gallons')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolVolumeCalculator.liters', 'Liters')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{formatNumber(calculations.liters)}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.cubicMeters} m³
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolVolumeCalculator.averageDepth', 'Average Depth')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.avgDepth} {unit}
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolVolumeCalculator.volume', 'Volume')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(calculations.volumeCubicFeet)} ft³
              </div>
            </div>
          </div>
        </div>

        {/* Water Cost Estimate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolVolumeCalculator.waterCostEstimate', 'Water Cost Estimate')}</h4>
          </div>
          <div className="text-3xl font-bold text-green-500">${calculations.waterCost}</div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            To fill the pool completely at ${waterCostPerGallon}/gallon
          </p>
        </div>

        {/* Chemical Dosing Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <Beaker className="w-5 h-5 text-purple-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolVolumeCalculator.chemicalDosingGuide', 'Chemical Dosing Guide')}</h4>
          </div>
          <div className="space-y-3">
            <div className={`flex justify-between items-center pb-2 border-b ${isDark ? 'border-gray-700' : 'border-purple-200'}`}>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolumeCalculator.chlorineShockInitial', 'Chlorine Shock (initial)')}</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.chlorineShockLbs} lbs</span>
            </div>
            <div className={`flex justify-between items-center pb-2 border-b ${isDark ? 'border-gray-700' : 'border-purple-200'}`}>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolumeCalculator.chlorineTabletsWeekly', 'Chlorine Tablets (weekly)')}</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.chlorineTabletsWeekly} tablets</span>
            </div>
            <div className={`flex justify-between items-center pb-2 border-b ${isDark ? 'border-gray-700' : 'border-purple-200'}`}>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolumeCalculator.algaecideWeekly', 'Algaecide (weekly)')}</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.algaecideOz} oz</span>
            </div>
            <div className={`flex justify-between items-center pb-2 border-b ${isDark ? 'border-gray-700' : 'border-purple-200'}`}>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolumeCalculator.phIncreaserPer01', 'pH Increaser (per 0.1 rise)')}</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.phIncreaserLbs} lbs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.poolVolumeCalculator.phDecreaserPer01', 'pH Decreaser (per 0.1 drop)')}</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.phDecreaserLbs} lbs</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.poolVolumeCalculator.poolMaintenanceTips', 'Pool Maintenance Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.poolVolumeCalculator.testWaterChemistry23', 'Test water chemistry 2-3 times per week')}</li>
                <li>{t('tools.poolVolumeCalculator.idealPhRange72', 'Ideal pH range: 7.2 - 7.6')}</li>
                <li>{t('tools.poolVolumeCalculator.chlorineLevels13Ppm', 'Chlorine levels: 1-3 ppm for daily use')}</li>
                <li>{t('tools.poolVolumeCalculator.runPump812Hours', 'Run pump 8-12 hours daily for proper circulation')}</li>
                <li>{t('tools.poolVolumeCalculator.shockPoolWeeklyOrAfter', 'Shock pool weekly or after heavy use')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolVolumeCalculatorTool;
