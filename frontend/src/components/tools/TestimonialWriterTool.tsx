import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, Loader2, Copy, Check, RefreshCw, Sparkles, Save, CheckCircle } from 'lucide-react';
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

interface TestimonialWriterToolProps {
  uiConfig?: UIConfig;
}

const testimonialTypes = [
  { value: 'product', label: 'Product Testimonial' },
  { value: 'service', label: 'Service Testimonial' },
  { value: 'course', label: 'Course/Training Testimonial' },
  { value: 'consulting', label: 'Consulting/Coaching Testimonial' },
  { value: 'software', label: 'Software/SaaS Testimonial' },
  { value: 'freelancer', label: 'Freelancer/Contractor Testimonial' },
  { value: 'agency', label: 'Agency Testimonial' },
];

const lengths = [
  { value: 'short', label: 'Short (1-2 sentences)' },
  { value: 'medium', label: 'Medium (3-4 sentences)' },
  { value: 'long', label: 'Long (Full paragraph)' },
];

const COLUMNS: ColumnConfig[] = [
  { key: 'testimonial', header: 'Testimonial' },
  { key: 'index', header: 'Number' },
];

export const TestimonialWriterTool: React.FC<TestimonialWriterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [testimonialType, setTestimonialType] = useState('product');
  const [productName, setProductName] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [keyResults, setKeyResults] = useState('');
  const [length, setLength] = useState('medium');
  const [count, setCount] = useState('3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle prefill from uiConfig or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.testimonialType) {
          setTestimonialType(params.testimonialType);
          hasPrefill = true;
        }
        if (params.productName) {
          setProductName(params.productName);
          hasPrefill = true;
        }
        if (params.customerType) {
          setCustomerType(params.customerType);
          hasPrefill = true;
        }
        if (params.problemSolved) {
          setProblemSolved(params.problemSolved);
          hasPrefill = true;
        }
        if (params.keyResults) {
          setKeyResults(params.keyResults);
          hasPrefill = true;
        }
        if (params.length) {
          setLength(params.length);
          hasPrefill = true;
        }
        if (params.count) {
          setCount(params.count);
          hasPrefill = true;
        }
        // Restore the generated testimonial(s)
        if (params.text) {
          setTestimonials([params.text]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.content) {
          setProductName(params.text || params.content || '');
          hasPrefill = true;
        }
        if (params.formData) {
          if (params.formData.testimonialType) setTestimonialType(params.formData.testimonialType);
          if (params.formData.productName) setProductName(params.formData.productName);
          if (params.formData.customerType) setCustomerType(params.formData.customerType);
          if (params.formData.problemSolved) setProblemSolved(params.formData.problemSolved);
          if (params.formData.keyResults) setKeyResults(params.formData.keyResults);
          if (params.formData.length) setLength(params.formData.length);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setError('Please enter the product/service name');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = testimonialTypes.find(t => t.value === testimonialType)?.label;
      const lengthLabel = lengths.find(l => l.value === length)?.label;

      const prompt = `Generate ${count} authentic-sounding ${typeLabel}s for: ${productName}

Details:
- Customer Type: ${customerType || 'Various professionals'}
- Problem Solved: ${problemSolved || 'General benefits'}
- Key Results/Benefits: ${keyResults || 'Positive outcomes'}
- Length: ${lengthLabel}

Requirements:
1. Each testimonial should sound authentic and natural
2. Include specific details and results when possible
3. Vary the style and focus of each testimonial
4. ${length === 'short' ? 'Keep each to 1-2 punchy sentences' : length === 'medium' ? 'Write 3-4 detailed sentences each' : 'Write a full paragraph each'}
5. Include fictional but realistic names and titles
6. Mention specific benefits or results
7. Make them believable - avoid over-the-top praise
8. Include emotional elements where appropriate
9. Some should focus on problems solved, others on results achieved

Format each testimonial as:
[Testimonial text]
— [Name], [Title/Company]

Separate each testimonial with a blank line.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a copywriter who creates authentic, compelling testimonials that build trust and credibility.',
        temperature: 0.9,
        maxTokens: 2000,
      });

      if (response.success && response.data?.text) {
        const parsed = response.data.text
          .split('\n\n')
          .filter((t: string) => t.trim().length > 20)
          .slice(0, parseInt(count));
        setTestimonials(parsed);
      } else {
        setError(response.error || 'Failed to generate testimonials');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(testimonials.join('\n\n'));
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveTestimonial = async (testimonial: string, index: number) => {
    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Testimonial: ${productName} (#${index + 1})`,
        prompt: `Testimonial for ${productName}`,
        metadata: {
          text: testimonial,
          toolId: 'testimonial-writer',
          testimonialType,
          productName,
          customerType,
          problemSolved,
          keyResults,
          length,
          count,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const data = testimonials.map((testimonial, index) => ({
      testimonial,
      index: index + 1,
    }));
    exportToCSV(data, COLUMNS, { filename: 'testimonials' });
  };

  const handleExportExcel = () => {
    const data = testimonials.map((testimonial, index) => ({
      testimonial,
      index: index + 1,
    }));
    exportToExcel(data, COLUMNS, { filename: 'testimonials' });
  };

  const handleExportJSON = () => {
    const data = testimonials.map((testimonial, index) => ({
      testimonial,
      index: index + 1,
    }));
    exportToJSON(data, { filename: 'testimonials' });
  };

  const handleExportPDF = async () => {
    const data = testimonials.map((testimonial, index) => ({
      testimonial,
      index: index + 1,
    }));
    await exportToPDF(data, COLUMNS, {
      filename: 'testimonials',
      title: 'Generated Testimonials',
      subtitle: `Export of ${testimonials.length} testimonials`,
    });
  };

  const handlePrint = () => {
    const data = testimonials.map((testimonial, index) => ({
      testimonial,
      index: index + 1,
    }));
    printData(data, COLUMNS, { title: 'Generated Testimonials' });
  };

  const handleCopyToClipboard = async () => {
    const data = testimonials.map((testimonial, index) => ({
      testimonial,
      index: index + 1,
    }));
    return await copyUtil(data, COLUMNS, 'tab');
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-green-900/20' : 'from-white to-green-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Quote className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.testimonialWriter.testimonialGenerator', 'Testimonial Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.testimonialWriter.createCompellingTestimonialsForYour', 'Create compelling testimonials for your business')}</p>
          </div>
        </div>
        {testimonials.length > 0 && (
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={theme}
          />
        )}
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.testimonialWriter.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.testimonialWriter.contentLoadedFromYourConversation', 'Content loaded from your conversation')}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.testimonialWriter.testimonialType', 'Testimonial Type')}</label>
            <select
              value={testimonialType}
              onChange={(e) => setTestimonialType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {testimonialTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.testimonialWriter.productServiceName', 'Product/Service Name *')}</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={t('tools.testimonialWriter.whatAreYouGettingTestimonials', 'What are you getting testimonials for?')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.testimonialWriter.idealCustomerType', 'Ideal Customer Type')}</label>
          <input
            type="text"
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            placeholder={t('tools.testimonialWriter.eGSmallBusinessOwners', 'e.g., Small business owners, Marketing managers, Freelancers')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.testimonialWriter.problemSolved', 'Problem Solved')}</label>
          <textarea
            value={problemSolved}
            onChange={(e) => setProblemSolved(e.target.value)}
            placeholder={t('tools.testimonialWriter.whatMainProblemDoesYour', 'What main problem does your product/service solve?')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.testimonialWriter.keyResultsBenefits', 'Key Results/Benefits')}</label>
          <input
            type="text"
            value={keyResults}
            onChange={(e) => setKeyResults(e.target.value)}
            placeholder={t('tools.testimonialWriter.eGSaved10Hours', 'e.g., Saved 10 hours/week, Increased sales by 30%')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.testimonialWriter.length', 'Length')}</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {lengths.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.testimonialWriter.numberOfTestimonials', 'Number of Testimonials')}</label>
            <select
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              <option value="3">3 Testimonials</option>
              <option value="5">5 Testimonials</option>
              <option value="7">7 Testimonials</option>
              <option value="10">10 Testimonials</option>
            </select>
          </div>
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !productName.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Quote className="w-5 h-5" />}
          {isGenerating ? t('tools.testimonialWriter.generating', 'Generating...') : t('tools.testimonialWriter.generateTestimonials', 'Generate Testimonials')}
        </button>

        {testimonials.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                Generated Testimonials
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {t('tools.testimonialWriter.editable', 'Editable')}
                </span>
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.testimonialWriter.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.testimonialWriter.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.testimonialWriter.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleCopyAll}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  {copiedIndex === -1 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copiedIndex === -1 ? t('tools.testimonialWriter.copied', 'Copied!') : t('tools.testimonialWriter.copyAll', 'Copy All')}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`p-5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl relative`}
                >
                  <Quote className={`w-8 h-8 ${theme === 'dark' ? 'text-green-500/20' : 'text-green-500/10'} absolute top-3 left-3`} />
                  <textarea
                    value={testimonial}
                    onChange={(e) => {
                      const updated = [...testimonials];
                      updated[index] = e.target.value;
                      setTestimonials(updated);
                    }}
                    rows={4}
                    className={`w-full pl-6 pr-20 bg-transparent border-0 outline-none resize-y text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}
                    placeholder={t('tools.testimonialWriter.testimonialText', 'Testimonial text...')}
                  />
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      onClick={() => handleSaveTestimonial(testimonial, index)}
                      disabled={isSaving}
                      className={`p-2 ${theme === 'dark' ? 'bg-green-900/30 hover:bg-green-900/50 text-green-400' : 'bg-green-50 hover:bg-green-100 text-green-700'} rounded-lg`}
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(testimonial, index)}
                      className={`p-2 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-gray-100'} rounded-lg shadow-sm`}
                    >
                      {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialWriterTool;
