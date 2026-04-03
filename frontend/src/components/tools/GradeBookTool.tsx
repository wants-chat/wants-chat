'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  BookOpen,
  Users,
  Calendar,
  ClipboardList,
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Award,
  TrendingUp,
  TrendingDown,
  Percent,
  Calculator,
  GraduationCap,
  Sparkles,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { type ColumnConfig } from '../../lib/toolDataUtils';

// Types
interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  semester: string;
  year: string;
  gradeLevel: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  email?: string;
  courseIds: string[];
  createdAt: string;
}

interface Assignment {
  id: string;
  courseId: string;
  name: string;
  type: 'homework' | 'quiz' | 'test' | 'project' | 'participation';
  maxPoints: number;
  weight: number; // percentage weight for grade calculation
  dueDate: string;
  description?: string;
  createdAt: string;
}

interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  courseId: string;
  score: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt: string;
  createdAt: string;
}

type TabType = 'classes' | 'grades' | 'assignments' | 'reports';

// Export column configuration for grades data
const gradeExportColumns: ColumnConfig[] = [
  { key: 'studentName', header: 'Student Name', type: 'string' },
  { key: 'studentId', header: 'Student ID', type: 'string' },
  { key: 'courseName', header: 'Course', type: 'string' },
  { key: 'courseCode', header: 'Course Code', type: 'string' },
  { key: 'assignmentName', header: 'Assignment', type: 'string' },
  { key: 'assignmentType', header: 'Type', type: 'string' },
  { key: 'score', header: 'Score', type: 'number' },
  { key: 'maxPoints', header: 'Max Points', type: 'number' },
  { key: 'percentage', header: 'Percentage', type: 'number' },
  { key: 'letterGrade', header: 'Grade', type: 'string' },
  { key: 'feedback', header: 'Feedback', type: 'string' },
  { key: 'gradedAt', header: 'Graded At', type: 'date' },
];

const GRADE_LEVELS = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College'];
const SEMESTERS = ['Fall', 'Spring', 'Summer', 'Full Year'];
const ASSIGNMENT_TYPES: { value: Assignment['type']; label: string; color: string }[] = [
  { value: 'homework', label: 'Homework', color: 'blue' },
  { value: 'quiz', label: 'Quiz', color: 'purple' },
  { value: 'test', label: 'Test', color: 'red' },
  { value: 'project', label: 'Project', color: 'green' },
  { value: 'participation', label: 'Participation', color: 'orange' },
];

