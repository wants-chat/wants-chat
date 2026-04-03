import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Loader2, Copy, Check, Calendar, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const eventTypes = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'baby-shower', label: 'Baby Shower' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'dinner', label: 'Dinner Party' },
  { value: 'housewarming', label: 'Housewarming' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'holiday', label: 'Holiday Party' },
  { value: 'engagement', label: 'Engagement Party' },
  { value: 'retirement', label: 'Retirement Party' },
  { value: 'reunion', label: 'Reunion' },
  { value: 'other', label: 'Other' },
];

const tones = [
  { value: 'formal', label: 'Formal & Elegant' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'playful', label: 'Playful & Fun' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'professional', label: 'Professional' },
  { value: 'creative', label: 'Creative & Unique' },
];

interface InvitationToolProps {
  uiConfig?: UIConfig;
}

export const InvitationTool: React.FC<InvitationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [eventType, setEventType] = useState('birthday');
  const [eventName, setEventName] = useState('');
  const [hostName, setHostName] = useState('');
  const [honoree, setHonoree] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('');
  const [tone, setTone] = useState('casual');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setAdditionalDetails(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!eventName.trim() && !honoree.trim()) {
      setError('Please enter event name or honoree');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const eventTypeLabel = eventTypes.find(e => e.value === eventType)?.label;
      const toneLabel = tones.find(t => t.value === tone)?.label;

      const prompt = `Write a ${toneLabel} invitation for a ${eventTypeLabel}.

Event Details:
- Event Name/Title: ${eventName || eventTypeLabel}
- Host: ${hostName || 'Not specified'}
- Honoree/Guest of Honor: ${honoree || 'Not specified'}
- Date: ${eventDate || 'TBD'}
- Time: ${eventTime || 'TBD'}
- Venue/Location: ${venue || 'TBD'}
- Additional Details: ${additionalDetails || 'None'}

Requirements:
1. Create an engaging, memorable invitation
2. Include all provided event details
3. Maintain the ${toneLabel.toLowerCase()} tone throughout
4. Include RSVP request
5. Make it personal and warm
6. Format it beautifully with proper spacing
7. Keep it concise but complete

Write the complete invitation text.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert invitation writer who creates beautiful, memorable invitations for all occasions.',
        temperature: 0.8,
        maxTokens: 1000,
      });

      if (response.success && response.data?.text) {
        setInvitation(response.data.text);
      } else {
        setError(response.error || 'Failed to generate invitation');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(invitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-rose-900/20' : 'from-white to-rose-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <Mail className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.invitation.invitationGenerator', 'Invitation Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.invitation.createBeautifulInvitationsForAny', 'Create beautiful invitations for any event')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.invitation.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.invitation.eventType', 'Event Type')}</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.invitation.tone', 'Tone')}</label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.invitation.eventName', 'Event Name')}</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder={t('tools.invitation.eGSarahSSweet', 'e.g., Sarah\'s Sweet 16')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.invitation.honoreeGuestOfHonor', 'Honoree/Guest of Honor')}</label>
            <input
              type="text"
              value={honoree}
              onChange={(e) => setHonoree(e.target.value)}
              placeholder={t('tools.invitation.personBeingCelebrated', 'Person being celebrated')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.invitation.hostNameS', 'Host Name(s)')}</label>
          <input
            type="text"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder={t('tools.invitation.whoIsHostingTheEvent', 'Who is hosting the event?')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" /> Date
            </label>
            <input
              type="text"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              placeholder={t('tools.invitation.eGSaturdayDecember25', 'e.g., Saturday, December 25, 2025')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.invitation.time', 'Time')}</label>
            <input
              type="text"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              placeholder={t('tools.invitation.eG600Pm', 'e.g., 6:00 PM - 10:00 PM')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.invitation.venueLocation', 'Venue/Location')}</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder={t('tools.invitation.addressOrVenueName', 'Address or venue name')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.invitation.additionalDetails', 'Additional Details')}</label>
          <textarea
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder={t('tools.invitation.dressCodeThemeRsvpContact', 'Dress code, theme, RSVP contact, special instructions...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
          {isGenerating ? t('tools.invitation.creatingInvitation', 'Creating Invitation...') : t('tools.invitation.generateInvitation', 'Generate Invitation')}
        </button>

        {invitation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.invitation.yourInvitation', 'Your Invitation')}</h4>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.invitation.copied', 'Copied!') : t('tools.invitation.copy', 'Copy')}
              </button>
            </div>
            <div className={`p-6 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl`}>
              <pre className={`whitespace-pre-wrap text-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-serif leading-relaxed`}>{invitation}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationTool;
