'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Building,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface LineItem {
  id: string;
  cptCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  modifier: string;
}

interface MedicalBill {
  id: string;
  patientName: string;
  patientId: string;
  dateOfService: string;
  claimNumber: string;
  insuranceProvider: string;
  policyNumber: string;
  diagnosisCodes: string[];
  lineItems: LineItem[];
  subtotal: number;
  insurancePayment: number;
  patientResponsibility: number;
  adjustments: number;
  amountDue: number;
  amountPaid: number;
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'denied' | 'paid' | 'partial' | 'collections';
  dueDate: string;
  paymentDate: string;
  provider: string;
  facility: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicalBillingToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'medical-billing';

const billingColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'claimNumber', header: 'Claim #', type: 'string' },
  { key: 'dateOfService', header: 'Service Date', type: 'date' },
  { key: 'amountDue', header: 'Amount Due', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const createNewBill = (): MedicalBill => ({
  id: crypto.randomUUID(),
  patientName: '',
  patientId: '',
  dateOfService: new Date().toISOString().split('T')[0],
  claimNumber: `CLM-${Date.now().toString(36).toUpperCase()}`,
  insuranceProvider: '',
  policyNumber: '',
  diagnosisCodes: [],
  lineItems: [],
  subtotal: 0,
  insurancePayment: 0,
  patientResponsibility: 0,
  adjustments: 0,
  amountDue: 0,
  amountPaid: 0,
  status: 'draft',
  dueDate: '',
  paymentDate: '',
  provider: '',
  facility: '',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const MedicalBillingTool: React.FC<MedicalBillingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: bills,
    addItem: addBill,
    updateItem: updateBill,
    deleteItem: deleteBill,
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
  } = useToolData<MedicalBill>(TOOL_ID, [], billingColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MedicalBill | null>(null);
  const [editingBill, setEditingBill] = useState<MedicalBill | null>(null);
  const [formData, setFormData] = useState<MedicalBill>(createNewBill());
  const [newLineItem, setNewLineItem] = useState<Omit<LineItem, 'id' | 'total'>>({ cptCode: '', description: '', quantity: 1, unitPrice: 0, modifier: '' });
  const [newDiagnosisCode, setNewDiagnosisCode] = useState('');

  const stats = useMemo(() => {
    const totalBilled = bills.reduce((sum, b) => sum + b.subtotal, 0);
    const totalPaid = bills.reduce((sum, b) => sum + b.amountPaid, 0);
    const totalOutstanding = bills.reduce((sum, b) => sum + b.amountDue, 0);
    const pendingCount = bills.filter(b => ['submitted', 'pending'].includes(b.status)).length;
    return { totalBilled, totalPaid, totalOutstanding, pendingCount, total: bills.length };
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      const matchesSearch = searchQuery === '' ||
        b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.claimNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || b.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchQuery, filterStatus]);

  const calculateTotals = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    return subtotal;
  };

  const handleSave = () => {
    const subtotal = calculateTotals(formData.lineItems);
    const patientResponsibility = subtotal - formData.insurancePayment - formData.adjustments;
    const amountDue = patientResponsibility - formData.amountPaid;
    const updated = { ...formData, subtotal, patientResponsibility, amountDue, updatedAt: new Date().toISOString() };

    if (editingBill) {
      updateBill(updated.id, updated);
    } else {
      addBill({ ...updated, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingBill(null);
    setFormData(createNewBill());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Bill',
      message: 'Are you sure you want to delete this bill? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteBill(id);
      if (selectedBill?.id === id) setSelectedBill(null);
    }
  };

  const addLineItem = () => {
    if (newLineItem.cptCode && newLineItem.unitPrice) {
      const total = newLineItem.quantity * newLineItem.unitPrice;
      const item: LineItem = { ...newLineItem, id: crypto.randomUUID(), total };
      setFormData({ ...formData, lineItems: [...formData.lineItems, item] });
      setNewLineItem({ cptCode: '', description: '', quantity: 1, unitPrice: 0, modifier: '' });
    }
  };

  const removeLineItem = (id: string) => {
    setFormData({ ...formData, lineItems: formData.lineItems.filter(i => i.id !== id) });
  };

  const addDiagnosisCode = () => {
    if (newDiagnosisCode && !formData.diagnosisCodes.includes(newDiagnosisCode)) {
      setFormData({ ...formData, diagnosisCodes: [...formData.diagnosisCodes, newDiagnosisCode] });
      setNewDiagnosisCode('');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      submitted: 'bg-blue-500/20 text-blue-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      denied: 'bg-red-500/20 text-red-400',
      paid: 'bg-emerald-500/20 text-emerald-400',
      partial: 'bg-orange-500/20 text-orange-400',
      collections: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500`;

  const labelClass = `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;
  const cardClass = `rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;
  const buttonPrimary = `flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg transition-all font-medium`;
  const buttonSecondary = `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
            <Receipt className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('tools.medicalBilling.medicalBilling', 'Medical Billing')}</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.medicalBilling.trackMedicalBillsAndClaims', 'Track medical bills and claims')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="medical-billing" toolName="Medical Billing" />

          <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={theme as 'light' | 'dark'} showLabel size="md" />
          <ExportDropdown onExportCSV={() => exportCSV({ filename: 'medical-billing' })} onExportExcel={() => exportExcel({ filename: 'medical-billing' })} onExportJSON={() => exportJSON({ filename: 'medical-billing' })} onExportPDF={() => exportPDF({ filename: 'medical-billing', title: 'Medical Billing' })} onPrint={() => print('Medical Billing')} onCopyToClipboard={() => copyToClipboard('tab')} disabled={bills.length === 0} theme={theme as 'light' | 'dark'} />
          <button onClick={() => { setFormData(createNewBill()); setShowModal(true); }} className={buttonPrimary}><Plus className="w-4 h-4" /> {t('tools.medicalBilling.newBill', 'New Bill')}</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Billed', value: formatCurrency(stats.totalBilled), color: 'text-cyan-500' },
          { label: 'Collected', value: formatCurrency(stats.totalPaid), color: 'text-green-500' },
          { label: 'Outstanding', value: formatCurrency(stats.totalOutstanding), color: 'text-orange-500' },
          { label: 'Pending Claims', value: stats.pendingCount.toString(), color: 'text-yellow-500' },
          { label: 'Total Bills', value: stats.total.toString(), color: 'text-purple-500' },
        ].map(stat => (
          <div key={stat.label} className={cardClass}>
            <div className="p-4 text-center">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.medicalBilling.searchPatientOrClaim', 'Search patient or claim...')} className={`${inputClass} pl-10`} />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.medicalBilling.allStatus', 'All Status')}</option>
            <option value="draft">{t('tools.medicalBilling.draft', 'Draft')}</option>
            <option value="submitted">{t('tools.medicalBilling.submitted', 'Submitted')}</option>
            <option value="pending">{t('tools.medicalBilling.pending', 'Pending')}</option>
            <option value="approved">{t('tools.medicalBilling.approved', 'Approved')}</option>
            <option value="denied">{t('tools.medicalBilling.denied', 'Denied')}</option>
            <option value="paid">{t('tools.medicalBilling.paid', 'Paid')}</option>
            <option value="partial">{t('tools.medicalBilling.partial', 'Partial')}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardClass} lg:col-span-1`}>
          <div className="p-4 border-b border-gray-700"><h2 className="text-lg font-semibold">{t('tools.medicalBilling.bills', 'Bills')}</h2></div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div></div>
            ) : filteredBills.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}><Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{t('tools.medicalBilling.noBillsFound', 'No bills found')}</p></div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredBills.map(bill => (
                  <div key={bill.id} onClick={() => setSelectedBill(bill)} className={`p-4 cursor-pointer transition-colors ${selectedBill?.id === bill.id ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{bill.patientName}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{bill.claimNumber}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-green-400">{formatCurrency(bill.amountDue)}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(bill.status)}`}>{bill.status}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingBill(bill); setFormData(bill); setShowModal(true); }} className="p-1.5 hover:bg-gray-600 rounded"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(bill.id); }} className="p-1.5 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`${cardClass} lg:col-span-2`}>
          {selectedBill ? (
            <div>
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{selectedBill.patientName}</h2>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(selectedBill.status)}`}>{selectedBill.status}</span>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Claim: {selectedBill.claimNumber}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400">{t('tools.medicalBilling.serviceDate', 'Service Date')}</p><p className="font-medium">{selectedBill.dateOfService}</p></div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400">{t('tools.medicalBilling.provider', 'Provider')}</p><p className="font-medium">{selectedBill.provider || 'N/A'}</p></div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400">{t('tools.medicalBilling.insurance', 'Insurance')}</p><p className="font-medium">{selectedBill.insuranceProvider || 'Self-pay'}</p></div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400">{t('tools.medicalBilling.dueDate', 'Due Date')}</p><p className="font-medium">{selectedBill.dueDate || 'N/A'}</p></div>
                </div>

                {selectedBill.lineItems.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('tools.medicalBilling.lineItems', 'Line Items')}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}><th className="text-left py-2">{t('tools.medicalBilling.cpt', 'CPT')}</th><th className="text-left py-2">{t('tools.medicalBilling.description', 'Description')}</th><th className="text-right py-2">{t('tools.medicalBilling.qty', 'Qty')}</th><th className="text-right py-2">{t('tools.medicalBilling.price', 'Price')}</th><th className="text-right py-2">{t('tools.medicalBilling.total', 'Total')}</th></tr></thead>
                        <tbody>
                          {selectedBill.lineItems.map(item => (
                            <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                              <td className="py-2">{item.cptCode}</td><td className="py-2">{item.description}</td><td className="py-2 text-right">{item.quantity}</td><td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td><td className="py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><p className="text-xs text-gray-400">{t('tools.medicalBilling.subtotal', 'Subtotal')}</p><p className="text-lg font-bold">{formatCurrency(selectedBill.subtotal)}</p></div>
                    <div><p className="text-xs text-gray-400">{t('tools.medicalBilling.insurancePayment', 'Insurance Payment')}</p><p className="text-lg font-bold text-green-400">-{formatCurrency(selectedBill.insurancePayment)}</p></div>
                    <div><p className="text-xs text-gray-400">{t('tools.medicalBilling.adjustments', 'Adjustments')}</p><p className="text-lg font-bold text-blue-400">-{formatCurrency(selectedBill.adjustments)}</p></div>
                    <div><p className="text-xs text-gray-400">{t('tools.medicalBilling.patientResponsibility', 'Patient Responsibility')}</p><p className="text-lg font-bold">{formatCurrency(selectedBill.patientResponsibility)}</p></div>
                    <div><p className="text-xs text-gray-400">{t('tools.medicalBilling.amountPaid', 'Amount Paid')}</p><p className="text-lg font-bold text-green-400">{formatCurrency(selectedBill.amountPaid)}</p></div>
                    <div><p className="text-xs text-gray-400">{t('tools.medicalBilling.amountDue', 'Amount Due')}</p><p className="text-lg font-bold text-orange-400">{formatCurrency(selectedBill.amountDue)}</p></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Receipt className="w-16 h-16 mb-4 opacity-50" /><p className="text-lg font-medium">{t('tools.medicalBilling.selectABill', 'Select a bill')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingBill ? t('tools.medicalBilling.editBill', 'Edit Bill') : t('tools.medicalBilling.newBill2', 'New Bill')}</h2>
              <button onClick={() => { setShowModal(false); setEditingBill(null); }} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>{t('tools.medicalBilling.patientName', 'Patient Name *')}</label><input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.medicalBilling.dateOfService', 'Date of Service *')}</label><input type="date" value={formData.dateOfService} onChange={(e) => setFormData({ ...formData, dateOfService: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.medicalBilling.status', 'Status')}</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}><option value="draft">{t('tools.medicalBilling.draft2', 'Draft')}</option><option value="submitted">{t('tools.medicalBilling.submitted2', 'Submitted')}</option><option value="pending">{t('tools.medicalBilling.pending2', 'Pending')}</option><option value="approved">{t('tools.medicalBilling.approved2', 'Approved')}</option><option value="paid">{t('tools.medicalBilling.paid2', 'Paid')}</option></select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>{t('tools.medicalBilling.insuranceProvider', 'Insurance Provider')}</label><input type="text" value={formData.insuranceProvider} onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.medicalBilling.policyNumber', 'Policy Number')}</label><input type="text" value={formData.policyNumber} onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.medicalBilling.dueDate2', 'Due Date')}</label><input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className={inputClass} /></div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.medicalBilling.diagnosisCodesIcd10', 'Diagnosis Codes (ICD-10)')}</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newDiagnosisCode} onChange={(e) => setNewDiagnosisCode(e.target.value)} placeholder="e.g., Z00.00" className={inputClass} />
                  <button type="button" onClick={addDiagnosisCode} className={buttonSecondary}><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.diagnosisCodes.map((code, i) => (
                    <span key={i} className="px-2 py-1 text-sm bg-blue-500/20 text-blue-400 rounded flex items-center gap-1">{code}<button onClick={() => setFormData({ ...formData, diagnosisCodes: formData.diagnosisCodes.filter((_, idx) => idx !== i) })}><X className="w-3 h-3" /></button></span>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tools.medicalBilling.lineItems2', 'Line Items')}</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <input type="text" value={newLineItem.cptCode} onChange={(e) => setNewLineItem({ ...newLineItem, cptCode: e.target.value })} placeholder={t('tools.medicalBilling.cptCode', 'CPT Code')} className={inputClass} />
                  <input type="text" value={newLineItem.description} onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })} placeholder={t('tools.medicalBilling.description2', 'Description')} className={inputClass} />
                  <input type="number" value={newLineItem.quantity} onChange={(e) => setNewLineItem({ ...newLineItem, quantity: parseInt(e.target.value) || 1 })} placeholder={t('tools.medicalBilling.qty2', 'Qty')} className={inputClass} />
                  <input type="number" value={newLineItem.unitPrice} onChange={(e) => setNewLineItem({ ...newLineItem, unitPrice: parseFloat(e.target.value) || 0 })} placeholder={t('tools.medicalBilling.price2', 'Price')} className={inputClass} />
                  <button type="button" onClick={addLineItem} className={buttonPrimary}><Plus className="w-4 h-4" /></button>
                </div>
                {formData.lineItems.length > 0 && (
                  <div className="space-y-2">
                    {formData.lineItems.map(item => (
                      <div key={item.id} className={`p-2 rounded flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <span>{item.cptCode} - {item.description} (x{item.quantity})</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(item.total)}</span>
                          <button onClick={() => removeLineItem(item.id)} className="text-red-500"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className={labelClass}>{t('tools.medicalBilling.insurancePayment2', 'Insurance Payment ($)')}</label><input type="number" value={formData.insurancePayment} onChange={(e) => setFormData({ ...formData, insurancePayment: parseFloat(e.target.value) || 0 })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.medicalBilling.adjustments2', 'Adjustments ($)')}</label><input type="number" value={formData.adjustments} onChange={(e) => setFormData({ ...formData, adjustments: parseFloat(e.target.value) || 0 })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.medicalBilling.amountPaid2', 'Amount Paid ($)')}</label><input type="number" value={formData.amountPaid} onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })} className={inputClass} /></div>
              </div>

              <div><label className={labelClass}>{t('tools.medicalBilling.notes', 'Notes')}</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={2} /></div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => { setShowModal(false); setEditingBill(null); }} className={buttonSecondary}>{t('tools.medicalBilling.cancel', 'Cancel')}</button>
                <button onClick={handleSave} disabled={!formData.patientName || !formData.dateOfService} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.medicalBilling.save', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.medicalBilling.aboutMedicalBilling', 'About Medical Billing')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.medicalBilling.trackMedicalBillsWithCpt', 'Track medical bills with CPT codes, diagnosis codes, and insurance claims. Monitor payments, adjustments, and outstanding balances.')}</p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default MedicalBillingTool;
