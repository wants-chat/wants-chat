import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Code, Copy, Check, Globe, Image, Twitter, Facebook, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  author: string;
  url: string;
  image: string;
  siteName: string;
  twitterHandle: string;
  type: 'website' | 'article' | 'product';
  locale: string;
}

interface MetaTagGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const MetaTagGeneratorTool: React.FC<MetaTagGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [tags, setTags] = useState<MetaTags>({
    title: '',
    description: '',
    keywords: '',
    author: '',
    url: '',
    image: '',
    siteName: '',
    twitterHandle: '',
    type: 'website',
    locale: 'en_US',
  });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'preview'>('basic');

  const generatedMeta = useMemo(() => {
    const lines: string[] = [
      '<!-- Basic Meta Tags -->',
      `<meta charset="UTF-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    ];

    if (tags.title) {
      lines.push(`<title>${tags.title}</title>`);
      lines.push(`<meta name="title" content="${tags.title}">`);
    }
    if (tags.description) {
      lines.push(`<meta name="description" content="${tags.description}">`);
    }
    if (tags.keywords) {
      lines.push(`<meta name="keywords" content="${tags.keywords}">`);
    }
    if (tags.author) {
      lines.push(`<meta name="author" content="${tags.author}">`);
    }

    lines.push('');
    lines.push('<!-- Open Graph / Facebook -->');
    lines.push(`<meta property="og:type" content="${tags.type}">`);
    if (tags.url) lines.push(`<meta property="og:url" content="${tags.url}">`);
    if (tags.title) lines.push(`<meta property="og:title" content="${tags.title}">`);
    if (tags.description) lines.push(`<meta property="og:description" content="${tags.description}">`);
    if (tags.image) lines.push(`<meta property="og:image" content="${tags.image}">`);
    if (tags.siteName) lines.push(`<meta property="og:site_name" content="${tags.siteName}">`);
    lines.push(`<meta property="og:locale" content="${tags.locale}">`);

    lines.push('');
    lines.push('<!-- Twitter -->');
    lines.push(`<meta property="twitter:card" content="summary_large_image">`);
    if (tags.url) lines.push(`<meta property="twitter:url" content="${tags.url}">`);
    if (tags.title) lines.push(`<meta property="twitter:title" content="${tags.title}">`);
    if (tags.description) lines.push(`<meta property="twitter:description" content="${tags.description}">`);
    if (tags.image) lines.push(`<meta property="twitter:image" content="${tags.image}">`);
    if (tags.twitterHandle) lines.push(`<meta name="twitter:creator" content="${tags.twitterHandle}">`);

    return lines.join('\n');
  }, [tags]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMeta);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const titleLength = tags.title.length;
  const descLength = tags.description.length;

  const tabs = [
    { id: 'basic', label: 'Basic', icon: Globe },
    { id: 'social', label: 'Social', icon: Twitter },
    { id: 'preview', label: 'Preview', icon: Image },
  ];

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const titleContent = params.title || '';
      const descContent = params.description || params.content || '';
      if (titleContent || descContent) {
        setTags(prev => ({
          ...prev,
          title: titleContent || prev.title,
          description: descContent || prev.description,
        }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Code className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.metaTagGenerator.metaTagGenerator', 'Meta Tag Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.metaTagGenerator.generateSeoFriendlyMetaTags', 'Generate SEO-friendly meta tags for your website')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.metaTagGenerator.pageTitle', 'Page Title')}
                </label>
                <span className={`text-xs ${titleLength > 60 ? 'text-red-500' : titleLength > 50 ? 'text-yellow-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {titleLength}/60 characters
                </span>
              </div>
              <input
                type="text"
                value={tags.title}
                onChange={(e) => setTags({ ...tags, title: e.target.value })}
                placeholder={t('tools.metaTagGenerator.myAwesomeWebsite', 'My Awesome Website')}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.metaTagGenerator.description', 'Description')}
                </label>
                <span className={`text-xs ${descLength > 160 ? 'text-red-500' : descLength > 140 ? 'text-yellow-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {descLength}/160 characters
                </span>
              </div>
              <textarea
                value={tags.description}
                onChange={(e) => setTags({ ...tags, description: e.target.value })}
                placeholder={t('tools.metaTagGenerator.aBriefDescriptionOfYour', 'A brief description of your website content...')}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-lg border resize-none ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.metaTagGenerator.keywordsCommaSeparated', 'Keywords (comma-separated)')}
                </label>
                <input
                  type="text"
                  value={tags.keywords}
                  onChange={(e) => setTags({ ...tags, keywords: e.target.value })}
                  placeholder={t('tools.metaTagGenerator.webDevelopmentReact', 'web, development, react')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.metaTagGenerator.author', 'Author')}
                </label>
                <input
                  type="text"
                  value={tags.author}
                  onChange={(e) => setTags({ ...tags, author: e.target.value })}
                  placeholder={t('tools.metaTagGenerator.johnDoe', 'John Doe')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.metaTagGenerator.pageUrl', 'Page URL')}
              </label>
              <input
                type="url"
                value={tags.url}
                onChange={(e) => setTags({ ...tags, url: e.target.value })}
                placeholder={t('tools.metaTagGenerator.httpsExampleComPage', 'https://example.com/page')}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.metaTagGenerator.siteName', 'Site Name')}
                </label>
                <input
                  type="text"
                  value={tags.siteName}
                  onChange={(e) => setTags({ ...tags, siteName: e.target.value })}
                  placeholder={t('tools.metaTagGenerator.myWebsite', 'My Website')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.metaTagGenerator.pageType', 'Page Type')}
                </label>
                <select
                  value={tags.type}
                  onChange={(e) => setTags({ ...tags, type: e.target.value as any })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="website">{t('tools.metaTagGenerator.website', 'Website')}</option>
                  <option value="article">{t('tools.metaTagGenerator.article', 'Article')}</option>
                  <option value="product">{t('tools.metaTagGenerator.product', 'Product')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.metaTagGenerator.shareImageUrl', 'Share Image URL')}
              </label>
              <input
                type="url"
                value={tags.image}
                onChange={(e) => setTags({ ...tags, image: e.target.value })}
                placeholder={t('tools.metaTagGenerator.httpsExampleComImageJpg', 'https://example.com/image.jpg')}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.metaTagGenerator.recommendedSize1200x630PixelsFor', 'Recommended size: 1200x630 pixels for optimal display')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.metaTagGenerator.twitterHandle', 'Twitter Handle')}
                </label>
                <input
                  type="text"
                  value={tags.twitterHandle}
                  onChange={(e) => setTags({ ...tags, twitterHandle: e.target.value })}
                  placeholder={t('tools.metaTagGenerator.username', '@username')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.metaTagGenerator.locale', 'Locale')}
                </label>
                <select
                  value={tags.locale}
                  onChange={(e) => setTags({ ...tags, locale: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="en_US">{t('tools.metaTagGenerator.englishUs', 'English (US)')}</option>
                  <option value="en_GB">{t('tools.metaTagGenerator.englishUk', 'English (UK)')}</option>
                  <option value="es_ES">{t('tools.metaTagGenerator.spanish', 'Spanish')}</option>
                  <option value="fr_FR">{t('tools.metaTagGenerator.french', 'French')}</option>
                  <option value="de_DE">{t('tools.metaTagGenerator.german', 'German')}</option>
                  <option value="pt_BR">{t('tools.metaTagGenerator.portugueseBrazil', 'Portuguese (Brazil)')}</option>
                  <option value="ja_JP">{t('tools.metaTagGenerator.japanese', 'Japanese')}</option>
                  <option value="zh_CN">{t('tools.metaTagGenerator.chineseSimplified', 'Chinese (Simplified)')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Google Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.metaTagGenerator.googleSearchPreview', 'Google Search Preview')}
                </span>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                  {tags.title || 'Page Title'}
                </p>
                <p className="text-green-700 text-sm truncate">
                  {tags.url || 'https://example.com/page'}
                </p>
                <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tags.description || 'Your page description will appear here. Make it compelling to increase click-through rates.'}
                </p>
              </div>
            </div>

            {/* Social Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Facebook Preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Facebook className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.metaTagGenerator.facebookPreview', 'Facebook Preview')}
                  </span>
                </div>
                <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                  <div className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                    {tags.image ? (
                      <img src={tags.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="p-3">
                    <p className={`text-xs uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {tags.siteName || 'example.com'}
                    </p>
                    <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {tags.title || 'Page Title'}
                    </p>
                    <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {tags.description || 'Description'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Twitter Preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Twitter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.metaTagGenerator.twitterPreview', 'Twitter Preview')}
                  </span>
                </div>
                <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                  <div className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                    {tags.image ? (
                      <img src={tags.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="p-3">
                    <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {tags.title || 'Page Title'}
                    </p>
                    <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {tags.description || 'Description'}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {tags.url ? new URL(tags.url).hostname : 'example.com'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Code */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.metaTagGenerator.generatedMetaTags', 'Generated Meta Tags')}
            </label>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.metaTagGenerator.copied', 'Copied!') : t('tools.metaTagGenerator.copyCode', 'Copy Code')}
            </button>
          </div>
          <pre className={`p-4 rounded-xl overflow-x-auto text-sm font-mono ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
            {generatedMeta}
          </pre>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.metaTagGenerator.seoTips', 'SEO Tips:')}</strong> Keep titles under 60 characters and descriptions under 160 characters.
            Use relevant keywords naturally. Include a high-quality share image for better social media engagement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetaTagGeneratorTool;
