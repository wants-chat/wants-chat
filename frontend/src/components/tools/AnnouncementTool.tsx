import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const announcementTypes = [
  { value: 'product-launch', label: 'Product Launch' },
  { value: 'company-news', label: 'Company News' },
  { value: 'event', label: 'Event Announcement' },
  { value: 'promotion', label: 'Promotion/Sale' },
  { value: 'feature-update', label: 'Feature Update' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'hiring', label: 'Hiring/Team Update' },
  { value: 'policy-change', label: 'Policy Change' },
  { value: 'milestone', label: 'Milestone/Achievement' },
  { value: 'community', label: 'Community Update' },
  { value: 'maintenance', label: 'Maintenance/Downtime' },
  { value: 'personal', label: 'Personal Announcement' },
];

const platforms = [
  { value: 'email', label: 'Email Newsletter' },
  { value: 'website', label: 'Website/Blog' },
  { value: 'social', label: 'Social Media' },
  { value: 'internal', label: 'Internal/Company-wide' },
  { value: 'press', label: 'Press/Media' },
  { value: 'app', label: 'In-App Notification' },
];

const tones = [
  { value: 'exciting', label: 'Exciting & Enthusiastic' },
  { value: 'professional', label: 'Professional & Formal' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'urgent', label: 'Urgent & Important' },
  { value: 'celebratory', label: 'Celebratory' },
  { value: 'informative', label: 'Informative & Clear' },
];

interface AnnouncementToolProps {
  uiConfig?: UIConfig;
}

export const AnnouncementTool: React.FC<AnnouncementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [announcementType, setAnnouncementType] = useState('product-launch');
  const [platform, setPlatform] = useState('email');
  const [tone, setTone] = useState('exciting');
  const [headline, setHeadline] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [details, setDetails] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasPrefill = false;

      if (params.content) {
        setKeyMessage(params.content);
        hasPrefill = true;
      }
      if (params.text) {
        setDetails(params.text);
        hasPrefill = true;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!keyMessage.trim()) {
      setError('Please enter the key message');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = announcementTypes.find(t => t.value === announcementType)?.label;
      const platformLabel = platforms.find(p => p.value === platform)?.label;
      const toneLabel = tones.find(t => t.value === tone)?.label;

      const prompt = `Write a ${toneLabel} ${typeLabel} announcement for ${platformLabel}.

Details:
- Headline/Subject: ${headline || 'Generate an attention-grabbing headline'}
- Key Message: ${keyMessage}
- Additional Details: ${details || 'None provided'}
- Call to Action: ${callToAction || 'Include appropriate CTA'}

Requirements:
1. Start with a compelling headline or subject line
2. Open with the most important information
3. Include all key details clearly
4. Maintain the ${toneLabel.toLowerCase()} tone throughout
5. ${platform === 'social' ? 'Keep it concise for social media (under 280 chars for Twitter if needed)' : 'Use appropriate length for the platform'}
6. ${platform === 'email' ? 'Include a clear subject line and structured body' : ''}
7. End with a clear call-to-action
8. Make it engaging and shareable

Write the complete announcement.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a communications expert who writes compelling announcements that capture attention and drive action.',
        temperature: 0.7,
        maxTokens: 1500,
      });

      if (response.success && response.data?.text) {
        setAnnouncement(response.data.text);
      } else {
        setError(response.error || 'Failed to generate announcement');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(announcement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-orange-900/20' : 'from-white to-orange-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Megaphone className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.announcement.announcementGenerator', 'Announcement Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.announcement.createImpactfulAnnouncementsForAny', 'Create impactful announcements for any platform')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.announcement.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.announcement.type', 'Type')}</label>
            <select
              value={announcementType}
              onChange={(e) => setAnnouncementType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {announcementTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.announcement.platform', 'Platform')}</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.announcement.tone', 'Tone')}</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.announcement.headlineSubjectOptional', 'Headline/Subject (Optional)')}</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={t('tools.announcement.catchyHeadlineForYourAnnouncement', 'Catchy headline for your announcement')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.announcement.keyMessage', 'Key Message *')}</label>
          <textarea
            value={keyMessage}
            onChange={(e) => setKeyMessage(e.target.value)}
            placeholder={t('tools.announcement.whatSTheMainThing', 'What\'s the main thing you\'re announcing?')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.announcement.additionalDetails', 'Additional Details')}</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t('tools.announcement.datesLinksSpecificationsBackgroundInfo', 'Dates, links, specifications, background info...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.announcement.callToAction', 'Call to Action')}</label>
          <input
            type="text"
            value={callToAction}
            onChange={(e) => setCallToAction(e.target.value)}
            placeholder={t('tools.announcement.whatDoYouWantReaders', 'What do you want readers to do? (e.g., Sign up now, Learn more)')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !keyMessage.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Megaphone className="w-5 h-5" />}
          {isGenerating ? t('tools.announcement.creatingAnnouncement', 'Creating Announcement...') : t('tools.announcement.generateAnnouncement', 'Generate Announcement')}
        </button>

        {announcement && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.announcement.yourAnnouncement', 'Your Announcement')}</h4>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.announcement.copied', 'Copied!') : t('tools.announcement.copy', 'Copy')}
              </button>
            </div>
            <div className={`p-6 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl`}>
              <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-sans leading-relaxed`}>{announcement}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementTool;
