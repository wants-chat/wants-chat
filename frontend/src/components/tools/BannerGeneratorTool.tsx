import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutTemplate, Download, Loader2, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { imagitarApi, ImageGenerationParams } from '../../lib/imagitarApi';
import { ExportDropdown } from '../ui/ExportDropdown';
import { api } from '../../lib/api';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
  bannerType: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'bannerType', header: 'Banner Type' },
  { key: 'prompt', header: 'Prompt' },
  { key: 'timestamp', header: 'Generated At', type: 'date' },
  { key: 'url', header: 'URL' },
];

const bannerTypes = [
  { label: 'YouTube Banner', width: 2560, height: 1440 },
  { label: 'Twitter Header', width: 1500, height: 500 },
  { label: 'LinkedIn Banner', width: 1584, height: 396 },
  { label: 'Facebook Cover', width: 820, height: 312 },
  { label: 'Website Hero', width: 1920, height: 1080 },
];

const styleOptions = [
  { label: 'Corporate', value: 'corporate style, professional, business, clean' },
  { label: 'Creative', value: 'creative design, artistic, innovative, vibrant' },
  { label: 'Minimal', value: 'minimal design, simple, elegant, clean lines' },
  { label: 'Bold', value: 'bold design, striking, eye-catching, powerful' },
];

const colorSchemes = [
  { label: 'Teal & White', value: 'teal and white color scheme, #0D9488' },
  { label: 'Blue & Gold', value: 'blue and gold color scheme, elegant' },
  { label: 'Purple & Pink', value: 'purple and pink gradient, modern' },
  { label: 'Black & White', value: 'black and white, monochrome, sophisticated' },
  { label: 'Warm Sunset', value: 'warm sunset colors, orange and red tones' },
  { label: 'Ocean Blue', value: 'ocean blue tones, aqua and teal' },
  { label: 'Custom', value: '' },
];

interface BannerGeneratorToolProps {
  uiConfig?: UIConfig;
}

