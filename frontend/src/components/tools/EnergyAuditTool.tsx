'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Leaf,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  Zap,
  Thermometer,
  Droplet,
  Wind,
  Sun,
  Lightbulb,
  ArrowRight,
  BarChart3,
  FileText,
  TrendingDown,
  DollarSign,
  Clock,
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
import { useTheme } from '@/contexts/ThemeContext';

interface EnergyAuditToolProps {
  uiConfig?: UIConfig;
}

type AuditCategory = 'insulation' | 'hvac' | 'lighting' | 'appliances' | 'windows' | 'water' | 'renewable';
type AuditStatus = 'pending' | 'in_progress' | 'completed';
type Priority = 'high' | 'medium' | 'low';
type ItemStatus = 'pass' | 'fail' | 'needs_attention' | 'not_assessed';

interface AuditItem {
  id: string;
  category: AuditCategory;
  name: string;
  description: string;
  status: ItemStatus;
  currentCondition: string;
  recommendation: string;
  estimatedSavings: number;
  estimatedCost: number;
  paybackPeriod: number;
  priority: Priority;
  notes: string;
}

interface EnergyAudit {
  id: string;
  name: string;
  address: string;
  propertyType: string;
  squareFootage: number;
  yearBuilt: number;
  status: AuditStatus;
  items: AuditItem[];
  monthlyEnergyCost: number;
  annualEnergyCost: number;
  auditDate: string;
  auditor: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_CONFIG: Record<AuditCategory, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
}> = {
  insulation: {
    label: 'Insulation',
    icon: Home,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Wall, attic, and floor insulation',
  },
  hvac: {
    label: 'HVAC',
    icon: Wind,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Heating, ventilation, and air conditioning',
  },
  lighting: {
    label: 'Lighting',
    icon: Lightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    description: 'Light fixtures and bulbs',
  },
  appliances: {
    label: 'Appliances',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Major household appliances',
  },
  windows: {
    label: 'Windows & Doors',
    icon: Sun,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    description: 'Windows, doors, and sealing',
  },
  water: {
    label: 'Water Heating',
    icon: Droplet,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    description: 'Water heater and plumbing',
  },
  renewable: {
    label: 'Renewable Energy',
    icon: Leaf,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Solar, wind, and other renewables',
  },
};

const ITEM_STATUS_CONFIG = {
  pass: { label: 'Pass', color: 'text-green-500', bgColor: 'bg-green-500/10', icon: CheckCircle },
  fail: { label: 'Fail', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: XCircle },
  needs_attention: { label: 'Needs Attention', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', icon: AlertTriangle },
  not_assessed: { label: 'Not Assessed', color: 'text-gray-500', bgColor: 'bg-gray-500/10', icon: Clock },
};

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  medium: { label: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  low: { label: 'Low', color: 'text-green-500', bgColor: 'bg-green-500/10' },
};

const DEFAULT_AUDIT_ITEMS: Partial<AuditItem>[] = [
  { category: 'insulation', name: 'Attic Insulation', description: 'Check attic insulation R-value and coverage' },
  { category: 'insulation', name: 'Wall Insulation', description: 'Assess wall cavity insulation' },
  { category: 'hvac', name: 'Furnace/Boiler', description: 'Check heating system efficiency' },
  { category: 'hvac', name: 'Air Conditioner', description: 'Evaluate AC unit SEER rating' },
  { category: 'hvac', name: 'Ductwork', description: 'Inspect for leaks and insulation' },
  { category: 'hvac', name: 'Thermostat', description: 'Check for programmable/smart thermostat' },
  { category: 'lighting', name: 'LED Lighting', description: 'Assess LED bulb usage throughout home' },
  { category: 'lighting', name: 'Natural Lighting', description: 'Evaluate use of natural light' },
  { category: 'appliances', name: 'Refrigerator', description: 'Check age and Energy Star rating' },
  { category: 'appliances', name: 'Washer/Dryer', description: 'Evaluate laundry appliance efficiency' },
  { category: 'windows', name: 'Window Sealing', description: 'Check for air leaks around windows' },
  { category: 'windows', name: 'Door Sealing', description: 'Inspect weather stripping on doors' },
  { category: 'water', name: 'Water Heater', description: 'Check water heater type and efficiency' },
  { category: 'water', name: 'Pipe Insulation', description: 'Assess hot water pipe insulation' },
  { category: 'renewable', name: 'Solar Potential', description: 'Evaluate roof for solar panel suitability' },
];

// Column configurations for exports
const AUDIT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Audit Name', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'propertyType', header: 'Property Type', type: 'string' },
  { key: 'squareFootage', header: 'Sq Ft', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'monthlyEnergyCost', header: 'Monthly Cost', type: 'currency' },
  { key: 'auditDate', header: 'Audit Date', type: 'date' },
];

