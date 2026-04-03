'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Syringe,
  Plus,
  Trash2,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Bell,
  X,
  Edit2,
  PawPrint,
  FileText,
  Download,
  Printer,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface VaccinationRecordToolProps {
  uiConfig?: UIConfig;
}

// Types
type VaccineStatus = 'current' | 'due' | 'overdue' | 'scheduled';

interface Vaccine {
  id: string;
  name: string;
  description: string;
  species: string[];
  intervalMonths: number;
  isRequired: boolean;
  category: 'core' | 'non-core' | 'lifestyle';
}

interface VaccinationRecord {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  ownerName: string;
  vaccineId: string;
  vaccineName: string;
  dateAdministered: string;
  expirationDate: string;
  lotNumber: string;
  manufacturer: string;
  veterinarian: string;
  clinic: string;
  notes: string;
  nextDueDate: string;
  reminderSent: boolean;
  createdAt: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
}

// Common vaccines
const VACCINES: Vaccine[] = [
  // Dog vaccines
  { id: 'rabies-dog', name: 'Rabies', description: 'Required by law in most areas', species: ['dog', 'cat'], intervalMonths: 12, isRequired: true, category: 'core' },
  { id: 'dhpp', name: 'DHPP (Distemper Combo)', description: 'Distemper, Hepatitis, Parainfluenza, Parvovirus', species: ['dog'], intervalMonths: 12, isRequired: true, category: 'core' },
  { id: 'bordetella-dog', name: 'Bordetella', description: 'Kennel cough prevention', species: ['dog'], intervalMonths: 6, isRequired: false, category: 'lifestyle' },
  { id: 'leptospirosis', name: 'Leptospirosis', description: 'Bacterial disease prevention', species: ['dog'], intervalMonths: 12, isRequired: false, category: 'non-core' },
  { id: 'lyme', name: 'Lyme Disease', description: 'Tick-borne disease prevention', species: ['dog'], intervalMonths: 12, isRequired: false, category: 'lifestyle' },
  { id: 'canine-influenza', name: 'Canine Influenza', description: 'Dog flu prevention', species: ['dog'], intervalMonths: 12, isRequired: false, category: 'lifestyle' },
  // Cat vaccines
  { id: 'fvrcp', name: 'FVRCP', description: 'Feline viral rhinotracheitis, calicivirus, panleukopenia', species: ['cat'], intervalMonths: 12, isRequired: true, category: 'core' },
  { id: 'felv', name: 'FeLV (Feline Leukemia)', description: 'Leukemia prevention for outdoor cats', species: ['cat'], intervalMonths: 12, isRequired: false, category: 'non-core' },
  // Other
  { id: 'rabies-other', name: 'Rabies', description: 'Required for all mammals', species: ['rabbit', 'ferret'], intervalMonths: 12, isRequired: true, category: 'core' },
];

// Column configurations for exports
const VACCINATION_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'petSpecies', header: 'Species', type: 'string' },
  { key: 'ownerName', header: 'Owner', type: 'string' },
  { key: 'vaccineName', header: 'Vaccine', type: 'string' },
  { key: 'dateAdministered', header: 'Date Given', type: 'date' },
  { key: 'expirationDate', header: 'Expiration', type: 'date' },
  { key: 'nextDueDate', header: 'Next Due', type: 'date' },
  { key: 'lotNumber', header: 'Lot #', type: 'string' },
  { key: 'manufacturer', header: 'Manufacturer', type: 'string' },
  { key: 'veterinarian', header: 'Veterinarian', type: 'string' },
  { key: 'clinic', header: 'Clinic', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getVaccineStatus = (nextDueDate: string): VaccineStatus => {
  if (!nextDueDate) return 'current';
  const today = new Date();
  const dueDate = new Date(nextDueDate);
  const daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) return 'overdue';
  if (daysDiff <= 30) return 'due';
  return 'current';
};

