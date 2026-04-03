import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plane, Clock, FileText, CheckCircle, AlertCircle, Info, Globe, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Country {
  code: string;
  name: string;
  region: string;
}

interface VisaRequirement {
  type: 'visa-free' | 'visa-on-arrival' | 'e-visa' | 'visa-required';
  duration?: string;
  processingTime?: string;
  fee?: string;
  description: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
}

// Persisted data structure for backend sync
interface VisaChecklistData {
  id: string;
  passportCountry: string;
  destinationCountry: string;
  checklistItems: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'passportCountry', header: 'Passport Country', type: 'string' },
  { key: 'destinationCountry', header: 'Destination Country', type: 'string' },
  { key: 'visaType', header: 'Visa Type', type: 'string' },
  { key: 'duration', header: 'Stay Duration', type: 'string' },
  { key: 'processingTime', header: 'Processing Time', type: 'string' },
  { key: 'fee', header: 'Visa Fee', type: 'string' },
  { key: 'document', header: 'Document/Requirement', type: 'string' },
  { key: 'required', header: 'Required', type: 'string' },
  { key: 'completed', header: 'Completed', type: 'string' },
];

const countries: Country[] = [
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'AU', name: 'Australia', region: 'Oceania' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'JP', name: 'Japan', region: 'Asia' },
  { code: 'CN', name: 'China', region: 'Asia' },
  { code: 'IN', name: 'India', region: 'Asia' },
  { code: 'BR', name: 'Brazil', region: 'South America' },
  { code: 'MX', name: 'Mexico', region: 'North America' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East' },
  { code: 'SG', name: 'Singapore', region: 'Asia' },
  { code: 'TH', name: 'Thailand', region: 'Asia' },
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', region: 'Europe' },
  { code: 'KR', name: 'South Korea', region: 'Asia' },
  { code: 'ZA', name: 'South Africa', region: 'Africa' },
  { code: 'NG', name: 'Nigeria', region: 'Africa' },
  { code: 'EG', name: 'Egypt', region: 'Africa' },
  { code: 'TR', name: 'Turkey', region: 'Europe' },
  { code: 'RU', name: 'Russia', region: 'Europe' },
  { code: 'PH', name: 'Philippines', region: 'Asia' },
  { code: 'ID', name: 'Indonesia', region: 'Asia' },
  { code: 'MY', name: 'Malaysia', region: 'Asia' },
  { code: 'VN', name: 'Vietnam', region: 'Asia' },
  { code: 'PK', name: 'Pakistan', region: 'Asia' },
  { code: 'BD', name: 'Bangladesh', region: 'Asia' },
  { code: 'AR', name: 'Argentina', region: 'South America' },
];

// Simulated visa requirements database
const getVisaRequirement = (passport: string, destination: string): VisaRequirement => {
  // Same country - no visa needed
  if (passport === destination) {
    return {
      type: 'visa-free',
      duration: 'Unlimited',
      description: 'No visa required for your own country of citizenship.',
    };
  }

  // Strong passports (US, UK, EU, etc.) traveling to most destinations
  const strongPassports = ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'CA', 'AU', 'JP', 'KR', 'SG'];
  const visaFreeDestinations = ['TH', 'MY', 'SG', 'JP', 'KR', 'MX', 'BR', 'AR', 'TR'];
  const schengenCountries = ['DE', 'FR', 'IT', 'ES', 'NL'];
  const eVisaCountries = ['IN', 'TR', 'AU', 'EG', 'VN'];
  const voaCountries = ['TH', 'ID', 'EG', 'TR', 'AE'];

  // Schengen zone logic
  if (schengenCountries.includes(passport) && schengenCountries.includes(destination)) {
    return {
      type: 'visa-free',
      duration: 'Unlimited (EU/Schengen)',
      description: 'Free movement within the Schengen Area as an EU citizen.',
    };
  }

  // Strong passport holders
  if (strongPassports.includes(passport)) {
    if (visaFreeDestinations.includes(destination) || schengenCountries.includes(destination)) {
      return {
        type: 'visa-free',
        duration: '30-90 days',
        processingTime: 'N/A',
        description: 'Visa-free entry for tourism and short business trips.',
      };
    }
    if (eVisaCountries.includes(destination)) {
      return {
        type: 'e-visa',
        duration: '30-60 days',
        processingTime: '3-5 business days',
        fee: '$25-100',
        description: 'Electronic visa available online. Apply before travel.',
      };
    }
    if (['CN', 'RU', 'IN'].includes(destination)) {
      return {
        type: 'visa-required',
        duration: '30-90 days',
        processingTime: '5-15 business days',
        fee: '$100-200',
        description: 'Visa required. Apply at embassy or consulate.',
      };
    }
  }

  // VOA destinations for most travelers
  if (voaCountries.includes(destination)) {
    return {
      type: 'visa-on-arrival',
      duration: '15-30 days',
      processingTime: 'On arrival',
      fee: '$20-50',
      description: 'Visa available on arrival at the airport.',
    };
  }

  // E-visa destinations
  if (eVisaCountries.includes(destination)) {
    return {
      type: 'e-visa',
      duration: '30-60 days',
      processingTime: '3-7 business days',
      fee: '$25-150',
      description: 'Electronic visa required. Apply online before travel.',
    };
  }

  // Default to visa required
  return {
    type: 'visa-required',
    duration: '30-90 days',
    processingTime: '10-20 business days',
    fee: '$50-300',
    description: 'Visa required. Apply at embassy or consulate in advance.',
  };
};

