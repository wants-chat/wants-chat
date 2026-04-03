import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileImage, Download, Loader2, Plus, X, Sparkles, Save, CheckCircle } from 'lucide-react';
import { imagitarApi, ImageGenerationParams } from '../../lib/imagitarApi';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { api } from '../../lib/api';
import {
  exportToCSV,
  exportToJSON,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface GeneratedFlyer {
  url: string;
  prompt: string;
  timestamp: Date;
}

const flyerPurposes = [
  { label: 'Sale / Discount', value: 'sale flyer, promotional discount advertisement' },
  { label: 'Event', value: 'event flyer, event announcement' },
  { label: 'Announcement', value: 'announcement flyer, important notice' },
  { label: 'Menu', value: 'restaurant menu flyer, food menu design' },
  { label: 'Service', value: 'service flyer, business service advertisement' },
  { label: 'Real Estate', value: 'real estate flyer, property listing' },
];

const flyerStyles = [
  { label: 'Professional', value: 'professional, corporate, business-like, clean design' },
  { label: 'Fun', value: 'fun, playful, colorful, energetic design' },
  { label: 'Elegant', value: 'elegant, sophisticated, luxury, premium feel' },
  { label: 'Bold', value: 'bold, striking, attention-grabbing, high contrast' },
  { label: 'Minimal', value: 'minimalist, simple, clean lines, modern aesthetic' },
  { label: 'Retro', value: 'retro, vintage, nostalgic, classic design' },
];

const colorSchemes = [
  { label: 'Blue & White', value: 'blue and white color scheme' },
  { label: 'Red & Yellow', value: 'red and yellow color scheme, energetic' },
  { label: 'Green & Cream', value: 'green and cream color scheme, natural' },
  { label: 'Purple & Pink', value: 'purple and pink gradient color scheme' },
  { label: 'Orange & Black', value: 'orange and black color scheme, bold' },
  { label: 'Teal & Gray', value: 'teal and gray color scheme, professional' },
];

const sizePresets = [
  { label: 'Standard Letter (8.5" x 11")', width: 816, height: 1056 },
  { label: 'Half-Page (5.5" x 8.5")', width: 528, height: 816 },
  { label: 'Square (8" x 8")', width: 768, height: 768 },
  { label: 'A5 Portrait', width: 559, height: 794 },
];

const COLUMNS: ColumnConfig[] = [
  { key: 'businessName', header: 'Business Name', type: 'string' },
  { key: 'keyPoints', header: 'Key Points', type: 'string' },
  { key: 'contactInfo', header: 'Contact Info', type: 'string' },
  { key: 'prompt', header: 'Prompt', type: 'string' },
  { key: 'timestamp', header: 'Generated At', type: 'string' },
];

interface FlyerDesignerToolProps {
  uiConfig?: UIConfig;
}

export const FlyerDesignerTool: React.FC<FlyerDesignerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    keyPoints: ['', '', ''],
    contactInfo: '',
  });

  const [selectedPurpose, setSelectedPurpose] = useState(flyerPurposes[0]);
  const [selectedStyle, setSelectedStyle] = useState(flyerStyles[0]);
  const [selectedColor, setSelectedColor] = useState(colorSchemes[0]);
  const [selectedSize, setSelectedSize] = useState(sizePresets[0]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFlyers, setGeneratedFlyers] = useState<GeneratedFlyer[]>([]);

  const generatedSectionRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeyPointChange = (index: number, value: string) => {
    const newKeyPoints = [...formData.keyPoints];
    newKeyPoints[index] = value;
    setFormData((prev) => ({ ...prev, keyPoints: newKeyPoints }));
  };

  const addKeyPoint = () => {
    if (formData.keyPoints.length < 5) {
      setFormData((prev) => ({
        ...prev,
        keyPoints: [...prev.keyPoints, ''],
      }));
    }
  };

  const removeKeyPoint = (index: number) => {
    if (formData.keyPoints.length > 3) {
      const newKeyPoints = formData.keyPoints.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, keyPoints: newKeyPoints }));
    }
  };

  const handleGenerate = async () => {
    if (!formData.businessName) {
      setError('Please enter a business/event name');
      return;
    }

    const filledKeyPoints = formData.keyPoints.filter((p) => p.trim());
    if (filledKeyPoints.length === 0) {
      setError('Please add at least one key information point');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Build detailed prompt for AI
      const keyPointsText = filledKeyPoints
        .map((point, i) => `${i + 1}. ${point}`)
        .join('\n');

      const prompt = `${selectedPurpose.value}, ${selectedStyle.value}, ${selectedColor.value}.
      Main title/business name prominently displayed: "${formData.businessName}" (large, bold, attention-grabbing)
      Key information points clearly visible:
      ${keyPointsText}
      ${formData.contactInfo ? `Contact information at bottom: ${formData.contactInfo}` : ''}
      Professional flyer design, eye-catching layout, well-organized information hierarchy,
      balanced composition, readable typography, modern design, print-ready quality,
      designed for ${selectedSize.label} format, 300 DPI quality`;

      const params: ImageGenerationParams = {
        prompt,
        width: selectedSize.width,
        height: selectedSize.height,
        numberResults: 2,
        negativePrompt: 'blurry text, unreadable, low quality, cluttered, messy, amateur, distorted',
      };

      const result = await imagitarApi.generateImage(params);

      if (result.success && result.data?.images) {
        const newFlyers = result.data.images.map((img) => ({
          url: img.url,
          prompt,
          timestamp: new Date(),
        }));
        setGeneratedFlyers((prev) => [...newFlyers, ...prev]);
        setTimeout(() => {
          generatedSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else {
        setError(result.error || 'Failed to generate flyer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `flyer-${Date.now()}-${index}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.businessName) {
          setFormData(prev => ({ ...prev, businessName: params.businessName }));
          hasPrefill = true;
        }
        if (params.keyPoints) {
          setFormData(prev => ({ ...prev, keyPoints: params.keyPoints }));
          hasPrefill = true;
        }
        if (params.contactInfo) {
          setFormData(prev => ({ ...prev, contactInfo: params.contactInfo }));
          hasPrefill = true;
        }
        if (params.purpose) {
          const purpose = flyerPurposes.find(p => p.label === params.purpose);
          if (purpose) setSelectedPurpose(purpose);
          hasPrefill = true;
        }
        if (params.style) {
          const style = flyerStyles.find(s => s.label === params.style);
          if (style) setSelectedStyle(style);
          hasPrefill = true;
        }
        if (params.colorScheme) {
          const color = colorSchemes.find(c => c.label === params.colorScheme);
          if (color) setSelectedColor(color);
          hasPrefill = true;
        }
        if (params.size) {
          const size = sizePresets.find(s => s.label === params.size);
          if (size) setSelectedSize(size);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setGeneratedFlyers([{
            url: params.imageUrl,
            prompt: params.businessName || '',
            timestamp: new Date(),
          }]);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic
        const titleContent = params.title || params.text || '';
        if (titleContent) {
          setFormData(prev => ({
            ...prev,
            businessName: titleContent,
          }));
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleSave = async (imageUrl: string, imagePrompt: string) => {
    if (!imageUrl) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: imageUrl,
        title: `Flyer: ${formData.businessName.slice(0, 50)}${formData.businessName.length > 50 ? '...' : ''}`,
        prompt: imagePrompt,
        metadata: {
          toolId: 'flyer-designer',
          businessName: formData.businessName,
          keyPoints: formData.keyPoints,
          contactInfo: formData.contactInfo,
          purpose: selectedPurpose.label,
          style: selectedStyle.label,
          colorScheme: selectedColor.label,
          size: selectedSize.label,
          imageUrl: imageUrl,
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

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.flyerDesigner.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.flyerDesigner.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <FileImage className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flyerDesigner.aiFlyerDesigner', 'AI Flyer Designer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.flyerDesigner.createMarketingReadyFlyersWith', 'Create marketing-ready flyers with AI')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Flyer Purpose */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.flyerDesigner.flyerPurpose', 'Flyer Purpose')}
          </label>
          <select
            value={selectedPurpose.label}
            onChange={(e) => {
              const purpose = flyerPurposes.find((p) => p.label === e.target.value);
              if (purpose) setSelectedPurpose(purpose);
            }}
            className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          >
            {flyerPurposes.map((purpose) => (
              <option key={purpose.label} value={purpose.label}>
                {purpose.label}
              </option>
            ))}
          </select>
        </div>

        {/* Business/Event Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.flyerDesigner.businessEventName', 'Business/Event Name *')}
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder={t('tools.flyerDesigner.grandOpeningSale', 'Grand Opening Sale')}
            className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-lg font-semibold`}
          />
        </div>

        {/* Key Information Points */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.flyerDesigner.keyInformationPoints', 'Key Information Points *')}
            </label>
            {formData.keyPoints.length < 5 && (
              <button
                onClick={addKeyPoint}
                className="text-sm text-[#0D9488] hover:text-[#2DD4BF] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.flyerDesigner.addPoint', 'Add Point')}
              </button>
            )}
          </div>

          {formData.keyPoints.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={point}
                onChange={(e) => handleKeyPointChange(index, e.target.value)}
                placeholder={`Key point ${index + 1} (e.g., "Up to 50% OFF all items")`}
                className={`flex-1 px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
              {formData.keyPoints.length > 3 && (
                <button
                  onClick={() => removeKeyPoint(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.flyerDesigner.contactInformation', 'Contact Information')}
          </label>
          <input
            type="text"
            value={formData.contactInfo}
            onChange={(e) => handleInputChange('contactInfo', e.target.value)}
            placeholder={t('tools.flyerDesigner.callUs5551234567', 'Call us: (555) 123-4567 | www.example.com')}
            className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Design Options */}
        <div className="space-y-4">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.flyerDesigner.designOptions', 'Design Options')}</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.flyerDesigner.style', 'Style')}</label>
              <select
                value={selectedStyle.label}
                onChange={(e) => {
                  const style = flyerStyles.find((s) => s.label === e.target.value);
                  if (style) setSelectedStyle(style);
                }}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              >
                {flyerStyles.map((style) => (
                  <option key={style.label} value={style.label}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.flyerDesigner.colorScheme', 'Color Scheme')}</label>
              <select
                value={selectedColor.label}
                onChange={(e) => {
                  const color = colorSchemes.find((c) => c.label === e.target.value);
                  if (color) setSelectedColor(color);
                }}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              >
                {colorSchemes.map((color) => (
                  <option key={color.label} value={color.label}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.flyerDesigner.size', 'Size')}</label>
              <select
                value={selectedSize.label}
                onChange={(e) => {
                  const size = sizePresets.find((s) => s.label === e.target.value);
                  if (size) setSelectedSize(size);
                }}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              >
                {sizePresets.map((size) => (
                  <option key={size.label} value={size.label}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-xl text-red-600 text-sm`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.businessName}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.flyerDesigner.generatingFlyer', 'Generating Flyer...')}
            </>
          ) : (
            <>
              <FileImage className="w-5 h-5" />
              {t('tools.flyerDesigner.generateFlyer', 'Generate Flyer')}
            </>
          )}
        </button>

        {/* Generated Flyers Gallery */}
        {generatedFlyers.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <FileImage className="w-4 h-4" />
                {t('tools.flyerDesigner.generatedFlyers', 'Generated Flyers')}
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.flyerDesigner.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.flyerDesigner.saving', 'Saving...')}
                  </span>
                )}
                <ExportDropdown
                  onExportCSV={() => exportToCSV(generatedFlyers.map((flyer, idx) => ({
                    ...formData,
                    prompt: flyer.prompt,
                    timestamp: flyer.timestamp.toISOString(),
                  })), COLUMNS, { filename: 'flyer-designs' })}
                  onExportJSON={() => exportToJSON(generatedFlyers.map((flyer) => ({
                    ...formData,
                    prompt: flyer.prompt,
                    timestamp: flyer.timestamp.toISOString(),
                  })), { filename: 'flyer-designs' })}
                  showImport={false}
                  theme={theme}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedFlyers.map((flyer, index) => (
                <div
                  key={`${flyer.timestamp.getTime()}-${index}`}
                  className={`group relative rounded-xl overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                >
                  <img
                    src={flyer.url}
                    alt="Flyer design"
                    className="w-full aspect-[0.773] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(flyer.url, index)}
                      className="p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                      title={t('tools.flyerDesigner.download', 'Download')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSave(flyer.url, flyer.prompt)}
                      disabled={isSaving}
                      className="p-3 bg-[#0D9488] rounded-full text-white hover:bg-[#0D9488]/90 transition-colors disabled:opacity-50"
                      title={t('tools.flyerDesigner.saveToGallery', 'Save to Gallery')}
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs line-clamp-2">{formData.businessName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedFlyers.length === 0 && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <FileImage className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.flyerDesigner.yourGeneratedFlyersWillAppear', 'Your generated flyers will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlyerDesignerTool;
