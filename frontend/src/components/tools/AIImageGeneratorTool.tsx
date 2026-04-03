import React, { useState, useEffect, useRef } from 'react';
import { Image, Wand2, Download, Loader2, Sparkles, Settings2, Save, CheckCircle } from 'lucide-react';
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

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}

const aspectRatios = [
  { label: 'Square (1:1)', width: 1024, height: 1024 },
  { label: 'Landscape (16:9)', width: 1024, height: 576 },
  { label: 'Portrait (9:16)', width: 576, height: 1024 },
  { label: 'Wide (21:9)', width: 1024, height: 440 },
];

const stylePresets = [
  { label: 'None', value: '' },
  { label: 'Photorealistic', value: 'photorealistic, highly detailed, 8k, professional photography' },
  { label: 'Digital Art', value: 'digital art, vibrant colors, trending on artstation' },
  { label: 'Anime', value: 'anime style, studio ghibli, beautiful anime art' },
  { label: 'Oil Painting', value: 'oil painting, classical art, museum quality' },
  { label: 'Watercolor', value: 'watercolor painting, soft colors, artistic' },
  { label: '3D Render', value: '3d render, octane render, cinema 4d, high quality' },
  { label: 'Minimalist', value: 'minimalist, clean design, simple, elegant' },
];

const COLUMNS: ColumnConfig[] = [
  { key: 'prompt', header: 'Prompt' },
  { key: 'url', header: 'Image URL' },
  { key: 'timestamp', header: 'Generated At', type: 'date' },
];

