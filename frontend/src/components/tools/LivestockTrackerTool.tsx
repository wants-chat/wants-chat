'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Beef,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Calendar,
  Scale,
  Heart,
  Syringe,
  Egg,
  Wheat,
  BarChart3,
  Check,
  X,
  AlertTriangle,
  Info,
  Tag,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  FileText,
  Users,
  Baby,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface LivestockTrackerToolProps {
  uiConfig?: UIConfig;
}

type Species = 'cattle' | 'sheep' | 'goats' | 'pigs' | 'chickens' | 'horses' | 'ducks' | 'turkeys' | 'other';
type Gender = 'male' | 'female';
type AnimalStatus = 'active' | 'sold' | 'deceased' | 'quarantine' | 'breeding';
type ActiveTab = 'animals' | 'health' | 'breeding' | 'feed' | 'reports';

interface Animal {
  id: string;
  tagId: string;
  name: string;
  species: Species;
  breed: string;
  birthDate: string;
  gender: Gender;
  weight: number;
  status: AnimalStatus;
  location: string;
  motherId?: string;
  fatherId?: string;
  notes?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  createdAt: string;
}

interface HealthRecord {
  id: string;
  animalId: string;
  type: 'vaccination' | 'treatment' | 'vet_visit' | 'deworming' | 'injury' | 'illness';
  date: string;
  description: string;
  medication?: string;
  dosage?: string;
  administeredBy?: string;
  nextDue?: string;
  cost?: number;
  notes?: string;
}

interface BreedingRecord {
  id: string;
  femaleId: string;
  maleId: string;
  breedingDate: string;
  expectedDueDate?: string;
  actualBirthDate?: string;
  offspringCount?: number;
  offspringIds?: string[];
  status: 'bred' | 'confirmed' | 'delivered' | 'failed';
  notes?: string;
}

interface FeedRecord {
  id: string;
  animalId?: string;
  groupId?: string;
  feedType: string;
  quantity: number;
  unit: 'lbs' | 'kg' | 'bags';
  date: string;
  cost?: number;
  notes?: string;
}

interface WeightRecord {
  id: string;
  animalId: string;
  weight: number;
  date: string;
  notes?: string;
}

interface LivestockData {
  animals: Animal[];
  healthRecords: HealthRecord[];
  breedingRecords: BreedingRecord[];
  feedRecords: FeedRecord[];
  weightRecords: WeightRecord[];
}

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

