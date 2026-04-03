import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Copy, Loader2, Save, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const sectionTypes = [
  { value: 'executive_summary', label: 'Executive Summary' },
  { value: 'market_analysis', label: 'Market Analysis' },
  { value: 'financial_projections', label: 'Financial Projections' },
  { value: 'marketing_strategy', label: 'Marketing Strategy' },
  { value: 'operations_plan', label: 'Operations Plan' },
  { value: 'competitive_analysis', label: 'Competitive Analysis' },
];

interface BusinessPlanToolProps {
  uiConfig?: UIConfig;
}

export const BusinessPlanTool = ({ uiConfig }: BusinessPlanToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [sectionType, setSectionType] = useState(sectionTypes[0].value);
  const [businessModel, setBusinessModel] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [keyDifferentiators, setKeyDifferentiators] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      let hasPrefill = false;

      if (params.businessName) {
        setBusinessName(params.businessName);
        hasPrefill = true;
      }
      if (params.industry) {
        setIndustry(params.industry);
        hasPrefill = true;
      }
      if (params.sectionType) {
        const foundSection = sectionTypes.find(s => s.value === params.sectionType);
        if (foundSection) {
          setSectionType(foundSection.value);
          hasPrefill = true;
        }
      }
      if (params.businessModel) {
        setBusinessModel(params.businessModel);
        hasPrefill = true;
      }
      if (params.targetMarket) {
        setTargetMarket(params.targetMarket);
        hasPrefill = true;
      }
      if (params.keyDifferentiators) {
        setKeyDifferentiators(params.keyDifferentiators);
        hasPrefill = true;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const handleGenerate = async () => {
    if (!businessName.trim() || !industry.trim()) {
      setError('Business name and industry are required');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const selectedSection = sectionTypes.find(s => s.value === sectionType);
      const prompt = `Generate a professional ${selectedSection?.label} section for a business plan with the following details:

Business Name: ${businessName}
Industry: ${industry}
${businessModel ? `Business Model: ${businessModel}` : ''}
${targetMarket ? `Target Market: ${targetMarket}` : ''}
${keyDifferentiators ? `Key Differentiators: ${keyDifferentiators}` : ''}

Please provide a well-structured, professional ${selectedSection?.label} section that is comprehensive and business-ready. Use proper formatting with headings, bullet points where appropriate, and clear sections.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        maxTokens: 1500,
        temperature: 0.7,
      });

      if (response.data?.generatedText) {
        setOutput(response.data.generatedText);
      } else {
        setError('Failed to generate business plan section');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the business plan');
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
      const selectedSection = sectionTypes.find(s => s.value === sectionType);
      await api.post('/content', {
        content_type: 'text',
        title: `${businessName} - ${selectedSection?.label}`,
        content: output,
        metadata: {
          businessName,
          industry,
          sectionType,
          businessModel,
          targetMarket,
          keyDifferentiators,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
          <Briefcase className="w-6 h-6 text-[#0D9488]" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.businessPlan.businessPlanGenerator', 'Business Plan Generator')}
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.businessPlan.generateProfessionalBusinessPlanSections', 'Generate professional business plan sections with AI')}
          </p>
          {isPrefilled && (
            <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
              <Sparkles className="w-3 h-3" />
              <span>{t('tools.businessPlan.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.businessPlan.businessName', 'Business Name *')}
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t('tools.businessPlan.eGTechstartSolutions', 'e.g., TechStart Solutions')}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
            />
          </div>

          {/* Industry */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.businessPlan.industry', 'Industry *')}
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder={t('tools.businessPlan.eGSaasECommerce', 'e.g., SaaS, E-commerce, Healthcare')}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
            />
          </div>
        </div>

        {/* Section Type */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.businessPlan.sectionType', 'Section Type')}
          </label>
          <select
            value={sectionType}
            onChange={(e) => setSectionType(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
          >
            {sectionTypes.map((section) => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
          </select>
        </div>

        {/* Business Model */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.businessPlan.businessModelDescription', 'Business Model Description')}
          </label>
          <textarea
            value={businessModel}
            onChange={(e) => setBusinessModel(e.target.value)}
            placeholder={t('tools.businessPlan.describeYourBusinessModelSubscription', 'Describe your business model (subscription, freemium, marketplace, etc.)')}
            rows={2}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] resize-none`}
          />
        </div>

        {/* Target Market */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.businessPlan.targetMarket', 'Target Market')}
          </label>
          <input
            type="text"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            placeholder={t('tools.businessPlan.eGSmallBusinessesEnterprise', 'e.g., Small businesses, Enterprise companies, Consumers 25-45')}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`}
          />
        </div>

        {/* Key Differentiators */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.businessPlan.keyDifferentiators', 'Key Differentiators')}
          </label>
          <textarea
            value={keyDifferentiators}
            onChange={(e) => setKeyDifferentiators(e.target.value)}
            placeholder={t('tools.businessPlan.whatMakesYourBusinessUnique', 'What makes your business unique? (innovative technology, unique approach, competitive pricing, etc.)')}
            rows={2}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] resize-none`}
          />
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
            {t('tools.businessPlan.contentSavedSuccessfully', 'Content saved successfully!')}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !businessName.trim() || !industry.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0D9488]/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('tools.businessPlan.generating', 'Generating...')}
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                {t('tools.businessPlan.generateBusinessPlan', 'Generate Business Plan')}
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
            {t('tools.businessPlan.clear', 'Clear')}
          </button>
        </div>

        {/* Output Section */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.businessPlan.generatedBusinessPlanSection', 'Generated Business Plan Section')}
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
                  {copied ? t('tools.businessPlan.copied', 'Copied!') : t('tools.businessPlan.copy', 'Copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                    isSaving
                      ? 'bg-gray-400 text-white cursor-not-allowed' : t('tools.businessPlan.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('tools.businessPlan.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t('tools.businessPlan.save', 'Save')}
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

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.businessPlan.aboutBusinessPlanGenerator', 'About Business Plan Generator')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.businessPlan.generateProfessionalBusinessPlanSections2', 'Generate professional business plan sections using AI. This tool helps you create comprehensive, well-structured sections for your business plan including executive summaries, market analysis, financial projections, and more. Perfect for startups and entrepreneurs looking to formalize their business strategy.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanTool;
