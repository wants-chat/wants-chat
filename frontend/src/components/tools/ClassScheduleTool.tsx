'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Save,
  Users,
  Clock,
  MapPin,
  Search,
  Filter,
  User,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  UserPlus,
  UserMinus,
  CheckCircle,
  AlertCircle,
  Dumbbell,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ClassScheduleToolProps {
  uiConfig?: UIConfig;
}

// Types
interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  bio: string;
  imageUrl: string;
  isActive: boolean;
}

interface Class {
  id: string;
  name: string;
  description: string;
  type: ClassType;
  instructorId: string;
  room: string;
  duration: number; // in minutes
  capacity: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  equipment: string[];
  imageUrl: string;
  isActive: boolean;
}

interface ScheduleSlot {
  id: string;
  classId: string;
  instructorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:MM format
  endTime: string;
  room: string;
  isRecurring: boolean;
  specificDate?: string; // For non-recurring classes
}

interface Enrollment {
  id: string;
  scheduleSlotId: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  enrollmentDate: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  notes: string;
}

type ClassType =
  | 'Yoga'
  | 'Pilates'
  | 'Spin'
  | 'HIIT'
  | 'Strength'
  | 'Dance'
  | 'Swimming'
  | 'Boxing'
  | 'CrossFit'
  | 'Zumba'
  | 'Barre'
  | 'Meditation'
  | 'Martial Arts'
  | 'Other';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

type TabType = 'schedule' | 'classes' | 'instructors' | 'enrollments';

const CLASS_TYPES: ClassType[] = [
  'Yoga',
  'Pilates',
  'Spin',
  'HIIT',
  'Strength',
  'Dance',
  'Swimming',
  'Boxing',
  'CrossFit',
  'Zumba',
  'Barre',
  'Meditation',
  'Martial Arts',
  'Other',
];

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const;

// Column configurations for exports
const CLASS_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Class Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'instructorName', header: 'Instructor', type: 'string' },
  { key: 'room', header: 'Room', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'level', header: 'Level', type: 'string' },
  { key: 'equipment', header: 'Equipment', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
];

const INSTRUCTOR_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'specialties', header: 'Specialties', type: 'string' },
  { key: 'bio', header: 'Bio', type: 'string' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
];

