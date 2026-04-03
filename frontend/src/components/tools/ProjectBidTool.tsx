'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  DollarSign,
  Calendar,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
  Target,
  Award,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { useTheme } from '@/contexts/ThemeContext';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface ProjectBidToolProps {
  uiConfig?: UIConfig;
}

// Types
type BidStatus = 'draft' | 'submitted' | 'won' | 'lost' | 'pending' | 'expired';
type ProjectType = 'residential' | 'commercial' | 'industrial' | 'infrastructure' | 'renovation';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  category: string;
}

interface ProjectBid {
  id: string;
  projectName: string;
  projectType: ProjectType;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  startDate: string;
  endDate: string;
  bidDueDate: string;
  lineItems: LineItem[];
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  subcontractorCost: number;
  overhead: number;
  profit: number;
  contingency: number;
  totalBid: number;
  status: BidStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const PROJECT_TYPES: { type: ProjectType; label: string }[] = [
  { type: 'residential', label: 'Residential' },
  { type: 'commercial', label: 'Commercial' },
  { type: 'industrial', label: 'Industrial' },
  { type: 'infrastructure', label: 'Infrastructure' },
  { type: 'renovation', label: 'Renovation' },
];

const BID_STATUSES: { status: BidStatus; label: string; color: string }[] = [
  { status: 'draft', label: 'Draft', color: 'gray' },
  { status: 'submitted', label: 'Submitted', color: 'blue' },
  { status: 'pending', label: 'Pending', color: 'yellow' },
  { status: 'won', label: 'Won', color: 'green' },
  { status: 'lost', label: 'Lost', color: 'red' },
  { status: 'expired', label: 'Expired', color: 'gray' },
];

const LINE_ITEM_CATEGORIES = [
  'Labor',
  'Materials',
  'Equipment',
  'Subcontractor',
  'Permits',
  'Overhead',
  'Other',
];

const UNITS = ['ea', 'sf', 'lf', 'cy', 'hr', 'day', 'lot', 'ls', 'ton', 'gal'];

// Column configuration for exports
const BID_COLUMNS: ColumnConfig[] = [
  { key: 'projectName', header: 'Project Name', type: 'string' },
  { key: 'projectType', header: 'Type', type: 'string' },
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'totalBid', header: 'Total Bid', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'bidDueDate', header: 'Due Date', type: 'date' },
  { key: 'createdAt', header: 'Created', type: 'date' },
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
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: BidStatus, theme: string) => {
  const colors = {
    draft: theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
    submitted: theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700',
    pending: theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
    won: theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700',
    lost: theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700',
    expired: theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600',
  };
  return colors[status];
};

