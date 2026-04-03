import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, Copy, Check, Sparkles, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface StudySection {
  title: string;
  keyTerms: { term: string; definition: string }[];
  concepts: string[];
  reviewQuestions: string[];
  tips: string[];
}

interface StudyGuide {
  title: string;
  subject: string;
  overview: string;
  learningObjectives: string[];
  sections: StudySection[];
  summaryNotes: string;
  timestamp: Date;
}

interface AIStudyGuideToolProps {
  uiConfig?: UIConfig;
}

const subjects = [
  { label: 'General', value: 'general' },
  { label: 'Mathematics', value: 'mathematics' },
  { label: 'Science', value: 'science' },
  { label: 'History', value: 'history' },
  { label: 'Literature', value: 'literature' },
  { label: 'Languages', value: 'languages' },
  { label: 'Social Sciences', value: 'social-sciences' },
  { label: 'Computer Science', value: 'computer-science' },
  { label: 'Business', value: 'business' },
  { label: 'Arts', value: 'arts' },
];

const studyLevels = [
  { label: 'Elementary', value: 'elementary' },
  { label: 'Middle School', value: 'middle-school' },
  { label: 'High School', value: 'high-school' },
  { label: 'Undergraduate', value: 'undergraduate' },
  { label: 'Graduate', value: 'graduate' },
  { label: 'Professional', value: 'professional' },
];

