import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sticker, Loader2, Download, RefreshCw, Grid3X3, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface StickerGeneratorToolProps {
  uiConfig?: UIConfig;
}

const stickerStyles = [
  { value: 'kawaii', label: 'Kawaii/Cute' },
  { value: 'emoji', label: 'Emoji Style' },
  { value: 'flat', label: 'Flat Design' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'chibi', label: 'Chibi/Anime' },
  { value: 'doodle', label: 'Hand-drawn Doodle' },
  { value: '3d', label: '3D Render' },
  { value: 'pixel', label: 'Pixel Art' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'vintage', label: 'Vintage/Retro' },
];

const stickerCategories = [
  { value: 'emotions', label: 'Emotions/Reactions' },
  { value: 'animals', label: 'Animals' },
  { value: 'food', label: 'Food & Drinks' },
  { value: 'objects', label: 'Objects' },
  { value: 'nature', label: 'Nature' },
  { value: 'characters', label: 'Characters/People' },
  { value: 'text', label: 'Text/Words' },
  { value: 'holidays', label: 'Holidays & Events' },
  { value: 'custom', label: 'Custom' },
];

export const StickerGeneratorTool: React.FC<StickerGeneratorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [style, setStyle] = useState('kawaii');
  const [category, setCategory] = useState('emotions');
  const [concept, setConcept] = useState('');
  const [expression, setExpression] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sticker, setSticker] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.style) {
          setStyle(params.style);
          hasPrefill = true;
        }
        if (params.category) {
          setCategory(params.category);
          hasPrefill = true;
        }
        if (params.concept) {
          setConcept(params.concept);
          hasPrefill = true;
        }
        if (params.expression) {
          setExpression(params.expression);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setSticker(params.imageUrl);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        if (params.text || params.content) {
          setConcept(params.text || params.content || '');
          hasPrefill = true;
        }
        if (params.formData) {
          if (params.formData.style) setStyle(params.formData.style);
          if (params.formData.category) setCategory(params.formData.category);
          if (params.formData.expression) setExpression(params.formData.expression);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleSave = async () => {
    if (!sticker) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: sticker,
        title: `Sticker: ${stickerStyles.find(s => s.value === style)?.label || style}`,
        prompt: concept,
        metadata: {
          toolId: 'sticker-generator',
          style: style,
          category: category,
          concept: concept,
          expression: expression,
          imageUrl: sticker,
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
    if (category === 'custom' && !concept.trim()) {
      setError('Please describe your sticker');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const styleLabel = stickerStyles.find(s => s.value === style)?.label;
      const categoryLabel = stickerCategories.find(c => c.value === category)?.label;

      const prompt = `Create a ${styleLabel} sticker design. ${category === 'custom' ? concept : `Category: ${categoryLabel}. ${concept ? `Concept: ${concept}` : ''}`} ${expression ? `Expression/Emotion: ${expression}.` : ''} The design should be:
- Suitable for messaging apps and social media
- Clean with transparent/white background
- Bold outlines for visibility at small sizes
- Expressive and eye-catching
- Single, centered subject
- No text unless specified
Style: ${styleLabel} sticker art, vibrant colors, cute and appealing.`;

      const response = await api.post('/ai/image/generate', {
        prompt,
        style: 'sticker',
        aspectRatio: '1:1',
      });

      if (response.success && response.data?.url) {
        setSticker(response.data.url);
      } else {
        setError(response.error || 'Failed to generate sticker');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!sticker) return;

    try {
      const response = await fetch(sticker);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sticker-${style}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-pink-900/20' : 'from-white to-pink-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Sticker className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.stickerGenerator.stickerGenerator', 'Sticker Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.stickerGenerator.createCuteStickersForMessaging', 'Create cute stickers for messaging apps')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{isEditFromGallery ? t('tools.stickerGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.stickerGenerator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.stickerGenerator.stickerStyle', 'Sticker Style')}</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {stickerStyles.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.stickerGenerator.category', 'Category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {stickerCategories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {category === 'custom' ? t('tools.stickerGenerator.stickerDescription', 'Sticker Description *') : t('tools.stickerGenerator.specificConceptOptional', 'Specific Concept (Optional)')}
          </label>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder={category === 'custom' ? t('tools.stickerGenerator.describeYourStickerIdea', 'Describe your sticker idea...') : t('tools.stickerGenerator.eGHappyCatPizza', 'e.g., happy cat, pizza slice, birthday cake')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.stickerGenerator.expressionEmotionOptional', 'Expression/Emotion (Optional)')}</label>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder={t('tools.stickerGenerator.eGLaughingSurprisedWinking', 'e.g., laughing, surprised, winking, sleepy, angry')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sticker className="w-5 h-5" />}
          {isGenerating ? t('tools.stickerGenerator.creatingSticker', 'Creating Sticker...') : t('tools.stickerGenerator.generateSticker', 'Generate Sticker')}
        </button>

        {sticker && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Grid3X3 className="w-4 h-4" /> Your Sticker
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.stickerGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.stickerGenerator.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.stickerGenerator.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  {t('tools.stickerGenerator.download', 'Download')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.stickerGenerator.save', 'Save')}
                </button>
              </div>
            </div>
            <div className={`p-8 border ${theme === 'dark' ? 'border-gray-600 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} rounded-xl flex items-center justify-center`}>
              <img
                src={sticker}
                alt="Generated sticker"
                className="max-w-[200px] h-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerGeneratorTool;
