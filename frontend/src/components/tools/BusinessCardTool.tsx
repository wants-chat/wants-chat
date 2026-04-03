import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Download, Loader2, Upload, X, Sparkles, Save, CheckCircle } from 'lucide-react';
import { imagitarApi, ImageGenerationParams } from '../../lib/imagitarApi';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { api } from '../../lib/api';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface BusinessCardToolProps {
  uiConfig?: UIConfig;
}

interface GeneratedCard {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
}

const cardStyles = [
  { label: 'Modern', value: 'modern, clean, professional design with geometric shapes' },
  { label: 'Classic', value: 'classic, traditional, elegant typography with serif fonts' },
  { label: 'Minimal', value: 'minimalist, simple, lots of white space, clean lines' },
  { label: 'Creative', value: 'creative, artistic, unique layout, bold colors' },
  { label: 'Bold', value: 'bold, striking, vibrant colors, strong typography' },
];

const colorSchemes = [
  { label: 'Professional Blue', value: 'navy blue and white color scheme' },
  { label: 'Corporate Gray', value: 'charcoal gray and silver color scheme' },
  { label: 'Elegant Black', value: 'black and gold color scheme, luxury feel' },
  { label: 'Fresh Green', value: 'teal green and white color scheme' },
  { label: 'Vibrant Purple', value: 'purple and pink gradient color scheme' },
  { label: 'Warm Orange', value: 'orange and cream color scheme' },
];

const orientations = [
  { label: 'Horizontal (3.5" x 2")', value: 'horizontal', width: 1050, height: 600 },
  { label: 'Vertical (2" x 3.5")', value: 'vertical', width: 600, height: 1050 },
];

const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'url', header: 'Image URL', type: 'string' },
  { key: 'prompt', header: 'Prompt', type: 'string' },
  { key: 'timestamp', header: 'Generated At', type: 'date' },
];

