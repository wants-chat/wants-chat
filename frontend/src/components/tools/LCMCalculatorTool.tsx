import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, X, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface LCMResult {
  numbers: number[];
  lcm: number;
  steps: string[];
  primeFactors: { [key: number]: { [key: number]: number } };
}

interface LCMCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function LCMCalculatorTool({
  uiConfig }: LCMCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [inputs, setInputs] = useState<string[]>(['', '']);
  const [result, setResult] = useState<LCMResult | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  const lcm = (a: number, b: number): number => {
    return Math.abs(a * b) / gcd(a, b);
  };

  const lcmOfArray = (arr: number[]): number => {
    return arr.reduce((acc, num) => lcm(acc, num));
  };

  const getPrimeFactors = (n: number): { [key: number]: number } => {
    const factors: { [key: number]: number } = {};
    let num = Math.abs(n);

    for (let i = 2; i <= num; i++) {
      while (num % i === 0) {
        factors[i] = (factors[i] || 0) + 1;
        num = num / i;
      }
    }
    return factors;
  };

  const calculate = () => {
    const numbers = inputs
      .map(input => parseInt(input))
      .filter(n => !isNaN(n) && n !== 0);

    if (numbers.length < 2) {
      setValidationMessage('Please enter at least two valid non-zero integers');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const lcmValue = lcmOfArray(numbers);

    const primeFactors: { [key: number]: { [key: number]: number } } = {};
    numbers.forEach(num => {
      primeFactors[num] = getPrimeFactors(num);
    });

    // Generate steps explanation
    const steps: string[] = [];
    if (numbers.length === 2) {
      const a = numbers[0];
      const b = numbers[1];
      const gcdValue = gcd(a, b);
      steps.push(`Step 1: Find GCD(${a}, ${b}) = ${gcdValue}`);
      steps.push(`Step 2: LCM = |${a} x ${b}| / GCD = ${Math.abs(a * b)} / ${gcdValue}`);
      steps.push(`Step 3: LCM = ${lcmValue}`);
    } else {
      steps.push(`LCM(${numbers.join(', ')}) = ${lcmValue}`);
      steps.push('Calculated by finding LCM of pairs successively');
    }

    setResult({
      numbers,
      lcm: lcmValue,
      steps,
      primeFactors
    });
  };

  const addInput = () => {
    if (inputs.length < 10) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (index: number) => {
    if (inputs.length > 2) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const updateInput = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const reset = () => {
    setInputs(['', '']);
    setResult(null);
  };

  const formatPrimeFactors = (factors: { [key: number]: number }): string => {
    return Object.entries(factors)
      .map(([prime, power]) => power > 1 ? `${prime}^${power}` : prime)
      .join(' x ') || '1';
  };

  const getMaxPowers = (primeFactors: { [key: number]: { [key: number]: number } }): { [key: number]: number } => {
    const maxPowers: { [key: number]: number } = {};
    Object.values(primeFactors).forEach(factors => {
      Object.entries(factors).forEach(([prime, power]) => {
        const p = parseInt(prime);
        maxPowers[p] = Math.max(maxPowers[p] || 0, power);
      });
    });
    return maxPowers;
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <X className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.lCMCalculator.lcmCalculator', 'LCM Calculator')}
            </h1>
          </div>

          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.lCMCalculator.calculateTheLeastCommonMultiple', 'Calculate the Least Common Multiple (LCM) of two or more numbers.')}
          </p>

          {/* Input Fields */}
          <div className="space-y-3 mb-6">
            {inputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="number"
                  value={input}
                  onChange={(e) => updateInput(index, e.target.value)}
                  placeholder={`Number ${index + 1}`}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                {inputs.length > 2 && (
                  <button
                    onClick={() => removeInput(index)}
                    className={`px-3 py-3 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Number Button */}
          {inputs.length < 10 && (
            <button
              onClick={addInput}
              className={`w-full mb-6 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-dashed border-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-dashed border-gray-300'
              }`}
            >
              <Plus className="w-5 h-5" />
              {t('tools.lCMCalculator.addAnotherNumber', 'Add Another Number')}
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculate}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.lCMCalculator.calculateLcm', 'Calculate LCM')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.lCMCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.lCMCalculator.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    LCM of {result.numbers.join(', ')}
                  </div>
                  <div className="text-4xl font-bold text-[#0D9488]">
                    {result.lcm.toLocaleString()}
                  </div>
                </div>

                {/* Calculation Steps */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('tools.lCMCalculator.calculationSteps', 'Calculation Steps:')}
                  </div>
                  <div className={`font-mono text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {result.steps.map((step, idx) => (
                      <div key={idx}>{step}</div>
                    ))}
                  </div>
                </div>

                {/* Prime Factorization */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('tools.lCMCalculator.primeFactorization', 'Prime Factorization:')}
                  </div>
                  <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {result.numbers.map((num, idx) => (
                      <div key={idx} className="font-mono">
                        {num} = {formatPrimeFactors(result.primeFactors[num])}
                      </div>
                    ))}
                  </div>
                </div>

                {/* LCM from Prime Factors */}
                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('tools.lCMCalculator.lcmFromPrimeFactorsMax', 'LCM from Prime Factors (max powers):')}
                  </div>
                  <div className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    LCM = {formatPrimeFactors(getMaxPowers(result.primeFactors))} = {result.lcm.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.lCMCalculator.examples', 'Examples')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>* LCM(4, 6) = 12</p>
              <p>* LCM(3, 5) = 15</p>
              <p>* LCM(12, 18) = 36</p>
              <p>* LCM(4, 6, 8) = 24</p>
            </div>
          </div>

          {/* Info Box */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.lCMCalculator.whatIsLcm', 'What is LCM?')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              The Least Common Multiple (LCM) is the smallest positive integer that is divisible by all given numbers.
              It can be calculated using the formula: LCM(a, b) = |a x b| / GCD(a, b).
              For prime factorization method, take the highest power of each prime factor.
            </p>
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
    </>
  );
}
