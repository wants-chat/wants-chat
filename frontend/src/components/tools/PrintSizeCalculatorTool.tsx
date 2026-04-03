import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Image, AlertTriangle, Check, Sparkles, Info, Copy, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PrintSizeCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface PrintQuality {
  name: string;
  minDPI: number;
  maxDPI: number;
  description: string;
  color: string;
}

interface PrintSize {
  name: string;
  width: number;
  height: number;
  category: string;
}

const PrintSizeCalculatorTool: React.FC<PrintSizeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);

  const [imageWidth, setImageWidth] = useState('6000');
  const [imageHeight, setImageHeight] = useState('4000');
  const [targetDPI, setTargetDPI] = useState('300');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  // Standard print sizes (in inches)
  const printSizes: PrintSize[] = [
    { name: '4x6', width: 4, height: 6, category: 'Standard' },
    { name: '5x7', width: 5, height: 7, category: 'Standard' },
    { name: '8x10', width: 8, height: 10, category: 'Standard' },
    { name: '11x14', width: 11, height: 14, category: 'Standard' },
    { name: '16x20', width: 16, height: 20, category: 'Large' },
    { name: '20x24', width: 20, height: 24, category: 'Large' },
    { name: '24x36', width: 24, height: 36, category: 'Poster' },
    { name: '30x40', width: 30, height: 40, category: 'Poster' },
    { name: 'A4 (8.27x11.69)', width: 8.27, height: 11.69, category: 'ISO' },
    { name: 'A3 (11.69x16.54)', width: 11.69, height: 16.54, category: 'ISO' },
    { name: 'A2 (16.54x23.39)', width: 16.54, height: 23.39, category: 'ISO' },
  ];

  const qualityLevels: PrintQuality[] = [
    { name: 'Excellent', minDPI: 300, maxDPI: Infinity, description: 'Professional quality, close viewing', color: 'green' },
    { name: 'Good', minDPI: 200, maxDPI: 299, description: 'Good for most prints, normal viewing', color: 'teal' },
    { name: 'Acceptable', minDPI: 150, maxDPI: 199, description: 'OK for posters, distant viewing', color: 'yellow' },
    { name: 'Poor', minDPI: 100, maxDPI: 149, description: 'Noticeable pixelation', color: 'orange' },
    { name: 'Very Poor', minDPI: 0, maxDPI: 99, description: 'Not recommended', color: 'red' },
  ];

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.width) {
        setImageWidth(String(params.width));
        hasChanges = true;
      }
      if (params.height) {
        setImageHeight(String(params.height));
        hasChanges = true;
      }
      if (params.dpi) {
        setTargetDPI(String(params.dpi));
        hasChanges = true;
      }

      // Try to parse dimensions from text
      const textContent = params.text || params.content || '';
      if (textContent && !params.width) {
        const dimensionMatch = textContent.match(/(\d+)\s*[xX]\s*(\d+)/);
        if (dimensionMatch) {
          setImageWidth(dimensionMatch[1]);
          setImageHeight(dimensionMatch[2]);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const width = parseInt(imageWidth) || 0;
    const height = parseInt(imageHeight) || 0;
    const dpi = parseInt(targetDPI) || 300;

    if (width <= 0 || height <= 0) return null;

    // Max print size at target DPI
    const maxWidthInches = width / dpi;
    const maxHeightInches = height / dpi;

    // Convert to cm if needed
    const displayWidth = unit === 'cm' ? maxWidthInches * 2.54 : maxWidthInches;
    const displayHeight = unit === 'cm' ? maxHeightInches * 2.54 : maxHeightInches;

    // Calculate megapixels
    const megapixels = (width * height) / 1000000;

    // Aspect ratio
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const aspectRatio = `${width / divisor}:${height / divisor}`;

    // Calculate quality for each print size
    const printSizeQuality = printSizes.map(size => {
      const sizeWidth = size.width;
      const sizeHeight = size.height;

      // Check both orientations
      const dpiLandscape = Math.min(width / sizeWidth, height / sizeHeight);
      const dpiPortrait = Math.min(width / sizeHeight, height / sizeWidth);
      const effectiveDPI = Math.max(dpiLandscape, dpiPortrait);

      const quality = qualityLevels.find(q => effectiveDPI >= q.minDPI && effectiveDPI <= q.maxDPI) || qualityLevels[qualityLevels.length - 1];

      return {
        ...size,
        effectiveDPI: Math.round(effectiveDPI),
        quality,
        fits: effectiveDPI >= 150,
      };
    });

    return {
      maxWidthInches,
      maxHeightInches,
      displayWidth,
      displayHeight,
      megapixels,
      aspectRatio,
      printSizeQuality,
    };
  }, [imageWidth, imageHeight, targetDPI, unit]);

  const getQualityColor = (color: string, isDark: boolean) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      green: {
        bg: isDark ? 'bg-green-900/30' : 'bg-green-50',
        text: 'text-green-500',
        border: isDark ? 'border-green-800' : 'border-green-200',
      },
      teal: {
        bg: isDark ? 'bg-teal-900/30' : 'bg-teal-50',
        text: 'text-teal-500',
        border: isDark ? 'border-teal-800' : 'border-teal-200',
      },
      yellow: {
        bg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-50',
        text: 'text-yellow-500',
        border: isDark ? 'border-yellow-800' : 'border-yellow-200',
      },
      orange: {
        bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
        text: 'text-orange-500',
        border: isDark ? 'border-orange-800' : 'border-orange-200',
      },
      red: {
        bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
        text: 'text-red-500',
        border: isDark ? 'border-red-800' : 'border-red-200',
      },
    };
    return colors[color] || colors.teal;
  };

  const handleCopy = () => {
    if (!calculations) return;
    const text = `Image: ${imageWidth}x${imageHeight}px (${calculations.megapixels.toFixed(1)}MP)\nMax Print Size at ${targetDPI} DPI: ${calculations.displayWidth.toFixed(2)} x ${calculations.displayHeight.toFixed(2)} ${unit}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commonResolutions = [
    { name: '12MP', width: 4000, height: 3000 },
    { name: '24MP', width: 6000, height: 4000 },
    { name: '45MP', width: 8192, height: 5464 },
    { name: '4K Video', width: 3840, height: 2160 },
    { name: 'iPhone 15', width: 4032, height: 3024 },
    { name: '8K Video', width: 7680, height: 4320 },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-teal-500 flex items-center justify-center">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.printSizeCalculator.printSizeCalculator', 'Print Size Calculator')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.printSizeCalculator.calculateMaximumPrintSizeFrom', 'Calculate maximum print size from image resolution')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-teal-500/10 rounded-xl border border-teal-500/20">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.printSizeCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
            </div>
          )}

          {/* Input Section */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {t('tools.printSizeCalculator.imageDimensions', 'Image Dimensions')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.printSizeCalculator.widthPixels', 'Width (pixels)')}
                </label>
                <input
                  type="number"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="6000"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.printSizeCalculator.heightPixels', 'Height (pixels)')}
                </label>
                <input
                  type="number"
                  value={imageHeight}
                  onChange={(e) => setImageHeight(e.target.value)}
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="4000"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.printSizeCalculator.targetDpi', 'Target DPI')}
                </label>
                <select
                  value={targetDPI}
                  onChange={(e) => setTargetDPI(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                >
                  <option value="150">150 DPI (Posters)</option>
                  <option value="200">200 DPI (Good Quality)</option>
                  <option value="300">300 DPI (Professional)</option>
                  <option value="600">600 DPI (Fine Art)</option>
                </select>
              </div>
            </div>

            {/* Quick Resolution Presets */}
            <div className="flex flex-wrap gap-2">
              {commonResolutions.map((res) => (
                <button
                  key={res.name}
                  onClick={() => {
                    setImageWidth(res.width.toString());
                    setImageHeight(res.height.toString());
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    imageWidth === res.width.toString() && imageHeight === res.height.toString()
                      ? 'bg-teal-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {res.name}
                </button>
              ))}
            </div>
          </div>

          {calculations && (
            <>
              {/* Results Summary */}
              <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                    Maximum Print Size at {targetDPI} DPI
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUnit(unit === 'in' ? 'cm' : 'in')}
                      className={`px-3 py-1 text-sm rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}
                    >
                      {unit === 'in' ? t('tools.printSizeCalculator.switchToCm', 'Switch to cm') : t('tools.printSizeCalculator.switchToInches', 'Switch to inches')}
                    </button>
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1 ${
                        copied
                          ? 'bg-green-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? t('tools.printSizeCalculator.copied', 'Copied!') : t('tools.printSizeCalculator.copy', 'Copy')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Image className="w-6 h-6 mx-auto mb-2 text-teal-500" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printSizeCalculator.resolution', 'Resolution')}</p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {calculations.megapixels.toFixed(1)} MP
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printSizeCalculator.aspectRatio', 'Aspect Ratio')}</p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {calculations.aspectRatio}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} col-span-2`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.printSizeCalculator.maxPrintSize', 'Max Print Size')}</p>
                    <p className="text-2xl font-bold text-teal-500">
                      {calculations.displayWidth.toFixed(2)} x {calculations.displayHeight.toFixed(2)} {unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Print Size Quality Grid */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {t('tools.printSizeCalculator.standardPrintSizes', 'Standard Print Sizes')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {calculations.printSizeQuality.map((size) => {
                    const colorClasses = getQualityColor(size.quality.color, isDarkMode);
                    return (
                      <div
                        key={size.name}
                        className={`p-4 rounded-lg border ${colorClasses.bg} ${colorClasses.border}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {size.name}
                          </span>
                          {size.fits ? (
                            <Check className={`w-5 h-5 ${colorClasses.text}`} />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${colorClasses.text}`}>{size.quality.name}</span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {size.effectiveDPI} DPI
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quality Legend */}
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.printSizeCalculator.qualityGuide', 'Quality Guide')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  {qualityLevels.map((level) => {
                    const colorClasses = getQualityColor(level.color, isDarkMode);
                    return (
                      <div key={level.name} className={`p-2 rounded ${colorClasses.bg}`}>
                        <p className={`font-medium ${colorClasses.text}`}>{level.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {level.minDPI}+ DPI
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium mb-1">{t('tools.printSizeCalculator.printingTips', 'Printing Tips:')}</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>300 DPI:</strong> {t('tools.printSizeCalculator.industryStandardForProfessionalPrints', 'Industry standard for professional prints viewed up close')}</li>
                <li><strong>150-200 DPI:</strong> {t('tools.printSizeCalculator.acceptableForLargePostersViewed', 'Acceptable for large posters viewed from a distance')}</li>
                <li>{t('tools.printSizeCalculator.canvasPrintsAndTexturedPapers', 'Canvas prints and textured papers can hide lower resolutions')}</li>
                <li>{t('tools.printSizeCalculator.upscalingSoftwareCanHelpImprove', 'Upscaling software can help improve low-resolution images')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSizeCalculatorTool;
