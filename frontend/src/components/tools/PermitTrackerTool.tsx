'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  FileText,
  Calendar,
  ClipboardCheck,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileCheck,
  MapPin,
  DollarSign,
  User,
  Bell,
  BarChart3,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// TypeScript Interfaces
interface Permit {
  id: string;
  permitNumber: string;
  type: PermitType;
  projectName: string;
  address: string;
  applicant: string;
  fee: number;
  status: PermitStatus;
  applicationDate: string;
  expiryDate: string;
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Inspection {
  id: string;
  permitId: string;
  type: string;
  scheduledDate: string;
  scheduledTime: string;
  inspector: string;
  status: 'scheduled' | 'passed' | 'failed' | 'cancelled' | 'rescheduled';
  notes: string;
  createdAt: string;
}

interface Document {
  id: string;
  permitId: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Reminder {
  id: string;
  permitId: string;
  type: 'expiry' | 'inspection' | 'renewal' | 'followup';
  date: string;
  message: string;
  isRead: boolean;
}

type PermitType = 'building' | 'electrical' | 'plumbing' | 'mechanical' | 'demolition' | 'zoning';
type PermitStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'denied' | 'expired';
type TabType = 'permits' | 'inspections' | 'documents' | 'reports';

interface PermitTrackerToolProps {
  uiConfig?: UIConfig;
}

// Constants
const PERMIT_TYPES: { value: PermitType; label: string; color: string }[] = [
  { value: 'building', label: 'Building', color: 'bg-blue-500' },
  { value: 'electrical', label: 'Electrical', color: 'bg-yellow-500' },
  { value: 'plumbing', label: 'Plumbing', color: 'bg-cyan-500' },
  { value: 'mechanical', label: 'Mechanical', color: 'bg-purple-500' },
  { value: 'demolition', label: 'Demolition', color: 'bg-red-500' },
  { value: 'zoning', label: 'Zoning', color: 'bg-green-500' },
];

const PERMIT_STATUSES: { value: PermitStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500', icon: <FileText className="w-4 h-4" /> },
  { value: 'submitted', label: 'Submitted', color: 'bg-blue-500', icon: <Upload className="w-4 h-4" /> },
  { value: 'under-review', label: 'Under Review', color: 'bg-amber-500', icon: <Clock className="w-4 h-4" /> },
  { value: 'approved', label: 'Approved', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'denied', label: 'Denied', color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
  { value: 'expired', label: 'Expired', color: 'bg-orange-500', icon: <AlertTriangle className="w-4 h-4" /> },
];

const INSPECTION_TYPES = [
  'Foundation',
  'Framing',
  'Electrical Rough-In',
  'Plumbing Rough-In',
  'Mechanical',
  'Insulation',
  'Drywall',
  'Final',
  'Certificate of Occupancy',
];

// Column configuration for exports and useToolData hook
const PERMIT_COLUMNS: ColumnConfig[] = [
  { key: 'permitNumber', header: 'Permit Number', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'projectName', header: 'Project Name', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'applicant', header: 'Applicant', type: 'string' },
  { key: 'fee', header: 'Fee', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'applicationDate', header: 'Application Date', type: 'date' },
  { key: 'expiryDate', header: 'Expiry Date', type: 'date' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Sample data generator
const generateSampleData = (): { permits: Permit[]; inspections: Inspection[]; documents: Document[]; reminders: Reminder[] } => {
  const permits: Permit[] = [
    {
      id: '1',
      permitNumber: 'BP-2024-001234',
      type: 'building',
      projectName: 'Downtown Office Complex',
      address: '123 Main Street, Suite 100',
      applicant: 'ABC Construction LLC',
      fee: 2500,
      status: 'approved',
      applicationDate: '2024-01-15',
      expiryDate: '2025-01-15',
      description: 'New commercial building construction - 5 stories',
      notes: 'All preliminary inspections passed',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-20T14:30:00Z',
    },
    {
      id: '2',
      permitNumber: 'EP-2024-005678',
      type: 'electrical',
      projectName: 'Residential Rewiring',
      address: '456 Oak Avenue',
      applicant: 'John Smith',
      fee: 350,
      status: 'under-review',
      applicationDate: '2024-03-01',
      expiryDate: '2024-09-01',
      description: 'Complete electrical system upgrade for residential property',
      notes: 'Awaiting load calculation review',
      createdAt: '2024-03-01T09:00:00Z',
      updatedAt: '2024-03-05T11:00:00Z',
    },
    {
      id: '3',
      permitNumber: 'PP-2024-009012',
      type: 'plumbing',
      projectName: 'Restaurant Kitchen Renovation',
      address: '789 Food Court Blvd',
      applicant: 'Fine Dining Inc.',
      fee: 750,
      status: 'submitted',
      applicationDate: '2024-03-10',
      expiryDate: '2024-09-10',
      description: 'Commercial kitchen plumbing installation',
      notes: '',
      createdAt: '2024-03-10T08:00:00Z',
      updatedAt: '2024-03-10T08:00:00Z',
    },
  ];

  const inspections: Inspection[] = [
    {
      id: '1',
      permitId: '1',
      type: 'Foundation',
      scheduledDate: '2024-04-15',
      scheduledTime: '09:00',
      inspector: 'Mike Johnson',
      status: 'passed',
      notes: 'Foundation meets all requirements',
      createdAt: '2024-04-01T10:00:00Z',
    },
    {
      id: '2',
      permitId: '1',
      type: 'Framing',
      scheduledDate: '2024-05-20',
      scheduledTime: '10:30',
      inspector: 'Sarah Williams',
      status: 'scheduled',
      notes: '',
      createdAt: '2024-05-01T14:00:00Z',
    },
    {
      id: '3',
      permitId: '2',
      type: 'Electrical Rough-In',
      scheduledDate: '2024-04-25',
      scheduledTime: '14:00',
      inspector: 'Tom Davis',
      status: 'scheduled',
      notes: 'Please ensure all circuits are accessible',
      createdAt: '2024-04-10T09:00:00Z',
    },
  ];

  const documents: Document[] = [
    {
      id: '1',
      permitId: '1',
      name: 'Site Plan.pdf',
      type: 'Site Plan',
      uploadDate: '2024-01-15',
      size: '2.5 MB',
      status: 'approved',
    },
    {
      id: '2',
      permitId: '1',
      name: 'Structural Drawings.pdf',
      type: 'Engineering Drawings',
      uploadDate: '2024-01-15',
      size: '8.2 MB',
      status: 'approved',
    },
    {
      id: '3',
      permitId: '2',
      name: 'Electrical Layout.pdf',
      type: 'Electrical Plans',
      uploadDate: '2024-03-01',
      size: '1.8 MB',
      status: 'pending',
    },
  ];

  const reminders: Reminder[] = [
    {
      id: '1',
      permitId: '1',
      type: 'expiry',
      date: '2024-12-15',
      message: 'Building permit BP-2024-001234 expires in 30 days',
      isRead: false,
    },
    {
      id: '2',
      permitId: '2',
      type: 'inspection',
      date: '2024-04-25',
      message: 'Electrical inspection scheduled for tomorrow',
      isRead: false,
    },
  ];

  return { permits, inspections, documents, reminders };
};

export const PermitTrackerTool: React.FC<PermitTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data: permits,
    setData: setPermits,
    addItem: addPermit,
    updateItem: updatePermit,
    deleteItem: deletePermitItem,
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
  } = useToolData<Permit>('permit-tracker', [], PERMIT_COLUMNS);

  // Related data state (stored with permits or locally)
  const [activeTab, setActiveTab] = useState<TabType>('permits');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PermitType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PermitStatus | 'all'>('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [showPermitForm, setShowPermitForm] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [editingPermit, setEditingPermit] = useState<Permit | null>(null);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Permit form state
  const [permitForm, setPermitForm] = useState({
    permitNumber: '',
    type: 'building' as PermitType,
    projectName: '',
    address: '',
    applicant: '',
    fee: '',
    status: 'draft' as PermitStatus,
    applicationDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    description: '',
    notes: '',
  });

  // Inspection form state
  const [inspectionForm, setInspectionForm] = useState({
    permitId: '',
    type: 'Foundation',
    scheduledDate: '',
    scheduledTime: '',
    inspector: '',
    notes: '',
  });

  // Document form state
  const [documentForm, setDocumentForm] = useState({
    permitId: '',
    name: '',
    type: '',
    size: '',
  });

  // Load related data (inspections, documents, reminders) from localStorage
  // Permits are handled by useToolData hook
  useEffect(() => {
    const saved = localStorage.getItem('permit-tracker-related');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setInspections(data.inspections || []);
        setDocuments(data.documents || []);
        setReminders(data.reminders || []);
      } catch {
        const sampleData = generateSampleData();
        setInspections(sampleData.inspections);
        setDocuments(sampleData.documents);
        setReminders(sampleData.reminders);
      }
    } else {
      const sampleData = generateSampleData();
      setInspections(sampleData.inspections);
      setDocuments(sampleData.documents);
      setReminders(sampleData.reminders);
    }
  }, []);

  // Initialize sample permits if none exist after loading
  useEffect(() => {
    if (!isLoading && permits.length === 0) {
      const sampleData = generateSampleData();
      sampleData.permits.forEach(permit => addPermit(permit));
    }
  }, [isLoading, permits.length, addPermit]);

  // Save related data to localStorage
  useEffect(() => {
    if (inspections.length > 0 || documents.length > 0 || reminders.length > 0) {
      localStorage.setItem('permit-tracker-related', JSON.stringify({ inspections, documents, reminders }));
    }
  }, [inspections, documents, reminders]);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.text || params.content) {
        setPermitForm((prev) => ({
          ...prev,
          projectName: params.title || prev.projectName,
          description: params.text || params.content || prev.description,
        }));
        setShowPermitForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered permits
  const filteredPermits = useMemo(() => {
    return permits.filter((permit) => {
      const matchesSearch =
        searchTerm === '' ||
        permit.permitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.applicant.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || permit.type === filterType;
      const matchesStatus = filterStatus === 'all' || permit.status === filterStatus;

      const matchesDateRange =
        (!dateRangeStart || permit.applicationDate >= dateRangeStart) &&
        (!dateRangeEnd || permit.applicationDate <= dateRangeEnd);

      return matchesSearch && matchesType && matchesStatus && matchesDateRange;
    });
  }, [permits, searchTerm, filterType, filterStatus, dateRangeStart, dateRangeEnd]);

  // Statistics
  const stats = useMemo(() => {
    const total = permits.length;
    const approved = permits.filter((p) => p.status === 'approved').length;
    const pending = permits.filter((p) => ['submitted', 'under-review'].includes(p.status)).length;
    const expiringSoon = permits.filter((p) => {
      const expiry = new Date(p.expiryDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30 && p.status === 'approved';
    }).length;
    const totalFees = permits.reduce((sum, p) => sum + p.fee, 0);

    return { total, approved, pending, expiringSoon, totalFees };
  }, [permits]);

  // Handlers
  const handleAddPermit = () => {
    if (editingPermit) {
      updatePermit(editingPermit.id, {
        permitNumber: permitForm.permitNumber || editingPermit.permitNumber,
        type: permitForm.type,
        projectName: permitForm.projectName,
        address: permitForm.address,
        applicant: permitForm.applicant,
        fee: parseFloat(permitForm.fee) || 0,
        status: permitForm.status,
        applicationDate: permitForm.applicationDate,
        expiryDate: permitForm.expiryDate,
        description: permitForm.description,
        notes: permitForm.notes,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newPermit: Permit = {
        id: Date.now().toString(),
        permitNumber: permitForm.permitNumber || `P-${Date.now()}`,
        type: permitForm.type,
        projectName: permitForm.projectName,
        address: permitForm.address,
        applicant: permitForm.applicant,
        fee: parseFloat(permitForm.fee) || 0,
        status: permitForm.status,
        applicationDate: permitForm.applicationDate,
        expiryDate: permitForm.expiryDate,
        description: permitForm.description,
        notes: permitForm.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addPermit(newPermit);
    }

    resetPermitForm();
  };

  const handleEditPermit = (permit: Permit) => {
    setEditingPermit(permit);
    setPermitForm({
      permitNumber: permit.permitNumber,
      type: permit.type,
      projectName: permit.projectName,
      address: permit.address,
      applicant: permit.applicant,
      fee: permit.fee.toString(),
      status: permit.status,
      applicationDate: permit.applicationDate,
      expiryDate: permit.expiryDate,
      description: permit.description,
      notes: permit.notes,
    });
    setShowPermitForm(true);
  };

  const handleDeletePermit = (id: string) => {
    deletePermitItem(id);
    setInspections(inspections.filter((i) => i.permitId !== id));
    setDocuments(documents.filter((d) => d.permitId !== id));
    setReminders(reminders.filter((r) => r.permitId !== id));
  };

  const resetPermitForm = () => {
    setPermitForm({
      permitNumber: '',
      type: 'building',
      projectName: '',
      address: '',
      applicant: '',
      fee: '',
      status: 'draft',
      applicationDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      description: '',
      notes: '',
    });
    setShowPermitForm(false);
    setEditingPermit(null);
  };

  const handleAddInspection = () => {
    const newInspection: Inspection = {
      id: Date.now().toString(),
      permitId: inspectionForm.permitId,
      type: inspectionForm.type,
      scheduledDate: inspectionForm.scheduledDate,
      scheduledTime: inspectionForm.scheduledTime,
      inspector: inspectionForm.inspector,
      status: 'scheduled',
      notes: inspectionForm.notes,
      createdAt: new Date().toISOString(),
    };

    setInspections([newInspection, ...inspections]);
    setInspectionForm({
      permitId: '',
      type: 'Foundation',
      scheduledDate: '',
      scheduledTime: '',
      inspector: '',
      notes: '',
    });
    setShowInspectionForm(false);
  };

  const handleDeleteInspection = (id: string) => {
    setInspections(inspections.filter((i) => i.id !== id));
  };

  const handleUpdateInspectionStatus = (id: string, status: Inspection['status']) => {
    setInspections(inspections.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const handleAddDocument = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      permitId: documentForm.permitId,
      name: documentForm.name,
      type: documentForm.type,
      uploadDate: new Date().toISOString().split('T')[0],
      size: documentForm.size || '1.0 MB',
      status: 'pending',
    };

    setDocuments([newDocument, ...documents]);
    setDocumentForm({
      permitId: '',
      name: '',
      type: '',
      size: '',
    });
    setShowDocumentForm(false);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  const handleUpdateDocumentStatus = (id: string, status: Document['status']) => {
    setDocuments(documents.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  // Export handlers using useToolData hook
  const handleExportCSV = () => {
    exportCSV({ filename: 'permits' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'permits' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'permits' });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'permits',
      title: 'Permit Tracker Report',
      subtitle: `${filteredPermits.length} permits`,
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    print('Permit Tracker Report');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  // Styling classes
  const cardClass = `rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;
  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`;
  const buttonPrimary = 'px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors flex items-center gap-2';
  const buttonSecondary = `px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  const getStatusBadge = (status: PermitStatus) => {
    const statusConfig = PERMIT_STATUSES.find((s) => s.value === status);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${statusConfig?.color}`}>
        {statusConfig?.icon}
        {statusConfig?.label}
      </span>
    );
  };

  const getTypeBadge = (type: PermitType) => {
    const typeConfig = PERMIT_TYPES.find((t) => t.value === type);
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${typeConfig?.color}`}>
        {typeConfig?.label}
      </span>
    );
  };

  const getInspectionStatusColor = (status: Inspection['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-500 bg-green-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      case 'cancelled':
        return 'text-gray-500 bg-gray-500/10';
      case 'rescheduled':
        return 'text-amber-500 bg-amber-500/10';
      default:
        return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getDocumentStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return 'text-green-500 bg-green-500/10';
      case 'rejected':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-amber-500 bg-amber-500/10';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.permitTracker.loadingPermits', 'Loading permits...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.permitTracker.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={cardClass}>
          <div className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-xl">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.permitTracker.permitTracker', 'Permit Tracker')}</h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.permitTracker.constructionGovernmentPermitManagement', 'Construction & Government Permit Management')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <WidgetEmbedButton toolSlug="permit-tracker" toolName="Permit Tracker" />

                <SyncStatus
                  isSynced={isSynced}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  syncError={syncError}
                  onForceSync={forceSync}
                  theme={isDark ? 'dark' : 'light'}
                  size="sm"
                />
                {reminders.filter((r) => !r.isRead).length > 0 && (
                  <button className="relative p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {reminders.filter((r) => !r.isRead).length}
                    </span>
                  </button>
                )}
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportExcel={handleExportExcel}
                  onExportJSON={handleExportJSON}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                  onCopyToClipboard={handleCopyToClipboard}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                />
                <button onClick={() => setShowPermitForm(true)} className={buttonPrimary}>
                  <Plus className="w-5 h-5" />
                  {t('tools.permitTracker.newPermit', 'New Permit')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.totalPermits', 'Total Permits')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.approved', 'Approved')}</p>
                <p className={`text-2xl font-bold text-green-500`}>{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.pending', 'Pending')}</p>
                <p className={`text-2xl font-bold text-amber-500`}>{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.expiringSoon', 'Expiring Soon')}</p>
                <p className={`text-2xl font-bold text-red-500`}>{stats.expiringSoon}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.totalFees', 'Total Fees')}</p>
                <p className={`text-2xl font-bold text-purple-500`}>${stats.totalFees.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={cardClass}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['permits', 'inspections', 'documents', 'reports'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
                    : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'permits' && <FileText className="w-4 h-4 inline mr-2" />}
                {tab === 'inspections' && <ClipboardCheck className="w-4 h-4 inline mr-2" />}
                {tab === 'documents' && <FileCheck className="w-4 h-4 inline mr-2" />}
                {tab === 'reports' && <BarChart3 className="w-4 h-4 inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Permits Tab */}
            {activeTab === 'permits' && (
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder={t('tools.permitTracker.searchPermits', 'Search permits...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <button onClick={() => setShowFilters(!showFilters)} className={buttonSecondary}>
                    <Filter className="w-5 h-5" />
                    Filters
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.permitType', 'Permit Type')}</label>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value as PermitType | 'all')} className={inputClass}>
                          <option value="all">{t('tools.permitTracker.allTypes', 'All Types')}</option>
                          {PERMIT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.status', 'Status')}</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as PermitStatus | 'all')} className={inputClass}>
                          <option value="all">{t('tools.permitTracker.allStatuses', 'All Statuses')}</option>
                          {PERMIT_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.fromDate', 'From Date')}</label>
                        <input type="date" value={dateRangeStart} onChange={(e) => setDateRangeStart(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.toDate', 'To Date')}</label>
                        <input type="date" value={dateRangeEnd} onChange={(e) => setDateRangeEnd(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Permit List */}
                <div className="space-y-3">
                  {filteredPermits.length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">{t('tools.permitTracker.noPermitsFound', 'No permits found')}</p>
                      <p className="text-sm">{t('tools.permitTracker.addANewPermitOr', 'Add a new permit or adjust your filters')}</p>
                    </div>
                  ) : (
                    filteredPermits.map((permit) => (
                      <div
                        key={permit.id}
                        className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{permit.permitNumber}</span>
                              {getTypeBadge(permit.type)}
                              {getStatusBadge(permit.status)}
                            </div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{permit.projectName}</h3>
                            <div className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {permit.address}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {permit.applicant}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />${permit.fee.toLocaleString()}
                              </span>
                            </div>
                            <div className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Applied: {permit.applicationDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                Expires: {permit.expiryDate || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedPermit(permit)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                              <Eye className="w-5 h-5 text-blue-500" />
                            </button>
                            <button onClick={() => handleEditPermit(permit)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                              <Edit2 className="w-5 h-5 text-amber-500" />
                            </button>
                            <button onClick={() => handleDeletePermit(permit.id)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Inspections Tab */}
            {activeTab === 'inspections' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.permitTracker.scheduledInspections', 'Scheduled Inspections')}</h3>
                  <button onClick={() => setShowInspectionForm(true)} className={buttonPrimary}>
                    <Plus className="w-5 h-5" />
                    {t('tools.permitTracker.scheduleInspection', 'Schedule Inspection')}
                  </button>
                </div>

                {/* Inspection Form */}
                {showInspectionForm && (
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.permit', 'Permit')}</label>
                        <select value={inspectionForm.permitId} onChange={(e) => setInspectionForm({ ...inspectionForm, permitId: e.target.value })} className={inputClass}>
                          <option value="">{t('tools.permitTracker.selectPermit', 'Select Permit')}</option>
                          {permits.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.permitNumber} - {p.projectName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.inspectionType', 'Inspection Type')}</label>
                        <select value={inspectionForm.type} onChange={(e) => setInspectionForm({ ...inspectionForm, type: e.target.value })} className={inputClass}>
                          {INSPECTION_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.date', 'Date')}</label>
                        <input
                          type="date"
                          value={inspectionForm.scheduledDate}
                          onChange={(e) => setInspectionForm({ ...inspectionForm, scheduledDate: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.time', 'Time')}</label>
                        <input
                          type="time"
                          value={inspectionForm.scheduledTime}
                          onChange={(e) => setInspectionForm({ ...inspectionForm, scheduledTime: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.inspector', 'Inspector')}</label>
                        <input
                          type="text"
                          placeholder={t('tools.permitTracker.inspectorName', 'Inspector name')}
                          value={inspectionForm.inspector}
                          onChange={(e) => setInspectionForm({ ...inspectionForm, inspector: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.notes', 'Notes')}</label>
                        <input
                          type="text"
                          placeholder={t('tools.permitTracker.additionalNotes', 'Additional notes')}
                          value={inspectionForm.notes}
                          onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={handleAddInspection} disabled={!inspectionForm.permitId || !inspectionForm.scheduledDate} className={buttonPrimary}>
                        {t('tools.permitTracker.schedule', 'Schedule')}
                      </button>
                      <button onClick={() => setShowInspectionForm(false)} className={buttonSecondary}>
                        {t('tools.permitTracker.cancel', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Inspection List */}
                <div className="space-y-3">
                  {inspections.length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">{t('tools.permitTracker.noInspectionsScheduled', 'No inspections scheduled')}</p>
                      <p className="text-sm">{t('tools.permitTracker.scheduleAnInspectionForA', 'Schedule an inspection for a permit')}</p>
                    </div>
                  ) : (
                    inspections.map((inspection) => {
                      const permit = permits.find((p) => p.id === inspection.permitId);
                      return (
                        <div
                          key={inspection.id}
                          className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{inspection.type}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getInspectionStatusColor(inspection.status)}`}>
                                  {inspection.status}
                                </span>
                              </div>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Permit: {permit?.permitNumber || 'N/A'} - {permit?.projectName || 'N/A'}
                              </p>
                              <div className={`flex flex-wrap items-center gap-4 text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {inspection.scheduledDate} at {inspection.scheduledTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {inspection.inspector}
                                </span>
                              </div>
                              {inspection.notes && <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{inspection.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {inspection.status === 'scheduled' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateInspectionStatus(inspection.id, 'passed')}
                                    className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                                  >
                                    {t('tools.permitTracker.pass', 'Pass')}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateInspectionStatus(inspection.id, 'failed')}
                                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                                  >
                                    {t('tools.permitTracker.fail', 'Fail')}
                                  </button>
                                </>
                              )}
                              <button onClick={() => handleDeleteInspection(inspection.id)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                                <Trash2 className="w-5 h-5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.permitTracker.documentAttachments', 'Document Attachments')}</h3>
                  <button onClick={() => setShowDocumentForm(true)} className={buttonPrimary}>
                    <Upload className="w-5 h-5" />
                    {t('tools.permitTracker.addDocument', 'Add Document')}
                  </button>
                </div>

                {/* Document Form */}
                {showDocumentForm && (
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.permit2', 'Permit')}</label>
                        <select value={documentForm.permitId} onChange={(e) => setDocumentForm({ ...documentForm, permitId: e.target.value })} className={inputClass}>
                          <option value="">{t('tools.permitTracker.selectPermit2', 'Select Permit')}</option>
                          {permits.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.permitNumber} - {p.projectName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.documentName', 'Document Name')}</label>
                        <input
                          type="text"
                          placeholder={t('tools.permitTracker.eGSitePlanPdf', 'e.g., Site Plan.pdf')}
                          value={documentForm.name}
                          onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.documentType', 'Document Type')}</label>
                        <input
                          type="text"
                          placeholder={t('tools.permitTracker.eGSitePlanBlueprint', 'e.g., Site Plan, Blueprint')}
                          value={documentForm.type}
                          onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('tools.permitTracker.fileSize', 'File Size')}</label>
                        <input
                          type="text"
                          placeholder={t('tools.permitTracker.eG25Mb', 'e.g., 2.5 MB')}
                          value={documentForm.size}
                          onChange={(e) => setDocumentForm({ ...documentForm, size: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={handleAddDocument} disabled={!documentForm.permitId || !documentForm.name} className={buttonPrimary}>
                        {t('tools.permitTracker.addDocument2', 'Add Document')}
                      </button>
                      <button onClick={() => setShowDocumentForm(false)} className={buttonSecondary}>
                        {t('tools.permitTracker.cancel2', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Document List */}
                <div className="overflow-x-auto">
                  {documents.length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">{t('tools.permitTracker.noDocumentsUploaded', 'No documents uploaded')}</p>
                      <p className="text-sm">{t('tools.permitTracker.addDocumentsToTrackPermit', 'Add documents to track permit attachments')}</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.permitTracker.document', 'Document')}</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.permitTracker.permit3', 'Permit')}</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.permitTracker.type', 'Type')}</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.permitTracker.size', 'Size')}</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.permitTracker.status2', 'Status')}</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.permitTracker.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => {
                          const permit = permits.find((p) => p.id === doc.permitId);
                          return (
                            <tr key={doc.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-blue-500" />
                                  {doc.name}
                                </div>
                              </td>
                              <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{permit?.permitNumber || 'N/A'}</td>
                              <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{doc.type}</td>
                              <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{doc.size}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDocumentStatusColor(doc.status)}`}>
                                  {doc.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {doc.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateDocumentStatus(doc.id, 'approved')}
                                        className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleUpdateDocumentStatus(doc.id, 'rejected')}
                                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  <button onClick={() => handleDeleteDocument(doc.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.permitTracker.reportsAnalytics', 'Reports & Analytics')}</h3>

                {/* Permits by Type */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.permitTracker.permitsByType', 'Permits by Type')}</h4>
                  <div className="space-y-3">
                    {PERMIT_TYPES.map((type) => {
                      const count = permits.filter((p) => p.type === type.value).length;
                      const percentage = permits.length > 0 ? (count / permits.length) * 100 : 0;
                      return (
                        <div key={type.value} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${type.color}`} />
                          <span className={`w-24 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{type.label}</span>
                          <div className={`flex-1 h-4 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <div className={`h-full rounded-full ${type.color}`} style={{ width: `${percentage}%` }} />
                          </div>
                          <span className={`w-12 text-sm text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Permits by Status */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.permitTracker.permitsByStatus', 'Permits by Status')}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {PERMIT_STATUSES.map((status) => {
                      const count = permits.filter((p) => p.status === status.value).length;
                      return (
                        <div key={status.value} className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${status.color} text-white mb-2`}>
                            {status.icon}
                          </div>
                          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{status.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upcoming Expirations */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.permitTracker.upcomingExpirationsNext60Days', 'Upcoming Expirations (Next 60 Days)')}</h4>
                  <div className="space-y-2">
                    {permits
                      .filter((p) => {
                        const expiry = new Date(p.expiryDate);
                        const now = new Date();
                        const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return daysUntilExpiry > 0 && daysUntilExpiry <= 60 && p.status === 'approved';
                      })
                      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                      .map((permit) => {
                        const daysUntilExpiry = Math.ceil(
                          (new Date(permit.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return (
                          <div
                            key={permit.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-white'}`}
                          >
                            <div>
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{permit.permitNumber}</span>
                              <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{permit.projectName}</span>
                            </div>
                            <span className={`text-sm font-medium ${daysUntilExpiry <= 7 ? 'text-red-500' : daysUntilExpiry <= 30 ? 'text-amber-500' : 'text-green-500'}`}>
                              {daysUntilExpiry} days left
                            </span>
                          </div>
                        );
                      })}
                    {permits.filter((p) => {
                      const expiry = new Date(p.expiryDate);
                      const now = new Date();
                      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      return daysUntilExpiry > 0 && daysUntilExpiry <= 60 && p.status === 'approved';
                    }).length === 0 && (
                      <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.noPermitsExpiringInThe', 'No permits expiring in the next 60 days')}</p>
                    )}
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify({ permits, inspections, documents }, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `permit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className={buttonSecondary}
                  >
                    <Download className="w-5 h-5" />
                    {t('tools.permitTracker.exportData', 'Export Data')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Permit Form Modal */}
        {showPermitForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingPermit ? t('tools.permitTracker.editPermit2', 'Edit Permit') : t('tools.permitTracker.newPermitApplication', 'New Permit Application')}
                </h3>
                <button onClick={resetPermitForm} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.permitTracker.permitNumber', 'Permit Number')}</label>
                    <input
                      type="text"
                      placeholder={t('tools.permitTracker.autoGeneratedIfEmpty', 'Auto-generated if empty')}
                      value={permitForm.permitNumber}
                      onChange={(e) => setPermitForm({ ...permitForm, permitNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.permitTracker.permitType2', 'Permit Type *')}</label>
                    <select
                      value={permitForm.type}
                      onChange={(e) => setPermitForm({ ...permitForm, type: e.target.value as PermitType })}
                      className={inputClass}
                    >
                      {PERMIT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.permitTracker.projectName', 'Project Name *')}</label>
                    <input
                      type="text"
                      placeholder={t('tools.permitTracker.enterProjectName', 'Enter project name')}
                      value={permitForm.projectName}
                      onChange={(e) => setPermitForm({ ...permitForm, projectName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.permitTracker.address', 'Address *')}</label>
                    <input
                      type="text"
                      placeholder={t('tools.permitTracker.enterProjectAddress', 'Enter project address')}
                      value={permitForm.address}
                      onChange={(e) => setPermitForm({ ...permitForm, address: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.permitTracker.applicantName', 'Applicant Name *')}</label>
                    <input
                      type="text"
                      placeholder={t('tools.permitTracker.enterApplicantName', 'Enter applicant name')}
                      value={permitForm.applicant}
                      onChange={(e) => setPermitForm({ ...permitForm, applicant: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.permitTracker.permitFee', 'Permit Fee ($)')}</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={permitForm.fee}
                      onChange={(e) => setPermitForm({ ...permitForm, fee: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.permitTracker.status3', 'Status')}</label>
                    <select
                      value={permitForm.status}
                      onChange={(e) => setPermitForm({ ...permitForm, status: e.target.value as PermitStatus })}
                      className={inputClass}
                    >
                      {PERMIT_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.permitTracker.applicationDate', 'Application Date')}</label>
                    <input
                      type="date"
                      value={permitForm.applicationDate}
                      onChange={(e) => setPermitForm({ ...permitForm, applicationDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.permitTracker.expiryDate', 'Expiry Date')}</label>
                    <input
                      type="date"
                      value={permitForm.expiryDate}
                      onChange={(e) => setPermitForm({ ...permitForm, expiryDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.permitTracker.description', 'Description')}</label>
                    <textarea
                      placeholder={t('tools.permitTracker.enterProjectDescription', 'Enter project description')}
                      value={permitForm.description}
                      onChange={(e) => setPermitForm({ ...permitForm, description: e.target.value })}
                      className={`${inputClass} min-h-[80px]`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t('tools.permitTracker.notes2', 'Notes')}</label>
                    <textarea
                      placeholder={t('tools.permitTracker.additionalNotes2', 'Additional notes')}
                      value={permitForm.notes}
                      onChange={(e) => setPermitForm({ ...permitForm, notes: e.target.value })}
                      className={`${inputClass} min-h-[60px]`}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddPermit}
                    disabled={!permitForm.projectName || !permitForm.address || !permitForm.applicant}
                    className={`flex-1 ${buttonPrimary} justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {editingPermit ? t('tools.permitTracker.updatePermit', 'Update Permit') : t('tools.permitTracker.createPermit', 'Create Permit')}
                  </button>
                  <button onClick={resetPermitForm} className={buttonSecondary}>
                    {t('tools.permitTracker.cancel3', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permit Detail Modal */}
        {selectedPermit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{selectedPermit.permitNumber}</span>
                  {getTypeBadge(selectedPermit.type)}
                  {getStatusBadge(selectedPermit.status)}
                </div>
                <button onClick={() => setSelectedPermit(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPermit.projectName}</h2>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedPermit.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.address2', 'Address')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPermit.address}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.applicant', 'Applicant')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPermit.applicant}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.permitFee2', 'Permit Fee')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${selectedPermit.fee.toLocaleString()}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.applicationDate2', 'Application Date')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPermit.applicationDate}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.expiryDate2', 'Expiry Date')}</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPermit.expiryDate || 'N/A'}</p>
                  </div>
                </div>

                {selectedPermit.notes && (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.notes3', 'Notes')}</p>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPermit.notes}</p>
                  </div>
                )}

                {/* Related Inspections */}
                <div>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.permitTracker.relatedInspections', 'Related Inspections')}</h4>
                  <div className="space-y-2">
                    {inspections.filter((i) => i.permitId === selectedPermit.id).length === 0 ? (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.noInspectionsScheduled2', 'No inspections scheduled')}</p>
                    ) : (
                      inspections
                        .filter((i) => i.permitId === selectedPermit.id)
                        .map((inspection) => (
                          <div key={inspection.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div>
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{inspection.type}</span>
                              <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {inspection.scheduledDate} at {inspection.scheduledTime}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getInspectionStatusColor(inspection.status)}`}>
                              {inspection.status}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Related Documents */}
                <div>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.permitTracker.relatedDocuments', 'Related Documents')}</h4>
                  <div className="space-y-2">
                    {documents.filter((d) => d.permitId === selectedPermit.id).length === 0 ? (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.permitTracker.noDocumentsAttached', 'No documents attached')}</p>
                    ) : (
                      documents
                        .filter((d) => d.permitId === selectedPermit.id)
                        .map((doc) => (
                          <div key={doc.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{doc.name}</span>
                              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>({doc.size})</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDocumentStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => handleEditPermit(selectedPermit)} className={buttonPrimary}>
                    <Edit2 className="w-4 h-4" />
                    {t('tools.permitTracker.editPermit', 'Edit Permit')}
                  </button>
                  <button onClick={() => setSelectedPermit(null)} className={buttonSecondary}>
                    {t('tools.permitTracker.close', 'Close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermitTrackerTool;
