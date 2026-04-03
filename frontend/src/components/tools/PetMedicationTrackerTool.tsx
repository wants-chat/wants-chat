import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PawPrint,
  Pill,
  Calendar,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Syringe,
  Bug,
  Stethoscope,
  Clock,
  Info
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface PetMedicationTrackerToolProps {
  uiConfig?: UIConfig;
}

type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'other';

interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  weight: number;
  birthDate: string;
}

interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  refillDate?: string;
  notes?: string;
  lastGiven?: string;
}

interface FleaTickTreatment {
  id: string;
  petId: string;
  productName: string;
  lastApplied: string;
  nextDue: string;
}

interface Vaccination {
  id: string;
  petId: string;
  name: string;
  dateGiven: string;
  nextDue: string;
}

interface VetAppointment {
  id: string;
  petId: string;
  reason: string;
  date: string;
  time: string;
  vetName?: string;
  notes?: string;
}

// Column configurations for exports
const PETS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Pet Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'breed', header: 'Breed', type: 'string' },
  { key: 'weight', header: 'Weight (lbs)', type: 'number' },
  { key: 'birthDate', header: 'Birth Date', type: 'date' },
];

const MEDICATIONS_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'name', header: 'Medication', type: 'string' },
  { key: 'dosage', header: 'Dosage', type: 'string' },
  { key: 'frequency', header: 'Frequency', type: 'string' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'refillDate', header: 'Refill Date', type: 'date' },
  { key: 'lastGiven', header: 'Last Given', type: 'date' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const FLEA_TICK_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'productName', header: 'Product', type: 'string' },
  { key: 'lastApplied', header: 'Last Applied', type: 'date' },
  { key: 'nextDue', header: 'Next Due', type: 'date' },
];

const VACCINATIONS_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'name', header: 'Vaccine', type: 'string' },
  { key: 'dateGiven', header: 'Date Given', type: 'date' },
  { key: 'nextDue', header: 'Next Due', type: 'date' },
];

const APPOINTMENTS_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'reason', header: 'Reason', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'vetName', header: 'Vet Name', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

type ActiveTab = 'pets' | 'medications' | 'fleaTick' | 'vaccinations' | 'appointments';

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysUntil = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const petTypeIcons: Record<PetType, string> = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  hamster: '🐹',
  other: '🐾',
};

