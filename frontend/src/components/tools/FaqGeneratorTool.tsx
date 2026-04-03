import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Copy, Loader2, Save, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface FaqGeneratorToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

const audiences = [
  { value: 'customers', label: 'Customers' },
  { value: 'employees', label: 'Employees' },
  { value: 'users', label: 'Users' },
  { value: 'investors', label: 'Investors' },
  { value: 'partners', label: 'Partners' },
];

const faqCounts = [5, 10, 15, 20];

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'question',
    header: 'Question',
    type: 'string',
  },
  {
    key: 'answer',
    header: 'Answer',
    type: 'string',
  },
  {
    key: 'category',
    header: 'Category',
    type: 'string',
  },
];

export const FaqGeneratorTool: React.FC<FaqGeneratorToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState(audiences[0].value);
  const [faqCount, setFaqCount] = useState(10);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Apply prefill data from uiConfig.params or legacy prefillData
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.targetAudience) {
          setTargetAudience(params.targetAudience);
          hasPrefill = true;
        }
        if (params.faqCount) {
          setFaqCount(params.faqCount);
          hasPrefill = true;
        }
        if (params.includeCategories !== undefined) {
          setIncludeCategories(params.includeCategories);
          hasPrefill = true;
        }
        // Restore the generated FAQs
        if (params.faqs && Array.isArray(params.faqs)) {
          setFaqs(params.faqs);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.targetAudience) {
          setTargetAudience(params.targetAudience);
          hasPrefill = true;
        }
        if (params.faqCount) {
          setFaqCount(params.faqCount);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    } else if (prefillData?.params) {
      // Legacy prefill support
      if (prefillData.params.topic) setTopic(prefillData.params.topic);
      if (prefillData.params.targetAudience) setTargetAudience(prefillData.params.targetAudience);
      if (prefillData.params.faqCount) setFaqCount(prefillData.params.faqCount);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, prefillData]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Topic is required');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const prompt = `Generate ${faqCount} frequently asked questions (FAQs) about: ${topic}

Target Audience: ${targetAudience}
${includeCategories ? 'Include categories for each FAQ.' : ''}

Please provide a comprehensive list of FAQs with clear, helpful answers. Format the response as a JSON array with objects containing:
- question: the FAQ question
- answer: a detailed, helpful answer
${includeCategories ? '- category: a relevant category for the FAQ' : ''}

