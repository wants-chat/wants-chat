'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
} from '../../lib/toolDataUtils';
import {
  Shield,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  Edit3,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Upload,
  Download,
  Eye,
  MessageSquare,
  Send,
  Sparkles,
  Building2,
  Hash,
  Filter,
  FileCheck,
  FileClock,
  FileX,
  ClipboardCheck,
  Paperclip,
} from 'lucide-react';

// Types
interface WarrantyDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  url: string;
}

interface ClaimNote {
  id: string;
  date: string;
  author: string;
  content: string;
  type: 'internal' | 'customer' | 'manufacturer';
}

interface WarrantyClaim {
  id: string;
  claimNumber: string;
  createdAt: string;
  updatedAt: string;
  // Customer Information
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  // Appliance Details
  applianceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyType: 'manufacturer' | 'extended' | 'service-contract';
  warrantyProvider: string;
  warrantyExpiry: string;
  warrantyNumber: string;
  // Issue Details
  issueDescription: string;
  failureDate: string;
  repairAttempts: number;
  previousRepairDates: string[];
  // Claim Details
  claimType: 'repair' | 'replacement' | 'refund';
  requestedResolution: string;
  estimatedCost: number;
  approvedAmount: number;
  // Status Tracking
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'denied' | 'completed' | 'cancelled';
  submittedDate: string;
  reviewDate: string;
  resolutionDate: string;
  denialReason: string;
  // Documents
  documents: WarrantyDocument[];
  // Notes
  notes: ClaimNote[];
  // Authorization
  authorizationNumber: string;
  authorizedBy: string;
}

// Constants
const APPLIANCE_TYPES = [
  'Refrigerator',
  'Washing Machine',
  'Dryer',
  'Dishwasher',
  'Oven/Range',
  'Microwave',
  'Air Conditioner',
  'Freezer',
  'Ice Maker',
  'Water Heater',
  'HVAC System',
  'Other',
];

const WARRANTY_TYPES = [
  { value: 'manufacturer', label: 'Manufacturer Warranty' },
  { value: 'extended', label: 'Extended Warranty' },
  { value: 'service-contract', label: 'Service Contract' },
];

const CLAIM_TYPES = [
  { value: 'repair', label: 'Repair', icon: '🔧' },
  { value: 'replacement', label: 'Replacement', icon: '🔄' },
  { value: 'refund', label: 'Refund', icon: '💰' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'gray', icon: FileClock },
  { value: 'submitted', label: 'Submitted', color: 'blue', icon: FileText },
  { value: 'under-review', label: 'Under Review', color: 'yellow', icon: Eye },
  { value: 'approved', label: 'Approved', color: 'green', icon: FileCheck },
  { value: 'denied', label: 'Denied', color: 'red', icon: FileX },
  { value: 'completed', label: 'Completed', color: 'purple', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'gray', icon: XCircle },
];

