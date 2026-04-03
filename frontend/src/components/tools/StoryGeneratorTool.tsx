import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Loader2, Copy, Save, Sparkles, Users, MapPin, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const genres = [
  { value: 'fantasy', label: 'Fantasy', emoji: '🐉' },
  { value: 'sci-fi', label: 'Science Fiction', emoji: '🚀' },
  { value: 'romance', label: 'Romance', emoji: '💖' },
  { value: 'thriller', label: 'Thriller', emoji: '🔪' },
  { value: 'mystery', label: 'Mystery', emoji: '🔍' },
  { value: 'horror', label: 'Horror', emoji: '👻' },
  { value: 'adventure', label: 'Adventure', emoji: '🗺️' },
  { value: 'historical', label: 'Historical Fiction', emoji: '📜' },
];

const storyLengths = [
  { value: 'flash', label: 'Flash Fiction (< 1000 words)' },
  { value: 'short', label: 'Short Story (1000-5000 words)' },
  { value: 'chapter', label: 'Chapter (3000-7000 words)' },
];

const writingStyles = [
  { value: 'descriptive', label: 'Descriptive & Atmospheric' },
  { value: 'action', label: 'Action-Packed' },
  { value: 'dialogue', label: 'Dialogue-Heavy' },
  { value: 'literary', label: 'Literary & Poetic' },
  { value: 'minimalist', label: 'Minimalist' },
];

