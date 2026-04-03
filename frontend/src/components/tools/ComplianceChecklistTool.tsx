import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  FileText,
  Calendar,
  User,
  Building2,
  AlertOctagon,
  BookOpen,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import SyncStatus from '../ui/SyncStatus';
import ExportDropdown from '../ui/ExportDropdown';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { Loader2 } from 'lucide-react';

interface ComplianceItem {
  id: string;
  category: string;
  regulation: string;
  requirement: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'as_needed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'compliant' | 'non_compliant' | 'pending_review' | 'in_progress' | 'not_applicable';
  responsibleParty: string;
  department: string;
  dueDate: string;
  lastReviewDate: string;
  nextReviewDate: string;
  evidenceRequired: boolean;
  evidenceProvided: boolean;
  evidenceNotes: string;
  riskLevel: 'high' | 'medium' | 'low';
  penaltyRisk: string;
  actionItems: string[];
  findings: string;
  remediation: string;
  reviewer: string;
  approver: string;
  notes: string;
  attachments: number;
  createdAt: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'category', header: 'Category', width: 15 },
  { key: 'regulation', header: 'Regulation', width: 12 },
  { key: 'requirement', header: 'Requirement', width: 20 },
  { key: 'frequency', header: 'Frequency', width: 10 },
  { key: 'priority', header: 'Priority', width: 10 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'responsibleParty', header: 'Responsible', width: 12 },
  { key: 'department', header: 'Department', width: 12 },
  { key: 'dueDate', header: 'Due Date', width: 12 },
  { key: 'riskLevel', header: 'Risk Level', width: 10 },
  { key: 'lastReviewDate', header: 'Last Review', width: 12 },
];

const STATUS_CONFIG = {
  compliant: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Compliant' },
  non_compliant: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Non-Compliant' },
  pending_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review' },
  in_progress: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'In Progress' },
  not_applicable: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle, label: 'N/A' },
};

const PRIORITY_CONFIG = {
  critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  low: { color: 'bg-green-100 text-green-800', label: 'Low' },
};

