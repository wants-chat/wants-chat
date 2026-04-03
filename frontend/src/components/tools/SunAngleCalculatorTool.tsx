import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Sun, Compass, MapPin, Clock, Camera, Ruler, Info, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SunPosition {
  elevation: number;
  azimuth: number;
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dayLength: number;
  goldenHourMorningStart: Date;
  goldenHourMorningEnd: Date;
  goldenHourEveningStart: Date;
  goldenHourEveningEnd: Date;
}

// Sun position calculation functions
const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
const toDegrees = (radians: number): number => radians * (180 / Math.PI);

const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const calculateSunPosition = (
  latitude: number,
  longitude: number,
  date: Date
): SunPosition => {
  const dayOfYear = getDayOfYear(date);
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

  // Solar declination angle
  const declination = -23.45 * Math.cos(toRadians((360 / 365) * (dayOfYear + 10)));

  // Equation of time (in minutes)
  const B = toRadians((360 / 365) * (dayOfYear - 81));
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // Time correction factor
  const LSTM = 15 * Math.round(longitude / 15); // Local Standard Time Meridian
  const TC = 4 * (longitude - LSTM) + EoT;

  // Local Solar Time
  const LST = hours + TC / 60;

  // Hour angle
  const HRA = 15 * (LST - 12);

  // Solar elevation angle
  const latRad = toRadians(latitude);
  const decRad = toRadians(declination);
  const hraRad = toRadians(HRA);

  const elevation = toDegrees(
    Math.asin(
      Math.sin(latRad) * Math.sin(decRad) +
      Math.cos(latRad) * Math.cos(decRad) * Math.cos(hraRad)
    )
  );

  // Solar azimuth angle
  const azimuthRad = Math.acos(
    (Math.sin(decRad) - Math.sin(toRadians(elevation)) * Math.sin(latRad)) /
    (Math.cos(toRadians(elevation)) * Math.cos(latRad))
  );

  let azimuth = toDegrees(azimuthRad);
  if (LST > 12 || HRA > 0) {
    azimuth = 360 - azimuth;
  }

  // Sunrise and sunset calculation
  const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad);
  let sunriseHourAngle: number;
  let dayLengthHours: number;

  if (cosHourAngle < -1) {
    // Midnight sun
    sunriseHourAngle = 180;
    dayLengthHours = 24;
  } else if (cosHourAngle > 1) {
    // Polar night
    sunriseHourAngle = 0;
    dayLengthHours = 0;
  } else {
    sunriseHourAngle = toDegrees(Math.acos(cosHourAngle));
    dayLengthHours = (2 * sunriseHourAngle) / 15;
  }

  const solarNoonHours = 12 - TC / 60;
  const sunriseHours = solarNoonHours - sunriseHourAngle / 15;
  const sunsetHours = solarNoonHours + sunriseHourAngle / 15;

  // Convert to Date objects
  const baseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const createDateFromHours = (h: number): Date => {
    const result = new Date(baseDate);
    const totalMinutes = Math.max(0, Math.min(24 * 60, h * 60));
    result.setHours(Math.floor(totalMinutes / 60));
    result.setMinutes(Math.floor(totalMinutes % 60));
    return result;
  };

  const sunrise = createDateFromHours(sunriseHours);
  const sunset = createDateFromHours(sunsetHours);
  const solarNoon = createDateFromHours(solarNoonHours);

  // Golden hour calculation
  // Approximate golden hour times (about 30 min before sunrise to 1 hour after,
  // and 1 hour before sunset to 30 min after)
  const goldenHourMorningStart = new Date(sunrise.getTime() - 30 * 60 * 1000);
  const goldenHourMorningEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);
  const goldenHourEveningStart = new Date(sunset.getTime() - 60 * 60 * 1000);
  const goldenHourEveningEnd = new Date(sunset.getTime() + 30 * 60 * 1000);

  return {
    elevation: parseFloat(elevation.toFixed(2)),
    azimuth: parseFloat(azimuth.toFixed(2)),
    sunrise,
    sunset,
    solarNoon,
    dayLength: parseFloat(dayLengthHours.toFixed(2)),
    goldenHourMorningStart,
    goldenHourMorningEnd,
    goldenHourEveningStart,
    goldenHourEveningEnd,
  };
};

