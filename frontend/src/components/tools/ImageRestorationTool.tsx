import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { History, Upload, Download, Loader2, RefreshCw, X, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

const restorationTypes = [
  { value: 'general', label: 'General Restore', description: 'Fix scratches, dust, and minor damage' },
  { value: 'face', label: 'Face Enhancement', description: 'Restore and enhance facial details' },
  { value: 'old-photo', label: 'Old Photo Revival', description: 'Bring old photos back to life' },
  { value: 'damaged', label: 'Heavily Damaged', description: 'Repair significant damage and tears' },
];

const enhancementOptions = [
  { value: 'denoise', label: 'Remove Noise' },
  { value: 'deblur', label: 'Fix Blur' },
  { value: 'scratch', label: 'Remove Scratches' },
  { value: 'color-correct', label: 'Color Correction' },
];

interface RestorationRecord {
  restorationType: string;
  enhancements: string;
  intensity: number;
  timestamp: Date;
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'restorationType',
    header: 'Restoration Type',
    type: 'string',
  },
  {
    key: 'enhancements',
    header: 'Enhancements Applied',
    type: 'string',
  },
  {
    key: 'intensity',
    header: 'Intensity %',
    type: 'number',
  },
  {
    key: 'timestamp',
    header: 'Created At',
    type: 'date',
  },
];

interface ImageRestorationToolProps {
  uiConfig?: UIConfig;
}

