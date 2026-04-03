import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Download, Lock, Unlock, Image as ImageIcon, X, Sparkles, Loader2, Save, CheckCircle } from 'lucide-react';
import { ToolContainer } from './ToolContainer';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { api } from '../../lib/api';

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageResizerToolProps {
  uiConfig?: UIConfig;
}

const PRESET_SIZES = [
  { name: 'Thumbnail', width: 150, height: 150 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Cover', width: 820, height: 312 },
  { name: 'Twitter Header', width: 1500, height: 500 },
  { name: 'HD (720p)', width: 1280, height: 720 },
  { name: 'Full HD (1080p)', width: 1920, height: 1080 },
  { name: '4K (2160p)', width: 3840, height: 2160 },
];

export const ImageResizerTool = ({ uiConfig }: ImageResizerToolProps) => {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [targetDimensions, setTargetDimensions] = useState<{ width?: number; height?: number } | null>(null);
  const [prefilledUrl, setPrefilledUrl] = useState<string | null>(null); // For backend fallback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    console.log('[ImageResizer] uiConfig:', uiConfig);
    console.log('[ImageResizer] params:', uiConfig?.params);

    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        inputFile?: string;
        sourceImage?: string;
        width?: number;
        height?: number;
        isEditFromGallery?: boolean;
        aspectRatioLocked?: boolean;
      };

      console.log('[ImageResizer] Parsed params:', {
        imageUrl: params.imageUrl,
        imagePreview: params.imagePreview,
        inputFile: params.inputFile,
        sourceImage: params.sourceImage,
        width: params.width,
        height: params.height,
        isEditFromGallery: params.isEditFromGallery,
      });

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.width) setWidth(params.width);
        if (params.height) setHeight(params.height);
        if (typeof params.aspectRatioLocked === 'boolean') {
          setAspectRatioLocked(params.aspectRatioLocked);
        }
      } else {
        // Store target dimensions to apply after image loads
        if (params.width || params.height) {
          console.log('[ImageResizer] Setting target dimensions:', params.width, 'x', params.height);
          setTargetDimensions({ width: params.width, height: params.height });
          // Unlock aspect ratio if both dimensions are specified (user wants specific size)
          if (params.width && params.height) {
            setAspectRatioLocked(false);
          }
        }
      }

      // Load image from URL or preview - check multiple possible field names
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[ImageResizer] Image source found:', imageSource);

      if (imageSource) {
        loadImageFromUrl(imageSource);
        setIsPrefilled(true);
      } else {
        console.log('[ImageResizer] No image source found in params');
      }
    }
  }, [uiConfig?.params]);

  // Apply target dimensions after image loads
  useEffect(() => {
    if (originalDimensions && targetDimensions) {
      if (targetDimensions.width) setWidth(targetDimensions.width);
      if (targetDimensions.height) setHeight(targetDimensions.height);
      // Clear target dimensions after applying
      setTargetDimensions(null);
    }
  }, [originalDimensions, targetDimensions]);

  // Load image from URL - simple approach: display and store for backend processing
  const loadImageFromUrl = (url: string) => {
    setError('');
    console.log('[ImageResizer] Loading image from URL:', url);

    // Store URL for backend fallback
    setPrefilledUrl(url);
    // Display image directly - browser handles cross-origin for <img> tags
    setImage(url);
    setResizedImage(null);

    // Get dimensions (this works without CORS for display purposes)
    const img = new Image();
    img.onload = () => {
      console.log('[ImageResizer] Image dimensions:', img.width, 'x', img.height);
      setOriginalDimensions({ width: img.width, height: img.height });
      if (!targetDimensions) {
        setWidth(img.width);
        setHeight(img.height);
      }
    };
    img.src = url;
  };

  const handleFileUpload = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(e.target?.result as string);
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
        setResizedImage(null);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (aspectRatioLocked && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (aspectRatioLocked && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handlePresetSize = (presetWidth: number, presetHeight: number) => {
    setWidth(presetWidth);
    setHeight(presetHeight);
  };

  const resizeImage = async () => {
    if (!image || !width || !height) return;

    setIsResizing(true);
    setError('');

    // If we have a prefilled URL, use backend to resize (avoids CORS issues)
    if (prefilledUrl) {
      try {
        const response = await api.post('/tools/images/resize-from-url', {
          imageUrl: prefilledUrl,
          width,
          height,
        });

        if (response.success && response.data?.url) {
          setResizedImage(response.data.url);
        } else {
          setError(response.error || 'Failed to resize image');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to resize image. Please try uploading directly.');
      } finally {
        setIsResizing(false);
      }
      return;
    }

    // For uploaded files (data URLs), use client-side canvas
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas not supported');
        setIsResizing(false);
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL('image/png');
        setResizedImage(resizedDataUrl);
        setIsResizing(false);
      };
      img.onerror = () => {
        setError('Failed to process image');
        setIsResizing(false);
      };
      img.src = image;
    } catch (err) {
      setError('Failed to resize image');
      setIsResizing(false);
    }
  };

  const downloadImage = () => {
    if (!resizedImage) return;

    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = `resized-${width}x${height}.png`;
    link.click();
  };

  const resetTool = () => {
    setImage(null);
    setOriginalDimensions(null);
    setWidth(0);
    setHeight(0);
    setResizedImage(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!resizedImage) return;

    setIsSaving(true);
    setError('');
    try {
      // Convert data URL to blob
      const response = await fetch(resizedImage);
      const blob = await response.blob();

      // Save to content library using the content API
      const saveResponse = await api.post('/content', {
        contentType: 'image',
        url: resizedImage,
        title: `Resized Image ${width}x${height}`,
        prompt: `Image resized to ${width}x${height}`,
        metadata: {
          toolId: 'image-resizer',
          width,
          height,
          aspectRatioLocked,
          originalWidth: originalDimensions?.width,
          originalHeight: originalDimensions?.height,
        },
      });

      if (saveResponse.success || saveResponse.data) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);

        // Call onSaveCallback if provided
        const params = uiConfig?.params as Record<string, any>;
        if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
          params.onSaveCallback();
        }
      } else {
        setError('Failed to save image to library');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save image');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ToolContainer
      title={t('tools.imageResizer.imageResizer', 'Image Resizer')}
      description="Resize images to custom dimensions or preset sizes"
      icon={ImageIcon}
    >
      <div className="space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && image && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">
                Pre-filled from chat: Image loaded
                {uiConfig?.params?.width && uiConfig?.params?.height && (
                  <span className="ml-1">• Target size: {uiConfig.params.width}×{uiConfig.params.height}px</span>
                )}
              </span>
            </div>
            <span className="text-xs text-[#0D9488]/70">{t('tools.imageResizer.readyToResize', 'Ready to resize!')}</span>
          </div>
        )}

        {/* Upload Section */}
        {!image && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? t('tools.imageResizer.border0d9488Bg0d948810', 'border-[#0D9488] bg-[#0D9488]/10') : t('tools.imageResizer.borderGray600HoverBorder', 'border-gray-600 hover:border-[#0D9488]/50 bg-gray-800/50')
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-white mb-2">{t('tools.imageResizer.clickToUploadOrDrag', 'Click to upload or drag & drop')}</p>
            <p className="text-sm text-gray-400">{t('tools.imageResizer.supportsJpgPngGifWebp', 'Supports JPG, PNG, GIF, WebP')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-900/30 border border-red-800">
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {/* Image Preview and Controls */}
        {image && originalDimensions && (
          <>
            {/* Original Image Preview */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{t('tools.imageResizer.originalImage', 'Original Image')}</h3>
                <span className="text-sm text-gray-400">
                  {originalDimensions.width} × {originalDimensions.height} px
                </span>
              </div>
              <div className="max-w-full overflow-auto bg-gray-900 rounded-lg p-2">
                <img
                  src={image}
                  alt="Original"
                  className="max-w-full max-h-64 object-contain mx-auto rounded"
                />
              </div>
            </div>

            {/* Dimension Controls */}
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {t('tools.imageResizer.widthPx', 'Width (px)')}
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                  className={`p-2 rounded-lg transition-colors ${
                    aspectRatioLocked
                      ? t('tools.imageResizer.bg0d9488TextWhite', 'bg-[#0D9488] text-white') : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={aspectRatioLocked ? t('tools.imageResizer.aspectRatioLocked', 'Aspect ratio locked') : t('tools.imageResizer.aspectRatioUnlocked', 'Aspect ratio unlocked')}
                >
                  {aspectRatioLocked ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Unlock className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {t('tools.imageResizer.heightPx', 'Height (px)')}
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Preset Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  {t('tools.imageResizer.presetSizes', 'Preset Sizes')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_SIZES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSize(preset.width, preset.height)}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      {preset.name}
                      <span className="block text-xs text-gray-400 mt-1">
                        {preset.width}×{preset.height}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resizeImage}
                  disabled={isResizing}
                  className="flex-1 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isResizing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('tools.imageResizer.resizing', 'Resizing...')}
                    </>
                  ) : (
                    'Resize Image'
                  )}
                </button>
                <button
                  onClick={resetTool}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Section */}
            {resizedImage && (
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-white font-semibold mb-3">{t('tools.imageResizer.preview', 'Preview')}</h3>
                  <div className="max-w-full overflow-auto bg-gray-900 rounded-lg p-4">
                    <img
                      ref={imageRef}
                      src={resizedImage}
                      alt="Resized preview"
                      className="max-w-full h-auto"
                    />
                  </div>
                  <p className="text-gray-300 mt-2">
                    New dimensions: {width} × {height} px
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={downloadImage}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    {t('tools.imageResizer.download', 'Download')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('tools.imageResizer.saving', 'Saving...')}
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t('tools.imageResizer.saved', 'Saved!')}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {t('tools.imageResizer.saveToLibrary', 'Save to Library')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolContainer>
  );
};
