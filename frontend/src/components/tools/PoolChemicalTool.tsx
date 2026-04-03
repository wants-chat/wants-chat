import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Beaker, AlertTriangle, Calendar, Info, Waves, FlaskConical, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PoolChemicalToolProps {
  uiConfig?: UIConfig;
}

type PoolShape = 'rectangular' | 'round' | 'oval' | 'kidney' | 'freeform';
type ChemicalType = 'ph' | 'chlorine' | 'shock' | 'algaecide' | 'stabilizer';

interface PoolDimensions {
  length: string;
  width: string;
  depth: string;
  diameter: string;
}

interface ChemicalLevels {
  currentPh: string;
  targetPh: string;
  currentChlorine: string;
  targetChlorine: string;
  currentAlkalinity: string;
  currentCya: string;
}

interface MaintenanceTask {
  task: string;
  frequency: string;
  nextDue: string;
  icon: React.ReactNode;
}

export const PoolChemicalTool: React.FC<PoolChemicalToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<'volume' | 'chemicals' | 'schedule'>('volume');
  const [poolShape, setPoolShape] = useState<PoolShape>('rectangular');
  const [volumeUnit, setVolumeUnit] = useState<'gallons' | 'liters'>('gallons');
  const [dimensions, setDimensions] = useState<PoolDimensions>({
    length: '30',
    width: '15',
    depth: '5',
    diameter: '15',
  });
  const [chemicalLevels, setChemicalLevels] = useState<ChemicalLevels>({
    currentPh: '7.0',
    targetPh: '7.4',
    currentChlorine: '1.0',
    targetChlorine: '3.0',
    currentAlkalinity: '80',
    currentCya: '30',
  });
  const [selectedChemical, setSelectedChemical] = useState<ChemicalType>('chlorine');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.poolShape) setPoolShape(prefillData.poolShape as PoolShape);
      if (prefillData.dimensions) {
        setDimensions(prev => ({
          ...prev,
          ...(prefillData.dimensions as Partial<PoolDimensions>)
        }));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Calculate pool volume in gallons
  const poolVolume = useMemo(() => {
    const length = parseFloat(dimensions.length) || 0;
    const width = parseFloat(dimensions.width) || 0;
    const depth = parseFloat(dimensions.depth) || 0;
    const diameter = parseFloat(dimensions.diameter) || 0;

    let cubicFeet = 0;

    switch (poolShape) {
      case 'rectangular':
        cubicFeet = length * width * depth;
        break;
      case 'round':
        cubicFeet = Math.PI * Math.pow(diameter / 2, 2) * depth;
        break;
      case 'oval':
        cubicFeet = Math.PI * (length / 2) * (width / 2) * depth;
        break;
      case 'kidney':
        // Kidney shape approximation: 0.45 * (A + B) * length * depth
        cubicFeet = 0.45 * (length + width) * length * depth * 0.5;
        break;
      case 'freeform':
        // Freeform approximation: 85% of rectangular
        cubicFeet = length * width * depth * 0.85;
        break;
    }

    const gallons = cubicFeet * 7.48052;
    const liters = gallons * 3.78541;

    return {
      gallons: Math.round(gallons),
      liters: Math.round(liters),
      cubicFeet: cubicFeet.toFixed(1),
    };
  }, [dimensions, poolShape]);

  // Calculate chemical dosages
  const chemicalDosages = useMemo(() => {
    const volume = poolVolume.gallons;
    const currentPh = parseFloat(chemicalLevels.currentPh) || 7.0;
    const targetPh = parseFloat(chemicalLevels.targetPh) || 7.4;
    const currentCl = parseFloat(chemicalLevels.currentChlorine) || 0;
    const targetCl = parseFloat(chemicalLevels.targetChlorine) || 3.0;
    const currentAlk = parseFloat(chemicalLevels.currentAlkalinity) || 80;
    const currentCya = parseFloat(chemicalLevels.currentCya) || 30;

    // pH adjustment (soda ash to raise, muriatic acid to lower)
    const phDiff = targetPh - currentPh;
    let phChemical = '';
    let phAmount = 0;
    let phUnit = 'oz';

    if (phDiff > 0) {
      // Need to raise pH - use soda ash (sodium carbonate)
      // Approx 6 oz per 10,000 gallons raises pH by 0.2
      phAmount = (phDiff / 0.2) * 6 * (volume / 10000);
      phChemical = 'Soda Ash';
      phUnit = 'oz';
    } else if (phDiff < 0) {
      // Need to lower pH - use muriatic acid
      // Approx 16 oz per 10,000 gallons lowers pH by 0.2
      phAmount = Math.abs(phDiff / 0.2) * 16 * (volume / 10000);
      phChemical = 'Muriatic Acid';
      phUnit = 'fl oz';
    }

    // Chlorine adjustment (liquid chlorine or granular)
    const clDiff = targetCl - currentCl;
    // 1 gallon of liquid chlorine (12.5%) raises 10,000 gallons by ~10 ppm
    const liquidChlorineGal = (clDiff / 10) * (volume / 10000);
    // 1 lb of granular chlorine (65%) raises 10,000 gallons by ~7.5 ppm
    const granularChlorineLbs = (clDiff / 7.5) * (volume / 10000);

    // Shock treatment (super chlorination)
    // 1 lb of calcium hypochlorite per 10,000 gallons for regular shock
    const shockLbs = volume / 10000;
    // For algae: double or triple the amount
    const algaeShockLbs = shockLbs * 2;

    // Algaecide (maintenance dose)
    // Typically 2-4 oz per 10,000 gallons weekly
    const algaecideOz = 3 * (volume / 10000);

    // Stabilizer (CYA) - target 30-50 ppm
    const cyaTarget = 40;
    const cyaDiff = cyaTarget - currentCya;
    // 1 lb of stabilizer per 10,000 gallons raises CYA by ~10 ppm
    const stabilizerLbs = cyaDiff > 0 ? (cyaDiff / 10) * (volume / 10000) : 0;

    // Alkalinity adjustment
    const alkTarget = 100;
    const alkDiff = alkTarget - currentAlk;
    // 1.5 lbs of baking soda per 10,000 gallons raises alkalinity by ~10 ppm
    const bakingSodaLbs = alkDiff > 0 ? (alkDiff / 10) * 1.5 * (volume / 10000) : 0;

    return {
      ph: {
        chemical: phChemical,
        amount: phAmount.toFixed(1),
        unit: phUnit,
        needed: Math.abs(phDiff) > 0.1,
      },
      chlorine: {
        liquid: liquidChlorineGal.toFixed(2),
        granular: granularChlorineLbs.toFixed(2),
        needed: clDiff > 0.5,
      },
      shock: {
        regular: shockLbs.toFixed(2),
        algae: algaeShockLbs.toFixed(2),
      },
      algaecide: {
        weekly: algaecideOz.toFixed(1),
      },
      stabilizer: {
        amount: stabilizerLbs.toFixed(2),
        needed: cyaDiff > 5,
      },
      alkalinity: {
        amount: bakingSodaLbs.toFixed(2),
        needed: alkDiff > 10,
      },
    };
  }, [poolVolume, chemicalLevels]);

  // Maintenance schedule
  const maintenanceSchedule: MaintenanceTask[] = [
    {
      task: 'Test pH & Chlorine',
      frequency: 'Daily or every other day',
      nextDue: 'Today',
      icon: <Beaker className="w-4 h-4 text-blue-500" />,
    },
    {
      task: 'Skim surface & empty baskets',
      frequency: 'Daily',
      nextDue: 'Today',
      icon: <Waves className="w-4 h-4 text-cyan-500" />,
    },
    {
      task: 'Brush walls & floor',
      frequency: 'Weekly',
      nextDue: 'In 3 days',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
    {
      task: 'Vacuum pool',
      frequency: 'Weekly',
      nextDue: 'In 3 days',
      icon: <Droplets className="w-4 h-4 text-blue-500" />,
    },
    {
      task: 'Shock treatment',
      frequency: 'Weekly or bi-weekly',
      nextDue: 'In 5 days',
      icon: <FlaskConical className="w-4 h-4 text-orange-500" />,
    },
    {
      task: 'Add algaecide',
      frequency: 'Weekly',
      nextDue: 'In 5 days',
      icon: <Droplets className="w-4 h-4 text-green-500" />,
    },
    {
      task: 'Test alkalinity & CYA',
      frequency: 'Weekly',
      nextDue: 'In 4 days',
      icon: <Beaker className="w-4 h-4 text-amber-500" />,
    },
    {
      task: 'Clean filter',
      frequency: 'Monthly',
      nextDue: 'In 2 weeks',
      icon: <Waves className="w-4 h-4 text-gray-500" />,
    },
  ];

  const getPhStatus = () => {
    const ph = parseFloat(chemicalLevels.currentPh);
    if (ph >= 7.2 && ph <= 7.6) return { status: 'Optimal', color: 'text-green-500' };
    if (ph >= 7.0 && ph <= 7.8) return { status: 'Acceptable', color: 'text-yellow-500' };
    return { status: 'Needs Adjustment', color: 'text-red-500' };
  };

  const getChlorineStatus = () => {
    const cl = parseFloat(chemicalLevels.currentChlorine);
    if (cl >= 1 && cl <= 3) return { status: 'Optimal', color: 'text-green-500' };
    if (cl >= 0.5 && cl <= 5) return { status: 'Acceptable', color: 'text-yellow-500' };
    return { status: 'Needs Adjustment', color: 'text-red-500' };
  };

  const shapes: { value: PoolShape; label: string }[] = [
    { value: 'rectangular', label: 'Rectangular' },
    { value: 'round', label: 'Round' },
    { value: 'oval', label: 'Oval' },
    { value: 'kidney', label: 'Kidney' },
    { value: 'freeform', label: 'Freeform' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Droplets className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolChemical.poolChemicalCalculator', 'Pool Chemical Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.calculateDosagesForCrystalClear', 'Calculate dosages for crystal clear water')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {[
          { id: 'volume', label: 'Pool Volume', icon: <Waves className="w-4 h-4" /> },
          { id: 'chemicals', label: 'Chemicals', icon: <Beaker className="w-4 h-4" /> },
          { id: 'schedule', label: 'Maintenance', icon: <Calendar className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? `text-cyan-500 border-b-2 border-cyan-500 ${isDark ? 'bg-gray-800/50' : 'bg-cyan-50/50'}`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* Volume Calculator Tab */}
        {activeTab === 'volume' && (
          <>
            {/* Pool Shape Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.poolChemical.poolShape', 'Pool Shape')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {shapes.map((shape) => (
                  <button
                    key={shape.value}
                    onClick={() => setPoolShape(shape.value)}
                    className={`py-2 px-3 rounded-lg text-sm ${
                      poolShape === shape.value
                        ? 'bg-cyan-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {shape.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions Input */}
            <div className="space-y-4">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.poolChemical.dimensionsFeet', 'Dimensions (feet)')}
              </label>

              {poolShape === 'round' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.diameter', 'Diameter')}</label>
                    <input
                      type="number"
                      value={dimensions.diameter}
                      onChange={(e) => setDimensions({ ...dimensions, diameter: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.averageDepth', 'Average Depth')}</label>
                    <input
                      type="number"
                      value={dimensions.depth}
                      onChange={(e) => setDimensions({ ...dimensions, depth: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.length', 'Length')}</label>
                    <input
                      type="number"
                      value={dimensions.length}
                      onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.width', 'Width')}</label>
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.avgDepth', 'Avg Depth')}</label>
                    <input
                      type="number"
                      value={dimensions.depth}
                      onChange={(e) => setDimensions({ ...dimensions, depth: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Volume Result */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolChemical.poolVolume', 'Pool Volume')}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVolumeUnit('gallons')}
                    className={`px-3 py-1 rounded text-sm ${
                      volumeUnit === 'gallons' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.poolChemical.gallons', 'Gallons')}
                  </button>
                  <button
                    onClick={() => setVolumeUnit('liters')}
                    className={`px-3 py-1 rounded text-sm ${
                      volumeUnit === 'liters' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t('tools.poolChemical.liters', 'Liters')}
                  </button>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-500">
                  {volumeUnit === 'gallons'
                    ? poolVolume.gallons.toLocaleString()
                    : poolVolume.liters.toLocaleString()}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {volumeUnit === 'gallons' ? 'gallons' : 'liters'}
                </div>
                <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {poolVolume.cubicFeet} cubic feet
                </div>
              </div>
            </div>

            {/* Quick Tip */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.poolChemical.tip', 'Tip:')}</strong> For average depth, add shallow end and deep end depths, then divide by 2.
                  For more accuracy, consider using multiple measurements.
                </div>
              </div>
            </div>
          </>
        )}

        {/* Chemicals Tab */}
        {activeTab === 'chemicals' && (
          <>
            {/* Current Levels Input */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolChemical.currentWaterChemistry', 'Current Water Chemistry')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.currentPh', 'Current pH')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={chemicalLevels.currentPh}
                    onChange={(e) => setChemicalLevels({ ...chemicalLevels, currentPh: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <span className={`text-xs ${getPhStatus().color}`}>{getPhStatus().status}</span>
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.targetPh', 'Target pH')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={chemicalLevels.targetPh}
                    onChange={(e) => setChemicalLevels({ ...chemicalLevels, targetPh: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.poolChemical.ideal7276', 'Ideal: 7.2-7.6')}</span>
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.currentChlorinePpm', 'Current Chlorine (ppm)')}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chemicalLevels.currentChlorine}
                    onChange={(e) => setChemicalLevels({ ...chemicalLevels, currentChlorine: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <span className={`text-xs ${getChlorineStatus().color}`}>{getChlorineStatus().status}</span>
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.targetChlorinePpm', 'Target Chlorine (ppm)')}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chemicalLevels.targetChlorine}
                    onChange={(e) => setChemicalLevels({ ...chemicalLevels, targetChlorine: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.poolChemical.ideal13Ppm', 'Ideal: 1-3 ppm')}</span>
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.alkalinityPpm', 'Alkalinity (ppm)')}</label>
                  <input
                    type="number"
                    value={chemicalLevels.currentAlkalinity}
                    onChange={(e) => setChemicalLevels({ ...chemicalLevels, currentAlkalinity: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.poolChemical.ideal80120Ppm', 'Ideal: 80-120 ppm')}</span>
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.poolChemical.cyaStabilizerPpm', 'CYA/Stabilizer (ppm)')}</label>
                  <input
                    type="number"
                    value={chemicalLevels.currentCya}
                    onChange={(e) => setChemicalLevels({ ...chemicalLevels, currentCya: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.poolChemical.ideal3050Ppm', 'Ideal: 30-50 ppm')}</span>
                </div>
              </div>
            </div>

            {/* Chemical Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ph', label: 'pH' },
                { id: 'chlorine', label: 'Chlorine' },
                { id: 'shock', label: 'Shock' },
                { id: 'algaecide', label: 'Algaecide' },
                { id: 'stabilizer', label: 'Stabilizer' },
              ].map((chem) => (
                <button
                  key={chem.id}
                  onClick={() => setSelectedChemical(chem.id as ChemicalType)}
                  className={`py-2 px-3 rounded-lg text-sm ${
                    selectedChemical === chem.id
                      ? 'bg-cyan-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {chem.label}
                </button>
              ))}
            </div>

            {/* Dosage Results */}
            {selectedChemical === 'ph' && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Beaker className="w-5 h-5 text-purple-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolChemical.phAdjustment', 'pH Adjustment')}</h4>
                </div>
                {chemicalDosages.ph.needed ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-500">
                        {chemicalDosages.ph.amount} {chemicalDosages.ph.unit}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {chemicalDosages.ph.chemical}
                      </div>
                    </div>
                    <div className={`p-3 rounded ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <span className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                          {t('tools.poolChemical.addChemicalsSlowlyAndRetest', 'Add chemicals slowly and retest after 4-6 hours before adding more.')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-green-500 font-medium">{t('tools.poolChemical.phIsWithinTargetRange', 'pH is within target range!')}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolChemical.noAdjustmentNeeded', 'No adjustment needed')}</div>
                  </div>
                )}
              </div>
            )}

            {selectedChemical === 'chlorine' && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="w-5 h-5 text-blue-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolChemical.chlorineDosage', 'Chlorine Dosage')}</h4>
                </div>
                {chemicalDosages.chlorine.needed ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-opacity-50" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}>
                      <div className="text-2xl font-bold text-blue-500">{chemicalDosages.chlorine.liquid} gal</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolChemical.liquidChlorine', 'Liquid Chlorine')}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>(12.5% sodium hypochlorite)</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-opacity-50" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}>
                      <div className="text-2xl font-bold text-blue-500">{chemicalDosages.chlorine.granular} lbs</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolChemical.granularChlorine', 'Granular Chlorine')}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>(65% calcium hypochlorite)</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-green-500 font-medium">{t('tools.poolChemical.chlorineLevelIsAdequate', 'Chlorine level is adequate!')}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolChemical.noAdjustmentNeeded2', 'No adjustment needed')}</div>
                  </div>
                )}
              </div>
            )}

            {selectedChemical === 'shock' && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolChemical.shockTreatment', 'Shock Treatment')}</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.1)' }}>
                    <div className="text-2xl font-bold text-orange-500">{chemicalDosages.shock.regular} lbs</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolChemical.regularShock', 'Regular Shock')}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.poolChemical.weeklyMaintenance', 'Weekly maintenance')}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                    <div className="text-2xl font-bold text-red-500">{chemicalDosages.shock.algae} lbs</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolChemical.algaeTreatment', 'Algae Treatment')}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.poolChemical.forGreenCloudyWater', 'For green/cloudy water')}</div>
                  </div>
                </div>
                <div className={`mt-3 p-3 rounded ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-orange-500 mt-0.5" />
                    <span className={`text-sm ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>
                      {t('tools.poolChemical.applyShockAtDuskKeep', 'Apply shock at dusk. Keep pump running and wait 8+ hours before swimming.')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedChemical === 'algaecide' && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="w-5 h-5 text-green-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolChemical.algaecideDosing', 'Algaecide Dosing')}</h4>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-green-500">{chemicalDosages.algaecide.weekly} oz</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolChemical.weeklyMaintenanceDose', 'Weekly Maintenance Dose')}</div>
                </div>
                <div className={`mt-3 p-3 rounded ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className={`text-sm ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      {t('tools.poolChemical.addAlgaecideAfterShockingOnce', 'Add algaecide after shocking, once chlorine levels return to normal. Pour around pool edges.')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedChemical === 'stabilizer' && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Beaker className="w-5 h-5 text-amber-500" />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolChemical.stabilizerAlkalinity', 'Stabilizer & Alkalinity')}</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
                    <div className="text-2xl font-bold text-amber-500">{chemicalDosages.stabilizer.amount} lbs</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolChemical.cyanuricAcid', 'Cyanuric Acid')}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {chemicalDosages.stabilizer.needed ? t('tools.poolChemical.addToReach40Ppm', 'Add to reach 40 ppm') : t('tools.poolChemical.levelIsAdequate', 'Level is adequate')}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
                    <div className="text-2xl font-bold text-amber-500">{chemicalDosages.alkalinity.amount} lbs</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.poolChemical.bakingSoda', 'Baking Soda')}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {chemicalDosages.alkalinity.needed ? t('tools.poolChemical.toRaiseAlkalinity', 'To raise alkalinity') : t('tools.poolChemical.levelIsAdequate2', 'Level is adequate')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pool Volume Reference */}
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'} text-center`}>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Calculations based on pool volume: <strong>{poolVolume.gallons.toLocaleString()} gallons</strong>
              </span>
            </div>
          </>
        )}

        {/* Maintenance Schedule Tab */}
        {activeTab === 'schedule' && (
          <>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.poolChemical.recommendedMaintenanceSchedule', 'Recommended Maintenance Schedule')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.poolChemical.keepYourPoolSparklingClean', 'Keep your pool sparkling clean with regular maintenance. Adjust frequency based on usage and weather.')}
              </p>
            </div>

            <div className="space-y-3">
              {maintenanceSchedule.map((task, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                      {task.icon}
                    </div>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.task}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{task.frequency}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    task.nextDue === 'Today'
                      ? 'text-red-500'
                      : task.nextDue.includes('3') || task.nextDue.includes('4') || task.nextDue.includes('5')
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}>
                    {task.nextDue}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.poolChemical.proTips', 'Pro Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Test water more frequently during heavy use or after storms</li>
                    <li>- Run pump 8-12 hours daily during swimming season</li>
                    <li>- Clean filter when pressure rises 8-10 PSI above clean</li>
                    <li>- Keep water level at mid-skimmer for optimal circulation</li>
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

export default PoolChemicalTool;
