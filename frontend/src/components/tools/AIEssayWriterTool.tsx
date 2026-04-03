import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader2, Copy, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface EssayOutline {
  title: string;
  thesis: string;
  introduction: string;
  bodyParagraphs: {
    topic: string;
    points: string[];
    evidence: string;
  }[];
  conclusion: string;
  timestamp: Date;
}

interface AIEssayWriterToolProps {
  uiConfig?: UIConfig;
}

const essayTypes = [
  { label: 'Argumentative', value: 'argumentative' },
  { label: 'Expository', value: 'expository' },
  { label: 'Narrative', value: 'narrative' },
  { label: 'Descriptive', value: 'descriptive' },
  { label: 'Persuasive', value: 'persuasive' },
  { label: 'Compare/Contrast', value: 'compare-contrast' },
  { label: 'Cause/Effect', value: 'cause-effect' },
  { label: 'Research', value: 'research' },
];

const academicLevels = [
  { label: 'High School', value: 'high-school' },
  { label: 'Undergraduate', value: 'undergraduate' },
  { label: 'Graduate', value: 'graduate' },
  { label: 'Professional', value: 'professional' },
];

const paragraphCounts = [
  { label: '3 Paragraphs (Short)', value: 3 },
  { label: '5 Paragraphs (Standard)', value: 5 },
  { label: '7 Paragraphs (Extended)', value: 7 },
  { label: '10 Paragraphs (Long)', value: 10 },
];

