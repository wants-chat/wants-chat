import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Ruler, ArrowLeftRight, Info, Sparkles, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TireSizeToolProps {
  uiConfig?: UIConfig;
}

interface TireSize {
  width: number;
  aspectRatio: number;
  rimDiameter: number;
}

export const TireSizeTool: React.FC<TireSizeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Original tire
  const [origWidth, setOrigWidth] = useState('225');
  const [origAspect, setOrigAspect] = useState('55');
  const [origRim, setOrigRim] = useState('17');

  // New tire
  const [newWidth, setNewWidth] = useState('235');
  const [newAspect, setNewAspect] = useState('50');
  const [newRim, setNewRim] = useState('18');

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.tireSize !== undefined) {
        // Parse tire size string like "225/55R17"
        const match = String(params.tireSize).match(/(\d+)\/(\d+)R?(\d+)/i);
        if (match) {
          setOrigWidth(match[1]);
          setOrigAspect(match[2]);
          setOrigRim(match[3]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const calculateTireMetrics = (width: number, aspectRatio: number, rimDiameter: number) => {
    // All calculations in mm then converted
    const sidewallHeight = (width * aspectRatio) / 100;
    const overallDiameterMM = (sidewallHeight * 2) + (rimDiameter * 25.4);
    const overallDiameterInch = overallDiameterMM / 25.4;
    const circumferenceMM = Math.PI * overallDiameterMM;
    const circumferenceInch = circumferenceMM / 25.4;
    const revolutionsPerMile = 1609344 / circumferenceMM;
    const revolutionsPerKM = 1000000 / circumferenceMM;

    return {
      sidewallHeight,
      overallDiameterMM,
      overallDiameterInch,
      circumferenceMM,
      circumferenceInch,
      revolutionsPerMile,
      revolutionsPerKM,
      widthInches: width / 25.4,
    };
  };

  const calculations = useMemo(() => {
    const origWidthNum = parseFloat(origWidth) || 0;
    const origAspectNum = parseFloat(origAspect) || 0;
    const origRimNum = parseFloat(origRim) || 0;
    const newWidthNum = parseFloat(newWidth) || 0;
    const newAspectNum = parseFloat(newAspect) || 0;
    const newRimNum = parseFloat(newRim) || 0;

    const original = calculateTireMetrics(origWidthNum, origAspectNum, origRimNum);
    const newTire = calculateTireMetrics(newWidthNum, newAspectNum, newRimNum);

    // Calculate differences
    const diameterDiff = newTire.overallDiameterMM - original.overallDiameterMM;
    const diameterDiffPercent = (diameterDiff / original.overallDiameterMM) * 100;
    const widthDiff = newWidthNum - origWidthNum;
    const widthDiffPercent = (widthDiff / origWidthNum) * 100;

    // Speedometer error (positive = speedo reads lower than actual speed)
    const speedoError = -diameterDiffPercent;

    // At various speeds, what's the actual speed?
    const speedComparisons = [30, 50, 60, 70, 80].map((displayedSpeed) => ({
      displayed: displayedSpeed,
      actual: displayedSpeed * (1 - speedoError / 100),
      diff: displayedSpeed * (-speedoError / 100),
    }));

    // Is the new tire within acceptable range (typically 3% diameter difference)?
    const isAcceptable = Math.abs(diameterDiffPercent) <= 3;

    return {
      original,
      newTire,
      diameterDiff,
      diameterDiffPercent,
      widthDiff,
      widthDiffPercent,
      speedoError,
      speedComparisons,
      isAcceptable,
    };
  }, [origWidth, origAspect, origRim, newWidth, newAspect, newRim]);

  const swapSizes = () => {
    setOrigWidth(newWidth);
    setOrigAspect(newAspect);
    setOrigRim(newRim);
    setNewWidth(origWidth);
    setNewAspect(origAspect);
    setNewRim(origRim);
  };

  const commonWidths = ['185', '195', '205', '215', '225', '235', '245', '255', '265', '275', '285', '295', '305'];
  const commonAspects = ['30', '35', '40', '45', '50', '55', '60', '65', '70', '75'];
  const commonRims = ['14', '15', '16', '17', '18', '19', '20', '21', '22'];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Circle className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tireSize.tireSizeCalculator', 'Tire Size Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tireSize.compareTireSizesAndCheck', 'Compare tire sizes and check compatibility')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.tireSize.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Tire Size Input Grid */}
        <div className="grid grid-cols-7 gap-2 items-end">
          {/* Original Tire */}
          <div className="col-span-3 space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.tireSize.originalTireSize', 'Original Tire Size')}
            </label>
            <div className="flex gap-1 items-center">
              <select
                value={origWidth}
                onChange={(e) => setOrigWidth(e.target.value)}
                className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {commonWidths.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/</span>
              <select
                value={origAspect}
                onChange={(e) => setOrigAspect(e.target.value)}
                className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {commonAspects.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>R</span>
              <select
                value={origRim}
                onChange={(e) => setOrigRim(e.target.value)}
                className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {commonRims.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {origWidth}/{origAspect}R{origRim}
            </div>
          </div>

          {/* Swap Button */}
          <div className="col-span-1 flex justify-center">
            <button
              onClick={swapSizes}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              title={t('tools.tireSize.swapSizes', 'Swap sizes')}
            >
              <RefreshCw className="w-5 h-5 text-teal-500" />
            </button>
          </div>

          {/* New Tire */}
          <div className="col-span-3 space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.tireSize.newTireSize', 'New Tire Size')}
            </label>
            <div className="flex gap-1 items-center">
              <select
                value={newWidth}
                onChange={(e) => setNewWidth(e.target.value)}
                className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {commonWidths.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/</span>
              <select
                value={newAspect}
                onChange={(e) => setNewAspect(e.target.value)}
                className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {commonAspects.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>R</span>
              <select
                value={newRim}
                onChange={(e) => setNewRim(e.target.value)}
                className={`flex-1 px-2 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {commonRims.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {newWidth}/{newAspect}R{newRim}
            </div>
          </div>
        </div>

        {/* Compatibility Status */}
        <div className={`p-4 rounded-xl border ${
          calculations.isAcceptable
            ? isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'
            : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              calculations.isAcceptable ? 'bg-teal-500/20' : 'bg-red-500/20'
            }`}>
              {calculations.isAcceptable ? (
                <Circle className="w-5 h-5 text-teal-500" />
              ) : (
                <Circle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div>
              <div className={`font-semibold ${
                calculations.isAcceptable ? 'text-teal-500' : 'text-red-500'
              }`}>
                {calculations.isAcceptable ? t('tools.tireSize.compatibleSize', 'Compatible Size') : t('tools.tireSize.mayNotBeCompatible', 'May Not Be Compatible')}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Diameter difference: {calculations.diameterDiffPercent >= 0 ? '+' : ''}{calculations.diameterDiffPercent.toFixed(1)}%
                (recommended: within +/-3%)
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 inline mr-2" />
            {t('tools.tireSize.sizeComparison', 'Size Comparison')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2">{t('tools.tireSize.measurement', 'Measurement')}</th>
                  <th className="text-right py-2">{t('tools.tireSize.original', 'Original')}</th>
                  <th className="text-right py-2">{t('tools.tireSize.new', 'New')}</th>
                  <th className="text-right py-2">{t('tools.tireSize.difference', 'Difference')}</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <tr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-2">{t('tools.tireSize.overallDiameter', 'Overall Diameter')}</td>
                  <td className="text-right py-2">{calculations.original.overallDiameterInch.toFixed(1)}"</td>
                  <td className="text-right py-2">{calculations.newTire.overallDiameterInch.toFixed(1)}"</td>
                  <td className={`text-right py-2 ${calculations.diameterDiff > 0 ? 'text-teal-500' : calculations.diameterDiff < 0 ? 'text-red-500' : ''}`}>
                    {calculations.diameterDiff >= 0 ? '+' : ''}{(calculations.diameterDiff / 25.4).toFixed(2)}"
                  </td>
                </tr>
                <tr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-2">{t('tools.tireSize.sidewallHeight', 'Sidewall Height')}</td>
                  <td className="text-right py-2">{(calculations.original.sidewallHeight / 25.4).toFixed(1)}"</td>
                  <td className="text-right py-2">{(calculations.newTire.sidewallHeight / 25.4).toFixed(1)}"</td>
                  <td className="text-right py-2">
                    {((calculations.newTire.sidewallHeight - calculations.original.sidewallHeight) / 25.4).toFixed(2)}"
                  </td>
                </tr>
                <tr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-2">{t('tools.tireSize.width', 'Width')}</td>
                  <td className="text-right py-2">{calculations.original.widthInches.toFixed(1)}"</td>
                  <td className="text-right py-2">{calculations.newTire.widthInches.toFixed(1)}"</td>
                  <td className={`text-right py-2 ${calculations.widthDiff > 0 ? 'text-teal-500' : calculations.widthDiff < 0 ? 'text-red-500' : ''}`}>
                    {calculations.widthDiff >= 0 ? '+' : ''}{(calculations.widthDiff / 25.4).toFixed(2)}"
                  </td>
                </tr>
                <tr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-2">{t('tools.tireSize.circumference', 'Circumference')}</td>
                  <td className="text-right py-2">{calculations.original.circumferenceInch.toFixed(1)}"</td>
                  <td className="text-right py-2">{calculations.newTire.circumferenceInch.toFixed(1)}"</td>
                  <td className="text-right py-2">
                    {((calculations.newTire.circumferenceInch - calculations.original.circumferenceInch)).toFixed(2)}"
                  </td>
                </tr>
                <tr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-2">{t('tools.tireSize.revsMile', 'Revs/Mile')}</td>
                  <td className="text-right py-2">{Math.round(calculations.original.revolutionsPerMile)}</td>
                  <td className="text-right py-2">{Math.round(calculations.newTire.revolutionsPerMile)}</td>
                  <td className="text-right py-2">
                    {Math.round(calculations.newTire.revolutionsPerMile - calculations.original.revolutionsPerMile)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Speedometer Effect */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <ArrowLeftRight className="w-4 h-4 inline mr-2" />
            {t('tools.tireSize.speedometerReadingVsActualSpeed', 'Speedometer Reading vs Actual Speed')}
          </h4>
          <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            With new tires, your speedometer will read {Math.abs(calculations.speedoError).toFixed(1)}%
            {calculations.speedoError > 0 ? ' higher' : ' lower'} than actual speed.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2">{t('tools.tireSize.speedoShows', 'Speedo Shows')}</th>
                  <th className="text-right py-2">{t('tools.tireSize.actualSpeed', 'Actual Speed')}</th>
                  <th className="text-right py-2">{t('tools.tireSize.difference2', 'Difference')}</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {calculations.speedComparisons.map((row) => (
                  <tr key={row.displayed} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-2">{row.displayed} mph</td>
                    <td className="text-right py-2 font-medium">{row.actual.toFixed(1)} mph</td>
                    <td className={`text-right py-2 ${row.diff > 0 ? 'text-teal-500' : row.diff < 0 ? 'text-red-500' : ''}`}>
                      {row.diff >= 0 ? '+' : ''}{row.diff.toFixed(1)} mph
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
              <strong>{t('tools.tireSize.tireSizeGuide', 'Tire Size Guide:')}</strong>
              <ul className="mt-1 space-y-1">
                <li><strong>{t('tools.tireSize.width225', 'Width (225):')}</strong> {t('tools.tireSize.sectionWidthInMillimeters', 'Section width in millimeters')}</li>
                <li><strong>{t('tools.tireSize.aspectRatio55', 'Aspect Ratio (55):')}</strong> {t('tools.tireSize.sidewallHeightAsOfWidth', 'Sidewall height as % of width')}</li>
                <li><strong>{t('tools.tireSize.rimDiameter17', 'Rim Diameter (17):')}</strong> {t('tools.tireSize.wheelDiameterInInches', 'Wheel diameter in inches')}</li>
                <li>{t('tools.tireSize.stayWithin3OverallDiameter', 'Stay within 3% overall diameter to avoid issues')}</li>
                <li>Larger diameter = higher actual speed than displayed</li>
                <li>{t('tools.tireSize.widerTiresMayAffectFuel', 'Wider tires may affect fuel economy and handling')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TireSizeTool;
