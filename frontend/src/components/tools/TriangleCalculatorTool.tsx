import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Triangle, Ruler } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type CalculationMode = 'threeSides' | 'baseHeight' | 'twoSidesAngle' | 'heroic';

interface TriangleResult {
  area: number;
  perimeter: number;
  semiperimeter: number;
  sides: { a: number; b: number; c: number };
  angles?: { A: number; B: number; C: number };
  height?: number;
  triangleType: string;
  formula: string;
  isValid: boolean;
}

interface TriangleCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function TriangleCalculatorTool({ uiConfig }: TriangleCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mode, setMode] = useState<CalculationMode>('threeSides');
  const [sideA, setSideA] = useState('');
  const [sideB, setSideB] = useState('');
  const [sideC, setSideC] = useState('');
  const [base, setBase] = useState('');
  const [height, setHeight] = useState('');
  const [angle, setAngle] = useState('');
  const [result, setResult] = useState<TriangleResult | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  const isValidTriangle = (a: number, b: number, c: number): boolean => {
    return a + b > c && b + c > a && a + c > b;
  };

  const getTriangleType = (a: number, b: number, c: number): string => {
    const sides = [a, b, c].sort((x, y) => x - y);
    const types: string[] = [];

    // By sides
    if (a === b && b === c) {
      types.push('Equilateral');
    } else if (a === b || b === c || a === c) {
      types.push('Isosceles');
    } else {
      types.push('Scalene');
    }

    // By angles
    const [s1, s2, s3] = sides;
    const c2 = s3 * s3;
    const ab2 = s1 * s1 + s2 * s2;

    if (Math.abs(c2 - ab2) < 0.0001) {
      types.push('Right');
    } else if (c2 > ab2) {
      types.push('Obtuse');
    } else {
      types.push('Acute');
    }

    return types.join(', ');
  };

  const calculateAngles = (a: number, b: number, c: number): { A: number; B: number; C: number } => {
    // Using law of cosines
    const A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * (180 / Math.PI);
    const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * (180 / Math.PI);
    const C = 180 - A - B;
    return { A, B, C };
  };

  const calculateThreeSides = () => {
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);

    if (isNaN(a) || isNaN(b) || isNaN(c) || a <= 0 || b <= 0 || c <= 0) {
      setValidationMessage('Please enter valid positive numbers for all sides');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (!isValidTriangle(a, b, c)) {
      setValidationMessage('These sides cannot form a valid triangle. The sum of any two sides must be greater than the third side.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const s = (a + b + c) / 2; // semi-perimeter
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c)); // Heron's formula
    const perimeter = a + b + c;
    const angles = calculateAngles(a, b, c);

    setResult({
      area,
      perimeter,
      semiperimeter: s,
      sides: { a, b, c },
      angles,
      triangleType: getTriangleType(a, b, c),
      formula: "Heron's Formula: A = sqrt(s(s-a)(s-b)(s-c))",
      isValid: true
    });
  };

  const calculateBaseHeight = () => {
    const b = parseFloat(base);
    const h = parseFloat(height);

    if (isNaN(b) || isNaN(h) || b <= 0 || h <= 0) {
      setValidationMessage('Please enter valid positive numbers for base and height');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const area = (b * h) / 2;

    setResult({
      area,
      perimeter: 0,
      semiperimeter: 0,
      sides: { a: 0, b, c: 0 },
      height: h,
      triangleType: 'Unknown (only base and height provided)',
      formula: 'A = (base x height) / 2',
      isValid: true
    });
  };

  const calculateTwoSidesAngle = () => {
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const angleC = parseFloat(angle);

    if (isNaN(a) || isNaN(b) || isNaN(angleC) || a <= 0 || b <= 0 || angleC <= 0 || angleC >= 180) {
      setValidationMessage('Please enter valid positive numbers. Angle must be between 0 and 180 degrees.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const angleRad = angleC * (Math.PI / 180);
    const area = (a * b * Math.sin(angleRad)) / 2;

    // Calculate third side using law of cosines
    const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(angleRad));
    const perimeter = a + b + c;
    const s = perimeter / 2;

    const angles = calculateAngles(a, b, c);

    setResult({
      area,
      perimeter,
      semiperimeter: s,
      sides: { a, b, c },
      angles,
      triangleType: getTriangleType(a, b, c),
      formula: 'A = (a x b x sin(C)) / 2',
      isValid: true
    });
  };

  const calculate = () => {
    switch (mode) {
      case 'threeSides':
        calculateThreeSides();
        break;
      case 'baseHeight':
        calculateBaseHeight();
        break;
      case 'twoSidesAngle':
        calculateTwoSidesAngle();
        break;
    }
  };

  const reset = () => {
    setSideA('');
    setSideB('');
    setSideC('');
    setBase('');
    setHeight('');
    setAngle('');
    setResult(null);
  };

  const switchMode = (newMode: CalculationMode) => {
    setMode(newMode);
    reset();
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Triangle className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.triangleCalculator.triangleCalculator', 'Triangle Calculator')}
            </h1>
          </div>

          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.triangleCalculator.calculateTheAreaPerimeterAnd', 'Calculate the area, perimeter, and angles of any triangle.')}
          </p>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.triangleCalculator.calculationMethod', 'Calculation Method')}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => switchMode('threeSides')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  mode === 'threeSides'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.triangleCalculator.threeSidesSss', 'Three Sides (SSS)')}
              </button>
              <button
                onClick={() => switchMode('baseHeight')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  mode === 'baseHeight'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.triangleCalculator.baseHeight2', 'Base & Height')}
              </button>
              <button
                onClick={() => switchMode('twoSidesAngle')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  mode === 'twoSidesAngle'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.triangleCalculator.twoSidesAngleSas', 'Two Sides & Angle (SAS)')}
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {mode === 'threeSides' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.triangleCalculator.sideA', 'Side a')}
                    </label>
                    <input
                      type="number"
                      value={sideA}
                      onChange={(e) => setSideA(e.target.value)}
                      placeholder="a"
                      step="any"
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.triangleCalculator.sideB', 'Side b')}
                    </label>
                    <input
                      type="number"
                      value={sideB}
                      onChange={(e) => setSideB(e.target.value)}
                      placeholder="b"
                      step="any"
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.triangleCalculator.sideC', 'Side c')}
                    </label>
                    <input
                      type="number"
                      value={sideC}
                      onChange={(e) => setSideC(e.target.value)}
                      placeholder="c"
                      step="any"
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'baseHeight' && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.triangleCalculator.base', 'Base')}
                  </label>
                  <input
                    type="number"
                    value={base}
                    onChange={(e) => setBase(e.target.value)}
                    placeholder={t('tools.triangleCalculator.enterBaseLength', 'Enter base length')}
                    step="any"
                    min="0"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.triangleCalculator.height', 'Height')}
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder={t('tools.triangleCalculator.enterHeight', 'Enter height')}
                    step="any"
                    min="0"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </>
            )}

            {mode === 'twoSidesAngle' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.triangleCalculator.sideA2', 'Side a')}
                    </label>
                    <input
                      type="number"
                      value={sideA}
                      onChange={(e) => setSideA(e.target.value)}
                      placeholder="a"
                      step="any"
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.triangleCalculator.sideB2', 'Side b')}
                    </label>
                    <input
                      type="number"
                      value={sideB}
                      onChange={(e) => setSideB(e.target.value)}
                      placeholder="b"
                      step="any"
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.triangleCalculator.includedAngleCDegrees', 'Included Angle C (degrees)')}
                  </label>
                  <input
                    type="number"
                    value={angle}
                    onChange={(e) => setAngle(e.target.value)}
                    placeholder={t('tools.triangleCalculator.angleBetweenSidesAAnd', 'Angle between sides a and b')}
                    step="any"
                    min="0"
                    max="180"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculate}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.triangleCalculator.calculate', 'Calculate')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.triangleCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.triangleCalculator.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="space-y-4">
                {/* Main Results */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.triangleCalculator.area', 'Area')}</div>
                    <div className="text-2xl font-bold text-[#0D9488] font-mono">{formatNumber(result.area)}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.triangleCalculator.squareUnits', 'square units')}</div>
                  </div>
                  {result.perimeter > 0 && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.triangleCalculator.perimeter', 'Perimeter')}</div>
                      <div className="text-2xl font-bold text-[#0D9488] font-mono">{formatNumber(result.perimeter)}</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>units</div>
                    </div>
                  )}
                </div>

                {/* Triangle Type */}
                <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.triangleCalculator.type', 'Type:')}</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    {result.triangleType}
                  </span>
                </div>

                {/* Sides */}
                {result.sides.a > 0 && result.sides.c > 0 && (
                  <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      {t('tools.triangleCalculator.sides', 'Sides:')}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                      <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        a = {formatNumber(result.sides.a)}
                      </div>
                      <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        b = {formatNumber(result.sides.b)}
                      </div>
                      <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        c = {formatNumber(result.sides.c)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Angles */}
                {result.angles && (
                  <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      {t('tools.triangleCalculator.angles', 'Angles:')}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                      <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        A = {formatNumber(result.angles.A)}deg
                      </div>
                      <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        B = {formatNumber(result.angles.B)}deg
                      </div>
                      <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        C = {formatNumber(result.angles.C)}deg
                      </div>
                    </div>
                  </div>
                )}

                {/* Formula Used */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Formula: {result.formula}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulas Reference */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.triangleCalculator.triangleFormulas', 'Triangle Formulas')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>* <strong>{t('tools.triangleCalculator.baseHeight', 'Base & Height:')}</strong> A = (base x height) / 2</p>
              <p>* <strong>{t('tools.triangleCalculator.heronSFormula', 'Heron\'s Formula:')}</strong> A = sqrt(s(s-a)(s-b)(s-c)), where s = (a+b+c)/2</p>
              <p>* <strong>{t('tools.triangleCalculator.sasFormula', 'SAS Formula:')}</strong> A = (a x b x sin(C)) / 2</p>
              <p>* <strong>{t('tools.triangleCalculator.perimeter2', 'Perimeter:')}</strong> P = a + b + c</p>
            </div>
          </div>

          {/* Triangle Types */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.triangleCalculator.triangleTypes', 'Triangle Types')}
            </h3>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
              <p><strong>{t('tools.triangleCalculator.bySides', 'By Sides:')}</strong> {t('tools.triangleCalculator.equilateralAllEqualIsoscelesTwo', 'Equilateral (all equal), Isosceles (two equal), Scalene (all different)')}</p>
              <p><strong>{t('tools.triangleCalculator.byAngles', 'By Angles:')}</strong> {t('tools.triangleCalculator.acuteAllLessThan90deg', 'Acute (all less than 90deg), Right (one 90deg), Obtuse (one greater than 90deg)')}</p>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
}
