import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Smile, Loader2, Copy, Save, Star, RefreshCw, ThumbsUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';

const jokeTypes = [
  { value: 'one-liner', label: 'One-Liner', emoji: '💥' },
  { value: 'pun', label: 'Pun', emoji: '😏' },
  { value: 'knock-knock', label: 'Knock-Knock', emoji: '🚪' },
  { value: 'dad-joke', label: 'Dad Joke', emoji: '👨' },
  { value: 'observational', label: 'Observational', emoji: '🤔' },
  { value: 'wordplay', label: 'Wordplay', emoji: '🎭' },
];

const audiences = [
  { value: 'kids', label: 'Kids (G-rated)' },
  { value: 'family', label: 'Family Friendly' },
  { value: 'office', label: 'Office-Safe' },
  { value: 'adults', label: 'Adults (PG-13)' },
];

const COLUMNS = [
  { key: 'text', label: 'Joke Text' },
  { key: 'rating', label: 'Rating' },
  { key: 'isFavorite', label: 'Favorite' },
];

interface GeneratedJoke {
  text: string;
  rating: number;
  isFavorite: boolean;
}

interface JokeGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const JokeGeneratorTool: React.FC<JokeGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [jokeType, setJokeType] = useState(jokeTypes[0].value);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState(audiences[1].value);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.jokeType) {
          setJokeType(params.jokeType);
          hasPrefill = true;
        }
        if (params.audience) {
          setAudience(params.audience);
          hasPrefill = true;
        }
        if (params.numJokes) {
          setNumJokes(params.numJokes);
          hasPrefill = true;
        }
        // Restore the generated jokes
        if (params.jokes && Array.isArray(params.jokes)) {
          setGeneratedJokes(params.jokes);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        if (params.text || params.content || params.topic) {
          setTopic(params.text || params.content || params.topic || '');
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);
  const [numJokes, setNumJokes] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedJokes, setGeneratedJokes] = useState<GeneratedJoke[]>([]);
  const [copySuccess, setCopySuccess] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const selectedType = jokeTypes.find(t => t.value === jokeType);
      const selectedAudience = audiences.find(a => a.value === audience);

      const prompt = `Generate ${numJokes} hilarious ${selectedType?.label || jokeType} jokes${topic ? ` about ${topic}` : ''}.

Joke Type: ${selectedType?.label}
Audience: ${selectedAudience?.label}
${topic ? `Topic: ${topic}` : 'Topic: Random/General'}

Requirements:
- Make them genuinely funny and clever
- Appropriate for ${selectedAudience?.label.toLowerCase()} audience
- ${jokeType === 'one-liner' ? 'Keep them short and punchy' : ''}
- ${jokeType === 'pun' ? 'Use clever wordplay and double meanings' : ''}
- ${jokeType === 'knock-knock' ? 'Follow proper knock-knock joke format' : ''}
- ${jokeType === 'dad-joke' ? 'Make them groan-worthy but endearing' : ''}
- ${jokeType === 'observational' ? 'Focus on relatable everyday situations' : ''}
- Easy to remember and share

Please format each joke clearly, separated by "---"`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        maxTokens: 1000,
      });

      if (response?.text) {
        // Parse jokes from response
        const jokes = response.text
          .split('---')
          .map((joke: string) => joke.trim())
          .filter((joke: string) => joke.length > 0)
          .slice(0, numJokes)
          .map((joke: string) => ({
            text: joke,
            rating: 0,
            isFavorite: false,
          }));

        setGeneratedJokes(jokes);
      } else {
        setError('Failed to generate jokes. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating jokes');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (joke: string, index: number) => {
    try {
      await navigator.clipboard.writeText(joke);
      setCopySuccess(index);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (generatedJokes.length === 0) return;

    setIsSaving(true);
    try {
      const jokesText = generatedJokes
        .map((joke, i) => `${i + 1}. ${joke.text}${joke.isFavorite ? ' ⭐' : ''}`)
        .join('\n\n---\n\n');

      await api.post('/content', {
        content_type: 'text',
        title: `${jokeTypes.find(t => t.value === jokeType)?.label} Jokes${topic ? `: ${topic}` : ''}`,
        content: jokesText,
        metadata: {
          toolId: 'joke-generator',
          type: 'jokes',
          jokeType,
          topic,
          audience,
          numJokes,
          jokes: generatedJokes,
        },
      });
      setValidationMessage('Jokes saved successfully!');
      setTimeout(() => setValidationMessage(null), 3000);

      // Call onSaveCallback if provided (for gallery refresh)
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save jokes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRateJoke = (index: number, rating: number) => {
    setGeneratedJokes(prev =>
      prev.map((joke, i) =>
        i === index ? { ...joke, rating } : joke
      )
    );
  };

  const handleToggleFavorite = (index: number) => {
    setGeneratedJokes(prev =>
      prev.map((joke, i) =>
        i === index ? { ...joke, isFavorite: !joke.isFavorite } : joke
      )
    );
  };

  const isDark = theme === 'dark';

  const handleExportCSV = () => {
    if (generatedJokes.length === 0) return;

    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = generatedJokes.map(joke =>
      COLUMNS.map(col => {
        const value = joke[col.key as keyof GeneratedJoke];
        if (col.key === 'isFavorite') {
          return value ? 'Yes' : 'No';
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `jokes-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleExportJSON = () => {
    if (generatedJokes.length === 0) return;

    const data = {
      exportDate: new Date().toISOString(),
      jokeType,
      topic,
      audience,
      totalJokes: generatedJokes.length,
      jokes: generatedJokes,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `jokes-${new Date().toISOString().split('T')[0]}.json`);
    link.click();
  };

  const handleCopyToClipboard = async () => {
    if (generatedJokes.length === 0) return false;

    const text = generatedJokes
      .map((joke, i) => `${i + 1}. ${joke.text}${joke.isFavorite ? ' ⭐' : ''}`)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'bg-gray-800/50 border-gray-700' : t('tools.jokeGenerator.bgGradientToRFrom', 'bg-gradient-to-r from-white to-[#0D9488]/5 border-gray-100')
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Smile className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.jokeGenerator.aiJokeGenerator', 'AI Joke Generator')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.jokeGenerator.generateHilariousJokesWithAi', 'Generate hilarious jokes with AI')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{isEditFromGallery ? t('tools.jokeGenerator.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.jokeGenerator.topicLoadedFromYourConversation', 'Topic loaded from your conversation')}</span>
          </div>
        )}
        {/* Joke Type & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Smile className="w-4 h-4 inline mr-1" />
              {t('tools.jokeGenerator.jokeType', 'Joke Type')}
            </label>
            <select
              value={jokeType}
              onChange={(e) => setJokeType(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {jokeTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.jokeGenerator.audience', 'Audience')}
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {audiences.map((aud) => (
                <option key={aud.value} value={aud.value}>
                  {aud.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic (Optional) */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.jokeGenerator.topicOptional', 'Topic (Optional)')}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.jokeGenerator.eGProgrammingCoffeeCats', 'e.g., Programming, Coffee, Cats, Weather, Travel...')}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Number of Jokes */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Number of Jokes: {numJokes}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={numJokes}
            onChange={(e) => setNumJokes(Number(e.target.value))}
            className="w-full accent-[#0D9488]"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1</span>
            <span>10</span>
          </div>
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
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.jokeGenerator.generatingJokes', 'Generating Jokes...')}
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              {t('tools.jokeGenerator.generateJokes', 'Generate Jokes')}
            </>
          )}
        </button>

        {/* Generated Jokes */}
        {generatedJokes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Generated Jokes ({generatedJokes.length})
              </h4>
              <div className="flex items-center gap-2">
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportJSON={handleExportJSON}
                  onCopyToClipboard={handleCopyToClipboard}
                  showImport={false}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={generatedJokes.length === 0}
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#2DD4BF] transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save All
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {generatedJokes.map((joke, index) => (
                <div
                  key={index}
                  className={`p-5 border rounded-xl transition-all ${
                    joke.isFavorite
                      ? isDark
                        ? 'bg-yellow-900/20 border-yellow-700'
                        : 'bg-yellow-50 border-yellow-200'
                      : isDark
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={`flex-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {joke.text}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFavorite(index)}
                        className={`p-2 rounded-lg transition-all ${
                          joke.isFavorite
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : isDark
                            ? 'text-gray-400 hover:text-yellow-500'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={t('tools.jokeGenerator.favorite', 'Favorite')}
                      >
                        <Star className={`w-5 h-5 ${joke.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleCopy(joke.text, index)}
                        className={`p-2 rounded-lg transition-all ${
                          copySuccess === index
                            ? 'text-green-500'
                            : isDark
                            ? t('tools.jokeGenerator.textGray400HoverText', 'text-gray-400 hover:text-[#0D9488]') : t('tools.jokeGenerator.textGray400HoverText2', 'text-gray-400 hover:text-[#0D9488]')
                        }`}
                        title={t('tools.jokeGenerator.copy', 'Copy')}
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                    <ThumbsUp className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRateJoke(index, star)}
                          className={`transition-colors ${
                            star <= joke.rating
                              ? 'text-[#0D9488]'
                              : isDark
                              ? 'text-gray-600 hover:text-gray-500'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${star <= joke.rating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedJokes.length === 0 && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Smile className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.jokeGenerator.yourGeneratedJokesWillAppear', 'Your generated jokes will appear here')}</p>
            <p className="text-xs mt-2 italic">{t('tools.jokeGenerator.readyToMakeYouLaugh', 'Ready to make you laugh!')}</p>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white text-sm font-medium shadow-lg ${
            isDark ? 'bg-green-600' : 'bg-green-500'
          }`}>
            {validationMessage}
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default JokeGeneratorTool;
