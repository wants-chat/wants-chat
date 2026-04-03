import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ZoomIn, Upload, Download, Loader2, RefreshCw, X, Image as ImageIcon, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { contentApi } from '../../lib/contentApi';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface UpscaleOptions {
  scale: number;
  quality: 'fast' | 'balanced' | 'maximum';
  faceEnhancement: boolean;
}

const scaleOptions = [
  { label: '2x', value: 2 },
  { label: '4x', value: 4 },
  { label: '8x', value: 8 },
];

const qualityModes = [
  { label: 'Fast', value: 'fast', description: 'Quick processing, good quality' },
  { label: 'Balanced', value: 'balanced', description: 'Moderate speed, better quality' },
  { label: 'Maximum', value: 'maximum', description: 'Slow processing, best quality' },
];

interface ImageUpscalerToolProps {
  uiConfig?: UIConfig;
}

export const ImageUpscalerTool: React.FC<ImageUpscalerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [upscaledDimensions, setUpscaledDimensions] = useState<{ width: number; height: number } | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [upscaledSize, setUpscaledSize] = useState<number>(0);

  const [options, setOptions] = useState<UpscaleOptions>({
    scale: 2,
    quality: 'balanced',
    faceEnhancement: false,
  });
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        scale?: number;
        quality?: 'fast' | 'balanced' | 'maximum';
        faceEnhancement?: boolean;
        options?: UpscaleOptions;
      };
      console.log('[ImageUpscalerTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.options) {
          setOptions(params.options);
        } else {
          if (params.scale) setOptions(prev => ({ ...prev, scale: Number(params.scale) }));
          if (params.quality) setOptions(prev => ({ ...prev, quality: params.quality! }));
          if (typeof params.faceEnhancement === 'boolean') {
            setOptions(prev => ({ ...prev, faceEnhancement: params.faceEnhancement! }));
          }
        }
      } else {
        // Also apply scale if specified
        if (params.scale) setOptions(prev => ({ ...prev, scale: Number(params.scale) }));
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[ImageUpscalerTool] Image source found:', imageSource);
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
    console.log('[ImageUpscalerTool] Loading image from URL:', url);

    // Store URL for backend to download and process
    setPrefilledUrl(url);
    // Display image directly - browser handles cross-origin for <img> tags
    setOriginalPreview(url);
    // Set placeholder File so UI shows controls (actual processing uses URL)
    setOriginalImage(new File([], 'prefilled-image.png', { type: 'image/png' }));
    setUpscaledImage(null);

    // Get dimensions by loading image (just for display, not for canvas operations)
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
    };
    img.src = url;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
    setOriginalSize(file.size);
    setUpscaledImage(null);
    setShowComparison(false);
    setUpscaledDimensions(null);

    // Create preview and get dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
      };
      img.src = e.target?.result as string;
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

  const handleUpscale = async () => {
    if (!originalImage) {
      setError('Please select an image first');
      return;
    }

    setIsUpscaling(true);
    setError(null);

    try {
      let response;

      // Use JSON for URL-based images, FormData for file uploads
      if (prefilledUrl && (!originalImage || originalImage.size === 0)) {
        // Send JSON when using URL
        response = await api.post('/ai/image/upscale', {
          imageUrl: prefilledUrl,
          scale: options.scale,
          quality: options.quality,
          faceEnhancement: options.faceEnhancement,
        });
      } else if (originalImage && originalImage.size > 0) {
        // Send FormData when uploading a file
        const formData = new FormData();
        formData.append('image', originalImage);
        formData.append('scale', options.scale.toString());
        formData.append('quality', options.quality);
        formData.append('faceEnhancement', options.faceEnhancement.toString());
        response = await api.post('/ai/image/upscale', formData);
      } else {
        setError('No image available. Please upload an image.');
        setIsUpscaling(false);
        return;
      }

      if (response.success && response.data?.imageUrl) {
        setUpscaledImage(response.data.imageUrl);
        setShowComparison(true);

        // Get upscaled image dimensions
        if (originalDimensions) {
          setUpscaledDimensions({
            width: originalDimensions.width * options.scale,
            height: originalDimensions.height * options.scale,
          });
        }

        // Calculate approximate upscaled file size
        if (response.data.fileSize) {
          setUpscaledSize(response.data.fileSize);
        } else {
          // Estimate based on scale
          setUpscaledSize(originalSize * (options.scale * options.scale));
        }

        // Save to content library
        try {
          await contentApi.updateContent(response.data.contentId, {
            title: `Upscaled ${options.scale}x - ${originalImage.name}`,
            metadata: {
              originalFilename: originalImage.name,
              upscaleOptions: options,
              originalDimensions,
              upscaledDimensions: {
                width: originalDimensions!.width * options.scale,
                height: originalDimensions!.height * options.scale,
              },
            },
          });
        } catch (saveError) {
          console.warn('Failed to save to content library:', saveError);
        }
      } else {
        setError(response.error || 'Failed to upscale image');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while upscaling the image');
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleDownload = async () => {
    if (!upscaledImage) return;

    try {
      const response = await fetch(upscaledImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `upscaled-${options.scale}x-${originalImage?.name || 'image.png'}`;
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
    setUpscaledImage(null);
    setError(null);
    setShowComparison(false);
    setOriginalDimensions(null);
    setUpscaledDimensions(null);
    setOriginalSize(0);
    setUpscaledSize(0);
    setOptions({
      scale: 2,
      quality: 'balanced',
      faceEnhancement: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!upscaledImage) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(upscaledImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, `upscaled-${options.scale}x-${originalImage?.name || 'image.png'}`);
      formData.append('toolId', 'image-upscaler');
      formData.append('metadata', JSON.stringify({
        toolId: 'image-upscaler',
        options,
        originalDimensions,
        upscaledDimensions,
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
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900' : t('tools.imageUpscaler.bgGradientToRFrom', 'bg-gradient-to-r from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <ZoomIn className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.imageUpscaler.imageUpscaler', 'Image Upscaler')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.imageUpscaler.aiPoweredImageUpscalingAnd', 'AI-powered image upscaling and enhancement')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.imageUpscaler.imageLoadedFromYourUpload', 'Image loaded from your upload')}</span>
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
                ? t('tools.imageUpscaler.borderGray600HoverBorder', 'border-gray-600 hover:border-[#0D9488]/50 bg-gray-800/50') : t('tools.imageUpscaler.borderGray300HoverBorder', 'border-gray-300 hover:border-[#0D9488]/50 bg-gray-50')
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.imageUpscaler.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.imageUpscaler.supportsJpgPngWebpMax', 'Supports JPG, PNG, WebP (max 10MB)')}
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

        {/* Upscaling Controls */}
        {originalImage && !upscaledImage && (
          <div className="space-y-6">
            {/* Preview with Info */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border space-y-3`}>
              <img
                src={originalPreview || ''}
                alt="Original"
                className="w-full max-h-96 object-contain rounded-lg"
              />
              {originalDimensions && (
                <div className="flex justify-between items-center text-sm">
                  <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    <span className="font-medium">{t('tools.imageUpscaler.dimensions', 'Dimensions:')}</span> {originalDimensions.width} x {originalDimensions.height}px
                  </div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    <span className="font-medium">{t('tools.imageUpscaler.size', 'Size:')}</span> {formatFileSize(originalSize)}
                  </div>
                </div>
              )}
            </div>

            {/* Scale Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.imageUpscaler.upscaleFactor', 'Upscale Factor')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {scaleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOptions({ ...options, scale: option.value })}
                    className={`px-4 py-3 rounded-lg transition-all font-medium ${
                      options.scale === option.value
                        ? 'bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/20'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                    {originalDimensions && (
                      <div className="text-xs mt-1 opacity-75">
                        {originalDimensions.width * option.value} x {originalDimensions.height * option.value}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Mode */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.imageUpscaler.qualityMode', 'Quality Mode')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {qualityModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setOptions({ ...options, quality: mode.value as any })}
                    className={`px-4 py-3 rounded-lg transition-all ${
                      options.quality === mode.value
                        ? 'bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/20'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-xs mt-1 opacity-75">{mode.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Face Enhancement */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="faceEnhancement"
                checked={options.faceEnhancement}
                onChange={(e) => setOptions({ ...options, faceEnhancement: e.target.checked })}
                className="w-4 h-4 text-[#0D9488] bg-gray-100 border-gray-300 rounded focus:ring-[#0D9488] focus:ring-2"
              />
              <label htmlFor="faceEnhancement" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.imageUpscaler.faceEnhancementRecommendedForPortraits', 'Face Enhancement (recommended for portraits)')}
              </label>
            </div>

            {/* Estimated Output */}
            {originalDimensions && (
              <div className={`${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} rounded-lg p-4 border`}>
                <div className={`text-sm font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  {t('tools.imageUpscaler.estimatedOutput', 'Estimated Output')}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={isDark ? 'text-blue-200' : 'text-blue-700'}>{t('tools.imageUpscaler.dimensions2', 'Dimensions:')}</span>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {originalDimensions.width * options.scale} x {originalDimensions.height * options.scale}px
                    </div>
                  </div>
                  <div>
                    <span className={isDark ? 'text-blue-200' : 'text-blue-700'}>{t('tools.imageUpscaler.approxSize', 'Approx Size:')}</span>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ~{formatFileSize(originalSize * (options.scale * options.scale * 0.7))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleUpscale}
                disabled={isUpscaling}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
              >
                {isUpscaling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.imageUpscaler.upscaling', 'Upscaling...')}
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-5 h-5" />
                    {t('tools.imageUpscaler.upscaleImage', 'Upscale Image')}
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
        {upscaledImage && showComparison && (
          <div className="space-y-4">
            {/* Stats Comparison */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.imageUpscaler.comparison', 'Comparison')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.imageUpscaler.original', 'Original')}</p>
                  {originalDimensions && (
                    <>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {originalDimensions.width} x {originalDimensions.height}px
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatFileSize(originalSize)}
                      </p>
                    </>
                  )}
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Upscaled ({options.scale}x)</p>
                  {upscaledDimensions && (
                    <>
                      <p className="text-lg font-semibold text-green-500">
                        {upscaledDimensions.width} x {upscaledDimensions.height}px
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatFileSize(upscaledSize)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Image Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.imageUpscaler.original2', 'Original')}</p>
                <img
                  src={originalPreview || ''}
                  alt="Original"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
              </div>
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.imageUpscaler.upscaled', 'Upscaled')}</p>
                <img
                  src={upscaledImage}
                  alt="Upscaled"
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
                {t('tools.imageUpscaler.download', 'Download')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.imageUpscaler.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('tools.imageUpscaler.saveToLibrary', 'Save to Library')}
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
            <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.imageUpscaler.tips', 'Tips')}</h4>
            <ul className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>{t('tools.imageUpscaler.higherScaleFactorsWorkBest', 'Higher scale factors work best on small images')}</li>
              <li>{t('tools.imageUpscaler.maximumQualityModeProducesBest', 'Maximum quality mode produces best results but is slower')}</li>
              <li>{t('tools.imageUpscaler.enableFaceEnhancementForPortraits', 'Enable face enhancement for portraits and selfies')}</li>
              <li>{t('tools.imageUpscaler.upscalingCannotAddDetailThat', 'Upscaling cannot add detail that wasn\'t in the original')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpscalerTool;
