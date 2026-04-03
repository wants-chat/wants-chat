import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  User,
  Phone,
  Mail,
  Globe,
  Building2,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Save,
  Download,
  Printer,
  Upload,
  Trash2,
  QrCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface BusinessCardDesignerToolProps {
  uiConfig?: UIConfig;
}

// Types
interface CardDesign {
  id: string;
  name: string;
  createdAt: Date;
  personalInfo: PersonalInfo;
  designOptions: DesignOptions;
}

interface PersonalInfo {
  name: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;
}

interface DesignOptions {
  template: 'classic' | 'modern' | 'minimal' | 'creative';
  colorScheme: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontStyle: 'sans' | 'serif' | 'mono';
  textAlign: 'left' | 'center' | 'right';
  showQrCode: boolean;
  borderStyle: 'none' | 'solid' | 'rounded' | 'shadow';
  logoUrl: string | null;
}

// Predefined color schemes
const colorSchemes = [
  { name: 'Professional Blue', primary: '#1e40af', secondary: '#3b82f6', text: '#1e293b', bg: '#ffffff' },
  { name: 'Corporate Gray', primary: '#374151', secondary: '#6b7280', text: '#111827', bg: '#f9fafb' },
  { name: 'Elegant Black', primary: '#0f172a', secondary: '#334155', text: '#0f172a', bg: '#ffffff' },
  { name: 'Fresh Green', primary: '#059669', secondary: '#10b981', text: '#064e3b', bg: '#ffffff' },
  { name: 'Vibrant Purple', primary: '#7c3aed', secondary: '#a78bfa', text: '#4c1d95', bg: '#faf5ff' },
  { name: 'Warm Orange', primary: '#ea580c', secondary: '#fb923c', text: '#7c2d12', bg: '#fffbeb' },
  { name: 'Rose Gold', primary: '#be185d', secondary: '#f472b6', text: '#831843', bg: '#fff1f2' },
  { name: 'Ocean Teal', primary: '#0d9488', secondary: '#2dd4bf', text: '#134e4a', bg: '#f0fdfa' },
];

// Template styles
const templates = {
  classic: {
    name: 'Classic',
    description: 'Traditional professional layout',
  },
  modern: {
    name: 'Modern',
    description: 'Clean contemporary design',
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple and elegant',
  },
  creative: {
    name: 'Creative',
    description: 'Bold and unique',
  },
};

// Column configuration for saved designs (used by useToolData)
const SAVED_DESIGNS_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Design Name', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'jobTitle', header: 'Job Title', type: 'string' },
  { key: 'company', header: 'Company', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'website', header: 'Website', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'linkedin', header: 'LinkedIn', type: 'string' },
  { key: 'twitter', header: 'Twitter', type: 'string' },
  { key: 'instagram', header: 'Instagram', type: 'string' },
  { key: 'facebook', header: 'Facebook', type: 'string' },
  { key: 'template', header: 'Template', type: 'string' },
  { key: 'colorScheme', header: 'Color Scheme', type: 'string' },
];

