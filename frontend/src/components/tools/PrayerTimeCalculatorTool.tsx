import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, MapPin, Clock, RefreshCw, Compass, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  midnight: string;
}

interface PrayerTimeCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculationMethod = 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'Tehran' | 'Jafari';
type AsrJuristic = 'Standard' | 'Hanafi';

interface MethodConfig {
  fajrAngle: number;
  ishaAngle: number;
  maghribMinutes: number;
}

const CALCULATION_METHODS: Record<CalculationMethod, MethodConfig> = {
  MWL: { fajrAngle: 18, ishaAngle: 17, maghribMinutes: 0 },
  ISNA: { fajrAngle: 15, ishaAngle: 15, maghribMinutes: 0 },
  Egypt: { fajrAngle: 19.5, ishaAngle: 17.5, maghribMinutes: 0 },
  Makkah: { fajrAngle: 18.5, ishaAngle: 0, maghribMinutes: 90 },
  Karachi: { fajrAngle: 18, ishaAngle: 18, maghribMinutes: 0 },
  Tehran: { fajrAngle: 17.7, ishaAngle: 14, maghribMinutes: 0 },
  Jafari: { fajrAngle: 16, ishaAngle: 14, maghribMinutes: 0 },
};

const METHOD_LABELS: Record<CalculationMethod, string> = {
  MWL: 'Muslim World League',
  ISNA: 'Islamic Society of North America',
  Egypt: 'Egyptian General Authority',
  Makkah: 'Umm al-Qura, Makkah',
  Karachi: 'University of Islamic Sciences, Karachi',
  Tehran: 'Institute of Geophysics, Tehran',
  Jafari: 'Shia Ithna-Ashari, Leva Institute, Qum',
};