export const ImageRestorationTool: React.FC<ImageRestorationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [restorationType, setRestorationType] = useState('general');
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>(['denoise', 'scratch']);
  const [restoreIntensity, setRestoreIntensity] = useState(70);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [restorationHistory, setRestorationHistory] = useState<RestorationRecord[]>([]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        restorationType?: string;
        selectedEnhancements?: string[];
        restoreIntensity?: number;
      };
      console.log('[ImageRestorationTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.restorationType) setRestorationType(params.restorationType);
        if (params.selectedEnhancements) setSelectedEnhancements(params.selectedEnhancements);
        if (params.restoreIntensity) setRestoreIntensity(params.restoreIntensity);
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[ImageRestorationTool] Image source found:', imageSource);
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
    console.log('[ImageRestorationTool] Loading image from URL:', url);

    // Store URL for backend to download and process
    setPrefilledUrl(url);
    // Display image directly - browser handles cross-origin for <img> tags
    setOriginalPreview(url);
    // Set placeholder File so UI shows controls (actual processing uses URL)
    setOriginalImage(new File([], 'prefilled-image.png', { type: 'image/png' }));
    setRestoredImage(null);
  };

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
    setRestoredImage(null);

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

  const toggleEnhancement = (value: string) => {
    setSelectedEnhancements(prev =>
      prev.includes(value)
        ? prev.filter(e => e !== value)
        : [...prev, value]
    );
  };

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = restorationHistory.map(record => ({
      restorationType: record.restorationType,
      enhancements: record.enhancements,
      intensity: record.intensity,
      timestamp: record.timestamp,
    }));
    exportToCSV(dataToExport, COLUMNS, { filename: 'restoration-history' });
  };

  const handleExportExcel = () => {
    const dataToExport = restorationHistory.map(record => ({
      restorationType: record.restorationType,
      enhancements: record.enhancements,
      intensity: record.intensity,
      timestamp: record.timestamp,
    }));
    exportToExcel(dataToExport, COLUMNS, { filename: 'restoration-history' });
  };

  const handleExportJSON = () => {
    const dataToExport = restorationHistory.map(record => ({
      restorationType: record.restorationType,
      enhancements: record.enhancements,
      intensity: record.intensity,
      timestamp: record.timestamp,
    }));
    exportToJSON(dataToExport, { filename: 'restoration-history' });
  };

  const handleExportPDF = async () => {
    const dataToExport = restorationHistory.map(record => ({
      restorationType: record.restorationType,
      enhancements: record.enhancements,
      intensity: record.intensity,
      timestamp: record.timestamp,
    }));
    await exportToPDF(dataToExport, COLUMNS, {
      filename: 'restoration-history',
      title: 'Image Restoration History',
      orientation: 'portrait',
    });
  };

  const handlePrint = () => {
    const dataToExport = restorationHistory.map(record => ({
      restorationType: record.restorationType,
      enhancements: record.enhancements,
      intensity: record.intensity,
      timestamp: record.timestamp,
    }));
    printData(dataToExport, COLUMNS, {
      title: 'Image Restoration History',
    });
  };

  const handleCopyToClipboard = async () => {
    const dataToExport = restorationHistory.map(record => ({
      restorationType: record.restorationType,
      enhancements: record.enhancements,
      intensity: record.intensity,
      timestamp: record.timestamp,
    }));
    return await copyUtil(dataToExport, COLUMNS, 'tab');
  };

  const handleRestore = async () => {
    if (!originalImage) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const typeLabel = restorationTypes.find(t => t.value === restorationType)?.label;
      const enhancementLabels = selectedEnhancements.map(e =>
        enhancementOptions.find(opt => opt.value === e)?.label
      ).filter(Boolean);
      const prompt = `Restore this old/damaged photo using ${typeLabel}. Apply these enhancements: ${enhancementLabels.join(', ')}. Restoration intensity: ${restoreIntensity}%`;

      let response;

      // Use JSON for URL-based images, FormData for file uploads
      if (prefilledUrl && (!originalImage || originalImage.size === 0)) {
        // Send JSON when using URL
        response = await api.post('/ai/image/restore', {
          imageUrl: prefilledUrl,
          restorationType,
          enhancements: selectedEnhancements,
          intensity: restoreIntensity,
          prompt,
        });
      } else if (originalImage && originalImage.size > 0) {
        // Send FormData when uploading a file
        const formData = new FormData();
        formData.append('image', originalImage);
        formData.append('restorationType', restorationType);
        formData.append('enhancements', JSON.stringify(selectedEnhancements));
        formData.append('intensity', restoreIntensity.toString());
        formData.append('prompt', prompt);
        response = await api.post('/ai/image/restore', formData);
      } else {
        setError('No image available. Please upload an image.');
        setIsProcessing(false);
        return;
      }

      if (response.success && response.data?.imageUrl) {
        setRestoredImage(response.data.imageUrl);
        // Add to restoration history
        const enhancementLabels = selectedEnhancements.map(e =>
          enhancementOptions.find(opt => opt.value === e)?.label
        ).filter(Boolean).join(', ');
        const record: RestorationRecord = {
          restorationType: restorationTypes.find(t => t.value === restorationType)?.label || restorationType,
          enhancements: enhancementLabels || 'None',
          intensity: restoreIntensity,
          timestamp: new Date(),
        };
        setRestorationHistory(prev => [record, ...prev]);
      } else {
        setError(response.error || 'Failed to restore image');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while restoring the image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!restoredImage) return;

    try {
      const response = await fetch(restoredImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `restored-${originalImage?.name || 'image.png'}`;
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
    setRestoredImage(null);
    setError(null);
    setRestorationType('general');
    setSelectedEnhancements(['denoise', 'scratch']);
    setRestoreIntensity(70);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!restoredImage) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(restoredImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, `restored-${originalImage?.name || 'image.png'}`);
      formData.append('toolId', 'image-restoration');
      formData.append('metadata', JSON.stringify({
        toolId: 'image-restoration',
        restorationType,
        selectedEnhancements,
        restoreIntensity,
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
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <History className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.imageRestoration.imageRestoration', 'Image Restoration')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.imageRestoration.restoreOldDamagedOrLow', 'Restore old, damaged, or low-quality photos')}</p>
            </div>
          </div>
          {restorationHistory.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={restorationHistory.length === 0}
              showImport={false}
              theme={theme}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.imageRestoration.imageLoadedFromYourUpload', 'Image loaded from your upload')}</span>
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
                ? 'border-amber-500 bg-amber-500/10'
                : isDark
                ? 'border-gray-600 hover:border-amber-500/50 bg-gray-800/50'
                : 'border-gray-300 hover:border-amber-500/50 bg-gray-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.imageRestoration.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.imageRestoration.uploadOldOrDamagedPhotos', 'Upload old or damaged photos (max 10MB)')}
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

        {/* Restoration Options */}
        {originalImage && !restoredImage && (
          <div className="space-y-6">
            {/* Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <img
                src={originalPreview || ''}
                alt="Original"
                className="w-full max-h-72 object-contain rounded-lg"
              />
            </div>

            {/* Restoration Type */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.imageRestoration.restorationType', 'Restoration Type')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {restorationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setRestorationType(type.value)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      restorationType === type.value
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                        : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-medium">{type.label}</p>
                    <p className={`text-xs mt-1 ${restorationType === type.value ? 'text-amber-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhancement Options */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.imageRestoration.enhancements', 'Enhancements')}
              </label>
              <div className="flex flex-wrap gap-2">
                {enhancementOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleEnhancement(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedEnhancements.includes(option.value)
                        ? 'bg-amber-500 text-white'
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

            {/* Intensity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.imageRestoration.restorationIntensity', 'Restoration Intensity')}
                </label>
                <span className="text-amber-500 font-semibold">{restoreIntensity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={restoreIntensity}
                onChange={(e) => setRestoreIntensity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.imageRestoration.subtle', 'Subtle')}</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.imageRestoration.aggressive', 'Aggressive')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRestore}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.imageRestoration.restoring', 'Restoring...')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('tools.imageRestoration.restorePhoto', 'Restore Photo')}
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
        {restoredImage && (
          <div className="space-y-4">
            {/* Before/After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.imageRestoration.original', 'Original')}</p>
                <img
                  src={originalPreview || ''}
                  alt="Original"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
              </div>
              <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.imageRestoration.restored', 'Restored')}</p>
                <img
                  src={restoredImage}
                  alt="Restored"
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
                {t('tools.imageRestoration.download', 'Download')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.imageRestoration.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('tools.imageRestoration.saveToLibrary', 'Save to Library')}
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
            <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.imageRestoration.whatWeCanRestore', 'What We Can Restore')}</h4>
            <ul className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>{t('tools.imageRestoration.oldFadedPhotographs', 'Old faded photographs')}</li>
              <li>{t('tools.imageRestoration.scratchedOrDamagedImages', 'Scratched or damaged images')}</li>
              <li>{t('tools.imageRestoration.lowQualityOrBlurryPhotos', 'Low-quality or blurry photos')}</li>
              <li>{t('tools.imageRestoration.photosWithNoiseOrGrain', 'Photos with noise or grain')}</li>
              <li>{t('tools.imageRestoration.facesThatNeedEnhancement', 'Faces that need enhancement')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageRestorationTool;
