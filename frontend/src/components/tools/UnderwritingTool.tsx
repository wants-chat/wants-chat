'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  DollarSign,
  Shield,
  Target,
  BarChart3,
  AlertTriangle,
  CheckSquare,
  Square,
  ListChecks,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface UnderwritingToolProps {
  uiConfig?: UIConfig;
}

type UnderwritingStatus = 'pending' | 'in_progress' | 'approved' | 'conditionally_approved' | 'declined' | 'suspended';
type RiskLevel = 'low' | 'moderate' | 'high' | 'very_high';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  completed: boolean;
  notes: string;
  completedAt?: string;
}

interface UnderwritingCase {
  id: string;
  caseNumber: string;
  loanNumber: string;
  applicantName: string;
  loanType: string;
  loanAmount: number;
  status: UnderwritingStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  underwriter: string;
  // Credit Analysis
  creditScore: number;
  debtToIncome: number;
  loanToValue?: number;
  // Checklist
  checklist: ChecklistItem[];
  // Conditions
  conditions: string[];
  conditionsMet: boolean;
  // Decision
  decision?: string;
  decisionReason?: string;
  decisionDate?: string;
  // Tracking
  assignedAt: string;
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<UnderwritingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-4 h-4" /> },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: <Target className="w-4 h-4" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
  conditionally_approved: { label: 'Conditionally Approved', color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="w-4 h-4" /> },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
  suspended: { label: 'Suspended', color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle className="w-4 h-4" /> },
};

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string }> = {
  low: { label: 'Low Risk', color: 'bg-green-100 text-green-800' },
  moderate: { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High Risk', color: 'bg-orange-100 text-orange-800' },
  very_high: { label: 'Very High', color: 'bg-red-100 text-red-800' },
};

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { category: 'Identity', item: 'Verify applicant identity', completed: false, notes: '' },
  { category: 'Identity', item: 'Check government ID validity', completed: false, notes: '' },
  { category: 'Income', item: 'Verify employment', completed: false, notes: '' },
  { category: 'Income', item: 'Review pay stubs', completed: false, notes: '' },
  { category: 'Income', item: 'Review tax returns', completed: false, notes: '' },
  { category: 'Income', item: 'Calculate DTI ratio', completed: false, notes: '' },
  { category: 'Credit', item: 'Pull credit report', completed: false, notes: '' },
  { category: 'Credit', item: 'Review credit history', completed: false, notes: '' },
  { category: 'Credit', item: 'Check for derogatory marks', completed: false, notes: '' },
  { category: 'Assets', item: 'Verify bank statements', completed: false, notes: '' },
  { category: 'Assets', item: 'Verify reserves', completed: false, notes: '' },
  { category: 'Property', item: 'Review appraisal', completed: false, notes: '' },
  { category: 'Property', item: 'Verify title', completed: false, notes: '' },
  { category: 'Compliance', item: 'TRID compliance check', completed: false, notes: '' },
  { category: 'Compliance', item: 'Fraud check', completed: false, notes: '' },
];

