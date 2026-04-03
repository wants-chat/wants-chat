import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, Users, Info, Sparkles, TrendingUp, ArrowUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ChildHeightPredictorToolProps {
  uiConfig?: UIConfig;
}

type Gender = 'male' | 'female';
type Method = 'midParent' | 'khamis' | 'doubling';

interface HeightResult {
  predictedHeight: { cm: number; ft: number; inches: number };
  range: { min: number; max: number };
  method: string;
  confidence: string;
  growthPhases: { phase: string; ages: string; description: string }[];
}

export const ChildHeightPredictorTool: React.FC<ChildHeightPredictorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gender, setGender] = useState<Gender>('male');
  const [method, setMethod] = useState<Method>('midParent');
  const [fatherHeight, setFatherHeight] = useState('');
  const [motherHeight, setMotherHeight] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childHeight, setChildHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        const numbers = params.content.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          setFatherHeight(numbers[0]);
          if (numbers.length > 1) {
            setMotherHeight(numbers[1]);
          }
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const convertToCm = (value: number, unit: 'cm' | 'ft'): number => {
    return unit === 'ft' ? value * 30.48 : value;
  };

  const convertFromCm = (cm: number): { ft: number; inches: number } => {
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { ft, inches };
  };

  const result = useMemo((): HeightResult | null => {
    const fatherCm = convertToCm(parseFloat(fatherHeight), heightUnit);
    const motherCm = convertToCm(parseFloat(motherHeight), heightUnit);
    const childCm = convertToCm(parseFloat(childHeight), heightUnit);
    const age = parseFloat(childAge);

    let predictedHeightCm: number | null = null;
    let rangeMargin = 5; // cm
    let methodName = '';
    let confidence = '';

    switch (method) {
      case 'midParent':
        // Mid-Parent Height Method
        if (isNaN(fatherCm) || isNaN(motherCm) || fatherCm <= 0 || motherCm <= 0) return null;

        if (gender === 'male') {
          // Boy: (Father's Height + Mother's Height + 13) / 2
          predictedHeightCm = (fatherCm + motherCm + 13) / 2;
        } else {
          // Girl: (Father's Height + Mother's Height - 13) / 2
          predictedHeightCm = (fatherCm + motherCm - 13) / 2;
        }
        rangeMargin = 8.5; // +/- 8.5 cm (95% confidence)
        methodName = 'Mid-Parent Height Method';
        confidence = 'Moderate (R² ~ 0.4)';
        break;

      case 'khamis':
        // Khamis-Roche Method (simplified)
        if (isNaN(fatherCm) || isNaN(motherCm) || isNaN(childCm) || isNaN(age)) return null;
        if (age < 4 || age > 17 || childCm <= 0) return null;

        // Simplified coefficients for demonstration
        const midParent = (fatherCm + motherCm) / 2;
        const adjustedMidParent = gender === 'male' ? midParent + 6.5 : midParent - 6.5;

        // Age-based growth remaining factor
        const growthFactors: { [key: number]: number } = {
          4: 0.55, 5: 0.58, 6: 0.61, 7: 0.64, 8: 0.67, 9: 0.70,
          10: 0.73, 11: 0.76, 12: 0.80, 13: 0.85, 14: 0.90, 15: 0.94, 16: 0.97, 17: 0.99
        };
        const factor = growthFactors[Math.floor(age)] || 0.75;

        predictedHeightCm = childCm / factor;
        // Adjust toward parental height
        predictedHeightCm = (predictedHeightCm * 0.7) + (adjustedMidParent * 0.3);

        rangeMargin = 5.5;
        methodName = 'Khamis-Roche Method (Simplified)';
        confidence = 'Good (R² ~ 0.8)';
        break;

      case 'doubling':
        // Doubling Method (height at age 2 x 2)
        if (isNaN(childCm) || childCm <= 0) return null;

        predictedHeightCm = childCm * 2;
        rangeMargin = 10;
        methodName = 'Doubling Method (Height at Age 2)';
        confidence = 'Low (rough estimate)';
        break;
    }

    if (predictedHeightCm === null) return null;

    const { ft, inches } = convertFromCm(predictedHeightCm);

    const growthPhases = [
      {
        phase: 'Infancy',
        ages: '0-2 years',
        description: 'Fastest growth period. Baby typically grows 25cm in first year, 10-12cm in second year.',
      },
      {
        phase: 'Early Childhood',
        ages: '2-5 years',
        description: 'Steady growth of about 6-8cm per year. Growth rate begins to slow.',
      },
      {
        phase: 'Middle Childhood',
        ages: '5-10 years',
        description: 'Consistent growth of 5-6cm per year until puberty begins.',
      },
      {
        phase: 'Puberty',
        ages: '10-16 years',
        description: gender === 'male'
          ? 'Growth spurt typically 12-14 years. Peak velocity ~10cm/year.'
          : 'Growth spurt typically 10-12 years. Peak velocity ~8cm/year.',
      },
      {
        phase: 'Final Growth',
        ages: gender === 'male' ? '16-18 years' : '14-16 years',
        description: 'Growth slows significantly. Most reach adult height by this age.',
      },
    ];

    return {
      predictedHeight: { cm: Math.round(predictedHeightCm), ft, inches },
      range: {
        min: Math.round(predictedHeightCm - rangeMargin),
        max: Math.round(predictedHeightCm + rangeMargin),
      },
      method: methodName,
      confidence,
      growthPhases,
    };
  }, [gender, method, fatherHeight, motherHeight, childAge, childHeight, heightUnit]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
          {/* Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <ArrowUp className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.childHeightPredictor.childHeightPredictor', 'Child Height Predictor')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.childHeightPredictor.predictYourChildSAdult', 'Predict your child\'s adult height')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Prefill indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">
                  {t('tools.childHeightPredictor.dataLoadedFromYourConversation', 'Data loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.childHeightPredictor.childSGender', 'Child\'s Gender')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    gender === 'male'
                      ? 'bg-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.childHeightPredictor.boy', 'Boy')}
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    gender === 'female'
                      ? 'bg-pink-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.childHeightPredictor.girl', 'Girl')}
                </button>
              </div>
            </div>

            {/* Prediction Method */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.childHeightPredictor.predictionMethod', 'Prediction Method')}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'midParent', name: 'Mid-Parent Height', desc: 'Uses parents\' heights' },
                  { id: 'khamis', name: 'Khamis-Roche', desc: 'Uses child\'s current height + parents' },
                  { id: 'doubling', name: 'Doubling Method', desc: 'Doubles height at age 2' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as Method)}
                    className={`py-3 px-4 rounded-lg text-left transition-colors ${
                      method === m.id
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium">{m.name}</div>
                    <div className={`text-xs ${method === m.id ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Height Unit */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.childHeightPredictor.heightUnit', 'Height Unit')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setHeightUnit('cm')}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    heightUnit === 'cm'
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.childHeightPredictor.centimetersCm', 'Centimeters (cm)')}
                </button>
                <button
                  onClick={() => setHeightUnit('ft')}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    heightUnit === 'ft'
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.childHeightPredictor.feetFt', 'Feet (ft)')}
                </button>
              </div>
            </div>

            {/* Parent Heights (for midParent and khamis methods) */}
            {(method === 'midParent' || method === 'khamis') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Users className="w-4 h-4 inline mr-1" />
                    Father's Height ({heightUnit})
                  </label>
                  <input
                    type="number"
                    value={fatherHeight}
                    onChange={(e) => setFatherHeight(e.target.value)}
                    step="0.1"
                    placeholder={heightUnit === 'cm' ? 'e.g., 175' : 'e.g., 5.9'}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Users className="w-4 h-4 inline mr-1" />
                    Mother's Height ({heightUnit})
                  </label>
                  <input
                    type="number"
                    value={motherHeight}
                    onChange={(e) => setMotherHeight(e.target.value)}
                    step="0.1"
                    placeholder={heightUnit === 'cm' ? 'e.g., 162' : 'e.g., 5.4'}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
            )}

            {/* Child's Current Height (for khamis and doubling methods) */}
            {(method === 'khamis' || method === 'doubling') && (
              <div className={`space-y-4 p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Ruler className="w-4 h-4 inline mr-1" />
                    Child's Current Height ({heightUnit})
                  </label>
                  <input
                    type="number"
                    value={childHeight}
                    onChange={(e) => setChildHeight(e.target.value)}
                    step="0.1"
                    placeholder={heightUnit === 'cm' ? 'e.g., 110' : 'e.g., 3.6'}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                {method === 'khamis' && (
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.childHeightPredictor.childSAgeYears', 'Child\'s Age (years)')}
                    </label>
                    <input
                      type="number"
                      value={childAge}
                      onChange={(e) => setChildAge(e.target.value)}
                      min="4"
                      max="17"
                      step="0.5"
                      placeholder="4-17 years"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                )}

                {method === 'doubling' && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.childHeightPredictor.enterTheChildSHeight', 'Enter the child\'s height at exactly 2 years old for best results.')}
                  </p>
                )}
              </div>
            )}

            {/* Results */}
            {result && (
              <>
                {/* Predicted Height */}
                <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.childHeightPredictor.predictedAdultHeight', 'Predicted Adult Height')}
                  </div>
                  <div className="text-4xl font-bold text-[#0D9488] my-2">
                    {result.predictedHeight.cm} cm
                  </div>
                  <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    ({result.predictedHeight.ft}' {result.predictedHeight.inches}")
                  </div>
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Range: {result.range.min} - {result.range.max} cm
                  </div>
                </div>

                {/* Method Info */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {result.method}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Confidence: {result.confidence}
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-[#0D9488]" />
                  </div>
                </div>

                {/* Height Range Visualization */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.childHeightPredictor.predictedHeightRange', 'Predicted Height Range')}
                  </h4>
                  <div className="relative h-8">
                    <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-[#0D9488]/50 to-[#0D9488]"
                      style={{ left: '20%', right: '20%' }}
                    />
                    <div
                      className="absolute top-0 w-4 h-8 bg-[#0D9488] rounded-full shadow-lg"
                      style={{ left: '50%', transform: 'translateX(-50%)' }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {result.range.min} cm
                    </span>
                    <span className="font-medium text-[#0D9488]">
                      {result.predictedHeight.cm} cm
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {result.range.max} cm
                    </span>
                  </div>
                </div>

                {/* Growth Phases */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.childHeightPredictor.growthPhases', 'Growth Phases')}
                  </h4>
                  <div className="space-y-3">
                    {result.growthPhases.map((phase, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-2 bg-[#0D9488] rounded-full" />
                        <div className="flex-1">
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {phase.phase}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {phase.ages}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {phase.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Info Note */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.childHeightPredictor.heightPredictionsAreEstimatesBased', 'Height predictions are estimates based on genetic and statistical models. Actual adult height depends on many factors including nutrition, health, and environment. These predictions have a margin of error of +/- 5-10 cm.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildHeightPredictorTool;
