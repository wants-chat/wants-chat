'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PawPrint,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Heart,
  Pill,
  Syringe,
  Calendar,
  Weight,
  AlertTriangle,
  Utensils,
  Activity,
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

interface PetCareToolProps {
  uiConfig?: UIConfig;
}

type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'guinea-pig' | 'fish' | 'other';

interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: number;
  weight: number;
  color: string;
  microchipId?: string;
  dateOfBirth: string;
}

interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccine' | 'checkup' | 'treatment' | 'surgery' | 'dental';
  description: string;
  date: string;
  veterinarian?: string;
  notes?: string;
}

interface FoodLog {
  id: string;
  petId: string;
  date: string;
  time: string;
  foodType: string;
  quantity: number;
  unit: 'grams' | 'cups' | 'ml' | 'oz';
  notes?: string;
}

interface Activity {
  id: string;
  petId: string;
  date: string;
  type: 'walk' | 'play' | 'exercise' | 'training' | 'grooming';
  duration: number; // in minutes
  notes?: string;
}

// Column configurations
const PETS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Pet Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'breed', header: 'Breed', type: 'string' },
  { key: 'age', header: 'Age', type: 'number' },
  { key: 'weight', header: 'Weight', type: 'number' },
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
];

const HEALTH_RECORDS_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'veterinarian', header: 'Veterinarian', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const FOOD_LOG_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'foodType', header: 'Food Type', type: 'string' },
  { key: 'quantity', header: 'Quantity', type: 'number' },
  { key: 'unit', header: 'Unit', type: 'string' },
];

const ACTIVITY_COLUMNS: ColumnConfig[] = [
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

type ActiveTab = 'pets' | 'health' | 'food' | 'activity';

const generateId = () => Math.random().toString(36).substring(2, 11);

const petTypeIcons: Record<PetType, string> = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  hamster: '🐹',
  'guinea-pig': '🐹',
  fish: '🐠',
  other: '🐾',
};