const COMMON_WARRANTY_PROVIDERS = [
  'Samsung',
  'LG',
  'Whirlpool',
  'GE Appliances',
  'Frigidaire',
  'Maytag',
  'Bosch',
  'KitchenAid',
  'Carrier',
  'Trane',
  'Lennox',
  'Asurion',
  'Allstate Protection Plans',
  'SquareTrade',
  'Other',
];

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'claimNumber', header: 'Claim #', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'customerName', header: 'Customer Name', type: 'string' },
  { key: 'applianceType', header: 'Appliance', type: 'string' },
  { key: 'brand', header: 'Brand', type: 'string' },
  { key: 'warrantyType', header: 'Warranty Type', type: 'string' },
  { key: 'warrantyProvider', header: 'Provider', type: 'string' },
  { key: 'claimType', header: 'Claim Type', type: 'string' },
  { key: 'estimatedCost', header: 'Est. Cost', type: 'currency' },
  { key: 'approvedAmount', header: 'Approved', type: 'currency' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'submittedDate', header: 'Submitted', type: 'date' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateClaimNumber = () => `WC-${Date.now().toString(36).toUpperCase()}`;

const createEmptyClaim = (): WarrantyClaim => ({
  id: generateId(),
  claimNumber: generateClaimNumber(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
  applianceType: '',
  brand: '',
  model: '',
  serialNumber: '',
  purchaseDate: '',
  warrantyType: 'manufacturer',
  warrantyProvider: '',
  warrantyExpiry: '',
  warrantyNumber: '',
  issueDescription: '',
  failureDate: '',
  repairAttempts: 0,
  previousRepairDates: [],
  claimType: 'repair',
  requestedResolution: '',
  estimatedCost: 0,
  approvedAmount: 0,
  status: 'draft',
  submittedDate: '',
  reviewDate: '',
  resolutionDate: '',
  denialReason: '',
  documents: [],
  notes: [],
  authorizationNumber: '',
  authorizedBy: '',
});

interface WarrantyClaimApplianceToolProps {
  uiConfig?: UIConfig;
}

export const WarrantyClaimApplianceTool = ({ uiConfig }: WarrantyClaimApplianceToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: claims,
    addItem,
    updateItem,
    deleteItem,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<WarrantyClaim>('appliance-warranty-claims', [], COLUMNS);

  const [currentClaim, setCurrentClaim] = useState<WarrantyClaim>(createEmptyClaim());
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'internal' | 'customer' | 'manufacturer'>('internal');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        customerName?: string;
        applianceType?: string;
        brand?: string;
        model?: string;
        serialNumber?: string;
        issueDescription?: string;
      };
      if (params.customerName || params.applianceType || params.serialNumber) {
        const newClaim = createEmptyClaim();
        if (params.customerName) newClaim.customerName = params.customerName;
        if (params.applianceType) newClaim.applianceType = params.applianceType;
        if (params.brand) newClaim.brand = params.brand;
        if (params.model) newClaim.model = params.model;
        if (params.serialNumber) newClaim.serialNumber = params.serialNumber;
        if (params.issueDescription) newClaim.issueDescription = params.issueDescription;
        setCurrentClaim(newClaim);
        setActiveTab('create');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        !searchQuery.trim() ||
        claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [claims, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const pending = claims.filter((c) => ['submitted', 'under-review'].includes(c.status)).length;
    const approved = claims.filter((c) => c.status === 'approved').length;
    const denied = claims.filter((c) => c.status === 'denied').length;
    const completed = claims.filter((c) => c.status === 'completed').length;
    const totalApproved = claims.filter((c) => c.status === 'completed').reduce((sum, c) => sum + c.approvedAmount, 0);
    return { total: claims.length, pending, approved, denied, completed, totalApproved };
  }, [claims]);

  // Check warranty validity
  const isWarrantyValid = (expiryDate: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) >= new Date();
  };

  // Handlers
  const handleSaveClaim = () => {
    const updatedClaim = { ...currentClaim, updatedAt: new Date().toISOString() };
    const existing = claims.find((c) => c.id === currentClaim.id);

    if (existing) {
      updateItem(currentClaim.id, updatedClaim);
    } else {
      addItem(updatedClaim);
    }

    setCurrentClaim(createEmptyClaim());
    setActiveTab('list');
  };

  const handleSubmitClaim = () => {
    const updatedClaim = {
      ...currentClaim,
      status: 'submitted' as const,
      submittedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = claims.find((c) => c.id === currentClaim.id);
    if (existing) {
      updateItem(currentClaim.id, updatedClaim);
    } else {
      addItem(updatedClaim);
    }

    setCurrentClaim(createEmptyClaim());
    setActiveTab('list');
  };

  const handleEditClaim = (claim: WarrantyClaim) => {
    setCurrentClaim(claim);
    setActiveTab('edit');
  };

  const handleViewClaim = (claim: WarrantyClaim) => {
    setCurrentClaim(claim);
    setActiveTab('view');
  };

  const handleDeleteClaim = async (claimId: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this claim?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(claimId);
    }
  };

  const handleUpdateStatus = (claimId: string, status: WarrantyClaim['status']) => {
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) return;

    const updates: Partial<WarrantyClaim> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'under-review') {
      updates.reviewDate = new Date().toISOString();
    } else if (status === 'approved' || status === 'denied' || status === 'completed') {
      updates.resolutionDate = new Date().toISOString();
    }

    updateItem(claimId, { ...claim, ...updates });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: ClaimNote = {
      id: generateId(),
      date: new Date().toISOString(),
      author: 'Current User',
      content: newNote,
      type: noteType,
    };
    setCurrentClaim({ ...currentClaim, notes: [...currentClaim.notes, note] });
    setNewNote('');
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: isDark ? 'bg-gray-900/30 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200',
      submitted: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200',
      'under-review': isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: isDark ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-200',
      denied: isDark ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-200',
      completed: isDark ? 'bg-purple-900/30 text-purple-400 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200',
      cancelled: isDark ? 'bg-gray-900/30 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return colorMap[status] || colorMap.draft;
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.warrantyClaimAppliance.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.warrantyClaimAppliance.warrantyClaims', 'Warranty Claims')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.warrantyClaimAppliance.processAndTrackWarrantyClaims', 'Process and track warranty claims')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WidgetEmbedButton toolSlug="warranty-claim-appliance" toolName="Warranty Claim Appliance" />

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
                  onExportCSV={() => exportToCSV(claims, COLUMNS, { filename: 'warranty-claims' })}
                  onExportExcel={() => exportToExcel(claims, COLUMNS, { filename: 'warranty-claims' })}
                  onExportJSON={() => exportToJSON(claims, { filename: 'warranty-claims' })}
                  onExportPDF={async () =>
                    await exportToPDF(claims, COLUMNS, {
                      filename: 'warranty-claims',
                      title: 'Warranty Claims Report',
                      subtitle: `${claims.length} claims`,
                    })
                  }
                  onPrint={() => printData(claims, COLUMNS, { title: 'Warranty Claims' })}
                  onCopyToClipboard={async () => await copyUtil(claims, COLUMNS, 'tab')}
                  showImport={false}
                  theme={theme}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          {[
            { label: 'Total Claims', value: stats.total, icon: <FileText className="w-5 h-5" /> },
            { label: 'Pending', value: stats.pending, icon: <FileClock className="w-5 h-5 text-yellow-500" /> },
            { label: 'Approved', value: stats.approved, icon: <FileCheck className="w-5 h-5 text-green-500" /> },
            { label: 'Denied', value: stats.denied, icon: <FileX className="w-5 h-5 text-red-500" /> },
            { label: 'Completed', value: stats.completed, icon: <CheckCircle className="w-5 h-5 text-purple-500" /> },
            { label: 'Total Paid', value: `$${stats.totalApproved.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-green-500" /> },
          ].map((stat) => (
            <Card key={stat.label} className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {stat.icon}
                  <div>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-[#0D9488] text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('tools.warrantyClaimAppliance.allClaims', 'All Claims')}
          </button>
          <button
            onClick={() => {
              setCurrentClaim(createEmptyClaim());
              setActiveTab('create');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'create' || activeTab === 'edit'
                ? 'bg-[#0D9488] text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.warrantyClaimAppliance.newClaim', 'New Claim')}
          </button>
        </div>

        {/* Claims List */}
        {activeTab === 'list' && (
          <Card className={`mt-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.warrantyClaimAppliance.searchClaims', 'Search claims...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={inputClass}
                  style={{ width: 'auto' }}
                >
                  <option value="all">{t('tools.warrantyClaimAppliance.allStatuses', 'All Statuses')}</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Claims List */}
              {filteredClaims.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.warrantyClaimAppliance.noClaimsFound', 'No claims found')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {claim.claimNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(claim.status)}`}>
                              {STATUS_OPTIONS.find((s) => s.value === claim.status)?.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                              {CLAIM_TYPES.find((c) => c.value === claim.claimType)?.label}
                            </span>
                          </div>
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {claim.customerName}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {claim.applianceType} - {claim.brand} {claim.model}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Serial: {claim.serialNumber}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              Provider: {claim.warrantyProvider}
                            </span>
                            <span className={`text-sm ${isWarrantyValid(claim.warrantyExpiry) ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                              {isWarrantyValid(claim.warrantyExpiry) ? t('tools.warrantyClaimAppliance.warrantyValid', 'Warranty Valid') : t('tools.warrantyClaimAppliance.warrantyExpired', 'Warranty Expired')}
                            </span>
                            {claim.approvedAmount > 0 && (
                              <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                Approved: ${claim.approvedAmount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewClaim(claim)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            title={t('tools.warrantyClaimAppliance.view', 'View')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {['draft', 'submitted'].includes(claim.status) && (
                            <button
                              onClick={() => handleEditClaim(claim)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              title={t('tools.warrantyClaimAppliance.edit', 'Edit')}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClaim(claim.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* View Claim */}
        {activeTab === 'view' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Claim Details */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                      Claim #{currentClaim.claimNumber}
                    </CardTitle>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentClaim.status)}`}>
                      {STATUS_OPTIONS.find((s) => s.value === currentClaim.status)?.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.customer', 'Customer')}</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentClaim.customerName}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentClaim.customerPhone}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentClaim.customerEmail}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.appliance', 'Appliance')}</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentClaim.brand} {currentClaim.applianceType}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Model: {currentClaim.model}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Serial: {currentClaim.serialNumber}</p>
                    </div>
                  </div>
                  <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.issueDescription', 'Issue Description')}</p>
                    <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentClaim.issueDescription}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.claimType', 'Claim Type')}</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {CLAIM_TYPES.find((c) => c.value === currentClaim.claimType)?.label}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.estimatedCost', 'Estimated Cost')}</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${currentClaim.estimatedCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.approvedAmount', 'Approved Amount')}</p>
                      <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>${currentClaim.approvedAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  {currentClaim.authorizationNumber && (
                    <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.authorization', 'Authorization')}</p>
                      <p className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentClaim.authorizationNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.warrantyClaimAppliance.notes', 'Notes')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {currentClaim.notes.length === 0 ? (
                      <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.noNotesYet', 'No notes yet')}</p>
                    ) : (
                      currentClaim.notes.map((note) => (
                        <div key={note.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="flex justify-between text-xs mb-1">
                            <div className="flex items-center gap-2">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{note.author}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                note.type === 'internal'
                                  ? 'bg-blue-500/20 text-blue-500'
                                  : note.type === 'customer'
                                  ? 'bg-green-500/20 text-green-500'
                                  : 'bg-purple-500/20 text-purple-500'
                              }`}>
                                {note.type}
                              </span>
                            </div>
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                              {new Date(note.date).toLocaleString()}
                            </span>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Warranty Info */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.warrantyClaimAppliance.warrantyInfo', 'Warranty Info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.type', 'Type')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {WARRANTY_TYPES.find((w) => w.value === currentClaim.warrantyType)?.label}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.provider', 'Provider')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentClaim.warrantyProvider}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.warranty', 'Warranty #')}</p>
                    <p className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentClaim.warrantyNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.warrantyClaimAppliance.expiryDate', 'Expiry Date')}</p>
                    <p className={`font-medium ${isWarrantyValid(currentClaim.warrantyExpiry) ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                      {currentClaim.warrantyExpiry ? new Date(currentClaim.warrantyExpiry).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Actions */}
              {!['completed', 'cancelled', 'denied'].includes(currentClaim.status) && (
                <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.warrantyClaimAppliance.actions', 'Actions')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <select
                      value={currentClaim.status}
                      onChange={(e) => handleUpdateStatus(currentClaim.id, e.target.value as WarrantyClaim['status'])}
                      className={inputClass}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleEditClaim(currentClaim)}
                      className="w-full px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      {t('tools.warrantyClaimAppliance.editClaim', 'Edit Claim')}
                    </button>
                  </CardContent>
                </Card>
              )}

              <button
                onClick={() => setActiveTab('list')}
                className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.warrantyClaimAppliance.backToList', 'Back to List')}
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Claim Form */}
        {(activeTab === 'create' || activeTab === 'edit') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5" />
                    {t('tools.warrantyClaimAppliance.customerInformation', 'Customer Information')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.customerName', 'Customer Name *')}</label>
                      <input
                        type="text"
                        value={currentClaim.customerName}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, customerName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.phone', 'Phone *')}</label>
                      <input
                        type="tel"
                        value={currentClaim.customerPhone}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, customerPhone: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.email', 'Email')}</label>
                      <input
                        type="email"
                        value={currentClaim.customerEmail}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, customerEmail: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.address', 'Address')}</label>
                      <input
                        type="text"
                        value={currentClaim.customerAddress}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, customerAddress: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appliance Info */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Package className="w-5 h-5" />
                    {t('tools.warrantyClaimAppliance.applianceDetails', 'Appliance Details')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.applianceType', 'Appliance Type *')}</label>
                      <select
                        value={currentClaim.applianceType}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, applianceType: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">{t('tools.warrantyClaimAppliance.select', 'Select...')}</option>
                        {APPLIANCE_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.brand', 'Brand *')}</label>
                      <input
                        type="text"
                        value={currentClaim.brand}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, brand: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.model', 'Model *')}</label>
                      <input
                        type="text"
                        value={currentClaim.model}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, model: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.serialNumber', 'Serial Number *')}</label>
                      <input
                        type="text"
                        value={currentClaim.serialNumber}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, serialNumber: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.purchaseDate', 'Purchase Date')}</label>
                      <input
                        type="date"
                        value={currentClaim.purchaseDate}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, purchaseDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.warrantyClaimAppliance.failureDate', 'Failure Date')}</label>
                      <input
                        type="date"
                        value={currentClaim.failureDate}
                        onChange={(e) => setCurrentClaim({ ...currentClaim, failureDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.warrantyClaimAppliance.issueDescription2', 'Issue Description *')}</label>
                    <textarea
                      value={currentClaim.issueDescription}
                      onChange={(e) => setCurrentClaim({ ...currentClaim, issueDescription: e.target.value })}
                      className={`${inputClass} min-h-24`}
                      placeholder={t('tools.warrantyClaimAppliance.describeTheIssueInDetail', 'Describe the issue in detail...')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <MessageSquare className="w-5 h-5" />
                    {t('tools.warrantyClaimAppliance.notes2', 'Notes')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={t('tools.warrantyClaimAppliance.addANote', 'Add a note...')}
                      className={inputClass}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value as typeof noteType)}
                      className={`${inputClass} w-auto`}
                    >
                      <option value="internal">{t('tools.warrantyClaimAppliance.internal', 'Internal')}</option>
                      <option value="customer">{t('tools.warrantyClaimAppliance.customer2', 'Customer')}</option>
                      <option value="manufacturer">{t('tools.warrantyClaimAppliance.manufacturer', 'Manufacturer')}</option>
                    </select>
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                    >
                      {t('tools.warrantyClaimAppliance.add', 'Add')}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentClaim.notes.map((note) => (
                      <div key={note.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{note.author} ({note.type})</span>
                          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                            {new Date(note.date).toLocaleString()}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{note.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Claim Info */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.warrantyClaimAppliance.claimInfo', 'Claim Info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.warrantyClaimAppliance.claimNumber', 'Claim Number')}</label>
                    <p className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentClaim.claimNumber}
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.warrantyClaimAppliance.claimType2', 'Claim Type *')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CLAIM_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setCurrentClaim({ ...currentClaim, claimType: type.value as WarrantyClaim['claimType'] })}
                          className={`p-2 rounded-lg text-sm transition-colors ${
                            currentClaim.claimType === type.value
                              ? 'bg-[#0D9488] text-white'
                              : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-lg">{type.icon}</span>
                          <p>{type.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.warrantyClaimAppliance.estimatedCost2', 'Estimated Cost ($)')}</label>
                    <input
                      type="number"
                      value={currentClaim.estimatedCost}
                      onChange={(e) => setCurrentClaim({ ...currentClaim, estimatedCost: parseFloat(e.target.value) || 0 })}
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Warranty Info */}
              <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.warrantyClaimAppliance.warrantyDetails', 'Warranty Details')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.warrantyClaimAppliance.warrantyType', 'Warranty Type *')}</label>
                    <select
                      value={currentClaim.warrantyType}
                      onChange={(e) => setCurrentClaim({ ...currentClaim, warrantyType: e.target.value as WarrantyClaim['warrantyType'] })}
                      className={inputClass}
                    >
                      {WARRANTY_TYPES.map((w) => (
                        <option key={w.value} value={w.value}>{w.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.warrantyClaimAppliance.warrantyProvider', 'Warranty Provider *')}</label>
                    <select
                      value={currentClaim.warrantyProvider}
                      onChange={(e) => setCurrentClaim({ ...currentClaim, warrantyProvider: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.warrantyClaimAppliance.selectProvider', 'Select provider...')}</option>
                      {COMMON_WARRANTY_PROVIDERS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.warrantyClaimAppliance.warrantyNumber', 'Warranty Number')}</label>
                    <input
                      type="text"
                      value={currentClaim.warrantyNumber}
                      onChange={(e) => setCurrentClaim({ ...currentClaim, warrantyNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.warrantyClaimAppliance.warrantyExpiryDate', 'Warranty Expiry Date *')}</label>
                    <input
                      type="date"
                      value={currentClaim.warrantyExpiry}
                      onChange={(e) => setCurrentClaim({ ...currentClaim, warrantyExpiry: e.target.value })}
                      className={inputClass}
                    />
                    {currentClaim.warrantyExpiry && (
                      <p className={`text-sm mt-1 ${isWarrantyValid(currentClaim.warrantyExpiry) ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                        {isWarrantyValid(currentClaim.warrantyExpiry) ? t('tools.warrantyClaimAppliance.warrantyIsValid', 'Warranty is valid') : t('tools.warrantyClaimAppliance.warrantyHasExpired', 'Warranty has expired')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSaveClaim}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.warrantyClaimAppliance.saveDraft', 'Save Draft')}
                </button>
                <button
                  onClick={handleSubmitClaim}
                  disabled={!currentClaim.customerName || !currentClaim.applianceType || !currentClaim.warrantyProvider}
                  className="w-full px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {t('tools.warrantyClaimAppliance.submitClaim', 'Submit Claim')}
                </button>
                <button
                  onClick={() => {
                    setCurrentClaim(createEmptyClaim());
                    setActiveTab('list');
                  }}
                  className={`w-full px-4 py-3 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('tools.warrantyClaimAppliance.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default WarrantyClaimApplianceTool;
