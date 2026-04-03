import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Copy, Check, User, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Gender = 'male' | 'female';
type Unit = 'metric' | 'imperial';

interface BodyFatCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const BodyFatCalculatorTool: React.FC<BodyFatCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gender, setGender] = useState<Gender>('male');
  const [unit, setUnit] = useState<Unit>('imperial');
  const [waist, setWaist] = useState('34');
  const [neck, setNeck] = useState('15');
  const [hip, setHip] = useState('38');
  const [height, setHeight] = useState('70');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        gender?: string;
        unit?: string;
        waist?: string | number;
        neck?: string | number;
        hip?: string | number;
        height?: string | number;
      };
      if (params.gender && (params.gender === 'male' || params.gender === 'female')) {
        setGender(params.gender);
      }
      if (params.unit) setUnit(params.unit as Unit);
      if (params.waist) setWaist(String(params.waist));
      if (params.neck) setNeck(String(params.neck));
      if (params.hip) setHip(String(params.hip));
      if (params.height) setHeight(String(params.height));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const result = useMemo(() => {
    let waistCm = parseFloat(waist) || 0;
    let neckCm = parseFloat(neck) || 0;
    let hipCm = parseFloat(hip) || 0;
    let heightCm = parseFloat(height) || 0;

    // Convert if imperial
    if (unit === 'imperial') {
      waistCm *= 2.54;
      neckCm *= 2.54;
      hipCm *= 2.54;
      heightCm *= 2.54;
    }

    if (waistCm <= 0 || neckCm <= 0 || heightCm <= 0) return null;
    if (gender === 'female' && hipCm <= 0) return null;

    let bodyFat: number;

    // US Navy Body Fat Formula
    if (gender === 'male') {
      // Men: %BF = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
      bodyFat = 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
    } else {
      // Women: %BF = 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
      bodyFat = 163.205 * Math.log10(waistCm + hipCm - neckCm) - 97.684 * Math.log10(heightCm) - 78.387;
    }

    bodyFat = Math.max(0, Math.min(bodyFat, 60)); // Clamp to reasonable range

    // Category determination
    let category: string;
    let categoryColor: string;

    if (gender === 'male') {
      if (bodyFat < 6) { category = 'Essential Fat'; categoryColor = 'red'; }
      else if (bodyFat < 14) { category = 'Athletes'; categoryColor = 'green'; }
      else if (bodyFat < 18) { category = 'Fitness'; categoryColor = 'blue'; }
      else if (bodyFat < 25) { category = 'Average'; categoryColor = 'yellow'; }
      else { category = 'Obese'; categoryColor = 'red'; }
    } else {
      if (bodyFat < 14) { category = 'Essential Fat'; categoryColor = 'red'; }
      else if (bodyFat < 21) { category = 'Athletes'; categoryColor = 'green'; }
      else if (bodyFat < 25) { category = 'Fitness'; categoryColor = 'blue'; }
      else if (bodyFat < 32) { category = 'Average'; categoryColor = 'yellow'; }
      else { category = 'Obese'; categoryColor = 'red'; }
    }

    return { bodyFat: bodyFat.toFixed(1), category, categoryColor };
  }, [gender, unit, waist, neck, hip, height]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(`Body Fat: ${result.bodyFat}% (${result.category})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const categories = gender === 'male'
    ? [
      { name: 'Essential Fat', range: '2-5%', color: 'gray' },
      { name: 'Athletes', range: '6-13%', color: 'green' },
      { name: 'Fitness', range: '14-17%', color: 'blue' },
      { name: 'Average', range: '18-24%', color: 'yellow' },
      { name: 'Obese', range: '25%+', color: 'red' },
    ]
    : [
      { name: 'Essential Fat', range: '10-13%', color: 'gray' },
      { name: 'Athletes', range: '14-20%', color: 'green' },
      { name: 'Fitness', range: '21-24%', color: 'blue' },
      { name: 'Average', range: '25-31%', color: 'yellow' },
      { name: 'Obese', range: '32%+', color: 'red' },
    ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Scale className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bodyFatCalculator.bodyFatCalculator', 'Body Fat Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bodyFatCalculator.estimateBodyFatUsingUs', 'Estimate body fat using US Navy method')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Gender & Unit Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.bodyFatCalculator.gender', 'Gender')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  gender === 'male'
                    ? 'bg-amber-500 text-white'
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
                    ? 'bg-amber-500 text-white'
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
              {t('tools.bodyFatCalculator.units', 'Units')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setUnit('imperial')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  unit === 'imperial'
                    ? 'bg-amber-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.bodyFatCalculator.inches', 'Inches')}
              </button>
              <button
                onClick={() => setUnit('metric')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  unit === 'metric'
                    ? 'bg-amber-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.bodyFatCalculator.centimeters', 'Centimeters')}
              </button>
            </div>
          </div>
        </div>

        {/* Measurements */}
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
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Neck ({unit === 'imperial' ? 'inches' : 'cm'})
            </label>
            <input
              type="number"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
              placeholder={unit === 'imperial' ? '15' : '38'}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Waist ({unit === 'imperial' ? 'inches' : 'cm'})
            </label>
            <input
              type="number"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder={unit === 'imperial' ? '34' : '86'}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          {gender === 'female' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Hip ({unit === 'imperial' ? 'inches' : 'cm'})
              </label>
              <input
                type="number"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                placeholder={unit === 'imperial' ? '38' : '97'}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'} border`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.bodyFatCalculator.estimatedBodyFat', 'Estimated Body Fat')}</div>
            <div className={`text-5xl font-bold text-amber-500 my-2`}>
              {result.bodyFat}%
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              result.categoryColor === 'green' ? 'bg-green-500/20 text-green-500' :
              result.categoryColor === 'blue' ? 'bg-blue-500/20 text-blue-500' :
              result.categoryColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {result.category}
            </div>
            <button
              onClick={handleCopy}
              className={`ml-2 p-1 rounded transition-colors ${
                copied ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {copied ? <Check className="w-5 h-5 inline" /> : <Copy className="w-5 h-5 inline" />}
            </button>
          </div>
        )}

        {/* Category Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {gender === 'male' ? "Men's" : "Women's"} Body Fat Categories
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {categories.map((cat) => (
              <div key={cat.name} className="text-center">
                <div className={`h-2 rounded-full mb-1 ${
                  cat.color === 'green' ? 'bg-green-500' :
                  cat.color === 'blue' ? 'bg-blue-500' :
                  cat.color === 'yellow' ? 'bg-yellow-500' :
                  cat.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <div className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{cat.name}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{cat.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.bodyFatCalculator.howToMeasure', 'How to measure:')}</strong> Waist at navel level, neck at narrowest point,
            hip at widest point (women). Keep tape parallel to floor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BodyFatCalculatorTool;