const ITEM_COLUMNS: ColumnConfig[] = [
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'name', header: 'Item', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'estimatedSavings', header: 'Est. Savings', type: 'currency' },
  { key: 'estimatedCost', header: 'Est. Cost', type: 'currency' },
  { key: 'paybackPeriod', header: 'Payback (years)', type: 'number' },
  { key: 'recommendation', header: 'Recommendation', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const EnergyAuditTool: React.FC<EnergyAuditToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: audits,
    addItem: addAuditToBackend,
    updateItem: updateAuditBackend,
    deleteItem: deleteAuditBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<EnergyAudit>('energy-audits', [], AUDIT_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'audits' | 'recommendations' | 'savings'>('audits');
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<AuditCategory | 'all'>('all');

  // New audit form state
  const [newAudit, setNewAudit] = useState<Partial<EnergyAudit>>({
    name: '',
    address: '',
    propertyType: 'single_family',
    squareFootage: 0,
    yearBuilt: 2000,
    monthlyEnergyCost: 0,
    auditDate: new Date().toISOString().split('T')[0],
    auditor: '',
    notes: '',
  });

  // New item form state
  const [newItem, setNewItem] = useState<Partial<AuditItem>>({
    category: 'insulation',
    name: '',
    description: '',
    status: 'not_assessed',
    currentCondition: '',
    recommendation: '',
    estimatedSavings: 0,
    estimatedCost: 0,
    priority: 'medium',
    notes: '',
  });

  // Get selected audit
  const selectedAudit = useMemo(() => {
    return audits.find(a => a.id === selectedAuditId);
  }, [audits, selectedAuditId]);

  // Create new audit with default items
  const createAudit = () => {
    if (!newAudit.name || !newAudit.address) {
      setValidationMessage('Please enter audit name and address');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const defaultItems: AuditItem[] = DEFAULT_AUDIT_ITEMS.map(item => ({
      id: generateId(),
      category: item.category!,
      name: item.name!,
      description: item.description!,
      status: 'not_assessed' as ItemStatus,
      currentCondition: '',
      recommendation: '',
      estimatedSavings: 0,
      estimatedCost: 0,
      paybackPeriod: 0,
      priority: 'medium' as Priority,
      notes: '',
    }));

    const audit: EnergyAudit = {
      id: generateId(),
      name: newAudit.name || '',
      address: newAudit.address || '',
      propertyType: newAudit.propertyType || 'single_family',
      squareFootage: newAudit.squareFootage || 0,
      yearBuilt: newAudit.yearBuilt || 2000,
      status: 'pending',
      items: defaultItems,
      monthlyEnergyCost: newAudit.monthlyEnergyCost || 0,
      annualEnergyCost: (newAudit.monthlyEnergyCost || 0) * 12,
      auditDate: newAudit.auditDate || new Date().toISOString().split('T')[0],
      auditor: newAudit.auditor || '',
      notes: newAudit.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addAuditToBackend(audit);
    setSelectedAuditId(audit.id);
    setShowAuditForm(false);
    setNewAudit({
      name: '',
      address: '',
      propertyType: 'single_family',
      squareFootage: 0,
      yearBuilt: 2000,
      monthlyEnergyCost: 0,
      auditDate: new Date().toISOString().split('T')[0],
      auditor: '',
      notes: '',
    });
  };

  // Update audit item
  const updateAuditItem = (auditId: string, itemId: string, updates: Partial<AuditItem>) => {
    const audit = audits.find(a => a.id === auditId);
    if (!audit) return;

    const updatedItems = audit.items.map(item =>
      item.id === itemId ? { ...item, ...updates, paybackPeriod: updates.estimatedCost && updates.estimatedSavings
        ? Math.round((updates.estimatedCost / updates.estimatedSavings) * 10) / 10
        : item.paybackPeriod
      } : item
    );

    updateAuditBackend(auditId, { items: updatedItems, updatedAt: new Date().toISOString() });
    setEditingItemId(null);
  };

  // Add custom audit item
  const addAuditItem = () => {
    if (!selectedAuditId || !newItem.name) {
      setValidationMessage('Please enter item name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const audit = audits.find(a => a.id === selectedAuditId);
    if (!audit) return;

    const item: AuditItem = {
      id: generateId(),
      category: newItem.category || 'insulation',
      name: newItem.name || '',
      description: newItem.description || '',
      status: newItem.status || 'not_assessed',
      currentCondition: newItem.currentCondition || '',
      recommendation: newItem.recommendation || '',
      estimatedSavings: newItem.estimatedSavings || 0,
      estimatedCost: newItem.estimatedCost || 0,
      paybackPeriod: newItem.estimatedCost && newItem.estimatedSavings
        ? Math.round((newItem.estimatedCost / newItem.estimatedSavings) * 10) / 10
        : 0,
      priority: newItem.priority || 'medium',
      notes: newItem.notes || '',
    };

    updateAuditBackend(selectedAuditId, {
      items: [...audit.items, item],
      updatedAt: new Date().toISOString(),
    });

    setShowItemForm(false);
    setNewItem({
      category: 'insulation',
      name: '',
      description: '',
      status: 'not_assessed',
      currentCondition: '',
      recommendation: '',
      estimatedSavings: 0,
      estimatedCost: 0,
      priority: 'medium',
      notes: '',
    });
  };

  // Delete audit item
  const deleteAuditItem = async (auditId: string, itemId: string) => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!confirmed) return;

    const audit = audits.find(a => a.id === auditId);
    if (!audit) return;

    updateAuditBackend(auditId, {
      items: audit.items.filter(item => item.id !== itemId),
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete audit
  const deleteAudit = async (auditId: string) => {
    const confirmed = await confirm({
      title: 'Delete Audit',
      message: 'Are you sure you want to delete this audit?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!confirmed) return;
    deleteAuditBackend(auditId);
    if (selectedAuditId === auditId) {
      setSelectedAuditId(null);
    }
  };

  // Complete audit
  const completeAudit = (auditId: string) => {
    updateAuditBackend(auditId, { status: 'completed', updatedAt: new Date().toISOString() });
  };

  // Calculate audit statistics
  const auditStats = useMemo(() => {
    if (!selectedAudit) return null;

    const items = selectedAudit.items;
    const assessed = items.filter(i => i.status !== 'not_assessed');
    const passed = items.filter(i => i.status === 'pass').length;
    const failed = items.filter(i => i.status === 'fail').length;
    const needsAttention = items.filter(i => i.status === 'needs_attention').length;

    const totalSavings = items.reduce((acc, i) => acc + (i.estimatedSavings || 0), 0);
    const totalCost = items.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
    const avgPayback = items.filter(i => i.paybackPeriod > 0).length > 0
      ? items.reduce((acc, i) => acc + i.paybackPeriod, 0) / items.filter(i => i.paybackPeriod > 0).length
      : 0;

    const highPriority = items.filter(i => i.priority === 'high' && i.status !== 'pass').length;

    return {
      total: items.length,
      assessed: assessed.length,
      passed,
      failed,
      needsAttention,
      totalSavings,
      totalCost,
      avgPayback: Math.round(avgPayback * 10) / 10,
      highPriority,
      completionRate: items.length > 0 ? Math.round((assessed.length / items.length) * 100) : 0,
    };
  }, [selectedAudit]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!selectedAudit) return [];
    let items = [...selectedAudit.items];

    if (filterCategory !== 'all') {
      items = items.filter(i => i.category === filterCategory);
    }

    return items;
  }, [selectedAudit, filterCategory]);

  // Recommendations sorted by priority and savings
  const recommendations = useMemo(() => {
    if (!selectedAudit) return [];

    return selectedAudit.items
      .filter(i => i.status !== 'pass' && i.recommendation)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.estimatedSavings - a.estimatedSavings;
      });
  }, [selectedAudit]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.energyAudit.energyAuditTool', 'Energy Audit Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.energyAudit.comprehensiveHomeEnergyEfficiencyAssessment', 'Comprehensive home energy efficiency assessment')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="energy-audit" toolName="Energy Audit" />

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
              {selectedAudit && (
                <ExportDropdown
                  onExportCSV={() => exportToCSV(selectedAudit.items, ITEM_COLUMNS, 'energy-audit-items')}
                  onExportExcel={() => exportToExcel(selectedAudit.items, ITEM_COLUMNS, 'energy-audit-items')}
                  onExportJSON={() => exportToJSON(selectedAudit, 'energy-audit')}
                  onExportPDF={() => exportToPDF(selectedAudit.items, ITEM_COLUMNS, `Energy Audit - ${selectedAudit.name}`)}
                  onCopy={() => copyUtil(selectedAudit.items, ITEM_COLUMNS)}
                  onPrint={() => printData(selectedAudit.items, ITEM_COLUMNS, `Energy Audit - ${selectedAudit.name}`)}
                  theme={theme}
                />
              )}
            </div>
          </div>

          {/* Tabs */}
          {selectedAudit && (
            <div className="flex gap-2">
              {['audits', 'recommendations', 'savings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audit Selection / Creation */}
        {!selectedAudit && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.energyAudit.energyAudits', 'Energy Audits')}
              </h2>
              <button
                onClick={() => setShowAuditForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.energyAudit.newAudit', 'New Audit')}
              </button>
            </div>

            {/* New Audit Form */}
            {showAuditForm && (
              <div className={`mb-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.energyAudit.createNewEnergyAudit', 'Create New Energy Audit')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.energyAudit.auditName', 'Audit Name')}
                    value={newAudit.name}
                    onChange={(e) => setNewAudit({ ...newAudit, name: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.energyAudit.propertyAddress', 'Property Address')}
                    value={newAudit.address}
                    onChange={(e) => setNewAudit({ ...newAudit, address: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <select
                    value={newAudit.propertyType}
                    onChange={(e) => setNewAudit({ ...newAudit, propertyType: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="single_family">{t('tools.energyAudit.singleFamily', 'Single Family')}</option>
                    <option value="multi_family">{t('tools.energyAudit.multiFamily', 'Multi-Family')}</option>
                    <option value="condo">{t('tools.energyAudit.condoApartment', 'Condo/Apartment')}</option>
                    <option value="townhouse">{t('tools.energyAudit.townhouse', 'Townhouse')}</option>
                    <option value="commercial">{t('tools.energyAudit.commercial', 'Commercial')}</option>
                  </select>
                  <input
                    type="number"
                    placeholder={t('tools.energyAudit.squareFootage', 'Square Footage')}
                    value={newAudit.squareFootage || ''}
                    onChange={(e) => setNewAudit({ ...newAudit, squareFootage: parseInt(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.energyAudit.yearBuilt', 'Year Built')}
                    value={newAudit.yearBuilt || ''}
                    onChange={(e) => setNewAudit({ ...newAudit, yearBuilt: parseInt(e.target.value) || 2000 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.energyAudit.monthlyEnergyCost', 'Monthly Energy Cost ($)')}
                    value={newAudit.monthlyEnergyCost || ''}
                    onChange={(e) => setNewAudit({ ...newAudit, monthlyEnergyCost: parseFloat(e.target.value) || 0 })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="date"
                    value={newAudit.auditDate}
                    onChange={(e) => setNewAudit({ ...newAudit, auditDate: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.energyAudit.auditorName', 'Auditor Name')}
                    value={newAudit.auditor}
                    onChange={(e) => setNewAudit({ ...newAudit, auditor: e.target.value })}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowAuditForm(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.energyAudit.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={createAudit}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.energyAudit.createAudit', 'Create Audit')}
                  </button>
                </div>
              </div>
            )}

            {/* Audits List */}
            {audits.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Leaf className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.energyAudit.noEnergyAuditsYet', 'No energy audits yet')}</p>
                <p className="text-sm mt-2">{t('tools.energyAudit.createANewAuditTo', 'Create a new audit to assess energy efficiency')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    onClick={() => setSelectedAuditId(audit.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      theme === 'dark'
                        ? t('tools.energyAudit.bgGray700BorderGray', 'bg-gray-700 border-gray-600 hover:border-[#0D9488]') : t('tools.energyAudit.bgGray50BorderGray', 'bg-gray-50 border-gray-200 hover:border-[#0D9488]')
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {audit.name}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {audit.address}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        audit.status === 'completed'
                          ? 'bg-green-500/10 text-green-500'
                          : audit.status === 'in_progress'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {audit.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <p>{audit.squareFootage.toLocaleString()} sq ft</p>
                      <p>Monthly cost: {formatCurrency(audit.monthlyEnergyCost)}</p>
                      <p>{formatDate(audit.auditDate)}</p>
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAudit(audit.id); }}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Audit View */}
        {selectedAudit && (
          <>
            {/* Audit Header */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAuditId(null)}
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {t('tools.energyAudit.allAudits', 'All Audits')}
                    </button>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedAudit.name}
                    </span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedAudit.address} | {selectedAudit.squareFootage.toLocaleString()} sq ft
                  </p>
                </div>
                {selectedAudit.status !== 'completed' && (
                  <button
                    onClick={() => completeAudit(selectedAudit.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.energyAudit.completeAudit', 'Complete Audit')}
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            {auditStats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.energyAudit.completion', 'Completion')}</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {auditStats.completionRate}%
                  </p>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.energyAudit.itemsPassed', 'Items Passed')}</p>
                  <p className={`text-2xl font-bold text-green-500`}>{auditStats.passed}</p>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.energyAudit.needsAttention', 'Needs Attention')}</p>
                  <p className={`text-2xl font-bold text-yellow-500`}>{auditStats.needsAttention}</p>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.energyAudit.potentialSavings', 'Potential Savings')}</p>
                  <p className={`text-2xl font-bold text-green-500`}>{formatCurrency(auditStats.totalSavings)}/yr</p>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.energyAudit.highPriority', 'High Priority')}</p>
                  <p className={`text-2xl font-bold text-red-500`}>{auditStats.highPriority}</p>
                </div>
              </div>
            )}

            {/* Audit Items Tab */}
            {activeTab === 'audits' && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as AuditCategory | 'all')}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">{t('tools.energyAudit.allCategories', 'All Categories')}</option>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowItemForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.energyAudit.addItem', 'Add Item')}
                  </button>
                </div>

                {/* Add Item Form */}
                {showItemForm && (
                  <div className={`mb-6 p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.energyAudit.addCustomAuditItem', 'Add Custom Audit Item')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value as AuditCategory })}
                        className={`px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder={t('tools.energyAudit.itemName', 'Item Name')}
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className={`px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder={t('tools.energyAudit.description', 'Description')}
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        className={`px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setShowItemForm(false)}
                        className={`px-4 py-2 rounded-lg ${
                          theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t('tools.energyAudit.cancel2', 'Cancel')}
                      </button>
                      <button
                        onClick={addAuditItem}
                        className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                      >
                        {t('tools.energyAudit.addItem2', 'Add Item')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Items by Category */}
                {Object.entries(CATEGORY_CONFIG).map(([categoryKey, categoryConfig]) => {
                  const categoryItems = filteredItems.filter(i => i.category === categoryKey);
                  if (categoryItems.length === 0) return null;

                  const CategoryIcon = categoryConfig.icon;

                  return (
                    <div key={categoryKey} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`p-2 rounded-lg ${categoryConfig.bgColor}`}>
                          <CategoryIcon className={`w-4 h-4 ${categoryConfig.color}`} />
                        </div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {categoryConfig.label}
                        </h3>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          ({categoryItems.length} items)
                        </span>
                      </div>

                      <div className="space-y-2">
                        {categoryItems.map((item) => {
                          const statusConfig = ITEM_STATUS_CONFIG[item.status];
                          const priorityConfig = PRIORITY_CONFIG[item.priority];
                          const StatusIcon = statusConfig.icon;

                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {item.name}
                                    </h4>
                                    <select
                                      value={item.status}
                                      onChange={(e) => updateAuditItem(selectedAudit.id, item.id, { status: e.target.value as ItemStatus })}
                                      className={`px-2 py-0.5 text-xs rounded border ${statusConfig.bgColor} ${statusConfig.color} ${
                                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                                      }`}
                                    >
                                      <option value="not_assessed">{t('tools.energyAudit.notAssessed', 'Not Assessed')}</option>
                                      <option value="pass">{t('tools.energyAudit.pass', 'Pass')}</option>
                                      <option value="needs_attention">{t('tools.energyAudit.needsAttention2', 'Needs Attention')}</option>
                                      <option value="fail">{t('tools.energyAudit.fail', 'Fail')}</option>
                                    </select>
                                    <select
                                      value={item.priority}
                                      onChange={(e) => updateAuditItem(selectedAudit.id, item.id, { priority: e.target.value as Priority })}
                                      className={`px-2 py-0.5 text-xs rounded border ${priorityConfig.bgColor} ${priorityConfig.color} ${
                                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                                      }`}
                                    >
                                      <option value="low">{t('tools.energyAudit.low', 'Low')}</option>
                                      <option value="medium">{t('tools.energyAudit.medium', 'Medium')}</option>
                                      <option value="high">{t('tools.energyAudit.high', 'High')}</option>
                                    </select>
                                  </div>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {item.description}
                                  </p>

                                  {/* Editable fields */}
                                  <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <input
                                      type="text"
                                      placeholder={t('tools.energyAudit.currentCondition', 'Current condition...')}
                                      value={item.currentCondition}
                                      onChange={(e) => updateAuditItem(selectedAudit.id, item.id, { currentCondition: e.target.value })}
                                      className={`px-2 py-1 text-sm rounded border ${
                                        theme === 'dark'
                                          ? 'bg-gray-600 border-gray-500 text-white'
                                          : 'bg-white border-gray-300 text-gray-900'
                                      }`}
                                    />
                                    <input
                                      type="text"
                                      placeholder={t('tools.energyAudit.recommendation', 'Recommendation...')}
                                      value={item.recommendation}
                                      onChange={(e) => updateAuditItem(selectedAudit.id, item.id, { recommendation: e.target.value })}
                                      className={`px-2 py-1 text-sm rounded border ${
                                        theme === 'dark'
                                          ? 'bg-gray-600 border-gray-500 text-white'
                                          : 'bg-white border-gray-300 text-gray-900'
                                      }`}
                                    />
                                    <input
                                      type="number"
                                      placeholder={t('tools.energyAudit.estSavingsYr', 'Est. savings/yr')}
                                      value={item.estimatedSavings || ''}
                                      onChange={(e) => updateAuditItem(selectedAudit.id, item.id, { estimatedSavings: parseFloat(e.target.value) || 0, estimatedCost: item.estimatedCost })}
                                      className={`px-2 py-1 text-sm rounded border ${
                                        theme === 'dark'
                                          ? 'bg-gray-600 border-gray-500 text-white'
                                          : 'bg-white border-gray-300 text-gray-900'
                                      }`}
                                    />
                                    <input
                                      type="number"
                                      placeholder={t('tools.energyAudit.estCost', 'Est. cost')}
                                      value={item.estimatedCost || ''}
                                      onChange={(e) => updateAuditItem(selectedAudit.id, item.id, { estimatedCost: parseFloat(e.target.value) || 0, estimatedSavings: item.estimatedSavings })}
                                      className={`px-2 py-1 text-sm rounded border ${
                                        theme === 'dark'
                                          ? 'bg-gray-600 border-gray-500 text-white'
                                          : 'bg-white border-gray-300 text-gray-900'
                                      }`}
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteAuditItem(selectedAudit.id, item.id)}
                                  className="p-1 text-red-500 hover:bg-red-500/10 rounded ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.energyAudit.improvementRecommendations', 'Improvement Recommendations')}
                </h2>

                {recommendations.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.energyAudit.noRecommendationsYet', 'No recommendations yet')}</p>
                    <p className="text-sm mt-2">{t('tools.energyAudit.completeTheAuditAndAdd', 'Complete the audit and add recommendations for items')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((item, index) => {
                      const categoryConfig = CATEGORY_CONFIG[item.category];
                      const priorityConfig = PRIORITY_CONFIG[item.priority];
                      const CategoryIcon = categoryConfig.icon;

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              priorityConfig.bgColor
                            }`}>
                              <span className={`font-bold ${priorityConfig.color}`}>{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CategoryIcon className={`w-4 h-4 ${categoryConfig.color}`} />
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {item.name}
                                </h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                                  {priorityConfig.label} Priority
                                </span>
                              </div>
                              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.recommendation}
                              </p>
                              <div className="flex items-center gap-6 text-sm">
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <TrendingDown className="w-4 h-4 text-green-500" />
                                  Save {formatCurrency(item.estimatedSavings)}/yr
                                </span>
                                <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <DollarSign className="w-4 h-4" />
                                  Cost: {formatCurrency(item.estimatedCost)}
                                </span>
                                {item.paybackPeriod > 0 && (
                                  <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Clock className="w-4 h-4" />
                                    Payback: {item.paybackPeriod} years
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Savings Tab */}
            {activeTab === 'savings' && auditStats && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.energyAudit.savingsAnalysis', 'Savings Analysis')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current vs Projected */}
                  <div className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.energyAudit.annualEnergyCosts', 'Annual Energy Costs')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.energyAudit.current', 'Current')}</span>
                        <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(selectedAudit.annualEnergyCost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.energyAudit.potentialSavings2', 'Potential Savings')}</span>
                        <span className="text-xl font-bold text-green-500">
                          -{formatCurrency(auditStats.totalSavings)}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.energyAudit.projected', 'Projected')}
                          </span>
                          <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(Math.max(0, selectedAudit.annualEnergyCost - auditStats.totalSavings))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Summary */}
                  <div className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.energyAudit.investmentSummary', 'Investment Summary')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.energyAudit.totalInvestment', 'Total Investment')}</span>
                        <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(auditStats.totalCost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.energyAudit.annualSavings', 'Annual Savings')}</span>
                        <span className="text-xl font-bold text-green-500">
                          {formatCurrency(auditStats.totalSavings)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.energyAudit.avgPaybackPeriod', 'Avg. Payback Period')}</span>
                        <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {auditStats.avgPayback} years
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.energyAudit.5YearNetSavings', '5-Year Net Savings')}
                          </span>
                          <span className={`text-2xl font-bold ${
                            (auditStats.totalSavings * 5) - auditStats.totalCost > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {formatCurrency((auditStats.totalSavings * 5) - auditStats.totalCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Savings Potential Message */}
                {auditStats.totalSavings > 0 && (
                  <div className={`mt-6 p-4 rounded-lg border-l-4 border-green-500 ${
                    theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <TrendingDown className="w-6 h-6 text-green-500" />
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.energyAudit.greatSavingsPotential', 'Great Savings Potential!')}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Implementing all recommendations could reduce your energy costs by{' '}
                          {Math.round((auditStats.totalSavings / selectedAudit.annualEnergyCost) * 100)}% annually.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
};

export default EnergyAuditTool;
