import React, { useState, useEffect } from 'react';
import { Calculator, Copy, Check, RefreshCw, Lightbulb, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type EquationType = 'linear' | 'quadratic' | 'system';

interface EquationSolverToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

export const EquationSolverTool: React.FC<EquationSolverToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [equationType, setEquationType] = useState<EquationType>('linear');

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.equationType) setEquationType(prefillData.params.equationType);
      if (prefillData.params.linearA) setLinearA(prefillData.params.linearA);
      if (prefillData.params.linearB) setLinearB(prefillData.params.linearB);
      if (prefillData.params.linearC) setLinearC(prefillData.params.linearC);
      setIsPrefilled(true);
    }
  }, [prefillData]);
  const [copied, setCopied] = useState(false);

  // Linear equation: ax + b = c
  const [linearA, setLinearA] = useState('2');
  const [linearB, setLinearB] = useState('5');
  const [linearC, setLinearC] = useState('15');

  // Quadratic equation: ax² + bx + c = 0
  const [quadA, setQuadA] = useState('1');
  const [quadB, setQuadB] = useState('-5');
  const [quadC, setQuadC] = useState('6');

  // System of equations: a1x + b1y = c1, a2x + b2y = c2
  const [sysA1, setSysA1] = useState('2');
  const [sysB1, setSysB1] = useState('3');
  const [sysC1, setSysC1] = useState('8');
  const [sysA2, setSysA2] = useState('1');
  const [sysB2, setSysB2] = useState('-1');
  const [sysC2, setSysC2] = useState('1');

  // Format number to max 4 decimal places, removing trailing zeros
  const formatNum = (num: number | string): string => {
    if (typeof num === 'string') return num;
    // Check if it's effectively an integer (within floating point tolerance)
    if (Math.abs(num - Math.round(num)) < 0.00001) {
      return Math.round(num).toString();
    }
    // Use toFixed to properly round and avoid floating point artifacts
    // Then convert back to number to remove trailing zeros
    return Number(num.toFixed(4)).toString();
  };

  const solveLinear = () => {
    const a = parseFloat(linearA);
    const b = parseFloat(linearB);
    const c = parseFloat(linearC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) return { error: 'Invalid input' };
    if (a === 0) return { error: 'Coefficient a cannot be zero' };

    const x = (c - b) / a;
    return { x, steps: [`${a}x + ${b} = ${c}`, `${a}x = ${c} - ${b}`, `${a}x = ${c - b}`, `x = ${c - b} / ${a}`, `x = ${formatNum(x)}`] };
  };

  const solveQuadratic = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) return { error: 'Invalid input' };
    if (a === 0) return { error: 'Coefficient a cannot be zero (use linear equation)' };

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      return {
        type: 'complex',
        x1: `${formatNum(realPart)} + ${formatNum(imagPart)}i`,
        x2: `${formatNum(realPart)} - ${formatNum(imagPart)}i`,
        discriminant,
        steps: [`Discriminant = b² - 4ac = ${discriminant}`, 'Discriminant < 0, complex roots']
      };
    } else if (discriminant === 0) {
      const x = -b / (2 * a);
      return {
        type: 'repeated',
        x1: x,
        x2: x,
        discriminant,
        steps: [`Discriminant = b² - 4ac = ${discriminant}`, 'Discriminant = 0, one repeated root', `x = -b / 2a = ${formatNum(x)}`]
      };
    } else {
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      return {
        type: 'real',
        x1,
        x2,
        discriminant,
        steps: [`Discriminant = b² - 4ac = ${discriminant}`, 'Discriminant > 0, two real roots', `x₁ = (-b + √Δ) / 2a = ${formatNum(x1)}`, `x₂ = (-b - √Δ) / 2a = ${formatNum(x2)}`]
      };
    }
  };

  const solveSystem = () => {
    const a1 = parseFloat(sysA1);
    const b1 = parseFloat(sysB1);
    const c1 = parseFloat(sysC1);
    const a2 = parseFloat(sysA2);
    const b2 = parseFloat(sysB2);
    const c2 = parseFloat(sysC2);

    if ([a1, b1, c1, a2, b2, c2].some(isNaN)) return { error: 'Invalid input' };

    const det = a1 * b2 - a2 * b1;

    if (det === 0) {
      return { error: 'No unique solution (parallel lines or same line)' };
    }

    const x = (c1 * b2 - c2 * b1) / det;
    const y = (a1 * c2 - a2 * c1) / det;

    return {
      x,
      y,
      steps: [
        `Determinant = ${a1}×${b2} - ${a2}×${b1} = ${det}`,
        `x = (${c1}×${b2} - ${c2}×${b1}) / ${det} = ${formatNum(x)}`,
        `y = (${a1}×${c2} - ${a2}×${c1}) / ${det} = ${formatNum(y)}`
      ]
    };
  };

  const getSolution = () => {
    switch (equationType) {
      case 'linear': return solveLinear();
      case 'quadratic': return solveQuadratic();
      case 'system': return solveSystem();
    }
  };

  const solution = getSolution();

  const handleCopy = () => {
    let text = '';
    if ('error' in solution) {
      text = solution.error;
    } else if (equationType === 'linear') {
      text = `x = ${formatNum((solution as any).x)}`;
    } else if (equationType === 'quadratic') {
      text = `x₁ = ${formatNum((solution as any).x1)}, x₂ = ${formatNum((solution as any).x2)}`;
    } else {
      text = `x = ${formatNum((solution as any).x)}, y = ${formatNum((solution as any).y)}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const examples = {
    linear: [
      { a: '3', b: '7', c: '22', label: '3x + 7 = 22' },
      { a: '5', b: '-3', c: '12', label: '5x - 3 = 12' },
    ],
    quadratic: [
      { a: '1', b: '-5', c: '6', label: 'x² - 5x + 6 = 0' },
      { a: '2', b: '4', c: '-6', label: '2x² + 4x - 6 = 0' },
    ],
    system: [
      { a1: '2', b1: '3', c1: '8', a2: '1', b2: '-1', c2: '1', label: '2x + 3y = 8, x - y = 1' },
    ],
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Calculator className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.equationSolver.equationSolver', 'Equation Solver')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.equationSolver.solveLinearQuadraticAndSystem', 'Solve linear, quadratic, and system equations')}</p>
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{t('tools.equationSolver.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Equation Type Selector */}
        <div className="flex gap-2">
          {[
            { value: 'linear', label: 'Linear (ax + b = c)' },
            { value: 'quadratic', label: 'Quadratic (ax² + bx + c = 0)' },
            { value: 'system', label: 'System (2 equations)' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setEquationType(type.value as EquationType)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                equationType === type.value
                  ? 'bg-emerald-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Input Fields */}
        {equationType === 'linear' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
              <span className={`text-xl font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {linearA}x + {linearB} = {linearC}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>a (coefficient)</label>
                <input
                  type="number"
                  value={linearA}
                  onChange={(e) => setLinearA(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>b (constant)</label>
                <input
                  type="number"
                  value={linearB}
                  onChange={(e) => setLinearB(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>c (result)</label>
                <input
                  type="number"
                  value={linearC}
                  onChange={(e) => setLinearC(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>
          </div>
        )}

        {equationType === 'quadratic' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
              <span className={`text-xl font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {quadA}x² + {quadB}x + {quadC} = 0
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>a (x² coefficient)</label>
                <input
                  type="number"
                  value={quadA}
                  onChange={(e) => setQuadA(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>b (x coefficient)</label>
                <input
                  type="number"
                  value={quadB}
                  onChange={(e) => setQuadB(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>c (constant)</label>
                <input
                  type="number"
                  value={quadC}
                  onChange={(e) => setQuadC(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>
          </div>
        )}

        {equationType === 'system' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center space-y-1`}>
              <div className={`text-lg font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {sysA1}x + {sysB1}y = {sysC1}
              </div>
              <div className={`text-lg font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {sysA2}x + {sysB2}y = {sysC2}
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <input type="number" value={sysA1} onChange={(e) => setSysA1(e.target.value)} placeholder="a1" className={`px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                <input type="number" value={sysB1} onChange={(e) => setSysB1(e.target.value)} placeholder="b1" className={`px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                <input type="number" value={sysC1} onChange={(e) => setSysC1(e.target.value)} placeholder="c1" className={`px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input type="number" value={sysA2} onChange={(e) => setSysA2(e.target.value)} placeholder="a2" className={`px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                <input type="number" value={sysB2} onChange={(e) => setSysB2(e.target.value)} placeholder="b2" className={`px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                <input type="number" value={sysC2} onChange={(e) => setSysC2(e.target.value)} placeholder="c2" className={`px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Solution Display */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-emerald-500" />
              <span className={`font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{t('tools.equationSolver.solution', 'Solution')}</span>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.equationSolver.copied', 'Copied!') : t('tools.equationSolver.copy', 'Copy')}
            </button>
          </div>

          {'error' in solution ? (
            <div className="text-red-500 text-lg">{solution.error}</div>
          ) : (
            <div className="space-y-4">
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {equationType === 'linear' && `x = ${formatNum((solution as any).x)}`}
                {equationType === 'quadratic' && (
                  <div className="space-y-1">
                    <div>x₁ = {formatNum((solution as any).x1)}</div>
                    <div>x₂ = {formatNum((solution as any).x2)}</div>
                  </div>
                )}
                {equationType === 'system' && (
                  <div className="space-y-1">
                    <div>x = {formatNum((solution as any).x)}</div>
                    <div>y = {formatNum((solution as any).y)}</div>
                  </div>
                )}
              </div>

              {(solution as any).steps && (
                <div className="space-y-1 pt-4 border-t border-emerald-200 dark:border-emerald-800">
                  <div className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{t('tools.equationSolver.steps', 'Steps:')}</div>
                  {(solution as any).steps.map((step: string, idx: number) => (
                    <div key={idx} className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {idx + 1}. {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.equationSolver.tip', 'Tip:')}</strong> Quadratic equations use the quadratic formula. System of equations uses Cramer's rule.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EquationSolverTool;
