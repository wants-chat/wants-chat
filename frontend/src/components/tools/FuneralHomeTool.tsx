'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
import {
  Heart,
  Calendar,
  Clock,
  Package,
  Flower2,
  FileText,
  Users,
  Music,
  MapPin,
  DollarSign,
  ClipboardList,
  FileCheck,
  Shield,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

// Types
interface DeceasedInfo {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  dateOfDeath: string;
  placeOfDeath: string;
  nextOfKin: string;
  nextOfKinRelation: string;
  nextOfKinPhone: string;
  nextOfKinEmail: string;
  socialSecurityNumber: string;
  veteranStatus: boolean;
  religion: string;
  notes: string;
}

interface ServiceEvent {
  id: string;
  type: 'viewing' | 'funeral' | 'burial' | 'cremation' | 'memorial' | 'reception';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  notes: string;
  confirmed: boolean;
}

interface CasketUrn {
  id: string;
  type: 'casket' | 'urn';
  name: string;
  material: string;
  color: string;
  price: number;
  selected: boolean;
  notes: string;
}

interface FlowerArrangement {
  id: string;
  type: string;
  description: string;
  quantity: number;
  price: number;
  orderedBy: string;
  deliveryDate: string;
  status: 'ordered' | 'delivered' | 'pending';
}

interface Officiant {
  id: string;
  name: string;
  title: string;
  organization: string;
  phone: string;
  email: string;
  fee: number;
  confirmed: boolean;
  notes: string;
}

interface MusicReading {
  id: string;
  type: 'music' | 'reading' | 'hymn' | 'poem';
  title: string;
  performer: string;
  order: number;
  notes: string;
}

interface CemeteryInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  plotNumber: string;
  plotPrice: number;
  openingClosingFee: number;
  perpetualCare: boolean;
  notes: string;
}

interface PricingItem {
  id: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  included: boolean;
}

interface PreNeedRecord {
  id: string;
  planDate: string;
  planNumber: string;
  paidAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  preferences: string;
  notes: string;
}

interface DeathCertificate {
  id: string;
  status: 'pending' | 'filed' | 'issued' | 'copies_ordered';
  filedDate: string;
  issuedDate: string;
  copiesRequested: number;
  copiesReceived: number;
  notes: string;
}

interface InsuranceClaim {
  id: string;
  companyName: string;
  policyNumber: string;
  benefitAmount: number;
  claimNumber: string;
  status: 'pending' | 'submitted' | 'approved' | 'denied' | 'paid';
  submittedDate: string;
  notes: string;
}

interface Obituary {
  content: string;
  publishDate: string;
  publications: string[];
  approved: boolean;
}

interface FuneralHomeData {
  id: string;
  deceased: DeceasedInfo;
  services: ServiceEvent[];
  casketUrns: CasketUrn[];
  flowers: FlowerArrangement[];
  officiants: Officiant[];
  musicReadings: MusicReading[];
  cemetery: CemeteryInfo;
  pricing: PricingItem[];
  preNeed: PreNeedRecord;
  deathCertificate: DeathCertificate;
  insuranceClaims: InsuranceClaim[];
  obituary: Obituary;
}

// Column configuration for export (basic overview)
const funeralHomeColumns: ColumnConfig[] = [
  { key: 'id', header: 'Record ID', type: 'string' },
  { key: 'deceasedName', header: 'Deceased Name', type: 'string' },
  { key: 'dateOfDeath', header: 'Date of Death', type: 'date' },
  { key: 'nextOfKin', header: 'Next of Kin', type: 'string' },
  { key: 'totalEstimate', header: 'Total Estimate', type: 'currency' },
  { key: 'servicesCount', header: 'Services Scheduled', type: 'number' },
];

const defaultDeceased: DeceasedInfo = {
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  dateOfDeath: '',
  placeOfDeath: '',
  nextOfKin: '',
  nextOfKinRelation: '',
  nextOfKinPhone: '',
  nextOfKinEmail: '',
  socialSecurityNumber: '',
  veteranStatus: false,
  religion: '',
  notes: '',
};

const defaultCemetery: CemeteryInfo = {
  id: crypto.randomUUID(),
  name: '',
  address: '',
  phone: '',
  plotNumber: '',
  plotPrice: 0,
  openingClosingFee: 0,
  perpetualCare: false,
  notes: '',
};

const defaultPreNeed: PreNeedRecord = {
  id: crypto.randomUUID(),
  planDate: '',
  planNumber: '',
  paidAmount: 0,
  paymentStatus: 'pending',
  preferences: '',
  notes: '',
};

const defaultDeathCertificate: DeathCertificate = {
  id: crypto.randomUUID(),
  status: 'pending',
  filedDate: '',
  issuedDate: '',
  copiesRequested: 0,
  copiesReceived: 0,
  notes: '',
};

const defaultObituary: Obituary = {
  content: '',
  publishDate: '',
  publications: [],
  approved: false,
};

const defaultPricingCategories = [
  { category: 'Professional Services', description: 'Basic services of funeral director and staff', price: 2500, included: true },
  { category: 'Facility', description: 'Use of facilities for viewing', price: 500, included: true },
  { category: 'Facility', description: 'Use of facilities for funeral ceremony', price: 600, included: true },
  { category: 'Transportation', description: 'Transfer of remains to funeral home', price: 400, included: true },
  { category: 'Transportation', description: 'Hearse for funeral service', price: 350, included: true },
  { category: 'Transportation', description: 'Limousine for family', price: 300, included: false },
  { category: 'Preparation', description: 'Embalming', price: 800, included: true },
  { category: 'Preparation', description: 'Other preparation of remains', price: 300, included: true },
  { category: 'Merchandise', description: 'Casket/Urn', price: 0, included: false },
  { category: 'Merchandise', description: 'Outer burial container', price: 1200, included: false },
  { category: 'Merchandise', description: 'Memorial package (programs, cards)', price: 250, included: true },
];

const serviceTypeLabels: Record<string, string> = {
  viewing: 'Viewing/Visitation',
  funeral: 'Funeral Service',
  burial: 'Burial/Interment',
  cremation: 'Cremation',
  memorial: 'Memorial Service',
  reception: 'Reception/Repast',
};

