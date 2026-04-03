import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, Loader2, Copy, Check, Sparkles, Save, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useTheme } from '../../contexts/ThemeContext';

interface GeneratedBlogPost {
  content: string;
  title: string;
  timestamp: Date;
}

const writingStyles = [
  { label: 'Informative', value: 'informative' },
  { label: 'Conversational', value: 'conversational' },
  { label: 'Professional', value: 'professional' },
  { label: 'Storytelling', value: 'storytelling' },
  { label: 'Listicle', value: 'listicle' },
  { label: 'How-to Guide', value: 'how_to' },
];

const targetAudiences = [
  { label: 'General Audience', value: 'general' },
  { label: 'Business Professionals', value: 'business' },
  { label: 'Tech Enthusiasts', value: 'tech' },
  { label: 'Students', value: 'students' },
  { label: 'Entrepreneurs', value: 'entrepreneurs' },
  { label: 'Beginners', value: 'beginners' },
];

interface BlogPostGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const BlogPostGeneratorTool = ({ uiConfig }: BlogPostGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState(targetAudiences[0]);
  const [writingStyle, setWritingStyle] = useState(writingStyles[0]);
  const [keywords, setKeywords] = useState('');
  const [seoFocus, setSeoFocus] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlogPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle prefill from conversation or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.title || params.topic) {
          setTitle(params.title || params.topic);
          hasPrefill = true;
        }
        if (params.keywords) {
          setKeywords(params.keywords);
          hasPrefill = true;
        }
        if (params.seoFocus) {
          setSeoFocus(params.seoFocus);
          hasPrefill = true;
        }
        if (params.additionalContext) {
          setAdditionalContext(params.additionalContext);
          hasPrefill = true;
        }
        if (params.writingStyle) {
          const foundStyle = writingStyles.find(s => s.value === params.writingStyle);
          if (foundStyle) {
            setWritingStyle(foundStyle);
            hasPrefill = true;
          }
        }
        if (params.targetAudience) {
          const foundAudience = targetAudiences.find(a => a.value === params.targetAudience);
          if (foundAudience) {
            setTargetAudience(foundAudience);
            hasPrefill = true;
          }
        }
        // Restore the generated blog post
        if (params.text) {
          setGeneratedBlog({
            content: params.text,
            title: params.title || params.topic || '',
            timestamp: new Date(),
          });
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.title || params.topic) {
          setTitle(params.title || params.topic);
          hasPrefill = true;
        }
        if (params.keywords) {
          setKeywords(params.keywords);
          hasPrefill = true;
        }
        if (params.seoFocus) {
          setSeoFocus(params.seoFocus);
          hasPrefill = true;
        }
        if (params.additionalContext) {
          setAdditionalContext(params.additionalContext);
          hasPrefill = true;
        }
        if (params.writingStyle) {
          const foundStyle = writingStyles.find(s => s.value === params.writingStyle);
          if (foundStyle) {
            setWritingStyle(foundStyle);
            hasPrefill = true;
          }
        }
        if (params.targetAudience) {
          const foundAudience = targetAudiences.find(a => a.value === params.targetAudience);
          if (foundAudience) {
            setTargetAudience(foundAudience);
            hasPrefill = true;
          }
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Please enter a blog post title or topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Write a blog post with the following specifications:

Title/Topic: ${title}
Target Audience: ${targetAudience.label}
Writing Style: ${writingStyle.label}
${keywords ? `Keywords to Include: ${keywords}` : ''}
${seoFocus ? `SEO Focus: ${seoFocus}` : ''}
${additionalContext ? `Additional Context:\n${additionalContext}` : ''}

Please write a complete, engaging blog post with:
- A compelling introduction
- Well-structured body sections with subheadings
- Engaging and informative content
- A strong conclusion
- Natural keyword integration for SEO`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert blog writer and SEO specialist. Write engaging, well-structured blog posts optimized for search engines. Always provide complete blog content with introduction, body sections, and conclusion.',
        temperature: 0.7,
        maxTokens: 4000,
      });

      // Check for API error response
      if (response.success === false) {
        throw new Error(response.error || 'Failed to generate blog post');
      }

      // Extract content from various possible response structures
      let blogContent = '';
      if (response.data && typeof response.data.text === 'string') {
        blogContent = response.data.text;
      } else if (typeof response.text === 'string') {
        blogContent = response.text;
      } else if (response.data && typeof response.data.content === 'string') {
        blogContent = response.data.content;
      } else if (typeof response.content === 'string') {
        blogContent = response.content;
      } else if (typeof response.data === 'string') {
        blogContent = response.data;
      } else if (typeof response === 'string') {
        blogContent = response;
      }

      blogContent = blogContent.trim();

      if (!blogContent) {
        throw new Error('No blog content was generated. The AI service may be unavailable or you may have reached your usage limit. Please try again later.');
      }

      // Validate content has sufficient length
      if (blogContent.length < 100) {
        throw new Error('Generated blog post is too short. Please try again with more detailed input.');
      }

      setGeneratedBlog({
        content: blogContent,
        title,
        timestamp: new Date(),
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blog post');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedBlog) return;

    setIsSaving(true);
    try {
      // Save to content library for Gallery view
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Blog Post: ${generatedBlog.title}`,
        prompt: `Blog post about ${generatedBlog.title}`,
        metadata: {
          text: generatedBlog.content,
          toolId: 'blog-post-generator',
          title: generatedBlog.title,
          writingStyle: writingStyle.value,
          targetAudience: targetAudience.value,
          keywords,
          seoFocus,
          additionalContext,
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

  const handleCopy = async () => {
    if (!generatedBlog) return;

    const fullBlog = `# ${generatedBlog.title}\n\n${generatedBlog.content}`;
    await navigator.clipboard.writeText(fullBlog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Newspaper className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.blogPostGenerator.aiBlogPostGenerator', 'AI Blog Post Generator')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tools.blogPostGenerator.createSeoOptimizedBlogPosts', 'Create SEO-optimized blog posts with AI')}
            </p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{isEditFromGallery ? t('tools.blogPostGenerator.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.blogPostGenerator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.blogPostGenerator.blogPostTitleTopic', 'Blog Post Title/Topic')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('tools.blogPostGenerator.10TipsForBetterProductivity', '10 Tips for Better Productivity in Remote Work')}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Writing Style & Target Audience Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Writing Style */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.blogPostGenerator.writingStyle', 'Writing Style')}
            </label>
            <select
              value={writingStyle.value}
              onChange={(e) => {
                const selected = writingStyles.find((s) => s.value === e.target.value);
                if (selected) setWritingStyle(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {writingStyles.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.blogPostGenerator.targetAudience', 'Target Audience')}
            </label>
            <select
              value={targetAudience.value}
              onChange={(e) => {
                const selected = targetAudiences.find((a) => a.value === e.target.value);
                if (selected) setTargetAudience(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {targetAudiences.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Keywords Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.blogPostGenerator.keywordsOptional', 'Keywords (Optional)')}
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('tools.blogPostGenerator.remoteWorkProductivityTimeManagement', 'remote work, productivity, time management')}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('tools.blogPostGenerator.separateKeywordsWithCommas', 'Separate keywords with commas')}
          </p>
        </div>

        {/* SEO Focus Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.blogPostGenerator.seoFocusKeywordOptional', 'SEO Focus Keyword (Optional)')}
          </label>
          <input
            type="text"
            value={seoFocus}
            onChange={(e) => setSeoFocus(e.target.value)}
            placeholder={t('tools.blogPostGenerator.remoteProductivityTips', 'remote productivity tips')}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Additional Context Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.blogPostGenerator.additionalContextOptional', 'Additional Context (Optional)')}
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder={t('tools.blogPostGenerator.anySpecificPointsExamplesOr', 'Any specific points, examples, or details you want to include...')}
            rows={3}
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
          disabled={isGenerating || !title.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.blogPostGenerator.generatingBlogPost', 'Generating Blog Post...')}
            </>
          ) : (
            <>
              <Newspaper className="w-5 h-5" />
              {t('tools.blogPostGenerator.generateBlogPost', 'Generate Blog Post')}
            </>
          )}
        </button>

        {/* Generated Blog Post Display */}
        {generatedBlog && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                Generated Blog Post
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {t('tools.blogPostGenerator.editable', 'Editable')}
                </span>
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.blogPostGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.blogPostGenerator.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t('tools.blogPostGenerator.copied', 'Copied!')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('tools.blogPostGenerator.copy', 'Copy')}
                    </>
                  )}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-teal-900/30 hover:bg-teal-900/50 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'} rounded-lg transition-colors text-sm disabled:opacity-50`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.blogPostGenerator.save', 'Save')}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('tools.blogPostGenerator.title', 'Title:')}</p>
                <input
                  type="text"
                  value={generatedBlog.title}
                  onChange={(e) => setGeneratedBlog({ ...generatedBlog, title: e.target.value })}
                  className="w-full text-gray-900 dark:text-white font-medium text-lg bg-transparent border-none outline-none focus:ring-0"
                />
              </div>
              <textarea
                value={generatedBlog.content}
                onChange={(e) => setGeneratedBlog({ ...generatedBlog, content: e.target.value })}
                rows={12}
                className={`w-full p-0 border-none ${theme === 'dark' ? 'bg-transparent text-gray-200' : 'bg-transparent text-gray-700'} focus:ring-0 outline-none transition-all resize-y leading-relaxed`}
                placeholder={t('tools.blogPostGenerator.generatedBlogPostWillAppear', 'Generated blog post will appear here...')}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedBlog && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.blogPostGenerator.yourGeneratedBlogPostWill', 'Your generated blog post will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostGeneratorTool;