interface AIImageGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const AIImageGeneratorTool: React.FC<AIImageGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedAspect, setSelectedAspect] = useState(aspectRatios[0]);
  const [selectedStyle, setSelectedStyle] = useState(stylePresets[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [numberResults, setNumberResults] = useState(1);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const generatedSectionRef = useRef<HTMLDivElement>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.prompt) {
          setPrompt(params.prompt);
          hasPrefill = true;
        }
        if (params.negativePrompt) {
          setNegativePrompt(params.negativePrompt);
          hasPrefill = true;
        }
        if (params.style) {
          const style = stylePresets.find(s => s.label === params.style);
          if (style) setSelectedStyle(style);
          hasPrefill = true;
        }
        if (params.aspectRatio) {
          const aspect = aspectRatios.find(a => a.label === params.aspectRatio);
          if (aspect) setSelectedAspect(aspect);
          hasPrefill = true;
        }
        if (params.numberResults) {
          setNumberResults(params.numberResults);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setGeneratedImages([{
            url: params.imageUrl,
            prompt: params.prompt || '',
            timestamp: new Date(),
          }]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.content) {
          setPrompt(params.text || params.content || '');
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const fullPrompt = selectedStyle.value
        ? `${prompt}, ${selectedStyle.value}`
        : prompt;

      const params: ImageGenerationParams = {
        prompt: fullPrompt,
        width: selectedAspect.width,
        height: selectedAspect.height,
        numberResults,
        negativePrompt: negativePrompt || 'blurry, bad quality, distorted, ugly, deformed',
      };

      const result = await imagitarApi.generateImage(params);

      if (result.success && result.data?.images) {
        const newImages = result.data.images.map((img) => ({
          url: img.url,
          prompt: fullPrompt,
          timestamp: new Date(),
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

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ai-generated-${Date.now()}-${index}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(generatedImages, COLUMNS, { filename: 'ai-images' });
  };

  const handleExportExcel = () => {
    exportToExcel(generatedImages, COLUMNS, { filename: 'ai-images' });
  };

  const handleExportJSON = () => {
    exportToJSON(generatedImages, { filename: 'ai-images' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(generatedImages, COLUMNS, {
      filename: 'ai-images',
      title: 'AI Generated Images',
      subtitle: 'Export of generated images and prompts',
    });
  };

  const handlePrint = () => {
    printData(generatedImages, COLUMNS, { title: 'AI Generated Images' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(generatedImages, COLUMNS, 'tab');
  };

  const handleSave = async (imageUrl: string, imagePrompt: string) => {
    if (!imageUrl) return;

    setIsSaving(true);
    try {
      // Save to content library for Gallery view
      await api.post('/content', {
        contentType: 'image',
        url: imageUrl,
        title: `AI Image: ${imagePrompt.slice(0, 50)}${imagePrompt.length > 50 ? '...' : ''}`,
        prompt: imagePrompt,
        metadata: {
          toolId: 'ai-image-generator',
          prompt: prompt,
          negativePrompt: negativePrompt,
          style: selectedStyle.label,
          aspectRatio: selectedAspect.label,
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
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('tools.aIImageGenerator.aiImageGenerator', 'AI Image Generator')}</h3>
            <p className="text-sm text-gray-500">{t('tools.aIImageGenerator.createStunningImagesWithAi', 'Create stunning images with AI')}</p>
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
            showImport={false}
          />
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.aIImageGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.aIImageGenerator.promptLoadedFromYourInput', 'Prompt loaded from your input')}
            </span>
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('tools.aIImageGenerator.describeYourImage', 'Describe your image')}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('tools.aIImageGenerator.aSereneMountainLandscapeAt', 'A serene mountain landscape at sunset with a crystal clear lake...')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Style & Aspect Ratio Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Style Preset */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('tools.aIImageGenerator.style', 'Style')}</label>
            <select
              value={selectedStyle.label}
              onChange={(e) => {
                const style = stylePresets.find((s) => s.label === e.target.value);
                if (style) setSelectedStyle(style);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 bg-white"
            >
              {stylePresets.map((style) => (
                <option key={style.label} value={style.label}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('tools.aIImageGenerator.aspectRatio', 'Aspect Ratio')}</label>
            <select
              value={selectedAspect.label}
              onChange={(e) => {
                const aspect = aspectRatios.find((a) => a.label === e.target.value);
                if (aspect) setSelectedAspect(aspect);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 bg-white"
            >
              {aspectRatios.map((aspect) => (
                <option key={aspect.label} value={aspect.label}>
                  {aspect.label}
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
          {showAdvanced ? t('tools.aIImageGenerator.hide', 'Hide') : t('tools.aIImageGenerator.show', 'Show')} Advanced Settings
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            {/* Number of Results */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Number of Images: {numberResults}
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

            {/* Negative Prompt */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('tools.aIImageGenerator.negativePromptWhatToAvoid', 'Negative Prompt (what to avoid)')}
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder={t('tools.aIImageGenerator.blurryBadQualityDistorted', 'blurry, bad quality, distorted...')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 placeholder:text-gray-400"
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
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.aIImageGenerator.generating', 'Generating...')}
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              {t('tools.aIImageGenerator.generateImage', 'Generate Image')}
            </>
          )}
        </button>

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Image className="w-4 h-4" />
                {t('tools.aIImageGenerator.generatedImages', 'Generated Images')}
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.aIImageGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.aIImageGenerator.saving', 'Saving...')}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generatedImages.map((img, index) => (
                <div
                  key={`${img.timestamp.getTime()}-${index}`}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(img.url, index)}
                      className="p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                      title={t('tools.aIImageGenerator.download', 'Download')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSave(img.url, img.prompt)}
                      disabled={isSaving}
                      className="p-3 bg-[#0D9488] rounded-full text-white hover:bg-[#0D9488]/90 transition-colors disabled:opacity-50"
                      title={t('tools.aIImageGenerator.saveToGallery', 'Save to Gallery')}
                    >
                      <Save className="w-5 h-5" />
                    </button>
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
          <div className="text-center py-8 text-gray-500">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIImageGenerator.yourGeneratedImagesWillAppear', 'Your generated images will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIImageGeneratorTool;
