import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, Maximize, Info, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ScreenResolutionToolProps {
  uiConfig?: UIConfig;
}

interface Resolution {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: string;
}

export const ScreenResolutionTool: React.FC<ScreenResolutionToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentWidth, setCurrentWidth] = useState(window.innerWidth);
  const [currentHeight, setCurrentHeight] = useState(window.innerHeight);
  const [copied, setCopied] = useState('');
  const [filter, setFilter] = useState('all');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.formData) {
        if (params.formData.filter) setFilter(params.formData.filter);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    const handleResize = () => {
      setCurrentWidth(window.innerWidth);
      setCurrentHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const standardResolutions: Resolution[] = [
    // Mobile
    { name: 'iPhone SE', width: 375, height: 667, aspectRatio: '16:9', category: 'mobile' },
    { name: 'iPhone 12/13/14', width: 390, height: 844, aspectRatio: '19.5:9', category: 'mobile' },
    { name: 'iPhone 12/13/14 Pro Max', width: 428, height: 926, aspectRatio: '19.5:9', category: 'mobile' },
    { name: 'Android Small', width: 360, height: 640, aspectRatio: '16:9', category: 'mobile' },
    { name: 'Android Medium', width: 412, height: 915, aspectRatio: '20:9', category: 'mobile' },
    // Tablet
    { name: 'iPad Mini', width: 768, height: 1024, aspectRatio: '4:3', category: 'tablet' },
    { name: 'iPad Air/Pro 10.9"', width: 820, height: 1180, aspectRatio: '4.3:3', category: 'tablet' },
    { name: 'iPad Pro 12.9"', width: 1024, height: 1366, aspectRatio: '4:3', category: 'tablet' },
    { name: 'Android Tablet', width: 800, height: 1280, aspectRatio: '16:10', category: 'tablet' },
    // Laptop
    { name: 'MacBook Air 13"', width: 1440, height: 900, aspectRatio: '16:10', category: 'laptop' },
    { name: 'MacBook Pro 14"', width: 1512, height: 982, aspectRatio: '3:2', category: 'laptop' },
    { name: 'MacBook Pro 16"', width: 1728, height: 1117, aspectRatio: '3:2', category: 'laptop' },
    { name: 'Laptop HD', width: 1366, height: 768, aspectRatio: '16:9', category: 'laptop' },
    { name: 'Laptop FHD', width: 1920, height: 1080, aspectRatio: '16:9', category: 'laptop' },
    // Desktop
    { name: 'HD 720p', width: 1280, height: 720, aspectRatio: '16:9', category: 'desktop' },
    { name: 'Full HD 1080p', width: 1920, height: 1080, aspectRatio: '16:9', category: 'desktop' },
    { name: 'QHD 1440p', width: 2560, height: 1440, aspectRatio: '16:9', category: 'desktop' },
    { name: '4K UHD', width: 3840, height: 2160, aspectRatio: '16:9', category: 'desktop' },
    { name: '5K', width: 5120, height: 2880, aspectRatio: '16:9', category: 'desktop' },
    { name: 'Ultrawide', width: 2560, height: 1080, aspectRatio: '21:9', category: 'desktop' },
    { name: 'Super Ultrawide', width: 3440, height: 1440, aspectRatio: '21:9', category: 'desktop' },
  ];

  const categories = ['all', 'mobile', 'tablet', 'laptop', 'desktop'];

  const filteredResolutions = useMemo(() => {
    if (filter === 'all') return standardResolutions;
    return standardResolutions.filter((r) => r.category === filter);
  }, [filter]);

  const screenInfo = useMemo(() => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const physicalWidth = currentWidth * devicePixelRatio;
    const physicalHeight = currentHeight * devicePixelRatio;

    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(currentWidth, currentHeight);
    const aspectRatio = `${currentWidth / divisor}:${currentHeight / divisor}`;

    const colorDepth = window.screen.colorDepth;
    const orientation = currentWidth > currentHeight ? t('tools.screenResolution.landscape', 'Landscape') : t('tools.screenResolution.portrait', 'Portrait');

    return {
      devicePixelRatio,
      physicalWidth,
      physicalHeight,
      aspectRatio,
      colorDepth,
      orientation,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    };
  }, [currentWidth, currentHeight]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const getClosestResolution = () => {
    let closest = standardResolutions[0];
    let minDiff = Infinity;

    standardResolutions.forEach((res) => {
      const diff = Math.abs(res.width - currentWidth) + Math.abs(res.height - currentHeight);
      if (diff < minDiff) {
        minDiff = diff;
        closest = res;
      }
    });

    return closest;
  };

  const closestRes = getClosestResolution();

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Monitor className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.screenResolution.screenResolutionTool', 'Screen Resolution Tool')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.screenResolution.analyzeScreenAndCompareResolutions', 'Analyze screen and compare resolutions')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.screenResolution.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Current Screen Info */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-center gap-2 mb-3">
            <Maximize className="w-5 h-5 text-blue-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.screenResolution.yourCurrentViewport', 'Your Current Viewport')}</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-500">{currentWidth}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.screenResolution.widthPx', 'Width (px)')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500">{currentHeight}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.screenResolution.heightPx', 'Height (px)')}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{screenInfo.aspectRatio}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.screenResolution.aspectRatio', 'Aspect Ratio')}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{screenInfo.devicePixelRatio}x</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.screenResolution.pixelRatio', 'Pixel Ratio')}</div>
            </div>
          </div>
          <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Closest match: <span className="text-blue-500 font-medium">{closestRes.name}</span> ({closestRes.width}×{closestRes.height})
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.screenResolution.screenResolution', 'Screen Resolution')}</div>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{screenInfo.screenWidth}×{screenInfo.screenHeight}</div>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.screenResolution.physicalPixels', 'Physical Pixels')}</div>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{screenInfo.physicalWidth}×{screenInfo.physicalHeight}</div>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.screenResolution.orientation', 'Orientation')}</div>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{screenInfo.orientation}</div>
          </div>
        </div>

        {/* Copy Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => copyText(`${currentWidth}×${currentHeight}`)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${copied === `${currentWidth}×${currentHeight}` ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {copied === `${currentWidth}×${currentHeight}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {currentWidth}×{currentHeight}
          </button>
          <button
            onClick={() => copyText(`width: ${currentWidth}px; height: ${currentHeight}px;`)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${copied.includes('width:') ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {copied.includes('width:') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            CSS
          </button>
        </div>

        {/* Resolution Categories */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${filter === cat ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resolution List */}
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {filteredResolutions.map((res, idx) => {
            const isMatch = res.width === currentWidth && res.height === currentHeight;
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg flex items-center justify-between ${isMatch ? (isDark ? 'bg-blue-900/30 ring-1 ring-blue-500' : 'bg-blue-50 ring-1 ring-blue-300') : isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-8 rounded flex items-center justify-center text-xs font-mono ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                    style={{
                      aspectRatio: `${res.width}/${res.height}`,
                      maxWidth: '48px',
                      maxHeight: '32px',
                    }}
                  >
                    <Monitor className="w-4 h-4 opacity-50" />
                  </div>
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {res.name}
                      {isMatch && <span className="ml-2 text-xs text-blue-500">(Current)</span>}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {res.width}×{res.height} ({res.aspectRatio})
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyText(`${res.width}×${res.height}`)}
                  className={`p-2 rounded-lg ${copied === `${res.width}×${res.height}` ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  {copied === `${res.width}×${res.height}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.screenResolution.tip', 'Tip:')}</strong> Resize your browser window to see viewport dimensions update in real-time. Use this to test responsive designs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenResolutionTool;
