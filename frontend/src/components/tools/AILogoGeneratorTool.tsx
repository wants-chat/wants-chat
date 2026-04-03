import React, { useState, useEffect, useRef } from 'react';
import { Hexagon, Wand2, Download, Loader2, Sparkles, Settings2, Save, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { imagitarApi, ImageGenerationParams } from '../../lib/imagitarApi';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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

interface GeneratedLogo {
  url: string;
  prompt: string;
  timestamp: Date;
}

const logoStyles = [
  { label: 'Modern Minimal', value: 'modern minimalist logo, clean lines, simple geometric shapes, professional' },
  { label: 'Vintage Badge', value: 'vintage badge logo, retro style, emblem design, classic typography' },
  { label: 'Abstract', value: 'abstract logo design, creative shapes, artistic, unique concept' },
  { label: 'Mascot', value: 'mascot logo, character design, friendly, memorable' },
  { label: 'Lettermark', value: 'lettermark logo, typography based, elegant letters, monogram style' },
  { label: 'Emblem', value: 'emblem logo, shield design, crest style, authoritative' },
  { label: 'Gradient', value: 'gradient logo, colorful, modern gradient colors, vibrant' },
  { label: '3D Style', value: '3d logo design, dimensional, depth effect, modern 3d' },
];

const colorSchemes = [
  { label: 'Auto (AI Suggested)', value: '' },
  { label: 'Blue Professional', value: 'blue color scheme, professional, corporate' },
  { label: 'Green Nature', value: 'green color scheme, nature inspired, eco-friendly' },
  { label: 'Red Bold', value: 'red color scheme, bold, energetic, passionate' },
  { label: 'Purple Creative', value: 'purple color scheme, creative, innovative, luxury' },
  { label: 'Orange Energetic', value: 'orange color scheme, energetic, warm, friendly' },
  { label: 'Monochrome', value: 'black and white, monochrome, elegant, timeless' },
  { label: 'Gold Premium', value: 'gold color scheme, premium, luxury, high-end' },
];

const COLUMNS: ColumnConfig[] = [
  { key: 'index', header: 'Index', type: 'number' },
  { key: 'prompt', header: 'Prompt' },
  { key: 'timestamp', header: 'Generated', type: 'date' },
  { key: 'url', header: 'Image URL' },
];

interface AILogoGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const AILogoGeneratorTool: React.FC<AILogoGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(logoStyles[0]);
  const [selectedColor, setSelectedColor] = useState(colorSchemes[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [numberResults, setNumberResults] = useState(2);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const generatedSectionRef = useRef<HTMLDivElement>(null);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.brandName) {
          setBrandName(params.brandName);
          hasPrefill = true;
        }
        if (params.brandDescription) {
          setBrandDescription(params.brandDescription);
          hasPrefill = true;
        }
        if (params.style) {
          const style = logoStyles.find(s => s.label === params.style);
          if (style) setSelectedStyle(style);
          hasPrefill = true;
        }
        if (params.colorScheme) {
          const color = colorSchemes.find(c => c.label === params.colorScheme);
          if (color) setSelectedColor(color);
          hasPrefill = true;
        }
        if (params.numberResults) {
          setNumberResults(params.numberResults);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setGeneratedLogos([{
            url: params.imageUrl,
            prompt: params.brandName || '',
            timestamp: new Date(),
          }]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic
        if (params.content) {
          setBrandName(params.content);
          hasPrefill = true;
        }
        if (params.text) {
          setBrandDescription(params.text);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!brandName.trim()) {
      setError('Please enter a brand name');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const promptParts = [
        `Logo design for "${brandName}"`,
        brandDescription && `Description: ${brandDescription}`,
        selectedStyle.value,
        selectedColor.value,
        'vector style, scalable, transparent background, centered composition, high quality logo',
      ].filter(Boolean);

      const fullPrompt = promptParts.join(', ');

      const params: ImageGenerationParams = {
        prompt: fullPrompt,
        width: 512,
        height: 512,
        numberResults,
        negativePrompt: 'blurry, low quality, distorted, text artifacts, watermark, complex background',
      };

      const result = await imagitarApi.generateLogo(params);

      if (result.success && result.data?.images) {
        const newLogos = result.data.images.map((img) => ({
          url: img.url,
          prompt: fullPrompt,
          timestamp: new Date(),
        }));
        setGeneratedLogos((prev) => [...newLogos, ...prev]);
        setTimeout(() => {
          generatedSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else {
        setError(result.error || 'Failed to generate logo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${brandName.replace(/\s+/g, '-').toLowerCase()}-logo-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Prepare data for export with index
  const getExportData = () => {
    return generatedLogos.map((logo, idx) => ({
      index: idx + 1,
      prompt: logo.prompt,
      timestamp: logo.timestamp,
      url: logo.url,
    }));
  };

  const handleExportCSV = () => {
    const data = getExportData();
    exportToCSV(data, COLUMNS, { filename: `logos-${brandName}` });
  };

  const handleExportExcel = () => {
    const data = getExportData();
    exportToExcel(data, COLUMNS, { filename: `logos-${brandName}` });
  };

  const handleExportJSON = () => {
    const data = getExportData();
    exportToJSON(data, { filename: `logos-${brandName}` });
  };

  const handleExportPDF = async () => {
    const data = getExportData();
    await exportToPDF(data, COLUMNS, {
      filename: `logos-${brandName}`,
      title: `AI Generated Logos - ${brandName}`,
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    });
  };

  const handleCopyToClipboard = async () => {
    const data = getExportData();
    return await copyUtil(data, COLUMNS, 'json');
  };

  const handlePrint = () => {
    const data = getExportData();
    printData(data, COLUMNS, { title: `AI Generated Logos - ${brandName}` });
  };

  const handleSave = async (imageUrl: string, imagePrompt: string) => {
    if (!imageUrl) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: imageUrl,
        title: `Logo: ${brandName}`,
        prompt: imagePrompt,
        metadata: {
          toolId: 'ai-logo-generator',
          brandName: brandName,
          brandDescription: brandDescription,
          style: selectedStyle.label,
          colorScheme: selectedColor.label,
          numberResults: numberResults,
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Hexagon className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('tools.aILogoGenerator.aiLogoGenerator', 'AI Logo Generator')}</h3>
              <p className="text-sm text-gray-500">{t('tools.aILogoGenerator.createProfessionalLogosWithAi', 'Create professional logos with AI')}</p>
            </div>
          </div>
          {generatedLogos.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onCopyToClipboard={handleCopyToClipboard}
              onPrint={handlePrint}
              showImport={false}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.aILogoGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.aILogoGenerator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}
            </span>
          </div>
        )}

        {/* Brand Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('tools.aILogoGenerator.brandName', 'Brand Name *')}
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder={t('tools.aILogoGenerator.enterYourBrandOrCompany', 'Enter your brand or company name')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Brand Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('tools.aILogoGenerator.brandDescriptionOptional', 'Brand Description (optional)')}
          </label>
          <textarea
            value={brandDescription}
            onChange={(e) => setBrandDescription(e.target.value)}
            placeholder={t('tools.aILogoGenerator.describeYourBrandIndustryOr', 'Describe your brand, industry, or what makes it unique...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Style & Color Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Logo Style */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('tools.aILogoGenerator.logoStyle', 'Logo Style')}</label>
            <select
              value={selectedStyle.label}
              onChange={(e) => {
                const style = logoStyles.find((s) => s.label === e.target.value);
                if (style) setSelectedStyle(style);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 bg-white"
            >
              {logoStyles.map((style) => (
                <option key={style.label} value={style.label}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Scheme */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('tools.aILogoGenerator.colorScheme', 'Color Scheme')}</label>
            <select
              value={selectedColor.label}
              onChange={(e) => {
                const color = colorSchemes.find((c) => c.label === e.target.value);
                if (color) setSelectedColor(color);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 bg-white"
            >
              {colorSchemes.map((color) => (
                <option key={color.label} value={color.label}>
                  {color.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0D9488] transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          {showAdvanced ? t('tools.aILogoGenerator.hide', 'Hide') : t('tools.aILogoGenerator.show', 'Show')} Advanced Settings
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            {/* Number of Results */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Number of Variations: {numberResults}
              </label>
              <input
                type="range"
                min="1"
                max="4"
                value={numberResults}
                onChange={(e) => setNumberResults(Number(e.target.value))}
                className="w-full accent-[#0D9488]"
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !brandName.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.aILogoGenerator.generating', 'Generating...')}
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              {t('tools.aILogoGenerator.generateLogo', 'Generate Logo')}
            </>
          )}
        </button>

        {/* Generated Logos Gallery */}
        {generatedLogos.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('tools.aILogoGenerator.generatedLogos', 'Generated Logos')}
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.aILogoGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.aILogoGenerator.saving', 'Saving...')}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {generatedLogos.map((logo, index) => (
                <div
                  key={`${logo.timestamp.getTime()}-${index}`}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square"
                >
                  <img
                    src={logo.url}
                    alt={`Logo variation ${index + 1}`}
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(logo.url, index)}
                      className="p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                      title={t('tools.aILogoGenerator.download', 'Download')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSave(logo.url, logo.prompt)}
                      disabled={isSaving}
                      className="p-3 bg-[#0D9488] rounded-full text-white hover:bg-[#0D9488]/90 transition-colors disabled:opacity-50"
                      title={t('tools.aILogoGenerator.saveToGallery', 'Save to Gallery')}
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedLogos.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-gray-500">
            <Hexagon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aILogoGenerator.yourGeneratedLogosWillAppear', 'Your generated logos will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AILogoGeneratorTool;
