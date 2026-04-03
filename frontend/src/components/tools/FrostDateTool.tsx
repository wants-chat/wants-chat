import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Snowflake, Sun, MapPin, Calendar, Info, ThermometerSun, Leaf, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface FrostDateToolProps {
  uiConfig?: UIConfig;
}

interface FrostData {
  state: string;
  city: string;
  zone: string;
  lastSpringFrost: string;
  firstFallFrost: string;
  growingDays: number;
  avgLastFrost: number; // day of year
  avgFirstFrost: number; // day of year
}

// Sample data for major US cities
const frostDatabase: FrostData[] = [
  { state: 'AL', city: 'Birmingham', zone: '7b', lastSpringFrost: 'Mar 20', firstFallFrost: 'Nov 10', growingDays: 235, avgLastFrost: 79, avgFirstFrost: 314 },
  { state: 'AK', city: 'Anchorage', zone: '4b', lastSpringFrost: 'May 10', firstFallFrost: 'Sep 15', growingDays: 128, avgLastFrost: 130, avgFirstFrost: 258 },
  { state: 'AZ', city: 'Phoenix', zone: '9b', lastSpringFrost: 'Feb 5', firstFallFrost: 'Dec 15', growingDays: 313, avgLastFrost: 36, avgFirstFrost: 349 },
  { state: 'CA', city: 'Los Angeles', zone: '10b', lastSpringFrost: 'Jan 15', firstFallFrost: 'Dec 31', growingDays: 350, avgLastFrost: 15, avgFirstFrost: 365 },
  { state: 'CA', city: 'Sacramento', zone: '9b', lastSpringFrost: 'Feb 15', firstFallFrost: 'Dec 1', growingDays: 289, avgLastFrost: 46, avgFirstFrost: 335 },
  { state: 'CO', city: 'Denver', zone: '5b', lastSpringFrost: 'May 5', firstFallFrost: 'Oct 5', growingDays: 153, avgLastFrost: 125, avgFirstFrost: 278 },
  { state: 'CT', city: 'Hartford', zone: '6a', lastSpringFrost: 'Apr 25', firstFallFrost: 'Oct 10', growingDays: 168, avgLastFrost: 115, avgFirstFrost: 283 },
  { state: 'FL', city: 'Miami', zone: '11a', lastSpringFrost: 'None', firstFallFrost: 'None', growingDays: 365, avgLastFrost: 0, avgFirstFrost: 365 },
  { state: 'FL', city: 'Orlando', zone: '9b', lastSpringFrost: 'Feb 1', firstFallFrost: 'Dec 20', growingDays: 322, avgLastFrost: 32, avgFirstFrost: 354 },
  { state: 'GA', city: 'Atlanta', zone: '7b', lastSpringFrost: 'Mar 25', firstFallFrost: 'Nov 15', growingDays: 235, avgLastFrost: 84, avgFirstFrost: 319 },
  { state: 'IL', city: 'Chicago', zone: '5b', lastSpringFrost: 'Apr 20', firstFallFrost: 'Oct 20', growingDays: 183, avgLastFrost: 110, avgFirstFrost: 293 },
  { state: 'IN', city: 'Indianapolis', zone: '5b', lastSpringFrost: 'Apr 20', firstFallFrost: 'Oct 15', growingDays: 178, avgLastFrost: 110, avgFirstFrost: 288 },
  { state: 'MA', city: 'Boston', zone: '6b', lastSpringFrost: 'Apr 15', firstFallFrost: 'Oct 25', growingDays: 193, avgLastFrost: 105, avgFirstFrost: 298 },
  { state: 'MI', city: 'Detroit', zone: '6a', lastSpringFrost: 'Apr 25', firstFallFrost: 'Oct 15', growingDays: 173, avgLastFrost: 115, avgFirstFrost: 288 },
  { state: 'MN', city: 'Minneapolis', zone: '4b', lastSpringFrost: 'May 5', firstFallFrost: 'Oct 5', growingDays: 153, avgLastFrost: 125, avgFirstFrost: 278 },
  { state: 'MO', city: 'St. Louis', zone: '6b', lastSpringFrost: 'Apr 10', firstFallFrost: 'Oct 25', growingDays: 198, avgLastFrost: 100, avgFirstFrost: 298 },
  { state: 'NC', city: 'Charlotte', zone: '7b', lastSpringFrost: 'Mar 30', firstFallFrost: 'Nov 10', growingDays: 225, avgLastFrost: 89, avgFirstFrost: 314 },
  { state: 'NY', city: 'New York City', zone: '7a', lastSpringFrost: 'Apr 5', firstFallFrost: 'Nov 10', growingDays: 219, avgLastFrost: 95, avgFirstFrost: 314 },
  { state: 'OH', city: 'Columbus', zone: '6a', lastSpringFrost: 'Apr 20', firstFallFrost: 'Oct 15', growingDays: 178, avgLastFrost: 110, avgFirstFrost: 288 },
  { state: 'OR', city: 'Portland', zone: '8b', lastSpringFrost: 'Mar 25', firstFallFrost: 'Nov 15', growingDays: 235, avgLastFrost: 84, avgFirstFrost: 319 },
  { state: 'PA', city: 'Philadelphia', zone: '7a', lastSpringFrost: 'Apr 5', firstFallFrost: 'Nov 5', growingDays: 214, avgLastFrost: 95, avgFirstFrost: 309 },
  { state: 'TX', city: 'Houston', zone: '9a', lastSpringFrost: 'Feb 15', firstFallFrost: 'Dec 5', growingDays: 293, avgLastFrost: 46, avgFirstFrost: 339 },
  { state: 'TX', city: 'Dallas', zone: '8a', lastSpringFrost: 'Mar 10', firstFallFrost: 'Nov 20', growingDays: 255, avgLastFrost: 69, avgFirstFrost: 324 },
  { state: 'VA', city: 'Richmond', zone: '7a', lastSpringFrost: 'Apr 5', firstFallFrost: 'Nov 5', growingDays: 214, avgLastFrost: 95, avgFirstFrost: 309 },
  { state: 'WA', city: 'Seattle', zone: '8b', lastSpringFrost: 'Mar 15', firstFallFrost: 'Nov 20', growingDays: 250, avgLastFrost: 74, avgFirstFrost: 324 },
  { state: 'WI', city: 'Milwaukee', zone: '5b', lastSpringFrost: 'May 1', firstFallFrost: 'Oct 10', growingDays: 162, avgLastFrost: 121, avgFirstFrost: 283 },
];

