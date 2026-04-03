import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface GeneratedEssay {
  content: string;
  topic: string;
  timestamp: Date;
}

const essayTypes = [
  { label: 'Argumentative', value: 'argumentative' },
  { label: 'Expository', value: 'expository' },
  { label: 'Narrative', value: 'narrative' },
  { label: 'Descriptive', value: 'descriptive' },
  { label: 'Persuasive', value: 'persuasive' },
  { label: 'Compare and Contrast', value: 'compare_contrast' },
];

const lengthOptions = [
  { label: 'Short (300-500 words)', value: '300-500' },
  { label: 'Medium (500-800 words)', value: '500-800' },
  { label: 'Long (800-1200 words)', value: '800-1200' },
  { label: 'Extended (1200-1500 words)', value: '1200-1500' },
];

interface EssayWriterToolProps {
  uiConfig?: UIConfig;
}

export const EssayWriterTool = ({ uiConfig }: EssayWriterToolProps) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [essayType, setEssayType] = useState(essayTypes[0]);
  const [length, setLength] = useState(lengthOptions[1]);
  const [thesis, setThesis] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEssay, setGeneratedEssay] = useState<GeneratedEssay | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      let hasPrefill = false;

      if (params.topic) {
        setTopic(params.topic);
        hasPrefill = true;
      }
      if (params.thesis) {
        setThesis(params.thesis);
        hasPrefill = true;
      }
      if (params.additionalNotes) {
        setAdditionalNotes(params.additionalNotes);
        hasPrefill = true;
      }
      if (params.essayType) {
        const foundType = essayTypes.find(t => t.value === params.essayType);
        if (foundType) {
          setEssayType(foundType);
          hasPrefill = true;
        }
      }
      if (params.length) {
        const foundLength = lengthOptions.find(l => l.value === params.length);
        if (foundLength) {
          setLength(foundLength);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Write a ${essayType.label.toLowerCase()} essay on the following topic:

Topic: ${topic}
Essay Type: ${essayType.label}
Target Length: ${length.label}
${thesis ? `Thesis Statement: ${thesis}` : ''}
${additionalNotes ? `Additional Notes:\n${additionalNotes}` : ''}

Please write a complete, well-structured essay with an introduction, body paragraphs, and conclusion. Include proper transitions and maintain academic tone.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert academic essay writer. Write complete, well-structured essays with proper transitions and academic tone. Always provide the full essay content.',
        temperature: 0.7,
        maxTokens: 4000,
      });

      // Check for API error response
      if (response.success === false) {
        throw new Error(response.error || 'Failed to generate essay');
      }

      // Extract content from various possible response structures
      let essayContent = '';
      if (response.data && typeof response.data.text === 'string') {
        essayContent = response.data.text;
      } else if (typeof response.text === 'string') {
        essayContent = response.text;
      } else if (response.data && typeof response.data.content === 'string') {
        essayContent = response.data.content;
      } else if (typeof response.content === 'string') {
        essayContent = response.content;
      } else if (typeof response.data === 'string') {
        essayContent = response.data;
      } else if (typeof response === 'string') {
        essayContent = response;
      }

      essayContent = essayContent.trim();

      if (!essayContent) {
        throw new Error('No essay content was generated. The AI service may be unavailable or you may have reached your usage limit. Please try again later.');
      }

      // Validate content has sufficient length
      if (essayContent.length < 100) {
        throw new Error('Generated essay is too short. Please try again with a more detailed topic.');
      }

      setGeneratedEssay({
        content: essayContent,
        topic,
        timestamp: new Date(),
      });

      // Save to user_content
      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Essay: ${topic}`,
          content: essayContent,
          metadata: {
            type: 'essay',
            essayType: essayType.value,
            length: length.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save essay to content:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate essay');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedEssay) return;

    await navigator.clipboard.writeText(generatedEssay.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <FileText className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.essayWriter.aiEssayWriter', 'AI Essay Writer')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tools.essayWriter.generateWellStructuredEssaysWith', 'Generate well-structured essays with AI')}
            </p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.essayWriter.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.essayWriter.essayTopic', 'Essay Topic')}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.essayWriter.theImpactOfTechnologyOn', 'The Impact of Technology on Education')}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Essay Type & Length Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Essay Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.essayWriter.essayType', 'Essay Type')}
            </label>
            <select
              value={essayType.value}
              onChange={(e) => {
                const selected = essayTypes.find((t) => t.value === e.target.value);
                if (selected) setEssayType(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {essayTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Length */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.essayWriter.targetLength', 'Target Length')}
            </label>
            <select
              value={length.value}
              onChange={(e) => {
                const selected = lengthOptions.find((l) => l.value === e.target.value);
                if (selected) setLength(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {lengthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Thesis Statement Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.essayWriter.thesisStatementOptional', 'Thesis Statement (Optional)')}
          </label>
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder={t('tools.essayWriter.enterYourMainArgumentOr', 'Enter your main argument or thesis statement...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Additional Notes Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.essayWriter.additionalNotesOptional', 'Additional Notes (Optional)')}
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={t('tools.essayWriter.anySpecificPointsSourcesOr', 'Any specific points, sources, or requirements to include...')}
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
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.essayWriter.generatingEssay', 'Generating Essay...')}
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              {t('tools.essayWriter.generateEssay', 'Generate Essay')}
            </>
          )}
        </button>

        {/* Generated Essay Display */}
        {generatedEssay && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('tools.essayWriter.generatedEssay', 'Generated Essay')}
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.essayWriter.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.essayWriter.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('tools.essayWriter.topic', 'Topic:')}</p>
                <p className="text-gray-900 dark:text-white font-medium">{generatedEssay.topic}</p>
              </div>
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {generatedEssay.content}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedEssay && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.essayWriter.yourGeneratedEssayWillAppear', 'Your generated essay will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EssayWriterTool;
