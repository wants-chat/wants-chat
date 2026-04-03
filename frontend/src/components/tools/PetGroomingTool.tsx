'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dog,
  Cat,
  Scissors,
  Bath,
  Heart,
  Calendar,
  Clock,
  DollarSign,
  Camera,
  FileText,
  MessageSquare,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Star,
  Phone,
  Mail,
  User,
  Syringe,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface PetGroomingToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Pet {
  id: string;
  name: string;
  breed: string;
  species: 'dog' | 'cat' | 'other';
  size: 'small' | 'medium' | 'large' | 'giant';
  age: number;
  ageUnit: 'months' | 'years';
  weight: number;
  weightUnit: 'lbs' | 'kg';
  coatType: string;
  color: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  temperament: string;
  healthIssues: string;
  specialNotes: string;
  vaccinations: Vaccination[];
  groomingHistory: GroomingSession[];
  communicationNotes: CommunicationNote[];
  beforePhotos: string[];
  afterPhotos: string[];
  createdAt: string;
}

interface Vaccination {
  id: string;
  name: string;
  date: string;
  expiryDate: string;
  veterinarian: string;
  notes: string;
}

interface GroomingSession {
  id: string;
  date: string;
  services: string[];
  groomer: string;
  duration: number;
  price: number;
  notes: string;
  beforePhoto?: string;
  afterPhoto?: string;
}

interface CommunicationNote {
  id: string;
  date: string;
  type: 'call' | 'email' | 'text' | 'in-person';
  note: string;
}

interface Appointment {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  date: string;
  time: string;
  services: string[];
  estimatedDuration: number;
  estimatedPrice: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  basePriceSmall: number;
  basePriceMedium: number;
  basePriceLarge: number;
  basePriceGiant: number;
  baseTimeSmall: number;
  baseTimeMedium: number;
  baseTimeLarge: number;
  baseTimeGiant: number;
  active: boolean;
}

interface BreedRequirement {
  breed: string;
  species: 'dog' | 'cat';
  coatType: string;
  groomingFrequency: string;
  specialRequirements: string[];
  recommendedServices: string[];
  timeMultiplier: number;
  priceMultiplier: number;
}

// Default services
const defaultServices: Service[] = [
  {
    id: '1',
    name: 'Full Bath',
    description: 'Complete bath with shampoo, conditioner, and blow dry',
    basePriceSmall: 25,
    basePriceMedium: 35,
    basePriceLarge: 45,
    basePriceGiant: 60,
    baseTimeSmall: 30,
    baseTimeMedium: 45,
    baseTimeLarge: 60,
    baseTimeGiant: 75,
    active: true,
  },
  {
    id: '2',
    name: 'Haircut/Trim',
    description: 'Breed-specific cut or custom trim',
    basePriceSmall: 35,
    basePriceMedium: 50,
    basePriceLarge: 65,
    basePriceGiant: 85,
    baseTimeSmall: 45,
    baseTimeMedium: 60,
    baseTimeLarge: 90,
    baseTimeGiant: 120,
    active: true,
  },
  {
    id: '3',
    name: 'Nail Trim',
    description: 'Nail clipping and filing',
    basePriceSmall: 12,
    basePriceMedium: 15,
    basePriceLarge: 18,
    basePriceGiant: 22,
    baseTimeSmall: 10,
    baseTimeMedium: 15,
    baseTimeLarge: 20,
    baseTimeGiant: 25,
    active: true,
  },
  {
    id: '4',
    name: 'Teeth Cleaning',
    description: 'Dental brushing and freshening',
    basePriceSmall: 10,
    basePriceMedium: 12,
    basePriceLarge: 15,
    basePriceGiant: 18,
    baseTimeSmall: 10,
    baseTimeMedium: 12,
    baseTimeLarge: 15,
    baseTimeGiant: 18,
    active: true,
  },
  {
    id: '5',
    name: 'Ear Cleaning',
    description: 'Ear cleaning and hair removal',
    basePriceSmall: 10,
    basePriceMedium: 12,
    basePriceLarge: 15,
    basePriceGiant: 18,
    baseTimeSmall: 10,
    baseTimeMedium: 12,
    baseTimeLarge: 15,
    baseTimeGiant: 18,
    active: true,
  },
  {
    id: '6',
    name: 'De-shedding Treatment',
    description: 'Specialized treatment to reduce shedding',
    basePriceSmall: 30,
    basePriceMedium: 45,
    basePriceLarge: 60,
    basePriceGiant: 80,
    baseTimeSmall: 45,
    baseTimeMedium: 60,
    baseTimeLarge: 90,
    baseTimeGiant: 120,
    active: true,
  },
  {
    id: '7',
    name: 'Flea Treatment',
    description: 'Flea bath and prevention treatment',
    basePriceSmall: 25,
    basePriceMedium: 35,
    basePriceLarge: 45,
    basePriceGiant: 55,
    baseTimeSmall: 30,
    baseTimeMedium: 40,
    baseTimeLarge: 50,
    baseTimeGiant: 60,
    active: true,
  },
  {
    id: '8',
    name: 'Full Grooming Package',
    description: 'Bath, haircut, nail trim, ear cleaning, and teeth brushing',
    basePriceSmall: 65,
    basePriceMedium: 85,
    basePriceLarge: 110,
    basePriceGiant: 145,
    baseTimeSmall: 90,
    baseTimeMedium: 120,
    baseTimeLarge: 150,
    baseTimeGiant: 180,
    active: true,
  },
];

