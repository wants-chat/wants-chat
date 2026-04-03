import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wind, Thermometer, AlertTriangle, Snowflake, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface WindChillResult {
  windChill: number;
  frostbiteRisk: 'low' | 'moderate' | 'high' | 'very-high';
  frostbiteTime: string;
  recommendations: string[];
}

interface WindChillToolProps {
  uiConfig?: UIConfig;
}

export const WindChillTool: React.FC<WindChillToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [temperature, setTemperature] = useState<string>('');

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
        const numMatch = textContent.match(/-?[\d.]+/);
        if (numMatch) {
          setTemperature(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [windSpeed, setWindSpeed] = useState<string>('');
  const [windUnit, setWindUnit] = useState<'mph' | 'kmh'>('mph');

  // Convert temperature to Fahrenheit for calculation
  const toFahrenheit = (temp: number, unit: 'F' | 'C'): number => {
    return unit === 'C' ? (temp * 9) / 5 + 32 : temp;
  };

  // Convert Fahrenheit to display unit
  const fromFahrenheit = (temp: number, unit: 'F' | 'C'): number => {
    return unit === 'C' ? ((temp - 32) * 5) / 9 : temp;
  };

  // Convert wind speed to mph for calculation
  const toMph = (speed: number, unit: 'mph' | 'kmh'): number => {
    return unit === 'kmh' ? speed * 0.621371 : speed;
  };

  // Calculate wind chill using NWS formula
  const calculateWindChill = useMemo((): WindChillResult | null => {
    const temp = parseFloat(temperature);
    const wind = parseFloat(windSpeed);

    if (isNaN(temp) || isNaN(wind) || wind < 0) {
      return null;
    }

    const tempF = toFahrenheit(temp, tempUnit);
    const windMph = toMph(wind, windUnit);

    // NWS Wind Chill Formula is valid for temps at or below 50F and wind speeds above 3 mph
    if (tempF > 50 || windMph < 3) {
      // Return actual temperature if outside valid range
      const windChillDisplay = fromFahrenheit(tempF, tempUnit);
      return {
        windChill: Math.round(windChillDisplay * 10) / 10,
        frostbiteRisk: 'low',
        frostbiteTime: 'N/A - Conditions outside wind chill calculation range',
        recommendations: [
          tempF > 50
            ? 'Temperature is above 50°F (10°C) - wind chill effect is minimal'
            : 'Wind speed is below 3 mph - wind chill effect is minimal',
        ],
      };
    }

    // NWS Wind Chill Formula
    const windChillF =
      35.74 +
      0.6215 * tempF -
      35.75 * Math.pow(windMph, 0.16) +
      0.4275 * tempF * Math.pow(windMph, 0.16);

    const windChillDisplay = fromFahrenheit(windChillF, tempUnit);

    // Determine frostbite risk based on wind chill (in Fahrenheit)
    let frostbiteRisk: 'low' | 'moderate' | 'high' | 'very-high';
    let frostbiteTime: string;
    const recommendations: string[] = [];

    if (windChillF > 0) {
      frostbiteRisk = 'low';
      frostbiteTime = 'Low risk of frostbite';
      recommendations.push('Dress warmly with layers');
      recommendations.push('Cover exposed skin when outdoors for extended periods');
    } else if (windChillF > -18) {
      frostbiteRisk = 'moderate';
      frostbiteTime = 'Frostbite possible in 30 minutes';
      recommendations.push('Limit time outdoors');
      recommendations.push('Wear insulated, layered clothing');
      recommendations.push('Cover all exposed skin');
      recommendations.push('Watch for signs of frostbite: numbness, white/gray skin');
    } else if (windChillF > -32) {
      frostbiteRisk = 'high';
      frostbiteTime = 'Frostbite possible in 10 minutes';
      recommendations.push('Avoid prolonged outdoor exposure');
      recommendations.push('Wear multiple insulated layers');
      recommendations.push('Use face mask and insulated gloves');
      recommendations.push('Keep emergency supplies in vehicle');
      recommendations.push('Check on vulnerable neighbors');
    } else {
      frostbiteRisk = 'very-high';
      frostbiteTime = 'Frostbite possible in 5 minutes or less';
      recommendations.push('DANGER: Stay indoors if possible');
      recommendations.push('If you must go out, cover ALL exposed skin');
      recommendations.push('Limit outdoor time to absolute minimum');
      recommendations.push('Have emergency heating backup');
      recommendations.push('Never leave vehicle if stranded - stay inside');
      recommendations.push('Call for help rather than walking in these conditions');
    }

    return {
      windChill: Math.round(windChillDisplay * 10) / 10,
      frostbiteRisk,
      frostbiteTime,
      recommendations,
    };
  }, [temperature, tempUnit, windSpeed, windUnit]);

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low':
        return isDark ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-green-100 border-green-500 text-green-700';
      case 'moderate':
        return isDark ? 'bg-yellow-900/50 border-yellow-500 text-yellow-400' : 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'high':
        return isDark ? 'bg-orange-900/50 border-orange-500 text-orange-400' : 'bg-orange-100 border-orange-500 text-orange-700';
      case 'very-high':
        return isDark ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-red-100 border-red-500 text-red-700';
      default:
        return isDark ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-400 text-gray-600';
    }
  };

  const getRiskBadgeColor = (risk: string): string => {
    switch (risk) {
      case 'low':
        return 'bg-green-500 text-white';
      case 'moderate':
        return 'bg-yellow-500 text-black';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'very-high':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getWindChillVisual = (): React.ReactNode => {
    if (!calculateWindChill) return null;

    const { windChill, frostbiteRisk } = calculateWindChill;
    const displayTemp = tempUnit === 'F' ? windChill : windChill;

    // Calculate position on scale (-60 to 50)
    const minTemp = tempUnit === 'F' ? -60 : -51;
    const maxTemp = tempUnit === 'F' ? 50 : 10;
    const range = maxTemp - minTemp;
    const position = Math.max(0, Math.min(100, ((displayTemp - minTemp) / range) * 100));

    return (
      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {t('tools.windChill.windChillScale', 'Wind Chill Scale')}
        </h4>
        <div className="relative h-8 rounded-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)',
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-1 bg-white border-2 border-gray-800 rounded-full transform -translate-x-1/2"
            style={{ left: `${position}%` }}
          />
        </div>
        <div className={`flex justify-between mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <span>{minTemp}°{tempUnit}</span>
          <span>{t('tools.windChill.dangerZone', 'Danger Zone')}</span>
          <span>{t('tools.windChill.caution', 'Caution')}</span>
          <span>{maxTemp}°{tempUnit}</span>
        </div>
        <div className="flex items-center justify-center mt-4 gap-2">
          <Snowflake className={`w-6 h-6 ${frostbiteRisk === 'very-high' || frostbiteRisk === 'high' ? 'text-blue-400 animate-pulse' : isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {windChill}°{tempUnit}
          </span>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.windChill.feelsLike', 'feels like')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
          <Wind className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.windChill.windChillCalculator', 'Wind Chill Calculator')}
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.windChill.calculateTheFeelsLikeTemperature', 'Calculate the "feels like" temperature based on wind speed')}
          </p>
        </div>
      </div>

      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.windChill.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Thermometer className="w-4 h-4 inline mr-2" />
            {t('tools.windChill.temperature', 'Temperature')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder={t('tools.windChill.enterTemperature', 'Enter temperature')}
              className={`flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <div className="flex rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-300'}">
              <button
                onClick={() => setTempUnit('F')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tempUnit === 'F'
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                °F
              </button>
              <button
                onClick={() => setTempUnit('C')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tempUnit === 'C'
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                °C
              </button>
            </div>
          </div>
        </div>

        {/* Wind Speed Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Wind className="w-4 h-4 inline mr-2" />
            {t('tools.windChill.windSpeed', 'Wind Speed')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={windSpeed}
              onChange={(e) => setWindSpeed(e.target.value)}
              placeholder={t('tools.windChill.enterWindSpeed', 'Enter wind speed')}
              min="0"
              className={`flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <div className="flex rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-300'}">
              <button
                onClick={() => setWindUnit('mph')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  windUnit === 'mph'
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                mph
              </button>
              <button
                onClick={() => setWindUnit('kmh')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  windUnit === 'kmh'
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('tools.windChill.kmH', 'km/h')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {calculateWindChill && (
        <div className="mt-8 space-y-6">
          {/* Wind Chill Visual */}
          {getWindChillVisual()}

          {/* Frostbite Risk */}
          <div
            className={`p-4 rounded-lg border-2 ${getRiskColor(calculateWindChill.frostbiteRisk)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">{t('tools.windChill.frostbiteRisk', 'Frostbite Risk')}</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor(
                  calculateWindChill.frostbiteRisk
                )}`}
              >
                {calculateWindChill.frostbiteRisk.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm">{calculateWindChill.frostbiteTime}</p>
          </div>

          {/* Safety Recommendations */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.windChill.safetyRecommendations', 'Safety Recommendations')}
            </h4>
            <ul className="space-y-2">
              {calculateWindChill.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-2 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    calculateWindChill.frostbiteRisk === 'very-high'
                      ? 'bg-red-500'
                      : calculateWindChill.frostbiteRisk === 'high'
                      ? 'bg-orange-500'
                      : calculateWindChill.frostbiteRisk === 'moderate'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`} />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Formula Info */}
          <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <strong>{t('tools.windChill.note', 'Note:')}</strong> This calculator uses the National Weather Service (NWS) Wind Chill Formula,
              which is valid for temperatures at or below 50°F (10°C) and wind speeds above 3 mph (4.8 km/h).
              Wind chill represents how cold it feels on exposed human skin.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!calculateWindChill && (
        <div className={`mt-8 p-8 rounded-lg border-2 border-dashed text-center ${
          isDark ? 'border-gray-700' : 'border-gray-300'
        }`}>
          <Snowflake className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.windChill.enterTemperatureAndWindSpeed', 'Enter temperature and wind speed to calculate wind chill')}
          </p>
        </div>
      )}
    </div>
  );
};

export default WindChillTool;
