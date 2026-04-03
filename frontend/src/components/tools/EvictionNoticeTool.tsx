'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  FileWarning,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  AlertTriangle,
  User,
  Home,
  Clock,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Eye,
  Copy,
  Printer,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Scale,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface TenantInfo {
  name: string;
  email: string;
  phone: string;
  additionalOccupants: string[];
}

interface PropertyInfo {
  address: string;
  unit: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial' | 'other';
}

interface EvictionNotice {
  id: string;
  noticeType: 'pay-or-quit' | 'cure-or-quit' | 'unconditional-quit';
  tenant: TenantInfo;
  property: PropertyInfo;
  reason: string;
  reasonDetails: string;
  amountOwed: number;
  noticePeriodDays: number;
  noticeDate: string;
  responseDeadline: string;
  deliveryMethod: 'personal' | 'certified-mail' | 'posting' | 'email' | 'multiple';
  deliveryDate: string;
  deliveredBy: string;
  witnessName: string;
  status: 'draft' | 'served' | 'response-pending' | 'complied' | 'expired' | 'court-filing';
  landlordName: string;
  landlordAddress: string;
  landlordPhone: string;
  landlordEmail: string;
  notes: string;
  caseNumber: string;
  courtDate: string;
  createdAt: string;
  updatedAt: string;
}

interface EvictionNoticeToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'eviction-notice';