const tabs = [
  { id: 'deceased', label: 'Deceased Info', icon: Heart },
  { id: 'services', label: 'Services', icon: Calendar },
  { id: 'casket', label: 'Casket/Urn', icon: Package },
  { id: 'flowers', label: 'Flowers', icon: Flower2 },
  { id: 'obituary', label: 'Obituary', icon: FileText },
  { id: 'officiant', label: 'Officiant', icon: Users },
  { id: 'music', label: 'Music/Readings', icon: Music },
  { id: 'cemetery', label: 'Cemetery', icon: MapPin },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'preneed', label: 'Pre-Need', icon: ClipboardList },
  { id: 'certificate', label: 'Death Cert', icon: FileCheck },
  { id: 'insurance', label: 'Insurance', icon: Shield },
];

interface FuneralHomeToolProps {
  uiConfig?: UIConfig;
}

// Generate default funeral home data
const generateDefaultFuneralHomeData = (): FuneralHomeData[] => [{
  id: 'funeral-record-1',
  deceased: defaultDeceased,
  services: [],
  casketUrns: [],
  flowers: [],
  officiants: [],
  musicReadings: [],
  cemetery: defaultCemetery,
  pricing: defaultPricingCategories.map((item) => ({
    id: crypto.randomUUID(),
    ...item,
    quantity: 1,
  })),
  preNeed: defaultPreNeed,
  deathCertificate: defaultDeathCertificate,
  insuranceClaims: [],
  obituary: defaultObituary,
}];

