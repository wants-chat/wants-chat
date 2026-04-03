import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Download, Loader2, Share2, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { imagitarApi, ImageGenerationParams } from '../../lib/imagitarApi';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  platform: string;
}

const platforms = [
  { label: 'Instagram Post', width: 1080, height: 1080 },
  { label: 'Instagram Story', width: 1080, height: 1920 },
  { label: 'Facebook Post', width: 1200, height: 630 },
  { label: 'Twitter Post', width: 1200, height: 675 },
  { label: 'LinkedIn Post', width: 1200, height: 627 },
  { label: 'Pinterest Pin', width: 1000, height: 1500 },
];

const styleOptions = [
  { label: 'Minimalist', value: 'minimalist, clean design, simple, elegant' },
  { label: 'Colorful', value: 'vibrant colors, colorful, eye-catching, bold' },
  { label: 'Professional', value: 'professional, corporate, clean, business' },
  { label: 'Playful', value: 'playful, fun, energetic, creative' },
];

const textOverlayOptions = [
  { label: 'None', value: '' },
  { label: 'Quote', value: 'inspirational quote overlay' },
  { label: 'Announcement', value: 'announcement text overlay' },
  { label: 'Tip', value: 'helpful tip text overlay' },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'platform', header: 'Platform', type: 'string' },
  { key: 'prompt', header: 'Prompt', type: 'string' },
  { key: 'url', header: 'Image URL', type: 'string' },
  { key: 'timestamp', header: 'Generated', type: 'date' },
];

interface SocialMediaImageToolProps {
  uiConfig?: UIConfig;
}

