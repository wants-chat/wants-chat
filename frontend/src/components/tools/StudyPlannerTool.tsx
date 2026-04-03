import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  Timer,
  BarChart3,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Target,
  TrendingUp,
  Award,
  Bell,
  Palette,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
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

// Types
interface Course {
  id: string;
  name: string;
  instructor: string;
  credits: number;
  color: string;
  schedule: ScheduleItem[];
}

interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
}

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  type: 'homework' | 'project' | 'exam' | 'quiz';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  grade?: number;
  notes?: string;
}

interface StudySession {
  id: string;
  courseId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  completed: boolean;
}

interface GradeWeight {
  id: string;
  courseId: string;
  category: string;
  weight: number;
  earnedPoints: number;
  totalPoints: number;
}

type TabType = 'dashboard' | 'courses' | 'assignments' | 'study' | 'calendar' | 'grades';

const STORAGE_KEY = 'study_planner_data';
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COURSE_COLORS = [
  '#0D9488', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1'
];

// Export column configuration for assignments data
const assignmentExportColumns: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'courseName', header: 'Course', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'grade', header: 'Grade', type: 'number' },
  { key: 'notes', header: 'Notes', type: 'string' },
];

interface StudyPlannerToolProps {
  uiConfig?: UIConfig;
}

export const StudyPlannerTool: React.FC<StudyPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // useToolData hook for assignments sync
  const {
    data: assignments,
    addItem: addAssignment,
    updateItem: updateAssignment,
    deleteItem: deleteAssignment,
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
  } = useToolData<Assignment>('study-planner-assignments', [], assignmentExportColumns);

  // Local state for other data (not synced)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [gradeWeights, setGradeWeights] = useState<GradeWeight[]>([]);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Pomodoro state
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroSessionId, setPomodoroSessionId] = useState<string | null>(null);
  const pomodoroRef = useRef<number | null>(null);

  // Form states
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    name: '',
    instructor: '',
    credits: 3,
    color: COURSE_COLORS[0],
    schedule: [],
  });

  const [assignmentForm, setAssignmentForm] = useState<Partial<Assignment>>({
    title: '',
    courseId: '',
    type: 'homework',
    dueDate: '',
    priority: 'medium',
    status: 'not_started',
    notes: '',
  });

  const [studyForm, setStudyForm] = useState({
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
  });

  const [gradeForm, setGradeForm] = useState({
    courseId: '',
    category: '',
    weight: 0,
    earnedPoints: 0,
    totalPoints: 100,
  });

  const [assignmentSort, setAssignmentSort] = useState<'dueDate' | 'priority'>('dueDate');
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [whatIfGrade, setWhatIfGrade] = useState({ category: '', score: 0, total: 100 });

  // Load other data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setCourses(data.courses || []);
        setStudySessions(data.studySessions || []);
        setGradeWeights(data.gradeWeights || []);
      } catch (e) {
        console.error('Failed to load study planner data:', e);
      }
    }
  }, []);

  // Save other data to localStorage
  useEffect(() => {
    const data = { courses, studySessions, gradeWeights };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [courses, studySessions, gradeWeights]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        // Pre-fill as course name
        setCourseForm(prev => ({ ...prev, name: params.text || params.content || '' }));
        setShowCourseModal(true);
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.courseName) setCourseForm(prev => ({ ...prev, name: params.formData!.courseName }));
        if (params.formData.instructor) setCourseForm(prev => ({ ...prev, instructor: params.formData!.instructor }));
        if (params.formData.credits) setCourseForm(prev => ({ ...prev, credits: parseInt(params.formData!.credits) }));
        if (params.formData.assignmentTitle) {
          setAssignmentForm(prev => ({ ...prev, title: params.formData!.assignmentTitle }));
          setShowAssignmentModal(true);
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Pomodoro timer
  useEffect(() => {
    if (pomodoroActive && pomodoroTime > 0) {
      pomodoroRef.current = window.setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      if (pomodoroRef.current) clearInterval(pomodoroRef.current);
      if (!isBreak && pomodoroSessionId) {
        // Record completed study session
        const session = studySessions.find(s => s.id === pomodoroSessionId);
        if (session) {
          setStudySessions(prev => prev.map(s =>
            s.id === pomodoroSessionId ? { ...s, completed: true, duration: s.duration + 25 } : s
          ));
        }
      }
      setIsBreak(!isBreak);
      setPomodoroTime(isBreak ? 25 * 60 : 5 * 60);
      setPomodoroActive(false);
    }
    return () => {
      if (pomodoroRef.current) clearInterval(pomodoroRef.current);
    };
  }, [pomodoroActive, pomodoroTime, isBreak, pomodoroSessionId, studySessions]);

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'not_started': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  // Course CRUD
  const handleSaveCourse = () => {
    if (!courseForm.name) return;

    if (editingCourse) {
      setCourses(prev => prev.map(c =>
        c.id === editingCourse.id ? { ...c, ...courseForm } as Course : c
      ));
    } else {
      const newCourse: Course = {
        id: generateId(),
        name: courseForm.name || '',
        instructor: courseForm.instructor || '',
        credits: courseForm.credits || 3,
        color: courseForm.color || COURSE_COLORS[0],
        schedule: courseForm.schedule || [],
      };
      setCourses(prev => [...prev, newCourse]);
    }

    setShowCourseModal(false);
    setEditingCourse(null);
    setCourseForm({ name: '', instructor: '', credits: 3, color: COURSE_COLORS[0], schedule: [] });
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    // Delete assignments for this course using the hook
    assignments
      .filter(a => a.courseId === id)
      .forEach(a => deleteAssignment(a.id));
    setStudySessions(prev => prev.filter(s => s.courseId !== id));
    setGradeWeights(prev => prev.filter(g => g.courseId !== id));
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm(course);
    setShowCourseModal(true);
  };

  // Assignment CRUD
  const handleSaveAssignment = () => {
    if (!assignmentForm.title || !assignmentForm.courseId || !assignmentForm.dueDate) return;

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, assignmentForm);
    } else {
      const newAssignment: Assignment = {
        id: generateId(),
        title: assignmentForm.title || '',
        courseId: assignmentForm.courseId || '',
        type: assignmentForm.type as Assignment['type'] || 'homework',
        dueDate: assignmentForm.dueDate || '',
        priority: assignmentForm.priority as Assignment['priority'] || 'medium',
        status: assignmentForm.status as Assignment['status'] || 'not_started',
        notes: assignmentForm.notes,
        grade: assignmentForm.grade,
      };
      addAssignment(newAssignment);
    }

    setShowAssignmentModal(false);
    setEditingAssignment(null);
    setAssignmentForm({
      title: '',
      courseId: '',
      type: 'homework',
      dueDate: '',
      priority: 'medium',
      status: 'not_started',
      notes: '',
    });
  };

  const handleDeleteAssignment = (id: string) => {
    deleteAssignment(id);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm(assignment);
    setShowAssignmentModal(true);
  };

  const updateAssignmentStatus = (id: string, status: Assignment['status']) => {
    updateAssignment(id, { status });
  };

  // Study Session CRUD
  const handleSaveStudySession = () => {
    if (!studyForm.courseId || !studyForm.date || !studyForm.startTime || !studyForm.endTime) return;

    const start = new Date(`${studyForm.date}T${studyForm.startTime}`);
    const end = new Date(`${studyForm.date}T${studyForm.endTime}`);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    const newSession: StudySession = {
      id: generateId(),
      courseId: studyForm.courseId,
      date: studyForm.date,
      startTime: studyForm.startTime,
      endTime: studyForm.endTime,
      duration,
      completed: false,
    };

    setStudySessions(prev => [...prev, newSession]);
    setShowStudyModal(false);
    setStudyForm({
      courseId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
    });
  };

  // Grade Weight CRUD
  const handleSaveGradeWeight = () => {
    if (!gradeForm.courseId || !gradeForm.category) return;

    const newWeight: GradeWeight = {
      id: generateId(),
      courseId: gradeForm.courseId,
      category: gradeForm.category,
      weight: gradeForm.weight,
      earnedPoints: gradeForm.earnedPoints,
      totalPoints: gradeForm.totalPoints,
    };

    setGradeWeights(prev => [...prev, newWeight]);
    setShowGradeModal(false);
    setGradeForm({ courseId: '', category: '', weight: 0, earnedPoints: 0, totalPoints: 100 });
  };

  // Grade calculations
  const calculateCourseGrade = useCallback((courseId: string) => {
    const weights = gradeWeights.filter(g => g.courseId === courseId);
    if (weights.length === 0) return null;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    weights.forEach(w => {
      if (w.totalPoints > 0) {
        const percentage = (w.earnedPoints / w.totalPoints) * 100;
        totalWeightedScore += percentage * (w.weight / 100);
        totalWeight += w.weight;
      }
    });

    if (totalWeight === 0) return null;
    return (totalWeightedScore / totalWeight) * 100;
  }, [gradeWeights]);

  const calculateGPA = useCallback(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const grade = calculateCourseGrade(course.id);
      if (grade !== null) {
        let gradePoint = 0;
        if (grade >= 93) gradePoint = 4.0;
        else if (grade >= 90) gradePoint = 3.7;
        else if (grade >= 87) gradePoint = 3.3;
        else if (grade >= 83) gradePoint = 3.0;
        else if (grade >= 80) gradePoint = 2.7;
        else if (grade >= 77) gradePoint = 2.3;
        else if (grade >= 73) gradePoint = 2.0;
        else if (grade >= 70) gradePoint = 1.7;
        else if (grade >= 67) gradePoint = 1.3;
        else if (grade >= 63) gradePoint = 1.0;
        else if (grade >= 60) gradePoint = 0.7;
        else gradePoint = 0.0;

        totalPoints += gradePoint * course.credits;
        totalCredits += course.credits;
      }
    });

    if (totalCredits === 0) return null;
    return totalPoints / totalCredits;
  }, [courses, calculateCourseGrade]);

  // Get sorted assignments
  const getSortedAssignments = useCallback(() => {
    const sorted = [...assignments];
    if (assignmentSort === 'dueDate') {
      sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } else {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
    return sorted;
  }, [assignments, assignmentSort]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return {
      assignments: assignments.filter(a => a.dueDate === dateStr),
      sessions: studySessions.filter(s => s.date === dateStr),
    };
  };

  // Dashboard stats
  const getUpcomingAssignments = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return assignments
      .filter(a => {
        const dueDate = new Date(a.dueDate);
        return a.status !== 'completed' && dueDate >= today && dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  };

  const getOverdueAssignments = () => {
    const today = new Date().toISOString().split('T')[0];
    return assignments.filter(a => a.status !== 'completed' && a.dueDate < today);
  };

  const getStudyHoursThisWeek = () => {
    const today = new Date();
    const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    return studySessions
      .filter(s => s.date >= weekStartStr && s.completed)
      .reduce((total, s) => total + s.duration, 0);
  };

  // Schedule management
  const addScheduleItem = () => {
    setCourseForm(prev => ({
      ...prev,
      schedule: [...(prev.schedule || []), { day: 'Monday', startTime: '09:00', endTime: '10:00' }]
    }));
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    setCourseForm(prev => ({
      ...prev,
      schedule: prev.schedule?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  const removeScheduleItem = (index: number) => {
    setCourseForm(prev => ({
      ...prev,
      schedule: prev.schedule?.filter((_, i) => i !== index) || []
    }));
  };

  // Start Pomodoro for a study session
  const startPomodoro = (sessionId?: string) => {
    setPomodoroSessionId(sessionId || null);
    setPomodoroTime(25 * 60);
    setIsBreak(false);
    setPomodoroActive(true);
  };

  // Prepare export data - flatten assignments with course info
  const exportData = useMemo(() => {
    return assignments.map((assignment) => {
      const course = courses.find((c) => c.id === assignment.courseId);
      return {
        title: assignment.title,
        courseName: course?.name || 'Unknown',
        type: assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1),
        dueDate: assignment.dueDate,
        priority: assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1),
        status: assignment.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        grade: assignment.grade || '',
        notes: assignment.notes || '',
      };
    });
  }, [assignments, courses]);

  // Export handlers using useToolData hook methods
  const handleExportCSV = () => {
    exportCSV({ filename: 'study_planner_assignments' });
  };

  const handleExportExcel = () => {
    exportExcel({ filename: 'study_planner_assignments' });
  };

  const handleExportJSON = () => {
    exportJSON({ filename: 'study_planner_assignments' });
  };

  const handleExportPDF = async () => {
    await exportPDF({
      filename: 'study_planner_assignments',
      title: 'Study Planner - Assignments Report',
      subtitle: `Total Assignments: ${assignments.length}`,
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    print('Study Planner - Assignments Report');
  };

  const handleCopyToClipboard = async () => {
    return await copyToClipboard();
  };

  // Render tabs
  const renderTabs = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {[
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList },
        { id: 'study', label: 'Study Sessions', icon: Timer },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'grades', label: 'Grades', icon: GraduationCap },
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id as TabType)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === id
              ? 'bg-[#0D9488] text-white'
              : isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );

  // Render Dashboard
  const renderDashboard = () => {
    const upcomingAssignments = getUpcomingAssignments();
    const overdueAssignments = getOverdueAssignments();
    const studyHours = getStudyHoursThisWeek();
    const gpa = calculateGPA();

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studyPlanner.activeCourses', 'Active Courses')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{courses.length}</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studyPlanner.studyHoursWeek', 'Study Hours (Week)')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(studyHours / 60 * 10) / 10}h
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studyPlanner.currentGpa', 'Current GPA')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {gpa !== null ? gpa.toFixed(2) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Award className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studyPlanner.completed', 'Completed')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {assignments.filter(a => a.status === 'completed').length}/{assignments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        {overdueAssignments.length > 0 && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-red-500">{t('tools.studyPlanner.overdueAssignments', 'Overdue Assignments!')}</p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  You have {overdueAssignments.length} overdue assignment(s)
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {overdueAssignments.slice(0, 3).map(a => {
                const course = getCourse(a.courseId);
                return (
                  <div
                    key={a.id}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course?.color }} />
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{a.title}</span>
                    </div>
                    <span className="text-red-500 text-sm">Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Assignments & Pomodoro Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Assignments */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Bell className="w-5 h-5 text-[#0D9488]" />
              {t('tools.studyPlanner.upcomingThisWeek', 'Upcoming This Week')}
            </h3>
            {upcomingAssignments.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.studyPlanner.noUpcomingAssignmentsThisWeek', 'No upcoming assignments this week!')}
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map(a => {
                  const course = getCourse(a.courseId);
                  return (
                    <div
                      key={a.id}
                      className={`p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'} flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course?.color }} />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{a.title}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{course?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {new Date(a.dueDate).toLocaleDateString()}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${getPriorityColor(a.priority)}20`, color: getPriorityColor(a.priority) }}
                        >
                          {a.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pomodoro Timer */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Timer className="w-5 h-5 text-[#0D9488]" />
              {t('tools.studyPlanner.pomodoroTimer', 'Pomodoro Timer')}
            </h3>
            <div className="text-center">
              <div className={`text-5xl font-mono font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatTime(pomodoroTime)}
              </div>
              <p className={`mb-4 ${isBreak ? 'text-green-500' : t('tools.studyPlanner.text0d9488', 'text-[#0D9488]')}`}>
                {isBreak ? t('tools.studyPlanner.breakTime', 'Break Time!') : t('tools.studyPlanner.focusTime', 'Focus Time')}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setPomodoroActive(!pomodoroActive)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  {pomodoroActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {pomodoroActive ? t('tools.studyPlanner.pause', 'Pause') : t('tools.studyPlanner.start', 'Start')}
                </button>
                <button
                  onClick={() => {
                    setPomodoroActive(false);
                    setPomodoroTime(25 * 60);
                    setIsBreak(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('tools.studyPlanner.reset', 'Reset')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Overview */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-5 h-5 text-[#0D9488]" />
            {t('tools.studyPlanner.gradeOverview', 'Grade Overview')}
          </h3>
          {courses.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.studyPlanner.addCoursesToSeeYour', 'Add courses to see your grade overview')}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => {
                const grade = calculateCourseGrade(course.id);
                return (
                  <div
                    key={course.id}
                    className={`p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</span>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {grade !== null ? `${grade.toFixed(1)}%` : 'N/A'}
                    </div>
                    {grade !== null && (
                      <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(grade, 100)}%`,
                            backgroundColor: grade >= 70 ? '#10B981' : grade >= 60 ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Courses
  const renderCourses = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.studyPlanner.yourCourses', 'Your Courses')}
        </h3>
        <button
          onClick={() => {
            setEditingCourse(null);
            setCourseForm({ name: '', instructor: '', credits: 3, color: COURSE_COLORS[0], schedule: [] });
            setShowCourseModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('tools.studyPlanner.addCourse', 'Add Course')}
        </button>
      </div>

      {courses.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('tools.studyPlanner.noCoursesAddedYetAdd', 'No courses added yet. Add your first course to get started!')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div
              key={course.id}
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: course.color }} />
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{course.instructor}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                {course.credits} Credits
              </div>
              {course.schedule.length > 0 && (
                <div className="space-y-1">
                  {course.schedule.map((s, i) => (
                    <div key={i} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {s.day}: {s.startTime} - {s.endTime}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render Assignments
  const renderAssignments = () => {
    const sortedAssignments = getSortedAssignments();

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.studyPlanner.assignments', 'Assignments')}
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={assignmentSort}
              onChange={(e) => setAssignmentSort(e.target.value as 'dueDate' | 'priority')}
              className={`px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="dueDate">{t('tools.studyPlanner.sortByDueDate', 'Sort by Due Date')}</option>
              <option value="priority">{t('tools.studyPlanner.sortByPriority', 'Sort by Priority')}</option>
            </select>
            <button
              onClick={() => {
                setEditingAssignment(null);
                setAssignmentForm({
                  title: '',
                  courseId: courses[0]?.id || '',
                  type: 'homework',
                  dueDate: '',
                  priority: 'medium',
                  status: 'not_started',
                  notes: '',
                });
                setShowAssignmentModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.studyPlanner.addAssignment', 'Add Assignment')}
            </button>
          </div>
        </div>

        {sortedAssignments.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('tools.studyPlanner.noAssignmentsYetAddYour', 'No assignments yet. Add your first assignment!')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAssignments.map(assignment => {
              const course = getCourse(assignment.courseId);
              const overdue = isOverdue(assignment.dueDate, assignment.status);

              return (
                <div
                  key={assignment.id}
                  className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${
                    overdue ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 mt-1.5 rounded-full" style={{ backgroundColor: course?.color }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {assignment.title}
                          </h4>
                          {overdue && (
                            <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">
                              {t('tools.studyPlanner.overdue', 'Overdue')}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {course?.name} | {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${getPriorityColor(assignment.priority)}20`, color: getPriorityColor(assignment.priority) }}
                          >
                            {assignment.priority}
                          </span>
                          {assignment.grade !== undefined && (
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Grade: {assignment.grade}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={assignment.status}
                        onChange={(e) => updateAssignmentStatus(assignment.id, e.target.value as Assignment['status'])}
                        className={`text-xs px-2 py-1 rounded-lg border ${
                          isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                        style={{ color: getStatusColor(assignment.status) }}
                      >
                        <option value="not_started">{t('tools.studyPlanner.notStarted', 'Not Started')}</option>
                        <option value="in_progress">{t('tools.studyPlanner.inProgress', 'In Progress')}</option>
                        <option value="completed">{t('tools.studyPlanner.completed2', 'Completed')}</option>
                      </select>
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'
                        }`}
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
  };

  // Render Study Sessions
  const renderStudySessions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.studyPlanner.studySessions', 'Study Sessions')}
        </h3>
        <button
          onClick={() => setShowStudyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('tools.studyPlanner.scheduleSession', 'Schedule Session')}
        </button>
      </div>

      {/* Quick Pomodoro Start */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
        <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studyPlanner.quickStudyTimer', 'Quick Study Timer')}</h4>
        <div className="flex flex-wrap gap-3">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => {
                const session: StudySession = {
                  id: generateId(),
                  courseId: course.id,
                  date: new Date().toISOString().split('T')[0],
                  startTime: new Date().toTimeString().slice(0, 5),
                  endTime: '',
                  duration: 0,
                  completed: false,
                };
                setStudySessions(prev => [...prev, session]);
                startPomodoro(session.id);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{course.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Study Sessions List */}
      <div className="space-y-3">
        {studySessions.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Timer className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('tools.studyPlanner.noStudySessionsScheduledStart', 'No study sessions scheduled. Start studying!')}</p>
          </div>
        ) : (
          [...studySessions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map(session => {
              const course = getCourse(session.courseId);
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course?.color }} />
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{course?.name}</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(session.date).toLocaleDateString()} | {session.startTime} - {session.endTime || 'In Progress'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {session.duration} mins
                      </span>
                      {session.completed ? (
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">{t('tools.studyPlanner.completed3', 'Completed')}</span>
                      ) : (
                        <button
                          onClick={() => startPomodoro(session.id)}
                          className="text-xs px-2 py-1 bg-[#0D9488]/10 text-[#0D9488] rounded-full hover:bg-[#0D9488]/20"
                        >
                          {t('tools.studyPlanner.continue', 'Continue')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );

  // Render Calendar
  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const today = new Date().toDateString();

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              {t('tools.studyPlanner.today', 'Today')}
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
          {/* Day headers */}
          <div className={`grid grid-cols-7 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className={`p-2 text-center text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className={`grid grid-cols-7 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {days.map((date, i) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === today;
              const events = getEventsForDate(date);
              const hasEvents = events.assignments.length > 0 || events.sessions.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[80px] p-2 border-t border-l ${
                    isDark ? 'border-gray-700' : 'border-gray-100'
                  } ${!isCurrentMonth ? (isDark ? 'bg-gray-900' : 'bg-gray-50') : ''} ${
                    isToday ? 'ring-2 ring-[#0D9488] ring-inset' : ''
                  } ${
                    selectedDate?.toDateString() === date.toDateString()
                      ? isDark ? 'bg-gray-700' : t('tools.studyPlanner.bg0d948810', 'bg-[#0D9488]/10')
                      : ''
                  } hover:bg-opacity-50 transition-colors text-left`}
                >
                  <span
                    className={`text-sm ${
                      !isCurrentMonth
                        ? isDark ? 'text-gray-600' : 'text-gray-400'
                        : isDark ? 'text-white' : 'text-gray-900'
                    } ${isToday ? 'font-bold text-[#0D9488]' : ''}`}
                  >
                    {date.getDate()}
                  </span>
                  {hasEvents && (
                    <div className="mt-1 space-y-1">
                      {events.assignments.slice(0, 2).map(a => {
                        const course = getCourse(a.courseId);
                        return (
                          <div
                            key={a.id}
                            className="text-xs px-1 py-0.5 rounded truncate"
                            style={{ backgroundColor: `${course?.color}30`, color: course?.color }}
                          >
                            {a.title}
                          </div>
                        );
                      })}
                      {events.assignments.length > 2 && (
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{events.assignments.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            {(() => {
              const events = getEventsForDate(selectedDate);
              if (events.assignments.length === 0 && events.sessions.length === 0) {
                return <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studyPlanner.noEventsScheduled', 'No events scheduled')}</p>;
              }
              return (
                <div className="space-y-2">
                  {events.assignments.map(a => {
                    const course = getCourse(a.courseId);
                    return (
                      <div
                        key={a.id}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'} flex items-center gap-2`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course?.color }} />
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{a.title}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({a.type})
                        </span>
                      </div>
                    );
                  })}
                  {events.sessions.map(s => {
                    const course = getCourse(s.courseId);
                    return (
                      <div
                        key={s.id}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'} flex items-center gap-2`}
                      >
                        <Clock className="w-4 h-4 text-[#0D9488]" />
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>
                          Study: {course?.name}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {s.startTime} - {s.endTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  // Render Grades
  const renderGrades = () => {
    const gpa = calculateGPA();

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.studyPlanner.gradeCalculator', 'Grade Calculator')}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setWhatIfMode(!whatIfMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                whatIfMode
                  ? 'bg-purple-500 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Target className="w-4 h-4" />
              {t('tools.studyPlanner.whatIf', 'What-If')}
            </button>
            <button
              onClick={() => setShowGradeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.studyPlanner.addGrade', 'Add Grade')}
            </button>
          </div>
        </div>

        {/* GPA Overview */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>{t('tools.studyPlanner.projectedGpa', 'Projected GPA')}</p>
            <p className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {gpa !== null ? gpa.toFixed(2) : 'N/A'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
              Based on {courses.length} course(s)
            </p>
          </div>
        </div>

        {/* What-If Calculator */}
        {whatIfMode && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'} border border-purple-500/30`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studyPlanner.whatIfScenario', 'What-If Scenario')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={gradeForm.courseId}
                onChange={(e) => setGradeForm(prev => ({ ...prev, courseId: e.target.value }))}
                className={`px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="">{t('tools.studyPlanner.selectCourse', 'Select Course')}</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder={t('tools.studyPlanner.categoryEGFinalExam', 'Category (e.g., Final Exam)')}
                value={whatIfGrade.category}
                onChange={(e) => setWhatIfGrade(prev => ({ ...prev, category: e.target.value }))}
                className={`px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
              <input
                type="number"
                placeholder={t('tools.studyPlanner.score', 'Score')}
                value={whatIfGrade.score || ''}
                onChange={(e) => setWhatIfGrade(prev => ({ ...prev, score: parseFloat(e.target.value) || 0 }))}
                className={`px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
              <input
                type="number"
                placeholder={t('tools.studyPlanner.totalPoints2', 'Total Points')}
                value={whatIfGrade.total || ''}
                onChange={(e) => setWhatIfGrade(prev => ({ ...prev, total: parseFloat(e.target.value) || 100 }))}
                className={`px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
        )}

        {/* Course Grades */}
        <div className="space-y-4">
          {courses.map(course => {
            const weights = gradeWeights.filter(g => g.courseId === course.id);
            const grade = calculateCourseGrade(course.id);

            return (
              <div
                key={course.id}
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: course.color }} />
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {grade !== null ? `${grade.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                {weights.length > 0 ? (
                  <div className="space-y-2">
                    {weights.map(w => (
                      <div key={w.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{w.category}</span>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({w.weight}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {w.earnedPoints}/{w.totalPoints}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({((w.earnedPoints / w.totalPoints) * 100).toFixed(1)}%)
                          </span>
                          <button
                            onClick={() => setGradeWeights(prev => prev.filter(g => g.id !== w.id))}
                            className={`p-1 rounded transition-colors ${
                              isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.studyPlanner.noGradeWeightsAddedAdd', 'No grade weights added. Add categories to calculate your grade.')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Modals
  const renderCourseModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingCourse ? t('tools.studyPlanner.editCourse', 'Edit Course') : t('tools.studyPlanner.addCourse2', 'Add Course')}
          </h3>
          <button
            onClick={() => {
              setShowCourseModal(false);
              setEditingCourse(null);
            }}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.courseName', 'Course Name *')}
            </label>
            <input
              type="text"
              value={courseForm.name}
              onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('tools.studyPlanner.eGIntroductionToComputer', 'e.g., Introduction to Computer Science')}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.instructor', 'Instructor')}
            </label>
            <input
              type="text"
              value={courseForm.instructor}
              onChange={(e) => setCourseForm(prev => ({ ...prev, instructor: e.target.value }))}
              placeholder={t('tools.studyPlanner.eGDrSmith', 'e.g., Dr. Smith')}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.credits', 'Credits')}
            </label>
            <input
              type="number"
              min="1"
              max="6"
              value={courseForm.credits}
              onChange={(e) => setCourseForm(prev => ({ ...prev, credits: parseInt(e.target.value) || 3 }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Palette className="w-4 h-4 inline mr-1" />
              {t('tools.studyPlanner.color', 'Color')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {COURSE_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setCourseForm(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    courseForm.color === color ? 'ring-2 ring-offset-2 ring-[#0D9488] scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.studyPlanner.schedule', 'Schedule')}
              </label>
              <button
                onClick={addScheduleItem}
                className="text-sm text-[#0D9488] hover:text-[#0F766E]"
              >
                {t('tools.studyPlanner.addTimeSlot', '+ Add Time Slot')}
              </button>
            </div>
            <div className="space-y-2">
              {courseForm.schedule?.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={item.day}
                    onChange={(e) => updateScheduleItem(i, 'day', e.target.value)}
                    className={`flex-1 px-2 py-1 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => updateScheduleItem(i, 'startTime', e.target.value)}
                    className={`px-2 py-1 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>-</span>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => updateScheduleItem(i, 'endTime', e.target.value)}
                    className={`px-2 py-1 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={() => removeScheduleItem(i)}
                    className={`p-1 rounded transition-colors ${
                      isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowCourseModal(false);
                setEditingCourse(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.studyPlanner.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleSaveCourse}
              className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingCourse ? t('tools.studyPlanner.update', 'Update') : t('tools.studyPlanner.add', 'Add')} Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssignmentModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingAssignment ? t('tools.studyPlanner.editAssignment', 'Edit Assignment') : t('tools.studyPlanner.addAssignment2', 'Add Assignment')}
          </h3>
          <button
            onClick={() => {
              setShowAssignmentModal(false);
              setEditingAssignment(null);
            }}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.title', 'Title *')}
            </label>
            <input
              type="text"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('tools.studyPlanner.eGChapter5Homework', 'e.g., Chapter 5 Homework')}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.course', 'Course *')}
            </label>
            <select
              value={assignmentForm.courseId}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, courseId: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="">{t('tools.studyPlanner.selectACourse', 'Select a course')}</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.studyPlanner.type', 'Type')}
              </label>
              <select
                value={assignmentForm.type}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, type: e.target.value as Assignment['type'] }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="homework">{t('tools.studyPlanner.homework', 'Homework')}</option>
                <option value="project">{t('tools.studyPlanner.project', 'Project')}</option>
                <option value="exam">{t('tools.studyPlanner.exam', 'Exam')}</option>
                <option value="quiz">{t('tools.studyPlanner.quiz', 'Quiz')}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.studyPlanner.priority', 'Priority')}
              </label>
              <select
                value={assignmentForm.priority}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, priority: e.target.value as Assignment['priority'] }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="low">{t('tools.studyPlanner.low', 'Low')}</option>
                <option value="medium">{t('tools.studyPlanner.medium', 'Medium')}</option>
                <option value="high">{t('tools.studyPlanner.high', 'High')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.dueDate', 'Due Date *')}
            </label>
            <input
              type="date"
              value={assignmentForm.dueDate}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.status', 'Status')}
            </label>
            <select
              value={assignmentForm.status}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, status: e.target.value as Assignment['status'] }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="not_started">{t('tools.studyPlanner.notStarted2', 'Not Started')}</option>
              <option value="in_progress">{t('tools.studyPlanner.inProgress2', 'In Progress')}</option>
              <option value="completed">{t('tools.studyPlanner.completed4', 'Completed')}</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.gradeOptional', 'Grade (optional)')}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={assignmentForm.grade || ''}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, grade: parseFloat(e.target.value) || undefined }))}
              placeholder="e.g., 95"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.notes', 'Notes')}
            </label>
            <textarea
              value={assignmentForm.notes}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('tools.studyPlanner.additionalNotes', 'Additional notes...')}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
              } resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowAssignmentModal(false);
                setEditingAssignment(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.studyPlanner.cancel2', 'Cancel')}
            </button>
            <button
              onClick={handleSaveAssignment}
              className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingAssignment ? t('tools.studyPlanner.update2', 'Update') : t('tools.studyPlanner.add2', 'Add')} Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudyModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.studyPlanner.scheduleStudySession', 'Schedule Study Session')}
          </h3>
          <button
            onClick={() => setShowStudyModal(false)}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.course2', 'Course *')}
            </label>
            <select
              value={studyForm.courseId}
              onChange={(e) => setStudyForm(prev => ({ ...prev, courseId: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="">{t('tools.studyPlanner.selectACourse2', 'Select a course')}</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.date', 'Date *')}
            </label>
            <input
              type="date"
              value={studyForm.date}
              onChange={(e) => setStudyForm(prev => ({ ...prev, date: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.studyPlanner.startTime', 'Start Time *')}
              </label>
              <input
                type="time"
                value={studyForm.startTime}
                onChange={(e) => setStudyForm(prev => ({ ...prev, startTime: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.studyPlanner.endTime', 'End Time *')}
              </label>
              <input
                type="time"
                value={studyForm.endTime}
                onChange={(e) => setStudyForm(prev => ({ ...prev, endTime: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowStudyModal(false)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.studyPlanner.cancel3', 'Cancel')}
            </button>
            <button
              onClick={handleSaveStudySession}
              className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {t('tools.studyPlanner.schedule2', 'Schedule')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGradeModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.studyPlanner.addGradeEntry', 'Add Grade Entry')}
          </h3>
          <button
            onClick={() => setShowGradeModal(false)}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.course3', 'Course *')}
            </label>
            <select
              value={gradeForm.courseId}
              onChange={(e) => setGradeForm(prev => ({ ...prev, courseId: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="">{t('tools.studyPlanner.selectACourse3', 'Select a course')}</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.category', 'Category *')}
            </label>
            <input
              type="text"
              value={gradeForm.category}
              onChange={(e) => setGradeForm(prev => ({ ...prev, category: e.target.value }))}
              placeholder={t('tools.studyPlanner.eGMidtermHomeworkFinal', 'e.g., Midterm, Homework, Final Project')}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.studyPlanner.weight', 'Weight (%)')}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={gradeForm.weight}
              onChange={(e) => setGradeForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              placeholder="e.g., 25"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.studyPlanner.earnedPoints', 'Earned Points')}
              </label>
              <input
                type="number"
                min="0"
                value={gradeForm.earnedPoints}
                onChange={(e) => setGradeForm(prev => ({ ...prev, earnedPoints: parseFloat(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.studyPlanner.totalPoints', 'Total Points')}
              </label>
              <input
                type="number"
                min="1"
                value={gradeForm.totalPoints}
                onChange={(e) => setGradeForm(prev => ({ ...prev, totalPoints: parseFloat(e.target.value) || 100 }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowGradeModal(false)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.studyPlanner.cancel4', 'Cancel')}
            </button>
            <button
              onClick={handleSaveGradeWeight}
              className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {t('tools.studyPlanner.addGrade2', 'Add Grade')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDark ? t('tools.studyPlanner.fromGray800To0d9488', 'from-gray-800 to-[#0D9488]/20') : t('tools.studyPlanner.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.studyPlanner.studyPlanner', 'Study Planner')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.studyPlanner.manageCoursesAssignmentsAndTrack', 'Manage courses, assignments, and track your academic progress')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WidgetEmbedButton toolSlug="study-planner" toolName="Study Planner" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="md"
            />
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={assignments.length === 0}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.studyPlanner.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {renderTabs()}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'courses' && renderCourses()}
        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'study' && renderStudySessions()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'grades' && renderGrades()}
      </div>

      {/* Modals */}
      {showCourseModal && renderCourseModal()}
      {showAssignmentModal && renderAssignmentModal()}
      {showStudyModal && renderStudyModal()}
      {showGradeModal && renderGradeModal()}
    </div>
  );
};

export default StudyPlannerTool;
