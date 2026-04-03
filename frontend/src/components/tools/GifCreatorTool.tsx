import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Film, Upload, Download, Loader2, RefreshCw, X, Plus, Trash2, ArrowUp, ArrowDown, Play, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

interface GifCreatorToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

interface GifConfig {
  frameDelay: number;
  quality: string;
  loopCount: number;
  width: number;
  imageCount: number;
  createdAt: string;
}

const COLUMNS = [
  { key: 'frameDelay', label: 'Frame Delay (ms)' },
  { key: 'quality', label: 'Quality' },
  { key: 'loopCount', label: 'Loop Count' },
  { key: 'width', label: 'Width (px)' },
  { key: 'imageCount', label: 'Image Count' },
  { key: 'createdAt', label: 'Created At' },
];

const speedOptions = [
  { value: 100, label: 'Fast (100ms)' },
  { value: 200, label: 'Normal (200ms)' },
  { value: 500, label: 'Slow (500ms)' },
  { value: 1000, label: 'Very Slow (1s)' },
];

const qualityOptions = [
  { value: 'low', label: 'Low (small file)' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High (best quality)' },
];

export const GifCreatorTool: React.FC<GifCreatorToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [images, setImages] = useState<UploadedImage[]>([]);

  // Load image from URL - simple approach: display and warn about GIF creation limitations
  const loadImageFromUrl = (url: string) => {
    console.log('[GifCreatorTool] Loading image from URL:', url);

    // Add image with URL as preview and placeholder file
    const newImage: UploadedImage = {
      id: Math.random().toString(36).substr(2, 9),
      file: new File([], 'prefilled-image.png', { type: 'image/png' }),
      preview: url,
    };
    setImages(prev => [...prev, newImage]);
    // Note: GIF creation uses canvas which has CORS restrictions
    setError('Note: For CDN images, GIF creation may not work due to browser security. Upload images directly for full functionality.');
  };

  // Apply prefill data - check both uiConfig and prefillData for compatibility
  useEffect(() => {
    const params = (uiConfig?.params || prefillData?.params) as Record<string, any>;
    if (params) {
      console.log('[GifCreatorTool] Received params:', params);
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.frameDelay) {
          setFrameDelay(Number(params.frameDelay));
          hasPrefill = true;
        }
        if (params.quality) {
          setQuality(params.quality as string);
          hasPrefill = true;
        }
        if (params.width) {
          setWidth(Number(params.width));
          hasPrefill = true;
        }
        if (params.loopCount !== undefined) {
          setLoopCount(Number(params.loopCount));
          hasPrefill = true;
        }
        // Restore the generated GIF URL if available
        if (params.gifUrl || params.imageUrl) {
          setGeneratedGif(params.gifUrl || params.imageUrl);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Check for image URLs (can be array or single)
        const imageUrls = params.imageUrls || params.images;
        if (imageUrls && Array.isArray(imageUrls)) {
          imageUrls.forEach((url: string) => loadImageFromUrl(url));
          hasPrefill = true;
        }

        // Single image (same pattern as ImageResizerTool)
        const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
        console.log('[GifCreatorTool] Image source found:', imageSource);
        if (imageSource) {
          loadImageFromUrl(imageSource);
          hasPrefill = true;
        }

        // Settings
        if (params.frameDelay) setFrameDelay(Number(params.frameDelay));
        if (params.quality) setQuality(params.quality as string);
        if (params.width) setWidth(Number(params.width));
        if (params.speed) setFrameDelay(Number(params.speed));
        hasPrefill = hasPrefill || params.frameDelay || params.quality || params.width || params.speed;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params, prefillData?.params]);

  const handleSaveToGallery = async () => {
    if (!generatedGif) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: generatedGif,
        title: `GIF: ${images.length} frames`,
        prompt: `GIF created with ${images.length} frames`,
        metadata: {
          toolId: 'gif-creator',
          frameDelay: frameDelay,
          quality: quality,
          width: width,
          loopCount: loopCount,
          imageCount: images.length,
          gifUrl: generatedGif,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = (uiConfig?.params || prefillData?.params) as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };
  const [generatedGif, setGeneratedGif] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [frameDelay, setFrameDelay] = useState(200);
  const [quality, setQuality] = useState('medium');
  const [loopCount, setLoopCount] = useState(0); // 0 = infinite
  const [width, setWidth] = useState(480);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const newImages: UploadedImage[] = [];

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Each image must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: UploadedImage = {
          id: generateId(),
          file,
          preview: e.target?.result as string,
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newImages = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      return newImages;
    });
  };

  const handleCreateGif = async () => {
    if (images.length < 2) {
      setError('Please add at least 2 images to create a GIF');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas not supported');
      }

      canvas.width = width;
      canvas.height = width; // Square for simplicity

      // Load all images
      const loadedImages: HTMLImageElement[] = [];
      for (const img of images) {
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('Failed to load image'));
          image.src = img.preview;
        });
        loadedImages.push(image);
      }

      // Create GIF encoder
      const gif = GIFEncoder();

      // Process each frame
      for (const image of loadedImages) {
        // Draw image to canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;

        // Convert to format expected by gifenc (RGBA to RGB)
        const rgbData = new Uint8Array(canvas.width * canvas.height * 3);
        for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
          rgbData[j] = data[i];     // R
          rgbData[j + 1] = data[i + 1]; // G
          rgbData[j + 2] = data[i + 2]; // B
        }

        // Quantize to 256 colors and get palette
        const palette = quantize(rgbData, 256);
        const indexedPixels = applyPalette(rgbData, palette);

        // Add frame to GIF
        gif.writeFrame(indexedPixels, canvas.width, canvas.height, {
          palette,
          delay: frameDelay,
          repeat: loopCount === 0 ? 0 : loopCount, // 0 = infinite loop
        });
      }

      // Finish and get the GIF data
      gif.finish();
      const gifData = gif.bytes();

      // Create blob and URL
      const blob = new Blob([gifData], { type: 'image/gif' });
      const gifUrl = URL.createObjectURL(blob);

      setGeneratedGif(gifUrl);

    } catch (err: any) {
      console.error('GIF creation error:', err);
      setError(err.message || 'An error occurred while creating the GIF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedGif) return;

    try {
      const response = await fetch(generatedGif);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `animation-${Date.now()}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download GIF');
    }
  };

  const handleReset = () => {
    setImages([]);
    setGeneratedGif(null);
    setError(null);
    setFrameDelay(200);
    setQuality('medium');
    setLoopCount(0);
    setWidth(480);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getGifConfig = (): GifConfig => ({
    frameDelay,
    quality,
    loopCount,
    width,
    imageCount: images.length,
    createdAt: new Date().toISOString(),
  });

  const handleExportJSON = () => {
    const config = getGifConfig();
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gif-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const config = getGifConfig();
    const headers = COLUMNS.map(col => col.label).join(',');
    const values = COLUMNS.map(col => {
      const value = config[col.key as keyof GifConfig];
      return typeof value === 'string' ? `"${value}"` : value;
    }).join(',');
    const csv = `${headers}\n${values}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gif-config-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Preview animation
  React.useEffect(() => {
    if (!isPreviewPlaying || images.length < 2) return;

    const interval = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % images.length);
    }, frameDelay);

    return () => clearInterval(interval);
  }, [isPreviewPlaying, images.length, frameDelay]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Film className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gifCreator.gifCreator', 'GIF Creator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gifCreator.createAnimatedGifsFromImages', 'Create animated GIFs from images')}</p>
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{isEditFromGallery ? t('tools.gifCreator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.gifCreator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Upload Area */}
        {!generatedGif && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-green-500 bg-green-500/10'
                  : isDark
                  ? 'border-gray-600 hover:border-green-500/50 bg-gray-800/50'
                  : 'border-gray-300 hover:border-green-500/50 bg-gray-50'
              }`}
            >
              <Plus className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-1 font-medium`}>
                {t('tools.gifCreator.addImages', 'Add Images')}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.gifCreator.clickOrDragDropMultiple', 'Click or drag & drop multiple images')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Image List */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Frames ({images.length} images)
                  </label>
                  {images.length >= 2 && (
                    <button
                      onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                        isPreviewPlaying
                          ? 'bg-green-500 text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      {isPreviewPlaying ? t('tools.gifCreator.stopPreview', 'Stop Preview') : t('tools.gifCreator.preview', 'Preview')}
                    </button>
                  )}
                </div>

                {/* Preview Animation */}
                {isPreviewPlaying && images.length >= 2 && (
                  <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} rounded-lg p-4 border flex justify-center`}>
                    <img
                      src={images[previewIndex]?.preview}
                      alt={`Frame ${previewIndex + 1}`}
                      className="max-h-48 object-contain rounded"
                    />
                  </div>
                )}

                {/* Frame List */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className={`relative group ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border p-2`}
                    >
                      <img
                        src={img.preview}
                        alt={`Frame ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <div className="absolute top-1 left-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                        {index + 1}
                      </div>
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveImage(img.id, 'up')}
                          disabled={index === 0}
                          className="p-1 bg-black/60 text-white rounded hover:bg-black/80 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveImage(img.id, 'down')}
                          disabled={index === images.length - 1}
                          className="p-1 bg-black/60 text-white rounded hover:bg-black/80 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeImage(img.id)}
                          className="p-1 bg-red-500/80 text-white rounded hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            {images.length >= 2 && (
              <div className="space-y-4">
                {/* Frame Delay */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.gifCreator.frameSpeed', 'Frame Speed')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {speedOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFrameDelay(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          frameDelay === option.value
                            ? 'bg-green-500 text-white'
                            : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.gifCreator.quality', 'Quality')}
                  </label>
                  <div className="flex gap-2">
                    {qualityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setQuality(option.value)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          quality === option.value
                            ? 'bg-green-500 text-white'
                            : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.gifCreator.width', 'Width')}
                    </label>
                    <span className="text-green-500 font-semibold">{width}px</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    step="40"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                {/* Loop Options */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="infiniteLoop"
                    checked={loopCount === 0}
                    onChange={(e) => setLoopCount(e.target.checked ? 0 : 1)}
                    className="w-4 h-4 text-green-500 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="infiniteLoop" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.gifCreator.loopInfinitely', 'Loop infinitely')}
                  </label>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateGif}
                  disabled={isProcessing || images.length < 2}
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('tools.gifCreator.creatingGif', 'Creating GIF...')}
                    </>
                  ) : (
                    <>
                      <Film className="w-5 h-5" />
                      {t('tools.gifCreator.createGif', 'Create GIF')}
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Result View */}
        {generatedGif && (
          <div className="space-y-4">
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border flex justify-center`}>
              <img
                src={generatedGif}
                alt="Generated GIF"
                className="max-h-96 object-contain rounded-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 items-center">
              {saveSuccess && (
                <span className="flex items-center gap-1 text-green-500 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {t('tools.gifCreator.saved', 'Saved!')}
                </span>
              )}
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t('tools.gifCreator.downloadImage', 'Download Image')}
              </button>
              <button
                onClick={handleSaveToGallery}
                disabled={isSaving}
                className="py-3 px-6 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save
              </button>
              <ExportDropdown
                onExportJSON={handleExportJSON}
                onExportCSV={handleExportCSV}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
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
        {images.length === 0 && (
          <div className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
            <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.gifCreator.howToCreateGifs', 'How to Create GIFs')}</h4>
            <ul className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>{t('tools.gifCreator.uploadAtLeast2Images', 'Upload at least 2 images to create an animation')}</li>
              <li>{t('tools.gifCreator.dragToReorderFramesAs', 'Drag to reorder frames as needed')}</li>
              <li>{t('tools.gifCreator.adjustFrameSpeedForTiming', 'Adjust frame speed for timing')}</li>
              <li>{t('tools.gifCreator.previewBeforeCreatingTheFinal', 'Preview before creating the final GIF')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GifCreatorTool;
