import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Upload, Download, Loader2, RefreshCw, X, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface StyleTransferToolProps {
  uiConfig?: UIConfig;
}

const artisticStyles = [
  { value: 'oil-painting', label: 'Oil Painting', description: 'Classic oil painting texture' },
  { value: 'watercolor', label: 'Watercolor', description: 'Soft watercolor wash effect' },
  { value: 'sketch', label: 'Pencil Sketch', description: 'Hand-drawn pencil style' },
  { value: 'pop-art', label: 'Pop Art', description: 'Bold colors, comic style' },
  { value: 'impressionist', label: 'Impressionist', description: 'Monet-inspired brushstrokes' },
  { value: 'anime', label: 'Anime', description: 'Japanese animation style' },
  { value: 'cubist', label: 'Cubist', description: 'Abstract geometric shapes' },
  { value: 'gothic', label: 'Gothic', description: 'Dark, dramatic aesthetic' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean, simple lines' },
  { value: 'pixel-art', label: 'Pixel Art', description: 'Retro 8-bit style' },
  { value: 'neon', label: 'Neon Glow', description: 'Vibrant neon effects' },
  { value: 'vintage', label: 'Vintage', description: 'Aged, nostalgic look' },
];

const intensityLevels = [
  { value: 'subtle', label: 'Subtle', percent: 30 },
  { value: 'medium', label: 'Medium', percent: 60 },
  { value: 'strong', label: 'Strong', percent: 100 },
];

export const StyleTransferTool: React.FC<StyleTransferToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [styledImage, setStyledImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState('oil-painting');
  const [intensity, setIntensity] = useState('medium');
  const [preserveColors, setPreserveColors] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Store the prefilled URL for backend processing
  const [prefilledUrl, setPrefilledUrl] = useState<string | null>(null);

  // Load image from URL - simple approach: just display and store URL for backend
  const loadImageFromUrl = (url: string) => {
    setError(null);
    console.log('[StyleTransferTool] Loading image from URL:', url);

    // Store URL for backend to download and process
    setPrefilledUrl(url);
    // Display image directly - browser handles cross-origin for <img> tags
    setOriginalPreview(url);
    // Set placeholder File so UI shows controls (actual processing uses URL)
    setOriginalImage(new File([], 'prefilled-image.png', { type: 'image/png' }));
    setStyledImage(null);
  };

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        selectedStyle?: string;
        style?: string;
        intensity?: string;
        preserveColors?: boolean;
      };
      console.log('[StyleTransferTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.selectedStyle || params.style) setSelectedStyle(params.selectedStyle || params.style || 'oil-painting');
        if (params.intensity) setIntensity(params.intensity);
        if (typeof params.preserveColors === 'boolean') setPreserveColors(params.preserveColors);
      } else {
        // Also apply form data if provided
        if (params.formData) {
          if (params.formData.style) setSelectedStyle(params.formData.style);
          if (params.formData.intensity) setIntensity(params.formData.intensity);
          if (params.formData.preserveColors !== undefined) setPreserveColors(params.formData.preserveColors);
          setIsPrefilled(true);
        }

        // Handle style if passed directly
        if (params.style) setSelectedStyle(params.style as string);
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[StyleTransferTool] Image source found:', imageSource);
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
    setStyledImage(null);

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

  const handleApplyStyle = async () => {
    if (!originalImage) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const styleLabel = artisticStyles.find(s => s.value === selectedStyle)?.label;
      const intensityPercent = intensityLevels.find(i => i.value === intensity)?.percent || 60;
      const prompt = `Transform this image into ${styleLabel} style art. Apply the artistic style with ${intensityPercent}% intensity. ${preserveColors ? 'Preserve the original color palette.' : 'Use style-appropriate colors.'}`;

      let response;

      // Use JSON for URL-based images, FormData for file uploads
      if (prefilledUrl && (!originalImage || originalImage.size === 0)) {
        // Send JSON when using URL
        response = await api.post('/ai/image/style-transfer', {
          imageUrl: prefilledUrl,
          prompt,
          style: selectedStyle,
          intensity: intensityPercent,
          preserveColors,
        });
      } else if (originalImage && originalImage.size > 0) {
        // Send FormData when uploading a file
        const formData = new FormData();
        formData.append('image', originalImage);
        formData.append('prompt', prompt);
        formData.append('style', selectedStyle);
        formData.append('intensity', intensityPercent.toString());
        formData.append('preserveColors', preserveColors.toString());
        response = await api.post('/ai/image/style-transfer', formData);
      } else {
        setError('No image available. Please upload an image.');
        setIsProcessing(false);
        return;
      }

      if (response.success && response.data?.imageUrl) {
        setStyledImage(response.data.imageUrl);
      } else {
        setError(response.error || 'Failed to apply style transfer');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!styledImage) return;

    try {
      const response = await fetch(styledImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `styled-${selectedStyle}-${originalImage?.name || 'image.png'}`;
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
    setStyledImage(null);
    setError(null);
    setSelectedStyle('oil-painting');
    setIntensity('medium');
    setPreserveColors(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!styledImage) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(styledImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, `styled-${selectedStyle}-${originalImage?.name || 'image.png'}`);
      formData.append('toolId', 'style-transfer');
      formData.append('metadata', JSON.stringify({
        toolId: 'style-transfer',
        selectedStyle,
        intensity,
        preserveColors,
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
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Palette className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.styleTransfer.styleTransfer', 'Style Transfer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.styleTransfer.transformPhotosIntoArtisticMasterpieces', 'Transform photos into artistic masterpieces')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.styleTransfer.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
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
                ? 'border-purple-500 bg-purple-500/10'
                : isDark
                ? 'border-gray-600 hover:border-purple-500/50 bg-gray-800/50'
                : 'border-gray-300 hover:border-purple-500/50 bg-gray-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.styleTransfer.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.styleTransfer.supportsJpgPngWebpMax', 'Supports JPG, PNG, WebP (max 10MB)')}
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

        {/* Style Options */}
        {originalImage && !styledImage && (
          <div className="space-y-6">
            {/* Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <img
                src={originalPreview || ''}
                alt="Original"
                className="w-full max-h-72 object-contain rounded-lg"
              />
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.styleTransfer.selectArtisticStyle', 'Select Artistic Style')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {artisticStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      selectedStyle === style.value
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-medium text-sm">{style.label}</p>
                    <p className={`text-xs mt-1 ${selectedStyle === style.value ? 'text-purple-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {style.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.styleTransfer.styleIntensity', 'Style Intensity')}
              </label>
              <div className="flex gap-3">
                {intensityLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setIntensity(level.value)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      intensity === level.value
                        ? 'bg-purple-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preserve Colors */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="preserveColors"
                checked={preserveColors}
                onChange={(e) => setPreserveColors(e.target.checked)}
                className="w-4 h-4 text-purple-500 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="preserveColors" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.styleTransfer.preserveOriginalColorsOnlyApply', 'Preserve original colors (only apply style texture)')}
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleApplyStyle}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.styleTransfer.applyingStyle', 'Applying Style...')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('tools.styleTransfer.applyStyle', 'Apply Style')}
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
        {styledImage && (
          <div className="space-y-4">
            {/* Before/After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.styleTransfer.original', 'Original')}</p>
                <img
                  src={originalPreview || ''}
                  alt="Original"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
              </div>
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {artisticStyles.find(s => s.value === selectedStyle)?.label} Style
                </p>
                <img
                  src={styledImage}
                  alt="Styled"
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
                {t('tools.styleTransfer.download', 'Download')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.styleTransfer.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('tools.styleTransfer.saveToLibrary', 'Save to Library')}
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

export default StyleTransferTool;
