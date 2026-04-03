import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Copy, Loader2, Save, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const newsletterTypes = [
  { value: 'company_update', label: 'Company Update' },
  { value: 'industry_news', label: 'Industry News' },
  { value: 'product_announcement', label: 'Product Announcement' },
  { value: 'educational', label: 'Educational/Tips' },
  { value: 'promotional', label: 'Promotional/Sales' },
  { value: 'event', label: 'Event Announcement' },
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'exciting', label: 'Exciting & Energetic' },
  { value: 'informative', label: 'Informative & Educational' },
];

interface NewsletterToolProps {
  uiConfig?: UIConfig;
}

export const NewsletterTool: React.FC<NewsletterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [newsletterType, setNewsletterType] = useState(newsletterTypes[0].value);
  const [mainTopics, setMainTopics] = useState('');
  const [tone, setTone] = useState(tones[0].value);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeBody, setIncludeBody] = useState(true);
  const [includeCta, setIncludeCta] = useState(true);
  const [includeFooter, setIncludeFooter] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setMainTopics(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!mainTopics.trim()) {
      setError('Main topics/highlights are required');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const selectedType = newsletterTypes.find(t => t.value === newsletterType);
      const selectedTone = tones.find(t => t.value === tone);

      const sections = [];
      if (includeHeader) sections.push('header/subject line');
      if (includeBody) sections.push('main body content');
      if (includeCta) sections.push('call-to-action (CTA)');
      if (includeFooter) sections.push('footer');

      const prompt = `Generate a professional newsletter email with the following details:

Newsletter Type: ${selectedType?.label}
Main Topics/Highlights: ${mainTopics}
${companyName ? `Company Name: ${companyName}` : ''}
Tone: ${selectedTone?.label}

Please include the following sections:
${sections.join(', ')}

Requirements:
- Make it engaging and reader-friendly
- Use ${selectedTone?.label.toLowerCase()} tone throughout
- Format for email (use HTML-friendly formatting)
- Include clear section breaks
- Make it scannable with headings and bullet points where appropriate
${includeCta ? '- Include a compelling call-to-action' : ''}
- Keep it concise but informative
- Ensure email-friendly formatting (avoid complex layouts)

Please structure the newsletter professionally with clear sections marked by headings.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        maxTokens: 1800,
        temperature: 0.7,
      });

      if (response.data?.generatedText) {
        setOutput(response.data.generatedText);
      } else {
        setError('Failed to generate newsletter');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the newsletter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (!output) return;

    setIsSaving(true);
    setError(null);

    try {
      const selectedType = newsletterTypes.find(t => t.value === newsletterType);
      await api.post('/content', {
        content_type: 'text',
        title: `Newsletter - ${selectedType?.label} - ${mainTopics.substring(0, 50)}`,
        content: output,
        metadata: {
          newsletterType,
          mainTopics,
          tone,
          companyName,
          sections: {
            header: includeHeader,
            body: includeBody,
            cta: includeCta,
            footer: includeFooter,
          },
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setOutput('');
    setError(null);
    setSaveSuccess(false);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Mail className="w-6 h-6 text-[#0D9488]" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.newsletter.newsletterContentGenerator', 'Newsletter Content Generator')}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.newsletter.createEngagingNewsletterContentWith', 'Create engaging newsletter content with AI')}
            </p>
          </div>
        </div>
        {isPrefilled && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
            <span className="text-xs text-[#0D9488] font-medium">{t('tools.newsletter.prefilled', 'Prefilled')}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Newsletter Type */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.newsletter.newsletterType', 'Newsletter Type')}
            </label>
            <select
              value={newsletterType}
              onChange={(e) => setNewsletterType(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
            >
              {newsletterTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.newsletter.tone', 'Tone')}
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.newsletter.companyBrandNameOptional', 'Company/Brand Name (Optional)')}
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={t('tools.newsletter.eGAcmeCorporation', 'e.g., Acme Corporation')}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
          />
        </div>

        {/* Main Topics */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.newsletter.mainTopicsHighlights', 'Main Topics/Highlights *')}
          </label>
          <textarea
            value={mainTopics}
            onChange={(e) => setMainTopics(e.target.value)}
            placeholder={t('tools.newsletter.listTheKeyTopicsUpdates', 'List the key topics, updates, or highlights you want to cover in this newsletter...')}
            rows={4}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] resize-none`}
          />
        </div>

        {/* Include Sections */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.newsletter.includeSections', 'Include Sections')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.newsletter.header', 'Header')}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBody}
                onChange={(e) => setIncludeBody(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.newsletter.body', 'Body')}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCta}
                onChange={(e) => setIncludeCta(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.newsletter.cta', 'CTA')}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFooter}
                onChange={(e) => setIncludeFooter(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.newsletter.footer', 'Footer')}
              </span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-600 text-sm">
            {t('tools.newsletter.contentSavedSuccessfully', 'Content saved successfully!')}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !mainTopics.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0D9488]/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('tools.newsletter.generating', 'Generating...')}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                {t('tools.newsletter.generateNewsletter', 'Generate Newsletter')}
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.newsletter.clear', 'Clear')}
          </button>
        </div>

        {/* Output Section */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.newsletter.generatedNewsletterContent', 'Generated Newsletter Content')}
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                    copied
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? t('tools.newsletter.copied', 'Copied!') : t('tools.newsletter.copy', 'Copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                    isSaving
                      ? 'bg-gray-400 text-white cursor-not-allowed' : t('tools.newsletter.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('tools.newsletter.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t('tools.newsletter.save', 'Save')}
                    </>
                  )}
                </button>
              </div>
            </div>
            <div
              className={`w-full min-h-96 px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } whitespace-pre-wrap leading-relaxed`}
            >
              {output}
            </div>
          </div>
        )}

        {/* Quick Templates */}
        {!output && (
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.newsletter.exampleTopics', 'Example Topics')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Q4 company achievements and 2025 goals',
                'New product feature launch announcement',
                'Industry trends and market insights',
                'Customer success stories and testimonials',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setMainTopics(example)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.newsletter.aboutNewsletterContentGenerator', 'About Newsletter Content Generator')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.newsletter.generateProfessionalNewsletterContentFor', 'Generate professional newsletter content for email campaigns. This AI-powered tool creates engaging, well-structured newsletters with customizable sections including headers, body content, calls-to-action, and footers. Perfect for company updates, product announcements, industry news, and more. The content is formatted for email delivery and optimized for readability.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterTool;
