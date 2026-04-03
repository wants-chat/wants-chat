'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  User,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Star,
  DollarSign,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Award,
  Dumbbell,
  Heart,
  Target,
  MessageSquare,
  CreditCard,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrainerBookingToolProps {
  uiConfig?: UIConfig;
}

// Types
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
type SessionType = 'personal_training' | 'group_session' | 'assessment' | 'nutrition_consult' | 'online_coaching';
type Specialty = 'weight_loss' | 'muscle_building' | 'sports_performance' | 'rehabilitation' | 'flexibility' | 'nutrition' | 'boxing' | 'crossfit';

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  specialties: Specialty[];
  certifications: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  availability: { day: string; slots: string[] }[];
  profileImage: string;
  isActive: boolean;
  createdAt: string;
}

interface Booking {
  id: string;
  trainerId: string;
  trainerName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  sessionType: SessionType;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  price: number;
  status: BookingStatus;
  notes: string;
  goals: string;
  createdAt: string;
}

interface Review {
  id: string;
  trainerId: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

// Constants
const SPECIALTIES: { specialty: Specialty; label: string; icon: React.ReactNode }[] = [
  { specialty: 'weight_loss', label: 'Weight Loss', icon: <Target className="w-4 h-4" /> },
  { specialty: 'muscle_building', label: 'Muscle Building', icon: <Dumbbell className="w-4 h-4" /> },
  { specialty: 'sports_performance', label: 'Sports Performance', icon: <Award className="w-4 h-4" /> },
  { specialty: 'rehabilitation', label: 'Rehabilitation', icon: <Heart className="w-4 h-4" /> },
  { specialty: 'flexibility', label: 'Flexibility', icon: <Target className="w-4 h-4" /> },
  { specialty: 'nutrition', label: 'Nutrition', icon: <Heart className="w-4 h-4" /> },
  { specialty: 'boxing', label: 'Boxing', icon: <Target className="w-4 h-4" /> },
  { specialty: 'crossfit', label: 'CrossFit', icon: <Dumbbell className="w-4 h-4" /> },
];

const SESSION_TYPES: { type: SessionType; label: string; duration: number }[] = [
  { type: 'personal_training', label: 'Personal Training', duration: 60 },
  { type: 'group_session', label: 'Group Session', duration: 60 },
  { type: 'assessment', label: 'Fitness Assessment', duration: 45 },
  { type: 'nutrition_consult', label: 'Nutrition Consultation', duration: 30 },
  { type: 'online_coaching', label: 'Online Coaching', duration: 30 },
];

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  no_show: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
};

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

// Column configurations
const BOOKING_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'trainerName', header: 'Trainer', type: 'string' },
  { key: 'sessionType', header: 'Session Type', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
];

