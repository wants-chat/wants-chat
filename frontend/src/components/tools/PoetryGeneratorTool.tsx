import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Feather, Loader2, Copy, Save, Heart, Cloud, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface PoetryGeneratorToolProps {
  uiConfig?: UIConfig;
}

const poetryTypes = [
  { value: 'sonnet', label: 'Sonnet (14 lines)', rhymeScheme: 'ABAB CDCD EFEF GG' },
  { value: 'haiku', label: 'Haiku (5-7-5)', rhymeScheme: 'No rhyme' },
  { value: 'free-verse', label: 'Free Verse', rhymeScheme: 'No fixed scheme' },
  { value: 'limerick', label: 'Limerick', rhymeScheme: 'AABBA' },
  { value: 'rhyming', label: 'Rhyming Couplets', rhymeScheme: 'AA BB CC...' },
  { value: 'acrostic', label: 'Acrostic', rhymeScheme: 'First letter spells word' },
  { value: 'blank-verse', label: 'Blank Verse', rhymeScheme: 'Unrhymed iambic pentameter' },
];

const moods = [
  { value: 'romantic', label: 'Romantic', icon: Heart, color: 'text-pink-500' },
  { value: 'melancholic', label: 'Melancholic', icon: Cloud, color: 'text-blue-500' },
  { value: 'hopeful', label: 'Hopeful', icon: Sparkles, color: 'text-yellow-500' },
  { value: 'dark', label: 'Dark', icon: Cloud, color: 'text-purple-500' },
  { value: 'whimsical', label: 'Whimsical', icon: Sparkles, color: 'text-green-500' },
  { value: 'peaceful', label: 'Peaceful', icon: Feather, color: 'text-teal-500' },
];

const lengths = [
  { value: 'short', label: 'Short (4-8 lines)' },
  { value: 'medium', label: 'Medium (12-20 lines)' },
  { value: 'long', label: 'Long (24-40 lines)' },
];

