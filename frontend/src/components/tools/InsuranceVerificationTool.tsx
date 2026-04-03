'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Shield,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Phone,
  Building,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface InsuranceVerification {
  id: string;
  patientName: string;
  patientDOB: string;
  patientPhone: string;
  insuranceProvider: string;
  policyNumber: string;
  groupNumber: string;
  subscriberName: string;
  subscriberDOB: string;
  relationship: 'self' | 'spouse' | 'child' | 'other';
  effectiveDate: string;
  terminationDate: string;
  planType: 'hmo' | 'ppo' | 'epo' | 'pos' | 'hdhp' | 'medicare' | 'medicaid' | 'other';
  copay: number;
  deductible: number;
  deductibleMet: number;
  outOfPocketMax: number;
  outOfPocketMet: number;
  coinsurance: number;
  priorAuthRequired: boolean;
  referralRequired: boolean;
  inNetwork: boolean;
  verificationDate: string;
  verifiedBy: string;
  verificationMethod: 'phone' | 'portal' | 'fax' | 'other';
  confirmationNumber: string;
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'terminated';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface InsuranceVerificationToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'insurance-verification';

const insuranceColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'insuranceProvider', header: 'Provider', type: 'string' },
  { key: 'policyNumber', header: 'Policy #', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'verificationDate', header: 'Verified', type: 'date' },
];