Make the questions relevant to ${targetAudience} and ensure answers are informative and professional.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        maxTokens: 2000,
        temperature: 0.7,
      });

      if (response.data?.generatedText) {
        try {
          // Try to parse as JSON first
          const jsonMatch = response.data.generatedText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedFaqs = JSON.parse(jsonMatch[0]);
            setFaqs(parsedFaqs);
          } else {
            // Fallback: parse text format
            const lines = response.data.generatedText.split('\n');
            const parsedFaqs: FaqItem[] = [];
            let currentFaq: Partial<FaqItem> = {};

            lines.forEach((line: string) => {
              const trimmed = line.trim();
              if (trimmed.match(/^(Q|Question)\s*\d*:?\s*/i)) {
                if (currentFaq.question && currentFaq.answer) {
                  parsedFaqs.push(currentFaq as FaqItem);
                }
                currentFaq = {
                  question: trimmed.replace(/^(Q|Question)\s*\d*:?\s*/i, ''),
                };
              } else if (trimmed.match(/^(A|Answer)\s*\d*:?\s*/i)) {
                currentFaq.answer = trimmed.replace(/^(A|Answer)\s*\d*:?\s*/i, '');
              } else if (trimmed.match(/^Category:?\s*/i)) {
                currentFaq.category = trimmed.replace(/^Category:?\s*/i, '');
              } else if (currentFaq.answer && trimmed) {
                currentFaq.answer += ' ' + trimmed;
              }
            });

            if (currentFaq.question && currentFaq.answer) {
              parsedFaqs.push(currentFaq as FaqItem);
            }

            setFaqs(parsedFaqs);
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          setError('Failed to parse generated FAQs. Please try again.');
        }
      } else {
        setError('Failed to generate FAQs');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating FAQs');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (faqs.length === 0) return;
    try {
      const text = faqs
        .map((faq, index) => {
          let faqText = `Q${index + 1}: ${faq.question}\n`;
          faqText += `A${index + 1}: ${faq.answer}`;
          if (faq.category) {
            faqText += `\nCategory: ${faq.category}`;
          }
          return faqText;
        })
        .join('\n\n');

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (faqs.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const content = faqs
        .map((faq, index) => {
          let faqText = `Q${index + 1}: ${faq.question}\n`;
          faqText += `A${index + 1}: ${faq.answer}`;
          if (faq.category) {
            faqText += `\nCategory: ${faq.category}`;
          }
          return faqText;
        })
        .join('\n\n');

      await api.post('/content', {
        content_type: 'text',
        title: `FAQs - ${topic}`,
        content,
        metadata: {
          toolId: 'faq-generator',
          topic,
          targetAudience,
          faqCount,
          includeCategories,
          faqs,
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
    setFaqs([]);
    setError(null);
    setSaveSuccess(false);
    setExpandedIndex(null);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
    }));
    exportToCSV(dataToExport, COLUMNS, { filename: 'faqs' });
  };

  const handleExportExcel = () => {
    const dataToExport = faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
    }));
    exportToExcel(dataToExport, COLUMNS, { filename: 'faqs' });
  };

  const handleExportJSON = () => {
    const dataToExport = faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
    }));
    exportToJSON(dataToExport, { filename: 'faqs' });
  };

  const handleExportPDF = async () => {
    const dataToExport = faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
    }));
    await exportToPDF(dataToExport, COLUMNS, {
      filename: 'faqs',
      title: `FAQs - ${topic || 'Generated FAQs'}`,
      orientation: 'portrait',
    });
  };

  const handlePrint = () => {
    const dataToExport = faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
    }));
    printData(dataToExport, COLUMNS, {
      title: `FAQs - ${topic || 'Generated FAQs'}`,
    });
  };

  const handleCopyToClipboard = async () => {
    const dataToExport = faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
    }));
    return await copyUtil(dataToExport, COLUMNS, 'tab');
  };

  // Group FAQs by category if categories are included
  const groupedFaqs = includeCategories && faqs.length > 0
    ? faqs.reduce((acc, faq) => {
        const category = faq.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(faq);
        return acc;
      }, {} as Record<string, FaqItem[]>)
    : { 'All FAQs': faqs };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#0D9488]/10 rounded-lg">
          <HelpCircle className="w-6 h-6 text-[#0D9488]" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.faqGenerator.faqGenerator', 'FAQ Generator')}
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.faqGenerator.generateComprehensiveFaqsWithAi', 'Generate comprehensive FAQs with AI')}
          </p>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mb-4 flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{isEditFromGallery ? t('tools.faqGenerator.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.faqGenerator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Input Fields */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.faqGenerator.productServiceTopic', 'Product/Service/Topic *')}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.faqGenerator.eGSaasProjectManagement', 'e.g., SaaS project management tool, Online course platform')}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Audience */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.faqGenerator.targetAudience', 'Target Audience')}
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
            >
              {audiences.map((audience) => (
                <option key={audience.value} value={audience.value}>
                  {audience.label}
                </option>
              ))}
            </select>
          </div>

          {/* FAQ Count */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.faqGenerator.numberOfFaqs', 'Number of FAQs')}
            </label>
            <select
              value={faqCount}
              onChange={(e) => setFaqCount(Number(e.target.value))}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
            >
              {faqCounts.map((count) => (
                <option key={count} value={count}>
                  {count} FAQs
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Include Categories */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCategories}
              onChange={(e) => setIncludeCategories(e.target.checked)}
              className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              {t('tools.faqGenerator.includeCategories', 'Include categories')}
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
            {t('tools.faqGenerator.contentSavedSuccessfully', 'Content saved successfully!')}
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
                {t('tools.faqGenerator.generating', 'Generating...')}
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4" />
                {t('tools.faqGenerator.generateFaqs', 'Generate FAQs')}
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
            {t('tools.faqGenerator.clear', 'Clear')}
          </button>
        </div>

        {/* Generated FAQs */}
        {faqs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Generated FAQs ({faqs.length})
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
                  {copied ? t('tools.faqGenerator.copied', 'Copied!') : t('tools.faqGenerator.copy', 'Copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                    isSaving
                      ? 'bg-gray-400 text-white cursor-not-allowed' : t('tools.faqGenerator.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('tools.faqGenerator.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t('tools.faqGenerator.save', 'Save')}
                    </>
                  )}
                </button>
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportJSON={handleExportJSON}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                  onCopyToClipboard={handleCopyToClipboard}
                  disabled={faqs.length === 0}
                  showImport={false}
                  theme={theme}
                />
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                <div key={category}>
                  {includeCategories && faqs.length > 0 && (
                    <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {category}
                    </h3>
                  )}
                  <div className="space-y-2">
                    {categoryFaqs.map((faq, index) => {
                      const globalIndex = faqs.indexOf(faq);
                      const isExpanded = expandedIndex === globalIndex;

                      return (
                        <div
                          key={globalIndex}
                          className={`border rounded-lg overflow-hidden ${
                            theme === 'dark'
                              ? 'border-gray-600 bg-gray-700'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <button
                            onClick={() => toggleExpand(globalIndex)}
                            className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                              theme === 'dark'
                                ? 'hover:bg-gray-600'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {faq.question}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            ) : (
                              <ChevronRight className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </button>
                          {isExpanded && (
                            <div className={`px-4 py-3 border-t ${
                              theme === 'dark'
                                ? 'border-gray-600 bg-gray-750'
                                : 'border-gray-100 bg-gray-50'
                            }`}>
                              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.faqGenerator.aboutFaqGenerator', 'About FAQ Generator')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.faqGenerator.generateComprehensiveFaqSectionsFor', 'Generate comprehensive FAQ sections for your product, service, or website. This AI-powered tool creates relevant questions and detailed answers tailored to your target audience, helping you provide better support and information to your users.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaqGeneratorTool;
