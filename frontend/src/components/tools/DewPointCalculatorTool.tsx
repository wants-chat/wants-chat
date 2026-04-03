import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Thermometer, Info, AlertTriangle, CheckCircle, Wind, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type TemperatureUnit = 'celsius' | 'fahrenheit';

interface DewPointResult {
  dewPoint: number;
  feelsLike: number;
  comfortLevel: string;
  comfortColor: string;
  condensationRisk: string;
  condensationRiskColor: string;
  comfortScore: number;
}

interface DewPointCalculatorToolProps {
  uiConfig?: UIConfig;
}

const DewPointCalculatorTool: React.FC<DewPointCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [temperature, setTemperature] = useState<string>('');
  const [humidity, setHumidity] = useState<string>('');
  const [unit, setUnit] = useState<TemperatureUnit>('fahrenheit');
  const [result, setResult] = useState<DewPointResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setTemperature(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setTemperature(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Magnus-Tetens approximation for dew point calculation
  const calculateDewPoint = (tempC: number, rh: number): number => {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
    return (b * alpha) / (a - alpha);
  };

  // Heat index (feels-like) calculation
  const calculateFeelsLike = (tempF: number, rh: number): number => {
    if (tempF < 80) return tempF;

    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;

    let hi = c1 + (c2 * tempF) + (c3 * rh) + (c4 * tempF * rh) +
             (c5 * tempF * tempF) + (c6 * rh * rh) +
             (c7 * tempF * tempF * rh) + (c8 * tempF * rh * rh) +
             (c9 * tempF * tempF * rh * rh);

    return hi;
  };

  const getComfortLevel = (dewPointF: number): { level: string; color: string; score: number } => {
    if (dewPointF < 50) {
      return { level: 'Very Dry', color: '#3b82f6', score: 10 };
    } else if (dewPointF < 55) {
      return { level: 'Dry & Comfortable', color: '#10b981', score: 30 };
    } else if (dewPointF < 60) {
      return { level: 'Comfortable', color: '#22c55e', score: 50 };
    } else if (dewPointF < 65) {
      return { level: 'Slightly Humid', color: '#eab308', score: 65 };
    } else if (dewPointF < 70) {
      return { level: 'Humid & Uncomfortable', color: '#f97316', score: 80 };
    } else if (dewPointF < 75) {
      return { level: 'Very Humid', color: '#ef4444', score: 90 };
    } else {
      return { level: 'Oppressive', color: '#dc2626', score: 100 };
    }
  };

  const getCondensationRisk = (temp: number, dewPoint: number): { risk: string; color: string } => {
    const diff = temp - dewPoint;
    if (diff <= 2.5) {
      return { risk: 'High - Condensation likely', color: '#ef4444' };
    } else if (diff <= 5) {
      return { risk: 'Moderate - Possible condensation', color: '#f97316' };
    } else if (diff <= 10) {
      return { risk: 'Low - Unlikely', color: '#eab308' };
    } else {
      return { risk: 'Very Low - No risk', color: '#10b981' };
    }
  };

  const celsiusToFahrenheit = (c: number): number => (c * 9/5) + 32;
  const fahrenheitToCelsius = (f: number): number => (f - 32) * 5/9;

  useEffect(() => {
    const temp = parseFloat(temperature);
    const rh = parseFloat(humidity);

    if (!isNaN(temp) && !isNaN(rh) && rh >= 0 && rh <= 100) {
      // Convert to Celsius for calculation
      const tempC = unit === 'celsius' ? temp : fahrenheitToCelsius(temp);
      const tempF = unit === 'fahrenheit' ? temp : celsiusToFahrenheit(temp);

      // Calculate dew point in Celsius
      const dewPointC = calculateDewPoint(tempC, rh);
      const dewPointF = celsiusToFahrenheit(dewPointC);

      // Calculate feels-like in Fahrenheit
      const feelsLikeF = calculateFeelsLike(tempF, rh);
      const feelsLikeC = fahrenheitToCelsius(feelsLikeF);

      // Get comfort level and condensation risk
      const comfort = getComfortLevel(dewPointF);
      const condensation = getCondensationRisk(
        unit === 'fahrenheit' ? temp : tempF,
        dewPointF
      );

      setResult({
        dewPoint: unit === 'celsius' ? dewPointC : dewPointF,
        feelsLike: unit === 'celsius' ? feelsLikeC : feelsLikeF,
        comfortLevel: comfort.level,
        comfortColor: comfort.color,
        condensationRisk: condensation.risk,
        condensationRiskColor: condensation.color,
        comfortScore: comfort.score,
      });
    } else {
      setResult(null);
    }
  }, [temperature, humidity, unit]);

  const getTips = (): string[] => {
    if (!result) return [];

    const tips: string[] = [];
    const dewPointF = unit === 'celsius'
      ? celsiusToFahrenheit(result.dewPoint)
      : result.dewPoint;

    if (dewPointF < 50) {
      tips.push('Use a humidifier to add moisture to the air.');
      tips.push('Keep skin moisturized to prevent dryness.');
      tips.push('Stay hydrated as dry air can cause dehydration.');
    } else if (dewPointF < 60) {
      tips.push('Ideal conditions for outdoor activities.');
      tips.push('Good time for painting or other moisture-sensitive projects.');
    } else if (dewPointF < 65) {
      tips.push('Use dehumidifier in enclosed spaces if needed.');
      tips.push('Good ventilation helps manage humidity.');
    } else if (dewPointF < 70) {
      tips.push('Use air conditioning or dehumidifier indoors.');
      tips.push('Limit strenuous outdoor activities.');
      tips.push('Wear light, breathable clothing.');
    } else {
      tips.push('Stay indoors in air conditioning when possible.');
      tips.push('Avoid strenuous activities and stay hydrated.');
      tips.push('Watch for signs of heat exhaustion.');
      tips.push('Use fans to improve air circulation.');
    }

    if (result.condensationRisk.includes('High') || result.condensationRisk.includes('Moderate')) {
      tips.push('Watch for condensation on windows and cold surfaces.');
      tips.push('Ensure good ventilation to prevent mold growth.');
    }

    return tips;
  };

  const formatTemperature = (value: number): string => {
    return `${value.toFixed(1)}${unit === 'celsius' ? '°C' : '°F'}`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-6 md:p-8`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('tools.dewPointCalculator.dewPointCalculator', 'Dew Point Calculator')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.dewPointCalculator.calculateDewPointComfortLevel', 'Calculate dew point, comfort level, and condensation risk')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.dewPointCalculator.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Unit Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setUnit('fahrenheit')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  unit === 'fahrenheit'
                    ? 'bg-[#0D9488] text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.dewPointCalculator.fahrenheitF', 'Fahrenheit (°F)')}
              </button>
              <button
                onClick={() => setUnit('celsius')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  unit === 'celsius'
                    ? 'bg-[#0D9488] text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.dewPointCalculator.celsiusC', 'Celsius (°C)')}
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Thermometer className="w-4 h-4 inline mr-1" />
                Temperature ({unit === 'celsius' ? '°C' : '°F'})
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder={`Enter temperature in ${unit === 'celsius' ? '°C' : '°F'}`}
                step="0.1"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Droplets className="w-4 h-4 inline mr-1" />
                {t('tools.dewPointCalculator.relativeHumidity', 'Relative Humidity (%)')}
              </label>
              <input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                placeholder={t('tools.dewPointCalculator.enterHumidity0100', 'Enter humidity (0-100)')}
                min="0"
                max="100"
                step="1"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4 mb-6">
              {/* Main Results Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Dew Point Card */}
                <div
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-[#0D9488]" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t('tools.dewPointCalculator.dewPoint2', 'Dew Point')}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#0D9488]">
                    {formatTemperature(result.dewPoint)}
                  </div>
                </div>

                {/* Feels Like Card */}
                <div
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-5 h-5 text-[#0D9488]" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t('tools.dewPointCalculator.feelsLike', 'Feels Like')}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#0D9488]">
                    {formatTemperature(result.feelsLike)}
                  </div>
                </div>
              </div>

              {/* Comfort Level */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${result.comfortColor}15`, borderLeft: `4px solid ${result.comfortColor}` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {result.comfortScore < 50 ? (
                      <CheckCircle className="w-5 h-5" style={{ color: result.comfortColor }} />
                    ) : (
                      <AlertTriangle className="w-5 h-5" style={{ color: result.comfortColor }} />
                    )}
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.dewPointCalculator.comfortLevel', 'Comfort Level')}
                    </span>
                  </div>
                  <span className="font-bold text-lg" style={{ color: result.comfortColor }}>
                    {result.comfortLevel}
                  </span>
                </div>
                {/* Visual Comfort Scale */}
                <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${result.comfortScore}%`,
                      background: `linear-gradient(to right, #10b981, #eab308, #ef4444)`,
                    }}
                  />
                </div>
                <div className={`flex justify-between text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>{t('tools.dewPointCalculator.dry', 'Dry')}</span>
                  <span>{t('tools.dewPointCalculator.comfortable', 'Comfortable')}</span>
                  <span>{t('tools.dewPointCalculator.oppressive', 'Oppressive')}</span>
                </div>
              </div>

              {/* Condensation Risk */}
              <div
                className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" style={{ color: result.condensationRiskColor }} />
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.dewPointCalculator.condensationRisk', 'Condensation Risk')}
                    </span>
                  </div>
                  <span className="font-semibold" style={{ color: result.condensationRiskColor }}>
                    {result.condensationRisk}
                  </span>
                </div>
              </div>

              {/* Tips */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.dewPointCalculator.tipsRecommendations', 'Tips & Recommendations')}
                </h3>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {getTips().map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#0D9488] mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Explanation Section */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.dewPointCalculator.whatIsDewPoint', 'What is Dew Point?')}
              </span>
            </div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {showExplanation ? '-' : '+'}
            </span>
          </button>

          {showExplanation && (
            <div className={`mt-2 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  <strong>{t('tools.dewPointCalculator.dewPoint', 'Dew Point')}</strong> is the temperature at which air becomes saturated with water vapor
                  and condensation begins to form. It's a key indicator of humidity comfort.
                </p>
                <p>
                  Unlike relative humidity, dew point gives an absolute measure of moisture in the air.
                  A dew point of 65°F (18°C) feels the same regardless of the actual temperature.
                </p>
                <div className="mt-4">
                  <p className="font-semibold mb-2">{t('tools.dewPointCalculator.dewPointComfortGuide', 'Dew Point Comfort Guide:')}</p>
                  <ul className="space-y-1">
                    <li><span className="text-blue-500">Below 50°F (10°C)</span> - Very dry, may cause discomfort</li>
                    <li><span className="text-green-500">50-59°F (10-15°C)</span> - Dry and comfortable</li>
                    <li><span className="text-green-400">60-64°F (15-18°C)</span> - Comfortable for most</li>
                    <li><span className="text-yellow-500">65-69°F (18-21°C)</span> - Starting to feel humid</li>
                    <li><span className="text-orange-500">70-74°F (21-23°C)</span> - Uncomfortable, muggy</li>
                    <li><span className="text-red-500">75°F+ (24°C+)</span> - Oppressive, high discomfort</li>
                  </ul>
                </div>
                <p className="mt-3 text-xs">
                  {t('tools.dewPointCalculator.thisCalculatorUsesTheMagnus', 'This calculator uses the Magnus-Tetens approximation formula for accurate dew point estimation.')}
                </p>
              </div>
            </div>
          )}

          {/* Reference Table */}
          <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.dewPointCalculator.quickReference', 'Quick Reference')}
            </h3>
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="text-center p-2 rounded bg-blue-500/10">
                <div className="text-blue-500 font-semibold">&lt;50°F</div>
                <div className="text-xs">{t('tools.dewPointCalculator.veryDry', 'Very Dry')}</div>
              </div>
              <div className="text-center p-2 rounded bg-green-500/10">
                <div className="text-green-500 font-semibold">50-60°F</div>
                <div className="text-xs">{t('tools.dewPointCalculator.comfortable2', 'Comfortable')}</div>
              </div>
              <div className="text-center p-2 rounded bg-yellow-500/10">
                <div className="text-yellow-500 font-semibold">60-70°F</div>
                <div className="text-xs">{t('tools.dewPointCalculator.humid', 'Humid')}</div>
              </div>
              <div className="text-center p-2 rounded bg-red-500/10">
                <div className="text-red-500 font-semibold">&gt;70°F</div>
                <div className="text-xs">{t('tools.dewPointCalculator.oppressive2', 'Oppressive')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DewPointCalculatorTool };
export default DewPointCalculatorTool;