export const AIStudyGuideTool: React.FC<AIStudyGuideToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(subjects[0]);
  const [studyLevel, setStudyLevel] = useState(studyLevels[2]);
  const [focusAreas, setFocusAreas] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedGuide, setGeneratedGuide] = useState<StudyGuide | null>(null);
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

      if (params.subject) {
        const matched = subjects.find(s => s.value === params.subject?.toLowerCase());
        if (matched) {
          setSubject(matched);
          hasChanges = true;
        }
      }

      if (params.level || params.studyLevel) {
        const matched = studyLevels.find(l => l.value === (params.level || params.studyLevel)?.toLowerCase());
        if (matched) {
          setStudyLevel(matched);
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
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Create a comprehensive study guide for the following:
Topic: ${topic}
Subject Area: ${subject.label}
Study Level: ${studyLevel.label}
${focusAreas ? `Focus Areas: ${focusAreas}` : ''}

Generate a detailed study guide in JSON format:
{
  "title": "Study guide title",
  "subject": "${subject.label}",
  "overview": "Brief overview of the topic",
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "sections": [
    {
      "title": "Section title",
      "keyTerms": [
        {"term": "Term 1", "definition": "Definition 1"},
        {"term": "Term 2", "definition": "Definition 2"}
      ],
      "concepts": ["Key concept 1", "Key concept 2"],
      "reviewQuestions": ["Question 1?", "Question 2?"],
      "tips": ["Study tip 1", "Study tip 2"]
    }
  ],
  "summaryNotes": "Final summary and key takeaways"
}

Include 3-4 sections with comprehensive content appropriate for the study level. Return ONLY valid JSON.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert educator. Create comprehensive study guides with key terms, concepts, and review questions. Return content in valid JSON format only.',
        temperature: 0.7,
        maxTokens: 3000,
      });

      // Extract content and ensure it's a string
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      let guide: StudyGuide;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          guide = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        guide = {
          title: `Study Guide: ${topic}`,
          subject: subject.label,
          overview: 'A comprehensive guide to help you master this topic.',
          learningObjectives: [
            'Understand key concepts',
            'Apply knowledge to problems',
            'Analyze and evaluate information',
          ],
          sections: [
            {
              title: 'Introduction',
              keyTerms: [{ term: 'Key Term', definition: 'Definition of the key term' }],
              concepts: ['Main concept to understand'],
              reviewQuestions: ['What is the main idea?'],
              tips: ['Start with the basics before moving to advanced topics'],
            },
          ],
          summaryNotes: 'Review all sections and practice with the review questions.',
          timestamp: new Date(),
        };
      }

      guide.timestamp = new Date();
      setGeneratedGuide(guide);

      // Initialize all sections as expanded
      const expanded: Record<number, boolean> = {};
      guide.sections.forEach((_, idx) => {
        expanded[idx] = idx === 0;
      });
      setExpandedSections(expanded);

      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Study Guide: ${topic}`,
          content: JSON.stringify(guide),
          metadata: {
            type: 'study-guide',
            subject: subject.value,
            level: studyLevel.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save study guide:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate study guide');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatGuideForCopy = () => {
    if (!generatedGuide) return '';

    let text = `${generatedGuide.title}\n`;
    text += `${'='.repeat(60)}\n`;
    text += `Subject: ${generatedGuide.subject}\n\n`;
    text += `OVERVIEW\n${'-'.repeat(30)}\n${generatedGuide.overview}\n\n`;
    text += `LEARNING OBJECTIVES\n${'-'.repeat(30)}\n`;
    generatedGuide.learningObjectives.forEach((obj, idx) => {
      text += `${idx + 1}. ${obj}\n`;
    });
    text += '\n';

    generatedGuide.sections.forEach((section, idx) => {
      text += `\n${'='.repeat(40)}\n`;
      text += `SECTION ${idx + 1}: ${section.title.toUpperCase()}\n`;
      text += `${'='.repeat(40)}\n\n`;

      text += `KEY TERMS:\n`;
      section.keyTerms.forEach(kt => {
        text += `  - ${kt.term}: ${kt.definition}\n`;
      });

      text += `\nKEY CONCEPTS:\n`;
      section.concepts.forEach(c => {
        text += `  * ${c}\n`;
      });

      text += `\nREVIEW QUESTIONS:\n`;
      section.reviewQuestions.forEach((q, qIdx) => {
        text += `  ${qIdx + 1}. ${q}\n`;
      });

      text += `\nSTUDY TIPS:\n`;
      section.tips.forEach(t => {
        text += `  > ${t}\n`;
      });
    });

    text += `\n${'='.repeat(60)}\n`;
    text += `SUMMARY NOTES\n${'-'.repeat(30)}\n${generatedGuide.summaryNotes}\n`;

    return text;
  };

  const handleCopy = async () => {
    const text = formatGuideForCopy();
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
              <BookOpen className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.aIStudyGuide.aiStudyGuide', 'AI Study Guide')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.aIStudyGuide.generateComprehensiveStudyMaterials', 'Generate comprehensive study materials')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.aIStudyGuide.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIStudyGuide.studyTopic', 'Study Topic')}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.aIStudyGuide.enterTheTopicYouNeed', 'Enter the topic you need to study (e.g., \'Photosynthesis\', \'World War II\', \'Linear Algebra\')...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Subject & Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIStudyGuide.subjectArea', 'Subject Area')}
            </label>
            <select
              value={subject.value}
              onChange={(e) => {
                const selected = subjects.find(s => s.value === e.target.value);
                if (selected) setSubject(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {subjects.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIStudyGuide.studyLevel', 'Study Level')}
            </label>
            <select
              value={studyLevel.value}
              onChange={(e) => {
                const selected = studyLevels.find(l => l.value === e.target.value);
                if (selected) setStudyLevel(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {studyLevels.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIStudyGuide.specificFocusAreasOptional', 'Specific Focus Areas (Optional)')}
          </label>
          <textarea
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
            placeholder={t('tools.aIStudyGuide.anySpecificTopicsChaptersOr', 'Any specific topics, chapters, or concepts you want to focus on...')}
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
              {t('tools.aIStudyGuide.creatingStudyGuide', 'Creating Study Guide...')}
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5" />
              {t('tools.aIStudyGuide.generateStudyGuide', 'Generate Study Guide')}
            </>
          )}
        </button>

        {/* Generated Study Guide Display */}
        {generatedGuide && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t('tools.aIStudyGuide.studyGuide', 'Study Guide')}
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.aIStudyGuide.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.aIStudyGuide.copyAll', 'Copy All')}
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Title & Overview */}
              <div className="p-4 bg-[#0D9488]/5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-[#0D9488] font-medium mb-1">
                  {generatedGuide.subject}
                </div>
                <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {generatedGuide.title}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {generatedGuide.overview}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h6 className="text-sm font-medium text-[#0D9488] mb-2">{t('tools.aIStudyGuide.learningObjectives', 'Learning Objectives')}</h6>
                <ul className="space-y-1.5">
                  {generatedGuide.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-[#0D9488] font-medium">{idx + 1}.</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sections */}
              {generatedGuide.sections.map((section, idx) => (
                <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <button
                    onClick={() => toggleSection(idx)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-[#0D9488] text-white text-xs rounded">
                        {idx + 1}
                      </span>
                      {section.title}
                    </span>
                    {expandedSections[idx] ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {expandedSections[idx] && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Key Terms */}
                      <div>
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-2">{t('tools.aIStudyGuide.keyTerms', 'Key Terms')}</h6>
                        <div className="grid gap-2">
                          {section.keyTerms.map((kt, ktIdx) => (
                            <div key={ktIdx} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                              <span className="font-medium text-gray-900 dark:text-white">{kt.term}</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{kt.definition}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Concepts */}
                      <div>
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-2">{t('tools.aIStudyGuide.keyConcepts', 'Key Concepts')}</h6>
                        <ul className="space-y-1">
                          {section.concepts.map((c, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="text-[#0D9488]">*</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Review Questions */}
                      <div>
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-2">{t('tools.aIStudyGuide.reviewQuestions', 'Review Questions')}</h6>
                        <ol className="space-y-1.5">
                          {section.reviewQuestions.map((q, qIdx) => (
                            <li key={qIdx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="text-[#0D9488] font-medium">Q{qIdx + 1}.</span>
                              {q}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Study Tips */}
                      <div className="bg-[#0D9488]/5 p-3 rounded-lg">
                        <h6 className="text-xs font-medium text-[#0D9488] uppercase mb-2">{t('tools.aIStudyGuide.studyTips', 'Study Tips')}</h6>
                        <ul className="space-y-1">
                          {section.tips.map((t, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Sparkles className="w-3.5 h-3.5 text-[#0D9488] mt-0.5 flex-shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Summary Notes */}
              <div className="p-4 bg-[#0D9488]/5">
                <h6 className="text-sm font-medium text-[#0D9488] mb-2">{t('tools.aIStudyGuide.summaryNotes', 'Summary Notes')}</h6>
                <p className="text-sm text-gray-700 dark:text-gray-300">{generatedGuide.summaryNotes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedGuide && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIStudyGuide.yourStudyGuideWillAppear', 'Your study guide will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStudyGuideTool;
