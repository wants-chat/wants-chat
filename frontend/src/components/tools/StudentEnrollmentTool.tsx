'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  Users,
  UserPlus,
  Calendar,
  ClipboardList,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Building2,
  BookOpen,
  CreditCard,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

// ============ INTERFACES ============
interface StudentEnrollmentToolProps {
  uiConfig?: UIConfig;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  enrollmentDate: string;
  gradeLevel: string;
  status: 'pending' | 'enrolled' | 'waitlisted' | 'withdrawn' | 'graduated';
  programId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  description?: string;
  department: string;
  capacity: number;
  enrolled: number;
  startDate: string;
  endDate: string;
  tuitionCost: number;
  status: 'open' | 'closed' | 'full';
  createdAt: string;
}

interface EnrollmentApplication {
  id: string;
  studentId: string;
  programId: string;
  applicationDate: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  documents: string[];
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

type ActiveTab = 'students' | 'programs' | 'applications' | 'reports';

// Column configurations for exports
const STUDENT_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'gradeLevel', header: 'Grade Level', type: 'string' },
  { key: 'programName', header: 'Program', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'enrollmentDate', header: 'Enrollment Date', type: 'date' },
  { key: 'guardianName', header: 'Guardian', type: 'string' },
  { key: 'guardianPhone', header: 'Guardian Phone', type: 'string' },
];

const PROGRAM_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Program Name', type: 'string' },
  { key: 'code', header: 'Code', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'enrolled', header: 'Enrolled', type: 'number' },
  { key: 'tuitionCost', header: 'Tuition', type: 'currency' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
];

const APPLICATION_COLUMNS: ColumnConfig[] = [
  { key: 'studentName', header: 'Student Name', type: 'string' },
  { key: 'programName', header: 'Program', type: 'string' },
  { key: 'applicationDate', header: 'Applied On', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'reviewNotes', header: 'Notes', type: 'string' },
];

// ============ HELPER FUNCTIONS ============
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const GRADE_LEVELS = ['Pre-K', 'Kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const DEPARTMENTS = ['Arts & Humanities', 'Sciences', 'Mathematics', 'Technology', 'Business', 'Education', 'Health Sciences', 'Social Sciences'];

const STATUS_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', darkBg: 'bg-yellow-900/30', darkText: 'text-yellow-400' },
  enrolled: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
  waitlisted: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/30', darkText: 'text-blue-400' },
  withdrawn: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'bg-red-900/30', darkText: 'text-red-400' },
  graduated: { bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'bg-purple-900/30', darkText: 'text-purple-400' },
  submitted: { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'bg-gray-900/30', darkText: 'text-gray-400' },
  under_review: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/30', darkText: 'text-blue-400' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'bg-red-900/30', darkText: 'text-red-400' },
  open: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'bg-gray-900/30', darkText: 'text-gray-400' },
  full: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'bg-red-900/30', darkText: 'text-red-400' },
};

