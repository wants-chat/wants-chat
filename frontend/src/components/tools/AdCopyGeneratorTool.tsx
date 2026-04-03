import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Loader2, Copy, Check, Save, Sparkles } from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface GeneratedAd {
  text: string;
  timestamp: Date;
}

const platforms = [
  { value: 'google', label: 'Google Ads' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
];

const tones = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'playful', label: 'Playful' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'conversational', label: 'Conversational' },
];

const ctas = [
  'Shop Now',
  'Learn More',
  'Get Started',
  'Sign Up',
  'Download',
  'Try Free',
  'Buy Now',
  'Contact Us',
  'Limited Offer',
  'Custom',
];

const COLUMNS: ColumnConfig[] = [
  {
    key: 'text',
    header: 'Ad Copy',
    type: 'string',
  },
  {
    key: 'timestamp',
    header: 'Generated At',
    type: 'date',
  },
];

interface AdCopyGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const AdCopyGeneratorTool = ({ uiConfig }: AdCopyGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState(platforms[0].value);
  const [tone, setTone] = useState(tones[0].value);
  const [cta, setCta] = useState(ctas[0]);
  const [customCta, setCustomCta] = useState('');
  const [variations, setVariations] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      let hasPrefill = false;

      if (params.productName) {
        setProductName(params.productName);
        hasPrefill = true;
      }
      if (params.description) {
        setDescription(params.description);
        hasPrefill = true;
      }
      if (params.targetAudience) {
        setTargetAudience(params.targetAudience);
        hasPrefill = true;
      }
      if (params.platform) {
        const foundPlatform = platforms.find(p => p.value === params.platform);
        if (foundPlatform) {
          setPlatform(foundPlatform.value);
          hasPrefill = true;
        }
      }
      if (params.tone) {
        const foundTone = tones.find(t => t.value === params.tone);
        if (foundTone) {
          setTone(foundTone.value);
          hasPrefill = true;
        }
      }
      if (params.cta) {
        if (ctas.includes(params.cta)) {
          setCta(params.cta);
        } else {
          setCta('Custom');
          setCustomCta(params.cta);
        }
        hasPrefill = true;
      }
      if (params.variations) {
        setVariations(params.variations);
        hasPrefill = true;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const handleGenerate = async () => {
    if (!productName.trim() || !description.trim()) {
      setError('Please provide product name and description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const selectedCta = cta === 'Custom' ? customCta : cta;
      const systemMessage = `You are an expert advertising copywriter specializing in ${platform} ads. Generate compelling, conversion-focused ad copy.`;

      const prompt = `Create ${variations} different ad copy variations for the following:

Product/Service: ${productName}
Description: ${description}
Target Audience: ${targetAudience || 'General audience'}
Platform: ${platform}
Tone: ${tone}
Call-to-Action: ${selectedCta}

Requirements:
- Keep each variation concise and platform-appropriate
- Use ${tone} tone throughout
- Include the CTA naturally
- Focus on benefits, not just features
- Create urgency where appropriate
- Make it engaging and scroll-stopping

Format: Return each variation separated by "---" (three dashes on a new line)`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage,
        temperature: 0.9,
        maxTokens: 1500,
      });

      if (response.success && response.data?.text) {
        const adTexts = response.data.text
          .split('---')
          .map((text: string) => text.trim())
          .filter((text: string) => text.length > 0);

        const newAds = adTexts.map((text: string) => ({
          text,
          timestamp: new Date(),
        }));

        setGeneratedAds(newAds);
      } else {
        setError(response.error || 'Failed to generate ad copy');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating ad copy');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async (text: string) => {
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Ad Copy: ${productName}`,
        prompt: `Ad copy for ${productName}`,
        metadata: {
          text,
          toolId: 'ad-copy-generator',
          productName,
          platform,
          tone,
        },
      });
      setValidationMessage('Ad copy saved successfully!');
      setTimeout(() => setValidationMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setValidationMessage('Failed to save ad copy');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = generatedAds.map(ad => ({
      text: ad.text,
      timestamp: ad.timestamp,
    }));
    exportToCSV(dataToExport, COLUMNS, { filename: 'ad-copy' });
  };

  const handleExportExcel = () => {
    const dataToExport = generatedAds.map(ad => ({
      text: ad.text,
      timestamp: ad.timestamp,
    }));
    exportToExcel(dataToExport, COLUMNS, { filename: 'ad-copy' });
  };

  const handleExportJSON = () => {
    const dataToExport = generatedAds.map(ad => ({
      text: ad.text,
      timestamp: ad.timestamp,
    }));
    exportToJSON(dataToExport, { filename: 'ad-copy' });
  };

  const handleExportPDF = async () => {
    const dataToExport = generatedAds.map(ad => ({
      text: ad.text,
      timestamp: ad.timestamp,
    }));
    await exportToPDF(dataToExport, COLUMNS, {
      filename: 'ad-copy',
      title: `Ad Copy - ${productName || 'Generated Ads'}`,
      orientation: 'portrait',
    });
  };

  const handlePrint = () => {
    const dataToExport = generatedAds.map(ad => ({
      text: ad.text,
      timestamp: ad.timestamp,
    }));
    printData(dataToExport, COLUMNS, {
      title: `Ad Copy - ${productName || 'Generated Ads'}`,
    });
  };

  const handleCopyToClipboard = async () => {
    const dataToExport = generatedAds.map(ad => ({
      text: ad.text,
      timestamp: ad.timestamp,
    }));
    return await copyUtil(dataToExport, COLUMNS, 'tab');
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-teal-900/20' : t('tools.adCopyGenerator.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Megaphone className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.adCopyGenerator.aiAdCopyGenerator', 'AI Ad Copy Generator')}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.adCopyGenerator.createCompellingAdvertisingCopyThat', 'Create compelling advertising copy that converts')}</p>
              {isPrefilled && (
                <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                  <Sparkles className="w-3 h-3" />
                  <span>{t('tools.adCopyGenerator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
                </div>
              )}
            </div>
          </div>
          {generatedAds.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={generatedAds.length === 0}
              showImport={false}
              theme={theme}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Product Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.adCopyGenerator.productServiceName', 'Product/Service Name *')}
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder={t('tools.adCopyGenerator.eGProfitSmartWatch', 'e.g., ProFit Smart Watch')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.adCopyGenerator.productDescription', 'Product Description *')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('tools.adCopyGenerator.describeYourProductKeyFeatures', 'Describe your product, key features, and main benefits...')}
            rows={4}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.adCopyGenerator.targetAudience', 'Target Audience')}
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder={t('tools.adCopyGenerator.eGTechSavvyMillennials', 'e.g., Tech-savvy millennials, busy professionals...')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Platform and Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.adCopyGenerator.platform', 'Platform')}</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.adCopyGenerator.tone', 'Tone')}</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CTA Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.adCopyGenerator.callToAction', 'Call-to-Action')}</label>
          <div className="flex gap-2">
            <select
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className={`flex-1 px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {ctas.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {cta === 'Custom' && (
              <input
                type="text"
                value={customCta}
                onChange={(e) => setCustomCta(e.target.value)}
                placeholder={t('tools.adCopyGenerator.enterCustomCta', 'Enter custom CTA')}
                className={`flex-1 px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            )}
          </div>
        </div>

        {/* Number of Variations */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Variations: {variations}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={variations}
            onChange={(e) => setVariations(Number(e.target.value))}
            className="w-full accent-[#0D9488]"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1</span>
            <span>5</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} text-sm`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !productName.trim() || !description.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.adCopyGenerator.generatingAdCopy', 'Generating Ad Copy...')}
            </>
          ) : (
            <>
              <Megaphone className="w-5 h-5" />
              {t('tools.adCopyGenerator.generateAdCopy', 'Generate Ad Copy')}
            </>
          )}
        </button>

        {/* Generated Ads */}
        {generatedAds.length > 0 && (
          <div className="space-y-4">
            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Megaphone className="w-4 h-4" />
              {t('tools.adCopyGenerator.generatedAdCopy', 'Generated Ad Copy')}
            </h4>
            <div className="space-y-3">
              {generatedAds.map((ad, index) => (
                <div
                  key={`${ad.timestamp.getTime()}-${index}`}
                  className={`p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl space-y-3`}
                >
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} whitespace-pre-wrap`}>{ad.text}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(ad.text, index)}
                      className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'} rounded-lg transition-colors text-sm`}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          {t('tools.adCopyGenerator.copied', 'Copied!')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t('tools.adCopyGenerator.copy', 'Copy')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleSave(ad.text)}
                      className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-teal-900/30 hover:bg-teal-900/50 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'} border ${theme === 'dark' ? 'border-teal-800' : 'border-teal-200'} rounded-lg transition-colors text-sm`}
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.adCopyGenerator.save', 'Save')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedAds.length === 0 && !isGenerating && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.adCopyGenerator.yourGeneratedAdCopyWill', 'Your generated ad copy will appear here')}</p>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
          validationMessage.includes('success') ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default AdCopyGeneratorTool;
