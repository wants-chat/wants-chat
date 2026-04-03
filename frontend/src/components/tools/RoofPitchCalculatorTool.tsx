import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Calculator, Info, Ruler, ArrowUp, ArrowRight, TriangleRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface RoofPitchCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculationMode = 'rise-run' | 'angle' | 'percentage';

interface PitchResult {
  pitch: string;
  angle: number;
  percentage: number;
  rise: number;
  run: number;
  factor: number;
  description: string;
  roofType: string;
}

const COMMON_PITCHES = [
  { pitch: '1:12', angle: 4.76, description: 'Nearly flat' },
  { pitch: '2:12', angle: 9.46, description: 'Low slope (min for shingles)' },
  { pitch: '3:12', angle: 14.04, description: 'Low slope' },
  { pitch: '4:12', angle: 18.43, description: 'Standard low pitch' },
  { pitch: '5:12', angle: 22.62, description: 'Moderate pitch' },
  { pitch: '6:12', angle: 26.57, description: 'Standard pitch' },
  { pitch: '7:12', angle: 30.26, description: 'Common pitch' },
  { pitch: '8:12', angle: 33.69, description: 'Steep pitch' },
  { pitch: '9:12', angle: 36.87, description: 'Steep pitch' },
  { pitch: '10:12', angle: 39.81, description: 'Very steep' },
  { pitch: '12:12', angle: 45.00, description: 'Maximum walkable' },
];

