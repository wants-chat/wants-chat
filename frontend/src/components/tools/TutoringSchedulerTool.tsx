'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';
import {
  GraduationCap,
  Users,
  Calendar,
  Clock,
  DollarSign,
  BookOpen,
  ClipboardList,
  Bell,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Video,
  Phone,
  Mail,
  User,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Save,
  Loader2,
} from 'lucide-react';

// Types
interface Student {
  id: string;
  name: string;
  grade: string;
  subjects: string[];
  email: string;
  phone: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  notes: string;
  createdAt: string;
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  hourlyRate: number;
  availability: TutorAvailability[];
  bio: string;
}

interface TutorAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

interface Session {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  locationType: 'online' | 'in-person';
  location?: string;
  isRecurring: boolean;
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly';
  recurringEndDate?: string;
  rate: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  progressNotes: string;
  assignments: Assignment[];
  reminderSet: boolean;
  reminderTime?: number; // minutes before session
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'reviewed';
  feedback?: string;
}

interface PackageDeal {
  id: string;
  name: string;
  sessions: number;
  pricePerSession: number;
  totalPrice: number;
  validDays: number;
}

type TabType = 'dashboard' | 'students' | 'tutors' | 'sessions' | 'schedule' | 'packages';
type ModalType = 'student' | 'tutor' | 'session' | 'package' | 'assignment' | 'notes' | null;

// Combined data structure for backend sync
interface TutoringData {
  id: string;
  students: Student[];
  tutors: Tutor[];
  sessions: Session[];
  packages: PackageDeal[];
}

// Column configuration for exports (combined data export)
const TUTORING_COLUMNS: ColumnConfig[] = [
  { key: 'type', header: 'Data Type', type: 'string' },
  { key: 'count', header: 'Count', type: 'number' },
  { key: 'updatedAt', header: 'Last Updated', type: 'date' },
];

const SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Computer Science',
  'French',
  'Spanish',
  'German',
  'Music',
  'Art',
  'Economics',
  'Accounting',
];

const GRADES = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'College',
  'University',
  'Adult',
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Export column configurations
const SESSION_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'studentName', header: 'Student' },
  { key: 'tutorName', header: 'Tutor' },
  { key: 'subject', header: 'Subject' },
  { key: 'startTime', header: 'Start Time' },
  { key: 'endTime', header: 'End Time' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'locationType', header: 'Location Type' },
  { key: 'location', header: 'Location' },
  { key: 'rate', header: 'Rate', type: 'currency' },
  { key: 'status', header: 'Status' },
  { key: 'paymentStatus', header: 'Payment Status' },
  { key: 'isRecurring', header: 'Recurring', type: 'boolean' },
  { key: 'recurringPattern', header: 'Recurring Pattern' },
  { key: 'progressNotes', header: 'Progress Notes' },
];

const STUDENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name' },
  { key: 'grade', header: 'Grade' },
  { key: 'subjects', header: 'Subjects' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'parentName', header: 'Parent Name' },
  { key: 'parentEmail', header: 'Parent Email' },
  { key: 'parentPhone', header: 'Parent Phone' },
  { key: 'notes', header: 'Notes' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

const TUTOR_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'subjects', header: 'Subjects' },
  { key: 'hourlyRate', header: 'Hourly Rate', type: 'currency' },
  { key: 'bio', header: 'Bio' },
];

const PACKAGE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Package Name' },
  { key: 'sessions', header: 'Sessions', type: 'number' },
  { key: 'pricePerSession', header: 'Price Per Session', type: 'currency' },
  { key: 'totalPrice', header: 'Total Price', type: 'currency' },
  { key: 'validDays', header: 'Valid Days', type: 'number' },
];

interface TutoringSchedulerToolProps {
  uiConfig?: UIConfig;
}

