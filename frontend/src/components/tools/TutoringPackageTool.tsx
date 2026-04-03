'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
  Clock,
  User,
  DollarSign,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Filter,
  Loader2,
  Tag,
  Percent,
  CreditCard,
  Gift,
  Timer,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
type PackageStatus = 'active' | 'completed' | 'expired' | 'cancelled' | 'paused';
type PaymentStatus = 'paid' | 'partial' | 'pending' | 'refunded';
type BillingFrequency = 'one_time' | 'weekly' | 'monthly' | 'per_session';

interface SessionRecord {
  id: string;
  date: string;
  duration: number;
  subject: string;
  notes: string;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  notes: string;
}

interface TutoringPackage {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  packageName: string;
  description: string;
  subjects: string[];
  totalSessions: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  sessionDuration: number; // minutes
  pricePerSession: number;
  totalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  billingFrequency: BillingFrequency;
  status: PackageStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  amountDue: number;
  startDate: string;
  endDate: string;
  expirationDate?: string;
  isRenewable: boolean;
  autoRenew: boolean;
  sessionRecords: SessionRecord[];
  payments: Payment[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PackageTemplate {
  id: string;
  name: string;
  sessions: number;
  sessionDuration: number;
  pricePerSession: number;
  discountPercent: number;
  description: string;
}

const SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Computer Science',
  'French',
  'Spanish',
  'German',
  'Music',
  'Art',
  'Economics',
  'SAT Prep',
  'ACT Prep',
  'Essay Writing',
];

const DEFAULT_TEMPLATES: PackageTemplate[] = [
  { id: '1', name: 'Single Session', sessions: 1, sessionDuration: 60, pricePerSession: 50, discountPercent: 0, description: 'Try-out session' },
  { id: '2', name: '4-Session Pack', sessions: 4, sessionDuration: 60, pricePerSession: 50, discountPercent: 5, description: 'Monthly starter package' },
  { id: '3', name: '8-Session Pack', sessions: 8, sessionDuration: 60, pricePerSession: 50, discountPercent: 10, description: 'Two-month package' },
  { id: '4', name: '12-Session Pack', sessions: 12, sessionDuration: 60, pricePerSession: 50, discountPercent: 15, description: 'Three-month package' },
  { id: '5', name: 'Semester Package', sessions: 20, sessionDuration: 60, pricePerSession: 50, discountPercent: 20, description: 'Full semester coverage' },
];

const PAYMENT_METHODS = ['Cash', 'Check', 'Credit Card', 'Debit Card', 'Venmo', 'PayPal', 'Zelle', 'Bank Transfer'];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Column configuration for exports and useToolData hook
const COLUMNS: ColumnConfig[] = [
  { key: 'studentName', header: 'Student Name', type: 'string' },
  { key: 'packageName', header: 'Package', type: 'string' },
  { key: 'subjects', header: 'Subjects', type: 'string', format: (value: string[]) => Array.isArray(value) ? value.join(', ') : String(value || '') },
  { key: 'totalSessions', header: 'Total Sessions', type: 'number' },
  { key: 'sessionsUsed', header: 'Sessions Used', type: 'number' },
  { key: 'sessionsRemaining', header: 'Sessions Left', type: 'number' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'discountPercent', header: 'Discount %', type: 'number' },
  { key: 'finalPrice', header: 'Final Price', type: 'currency' },
  { key: 'amountPaid', header: 'Paid', type: 'currency' },
  { key: 'amountDue', header: 'Due', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'paymentStatus', header: 'Payment Status', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

interface TutoringPackageToolProps {
  uiConfig?: UIConfig;
}

export const TutoringPackageTool: React.FC<TutoringPackageToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: packages,
    setData: setPackages,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<TutoringPackage>('tutoring-packages', [], COLUMNS);

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'view' | 'templates'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<PackageStatus | 'all'>('all');
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | 'all'>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sessions: true,
    payments: true,
  });

  // Form states
  const [formData, setFormData] = useState<Partial<TutoringPackage>>({
    studentName: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    packageName: '',
    description: '',
    subjects: [],
    totalSessions: 4,
    sessionsUsed: 0,
    sessionsRemaining: 4,
    sessionDuration: 60,
    pricePerSession: 50,
    totalPrice: 200,
    discountPercent: 0,
    discountAmount: 0,
    finalPrice: 200,
    billingFrequency: 'one_time',
    status: 'active',
    paymentStatus: 'pending',
    amountPaid: 0,
    amountDue: 200,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isRenewable: true,
    autoRenew: false,
    sessionRecords: [],
    payments: [],
    notes: '',
  });

