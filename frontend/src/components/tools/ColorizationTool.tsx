import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Paintbrush, Upload, Download, Loader2, RefreshCw, X, Palette, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ColorizationToolProps {
  uiConfig?: UIConfig;
}

const colorStyles = [
  { value: 'natural', label: 'Natural', description: 'Realistic, true-to-life colors' },
  { value: 'vibrant', label: 'Vibrant', description: 'Rich, saturated colors' },
  { value: 'vintage', label: 'Vintage', description: 'Warm, nostalgic tones' },
  { value: 'cool', label: 'Cool Tones', description: 'Blue and green emphasis' },
  { value: 'warm', label: 'Warm Tones', description: 'Red and yellow emphasis' },
  { value: 'cinematic', label: 'Cinematic', description: 'Movie-like color grading' },
];

const eraPresets = [
  { value: 'auto', label: 'Auto Detect' },
  { value: '1920s', label: '1920s' },
  { value: '1940s', label: '1940s' },
  { value: '1950s', label: '1950s' },
  { value: '1960s', label: '1960s' },
  { value: '1970s', label: '1970s' },
  { value: '1980s', label: '1980s' },
];

export const ColorizationTool: React.FC<ColorizationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ALL STATE DECLARATIONS FIRST (before any functions that use them)
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [colorizedImage, setColorizedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [colorStyle, setColorStyle] = useState('natural');
  const [era, setEra] = useState('auto');
  const [saturation, setSaturation] = useState(50);
  const [enhanceFaces, setEnhanceFaces] = useState(true);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Store the prefilled URL for backend processing
  const [prefilledUrl, setPrefilledUrl] = useState<string | null>(null);

  // Load image from URL - simple approach: just display and store URL for backend
  const loadImageFromUrl = (url: string) => {
    console.log('[ColorizationTool] Loading image from URL:', url);
    setError(null);

    // Store URL for backend to download and process
    setPrefilledUrl(url);
    // Display image directly - browser handles cross-origin for <img> tags
    setOriginalPreview(url);
    // Set placeholder File so UI shows controls (actual processing uses URL)
    setOriginalImage(new File([], 'prefilled-image.png', { type: 'image/png' }));
    setColorizedImage(null);
  };

  // Handle prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        colorStyle?: string;
        era?: string;
        saturation?: number;
        enhanceFaces?: boolean;
      };
      console.log('[ColorizationTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.colorStyle) setColorStyle(params.colorStyle);
        if (params.era) setEra(params.era);
        if (params.saturation) setSaturation(Number(params.saturation));
        if (typeof params.enhanceFaces === 'boolean') setEnhanceFaces(params.enhanceFaces);
      } else {
        // Also check for other prefill values
        if (params.colorStyle) setColorStyle(params.colorStyle);
        if (params.era) setEra(params.era);
        if (params.saturation) setSaturation(Number(params.saturation));
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[ColorizationTool] Image source found:', imageSource);
      if (imageSource) {
        loadImageFromUrl(imageSource);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleFileSelect = (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setOriginalImage(file);
    setColorizedImage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleColorize = async () => {
    if (!originalImage) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const styleLabel = colorStyles.find(s => s.value === colorStyle)?.label;
      const prompt = `Colorize this black and white photo with ${styleLabel} colors. ${era !== 'auto' ? `Apply colors appropriate for the ${era} era.` : ''} Saturation level: ${saturation}%. ${enhanceFaces ? 'Pay special attention to realistic skin tones and facial features.' : ''}`;

      let response;

      // Use JSON for URL-based images, FormData for file uploads
      if (prefilledUrl && (!originalImage || originalImage.size === 0)) {
        // Send JSON when using URL
        response = await api.post('/ai/image/colorize', {
          imageUrl: prefilledUrl,
          colorStyle,
          era,
          saturation,
          enhanceFaces,
          prompt,
        });
      } else if (originalImage && originalImage.size > 0) {
        // Send FormData when uploading a file
        const formData = new FormData();
        formData.append('image', originalImage);
        formData.append('colorStyle', colorStyle);
        formData.append('era', era);
        formData.append('saturation', saturation.toString());
        formData.append('enhanceFaces', enhanceFaces.toString());
        formData.append('prompt', prompt);
        response = await api.post('/ai/image/colorize', formData);
      } else {
        setError('No image available. Please upload an image.');
        setIsProcessing(false);
        return;
      }

      if (response.success && response.data?.imageUrl) {
        setColorizedImage(response.data.imageUrl);
      } else {
        setError(response.error || 'Failed to colorize image');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while colorizing the image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!colorizedImage) return;

    try {
      const response = await fetch(colorizedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `colorized-${originalImage?.name || 'image.png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalPreview(null);
    setColorizedImage(null);
    setError(null);
    setColorStyle('natural');
    setEra('auto');
    setSaturation(50);
    setEnhanceFaces(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!colorizedImage) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(colorizedImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, `colorized-${originalImage?.name || 'image.png'}`);
      formData.append('toolId', 'colorization');
      formData.append('metadata', JSON.stringify({
        toolId: 'colorization',
        colorStyle,
        era,
        saturation,
        enhanceFaces,
      }));

      const result = await api.post('/content/upload', formData);

      if (result.success) {
        // Call onSaveCallback if provided
        const params = uiConfig?.params as Record<string, any>;
        if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
          params.onSaveCallback();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save image');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Paintbrush className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.colorization.photoColorization', 'Photo Colorization')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.colorization.addVibrantColorsToBlack', 'Add vibrant colors to black & white photos')}</p>
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-indigo-900/20 border border-indigo-800' : 'bg-indigo-50 border border-indigo-200'}`}>
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
            {t('tools.colorization.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Upload Area */}
        {!originalImage && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : isDark
                ? 'border-gray-600 hover:border-indigo-500/50 bg-gray-800/50'
                : 'border-gray-300 hover:border-indigo-500/50 bg-gray-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.colorization.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.colorization.uploadBlackWhitePhotosMax', 'Upload black & white photos (max 10MB)')}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {/* Colorization Options */}
        {originalImage && !colorizedImage && (
          <div className="space-y-6">
            {/* Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <img
                src={originalPreview || ''}
                alt="Original"
                className="w-full max-h-72 object-contain rounded-lg"
              />
            </div>

            {/* Color Style */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.colorization.colorStyle', 'Color Style')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setColorStyle(style.value)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      colorStyle === style.value
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-medium text-sm">{style.label}</p>
                    <p className={`text-xs mt-1 ${colorStyle === style.value ? 'text-indigo-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {style.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Era Selection */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.colorization.photoEraForPeriodAccurate', 'Photo Era (for period-accurate colors)')}
              </label>
              <div className="flex flex-wrap gap-2">
                {eraPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setEra(preset.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      era === preset.value
                        ? 'bg-indigo-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Saturation Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.colorization.colorSaturation', 'Color Saturation')}
                </label>
                <span className="text-indigo-500 font-semibold">{saturation}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.colorization.subtle', 'Subtle')}</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.colorization.vivid', 'Vivid')}</span>
              </div>
            </div>

            {/* Enhance Faces */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enhanceFaces"
                checked={enhanceFaces}
                onChange={(e) => setEnhanceFaces(e.target.checked)}
                className="w-4 h-4 text-indigo-500 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label htmlFor="enhanceFaces" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.colorization.enhanceFacesBetterSkinTones', 'Enhance faces (better skin tones and facial details)')}
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleColorize}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.colorization.colorizing', 'Colorizing...')}
                  </>
                ) : (
                  <>
                    <Palette className="w-5 h-5" />
                    {t('tools.colorization.colorizePhoto', 'Colorize Photo')}
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Result View */}
        {colorizedImage && (
          <div className="space-y-4">
            {/* Before/After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.colorization.originalBW', 'Original (B&W)')}</p>
                <img
                  src={originalPreview || ''}
                  alt="Original"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
              </div>
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.colorization.colorized', 'Colorized')}</p>
                <img
                  src={colorizedImage}
                  alt="Colorized"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t('tools.colorization.download', 'Download')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.colorization.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('tools.colorization.saveToLibrary', 'Save to Library')}
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Info */}
        {!originalImage && (
          <div className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.colorization.tipsForBestResults', 'Tips for Best Results')}</h4>
            <ul className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>{t('tools.colorization.worksBestWithClearHigh', 'Works best with clear, high-contrast B&W photos')}</li>
              <li>{t('tools.colorization.selectTheEraIfYou', 'Select the era if you know when the photo was taken')}</li>
              <li>{t('tools.colorization.enableFaceEnhancementForPortraits', 'Enable face enhancement for portraits')}</li>
              <li>{t('tools.colorization.tryDifferentColorStylesFor', 'Try different color styles for creative effects')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorizationTool;