export default function PrayerTimeCalculatorTool({ uiConfig }: PrayerTimeCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<CalculationMethod>('MWL');
  const [asrJuristic, setAsrJuristic] = useState<AsrJuristic>('Standard');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [nextPrayer, setNextPrayer] = useState<string>('');

  // Get user's location on mount
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as { location?: string; latitude?: number; longitude?: number };
      if (params.latitude && params.longitude) {
        setLatitude(params.latitude.toString());
        setLongitude(params.longitude.toString());
      }
      if (params.location) {
        setCity(params.location);
      }
    }
  }, [uiConfig?.params]);

  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
  const toDegrees = (radians: number): number => radians * (180 / Math.PI);

  const calculatePrayerTimes = () => {
    if (!latitude || !longitude) {
      setError('Please enter latitude and longitude or use your current location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const selectedDate = new Date(date);

      // Julian date calculation
      const julianDate = getJulianDate(selectedDate);

      // Sun position calculations
      const sunPosition = getSunPosition(julianDate);

      // Timezone offset (simplified - using local timezone)
      const timezone = -selectedDate.getTimezoneOffset() / 60;

      // Calculate prayer times
      const times = calculateTimes(lat, lng, sunPosition, timezone, selectedDate);

      setPrayerTimes(times);
      updateNextPrayer(times);
    } catch (err) {
      setError('Error calculating prayer times. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const getJulianDate = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let y = year;
    let m = month;

    if (m <= 2) {
      y -= 1;
      m += 12;
    }

    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);

    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  };

  const getSunPosition = (jd: number): { declination: number; equation: number } => {
    const d = jd - 2451545.0;
    const g = ((357.529 + 0.98560028 * d) % 360);
    const q = ((280.459 + 0.98564736 * d) % 360);
    const l = ((q + 1.915 * Math.sin(toRadians(g)) + 0.020 * Math.sin(toRadians(2 * g))) % 360);
    const e = 23.439 - 0.00000036 * d;

    const declination = toDegrees(Math.asin(Math.sin(toRadians(e)) * Math.sin(toRadians(l))));

    let ra = toDegrees(Math.atan2(Math.cos(toRadians(e)) * Math.sin(toRadians(l)), Math.cos(toRadians(l)))) / 15;
    if (ra < 0) ra += 24;

    const equation = q / 15 - ra;

    return { declination, equation };
  };

  const calculateTimes = (
    lat: number,
    lng: number,
    sunPos: { declination: number; equation: number },
    timezone: number,
    date: Date
  ): PrayerTimes => {
    const methodConfig = CALCULATION_METHODS[method];

    // Dhuhr time (solar noon)
    const dhuhrTime = 12 + timezone - lng / 15 - sunPos.equation;

    // Calculate sun angle times
    const sunAngleTime = (angle: number, direction: 'rise' | 'set'): number => {
      const decl = toRadians(sunPos.declination);
      const latRad = toRadians(lat);
      const angleRad = toRadians(angle);

      let cosHa = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(decl)) /
                  (Math.cos(latRad) * Math.cos(decl));

      if (cosHa > 1 || cosHa < -1) return NaN;

      const ha = toDegrees(Math.acos(cosHa)) / 15;
      return direction === 'rise' ? dhuhrTime - ha : dhuhrTime + ha;
    };

    // Sunrise and sunset
    const sunrise = sunAngleTime(-0.833, 'rise');
    const sunset = sunAngleTime(-0.833, 'set');

    // Fajr
    const fajr = sunAngleTime(-methodConfig.fajrAngle, 'rise');

    // Isha
    let isha: number;
    if (methodConfig.ishaAngle > 0) {
      isha = sunAngleTime(-methodConfig.ishaAngle, 'set');
    } else {
      isha = sunset + methodConfig.maghribMinutes / 60;
    }

    // Maghrib
    const maghrib = sunset + methodConfig.maghribMinutes / 60;

    // Asr
    const asrFactor = asrJuristic === 'Hanafi' ? 2 : 1;
    const asrAngle = toDegrees(Math.atan(1 / (asrFactor + Math.tan(toRadians(Math.abs(lat - sunPos.declination))))));
    const asr = sunAngleTime(asrAngle, 'set');

    // Midnight
    const midnight = (sunset + (fajr + 24 - sunset) / 2) % 24;

    const formatTime = (time: number): string => {
      if (isNaN(time)) return '--:--';
      time = (time + 24) % 24;
      const hours = Math.floor(time);
      const minutes = Math.round((time - hours) * 60);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return {
      fajr: formatTime(fajr),
      sunrise: formatTime(sunrise),
      dhuhr: formatTime(dhuhrTime),
      asr: formatTime(asr),
      maghrib: formatTime(maghrib),
      isha: formatTime(isha),
      midnight: formatTime(midnight),
    };
  };

  const updateNextPrayer = (times: PrayerTimes) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string): number => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return -1;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const prayers = [
      { name: 'Fajr', time: parseTime(times.fajr) },
      { name: 'Sunrise', time: parseTime(times.sunrise) },
      { name: 'Dhuhr', time: parseTime(times.dhuhr) },
      { name: 'Asr', time: parseTime(times.asr) },
      { name: 'Maghrib', time: parseTime(times.maghrib) },
      { name: 'Isha', time: parseTime(times.isha) },
    ];

    const next = prayers.find(p => p.time > currentTime);
    setNextPrayer(next ? next.name : 'Fajr (Tomorrow)');
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setCity('Current Location');
        setLoading(false);
      },
      (err) => {
        setError('Unable to get your location. Please enter coordinates manually.');
        setLoading(false);
      }
    );
  };

  const reset = () => {
    setLatitude('');
    setLongitude('');
    setCity('');
    setDate(new Date().toISOString().split('T')[0]);
    setMethod('MWL');
    setAsrJuristic('Standard');
    setPrayerTimes(null);
    setError('');
    setNextPrayer('');
  };

  const getPrayerIcon = (prayer: string) => {
    switch (prayer) {
      case 'fajr':
      case 'isha':
      case 'midnight':
        return <Moon className="w-5 h-5" />;
      case 'sunrise':
      case 'dhuhr':
        return <Sun className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const prayerLabels: Record<string, string> = {
    fajr: 'Fajr (Dawn)',
    sunrise: 'Sunrise (Shurooq)',
    dhuhr: 'Dhuhr (Noon)',
    asr: 'Asr (Afternoon)',
    maghrib: 'Maghrib (Sunset)',
    isha: "Isha (Night)",
    midnight: 'Midnight (Tahajjud)',
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.prayerTimeCalculator.prayerTimeCalculator', 'Prayer Time Calculator')}
            </h1>
          </div>

          {/* Location Input */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <MapPin className="w-5 h-5" />
                {t('tools.prayerTimeCalculator.useMyLocation', 'Use My Location')}
              </button>
              {city && (
                <div className={`flex-1 px-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  {city}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.prayerTimeCalculator.latitude', 'Latitude')}
                </label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 21.4225"
                  step="any"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.prayerTimeCalculator.longitude', 'Longitude')}
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., 39.8262"
                  step="any"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('tools.prayerTimeCalculator.date', 'Date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Compass className="w-4 h-4 inline mr-1" />
                {t('tools.prayerTimeCalculator.calculationMethod', 'Calculation Method')}
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as CalculationMethod)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {Object.entries(METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.prayerTimeCalculator.asrJuristicMethod', 'Asr Juristic Method')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Standard', 'Hanafi'] as AsrJuristic[]).map((j) => (
                  <button
                    key={j}
                    onClick={() => setAsrJuristic(j)}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      asrJuristic === j
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {j} {j === 'Standard' ? '(Shafi, Maliki, Hanbali)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculatePrayerTimes}
              disabled={loading}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
              Calculate Prayer Times
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.prayerTimeCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Prayer Times Display */}
          {prayerTimes && (
            <div className="space-y-4">
              {nextPrayer && (
                <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${
                  theme === 'dark' ? 'bg-gray-700' : t('tools.prayerTimeCalculator.bg0d948810', 'bg-[#0D9488]/10')
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#0D9488]" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.prayerTimeCalculator.nextPrayer', 'Next Prayer:')}
                    </span>
                    <span className="font-bold text-[#0D9488]">{nextPrayer}</span>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Prayer Times for {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="space-y-3">
                  {Object.entries(prayerTimes).map(([prayer, time]) => (
                    <div
                      key={prayer}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                      } ${nextPrayer.toLowerCase().startsWith(prayer) ? 'ring-2 ring-[#0D9488]' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-500' : t('tools.prayerTimeCalculator.bg0d9488102', 'bg-[#0D9488]/10')
                        }`}>
                          {getPrayerIcon(prayer)}
                        </div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {prayerLabels[prayer]}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-[#0D9488]">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.prayerTimeCalculator.aboutPrayerTimeCalculation', 'About Prayer Time Calculation')}
            </h3>
            <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>{t('tools.prayerTimeCalculator.prayerTimesAreCalculatedUsing', 'Prayer times are calculated using astronomical algorithms based on the sun\'s position.')}</p>
              <p>{t('tools.prayerTimeCalculator.differentCalculationMethodsVaryIn', 'Different calculation methods vary in the angles used for Fajr and Isha times.')}</p>
              <p>{t('tools.prayerTimeCalculator.theHanafiMethodCalculatesAsr', 'The Hanafi method calculates Asr when shadow length equals twice the object\'s height plus its noon shadow.')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
