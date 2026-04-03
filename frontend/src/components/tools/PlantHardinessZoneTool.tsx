import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Flower, Thermometer, MapPin, Info, ArrowLeftRight, Leaf, Snowflake, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PlantHardinessZoneToolProps {
  uiConfig?: UIConfig;
}

type InputMode = 'zip' | 'temperature';

interface HardinessZone {
  zone: string;
  minTemp: number;
  maxTemp: number;
  description: string;
}

interface ZoneResult {
  zone: string;
  minTemp: number;
  maxTemp: number;
  plants: string[];
  firstFrost: string;
  lastFrost: string;
  growingSeason: string;
}

// USDA Hardiness Zones data
const hardinessZones: HardinessZone[] = [
  { zone: '1a', minTemp: -60, maxTemp: -55, description: 'Extreme Arctic' },
  { zone: '1b', minTemp: -55, maxTemp: -50, description: 'Arctic' },
  { zone: '2a', minTemp: -50, maxTemp: -45, description: 'Very Cold' },
  { zone: '2b', minTemp: -45, maxTemp: -40, description: 'Very Cold' },
  { zone: '3a', minTemp: -40, maxTemp: -35, description: 'Cold' },
  { zone: '3b', minTemp: -35, maxTemp: -30, description: 'Cold' },
  { zone: '4a', minTemp: -30, maxTemp: -25, description: 'Cold' },
  { zone: '4b', minTemp: -25, maxTemp: -20, description: 'Cold' },
  { zone: '5a', minTemp: -20, maxTemp: -15, description: 'Moderate Cold' },
  { zone: '5b', minTemp: -15, maxTemp: -10, description: 'Moderate Cold' },
  { zone: '6a', minTemp: -10, maxTemp: -5, description: 'Moderate' },
  { zone: '6b', minTemp: -5, maxTemp: 0, description: 'Moderate' },
  { zone: '7a', minTemp: 0, maxTemp: 5, description: 'Mild' },
  { zone: '7b', minTemp: 5, maxTemp: 10, description: 'Mild' },
  { zone: '8a', minTemp: 10, maxTemp: 15, description: 'Warm' },
  { zone: '8b', minTemp: 15, maxTemp: 20, description: 'Warm' },
  { zone: '9a', minTemp: 20, maxTemp: 25, description: 'Hot' },
  { zone: '9b', minTemp: 25, maxTemp: 30, description: 'Hot' },
  { zone: '10a', minTemp: 30, maxTemp: 35, description: 'Tropical' },
  { zone: '10b', minTemp: 35, maxTemp: 40, description: 'Tropical' },
  { zone: '11a', minTemp: 40, maxTemp: 45, description: 'Tropical' },
  { zone: '11b', minTemp: 45, maxTemp: 50, description: 'Tropical' },
  { zone: '12a', minTemp: 50, maxTemp: 55, description: 'Tropical' },
  { zone: '12b', minTemp: 55, maxTemp: 60, description: 'Tropical' },
  { zone: '13a', minTemp: 60, maxTemp: 65, description: 'Tropical' },
  { zone: '13b', minTemp: 65, maxTemp: 70, description: 'Tropical' },
];

// Plants suitable for each zone range
const plantsByZone: Record<string, string[]> = {
  '1-2': ['Arctic Willow', 'Siberian Iris', 'Iceland Poppy', 'Arctic Poppy', 'Mountain Avens'],
  '3-4': ['Lilac', 'Peony', 'Hosta', 'Daylily', 'Bleeding Heart', 'Coral Bells', 'Black-Eyed Susan'],
  '5-6': ['Roses', 'Lavender', 'Hydrangea', 'Clematis', 'Japanese Maple', 'Butterfly Bush', 'Coneflower'],
  '7-8': ['Gardenias', 'Camellias', 'Crepe Myrtle', 'Fig Trees', 'Azaleas', 'Southern Magnolia', 'Oleander'],
  '9-10': ['Bougainvillea', 'Bird of Paradise', 'Hibiscus', 'Plumeria', 'Citrus Trees', 'Banana Plants', 'Mandevilla'],
  '11-13': ['Coconut Palm', 'Mango', 'Papaya', 'Orchids', 'Anthuriums', 'Heliconia', 'Tropical Ferns'],
};

