import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Loader2, Download, RefreshCw, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const genres = [
  { value: 'fiction', label: 'Fiction/Literary' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller/Mystery' },
  { value: 'scifi', label: 'Science Fiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'horror', label: 'Horror' },
  { value: 'nonfiction', label: 'Non-Fiction' },
  { value: 'selfhelp', label: 'Self-Help' },
  { value: 'business', label: 'Business' },
  { value: 'biography', label: 'Biography/Memoir' },
  { value: 'children', label: "Children's Book" },
  { value: 'young-adult', label: 'Young Adult' },
  { value: 'poetry', label: 'Poetry' },
  { value: 'cookbook', label: 'Cookbook' },
];

const coverStyles = [
  { value: 'modern', label: 'Modern/Minimalist' },
  { value: 'classic', label: 'Classic/Traditional' },
  { value: 'illustrated', label: 'Illustrated' },
  { value: 'photographic', label: 'Photographic' },
  { value: 'typography', label: 'Typography-Focused' },
  { value: 'artistic', label: 'Artistic/Abstract' },
  { value: 'dramatic', label: 'Dramatic/Cinematic' },
];

interface BookCoverToolProps {
  uiConfig?: UIConfig;
}

export const BookCoverTool: React.FC<BookCoverToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [genre, setGenre] = useState('fiction');
  const [coverStyle, setCoverStyle] = useState('modern');
  const [description, setDescription] = useState('');
  const [colorScheme, setColorScheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
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
        if (params.bookTitle) {
          setBookTitle(params.bookTitle);
          hasPrefill = true;
        }
        if (params.authorName) {
          setAuthorName(params.authorName);
          hasPrefill = true;
        }
        if (params.genre && genres.some(g => g.value === params.genre)) {
          setGenre(params.genre);
          hasPrefill = true;
        }
        if (params.coverStyle && coverStyles.some(s => s.value === params.coverStyle)) {
          setCoverStyle(params.coverStyle);
          hasPrefill = true;
        }
        if (params.description) {
          setDescription(params.description);
          hasPrefill = true;
        }
        if (params.colorScheme) {
          setColorScheme(params.colorScheme);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setCoverImage(params.imageUrl);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        if (params.bookTitle) setBookTitle(params.bookTitle);
        if (params.authorName) setAuthorName(params.authorName);
        if (params.genre && genres.some(g => g.value === params.genre)) setGenre(params.genre);
        if (params.coverStyle && coverStyles.some(s => s.value === params.coverStyle)) setCoverStyle(params.coverStyle);
        if (params.description) setDescription(params.description);
        if (params.colorScheme) setColorScheme(params.colorScheme);
        hasPrefill = params.bookTitle || params.authorName || params.genre || params.coverStyle || params.description || params.colorScheme;
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
        title: `Book Cover: ${bookTitle || 'Untitled'}`,
        prompt: bookTitle,
        metadata: {
          toolId: 'book-cover',
          bookTitle: bookTitle,
          authorName: authorName,
          genre: genre,
          coverStyle: coverStyle,
          description: description,
          colorScheme: colorScheme,
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
    if (!bookTitle.trim()) {
      setError('Please enter a book title');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const genreText = genres.find(g => g.value === genre)?.label;
      const styleText = coverStyles.find(s => s.value === coverStyle)?.label;

      const prompt = `Professional book cover design for a ${genreText} book titled "${bookTitle}"${authorName ? ` by ${authorName}` : ''}. Style: ${styleText}. ${description ? `Book description: ${description}.` : ''} ${colorScheme ? `Color scheme: ${colorScheme}.` : ''} The design should be eye-catching, professional, and suitable for a bookstore display. High-quality, polished book cover that conveys the genre and mood effectively. Standard book cover proportions (2:3 ratio).`;

      const response = await api.post('/ai/image/generate', {
        prompt,
        style: 'photo',
        aspectRatio: '2:3',
      });

      if (response.success && response.data?.url) {
        setCoverImage(response.data.url);
      } else {
        setError(response.error || 'Failed to generate cover');
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
      a.download = `book-cover-${bookTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
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
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-amber-900/20' : 'from-white to-amber-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.bookCover.bookCoverGenerator', 'Book Cover Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bookCover.createProfessionalBookCoversWith', 'Create professional book covers with AI')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{isEditFromGallery ? t('tools.bookCover.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.bookCover.bookDetailsLoadedFromYour', 'Book details loaded from your conversation')}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookCover.bookTitle', 'Book Title *')}</label>
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder={t('tools.bookCover.enterYourBookTitle', 'Enter your book title')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookCover.authorName', 'Author Name')}</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={t('tools.bookCover.authorName2', 'Author name')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookCover.genre', 'Genre')}</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {genres.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookCover.coverStyle', 'Cover Style')}</label>
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
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookCover.bookDescription', 'Book Description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('tools.bookCover.briefDescriptionOrThemeOf', 'Brief description or theme of the book...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookCover.colorSchemeOptional', 'Color Scheme (Optional)')}</label>
          <input
            type="text"
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value)}
            placeholder={t('tools.bookCover.eGDarkAndMoody', 'e.g., dark and moody, vibrant, pastel, gold and black')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !bookTitle.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
          {isGenerating ? t('tools.bookCover.generatingCover', 'Generating Cover...') : t('tools.bookCover.generateBookCover', 'Generate Book Cover')}
        </button>

        {coverImage && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.bookCover.yourBookCover', 'Your Book Cover')}</h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.bookCover.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.bookCover.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.bookCover.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  {t('tools.bookCover.download', 'Download')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.bookCover.save', 'Save')}
                </button>
              </div>
            </div>
            <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} rounded-xl overflow-hidden max-w-sm mx-auto`}>
              <img src={coverImage} alt="Generated book cover" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCoverTool;
