import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, ArrowUp, ArrowRight, CheckCircle, XCircle, Info, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type UnitSystem = 'imperial' | 'metric';

interface BuildingCode {
  name: string;
  minRiser: number; // in inches
  maxRiser: number;
  minTread: number;
  maxTread: number;
  minHeadroom: number; // in inches
  maxStairWidth: number;
  description: string;
}

interface StairCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const StairCalculatorTool: React.FC<StairCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [totalRise, setTotalRise] = useState('108'); // inches or cm
  const [totalRun, setTotalRun] = useState('120'); // inches or cm
  const [desiredSteps, setDesiredSteps] = useState('');
  const [floorThickness, setFloorThickness] = useState('10'); // for headroom calculation
  const [openingLength, setOpeningLength] = useState('120'); // stairwell opening
  const [codeType, setCodeType] = useState<'residential' | 'commercial'>('residential');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setTotalRise(params.numbers[0].toString());
        setTotalRun(params.numbers[1].toString());
        setIsPrefilled(true);
      } else if (params.height && params.length) {
        setTotalRise(params.height.toString());
        setTotalRun(params.length.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const buildingCodes: Record<'residential' | 'commercial', BuildingCode> = {
    residential: {
      name: 'Residential (IRC)',
      minRiser: 4,
      maxRiser: 7.75,
      minTread: 10,
      maxTread: 14,
      minHeadroom: 80, // 6'8"
      maxStairWidth: 44,
      description: 'IRC R311.7 - Single family homes',
    },
    commercial: {
      name: 'Commercial (IBC)',
      minRiser: 4,
      maxRiser: 7,
      minTread: 11,
      maxTread: 14,
      minHeadroom: 80,
      maxStairWidth: 44,
      description: 'IBC 1011 - Commercial buildings',
    },
  };

  const code = buildingCodes[codeType];

  // Conversion helpers
  const toInches = (value: number): number => {
    return unitSystem === 'metric' ? value / 2.54 : value;
  };

  const fromInches = (value: number): number => {
    return unitSystem === 'metric' ? value * 2.54 : value;
  };

  const formatUnit = (inches: number, precision: number = 2): string => {
    if (unitSystem === 'metric') {
      return `${(inches * 2.54).toFixed(precision)} cm`;
    }
    return `${inches.toFixed(precision)}"`;
  };

  const formatLargeUnit = (inches: number, precision: number = 2): string => {
    if (unitSystem === 'metric') {
      const cm = inches * 2.54;
      if (cm >= 100) {
        return `${(cm / 100).toFixed(precision)} m`;
      }
      return `${cm.toFixed(precision)} cm`;
    }
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    if (feet > 0) {
      return `${feet}' ${remainingInches.toFixed(1)}"`;
    }
    return `${inches.toFixed(precision)}"`;
  };

  const calculations = useMemo(() => {
    const riseInches = toInches(parseFloat(totalRise) || 0);
    const runInches = toInches(parseFloat(totalRun) || 0);
    const floorInches = toInches(parseFloat(floorThickness) || 0);
    const openingInches = toInches(parseFloat(openingLength) || 0);

    // Calculate optimal number of steps
    let numSteps: number;
    if (desiredSteps && parseFloat(desiredSteps) > 0) {
      numSteps = Math.round(parseFloat(desiredSteps));
    } else {
      // Target a 7" riser height for comfort
      numSteps = Math.round(riseInches / 7);
    }
    numSteps = Math.max(3, numSteps); // Minimum 3 steps

    // Calculate riser height and tread depth
    const riserHeight = riseInches / numSteps;
    const treadDepth = runInches / (numSteps - 1); // One less tread than risers

    // Calculate stringer length using Pythagorean theorem
    const stringerLength = Math.sqrt(riseInches * riseInches + runInches * runInches);

    // Calculate stair angle
    const stairAngle = Math.atan(riseInches / runInches) * (180 / Math.PI);

    // Calculate headroom at the lowest point of the opening
    // Headroom decreases as you go up the stairs under the opening
    const stepsUnderOpening = Math.floor(openingInches / treadDepth);
    const riseUnderOpening = stepsUnderOpening * riserHeight;
    const headroom = openingInches > 0 ? (riseInches - riseUnderOpening - floorInches) : 0;

    // 17" rule (riser + tread should equal 17-18" for comfort)
    const comfortRule = riserHeight + treadDepth;

    // 2R + T rule (2 * riser + tread should be 24-25" for safety)
    const safetyRule = 2 * riserHeight + treadDepth;

    // Code compliance checks
    const riserCompliant = riserHeight >= code.minRiser && riserHeight <= code.maxRiser;
    const treadCompliant = treadDepth >= code.minTread && treadDepth <= code.maxTread;
    const headroomCompliant = headroom >= code.minHeadroom || openingInches === 0;
    const comfortCompliant = comfortRule >= 17 && comfortRule <= 18;
    const safetyCompliant = safetyRule >= 24 && safetyRule <= 25;

    const allCompliant = riserCompliant && treadCompliant && headroomCompliant;

    return {
      numSteps,
      riserHeight,
      treadDepth,
      stringerLength,
      stairAngle,
      headroom,
      comfortRule,
      safetyRule,
      riserCompliant,
      treadCompliant,
      headroomCompliant,
      comfortCompliant,
      safetyCompliant,
      allCompliant,
    };
  }, [totalRise, totalRun, desiredSteps, floorThickness, openingLength, unitSystem, code]);

  const ComplianceIndicator = ({ compliant, label }: { compliant: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {compliant ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={`text-sm ${compliant ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Calculator className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.stairCalculator.stairCalculator', 'Stair Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.stairCalculator.calculateDimensionsWithBuildingCode', 'Calculate dimensions with building code compliance')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Unit System Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnitSystem('imperial')}
            className={`flex-1 py-2 rounded-lg ${unitSystem === 'imperial' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.stairCalculator.imperialInFt', 'Imperial (in/ft)')}
          </button>
          <button
            onClick={() => setUnitSystem('metric')}
            className={`flex-1 py-2 rounded-lg ${unitSystem === 'metric' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.stairCalculator.metricCmM', 'Metric (cm/m)')}
          </button>
        </div>

        {/* Building Code Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCodeType('residential')}
            className={`py-2 px-3 rounded-lg text-sm ${codeType === 'residential' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.stairCalculator.residentialIrc', 'Residential (IRC)')}
          </button>
          <button
            onClick={() => setCodeType('commercial')}
            className={`py-2 px-3 rounded-lg text-sm ${codeType === 'commercial' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.stairCalculator.commercialIbc', 'Commercial (IBC)')}
          </button>
        </div>

        {/* Code Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{code.name}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.stairCalculator.riser', 'Riser:')}</span> {formatUnit(code.minRiser, 1)} - {formatUnit(code.maxRiser, 1)}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.stairCalculator.tread', 'Tread:')}</span> {formatUnit(code.minTread, 0)} - {formatUnit(code.maxTread, 0)}
            </div>
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium">{t('tools.stairCalculator.minHeadroom', 'Min Headroom:')}</span> {formatLargeUnit(code.minHeadroom)}
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {code.description}
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <ArrowUp className="w-4 h-4 inline mr-1" />
                Total Rise ({unitSystem === 'metric' ? 'cm' : 'inches'})
              </label>
              <input
                type="number"
                value={totalRise}
                onChange={(e) => setTotalRise(e.target.value)}
                placeholder={unitSystem === 'metric' ? '274' : '108'}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.stairCalculator.floorToFloorHeight', 'Floor to floor height')}</p>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <ArrowRight className="w-4 h-4 inline mr-1" />
                Total Run ({unitSystem === 'metric' ? 'cm' : 'inches'})
              </label>
              <input
                type="number"
                value={totalRun}
                onChange={(e) => setTotalRun(e.target.value)}
                placeholder={unitSystem === 'metric' ? '305' : '120'}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.stairCalculator.horizontalDistance', 'Horizontal distance')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.stairCalculator.desiredNumberOfStepsOptional', 'Desired Number of Steps (optional)')}
            </label>
            <input
              type="number"
              value={desiredSteps}
              onChange={(e) => setDesiredSteps(e.target.value)}
              placeholder={t('tools.stairCalculator.autoCalculate', 'Auto-calculate')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Floor Thickness ({unitSystem === 'metric' ? 'cm' : 'inches'})
              </label>
              <input
                type="number"
                value={floorThickness}
                onChange={(e) => setFloorThickness(e.target.value)}
                placeholder={unitSystem === 'metric' ? '25' : '10'}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Opening Length ({unitSystem === 'metric' ? 'cm' : 'inches'})
              </label>
              <input
                type="number"
                value={openingLength}
                onChange={(e) => setOpeningLength(e.target.value)}
                placeholder={unitSystem === 'metric' ? '305' : '120'}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Main Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.stairCalculator.riserHeight', 'Riser Height')}</span>
            </div>
            <div className={`text-3xl font-bold ${calculations.riserCompliant ? 'text-blue-500' : 'text-red-500'}`}>
              {formatUnit(calculations.riserHeight)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.riserCompliant ? t('tools.stairCalculator.codeCompliant', 'Code compliant') : t('tools.stairCalculator.notCompliant', 'Not compliant')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.stairCalculator.treadDepth', 'Tread Depth')}</span>
            </div>
            <div className={`text-3xl font-bold ${calculations.treadCompliant ? 'text-green-500' : 'text-red-500'}`}>
              {formatUnit(calculations.treadDepth)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.treadCompliant ? t('tools.stairCalculator.codeCompliant2', 'Code compliant') : t('tools.stairCalculator.notCompliant2', 'Not compliant')}
            </div>
          </div>
        </div>

        {/* Secondary Results */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.stairCalculator.steps', 'Steps')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.numSteps}
            </div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.stairCalculator.stringer', 'Stringer')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatLargeUnit(calculations.stringerLength)}
            </div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.stairCalculator.angle', 'Angle')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.stairAngle.toFixed(1)}°
            </div>
          </div>
        </div>

        {/* Headroom */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.stairCalculator.headroom', 'Headroom')}</span>
            </div>
            <span className={`text-sm ${calculations.headroomCompliant ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
              Min: {formatLargeUnit(code.minHeadroom)}
            </span>
          </div>
          <div className={`text-3xl font-bold ${calculations.headroomCompliant ? 'text-purple-500' : 'text-red-500'}`}>
            {formatLargeUnit(calculations.headroom)}
          </div>
        </div>

        {/* Compliance Summary */}
        <div className={`p-4 rounded-lg ${calculations.allCompliant ? (isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200') : (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200')} border`}>
          <div className="flex items-center gap-2 mb-3">
            {calculations.allCompliant ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.allCompliant ? t('tools.stairCalculator.buildingCodeCompliant', 'Building Code Compliant') : t('tools.stairCalculator.codeComplianceIssues', 'Code Compliance Issues')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ComplianceIndicator compliant={calculations.riserCompliant} label="Riser height" />
            <ComplianceIndicator compliant={calculations.treadCompliant} label="Tread depth" />
            <ComplianceIndicator compliant={calculations.headroomCompliant} label="Headroom" />
            <ComplianceIndicator compliant={calculations.comfortCompliant} label="17&quot; rule (R+T)" />
          </div>
        </div>

        {/* Comfort Rules */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.stairCalculator.comfortGuidelines', 'Comfort Guidelines')}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.stairCalculator.rT1718Ideal', 'R + T (17-18" ideal)')}</span>
              <span className={`font-medium ${calculations.comfortCompliant ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-yellow-400' : 'text-yellow-600')}`}>
                {calculations.comfortRule.toFixed(1)}"
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>2R + T (24-25" ideal)</span>
              <span className={`font-medium ${calculations.safetyCompliant ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-yellow-400' : 'text-yellow-600')}`}>
                {calculations.safetyRule.toFixed(1)}"
              </span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.stairCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Ideal stair angle is 30-35 degrees for comfort</li>
                <li>• Always verify with local building codes</li>
                <li>• Add 1" to stringer for saw kerf allowance</li>
                <li>• Consider nosing overhang (typically 3/4" - 1 1/4")</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StairCalculatorTool;