export const BusinessCardDesignerTool: React.FC<BusinessCardDesignerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    jobTitle: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
  });

  // Design Options State
  const [designOptions, setDesignOptions] = useState<DesignOptions>({
    template: 'modern',
    colorScheme: 'Professional Blue',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    accentColor: '#1e40af',
    fontStyle: 'sans',
    textAlign: 'left',
    showQrCode: false,
    borderStyle: 'shadow',
    logoUrl: null,
  });

  // Saved Designs State - using useToolData for backend persistence
  const {
    data: savedDesigns,
    addItem: addDesign,
    deleteItem: deleteDesign,
    isLoading: isLoadingDesigns,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<CardDesign>(
    'business-card-designer',
    [],
    SAVED_DESIGNS_COLUMNS,
    { autoSave: true }
  );
  const [currentDesignName, setCurrentDesignName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle personal info changes
  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Handle design option changes
  const handleDesignOptionChange = <K extends keyof DesignOptions>(
    field: K,
    value: DesignOptions[K]
  ) => {
    setDesignOptions((prev) => ({ ...prev, [field]: value }));
  };

  // Handle color scheme selection
  const handleColorSchemeChange = (schemeName: string) => {
    const scheme = colorSchemes.find((s) => s.name === schemeName);
    if (scheme) {
      setDesignOptions((prev) => ({
        ...prev,
        colorScheme: schemeName,
        backgroundColor: scheme.bg,
        textColor: scheme.text,
        accentColor: scheme.primary,
      }));
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleDesignOptionChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save design using useToolData hook
  const handleSaveDesign = () => {
    if (!currentDesignName.trim()) {
      setValidationMessage('Please enter a design name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newDesign: CardDesign = {
      id: Date.now().toString(),
      name: currentDesignName,
      createdAt: new Date(),
      personalInfo,
      designOptions,
    };

    addDesign(newDesign);
    setCurrentDesignName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Load saved design
  const handleLoadDesign = (design: CardDesign) => {
    setPersonalInfo(design.personalInfo);
    setDesignOptions(design.designOptions);
    setCurrentDesignName(design.name);
  };

  // Delete saved design using useToolData hook
  const handleDeleteDesign = (id: string) => {
    deleteDesign(id);
  };

  // Reset form
  const handleReset = () => {
    setPersonalInfo({
      name: '',
      jobTitle: '',
      company: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
    });
    setDesignOptions({
      template: 'modern',
      colorScheme: 'Professional Blue',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      accentColor: '#1e40af',
      fontStyle: 'sans',
      textAlign: 'left',
      showQrCode: false,
      borderStyle: 'shadow',
      logoUrl: null,
    });
    setCurrentDesignName('');
  };

  // Print preview
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && cardRef.current) {
      const cardHtml = cardRef.current.outerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Business Card - ${personalInfo.name || 'Preview'}</title>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: #f0f0f0;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .print-info {
                text-align: center;
                margin-bottom: 20px;
                color: #666;
              }
              @media print {
                body { background: white; }
                .print-info { display: none; }
              }
            </style>
          </head>
          <body>
            <div>
              <div class="print-info">
                <p>Standard Business Card Size: 3.5" x 2" (89mm x 51mm)</p>
              </div>
              ${cardHtml}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  // Download as image (using canvas)
  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: designOptions.backgroundColor,
      });

      const link = document.createElement('a');
      link.download = `business-card-${personalInfo.name || 'design'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      // Fallback: create a simple download notification
      setValidationMessage('To download the card image, please use the Print option and save as PDF.');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const exportData = [{
      ...personalInfo,
      ...designOptions,
    }];
    const result = exportToCSV(exportData, COLUMNS, { filename: 'business-card' });
    if (!result.success) {
      setValidationMessage('Failed to export CSV: ' + result.error);
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportExcel = () => {
    const exportData = [{
      ...personalInfo,
      ...designOptions,
    }];
    const result = exportToExcel(exportData, COLUMNS, { filename: 'business-card' });
    if (!result.success) {
      setValidationMessage('Failed to export Excel: ' + result.error);
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportJSON = () => {
    const exportData = [{
      ...personalInfo,
      designOptions,
      createdAt: new Date().toISOString(),
    }];
    const result = exportToJSON(exportData, { filename: 'business-card', pretty: true });
    if (!result.success) {
      setValidationMessage('Failed to export JSON: ' + result.error);
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleExportPDF = async () => {
    const exportData = [{
      ...personalInfo,
      ...designOptions,
    }];
    const result = await exportToPDF(exportData, COLUMNS, {
      filename: 'business-card',
      title: `Business Card - ${personalInfo.name || 'Design'}`,
      subtitle: `${personalInfo.jobTitle || 'Job Title'} at ${personalInfo.company || 'Company'}`,
    });
    if (!result.success) {
      setValidationMessage('Failed to export PDF: ' + result.error);
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const handleCopyToClipboard = async () => {
    const exportData = [{
      ...personalInfo,
      ...designOptions,
    }];
    return await copyUtil(exportData, COLUMNS, 'tab');
  };

  const handlePrintData = () => {
    const exportData = [{
      ...personalInfo,
      ...designOptions,
    }];
    printData(exportData, COLUMNS, {
      title: `Business Card - ${personalInfo.name || 'Design'}`,
    });
  };

  // Get font family based on style
  const getFontFamily = () => {
    switch (designOptions.fontStyle) {
      case 'serif':
        return 'Georgia, "Times New Roman", serif';
      case 'mono':
        return '"Courier New", Courier, monospace';
      default:
        return 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    }
  };

  // Get border style classes
  const getBorderClasses = () => {
    switch (designOptions.borderStyle) {
      case 'solid':
        return 'border-2';
      case 'rounded':
        return 'border-2 rounded-2xl';
      case 'shadow':
        return 'shadow-xl';
      default:
        return '';
    }
  };

  // Render business card preview
  const renderCardPreview = () => {
    const { template, textAlign, showQrCode, logoUrl, accentColor, textColor, backgroundColor } =
      designOptions;

    const alignClass =
      textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left';
    const flexAlign =
      textAlign === 'center'
        ? 'items-center'
        : textAlign === 'right'
        ? 'items-end'
        : 'items-start';

    const cardBaseStyle: React.CSSProperties = {
      width: '350px',
      height: '200px',
      backgroundColor,
      fontFamily: getFontFamily(),
      borderColor: accentColor,
    };

    // Classic Template
    if (template === 'classic') {
      return (
        <div
          ref={cardRef}
          className={`relative overflow-hidden ${getBorderClasses()}`}
          style={cardBaseStyle}
        >
          <div
            className="absolute top-0 left-0 w-2 h-full"
            style={{ backgroundColor: accentColor }}
          />
          <div className={`p-5 pl-6 h-full flex flex-col justify-between ${alignClass}`}>
            <div>
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain mb-2" />
              )}
              <h2 className="text-xl font-bold" style={{ color: textColor }}>
                {personalInfo.name || 'Your Name'}
              </h2>
              <p className="text-sm font-medium" style={{ color: accentColor }}>
                {personalInfo.jobTitle || 'Job Title'}
              </p>
              {personalInfo.company && (
                <p className="text-sm mt-1" style={{ color: textColor, opacity: 0.8 }}>
                  {personalInfo.company}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 text-xs" style={{ color: textColor, opacity: 0.9 }}>
              {personalInfo.phone && (
                <div className={`flex items-center gap-2 ${flexAlign}`}>
                  <Phone size={12} style={{ color: accentColor }} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className={`flex items-center gap-2 ${flexAlign}`}>
                  <Mail size={12} style={{ color: accentColor }} />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className={`flex items-center gap-2 ${flexAlign}`}>
                  <Globe size={12} style={{ color: accentColor }} />
                  <span>{personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>
          {showQrCode && (
            <div className="absolute bottom-4 right-4 w-14 h-14 bg-white border flex items-center justify-center">
              <QrCode size={40} style={{ color: accentColor }} />
            </div>
          )}
        </div>
      );
    }

    // Modern Template
    if (template === 'modern') {
      return (
        <div
          ref={cardRef}
          className={`relative overflow-hidden ${getBorderClasses()}`}
          style={cardBaseStyle}
        >
          <div
            className="absolute top-0 left-0 right-0 h-16"
            style={{ backgroundColor: accentColor }}
          />
          <div className={`p-5 pt-8 h-full flex flex-col ${alignClass}`}>
            <div className="relative z-10 flex items-start gap-3 mb-auto">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-16 h-16 object-contain bg-white rounded-lg p-1 shadow-md"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center bg-white shadow-md"
                  style={{ color: accentColor }}
                >
                  <User size={28} />
                </div>
              )}
              <div className="pt-8">
                <h2 className="text-lg font-bold" style={{ color: textColor }}>
                  {personalInfo.name || 'Your Name'}
                </h2>
                <p className="text-sm" style={{ color: accentColor }}>
                  {personalInfo.jobTitle || 'Job Title'}
                </p>
              </div>
            </div>
            <div
              className={`flex flex-wrap gap-3 text-xs mt-2 ${
                textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : ''
              }`}
              style={{ color: textColor, opacity: 0.9 }}
            >
              {personalInfo.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={10} />
                  {personalInfo.phone}
                </span>
              )}
              {personalInfo.email && (
                <span className="flex items-center gap-1">
                  <Mail size={10} />
                  {personalInfo.email}
                </span>
              )}
              {personalInfo.website && (
                <span className="flex items-center gap-1">
                  <Globe size={10} />
                  {personalInfo.website}
                </span>
              )}
            </div>
          </div>
          {showQrCode && (
            <div className="absolute bottom-3 right-3 w-12 h-12 bg-white rounded flex items-center justify-center shadow">
              <QrCode size={32} style={{ color: accentColor }} />
            </div>
          )}
        </div>
      );
    }

    // Minimal Template
    if (template === 'minimal') {
      return (
        <div
          ref={cardRef}
          className={`relative overflow-hidden ${getBorderClasses()}`}
          style={cardBaseStyle}
        >
          <div className={`p-6 h-full flex flex-col justify-center ${alignClass}`}>
            <h2 className="text-2xl font-light tracking-wide" style={{ color: textColor }}>
              {personalInfo.name || 'Your Name'}
            </h2>
            <div
              className="w-12 h-0.5 my-3"
              style={{
                backgroundColor: accentColor,
                marginLeft: textAlign === 'center' ? 'auto' : textAlign === 'right' ? 'auto' : 0,
                marginRight: textAlign === 'center' ? 'auto' : 0,
              }}
            />
            <p className="text-sm tracking-wider uppercase" style={{ color: accentColor }}>
              {personalInfo.jobTitle || 'Job Title'}
            </p>
            {personalInfo.company && (
              <p className="text-xs mt-1 tracking-wide" style={{ color: textColor, opacity: 0.7 }}>
                {personalInfo.company}
              </p>
            )}
            <div className="mt-4 space-y-1 text-xs" style={{ color: textColor, opacity: 0.8 }}>
              {personalInfo.email && <p>{personalInfo.email}</p>}
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
            </div>
          </div>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="absolute top-4 right-4 w-10 h-10 object-contain opacity-80"
            />
          )}
          {showQrCode && (
            <div
              className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center"
              style={{ color: accentColor, opacity: 0.5 }}
            >
              <QrCode size={28} />
            </div>
          )}
        </div>
      );
    }

    // Creative Template
    return (
      <div
        ref={cardRef}
        className={`relative overflow-hidden ${getBorderClasses()}`}
        style={cardBaseStyle}
      >
        <div
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-20"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: accentColor }}
        />
        <div className={`relative p-5 h-full flex flex-col justify-between ${alignClass}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2
                className="text-xl font-extrabold"
                style={{
                  color: accentColor,
                  textShadow: '1px 1px 0 rgba(0,0,0,0.1)',
                }}
              >
                {personalInfo.name || 'Your Name'}
              </h2>
              <p className="text-sm font-semibold mt-0.5" style={{ color: textColor }}>
                {personalInfo.jobTitle || 'Job Title'}
              </p>
              {personalInfo.company && (
                <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.7 }}>
                  {personalInfo.company}
                </p>
              )}
            </div>
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
            )}
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-1 text-xs" style={{ color: textColor }}>
              {personalInfo.email && (
                <p className="flex items-center gap-1">
                  <Mail size={10} style={{ color: accentColor }} />
                  {personalInfo.email}
                </p>
              )}
              {personalInfo.phone && (
                <p className="flex items-center gap-1">
                  <Phone size={10} style={{ color: accentColor }} />
                  {personalInfo.phone}
                </p>
              )}
              {personalInfo.website && (
                <p className="flex items-center gap-1">
                  <Globe size={10} style={{ color: accentColor }} />
                  {personalInfo.website}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {personalInfo.linkedin && <Linkedin size={14} style={{ color: accentColor }} />}
              {personalInfo.twitter && <Twitter size={14} style={{ color: accentColor }} />}
              {personalInfo.instagram && <Instagram size={14} style={{ color: accentColor }} />}
              {personalInfo.facebook && <Facebook size={14} style={{ color: accentColor }} />}
            </div>
          </div>
        </div>
        {showQrCode && (
          <div
            className="absolute top-4 right-4 w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <QrCode size={28} style={{ color: accentColor }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${
          isDark ? t('tools.businessCardDesigner.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.businessCardDesigner.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')
        } px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.businessCardDesigner.businessCardDesigner', 'Business Card Designer')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.businessCardDesigner.designProfessionalBusinessCardsWith', 'Design professional business cards with live preview')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="business-card-designer" toolName="Business Card Designer" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrintData}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
            {t('tools.businessCardDesigner.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <User size={18} />
                {t('tools.businessCardDesigner.personalInformation', 'Personal Information')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.fullName', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    placeholder={t('tools.businessCardDesigner.johnDoe', 'John Doe')}
                    className={`w-full px-4 py-2.5 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.jobTitle', 'Job Title *')}
                  </label>
                  <input
                    type="text"
                    value={personalInfo.jobTitle}
                    onChange={(e) => handlePersonalInfoChange('jobTitle', e.target.value)}
                    placeholder={t('tools.businessCardDesigner.seniorDesigner', 'Senior Designer')}
                    className={`w-full px-4 py-2.5 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.company', 'Company')}
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={personalInfo.company}
                      onChange={(e) => handlePersonalInfoChange('company', e.target.value)}
                      placeholder={t('tools.businessCardDesigner.acmeCorp', 'Acme Corp')}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.phone', 'Phone')}
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.email', 'Email')}
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      placeholder={t('tools.businessCardDesigner.johnExampleCom', 'john@example.com')}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.website', 'Website')}
                  </label>
                  <div className="relative">
                    <Globe
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="url"
                      value={personalInfo.website}
                      onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                      placeholder={t('tools.businessCardDesigner.wwwExampleCom', 'www.example.com')}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.addressOptional', 'Address (Optional)')}
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={personalInfo.address}
                      onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                      placeholder={t('tools.businessCardDesigner.123MainStCityCountry', '123 Main St, City, Country')}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-2">
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.businessCardDesigner.socialMediaHandles', 'Social Media Handles')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Linkedin
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={personalInfo.linkedin}
                      onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                      placeholder={t('tools.businessCardDesigner.linkedin', 'LinkedIn')}
                      className={`w-full pl-10 pr-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-sm`}
                    />
                  </div>
                  <div className="relative">
                    <Twitter
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={personalInfo.twitter}
                      onChange={(e) => handlePersonalInfoChange('twitter', e.target.value)}
                      placeholder={t('tools.businessCardDesigner.twitter', 'Twitter')}
                      className={`w-full pl-10 pr-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-sm`}
                    />
                  </div>
                  <div className="relative">
                    <Instagram
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={personalInfo.instagram}
                      onChange={(e) => handlePersonalInfoChange('instagram', e.target.value)}
                      placeholder={t('tools.businessCardDesigner.instagram', 'Instagram')}
                      className={`w-full pl-10 pr-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-sm`}
                    />
                  </div>
                  <div className="relative">
                    <Facebook
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={personalInfo.facebook}
                      onChange={(e) => handlePersonalInfoChange('facebook', e.target.value)}
                      placeholder={t('tools.businessCardDesigner.facebook', 'Facebook')}
                      className={`w-full pl-10 pr-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-sm`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Design Options */}
            <div className="space-y-4">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.businessCardDesigner.designOptions', 'Design Options')}
              </h4>

              {/* Template Selection */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.businessCardDesigner.layoutTemplate', 'Layout Template')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(templates) as Array<keyof typeof templates>).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleDesignOptionChange('template', key)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        designOptions.template === key
                          ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                          : isDark
                          ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {templates[key].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scheme */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.businessCardDesigner.colorScheme', 'Color Scheme')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.name}
                      onClick={() => handleColorSchemeChange(scheme.name)}
                      className={`relative h-10 rounded-lg border-2 transition-all ${
                        designOptions.colorScheme === scheme.name
                          ? t('tools.businessCardDesigner.border0d9488Ring2Ring', 'border-[#0D9488] ring-2 ring-[#0D9488]/20') : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${scheme.primary} 50%, ${scheme.secondary} 50%)`,
                      }}
                      title={scheme.name}
                    >
                      {designOptions.colorScheme === scheme.name && (
                        <Check size={14} className="absolute top-1 right-1 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.businessCardDesigner.background', 'Background')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designOptions.backgroundColor}
                      onChange={(e) => handleDesignOptionChange('backgroundColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={designOptions.backgroundColor}
                      onChange={(e) => handleDesignOptionChange('backgroundColor', e.target.value)}
                      className={`flex-1 px-2 py-1.5 text-xs border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.businessCardDesigner.textColor', 'Text Color')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designOptions.textColor}
                      onChange={(e) => handleDesignOptionChange('textColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={designOptions.textColor}
                      onChange={(e) => handleDesignOptionChange('textColor', e.target.value)}
                      className={`flex-1 px-2 py-1.5 text-xs border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.businessCardDesigner.accentColor', 'Accent Color')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designOptions.accentColor}
                      onChange={(e) => handleDesignOptionChange('accentColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={designOptions.accentColor}
                      onChange={(e) => handleDesignOptionChange('accentColor', e.target.value)}
                      className={`flex-1 px-2 py-1.5 text-xs border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
              </div>

              {/* Font Style & Alignment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.fontStyle', 'Font Style')}
                  </label>
                  <select
                    value={designOptions.fontStyle}
                    onChange={(e) =>
                      handleDesignOptionChange('fontStyle', e.target.value as 'sans' | 'serif' | 'mono')
                    }
                    className={`w-full px-3 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
                  >
                    <option value="sans">{t('tools.businessCardDesigner.sansSerif', 'Sans-serif')}</option>
                    <option value="serif">{t('tools.businessCardDesigner.serif', 'Serif')}</option>
                    <option value="mono">{t('tools.businessCardDesigner.monospace', 'Monospace')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.textAlignment', 'Text Alignment')}
                  </label>
                  <div className="flex gap-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => handleDesignOptionChange('textAlign', align)}
                        className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                          designOptions.textAlign === align
                            ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                            : isDark
                            ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {align === 'left' && <AlignLeft size={18} className="mx-auto" />}
                        {align === 'center' && <AlignCenter size={18} className="mx-auto" />}
                        {align === 'right' && <AlignRight size={18} className="mx-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Border Style */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.businessCardDesigner.borderStyle', 'Border Style')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'solid', 'rounded', 'shadow'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => handleDesignOptionChange('borderStyle', style)}
                      className={`px-3 py-2 text-sm rounded-lg border capitalize transition-all ${
                        designOptions.borderStyle === style
                          ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                          : isDark
                          ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload & QR Code */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.logo', 'Logo')}
                  </label>
                  {designOptions.logoUrl ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={designOptions.logoUrl}
                        alt="Logo"
                        className="w-12 h-12 object-contain rounded border border-gray-300"
                      />
                      <button
                        onClick={() => handleDesignOptionChange('logoUrl', null)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <label
                      className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${
                        isDark ? t('tools.businessCardDesigner.borderGray600HoverBorder', 'border-gray-600 hover:border-[#0D9488]') : t('tools.businessCardDesigner.borderGray300HoverBorder', 'border-gray-300 hover:border-[#0D9488]')
                      } rounded-xl cursor-pointer transition-colors`}
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.businessCardDesigner.upload', 'Upload')}
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

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.businessCardDesigner.qrCodePlaceholder', 'QR Code Placeholder')}
                  </label>
                  <button
                    onClick={() => handleDesignOptionChange('showQrCode', !designOptions.showQrCode)}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${
                      designOptions.showQrCode
                        ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                        : isDark
                        ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                        : 'border-gray-300 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    <QrCode size={20} />
                    <span className="text-sm">{designOptions.showQrCode ? t('tools.businessCardDesigner.enabled', 'Enabled') : t('tools.businessCardDesigner.disabled', 'Disabled')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            {/* Card Preview */}
            <div className="space-y-3">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.businessCardDesigner.livePreview', 'Live Preview')}
              </h4>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Standard size: 3.5&quot; x 2&quot; (89mm x 51mm)
              </p>
              <div
                className={`flex items-center justify-center p-6 rounded-xl border-2 border-dashed ${
                  isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                {renderCardPreview()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePrint}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Printer size={18} />
                  {t('tools.businessCardDesigner.printPreview', 'Print Preview')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-all"
                >
                  <Download size={18} />
                  {t('tools.businessCardDesigner.download', 'Download')}
                </button>
              </div>
              <button
                onClick={handleReset}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RotateCcw size={18} />
                {t('tools.businessCardDesigner.resetDesign', 'Reset Design')}
              </button>
            </div>

            {/* Save Design */}
            <div
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-3`}
            >
              <h5 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.businessCardDesigner.saveDesign', 'Save Design')}
              </h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentDesignName}
                  onChange={(e) => setCurrentDesignName(e.target.value)}
                  placeholder={t('tools.businessCardDesigner.designName', 'Design name...')}
                  className={`flex-1 px-3 py-2 border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                  } rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-sm`}
                />
                <button
                  onClick={handleSaveDesign}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    saveSuccess
                      ? 'bg-green-500 text-white' : t('tools.businessCardDesigner.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
                  }`}
                >
                  {saveSuccess ? <Check size={18} /> : <Save size={18} />}
                  {saveSuccess ? t('tools.businessCardDesigner.saved', 'Saved!') : t('tools.businessCardDesigner.save', 'Save')}
                </button>
              </div>
            </div>

            {/* Saved Designs List */}
            {savedDesigns.length > 0 && (
              <div className="space-y-3">
                <h5 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Saved Designs ({savedDesigns.length})
                </h5>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {savedDesigns.map((design) => (
                    <div
                      key={design.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {design.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(design.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLoadDesign(design)}
                          className="p-2 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                          title={t('tools.businessCardDesigner.loadDesign', 'Load design')}
                        >
                          <Upload size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDesign(design.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('tools.businessCardDesigner.deleteDesign', 'Delete design')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Section */}
            <div
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h5 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.businessCardDesigner.tips', 'Tips')}
              </h5>
              <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>Standard business card size is 3.5&quot; x 2&quot; (89mm x 51mm)</li>
                <li>{t('tools.businessCardDesigner.keepYourDesignCleanAnd', 'Keep your design clean and readable')}</li>
                <li>{t('tools.businessCardDesigner.useHighContrastColorsFor', 'Use high-contrast colors for better visibility')}</li>
                <li>{t('tools.businessCardDesigner.includeOnlyEssentialContactInformation', 'Include only essential contact information')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            isDark
              ? 'bg-red-900/80 text-red-100'
              : 'bg-red-100 text-red-800'
          }`}>
            {validationMessage}
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default BusinessCardDesignerTool;
