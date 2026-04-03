import React, { useState, useEffect, useRef } from 'react';
import { Feather, Loader2, Copy, Check, Sparkles, RefreshCw, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Poem {
  title: string;
  content: string;
  style: string;
  theme: string;
  timestamp: Date;
}

interface AIPoemGeneratorToolProps {
  uiConfig?: UIConfig;
}

const poemStyles = [
  { label: 'Free Verse', value: 'free-verse', description: 'No set structure or rhyme scheme' },
  { label: 'Haiku', value: 'haiku', description: '5-7-5 syllable structure' },
  { label: 'Sonnet', value: 'sonnet', description: '14 lines with specific rhyme scheme' },
  { label: 'Limerick', value: 'limerick', description: '5 lines, humorous, AABBA rhyme' },
  { label: 'Acrostic', value: 'acrostic', description: 'First letters spell a word' },
  { label: 'Rhyming Couplets', value: 'couplets', description: 'Pairs of rhyming lines' },
  { label: 'Blank Verse', value: 'blank-verse', description: 'Unrhymed iambic pentameter' },
  { label: 'Villanelle', value: 'villanelle', description: '19 lines with refrains' },
  { label: 'Ode', value: 'ode', description: 'Lyrical poem praising something' },
  { label: 'Ballad', value: 'ballad', description: 'Narrative poem with quatrains' },
];

const poemThemes = [
  { label: 'Love & Romance', value: 'love' },
  { label: 'Nature', value: 'nature' },
  { label: 'Life & Philosophy', value: 'philosophy' },
  { label: 'Loss & Grief', value: 'grief' },
  { label: 'Hope & Inspiration', value: 'hope' },
  { label: 'Seasons & Time', value: 'seasons' },
  { label: 'Friendship', value: 'friendship' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Self-Discovery', value: 'self-discovery' },
  { label: 'Mystery', value: 'mystery' },
];

const poemMoods = [
  { label: 'Joyful', value: 'joyful' },
  { label: 'Melancholic', value: 'melancholic' },
  { label: 'Peaceful', value: 'peaceful' },
  { label: 'Passionate', value: 'passionate' },
  { label: 'Nostalgic', value: 'nostalgic' },
  { label: 'Whimsical', value: 'whimsical' },
  { label: 'Dark', value: 'dark' },
  { label: 'Uplifting', value: 'uplifting' },
];

export const AIPoemGeneratorTool: React.FC<AIPoemGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState(poemStyles[0]);
  const [theme, setTheme] = useState(poemThemes[0]);
  const [mood, setMood] = useState(poemMoods[0]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPoems, setGeneratedPoems] = useState<Poem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const generatedSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.topic || params.text || params.content) {
        setTopic(params.topic || params.text || params.content || '');
        hasChanges = true;
      }

      if (params.style) {
        const matched = poemStyles.find(s => s.value === params.style?.toLowerCase());
        if (matched) {
          setStyle(matched);
          hasChanges = true;
        }
      }

      if (params.theme) {
        const matched = poemThemes.find(t => t.value === params.theme?.toLowerCase());
        if (matched) {
          setTheme(matched);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or inspiration');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Write a beautiful poem with the following specifications:
Topic/Inspiration: ${topic}
Style: ${style.label} - ${style.description}
Theme: ${theme.label}
Mood: ${mood.label}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

Create a complete, polished poem that follows the ${style.label} structure. The poem should evoke the ${mood.label} mood while exploring the theme of ${theme.label}.

Return the poem in JSON format:
{
  "title": "A creative title for the poem",
  "content": "The full poem with proper line breaks (use \\n for new lines)",
  "style": "${style.label}",
  "theme": "${theme.label}"
}

Return ONLY valid JSON.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert poet. Create beautiful, evocative poems in various styles. Return poems in valid JSON format only.',
        temperature: 0.8,
        maxTokens: 1500,
      });

      // Extract content and ensure it's a string
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      let poem: Poem;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          poem = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON, treat the entire response as the poem
          poem = {
            title: topic,
            content: content,
            style: style.label,
            theme: theme.label,
          };
        }
      } catch {
        poem = {
          title: topic,
          content: content,
          style: style.label,
          theme: theme.label,
        };
      }

      poem.timestamp = new Date();
      setGeneratedPoems(prev => [poem, ...prev]);

      setTimeout(() => {
        generatedSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);

      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Poem: ${poem.title}`,
          content: poem.content,
          metadata: {
            type: 'poem',
            style: style.value,
            theme: theme.value,
            mood: mood.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save poem:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate poem');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (poem: Poem, index: number) => {
    const text = `${poem.title}\n\n${poem.content}\n\n[${poem.style} | ${poem.theme}]`;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleFavorite = (index: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(index)) {
        newFavorites.delete(index);
      } else {
        newFavorites.add(index);
      }
      return newFavorites;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Feather className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.aIPoemGenerator.aiPoemGenerator', 'AI Poem Generator')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.aIPoemGenerator.createBeautifulPoetryWithAi', 'Create beautiful poetry with AI')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.aIPoemGenerator.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIPoemGenerator.topicOrInspiration', 'Topic or Inspiration')}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.aIPoemGenerator.whatShouldThePoemBe', 'What should the poem be about? (e.g., \'A sunset over the ocean\', \'First love\', \'The changing seasons\')...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Style & Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIPoemGenerator.poetryStyle', 'Poetry Style')}
            </label>
            <select
              value={style.value}
              onChange={(e) => {
                const selected = poemStyles.find(s => s.value === e.target.value);
                if (selected) setStyle(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {poemStyles.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">{style.description}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIPoemGenerator.theme', 'Theme')}
            </label>
            <select
              value={theme.value}
              onChange={(e) => {
                const selected = poemThemes.find(t => t.value === e.target.value);
                if (selected) setTheme(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {poemThemes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIPoemGenerator.mood', 'Mood')}
          </label>
          <div className="flex flex-wrap gap-2">
            {poemMoods.map(m => (
              <button
                key={m.value}
                onClick={() => setMood(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mood.value === m.value
                    ? t('tools.aIPoemGenerator.bg0d9488TextWhite', 'bg-[#0D9488] text-white') : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIPoemGenerator.additionalNotesOptional', 'Additional Notes (Optional)')}
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={t('tools.aIPoemGenerator.anySpecificWordsImageryOr', 'Any specific words, imagery, or feelings you want to include...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.aIPoemGenerator.composingPoetry', 'Composing Poetry...')}
            </>
          ) : (
            <>
              <Feather className="w-5 h-5" />
              {t('tools.aIPoemGenerator.generatePoem', 'Generate Poem')}
            </>
          )}
        </button>

        {/* Generated Poems Display */}
        {generatedPoems.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Feather className="w-4 h-4" />
                {t('tools.aIPoemGenerator.generatedPoems', 'Generated Poems')}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {generatedPoems.length} poem{generatedPoems.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-4">
              {generatedPoems.map((poem, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-gray-50 to-[#0D9488]/5 dark:from-gray-900 dark:to-[#0D9488]/10 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Poem Header */}
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white text-lg italic">
                        {poem.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-[#0D9488]/10 text-[#0D9488] rounded-full">
                          {poem.style}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          {poem.theme}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(idx)}
                        className={`p-2 rounded-lg transition-colors ${
                          favorites.has(idx)
                            ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(idx) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleCopy(poem, idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {t('tools.aIPoemGenerator.copied', 'Copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            {t('tools.aIPoemGenerator.copy', 'Copy')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Poem Content */}
                  <div className="p-6">
                    <div className="font-serif text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-center">
                      {poem.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedPoems.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Feather className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIPoemGenerator.yourPoemsWillAppearHere', 'Your poems will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPoemGeneratorTool;
