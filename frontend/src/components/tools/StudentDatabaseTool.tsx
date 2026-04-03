'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
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
import {
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  User,
  Clock,
  FileText,
  AlertCircle,
  Sparkles,
  BarChart3,
  UserCheck,
  UserX,
  Award,
  Loader2,
} from 'lucide-react';

// Types
interface Student {
  id: string;
  name: string;
  studentId: string;
  dateOfBirth: string;
  grade: string;
  class: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  enrollmentDate: string;
  status: 'active' | 'graduated' | 'withdrawn';
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AcademicRecord {
  id: string;
  studentId: string;
  subject: string;
  grade: string;
  score: number;
  semester: string;
  year: string;
  comments?: string;
  createdAt: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  createdAt: string;
}

interface StudentNote {
  id: string;
  studentId: string;
  type: 'general' | 'academic' | 'behavioral' | 'parent-communication';
  content: string;
  author: string;
  createdAt: string;
}

// Combined data structure for sync
interface StudentDatabaseData {
  id: string; // Required for useToolData
  students: Student[];
  academicRecords: AcademicRecord[];
  attendanceRecords: AttendanceRecord[];
  notes: StudentNote[];
}

type TabType = 'students' | 'academics' | 'attendance' | 'notes' | 'stats';

const GRADES = ['Pre-K', 'Kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const CLASSES = ['A', 'B', 'C', 'D', 'E'];
const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physical Education', 'Art', 'Music', 'Computer Science', 'Foreign Language'];
const LETTER_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

// Column configurations for exports
const STUDENT_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'studentId', header: 'Student ID', type: 'string' },
  { key: 'dateOfBirth', header: 'Date of Birth', type: 'date' },
  { key: 'grade', header: 'Grade Level', type: 'string' },
  { key: 'class', header: 'Class', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'parentName', header: 'Parent/Guardian', type: 'string' },
  { key: 'parentEmail', header: 'Parent Email', type: 'string' },
  { key: 'parentPhone', header: 'Parent Phone', type: 'string' },
  { key: 'enrollmentDate', header: 'Enrollment Date', type: 'date' },
  { key: 'address', header: 'Address', type: 'string' },
];

const ACADEMIC_COLUMNS: ColumnConfig[] = [
  { key: 'studentName', header: 'Student Name', type: 'string' },
  { key: 'subject', header: 'Subject', type: 'string' },
  { key: 'grade', header: 'Letter Grade', type: 'string' },
  { key: 'score', header: 'Score (%)', type: 'number' },
  { key: 'semester', header: 'Semester', type: 'string' },
  { key: 'year', header: 'Year', type: 'string' },
  { key: 'comments', header: 'Comments', type: 'string' },
];

