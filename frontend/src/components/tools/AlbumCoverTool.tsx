import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Disc3, Loader2, Download, RefreshCw, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const musicGenres = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'hiphop', label: 'Hip-Hop/Rap' },
  { value: 'rnb', label: 'R&B/Soul' },
  { value: 'electronic', label: 'Electronic/EDM' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'country', label: 'Country' },
  { value: 'indie', label: 'Indie/Alternative' },
  { value: 'metal', label: 'Metal/Heavy' },
  { value: 'folk', label: 'Folk/Acoustic' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'latin', label: 'Latin' },
  { value: 'kpop', label: 'K-Pop' },
];

const coverStyles = [
  { value: 'photography', label: 'Photography-based' },
  { value: 'illustration', label: 'Illustration/Art' },
  { value: 'abstract', label: 'Abstract/Geometric' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'vintage', label: 'Vintage/Retro' },
  { value: 'collage', label: 'Collage/Mixed Media' },
  { value: 'typography', label: 'Typography-focused' },
  { value: 'surreal', label: 'Surreal/Psychedelic' },
  { value: 'portrait', label: 'Artist Portrait' },
];

const moods = [
  { value: 'energetic', label: 'Energetic/Upbeat' },
  { value: 'melancholic', label: 'Melancholic/Sad' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'dark', label: 'Dark/Moody' },
  { value: 'chill', label: 'Chill/Relaxed' },
  { value: 'epic', label: 'Epic/Dramatic' },
  { value: 'fun', label: 'Fun/Playful' },
  { value: 'mysterious', label: 'Mysterious' },
];

interface AlbumCoverToolProps {
  uiConfig?: UIConfig;
}

export const AlbumCoverTool: React.FC<AlbumCoverToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [albumTitle, setAlbumTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('pop');
  const [coverStyle, setCoverStyle] = useState('photography');
  const [mood, setMood] = useState('energetic');
  const [visualElements, setVisualElements] = useState('');
  const [colorPalette, setColorPalette] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.albumTitle) {
          setAlbumTitle(params.albumTitle);
          hasPrefill = true;
        }
        if (params.artistName) {
          setArtistName(params.artistName);
          hasPrefill = true;
        }
        if (params.genre) {
          setGenre(params.genre);
          hasPrefill = true;
        }
        if (params.coverStyle) {
          setCoverStyle(params.coverStyle);
          hasPrefill = true;
        }
        if (params.mood) {
          setMood(params.mood);
          hasPrefill = true;
        }
        if (params.visualElements) {
          setVisualElements(params.visualElements);
          hasPrefill = true;
        }
        if (params.colorPalette) {
          setColorPalette(params.colorPalette);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setCoverImage(params.imageUrl);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        if (params.content) {
          setAlbumTitle(params.content);
          hasPrefill = true;
        }
        if (params.text) {
          setVisualElements(params.text);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleSave = async () => {
    if (!coverImage) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: coverImage,
        title: `Album Cover: ${albumTitle || 'Untitled'}`,
        prompt: albumTitle,
        metadata: {
          toolId: 'album-cover',
          albumTitle: albumTitle,
          artistName: artistName,
          genre: genre,
          coverStyle: coverStyle,
          mood: mood,
          visualElements: visualElements,
          colorPalette: colorPalette,
          imageUrl: coverImage,
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
    if (!albumTitle.trim()) {
      setError('Please enter an album title');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const genreText = musicGenres.find(g => g.value === genre)?.label;
      const styleText = coverStyles.find(s => s.value === coverStyle)?.label;
      const moodText = moods.find(m => m.value === mood)?.label;

      const prompt = `Professional album cover artwork for a ${genreText} album titled "${albumTitle}"${artistName ? ` by ${artistName}` : ''}. Style: ${styleText}. Mood: ${moodText}. ${visualElements ? `Visual elements: ${visualElements}.` : ''} ${colorPalette ? `Color palette: ${colorPalette}.` : ''} The design should be striking, memorable, and suitable for streaming platforms and physical releases. Square format (1:1), high-quality album cover art that captures the essence of the music.`;

      const response = await api.post('/ai/image/generate', {
        prompt,
        style: 'artistic',
        aspectRatio: '1:1',
      });

      if (response.success && response.data?.url) {
        setCoverImage(response.data.url);
      } else {
        setError(response.error || 'Failed to generate album cover');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!coverImage) return;

    try {
      const response = await fetch(coverImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `album-cover-${albumTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
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
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-fuchsia-900/20' : 'from-white to-fuchsia-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fuchsia-500/10 rounded-lg">
            <Disc3 className="w-5 h-5 text-fuchsia-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.albumCover.albumCoverGenerator', 'Album Cover Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.albumCover.createStunningAlbumArtworkWith', 'Create stunning album artwork with AI')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{isEditFromGallery ? t('tools.albumCover.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.albumCover.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.albumCover.albumTitle', 'Album Title *')}</label>
            <input
              type="text"
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              placeholder={t('tools.albumCover.enterAlbumTitle', 'Enter album title')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.albumCover.artistName', 'Artist Name')}</label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder={t('tools.albumCover.artistOrBandName', 'Artist or band name')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.albumCover.genre', 'Genre')}</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {musicGenres.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.albumCover.coverStyle', 'Cover Style')}</label>
            <select
              value={coverStyle}
              onChange={(e) => setCoverStyle(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {coverStyles.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.albumCover.mood', 'Mood')}</label>
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
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.albumCover.visualElementsOptional', 'Visual Elements (Optional)')}</label>
          <textarea
            value={visualElements}
            onChange={(e) => setVisualElements(e.target.value)}
            placeholder={t('tools.albumCover.describeSpecificImageryYouWant', 'Describe specific imagery you want (e.g., neon city, forest, abstract shapes, artist silhouette)')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.albumCover.colorPaletteOptional', 'Color Palette (Optional)')}</label>
          <input
            type="text"
            value={colorPalette}
            onChange={(e) => setColorPalette(e.target.value)}
            placeholder={t('tools.albumCover.eGNeonPinkAnd', 'e.g., neon pink and blue, earth tones, black and gold')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !albumTitle.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Disc3 className="w-5 h-5" />}
          {isGenerating ? t('tools.albumCover.creatingCover', 'Creating Cover...') : t('tools.albumCover.generateAlbumCover', 'Generate Album Cover')}
        </button>

        {coverImage && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.albumCover.yourAlbumCover', 'Your Album Cover')}</h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.albumCover.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.albumCover.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.albumCover.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  {t('tools.albumCover.download', 'Download')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.albumCover.save', 'Save')}
                </button>
              </div>
            </div>
            <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} rounded-xl overflow-hidden max-w-md mx-auto shadow-lg`}>
              <img src={coverImage} alt="Generated album cover" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumCoverTool;