const createNewVerification = (): InsuranceVerification => ({
  id: crypto.randomUUID(),
  patientName: '',
  patientDOB: '',
  patientPhone: '',
  insuranceProvider: '',
  policyNumber: '',
  groupNumber: '',
  subscriberName: '',
  subscriberDOB: '',
  relationship: 'self',
  effectiveDate: '',
  terminationDate: '',
  planType: 'ppo',
  copay: 0,
  deductible: 0,
  deductibleMet: 0,
  outOfPocketMax: 0,
  outOfPocketMet: 0,
  coinsurance: 20,
  priorAuthRequired: false,
  referralRequired: false,
  inNetwork: true,
  verificationDate: new Date().toISOString().split('T')[0],
  verifiedBy: '',
  verificationMethod: 'portal',
  confirmationNumber: '',
  status: 'pending',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const commonProviders = [
  'Aetna', 'Anthem Blue Cross', 'Blue Cross Blue Shield', 'Cigna', 'Humana',
  'Kaiser Permanente', 'UnitedHealthcare', 'Medicare', 'Medicaid', 'Tricare', 'Other',
];

export const InsuranceVerificationTool: React.FC<InsuranceVerificationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: verifications,
    addItem: addVerification,
    updateItem: updateVerification,
    deleteItem: deleteVerification,
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
  } = useToolData<InsuranceVerification>(TOOL_ID, [], insuranceColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<InsuranceVerification | null>(null);
  const [editingVerification, setEditingVerification] = useState<InsuranceVerification | null>(null);
  const [formData, setFormData] = useState<InsuranceVerification>(createNewVerification());

  const stats = useMemo(() => ({
    total: verifications.length,
    active: verifications.filter(v => v.status === 'active').length,
    pending: verifications.filter(v => v.status === 'pending').length,
    expired: verifications.filter(v => v.status === 'expired' || v.status === 'terminated').length,
  }), [verifications]);

  const filteredVerifications = useMemo(() => {
    return verifications.filter(v => {
      const matchesSearch = searchQuery === '' ||
        v.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.insuranceProvider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || v.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [verifications, searchQuery, filterStatus]);

  const handleSave = () => {
    if (editingVerification) {
      updateVerification(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addVerification({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingVerification(null);
    setFormData(createNewVerification());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Delete this verification?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteVerification(id);
      if (selectedVerification?.id === id) setSelectedVerification(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-gray-500/20 text-gray-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      expired: 'bg-red-500/20 text-red-400',
      terminated: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

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
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
            <Shield className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('tools.insuranceVerification.insuranceVerification', 'Insurance Verification')}</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceVerification.verifyPatientInsuranceCoverage', 'Verify patient insurance coverage')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="insurance-verification" toolName="Insurance Verification" />

          <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={theme as 'light' | 'dark'} showLabel size="md" />
          <ExportDropdown onExportCSV={() => exportCSV({ filename: 'insurance-verification' })} onExportExcel={() => exportExcel({ filename: 'insurance-verification' })} onExportJSON={() => exportJSON({ filename: 'insurance-verification' })} onExportPDF={() => exportPDF({ filename: 'insurance-verification', title: 'Insurance Verification' })} onPrint={() => print('Insurance Verification')} onCopyToClipboard={() => copyToClipboard('tab')} disabled={verifications.length === 0} theme={theme as 'light' | 'dark'} />
          <button onClick={() => { setFormData(createNewVerification()); setShowModal(true); }} className={buttonPrimary}><Plus className="w-4 h-4" /> {t('tools.insuranceVerification.newVerification', 'New Verification')}</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-cyan-500', icon: Shield },
          { label: 'Active', value: stats.active, color: 'text-green-500', icon: CheckCircle },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-500', icon: Clock },
          { label: 'Expired', value: stats.expired, color: 'text-red-500', icon: AlertCircle },
        ].map(stat => (
          <div key={stat.label} className={cardClass}>
            <div className="p-4 flex items-center gap-4">
              <div className={`p-3 ${stat.color.replace('text', 'bg')}/10 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.insuranceVerification.searchPatientPolicyOrProvider', 'Search patient, policy, or provider...')} className={`${inputClass} pl-10`} />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-40`}>
            <option value="">{t('tools.insuranceVerification.allStatus', 'All Status')}</option>
            <option value="active">{t('tools.insuranceVerification.active', 'Active')}</option>
            <option value="pending">{t('tools.insuranceVerification.pending', 'Pending')}</option>
            <option value="expired">{t('tools.insuranceVerification.expired', 'Expired')}</option>
            <option value="terminated">{t('tools.insuranceVerification.terminated', 'Terminated')}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardClass} lg:col-span-1`}>
          <div className="p-4 border-b border-gray-700"><h2 className="text-lg font-semibold">{t('tools.insuranceVerification.verifications', 'Verifications')}</h2></div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div></div>
            ) : filteredVerifications.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}><Shield className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{t('tools.insuranceVerification.noVerificationsFound', 'No verifications found')}</p></div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredVerifications.map(ver => (
                  <div key={ver.id} onClick={() => setSelectedVerification(ver)} className={`p-4 cursor-pointer transition-colors ${selectedVerification?.id === ver.id ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{ver.patientName}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{ver.insuranceProvider}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(ver.status)}`}>{ver.status}</span>
                          <span className="text-xs text-gray-400">{ver.policyNumber}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingVerification(ver); setFormData(ver); setShowModal(true); }} className="p-1.5 hover:bg-gray-600 rounded"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(ver.id); }} className="p-1.5 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`${cardClass} lg:col-span-2`}>
          {selectedVerification ? (
            <div>
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{selectedVerification.patientName}</h2>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(selectedVerification.status)}`}>{selectedVerification.status}</span>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{selectedVerification.insuranceProvider} - {selectedVerification.planType.toUpperCase()}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400">{t('tools.insuranceVerification.policy', 'Policy #')}</p><p className="font-medium">{selectedVerification.policyNumber}</p></div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400">{t('tools.insuranceVerification.group', 'Group #')}</p><p className="font-medium">{selectedVerification.groupNumber || 'N/A'}</p></div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400">{t('tools.insuranceVerification.effectiveDate', 'Effective Date')}</p><p className="font-medium">{selectedVerification.effectiveDate || 'N/A'}</p></div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400">{t('tools.insuranceVerification.verified', 'Verified')}</p><p className="font-medium">{selectedVerification.verificationDate}</p></div>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /> {t('tools.insuranceVerification.costSharing', 'Cost Sharing')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="text-xs text-gray-400">{t('tools.insuranceVerification.copay', 'Copay')}</p><p className="font-medium text-lg">{formatCurrency(selectedVerification.copay)}</p></div>
                    <div><p className="text-xs text-gray-400">{t('tools.insuranceVerification.deductible', 'Deductible')}</p><p className="font-medium text-lg">{formatCurrency(selectedVerification.deductibleMet)} / {formatCurrency(selectedVerification.deductible)}</p></div>
                    <div><p className="text-xs text-gray-400">{t('tools.insuranceVerification.outOfPocketMax', 'Out of Pocket Max')}</p><p className="font-medium text-lg">{formatCurrency(selectedVerification.outOfPocketMet)} / {formatCurrency(selectedVerification.outOfPocketMax)}</p></div>
                    <div><p className="text-xs text-gray-400">{t('tools.insuranceVerification.coinsurance', 'Coinsurance')}</p><p className="font-medium text-lg">{selectedVerification.coinsurance}%</p></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg text-center ${selectedVerification.inNetwork ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <p className={selectedVerification.inNetwork ? 'text-green-400' : 'text-red-400'}>{selectedVerification.inNetwork ? t('tools.insuranceVerification.inNetwork2', 'In-Network') : t('tools.insuranceVerification.outOfNetwork', 'Out-of-Network')}</p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${selectedVerification.priorAuthRequired ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                    <p className={selectedVerification.priorAuthRequired ? 'text-yellow-400' : 'text-green-400'}>{selectedVerification.priorAuthRequired ? t('tools.insuranceVerification.priorAuthRequired2', 'Prior Auth Required') : t('tools.insuranceVerification.noPriorAuth', 'No Prior Auth')}</p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${selectedVerification.referralRequired ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                    <p className={selectedVerification.referralRequired ? 'text-yellow-400' : 'text-green-400'}>{selectedVerification.referralRequired ? t('tools.insuranceVerification.referralRequired2', 'Referral Required') : t('tools.insuranceVerification.noReferralNeeded', 'No Referral Needed')}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}><p className="text-xs text-gray-400 text-center">{t('tools.insuranceVerification.conf', 'Conf #')}</p><p className="font-medium text-center">{selectedVerification.confirmationNumber || 'N/A'}</p></div>
                </div>

                {selectedVerification.notes && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2">{t('tools.insuranceVerification.notes', 'Notes')}</h3>
                    <p className="text-sm">{selectedVerification.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Shield className="w-16 h-16 mb-4 opacity-50" /><p className="text-lg font-medium">{t('tools.insuranceVerification.selectAVerification', 'Select a verification')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingVerification ? t('tools.insuranceVerification.editVerification', 'Edit Verification') : t('tools.insuranceVerification.newVerification2', 'New Verification')}</h2>
              <button onClick={() => { setShowModal(false); setEditingVerification(null); }} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="font-semibold">{t('tools.insuranceVerification.patientInformation', 'Patient Information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>{t('tools.insuranceVerification.patientName', 'Patient Name *')}</label><input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.patientDob', 'Patient DOB')}</label><input type="date" value={formData.patientDOB} onChange={(e) => setFormData({ ...formData, patientDOB: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.patientPhone', 'Patient Phone')}</label><input type="tel" value={formData.patientPhone} onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })} className={inputClass} /></div>
              </div>

              <h3 className="font-semibold mt-4">{t('tools.insuranceVerification.insuranceInformation', 'Insurance Information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>{t('tools.insuranceVerification.insuranceProvider', 'Insurance Provider *')}</label><select value={formData.insuranceProvider} onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })} className={inputClass}><option value="">Select</option>{commonProviders.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.policyNumber', 'Policy Number *')}</label><input type="text" value={formData.policyNumber} onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.groupNumber', 'Group Number')}</label><input type="text" value={formData.groupNumber} onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.planType', 'Plan Type')}</label><select value={formData.planType} onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })} className={inputClass}><option value="hmo">{t('tools.insuranceVerification.hmo', 'HMO')}</option><option value="ppo">{t('tools.insuranceVerification.ppo', 'PPO')}</option><option value="epo">{t('tools.insuranceVerification.epo', 'EPO')}</option><option value="pos">{t('tools.insuranceVerification.pos', 'POS')}</option><option value="hdhp">{t('tools.insuranceVerification.hdhp', 'HDHP')}</option><option value="medicare">{t('tools.insuranceVerification.medicare', 'Medicare')}</option><option value="medicaid">{t('tools.insuranceVerification.medicaid', 'Medicaid')}</option></select></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.effectiveDate2', 'Effective Date')}</label><input type="date" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.status', 'Status')}</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}><option value="pending">{t('tools.insuranceVerification.pending2', 'Pending')}</option><option value="active">{t('tools.insuranceVerification.active2', 'Active')}</option><option value="inactive">{t('tools.insuranceVerification.inactive', 'Inactive')}</option><option value="expired">{t('tools.insuranceVerification.expired2', 'Expired')}</option></select></div>
              </div>

              <h3 className="font-semibold mt-4">{t('tools.insuranceVerification.costSharing2', 'Cost Sharing')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className={labelClass}>{t('tools.insuranceVerification.copay2', 'Copay ($)')}</label><input type="number" value={formData.copay} onChange={(e) => setFormData({ ...formData, copay: parseFloat(e.target.value) || 0 })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.deductible2', 'Deductible ($)')}</label><input type="number" value={formData.deductible} onChange={(e) => setFormData({ ...formData, deductible: parseFloat(e.target.value) || 0 })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.deductibleMet', 'Deductible Met ($)')}</label><input type="number" value={formData.deductibleMet} onChange={(e) => setFormData({ ...formData, deductibleMet: parseFloat(e.target.value) || 0 })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.coinsurance2', 'Coinsurance (%)')}</label><input type="number" value={formData.coinsurance} onChange={(e) => setFormData({ ...formData, coinsurance: parseFloat(e.target.value) || 0 })} className={inputClass} /></div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.inNetwork} onChange={(e) => setFormData({ ...formData, inNetwork: e.target.checked })} className="w-4 h-4" /> {t('tools.insuranceVerification.inNetwork', 'In-Network')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.priorAuthRequired} onChange={(e) => setFormData({ ...formData, priorAuthRequired: e.target.checked })} className="w-4 h-4" /> {t('tools.insuranceVerification.priorAuthRequired', 'Prior Auth Required')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.referralRequired} onChange={(e) => setFormData({ ...formData, referralRequired: e.target.checked })} className="w-4 h-4" /> {t('tools.insuranceVerification.referralRequired', 'Referral Required')}</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>{t('tools.insuranceVerification.verificationDate', 'Verification Date')}</label><input type="date" value={formData.verificationDate} onChange={(e) => setFormData({ ...formData, verificationDate: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.verifiedBy', 'Verified By')}</label><input type="text" value={formData.verifiedBy} onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.insuranceVerification.confirmation', 'Confirmation #')}</label><input type="text" value={formData.confirmationNumber} onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })} className={inputClass} /></div>
              </div>

              <div><label className={labelClass}>{t('tools.insuranceVerification.notes2', 'Notes')}</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={2} /></div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => { setShowModal(false); setEditingVerification(null); }} className={buttonSecondary}>{t('tools.insuranceVerification.cancel', 'Cancel')}</button>
                <button onClick={handleSave} disabled={!formData.patientName || !formData.insuranceProvider || !formData.policyNumber} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.insuranceVerification.save', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.insuranceVerification.aboutInsuranceVerification', 'About Insurance Verification')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.insuranceVerification.verifyPatientInsuranceEligibilityAnd', 'Verify patient insurance eligibility and benefits. Track copays, deductibles, and authorization requirements for accurate billing and patient communication.')}</p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default InsuranceVerificationTool;
