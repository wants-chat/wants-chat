import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Copy, Check, User, Users, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface IdealWeightToolProps {
  uiConfig?: UIConfig;
}

type Gender = 'male' | 'female';
type Unit = 'metric' | 'imperial';

export const IdealWeightTool: React.FC<IdealWeightToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [gender, setGender] = useState<Gender>('male');
  const [unit, setUnit] = useState<Unit>('imperial');
  const [height, setHeight] = useState('70');
  const [currentWeight, setCurrentWeight] = useState('180');
  const [copied, setCopied] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 1) {
        setHeight(params.numbers[0].toString());
        if (params.numbers.length >= 2) {
          setCurrentWeight(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      } else if (params.amount) {
        setCurrentWeight(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const results = useMemo(() => {
    let heightInches = parseFloat(height) || 0;

    // Convert to inches if metric
    if (unit === 'metric') {
      heightInches = heightInches / 2.54;
    }

    if (heightInches < 48 || heightInches > 96) return null;

    const heightOver5ft = Math.max(0, heightInches - 60);

    // Different formulas for ideal weight
    const formulas: Record<string, { male: number; female: number }> = {
      // Robinson Formula (1983)
      robinson: {
        male: 52 + 1.9 * heightOver5ft,
        female: 49 + 1.7 * heightOver5ft,
      },
      // Miller Formula (1983)
      miller: {
        male: 56.2 + 1.41 * heightOver5ft,
        female: 53.1 + 1.36 * heightOver5ft,
      },
      // Devine Formula (1974)
      devine: {
        male: 50 + 2.3 * heightOver5ft,
        female: 45.5 + 2.3 * heightOver5ft,
      },
      // Hamwi Formula (1964)
      hamwi: {
        male: 48 + 2.7 * heightOver5ft,
        female: 45.5 + 2.2 * heightOver5ft,
      },
    };

    // Calculate all results in kg
    const weights = Object.entries(formulas).map(([name, formula]) => ({
      name,
      weight: formula[gender],
    }));

    // Calculate average
    const average = weights.reduce((sum, w) => sum + w.weight, 0) / weights.length;

    // Healthy BMI range (18.5 - 24.9)
    const heightMeters = heightInches * 0.0254;
    const healthyMin = 18.5 * (heightMeters ** 2);
    const healthyMax = 24.9 * (heightMeters ** 2);

    // Current weight in kg
    let currentWeightKg = parseFloat(currentWeight) || 0;
    if (unit === 'imperial') {
      currentWeightKg = currentWeightKg * 0.453592;
    }

    const difference = currentWeightKg - average;

    return {
      weights,
      average,
      healthyMin,
      healthyMax,
      currentWeightKg,
      difference,
    };
  }, [gender, unit, height, currentWeight]);

  const handleCopy = () => {
    if (results) {
      const weightStr = unit === 'imperial'
        ? `${(results.average * 2.20462).toFixed(1)} lbs`
        : `${results.average.toFixed(1)} kg`;
      navigator.clipboard.writeText(`Ideal Weight: ${weightStr}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatWeight = (kg: number) => {
    if (unit === 'imperial') {
      return `${(kg * 2.20462).toFixed(1)} lbs`;
    }
    return `${kg.toFixed(1)} kg`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.idealWeight.idealWeightCalculator', 'Ideal Weight Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.idealWeight.calculateYourIdealBodyWeight', 'Calculate your ideal body weight')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-emerald-500 font-medium">{t('tools.idealWeight.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Gender & Unit Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.idealWeight.gender', 'Gender')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  gender === 'male'
                    ? 'bg-emerald-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <User className="w-4 h-4" /> Male
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  gender === 'female'
                    ? 'bg-emerald-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Users className="w-4 h-4" /> Female
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.idealWeight.units', 'Units')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setUnit('imperial')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  unit === 'imperial'
                    ? 'bg-emerald-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.idealWeight.imperial', 'Imperial')}
              </button>
              <button
                onClick={() => setUnit('metric')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  unit === 'metric'
                    ? 'bg-emerald-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.idealWeight.metric', 'Metric')}
              </button>
            </div>
          </div>
        </div>

        {/* Height & Current Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Height ({unit === 'imperial' ? 'inches' : 'cm'})
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={unit === 'imperial' ? '70' : '178'}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {unit === 'imperial' && (
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {Math.floor((parseFloat(height) || 0) / 12)}'{((parseFloat(height) || 0) % 12).toFixed(0)}"
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Current Weight ({unit === 'imperial' ? 'lbs' : 'kg'}) <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              placeholder={unit === 'imperial' ? '180' : '82'}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Results */}
        {results && (
          <>
            {/* Main Result */}
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.idealWeight.recommendedIdealWeight', 'Recommended Ideal Weight')}</div>
              <div className={`text-5xl font-bold text-emerald-500 my-2`}>
                {formatWeight(results.average)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Healthy Range: {formatWeight(results.healthyMin)} - {formatWeight(results.healthyMax)}
              </div>
              <button
                onClick={handleCopy}
                className={`mt-2 p-1 rounded transition-colors ${
                  copied ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {copied ? <Check className="w-5 h-5 inline" /> : <Copy className="w-5 h-5 inline" />}
              </button>
            </div>

            {/* Difference from Current */}
            {currentWeight && (
              <div className={`p-4 rounded-lg text-center ${
                Math.abs(results.difference) < 2.5
                  ? 'bg-green-500/10 text-green-500'
                  : results.difference > 0
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-blue-500/10 text-blue-500'
              }`}>
                {Math.abs(results.difference) < 2.5 ? (
                  <span>{t('tools.idealWeight.youReAtYourIdeal', 'You\'re at your ideal weight!')}</span>
                ) : results.difference > 0 ? (
                  <span>
                    <strong>{formatWeight(Math.abs(results.difference))}</strong> over ideal weight
                  </span>
                ) : (
                  <span>
                    <strong>{formatWeight(Math.abs(results.difference))}</strong> under ideal weight
                  </span>
                )}
              </div>
            )}

            {/* Formula Breakdown */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.idealWeight.byFormula', 'By Formula')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {results.weights.map((w) => (
                  <div key={w.name} className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatWeight(w.weight)}
                    </div>
                    <div className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {w.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.idealWeight.note', 'Note:')}</strong> These formulas provide estimates only.
            Ideal weight varies based on body composition, muscle mass, and individual factors.
            Consult a healthcare professional for personalized advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IdealWeightTool;
