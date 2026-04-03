import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Upload, Download, Loader2, RefreshCw, X, Sparkles, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { contentApi } from '../../lib/contentApi';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface EnhancementOptions {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  noiseReduction: boolean;
  filter: string;
}

const filters = [
  { label: 'None', value: '' },
  { label: 'Vintage', value: 'vintage' },
  { label: 'Cinematic', value: 'cinematic' },
  { label: 'Vibrant', value: 'vibrant' },
  { label: 'Noir', value: 'noir' },
  { label: 'Warm', value: 'warm' },
  { label: 'Cool', value: 'cool' },
];

interface PhotoEnhancerToolProps {
  uiConfig?: UIConfig;
}

export const PhotoEnhancerTool: React.FC<PhotoEnhancerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonSlider, setComparisonSlider] = useState(50);

  const [options, setOptions] = useState<EnhancementOptions>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    noiseReduction: false,
    filter: '',
  });
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        options?: EnhancementOptions;
        filter?: string;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
        noiseReduction?: boolean;
      };
      console.log('[PhotoEnhancerTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.options) {
          setOptions(params.options);
        } else {
          if (params.brightness !== undefined) setOptions(prev => ({ ...prev, brightness: params.brightness! }));
          if (params.contrast !== undefined) setOptions(prev => ({ ...prev, contrast: params.contrast! }));
          if (params.saturation !== undefined) setOptions(prev => ({ ...prev, saturation: params.saturation! }));
          if (params.sharpness !== undefined) setOptions(prev => ({ ...prev, sharpness: params.sharpness! }));
          if (typeof params.noiseReduction === 'boolean') setOptions(prev => ({ ...prev, noiseReduction: params.noiseReduction! }));
          if (params.filter) setOptions(prev => ({ ...prev, filter: params.filter! }));
        }
      } else {
        // Also apply filter if specified
        if (params.filter) setOptions(prev => ({ ...prev, filter: params.filter as string }));
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[PhotoEnhancerTool] Image source found:', imageSource);
      if (imageSource) {
        loadImageFromUrl(imageSource);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Store the prefilled URL for backend processing
  const [prefilledUrl, setPrefilledUrl] = useState<string | null>(null);

  // Load image from URL - simple approach: just display and store URL for backend
  const loadImageFromUrl = (url: string) => {
    setError(null);
    console.log('[PhotoEnhancerTool] Loading image from URL:', url);

    // Store URL for backend to download and process
    setPrefilledUrl(url);
    // Display image directly - browser handles cross-origin for <img> tags
    setOriginalPreview(url);
    // Set placeholder File so UI shows controls (actual processing uses URL)
    setOriginalImage(new File([], 'prefilled-image.png', { type: 'image/png' }));
    setEnhancedImage(null);
  };

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setOriginalImage(file);
    setEnhancedImage(null);
    setShowComparison(false);

    // Create preview
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

  const handleEnhance = async () => {
    if (!originalImage) {
      setError('Please select an image first');
      return;
    }

    setIsEnhancing(true);
    setError(null);

    try {
      let response;

      // Use JSON for URL-based images, FormData for file uploads
      if (prefilledUrl && (!originalImage || originalImage.size === 0)) {
        // Send JSON when using URL
        response = await api.post('/ai/image/enhance', {
          imageUrl: prefilledUrl,
          brightness: options.brightness,
          contrast: options.contrast,
          saturation: options.saturation,
          sharpness: options.sharpness,
          noiseReduction: options.noiseReduction,
          filter: options.filter,
        });
      } else if (originalImage && originalImage.size > 0) {
        // Send FormData when uploading a file
        const formData = new FormData();
        formData.append('image', originalImage);
        formData.append('brightness', options.brightness.toString());
        formData.append('contrast', options.contrast.toString());
        formData.append('saturation', options.saturation.toString());
        formData.append('sharpness', options.sharpness.toString());
        formData.append('noiseReduction', options.noiseReduction.toString());
        formData.append('filter', options.filter);
        response = await api.post('/ai/image/enhance', formData);
      } else {
        setError('No image available. Please upload an image.');
        setIsEnhancing(false);
        return;
      }

      if (response.success && response.data?.imageUrl) {
        setEnhancedImage(response.data.imageUrl);
        setShowComparison(true);

        // Save to content library
        try {
          await contentApi.updateContent(response.data.contentId, {
            title: `Enhanced - ${originalImage.name}`,
            metadata: {
              originalFilename: originalImage.name,
              enhancement: options,
            },
          });
        } catch (saveError) {
          console.warn('Failed to save to content library:', saveError);
        }
      } else {
        setError(response.error || 'Failed to enhance image');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while enhancing the image');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDownload = async () => {
    if (!enhancedImage) return;

    try {
      const response = await fetch(enhancedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced-${originalImage?.name || 'image.png'}`;
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
    setEnhancedImage(null);
    setError(null);
    setShowComparison(false);
    setOptions({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpness: 0,
      noiseReduction: false,
      filter: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!enhancedImage) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(enhancedImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, `enhanced-${originalImage?.name || 'image.png'}`);
      formData.append('toolId', 'photo-enhancer');
      formData.append('metadata', JSON.stringify({
        toolId: 'photo-enhancer',
        options,
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
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900' : t('tools.photoEnhancer.bgGradientToRFrom', 'bg-gradient-to-r from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Wand2 className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.photoEnhancer.photoEnhancer', 'Photo Enhancer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.photoEnhancer.aiPoweredPhotoEnhancementAnd', 'AI-powered photo enhancement and filters')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.photoEnhancer.imageLoadedFromYourUpload', 'Image loaded from your upload')}</span>
          </div>
        )}

        {/* Upload Area */}
        {!originalImage && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#0D9488] bg-[#0D9488]/10'
                : isDark
                ? t('tools.photoEnhancer.borderGray600HoverBorder', 'border-gray-600 hover:border-[#0D9488]/50 bg-gray-800/50') : t('tools.photoEnhancer.borderGray300HoverBorder', 'border-gray-300 hover:border-[#0D9488]/50 bg-gray-50')
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.photoEnhancer.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.photoEnhancer.supportsJpgPngWebpMax', 'Supports JPG, PNG, WebP (max 10MB)')}
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

        {/* Enhancement Controls */}
        {originalImage && !enhancedImage && (
          <div className="space-y-6">
            {/* Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <img
                src={originalPreview || ''}
                alt="Original"
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>

            {/* Auto-enhance toggle */}
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.photoEnhancer.autoEnhance', 'Auto-enhance')}
              </label>
              <button
                onClick={() => {
                  setOptions({
                    brightness: 10,
                    contrast: 15,
                    saturation: 10,
                    sharpness: 20,
                    noiseReduction: true,
                    filter: '',
                  });
                }}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm transition-colors"
              >
                {t('tools.photoEnhancer.applyAutoSettings', 'Apply Auto Settings')}
              </button>
            </div>

            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.photoEnhancer.brightness', 'Brightness')}
                </label>
                <span className="text-[#0D9488] font-semibold">{options.brightness}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={options.brightness}
                onChange={(e) => setOptions({ ...options, brightness: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.photoEnhancer.contrast', 'Contrast')}
                </label>
                <span className="text-[#0D9488] font-semibold">{options.contrast}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={options.contrast}
                onChange={(e) => setOptions({ ...options, contrast: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.photoEnhancer.saturation', 'Saturation')}
                </label>
                <span className="text-[#0D9488] font-semibold">{options.saturation}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={options.saturation}
                onChange={(e) => setOptions({ ...options, saturation: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
            </div>

            {/* Sharpness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.photoEnhancer.sharpness', 'Sharpness')}
                </label>
                <span className="text-[#0D9488] font-semibold">{options.sharpness}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={options.sharpness}
                onChange={(e) => setOptions({ ...options, sharpness: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
            </div>

            {/* Filter */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.photoEnhancer.filter', 'Filter')}
              </label>
              <select
                value={options.filter}
                onChange={(e) => setOptions({ ...options, filter: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                {filters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Noise Reduction */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="noiseReduction"
                checked={options.noiseReduction}
                onChange={(e) => setOptions({ ...options, noiseReduction: e.target.checked })}
                className="w-4 h-4 text-[#0D9488] bg-gray-100 border-gray-300 rounded focus:ring-[#0D9488] focus:ring-2"
              />
              <label htmlFor="noiseReduction" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.photoEnhancer.noiseReduction', 'Noise Reduction')}
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.photoEnhancer.enhancing', 'Enhancing...')}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    {t('tools.photoEnhancer.enhancePhoto', 'Enhance Photo')}
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

        {/* Comparison View */}
        {enhancedImage && showComparison && (
          <div className="space-y-4">
            {/* Before/After Slider */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={enhancedImage}
                  alt="Enhanced"
                  className="w-full max-h-96 object-contain"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - comparisonSlider}% 0 0)` }}
                >
                  <img
                    src={originalPreview || ''}
                    alt="Original"
                    className="w-full max-h-96 object-contain"
                  />
                </div>
                <div
                  className="absolute inset-y-0 w-1 bg-white shadow-lg"
                  style={{ left: `${comparisonSlider}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={comparisonSlider}
                onChange={(e) => setComparisonSlider(Number(e.target.value))}
                className="w-full mt-4 accent-[#0D9488]"
              />
              <div className="flex justify-between mt-2 text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.photoEnhancer.original', 'Original')}</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.photoEnhancer.enhanced', 'Enhanced')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t('tools.photoEnhancer.download', 'Download')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.photoEnhancer.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('tools.photoEnhancer.saveToLibrary', 'Save to Library')}
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
      </div>
    </div>
  );
};

export default PhotoEnhancerTool;
