import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Loader2, Download, ExternalLink, RefreshCw, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

interface GeneratedThumbnail {
  url: string;
  prompt: string;
  timestamp: Date;
}

const thumbnailStyles = [
  { value: 'youtube', label: 'YouTube Style' },
  { value: 'podcast', label: 'Podcast Cover' },
  { value: 'blog', label: 'Blog Featured' },
  { value: 'social', label: 'Social Media' },
  { value: 'course', label: 'Course/Tutorial' },
  { value: 'news', label: 'News Article' },
];

const aspectRatios = [
  { value: '16:9', label: '16:9 (YouTube)', width: 1280, height: 720 },
  { value: '1:1', label: '1:1 (Square)', width: 1024, height: 1024 },
  { value: '4:3', label: '4:3 (Standard)', width: 1024, height: 768 },
  { value: '9:16', label: '9:16 (Vertical)', width: 720, height: 1280 },
];

const colorSchemes = [
  { value: 'vibrant', label: 'Vibrant & Bold' },
  { value: 'dark', label: 'Dark & Moody' },
  { value: 'light', label: 'Light & Clean' },
  { value: 'neon', label: 'Neon & Futuristic' },
  { value: 'pastel', label: 'Pastel & Soft' },
  { value: 'professional', label: 'Professional' },
];

const COLUMNS = [
  { key: 'url', label: 'Image URL' },
  { key: 'prompt', label: 'Prompt' },
  { key: 'timestamp', label: 'Generated At' },
];

