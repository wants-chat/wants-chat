import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eraser, Upload, Download, Loader2, RefreshCw, X, MousePointer2, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const removalModes = [
  { value: 'auto', label: 'Auto Detect', description: 'AI automatically detects and removes objects' },
  { value: 'text', label: 'Remove Text', description: 'Remove watermarks, text overlays' },
  { value: 'people', label: 'Remove People', description: 'Remove people from photos' },
  { value: 'objects', label: 'Remove Objects', description: 'Remove unwanted objects' },
];

interface ObjectRemovalToolProps {
  uiConfig?: UIConfig;
}

export const ObjectRemovalTool: React.FC<ObjectRemovalToolProps> = ({ uiConfig }) => {
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

  const [removalMode, setRemovalMode] = useState('auto');
  const [objectDescription, setObjectDescription] = useState('');
  const [inpaintQuality, setInpaintQuality] = useState('high');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Store the prefilled URL for backend processing
  const [prefilledUrl, setPrefilledUrl] = useState<string | null>(null);

  // Load image from URL - simple approach: just display and store URL for backend
  const loadImageFromUrl = (url: string) => {
    setError(null);
    console.log('[ObjectRemovalTool] Loading image from URL:', url);

    // Store URL for backend to download and process
    setPrefilledUrl(url);
    // Display image directly - browser handles cross-origin for <img> tags
    setOriginalPreview(url);
    // Set placeholder File so UI shows controls (actual processing uses URL)
    setOriginalImage(new File([], 'prefilled-image.png', { type: 'image/png' }));
    setProcessedImage(null);
  };

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        removalMode?: string;
        objectDescription?: string;
        inpaintQuality?: string;
      };
      console.log('[ObjectRemovalTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.removalMode) setRemovalMode(params.removalMode);
        if (params.objectDescription) setObjectDescription(params.objectDescription);
        if (params.inpaintQuality) setInpaintQuality(params.inpaintQuality);
      } else {
        // Also apply text description if provided
        if (params.text || params.content) {
          setObjectDescription(params.text || params.content || '');
          setIsPrefilled(true);
        }
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[ObjectRemovalTool] Image source found:', imageSource);
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
    setProcessedImage(null);

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

  const handleRemoveObjects = async () => {
    if (!originalImage) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Build the prompt based on mode
      let prompt = '';
      switch (removalMode) {
        case 'text':
          prompt = 'Remove all text, watermarks, and overlays from this image. Inpaint the areas naturally.';
          break;
        case 'people':
          prompt = 'Remove all people from this image. Fill in the background naturally.';
          break;
        case 'objects':
          prompt = objectDescription
            ? `Remove ${objectDescription} from this image. Inpaint naturally.`
            : 'Remove unwanted objects from this image. Inpaint naturally.';
          break;
        default:
          prompt = objectDescription
            ? `Remove ${objectDescription} from this image`
            : 'Clean up this image by removing any distracting elements';
      }

      let response;

      // Use JSON for URL-based images, FormData for file uploads
      if (prefilledUrl && (!originalImage || originalImage.size === 0)) {
        // Send JSON when using URL
        const payload: Record<string, any> = {
          imageUrl: prefilledUrl,
          mode: removalMode,
          quality: inpaintQuality,
          prompt,
        };
        if (objectDescription) {
          payload.objectDescription = objectDescription;
        }
        response = await api.post('/ai/image/object-removal', payload);
      } else if (originalImage && originalImage.size > 0) {
        // Send FormData when uploading a file
        const formData = new FormData();
        formData.append('image', originalImage);
        formData.append('mode', removalMode);
        formData.append('quality', inpaintQuality);
        formData.append('prompt', prompt);
        if (objectDescription) {
          formData.append('objectDescription', objectDescription);
        }
        response = await api.post('/ai/image/object-removal', formData);
      } else {
        setError('No image available. Please upload an image.');
        setIsProcessing(false);
        return;
      }

      if (response.success && response.data?.imageUrl) {
        setProcessedImage(response.data.imageUrl);
      } else {
        setError(response.error || 'Failed to remove objects');
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
      a.download = `cleaned-${originalImage?.name || 'image.png'}`;
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
    setRemovalMode('auto');
    setObjectDescription('');
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

      const formData = new FormData();
      formData.append('file', blob, `cleaned-${originalImage?.name || 'image.png'}`);
      formData.append('toolId', 'object-removal');
      formData.append('metadata', JSON.stringify({
        toolId: 'object-removal',
        removalMode,
        objectDescription,
        inpaintQuality,
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
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-rose-900/20' : 'bg-gradient-to-r from-white to-rose-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <Eraser className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.objectRemoval.objectRemoval', 'Object Removal')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.objectRemoval.removeUnwantedObjectsTextOr', 'Remove unwanted objects, text, or people from photos')}</p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs text-[#0D9488] font-medium">{t('tools.objectRemoval.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

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
                ? 'border-rose-500 bg-rose-500/10'
                : isDark
                ? 'border-gray-600 hover:border-rose-500/50 bg-gray-800/50'
                : 'border-gray-300 hover:border-rose-500/50 bg-gray-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.objectRemoval.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.objectRemoval.supportsJpgPngWebpMax', 'Supports JPG, PNG, WebP (max 10MB)')}
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

        {/* Removal Options */}
        {originalImage && !processedImage && (
          <div className="space-y-6">
            {/* Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <img
                src={originalPreview || ''}
                alt="Original"
                className="w-full max-h-72 object-contain rounded-lg"
              />
            </div>

            {/* Removal Mode */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.objectRemoval.whatToRemove', 'What to Remove')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {removalModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setRemovalMode(mode.value)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      removalMode === mode.value
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-medium">{mode.label}</p>
                    <p className={`text-xs mt-1 ${removalMode === mode.value ? 'text-rose-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {mode.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Object Description */}
            {(removalMode === 'objects' || removalMode === 'auto') && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.objectRemoval.describeWhatToRemoveOptional', 'Describe what to remove (optional)')}
                </label>
                <input
                  type="text"
                  value={objectDescription}
                  onChange={(e) => setObjectDescription(e.target.value)}
                  placeholder={t('tools.objectRemoval.eGTheTrashCan', 'e.g., the trash can on the left, the car in background')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            )}

            {/* Quality Selection */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.objectRemoval.inpaintingQuality', 'Inpainting Quality')}
              </label>
              <div className="flex gap-3">
                {['fast', 'balanced', 'high'].map((quality) => (
                  <button
                    key={quality}
                    onClick={() => setInpaintQuality(quality)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium capitalize transition-all ${
                      inpaintQuality === quality
                        ? 'bg-rose-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRemoveObjects}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.objectRemoval.removingObjects', 'Removing Objects...')}
                  </>
                ) : (
                  <>
                    <MousePointer2 className="w-5 h-5" />
                    {t('tools.objectRemoval.removeObjects', 'Remove Objects')}
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
            {/* Before/After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.objectRemoval.before', 'Before')}</p>
                <img
                  src={originalPreview || ''}
                  alt="Original"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
              </div>
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.objectRemoval.after', 'After')}</p>
                <img
                  src={processedImage}
                  alt="Processed"
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
                {t('tools.objectRemoval.download', 'Download')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.objectRemoval.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('tools.objectRemoval.saveToLibrary', 'Save to Library')}
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
            <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.objectRemoval.tips', 'Tips')}</h4>
            <ul className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>{t('tools.objectRemoval.worksBestWithClearWell', 'Works best with clear, well-lit photos')}</li>
              <li>{t('tools.objectRemoval.describeSpecificObjectsForBetter', 'Describe specific objects for better results')}</li>
              <li>{t('tools.objectRemoval.useRemoveTextForWatermarks', 'Use "Remove Text" for watermarks and overlays')}</li>
              <li>{t('tools.objectRemoval.higherQualityTakesLongerBut', 'Higher quality takes longer but produces better inpainting')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectRemovalTool;
