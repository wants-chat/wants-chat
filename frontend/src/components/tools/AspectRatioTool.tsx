import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2, Lock, Unlock, Copy, Check, Monitor, Smartphone, Film, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type DimensionLock = 'width' | 'height' | 'none';

interface AspectRatioToolProps {
  uiConfig?: UIConfig;
}

export const AspectRatioTool: React.FC<AspectRatioToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [lock, setLock] = useState<DimensionLock>('none');
  const [targetRatio, setTargetRatio] = useState('');
  const [copied, setCopied] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        width?: number;
        height?: number;
      };
      if (params.width) setWidth(String(params.width));
      if (params.height) setHeight(String(params.height));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const commonRatios = [
    { name: '16:9', value: 16 / 9, icon: <Monitor className="w-4 h-4" />, desc: 'HD, 4K' },
    { name: '4:3', value: 4 / 3, icon: <Monitor className="w-4 h-4" />, desc: 'Classic' },
    { name: '21:9', value: 21 / 9, icon: <Film className="w-4 h-4" />, desc: 'Ultrawide' },
    { name: '1:1', value: 1, icon: <Maximize2 className="w-4 h-4" />, desc: 'Square' },
    { name: '9:16', value: 9 / 16, icon: <Smartphone className="w-4 h-4" />, desc: 'Portrait' },
    { name: '3:2', value: 3 / 2, icon: <Monitor className="w-4 h-4" />, desc: 'DSLR' },
    { name: '2:1', value: 2 / 1, icon: <Film className="w-4 h-4" />, desc: 'Cinematic' },
    { name: '5:4', value: 5 / 4, icon: <Monitor className="w-4 h-4" />, desc: 'SXGA' },
  ];

  const resolutions = [
    { name: '4K UHD', width: 3840, height: 2160 },
    { name: '1080p', width: 1920, height: 1080 },
    { name: '720p', width: 1280, height: 720 },
    { name: 'Instagram', width: 1080, height: 1080 },
    { name: 'Story/Reels', width: 1080, height: 1920 },
    { name: 'Twitter', width: 1200, height: 675 },
  ];

  const result = useMemo(() => {
    const w = parseInt(width) || 0;
    const h = parseInt(height) || 0;

    if (w <= 0 || h <= 0) return null;

    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(w, h);

    const ratioW = w / divisor;
    const ratioH = h / divisor;
    const decimal = w / h;

    // Find closest common ratio
    let closest = commonRatios[0];
    let minDiff = Math.abs(decimal - closest.value);

    commonRatios.forEach(ratio => {
      const diff = Math.abs(decimal - ratio.value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = ratio;
      }
    });

    return {
      ratio: `${ratioW}:${ratioH}`,
      decimal: decimal.toFixed(4),
      closest,
      isExact: minDiff < 0.01,
      pixels: w * h,
      megapixels: (w * h / 1000000).toFixed(2),
    };
  }, [width, height]);

  const handleRatioClick = (ratio: { name: string; value: number }) => {
    const w = parseInt(width) || 1920;
    const h = parseInt(height) || 1080;

    if (lock === 'width') {
      setHeight(String(Math.round(w / ratio.value)));
    } else if (lock === 'height') {
      setWidth(String(Math.round(h * ratio.value)));
    } else {
      // Default: adjust height based on current width
      setHeight(String(Math.round(w / ratio.value)));
    }
    setTargetRatio(ratio.name);
  };

  const handleResolutionClick = (res: { width: number; height: number }) => {
    setWidth(String(res.width));
    setHeight(String(res.height));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Maximize2 className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aspectRatio.aspectRatioCalculator', 'Aspect Ratio Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aspectRatio.calculateAndConvertAspectRatios', 'Calculate and convert aspect ratios')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.aspectRatio.dimensionsHaveBeenPrefilledFrom', 'Dimensions have been prefilled from AI suggestions')}
            </span>
          </div>
        )}

        {/* Dimension Inputs */}
        <div className="grid grid-cols-5 gap-4 items-end">
          <div className="col-span-2 space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.aspectRatio.width', 'Width')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border text-lg ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <button
                onClick={() => setLock(lock === 'width' ? 'none' : 'width')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded ${
                  lock === 'width' ? 'text-cyan-500' : isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {lock === 'width' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-center pb-3">
            <span className={`text-2xl ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>×</span>
          </div>

          <div className="col-span-2 space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.aspectRatio.height', 'Height')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border text-lg ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <button
                onClick={() => setLock(lock === 'height' ? 'none' : 'height')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded ${
                  lock === 'height' ? 'text-cyan-500' : isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {lock === 'height' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Resolutions */}
        <div className="flex flex-wrap gap-2">
          {resolutions.map((res) => (
            <button
              key={res.name}
              onClick={() => handleResolutionClick(res)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                parseInt(width) === res.width && parseInt(height) === res.height
                  ? 'bg-cyan-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {res.name}
            </button>
          ))}
        </div>

        {/* Result */}
        {result && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-cyan-900/20 border-cyan-800' : 'bg-cyan-50 border-cyan-100'} border`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aspectRatio.aspectRatio', 'Aspect Ratio')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {result.ratio}
                </div>
                <button
                  onClick={() => handleCopy(result.ratio)}
                  className={`text-xs ${copied === result.ratio ? 'text-green-500' : 'text-cyan-500'}`}
                >
                  {copied === result.ratio ? t('tools.aspectRatio.copied', 'Copied!') : t('tools.aspectRatio.copy', 'Copy')}
                </button>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aspectRatio.decimal', 'Decimal')}</div>
                <div className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {result.decimal}
                </div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aspectRatio.closestMatch', 'Closest Match')}</div>
                <div className={`text-2xl font-bold ${result.isExact ? 'text-green-500' : 'text-yellow-500'}`}>
                  {result.closest.name}
                </div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.aspectRatio.megapixels', 'Megapixels')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {result.megapixels} MP
                </div>
              </div>
            </div>

            {/* Visual Preview */}
            <div className="mt-4 flex justify-center">
              <div
                className={`border-2 ${isDark ? 'border-cyan-500' : 'border-cyan-400'} rounded-lg`}
                style={{
                  width: '200px',
                  height: `${200 / (parseInt(width) / parseInt(height))}px`,
                  maxHeight: '150px',
                }}
              />
            </div>
          </div>
        )}

        {/* Common Ratios */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Apply Aspect Ratio {lock !== 'none' && `(keeping ${lock})`}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {commonRatios.map((ratio) => (
              <button
                key={ratio.name}
                onClick={() => handleRatioClick(ratio)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  targetRatio === ratio.name && result?.isExact
                    ? 'bg-cyan-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="flex justify-center mb-1">{ratio.icon}</div>
                <div className="font-medium">{ratio.name}</div>
                <div className="text-xs opacity-60">{ratio.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.aspectRatio.tip', 'Tip:')}</strong> Lock a dimension to maintain it when applying a new ratio.
            16:9 is standard for video, 1:1 for social media squares, 9:16 for stories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AspectRatioTool;
