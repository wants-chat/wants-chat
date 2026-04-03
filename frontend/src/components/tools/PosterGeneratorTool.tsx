import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Download, Loader2, Calendar, MapPin, Sparkles, Save, CheckCircle } from 'lucide-react';
import { imagitarApi, ImageGenerationParams } from '../../lib/imagitarApi';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

interface GeneratedPoster {
  url: string;
  prompt: string;
  timestamp: Date;
}

const COLUMNS = [
  { key: 'headline', label: 'Headline' },
  { key: 'description', label: 'Description' },
  { key: 'date', label: 'Date' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Type' },
  { key: 'style', label: 'Style' },
  { key: 'size', label: 'Size' },
  { key: 'timestamp', label: 'Generated' },
];

const posterTypes = [
  { label: 'Event', value: 'event poster' },
  { label: 'Movie', value: 'movie poster, cinematic' },
  { label: 'Music', value: 'music concert poster, album art style' },
  { label: 'Motivational', value: 'motivational poster, inspirational quote' },
  { label: 'Promotional', value: 'promotional poster, advertisement style' },
];

const sizePresets = [
  { label: 'A4 Portrait', width: 794, height: 1123 },
  { label: 'A3 Portrait', width: 1123, height: 1587 },
  { label: 'Letter Portrait', width: 816, height: 1056 },
  { label: 'Social Media Square', width: 1080, height: 1080 },
  { label: 'Instagram Portrait', width: 1080, height: 1350 },
];

const posterStyles = [
  { label: 'Vintage', value: 'vintage style, retro, distressed textures, old paper effect' },
  { label: 'Modern', value: 'modern, contemporary, clean lines, bold typography' },
  { label: 'Minimalist', value: 'minimalist, simple, lots of negative space, elegant' },
  { label: 'Grunge', value: 'grunge style, edgy, rough textures, urban aesthetic' },
  { label: 'Elegant', value: 'elegant, sophisticated, premium feel, refined design' },
  { label: 'Neon', value: 'neon lights, cyberpunk aesthetic, vibrant glowing colors' },
];

interface PosterGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const PosterGeneratorTool: React.FC<PosterGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    date: '',
    location: '',
  });

  const [selectedType, setSelectedType] = useState(posterTypes[0]);
  const [selectedSize, setSelectedSize] = useState(sizePresets[0]);
  const [selectedStyle, setSelectedStyle] = useState(posterStyles[0]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPosters, setGeneratedPosters] = useState<GeneratedPoster[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.headline) {
      setError('Please enter a headline');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Build detailed prompt for AI
      const eventDetails = [];
      if (formData.date) eventDetails.push(`Date: ${formData.date}`);
      if (formData.location) eventDetails.push(`Location: ${formData.location}`);

      const prompt = `${selectedType.value}, ${selectedStyle.value}.
      Main headline text clearly visible: "${formData.headline}" (large, bold, eye-catching typography)
      ${formData.description ? `Subheading: "${formData.description}"` : ''}
      ${eventDetails.length > 0 ? `Event details: ${eventDetails.join(', ')}` : ''}
      Professional poster design, high quality, print-ready, striking visual composition,
      balanced layout, attention-grabbing, modern typography, 300 DPI quality,
      designed for ${selectedSize.label} format`;

      const params: ImageGenerationParams = {
        prompt,
        width: selectedSize.width,
        height: selectedSize.height,
        numberResults: 2,
        negativePrompt: 'blurry text, unreadable, low quality, cluttered, amateur, pixelated, distorted',
      };

      const result = await imagitarApi.generateImage(params);

      if (result.success && result.data?.images) {
        const newPosters = result.data.images.map((img) => ({
          url: img.url,
          prompt,
          timestamp: new Date(),
        }));
        setGeneratedPosters((prev) => [...newPosters, ...prev]);
      } else {
        setError(result.error || 'Failed to generate poster');
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
      a.download = `poster-${Date.now()}-${index}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleExportCSV = () => {
    const csvData = [
      COLUMNS.map((col) => col.label).join(','),
      ...generatedPosters.map((poster) =>
        COLUMNS.map((col) => {
          if (col.key === 'timestamp') {
            return poster.timestamp.toISOString();
          }
          if (col.key === 'type') {
            return selectedType.label;
          }
          if (col.key === 'style') {
            return selectedStyle.label;
          }
          if (col.key === 'size') {
            return selectedSize.label;
          }
          return formData[col.key as keyof typeof formData] || '';
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `posters-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalPosters: generatedPosters.length,
      },
      settings: {
        type: selectedType.label,
        style: selectedStyle.label,
        size: selectedSize.label,
      },
      formData,
      posters: generatedPosters.map((poster, index) => ({
        id: index,
        headline: formData.headline,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        url: poster.url,
        prompt: poster.prompt,
        timestamp: poster.timestamp.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `posters-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.formData) {
          setFormData(params.formData);
          hasPrefill = true;
        }
        if (params.selectedType) {
          const type = posterTypes.find(t => t.label === params.selectedType);
          if (type) setSelectedType(type);
          hasPrefill = true;
        }
        if (params.selectedSize) {
          const size = sizePresets.find(s => s.label === params.selectedSize);
          if (size) setSelectedSize(size);
          hasPrefill = true;
        }
        if (params.selectedStyle) {
          const style = posterStyles.find(s => s.label === params.selectedStyle);
          if (style) setSelectedStyle(style);
          hasPrefill = true;
        }
        // Restore generated posters if available
        if (params.imageUrl) {
          setGeneratedPosters([{
            url: params.imageUrl,
            prompt: params.prompt || '',
            timestamp: new Date(),
          }]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        const titleContent = params.title || params.text || '';
        const descContent = params.description || params.content || '';
        if (titleContent || descContent) {
          setFormData(prev => ({
            ...prev,
            headline: titleContent || prev.headline,
            description: descContent || prev.description,
          }));
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleSave = async (posterUrl: string, posterPrompt: string) => {
    if (!posterUrl) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: posterUrl,
        title: `Poster: ${formData.headline || 'Untitled'}`,
        prompt: posterPrompt,
        metadata: {
          toolId: 'poster-generator',
          formData: formData,
          selectedType: selectedType.label,
          selectedSize: selectedSize.label,
          selectedStyle: selectedStyle.label,
          imageUrl: posterUrl,
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
      <div className={`bg-gradient-to-r ${isDark ? t('tools.posterGenerator.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.posterGenerator.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Image className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.posterGenerator.aiPosterGenerator', 'AI Poster Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.posterGenerator.createEyeCatchingPostersWith', 'Create eye-catching posters with AI')}</p>
            </div>
          </div>
          {generatedPosters.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Poster Type & Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.posterGenerator.posterType', 'Poster Type')}
            </label>
            <select
              value={selectedType.label}
              onChange={(e) => {
                const type = posterTypes.find((t) => t.label === e.target.value);
                if (type) setSelectedType(type);
              }}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {posterTypes.map((type) => (
                <option key={type.label} value={type.label}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.posterGenerator.sizePreset', 'Size Preset')}
            </label>
            <select
              value={selectedSize.label}
              onChange={(e) => {
                const size = sizePresets.find((s) => s.label === e.target.value);
                if (size) setSelectedSize(size);
              }}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {sizePresets.map((size) => (
                <option key={size.label} value={size.label}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Headline */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.posterGenerator.mainHeadline', 'Main Headline *')}
          </label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => handleInputChange('headline', e.target.value)}
            placeholder={t('tools.posterGenerator.summerMusicFestival', 'SUMMER MUSIC FESTIVAL')}
            className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-lg font-semibold`}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.posterGenerator.eventDetailsDescription', 'Event Details / Description')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('tools.posterGenerator.joinUsForThreeDays', 'Join us for three days of incredible live music...')}
            rows={3}
            className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Date & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.posterGenerator.dateIfApplicable', 'Date (if applicable)')}
            </label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              placeholder={t('tools.posterGenerator.july15172024', 'July 15-17, 2024')}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-1" />
              {t('tools.posterGenerator.locationIfApplicable', 'Location (if applicable)')}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={t('tools.posterGenerator.centralParkNyc', 'Central Park, NYC')}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>
        </div>

        {/* Poster Style */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.posterGenerator.posterStyle', 'Poster Style')}
          </label>
          <select
            value={selectedStyle.label}
            onChange={(e) => {
              const style = posterStyles.find((s) => s.label === e.target.value);
              if (style) setSelectedStyle(style);
            }}
            className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          >
            {posterStyles.map((style) => (
              <option key={style.label} value={style.label}>
                {style.label}
              </option>
            ))}
          </select>
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
          disabled={isGenerating || !formData.headline}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.posterGenerator.generatingPoster', 'Generating Poster...')}
            </>
          ) : (
            <>
              <Image className="w-5 h-5" />
              {t('tools.posterGenerator.generatePoster', 'Generate Poster')}
            </>
          )}
        </button>

        {/* Generated Posters Gallery */}
        {generatedPosters.length > 0 && (
          <div className="space-y-4">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Image className="w-4 h-4" />
              {t('tools.posterGenerator.generatedPosters', 'Generated Posters')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedPosters.map((poster, index) => (
                <div
                  key={`${poster.timestamp.getTime()}-${index}`}
                  className={`group relative rounded-xl overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                >
                  <img
                    src={poster.url}
                    alt="Poster design"
                    className="w-full aspect-[0.707] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(poster.url, index)}
                      className="p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                      title={t('tools.posterGenerator.download', 'Download')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSave(poster.url, poster.prompt)}
                      disabled={isSaving}
                      className="p-3 bg-[#0D9488] rounded-full text-white hover:bg-[#0D9488]/90 transition-colors disabled:opacity-50"
                      title={t('tools.posterGenerator.saveToGallery', 'Save to Gallery')}
                    >
                      {saveSuccess ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs line-clamp-2">{formData.headline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedPosters.length === 0 && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.posterGenerator.yourGeneratedPostersWillAppear', 'Your generated posters will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PosterGeneratorTool;