const RISK_CONFIG = {
  high: { color: 'bg-red-100 text-red-800', label: 'High Risk' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Risk' },
  low: { color: 'bg-green-100 text-green-800', label: 'Low Risk' },
};

const CATEGORIES = [
  'BSA/AML',
  'KYC/CDD',
  'OFAC',
  'GDPR',
  'PCI-DSS',
  'SOX',
  'GLBA',
  'FCPA',
  'TCPA',
  'Fair Lending',
  'Consumer Protection',
  'Privacy',
  'Cybersecurity',
  'Internal Controls',
  'Risk Management',
];

const REGULATIONS = [
  'Bank Secrecy Act',
  'USA PATRIOT Act',
  'Dodd-Frank Act',
  'FCRA',
  'TILA',
  'ECOA',
  'HMDA',
  'CRA',
  'RESPA',
  'UDAAP',
  'Regulation E',
  'Regulation Z',
  'State Regulations',
];

export default function ComplianceChecklistTool() {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const {
    data: items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
  } = useToolData<ComplianceItem>('compliance-checklist-tool', [], COLUMNS);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'checklist' | 'new' | 'analytics'>('checklist');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ComplianceItem | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    regulation: '',
    requirement: '',
    description: '',
    frequency: 'monthly' as const,
    priority: 'medium' as const,
    responsibleParty: '',
    department: '',
    dueDate: '',
    evidenceRequired: false,
    riskLevel: 'medium' as const,
    penaltyRisk: '',
    actionItems: [''],
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      category: '',
      regulation: '',
      requirement: '',
      description: '',
      frequency: 'monthly',
      priority: 'medium',
      responsibleParty: '',
      department: '',
      dueDate: '',
      evidenceRequired: false,
      riskLevel: 'medium',
      penaltyRisk: '',
      actionItems: [''],
      notes: '',
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const actionItems = formData.actionItems.filter((item) => item.trim() !== '');

    if (editingItem) {
      updateItem(editingItem.id, {
        ...formData,
        actionItems,
      });
    } else {
      const newItem: ComplianceItem = {
        id: Date.now().toString(),
        ...formData,
        actionItems,
        status: 'pending_review',
        lastReviewDate: '',
        nextReviewDate: formData.dueDate,
        evidenceProvided: false,
        evidenceNotes: '',
        findings: '',
        remediation: '',
        reviewer: '',
        approver: '',
        attachments: 0,
        createdAt: new Date().toISOString(),
      };
      addItem(newItem);
    }

    resetForm();
    setActiveTab('checklist');
  };

  const handleEdit = (item: ComplianceItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      regulation: item.regulation,
      requirement: item.requirement,
      description: item.description,
      frequency: item.frequency,
      priority: item.priority,
      responsibleParty: item.responsibleParty,
      department: item.department,
      dueDate: item.dueDate,
      evidenceRequired: item.evidenceRequired,
      riskLevel: item.riskLevel,
      penaltyRisk: item.penaltyRisk,
      actionItems: item.actionItems.length > 0 ? item.actionItems : [''],
      notes: item.notes,
    });
    setActiveTab('new');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete this compliance item?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  const updateStatus = (id: string, status: ComplianceItem['status']) => {
    const updates: Partial<ComplianceItem> = { status };
    if (status === 'compliant') {
      updates.lastReviewDate = new Date().toISOString().split('T')[0];
    }
    updateItem(id, updates);
  };

  const addActionItem = () => {
    setFormData({ ...formData, actionItems: [...formData.actionItems, ''] });
  };

  const updateActionItem = (index: number, value: string) => {
    const newItems = [...formData.actionItems];
    newItems[index] = value;
    setFormData({ ...formData, actionItems: newItems });
  };

  const removeActionItem = (index: number) => {
    const newItems = formData.actionItems.filter((_, i) => i !== index);
    setFormData({ ...formData, actionItems: newItems.length > 0 ? newItems : [''] });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regulation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsibleParty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Analytics calculations
  const totalItems = items.length;
  const compliantCount = items.filter((i) => i.status === 'compliant').length;
  const nonCompliantCount = items.filter((i) => i.status === 'non_compliant').length;
  const pendingCount = items.filter((i) => i.status === 'pending_review').length;
  const criticalItems = items.filter((i) => i.priority === 'critical').length;
  const highRiskItems = items.filter((i) => i.riskLevel === 'high').length;
  const overdue = items.filter((i) => new Date(i.dueDate) < new Date() && i.status !== 'compliant').length;

  const complianceRate = totalItems > 0 ? ((compliantCount / totalItems) * 100).toFixed(1) : '0.0';

  const byCategory = items.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byPriority = items.reduce((acc, i) => {
    acc[i.priority] = (acc[i.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{t('tools.complianceChecklist.complianceChecklist', 'Compliance Checklist')}</h1>
              <p className="text-sm text-gray-500">{t('tools.complianceChecklist.trackRegulatoryComplianceRequirements', 'Track regulatory compliance requirements')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="compliance-checklist" toolName="Compliance Checklist" />

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
              onExportPDF={() => exportPDF('Compliance Checklist')}
              onImportCSV={importCSV}
              onImportJSON={importJSON}
              onCopyClipboard={copyToClipboard}
              onPrint={() => print('Compliance Checklist')}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'checklist'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('tools.complianceChecklist.checklist', 'Checklist')}
          </button>
          <button
            onClick={() => {
              resetForm();
              setActiveTab('new');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'new'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('tools.complianceChecklist.addItem', 'Add Item')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('tools.complianceChecklist.analytics', 'Analytics')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('tools.complianceChecklist.searchRequirementsCategoriesRegulations', 'Search requirements, categories, regulations...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">{t('tools.complianceChecklist.allCategories', 'All Categories')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">{t('tools.complianceChecklist.allPriorities', 'All Priorities')}</option>
                  <option value="critical">{t('tools.complianceChecklist.critical', 'Critical')}</option>
                  <option value="high">{t('tools.complianceChecklist.high', 'High')}</option>
                  <option value="medium">{t('tools.complianceChecklist.medium', 'Medium')}</option>
                  <option value="low">{t('tools.complianceChecklist.low', 'Low')}</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">{t('tools.complianceChecklist.allStatuses', 'All Statuses')}</option>
                  <option value="compliant">{t('tools.complianceChecklist.compliant', 'Compliant')}</option>
                  <option value="non_compliant">{t('tools.complianceChecklist.nonCompliant', 'Non-Compliant')}</option>
                  <option value="pending_review">{t('tools.complianceChecklist.pendingReview', 'Pending Review')}</option>
                  <option value="in_progress">{t('tools.complianceChecklist.inProgress', 'In Progress')}</option>
                  <option value="not_applicable">N/A</option>
                </select>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('tools.complianceChecklist.noComplianceItemsFound', 'No compliance items found')}</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status];
                  const StatusIcon = statusConfig.icon;
                  const priorityConfig = PRIORITY_CONFIG[item.priority];
                  const riskConfig = RISK_CONFIG[item.riskLevel];
                  const isExpanded = expandedId === item.id;
                  const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'compliant';

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-lg border ${isOverdue ? 'border-red-300' : 'border-gray-200'} overflow-hidden`}
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${item.status === 'compliant' ? 'bg-green-50' : item.status === 'non_compliant' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                              <StatusIcon className={`w-5 h-5 ${item.status === 'compliant' ? 'text-green-600' : item.status === 'non_compliant' ? 'text-red-600' : 'text-yellow-600'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{item.requirement}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                                  {priorityConfig.label}
                                </span>
                                {isOverdue && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {t('tools.complianceChecklist.overdue2', 'Overdue')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  {item.category}
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {item.regulation}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {item.responsibleParty}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Due: {item.dueDate}</div>
                              <div className={`text-xs ${riskConfig.color} px-2 py-0.5 rounded`}>
                                {riskConfig.label}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Requirement Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Requirement Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">{t('tools.complianceChecklist.description', 'Description:')}</span>
                                  <p className="font-medium mt-1">{item.description || 'No description provided'}</p>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.complianceChecklist.frequency', 'Frequency:')}</span>
                                  <span className="font-medium capitalize">{item.frequency.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.complianceChecklist.department', 'Department:')}</span>
                                  <span className="font-medium">{item.department}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.complianceChecklist.penaltyRisk', 'Penalty Risk:')}</span>
                                  <span className="font-medium">{item.penaltyRisk || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Review Information */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Review Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.complianceChecklist.lastReview', 'Last Review:')}</span>
                                  <span className="font-medium">{item.lastReviewDate || 'Never'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.complianceChecklist.nextReview', 'Next Review:')}</span>
                                  <span className="font-medium">{item.nextReviewDate || item.dueDate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.complianceChecklist.reviewer', 'Reviewer:')}</span>
                                  <span className="font-medium">{item.reviewer || 'Not assigned'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.complianceChecklist.approver', 'Approver:')}</span>
                                  <span className="font-medium">{item.approver || 'Not assigned'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">{t('tools.complianceChecklist.evidenceRequired', 'Evidence Required:')}</span>
                                  <span className={`font-medium ${item.evidenceRequired ? 'text-orange-600' : 'text-gray-600'}`}>
                                    {item.evidenceRequired ? 'Yes' : 'No'}
                                    {item.evidenceRequired && (item.evidenceProvided ? t('tools.complianceChecklist.provided', ' (Provided)') : t('tools.complianceChecklist.pending', ' (Pending)'))}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Items */}
                            {item.actionItems.length > 0 && (
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3">{t('tools.complianceChecklist.actionItems', 'Action Items')}</h4>
                                <ul className="space-y-2">
                                  {item.actionItems.map((action, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs">
                                        {idx + 1}
                                      </span>
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Findings & Remediation */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3">{t('tools.complianceChecklist.findingsRemediation', 'Findings & Remediation')}</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">{t('tools.complianceChecklist.findings', 'Findings:')}</span>
                                  <p className="font-medium mt-1">{item.findings || 'No findings recorded'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">{t('tools.complianceChecklist.remediation', 'Remediation:')}</span>
                                  <p className="font-medium mt-1">{item.remediation || 'No remediation needed'}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {item.notes && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>{t('tools.complianceChecklist.notes', 'Notes:')}</strong> {item.notes}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <div className="flex gap-2">
                              {item.status !== 'compliant' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(item.id, 'compliant');
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  {t('tools.complianceChecklist.markCompliant', 'Mark Compliant')}
                                </button>
                              )}
                              {item.status === 'pending_review' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(item.id, 'in_progress');
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                  {t('tools.complianceChecklist.startReview', 'Start Review')}
                                </button>
                              )}
                              {item.status === 'compliant' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(item.id, 'pending_review');
                                  }}
                                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                                >
                                  {t('tools.complianceChecklist.reReview', 'Re-review')}
                                </button>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(item);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {editingItem ? t('tools.complianceChecklist.editComplianceItem', 'Edit Compliance Item') : t('tools.complianceChecklist.addComplianceItem', 'Add Compliance Item')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.complianceChecklist.category', 'Category')}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">{t('tools.complianceChecklist.selectCategory', 'Select Category')}</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.complianceChecklist.regulation', 'Regulation')}
                    </label>
                    <select
                      value={formData.regulation}
                      onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">{t('tools.complianceChecklist.selectRegulation', 'Select Regulation')}</option>
                      {REGULATIONS.map((reg) => (
                        <option key={reg} value={reg}>{reg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tools.complianceChecklist.requirementTitle', 'Requirement Title')}
                  </label>
                  <input
                    type="text"
                    value={formData.requirement}
                    onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder={t('tools.complianceChecklist.eGAnnualAmlTraining', 'e.g., Annual AML Training')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tools.complianceChecklist.description2', 'Description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder={t('tools.complianceChecklist.detailedDescriptionOfTheCompliance', 'Detailed description of the compliance requirement...')}
                  />
                </div>

                {/* Classification */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">{t('tools.complianceChecklist.classification', 'Classification')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.complianceChecklist.frequency2', 'Frequency')}
                      </label>
                      <select
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="daily">{t('tools.complianceChecklist.daily', 'Daily')}</option>
                        <option value="weekly">{t('tools.complianceChecklist.weekly', 'Weekly')}</option>
                        <option value="monthly">{t('tools.complianceChecklist.monthly', 'Monthly')}</option>
                        <option value="quarterly">{t('tools.complianceChecklist.quarterly', 'Quarterly')}</option>
                        <option value="annually">{t('tools.complianceChecklist.annually', 'Annually')}</option>
                        <option value="as_needed">{t('tools.complianceChecklist.asNeeded', 'As Needed')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.complianceChecklist.priority', 'Priority')}
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="critical">{t('tools.complianceChecklist.critical2', 'Critical')}</option>
                        <option value="high">{t('tools.complianceChecklist.high2', 'High')}</option>
                        <option value="medium">{t('tools.complianceChecklist.medium2', 'Medium')}</option>
                        <option value="low">{t('tools.complianceChecklist.low2', 'Low')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.complianceChecklist.riskLevel', 'Risk Level')}
                      </label>
                      <select
                        value={formData.riskLevel}
                        onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="high">{t('tools.complianceChecklist.high3', 'High')}</option>
                        <option value="medium">{t('tools.complianceChecklist.medium3', 'Medium')}</option>
                        <option value="low">{t('tools.complianceChecklist.low3', 'Low')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.complianceChecklist.dueDate', 'Due Date')}
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Assignment */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">{t('tools.complianceChecklist.assignment', 'Assignment')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.complianceChecklist.responsibleParty', 'Responsible Party')}
                      </label>
                      <input
                        type="text"
                        value={formData.responsibleParty}
                        onChange={(e) => setFormData({ ...formData, responsibleParty: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.complianceChecklist.department2', 'Department')}
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Evidence & Risk */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">{t('tools.complianceChecklist.evidenceRisk', 'Evidence & Risk')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.complianceChecklist.penaltyRisk2', 'Penalty Risk')}
                      </label>
                      <input
                        type="text"
                        value={formData.penaltyRisk}
                        onChange={(e) => setFormData({ ...formData, penaltyRisk: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder={t('tools.complianceChecklist.eGUpTo1m', 'e.g., Up to $1M fine')}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.evidenceRequired}
                          onChange={(e) => setFormData({ ...formData, evidenceRequired: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{t('tools.complianceChecklist.evidenceRequired2', 'Evidence Required')}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">{t('tools.complianceChecklist.actionItems2', 'Action Items')}</h3>
                  <div className="space-y-2">
                    {formData.actionItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateActionItem(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder={t('tools.complianceChecklist.enterActionItem', 'Enter action item...')}
                        />
                        <button
                          type="button"
                          onClick={() => removeActionItem(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addActionItem}
                      className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Action Item
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tools.complianceChecklist.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('checklist');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    {t('tools.complianceChecklist.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingItem ? t('tools.complianceChecklist.updateItem', 'Update Item') : t('tools.complianceChecklist.addItem2', 'Add Item')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.complianceChecklist.totalItems', 'Total Items')}</p>
                    <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.complianceChecklist.complianceRate', 'Compliance Rate')}</p>
                    <p className="text-2xl font-bold text-gray-900">{complianceRate}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.complianceChecklist.nonCompliant2', 'Non-Compliant')}</p>
                    <p className="text-2xl font-bold text-gray-900">{nonCompliantCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('tools.complianceChecklist.overdue', 'Overdue')}</p>
                    <p className="text-2xl font-bold text-gray-900">{overdue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Category */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">{t('tools.complianceChecklist.itemsByCategory', 'Items by Category')}</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(count / totalItems) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* By Priority */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">{t('tools.complianceChecklist.itemsByPriority', 'Items by Priority')}</h3>
                <div className="space-y-3">
                  {Object.entries(byPriority).map(([priority, count]) => {
                    const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <span className={`text-sm px-2 py-0.5 rounded ${config?.color || ''}`}>
                          {config?.label || priority}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(count / totalItems) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">{t('tools.complianceChecklist.riskOverview', 'Risk Overview')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.complianceChecklist.criticalItems', 'Critical Items')}</p>
                  <p className="text-xl font-bold text-red-600">{criticalItems}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.complianceChecklist.highRiskItems', 'High Risk Items')}</p>
                  <p className="text-xl font-bold text-orange-600">{highRiskItems}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.complianceChecklist.pendingReview2', 'Pending Review')}</p>
                  <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('tools.complianceChecklist.compliant2', 'Compliant')}</p>
                  <p className="text-xl font-bold text-green-600">{compliantCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
}