export const PetCareTool: React.FC<PetCareToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pets');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Initialize useToolData hooks for each data type
  const petsHook = useToolData<Pet>('pet-care-pets', [], PETS_COLUMNS);
  const healthHook = useToolData<HealthRecord>('pet-care-health', [], HEALTH_RECORDS_COLUMNS);
  const foodHook = useToolData<FoodLog>('pet-care-food', [], FOOD_LOG_COLUMNS);
  const activityHook = useToolData<Activity>('pet-care-activity', [], ACTIVITY_COLUMNS);

  const pets = petsHook.data;
  const healthRecords = healthHook.data;
  const foodLogs = foodHook.data;
  const activities = activityHook.data;

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
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  // Pet form
  const [petForm, setPetForm] = useState<Omit<Pet, 'id'>>({
    name: '',
    type: 'dog',
    breed: '',
    age: 0,
    weight: 0,
    color: '',
    dateOfBirth: '',
  });

  // Health form
  const [healthForm, setHealthForm] = useState<Omit<HealthRecord, 'id'>>({
    petId: '',
    type: 'checkup',
    description: '',
    date: '',
    veterinarian: '',
    notes: '',
  });

  // Food form
  const [foodForm, setFoodForm] = useState<Omit<FoodLog, 'id'>>({
    petId: '',
    date: '',
    time: '',
    foodType: '',
    quantity: 0,
    unit: 'cups',
    notes: '',
  });

  // Activity form
  const [activityForm, setActivityForm] = useState<Omit<Activity, 'id'>>({
    petId: '',
    date: '',
    type: 'walk',
    duration: 0,
    notes: '',
  });

  // CRUD handlers
  const handleAddPet = () => {
    if (!petForm.name) return;
    petsHook.addItem({ ...petForm, id: generateId() });
    setPetForm({
      name: '',
      type: 'dog',
      breed: '',
      age: 0,
      weight: 0,
      color: '',
      dateOfBirth: '',
    });
    setShowPetForm(false);
  };

  const handleDeletePet = (id: string) => {
    petsHook.deleteItem(id);
    healthHook.setData(healthRecords.filter((h) => h.petId !== id));
    foodHook.setData(foodLogs.filter((f) => f.petId !== id));
    activityHook.setData(activities.filter((a) => a.petId !== id));
    if (selectedPetId === id) setSelectedPetId(null);
  };

  const handleAddHealth = () => {
    if (!healthForm.description || !healthForm.petId) return;
    healthHook.addItem({ ...healthForm, id: generateId() });
    setHealthForm({
      petId: '',
      type: 'checkup',
      description: '',
      date: '',
      veterinarian: '',
      notes: '',
    });
    setShowHealthForm(false);
  };

  const handleDeleteHealth = (id: string) => {
    healthHook.deleteItem(id);
  };

  const handleAddFood = () => {
    if (!foodForm.foodType || !foodForm.petId) return;
    foodHook.addItem({ ...foodForm, id: generateId() });
    setFoodForm({
      petId: '',
      date: '',
      time: '',
      foodType: '',
      quantity: 0,
      unit: 'cups',
      notes: '',
    });
    setShowFoodForm(false);
  };

  const handleDeleteFood = (id: string) => {
    foodHook.deleteItem(id);
  };

  const handleAddActivity = () => {
    if (!activityForm.petId || activityForm.duration <= 0) return;
    activityHook.addItem({ ...activityForm, id: generateId() });
    setActivityForm({
      petId: '',
      date: '',
      type: 'walk',
      duration: 0,
      notes: '',
    });
    setShowActivityForm(false);
  };

  const handleDeleteActivity = (id: string) => {
    activityHook.deleteItem(id);
  };

  // Filtered data
  const filteredHealthRecords = selectedPetId ? healthRecords.filter((h) => h.petId === selectedPetId) : healthRecords;
  const filteredFoodLogs = selectedPetId ? foodLogs.filter((f) => f.petId === selectedPetId) : foodLogs;
  const filteredActivities = selectedPetId ? activities.filter((a) => a.petId === selectedPetId) : activities;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'pets', label: 'Pets', icon: <PawPrint className="w-4 h-4" /> },
    { id: 'health', label: 'Health', icon: <Heart className="w-4 h-4" /> },
    { id: 'food', label: 'Food', icon: <Utensils className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  ];

  // Helper to get the current hook based on active tab
  const getExportDataHook = () => {
    switch (activeTab) {
      case 'health':
        return healthHook;
      case 'food':
        return foodHook;
      case 'activity':
        return activityHook;
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
      case 'health':
        return {
          data: filteredHealthRecords.map((record) => ({
            ...record,
            petName: getPetName(record.petId),
          })),
          columns: HEALTH_RECORDS_COLUMNS,
          filename: 'pet-health-records',
          title: 'Pet Health Records',
        };
      case 'food':
        return {
          data: filteredFoodLogs.map((log) => ({
            ...log,
            petName: getPetName(log.petId),
          })),
          columns: FOOD_LOG_COLUMNS,
          filename: 'pet-food-logs',
          title: 'Pet Food Logs',
        };
      case 'activity':
        return {
          data: filteredActivities.map((act) => ({
            ...act,
            petName: getPetName(act.petId),
          })),
          columns: ACTIVITY_COLUMNS,
          filename: 'pet-activities',
          title: 'Pet Activities',
        };
      default:
        return { data: [], columns: [], filename: 'export', title: 'Export' };
    }
  }, [activeTab, pets, filteredHealthRecords, filteredFoodLogs, filteredActivities]);

  const hasExportData = getExportData.data.length > 0;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <PawPrint className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petCare.petCareManager', 'Pet Care Manager')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petCare.trackHealthNutritionAndActivity', 'Track health, nutrition, and activity')}</p>
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
            <WidgetEmbedButton toolSlug="pet-care" toolName="Pet Care" />

            <SyncStatus
              isSynced={petsHook.isSynced && healthHook.isSynced && foodHook.isSynced && activityHook.isSynced}
              isSaving={petsHook.isSaving || healthHook.isSaving || foodHook.isSaving || activityHook.isSaving}
              lastSaved={petsHook.lastSaved || healthHook.lastSaved || foodHook.lastSaved || activityHook.lastSaved}
              syncError={petsHook.syncError || healthHook.syncError || foodHook.syncError || activityHook.syncError}
              onForceSync={async () => {
                await Promise.all([
                  petsHook.forceSync(),
                  healthHook.forceSync(),
                  foodHook.forceSync(),
                  activityHook.forceSync(),
                ]);
              }}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
              showLabel={true}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 px-6 pt-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? isDark
                  ? 'bg-gray-800 text-orange-400 border-b-2 border-orange-400'
                  : 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                : isDark
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* Pets Tab */}
        {activeTab === 'pets' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowPetForm(!showPetForm)}
              className={`w-full ${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
            >
              <Plus className="w-4 h-4" />
              {t('tools.petCare.addPet', 'Add Pet')}
            </button>

            {showPetForm && (
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 space-y-3`}>
                <input
                  type="text"
                  placeholder={t('tools.petCare.petName', 'Pet Name')}
                  value={petForm.name}
                  onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                />
                <select
                  value={petForm.type}
                  onChange={(e) => setPetForm({ ...petForm, type: e.target.value as PetType })}
                  className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                >
                  <option value="dog">{t('tools.petCare.dog', 'Dog')}</option>
                  <option value="cat">{t('tools.petCare.cat', 'Cat')}</option>
                  <option value="bird">{t('tools.petCare.bird', 'Bird')}</option>
                  <option value="rabbit">{t('tools.petCare.rabbit', 'Rabbit')}</option>
                  <option value="hamster">{t('tools.petCare.hamster', 'Hamster')}</option>
                  <option value="guinea-pig">{t('tools.petCare.guineaPig', 'Guinea Pig')}</option>
                  <option value="fish">{t('tools.petCare.fish', 'Fish')}</option>
                  <option value="other">{t('tools.petCare.other', 'Other')}</option>
                </select>
                <input
                  type="text"
                  placeholder={t('tools.petCare.breed', 'Breed')}
                  value={petForm.breed}
                  onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={t('tools.petCare.age', 'Age')}
                    value={petForm.age}
                    onChange={(e) => setPetForm({ ...petForm, age: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                  />
                  <input
                    type="number"
                    placeholder={t('tools.petCare.weightLbs', 'Weight (lbs)')}
                    value={petForm.weight}
                    onChange={(e) => setPetForm({ ...petForm, weight: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                  />
                </div>
                <input
                  type="text"
                  placeholder={t('tools.petCare.color', 'Color')}
                  value={petForm.color}
                  onChange={(e) => setPetForm({ ...petForm, color: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                />
                <input
                  type="date"
                  placeholder={t('tools.petCare.dateOfBirth', 'Date of Birth')}
                  value={petForm.dateOfBirth}
                  onChange={(e) => setPetForm({ ...petForm, dateOfBirth: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPet}
                    className={`flex-1 ${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                  >
                    <Check className="w-4 h-4" />
                    {t('tools.petCare.savePet', 'Save Pet')}
                  </button>
                  <button
                    onClick={() => setShowPetForm(false)}
                    className={`flex-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} text-gray-900 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                  >
                    <X className="w-4 h-4" />
                    {t('tools.petCare.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {pets.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <PawPrint className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.petCare.noPetsYetAddYour', 'No pets yet. Add your first pet!')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{petTypeIcons[pet.type]}</span>
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {pet.name}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {pet.breed} • {pet.age} years • {pet.weight} lbs
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPetId(pet.id)}
                          className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} transition-colors`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            {pets.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.petCare.addAPetFirstTo', 'Add a pet first to track health records')}</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <select
                    value={selectedPetId || ''}
                    onChange={(e) => setSelectedPetId(e.target.value || null)}
                    className={`flex-1 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} border`}
                  >
                    <option value="">{t('tools.petCare.allPets', 'All Pets')}</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowHealthForm(!showHealthForm)}
                    className={`${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showHealthForm && (
                  <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 space-y-3`}>
                    <select
                      value={healthForm.petId}
                      onChange={(e) => setHealthForm({ ...healthForm, petId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    >
                      <option value="">{t('tools.petCare.selectPet', 'Select Pet')}</option>
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={healthForm.type}
                      onChange={(e) =>
                        setHealthForm({ ...healthForm, type: e.target.value as HealthRecord['type'] })
                      }
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    >
                      <option value="vaccine">{t('tools.petCare.vaccine', 'Vaccine')}</option>
                      <option value="checkup">{t('tools.petCare.checkup', 'Checkup')}</option>
                      <option value="treatment">{t('tools.petCare.treatment', 'Treatment')}</option>
                      <option value="surgery">{t('tools.petCare.surgery', 'Surgery')}</option>
                      <option value="dental">{t('tools.petCare.dental', 'Dental')}</option>
                    </select>
                    <input
                      type="text"
                      placeholder={t('tools.petCare.description', 'Description')}
                      value={healthForm.description}
                      onChange={(e) => setHealthForm({ ...healthForm, description: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    />
                    <input
                      type="date"
                      value={healthForm.date}
                      onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    />
                    <input
                      type="text"
                      placeholder={t('tools.petCare.veterinarianOptional', 'Veterinarian (optional)')}
                      value={healthForm.veterinarian || ''}
                      onChange={(e) => setHealthForm({ ...healthForm, veterinarian: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    />
                    <textarea
                      placeholder={t('tools.petCare.notesOptional', 'Notes (optional)')}
                      value={healthForm.notes || ''}
                      onChange={(e) => setHealthForm({ ...healthForm, notes: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddHealth}
                        className={`flex-1 ${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                      >
                        <Check className="w-4 h-4" />
                        {t('tools.petCare.saveRecord', 'Save Record')}
                      </button>
                      <button
                        onClick={() => setShowHealthForm(false)}
                        className={`flex-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} text-gray-900 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                      >
                        <X className="w-4 h-4" />
                        {t('tools.petCare.cancel2', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {filteredHealthRecords.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Syringe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.petCare.noHealthRecordsYet', 'No health records yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredHealthRecords.map((record) => {
                      const pet = pets.find((p) => p.id === record.petId);
                      return (
                        <div
                          key={record.id}
                          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {pet?.name} - {record.type}
                              </h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {record.description}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {new Date(record.date).toLocaleDateString()}
                                {record.veterinarian && ` • Dr. ${record.veterinarian}`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteHealth(record.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Food Tab */}
        {activeTab === 'food' && (
          <div className="space-y-4">
            {pets.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.petCare.addAPetFirstTo2', 'Add a pet first to track food logs')}</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <select
                    value={selectedPetId || ''}
                    onChange={(e) => setSelectedPetId(e.target.value || null)}
                    className={`flex-1 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} border`}
                  >
                    <option value="">{t('tools.petCare.allPets2', 'All Pets')}</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowFoodForm(!showFoodForm)}
                    className={`${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showFoodForm && (
                  <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 space-y-3`}>
                    <select
                      value={foodForm.petId}
                      onChange={(e) => setFoodForm({ ...foodForm, petId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    >
                      <option value="">{t('tools.petCare.selectPet2', 'Select Pet')}</option>
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={foodForm.date}
                        onChange={(e) => setFoodForm({ ...foodForm, date: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                      />
                      <input
                        type="time"
                        value={foodForm.time}
                        onChange={(e) => setFoodForm({ ...foodForm, time: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder={t('tools.petCare.foodType', 'Food Type')}
                      value={foodForm.foodType}
                      onChange={(e) => setFoodForm({ ...foodForm, foodType: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder={t('tools.petCare.quantity', 'Quantity')}
                        value={foodForm.quantity}
                        onChange={(e) => setFoodForm({ ...foodForm, quantity: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                      />
                      <select
                        value={foodForm.unit}
                        onChange={(e) =>
                          setFoodForm({ ...foodForm, unit: e.target.value as FoodLog['unit'] })
                        }
                        className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                      >
                        <option value="cups">{t('tools.petCare.cups', 'Cups')}</option>
                        <option value="grams">{t('tools.petCare.grams', 'Grams')}</option>
                        <option value="ml">ML</option>
                        <option value="oz">Oz</option>
                      </select>
                    </div>
                    <textarea
                      placeholder={t('tools.petCare.notesOptional2', 'Notes (optional)')}
                      value={foodForm.notes || ''}
                      onChange={(e) => setFoodForm({ ...foodForm, notes: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddFood}
                        className={`flex-1 ${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                      >
                        <Check className="w-4 h-4" />
                        {t('tools.petCare.saveLog', 'Save Log')}
                      </button>
                      <button
                        onClick={() => setShowFoodForm(false)}
                        className={`flex-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} text-gray-900 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                      >
                        <X className="w-4 h-4" />
                        {t('tools.petCare.cancel3', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {filteredFoodLogs.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.petCare.noFoodLogsYet', 'No food logs yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFoodLogs.map((log) => {
                      const pet = pets.find((p) => p.id === log.petId);
                      return (
                        <div
                          key={log.id}
                          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {pet?.name} - {log.foodType}
                              </h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {log.quantity} {log.unit}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {new Date(log.date).toLocaleDateString()} at {log.time}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteFood(log.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {pets.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.petCare.addAPetFirstTo3', 'Add a pet first to track activities')}</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <select
                    value={selectedPetId || ''}
                    onChange={(e) => setSelectedPetId(e.target.value || null)}
                    className={`flex-1 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} border`}
                  >
                    <option value="">{t('tools.petCare.allPets3', 'All Pets')}</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowActivityForm(!showActivityForm)}
                    className={`${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showActivityForm && (
                  <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 space-y-3`}>
                    <select
                      value={activityForm.petId}
                      onChange={(e) => setActivityForm({ ...activityForm, petId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    >
                      <option value="">{t('tools.petCare.selectPet3', 'Select Pet')}</option>
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={activityForm.date}
                      onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    />
                    <select
                      value={activityForm.type}
                      onChange={(e) =>
                        setActivityForm({ ...activityForm, type: e.target.value as Activity['type'] })
                      }
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    >
                      <option value="walk">{t('tools.petCare.walk', 'Walk')}</option>
                      <option value="play">{t('tools.petCare.play', 'Play')}</option>
                      <option value="exercise">{t('tools.petCare.exercise', 'Exercise')}</option>
                      <option value="training">{t('tools.petCare.training', 'Training')}</option>
                      <option value="grooming">{t('tools.petCare.grooming', 'Grooming')}</option>
                    </select>
                    <input
                      type="number"
                      placeholder={t('tools.petCare.durationMinutes', 'Duration (minutes)')}
                      value={activityForm.duration}
                      onChange={(e) => setActivityForm({ ...activityForm, duration: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                    />
                    <textarea
                      placeholder={t('tools.petCare.notesOptional3', 'Notes (optional)')}
                      value={activityForm.notes || ''}
                      onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border`}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddActivity}
                        className={`flex-1 ${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                      >
                        <Check className="w-4 h-4" />
                        {t('tools.petCare.saveActivity', 'Save Activity')}
                      </button>
                      <button
                        onClick={() => setShowActivityForm(false)}
                        className={`flex-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} text-gray-900 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                      >
                        <X className="w-4 h-4" />
                        {t('tools.petCare.cancel4', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {filteredActivities.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.petCare.noActivitiesYet', 'No activities yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredActivities.map((activity) => {
                      const pet = pets.find((p) => p.id === activity.petId);
                      return (
                        <div
                          key={activity.id}
                          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {pet?.name} - {activity.type}
                              </h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {activity.duration} minutes
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {new Date(activity.date).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetCareTool;