const SCHEDULE_COLUMNS: ColumnConfig[] = [
  { key: 'className', header: 'Class', type: 'string' },
  { key: 'instructorName', header: 'Instructor', type: 'string' },
  { key: 'dayOfWeek', header: 'Day', type: 'string' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'room', header: 'Room', type: 'string' },
  { key: 'isRecurring', header: 'Recurring', type: 'boolean' },
  { key: 'enrolledCount', header: 'Enrolled', type: 'number' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
];

const ENROLLMENT_COLUMNS: ColumnConfig[] = [
  { key: 'participantName', header: 'Participant', type: 'string' },
  { key: 'participantEmail', header: 'Email', type: 'string' },
  { key: 'participantPhone', header: 'Phone', type: 'string' },
  { key: 'className', header: 'Class', type: 'string' },
  { key: 'dayOfWeek', header: 'Day', type: 'string' },
  { key: 'startTime', header: 'Time', type: 'string' },
  { key: 'enrollmentDate', header: 'Enrollment Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

const STORAGE_KEY = 'class-schedule-data';

// Sample data generator
const generateSampleData = () => {
  const instructors: Instructor[] = [
    {
      id: 'inst-1',
      name: 'Sarah Johnson',
      email: 'sarah@studio.com',
      phone: '555-0101',
      specialties: ['Yoga', 'Pilates', 'Meditation'],
      bio: 'Certified yoga instructor with 10+ years experience',
      imageUrl: '',
      isActive: true,
    },
    {
      id: 'inst-2',
      name: 'Mike Chen',
      email: 'mike@studio.com',
      phone: '555-0102',
      specialties: ['HIIT', 'CrossFit', 'Strength'],
      bio: 'Former athlete and personal trainer',
      imageUrl: '',
      isActive: true,
    },
    {
      id: 'inst-3',
      name: 'Emily Davis',
      email: 'emily@studio.com',
      phone: '555-0103',
      specialties: ['Spin', 'Dance', 'Zumba'],
      bio: 'Dance and cardio enthusiast',
      imageUrl: '',
      isActive: true,
    },
  ];

  const classes: Class[] = [
    {
      id: 'class-1',
      name: 'Morning Vinyasa Flow',
      description: 'Start your day with an energizing yoga flow',
      type: 'Yoga',
      instructorId: 'inst-1',
      room: 'Studio A',
      duration: 60,
      capacity: 20,
      level: 'All Levels',
      equipment: ['Yoga mat', 'Blocks', 'Strap'],
      imageUrl: '',
      isActive: true,
    },
    {
      id: 'class-2',
      name: 'Power HIIT',
      description: 'High-intensity interval training for maximum results',
      type: 'HIIT',
      instructorId: 'inst-2',
      room: 'Studio B',
      duration: 45,
      capacity: 15,
      level: 'Intermediate',
      equipment: ['Dumbbells', 'Kettlebells', 'Jump rope'],
      imageUrl: '',
      isActive: true,
    },
    {
      id: 'class-3',
      name: 'Spin & Sweat',
      description: 'Cardio-intensive cycling class with great music',
      type: 'Spin',
      instructorId: 'inst-3',
      room: 'Spin Room',
      duration: 45,
      capacity: 25,
      level: 'All Levels',
      equipment: ['Spin bike'],
      imageUrl: '',
      isActive: true,
    },
  ];

  const scheduleSlots: ScheduleSlot[] = [
    {
      id: 'slot-1',
      classId: 'class-1',
      instructorId: 'inst-1',
      dayOfWeek: 'Monday',
      startTime: '07:00',
      endTime: '08:00',
      room: 'Studio A',
      isRecurring: true,
    },
    {
      id: 'slot-2',
      classId: 'class-2',
      instructorId: 'inst-2',
      dayOfWeek: 'Monday',
      startTime: '18:00',
      endTime: '18:45',
      room: 'Studio B',
      isRecurring: true,
    },
    {
      id: 'slot-3',
      classId: 'class-3',
      instructorId: 'inst-3',
      dayOfWeek: 'Wednesday',
      startTime: '06:30',
      endTime: '07:15',
      room: 'Spin Room',
      isRecurring: true,
    },
  ];

  const enrollments: Enrollment[] = [
    {
      id: 'enroll-1',
      scheduleSlotId: 'slot-1',
      participantName: 'John Smith',
      participantEmail: 'john@email.com',
      participantPhone: '555-1001',
      enrollmentDate: new Date().toISOString(),
      status: 'confirmed',
      notes: '',
    },
    {
      id: 'enroll-2',
      scheduleSlotId: 'slot-1',
      participantName: 'Jane Doe',
      participantEmail: 'jane@email.com',
      participantPhone: '555-1002',
      enrollmentDate: new Date().toISOString(),
      status: 'confirmed',
      notes: 'First-time student',
    },
  ];

  return { instructors, classes, scheduleSlots, enrollments };
};

export const ClassScheduleTool: React.FC<ClassScheduleToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize sample data
  const sampleData = generateSampleData();

  // Backend sync with useToolData hook
  const instructorsHook = useToolData<Instructor>('class-schedule-instructors', sampleData.instructors, INSTRUCTOR_COLUMNS);
  const classesHook = useToolData<Class>('class-schedule-classes', sampleData.classes, CLASS_COLUMNS);
  const scheduleSlotsHook = useToolData<ScheduleSlot>('class-schedule-slots', sampleData.scheduleSlots, SCHEDULE_COLUMNS);
  const enrollmentsHook = useToolData<Enrollment>('class-schedule-enrollments', sampleData.enrollments, ENROLLMENT_COLUMNS);

  // Convenience aliases for data
  const instructors = instructorsHook.data;
  const classes = classesHook.data;
  const scheduleSlots = scheduleSlotsHook.data;
  const enrollments = enrollmentsHook.data;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ClassType | 'all'>('all');
  const [filterInstructor, setFilterInstructor] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<DayOfWeek | 'all'>('all');

  // Form states
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);

  const [showClassForm, setShowClassForm] = useState(false);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

  // New item forms
  const [newClass, setNewClass] = useState<Partial<Class>>({
    name: '',
    description: '',
    type: 'Yoga',
    instructorId: '',
    room: '',
    duration: 60,
    capacity: 20,
    level: 'All Levels',
    equipment: [],
    imageUrl: '',
    isActive: true,
  });

  const [newInstructor, setNewInstructor] = useState<Partial<Instructor>>({
    name: '',
    email: '',
    phone: '',
    specialties: [],
    bio: '',
    imageUrl: '',
    isActive: true,
  });

  const [newSlot, setNewSlot] = useState<Partial<ScheduleSlot>>({
    classId: '',
    instructorId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    isRecurring: true,
  });

  const [newEnrollment, setNewEnrollment] = useState<Partial<Enrollment>>({
    scheduleSlotId: '',
    participantName: '',
    participantEmail: '',
    participantPhone: '',
    status: 'confirmed',
    notes: '',
  });

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    schedule: true,
    classes: true,
    instructors: true,
    enrollments: true,
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.description) {
        setNewClass(prev => ({
          ...prev,
          name: params.title || prev.name,
          description: params.description || prev.description,
        }));
        setShowClassForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Computed values
  const filteredScheduleSlots = useMemo(() => {
    return scheduleSlots.filter(slot => {
      const classInfo = classes.find(c => c.id === slot.classId);
      const instructor = instructors.find(i => i.id === slot.instructorId);

      if (filterDay !== 'all' && slot.dayOfWeek !== filterDay) return false;
      if (filterType !== 'all' && classInfo?.type !== filterType) return false;
      if (filterInstructor !== 'all' && slot.instructorId !== filterInstructor) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          classInfo?.name.toLowerCase().includes(search) ||
          instructor?.name.toLowerCase().includes(search) ||
          slot.room.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [scheduleSlots, classes, instructors, filterDay, filterType, filterInstructor, searchTerm]);

  const getEnrollmentCount = (slotId: string) => {
    return enrollments.filter(e => e.scheduleSlotId === slotId && e.status === 'confirmed').length;
  };

  const getWaitlistCount = (slotId: string) => {
    return enrollments.filter(e => e.scheduleSlotId === slotId && e.status === 'waitlist').length;
  };

  // Handlers
  const handleAddClass = () => {
    if (!newClass.name || !newClass.type) return;

    const classItem: Class = {
      id: `class-${Date.now()}`,
      name: newClass.name || '',
      description: newClass.description || '',
      type: newClass.type as ClassType || 'Other',
      instructorId: newClass.instructorId || '',
      room: newClass.room || '',
      duration: newClass.duration || 60,
      capacity: newClass.capacity || 20,
      level: newClass.level as Class['level'] || 'All Levels',
      equipment: newClass.equipment || [],
      imageUrl: newClass.imageUrl || '',
      isActive: newClass.isActive ?? true,
    };

    classesHook.addItem(classItem);
    setNewClass({
      name: '',
      description: '',
      type: 'Yoga',
      instructorId: '',
      room: '',
      duration: 60,
      capacity: 20,
      level: 'All Levels',
      equipment: [],
      imageUrl: '',
      isActive: true,
    });
    setShowClassForm(false);
  };

  const handleUpdateClass = () => {
    if (!editingClass) return;
    classesHook.updateItem(editingClass.id, editingClass);
    setEditingClass(null);
  };

  const handleDeleteClass = (id: string) => {
    classesHook.deleteItem(id);
    scheduleSlotsHook.setData(prev => prev.filter(s => s.classId !== id));
  };

  const handleAddInstructor = () => {
    if (!newInstructor.name || !newInstructor.email) return;

    const instructor: Instructor = {
      id: `inst-${Date.now()}`,
      name: newInstructor.name || '',
      email: newInstructor.email || '',
      phone: newInstructor.phone || '',
      specialties: newInstructor.specialties || [],
      bio: newInstructor.bio || '',
      imageUrl: newInstructor.imageUrl || '',
      isActive: newInstructor.isActive ?? true,
    };

    instructorsHook.addItem(instructor);
    setNewInstructor({
      name: '',
      email: '',
      phone: '',
      specialties: [],
      bio: '',
      imageUrl: '',
      isActive: true,
    });
    setShowInstructorForm(false);
  };

  const handleUpdateInstructor = () => {
    if (!editingInstructor) return;
    instructorsHook.updateItem(editingInstructor.id, editingInstructor);
    setEditingInstructor(null);
  };

  const handleDeleteInstructor = (id: string) => {
    instructorsHook.deleteItem(id);
  };

  const handleAddSlot = () => {
    if (!newSlot.classId || !newSlot.startTime) return;

    const classInfo = classes.find(c => c.id === newSlot.classId);
    const slot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      classId: newSlot.classId || '',
      instructorId: newSlot.instructorId || classInfo?.instructorId || '',
      dayOfWeek: newSlot.dayOfWeek as DayOfWeek || 'Monday',
      startTime: newSlot.startTime || '09:00',
      endTime: newSlot.endTime || '10:00',
      room: newSlot.room || classInfo?.room || '',
      isRecurring: newSlot.isRecurring ?? true,
      specificDate: newSlot.specificDate,
    };

    scheduleSlotsHook.addItem(slot);
    setNewSlot({
      classId: '',
      instructorId: '',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      isRecurring: true,
    });
    setShowSlotForm(false);
  };

  const handleUpdateSlot = () => {
    if (!editingSlot) return;
    scheduleSlotsHook.updateItem(editingSlot.id, editingSlot);
    setEditingSlot(null);
  };

  const handleDeleteSlot = (id: string) => {
    scheduleSlotsHook.deleteItem(id);
    enrollmentsHook.setData(prev => prev.filter(e => e.scheduleSlotId !== id));
  };

  const handleAddEnrollment = () => {
    if (!newEnrollment.scheduleSlotId || !newEnrollment.participantName) return;

    const slot = scheduleSlots.find(s => s.id === newEnrollment.scheduleSlotId);
    const classInfo = classes.find(c => c.id === slot?.classId);
    const confirmedCount = getEnrollmentCount(newEnrollment.scheduleSlotId);

    const enrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      scheduleSlotId: newEnrollment.scheduleSlotId || '',
      participantName: newEnrollment.participantName || '',
      participantEmail: newEnrollment.participantEmail || '',
      participantPhone: newEnrollment.participantPhone || '',
      enrollmentDate: new Date().toISOString(),
      status: confirmedCount >= (classInfo?.capacity || 0) ? 'waitlist' : 'confirmed',
      notes: newEnrollment.notes || '',
    };

    enrollmentsHook.addItem(enrollment);
    setNewEnrollment({
      scheduleSlotId: '',
      participantName: '',
      participantEmail: '',
      participantPhone: '',
      status: 'confirmed',
      notes: '',
    });
    setShowEnrollmentForm(false);
  };

  const handleUpdateEnrollment = () => {
    if (!editingEnrollment) return;
    enrollmentsHook.updateItem(editingEnrollment.id, editingEnrollment);
    setEditingEnrollment(null);
  };

  const handleDeleteEnrollment = (id: string) => {
    enrollmentsHook.deleteItem(id);
  };

  const handlePromoteFromWaitlist = (slotId: string) => {
    const slot = scheduleSlots.find(s => s.id === slotId);
    const classInfo = classes.find(c => c.id === slot?.classId);
    const confirmedCount = getEnrollmentCount(slotId);

    if (confirmedCount < (classInfo?.capacity || 0)) {
      const waitlistEntries = enrollments
        .filter(e => e.scheduleSlotId === slotId && e.status === 'waitlist')
        .sort((a, b) => new Date(a.enrollmentDate).getTime() - new Date(b.enrollmentDate).getTime());

      if (waitlistEntries.length > 0) {
        enrollmentsHook.updateItem(waitlistEntries[0].id, { status: 'confirmed' });
      }
    }
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Data',
      message: 'Are you sure you want to reset all data? This will load sample data.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      const sampleData = generateSampleData();
      instructorsHook.resetToDefault(sampleData.instructors);
      classesHook.resetToDefault(sampleData.classes);
      scheduleSlotsHook.resetToDefault(sampleData.scheduleSlots);
      enrollmentsHook.resetToDefault(sampleData.enrollments);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate end time based on duration
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Input class styling
  const inputClass = `w-full px-4 py-2.5 border ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
  } rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;

  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`;

  // Tab buttons
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'classes', label: 'Classes', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'instructors', label: 'Instructors', icon: <User className="w-4 h-4" /> },
    { id: 'enrollments', label: 'Enrollments', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.classSchedule.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                <Calendar className="w-6 h-6 text-[#0D9488]" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.classSchedule.classScheduleManager', 'Class Schedule Manager')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.classSchedule.manageClassesInstructorsAndEnrollments', 'Manage classes, instructors, and enrollments')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ExportDropdown
                onExportCSV={() => {
                  // Export based on active tab
                  if (activeTab === 'schedule') {
                    const enrichedSlots = filteredScheduleSlots.map(slot => {
                      const classInfo = classes.find(c => c.id === slot.classId);
                      const instructor = instructors.find(i => i.id === slot.instructorId);
                      return {
                        ...slot,
                        className: classInfo?.name || '',
                        instructorName: instructor?.name || '',
                        enrolledCount: getEnrollmentCount(slot.id),
                        capacity: classInfo?.capacity || 0,
                      };
                    });
                    exportToCSV(enrichedSlots, SCHEDULE_COLUMNS, { filename: 'class-schedule' });
                  } else if (activeTab === 'classes') {
                    const enrichedClasses = classes.map(c => ({
                      ...c,
                      instructorName: instructors.find(i => i.id === c.instructorId)?.name || '',
                      equipment: c.equipment.join(', '),
                    }));
                    exportToCSV(enrichedClasses, CLASS_COLUMNS, { filename: 'classes' });
                  } else if (activeTab === 'instructors') {
                    const enrichedInstructors = instructors.map(i => ({
                      ...i,
                      specialties: i.specialties.join(', '),
                    }));
                    exportToCSV(enrichedInstructors, INSTRUCTOR_COLUMNS, { filename: 'instructors' });
                  } else if (activeTab === 'enrollments') {
                    const enrichedEnrollments = enrollments.map(e => {
                      const slot = scheduleSlots.find(s => s.id === e.scheduleSlotId);
                      const classInfo = classes.find(c => c.id === slot?.classId);
                      return {
                        ...e,
                        className: classInfo?.name || '',
                        dayOfWeek: slot?.dayOfWeek || '',
                        startTime: slot?.startTime || '',
                      };
                    });
                    exportToCSV(enrichedEnrollments, ENROLLMENT_COLUMNS, { filename: 'enrollments' });
                  }
                }}
                onExportExcel={() => {
                  if (activeTab === 'schedule') {
                    const enrichedSlots = filteredScheduleSlots.map(slot => {
                      const classInfo = classes.find(c => c.id === slot.classId);
                      const instructor = instructors.find(i => i.id === slot.instructorId);
                      return {
                        ...slot,
                        className: classInfo?.name || '',
                        instructorName: instructor?.name || '',
                        enrolledCount: getEnrollmentCount(slot.id),
                        capacity: classInfo?.capacity || 0,
                      };
                    });
                    exportToExcel(enrichedSlots, SCHEDULE_COLUMNS, { filename: 'class-schedule' });
                  } else if (activeTab === 'classes') {
                    const enrichedClasses = classes.map(c => ({
                      ...c,
                      instructorName: instructors.find(i => i.id === c.instructorId)?.name || '',
                      equipment: c.equipment.join(', '),
                    }));
                    exportToExcel(enrichedClasses, CLASS_COLUMNS, { filename: 'classes' });
                  } else if (activeTab === 'instructors') {
                    const enrichedInstructors = instructors.map(i => ({
                      ...i,
                      specialties: i.specialties.join(', '),
                    }));
                    exportToExcel(enrichedInstructors, INSTRUCTOR_COLUMNS, { filename: 'instructors' });
                  } else if (activeTab === 'enrollments') {
                    const enrichedEnrollments = enrollments.map(e => {
                      const slot = scheduleSlots.find(s => s.id === e.scheduleSlotId);
                      const classInfo = classes.find(c => c.id === slot?.classId);
                      return {
                        ...e,
                        className: classInfo?.name || '',
                        dayOfWeek: slot?.dayOfWeek || '',
                        startTime: slot?.startTime || '',
                      };
                    });
                    exportToExcel(enrichedEnrollments, ENROLLMENT_COLUMNS, { filename: 'enrollments' });
                  }
                }}
                onExportJSON={() => {
                  if (activeTab === 'schedule') {
                    exportToJSON(filteredScheduleSlots, { filename: 'class-schedule' });
                  } else if (activeTab === 'classes') {
                    exportToJSON(classes, { filename: 'classes' });
                  } else if (activeTab === 'instructors') {
                    exportToJSON(instructors, { filename: 'instructors' });
                  } else if (activeTab === 'enrollments') {
                    exportToJSON(enrollments, { filename: 'enrollments' });
                  }
                }}
                onExportPDF={async () => {
                  const tabTitles = {
                    schedule: 'Class Schedule',
                    classes: 'Classes',
                    instructors: 'Instructors',
                    enrollments: 'Enrollments',
                  };
                  if (activeTab === 'schedule') {
                    const enrichedSlots = filteredScheduleSlots.map(slot => {
                      const classInfo = classes.find(c => c.id === slot.classId);
                      const instructor = instructors.find(i => i.id === slot.instructorId);
                      return {
                        ...slot,
                        className: classInfo?.name || '',
                        instructorName: instructor?.name || '',
                        enrolledCount: getEnrollmentCount(slot.id),
                        capacity: classInfo?.capacity || 0,
                      };
                    });
                    await exportToPDF(enrichedSlots, SCHEDULE_COLUMNS, {
                      filename: 'class-schedule',
                      title: tabTitles.schedule,
                      orientation: 'landscape',
                    });
                  } else if (activeTab === 'classes') {
                    const enrichedClasses = classes.map(c => ({
                      ...c,
                      instructorName: instructors.find(i => i.id === c.instructorId)?.name || '',
                      equipment: c.equipment.join(', '),
                    }));
                    await exportToPDF(enrichedClasses, CLASS_COLUMNS, {
                      filename: 'classes',
                      title: tabTitles.classes,
                      orientation: 'landscape',
                    });
                  } else if (activeTab === 'instructors') {
                    const enrichedInstructors = instructors.map(i => ({
                      ...i,
                      specialties: i.specialties.join(', '),
                    }));
                    await exportToPDF(enrichedInstructors, INSTRUCTOR_COLUMNS, {
                      filename: 'instructors',
                      title: tabTitles.instructors,
                    });
                  } else if (activeTab === 'enrollments') {
                    const enrichedEnrollments = enrollments.map(e => {
                      const slot = scheduleSlots.find(s => s.id === e.scheduleSlotId);
                      const classInfo = classes.find(c => c.id === slot?.classId);
                      return {
                        ...e,
                        className: classInfo?.name || '',
                        dayOfWeek: slot?.dayOfWeek || '',
                        startTime: slot?.startTime || '',
                      };
                    });
                    await exportToPDF(enrichedEnrollments, ENROLLMENT_COLUMNS, {
                      filename: 'enrollments',
                      title: tabTitles.enrollments,
                      orientation: 'landscape',
                    });
                  }
                }}
                onPrint={() => {
                  const tabTitles = {
                    schedule: 'Class Schedule',
                    classes: 'Classes',
                    instructors: 'Instructors',
                    enrollments: 'Enrollments',
                  };
                  if (activeTab === 'schedule') {
                    const enrichedSlots = filteredScheduleSlots.map(slot => {
                      const classInfo = classes.find(c => c.id === slot.classId);
                      const instructor = instructors.find(i => i.id === slot.instructorId);
                      return {
                        ...slot,
                        className: classInfo?.name || '',
                        instructorName: instructor?.name || '',
                        enrolledCount: getEnrollmentCount(slot.id),
                        capacity: classInfo?.capacity || 0,
                      };
                    });
                    printData(enrichedSlots, SCHEDULE_COLUMNS, { title: tabTitles.schedule });
                  } else if (activeTab === 'classes') {
                    const enrichedClasses = classes.map(c => ({
                      ...c,
                      instructorName: instructors.find(i => i.id === c.instructorId)?.name || '',
                      equipment: c.equipment.join(', '),
                    }));
                    printData(enrichedClasses, CLASS_COLUMNS, { title: tabTitles.classes });
                  } else if (activeTab === 'instructors') {
                    const enrichedInstructors = instructors.map(i => ({
                      ...i,
                      specialties: i.specialties.join(', '),
                    }));
                    printData(enrichedInstructors, INSTRUCTOR_COLUMNS, { title: tabTitles.instructors });
                  } else if (activeTab === 'enrollments') {
                    const enrichedEnrollments = enrollments.map(e => {
                      const slot = scheduleSlots.find(s => s.id === e.scheduleSlotId);
                      const classInfo = classes.find(c => c.id === slot?.classId);
                      return {
                        ...e,
                        className: classInfo?.name || '',
                        dayOfWeek: slot?.dayOfWeek || '',
                        startTime: slot?.startTime || '',
                      };
                    });
                    printData(enrichedEnrollments, ENROLLMENT_COLUMNS, { title: tabTitles.enrollments });
                  }
                }}
                onCopyToClipboard={async () => {
                  if (activeTab === 'schedule') {
                    const enrichedSlots = filteredScheduleSlots.map(slot => {
                      const classInfo = classes.find(c => c.id === slot.classId);
                      const instructor = instructors.find(i => i.id === slot.instructorId);
                      return {
                        ...slot,
                        className: classInfo?.name || '',
                        instructorName: instructor?.name || '',
                        enrolledCount: getEnrollmentCount(slot.id),
                        capacity: classInfo?.capacity || 0,
                      };
                    });
                    return copyUtil(enrichedSlots, SCHEDULE_COLUMNS);
                  } else if (activeTab === 'classes') {
                    const enrichedClasses = classes.map(c => ({
                      ...c,
                      instructorName: instructors.find(i => i.id === c.instructorId)?.name || '',
                      equipment: c.equipment.join(', '),
                    }));
                    return copyUtil(enrichedClasses, CLASS_COLUMNS);
                  } else if (activeTab === 'instructors') {
                    const enrichedInstructors = instructors.map(i => ({
                      ...i,
                      specialties: i.specialties.join(', '),
                    }));
                    return copyUtil(enrichedInstructors, INSTRUCTOR_COLUMNS);
                  } else if (activeTab === 'enrollments') {
                    const enrichedEnrollments = enrollments.map(e => {
                      const slot = scheduleSlots.find(s => s.id === e.scheduleSlotId);
                      const classInfo = classes.find(c => c.id === slot?.classId);
                      return {
                        ...e,
                        className: classInfo?.name || '',
                        dayOfWeek: slot?.dayOfWeek || '',
                        startTime: slot?.startTime || '',
                      };
                    });
                    return copyUtil(enrichedEnrollments, ENROLLMENT_COLUMNS);
                  }
                  return false;
                }}
                showImport={false}
                theme={isDark ? 'dark' : 'light'}
              />
              <WidgetEmbedButton toolSlug="class-schedule" toolName="Class Schedule" />

              <SyncStatus
                isSynced={classesHook.isSynced && instructorsHook.isSynced && scheduleSlotsHook.isSynced && enrollmentsHook.isSynced}
                isSaving={classesHook.isSaving || instructorsHook.isSaving || scheduleSlotsHook.isSaving || enrollmentsHook.isSaving}
                lastSaved={classesHook.lastSaved || instructorsHook.lastSaved || scheduleSlotsHook.lastSaved || enrollmentsHook.lastSaved}
                syncError={classesHook.syncError || instructorsHook.syncError || scheduleSlotsHook.syncError || enrollmentsHook.syncError}
                onForceSync={async () => {
                  await Promise.all([
                    classesHook.forceSync(),
                    instructorsHook.forceSync(),
                    scheduleSlotsHook.forceSync(),
                    enrollmentsHook.forceSync(),
                  ]);
                }}
                theme={isDark ? 'dark' : 'light'}
                showLabel={true}
              />
              <button
                onClick={handleReset}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                  isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.classSchedule.reset', 'Reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Dumbbell className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.classSchedule.classes', 'Classes')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {classes.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <User className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.classSchedule.instructors', 'Instructors')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {instructors.filter(i => i.isActive).length}
              </p>
            </div>
          </div>
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.classSchedule.scheduled', 'Scheduled')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {scheduleSlots.length}
              </p>
            </div>
          </div>
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.classSchedule.enrollments', 'Enrollments')}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {enrollments.filter(e => e.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={cardClass}>
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : isDark
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

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className={cardClass}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder={t('tools.classSchedule.searchClassesInstructors', 'Search classes, instructors...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value as DayOfWeek | 'all')}
                  className={inputClass}
                >
                  <option value="all">{t('tools.classSchedule.allDays', 'All Days')}</option>
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ClassType | 'all')}
                  className={inputClass}
                >
                  <option value="all">{t('tools.classSchedule.allTypes', 'All Types')}</option>
                  {CLASS_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={filterInstructor}
                  onChange={(e) => setFilterInstructor(e.target.value)}
                  className={inputClass}
                >
                  <option value="all">{t('tools.classSchedule.allInstructors', 'All Instructors')}</option>
                  {instructors.filter(i => i.isActive).map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Schedule Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowSlotForm(!showSlotForm)}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg flex items-center gap-2 hover:bg-[#0B8276] transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.classSchedule.addClassToSchedule', 'Add Class to Schedule')}
              </button>
            </div>

            {/* Add Slot Form */}
            {showSlotForm && (
              <div className={cardClass}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.classSchedule.addToSchedule', 'Add to Schedule')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.class', 'Class *')}
                    </label>
                    <select
                      value={newSlot.classId}
                      onChange={(e) => {
                        const classInfo = classes.find(c => c.id === e.target.value);
                        setNewSlot({
                          ...newSlot,
                          classId: e.target.value,
                          instructorId: classInfo?.instructorId || '',
                          room: classInfo?.room || '',
                          endTime: calculateEndTime(newSlot.startTime || '09:00', classInfo?.duration || 60),
                        });
                      }}
                      className={inputClass}
                    >
                      <option value="">{t('tools.classSchedule.selectClass', 'Select class...')}</option>
                      {classes.filter(c => c.isActive).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.instructor', 'Instructor')}
                    </label>
                    <select
                      value={newSlot.instructorId}
                      onChange={(e) => setNewSlot({ ...newSlot, instructorId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.classSchedule.selectInstructor', 'Select instructor...')}</option>
                      {instructors.filter(i => i.isActive).map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.dayOfWeek', 'Day of Week *')}
                    </label>
                    <select
                      value={newSlot.dayOfWeek}
                      onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: e.target.value as DayOfWeek })}
                      className={inputClass}
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.startTime', 'Start Time *')}
                    </label>
                    <select
                      value={newSlot.startTime}
                      onChange={(e) => {
                        const classInfo = classes.find(c => c.id === newSlot.classId);
                        setNewSlot({
                          ...newSlot,
                          startTime: e.target.value,
                          endTime: calculateEndTime(e.target.value, classInfo?.duration || 60),
                        });
                      }}
                      className={inputClass}
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.endTime', 'End Time')}
                    </label>
                    <input
                      type="text"
                      value={newSlot.endTime}
                      readOnly
                      className={`${inputClass} opacity-70`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.room', 'Room')}
                    </label>
                    <input
                      type="text"
                      value={newSlot.room}
                      onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                      placeholder={t('tools.classSchedule.eGStudioA', 'e.g., Studio A')}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={newSlot.isRecurring}
                    onChange={(e) => setNewSlot({ ...newSlot, isRecurring: e.target.checked })}
                    className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                  />
                  <label htmlFor="recurring" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.recurringWeekly', 'Recurring weekly')}
                  </label>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAddSlot}
                    disabled={!newSlot.classId || !newSlot.startTime}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.classSchedule.addToSchedule2', 'Add to Schedule')}
                  </button>
                  <button
                    onClick={() => setShowSlotForm(false)}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.classSchedule.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Schedule Grid by Day */}
            <div className="space-y-4">
              {DAYS_OF_WEEK.map(day => {
                const daySlots = filteredScheduleSlots
                  .filter(slot => slot.dayOfWeek === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                if (daySlots.length === 0) return null;

                return (
                  <div key={day} className={cardClass}>
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection(day)}
                    >
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {day} <span className="text-sm font-normal text-gray-500">({daySlots.length} classes)</span>
                      </h3>
                      {expandedSections[day] !== false ? (
                        <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      )}
                    </div>
                    {expandedSections[day] !== false && (
                      <div className="mt-4 space-y-3">
                        {daySlots.map(slot => {
                          const classInfo = classes.find(c => c.id === slot.classId);
                          const instructor = instructors.find(i => i.id === slot.instructorId);
                          const enrolled = getEnrollmentCount(slot.id);
                          const waitlist = getWaitlistCount(slot.id);
                          const isFull = enrolled >= (classInfo?.capacity || 0);

                          return (
                            <div
                              key={slot.id}
                              className={`p-4 rounded-xl border ${
                                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between flex-wrap gap-4">
                                <div className="flex items-start gap-4">
                                  <div className={`p-3 rounded-lg ${
                                    isDark ? 'bg-gray-600' : 'bg-gray-200'
                                  }`}>
                                    <Clock className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {classInfo?.name || 'Unknown Class'}
                                      </h4>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                      }`}>
                                        {classInfo?.type}
                                      </span>
                                      {isFull && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                          {t('tools.classSchedule.full', 'Full')}
                                        </span>
                                      )}
                                    </div>
                                    <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <span className="flex items-center gap-4 flex-wrap">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {slot.startTime} - {slot.endTime}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <User className="w-4 h-4" />
                                          {instructor?.name || 'TBD'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          {slot.room}
                                        </span>
                                      </span>
                                    </div>
                                    <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <span className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                          <Users className="w-4 h-4" />
                                          {enrolled}/{classInfo?.capacity || 0} enrolled
                                        </span>
                                        {waitlist > 0 && (
                                          <span className="flex items-center gap-1 text-orange-500">
                                            <AlertCircle className="w-4 h-4" />
                                            {waitlist} on waitlist
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setNewEnrollment({ ...newEnrollment, scheduleSlotId: slot.id });
                                      setShowEnrollmentForm(true);
                                      setActiveTab('enrollments');
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${
                                      isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                                    }`}
                                    title={t('tools.classSchedule.enrollParticipant2', 'Enroll participant')}
                                  >
                                    <UserPlus className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingSlot(slot)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                                    }`}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredScheduleSlots.length === 0 && (
                <div className={`${cardClass} text-center py-12`}>
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.classSchedule.noClassesScheduledAddA', 'No classes scheduled. Add a class to the schedule to get started.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowClassForm(!showClassForm)}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg flex items-center gap-2 hover:bg-[#0B8276] transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.classSchedule.addClass', 'Add Class')}
              </button>
            </div>

            {/* Add Class Form */}
            {showClassForm && (
              <div className={cardClass}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.classSchedule.addNewClass', 'Add New Class')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.className', 'Class Name *')}
                    </label>
                    <input
                      type="text"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                      placeholder={t('tools.classSchedule.eGMorningYoga', 'e.g., Morning Yoga')}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.classType', 'Class Type *')}
                    </label>
                    <select
                      value={newClass.type}
                      onChange={(e) => setNewClass({ ...newClass, type: e.target.value as ClassType })}
                      className={inputClass}
                    >
                      {CLASS_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.description', 'Description')}
                    </label>
                    <textarea
                      value={newClass.description}
                      onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                      placeholder={t('tools.classSchedule.describeTheClass', 'Describe the class...')}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.defaultInstructor', 'Default Instructor')}
                    </label>
                    <select
                      value={newClass.instructorId}
                      onChange={(e) => setNewClass({ ...newClass, instructorId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.classSchedule.selectInstructor2', 'Select instructor...')}</option>
                      {instructors.filter(i => i.isActive).map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.defaultRoom', 'Default Room')}
                    </label>
                    <input
                      type="text"
                      value={newClass.room}
                      onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                      placeholder={t('tools.classSchedule.eGStudioA2', 'e.g., Studio A')}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.durationMinutes', 'Duration (minutes)')}
                    </label>
                    <input
                      type="number"
                      value={newClass.duration}
                      onChange={(e) => setNewClass({ ...newClass, duration: parseInt(e.target.value) || 60 })}
                      min="15"
                      step="15"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.capacity', 'Capacity')}
                    </label>
                    <input
                      type="number"
                      value={newClass.capacity}
                      onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) || 20 })}
                      min="1"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.level', 'Level')}
                    </label>
                    <select
                      value={newClass.level}
                      onChange={(e) => setNewClass({ ...newClass, level: e.target.value as Class['level'] })}
                      className={inputClass}
                    >
                      {LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.equipmentCommaSeparated', 'Equipment (comma-separated)')}
                    </label>
                    <input
                      type="text"
                      value={(newClass.equipment || []).join(', ')}
                      onChange={(e) => setNewClass({ ...newClass, equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder={t('tools.classSchedule.eGYogaMatBlocks', 'e.g., Yoga mat, Blocks, Strap')}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAddClass}
                    disabled={!newClass.name || !newClass.type}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.classSchedule.addClass2', 'Add Class')}
                  </button>
                  <button
                    onClick={() => setShowClassForm(false)}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.classSchedule.cancel2', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Classes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(classItem => {
                const instructor = instructors.find(i => i.id === classItem.instructorId);
                const scheduledCount = scheduleSlots.filter(s => s.classId === classItem.id).length;

                return (
                  <div
                    key={classItem.id}
                    className={`${cardClass} ${!classItem.isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {classItem.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {classItem.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingClass(classItem)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(classItem.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {classItem.name}
                    </h4>
                    <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {classItem.description || 'No description'}
                    </p>
                    <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{instructor?.name || 'No instructor assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{classItem.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Capacity: {classItem.capacity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{classItem.room || 'No room assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{scheduledCount} scheduled sessions</span>
                      </div>
                    </div>
                    {classItem.equipment && classItem.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {classItem.equipment.map((item, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {classes.length === 0 && (
                <div className={`${cardClass} col-span-full text-center py-12`}>
                  <Dumbbell className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.classSchedule.noClassesCreatedYetAdd', 'No classes created yet. Add a class to get started.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructors Tab */}
        {activeTab === 'instructors' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowInstructorForm(!showInstructorForm)}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg flex items-center gap-2 hover:bg-[#0B8276] transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.classSchedule.addInstructor', 'Add Instructor')}
              </button>
            </div>

            {/* Add Instructor Form */}
            {showInstructorForm && (
              <div className={cardClass}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.classSchedule.addNewInstructor', 'Add New Instructor')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.name', 'Name *')}
                    </label>
                    <input
                      type="text"
                      value={newInstructor.name}
                      onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                      placeholder={t('tools.classSchedule.fullName', 'Full name')}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.email', 'Email *')}
                    </label>
                    <input
                      type="email"
                      value={newInstructor.email}
                      onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                      placeholder={t('tools.classSchedule.emailExampleCom', 'email@example.com')}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newInstructor.phone}
                      onChange={(e) => setNewInstructor({ ...newInstructor, phone: e.target.value })}
                      placeholder="555-0100"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.specialties', 'Specialties')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CLASS_TYPES.map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            const specialties = newInstructor.specialties || [];
                            const newSpecialties = specialties.includes(type)
                              ? specialties.filter(s => s !== type)
                              : [...specialties, type];
                            setNewInstructor({ ...newInstructor, specialties: newSpecialties });
                          }}
                          className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                            (newInstructor.specialties || []).includes(type)
                              ? 'bg-[#0D9488] text-white'
                              : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.bio', 'Bio')}
                    </label>
                    <textarea
                      value={newInstructor.bio}
                      onChange={(e) => setNewInstructor({ ...newInstructor, bio: e.target.value })}
                      placeholder={t('tools.classSchedule.briefBio', 'Brief bio...')}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAddInstructor}
                    disabled={!newInstructor.name || !newInstructor.email}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.classSchedule.addInstructor2', 'Add Instructor')}
                  </button>
                  <button
                    onClick={() => setShowInstructorForm(false)}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.classSchedule.cancel3', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Instructors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {instructors.map(instructor => {
                const classCount = classes.filter(c => c.instructorId === instructor.id).length;
                const scheduleCount = scheduleSlots.filter(s => s.instructorId === instructor.id).length;

                return (
                  <div
                    key={instructor.id}
                    className={`${cardClass} ${!instructor.isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {instructor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingInstructor(instructor)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInstructor(instructor.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {instructor.name}
                    </h4>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {instructor.email}
                    </p>
                    {instructor.phone && (
                      <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {instructor.phone}
                      </p>
                    )}
                    {instructor.bio && (
                      <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {instructor.bio}
                      </p>
                    )}
                    <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>{classCount} classes assigned</span>
                      <span className="mx-2">|</span>
                      <span>{scheduleCount} scheduled sessions</span>
                    </div>
                    {instructor.specialties && instructor.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {instructor.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {instructors.length === 0 && (
                <div className={`${cardClass} col-span-full text-center py-12`}>
                  <User className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.classSchedule.noInstructorsAddedYetAdd', 'No instructors added yet. Add an instructor to get started.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowEnrollmentForm(!showEnrollmentForm)}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg flex items-center gap-2 hover:bg-[#0B8276] transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('tools.classSchedule.addEnrollment', 'Add Enrollment')}
              </button>
            </div>

            {/* Add Enrollment Form */}
            {showEnrollmentForm && (
              <div className={cardClass}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.classSchedule.enrollParticipant', 'Enroll Participant')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.classSession', 'Class Session *')}
                    </label>
                    <select
                      value={newEnrollment.scheduleSlotId}
                      onChange={(e) => setNewEnrollment({ ...newEnrollment, scheduleSlotId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">{t('tools.classSchedule.selectClassSession', 'Select class session...')}</option>
                      {scheduleSlots.map(slot => {
                        const classInfo = classes.find(c => c.id === slot.classId);
                        const enrolled = getEnrollmentCount(slot.id);
                        return (
                          <option key={slot.id} value={slot.id}>
                            {classInfo?.name} - {slot.dayOfWeek} {slot.startTime} ({enrolled}/{classInfo?.capacity || 0})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.participantName', 'Participant Name *')}
                    </label>
                    <input
                      type="text"
                      value={newEnrollment.participantName}
                      onChange={(e) => setNewEnrollment({ ...newEnrollment, participantName: e.target.value })}
                      placeholder={t('tools.classSchedule.fullName2', 'Full name')}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.email2', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={newEnrollment.participantEmail}
                      onChange={(e) => setNewEnrollment({ ...newEnrollment, participantEmail: e.target.value })}
                      placeholder={t('tools.classSchedule.emailExampleCom2', 'email@example.com')}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.phone2', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newEnrollment.participantPhone}
                      onChange={(e) => setNewEnrollment({ ...newEnrollment, participantPhone: e.target.value })}
                      placeholder="555-0100"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.classSchedule.notes', 'Notes')}
                    </label>
                    <input
                      type="text"
                      value={newEnrollment.notes}
                      onChange={(e) => setNewEnrollment({ ...newEnrollment, notes: e.target.value })}
                      placeholder={t('tools.classSchedule.anySpecialNotes', 'Any special notes...')}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAddEnrollment}
                    disabled={!newEnrollment.scheduleSlotId || !newEnrollment.participantName}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    {t('tools.classSchedule.enroll', 'Enroll')}
                  </button>
                  <button
                    onClick={() => setShowEnrollmentForm(false)}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.classSchedule.cancel4', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Enrollments by Class */}
            <div className="space-y-4">
              {scheduleSlots.map(slot => {
                const classInfo = classes.find(c => c.id === slot.classId);
                const instructor = instructors.find(i => i.id === slot.instructorId);
                const slotEnrollments = enrollments.filter(e => e.scheduleSlotId === slot.id);
                const confirmed = slotEnrollments.filter(e => e.status === 'confirmed');
                const waitlist = slotEnrollments.filter(e => e.status === 'waitlist');

                if (slotEnrollments.length === 0) return null;

                return (
                  <div key={slot.id} className={cardClass}>
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection(`enrollment-${slot.id}`)}
                    >
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {classInfo?.name || 'Unknown Class'} - {slot.dayOfWeek} {slot.startTime}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {instructor?.name} | {slot.room} | {confirmed.length}/{classInfo?.capacity || 0} enrolled
                          {waitlist.length > 0 && ` | ${waitlist.length} on waitlist`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {waitlist.length > 0 && confirmed.length < (classInfo?.capacity || 0) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePromoteFromWaitlist(slot.id);
                            }}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                          >
                            {t('tools.classSchedule.promoteFromWaitlist', 'Promote from waitlist')}
                          </button>
                        )}
                        {expandedSections[`enrollment-${slot.id}`] !== false ? (
                          <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        ) : (
                          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </div>
                    </div>
                    {expandedSections[`enrollment-${slot.id}`] !== false && (
                      <div className="mt-4 space-y-2">
                        {slotEnrollments
                          .sort((a, b) => {
                            if (a.status === b.status) return 0;
                            if (a.status === 'confirmed') return -1;
                            if (b.status === 'confirmed') return 1;
                            if (a.status === 'waitlist') return -1;
                            return 1;
                          })
                          .map(enrollment => (
                            <div
                              key={enrollment.id}
                              className={`p-3 rounded-lg flex items-center justify-between ${
                                isDark ? 'bg-gray-700' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                  enrollment.status === 'confirmed'
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : enrollment.status === 'waitlist'
                                    ? 'bg-orange-100 dark:bg-orange-900/30'
                                    : 'bg-gray-100 dark:bg-gray-600'
                                }`}>
                                  {enrollment.status === 'confirmed' ? (
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  ) : enrollment.status === 'waitlist' ? (
                                    <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                  ) : (
                                    <UserMinus className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>
                                <div>
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {enrollment.participantName}
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {enrollment.participantEmail}
                                    {enrollment.notes && ` - ${enrollment.notes}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  enrollment.status === 'confirmed'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : enrollment.status === 'waitlist'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                }`}>
                                  {enrollment.status}
                                </span>
                                <button
                                  onClick={() => setEditingEnrollment(enrollment)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                                  }`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEnrollment(enrollment.id)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {enrollments.length === 0 && (
                <div className={`${cardClass} text-center py-12`}>
                  <Users className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {t('tools.classSchedule.noEnrollmentsYetAddParticipants', 'No enrollments yet. Add participants to class sessions.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Modals */}
        {editingClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.classSchedule.editClass', 'Edit Class')}
                </h3>
                <button
                  onClick={() => setEditingClass(null)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.className2', 'Class Name')}
                  </label>
                  <input
                    type="text"
                    value={editingClass.name}
                    onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.classType2', 'Class Type')}
                  </label>
                  <select
                    value={editingClass.type}
                    onChange={(e) => setEditingClass({ ...editingClass, type: e.target.value as ClassType })}
                    className={inputClass}
                  >
                    {CLASS_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.description2', 'Description')}
                  </label>
                  <textarea
                    value={editingClass.description}
                    onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
                    rows={2}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.durationMinutes2', 'Duration (minutes)')}
                  </label>
                  <input
                    type="number"
                    value={editingClass.duration}
                    onChange={(e) => setEditingClass({ ...editingClass, duration: parseInt(e.target.value) || 60 })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.capacity2', 'Capacity')}
                  </label>
                  <input
                    type="number"
                    value={editingClass.capacity}
                    onChange={(e) => setEditingClass({ ...editingClass, capacity: parseInt(e.target.value) || 20 })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="class-active"
                  checked={editingClass.isActive}
                  onChange={(e) => setEditingClass({ ...editingClass, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                />
                <label htmlFor="class-active" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.classSchedule.active', 'Active')}
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleUpdateClass}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t('tools.classSchedule.saveChanges', 'Save Changes')}
                </button>
                <button
                  onClick={() => setEditingClass(null)}
                  className={`px-6 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('tools.classSchedule.cancel5', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingInstructor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.classSchedule.editInstructor', 'Edit Instructor')}
                </h3>
                <button
                  onClick={() => setEditingInstructor(null)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.name2', 'Name')}
                  </label>
                  <input
                    type="text"
                    value={editingInstructor.name}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.email3', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={editingInstructor.email}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.phone3', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={editingInstructor.phone}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.bio2', 'Bio')}
                  </label>
                  <textarea
                    value={editingInstructor.bio}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, bio: e.target.value })}
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="instructor-active"
                  checked={editingInstructor.isActive}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488]"
                />
                <label htmlFor="instructor-active" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.classSchedule.active2', 'Active')}
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleUpdateInstructor}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t('tools.classSchedule.saveChanges2', 'Save Changes')}
                </button>
                <button
                  onClick={() => setEditingInstructor(null)}
                  className={`px-6 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('tools.classSchedule.cancel6', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingSlot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.classSchedule.editScheduleSlot', 'Edit Schedule Slot')}
                </h3>
                <button
                  onClick={() => setEditingSlot(null)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.dayOfWeek2', 'Day of Week')}
                  </label>
                  <select
                    value={editingSlot.dayOfWeek}
                    onChange={(e) => setEditingSlot({ ...editingSlot, dayOfWeek: e.target.value as DayOfWeek })}
                    className={inputClass}
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.startTime2', 'Start Time')}
                  </label>
                  <select
                    value={editingSlot.startTime}
                    onChange={(e) => {
                      const classInfo = classes.find(c => c.id === editingSlot.classId);
                      setEditingSlot({
                        ...editingSlot,
                        startTime: e.target.value,
                        endTime: calculateEndTime(e.target.value, classInfo?.duration || 60),
                      });
                    }}
                    className={inputClass}
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.room2', 'Room')}
                  </label>
                  <input
                    type="text"
                    value={editingSlot.room}
                    onChange={(e) => setEditingSlot({ ...editingSlot, room: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.instructor2', 'Instructor')}
                  </label>
                  <select
                    value={editingSlot.instructorId}
                    onChange={(e) => setEditingSlot({ ...editingSlot, instructorId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">{t('tools.classSchedule.selectInstructor3', 'Select instructor...')}</option>
                    {instructors.filter(i => i.isActive).map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleUpdateSlot}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t('tools.classSchedule.saveChanges3', 'Save Changes')}
                </button>
                <button
                  onClick={() => setEditingSlot(null)}
                  className={`px-6 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('tools.classSchedule.cancel7', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingEnrollment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardClass} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.classSchedule.editEnrollment', 'Edit Enrollment')}
                </h3>
                <button
                  onClick={() => setEditingEnrollment(null)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.participantName2', 'Participant Name')}
                  </label>
                  <input
                    type="text"
                    value={editingEnrollment.participantName}
                    onChange={(e) => setEditingEnrollment({ ...editingEnrollment, participantName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.email4', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={editingEnrollment.participantEmail}
                    onChange={(e) => setEditingEnrollment({ ...editingEnrollment, participantEmail: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.phone4', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={editingEnrollment.participantPhone}
                    onChange={(e) => setEditingEnrollment({ ...editingEnrollment, participantPhone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.status', 'Status')}
                  </label>
                  <select
                    value={editingEnrollment.status}
                    onChange={(e) => setEditingEnrollment({ ...editingEnrollment, status: e.target.value as Enrollment['status'] })}
                    className={inputClass}
                  >
                    <option value="confirmed">{t('tools.classSchedule.confirmed', 'Confirmed')}</option>
                    <option value="waitlist">{t('tools.classSchedule.waitlist', 'Waitlist')}</option>
                    <option value="cancelled">{t('tools.classSchedule.cancelled', 'Cancelled')}</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.classSchedule.notes2', 'Notes')}
                  </label>
                  <input
                    type="text"
                    value={editingEnrollment.notes}
                    onChange={(e) => setEditingEnrollment({ ...editingEnrollment, notes: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleUpdateEnrollment}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t('tools.classSchedule.saveChanges4', 'Save Changes')}
                </button>
                <button
                  onClick={() => setEditingEnrollment(null)}
                  className={`px-6 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('tools.classSchedule.cancel8', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default ClassScheduleTool;
