import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScanText, Upload, Copy, Download, Loader2, RefreshCw, X, Languages, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { api } from '../../lib/api';

const languages = [
  { value: 'eng', label: 'English' },
  { value: 'spa', label: 'Spanish' },
  { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' },
  { value: 'ita', label: 'Italian' },
  { value: 'por', label: 'Portuguese' },
  { value: 'rus', label: 'Russian' },
  { value: 'jpn', label: 'Japanese' },
  { value: 'kor', label: 'Korean' },
  { value: 'chi_sim', label: 'Chinese (Simplified)' },
  { value: 'chi_tra', label: 'Chinese (Traditional)' },
  { value: 'ara', label: 'Arabic' },
  { value: 'hin', label: 'Hindi' },
  { value: 'ben', label: 'Bengali' },
];

interface ImageToTextToolProps {
  uiConfig?: UIConfig;
}

export const ImageToTextTool: React.FC<ImageToTextToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        language?: string;
        selectedLanguage?: string;
      };
      console.log('[ImageToTextTool] Received params:', params);

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.language || params.selectedLanguage) {
          setSelectedLanguage((params.language || params.selectedLanguage) as string);
        }
      } else {
        // Also apply language if specified
        if (params.language) setSelectedLanguage(params.language as string);
      }

      // Check all possible field names for image URL (same pattern as ImageResizerTool)
      const imageSource = params.imageUrl || params.imagePreview || params.inputFile || params.sourceImage;
      console.log('[ImageToTextTool] Image source found:', imageSource);
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
    setExtractedText('');
    console.log('[ImageToTextTool] Loading image from URL:', url);

    // Store URL for backend to download and process
    setPrefilledUrl(url);
    // Display image directly - browser handles cross-origin for <img> tags
    setImagePreview(url);
    // Set placeholder File so UI shows controls (actual processing uses URL)
    setImageFile(new File([], 'prefilled-image.png', { type: 'image/png' }));
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setExtractedText('');

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
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

  const handleExtractText = async () => {
    if (!imageFile && !prefilledUrl) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // For URL-based images, use the URL directly with Tesseract (it supports URLs)
      const imageSource = prefilledUrl || imageFile;

      // Check if Tesseract is available (must be installed separately)
      // @ts-ignore - dynamic check for optional dependency
      if (typeof window !== 'undefined' && window.Tesseract) {
        // @ts-ignore
        const result = await window.Tesseract.recognize(imageSource, selectedLanguage, {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });
        setExtractedText(result.data.text);
      } else {
        // Simulate OCR for demo - extract image as placeholder text
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(100);

        // Show demo message
        const imageName = prefilledUrl ? 'Prefilled image' : imageFile?.name || 'Unknown';
        setExtractedText(
          `[OCR Demo Mode]\n\n` +
          `To enable full OCR functionality:\n` +
          `1. Run: npm install tesseract.js\n` +
          `2. Add to index.html: <script src="https://unpkg.com/tesseract.js@5/dist/tesseract.min.js"></script>\n\n` +
          `Image: ${imageName}\n` +
          `Language: ${languages.find(l => l.value === selectedLanguage)?.label || selectedLanguage}`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from image');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setExtractedText('');
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!extractedText) return;

    setIsSaving(true);
    setError(null);
    try {
      // Save extracted text as a text file
      const blob = new Blob([extractedText], { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', blob, `extracted-text-${Date.now()}.txt`);
      formData.append('toolId', 'image-to-text');
      formData.append('metadata', JSON.stringify({
        toolId: 'image-to-text',
        selectedLanguage,
        textLength: extractedText.length,
        sourceImage: prefilledUrl || imageFile?.name,
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
      setError(err.message || 'Failed to save extracted text');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-violet-900/20' : 'bg-gradient-to-r from-white to-violet-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <ScanText className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.imageToText.imageToTextOcr', 'Image to Text (OCR)')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.imageToText.extractTextFromImagesUsing', 'Extract text from images using AI-powered OCR')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.imageToText.imageLoadedFromYourUpload', 'Image loaded from your upload')}</span>
          </div>
        )}

        {/* Upload Area */}
        {!imageFile && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-violet-500 bg-violet-500/10'
                : isDark
                ? 'border-gray-600 hover:border-violet-500/50 bg-gray-800/50'
                : 'border-gray-300 hover:border-violet-500/50 bg-gray-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`${isDark ? 'text-white' : 'text-gray-900'} mb-2 font-medium`}>
              {t('tools.imageToText.clickToUploadOrDrag', 'Click to upload or drag & drop')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.imageToText.supportsJpgPngWebpGif', 'Supports JPG, PNG, WebP, GIF, BMP (max 10MB)')}
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

        {/* Image Preview & Options */}
        {imageFile && !extractedText && (
          <div className="space-y-6">
            {/* Preview */}
            <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
              <img
                src={imagePreview || ''}
                alt="Upload preview"
                className="w-full max-h-72 object-contain rounded-lg"
              />
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Languages className="w-4 h-4" />
                {t('tools.imageToText.documentLanguage', 'Document Language')}
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.imageToText.extractingText', 'Extracting text...')}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{progress}%</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full bg-violet-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExtractText}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.imageToText.extracting', 'Extracting...')}
                  </>
                ) : (
                  <>
                    <ScanText className="w-5 h-5" />
                    {t('tools.imageToText.extractText', 'Extract Text')}
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

        {/* Results */}
        {extractedText && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.imageToText.extractedText', 'Extracted Text')}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    copied
                      ? 'bg-green-500 text-white'
                      : isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? t('tools.imageToText.copied', 'Copied!') : t('tools.imageToText.copy', 'Copy')}
                </button>
                <button
                  onClick={handleDownload}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {t('tools.imageToText.download', 'Download')}
                </button>
              </div>
            </div>

            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={12}
              className={`w-full px-4 py-3 rounded-lg border resize-none ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
            />

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
                {t('tools.imageToText.extractFromAnotherImage', 'Extract from Another Image')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 px-6 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('tools.imageToText.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('tools.imageToText.saveToLibrary', 'Save to Library')}
                  </>
                )}
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

export default ImageToTextTool;
