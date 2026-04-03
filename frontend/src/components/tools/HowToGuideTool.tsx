import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ListChecks, Copy, Loader2, Save, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HowToGuideToolProps {
  uiConfig?: UIConfig;
}

const skillLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const formats = [
  { value: 'numbered_steps', label: 'Numbered Steps' },
  { value: 'sections', label: 'Sections with Subsections' },
  { value: 'checklist', label: 'Checklist Format' },
];

export const HowToGuideTool: React.FC<HowToGuideToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [topic, setTopic] = useState('');
  const [skillLevel, setSkillLevel] = useState(skillLevels[0].value);
  const [format, setFormat] = useState(formats[0].value);
  const [includeTips, setIncludeTips] = useState(true);
  const [includeWarnings, setIncludeWarnings] = useState(true);
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.skillLevel) {
          setSkillLevel(params.skillLevel);
          hasPrefill = true;
        }
        if (params.format) {
          setFormat(params.format);
          hasPrefill = true;
        }
        if (params.includeTips !== undefined) {
          setIncludeTips(params.includeTips);
          hasPrefill = true;
        }
        if (params.includeWarnings !== undefined) {
          setIncludeWarnings(params.includeWarnings);
          hasPrefill = true;
        }
        // Restore the generated output
        if (params.output || params.content) {
          setOutput(params.output || params.content);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        const extractedTopic = params.metadata?.topic || params.content || params.text || params.topic;

        if (extractedTopic && typeof extractedTopic === 'string' && extractedTopic.trim()) {
          const formattedTopic = extractedTopic.charAt(0).toUpperCase() + extractedTopic.slice(1);
          setTopic(formattedTopic);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Topic is required');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const selectedFormat = formats.find(f => f.value === format);
      const selectedSkillLevel = skillLevels.find(s => s.value === skillLevel);

      const prompt = `Create a comprehensive how-to guide on: ${topic}

Target Skill Level: ${selectedSkillLevel?.label}
Format: ${selectedFormat?.label}
${includeTips ? 'Include helpful tips and best practices.' : ''}
${includeWarnings ? 'Include warnings and common pitfalls to avoid.' : ''}

Please provide a detailed, step-by-step guide that is easy to follow and appropriate for the ${selectedSkillLevel?.label} level. Use clear headings, ${format === 'numbered_steps' ? 'numbered steps' : format === 'sections' ? 'sections with subsections' : 'checklist items'}.

The guide should be:
- Clear and concise
- Action-oriented
- Well-structured
- Professional and informative
${includeTips ? '- Include practical tips marked with "💡 Tip:"' : ''}
${includeWarnings ? '- Include warnings marked with "⚠️ Warning:"' : ''}`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        maxTokens: 2000,
        temperature: 0.7,
      });

      if (response.data?.generatedText) {
        setOutput(response.data.generatedText);
      } else {
        setError('Failed to generate how-to guide');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the guide');
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
      await api.post('/content', {
        content_type: 'text',
        title: `How-To Guide - ${topic}`,
        content: output,
        metadata: {
          toolId: 'how-to-guide',
          topic,
          skillLevel,
          format,
          includeTips,
          includeWarnings,
          output,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Call onSaveCallback if provided (for gallery refresh)
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#0D9488]/10 rounded-lg">
          <ListChecks className="w-6 h-6 text-[#0D9488]" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.howToGuide.howToGuideCreator', 'How-To Guide Creator')}
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.howToGuide.createStepByStepGuides', 'Create step-by-step guides with AI')}
          </p>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{isEditFromGallery ? t('tools.howToGuide.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.howToGuide.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Input Fields */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.howToGuide.topicTaskToExplain', 'Topic/Task to Explain *')}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.howToGuide.eGSetUpA', 'e.g., Set up a React development environment, Create a budget spreadsheet')}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Skill Level */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.howToGuide.targetSkillLevel', 'Target Skill Level')}
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
            >
              {skillLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.howToGuide.format', 'Format')}
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
            >
              {formats.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeTips}
              onChange={(e) => setIncludeTips(e.target.checked)}
              className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              {t('tools.howToGuide.includeHelpfulTipsAndBest', 'Include helpful tips and best practices')}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeWarnings}
              onChange={(e) => setIncludeWarnings(e.target.checked)}
              className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              {t('tools.howToGuide.includeWarningsAndCommonPitfalls', 'Include warnings and common pitfalls')}
            </span>
          </label>
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
            {t('tools.howToGuide.contentSavedSuccessfully', 'Content saved successfully!')}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0D9488]/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('tools.howToGuide.generating', 'Generating...')}
              </>
            ) : (
              <>
                <ListChecks className="w-4 h-4" />
                {t('tools.howToGuide.generateGuide', 'Generate Guide')}
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
            {t('tools.howToGuide.clear', 'Clear')}
          </button>
        </div>

        {/* Output Section */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.howToGuide.generatedHowToGuide', 'Generated How-To Guide')}
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
                  {copied ? t('tools.howToGuide.copied', 'Copied!') : t('tools.howToGuide.copy', 'Copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                    isSaving
                      ? 'bg-gray-400 text-white cursor-not-allowed' : t('tools.howToGuide.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('tools.howToGuide.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t('tools.howToGuide.save', 'Save')}
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
              {t('tools.howToGuide.popularTopics', 'Popular Topics')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Set up a WordPress website',
                'Create a professional resume',
                'Start a podcast',
                'Build a REST API',
                'Organize a successful event',
                'Write effective emails',
              ].map((template) => (
                <button
                  key={template}
                  onClick={() => setTopic(template)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.howToGuide.aboutHowToGuideCreator', 'About How-To Guide Creator')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.howToGuide.createComprehensiveStepByStep', 'Create comprehensive, step-by-step guides for any topic or task. This AI-powered tool generates professional how-to content tailored to your target audience\'s skill level, complete with tips, warnings, and clear instructions. Perfect for documentation, training materials, or educational content.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToGuideTool;