const getCompassDirection = (azimuth: number): string => {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(azimuth / 22.5) % 16;
  return directions[index];
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDuration = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

interface SunAngleCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SunAngleCalculatorTool: React.FC<SunAngleCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [latitude, setLatitude] = useState<string>('40.7128');
  const [longitude, setLongitude] = useState<string>('-74.0060');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [sunPosition, setSunPosition] = useState<SunPosition | null>(null);
  const [locationName, setLocationName] = useState<string>('New York, NY');
  const [isLocating, setIsLocating] = useState(false);
  const [objectHeight, setObjectHeight] = useState<string>('1');
  const [showInfo, setShowInfo] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setLatitude(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setLatitude(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const calculateSun = useCallback(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return;
    }

    const dateTime = new Date(`${selectedDate}T${selectedTime}`);
    const position = calculateSunPosition(lat, lng, dateTime);
    setSunPosition(position);
  }, [latitude, longitude, selectedDate, selectedTime]);

  useEffect(() => {
    calculateSun();
  }, [calculateSun]);

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setValidationMessage('Geolocation is not supported by your browser');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(4));
        setLongitude(position.coords.longitude.toFixed(4));
        setLocationName('Current Location');
        setIsLocating(false);
      },
      (error) => {
        setValidationMessage(`Error getting location: ${error.message}`);
        setTimeout(() => setValidationMessage(null), 3000);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleUseCurrentTime = () => {
    const now = new Date();
    setSelectedDate(now.toISOString().split('T')[0]);
    setSelectedTime(now.toTimeString().slice(0, 5));
  };

  const calculateShadowLength = (): string => {
    if (!sunPosition || sunPosition.elevation <= 0) {
      return 'N/A (Sun below horizon)';
    }
    const height = parseFloat(objectHeight);
    if (isNaN(height) || height <= 0) return 'N/A';

    const shadowLength = height / Math.tan(toRadians(sunPosition.elevation));
    return `${shadowLength.toFixed(2)} units`;
  };

  // Visual sun position diagram
  const renderSunDiagram = () => {
    if (!sunPosition) return null;

    const elevation = Math.max(0, Math.min(90, sunPosition.elevation));
    const azimuth = sunPosition.azimuth;

    // Calculate sun position on the diagram
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    // Convert elevation and azimuth to x, y coordinates
    const elevationRatio = elevation / 90;
    const sunRadius = radius * (1 - elevationRatio * 0.7);
    const azimuthRad = toRadians(azimuth - 90); // Adjust so North is up

    const sunX = centerX + sunRadius * Math.cos(azimuthRad);
    const sunY = centerY + sunRadius * Math.sin(azimuthRad);

    const isBelowHorizon = sunPosition.elevation < 0;

    return (
      <div className="flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background circle (sky) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill={theme === 'dark' ? '#1e3a5f' : '#87CEEB'}
            stroke={theme === 'dark' ? '#4B5563' : '#6B7280'}
            strokeWidth="2"
          />

          {/* Horizon line */}
          <line
            x1={centerX - radius}
            y1={centerY}
            x2={centerX + radius}
            y2={centerY}
            stroke={theme === 'dark' ? '#059669' : '#047857'}
            strokeWidth="2"
          />

          {/* Compass directions */}
          <text x={centerX} y={centerY - radius - 8} textAnchor="middle" className={`text-xs ${theme === 'dark' ? 'fill-gray-300' : 'fill-gray-700'}`}>N</text>
          <text x={centerX + radius + 12} y={centerY + 4} textAnchor="middle" className={`text-xs ${theme === 'dark' ? 'fill-gray-300' : 'fill-gray-700'}`}>E</text>
          <text x={centerX} y={centerY + radius + 16} textAnchor="middle" className={`text-xs ${theme === 'dark' ? 'fill-gray-300' : 'fill-gray-700'}`}>S</text>
          <text x={centerX - radius - 12} y={centerY + 4} textAnchor="middle" className={`text-xs ${theme === 'dark' ? 'fill-gray-300' : 'fill-gray-700'}`}>W</text>

          {/* Sun */}
          {!isBelowHorizon && (
            <>
              <circle
                cx={sunX}
                cy={sunY}
                r={12}
                fill="#FCD34D"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              {/* Sun rays */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1={sunX + 14 * Math.cos(toRadians(angle))}
                  y1={sunY + 14 * Math.sin(toRadians(angle))}
                  x2={sunX + 20 * Math.cos(toRadians(angle))}
                  y2={sunY + 20 * Math.sin(toRadians(angle))}
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {/* Center point (observer) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={4}
            fill={theme === 'dark' ? '#10B981' : '#059669'}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.sunAngleCalculator.sunAngleCalculator', 'Sun Angle Calculator')}
              </CardTitle>
            </div>
          </CardHeader>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mx-6 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.sunAngleCalculator.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          <CardContent className="space-y-6">
            {/* Location Input */}
            <div className="space-y-4">
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.sunAngleCalculator.location', 'Location')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.sunAngleCalculator.latitude', 'Latitude')}
                  </label>
                  <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="-90 to 90"
                    step="0.0001"
                    min="-90"
                    max="90"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.sunAngleCalculator.longitude', 'Longitude')}
                  </label>
                  <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-180 to 180"
                    step="0.0001"
                    min="-180"
                    max="180"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              <button
                onClick={handleAutoDetect}
                disabled={isLocating}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <MapPin className="w-5 h-5" />
                {isLocating ? t('tools.sunAngleCalculator.detectingLocation', 'Detecting Location...') : t('tools.sunAngleCalculator.autoDetectMyLocation', 'Auto-Detect My Location')}
              </button>

              {locationName && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Location: {locationName}
                </p>
              )}
            </div>

            {/* Date and Time Input */}
            <div className="space-y-4">
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.sunAngleCalculator.dateTime', 'Date & Time')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.sunAngleCalculator.date', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.sunAngleCalculator.time', 'Time')}
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              <button
                onClick={handleUseCurrentTime}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
                {t('tools.sunAngleCalculator.useCurrentDateTime', 'Use Current Date & Time')}
              </button>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateSun}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
            >
              <Sun className="w-5 h-5" />
              {t('tools.sunAngleCalculator.calculateSunPosition', 'Calculate Sun Position')}
            </button>

            {/* Results */}
            {sunPosition && (
              <div className="space-y-6">
                {/* Sun Position Diagram */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`text-sm font-semibold mb-4 text-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.sunAngleCalculator.sunPositionDiagram', 'Sun Position Diagram')}
                  </h3>
                  {renderSunDiagram()}
                  <p className={`text-xs text-center mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.sunAngleCalculator.viewFromAboveNorthIs', 'View from above - North is up')}
                  </p>
                </div>

                {/* Main Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Elevation */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/30' : 'bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                      <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.sunAngleCalculator.sunElevation2', 'Sun Elevation')}
                      </h4>
                    </div>
                    <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                      {sunPosition.elevation}°
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {sunPosition.elevation < 0 ? 'Below horizon' : sunPosition.elevation < 10 ? 'Very low' : sunPosition.elevation < 30 ? 'Low' : sunPosition.elevation < 60 ? t('tools.sunAngleCalculator.medium', 'Medium') : t('tools.sunAngleCalculator.high', 'High')}
                    </p>
                  </div>

                  {/* Azimuth */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-700/30' : 'bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Compass className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.sunAngleCalculator.sunAzimuth2', 'Sun Azimuth')}
                      </h4>
                    </div>
                    <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {sunPosition.azimuth}°
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getCompassDirection(sunPosition.azimuth)} ({sunPosition.azimuth.toFixed(0)}° from North)
                    </p>
                  </div>
                </div>

                {/* Sun Times */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.sunAngleCalculator.sunTimes', 'Sun Times')}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunAngleCalculator.sunrise', 'Sunrise')}</p>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatTime(sunPosition.sunrise)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunAngleCalculator.solarNoon', 'Solar Noon')}</p>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatTime(sunPosition.solarNoon)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunAngleCalculator.sunset', 'Sunset')}</p>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatTime(sunPosition.sunset)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunAngleCalculator.dayLength', 'Day Length')}</p>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatDuration(sunPosition.dayLength)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Golden Hour */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border border-orange-700/30' : 'bg-gradient-to-br from-orange-50 to-yellow-100 border border-orange-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.sunAngleCalculator.goldenHourPhotography', 'Golden Hour (Photography)')}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunAngleCalculator.morningGoldenHour', 'Morning Golden Hour')}</p>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatTime(sunPosition.goldenHourMorningStart)} - {formatTime(sunPosition.goldenHourMorningEnd)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunAngleCalculator.eveningGoldenHour', 'Evening Golden Hour')}</p>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatTime(sunPosition.goldenHourEveningStart)} - {formatTime(sunPosition.goldenHourEveningEnd)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shadow Calculator */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Ruler className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.sunAngleCalculator.shadowLengthCalculator', 'Shadow Length Calculator')}
                    </h4>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.sunAngleCalculator.objectHeightAnyUnit', 'Object Height (any unit)')}
                      </label>
                      <input
                        type="number"
                        value={objectHeight}
                        onChange={(e) => setObjectHeight(e.target.value)}
                        placeholder={t('tools.sunAngleCalculator.enterHeight', 'Enter height')}
                        min="0"
                        step="0.1"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunAngleCalculator.shadowLength', 'Shadow Length:')}</p>
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                        {calculateShadowLength()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Section */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`w-full flex items-center justify-between p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.sunAngleCalculator.aboutSunAngleCalculator', 'About Sun Angle Calculator')}
                </span>
              </div>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {showInfo ? '-' : '+'}
              </span>
            </button>

            {showInfo && (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-sm space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>
                    <strong>{t('tools.sunAngleCalculator.sunElevation', 'Sun Elevation:')}</strong> The angle of the sun above the horizon.
                    0° means the sun is at the horizon, 90° means directly overhead.
                  </p>
                  <p>
                    <strong>{t('tools.sunAngleCalculator.sunAzimuth', 'Sun Azimuth:')}</strong> The compass direction of the sun, measured in degrees
                    clockwise from North (0° = North, 90° = East, 180° = South, 270° = West).
                  </p>
                  <p>
                    <strong>{t('tools.sunAngleCalculator.goldenHour', 'Golden Hour:')}</strong> The period shortly after sunrise or before sunset when
                    daylight is softer and warmer, ideal for photography.
                  </p>
                  <p>
                    <strong>{t('tools.sunAngleCalculator.shadowLength2', 'Shadow Length:')}</strong> Calculated using the formula: Shadow = Height / tan(Elevation).
                    Enter any unit of measurement and the result will be in the same unit.
                  </p>
                  <p className="text-xs mt-3">
                    Note: Calculations are based on astronomical formulas and may vary slightly from
                    actual observations due to atmospheric refraction and local terrain.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default SunAngleCalculatorTool;
