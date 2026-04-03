import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Divide, Plus, Minus, X, ArrowRightLeft, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FractionCalculatorToolProps {
  uiConfig?: UIConfig;
}

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

interface Fraction {
  numerator: number;
  denominator: number;
}

// Helper function to find GCD (Greatest Common Divisor)
const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

// Helper function to find LCM (Least Common Multiple)
const lcm = (a: number, b: number): number => {
  return Math.abs(a * b) / gcd(a, b);
};

// Simplify a fraction
const simplifyFraction = (num: number, den: number): Fraction => {
  if (den === 0) return { numerator: 0, denominator: 1 };
  const divisor = gcd(num, den);
  let newNum = num / divisor;
  let newDen = den / divisor;
  // Keep denominator positive
  if (newDen < 0) {
    newNum = -newNum;
    newDen = -newDen;
  }
  return { numerator: newNum, denominator: newDen };
};

// Convert to mixed number
const toMixedNumber = (num: number, den: number): { whole: number; numerator: number; denominator: number } => {
  if (den === 0) return { whole: 0, numerator: 0, denominator: 1 };
  const simplified = simplifyFraction(num, den);
  const whole = Math.floor(Math.abs(simplified.numerator) / simplified.denominator);
  const remainder = Math.abs(simplified.numerator) % simplified.denominator;
  const sign = simplified.numerator < 0 ? -1 : 1;
  return {
    whole: sign * whole,
    numerator: remainder,
    denominator: simplified.denominator,
  };
};