// Main Component
export const ProjectBidTool: React.FC<ProjectBidToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: bids,
    addItem: addBidToBackend,
    updateItem: updateBidBackend,
    deleteItem: deleteBidBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
  } = useToolData<ProjectBid>('project-bids', [], BID_COLUMNS);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'analytics'>('list');
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedBidId, setExpandedBidId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<ProjectBid>>({
    projectName: '',
    projectType: 'residential',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectAddress: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    startDate: '',
    endDate: '',
    bidDueDate: '',
    lineItems: [],
    laborCost: 0,
    materialCost: 0,
    equipmentCost: 0,
    subcontractorCost: 0,
    overhead: 10,
    profit: 15,
    contingency: 5,
    totalBid: 0,
    status: 'draft',
    notes: '',
  });

  const [newLineItem, setNewLineItem] = useState<Partial<LineItem>>({
    description: '',
    quantity: 1,
    unit: 'ea',
    unitCost: 0,
    category: 'Materials',
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      setFormData((prev) => ({
        ...prev,
        projectName: params.projectName || params.project || '',
        clientName: params.clientName || params.client || '',
        clientEmail: params.email || '',
        clientPhone: params.phone || '',
        projectAddress: params.address || '',
        city: params.city || '',
        state: params.state || '',
        description: params.description || '',
      }));
      setActiveTab('create');
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  // Calculate totals when line items change
  const calculateTotals = (items: LineItem[]) => {
    let labor = 0, materials = 0, equipment = 0, subcontractor = 0;

    items.forEach((item) => {
      switch (item.category) {
        case 'Labor':
          labor += item.totalCost;
          break;
        case 'Materials':
          materials += item.totalCost;
          break;
        case 'Equipment':
          equipment += item.totalCost;
          break;
        case 'Subcontractor':
          subcontractor += item.totalCost;
          break;
        default:
          materials += item.totalCost;
      }
    });

    const subtotal = labor + materials + equipment + subcontractor;
    const overheadAmount = subtotal * ((formData.overhead || 0) / 100);
    const profitAmount = subtotal * ((formData.profit || 0) / 100);
    const contingencyAmount = subtotal * ((formData.contingency || 0) / 100);
    const total = subtotal + overheadAmount + profitAmount + contingencyAmount;

    setFormData((prev) => ({
      ...prev,
      laborCost: labor,
      materialCost: materials,
      equipmentCost: equipment,
      subcontractorCost: subcontractor,
      totalBid: total,
    }));
  };

  // Add line item
  const addLineItem = () => {
    if (!newLineItem.description || !newLineItem.unitCost) return;

    const item: LineItem = {
      id: generateId(),
      description: newLineItem.description || '',
      quantity: newLineItem.quantity || 1,
      unit: newLineItem.unit || 'ea',
      unitCost: newLineItem.unitCost || 0,
      totalCost: (newLineItem.quantity || 1) * (newLineItem.unitCost || 0),
      category: newLineItem.category || 'Materials',
    };

    const updatedItems = [...(formData.lineItems || []), item];
    setFormData((prev) => ({ ...prev, lineItems: updatedItems }));
    calculateTotals(updatedItems);
    setNewLineItem({
      description: '',
      quantity: 1,
      unit: 'ea',
      unitCost: 0,
      category: 'Materials',
    });
  };

  // Remove line item
  const removeLineItem = (itemId: string) => {
    const updatedItems = (formData.lineItems || []).filter((item) => item.id !== itemId);
    setFormData((prev) => ({ ...prev, lineItems: updatedItems }));
    calculateTotals(updatedItems);
  };

  // Save bid
  const saveBid = () => {
    if (!formData.projectName || !formData.clientName) {
      setValidationMessage('Please fill in required fields (Project Name, Client Name)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const bid: ProjectBid = {
      id: selectedBidId || generateId(),
      projectName: formData.projectName || '',
      projectType: formData.projectType || 'residential',
      clientName: formData.clientName || '',
      clientEmail: formData.clientEmail || '',
      clientPhone: formData.clientPhone || '',
      projectAddress: formData.projectAddress || '',
      city: formData.city || '',
      state: formData.state || '',
      zipCode: formData.zipCode || '',
      description: formData.description || '',
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      bidDueDate: formData.bidDueDate || '',
      lineItems: formData.lineItems || [],
      laborCost: formData.laborCost || 0,
      materialCost: formData.materialCost || 0,
      equipmentCost: formData.equipmentCost || 0,
      subcontractorCost: formData.subcontractorCost || 0,
      overhead: formData.overhead || 10,
      profit: formData.profit || 15,
      contingency: formData.contingency || 5,
      totalBid: formData.totalBid || 0,
      status: formData.status || 'draft',
      notes: formData.notes || '',
      createdAt: selectedBidId ? bids.find((b) => b.id === selectedBidId)?.createdAt || now : now,
      updatedAt: now,
    };

    if (selectedBidId) {
      updateBidBackend(selectedBidId, bid);
    } else {
      addBidToBackend(bid);
    }

    resetForm();
    setActiveTab('list');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      projectName: '',
      projectType: 'residential',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      projectAddress: '',
      city: '',
      state: '',
      zipCode: '',
      description: '',
      startDate: '',
      endDate: '',
      bidDueDate: '',
      lineItems: [],
      laborCost: 0,
      materialCost: 0,
      equipmentCost: 0,
      subcontractorCost: 0,
      overhead: 10,
      profit: 15,
      contingency: 5,
      totalBid: 0,
      status: 'draft',
      notes: '',
    });
    setSelectedBidId(null);
    setIsPrefilled(false);
  };

  // Edit bid
  const editBid = (bid: ProjectBid) => {
    setFormData(bid);
    setSelectedBidId(bid.id);
    setActiveTab('create');
  };

  // Delete bid
  const deleteBid = async (bidId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this bid?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteBidBackend(bidId);
  };

  // Update bid status
  const updateBidStatus = (bidId: string, status: BidStatus) => {
    updateBidBackend(bidId, { status, updatedAt: new Date().toISOString() });
  };

  // Filtered bids
  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      const matchesSearch =
        searchTerm === '' ||
        bid.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || bid.status === filterStatus;
      const matchesType = filterType === 'all' || bid.projectType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bids, searchTerm, filterStatus, filterType]);

  // Analytics
  const analytics = useMemo(() => {
    const totalBids = bids.length;
    const wonBids = bids.filter((b) => b.status === 'won').length;
    const pendingBids = bids.filter((b) => b.status === 'pending' || b.status === 'submitted').length;
    const totalValue = bids.reduce((sum, b) => sum + b.totalBid, 0);
    const wonValue = bids.filter((b) => b.status === 'won').reduce((sum, b) => sum + b.totalBid, 0);
    const winRate = totalBids > 0 ? ((wonBids / totalBids) * 100).toFixed(1) : '0';

    return {
      totalBids,
      wonBids,
      pendingBids,
      totalValue,
      wonValue,
      winRate,
    };
  }, [bids]);

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const cardBorder = isDark ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';

  return (
    <>
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.projectBid.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${cardBg} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>
                  {t('tools.projectBid.projectBidTool', 'Project Bid Tool')}
                </h1>
                <p className={`text-sm ${textSecondary}`}>
                  {t('tools.projectBid.createManageAndTrackConstruction', 'Create, manage, and track construction project bids')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="project-bid" toolName="Project Bid" />

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
              <ExportDropdown
                onExportCSV={() => exportCSV()}
                onExportExcel={() => exportExcel()}
                onExportJSON={() => exportJSON()}
                onExportPDF={() => exportPDF({ title: 'Project Bids' })}
                onCopyToClipboard={() => copyToClipboard()}
                onPrint={() => print('Project Bids')}
                theme={theme}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-700 pb-3">
            {[
              { id: 'list', label: 'All Bids', icon: FileText },
              { id: 'create', label: selectedBidId ? t('tools.projectBid.editBid', 'Edit Bid') : t('tools.projectBid.newBid', 'New Bid'), icon: Plus },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  if (id === 'create' && !selectedBidId) resetForm();
                  setActiveTab(id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-[#0D9488] text-white'
                    : `${textSecondary} hover:bg-gray-700`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <input
                    type="text"
                    placeholder={t('tools.projectBid.searchProjectsOrClients', 'Search projects or clients...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
              >
                <option value="all">{t('tools.projectBid.allStatuses', 'All Statuses')}</option>
                {BID_STATUSES.map((s) => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
              >
                <option value="all">{t('tools.projectBid.allTypes', 'All Types')}</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Bids List */}
            <div className="space-y-4">
              {filteredBids.length === 0 ? (
                <div className={`text-center py-12 ${textSecondary}`}>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tools.projectBid.noBidsFoundCreateYour', 'No bids found. Create your first bid to get started.')}</p>
                </div>
              ) : (
                filteredBids.map((bid) => (
                  <div
                    key={bid.id}
                    className={`border ${cardBorder} rounded-lg overflow-hidden`}
                  >
                    <div
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
                      onClick={() => setExpandedBidId(expandedBidId === bid.id ? null : bid.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {expandedBidId === bid.id ? (
                              <ChevronUp className={`w-5 h-5 ${textSecondary}`} />
                            ) : (
                              <ChevronDown className={`w-5 h-5 ${textSecondary}`} />
                            )}
                            <Building2 className={`w-5 h-5 ${textSecondary}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${textPrimary}`}>{bid.projectName}</h3>
                            <p className={`text-sm ${textSecondary}`}>
                              {bid.clientName} | {bid.city}, {bid.state}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-lg font-bold ${textPrimary}`}>
                            {formatCurrency(bid.totalBid)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status, theme)}`}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedBidId === bid.id && (
                      <div className={`border-t ${cardBorder} p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.projectBid.projectType', 'Project Type')}</p>
                            <p className={`font-medium ${textPrimary}`}>
                              {PROJECT_TYPES.find((t) => t.type === bid.projectType)?.label}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.projectBid.bidDueDate', 'Bid Due Date')}</p>
                            <p className={`font-medium ${textPrimary}`}>{formatDate(bid.bidDueDate)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.projectBid.startDate', 'Start Date')}</p>
                            <p className={`font-medium ${textPrimary}`}>{formatDate(bid.startDate)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.projectBid.endDate', 'End Date')}</p>
                            <p className={`font-medium ${textPrimary}`}>{formatDate(bid.endDate)}</p>
                          </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.projectBid.labor', 'Labor')}</p>
                            <p className={`font-semibold ${textPrimary}`}>{formatCurrency(bid.laborCost)}</p>
                          </div>
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.projectBid.materials', 'Materials')}</p>
                            <p className={`font-semibold ${textPrimary}`}>{formatCurrency(bid.materialCost)}</p>
                          </div>
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.projectBid.equipment', 'Equipment')}</p>
                            <p className={`font-semibold ${textPrimary}`}>{formatCurrency(bid.equipmentCost)}</p>
                          </div>
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                            <p className={`text-xs ${textSecondary}`}>{t('tools.projectBid.subcontractors', 'Subcontractors')}</p>
                            <p className={`font-semibold ${textPrimary}`}>{formatCurrency(bid.subcontractorCost)}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => editBid(bid)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                            {t('tools.projectBid.edit', 'Edit')}
                          </button>
                          <select
                            value={bid.status}
                            onChange={(e) => updateBidStatus(bid.id, e.target.value as BidStatus)}
                            className={`px-3 py-1.5 rounded-lg border text-sm ${inputBg} ${textPrimary}`}
                          >
                            {BID_STATUSES.map((s) => (
                              <option key={s.status} value={s.status}>{s.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteBid(bid.id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Tab */}
        {activeTab === 'create' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>
              {selectedBidId ? t('tools.projectBid.editBid2', 'Edit Bid') : t('tools.projectBid.createNewBid', 'Create New Bid')}
            </h2>

            {/* Project Information */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.projectBid.projectInformation', 'Project Information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.projectName', 'Project Name *')}</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, projectName: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    placeholder={t('tools.projectBid.enterProjectName', 'Enter project name')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.projectType2', 'Project Type')}</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, projectType: e.target.value as ProjectType }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.description', 'Description')}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary} h-24`}
                    placeholder={t('tools.projectBid.projectDescription', 'Project description...')}
                  />
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.projectBid.clientInformation', 'Client Information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.clientName', 'Client Name *')}</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    placeholder={t('tools.projectBid.clientName2', 'Client name')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.email', 'Email')}</label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    placeholder={t('tools.projectBid.emailExampleCom', 'email@example.com')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.phone', 'Phone')}</label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, clientPhone: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>
            </div>

            {/* Project Location */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.projectBid.projectLocation', 'Project Location')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.address', 'Address')}</label>
                  <input
                    type="text"
                    value={formData.projectAddress}
                    onChange={(e) => setFormData((prev) => ({ ...prev, projectAddress: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    placeholder={t('tools.projectBid.streetAddress', 'Street address')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.city', 'City')}</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.state', 'State')}</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.zip', 'ZIP')}</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.projectBid.projectDates', 'Project Dates')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.bidDueDate2', 'Bid Due Date')}</label>
                  <input
                    type="date"
                    value={formData.bidDueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bidDueDate: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.projectStart', 'Project Start')}</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.projectEnd', 'Project End')}</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.projectBid.lineItems', 'Line Items')}</h3>

              {/* Add Line Item Form */}
              <div className={`grid grid-cols-1 md:grid-cols-6 gap-2 mb-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder={t('tools.projectBid.description3', 'Description')}
                    value={newLineItem.description}
                    onChange={(e) => setNewLineItem((prev) => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                  />
                </div>
                <div>
                  <select
                    value={newLineItem.category}
                    onChange={(e) => setNewLineItem((prev) => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                  >
                    {LINE_ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={t('tools.projectBid.qty2', 'Qty')}
                    value={newLineItem.quantity}
                    onChange={(e) => setNewLineItem((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                  />
                  <select
                    value={newLineItem.unit}
                    onChange={(e) => setNewLineItem((prev) => ({ ...prev, unit: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder={t('tools.projectBid.unitCost2', 'Unit Cost')}
                    value={newLineItem.unitCost || ''}
                    onChange={(e) => setNewLineItem((prev) => ({ ...prev, unitCost: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} text-sm`}
                  />
                </div>
                <div>
                  <button
                    onClick={addLineItem}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C72] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.projectBid.add', 'Add')}
                  </button>
                </div>
              </div>

              {/* Line Items Table */}
              {(formData.lineItems || []).length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                      <tr>
                        <th className={`px-4 py-2 text-left ${textSecondary}`}>{t('tools.projectBid.description2', 'Description')}</th>
                        <th className={`px-4 py-2 text-left ${textSecondary}`}>{t('tools.projectBid.category', 'Category')}</th>
                        <th className={`px-4 py-2 text-right ${textSecondary}`}>{t('tools.projectBid.qty', 'Qty')}</th>
                        <th className={`px-4 py-2 text-left ${textSecondary}`}>{t('tools.projectBid.unit', 'Unit')}</th>
                        <th className={`px-4 py-2 text-right ${textSecondary}`}>{t('tools.projectBid.unitCost', 'Unit Cost')}</th>
                        <th className={`px-4 py-2 text-right ${textSecondary}`}>{t('tools.projectBid.total', 'Total')}</th>
                        <th className={`px-4 py-2 ${textSecondary}`}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.lineItems || []).map((item) => (
                        <tr key={item.id} className={`border-b ${cardBorder}`}>
                          <td className={`px-4 py-2 ${textPrimary}`}>{item.description}</td>
                          <td className={`px-4 py-2 ${textSecondary}`}>{item.category}</td>
                          <td className={`px-4 py-2 text-right ${textPrimary}`}>{item.quantity}</td>
                          <td className={`px-4 py-2 ${textSecondary}`}>{item.unit}</td>
                          <td className={`px-4 py-2 text-right ${textPrimary}`}>{formatCurrency(item.unitCost)}</td>
                          <td className={`px-4 py-2 text-right font-medium ${textPrimary}`}>{formatCurrency(item.totalCost)}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Markup & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.projectBid.markupPercentages', 'Markup Percentages')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.overhead', 'Overhead %')}</label>
                    <input
                      type="number"
                      value={formData.overhead}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, overhead: Number(e.target.value) }));
                        calculateTotals(formData.lineItems || []);
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.profit', 'Profit %')}</label>
                    <input
                      type="number"
                      value={formData.profit}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, profit: Number(e.target.value) }));
                        calculateTotals(formData.lineItems || []);
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.contingency', 'Contingency %')}</label>
                    <input
                      type="number"
                      value={formData.contingency}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, contingency: Number(e.target.value) }));
                        calculateTotals(formData.lineItems || []);
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary}`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.projectBid.costSummary', 'Cost Summary')}</h3>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={textSecondary}>{t('tools.projectBid.labor2', 'Labor:')}</span>
                      <span className={textPrimary}>{formatCurrency(formData.laborCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSecondary}>{t('tools.projectBid.materials2', 'Materials:')}</span>
                      <span className={textPrimary}>{formatCurrency(formData.materialCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSecondary}>{t('tools.projectBid.equipment2', 'Equipment:')}</span>
                      <span className={textPrimary}>{formatCurrency(formData.equipmentCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSecondary}>{t('tools.projectBid.subcontractors2', 'Subcontractors:')}</span>
                      <span className={textPrimary}>{formatCurrency(formData.subcontractorCost || 0)}</span>
                    </div>
                    <div className={`border-t pt-2 mt-2 ${cardBorder}`}>
                      <div className="flex justify-between">
                        <span className={textSecondary}>{t('tools.projectBid.subtotal', 'Subtotal:')}</span>
                        <span className={textPrimary}>{formatCurrency(
                          (formData.laborCost || 0) + (formData.materialCost || 0) +
                          (formData.equipmentCost || 0) + (formData.subcontractorCost || 0)
                        )}</span>
                      </div>
                    </div>
                    <div className={`border-t pt-2 mt-2 ${cardBorder}`}>
                      <div className="flex justify-between text-lg font-bold">
                        <span className={textPrimary}>{t('tools.projectBid.totalBid', 'Total Bid:')}</span>
                        <span className="text-[#0D9488]">{formatCurrency(formData.totalBid || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-8">
              <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t('tools.projectBid.notes', 'Notes')}</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textPrimary} h-24`}
                placeholder={t('tools.projectBid.additionalNotes', 'Additional notes...')}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={saveBid}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0D9488] text-white font-medium hover:bg-[#0B7C72]"
              >
                <Save className="w-5 h-5" />
                {selectedBidId ? t('tools.projectBid.updateBid', 'Update Bid') : t('tools.projectBid.createBid', 'Create Bid')}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border ${cardBorder} ${textSecondary} font-medium hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X className="w-5 h-5" />
                {t('tools.projectBid.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>{t('tools.projectBid.bidAnalytics', 'Bid Analytics')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <span className={textSecondary}>{t('tools.projectBid.totalBids', 'Total Bids')}</span>
                </div>
                <p className={`text-3xl font-bold ${textPrimary}`}>{analytics.totalBids}</p>
              </div>
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-6 h-6 text-green-500" />
                  <span className={textSecondary}>{t('tools.projectBid.wonBids', 'Won Bids')}</span>
                </div>
                <p className={`text-3xl font-bold ${textPrimary}`}>{analytics.wonBids}</p>
              </div>
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-yellow-500" />
                  <span className={textSecondary}>{t('tools.projectBid.pending', 'Pending')}</span>
                </div>
                <p className={`text-3xl font-bold ${textPrimary}`}>{analytics.pendingBids}</p>
              </div>
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-purple-500" />
                  <span className={textSecondary}>{t('tools.projectBid.winRate', 'Win Rate')}</span>
                </div>
                <p className={`text-3xl font-bold ${textPrimary}`}>{analytics.winRate}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${cardBorder}`}>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.projectBid.totalBidValue', 'Total Bid Value')}</h3>
                <p className={`text-4xl font-bold text-[#0D9488]`}>{formatCurrency(analytics.totalValue)}</p>
                <p className={`text-sm ${textSecondary} mt-2`}>{t('tools.projectBid.acrossAllBids', 'Across all bids')}</p>
              </div>
              <div className={`p-6 rounded-xl border ${cardBorder}`}>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('tools.projectBid.wonValue', 'Won Value')}</h3>
                <p className={`text-4xl font-bold text-green-500`}>{formatCurrency(analytics.wonValue)}</p>
                <p className={`text-sm ${textSecondary} mt-2`}>{t('tools.projectBid.fromWonBids', 'From won bids')}</p>
              </div>
            </div>
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

export default ProjectBidTool;
