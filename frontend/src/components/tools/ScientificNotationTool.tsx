import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, ArrowLeftRight, Superscript } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type ConversionMode = 'toScientific' | 'fromScientific';

interface Result {
  value: string;
  formula: string;
  explanation: string;
}

interface ScientificNotationToolProps {
  uiConfig?: UIConfig;
}

export default function ScientificNotationTool({
  uiConfig }: ScientificNotationToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mode, setMode] = useState<ConversionMode>('toScientific');
  const [decimalInput, setDecimalInput] = useState('');
  const [coefficient, setCoefficient] = useState('');
  const [exponent, setExponent] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const convertToScientific = () => {
    const num = parseFloat(decimalInput);

    if (isNaN(num)) {
      setValidationMessage('Please enter a valid number');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (num === 0) {
      setResult({
        value: '0 x 10^0',
        formula: '0 = 0 x 10^0',
        explanation: 'Zero in scientific notation is 0 x 10^0'
      });
      return;
    }

    const exp = Math.floor(Math.log10(Math.abs(num)));
    const coef = num / Math.pow(10, exp);

    setResult({
      value: `${coef.toFixed(6).replace(/\.?0+$/, '')} x 10^${exp}`,
      formula: `${num} = ${coef.toFixed(6).replace(/\.?0+$/, '')} x 10^${exp}`,
      explanation: `Move the decimal point ${Math.abs(exp)} place${Math.abs(exp) !== 1 ? 's' : ''} to the ${exp >= 0 ? 'left' : 'right'}`
    });
  };

  const convertFromScientific = () => {
    const coef = parseFloat(coefficient);
    const exp = parseInt(exponent);

    if (isNaN(coef) || isNaN(exp)) {
      setValidationMessage('Please enter valid numbers for coefficient and exponent');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const decimalValue = coef * Math.pow(10, exp);

    let formattedValue: string;
    if (Math.abs(decimalValue) >= 1e15 || (Math.abs(decimalValue) < 1e-10 && decimalValue !== 0)) {
      formattedValue = decimalValue.toExponential();
    } else {
      formattedValue = decimalValue.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 20 });
    }

    setResult({
      value: formattedValue,
      formula: `${coef} x 10^${exp} = ${formattedValue}`,
      explanation: `Multiply ${coef} by 10 raised to the power of ${exp}`
    });
  };

  const calculate = () => {
    if (mode === 'toScientific') {
      convertToScientific();
    } else {
      convertFromScientific();
    }
  };

  const reset = () => {
    setDecimalInput('');
    setCoefficient('');
    setExponent('');
    setResult(null);
  };

  const switchMode = (newMode: ConversionMode) => {
    setMode(newMode);
    reset();
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Superscript className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.scientificNotation.scientificNotationConverter', 'Scientific Notation Converter')}
            </h1>
          </div>

          {/* Mode Tabs */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => switchMode('toScientific')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  mode === 'toScientific'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.scientificNotation.decimalToScientific', 'Decimal to Scientific')}
              </button>
              <button
                onClick={() => switchMode('fromScientific')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  mode === 'fromScientific'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.scientificNotation.scientificToDecimal', 'Scientific to Decimal')}
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {mode === 'toScientific' ? (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.scientificNotation.decimalNumber', 'Decimal Number')}
                </label>
                <input
                  type="text"
                  value={decimalInput}
                  onChange={(e) => setDecimalInput(e.target.value)}
                  placeholder={t('tools.scientificNotation.enterANumberEG', 'Enter a number (e.g., 123456 or 0.00045)')}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.scientificNotation.coefficientA', 'Coefficient (a)')}
                  </label>
                  <input
                    type="text"
                    value={coefficient}
                    onChange={(e) => setCoefficient(e.target.value)}
                    placeholder={t('tools.scientificNotation.enterCoefficientEG1', 'Enter coefficient (e.g., 1.23)')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <span className={`text-lg font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    x 10^
                  </span>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.scientificNotation.exponentN', 'Exponent (n)')}
                  </label>
                  <input
                    type="number"
                    value={exponent}
                    onChange={(e) => setExponent(e.target.value)}
                    placeholder={t('tools.scientificNotation.enterExponentEG5', 'Enter exponent (e.g., 5 or -3)')}
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
              <ArrowRightLeft className="w-5 h-5" />
              {t('tools.scientificNotation.convert', 'Convert')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.scientificNotation.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.scientificNotation.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0D9488] mb-2 font-mono break-all">
                    {result.value}
                  </div>
                  <div className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {result.explanation}
                  </div>
                </div>

                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    {t('tools.scientificNotation.conversion', 'Conversion:')}
                  </div>
                  <div className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {result.formula}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.scientificNotation.examples', 'Examples')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {mode === 'toScientific' ? (
                <>
                  <p>* 123000 = 1.23 x 10^5</p>
                  <p>* 0.00045 = 4.5 x 10^-4</p>
                  <p>* 6789.12 = 6.78912 x 10^3</p>
                </>
              ) : (
                <>
                  <p>* 1.23 x 10^5 = 123000</p>
                  <p>* 4.5 x 10^-4 = 0.00045</p>
                  <p>* 6.789 x 10^3 = 6789</p>
                </>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.scientificNotation.whatIsScientificNotation', 'What is Scientific Notation?')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Scientific notation is a way of expressing very large or very small numbers in the form a x 10^n,
              where 1 {'<='} |a| {'<'} 10 and n is an integer. It is commonly used in science and engineering.
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
