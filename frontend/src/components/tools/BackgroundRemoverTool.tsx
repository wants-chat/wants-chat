import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eraser, Upload, Download, Loader2, RefreshCw, X, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { contentApi } from '../../lib/contentApi';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BackgroundOptions {
  type: 'transparent' | 'solid' | 'gradient' | 'blur';
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
  blurAmount?: number;
  edgeRefinement: boolean;
}

const backgroundPresets = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'Solid Color', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
  { label: 'Blur Original', value: 'blur' },
];

interface BackgroundRemoverToolProps {
  uiConfig?: UIConfig;
}

export const BackgroundRemoverTool: React.FC<BackgroundRemoverToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [options, setOptions] = useState<BackgroundOptions>({
    type: 'transparent',
    color: '#FFFFFF',
    gradientStart: '#667EEA',
    gradientEnd: '#764BA2',
    blurAmount: 20,
    edgeRefinement: true,
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        options?: BackgroundOptions;
        type?: string;
        color?: string;
        gradientStart?: string;
        gradientEnd?: string;
        blurAmount?: number;
        edgeRefinement?: boolean;
      };
      console.log('[BackgroundRemoverTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.options) {
          setOptions(params.options);
        } else {
          if (params.type) setOptions(prev => ({ ...prev, type: params.type as any }));
          if (params.color) setOptions(prev => ({ ...prev, color: params.color }));
          if (params.gradientStart) setOptions(prev => ({ ...prev, gradientStart: params.gradientStart }));
          if (params.gradientEnd) setOptions(prev => ({ ...prev, gradientEnd: params.gradientEnd }));
          if (params.blurAmount) setOptions(prev => ({ ...prev, blurAmount: params.blurAmount }));
          if (typeof params.edgeRefinement === 'boolean') {
            setOptions(prev => ({ ...prev, edgeRefinement: params.edgeRefinement! }));
          }
        }
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[BackgroundRemoverTool] Image source found:', imageSource);
      if (imageSource) {
        loadImageFromUrl(imageSource);
        setIsPrefilled(true);
      } else {
        console.log('[BackgroundRemoverTool] No image source found in params');
      }
    }
  }, [uiConfig?.params]);

  // Store the prefilled URL for backend processing
  const [prefilledUrl, setPrefilledUrl] = useState<string | null>(null);

  // Load image from URL - simple approach: just display and store URL for backend
  const loadImageFromUrl = (url: string) => {
    setError(null);
    console.log('[BackgroundRemoverTool] Loading image from URL:', url);

    // Store URL for backend to download and process
    setPrefilledUrl(url);
    // Display image directly - browser handles cross-origin for <img> tags
    setOriginalPreview(url);
    // Set placeholder File so UI shows controls (actual processing uses URL)
    setOriginalImage(new File([], 'prefilled-image.png', { type: 'image/png' }));
    setProcessedImage(null);
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
    setProcessedImage(null);

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

  const handleRemoveBackground = async () => {
    if (!originalImage) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let response;

      // Use JSON for URL-based images, FormData for file uploads
      if (prefilledUrl && (!originalImage || originalImage.size === 0)) {
        // Build JSON payload
        const payload: Record<string, any> = {
          imageUrl: prefilledUrl,
          backgroundType: options.type,
          edgeRefinement: options.edgeRefinement,
        };

        if (options.type === 'solid' && options.color) {
          payload.backgroundColor = options.color;
        }
        if (options.type === 'gradient' && options.gradientStart && options.gradientEnd) {
          payload.gradientStart = options.gradientStart;
          payload.gradientEnd = options.gradientEnd;
        }
        if (options.type === 'blur' && options.blurAmount) {
          payload.blurAmount = options.blurAmount;
        }

        response = await api.post('/ai/image/remove-background', payload);
      } else if (originalImage && originalImage.size > 0) {
        // Send FormData when uploading a file
        const formData = new FormData();
        formData.append('image', originalImage);
        formData.append('backgroundType', options.type);
        formData.append('edgeRefinement', options.edgeRefinement.toString());

        if (options.type === 'solid' && options.color) {
          formData.append('backgroundColor', options.color);
        }
        if (options.type === 'gradient' && options.gradientStart && options.gradientEnd) {
          formData.append('gradientStart', options.gradientStart);
          formData.append('gradientEnd', options.gradientEnd);
        }
        if (options.type === 'blur' && options.blurAmount) {
          formData.append('blurAmount', options.blurAmount.toString());
        }

        response = await api.post('/ai/image/remove-background', formData);
      } else {
        setError('No image available. Please upload an image.');
        setIsProcessing(false);
        return;
      }

      if (response.success && response.data?.imageUrl) {
        setProcessedImage(response.data.imageUrl);

        // Save to content library
        try {
          await contentApi.updateContent(response.data.contentId, {
            title: `Background Removed - ${originalImage.name}`,
            metadata: {
              originalFilename: originalImage.name,
              backgroundOptions: options,
            },
          });
        } catch (saveError) {
          console.warn('Failed to save to content library:', saveError);
        }
      } else {
        setError(response.error || 'Failed to remove background');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!processedImage) return;

    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = options.type === 'transparent' ? 'png' : 'jpg';
      a.download = `background-removed-${originalImage?.name.replace(/\.[^/.]+$/, '')}.${extension}`;
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
    setProcessedImage(null);
    setError(null);
    setOptions({
      type: 'transparent',
      color: '#FFFFFF',
      gradientStart: '#667EEA',
      gradientEnd: '#764BA2',
      blurAmount: 20,
      edgeRefinement: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!processedImage) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();

      const extension = options.type === 'transparent' ? 'png' : 'jpg';
      const formData = new FormData();
      formData.append('file', blob, `background-removed-${originalImage?.name.replace(/\.[^/.]+$/, '')}.${extension}`);
      formData.append('toolId', 'background-remover');
      formData.append('metadata', JSON.stringify({
        toolId: 'background-remover',
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
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900' : t('tools.backgroundRemover.bgGradientToRFrom', 'bg-gradient-to-r from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Eraser className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.backgroundRemover.backgroundRemover', 'Background Remover')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.backgroundRemover.aiPoweredBackgroundRemovalAnd', 'AI-powered background removal and replacement')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.backgroundRemover.imageLoadedFromYourUpload', 'Image loaded from your upload')}</span>
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
                ? t('tools.backgroundRemover.borderGray600HoverBorder', 'border-gray-600 hover:border-[#0D9488]/50 bg-gray-800/50') : t('tools.backgroundRemover.borderGray300HoverBorder', 'border-gray-300 hover:border-[#0D9488]/50 bg-gray-50')
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.backgroundRemover.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.backgroundRemover.supportsJpgPngWebpMax', 'Supports JPG, PNG, WebP (max 10MB)')}
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

        {/* Processing Controls */}
        {originalImage && !processedImage && (
          <div className="space-y-6">
            {/* Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <img
                src={originalPreview || ''}
                alt="Original"
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>

            {/* Background Type */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.backgroundRemover.backgroundType', 'Background Type')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {backgroundPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setOptions({ ...options, type: preset.value as any })}
                    className={`px-4 py-3 rounded-lg transition-all font-medium ${
                      options.type === preset.value
                        ? 'bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/20'
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

            {/* Solid Color Picker */}
            {options.type === 'solid' && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.backgroundRemover.backgroundColor', 'Background Color')}
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={options.color}
                    onChange={(e) => setOptions({ ...options, color: e.target.value })}
                    className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={options.color}
                    onChange={(e) => setOptions({ ...options, color: e.target.value })}
                    className={`flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            )}

            {/* Gradient Colors */}
            {options.type === 'gradient' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.backgroundRemover.gradientStart', 'Gradient Start')}
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={options.gradientStart}
                      onChange={(e) => setOptions({ ...options, gradientStart: e.target.value })}
                      className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={options.gradientStart}
                      onChange={(e) => setOptions({ ...options, gradientStart: e.target.value })}
                      className={`flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                        isDark
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.backgroundRemover.gradientEnd', 'Gradient End')}
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={options.gradientEnd}
                      onChange={(e) => setOptions({ ...options, gradientEnd: e.target.value })}
                      className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={options.gradientEnd}
                      onChange={(e) => setOptions({ ...options, gradientEnd: e.target.value })}
                      className={`flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                        isDark
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Blur Amount */}
            {options.type === 'blur' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.backgroundRemover.blurAmount', 'Blur Amount')}
                  </label>
                  <span className="text-[#0D9488] font-semibold">{options.blurAmount}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={options.blurAmount}
                  onChange={(e) => setOptions({ ...options, blurAmount: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                />
              </div>
            )}

            {/* Edge Refinement */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="edgeRefinement"
                checked={options.edgeRefinement}
                onChange={(e) => setOptions({ ...options, edgeRefinement: e.target.checked })}
                className="w-4 h-4 text-[#0D9488] bg-gray-100 border-gray-300 rounded focus:ring-[#0D9488] focus:ring-2"
              />
              <label htmlFor="edgeRefinement" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.backgroundRemover.edgeRefinementBetterQualitySlower', 'Edge Refinement (better quality, slower processing)')}
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRemoveBackground}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.backgroundRemover.processing', 'Processing...')}
                  </>
                ) : (
                  <>
                    <Eraser className="w-5 h-5" />
                    {t('tools.backgroundRemover.removeBackground', 'Remove Background')}
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
        {processedImage && (
          <div className="space-y-4">
            {/* Before/After Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.backgroundRemover.original', 'Original')}</p>
                <img
                  src={originalPreview || ''}
                  alt="Original"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
              </div>
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border relative`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.backgroundRemover.backgroundRemoved', 'Background Removed')}</p>
                {/* Checkered background for transparency */}
                {options.type === 'transparent' && (
                  <div
                    className="absolute inset-4 top-12 rounded-lg"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    }}
                  />
                )}
                <img
                  src={processedImage}
                  alt="Processed"
                  className="w-full max-h-80 object-contain rounded-lg relative z-10"
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
                {t('tools.backgroundRemover.download', 'Download')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.backgroundRemover.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('tools.backgroundRemover.saveToLibrary', 'Save to Library')}
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
            <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.backgroundRemover.tips', 'Tips')}</h4>
            <ul className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>{t('tools.backgroundRemover.worksBestWithClearSubject', 'Works best with clear subject separation from background')}</li>
              <li>{t('tools.backgroundRemover.transparentBackgroundSavesAsPng', 'Transparent background saves as PNG format')}</li>
              <li>{t('tools.backgroundRemover.edgeRefinementImprovesQualityBut', 'Edge refinement improves quality but takes longer')}</li>
              <li>{t('tools.backgroundRemover.useBlurBackgroundForArtistic', 'Use blur background for artistic bokeh effect')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundRemoverTool;
