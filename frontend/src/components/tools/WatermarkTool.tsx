import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Stamp, Upload, Download, RefreshCw, X, Type, Image as ImageIcon, Sparkles, Save, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type WatermarkType = 'text' | 'image';
type Position = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'tile';

const positions: { value: Position; label: string }[] = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'center-left', label: 'Center Left' },
  { value: 'center', label: 'Center' },
  { value: 'center-right', label: 'Center Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'tile', label: 'Tile (Repeat)' },
];

interface WatermarkToolProps {
  uiConfig?: UIConfig;
}

export const WatermarkTool: React.FC<WatermarkToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watermark settings
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  const [watermarkText, setWatermarkText] = useState('© Your Name');
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>('bottom-right');
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(100);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        watermarkType?: WatermarkType;
        watermarkText?: string;
        position?: Position;
        opacity?: number;
        fontSize?: number;
        textColor?: string;
        rotation?: number;
        scale?: number;
      };
      console.log('[WatermarkTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.watermarkType) setWatermarkType(params.watermarkType);
        if (params.watermarkText) setWatermarkText(params.watermarkText);
        if (params.position) setPosition(params.position);
        if (params.opacity) setOpacity(params.opacity);
        if (params.fontSize) setFontSize(params.fontSize);
        if (params.textColor) setTextColor(params.textColor);
        if (params.rotation !== undefined) setRotation(params.rotation);
        if (params.scale) setScale(params.scale);
      } else {
        // Also apply watermark text if specified
        if (params.text) setWatermarkText(params.text as string);
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[WatermarkTool] Image source found:', imageSource);
      if (imageSource) {
        loadImageFromUrl(imageSource);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Store the prefilled URL
  const [prefilledUrl, setPrefilledUrl] = useState<string | null>(null);

  // Load image from URL - simple approach: display URL and warn about limitations
  const loadImageFromUrl = (url: string) => {
    setError(null);
    setResultImage(null);
    console.log('[WatermarkTool] Loading image from URL:', url);

    // Store URL and display directly
    setPrefilledUrl(url);
    setImagePreview(url);
    // Set placeholder File so UI shows controls
    setImageFile(new File([], 'prefilled-image.png', { type: 'image/png' }));
    // Note: Watermark tool uses canvas which has CORS restrictions
    setError('Note: For CDN images, watermark may not apply due to browser security. Upload the image directly for full functionality.');
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setResultImage(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image for watermark');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setWatermarkImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const applyWatermark = () => {
    if (!imagePreview) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Apply watermark
      ctx.globalAlpha = opacity / 100;

      if (watermarkType === 'text') {
        applyTextWatermark(ctx, img.width, img.height);
      } else if (watermarkImage) {
        applyImageWatermark(ctx, img.width, img.height);
      }

      ctx.globalAlpha = 1;
      setResultImage(canvas.toDataURL('image/png'));
    };
    img.src = imagePreview;
  };

  const applyTextWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const scaledFontSize = (fontSize * scale) / 100;
    ctx.font = `${scaledFontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(watermarkText).width;
    const textHeight = scaledFontSize;

    if (position === 'tile') {
      const padding = 100;
      ctx.save();
      ctx.rotate((rotation * Math.PI) / 180);
      for (let y = -height; y < height * 2; y += textHeight + padding) {
        for (let x = -width; x < width * 2; x += textWidth + padding) {
          ctx.fillText(watermarkText, x, y);
        }
      }
      ctx.restore();
    } else {
      const { x, y } = getPosition(width, height, textWidth, textHeight);
      ctx.save();
      ctx.translate(x + textWidth / 2, y + textHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(watermarkText, -textWidth / 2, 0);
      ctx.restore();
    }
  };

  const applyImageWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const wmImg = new window.Image();
    wmImg.onload = () => {
      const scaledWidth = (wmImg.width * scale) / 100;
      const scaledHeight = (wmImg.height * scale) / 100;

      // Apply opacity before drawing watermark image
      ctx.globalAlpha = opacity / 100;

      if (position === 'tile') {
        const padding = 50;
        for (let y = 0; y < height; y += scaledHeight + padding) {
          for (let x = 0; x < width; x += scaledWidth + padding) {
            ctx.save();
            ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(wmImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
            ctx.restore();
          }
        }
      } else {
        const { x, y } = getPosition(width, height, scaledWidth, scaledHeight);
        ctx.save();
        ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(wmImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        ctx.restore();
      }

      // Reset opacity after drawing
      ctx.globalAlpha = 1;
      setResultImage(canvasRef.current?.toDataURL('image/png') || null);
    };
    wmImg.src = watermarkImage!;
  };

  const getPosition = (canvasWidth: number, canvasHeight: number, wmWidth: number, wmHeight: number) => {
    const padding = 20;
    switch (position) {
      case 'top-left': return { x: padding, y: padding };
      case 'top-center': return { x: (canvasWidth - wmWidth) / 2, y: padding };
      case 'top-right': return { x: canvasWidth - wmWidth - padding, y: padding };
      case 'center-left': return { x: padding, y: (canvasHeight - wmHeight) / 2 };
      case 'center': return { x: (canvasWidth - wmWidth) / 2, y: (canvasHeight - wmHeight) / 2 };
      case 'center-right': return { x: canvasWidth - wmWidth - padding, y: (canvasHeight - wmHeight) / 2 };
      case 'bottom-left': return { x: padding, y: canvasHeight - wmHeight - padding };
      case 'bottom-center': return { x: (canvasWidth - wmWidth) / 2, y: canvasHeight - wmHeight - padding };
      case 'bottom-right': return { x: canvasWidth - wmWidth - padding, y: canvasHeight - wmHeight - padding };
      default: return { x: 0, y: 0 };
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `watermarked-${imageFile?.name || 'image.png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResultImage(null);
    setWatermarkImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!resultImage) return;

    setIsSaving(true);
    setError(null);
    try {
      // Save to content library using the content API
      const result = await api.post('/content', {
        contentType: 'image',
        url: resultImage,
        title: `Watermarked: ${imageFile?.name || 'image.png'}`,
        prompt: `Image with ${watermarkType} watermark`,
        metadata: {
          toolId: 'watermark',
          watermarkType,
          watermarkText,
          position,
          opacity,
          fontSize,
          textColor,
          rotation,
          scale,
        },
      });

      if (result.success || result.data) {
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

  useEffect(() => {
    if (imagePreview && (watermarkText || watermarkImage)) {
      applyWatermark();
    }
  }, [imagePreview, watermarkType, watermarkText, watermarkImage, position, opacity, fontSize, textColor, rotation, scale]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Stamp className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.watermark.watermarkTool', 'Watermark Tool')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.watermark.addTextOrImageWatermarks', 'Add text or image watermarks to protect your images')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.watermark.imageLoadedFromYourUpload', 'Image loaded from your upload')}</span>
          </div>
        )}

        {/* Upload Area */}
        {!imageFile && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-500/10'
                : isDark
                ? 'border-gray-600 hover:border-amber-500/50 bg-gray-800/50'
                : 'border-gray-300 hover:border-amber-500/50 bg-gray-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.watermark.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.watermark.supportsJpgPngWebp', 'Supports JPG, PNG, WebP')}
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

        {/* Editor */}
        {imageFile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings */}
            <div className="space-y-4">
              {/* Watermark Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setWatermarkType('text')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    watermarkType === 'text'
                      ? 'bg-amber-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  {t('tools.watermark.text', 'Text')}
                </button>
                <button
                  onClick={() => setWatermarkType('image')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    watermarkType === 'image'
                      ? 'bg-amber-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  {t('tools.watermark.image', 'Image')}
                </button>
              </div>

              {/* Text Watermark Options */}
              {watermarkType === 'text' && (
                <>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.watermark.watermarkText', 'Watermark Text')}
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {t('tools.watermark.textColor', 'Text Color')}
                      </label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Image Watermark */}
              {watermarkType === 'image' && (
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.watermark.watermarkImageLogo', 'Watermark Image (Logo)')}
                  </label>
                  <button
                    onClick={() => watermarkInputRef.current?.click()}
                    className={`w-full py-3 px-4 rounded-lg border-2 border-dashed ${
                      isDark ? 'border-gray-600 hover:border-amber-500/50' : 'border-gray-300 hover:border-amber-500/50'
                    }`}
                  >
                    {watermarkImage ? t('tools.watermark.changeWatermarkImage', 'Change watermark image') : t('tools.watermark.selectWatermarkImage', 'Select watermark image')}
                  </button>
                  <input
                    ref={watermarkInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleWatermarkImageSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}

              {/* Common Settings */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.watermark.position', 'Position')}
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as Position)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {positions.map((pos) => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Opacity: {opacity}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Scale: {scale}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={scale}
                    onChange={(e) => setScale(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Rotation: {rotation}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.watermark.preview', 'Preview')}</p>
                <img
                  src={resultImage || imagePreview || ''}
                  alt="Preview"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  disabled={!resultImage}
                  className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  {t('tools.watermark.download', 'Download')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!resultImage || isSaving}
                  className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('tools.watermark.saving', 'Saving...')}
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {t('tools.watermark.saved', 'Saved!')}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {t('tools.watermark.saveToLibrary', 'Save to Library')}
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatermarkTool;
