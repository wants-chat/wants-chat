import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2, Download, RefreshCw, Grid3X3, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const iconStyles = [
  { value: 'flat', label: 'Flat/Material Design' },
  { value: '3d', label: '3D/Realistic' },
  { value: 'outline', label: 'Outline/Line Art' },
  { value: 'glyph', label: 'Glyph/Solid' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'isometric', label: 'Isometric' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'cartoon', label: 'Cartoon/Playful' },
];

const iconSizes = [
  { value: '512', label: '512x512' },
  { value: '256', label: '256x256' },
  { value: '128', label: '128x128' },
  { value: '64', label: '64x64' },
];

const categories = [
  { value: 'app', label: 'App Icon' },
  { value: 'web', label: 'Website/Favicon' },
  { value: 'social', label: 'Social Media' },
  { value: 'business', label: 'Business/Corporate' },
  { value: 'game', label: 'Gaming' },
  { value: 'utility', label: 'Utility/Tool' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'education', label: 'Education' },
];

interface IconGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const IconGeneratorTool: React.FC<IconGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [concept, setConcept] = useState('');
  const [style, setStyle] = useState('flat');
  const [category, setCategory] = useState('app');
  const [size, setSize] = useState('512');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iconImage, setIconImage] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.concept) {
          setConcept(params.concept);
          hasPrefill = true;
        }
        if (params.style) {
          setStyle(params.style);
          hasPrefill = true;
        }
        if (params.category) {
          setCategory(params.category);
          hasPrefill = true;
        }
        if (params.size) {
          setSize(params.size);
          hasPrefill = true;
        }
        if (params.primaryColor) {
          setPrimaryColor(params.primaryColor);
          hasPrefill = true;
        }
        if (params.backgroundColor) {
          setBackgroundColor(params.backgroundColor);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setIconImage(params.imageUrl);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic
        if (params.text || params.content) {
          setConcept(params.text || params.content || '');
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!concept.trim()) {
      setError('Please describe your icon concept');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const styleText = iconStyles.find(s => s.value === style)?.label;
      const categoryText = categories.find(c => c.value === category)?.label;

      const prompt = `Professional ${styleText} icon for ${categoryText} with concept: ${concept}. Primary color: ${primaryColor}, background: ${backgroundColor}. The icon should be clean, recognizable, and work well at small sizes. Centered composition with appropriate padding. Modern, professional ${parseInt(size)}x${parseInt(size)} pixel icon design. No text, just visual elements.`;

      const response = await api.post('/ai/image/generate', {
        prompt,
        style: 'icon',
        aspectRatio: '1:1',
      });

      if (response.success && response.data?.url) {
        setIconImage(response.data.url);
      } else {
        setError(response.error || 'Failed to generate icon');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!iconImage) return;

    try {
      const response = await fetch(iconImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `icon-${concept.replace(/\s+/g, '-').toLowerCase()}-${size}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleSave = async () => {
    if (!iconImage) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: iconImage,
        title: `Icon: ${concept.slice(0, 50)}${concept.length > 50 ? '...' : ''}`,
        prompt: concept,
        metadata: {
          toolId: 'icon-generator',
          concept: concept,
          style: style,
          category: category,
          size: size,
          primaryColor: primaryColor,
          backgroundColor: backgroundColor,
          imageUrl: iconImage,
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
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-indigo-900/20' : 'from-white to-indigo-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.iconGenerator.aiIconGenerator', 'AI Icon Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.iconGenerator.createCustomIconsForApps', 'Create custom icons for apps and websites')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.iconGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.iconGenerator.conceptLoadedFromYourInput', 'Concept loaded from your input')}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.iconGenerator.iconConcept', 'Icon Concept *')}</label>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder={t('tools.iconGenerator.describeYourIconEG', 'Describe your icon (e.g., chat bubble, shopping cart, music note)')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.iconGenerator.iconStyle', 'Icon Style')}</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {iconStyles.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.iconGenerator.category', 'Category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.iconGenerator.size', 'Size')}</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {iconSizes.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.iconGenerator.primaryColor', 'Primary Color')}</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-10 rounded-lg border-0 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className={`flex-1 px-3 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-lg text-sm`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.iconGenerator.background', 'Background')}</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-10 rounded-lg border-0 cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className={`flex-1 px-3 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-lg text-sm`}
              />
            </div>
          </div>
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !concept.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isGenerating ? t('tools.iconGenerator.generatingIcon', 'Generating Icon...') : t('tools.iconGenerator.generateIcon', 'Generate Icon')}
        </button>

        {iconImage && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Grid3X3 className="w-4 h-4" /> Generated Icon
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.iconGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.iconGenerator.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.iconGenerator.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  {t('tools.iconGenerator.download', 'Download')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.iconGenerator.save', 'Save')}
                </button>
              </div>
            </div>
            <div className={`p-8 border ${theme === 'dark' ? 'border-gray-600 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} rounded-xl flex items-center justify-center`}>
              <div className="relative">
                <img
                  src={iconImage}
                  alt="Generated icon"
                  className="w-32 h-32 rounded-2xl shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <div
                    className="w-8 h-8 rounded-lg shadow border border-white/20"
                    style={{ backgroundImage: `url(${iconImage})`, backgroundSize: 'cover' }}
                  />
                  <div
                    className="w-6 h-6 rounded-md shadow border border-white/20"
                    style={{ backgroundImage: `url(${iconImage})`, backgroundSize: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconGeneratorTool;
