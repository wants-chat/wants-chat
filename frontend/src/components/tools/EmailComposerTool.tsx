import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface GeneratedEmail {
  content: string;
  subject: string;
  timestamp: Date;
}

interface EmailComposerToolProps {
  uiConfig?: UIConfig;
}

const toneOptions = [
  { label: 'Professional', value: 'professional' },
  { label: 'Formal', value: 'formal' },
  { label: 'Casual', value: 'casual' },
  { label: 'Friendly', value: 'friendly' },
  { label: 'Persuasive', value: 'persuasive' },
];

const recipientTypes = [
  { label: 'Colleague', value: 'colleague' },
  { label: 'Manager/Boss', value: 'manager' },
  { label: 'Client', value: 'client' },
  { label: 'Customer', value: 'customer' },
  { label: 'Friend', value: 'friend' },
  { label: 'Family', value: 'family' },
];

export const EmailComposerTool: React.FC<EmailComposerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [recipientType, setRecipientType] = useState(recipientTypes[0]);
  const [tone, setTone] = useState(toneOptions[0]);
  const [purpose, setPurpose] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts or params change
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // If we have full email content, show it directly as generated
      if (params.body || params.content) {
        const emailContent = params.body || params.content || '';
        setGeneratedEmail({
          content: emailContent,
          subject: params.subject || 'Prefilled Email',
          timestamp: new Date(),
        });
        setIsPrefilled(true);
        hasChanges = true;
      }

      // Prefill form fields
      if (params.subject) {
        setSubject(params.subject);
        hasChanges = true;
      }

      if (params.purpose) {
        setPurpose(params.purpose);
        hasChanges = true;
      }

      if (params.keyPoints) {
        setKeyPoints(params.keyPoints);
        hasChanges = true;
      }

      if (params.tone) {
        const matchedTone = toneOptions.find(t =>
          t.value.toLowerCase() === params.tone?.toLowerCase()
        );
        if (matchedTone) {
          setTone(matchedTone);
          hasChanges = true;
        }
      }

      if (params.recipientType) {
        const matchedRecipient = recipientTypes.find(r =>
          r.value.toLowerCase() === params.recipientType?.toLowerCase()
        );
        if (matchedRecipient) {
          setRecipientType(matchedRecipient);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!subject.trim() || !purpose.trim()) {
      setError('Please enter a subject and purpose');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Generate a professional email with the following details:
Subject: ${subject}
Recipient Type: ${recipientType.label}
Tone: ${tone.label}
Purpose: ${purpose}
${keyPoints ? `Key Points to Include:\n${keyPoints}` : ''}

Please write a complete email including greeting, body, and closing.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert email writer. Create professional, clear, and effective emails tailored to the recipient and purpose. Write complete emails with greeting, body paragraphs, and closing signature.',
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Check for API error response
      if (response.success === false) {
        throw new Error(response.error || 'Failed to generate email');
      }

      // Extract content from various possible response structures
      let rawContent = '';
      if (response.data && typeof response.data.text === 'string') {
        rawContent = response.data.text;
      } else if (typeof response.text === 'string') {
        rawContent = response.text;
      } else if (response.data && typeof response.data.content === 'string') {
        rawContent = response.data.content;
      } else if (typeof response.content === 'string') {
        rawContent = response.content;
      } else if (typeof response.data === 'string') {
        rawContent = response.data;
      } else if (typeof response === 'string') {
        rawContent = response;
      }

      const emailContent = rawContent.trim();

      if (!emailContent) {
        throw new Error('No email content was generated. The AI service may be unavailable or you may have reached your usage limit. Please try again later.');
      }

      // Validate content has sufficient length (not just echoing the subject)
      if (emailContent.length < 50) {
        throw new Error('Generated email is too short. Please try again with more detailed input.');
      }

      setGeneratedEmail({
        content: emailContent,
        subject,
        timestamp: new Date(),
      });

      // Save to user_content
      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Email: ${subject}`,
          content: emailContent,
          metadata: {
            type: 'email',
            tone: tone.value,
            recipientType: recipientType.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save email to content:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedEmail) return;

    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.content}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Mail className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.emailComposer.aiEmailComposer', 'AI Email Composer')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.emailComposer.generateProfessionalEmailsWithAi', 'Generate professional emails with AI')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.emailComposer.prefilledFromAi', 'Prefilled from AI')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Subject Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.emailComposer.emailSubject', 'Email Subject')}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('tools.emailComposer.meetingFollowUpProjectUpdate', 'Meeting Follow-up, Project Update, etc.')}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Tone & Recipient Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tone Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.emailComposer.tone', 'Tone')}
            </label>
            <select
              value={tone.value}
              onChange={(e) => {
                const selected = toneOptions.find((t) => t.value === e.target.value);
                if (selected) setTone(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {toneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recipient Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.emailComposer.recipientType', 'Recipient Type')}
            </label>
            <select
              value={recipientType.value}
              onChange={(e) => {
                const selected = recipientTypes.find((r) => r.value === e.target.value);
                if (selected) setRecipientType(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {recipientTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Purpose Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.emailComposer.emailPurpose', 'Email Purpose')}
          </label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder={t('tools.emailComposer.brieflyDescribeWhatThisEmail', 'Briefly describe what this email is about...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Key Points Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.emailComposer.keyPointsOptional', 'Key Points (Optional)')}
          </label>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder={t('tools.emailComposer.point110Point2', '- Point 1&#10;- Point 2&#10;- Point 3')}
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
          disabled={isGenerating || !subject.trim() || !purpose.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.emailComposer.generatingEmail', 'Generating Email...')}
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              {t('tools.emailComposer.generateEmail', 'Generate Email')}
            </>
          )}
        </button>

        {/* Generated Email Display */}
        {generatedEmail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('tools.emailComposer.generatedEmail', 'Generated Email')}
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.emailComposer.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.emailComposer.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('tools.emailComposer.subject', 'Subject:')}</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {generatedEmail.subject}
                </p>
              </div>
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {generatedEmail.content}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedEmail && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.emailComposer.yourGeneratedEmailWillAppear', 'Your generated email will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailComposerTool;
