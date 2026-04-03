'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PawPrint,
  Plus,
  Trash2,
  Save,
  Search,
  Filter,
  Calendar,
  Weight,
  Ruler,
  Heart,
  AlertCircle,
  Edit2,
  X,
  User,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface PetPatientToolProps {
  uiConfig?: UIConfig;
}

// Types
type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'reptile' | 'fish' | 'other';
type Gender = 'male' | 'female' | 'unknown';

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
}

interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: Species;
  breed: string;
  gender: Gender;
  dateOfBirth: string;
  color: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  microchipNumber: string;
  rabiesTag: string;
  allergies: string[];
  medications: string[];
  medicalNotes: string;
  isNeutered: boolean;
  isActive: boolean;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicalRecord {
  id: string;
  petId: string;
  date: string;
  type: 'checkup' | 'vaccination' | 'surgery' | 'treatment' | 'emergency' | 'other';
  description: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  veterinarian: string;
  followUpDate: string;
  createdAt: string;
}

// Constants
const SPECIES_OPTIONS: { value: Species; label: string; emoji: string }[] = [
  { value: 'dog', label: 'Dog', emoji: '🐕' },
  { value: 'cat', label: 'Cat', emoji: '🐱' },
  { value: 'bird', label: 'Bird', emoji: '🐦' },
  { value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
  { value: 'hamster', label: 'Hamster', emoji: '🐹' },
  { value: 'reptile', label: 'Reptile', emoji: '🦎' },
  { value: 'fish', label: 'Fish', emoji: '🐠' },
  { value: 'other', label: 'Other', emoji: '🐾' },
];

const RECORD_TYPES: { value: string; label: string }[] = [
  { value: 'checkup', label: 'Check-up' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' },
];

// Column configurations for exports
const PET_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Pet Name', type: 'string' },
  { key: 'species', header: 'Species', type: 'string' },
  { key: 'breed', header: 'Breed', type: 'string' },
  { key: 'gender', header: 'Gender', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'weight', header: 'Weight', type: 'number' },
  { key: 'microchipNumber', header: 'Microchip #', type: 'string' },
  { key: 'ownerName', header: 'Owner', type: 'string' },
  { key: 'isNeutered', header: 'Neutered/Spayed', type: 'boolean' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const OWNER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'zipCode', header: 'Zip Code', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
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

const calculateAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return 'Unknown';
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();

  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else if (months < 0) {
    return `${years - 1} year${years - 1 !== 1 ? 's' : ''}`;
  }
  return `${years} year${years !== 1 ? 's' : ''}`;
};

// Main Component
export const PetPatientTool: React.FC<PetPatientToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hooks for backend sync
  const {
    data: owners,
    addItem: addOwnerToBackend,
    updateItem: updateOwnerBackend,
    deleteItem: deleteOwnerBackend,
    isSynced: ownersSynced,
    isSaving: ownersSaving,
    lastSaved: ownersLastSaved,
    syncError: ownersSyncError,
    forceSync: forceOwnersSync,
  } = useToolData<Owner>('vet-owners', [], OWNER_COLUMNS);

  const {
    data: pets,
    addItem: addPetToBackend,
    updateItem: updatePetBackend,
    deleteItem: deletePetBackend,
    isSynced: petsSynced,
    isSaving: petsSaving,
    lastSaved: petsLastSaved,
    syncError: petsSyncError,
    forceSync: forcePetsSync,
  } = useToolData<Pet>('vet-pets', [], PET_COLUMNS);

  const {
    data: medicalRecords,
    addItem: addRecordToBackend,
    deleteItem: deleteRecordBackend,
  } = useToolData<MedicalRecord>('vet-medical-records', [], []);

  // Hook for confirm dialog
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Local UI State
  const [activeTab, setActiveTab] = useState<'pets' | 'owners' | 'records'>('pets');
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [showPetForm, setShowPetForm] = useState(false);
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [expandedPetId, setExpandedPetId] = useState<string | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Form states
  const [newOwner, setNewOwner] = useState<Partial<Owner>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [newPet, setNewPet] = useState<Partial<Pet>>({
    name: '',
    species: 'dog',
    breed: '',
    gender: 'unknown',
    dateOfBirth: '',
    color: '',
    weight: 0,
    weightUnit: 'lbs',
    microchipNumber: '',
    rabiesTag: '',
    allergies: [],
    medications: [],
    medicalNotes: '',
    isNeutered: false,
    isActive: true,
    photoUrl: '',
    ownerId: '',
  });

  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    type: 'checkup',
    description: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    veterinarian: '',
    followUpDate: '',
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  // Add owner
  const addOwner = () => {
    if (!newOwner.firstName || !newOwner.lastName) {
      setValidationMessage('Please enter owner first and last name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const owner: Owner = {
      id: generateId(),
      firstName: newOwner.firstName || '',
      lastName: newOwner.lastName || '',
      email: newOwner.email || '',
      phone: newOwner.phone || '',
      address: newOwner.address || '',
      city: newOwner.city || '',
      state: newOwner.state || '',
      zipCode: newOwner.zipCode || '',
      createdAt: new Date().toISOString(),
    };

    addOwnerToBackend(owner);
    setNewOwner({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setShowOwnerForm(false);
  };

  // Add pet
  const addPet = () => {
    if (!newPet.name || !newPet.ownerId) {
      setValidationMessage('Please enter pet name and select an owner');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const pet: Pet = {
      id: generateId(),
      ownerId: newPet.ownerId || '',
      name: newPet.name || '',
      species: newPet.species || 'dog',
      breed: newPet.breed || '',
      gender: newPet.gender || 'unknown',
      dateOfBirth: newPet.dateOfBirth || '',
      color: newPet.color || '',
      weight: newPet.weight || 0,
      weightUnit: newPet.weightUnit || 'lbs',
      microchipNumber: newPet.microchipNumber || '',
      rabiesTag: newPet.rabiesTag || '',
      allergies: newPet.allergies || [],
      medications: newPet.medications || [],
      medicalNotes: newPet.medicalNotes || '',
      isNeutered: newPet.isNeutered || false,
      isActive: true,
      photoUrl: newPet.photoUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPetToBackend(pet);
    setNewPet({
      name: '',
      species: 'dog',
      breed: '',
      gender: 'unknown',
      dateOfBirth: '',
      color: '',
      weight: 0,
      weightUnit: 'lbs',
      microchipNumber: '',
      rabiesTag: '',
      allergies: [],
      medications: [],
      medicalNotes: '',
      isNeutered: false,
      isActive: true,
      photoUrl: '',
      ownerId: '',
    });
    setShowPetForm(false);
  };

  // Add medical record
  const addMedicalRecord = () => {
    if (!selectedPetId || !newRecord.description) {
      setValidationMessage('Please select a pet and enter a description');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const record: MedicalRecord = {
      id: generateId(),
      petId: selectedPetId,
      date: new Date().toISOString(),
      type: (newRecord.type as MedicalRecord['type']) || 'checkup',
      description: newRecord.description || '',
      diagnosis: newRecord.diagnosis || '',
      treatment: newRecord.treatment || '',
      notes: newRecord.notes || '',
      veterinarian: newRecord.veterinarian || '',
      followUpDate: newRecord.followUpDate || '',
      createdAt: new Date().toISOString(),
    };

    addRecordToBackend(record);
    setNewRecord({
      type: 'checkup',
      description: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      veterinarian: '',
      followUpDate: '',
    });
    setShowRecordForm(false);
  };

  // Delete pet
  const deletePet = async (petId: string) => {
    const confirmed = await confirm({
      title: 'Delete Pet',
      message: 'Are you sure you want to delete this pet? All medical records will also be deleted.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deletePetBackend(petId);
      medicalRecords.filter(r => r.petId === petId).forEach(r => deleteRecordBackend(r.id));
    }
  };

  // Delete owner
  const deleteOwner = async (ownerId: string) => {
    const ownerPets = pets.filter(p => p.ownerId === ownerId);
    if (ownerPets.length > 0) {
      setValidationMessage('Cannot delete owner with existing pets. Please remove or reassign pets first.');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    const confirmed = await confirm({
      title: 'Delete Owner',
      message: 'Are you sure you want to delete this owner?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteOwnerBackend(ownerId);
    }
  };

  // Filtered pets
  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      const owner = owners.find(o => o.id === pet.ownerId);
      const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase() : '';
      const matchesSearch =
        searchTerm === '' ||
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ownerName.includes(searchTerm.toLowerCase());
      const matchesSpecies = speciesFilter === 'all' || pet.species === speciesFilter;
      return matchesSearch && matchesSpecies;
    });
  }, [pets, owners, searchTerm, speciesFilter]);

  // Filtered owners
  const filteredOwners = useMemo(() => {
    return owners.filter(owner => {
      const fullName = `${owner.firstName} ${owner.lastName}`.toLowerCase();
      return searchTerm === '' ||
        fullName.includes(searchTerm.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.phone.includes(searchTerm);
    });
  }, [owners, searchTerm]);

  // Pet records
  const getPetRecords = (petId: string) => {
    return medicalRecords.filter(r => r.petId === petId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Get owner name
  const getOwnerName = (ownerId: string) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown';
  };

  // Get pet count for owner
  const getPetCount = (ownerId: string) => {
    return pets.filter(p => p.ownerId === ownerId).length;
  };

  // Get species emoji
  const getSpeciesEmoji = (species: Species) => {
    return SPECIES_OPTIONS.find(s => s.value === species)?.emoji || '🐾';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.petPatient.petPatientRecords', 'Pet Patient Records')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.petPatient.managePetPatientsOwnersAnd', 'Manage pet patients, owners, and medical records')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="pet-patient" toolName="Pet Patient" />

              <SyncStatus
                isSynced={petsSynced && ownersSynced}
                isSaving={petsSaving || ownersSaving}
                lastSaved={petsLastSaved || ownersLastSaved}
                syncError={petsSyncError || ownersSyncError}
                onForceSync={() => { forcePetsSync(); forceOwnersSync(); }}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = pets.map(p => ({
                    ...p,
                    ownerName: getOwnerName(p.ownerId),
                  }));
                  exportToCSV(exportData, PET_COLUMNS, { filename: 'pet-patients' });
                }}
                onExportExcel={() => {
                  const exportData = pets.map(p => ({
                    ...p,
                    ownerName: getOwnerName(p.ownerId),
                  }));
                  exportToExcel(exportData, PET_COLUMNS, { filename: 'pet-patients' });
                }}
                onExportJSON={() => {
                  const exportData = pets.map(p => ({
                    ...p,
                    ownerName: getOwnerName(p.ownerId),
                  }));
                  exportToJSON(exportData, { filename: 'pet-patients' });
                }}
                onExportPDF={async () => {
                  const exportData = pets.map(p => ({
                    ...p,
                    ownerName: getOwnerName(p.ownerId),
                  }));
                  await exportToPDF(exportData, PET_COLUMNS, {
                    filename: 'pet-patients',
                    title: 'Pet Patient Records',
                    subtitle: `${pets.length} patients | ${owners.length} owners`,
                  });
                }}
                onPrint={() => {
                  const exportData = pets.map(p => ({
                    ...p,
                    ownerName: getOwnerName(p.ownerId),
                  }));
                  printData(exportData, PET_COLUMNS, { title: 'Pet Patient Records' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = pets.map(p => ({
                    ...p,
                    ownerName: getOwnerName(p.ownerId),
                  }));
                  return await copyUtil(exportData, PET_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'pets', label: 'Pets', icon: <PawPrint className="w-4 h-4" /> },
              { id: 'owners', label: 'Owners', icon: <User className="w-4 h-4" /> },
              { id: 'records', label: 'Medical Records', icon: <FileText className="w-4 h-4" /> },
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
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder={t('tools.petPatient.searchPetsOwners', 'Search pets, owners...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            {activeTab === 'pets' && (
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="all">{t('tools.petPatient.allSpecies', 'All Species')}</option>
                {SPECIES_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                if (activeTab === 'pets') setShowPetForm(true);
                else if (activeTab === 'owners') setShowOwnerForm(true);
                else if (activeTab === 'records') setShowRecordForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'pets' ? 'Pet' : activeTab === 'owners' ? t('tools.petPatient.owner', 'Owner') : t('tools.petPatient.record', 'Record')}
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
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pets.length}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petPatient.totalPets', 'Total Pets')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{owners.length}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petPatient.owners', 'Owners')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{medicalRecords.length}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petPatient.records', 'Records')}</p>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Heart className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pets.filter(p => p.isActive).length}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petPatient.activePatients', 'Active Patients')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'pets' && (
          <div className="grid gap-4">
            {filteredPets.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <PawPrint className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petPatient.noPetsFoundAddYour', 'No pets found. Add your first pet patient!')}</p>
              </div>
            ) : (
              filteredPets.map(pet => (
                <div key={pet.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                  <div
                    className="p-4 cursor-pointer hover:bg-opacity-80"
                    onClick={() => setExpandedPetId(expandedPetId === pet.id ? null : pet.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{getSpeciesEmoji(pet.species)}</div>
                        <div>
                          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {pet.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {pet.breed} | {calculateAge(pet.dateOfBirth)} | {pet.gender}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Owner: {getOwnerName(pet.ownerId)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          pet.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pet.isActive ? t('tools.petPatient.active', 'Active') : t('tools.petPatient.inactive', 'Inactive')}
                        </span>
                        {pet.allergies.length > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            {t('tools.petPatient.allergies', 'Allergies')}
                          </span>
                        )}
                        {expandedPetId === pet.id ? (
                          <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        ) : (
                          <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedPetId === pet.id && (
                    <div className={`px-4 pb-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petPatient.details', 'Details')}</h4>
                          <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p><Weight className="w-4 h-4 inline mr-2" />Weight: {pet.weight} {pet.weightUnit}</p>
                            <p><Calendar className="w-4 h-4 inline mr-2" />DOB: {formatDate(pet.dateOfBirth)}</p>
                            <p>Color: {pet.color || 'N/A'}</p>
                            <p>Microchip: {pet.microchipNumber || 'N/A'}</p>
                            <p>Rabies Tag: {pet.rabiesTag || 'N/A'}</p>
                            <p>{pet.isNeutered ? t('tools.petPatient.neuteredSpayed2', 'Neutered/Spayed') : t('tools.petPatient.notNeuteredSpayed', 'Not Neutered/Spayed')}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petPatient.medicalInfo', 'Medical Info')}</h4>
                          <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p><AlertCircle className="w-4 h-4 inline mr-2" />Allergies: {pet.allergies.length > 0 ? pet.allergies.join(', ') : 'None'}</p>
                            <p>Medications: {pet.medications.length > 0 ? pet.medications.join(', ') : 'None'}</p>
                            {pet.medicalNotes && <p>Notes: {pet.medicalNotes}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Recent Records */}
                      <div className="mt-4">
                        <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petPatient.recentRecords', 'Recent Records')}</h4>
                        {getPetRecords(pet.id).length === 0 ? (
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.petPatient.noMedicalRecordsYet', 'No medical records yet')}</p>
                        ) : (
                          <div className="space-y-2">
                            {getPetRecords(pet.id).slice(0, 3).map(record => (
                              <div key={record.id} className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex justify-between">
                                  <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                                  </span>
                                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {formatDate(record.date)}
                                  </span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{record.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => { setSelectedPetId(pet.id); setShowRecordForm(true); }}
                          className="flex items-center gap-1 px-3 py-1 bg-[#0D9488] text-white rounded text-sm hover:bg-[#0B8478]"
                        >
                          <Plus className="w-4 h-4" /> Add Record
                        </button>
                        <button
                          onClick={() => deletePet(pet.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'owners' && (
          <div className="grid gap-4">
            {filteredOwners.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <User className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petPatient.noOwnersFoundAddYour', 'No owners found. Add your first owner!')}</p>
              </div>
            ) : (
              filteredOwners.map(owner => (
                <div key={owner.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {owner.firstName} {owner.lastName}
                      </h3>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                        <p><Mail className="w-4 h-4 inline mr-2" />{owner.email || 'No email'}</p>
                        <p><Phone className="w-4 h-4 inline mr-2" />{owner.phone || 'No phone'}</p>
                        <p>{owner.address && `${owner.address}, ${owner.city}, ${owner.state} ${owner.zipCode}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getPetCount(owner.id)}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petPatient.pets', 'Pets')}</p>
                      </div>
                      <button
                        onClick={() => deleteOwner(owner.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div className="grid gap-4">
            {medicalRecords.length === 0 ? (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow`}>
                <FileText className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petPatient.noMedicalRecordsYet2', 'No medical records yet.')}</p>
              </div>
            ) : (
              medicalRecords
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(record => {
                  const pet = pets.find(p => p.id === record.petId);
                  return (
                    <div key={record.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            record.type === 'emergency' ? 'bg-red-100 text-red-800' :
                            record.type === 'vaccination' ? 'bg-blue-100 text-blue-800' :
                            record.type === 'surgery' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {record.type.toUpperCase()}
                          </span>
                          <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(record.date)}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteRecordBackend(record.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {pet ? `${getSpeciesEmoji(pet.species)} ${pet.name}` : 'Unknown Pet'}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{record.description}</p>
                      {record.diagnosis && (
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <strong>{t('tools.petPatient.diagnosis', 'Diagnosis:')}</strong> {record.diagnosis}
                        </p>
                      )}
                      {record.treatment && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <strong>{t('tools.petPatient.treatment', 'Treatment:')}</strong> {record.treatment}
                        </p>
                      )}
                      {record.veterinarian && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Dr. {record.veterinarian}
                        </p>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* Add Owner Modal */}
        {showOwnerForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petPatient.addNewOwner', 'Add New Owner')}</h2>
                  <button onClick={() => setShowOwnerForm(false)} className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.petPatient.firstName', 'First Name *')}
                      value={newOwner.firstName}
                      onChange={(e) => setNewOwner({ ...newOwner, firstName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.petPatient.lastName', 'Last Name *')}
                      value={newOwner.lastName}
                      onChange={(e) => setNewOwner({ ...newOwner, lastName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder={t('tools.petPatient.email', 'Email')}
                    value={newOwner.email}
                    onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <input
                    type="tel"
                    placeholder={t('tools.petPatient.phone', 'Phone')}
                    value={newOwner.phone}
                    onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.petPatient.address', 'Address')}
                    value={newOwner.address}
                    onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.petPatient.city', 'City')}
                      value={newOwner.city}
                      onChange={(e) => setNewOwner({ ...newOwner, city: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.petPatient.state', 'State')}
                      value={newOwner.state}
                      onChange={(e) => setNewOwner({ ...newOwner, state: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.petPatient.zip', 'Zip')}
                      value={newOwner.zipCode}
                      onChange={(e) => setNewOwner({ ...newOwner, zipCode: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <button
                    onClick={addOwner}
                    className="w-full py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
                  >
                    {t('tools.petPatient.addOwner', 'Add Owner')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Pet Modal */}
        {showPetForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petPatient.addNewPet', 'Add New Pet')}</h2>
                  <button onClick={() => setShowPetForm(false)} className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <select
                    value={newPet.ownerId}
                    onChange={(e) => setNewPet({ ...newPet, ownerId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">{t('tools.petPatient.selectOwner', 'Select Owner *')}</option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t('tools.petPatient.petName', 'Pet Name *')}
                    value={newPet.name}
                    onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newPet.species}
                      onChange={(e) => setNewPet({ ...newPet, species: e.target.value as Species })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {SPECIES_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={t('tools.petPatient.breed', 'Breed')}
                      value={newPet.breed}
                      onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newPet.gender}
                      onChange={(e) => setNewPet({ ...newPet, gender: e.target.value as Gender })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="unknown">{t('tools.petPatient.unknown', 'Unknown')}</option>
                      <option value="male">{t('tools.petPatient.male', 'Male')}</option>
                      <option value="female">{t('tools.petPatient.female', 'Female')}</option>
                    </select>
                    <input
                      type="date"
                      placeholder={t('tools.petPatient.dateOfBirth', 'Date of Birth')}
                      value={newPet.dateOfBirth}
                      onChange={(e) => setNewPet({ ...newPet, dateOfBirth: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t('tools.petPatient.colorMarkings', 'Color/Markings')}
                    value={newPet.color}
                    onChange={(e) => setNewPet({ ...newPet, color: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder={t('tools.petPatient.weight', 'Weight')}
                      value={newPet.weight || ''}
                      onChange={(e) => setNewPet({ ...newPet, weight: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <select
                      value={newPet.weightUnit}
                      onChange={(e) => setNewPet({ ...newPet, weightUnit: e.target.value as 'kg' | 'lbs' })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="lbs">lbs</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('tools.petPatient.microchipNumber', 'Microchip Number')}
                      value={newPet.microchipNumber}
                      onChange={(e) => setNewPet({ ...newPet, microchipNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.petPatient.rabiesTag', 'Rabies Tag')}
                      value={newPet.rabiesTag}
                      onChange={(e) => setNewPet({ ...newPet, rabiesTag: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <input
                      type="checkbox"
                      checked={newPet.isNeutered}
                      onChange={(e) => setNewPet({ ...newPet, isNeutered: e.target.checked })}
                      className="rounded"
                    />
                    {t('tools.petPatient.neuteredSpayed', 'Neutered/Spayed')}
                  </label>
                  <textarea
                    placeholder={t('tools.petPatient.medicalNotes', 'Medical Notes')}
                    value={newPet.medicalNotes}
                    onChange={(e) => setNewPet({ ...newPet, medicalNotes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <button
                    onClick={addPet}
                    className="w-full py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
                  >
                    {t('tools.petPatient.addPet', 'Add Pet')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Medical Record Modal */}
        {showRecordForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.petPatient.addMedicalRecord', 'Add Medical Record')}</h2>
                  <button onClick={() => setShowRecordForm(false)} className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <select
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">{t('tools.petPatient.selectPet', 'Select Pet *')}</option>
                    {pets.map(p => (
                      <option key={p.id} value={p.id}>{getSpeciesEmoji(p.species)} {p.name} - {getOwnerName(p.ownerId)}</option>
                    ))}
                  </select>
                  <select
                    value={newRecord.type}
                    onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    {RECORD_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t('tools.petPatient.description', 'Description *')}
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.petPatient.diagnosis2', 'Diagnosis')}
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <textarea
                    placeholder={t('tools.petPatient.treatment2', 'Treatment')}
                    value={newRecord.treatment}
                    onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.petPatient.veterinarian', 'Veterinarian')}
                    value={newRecord.veterinarian}
                    onChange={(e) => setNewRecord({ ...newRecord, veterinarian: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <input
                    type="date"
                    placeholder={t('tools.petPatient.followUpDate', 'Follow-up Date')}
                    value={newRecord.followUpDate}
                    onChange={(e) => setNewRecord({ ...newRecord, followUpDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <textarea
                    placeholder={t('tools.petPatient.notes', 'Notes')}
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <button
                    onClick={addMedicalRecord}
                    className="w-full py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8478] transition-colors"
                  >
                    {t('tools.petPatient.addRecord', 'Add Record')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top">
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PetPatientTool;