// Frost dates by zone (approximate)
const frostDatesByZone: Record<string, { first: string; last: string; season: string }> = {
  '1': { first: 'Aug 1-15', last: 'Jun 15-30', season: '45-60 days' },
  '2': { first: 'Aug 15-31', last: 'Jun 1-15', season: '60-90 days' },
  '3': { first: 'Sep 1-15', last: 'May 15-31', season: '90-120 days' },
  '4': { first: 'Sep 15-30', last: 'May 1-15', season: '120-150 days' },
  '5': { first: 'Oct 1-15', last: 'Apr 15-30', season: '150-180 days' },
  '6': { first: 'Oct 15-31', last: 'Apr 1-15', season: '180-200 days' },
  '7': { first: 'Nov 1-15', last: 'Mar 15-31', season: '200-220 days' },
  '8': { first: 'Nov 15-30', last: 'Mar 1-15', season: '220-250 days' },
  '9': { first: 'Dec 1-15', last: 'Feb 15-28', season: '250-300 days' },
  '10': { first: 'Dec 15-31', last: 'Jan 31-Feb 15', season: '300-330 days' },
  '11': { first: 'Rare frost', last: 'Rare frost', season: '330-365 days' },
  '12': { first: 'No frost', last: 'No frost', season: '365 days' },
  '13': { first: 'No frost', last: 'No frost', season: '365 days' },
};

// Approximate ZIP code to zone mapping (simplified for demo - real implementation would use USDA API)
const zipToZone: Record<string, string> = {
  '0': '5b', '1': '6a', '2': '7a', '3': '8a', '4': '6b',
  '5': '4a', '6': '5a', '7': '8b', '8': '9a', '9': '9b',
};

