import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Sun, Sunrise, Sunset, Moon, MapPin, Calendar, Clock, Sparkles, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SunsetTimeCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface SunTimes {
  sunrise: Date;
  sunset: Date;
  goldenHourMorningStart: Date;
  goldenHourMorningEnd: Date;
  goldenHourEveningStart: Date;
  goldenHourEveningEnd: Date;
  blueHourMorningStart: Date;
  blueHourMorningEnd: Date;
  blueHourEveningStart: Date;
  blueHourEveningEnd: Date;
  solarNoon: Date;
  dayLength: number; // in minutes
}

const SunsetTimeCalculatorTool: React.FC<SunsetTimeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [latitude, setLatitude] = useState('40.7128');
  const [longitude, setLongitude] = useState('-74.0060');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationName, setLocationName] = useState('New York, NY');
  const [isLocating, setIsLocating] = useState(false);

  // Preset locations
  const presetLocations = [
    { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
    { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  ];

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.latitude) {
        setLatitude(String(params.latitude));
        hasChanges = true;
      }
      if (params.longitude) {
        setLongitude(String(params.longitude));
        hasChanges = true;
      }
      if (params.date) {
        setDate(String(params.date));
        hasChanges = true;
      }
      if (params.location) {
        setLocationName(String(params.location));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Get current location
  const getCurrentLocation = () => {
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
        console.error('Error getting location:', error);
        setIsLocating(false);
        setValidationMessage('Unable to get your location. Please enter coordinates manually.');
        setTimeout(() => setValidationMessage(null), 3000);
      }
    );
  };

  // Calculate sun times using simplified algorithm
  const sunTimes = useMemo((): SunTimes | null => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return null;
    }

    const selectedDate = new Date(date);
    const dayOfYear = Math.floor((selectedDate.getTime() - new Date(selectedDate.getFullYear(), 0, 0).getTime()) / 86400000);

    // Calculate sunrise/sunset using simplified algorithm
    const toRadians = (deg: number) => deg * (Math.PI / 180);
    const toDegrees = (rad: number) => rad * (180 / Math.PI);

    // Solar declination
    const declination = -23.45 * Math.cos(toRadians((360 / 365) * (dayOfYear + 10)));

    // Hour angle
    const latRad = toRadians(lat);
    const decRad = toRadians(declination);

    // Sunrise/sunset hour angle
    const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad);

    // Handle polar day/night
    if (cosHourAngle < -1 || cosHourAngle > 1) {
      return null;
    }

    const hourAngle = toDegrees(Math.acos(cosHourAngle));

    // Solar noon (approximate)
    const solarNoonMinutes = 720 - (lng * 4); // Approximate solar noon

    // Calculate times
    const sunriseMinutes = solarNoonMinutes - (hourAngle * 4);
    const sunsetMinutes = solarNoonMinutes + (hourAngle * 4);

    const createTime = (minutes: number): Date => {
      const time = new Date(selectedDate);
      time.setHours(Math.floor(minutes / 60), Math.round(minutes % 60), 0, 0);
      return time;
    };

    const sunrise = createTime(sunriseMinutes);
    const sunset = createTime(sunsetMinutes);
    const solarNoon = createTime(solarNoonMinutes);

    // Golden hour: approximately 1 hour after sunrise and 1 hour before sunset
    const goldenHourMorningStart = createTime(sunriseMinutes);
    const goldenHourMorningEnd = createTime(sunriseMinutes + 60);
    const goldenHourEveningStart = createTime(sunsetMinutes - 60);
    const goldenHourEveningEnd = createTime(sunsetMinutes);

    // Blue hour: approximately 20-40 minutes before sunrise and after sunset
    const blueHourMorningStart = createTime(sunriseMinutes - 40);
    const blueHourMorningEnd = createTime(sunriseMinutes - 10);
    const blueHourEveningStart = createTime(sunsetMinutes + 10);
    const blueHourEveningEnd = createTime(sunsetMinutes + 40);

    const dayLength = sunsetMinutes - sunriseMinutes;

    return {
      sunrise,
      sunset,
      goldenHourMorningStart,
      goldenHourMorningEnd,
      goldenHourEveningStart,
      goldenHourEveningEnd,
      blueHourMorningStart,
      blueHourMorningEnd,
      blueHourEveningStart,
      blueHourEveningEnd,
      solarNoon,
      dayLength,
    };
  }, [latitude, longitude, date]);

  const formatTime = (time: Date | null): string => {
    if (!time) return '--:--';
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const selectPresetLocation = (preset: typeof presetLocations[0]) => {
    setLatitude(preset.lat.toString());
    setLongitude(preset.lng.toString());
    setLocationName(preset.name);
  };

  // Calculate sun position percentage for visualization
  const sunPositionPercent = useMemo(() => {
    if (!sunTimes) return 50;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const sunriseMinutes = sunTimes.sunrise.getHours() * 60 + sunTimes.sunrise.getMinutes();
    const sunsetMinutes = sunTimes.sunset.getHours() * 60 + sunTimes.sunset.getMinutes();

    if (currentMinutes < sunriseMinutes) return 0;
    if (currentMinutes > sunsetMinutes) return 100;

    return ((currentMinutes - sunriseMinutes) / (sunsetMinutes - sunriseMinutes)) * 100;
  }, [sunTimes]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-teal-500 flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.sunsetTimeCalculator.sunsetGoldenHourCalculator', 'Sunset & Golden Hour Calculator')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.sunsetTimeCalculator.planYourPhotographyWithAccurate', 'Plan your photography with accurate sun timing')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-teal-500/10 rounded-xl border border-teal-500/20">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.sunsetTimeCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
            </div>
          )}

          {/* Location Input */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sunsetTimeCalculator.location', 'Location')}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sunsetTimeCalculator.latitude', 'Latitude')}</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="40.7128"
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sunsetTimeCalculator.longitude', 'Longitude')}</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="-74.0060"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 ${
                    isLocating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-teal-500 hover:bg-teal-600'
                  } text-white transition-colors`}
                >
                  <MapPin className="w-4 h-4" />
                  {isLocating ? t('tools.sunsetTimeCalculator.locating', 'Locating...') : t('tools.sunsetTimeCalculator.useMyLocation', 'Use My Location')}
                </button>
              </div>
            </div>

            {/* Preset Locations */}
            <div className="flex flex-wrap gap-2">
              {presetLocations.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => selectPresetLocation(preset)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    locationName === preset.name
                      ? 'bg-teal-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.sunsetTimeCalculator.date', 'Date')}
              </label>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full md:w-auto px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>

          {sunTimes ? (
            <>
              {/* Sun Arc Visualization */}
              <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-gradient-to-b from-gray-700 to-gray-800' : 'bg-gradient-to-b from-blue-100 to-orange-100'}`}>
                <div className="relative h-32">
                  {/* Arc path */}
                  <div className="absolute inset-x-0 bottom-0 h-16 overflow-hidden">
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32 rounded-t-full border-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} border-b-0`} />
                  </div>

                  {/* Sun position */}
                  <div
                    className="absolute bottom-8 w-12 h-12 transform -translate-x-1/2 transition-all duration-1000"
                    style={{
                      left: `${Math.max(10, Math.min(90, sunPositionPercent))}%`,
                      bottom: `${8 + Math.sin(sunPositionPercent * Math.PI / 100) * 60}px`
                    }}
                  >
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Sun className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute bottom-0 left-4 flex items-center gap-1">
                    <Sunrise className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatTime(sunTimes.sunrise)}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-4 flex items-center gap-1">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatTime(sunTimes.sunset)}
                    </span>
                    <Sunset className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                  </div>
                </div>
              </div>

              {/* Main Times */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'} text-center`}>
                  <Sunrise className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunsetTimeCalculator.sunrise', 'Sunrise')}</p>
                  <p className="text-2xl font-bold text-orange-500">{formatTime(sunTimes.sunrise)}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} text-center`}>
                  <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunsetTimeCalculator.solarNoon', 'Solar Noon')}</p>
                  <p className="text-2xl font-bold text-yellow-500">{formatTime(sunTimes.solarNoon)}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} text-center`}>
                  <Sunset className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunsetTimeCalculator.sunset', 'Sunset')}</p>
                  <p className="text-2xl font-bold text-red-500">{formatTime(sunTimes.sunset)}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <Clock className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sunsetTimeCalculator.dayLength', 'Day Length')}</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDuration(sunTimes.dayLength)}
                  </p>
                </div>
              </div>

              {/* Golden Hour Times */}
              <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  <Sun className="w-5 h-5" />
                  {t('tools.sunsetTimeCalculator.goldenHourBestForPhotography', 'Golden Hour (Best for Photography)')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sunsetTimeCalculator.morningGoldenHour', 'Morning Golden Hour')}</p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(sunTimes.goldenHourMorningStart)} - {formatTime(sunTimes.goldenHourMorningEnd)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sunsetTimeCalculator.eveningGoldenHour', 'Evening Golden Hour')}</p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(sunTimes.goldenHourEveningStart)} - {formatTime(sunTimes.goldenHourEveningEnd)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blue Hour Times */}
              <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  <Moon className="w-5 h-5" />
                  {t('tools.sunsetTimeCalculator.blueHourTwilightPhotography', 'Blue Hour (Twilight Photography)')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sunsetTimeCalculator.morningBlueHour', 'Morning Blue Hour')}</p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(sunTimes.blueHourMorningStart)} - {formatTime(sunTimes.blueHourMorningEnd)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sunsetTimeCalculator.eveningBlueHour', 'Evening Blue Hour')}</p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(sunTimes.blueHourEveningStart)} - {formatTime(sunTimes.blueHourEveningEnd)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={`p-8 rounded-xl text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Sun className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Enter valid coordinates to calculate sun times.
                <br />
                {t('tools.sunsetTimeCalculator.latitude90To90Longitude', 'Latitude: -90 to 90, Longitude: -180 to 180')}
              </p>
            </div>
          )}

          {/* Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium mb-1">{t('tools.sunsetTimeCalculator.photographyTips', 'Photography Tips:')}</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>{t('tools.sunsetTimeCalculator.goldenHour', 'Golden Hour:')}</strong> {t('tools.sunsetTimeCalculator.warmSoftLightIdealFor', 'Warm, soft light ideal for portraits and landscapes')}</li>
                <li><strong>{t('tools.sunsetTimeCalculator.blueHour', 'Blue Hour:')}</strong> {t('tools.sunsetTimeCalculator.coolEvenLightPerfectFor', 'Cool, even light perfect for cityscapes and architecture')}</li>
                <li>{t('tools.sunsetTimeCalculator.arrive1520MinutesEarly', 'Arrive 15-20 minutes early to set up and scout locations')}</li>
                <li>{t('tools.sunsetTimeCalculator.timesAreApproximateAndMay', 'Times are approximate and may vary slightly from actual conditions')}</li>
              </ul>
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
    </div>
  );
};

export default SunsetTimeCalculatorTool;
