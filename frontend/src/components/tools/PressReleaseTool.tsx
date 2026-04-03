import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PressReleaseToolProps {
  uiConfig?: UIConfig;
}

const releaseTypes = [
  { value: 'product', label: 'Product Launch' },
  { value: 'company', label: 'Company News' },
  { value: 'partnership', label: 'Partnership Announcement' },
  { value: 'award', label: 'Award/Recognition' },
  { value: 'event', label: 'Event Announcement' },
  { value: 'milestone', label: 'Company Milestone' },
  { value: 'executive', label: 'Executive Appointment' },
  { value: 'acquisition', label: 'Acquisition/Merger' },
  { value: 'funding', label: 'Funding Announcement' },
  { value: 'crisis', label: 'Crisis Response' },
];

export const PressReleaseTool: React.FC<PressReleaseToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [releaseType, setReleaseType] = useState('product');
  const [headline, setHeadline] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [keyDetails, setKeyDetails] = useState('');
  const [quotes, setQuotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pressRelease, setPressRelease] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setHeadline(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!headline.trim() || !companyName.trim()) {
      setError('Please enter headline and company name');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Write a professional press release with the following details:

Type: ${releaseTypes.find(t => t.value === releaseType)?.label}
Headline: ${headline}
Company Name: ${companyName}
Location: ${location || 'Not specified'}
Key Details: ${keyDetails || 'Not provided'}
Quotes to Include: ${quotes || 'Generate appropriate executive quotes'}

Requirements:
1. Follow standard press release format (dateline, lead paragraph, body, boilerplate)
2. Start with the city and date
3. Write a compelling lead paragraph that summarizes the news
4. Include relevant details in subsequent paragraphs
5. Add appropriate executive quotes
6. End with company boilerplate (About section)
7. Include media contact placeholder
8. Keep it professional and newsworthy
9. Use third-person perspective
10. Aim for 400-600 words

Write the complete press release, ready for distribution.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a PR professional who writes compelling, newsworthy press releases.',
        temperature: 0.7,
        maxTokens: 2000,
      });

      if (response.success && response.data?.text) {
        setPressRelease(response.data.text);
      } else {
        setError(response.error || 'Failed to generate press release');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pressRelease);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-cyan-900/20' : 'from-white to-cyan-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Newspaper className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.pressRelease.pressReleaseGenerator', 'Press Release Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.pressRelease.createProfessionalPressReleases', 'Create professional press releases')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-cyan-500 font-medium">{t('tools.pressRelease.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.pressRelease.releaseType', 'Release Type')}</label>
            <select
              value={releaseType}
              onChange={(e) => setReleaseType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {releaseTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.pressRelease.companyName', 'Company Name *')}</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t('tools.pressRelease.yourCompanyName', 'Your company name')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.pressRelease.headline', 'Headline *')}</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={t('tools.pressRelease.mainNewsHeadline', 'Main news headline')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.pressRelease.locationCityState', 'Location (City, State)')}</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('tools.pressRelease.eGSanFranciscoCa', 'e.g., San Francisco, CA')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.pressRelease.keyDetails', 'Key Details')}</label>
          <textarea
            value={keyDetails}
            onChange={(e) => setKeyDetails(e.target.value)}
            placeholder={t('tools.pressRelease.importantFactsFiguresDatesAnd', 'Important facts, figures, dates, and information to include...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.pressRelease.quotesOptional', 'Quotes (Optional)')}</label>
          <textarea
            value={quotes}
            onChange={(e) => setQuotes(e.target.value)}
            placeholder={t('tools.pressRelease.anySpecificQuotesFromExecutives', 'Any specific quotes from executives or stakeholders...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !headline.trim() || !companyName.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Newspaper className="w-5 h-5" />}
          {isGenerating ? t('tools.pressRelease.writingPressRelease', 'Writing Press Release...') : t('tools.pressRelease.generatePressRelease', 'Generate Press Release')}
        </button>

        {pressRelease && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.pressRelease.yourPressRelease', 'Your Press Release')}</h4>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.pressRelease.copied', 'Copied!') : t('tools.pressRelease.copy', 'Copy')}
              </button>
            </div>
            <div className={`p-6 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl`}>
              <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-sans leading-relaxed`}>{pressRelease}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PressReleaseTool;