const getChecklistItems = (visaType: VisaRequirement['type']): ChecklistItem[] => {
  const baseItems: ChecklistItem[] = [
    { id: 'passport', label: 'Valid passport (6+ months validity)', required: true, checked: false },
    { id: 'photo', label: 'Passport-sized photos', required: true, checked: false },
    { id: 'itinerary', label: 'Travel itinerary / flight booking', required: true, checked: false },
    { id: 'accommodation', label: 'Hotel reservation / accommodation proof', required: true, checked: false },
  ];

  if (visaType === 'visa-free') {
    return [
      ...baseItems,
      { id: 'insurance', label: 'Travel insurance (recommended)', required: false, checked: false },
      { id: 'funds', label: 'Proof of sufficient funds', required: false, checked: false },
    ];
  }

  if (visaType === 'visa-on-arrival') {
    return [
      ...baseItems,
      { id: 'cash', label: 'Cash for visa fee (USD preferred)', required: true, checked: false },
      { id: 'return', label: 'Return/onward ticket', required: true, checked: false },
      { id: 'insurance', label: 'Travel insurance', required: false, checked: false },
    ];
  }

  if (visaType === 'e-visa') {
    return [
      ...baseItems,
      { id: 'application', label: 'Complete online application', required: true, checked: false },
      { id: 'payment', label: 'Online payment for visa fee', required: true, checked: false },
      { id: 'printout', label: 'Print e-visa approval letter', required: true, checked: false },
      { id: 'insurance', label: 'Travel insurance', required: false, checked: false },
    ];
  }

  // Visa required
  return [
    ...baseItems,
    { id: 'application', label: 'Completed visa application form', required: true, checked: false },
    { id: 'bank', label: 'Bank statements (3-6 months)', required: true, checked: false },
    { id: 'employment', label: 'Employment letter / business proof', required: true, checked: false },
    { id: 'invitation', label: 'Invitation letter (if applicable)', required: false, checked: false },
    { id: 'insurance', label: 'Travel insurance', required: true, checked: false },
    { id: 'interview', label: 'Schedule visa interview (if required)', required: false, checked: false },
  ];
};

interface VisaRequirementsToolProps {
  uiConfig?: UIConfig;
}

