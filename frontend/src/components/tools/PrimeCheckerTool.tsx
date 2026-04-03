import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Hash, List, Check, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface PrimeResult {
  number: number;
  isPrime: boolean;
  factors: number[];
  explanation: string;
}

interface PrimeCheckerToolProps {
  uiConfig?: UIConfig;
}

export default function PrimeCheckerTool({ uiConfig }: PrimeCheckerToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PrimeResult | null>(null);
  const [primesList, setPrimesList] = useState<number[]>([]);
  const [showPrimesList, setShowPrimesList] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const isPrime = (n: number): boolean => {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const getFactors = (n: number): number[] => {
    const factors: number[] = [];
    for (let i = 1; i <= n; i++) {
      if (n % i === 0) {
        factors.push(i);
      }
    }
    return factors;
  };

  const checkPrime = () => {
    const num = parseInt(input);

    if (isNaN(num) || num < 0) {
      setValidationMessage('Please enter a valid positive integer');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const prime = isPrime(num);
    const factors = getFactors(num);

    let explanation = '';
    if (num < 2) {
      explanation = `${num} is not prime. Prime numbers must be greater than 1.`;
    } else if (prime) {
      explanation = `${num} is prime. It is only divisible by 1 and itself.`;
    } else {
      const properFactors = factors.filter(f => f !== 1 && f !== num);
      explanation = `${num} is not prime. It is divisible by ${properFactors.join(', ')}.`;
    }

    setResult({
      number: num,
      isPrime: prime,
      factors,
      explanation
    });
    setShowPrimesList(false);
  };

  const findPrimesInRange = () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);

    if (isNaN(start) || isNaN(end) || start < 0 || end < 0) {
      setValidationMessage('Please enter valid positive integers for the range');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (start > end) {
      setValidationMessage('Start value must be less than or equal to end value');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (end - start > 10000) {
      setValidationMessage('Range is too large. Please limit to 10,000 numbers.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const primes: number[] = [];
    for (let i = start; i <= end; i++) {
      if (isPrime(i)) {
        primes.push(i);
      }
    }

    setPrimesList(primes);
    setShowPrimesList(true);
    setResult(null);
  };

  const reset = () => {
    setInput('');
    setResult(null);
    setPrimesList([]);
    setShowPrimesList(false);
    setRangeStart('');
    setRangeEnd('');
  };

  // First 20 primes for reference
  const firstPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.primeChecker.primeNumberChecker', 'Prime Number Checker')}
            </h1>
          </div>

          {/* Single Number Check */}
          <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.primeChecker.checkSingleNumber', 'Check Single Number')}
            </h2>
            <div className="flex gap-3">
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('tools.primeChecker.enterANumber', 'Enter a number')}
                min="0"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <button
                onClick={checkPrime}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                {t('tools.primeChecker.check', 'Check')}
              </button>
            </div>
          </div>

          {/* Range Check */}
          <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.primeChecker.findPrimesInRange', 'Find Primes in Range')}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                placeholder={t('tools.primeChecker.start', 'Start')}
                min="0"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <span className={`self-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>to</span>
              <input
                type="number"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                placeholder={t('tools.primeChecker.end', 'End')}
                min="0"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <button
                onClick={findPrimesInRange}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {t('tools.primeChecker.find', 'Find')}
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mb-6">
            <button
              onClick={reset}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.primeChecker.resetAll', 'Reset All')}
            </button>
          </div>

          {/* Single Number Result */}
          {result && (
            <div className={`p-6 rounded-lg border-l-4 ${
              result.isPrime ? 'border-green-500' : 'border-red-500'
            } ${theme === 'dark' ? 'bg-gray-700' : result.isPrime ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                {result.isPrime ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div className={`text-2xl font-bold ${result.isPrime ? 'text-green-600' : 'text-red-600'}`}>
                  {result.number} is {result.isPrime ? t('tools.primeChecker.prime', 'Prime') : t('tools.primeChecker.notPrime', 'Not Prime')}
                </div>
              </div>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {result.explanation}
              </p>
              <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  All factors of {result.number}:
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.factors.map((factor, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        theme === 'dark'
                          ? 'bg-gray-600 text-gray-200'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Primes List Result */}
          {showPrimesList && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.primeChecker.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="mb-4">
                <div className="text-2xl font-bold text-[#0D9488] mb-2">
                  {primesList.length} Prime{primesList.length !== 1 ? 's' : ''} Found
                </div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Prime numbers between {rangeStart} and {rangeEnd}:
                </p>
              </div>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {primesList.length > 0 ? (
                  primesList.map((prime, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-[#0D9488] text-white"
                    >
                      {prime}
                    </span>
                  ))
                ) : (
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.primeChecker.noPrimeNumbersInThis', 'No prime numbers in this range.')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* First 20 Primes Reference */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.primeChecker.first20PrimeNumbers', 'First 20 Prime Numbers')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {firstPrimes.map((prime, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-gray-200' : t('tools.primeChecker.bg0d948820Text0d9488', 'bg-[#0D9488]/20 text-[#0D9488]')
                  }`}
                >
                  {prime}
                </span>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.primeChecker.whatIsAPrimeNumber', 'What is a Prime Number?')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.
              The first prime number is 2, which is also the only even prime number.
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
