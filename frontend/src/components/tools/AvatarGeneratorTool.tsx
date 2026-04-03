import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCircle, Download, Loader2, Sparkles, Save, CheckCircle } from 'lucide-react';
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
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}

const avatarStyles = [
  { label: 'Realistic', value: 'photorealistic portrait, professional headshot, high quality' },
  { label: 'Cartoon', value: 'cartoon style, animated character, colorful' },
  { label: 'Anime', value: 'anime style, manga character, detailed anime art' },
  { label: '3D', value: '3D render, stylized 3D character, smooth rendering' },
  { label: 'Pixel Art', value: 'pixel art style, retro gaming, 8-bit character' },
  { label: 'Artistic', value: 'artistic portrait, painted style, expressive' },
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Neutral', value: 'gender neutral' },
];

const backgroundStyles = [
  { label: 'Solid Color', value: 'solid color background, simple' },
  { label: 'Gradient', value: 'gradient background, smooth color transition' },
  { label: 'Transparent', value: 'transparent background, isolated subject' },
  { label: 'Themed', value: 'themed background, contextual setting' },
];

const expressions = [
  { label: 'Happy', value: 'happy expression, smiling, cheerful' },
  { label: 'Professional', value: 'professional expression, confident, serious' },
  { label: 'Mysterious', value: 'mysterious expression, enigmatic, intriguing' },
  { label: 'Friendly', value: 'friendly expression, warm, approachable' },
];

interface AvatarGeneratorToolProps {
  uiConfig?: UIConfig;
}

// Define columns for export
const COLUMNS: ColumnConfig[] = [
  { key: 'prompt', header: 'Prompt' },
  { key: 'timestamp', header: 'Generated At', type: 'date' },
  { key: 'url', header: 'Image URL' },
];

