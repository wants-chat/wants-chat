import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gauge, Circle, ArrowUpDown, AlertTriangle, Info, Sparkles, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SpeedometerErrorToolProps {
  uiConfig?: UIConfig;
}

export const SpeedometerErrorTool: React.FC<SpeedometerErrorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'tire-size' | 'diameter'>('tire-size');

  // Tire size mode
  const [origWidth, setOrigWidth] = useState('225');
  const [origAspect, setOrigAspect] = useState('55');
  const [origRim, setOrigRim] = useState('17');
  const [newWidth, setNewWidth] = useState('235');
  const [newAspect, setNewAspect] = useState('50');
  const [newRim, setNewRim] = useState('18');

  // Diameter mode
  const [origDiameter, setOrigDiameter] = useState('27');
  const [newDiameter, setNewDiameter] = useState('28');

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.originalTire !== undefined) {
        const match = String(params.originalTire).match(/(\d+)\/(\d+)R?(\d+)/i);
        if (match) {
          setOrigWidth(match[1]);
          setOrigAspect(match[2]);
          setOrigRim(match[3]);
          setIsPrefilled(true);
        }
      }
      if (params.newTire !== undefined) {
        const match = String(params.newTire).match(/(\d+)\/(\d+)R?(\d+)/i);
        if (match) {
          setNewWidth(match[1]);
          setNewAspect(match[2]);
          setNewRim(match[3]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const calculateDiameterFromTire = (width: number, aspect: number, rim: number) => {
    const sidewallHeight = (width * aspect) / 100;
    return (sidewallHeight * 2) + (rim * 25.4); // mm
  };

  const calculations = useMemo(() => {
    let origDiameterMM: number;
    let newDiameterMM: number;

    if (mode === 'tire-size') {
      origDiameterMM = calculateDiameterFromTire(
        parseFloat(origWidth) || 0,
        parseFloat(origAspect) || 0,
        parseFloat(origRim) || 0
      );
      newDiameterMM = calculateDiameterFromTire(
        parseFloat(newWidth) || 0,
        parseFloat(newAspect) || 0,
        parseFloat(newRim) || 0
      );
    } else {
      origDiameterMM = (parseFloat(origDiameter) || 0) * 25.4;
      newDiameterMM = (parseFloat(newDiameter) || 0) * 25.4;
    }

    const origDiameterInch = origDiameterMM / 25.4;
    const newDiameterInch = newDiameterMM / 25.4;

    // Calculate the ratio
    const ratio = origDiameterMM > 0 ? newDiameterMM / origDiameterMM : 1;

    // Speedometer error percentage
    // If new tire is larger, speedometer reads LOWER than actual
    // Error = (1 - ratio) * 100
    const errorPercent = (1 - ratio) * 100;

    // Odometer reads less miles than actually traveled if tires are larger
    const odometerError = errorPercent;

    // Speed comparisons
    const speedTests = [25, 35, 45, 55, 65, 75, 85].map((displayed) => ({
      displayed,
      actual: displayed * ratio,
      difference: displayed * (ratio - 1),
    }));

    // Distance comparisons (after 100 miles shown on odometer)
    const distanceTests = [50, 100, 500, 1000, 5000, 10000].map((displayed) => ({
      displayed,
      actual: displayed * ratio,
      difference: displayed * (ratio - 1),
    }));

    // Calculate how this affects various things
    const gasMileageEffect = (ratio - 1) * 100; // Positive = appears better than reality
    const yearlyOdometerError = 12000 * (ratio - 1); // Based on 12k miles/year

    return {
      origDiameterInch,
      newDiameterInch,
      diameterDiff: newDiameterInch - origDiameterInch,
      diameterDiffPercent: ((newDiameterMM - origDiameterMM) / origDiameterMM) * 100,
      ratio,
      errorPercent,
      odometerError,
      speedTests,
      distanceTests,
      gasMileageEffect,
      yearlyOdometerError,
      isSignificant: Math.abs(errorPercent) > 3,
    };
  }, [mode, origWidth, origAspect, origRim, newWidth, newAspect, newRim, origDiameter, newDiameter]);

  const commonWidths = ['185', '195', '205', '215', '225', '235', '245', '255', '265', '275', '285'];
  const commonAspects = ['30', '35', '40', '45', '50', '55', '60', '65', '70', '75'];
  const commonRims = ['14', '15', '16', '17', '18', '19', '20', '21', '22'];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Gauge className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.speedometerError.speedometerErrorCalculator', 'Speedometer Error Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.speedometerError.calculateSpeedometerOdometerErrorFrom', 'Calculate speedometer/odometer error from tire changes')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.speedometerError.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('tire-size')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === 'tire-size' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Circle className="w-4 h-4" /> Tire Size
          </button>
          <button
            onClick={() => setMode('diameter')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === 'diameter' ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Calculator className="w-4 h-4" /> Diameter
          </button>
        </div>

        {mode === 'tire-size' ? (
          <>
            {/* Original Tire */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.speedometerError.originalOemTireSize', 'Original (OEM) Tire Size')}
              </label>
              <div className="flex gap-1 items-center">
                <select
                  value={origWidth}
                  onChange={(e) => setOrigWidth(e.target.value)}
                  className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {commonWidths.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>/</span>
                <select
                  value={origAspect}
                  onChange={(e) => setOrigAspect(e.target.value)}
                  className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {commonAspects.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>R</span>
                <select
                  value={origRim}
                  onChange={(e) => setOrigRim(e.target.value)}
                  className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {commonRims.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Diameter: {calculations.origDiameterInch.toFixed(1)}" ({origWidth}/{origAspect}R{origRim})
              </div>
            </div>

            {/* New Tire */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.speedometerError.newTireSize', 'New Tire Size')}
              </label>
              <div className="flex gap-1 items-center">
                <select
                  value={newWidth}
                  onChange={(e) => setNewWidth(e.target.value)}
                  className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {commonWidths.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>/</span>
                <select
                  value={newAspect}
                  onChange={(e) => setNewAspect(e.target.value)}
                  className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {commonAspects.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>R</span>
                <select
                  value={newRim}
                  onChange={(e) => setNewRim(e.target.value)}
                  className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {commonRims.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Diameter: {calculations.newDiameterInch.toFixed(1)}" ({newWidth}/{newAspect}R{newRim})
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.speedometerError.originalDiameterInches', 'Original Diameter (inches)')}
              </label>
              <input
                type="number"
                step="0.1"
                value={origDiameter}
                onChange={(e) => setOrigDiameter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.speedometerError.newDiameterInches', 'New Diameter (inches)')}
              </label>
              <input
                type="number"
                step="0.1"
                value={newDiameter}
                onChange={(e) => setNewDiameter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        )}

        {/* Error Summary */}
        <div className={`p-6 rounded-xl text-center ${
          calculations.isSignificant
            ? isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
            : isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'
        } border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.speedometerError.speedometerError', 'Speedometer Error')}</div>
          <div className={`text-4xl font-bold my-2 ${
            calculations.isSignificant ? 'text-yellow-500' : 'text-teal-500'
          }`}>
            {calculations.errorPercent >= 0 ? '+' : ''}{calculations.errorPercent.toFixed(2)}%
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.errorPercent > 0
              ? 'Speedometer reads HIGH (shows faster than actual)'
              : calculations.errorPercent < 0
              ? t('tools.speedometerError.speedometerReadsLowShowsSlower', 'Speedometer reads LOW (shows slower than actual)') : t('tools.speedometerError.noSpeedometerError', 'No speedometer error')}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.speedometerError.diameterChange', 'Diameter Change')}</div>
            <div className={`text-xl font-bold ${calculations.diameterDiff > 0 ? 'text-teal-500' : calculations.diameterDiff < 0 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.diameterDiff >= 0 ? '+' : ''}{calculations.diameterDiff.toFixed(2)}"
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.speedometerError.sizeChange', 'Size Change')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.diameterDiffPercent >= 0 ? '+' : ''}{calculations.diameterDiffPercent.toFixed(1)}%
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.speedometerError.yearlyOdoError', 'Yearly Odo Error')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.yearlyOdometerError >= 0 ? '+' : ''}{Math.round(calculations.yearlyOdometerError)} mi
            </div>
          </div>
        </div>

        {/* Warning if significant */}
        {calculations.isSignificant && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
              <strong>{t('tools.speedometerError.significantErrorDetected', 'Significant Error Detected')}</strong>
              <p className="mt-1">
                {t('tools.speedometerError.anErrorGreaterThan3', 'An error greater than 3% may cause issues with:')}
              </p>
              <ul className="mt-1 list-disc list-inside">
                <li>{t('tools.speedometerError.speedSensitiveSafetySystemsAbs', 'Speed-sensitive safety systems (ABS, traction control)')}</li>
                <li>{t('tools.speedometerError.fuelEconomyCalculations', 'Fuel economy calculations')}</li>
                <li>{t('tools.speedometerError.warrantyAndServiceIntervals', 'Warranty and service intervals')}</li>
                <li>{t('tools.speedometerError.potentialSpeedingTickets', 'Potential speeding tickets')}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Speed Comparison Table */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Gauge className="w-4 h-4 inline mr-2" />
            {t('tools.speedometerError.speedometerVsActualSpeed', 'Speedometer vs Actual Speed')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2">{t('tools.speedometerError.speedoShows', 'Speedo Shows')}</th>
                  <th className="text-right py-2">{t('tools.speedometerError.actualSpeed', 'Actual Speed')}</th>
                  <th className="text-right py-2">{t('tools.speedometerError.difference', 'Difference')}</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {calculations.speedTests.map((row) => (
                  <tr key={row.displayed} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-2">{row.displayed} mph</td>
                    <td className="text-right py-2 font-medium">{row.actual.toFixed(1)} mph</td>
                    <td className={`text-right py-2 ${row.difference > 0 ? 'text-teal-500' : row.difference < 0 ? 'text-red-500' : ''}`}>
                      {row.difference >= 0 ? '+' : ''}{row.difference.toFixed(1)} mph
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Odometer Comparison Table */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <ArrowUpDown className="w-4 h-4 inline mr-2" />
            {t('tools.speedometerError.odometerVsActualDistance', 'Odometer vs Actual Distance')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2">{t('tools.speedometerError.odoShows', 'Odo Shows')}</th>
                  <th className="text-right py-2">{t('tools.speedometerError.actualDistance', 'Actual Distance')}</th>
                  <th className="text-right py-2">{t('tools.speedometerError.difference2', 'Difference')}</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {calculations.distanceTests.map((row) => (
                  <tr key={row.displayed} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-2">{row.displayed.toLocaleString()} mi</td>
                    <td className="text-right py-2 font-medium">{row.actual.toFixed(1)} mi</td>
                    <td className={`text-right py-2 ${row.difference > 0 ? 'text-teal-500' : row.difference < 0 ? 'text-red-500' : ''}`}>
                      {row.difference >= 0 ? '+' : ''}{row.difference.toFixed(1)} mi
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.speedometerError.understandingTheError', 'Understanding the Error:')}</strong>
              <ul className="mt-1 space-y-1">
                <li><strong>{t('tools.speedometerError.largerTires', 'Larger tires:')}</strong> {t('tools.speedometerError.actualSpeedIsFasterThan', 'Actual speed is faster than displayed')}</li>
                <li><strong>{t('tools.speedometerError.smallerTires', 'Smaller tires:')}</strong> {t('tools.speedometerError.actualSpeedIsSlowerThan', 'Actual speed is slower than displayed')}</li>
                <li>{t('tools.speedometerError.gpsSpeedIsAlwaysAccurate', 'GPS speed is always accurate and can verify your speedometer')}</li>
                <li>{t('tools.speedometerError.someVehiclesAllowSpeedometerCalibration', 'Some vehicles allow speedometer calibration for tire changes')}</li>
                <li>{t('tools.speedometerError.keepErrorUnder3For', 'Keep error under 3% for safety system compatibility')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedometerErrorTool;