interface ThumbnailGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const ThumbnailGeneratorTool: React.FC<ThumbnailGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState(thumbnailStyles[0].value);
  const [aspectRatio, setAspectRatio] = useState(aspectRatios[0]);
  const [colorScheme, setColorScheme] = useState(colorSchemes[0].value);
  const [includeText, setIncludeText] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<GeneratedThumbnail[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleExportCSV = () => {
    if (generatedThumbnails.length === 0) return;

    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = generatedThumbnails.map(thumbnail =>
      [
        `"${thumbnail.url}"`,
        `"${thumbnail.prompt.replace(/"/g, '""')}"`,
        `"${thumbnail.timestamp.toISOString()}"`,
      ].join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thumbnails-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (generatedThumbnails.length === 0) return;

    const jsonData = {
      exportDate: new Date().toISOString(),
      totalThumbnails: generatedThumbnails.length,
      thumbnails: generatedThumbnails.map(thumbnail => ({
        url: thumbnail.url,
        prompt: thumbnail.prompt,
        generatedAt: thumbnail.timestamp.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thumbnails-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.title) {
          setTitle(params.title);
          hasPrefill = true;
        }
        if (params.description) {
          setDescription(params.description);
          hasPrefill = true;
        }
        if (params.style) {
          setStyle(params.style);
          hasPrefill = true;
        }
        if (params.colorScheme) {
          setColorScheme(params.colorScheme);
          hasPrefill = true;
        }
        if (params.aspectRatio) {
          const ar = aspectRatios.find(a => a.value === params.aspectRatio);
          if (ar) setAspectRatio(ar);
          hasPrefill = true;
        }
        if (params.includeText !== undefined) {
          setIncludeText(params.includeText);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setGeneratedThumbnails([{
            url: params.imageUrl,
            prompt: params.prompt || '',
            timestamp: new Date(),
          }]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        if (params.text || params.content) {
          setTitle(params.text || params.content || '');
          hasPrefill = true;
        }
        if (params.formData) {
          if (params.formData.title) setTitle(params.formData.title);
          if (params.formData.description) setDescription(params.formData.description);
          if (params.formData.style) setStyle(params.formData.style);
          if (params.formData.colorScheme) setColorScheme(params.formData.colorScheme);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleSave = async (thumbnailUrl: string, thumbnailPrompt: string) => {
    if (!thumbnailUrl) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: thumbnailUrl,
        title: `Thumbnail: ${title || 'Untitled'}`,
        prompt: thumbnailPrompt,
        metadata: {
          toolId: 'thumbnail-generator',
          title: title,
          description: description,
          style: style,
          colorScheme: colorScheme,
          aspectRatio: aspectRatio.value,
          includeText: includeText,
          imageUrl: thumbnailUrl,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Please enter a video/content title');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const textInstructions = includeText
        ? `Include bold, readable text overlay with the title "${title}" prominently displayed.`
        : 'Do not include any text in the image.';

      const prompt = `Create a professional ${style} thumbnail for: "${title}".
${description ? `Description: ${description}.` : ''}
Style: ${colorScheme} color scheme, eye-catching and click-worthy.
${textInstructions}
Make it visually striking with high contrast and professional quality.
Optimized for ${aspectRatio.label} format.`;

      const response = await api.post('/ai/image/generate', {
        prompt,
        width: aspectRatio.width,
        height: aspectRatio.height,
        numberResults: 2,
        negativePrompt: 'blurry, low quality, distorted, amateur, watermark, logo',
      });

      if (response.success && response.data?.images) {
        const newThumbnails = response.data.images.map((img: any) => ({
          url: img.url,
          prompt,
          timestamp: new Date(),
        }));
        setGeneratedThumbnails(prev => [...newThumbnails, ...prev]);
      } else {
        setError(response.error || 'Failed to generate thumbnails');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating thumbnails');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `thumbnail-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-teal-900/20' : t('tools.thumbnailGenerator.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Image className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.thumbnailGenerator.aiThumbnailGenerator', 'AI Thumbnail Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.thumbnailGenerator.createEyeCatchingThumbnailsFor', 'Create eye-catching thumbnails for videos and content')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{isEditFromGallery ? t('tools.thumbnailGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.thumbnailGenerator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.thumbnailGenerator.videoContentTitle', 'Video/Content Title *')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('tools.thumbnailGenerator.eG10TipsTo', 'e.g., 10 Tips to Master AI in 2024')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.thumbnailGenerator.descriptionOptional', 'Description (Optional)')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('tools.thumbnailGenerator.describeTheVisualElementsYou', 'Describe the visual elements you want in the thumbnail...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Style and Color Scheme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.thumbnailGenerator.style', 'Style')}</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {thumbnailStyles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.thumbnailGenerator.colorScheme', 'Color Scheme')}</label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {colorSchemes.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.thumbnailGenerator.aspectRatio', 'Aspect Ratio')}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {aspectRatios.map((ar) => (
              <button
                key={ar.value}
                onClick={() => setAspectRatio(ar)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  aspectRatio.value === ar.value
                    ? 'bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>

        {/* Include Text Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIncludeText(!includeText)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              includeText ? 'bg-[#0D9488]' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                includeText ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.thumbnailGenerator.includeTextOverlayOnThumbnail', 'Include text overlay on thumbnail')}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} text-sm`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !title.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.thumbnailGenerator.generatingThumbnails', 'Generating Thumbnails...')}
            </>
          ) : (
            <>
              <Image className="w-5 h-5" />
              {t('tools.thumbnailGenerator.generateThumbnails', 'Generate Thumbnails')}
            </>
          )}
        </button>

        {/* Generated Thumbnails */}
        {generatedThumbnails.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Image className="w-4 h-4" />
                {t('tools.thumbnailGenerator.generatedThumbnails', 'Generated Thumbnails')}
              </h4>
              <div className="flex items-center gap-2">
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportJSON={handleExportJSON}
                  disabled={generatedThumbnails.length === 0}
                  showImport={false}
                  theme={theme}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-lg transition-colors text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.thumbnailGenerator.regenerate', 'Regenerate')}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedThumbnails.map((thumbnail, index) => (
                <div
                  key={`${thumbnail.timestamp.getTime()}-${index}`}
                  className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} rounded-xl overflow-hidden group`}
                >
                  <div className="relative">
                    <img
                      src={thumbnail.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleDownload(thumbnail.url, index)}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        title={t('tools.thumbnailGenerator.download', 'Download')}
                      >
                        <Download className="w-5 h-5 text-gray-800" />
                      </button>
                      <a
                        href={thumbnail.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        title={t('tools.thumbnailGenerator.openInNewTab', 'Open in new tab')}
                      >
                        <ExternalLink className="w-5 h-5 text-gray-800" />
                      </a>
                      <button
                        onClick={() => handleSave(thumbnail.url, thumbnail.prompt)}
                        disabled={isSaving}
                        className="p-2 bg-[#0D9488] rounded-lg hover:bg-[#0D9488]/90 transition-colors disabled:opacity-50"
                        title={t('tools.thumbnailGenerator.saveToGallery', 'Save to Gallery')}
                      >
                        {saveSuccess ? <CheckCircle className="w-5 h-5 text-white" /> : <Save className="w-5 h-5 text-white" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedThumbnails.length === 0 && !isGenerating && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.thumbnailGenerator.yourGeneratedThumbnailsWillAppear', 'Your generated thumbnails will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailGeneratorTool;