export const PetMedicationTrackerTool: React.FC<PetMedicationTrackerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pets');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Initialize useToolData hooks for each data type
  const petsHook = useToolData<Pet>('pet-medication-tracker-pets', [], PETS_COLUMNS);
  const medicationsHook = useToolData<Medication>('pet-medication-tracker-medications', [], MEDICATIONS_COLUMNS);
  const fleaTickHook = useToolData<FleaTickTreatment>('pet-medication-tracker-flea-tick', [], FLEA_TICK_COLUMNS);
  const vaccinationsHook = useToolData<Vaccination>('pet-medication-tracker-vaccinations', [], VACCINATIONS_COLUMNS);
  const appointmentsHook = useToolData<VetAppointment>('pet-medication-tracker-appointments', [], APPOINTMENTS_COLUMNS);

  const pets = petsHook.data;
  const medications = medicationsHook.data;
  const fleaTick = fleaTickHook.data;
  const vaccinations = vaccinationsHook.data;
  const appointments = appointmentsHook.data;

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      // Add prefill logic here based on available fields
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Form states
  const [showPetForm, setShowPetForm] = useState(false);
  const [showMedForm, setShowMedForm] = useState(false);
  const [showFleaForm, setShowFleaForm] = useState(false);
  const [showVaccForm, setShowVaccForm] = useState(false);
  const [showApptForm, setShowApptForm] = useState(false);

  // Pet form
  const [petForm, setPetForm] = useState<Omit<Pet, 'id'>>({
    name: '',
    type: 'dog',
    breed: '',
    weight: 0,
    birthDate: '',
  });

  // Medication form
  const [medForm, setMedForm] = useState<Omit<Medication, 'id'>>({
    petId: '',
    name: '',
    dosage: '',
    frequency: 'daily',
    startDate: '',
    endDate: '',
    refillDate: '',
    notes: '',
  });

  // Flea/Tick form
  const [fleaForm, setFleaForm] = useState<Omit<FleaTickTreatment, 'id'>>({
    petId: '',
    productName: '',
    lastApplied: '',
    nextDue: '',
  });

  // Vaccination form
  const [vaccForm, setVaccForm] = useState<Omit<Vaccination, 'id'>>({
    petId: '',
    name: '',
    dateGiven: '',
    nextDue: '',
  });

  // Appointment form
  const [apptForm, setApptForm] = useState<Omit<VetAppointment, 'id'>>({
    petId: '',
    reason: '',
    date: '',
    time: '',
    vetName: '',
    notes: '',
  });

  // Reminders calculation
  const reminders = useMemo(() => {
    const alerts: { type: string; message: string; daysUntil: number; urgency: 'high' | 'medium' | 'low' }[] = [];

    medications.forEach((med) => {
      if (med.refillDate) {
        const days = getDaysUntil(med.refillDate);
        if (days <= 7 && days >= 0) {
          const pet = pets.find((p) => p.id === med.petId);
          alerts.push({
            type: 'refill',
            message: `${pet?.name}'s ${med.name} refill due`,
            daysUntil: days,
            urgency: days <= 2 ? 'high' : 'medium',
          });
        }
      }
    });

    fleaTick.forEach((ft) => {
      const days = getDaysUntil(ft.nextDue);
      if (days <= 7 && days >= -3) {
        const pet = pets.find((p) => p.id === ft.petId);
        alerts.push({
          type: 'fleaTick',
          message: `${pet?.name}'s flea/tick treatment ${days < 0 ? 'overdue' : 'due'}`,
          daysUntil: days,
          urgency: days <= 0 ? 'high' : days <= 3 ? 'medium' : 'low',
        });
      }
    });

    vaccinations.forEach((vacc) => {
      const days = getDaysUntil(vacc.nextDue);
      if (days <= 30 && days >= -7) {
        const pet = pets.find((p) => p.id === vacc.petId);
        alerts.push({
          type: 'vaccination',
          message: `${pet?.name}'s ${vacc.name} vaccination ${days < 0 ? 'overdue' : 'due'}`,
          daysUntil: days,
          urgency: days <= 0 ? 'high' : days <= 7 ? 'medium' : 'low',
        });
      }
    });

    appointments.forEach((appt) => {
      const days = getDaysUntil(appt.date);
      if (days <= 7 && days >= 0) {
        const pet = pets.find((p) => p.id === appt.petId);
        alerts.push({
          type: 'appointment',
          message: `${pet?.name}'s vet appointment: ${appt.reason}`,
          daysUntil: days,
          urgency: days <= 1 ? 'high' : 'medium',
        });
      }
    });

    return alerts.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [pets, medications, fleaTick, vaccinations, appointments]);

  // CRUD handlers
  const handleAddPet = () => {
    if (!petForm.name) return;
    petsHook.addItem({ ...petForm, id: generateId() });
    setPetForm({ name: '', type: 'dog', breed: '', weight: 0, birthDate: '' });
    setShowPetForm(false);
  };

  const handleDeletePet = (id: string) => {
    petsHook.deleteItem(id);
    medicationsHook.setData(medications.filter((m) => m.petId !== id));
    fleaTickHook.setData(fleaTick.filter((f) => f.petId !== id));
    vaccinationsHook.setData(vaccinations.filter((v) => v.petId !== id));
    appointmentsHook.setData(appointments.filter((a) => a.petId !== id));
    if (selectedPetId === id) setSelectedPetId(null);
  };

  const handleAddMedication = () => {
    if (!medForm.name || !medForm.petId) return;
    medicationsHook.addItem({ ...medForm, id: generateId() });
    setMedForm({ petId: '', name: '', dosage: '', frequency: 'daily', startDate: '', endDate: '', refillDate: '', notes: '' });
    setShowMedForm(false);
  };

  const handleMarkMedicationGiven = (id: string) => {
    medicationsHook.updateItem(id, { lastGiven: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteMedication = (id: string) => {
    medicationsHook.deleteItem(id);
  };

  const handleAddFleaTick = () => {
    if (!fleaForm.productName || !fleaForm.petId) return;
    fleaTickHook.addItem({ ...fleaForm, id: generateId() });
    setFleaForm({ petId: '', productName: '', lastApplied: '', nextDue: '' });
    setShowFleaForm(false);
  };

  const handleDeleteFleaTick = (id: string) => {
    fleaTickHook.deleteItem(id);
  };

  const handleAddVaccination = () => {
    if (!vaccForm.name || !vaccForm.petId) return;
    vaccinationsHook.addItem({ ...vaccForm, id: generateId() });
    setVaccForm({ petId: '', name: '', dateGiven: '', nextDue: '' });
    setShowVaccForm(false);
  };

  const handleDeleteVaccination = (id: string) => {
    vaccinationsHook.deleteItem(id);
  };

  const handleAddAppointment = () => {
    if (!apptForm.reason || !apptForm.petId || !apptForm.date) return;
    appointmentsHook.addItem({ ...apptForm, id: generateId() });
    setApptForm({ petId: '', reason: '', date: '', time: '', vetName: '', notes: '' });
    setShowApptForm(false);
  };

  const handleDeleteAppointment = (id: string) => {
    appointmentsHook.deleteItem(id);
  };

  const filteredMedications = selectedPetId ? medications.filter((m) => m.petId === selectedPetId) : medications;
  const filteredFleaTick = selectedPetId ? fleaTick.filter((f) => f.petId === selectedPetId) : fleaTick;
  const filteredVaccinations = selectedPetId ? vaccinations.filter((v) => v.petId === selectedPetId) : vaccinations;
  const filteredAppointments = selectedPetId ? appointments.filter((a) => a.petId === selectedPetId) : appointments;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'pets', label: 'Pets', icon: <PawPrint className="w-4 h-4" /> },
    { id: 'medications', label: 'Medications', icon: <Pill className="w-4 h-4" /> },
    { id: 'fleaTick', label: 'Flea/Tick', icon: <Bug className="w-4 h-4" /> },
    { id: 'vaccinations', label: 'Vaccines', icon: <Syringe className="w-4 h-4" /> },
    { id: 'appointments', label: 'Vet Visits', icon: <Stethoscope className="w-4 h-4" /> },
  ];

  // Helper to get the current hook based on active tab
  const getExportDataHook = () => {
    switch (activeTab) {
      case 'medications':
        return medicationsHook;
      case 'fleaTick':
        return fleaTickHook;
      case 'vaccinations':
        return vaccinationsHook;
      case 'appointments':
        return appointmentsHook;
      default:
        return petsHook;
    }
  };

  // Prepare export data based on active tab
  const getExportData = useMemo(() => {
    const getPetName = (petId: string) => pets.find((p) => p.id === petId)?.name || 'Unknown';

    switch (activeTab) {
      case 'pets':
        return {
          data: pets,
          columns: PETS_COLUMNS,
          filename: 'pet-records',
          title: 'Pet Records',
        };
      case 'medications':
        return {
          data: filteredMedications.map((med) => ({
            ...med,
            petName: getPetName(med.petId),
          })),
          columns: MEDICATIONS_COLUMNS,
          filename: 'pet-medications',
          title: 'Pet Medications',
        };
      case 'fleaTick':
        return {
          data: filteredFleaTick.map((ft) => ({
            ...ft,
            petName: getPetName(ft.petId),
          })),
          columns: FLEA_TICK_COLUMNS,
          filename: 'flea-tick-treatments',
          title: 'Flea & Tick Treatments',
        };
      case 'vaccinations':
        return {
          data: filteredVaccinations.map((vacc) => ({
            ...vacc,
            petName: getPetName(vacc.petId),
          })),
          columns: VACCINATIONS_COLUMNS,
          filename: 'pet-vaccinations',
          title: 'Pet Vaccinations',
        };
      case 'appointments':
        return {
          data: filteredAppointments.map((appt) => ({
            ...appt,
            petName: getPetName(appt.petId),
          })),
          columns: APPOINTMENTS_COLUMNS,
          filename: 'vet-appointments',
          title: 'Vet Appointments',
        };
      default:
        return { data: [], columns: [], filename: 'export', title: 'Export' };
    }
  }, [activeTab, pets, filteredMedications, filteredFleaTick, filteredVaccinations, filteredAppointments]);

  const hasExportData = getExportData.data.length > 0;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <PawPrint className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petMedicationTracker.petMedicationTracker', 'Pet Medication Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petMedicationTracker.trackMedicationsTreatmentsAndVet', 'Track medications, treatments, and vet appointments')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasExportData && (
              <ExportDropdown
                onExportCSV={() => {
                  const currentHook = getExportDataHook();
                  currentHook.exportCSV({ filename: getExportData.filename });
                }}
                onExportExcel={() => {
                  const currentHook = getExportDataHook();
                  currentHook.exportExcel({ filename: getExportData.filename });
                }}
                onExportJSON={() => {
                  const currentHook = getExportDataHook();
                  currentHook.exportJSON({ filename: getExportData.filename });
                }}
                onExportPDF={async () => {
                  const currentHook = getExportDataHook();
                  await currentHook.exportPDF({
                    filename: getExportData.filename,
                    title: getExportData.title,
                  });
                }}
                onPrint={() => {
                  const currentHook = getExportDataHook();
                  currentHook.print(getExportData.title);
                }}
                onCopyToClipboard={async () => {
                  const currentHook = getExportDataHook();
                  await currentHook.copyToClipboard('tab');
                }}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
            <WidgetEmbedButton toolSlug="pet-medication-tracker" toolName="Pet Medication Tracker" />

            <SyncStatus
              isSynced={petsHook.isSynced || medicationsHook.isSynced || fleaTickHook.isSynced || vaccinationsHook.isSynced || appointmentsHook.isSynced}
              isSaving={petsHook.isSaving || medicationsHook.isSaving || fleaTickHook.isSaving || vaccinationsHook.isSaving || appointmentsHook.isSaving}
              lastSaved={petsHook.lastSaved || medicationsHook.lastSaved || fleaTickHook.lastSaved || vaccinationsHook.lastSaved || appointmentsHook.lastSaved}
              syncError={petsHook.syncError || medicationsHook.syncError || fleaTickHook.syncError || vaccinationsHook.syncError || appointmentsHook.syncError}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
              showLabel={true}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Reminders Alert */}
        {reminders.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-amber-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petMedicationTracker.upcomingReminders', 'Upcoming Reminders')}</h4>
            </div>
            <div className="space-y-2">
              {reminders.slice(0, 5).map((reminder, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-sm ${
                    reminder.urgency === 'high'
                      ? 'text-red-500'
                      : reminder.urgency === 'medium'
                      ? isDark
                        ? 'text-amber-400'
                        : 'text-amber-600'
                      : isDark
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 ${reminder.urgency === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                  <span>{reminder.message}</span>
                  <span className="ml-auto font-medium">
                    {reminder.daysUntil < 0
                      ? `${Math.abs(reminder.daysUntil)} days overdue`
                      : reminder.daysUntil === 0
                      ? 'Today'
                      : reminder.daysUntil === 1
                      ? 'Tomorrow'
                      : `${reminder.daysUntil} days`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pet Filter */}
        {pets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPetId(null)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                selectedPetId === null ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {t('tools.petMedicationTracker.allPets', 'All Pets')}
            </button>
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                  selectedPetId === pet.id ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span>{petTypeIcons[pet.type]}</span>
                {pet.name}
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                activeTab === tab.id ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pets Tab */}
        {activeTab === 'pets' && (
          <div className="space-y-4">
            {!showPetForm && (
              <button
                onClick={() => setShowPetForm(true)}
                className="w-full py-3 rounded-lg border-2 border-dashed border-teal-500 text-teal-500 flex items-center justify-center gap-2 hover:bg-teal-500/10"
              >
                <Plus className="w-5 h-5" />
                {t('tools.petMedicationTracker.addPet', 'Add Pet')}
              </button>
            )}

            {showPetForm && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petMedicationTracker.addNewPet', 'Add New Pet')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.name', 'Name')}</label>
                    <input
                      type="text"
                      value={petForm.name}
                      onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.petMedicationTracker.petSName', 'Pet\'s name')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.type', 'Type')}</label>
                    <select
                      value={petForm.type}
                      onChange={(e) => setPetForm({ ...petForm, type: e.target.value as PetType })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="dog">{t('tools.petMedicationTracker.dog', 'Dog')}</option>
                      <option value="cat">{t('tools.petMedicationTracker.cat', 'Cat')}</option>
                      <option value="bird">{t('tools.petMedicationTracker.bird', 'Bird')}</option>
                      <option value="rabbit">{t('tools.petMedicationTracker.rabbit', 'Rabbit')}</option>
                      <option value="hamster">{t('tools.petMedicationTracker.hamster', 'Hamster')}</option>
                      <option value="other">{t('tools.petMedicationTracker.other', 'Other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.breed', 'Breed')}</label>
                    <input
                      type="text"
                      value={petForm.breed}
                      onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.petMedicationTracker.breed2', 'Breed')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.weightLbs', 'Weight (lbs)')}</label>
                    <input
                      type="number"
                      value={petForm.weight || ''}
                      onChange={(e) => setPetForm({ ...petForm, weight: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.petMedicationTracker.weight', 'Weight')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.birthDate', 'Birth Date')}</label>
                    <input
                      type="date"
                      value={petForm.birthDate}
                      onChange={(e) => setPetForm({ ...petForm, birthDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowPetForm(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.petMedicationTracker.cancel', 'Cancel')}
                  </button>
                  <button onClick={handleAddPet} className="px-4 py-2 rounded-lg bg-teal-500 text-white">
                    {t('tools.petMedicationTracker.addPet2', 'Add Pet')}
                  </button>
                </div>
              </div>
            )}

            {/* Pet Cards */}
            <div className="grid gap-4">
              {pets.map((pet) => (
                <div key={pet.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} flex items-center gap-4`}>
                  <div className="text-4xl">{petTypeIcons[pet.type]}</div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pet.name}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {pet.breed || pet.type.charAt(0).toUpperCase() + pet.type.slice(1)} {pet.weight ? `| ${pet.weight} lbs` : ''}
                    </p>
                    {pet.birthDate && (
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Born: {formatDate(pet.birthDate)}</p>
                    )}
                  </div>
                  <button onClick={() => handleDeletePet(pet.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {pets.length === 0 && !showPetForm && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <PawPrint className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.petMedicationTracker.noPetsAddedYetAdd', 'No pets added yet. Add your first pet to get started!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className="space-y-4">
            {pets.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('tools.petMedicationTracker.addAPetFirstTo', 'Add a pet first to track medications')}</p>
              </div>
            ) : (
              <>
                {!showMedForm && (
                  <button
                    onClick={() => setShowMedForm(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-teal-500 text-teal-500 flex items-center justify-center gap-2 hover:bg-teal-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.petMedicationTracker.addMedication2', 'Add Medication')}
                  </button>
                )}

                {showMedForm && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petMedicationTracker.addMedication', 'Add Medication')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.pet', 'Pet')}</label>
                        <select
                          value={medForm.petId}
                          onChange={(e) => setMedForm({ ...medForm, petId: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">{t('tools.petMedicationTracker.selectPet', 'Select Pet')}</option>
                          {pets.map((pet) => (
                            <option key={pet.id} value={pet.id}>
                              {pet.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.medicationName', 'Medication Name')}</label>
                        <input
                          type="text"
                          value={medForm.name}
                          onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.petMedicationTracker.eGHeartgard', 'e.g., Heartgard')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.dosage', 'Dosage')}</label>
                        <input
                          type="text"
                          value={medForm.dosage}
                          onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.petMedicationTracker.eG1Tablet', 'e.g., 1 tablet')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.frequency', 'Frequency')}</label>
                        <select
                          value={medForm.frequency}
                          onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="daily">{t('tools.petMedicationTracker.daily', 'Daily')}</option>
                          <option value="twice-daily">{t('tools.petMedicationTracker.twiceDaily', 'Twice Daily')}</option>
                          <option value="weekly">{t('tools.petMedicationTracker.weekly', 'Weekly')}</option>
                          <option value="monthly">{t('tools.petMedicationTracker.monthly', 'Monthly')}</option>
                          <option value="as-needed">{t('tools.petMedicationTracker.asNeeded', 'As Needed')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.startDate', 'Start Date')}</label>
                        <input
                          type="date"
                          value={medForm.startDate}
                          onChange={(e) => setMedForm({ ...medForm, startDate: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.refillDate', 'Refill Date')}</label>
                        <input
                          type="date"
                          value={medForm.refillDate}
                          onChange={(e) => setMedForm({ ...medForm, refillDate: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.endDateOptional', 'End Date (optional)')}</label>
                        <input
                          type="date"
                          value={medForm.endDate}
                          onChange={(e) => setMedForm({ ...medForm, endDate: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.notes', 'Notes')}</label>
                        <input
                          type="text"
                          value={medForm.notes}
                          onChange={(e) => setMedForm({ ...medForm, notes: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.petMedicationTracker.additionalNotes', 'Additional notes')}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowMedForm(false)}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.petMedicationTracker.cancel2', 'Cancel')}
                      </button>
                      <button onClick={handleAddMedication} className="px-4 py-2 rounded-lg bg-teal-500 text-white">
                        {t('tools.petMedicationTracker.addMedication3', 'Add Medication')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Medication Cards */}
                <div className="space-y-3">
                  {filteredMedications.map((med) => {
                    const pet = pets.find((p) => p.id === med.petId);
                    return (
                      <div key={med.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Pill className="w-5 h-5 text-teal-500" />
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{med.name}</h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {pet?.name} | {med.dosage} | {med.frequency}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkMedicationGiven(med.id)}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"
                              title={t('tools.petMedicationTracker.markAsGiven', 'Mark as given')}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedication(med.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} flex flex-wrap gap-4`}>
                          {med.startDate && <span>Started: {formatDate(med.startDate)}</span>}
                          {med.refillDate && <span>Refill: {formatDate(med.refillDate)}</span>}
                          {med.lastGiven && <span className="text-green-500">Last given: {formatDate(med.lastGiven)}</span>}
                        </div>
                        {med.notes && <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{med.notes}</p>}
                      </div>
                    );
                  })}
                </div>

                {filteredMedications.length === 0 && !showMedForm && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Pill className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.petMedicationTracker.noMedicationsTrackedYet', 'No medications tracked yet')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Flea/Tick Tab */}
        {activeTab === 'fleaTick' && (
          <div className="space-y-4">
            {pets.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('tools.petMedicationTracker.addAPetFirstTo2', 'Add a pet first to track flea/tick treatments')}</p>
              </div>
            ) : (
              <>
                {!showFleaForm && (
                  <button
                    onClick={() => setShowFleaForm(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-teal-500 text-teal-500 flex items-center justify-center gap-2 hover:bg-teal-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.petMedicationTracker.addFleaTickTreatment2', 'Add Flea/Tick Treatment')}
                  </button>
                )}

                {showFleaForm && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petMedicationTracker.addFleaTickTreatment', 'Add Flea/Tick Treatment')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.pet2', 'Pet')}</label>
                        <select
                          value={fleaForm.petId}
                          onChange={(e) => setFleaForm({ ...fleaForm, petId: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">{t('tools.petMedicationTracker.selectPet2', 'Select Pet')}</option>
                          {pets.map((pet) => (
                            <option key={pet.id} value={pet.id}>
                              {pet.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.productName', 'Product Name')}</label>
                        <input
                          type="text"
                          value={fleaForm.productName}
                          onChange={(e) => setFleaForm({ ...fleaForm, productName: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.petMedicationTracker.eGFrontlinePlus', 'e.g., Frontline Plus')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.lastApplied', 'Last Applied')}</label>
                        <input
                          type="date"
                          value={fleaForm.lastApplied}
                          onChange={(e) => setFleaForm({ ...fleaForm, lastApplied: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.nextDue', 'Next Due')}</label>
                        <input
                          type="date"
                          value={fleaForm.nextDue}
                          onChange={(e) => setFleaForm({ ...fleaForm, nextDue: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowFleaForm(false)}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.petMedicationTracker.cancel3', 'Cancel')}
                      </button>
                      <button onClick={handleAddFleaTick} className="px-4 py-2 rounded-lg bg-teal-500 text-white">
                        {t('tools.petMedicationTracker.addTreatment', 'Add Treatment')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Flea/Tick Cards */}
                <div className="space-y-3">
                  {filteredFleaTick.map((ft) => {
                    const pet = pets.find((p) => p.id === ft.petId);
                    const daysUntil = getDaysUntil(ft.nextDue);
                    return (
                      <div key={ft.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Bug className="w-5 h-5 text-teal-500" />
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ft.productName}</h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{pet?.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFleaTick(ft.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className={`mt-2 text-sm flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span>Last applied: {formatDate(ft.lastApplied)}</span>
                          <span
                            className={
                              daysUntil < 0 ? 'text-red-500' : daysUntil <= 3 ? 'text-amber-500' : ''
                            }
                          >
                            Next: {formatDate(ft.nextDue)} ({daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredFleaTick.length === 0 && !showFleaForm && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Bug className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.petMedicationTracker.noFleaTickTreatmentsTracked', 'No flea/tick treatments tracked yet')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Vaccinations Tab */}
        {activeTab === 'vaccinations' && (
          <div className="space-y-4">
            {pets.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('tools.petMedicationTracker.addAPetFirstTo3', 'Add a pet first to track vaccinations')}</p>
              </div>
            ) : (
              <>
                {!showVaccForm && (
                  <button
                    onClick={() => setShowVaccForm(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-teal-500 text-teal-500 flex items-center justify-center gap-2 hover:bg-teal-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.petMedicationTracker.addVaccination2', 'Add Vaccination')}
                  </button>
                )}

                {showVaccForm && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petMedicationTracker.addVaccination', 'Add Vaccination')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.pet3', 'Pet')}</label>
                        <select
                          value={vaccForm.petId}
                          onChange={(e) => setVaccForm({ ...vaccForm, petId: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">{t('tools.petMedicationTracker.selectPet3', 'Select Pet')}</option>
                          {pets.map((pet) => (
                            <option key={pet.id} value={pet.id}>
                              {pet.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.vaccineName', 'Vaccine Name')}</label>
                        <input
                          type="text"
                          value={vaccForm.name}
                          onChange={(e) => setVaccForm({ ...vaccForm, name: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.petMedicationTracker.eGRabiesDhpp', 'e.g., Rabies, DHPP')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.dateGiven', 'Date Given')}</label>
                        <input
                          type="date"
                          value={vaccForm.dateGiven}
                          onChange={(e) => setVaccForm({ ...vaccForm, dateGiven: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.nextDue2', 'Next Due')}</label>
                        <input
                          type="date"
                          value={vaccForm.nextDue}
                          onChange={(e) => setVaccForm({ ...vaccForm, nextDue: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowVaccForm(false)}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.petMedicationTracker.cancel4', 'Cancel')}
                      </button>
                      <button onClick={handleAddVaccination} className="px-4 py-2 rounded-lg bg-teal-500 text-white">
                        {t('tools.petMedicationTracker.addVaccination3', 'Add Vaccination')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Vaccination Cards */}
                <div className="space-y-3">
                  {filteredVaccinations.map((vacc) => {
                    const pet = pets.find((p) => p.id === vacc.petId);
                    const daysUntil = getDaysUntil(vacc.nextDue);
                    return (
                      <div key={vacc.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Syringe className="w-5 h-5 text-teal-500" />
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{vacc.name}</h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{pet?.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteVaccination(vacc.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className={`mt-2 text-sm flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span>Given: {formatDate(vacc.dateGiven)}</span>
                          <span
                            className={
                              daysUntil < 0 ? 'text-red-500' : daysUntil <= 30 ? 'text-amber-500' : ''
                            }
                          >
                            Next: {formatDate(vacc.nextDue)} ({daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredVaccinations.length === 0 && !showVaccForm && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Syringe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.petMedicationTracker.noVaccinationsTrackedYet', 'No vaccinations tracked yet')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {pets.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('tools.petMedicationTracker.addAPetFirstTo4', 'Add a pet first to schedule appointments')}</p>
              </div>
            ) : (
              <>
                {!showApptForm && (
                  <button
                    onClick={() => setShowApptForm(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-teal-500 text-teal-500 flex items-center justify-center gap-2 hover:bg-teal-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.petMedicationTracker.addVetAppointment2', 'Add Vet Appointment')}
                  </button>
                )}

                {showApptForm && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petMedicationTracker.addVetAppointment', 'Add Vet Appointment')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.pet4', 'Pet')}</label>
                        <select
                          value={apptForm.petId}
                          onChange={(e) => setApptForm({ ...apptForm, petId: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">{t('tools.petMedicationTracker.selectPet4', 'Select Pet')}</option>
                          {pets.map((pet) => (
                            <option key={pet.id} value={pet.id}>
                              {pet.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.reason', 'Reason')}</label>
                        <input
                          type="text"
                          value={apptForm.reason}
                          onChange={(e) => setApptForm({ ...apptForm, reason: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.petMedicationTracker.eGAnnualCheckup', 'e.g., Annual checkup')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.date', 'Date')}</label>
                        <input
                          type="date"
                          value={apptForm.date}
                          onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.time', 'Time')}</label>
                        <input
                          type="time"
                          value={apptForm.time}
                          onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.vetNameOptional', 'Vet Name (optional)')}</label>
                        <input
                          type="text"
                          value={apptForm.vetName}
                          onChange={(e) => setApptForm({ ...apptForm, vetName: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.petMedicationTracker.vetSName', 'Vet\'s name')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.petMedicationTracker.notesOptional', 'Notes (optional)')}</label>
                        <input
                          type="text"
                          value={apptForm.notes}
                          onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.petMedicationTracker.additionalNotes2', 'Additional notes')}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowApptForm(false)}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.petMedicationTracker.cancel5', 'Cancel')}
                      </button>
                      <button onClick={handleAddAppointment} className="px-4 py-2 rounded-lg bg-teal-500 text-white">
                        {t('tools.petMedicationTracker.addAppointment', 'Add Appointment')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Appointment Cards */}
                <div className="space-y-3">
                  {filteredAppointments.map((appt) => {
                    const pet = pets.find((p) => p.id === appt.petId);
                    const daysUntil = getDaysUntil(appt.date);
                    return (
                      <div key={appt.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Stethoscope className="w-5 h-5 text-teal-500" />
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{appt.reason}</h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {pet?.name} {appt.vetName && `| Dr. ${appt.vetName}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteAppointment(appt.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className={`mt-2 text-sm flex items-center gap-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(appt.date)}
                          </span>
                          {appt.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appt.time}
                            </span>
                          )}
                          <span
                            className={`ml-auto ${
                              daysUntil < 0 ? 'text-gray-500' : daysUntil <= 1 ? 'text-amber-500 font-medium' : ''
                            }`}
                          >
                            {daysUntil < 0 ? 'Past' : daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                          </span>
                        </div>
                        {appt.notes && <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{appt.notes}</p>}
                      </div>
                    );
                  })}
                </div>

                {filteredAppointments.length === 0 && !showApptForm && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.petMedicationTracker.noVetAppointmentsScheduled', 'No vet appointments scheduled')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.petMedicationTracker.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.petMedicationTracker.setRefillDatesToGet', 'Set refill dates to get reminders before medications run out')}</li>
                <li>{t('tools.petMedicationTracker.mostFleaTickTreatmentsAre', 'Most flea/tick treatments are due monthly')}</li>
                <li>{t('tools.petMedicationTracker.annualVaccinationsTypicallyIncludeRabies', 'Annual vaccinations typically include Rabies and DHPP/FVRCP')}</li>
                <li>{t('tools.petMedicationTracker.keepYourPetSWeight', 'Keep your pet\'s weight updated for accurate dosing')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetMedicationTrackerTool;
