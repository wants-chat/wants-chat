import React, { useState, useEffect } from 'react';
import { Calculator, Percent, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type CalculationMode = 'whatIs' | 'isWhat' | 'change';

interface Result {
  value: number;
  formula: string;
  explanation: string;
}

interface PercentageCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function PercentageCalculatorTool({ uiConfig }: PercentageCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [mode, setMode] = useState<CalculationMode>('whatIs');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setInput1(params.numbers[0].toString());
        setInput2(params.numbers[1].toString());
        setIsPrefilled(true);
      } else if (params.amount !== undefined) {
        setInput2(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateWhatIs = () => {
    const percent = parseFloat(input1);
    const number = parseFloat(input2);

    if (isNaN(percent) || isNaN(number)) {
      setValidationMessage('Please enter valid numbers');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const resultValue = (percent / 100) * number;
    setResult({
      value: parseFloat(resultValue.toFixed(2)),
      formula: `(${percent} ÷ 100) × ${number} = ${resultValue.toFixed(2)}`,
      explanation: `${percent}% of ${number} is ${resultValue.toFixed(2)}`
    });
  };

  const calculateIsWhat = () => {
    const part = parseFloat(input1);
    const whole = parseFloat(input2);

    if (isNaN(part) || isNaN(whole) || whole === 0) {
      setValidationMessage('Please enter valid numbers (whole cannot be zero)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const resultValue = (part / whole) * 100;
    setResult({
      value: parseFloat(resultValue.toFixed(2)),
      formula: `(${part} ÷ ${whole}) × 100 = ${resultValue.toFixed(2)}%`,
      explanation: `${part} is ${resultValue.toFixed(2)}% of ${whole}`
    });
  };

  const calculateChange = () => {
    const initial = parseFloat(input1);
    const final = parseFloat(input2);

    if (isNaN(initial) || isNaN(final) || initial === 0) {
      setValidationMessage('Please enter valid numbers (initial value cannot be zero)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const change = final - initial;
    const percentChange = (change / initial) * 100;
    const isIncrease = percentChange > 0;

    setResult({
      value: parseFloat(Math.abs(percentChange).toFixed(2)),
      formula: `((${final} - ${initial}) ÷ ${initial}) × 100 = ${percentChange.toFixed(2)}%`,
      explanation: `${isIncrease ? 'Increase' : 'Decrease'} of ${Math.abs(percentChange).toFixed(2)}% from ${initial} to ${final}`
    });
  };

  const calculate = () => {
    switch (mode) {
      case 'whatIs':
        calculateWhatIs();
        break;
      case 'isWhat':
        calculateIsWhat();
        break;
      case 'change':
        calculateChange();
        break;
    }
  };

  const reset = () => {
    setInput1('');
    setInput2('');
    setResult(null);
  };

  const getModeConfig = () => {
    switch (mode) {
      case 'whatIs':
        return {
          title: 'What is X% of Y?',
          input1Label: 'Percentage (%)',
          input1Placeholder: 'Enter percentage',
          input2Label: 'Number',
          input2Placeholder: 'Enter number',
        };
      case 'isWhat':
        return {
          title: 'X is what % of Y?',
          input1Label: 'Part (X)',
          input1Placeholder: 'Enter part value',
          input2Label: 'Whole (Y)',
          input2Placeholder: 'Enter whole value',
        };
      case 'change':
        return {
          title: '% Change from X to Y',
          input1Label: 'Initial Value',
          input1Placeholder: 'Enter initial value',
          input2Label: 'Final Value',
          input2Placeholder: 'Enter final value',
        };
    }
  };

  const config = getModeConfig();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.percentageCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.percentageCalculator.percentageCalculator', 'Percentage Calculator')}
            </h1>
          </div>

          {/* Mode Tabs */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => { setMode('whatIs'); reset(); }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  mode === 'whatIs'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.percentageCalculator.whatIsXOfY', 'What is X% of Y?')}
              </button>
              <button
                onClick={() => { setMode('isWhat'); reset(); }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  mode === 'isWhat'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.percentageCalculator.xIsWhatOfY', 'X is what % of Y?')}
              </button>
              <button
                onClick={() => { setMode('change'); reset(); }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-sm ${
                  mode === 'change'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.percentageCalculator.increaseDecrease', '% Increase/Decrease')}
              </button>
            </div>
          </div>

          {/* Current Mode Title */}
          <div className={`text-center mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {config.title}
            </h2>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {config.input1Label}
              </label>
              <input
                type="number"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
                placeholder={config.input1Placeholder}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {config.input2Label}
              </label>
              <input
                type="number"
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
                placeholder={config.input2Placeholder}
                className={`w-full px-4 py-3 rounded-lg border ${
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
              {t('tools.percentageCalculator.calculate', 'Calculate')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.percentageCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.percentageCalculator.bg0d948815', 'bg-[#0D9488]15')
            }`}>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#0D9488] mb-2">
                    {result.value}{mode === 'isWhat' || mode === 'change' ? '%' : ''}
                  </div>
                  <div className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {result.explanation}
                  </div>
                </div>

                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    {t('tools.percentageCalculator.formula', 'Formula:')}
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
              {t('tools.percentageCalculator.examples', 'Examples')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {mode === 'whatIs' && (
                <>
                  <p>• What is 20% of 150? = 30</p>
                  <p>• What is 15% of 200? = 30</p>
                  <p>• What is 50% of 80? = 40</p>
                </>
              )}
              {mode === 'isWhat' && (
                <>
                  <p>• 25 is what % of 100? = 25%</p>
                  <p>• 30 is what % of 150? = 20%</p>
                  <p>• 75 is what % of 300? = 25%</p>
                </>
              )}
              {mode === 'change' && (
                <>
                  <p>• From 100 to 120 = 20% increase</p>
                  <p>• From 200 to 150 = 25% decrease</p>
                  <p>• From 50 to 75 = 50% increase</p>
                </>
              )}
            </div>
          </div>

          {/* Validation Toast */}
          {validationMessage && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
              {validationMessage}
            </div>
          )}

          <ConfirmDialog />
        </div>
      </div>
    </div>
  );
}
