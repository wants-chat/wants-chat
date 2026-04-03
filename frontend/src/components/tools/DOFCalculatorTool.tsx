import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Focus, Ruler, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SensorSize {
  name: string;
  width: number;
  cropFactor: number;
}

interface DOFCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const DOFCalculatorTool: React.FC<DOFCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [focalLength, setFocalLength] = useState('50');
  const [aperture, setAperture] = useState('2.8');
  const [distance, setDistance] = useState('3');
  const [distanceUnit, setDistanceUnit] = useState<'m' | 'ft'>('m');
  const [sensorSize, setSensorSize] = useState('full');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        focalLength?: string;
        aperture?: string;
        distance?: string;
        distanceUnit?: 'm' | 'ft';
        sensorSize?: string;
      };
      if (params.focalLength) setFocalLength(params.focalLength);
      if (params.aperture) setAperture(params.aperture);
      if (params.distance) setDistance(params.distance);
      if (params.distanceUnit) setDistanceUnit(params.distanceUnit);
      if (params.sensorSize) setSensorSize(params.sensorSize);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const sensors: Record<string, SensorSize> = {
    full: { name: 'Full Frame (35mm)', width: 36, cropFactor: 1 },
    apsc: { name: 'APS-C (Canon)', width: 22.3, cropFactor: 1.6 },
    apsh: { name: 'APS-C (Nikon/Sony)', width: 23.5, cropFactor: 1.5 },
    mft: { name: 'Micro Four Thirds', width: 17.3, cropFactor: 2 },
    '1inch': { name: '1 inch', width: 13.2, cropFactor: 2.7 },
    phone: { name: 'Smartphone', width: 6.17, cropFactor: 5.6 },
  };

  const apertures = ['1.4', '1.8', '2', '2.8', '4', '5.6', '8', '11', '16', '22'];
  const focalLengths = ['14', '24', '35', '50', '85', '100', '135', '200'];

  const calculations = useMemo(() => {
    const f = parseFloat(focalLength); // focal length in mm
    const N = parseFloat(aperture); // f-number
    let d = parseFloat(distance); // distance
    const sensor = sensors[sensorSize];

    // Convert feet to meters if needed
    if (distanceUnit === 'ft') {
      d = d * 0.3048;
    }

    // Circle of confusion (mm) - roughly sensor diagonal / 1500
    const coc = sensor.width / 1500;

    // Convert distance to mm
    const dMm = d * 1000;

    // Hyperfocal distance (mm)
    const H = (f * f) / (N * coc) + f;

    // Near focus limit (mm)
    const nearMm = (H * dMm) / (H + (dMm - f));

    // Far focus limit (mm)
    const farMm = (H * dMm) / (H - (dMm - f));

    // Depth of field (mm)
    const dofMm = farMm - nearMm;

    // Convert back to selected units
    const toDisplayUnit = (mm: number) => {
      const meters = mm / 1000;
      if (distanceUnit === 'ft') {
        return meters / 0.3048;
      }
      return meters;
    };

    const near = toDisplayUnit(nearMm);
    const far = toDisplayUnit(farMm);
    const dof = toDisplayUnit(dofMm);
    const hyperfocal = toDisplayUnit(H);

    // Far limit can be infinity
    const isFarInfinity = farMm < 0 || dMm >= H - f;

    // Equivalent focal length for sensor
    const equivFocal = f * sensor.cropFactor;

    return {
      near: Math.max(0, near),
      far: isFarInfinity ? Infinity : far,
      dof: isFarInfinity ? Infinity : dof,
      hyperfocal,
      circleOfConfusion: coc,
      equivalentFocal: equivFocal,
      isInfinity: isFarInfinity,
    };
  }, [focalLength, aperture, distance, distanceUnit, sensorSize]);

  const formatDistance = (value: number): string => {
    if (!isFinite(value)) return '∞';
    if (value < 0.01) return '0';
    if (value >= 1000) return '∞';
    return value.toFixed(2);
  };

  const visualizeDOF = useMemo(() => {
    const d = parseFloat(distance);
    const near = calculations.near;
    const far = calculations.isInfinity ? d * 3 : calculations.far;
    const total = far + d * 0.2;

    const nearPercent = (near / total) * 100;
    const subjectPercent = (d / total) * 100;
    const farPercent = ((calculations.isInfinity ? d * 3 : far) / total) * 100;

    return { nearPercent, subjectPercent, farPercent };
  }, [calculations, distance]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg"><Focus className="w-5 h-5 text-indigo-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dOFCalculator.depthOfFieldCalculator', 'Depth of Field Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dOFCalculator.calculateFocusRangeForPhotography', 'Calculate focus range for photography')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.dOFCalculator.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Camera Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.dOFCalculator.sensorSize', 'Sensor Size')}</label>
            <select
              value={sensorSize}
              onChange={(e) => setSensorSize(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {Object.entries(sensors).map(([key, sensor]) => (
                <option key={key} value={key}>{sensor.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.dOFCalculator.focalLength', 'Focal Length')}</label>
            <div className="flex gap-2">
              <select
                value={focalLength}
                onChange={(e) => setFocalLength(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {focalLengths.map((f) => (
                  <option key={f} value={f}>{f}mm</option>
                ))}
              </select>
              <input
                type="number"
                value={focalLength}
                onChange={(e) => setFocalLength(e.target.value)}
                className={`w-20 px-3 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Aperture Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.dOFCalculator.apertureFStop', 'Aperture (f-stop)')}</label>
          <div className="flex flex-wrap gap-2">
            {apertures.map((a) => (
              <button
                key={a}
                onClick={() => setAperture(a)}
                className={`px-4 py-2 rounded-lg ${aperture === a ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                f/{a}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Distance */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.dOFCalculator.subjectDistance', 'Subject Distance')}</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              step="0.1"
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value as 'm' | 'ft')}
              className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="m">meters</option>
              <option value="ft">feet</option>
            </select>
          </div>
          <input
            type="range"
            min="0.3"
            max="50"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Visual DOF Representation */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-indigo-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dOFCalculator.focusRangeVisualization', 'Focus Range Visualization')}</span>
          </div>
          <div className="relative h-12 rounded-lg overflow-hidden">
            <div className={`absolute inset-0 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div
              className="absolute h-full bg-indigo-500/50"
              style={{
                left: `${visualizeDOF.nearPercent}%`,
                width: `${visualizeDOF.farPercent - visualizeDOF.nearPercent}%`,
              }}
            ></div>
            <div
              className="absolute top-0 h-full w-1 bg-indigo-500"
              style={{ left: `${visualizeDOF.subjectPercent}%` }}
            ></div>
            <div className="absolute top-1 left-2 text-xs text-white">📷</div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.dOFCalculator.camera', 'Camera')}</span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {calculations.isInfinity ? '∞' : 'Far limit'}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dOFCalculator.nearLimit', 'Near Limit')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatDistance(calculations.near)} {distanceUnit}
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dOFCalculator.depthOfField', 'Depth of Field')}</div>
              <div className="text-2xl font-bold text-indigo-500">
                {formatDistance(calculations.dof)} {distanceUnit}
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dOFCalculator.farLimit', 'Far Limit')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatDistance(calculations.far)} {distanceUnit}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.dOFCalculator.hyperfocalDistance', 'Hyperfocal Distance')}</div>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatDistance(calculations.hyperfocal)} {distanceUnit}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>35mm Equivalent</div>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.equivalentFocal.toFixed(0)}mm
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.dOFCalculator.tip', 'Tip:')}</strong> Smaller apertures (larger f-numbers like f/16) give more depth of field but may cause diffraction. Larger apertures (smaller f-numbers like f/1.8) create a shallower depth of field for bokeh effects.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DOFCalculatorTool;
