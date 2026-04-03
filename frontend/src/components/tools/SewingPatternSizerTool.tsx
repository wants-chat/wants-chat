import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Scissors, Scale, Shirt, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type GarmentType = 'top' | 'dress' | 'pants' | 'skirt' | 'jacket' | 'coat';
type EaseType = 'fitted' | 'standard' | 'relaxed' | 'oversized';
type Unit = 'inches' | 'cm';

interface SizeChart {
  size: string;
  bust: number;
  waist: number;
  hip: number;
  shoulderWidth?: number;
  inseam?: number;
}

interface GarmentConfig {
  name: string;
  icon: string;
  baseYardage: number; // yards for size M at 45" fabric
  yardagePerSize: number; // additional yards per size up/down
  primaryMeasurements: string[];
  easeRange: { fitted: number; standard: number; relaxed: number; oversized: number };
}

interface SeamAllowance {
  name: string;
  inches: number;
  cm: number;
  use: string;
}

interface SewingPatternSizerToolProps {
  uiConfig?: UIConfig;
}

export const SewingPatternSizerTool: React.FC<SewingPatternSizerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [activeTab, setActiveTab] = useState<'size' | 'yardage' | 'seams' | 'grading'>('size');
  const [garmentType, setGarmentType] = useState<GarmentType>('top');
  const [easeType, setEaseType] = useState<EaseType>('standard');
  const [unit, setUnit] = useState<Unit>('inches');
  const [fabricWidth, setFabricWidth] = useState('45');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Body measurements
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [shoulderWidth, setShoulderWidth] = useState('');
  const [inseam, setInseam] = useState('');

  // Grading inputs
  const [fromSize, setFromSize] = useState('M');
  const [toSize, setToSize] = useState('L');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.bust) {
        setBust(String(params.bust));
        hasChanges = true;
      }
      if (params.waist) {
        setWaist(String(params.waist));
        hasChanges = true;
      }
      if (params.hip) {
        setHip(String(params.hip));
        hasChanges = true;
      }
      if (params.garmentType && ['top', 'dress', 'pants', 'skirt', 'jacket', 'coat'].includes(params.garmentType)) {
        setGarmentType(params.garmentType as GarmentType);
        hasChanges = true;
      }
      if (params.fabricWidth) {
        setFabricWidth(String(params.fabricWidth));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const sizeChart: SizeChart[] = [
    { size: 'XS', bust: 32, waist: 25, hip: 35, shoulderWidth: 14.5, inseam: 30 },
    { size: 'S', bust: 34, waist: 27, hip: 37, shoulderWidth: 15, inseam: 30.5 },
    { size: 'M', bust: 36, waist: 29, hip: 39, shoulderWidth: 15.5, inseam: 31 },
    { size: 'L', bust: 38, waist: 31, hip: 41, shoulderWidth: 16, inseam: 31.5 },
    { size: 'XL', bust: 40, waist: 33, hip: 43, shoulderWidth: 16.5, inseam: 32 },
    { size: '2XL', bust: 42, waist: 35, hip: 45, shoulderWidth: 17, inseam: 32 },
    { size: '3XL', bust: 44, waist: 37, hip: 47, shoulderWidth: 17.5, inseam: 32 },
  ];

  const garments: Record<GarmentType, GarmentConfig> = {
    top: {
      name: 'Top/Blouse',
      icon: '👚',
      baseYardage: 2,
      yardagePerSize: 0.25,
      primaryMeasurements: ['bust', 'waist', 'shoulderWidth'],
      easeRange: { fitted: 2, standard: 4, relaxed: 6, oversized: 10 },
    },
    dress: {
      name: 'Dress',
      icon: '👗',
      baseYardage: 3.5,
      yardagePerSize: 0.375,
      primaryMeasurements: ['bust', 'waist', 'hip'],
      easeRange: { fitted: 2, standard: 4, relaxed: 6, oversized: 10 },
    },
    pants: {
      name: 'Pants',
      icon: '👖',
      baseYardage: 2.5,
      yardagePerSize: 0.25,
      primaryMeasurements: ['waist', 'hip', 'inseam'],
      easeRange: { fitted: 1, standard: 2, relaxed: 4, oversized: 6 },
    },
    skirt: {
      name: 'Skirt',
      icon: '🩱',
      baseYardage: 1.5,
      yardagePerSize: 0.125,
      primaryMeasurements: ['waist', 'hip'],
      easeRange: { fitted: 1, standard: 2, relaxed: 4, oversized: 6 },
    },
    jacket: {
      name: 'Jacket',
      icon: '🧥',
      baseYardage: 3,
      yardagePerSize: 0.375,
      primaryMeasurements: ['bust', 'shoulderWidth'],
      easeRange: { fitted: 4, standard: 6, relaxed: 8, oversized: 12 },
    },
    coat: {
      name: 'Coat',
      icon: '🧥',
      baseYardage: 4,
      yardagePerSize: 0.5,
      primaryMeasurements: ['bust', 'shoulderWidth'],
      easeRange: { fitted: 6, standard: 8, relaxed: 10, oversized: 14 },
    },
  };

  const seamAllowances: SeamAllowance[] = [
    { name: 'Standard Seam', inches: 0.625, cm: 1.5, use: 'Most garment seams' },
    { name: 'French Seam', inches: 0.5, cm: 1.3, use: 'Sheer fabrics, unlined garments' },
    { name: 'Narrow Seam', inches: 0.25, cm: 0.6, use: 'Collars, facings, curves' },
    { name: 'Wide Seam', inches: 1, cm: 2.5, use: 'Side seams for alterations' },
    { name: 'Hem Allowance', inches: 1.5, cm: 3.8, use: 'Standard hems' },
    { name: 'Narrow Hem', inches: 0.5, cm: 1.3, use: 'Curved hems, lightweight fabrics' },
    { name: 'Deep Hem', inches: 2, cm: 5, use: 'Coats, structured garments' },
  ];

  const config = garments[garmentType];

  const convertToUnit = (inches: number): number => {
    return unit === 'cm' ? inches * 2.54 : inches;
  };

  const parseInput = (value: string): number => {
    const parsed = parseFloat(value) || 0;
    return unit === 'cm' ? parsed / 2.54 : parsed;
  };

  const recommendedSize = useMemo(() => {
    const bustVal = parseInput(bust);
    const waistVal = parseInput(waist);
    const hipVal = parseInput(hip);

    if (!bustVal && !waistVal && !hipVal) return null;

    const ease = config.easeRange[easeType];

    // Find best matching size based on garment type
    let bestSize = sizeChart[2]; // Default to M
    let minDiff = Infinity;

    for (const size of sizeChart) {
      let diff = 0;
      let count = 0;

      if (bustVal && config.primaryMeasurements.includes('bust')) {
        diff += Math.abs((size.bust + ease) - bustVal);
        count++;
      }
      if (waistVal && config.primaryMeasurements.includes('waist')) {
        const waistEase = garmentType === 'pants' || garmentType === 'skirt' ? ease : ease * 0.75;
        diff += Math.abs((size.waist + waistEase) - waistVal);
        count++;
      }
      if (hipVal && config.primaryMeasurements.includes('hip')) {
        diff += Math.abs((size.hip + ease) - hipVal);
        count++;
      }

      if (count > 0) {
        const avgDiff = diff / count;
        if (avgDiff < minDiff) {
          minDiff = avgDiff;
          bestSize = size;
        }
      }
    }

    return {
      size: bestSize,
      ease: ease,
      confidence: minDiff < 2 ? 'Excellent' : minDiff < 4 ? 'Good' : 'Consider adjustments',
    };
  }, [bust, waist, hip, garmentType, easeType, config, unit]);

  const yardageCalculation = useMemo(() => {
    const sizeIndex = sizeChart.findIndex((s) => s.size === (recommendedSize?.size.size || 'M'));
    const sizeOffset = sizeIndex - 2; // M is index 2
    const fabricWidthNum = parseFloat(fabricWidth) || 45;

    // Adjust yardage based on fabric width (45" is standard)
    const widthFactor = 45 / fabricWidthNum;
    const baseYards = config.baseYardage + (sizeOffset * config.yardagePerSize);
    const adjustedYards = baseYards * widthFactor;

    return {
      yards: adjustedYards.toFixed(2),
      meters: (adjustedYards * 0.9144).toFixed(2),
      withNap: (adjustedYards * 1.15).toFixed(2),
      withNapMeters: (adjustedYards * 0.9144 * 1.15).toFixed(2),
    };
  }, [recommendedSize, fabricWidth, config]);

  const gradingDifference = useMemo(() => {
    const from = sizeChart.find((s) => s.size === fromSize);
    const to = sizeChart.find((s) => s.size === toSize);

    if (!from || !to) return null;

    return {
      bust: convertToUnit(to.bust - from.bust),
      waist: convertToUnit(to.waist - from.waist),
      hip: convertToUnit(to.hip - from.hip),
      shoulderWidth: convertToUnit((to.shoulderWidth || 0) - (from.shoulderWidth || 0)),
    };
  }, [fromSize, toSize, unit]);

  const renderSizeTab = () => (
    <div className="space-y-6">
      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span className="text-sm text-pink-500 font-medium">Prefilled from AI response</span>
        </div>
      )}

      {/* Garment Type Selection */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(garments) as GarmentType[]).map((g) => (
          <button
            key={g}
            onClick={() => setGarmentType(g)}
            className={`py-2 px-3 rounded-lg text-sm ${garmentType === g ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <span className="mr-1">{garments[g].icon}</span>
            {garments[g].name}
          </button>
        ))}
      </div>

      {/* Ease Selection */}
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Ease Preference
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['fitted', 'standard', 'relaxed', 'oversized'] as EaseType[]).map((e) => (
            <button
              key={e}
              onClick={() => setEaseType(e)}
              className={`py-2 px-3 rounded-lg text-sm capitalize ${easeType === e ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {e}
            </button>
          ))}
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Ease adds {config.easeRange[easeType]}" ({(config.easeRange[easeType] * 2.54).toFixed(1)} cm) to body measurements
        </p>
      </div>

      {/* Unit Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setUnit('inches')}
          className={`flex-1 py-2 rounded-lg ${unit === 'inches' ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
        >
          Inches
        </button>
        <button
          onClick={() => setUnit('cm')}
          className={`flex-1 py-2 rounded-lg ${unit === 'cm' ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
        >
          Centimeters
        </button>
      </div>

      {/* Body Measurements */}
      <div className="space-y-4">
        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Your Measurements
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Bust ({unit})
            </label>
            <input
              type="number"
              value={bust}
              onChange={(e) => setBust(e.target.value)}
              placeholder={unit === 'inches' ? '36' : '91'}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Waist ({unit})
            </label>
            <input
              type="number"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder={unit === 'inches' ? '29' : '74'}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Hip ({unit})
            </label>
            <input
              type="number"
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              placeholder={unit === 'inches' ? '39' : '99'}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center justify-center gap-1 text-sm ${isDark ? 'text-pink-400' : 'text-pink-600'}`}
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            More measurements
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Shoulder Width ({unit})
              </label>
              <input
                type="number"
                value={shoulderWidth}
                onChange={(e) => setShoulderWidth(e.target.value)}
                placeholder={unit === 'inches' ? '15.5' : '39'}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Inseam ({unit})
              </label>
              <input
                type="number"
                value={inseam}
                onChange={(e) => setInseam(e.target.value)}
                placeholder={unit === 'inches' ? '31' : '79'}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Size Recommendation */}
      {recommendedSize && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Recommended Size</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${
              recommendedSize.confidence === 'Excellent'
                ? 'bg-green-500/20 text-green-500'
                : recommendedSize.confidence === 'Good'
                ? 'bg-yellow-500/20 text-yellow-500'
                : 'bg-orange-500/20 text-orange-500'
            }`}>
              {recommendedSize.confidence}
            </span>
          </div>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-pink-500">{recommendedSize.size.size}</div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              with {recommendedSize.ease}" ease for {easeType} fit
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className={`p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {convertToUnit(recommendedSize.size.bust).toFixed(1)}{unit === 'cm' ? ' cm' : '"'}
              </div>
              <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>Bust</div>
            </div>
            <div className={`p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {convertToUnit(recommendedSize.size.waist).toFixed(1)}{unit === 'cm' ? ' cm' : '"'}
              </div>
              <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>Waist</div>
            </div>
            <div className={`p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {convertToUnit(recommendedSize.size.hip).toFixed(1)}{unit === 'cm' ? ' cm' : '"'}
              </div>
              <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>Hip</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderYardageTab = () => (
    <div className="space-y-6">
      {/* Fabric Width Input */}
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Fabric Width (inches)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {['36', '45', '54', '60'].map((w) => (
            <button
              key={w}
              onClick={() => setFabricWidth(w)}
              className={`py-2 rounded-lg ${fabricWidth === w ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {w}"
            </button>
          ))}
        </div>
        <input
          type="number"
          value={fabricWidth}
          onChange={(e) => setFabricWidth(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        />
      </div>

      {/* Yardage Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="w-4 h-4 text-pink-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Without Nap</span>
          </div>
          <div className="text-3xl font-bold text-pink-500">{yardageCalculation.yards} yd</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {yardageCalculation.meters} meters
          </div>
        </div>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="w-4 h-4 text-purple-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>With Nap/Pattern</span>
          </div>
          <div className="text-3xl font-bold text-purple-500">{yardageCalculation.withNap} yd</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {yardageCalculation.withNapMeters} meters
          </div>
        </div>
      </div>

      {/* Info */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="flex items-start gap-2">
          <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>Yardage Tips:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Add 15% extra for directional prints or napped fabrics</li>
              <li>• Wider fabric requires less yardage</li>
              <li>• Always buy a little extra for matching or mistakes</li>
              <li>• Pre-wash fabric before cutting (may shrink 3-5%)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSeamsTab = () => (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border mb-4`}>
        <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Seam Allowance Reference Guide
        </h4>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Standard seam allowances vary by pattern brand. Always check your pattern instructions.
        </p>
      </div>

      <div className="space-y-3">
        {seamAllowances.map((seam) => (
          <div
            key={seam.name}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {seam.name}
              </span>
              <div className="flex gap-2">
                <span className="text-pink-500 font-bold">{seam.inches}"</span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>|</span>
                <span className="text-purple-500 font-bold">{seam.cm} cm</span>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {seam.use}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGradingTab = () => (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
        <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Pattern Grading Calculator
        </h4>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Calculate how much to add or subtract when grading between sizes.
        </p>
      </div>

      {/* Size Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            From Size
          </label>
          <select
            value={fromSize}
            onChange={(e) => setFromSize(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {sizeChart.map((s) => (
              <option key={s.size} value={s.size}>{s.size}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            To Size
          </label>
          <select
            value={toSize}
            onChange={(e) => setToSize(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {sizeChart.map((s) => (
              <option key={s.size} value={s.size}>{s.size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grading Results */}
      {gradingDifference && (
        <div className="space-y-4">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Adjustments Needed ({fromSize} to {toSize})
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Bust</div>
              <div className={`text-2xl font-bold ${gradingDifference.bust >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {gradingDifference.bust >= 0 ? '+' : ''}{gradingDifference.bust.toFixed(1)}{unit === 'cm' ? ' cm' : '"'}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Waist</div>
              <div className={`text-2xl font-bold ${gradingDifference.waist >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {gradingDifference.waist >= 0 ? '+' : ''}{gradingDifference.waist.toFixed(1)}{unit === 'cm' ? ' cm' : '"'}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Hip</div>
              <div className={`text-2xl font-bold ${gradingDifference.hip >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {gradingDifference.hip >= 0 ? '+' : ''}{gradingDifference.hip.toFixed(1)}{unit === 'cm' ? ' cm' : '"'}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Shoulder</div>
              <div className={`text-2xl font-bold ${gradingDifference.shoulderWidth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {gradingDifference.shoulderWidth >= 0 ? '+' : ''}{gradingDifference.shoulderWidth.toFixed(1)}{unit === 'cm' ? ' cm' : '"'}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="flex items-start gap-2">
              <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Grading Tips:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Divide adjustments evenly across seams</li>
                  <li>• Blend smoothly between grade points</li>
                  <li>• Keep shoulder points and armhole balance</li>
                  <li>• Make a muslin to test before cutting final fabric</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg"><Shirt className="w-5 h-5 text-pink-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sewingPatternSizer.sewingPatternSizer', 'Sewing Pattern Sizer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sewingPatternSizer.sizeRecommendationsYardageAndGrading', 'Size recommendations, yardage, and grading')}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'size', label: 'Size Finder', icon: Scale },
            { id: 'yardage', label: 'Yardage', icon: Ruler },
            { id: 'seams', label: 'Seam Allowance', icon: Scissors },
            { id: 'grading', label: 'Grading', icon: Shirt },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'size' && renderSizeTab()}
        {activeTab === 'yardage' && renderYardageTab()}
        {activeTab === 'seams' && renderSeamsTab()}
        {activeTab === 'grading' && renderGradingTab()}
      </div>
    </div>
  );
};

export default SewingPatternSizerTool;