const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years}y ${months}m`;
  }
  return `${months}m`;
};

const speciesIcons: Record<Species, string> = {
  cattle: '🐄',
  sheep: '🐑',
  goats: '🐐',
  pigs: '🐷',
  chickens: '🐔',
  horses: '🐴',
  ducks: '🦆',
  turkeys: '🦃',
  other: '🐾',
};

const speciesOptions: { value: Species; label: string }[] = [
  { value: 'cattle', label: 'Cattle' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'goats', label: 'Goats' },
  { value: 'pigs', label: 'Pigs' },
  { value: 'chickens', label: 'Chickens' },
  { value: 'horses', label: 'Horses' },
  { value: 'ducks', label: 'Ducks' },
  { value: 'turkeys', label: 'Turkeys' },
  { value: 'other', label: 'Other' },
];

const statusColors: Record<AnimalStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-500' },
  sold: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  deceased: { bg: 'bg-gray-500/10', text: 'text-gray-500' },
  quarantine: { bg: 'bg-red-500/10', text: 'text-red-500' },
  breeding: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
};

const generateSampleData = (): LivestockData => {
  const today = new Date();
  const animals: Animal[] = [
    {
      id: generateId(),
      tagId: 'CTL-001',
      name: 'Bessie',
      species: 'cattle',
      breed: 'Holstein',
      birthDate: new Date(today.getFullYear() - 3, 4, 15).toISOString().split('T')[0],
      gender: 'female',
      weight: 1200,
      status: 'active',
      location: 'Pasture A',
      notes: 'Good milk producer',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      tagId: 'CTL-002',
      name: 'Duke',
      species: 'cattle',
      breed: 'Angus',
      birthDate: new Date(today.getFullYear() - 2, 8, 20).toISOString().split('T')[0],
      gender: 'male',
      weight: 1500,
      status: 'breeding',
      location: 'Pasture B',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      tagId: 'SHP-001',
      name: 'Woolly',
      species: 'sheep',
      breed: 'Merino',
      birthDate: new Date(today.getFullYear() - 1, 2, 10).toISOString().split('T')[0],
      gender: 'female',
      weight: 150,
      status: 'active',
      location: 'Barn 1',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      tagId: 'PIG-001',
      name: 'Hamlet',
      species: 'pigs',
      breed: 'Yorkshire',
      birthDate: new Date(today.getFullYear(), 1, 5).toISOString().split('T')[0],
      gender: 'male',
      weight: 250,
      status: 'active',
      location: 'Pig Pen',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      tagId: 'CHK-001',
      name: 'Henrietta',
      species: 'chickens',
      breed: 'Rhode Island Red',
      birthDate: new Date(today.getFullYear() - 1, 6, 1).toISOString().split('T')[0],
      gender: 'female',
      weight: 6,
      status: 'active',
      location: 'Coop A',
      createdAt: new Date().toISOString(),
    },
  ];

  const healthRecords: HealthRecord[] = [
    {
      id: generateId(),
      animalId: animals[0].id,
      type: 'vaccination',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 15).toISOString().split('T')[0],
      description: 'Annual vaccination',
      medication: 'Bovine Viral Diarrhea Vaccine',
      dosage: '2ml',
      administeredBy: 'Dr. Smith',
      nextDue: new Date(today.getFullYear() + 1, today.getMonth() - 2, 15).toISOString().split('T')[0],
      cost: 45,
    },
    {
      id: generateId(),
      animalId: animals[2].id,
      type: 'deworming',
      date: new Date(today.getFullYear(), today.getMonth() - 1, 10).toISOString().split('T')[0],
      description: 'Routine deworming',
      medication: 'Ivermectin',
      dosage: '1ml per 50lbs',
      nextDue: new Date(today.getFullYear(), today.getMonth() + 2, 10).toISOString().split('T')[0],
      cost: 15,
    },
  ];

  const breedingRecords: BreedingRecord[] = [
    {
      id: generateId(),
      femaleId: animals[0].id,
      maleId: animals[1].id,
      breedingDate: new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString().split('T')[0],
      expectedDueDate: new Date(today.getFullYear(), today.getMonth() + 4, 1).toISOString().split('T')[0],
      status: 'confirmed',
      notes: 'First breeding attempt successful',
    },
  ];

  const feedRecords: FeedRecord[] = [
    {
      id: generateId(),
      feedType: 'Hay',
      quantity: 50,
      unit: 'lbs',
      date: new Date().toISOString().split('T')[0],
      cost: 25,
      notes: 'Morning feeding - all cattle',
    },
    {
      id: generateId(),
      feedType: 'Grain Mix',
      quantity: 20,
      unit: 'lbs',
      date: new Date().toISOString().split('T')[0],
      cost: 15,
      notes: 'Supplemental feed',
    },
  ];

  const weightRecords: WeightRecord[] = [
    {
      id: generateId(),
      animalId: animals[0].id,
      weight: 1150,
      date: new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0],
    },
    {
      id: generateId(),
      animalId: animals[0].id,
      weight: 1200,
      date: new Date().toISOString().split('T')[0],
    },
  ];

  return { animals, healthRecords, breedingRecords, feedRecords, weightRecords };
};

// Column configuration for animals export
const COLUMNS: ColumnConfig[] = [
  { key: 'tagId', header: 'Tag ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'species', header: 'Species', type: 'string' },
  { key: 'breed', header: 'Breed', type: 'string' },
  { key: 'birthDate', header: 'Birth Date', type: 'date' },
  { key: 'gender', header: 'Gender', type: 'string' },
  { key: 'weight', header: 'Weight (lbs)', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

export const LivestockTrackerTool: React.FC<LivestockTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('animals');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<Species | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AnimalStatus | 'all'>('all');
  const [filterLocation, setFilterLocation] = useState('');

  // Use the new useToolData hook for backend persistence of animals
  const {
    data: animals,
    setData: setAnimals,
    addItem: addAnimalItem,
    updateItem: updateAnimalItem,
    deleteItem: deleteAnimalItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Animal>('livestock-tracker', [], COLUMNS);

  // Related records (stored in localStorage, tied to animal lifecycle)
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);

  // Form states
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showBreedingForm, setShowBreedingForm] = useState(false);
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  // Animal form
  const [animalForm, setAnimalForm] = useState<Omit<Animal, 'id' | 'createdAt'>>({
    tagId: '',
    name: '',
    species: 'cattle',
    breed: '',
    birthDate: '',
    gender: 'female',
    weight: 0,
    status: 'active',
    location: '',
    notes: '',
  });

  // Health form
  const [healthForm, setHealthForm] = useState<Omit<HealthRecord, 'id'>>({
    animalId: '',
    type: 'vaccination',
    date: new Date().toISOString().split('T')[0],
    description: '',
    medication: '',
    dosage: '',
    administeredBy: '',
    nextDue: '',
    cost: undefined,
    notes: '',
  });

  // Breeding form
  const [breedingForm, setBreedingForm] = useState<Omit<BreedingRecord, 'id'>>({
    femaleId: '',
    maleId: '',
    breedingDate: new Date().toISOString().split('T')[0],
    expectedDueDate: '',
    status: 'bred',
    notes: '',
  });

  // Feed form
  const [feedForm, setFeedForm] = useState<Omit<FeedRecord, 'id'>>({
    feedType: '',
    quantity: 0,
    unit: 'lbs',
    date: new Date().toISOString().split('T')[0],
    cost: undefined,
    notes: '',
  });

  // Weight form
  const [weightForm, setWeightForm] = useState<Omit<WeightRecord, 'id'>>({
    animalId: '',
    weight: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Load related records from localStorage (animals are loaded by useToolData)
  useEffect(() => {
    const savedRecords = localStorage.getItem('livestock-tracker-records');
    if (savedRecords) {
      try {
        const parsed = JSON.parse(savedRecords);
        setHealthRecords(parsed.healthRecords || []);
        setBreedingRecords(parsed.breedingRecords || []);
        setFeedRecords(parsed.feedRecords || []);
        setWeightRecords(parsed.weightRecords || []);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Generate sample data for first-time users if animals are empty after loading
  useEffect(() => {
    if (!isLoading && animals.length === 0 && !healthRecords.length) {
      const sample = generateSampleData();
      setAnimals(sample.animals);
      setHealthRecords(sample.healthRecords);
      setBreedingRecords(sample.breedingRecords);
      setFeedRecords(sample.feedRecords);
      setWeightRecords(sample.weightRecords);
    }
  }, [isLoading, animals.length, healthRecords.length, setAnimals]);

  // Save related records to localStorage
  useEffect(() => {
    const records = {
      healthRecords,
      breedingRecords,
      feedRecords,
      weightRecords,
    };
    localStorage.setItem('livestock-tracker-records', JSON.stringify(records));
  }, [healthRecords, breedingRecords, feedRecords, weightRecords]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData as ToolPrefillData;
      if (prefillData.species || prefillData.name || prefillData.tagId) {
        setAnimalForm(prev => ({
          ...prev,
          species: (prefillData.species as Species) || prev.species,
          name: prefillData.name || prev.name,
          tagId: prefillData.tagId || prev.tagId,
        }));
        setShowAnimalForm(true);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Filter animals
  const filteredAnimals = useMemo(() => {
    return animals.filter(animal => {
      const matchesSearch = searchTerm === '' ||
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecies = filterSpecies === 'all' || animal.species === filterSpecies;
      const matchesStatus = filterStatus === 'all' || animal.status === filterStatus;
      const matchesLocation = filterLocation === '' ||
        animal.location.toLowerCase().includes(filterLocation.toLowerCase());

      return matchesSearch && matchesSpecies && matchesStatus && matchesLocation;
    });
  }, [animals, searchTerm, filterSpecies, filterStatus, filterLocation]);

  // Get unique locations
  const uniqueLocations = useMemo(() => {
    const locations = new Set(animals.map(a => a.location).filter(Boolean));
    return Array.from(locations);
  }, [animals]);

  // Calculate reminders
  const reminders = useMemo(() => {
    const alerts: { type: string; message: string; daysUntil: number; urgency: 'high' | 'medium' | 'low' }[] = [];

    // Health reminders
    healthRecords.forEach(record => {
      if (record.nextDue) {
        const days = getDaysUntil(record.nextDue);
        if (days <= 14 && days >= -7) {
          const animal = animals.find(a => a.id === record.animalId);
          alerts.push({
            type: 'health',
            message: `${animal?.name || 'Animal'} - ${record.type} due`,
            daysUntil: days,
            urgency: days <= 0 ? 'high' : days <= 7 ? 'medium' : 'low',
          });
        }
      }
    });

    // Breeding due dates
    breedingRecords.forEach(record => {
      if (record.expectedDueDate && record.status === 'confirmed') {
        const days = getDaysUntil(record.expectedDueDate);
        if (days <= 30 && days >= -7) {
          const female = animals.find(a => a.id === record.femaleId);
          alerts.push({
            type: 'breeding',
            message: `${female?.name || 'Animal'} expected to deliver`,
            daysUntil: days,
            urgency: days <= 7 ? 'high' : days <= 14 ? 'medium' : 'low',
          });
        }
      }
    });

    return alerts.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [animals, healthRecords, breedingRecords]);

  // Calculate statistics
  const stats = useMemo(() => {
    const activeAnimals = animals.filter(a => a.status === 'active').length;
    const totalAnimals = animals.length;
    const bySpecies: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    animals.forEach(animal => {
      bySpecies[animal.species] = (bySpecies[animal.species] || 0) + 1;
      byStatus[animal.status] = (byStatus[animal.status] || 0) + 1;
    });

    const totalWeight = animals.reduce((sum, a) => sum + (a.weight || 0), 0);
    const avgWeight = totalAnimals > 0 ? totalWeight / totalAnimals : 0;

    const totalFeedCost = feedRecords.reduce((sum, f) => sum + (f.cost || 0), 0);
    const totalHealthCost = healthRecords.reduce((sum, h) => sum + (h.cost || 0), 0);

    return {
      activeAnimals,
      totalAnimals,
      bySpecies,
      byStatus,
      avgWeight,
      totalFeedCost,
      totalHealthCost,
    };
  }, [animals, feedRecords, healthRecords]);

  // CRUD handlers
  const handleAddAnimal = () => {
    if (!animalForm.tagId || !animalForm.species) return;
    const newAnimal: Animal = {
      ...animalForm,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    addAnimalItem(newAnimal);
    resetAnimalForm();
  };

  const handleUpdateAnimal = () => {
    if (!editingAnimal) return;
    updateAnimalItem(editingAnimal.id, animalForm);
    resetAnimalForm();
  };

  const handleDeleteAnimal = (id: string) => {
    deleteAnimalItem(id);
    setHealthRecords(healthRecords.filter(h => h.animalId !== id));
    setWeightRecords(weightRecords.filter(w => w.animalId !== id));
  };

  const resetAnimalForm = () => {
    setAnimalForm({
      tagId: '',
      name: '',
      species: 'cattle',
      breed: '',
      birthDate: '',
      gender: 'female',
      weight: 0,
      status: 'active',
      location: '',
      notes: '',
    });
    setShowAnimalForm(false);
    setEditingAnimal(null);
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setAnimalForm({
      tagId: animal.tagId,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      birthDate: animal.birthDate,
      gender: animal.gender,
      weight: animal.weight,
      status: animal.status,
      location: animal.location,
      notes: animal.notes || '',
    });
    setShowAnimalForm(true);
  };

  const handleAddHealthRecord = () => {
    if (!healthForm.animalId || !healthForm.description) return;
    setHealthRecords([...healthRecords, { ...healthForm, id: generateId() }]);
    setHealthForm({
      animalId: '',
      type: 'vaccination',
      date: new Date().toISOString().split('T')[0],
      description: '',
      medication: '',
      dosage: '',
      administeredBy: '',
      nextDue: '',
      cost: undefined,
      notes: '',
    });
    setShowHealthForm(false);
  };

  const handleDeleteHealthRecord = (id: string) => {
    setHealthRecords(healthRecords.filter(h => h.id !== id));
  };

  const handleAddBreedingRecord = () => {
    if (!breedingForm.femaleId || !breedingForm.maleId) return;
    setBreedingRecords([...breedingRecords, { ...breedingForm, id: generateId() }]);
    setBreedingForm({
      femaleId: '',
      maleId: '',
      breedingDate: new Date().toISOString().split('T')[0],
      expectedDueDate: '',
      status: 'bred',
      notes: '',
    });
    setShowBreedingForm(false);
  };

  const handleUpdateBreedingStatus = (id: string, status: BreedingRecord['status']) => {
    setBreedingRecords(breedingRecords.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleDeleteBreedingRecord = (id: string) => {
    setBreedingRecords(breedingRecords.filter(b => b.id !== id));
  };

  const handleAddFeedRecord = () => {
    if (!feedForm.feedType || feedForm.quantity <= 0) return;
    setFeedRecords([...feedRecords, { ...feedForm, id: generateId() }]);
    setFeedForm({
      feedType: '',
      quantity: 0,
      unit: 'lbs',
      date: new Date().toISOString().split('T')[0],
      cost: undefined,
      notes: '',
    });
    setShowFeedForm(false);
  };

  const handleDeleteFeedRecord = (id: string) => {
    setFeedRecords(feedRecords.filter(f => f.id !== id));
  };

  const handleAddWeightRecord = () => {
    if (!weightForm.animalId || weightForm.weight <= 0) return;
    setWeightRecords([...weightRecords, { ...weightForm, id: generateId() }]);
    // Update animal's current weight using the hook's updateItem
    updateAnimalItem(weightForm.animalId, { weight: weightForm.weight });
    setWeightForm({
      animalId: '',
      weight: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowWeightForm(false);
  };

  const handleDeleteWeightRecord = (id: string) => {
    setWeightRecords(weightRecords.filter(w => w.id !== id));
  };

  const getAnimalName = (id: string) => {
    const animal = animals.find(a => a.id === id);
    return animal ? `${animal.name} (${animal.tagId})` : 'Unknown';
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'animals', label: 'Animals', icon: <Beef className="w-4 h-4" /> },
    { id: 'health', label: 'Health', icon: <Heart className="w-4 h-4" /> },
    { id: 'breeding', label: 'Breeding', icon: <Baby className="w-4 h-4" /> },
    { id: 'feed', label: 'Feed', icon: <Wheat className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Beef className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.livestockTracker', 'Livestock Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.livestockTracker.trackAnimalsHealthBreedingAnd', 'Track animals, health, breeding, and feed')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="livestock-tracker" toolName="Livestock Tracker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'livestock-animals' })}
              onExportExcel={() => exportExcel({ filename: 'livestock-animals' })}
              onExportJSON={() => exportJSON({ filename: 'livestock-animals' })}
              onExportPDF={() => exportPDF({ filename: 'livestock-animals', title: 'Livestock Animals', subtitle: `Total: ${animals.length} animals` })}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onPrint={() => print('Livestock Animals')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              disabled={animals.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Reminders Alert */}
        {reminders.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.upcomingReminders', 'Upcoming Reminders')}</h4>
            </div>
            <div className="space-y-2">
              {reminders.slice(0, 5).map((reminder, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-sm ${
                    reminder.urgency === 'high'
                      ? 'text-red-500'
                      : reminder.urgency === 'medium'
                      ? isDark ? 'text-amber-400' : 'text-amber-600'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Beef className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockTracker.totalAnimals', 'Total Animals')}</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{stats.totalAnimals}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockTracker.active', 'Active')}</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{stats.activeAnimals}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Wheat className="w-4 h-4 text-amber-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockTracker.feedCost', 'Feed Cost')}</span>
            </div>
            <div className="text-2xl font-bold text-amber-500">${stats.totalFeedCost.toFixed(0)}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockTracker.healthCost', 'Health Cost')}</span>
            </div>
            <div className="text-2xl font-bold text-red-500">${stats.totalHealthCost.toFixed(0)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                activeTab === tab.id ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Animals Tab */}
        {activeTab === 'animals' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('tools.livestockTracker.searchByNameTagOr', 'Search by name, tag, or breed...')}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value as Species | 'all')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="all">{t('tools.livestockTracker.allSpecies', 'All Species')}</option>
                {speciesOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AnimalStatus | 'all')}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="all">{t('tools.livestockTracker.allStatus', 'All Status')}</option>
                <option value="active">{t('tools.livestockTracker.active2', 'Active')}</option>
                <option value="breeding">{t('tools.livestockTracker.breeding', 'Breeding')}</option>
                <option value="quarantine">{t('tools.livestockTracker.quarantine', 'Quarantine')}</option>
                <option value="sold">{t('tools.livestockTracker.sold', 'Sold')}</option>
                <option value="deceased">{t('tools.livestockTracker.deceased', 'Deceased')}</option>
              </select>
            </div>

            {/* Add Animal Button */}
            {!showAnimalForm && (
              <button
                onClick={() => setShowAnimalForm(true)}
                className="w-full py-3 rounded-lg border-2 border-dashed border-green-500 text-green-500 flex items-center justify-center gap-2 hover:bg-green-500/10"
              >
                <Plus className="w-5 h-5" />
                {t('tools.livestockTracker.addAnimal', 'Add Animal')}
              </button>
            )}

            {/* Animal Form */}
            {showAnimalForm && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingAnimal ? t('tools.livestockTracker.editAnimal', 'Edit Animal') : t('tools.livestockTracker.addNewAnimal', 'Add New Animal')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.tagId', 'Tag/ID *')}</label>
                    <input
                      type="text"
                      value={animalForm.tagId}
                      onChange={(e) => setAnimalForm({ ...animalForm, tagId: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.livestockTracker.eGCtl001', 'e.g., CTL-001')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.name', 'Name')}</label>
                    <input
                      type="text"
                      value={animalForm.name}
                      onChange={(e) => setAnimalForm({ ...animalForm, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.livestockTracker.animalName', 'Animal name')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.species', 'Species *')}</label>
                    <select
                      value={animalForm.species}
                      onChange={(e) => setAnimalForm({ ...animalForm, species: e.target.value as Species })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {speciesOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.breed', 'Breed')}</label>
                    <input
                      type="text"
                      value={animalForm.breed}
                      onChange={(e) => setAnimalForm({ ...animalForm, breed: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.livestockTracker.breed2', 'Breed')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.birthDate', 'Birth Date')}</label>
                    <input
                      type="date"
                      value={animalForm.birthDate}
                      onChange={(e) => setAnimalForm({ ...animalForm, birthDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.gender', 'Gender')}</label>
                    <select
                      value={animalForm.gender}
                      onChange={(e) => setAnimalForm({ ...animalForm, gender: e.target.value as Gender })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="female">{t('tools.livestockTracker.female', 'Female')}</option>
                      <option value="male">{t('tools.livestockTracker.male', 'Male')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.weightLbs', 'Weight (lbs)')}</label>
                    <input
                      type="number"
                      value={animalForm.weight || ''}
                      onChange={(e) => setAnimalForm({ ...animalForm, weight: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.livestockTracker.currentWeight', 'Current weight')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.status', 'Status')}</label>
                    <select
                      value={animalForm.status}
                      onChange={(e) => setAnimalForm({ ...animalForm, status: e.target.value as AnimalStatus })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="active">{t('tools.livestockTracker.active3', 'Active')}</option>
                      <option value="breeding">{t('tools.livestockTracker.breeding2', 'Breeding')}</option>
                      <option value="quarantine">{t('tools.livestockTracker.quarantine2', 'Quarantine')}</option>
                      <option value="sold">{t('tools.livestockTracker.sold2', 'Sold')}</option>
                      <option value="deceased">{t('tools.livestockTracker.deceased2', 'Deceased')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.location', 'Location')}</label>
                    <input
                      type="text"
                      value={animalForm.location}
                      onChange={(e) => setAnimalForm({ ...animalForm, location: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.livestockTracker.eGPastureABarn', 'e.g., Pasture A, Barn 1')}
                      list="locations"
                    />
                    <datalist id="locations">
                      {uniqueLocations.map(loc => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.notes', 'Notes')}</label>
                    <textarea
                      value={animalForm.notes}
                      onChange={(e) => setAnimalForm({ ...animalForm, notes: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      rows={2}
                      placeholder={t('tools.livestockTracker.additionalNotes', 'Additional notes')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={resetAnimalForm}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.livestockTracker.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={editingAnimal ? handleUpdateAnimal : handleAddAnimal}
                    className="px-4 py-2 rounded-lg bg-green-500 text-white"
                  >
                    {editingAnimal ? t('tools.livestockTracker.update', 'Update') : t('tools.livestockTracker.add', 'Add')} Animal
                  </button>
                </div>
              </div>
            )}

            {/* Animal Cards */}
            <div className="grid gap-4">
              {filteredAnimals.map((animal) => (
                <div key={animal.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{speciesIcons[animal.species]}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {animal.name || animal.tagId}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[animal.status].bg} ${statusColors[animal.status].text}`}>
                              {animal.status}
                            </span>
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex flex-wrap gap-x-4 gap-y-1 mt-1`}>
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {animal.tagId}
                            </span>
                            <span>{animal.breed || speciesOptions.find(s => s.value === animal.species)?.label}</span>
                            <span>{animal.gender === 'male' ? t('tools.livestockTracker.male3', 'Male') : t('tools.livestockTracker.female3', 'Female')}</span>
                            {animal.birthDate && (
                              <span>{calculateAge(animal.birthDate)} old</span>
                            )}
                            {animal.weight > 0 && (
                              <span className="flex items-center gap-1">
                                <Scale className="w-3 h-3" />
                                {animal.weight} lbs
                              </span>
                            )}
                            {animal.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {animal.location}
                              </span>
                            )}
                          </div>
                          {animal.notes && (
                            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{animal.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setWeightForm({ ...weightForm, animalId: animal.id });
                              setShowWeightForm(true);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                            title={t('tools.livestockTracker.recordWeight2', 'Record weight')}
                          >
                            <Scale className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditAnimal(animal)}
                            className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnimal(animal.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAnimals.length === 0 && !showAnimalForm && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Beef className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.livestockTracker.noAnimalsFoundAddYour', 'No animals found. Add your first animal to get started!')}</p>
              </div>
            )}

            {/* Weight Recording Modal */}
            {showWeightForm && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.recordWeight', 'Record Weight')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.animal', 'Animal')}</label>
                    <select
                      value={weightForm.animalId}
                      onChange={(e) => setWeightForm({ ...weightForm, animalId: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">{t('tools.livestockTracker.selectAnimal', 'Select Animal')}</option>
                      {animals.map(a => (
                        <option key={a.id} value={a.id}>{a.name || a.tagId}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.weightLbs2', 'Weight (lbs)')}</label>
                    <input
                      type="number"
                      value={weightForm.weight || ''}
                      onChange={(e) => setWeightForm({ ...weightForm, weight: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.date', 'Date')}</label>
                    <input
                      type="date"
                      value={weightForm.date}
                      onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowWeightForm(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.livestockTracker.cancel2', 'Cancel')}
                  </button>
                  <button onClick={handleAddWeightRecord} className="px-4 py-2 rounded-lg bg-green-500 text-white">
                    {t('tools.livestockTracker.saveWeight', 'Save Weight')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            {animals.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('tools.livestockTracker.addAnimalsFirstToTrack', 'Add animals first to track health records')}</p>
              </div>
            ) : (
              <>
                {!showHealthForm && (
                  <button
                    onClick={() => setShowHealthForm(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-green-500 text-green-500 flex items-center justify-center gap-2 hover:bg-green-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.livestockTracker.addHealthRecord2', 'Add Health Record')}
                  </button>
                )}

                {showHealthForm && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.addHealthRecord', 'Add Health Record')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.animal2', 'Animal *')}</label>
                        <select
                          value={healthForm.animalId}
                          onChange={(e) => setHealthForm({ ...healthForm, animalId: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">{t('tools.livestockTracker.selectAnimal2', 'Select Animal')}</option>
                          {animals.map(a => (
                            <option key={a.id} value={a.id}>{a.name || a.tagId}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.type', 'Type *')}</label>
                        <select
                          value={healthForm.type}
                          onChange={(e) => setHealthForm({ ...healthForm, type: e.target.value as HealthRecord['type'] })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="vaccination">{t('tools.livestockTracker.vaccination', 'Vaccination')}</option>
                          <option value="treatment">{t('tools.livestockTracker.treatment', 'Treatment')}</option>
                          <option value="vet_visit">{t('tools.livestockTracker.vetVisit', 'Vet Visit')}</option>
                          <option value="deworming">{t('tools.livestockTracker.deworming', 'Deworming')}</option>
                          <option value="injury">{t('tools.livestockTracker.injury', 'Injury')}</option>
                          <option value="illness">{t('tools.livestockTracker.illness', 'Illness')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.date2', 'Date *')}</label>
                        <input
                          type="date"
                          value={healthForm.date}
                          onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.description', 'Description *')}</label>
                        <input
                          type="text"
                          value={healthForm.description}
                          onChange={(e) => setHealthForm({ ...healthForm, description: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.livestockTracker.eGAnnualVaccinationHoof', 'e.g., Annual vaccination, Hoof treatment')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.medication', 'Medication')}</label>
                        <input
                          type="text"
                          value={healthForm.medication}
                          onChange={(e) => setHealthForm({ ...healthForm, medication: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.livestockTracker.medicationName', 'Medication name')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.dosage', 'Dosage')}</label>
                        <input
                          type="text"
                          value={healthForm.dosage}
                          onChange={(e) => setHealthForm({ ...healthForm, dosage: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.livestockTracker.eG2ml', 'e.g., 2ml')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.administeredBy', 'Administered By')}</label>
                        <input
                          type="text"
                          value={healthForm.administeredBy}
                          onChange={(e) => setHealthForm({ ...healthForm, administeredBy: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.livestockTracker.eGDrSmith', 'e.g., Dr. Smith')}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.nextDue', 'Next Due')}</label>
                        <input
                          type="date"
                          value={healthForm.nextDue}
                          onChange={(e) => setHealthForm({ ...healthForm, nextDue: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.cost', 'Cost ($)')}</label>
                        <input
                          type="number"
                          value={healthForm.cost || ''}
                          onChange={(e) => setHealthForm({ ...healthForm, cost: parseFloat(e.target.value) || undefined })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder={t('tools.livestockTracker.cost3', 'Cost')}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowHealthForm(false)}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.livestockTracker.cancel3', 'Cancel')}
                      </button>
                      <button onClick={handleAddHealthRecord} className="px-4 py-2 rounded-lg bg-green-500 text-white">
                        {t('tools.livestockTracker.addRecord', 'Add Record')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Health Records List */}
                <div className="space-y-3">
                  {healthRecords.map((record) => {
                    const animal = animals.find(a => a.id === record.animalId);
                    const daysUntilNext = record.nextDue ? getDaysUntil(record.nextDue) : null;
                    return (
                      <div key={record.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Syringe className="w-5 h-5 text-green-500" />
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.description}</h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {animal?.name || animal?.tagId || 'Unknown'} | {record.type.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteHealthRecord(record.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className={`mt-2 text-sm flex flex-wrap gap-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span>Date: {formatDate(record.date)}</span>
                          {record.medication && <span>Medication: {record.medication}</span>}
                          {record.dosage && <span>Dosage: {record.dosage}</span>}
                          {record.cost && <span>Cost: ${record.cost}</span>}
                        </div>
                        {record.nextDue && (
                          <div className={`mt-2 text-sm ${daysUntilNext !== null && daysUntilNext <= 7 ? 'text-amber-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Next due: {formatDate(record.nextDue)} {daysUntilNext !== null && daysUntilNext >= 0 && `(${daysUntilNext} days)`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {healthRecords.length === 0 && !showHealthForm && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.livestockTracker.noHealthRecordsYet', 'No health records yet')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Breeding Tab */}
        {activeTab === 'breeding' && (
          <div className="space-y-4">
            {animals.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('tools.livestockTracker.addAnimalsFirstToTrack2', 'Add animals first to track breeding records')}</p>
              </div>
            ) : (
              <>
                {!showBreedingForm && (
                  <button
                    onClick={() => setShowBreedingForm(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-green-500 text-green-500 flex items-center justify-center gap-2 hover:bg-green-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.livestockTracker.addBreedingRecord2', 'Add Breeding Record')}
                  </button>
                )}

                {showBreedingForm && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.addBreedingRecord', 'Add Breeding Record')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.female2', 'Female *')}</label>
                        <select
                          value={breedingForm.femaleId}
                          onChange={(e) => setBreedingForm({ ...breedingForm, femaleId: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">{t('tools.livestockTracker.selectFemale', 'Select Female')}</option>
                          {animals.filter(a => a.gender === 'female').map(a => (
                            <option key={a.id} value={a.id}>{a.name || a.tagId}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.male2', 'Male *')}</label>
                        <select
                          value={breedingForm.maleId}
                          onChange={(e) => setBreedingForm({ ...breedingForm, maleId: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">{t('tools.livestockTracker.selectMale', 'Select Male')}</option>
                          {animals.filter(a => a.gender === 'male').map(a => (
                            <option key={a.id} value={a.id}>{a.name || a.tagId}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.breedingDate', 'Breeding Date *')}</label>
                        <input
                          type="date"
                          value={breedingForm.breedingDate}
                          onChange={(e) => setBreedingForm({ ...breedingForm, breedingDate: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.expectedDueDate', 'Expected Due Date')}</label>
                        <input
                          type="date"
                          value={breedingForm.expectedDueDate}
                          onChange={(e) => setBreedingForm({ ...breedingForm, expectedDueDate: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.notes2', 'Notes')}</label>
                        <textarea
                          value={breedingForm.notes}
                          onChange={(e) => setBreedingForm({ ...breedingForm, notes: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          rows={2}
                          placeholder={t('tools.livestockTracker.additionalNotes2', 'Additional notes')}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowBreedingForm(false)}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {t('tools.livestockTracker.cancel4', 'Cancel')}
                      </button>
                      <button onClick={handleAddBreedingRecord} className="px-4 py-2 rounded-lg bg-green-500 text-white">
                        {t('tools.livestockTracker.addRecord2', 'Add Record')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Breeding Records List */}
                <div className="space-y-3">
                  {breedingRecords.map((record) => {
                    const female = animals.find(a => a.id === record.femaleId);
                    const male = animals.find(a => a.id === record.maleId);
                    const daysUntilDue = record.expectedDueDate ? getDaysUntil(record.expectedDueDate) : null;
                    return (
                      <div key={record.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Baby className="w-5 h-5 text-purple-500" />
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {female?.name || female?.tagId || 'Unknown'} x {male?.name || male?.tagId || 'Unknown'}
                              </h4>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Bred: {formatDate(record.breedingDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={record.status}
                              onChange={(e) => handleUpdateBreedingStatus(record.id, e.target.value as BreedingRecord['status'])}
                              className={`text-sm px-2 py-1 rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            >
                              <option value="bred">{t('tools.livestockTracker.bred', 'Bred')}</option>
                              <option value="confirmed">{t('tools.livestockTracker.confirmed', 'Confirmed')}</option>
                              <option value="delivered">{t('tools.livestockTracker.delivered', 'Delivered')}</option>
                              <option value="failed">{t('tools.livestockTracker.failed', 'Failed')}</option>
                            </select>
                            <button
                              onClick={() => handleDeleteBreedingRecord(record.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        {record.expectedDueDate && (
                          <div className={`mt-2 text-sm ${daysUntilDue !== null && daysUntilDue <= 14 ? 'text-amber-500 font-medium' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Expected: {formatDate(record.expectedDueDate)}
                            {daysUntilDue !== null && daysUntilDue >= 0 && ` (${daysUntilDue} days)`}
                          </div>
                        )}
                        {record.notes && (
                          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{record.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {breedingRecords.length === 0 && !showBreedingForm && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Baby className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('tools.livestockTracker.noBreedingRecordsYet', 'No breeding records yet')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {!showFeedForm && (
              <button
                onClick={() => setShowFeedForm(true)}
                className="w-full py-3 rounded-lg border-2 border-dashed border-green-500 text-green-500 flex items-center justify-center gap-2 hover:bg-green-500/10"
              >
                <Plus className="w-5 h-5" />
                {t('tools.livestockTracker.addFeedRecord2', 'Add Feed Record')}
              </button>
            )}

            {showFeedForm && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-4`}>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.addFeedRecord', 'Add Feed Record')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.feedType', 'Feed Type *')}</label>
                    <input
                      type="text"
                      value={feedForm.feedType}
                      onChange={(e) => setFeedForm({ ...feedForm, feedType: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.livestockTracker.eGHayGrainMix', 'e.g., Hay, Grain Mix')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.quantity', 'Quantity *')}</label>
                    <input
                      type="number"
                      value={feedForm.quantity || ''}
                      onChange={(e) => setFeedForm({ ...feedForm, quantity: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.livestockTracker.amount', 'Amount')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.unit', 'Unit')}</label>
                    <select
                      value={feedForm.unit}
                      onChange={(e) => setFeedForm({ ...feedForm, unit: e.target.value as FeedRecord['unit'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="lbs">{t('tools.livestockTracker.poundsLbs', 'Pounds (lbs)')}</option>
                      <option value="kg">{t('tools.livestockTracker.kilogramsKg', 'Kilograms (kg)')}</option>
                      <option value="bags">{t('tools.livestockTracker.bags', 'Bags')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.date3', 'Date *')}</label>
                    <input
                      type="date"
                      value={feedForm.date}
                      onChange={(e) => setFeedForm({ ...feedForm, date: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.cost2', 'Cost ($)')}</label>
                    <input
                      type="number"
                      value={feedForm.cost || ''}
                      onChange={(e) => setFeedForm({ ...feedForm, cost: parseFloat(e.target.value) || undefined })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.livestockTracker.cost4', 'Cost')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.livestockTracker.notes3', 'Notes')}</label>
                    <input
                      type="text"
                      value={feedForm.notes}
                      onChange={(e) => setFeedForm({ ...feedForm, notes: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder={t('tools.livestockTracker.additionalNotes3', 'Additional notes')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowFeedForm(false)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {t('tools.livestockTracker.cancel5', 'Cancel')}
                  </button>
                  <button onClick={handleAddFeedRecord} className="px-4 py-2 rounded-lg bg-green-500 text-white">
                    {t('tools.livestockTracker.addRecord3', 'Add Record')}
                  </button>
                </div>
              </div>
            )}

            {/* Feed Records List */}
            <div className="space-y-3">
              {feedRecords.map((record) => (
                <div key={record.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Wheat className="w-5 h-5 text-amber-500" />
                      <div>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.feedType}</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {record.quantity} {record.unit} | {formatDate(record.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.cost && (
                        <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          ${record.cost.toFixed(2)}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteFeedRecord(record.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {record.notes && (
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{record.notes}</p>
                  )}
                </div>
              ))}
            </div>

            {feedRecords.length === 0 && !showFeedForm && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Wheat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.livestockTracker.noFeedRecordsYet', 'No feed records yet')}</p>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Species Distribution */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.animalsBySpecies', 'Animals by Species')}</h4>
              <div className="space-y-2">
                {Object.entries(stats.bySpecies).map(([species, count]) => (
                  <div key={species} className="flex items-center gap-3">
                    <span className="text-2xl">{speciesIcons[species as Species]}</span>
                    <span className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {speciesOptions.find(s => s.value === species)?.label || species}
                    </span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(count / stats.totalAnimals) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Distribution */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.animalsByStatus', 'Animals by Status')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className={`p-3 rounded-lg ${statusColors[status as AnimalStatus].bg}`}>
                    <div className={`text-2xl font-bold ${statusColors[status as AnimalStatus].text}`}>{count}</div>
                    <div className={`text-sm capitalize ${statusColors[status as AnimalStatus].text}`}>{status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weight History */}
            {weightRecords.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.recentWeightRecords', 'Recent Weight Records')}</h4>
                <div className="space-y-2">
                  {weightRecords.slice(0, 10).map((record) => {
                    const animal = animals.find(a => a.id === record.animalId);
                    return (
                      <div key={record.id} className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} last:border-0`}>
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-blue-500" />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {animal?.name || animal?.tagId || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {record.weight} lbs
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDate(record.date)}
                          </span>
                          <button
                            onClick={() => handleDeleteWeightRecord(record.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cost Summary */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.livestockTracker.costSummary', 'Cost Summary')}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500">${stats.totalFeedCost.toFixed(2)}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockTracker.totalFeedCost', 'Total Feed Cost')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">${stats.totalHealthCost.toFixed(2)}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockTracker.totalHealthCost', 'Total Health Cost')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">${(stats.totalFeedCost + stats.totalHealthCost).toFixed(2)}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.livestockTracker.totalExpenses', 'Total Expenses')}</div>
                </div>
              </div>
            </div>

            {animals.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('tools.livestockTracker.addAnimalsToSeeReports', 'Add animals to see reports')}</p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.livestockTracker.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.livestockTracker.useUniqueTagIdsFor', 'Use unique tag IDs for easy identification')}</li>
                <li>{t('tools.livestockTracker.recordWeightsRegularlyToTrack', 'Record weights regularly to track growth')}</li>
                <li>{t('tools.livestockTracker.setVaccinationRemindersToStay', 'Set vaccination reminders to stay on schedule')}</li>
                <li>{t('tools.livestockTracker.keepBreedingRecordsForLineage', 'Keep breeding records for lineage tracking')}</li>
                <li>{t('tools.livestockTracker.trackFeedCostsToManage', 'Track feed costs to manage expenses')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivestockTrackerTool;
