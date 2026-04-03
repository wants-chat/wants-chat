import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Clock, MapPin, ArrowRight, Globe, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

const AIRPORTS: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', lat: 40.6413, lon: -73.7781, timezone: 'America/New_York' },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', lat: 33.9425, lon: -118.4081, timezone: 'America/Los_Angeles' },
  { code: 'ORD', name: "O'Hare Intl", city: 'Chicago', country: 'USA', lat: 41.9742, lon: -87.9073, timezone: 'America/Chicago' },
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', lat: 51.4700, lon: -0.4543, timezone: 'Europe/London' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479, timezone: 'Europe/Paris' },
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE', lat: 25.2532, lon: 55.3657, timezone: 'Asia/Dubai' },
  { code: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798, timezone: 'Asia/Tokyo' },
  { code: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, timezone: 'Asia/Singapore' },
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lon: 151.1753, timezone: 'Australia/Sydney' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622, timezone: 'Europe/Berlin' },
  { code: 'HKG', name: 'Hong Kong Intl', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lon: 113.9185, timezone: 'Asia/Hong_Kong' },
  { code: 'ICN', name: 'Incheon Intl', city: 'Seoul', country: 'South Korea', lat: 37.4602, lon: 126.4407, timezone: 'Asia/Seoul' },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683, timezone: 'Europe/Amsterdam' },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA', lat: 25.7959, lon: -80.2870, timezone: 'America/New_York' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lon: 100.7501, timezone: 'Asia/Bangkok' },
  { code: 'DEL', name: 'Indira Gandhi Intl', city: 'New Delhi', country: 'India', lat: 28.5562, lon: 77.1000, timezone: 'Asia/Kolkata' },
  { code: 'DAC', name: 'Hazrat Shahjalal Intl', city: 'Dhaka', country: 'Bangladesh', lat: 23.8433, lon: 90.3978, timezone: 'Asia/Dhaka' },
  { code: 'DOH', name: 'Hamad Intl', city: 'Doha', country: 'Qatar', lat: 25.2731, lon: 51.6080, timezone: 'Asia/Qatar' },
  { code: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lon: 28.7519, timezone: 'Europe/Istanbul' },
  { code: 'MEX', name: 'Mexico City Intl', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lon: -99.0721, timezone: 'America/Mexico_City' },
];

interface FlightTimeToolProps {
  uiConfig?: UIConfig;
}

export const FlightTimeTool: React.FC<FlightTimeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [departureCode, setDepartureCode] = useState<string>('JFK');
  const [arrivalCode, setArrivalCode] = useState<string>('LHR');
  const [aircraftSpeed, setAircraftSpeed] = useState<string>('900');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      if (params.departureAirport || params.origin) {
        const code = String(params.departureAirport || params.origin).toUpperCase();
        if (AIRPORTS.find(a => a.code === code)) {
          setDepartureCode(code);
          hasChanges = true;
        }
      }
      if (params.arrivalAirport || params.destination) {
        const code = String(params.arrivalAirport || params.destination).toUpperCase();
        if (AIRPORTS.find(a => a.code === code)) {
          setArrivalCode(code);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const flightDetails = useMemo(() => {
    const departure = AIRPORTS.find(a => a.code === departureCode);
    const arrival = AIRPORTS.find(a => a.code === arrivalCode);
    const speed = parseFloat(aircraftSpeed) || 900;

    if (!departure || !arrival) return null;

    const distanceKm = calculateDistance(departure.lat, departure.lon, arrival.lat, arrival.lon);
    const distanceMiles = distanceKm * 0.621371;

    // Add time for takeoff, landing, taxiing (approximately 45 min)
    const groundTime = 0.75;
    const flightHours = distanceKm / speed + groundTime;

    const hours = Math.floor(flightHours);
    const minutes = Math.round((flightHours - hours) * 60);

    // Determine flight category
    let flightCategory = 'Short-haul';
    if (distanceKm > 6000) flightCategory = 'Ultra long-haul';
    else if (distanceKm > 3500) flightCategory = 'Long-haul';
    else if (distanceKm > 1500) flightCategory = 'Medium-haul';

    return {
      departure,
      arrival,
      distanceKm: Math.round(distanceKm),
      distanceMiles: Math.round(distanceMiles),
      hours,
      minutes,
      totalMinutes: Math.round(flightHours * 60),
      flightCategory,
      cruisingAltitude: distanceKm > 1500 ? '35,000-42,000 ft' : '28,000-35,000 ft',
    };
  }, [departureCode, arrivalCode, aircraftSpeed]);

  const swapAirports = () => {
    setDepartureCode(arrivalCode);
    setArrivalCode(departureCode);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.flightTime.flightTimeEstimator', 'Flight Time Estimator')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.flightTime.calculateEstimatedFlightDurationBetween', 'Calculate estimated flight duration between airports')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.flightTime.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Airport Selection */}
            <div className="grid md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('tools.flightTime.departureAirport', 'Departure Airport')}
                </label>
                <select
                  value={departureCode}
                  onChange={(e) => setDepartureCode(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {AIRPORTS.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.code} - {airport.city}, {airport.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={swapAirports}
                  className="p-3 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
                  title={t('tools.flightTime.swapAirports', 'Swap airports')}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('tools.flightTime.arrivalAirport', 'Arrival Airport')}
                </label>
                <select
                  value={arrivalCode}
                  onChange={(e) => setArrivalCode(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {AIRPORTS.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.code} - {airport.city}, {airport.country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aircraft Speed */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.flightTime.averageAircraftSpeedKmH', 'Average Aircraft Speed (km/h)')}
              </label>
              <input
                type="number"
                min="500"
                max="1200"
                value={aircraftSpeed}
                onChange={(e) => setAircraftSpeed(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.flightTime.typicalCruisingSpeed800950', 'Typical cruising speed: 800-950 km/h')}
              </p>
            </div>

            {/* Results */}
            {flightDetails && (
              <div className="space-y-4">
                {/* Main Result */}
                <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/30 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    {t('tools.flightTime.estimatedFlightDuration', 'Estimated Flight Duration')}
                  </div>
                  <div className="text-5xl font-bold text-[#0D9488] mb-2">
                    {flightDetails.hours}h {flightDetails.minutes}m
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {flightDetails.departure.code} <ArrowRight className="w-4 h-4 inline" /> {flightDetails.arrival.code}
                  </div>
                </div>

                {/* Flight Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                    <Globe className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flightTime.distance', 'Distance')}</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {flightDetails.distanceKm.toLocaleString()} km
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {flightDetails.distanceMiles.toLocaleString()} mi
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                    <Clock className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flightTime.flightType', 'Flight Type')}</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {flightDetails.flightCategory}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                    <Plane className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flightTime.cruisingAltitude', 'Cruising Altitude')}</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {flightDetails.cruisingAltitude}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                    <Clock className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.flightTime.totalMinutes', 'Total Minutes')}</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {flightDetails.totalMinutes}
                    </div>
                  </div>
                </div>

                {/* Airport Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Departure: {flightDetails.departure.code}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {flightDetails.departure.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {flightDetails.departure.city}, {flightDetails.departure.country}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Arrival: {flightDetails.arrival.code}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {flightDetails.arrival.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {flightDetails.arrival.city}, {flightDetails.arrival.country}
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-start gap-3`}>
                  <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    This is an estimate based on great circle distance. Actual flight times may vary due to wind conditions,
                    air traffic, weather, and specific flight paths. Always check with your airline for accurate flight schedules.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTimeTool;
