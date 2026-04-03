import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Loader2, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const summaryTypes = [
  { value: 'brief', label: 'Brief Overview (1-2 paragraphs)' },
  { value: 'detailed', label: 'Detailed Summary (full chapter breakdown)' },
  { value: 'key-points', label: 'Key Points & Takeaways' },
  { value: 'chapter', label: 'Chapter-by-Chapter Summary' },
];

const genres = [
  { value: 'fiction', label: 'Fiction/Novel' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'self-help', label: 'Self-Help/Personal Development' },
  { value: 'business', label: 'Business/Finance' },
  { value: 'biography', label: 'Biography/Memoir' },
  { value: 'science', label: 'Science/Technology' },
  { value: 'history', label: 'History' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'academic', label: 'Academic/Textbook' },
];

const audienceOptions = [
  { value: 'general', label: 'General Reader' },
  { value: 'student', label: 'Student/Academic' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual Reader' },
];

interface BookSummaryToolProps {
  uiConfig?: UIConfig;
}

export const BookSummaryTool: React.FC<BookSummaryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('non-fiction');
  const [summaryType, setSummaryType] = useState('key-points');
  const [audience, setAudience] = useState('general');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        bookTitle?: string;
        author?: string;
        genre?: string;
        summaryType?: string;
        audience?: string;
        additionalContext?: string;
      };
      if (params.bookTitle) setBookTitle(params.bookTitle);
      if (params.author) setAuthor(params.author);
      if (params.genre && genres.some(g => g.value === params.genre)) setGenre(params.genre);
      if (params.summaryType && summaryTypes.some(s => s.value === params.summaryType)) setSummaryType(params.summaryType);
      if (params.audience && audienceOptions.some(a => a.value === params.audience)) setAudience(params.audience);
      if (params.additionalContext) setAdditionalContext(params.additionalContext);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const handleGenerate = async () => {
    if (!bookTitle.trim()) {
      setError('Please enter a book title');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const genreLabel = genres.find(g => g.value === genre)?.label;
      const summaryLabel = summaryTypes.find(s => s.value === summaryType)?.label;
      const audienceLabel = audienceOptions.find(a => a.value === audience)?.label;

      const prompt = `Create a ${summaryLabel} for the book "${bookTitle}"${author ? ` by ${author}` : ''}.

Book Genre: ${genreLabel}
Target Audience: ${audienceLabel}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Please provide:
${summaryType === 'brief' ? `
1. A concise overview of the book's main theme and plot/content
2. The central message or thesis
3. Why this book matters` : ''}
${summaryType === 'detailed' ? `
1. Introduction and overview
2. Main themes and arguments
3. Key characters or concepts (if applicable)
4. Plot progression or chapter flow
5. Climax/key revelations
6. Conclusion and takeaways
7. Critical reception/significance` : ''}
${summaryType === 'key-points' ? `
1. 5-10 key takeaways from the book
2. Main arguments or themes
3. Memorable quotes or ideas
4. Practical applications or lessons
5. Who should read this book and why` : ''}
${summaryType === 'chapter' ? `
A chapter-by-chapter breakdown including:
- Each major section/chapter's main content
- Key points from each chapter
- How chapters connect to form the whole
- Final summary and overall message` : ''}

Write in an engaging, ${audience === 'academic' ? 'scholarly' : audience === 'professional' ? 'professional' : 'accessible'} style.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a literary expert who provides insightful, accurate book summaries. You have extensive knowledge of books across all genres and can capture the essence of any book while making it accessible to the target audience.',
        temperature: 0.7,
        maxTokens: 2500,
      });

      if (response.success && response.data?.text) {
        setSummary(response.data.text);
      } else {
        setError(response.error || 'Failed to generate book summary');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (summary) {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.bookSummary.bookSummary', 'Book Summary')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bookSummary.getComprehensiveSummariesOfAny', 'Get comprehensive summaries of any book')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.bookSummary.bookDetailsLoadedFromYour', 'Book details loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookSummary.bookTitle', 'Book Title *')}</label>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder={t('tools.bookSummary.eGAtomicHabits', 'e.g., Atomic Habits')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookSummary.authorOptional', 'Author (Optional)')}</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={t('tools.bookSummary.eGJamesClear', 'e.g., James Clear')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookSummary.genre', 'Genre')}</label>
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
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookSummary.summaryType', 'Summary Type')}</label>
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {summaryTypes.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookSummary.audience', 'Audience')}</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {audienceOptions.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.bookSummary.additionalContextOptional', 'Additional Context (Optional)')}</label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder={t('tools.bookSummary.anySpecificAspectsYouWant', 'Any specific aspects you want covered? Focus areas?')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !bookTitle.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
          {isGenerating ? t('tools.bookSummary.generatingSummary', 'Generating Summary...') : t('tools.bookSummary.generateBookSummary', 'Generate Book Summary')}
        </button>

        {summary && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Summary: {bookTitle}{author ? ` by ${author}` : ''}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.bookSummary.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('tools.bookSummary.copied', 'Copied!') : t('tools.bookSummary.copy', 'Copy')}
                </button>
              </div>
            </div>
            <div className={`p-5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-xl`}>
              <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
                <div className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {summary}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSummaryTool;
