import React, { useState, useEffect } from 'react';
import { Lightbulb, Loader2, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ThesisStatement {
  thesis: string;
  type: string;
  explanation: string;
  counterarguments: string[];
  timestamp: Date;
}

interface AIThesisGeneratorToolProps {
  uiConfig?: UIConfig;
}

const thesisTypes = [
  { label: 'Argumentative', value: 'argumentative', description: 'Takes a strong position on a debatable issue' },
  { label: 'Analytical', value: 'analytical', description: 'Breaks down an issue into components for analysis' },
  { label: 'Expository', value: 'expository', description: 'Explains something to the reader' },
  { label: 'Comparative', value: 'comparative', description: 'Compares two or more subjects' },
  { label: 'Cause/Effect', value: 'cause-effect', description: 'Explores reasons and consequences' },
];

const disciplines = [
  { label: 'General', value: 'general' },
  { label: 'Literature', value: 'literature' },
  { label: 'History', value: 'history' },
  { label: 'Science', value: 'science' },
  { label: 'Social Sciences', value: 'social-sciences' },
  { label: 'Philosophy', value: 'philosophy' },
  { label: 'Business', value: 'business' },
  { label: 'Technology', value: 'technology' },
];

export const AIThesisGeneratorTool: React.FC<AIThesisGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [thesisType, setThesisType] = useState(thesisTypes[0]);
  const [discipline, setDiscipline] = useState(disciplines[0]);
  const [stance, setStance] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTheses, setGeneratedTheses] = useState<ThesisStatement[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.topic || params.text || params.content) {
        setTopic(params.topic || params.text || params.content || '');
        hasChanges = true;
      }

      if (params.stance || params.position) {
        setStance(params.stance || params.position || '');
        hasChanges = true;
      }

      if (params.thesisType) {
        const matched = thesisTypes.find(t => t.value === params.thesisType?.toLowerCase());
        if (matched) {
          setThesisType(matched);
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
      const prompt = `Generate 3 strong thesis statements for the following:
Topic: ${topic}
Thesis Type: ${thesisType.label} - ${thesisType.description}
Academic Discipline: ${discipline.label}
${stance ? `Preferred Stance/Position: ${stance}` : ''}

For each thesis statement, provide in JSON format:
{
  "theses": [
    {
      "thesis": "The complete thesis statement",
      "type": "${thesisType.value}",
      "explanation": "Brief explanation of how this thesis works",
      "counterarguments": ["Potential counterargument 1", "Potential counterargument 2"]
    }
  ]
}

Make each thesis statement clear, specific, and arguable. Return ONLY valid JSON.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert academic writer. Generate strong, arguable thesis statements with explanations and potential counterarguments. Return content in valid JSON format only.',
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Extract content and ensure it's a string
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      let theses: ThesisStatement[] = [];
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          theses = (parsed.theses || [parsed]).map((t: any) => ({
            ...t,
            timestamp: new Date(),
          }));
        }
      } catch {
        theses = [{
          thesis: content,
          type: thesisType.value,
          explanation: 'A strong thesis statement for your topic.',
          counterarguments: ['Consider opposing viewpoints'],
          timestamp: new Date(),
        }];
      }

      setGeneratedTheses(theses);

      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Thesis Statements: ${topic}`,
          content: JSON.stringify(theses),
          metadata: {
            type: 'thesis',
            thesisType: thesisType.value,
            discipline: discipline.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save thesis:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate thesis');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (thesis: ThesisStatement, index: number) => {
    await navigator.clipboard.writeText(thesis.thesis);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Lightbulb className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.aIThesisGenerator.aiThesisGenerator', 'AI Thesis Generator')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.aIThesisGenerator.createStrongThesisStatements', 'Create strong thesis statements')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.aIThesisGenerator.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIThesisGenerator.researchTopicOrQuestion', 'Research Topic or Question')}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.aIThesisGenerator.enterYourTopicResearchQuestion', 'Enter your topic, research question, or subject area...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Thesis Type & Discipline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIThesisGenerator.thesisType', 'Thesis Type')}
            </label>
            <select
              value={thesisType.value}
              onChange={(e) => {
                const selected = thesisTypes.find(t => t.value === e.target.value);
                if (selected) setThesisType(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {thesisTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">{thesisType.description}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aIThesisGenerator.academicDiscipline', 'Academic Discipline')}
            </label>
            <select
              value={discipline.value}
              onChange={(e) => {
                const selected = disciplines.find(d => d.value === e.target.value);
                if (selected) setDiscipline(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {disciplines.map(disc => (
                <option key={disc.value} value={disc.value}>{disc.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stance/Position */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aIThesisGenerator.yourStanceOrPositionOptional', 'Your Stance or Position (Optional)')}
          </label>
          <input
            type="text"
            value={stance}
            onChange={(e) => setStance(e.target.value)}
            placeholder={t('tools.aIThesisGenerator.eGInFavorOf', 'e.g., \'In favor of renewable energy\' or \'Critical of social media\'')}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
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
              {t('tools.aIThesisGenerator.generatingThesisStatements', 'Generating Thesis Statements...')}
            </>
          ) : (
            <>
              <Lightbulb className="w-5 h-5" />
              {t('tools.aIThesisGenerator.generateThesisStatements', 'Generate Thesis Statements')}
            </>
          )}
        </button>

        {/* Generated Theses Display */}
        {generatedTheses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                {t('tools.aIThesisGenerator.generatedThesisStatements', 'Generated Thesis Statements')}
              </h4>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.aIThesisGenerator.regenerate', 'Regenerate')}
              </button>
            </div>

            <div className="space-y-4">
              {generatedTheses.map((thesis, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {/* Thesis Statement */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 bg-[#0D9488] text-white text-sm font-medium rounded-full">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-[#0D9488] uppercase">
                          {thesis.type}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(thesis, idx)}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3" />
                            {t('tools.aIThesisGenerator.copied', 'Copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            {t('tools.aIThesisGenerator.copy', 'Copy')}
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                      "{thesis.thesis}"
                    </p>

                    {/* Explanation */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{t('tools.aIThesisGenerator.whyItWorks', 'Why it works:')}</span> {thesis.explanation}
                      </p>
                    </div>

                    {/* Counterarguments */}
                    {thesis.counterarguments && thesis.counterarguments.length > 0 && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t('tools.aIThesisGenerator.potentialCounterarguments', 'Potential Counterarguments:')}
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {thesis.counterarguments.map((arg, argIdx) => (
                            <li key={argIdx} className="flex items-start gap-2">
                              <span className="text-[#0D9488]">-</span>
                              {arg}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedTheses.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aIThesisGenerator.yourThesisStatementsWillAppear', 'Your thesis statements will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIThesisGeneratorTool;