export const VisaRequirementsTool: React.FC<VisaRequirementsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [passportCountry, setPassportCountry] = useState('US');
  const [destinationCountry, setDestinationCountry] = useState('JP');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: savedChecklists,
    addItem: addSavedChecklist,
    updateItem: updateSavedChecklist,
    deleteItem: deleteSavedChecklist,
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
  } = useToolData<VisaChecklistData>('visa-requirements', [], COLUMNS);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.passportCountry) {
        setPassportCountry(params.passportCountry);
        hasChanges = true;
      }
      if (params.destinationCountry) {
        setDestinationCountry(params.destinationCountry);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const visaRequirement = useMemo(() => {
    return getVisaRequirement(passportCountry, destinationCountry);
  }, [passportCountry, destinationCountry]);

  // Load saved checklist for current country pair or create new one
  useEffect(() => {
    if (isLoading) return;

    const checklistKey = `${passportCountry}-${destinationCountry}`;
    const existingSaved = savedChecklists.find(
      sc => sc.passportCountry === passportCountry && sc.destinationCountry === destinationCountry
    );

    if (existingSaved) {
      // Use saved checklist items, but merge with current visa type requirements
      const defaultItems = getChecklistItems(visaRequirement.type);
      const mergedItems = defaultItems.map(defaultItem => {
        const savedItem = existingSaved.checklistItems.find(si => si.id === defaultItem.id);
        return savedItem ? { ...defaultItem, checked: savedItem.checked } : defaultItem;
      });
      setChecklist(mergedItems);
    } else {
      // No saved checklist, create fresh one
      setChecklist(getChecklistItems(visaRequirement.type));
    }
  }, [passportCountry, destinationCountry, visaRequirement.type, savedChecklists, isLoading]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => {
      const updatedChecklist = prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );

      // Save to backend
      const existingSaved = savedChecklists.find(
        sc => sc.passportCountry === passportCountry && sc.destinationCountry === destinationCountry
      );

      if (existingSaved) {
        updateSavedChecklist(existingSaved.id, {
          checklistItems: updatedChecklist,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const newSavedChecklist: VisaChecklistData = {
          id: `${passportCountry}-${destinationCountry}-${Date.now()}`,
          passportCountry,
          destinationCountry,
          checklistItems: updatedChecklist,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addSavedChecklist(newSavedChecklist);
      }

      return updatedChecklist;
    });
  };

  const completedCount = checklist.filter((item) => item.checked).length;
  const requiredCount = checklist.filter((item) => item.required).length;
  const requiredCompleted = checklist.filter((item) => item.required && item.checked).length;

  const getVisaTypeColor = (type: VisaRequirement['type']) => {
    switch (type) {
      case 'visa-free':
        return 'text-green-500';
      case 'visa-on-arrival':
        return 'text-blue-500';
      case 'e-visa':
        return 'text-purple-500';
      case 'visa-required':
        return 'text-orange-500';
    }
  };

  const getVisaTypeBgColor = (type: VisaRequirement['type']) => {
    switch (type) {
      case 'visa-free':
        return isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200';
      case 'visa-on-arrival':
        return isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200';
      case 'e-visa':
        return isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200';
      case 'visa-required':
        return isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200';
    }
  };

  const getVisaTypeLabel = (type: VisaRequirement['type']) => {
    switch (type) {
      case 'visa-free':
        return 'Visa Free';
      case 'visa-on-arrival':
        return 'Visa on Arrival';
      case 'e-visa':
        return 'E-Visa Required';
      case 'visa-required':
        return 'Visa Required';
    }
  };

  const passportCountryData = countries.find((c) => c.code === passportCountry);
  const destinationCountryData = countries.find((c) => c.code === destinationCountry);

  // Prepare export data combining visa info and checklist
  const exportData = useMemo(() => {
    // Create a summary row first, then checklist items
    return checklist.map((item) => ({
      id: item.id,
      passportCountry: passportCountryData?.name || passportCountry,
      destinationCountry: destinationCountryData?.name || destinationCountry,
      visaType: getVisaTypeLabel(visaRequirement.type),
      duration: visaRequirement.duration || 'N/A',
      processingTime: visaRequirement.processingTime || 'N/A',
      fee: visaRequirement.fee || 'N/A',
      document: item.label,
      required: item.required ? 'Yes' : 'No',
      completed: item.checked ? 'Yes' : 'No',
    }));
  }, [checklist, passportCountryData, destinationCountryData, visaRequirement, passportCountry, destinationCountry]);

  // Export filename prefix
  const filenamePrefix = `visa-requirements-${passportCountry}-to-${destinationCountry}`;
  const exportTitle = `Visa Requirements: ${passportCountryData?.name || passportCountry} to ${destinationCountryData?.name || destinationCountry}`;

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg"><BookOpen className="w-5 h-5 text-indigo-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.visaRequirements.visaRequirementsChecker', 'Visa Requirements Checker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.visaRequirements.checkVisaRequirementsAndPrepare', 'Check visa requirements and prepare your documents')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="visa-requirements" toolName="Visa Requirements" />

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
              onExportCSV={() => exportCSV({ filename: filenamePrefix })}
              onExportExcel={() => exportExcel({ filename: filenamePrefix })}
              onExportJSON={() => exportJSON({ filename: filenamePrefix })}
              onExportPDF={async () => { await exportPDF({ filename: filenamePrefix, title: exportTitle }); }}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onPrint={() => print(exportTitle)}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-indigo-500 font-medium">{t('tools.visaRequirements.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Country Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <BookOpen className="w-4 h-4 inline mr-1" />
              {t('tools.visaRequirements.passportCountry', 'Passport Country')}
            </label>
            <select
              value={passportCountry}
              onChange={(e) => setPassportCountry(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Plane className="w-4 h-4 inline mr-1" />
              {t('tools.visaRequirements.destinationCountry', 'Destination Country')}
            </label>
            <select
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Travel Summary */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} flex items-center justify-center gap-4`}>
          <div className="text-center">
            <Globe className={`w-6 h-6 mx-auto mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{passportCountryData?.region}</div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{passportCountryData?.name}</div>
          </div>
          <Plane className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <div className="text-center">
            <Globe className={`w-6 h-6 mx-auto mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{destinationCountryData?.region}</div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{destinationCountryData?.name}</div>
          </div>
        </div>

        {/* Visa Requirement Result */}
        <div className={`p-4 rounded-lg border ${getVisaTypeBgColor(visaRequirement.type)}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.visaRequirements.visaStatus', 'Visa Status')}</h4>
            <span className={`font-bold ${getVisaTypeColor(visaRequirement.type)}`}>
              {getVisaTypeLabel(visaRequirement.type)}
            </span>
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {visaRequirement.description}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {visaRequirement.duration && (
              <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className="w-4 h-4" />
                <div>
                  <div className="font-medium">{t('tools.visaRequirements.stayDuration', 'Stay Duration')}</div>
                  <div>{visaRequirement.duration}</div>
                </div>
              </div>
            )}
            {visaRequirement.processingTime && (
              <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="w-4 h-4" />
                <div>
                  <div className="font-medium">{t('tools.visaRequirements.processingTime', 'Processing Time')}</div>
                  <div>{visaRequirement.processingTime}</div>
                </div>
              </div>
            )}
            {visaRequirement.fee && (
              <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <FileText className="w-4 h-4" />
                <div>
                  <div className="font-medium">{t('tools.visaRequirements.visaFee', 'Visa Fee')}</div>
                  <div>{visaRequirement.fee}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-4 h-4 inline mr-1" />
              {t('tools.visaRequirements.applicationChecklist', 'Application Checklist')}
            </h4>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {completedCount}/{checklist.length} complete
            </span>
          </div>

          {/* Progress bar */}
          <div className={`h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(completedCount / checklist.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  item.checked
                    ? 'bg-indigo-500 border-indigo-500'
                    : isDark ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  {item.checked && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className={`flex-1 ${
                  item.checked
                    ? isDark ? 'text-gray-500 line-through' : 'text-gray-400 line-through'
                    : isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {item.label}
                </span>
                {item.required && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                  }`}>
                    {t('tools.visaRequirements.required', 'Required')}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Checklist Status */}
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            requiredCompleted === requiredCount
              ? isDark ? 'bg-green-900/20' : 'bg-green-50'
              : isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
          }`}>
            {requiredCompleted === requiredCount ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  {t('tools.visaRequirements.allRequiredDocumentsCheckedYou', 'All required documents checked! You\'re ready to apply.')}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  {requiredCount - requiredCompleted} required item(s) remaining
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.visaRequirements.importantNotes', 'Important Notes:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Always verify requirements with the official embassy website</li>
                <li>- Visa policies can change - check close to your travel date</li>
                <li>- Ensure your passport is valid for 6+ months beyond travel</li>
                <li>- Apply well in advance during peak travel seasons</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaRequirementsTool;
