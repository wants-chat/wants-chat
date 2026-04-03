'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Sparkles,
  AlertTriangle,
  FileText,
  Tag,
  Plus,
  Trash2,
  Search,
  Edit2,
  Check,
  X,
  Shield,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Heart,
  Info,
  Package,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface SpecialCareToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';

// Types
type FabricType = 'silk' | 'wool' | 'cashmere' | 'leather' | 'suede' | 'lace' | 'velvet' | 'fur' | 'linen' | 'cotton' | 'polyester' | 'other';
type CareCategory = 'delicate' | 'stain_treatment' | 'vintage' | 'designer' | 'wedding' | 'formal' | 'leather_suede' | 'specialty';
type Priority = 'normal' | 'rush' | 'urgent';
type CareStatus = 'pending' | 'in_treatment' | 'drying' | 'finishing' | 'ready' | 'picked_up';

interface SpecialCareItem {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  garmentDescription: string;
  fabricType: FabricType;
  careCategory: CareCategory;
  brand: string;
  color: string;
  condition: string;
  stainTypes: string[];
  careInstructions: string;
  specialNotes: string;
  status: CareStatus;
  priority: Priority;
  receivedDate: string;
  promisedDate: string;
  completedDate: string;
  estimatedPrice: number;
  finalPrice: number;
  technicianNotes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  createdAt: string;
  updatedAt: string;
}

// Constants
const FABRIC_TYPES: { type: FabricType; label: string; icon: React.ReactNode }[] = [
  { type: 'silk', label: 'Silk', icon: <Sparkles className="w-4 h-4" /> },
  { type: 'wool', label: 'Wool', icon: <Heart className="w-4 h-4" /> },
  { type: 'cashmere', label: 'Cashmere', icon: <Heart className="w-4 h-4" /> },
  { type: 'leather', label: 'Leather', icon: <Shield className="w-4 h-4" /> },
  { type: 'suede', label: 'Suede', icon: <Shield className="w-4 h-4" /> },
  { type: 'lace', label: 'Lace', icon: <Sparkles className="w-4 h-4" /> },
  { type: 'velvet', label: 'Velvet', icon: <Heart className="w-4 h-4" /> },
  { type: 'fur', label: 'Fur/Faux Fur', icon: <Shield className="w-4 h-4" /> },
  { type: 'linen', label: 'Linen', icon: <Wind className="w-4 h-4" /> },
  { type: 'cotton', label: 'Cotton', icon: <Wind className="w-4 h-4" /> },
  { type: 'polyester', label: 'Polyester', icon: <Wind className="w-4 h-4" /> },
  { type: 'other', label: 'Other', icon: <Package className="w-4 h-4" /> },
];

const CARE_CATEGORIES: { category: CareCategory; label: string; description: string }[] = [
  { category: 'delicate', label: 'Delicate Fabrics', description: 'Silk, lace, and fine materials' },
  { category: 'stain_treatment', label: 'Stain Treatment', description: 'Difficult stains requiring special attention' },
  { category: 'vintage', label: 'Vintage/Antique', description: 'Heirloom and vintage garments' },
  { category: 'designer', label: 'Designer/Luxury', description: 'High-end designer pieces' },
  { category: 'wedding', label: 'Wedding Attire', description: 'Wedding dresses and formal wear' },
  { category: 'formal', label: 'Formal Wear', description: 'Suits, gowns, tuxedos' },
  { category: 'leather_suede', label: 'Leather & Suede', description: 'Leather and suede care' },
  { category: 'specialty', label: 'Specialty Items', description: 'Unique or unusual items' },
];

const STAIN_TYPES = [
  'Wine', 'Coffee', 'Oil/Grease', 'Ink', 'Blood', 'Grass', 'Mud', 'Makeup',
  'Food', 'Sweat', 'Mold/Mildew', 'Water Marks', 'Unknown', 'Other'
];

