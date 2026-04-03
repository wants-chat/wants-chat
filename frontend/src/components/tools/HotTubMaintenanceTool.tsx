import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Thermometer, Filter, Calendar, AlertTriangle, Info, RefreshCw, Beaker } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HotTubMaintenanceToolProps {
  uiConfig?: UIConfig;
}

type TubSize = 'small' | 'medium' | 'large' | 'xlarge' | 'custom';

interface ChemicalRange {
  min: number;
  max: number;
  ideal: number;
  unit: string;
}

interface ChemicalRanges {
  ph: ChemicalRange;
  alkalinity: ChemicalRange;
  chlorine: ChemicalRange;
  bromine: ChemicalRange;
}

const TUB_SIZES: Record<Exclude<TubSize, 'custom'>, { name: string; gallons: number }> = {
  small: { name: 'Small (2-3 person)', gallons: 200 },
  medium: { name: 'Medium (4-5 person)', gallons: 350 },
  large: { name: 'Large (6-7 person)', gallons: 500 },
  xlarge: { name: 'Extra Large (8+ person)', gallons: 700 },
};

const CHEMICAL_RANGES: ChemicalRanges = {
  ph: { min: 7.2, max: 7.8, ideal: 7.5, unit: 'pH' },
  alkalinity: { min: 80, max: 120, ideal: 100, unit: 'ppm' },
  chlorine: { min: 1, max: 3, ideal: 2, unit: 'ppm' },
  bromine: { min: 3, max: 5, ideal: 4, unit: 'ppm' },
};

