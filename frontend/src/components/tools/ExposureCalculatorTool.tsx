import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Aperture, Sun, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ExposureCalculatorToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

export const ExposureCalculatorTool: React.FC<ExposureCalculatorToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [mode, setMode] = useState<'ev' | 'reciprocity'>('ev');

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.aperture) setAperture(prefillData.params.aperture);
      if (prefillData.params.shutter) setShutter(prefillData.params.shutter);
      if (prefillData.params.iso) setIso(prefillData.params.iso);
      setIsPrefilled(true);
    }
  }, [prefillData]);
  const [aperture, setAperture] = useState('5.6');
  const [shutter, setShutter] = useState('1/125');
  const [iso, setIso] = useState('100');
  const [targetAperture, setTargetAperture] = useState('8');
  const [copied, setCopied] = useState(false);

  const apertures = ['1.4', '2', '2.8', '4', '5.6', '8', '11', '16', '22'];
  const shutters = ['30', '15', '8', '4', '2', '1', '1/2', '1/4', '1/8', '1/15', '1/30', '1/60', '1/125', '1/250', '1/500', '1/1000', '1/2000', '1/4000'];
  const isos = ['50', '100', '200', '400', '800', '1600', '3200', '6400'];

  const parseShutter = (s: string): number => {
    if (s.includes('/')) {
      const [num, den] = s.split('/').map(Number);
      return num / den;
    }
    return parseFloat(s);
  };

  const formatShutter = (seconds: number): string => {
    if (seconds >= 1) return `${seconds}s`;
    const reciprocal = Math.round(1 / seconds);
    return `1/${reciprocal}`;
  };

  const ev = useMemo(() => {
    const a = parseFloat(aperture);
    const s = parseShutter(shutter);
    const i = parseFloat(iso);
    // EV = log2(aperture² / shutter) - log2(ISO/100)
    return Math.log2((a * a) / s) - Math.log2(i / 100);
  }, [aperture, shutter, iso]);

  const newSettings = useMemo(() => {
    const targetA = parseFloat(targetAperture);
    const i = parseFloat(iso);
    // Calculate new shutter to maintain same EV
    const adjustedEv = ev + Math.log2(i / 100);
    const newShutterSeconds = (targetA * targetA) / Math.pow(2, adjustedEv);

    // Find closest shutter speed
    let closestShutter = shutters[0];
    let minDiff = Infinity;
    shutters.forEach(s => {
      const diff = Math.abs(parseShutter(s) - newShutterSeconds);
      if (diff < minDiff) {
        minDiff = diff;
        closestShutter = s;
      }
    });

    return {
      aperture: targetAperture,
      shutter: closestShutter,
      exactShutter: formatShutter(newShutterSeconds),
      iso,
    };
  }, [ev, targetAperture, iso]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`f/${newSettings.aperture}, ${newSettings.shutter}, ISO ${newSettings.iso}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lightConditions = [
    { ev: 15, desc: 'Bright sunny day' },
    { ev: 14, desc: 'Hazy sun' },
    { ev: 13, desc: 'Cloudy bright' },
    { ev: 12, desc: 'Overcast' },
    { ev: 11, desc: 'Heavy overcast' },
    { ev: 8, desc: 'Indoor, bright' },
    { ev: 5, desc: 'Indoor, normal' },
    { ev: 2, desc: 'Candlelight' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Aperture className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.exposureCalculator.exposureCalculator', 'Exposure Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.exposureCalculator.calculateEquivalentExposures', 'Calculate equivalent exposures')}</p>
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{t('tools.exposureCalculator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Current EV Display */}
        <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-100'} border`}>
          <div className="flex items-center justify-center gap-2">
            <Sun className="w-5 h-5 text-cyan-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.exposureCalculator.exposureValue', 'Exposure Value')}</span>
          </div>
          <div className={`text-4xl font-bold text-cyan-500 my-1`}>EV {ev.toFixed(1)}</div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {lightConditions.find(l => Math.abs(l.ev - ev) < 1)?.desc || 'Custom lighting'}
          </div>
        </div>

        {/* Current Settings */}
        <div className="space-y-4">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.exposureCalculator.currentSettings', 'Current Settings')}</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.exposureCalculator.aperture', 'Aperture')}</label>
              <select value={aperture} onChange={(e) => setAperture(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                {apertures.map(a => <option key={a} value={a}>f/{a}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.exposureCalculator.shutter', 'Shutter')}</label>
              <select value={shutter} onChange={(e) => setShutter(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                {shutters.map(s => <option key={s} value={s}>{s}s</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.exposureCalculator.iso', 'ISO')}</label>
              <select value={iso} onChange={(e) => setIso(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                {isos.map(i => <option key={i} value={i}>ISO {i}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Target Aperture */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.exposureCalculator.targetAperture', 'Target Aperture')}</label>
          <div className="flex flex-wrap gap-2">
            {apertures.map(a => (
              <button key={a} onClick={() => setTargetAperture(a)} className={`px-4 py-2 rounded-lg ${targetAperture === a ? 'bg-cyan-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                f/{a}
              </button>
            ))}
          </div>
        </div>

        {/* New Settings */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.exposureCalculator.equivalentExposure', 'Equivalent Exposure')}</h4>
            <button onClick={handleCopy} className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1 ${copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.exposureCalculator.copied', 'Copied!') : t('tools.exposureCalculator.copy', 'Copy')}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>f/{newSettings.aperture}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.exposureCalculator.aperture2', 'Aperture')}</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-cyan-900/30' : 'bg-cyan-50'}`}>
              <div className={`text-2xl font-bold text-cyan-500`}>{newSettings.shutter}s</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.exposureCalculator.shutter2', 'Shutter')}</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ISO {newSettings.iso}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.exposureCalculator.sensitivity', 'Sensitivity')}</div>
            </div>
          </div>
        </div>

        {/* Light Conditions Reference */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.exposureCalculator.lightConditionsGuide', 'Light Conditions Guide')}</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {lightConditions.slice(0, 8).map(l => (
              <button key={l.ev} onClick={() => {
                setAperture('8');
                setIso('100');
                setShutter(shutters.find(s => Math.abs(Math.log2((64) / parseShutter(s)) - l.ev) < 0.5) || '1/125');
              }} className={`p-2 rounded text-left ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'}`}>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>EV {l.ev}</div>
                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{l.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExposureCalculatorTool;