// Breed-specific requirements
const breedRequirements: BreedRequirement[] = [
  {
    breed: 'Poodle',
    species: 'dog',
    coatType: 'Curly',
    groomingFrequency: 'Every 4-6 weeks',
    specialRequirements: ['Regular professional grooming required', 'Prone to matting', 'Needs regular ear cleaning'],
    recommendedServices: ['Full Grooming Package', 'Ear Cleaning'],
    timeMultiplier: 1.3,
    priceMultiplier: 1.2,
  },
  {
    breed: 'Golden Retriever',
    species: 'dog',
    coatType: 'Double coat',
    groomingFrequency: 'Every 6-8 weeks',
    specialRequirements: ['Heavy shedding', 'Needs regular brushing', 'Prone to ear infections'],
    recommendedServices: ['De-shedding Treatment', 'Ear Cleaning', 'Full Bath'],
    timeMultiplier: 1.2,
    priceMultiplier: 1.1,
  },
  {
    breed: 'Shih Tzu',
    species: 'dog',
    coatType: 'Long silky',
    groomingFrequency: 'Every 4-6 weeks',
    specialRequirements: ['High maintenance coat', 'Prone to eye staining', 'Needs daily brushing'],
    recommendedServices: ['Full Grooming Package', 'Teeth Cleaning'],
    timeMultiplier: 1.4,
    priceMultiplier: 1.3,
  },
  {
    breed: 'Labrador Retriever',
    species: 'dog',
    coatType: 'Short double coat',
    groomingFrequency: 'Every 8-12 weeks',
    specialRequirements: ['Moderate shedding', 'Water-resistant coat', 'Regular nail trims needed'],
    recommendedServices: ['Full Bath', 'De-shedding Treatment', 'Nail Trim'],
    timeMultiplier: 1.0,
    priceMultiplier: 1.0,
  },
  {
    breed: 'Yorkshire Terrier',
    species: 'dog',
    coatType: 'Silky',
    groomingFrequency: 'Every 4-6 weeks',
    specialRequirements: ['Prone to tangles', 'Needs regular face cleaning', 'Sensitive skin possible'],
    recommendedServices: ['Full Grooming Package', 'Teeth Cleaning'],
    timeMultiplier: 1.2,
    priceMultiplier: 1.15,
  },
  {
    breed: 'Persian',
    species: 'cat',
    coatType: 'Long',
    groomingFrequency: 'Every 4-6 weeks',
    specialRequirements: ['Daily brushing required', 'Prone to matting', 'Eye cleaning needed'],
    recommendedServices: ['Full Bath', 'Haircut/Trim', 'Ear Cleaning'],
    timeMultiplier: 1.5,
    priceMultiplier: 1.4,
  },
  {
    breed: 'Maine Coon',
    species: 'cat',
    coatType: 'Long semi-waterproof',
    groomingFrequency: 'Every 6-8 weeks',
    specialRequirements: ['Large size', 'Thick undercoat', 'Ear tufts need attention'],
    recommendedServices: ['Full Bath', 'De-shedding Treatment', 'Nail Trim'],
    timeMultiplier: 1.3,
    priceMultiplier: 1.25,
  },
  {
    breed: 'Siamese',
    species: 'cat',
    coatType: 'Short',
    groomingFrequency: 'Every 8-12 weeks',
    specialRequirements: ['Low maintenance coat', 'Regular nail trims', 'Sensitive to stress'],
    recommendedServices: ['Full Bath', 'Nail Trim'],
    timeMultiplier: 0.9,
    priceMultiplier: 0.9,
  },
];