interface StoryGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const StoryGeneratorTool = ({ uiConfig }: StoryGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [genre, setGenre] = useState(genres[0].value);
  const [storyLength, setStoryLength] = useState(storyLengths[0].value);
  const [character, setCharacter] = useState('');
  const [setting, setSetting] = useState('');
  const [plotElements, setPlotElements] = useState('');
  const [writingStyle, setWritingStyle] = useState(writingStyles[0].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle prefill from uiConfig or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.character) {
          setCharacter(params.character);
          hasPrefill = true;
        }
        if (params.setting) {
          setSetting(params.setting);
          hasPrefill = true;
        }
        if (params.plotElements) {
          setPlotElements(params.plotElements);
          hasPrefill = true;
        }
        if (params.genre) {
          const foundGenre = genres.find(g => g.value === params.genre);
          if (foundGenre) {
            setGenre(foundGenre.value);
            hasPrefill = true;
          }
        }
        if (params.storyLength) {
          const foundLength = storyLengths.find(l => l.value === params.storyLength);
          if (foundLength) {
            setStoryLength(foundLength.value);
            hasPrefill = true;
          }
        }
        if (params.writingStyle) {
          const foundStyle = writingStyles.find(s => s.value === params.writingStyle);
          if (foundStyle) {
            setWritingStyle(foundStyle.value);
            hasPrefill = true;
          }
        }
        // Restore the generated story
        if (params.text) {
          setGeneratedStory(params.text);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.character) {
          setCharacter(params.character);
          hasPrefill = true;
        }
        if (params.setting) {
          setSetting(params.setting);
          hasPrefill = true;
        }
        if (params.plotElements) {
          setPlotElements(params.plotElements);
          hasPrefill = true;
        }
        if (params.genre) {
          const foundGenre = genres.find(g => g.value === params.genre);
          if (foundGenre) {
            setGenre(foundGenre.value);
            hasPrefill = true;
          }
        }
        if (params.storyLength) {
          const foundLength = storyLengths.find(l => l.value === params.storyLength);
          if (foundLength) {
            setStoryLength(foundLength.value);
            hasPrefill = true;
          }
        }
        if (params.writingStyle) {
          const foundStyle = writingStyles.find(s => s.value === params.writingStyle);
          if (foundStyle) {
            setWritingStyle(foundStyle.value);
            hasPrefill = true;
          }
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const handleGenerate = async () => {
    if (!character.trim() || !setting.trim()) {
      setError(t('tools.storyGenerator.errors.characterAndSetting'));
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const selectedGenre = genres.find(g => g.value === genre);
      const prompt = `Write a ${genre} story with the following details:

Genre: ${selectedGenre?.label}
Length: ${storyLengths.find(l => l.value === storyLength)?.label}
Writing Style: ${writingStyles.find(s => s.value === writingStyle)?.label}

Main Character: ${character}
Setting/World: ${setting}
${plotElements ? `Plot Elements/Themes: ${plotElements}` : ''}

Please create an engaging story with:
- A compelling opening hook
- Well-developed characters
- Vivid descriptions
- Natural dialogue
- A satisfying plot arc
- An impactful ending

Make the story immersive and emotionally resonant.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        maxTokens: storyLength === 'chapter' ? 3000 : storyLength === 'short' ? 2000 : 1000,
      });

      if (response?.text) {
        setGeneratedStory(response.text);
      } else {
        setError('Failed to generate story. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the story');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedStory) return;

    try {
      await navigator.clipboard.writeText(generatedStory);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (!generatedStory) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `${genres.find(g => g.value === genre)?.label} Story: ${character}`,
        prompt: `${genres.find(g => g.value === genre)?.label} story`,
        metadata: {
          text: generatedStory,
          toolId: 'story-generator',
          genre,
          storyLength,
          character,
          setting,
          plotElements,
          writingStyle,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save story');
    } finally {
      setIsSaving(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gradient-to-r from-white to-[#0D9488]/5 border-gray-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.storyGenerator.title')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.storyGenerator.description')}
            </p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>
                  {isEditFromGallery
                    ? t('tools.storyGenerator.contentRestored')
                    : t('tools.storyGenerator.preFilled')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Genre & Length */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Sparkles className="w-4 h-4 inline mr-1" />
              {t('tools.storyGenerator.genre')}
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {genres.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.emoji} {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <BookOpen className="w-4 h-4 inline mr-1" />
              {t('tools.storyGenerator.storyLength')}
            </label>
            <select
              value={storyLength}
              onChange={(e) => setStoryLength(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {storyLengths.map((length) => (
                <option key={length.value} value={length.value}>
                  {length.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Character */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Users className="w-4 h-4 inline mr-1" />
            {t('tools.storyGenerator.mainCharacter')}
          </label>
          <input
            type="text"
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            placeholder={t('tools.storyGenerator.mainCharacterPlaceholder')}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Setting/World */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('tools.storyGenerator.settingWorld')}
          </label>
          <input
            type="text"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            placeholder={t('tools.storyGenerator.settingPlaceholder')}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Plot Elements (Optional) */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.storyGenerator.plotElements')}
          </label>
          <textarea
            value={plotElements}
            onChange={(e) => setPlotElements(e.target.value)}
            placeholder={t('tools.storyGenerator.plotElementsPlaceholder')}
            rows={2}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Writing Style */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.storyGenerator.writingStyle')}
          </label>
          <select
            value={writingStyle}
            onChange={(e) => setWritingStyle(e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            {writingStyles.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 border rounded-xl text-sm ${
            isDark
              ? 'bg-red-900/20 border-red-800 text-red-400'
              : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !character.trim() || !setting.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.storyGenerator.crafting')}
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5" />
              {t('tools.storyGenerator.generateStory')}
            </>
          )}
        </button>

        {/* Generated Story */}
        {generatedStory && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                {t('tools.storyGenerator.yourStory')}
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {t('tools.storyGenerator.editable')}
                </span>
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.storyGenerator.saved')}
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 border rounded-lg transition-all flex items-center gap-2 ${
                    copySuccess
                      ? 'bg-green-500 text-white border-green-500'
                      : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copySuccess ? t('tools.storyGenerator.copied') : t('tools.storyGenerator.copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#2DD4BF] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t('tools.storyGenerator.save')}
                </button>
              </div>
            </div>
            <textarea
              value={generatedStory}
              onChange={(e) => setGeneratedStory(e.target.value)}
              rows={15}
              className={`w-full p-4 border rounded-xl leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-y ${
                isDark
                  ? 'bg-gray-900 border-gray-700 text-gray-300'
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
              placeholder={t('tools.storyGenerator.generatedPlaceholder')}
            />
          </div>
        )}

        {/* Empty State */}
        {!generatedStory && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.storyGenerator.emptyState')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryGeneratorTool;
