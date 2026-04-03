import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Hash, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type LogType = 'common' | 'natural' | 'custom';

interface LogResult {
  logType: string;
  base: number;
  value: number;
  result: number;
  formula: string;
  explanation: string;
}

interface LogarithmCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function LogarithmCalculatorTool({ uiConfig }: LogarithmCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [logType, setLogType] = useState<LogType>('common');
  const [value, setValue] = useState('');
  const [customBase, setCustomBase] = useState('');
  const [result, setResult] = useState<LogResult | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const calculate = () => {
    const num = parseFloat(value);

    if (isNaN(num) || num <= 0) {
      setValidationMessage('Please enter a positive number for the value');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    let base: number;
    let logResult: number;
    let logTypeStr: string;

    switch (logType) {
      case 'common':
        base = 10;
        logResult = Math.log10(num);
        logTypeStr = 'Common Logarithm (log10)';
        break;
      case 'natural':
        base = Math.E;
        logResult = Math.log(num);
        logTypeStr = 'Natural Logarithm (ln)';
        break;
      case 'custom':
        base = parseFloat(customBase);
        if (isNaN(base) || base <= 0 || base === 1) {
          setValidationMessage('Please enter a valid base (positive number, not equal to 1)');
          setTimeout(() => setValidationMessage(null), 3000);
          return;
        }
        logResult = Math.log(num) / Math.log(base);
        logTypeStr = `Logarithm base ${base}`;
        break;
      default:
        return;
    }

    const baseSymbol = logType === 'natural' ? 'e' : base.toString();
    const logSymbol = logType === 'natural' ? 'ln' : `log${logType === 'common' ? '' : `_${base}`}`;

    setResult({
      logType: logTypeStr,
      base,
      value: num,
      result: logResult,
      formula: `${logSymbol}(${num}) = ${logResult.toFixed(10).replace(/\.?0+$/, '')}`,
      explanation: `${baseSymbol}^${logResult.toFixed(6)} = ${num}`
    });
  };

  const reset = () => {
    setValue('');
    setCustomBase('');
    setResult(null);
  };

  // Common logarithm values for reference
  const commonLogs = [
    { value: 1, log10: 0, ln: 0 },
    { value: 2, log10: 0.301, ln: 0.693 },
    { value: 5, log10: 0.699, ln: 1.609 },
    { value: 10, log10: 1, ln: 2.303 },
    { value: 100, log10: 2, ln: 4.605 },
    { value: 1000, log10: 3, ln: 6.908 },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.logarithmCalculator.logarithmCalculator', 'Logarithm Calculator')}
            </h1>
          </div>

          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.logarithmCalculator.calculateLogarithmsWithCommonBase', 'Calculate logarithms with common (base 10), natural (base e), or custom bases.')}
          </p>

          {/* Log Type Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.logarithmCalculator.logarithmType', 'Logarithm Type')}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setLogType('common')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  logType === 'common'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.logarithmCalculator.logBase10', 'log (base 10)')}
              </button>
              <button
                onClick={() => setLogType('natural')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  logType === 'natural'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.logarithmCalculator.lnBaseE', 'ln (base e)')}
              </button>
              <button
                onClick={() => setLogType('custom')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  logType === 'custom'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.logarithmCalculator.customBase', 'Custom Base')}
              </button>
            </div>
          </div>

          {/* Custom Base Input */}
          {logType === 'custom' && (
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.logarithmCalculator.base', 'Base')}
              </label>
              <input
                type="number"
                value={customBase}
                onChange={(e) => setCustomBase(e.target.value)}
                placeholder={t('tools.logarithmCalculator.enterBaseEG2', 'Enter base (e.g., 2)')}
                step="any"
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          )}

          {/* Value Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.logarithmCalculator.valueX', 'Value (x)')}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('tools.logarithmCalculator.enterAPositiveNumber', 'Enter a positive number')}
              step="any"
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculate}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.logarithmCalculator.calculate', 'Calculate')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.logarithmCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.logarithmCalculator.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    {result.logType}
                  </div>
                  <div className="text-4xl font-bold text-[#0D9488] font-mono">
                    {result.result.toFixed(10).replace(/\.?0+$/, '')}
                  </div>
                </div>

                {/* Formula */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('tools.logarithmCalculator.formula', 'Formula:')}
                  </div>
                  <div className={`font-mono text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {result.formula}
                  </div>
                </div>

                {/* Verification */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('tools.logarithmCalculator.verification', 'Verification:')}
                  </div>
                  <div className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {result.explanation}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Common Logarithm Values */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.logarithmCalculator.commonValuesReference', 'Common Values Reference')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <th className="text-left py-2 px-3">x</th>
                    <th className="text-left py-2 px-3">{t('tools.logarithmCalculator.log10X', 'log10(x)')}</th>
                    <th className="text-left py-2 px-3">ln(x)</th>
                  </tr>
                </thead>
                <tbody>
                  {commonLogs.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ${
                        idx % 2 === 0
                          ? theme === 'dark' ? 'bg-gray-600/30' : 'bg-white'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-mono">{row.value}</td>
                      <td className="py-2 px-3 font-mono">{row.log10}</td>
                      <td className="py-2 px-3 font-mono">{row.ln}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.logarithmCalculator.whatIsALogarithm', 'What is a Logarithm?')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              The logarithm is the inverse function of exponentiation. If b^y = x, then log_b(x) = y.
            </p>
            <ul className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
              <li>* <strong>{t('tools.logarithmCalculator.commonLogarithmLog', 'Common logarithm (log):')}</strong> {t('tools.logarithmCalculator.base10UsedInScience', 'base 10, used in science and engineering')}</li>
              <li>* <strong>{t('tools.logarithmCalculator.naturalLogarithmLn', 'Natural logarithm (ln):')}</strong> {t('tools.logarithmCalculator.baseEApprox2718', 'base e (approx 2.718), used in calculus and physics')}</li>
              <li>* <strong>{t('tools.logarithmCalculator.binaryLogarithmLog2', 'Binary logarithm (log2):')}</strong> {t('tools.logarithmCalculator.base2UsedInComputer', 'base 2, used in computer science')}</li>
            </ul>
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