const states = [...new Set(frostDatabase.map(f => f.state))].sort();

export const FrostDateTool: React.FC<FrostDateToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [manualZone, setManualZone] = useState<string>('');
  const [inputMode, setInputMode] = useState<'location' | 'zone'>('location');

  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.state) setSelectedState(String(prefillData.state));
      if (prefillData.city) setSelectedCity(String(prefillData.city));
      if (prefillData.zone) {
        setManualZone(String(prefillData.zone));
        setInputMode('zone');
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const citiesInState = useMemo(() => {
    return frostDatabase.filter(f => f.state === selectedState);
  }, [selectedState]);

  const selectedFrostData = useMemo(() => {
    if (inputMode === 'location') {
      return frostDatabase.find(f => f.state === selectedState && f.city === selectedCity);
    } else {
      // Find closest match by zone
      const zone = manualZone.toLowerCase();
      return frostDatabase.find(f => f.zone.toLowerCase() === zone) ||
             frostDatabase.find(f => f.zone.toLowerCase().startsWith(zone.charAt(0)));
    }
  }, [selectedState, selectedCity, manualZone, inputMode]);

  const getZoneData = (zone: string): { lastFrost: string; firstFrost: string; growingDays: number } => {
    const zoneNum = parseInt(zone);
    // Approximate frost dates by zone
    const zoneData: Record<number, { lastFrost: string; firstFrost: string; growingDays: number }> = {
      3: { lastFrost: 'May 15', firstFrost: 'Sep 15', growingDays: 123 },
      4: { lastFrost: 'May 10', firstFrost: 'Sep 25', growingDays: 138 },
      5: { lastFrost: 'Apr 30', firstFrost: 'Oct 10', growingDays: 163 },
      6: { lastFrost: 'Apr 15', firstFrost: 'Oct 20', growingDays: 188 },
      7: { lastFrost: 'Apr 5', firstFrost: 'Nov 5', growingDays: 214 },
      8: { lastFrost: 'Mar 15', firstFrost: 'Nov 15', growingDays: 245 },
      9: { lastFrost: 'Feb 15', firstFrost: 'Dec 5', growingDays: 293 },
      10: { lastFrost: 'Jan 31', firstFrost: 'Dec 15', growingDays: 318 },
      11: { lastFrost: 'None', firstFrost: 'None', growingDays: 365 },
    };
    return zoneData[zoneNum] || zoneData[6];
  };

  const zoneBasedData = useMemo(() => {
    if (inputMode === 'zone' && manualZone) {
      return getZoneData(manualZone);
    }
    return null;
  }, [manualZone, inputMode]);

  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  const getPlantingRecommendation = () => {
    const data = selectedFrostData || (zoneBasedData ? { avgLastFrost: 100, avgFirstFrost: 280, ...zoneBasedData } : null);
    if (!data) return null;

    const avgLastFrost = selectedFrostData?.avgLastFrost || 100;
    const avgFirstFrost = selectedFrostData?.avgFirstFrost || 280;

    if (dayOfYear < avgLastFrost - 60) {
      return { status: 'Plan', message: 'Start planning! Order seeds and plan your garden layout.', color: 'blue' };
    } else if (dayOfYear < avgLastFrost - 30) {
      return { status: 'Start Indoors', message: 'Time to start seeds indoors for warm-season crops.', color: 'purple' };
    } else if (dayOfYear < avgLastFrost) {
      return { status: 'Prepare', message: 'Prepare beds and harden off seedlings. Plant cool-season crops.', color: 'teal' };
    } else if (dayOfYear < avgLastFrost + 14) {
      return { status: 'Careful', message: 'Frost risk decreasing. Protect tender transplants at night.', color: 'amber' };
    } else if (dayOfYear < avgFirstFrost - 60) {
      return { status: 'Prime Time', message: 'Growing season in full swing! All crops can be planted.', color: 'green' };
    } else if (dayOfYear < avgFirstFrost - 30) {
      return { status: 'Fall Prep', message: 'Start fall crops. Last chance for quick-maturing vegetables.', color: 'orange' };
    } else if (dayOfYear < avgFirstFrost) {
      return { status: 'Frost Watch', message: 'Monitor forecasts. Harvest tender crops before frost.', color: 'red' };
    } else {
      return { status: 'Season End', message: 'Growing season ending. Focus on cold-hardy crops and cleanup.', color: 'gray' };
    }
  };

  const recommendation = getPlantingRecommendation();

  const formatDateFromDayOfYear = (doy: number): string => {
    const date = new Date(new Date().getFullYear(), 0);
    date.setDate(doy);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Snowflake className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.frostDate.frostDateFinder', 'Frost Date Finder')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.frostDate.findFrostDatesForYour', 'Find frost dates for your location')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Mode */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setInputMode('location')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              inputMode === 'location'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {t('tools.frostDate.byLocation', 'By Location')}
          </button>
          <button
            onClick={() => setInputMode('zone')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              inputMode === 'zone'
                ? 'bg-teal-500 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ThermometerSun className="w-4 h-4" />
            {t('tools.frostDate.byZone', 'By Zone')}
          </button>
        </div>

        {inputMode === 'location' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.frostDate.state', 'State')}</label>
              <select
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500`}
              >
                <option value="">{t('tools.frostDate.selectState', 'Select state...')}</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.frostDate.city', 'City')}</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500 disabled:opacity-50`}
              >
                <option value="">{t('tools.frostDate.selectCity', 'Select city...')}</option>
                {citiesInState.map(city => (
                  <option key={city.city} value={city.city}>{city.city}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.frostDate.usdaHardinessZone2', 'USDA Hardiness Zone')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {['3', '4', '5', '6', '7', '8', '9', '10', '11'].map(zone => (
                <button
                  key={zone}
                  onClick={() => setManualZone(zone)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    manualZone === zone
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Date Status */}
        {recommendation && (
          <div className={`p-4 rounded-lg border ${
            recommendation.color === 'green' ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200' :
            recommendation.color === 'amber' ? isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200' :
            recommendation.color === 'red' ? isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200' :
            recommendation.color === 'blue' ? isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200' :
            recommendation.color === 'purple' ? isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200' :
            recommendation.color === 'teal' ? isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200' :
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                recommendation.color === 'green' ? 'bg-green-500 text-white' :
                recommendation.color === 'amber' ? 'bg-amber-500 text-white' :
                recommendation.color === 'red' ? 'bg-red-500 text-white' :
                recommendation.color === 'blue' ? 'bg-blue-500 text-white' :
                recommendation.color === 'purple' ? 'bg-purple-500 text-white' :
                recommendation.color === 'teal' ? 'bg-teal-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {recommendation.status}
              </div>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{recommendation.message}</span>
            </div>
          </div>
        )}

        {/* Frost Date Results */}
        {(selectedFrostData || zoneBasedData) && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="w-4 h-4 text-teal-500" />
              Frost Dates {selectedFrostData ? `for ${selectedFrostData.city}, ${selectedFrostData.state}` : `(Zone ${manualZone})`}
            </h4>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 rounded-lg bg-blue-500/10">
                <Snowflake className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.frostDate.lastSpringFrost', 'Last Spring Frost')}</div>
                <div className="text-xl font-bold text-blue-500">
                  {selectedFrostData?.lastSpringFrost || zoneBasedData?.lastFrost}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-500/10">
                <Snowflake className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.frostDate.firstFallFrost', 'First Fall Frost')}</div>
                <div className="text-xl font-bold text-amber-500">
                  {selectedFrostData?.firstFallFrost || zoneBasedData?.firstFrost}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10">
                <Sun className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.frostDate.growingSeason', 'Growing Season')}</div>
                <div className="text-xl font-bold text-green-500">
                  {selectedFrostData?.growingDays || zoneBasedData?.growingDays} days
                </div>
              </div>
            </div>

            {selectedFrostData && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} mb-4`}>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.frostDate.usdaHardinessZone', 'USDA Hardiness Zone')}</span>
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedFrostData.zone}</span>
                </div>
              </div>
            )}

            {/* Growing Season Timeline */}
            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.frostDate.growingSeasonTimeline', 'Growing Season Timeline')}
              </div>
              <div className="relative h-8 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500 via-green-500 to-amber-500"
                  style={{
                    left: `${((selectedFrostData?.avgLastFrost || 100) / 365) * 100}%`,
                    width: `${(((selectedFrostData?.growingDays || zoneBasedData?.growingDays || 180)) / 365) * 100}%`
                  }}
                ></div>
                {/* Current day marker */}
                <div
                  className="absolute top-0 w-1 h-full bg-white shadow-lg"
                  style={{ left: `${(dayOfYear / 365) * 100}%` }}
                  title={t('tools.frostDate.today', 'Today')}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{t('tools.frostDate.jan', 'Jan')}</span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{t('tools.frostDate.apr', 'Apr')}</span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{t('tools.frostDate.jul', 'Jul')}</span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{t('tools.frostDate.oct', 'Oct')}</span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{t('tools.frostDate.dec', 'Dec')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Planting Windows */}
        {(selectedFrostData || zoneBasedData) && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Leaf className="w-4 h-4 text-green-500" />
              {t('tools.frostDate.keyPlantingWindows', 'Key Planting Windows')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.frostDate.startSeedsIndoors', 'Start seeds indoors')}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDateFromDayOfYear((selectedFrostData?.avgLastFrost || 100) - 42)} - {formatDateFromDayOfYear((selectedFrostData?.avgLastFrost || 100) - 28)}
                </span>
              </div>
              <div className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.frostDate.plantCoolSeasonCrops', 'Plant cool-season crops')}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDateFromDayOfYear((selectedFrostData?.avgLastFrost || 100) - 28)} - {formatDateFromDayOfYear((selectedFrostData?.avgLastFrost || 100) - 14)}
                </span>
              </div>
              <div className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.frostDate.transplantWarmSeasonCrops', 'Transplant warm-season crops')}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDateFromDayOfYear((selectedFrostData?.avgLastFrost || 100) + 7)} - {formatDateFromDayOfYear((selectedFrostData?.avgLastFrost || 100) + 21)}
                </span>
              </div>
              <div className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.frostDate.startFallGarden', 'Start fall garden')}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDateFromDayOfYear((selectedFrostData?.avgFirstFrost || 280) - 70)} - {formatDateFromDayOfYear((selectedFrostData?.avgFirstFrost || 280) - 56)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              <strong>{t('tools.frostDate.important', 'Important:')}</strong> Frost dates are averages. Actual dates can vary by 2-3 weeks in either direction. Always check local forecasts before planting tender crops.
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.frostDate.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.frostDate.microclimatesCanVaryFrostDates', 'Microclimates can vary frost dates - south-facing slopes warm earlier')}</li>
                <li>{t('tools.frostDate.urbanAreasOftenHaveLater', 'Urban areas often have later fall frosts due to heat island effect')}</li>
                <li>{t('tools.frostDate.coverTenderPlantsWithRow', 'Cover tender plants with row cover or sheets on frost nights')}</li>
                <li>A light frost (28-32F) damages tender plants; hard frost (below 28F) kills most</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrostDateTool;
