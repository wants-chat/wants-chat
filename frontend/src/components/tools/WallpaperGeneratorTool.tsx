import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, Loader2, Download, RefreshCw, Smartphone, Tablet, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const wallpaperTypes = [
  { value: 'abstract', label: 'Abstract Art' },
  { value: 'nature', label: 'Nature/Landscape' },
  { value: 'space', label: 'Space/Galaxy' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'geometric', label: 'Geometric Patterns' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'cityscape', label: 'Cityscape' },
  { value: 'fantasy', label: 'Fantasy/Surreal' },
  { value: 'anime', label: 'Anime Style' },
  { value: 'retro', label: 'Retro/Vintage' },
  { value: '3d', label: '3D Render' },
];

const resolutions = [
  { value: 'desktop', label: 'Desktop (1920x1080)', icon: Monitor, ratio: '16:9' },
  { value: 'desktop-4k', label: 'Desktop 4K (3840x2160)', icon: Monitor, ratio: '16:9' },
  { value: 'ultrawide', label: 'Ultrawide (3440x1440)', icon: Monitor, ratio: '21:9' },
  { value: 'phone', label: 'Phone (1080x1920)', icon: Smartphone, ratio: '9:16' },
  { value: 'tablet', label: 'Tablet (2048x2732)', icon: Tablet, ratio: '3:4' },
];

const moods = [
  { value: 'calming', label: 'Calming & Peaceful' },
  { value: 'energetic', label: 'Energetic & Vibrant' },
  { value: 'dark', label: 'Dark & Moody' },
  { value: 'colorful', label: 'Colorful & Playful' },
  { value: 'professional', label: 'Clean & Professional' },
  { value: 'dreamy', label: 'Dreamy & Soft' },
];

interface WallpaperGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const WallpaperGeneratorTool: React.FC<WallpaperGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [wallpaperType, setWallpaperType] = useState('abstract');
  const [resolution, setResolution] = useState('desktop');
  const [mood, setMood] = useState('calming');
  const [customPrompt, setCustomPrompt] = useState('');
  const [colors, setColors] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.wallpaperType) {
          setWallpaperType(params.wallpaperType);
          hasPrefill = true;
        }
        if (params.resolution) {
          setResolution(params.resolution);
          hasPrefill = true;
        }
        if (params.mood) {
          setMood(params.mood);
          hasPrefill = true;
        }
        if (params.customPrompt) {
          setCustomPrompt(params.customPrompt);
          hasPrefill = true;
        }
        if (params.colors) {
          setColors(params.colors);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setWallpaper(params.imageUrl);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        if (params.text || params.content) {
          setCustomPrompt(params.text || params.content || '');
          hasPrefill = true;
        }
        if (params.colors && Array.isArray(params.colors) && params.colors.length > 0) {
          setColors(params.colors.join(', '));
          hasPrefill = true;
        }
        if (params.formData) {
          if (params.formData.wallpaperType) setWallpaperType(params.formData.wallpaperType);
          if (params.formData.resolution) setResolution(params.formData.resolution);
          if (params.formData.mood) setMood(params.formData.mood);
          if (params.formData.customPrompt) setCustomPrompt(params.formData.customPrompt);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleSave = async () => {
    if (!wallpaper) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: wallpaper,
        title: `Wallpaper: ${wallpaperTypes.find(t => t.value === wallpaperType)?.label || wallpaperType}`,
        prompt: customPrompt || wallpaperType,
        metadata: {
          toolId: 'wallpaper-generator',
          wallpaperType: wallpaperType,
          resolution: resolution,
          mood: mood,
          customPrompt: customPrompt,
          colors: colors,
          imageUrl: wallpaper,
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
    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = wallpaperTypes.find(t => t.value === wallpaperType)?.label;
      const moodLabel = moods.find(m => m.value === mood)?.label;
      const resolutionData = resolutions.find(r => r.value === resolution);

      const prompt = `Create a stunning ${typeLabel} wallpaper. ${customPrompt || ''} Mood: ${moodLabel}. ${colors ? `Color palette: ${colors}.` : ''} The image should be high quality, visually striking, and perfect for a ${resolution.includes('phone') ? 'mobile phone' : resolution.includes('tablet') ? 'tablet' : 'desktop'} wallpaper. Clean composition with no text or watermarks. Aspect ratio: ${resolutionData?.ratio}.`;

      const response = await api.post('/ai/image/generate', {
        prompt,
        style: wallpaperType === 'anime' ? 'anime' : 'photo',
        aspectRatio: resolutionData?.ratio || '16:9',
      });

      if (response.success && response.data?.url) {
        setWallpaper(response.data.url);
      } else {
        setError(response.error || 'Failed to generate wallpaper');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!wallpaper) return;

    try {
      const response = await fetch(wallpaper);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallpaper-${wallpaperType}-${resolution}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const ResolutionIcon = resolutions.find(r => r.value === resolution)?.icon || Monitor;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-purple-900/20' : 'from-white to-purple-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Monitor className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.wallpaperGenerator.wallpaperGenerator', 'Wallpaper Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wallpaperGenerator.createStunningWallpapersForAny', 'Create stunning wallpapers for any device')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{isEditFromGallery ? t('tools.wallpaperGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.wallpaperGenerator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.wallpaperGenerator.style', 'Style')}</label>
            <select
              value={wallpaperType}
              onChange={(e) => setWallpaperType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {wallpaperTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <ResolutionIcon className="w-4 h-4 inline mr-1" /> Resolution
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {resolutions.map((res) => (
                <option key={res.value} value={res.value}>{res.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.wallpaperGenerator.mood', 'Mood')}</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          >
            {moods.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.wallpaperGenerator.customDescriptionOptional', 'Custom Description (Optional)')}</label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={t('tools.wallpaperGenerator.describeSpecificElementsYouWant', 'Describe specific elements you want in your wallpaper...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.wallpaperGenerator.colorPaletteOptional', 'Color Palette (Optional)')}</label>
          <input
            type="text"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder={t('tools.wallpaperGenerator.eGBlueAndPurple', 'e.g., blue and purple, sunset colors, monochrome')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Monitor className="w-5 h-5" />}
          {isGenerating ? t('tools.wallpaperGenerator.creatingWallpaper', 'Creating Wallpaper...') : t('tools.wallpaperGenerator.generateWallpaper', 'Generate Wallpaper')}
        </button>

        {wallpaper && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.wallpaperGenerator.yourWallpaper', 'Your Wallpaper')}</h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.wallpaperGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.wallpaperGenerator.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.wallpaperGenerator.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  {t('tools.wallpaperGenerator.download', 'Download')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.wallpaperGenerator.save', 'Save')}
                </button>
              </div>
            </div>
            <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} rounded-xl overflow-hidden`}>
              <img src={wallpaper} alt="Generated wallpaper" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WallpaperGeneratorTool;