export const BusinessCardTool: React.FC<BusinessCardToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSavingToGallery, setIsSavingToGallery] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: generatedCards,
    addItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<GeneratedCard>('business-card-designer', [], COLUMNS);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.formData) {
          setFormData(params.formData);
          hasPrefill = true;
        }
        if (params.cardStyle) {
          const style = cardStyles.find(s => s.label === params.cardStyle);
          if (style) setSelectedStyle(style);
          hasPrefill = true;
        }
        if (params.colorScheme) {
          const color = colorSchemes.find(c => c.label === params.colorScheme);
          if (color) setSelectedColor(color);
          hasPrefill = true;
        }
        if (params.orientation) {
          const orient = orientations.find(o => o.label === params.orientation);
          if (orient) setSelectedOrientation(orient);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        if (uiConfig?.prefillData) {
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    } else if (uiConfig?.prefillData) {
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    twitter: '',
  });

  const [selectedStyle, setSelectedStyle] = useState(cardStyles[0]);
  const [selectedColor, setSelectedColor] = useState(colorSchemes[0]);
  const [selectedOrientation, setSelectedOrientation] = useState(orientations[0]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatedSectionRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.title) {
      setError('Please enter at least your name and title');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Build detailed prompt for AI
      const contactInfo = [
        formData.email && `Email: ${formData.email}`,
        formData.phone && `Phone: ${formData.phone}`,
        formData.website && `Website: ${formData.website}`,
      ]
        .filter(Boolean)
        .join(', ');

      const socialInfo = [
        formData.linkedin && `LinkedIn icon and handle`,
        formData.twitter && `Twitter icon and handle`,
      ]
        .filter(Boolean)
        .join(', ');

      const prompt = `Professional business card design, ${selectedOrientation.value} orientation, ${selectedStyle.value}, ${selectedColor.value}.
      Front of card with the following text clearly visible and readable:
      Name: "${formData.name}" (large, prominent font)
      Title: "${formData.title}" (subtitle font)
      ${formData.company ? `Company: "${formData.company}"` : ''}
      ${contactInfo ? `Contact: ${contactInfo}` : ''}
      ${socialInfo ? `Social: ${socialInfo}` : ''}
      ${logoFile ? 'Include company logo in top corner' : ''}
      High quality, print-ready, professional typography, well-balanced layout, modern aesthetic, 300 DPI quality`;

      const params: ImageGenerationParams = {
        prompt,
        width: selectedOrientation.width,
        height: selectedOrientation.height,
        numberResults: 2,
        negativePrompt: 'blurry text, unreadable, low quality, distorted, cluttered, amateur',
      };

      const result = await imagitarApi.generateImage(params);

      if (result.success && result.data?.images) {
        result.data.images.forEach((img, idx) => {
          const newCard: GeneratedCard = {
            id: `${Date.now()}-${idx}`,
            url: img.url,
            prompt,
            timestamp: new Date().toISOString(),
          };
          addItem(newCard);
        });
        setTimeout(() => {
          generatedSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      } else {
        setError(result.error || 'Failed to generate business card');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, format: 'png' | 'pdf' = 'png') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `business-card-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleSaveToGallery = async (imageUrl: string, prompt: string) => {
    if (!imageUrl) return;

    setIsSavingToGallery(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: imageUrl,
        title: `Business Card: ${formData.name}`,
        prompt: prompt,
        metadata: {
          toolId: 'business-card',
          formData: formData,
          cardStyle: selectedStyle.label,
          colorScheme: selectedColor.label,
          orientation: selectedOrientation.label,
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
      setIsSavingToGallery(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.businessCard.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.businessCard.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.businessCard.aiBusinessCardDesigner', 'AI Business Card Designer')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.businessCard.createProfessionalBusinessCardsWith', 'Create professional business cards with AI')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="business-card" toolName="Business Card" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            {generatedCards.length > 0 && (
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: 'business-cards' })}
                onExportExcel={() => exportExcel({ filename: 'business-cards' })}
                onExportJSON={() => exportJSON({ filename: 'business-cards' })}
                onExportPDF={() => exportPDF({ filename: 'business-cards', title: 'Business Cards' })}
                onPrint={() => print('Business Cards')}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {isEditFromGallery
              ? t('tools.businessCard.settingsRestoredFromYourSaved', 'Settings restored from your saved gallery') : t('tools.businessCard.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.businessCard.personalInformation', 'Personal Information')}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.businessCard.fullName', 'Full Name *')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('tools.businessCard.johnDoe', 'John Doe')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.businessCard.jobTitle', 'Job Title *')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('tools.businessCard.seniorDesigner', 'Senior Designer')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.businessCard.company', 'Company')}
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder={t('tools.businessCard.acmeCorp', 'Acme Corp')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.businessCard.email', 'Email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('tools.businessCard.johnExampleCom', 'john@example.com')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.businessCard.phone', 'Phone')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.businessCard.website', 'Website')}
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder={t('tools.businessCard.wwwExampleCom', 'www.example.com')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.businessCard.linkedin', 'LinkedIn')}
              </label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder={t('tools.businessCard.linkedinComInJohndoe', 'linkedin.com/in/johndoe')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.businessCard.twitter', 'Twitter')}
              </label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder={t('tools.businessCard.johndoe', '@johndoe')}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              />
            </div>
          </div>
        </div>

        {/* Design Options */}
        <div className="space-y-4">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.businessCard.designOptions', 'Design Options')}</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.businessCard.cardStyle', 'Card Style')}</label>
              <select
                value={selectedStyle.label}
                onChange={(e) => {
                  const style = cardStyles.find((s) => s.label === e.target.value);
                  if (style) setSelectedStyle(style);
                }}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              >
                {cardStyles.map((style) => (
                  <option key={style.label} value={style.label}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.businessCard.colorScheme', 'Color Scheme')}</label>
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
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.businessCard.orientation', 'Orientation')}</label>
              <select
                value={selectedOrientation.label}
                onChange={(e) => {
                  const orientation = orientations.find((o) => o.label === e.target.value);
                  if (orientation) setSelectedOrientation(orientation);
                }}
                className={`w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
              >
                {orientations.map((orientation) => (
                  <option key={orientation.label} value={orientation.label}>
                    {orientation.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.businessCard.companyLogoOptional', 'Company Logo (Optional)')}
            </label>
            {logoPreview ? (
              <div className="flex items-center gap-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-20 h-20 object-contain border border-gray-200 rounded-lg"
                />
                <button
                  onClick={removeLogo}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${isDark ? t('tools.businessCard.borderGray600HoverBorder', 'border-gray-600 hover:border-[#0D9488]') : t('tools.businessCard.borderGray300HoverBorder', 'border-gray-300 hover:border-[#0D9488]')} rounded-xl cursor-pointer transition-colors`}>
                <Upload className="w-5 h-5 text-gray-400" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.businessCard.clickToUploadLogo', 'Click to upload logo')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}
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
          disabled={isGenerating || !formData.name || !formData.title}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.businessCard.generatingBusinessCard', 'Generating Business Card...')}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              {t('tools.businessCard.generateBusinessCard', 'Generate Business Card')}
            </>
          )}
        </button>

        {/* Generated Cards Gallery */}
        {generatedCards.length > 0 && (
          <div ref={generatedSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <CreditCard className="w-4 h-4" />
                {t('tools.businessCard.generatedBusinessCards', 'Generated Business Cards')}
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.businessCard.saved', 'Saved!')}
                  </span>
                )}
                {isSavingToGallery && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.businessCard.saving', 'Saving...')}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...generatedCards].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((card) => (
                <div
                  key={card.id}
                  className={`group relative rounded-xl overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                >
                  <img
                    src={card.url}
                    alt="Business card design"
                    className="w-full aspect-[1.75] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleDownload(card.url, 'png')}
                      className="p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                      title={t('tools.businessCard.downloadPng', 'Download PNG')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSaveToGallery(card.url, card.prompt)}
                      disabled={isSavingToGallery}
                      className="p-3 bg-[#0D9488] rounded-full text-white hover:bg-[#0D9488]/90 transition-colors disabled:opacity-50"
                      title={t('tools.businessCard.saveToGallery', 'Save to Gallery')}
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedCards.length === 0 && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.businessCard.yourGeneratedBusinessCardsWill', 'Your generated business cards will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCardTool;
