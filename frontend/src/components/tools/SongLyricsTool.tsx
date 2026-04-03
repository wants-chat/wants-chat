import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { Music, Loader2, Copy, Check, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface SongLyricsToolProps {
  uiConfig?: UIConfig;
}

const genres = [
  'Pop', 'Rock', 'Hip-Hop/Rap', 'R&B', 'Country', 'Folk', 'Jazz', 'Blues',
  'Electronic/EDM', 'Indie', 'Soul', 'Gospel', 'Reggae', 'Metal', 'Punk', 'Other',
];

const moods = [
  { value: 'happy', label: 'Happy & Upbeat' },
  { value: 'sad', label: 'Sad & Melancholic' },
  { value: 'romantic', label: 'Romantic & Loving' },
  { value: 'angry', label: 'Angry & Intense' },
  { value: 'nostalgic', label: 'Nostalgic & Reflective' },
  { value: 'empowering', label: 'Empowering & Motivational' },
  { value: 'chill', label: 'Chill & Relaxed' },
  { value: 'party', label: 'Party & Fun' },
];

const structures = [
  { value: 'standard', label: 'Standard (Verse-Chorus-Verse-Chorus-Bridge-Chorus)' },
  { value: 'simple', label: 'Simple (Verse-Chorus-Verse-Chorus)' },
  { value: 'extended', label: 'Extended (with Pre-Chorus and Outro)' },
  { value: 'freestyle', label: 'Freestyle (No strict structure)' },
];

export const SongLyricsTool: React.FC<SongLyricsToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('happy');
  const [structure, setStructure] = useState('standard');
  const [inspirations, setInspirations] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { saveToolData } = useToolData();

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & Record<string, any>;

      // Check if editing from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore all saved form fields
        if (params.topic) setTopic(params.topic);
        if (params.genre) setGenre(params.genre);
        if (params.mood) setMood(params.mood);
        if (params.structure) setStructure(params.structure);
        if (params.inspirations) setInspirations(params.inspirations);
        if (params.additionalNotes) setAdditionalNotes(params.additionalNotes);
        // Restore generated content
        if (params.lyrics) setLyrics(params.lyrics);
        setIsPrefilled(true);
      } else {
        // Standard prefill logic
        if (params.text || params.content) {
          setTopic(params.text || params.content || '');
          setIsPrefilled(true);
        }
        if (params.formData) {
          if (params.formData.genre) setGenre(params.formData.genre);
          if (params.formData.mood) setMood(params.formData.mood);
          if (params.formData.structure) setStructure(params.formData.structure);
          if (params.formData.inspirations) setInspirations(params.formData.inspirations);
          if (params.formData.additionalNotes) setAdditionalNotes(params.formData.additionalNotes);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or theme');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Write original song lyrics with the following specifications:

Topic/Theme: ${topic}
Genre: ${genre}
Mood: ${moods.find(m => m.value === mood)?.label}
Structure: ${structures.find(s => s.value === structure)?.label}
${inspirations ? `Artist Inspirations: ${inspirations}` : ''}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

Requirements:
1. Create original, creative lyrics that capture the essence of ${genre} music
2. Maintain the ${mood} mood throughout
3. Include clear section labels (Verse 1, Chorus, etc.)
4. Use vivid imagery and emotional language
5. Make the chorus catchy and memorable
6. Include rhyme schemes appropriate for the genre
7. Create lyrics that flow well when sung
8. Avoid cliches while staying true to genre conventions

Write complete song lyrics with all sections clearly labeled.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a talented songwriter who creates emotionally resonant, original song lyrics across all genres.',
        temperature: 0.9,
        maxTokens: 2000,
      });

      if (response.success && response.data?.text) {
        setLyrics(response.data.text);
      } else {
        setError(response.error || 'Failed to generate lyrics');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!lyrics) return;

    setIsSaving(true);
    try {
      await saveToolData({
        toolId: 'song-lyrics',
        title: `Song Lyrics: ${topic}`,
        content: lyrics,
        contentType: 'text',
        metadata: {
          type: 'song_lyrics',
          topic,
          genre,
          mood,
          structure,
          inspirations,
          additionalNotes,
          lyrics,
        },
      });

      // Call onSaveCallback if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }

      setValidationMessage('Lyrics saved successfully!');
      setTimeout(() => setValidationMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save lyrics');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-pink-900/20' : 'from-white to-pink-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Music className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.songLyrics.songLyricsGenerator', 'Song Lyrics Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.songLyrics.createOriginalSongLyricsFor', 'Create original song lyrics for any genre')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.songLyrics.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.songLyrics.topicTheme', 'Topic/Theme *')}</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.songLyrics.whatShouldTheSongBe', 'What should the song be about? (e.g., falling in love, overcoming struggles, summer memories)')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.songLyrics.genre', 'Genre')}</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.songLyrics.mood', 'Mood')}</label>
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
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.songLyrics.songStructure', 'Song Structure')}</label>
          <select
            value={structure}
            onChange={(e) => setStructure(e.target.value)}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          >
            {structures.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.songLyrics.artistInspirationsOptional', 'Artist Inspirations (Optional)')}</label>
          <input
            type="text"
            value={inspirations}
            onChange={(e) => setInspirations(e.target.value)}
            placeholder={t('tools.songLyrics.eGTaylorSwiftEd', 'e.g., Taylor Swift, Ed Sheeran, The Beatles')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.songLyrics.additionalNotesOptional', 'Additional Notes (Optional)')}</label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={t('tools.songLyrics.anySpecificPhrasesRhymeSchemes', 'Any specific phrases, rhyme schemes, or ideas you want included...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5" />}
          {isGenerating ? t('tools.songLyrics.writingLyrics', 'Writing Lyrics...') : t('tools.songLyrics.generateLyrics', 'Generate Lyrics')}
        </button>

        {lyrics && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Music className="w-4 h-4" /> Your Lyrics
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('tools.songLyrics.copied', 'Copied!') : t('tools.songLyrics.copy', 'Copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
            <div className={`p-6 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl`}>
              <pre className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-sans leading-relaxed`}>{lyrics}</pre>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default SongLyricsTool;