export const AIEssayWriterTool: React.FC<AIEssayWriterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [essayType, setEssayType] = useState(essayTypes[0]);
  const [academicLevel, setAcademicLevel] = useState(academicLevels[0]);
  const [paragraphCount, setParagraphCount] = useState(paragraphCounts[1]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedOutline, setGeneratedOutline] = useState<EssayOutline | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const generatedSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.topic || params.text || params.content) {
        setTopic(params.topic || params.text || params.content || '');
        hasChanges = true;
      }

      if (params.essayType) {
        const matched = essayTypes.find(t => t.value === params.essayType?.toLowerCase());
        if (matched) {
          setEssayType(matched);
          hasChanges = true;
        }
      }

      if (params.academicLevel) {
        const matched = academicLevels.find(l => l.value === params.academicLevel?.toLowerCase());
        if (matched) {
          setAcademicLevel(matched);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter an essay topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Generate a detailed essay outline for the following:
Topic: ${topic}
Essay Type: ${essayType.label}
Academic Level: ${academicLevel.label}
Number of Body Paragraphs: ${paragraphCount.value - 2}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

Please provide a structured essay outline in JSON format with:
- title: A compelling essay title
- thesis: A clear thesis statement
- introduction: Brief introduction paragraph outline
- bodyParagraphs: Array of ${paragraphCount.value - 2} paragraphs, each with:
  - topic: Topic sentence
  - points: Array of 3 supporting points
  - evidence: Suggested evidence or examples
- conclusion: Conclusion paragraph outline

Return ONLY valid JSON.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert academic essay writer. Generate well-structured essay outlines in valid JSON format only.',
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Extract content and ensure it's a string
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      let outline: EssayOutline;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          outline = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch {
        outline = {
          title: topic,
          thesis: 'Generated thesis statement for your topic.',
          introduction: content.substring(0, 200),
          bodyParagraphs: [
            {
              topic: 'Main argument point',
              points: ['Supporting point 1', 'Supporting point 2', 'Supporting point 3'],
              evidence: 'Relevant evidence and examples',
            },
          ],
          conclusion: 'Summary of main arguments and final thoughts.',
          timestamp: new Date(),
        };
      }

      outline.timestamp = new Date();
      setGeneratedOutline(outline);

      setTimeout(() => {
        generatedSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);

      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Essay Outline: ${topic}`,
          content: JSON.stringify(outline),
          metadata: {
            type: 'essay-outline',
            essayType: essayType.value,
            academicLevel: academicLevel.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save outline:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate essay outline');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatOutlineForCopy = () => {
    if (!generatedOutline) return '';

    let text = `ESSAY OUTLINE\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Title: ${generatedOutline.title}\n\n`;
    text += `Thesis: ${generatedOutline.thesis}\n\n`;
    text += `INTRODUCTION\n${'-'.repeat(20)}\n${generatedOutline.introduction}\n\n`;

    generatedOutline.bodyParagraphs.forEach((para, idx) => {
      text += `BODY PARAGRAPH ${idx + 1}\n${'-'.repeat(20)}\n`;
      text += `Topic: ${para.topic}\n`;
      text += `Points:\n`;
      para.points.forEach((point, pIdx) => {
        text += `  ${pIdx + 1}. ${point}\n`;
      });
      text += `Evidence: ${para.evidence}\n\n`;
    });

    text += `CONCLUSION\n${'-'.repeat(20)}\n${generatedOutline.conclusion}\n`;

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
              <FileText className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.aIEssayWriter.aiEssayWriter', 'AI Essay Writer')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.aIEssayWriter.generateStructuredEssayOutlines', 'Generate structured essay outlines')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.aIEssayWriter.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIEssayWriter.essayTopic', 'Essay Topic')}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.aIEssayWriter.enterYourEssayTopicOr', 'Enter your essay topic or question...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Essay Type & Academic Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIEssayWriter.essayType', 'Essay Type')}
            </label>
            <select
              value={essayType.value}
              onChange={(e) => {
                const selected = essayTypes.find(t => t.value === e.target.value);
                if (selected) setEssayType(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {essayTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIEssayWriter.academicLevel', 'Academic Level')}
            </label>
            <select
              value={academicLevel.value}
              onChange={(e) => {
                const selected = academicLevels.find(l => l.value === e.target.value);
                if (selected) setAcademicLevel(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {academicLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Paragraph Count */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIEssayWriter.essayLength', 'Essay Length')}
          </label>
          <select
            value={paragraphCount.value}
            onChange={(e) => {
              const selected = paragraphCounts.find(p => p.value === Number(e.target.value));
              if (selected) setParagraphCount(selected);
            }}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
          >
            {paragraphCounts.map(count => (
              <option key={count.value} value={count.value}>{count.label}</option>
            ))}
          </select>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIEssayWriter.additionalNotesOptional', 'Additional Notes (Optional)')}
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={t('tools.aIEssayWriter.anySpecificRequirementsSourcesTo', 'Any specific requirements, sources to include, or points to emphasize...')}
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
              {t('tools.aIEssayWriter.generatingOutline', 'Generating Outline...')}
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              {t('tools.aIEssayWriter.generateEssayOutline', 'Generate Essay Outline')}
            </>
          )}
        </button>

        {/* Generated Outline Display */}
        {generatedOutline && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('tools.aIEssayWriter.essayOutline', 'Essay Outline')}
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.aIEssayWriter.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.aIEssayWriter.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Title */}
              <div className="p-4 bg-[#0D9488]/5 border-b border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {generatedOutline.title}
                </h5>
              </div>

              {/* Thesis */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-[#0D9488] mb-1">{t('tools.aIEssayWriter.thesisStatement', 'Thesis Statement')}</p>
                <p className="text-gray-800 dark:text-gray-200">{generatedOutline.thesis}</p>
              </div>

              {/* Introduction */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-[#0D9488] mb-1">{t('tools.aIEssayWriter.introduction', 'Introduction')}</p>
                <p className="text-gray-800 dark:text-gray-200">{generatedOutline.introduction}</p>
              </div>

              {/* Body Paragraphs */}
              {generatedOutline.bodyParagraphs.map((para, idx) => (
                <div key={idx} className="border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => toggleSection(idx)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm font-medium text-[#0D9488]">
                      Body Paragraph {idx + 1}: {para.topic.substring(0, 50)}...
                    </span>
                    {expandedSections[idx] ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedSections[idx] && (
                    <div className="px-4 pb-4 space-y-2">
                      <p className="text-gray-800 dark:text-gray-200 font-medium">{para.topic}</p>
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                        {para.points.map((point, pIdx) => (
                          <li key={pIdx}>{point}</li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        Evidence: {para.evidence}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Conclusion */}
              <div className="p-4">
                <p className="text-sm font-medium text-[#0D9488] mb-1">{t('tools.aIEssayWriter.conclusion', 'Conclusion')}</p>
                <p className="text-gray-800 dark:text-gray-200">{generatedOutline.conclusion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedOutline && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIEssayWriter.yourEssayOutlineWillAppear', 'Your essay outline will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEssayWriterTool;