export const FuneralHomeTool: React.FC<FuneralHomeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState('deceased');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Initialize useToolData hook for backend persistence
  const {
    data: toolDataArray,
    updateItem,
    addItem,
    resetToDefault,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<FuneralHomeData>(
    'funeral-home-tool',
    generateDefaultFuneralHomeData(),
    funeralHomeColumns,
    { autoSave: true }
  );

  // Get the current funeral record (first item in array)
  const data = toolDataArray[0] || generateDefaultFuneralHomeData()[0];

  // Helper to update the data
  const setData = (updater: FuneralHomeData | ((prev: FuneralHomeData) => FuneralHomeData)) => {
    const newData = typeof updater === 'function' ? updater(data) : updater;
    if (toolDataArray.length > 0) {
      updateItem(data.id, newData);
    } else {
      addItem(newData);
    }
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.name) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Calculate total pricing
  const totalPricing = useMemo(() => {
    return data.pricing
      .filter(item => item.included)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [data.pricing]);

  // Prepare export data for ExportDropdown
  const getExportData = () => {
    return [{
      id: data.id,
      deceasedName: `${data.deceased.firstName} ${data.deceased.lastName}`.trim() || 'N/A',
      dateOfDeath: data.deceased.dateOfDeath || 'N/A',
      nextOfKin: data.deceased.nextOfKin || 'N/A',
      totalEstimate: totalPricing,
      servicesCount: data.services.length,
    }];
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Update deceased info
  const updateDeceased = (field: keyof DeceasedInfo, value: string | boolean) => {
    setData(prev => ({
      ...prev,
      deceased: { ...prev.deceased, [field]: value },
    }));
  };

  // Service CRUD
  const addService = () => {
    const newService: ServiceEvent = {
      id: crypto.randomUUID(),
      type: 'viewing',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      address: '',
      notes: '',
      confirmed: false,
    };
    setData(prev => ({ ...prev, services: [...prev.services, newService] }));
  };

  const updateService = (id: string, field: keyof ServiceEvent, value: string | boolean) => {
    setData(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const deleteService = (id: string) => {
    setData(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
  };

  // Casket/Urn CRUD
  const addCasketUrn = () => {
    const newItem: CasketUrn = {
      id: crypto.randomUUID(),
      type: 'casket',
      name: '',
      material: '',
      color: '',
      price: 0,
      selected: false,
      notes: '',
    };
    setData(prev => ({ ...prev, casketUrns: [...prev.casketUrns, newItem] }));
  };

  const updateCasketUrn = (id: string, field: keyof CasketUrn, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      casketUrns: prev.casketUrns.map(c => c.id === id ? { ...c, [field]: value } : c),
    }));
  };

  const deleteCasketUrn = (id: string) => {
    setData(prev => ({ ...prev, casketUrns: prev.casketUrns.filter(c => c.id !== id) }));
  };

  // Flower CRUD
  const addFlower = () => {
    const newFlower: FlowerArrangement = {
      id: crypto.randomUUID(),
      type: '',
      description: '',
      quantity: 1,
      price: 0,
      orderedBy: '',
      deliveryDate: '',
      status: 'pending',
    };
    setData(prev => ({ ...prev, flowers: [...prev.flowers, newFlower] }));
  };

  const updateFlower = (id: string, field: keyof FlowerArrangement, value: string | number) => {
    setData(prev => ({
      ...prev,
      flowers: prev.flowers.map(f => f.id === id ? { ...f, [field]: value } : f),
    }));
  };

  const deleteFlower = (id: string) => {
    setData(prev => ({ ...prev, flowers: prev.flowers.filter(f => f.id !== id) }));
  };

  // Officiant CRUD
  const addOfficiant = () => {
    const newOfficiant: Officiant = {
      id: crypto.randomUUID(),
      name: '',
      title: '',
      organization: '',
      phone: '',
      email: '',
      fee: 0,
      confirmed: false,
      notes: '',
    };
    setData(prev => ({ ...prev, officiants: [...prev.officiants, newOfficiant] }));
  };

  const updateOfficiant = (id: string, field: keyof Officiant, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      officiants: prev.officiants.map(o => o.id === id ? { ...o, [field]: value } : o),
    }));
  };

  const deleteOfficiant = (id: string) => {
    setData(prev => ({ ...prev, officiants: prev.officiants.filter(o => o.id !== id) }));
  };

  // Music/Reading CRUD
  const addMusicReading = () => {
    const newItem: MusicReading = {
      id: crypto.randomUUID(),
      type: 'music',
      title: '',
      performer: '',
      order: data.musicReadings.length + 1,
      notes: '',
    };
    setData(prev => ({ ...prev, musicReadings: [...prev.musicReadings, newItem] }));
  };

  const updateMusicReading = (id: string, field: keyof MusicReading, value: string | number) => {
    setData(prev => ({
      ...prev,
      musicReadings: prev.musicReadings.map(m => m.id === id ? { ...m, [field]: value } : m),
    }));
  };

  const deleteMusicReading = (id: string) => {
    setData(prev => ({ ...prev, musicReadings: prev.musicReadings.filter(m => m.id !== id) }));
  };

  // Cemetery update
  const updateCemetery = (field: keyof CemeteryInfo, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      cemetery: { ...prev.cemetery, [field]: value },
    }));
  };

  // Pricing CRUD
  const addPricingItem = () => {
    const newItem: PricingItem = {
      id: crypto.randomUUID(),
      category: 'Other',
      description: '',
      price: 0,
      quantity: 1,
      included: true,
    };
    setData(prev => ({ ...prev, pricing: [...prev.pricing, newItem] }));
  };

  const updatePricingItem = (id: string, field: keyof PricingItem, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      pricing: prev.pricing.map(p => p.id === id ? { ...p, [field]: value } : p),
    }));
  };

  const deletePricingItem = (id: string) => {
    setData(prev => ({ ...prev, pricing: prev.pricing.filter(p => p.id !== id) }));
  };

  // Pre-Need update
  const updatePreNeed = (field: keyof PreNeedRecord, value: string | number) => {
    setData(prev => ({
      ...prev,
      preNeed: { ...prev.preNeed, [field]: value },
    }));
  };

  // Death Certificate update
  const updateDeathCertificate = (field: keyof DeathCertificate, value: string | number) => {
    setData(prev => ({
      ...prev,
      deathCertificate: { ...prev.deathCertificate, [field]: value },
    }));
  };

  // Insurance Claim CRUD
  const addInsuranceClaim = () => {
    const newClaim: InsuranceClaim = {
      id: crypto.randomUUID(),
      companyName: '',
      policyNumber: '',
      benefitAmount: 0,
      claimNumber: '',
      status: 'pending',
      submittedDate: '',
      notes: '',
    };
    setData(prev => ({ ...prev, insuranceClaims: [...prev.insuranceClaims, newClaim] }));
  };

  const updateInsuranceClaim = (id: string, field: keyof InsuranceClaim, value: string | number) => {
    setData(prev => ({
      ...prev,
      insuranceClaims: prev.insuranceClaims.map(c => c.id === id ? { ...c, [field]: value } : c),
    }));
  };

  const deleteInsuranceClaim = (id: string) => {
    setData(prev => ({ ...prev, insuranceClaims: prev.insuranceClaims.filter(c => c.id !== id) }));
  };

  // Obituary update
  const updateObituary = (field: keyof Obituary, value: string | boolean | string[]) => {
    setData(prev => ({
      ...prev,
      obituary: { ...prev.obituary, [field]: value },
    }));
  };


  // Clear all data
  const clearAllData = async () => {
    const confirmed = await confirm({
      title: 'Clear All Data',
      message: 'Are you sure you want to clear all data? This cannot be undone.',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const freshData: FuneralHomeData = {
        id: 'funeral-record-1',
        deceased: { ...defaultDeceased, id: crypto.randomUUID() },
        services: [],
        casketUrns: [],
        flowers: [],
        officiants: [],
        musicReadings: [],
        cemetery: { ...defaultCemetery, id: crypto.randomUUID() },
        pricing: defaultPricingCategories.map((item) => ({
          id: crypto.randomUUID(),
          ...item,
          quantity: 1,
        })),
        preNeed: { ...defaultPreNeed, id: crypto.randomUUID() },
        deathCertificate: { ...defaultDeathCertificate, id: crypto.randomUUID() },
        insuranceClaims: [],
        obituary: defaultObituary,
      };
      resetToDefault([freshData]);
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`;

  const cardClass = `rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all font-medium shadow-lg shadow-purple-500/20`;

  const buttonDanger = `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm bg-red-500/10 hover:bg-red-500/20 text-red-500`;

  return (
    <div className={`max-w-6xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Heart className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.funeralHome.funeralHomeManagement', 'Funeral Home Management')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.funeralHome.completeFuneralPlanningAndCoordination', 'Complete funeral planning and coordination tool')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Sync Status */}
          <WidgetEmbedButton toolSlug="funeral-home" toolName="Funeral Home" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme}
            showLabel={true}
            size="md"
          />

          {/* Export Dropdown */}
          <ExportDropdown
            onExportCSV={() => exportToCSV(getExportData(), funeralHomeColumns, { filename: `funeral-home-${data.deceased.lastName || 'record'}` })}
            onExportExcel={() => exportToExcel(getExportData(), funeralHomeColumns, { filename: `funeral-home-${data.deceased.lastName || 'record'}` })}
            onExportJSON={() => exportToJSON(getExportData(), { filename: `funeral-home-${data.deceased.lastName || 'record'}` })}
            onExportPDF={() => exportToPDF(getExportData(), funeralHomeColumns, { filename: `funeral-home-${data.deceased.lastName || 'record'}`, title: 'Funeral Home Record' })}
            onPrint={() => printData(getExportData(), funeralHomeColumns, { title: 'Funeral Home Record' })}
            onCopyToClipboard={() => copyUtil(getExportData(), funeralHomeColumns)}
            showImport={false}
            theme={theme}
          />

          <button onClick={clearAllData} className={buttonDanger}>
            <Trash2 className="w-4 h-4" />
            {t('tools.funeralHome.clearAll', 'Clear All')}
          </button>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.funeralHome.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
        </div>
      )}

      {/* Deceased Summary Bar */}
      {data.deceased.firstName && (
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.funeralHome.deceased', 'Deceased:')}</span>
              <span className="ml-2 font-semibold">{data.deceased.firstName} {data.deceased.lastName}</span>
            </div>
            {data.deceased.dateOfDeath && (
              <div>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.funeralHome.dateOfDeath', 'Date of Death:')}</span>
                <span className="ml-2">{new Date(data.deceased.dateOfDeath).toLocaleDateString()}</span>
              </div>
            )}
            <div className="ml-auto">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.funeralHome.totalEstimate', 'Total Estimate:')}</span>
              <span className="ml-2 font-bold text-purple-500">${totalPricing.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-sm'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Deceased Information */}
        {activeTab === 'deceased' && (
          <div className={cardClass}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-500" />
                {t('tools.funeralHome.deceasedInformation', 'Deceased Information')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={data.deceased.firstName}
                    onChange={(e) => updateDeceased('firstName', e.target.value)}
                    placeholder={t('tools.funeralHome.firstName2', 'First name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={data.deceased.lastName}
                    onChange={(e) => updateDeceased('lastName', e.target.value)}
                    placeholder={t('tools.funeralHome.lastName2', 'Last name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.dateOfBirth', 'Date of Birth')}</label>
                  <input
                    type="date"
                    value={data.deceased.dateOfBirth}
                    onChange={(e) => updateDeceased('dateOfBirth', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.dateOfDeath2', 'Date of Death *')}</label>
                  <input
                    type="date"
                    value={data.deceased.dateOfDeath}
                    onChange={(e) => updateDeceased('dateOfDeath', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.placeOfDeath', 'Place of Death')}</label>
                  <input
                    type="text"
                    value={data.deceased.placeOfDeath}
                    onChange={(e) => updateDeceased('placeOfDeath', e.target.value)}
                    placeholder={t('tools.funeralHome.hospitalHomeEtc', 'Hospital, home, etc.')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.socialSecurityNumber', 'Social Security Number')}</label>
                  <input
                    type="text"
                    value={data.deceased.socialSecurityNumber}
                    onChange={(e) => updateDeceased('socialSecurityNumber', e.target.value)}
                    placeholder={t('tools.funeralHome.xxxXxXxxx', 'XXX-XX-XXXX')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.religion', 'Religion')}</label>
                  <input
                    type="text"
                    value={data.deceased.religion}
                    onChange={(e) => updateDeceased('religion', e.target.value)}
                    placeholder={t('tools.funeralHome.religiousAffiliation', 'Religious affiliation')}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="veteranStatus"
                    checked={data.deceased.veteranStatus}
                    onChange={(e) => updateDeceased('veteranStatus', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="veteranStatus" className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.funeralHome.veteranStatus', 'Veteran Status')}
                  </label>
                </div>
              </div>

              {/* Next of Kin Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold mb-4">{t('tools.funeralHome.nextOfKin', 'Next of Kin')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.funeralHome.name', 'Name *')}</label>
                    <input
                      type="text"
                      value={data.deceased.nextOfKin}
                      onChange={(e) => updateDeceased('nextOfKin', e.target.value)}
                      placeholder={t('tools.funeralHome.fullName', 'Full name')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.funeralHome.relationship', 'Relationship')}</label>
                    <input
                      type="text"
                      value={data.deceased.nextOfKinRelation}
                      onChange={(e) => updateDeceased('nextOfKinRelation', e.target.value)}
                      placeholder={t('tools.funeralHome.eGSpouseChild', 'e.g., Spouse, Child')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.funeralHome.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={data.deceased.nextOfKinPhone}
                      onChange={(e) => updateDeceased('nextOfKinPhone', e.target.value)}
                      placeholder="(555) 555-5555"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.funeralHome.email', 'Email')}</label>
                    <input
                      type="email"
                      value={data.deceased.nextOfKinEmail}
                      onChange={(e) => updateDeceased('nextOfKinEmail', e.target.value)}
                      placeholder={t('tools.funeralHome.emailExampleCom', 'email@example.com')}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className={labelClass}>{t('tools.funeralHome.additionalNotes', 'Additional Notes')}</label>
                <textarea
                  value={data.deceased.notes}
                  onChange={(e) => updateDeceased('notes', e.target.value)}
                  placeholder={t('tools.funeralHome.anyAdditionalInformation', 'Any additional information...')}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        {activeTab === 'services' && (
          <div className={cardClass}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  {t('tools.funeralHome.serviceScheduleTimeline', 'Service Schedule & Timeline')}
                </h2>
                <button onClick={addService} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.funeralHome.addService', 'Add Service')}
                </button>
              </div>

              {data.services.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.funeralHome.noServicesScheduledYet', 'No services scheduled yet')}</p>
                  <p className="text-sm mt-1">{t('tools.funeralHome.clickAddServiceToSchedule', 'Click "Add Service" to schedule viewing, funeral, burial, or other events')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.services.map((service, index) => (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.confirmed
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {service.confirmed ? t('tools.funeralHome.confirmed3', 'Confirmed') : t('tools.funeralHome.pending6', 'Pending')}
                          </span>
                          <span className="font-medium">{serviceTypeLabels[service.type]}</span>
                        </div>
                        <button onClick={() => deleteService(service.id)} className={buttonDanger}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.serviceType', 'Service Type')}</label>
                          <select
                            value={service.type}
                            onChange={(e) => updateService(service.id, 'type', e.target.value)}
                            className={inputClass}
                          >
                            {Object.entries(serviceTypeLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.date', 'Date')}</label>
                          <input
                            type="date"
                            value={service.date}
                            onChange={(e) => updateService(service.id, 'date', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.startTime', 'Start Time')}</label>
                          <input
                            type="time"
                            value={service.startTime}
                            onChange={(e) => updateService(service.id, 'startTime', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.endTime', 'End Time')}</label>
                          <input
                            type="time"
                            value={service.endTime}
                            onChange={(e) => updateService(service.id, 'endTime', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('tools.funeralHome.locationName', 'Location Name')}</label>
                          <input
                            type="text"
                            value={service.location}
                            onChange={(e) => updateService(service.id, 'location', e.target.value)}
                            placeholder={t('tools.funeralHome.eGGraceMemorialChapel', 'e.g., Grace Memorial Chapel')}
                            className={inputClass}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('tools.funeralHome.address', 'Address')}</label>
                          <input
                            type="text"
                            value={service.address}
                            onChange={(e) => updateService(service.id, 'address', e.target.value)}
                            placeholder={t('tools.funeralHome.fullAddress', 'Full address')}
                            className={inputClass}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className={labelClass}>{t('tools.funeralHome.notes', 'Notes')}</label>
                          <input
                            type="text"
                            value={service.notes}
                            onChange={(e) => updateService(service.id, 'notes', e.target.value)}
                            placeholder={t('tools.funeralHome.specialInstructionsOrNotes', 'Special instructions or notes')}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id={`confirmed-${service.id}`}
                            checked={service.confirmed}
                            onChange={(e) => updateService(service.id, 'confirmed', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                          />
                          <label htmlFor={`confirmed-${service.id}`} className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            {t('tools.funeralHome.confirmed', 'Confirmed')}
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Casket/Urn Selection */}
        {activeTab === 'casket' && (
          <div className={cardClass}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" />
                  {t('tools.funeralHome.casketUrnSelection', 'Casket/Urn Selection')}
                </h2>
                <button onClick={addCasketUrn} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.funeralHome.addOption', 'Add Option')}
                </button>
              </div>

              {data.casketUrns.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.funeralHome.noCasketOrUrnOptions', 'No casket or urn options added')}</p>
                  <p className="text-sm mt-1">{t('tools.funeralHome.addOptionsToTrackSelection', 'Add options to track selection')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.casketUrns.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${
                        item.selected
                          ? 'border-purple-500 bg-purple-500/10'
                          : theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={(e) => updateCasketUrn(item.id, 'selected', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                          />
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.type === 'casket' ? 'bg-blue-500/20 text-blue-500' : 'bg-amber-500/20 text-amber-500'
                          }`}>
                            {item.type === 'casket' ? t('tools.funeralHome.casket2', 'Casket') : t('tools.funeralHome.urn2', 'Urn')}
                          </span>
                        </div>
                        <button onClick={() => deleteCasketUrn(item.id)} className={buttonDanger}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.type', 'Type')}</label>
                          <select
                            value={item.type}
                            onChange={(e) => updateCasketUrn(item.id, 'type', e.target.value)}
                            className={inputClass}
                          >
                            <option value="casket">{t('tools.funeralHome.casket', 'Casket')}</option>
                            <option value="urn">{t('tools.funeralHome.urn', 'Urn')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.nameModel', 'Name/Model')}</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateCasketUrn(item.id, 'name', e.target.value)}
                            placeholder={t('tools.funeralHome.modelName', 'Model name')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.material', 'Material')}</label>
                          <input
                            type="text"
                            value={item.material}
                            onChange={(e) => updateCasketUrn(item.id, 'material', e.target.value)}
                            placeholder={t('tools.funeralHome.eGMahoganyBronze', 'e.g., Mahogany, Bronze')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.colorFinish', 'Color/Finish')}</label>
                          <input
                            type="text"
                            value={item.color}
                            onChange={(e) => updateCasketUrn(item.id, 'color', e.target.value)}
                            placeholder={t('tools.funeralHome.eGCherrySatin', 'e.g., Cherry, Satin')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.price', 'Price')}</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateCasketUrn(item.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.notes2', 'Notes')}</label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => updateCasketUrn(item.id, 'notes', e.target.value)}
                            placeholder={t('tools.funeralHome.additionalNotes2', 'Additional notes')}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flower Arrangements */}
        {activeTab === 'flowers' && (
          <div className={cardClass}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Flower2 className="w-5 h-5 text-purple-500" />
                  {t('tools.funeralHome.flowerArrangements', 'Flower Arrangements')}
                </h2>
                <button onClick={addFlower} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.funeralHome.addArrangement', 'Add Arrangement')}
                </button>
              </div>

              {data.flowers.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Flower2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.funeralHome.noFlowerArrangementsOrdered', 'No flower arrangements ordered')}</p>
                  <p className="text-sm mt-1">{t('tools.funeralHome.addArrangementsToTrackOrders', 'Add arrangements to track orders')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.flowers.map((flower) => (
                    <div
                      key={flower.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          flower.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                          flower.status === 'ordered' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {flower.status.charAt(0).toUpperCase() + flower.status.slice(1)}
                        </span>
                        <button onClick={() => deleteFlower(flower.id)} className={buttonDanger}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.type2', 'Type')}</label>
                          <input
                            type="text"
                            value={flower.type}
                            onChange={(e) => updateFlower(flower.id, 'type', e.target.value)}
                            placeholder={t('tools.funeralHome.eGCasketSpray', 'e.g., Casket Spray')}
                            className={inputClass}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('tools.funeralHome.description', 'Description')}</label>
                          <input
                            type="text"
                            value={flower.description}
                            onChange={(e) => updateFlower(flower.id, 'description', e.target.value)}
                            placeholder={t('tools.funeralHome.flowerDetails', 'Flower details')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.quantity', 'Quantity')}</label>
                          <input
                            type="number"
                            value={flower.quantity}
                            onChange={(e) => updateFlower(flower.id, 'quantity', parseInt(e.target.value) || 1)}
                            min="1"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.price2', 'Price')}</label>
                          <input
                            type="number"
                            value={flower.price}
                            onChange={(e) => updateFlower(flower.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.status', 'Status')}</label>
                          <select
                            value={flower.status}
                            onChange={(e) => updateFlower(flower.id, 'status', e.target.value)}
                            className={inputClass}
                          >
                            <option value="pending">{t('tools.funeralHome.pending', 'Pending')}</option>
                            <option value="ordered">{t('tools.funeralHome.ordered', 'Ordered')}</option>
                            <option value="delivered">{t('tools.funeralHome.delivered', 'Delivered')}</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('tools.funeralHome.orderedBy', 'Ordered By')}</label>
                          <input
                            type="text"
                            value={flower.orderedBy}
                            onChange={(e) => updateFlower(flower.id, 'orderedBy', e.target.value)}
                            placeholder={t('tools.funeralHome.nameOfPersonOrdering', 'Name of person ordering')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.deliveryDate', 'Delivery Date')}</label>
                          <input
                            type="date"
                            value={flower.deliveryDate}
                            onChange={(e) => updateFlower(flower.id, 'deliveryDate', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{t('tools.funeralHome.totalFlowerOrders', 'Total Flower Orders:')}</span>
                      <span className="text-lg font-bold text-purple-500">
                        ${data.flowers.reduce((sum, f) => sum + (f.price * f.quantity), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Obituary Editor */}
        {activeTab === 'obituary' && (
          <div className={cardClass}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                {t('tools.funeralHome.obituaryDraft', 'Obituary Draft')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.obituaryContent', 'Obituary Content')}</label>
                  <textarea
                    value={data.obituary.content}
                    onChange={(e) => updateObituary('content', e.target.value)}
                    placeholder={t('tools.funeralHome.writeTheObituaryHere', 'Write the obituary here...')}
                    rows={12}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.funeralHome.publicationDate', 'Publication Date')}</label>
                    <input
                      type="date"
                      value={data.obituary.publishDate}
                      onChange={(e) => updateObituary('publishDate', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.funeralHome.publicationsCommaSeparated', 'Publications (comma-separated)')}</label>
                    <input
                      type="text"
                      value={data.obituary.publications.join(', ')}
                      onChange={(e) => updateObituary('publications', e.target.value.split(',').map(s => s.trim()))}
                      placeholder={t('tools.funeralHome.eGLocalTimesCity', 'e.g., Local Times, City Herald')}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="obituaryApproved"
                    checked={data.obituary.approved}
                    onChange={(e) => updateObituary('approved', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="obituaryApproved" className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.funeralHome.approvedByFamily', 'Approved by family')}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Officiant Coordination */}
        {activeTab === 'officiant' && (
          <div className={cardClass}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  {t('tools.funeralHome.clergyOfficiantCoordination', 'Clergy/Officiant Coordination')}
                </h2>
                <button onClick={addOfficiant} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.funeralHome.addOfficiant', 'Add Officiant')}
                </button>
              </div>

              {data.officiants.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.funeralHome.noOfficiantsAdded', 'No officiants added')}</p>
                  <p className="text-sm mt-1">{t('tools.funeralHome.addClergyOrOfficiantsFor', 'Add clergy or officiants for the service')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.officiants.map((officiant) => (
                    <div
                      key={officiant.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          officiant.confirmed
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {officiant.confirmed ? t('tools.funeralHome.confirmed4', 'Confirmed') : t('tools.funeralHome.pending7', 'Pending')}
                        </span>
                        <button onClick={() => deleteOfficiant(officiant.id)} className={buttonDanger}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.name2', 'Name')}</label>
                          <input
                            type="text"
                            value={officiant.name}
                            onChange={(e) => updateOfficiant(officiant.id, 'name', e.target.value)}
                            placeholder={t('tools.funeralHome.fullName2', 'Full name')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.title', 'Title')}</label>
                          <input
                            type="text"
                            value={officiant.title}
                            onChange={(e) => updateOfficiant(officiant.id, 'title', e.target.value)}
                            placeholder={t('tools.funeralHome.eGPastorRabbi', 'e.g., Pastor, Rabbi')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.organization', 'Organization')}</label>
                          <input
                            type="text"
                            value={officiant.organization}
                            onChange={(e) => updateOfficiant(officiant.id, 'organization', e.target.value)}
                            placeholder={t('tools.funeralHome.churchTempleEtc', 'Church, temple, etc.')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.fee', 'Fee')}</label>
                          <input
                            type="number"
                            value={officiant.fee}
                            onChange={(e) => updateOfficiant(officiant.id, 'fee', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.phone2', 'Phone')}</label>
                          <input
                            type="tel"
                            value={officiant.phone}
                            onChange={(e) => updateOfficiant(officiant.id, 'phone', e.target.value)}
                            placeholder="(555) 555-5555"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.email2', 'Email')}</label>
                          <input
                            type="email"
                            value={officiant.email}
                            onChange={(e) => updateOfficiant(officiant.id, 'email', e.target.value)}
                            placeholder={t('tools.funeralHome.emailExampleCom2', 'email@example.com')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.notes3', 'Notes')}</label>
                          <input
                            type="text"
                            value={officiant.notes}
                            onChange={(e) => updateOfficiant(officiant.id, 'notes', e.target.value)}
                            placeholder={t('tools.funeralHome.specialRequests', 'Special requests')}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id={`officiant-confirmed-${officiant.id}`}
                            checked={officiant.confirmed}
                            onChange={(e) => updateOfficiant(officiant.id, 'confirmed', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                          />
                          <label htmlFor={`officiant-confirmed-${officiant.id}`} className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            {t('tools.funeralHome.confirmed2', 'Confirmed')}
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Music/Readings */}
        {activeTab === 'music' && (
          <div className={cardClass}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-500" />
                  {t('tools.funeralHome.musicReadingSelections', 'Music & Reading Selections')}
                </h2>
                <button onClick={addMusicReading} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.funeralHome.addSelection', 'Add Selection')}
                </button>
              </div>

              {data.musicReadings.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.funeralHome.noMusicOrReadingsSelected', 'No music or readings selected')}</p>
                  <p className="text-sm mt-1">{t('tools.funeralHome.addHymnsSongsPoemsOr', 'Add hymns, songs, poems, or readings for the service')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.musicReadings
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                            }`}>
                              {item.order}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              item.type === 'music' ? 'bg-blue-500/20 text-blue-500' :
                              item.type === 'hymn' ? 'bg-purple-500/20 text-purple-500' :
                              item.type === 'poem' ? 'bg-pink-500/20 text-pink-500' :
                              'bg-amber-500/20 text-amber-500'
                            }`}>
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                          </div>
                          <button onClick={() => deleteMusicReading(item.id)} className={buttonDanger}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <div>
                            <label className={labelClass}>{t('tools.funeralHome.type3', 'Type')}</label>
                            <select
                              value={item.type}
                              onChange={(e) => updateMusicReading(item.id, 'type', e.target.value)}
                              className={inputClass}
                            >
                              <option value="music">{t('tools.funeralHome.music', 'Music')}</option>
                              <option value="hymn">{t('tools.funeralHome.hymn', 'Hymn')}</option>
                              <option value="reading">{t('tools.funeralHome.reading', 'Reading')}</option>
                              <option value="poem">{t('tools.funeralHome.poem', 'Poem')}</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.funeralHome.order', 'Order')}</label>
                            <input
                              type="number"
                              value={item.order}
                              onChange={(e) => updateMusicReading(item.id, 'order', parseInt(e.target.value) || 1)}
                              min="1"
                              className={inputClass}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>{t('tools.funeralHome.title2', 'Title')}</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateMusicReading(item.id, 'title', e.target.value)}
                              placeholder={t('tools.funeralHome.songOrReadingTitle', 'Song or reading title')}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>{t('tools.funeralHome.performerReader', 'Performer/Reader')}</label>
                            <input
                              type="text"
                              value={item.performer}
                              onChange={(e) => updateMusicReading(item.id, 'performer', e.target.value)}
                              placeholder={t('tools.funeralHome.name3', 'Name')}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cemetery/Crematory */}
        {activeTab === 'cemetery' && (
          <div className={cardClass}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-500" />
                {t('tools.funeralHome.cemeteryCrematoryCoordination', 'Cemetery/Crematory Coordination')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.funeralHome.cemeteryCrematoryName', 'Cemetery/Crematory Name')}</label>
                  <input
                    type="text"
                    value={data.cemetery.name}
                    onChange={(e) => updateCemetery('name', e.target.value)}
                    placeholder={t('tools.funeralHome.nameOfCemeteryOrCrematory', 'Name of cemetery or crematory')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.phone3', 'Phone')}</label>
                  <input
                    type="tel"
                    value={data.cemetery.phone}
                    onChange={(e) => updateCemetery('phone', e.target.value)}
                    placeholder="(555) 555-5555"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={labelClass}>{t('tools.funeralHome.address2', 'Address')}</label>
                  <input
                    type="text"
                    value={data.cemetery.address}
                    onChange={(e) => updateCemetery('address', e.target.value)}
                    placeholder={t('tools.funeralHome.fullAddress2', 'Full address')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.plotNicheNumber', 'Plot/Niche Number')}</label>
                  <input
                    type="text"
                    value={data.cemetery.plotNumber}
                    onChange={(e) => updateCemetery('plotNumber', e.target.value)}
                    placeholder={t('tools.funeralHome.sectionLotGrave', 'Section, lot, grave')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.plotPrice', 'Plot Price')}</label>
                  <input
                    type="number"
                    value={data.cemetery.plotPrice}
                    onChange={(e) => updateCemetery('plotPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.openingClosingFee', 'Opening/Closing Fee')}</label>
                  <input
                    type="number"
                    value={data.cemetery.openingClosingFee}
                    onChange={(e) => updateCemetery('openingClosingFee', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="perpetualCare"
                    checked={data.cemetery.perpetualCare}
                    onChange={(e) => updateCemetery('perpetualCare', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="perpetualCare" className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.funeralHome.perpetualCareIncluded', 'Perpetual Care Included')}
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.funeralHome.notes4', 'Notes')}</label>
                  <textarea
                    value={data.cemetery.notes}
                    onChange={(e) => updateCemetery('notes', e.target.value)}
                    placeholder={t('tools.funeralHome.additionalInformation', 'Additional information...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing */}
        {activeTab === 'pricing' && (
          <div className={cardClass}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                  {t('tools.funeralHome.pricingItemization', 'Pricing & Itemization')}
                </h2>
                <button onClick={addPricingItem} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.funeralHome.addItem', 'Add Item')}
                </button>
              </div>

              <div className="space-y-2">
                <div className={`grid grid-cols-12 gap-2 px-4 py-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="col-span-1">{t('tools.funeralHome.include', 'Include')}</div>
                  <div className="col-span-2">{t('tools.funeralHome.category', 'Category')}</div>
                  <div className="col-span-4">{t('tools.funeralHome.description2', 'Description')}</div>
                  <div className="col-span-2">{t('tools.funeralHome.price3', 'Price')}</div>
                  <div className="col-span-1">{t('tools.funeralHome.qty', 'Qty')}</div>
                  <div className="col-span-1">{t('tools.funeralHome.subtotal', 'Subtotal')}</div>
                  <div className="col-span-1"></div>
                </div>
                {data.pricing.map((item) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${
                      item.included
                        ? theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                        : theme === 'dark' ? 'bg-gray-800/50 opacity-60' : 'bg-gray-100/50 opacity-60'
                    }`}
                  >
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={item.included}
                        onChange={(e) => updatePricingItem(item.id, 'included', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => updatePricingItem(item.id, 'category', e.target.value)}
                        placeholder={t('tools.funeralHome.category2', 'Category')}
                        className={`${inputClass} text-sm py-1`}
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updatePricingItem(item.id, 'description', e.target.value)}
                        placeholder={t('tools.funeralHome.description3', 'Description')}
                        className={`${inputClass} text-sm py-1`}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updatePricingItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={`${inputClass} text-sm py-1`}
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updatePricingItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className={`${inputClass} text-sm py-1`}
                      />
                    </div>
                    <div className="col-span-1 text-right font-medium">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                    <div className="col-span-1 text-right">
                      <button onClick={() => deletePricingItem(item.id)} className="text-red-500 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-100'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">{t('tools.funeralHome.totalEstimate2', 'Total Estimate:')}</span>
                  <span className="text-2xl font-bold text-purple-500">
                    ${totalPricing.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pre-Need Planning */}
        {activeTab === 'preneed' && (
          <div className={cardClass}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-purple-500" />
                {t('tools.funeralHome.preNeedPlanningRecords', 'Pre-Need Planning Records')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.planDate', 'Plan Date')}</label>
                  <input
                    type="date"
                    value={data.preNeed.planDate}
                    onChange={(e) => updatePreNeed('planDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.planNumber', 'Plan Number')}</label>
                  <input
                    type="text"
                    value={data.preNeed.planNumber}
                    onChange={(e) => updatePreNeed('planNumber', e.target.value)}
                    placeholder={t('tools.funeralHome.preNeedPlanNumber', 'Pre-need plan number')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.amountPaid', 'Amount Paid')}</label>
                  <input
                    type="number"
                    value={data.preNeed.paidAmount}
                    onChange={(e) => updatePreNeed('paidAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.paymentStatus', 'Payment Status')}</label>
                  <select
                    value={data.preNeed.paymentStatus}
                    onChange={(e) => updatePreNeed('paymentStatus', e.target.value)}
                    className={inputClass}
                  >
                    <option value="pending">{t('tools.funeralHome.pending2', 'Pending')}</option>
                    <option value="partial">{t('tools.funeralHome.partial', 'Partial')}</option>
                    <option value="paid">{t('tools.funeralHome.paidInFull', 'Paid in Full')}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.funeralHome.preferences', 'Preferences')}</label>
                  <textarea
                    value={data.preNeed.preferences}
                    onChange={(e) => updatePreNeed('preferences', e.target.value)}
                    placeholder={t('tools.funeralHome.servicePreferencesDocumentedInPre', 'Service preferences documented in pre-need plan...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('tools.funeralHome.notes5', 'Notes')}</label>
                  <textarea
                    value={data.preNeed.notes}
                    onChange={(e) => updatePreNeed('notes', e.target.value)}
                    placeholder={t('tools.funeralHome.additionalNotes3', 'Additional notes...')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Death Certificate */}
        {activeTab === 'certificate' && (
          <div className={cardClass}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-500" />
                {t('tools.funeralHome.deathCertificateStatus', 'Death Certificate Status')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.status2', 'Status')}</label>
                  <select
                    value={data.deathCertificate.status}
                    onChange={(e) => updateDeathCertificate('status', e.target.value)}
                    className={inputClass}
                  >
                    <option value="pending">{t('tools.funeralHome.pending3', 'Pending')}</option>
                    <option value="filed">{t('tools.funeralHome.filed', 'Filed')}</option>
                    <option value="issued">{t('tools.funeralHome.issued', 'Issued')}</option>
                    <option value="copies_ordered">{t('tools.funeralHome.copiesOrdered', 'Copies Ordered')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.filedDate', 'Filed Date')}</label>
                  <input
                    type="date"
                    value={data.deathCertificate.filedDate}
                    onChange={(e) => updateDeathCertificate('filedDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.issuedDate', 'Issued Date')}</label>
                  <input
                    type="date"
                    value={data.deathCertificate.issuedDate}
                    onChange={(e) => updateDeathCertificate('issuedDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.copiesRequested', 'Copies Requested')}</label>
                  <input
                    type="number"
                    value={data.deathCertificate.copiesRequested}
                    onChange={(e) => updateDeathCertificate('copiesRequested', parseInt(e.target.value) || 0)}
                    min="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.funeralHome.copiesReceived', 'Copies Received')}</label>
                  <input
                    type="number"
                    value={data.deathCertificate.copiesReceived}
                    onChange={(e) => updateDeathCertificate('copiesReceived', parseInt(e.target.value) || 0)}
                    min="0"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={labelClass}>{t('tools.funeralHome.notes6', 'Notes')}</label>
                  <textarea
                    value={data.deathCertificate.notes}
                    onChange={(e) => updateDeathCertificate('notes', e.target.value)}
                    placeholder={t('tools.funeralHome.additionalNotesAboutDeathCertificate', 'Additional notes about death certificate...')}
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Status indicator */}
              <div className={`mt-4 p-4 rounded-lg ${
                data.deathCertificate.status === 'issued' || data.deathCertificate.status === 'copies_ordered'
                  ? 'bg-green-500/10 border border-green-500/20'
                  : data.deathCertificate.status === 'filed'
                  ? 'bg-blue-500/10 border border-blue-500/20'
                  : 'bg-yellow-500/10 border border-yellow-500/20'
              }`}>
                <div className="flex items-center gap-2">
                  {data.deathCertificate.status === 'issued' || data.deathCertificate.status === 'copies_ordered' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : data.deathCertificate.status === 'filed' ? (
                    <Clock className="w-5 h-5 text-blue-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="font-medium">
                    {data.deathCertificate.status === 'pending' && 'Death certificate not yet filed'}
                    {data.deathCertificate.status === 'filed' && 'Death certificate filed, awaiting issuance'}
                    {data.deathCertificate.status === 'issued' && 'Death certificate issued'}
                    {data.deathCertificate.status === 'copies_ordered' && `${data.deathCertificate.copiesReceived}/${data.deathCertificate.copiesRequested} copies received`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insurance Claims */}
        {activeTab === 'insurance' && (
          <div className={cardClass}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  {t('tools.funeralHome.insuranceClaimTracking', 'Insurance Claim Tracking')}
                </h2>
                <button onClick={addInsuranceClaim} className={buttonPrimary}>
                  <Plus className="w-4 h-4" />
                  {t('tools.funeralHome.addClaim', 'Add Claim')}
                </button>
              </div>

              {data.insuranceClaims.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.funeralHome.noInsuranceClaimsTracked', 'No insurance claims tracked')}</p>
                  <p className="text-sm mt-1">{t('tools.funeralHome.addInsurancePoliciesToTrack', 'Add insurance policies to track claims')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.insuranceClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          claim.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                          claim.status === 'approved' ? 'bg-blue-500/20 text-blue-500' :
                          claim.status === 'denied' ? 'bg-red-500/20 text-red-500' :
                          claim.status === 'submitted' ? 'bg-purple-500/20 text-purple-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </span>
                        <button onClick={() => deleteInsuranceClaim(claim.id)} className={buttonDanger}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.insuranceCompany', 'Insurance Company')}</label>
                          <input
                            type="text"
                            value={claim.companyName}
                            onChange={(e) => updateInsuranceClaim(claim.id, 'companyName', e.target.value)}
                            placeholder={t('tools.funeralHome.companyName', 'Company name')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.policyNumber', 'Policy Number')}</label>
                          <input
                            type="text"
                            value={claim.policyNumber}
                            onChange={(e) => updateInsuranceClaim(claim.id, 'policyNumber', e.target.value)}
                            placeholder={t('tools.funeralHome.policyNumber2', 'Policy number')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.benefitAmount', 'Benefit Amount')}</label>
                          <input
                            type="number"
                            value={claim.benefitAmount}
                            onChange={(e) => updateInsuranceClaim(claim.id, 'benefitAmount', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.claimNumber', 'Claim Number')}</label>
                          <input
                            type="text"
                            value={claim.claimNumber}
                            onChange={(e) => updateInsuranceClaim(claim.id, 'claimNumber', e.target.value)}
                            placeholder={t('tools.funeralHome.claimNumber2', 'Claim number')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.status3', 'Status')}</label>
                          <select
                            value={claim.status}
                            onChange={(e) => updateInsuranceClaim(claim.id, 'status', e.target.value)}
                            className={inputClass}
                          >
                            <option value="pending">{t('tools.funeralHome.pending4', 'Pending')}</option>
                            <option value="submitted">{t('tools.funeralHome.submitted', 'Submitted')}</option>
                            <option value="approved">{t('tools.funeralHome.approved', 'Approved')}</option>
                            <option value="denied">{t('tools.funeralHome.denied', 'Denied')}</option>
                            <option value="paid">{t('tools.funeralHome.paid', 'Paid')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('tools.funeralHome.submittedDate', 'Submitted Date')}</label>
                          <input
                            type="date"
                            value={claim.submittedDate}
                            onChange={(e) => updateInsuranceClaim(claim.id, 'submittedDate', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('tools.funeralHome.notes7', 'Notes')}</label>
                          <input
                            type="text"
                            value={claim.notes}
                            onChange={(e) => updateInsuranceClaim(claim.id, 'notes', e.target.value)}
                            placeholder={t('tools.funeralHome.additionalNotes4', 'Additional notes')}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.funeralHome.totalBenefit', 'Total Benefit')}</div>
                        <div className="text-lg font-bold">
                          ${data.insuranceClaims.reduce((sum, c) => sum + c.benefitAmount, 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.funeralHome.pending5', 'Pending')}</div>
                        <div className="text-lg font-bold text-yellow-500">
                          {data.insuranceClaims.filter(c => c.status === 'pending' || c.status === 'submitted').length}
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.funeralHome.approved2', 'Approved')}</div>
                        <div className="text-lg font-bold text-blue-500">
                          {data.insuranceClaims.filter(c => c.status === 'approved').length}
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.funeralHome.paid2', 'Paid')}</div>
                        <div className="text-lg font-bold text-green-500">
                          ${data.insuranceClaims.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.benefitAmount, 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.funeralHome.aboutFuneralHomeManagementTool', 'About Funeral Home Management Tool')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          This comprehensive funeral planning tool helps funeral directors and families coordinate all aspects of funeral arrangements.
          Track deceased information, schedule services, manage vendors, handle pricing, and monitor insurance claims all in one place.
          All data is automatically saved to your browser's local storage for privacy and persistence.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default FuneralHomeTool;
