import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Calendar, Clock, MapPin, Sun, Sunrise, Sunset, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface RamadanDay {
  gregorianDate: string;
  hijriDay: number;
  dayOfWeek: string;
  suhoorEnd: string;
  iftarTime: string;
  fastDuration: string;
  isToday: boolean;
  isPast: boolean;
}

interface RamadanInfo {
  startDate: string;
  endDate: string;
  eidDate: string;
  year: number;
  hijriYear: number;
  days: RamadanDay[];
}

interface RamadanCalendarToolProps {
  uiConfig?: UIConfig;
}

export default function RamadanCalendarTool({ uiConfig }: RamadanCalendarToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [ramadanInfo, setRamadanInfo] = useState<RamadanInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as { year?: number; location?: string };
      if (params.year) {
        setYear(params.year);
      }
    }
  }, [uiConfig?.params]);

  // Approximate Ramadan start dates for various years
  // In reality, these depend on moon sighting
  const getRamadanDates = (year: number): { start: Date; hijriYear: number } => {
    // Approximate Ramadan start dates (actual dates may vary by 1-2 days based on moon sighting)
    const ramadanStarts: Record<number, { month: number; day: number; hijriYear: number }> = {
      2024: { month: 3, day: 10, hijriYear: 1445 },
      2025: { month: 2, day: 28, hijriYear: 1446 },
      2026: { month: 2, day: 17, hijriYear: 1447 },
      2027: { month: 2, day: 7, hijriYear: 1448 },
      2028: { month: 1, day: 27, hijriYear: 1449 },
      2029: { month: 1, day: 15, hijriYear: 1450 },
      2030: { month: 1, day: 5, hijriYear: 1451 },
    };

    const data = ramadanStarts[year] || { month: 3, day: 1, hijriYear: 1446 };
    return {
      start: new Date(year, data.month - 1, data.day),
      hijriYear: data.hijriYear,
    };
  };

  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const toDegrees = (rad: number) => rad * (180 / Math.PI);

  const calculateSunTimes = (date: Date, lat: number, lng: number): { sunrise: string; sunset: string } => {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

    // Approximate equation of time and declination
    const b = (2 * Math.PI / 365) * (dayOfYear - 81);
    const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
    const decl = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));

    const latRad = toRadians(lat);
    const declRad = toRadians(decl);

    // Hour angle for sunrise/sunset
    const cosHa = -Math.tan(latRad) * Math.tan(declRad);
    const haRad = Math.acos(Math.max(-1, Math.min(1, cosHa)));
    const haDeg = toDegrees(haRad);

    // Calculate times
    const noon = 12 - lng / 15 - eot / 60;
    const sunrise = noon - haDeg / 15;
    const sunset = noon + haDeg / 15;

    const formatTime = (hours: number): string => {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
    };

    return {
      sunrise: formatTime(sunrise),
      sunset: formatTime(sunset),
    };
  };

  const calculateFastDuration = (sunrise: string, sunset: string): string => {
    const parseTime = (time: string): number => {
      const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      if (match[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const sunriseMin = parseTime(sunrise);
    const sunsetMin = parseTime(sunset);
    const duration = sunsetMin - sunriseMin;

    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return `${hours}h ${mins}m`;
  };

  const generateRamadanCalendar = () => {
    setLoading(true);

    try {
      const lat = parseFloat(latitude) || 21.4225; // Default to Mecca
      const lng = parseFloat(longitude) || 39.8262;

      const { start, hijriYear } = getRamadanDates(year);
      const days: RamadanDay[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        const sunTimes = calculateSunTimes(date, lat, lng);

        // Suhoor ends about 10 minutes before Fajr (which is around sunrise time minus the twilight)
        // Simplified: use sunrise time
        const suhoorEnd = sunTimes.sunrise;
        const iftarTime = sunTimes.sunset;

        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today;

        days.push({
          gregorianDate: date.toISOString().split('T')[0],
          hijriDay: i + 1,
          dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
          suhoorEnd,
          iftarTime,
          fastDuration: calculateFastDuration(suhoorEnd, iftarTime),
          isToday,
          isPast,
        });
      }

      const endDate = new Date(start);
      endDate.setDate(start.getDate() + 29);

      const eidDate = new Date(start);
      eidDate.setDate(start.getDate() + 30);

      setRamadanInfo({
        startDate: start.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        eidDate: eidDate.toISOString().split('T')[0],
        year,
        hijriYear,
        days,
      });

      // Select today if it's during Ramadan
      const todayIndex = days.findIndex(d => d.isToday);
      if (todayIndex >= 0) {
        setSelectedDay(todayIndex);
      }
    } catch (error) {
      console.error('Error generating calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);

    if (!navigator.geolocation) {
      setValidationMessage('Geolocation is not supported by your browser');
      setTimeout(() => setValidationMessage(null), 3000);
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
      () => {
        setValidationMessage('Unable to get your location');
        setTimeout(() => setValidationMessage(null), 3000);
        setLoading(false);
      }
    );
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.ramadanCalendar.ramadanCalendar', 'Ramadan Calendar')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.ramadanCalendar.viewRamadanDatesSuhoorAnd', 'View Ramadan dates, Suhoor and Iftar times')}
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.ramadanCalendar.year', 'Year')}
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <MapPin className="w-5 h-5" />
                {t('tools.ramadanCalendar.useMyLocation', 'Use My Location')}
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
                  {t('tools.ramadanCalendar.latitude', 'Latitude')}
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
                  {t('tools.ramadanCalendar.longitude', 'Longitude')}
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
          </div>

          {/* Generate Button */}
          <button
            onClick={generateRamadanCalendar}
            disabled={loading}
            className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mb-6"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Calendar className="w-5 h-5" />
            )}
            Generate Ramadan Calendar
          </button>

          {/* Ramadan Info */}
          {ramadanInfo && (
            <div className="space-y-6">
              {/* Overview */}
              <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.ramadanCalendar.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Ramadan {ramadanInfo.hijriYear} AH / {ramadanInfo.year} CE
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Sunrise className="w-4 h-4 text-[#0D9488]" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.ramadanCalendar.ramadanBegins', 'Ramadan Begins')}
                      </span>
                    </div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(ramadanInfo.startDate)}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Sunset className="w-4 h-4 text-[#0D9488]" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.ramadanCalendar.ramadanEnds', 'Ramadan Ends')}
                      </span>
                    </div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(ramadanInfo.endDate)}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Moon className="w-4 h-4 text-[#0D9488]" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.ramadanCalendar.eidAlFitr', 'Eid al-Fitr')}
                      </span>
                    </div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(ramadanInfo.eidDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Day Details */}
              {selectedDay !== null && ramadanInfo.days[selectedDay] && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Day {ramadanInfo.days[selectedDay].hijriDay} - {formatDate(ramadanInfo.days[selectedDay].gregorianDate)}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                      <Sunrise className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.ramadanCalendar.suhoorEnds', 'Suhoor Ends')}</div>
                      <div className="text-xl font-bold text-[#0D9488]">
                        {ramadanInfo.days[selectedDay].suhoorEnd}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                      <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.ramadanCalendar.fastDuration', 'Fast Duration')}</div>
                      <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {ramadanInfo.days[selectedDay].fastDuration}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                      <Sunset className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.ramadanCalendar.iftarTime', 'Iftar Time')}</div>
                      <div className="text-xl font-bold text-[#0D9488]">
                        {ramadanInfo.days[selectedDay].iftarTime}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar Grid */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.ramadanCalendar.30DaysOfRamadan', '30 Days of Ramadan')}
                </h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {ramadanInfo.days.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(idx)}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        selectedDay === idx
                          ? 'bg-[#0D9488] text-white'
                          : day.isToday
                          ? 'bg-[#0D9488]/30 text-[#0D9488] ring-2 ring-[#0D9488]'
                          : day.isPast
                          ? theme === 'dark'
                            ? 'bg-gray-600 text-gray-400'
                            : 'bg-gray-300 text-gray-500'
                          : theme === 'dark'
                          ? 'bg-gray-600 text-white hover:bg-gray-500'
                          : 'bg-white text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-lg font-bold">{day.hijriDay}</div>
                      <div className="text-xs">{day.dayOfWeek}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Schedule */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.ramadanCalendar.fullSchedule', 'Full Schedule')}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <th className="text-left p-2">{t('tools.ramadanCalendar.day', 'Day')}</th>
                        <th className="text-left p-2">{t('tools.ramadanCalendar.date', 'Date')}</th>
                        <th className="text-left p-2">{t('tools.ramadanCalendar.suhoor', 'Suhoor')}</th>
                        <th className="text-left p-2">{t('tools.ramadanCalendar.iftar', 'Iftar')}</th>
                        <th className="text-left p-2">{t('tools.ramadanCalendar.duration', 'Duration')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ramadanInfo.days.slice(0, 10).map((day, idx) => (
                        <tr
                          key={idx}
                          className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} ${
                            day.isToday ? 'bg-[#0D9488]/10' : ''
                          }`}
                        >
                          <td className={`p-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {day.hijriDay}
                          </td>
                          <td className={`p-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(day.gregorianDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="p-2 text-orange-500 font-medium">{day.suhoorEnd}</td>
                          <td className="p-2 text-purple-500 font-medium">{day.iftarTime}</td>
                          <td className={`p-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {day.fastDuration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ramadanInfo.days.length > 10 && (
                    <p className={`text-center mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.ramadanCalendar.clickOnADayAbove', 'Click on a day above to see details')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.ramadanCalendar.aboutRamadan', 'About Ramadan')}
            </h3>
            <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>{t('tools.ramadanCalendar.ramadanIsTheNinthMonth', 'Ramadan is the ninth month of the Islamic calendar, observed by Muslims worldwide as a month of fasting.')}</p>
              <p>{t('tools.ramadanCalendar.fastingBeginsAtFajrDawn', 'Fasting begins at Fajr (dawn) and ends at Maghrib (sunset).')}</p>
              <p>{t('tools.ramadanCalendar.noteActualDatesMayVary', 'Note: Actual dates may vary by 1-2 days depending on moon sighting in your region.')}</p>
            </div>
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
    </>
  );
}