const STATUS_OPTIONS: { status: CareStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'bg-blue-500' },
  { status: 'in_treatment', label: 'In Treatment', color: 'bg-yellow-500' },
  { status: 'drying', label: 'Drying', color: 'bg-orange-500' },
  { status: 'finishing', label: 'Finishing', color: 'bg-purple-500' },
  { status: 'ready', label: 'Ready', color: 'bg-green-500' },
  { status: 'picked_up', label: 'Picked Up', color: 'bg-gray-500' },
];

const PRIORITY_OPTIONS: { priority: Priority; label: string; color: string }[] = [
  { priority: 'normal', label: 'Normal', color: 'bg-gray-500' },
  { priority: 'rush', label: 'Rush', color: 'bg-orange-500' },
  { priority: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

// Column config for exports
const CARE_COLUMNS: ColumnConfig[] = [
  { key: 'ticketNumber', header: 'Ticket #', width: 12 },
  { key: 'customerName', header: 'Customer', width: 20 },
  { key: 'garmentDescription', header: 'Garment', width: 25 },
  { key: 'fabricType', header: 'Fabric', width: 12 },
  { key: 'careCategory', header: 'Category', width: 15 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'priority', header: 'Priority', width: 10 },
  { key: 'estimatedPrice', header: 'Est. Price', width: 12, format: (v) => `$${Number(v).toFixed(2)}` },
];

// Generate unique ID
const generateId = () => `care-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateTicketNumber = () => `SC${Date.now().toString().slice(-6)}`;

export function SpecialCareTool({
  uiConfig }: SpecialCareToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isPrefilled = uiConfig?.prefillData && Object.keys(uiConfig.prefillData).length > 0;
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend sync
  const {
    data: careItems,
    addItem: addCareItemToBackend,
    updateItem: updateCareItemBackend,
    deleteItem: deleteCareItemBackend,
    isSynced: careItemsSynced,
    isSaving: careItemsSaving,
    lastSaved: careItemsLastSaved,
    syncError: careItemsSyncError,
    forceSync: forceCareItemsSync,
  } = useToolData<SpecialCareItem>('special-care', [], CARE_COLUMNS);

  // State
  const [activeTab, setActiveTab] = useState<'items' | 'new' | 'instructions'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CareCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CareStatus | 'all'>('all');

  // New care item form state
  const [newItem, setNewItem] = useState<Partial<SpecialCareItem>>({
    customerName: '',
    customerPhone: '',
    garmentDescription: '',
    fabricType: 'silk',
    careCategory: 'delicate',
    brand: '',
    color: '',
    condition: '',
    stainTypes: [],
    careInstructions: '',
    specialNotes: '',
    status: 'pending',
    priority: 'normal',
    receivedDate: new Date().toISOString().split('T')[0],
    promisedDate: '',
    estimatedPrice: 0,
  });

  // Create new care item
  const createCareItem = () => {
    if (!newItem.customerName || !newItem.garmentDescription) {
      setValidationMessage('Please enter customer name and garment description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const item: SpecialCareItem = {
      id: generateId(),
      ticketNumber: generateTicketNumber(),
      customerId: generateId(),
      customerName: newItem.customerName,
      customerPhone: newItem.customerPhone || '',
      garmentDescription: newItem.garmentDescription,
      fabricType: newItem.fabricType || 'silk',
      careCategory: newItem.careCategory || 'delicate',
      brand: newItem.brand || '',
      color: newItem.color || '',
      condition: newItem.condition || '',
      stainTypes: newItem.stainTypes || [],
      careInstructions: newItem.careInstructions || '',
      specialNotes: newItem.specialNotes || '',
      status: 'pending',
      priority: newItem.priority || 'normal',
      receivedDate: newItem.receivedDate || new Date().toISOString().split('T')[0],
      promisedDate: newItem.promisedDate || '',
      completedDate: '',
      estimatedPrice: newItem.estimatedPrice || 0,
      finalPrice: 0,
      technicianNotes: '',
      beforePhotos: [],
      afterPhotos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addCareItemToBackend(item);
    setNewItem({
      customerName: '',
      customerPhone: '',
      garmentDescription: '',
      fabricType: 'silk',
      careCategory: 'delicate',
      brand: '',
      color: '',
      condition: '',
      stainTypes: [],
      careInstructions: '',
      specialNotes: '',
      status: 'pending',
      priority: 'normal',
      receivedDate: new Date().toISOString().split('T')[0],
      promisedDate: '',
      estimatedPrice: 0,
    });
    setActiveTab('items');
  };

  // Update care item status
  const updateItemStatus = (itemId: string, status: CareStatus) => {
    const updates: Partial<SpecialCareItem> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'ready') {
      updates.completedDate = new Date().toISOString().split('T')[0];
    }

    updateCareItemBackend(itemId, updates);
  };

  // Delete care item
  const deleteCareItem = async (itemId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this care item?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteCareItemBackend(itemId);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return careItems.filter(item => {
      const matchesSearch =
        searchTerm === '' ||
        item.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.garmentDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.careCategory === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [careItems, searchTerm, categoryFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: careItems.length,
      pending: careItems.filter(i => i.status === 'pending').length,
      inTreatment: careItems.filter(i => i.status === 'in_treatment').length,
      ready: careItems.filter(i => i.status === 'ready').length,
      rush: careItems.filter(i => i.priority === 'rush' || i.priority === 'urgent').length,
      revenue: careItems.filter(i => i.status === 'picked_up').reduce((sum, i) => sum + (i.finalPrice || i.estimatedPrice), 0),
    };
  }, [careItems]);

  // Care instructions reference data
  const careInstructionsRef = [
    { fabric: 'Silk', instructions: 'Dry clean only. Low heat. No bleach. Press with cool iron on reverse side.' },
    { fabric: 'Wool', instructions: 'Dry clean recommended. Lay flat to dry. Steam instead of ironing.' },
    { fabric: 'Cashmere', instructions: 'Hand wash or dry clean. Never wring. Lay flat to dry away from heat.' },
    { fabric: 'Leather', instructions: 'Professional leather cleaning. Condition after cleaning. Store in breathable bag.' },
    { fabric: 'Suede', instructions: 'Brush regularly. Spot clean with suede cleaner. Protect from moisture.' },
    { fabric: 'Lace', instructions: 'Hand wash in cold water. Never wring or twist. Lay flat to dry.' },
    { fabric: 'Velvet', instructions: 'Steam only, no ironing. Dry clean for deep cleaning. Store hanging.' },
    { fabric: 'Fur', instructions: 'Professional fur cleaning only. Cold storage recommended. Never fold.' },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.specialCare.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.specialCare.specialCareInstructions', 'Special Care Instructions')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.specialCare.manageDelicateFabricsStainTreatments', 'Manage delicate fabrics, stain treatments, and specialty cleaning')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="special-care" toolName="Special Care" />

              <SyncStatus
                isSynced={careItemsSynced}
                isSaving={careItemsSaving}
                lastSaved={careItemsLastSaved}
                syncError={careItemsSyncError}
                onForceSync={forceCareItemsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(careItems, CARE_COLUMNS, { filename: 'special-care-items' })}
                onExportExcel={() => exportToExcel(careItems, CARE_COLUMNS, { filename: 'special-care-items' })}
                onExportJSON={() => exportToJSON(careItems, { filename: 'special-care-items' })}
                onExportPDF={async () => {
                  await exportToPDF(careItems, CARE_COLUMNS, {
                    filename: 'special-care-items',
                    title: 'Special Care Items Report',
                    subtitle: `${careItems.length} items`,
                  });
                }}
                onPrint={() => printData(careItems, CARE_COLUMNS, { title: 'Special Care Items' })}
                onCopyToClipboard={async () => await copyUtil(careItems, CARE_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.specialCare.totalItems', 'Total Items')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{t('tools.specialCare.pending', 'Pending')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>{stats.pending}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{t('tools.specialCare.inTreatment', 'In Treatment')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>{stats.inTreatment}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{t('tools.specialCare.ready', 'Ready')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>{stats.ready}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{t('tools.specialCare.rushUrgent', 'Rush/Urgent')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{stats.rush}</p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>{t('tools.specialCare.revenue', 'Revenue')}</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-teal-300' : 'text-teal-700'}`}>${stats.revenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'items', label: 'Care Items', icon: <Package className="w-4 h-4" /> },
              { id: 'new', label: 'New Item', icon: <Plus className="w-4 h-4" /> },
              { id: 'instructions', label: 'Care Guide', icon: <Info className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* New Care Item Tab */}
        {activeTab === 'new' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.specialCare.createSpecialCareOrder', 'Create Special Care Order')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.customerName', 'Customer Name *')}
                </label>
                <input
                  type="text"
                  value={newItem.customerName || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, customerName: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.specialCare.customerName2', 'Customer name')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.phone', 'Phone')}
                </label>
                <input
                  type="tel"
                  value={newItem.customerPhone || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.garmentDescription', 'Garment Description *')}
                </label>
                <input
                  type="text"
                  value={newItem.garmentDescription || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, garmentDescription: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.specialCare.eGVintageSilkWedding', 'e.g., Vintage silk wedding dress, Cashmere overcoat')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.fabricType', 'Fabric Type')}
                </label>
                <select
                  value={newItem.fabricType || 'silk'}
                  onChange={(e) => setNewItem(prev => ({ ...prev, fabricType: e.target.value as FabricType }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {FABRIC_TYPES.map(f => (
                    <option key={f.type} value={f.type}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.careCategory', 'Care Category')}
                </label>
                <select
                  value={newItem.careCategory || 'delicate'}
                  onChange={(e) => setNewItem(prev => ({ ...prev, careCategory: e.target.value as CareCategory }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {CARE_CATEGORIES.map(c => (
                    <option key={c.category} value={c.category}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.brand', 'Brand')}
                </label>
                <input
                  type="text"
                  value={newItem.brand || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, brand: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.specialCare.eGChanelGucci', 'e.g., Chanel, Gucci')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.color', 'Color')}
                </label>
                <input
                  type="text"
                  value={newItem.color || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={t('tools.specialCare.eGIvoryNavyBlue', 'e.g., Ivory, Navy blue')}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.priority', 'Priority')}
                </label>
                <select
                  value={newItem.priority || 'normal'}
                  onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.priority} value={p.priority}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.estimatedPrice', 'Estimated Price')}
                </label>
                <input
                  type="number"
                  value={newItem.estimatedPrice || 0}
                  onChange={(e) => setNewItem(prev => ({ ...prev, estimatedPrice: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.specialCare.promisedDate', 'Promised Date')}
                </label>
                <input
                  type="date"
                  value={newItem.promisedDate || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, promisedDate: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Stain Types */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.specialCare.stainTypesIfApplicable', 'Stain Types (if applicable)')}
              </label>
              <div className="flex flex-wrap gap-2">
                {STAIN_TYPES.map(stain => (
                  <label
                    key={stain}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer text-sm ${
                      (newItem.stainTypes || []).includes(stain)
                        ? 'bg-red-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(newItem.stainTypes || []).includes(stain)}
                      onChange={(e) => {
                        setNewItem(prev => ({
                          ...prev,
                          stainTypes: e.target.checked
                            ? [...(prev.stainTypes || []), stain]
                            : (prev.stainTypes || []).filter(s => s !== stain),
                        }));
                      }}
                      className="hidden"
                    />
                    {stain}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.specialCare.currentCondition', 'Current Condition')}
              </label>
              <textarea
                value={newItem.condition || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, condition: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows={2}
                placeholder={t('tools.specialCare.describeTheCurrentConditionOf', 'Describe the current condition of the garment...')}
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.specialCare.specialCareInstructions2', 'Special Care Instructions')}
              </label>
              <textarea
                value={newItem.careInstructions || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, careInstructions: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows={2}
                placeholder={t('tools.specialCare.specificCareInstructionsForThis', 'Specific care instructions for this item...')}
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.specialCare.specialNotes', 'Special Notes')}
              </label>
              <textarea
                value={newItem.specialNotes || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, specialNotes: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows={2}
                placeholder={t('tools.specialCare.anyAdditionalNotes', 'Any additional notes...')}
              />
            </div>

            <button
              onClick={createCareItem}
              className="w-full py-3 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0D9488]/90 transition-colors"
            >
              {t('tools.specialCare.createSpecialCareOrder2', 'Create Special Care Order')}
            </button>
          </div>
        )}

        {/* Care Instructions Reference Tab */}
        {activeTab === 'instructions' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.specialCare.fabricCareReferenceGuide', 'Fabric Care Reference Guide')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careInstructionsRef.map(ref => (
                <div
                  key={ref.fabric}
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {ref.fabric}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {ref.instructions}
                  </p>
                </div>
              ))}
            </div>

            {/* Care Symbols */}
            <h3 className={`text-lg font-semibold mt-6 mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.specialCare.commonCareSymbols', 'Common Care Symbols')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Droplets className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.specialCare.wash', 'Wash')}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.specialCare.waterTemperatureMatters', 'Water temperature matters')}</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Thermometer className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.specialCare.heat', 'Heat')}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.specialCare.dryingIroningTemp', 'Drying & ironing temp')}</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Wind className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.specialCare.dryClean', 'Dry Clean')}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.specialCare.professionalCleaning', 'Professional cleaning')}</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Sun className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.specialCare.bleach', 'Bleach')}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.specialCare.bleachingAllowed', 'Bleaching allowed')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Items List Tab */}
        {activeTab === 'items' && (
          <>
            {/* Filters */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('tools.specialCare.searchByTicketCustomerOr', 'Search by ticket, customer, or garment...')}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as CareCategory | 'all')}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.specialCare.allCategories', 'All Categories')}</option>
                    {CARE_CATEGORIES.map(c => (
                      <option key={c.category} value={c.category}>{c.label}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as CareStatus | 'all')}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.specialCare.allStatuses', 'All Statuses')}</option>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.status} value={s.status}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
                  <Sparkles className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.specialCare.noSpecialCareItemsFound', 'No special care items found')}
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                      ? t('tools.specialCare.tryAdjustingYourSearchOr', 'Try adjusting your search or filters') : t('tools.specialCare.createANewSpecialCare', 'Create a new special care order to get started')}
                  </p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          STATUS_OPTIONS.find(s => s.status === item.status)?.color || 'bg-gray-500'
                        }`}>
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              #{item.ticketNumber}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              PRIORITY_OPTIONS.find(p => p.priority === item.priority)?.color || 'bg-gray-500'
                            } text-white`}>
                              {PRIORITY_OPTIONS.find(p => p.priority === item.priority)?.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              STATUS_OPTIONS.find(s => s.status === item.status)?.color || 'bg-gray-500'
                            } text-white`}>
                              {STATUS_OPTIONS.find(s => s.status === item.status)?.label}
                            </span>
                          </div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.garmentDescription}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Customer: {item.customerName} | Fabric: {FABRIC_TYPES.find(f => f.type === item.fabricType)?.label}
                            {item.brand && ` | Brand: ${item.brand}`}
                          </p>
                          {item.stainTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.stainTypes.map(stain => (
                                <span key={stain} className="px-2 py-0.5 bg-red-500/20 text-red-500 rounded text-xs">
                                  {stain}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.careInstructions && (
                            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                              <AlertTriangle className="w-4 h-4 inline mr-1" />
                              {item.careInstructions}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${item.estimatedPrice.toFixed(2)}
                        </p>
                        <select
                          value={item.status}
                          onChange={(e) => updateItemStatus(item.id, e.target.value as CareStatus)}
                          className={`px-3 py-1.5 rounded-lg text-sm border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status.status} value={status.status}>{status.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteCareItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
}

export default SpecialCareTool;
