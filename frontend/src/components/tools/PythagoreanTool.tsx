import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Triangle, Calculator, Ruler } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type SolveFor = 'hypotenuse' | 'leg';

interface PythagoreanResult {
  a: number;
  b: number;
  c: number;
  solveFor: SolveFor;
  formula: string;
  calculation: string;
  isValidTriangle: boolean;
}

interface PythagoreanToolProps {
  uiConfig?: UIConfig;
}

export default function PythagoreanTool({ uiConfig }: PythagoreanToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [solveFor, setSolveFor] = useState<SolveFor>('hypotenuse');
  const [sideA, setSideA] = useState('');
  const [sideB, setSideB] = useState('');
  const [hypotenuse, setHypotenuse] = useState('');
  const [result, setResult] = useState<PythagoreanResult | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  const calculateHypotenuse = () => {
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);

    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
      setValidationMessage('Please enter valid positive numbers for both legs');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const c = Math.sqrt(a * a + b * b);

    setResult({
      a,
      b,
      c,
      solveFor: 'hypotenuse',
      formula: 'c = sqrt(a^2 + b^2)',
      calculation: `c = sqrt(${a}^2 + ${b}^2) = sqrt(${a * a} + ${b * b}) = sqrt(${a * a + b * b}) = ${formatNumber(c)}`,
      isValidTriangle: true
    });
  };

  const calculateLeg = () => {
    const c = parseFloat(hypotenuse);
    const known = parseFloat(sideA);

    if (isNaN(c) || isNaN(known) || c <= 0 || known <= 0) {
      setValidationMessage('Please enter valid positive numbers');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (known >= c) {
      setValidationMessage('The leg must be shorter than the hypotenuse');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const unknown = Math.sqrt(c * c - known * known);

    setResult({
      a: known,
      b: unknown,
      c,
      solveFor: 'leg',
      formula: 'b = sqrt(c^2 - a^2)',
      calculation: `b = sqrt(${c}^2 - ${known}^2) = sqrt(${c * c} - ${known * known}) = sqrt(${c * c - known * known}) = ${formatNumber(unknown)}`,
      isValidTriangle: true
    });
  };

  const calculate = () => {
    if (solveFor === 'hypotenuse') {
      calculateHypotenuse();
    } else {
      calculateLeg();
    }
  };

  const reset = () => {
    setSideA('');
    setSideB('');
    setHypotenuse('');
    setResult(null);
  };

  const switchMode = (mode: SolveFor) => {
    setSolveFor(mode);
    reset();
  };

  // Common Pythagorean triples
  const triples = [
    { a: 3, b: 4, c: 5 },
    { a: 5, b: 12, c: 13 },
    { a: 8, b: 15, c: 17 },
    { a: 7, b: 24, c: 25 },
    { a: 9, b: 40, c: 41 },
    { a: 11, b: 60, c: 61 },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Triangle className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.pythagorean.pythagoreanTheoremCalculator', 'Pythagorean Theorem Calculator')}
            </h1>
          </div>

          {/* Theorem Display */}
          <div className={`text-center mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className={`text-xl font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup>
            </div>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.pythagorean.whereCIsTheHypotenuse', 'Where c is the hypotenuse (longest side) and a, b are the legs')}
            </p>
          </div>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.pythagorean.solveFor', 'Solve For')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => switchMode('hypotenuse')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  solveFor === 'hypotenuse'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.pythagorean.hypotenuseC2', 'Hypotenuse (c)')}
              </button>
              <button
                onClick={() => switchMode('leg')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  solveFor === 'leg'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.pythagorean.missingLegAOrB', 'Missing Leg (a or b)')}
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {solveFor === 'hypotenuse' ? (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pythagorean.legA2', 'Leg a')}
                  </label>
                  <input
                    type="number"
                    value={sideA}
                    onChange={(e) => setSideA(e.target.value)}
                    placeholder={t('tools.pythagorean.enterLengthOfLegA', 'Enter length of leg a')}
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
                    {t('tools.pythagorean.legB2', 'Leg b')}
                  </label>
                  <input
                    type="number"
                    value={sideB}
                    onChange={(e) => setSideB(e.target.value)}
                    placeholder={t('tools.pythagorean.enterLengthOfLegB', 'Enter length of leg b')}
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
            ) : (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.pythagorean.hypotenuseC3', 'Hypotenuse c')}
                  </label>
                  <input
                    type="number"
                    value={hypotenuse}
                    onChange={(e) => setHypotenuse(e.target.value)}
                    placeholder={t('tools.pythagorean.enterLengthOfHypotenuse', 'Enter length of hypotenuse')}
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
                    {t('tools.pythagorean.knownLeg', 'Known Leg')}
                  </label>
                  <input
                    type="number"
                    value={sideA}
                    onChange={(e) => setSideA(e.target.value)}
                    placeholder={t('tools.pythagorean.enterLengthOfKnownLeg', 'Enter length of known leg')}
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculate}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.pythagorean.calculate', 'Calculate')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.pythagorean.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.pythagorean.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="space-y-4">
                {/* Triangle Sides */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pythagorean.legA', 'Leg a')}</div>
                    <div className="text-xl font-bold text-[#0D9488] font-mono">{formatNumber(result.a)}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pythagorean.legB', 'Leg b')}</div>
                    <div className="text-xl font-bold text-[#0D9488] font-mono">{formatNumber(result.b)}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.pythagorean.hypotenuseC', 'Hypotenuse c')}</div>
                    <div className="text-xl font-bold text-[#0D9488] font-mono">{formatNumber(result.c)}</div>
                  </div>
                </div>

                {/* Calculation */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Formula: {result.formula}
                  </div>
                  <div className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} break-all`}>
                    {result.calculation}
                  </div>
                </div>

                {/* Verification */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('tools.pythagorean.verification', 'Verification:')}
                  </div>
                  <div className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatNumber(result.a)}^2 + {formatNumber(result.b)}^2 = {formatNumber(result.a * result.a)} + {formatNumber(result.b * result.b)} = {formatNumber(result.a * result.a + result.b * result.b)}
                    <br />
                    {formatNumber(result.c)}^2 = {formatNumber(result.c * result.c)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pythagorean Triples */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.pythagorean.commonPythagoreanTriples', 'Common Pythagorean Triples')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {triples.map((triple, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded text-center font-mono text-sm ${
                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-700'
                  }`}
                >
                  ({triple.a}, {triple.b}, {triple.c})
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.pythagorean.pythagoreanTheorem', 'Pythagorean Theorem')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              In a right-angled triangle, the square of the hypotenuse (the side opposite the right angle)
              is equal to the sum of the squares of the other two sides (legs).
              This relationship is expressed as a^2 + b^2 = c^2.
            </p>
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
