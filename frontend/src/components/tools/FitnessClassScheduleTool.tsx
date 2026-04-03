'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  User,
  Dumbbell,
  Heart,
  Zap,
  Bike,
  Waves,
  Music,
  Target,
  Star,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
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

interface FitnessClassScheduleToolProps {
  uiConfig?: UIConfig;
}

// Types
type ClassCategory = 'strength' | 'cardio' | 'yoga' | 'pilates' | 'cycling' | 'swimming' | 'dance' | 'hiit' | 'martial_arts' | 'flexibility';
type ClassLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
type ClassStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

interface FitnessClass {
  id: string;
  name: string;
  description: string;
  category: ClassCategory;
  level: ClassLevel;
  instructorId: string;
  instructorName: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxCapacity: number;
  currentEnrollment: number;
  waitlistCount: number;
  status: ClassStatus;
  recurring: boolean;
  recurringDays: string[];
  equipmentNeeded: string[];
  notes: string;
  createdAt: string;
}

interface ClassRegistration {
  id: string;
  classId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  registeredAt: string;
  attended: boolean;
  isWaitlist: boolean;
}

interface Instructor {
  id: string;
  name: string;
  specialties: ClassCategory[];
  email: string;
  phone: string;
  bio: string;
  rating: number;
  classesThisWeek: number;
}

// Constants
const CLASS_CATEGORIES: { category: ClassCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { category: 'strength', label: 'Strength', icon: <Dumbbell className="w-4 h-4" />, color: 'bg-red-500' },
  { category: 'cardio', label: 'Cardio', icon: <Heart className="w-4 h-4" />, color: 'bg-orange-500' },
  { category: 'yoga', label: 'Yoga', icon: <Target className="w-4 h-4" />, color: 'bg-purple-500' },
  { category: 'pilates', label: 'Pilates', icon: <Zap className="w-4 h-4" />, color: 'bg-pink-500' },
  { category: 'cycling', label: 'Cycling', icon: <Bike className="w-4 h-4" />, color: 'bg-blue-500' },
  { category: 'swimming', label: 'Swimming', icon: <Waves className="w-4 h-4" />, color: 'bg-cyan-500' },
  { category: 'dance', label: 'Dance', icon: <Music className="w-4 h-4" />, color: 'bg-yellow-500' },
  { category: 'hiit', label: 'HIIT', icon: <Zap className="w-4 h-4" />, color: 'bg-green-500' },
  { category: 'martial_arts', label: 'Martial Arts', icon: <Target className="w-4 h-4" />, color: 'bg-slate-500' },
  { category: 'flexibility', label: 'Flexibility', icon: <Heart className="w-4 h-4" />, color: 'bg-indigo-500' },
];

const ROOMS = ['Studio A', 'Studio B', 'Main Gym Floor', 'Pool Area', 'Spin Room', 'Yoga Studio', 'Outdoor Area'];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

// Column configurations
const CLASS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Class Name', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'instructorName', header: 'Instructor', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'room', header: 'Room', type: 'string' },
  { key: 'currentEnrollment', header: 'Enrolled', type: 'number' },
  { key: 'maxCapacity', header: 'Capacity', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
];

