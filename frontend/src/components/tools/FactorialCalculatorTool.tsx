import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Hash, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface FactorialResult {
  number: number;
  factorial: string;
  expansion: string;
  digits: number;
}

interface FactorialCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function FactorialCalculatorTool({ uiConfig }: FactorialCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { ConfirmDialog } = useConfirmDialog();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<FactorialResult | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Calculate factorial using BigInt for large numbers
  const factorial = (n: number): bigint => {
    if (n < 0) return BigInt(-1);
    if (n === 0 || n === 1) return BigInt(1);
    let result = BigInt(1);
    for (let i = 2; i <= n; i++) {
      result *= BigInt(i);
    }
    return result;
  };

  // Generate expansion string
  const getExpansion = (n: number): string => {
    if (n === 0 || n === 1) return `${n}! = 1`;
    if (n <= 10) {
      const nums = [];
      for (let i = n; i >= 1; i--) {
        nums.push(i);
      }
      return `${n}! = ${nums.join(' x ')}`;
    }
    return `${n}! = ${n} x ${n - 1} x ${n - 2} x ... x 2 x 1`;
  };

  const calculate = () => {
    const num = parseInt(input);

    if (isNaN(num)) {
      setValidationMessage('Please enter a valid number');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (num < 0) {
      setValidationMessage('Factorial is not defined for negative numbers');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (num > 1000) {
      setValidationMessage('Number too large. Please enter a number less than or equal to 1000.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const factorialValue = factorial(num);
    const factorialString = factorialValue.toString();

    setResult({
      number: num,
      factorial: factorialString,
      expansion: getExpansion(num),
      digits: factorialString.length
    });
  };

  const reset = () => {
    setInput('');
    setResult(null);
  };

  // First 20 factorials for reference
  const factorialTable = [
    { n: 0, value: '1' },
    { n: 1, value: '1' },
    { n: 2, value: '2' },
    { n: 3, value: '6' },
    { n: 4, value: '24' },
    { n: 5, value: '120' },
    { n: 6, value: '720' },
    { n: 7, value: '5,040' },
    { n: 8, value: '40,320' },
    { n: 9, value: '362,880' },
    { n: 10, value: '3,628,800' },
    { n: 11, value: '39,916,800' },
    { n: 12, value: '479,001,600' },
    { n: 13, value: '6,227,020,800' },
    { n: 14, value: '87,178,291,200' },
    { n: 15, value: '1,307,674,368,000' },
    { n: 16, value: '20,922,789,888,000' },
    { n: 17, value: '355,687,428,096,000' },
    { n: 18, value: '6,402,373,705,728,000' },
    { n: 19, value: '121,645,100,408,832,000' },
    { n: 20, value: '2,432,902,008,176,640,000' },
  ];

  const formatLargeNumber = (numStr: string): string => {
    if (numStr.length <= 50) {
      return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return `${numStr.slice(0, 20)}...${numStr.slice(-10)} (${numStr.length} digits)`;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.factorialCalculator.factorialCalculator', 'Factorial Calculator')}
            </h1>
          </div>

          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.factorialCalculator.calculateTheFactorialNOf', 'Calculate the factorial (n!) of any non-negative integer.')}
          </p>

          {/* Input Field */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.factorialCalculator.enterANumberN', 'Enter a number (n)')}
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('tools.factorialCalculator.enterANonNegativeInteger', 'Enter a non-negative integer')}
                min="0"
                max="1000"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <span className={`self-center text-2xl font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                !
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculate}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.factorialCalculator.calculateFactorial', 'Calculate Factorial')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.factorialCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.factorialCalculator.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    {result.number}! equals
                  </div>
                  <div className="text-2xl font-bold text-[#0D9488] font-mono break-all">
                    {formatLargeNumber(result.factorial)}
                  </div>
                </div>

                {/* Expansion */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('tools.factorialCalculator.expansion', 'Expansion:')}
                  </div>
                  <div className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {result.expansion}
                  </div>
                </div>

                {/* Number of digits */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.factorialCalculator.numberOfDigits', 'Number of digits:')}
                    </span>
                    <span className={`font-bold text-[#0D9488]`}>
                      {result.digits.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toggle Table Button */}
          <button
            onClick={() => setShowTable(!showTable)}
            className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowRight className={`w-5 h-5 transition-transform ${showTable ? 'rotate-90' : ''}`} />
            {showTable ? t('tools.factorialCalculator.hide', 'Hide') : t('tools.factorialCalculator.show', 'Show')} Factorial Table (0-20)
          </button>

          {/* Factorial Table */}
          {showTable && (
            <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.factorialCalculator.factorialTable', 'Factorial Table')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {factorialTable.map((item) => (
                  <div
                    key={item.n}
                    className={`flex justify-between px-3 py-2 rounded ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                    }`}
                  >
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.n}!
                    </span>
                    <span className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.factorialCalculator.whatIsFactorial', 'What is Factorial?')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('tools.factorialCalculator.theFactorialOfANon', 'The factorial of a non-negative integer n, denoted as n!, is the product of all positive integers less than or equal to n.')}
            </p>
            <p className={`text-sm font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              n! = n x (n-1) x (n-2) x ... x 2 x 1
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
              By convention, 0! = 1. Factorials are used in combinatorics, probability, and calculus.
            </p>
          </div>

          {/* Validation Toast */}
          {validationMessage && (
            <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top z-50">
              {validationMessage}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}