export const TutoringSchedulerTool = ({ uiConfig }: TutoringSchedulerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: tutoringDataArray,
    setData: setTutoringDataArray,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<TutoringData>('tutoring-scheduler', [], TUTORING_COLUMNS);

  // Extract or initialize the data from the hook
  // We store a single TutoringData object in the array
  const tutoringData = tutoringDataArray[0] || {
    id: 'main',
    students: [],
    tutors: [],
    sessions: [],
    packages: [],
  };

  // Helper to update the tutoring data
  const updateTutoringData = (updates: Partial<TutoringData>) => {
    const newData = { ...tutoringData, ...updates };
    if (tutoringDataArray.length === 0) {
      addItem(newData);
    } else {
      updateItem('main', updates);
    }
  };

  // Derive individual data arrays from the combined data
  const students = tutoringData.students || [];
  const tutors = tutoringData.tutors || [];
  const sessions = tutoringData.sessions || [];
  const packages = tutoringData.packages || [];

  // Setters that update the combined data
  const setStudents = (newStudents: Student[] | ((prev: Student[]) => Student[])) => {
    const updatedStudents = typeof newStudents === 'function' ? newStudents(students) : newStudents;
    updateTutoringData({ students: updatedStudents });
  };

  const setTutors = (newTutors: Tutor[] | ((prev: Tutor[]) => Tutor[])) => {
    const updatedTutors = typeof newTutors === 'function' ? newTutors(tutors) : newTutors;
    updateTutoringData({ tutors: updatedTutors });
  };

  const setSessions = (newSessions: Session[] | ((prev: Session[]) => Session[])) => {
    const updatedSessions = typeof newSessions === 'function' ? newSessions(sessions) : newSessions;
    updateTutoringData({ sessions: updatedSessions });
  };

  const setPackages = (newPackages: PackageDeal[] | ((prev: PackageDeal[]) => PackageDeal[])) => {
    const updatedPackages = typeof newPackages === 'function' ? newPackages(packages) : newPackages;
    updateTutoringData({ packages: updatedPackages });
  };

  // State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<Student | Tutor | Session | PackageDeal | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));

  // Form states
  const [studentForm, setStudentForm] = useState<Partial<Student>>({});
  const [tutorForm, setTutorForm] = useState<Partial<Tutor>>({ availability: [] });
  const [sessionForm, setSessionForm] = useState<Partial<Session>>({ assignments: [] });
  const [packageForm, setPackageForm] = useState<Partial<PackageDeal>>({});
  const [assignmentForm, setAssignmentForm] = useState<Partial<Assignment>>({});
  const [progressNotes, setProgressNotes] = useState('');

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.studentName) {
        setStudentForm(prev => ({ ...prev, name: params.studentName as string }));
        hasChanges = true;
      }
      if (params.subject) {
        hasChanges = true;
      }
      if (params.date) {
        setSessionForm(prev => ({ ...prev, date: params.date as string }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Helper functions
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  // Computed values
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((s) => new Date(s.date) >= now && s.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [sessions]);

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentWeekStart]);

  const weekSessions = useMemo(() => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return sessionDate >= currentWeekStart && sessionDate < weekEnd;
    });
  }, [sessions, currentWeekStart]);

  const totalEarnings = useMemo(() => {
    return sessions
      .filter((s) => s.status === 'completed' && s.paymentStatus === 'paid')
      .reduce((sum, s) => sum + s.rate * (s.duration / 60), 0);
  }, [sessions]);

  const pendingPayments = useMemo(() => {
    return sessions
      .filter((s) => s.status === 'completed' && s.paymentStatus !== 'paid')
      .reduce((sum, s) => sum + s.rate * (s.duration / 60), 0);
  }, [sessions]);

  // Export data preparation - enrich sessions with student/tutor names
  const getExportData = () => {
    return sessions.map((session) => {
      const student = students.find((s) => s.id === session.studentId);
      const tutor = tutors.find((t) => t.id === session.tutorId);
      return {
        ...session,
        studentName: student?.name || 'Unknown',
        tutorName: tutor?.name || 'Unknown',
        subjects: Array.isArray(session.subject) ? session.subject.join(', ') : session.subject,
      };
    });
  };

  const getStudentExportData = () => {
    return students.map((student) => ({
      ...student,
      subjects: Array.isArray(student.subjects) ? student.subjects.join(', ') : student.subjects,
    }));
  };

  const getTutorExportData = () => {
    return tutors.map((tutor) => ({
      ...tutor,
      subjects: Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects,
    }));
  };

  // Export handlers - use hook's export functions with enriched session data
  const handleExportCSV = () => {
    // For CSV export, we export the enriched session data
    const enrichedData = getExportData();
    // Use the hook's exportCSV but we need to set data temporarily
    // Since the hook exports the tutoring data structure, we'll manually export sessions
    const csvContent = [
      SESSION_COLUMNS.map(c => c.header).join(','),
      ...enrichedData.map(row =>
        SESSION_COLUMNS.map(c => {
          const val = row[c.key as keyof typeof row];
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tutoring_sessions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    // Export enriched session data as CSV (Excel compatible)
    handleExportCSV();
  };

  const handleExportJSON = () => {
    // Export all tutoring data including students, tutors, sessions, packages
    const exportData = {
      students,
      tutors,
      sessions: getExportData(),
      packages,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tutoring_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'tutoring_sessions',
      title: 'Tutoring Scheduler Report',
      subtitle: `${students.length} students, ${tutors.length} tutors, ${sessions.length} sessions`,
    });
  };

  const handleCopyToClipboard = async () => {
    const data = getExportData();
    const text = [
      SESSION_COLUMNS.map(c => c.header).join('\t'),
      ...data.map(row =>
        SESSION_COLUMNS.map(c => row[c.key as keyof typeof row] ?? '').join('\t')
      )
    ].join('\n');

    await navigator.clipboard.writeText(text);
    return true;
  };

  const handlePrint = () => {
    print('Tutoring Scheduler');
  };

  const handleImportJSON = async (file: File) => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      if (importedData.students) {
        setStudents([...students, ...importedData.students]);
      }
      if (importedData.tutors) {
        setTutors([...tutors, ...importedData.tutors]);
      }
      if (importedData.sessions) {
        setSessions([...sessions, ...importedData.sessions]);
      }
      if (importedData.packages) {
        setPackages([...packages, ...importedData.packages]);
      }
    } catch (e) {
      console.error('Error importing JSON:', e);
    }
  };

  // CRUD Operations
  const handleSaveStudent = () => {
    if (!studentForm.name || !studentForm.email) return;

    const student: Student = {
      id: editingItem?.id || generateId(),
      name: studentForm.name || '',
      grade: studentForm.grade || '',
      subjects: studentForm.subjects || [],
      email: studentForm.email || '',
      phone: studentForm.phone || '',
      parentName: studentForm.parentName || '',
      parentEmail: studentForm.parentEmail || '',
      parentPhone: studentForm.parentPhone || '',
      notes: studentForm.notes || '',
      createdAt: (editingItem as Student)?.createdAt || new Date().toISOString(),
    };

    if (editingItem) {
      setStudents(students.map((s) => (s.id === student.id ? student : s)));
    } else {
      setStudents([...students, student]);
    }

    setModalType(null);
    setStudentForm({});
    setEditingItem(null);
  };

  const handleSaveTutor = () => {
    if (!tutorForm.name || !tutorForm.email) return;

    const tutor: Tutor = {
      id: editingItem?.id || generateId(),
      name: tutorForm.name || '',
      email: tutorForm.email || '',
      phone: tutorForm.phone || '',
      subjects: tutorForm.subjects || [],
      hourlyRate: tutorForm.hourlyRate || 0,
      availability: tutorForm.availability || [],
      bio: tutorForm.bio || '',
    };

    if (editingItem) {
      setTutors(tutors.map((t) => (t.id === tutor.id ? tutor : t)));
    } else {
      setTutors([...tutors, tutor]);
    }

    setModalType(null);
    setTutorForm({ availability: [] });
    setEditingItem(null);
  };

  const handleSaveSession = () => {
    if (!sessionForm.studentId || !sessionForm.tutorId || !sessionForm.date) return;

    const session: Session = {
      id: editingItem?.id || generateId(),
      studentId: sessionForm.studentId || '',
      tutorId: sessionForm.tutorId || '',
      subject: sessionForm.subject || '',
      date: sessionForm.date || '',
      startTime: sessionForm.startTime || '',
      endTime: sessionForm.endTime || '',
      duration: sessionForm.duration || 60,
      locationType: sessionForm.locationType || 'online',
      location: sessionForm.location,
      isRecurring: sessionForm.isRecurring || false,
      recurringPattern: sessionForm.recurringPattern,
      recurringEndDate: sessionForm.recurringEndDate,
      rate: sessionForm.rate || 0,
      paymentStatus: sessionForm.paymentStatus || 'pending',
      status: sessionForm.status || 'scheduled',
      progressNotes: sessionForm.progressNotes || '',
      assignments: sessionForm.assignments || [],
      reminderSet: sessionForm.reminderSet || false,
      reminderTime: sessionForm.reminderTime,
      createdAt: (editingItem as Session)?.createdAt || new Date().toISOString(),
    };

    // Create recurring sessions if needed
    if (session.isRecurring && session.recurringPattern && session.recurringEndDate && !editingItem) {
      const recurringSessions: Session[] = [session];
      let currentDate = new Date(session.date);
      const endDate = new Date(session.recurringEndDate);

      while (currentDate < endDate) {
        if (session.recurringPattern === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (session.recurringPattern === 'biweekly') {
          currentDate.setDate(currentDate.getDate() + 14);
        } else if (session.recurringPattern === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        if (currentDate <= endDate) {
          recurringSessions.push({
            ...session,
            id: generateId(),
            date: currentDate.toISOString().split('T')[0],
          });
        }
      }

      setSessions([...sessions, ...recurringSessions]);
    } else if (editingItem) {
      setSessions(sessions.map((s) => (s.id === session.id ? session : s)));
    } else {
      setSessions([...sessions, session]);
    }

    setModalType(null);
    setSessionForm({ assignments: [] });
    setEditingItem(null);
  };

  const handleSavePackage = () => {
    if (!packageForm.name || !packageForm.sessions) return;

    const pkg: PackageDeal = {
      id: editingItem?.id || generateId(),
      name: packageForm.name || '',
      sessions: packageForm.sessions || 0,
      pricePerSession: packageForm.pricePerSession || 0,
      totalPrice: packageForm.totalPrice || 0,
      validDays: packageForm.validDays || 30,
    };

    if (editingItem) {
      setPackages(packages.map((p) => (p.id === pkg.id ? pkg : p)));
    } else {
      setPackages([...packages, pkg]);
    }

    setModalType(null);
    setPackageForm({});
    setEditingItem(null);
  };

  const handleAddAssignment = () => {
    if (!assignmentForm.title || !assignmentForm.dueDate) return;

    const assignment: Assignment = {
      id: generateId(),
      title: assignmentForm.title || '',
      description: assignmentForm.description || '',
      dueDate: assignmentForm.dueDate || '',
      status: 'pending',
    };

    setSessionForm({
      ...sessionForm,
      assignments: [...(sessionForm.assignments || []), assignment],
    });

    setAssignmentForm({});
  };

  const handleSaveProgressNotes = () => {
    if (!selectedSessionId) return;

    setSessions(
      sessions.map((s) => (s.id === selectedSessionId ? { ...s, progressNotes: progressNotes } : s))
    );

    setModalType(null);
    setSelectedSessionId(null);
    setProgressNotes('');
  };

  const handleCancelSession = (sessionId: string) => {
    setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s)));
  };

  const handleCompleteSession = (sessionId: string) => {
    setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, status: 'completed' } : s)));
  };

  const handleMarkPaid = (sessionId: string) => {
    setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, paymentStatus: 'paid' } : s)));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
    setSessions(sessions.filter((s) => s.studentId !== id));
  };

  const handleDeleteTutor = (id: string) => {
    setTutors(tutors.filter((t) => t.id !== id));
    setSessions(sessions.filter((s) => s.tutorId !== id));
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter((p) => p.id !== id));
  };

  const openEditModal = (type: ModalType, item: Student | Tutor | Session | PackageDeal) => {
    setEditingItem(item);
    setModalType(type);

    if (type === 'student') {
      setStudentForm(item as Student);
    } else if (type === 'tutor') {
      setTutorForm(item as Tutor);
    } else if (type === 'session') {
      setSessionForm(item as Session);
    } else if (type === 'package') {
      setPackageForm(item as PackageDeal);
    }
  };

  const openNotesModal = (session: Session) => {
    setSelectedSessionId(session.id);
    setProgressNotes(session.progressNotes);
    setModalType('notes');
  };

  const getStudentById = (id: string) => students.find((s) => s.id === id);
  const getTutorById = (id: string) => tutors.find((t) => t.id === id);

  // Render functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Students
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {students.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <GraduationCap className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Tutors
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {tutors.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Earnings
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending Payments
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${pendingPayments.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3
          className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          Upcoming Sessions
        </h3>
        {upcomingSessions.length === 0 ? (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No upcoming sessions scheduled
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => {
              const student = getStudentById(session.studentId);
              const tutor = getTutorById(session.tutorId);
              return (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {student?.name || 'Unknown Student'} - {session.subject}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        with {tutor?.name || 'Unknown Tutor'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(session.date)}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Students ({students.length})
        </h3>
        <button
          onClick={() => {
            setStudentForm({});
            setEditingItem(null);
            setModalType('student');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('tools.tutoringScheduler.addStudent', 'Add Student')}
        </button>
      </div>

      {students.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('tools.tutoringScheduler.noStudentsAddedYet', 'No students added yet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4
                    className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {student.name}
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {student.grade}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal('student', student)}
                    className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {student.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-2 py-0.5 text-xs bg-[#0D9488]/20 text-[#0D9488] rounded"
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {student.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {student.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Parent: {student.parentName || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTutors = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Tutors ({tutors.length})
        </h3>
        <button
          onClick={() => {
            setTutorForm({ availability: [] });
            setEditingItem(null);
            setModalType('tutor');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('tools.tutoringScheduler.addTutor', 'Add Tutor')}
        </button>
      </div>

      {tutors.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('tools.tutoringScheduler.noTutorsAddedYet', 'No tutors added yet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4
                    className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {tutor.name}
                  </h4>
                  <p className={`text-sm text-[#0D9488] font-medium`}>${tutor.hourlyRate}/hour</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal('tutor', tutor)}
                    className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTutor(tutor.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {tutor.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-500 rounded"
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {tutor.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {tutor.phone || 'N/A'}
                </div>
              </div>

              {tutor.availability.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tutoringScheduler.availability', 'Availability:')}
                  </p>
                  <div className="text-xs space-y-0.5">
                    {tutor.availability.map((av, idx) => (
                      <p key={idx} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {DAYS_OF_WEEK[av.dayOfWeek]}: {formatTime(av.startTime)} - {formatTime(av.endTime)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Sessions ({sessions.length})
        </h3>
        <button
          onClick={() => {
            setSessionForm({ assignments: [] });
            setEditingItem(null);
            setModalType('session');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
          disabled={students.length === 0 || tutors.length === 0}
        >
          <Plus className="w-4 h-4" />
          {t('tools.tutoringScheduler.bookSession', 'Book Session')}
        </button>
      </div>

      {students.length === 0 || tutors.length === 0 ? (
        <div
          className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('tools.tutoringScheduler.addStudentsAndTutorsFirst', 'Add students and tutors first to book sessions')}</p>
        </div>
      ) : sessions.length === 0 ? (
        <div
          className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
        >
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('tools.tutoringScheduler.noSessionsBookedYet', 'No sessions booked yet')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((session) => {
              const student = getStudentById(session.studentId);
              const tutor = getTutorById(session.tutorId);
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4
                          className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        >
                          {session.subject}
                        </h4>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            session.status === 'completed'
                              ? 'bg-green-500/20 text-green-500'
                              : session.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-500'
                              : session.status === 'rescheduled'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }`}
                        >
                          {session.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            session.paymentStatus === 'paid'
                              ? 'bg-green-500/20 text-green-500'
                              : session.paymentStatus === 'overdue'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}
                        >
                          {session.paymentStatus}
                        </span>
                      </div>

                      <div
                        className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        <p>
                          <span className="font-medium">{t('tools.tutoringScheduler.student', 'Student:')}</span> {student?.name || 'Unknown'}
                        </p>
                        <p>
                          <span className="font-medium">{t('tools.tutoringScheduler.tutor', 'Tutor:')}</span> {tutor?.name || 'Unknown'}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {formatDate(session.date)} | {formatTime(session.startTime)} -{' '}
                          {formatTime(session.endTime)} ({session.duration} min)
                        </p>
                        <p className="flex items-center gap-2">
                          {session.locationType === 'online' ? (
                            <Video className="w-3 h-3" />
                          ) : (
                            <MapPin className="w-3 h-3" />
                          )}
                          {session.locationType === 'online'
                            ? 'Online'
                            : session.location || 'In-person'}
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3" />$
                          {(session.rate * (session.duration / 60)).toFixed(2)}
                        </p>
                        {session.isRecurring && (
                          <p className="flex items-center gap-2">
                            <RefreshCw className="w-3 h-3" />
                            Recurring ({session.recurringPattern})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {session.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleCompleteSession(session.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded text-sm"
                          >
                            <CheckCircle className="w-3 h-3" />
                            {t('tools.tutoringScheduler.complete', 'Complete')}
                          </button>
                          <button
                            onClick={() => handleCancelSession(session.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded text-sm"
                          >
                            <XCircle className="w-3 h-3" />
                            {t('tools.tutoringScheduler.cancel', 'Cancel')}
                          </button>
                        </>
                      )}
                      {session.paymentStatus !== 'paid' && session.status === 'completed' && (
                        <button
                          onClick={() => handleMarkPaid(session.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 rounded text-sm"
                        >
                          <DollarSign className="w-3 h-3" />
                          {t('tools.tutoringScheduler.markPaid', 'Mark Paid')}
                        </button>
                      )}
                      <button
                        onClick={() => openNotesModal(session)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        {t('tools.tutoringScheduler.notes', 'Notes')}
                      </button>
                      <button
                        onClick={() => openEditModal('session', session)}
                        className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {session.assignments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p
                        className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {t('tools.tutoringScheduler.assignments', 'Assignments:')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {session.assignments.map((assignment) => (
                          <span
                            key={assignment.id}
                            className={`px-2 py-1 text-xs rounded ${
                              assignment.status === 'reviewed'
                                ? 'bg-green-500/20 text-green-500'
                                : assignment.status === 'submitted'
                                ? 'bg-blue-500/20 text-blue-500'
                                : 'bg-yellow-500/20 text-yellow-500'
                            }`}
                          >
                            {assignment.title} - {assignment.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );

  const renderWeeklySchedule = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.tutoringScheduler.weeklySchedule', 'Weekly Schedule')}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newStart = new Date(currentWeekStart);
              newStart.setDate(newStart.getDate() - 7);
              setCurrentWeekStart(newStart);
            }}
            className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatDate(currentWeekStart.toISOString())} -{' '}
            {formatDate(
              new Date(
                currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
              ).toISOString()
            )}
          </span>
          <button
            onClick={() => {
              const newStart = new Date(currentWeekStart);
              newStart.setDate(newStart.getDate() + 7);
              setCurrentWeekStart(newStart);
            }}
            className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, idx) => {
          const dateStr = date.toISOString().split('T')[0];
          const daySessions = weekSessions.filter((s) => s.date === dateStr);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={idx}
              className={`p-2 rounded-lg min-h-[150px] ${
                isToday
                  ? 'bg-[#0D9488]/20 border border-[#0D9488]'
                  : theme === 'dark'
                  ? 'bg-gray-700'
                  : 'bg-gray-50'
              }`}
            >
              <div className="text-center mb-2">
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {DAYS_OF_WEEK[idx].slice(0, 3)}
                </p>
                <p
                  className={`font-bold ${
                    isToday ? 'text-[#0D9488]' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>

              <div className="space-y-1">
                {daySessions.map((session) => {
                  const student = getStudentById(session.studentId);
                  return (
                    <div
                      key={session.id}
                      className={`p-1.5 rounded text-xs ${
                        session.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-500 line-through' : t('tools.tutoringScheduler.bg0d948820Text0d9488', 'bg-[#0D9488]/20 text-[#0D9488]')
                      }`}
                    >
                      <p className="font-medium truncate">{student?.name}</p>
                      <p className="truncate">{formatTime(session.startTime)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPackages = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Package Deals ({packages.length})
        </h3>
        <button
          onClick={() => {
            setPackageForm({});
            setEditingItem(null);
            setModalType('package');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('tools.tutoringScheduler.addPackage', 'Add Package')}
        </button>
      </div>

      {packages.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('tools.tutoringScheduler.noPackageDealsCreatedYet', 'No package deals created yet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {pkg.name}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal('package', pkg)}
                    className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-2xl font-bold text-[#0D9488]">${pkg.totalPrice}</p>
                <p>{pkg.sessions} sessions</p>
                <p>${pkg.pricePerSession}/session</p>
                <p className="text-sm">Valid for {pkg.validDays} days</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Modal rendering
  const renderModal = () => {
    if (!modalType) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {modalType === 'student' && (editingItem ? t('tools.tutoringScheduler.editStudent', 'Edit Student') : t('tools.tutoringScheduler.addStudent2', 'Add Student'))}
              {modalType === 'tutor' && (editingItem ? t('tools.tutoringScheduler.editTutor', 'Edit Tutor') : t('tools.tutoringScheduler.addTutor2', 'Add Tutor'))}
              {modalType === 'session' && (editingItem ? t('tools.tutoringScheduler.editSession', 'Edit Session') : t('tools.tutoringScheduler.bookSession2', 'Book Session'))}
              {modalType === 'package' && (editingItem ? t('tools.tutoringScheduler.editPackage', 'Edit Package') : t('tools.tutoringScheduler.addPackage2', 'Add Package'))}
              {modalType === 'notes' && 'Progress Notes'}
            </h3>
            <button
              onClick={() => {
                setModalType(null);
                setEditingItem(null);
                setStudentForm({});
                setTutorForm({ availability: [] });
                setSessionForm({ assignments: [] });
                setPackageForm({});
              }}
              className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Form */}
          {modalType === 'student' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={studentForm.name || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.tutoringScheduler.studentName', 'Student name')}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.grade', 'Grade')}
                  </label>
                  <select
                    value={studentForm.grade || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.tutoringScheduler.selectGrade', 'Select grade')}</option>
                    {GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('tools.tutoringScheduler.subjects', 'Subjects')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => {
                        const subjects = studentForm.subjects || [];
                        if (subjects.includes(subject)) {
                          setStudentForm({
                            ...studentForm,
                            subjects: subjects.filter((s) => s !== subject),
                          });
                        } else {
                          setStudentForm({
                            ...studentForm,
                            subjects: [...subjects, subject],
                          });
                        }
                      }}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        studentForm.subjects?.includes(subject)
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.email', 'Email *')}
                  </label>
                  <input
                    type="email"
                    value={studentForm.email || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.tutoringScheduler.studentEmailCom', 'student@email.com')}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={studentForm.phone || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.tutoringScheduler.phoneNumber', 'Phone number')}
                  />
                </div>
              </div>

              <div
                className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <h4
                  className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('tools.tutoringScheduler.parentGuardianInformation', 'Parent/Guardian Information')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {t('tools.tutoringScheduler.name2', 'Name')}
                    </label>
                    <input
                      type="text"
                      value={studentForm.parentName || ''}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, parentName: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      placeholder={t('tools.tutoringScheduler.parentName', 'Parent name')}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {t('tools.tutoringScheduler.email2', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={studentForm.parentEmail || ''}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, parentEmail: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      placeholder={t('tools.tutoringScheduler.parentEmailCom', 'parent@email.com')}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {t('tools.tutoringScheduler.phone2', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={studentForm.parentPhone || ''}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, parentPhone: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      placeholder={t('tools.tutoringScheduler.phoneNumber2', 'Phone number')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('tools.tutoringScheduler.notes2', 'Notes')}
                </label>
                <textarea
                  value={studentForm.notes || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  rows={3}
                  placeholder={t('tools.tutoringScheduler.additionalNotesAboutTheStudent', 'Additional notes about the student...')}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveStudent}
                  disabled={!studentForm.name || !studentForm.email}
                  className="flex-1 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {editingItem ? t('tools.tutoringScheduler.updateStudent', 'Update Student') : t('tools.tutoringScheduler.addStudent3', 'Add Student')}
                </button>
              </div>
            </div>
          )}

          {/* Tutor Form */}
          {modalType === 'tutor' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.name3', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={tutorForm.name || ''}
                    onChange={(e) => setTutorForm({ ...tutorForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.tutoringScheduler.tutorName', 'Tutor name')}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.hourlyRate', 'Hourly Rate ($)')}
                  </label>
                  <input
                    type="number"
                    value={tutorForm.hourlyRate || ''}
                    onChange={(e) =>
                      setTutorForm({ ...tutorForm, hourlyRate: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.email3', 'Email *')}
                  </label>
                  <input
                    type="email"
                    value={tutorForm.email || ''}
                    onChange={(e) => setTutorForm({ ...tutorForm, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.tutoringScheduler.tutorEmailCom', 'tutor@email.com')}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.phone3', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={tutorForm.phone || ''}
                    onChange={(e) => setTutorForm({ ...tutorForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder={t('tools.tutoringScheduler.phoneNumber3', 'Phone number')}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('tools.tutoringScheduler.subjects2', 'Subjects')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => {
                        const subjects = tutorForm.subjects || [];
                        if (subjects.includes(subject)) {
                          setTutorForm({
                            ...tutorForm,
                            subjects: subjects.filter((s) => s !== subject),
                          });
                        } else {
                          setTutorForm({
                            ...tutorForm,
                            subjects: [...subjects, subject],
                          });
                        }
                      }}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        tutorForm.subjects?.includes(subject)
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('tools.tutoringScheduler.bio', 'Bio')}
                </label>
                <textarea
                  value={tutorForm.bio || ''}
                  onChange={(e) => setTutorForm({ ...tutorForm, bio: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  rows={3}
                  placeholder={t('tools.tutoringScheduler.briefBioAboutTheTutor', 'Brief bio about the tutor...')}
                />
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4
                  className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('tools.tutoringScheduler.availability2', 'Availability')}
                </h4>
                <div className="space-y-2">
                  {tutorForm.availability?.map((av, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={av.dayOfWeek}
                        onChange={(e) => {
                          const newAvail = [...(tutorForm.availability || [])];
                          newAvail[idx] = { ...av, dayOfWeek: parseInt(e.target.value) };
                          setTutorForm({ ...tutorForm, availability: newAvail });
                        }}
                        className={`px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {DAYS_OF_WEEK.map((day, i) => (
                          <option key={i} value={i}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={av.startTime}
                        onChange={(e) => {
                          const newAvail = [...(tutorForm.availability || [])];
                          newAvail[idx] = { ...av, startTime: e.target.value };
                          setTutorForm({ ...tutorForm, availability: newAvail });
                        }}
                        className={`px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>to</span>
                      <input
                        type="time"
                        value={av.endTime}
                        onChange={(e) => {
                          const newAvail = [...(tutorForm.availability || [])];
                          newAvail[idx] = { ...av, endTime: e.target.value };
                          setTutorForm({ ...tutorForm, availability: newAvail });
                        }}
                        className={`px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <button
                        onClick={() => {
                          const newAvail = tutorForm.availability?.filter((_, i) => i !== idx);
                          setTutorForm({ ...tutorForm, availability: newAvail });
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setTutorForm({
                        ...tutorForm,
                        availability: [
                          ...(tutorForm.availability || []),
                          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
                        ],
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-[#0D9488] hover:bg-[#0D9488]/10 rounded"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.tutoringScheduler.addTimeSlot', 'Add Time Slot')}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveTutor}
                  disabled={!tutorForm.name || !tutorForm.email}
                  className="flex-1 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {editingItem ? t('tools.tutoringScheduler.updateTutor', 'Update Tutor') : t('tools.tutoringScheduler.addTutor3', 'Add Tutor')}
                </button>
              </div>
            </div>
          )}

          {/* Session Form */}
          {modalType === 'session' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.student2', 'Student *')}
                  </label>
                  <select
                    value={sessionForm.studentId || ''}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, studentId: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.tutoringScheduler.selectStudent', 'Select student')}</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.tutor2', 'Tutor *')}
                  </label>
                  <select
                    value={sessionForm.tutorId || ''}
                    onChange={(e) => {
                      const tutor = getTutorById(e.target.value);
                      setSessionForm({
                        ...sessionForm,
                        tutorId: e.target.value,
                        rate: tutor?.hourlyRate || 0,
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.tutoringScheduler.selectTutor', 'Select tutor')}</option>
                    {tutors.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (${t.hourlyRate}/hr)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.subject', 'Subject')}
                  </label>
                  <select
                    value={sessionForm.subject || ''}
                    onChange={(e) => setSessionForm({ ...sessionForm, subject: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.tutoringScheduler.selectSubject', 'Select subject')}</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.date', 'Date *')}
                  </label>
                  <input
                    type="date"
                    value={sessionForm.date || ''}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.startTime', 'Start Time')}
                  </label>
                  <input
                    type="time"
                    value={sessionForm.startTime || ''}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.endTime', 'End Time')}
                  </label>
                  <input
                    type="time"
                    value={sessionForm.endTime || ''}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.durationMin', 'Duration (min)')}
                  </label>
                  <select
                    value={sessionForm.duration || 60}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.locationType', 'Location Type')}
                  </label>
                  <select
                    value={sessionForm.locationType || 'online'}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        locationType: e.target.value as 'online' | 'in-person',
                      })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="online">{t('tools.tutoringScheduler.online', 'Online')}</option>
                    <option value="in-person">{t('tools.tutoringScheduler.inPerson', 'In-Person')}</option>
                  </select>
                </div>
                {sessionForm.locationType === 'in-person' && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {t('tools.tutoringScheduler.location', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={sessionForm.location || ''}
                      onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      placeholder={t('tools.tutoringScheduler.addressOrLocation', 'Address or location')}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.rateHour', 'Rate ($/hour)')}
                  </label>
                  <input
                    type="number"
                    value={sessionForm.rate || ''}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, rate: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.paymentStatus', 'Payment Status')}
                  </label>
                  <select
                    value={sessionForm.paymentStatus || 'pending'}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        paymentStatus: e.target.value as 'pending' | 'paid' | 'overdue',
                      })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="pending">{t('tools.tutoringScheduler.pending', 'Pending')}</option>
                    <option value="paid">{t('tools.tutoringScheduler.paid', 'Paid')}</option>
                    <option value="overdue">{t('tools.tutoringScheduler.overdue', 'Overdue')}</option>
                  </select>
                </div>
              </div>

              {/* Recurring Session */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={sessionForm.isRecurring || false}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, isRecurring: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#0D9488]"
                  />
                  <label
                    htmlFor="isRecurring"
                    className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {t('tools.tutoringScheduler.recurringSession', 'Recurring Session')}
                  </label>
                </div>

                {sessionForm.isRecurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {t('tools.tutoringScheduler.pattern', 'Pattern')}
                      </label>
                      <select
                        value={sessionForm.recurringPattern || 'weekly'}
                        onChange={(e) =>
                          setSessionForm({
                            ...sessionForm,
                            recurringPattern: e.target.value as 'weekly' | 'biweekly' | 'monthly',
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        <option value="weekly">{t('tools.tutoringScheduler.weekly', 'Weekly')}</option>
                        <option value="biweekly">{t('tools.tutoringScheduler.biWeekly', 'Bi-weekly')}</option>
                        <option value="monthly">{t('tools.tutoringScheduler.monthly', 'Monthly')}</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {t('tools.tutoringScheduler.endDate', 'End Date')}
                      </label>
                      <input
                        type="date"
                        value={sessionForm.recurringEndDate || ''}
                        onChange={(e) =>
                          setSessionForm({ ...sessionForm, recurringEndDate: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Reminder Settings */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="reminderSet"
                    checked={sessionForm.reminderSet || false}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, reminderSet: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#0D9488]"
                  />
                  <label
                    htmlFor="reminderSet"
                    className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {t('tools.tutoringScheduler.setReminder', 'Set Reminder')}
                  </label>
                </div>

                {sessionForm.reminderSet && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {t('tools.tutoringScheduler.remindBefore', 'Remind Before')}
                    </label>
                    <select
                      value={sessionForm.reminderTime || 30}
                      onChange={(e) =>
                        setSessionForm({ ...sessionForm, reminderTime: parseInt(e.target.value) })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={1440}>1 day</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Assignments */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4
                  className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('tools.tutoringScheduler.assignments2', 'Assignments')}
                </h4>
                {sessionForm.assignments && sessionForm.assignments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {sessionForm.assignments.map((a, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {a.title} - Due: {formatDate(a.dueDate)}
                        </span>
                        <button
                          onClick={() => {
                            setSessionForm({
                              ...sessionForm,
                              assignments: sessionForm.assignments?.filter((_, i) => i !== idx),
                            });
                          }}
                          className="p-1 rounded hover:bg-red-500/20 text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={assignmentForm.title || ''}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, title: e.target.value })
                    }
                    placeholder={t('tools.tutoringScheduler.assignmentTitle', 'Assignment title')}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <input
                    type="date"
                    value={assignmentForm.dueDate || ''}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })
                    }
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                  <button
                    onClick={handleAddAssignment}
                    disabled={!assignmentForm.title || !assignmentForm.dueDate}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.tutoringScheduler.add', 'Add')}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveSession}
                  disabled={!sessionForm.studentId || !sessionForm.tutorId || !sessionForm.date}
                  className="flex-1 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {editingItem ? t('tools.tutoringScheduler.updateSession', 'Update Session') : t('tools.tutoringScheduler.bookSession3', 'Book Session')}
                </button>
              </div>
            </div>
          )}

          {/* Package Form */}
          {modalType === 'package' && (
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('tools.tutoringScheduler.packageName', 'Package Name *')}
                </label>
                <input
                  type="text"
                  value={packageForm.name || ''}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  placeholder={t('tools.tutoringScheduler.eGMonthlyPackageSemester', 'e.g., Monthly Package, Semester Deal')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.numberOfSessions', 'Number of Sessions *')}
                  </label>
                  <input
                    type="number"
                    value={packageForm.sessions || ''}
                    onChange={(e) => {
                      const sessions = parseInt(e.target.value) || 0;
                      const pricePerSession = packageForm.pricePerSession || 0;
                      setPackageForm({
                        ...packageForm,
                        sessions,
                        totalPrice: sessions * pricePerSession,
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder="10"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.pricePerSession', 'Price Per Session ($)')}
                  </label>
                  <input
                    type="number"
                    value={packageForm.pricePerSession || ''}
                    onChange={(e) => {
                      const pricePerSession = parseFloat(e.target.value) || 0;
                      const sessions = packageForm.sessions || 0;
                      setPackageForm({
                        ...packageForm,
                        pricePerSession,
                        totalPrice: sessions * pricePerSession,
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder="45"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.totalPrice', 'Total Price ($)')}
                  </label>
                  <input
                    type="number"
                    value={packageForm.totalPrice || ''}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, totalPrice: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder="450"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('tools.tutoringScheduler.validForDays', 'Valid For (days)')}
                  </label>
                  <input
                    type="number"
                    value={packageForm.validDays || ''}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, validDays: parseInt(e.target.value) || 30 })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSavePackage}
                  disabled={!packageForm.name || !packageForm.sessions}
                  className="flex-1 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {editingItem ? t('tools.tutoringScheduler.updatePackage', 'Update Package') : t('tools.tutoringScheduler.addPackage3', 'Add Package')}
                </button>
              </div>
            </div>
          )}

          {/* Progress Notes Modal */}
          {modalType === 'notes' && (
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {t('tools.tutoringScheduler.sessionProgressNotes', 'Session Progress Notes')}
                </label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  rows={8}
                  placeholder={t('tools.tutoringScheduler.enterProgressNotesObservationsAreas', 'Enter progress notes, observations, areas of improvement, homework given, etc...')}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveProgressNotes}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.tutoringScheduler.saveNotes', 'Save Notes')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tab configuration
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'tutors', label: 'Tutors', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Calendar className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Clock className="w-4 h-4" /> },
    { id: 'packages', label: 'Packages', icon: <DollarSign className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0D9488] rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.tutoringScheduler.tutoringScheduler', 'Tutoring Scheduler')}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.tutoringScheduler.manageStudentsTutorsAndTutoring', 'Manage students, tutors, and tutoring sessions')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="tutoring-scheduler" toolName="Tutoring Scheduler" />

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
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onCopyToClipboard={handleCopyToClipboard}
            onPrint={handlePrint}
            onImportJSON={handleImportJSON}
            showImport={true}
            disabled={sessions.length === 0 && students.length === 0 && tutors.length === 0}
            theme={theme}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'tutors' && renderTutors()}
        {activeTab === 'sessions' && renderSessions()}
        {activeTab === 'schedule' && renderWeeklySchedule()}
        {activeTab === 'packages' && renderPackages()}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default TutoringSchedulerTool;