  const [templates, setTemplates] = useState<PackageTemplate[]>(DEFAULT_TEMPLATES);
  const [newSession, setNewSession] = useState({ date: '', duration: 60, subject: '', notes: '' });
  const [newPayment, setNewPayment] = useState({ date: '', amount: 0, method: 'Cash', notes: '' });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.studentName || params.student) {
        setFormData((prev) => ({
          ...prev,
          studentName: params.studentName || params.student || '',
          parentName: params.parentName || '',
          parentEmail: params.parentEmail || '',
          parentPhone: params.parentPhone || '',
        }));
        setActiveTab('add');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate prices when values change
  useEffect(() => {
    const totalPrice = (formData.totalSessions || 0) * (formData.pricePerSession || 0);
    const discountAmount = totalPrice * ((formData.discountPercent || 0) / 100);
    const finalPrice = totalPrice - discountAmount;
    const amountDue = finalPrice - (formData.amountPaid || 0);
    const sessionsRemaining = (formData.totalSessions || 0) - (formData.sessionsUsed || 0);

    setFormData((prev) => ({
      ...prev,
      totalPrice,
      discountAmount,
      finalPrice,
      amountDue,
      sessionsRemaining,
    }));
  }, [formData.totalSessions, formData.pricePerSession, formData.discountPercent, formData.amountPaid, formData.sessionsUsed]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
      const matchesPayment = filterPayment === 'all' || pkg.paymentStatus === filterPayment;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [packages, searchQuery, filterStatus, filterPayment]);

  const selectedPackage = selectedPackageId ? packages.find((p) => p.id === selectedPackageId) : null;

  // Handlers
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const applyTemplate = (template: PackageTemplate) => {
    const totalPrice = template.sessions * template.pricePerSession;
    const discountAmount = totalPrice * (template.discountPercent / 100);
    const finalPrice = totalPrice - discountAmount;

    setFormData((prev) => ({
      ...prev,
      packageName: template.name,
      description: template.description,
      totalSessions: template.sessions,
      sessionsRemaining: template.sessions,
      sessionDuration: template.sessionDuration,
      pricePerSession: template.pricePerSession,
      discountPercent: template.discountPercent,
      totalPrice,
      discountAmount,
      finalPrice,
      amountDue: finalPrice,
    }));
    setActiveTab('add');
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => {
      const subjects = prev.subjects || [];
      if (subjects.includes(subject)) {
        return { ...prev, subjects: subjects.filter((s) => s !== subject) };
      } else {
        return { ...prev, subjects: [...subjects, subject] };
      }
    });
  };

  const addSessionRecord = () => {
    if (newSession.date && newSession.subject) {
      setFormData((prev) => ({
        ...prev,
        sessionRecords: [...(prev.sessionRecords || []), { id: generateId(), ...newSession }],
        sessionsUsed: (prev.sessionsUsed || 0) + 1,
      }));
      setNewSession({ date: '', duration: 60, subject: '', notes: '' });
    }
  };

  const removeSessionRecord = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      sessionRecords: (prev.sessionRecords || []).filter((s) => s.id !== id),
      sessionsUsed: Math.max(0, (prev.sessionsUsed || 0) - 1),
    }));
  };

  const addPaymentRecord = () => {
    if (newPayment.date && newPayment.amount > 0) {
      setFormData((prev) => ({
        ...prev,
        payments: [...(prev.payments || []), { id: generateId(), ...newPayment }],
        amountPaid: (prev.amountPaid || 0) + newPayment.amount,
      }));
      setNewPayment({ date: '', amount: 0, method: 'Cash', notes: '' });
    }
  };

  const removePaymentRecord = (id: string) => {
    const payment = (formData.payments || []).find((p) => p.id === id);
    if (payment) {
      setFormData((prev) => ({
        ...prev,
        payments: (prev.payments || []).filter((p) => p.id !== id),
        amountPaid: Math.max(0, (prev.amountPaid || 0) - payment.amount),
      }));
    }
  };

  const handleSavePackage = async () => {
    if (!formData.studentName || !formData.packageName) {
      setValidationMessage('Please fill in required fields: Student Name and Package Name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();

    // Determine payment status
    let paymentStatus: PaymentStatus = 'pending';
    if ((formData.amountPaid || 0) >= (formData.finalPrice || 0)) {
      paymentStatus = 'paid';
    } else if ((formData.amountPaid || 0) > 0) {
      paymentStatus = 'partial';
    }

    const packageData: TutoringPackage = {
      id: selectedPackageId || generateId(),
      studentId: generateId(),
      studentName: formData.studentName || '',
      parentName: formData.parentName || '',
      parentEmail: formData.parentEmail || '',
      parentPhone: formData.parentPhone || '',
      packageName: formData.packageName || '',
      description: formData.description || '',
      subjects: formData.subjects || [],
      totalSessions: formData.totalSessions || 0,
      sessionsUsed: formData.sessionsUsed || 0,
      sessionsRemaining: formData.sessionsRemaining || 0,
      sessionDuration: formData.sessionDuration || 60,
      pricePerSession: formData.pricePerSession || 0,
      totalPrice: formData.totalPrice || 0,
      discountPercent: formData.discountPercent || 0,
      discountAmount: formData.discountAmount || 0,
      finalPrice: formData.finalPrice || 0,
      billingFrequency: formData.billingFrequency || 'one_time',
      status: formData.status || 'active',
      paymentStatus,
      amountPaid: formData.amountPaid || 0,
      amountDue: formData.amountDue || 0,
      startDate: formData.startDate || now.split('T')[0],
      endDate: formData.endDate || '',
      expirationDate: formData.expirationDate,
      isRenewable: formData.isRenewable ?? true,
      autoRenew: formData.autoRenew ?? false,
      sessionRecords: formData.sessionRecords || [],
      payments: formData.payments || [],
      notes: formData.notes || '',
      createdAt: selectedPackageId
        ? packages.find((p) => p.id === selectedPackageId)?.createdAt || now
        : now,
      updatedAt: now,
    };

    if (selectedPackageId) {
      await updateItem(selectedPackageId, packageData);
    } else {
      await addItem(packageData);
    }

    resetForm();
    setActiveTab('list');
  };

  const handleDeletePackage = async (id: string) => {
    const confirmed = await confirm('Are you sure you want to delete this package?');
    if (confirmed) {
      await deleteItem(id);
      if (selectedPackageId === id) {
        setSelectedPackageId(null);
        setActiveTab('list');
      }
    }
  };

  const handleEditPackage = (pkg: TutoringPackage) => {
    setFormData(pkg);
    setSelectedPackageId(pkg.id);
    setActiveTab('add');
  };

  const handleViewPackage = (pkg: TutoringPackage) => {
    setSelectedPackageId(pkg.id);
    setActiveTab('view');
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      packageName: '',
      description: '',
      subjects: [],
      totalSessions: 4,
      sessionsUsed: 0,
      sessionsRemaining: 4,
      sessionDuration: 60,
      pricePerSession: 50,
      totalPrice: 200,
      discountPercent: 0,
      discountAmount: 0,
      finalPrice: 200,
      billingFrequency: 'one_time',
      status: 'active',
      paymentStatus: 'pending',
      amountPaid: 0,
      amountDue: 200,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isRenewable: true,
      autoRenew: false,
      sessionRecords: [],
      payments: [],
      notes: '',
    });
    setSelectedPackageId(null);
  };

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPaymentColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Stats
  const stats = useMemo(() => {
    const active = packages.filter((p) => p.status === 'active').length;
    const totalRevenue = packages.reduce((sum, p) => sum + p.amountPaid, 0);
    const pendingPayments = packages.reduce((sum, p) => sum + p.amountDue, 0);
    const totalSessions = packages.reduce((sum, p) => sum + p.totalSessions, 0);
    const sessionsUsed = packages.reduce((sum, p) => sum + p.sessionsUsed, 0);

    return { active, totalRevenue, pendingPayments, totalSessions, sessionsUsed };
  }, [packages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">{t('tools.tutoringPackage.loadingPackages', 'Loading packages...')}</span>
      </div>
    );
  }

  return (
    <div className={`p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold">{t('tools.tutoringPackage.tutoringPackages', 'Tutoring Packages')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tools.tutoringPackage.manageStudentTutoringPackagesAnd', 'Manage student tutoring packages and track sessions')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="tutoring-package" toolName="Tutoring Package" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
            onRetry={forceSync}
          />
          <ExportDropdown
            onExportCSV={exportCSV}
            onExportExcel={exportExcel}
            onExportJSON={exportJSON}
            onExportPDF={exportPDF}
            onCopy={copyToClipboard}
            onPrint={print}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tutoringPackage.active', 'Active')}</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tutoringPackage.revenue', 'Revenue')}</p>
                <p className="text-xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tutoringPackage.pending', 'Pending')}</p>
                <p className="text-xl font-bold">${stats.pendingPayments.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Timer className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tutoringPackage.totalSessions', 'Total Sessions')}</p>
                <p className="text-xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.tutoringPackage.sessionsUsed', 'Sessions Used')}</p>
                <p className="text-xl font-bold">{stats.sessionsUsed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab('list');
            resetForm();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('tools.tutoringPackage.packages', 'Packages')}
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Gift className="w-4 h-4" />
          {t('tools.tutoringPackage.templates', 'Templates')}
        </button>
        <button
          onClick={() => {
            setActiveTab('add');
            resetForm();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'add'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('tools.tutoringPackage.newPackage', 'New Package')}
        </button>
      </div>

      {/* Templates View */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  {template.discountPercent > 0 && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                      {template.discountPercent}% OFF
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{template.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('tools.tutoringPackage.sessions', 'Sessions:')}</span>
                    <span className="font-medium">{template.sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('tools.tutoringPackage.duration', 'Duration:')}</span>
                    <span className="font-medium">{template.sessionDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('tools.tutoringPackage.perSession', 'Per Session:')}</span>
                    <span className="font-medium">${template.pricePerSession}</span>
                  </div>
                  <div className="flex justify-between border-t dark:border-gray-700 pt-2">
                    <span className="font-medium">{t('tools.tutoringPackage.total', 'Total:')}</span>
                    <span className="font-bold text-indigo-600">
                      ${(
                        template.sessions *
                        template.pricePerSession *
                        (1 - template.discountPercent / 100)
                      ).toFixed(0)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => applyTemplate(template)}
                  className="w-full mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  {t('tools.tutoringPackage.useTemplate', 'Use Template')}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.tutoringPackage.searchPackages', 'Search packages...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PackageStatus | 'all')}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="all">{t('tools.tutoringPackage.allStatus', 'All Status')}</option>
              <option value="active">{t('tools.tutoringPackage.active2', 'Active')}</option>
              <option value="completed">{t('tools.tutoringPackage.completed', 'Completed')}</option>
              <option value="expired">{t('tools.tutoringPackage.expired', 'Expired')}</option>
              <option value="paused">{t('tools.tutoringPackage.paused', 'Paused')}</option>
              <option value="cancelled">{t('tools.tutoringPackage.cancelled', 'Cancelled')}</option>
            </select>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value as PaymentStatus | 'all')}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="all">{t('tools.tutoringPackage.allPayments', 'All Payments')}</option>
              <option value="paid">{t('tools.tutoringPackage.paid', 'Paid')}</option>
              <option value="partial">{t('tools.tutoringPackage.partial', 'Partial')}</option>
              <option value="pending">{t('tools.tutoringPackage.pending2', 'Pending')}</option>
              <option value="refunded">{t('tools.tutoringPackage.refunded', 'Refunded')}</option>
            </select>
          </div>

          {/* Packages List */}
          <div className="space-y-4">
            {filteredPackages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t('tools.tutoringPackage.noPackagesFound', 'No packages found')}</p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  >
                    {t('tools.tutoringPackage.createFromTemplate', 'Create from Template')}
                  </button>
                </CardContent>
              </Card>
            ) : (
              filteredPackages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{pkg.packageName}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(pkg.status)}`}>
                            {pkg.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getPaymentColor(pkg.paymentStatus)}`}>
                            {pkg.paymentStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {pkg.studentName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            {pkg.sessionsUsed}/{pkg.totalSessions} sessions
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {pkg.startDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{
                                width: `${(pkg.sessionsUsed / pkg.totalSessions) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {pkg.sessionsRemaining} remaining
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            Paid: ${pkg.amountPaid.toLocaleString()}
                          </span>
                          {pkg.amountDue > 0 && (
                            <span className="flex items-center gap-1 text-orange-500">
                              <AlertCircle className="w-4 h-4" />
                              Due: ${pkg.amountDue.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewPackage(pkg)}
                          className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit View */}
      {activeTab === 'add' && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPackageId ? t('tools.tutoringPackage.editPackage', 'Edit Package') : t('tools.tutoringPackage.newPackage2', 'New Package')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.studentName', 'Student Name *')}</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.tutoringPackage.enterStudentName', 'Enter student name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.parentName', 'Parent Name')}</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.tutoringPackage.parentGuardianName', 'Parent/guardian name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.parentEmail', 'Parent Email')}</label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.tutoringPackage.parentEmailCom', 'parent@email.com')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.parentPhone', 'Parent Phone')}</label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            {/* Package Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.packageName', 'Package Name *')}</label>
                <input
                  type="text"
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.tutoringPackage.eG8SessionMath', 'e.g., 8-Session Math Pack')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.totalSessions2', 'Total Sessions')}</label>
                <input
                  type="number"
                  value={formData.totalSessions}
                  onChange={(e) => setFormData({ ...formData, totalSessions: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.sessionDurationMin', 'Session Duration (min)')}</label>
                <input
                  type="number"
                  value={formData.sessionDuration}
                  onChange={(e) => setFormData({ ...formData, sessionDuration: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.startDate', 'Start Date')}</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.endDate', 'End Date')}</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.status', 'Status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PackageStatus })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="active">{t('tools.tutoringPackage.active3', 'Active')}</option>
                  <option value="completed">{t('tools.tutoringPackage.completed2', 'Completed')}</option>
                  <option value="paused">{t('tools.tutoringPackage.paused2', 'Paused')}</option>
                  <option value="expired">{t('tools.tutoringPackage.expired2', 'Expired')}</option>
                  <option value="cancelled">{t('tools.tutoringPackage.cancelled2', 'Cancelled')}</option>
                </select>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.tutoringPackage.subjects', 'Subjects')}</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      (formData.subjects || []).includes(subject)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.priceSession', 'Price/Session')}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.pricePerSession}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerSession: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.discount', 'Discount %')}</label>
                <input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.totalPrice', 'Total Price')}</label>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium">
                  ${(formData.totalPrice || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.discount2', 'Discount')}</label>
                <div className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium">
                  -${(formData.discountAmount || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.finalPrice', 'Final Price')}</label>
                <div className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg font-bold">
                  ${(formData.finalPrice || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.amountDue', 'Amount Due')}</label>
                <div
                  className={`px-3 py-2 rounded-lg font-bold ${
                    (formData.amountDue || 0) > 0
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}
                >
                  ${(formData.amountDue || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Sessions Used */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('sessions')}
              >
                <label className="text-sm font-medium">Session Records ({formData.sessionsUsed || 0} used)</label>
                {expandedSections.sessions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              {expandedSections.sessions && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                    />
                    <input
                      type="number"
                      value={newSession.duration}
                      onChange={(e) =>
                        setNewSession({ ...newSession, duration: parseInt(e.target.value) || 60 })
                      }
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.tutoringPackage.durationMin', 'Duration (min)')}
                    />
                    <select
                      value={newSession.subject}
                      onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="">{t('tools.tutoringPackage.selectSubject', 'Select Subject')}</option>
                      {SUBJECTS.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addSessionRecord}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {(formData.sessionRecords || []).length > 0 && (
                    <div className="space-y-2">
                      {(formData.sessionRecords || []).map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm">{session.date}</span>
                            <span className="text-sm">{session.duration} min</span>
                            <span className="text-sm font-medium">{session.subject}</span>
                          </div>
                          <button
                            onClick={() => removeSessionRecord(session.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payments */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('payments')}
              >
                <label className="text-sm font-medium">
                  Payment Records (Paid: ${(formData.amountPaid || 0).toFixed(2)})
                </label>
                {expandedSections.payments ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              {expandedSections.payments && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="date"
                      value={newPayment.date}
                      onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                    />
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) =>
                          setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full pl-8 pr-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                        placeholder={t('tools.tutoringPackage.amount', 'Amount')}
                      />
                    </div>
                    <select
                      value={newPayment.method}
                      onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addPaymentRecord}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {(formData.payments || []).length > 0 && (
                    <div className="space-y-2">
                      {(formData.payments || []).map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm">{payment.date}</span>
                            <span className="text-sm font-medium text-green-600">
                              ${payment.amount.toFixed(2)}
                            </span>
                            <span className="text-sm">{payment.method}</span>
                          </div>
                          <button
                            onClick={() => removePaymentRecord(payment.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRenewable}
                  onChange={(e) => setFormData({ ...formData, isRenewable: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">{t('tools.tutoringPackage.renewablePackage', 'Renewable Package')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">{t('tools.tutoringPackage.autoRenew', 'Auto-Renew')}</span>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">{t('tools.tutoringPackage.notes', 'Notes')}</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                placeholder={t('tools.tutoringPackage.additionalNotesAboutThePackage', 'Additional notes about the package...')}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('tools.tutoringPackage.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSavePackage}
                disabled={isSaving}
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {selectedPackageId ? t('tools.tutoringPackage.updatePackage', 'Update Package') : t('tools.tutoringPackage.createPackage', 'Create Package')}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Package */}
      {activeTab === 'view' && selectedPackage && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('tools.tutoringPackage.packageDetails', 'Package Details')}</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditPackage(selectedPackage)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('tools.tutoringPackage.edit', 'Edit')}
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.tutoringPackage.backToList', 'Back to List')}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <h2 className="text-xl font-bold">{selectedPackage.packageName}</h2>
                <p className="text-gray-500">{selectedPackage.studentName}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full ${getStatusColor(selectedPackage.status)}`}>
                  {selectedPackage.status}
                </span>
                <span className={`px-3 py-1 rounded-full ${getPaymentColor(selectedPackage.paymentStatus)}`}>
                  {selectedPackage.paymentStatus}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{t('tools.tutoringPackage.sessionsProgress', 'Sessions Progress')}</span>
                <span>
                  {selectedPackage.sessionsUsed}/{selectedPackage.totalSessions} sessions used
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-indigo-500 h-4 rounded-full"
                  style={{
                    width: `${(selectedPackage.sessionsUsed / selectedPackage.totalSessions) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {selectedPackage.sessionsRemaining} sessions remaining
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('tools.tutoringPackage.parent', 'Parent')}</p>
                <p className="font-medium">{selectedPackage.parentName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.tutoringPackage.startDate2', 'Start Date')}</p>
                <p className="font-medium">{selectedPackage.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.tutoringPackage.endDate2', 'End Date')}</p>
                <p className="font-medium">{selectedPackage.endDate || 'Ongoing'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.tutoringPackage.sessionDuration', 'Session Duration')}</p>
                <p className="font-medium">{selectedPackage.sessionDuration} minutes</p>
              </div>
            </div>

            {/* Subjects */}
            {selectedPackage.subjects.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.tutoringPackage.subjects2', 'Subjects')}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPackage.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Financials */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">{t('tools.tutoringPackage.priceSession2', 'Price/Session')}</p>
                <p className="font-bold">${selectedPackage.pricePerSession}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.tutoringPackage.totalPrice2', 'Total Price')}</p>
                <p className="font-bold">${selectedPackage.totalPrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.tutoringPackage.discount3', 'Discount')}</p>
                <p className="font-bold text-green-600">
                  {selectedPackage.discountPercent}% (-${selectedPackage.discountAmount})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.tutoringPackage.finalPrice2', 'Final Price')}</p>
                <p className="font-bold text-indigo-600">${selectedPackage.finalPrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.tutoringPackage.amountDue2', 'Amount Due')}</p>
                <p
                  className={`font-bold ${
                    selectedPackage.amountDue > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}
                >
                  ${selectedPackage.amountDue}
                </p>
              </div>
            </div>

            {/* Session Records */}
            {selectedPackage.sessionRecords.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.tutoringPackage.sessionHistory', 'Session History')}</h3>
                <div className="space-y-2">
                  {selectedPackage.sessionRecords.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{session.date}</span>
                        <span>{session.duration} min</span>
                        <span className="font-medium">{session.subject}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            {selectedPackage.payments.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.tutoringPackage.paymentHistory', 'Payment History')}</h3>
                <div className="space-y-2">
                  {selectedPackage.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span>{payment.date}</span>
                        <span className="font-medium text-green-600">${payment.amount}</span>
                        <span className="text-sm text-gray-500">{payment.method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedPackage.notes && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.tutoringPackage.notes2', 'Notes')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedPackage.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default TutoringPackageTool;
