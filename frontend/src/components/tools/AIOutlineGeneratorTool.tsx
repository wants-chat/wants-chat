import React, { useState, useEffect } from 'react';
import { List, Loader2, Copy, Check, Sparkles, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface OutlineSection {
  title: string;
  points: string[];
  subsections?: {
    title: string;
    points: string[];
  }[];
}

interface ContentOutline {
  title: string;
  description: string;
  sections: OutlineSection[];
  timestamp: Date;
}

interface AIOutlineGeneratorToolProps {
  uiConfig?: UIConfig;
}

const contentTypes = [
  { label: 'Blog Post', value: 'blog-post' },
  { label: 'Article', value: 'article' },
  { label: 'Research Paper', value: 'research-paper' },
  { label: 'Book Chapter', value: 'book-chapter' },
  { label: 'Presentation', value: 'presentation' },
  { label: 'Video Script', value: 'video-script' },
  { label: 'Course Module', value: 'course-module' },
  { label: 'White Paper', value: 'white-paper' },
];

const depthLevels = [
  { label: 'Basic (2 levels)', value: 2 },
  { label: 'Standard (3 levels)', value: 3 },
  { label: 'Detailed (4 levels)', value: 4 },
];

export const AIOutlineGeneratorTool: React.FC<AIOutlineGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState(contentTypes[0]);
  const [depthLevel, setDepthLevel] = useState(depthLevels[1]);
  const [targetAudience, setTargetAudience] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedOutline, setGeneratedOutline] = useState<ContentOutline | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.topic || params.text || params.content) {
        setTopic(params.topic || params.text || params.content || '');
        hasChanges = true;
      }

      if (params.contentType) {
        const matched = contentTypes.find(t => t.value === params.contentType?.toLowerCase());
        if (matched) {
          setContentType(matched);
          hasChanges = true;
        }
      }

      if (params.targetAudience) {
        setTargetAudience(params.targetAudience);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Generate a detailed content outline for the following:
Topic: ${topic}
Content Type: ${contentType.label}
Depth Level: ${depthLevel.label}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${keyPoints ? `Key Points to Include: ${keyPoints}` : ''}

Create a structured outline in JSON format:
{
  "title": "Main title for the content",
  "description": "Brief description of what this content covers",
  "sections": [
    {
      "title": "Section title",
      "points": ["Key point 1", "Key point 2", "Key point 3"],
      "subsections": [
        {
          "title": "Subsection title",
          "points": ["Detail 1", "Detail 2"]
        }
      ]
    }
  ]
}

Include ${Math.max(3, depthLevel.value + 1)} main sections with appropriate subsections based on the depth level. Return ONLY valid JSON.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert content strategist. Generate well-structured outlines in valid JSON format only.',
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Extract content and ensure it's a string
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      let outline: ContentOutline;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          outline = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        outline = {
          title: topic,
          description: 'A comprehensive outline for your content.',
          sections: [
            {
              title: 'Introduction',
              points: ['Background context', 'Purpose statement', 'Overview of topics'],
            },
            {
              title: 'Main Content',
              points: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
              subsections: [
                {
                  title: 'Details',
                  points: ['Supporting information', 'Examples'],
                },
              ],
            },
            {
              title: 'Conclusion',
              points: ['Summary of key points', 'Call to action', 'Final thoughts'],
            },
          ],
          timestamp: new Date(),
        };
      }

      outline.timestamp = new Date();
      setGeneratedOutline(outline);

      // Initialize expanded state for all sections
      const expanded: Record<number, boolean> = {};
      outline.sections.forEach((_, idx) => {
        expanded[idx] = true;
      });
      setExpandedSections(expanded);

      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Content Outline: ${topic}`,
          content: JSON.stringify(outline),
          metadata: {
            type: 'content-outline',
            contentType: contentType.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save outline:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate outline');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatOutlineForCopy = () => {
    if (!generatedOutline) return '';

    let text = `${generatedOutline.title}\n`;
    text += `${'='.repeat(50)}\n`;
    text += `${generatedOutline.description}\n\n`;

    generatedOutline.sections.forEach((section, idx) => {
      text += `${idx + 1}. ${section.title}\n`;
      section.points.forEach((point, pIdx) => {
        text += `   ${String.fromCharCode(97 + pIdx)}. ${point}\n`;
      });

      if (section.subsections) {
        section.subsections.forEach((sub, subIdx) => {
          text += `   ${idx + 1}.${subIdx + 1} ${sub.title}\n`;
          sub.points.forEach((point, pIdx) => {
            text += `      - ${point}\n`;
          });
        });
      }
      text += '\n';
    });

    return text;
  };

  const handleCopy = async () => {
    const text = formatOutlineForCopy();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <List className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.aIOutlineGenerator.aiOutlineGenerator', 'AI Outline Generator')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.aIOutlineGenerator.createStructuredContentOutlines', 'Create structured content outlines')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.aIOutlineGenerator.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIOutlineGenerator.contentTopic', 'Content Topic')}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.aIOutlineGenerator.enterTheTopicYouWant', 'Enter the topic you want to create content about...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Content Type & Depth Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIOutlineGenerator.contentType', 'Content Type')}
            </label>
            <select
              value={contentType.value}
              onChange={(e) => {
                const selected = contentTypes.find(t => t.value === e.target.value);
                if (selected) setContentType(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIOutlineGenerator.outlineDepth', 'Outline Depth')}
            </label>
            <select
              value={depthLevel.value}
              onChange={(e) => {
                const selected = depthLevels.find(d => d.value === Number(e.target.value));
                if (selected) setDepthLevel(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {depthLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIOutlineGenerator.targetAudienceOptional', 'Target Audience (Optional)')}
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder={t('tools.aIOutlineGenerator.eGBeginnersMarketingProfessionals', 'e.g., Beginners, Marketing professionals, Students...')}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Key Points */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIOutlineGenerator.keyPointsToIncludeOptional', 'Key Points to Include (Optional)')}
          </label>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder={t('tools.aIOutlineGenerator.listSpecificTopicsOrPoints', 'List specific topics or points you want covered...')}
            rows={2}
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
              {t('tools.aIOutlineGenerator.generatingOutline', 'Generating Outline...')}
            </>
          ) : (
            <>
              <List className="w-5 h-5" />
              {t('tools.aIOutlineGenerator.generateOutline', 'Generate Outline')}
            </>
          )}
        </button>

        {/* Generated Outline Display */}
        {generatedOutline && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <List className="w-4 h-4" />
                {t('tools.aIOutlineGenerator.contentOutline', 'Content Outline')}
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.aIOutlineGenerator.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.aIOutlineGenerator.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Title & Description */}
              <div className="p-4 bg-[#0D9488]/5 border-b border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                  {generatedOutline.title}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {generatedOutline.description}
                </p>
              </div>

              {/* Sections */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {generatedOutline.sections.map((section, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800">
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-[#0D9488] text-white text-xs font-medium rounded">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {section.title}
                        </span>
                      </div>
                      {expandedSections[idx] ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {expandedSections[idx] && (
                      <div className="px-4 pb-4 ml-9 space-y-3">
                        {/* Main Points */}
                        <ul className="space-y-1.5">
                          {section.points.map((point, pIdx) => (
                            <li
                              key={pIdx}
                              className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                            >
                              <span className="text-[#0D9488] font-medium">
                                {String.fromCharCode(97 + pIdx)}.
                              </span>
                              {point}
                            </li>
                          ))}
                        </ul>

                        {/* Subsections */}
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="pl-4 border-l-2 border-[#0D9488]/20 space-y-3">
                            {section.subsections.map((sub, subIdx) => (
                              <div key={subIdx}>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                                  {idx + 1}.{subIdx + 1} {sub.title}
                                </p>
                                <ul className="space-y-1">
                                  {sub.points.map((point, spIdx) => (
                                    <li
                                      key={spIdx}
                                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                                    >
                                      <span className="text-[#0D9488]">-</span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedOutline && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <List className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIOutlineGenerator.yourContentOutlineWillAppear', 'Your content outline will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIOutlineGeneratorTool;
