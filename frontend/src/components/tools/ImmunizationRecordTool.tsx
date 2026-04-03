'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Syringe,
  User,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Calendar,
  Save,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  FileText,
  Bell,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

// Types
interface Vaccination {
  id: string;
  vaccineName: string;
  doseNumber: number;
  totalDoses: number;
  dateAdministered: string;
  expirationDate?: string;
  lotNumber: string;
  manufacturer: string;
  administeredBy: string;
  location: string;
  route: 'intramuscular' | 'subcutaneous' | 'oral' | 'intranasal' | 'intradermal';
  site: string;
  sideEffects?: string;
  notes: string;
}

interface ImmunizationRecord {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  vaccinations: Vaccination[];
  upcomingVaccinations: {
    id: string;
    vaccineName: string;
    dueDate: string;
    notes: string;
  }[];
  exemptions: {
    id: string;
    vaccineType: string;
    reason: 'medical' | 'religious' | 'philosophical';
    dateIssued: string;
    expirationDate?: string;
    notes: string;
  }[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ImmunizationRecordToolProps {
  uiConfig?: UIConfig;
}

const TOOL_ID = 'immunization-record';

const immunizationColumns: ColumnConfig[] = [
  { key: 'patientName', header: 'Patient Name', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'vaccinationCount', header: 'Vaccinations', type: 'number' },
  { key: 'upcomingCount', header: 'Upcoming', type: 'number' },
  { key: 'updatedAt', header: 'Last Updated', type: 'date' },
];

const createNewRecord = (): ImmunizationRecord => ({
  id: crypto.randomUUID(),
  patientId: '',
  patientName: '',
  dateOfBirth: '',
  vaccinations: [],
  upcomingVaccinations: [],
  exemptions: [],
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const commonVaccines = [
  'COVID-19', 'Influenza', 'Tdap', 'MMR', 'Varicella', 'Hepatitis A',
  'Hepatitis B', 'Polio (IPV)', 'HPV', 'Meningococcal', 'Pneumococcal',
  'Shingles', 'Rotavirus', 'DTaP', 'Hib', 'PCV13', 'PPSV23',
];

const routes = [
  { value: 'intramuscular', label: 'Intramuscular (IM)' },
  { value: 'subcutaneous', label: 'Subcutaneous (SC)' },
  { value: 'oral', label: 'Oral' },
  { value: 'intranasal', label: 'Intranasal' },
  { value: 'intradermal', label: 'Intradermal (ID)' },
];

export const ImmunizationRecordTool: React.FC<ImmunizationRecordToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: records,
    addItem: addRecord,
    updateItem: updateRecord,
    deleteItem: deleteRecord,
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
  } = useToolData<ImmunizationRecord>(TOOL_ID, [], immunizationColumns);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ImmunizationRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<ImmunizationRecord | null>(null);
  const [formData, setFormData] = useState<ImmunizationRecord>(createNewRecord());
  const [activeTab, setActiveTab] = useState<'history' | 'upcoming' | 'exemptions'>('history');

  const [newVaccination, setNewVaccination] = useState<Omit<Vaccination, 'id'>>({
    vaccineName: '',
    doseNumber: 1,
    totalDoses: 1,
    dateAdministered: new Date().toISOString().split('T')[0],
    lotNumber: '',
    manufacturer: '',
    administeredBy: '',
    location: '',
    route: 'intramuscular',
    site: '',
    notes: '',
  });

  const [newUpcoming, setNewUpcoming] = useState({ vaccineName: '', dueDate: '', notes: '' });
  const [newExemption, setNewExemption] = useState({ vaccineType: '', reason: 'medical' as const, dateIssued: '', expirationDate: '', notes: '' });

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    const totalVaccinations = records.reduce((sum, r) => sum + r.vaccinations.length, 0);
    const upcomingDue = records.reduce((sum, r) => {
      return sum + r.upcomingVaccinations.filter(v => new Date(v.dueDate) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)).length;
    }, 0);
    const overdue = records.reduce((sum, r) => {
      return sum + r.upcomingVaccinations.filter(v => new Date(v.dueDate) < today).length;
    }, 0);
    return {
      totalPatients: records.length,
      totalVaccinations,
      upcomingDue,
      overdue,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      return searchQuery === '' ||
        record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patientId.includes(searchQuery);
    });
  }, [records, searchQuery]);

  const handleSave = () => {
    if (editingRecord) {
      updateRecord(formData.id, { ...formData, updatedAt: new Date().toISOString() });
    } else {
      addRecord({ ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setShowModal(false);
    setEditingRecord(null);
    setFormData(createNewRecord());
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this immunization record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteRecord(id);
      if (selectedRecord?.id === id) setSelectedRecord(null);
    }
  };

  const addVaccination = () => {
    if (selectedRecord && newVaccination.vaccineName) {
      const vaccination: Vaccination = { ...newVaccination, id: crypto.randomUUID() };
      const updated = { ...selectedRecord, vaccinations: [...selectedRecord.vaccinations, vaccination], updatedAt: new Date().toISOString() };
      updateRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
      setShowVaccinationModal(false);
      setNewVaccination({
        vaccineName: '', doseNumber: 1, totalDoses: 1, dateAdministered: new Date().toISOString().split('T')[0],
        lotNumber: '', manufacturer: '', administeredBy: '', location: '', route: 'intramuscular', site: '', notes: '',
      });
    }
  };

  const deleteVaccination = async (vaccinationId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Delete this vaccination record?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (selectedRecord && confirmed) {
      const updated = { ...selectedRecord, vaccinations: selectedRecord.vaccinations.filter(v => v.id !== vaccinationId), updatedAt: new Date().toISOString() };
      updateRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
    }
  };

  const addUpcomingVaccination = () => {
    if (selectedRecord && newUpcoming.vaccineName && newUpcoming.dueDate) {
      const upcoming = { ...newUpcoming, id: crypto.randomUUID() };
      const updated = { ...selectedRecord, upcomingVaccinations: [...selectedRecord.upcomingVaccinations, upcoming], updatedAt: new Date().toISOString() };
      updateRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
      setNewUpcoming({ vaccineName: '', dueDate: '', notes: '' });
    }
  };

  const deleteUpcoming = (id: string) => {
    if (selectedRecord) {
      const updated = { ...selectedRecord, upcomingVaccinations: selectedRecord.upcomingVaccinations.filter(v => v.id !== id), updatedAt: new Date().toISOString() };
      updateRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
    }
  };

  const addExemption = () => {
    if (selectedRecord && newExemption.vaccineType) {
      const exemption = { ...newExemption, id: crypto.randomUUID() };
      const updated = { ...selectedRecord, exemptions: [...selectedRecord.exemptions, exemption], updatedAt: new Date().toISOString() };
      updateRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
      setNewExemption({ vaccineType: '', reason: 'medical', dateIssued: '', expirationDate: '', notes: '' });
    }
  };

  const deleteExemption = (id: string) => {
    if (selectedRecord) {
      const updated = { ...selectedRecord, exemptions: selectedRecord.exemptions.filter(e => e.id !== id), updatedAt: new Date().toISOString() };
      updateRecord(selectedRecord.id, updated);
      setSelectedRecord(updated);
    }
  };

  const getDueStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    if (due < today) return { status: 'overdue', color: 'bg-red-500/20 text-red-400' };
    if (due <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) return { status: 'due soon', color: 'bg-yellow-500/20 text-yellow-400' };
    return { status: 'scheduled', color: 'bg-green-500/20 text-green-400' };
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

  const tabClass = (isActive: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-cyan-500 text-white'
      : theme === 'dark'
      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl">
            <Syringe className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.immunizationRecord.immunizationRecords', 'Immunization Records')}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.immunizationRecord.vaccinationTrackingAndHistory', 'Vaccination tracking and history')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="immunization-record" toolName="Immunization Record" />

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
            onExportCSV={() => exportCSV({ filename: 'immunization-records' })}
            onExportExcel={() => exportExcel({ filename: 'immunization-records' })}
            onExportJSON={() => exportJSON({ filename: 'immunization-records' })}
            onExportPDF={() => exportPDF({ filename: 'immunization-records', title: 'Immunization Records' })}
            onPrint={() => print('Immunization Records')}
            onCopyToClipboard={() => copyToClipboard('tab')}
            disabled={records.length === 0}
            theme={theme as 'light' | 'dark'}
          />
          <button onClick={() => { setFormData(createNewRecord()); setShowModal(true); }} className={buttonPrimary}>
            <Plus className="w-4 h-4" />
            {t('tools.immunizationRecord.addPatient', 'Add Patient')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <User className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.immunizationRecord.totalPatients', 'Total Patients')}</p>
              <p className="text-2xl font-bold text-cyan-500">{stats.totalPatients}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.immunizationRecord.vaccinations', 'Vaccinations')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.totalVaccinations}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.immunizationRecord.due30Days', 'Due (30 days)')}</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.upcomingDue}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.immunizationRecord.overdue', 'Overdue')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className={`${cardClass} lg:col-span-1`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold mb-4">{t('tools.immunizationRecord.patientRecords', 'Patient Records')}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tools.immunizationRecord.searchPatients', 'Search patients...')}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Syringe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('tools.immunizationRecord.noRecordsFound', 'No records found')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredRecords.map(record => (
                  <div
                    key={record.id}
                    onClick={() => { setSelectedRecord(record); setActiveTab('history'); }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedRecord?.id === record.id
                        ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                        : theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{record.patientName}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {record.vaccinations.length} vaccinations
                        </p>
                        {record.upcomingVaccinations.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-400 mt-1">
                            <Bell className="w-3 h-3" /> {record.upcomingVaccinations.length} upcoming
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingRecord(record); setFormData(record); setShowModal(true); }} className="p-1.5 hover:bg-gray-600 rounded">
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} className="p-1.5 hover:bg-red-500/20 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`${cardClass} lg:col-span-2`}>
          {selectedRecord ? (
            <div>
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold">{selectedRecord.patientName}</h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  DOB: {selectedRecord.dateOfBirth || 'N/A'}
                </p>
              </div>

              {/* Tabs */}
              <div className="px-6 py-3 border-b border-gray-700 flex gap-2">
                <button onClick={() => setActiveTab('history')} className={tabClass(activeTab === 'history')}>
                  History ({selectedRecord.vaccinations.length})
                </button>
                <button onClick={() => setActiveTab('upcoming')} className={tabClass(activeTab === 'upcoming')}>
                  Upcoming ({selectedRecord.upcomingVaccinations.length})
                </button>
                <button onClick={() => setActiveTab('exemptions')} className={tabClass(activeTab === 'exemptions')}>
                  Exemptions ({selectedRecord.exemptions.length})
                </button>
              </div>

              <div className="p-6">
                {/* History Tab */}
                {activeTab === 'history' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{t('tools.immunizationRecord.vaccinationHistory', 'Vaccination History')}</h3>
                      <button onClick={() => setShowVaccinationModal(true)} className={buttonPrimary}>
                        <Plus className="w-4 h-4" /> Add Vaccination
                      </button>
                    </div>
                    {selectedRecord.vaccinations.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.immunizationRecord.noVaccinationsRecorded', 'No vaccinations recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {[...selectedRecord.vaccinations].reverse().map(vac => (
                          <div key={vac.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{vac.vaccineName}</p>
                                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                                    Dose {vac.doseNumber}/{vac.totalDoses}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                  {vac.dateAdministered} | {vac.manufacturer || 'Unknown manufacturer'}
                                </p>
                                <p className="text-sm text-gray-400">Lot: {vac.lotNumber || 'N/A'} | Route: {vac.route}</p>
                                {vac.administeredBy && <p className="text-sm text-gray-400">By: {vac.administeredBy}</p>}
                              </div>
                              <button onClick={() => deleteVaccination(vac.id)} className="text-red-500 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Upcoming Tab */}
                {activeTab === 'upcoming' && (
                  <div>
                    <h3 className="font-semibold mb-4">{t('tools.immunizationRecord.upcomingVaccinations', 'Upcoming Vaccinations')}</h3>
                    <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select value={newUpcoming.vaccineName} onChange={(e) => setNewUpcoming({ ...newUpcoming, vaccineName: e.target.value })} className={inputClass}>
                          <option value="">{t('tools.immunizationRecord.selectVaccine', 'Select vaccine')}</option>
                          {commonVaccines.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <input type="date" value={newUpcoming.dueDate} onChange={(e) => setNewUpcoming({ ...newUpcoming, dueDate: e.target.value })} className={inputClass} />
                        <button onClick={addUpcomingVaccination} className={buttonPrimary}><Plus className="w-4 h-4" /> {t('tools.immunizationRecord.add', 'Add')}</button>
                      </div>
                    </div>
                    {selectedRecord.upcomingVaccinations.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.immunizationRecord.noUpcomingVaccinations', 'No upcoming vaccinations')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedRecord.upcomingVaccinations.map(vac => {
                          const due = getDueStatus(vac.dueDate);
                          return (
                            <div key={vac.id} className={`p-4 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div>
                                <p className="font-medium">{vac.vaccineName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm">{vac.dueDate}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${due.color}`}>{due.status}</span>
                                </div>
                              </div>
                              <button onClick={() => deleteUpcoming(vac.id)} className="text-red-500 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Exemptions Tab */}
                {activeTab === 'exemptions' && (
                  <div>
                    <h3 className="font-semibold mb-4">{t('tools.immunizationRecord.vaccineExemptions', 'Vaccine Exemptions')}</h3>
                    <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input type="text" value={newExemption.vaccineType} onChange={(e) => setNewExemption({ ...newExemption, vaccineType: e.target.value })} placeholder={t('tools.immunizationRecord.vaccineType', 'Vaccine type')} className={inputClass} />
                        <select value={newExemption.reason} onChange={(e) => setNewExemption({ ...newExemption, reason: e.target.value as any })} className={inputClass}>
                          <option value="medical">{t('tools.immunizationRecord.medical', 'Medical')}</option>
                          <option value="religious">{t('tools.immunizationRecord.religious', 'Religious')}</option>
                          <option value="philosophical">{t('tools.immunizationRecord.philosophical', 'Philosophical')}</option>
                        </select>
                        <input type="date" value={newExemption.dateIssued} onChange={(e) => setNewExemption({ ...newExemption, dateIssued: e.target.value })} className={inputClass} />
                        <button onClick={addExemption} className={buttonPrimary}><Plus className="w-4 h-4" /> {t('tools.immunizationRecord.add2', 'Add')}</button>
                      </div>
                    </div>
                    {selectedRecord.exemptions.length === 0 ? (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.immunizationRecord.noExemptionsRecorded', 'No exemptions recorded')}</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedRecord.exemptions.map(ex => (
                          <div key={ex.id} className={`p-4 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div>
                              <p className="font-medium">{ex.vaccineType}</p>
                              <p className="text-sm text-gray-400">Reason: {ex.reason} | Issued: {ex.dateIssued}</p>
                            </div>
                            <button onClick={() => deleteExemption(ex.id)} className="text-red-500 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Syringe className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('tools.immunizationRecord.selectAPatientRecord', 'Select a patient record')}</p>
              <p className="text-sm">{t('tools.immunizationRecord.chooseAPatientToView', 'Choose a patient to view immunization history')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-lg`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingRecord ? t('tools.immunizationRecord.editPatient', 'Edit Patient') : t('tools.immunizationRecord.addPatient2', 'Add Patient')}</h2>
              <button onClick={() => { setShowModal(false); setEditingRecord(null); }} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>{t('tools.immunizationRecord.patientName', 'Patient Name *')}</label>
                <input type="text" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.immunizationRecord.dateOfBirth', 'Date of Birth')}</label>
                <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('tools.immunizationRecord.notes', 'Notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputClass} rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => { setShowModal(false); setEditingRecord(null); }} className={buttonSecondary}>{t('tools.immunizationRecord.cancel', 'Cancel')}</button>
                <button onClick={handleSave} disabled={!formData.patientName} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.immunizationRecord.save', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vaccination Modal */}
      {showVaccinationModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('tools.immunizationRecord.addVaccination', 'Add Vaccination')}</h2>
              <button onClick={() => setShowVaccinationModal(false)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.vaccineName', 'Vaccine Name *')}</label>
                  <select value={newVaccination.vaccineName} onChange={(e) => setNewVaccination({ ...newVaccination, vaccineName: e.target.value })} className={inputClass}>
                    <option value="">{t('tools.immunizationRecord.selectVaccine2', 'Select vaccine')}</option>
                    {commonVaccines.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.dateAdministered', 'Date Administered *')}</label>
                  <input type="date" value={newVaccination.dateAdministered} onChange={(e) => setNewVaccination({ ...newVaccination, dateAdministered: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.doseNumber', 'Dose Number')}</label>
                  <input type="number" min={1} value={newVaccination.doseNumber} onChange={(e) => setNewVaccination({ ...newVaccination, doseNumber: parseInt(e.target.value) || 1 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.totalDoses', 'Total Doses')}</label>
                  <input type="number" min={1} value={newVaccination.totalDoses} onChange={(e) => setNewVaccination({ ...newVaccination, totalDoses: parseInt(e.target.value) || 1 })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.lotNumber', 'Lot Number')}</label>
                  <input type="text" value={newVaccination.lotNumber} onChange={(e) => setNewVaccination({ ...newVaccination, lotNumber: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.manufacturer', 'Manufacturer')}</label>
                  <input type="text" value={newVaccination.manufacturer} onChange={(e) => setNewVaccination({ ...newVaccination, manufacturer: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.route', 'Route')}</label>
                  <select value={newVaccination.route} onChange={(e) => setNewVaccination({ ...newVaccination, route: e.target.value as any })} className={inputClass}>
                    {routes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.site', 'Site')}</label>
                  <input type="text" value={newVaccination.site} onChange={(e) => setNewVaccination({ ...newVaccination, site: e.target.value })} className={inputClass} placeholder={t('tools.immunizationRecord.eGLeftDeltoid', 'e.g., Left deltoid')} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.administeredBy', 'Administered By')}</label>
                  <input type="text" value={newVaccination.administeredBy} onChange={(e) => setNewVaccination({ ...newVaccination, administeredBy: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.immunizationRecord.location', 'Location')}</label>
                  <input type="text" value={newVaccination.location} onChange={(e) => setNewVaccination({ ...newVaccination, location: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('tools.immunizationRecord.notes2', 'Notes')}</label>
                <textarea value={newVaccination.notes} onChange={(e) => setNewVaccination({ ...newVaccination, notes: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => setShowVaccinationModal(false)} className={buttonSecondary}>{t('tools.immunizationRecord.cancel2', 'Cancel')}</button>
                <button onClick={addVaccination} disabled={!newVaccination.vaccineName} className={buttonPrimary}><Save className="w-4 h-4" /> {t('tools.immunizationRecord.save2', 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.immunizationRecord.aboutImmunizationRecords', 'About Immunization Records')}</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Track vaccination history with detailed records including lot numbers, manufacturers, and administration details.
          Schedule upcoming vaccinations and manage exemptions. Stay compliant with immunization requirements.
        </p>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default ImmunizationRecordTool;