// ============ SAMPLE DATA GENERATOR ============
const generateSampleData = () => {
  const now = new Date().toISOString();

  const programs: Program[] = [
    { id: 'prog-1', name: 'Computer Science', code: 'CS101', description: 'Introduction to programming and computer science fundamentals', department: 'Technology', capacity: 30, enrolled: 25, startDate: '2024-09-01', endDate: '2025-05-31', tuitionCost: 15000, status: 'open', createdAt: now },
    { id: 'prog-2', name: 'Business Administration', code: 'BA101', description: 'Core business principles and management skills', department: 'Business', capacity: 40, enrolled: 40, startDate: '2024-09-01', endDate: '2025-05-31', tuitionCost: 12000, status: 'full', createdAt: now },
    { id: 'prog-3', name: 'Biology', code: 'BIO101', description: 'Introduction to biological sciences', department: 'Sciences', capacity: 35, enrolled: 20, startDate: '2024-09-01', endDate: '2025-05-31', tuitionCost: 14000, status: 'open', createdAt: now },
  ];

  const students: Student[] = [
    { id: 'stu-1', firstName: 'Emma', lastName: 'Johnson', email: 'emma.j@email.com', phone: '555-0101', dateOfBirth: '2006-03-15', address: '123 Main St', city: 'Springfield', state: 'IL', zipCode: '62701', guardianName: 'Robert Johnson', guardianPhone: '555-0201', guardianEmail: 'rjohnson@email.com', enrollmentDate: '2024-08-15', gradeLevel: '11th', status: 'enrolled', programId: 'prog-1', createdAt: now, updatedAt: now },
    { id: 'stu-2', firstName: 'Liam', lastName: 'Smith', email: 'liam.s@email.com', phone: '555-0102', dateOfBirth: '2005-07-22', address: '456 Oak Ave', city: 'Springfield', state: 'IL', zipCode: '62702', guardianName: 'Sarah Smith', guardianPhone: '555-0202', enrollmentDate: '2024-08-20', gradeLevel: '12th', status: 'enrolled', programId: 'prog-1', createdAt: now, updatedAt: now },
    { id: 'stu-3', firstName: 'Olivia', lastName: 'Williams', email: 'olivia.w@email.com', phone: '555-0103', dateOfBirth: '2006-11-08', address: '789 Pine Rd', city: 'Springfield', state: 'IL', zipCode: '62703', enrollmentDate: '2024-09-01', gradeLevel: '10th', status: 'pending', programId: 'prog-3', createdAt: now, updatedAt: now },
  ];

  const applications: EnrollmentApplication[] = [
    { id: 'app-1', studentId: 'stu-3', programId: 'prog-3', applicationDate: '2024-08-25', status: 'under_review', documents: ['transcript', 'recommendation'], createdAt: now },
    { id: 'app-2', studentId: 'stu-1', programId: 'prog-1', applicationDate: '2024-08-10', status: 'approved', documents: ['transcript', 'recommendation', 'essay'], reviewNotes: 'Excellent candidate', reviewedBy: 'Dr. Smith', reviewedAt: '2024-08-12', createdAt: now },
  ];

  return { programs, students, applications };
};