const TRAINER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'yearsExperience', header: 'Experience (years)', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes || '00'} ${ampm}`;
};

const DEFAULT_TRAINERS: Trainer[] = [
  {
    id: 'tr1',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus@fitgym.com',
    phone: '555-0201',
    bio: 'NASM certified personal trainer with 8 years of experience specializing in strength training and bodybuilding.',
    specialties: ['muscle_building', 'sports_performance'],
    certifications: ['NASM-CPT', 'CSCS', 'Precision Nutrition L1'],
    hourlyRate: 75,
    rating: 4.9,
    reviewCount: 156,
    yearsExperience: 8,
    availability: [
      { day: 'Monday', slots: ['06:00', '07:00', '08:00', '17:00', '18:00', '19:00'] },
      { day: 'Tuesday', slots: ['06:00', '07:00', '08:00', '17:00', '18:00', '19:00'] },
      { day: 'Wednesday', slots: ['06:00', '07:00', '08:00'] },
      { day: 'Thursday', slots: ['06:00', '07:00', '08:00', '17:00', '18:00', '19:00'] },
      { day: 'Friday', slots: ['06:00', '07:00', '08:00', '17:00', '18:00'] },
    ],
    profileImage: '',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tr2',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah@fitgym.com',
    phone: '555-0202',
    bio: 'Registered dietitian and certified personal trainer focused on sustainable weight loss and nutrition coaching.',
    specialties: ['weight_loss', 'nutrition'],
    certifications: ['ACE-CPT', 'RD', 'Certified Diabetes Educator'],
    hourlyRate: 85,
    rating: 4.8,
    reviewCount: 203,
    yearsExperience: 10,
    availability: [
      { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Friday', slots: ['09:00', '10:00', '11:00'] },
    ],
    profileImage: '',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tr3',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david@fitgym.com',
    phone: '555-0203',
    bio: 'Former professional boxer turned fitness coach. Expert in boxing fitness and HIIT training.',
    specialties: ['boxing', 'crossfit', 'sports_performance'],
    certifications: ['ISSA-CPT', 'CrossFit L2', 'USA Boxing Coach'],
    hourlyRate: 90,
    rating: 4.9,
    reviewCount: 178,
    yearsExperience: 12,
    availability: [
      { day: 'Tuesday', slots: ['08:00', '09:00', '10:00', '16:00', '17:00'] },
      { day: 'Thursday', slots: ['08:00', '09:00', '10:00', '16:00', '17:00'] },
      { day: 'Saturday', slots: ['08:00', '09:00', '10:00', '11:00'] },
    ],
    profileImage: '',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const TrainerBookingTool: React.FC<TrainerBookingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hooks for backend sync
  const {
    data: bookings,
    addItem: addBookingToBackend,
    updateItem: updateBookingBackend,
    deleteItem: deleteBookingBackend,
    isSynced: bookingsSynced,
    isSaving: bookingsSaving,
    lastSaved: bookingsLastSaved,
    syncError: bookingsSyncError,
    forceSync: forceBookingsSync,
  } = useToolData<Booking>('trainer-bookings', [], BOOKING_COLUMNS);

  const {
    data: trainers,
    addItem: addTrainerToBackend,
    updateItem: updateTrainerBackend,
    deleteItem: deleteTrainerBackend,
    setData: setTrainersData,
  } = useToolData<Trainer>('trainers', DEFAULT_TRAINERS, TRAINER_COLUMNS);

  // Local UI state
  const [activeTab, setActiveTab] = useState<'bookings' | 'trainers' | 'schedule'>('bookings');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<Specialty | 'all'>('all');

  // New booking form state
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    trainerId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    sessionType: 'personal_training',
    date: '',
    startTime: '09:00',
    duration: 60,
    location: 'Gym Floor',
    notes: '',
    goals: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.clientName || params.sessionType) {
        setNewBooking({
          ...newBooking,
          clientName: params.clientName || '',
          clientEmail: params.clientEmail || '',
          sessionType: params.sessionType || 'personal_training',
          goals: params.goals || '',
        });
        setShowBookingForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Initialize trainers on first load
  useEffect(() => {
    if (trainers.length === 0) {
      setTrainersData(DEFAULT_TRAINERS);
    }
  }, []);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch =
        searchTerm === '' ||
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.trainerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, filterStatus]);

  // Filter trainers
  const filteredTrainers = useMemo(() => {
    return trainers.filter(trainer => {
      if (!trainer.isActive) return false;
      if (filterSpecialty === 'all') return true;
      return trainer.specialties.includes(filterSpecialty);
    });
  }, [trainers, filterSpecialty]);

  // Calculate end time
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + (minutes || 0) + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Add new booking
  const addBooking = () => {
    if (!newBooking.trainerId || !newBooking.clientName || !newBooking.date) {
      setValidationMessage('Please fill in required fields (Trainer, Client Name, Date)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const trainer = trainers.find(t => t.id === newBooking.trainerId);
    const sessionType = SESSION_TYPES.find(s => s.type === newBooking.sessionType);
    const duration = newBooking.duration || sessionType?.duration || 60;
    const endTime = calculateEndTime(newBooking.startTime || '09:00', duration);

    const booking: Booking = {
      id: generateId(),
      trainerId: newBooking.trainerId || '',
      trainerName: trainer ? `${trainer.firstName} ${trainer.lastName}` : '',
      clientId: generateId(),
      clientName: newBooking.clientName || '',
      clientEmail: newBooking.clientEmail || '',
      clientPhone: newBooking.clientPhone || '',
      sessionType: newBooking.sessionType || 'personal_training',
      date: newBooking.date || '',
      startTime: newBooking.startTime || '09:00',
      endTime,
      duration,
      location: newBooking.location || 'Gym Floor',
      price: trainer ? trainer.hourlyRate * (duration / 60) : 0,
      status: 'pending',
      notes: newBooking.notes || '',
      goals: newBooking.goals || '',
      createdAt: new Date().toISOString(),
    };

    addBookingToBackend(booking);
    resetBookingForm();
  };

  // Update booking status
  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    updateBookingBackend(bookingId, { status });
  };

  // Delete booking
  const deleteBooking = async (bookingId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this booking?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteBookingBackend(bookingId);
  };

  // Reset booking form
  const resetBookingForm = () => {
    setShowBookingForm(false);
    setEditingBooking(null);
    setNewBooking({
      trainerId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      sessionType: 'personal_training',
      date: '',
      startTime: '09:00',
      duration: 60,
      location: 'Gym Floor',
      notes: '',
      goals: '',
    });
  };

  // Analytics
  const analytics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today);
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.price, 0);

    return {
      totalBookings: bookings.length,
      todayBookings: todayBookings.length,
      upcomingBookings: confirmedBookings.length,
      totalRevenue,
    };
  }, [bookings]);

  const getSpecialtyLabel = (specialty: Specialty) => {
    return SPECIALTIES.find(s => s.specialty === specialty)?.label || specialty;
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.trainerBooking.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.trainerBooking.personalTrainerBooking', 'Personal Trainer Booking')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.trainerBooking.bookSessionsWithCertifiedPersonal', 'Book sessions with certified personal trainers')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="trainer-booking" toolName="Trainer Booking" />

              <SyncStatus
                isSynced={bookingsSynced}
                isSaving={bookingsSaving}
                lastSaved={bookingsLastSaved}
                syncError={bookingsSyncError}
                onForceSync={forceBookingsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(bookings, BOOKING_COLUMNS, { filename: 'trainer-bookings' })}
                onExportExcel={() => exportToExcel(bookings, BOOKING_COLUMNS, { filename: 'trainer-bookings' })}
                onExportJSON={() => exportToJSON(bookings, { filename: 'trainer-bookings' })}
                onExportPDF={async () => {
                  await exportToPDF(bookings, BOOKING_COLUMNS, {
                    filename: 'trainer-bookings',
                    title: 'Personal Trainer Bookings',
                    subtitle: `${analytics.totalBookings} total bookings | ${formatCurrency(analytics.totalRevenue)} revenue`,
                  });
                }}
                onPrint={() => printData(bookings, BOOKING_COLUMNS, { title: 'Trainer Bookings' })}
                onCopyToClipboard={() => copyUtil(bookings, BOOKING_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
              { id: 'trainers', label: 'Trainers', icon: <User className="w-4 h-4" /> },
              { id: 'schedule', label: 'Schedule', icon: <Clock className="w-4 h-4" /> },
            ].map((tab) => (
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Bookings', value: analytics.totalBookings, icon: <Calendar className="w-5 h-5" />, color: 'bg-blue-500' },
            { label: 'Today', value: analytics.todayBookings, icon: <Clock className="w-5 h-5" />, color: 'bg-green-500' },
            { label: 'Upcoming', value: analytics.upcomingBookings, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-purple-500' },
            { label: 'Total Revenue', value: formatCurrency(analytics.totalRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'bg-orange-500' },
          ].map((stat, index) => (
            <Card key={index} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${stat.color} rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.trainerBooking.searchBookings', 'Search bookings...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="all">{t('tools.trainerBooking.allStatuses', 'All Statuses')}</option>
                  <option value="pending">{t('tools.trainerBooking.pending', 'Pending')}</option>
                  <option value="confirmed">{t('tools.trainerBooking.confirmed', 'Confirmed')}</option>
                  <option value="completed">{t('tools.trainerBooking.completed', 'Completed')}</option>
                  <option value="cancelled">{t('tools.trainerBooking.cancelled', 'Cancelled')}</option>
                  <option value="no_show">{t('tools.trainerBooking.noShow', 'No Show')}</option>
                </select>
              </div>
              <button
                onClick={() => setShowBookingForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.trainerBooking.newBooking2', 'New Booking')}
              </button>
            </div>

            {/* Booking Form */}
            {showBookingForm && (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <span>{t('tools.trainerBooking.newBooking', 'New Booking')}</span>
                    <button onClick={resetBookingForm} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.trainerBooking.trainer', 'Trainer *')}
                      </label>
                      <select
                        value={newBooking.trainerId}
                        onChange={(e) => setNewBooking({ ...newBooking, trainerId: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="">{t('tools.trainerBooking.selectTrainer', 'Select trainer...')}</option>
                        {trainers.filter(t => t.isActive).map(trainer => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.firstName} {trainer.lastName} - {formatCurrency(trainer.hourlyRate)}/hr
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.trainerBooking.clientName', 'Client Name *')}
                      </label>
                      <input
                        type="text"
                        value={newBooking.clientName}
                        onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.trainerBooking.clientEmail', 'Client Email')}
                      </label>
                      <input
                        type="email"
                        value={newBooking.clientEmail}
                        onChange={(e) => setNewBooking({ ...newBooking, clientEmail: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.trainerBooking.sessionType', 'Session Type')}
                      </label>
                      <select
                        value={newBooking.sessionType}
                        onChange={(e) => setNewBooking({ ...newBooking, sessionType: e.target.value as SessionType })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {SESSION_TYPES.map(session => (
                          <option key={session.type} value={session.type}>
                            {session.label} ({session.duration} min)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.trainerBooking.date', 'Date *')}
                      </label>
                      <input
                        type="date"
                        value={newBooking.date}
                        onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.trainerBooking.time', 'Time')}
                      </label>
                      <select
                        value={newBooking.startTime}
                        onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={time} value={time}>{formatTime(time)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.trainerBooking.goalsNotes', 'Goals / Notes')}
                      </label>
                      <textarea
                        value={newBooking.goals}
                        onChange={(e) => setNewBooking({ ...newBooking, goals: e.target.value })}
                        rows={2}
                        placeholder={t('tools.trainerBooking.clientSFitnessGoalsOr', 'Client\'s fitness goals or session notes...')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={resetBookingForm}
                      className={`px-4 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.trainerBooking.cancel', 'Cancel')}
                    </button>
                    <button
                      onClick={addBooking}
                      className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      {t('tools.trainerBooking.createBooking', 'Create Booking')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bookings List */}
            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardContent className="p-8 text-center">
                    <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {t('tools.trainerBooking.noBookingsFoundCreateYour', 'No bookings found. Create your first booking!')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map(booking => (
                  <Card key={booking.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <User className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {booking.clientName}
                            </h3>
                            <div className="flex items-center gap-3 text-sm">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                with {booking.trainerName}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status].bg} ${STATUS_COLORS[booking.status].text}`}>
                                {booking.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(booking.date)}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold text-[#0D9488]`}>
                              {formatCurrency(booking.price)}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {SESSION_TYPES.find(s => s.type === booking.sessionType)?.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                title={t('tools.trainerBooking.confirm', 'Confirm')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                title={t('tools.trainerBooking.cancel2', 'Cancel')}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteBooking(booking.id)}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Trainers Tab */}
        {activeTab === 'trainers' && (
          <div className="space-y-6">
            {/* Filter by specialty */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value as Specialty | 'all')}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="all">{t('tools.trainerBooking.allSpecialties', 'All Specialties')}</option>
                {SPECIALTIES.map(spec => (
                  <option key={spec.specialty} value={spec.specialty}>{spec.label}</option>
                ))}
              </select>
            </div>

            {/* Trainers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrainers.map(trainer => (
                <Card key={trainer.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <User className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {trainer.firstName} {trainer.lastName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {trainer.rating} ({trainer.reviewCount} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {trainer.specialties.map(spec => (
                        <span
                          key={spec}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-[#0D9488] text-white"
                        >
                          {getSpecialtyLabel(spec)}
                        </span>
                      ))}
                    </div>

                    <p className={`text-sm mb-4 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {trainer.bio}
                    </p>

                    <div className={`grid grid-cols-2 gap-2 mb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(trainer.hourlyRate)}/hr</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{trainer.yearsExperience} years</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {trainer.certifications.slice(0, 3).map((cert, index) => (
                        <span
                          key={index}
                          className={`px-2 py-0.5 rounded text-xs ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {cert}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setNewBooking({ ...newBooking, trainerId: trainer.id });
                        setShowBookingForm(true);
                        setActiveTab('bookings');
                      }}
                      className="w-full px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                    >
                      {t('tools.trainerBooking.bookSession', 'Book Session')}
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {t('tools.trainerBooking.upcomingSessions', 'Upcoming Sessions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.trainerBooking.noUpcomingSessionsScheduled', 'No upcoming sessions scheduled')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings
                    .filter(b => b.status === 'confirmed' || b.status === 'pending')
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(booking => (
                      <div key={booking.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {booking.clientName} with {booking.trainerName}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {SESSION_TYPES.find(s => s.type === booking.sessionType)?.label}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatDate(booking.date)}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatTime(booking.startTime)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default TrainerBookingTool;
