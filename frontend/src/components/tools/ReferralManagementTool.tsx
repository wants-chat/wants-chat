'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Building,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface Referral {
  id: string;
  patientName: string;
  patientDOB: string;
  patientPhone: string;
  referringPhysician: string;
  referringFacility: string;
  referredToPhysician: string;
  referredToFacility: string;
  referredToPhone: string;
  referredToFax: string;
  specialty: string;
  priority: 'routine' | 'urgent' | 'emergent';
  reason: string;
  diagnosis: string;
  clinicalNotes: string;
  insuranceAuthorization: string;
  authorizationNumber: string;
  referralDate: string;
  appointmentDate: string;
  status: 'pending' | 'sent' | 'scheduled' | 'completed' | 'cancelled' | 'expired';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ReferralManagementToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'referral-management';

const referralColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient', type: 'string' },
  { key: 'referredToPhysician', header: 'Referred To', type: 'string' },
  { key: 'specialty', header: 'Specialty', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'referralDate', header: 'Referral Date', type: 'date' },
];

const createNewReferral = (): Referral => ({
  id: crypto.randomUUID(),
  patientName: '',
  patientDOB: '',
  patientPhone: '',
  referringPhysician: '',
  referringFacility: '',
  referredToPhysician: '',
  referredToFacility: '',
  referredToPhone: '',
  referredToFax: '',
  specialty: '',
  priority: 'routine',
  reason: '',
  diagnosis: '',
  clinicalNotes: '',
  insuranceAuthorization: '',
  authorizationNumber: '',
  referralDate: new Date().toISOString().split('T')[0],
  appointmentDate: '',
  status: 'pending',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const specialties = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'Neurology',
  'Oncology', 'Ophthalmology', 'Orthopedics', 'Pulmonology', 'Rheumatology',
  'Urology', 'Psychiatry', 'Radiology', 'Surgery', 'Physical Therapy', 'Other',
];

export const ReferralManagementTool: React.FC<ReferralManagementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: referrals,
    addItem: addReferral,
    updateItem: updateReferral,
    deleteItem: deleteReferral,
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
  } = useToolData<Referral>(TOOL_ID, [], referralColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [formData, setFormData] = useState<Referral>(createNewReferral());

  const stats = useMemo(() => ({
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    sent: referrals.filter(r => r.status === 'sent').length,
    scheduled: referrals.filter(r => r.status === 'scheduled').length,
    urgent: referrals.filter(r => r.priority === 'urgent' || r.priority === 'emergent').length,
  }), [referrals]);

  const filteredReferrals = useMemo(() => {
    return referrals.filter(r => {
      const matchesSearch = searchQuery === '' ||
        r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.referredToPhysician.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === '' || r.status === filterStatus;
      const matchesPriority = filterPriority === '' || r.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [referrals, searchQuery, filterStatus, filterPriority]);

  const handleSave = () => {
    if (editingReferral) {
      updateReferral(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addReferral({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingReferral(null);
    setFormData(createNewReferral());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Referral',
      message: 'Are you sure you want to delete this referral? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteReferral(id);
      if (selectedReferral?.id === id) setSelectedReferral(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      sent: 'bg-blue-500/20 text-blue-400',
      scheduled: 'bg-green-500/20 text-green-400',
      completed: 'bg-emerald-500/20 text-emerald-400',
      cancelled: 'bg-red-500/20 text-red-400',
      expired: 'bg-gray-500/20 text-gray-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      routine: 'bg-green-500/20 text-green-400',
      urgent: 'bg-orange-500/20 text-orange-400',
      emergent: 'bg-red-500/20 text-red-400',
    };
    return colors[priority] || 'bg-gray-500/20 text-gray-400';
  };

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
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl">
            <Send className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('tools.referralManagement.referralManagement', 'Referral Management')}</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.referralManagement.managePatientReferrals', 'Manage patient referrals')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="referral-management" toolName="Referral Management" />

          <SyncStatus isSynced={isSynced} isSaving={isSaving} lastSaved={lastSaved} syncError={syncError} onForceSync={forceSync} theme={theme as 'light' | 'dark'} showLabel size="md" />
          <ExportDropdown onExportCSV={() => exportCSV({ filename: 'referrals' })} onExportExcel={() => exportExcel({ filename: 'referrals' })} onExportJSON={() => exportJSON({ filename: 'referrals' })} onExportPDF={() => exportPDF({ filename: 'referrals', title: 'Referrals' })} onPrint={() => print('Referrals')} onCopyToClipboard={() => copyToClipboard('tab')} disabled={referrals.length === 0} theme={theme as 'light' | 'dark'} />
          <button onClick={() => { setFormData(createNewReferral()); setShowModal(true); }} className={buttonPrimary}><Plus className="w-4 h-4" /> {t('tools.referralManagement.newReferral', 'New Referral')}</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-cyan-500' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-500' },
          { label: 'Sent', value: stats.sent, color: 'text-blue-500' },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-green-500' },
          { label: 'Urgent', value: stats.urgent, color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className={cardClass}>
            <div className="p-4 text-center">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.referralManagement.search', 'Search...')} className={`${inputClass} pl-10`} />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-36`}>
            <option value="">{t('tools.referralManagement.allStatus', 'All Status')}</option>
            <option value="pending">{t('tools.referralManagement.pending', 'Pending')}</option>
            <option value="sent">{t('tools.referralManagement.sent', 'Sent')}</option>
            <option value="scheduled">{t('tools.referralManagement.scheduled', 'Scheduled')}</option>
            <option value="completed">{t('tools.referralManagement.completed', 'Completed')}</option>
            <option value="cancelled">{t('tools.referralManagement.cancelled', 'Cancelled')}</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={`${inputClass} w-full sm:w-36`}>
            <option value="">{t('tools.referralManagement.allPriority', 'All Priority')}</option>
            <option value="routine">{t('tools.referralManagement.routine', 'Routine')}</option>
            <option value="urgent">{t('tools.referralManagement.urgent', 'Urgent')}</option>
            <option value="emergent">{t('tools.referralManagement.emergent', 'Emergent')}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardClass} lg:col-span-1`}>
          <div className="p-4 border-b border-gray-700"><h2 className="text-lg font-semibold">{t('tools.referralManagement.referrals', 'Referrals')}</h2></div>
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div></div>
            ) : filteredReferrals.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}><Send className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{t('tools.referralManagement.noReferralsFound', 'No referrals found')}</p></div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredReferrals.map(ref => (
                  <div key={ref.id} onClick={() => setSelectedReferral(ref)} className={`p-4 cursor-pointer transition-colors ${selectedReferral?.id === ref.id ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{ref.patientName}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}><ArrowRight className="w-3 h-3 inline" /> {ref.referredToPhysician || ref.specialty}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(ref.status)}`}>{ref.status}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(ref.priority)}`}>{ref.priority}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingReferral(ref); setFormData(ref); setShowModal(true); }} className="p-1.5 hover:bg-gray-600 rounded"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(ref.id); }} className="p-1.5 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`${cardClass} lg:col-span-2`}>
          {selectedReferral ? (
            <div>
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{selectedReferral.patientName}</h2>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(selectedReferral.status)}`}>{selectedReferral.status}</span>
                  <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(selectedReferral.priority)}`}>{selectedReferral.priority}</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2">{t('tools.referralManagement.referringProvider', 'Referring Provider')}</h3>
                    <p>{selectedReferral.referringPhysician || 'N/A'}</p>
                    <p className="text-sm text-gray-400">{selectedReferral.referringFacility || 'N/A'}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2">{t('tools.referralManagement.referredTo', 'Referred To')}</h3>
                    <p>{selectedReferral.referredToPhysician || 'N/A'}</p>
                    <p className="text-sm text-gray-400">{selectedReferral.referredToFacility || 'N/A'}</p>
                    <p className="text-sm text-gray-400">{selectedReferral.specialty}</p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-2">{t('tools.referralManagement.reasonForReferral', 'Reason for Referral')}</h3>
                  <p>{selectedReferral.reason || 'N/A'}</p>
                </div>
                {selectedReferral.diagnosis && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className="font-semibold mb-2">{t('tools.referralManagement.diagnosis', 'Diagnosis')}</h3>
                    <p>{selectedReferral.diagnosis}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.referralManagement.referralDate', 'Referral Date')}</p>
                    <p className="font-medium">{selectedReferral.referralDate}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.referralManagement.appointment', 'Appointment')}</p>
                    <p className="font-medium">{selectedReferral.appointmentDate || 'Not scheduled'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.referralManagement.authorization', 'Authorization')}</p>
                    <p className="font-medium">{selectedReferral.authorizationNumber || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400">{t('tools.referralManagement.patientDob', 'Patient DOB')}</p>
                    <p className="font-medium">{selectedReferral.patientDOB || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Send className="w-16 h-16 mb-4 opacity-50" /><p className="text-lg font-medium">{t('tools.referralManagement.selectAReferral', 'Select a referral')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingReferral ? t('tools.referralManagement.editReferral', 'Edit Referral') : t('tools.referralManagement.newReferral2', 'New Referral')}</h2>
              <button onClick={() => { setShowModal(false); setEditingReferral(null); }} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>{t('tools.referralManagement.patientName', 'Patient Name *')}</label><input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.referralManagement.patientDob2', 'Patient DOB')}</label><input type="date" value={formData.patientDOB} onChange={(e) => setFormData({ ...formData, patientDOB: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.referralManagement.patientPhone', 'Patient Phone')}</label><input type="tel" value={formData.patientPhone} onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>{t('tools.referralManagement.referringPhysician', 'Referring Physician')}</label><input type="text" value={formData.referringPhysician} onChange={(e) => setFormData({ ...formData, referringPhysician: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.referralManagement.referringFacility', 'Referring Facility')}</label><input type="text" value={formData.referringFacility} onChange={(e) => setFormData({ ...formData, referringFacility: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>{t('tools.referralManagement.referredToPhysician', 'Referred To Physician')}</label><input type="text" value={formData.referredToPhysician} onChange={(e) => setFormData({ ...formData, referredToPhysician: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.referralManagement.referredToFacility', 'Referred To Facility')}</label><input type="text" value={formData.referredToFacility} onChange={(e) => setFormData({ ...formData, referredToFacility: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.referralManagement.specialty', 'Specialty *')}</label><select value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className={inputClass}><option value="">Select</option>{specialties.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>{t('tools.referralManagement.priority', 'Priority')}</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} className={inputClass}><option value="routine">{t('tools.referralManagement.routine2', 'Routine')}</option><option value="urgent">{t('tools.referralManagement.urgent2', 'Urgent')}</option><option value="emergent">{t('tools.referralManagement.emergent2', 'Emergent')}</option></select></div>
                <div><label className={labelClass}>{t('tools.referralManagement.status', 'Status')}</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputClass}><option value="pending">{t('tools.referralManagement.pending2', 'Pending')}</option><option value="sent">{t('tools.referralManagement.sent2', 'Sent')}</option><option value="scheduled">{t('tools.referralManagement.scheduled2', 'Scheduled')}</option><option value="completed">{t('tools.referralManagement.completed2', 'Completed')}</option><option value="cancelled">{t('tools.referralManagement.cancelled2', 'Cancelled')}</option></select></div>
                <div><label className={labelClass}>{t('tools.referralManagement.referralDate2', 'Referral Date')}</label><input type="date" value={formData.referralDate} onChange={(e) => setFormData({ ...formData, referralDate: e.target.value })} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>{t('tools.referralManagement.reasonForReferral2', 'Reason for Referral *')}</label><textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className={inputClass} rows={3} /></div>
              <div><label className={labelClass}>{t('tools.referralManagement.diagnosis2', 'Diagnosis')}</label><input type="text" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} className={inputClass} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>{t('tools.referralManagement.authorizationNumber', 'Authorization Number')}</label><input type="text" value={formData.authorizationNumber} onChange={(e) => setFormData({ ...formData, authorizationNumber: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>{t('tools.referralManagement.appointmentDate', 'Appointment Date')}</label><input type="date" value={formData.appointmentDate} onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>{t('tools.referralManagement.notes', 'Notes')}</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={2} /></div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => { setShowModal(false); setEditingReferral(null); }} className={buttonSecondary}>{t('tools.referralManagement.cancel', 'Cancel')}</button>
                <button onClick={handleSave} disabled={!formData.patientName || !formData.specialty || !formData.reason} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.referralManagement.save', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.referralManagement.aboutReferralManagement', 'About Referral Management')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.referralManagement.trackPatientReferralsToSpecialists', 'Track patient referrals to specialists and other providers. Manage referral status, priority levels, and authorization details for streamlined care coordination.')}</p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default ReferralManagementTool;