// ============ MAIN COMPONENT ============
export const StudentEnrollmentTool: React.FC<StudentEnrollmentToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize sample data
  const defaultData = generateSampleData();

  // Use useToolData hooks for backend sync
  const {
    data: students,
    addItem: addStudent,
    updateItem: updateStudent,
    deleteItem: deleteStudent,
    isSynced: studentsSynced,
    isSaving: studentsSaving,
    lastSaved: studentsLastSaved,
    syncError: studentsSyncError,
    forceSync: forceStudentsSync,
    exportCSV: exportStudentsCSV,
    exportExcel: exportStudentsExcel,
    exportJSON: exportStudentsJSON,
    exportPDF: exportStudentsPDF,
    copyToClipboard: copyStudentsToClipboard,
    print: printStudents,
  } = useToolData<Student>('student-enrollment-students', defaultData.students, STUDENT_COLUMNS);

  const {
    data: programs,
    addItem: addProgram,
    updateItem: updateProgram,
    deleteItem: deleteProgram,
  } = useToolData<Program>('student-enrollment-programs', defaultData.programs, PROGRAM_COLUMNS);

  const {
    data: applications,
    addItem: addApplication,
    updateItem: updateApplication,
    deleteItem: deleteApplication,
  } = useToolData<EnrollmentApplication>('student-enrollment-applications', defaultData.applications, APPLICATION_COLUMNS);

  // State
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('students');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterProgram, setFilterProgram] = useState<string>('');
  const [filterGradeLevel, setFilterGradeLevel] = useState<string>('');

  // Form states
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Student form
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    enrollmentDate: getCurrentDate(),
    gradeLevel: '',
    status: 'pending' as Student['status'],
    programId: '',
    notes: '',
  });

  // Program form
  const [programForm, setProgramForm] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    capacity: 30,
    startDate: getCurrentDate(),
    endDate: '',
    tuitionCost: 0,
    status: 'open' as Program['status'],
  });

  // Application form
  const [applicationForm, setApplicationForm] = useState({
    studentId: '',
    programId: '',
    documents: [] as string[],
    reviewNotes: '',
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.firstName || params.lastName || params.email) {
        setStudentForm(prev => ({
          ...prev,
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          email: params.email || '',
          phone: params.phone || '',
        }));
        setShowStudentForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig, isPrefilled]);

  // ============ COMPUTED VALUES ============
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !searchTerm ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || student.status === filterStatus;
      const matchesProgram = !filterProgram || student.programId === filterProgram;
      const matchesGradeLevel = !filterGradeLevel || student.gradeLevel === filterGradeLevel;
      return matchesSearch && matchesStatus && matchesProgram && matchesGradeLevel;
    });
  }, [students, searchTerm, filterStatus, filterProgram, filterGradeLevel]);

  const stats = useMemo(() => {
    return {
      totalStudents: students.length,
      enrolledStudents: students.filter(s => s.status === 'enrolled').length,
      pendingApplications: applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
      totalPrograms: programs.length,
      openPrograms: programs.filter(p => p.status === 'open').length,
      totalCapacity: programs.reduce((sum, p) => sum + p.capacity, 0),
      totalEnrolled: programs.reduce((sum, p) => sum + p.enrolled, 0),
    };
  }, [students, programs, applications]);

  // ============ HANDLERS ============
  const handleSaveStudent = () => {
    if (!studentForm.firstName || !studentForm.lastName || !studentForm.email) return;

    const now = new Date().toISOString();
    if (editingStudent) {
      updateStudent(editingStudent.id, {
        ...studentForm,
        updatedAt: now,
      });
    } else {
      const newStudent: Student = {
        ...studentForm,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      addStudent(newStudent);
    }
    resetStudentForm();
  };

  const resetStudentForm = () => {
    setStudentForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      enrollmentDate: getCurrentDate(),
      gradeLevel: '',
      status: 'pending',
      programId: '',
      notes: '',
    });
    setEditingStudent(null);
    setShowStudentForm(false);
  };

  const handleEditStudent = (student: Student) => {
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      city: student.city,
      state: student.state,
      zipCode: student.zipCode,
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      guardianEmail: student.guardianEmail || '',
      enrollmentDate: student.enrollmentDate,
      gradeLevel: student.gradeLevel,
      status: student.status,
      programId: student.programId,
      notes: student.notes || '',
    });
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleSaveProgram = () => {
    if (!programForm.name || !programForm.code) return;

    const now = new Date().toISOString();
    if (editingProgram) {
      updateProgram(editingProgram.id, programForm);
    } else {
      const newProgram: Program = {
        ...programForm,
        id: generateId(),
        enrolled: 0,
        createdAt: now,
      };
      addProgram(newProgram);
    }
    resetProgramForm();
  };

  const resetProgramForm = () => {
    setProgramForm({
      name: '',
      code: '',
      description: '',
      department: '',
      capacity: 30,
      startDate: getCurrentDate(),
      endDate: '',
      tuitionCost: 0,
      status: 'open',
    });
    setEditingProgram(null);
    setShowProgramForm(false);
  };

  const handleSubmitApplication = () => {
    if (!applicationForm.studentId || !applicationForm.programId) return;

    const now = new Date().toISOString();
    const newApplication: EnrollmentApplication = {
      id: generateId(),
      studentId: applicationForm.studentId,
      programId: applicationForm.programId,
      applicationDate: getCurrentDate(),
      status: 'submitted',
      documents: applicationForm.documents,
      createdAt: now,
    };
    addApplication(newApplication);
    setApplicationForm({ studentId: '', programId: '', documents: [], reviewNotes: '' });
    setShowApplicationForm(false);
  };

  const handleApproveApplication = (app: EnrollmentApplication) => {
    const now = new Date().toISOString();
    updateApplication(app.id, {
      status: 'approved',
      reviewedAt: now,
    });

    // Update student status to enrolled
    const student = students.find(s => s.id === app.studentId);
    if (student) {
      updateStudent(student.id, { status: 'enrolled', updatedAt: now });
    }

    // Update program enrolled count
    const program = programs.find(p => p.id === app.programId);
    if (program) {
      const newEnrolled = program.enrolled + 1;
      updateProgram(program.id, {
        enrolled: newEnrolled,
        status: newEnrolled >= program.capacity ? 'full' : 'open',
      });
    }
  };

  const handleRejectApplication = (app: EnrollmentApplication) => {
    updateApplication(app.id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
    });
  };

  const getProgramById = (id: string) => programs.find(p => p.id === id);
  const getStudentById = (id: string) => students.find(s => s.id === id);

  // ============ RENDER ============
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.studentEnrollment.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.studentEnrollment.studentEnrollment', 'Student Enrollment')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.studentEnrollment.manageStudentRegistrationsProgramsAnd', 'Manage student registrations, programs, and applications')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="student-enrollment" toolName="Student Enrollment" />

              <SyncStatus
                isSynced={studentsSynced}
                isSaving={studentsSaving}
                lastSaved={studentsLastSaved}
                syncError={studentsSyncError}
                onForceSync={forceStudentsSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = filteredStudents.map(s => ({
                    ...s,
                    programName: getProgramById(s.programId)?.name || '',
                  }));
                  exportStudentsCSV(exportData);
                }}
                onExportExcel={() => {
                  const exportData = filteredStudents.map(s => ({
                    ...s,
                    programName: getProgramById(s.programId)?.name || '',
                  }));
                  exportStudentsExcel(exportData);
                }}
                onExportJSON={() => exportStudentsJSON(filteredStudents)}
                onExportPDF={() => {
                  const exportData = filteredStudents.map(s => ({
                    ...s,
                    programName: getProgramById(s.programId)?.name || '',
                  }));
                  exportStudentsPDF(exportData, 'Student Enrollment Report');
                }}
                onCopyToClipboard={() => copyStudentsToClipboard(filteredStudents)}
                onPrint={() => printStudents(filteredStudents, 'Student Enrollment Report')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studentEnrollment.totalStudents', 'Total Students')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalStudents}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studentEnrollment.enrolled', 'Enrolled')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.enrolledStudents}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studentEnrollment.pendingApps', 'Pending Apps')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingApplications}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studentEnrollment.programs', 'Programs')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalPrograms}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'students', label: 'Students', icon: Users },
              { id: 'programs', label: 'Programs', icon: BookOpen },
              { id: 'applications', label: 'Applications', icon: ClipboardList },
              { id: 'reports', label: 'Reports', icon: FileText },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
                    : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        placeholder={t('tools.studentEnrollment.searchStudents', 'Search students...')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.studentEnrollment.allStatuses', 'All Statuses')}</option>
                    <option value="pending">{t('tools.studentEnrollment.pending', 'Pending')}</option>
                    <option value="enrolled">{t('tools.studentEnrollment.enrolled2', 'Enrolled')}</option>
                    <option value="waitlisted">{t('tools.studentEnrollment.waitlisted', 'Waitlisted')}</option>
                    <option value="withdrawn">{t('tools.studentEnrollment.withdrawn', 'Withdrawn')}</option>
                    <option value="graduated">{t('tools.studentEnrollment.graduated', 'Graduated')}</option>
                  </select>
                  <select
                    value={filterProgram}
                    onChange={e => setFilterProgram(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.studentEnrollment.allPrograms', 'All Programs')}</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowStudentForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B] transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('tools.studentEnrollment.addStudent', 'Add Student')}
                  </button>
                </div>

                {/* Students List */}
                <div className="space-y-4">
                  {filteredStudents.map(student => (
                    <div
                      key={student.id}
                      className={`border rounded-lg ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedStudentId(expandedStudentId === student.id ? null : student.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {student.email} | {student.gradeLevel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isDark
                              ? STATUS_COLORS[student.status]?.darkBg + ' ' + STATUS_COLORS[student.status]?.darkText
                              : STATUS_COLORS[student.status]?.bg + ' ' + STATUS_COLORS[student.status]?.text
                          }`}>
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); handleEditStudent(student); }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            >
                              <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); deleteStudent(student.id); }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          {expandedStudentId === student.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                      {expandedStudentId === student.id && (
                        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.studentEnrollment.phone', 'Phone')}</p>
                              <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{student.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.studentEnrollment.dateOfBirth', 'Date of Birth')}</p>
                              <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(student.dateOfBirth)}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.studentEnrollment.program', 'Program')}</p>
                              <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{getProgramById(student.programId)?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.studentEnrollment.enrollmentDate', 'Enrollment Date')}</p>
                              <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(student.enrollmentDate)}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.studentEnrollment.address', 'Address')}</p>
                              <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {student.address}, {student.city}, {student.state} {student.zipCode}
                              </p>
                            </div>
                            {student.guardianName && (
                              <div>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.studentEnrollment.guardian', 'Guardian')}</p>
                                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{student.guardianName}</p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{student.guardianPhone}</p>
                              </div>
                            )}
                          </div>
                          {student.notes && (
                            <div className="mt-4">
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.studentEnrollment.notes', 'Notes')}</p>
                              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{student.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.studentEnrollment.noStudentsFound', 'No students found')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Programs Tab */}
            {activeTab === 'programs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studentEnrollment.programs2', 'Programs')}</h2>
                  <button
                    onClick={() => setShowProgramForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.studentEnrollment.addProgram', 'Add Program')}
                  </button>
                </div>
                <div className="grid gap-4">
                  {programs.map(program => (
                    <div key={program.id} className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{program.name}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                              {program.code}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              isDark
                                ? STATUS_COLORS[program.status]?.darkBg + ' ' + STATUS_COLORS[program.status]?.darkText
                                : STATUS_COLORS[program.status]?.bg + ' ' + STATUS_COLORS[program.status]?.text
                            }`}>
                              {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {program.department} | {formatCurrency(program.tuitionCost)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.studentEnrollment.enrollment', 'Enrollment')}</p>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {program.enrolled} / {program.capacity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setProgramForm({
                                  name: program.name,
                                  code: program.code,
                                  description: program.description || '',
                                  department: program.department,
                                  capacity: program.capacity,
                                  startDate: program.startDate,
                                  endDate: program.endDate,
                                  tuitionCost: program.tuitionCost,
                                  status: program.status,
                                });
                                setEditingProgram(program);
                                setShowProgramForm(true);
                              }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            </button>
                            <button
                              onClick={() => deleteProgram(program.id)}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {program.description && (
                        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{program.description}</p>
                      )}
                      <div className="mt-3">
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full rounded-full ${program.enrolled >= program.capacity ? 'bg-red-500' : t('tools.studentEnrollment.bg0d9488', 'bg-[#0D9488]')}`}
                            style={{ width: `${Math.min((program.enrolled / program.capacity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studentEnrollment.applications', 'Applications')}</h2>
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.studentEnrollment.newApplication', 'New Application')}
                  </button>
                </div>
                <div className="space-y-4">
                  {applications.map(app => {
                    const student = getStudentById(app.studentId);
                    const program = getProgramById(app.programId);
                    return (
                      <div key={app.id} className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {program?.name || 'Unknown Program'} | Applied: {formatDate(app.applicationDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isDark
                                ? STATUS_COLORS[app.status]?.darkBg + ' ' + STATUS_COLORS[app.status]?.darkText
                                : STATUS_COLORS[app.status]?.bg + ' ' + STATUS_COLORS[app.status]?.text
                            }`}>
                              {app.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {(app.status === 'submitted' || app.status === 'under_review') && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveApplication(app)}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectApplication(app)}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {app.documents.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {app.documents.map((doc, i) => (
                              <span key={i} className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                {doc}
                              </span>
                            ))}
                          </div>
                        )}
                        {app.reviewNotes && (
                          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Notes: {app.reviewNotes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {applications.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.studentEnrollment.noApplicationsYet', 'No applications yet')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studentEnrollment.enrollmentReports', 'Enrollment Reports')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studentEnrollment.enrollmentByStatus', 'Enrollment by Status')}</h3>
                    <div className="space-y-3">
                      {['pending', 'enrolled', 'waitlisted', 'withdrawn', 'graduated'].map(status => {
                        const count = students.filter(s => s.status === status).length;
                        const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
                        return (
                          <div key={status}>
                            <div className="flex justify-between mb-1">
                              <span className={`capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{status}</span>
                              <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div
                                className={`h-full rounded-full ${
                                  isDark ? STATUS_COLORS[status]?.darkBg : STATUS_COLORS[status]?.bg
                                }`}
                                style={{ width: `${percentage}%`, backgroundColor: status === 'enrolled' ? '#0D9488' : undefined }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studentEnrollment.programCapacity', 'Program Capacity')}</h3>
                    <div className="space-y-3">
                      {programs.map(program => {
                        const percentage = (program.enrolled / program.capacity) * 100;
                        return (
                          <div key={program.id}>
                            <div className="flex justify-between mb-1">
                              <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{program.name}</span>
                              <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{program.enrolled}/{program.capacity}</span>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div
                                className={`h-full rounded-full ${percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : t('tools.studentEnrollment.bg0d94882', 'bg-[#0D9488]')}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Form Modal */}
        {showStudentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingStudent ? t('tools.studentEnrollment.editStudent', 'Edit Student') : t('tools.studentEnrollment.addNewStudent', 'Add New Student')}
                </h2>
                <button onClick={resetStudentForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.firstName', 'First Name *')}</label>
                  <input
                    type="text"
                    value={studentForm.firstName}
                    onChange={e => setStudentForm({ ...studentForm, firstName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.lastName', 'Last Name *')}</label>
                  <input
                    type="text"
                    value={studentForm.lastName}
                    onChange={e => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.email', 'Email *')}</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.phone2', 'Phone')}</label>
                  <input
                    type="tel"
                    value={studentForm.phone}
                    onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.dateOfBirth2', 'Date of Birth')}</label>
                  <input
                    type="date"
                    value={studentForm.dateOfBirth}
                    onChange={e => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.gradeLevel', 'Grade Level')}</label>
                  <select
                    value={studentForm.gradeLevel}
                    onChange={e => setStudentForm({ ...studentForm, gradeLevel: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.studentEnrollment.selectGrade', 'Select Grade')}</option>
                    {GRADE_LEVELS.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.program2', 'Program')}</label>
                  <select
                    value={studentForm.programId}
                    onChange={e => setStudentForm({ ...studentForm, programId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.studentEnrollment.selectProgram', 'Select Program')}</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.status', 'Status')}</label>
                  <select
                    value={studentForm.status}
                    onChange={e => setStudentForm({ ...studentForm, status: e.target.value as Student['status'] })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="pending">{t('tools.studentEnrollment.pending2', 'Pending')}</option>
                    <option value="enrolled">{t('tools.studentEnrollment.enrolled3', 'Enrolled')}</option>
                    <option value="waitlisted">{t('tools.studentEnrollment.waitlisted2', 'Waitlisted')}</option>
                    <option value="withdrawn">{t('tools.studentEnrollment.withdrawn2', 'Withdrawn')}</option>
                    <option value="graduated">{t('tools.studentEnrollment.graduated2', 'Graduated')}</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.address2', 'Address')}</label>
                  <input
                    type="text"
                    value={studentForm.address}
                    onChange={e => setStudentForm({ ...studentForm, address: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.city', 'City')}</label>
                  <input
                    type="text"
                    value={studentForm.city}
                    onChange={e => setStudentForm({ ...studentForm, city: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.state', 'State')}</label>
                    <input
                      type="text"
                      value={studentForm.state}
                      onChange={e => setStudentForm({ ...studentForm, state: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.zip', 'ZIP')}</label>
                    <input
                      type="text"
                      value={studentForm.zipCode}
                      onChange={e => setStudentForm({ ...studentForm, zipCode: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.guardianName', 'Guardian Name')}</label>
                  <input
                    type="text"
                    value={studentForm.guardianName}
                    onChange={e => setStudentForm({ ...studentForm, guardianName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.guardianPhone', 'Guardian Phone')}</label>
                  <input
                    type="tel"
                    value={studentForm.guardianPhone}
                    onChange={e => setStudentForm({ ...studentForm, guardianPhone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.notes2', 'Notes')}</label>
                  <textarea
                    value={studentForm.notes}
                    onChange={e => setStudentForm({ ...studentForm, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetStudentForm}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.studentEnrollment.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveStudent}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B]"
                >
                  {editingStudent ? t('tools.studentEnrollment.updateStudent', 'Update Student') : t('tools.studentEnrollment.addStudent2', 'Add Student')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Program Form Modal */}
        {showProgramForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingProgram ? t('tools.studentEnrollment.editProgram', 'Edit Program') : t('tools.studentEnrollment.addNewProgram', 'Add New Program')}
                </h2>
                <button onClick={resetProgramForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.programName', 'Program Name *')}</label>
                    <input
                      type="text"
                      value={programForm.name}
                      onChange={e => setProgramForm({ ...programForm, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.code', 'Code *')}</label>
                    <input
                      type="text"
                      value={programForm.code}
                      onChange={e => setProgramForm({ ...programForm, code: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.description', 'Description')}</label>
                  <textarea
                    value={programForm.description}
                    onChange={e => setProgramForm({ ...programForm, description: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.department', 'Department')}</label>
                    <select
                      value={programForm.department}
                      onChange={e => setProgramForm({ ...programForm, department: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">{t('tools.studentEnrollment.selectDepartment', 'Select Department')}</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.capacity', 'Capacity')}</label>
                    <input
                      type="number"
                      value={programForm.capacity}
                      onChange={e => setProgramForm({ ...programForm, capacity: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.startDate', 'Start Date')}</label>
                    <input
                      type="date"
                      value={programForm.startDate}
                      onChange={e => setProgramForm({ ...programForm, startDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.endDate', 'End Date')}</label>
                    <input
                      type="date"
                      value={programForm.endDate}
                      onChange={e => setProgramForm({ ...programForm, endDate: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.tuitionCost', 'Tuition Cost')}</label>
                  <input
                    type="number"
                    value={programForm.tuitionCost}
                    onChange={e => setProgramForm({ ...programForm, tuitionCost: parseInt(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetProgramForm}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.studentEnrollment.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveProgram}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B]"
                >
                  {editingProgram ? t('tools.studentEnrollment.updateProgram', 'Update Program') : t('tools.studentEnrollment.addProgram2', 'Add Program')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.studentEnrollment.newEnrollmentApplication', 'New Enrollment Application')}
                </h2>
                <button onClick={() => setShowApplicationForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.student', 'Student *')}</label>
                  <select
                    value={applicationForm.studentId}
                    onChange={e => setApplicationForm({ ...applicationForm, studentId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.studentEnrollment.selectStudent', 'Select Student')}</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentEnrollment.program3', 'Program *')}</label>
                  <select
                    value={applicationForm.programId}
                    onChange={e => setApplicationForm({ ...applicationForm, programId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">{t('tools.studentEnrollment.selectProgram2', 'Select Program')}</option>
                    {programs.filter(p => p.status === 'open').map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.enrolled}/{p.capacity})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.studentEnrollment.cancel3', 'Cancel')}
                </button>
                <button
                  onClick={handleSubmitApplication}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B]"
                >
                  {t('tools.studentEnrollment.submitApplication', 'Submit Application')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollmentTool;
