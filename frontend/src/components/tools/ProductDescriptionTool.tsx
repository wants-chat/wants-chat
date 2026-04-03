import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Loader2, Copy, Check, Save, Sparkles, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface ProductDescriptionToolProps {
  uiConfig?: UIConfig;
}

interface GeneratedDescription {
  id: string;
  content: string;
  productName: string;
  productType: string;
  tone: string;
  platform: string;
  timestamp: string;
}

const columns = [
  { key: 'productName', label: 'Product Name' },
  { key: 'content', label: 'Description' },
  { key: 'tone', label: 'Tone' },
  { key: 'platform', label: 'Platform' },
  { key: 'timestamp', label: 'Created' },
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'playful', label: 'Playful' },
  { value: 'technical', label: 'Technical' },
  { value: 'minimalist', label: 'Minimalist' },
];

const platforms = [
  { value: 'ecommerce', label: 'E-commerce Store' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'etsy', label: 'Etsy' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'social', label: 'Social Media' },
  { value: 'general', label: 'General' },
];

const lengths = [
  { value: 'short', label: 'Short (50-100 words)' },
  { value: 'medium', label: 'Medium (100-200 words)' },
  { value: 'long', label: 'Long (200-400 words)' },
];

export const ProductDescriptionTool: React.FC<ProductDescriptionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState(tones[0].value);
  const [platform, setPlatform] = useState(platforms[0].value);
  const [length, setLength] = useState(lengths[1].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [currentMeta, setCurrentMeta] = useState<{ productName: string; productType: string; tone: string; platform: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Use tool data hook for persistence
  const {
    addItem,
    isSaving,
    isSynced,
  } = useToolData<GeneratedDescription>('product-description', [], columns);

  // Handle prefill from conversation or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.productName) {
          setProductName(params.productName);
          hasPrefill = true;
        }
        if (params.productType) {
          setProductType(params.productType);
          hasPrefill = true;
        }
        if (params.tone) {
          setTone(params.tone);
          hasPrefill = true;
        }
        if (params.platform) {
          setPlatform(params.platform);
          hasPrefill = true;
        }
        // Restore the generated description
        if (params.text) {
          setCurrentDescription(params.text);
          // Also set currentMeta for save functionality
          setCurrentMeta({
            productName: params.productName || '',
            productType: params.productType || '',
            tone: params.tone || tones[0].value,
            platform: params.platform || platforms[0].value,
          });
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.content) {
          setProductName(params.text || params.content || '');
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setError('Please enter a product name');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const systemMessage = `You are an expert e-commerce copywriter who creates compelling, SEO-optimized product descriptions that drive conversions.`;

      const prompt = `Write a product description with the following specifications:

Product Name: ${productName}
Product Type/Category: ${productType || 'Not specified'}
Key Features: ${keyFeatures || 'Not specified'}
Target Audience: ${targetAudience || 'General consumers'}
Tone: ${tone}
Platform: ${platform}
Length: ${length}

Requirements:
- Write a compelling, conversion-focused description
- Highlight key benefits and features
- Use ${tone} tone throughout
- Optimize for ${platform} platform
- Include relevant keywords naturally for SEO
- Use power words and emotional triggers
- Create urgency or desire where appropriate
- Keep the length ${length}

Format: Write the product description directly, without any additional formatting or labels.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage,
        temperature: 0.8,
        maxTokens: 1000,
      });

      if (response.success && response.data?.text) {
        setCurrentDescription(response.data.text);
        setCurrentMeta({
          productName,
          productType,
          tone,
          platform,
        });
      } else {
        setError(response.error || 'Failed to generate description');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the description');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!currentDescription) return;
    try {
      await navigator.clipboard.writeText(currentDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (!currentDescription || !currentMeta) return;

    try {
      // Save to content library for Gallery view
      await api.post('/content', {
        contentType: 'text',
        url: '', // Text content doesn't have a URL
        title: `Product Description: ${currentMeta.productName}`,
        prompt: `Product description for ${currentMeta.productName}`,
        metadata: {
          text: currentDescription,
          toolId: 'product-description', // Tool ID for re-opening
          productName: currentMeta.productName,
          productType: currentMeta.productType,
          tone: currentMeta.tone,
          platform: currentMeta.platform,
        },
      });

      // Also save to tool data for tool-specific history
      const newDescription: GeneratedDescription = {
        id: `desc-${Date.now()}`,
        content: currentDescription,
        productName: currentMeta.productName,
        productType: currentMeta.productType,
        tone: currentMeta.tone,
        platform: currentMeta.platform,
        timestamp: new Date().toISOString(),
      };
      addItem(newDescription);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-teal-900/20' : t('tools.productDescription.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.productDescription.aiProductDescriptionGenerator', 'AI Product Description Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.productDescription.createCompellingProductDescriptionsThat', 'Create compelling product descriptions that sell')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.productDescription.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.productDescription.productDetailsLoadedFromYour', 'Product details loaded from your conversation')}
            </span>
          </div>
        )}

        {/* Product Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.productDescription.productName', 'Product Name *')}
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder={t('tools.productDescription.eGPremiumWirelessHeadphones', 'e.g., Premium Wireless Headphones')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Product Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.productDescription.productTypeCategory', 'Product Type/Category')}
          </label>
          <input
            type="text"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            placeholder={t('tools.productDescription.eGElectronicsClothingHome', 'e.g., Electronics, Clothing, Home Decor')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Key Features */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.productDescription.keyFeatures', 'Key Features')}
          </label>
          <textarea
            value={keyFeatures}
            onChange={(e) => setKeyFeatures(e.target.value)}
            placeholder={t('tools.productDescription.listTheMainFeaturesBenefits', 'List the main features, benefits, and specifications...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.productDescription.targetAudience', 'Target Audience')}
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder={t('tools.productDescription.eGTechEnthusiastsBusy', 'e.g., Tech enthusiasts, Busy professionals')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Tone and Platform */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productDescription.tone', 'Tone')}</label>
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

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productDescription.platform', 'Platform')}</label>
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
        </div>

        {/* Length */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.productDescription.descriptionLength', 'Description Length')}</label>
          <div className="flex gap-2">
            {lengths.map((l) => (
              <button
                key={l.value}
                onClick={() => setLength(l.value)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  length === l.value
                    ? 'bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {l.label}
              </button>
            ))}
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
          disabled={isGenerating || !productName.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.productDescription.generatingDescription', 'Generating Description...')}
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              {t('tools.productDescription.generateDescription', 'Generate Description')}
            </>
          )}
        </button>

        {/* Generated Description */}
        {currentDescription && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <ShoppingBag className="w-4 h-4" />
                Generated Description
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {t('tools.productDescription.editable', 'Editable')}
                </span>
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.productDescription.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.productDescription.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-lg transition-colors text-sm`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      {t('tools.productDescription.copied', 'Copied!')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('tools.productDescription.copy', 'Copy')}
                    </>
                  )}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-teal-900/30 hover:bg-teal-900/50 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'} rounded-lg transition-colors text-sm disabled:opacity-50`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.productDescription.save', 'Save')}
                </button>
              </div>
            </div>
            <textarea
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              rows={8}
              className={`w-full p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-y leading-relaxed`}
              placeholder={t('tools.productDescription.generatedDescriptionWillAppearHere', 'Generated description will appear here...')}
            />
          </div>
        )}

        {/* Empty State */}
        {!currentDescription && !isGenerating && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.productDescription.yourGeneratedProductDescriptionWill', 'Your generated product description will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescriptionTool;