export const HotTubMaintenanceTool: React.FC<HotTubMaintenanceToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Water Volume State
  const [tubSize, setTubSize] = useState<TubSize>('medium');
  const [customGallons, setCustomGallons] = useState('400');

  // Chemical Balance State
  const [sanitizerType, setSanitizerType] = useState<'chlorine' | 'bromine'>('chlorine');
  const [currentPh, setCurrentPh] = useState('7.2');
  const [currentAlkalinity, setCurrentAlkalinity] = useState('90');
  const [currentSanitizer, setCurrentSanitizer] = useState('1.5');

  // Maintenance Schedule State
  const [lastFilterClean, setLastFilterClean] = useState('');
  const [lastWaterChange, setLastWaterChange] = useState('');
  const [usageFrequency, setUsageFrequency] = useState<'light' | 'moderate' | 'heavy'>('moderate');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.tubSize) setTubSize(prefillData.tubSize as TubSize);
      if (prefillData.customGallons) setCustomGallons(String(prefillData.customGallons));
      if (prefillData.sanitizerType) setSanitizerType(prefillData.sanitizerType as 'chlorine' | 'bromine');
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Get water volume in gallons
  const waterVolume = useMemo(() => {
    if (tubSize === 'custom') {
      return parseFloat(customGallons) || 0;
    }
    return TUB_SIZES[tubSize].gallons;
  }, [tubSize, customGallons]);

  // Calculate chemical adjustments
  const chemicalAnalysis = useMemo(() => {
    const ph = parseFloat(currentPh) || 0;
    const alkalinity = parseFloat(currentAlkalinity) || 0;
    const sanitizer = parseFloat(currentSanitizer) || 0;
    const sanitizerRange = CHEMICAL_RANGES[sanitizerType];

    const getStatus = (value: number, range: ChemicalRange) => {
      if (value < range.min) return 'low';
      if (value > range.max) return 'high';
      return 'good';
    };

    const phStatus = getStatus(ph, CHEMICAL_RANGES.ph);
    const alkalinityStatus = getStatus(alkalinity, CHEMICAL_RANGES.alkalinity);
    const sanitizerStatus = getStatus(sanitizer, sanitizerRange);

    // Calculate pH adjustment (oz of pH Up or Down per 100 gallons)
    let phAdjustment = '';
    if (phStatus === 'low') {
      const ozNeeded = ((CHEMICAL_RANGES.ph.ideal - ph) * 0.6 * (waterVolume / 100)).toFixed(1);
      phAdjustment = `Add ${ozNeeded} oz of pH Up`;
    } else if (phStatus === 'high') {
      const ozNeeded = ((ph - CHEMICAL_RANGES.ph.ideal) * 0.8 * (waterVolume / 100)).toFixed(1);
      phAdjustment = `Add ${ozNeeded} oz of pH Down`;
    }

    // Calculate alkalinity adjustment (oz per 100 gallons)
    let alkalinityAdjustment = '';
    if (alkalinityStatus === 'low') {
      const ozNeeded = ((CHEMICAL_RANGES.alkalinity.ideal - alkalinity) * 0.05 * (waterVolume / 100)).toFixed(1);
      alkalinityAdjustment = `Add ${ozNeeded} oz of Alkalinity Increaser`;
    } else if (alkalinityStatus === 'high') {
      alkalinityAdjustment = 'Use pH Down to gradually lower (also lowers alkalinity)';
    }

    // Calculate sanitizer adjustment
    let sanitizerAdjustment = '';
    if (sanitizerStatus === 'low') {
      const diff = sanitizerRange.ideal - sanitizer;
      if (sanitizerType === 'chlorine') {
        const tspNeeded = (diff * 0.5 * (waterVolume / 250)).toFixed(1);
        sanitizerAdjustment = `Add ${tspNeeded} tsp of chlorine granules`;
      } else {
        const tspNeeded = (diff * 0.7 * (waterVolume / 250)).toFixed(1);
        sanitizerAdjustment = `Add ${tspNeeded} tsp of bromine granules`;
      }
    } else if (sanitizerStatus === 'high') {
      sanitizerAdjustment = 'Let it naturally dissipate or add fresh water';
    }

    return {
      ph: { value: ph, status: phStatus, adjustment: phAdjustment },
      alkalinity: { value: alkalinity, status: alkalinityStatus, adjustment: alkalinityAdjustment },
      sanitizer: { value: sanitizer, status: sanitizerStatus, adjustment: sanitizerAdjustment },
    };
  }, [currentPh, currentAlkalinity, currentSanitizer, sanitizerType, waterVolume]);

  // Calculate maintenance schedules
  const maintenanceSchedule = useMemo(() => {
    const now = new Date();
    const filterDate = lastFilterClean ? new Date(lastFilterClean) : null;
    const waterDate = lastWaterChange ? new Date(lastWaterChange) : null;

    // Filter cleaning intervals based on usage
    const filterIntervals = { light: 30, moderate: 14, heavy: 7 };
    const filterDays = filterIntervals[usageFrequency];

    // Water change intervals (typically 3-4 months)
    const waterIntervals = { light: 120, moderate: 90, heavy: 60 };
    const waterDays = waterIntervals[usageFrequency];

    let filterStatus = 'unknown';
    let filterDaysUntil = 0;
    let filterDaysSince = 0;
    if (filterDate) {
      filterDaysSince = Math.floor((now.getTime() - filterDate.getTime()) / (1000 * 60 * 60 * 24));
      filterDaysUntil = filterDays - filterDaysSince;
      if (filterDaysUntil <= 0) {
        filterStatus = 'overdue';
      } else if (filterDaysUntil <= 3) {
        filterStatus = 'soon';
      } else {
        filterStatus = 'good';
      }
    }

    let waterStatus = 'unknown';
    let waterDaysUntil = 0;
    let waterDaysSince = 0;
    if (waterDate) {
      waterDaysSince = Math.floor((now.getTime() - waterDate.getTime()) / (1000 * 60 * 60 * 24));
      waterDaysUntil = waterDays - waterDaysSince;
      if (waterDaysUntil <= 0) {
        waterStatus = 'overdue';
      } else if (waterDaysUntil <= 7) {
        waterStatus = 'soon';
      } else {
        waterStatus = 'good';
      }
    }

    return {
      filter: {
        status: filterStatus,
        daysSince: filterDaysSince,
        daysUntil: filterDaysUntil,
        interval: filterDays,
      },
      water: {
        status: waterStatus,
        daysSince: waterDaysSince,
        daysUntil: waterDaysUntil,
        interval: waterDays,
      },
    };
  }, [lastFilterClean, lastWaterChange, usageFrequency]);

  // Drain and refill calculator
  const drainRefillCalc = useMemo(() => {
    const liters = waterVolume * 3.785;
    const drainTimeMinutes = waterVolume / 10; // Approx 10 gal/min drain rate
    const fillTimeMinutes = waterVolume / 8; // Approx 8 gal/min fill rate
    const heatingHours = (waterVolume / 100) * 2; // Approx 2 hours per 100 gallons

    return {
      gallons: waterVolume.toFixed(0),
      liters: liters.toFixed(0),
      drainTime: drainTimeMinutes.toFixed(0),
      fillTime: fillTimeMinutes.toFixed(0),
      heatingTime: heatingHours.toFixed(1),
      totalTime: ((drainTimeMinutes + fillTimeMinutes) / 60 + heatingHours).toFixed(1),
    };
  }, [waterVolume]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'low':
      case 'high':
      case 'soon':
        return 'text-yellow-500';
      case 'overdue':
        return 'text-red-500';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good':
        return isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200';
      case 'low':
      case 'high':
      case 'soon':
        return isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200';
      case 'overdue':
        return isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200';
      default:
        return isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Droplets className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hotTubMaintenance.hotTubMaintenanceTool', 'Hot Tub Maintenance Tool')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hotTubMaintenance.waterChemistryFiltersAndMaintenance', 'Water chemistry, filters, and maintenance schedules')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Water Volume Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hotTubMaintenance.waterVolume', 'Water Volume')}</h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TUB_SIZES) as Exclude<TubSize, 'custom'>[]).map((size) => (
              <button
                key={size}
                onClick={() => setTubSize(size)}
                className={`py-2 px-3 rounded-lg text-sm ${tubSize === size ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {TUB_SIZES[size].name}
              </button>
            ))}
            <button
              onClick={() => setTubSize('custom')}
              className={`col-span-2 py-2 px-3 rounded-lg text-sm ${tubSize === 'custom' ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.hotTubMaintenance.customSize', 'Custom Size')}
            </button>
          </div>

          {tubSize === 'custom' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.hotTubMaintenance.customVolumeGallons', 'Custom Volume (gallons)')}
              </label>
              <input
                type="number"
                value={customGallons}
                onChange={(e) => setCustomGallons(e.target.value)}
                placeholder={t('tools.hotTubMaintenance.enterGallons', 'Enter gallons')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          )}

          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hotTubMaintenance.yourHotTubVolume', 'Your Hot Tub Volume')}</div>
            <div className="text-3xl font-bold text-cyan-500">{waterVolume.toLocaleString()} gal</div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {(waterVolume * 3.785).toLocaleString(undefined, { maximumFractionDigits: 0 })} liters
            </div>
          </div>
        </div>

        {/* Chemical Balance Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Beaker className="w-4 h-4 text-purple-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hotTubMaintenance.chemicalBalance', 'Chemical Balance')}</h4>
          </div>

          {/* Sanitizer Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setSanitizerType('chlorine')}
              className={`flex-1 py-2 rounded-lg ${sanitizerType === 'chlorine' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.hotTubMaintenance.chlorine', 'Chlorine')}
            </button>
            <button
              onClick={() => setSanitizerType('bromine')}
              className={`flex-1 py-2 rounded-lg ${sanitizerType === 'bromine' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.hotTubMaintenance.bromine', 'Bromine')}
            </button>
          </div>

          {/* Chemical Inputs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.hotTubMaintenance.phLevel2', 'pH Level')}
              </label>
              <input
                type="number"
                step="0.1"
                value={currentPh}
                onChange={(e) => setCurrentPh(e.target.value)}
                placeholder="7.2-7.8"
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Ideal: {CHEMICAL_RANGES.ph.min}-{CHEMICAL_RANGES.ph.max}
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.hotTubMaintenance.alkalinityPpm', 'Alkalinity (ppm)')}
              </label>
              <input
                type="number"
                value={currentAlkalinity}
                onChange={(e) => setCurrentAlkalinity(e.target.value)}
                placeholder="80-120"
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Ideal: {CHEMICAL_RANGES.alkalinity.min}-{CHEMICAL_RANGES.alkalinity.max}
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {sanitizerType === 'chlorine' ? t('tools.hotTubMaintenance.chlorine2', 'Chlorine') : t('tools.hotTubMaintenance.bromine2', 'Bromine')} (ppm)
              </label>
              <input
                type="number"
                step="0.5"
                value={currentSanitizer}
                onChange={(e) => setCurrentSanitizer(e.target.value)}
                placeholder={sanitizerType === 'chlorine' ? '1-3' : '3-5'}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Ideal: {CHEMICAL_RANGES[sanitizerType].min}-{CHEMICAL_RANGES[sanitizerType].max}
              </div>
            </div>
          </div>

          {/* Chemical Analysis Results */}
          <div className="space-y-3">
            <div className={`p-3 rounded-lg border ${getStatusBg(chemicalAnalysis.ph.status)}`}>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{t('tools.hotTubMaintenance.phLevel', 'pH Level')}</span>
                <span className={`font-semibold ${getStatusColor(chemicalAnalysis.ph.status)}`}>
                  {chemicalAnalysis.ph.value} - {chemicalAnalysis.ph.status === 'good' ? 'Good' : chemicalAnalysis.ph.status === 'low' ? t('tools.hotTubMaintenance.tooLow', 'Too Low') : t('tools.hotTubMaintenance.tooHigh', 'Too High')}
                </span>
              </div>
              {chemicalAnalysis.ph.adjustment && (
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{chemicalAnalysis.ph.adjustment}</p>
              )}
            </div>

            <div className={`p-3 rounded-lg border ${getStatusBg(chemicalAnalysis.alkalinity.status)}`}>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{t('tools.hotTubMaintenance.alkalinity', 'Alkalinity')}</span>
                <span className={`font-semibold ${getStatusColor(chemicalAnalysis.alkalinity.status)}`}>
                  {chemicalAnalysis.alkalinity.value} ppm - {chemicalAnalysis.alkalinity.status === 'good' ? 'Good' : chemicalAnalysis.alkalinity.status === 'low' ? t('tools.hotTubMaintenance.tooLow2', 'Too Low') : t('tools.hotTubMaintenance.tooHigh2', 'Too High')}
                </span>
              </div>
              {chemicalAnalysis.alkalinity.adjustment && (
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{chemicalAnalysis.alkalinity.adjustment}</p>
              )}
            </div>

            <div className={`p-3 rounded-lg border ${getStatusBg(chemicalAnalysis.sanitizer.status)}`}>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{sanitizerType === 'chlorine' ? t('tools.hotTubMaintenance.chlorine3', 'Chlorine') : t('tools.hotTubMaintenance.bromine3', 'Bromine')}</span>
                <span className={`font-semibold ${getStatusColor(chemicalAnalysis.sanitizer.status)}`}>
                  {chemicalAnalysis.sanitizer.value} ppm - {chemicalAnalysis.sanitizer.status === 'good' ? 'Good' : chemicalAnalysis.sanitizer.status === 'low' ? t('tools.hotTubMaintenance.tooLow3', 'Too Low') : t('tools.hotTubMaintenance.tooHigh3', 'Too High')}
                </span>
              </div>
              {chemicalAnalysis.sanitizer.adjustment && (
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{chemicalAnalysis.sanitizer.adjustment}</p>
              )}
            </div>
          </div>
        </div>

        {/* Maintenance Schedule Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hotTubMaintenance.maintenanceSchedule', 'Maintenance Schedule')}</h4>
          </div>

          {/* Usage Frequency */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.hotTubMaintenance.usageFrequency', 'Usage Frequency')}
            </label>
            <div className="flex gap-2">
              {(['light', 'moderate', 'heavy'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setUsageFrequency(freq)}
                  className={`flex-1 py-2 rounded-lg capitalize ${usageFrequency === freq ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Filter className="w-4 h-4 inline mr-1" />
                {t('tools.hotTubMaintenance.lastFilterClean', 'Last Filter Clean')}
              </label>
              <input
                type="date"
                value={lastFilterClean}
                onChange={(e) => setLastFilterClean(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <RefreshCw className="w-4 h-4 inline mr-1" />
                {t('tools.hotTubMaintenance.lastWaterChange', 'Last Water Change')}
              </label>
              <input
                type="date"
                value={lastWaterChange}
                onChange={(e) => setLastWaterChange(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          {/* Schedule Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${getStatusBg(maintenanceSchedule.filter.status)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-orange-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hotTubMaintenance.filterCleaning', 'Filter Cleaning')}</span>
              </div>
              {maintenanceSchedule.filter.status === 'unknown' ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hotTubMaintenance.setDateAboveToTrack', 'Set date above to track')}</p>
              ) : (
                <>
                  <div className={`text-lg font-bold ${getStatusColor(maintenanceSchedule.filter.status)}`}>
                    {maintenanceSchedule.filter.status === 'overdue'
                      ? `${Math.abs(maintenanceSchedule.filter.daysUntil)} days overdue`
                      : `${maintenanceSchedule.filter.daysUntil} days until next`}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Clean every {maintenanceSchedule.filter.interval} days
                  </p>
                </>
              )}
            </div>

            <div className={`p-4 rounded-lg border ${getStatusBg(maintenanceSchedule.water.status)}`}>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hotTubMaintenance.waterChange', 'Water Change')}</span>
              </div>
              {maintenanceSchedule.water.status === 'unknown' ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hotTubMaintenance.setDateAboveToTrack2', 'Set date above to track')}</p>
              ) : (
                <>
                  <div className={`text-lg font-bold ${getStatusColor(maintenanceSchedule.water.status)}`}>
                    {maintenanceSchedule.water.status === 'overdue'
                      ? `${Math.abs(maintenanceSchedule.water.daysUntil)} days overdue`
                      : `${maintenanceSchedule.water.daysUntil} days until next`}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Change every {maintenanceSchedule.water.interval} days
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Drain & Refill Calculator */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hotTubMaintenance.drainRefillCalculator', 'Drain & Refill Calculator')}</h4>
          </div>

          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hotTubMaintenance.drainTime', 'Drain Time')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{drainRefillCalc.drainTime} min</div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hotTubMaintenance.fillTime', 'Fill Time')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{drainRefillCalc.fillTime} min</div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hotTubMaintenance.heatingTime', 'Heating Time')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{drainRefillCalc.heatingTime} hrs</div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hotTubMaintenance.totalTime', 'Total Time')}</div>
                <div className="text-xl font-bold text-cyan-500">{drainRefillCalc.totalTime} hrs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.hotTubMaintenance.maintenanceTips', 'Maintenance Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Test water chemistry 2-3 times per week</li>
                <li>- Always adjust alkalinity before pH</li>
                <li>- Shock your hot tub weekly or after heavy use</li>
                <li>- Rinse filters with a hose between deep cleans</li>
                <li>- Keep water temperature below 104F (40C)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        {(chemicalAnalysis.ph.status !== 'good' || chemicalAnalysis.alkalinity.status !== 'good' || chemicalAnalysis.sanitizer.status !== 'good') && (
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                <strong>{t('tools.hotTubMaintenance.attentionNeeded', 'Attention Needed:')}</strong> Your water chemistry is out of balance.
                Follow the recommendations above to bring your levels back to the ideal range before using the hot tub.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotTubMaintenanceTool;