export const FractionCalculatorTool: React.FC<FractionCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.numerator1) setNum1(String(data.numerator1));
      if (data.denominator1) setDen1(String(data.denominator1));
      if (data.numerator2) setNum2(String(data.numerator2));
      if (data.denominator2) setDen2(String(data.denominator2));
      if (data.operation) setOperation(data.operation as Operation);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Fraction 1
  const [num1, setNum1] = useState('1');
  const [den1, setDen1] = useState('2');

  // Fraction 2
  const [num2, setNum2] = useState('1');
  const [den2, setDen2] = useState('4');

  // Operation
  const [operation, setOperation] = useState<Operation>('add');

  const operations: { key: Operation; label: string; icon: React.ReactNode }[] = [
    { key: 'add', label: 'Add', icon: <Plus className="w-4 h-4" /> },
    { key: 'subtract', label: 'Subtract', icon: <Minus className="w-4 h-4" /> },
    { key: 'multiply', label: 'Multiply', icon: <X className="w-4 h-4" /> },
    { key: 'divide', label: 'Divide', icon: <Divide className="w-4 h-4" /> },
  ];

  const result = useMemo(() => {
    const n1 = parseInt(num1) || 0;
    const d1 = parseInt(den1) || 1;
    const n2 = parseInt(num2) || 0;
    const d2 = parseInt(den2) || 1;

    if (d1 === 0 || d2 === 0) {
      return null;
    }

    let resultNum: number;
    let resultDen: number;

    switch (operation) {
      case 'add':
        // a/b + c/d = (ad + bc) / bd
        resultNum = n1 * d2 + n2 * d1;
        resultDen = d1 * d2;
        break;
      case 'subtract':
        // a/b - c/d = (ad - bc) / bd
        resultNum = n1 * d2 - n2 * d1;
        resultDen = d1 * d2;
        break;
      case 'multiply':
        // a/b * c/d = ac / bd
        resultNum = n1 * n2;
        resultDen = d1 * d2;
        break;
      case 'divide':
        // a/b / c/d = ad / bc
        if (n2 === 0) {
          return null; // Division by zero
        }
        resultNum = n1 * d2;
        resultDen = d1 * n2;
        break;
      default:
        resultNum = 0;
        resultDen = 1;
    }

    const simplified = simplifyFraction(resultNum, resultDen);
    const mixed = toMixedNumber(resultNum, resultDen);
    const decimal = resultDen !== 0 ? simplified.numerator / simplified.denominator : 0;

    return {
      original: { numerator: resultNum, denominator: resultDen },
      simplified,
      mixed,
      decimal: decimal.toFixed(6).replace(/\.?0+$/, ''),
    };
  }, [num1, den1, num2, den2, operation]);

  // Visual representation of a fraction
  const FractionVisual: React.FC<{ numerator: number; denominator: number; size?: 'sm' | 'lg' }> = ({
    numerator,
    denominator,
    size = 'sm'
  }) => {
    const absNum = Math.abs(numerator);
    const absDen = Math.abs(denominator);
    const isNegative = numerator < 0;
    const fillCount = Math.min(absNum, absDen);
    const totalSquares = Math.min(absDen, 12); // Limit to 12 squares for display
    const squareSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

    if (absDen === 0 || absDen > 12) return null;

    return (
      <div className="flex items-center gap-1">
        {isNegative && <span className={isDark ? 'text-red-400' : 'text-red-600'}>-</span>}
        <div className="flex flex-wrap gap-0.5" style={{ maxWidth: size === 'lg' ? t('tools.fractionCalculator.168px', '168px') : t('tools.fractionCalculator.112px', '112px') }}>
          {Array.from({ length: totalSquares }).map((_, i) => (
            <div
              key={i}
              className={`${squareSize} rounded-sm border ${
                i < fillCount
                  ? 'bg-indigo-500 border-indigo-600'
                  : isDark
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-200 border-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Fraction display component
  const FractionDisplay: React.FC<{
    numerator: number | string;
    denominator: number | string;
    className?: string;
    showVisual?: boolean;
  }> = ({ numerator, denominator, className = '', showVisual = false }) => (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {numerator}
      </span>
      <div className={`w-full h-0.5 ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`} />
      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {denominator}
      </span>
      {showVisual && typeof numerator === 'number' && typeof denominator === 'number' && (
        <div className="mt-2">
          <FractionVisual numerator={numerator} denominator={denominator} />
        </div>
      )}
    </div>
  );

  const getOperationSymbol = () => {
    switch (operation) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '\u00D7';
      case 'divide': return '\u00F7';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg"><Calculator className="w-5 h-5 text-indigo-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fractionCalculator.fractionCalculator', 'Fraction Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.fractionCalculator.addSubtractMultiplyDivideFractions', 'Add, subtract, multiply, divide fractions')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Operation Selection */}
        <div className="grid grid-cols-4 gap-2">
          {operations.map((op) => (
            <button
              key={op.key}
              onClick={() => setOperation(op.key)}
              className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 ${
                operation === op.key
                  ? 'bg-indigo-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {op.icon}
              <span className="hidden sm:inline">{op.label}</span>
            </button>
          ))}
        </div>

        {/* Fraction Inputs */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Fraction 1 */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <label className={`block text-sm font-medium mb-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('tools.fractionCalculator.firstFraction', 'First Fraction')}
            </label>
            <div className="flex flex-col items-center gap-1">
              <input
                type="number"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                placeholder={t('tools.fractionCalculator.numerator', 'Numerator')}
                className={`w-20 px-3 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <div className={`w-16 h-0.5 ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`} />
              <input
                type="number"
                value={den1}
                onChange={(e) => setDen1(e.target.value)}
                placeholder={t('tools.fractionCalculator.denominator', 'Denominator')}
                className={`w-20 px-3 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          {/* Operation Symbol */}
          <div className={`text-3xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {getOperationSymbol()}
          </div>

          {/* Fraction 2 */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <label className={`block text-sm font-medium mb-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('tools.fractionCalculator.secondFraction', 'Second Fraction')}
            </label>
            <div className="flex flex-col items-center gap-1">
              <input
                type="number"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                placeholder={t('tools.fractionCalculator.numerator2', 'Numerator')}
                className={`w-20 px-3 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <div className={`w-16 h-0.5 ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`} />
              <input
                type="number"
                value={den2}
                onChange={(e) => setDen2(e.target.value)}
                placeholder={t('tools.fractionCalculator.denominator2', 'Denominator')}
                className={`w-20 px-3 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Visual Representation of Input Fractions */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.fractionCalculator.visualRepresentation', 'Visual Representation')}
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center">
              <FractionVisual numerator={parseInt(num1) || 0} denominator={parseInt(den1) || 1} size="lg" />
              <span className={`text-xs mt-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {num1}/{den1}
              </span>
            </div>
            <span className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{getOperationSymbol()}</span>
            <div className="text-center">
              <FractionVisual numerator={parseInt(num2) || 0} denominator={parseInt(den2) || 1} size="lg" />
              <span className={`text-xs mt-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {num2}/{den2}
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="space-y-4">
            {/* Equation Display */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <FractionDisplay numerator={num1} denominator={den1} />
                <span className={`text-xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {getOperationSymbol()}
                </span>
                <FractionDisplay numerator={num2} denominator={den2} />
                <span className={`text-xl font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>=</span>
                <FractionDisplay
                  numerator={result.simplified.numerator}
                  denominator={result.simplified.denominator}
                  className="text-indigo-500"
                />
              </div>
            </div>

            {/* Result Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Simplified Result */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fractionCalculator.simplified', 'Simplified')}</span>
                </div>
                <div className="text-3xl font-bold text-indigo-500">
                  {result.simplified.denominator === 1
                    ? result.simplified.numerator
                    : `${result.simplified.numerator}/${result.simplified.denominator}`}
                </div>
                {result.original.numerator !== result.simplified.numerator && (
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    from {result.original.numerator}/{result.original.denominator}
                  </div>
                )}
              </div>

              {/* Decimal */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-green-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fractionCalculator.decimal', 'Decimal')}</span>
                </div>
                <div className="text-3xl font-bold text-green-500">
                  {result.decimal}
                </div>
              </div>
            </div>

            {/* Mixed Number */}
            {Math.abs(result.simplified.numerator) >= result.simplified.denominator && result.simplified.denominator !== 1 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Divide className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.fractionCalculator.mixedNumber', 'Mixed Number')}</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  {result.mixed.whole !== 0 && (
                    <span>{result.mixed.whole}</span>
                  )}
                  {result.mixed.numerator !== 0 && (
                    <span className="ml-1">
                      {result.mixed.numerator}/{result.mixed.denominator}
                    </span>
                  )}
                  {result.mixed.whole === 0 && result.mixed.numerator === 0 && (
                    <span>0</span>
                  )}
                </div>
              </div>
            )}

            {/* Visual Result */}
            {result.simplified.denominator <= 12 && result.simplified.denominator > 1 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.fractionCalculator.resultVisualization', 'Result Visualization')}
                </div>
                <div className="flex justify-center">
                  <FractionVisual
                    numerator={result.simplified.numerator}
                    denominator={result.simplified.denominator}
                    size="lg"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
            <span className={isDark ? 'text-red-400' : 'text-red-600'}>
              {t('tools.fractionCalculator.invalidInputPleaseCheckYour', 'Invalid input. Please check your fractions (denominator cannot be zero).')}
            </span>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.fractionCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.fractionCalculator.enterNegativeNumbersForThe', 'Enter negative numbers for the numerator to work with negative fractions')}</li>
                <li>{t('tools.fractionCalculator.resultsAreAutomaticallySimplifiedTo', 'Results are automatically simplified to lowest terms')}</li>
                <li>{t('tools.fractionCalculator.mixedNumbersShowWhenThe', 'Mixed numbers show when the numerator is larger than the denominator')}</li>
                <li>{t('tools.fractionCalculator.visualSquaresRepresentPartsOf', 'Visual squares represent parts of a whole (limited to 12 parts)')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FractionCalculatorTool;