const BannerGeneratorTool: React.FC<BannerGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedBannerType, setSelectedBannerType] = useState(bannerTypes[0]);
  const [mainText, setMainText] = useState('');
  const [subtext, setSubtext] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(styleOptions[0]);
  const [colorScheme, setColorScheme] = useState(colorSchemes[0]);
  const [customColors, setCustomColors] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Ref for auto-scrolling to generated content
  const generatedSectionRef = useRef<HTMLDivElement>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.mainText) {
          setMainText(params.mainText);
          hasPrefill = true;
        }
        if (params.subtext) {
          setSubtext(params.subtext);
          hasPrefill = true;
        }
        if (params.bannerType) {
          const type = bannerTypes.find(t => t.label === params.bannerType);
          if (type) setSelectedBannerType(type);
          hasPrefill = true;
        }
        if (params.style) {
          const style = styleOptions.find(s => s.label === params.style);
          if (style) setSelectedStyle(style);
          hasPrefill = true;
        }
        if (params.colorScheme) {
          const scheme = colorSchemes.find(c => c.label === params.colorScheme);
          if (scheme) setColorScheme(scheme);
          hasPrefill = true;
        }
        if (params.customColors) {
          setCustomColors(params.customColors);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setGeneratedImages([{
            url: params.imageUrl,
            prompt: params.mainText || '',
            timestamp: new Date(),
            bannerType: params.bannerType || '',
          }]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic
        if (params.mainText) {
          setMainText(params.mainText);
          hasPrefill = true;
        }
        if (params.subtext) {
          setSubtext(params.subtext);
          hasPrefill = true;
        }
        if (params.bannerType) {
          const type = bannerTypes.find(t => t.label.toLowerCase() === params.bannerType?.toLowerCase());
          if (type) setSelectedBannerType(type);
          hasPrefill = true;
        }
        if (params.style) {
          const style = styleOptions.find(s => s.label.toLowerCase() === params.style?.toLowerCase());
          if (style) setSelectedStyle(style);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!mainText.trim()) {
      setError('Please enter main headline text');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let fullPrompt = `professional banner design with text "${mainText}"`;

      // Add subtext if provided
      if (subtext.trim()) {
        fullPrompt += ` and subtext "${subtext}"`;
      }

      // Add style
      if (selectedStyle.value) {
        fullPrompt += `, ${selectedStyle.value}`;
      }

      // Add color scheme
      if (colorScheme.label === 'Custom' && customColors.trim()) {
        fullPrompt += `, using colors: ${customColors}`;
      } else if (colorScheme.value) {
        fullPrompt += `, ${colorScheme.value}`;
      }

      // Add banner-specific optimizations
      fullPrompt += `, banner layout, optimized for ${selectedBannerType.label.toLowerCase()}, high quality, professional design, typography focused`;

      const params: ImageGenerationParams = {
        prompt: fullPrompt,
        width: selectedBannerType.width,
        height: selectedBannerType.height,
        numberResults: 1,
        negativePrompt: 'blurry, low quality, distorted, cluttered, busy, messy text, unreadable',
      };

      const result = await imagitarApi.generateImage(params);

      if (result.success && result.data?.images) {
        const newImages = result.data.images.map((img) => ({
          url: img.url,
          prompt: fullPrompt,
          timestamp: new Date(),
          bannerType: selectedBannerType.label,
        }));
        setGeneratedImages((prev) => [...newImages, ...prev]);

        // Auto-scroll to generated content after a short delay for rendering
        setTimeout(() => {
          generatedSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else {
        setError(result.error || 'Failed to generate banner');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, bannerType: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `banner-${bannerType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(generatedImages, COLUMNS, { filename: 'banner-generator' });
  };

  const handleExportExcel = () => {
    exportToExcel(generatedImages, COLUMNS, { filename: 'banner-generator' });
  };

  const handleExportJSON = () => {
    exportToJSON(generatedImages, { filename: 'banner-generator' });
  };

  const handleExportPDF = async () => {
    return exportToPDF(generatedImages, COLUMNS, {
      filename: 'banner-generator',
      title: 'Generated Banners',
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    printData(generatedImages, COLUMNS, { title: 'Generated Banners' });
  };

  const handleCopyToClipboard = async () => {
    return copyUtil(generatedImages, COLUMNS, 'tab');
  };

  const handleSave = async (imageUrl: string, imagePrompt: string, bannerType: string) => {
    if (!imageUrl) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: imageUrl,
        title: `Banner: ${mainText.slice(0, 50)}${mainText.length > 50 ? '...' : ''}`,
        prompt: imagePrompt,
        metadata: {
          toolId: 'banner-generator',
          mainText: mainText,
          subtext: subtext,
          bannerType: selectedBannerType.label,
          style: selectedStyle.label,
          colorScheme: colorScheme.label,
          customColors: customColors,
          imageUrl: imageUrl,
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

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.bannerGenerator.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.bannerGenerator.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <LayoutTemplate className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bannerGenerator.bannerGenerator', 'Banner Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bannerGenerator.createProfessionalBannersAndHeaders', 'Create professional banners and headers')}</p>
            </div>
          </div>
          {generatedImages.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={generatedImages.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="p-3 bg-[#0D9488]/10 border border-[#0D9488]/20 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {isEditFromGallery
                ? t('tools.bannerGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.bannerGenerator.fieldsHaveBeenPrefilledFrom', 'Fields have been prefilled from AI suggestions')}
            </span>
          </div>
        )}

        {/* Banner Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.bannerGenerator.bannerType', 'Banner Type')}
          </label>
          <select
            value={selectedBannerType.label}
            onChange={(e) => {
              const type = bannerTypes.find((t) => t.label === e.target.value);
              if (type) setSelectedBannerType(type);
            }}
            className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          >
            {bannerTypes.map((type) => (
              <option key={type.label} value={type.label}>
                {type.label} ({type.width} × {type.height})
              </option>
            ))}
          </select>
        </div>

        {/* Main Text */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.bannerGenerator.mainHeadline', 'Main Headline')}
          </label>
          <input
            type="text"
            value={mainText}
            onChange={(e) => setMainText(e.target.value)}
            placeholder={t('tools.bannerGenerator.enterMainHeadlineEG', 'Enter main headline (e.g., Welcome to Our Platform)')}
            className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Subtext */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.bannerGenerator.subtextOptional', 'Subtext (Optional)')}
          </label>
          <input
            type="text"
            value={subtext}
            onChange={(e) => setSubtext(e.target.value)}
            placeholder={t('tools.bannerGenerator.enterSubtextEGYour', 'Enter subtext (e.g., Your success is our mission)')}
            className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Style & Color Scheme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Style */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.bannerGenerator.style', 'Style')}</label>
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

          {/* Color Scheme */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.bannerGenerator.colorScheme', 'Color Scheme')}</label>
            <select
              value={colorScheme.label}
              onChange={(e) => {
                const scheme = colorSchemes.find((c) => c.label === e.target.value);
                if (scheme) setColorScheme(scheme);
              }}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {colorSchemes.map((scheme) => (
                <option key={scheme.label} value={scheme.label}>
                  {scheme.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Colors (shown when Custom is selected) */}
        {colorScheme.label === 'Custom' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.bannerGenerator.customColors', 'Custom Colors')}
            </label>
            <input
              type="text"
              value={customColors}
              onChange={(e) => setCustomColors(e.target.value)}
              placeholder={t('tools.bannerGenerator.eGNavyBlueAnd', 'e.g., navy blue and gold, #1E40AF, emerald green')}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-xl text-red-600 text-sm`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !mainText.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.bannerGenerator.generating', 'Generating...')}
            </>
          ) : (
            <>
              <LayoutTemplate className="w-5 h-5" />
              {t('tools.bannerGenerator.generateBanner', 'Generate Banner')}
            </>
          )}
        </button>

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <LayoutTemplate className="w-4 h-4" />
                {t('tools.bannerGenerator.generatedBanners', 'Generated Banners')}
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.bannerGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.bannerGenerator.saving', 'Saving...')}
                  </span>
                )}
              </div>
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
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(img.url, img.bannerType, index)}
                      className="p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                      title={t('tools.bannerGenerator.download', 'Download')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSave(img.url, img.prompt, img.bannerType)}
                      disabled={isSaving}
                      className="p-3 bg-[#0D9488] rounded-full text-white hover:bg-[#0D9488]/90 transition-colors disabled:opacity-50"
                      title={t('tools.bannerGenerator.saveToGallery', 'Save to Gallery')}
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                    <p className="text-white text-xs font-medium">{img.bannerType}</p>
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
            <LayoutTemplate className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.bannerGenerator.yourGeneratedBannersWillAppear', 'Your generated banners will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerGeneratorTool;
