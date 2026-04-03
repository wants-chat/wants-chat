import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2, Copy, Check, Save } from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

interface SloganCreatorToolProps {
  uiConfig?: UIConfig;
}

interface GeneratedSlogan {
  text: string;
  timestamp: Date;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Education',
  'Food & Beverage',
  'Fashion',
  'Real Estate',
  'Automotive',
  'Entertainment',
  'Travel',
  'Sports & Fitness',
  'Beauty & Cosmetics',
  'Other',
];

const emotions = [
  { value: 'trust', label: 'Trust & Reliability' },
  { value: 'excitement', label: 'Excitement & Energy' },
  { value: 'innovation', label: 'Innovation & Progress' },
  { value: 'comfort', label: 'Comfort & Care' },
  { value: 'luxury', label: 'Luxury & Prestige' },
  { value: 'adventure', label: 'Adventure & Bold' },
  { value: 'simplicity', label: 'Simplicity & Ease' },
  { value: 'empowerment', label: 'Empowerment & Strength' },
];

const COLUMNS = [
  { key: 'text', label: 'Slogan' },
  { key: 'timestamp', label: 'Generated At' },
];

export const SloganCreatorTool: React.FC<SloganCreatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [brandName, setBrandName] = useState('');
  const [brandValues, setBrandValues] = useState('');
  const [industry, setIndustry] = useState(industries[0]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [targetEmotion, setTargetEmotion] = useState(emotions[0].value);
  const [numberOfResults, setNumberOfResults] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlogans, setGeneratedSlogans] = useState<GeneratedSlogan[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Handle prefill from uiConfig or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.brandName) {
          setBrandName(params.brandName);
          hasPrefill = true;
        }
        if (params.brandValues) {
          setBrandValues(params.brandValues);
          hasPrefill = true;
        }
        if (params.industry) {
          setIndustry(params.industry);
          hasPrefill = true;
        }
        if (params.customIndustry) {
          setCustomIndustry(params.customIndustry);
          hasPrefill = true;
        }
        if (params.targetEmotion) {
          setTargetEmotion(params.targetEmotion);
          hasPrefill = true;
        }
        // Restore the generated slogan(s)
        if (params.text) {
          // Single slogan from gallery - display it
          setGeneratedSlogans([{
            text: params.text,
            timestamp: new Date(),
          }]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.content) {
          setBrandName(params.text || params.content || '');
          hasPrefill = true;
        }
        if (params.formData) {
          if (params.formData.brandName) setBrandName(params.formData.brandName);
          if (params.formData.brandValues) setBrandValues(params.formData.brandValues);
          if (params.formData.industry) setIndustry(params.formData.industry);
          if (params.formData.targetEmotion) setTargetEmotion(params.formData.targetEmotion);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!brandName.trim()) {
      setError('Please enter a brand/product name');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const selectedIndustry = industry === 'Other' ? customIndustry : industry;
      const systemMessage = `You are an expert brand strategist and copywriter specializing in creating memorable, impactful slogans and taglines.`;

      const prompt = `Create ${numberOfResults} different memorable slogan/tagline variations for the following brand:

Brand/Product Name: ${brandName}
Brand Values/Personality: ${brandValues || 'Not specified'}
Industry: ${selectedIndustry}
Target Emotion: ${targetEmotion}

Requirements:
- Keep slogans short and memorable (ideally 3-7 words)
- Make them catchy and easy to recall
- Reflect the ${targetEmotion} emotion
- Align with the brand's values and personality
- Use wordplay, rhyme, or alliteration where effective
- Ensure they're unique and distinctive
- Make them timeless, not trendy
- Focus on emotional connection and brand essence

Format: Return ONLY the slogans, one per line, without numbering or formatting.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage,
        temperature: 0.95,
        maxTokens: 800,
      });

      if (response.success && response.data?.text) {
        const slogans = response.data.text
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .map((line: string) => {
            // Remove numbering, quotes, or dashes if present
            const cleanedLine = line
              .replace(/^\d+[\.\)]\s*/, '')
              .replace(/^["""]/, '')
              .replace(/["""]$/, '')
              .replace(/^-\s*/, '')
              .trim();
            return cleanedLine;
          })
          .filter((line: string) => line.length > 3 && line.length < 100);

        const newSlogans = slogans.map((text: string) => ({
          text,
          timestamp: new Date(),
        }));

        setGeneratedSlogans(newSlogans);
      } else {
        setError(response.error || 'Failed to generate slogans');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating slogans');
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
        title: `Slogan: ${brandName}`,
        prompt: `Slogan for ${brandName}`,
        metadata: {
          text,
          toolId: 'slogan-creator',
          brandName,
          brandValues,
          industry: industry === 'Other' ? customIndustry : industry,
          customIndustry: industry === 'Other' ? customIndustry : '',
          targetEmotion,
          numberOfResults,
        },
      });
      setValidationMessage('Slogan saved successfully!');
      setTimeout(() => setValidationMessage(null), 3000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setValidationMessage('Failed to save slogan');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportCSV = () => {
    if (generatedSlogans.length === 0) return;

    const headers = COLUMNS.map((col) => col.label).join(',');
    const rows = generatedSlogans.map((slogan) =>
      [
        `"${slogan.text.replace(/"/g, '""')}"`,
        slogan.timestamp.toISOString(),
      ].join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `slogans-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (generatedSlogans.length === 0) return;

    const data = {
      brandName,
      brandValues,
      industry: industry === 'Other' ? customIndustry : industry,
      targetEmotion,
      numberOfResults,
      slogans: generatedSlogans.map((slogan) => ({
        text: slogan.text,
        generatedAt: slogan.timestamp.toISOString(),
      })),
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `slogans-${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    try {
      if (generatedSlogans.length === 0) return false;

      const headers = COLUMNS.map((col) => col.label).join('\t');
      const rows = generatedSlogans.map((slogan) =>
        [slogan.text, slogan.timestamp.toISOString()].join('\t')
      );
      const text = [headers, ...rows].join('\n');
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  return (
    <>
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-teal-900/20' : t('tools.sloganCreator.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.sloganCreator.aiSloganCreator', 'AI Slogan Creator')}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sloganCreator.createMemorableSlogansAndTaglines', 'Create memorable slogans and taglines for your brand')}</p>
            </div>
          </div>
          {generatedSlogans.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={theme}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.sloganCreator.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.sloganCreator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}
            </span>
          </div>
        )}

        {/* Brand Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.sloganCreator.brandProductName', 'Brand/Product Name *')}
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder={t('tools.sloganCreator.eGNikeAppleCoca', 'e.g., Nike, Apple, Coca-Cola')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Brand Values */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.sloganCreator.brandValuesPersonality', 'Brand Values/Personality')}
          </label>
          <textarea
            value={brandValues}
            onChange={(e) => setBrandValues(e.target.value)}
            placeholder={t('tools.sloganCreator.describeYourBrandSCore', 'Describe your brand\'s core values, personality, mission, or what makes it unique...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sloganCreator.industry', 'Industry')}</label>
          <div className="flex gap-2">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={`flex-1 px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
            {industry === 'Other' && (
              <input
                type="text"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                placeholder={t('tools.sloganCreator.specifyIndustry', 'Specify industry')}
                className={`flex-1 px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            )}
          </div>
        </div>

        {/* Target Emotion */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.sloganCreator.targetEmotion', 'Target Emotion')}</label>
          <select
            value={targetEmotion}
            onChange={(e) => setTargetEmotion(e.target.value)}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          >
            {emotions.map((emotion) => (
              <option key={emotion.value} value={emotion.value}>
                {emotion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Number of Slogans */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Number of Slogans: {numberOfResults}
          </label>
          <input
            type="range"
            min="4"
            max="12"
            value={numberOfResults}
            onChange={(e) => setNumberOfResults(Number(e.target.value))}
            className="w-full accent-[#0D9488]"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>4</span>
            <span>12</span>
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
          disabled={isGenerating || !brandName.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.sloganCreator.creatingSlogans', 'Creating Slogans...')}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t('tools.sloganCreator.generateSlogans', 'Generate Slogans')}
            </>
          )}
        </button>

        {/* Generated Slogans */}
        {generatedSlogans.length > 0 && (
          <div className="space-y-4">
            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Sparkles className="w-4 h-4" />
              {t('tools.sloganCreator.generatedSlogans', 'Generated Slogans')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {generatedSlogans.map((slogan, index) => (
                <div
                  key={`${slogan.timestamp.getTime()}-${index}`}
                  className={`p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl space-y-3`}
                >
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium text-center text-lg`}>
                    "{slogan.text}"
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleCopy(slogan.text, index)}
                      className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'} rounded-lg transition-colors text-sm`}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          {t('tools.sloganCreator.copied', 'Copied!')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t('tools.sloganCreator.copy', 'Copy')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleSave(slogan.text)}
                      className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-teal-900/30 hover:bg-teal-900/50 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'} border ${theme === 'dark' ? 'border-teal-800' : 'border-teal-200'} rounded-lg transition-colors text-sm`}
                    >
                      <Save className="w-4 h-4" />
                      {t('tools.sloganCreator.save', 'Save')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedSlogans.length === 0 && !isGenerating && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.sloganCreator.yourGeneratedSlogansWillAppear', 'Your generated slogans will appear here')}</p>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default SloganCreatorTool;