const SocialMediaImageTool: React.FC<SocialMediaImageToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<GeneratedImage>('social-media-images', [], COLUMNS);

  const [prompt, setPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedStyle, setSelectedStyle] = useState(styleOptions[0]);
  const [textOverlay, setTextOverlay] = useState(textOverlayOptions[0]);
  const [brandColors, setBrandColors] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [savingImageId, setSavingImageId] = useState<string | null>(null);

  const generatedSectionRef = useRef<HTMLDivElement>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        selectedPlatform?: typeof platforms[0];
        selectedStyle?: typeof styleOptions[0];
        textOverlay?: typeof textOverlayOptions[0];
        brandColors?: string;
        prompt?: string;
      };

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.selectedPlatform) setSelectedPlatform(params.selectedPlatform);
        if (params.selectedStyle) setSelectedStyle(params.selectedStyle);
        if (params.textOverlay) setTextOverlay(params.textOverlay);
        if (params.brandColors) setBrandColors(params.brandColors);
        if (params.prompt) setPrompt(params.prompt);
      } else {
        // For social media image generator, prefill prompt from text/content
        if (params.text || params.content) {
          setPrompt(params.text || params.content || '');
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter an image description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let fullPrompt = prompt;

      // Add style
      if (selectedStyle.value) {
        fullPrompt += `, ${selectedStyle.value}`;
      }

      // Add text overlay
      if (textOverlay.value) {
        fullPrompt += `, ${textOverlay.value}`;
      }

      // Add brand colors
      if (brandColors.trim()) {
        fullPrompt += `, using brand colors: ${brandColors}`;
      }

      // Add social media optimization
      fullPrompt += `, optimized for social media, high quality, engaging`;

      const params: ImageGenerationParams = {
        prompt: fullPrompt,
        width: selectedPlatform.width,
        height: selectedPlatform.height,
        numberResults: 1,
        negativePrompt: 'blurry, low quality, distorted, ugly, text errors, watermark',
      };

      const result = await imagitarApi.generateImage(params);

      if (result.success && result.data?.images) {
        const newImages = result.data.images.map((img, idx) => ({
          id: `${Date.now()}-${idx}`,
          url: img.url,
          prompt: fullPrompt,
          timestamp: new Date(),
          platform: selectedPlatform.label,
        }));
        setGeneratedImages((prev) => [...newImages, ...prev]);
        setTimeout(() => {
          generatedSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else {
        setError(result.error || 'Failed to generate image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, platform: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `social-${platform.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleSave = async (img: GeneratedImage) => {
    setSavingImageId(img.id);
    setError(null);
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, `social-${img.platform.toLowerCase().replace(/\s+/g, '-')}.png`);
      formData.append('toolId', 'social-media-image');
      formData.append('metadata', JSON.stringify({
        toolId: 'social-media-image',
        prompt,
        selectedPlatform,
        selectedStyle,
        textOverlay,
        brandColors,
      }));

      const result = await imagitarApi.uploadToLibrary(formData);

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
      setSavingImageId(null);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.socialMediaImage.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.socialMediaImage.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Share2 className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.socialMediaImage.socialMediaImageGenerator', 'Social Media Image Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.socialMediaImage.createOptimizedImagesForSocial', 'Create optimized images for social platforms')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="social-media-image" toolName="Social Media Image" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
            onRetry={forceSync}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.socialMediaImage.descriptionLoadedFromYourInput', 'Description loaded from your input')}</span>
          </div>
        )}

        {/* Platform Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.socialMediaImage.platform', 'Platform')}
          </label>
          <select
            value={selectedPlatform.label}
            onChange={(e) => {
              const platform = platforms.find((p) => p.label === e.target.value);
              if (platform) setSelectedPlatform(platform);
            }}
            className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          >
            {platforms.map((platform) => (
              <option key={platform.label} value={platform.label}>
                {platform.label} ({platform.width} × {platform.height})
              </option>
            ))}
          </select>
        </div>

        {/* Image Description */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.socialMediaImage.imageDescription', 'Image Description')}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('tools.socialMediaImage.describeYourSocialMediaImage', 'Describe your social media image (e.g., Modern tech workspace with laptop and coffee)')}
            rows={3}
            className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Style & Text Overlay Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Style Selection */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.socialMediaImage.style', 'Style')}</label>
            <select
              value={selectedStyle.label}
              onChange={(e) => {
                const style = styleOptions.find((s) => s.label === e.target.value);
                if (style) setSelectedStyle(style);
              }}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {styleOptions.map((style) => (
                <option key={style.label} value={style.label}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Text Overlay */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.socialMediaImage.textOverlay', 'Text Overlay')}</label>
            <select
              value={textOverlay.label}
              onChange={(e) => {
                const overlay = textOverlayOptions.find((o) => o.label === e.target.value);
                if (overlay) setTextOverlay(overlay);
              }}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {textOverlayOptions.map((overlay) => (
                <option key={overlay.label} value={overlay.label}>
                  {overlay.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.socialMediaImage.brandColorsOptional', 'Brand Colors (Optional)')}
          </label>
          <input
            type="text"
            value={brandColors}
            onChange={(e) => setBrandColors(e.target.value)}
            placeholder={t('tools.socialMediaImage.eGTealAndWhite', 'e.g., teal and white, #0D9488, navy blue')}
            className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-xl text-red-600 text-sm`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.socialMediaImage.generating', 'Generating...')}
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              {t('tools.socialMediaImage.generateSocialImage', 'Generate Social Image')}
            </>
          )}
        </button>

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Image className="w-4 h-4" />
                {t('tools.socialMediaImage.generatedImages', 'Generated Images')}
              </h4>
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'social-media-images' })}
                onExportExcel={() => exportExcel({ filename: 'social-media-images' })}
                onExportJSON={() => exportJSON({ filename: 'social-media-images' })}
                onExportPDF={() => exportPDF({
                  filename: 'social-media-images',
                  title: 'Social Media Images',
                  subtitle: `Generated ${generatedImages.length} images`
                })}
                onPrint={() => print('Social Media Images')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {generatedImages.map((img, index) => (
                <div
                  key={`${img.timestamp.getTime()}-${index}`}
                  className={`group relative rounded-xl overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleDownload(img.url, img.platform, index)}
                      className="p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                      title={t('tools.socialMediaImage.download', 'Download')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSave(img)}
                      disabled={savingImageId === img.id}
                      className="p-3 bg-[#0D9488] rounded-full text-white hover:bg-[#0F766E] transition-colors disabled:opacity-50"
                      title={t('tools.socialMediaImage.saveToLibrary', 'Save to Library')}
                    >
                      {savingImageId === img.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                    <p className="text-white text-xs font-medium">{img.platform}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs line-clamp-2">{img.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <Share2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.socialMediaImage.yourSocialMediaImagesWill', 'Your social media images will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaImageTool;
