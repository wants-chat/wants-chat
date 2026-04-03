import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Sigma } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface QuadraticResult {
  a: number;
  b: number;
  c: number;
  discriminant: number;
  roots: { x1: string; x2: string } | null;
  rootType: 'two_real' | 'one_real' | 'complex';
  vertex: { x: number; y: number };
  yIntercept: number;
  axisOfSymmetry: number;
  equation: string;
}

interface QuadraticSolverToolProps {
  uiConfig?: UIConfig;
}

export default function QuadraticSolverTool({ uiConfig }: QuadraticSolverToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [result, setResult] = useState<QuadraticResult | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  const calculate = () => {
    const aVal = parseFloat(a);
    const bVal = parseFloat(b);
    const cVal = parseFloat(c);

    if (isNaN(aVal) || isNaN(bVal) || isNaN(cVal)) {
      setValidationMessage('Please enter valid numbers for all coefficients');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (aVal === 0) {
      setValidationMessage('Coefficient "a" cannot be zero for a quadratic equation');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const discriminant = bVal * bVal - 4 * aVal * cVal;
    let roots: { x1: string; x2: string } | null = null;
    let rootType: 'two_real' | 'one_real' | 'complex';

    if (discriminant > 0) {
      const x1 = (-bVal + Math.sqrt(discriminant)) / (2 * aVal);
      const x2 = (-bVal - Math.sqrt(discriminant)) / (2 * aVal);
      roots = { x1: formatNumber(x1), x2: formatNumber(x2) };
      rootType = 'two_real';
    } else if (discriminant === 0) {
      const x = -bVal / (2 * aVal);
      roots = { x1: formatNumber(x), x2: formatNumber(x) };
      rootType = 'one_real';
    } else {
      const realPart = -bVal / (2 * aVal);
      const imagPart = Math.sqrt(Math.abs(discriminant)) / (2 * aVal);
      roots = {
        x1: `${formatNumber(realPart)} + ${formatNumber(imagPart)}i`,
        x2: `${formatNumber(realPart)} - ${formatNumber(imagPart)}i`
      };
      rootType = 'complex';
    }

    const vertexX = -bVal / (2 * aVal);
    const vertexY = aVal * vertexX * vertexX + bVal * vertexX + cVal;

    // Build equation string
    let equation = '';
    if (aVal === 1) equation = 'x^2';
    else if (aVal === -1) equation = '-x^2';
    else equation = `${aVal}x^2`;

    if (bVal > 0) equation += ` + ${bVal === 1 ? '' : bVal}x`;
    else if (bVal < 0) equation += ` - ${bVal === -1 ? '' : Math.abs(bVal)}x`;

    if (cVal > 0) equation += ` + ${cVal}`;
    else if (cVal < 0) equation += ` - ${Math.abs(cVal)}`;

    equation += ' = 0';

    setResult({
      a: aVal,
      b: bVal,
      c: cVal,
      discriminant,
      roots,
      rootType,
      vertex: { x: vertexX, y: vertexY },
      yIntercept: cVal,
      axisOfSymmetry: vertexX,
      equation
    });
  };

  const reset = () => {
    setA('');
    setB('');
    setC('');
    setResult(null);
  };

  const getRootTypeLabel = (type: string): string => {
    switch (type) {
      case 'two_real': return 'Two distinct real roots';
      case 'one_real': return 'One repeated real root';
      case 'complex': return 'Two complex conjugate roots';
      default: return '';
    }
  };

  const getRootTypeColor = (type: string): string => {
    switch (type) {
      case 'two_real': return 'text-green-500';
      case 'one_real': return 'text-yellow-500';
      case 'complex': return 'text-purple-500';
      default: return '';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Sigma className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.quadraticSolver.quadraticEquationSolver', 'Quadratic Equation Solver')}
            </h1>
          </div>

          {/* Equation Display */}
          <div className={`text-center mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className={`text-xl font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ax<sup>2</sup> + bx + c = 0
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.quadraticSolver.aCoefficient', 'a (coefficient)')}
              </label>
              <input
                type="number"
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder="a"
                step="any"
                className={`w-full px-4 py-3 rounded-lg border text-center ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.quadraticSolver.bCoefficient', 'b (coefficient)')}
              </label>
              <input
                type="number"
                value={b}
                onChange={(e) => setB(e.target.value)}
                placeholder="b"
                step="any"
                className={`w-full px-4 py-3 rounded-lg border text-center ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.quadraticSolver.cConstant', 'c (constant)')}
              </label>
              <input
                type="number"
                value={c}
                onChange={(e) => setC(e.target.value)}
                placeholder="c"
                step="any"
                className={`w-full px-4 py-3 rounded-lg border text-center ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculate}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.quadraticSolver.solveEquation', 'Solve Equation')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.quadraticSolver.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.quadraticSolver.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="space-y-4">
                {/* Equation */}
                <div className="text-center">
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    {t('tools.quadraticSolver.equation', 'Equation')}
                  </div>
                  <div className={`text-xl font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {result.equation}
                  </div>
                </div>

                {/* Root Type */}
                <div className={`text-center ${getRootTypeColor(result.rootType)}`}>
                  {getRootTypeLabel(result.rootType)}
                </div>

                {/* Roots */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('tools.quadraticSolver.solutions', 'Solutions:')}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>x1 =</div>
                      <div className="text-2xl font-bold text-[#0D9488] font-mono">{result.roots?.x1}</div>
                    </div>
                    {result.rootType !== 'one_real' && (
                      <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>x2 =</div>
                        <div className="text-2xl font-bold text-[#0D9488] font-mono">{result.roots?.x2}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.quadraticSolver.discriminant', 'Discriminant:')}</span>
                      <span className={`ml-2 font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatNumber(result.discriminant)}
                      </span>
                    </div>
                    <div>
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.quadraticSolver.yIntercept', 'Y-Intercept:')}</span>
                      <span className={`ml-2 font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        (0, {formatNumber(result.yIntercept)})
                      </span>
                    </div>
                    <div>
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.quadraticSolver.vertex', 'Vertex:')}</span>
                      <span className={`ml-2 font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        ({formatNumber(result.vertex.x)}, {formatNumber(result.vertex.y)})
                      </span>
                    </div>
                    <div>
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.quadraticSolver.axisOfSymmetry', 'Axis of Symmetry:')}</span>
                      <span className={`ml-2 font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        x = {formatNumber(result.axisOfSymmetry)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quadratic Formula */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.quadraticSolver.quadraticFormula', 'Quadratic Formula')}
            </h3>
            <div className={`text-center font-mono text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              x = (-b +/- sqrt(b^2 - 4ac)) / 2a
            </div>
          </div>

          {/* Examples */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.quadraticSolver.examples', 'Examples')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>* x^2 - 5x + 6 = 0: x = 2, x = 3 (two real roots)</p>
              <p>* x^2 - 4x + 4 = 0: x = 2 (one repeated root)</p>
              <p>* x^2 + x + 1 = 0: x = -0.5 +/- 0.866i (complex roots)</p>
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