// Column configurations for export
const petColumns: ColumnConfig[] = [
  { key: 'id', header: 'Pet ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'breed', header: 'Breed', type: 'string' },
  { key: 'species', header: 'Species', type: 'string' },
  { key: 'size', header: 'Size', type: 'string' },
  { key: 'age', header: 'Age', type: 'number' },
  { key: 'weight', header: 'Weight', type: 'number' },
  { key: 'coatType', header: 'Coat Type', type: 'string' },
  { key: 'ownerName', header: 'Owner Name', type: 'string' },
  { key: 'ownerPhone', header: 'Owner Phone', type: 'string' },
  { key: 'ownerEmail', header: 'Owner Email', type: 'string' },
  { key: 'temperament', header: 'Temperament', type: 'string' },
  { key: 'healthIssues', header: 'Health Issues', type: 'string' },
  { key: 'specialNotes', header: 'Special Notes', type: 'string' },
];

const appointmentColumns: ColumnConfig[] = [
  { key: 'id', header: 'Appointment ID', type: 'string' },
  { key: 'petId', header: 'Pet ID', type: 'string' },
  { key: 'petName', header: 'Pet Name', type: 'string' },
  { key: 'ownerName', header: 'Owner Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'time', header: 'Time', type: 'string' },
  { key: 'services', header: 'Services', type: 'string', format: (v) => Array.isArray(v) ? v.join(', ') : v },
  { key: 'estimatedDuration', header: 'Duration (min)', type: 'number' },
  { key: 'estimatedPrice', header: 'Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

export const PetGroomingTool: React.FC<PetGroomingToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Initialize hooks for pets and appointments with backend sync
  const petsData = useToolData<Pet>(
    'pet-grooming-pets',
    [],
    petColumns,
    { autoSave: true }
  );

  const appointmentsData = useToolData<Appointment>(
    'pet-grooming-appointments',
    [],
    appointmentColumns,
    { autoSave: true }
  );

  // Use data from hooks
  const pets = petsData.data;
  const appointments = appointmentsData.data;

  // Services are static, no need for backend sync
  const [services] = useState<Service[]>(defaultServices);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      // Add prefill logic here based on available fields
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const [activeTab, setActiveTab] = useState<'pets' | 'appointments' | 'services' | 'breeds' | 'revenue'>('pets');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetForm, setShowPetForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Pet form state
  const [petForm, setPetForm] = useState<Partial<Pet>>({
    species: 'dog',
    size: 'medium',
    ageUnit: 'years',
    weightUnit: 'lbs',
    vaccinations: [],
    groomingHistory: [],
    communicationNotes: [],
    beforePhotos: [],
    afterPhotos: [],
  });

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState<Partial<Appointment>>({
    services: [],
    status: 'scheduled',
  });

  // Vaccination form state
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [vaccinationForm, setVaccinationForm] = useState<Partial<Vaccination>>({});

  // Grooming session form state
  const [showGroomingForm, setShowGroomingForm] = useState(false);
  const [groomingForm, setGroomingForm] = useState<Partial<GroomingSession>>({
    services: [],
  });

  // Communication note form state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState<Partial<CommunicationNote>>({
    type: 'call',
  });

  // Filtered pets based on search
  const filteredPets = useMemo(() => {
    if (!searchTerm) return pets;
    const term = searchTerm.toLowerCase();
    return pets.filter(
      (pet: Pet) =>
        pet.name.toLowerCase().includes(term) ||
        pet.breed.toLowerCase().includes(term) ||
        pet.ownerName.toLowerCase().includes(term)
    );
  }, [pets, searchTerm]);

  // Calculate revenue statistics
  const revenueStats = useMemo(() => {
    const allSessions = pets.flatMap((pet: Pet) => pet.groomingHistory || []);
    const totalRevenue = allSessions.reduce((sum: number, session: GroomingSession) => sum + (session.price || 0), 0);

    const revenueByPet: Record<string, number> = {};
    const revenueByClient: Record<string, number> = {};

    pets.forEach((pet: Pet) => {
      const petRevenue = (pet.groomingHistory || []).reduce((sum: number, s: GroomingSession) => sum + (s.price || 0), 0);
      revenueByPet[pet.name] = petRevenue;
      revenueByClient[pet.ownerName] = (revenueByClient[pet.ownerName] || 0) + petRevenue;
    });

    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthRevenue = allSessions
      .filter((s: GroomingSession) => s.date?.startsWith(thisMonth))
      .reduce((sum: number, s: GroomingSession) => sum + (s.price || 0), 0);

    return {
      totalRevenue,
      thisMonthRevenue,
      revenueByPet,
      revenueByClient,
      totalSessions: allSessions.length,
    };
  }, [pets]);

  // Get price and time for services based on pet size
  const getServicePriceAndTime = (serviceId: string, size: string, breed?: string) => {
    const service = services.find((s: Service) => s.id === serviceId);
    if (!service) return { price: 0, time: 0 };

    let price = 0;
    let time = 0;

    switch (size) {
      case 'small':
        price = service.basePriceSmall;
        time = service.baseTimeSmall;
        break;
      case 'medium':
        price = service.basePriceMedium;
        time = service.baseTimeMedium;
        break;
      case 'large':
        price = service.basePriceLarge;
        time = service.baseTimeLarge;
        break;
      case 'giant':
        price = service.basePriceGiant;
        time = service.baseTimeGiant;
        break;
    }

    // Apply breed multipliers if available
    if (breed) {
      const breedReq = breedRequirements.find((b) => b.breed.toLowerCase() === breed.toLowerCase());
      if (breedReq) {
        price *= breedReq.priceMultiplier;
        time *= breedReq.timeMultiplier;
      }
    }

    return { price: Math.round(price * 100) / 100, time: Math.round(time) };
  };

  // Calculate totals for appointment
  const calculateAppointmentTotals = (serviceIds: string[], size: string, breed?: string) => {
    let totalPrice = 0;
    let totalTime = 0;

    serviceIds.forEach((serviceId) => {
      const { price, time } = getServicePriceAndTime(serviceId, size, breed);
      totalPrice += price;
      totalTime += time;
    });

    return { totalPrice, totalTime };
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Pet CRUD operations
  const savePet = () => {
    if (!petForm.name || !petForm.breed || !petForm.ownerName) {
      setValidationMessage('Please fill in required fields: Name, Breed, and Owner Name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newPet: Pet = {
      id: editingPet?.id || generateId(),
      name: petForm.name || '',
      breed: petForm.breed || '',
      species: petForm.species || 'dog',
      size: petForm.size || 'medium',
      age: petForm.age || 0,
      ageUnit: petForm.ageUnit || 'years',
      weight: petForm.weight || 0,
      weightUnit: petForm.weightUnit || 'lbs',
      coatType: petForm.coatType || '',
      color: petForm.color || '',
      ownerName: petForm.ownerName || '',
      ownerPhone: petForm.ownerPhone || '',
      ownerEmail: petForm.ownerEmail || '',
      temperament: petForm.temperament || '',
      healthIssues: petForm.healthIssues || '',
      specialNotes: petForm.specialNotes || '',
      vaccinations: editingPet?.vaccinations || [],
      groomingHistory: editingPet?.groomingHistory || [],
      communicationNotes: editingPet?.communicationNotes || [],
      beforePhotos: editingPet?.beforePhotos || [],
      afterPhotos: editingPet?.afterPhotos || [],
      createdAt: editingPet?.createdAt || new Date().toISOString(),
    };

    if (editingPet) {
      petsData.updateItem(editingPet.id, newPet);
    } else {
      petsData.addItem(newPet);
    }

    setShowPetForm(false);
    setEditingPet(null);
    setPetForm({
      species: 'dog',
      size: 'medium',
      ageUnit: 'years',
      weightUnit: 'lbs',
      vaccinations: [],
      groomingHistory: [],
      communicationNotes: [],
      beforePhotos: [],
      afterPhotos: [],
    });
  };

  const deletePet = async (petId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this pet and all its records?');
    if (confirmed) {
      petsData.deleteItem(petId);
      // Also delete associated appointments
      appointments.forEach((a: Appointment) => {
        if (a.petId === petId) {
          appointmentsData.deleteItem(a.id);
        }
      });
      if (selectedPet?.id === petId) setSelectedPet(null);
    }
  };

  // Appointment CRUD operations
  const saveAppointment = () => {
    if (!appointmentForm.petId || !appointmentForm.date || !appointmentForm.time || !appointmentForm.services?.length) {
      setValidationMessage('Please fill in required fields: Pet, Date, Time, and at least one Service');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const pet = pets.find((p: Pet) => p.id === appointmentForm.petId);
    if (!pet) return;

    const { totalPrice, totalTime } = calculateAppointmentTotals(
      appointmentForm.services || [],
      pet.size,
      pet.breed
    );

    const newAppointment: Appointment = {
      id: editingAppointment?.id || generateId(),
      petId: appointmentForm.petId,
      petName: pet.name,
      ownerName: pet.ownerName,
      date: appointmentForm.date || '',
      time: appointmentForm.time || '',
      services: appointmentForm.services || [],
      estimatedDuration: totalTime,
      estimatedPrice: totalPrice,
      status: appointmentForm.status || 'scheduled',
      notes: appointmentForm.notes || '',
    };

    if (editingAppointment) {
      appointmentsData.updateItem(editingAppointment.id, newAppointment);
    } else {
      appointmentsData.addItem(newAppointment);
    }

    setShowAppointmentForm(false);
    setEditingAppointment(null);
    setAppointmentForm({ services: [], status: 'scheduled' });
  };

  const deleteAppointment = async (appointmentId: string) => {
    const confirmed = await confirm('Are you sure you want to delete this appointment?');
    if (confirmed) {
      appointmentsData.deleteItem(appointmentId);
    }
  };

  const completeAppointment = (appointment: Appointment) => {
    // Update appointment status
    appointmentsData.updateItem(appointment.id, { status: 'completed' as const });

    // Add grooming session to pet history
    const pet = pets.find((p: Pet) => p.id === appointment.petId);
    if (pet) {
      const newSession: GroomingSession = {
        id: generateId(),
        date: appointment.date,
        services: appointment.services,
        groomer: '',
        duration: appointment.estimatedDuration,
        price: appointment.estimatedPrice,
        notes: appointment.notes,
      };

      petsData.updateItem(pet.id, {
        groomingHistory: [...(pet.groomingHistory || []), newSession]
      });
    }
  };

  // Add vaccination to pet
  const addVaccination = () => {
    if (!selectedPet || !vaccinationForm.name || !vaccinationForm.date) {
      setValidationMessage('Please fill in vaccination name and date');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newVaccination: Vaccination = {
      id: generateId(),
      name: vaccinationForm.name,
      date: vaccinationForm.date,
      expiryDate: vaccinationForm.expiryDate || '',
      veterinarian: vaccinationForm.veterinarian || '',
      notes: vaccinationForm.notes || '',
    };

    const updatedPet = {
      ...selectedPet,
      vaccinations: [...(selectedPet.vaccinations || []), newVaccination]
    };

    petsData.updateItem(selectedPet.id, updatedPet);
    setSelectedPet(updatedPet);
    setShowVaccinationForm(false);
    setVaccinationForm({});
  };

  // Add grooming session to pet
  const addGroomingSession = () => {
    if (!selectedPet || !groomingForm.date || !groomingForm.services?.length) {
      setValidationMessage('Please fill in date and select at least one service');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newSession: GroomingSession = {
      id: generateId(),
      date: groomingForm.date,
      services: groomingForm.services,
      groomer: groomingForm.groomer || '',
      duration: groomingForm.duration || 0,
      price: groomingForm.price || 0,
      notes: groomingForm.notes || '',
      beforePhoto: groomingForm.beforePhoto,
      afterPhoto: groomingForm.afterPhoto,
    };

    const updatedPet = {
      ...selectedPet,
      groomingHistory: [...(selectedPet.groomingHistory || []), newSession]
    };

    petsData.updateItem(selectedPet.id, updatedPet);
    setSelectedPet(updatedPet);
    setShowGroomingForm(false);
    setGroomingForm({ services: [] });
  };

  // Add communication note to pet
  const addCommunicationNote = () => {
    if (!selectedPet || !noteForm.note) {
      setValidationMessage('Please enter a note');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newNote: CommunicationNote = {
      id: generateId(),
      date: new Date().toISOString(),
      type: noteForm.type || 'call',
      note: noteForm.note,
    };

    const updatedPet = {
      ...selectedPet,
      communicationNotes: [...(selectedPet.communicationNotes || []), newNote]
    };

    petsData.updateItem(selectedPet.id, updatedPet);
    setSelectedPet(updatedPet);
    setShowNoteForm(false);
    setNoteForm({ type: 'call' });
  };

  // Input styling based on theme
  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const selectClass = `w-full px-4 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]`;

  const buttonPrimary =
    'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white rounded-lg transition-all font-medium shadow-lg shadow-[#0D9488]/20';

  const buttonSecondary = `px-4 py-2 rounded-lg transition-colors font-medium ${
    theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  }`;

  const cardClass = `rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardClass} p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.petGrooming.petGroomingManager', 'Pet Grooming Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.petGrooming.managePetsAppointmentsServicesAnd', 'Manage pets, appointments, services, and track revenue')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="pet-grooming" toolName="Pet Grooming" />

              <SyncStatus
                isSynced={petsData.isSynced && appointmentsData.isSynced}
                isSaving={petsData.isSaving || appointmentsData.isSaving}
                lastSaved={petsData.lastSaved || appointmentsData.lastSaved}
                syncError={petsData.syncError || appointmentsData.syncError}
                onForceSync={() => {
                  petsData.forceSync();
                  appointmentsData.forceSync();
                }}
                theme={theme}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={() => {
                  if (activeTab === 'appointments') {
                    appointmentsData.exportCSV({ filename: 'pet-grooming-appointments' });
                  } else {
                    petsData.exportCSV({ filename: 'pet-grooming-pets' });
                  }
                }}
                onExportExcel={() => {
                  if (activeTab === 'appointments') {
                    appointmentsData.exportExcel({ filename: 'pet-grooming-appointments' });
                  } else {
                    petsData.exportExcel({ filename: 'pet-grooming-pets' });
                  }
                }}
                onExportJSON={() => {
                  if (activeTab === 'appointments') {
                    appointmentsData.exportJSON({ filename: 'pet-grooming-appointments' });
                  } else {
                    petsData.exportJSON({ filename: 'pet-grooming-pets' });
                  }
                }}
                onExportPDF={() => {
                  if (activeTab === 'appointments') {
                    appointmentsData.exportPDF({
                      filename: 'pet-grooming-appointments',
                      title: 'Pet Grooming - Appointments Report',
                      subtitle: `Total Appointments: ${appointments.length} | Scheduled: ${appointments.filter((a: Appointment) => a.status === 'scheduled').length}`,
                      orientation: 'landscape',
                    });
                  } else {
                    petsData.exportPDF({
                      filename: 'pet-grooming-pets',
                      title: 'Pet Grooming - Pets Report',
                      subtitle: `Total Pets: ${pets.length}`,
                      orientation: 'landscape',
                    });
                  }
                }}
                onPrint={() => {
                  if (activeTab === 'appointments') {
                    appointmentsData.print('Pet Grooming - Appointments Report');
                  } else {
                    petsData.print('Pet Grooming - Pets Report');
                  }
                }}
                onCopyToClipboard={() => {
                  if (activeTab === 'appointments') {
                    appointmentsData.copyToClipboard('tab');
                  } else {
                    petsData.copyToClipboard('tab');
                  }
                }}
                disabled={activeTab === 'appointments' ? appointments.length === 0 : pets.length === 0}
                theme={theme}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Dog className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petGrooming.totalPets', 'Total Pets')}</span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {pets.length}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petGrooming.appointments', 'Appointments')}</span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {appointments.filter((a: Appointment) => a.status !== 'completed' && a.status !== 'cancelled').length}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petGrooming.thisMonth', 'This Month')}</span>
              </div>
              <p className={`text-2xl font-bold text-[#0D9488]`}>{formatCurrency(revenueStats.thisMonthRevenue)}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petGrooming.totalRevenue', 'Total Revenue')}</span>
              </div>
              <p className={`text-2xl font-bold text-[#0D9488]`}>{formatCurrency(revenueStats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${cardClass} p-4 mb-6`}>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'pets', label: 'Pets', icon: Dog },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'services', label: 'Services', icon: Sparkles },
              { id: 'breeds', label: 'Breed Guide', icon: FileText },
              { id: 'revenue', label: 'Revenue', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pets Tab */}
        {activeTab === 'pets' && (
          <div className="space-y-6">
            {/* Search and Add */}
            <div className={`${cardClass} p-4`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('tools.petGrooming.searchPetsByNameBreed', 'Search pets by name, breed, or owner...')}
                    className={inputClass}
                  />
                </div>
                <button
                  onClick={() => {
                    setShowPetForm(true);
                    setEditingPet(null);
                    setPetForm({
                      species: 'dog',
                      size: 'medium',
                      ageUnit: 'years',
                      weightUnit: 'lbs',
                      vaccinations: [],
                      groomingHistory: [],
                      communicationNotes: [],
                      beforePhotos: [],
                      afterPhotos: [],
                    });
                  }}
                  className={buttonPrimary}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.petGrooming.addPet', 'Add Pet')}
                </button>
              </div>
            </div>

            {/* Pet List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPets.map((pet: Pet) => (
                <div
                  key={pet.id}
                  className={`${cardClass} p-4 cursor-pointer hover:shadow-xl transition-shadow`}
                  onClick={() => setSelectedPet(pet)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          pet.species === 'dog' ? 'bg-amber-100' : pet.species === 'cat' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}
                      >
                        {pet.species === 'dog' ? (
                          <Dog className="w-5 h-5 text-amber-600" />
                        ) : pet.species === 'cat' ? (
                          <Cat className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Heart className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {pet.name}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {pet.breed}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pet.size === 'small'
                          ? 'bg-green-100 text-green-700'
                          : pet.size === 'medium'
                          ? 'bg-blue-100 text-blue-700'
                          : pet.size === 'large'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {pet.size}
                    </span>
                  </div>

                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {pet.ownerName}
                    </p>
                    {pet.ownerPhone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {pet.ownerPhone}
                      </p>
                    )}
                  </div>

                  {(pet.temperament || pet.healthIssues) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {pet.healthIssues && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="truncate">{pet.healthIssues}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {pet.groomingHistory?.length || 0} grooming sessions
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPet(pet);
                          setPetForm(pet);
                          setShowPetForm(true);
                        }}
                        className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePet(pet.id);
                        }}
                        className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPets.length === 0 && (
              <div className={`${cardClass} p-8 text-center`}>
                <Dog className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm ? t('tools.petGrooming.noPetsFoundMatchingYour', 'No pets found matching your search') : t('tools.petGrooming.noPetsAddedYetClick', 'No pets added yet. Click "Add Pet" to get started.')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className={`${cardClass} p-4`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.petGrooming.appointments2', 'Appointments')}
                </h2>
                <button
                  onClick={() => {
                    setShowAppointmentForm(true);
                    setEditingAppointment(null);
                    setAppointmentForm({ services: [], status: 'scheduled' });
                  }}
                  className={buttonPrimary}
                  disabled={pets.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.petGrooming.newAppointment', 'New Appointment')}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {appointments
                .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((appointment: Appointment) => (
                  <div key={appointment.id} className={`${cardClass} p-4`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            appointment.status === 'completed'
                              ? 'bg-green-100'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100'
                              : appointment.status === 'in-progress'
                              ? 'bg-blue-100'
                              : 'bg-amber-100'
                          }`}
                        >
                          <Calendar
                            className={`w-5 h-5 ${
                              appointment.status === 'completed'
                                ? 'text-green-600'
                                : appointment.status === 'cancelled'
                                ? 'text-red-600'
                                : appointment.status === 'in-progress'
                                ? 'text-blue-600'
                                : 'text-amber-600'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {appointment.petName} - {appointment.ownerName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(appointment.date)} at {appointment.time}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {appointment.services.map((serviceId) => {
                              const service = services.find((s: Service) => s.id === serviceId);
                              return service ? (
                                <span
                                  key={serviceId}
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {service.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-semibold text-[#0D9488]`}>{formatCurrency(appointment.estimatedPrice)}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatDuration(appointment.estimatedDuration)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                            <button
                              onClick={() => completeAppointment(appointment)}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                              title={t('tools.petGrooming.markAsCompleted', 'Mark as completed')}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingAppointment(appointment);
                              setAppointmentForm(appointment);
                              setShowAppointmentForm(true);
                            }}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Edit2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </button>
                          <button
                            onClick={() => deleteAppointment(appointment.id)}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {appointments.length === 0 && (
                <div className={`${cardClass} p-8 text-center`}>
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.petGrooming.noAppointmentsScheduledAddA', 'No appointments scheduled. Add a pet first, then create an appointment.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className={`${cardClass} p-4`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.petGrooming.serviceMenu', 'Service Menu')}
              </h2>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.petGrooming.pricesAndTimesVaryBy', 'Prices and times vary by pet size. Breed-specific adjustments are applied automatically.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service: Service) => (
                <div key={service.id} className={`${cardClass} p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {service.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {service.description}
                      </p>
                    </div>
                    <Sparkles className="w-5 h-5 text-[#0D9488]" />
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {['small', 'medium', 'large', 'giant'].map((size) => {
                      const priceKey = `basePrice${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof Service;
                      const timeKey = `baseTime${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof Service;
                      return (
                        <div
                          key={size}
                          className={`p-2 rounded-lg text-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {size}
                          </p>
                          <p className={`text-sm font-bold text-[#0D9488]`}>
                            {formatCurrency(service[priceKey] as number)}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {service[timeKey] as number} min
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breed Guide Tab */}
        {activeTab === 'breeds' && (
          <div className="space-y-4">
            <div className={`${cardClass} p-4`}>
              <h2 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.petGrooming.breedSpecificGroomingGuide', 'Breed-Specific Grooming Guide')}
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.petGrooming.referenceGuideForBreedSpecific', 'Reference guide for breed-specific grooming requirements and pricing adjustments.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {breedRequirements.map((breed) => (
                <div key={breed.breed} className={`${cardClass} p-4`}>
                  <div className="flex items-center gap-3 mb-3">
                    {breed.species === 'dog' ? (
                      <Dog className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Cat className="w-5 h-5 text-purple-600" />
                    )}
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {breed.breed}
                    </h3>
                  </div>

                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} space-y-2`}>
                    <p>
                      <span className="font-medium">{t('tools.petGrooming.coatType', 'Coat Type:')}</span> {breed.coatType}
                    </p>
                    <p>
                      <span className="font-medium">{t('tools.petGrooming.frequency', 'Frequency:')}</span> {breed.groomingFrequency}
                    </p>
                    <div>
                      <span className="font-medium">{t('tools.petGrooming.specialRequirements', 'Special Requirements:')}</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {breed.specialRequirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          breed.priceMultiplier > 1 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        Price: {breed.priceMultiplier > 1 ? '+' : ''}
                        {Math.round((breed.priceMultiplier - 1) * 100)}%
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          breed.timeMultiplier > 1 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        Time: {breed.timeMultiplier > 1 ? '+' : ''}
                        {Math.round((breed.timeMultiplier - 1) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-[#0D9488]" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petGrooming.totalRevenue2', 'Total Revenue')}</span>
                </div>
                <p className={`text-3xl font-bold text-[#0D9488]`}>{formatCurrency(revenueStats.totalRevenue)}</p>
              </div>
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#0D9488]" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petGrooming.thisMonth2', 'This Month')}</span>
                </div>
                <p className={`text-3xl font-bold text-[#0D9488]`}>{formatCurrency(revenueStats.thisMonthRevenue)}</p>
              </div>
              <div className={`${cardClass} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Scissors className="w-5 h-5 text-[#0D9488]" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petGrooming.totalSessions', 'Total Sessions')}</span>
                </div>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {revenueStats.totalSessions}
                </p>
              </div>
            </div>

            {/* Revenue by Pet */}
            <div className={`${cardClass} p-4`}>
              <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.petGrooming.revenueByPet', 'Revenue by Pet')}
              </h3>
              <div className="space-y-3">
                {Object.entries(revenueStats.revenueByPet)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([petName, revenue]) => (
                    <div key={petName} className="flex items-center justify-between">
                      <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{petName}</span>
                      <span className="font-semibold text-[#0D9488]">{formatCurrency(revenue as number)}</span>
                    </div>
                  ))}
                {Object.keys(revenueStats.revenueByPet).length === 0 && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.petGrooming.noRevenueDataAvailableYet', 'No revenue data available yet.')}
                  </p>
                )}
              </div>
            </div>

            {/* Revenue by Client */}
            <div className={`${cardClass} p-4`}>
              <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.petGrooming.revenueByClient', 'Revenue by Client')}
              </h3>
              <div className="space-y-3">
                {Object.entries(revenueStats.revenueByClient)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([clientName, revenue]) => (
                    <div key={clientName} className="flex items-center justify-between">
                      <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{clientName}</span>
                      <span className="font-semibold text-[#0D9488]">{formatCurrency(revenue as number)}</span>
                    </div>
                  ))}
                {Object.keys(revenueStats.revenueByClient).length === 0 && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.petGrooming.noRevenueDataAvailableYet2', 'No revenue data available yet.')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pet Form Modal */}
        {showPetForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingPet ? t('tools.petGrooming.editPet', 'Edit Pet') : t('tools.petGrooming.addNewPet', 'Add New Pet')}
                </h2>
                <button
                  onClick={() => {
                    setShowPetForm(false);
                    setEditingPet(null);
                  }}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Pet Information */}
                <div>
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.petGrooming.petInformation', 'Pet Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.name', 'Name *')}
                      </label>
                      <input
                        type="text"
                        value={petForm.name || ''}
                        onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.petGrooming.petName', 'Pet name')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.breed', 'Breed *')}
                      </label>
                      <input
                        type="text"
                        value={petForm.breed || ''}
                        onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.petGrooming.eGGoldenRetriever', 'e.g., Golden Retriever')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.species', 'Species')}
                      </label>
                      <select
                        value={petForm.species || 'dog'}
                        onChange={(e) => setPetForm({ ...petForm, species: e.target.value as Pet['species'] })}
                        className={selectClass}
                      >
                        <option value="dog">{t('tools.petGrooming.dog', 'Dog')}</option>
                        <option value="cat">{t('tools.petGrooming.cat', 'Cat')}</option>
                        <option value="other">{t('tools.petGrooming.other', 'Other')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.size', 'Size')}
                      </label>
                      <select
                        value={petForm.size || 'medium'}
                        onChange={(e) => setPetForm({ ...petForm, size: e.target.value as Pet['size'] })}
                        className={selectClass}
                      >
                        <option value="small">{t('tools.petGrooming.small020Lbs', 'Small (0-20 lbs)')}</option>
                        <option value="medium">{t('tools.petGrooming.medium2150Lbs', 'Medium (21-50 lbs)')}</option>
                        <option value="large">{t('tools.petGrooming.large5190Lbs', 'Large (51-90 lbs)')}</option>
                        <option value="giant">{t('tools.petGrooming.giant90Lbs', 'Giant (90+ lbs)')}</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.age', 'Age')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={petForm.age || ''}
                          onChange={(e) => setPetForm({ ...petForm, age: parseFloat(e.target.value) })}
                          className={inputClass}
                          placeholder={t('tools.petGrooming.age2', 'Age')}
                          min="0"
                        />
                        <select
                          value={petForm.ageUnit || 'years'}
                          onChange={(e) => setPetForm({ ...petForm, ageUnit: e.target.value as Pet['ageUnit'] })}
                          className={`${selectClass} w-32`}
                        >
                          <option value="months">{t('tools.petGrooming.months', 'Months')}</option>
                          <option value="years">{t('tools.petGrooming.years', 'Years')}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.weight', 'Weight')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={petForm.weight || ''}
                          onChange={(e) => setPetForm({ ...petForm, weight: parseFloat(e.target.value) })}
                          className={inputClass}
                          placeholder={t('tools.petGrooming.weight2', 'Weight')}
                          min="0"
                        />
                        <select
                          value={petForm.weightUnit || 'lbs'}
                          onChange={(e) => setPetForm({ ...petForm, weightUnit: e.target.value as Pet['weightUnit'] })}
                          className={`${selectClass} w-24`}
                        >
                          <option value="lbs">lbs</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.coatType2', 'Coat Type')}
                      </label>
                      <input
                        type="text"
                        value={petForm.coatType || ''}
                        onChange={(e) => setPetForm({ ...petForm, coatType: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.petGrooming.eGDoubleCoatShort', 'e.g., Double coat, Short, Long')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.color', 'Color')}
                      </label>
                      <input
                        type="text"
                        value={petForm.color || ''}
                        onChange={(e) => setPetForm({ ...petForm, color: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.petGrooming.eGGoldenBlackWhite', 'e.g., Golden, Black & White')}
                      />
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.petGrooming.ownerInformation', 'Owner Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.ownerName', 'Owner Name *')}
                      </label>
                      <input
                        type="text"
                        value={petForm.ownerName || ''}
                        onChange={(e) => setPetForm({ ...petForm, ownerName: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.petGrooming.ownerSFullName', 'Owner\'s full name')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.phone', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        value={petForm.ownerPhone || ''}
                        onChange={(e) => setPetForm({ ...petForm, ownerPhone: e.target.value })}
                        className={inputClass}
                        placeholder="(555) 555-5555"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.email2', 'Email')}
                      </label>
                      <input
                        type="email"
                        value={petForm.ownerEmail || ''}
                        onChange={(e) => setPetForm({ ...petForm, ownerEmail: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.petGrooming.ownerEmailCom', 'owner@email.com')}
                      />
                    </div>
                  </div>
                </div>

                {/* Special Handling */}
                <div>
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.petGrooming.specialHandlingNotes', 'Special Handling Notes')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.temperament', 'Temperament')}
                      </label>
                      <input
                        type="text"
                        value={petForm.temperament || ''}
                        onChange={(e) => setPetForm({ ...petForm, temperament: e.target.value })}
                        className={inputClass}
                        placeholder={t('tools.petGrooming.eGFriendlyAnxiousAggressive', 'e.g., Friendly, Anxious, Aggressive with strangers')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.healthIssues', 'Health Issues')}
                      </label>
                      <textarea
                        value={petForm.healthIssues || ''}
                        onChange={(e) => setPetForm({ ...petForm, healthIssues: e.target.value })}
                        className={inputClass}
                        rows={2}
                        placeholder={t('tools.petGrooming.anyHealthConditionsAllergiesOr', 'Any health conditions, allergies, or sensitivities')}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.petGrooming.specialNotes', 'Special Notes')}
                      </label>
                      <textarea
                        value={petForm.specialNotes || ''}
                        onChange={(e) => setPetForm({ ...petForm, specialNotes: e.target.value })}
                        className={inputClass}
                        rows={2}
                        placeholder={t('tools.petGrooming.anyOtherImportantNotesFor', 'Any other important notes for handling this pet')}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={savePet} className={buttonPrimary}>
                    <Save className="w-4 h-4" />
                    {editingPet ? t('tools.petGrooming.updatePet', 'Update Pet') : t('tools.petGrooming.addPet2', 'Add Pet')}
                  </button>
                  <button
                    onClick={() => {
                      setShowPetForm(false);
                      setEditingPet(null);
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.petGrooming.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Form Modal */}
        {showAppointmentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-lg max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingAppointment ? t('tools.petGrooming.editAppointment', 'Edit Appointment') : t('tools.petGrooming.newAppointment2', 'New Appointment')}
                </h2>
                <button
                  onClick={() => {
                    setShowAppointmentForm(false);
                    setEditingAppointment(null);
                  }}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.selectPet', 'Select Pet *')}
                  </label>
                  <select
                    value={appointmentForm.petId || ''}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, petId: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">{t('tools.petGrooming.chooseAPet', 'Choose a pet...')}</option>
                    {pets.map((pet: Pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.ownerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.petGrooming.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={appointmentForm.date || ''}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.petGrooming.time', 'Time *')}
                    </label>
                    <input
                      type="time"
                      value={appointmentForm.time || ''}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.services', 'Services *')}
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {services
                      .filter((s: Service) => s.active)
                      .map((service: Service) => (
                        <label
                          key={service.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={appointmentForm.services?.includes(service.id) || false}
                            onChange={(e) => {
                              const services = appointmentForm.services || [];
                              if (e.target.checked) {
                                setAppointmentForm({ ...appointmentForm, services: [...services, service.id] });
                              } else {
                                setAppointmentForm({
                                  ...appointmentForm,
                                  services: services.filter((s) => s !== service.id),
                                });
                              }
                            }}
                            className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                          />
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {service.name}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.status', 'Status')}
                  </label>
                  <select
                    value={appointmentForm.status || 'scheduled'}
                    onChange={(e) =>
                      setAppointmentForm({ ...appointmentForm, status: e.target.value as Appointment['status'] })
                    }
                    className={selectClass}
                  >
                    <option value="scheduled">{t('tools.petGrooming.scheduled', 'Scheduled')}</option>
                    <option value="confirmed">{t('tools.petGrooming.confirmed', 'Confirmed')}</option>
                    <option value="in-progress">{t('tools.petGrooming.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.petGrooming.completed', 'Completed')}</option>
                    <option value="cancelled">{t('tools.petGrooming.cancelled', 'Cancelled')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.notes', 'Notes')}
                  </label>
                  <textarea
                    value={appointmentForm.notes || ''}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                    className={inputClass}
                    rows={2}
                    placeholder={t('tools.petGrooming.anySpecialInstructions', 'Any special instructions...')}
                  />
                </div>

                {/* Estimate Preview */}
                {appointmentForm.petId && appointmentForm.services && appointmentForm.services.length > 0 && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.petGrooming.estimate', 'Estimate')}
                    </h4>
                    {(() => {
                      const pet = pets.find((p: Pet) => p.id === appointmentForm.petId);
                      if (!pet) return null;
                      const { totalPrice, totalTime } = calculateAppointmentTotals(
                        appointmentForm.services,
                        pet.size,
                        pet.breed
                      );
                      return (
                        <div className="flex justify-between">
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            <Clock className="w-4 h-4 inline mr-1" />
                            {formatDuration(totalTime)}
                          </span>
                          <span className="font-bold text-[#0D9488]">{formatCurrency(totalPrice)}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={saveAppointment} className={buttonPrimary}>
                    <Save className="w-4 h-4" />
                    {editingAppointment ? t('tools.petGrooming.update', 'Update') : t('tools.petGrooming.schedule', 'Schedule')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAppointmentForm(false);
                      setEditingAppointment(null);
                    }}
                    className={buttonSecondary}
                  >
                    {t('tools.petGrooming.cancel2', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pet Detail Modal */}
        {selectedPet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-full ${
                      selectedPet.species === 'dog'
                        ? 'bg-amber-100'
                        : selectedPet.species === 'cat'
                        ? 'bg-purple-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    {selectedPet.species === 'dog' ? (
                      <Dog className="w-6 h-6 text-amber-600" />
                    ) : selectedPet.species === 'cat' ? (
                      <Cat className="w-6 h-6 text-purple-600" />
                    ) : (
                      <Heart className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPet.name}
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedPet.breed} - {selectedPet.size}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPet(null)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Pet Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.petGrooming.petDetails', 'Pet Details')}
                  </h4>
                  <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p>Age: {selectedPet.age} {selectedPet.ageUnit}</p>
                    <p>Weight: {selectedPet.weight} {selectedPet.weightUnit}</p>
                    <p>Coat: {selectedPet.coatType || 'Not specified'}</p>
                    <p>Color: {selectedPet.color || 'Not specified'}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.petGrooming.ownerInfo', 'Owner Info')}
                  </h4>
                  <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedPet.ownerName}
                    </p>
                    {selectedPet.ownerPhone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedPet.ownerPhone}
                      </p>
                    )}
                    {selectedPet.ownerEmail && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedPet.ownerEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.petGrooming.specialHandling', 'Special Handling')}
                  </h4>
                  <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedPet.temperament && <p>Temperament: {selectedPet.temperament}</p>}
                    {selectedPet.healthIssues && (
                      <p className="text-amber-600">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        {selectedPet.healthIssues}
                      </p>
                    )}
                    {selectedPet.specialNotes && <p>{selectedPet.specialNotes}</p>}
                    {!selectedPet.temperament && !selectedPet.healthIssues && !selectedPet.specialNotes && (
                      <p className="italic">{t('tools.petGrooming.noSpecialNotes', 'No special notes')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Sections */}
              <div className="space-y-4">
                {/* Vaccinations Section */}
                <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection('vaccinations')}
                    className={`w-full flex items-center justify-between p-4 ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Syringe className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Vaccinations ({selectedPet.vaccinations?.length || 0})
                      </span>
                    </div>
                    {expandedSections['vaccinations'] ? (
                      <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                  </button>
                  {expandedSections['vaccinations'] && (
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => setShowVaccinationForm(true)}
                        className={`mb-4 text-sm ${theme === 'dark' ? t('tools.petGrooming.text2dd4bf', 'text-[#2DD4BF]') : t('tools.petGrooming.text0d9488', 'text-[#0D9488]')} hover:underline flex items-center gap-1`}
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.petGrooming.addVaccination', 'Add Vaccination')}
                      </button>
                      {selectedPet.vaccinations?.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPet.vaccinations.map((vax: Vaccination) => (
                            <div
                              key={vax.id}
                              className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                            >
                              <div className="flex justify-between">
                                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {vax.name}
                                </span>
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(vax.date)}
                                </span>
                              </div>
                              {vax.expiryDate && (
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Expires: {formatDate(vax.expiryDate)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.petGrooming.noVaccinationsRecorded', 'No vaccinations recorded')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Grooming History Section */}
                <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection('grooming')}
                    className={`w-full flex items-center justify-between p-4 ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Scissors className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Grooming History ({selectedPet.groomingHistory?.length || 0})
                      </span>
                    </div>
                    {expandedSections['grooming'] ? (
                      <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                  </button>
                  {expandedSections['grooming'] && (
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => setShowGroomingForm(true)}
                        className={`mb-4 text-sm ${theme === 'dark' ? t('tools.petGrooming.text2dd4bf2', 'text-[#2DD4BF]') : t('tools.petGrooming.text0d94882', 'text-[#0D9488]')} hover:underline flex items-center gap-1`}
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.petGrooming.addGroomingSession', 'Add Grooming Session')}
                      </button>
                      {selectedPet.groomingHistory?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedPet.groomingHistory
                            .sort((a: GroomingSession, b: GroomingSession) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((session: GroomingSession) => (
                              <div
                                key={session.id}
                                className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                              >
                                <div className="flex justify-between mb-2">
                                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {formatDate(session.date)}
                                  </span>
                                  <span className="font-bold text-[#0D9488]">{formatCurrency(session.price)}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {session.services.map((serviceId, i) => {
                                    const service = services.find((s: Service) => s.id === serviceId);
                                    return (
                                      <span
                                        key={i}
                                        className={`px-2 py-0.5 text-xs rounded-full ${
                                          theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                        }`}
                                      >
                                        {service?.name || serviceId}
                                      </span>
                                    );
                                  })}
                                </div>
                                {session.notes && (
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {session.notes}
                                  </p>
                                )}

                                {/* Before/After Photo Placeholders */}
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                  <div
                                    className={`aspect-video rounded-lg flex items-center justify-center ${
                                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                                    }`}
                                  >
                                    <div className="text-center">
                                      <Camera
                                        className={`w-6 h-6 mx-auto mb-1 ${
                                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                        }`}
                                      />
                                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {t('tools.petGrooming.before', 'Before')}
                                      </span>
                                    </div>
                                  </div>
                                  <div
                                    className={`aspect-video rounded-lg flex items-center justify-center ${
                                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                                    }`}
                                  >
                                    <div className="text-center">
                                      <Camera
                                        className={`w-6 h-6 mx-auto mb-1 ${
                                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                        }`}
                                      />
                                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {t('tools.petGrooming.after', 'After')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.petGrooming.noGroomingHistoryRecorded', 'No grooming history recorded')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Communication Notes Section */}
                <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection('notes')}
                    className={`w-full flex items-center justify-between p-4 ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Communication Notes ({selectedPet.communicationNotes?.length || 0})
                      </span>
                    </div>
                    {expandedSections['notes'] ? (
                      <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                  </button>
                  {expandedSections['notes'] && (
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => setShowNoteForm(true)}
                        className={`mb-4 text-sm ${theme === 'dark' ? t('tools.petGrooming.text2dd4bf3', 'text-[#2DD4BF]') : t('tools.petGrooming.text0d94883', 'text-[#0D9488]')} hover:underline flex items-center gap-1`}
                      >
                        <Plus className="w-4 h-4" />
                        {t('tools.petGrooming.addNote', 'Add Note')}
                      </button>
                      {selectedPet.communicationNotes?.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPet.communicationNotes
                            .sort((a: CommunicationNote, b: CommunicationNote) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((note: CommunicationNote) => (
                              <div
                                key={note.id}
                                className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      note.type === 'call'
                                        ? 'bg-blue-100 text-blue-700'
                                        : note.type === 'email'
                                        ? 'bg-green-100 text-green-700'
                                        : note.type === 'text'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {note.type}
                                  </span>
                                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {formatDate(note.date)}
                                  </span>
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {note.note}
                                </p>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.petGrooming.noCommunicationNotes', 'No communication notes')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vaccination Form Modal */}
        {showVaccinationForm && selectedPet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className={`${cardClass} w-full max-w-md p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.petGrooming.addVaccination2', 'Add Vaccination')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.vaccinationName', 'Vaccination Name *')}
                  </label>
                  <input
                    type="text"
                    value={vaccinationForm.name || ''}
                    onChange={(e) => setVaccinationForm({ ...vaccinationForm, name: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.petGrooming.eGRabiesDhpp', 'e.g., Rabies, DHPP')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.petGrooming.dateGiven', 'Date Given *')}
                    </label>
                    <input
                      type="date"
                      value={vaccinationForm.date || ''}
                      onChange={(e) => setVaccinationForm({ ...vaccinationForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.petGrooming.expiryDate', 'Expiry Date')}
                    </label>
                    <input
                      type="date"
                      value={vaccinationForm.expiryDate || ''}
                      onChange={(e) => setVaccinationForm({ ...vaccinationForm, expiryDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.veterinarian', 'Veterinarian')}
                  </label>
                  <input
                    type="text"
                    value={vaccinationForm.veterinarian || ''}
                    onChange={(e) => setVaccinationForm({ ...vaccinationForm, veterinarian: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.petGrooming.vetName', 'Vet name')}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={addVaccination} className={buttonPrimary}>
                    <Save className="w-4 h-4" />
                    {t('tools.petGrooming.save', 'Save')}
                  </button>
                  <button onClick={() => setShowVaccinationForm(false)} className={buttonSecondary}>
                    {t('tools.petGrooming.cancel3', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grooming Session Form Modal */}
        {showGroomingForm && selectedPet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className={`${cardClass} w-full max-w-md max-h-[90vh] overflow-y-auto p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.petGrooming.addGroomingSession2', 'Add Grooming Session')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.date2', 'Date *')}
                  </label>
                  <input
                    type="date"
                    value={groomingForm.date || ''}
                    onChange={(e) => setGroomingForm({ ...groomingForm, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.services2', 'Services *')}
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {services
                      .filter((s: Service) => s.active)
                      .map((service: Service) => (
                        <label
                          key={service.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={groomingForm.services?.includes(service.id) || false}
                            onChange={(e) => {
                              const services = groomingForm.services || [];
                              if (e.target.checked) {
                                setGroomingForm({ ...groomingForm, services: [...services, service.id] });
                              } else {
                                setGroomingForm({
                                  ...groomingForm,
                                  services: services.filter((s) => s !== service.id),
                                });
                              }
                            }}
                            className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                          />
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {service.name}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.petGrooming.durationMin', 'Duration (min)')}
                    </label>
                    <input
                      type="number"
                      value={groomingForm.duration || ''}
                      onChange={(e) => setGroomingForm({ ...groomingForm, duration: parseInt(e.target.value) })}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.petGrooming.price', 'Price ($)')}
                    </label>
                    <input
                      type="number"
                      value={groomingForm.price || ''}
                      onChange={(e) => setGroomingForm({ ...groomingForm, price: parseFloat(e.target.value) })}
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.groomer', 'Groomer')}
                  </label>
                  <input
                    type="text"
                    value={groomingForm.groomer || ''}
                    onChange={(e) => setGroomingForm({ ...groomingForm, groomer: e.target.value })}
                    className={inputClass}
                    placeholder={t('tools.petGrooming.groomerName', 'Groomer name')}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.notes2', 'Notes')}
                  </label>
                  <textarea
                    value={groomingForm.notes || ''}
                    onChange={(e) => setGroomingForm({ ...groomingForm, notes: e.target.value })}
                    className={inputClass}
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={addGroomingSession} className={buttonPrimary}>
                    <Save className="w-4 h-4" />
                    {t('tools.petGrooming.save2', 'Save')}
                  </button>
                  <button onClick={() => setShowGroomingForm(false)} className={buttonSecondary}>
                    {t('tools.petGrooming.cancel4', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Communication Note Form Modal */}
        {showNoteForm && selectedPet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className={`${cardClass} w-full max-w-md p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.petGrooming.addCommunicationNote', 'Add Communication Note')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.type', 'Type')}
                  </label>
                  <select
                    value={noteForm.type || 'call'}
                    onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value as CommunicationNote['type'] })}
                    className={selectClass}
                  >
                    <option value="call">{t('tools.petGrooming.phoneCall', 'Phone Call')}</option>
                    <option value="email">{t('tools.petGrooming.email', 'Email')}</option>
                    <option value="text">{t('tools.petGrooming.textMessage', 'Text Message')}</option>
                    <option value="in-person">{t('tools.petGrooming.inPerson', 'In Person')}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.petGrooming.note', 'Note *')}
                  </label>
                  <textarea
                    value={noteForm.note || ''}
                    onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                    className={inputClass}
                    rows={4}
                    placeholder={t('tools.petGrooming.enterCommunicationDetails', 'Enter communication details...')}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={addCommunicationNote} className={buttonPrimary}>
                    <Save className="w-4 h-4" />
                    {t('tools.petGrooming.save3', 'Save')}
                  </button>
                  <button onClick={() => setShowNoteForm(false)} className={buttonSecondary}>
                    {t('tools.petGrooming.cancel5', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`${cardClass} p-4 mt-6`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.petGrooming.aboutPetGroomingManager', 'About Pet Grooming Manager')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            A comprehensive pet grooming business management tool. Track pet profiles with owner information,
            manage appointments with automatic pricing based on size and breed, record grooming history with
            before/after photo placeholders, track vaccinations and health records, maintain client communication
            notes, and monitor revenue per pet and client. All data is saved locally in your browser.
          </p>
        </div>

        {/* Validation Toast */}
        {validationMessage && (
          <div className={`fixed bottom-4 left-4 right-4 max-w-md p-4 rounded-lg ${
            theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'
          } shadow-lg z-50`}>
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default PetGroomingTool;