const noticeColumns: ColumnConfig[] = [
  { key: 'tenant.name', header: 'Tenant Name', type: 'string' },
  { key: 'property.address', header: 'Property Address', type: 'string' },
  { key: 'noticeType', header: 'Notice Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'noticeDate', header: 'Notice Date', type: 'date' },
  { key: 'responseDeadline', header: 'Deadline', type: 'date' },
  { key: 'amountOwed', header: 'Amount Owed', type: 'number' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const createNewNotice = (): EvictionNotice => ({
  id: crypto.randomUUID(),
  noticeType: 'pay-or-quit',
  tenant: {
    name: '',
    email: '',
    phone: '',
    additionalOccupants: [],
  },
  property: {
    address: '',
    unit: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'apartment',
  },
  reason: '',
  reasonDetails: '',
  amountOwed: 0,
  noticePeriodDays: 3,
  noticeDate: new Date().toISOString().split('T')[0],
  responseDeadline: '',
  deliveryMethod: 'personal',
  deliveryDate: '',
  deliveredBy: '',
  witnessName: '',
  status: 'draft',
  landlordName: '',
  landlordAddress: '',
  landlordPhone: '',
  landlordEmail: '',
  notes: '',
  caseNumber: '',
  courtDate: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const noticeTypes = [
  { value: 'pay-or-quit', label: 'Pay or Quit', description: 'Tenant must pay rent owed or vacate', icon: DollarSign },
  { value: 'cure-or-quit', label: 'Cure or Quit', description: 'Tenant must fix lease violation or vacate', icon: FileWarning },
  { value: 'unconditional-quit', label: 'Unconditional Quit', description: 'Tenant must vacate without option to remedy', icon: XCircle },
];

const deliveryMethods = [
  { value: 'personal', label: 'Personal Delivery' },
  { value: 'certified-mail', label: 'Certified Mail' },
  { value: 'posting', label: 'Posting on Door' },
  { value: 'email', label: 'Email (if allowed by lease)' },
  { value: 'multiple', label: 'Multiple Methods' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'served', label: 'Served', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'response-pending', label: 'Response Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'complied', label: 'Complied', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'expired', label: 'Expired', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'court-filing', label: 'Court Filing', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'Single Family Home' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'commercial', label: 'Commercial Property' },
  { value: 'other', label: 'Other' },
];

const noticePeriods = [
  { value: 3, label: '3-Day Notice' },
  { value: 5, label: '5-Day Notice' },
  { value: 7, label: '7-Day Notice' },
  { value: 14, label: '14-Day Notice' },
  { value: 30, label: '30-Day Notice' },
  { value: 60, label: '60-Day Notice' },
  { value: 90, label: '90-Day Notice' },
];

export const EvictionNoticeTool: React.FC<EvictionNoticeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: notices,
    addItem: addNotice,
    updateItem: updateNotice,
    deleteItem: deleteNotice,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<EvictionNotice>(TOOL_ID, [], noticeColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<EvictionNotice | null>(null);
  const [editingNotice, setEditingNotice] = useState<EvictionNotice | null>(null);
  const [formData, setFormData] = useState<EvictionNotice>(createNewNotice());
  const [newOccupant, setNewOccupant] = useState('');
  const [activeTab, setActiveTab] = useState<'tenant' | 'property' | 'notice' | 'delivery'>('tenant');

  // Statistics
  const stats = useMemo(() => {
    const draft = notices.filter(n => n.status === 'draft');
    const served = notices.filter(n => n.status === 'served');
    const pending = notices.filter(n => n.status === 'response-pending');
    const complied = notices.filter(n => n.status === 'complied');
    const courtFiling = notices.filter(n => n.status === 'court-filing');
    const totalOwed = notices.reduce((sum, n) => sum + (n.amountOwed || 0), 0);
    return {
      total: notices.length,
      draft: draft.length,
      served: served.length,
      pending: pending.length,
      complied: complied.length,
      courtFiling: courtFiling.length,
      totalOwed,
    };
  }, [notices]);

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
      const matchesSearch = searchQuery === '' ||
        notice.tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.property.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || notice.status === filterStatus;
      const matchesType = filterType === '' || notice.noticeType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [notices, searchQuery, filterStatus, filterType]);

  // Calculate response deadline based on notice date and period
  const calculateDeadline = (noticeDate: string, days: number): string => {
    if (!noticeDate) return '';
    const date = new Date(noticeDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const handleNoticeDateChange = (date: string) => {
    const deadline = calculateDeadline(date, formData.noticePeriodDays);
    setFormData({ ...formData, noticeDate: date, responseDeadline: deadline });
  };

  const handleNoticePeriodChange = (days: number) => {
    const deadline = calculateDeadline(formData.noticeDate, days);
    setFormData({ ...formData, noticePeriodDays: days, responseDeadline: deadline });
  };

  const handleSave = () => {
    if (editingNotice) {
      updateNotice(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      const deadline = calculateDeadline(formData.noticeDate, formData.noticePeriodDays);
      addNotice({ ...formData, responseDeadline: deadline, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingNotice(null);
    setFormData(createNewNotice());
    setActiveTab('tenant');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Eviction Notice',
      message: 'Are you sure you want to delete this eviction notice?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (confirmed) {
      deleteNotice(id);
      if (selectedNotice?.id === id) setSelectedNotice(null);
    }
  };

  const openEditModal = (notice: EvictionNotice) => {
    setEditingNotice(notice);
    setFormData(notice);
    setShowModal(true);
  };

  const addOccupant = () => {
    if (newOccupant.trim() && !formData.tenant.additionalOccupants.includes(newOccupant.trim())) {
      setFormData({
        ...formData,
        tenant: {
          ...formData.tenant,
          additionalOccupants: [...formData.tenant.additionalOccupants, newOccupant.trim()],
        },
      });
      setNewOccupant('');
    }
  };

  const removeOccupant = (occupant: string) => {
    setFormData({
      ...formData,
      tenant: {
        ...formData.tenant,
        additionalOccupants: formData.tenant.additionalOccupants.filter(o => o !== occupant),
      },
    });
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getNoticeTypeLabel = (type: string) => {
    const noticeType = noticeTypes.find(t => t.value === type);
    return noticeType?.label || type;
  };

  const getNoticeTypeIcon = (type: string) => {
    const noticeType = noticeTypes.find(t => t.value === type);
    return noticeType?.icon || FileWarning;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const generateNoticeDocument = (notice: EvictionNotice): string => {
    const noticeTypeInfo = noticeTypes.find(t => t.value === notice.noticeType);
    const formattedDate = new Date(notice.noticeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const deadlineDate = new Date(notice.responseDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let document = `
NOTICE TO ${notice.noticeType === 'pay-or-quit' ? 'PAY RENT OR QUIT' : notice.noticeType === 'cure-or-quit' ? 'CURE OR QUIT' : 'QUIT'}

Date: ${formattedDate}

TO: ${notice.tenant.name}
${notice.tenant.additionalOccupants.length > 0 ? `AND ALL OTHER OCCUPANTS: ${notice.tenant.additionalOccupants.join(', ')}` : ''}

PROPERTY ADDRESS:
${notice.property.address}${notice.property.unit ? `, Unit ${notice.property.unit}` : ''}
${notice.property.city}, ${notice.property.state} ${notice.property.zipCode}

NOTICE:
`;

    if (notice.noticeType === 'pay-or-quit') {
      document += `
You are hereby notified that you are indebted to the undersigned landlord in the sum of ${formatCurrency(notice.amountOwed)} for rent due on the above-described premises.

You are required to pay said amount within ${notice.noticePeriodDays} days from the date of service of this notice, or to vacate and surrender possession of the premises to the landlord.

If you fail to pay the rent owed or vacate the premises by ${deadlineDate}, legal proceedings will be initiated against you to recover possession of the premises, any rent due, and any other damages allowed by law.
`;
    } else if (notice.noticeType === 'cure-or-quit') {
      document += `
You are hereby notified that you are in violation of your lease agreement for the following reason(s):

VIOLATION: ${notice.reason}
${notice.reasonDetails ? `DETAILS: ${notice.reasonDetails}` : ''}

You are required to cure this violation within ${notice.noticePeriodDays} days from the date of service of this notice, or to vacate and surrender possession of the premises to the landlord.

If you fail to cure the violation or vacate the premises by ${deadlineDate}, legal proceedings will be initiated against you to recover possession of the premises and any damages allowed by law.
`;
    } else {
      document += `
You are hereby notified that you must vacate and surrender possession of the premises within ${notice.noticePeriodDays} days from the date of service of this notice.

REASON FOR TERMINATION: ${notice.reason}
${notice.reasonDetails ? `DETAILS: ${notice.reasonDetails}` : ''}

This notice is unconditional and cannot be cured. You must vacate the premises by ${deadlineDate}.

If you fail to vacate the premises by the deadline, legal proceedings will be initiated against you to recover possession of the premises and any damages allowed by law.
`;
    }

    document += `

LANDLORD/PROPERTY MANAGER:
${notice.landlordName}
${notice.landlordAddress}
${notice.landlordPhone ? `Phone: ${notice.landlordPhone}` : ''}
${notice.landlordEmail ? `Email: ${notice.landlordEmail}` : ''}

---

PROOF OF SERVICE

I, ${notice.deliveredBy || '___________________'}, declare that on ${notice.deliveryDate || '___________________'}, I served this notice by:

${notice.deliveryMethod === 'personal' ? '[X] Personal delivery to the tenant' : '[ ] Personal delivery to the tenant'}
${notice.deliveryMethod === 'certified-mail' ? '[X] Certified mail, return receipt requested' : '[ ] Certified mail, return receipt requested'}
${notice.deliveryMethod === 'posting' ? '[X] Posting on the door of the premises' : '[ ] Posting on the door of the premises'}
${notice.deliveryMethod === 'email' ? '[X] Email (as authorized by lease agreement)' : '[ ] Email (as authorized by lease agreement)'}

Witness (if applicable): ${notice.witnessName || '___________________'}

Signature: ___________________

Date: ___________________
`;

    return document;
  };

  const copyNoticeToClipboard = (notice: EvictionNotice) => {
    const document = generateNoticeDocument(notice);
    navigator.clipboard.writeText(document);
    setValidationMessage('Notice document copied to clipboard!');
    setTimeout(() => setValidationMessage(null), 3000);
  };

  const printNotice = (notice: EvictionNotice) => {
    const document = generateNoticeDocument(notice);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Eviction Notice - ${notice.tenant.name}</title>
            <style>
              body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; max-width: 8.5in; margin: 1in auto; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body><pre>${document}</pre></body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Styles
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/20`;

  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
      : theme === 'dark'
        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
            <FileWarning className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.evictionNotice.evictionNoticeGenerator', 'Eviction Notice Generator')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.evictionNotice.generateAndTrackEvictionNotices', 'Generate and track eviction notices')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="eviction-notice" toolName="Eviction Notice" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme as 'light' | 'dark'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportCSV({ filename: 'eviction-notices' })}
            onExportExcel={() => exportExcel({ filename: 'eviction-notices' })}
            onExportJSON={() => exportJSON({ filename: 'eviction-notices' })}
            onExportPDF={() => exportPDF({ filename: 'eviction-notices', title: 'Eviction Notices' })}
            onPrint={() => print('Eviction Notices')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={notices.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewNotice()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.evictionNotice.newNotice', 'New Notice')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.evictionNotice.total', 'Total')}</p>
              <p className="text-xl font-bold text-cyan-500">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-gray-500/10 rounded-lg">
              <Edit2 className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.evictionNotice.draft', 'Draft')}</p>
              <p className="text-xl font-bold text-gray-400">{stats.draft}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Send className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.evictionNotice.served', 'Served')}</p>
              <p className="text-xl font-bold text-blue-500">{stats.served}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.evictionNotice.pending', 'Pending')}</p>
              <p className="text-xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.evictionNotice.complied', 'Complied')}</p>
              <p className="text-xl font-bold text-green-500">{stats.complied}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Scale className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.evictionNotice.court', 'Court')}</p>
              <p className="text-xl font-bold text-red-500">{stats.courtFiling}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tools.evictionNotice.searchTenantOrAddress', 'Search tenant or address...')}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.evictionNotice.allStatus', 'All Status')}</option>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${inputClass} w-full sm:w-48`}>
            <option value="">{t('tools.evictionNotice.allNoticeTypes', 'All Notice Types')}</option>
            {noticeTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notice List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{t('tools.evictionNotice.evictionNotices', 'Eviction Notices')}</h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FileWarning className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.evictionNotice.noNoticesFound', 'No notices found')}</p>
              </div>
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredNotices.map(notice => {
                  const TypeIcon = getNoticeTypeIcon(notice.noticeType);
                  return (
                    <div
                      key={notice.id}
                      onClick={() => setSelectedNotice(notice)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedNotice?.id === notice.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <TypeIcon className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-medium">{notice.tenant.name}</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {notice.property.address}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getStatusColor(notice.status)}`}>
                                {statusOptions.find(s => s.value === notice.status)?.label}
                              </span>
                              {notice.amountOwed > 0 && (
                                <span className="text-xs text-orange-400">{formatCurrency(notice.amountOwed)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(notice); }} className="p-1.5 hover:bg-gray-600 rounded">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(notice.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedNotice ? (
            <div>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{selectedNotice.tenant.name}</h2>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(selectedNotice.status)}`}>
                        {statusOptions.find(s => s.value === selectedNotice.status)?.label}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getNoticeTypeLabel(selectedNotice.noticeType)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPreviewModal(true)} className={buttonSecondary}>
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button onClick={() => copyNoticeToClipboard(selectedNotice)} className={buttonSecondary}>
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                    <button onClick={() => printNotice(selectedNotice)} className={buttonPrimary}>
                      <Printer className="w-4 h-4" /> Print
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Property & Tenant Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Home className="w-4 h-4 text-cyan-500" />
                      {t('tools.evictionNotice.propertyInformation', 'Property Information')}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">{t('tools.evictionNotice.address', 'Address:')}</span> {selectedNotice.property.address}</p>
                      {selectedNotice.property.unit && <p><span className="text-gray-400">{t('tools.evictionNotice.unit', 'Unit:')}</span> {selectedNotice.property.unit}</p>}
                      <p><span className="text-gray-400">{t('tools.evictionNotice.city', 'City:')}</span> {selectedNotice.property.city}, {selectedNotice.property.state} {selectedNotice.property.zipCode}</p>
                      <p><span className="text-gray-400">{t('tools.evictionNotice.type', 'Type:')}</span> {propertyTypes.find(t => t.value === selectedNotice.property.propertyType)?.label}</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-500" />
                      {t('tools.evictionNotice.tenantInformation', 'Tenant Information')}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">{t('tools.evictionNotice.name', 'Name:')}</span> {selectedNotice.tenant.name}</p>
                      {selectedNotice.tenant.email && <p><span className="text-gray-400">{t('tools.evictionNotice.email', 'Email:')}</span> {selectedNotice.tenant.email}</p>}
                      {selectedNotice.tenant.phone && <p><span className="text-gray-400">{t('tools.evictionNotice.phone', 'Phone:')}</span> {selectedNotice.tenant.phone}</p>}
                      {selectedNotice.tenant.additionalOccupants.length > 0 && (
                        <p><span className="text-gray-400">{t('tools.evictionNotice.otherOccupants', 'Other Occupants:')}</span> {selectedNotice.tenant.additionalOccupants.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notice Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.evictionNotice.noticeDate', 'Notice Date')}</p>
                    <p className="font-medium">{selectedNotice.noticeDate}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.evictionNotice.responseDeadline', 'Response Deadline')}</p>
                    <p className="font-medium">{selectedNotice.responseDeadline}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.evictionNotice.noticePeriod', 'Notice Period')}</p>
                    <p className="font-medium">{selectedNotice.noticePeriodDays} Days</p>
                  </div>
                  {selectedNotice.amountOwed > 0 && (
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                      <p className="text-xs text-orange-400">{t('tools.evictionNotice.amountOwed', 'Amount Owed')}</p>
                      <p className="font-medium text-orange-500">{formatCurrency(selectedNotice.amountOwed)}</p>
                    </div>
                  )}
                </div>

                {/* Reason */}
                {selectedNotice.reason && (
                  <div className={`p-4 rounded-lg border border-orange-500/30 ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-orange-400">
                      <AlertTriangle className="w-4 h-4" />
                      {t('tools.evictionNotice.reasonForNotice2', 'Reason for Notice')}
                    </h3>
                    <p className="text-sm">{selectedNotice.reason}</p>
                    {selectedNotice.reasonDetails && (
                      <p className="text-sm text-gray-400 mt-2">{selectedNotice.reasonDetails}</p>
                    )}
                  </div>
                )}

                {/* Delivery Information */}
                {selectedNotice.deliveryDate && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Send className="w-4 h-4 text-cyan-500" />
                      {t('tools.evictionNotice.deliveryInformation', 'Delivery Information')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">{t('tools.evictionNotice.method', 'Method')}</p>
                        <p className="font-medium">{deliveryMethods.find(m => m.value === selectedNotice.deliveryMethod)?.label}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">{t('tools.evictionNotice.deliveryDate', 'Delivery Date')}</p>
                        <p className="font-medium">{selectedNotice.deliveryDate}</p>
                      </div>
                      {selectedNotice.deliveredBy && (
                        <div>
                          <p className="text-gray-400">{t('tools.evictionNotice.deliveredBy', 'Delivered By')}</p>
                          <p className="font-medium">{selectedNotice.deliveredBy}</p>
                        </div>
                      )}
                      {selectedNotice.witnessName && (
                        <div>
                          <p className="text-gray-400">{t('tools.evictionNotice.witness', 'Witness')}</p>
                          <p className="font-medium">{selectedNotice.witnessName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Court Information */}
                {(selectedNotice.caseNumber || selectedNotice.courtDate) && (
                  <div className={`p-4 rounded-lg border border-red-500/30 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-400">
                      <Scale className="w-4 h-4" />
                      {t('tools.evictionNotice.courtInformation', 'Court Information')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedNotice.caseNumber && (
                        <div>
                          <p className="text-gray-400">{t('tools.evictionNotice.caseNumber', 'Case Number')}</p>
                          <p className="font-medium">{selectedNotice.caseNumber}</p>
                        </div>
                      )}
                      {selectedNotice.courtDate && (
                        <div>
                          <p className="text-gray-400">{t('tools.evictionNotice.courtDate', 'Court Date')}</p>
                          <p className="font-medium">{selectedNotice.courtDate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedNotice.notes && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2">{t('tools.evictionNotice.notes', 'Notes')}</h3>
                    <p className="text-sm">{selectedNotice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileWarning className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.evictionNotice.selectANotice', 'Select a notice')}</p>
              <p className="text-sm">{t('tools.evictionNotice.chooseAnEvictionNoticeTo', 'Choose an eviction notice to view details')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{editingNotice ? t('tools.evictionNotice.editEvictionNotice', 'Edit Eviction Notice') : t('tools.evictionNotice.createEvictionNotice', 'Create Eviction Notice')}</h2>
              <button onClick={() => { setShowModal(false); setEditingNotice(null); setActiveTab('tenant'); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className={`px-6 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex gap-2 overflow-x-auto`}>
              <button onClick={() => setActiveTab('tenant')} className={tabClass(activeTab === 'tenant')}>{t('tools.evictionNotice.tenant', 'Tenant')}</button>
              <button onClick={() => setActiveTab('property')} className={tabClass(activeTab === 'property')}>{t('tools.evictionNotice.property', 'Property')}</button>
              <button onClick={() => setActiveTab('notice')} className={tabClass(activeTab === 'notice')}>{t('tools.evictionNotice.noticeDetails', 'Notice Details')}</button>
              <button onClick={() => setActiveTab('delivery')} className={tabClass(activeTab === 'delivery')}>{t('tools.evictionNotice.deliveryStatus', 'Delivery & Status')}</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tenant Tab */}
              {activeTab === 'tenant' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.evictionNotice.tenantName', 'Tenant Name *')}</label>
                    <input type="text" value={formData.tenant.name} onChange={(e) => setFormData({ ...formData, tenant: { ...formData.tenant, name: e.target.value } })} className={inputClass} placeholder={t('tools.evictionNotice.johnDoe', 'John Doe')} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.email2', 'Email')}</label>
                      <input type="email" value={formData.tenant.email} onChange={(e) => setFormData({ ...formData, tenant: { ...formData.tenant, email: e.target.value } })} className={inputClass} placeholder={t('tools.evictionNotice.tenantEmailCom', 'tenant@email.com')} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.phone2', 'Phone')}</label>
                      <input type="tel" value={formData.tenant.phone} onChange={(e) => setFormData({ ...formData, tenant: { ...formData.tenant, phone: e.target.value } })} className={inputClass} placeholder="(555) 123-4567" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.evictionNotice.additionalOccupants', 'Additional Occupants')}</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newOccupant} onChange={(e) => setNewOccupant(e.target.value)} placeholder={t('tools.evictionNotice.addOccupantName', 'Add occupant name')} className={inputClass} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOccupant())} />
                      <button type="button" onClick={addOccupant} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tenant.additionalOccupants.map((occupant, i) => (
                        <span key={i} className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                          {occupant} <button onClick={() => removeOccupant(occupant)}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Property Tab */}
              {activeTab === 'property' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.evictionNotice.streetAddress', 'Street Address *')}</label>
                    <input type="text" value={formData.property.address} onChange={(e) => setFormData({ ...formData, property: { ...formData.property, address: e.target.value } })} className={inputClass} placeholder={t('tools.evictionNotice.123MainStreet', '123 Main Street')} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.unitAptNumber', 'Unit/Apt Number')}</label>
                      <input type="text" value={formData.property.unit} onChange={(e) => setFormData({ ...formData, property: { ...formData.property, unit: e.target.value } })} className={inputClass} placeholder={t('tools.evictionNotice.apt101', 'Apt 101')} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.propertyType', 'Property Type')}</label>
                      <select value={formData.property.propertyType} onChange={(e) => setFormData({ ...formData, property: { ...formData.property, propertyType: e.target.value as any } })} className={inputClass}>
                        {propertyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.city2', 'City *')}</label>
                      <input type="text" value={formData.property.city} onChange={(e) => setFormData({ ...formData, property: { ...formData.property, city: e.target.value } })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.state', 'State *')}</label>
                      <input type="text" value={formData.property.state} onChange={(e) => setFormData({ ...formData, property: { ...formData.property, state: e.target.value } })} className={inputClass} maxLength={2} placeholder="CA" />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.zipCode', 'ZIP Code *')}</label>
                      <input type="text" value={formData.property.zipCode} onChange={(e) => setFormData({ ...formData, property: { ...formData.property, zipCode: e.target.value } })} className={inputClass} placeholder="90210" />
                    </div>
                  </div>
                </div>
              )}

              {/* Notice Details Tab */}
              {activeTab === 'notice' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('tools.evictionNotice.noticeType', 'Notice Type *')}</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {noticeTypes.map(type => {
                        const TypeIcon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, noticeType: type.value as any })}
                            className={`p-4 rounded-lg border text-left transition-colors ${
                              formData.noticeType === type.value
                                ? 'border-cyan-500 bg-cyan-500/10'
                                : theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <TypeIcon className={`w-5 h-5 mb-2 ${formData.noticeType === type.value ? 'text-cyan-500' : 'text-gray-400'}`} />
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-gray-400 mt-1">{type.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.noticeDate2', 'Notice Date *')}</label>
                      <input type="date" value={formData.noticeDate} onChange={(e) => handleNoticeDateChange(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.noticePeriod2', 'Notice Period *')}</label>
                      <select value={formData.noticePeriodDays} onChange={(e) => handleNoticePeriodChange(Number(e.target.value))} className={inputClass}>
                        {noticePeriods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.evictionNotice.responseDeadline2', 'Response Deadline')}</label>
                    <input type="date" value={formData.responseDeadline} readOnly className={`${inputClass} bg-gray-700/50 cursor-not-allowed`} />
                  </div>
                  {formData.noticeType === 'pay-or-quit' && (
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.amountOwed2', 'Amount Owed *')}</label>
                      <input type="number" value={formData.amountOwed || ''} onChange={(e) => setFormData({ ...formData, amountOwed: Number(e.target.value) })} className={inputClass} placeholder="0.00" min="0" step="0.01" />
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>{t('tools.evictionNotice.reasonForNotice', 'Reason for Notice *')}</label>
                    <input type="text" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className={inputClass} placeholder={t('tools.evictionNotice.eGNonPaymentOf', 'e.g., Non-payment of rent, Lease violation, etc.')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.evictionNotice.reasonDetails', 'Reason Details')}</label>
                    <textarea value={formData.reasonDetails} onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })} className={inputClass} rows={3} placeholder={t('tools.evictionNotice.provideAdditionalDetailsAboutThe', 'Provide additional details about the reason...')} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.landlordPropertyManagerName', 'Landlord/Property Manager Name')}</label>
                      <input type="text" value={formData.landlordName} onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.landlordAddress', 'Landlord Address')}</label>
                      <input type="text" value={formData.landlordAddress} onChange={(e) => setFormData({ ...formData, landlordAddress: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.landlordPhone', 'Landlord Phone')}</label>
                      <input type="tel" value={formData.landlordPhone} onChange={(e) => setFormData({ ...formData, landlordPhone: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.landlordEmail', 'Landlord Email')}</label>
                      <input type="email" value={formData.landlordEmail} onChange={(e) => setFormData({ ...formData, landlordEmail: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery & Status Tab */}
              {activeTab === 'delivery' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.status', 'Status')}</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}>
                        {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.deliveryMethod', 'Delivery Method')}</label>
                      <select value={formData.deliveryMethod} onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value as any })} className={inputClass}>
                        {deliveryMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.deliveryDate2', 'Delivery Date')}</label>
                      <input type="date" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.deliveredBy2', 'Delivered By')}</label>
                      <input type="text" value={formData.deliveredBy} onChange={(e) => setFormData({ ...formData, deliveredBy: e.target.value })} className={inputClass} placeholder={t('tools.evictionNotice.nameOfPersonServingNotice', 'Name of person serving notice')} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.evictionNotice.witnessNameIfApplicable', 'Witness Name (if applicable)')}</label>
                    <input type="text" value={formData.witnessName} onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.caseNumberIfFiled', 'Case Number (if filed)')}</label>
                      <input type="text" value={formData.caseNumber} onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('tools.evictionNotice.courtDateIfScheduled', 'Court Date (if scheduled)')}</label>
                      <input type="date" value={formData.courtDate} onChange={(e) => setFormData({ ...formData, courtDate: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.evictionNotice.notes2', 'Notes')}</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} placeholder={t('tools.evictionNotice.additionalNotesOrComments', 'Additional notes or comments...')} />
                  </div>
                </div>
              )}

              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => { setShowModal(false); setEditingNotice(null); setActiveTab('tenant'); }} className={buttonSecondary}>{t('tools.evictionNotice.cancel', 'Cancel')}</button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!formData.tenant.name || !formData.property.address || !formData.property.city || !formData.property.state || !formData.property.zipCode}
                  className={buttonPrimary}
                >
                  <Save className="w-4 h-4" /> Save Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className="text-xl font-bold">{t('tools.evictionNotice.noticePreview', 'Notice Preview')}</h2>
              <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <pre className={`whitespace-pre-wrap font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {generateNoticeDocument(selectedNotice)}
              </pre>
            </div>
            <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
              <button onClick={() => setShowPreviewModal(false)} className={buttonSecondary}>{t('tools.evictionNotice.close', 'Close')}</button>
              <button onClick={() => copyNoticeToClipboard(selectedNotice)} className={buttonSecondary}><Copy className="w-4 h-4" /> {t('tools.evictionNotice.copy', 'Copy')}</button>
              <button onClick={() => printNotice(selectedNotice)} className={buttonPrimary}><Printer className="w-4 h-4" /> {t('tools.evictionNotice.print', 'Print')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.evictionNotice.aboutEvictionNoticeGenerator', 'About Eviction Notice Generator')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Generate and track eviction notices for rental properties. Supports Pay or Quit, Cure or Quit, and Unconditional Quit notices.
          Track tenant information, property details, delivery methods, response deadlines, and case status.
          <span className="block mt-2 text-yellow-500">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            {t('tools.evictionNotice.disclaimerThisToolIsFor', 'Disclaimer: This tool is for informational purposes only. Always consult with a licensed attorney to ensure compliance with local and state eviction laws.')}
          </span>
        </p>
      </div>
    </div>
  );
};

export default EvictionNoticeTool;
