import React, { useState, useEffect } from 'react';
import { BookOpen, Copy, Check, RefreshCw, Sparkles, Quote, List, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type SummaryStyle = 'executive' | 'detailed' | 'actionable' | 'students' | 'quick';
type BookGenre = 'business' | 'selfhelp' | 'psychology' | 'biography' | 'science' | 'history' | 'philosophy' | 'fiction' | 'general';

interface BookSummarySection {
  title: string;
  content: string;
}

interface SummaryTemplate {
  sections: {
    title: string;
    template: string;
  }[];
  style: SummaryStyle;
}

const summaryTemplates: Record<SummaryStyle, SummaryTemplate> = {
  executive: {
    sections: [
      { title: 'One-Sentence Summary', template: '"{book_title}" by {author} is a {genre} book that explores {main_theme}, offering insights into {key_topic} for {target_audience}.' },
      { title: 'Key Premise', template: 'The central argument of the book is that {premise}. {author} builds this case through {approach}, drawing on {evidence_type}.' },
      { title: 'Core Ideas (3 Big Takeaways)', template: '1. {takeaway_1}\n\n2. {takeaway_2}\n\n3. {takeaway_3}' },
      { title: 'Why It Matters', template: 'This book is relevant for professionals because {relevance}. In today\'s context, {contemporary_application}.' },
      { title: 'Bottom Line', template: 'Read this if you {ideal_reader}. Skip if you {not_ideal_reader}. Rating: {rating}/5 for {genre} readers.' },
    ],
    style: 'executive',
  },
  detailed: {
    sections: [
      { title: 'Overview', template: '"{book_title}" by {author} ({publication_year}) is a landmark work in the {genre} genre. The book spans {scope} and provides a comprehensive examination of {main_theme}.' },
      { title: 'About the Author', template: '{author} is {author_background}. Their perspective is shaped by {author_experience}, which lends credibility to the book\'s arguments about {key_topic}.' },
      { title: 'Chapter-by-Chapter Breakdown', template: 'Part 1: {part_1_summary}\n\nPart 2: {part_2_summary}\n\nPart 3: {part_3_summary}' },
      { title: 'Key Themes & Arguments', template: 'Theme 1 - {theme_1}: {theme_1_explanation}\n\nTheme 2 - {theme_2}: {theme_2_explanation}\n\nTheme 3 - {theme_3}: {theme_3_explanation}' },
      { title: 'Notable Quotes', template: '"{quote_1}"\n\n"{quote_2}"\n\n"{quote_3}"' },
      { title: 'Critical Analysis', template: 'Strengths: {strengths}\n\nWeaknesses: {weaknesses}\n\nCompared to similar works: {comparison}' },
      { title: 'Conclusion', template: 'Overall, "{book_title}" succeeds in {achievement}. It is most valuable for readers who {ideal_reader}.' },
    ],
    style: 'detailed',
  },
  actionable: {
    sections: [
      { title: 'The Book in 30 Seconds', template: '"{book_title}" teaches you how to {main_skill}. The core message: {core_message}.' },
      { title: 'Key Frameworks', template: 'Framework 1: {framework_1}\n- Step 1: {f1_step1}\n- Step 2: {f1_step2}\n- Step 3: {f1_step3}\n\nFramework 2: {framework_2}\n- How to apply: {f2_application}' },
      { title: 'Action Items', template: 'Start doing:\n- {action_1}\n- {action_2}\n- {action_3}\n\nStop doing:\n- {stop_1}\n- {stop_2}\n\nKey habit to build: {key_habit}' },
      { title: 'Implementation Plan', template: 'Week 1: {week_1}\nWeek 2-4: {week_2_4}\nOngoing: {ongoing}' },
      { title: 'Metrics to Track', template: 'Track these to measure progress:\n1. {metric_1}\n2. {metric_2}\n3. {metric_3}' },
    ],
    style: 'actionable',
  },
  students: {
    sections: [
      { title: 'Basic Information', template: 'Title: "{book_title}"\nAuthor: {author}\nGenre: {genre}\nMain Topic: {main_theme}' },
      { title: 'Plot/Content Summary', template: 'This book is about {simple_summary}. It begins with {beginning}, continues with {middle}, and concludes with {ending}.' },
      { title: 'Main Characters/Figures', template: '{character_1}: {character_1_description}\n\n{character_2}: {character_2_description}' },
      { title: 'Key Themes', template: '1. {theme_1} - {theme_1_simple}\n2. {theme_2} - {theme_2_simple}\n3. {theme_3} - {theme_3_simple}' },
      { title: 'Important Quotes', template: 'Quote 1: "{quote_1}"\nMeaning: {quote_1_meaning}\n\nQuote 2: "{quote_2}"\nMeaning: {quote_2_meaning}' },
      { title: 'Discussion Questions', template: '1. {question_1}\n2. {question_2}\n3. {question_3}' },
      { title: 'Personal Reflection', template: 'What I learned: {personal_learning}\nHow this connects to life: {life_connection}' },
    ],
    style: 'students',
  },
  quick: {
    sections: [
      { title: 'TL;DR', template: '"{book_title}" = {one_line_summary}' },
      { title: '3 Key Points', template: '1. {point_1}\n2. {point_2}\n3. {point_3}' },
      { title: 'Best Quote', template: '"{best_quote}"' },
      { title: 'Who Should Read', template: 'Perfect for: {who_should_read}\nSkip if: {who_should_skip}' },
      { title: 'Rating', template: '{rating}/5 - {rating_reason}' },
    ],
    style: 'quick',
  },
};

const genreDefaults: Record<BookGenre, { theme: string; approach: string; audience: string }> = {
  business: { theme: 'organizational success and strategic thinking', approach: 'case studies and business frameworks', audience: 'entrepreneurs and business leaders' },
  selfhelp: { theme: 'personal development and self-improvement', approach: 'actionable strategies and psychological insights', audience: 'anyone seeking personal growth' },
  psychology: { theme: 'human behavior and mental processes', approach: 'research findings and theoretical frameworks', audience: 'students and curious minds' },
  biography: { theme: 'life lessons and historical significance', approach: 'narrative storytelling and historical analysis', audience: 'history enthusiasts and leaders' },
  science: { theme: 'scientific discovery and understanding', approach: 'evidence-based explanations and research', audience: 'science enthusiasts and lifelong learners' },
  history: { theme: 'historical events and their impact', approach: 'primary sources and scholarly analysis', audience: 'history buffs and students' },
  philosophy: { theme: 'fundamental questions about existence and ethics', approach: 'logical arguments and thought experiments', audience: 'deep thinkers and philosophy students' },
  fiction: { theme: 'human experience through narrative', approach: 'character development and plot', audience: 'readers seeking entertainment and insight' },
  general: { theme: 'important ideas and insights', approach: 'accessible writing and examples', audience: 'general readers' },
};

interface AIBookSummaryToolProps {
  uiConfig?: UIConfig;
}

export const AIBookSummaryTool: React.FC<AIBookSummaryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<BookSummarySection[]>([]);

  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
    genre: 'general' as BookGenre,
    mainTheme: '',
    keyTakeaway1: '',
    keyTakeaway2: '',
    keyTakeaway3: '',
    favoriteQuote: '',
    rating: '4',
  });

  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>('executive');

  const generateSummary = () => {
    const template = summaryTemplates[summaryStyle];
    const genreInfo = genreDefaults[formData.genre];

    const bookTitle = formData.bookTitle || 'The Book Title';
    const author = formData.author || 'Author Name';
    const mainTheme = formData.mainTheme || genreInfo.theme;
    const takeaway1 = formData.keyTakeaway1 || 'First major insight or lesson from the book';
    const takeaway2 = formData.keyTakeaway2 || 'Second important concept or framework';
    const takeaway3 = formData.keyTakeaway3 || 'Third key takeaway for the reader';
    const quote = formData.favoriteQuote || 'A memorable quote from the book would go here.';
    const rating = formData.rating || '4';

    const replacements: Record<string, string> = {
      '{book_title}': bookTitle,
      '{author}': author,
      '{genre}': formData.genre,
      '{main_theme}': mainTheme,
      '{key_topic}': mainTheme,
      '{target_audience}': genreInfo.audience,
      '{premise}': takeaway1,
      '{approach}': genreInfo.approach,
      '{evidence_type}': 'research, examples, and case studies',
      '{takeaway_1}': takeaway1,
      '{takeaway_2}': takeaway2,
      '{takeaway_3}': takeaway3,
      '{relevance}': 'it provides practical frameworks for improvement',
      '{contemporary_application}': 'these ideas are more relevant than ever',
      '{ideal_reader}': 'want to deepen your understanding of ' + mainTheme,
      '{not_ideal_reader}': 'are looking for light entertainment',
      '{rating}': rating,
      '{publication_year}': '(Year)',
      '{scope}': 'multiple aspects of ' + mainTheme,
      '{author_background}': 'a recognized expert in their field',
      '{author_experience}': 'years of research and practice',
      '{part_1_summary}': 'Establishes the foundation and key concepts',
      '{part_2_summary}': 'Develops the main arguments with examples',
      '{part_3_summary}': 'Applies insights and provides actionable conclusions',
      '{theme_1}': 'Core Concept',
      '{theme_1_explanation}': takeaway1,
      '{theme_2}': 'Key Framework',
      '{theme_2_explanation}': takeaway2,
      '{theme_3}': 'Practical Application',
      '{theme_3_explanation}': takeaway3,
      '{quote_1}': quote,
      '{quote_2}': 'Another impactful quote from the book.',
      '{quote_3}': 'A third memorable passage.',
      '{strengths}': 'Clear writing, practical examples, well-researched',
      '{weaknesses}': 'Some sections could be more concise',
      '{comparison}': 'Stands out for its practical approach',
      '{achievement}': 'delivering valuable insights on ' + mainTheme,
      '{main_skill}': mainTheme.toLowerCase(),
      '{core_message}': takeaway1,
      '{framework_1}': 'Primary Framework',
      '{f1_step1}': 'Identify the opportunity',
      '{f1_step2}': 'Apply the method',
      '{f1_step3}': 'Iterate and improve',
      '{framework_2}': 'Secondary Framework',
      '{f2_application}': 'Use daily for best results',
      '{action_1}': takeaway1.split(' ').slice(0, 5).join(' ') + '...',
      '{action_2}': takeaway2.split(' ').slice(0, 5).join(' ') + '...',
      '{action_3}': takeaway3.split(' ').slice(0, 5).join(' ') + '...',
      '{stop_1}': 'Old habits that conflict with these ideas',
      '{stop_2}': 'Procrastination on implementation',
      '{key_habit}': 'Daily application of the core framework',
      '{week_1}': 'Read and understand the key concepts',
      '{week_2_4}': 'Practice applying the frameworks',
      '{ongoing}': 'Review and refine your approach',
      '{metric_1}': 'Progress on main goal',
      '{metric_2}': 'Consistency of practice',
      '{metric_3}': 'Measurable outcomes',
      '{simple_summary}': mainTheme,
      '{beginning}': 'introducing the core concepts',
      '{middle}': 'developing the main ideas',
      '{ending}': 'practical conclusions',
      '{character_1}': author,
      '{character_1_description}': 'The author and expert guide',
      '{character_2}': 'The Reader',
      '{character_2_description}': 'You, learning and growing',
      '{theme_1_simple}': 'The main idea explained simply',
      '{theme_2_simple}': 'Supporting concept',
      '{theme_3_simple}': 'Practical takeaway',
      '{quote_1_meaning}': 'This emphasizes the importance of ' + mainTheme,
      '{quote_2_meaning}': 'A reminder of the core principles',
      '{question_1}': 'How does this apply to your life?',
      '{question_2}': 'What challenges might you face implementing these ideas?',
      '{question_3}': 'What other books explore similar themes?',
      '{personal_learning}': 'Key insights gained from reading',
      '{life_connection}': 'Ways to apply these lessons daily',
      '{one_line_summary}': takeaway1,
      '{point_1}': takeaway1,
      '{point_2}': takeaway2,
      '{point_3}': takeaway3,
      '{best_quote}': quote,
      '{who_should_read}': genreInfo.audience,
      '{who_should_skip}': 'those not interested in ' + mainTheme,
      '{rating_reason}': 'Excellent for ' + genreInfo.audience,
    };

    const sections: BookSummarySection[] = template.sections.map(section => {
      let content = section.template;
      Object.entries(replacements).forEach(([key, value]) => {
        content = content.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      });
      return {
        title: section.title,
        content,
      };
    });

    setGeneratedSummary(sections);
  };

  const getFullSummaryText = () => {
    let text = `BOOK SUMMARY: "${formData.bookTitle || 'Book Title'}" by ${formData.author || 'Author'}\n`;
    text += '='.repeat(50) + '\n\n';

    generatedSummary.forEach(section => {
      text += `## ${section.title}\n\n${section.content}\n\n`;
    });

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.bookTitle) setFormData(prev => ({ ...prev, bookTitle: params.bookTitle }));
      if (params.author) setFormData(prev => ({ ...prev, author: params.author }));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const summaryStyles: { value: SummaryStyle; label: string; desc: string }[] = [
    { value: 'executive', label: 'Executive', desc: 'Quick business-style summary' },
    { value: 'detailed', label: 'Detailed', desc: 'Comprehensive analysis' },
    { value: 'actionable', label: 'Actionable', desc: 'Focus on implementation' },
    { value: 'students', label: 'Student', desc: 'Academic format' },
    { value: 'quick', label: 'Quick', desc: 'TL;DR version' },
  ];

  const genres: { value: BookGenre; label: string }[] = [
    { value: 'business', label: 'Business' },
    { value: 'selfhelp', label: 'Self-Help' },
    { value: 'psychology', label: 'Psychology' },
    { value: 'biography', label: 'Biography' },
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'fiction', label: 'Fiction' },
    { value: 'general', label: 'General' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aIBookSummary.aiBookSummaryGenerator', 'AI Book Summary Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aIBookSummary.createComprehensiveBookSummariesAnd', 'Create comprehensive book summaries and notes')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aIBookSummary.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Style */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBookSummary.summaryStyle', 'Summary Style')}</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {summaryStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => setSummaryStyle(style.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  summaryStyle === style.value
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{style.label}</div>
                <div className={`text-xs ${summaryStyle === style.value ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>{style.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Book Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBookSummary.bookTitle', 'Book Title *')}</label>
            <input
              type="text"
              value={formData.bookTitle}
              onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
              placeholder={t('tools.aIBookSummary.eGAtomicHabits', 'e.g., Atomic Habits')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBookSummary.author', 'Author *')}</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder={t('tools.aIBookSummary.eGJamesClear', 'e.g., James Clear')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>
        </div>

        {/* Genre & Rating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBookSummary.genre', 'Genre')}</label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value as BookGenre })}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            >
              {genres.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBookSummary.yourRating', 'Your Rating')}</label>
            <div className="flex gap-2">
              {['1', '2', '3', '4', '5'].map((r) => (
                <button
                  key={r}
                  onClick={() => setFormData({ ...formData, rating: r })}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    formData.rating === r
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {r}/5
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Theme */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aIBookSummary.mainThemeTopic', 'Main Theme/Topic')}</label>
          <input
            type="text"
            value={formData.mainTheme}
            onChange={(e) => setFormData({ ...formData, mainTheme: e.target.value })}
            placeholder={t('tools.aIBookSummary.eGBuildingBetterHabits', 'e.g., Building better habits through small changes')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
        </div>

        {/* Key Takeaways */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Lightbulb className="w-4 h-4 inline mr-1" />
            {t('tools.aIBookSummary.keyTakeaways', 'Key Takeaways')}
          </label>
          <input
            type="text"
            value={formData.keyTakeaway1}
            onChange={(e) => setFormData({ ...formData, keyTakeaway1: e.target.value })}
            placeholder={t('tools.aIBookSummary.firstKeyLessonOrInsight', 'First key lesson or insight')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
          <input
            type="text"
            value={formData.keyTakeaway2}
            onChange={(e) => setFormData({ ...formData, keyTakeaway2: e.target.value })}
            placeholder={t('tools.aIBookSummary.secondKeyLessonOrInsight', 'Second key lesson or insight')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
          <input
            type="text"
            value={formData.keyTakeaway3}
            onChange={(e) => setFormData({ ...formData, keyTakeaway3: e.target.value })}
            placeholder={t('tools.aIBookSummary.thirdKeyLessonOrInsight', 'Third key lesson or insight')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
        </div>

        {/* Favorite Quote */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Quote className="w-4 h-4 inline mr-1" />
            {t('tools.aIBookSummary.favoriteQuoteOptional', 'Favorite Quote (Optional)')}
          </label>
          <textarea
            value={formData.favoriteQuote}
            onChange={(e) => setFormData({ ...formData, favoriteQuote: e.target.value })}
            placeholder={t('tools.aIBookSummary.aMemorableQuoteFromThe', 'A memorable quote from the book...')}
            rows={2}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none`}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateSummary}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aIBookSummary.generateSummary', 'Generate Summary')}
        </button>

        {/* Generated Summary */}
        {generatedSummary.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.aIBookSummary.generatedSummary', 'Generated Summary')}
              </span>
              <button
                onClick={handleCopy}
                className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('tools.aIBookSummary.copied', 'Copied!') : t('tools.aIBookSummary.copyAll', 'Copy All')}
              </button>
            </div>

            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              {/* Book Header */}
              <div className={`p-4 border-b ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-teal-50 border-gray-200'}`}>
                <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  "{formData.bookTitle || 'Book Title'}"
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  by {formData.author || 'Author'} | {formData.genre} | {formData.rating}/5
                </p>
              </div>

              {/* Sections */}
              <div className="p-4 space-y-6">
                {generatedSummary.map((section, index) => (
                  <div key={index}>
                    <h5 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                      <List className="w-4 h-4" />
                      {section.title}
                    </h5>
                    <div className={`whitespace-pre-line text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={generateSummary}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.aIBookSummary.regenerateSummary', 'Regenerate Summary')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {generatedSummary.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIBookSummary.enterBookDetailsToGenerate', 'Enter book details to generate a summary')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIBookSummaryTool;