const CASE_COLUMNS: ColumnConfig[] = [
  { key: 'caseNumber', header: 'Case #', type: 'string' },
  { key: 'applicantName', header: 'Applicant', type: 'string' },
  { key: 'loanType', header: 'Type', type: 'string' },
  { key: 'loanAmount', header: 'Amount', type: 'currency' },
  { key: 'creditScore', header: 'Credit', type: 'number' },
  { key: 'riskLevel', header: 'Risk', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'underwriter', header: 'Underwriter', type: 'string' },
  { key: 'dueDate', header: 'Due', type: 'date' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateCaseNumber = () => `UW-${Date.now().toString().slice(-8)}`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const calculateRiskLevel = (creditScore: number, dti: number, ltv?: number): RiskLevel => {
  let riskPoints = 0;
  if (creditScore < 620) riskPoints += 3;
  else if (creditScore < 680) riskPoints += 2;
  else if (creditScore < 740) riskPoints += 1;
  if (dti > 50) riskPoints += 3;
  else if (dti > 43) riskPoints += 2;
  else if (dti > 36) riskPoints += 1;
  if (ltv && ltv > 95) riskPoints += 2;
  else if (ltv && ltv > 80) riskPoints += 1;
  if (riskPoints >= 5) return 'very_high';
  if (riskPoints >= 3) return 'high';
  if (riskPoints >= 1) return 'moderate';
  return 'low';
};

const getInitialFormState = (): Partial<UnderwritingCase> => ({
  loanNumber: '',
  applicantName: '',
  loanType: 'mortgage',
  loanAmount: 0,
  status: 'pending',
  riskLevel: 'moderate',
  riskScore: 0,
  underwriter: '',
  creditScore: 700,
  debtToIncome: 35,
  checklist: DEFAULT_CHECKLIST.map(item => ({ ...item, id: generateId() })),
  conditions: [],
  conditionsMet: false,
  dueDate: '',
  notes: '',
});

export const UnderwritingTool: React.FC<UnderwritingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const {
    data: cases,
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
  } = useToolData<UnderwritingCase>('underwriting', [], CASE_COLUMNS);

  const [activeTab, setActiveTab] = useState<'cases' | 'new' | 'analytics'>('cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UnderwritingCase>>(getInitialFormState());
  const [newCondition, setNewCondition] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch =
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.underwriter.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchesRisk = filterRisk === 'all' || c.riskLevel === filterRisk;
      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [cases, searchTerm, filterStatus, filterRisk]);

  const analytics = useMemo(() => {
    const total = cases.length;
    const approved = cases.filter(c => c.status === 'approved' || c.status === 'conditionally_approved').length;
    const declined = cases.filter(c => c.status === 'declined').length;
    const pending = cases.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
    const avgCreditScore = total > 0 ? cases.reduce((sum, c) => sum + c.creditScore, 0) / total : 0;
    const approvalRate = total > 0 ? (approved / total) * 100 : 0;
    const byRisk = {
      low: cases.filter(c => c.riskLevel === 'low').length,
      moderate: cases.filter(c => c.riskLevel === 'moderate').length,
      high: cases.filter(c => c.riskLevel === 'high').length,
      very_high: cases.filter(c => c.riskLevel === 'very_high').length,
    };
    return { total, approved, declined, pending, avgCreditScore, approvalRate, byRisk };
  }, [cases]);

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const riskLevel = calculateRiskLevel(formData.creditScore || 700, formData.debtToIncome || 35, formData.loanToValue);

    if (editingId) {
      updateItem(editingId, { ...formData, riskLevel, updatedAt: now });
      setEditingId(null);
    } else {
      const newCase: UnderwritingCase = {
        ...formData as UnderwritingCase,
        id: generateId(),
        caseNumber: generateCaseNumber(),
        riskLevel,
        assignedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newCase);
    }
    setFormData(getInitialFormState());
    setActiveTab('cases');
  };

  const handleEdit = (caseItem: UnderwritingCase) => {
    setFormData(caseItem);
    setEditingId(caseItem.id);
    setActiveTab('new');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Delete this underwriting case?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) deleteItem(id);
  };

  const handleChecklistToggle = (caseId: string, itemId: string) => {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    const updatedChecklist = caseItem.checklist.map(item =>
      item.id === itemId
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined }
        : item
    );
    updateItem(caseId, { checklist: updatedChecklist, updatedAt: new Date().toISOString() });
  };

  const handleStatusChange = (id: string, newStatus: UnderwritingStatus) => {
    const updates: Partial<UnderwritingCase> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'approved' || newStatus === 'declined' || newStatus === 'conditionally_approved') {
      updates.decisionDate = new Date().toISOString();
    }
    updateItem(id, updates);
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData({
        ...formData,
        conditions: [...(formData.conditions || []), newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: (formData.conditions || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tools.underwriting.underwritingTool', 'Underwriting Tool')}</h1>
              <p className="text-gray-500 text-sm">{t('tools.underwriting.loanUnderwritingChecklistAndRisk', 'Loan underwriting checklist and risk assessment')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="underwriting" toolName="Underwriting" />

            <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} />
            <ExportDropdown
              onExportCSV={exportCSV}
              onExportExcel={exportExcel}
              onExportJSON={exportJSON}
              onExportPDF={exportPDF}
              onPrint={print}
              onCopyToClipboard={copyToClipboard}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
            />
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'cases', label: 'Cases', icon: <ListChecks className="w-4 h-4" /> },
            { id: 'new', label: 'New Case', icon: <Plus className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('tools.underwriting.searchCases', 'Search cases...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.underwriting.allStatuses', 'All Statuses')}</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">{t('tools.underwriting.allRiskLevels', 'All Risk Levels')}</option>
              {Object.entries(RISK_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredCases.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <ClipboardCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tools.underwriting.noCasesFound', 'No cases found')}</h3>
                <button onClick={() => setActiveTab('new')} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                  <Plus className="w-4 h-4" />
                  {t('tools.underwriting.newCase', 'New Case')}
                </button>
              </div>
            ) : (
              filteredCases.map(caseItem => {
                const completedItems = caseItem.checklist.filter(i => i.completed).length;
                const totalItems = caseItem.checklist.length;
                const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                return (
                  <div key={caseItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === caseItem.id ? null : caseItem.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <Scale className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{caseItem.caseNumber}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[caseItem.status].color}`}>
                                {STATUS_CONFIG[caseItem.status].label}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RISK_CONFIG[caseItem.riskLevel].color}`}>
                                {RISK_CONFIG[caseItem.riskLevel].label}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">{caseItem.applicantName} - {caseItem.loanType}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{formatCurrency(caseItem.loanAmount)}</div>
                            <div className="text-xs text-gray-500">Credit: {caseItem.creditScore}</div>
                          </div>
                          <div className="w-24">
                            <div className="text-xs text-gray-500 mb-1">{completedItems}/{totalItems} items</div>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          {expandedId === caseItem.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {expandedId === caseItem.id && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        {/* Checklist */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">{t('tools.underwriting.underwritingChecklist', 'Underwriting Checklist')}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Identity', 'Income', 'Credit', 'Assets', 'Property', 'Compliance'].map(category => {
                              const items = caseItem.checklist.filter(i => i.category === category);
                              if (items.length === 0) return null;
                              return (
                                <div key={category} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <h5 className="text-xs font-semibold text-gray-600 mb-2">{category}</h5>
                                  <div className="space-y-2">
                                    {items.map(item => (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => handleChecklistToggle(caseItem.id, item.id)}
                                      >
                                        {item.completed ? (
                                          <CheckSquare className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <Square className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                          {item.item}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Conditions */}
                        {caseItem.conditions.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('tools.underwriting.conditions', 'Conditions')}</h4>
                            <div className="flex flex-wrap gap-2">
                              {caseItem.conditions.map((condition, idx) => (
                                <span key={idx} className="px-2 py-1 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-200">
                                  {condition}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{t('tools.underwriting.status', 'Status:')}</span>
                            <select
                              value={caseItem.status}
                              onChange={(e) => handleStatusChange(caseItem.id, e.target.value as UnderwritingStatus)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                            >
                              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(caseItem)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(caseItem.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{editingId ? t('tools.underwriting.editCase', 'Edit Case') : t('tools.underwriting.newUnderwritingCase', 'New Underwriting Case')}</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.loanNumber', 'Loan Number')}</label>
                <input type="text" value={formData.loanNumber || ''} onChange={(e) => setFormData({ ...formData, loanNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.applicantName', 'Applicant Name')}</label>
                <input type="text" value={formData.applicantName || ''} onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.loanType', 'Loan Type')}</label>
                <select value={formData.loanType || ''} onChange={(e) => setFormData({ ...formData, loanType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="mortgage">{t('tools.underwriting.mortgage', 'Mortgage')}</option>
                  <option value="auto">Auto</option>
                  <option value="personal">{t('tools.underwriting.personal', 'Personal')}</option>
                  <option value="business">{t('tools.underwriting.business', 'Business')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.loanAmount', 'Loan Amount')}</label>
                <input type="number" value={formData.loanAmount || ''} onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.creditScore', 'Credit Score')}</label>
                <input type="number" value={formData.creditScore || ''} onChange={(e) => setFormData({ ...formData, creditScore: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.debtToIncome', 'Debt-to-Income (%)')}</label>
                <input type="number" value={formData.debtToIncome || ''} onChange={(e) => setFormData({ ...formData, debtToIncome: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.ltvOptional', 'LTV (%) - Optional')}</label>
                <input type="number" value={formData.loanToValue || ''} onChange={(e) => setFormData({ ...formData, loanToValue: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.underwriter', 'Underwriter')}</label>
                <input type="text" value={formData.underwriter || ''} onChange={(e) => setFormData({ ...formData, underwriter: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.dueDate', 'Due Date')}</label>
                <input type="date" value={formData.dueDate || ''} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tools.underwriting.conditions2', 'Conditions')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder={t('tools.underwriting.addACondition', 'Add a condition...')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={addCondition} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.conditions || []).map((condition, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-200">
                    {condition}
                    <button onClick={() => removeCondition(idx)} className="hover:text-yellow-900">
                      <XCircle className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tools.underwriting.notes', 'Notes')}</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button onClick={() => { setFormData(getInitialFormState()); setEditingId(null); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">{t('tools.underwriting.cancel', 'Cancel')}</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                <Save className="w-4 h-4" />
                {editingId ? t('tools.underwriting.update', 'Update') : t('tools.underwriting.createCase', 'Create Case')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.underwriting.totalCases', 'Total Cases')}</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.underwriting.approved', 'Approved')}</div>
              <div className="text-2xl font-bold text-green-600">{analytics.approved}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.underwriting.pending', 'Pending')}</div>
              <div className="text-2xl font-bold text-blue-600">{analytics.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{t('tools.underwriting.approvalRate', 'Approval Rate')}</div>
              <div className="text-2xl font-bold text-indigo-600">{analytics.approvalRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.underwriting.riskDistribution', 'Risk Distribution')}</h3>
              <div className="space-y-3">
                {Object.entries(RISK_CONFIG).map(([key, config]) => {
                  const count = analytics.byRisk[key as RiskLevel];
                  const pct = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`w-24 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-10 text-right text-sm font-medium">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.underwriting.keyMetrics', 'Key Metrics')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('tools.underwriting.averageCreditScore', 'Average Credit Score')}</span>
                  <span className="font-bold text-gray-900">{Math.round(analytics.avgCreditScore)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('tools.underwriting.declined', 'Declined')}</span>
                  <span className="font-bold text-red-600">{analytics.declined}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
};

export default UnderwritingTool;