const getDaysUntilDue = (nextDueDate: string): number => {
  if (!nextDueDate) return 999;
  const today = new Date();
  const dueDate = new Date(nextDueDate);
  return Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const addMonthsToDate = (dateString: string, months: number): string => {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

// Main Component
export const VaccinationRecordTool: React.FC<VaccinationRecordToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: records,
    addItem: addRecordToBackend,
    updateItem: updateRecordBackend,
    deleteItem: deleteRecordBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<VaccinationRecord>('vet-vaccinations', [], VACCINATION_COLUMNS);

  const {
    data: pets,
    addItem: addPetToBackend,
  } = useToolData<Pet>('vet-pets-simple', [], []);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'records' | 'schedule' | 'reminders'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showPetForm, setShowPetForm] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);

  // Form state
  const [newRecord, setNewRecord] = useState<Partial<VaccinationRecord>>({
    petId: '',
    petName: '',
    petSpecies: 'dog',
    ownerName: '',
    vaccineId: '',
    vaccineName: '',
    dateAdministered: new Date().toISOString().split('T')[0],
    expirationDate: '',
    lotNumber: '',
    manufacturer: '',
    veterinarian: '',
    clinic: '',
    notes: '',
    nextDueDate: '',
    reminderSent: false,
  });

  const [newPet, setNewPet] = useState<Partial<Pet>>({
    name: '',
    species: 'dog',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
  });

  // Add vaccination record
  const addRecord = () => {
    if (!newRecord.petName || !newRecord.vaccineName || !newRecord.dateAdministered) {
      setValidationMessage('Please fill in required fields');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const vaccine = VACCINES.find(v => v.id === newRecord.vaccineId);
    const nextDue = vaccine
      ? addMonthsToDate(newRecord.dateAdministered!, vaccine.intervalMonths)
      : newRecord.nextDueDate || '';

    const record: VaccinationRecord = {
      id: editingRecord?.id || generateId(),
      petId: newRecord.petId || generateId(),
      petName: newRecord.petName || '',
      petSpecies: newRecord.petSpecies || 'dog',
      ownerName: newRecord.ownerName || '',
      vaccineId: newRecord.vaccineId || '',
      vaccineName: newRecord.vaccineName || '',
      dateAdministered: newRecord.dateAdministered || '',
      expirationDate: newRecord.expirationDate || '',
      lotNumber: newRecord.lotNumber || '',
      manufacturer: newRecord.manufacturer || '',
      veterinarian: newRecord.veterinarian || '',
      clinic: newRecord.clinic || '',
      notes: newRecord.notes || '',
      nextDueDate: nextDue,
      reminderSent: false,
      createdAt: editingRecord?.createdAt || new Date().toISOString(),
    };

    if (editingRecord) {
      updateRecordBackend(record.id, record);
    } else {
      addRecordToBackend(record);
    }

    resetForm();
  };

  const resetForm = () => {
    setNewRecord({
      petId: '',
      petName: '',
      petSpecies: 'dog',
      ownerName: '',
      vaccineId: '',
      vaccineName: '',
      dateAdministered: new Date().toISOString().split('T')[0],
      expirationDate: '',
      lotNumber: '',
      manufacturer: '',
      veterinarian: '',
      clinic: '',
      notes: '',
      nextDueDate: '',
      reminderSent: false,
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  // Add pet
  const addPet = () => {
    if (!newPet.name || !newPet.ownerName) {
      setValidationMessage('Please enter pet name and owner name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const pet: Pet = {
      id: generateId(),
      name: newPet.name || '',
      species: newPet.species || 'dog',
      ownerName: newPet.ownerName || '',
      ownerPhone: newPet.ownerPhone || '',
      ownerEmail: newPet.ownerEmail || '',
    };

    addPetToBackend(pet);
    setNewRecord({
      ...newRecord,
      petId: pet.id,
      petName: pet.name,
      petSpecies: pet.species,
      ownerName: pet.ownerName,
    });
    setNewPet({ name: '', species: 'dog', ownerName: '', ownerPhone: '', ownerEmail: '' });
    setShowPetForm(false);
  };

  // Edit record
  const editRecord = (record: VaccinationRecord) => {
    setNewRecord(record);
    setEditingRecord(record);
    setShowForm(true);
  };

  // Delete record
  const deleteRecord = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Vaccination Record',
      message: 'Are you sure you want to delete this vaccination record?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (confirmed) {
      deleteRecordBackend(id);
    }
  };

  // Get available vaccines for species
  const getVaccinesForSpecies = (species: string) => {
    return VACCINES.filter(v => v.species.includes(species));
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch =
        searchTerm === '' ||
        record.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies = speciesFilter === 'all' || record.petSpecies === speciesFilter;
      const status = getVaccineStatus(record.nextDueDate);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesSpecies && matchesStatus;
    }).sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime());
  }, [records, searchTerm, speciesFilter, statusFilter]);

  // Upcoming vaccinations (reminders)
  const upcomingVaccinations = useMemo(() => {
    return records
      .filter(r => {
        const status = getVaccineStatus(r.nextDueDate);
        return status === 'due' || status === 'overdue';
      })
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [records]);

  // Pet vaccination schedule
  const petSchedules = useMemo(() => {
    const scheduleMap = new Map<string, VaccinationRecord[]>();
    records.forEach(r => {
      const key = `${r.petId}-${r.petName}`;
      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, []);
      }
      scheduleMap.get(key)!.push(r);
    });
    return scheduleMap;
  }, [records]);

  // Stats
  const stats = useMemo(() => {
    const current = records.filter(r => getVaccineStatus(r.nextDueDate) === 'current').length;
    const due = records.filter(r => getVaccineStatus(r.nextDueDate) === 'due').length;
    const overdue = records.filter(r => getVaccineStatus(r.nextDueDate) === 'overdue').length;
    const uniquePets = new Set(records.map(r => r.petId)).size;
    return { current, due, overdue, uniquePets };
  }, [records]);

  // Get status color
  const getStatusColor = (status: VaccineStatus) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'due': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Syringe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.vaccinationRecord.vaccinationRecords', 'Vaccination Records')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.vaccinationRecord.trackAndManagePetVaccinations', 'Track and manage pet vaccinations')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="vaccination-record" toolName="Vaccination Record" />

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
                onExportCSV={() => exportToCSV(records, VACCINATION_COLUMNS, { filename: 'vaccination-records' })}
                onExportExcel={() => exportToExcel(records, VACCINATION_COLUMNS, { filename: 'vaccination-records' })}
                onExportJSON={() => exportToJSON(records, { filename: 'vaccination-records' })}
                onExportPDF={async () => {
                  await exportToPDF(records, VACCINATION_COLUMNS, {
                    filename: 'vaccination-records',
                    title: 'Vaccination Records',
                    subtitle: `${records.length} records | ${stats.uniquePets} pets`,
                  });
                }}
                onPrint={() => printData(records, VACCINATION_COLUMNS, { title: 'Vaccination Records' })}
                onCopyToClipboard={async () => await copyUtil(records, VACCINATION_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'records', label: 'All Records', icon: <FileText className="w-4 h-4" /> },
              { id: 'schedule', label: 'Pet Schedules', icon: <Calendar className="w-4 h-4" /> },
              { id: 'reminders', label: 'Due/Overdue', icon: <Bell className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'reminders' && upcomingVaccinations.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {upcomingVaccinations.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.vaccinationRecord.searchRecords', 'Search records...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.vaccinationRecord.allSpecies', 'All Species')}</option>
              <option value="dog">{t('tools.vaccinationRecord.dogs', 'Dogs')}</option>
              <option value="cat">{t('tools.vaccinationRecord.cats', 'Cats')}</option>
              <option value="other">{t('tools.vaccinationRecord.other', 'Other')}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">{t('tools.vaccinationRecord.allStatuses', 'All Statuses')}</option>
              <option value="current">{t('tools.vaccinationRecord.current', 'Current')}</option>
              <option value="due">{t('tools.vaccinationRecord.dueSoon', 'Due Soon')}</option>
              <option value="overdue">{t('tools.vaccinationRecord.overdue', 'Overdue')}</option>
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.vaccinationRecord.addRecord', 'Add Record')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PawPrint className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.uniquePets}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationRecord.pets', 'Pets')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.current}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationRecord.current2', 'Current')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.due}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationRecord.dueSoon2', 'Due Soon')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.overdue}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationRecord.overdue2', 'Overdue')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <Syringe className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationRecord.noVaccinationRecordsFound', 'No vaccination records found')}</p>
              </div>
            ) : (
              filteredRecords.map(record => {
                const status = getVaccineStatus(record.nextDueDate);
                const daysUntil = getDaysUntilDue(record.nextDueDate);
                return (
                  <div key={record.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          record.petSpecies === 'dog' ? 'bg-blue-100' :
                          record.petSpecies === 'cat' ? 'bg-purple-100' : 'bg-green-100'
                        }`}>
                          <PawPrint className={`w-6 h-6 ${
                            record.petSpecies === 'dog' ? 'text-blue-600' :
                            record.petSpecies === 'cat' ? 'text-purple-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {record.petName}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(status)}`}>
                              {status === 'current' ? 'Current' :
                               status === 'due' ? `Due in ${daysUntil} days` :
                               `Overdue by ${Math.abs(daysUntil)} days`}
                            </span>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Syringe className="w-3 h-3 inline mr-1" />
                            {record.vaccineName}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Given: {formatDate(record.dateAdministered)} | Next Due: {formatDate(record.nextDueDate)}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Owner: {record.ownerName} | Vet: {record.veterinarian || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editRecord(record)}
                          className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="p-2 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {petSchedules.size === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationRecord.noPetSchedulesYet', 'No pet schedules yet')}</p>
              </div>
            ) : (
              Array.from(petSchedules.entries()).map(([key, petRecords]) => {
                const firstRecord = petRecords[0];
                return (
                  <div key={key} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PawPrint className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {firstRecord.petName}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {firstRecord.petSpecies} | Owner: {firstRecord.ownerName}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {petRecords.length} vaccines
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <table className="w-full">
                        <thead>
                          <tr className={`text-left text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <th className="pb-2">{t('tools.vaccinationRecord.vaccine', 'Vaccine')}</th>
                            <th className="pb-2">{t('tools.vaccinationRecord.lastGiven', 'Last Given')}</th>
                            <th className="pb-2">{t('tools.vaccinationRecord.nextDue', 'Next Due')}</th>
                            <th className="pb-2">{t('tools.vaccinationRecord.status', 'Status')}</th>
                          </tr>
                        </thead>
                        <tbody className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {petRecords.map(r => {
                            const status = getVaccineStatus(r.nextDueDate);
                            return (
                              <tr key={r.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                                <td className="py-2">{r.vaccineName}</td>
                                <td className="py-2">{formatDate(r.dateAdministered)}</td>
                                <td className="py-2">{formatDate(r.nextDueDate)}</td>
                                <td className="py-2">
                                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(status)}`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="space-y-3">
            {upcomingVaccinations.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <CheckCircle className={`w-12 h-12 mx-auto mb-4 text-green-500`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationRecord.allVaccinationsAreUpTo', 'All vaccinations are up to date!')}</p>
              </div>
            ) : (
              upcomingVaccinations.map(record => {
                const status = getVaccineStatus(record.nextDueDate);
                const daysUntil = getDaysUntilDue(record.nextDueDate);
                return (
                  <div
                    key={record.id}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 border-l-4 ${
                      status === 'overdue' ? 'border-red-500' : 'border-yellow-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {status === 'overdue' ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          )}
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {record.petName} - {record.vaccineName}
                          </h3>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {status === 'overdue'
                            ? `Overdue by ${Math.abs(daysUntil)} days`
                            : `Due in ${daysUntil} days`
                          } - {formatDate(record.nextDueDate)}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Owner: {record.ownerName}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setNewRecord({
                            ...record,
                            dateAdministered: new Date().toISOString().split('T')[0],
                          });
                          setShowForm(true);
                        }}
                        className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors text-sm"
                      >
                        {t('tools.vaccinationRecord.recordVaccination', 'Record Vaccination')}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Add/Edit Record Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editingRecord ? t('tools.vaccinationRecord.editVaccinationRecord', 'Edit Vaccination Record') : t('tools.vaccinationRecord.addVaccinationRecord', 'Add Vaccination Record')}
                  </h2>
                  <button onClick={resetForm} className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Pet Selection or New Pet */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('tools.vaccinationRecord.petName', 'Pet Name *')}
                      value={newRecord.petName}
                      onChange={(e) => setNewRecord({ ...newRecord, petName: e.target.value })}
                      className={`flex-1 px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <select
                      value={newRecord.petSpecies}
                      onChange={(e) => setNewRecord({ ...newRecord, petSpecies: e.target.value })}
                      className={`px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="dog">{t('tools.vaccinationRecord.dog', 'Dog')}</option>
                      <option value="cat">{t('tools.vaccinationRecord.cat', 'Cat')}</option>
                      <option value="rabbit">{t('tools.vaccinationRecord.rabbit', 'Rabbit')}</option>
                      <option value="other">{t('tools.vaccinationRecord.other2', 'Other')}</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder={t('tools.vaccinationRecord.ownerName', 'Owner Name *')}
                    value={newRecord.ownerName}
                    onChange={(e) => setNewRecord({ ...newRecord, ownerName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />

                  {/* Vaccine Selection */}
                  <select
                    value={newRecord.vaccineId}
                    onChange={(e) => {
                      const vaccine = VACCINES.find(v => v.id === e.target.value);
                      setNewRecord({
                        ...newRecord,
                        vaccineId: e.target.value,
                        vaccineName: vaccine?.name || '',
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">{t('tools.vaccinationRecord.selectVaccine', 'Select Vaccine')}</option>
                    {getVaccinesForSpecies(newRecord.petSpecies || 'dog').map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.isRequired ? '(Required)' : ''}
                      </option>
                    ))}
                    <option value="custom">{t('tools.vaccinationRecord.customVaccine', 'Custom Vaccine')}</option>
                  </select>

                  {newRecord.vaccineId === 'custom' && (
                    <input
                      type="text"
                      placeholder={t('tools.vaccinationRecord.vaccineName', 'Vaccine Name *')}
                      value={newRecord.vaccineName}
                      onChange={(e) => setNewRecord({ ...newRecord, vaccineName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.vaccinationRecord.dateAdministered', 'Date Administered *')}
                      </label>
                      <input
                        type="date"
                        value={newRecord.dateAdministered}
                        onChange={(e) => setNewRecord({ ...newRecord, dateAdministered: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.vaccinationRecord.expirationDate', 'Expiration Date')}
                      </label>
                      <input
                        type="date"
                        value={newRecord.expirationDate}
                        onChange={(e) => setNewRecord({ ...newRecord, expirationDate: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.vaccinationRecord.lotNumber', 'Lot Number')}
                      value={newRecord.lotNumber}
                      onChange={(e) => setNewRecord({ ...newRecord, lotNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.vaccinationRecord.manufacturer', 'Manufacturer')}
                      value={newRecord.manufacturer}
                      onChange={(e) => setNewRecord({ ...newRecord, manufacturer: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.vaccinationRecord.veterinarian', 'Veterinarian')}
                      value={newRecord.veterinarian}
                      onChange={(e) => setNewRecord({ ...newRecord, veterinarian: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.vaccinationRecord.clinic', 'Clinic')}
                      value={newRecord.clinic}
                      onChange={(e) => setNewRecord({ ...newRecord, clinic: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>

                  <textarea
                    placeholder={t('tools.vaccinationRecord.notes', 'Notes')}
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />

                  <button
                    onClick={addRecord}
                    className="w-full py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
                  >
                    {editingRecord ? t('tools.vaccinationRecord.updateRecord', 'Update Record') : t('tools.vaccinationRecord.addRecord2', 'Add Record')}
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

export default VaccinationRecordTool;
