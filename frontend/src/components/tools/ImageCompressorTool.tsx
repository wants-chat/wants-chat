import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Download, Image as ImageIcon, X, Sparkles, Save, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { ToolContainer } from './ToolContainer';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ImageCompressorToolProps {
  uiConfig?: UIConfig;
}

export const ImageCompressorTool = ({ uiConfig }: ImageCompressorToolProps) => {
  const { t } = useTranslation();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('image/jpeg');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        quality?: number;
        fileType?: string;
      };
      console.log('[ImageCompressorTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.quality) setQuality(Number(params.quality));
        if (params.fileType) setFileType(params.fileType);
      } else {
        // Also apply quality if specified
        if (params.quality) setQuality(Number(params.quality));
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[ImageCompressorTool] Image source found:', imageSource);
      if (imageSource) {
        loadImageFromUrl(imageSource, params.imageName);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Load image from URL - follows ImageResizer pattern with CORS fallback
  const loadImageFromUrl = (url: string, name?: string) => {
    setError('');
    console.log('[ImageCompressorTool] Loading image from URL:', url);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      console.log('[ImageCompressorTool] Image loaded with CORS');
      setFileName(name || 'uploaded-image');
      setOriginalImage(url);
      setCompressedImage(null);
      // Try to get size from canvas
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setOriginalSize(blob.size);
            setFileType(blob.type === 'image/png' ? 'image/png' : 'image/jpeg');
          }
        }, 'image/jpeg');
      } catch (e) {
        console.log('[ImageCompressorTool] Canvas size estimation failed');
      }
    };

    img.onerror = () => {
      console.log('[ImageCompressorTool] CORS load failed, trying without CORS');
      const imgNoCors = new Image();
      imgNoCors.onload = () => {
        console.log('[ImageCompressorTool] Image loaded without CORS');
        setOriginalImage(url);
        setFileName(name || 'uploaded-image');
        setCompressedImage(null);
        setError('Note: Image loaded but compression may fail due to CORS. You can still try or upload directly.');
      };
      imgNoCors.onerror = () => {
        console.error('[ImageCompressorTool] Image failed to load completely');
        setError('Failed to load image. Please try uploading directly.');
      };
      imgNoCors.src = url;
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

  const handleFileUpload = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setFileName(file.name);
    setOriginalSize(file.size);
    setFileType(file.type === 'image/png' ? 'image/png' : 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setCompressedImage(null);
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

  const compressImage = () => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const mimeType = fileType === 'image/png' ? 'image/png' : 'image/jpeg';
      const compressed = canvas.toDataURL(mimeType, quality / 100);
      setCompressedImage(compressed);

      // Calculate compressed size
      const base64Length = compressed.split(',')[1].length;
      const sizeInBytes = (base64Length * 3) / 4;
      setCompressedSize(sizeInBytes);
    };
    img.src = originalImage;
  };

  const downloadImage = () => {
    if (!compressedImage) return;

    const link = document.createElement('a');
    const extension = fileType === 'image/png' ? 'png' : 'jpg';
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    link.href = compressedImage;
    link.download = `${nameWithoutExt}-compressed.${extension}`;
    link.click();
  };

  const resetTool = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setQuality(80);
    setFileName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const compressionRatio = originalSize > 0 && compressedSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  const handleSave = async () => {
    if (!compressedImage) return;

    setIsSaving(true);
    setError('');
    try {
      const extension = fileType === 'image/png' ? 'png' : 'jpg';
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

      // Save to content library using the content API
      const result = await api.post('/content', {
        contentType: 'image',
        url: compressedImage,
        title: `Compressed: ${nameWithoutExt}.${extension}`,
        prompt: `Image compressed with ${quality}% quality`,
        metadata: {
          toolId: 'image-compressor',
          quality,
          fileType,
          originalSize,
          compressedSize,
          compressionRatio,
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

  return (
    <ToolContainer
      title={t('tools.imageCompressor.imageCompressor', 'Image Compressor')}
      description="Compress images to reduce file size while maintaining quality"
      icon={ImageIcon}
    >
      <div className="space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.imageCompressor.imageLoadedFromYourUpload', 'Image loaded from your upload')}</span>
          </div>
        )}

        {/* Upload Section */}
        {!originalImage && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? t('tools.imageCompressor.border0d9488Bg0d948810', 'border-[#0D9488] bg-[#0D9488]/10') : t('tools.imageCompressor.borderGray600HoverBorder', 'border-gray-600 hover:border-[#0D9488]/50 bg-gray-800/50')
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-white mb-2">{t('tools.imageCompressor.clickToUploadOrDrag', 'Click to upload or drag & drop')}</p>
            <p className="text-sm text-gray-400">{t('tools.imageCompressor.supportsJpgPngWebp', 'Supports JPG, PNG, WebP')}</p>
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

        {/* Compression Controls */}
        {originalImage && (
          <>
            {/* File Info */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-2">{t('tools.imageCompressor.originalFile', 'Original File')}</h3>
              <p className="text-gray-300">Name: {fileName}</p>
              <p className="text-gray-300">Size: {formatFileSize(originalSize)}</p>
              <p className="text-gray-300">
                Type: {fileType === 'image/png' ? t('tools.imageCompressor.png2', 'PNG') : t('tools.imageCompressor.jpeg2', 'JPEG')}
              </p>
            </div>

            {/* Quality Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-200">
                  {t('tools.imageCompressor.quality', 'Quality')}
                </label>
                <span className="text-[#0D9488] font-semibold text-lg">{quality}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{t('tools.imageCompressor.lowerQualitySmallerFile', 'Lower quality (smaller file)')}</span>
                <span>{t('tools.imageCompressor.higherQualityLargerFile', 'Higher quality (larger file)')}</span>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                {t('tools.imageCompressor.outputFormat', 'Output Format')}
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFileType('image/jpeg')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    fileType === 'image/jpeg'
                      ? t('tools.imageCompressor.bg0d9488TextWhite', 'bg-[#0D9488] text-white') : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t('tools.imageCompressor.jpeg', 'JPEG')}
                </button>
                <button
                  onClick={() => setFileType('image/png')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    fileType === 'image/png'
                      ? t('tools.imageCompressor.bg0d9488TextWhite2', 'bg-[#0D9488] text-white') : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t('tools.imageCompressor.png', 'PNG')}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={compressImage}
                className="flex-1 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
              >
                {t('tools.imageCompressor.compressImage', 'Compress Image')}
              </button>
              <button
                onClick={resetTool}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Section */}
            {compressedImage && (
              <div className="space-y-4">
                {/* Size Comparison */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-white font-semibold mb-3">{t('tools.imageCompressor.compressionResults', 'Compression Results')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">{t('tools.imageCompressor.originalSize', 'Original Size')}</p>
                      <p className="text-lg font-semibold text-white">
                        {formatFileSize(originalSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{t('tools.imageCompressor.compressedSize', 'Compressed Size')}</p>
                      <p className="text-lg font-semibold text-green-400">
                        {formatFileSize(compressedSize)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-800">
                    <p className="text-green-300 font-semibold text-center">
                      Reduced by {compressionRatio}%
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-white font-semibold mb-3">{t('tools.imageCompressor.preview', 'Preview')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">{t('tools.imageCompressor.original', 'Original')}</p>
                      <div className="bg-gray-900 rounded-lg p-2">
                        <img
                          src={originalImage}
                          alt="Original"
                          className="w-full h-auto rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">{t('tools.imageCompressor.compressed', 'Compressed')}</p>
                      <div className="bg-gray-900 rounded-lg p-2">
                        <img
                          src={compressedImage}
                          alt="Compressed"
                          className="w-full h-auto rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 items-center">
                  <button
                    onClick={downloadImage}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    {t('tools.imageCompressor.download', 'Download')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('tools.imageCompressor.saving', 'Saving...')}
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t('tools.imageCompressor.saved', 'Saved!')}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {t('tools.imageCompressor.saveToLibrary', 'Save to Library')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-2">{t('tools.imageCompressor.tips', 'Tips')}</h3>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>{t('tools.imageCompressor.jpegIsBetterForPhotos', 'JPEG is better for photos with many colors')}</li>
            <li>{t('tools.imageCompressor.pngIsBetterForGraphics', 'PNG is better for graphics with transparency')}</li>
            <li>Lower quality = smaller file size but more visible artifacts</li>
            <li>{t('tools.imageCompressor.quality7085IsOften', 'Quality 70-85% is often a good balance')}</li>
          </ul>
        </div>
      </div>
    </ToolContainer>
  );
};