export const RoofPitchCalculatorTool: React.FC<RoofPitchCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<CalculationMode>('rise-run');
  const [rise, setRise] = useState<string>('6');
  const [run, setRun] = useState<string>('12');
  const [angle, setAngle] = useState<string>('26.57');
  const [percentage, setPercentage] = useState<string>('50');

  const calculations = useMemo((): PitchResult => {
    let calcRise: number;
    let calcRun: number;
    let calcAngle: number;
    let calcPercentage: number;

    switch (mode) {
      case 'rise-run':
        calcRise = parseFloat(rise) || 0;
        calcRun = parseFloat(run) || 12;
        calcAngle = Math.atan(calcRise / calcRun) * (180 / Math.PI);
        calcPercentage = (calcRise / calcRun) * 100;
        break;
      case 'angle':
        calcAngle = parseFloat(angle) || 0;
        const angleRad = calcAngle * (Math.PI / 180);
        calcRise = Math.tan(angleRad) * 12;
        calcRun = 12;
        calcPercentage = Math.tan(angleRad) * 100;
        break;
      case 'percentage':
        calcPercentage = parseFloat(percentage) || 0;
        calcRise = (calcPercentage / 100) * 12;
        calcRun = 12;
        calcAngle = Math.atan(calcPercentage / 100) * (180 / Math.PI);
        break;
      default:
        calcRise = 6;
        calcRun = 12;
        calcAngle = 26.57;
        calcPercentage = 50;
    }

    // Calculate pitch factor (for area calculations)
    const factor = Math.sqrt(1 + Math.pow(calcRise / calcRun, 2));

    // Determine roof type based on angle
    let roofType: string;
    let description: string;
    if (calcAngle < 10) {
      roofType = 'Flat/Low Slope';
      description = 'Requires built-up or membrane roofing';
    } else if (calcAngle < 18.5) {
      roofType = 'Low Pitch';
      description = 'Minimum for asphalt shingles';
    } else if (calcAngle < 30) {
      roofType = 'Standard Pitch';
      description = 'Common residential, good for all roofing';
    } else if (calcAngle < 45) {
      roofType = 'Steep Pitch';
      description = 'Excellent drainage, harder to work on';
    } else {
      roofType = 'Very Steep';
      description = 'Specialty roofing required';
    }

    return {
      pitch: `${calcRise.toFixed(2)}:12`,
      angle: calcAngle,
      percentage: calcPercentage,
      rise: calcRise,
      run: calcRun,
      factor,
      description,
      roofType,
    };
  }, [mode, rise, run, angle, percentage]);

  const getModeLabel = (m: CalculationMode): string => {
    switch (m) {
      case 'rise-run': return 'Rise/Run';
      case 'angle': return 'Angle';
      case 'percentage': return 'Percentage';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Home className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roofPitchCalculator.roofPitchCalculator', 'Roof Pitch Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.roofPitchCalculator.calculateRoofPitchAngleAnd', 'Calculate roof pitch, angle, and slope')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Calculation Mode */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.roofPitchCalculator.calculateFrom', 'Calculate From')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['rise-run', 'angle', 'percentage'] as CalculationMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getModeLabel(m)}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields Based on Mode */}
        {mode === 'rise-run' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <ArrowUp className="w-4 h-4 inline mr-1" />
                {t('tools.roofPitchCalculator.riseInches', 'Rise (inches)')}
              </label>
              <input
                type="number"
                value={rise}
                onChange={(e) => setRise(e.target.value)}
                min="0"
                step="0.5"
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.roofPitchCalculator.verticalHeightPer12Of', 'Vertical height per 12" of run')}
              </p>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <ArrowRight className="w-4 h-4 inline mr-1" />
                {t('tools.roofPitchCalculator.runInches', 'Run (inches)')}
              </label>
              <input
                type="number"
                value={run}
                onChange={(e) => setRun(e.target.value)}
                min="1"
                step="1"
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.roofPitchCalculator.horizontalDistanceUsually12', 'Horizontal distance (usually 12)')}
              </p>
            </div>
          </div>
        )}

        {mode === 'angle' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <TriangleRight className="w-4 h-4 inline mr-1" />
              {t('tools.roofPitchCalculator.roofAngleDegrees', 'Roof Angle (degrees)')}
            </label>
            <input
              type="number"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              min="0"
              max="89"
              step="0.1"
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.roofPitchCalculator.angleFromHorizontal089', 'Angle from horizontal (0-89 degrees)')}
            </p>
          </div>
        )}

        {mode === 'percentage' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.roofPitchCalculator.slopePercentage', 'Slope Percentage (%)')}
            </label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              min="0"
              step="1"
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.roofPitchCalculator.riseAsAPercentageOf', 'Rise as a percentage of run')}
            </p>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofPitchCalculator.pitch', 'Pitch')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">{calculations.pitch}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofPitchCalculator.angle', 'Angle')}</div>
            <div className="text-2xl font-bold text-blue-500">{calculations.angle.toFixed(2)}°</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofPitchCalculator.slope', 'Slope %')}</div>
            <div className="text-2xl font-bold text-amber-500">{calculations.percentage.toFixed(1)}%</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.roofPitchCalculator.multiplier', 'Multiplier')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{calculations.factor.toFixed(4)}</div>
          </div>
        </div>

        {/* Roof Type Description */}
        <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-800' : t('tools.roofPitchCalculator.bg0d948810', 'bg-[#0D9488]/10')}`}>
          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.roofType}</div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{calculations.description}</p>
        </div>

        {/* Pitch Multiplier Explanation */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calculator className="w-4 h-4 inline mr-1" />
            {t('tools.roofPitchCalculator.roofAreaCalculation', 'Roof Area Calculation')}
          </h4>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Multiply footprint area by <strong>{calculations.factor.toFixed(4)}</strong> to get actual roof area.
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Example: 1,500 sq ft footprint × {calculations.factor.toFixed(4)} = {(1500 * calculations.factor).toFixed(0)} sq ft roof area
          </p>
        </div>

        {/* Common Pitch Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 inline mr-1" />
            {t('tools.roofPitchCalculator.commonRoofPitches', 'Common Roof Pitches')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMMON_PITCHES.map((p) => (
              <button
                key={p.pitch}
                onClick={() => {
                  setMode('rise-run');
                  setRise(p.pitch.split(':')[0]);
                  setRun('12');
                }}
                className={`p-2 rounded-lg text-left text-sm transition-colors ${
                  calculations.pitch === `${parseFloat(p.pitch.split(':')[0]).toFixed(2)}:12`
                    ? 'bg-[#0D9488] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">{p.pitch}</div>
                <div className={`text-xs ${calculations.pitch === `${parseFloat(p.pitch.split(':')[0]).toFixed(2)}:12` ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {p.angle.toFixed(1)}° - {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Roofing Material Guide */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.roofPitchCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.roofPitchCalculator.roofingMaterialByPitch', 'Roofing Material by Pitch')}</h4>
          <div className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div><strong>0:12 to 2:12:</strong> {t('tools.roofPitchCalculator.builtUpRubberMembraneMetal', 'Built-up, rubber membrane, metal')}</div>
            <div><strong>2:12 to 4:12:</strong> {t('tools.roofPitchCalculator.metalRubberSpecialtyShingles', 'Metal, rubber, specialty shingles')}</div>
            <div><strong>4:12 to 21:12:</strong> {t('tools.roofPitchCalculator.asphaltShinglesMetalTileSlate', 'Asphalt shingles, metal, tile, slate')}</div>
            <div><strong>{t('tools.roofPitchCalculator.above2112', 'Above 21:12:')}</strong> {t('tools.roofPitchCalculator.specialtyInstallationRequired', 'Specialty installation required')}</div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.roofPitchCalculator.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Measure from the bottom of the roof rafter, not the shingles</li>
                <li>- Use a level and tape measure for accurate rise/run</li>
                <li>- Most residential roofs are between 4:12 and 9:12</li>
                <li>- Steeper pitches shed water/snow better but cost more</li>
                <li>- Check local codes for minimum pitch requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoofPitchCalculatorTool;
