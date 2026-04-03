import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Info, Copy, Check, Sparkles, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CombinationToolProps {
  uiConfig?: UIConfig;
}

type CalculationType = 'nCr' | 'withRepetition' | 'pascalRow';

const CombinationTool: React.FC<CombinationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [n, setN] = useState<string>('5');
  const [r, setR] = useState<string>('3');
  const [calculationType, setCalculationType] = useState<CalculationType>('nCr');
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
        // Try to extract n and r pattern like "5C3" or "5, 3" or "n=5, r=3"
        const combMatch = textContent.match(/(\d+)\s*[Cc]\s*(\d+)/);
        const commaMatch = textContent.match(/(\d+)\s*[,\s]+(\d+)/);
        const nrMatch = textContent.match(/n\s*=\s*(\d+).*r\s*=\s*(\d+)/i);

        if (combMatch) {
          setN(combMatch[1]);
          setR(combMatch[2]);
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

  // Calculate combination C(n, r) = n! / (r! * (n-r)!)
  const combination = (nVal: number, rVal: number): bigint | null => {
    if (nVal < 0 || rVal < 0 || rVal > nVal) return null;
    // Optimize by using the smaller of r and n-r
    const k = Math.min(rVal, nVal - rVal);
    let result = BigInt(1);
    for (let i = 0; i < k; i++) {
      result = (result * BigInt(nVal - i)) / BigInt(i + 1);
    }
    return result;
  };

  // Calculate combination with repetition C(n+r-1, r)
  const combinationWithRepetition = (nVal: number, rVal: number): bigint | null => {
    if (nVal < 0 || rVal < 0) return null;
    return combination(nVal + rVal - 1, rVal);
  };

  // Generate Pascal's triangle row
  const pascalRow = (row: number): bigint[] => {
    const result: bigint[] = [];
    for (let k = 0; k <= row; k++) {
      result.push(combination(row, k) || BigInt(0));
    }
    return result;
  };

  const results = useMemo(() => {
    const nVal = parseInt(n);
    const rVal = parseInt(r);

    if (isNaN(nVal) || nVal < 0 || nVal > 170) {
      return { error: 'n must be a number between 0 and 170' };
    }

    if (calculationType === 'pascalRow') {
      if (nVal > 30) {
        return { error: 'Row number must be 30 or less for Pascal\'s triangle' };
      }
      const row = pascalRow(nVal);
      return {
        pascalRow: row.map((v) => v.toString()),
        formula: `Pascal's Triangle Row ${nVal}`,
        explanation: `Row ${nVal} of Pascal's Triangle (0-indexed)`,
        sum: row.reduce((a, b) => a + b, BigInt(0)).toString(),
      };
    }

    if (isNaN(rVal) || rVal < 0) {
      return { error: 'r must be a non-negative number' };
    }

    if (calculationType === 'nCr') {
      if (rVal > nVal) {
        return { error: 'r cannot be greater than n for C(n,r)' };
      }
      const combResult = combination(nVal, rVal);
      if (combResult === null) {
        return { error: 'Invalid values' };
      }
      return {
        result: combResult.toString(),
        formula: `C(${nVal}, ${rVal}) = ${nVal}! / (${rVal}! × ${nVal - rVal}!)`,
        explanation: `Choose ${rVal} items from ${nVal} items (order doesn't matter)`,
        nFactorial: factorial(nVal).toString(),
        rFactorial: factorial(rVal).toString(),
        nMinusRFactorial: factorial(nVal - rVal).toString(),
      };
    }

    if (calculationType === 'withRepetition') {
      const repResult = combinationWithRepetition(nVal, rVal);
      if (repResult === null) {
        return { error: 'Invalid values' };
      }
      return {
        result: repResult.toString(),
        formula: `C_rep(${nVal}, ${rVal}) = C(${nVal + rVal - 1}, ${rVal})`,
        explanation: `Choose ${rVal} items from ${nVal} types with repetition allowed`,
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
    { key: 'nCr', label: 'C(n, r)', description: 'Without repetition' },
    { key: 'withRepetition', label: 'C_rep', description: 'With repetition' },
    { key: 'pascalRow', label: 'Pascal', description: 'Triangle row' },
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
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.combination.combinationCalculator', 'Combination Calculator')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.combination.calculateCombinationsAndBinomialCoefficients', 'Calculate combinations and binomial coefficients')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.combination.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
            </div>
          )}

          {/* Calculation Type Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.combination.calculationType', 'Calculation Type')}
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
                {calculationType === 'pascalRow' ? t('tools.combination.rowNumber0Indexed', 'Row number (0-indexed)') : t('tools.combination.nTotalItems', 'n (total items)')}
              </label>
              <input
                type="number"
                value={n}
                onChange={(e) => setN(e.target.value)}
                min="0"
                max={calculationType === 'pascalRow' ? 30 : 170}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono text-lg`}
                placeholder={t('tools.combination.enterN', 'Enter n')}
              />
            </div>
            {calculationType !== 'pascalRow' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.combination.rItemsToChoose', 'r (items to choose)')}
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
                  placeholder={t('tools.combination.enterR', 'Enter r')}
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
                {t('tools.combination.result', 'Result')}
              </h3>

              {/* Pascal Row Display */}
              {results.pascalRow ? (
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} mb-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {results.formula}
                    </span>
                    <CopyButton value={results.pascalRow.join(', ')} label="pascalRow" />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {results.pascalRow.map((val, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-lg font-mono ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}
                      >
                        <div className="text-xs text-center opacity-50 mb-1">C({n},{idx})</div>
                        <div className="text-center text-[#0D9488] font-bold">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Row sum: <span className="font-mono font-bold text-[#0D9488]">{results.sum}</span>
                    <span className="text-sm ml-2">(= 2^{n})</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Main Result */}
                  <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} mb-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {results.formula}
                      </span>
                      <CopyButton value={results.result || ''} label="result" />
                    </div>
                    <div className="font-mono text-2xl text-[#0D9488] font-bold break-all">
                      {formatLargeNumber(results.result || '')}
                    </div>
                    {(results.result || '').length > 20 && (
                      <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Full value: {(results.result || '').length} digits
                      </div>
                    )}
                  </div>

                  {/* Formula Explanation */}
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-4 h-4 text-[#0D9488]" />
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.combination.calculation', 'Calculation')}
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
                          {parseInt(r)}! = {formatLargeNumber(results.rFactorial || '1')}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {parseInt(n) - parseInt(r)}! = {formatLargeNumber(results.nMinusRFactorial || '1')}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Common Examples */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
            <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.combination.quickExamples', 'Quick Examples')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { n: 5, r: 3, label: 'C(5,3)' },
                { n: 10, r: 2, label: 'C(10,2)' },
                { n: 52, r: 5, label: 'C(52,5)' },
                { n: 6, r: 3, label: 'C(6,3)' },
              ].map((example) => (
                <button
                  key={example.label}
                  onClick={() => {
                    setN(example.n.toString());
                    setR(example.r.toString());
                    setCalculationType('nCr');
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

          {/* Comparison with Permutation */}
          {calculationType === 'nCr' && !results.error && results.result && (
            <div className={`p-4 rounded-lg ${isDarkMode ? t('tools.combination.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border mb-6`}>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.combination.combinationVsPermutation', 'Combination vs Permutation')}
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    C({n}, {r}) - Order doesn't matter
                  </div>
                  <div className="font-mono text-lg text-[#0D9488] font-bold">
                    {formatLargeNumber(results.result)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    P({n}, {r}) - Order matters
                  </div>
                  <div className="font-mono text-lg text-[#0D9488] font-bold">
                    {(() => {
                      const nVal = parseInt(n);
                      const rVal = parseInt(r);
                      const perm = (factorial(nVal) / factorial(nVal - rVal)).toString();
                      return formatLargeNumber(perm);
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="mb-2">
                <strong>{t('tools.combination.combination', 'Combination')}</strong> counts the number of ways to choose r items from a set of n items, where order does NOT matter.
              </p>
              <p className="mb-1 font-mono">C(n, r) = n! / (r! × (n-r)!) - without repetition</p>
              <p className="mb-1 font-mono">C_rep(n, r) = C(n+r-1, r) - with repetition</p>
              <p className="mt-2">
                Example: Choosing 3 cards from 5 = C(5,3) = 10 ways (regardless of order)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinationTool;
