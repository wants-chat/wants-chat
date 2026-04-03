import React, { useState, useEffect } from 'react';
import { Calculator, Info, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type UnitSystem = 'metric' | 'imperial';
type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

interface BmiResult {
  value: number;
  category: BmiCategory;
  categoryText: string;
  color: string;
}

interface BmiCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function BmiCalculatorTool({ uiConfig }: BmiCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { ConfirmDialog } = useConfirmDialog();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [result, setResult] = useState<BmiResult | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Extract weight and height from content or numbers array
      if (params.numbers && params.numbers.length >= 2) {
        setHeightCm(params.numbers[0].toString());
        setWeightKg(params.numbers[1].toString());
        setIsPrefilled(true);
      } else if (params.amount) {
        setWeightKg(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateBMI = () => {
    let heightInMeters: number;
    let weightInKg: number;

    if (unitSystem === 'metric') {
      const height = parseFloat(heightCm);
      const weight = parseFloat(weightKg);

      if (!height || !weight || height <= 0 || weight <= 0) {
        setValidationMessage('Please enter valid height and weight values');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }

      heightInMeters = height / 100;
      weightInKg = weight;
    } else {
      const feet = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const weight = parseFloat(weightLbs);

      if ((feet === 0 && inches === 0) || !weight || weight <= 0) {
        setValidationMessage('Please enter valid height and weight values');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }

      const totalInches = (feet * 12) + inches;
      heightInMeters = totalInches * 0.0254;
      weightInKg = weight * 0.453592;
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);

    let category: BmiCategory;
    let categoryText: string;
    let color: string;

    if (bmi < 18.5) {
      category = 'underweight';
      categoryText = 'Underweight';
      color = '#3b82f6';
    } else if (bmi < 25) {
      category = 'normal';
      categoryText = 'Normal Weight';
      color = '#10b981';
    } else if (bmi < 30) {
      category = 'overweight';
      categoryText = 'Overweight';
      color = '#f59e0b';
    } else {
      category = 'obese';
      categoryText = 'Obese';
      color = '#ef4444';
    }

    setResult({
      value: parseFloat(bmi.toFixed(1)),
      category,
      categoryText,
      color
    });
  };

  const reset = () => {
    setHeightCm('');
    setHeightFt('');
    setHeightIn('');
    setWeightKg('');
    setWeightLbs('');
    setResult(null);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.bmiCalculator.bmiCalculator', 'BMI Calculator')}
            </h1>
          </div>

          {/* Prefill indicator */}
          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.bmiCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
            </div>
          )}

          {/* Unit System Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  unitSystem === 'metric'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.bmiCalculator.metricCmKg', 'Metric (cm, kg)')}
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  unitSystem === 'imperial'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.bmiCalculator.imperialFtInLbs', 'Imperial (ft, in, lbs)')}
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {unitSystem === 'metric' ? (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.bmiCalculator.heightCm', 'Height (cm)')}
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder={t('tools.bmiCalculator.enterHeightInCentimeters', 'Enter height in centimeters')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.bmiCalculator.weightKg', 'Weight (kg)')}
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder={t('tools.bmiCalculator.enterWeightInKilograms', 'Enter weight in kilograms')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.bmiCalculator.height', 'Height')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      placeholder={t('tools.bmiCalculator.feet', 'Feet')}
                      className={`flex-1 px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                    <input
                      type="number"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      placeholder={t('tools.bmiCalculator.inches', 'Inches')}
                      className={`flex-1 px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.bmiCalculator.weightLbs', 'Weight (lbs)')}
                  </label>
                  <input
                    type="number"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(e.target.value)}
                    placeholder={t('tools.bmiCalculator.enterWeightInPounds', 'Enter weight in pounds')}
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
              onClick={calculateBMI}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.bmiCalculator.calculateBmi', 'Calculate BMI')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.bmiCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div
              className="p-6 rounded-lg mb-6"
              style={{ backgroundColor: `${result.color}15`, borderLeft: `4px solid ${result.color}` }}
            >
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{ color: result.color }}>
                  {result.value}
                </div>
                <div className="text-xl font-semibold mb-1" style={{ color: result.color }}>
                  {result.categoryText}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.bmiCalculator.bodyMassIndex', 'Body Mass Index')}
                </div>
              </div>
            </div>
          )}

          {/* BMI Categories Reference */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.bmiCalculator.bmiCategories', 'BMI Categories')}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.bmiCalculator.underweight', 'Underweight')}</span>
                <span className="font-medium" style={{ color: '#3b82f6' }}>&lt; 18.5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.bmiCalculator.normalWeight', 'Normal Weight')}</span>
                <span className="font-medium" style={{ color: '#10b981' }}>18.5 - 24.9</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.bmiCalculator.overweight', 'Overweight')}</span>
                <span className="font-medium" style={{ color: '#f59e0b' }}>25 - 29.9</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.bmiCalculator.obese', 'Obese')}</span>
                <span className="font-medium" style={{ color: '#ef4444' }}>&ge; 30</span>
              </div>
            </div>
          </div>

          {/* Formula Explanation */}
          <button
            onClick={() => setShowFormula(!showFormula)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.bmiCalculator.bmiFormula', 'BMI Formula')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showFormula ? '−' : '+'}
            </span>
          </button>

          {showFormula && (
            <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="font-semibold">{t('tools.bmiCalculator.metricFormula', 'Metric Formula:')}</p>
                <p className="font-mono">BMI = weight (kg) / height² (m²)</p>
                <p className="font-semibold mt-3">{t('tools.bmiCalculator.imperialFormula', 'Imperial Formula:')}</p>
                <p className="font-mono">BMI = (weight (lbs) / height² (in²)) × 703</p>
                <p className="mt-3 text-xs">
                  Note: BMI is a screening tool and should not be used as a diagnostic tool.
                  Consult with a healthcare provider for a comprehensive health assessment.
                </p>
              </div>
            </div>
          )}

          {/* Validation Toast */}
          {validationMessage && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
              {validationMessage}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog />
    </div>
  );
}