const AvatarGeneratorTool: React.FC<AvatarGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [avatarStyle, setAvatarStyle] = useState(avatarStyles[0]);
  const [gender, setGender] = useState(genderOptions[0]);
  const [features, setFeatures] = useState('');
  const [background, setBackground] = useState(backgroundStyles[0]);
  const [expression, setExpression] = useState(expressions[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generatedSectionRef = useRef<HTMLDivElement>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.features) {
          setFeatures(params.features);
          hasPrefill = true;
        }
        if (params.avatarStyle) {
          const style = avatarStyles.find(s => s.label === params.avatarStyle);
          if (style) setAvatarStyle(style);
          hasPrefill = true;
        }
        if (params.gender) {
          const g = genderOptions.find(opt => opt.label === params.gender);
          if (g) setGender(g);
          hasPrefill = true;
        }
        if (params.expression) {
          const expr = expressions.find(e => e.label === params.expression);
          if (expr) setExpression(expr);
          hasPrefill = true;
        }
        if (params.background) {
          const bg = backgroundStyles.find(b => b.label === params.background);
          if (bg) setBackground(bg);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setGeneratedImages([{
            url: params.imageUrl,
            prompt: params.features || '',
            timestamp: new Date(),
          }]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic
        if (params.features) {
          setFeatures(params.features);
          hasPrefill = true;
        }
        if (params.style) {
          const style = avatarStyles.find(s => s.label.toLowerCase() === params.style?.toLowerCase());
          if (style) setAvatarStyle(style);
          hasPrefill = true;
        }
        if (params.gender) {
          const g = genderOptions.find(opt => opt.label.toLowerCase() === params.gender?.toLowerCase());
          if (g) setGender(g);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!features.trim()) {
      setError('Please describe the avatar features');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let fullPrompt = `${gender.value} avatar, ${features}`;

      // Add style
      if (avatarStyle.value) {
        fullPrompt += `, ${avatarStyle.value}`;
      }

      // Add expression
      if (expression.value) {
        fullPrompt += `, ${expression.value}`;
      }

      // Add background
      if (background.value) {
        fullPrompt += `, ${background.value}`;
      }

      // Add quality modifiers
      fullPrompt += `, centered portrait, profile picture optimized, high quality`;

      const params: ImageGenerationParams = {
        prompt: fullPrompt,
        width: 1024,
        height: 1024,
        numberResults: 1,
        negativePrompt: 'blurry, low quality, distorted, multiple people, cropped face, bad anatomy, deformed',
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
        setError(result.error || 'Failed to generate avatar');
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
      a.download = `avatar-${Date.now()}-${index}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(generatedImages, COLUMNS, { filename: 'avatars' });
  };

  const handleExportExcel = () => {
    exportToExcel(generatedImages, COLUMNS, { filename: 'avatars' });
  };

  const handleExportJSON = () => {
    exportToJSON(generatedImages, { filename: 'avatars' });
  };

  const handleCopyToClipboard = async () => {
    return copyUtil(generatedImages, COLUMNS, 'tab');
  };

  const handlePrint = () => {
    printData(generatedImages, COLUMNS, { title: 'Generated Avatars' });
  };

  const handleSave = async (imageUrl: string, imagePrompt: string) => {
    if (!imageUrl) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: imageUrl,
        title: `Avatar: ${features.slice(0, 50)}${features.length > 50 ? '...' : ''}`,
        prompt: imagePrompt,
        metadata: {
          toolId: 'avatar-generator',
          features: features,
          avatarStyle: avatarStyle.label,
          gender: gender.label,
          expression: expression.label,
          background: background.label,
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
      <div className={`bg-gradient-to-r ${isDark ? t('tools.avatarGenerator.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.avatarGenerator.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <UserCircle className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.avatarGenerator.avatarGenerator', 'Avatar Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.avatarGenerator.createUniqueAiPoweredAvatars', 'Create unique AI-powered avatars and profile pictures')}</p>
            </div>
          </div>
          {generatedImages.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onCopyToClipboard={handleCopyToClipboard}
              onPrint={handlePrint}
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
                ? t('tools.avatarGenerator.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.avatarGenerator.fieldsHaveBeenPrefilledFrom', 'Fields have been prefilled from AI suggestions')}
            </span>
          </div>
        )}

        {/* Avatar Style & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Avatar Style */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.avatarGenerator.avatarStyle', 'Avatar Style')}
            </label>
            <select
              value={avatarStyle.label}
              onChange={(e) => {
                const style = avatarStyles.find((s) => s.label === e.target.value);
                if (style) setAvatarStyle(style);
              }}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {avatarStyles.map((style) => (
                <option key={style.label} value={style.label}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.avatarGenerator.gender', 'Gender')}</label>
            <select
              value={gender.label}
              onChange={(e) => {
                const g = genderOptions.find((opt) => opt.label === e.target.value);
                if (g) setGender(g);
              }}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {genderOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Features Description */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.avatarGenerator.featuresDescription', 'Features Description')}
          </label>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder={t('tools.avatarGenerator.describeFeaturesEGBlonde', 'Describe features (e.g., blonde hair, blue eyes, wearing glasses, casual outfit)')}
            rows={3}
            className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Expression & Background */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expression */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.avatarGenerator.expression', 'Expression')}</label>
            <select
              value={expression.label}
              onChange={(e) => {
                const expr = expressions.find((ex) => ex.label === e.target.value);
                if (expr) setExpression(expr);
              }}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {expressions.map((expr) => (
                <option key={expr.label} value={expr.label}>
                  {expr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Background Style */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.avatarGenerator.background', 'Background')}</label>
            <select
              value={background.label}
              onChange={(e) => {
                const bg = backgroundStyles.find((b) => b.label === e.target.value);
                if (bg) setBackground(bg);
              }}
              className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {backgroundStyles.map((bg) => (
                <option key={bg.label} value={bg.label}>
                  {bg.label}
                </option>
              ))}
            </select>
          </div>
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
          disabled={isGenerating || !features.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.avatarGenerator.generating', 'Generating...')}
            </>
          ) : (
            <>
              <UserCircle className="w-5 h-5" />
              {t('tools.avatarGenerator.generateAvatar', 'Generate Avatar')}
            </>
          )}
        </button>

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <UserCircle className="w-4 h-4" />
                {t('tools.avatarGenerator.generatedAvatars', 'Generated Avatars')}
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.avatarGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.avatarGenerator.saving', 'Saving...')}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generatedImages.map((img, index) => (
                <div
                  key={`${img.timestamp.getTime()}-${index}`}
                  className={`group relative rounded-xl overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
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
                      title={t('tools.avatarGenerator.download', 'Download')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSave(img.url, img.prompt)}
                      disabled={isSaving}
                      className="p-3 bg-[#0D9488] rounded-full text-white hover:bg-[#0D9488]/90 transition-colors disabled:opacity-50"
                      title={t('tools.avatarGenerator.saveToGallery', 'Save to Gallery')}
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
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.avatarGenerator.yourGeneratedAvatarsWillAppear', 'Your generated avatars will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarGeneratorTool;
