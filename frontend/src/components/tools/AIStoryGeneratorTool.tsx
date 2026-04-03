import React, { useState, useEffect, useRef } from 'react';
import { BookMarked, Loader2, Copy, Check, Sparkles, RefreshCw, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface StoryPrompt {
  title: string;
  premise: string;
  setting: string;
  mainCharacter: {
    name: string;
    description: string;
    motivation: string;
  };
  conflict: string;
  plotPoints: string[];
  possibleEndings: string[];
  writingPrompts: string[];
  genre: string;
  timestamp: Date;
}

interface AIStoryGeneratorToolProps {
  uiConfig?: UIConfig;
}

const genres = [
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Science Fiction', value: 'sci-fi' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Romance', value: 'romance' },
  { label: 'Thriller', value: 'thriller' },
  { label: 'Horror', value: 'horror' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Historical Fiction', value: 'historical' },
  { label: 'Comedy', value: 'comedy' },
  { label: 'Drama', value: 'drama' },
  { label: 'Young Adult', value: 'young-adult' },
  { label: 'Literary Fiction', value: 'literary' },
];

const storyLengths = [
  { label: 'Flash Fiction (< 1,000 words)', value: 'flash' },
  { label: 'Short Story (1,000 - 7,500 words)', value: 'short' },
  { label: 'Novelette (7,500 - 20,000 words)', value: 'novelette' },
  { label: 'Novella (20,000 - 50,000 words)', value: 'novella' },
  { label: 'Novel (50,000+ words)', value: 'novel' },
];

const tones = [
  { label: 'Light & Humorous', value: 'light' },
  { label: 'Dark & Gritty', value: 'dark' },
  { label: 'Whimsical', value: 'whimsical' },
  { label: 'Suspenseful', value: 'suspenseful' },
  { label: 'Emotional', value: 'emotional' },
  { label: 'Action-Packed', value: 'action' },
  { label: 'Thought-Provoking', value: 'thought-provoking' },
  { label: 'Romantic', value: 'romantic' },
];

export const AIStoryGeneratorTool: React.FC<AIStoryGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState('');
  const [genre, setGenre] = useState(genres[0]);
  const [storyLength, setStoryLength] = useState(storyLengths[1]);
  const [tone, setTone] = useState(tones[0]);
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<StoryPrompt[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set([0]));
  const [savedPrompts, setSavedPrompts] = useState<Set<number>>(new Set());
  const generatedSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.theme || params.topic || params.text || params.content) {
        setTheme(params.theme || params.topic || params.text || params.content || '');
        hasChanges = true;
      }

      if (params.genre) {
        const matched = genres.find(g => g.value === params.genre?.toLowerCase());
        if (matched) {
          setGenre(matched);
          hasChanges = true;
        }
      }

      if (params.tone) {
        const matched = tones.find(t => t.value === params.tone?.toLowerCase());
        if (matched) {
          setTone(matched);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      setError('Please enter a theme or idea');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Generate a creative story prompt with the following specifications:
Theme/Idea: ${theme}
Genre: ${genre.label}
Target Length: ${storyLength.label}
Tone: ${tone.label}
${keywords ? `Include these elements: ${keywords}` : ''}

Create a detailed story prompt in JSON format:
{
  "title": "A compelling story title",
  "premise": "A 2-3 sentence hook that captures the core idea",
  "setting": "Detailed description of where and when the story takes place",
  "mainCharacter": {
    "name": "Character name",
    "description": "Physical and personality description",
    "motivation": "What drives this character"
  },
  "conflict": "The central conflict or challenge",
  "plotPoints": [
    "Opening hook",
    "Inciting incident",
    "Rising action point 1",
    "Rising action point 2",
    "Climax hint",
    "Resolution direction"
  ],
  "possibleEndings": [
    "Ending option 1",
    "Ending option 2",
    "Ending option 3"
  ],
  "writingPrompts": [
    "Opening line suggestion",
    "Key scene prompt",
    "Dialogue prompt"
  ],
  "genre": "${genre.label}"
}

Make it creative, engaging, and suitable for the ${tone.label} tone. Return ONLY valid JSON.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a creative writing expert. Generate detailed, engaging story prompts with compelling characters, settings, and plot points. Return content in valid JSON format only.',
        temperature: 0.8,
        maxTokens: 2500,
      });

      // Extract content and ensure it's a string
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      let storyPrompt: StoryPrompt;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          storyPrompt = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        storyPrompt = {
          title: `Untitled ${genre.label} Story`,
          premise: theme,
          setting: 'To be determined',
          mainCharacter: {
            name: 'Protagonist',
            description: 'A complex character with depth',
            motivation: 'To overcome the central conflict',
          },
          conflict: 'The main challenge of the story',
          plotPoints: ['Opening', 'Rising action', 'Climax', 'Resolution'],
          possibleEndings: ['Happy ending', 'Bittersweet ending', 'Open ending'],
          writingPrompts: ['Start with action', 'Introduce mystery', 'Build tension'],
          genre: genre.label,
          timestamp: new Date(),
        };
      }

      storyPrompt.timestamp = new Date();
      storyPrompt.genre = genre.label;
      setGeneratedPrompts(prev => [storyPrompt, ...prev]);
      setExpandedPrompts(new Set([0]));

      setTimeout(() => {
        generatedSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);

      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Story Prompt: ${storyPrompt.title}`,
          content: JSON.stringify(storyPrompt),
          metadata: {
            type: 'story-prompt',
            genre: genre.value,
            tone: tone.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save story prompt:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate story prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatPromptForCopy = (prompt: StoryPrompt) => {
    let text = `STORY PROMPT: ${prompt.title}\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Genre: ${prompt.genre}\n\n`;
    text += `PREMISE\n${'-'.repeat(30)}\n${prompt.premise}\n\n`;
    text += `SETTING\n${'-'.repeat(30)}\n${prompt.setting}\n\n`;
    text += `MAIN CHARACTER\n${'-'.repeat(30)}\n`;
    text += `Name: ${prompt.mainCharacter.name}\n`;
    text += `Description: ${prompt.mainCharacter.description}\n`;
    text += `Motivation: ${prompt.mainCharacter.motivation}\n\n`;
    text += `CENTRAL CONFLICT\n${'-'.repeat(30)}\n${prompt.conflict}\n\n`;
    text += `PLOT POINTS\n${'-'.repeat(30)}\n`;
    prompt.plotPoints.forEach((point, idx) => {
      text += `${idx + 1}. ${point}\n`;
    });
    text += `\nPOSSIBLE ENDINGS\n${'-'.repeat(30)}\n`;
    prompt.possibleEndings.forEach((ending, idx) => {
      text += `${idx + 1}. ${ending}\n`;
    });
    text += `\nWRITING PROMPTS\n${'-'.repeat(30)}\n`;
    prompt.writingPrompts.forEach((wp, idx) => {
      text += `${idx + 1}. ${wp}\n`;
    });
    return text;
  };

  const handleCopy = async (prompt: StoryPrompt, index: number) => {
    const text = formatPromptForCopy(prompt);
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleExpanded = (index: number) => {
    setExpandedPrompts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSaved = (index: number) => {
    setSavedPrompts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <BookMarked className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.aIStoryGenerator.aiStoryGenerator', 'AI Story Generator')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.aIStoryGenerator.generateCreativeStoryPromptsAnd', 'Generate creative story prompts and outlines')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.aIStoryGenerator.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Theme Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIStoryGenerator.storyThemeOrIdea', 'Story Theme or Idea')}
          </label>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder={t('tools.aIStoryGenerator.describeYourStoryIdeaTheme', 'Describe your story idea, theme, or the spark of inspiration (e.g., \'A detective who can read minds investigates a crime where the victim has no memories\')...')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Genre & Length */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIStoryGenerator.genre', 'Genre')}
            </label>
            <select
              value={genre.value}
              onChange={(e) => {
                const selected = genres.find(g => g.value === e.target.value);
                if (selected) setGenre(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {genres.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIStoryGenerator.targetLength', 'Target Length')}
            </label>
            <select
              value={storyLength.value}
              onChange={(e) => {
                const selected = storyLengths.find(l => l.value === e.target.value);
                if (selected) setStoryLength(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {storyLengths.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIStoryGenerator.tone', 'Tone')}
          </label>
          <div className="flex flex-wrap gap-2">
            {tones.map(t => (
              <button
                key={t.value}
                onClick={() => setTone(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tone.value === t.value
                    ? t('tools.aIStoryGenerator.bg0d9488TextWhite', 'bg-[#0D9488] text-white') : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIStoryGenerator.keywordsOrElementsToInclude', 'Keywords or Elements to Include (Optional)')}
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('tools.aIStoryGenerator.eGTimeTravelDragons', 'e.g., time travel, dragons, betrayal, redemption...')}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
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
          disabled={isGenerating || !theme.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.aIStoryGenerator.generatingStoryPrompt', 'Generating Story Prompt...')}
            </>
          ) : (
            <>
              <BookMarked className="w-5 h-5" />
              {t('tools.aIStoryGenerator.generateStoryPrompt', 'Generate Story Prompt')}
            </>
          )}
        </button>

        {/* Generated Prompts Display */}
        {generatedPrompts.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <BookMarked className="w-4 h-4" />
                {t('tools.aIStoryGenerator.generatedStoryPrompts', 'Generated Story Prompts')}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {generatedPrompts.length} prompt{generatedPrompts.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-4">
              {generatedPrompts.map((storyPrompt, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Prompt Header */}
                  <button
                    onClick={() => toggleExpanded(idx)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-left">
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {storyPrompt.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-[#0D9488]/10 text-[#0D9488] rounded-full">
                          {storyPrompt.genre}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaved(idx);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          savedPrompts.has(idx)
                            ? t('tools.aIStoryGenerator.text0d9488Bg0d948810', 'text-[#0D9488] bg-[#0D9488]/10') : t('tools.aIStoryGenerator.textGray400HoverText', 'text-gray-400 hover:text-[#0D9488] hover:bg-[#0D9488]/10')
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${savedPrompts.has(idx) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(storyPrompt, idx);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {expandedPrompts.has(idx) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedPrompts.has(idx) && (
                    <div className="px-5 pb-5 space-y-4">
                      {/* Premise */}
                      <div>
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-1">{t('tools.aIStoryGenerator.premise', 'Premise')}</h6>
                        <p className="text-gray-800 dark:text-gray-200">{storyPrompt.premise}</p>
                      </div>

                      {/* Setting */}
                      <div>
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-1">{t('tools.aIStoryGenerator.setting', 'Setting')}</h6>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{storyPrompt.setting}</p>
                      </div>

                      {/* Main Character */}
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-2">{t('tools.aIStoryGenerator.mainCharacter', 'Main Character')}</h6>
                        <p className="font-medium text-gray-900 dark:text-white">{storyPrompt.mainCharacter.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{storyPrompt.mainCharacter.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 italic">
                          Motivation: {storyPrompt.mainCharacter.motivation}
                        </p>
                      </div>

                      {/* Conflict */}
                      <div>
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-1">{t('tools.aIStoryGenerator.centralConflict', 'Central Conflict')}</h6>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{storyPrompt.conflict}</p>
                      </div>

                      {/* Plot Points */}
                      <div>
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-2">{t('tools.aIStoryGenerator.plotPoints', 'Plot Points')}</h6>
                        <ol className="space-y-1.5">
                          {storyPrompt.plotPoints.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="flex items-center justify-center w-5 h-5 bg-[#0D9488]/10 text-[#0D9488] text-xs rounded-full flex-shrink-0">
                                {pIdx + 1}
                              </span>
                              {point}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Possible Endings */}
                      <div>
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-2">{t('tools.aIStoryGenerator.possibleEndings', 'Possible Endings')}</h6>
                        <ul className="space-y-1">
                          {storyPrompt.possibleEndings.map((ending, eIdx) => (
                            <li key={eIdx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="text-[#0D9488]">-</span>
                              {ending}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Writing Prompts */}
                      <div className="bg-[#0D9488]/5 p-3 rounded-lg">
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-2">{t('tools.aIStoryGenerator.writingPromptsToGetStarted', 'Writing Prompts to Get Started')}</h6>
                        <ul className="space-y-1.5">
                          {storyPrompt.writingPrompts.map((wp, wpIdx) => (
                            <li key={wpIdx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Sparkles className="w-3.5 h-3.5 text-[#0D9488] mt-0.5 flex-shrink-0" />
                              {wp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedPrompts.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIStoryGenerator.yourStoryPromptsWillAppear', 'Your story prompts will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStoryGeneratorTool;
