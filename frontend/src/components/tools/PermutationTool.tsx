import React, { useState, useEffect, useMemo } from 'react';
import { Shuffle, Info, Copy, Check, Sparkles, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PermutationToolProps {
  uiConfig?: UIConfig;
}

type CalculationType = 'nPr' | 'factorial' | 'withRepetition';

const PermutationTool: React.FC<PermutationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [n, setN] = useState<string>('5');
  const [r, setR] = useState<string>('3');
  const [calculationType, setCalculationType] = useState<CalculationType>('nPr');
  const [copied, setCopied] = useState<string>('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.amount !== undefined) {
        setN(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent) {
        // Try to extract n and r pattern like "5P3" or "5, 3" or "n=5, r=3"
        const permMatch = textContent.match(/(\d+)\s*[Pp]\s*(\d+)/);
        const commaMatch = textContent.match(/(\d+)\s*[,\s]+(\d+)/);
        const nrMatch = textContent.match(/n\s*=\s*(\d+).*r\s*=\s*(\d+)/i);

        if (permMatch) {
          setN(permMatch[1]);
          setR(permMatch[2]);
          setIsPrefilled(true);
        } else if (nrMatch) {
          setN(nrMatch[1]);
          setR(nrMatch[2]);
          setIsPrefilled(true);
        } else if (commaMatch) {
          setN(commaMatch[1]);
          setR(commaMatch[2]);
          setIsPrefilled(true);
        } else if (!params.amount) {
          const numMatch = textContent.match(/\d+/);
          if (numMatch) {
            setN(numMatch[0]);
            setIsPrefilled(true);
          }
        }
      }
    }
  }, [uiConfig?.params]);

  // Factorial function with BigInt for large numbers
  const factorial = (num: number): bigint => {
    if (num < 0) return BigInt(-1);
    if (num === 0 || num === 1) return BigInt(1);
    let result = BigInt(1);
    for (let i = 2; i <= num; i++) {
      result *= BigInt(i);
    }
    return result;
  };

  // Calculate permutation P(n, r) = n! / (n-r)!
  const permutation = (nVal: number, rVal: number): bigint | null => {
    if (nVal < 0 || rVal < 0 || rVal > nVal) return null;
    return factorial(nVal) / factorial(nVal - rVal);
  };

  // Calculate permutation with repetition n^r
  const permutationWithRepetition = (nVal: number, rVal: number): bigint | null => {
    if (nVal < 0 || rVal < 0) return null;
    return BigInt(nVal) ** BigInt(rVal);
  };

  const results = useMemo(() => {
    const nVal = parseInt(n);
    const rVal = parseInt(r);

    if (isNaN(nVal) || nVal < 0 || nVal > 170) {
      return { error: 'n must be a number between 0 and 170' };
    }

    if (calculationType === 'factorial') {
      const factResult = factorial(nVal);
      return {
        factorial: factResult.toString(),
        formula: `${nVal}!`,
        explanation: `${nVal}! = ${nVal} × ${nVal - 1} × ... × 2 × 1`,
      };
    }

    if (isNaN(rVal) || rVal < 0) {
      return { error: 'r must be a non-negative number' };
    }

    if (calculationType === 'nPr') {
      if (rVal > nVal) {
        return { error: 'r cannot be greater than n for P(n,r)' };
      }
      const permResult = permutation(nVal, rVal);
      if (permResult === null) {
        return { error: 'Invalid values' };
      }
      return {
        result: permResult.toString(),
        formula: `P(${nVal}, ${rVal}) = ${nVal}! / (${nVal}-${rVal})!`,
        explanation: `P(${nVal}, ${rVal}) = ${nVal}! / ${nVal - rVal}!`,
        nFactorial: factorial(nVal).toString(),
        nMinusRFactorial: factorial(nVal - rVal).toString(),
      };
    }

    if (calculationType === 'withRepetition') {
      if (rVal > 100) {
        return { error: 'r is too large for repetition calculation' };
      }
      const repResult = permutationWithRepetition(nVal, rVal);
      if (repResult === null) {
        return { error: 'Invalid values' };
      }
      return {
        result: repResult.toString(),
        formula: `P_rep(${nVal}, ${rVal}) = ${nVal}^${rVal}`,
        explanation: `With repetition allowed: ${nVal}^${rVal}`,
      };
    }

    return { error: 'Unknown calculation type' };
  }, [n, r, calculationType]);

  const formatLargeNumber = (num: string): string => {
    if (num.length <= 20) return num;
    const exp = num.length - 1;
    return `${num[0]}.${num.slice(1, 6)}... × 10^${exp}`;
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const CopyButton = ({ value, label }: { value: string; label: string }) => (
    <button
      onClick={() => copyToClipboard(value, label)}
      className={`p-1.5 rounded ${
        copied === label
          ? 'text-green-500'
          : isDarkMode
          ? 'text-gray-400 hover:text-white'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {copied === label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );

  const calculationTypes: { key: CalculationType; label: string; description: string }[] = [
    { key: 'nPr', label: 'P(n, r)', description: 'Without repetition' },
    { key: 'withRepetition', label: 'n^r', description: 'With repetition' },
    { key: 'factorial', label: 'n!', description: 'Factorial' },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div
          className={`${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } rounded-lg shadow-lg p-8`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Shuffle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.permutation.permutationCalculator', 'Permutation Calculator')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.permutation.calculatePermutationsArrangementsAndFactorials', 'Calculate permutations, arrangements, and factorials')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.permutation.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
            </div>
          )}

          {/* Calculation Type Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.permutation.calculationType', 'Calculation Type')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {calculationTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setCalculationType(type.key)}
                  className={`px-4 py-3 rounded-lg border transition-colors text-center ${
                    calculationType === type.key
                      ? 'bg-[#0D9488] text-white border-[#0D9488]'
                      : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-mono font-bold">{type.label}</div>
                  <div className="text-xs opacity-75">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Input Section */}
          <div className="mb-6 grid sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.permutation.nTotalItems', 'n (total items)')}
              </label>
              <input
                type="number"
                value={n}
                onChange={(e) => setN(e.target.value)}
                min="0"
                max="170"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono text-lg`}
                placeholder={t('tools.permutation.enterN', 'Enter n')}
              />
            </div>
            {calculationType !== 'factorial' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.permutation.rItemsToArrange', 'r (items to arrange)')}
                </label>
                <input
                  type="number"
                  value={r}
                  onChange={(e) => setR(e.target.value)}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono text-lg`}
                  placeholder={t('tools.permutation.enterR', 'Enter r')}
                />
              </div>
            )}
          </div>

          {/* Results */}
          {results.error ? (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
              <p className="text-red-400">{results.error}</p>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {t('tools.permutation.result', 'Result')}
              </h3>

              {/* Main Result */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {results.formula}
                  </span>
                  <CopyButton value={results.result || results.factorial || ''} label="result" />
                </div>
                <div className="font-mono text-2xl text-[#0D9488] font-bold break-all">
                  {formatLargeNumber(results.result || results.factorial || '')}
                </div>
                {(results.result || results.factorial || '').length > 20 && (
                  <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Full value: {(results.result || results.factorial || '').length} digits
                  </div>
                )}
              </div>

              {/* Formula Explanation */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-[#0D9488]" />
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.permutation.calculation', 'Calculation')}
                  </span>
                </div>
                <p className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {results.explanation}
                </p>
                {results.nFactorial && (
                  <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {parseInt(n)}! = {formatLargeNumber(results.nFactorial)}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {parseInt(n) - parseInt(r)}! = {formatLargeNumber(results.nMinusRFactorial || '1')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common Examples */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
            <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.permutation.quickExamples', 'Quick Examples')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { n: 5, r: 3, label: 'P(5,3)' },
                { n: 10, r: 2, label: 'P(10,2)' },
                { n: 6, r: 6, label: 'P(6,6)' },
                { n: 8, r: 4, label: 'P(8,4)' },
              ].map((example) => (
                <button
                  key={example.label}
                  onClick={() => {
                    setN(example.n.toString());
                    setR(example.r.toString());
                    setCalculationType('nPr');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="mb-2">
                <strong>{t('tools.permutation.permutation', 'Permutation')}</strong> counts the number of ways to arrange r items from a set of n items, where order matters.
              </p>
              <p className="mb-1 font-mono">P(n, r) = n! / (n-r)! - without repetition</p>
              <p className="font-mono">P(n, r) = n^r - with repetition</p>
              <p className="mt-2">
                Example: Arranging 3 books from 5 on a shelf = P(5,3) = 60 ways
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermutationTool;