// Generate sample data
const generateSampleData = () => {
  const now = new Date().toISOString();
  const currentYear = new Date().getFullYear().toString();

  const courses: Course[] = [
    {
      id: 'course-1',
      name: 'Algebra II',
      code: 'MATH201',
      description: 'Advanced algebraic concepts including polynomials, functions, and equations',
      semester: 'Fall',
      year: currentYear,
      gradeLevel: '10th',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-2',
      name: 'English Literature',
      code: 'ENG301',
      description: 'American and British literature analysis',
      semester: 'Fall',
      year: currentYear,
      gradeLevel: '11th',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-3',
      name: 'Biology',
      code: 'BIO101',
      description: 'Introduction to biological sciences',
      semester: 'Fall',
      year: currentYear,
      gradeLevel: '9th',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const students: Student[] = [
    { id: 'student-1', name: 'Alice Johnson', studentId: 'STU001', email: 'alice@school.edu', courseIds: ['course-1', 'course-2'], createdAt: now },
    { id: 'student-2', name: 'Bob Smith', studentId: 'STU002', email: 'bob@school.edu', courseIds: ['course-1', 'course-3'], createdAt: now },
    { id: 'student-3', name: 'Carol Davis', studentId: 'STU003', email: 'carol@school.edu', courseIds: ['course-1', 'course-2', 'course-3'], createdAt: now },
    { id: 'student-4', name: 'David Wilson', studentId: 'STU004', email: 'david@school.edu', courseIds: ['course-2'], createdAt: now },
    { id: 'student-5', name: 'Emma Brown', studentId: 'STU005', email: 'emma@school.edu', courseIds: ['course-1', 'course-3'], createdAt: now },
  ];

  const assignments: Assignment[] = [
    { id: 'assign-1', courseId: 'course-1', name: 'Chapter 1 Homework', type: 'homework', maxPoints: 100, weight: 10, dueDate: '2024-09-15', createdAt: now },
    { id: 'assign-2', courseId: 'course-1', name: 'Quiz 1: Polynomials', type: 'quiz', maxPoints: 50, weight: 15, dueDate: '2024-09-20', createdAt: now },
    { id: 'assign-3', courseId: 'course-1', name: 'Midterm Exam', type: 'test', maxPoints: 100, weight: 25, dueDate: '2024-10-15', createdAt: now },
    { id: 'assign-4', courseId: 'course-2', name: 'Essay: The Great Gatsby', type: 'project', maxPoints: 100, weight: 20, dueDate: '2024-09-25', createdAt: now },
    { id: 'assign-5', courseId: 'course-2', name: 'Class Discussion', type: 'participation', maxPoints: 50, weight: 10, dueDate: '2024-09-30', createdAt: now },
    { id: 'assign-6', courseId: 'course-3', name: 'Lab Report: Cell Structure', type: 'project', maxPoints: 100, weight: 15, dueDate: '2024-09-18', createdAt: now },
  ];

  const grades: Grade[] = [
    { id: 'grade-1', studentId: 'student-1', assignmentId: 'assign-1', courseId: 'course-1', score: 92, feedback: 'Excellent work!', gradedAt: now, createdAt: now },
    { id: 'grade-2', studentId: 'student-1', assignmentId: 'assign-2', courseId: 'course-1', score: 45, gradedAt: now, createdAt: now },
    { id: 'grade-3', studentId: 'student-2', assignmentId: 'assign-1', courseId: 'course-1', score: 85, gradedAt: now, createdAt: now },
    { id: 'grade-4', studentId: 'student-3', assignmentId: 'assign-1', courseId: 'course-1', score: 78, feedback: 'Good effort, review section 1.3', gradedAt: now, createdAt: now },
    { id: 'grade-5', studentId: 'student-1', assignmentId: 'assign-4', courseId: 'course-2', score: 88, feedback: 'Strong analysis', gradedAt: now, createdAt: now },
    { id: 'grade-6', studentId: 'student-3', assignmentId: 'assign-6', courseId: 'course-3', score: 95, feedback: 'Outstanding lab report!', gradedAt: now, createdAt: now },
  ];

  return { courses, students, assignments, grades };
};

// Calculate letter grade from percentage
const percentageToLetterGrade = (percentage: number): string => {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
};

// Get grade color
const getGradeColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-500';
  if (percentage >= 80) return 'text-blue-500';
  if (percentage >= 70) return 'text-yellow-500';
  if (percentage >= 60) return 'text-orange-500';
  return 'text-red-500';
};

interface GradeBookToolProps {
  uiConfig?: UIConfig;
}

export const GradeBookTool: React.FC<GradeBookToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Initialize default data
  const defaultData = generateSampleData();
  const defaultGrades = defaultData.grades;

  // Use useToolData hook for backend sync
  const {
    data: grades,
    addItem: addGrade,
    updateItem: updateGrade,
    deleteItem: deleteGrade,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
  } = useToolData<Grade>('gradebook-grades', defaultGrades, gradeExportColumns, {
    autoSave: true,
    autoSaveDelay: 1000,
    onSync: () => {},
  });

  // Separate hook for courses
  const {
    data: courses,
    addItem: addCourse,
    updateItem: updateCourse,
    deleteItem: deleteCourse,
  } = useToolData<Course>('gradebook-courses', defaultData.courses, [], {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Separate hook for students
  const {
    data: students,
    addItem: addStudent,
    updateItem: updateStudent,
    deleteItem: deleteStudent,
  } = useToolData<Student>('gradebook-students', defaultData.students, [], {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // Separate hook for assignments
  const {
    data: assignments,
    addItem: addAssignment,
    updateItem: updateAssignment,
    deleteItem: deleteAssignment,
  } = useToolData<Assignment>('gradebook-assignments', defaultData.assignments, [], {
    autoSave: true,
    autoSaveDelay: 1000,
  });

  // State
  const [activeTab, setActiveTab] = useState<TabType>('classes');

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [assignmentTypeFilter, setAssignmentTypeFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');

  // Course form
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    description: '',
    semester: 'Fall',
    year: new Date().getFullYear().toString(),
    gradeLevel: '',
    status: 'active' as Course['status'],
  });

  // Student form
  const [studentForm, setStudentForm] = useState({
    name: '',
    studentId: '',
    email: '',
    courseIds: [] as string[],
  });

  // Assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    name: '',
    type: 'homework' as Assignment['type'],
    maxPoints: 100,
    weight: 10,
    dueDate: '',
    description: '',
  });

  // Grade form
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    assignmentId: '',
    courseId: '',
    score: 0,
    feedback: '',
  });

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title) {
        setCourseForm(prev => ({
          ...prev,
          name: params.title || prev.name,
        }));
        setShowCourseForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Course handlers
  const handleSaveCourse = async () => {
    if (!courseForm.name.trim() || !courseForm.code.trim()) return;

    const now = new Date().toISOString();
    const newCourse: Course = {
      id: editingCourse?.id || `course-${Date.now()}`,
      ...courseForm,
      createdAt: editingCourse?.createdAt || now,
      updatedAt: now,
    };

    if (editingCourse) {
      updateCourse(editingCourse.id, newCourse);
    } else {
      addCourse(newCourse);
    }

    resetCourseForm();
  };

  const resetCourseForm = () => {
    setCourseForm({
      name: '',
      code: '',
      description: '',
      semester: 'Fall',
      year: new Date().getFullYear().toString(),
      gradeLevel: '',
      status: 'active',
    });
    setEditingCourse(null);
    setShowCourseForm(false);
  };

  const handleEditCourse = (course: Course) => {
    setCourseForm({
      name: course.name,
      code: course.code,
      description: course.description || '',
      semester: course.semester,
      year: course.year,
      gradeLevel: course.gradeLevel,
      status: course.status,
    });
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = (id: string) => {
    deleteCourse(id);
    deleteAssignment(id); // This will be fixed with better ID matching
    deleteGrade(id);
    students.forEach((s) => {
      if (s.courseIds.includes(id)) {
        updateStudent(s.id, {
          ...s,
          courseIds: s.courseIds.filter((cid) => cid !== id),
        });
      }
    });
  };

  // Student handlers
  const handleSaveStudent = () => {
    if (!studentForm.name.trim() || !studentForm.studentId.trim()) return;

    const now = new Date().toISOString();
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      ...studentForm,
      createdAt: now,
    };

    addStudent(newStudent);
    setStudentForm({
      name: '',
      studentId: '',
      email: '',
      courseIds: [],
    });
    setShowStudentForm(false);
  };

  const handleDeleteStudent = (id: string) => {
    deleteStudent(id);
    grades.forEach((g) => {
      if (g.studentId === id) {
        deleteGrade(g.id);
      }
    });
  };

  // Assignment handlers
  const handleSaveAssignment = () => {
    if (!assignmentForm.name.trim() || !assignmentForm.courseId) return;

    const now = new Date().toISOString();
    const newAssignment: Assignment = {
      id: editingAssignment?.id || `assign-${Date.now()}`,
      ...assignmentForm,
      createdAt: editingAssignment?.createdAt || now,
    };

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, newAssignment);
    } else {
      addAssignment(newAssignment);
    }

    resetAssignmentForm();
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      courseId: selectedCourse?.id || '',
      name: '',
      type: 'homework',
      maxPoints: 100,
      weight: 10,
      dueDate: '',
      description: '',
    });
    setEditingAssignment(null);
    setShowAssignmentForm(false);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setAssignmentForm({
      courseId: assignment.courseId,
      name: assignment.name,
      type: assignment.type,
      maxPoints: assignment.maxPoints,
      weight: assignment.weight,
      dueDate: assignment.dueDate,
      description: assignment.description || '',
    });
    setEditingAssignment(assignment);
    setShowAssignmentForm(true);
  };

  const handleDeleteAssignment = (id: string) => {
    deleteAssignment(id);
    grades.forEach((g) => {
      if (g.assignmentId === id) {
        deleteGrade(g.id);
      }
    });
  };

  // Grade handlers
  const handleSaveGrade = () => {
    if (!gradeForm.studentId || !gradeForm.assignmentId) return;

    const now = new Date().toISOString();
    const assignment = assignments.find((a) => a.id === gradeForm.assignmentId);
    if (!assignment) return;

    // Check if grade already exists for this student/assignment
    const existingGrade = grades.find(
      (g) => g.studentId === gradeForm.studentId && g.assignmentId === gradeForm.assignmentId
    );

    const newGrade: Grade = {
      id: existingGrade?.id || `grade-${Date.now()}`,
      studentId: gradeForm.studentId,
      assignmentId: gradeForm.assignmentId,
      courseId: assignment.courseId,
      score: Math.min(gradeForm.score, assignment.maxPoints),
      feedback: gradeForm.feedback,
      gradedAt: now,
      createdAt: existingGrade?.createdAt || now,
    };

    if (existingGrade) {
      updateGrade(existingGrade.id, newGrade);
    } else {
      addGrade(newGrade);
    }

    setGradeForm({
      studentId: '',
      assignmentId: selectedAssignment?.id || '',
      courseId: selectedCourse?.id || '',
      score: 0,
      feedback: '',
    });
    setShowGradeForm(false);
  };

  // Calculate weighted average for a student in a course
  const calculateWeightedAverage = (studentId: string, courseId: string): number => {
    const courseAssignments = assignments.filter((a) => a.courseId === courseId);
    const studentGrades = grades.filter((g) => g.studentId === studentId && g.courseId === courseId);

    if (courseAssignments.length === 0 || studentGrades.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    courseAssignments.forEach((assignment) => {
      const grade = studentGrades.find((g) => g.assignmentId === assignment.id);
      if (grade) {
        const percentage = (grade.score / assignment.maxPoints) * 100;
        totalWeightedScore += percentage * assignment.weight;
        totalWeight += assignment.weight;
      }
    });

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  };

  // Get class statistics
  const getClassStats = (courseId: string) => {
    const courseStudents = students.filter((s) => s.courseIds.includes(courseId));
    const courseAssignments = assignments.filter((a) => a.courseId === courseId);
    const courseGrades = grades.filter((g) => g.courseId === courseId);

    const averages = courseStudents.map((s) => calculateWeightedAverage(s.id, courseId)).filter((a) => a > 0);

    const classAverage = averages.length > 0 ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;
    const highestGrade = averages.length > 0 ? Math.max(...averages) : 0;
    const lowestGrade = averages.length > 0 ? Math.min(...averages) : 0;

    const gradeDistribution = {
      A: averages.filter((a) => a >= 90).length,
      B: averages.filter((a) => a >= 80 && a < 90).length,
      C: averages.filter((a) => a >= 70 && a < 80).length,
      D: averages.filter((a) => a >= 60 && a < 70).length,
      F: averages.filter((a) => a < 60).length,
    };

    return {
      totalStudents: courseStudents.length,
      totalAssignments: courseAssignments.length,
      totalGrades: courseGrades.length,
      classAverage,
      highestGrade,
      lowestGrade,
      gradeDistribution,
    };
  };

  // Filtered data
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [courses, searchTerm]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = courseFilter === 'all' || a.courseId === courseFilter;
      const matchesType = assignmentTypeFilter === 'all' || a.type === assignmentTypeFilter;
      return matchesSearch && matchesCourse && matchesType;
    });
  }, [assignments, searchTerm, courseFilter, assignmentTypeFilter]);

  // Prepare export data - flatten grades with related info
  const exportData = useMemo(() => {
    return grades.map((grade) => {
      const student = students.find((s) => s.id === grade.studentId);
      const assignment = assignments.find((a) => a.id === grade.assignmentId);
      const course = courses.find((c) => c.id === grade.courseId);
      const percentage = assignment ? (grade.score / assignment.maxPoints) * 100 : 0;

      return {
        studentName: student?.name || 'Unknown',
        studentId: student?.studentId || 'N/A',
        courseName: course?.name || 'Unknown',
        courseCode: course?.code || 'N/A',
        assignmentName: assignment?.name || 'Unknown',
        assignmentType: assignment?.type || 'N/A',
        score: grade.score,
        maxPoints: assignment?.maxPoints || 0,
        percentage: Math.round(percentage * 100) / 100,
        letterGrade: percentageToLetterGrade(percentage),
        feedback: grade.feedback || '',
        gradedAt: grade.gradedAt,
      };
    });
  }, [grades, students, assignments, courses]);

  // Export handlers using hook methods
  const handleExportCSV = () => {
    exportCSV({ filename: 'gradebook_grades' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'gradebook_grades' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'gradebook_grades' });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'gradebook_grades',
      title: 'Grade Book Report',
      subtitle: `Total Grades: ${grades.length}`,
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    print('Grade Book Report');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard('tab');
  };

  // Styles
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'classes', label: 'Classes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'grades', label: 'Grades', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'assignments', label: 'Assignments', icon: <FileText className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const getAssignmentTypeColor = (type: Assignment['type']) => {
    const typeConfig = ASSIGNMENT_TYPES.find((t) => t.value === type);
    return typeConfig?.color || 'gray';
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 rounded-lg ${cardBg} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <GraduationCap className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{t('tools.gradeBook.gradeBook', 'Grade Book')}</h2>
            <p className={`text-sm ${textSecondary}`}>
              {t('tools.gradeBook.comprehensiveGradeTrackingAndManagement', 'Comprehensive grade tracking and management for educators')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <WidgetEmbedButton toolSlug="grade-book" toolName="Grade Book" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            showLabel={true}
          />
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            disabled={grades.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-sm text-emerald-500 font-medium">{t('tools.gradeBook.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
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
                ? 'bg-emerald-500 text-white'
                : `${textSecondary} ${hoverBg}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 min-w-[200px]">
              <Search className={`w-4 h-4 ${textSecondary}`} />
              <input
                type="text"
                placeholder={t('tools.gradeBook.searchClasses', 'Search classes...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStudentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                {t('tools.gradeBook.addStudent2', 'Add Student')}
              </button>
              <button
                onClick={() => setShowCourseForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.gradeBook.addClass', 'Add Class')}
              </button>
            </div>
          </div>

          {/* Student Form Modal */}
          {showStudentForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>{t('tools.gradeBook.addStudent', 'Add Student')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.studentName', 'Student Name *')}
                    </label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.gradeBook.johnDoe', 'John Doe')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.studentId', 'Student ID *')}
                    </label>
                    <input
                      type="text"
                      value={studentForm.studentId}
                      onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.gradeBook.stu001', 'STU001')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.gradeBook.studentSchoolEdu', 'student@school.edu')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.enrolledClasses', 'Enrolled Classes')}
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {courses.filter((c) => c.status === 'active').map((course) => (
                        <label key={course.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={studentForm.courseIds.includes(course.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setStudentForm({ ...studentForm, courseIds: [...studentForm.courseIds, course.id] });
                              } else {
                                setStudentForm({ ...studentForm, courseIds: studentForm.courseIds.filter((id) => id !== course.id) });
                              }
                            }}
                            className="rounded"
                          />
                          <span className={`text-sm ${textSecondary}`}>{course.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveStudent}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.gradeBook.save', 'Save')}
                  </button>
                  <button
                    onClick={() => setShowStudentForm(false)}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.gradeBook.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Form Modal */}
          {showCourseForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>
                  {editingCourse ? t('tools.gradeBook.editClass', 'Edit Class') : t('tools.gradeBook.newClass', 'New Class')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.className', 'Class Name *')}
                    </label>
                    <input
                      type="text"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.gradeBook.algebraIi', 'Algebra II')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.courseCode', 'Course Code *')}
                    </label>
                    <input
                      type="text"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.gradeBook.math201', 'MATH201')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.gradeLevel', 'Grade Level')}
                    </label>
                    <select
                      value={courseForm.gradeLevel}
                      onChange={(e) => setCourseForm({ ...courseForm, gradeLevel: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.gradeBook.selectGrade', 'Select Grade')}</option>
                      {GRADE_LEVELS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.semester', 'Semester')}
                    </label>
                    <select
                      value={courseForm.semester}
                      onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.year', 'Year')}
                    </label>
                    <input
                      type="text"
                      value={courseForm.year}
                      onChange={(e) => setCourseForm({ ...courseForm, year: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.status', 'Status')}
                    </label>
                    <select
                      value={courseForm.status}
                      onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as Course['status'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="active">{t('tools.gradeBook.active', 'Active')}</option>
                      <option value="completed">{t('tools.gradeBook.completed', 'Completed')}</option>
                      <option value="archived">{t('tools.gradeBook.archived', 'Archived')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.description', 'Description')}
                    </label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                      rows={2}
                      placeholder={t('tools.gradeBook.courseDescription', 'Course description...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveCourse}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.gradeBook.save2', 'Save')}
                  </button>
                  <button
                    onClick={resetCourseForm}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.gradeBook.cancel2', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Classes List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const stats = getClassStats(course.id);

              return (
                <Card key={course.id} className={`${cardBg} ${borderColor} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${textPrimary}`}>{course.name}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              course.status === 'active'
                                ? 'bg-green-500/10 text-green-500'
                                : course.status === 'completed'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-gray-500/10 text-gray-500'
                            }`}
                          >
                            {course.status}
                          </span>
                        </div>
                        <p className={`text-sm ${textSecondary}`}>{course.code}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className={`p-2 rounded-lg ${hoverBg}`}
                        >
                          <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className={`text-xs ${textSecondary} mb-3`}>
                      {course.gradeLevel} | {course.semester} {course.year}
                    </div>

                    {course.description && (
                      <p className={`text-sm ${textSecondary} mb-3 line-clamp-2`}>{course.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                        <p className={`text-lg font-bold ${textPrimary}`}>{stats.totalStudents}</p>
                        <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.students', 'Students')}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                        <p className={`text-lg font-bold ${textPrimary}`}>{stats.totalAssignments}</p>
                        <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.assignments', 'Assignments')}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                        <p className={`text-lg font-bold ${getGradeColor(stats.classAverage)}`}>
                          {stats.classAverage > 0 ? stats.classAverage.toFixed(1) : '-'}%
                        </p>
                        <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.classAvg', 'Class Avg')}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveTab('grades');
                        }}
                        className="flex-1 px-3 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 text-sm"
                      >
                        {t('tools.gradeBook.viewGrades', 'View Grades')}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setAssignmentForm({ ...assignmentForm, courseId: course.id });
                          setActiveTab('assignments');
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 text-sm"
                      >
                        {t('tools.gradeBook.assignments2', 'Assignments')}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredCourses.length === 0 && (
              <div className={`col-span-full text-center py-8 ${textSecondary}`}>
                {t('tools.gradeBook.noClassesFoundAddYour', 'No classes found. Add your first class to get started.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const course = courses.find((c) => c.id === e.target.value);
                  setSelectedCourse(course || null);
                }}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="">{t('tools.gradeBook.selectClass', 'Select Class')}</option>
                {courses.filter((c) => c.status === 'active').map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
              {selectedCourse && (
                <select
                  value={selectedAssignment?.id || ''}
                  onChange={(e) => {
                    const assignment = assignments.find((a) => a.id === e.target.value);
                    setSelectedAssignment(assignment || null);
                    if (assignment) {
                      setGradeForm({ ...gradeForm, assignmentId: assignment.id, courseId: assignment.courseId });
                    }
                  }}
                  className={`px-3 py-2 rounded-lg border ${inputBg}`}
                >
                  <option value="">{t('tools.gradeBook.selectAssignment', 'Select Assignment')}</option>
                  {assignments.filter((a) => a.courseId === selectedCourse.id).map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.maxPoints} pts)</option>
                  ))}
                </select>
              )}
            </div>
            <button
              onClick={() => {
                if (selectedAssignment) {
                  setShowGradeForm(true);
                }
              }}
              disabled={!selectedAssignment}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {t('tools.gradeBook.enterGrade', 'Enter Grade')}
            </button>
          </div>

          {/* Grade Entry Form */}
          {showGradeForm && selectedAssignment && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>
                  Enter Grade for {selectedAssignment.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.student', 'Student *')}
                    </label>
                    <select
                      value={gradeForm.studentId}
                      onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.gradeBook.selectStudent', 'Select Student')}</option>
                      {students
                        .filter((s) => s.courseIds.includes(selectedAssignment.courseId))
                        .map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      Score (max: {selectedAssignment.maxPoints})
                    </label>
                    <input
                      type="number"
                      value={gradeForm.score}
                      onChange={(e) => setGradeForm({ ...gradeForm, score: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      min={0}
                      max={selectedAssignment.maxPoints}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.feedback', 'Feedback')}
                    </label>
                    <textarea
                      value={gradeForm.feedback}
                      onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                      rows={2}
                      placeholder={t('tools.gradeBook.optionalFeedback', 'Optional feedback...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveGrade}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.gradeBook.saveGrade', 'Save Grade')}
                  </button>
                  <button
                    onClick={() => setShowGradeForm(false)}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.gradeBook.cancel3', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grade Table */}
          {selectedCourse && (
            <Card className={`${cardBg} ${borderColor} border overflow-hidden`}>
              <CardHeader>
                <CardTitle className={textPrimary}>
                  {selectedCourse.name} - Grade Book
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary} sticky left-0 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {t('tools.gradeBook.student2', 'Student')}
                        </th>
                        {assignments.filter((a) => a.courseId === selectedCourse.id).map((assignment) => (
                          <th key={assignment.id} className={`px-4 py-3 text-center text-sm font-semibold ${textPrimary} min-w-[100px]`}>
                            <div>{assignment.name}</div>
                            <div className={`text-xs font-normal ${textSecondary}`}>
                              {assignment.maxPoints} pts ({assignment.weight}%)
                            </div>
                          </th>
                        ))}
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${textPrimary}`}>
                          {t('tools.gradeBook.weightedAvg', 'Weighted Avg')}
                        </th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${textPrimary}`}>
                          {t('tools.gradeBook.grade', 'Grade')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter((s) => s.courseIds.includes(selectedCourse.id))
                        .map((student) => {
                          const weightedAvg = calculateWeightedAverage(student.id, selectedCourse.id);
                          const letterGrade = percentageToLetterGrade(weightedAvg);

                          return (
                            <tr key={student.id} className={`border-t ${borderColor} ${hoverBg}`}>
                              <td className={`px-4 py-3 text-sm ${textPrimary} sticky left-0 ${cardBg}`}>
                                <div className="font-medium">{student.name}</div>
                                <div className={`text-xs ${textSecondary}`}>{student.studentId}</div>
                              </td>
                              {assignments.filter((a) => a.courseId === selectedCourse.id).map((assignment) => {
                                const grade = grades.find(
                                  (g) => g.studentId === student.id && g.assignmentId === assignment.id
                                );
                                const percentage = grade ? (grade.score / assignment.maxPoints) * 100 : null;

                                return (
                                  <td key={assignment.id} className={`px-4 py-3 text-center text-sm`}>
                                    {grade ? (
                                      <div>
                                        <span className={`font-medium ${getGradeColor(percentage!)}`}>
                                          {grade.score}/{assignment.maxPoints}
                                        </span>
                                        <div className={`text-xs ${textSecondary}`}>
                                          {percentage!.toFixed(0)}%
                                        </div>
                                      </div>
                                    ) : (
                                      <span className={textSecondary}>-</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className={`px-4 py-3 text-center text-sm font-bold ${getGradeColor(weightedAvg)}`}>
                                {weightedAvg > 0 ? `${weightedAvg.toFixed(1)}%` : '-'}
                              </td>
                              <td className={`px-4 py-3 text-center text-sm font-bold ${getGradeColor(weightedAvg)}`}>
                                {weightedAvg > 0 ? letterGrade : '-'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                {students.filter((s) => s.courseIds.includes(selectedCourse.id)).length === 0 && (
                  <div className={`text-center py-8 ${textSecondary}`}>
                    {t('tools.gradeBook.noStudentsEnrolledInThis', 'No students enrolled in this class.')}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!selectedCourse && (
            <div className={`text-center py-8 ${textSecondary}`}>
              {t('tools.gradeBook.selectAClassToView', 'Select a class to view and manage grades.')}
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="flex items-center gap-2 min-w-[200px]">
                <Search className={`w-4 h-4 ${textSecondary}`} />
                <input
                  type="text"
                  placeholder={t('tools.gradeBook.searchAssignments', 'Search assignments...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                />
              </div>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="all">{t('tools.gradeBook.allClasses', 'All Classes')}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </select>
              <select
                value={assignmentTypeFilter}
                onChange={(e) => setAssignmentTypeFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${inputBg}`}
              >
                <option value="all">{t('tools.gradeBook.allTypes', 'All Types')}</option>
                {ASSIGNMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAssignmentForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.gradeBook.addAssignment', 'Add Assignment')}
            </button>
          </div>

          {/* Assignment Form Modal */}
          {showAssignmentForm && (
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardHeader>
                <CardTitle className={textPrimary}>
                  {editingAssignment ? t('tools.gradeBook.editAssignment', 'Edit Assignment') : t('tools.gradeBook.newAssignment', 'New Assignment')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.class', 'Class *')}
                    </label>
                    <select
                      value={assignmentForm.courseId}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      <option value="">{t('tools.gradeBook.selectClass2', 'Select Class')}</option>
                      {courses.filter((c) => c.status === 'active').map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.assignmentName', 'Assignment Name *')}
                    </label>
                    <input
                      type="text"
                      value={assignmentForm.name}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      placeholder={t('tools.gradeBook.chapter1Quiz', 'Chapter 1 Quiz')}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.type', 'Type *')}
                    </label>
                    <select
                      value={assignmentForm.type}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, type: e.target.value as Assignment['type'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    >
                      {ASSIGNMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.maxPoints', 'Max Points')}
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.maxPoints}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      min={1}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.weight', 'Weight (%)')}
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.weight}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, weight: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.dueDate', 'Due Date')}
                    </label>
                    <input
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg}`}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {t('tools.gradeBook.description2', 'Description')}
                    </label>
                    <textarea
                      value={assignmentForm.description}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBg} resize-none`}
                      rows={2}
                      placeholder={t('tools.gradeBook.assignmentDetails', 'Assignment details...')}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveAssignment}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.gradeBook.save3', 'Save')}
                  </button>
                  <button
                    onClick={resetAssignmentForm}
                    className={`px-4 py-2 rounded-lg ${hoverBg} ${textSecondary}`}
                  >
                    {t('tools.gradeBook.cancel4', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignments List */}
          <div className="grid gap-4">
            {filteredAssignments.map((assignment) => {
              const course = courses.find((c) => c.id === assignment.courseId);
              const assignmentGrades = grades.filter((g) => g.assignmentId === assignment.id);
              const avgScore = assignmentGrades.length > 0
                ? assignmentGrades.reduce((sum, g) => sum + (g.score / assignment.maxPoints) * 100, 0) / assignmentGrades.length
                : 0;
              const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

              return (
                <Card key={assignment.id} className={`${cardBg} ${borderColor} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${textPrimary}`}>{assignment.name}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full bg-${getAssignmentTypeColor(assignment.type)}-500/10 text-${getAssignmentTypeColor(assignment.type)}-500`}
                          >
                            {ASSIGNMENT_TYPES.find((t) => t.value === assignment.type)?.label}
                          </span>
                          {isOverdue && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {t('tools.gradeBook.overdue', 'Overdue')}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${textSecondary} mt-1`}>
                          {course?.name} ({course?.code})
                        </p>
                        <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" /> {assignment.maxPoints} points
                          </span>
                          <span className="flex items-center gap-1">
                            <Percent className="w-3 h-3" /> {assignment.weight}% weight
                          </span>
                          {assignment.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {assignment.description && (
                          <p className={`mt-2 text-sm ${textSecondary}`}>{assignment.description}</p>
                        )}

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 mt-3">
                          <div className={`px-3 py-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.graded', 'Graded:')}</span>
                            <span className={`text-sm font-semibold ${textPrimary}`}>{assignmentGrades.length}</span>
                          </div>
                          {avgScore > 0 && (
                            <div className={`px-3 py-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <span className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.avg', 'Avg:')}</span>
                              <span className={`text-sm font-semibold ${getGradeColor(avgScore)}`}>
                                {avgScore.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedCourse(course || null);
                            setSelectedAssignment(assignment);
                            setGradeForm({ ...gradeForm, assignmentId: assignment.id, courseId: assignment.courseId });
                            setActiveTab('grades');
                          }}
                          className={`p-2 rounded-lg ${hoverBg}`}
                          title={t('tools.gradeBook.enterGrades', 'Enter Grades')}
                        >
                          <ClipboardList className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                        <button
                          onClick={() => handleEditAssignment(assignment)}
                          className={`p-2 rounded-lg ${hoverBg}`}
                          title={t('tools.gradeBook.edit', 'Edit')}
                        >
                          <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className={`p-2 rounded-lg ${hoverBg} hover:text-red-500`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredAssignments.length === 0 && (
              <div className={`text-center py-8 ${textSecondary}`}>
                {t('tools.gradeBook.noAssignmentsFoundAddYour', 'No assignments found. Add your first assignment to get started.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Overall Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{courses.length}</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.totalClasses', 'Total Classes')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{students.length}</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.totalStudents', 'Total Students')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <FileText className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{assignments.length}</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.totalAssignments', 'Total Assignments')}</p>
              </CardContent>
            </Card>
            <Card className={`${cardBg} ${borderColor} border`}>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{grades.length}</p>
                <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.gradesEntered', 'Grades Entered')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Class Performance */}
          <Card className={`${cardBg} ${borderColor} border`}>
            <CardHeader>
              <CardTitle className={textPrimary}>{t('tools.gradeBook.classPerformanceSummary', 'Class Performance Summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.filter((c) => c.status === 'active').map((course) => {
                  const stats = getClassStats(course.id);

                  return (
                    <div key={course.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className={`font-semibold ${textPrimary}`}>{course.name}</h4>
                          <p className={`text-sm ${textSecondary}`}>{course.code}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getGradeColor(stats.classAverage)}`}>
                            {stats.classAverage > 0 ? `${stats.classAverage.toFixed(1)}%` : 'N/A'}
                          </p>
                          <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.classAverage', 'Class Average')}</p>
                        </div>
                      </div>

                      {/* Grade Distribution */}
                      <div className="flex gap-2 mt-3">
                        {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                          <div
                            key={grade}
                            className={`flex-1 text-center p-2 rounded ${
                              grade === 'A' ? 'bg-green-500/20' :
                              grade === 'B' ? 'bg-blue-500/20' :
                              grade === 'C' ? 'bg-yellow-500/20' :
                              grade === 'D' ? 'bg-orange-500/20' :
                              'bg-red-500/20'
                            }`}
                          >
                            <p className={`text-sm font-bold ${textPrimary}`}>{count}</p>
                            <p className={`text-xs ${textSecondary}`}>{grade}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div className="text-center">
                          <p className={`text-sm font-medium ${textPrimary}`}>{stats.totalStudents}</p>
                          <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.students2', 'Students')}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-medium text-green-500`}>
                            {stats.highestGrade > 0 ? `${stats.highestGrade.toFixed(1)}%` : '-'}
                          </p>
                          <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.highest', 'Highest')}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-medium text-red-500`}>
                            {stats.lowestGrade > 0 ? `${stats.lowestGrade.toFixed(1)}%` : '-'}
                          </p>
                          <p className={`text-xs ${textSecondary}`}>{t('tools.gradeBook.lowest', 'Lowest')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {courses.filter((c) => c.status === 'active').length === 0 && (
                  <div className={`text-center py-4 ${textSecondary}`}>
                    {t('tools.gradeBook.noActiveClassesToDisplay', 'No active classes to display.')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className={`${cardBg} ${borderColor} border`}>
            <CardHeader>
              <CardTitle className={textPrimary}>{t('tools.gradeBook.topPerformingStudents', 'Top Performing Students')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students
                  .map((student) => {
                    const studentCourses = courses.filter((c) => student.courseIds.includes(c.id) && c.status === 'active');
                    const averages = studentCourses.map((c) => calculateWeightedAverage(student.id, c.id)).filter((a) => a > 0);
                    const overallAvg = averages.length > 0 ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;
                    return { ...student, overallAvg };
                  })
                  .filter((s) => s.overallAvg > 0)
                  .sort((a, b) => b.overallAvg - a.overallAvg)
                  .slice(0, 10)
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
                          <p className={`text-xs ${textSecondary}`}>{student.studentId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${getGradeColor(student.overallAvg)}`}>
                          {student.overallAvg.toFixed(1)}%
                        </span>
                        <p className={`text-xs ${textSecondary}`}>
                          {percentageToLetterGrade(student.overallAvg)}
                        </p>
                      </div>
                    </div>
                  ))}
                {students.length === 0 && (
                  <div className={`text-center py-4 ${textSecondary}`}>
                    {t('tools.gradeBook.noStudentDataAvailable', 'No student data available.')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Completion Rate */}
          <Card className={`${cardBg} ${borderColor} border`}>
            <CardHeader>
              <CardTitle className={textPrimary}>{t('tools.gradeBook.assignmentCompletionRate', 'Assignment Completion Rate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.slice(0, 10).map((assignment) => {
                  const course = courses.find((c) => c.id === assignment.courseId);
                  const enrolledStudents = students.filter((s) => s.courseIds.includes(assignment.courseId)).length;
                  const gradedCount = grades.filter((g) => g.assignmentId === assignment.id).length;
                  const completionRate = enrolledStudents > 0 ? (gradedCount / enrolledStudents) * 100 : 0;

                  return (
                    <div key={assignment.id}>
                      <div className="flex justify-between mb-1">
                        <div>
                          <span className={textPrimary}>{assignment.name}</span>
                          <span className={`text-xs ml-2 ${textSecondary}`}>({course?.code})</span>
                        </div>
                        <span className={textSecondary}>
                          {gradedCount}/{enrolledStudents} ({completionRate.toFixed(0)}%)
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded-full ${
                            completionRate === 100
                              ? 'bg-green-500'
                              : completionRate >= 75
                              ? 'bg-blue-500'
                              : completionRate >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {assignments.length === 0 && (
                  <div className={`text-center py-4 ${textSecondary}`}>
                    {t('tools.gradeBook.noAssignmentsToDisplay', 'No assignments to display.')}
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
          {t('tools.gradeBook.aboutGradeBook', 'About Grade Book')}
        </h3>
        <p className={`text-sm ${textSecondary}`}>
          A comprehensive grade tracking tool for educators. Manage classes, create assignments with weighted grading,
          track student performance, and generate detailed reports. All data is automatically saved to your browser's
          local storage with optional API synchronization.
        </p>
      </div>
    </div>
  );
};

export default GradeBookTool;