export const PoetryGeneratorTool: React.FC<PoetryGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [poetryType, setPoetryType] = useState(poetryTypes[0].value);
  const [subject, setSubject] = useState('');
  const [mood, setMood] = useState(moods[0].value);
  const [length, setLength] = useState(lengths[0].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPoem, setGeneratedPoem] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const generatedSectionRef = useRef<HTMLDivElement>(null);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setSubject(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      setError('Please enter a theme or subject');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const selectedType = poetryTypes.find(t => t.value === poetryType);
      const selectedMood = moods.find(m => m.value === mood);

      const prompt = `Write a beautiful ${selectedType?.label || poetryType} poem about "${subject}".

Mood/Tone: ${selectedMood?.label}
${poetryType !== 'haiku' && poetryType !== 'limerick' && poetryType !== 'sonnet' ? `Length: ${lengths.find(l => l.value === length)?.label}` : ''}
${selectedType?.rhymeScheme ? `Rhyme Scheme: ${selectedType.rhymeScheme}` : ''}

Please create a poem that:
- Captures the essence of the subject
- Evokes the ${selectedMood?.label.toLowerCase()} mood
- Uses vivid imagery and metaphors
- Has a natural flow and rhythm
${poetryType === 'haiku' ? '- Follows the 5-7-5 syllable pattern' : ''}
${poetryType === 'sonnet' ? '- Follows proper sonnet structure with iambic pentameter' : ''}
${poetryType === 'limerick' ? '- Is humorous and follows AABBA rhyme scheme' : ''}
${poetryType === 'acrostic' ? `- Spells out "${subject}" with the first letter of each line` : ''}

Make it emotionally resonant and memorable.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert poet. Create beautiful, evocative poems in various styles that capture emotions and imagery.',
        temperature: 0.8,
        maxTokens: 800,
      });

      // Extract content - API returns { success: true, data: { text: "..." } }
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const poemContent = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      if (poemContent && poemContent.length > 0) {
        setGeneratedPoem(poemContent);

        setTimeout(() => {
          generatedSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else {
        setError('Failed to generate poem. Please try again.');
      }
    } catch (err: any) {
      // Network or server error
      setError(err.message || 'Unable to connect to AI service. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedPoem) return;

    try {
      await navigator.clipboard.writeText(generatedPoem);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (!generatedPoem) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        content_type: 'text',
        title: `Poem: ${subject}`,
        content: generatedPoem,
        metadata: {
          type: 'poetry',
          poetryType,
          mood,
          subject,
        },
      });
      setValidationMessage('Poem saved successfully!');
      setTimeout(() => setValidationMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save poem');
    } finally {
      setIsSaving(false);
    }
  };

  const isDark = theme === 'dark';
  const selectedType = poetryTypes.find(t => t.value === poetryType);
  const selectedMood = moods.find(m => m.value === mood);
  const MoodIcon = selectedMood?.icon || Feather;

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'bg-gray-800/50 border-gray-700' : t('tools.poetryGenerator.bgGradientToRFrom', 'bg-gradient-to-r from-white to-[#0D9488]/5 border-gray-100')
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Feather className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.poetryGenerator.aiPoetryGenerator', 'AI Poetry Generator')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.poetryGenerator.createBeautifulPoetryWithAi', 'Create beautiful poetry with AI')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.poetryGenerator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Poetry Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Feather className="w-4 h-4 inline mr-1" />
            {t('tools.poetryGenerator.poetryType', 'Poetry Type')}
          </label>
          <select
            value={poetryType}
            onChange={(e) => setPoetryType(e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            {poetryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {selectedType?.rhymeScheme && (
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Rhyme Scheme: {selectedType.rhymeScheme}
            </p>
          )}
        </div>

        {/* Theme/Subject */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Sparkles className="w-4 h-4 inline mr-1" />
            {t('tools.poetryGenerator.themeSubject', 'Theme / Subject')}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('tools.poetryGenerator.eGNatureLoveTime', 'e.g., Nature, Love, Time, Dreams, Ocean, Memories')}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Mood & Length */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <MoodIcon className={`w-4 h-4 inline mr-1 ${selectedMood?.color}`} />
              {t('tools.poetryGenerator.mood', 'Mood')}
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {moods.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {poetryType !== 'haiku' && poetryType !== 'limerick' && poetryType !== 'sonnet' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.poetryGenerator.length', 'Length')}
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                {lengths.map((len) => (
                  <option key={len.value} value={len.value}>
                    {len.label}
                  </option>
                ))}
              </select>
            </div>
          )}
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
          disabled={isGenerating || !subject.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.poetryGenerator.composingPoetry', 'Composing Poetry...')}
            </>
          ) : (
            <>
              <Feather className="w-5 h-5" />
              {t('tools.poetryGenerator.generatePoem', 'Generate Poem')}
            </>
          )}
        </button>

        {/* Generated Poem */}
        {generatedPoem && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.poetryGenerator.yourPoem', 'Your Poem')}
              </h4>
              <div className="flex gap-2">
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
                  {copySuccess ? t('tools.poetryGenerator.copied', 'Copied!') : t('tools.poetryGenerator.copy', 'Copy')}
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
                  Save
                </button>
              </div>
            </div>
            <div className={`p-8 border rounded-xl ${
              isDark
                ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'
                : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
            }`}>
              <div className="text-center">
                <p className={`whitespace-pre-wrap leading-relaxed font-serif text-lg italic ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {generatedPoem}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedPoem && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Feather className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.poetryGenerator.yourGeneratedPoemWillAppear', 'Your generated poem will appear here')}</p>
            <p className="text-xs mt-2 italic">{t('tools.poetryGenerator.wordsWaitingToBeBorn', 'Words waiting to be born...')}</p>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className={`p-4 border rounded-xl text-sm font-medium animate-fade-in ${
            isDark
              ? 'bg-green-900/20 border-green-800 text-green-400'
              : 'bg-green-50 border-green-100 text-green-600'
          }`}>
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PoetryGeneratorTool;