export const PlantHardinessZoneTool: React.FC<PlantHardinessZoneToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('zip');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.zipCode) {
        setZipCode(String(prefillData.zipCode));
        setInputMode('zip');
      }
      if (prefillData.temperature) {
        setTemperature(String(prefillData.temperature));
        setInputMode('temperature');
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [zipCode, setZipCode] = useState('');
  const [temperature, setTemperature] = useState('');
  const [result, setResult] = useState<ZoneResult | null>(null);
  const [compareZone, setCompareZone] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const getZoneFromTemperature = (temp: number): HardinessZone | null => {
    for (const zone of hardinessZones) {
      if (temp >= zone.minTemp && temp < zone.maxTemp) {
        return zone;
      }
    }
    // Handle edge cases
    if (temp < -60) return hardinessZones[0];
    if (temp >= 70) return hardinessZones[hardinessZones.length - 1];
    return null;
  };

  const getZoneFromZip = (zip: string): HardinessZone | null => {
    if (zip.length < 1) return null;
    const firstDigit = zip.charAt(0);
    const zoneName = zipToZone[firstDigit] || '6a';
    return hardinessZones.find(z => z.zone === zoneName) || null;
  };

  const getPlantsForZone = (zoneName: string): string[] => {
    const zoneNumber = parseInt(zoneName);
    if (zoneNumber <= 2) return plantsByZone['1-2'];
    if (zoneNumber <= 4) return plantsByZone['3-4'];
    if (zoneNumber <= 6) return plantsByZone['5-6'];
    if (zoneNumber <= 8) return plantsByZone['7-8'];
    if (zoneNumber <= 10) return plantsByZone['9-10'];
    return plantsByZone['11-13'];
  };

  const getFrostDates = (zoneName: string): { first: string; last: string; season: string } => {
    const zoneNumber = parseInt(zoneName).toString();
    return frostDatesByZone[zoneNumber] || { first: 'Unknown', last: 'Unknown', season: 'Unknown' };
  };

  const calculateZone = () => {
    let zone: HardinessZone | null = null;
    const errors: Record<string, string> = {};

    if (inputMode === 'zip') {
      if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
        errors.zipCode = 'Please enter a valid 5-digit US ZIP code';
        setFormErrors(errors);
        return;
      }
      zone = getZoneFromZip(zipCode);
    } else {
      const temp = parseFloat(temperature);
      if (isNaN(temp)) {
        errors.temperature = 'Please enter a valid temperature';
        setFormErrors(errors);
        return;
      }
      zone = getZoneFromTemperature(temp);
    }

    setFormErrors({});

    if (zone) {
      const frostDates = getFrostDates(zone.zone);
      setResult({
        zone: zone.zone,
        minTemp: zone.minTemp,
        maxTemp: zone.maxTemp,
        plants: getPlantsForZone(zone.zone),
        firstFrost: frostDates.first,
        lastFrost: frostDates.last,
        growingSeason: frostDates.season,
      });
    }
  };

  const reset = () => {
    setZipCode('');
    setTemperature('');
    setResult(null);
    setShowComparison(false);
    setCompareZone('');
  };

  const getComparisonZone = (): ZoneResult | null => {
    const zone = hardinessZones.find(z => z.zone === compareZone);
    if (!zone) return null;
    const frostDates = getFrostDates(zone.zone);
    return {
      zone: zone.zone,
      minTemp: zone.minTemp,
      maxTemp: zone.maxTemp,
      plants: getPlantsForZone(zone.zone),
      firstFrost: frostDates.first,
      lastFrost: frostDates.last,
      growingSeason: frostDates.season,
    };
  };

  const getZoneColor = (zone: string): string => {
    const zoneNumber = parseInt(zone);
    if (zoneNumber <= 2) return '#1e40af'; // Dark blue
    if (zoneNumber <= 4) return '#3b82f6'; // Blue
    if (zoneNumber <= 6) return '#10b981'; // Green
    if (zoneNumber <= 8) return '#84cc16'; // Lime
    if (zoneNumber <= 10) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const comparisonResult = showComparison ? getComparisonZone() : null;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Flower className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.plantHardinessZone.plantHardinessZoneFinder', 'Plant Hardiness Zone Finder')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.plantHardinessZone.findYourUsdaHardinessZone', 'Find your USDA hardiness zone and discover what plants thrive in your area')}
              </p>
            </div>
          </div>

          {/* Input Mode Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode('zip')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  inputMode === 'zip'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {t('tools.plantHardinessZone.byZipCode', 'By ZIP Code')}
              </button>
              <button
                onClick={() => setInputMode('temperature')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  inputMode === 'temperature'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Thermometer className="w-4 h-4" />
                {t('tools.plantHardinessZone.byTemperature', 'By Temperature')}
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {inputMode === 'zip' ? (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.plantHardinessZone.zipCodeUs', 'ZIP Code (US)')}
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => {
                      setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5));
                      if (formErrors.zipCode) setFormErrors({});
                    }}
                    placeholder={t('tools.plantHardinessZone.enter5DigitZipCode', 'Enter 5-digit ZIP code (e.g., 90210)')}
                    maxLength={5}
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      formErrors.zipCode
                        ? 'border-red-500'
                        : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                {formErrors.zipCode && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>
                )}
              </div>
            ) : (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.plantHardinessZone.averageAnnualMinimumTemperatureF', 'Average Annual Minimum Temperature (°F)')}
                </label>
                <div className="relative">
                  <Thermometer className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => {
                      setTemperature(e.target.value);
                      if (formErrors.temperature) setFormErrors({});
                    }}
                    placeholder={t('tools.plantHardinessZone.enterMinimumTemperatureEG', 'Enter minimum temperature (e.g., -10)')}
                    className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                      formErrors.temperature
                        ? 'border-red-500'
                        : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                {formErrors.temperature && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.temperature}</p>
                )}
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {t('tools.plantHardinessZone.thisIsTheAverageColdest', 'This is the average coldest temperature your area experiences each year')}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateZone}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Flower className="w-5 h-5" />
              {t('tools.plantHardinessZone.findMyZone', 'Find My Zone')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.plantHardinessZone.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Zone Display */}
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: `${getZoneColor(result.zone)}15`,
                  borderLeft: `4px solid ${getZoneColor(result.zone)}`,
                }}
              >
                <div className="text-center mb-4">
                  <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.plantHardinessZone.yourUsdaHardinessZone', 'Your USDA Hardiness Zone')}
                  </div>
                  <div
                    className="text-6xl font-bold mb-2"
                    style={{ color: getZoneColor(result.zone) }}
                  >
                    {result.zone.toUpperCase()}
                  </div>
                  <div className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Temperature Range: {result.minTemp}°F to {result.maxTemp}°F
                  </div>
                </div>

                {/* Visual Zone Indicator */}
                <div className="mt-6">
                  <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.plantHardinessZone.zoneScale', 'Zone Scale')}
                  </div>
                  <div className="flex h-6 rounded-lg overflow-hidden">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'].map((z) => {
                      const isCurrentZone = result.zone.startsWith(z);
                      return (
                        <div
                          key={z}
                          className={`flex-1 flex items-center justify-center text-xs font-bold ${
                            isCurrentZone ? 'ring-2 ring-white ring-offset-1' : ''
                          }`}
                          style={{ backgroundColor: getZoneColor(z) }}
                          title={`Zone ${z}`}
                        >
                          <span className="text-white drop-shadow">{isCurrentZone ? z : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tools.plantHardinessZone.coldest', 'Coldest')}</span>
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tools.plantHardinessZone.warmest', 'Warmest')}</span>
                  </div>
                </div>
              </div>

              {/* Frost Dates */}
              <div className={`grid grid-cols-3 gap-4`}>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <Snowflake className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.plantHardinessZone.firstFrost', 'First Frost')}
                  </div>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {result.firstFrost}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <Sun className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.plantHardinessZone.lastFrost', 'Last Frost')}
                  </div>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {result.lastFrost}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <Leaf className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.plantHardinessZone.growingSeason', 'Growing Season')}
                  </div>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {result.growingSeason}
                  </div>
                </div>
              </div>

              {/* Recommended Plants */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Flower className="w-5 h-5 text-[#0D9488]" />
                  Plants That Thrive in Zone {result.zone.toUpperCase()}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.plants.map((plant, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-600 text-gray-200' : t('tools.plantHardinessZone.bg0d948810Text0d9488', 'bg-[#0D9488]/10 text-[#0D9488]')
                      }`}
                    >
                      {plant}
                    </span>
                  ))}
                </div>
              </div>

              {/* Zone Comparison */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`w-full flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  <span className="font-semibold flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-[#0D9488]" />
                    {t('tools.plantHardinessZone.compareWithAnotherZone', 'Compare with Another Zone')}
                  </span>
                  <span>{showComparison ? '−' : '+'}</span>
                </button>

                {showComparison && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.plantHardinessZone.selectZoneToCompare', 'Select Zone to Compare')}
                      </label>
                      <select
                        value={compareZone}
                        onChange={(e) => setCompareZone(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.plantHardinessZone.selectAZone', 'Select a zone')}</option>
                        {hardinessZones.map((zone) => (
                          <option key={zone.zone} value={zone.zone}>
                            Zone {zone.zone.toUpperCase()} ({zone.minTemp}°F to {zone.maxTemp}°F)
                          </option>
                        ))}
                      </select>
                    </div>

                    {comparisonResult && (
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        {/* Your Zone */}
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: `${getZoneColor(result.zone)}15`,
                            border: `2px solid ${getZoneColor(result.zone)}`,
                          }}
                        >
                          <div className="text-center mb-3">
                            <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.plantHardinessZone.yourZone', 'Your Zone')}
                            </div>
                            <div className="text-3xl font-bold" style={{ color: getZoneColor(result.zone) }}>
                              {result.zone.toUpperCase()}
                            </div>
                          </div>
                          <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div>Temp: {result.minTemp}°F to {result.maxTemp}°F</div>
                            <div>Season: {result.growingSeason}</div>
                          </div>
                        </div>

                        {/* Comparison Zone */}
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: `${getZoneColor(comparisonResult.zone)}15`,
                            border: `2px solid ${getZoneColor(comparisonResult.zone)}`,
                          }}
                        >
                          <div className="text-center mb-3">
                            <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('tools.plantHardinessZone.comparisonZone', 'Comparison Zone')}
                            </div>
                            <div className="text-3xl font-bold" style={{ color: getZoneColor(comparisonResult.zone) }}>
                              {comparisonResult.zone.toUpperCase()}
                            </div>
                          </div>
                          <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div>Temp: {comparisonResult.minTemp}°F to {comparisonResult.maxTemp}°F</div>
                            <div>Season: {comparisonResult.growingSeason}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Section */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`w-full mt-6 flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.plantHardinessZone.aboutUsdaHardinessZones', 'About USDA Hardiness Zones')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showInfo ? '−' : '+'}
            </span>
          </button>

          {showInfo && (
            <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  <strong>{t('tools.plantHardinessZone.usdaPlantHardinessZones', 'USDA Plant Hardiness Zones')}</strong> are geographic areas defined by the average annual minimum winter temperature, divided into 10-degree Fahrenheit zones.
                </p>
                <p>
                  {t('tools.plantHardinessZone.eachZoneIsFurtherDivided', 'Each zone is further divided into \'a\' and \'b\' segments, representing 5-degree differences. Zone 1 is the coldest (Alaska), while Zone 13 is the warmest (Hawaii, Puerto Rico).')}
                </p>
                <p>
                  <strong>{t('tools.plantHardinessZone.howToUse', 'How to Use:')}</strong> When purchasing plants, look for the hardiness zone on the plant tag. Choose plants rated for your zone or colder to ensure survival through winter.
                </p>
                <p className="text-xs italic">
                  {t('tools.plantHardinessZone.noteThisToolProvidesEstimates', 'Note: This tool provides estimates. For precise zone information, visit the USDA\'s official Plant Hardiness Zone Map.')}
                </p>
              </div>
            </div>
          )}

          {/* Zone Reference Table */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.plantHardinessZone.quickZoneReference', 'Quick Zone Reference')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {['1-2', '3-4', '5-6', '7-8', '9-10', '11-13'].map((range) => {
                const zones = range.split('-');
                const startZone = zones[0];
                return (
                  <div
                    key={range}
                    className="p-2 rounded text-center"
                    style={{
                      backgroundColor: `${getZoneColor(startZone)}20`,
                      color: getZoneColor(startZone),
                    }}
                  >
                    <div className="font-bold">Zones {range}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {hardinessZones.find(z => z.zone.startsWith(startZone))?.description || ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default PlantHardinessZoneTool;