const ATTENDANCE_COLUMNS: ColumnConfig[] = [
  { key: 'studentName', header: 'Student Name', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

// Column configuration for exports - used for the combined database
const COLUMNS: ColumnConfig[] = [
  { key: 'students', header: 'Students Count', type: 'number' },
  { key: 'academicRecords', header: 'Academic Records Count', type: 'number' },
  { key: 'attendanceRecords', header: 'Attendance Records Count', type: 'number' },
  { key: 'notes', header: 'Notes Count', type: 'number' },
];

const DEFAULT_DATA: StudentDatabaseData = {
  id: 'main',
  students: [],
  academicRecords: [],
  attendanceRecords: [],
  notes: [],
};

// Calculate GPA from letter grade
const gradeToPoints = (grade: string): number => {
  const gradeMap: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0,
  };
  return gradeMap[grade] || 0;
};

interface StudentDatabaseToolProps {
  uiConfig?: UIConfig;
}

export const StudentDatabaseTool: React.FC<StudentDatabaseToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: toolData,
    setData: setToolData,
    exportCSV: hookExportCSV,
    exportExcel: hookExportExcel,
    exportJSON: hookExportJSON,
    exportPDF: hookExportPDF,
    copyToClipboard: hookCopyToClipboard,
    print: hookPrint,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<StudentDatabaseData>('student-database', [DEFAULT_DATA], COLUMNS);

  // Extract data from the tool data (first item in array is our main data container)
  const dbData = toolData[0] || DEFAULT_DATA;
  const students = dbData.students || [];
  const academicRecords = dbData.academicRecords || [];
  const attendanceRecords = dbData.attendanceRecords || [];
  const notes = dbData.notes || [];

  // Helper to update the database data
  const updateDbData = (updates: Partial<StudentDatabaseData>) => {
    setToolData([{ ...dbData, ...updates }]);
  };

  // State
  const [activeTab, setActiveTab] = useState<TabType>('students');

  // Form states
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showAcademicForm, setShowAcademicForm] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Student form
  const [studentForm, setStudentForm] = useState({
    name: '',
    studentId: '',
    dateOfBirth: '',
    grade: '',
    class: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active' as const,
    address: '',
    notes: '',
  });

  // Academic record form
  const [academicForm, setAcademicForm] = useState({
    studentId: '',
    subject: '',
    grade: '',
    score: 0,
    semester: 'Fall',
    year: new Date().getFullYear().toString(),
    comments: '',
  });

  // Attendance form
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present' as const,
    notes: '',
  });

  // Note form
  const [noteForm, setNoteForm] = useState({
    studentId: '',
    type: 'general' as StudentNote['type'],
    content: '',
    author: '',
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.firstName || params.lastName || params.title) {
        setStudentForm(prev => ({
          ...prev,
          name: params.title || `${params.firstName || ''} ${params.lastName || ''}`.trim(),
          parentEmail: params.email || prev.parentEmail,
          parentPhone: params.phone || prev.parentPhone,
        }));
        setShowStudentForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Student handlers
  const handleSaveStudent = () => {
    if (!studentForm.name.trim() || !studentForm.studentId.trim()) return;

    const now = new Date().toISOString();
    const newStudent: Student = {
      id: editingStudent?.id || Date.now().toString(),
      ...studentForm,
      createdAt: editingStudent?.createdAt || now,
      updatedAt: now,
    };

    if (editingStudent) {
      updateDbData({
        students: students.map((s) => (s.id === editingStudent.id ? newStudent : s)),
      });
    } else {
      updateDbData({
        students: [...students, newStudent],
      });
    }

    resetStudentForm();
  };

  const resetStudentForm = () => {
    setStudentForm({
      name: '',
      studentId: '',
      dateOfBirth: '',
      grade: '',
      class: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      address: '',
      notes: '',
    });
    setEditingStudent(null);
    setShowStudentForm(false);
  };

  const handleEditStudent = (student: Student) => {
    setStudentForm({
      name: student.name,
      studentId: student.studentId,
      dateOfBirth: student.dateOfBirth,
      grade: student.grade,
      class: student.class,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      enrollmentDate: student.enrollmentDate,
      status: student.status,
      address: student.address || '',
      notes: student.notes || '',
    });
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleDeleteStudent = (id: string) => {
    updateDbData({
      students: students.filter((s) => s.id !== id),
      academicRecords: academicRecords.filter((r) => r.studentId !== id),
      attendanceRecords: attendanceRecords.filter((r) => r.studentId !== id),
      notes: notes.filter((n) => n.studentId !== id),
    });
  };

  // Academic record handlers
  const handleSaveAcademicRecord = () => {
    if (!academicForm.studentId || !academicForm.subject || !academicForm.grade) return;

    const newRecord: AcademicRecord = {
      id: Date.now().toString(),
      ...academicForm,
      createdAt: new Date().toISOString(),
    };

    updateDbData({
      academicRecords: [...academicRecords, newRecord],
    });

    setAcademicForm({
      studentId: selectedStudent?.id || '',
      subject: '',
      grade: '',
      score: 0,
      semester: 'Fall',
      year: new Date().getFullYear().toString(),
      comments: '',
    });
    setShowAcademicForm(false);
  };

  // Attendance handlers
  const handleSaveAttendance = () => {
    if (!attendanceForm.studentId || !attendanceForm.date) return;

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      ...attendanceForm,
      createdAt: new Date().toISOString(),
    };

    updateDbData({
      attendanceRecords: [...attendanceRecords, newRecord],
    });

    setAttendanceForm({
      studentId: selectedStudent?.id || '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      notes: '',
    });
    setShowAttendanceForm(false);
  };

  // Note handlers
  const handleSaveNote = () => {
    if (!noteForm.studentId || !noteForm.content.trim()) return;

    const newNote: StudentNote = {
      id: Date.now().toString(),
      ...noteForm,
      createdAt: new Date().toISOString(),
    };

    updateDbData({
      notes: [...notes, newNote],
    });

    setNoteForm({
      studentId: selectedStudent?.id || '',
      type: 'general',
      content: '',
      author: '',
    });
    setShowNoteForm(false);
  };

  const handleDeleteNote = (id: string) => {
    updateDbData({
      notes: notes.filter((n) => n.id !== id),
    });
  };

  // Filtered data
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;
      const matchesClass = classFilter === 'all' || s.class === classFilter;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesGrade && matchesClass && matchesStatus;
    });
  }, [students, searchTerm, gradeFilter, classFilter, statusFilter]);

  // Calculate GPA for a student
  const calculateGPA = (studentId: string): number => {
    const studentRecords = academicRecords.filter((r) => r.studentId === studentId);
    if (studentRecords.length === 0) return 0;
    const totalPoints = studentRecords.reduce((sum, r) => sum + gradeToPoints(r.grade), 0);
    return totalPoints / studentRecords.length;
  };

  // Calculate attendance rate for a student
  const calculateAttendanceRate = (studentId: string): number => {
    const studentAttendance = attendanceRecords.filter((r) => r.studentId === studentId);
    if (studentAttendance.length === 0) return 100;
    const presentCount = studentAttendance.filter((r) => r.status === 'present' || r.status === 'late').length;
    return (presentCount / studentAttendance.length) * 100;
  };

  // Statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'active').length;
    const graduatedStudents = students.filter((s) => s.status === 'graduated').length;
    const withdrawnStudents = students.filter((s) => s.status === 'withdrawn').length;

    const byGrade: Record<string, number> = {};
    students.forEach((s) => {
      byGrade[s.grade] = (byGrade[s.grade] || 0) + 1;
    });

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
    const lateCount = attendanceRecords.filter((r) => r.status === 'late').length;
    const overallAttendanceRate = totalAttendance > 0 ? ((presentCount + lateCount) / totalAttendance) * 100 : 0;

    return {
      totalStudents,
      activeStudents,
      graduatedStudents,
      withdrawnStudents,
      byGrade,
      overallAttendanceRate,
    };
  }, [students, attendanceRecords]);

  // Styles
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'academics', label: 'Academic Records', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes & Communication', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'stats', label: 'Statistics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 rounded-lg ${cardBg} shadow-lg`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 rounded-lg ${cardBg} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <GraduationCap className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.studentDatabase.studentDatabase', 'Student Database')}</h2>
            <p className={`text-sm ${textSecondary}`}>
              {t('tools.studentDatabase.comprehensiveStudentManagementAndTracking', 'Comprehensive student management and tracking system')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="student-database" toolName="Student Database" />

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
          onExportCSV={() => {
            // Export based on active tab
            if (activeTab === 'students') {
              exportToCSV(filteredStudents, STUDENT_COLUMNS, { filename: 'students' });
            } else if (activeTab === 'academics' && selectedStudent) {
              const enrichedRecords = academicRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              exportToCSV(enrichedRecords, ACADEMIC_COLUMNS, { filename: 'academic-records' });
            } else if (activeTab === 'attendance' && selectedStudent) {
              const enrichedRecords = attendanceRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              exportToCSV(enrichedRecords, ATTENDANCE_COLUMNS, { filename: 'attendance-records' });
            } else {
              exportToCSV(students, STUDENT_COLUMNS, { filename: 'all-students' });
            }
          }}
          onExportExcel={() => {
            if (activeTab === 'students') {
              exportToExcel(filteredStudents, STUDENT_COLUMNS, { filename: 'students' });
            } else if (activeTab === 'academics' && selectedStudent) {
              const enrichedRecords = academicRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              exportToExcel(enrichedRecords, ACADEMIC_COLUMNS, { filename: 'academic-records' });
            } else if (activeTab === 'attendance' && selectedStudent) {
              const enrichedRecords = attendanceRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              exportToExcel(enrichedRecords, ATTENDANCE_COLUMNS, { filename: 'attendance-records' });
            } else {
              exportToExcel(students, STUDENT_COLUMNS, { filename: 'all-students' });
            }
          }}
          onExportJSON={() => {
            if (activeTab === 'students') {
              exportToJSON(filteredStudents, { filename: 'students' });
            } else if (activeTab === 'academics' && selectedStudent) {
              const enrichedRecords = academicRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              exportToJSON(enrichedRecords, { filename: 'academic-records' });
            } else if (activeTab === 'attendance' && selectedStudent) {
              const enrichedRecords = attendanceRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              exportToJSON(enrichedRecords, { filename: 'attendance-records' });
            } else {
              exportToJSON(students, { filename: 'all-students' });
            }
          }}
          onExportPDF={async () => {
            if (activeTab === 'students') {
              await exportToPDF(filteredStudents, STUDENT_COLUMNS, {
                filename: 'students',
                title: 'Student List',
                subtitle: `Total: ${filteredStudents.length} students`,
              });
            } else if (activeTab === 'academics' && selectedStudent) {
              const enrichedRecords = academicRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              await exportToPDF(enrichedRecords, ACADEMIC_COLUMNS, {
                filename: 'academic-records',
                title: `Academic Records - ${selectedStudent.name}`,
                subtitle: `GPA: ${calculateGPA(selectedStudent.id).toFixed(2)}`,
              });
            } else if (activeTab === 'attendance' && selectedStudent) {
              const enrichedRecords = attendanceRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              await exportToPDF(enrichedRecords, ATTENDANCE_COLUMNS, {
                filename: 'attendance-records',
                title: `Attendance Records - ${selectedStudent.name}`,
                subtitle: `Attendance Rate: ${calculateAttendanceRate(selectedStudent.id).toFixed(1)}%`,
              });
            } else {
              await exportToPDF(students, STUDENT_COLUMNS, {
                filename: 'all-students',
                title: 'All Students',
                subtitle: `Total: ${students.length} students`,
              });
            }
          }}
          onPrint={() => {
            if (activeTab === 'students') {
              printData(filteredStudents, STUDENT_COLUMNS, { title: 'Student List' });
            } else if (activeTab === 'academics' && selectedStudent) {
              const enrichedRecords = academicRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              printData(enrichedRecords, ACADEMIC_COLUMNS, { title: `Academic Records - ${selectedStudent.name}` });
            } else if (activeTab === 'attendance' && selectedStudent) {
              const enrichedRecords = attendanceRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              printData(enrichedRecords, ATTENDANCE_COLUMNS, { title: `Attendance Records - ${selectedStudent.name}` });
            } else {
              printData(students, STUDENT_COLUMNS, { title: 'All Students' });
            }
          }}
          onCopyToClipboard={async () => {
            if (activeTab === 'students') {
              return copyUtil(filteredStudents, STUDENT_COLUMNS, 'tab');
            } else if (activeTab === 'academics' && selectedStudent) {
              const enrichedRecords = academicRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              return copyUtil(enrichedRecords, ACADEMIC_COLUMNS, 'tab');
            } else if (activeTab === 'attendance' && selectedStudent) {
              const enrichedRecords = attendanceRecords
                .filter((r) => r.studentId === selectedStudent.id)
                .map((r) => ({
                  ...r,
                  studentName: selectedStudent.name,
                }));
              return copyUtil(enrichedRecords, ATTENDANCE_COLUMNS, 'tab');
            }
            return copyUtil(students, STUDENT_COLUMNS, 'tab');
          }}
          showImport={false}
          theme={isDark ? 'dark' : 'light'}
        />
      </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-sm text-indigo-500 font-medium">{t('tools.studentDatabase.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex flex-wrap gap-2 mb-6 border-b ${borderColor} pb-4`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-500 text-white'
                : `${textSecondary} ${hoverBg}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="flex items-center gap-2 min-w-[200px]">
                <Search className={`w-4 h-4 ${textSecondary}`} />
                <input
                  type="text"
                  placeholder={t('tools.studentDatabase.searchStudents', 'Search students...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
              </div>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="all">{t('tools.studentDatabase.allGrades', 'All Grades')}</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="all">{t('tools.studentDatabase.allClasses', 'All Classes')}</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="all">{t('tools.studentDatabase.allStatus', 'All Status')}</option>
                <option value="active">{t('tools.studentDatabase.active', 'Active')}</option>
                <option value="graduated">{t('tools.studentDatabase.graduated', 'Graduated')}</option>
                <option value="withdrawn">{t('tools.studentDatabase.withdrawn', 'Withdrawn')}</option>
              </select>
            </div>
            <button
              onClick={() => setShowStudentForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.studentDatabase.addStudent', 'Add Student')}
            </button>
          </div>

          {/* Student Form Modal */}
          {showStudentForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>
                  {editingStudent ? t('tools.studentDatabase.editStudent', 'Edit Student') : t('tools.studentDatabase.newStudent', 'New Student')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.fullName', 'Full Name *')}
                    </label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.studentDatabase.johnDoe', 'John Doe')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.studentId', 'Student ID *')}
                    </label>
                    <input
                      type="text"
                      value={studentForm.studentId}
                      onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.studentDatabase.stu2024001', 'STU-2024-001')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.dateOfBirth', 'Date of Birth')}
                    </label>
                    <input
                      type="date"
                      value={studentForm.dateOfBirth}
                      onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.grade2', 'Grade *')}
                    </label>
                    <select
                      value={studentForm.grade}
                      onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.studentDatabase.selectGrade', 'Select Grade')}</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.class', 'Class')}
                    </label>
                    <select
                      value={studentForm.class}
                      onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.studentDatabase.selectClass', 'Select Class')}</option>
                      {CLASSES.map((c) => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.status', 'Status')}
                    </label>
                    <select
                      value={studentForm.status}
                      onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as Student['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="active">{t('tools.studentDatabase.active2', 'Active')}</option>
                      <option value="graduated">{t('tools.studentDatabase.graduated2', 'Graduated')}</option>
                      <option value="withdrawn">{t('tools.studentDatabase.withdrawn2', 'Withdrawn')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.parentGuardianName', 'Parent/Guardian Name')}
                    </label>
                    <input
                      type="text"
                      value={studentForm.parentName}
                      onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.studentDatabase.janeDoe', 'Jane Doe')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.parentEmail', 'Parent Email')}
                    </label>
                    <input
                      type="email"
                      value={studentForm.parentEmail}
                      onChange={(e) => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.studentDatabase.parentEmailCom', 'parent@email.com')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.parentPhone', 'Parent Phone')}
                    </label>
                    <input
                      type="tel"
                      value={studentForm.parentPhone}
                      onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.enrollmentDate', 'Enrollment Date')}
                    </label>
                    <input
                      type="date"
                      value={studentForm.enrollmentDate}
                      onChange={(e) => setStudentForm({ ...studentForm, enrollmentDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.address', 'Address')}
                    </label>
                    <input
                      type="text"
                      value={studentForm.address}
                      onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.studentDatabase.123MainStCityState', '123 Main St, City, State 12345')}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.notes', 'Notes')}
                    </label>
                    <textarea
                      value={studentForm.notes}
                      onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                      rows={3}
                      placeholder={t('tools.studentDatabase.additionalNotesAboutTheStudent', 'Additional notes about the student...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveStudent}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.studentDatabase.save', 'Save')}
                  </button>
                  <button
                    onClick={resetStudentForm}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.studentDatabase.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Students List */}
          <div className="grid gap-4">
            {filteredStudents.map((student) => {
              const gpa = calculateGPA(student.id);
              const attendanceRate = calculateAttendanceRate(student.id);

              return (
                <Card key={student.id} className={`${cardBg} ${borderColor} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${textPrimary}`}>{student.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}>
                            {student.studentId}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              student.status === 'active'
                                ? 'bg-green-500/10 text-green-500'
                                : student.status === 'graduated'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {student.status}
                          </span>
                        </div>
                        <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> {student.grade} - Class {student.class}
                          </span>
                          {student.dateOfBirth && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {student.parentName || 'No guardian info'}
                          </span>
                          {student.parentEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {student.parentEmail}
                            </span>
                          )}
                          {student.parentPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {student.parentPhone}
                            </span>
                          )}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 mt-3">
                          <div className={`px-3 py-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className={`text-xs ${textSecondary}`}>{t('tools.studentDatabase.gpa', 'GPA:')}</span>
                            <span className={`text-sm font-semibold ${textPrimary}`}>{gpa.toFixed(2)}</span>
                          </div>
                          <div className={`px-3 py-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className={`text-xs ${textSecondary}`}>{t('tools.studentDatabase.attendance', 'Attendance:')}</span>
                            <span className={`text-sm font-semibold ${attendanceRate >= 90 ? 'text-green-500' : attendanceRate >= 75 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setActiveTab('academics');
                            }}
                            className={`p-2 rounded-lg ${hoverBg}`}
                            title={t('tools.studentDatabase.viewGrades', 'View Grades')}
                          >
                            <BookOpen className={`w-4 h-4 ${textSecondary}`} />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className={`p-2 rounded-lg ${hoverBg}`}
                            title={t('tools.studentDatabase.edit', 'Edit')}
                          >
                            <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredStudents.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.studentDatabase.noStudentsFoundAddYour', 'No students found. Add your first student to get started.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Academic Records Tab */}
      {activeTab === 'academics' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const student = students.find((s) => s.id === e.target.value);
                  setSelectedStudent(student || null);
                  setAcademicForm({ ...academicForm, studentId: e.target.value });
                }}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="">{t('tools.studentDatabase.selectStudent', 'Select Student')}</option>
                {students.filter((s) => s.status === 'active').map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                if (selectedStudent) {
                  setAcademicForm({ ...academicForm, studentId: selectedStudent.id });
                  setShowAcademicForm(true);
                }
              }}
              disabled={!selectedStudent}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {t('tools.studentDatabase.addGrade', 'Add Grade')}
            </button>
          </div>

          {/* Academic Form Modal */}
          {showAcademicForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>{t('tools.studentDatabase.addAcademicRecord', 'Add Academic Record')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.subject', 'Subject *')}
                    </label>
                    <select
                      value={academicForm.subject}
                      onChange={(e) => setAcademicForm({ ...academicForm, subject: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.studentDatabase.selectSubject', 'Select Subject')}</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.grade3', 'Grade *')}
                    </label>
                    <select
                      value={academicForm.grade}
                      onChange={(e) => setAcademicForm({ ...academicForm, grade: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.studentDatabase.selectGrade2', 'Select Grade')}</option>
                      {LETTER_GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.score0100', 'Score (0-100)')}
                    </label>
                    <input
                      type="number"
                      value={academicForm.score}
                      onChange={(e) => setAcademicForm({ ...academicForm, score: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.semester', 'Semester')}
                    </label>
                    <select
                      value={academicForm.semester}
                      onChange={(e) => setAcademicForm({ ...academicForm, semester: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="Fall">{t('tools.studentDatabase.fall', 'Fall')}</option>
                      <option value="Spring">{t('tools.studentDatabase.spring', 'Spring')}</option>
                      <option value="Summer">{t('tools.studentDatabase.summer', 'Summer')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.year', 'Year')}
                    </label>
                    <input
                      type="text"
                      value={academicForm.year}
                      onChange={(e) => setAcademicForm({ ...academicForm, year: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.comments', 'Comments')}
                    </label>
                    <textarea
                      value={academicForm.comments}
                      onChange={(e) => setAcademicForm({ ...academicForm, comments: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveAcademicRecord}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.studentDatabase.save2', 'Save')}
                  </button>
                  <button
                    onClick={() => setShowAcademicForm(false)}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.studentDatabase.cancel2', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Records List */}
          {selectedStudent && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold ${textPrimary}`}>
                  {selectedStudent.name} - GPA: {calculateGPA(selectedStudent.id).toFixed(2)}
                </h3>
              </div>
              <div className="grid gap-2">
                {academicRecords
                  .filter((r) => r.studentId === selectedStudent.id)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((record) => (
                    <Card key={record.id} className={`${cardBg} ${borderColor} border`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-medium ${textPrimary}`}>{record.subject}</h4>
                            <p className={`text-sm ${textSecondary}`}>
                              {record.semester} {record.year}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <span className={`text-lg font-bold ${textPrimary}`}>{record.grade}</span>
                              <p className={`text-xs ${textSecondary}`}>{t('tools.studentDatabase.grade', 'Grade')}</p>
                            </div>
                            <div className="text-center">
                              <span className={`text-lg font-bold ${textPrimary}`}>{record.score}%</span>
                              <p className={`text-xs ${textSecondary}`}>{t('tools.studentDatabase.score', 'Score')}</p>
                            </div>
                          </div>
                        </div>
                        {record.comments && (
                          <p className={`mt-2 text-sm ${textSecondary}`}>{record.comments}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                {academicRecords.filter((r) => r.studentId === selectedStudent.id).length === 0 && (
                  <div className={`text-center py-8 ${textSecondary}`}>
                    {t('tools.studentDatabase.noAcademicRecordsForThis', 'No academic records for this student yet.')}
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedStudent && (
            <div className={`text-center py-8 ${textSecondary}`}>
              {t('tools.studentDatabase.selectAStudentToView', 'Select a student to view and manage their academic records.')}
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const student = students.find((s) => s.id === e.target.value);
                  setSelectedStudent(student || null);
                  setAttendanceForm({ ...attendanceForm, studentId: e.target.value });
                }}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="">{t('tools.studentDatabase.selectStudent2', 'Select Student')}</option>
                {students.filter((s) => s.status === 'active').map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                if (selectedStudent) {
                  setAttendanceForm({ ...attendanceForm, studentId: selectedStudent.id });
                  setShowAttendanceForm(true);
                }
              }}
              disabled={!selectedStudent}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {t('tools.studentDatabase.recordAttendance2', 'Record Attendance')}
            </button>
          </div>

          {/* Attendance Form Modal */}
          {showAttendanceForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>{t('tools.studentDatabase.recordAttendance', 'Record Attendance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.status2', 'Status *')}
                    </label>
                    <select
                      value={attendanceForm.status}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value as AttendanceRecord['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="present">{t('tools.studentDatabase.present', 'Present')}</option>
                      <option value="absent">{t('tools.studentDatabase.absent', 'Absent')}</option>
                      <option value="late">{t('tools.studentDatabase.late', 'Late')}</option>
                      <option value="excused">{t('tools.studentDatabase.excused', 'Excused')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.notes2', 'Notes')}
                    </label>
                    <input
                      type="text"
                      value={attendanceForm.notes}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.studentDatabase.optionalNotes', 'Optional notes')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveAttendance}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.studentDatabase.save3', 'Save')}
                  </button>
                  <button
                    onClick={() => setShowAttendanceForm(false)}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.studentDatabase.cancel3', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attendance Records List */}
          {selectedStudent && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold ${textPrimary}`}>
                  {selectedStudent.name} - Attendance Rate: {calculateAttendanceRate(selectedStudent.id).toFixed(1)}%
                </h3>
              </div>
              <div className="grid gap-2">
                {attendanceRecords
                  .filter((r) => r.studentId === selectedStudent.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => (
                    <Card key={record.id} className={`${cardBg} ${borderColor} border`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-3 h-3 rounded-full ${
                                record.status === 'present'
                                  ? 'bg-green-500'
                                  : record.status === 'late'
                                  ? 'bg-yellow-500'
                                  : record.status === 'excused'
                                  ? 'bg-blue-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            <div>
                              <p className={`font-medium ${textPrimary}`}>
                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              {record.notes && <p className={`text-sm ${textSecondary}`}>{record.notes}</p>}
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize ${
                              record.status === 'present'
                                ? 'bg-green-500/10 text-green-500'
                                : record.status === 'late'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : record.status === 'excused'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {record.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {attendanceRecords.filter((r) => r.studentId === selectedStudent.id).length === 0 && (
                  <div className={`text-center py-8 ${textSecondary}`}>
                    {t('tools.studentDatabase.noAttendanceRecordsForThis', 'No attendance records for this student yet.')}
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedStudent && (
            <div className={`text-center py-8 ${textSecondary}`}>
              {t('tools.studentDatabase.selectAStudentToView2', 'Select a student to view and manage their attendance records.')}
            </div>
          )}
        </div>
      )}

      {/* Notes & Communication Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const student = students.find((s) => s.id === e.target.value);
                  setSelectedStudent(student || null);
                  setNoteForm({ ...noteForm, studentId: e.target.value });
                }}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="">{t('tools.studentDatabase.selectStudent3', 'Select Student')}</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                if (selectedStudent) {
                  setNoteForm({ ...noteForm, studentId: selectedStudent.id });
                  setShowNoteForm(true);
                }
              }}
              disabled={!selectedStudent}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {t('tools.studentDatabase.addNote', 'Add Note')}
            </button>
          </div>

          {/* Note Form Modal */}
          {showNoteForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>{t('tools.studentDatabase.addNoteCommunicationLog', 'Add Note / Communication Log')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.type', 'Type *')}
                    </label>
                    <select
                      value={noteForm.type}
                      onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value as StudentNote['type'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="general">{t('tools.studentDatabase.generalNote', 'General Note')}</option>
                      <option value="academic">{t('tools.studentDatabase.academic', 'Academic')}</option>
                      <option value="behavioral">{t('tools.studentDatabase.behavioral', 'Behavioral')}</option>
                      <option value="parent-communication">{t('tools.studentDatabase.parentCommunication', 'Parent Communication')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.author', 'Author')}
                    </label>
                    <input
                      type="text"
                      value={noteForm.author}
                      onChange={(e) => setNoteForm({ ...noteForm, author: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.studentDatabase.teacherName', 'Teacher name')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.studentDatabase.content', 'Content *')}
                    </label>
                    <textarea
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                      rows={4}
                      placeholder={t('tools.studentDatabase.enterNoteContent', 'Enter note content...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveNote}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.studentDatabase.save4', 'Save')}
                  </button>
                  <button
                    onClick={() => setShowNoteForm(false)}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.studentDatabase.cancel4', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes List */}
          {selectedStudent && (
            <div className="grid gap-2">
              {notes
                .filter((n) => n.studentId === selectedStudent.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((note) => (
                  <Card key={note.id} className={`${cardBg} ${borderColor} border`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                                note.type === 'parent-communication'
                                  ? 'bg-purple-500/10 text-purple-500'
                                  : note.type === 'academic'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : note.type === 'behavioral'
                                  ? 'bg-orange-500/10 text-orange-500'
                                  : 'bg-gray-500/10 text-gray-500'
                              }`}
                            >
                              {note.type.replace('-', ' ')}
                            </span>
                            {note.author && (
                              <span className={`text-xs ${textSecondary}`}>by {note.author}</span>
                            )}
                          </div>
                          <p className={`mt-2 ${textPrimary}`}>{note.content}</p>
                          <p className={`text-xs mt-2 ${textSecondary}`}>
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {notes.filter((n) => n.studentId === selectedStudent.id).length === 0 && (
                <div className={`text-center py-8 ${textSecondary}`}>
                  {t('tools.studentDatabase.noNotesForThisStudent', 'No notes for this student yet.')}
                </div>
              )}
            </div>
          )}

          {!selectedStudent && (
            <div className={`text-center py-8 ${textSecondary}`}>
              {t('tools.studentDatabase.selectAStudentToView3', 'Select a student to view and manage their notes and communication logs.')}
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto text-indigo-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalStudents}</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.studentDatabase.totalStudents', 'Total Students')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <UserCheck className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.activeStudents}</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.studentDatabase.activeStudents', 'Active Students')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <Award className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.graduatedStudents}</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.studentDatabase.graduated3', 'Graduated')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <ClipboardCheck className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.overallAttendanceRate.toFixed(1)}%</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.studentDatabase.attendanceRate', 'Attendance Rate')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Students by Grade */}
          <Card className={`${cardBg} ${borderColor} border`}>
            <CardHeader>
              <CardTitle className={textPrimary}>{t('tools.studentDatabase.studentsByGrade', 'Students by Grade')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byGrade)
                  .sort(([a], [b]) => GRADES.indexOf(a) - GRADES.indexOf(b))
                  .map(([grade, count]) => {
                    const maxCount = Math.max(...Object.values(stats.byGrade), 1);
                    const percentage = (count / maxCount) * 100;

                    return (
                      <div key={grade}>
                        <div className="flex justify-between mb-1">
                          <span className={textPrimary}>{grade}</span>
                          <span className={textSecondary}>{count} students</span>
                        </div>
                        <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(stats.byGrade).length === 0 && (
                  <div className={`text-center py-4 ${textSecondary}`}>
                    {t('tools.studentDatabase.noStudentDataAvailable', 'No student data available.')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className={`${cardBg} ${borderColor} border`}>
            <CardHeader>
              <CardTitle className={textPrimary}>{t('tools.studentDatabase.topPerformersByGpa', 'Top Performers (by GPA)')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students
                  .filter((s) => s.status === 'active')
                  .map((s) => ({ ...s, gpa: calculateGPA(s.id) }))
                  .filter((s) => s.gpa > 0)
                  .sort((a, b) => b.gpa - a.gpa)
                  .slice(0, 5)
                  .map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? 'bg-yellow-500 text-white'
                              : index === 1
                              ? 'bg-gray-400 text-white'
                              : index === 2
                              ? 'bg-amber-600 text-white'
                              : `${isDark ? 'bg-gray-700' : 'bg-gray-200'} ${textSecondary}`
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{student.name}</p>
                          <p className={`text-xs ${textSecondary}`}>{student.grade} - Class {student.class}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-indigo-500`}>{student.gpa.toFixed(2)}</span>
                    </div>
                  ))}
                {students.filter((s) => calculateGPA(s.id) > 0).length === 0 && (
                  <div className={`text-center py-4 ${textSecondary}`}>
                    {t('tools.studentDatabase.noAcademicRecordsAvailable', 'No academic records available.')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${textPrimary}`}>
          {t('tools.studentDatabase.aboutStudentDatabase', 'About Student Database')}
        </h3>
        <p className={`text-sm ${textSecondary}`}>
          A comprehensive student management system for educational institutions. Track student information,
          academic records, attendance, and maintain parent communication logs. All data is automatically
          saved to your browser's local storage with optional API synchronization.
        </p>
      </div>
    </div>
  );
};

export default StudentDatabaseTool;