const REGISTRATION_COLUMNS: ColumnConfig[] = [
  { key: 'memberName', header: 'Member', type: 'string' },
  { key: 'memberEmail', header: 'Email', type: 'string' },
  { key: 'registeredAt', header: 'Registered', type: 'date' },
  { key: 'attended', header: 'Attended', type: 'boolean' },
  { key: 'isWaitlist', header: 'Waitlist', type: 'boolean' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

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
  return `${hour12}:${minutes} ${ampm}`;
};

const getWeekDates = (baseDate: Date) => {
  const dates = [];
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const DEFAULT_INSTRUCTORS: Instructor[] = [
  { id: 'inst1', name: 'Sarah Johnson', specialties: ['yoga', 'pilates'], email: 'sarah@gym.com', phone: '555-0101', bio: 'Certified yoga instructor with 10 years experience', rating: 4.9, classesThisWeek: 8 },
  { id: 'inst2', name: 'Mike Thompson', specialties: ['strength', 'hiit'], email: 'mike@gym.com', phone: '555-0102', bio: 'Former professional athlete and certified trainer', rating: 4.8, classesThisWeek: 10 },
  { id: 'inst3', name: 'Emily Chen', specialties: ['dance', 'cardio'], email: 'emily@gym.com', phone: '555-0103', bio: 'Dance choreographer and fitness enthusiast', rating: 4.7, classesThisWeek: 6 },
  { id: 'inst4', name: 'David Miller', specialties: ['cycling', 'cardio'], email: 'david@gym.com', phone: '555-0104', bio: 'Spin class specialist and cycling coach', rating: 4.6, classesThisWeek: 12 },
  { id: 'inst5', name: 'Lisa Park', specialties: ['swimming', 'flexibility'], email: 'lisa@gym.com', phone: '555-0105', bio: 'Olympic swimmer and aquatics instructor', rating: 4.9, classesThisWeek: 5 },
];

export const FitnessClassScheduleTool: React.FC<FitnessClassScheduleToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: classes,
    addItem: addClassToBackend,
    updateItem: updateClassBackend,
    deleteItem: deleteClassBackend,
    isSynced: classesSynced,
    isSaving: classesSaving,
    lastSaved: classesLastSaved,
    syncError: classesSyncError,
    forceSync: forceClassesSync,
  } = useToolData<FitnessClass>('fitness-classes', [], CLASS_COLUMNS);

  const {
    data: registrations,
    addItem: addRegistrationToBackend,
    deleteItem: deleteRegistrationBackend,
  } = useToolData<ClassRegistration>('class-registrations', [], REGISTRATION_COLUMNS);

  // Local UI state
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'instructors'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<FitnessClass | null>(null);
  const [filterCategory, setFilterCategory] = useState<ClassCategory | 'all'>('all');
  const [filterInstructor, setFilterInstructor] = useState<string>('all');
  const [instructors] = useState<Instructor[]>(DEFAULT_INSTRUCTORS);

  // New class form state
  const [newClass, setNewClass] = useState<Partial<FitnessClass>>({
    name: '',
    description: '',
    category: 'strength',
    level: 'all_levels',
    instructorId: '',
    room: 'Studio A',
    startTime: '09:00',
    duration: 60,
    maxCapacity: 20,
    recurring: false,
    recurringDays: [],
    equipmentNeeded: [],
    notes: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.className || params.category) {
        setNewClass({
          ...newClass,
          name: params.className || '',
          category: params.category || 'strength',
          description: params.description || '',
        });
        setShowClassForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Get week dates for calendar view
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesCategory = filterCategory === 'all' || cls.category === filterCategory;
      const matchesInstructor = filterInstructor === 'all' || cls.instructorId === filterInstructor;
      return matchesCategory && matchesInstructor;
    });
  }, [classes, filterCategory, filterInstructor]);

  // Classes for current week view
  const weekClasses = useMemo(() => {
    const startOfWeek = weekDates[0];
    const endOfWeek = weekDates[6];

    return filteredClasses.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate >= startOfWeek && classDate <= endOfWeek;
    });
  }, [filteredClasses, weekDates]);

  // Get classes for a specific day
  const getClassesForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return weekClasses.filter(cls => cls.date.split('T')[0] === dateStr);
  };

  // Calculate end time
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Add new class
  const addClass = () => {
    if (!newClass.name || !newClass.instructorId) {
      setValidationMessage('Please fill in required fields (Class Name, Instructor)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const instructor = instructors.find(i => i.id === newClass.instructorId);
    const endTime = calculateEndTime(newClass.startTime || '09:00', newClass.duration || 60);

    const fitnessClass: FitnessClass = {
      id: generateId(),
      name: newClass.name || '',
      description: newClass.description || '',
      category: newClass.category || 'strength',
      level: newClass.level || 'all_levels',
      instructorId: newClass.instructorId || '',
      instructorName: instructor?.name || '',
      room: newClass.room || 'Studio A',
      date: selectedDate.toISOString().split('T')[0],
      startTime: newClass.startTime || '09:00',
      endTime,
      duration: newClass.duration || 60,
      maxCapacity: newClass.maxCapacity || 20,
      currentEnrollment: 0,
      waitlistCount: 0,
      status: 'scheduled',
      recurring: newClass.recurring ?? false,
      recurringDays: newClass.recurringDays || [],
      equipmentNeeded: newClass.equipmentNeeded || [],
      notes: newClass.notes || '',
      createdAt: new Date().toISOString(),
    };

    addClassToBackend(fitnessClass);
    resetForm();
  };

  // Update class
  const updateClass = () => {
    if (!editingClass) return;
    const instructor = instructors.find(i => i.id === editingClass.instructorId);
    const endTime = calculateEndTime(editingClass.startTime, editingClass.duration);

    updateClassBackend(editingClass.id, {
      ...editingClass,
      instructorName: instructor?.name || editingClass.instructorName,
      endTime,
    });
    setEditingClass(null);
    setShowClassForm(false);
  };

  // Delete class
  const deleteClass = async (classId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this class?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteClassBackend(classId);
      registrations.filter(r => r.classId === classId).forEach(r => {
        deleteRegistrationBackend(r.id);
      });
    }
  };

  // Cancel class
  const cancelClass = async (classId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Cancellation',
      message: 'Are you sure you want to cancel this class?',
      confirmText: 'Cancel Class',
      cancelText: 'Keep Class',
      variant: 'danger',
    });
    if (confirmed) {
      updateClassBackend(classId, { status: 'cancelled' });
    }
  };

  // Reset form
  const resetForm = () => {
    setShowClassForm(false);
    setEditingClass(null);
    setNewClass({
      name: '',
      description: '',
      category: 'strength',
      level: 'all_levels',
      instructorId: '',
      room: 'Studio A',
      startTime: '09:00',
      duration: 60,
      maxCapacity: 20,
      recurring: false,
      recurringDays: [],
      equipmentNeeded: [],
      notes: '',
    });
  };

  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  // Analytics
  const analytics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayClasses = classes.filter(c => c.date.split('T')[0] === today);
    const totalRegistrations = registrations.length;
    const avgCapacity = classes.length > 0
      ? Math.round(classes.reduce((sum, c) => sum + (c.currentEnrollment / c.maxCapacity) * 100, 0) / classes.length)
      : 0;

    return {
      totalClasses: classes.length,
      todayClasses: todayClasses.length,
      totalRegistrations,
      avgCapacity,
    };
  }, [classes, registrations]);

  const getCategoryInfo = (category: ClassCategory) => {
    return CLASS_CATEGORIES.find(c => c.category === category) || CLASS_CATEGORIES[0];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.fitnessClassSchedule.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.fitnessClassSchedule.fitnessClassScheduler', 'Fitness Class Scheduler')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.fitnessClassSchedule.scheduleClassesManageInstructorsAnd', 'Schedule classes, manage instructors, and track attendance')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="fitness-class-schedule" toolName="Fitness Class Schedule" />

              <SyncStatus
                isSynced={classesSynced}
                isSaving={classesSaving}
                lastSaved={classesLastSaved}
                syncError={classesSyncError}
                onForceSync={forceClassesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(classes, CLASS_COLUMNS, { filename: 'fitness-classes' })}
                onExportExcel={() => exportToExcel(classes, CLASS_COLUMNS, { filename: 'fitness-classes' })}
                onExportJSON={() => exportToJSON(classes, { filename: 'fitness-classes' })}
                onExportPDF={async () => {
                  await exportToPDF(classes, CLASS_COLUMNS, {
                    filename: 'fitness-classes',
                    title: 'Fitness Class Schedule',
                    subtitle: `${analytics.totalClasses} total classes`,
                  });
                }}
                onPrint={() => printData(classes, CLASS_COLUMNS, { title: 'Class Schedule' })}
                onCopyToClipboard={() => copyUtil(classes, CLASS_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              {[
                { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
                { id: 'list', label: 'List View', icon: <Filter className="w-4 h-4" /> },
                { id: 'instructors', label: 'Instructors', icon: <Users className="w-4 h-4" /> },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as typeof activeView)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {view.icon}
                  {view.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowClassForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.fitnessClassSchedule.addClass', 'Add Class')}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Classes', value: analytics.totalClasses, icon: <Calendar className="w-5 h-5" />, color: 'bg-blue-500' },
            { label: 'Classes Today', value: analytics.todayClasses, icon: <Clock className="w-5 h-5" />, color: 'bg-green-500' },
            { label: 'Total Registrations', value: analytics.totalRegistrations, icon: <Users className="w-5 h-5" />, color: 'bg-purple-500' },
            { label: 'Avg Capacity', value: `${analytics.avgCapacity}%`, icon: <Target className="w-5 h-5" />, color: 'bg-orange-500' },
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

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ClassCategory | 'all')}
            className={`px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="all">{t('tools.fitnessClassSchedule.allCategories', 'All Categories')}</option>
            {CLASS_CATEGORIES.map(cat => (
              <option key={cat.category} value={cat.category}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filterInstructor}
            onChange={(e) => setFilterInstructor(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="all">{t('tools.fitnessClassSchedule.allInstructors', 'All Instructors')}</option>
            {instructors.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>

        {/* Class Form Modal */}
        {showClassForm && (
          <Card className={`mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>{editingClass ? t('tools.fitnessClassSchedule.editClass', 'Edit Class') : t('tools.fitnessClassSchedule.addNewClass', 'Add New Class')}</span>
                <button onClick={resetForm} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fitnessClassSchedule.className', 'Class Name *')}
                  </label>
                  <input
                    type="text"
                    value={editingClass?.name ?? newClass.name}
                    onChange={(e) => editingClass
                      ? setEditingClass({ ...editingClass, name: e.target.value })
                      : setNewClass({ ...newClass, name: e.target.value })
                    }
                    placeholder={t('tools.fitnessClassSchedule.eGMorningYogaFlow', 'e.g., Morning Yoga Flow')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fitnessClassSchedule.category', 'Category')}
                  </label>
                  <select
                    value={editingClass?.category ?? newClass.category}
                    onChange={(e) => editingClass
                      ? setEditingClass({ ...editingClass, category: e.target.value as ClassCategory })
                      : setNewClass({ ...newClass, category: e.target.value as ClassCategory })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {CLASS_CATEGORIES.map(cat => (
                      <option key={cat.category} value={cat.category}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fitnessClassSchedule.instructor', 'Instructor *')}
                  </label>
                  <select
                    value={editingClass?.instructorId ?? newClass.instructorId}
                    onChange={(e) => editingClass
                      ? setEditingClass({ ...editingClass, instructorId: e.target.value })
                      : setNewClass({ ...newClass, instructorId: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.fitnessClassSchedule.selectInstructor', 'Select instructor...')}</option>
                    {instructors.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fitnessClassSchedule.room', 'Room')}
                  </label>
                  <select
                    value={editingClass?.room ?? newClass.room}
                    onChange={(e) => editingClass
                      ? setEditingClass({ ...editingClass, room: e.target.value })
                      : setNewClass({ ...newClass, room: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {ROOMS.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fitnessClassSchedule.startTime', 'Start Time')}
                  </label>
                  <select
                    value={editingClass?.startTime ?? newClass.startTime}
                    onChange={(e) => editingClass
                      ? setEditingClass({ ...editingClass, startTime: e.target.value })
                      : setNewClass({ ...newClass, startTime: e.target.value })
                    }
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
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fitnessClassSchedule.durationMinutes', 'Duration (minutes)')}
                  </label>
                  <select
                    value={editingClass?.duration ?? newClass.duration}
                    onChange={(e) => editingClass
                      ? setEditingClass({ ...editingClass, duration: parseInt(e.target.value) })
                      : setNewClass({ ...newClass, duration: parseInt(e.target.value) })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fitnessClassSchedule.maxCapacity', 'Max Capacity')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingClass?.maxCapacity ?? newClass.maxCapacity}
                    onChange={(e) => editingClass
                      ? setEditingClass({ ...editingClass, maxCapacity: parseInt(e.target.value) })
                      : setNewClass({ ...newClass, maxCapacity: parseInt(e.target.value) })
                    }
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
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.fitnessClassSchedule.cancel', 'Cancel')}
                </button>
                <button
                  onClick={editingClass ? updateClass : addClass}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E]"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {editingClass ? t('tools.fitnessClassSchedule.update', 'Update') : t('tools.fitnessClassSchedule.add', 'Add')} Class
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.fitnessClassSchedule.weeklySchedule', 'Weekly Schedule')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-3 py-1 text-sm bg-[#0D9488] text-white rounded-lg"
                  >
                    {t('tools.fitnessClassSchedule.today', 'Today')}
                  </button>
                  <button
                    onClick={() => navigateWeek('next')}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weekDates.map((date, index) => {
                  const dayClasses = getClassesForDay(date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <div key={index} className="min-h-[200px]">
                      <div className={`text-center p-2 rounded-t-lg ${
                        isToday
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <p className="text-xs font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="text-lg font-bold">{date.getDate()}</p>
                      </div>
                      <div className={`border-x border-b rounded-b-lg p-2 space-y-2 ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {dayClasses.length === 0 ? (
                          <p className={`text-xs text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t('tools.fitnessClassSchedule.noClasses', 'No classes')}
                          </p>
                        ) : (
                          dayClasses.map(cls => {
                            const catInfo = getCategoryInfo(cls.category);
                            return (
                              <div
                                key={cls.id}
                                onClick={() => { setEditingClass(cls); setShowClassForm(true); }}
                                className={`p-2 rounded-lg cursor-pointer ${catInfo.color} bg-opacity-20 hover:bg-opacity-30 transition-colors`}
                              >
                                <p className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {cls.name}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {formatTime(cls.startTime)}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {cls.currentEnrollment}/{cls.maxCapacity}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* List View */}
        {activeView === 'list' && (
          <div className="space-y-3">
            {filteredClasses.length === 0 ? (
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardContent className="p-8 text-center">
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tools.fitnessClassSchedule.noClassesScheduledAddYour', 'No classes scheduled. Add your first class to get started!')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredClasses.map(cls => {
                const catInfo = getCategoryInfo(cls.category);
                return (
                  <Card key={cls.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${catInfo.color} text-white`}>
                            {catInfo.icon}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {cls.name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                <User className="w-3 h-3 inline mr-1" />
                                {cls.instructorName}
                              </span>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {cls.room}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(cls.date)}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingClass(cls); setShowClassForm(true); }}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteClass(cls.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Instructors View */}
        {activeView === 'instructors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instructors.map(instructor => (
              <Card key={instructor.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <User className={`w-7 h-7 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {instructor.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {instructor.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {instructor.specialties.map(spec => {
                      const catInfo = getCategoryInfo(spec);
                      return (
                        <span
                          key={spec}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${catInfo.color} text-white`}
                        >
                          {catInfo.label}
                        </span>
                      );
                    })}
                  </div>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {instructor.bio}
                  </p>
                  <div className={`pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {t('tools.fitnessClassSchedule.classesThisWeek', 'Classes this week')}
                      </span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {instructor.classesThisWeek}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className={`fixed bottom-4 right-4 max-w-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            theme === 'dark'
              ? 'bg-red-900/20 border border-red-500/30 text-red-300'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{validationMessage}</span>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default FitnessClassScheduleTool;
