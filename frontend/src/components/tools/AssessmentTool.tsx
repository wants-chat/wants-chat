'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Filter,
  Loader2,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Award,
  AlertTriangle,
  FileText,
  Percent,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
type AssessmentType = 'quiz' | 'test' | 'exam' | 'homework' | 'project' | 'oral' | 'practical' | 'diagnostic';
type GradingScale = 'percentage' | 'letter' | 'points' | 'pass_fail';
type PerformanceLevel = 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'failing';

interface Question {
  id: string;
  number: number;
  topic: string;
  maxPoints: number;
  earnedPoints: number;
  notes: string;
}

interface SkillAssessed {
  id: string;
  name: string;
  level: PerformanceLevel;
  notes: string;
}

interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  assessmentType: AssessmentType;
  title: string;
  description: string;
  assessmentDate: string;
  dueDate?: string;
  gradingScale: GradingScale;
  maxScore: number;
  earnedScore: number;
  percentage: number;
  letterGrade?: string;
  passed?: boolean;
  questions: Question[];
  skillsAssessed: SkillAssessed[];
  strengths: string[];
  areasForImprovement: string[];
  feedback: string;
  recommendations: string;
  parentNotified: boolean;
  parentNotifiedDate?: string;
  retakeAllowed: boolean;
  retakeDate?: string;
  retakeScore?: number;
  createdAt: string;
  updatedAt: string;
}

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
  'SAT Prep',
  'ACT Prep',
];

const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'test', label: 'Test' },
  { value: 'exam', label: 'Exam' },
  { value: 'homework', label: 'Homework' },
  { value: 'project', label: 'Project' },
  { value: 'oral', label: 'Oral Examination' },
  { value: 'practical', label: 'Practical/Lab' },
  { value: 'diagnostic', label: 'Diagnostic Test' },
];

const GRADING_SCALES: { value: GradingScale; label: string }[] = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'letter', label: 'Letter Grade' },
  { value: 'points', label: 'Points' },
  { value: 'pass_fail', label: 'Pass/Fail' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const calculateLetterGrade = (percentage: number): string => {
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

const getPerformanceLevel = (percentage: number): PerformanceLevel => {
  if (percentage >= 90) return 'excellent';
  if (percentage >= 80) return 'good';
  if (percentage >= 70) return 'satisfactory';
  if (percentage >= 60) return 'needs_improvement';
  return 'failing';
};

// Column configuration for exports and useToolData hook
const COLUMNS: ColumnConfig[] = [
  { key: 'studentName', header: 'Student Name', type: 'string' },
  { key: 'subject', header: 'Subject', type: 'string' },
  { key: 'assessmentType', header: 'Type', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'assessmentDate', header: 'Date', type: 'date' },
  { key: 'maxScore', header: 'Max Score', type: 'number' },
  { key: 'earnedScore', header: 'Earned Score', type: 'number' },
  { key: 'percentage', header: 'Percentage', type: 'number' },
  { key: 'letterGrade', header: 'Grade', type: 'string' },
  { key: 'feedback', header: 'Feedback', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

interface AssessmentToolProps {
  uiConfig?: UIConfig;
}

export const AssessmentTool: React.FC<AssessmentToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: assessments,
    setData: setAssessments,
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
  } = useToolData<Assessment>('student-assessments', [], COLUMNS);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'view' | 'analytics'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterType, setFilterType] = useState<AssessmentType | 'all'>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    questions: true,
    skills: true,
    feedback: true,
  });
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Form states
  const [formData, setFormData] = useState<Partial<Assessment>>({
    studentName: '',
    subject: 'Mathematics',
    assessmentType: 'quiz',
    title: '',
    description: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    gradingScale: 'percentage',
    maxScore: 100,
    earnedScore: 0,
    percentage: 0,
    questions: [],
    skillsAssessed: [],
    strengths: [],
    areasForImprovement: [],
    feedback: '',
    recommendations: '',
    parentNotified: false,
    retakeAllowed: false,
  });

  const [newQuestion, setNewQuestion] = useState({ topic: '', maxPoints: 10, earnedPoints: 0, notes: '' });
  const [newSkill, setNewSkill] = useState({ name: '', level: 'satisfactory' as PerformanceLevel, notes: '' });
  const [newStrength, setNewStrength] = useState('');
  const [newImprovement, setNewImprovement] = useState('');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // If editing from gallery, restore saved state
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        setIsPrefilled(true);
        // Data is managed by useToolData hook automatically
      } else if (params.studentName || params.student) {
        setFormData((prev) => ({
          ...prev,
          studentName: params.studentName || params.student || '',
          subject: params.subject || prev.subject,
          title: params.title || prev.title,
        }));
        setActiveTab('add');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate percentage when scores change
  useEffect(() => {
    if (formData.maxScore && formData.maxScore > 0) {
      const percentage = ((formData.earnedScore || 0) / formData.maxScore) * 100;
      setFormData((prev) => ({
        ...prev,
        percentage: Math.round(percentage * 100) / 100,
        letterGrade: calculateLetterGrade(percentage),
        passed: percentage >= 60,
      }));
    }
  }, [formData.earnedScore, formData.maxScore]);

  // Filtered assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesSearch =
        assessment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = filterSubject === 'all' || assessment.subject === filterSubject;
      const matchesType = filterType === 'all' || assessment.assessmentType === filterType;
      return matchesSearch && matchesSubject && matchesType;
    });
  }, [assessments, searchQuery, filterSubject, filterType]);

  const selectedAssessment = selectedAssessmentId
    ? assessments.find((a) => a.id === selectedAssessmentId)
    : null;

  // Handlers
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const addQuestion = () => {
    if (newQuestion.topic.trim()) {
      const questionNumber = (formData.questions?.length || 0) + 1;
      setFormData((prev) => ({
        ...prev,
        questions: [...(prev.questions || []), { id: generateId(), number: questionNumber, ...newQuestion }],
      }));
      setNewQuestion({ topic: '', maxPoints: 10, earnedPoints: 0, notes: '' });
    }
  };

  const removeQuestion = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).filter((q) => q.id !== id),
    }));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    }));
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        skillsAssessed: [...(prev.skillsAssessed || []), { id: generateId(), ...newSkill }],
      }));
      setNewSkill({ name: '', level: 'satisfactory', notes: '' });
    }
  };

  const removeSkill = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsAssessed: (prev.skillsAssessed || []).filter((s) => s.id !== id),
    }));
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setFormData((prev) => ({
        ...prev,
        strengths: [...(prev.strengths || []), newStrength.trim()],
      }));
      setNewStrength('');
    }
  };

  const removeStrength = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      strengths: (prev.strengths || []).filter((_, i) => i !== index),
    }));
  };

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setFormData((prev) => ({
        ...prev,
        areasForImprovement: [...(prev.areasForImprovement || []), newImprovement.trim()],
      }));
      setNewImprovement('');
    }
  };

  const removeImprovement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      areasForImprovement: (prev.areasForImprovement || []).filter((_, i) => i !== index),
    }));
  };

  const calculateTotalFromQuestions = () => {
    const questions = formData.questions || [];
    if (questions.length > 0) {
      const maxScore = questions.reduce((sum, q) => sum + q.maxPoints, 0);
      const earnedScore = questions.reduce((sum, q) => sum + q.earnedPoints, 0);
      setFormData((prev) => ({ ...prev, maxScore, earnedScore }));
    }
  };

  const handleSaveAssessment = async () => {
    if (!formData.studentName || !formData.title) {
      setValidationMessage('Please fill in required fields: Student Name and Assessment Title');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const percentage = formData.maxScore ? ((formData.earnedScore || 0) / formData.maxScore) * 100 : 0;

    const assessmentData: Assessment = {
      id: selectedAssessmentId || generateId(),
      studentId: generateId(),
      studentName: formData.studentName || '',
      subject: formData.subject || 'Mathematics',
      assessmentType: formData.assessmentType || 'quiz',
      title: formData.title || '',
      description: formData.description || '',
      assessmentDate: formData.assessmentDate || now.split('T')[0],
      dueDate: formData.dueDate,
      gradingScale: formData.gradingScale || 'percentage',
      maxScore: formData.maxScore || 100,
      earnedScore: formData.earnedScore || 0,
      percentage: Math.round(percentage * 100) / 100,
      letterGrade: calculateLetterGrade(percentage),
      passed: percentage >= 60,
      questions: formData.questions || [],
      skillsAssessed: formData.skillsAssessed || [],
      strengths: formData.strengths || [],
      areasForImprovement: formData.areasForImprovement || [],
      feedback: formData.feedback || '',
      recommendations: formData.recommendations || '',
      parentNotified: formData.parentNotified || false,
      parentNotifiedDate: formData.parentNotifiedDate,
      retakeAllowed: formData.retakeAllowed || false,
      retakeDate: formData.retakeDate,
      retakeScore: formData.retakeScore,
      createdAt: selectedAssessmentId
        ? assessments.find((a) => a.id === selectedAssessmentId)?.createdAt || now
        : now,
      updatedAt: now,
    };

    if (selectedAssessmentId) {
      await updateItem(selectedAssessmentId, assessmentData);
    } else {
      await addItem(assessmentData);
    }

    resetForm();
    setActiveTab('list');
  };

  const handleDeleteAssessment = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Assessment',
      message: 'Are you sure you want to delete this assessment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteItem(id);
      if (selectedAssessmentId === id) {
        setSelectedAssessmentId(null);
        setActiveTab('list');
      }
    }
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setFormData(assessment);
    setSelectedAssessmentId(assessment.id);
    setActiveTab('add');
  };

  const handleViewAssessment = (assessment: Assessment) => {
    setSelectedAssessmentId(assessment.id);
    setActiveTab('view');
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      subject: 'Mathematics',
      assessmentType: 'quiz',
      title: '',
      description: '',
      assessmentDate: new Date().toISOString().split('T')[0],
      gradingScale: 'percentage',
      maxScore: 100,
      earnedScore: 0,
      percentage: 0,
      questions: [],
      skillsAssessed: [],
      strengths: [],
      areasForImprovement: [],
      feedback: '',
      recommendations: '',
      parentNotified: false,
      retakeAllowed: false,
    });
    setSelectedAssessmentId(null);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
    if (percentage >= 60) return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
  };

  const getPerformanceLevelColor = (level: PerformanceLevel) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'satisfactory':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'needs_improvement':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'failing':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Stats
  const stats = useMemo(() => {
    if (assessments.length === 0) {
      return { total: 0, avgScore: 0, passed: 0, passRate: 0, highestScore: 0, lowestScore: 0 };
    }

    const total = assessments.length;
    const avgScore = assessments.reduce((sum, a) => sum + a.percentage, 0) / total;
    const passed = assessments.filter((a) => a.passed).length;
    const passRate = (passed / total) * 100;
    const highestScore = Math.max(...assessments.map((a) => a.percentage));
    const lowestScore = Math.min(...assessments.map((a) => a.percentage));

    return { total, avgScore, passed, passRate, highestScore, lowestScore };
  }, [assessments]);

  // Analytics by subject
  const subjectAnalytics = useMemo(() => {
    const bySubject: Record<string, { count: number; totalScore: number; avgScore: number }> = {};
    assessments.forEach((a) => {
      if (!bySubject[a.subject]) {
        bySubject[a.subject] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      bySubject[a.subject].count++;
      bySubject[a.subject].totalScore += a.percentage;
    });
    Object.keys(bySubject).forEach((subject) => {
      bySubject[subject].avgScore = bySubject[subject].totalScore / bySubject[subject].count;
    });
    return bySubject;
  }, [assessments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">{t('tools.assessment.loadingAssessments', 'Loading assessments...')}</span>
      </div>
    );
  }

  return (
    <>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
        {validationMessage}
      </div>
    )}
    <div className={`p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold">{t('tools.assessment.studentAssessments', 'Student Assessments')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tools.assessment.trackAndAnalyzeStudentPerformance', 'Track and analyze student performance on tests and assessments')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="assessment" toolName="Assessment" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={syncError}
            onRetry={forceSync}
          />
          <ExportDropdown
            onExportCSV={exportCSV}
            onExportExcel={exportExcel}
            onExportJSON={exportJSON}
            onExportPDF={exportPDF}
            onCopy={copyToClipboard}
            onPrint={print}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.assessment.total', 'Total')}</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Percent className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.assessment.avgScore', 'Avg Score')}</p>
                <p className="text-xl font-bold">{stats.avgScore.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.assessment.passed', 'Passed')}</p>
                <p className="text-xl font-bold">{stats.passed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.assessment.passRate', 'Pass Rate')}</p>
                <p className="text-xl font-bold">{stats.passRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.assessment.highest', 'Highest')}</p>
                <p className="text-xl font-bold">{stats.highestScore.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.assessment.lowest', 'Lowest')}</p>
                <p className="text-xl font-bold">{stats.lowestScore.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab('list');
            resetForm();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('tools.assessment.assessments', 'Assessments')}
        </button>
        <button
          onClick={() => {
            setActiveTab('add');
            resetForm();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'add'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('tools.assessment.newAssessment', 'New Assessment')}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {t('tools.assessment.analytics', 'Analytics')}
        </button>
      </div>

      {/* List View */}
      {activeTab === 'list' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('tools.assessment.searchAssessments', 'Search assessments...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="all">{t('tools.assessment.allSubjects', 'All Subjects')}</option>
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as AssessmentType | 'all')}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="all">{t('tools.assessment.allTypes', 'All Types')}</option>
              {ASSESSMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assessments List */}
          <div className="space-y-4">
            {filteredAssessments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ClipboardCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t('tools.assessment.noAssessmentsFound', 'No assessments found')}</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    {t('tools.assessment.createFirstAssessment', 'Create First Assessment')}
                  </button>
                </CardContent>
              </Card>
            ) : (
              filteredAssessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{assessment.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(
                              assessment.percentage
                            )}`}
                          >
                            {assessment.letterGrade} ({assessment.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {assessment.studentName}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {assessment.subject}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClipboardCheck className="w-4 h-4" />
                            {ASSESSMENT_TYPES.find((t) => t.value === assessment.assessmentType)?.label}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {assessment.assessmentDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            Score: {assessment.earnedScore}/{assessment.maxScore}
                          </span>
                          {assessment.passed ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              {t('tools.assessment.passed2', 'Passed')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 text-sm">
                              <XCircle className="w-4 h-4" />
                              {t('tools.assessment.failed', 'Failed')}
                            </span>
                          )}
                          {assessment.retakeAllowed && (
                            <span className="text-xs text-blue-500">{t('tools.assessment.retakeAllowed', 'Retake Allowed')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewAssessment(assessment)}
                          className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditAssessment(assessment)}
                          className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(assessment.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit View */}
      {activeTab === 'add' && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedAssessmentId ? t('tools.assessment.editAssessment', 'Edit Assessment') : t('tools.assessment.newAssessment2', 'New Assessment')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.studentName', 'Student Name *')}</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.assessment.enterStudentName', 'Enter student name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.assessmentTitle', 'Assessment Title *')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.assessment.eGChapter5Quiz', 'e.g., Chapter 5 Quiz')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.subject', 'Subject')}</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.type', 'Type')}</label>
                <select
                  value={formData.assessmentType}
                  onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value as AssessmentType })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                >
                  {ASSESSMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.date', 'Date')}</label>
                <input
                  type="date"
                  value={formData.assessmentDate}
                  onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.gradingScale', 'Grading Scale')}</label>
                <select
                  value={formData.gradingScale}
                  onChange={(e) => setFormData({ ...formData, gradingScale: e.target.value as GradingScale })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                >
                  {GRADING_SCALES.map((scale) => (
                    <option key={scale.value} value={scale.value}>
                      {scale.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.maxScore', 'Max Score')}</label>
                <input
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.earnedScore', 'Earned Score')}</label>
                <input
                  type="number"
                  value={formData.earnedScore}
                  onChange={(e) => setFormData({ ...formData, earnedScore: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.percentage', 'Percentage')}</label>
                <div
                  className={`px-3 py-2 rounded-lg text-center font-bold ${getGradeColor(formData.percentage || 0)}`}
                >
                  {(formData.percentage || 0).toFixed(1)}%
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.assessment.letterGrade', 'Letter Grade')}</label>
                <div
                  className={`px-3 py-2 rounded-lg text-center font-bold ${getGradeColor(formData.percentage || 0)}`}
                >
                  {formData.letterGrade || 'N/A'}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('questions')}
              >
                <label className="text-sm font-medium">{t('tools.assessment.questionBreakdownOptional', 'Question Breakdown (Optional)')}</label>
                {expandedSections.questions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              {expandedSections.questions && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newQuestion.topic}
                      onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.assessment.topicQuestion', 'Topic/Question')}
                    />
                    <input
                      type="number"
                      value={newQuestion.maxPoints}
                      onChange={(e) => setNewQuestion({ ...newQuestion, maxPoints: parseInt(e.target.value) || 0 })}
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.assessment.maxPoints', 'Max Points')}
                    />
                    <input
                      type="number"
                      value={newQuestion.earnedPoints}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, earnedPoints: parseInt(e.target.value) || 0 })
                      }
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.assessment.earnedPoints', 'Earned Points')}
                    />
                    <button
                      onClick={addQuestion}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {(formData.questions || []).length > 0 && (
                    <>
                      <div className="space-y-2">
                        {(formData.questions || []).map((q, index) => (
                          <div
                            key={q.id}
                            className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                          >
                            <span className="font-medium">Q{index + 1}:</span>
                            <span className="flex-1">{q.topic}</span>
                            <span>
                              {q.earnedPoints}/{q.maxPoints}
                            </span>
                            <button onClick={() => removeQuestion(q.id)} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={calculateTotalFromQuestions}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                      >
                        {t('tools.assessment.calculateTotalFromQuestions', 'Calculate Total from Questions')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Skills Assessed */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('skills')}
              >
                <label className="text-sm font-medium">{t('tools.assessment.skillsAssessed', 'Skills Assessed')}</label>
                {expandedSections.skills ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              {expandedSections.skills && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.assessment.skillName', 'Skill name')}
                    />
                    <select
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as PerformanceLevel })}
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="excellent">{t('tools.assessment.excellent', 'Excellent')}</option>
                      <option value="good">{t('tools.assessment.good', 'Good')}</option>
                      <option value="satisfactory">{t('tools.assessment.satisfactory', 'Satisfactory')}</option>
                      <option value="needs_improvement">{t('tools.assessment.needsImprovement', 'Needs Improvement')}</option>
                      <option value="failing">{t('tools.assessment.failing', 'Failing')}</option>
                    </select>
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.skillsAssessed || []).map((skill) => (
                      <span
                        key={skill.id}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getPerformanceLevelColor(
                          skill.level
                        )}`}
                      >
                        {skill.name} - {skill.level.replace('_', ' ')}
                        <button onClick={() => removeSkill(skill.id)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.assessment.strengthsDemonstrated', 'Strengths Demonstrated')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                    placeholder={t('tools.assessment.addStrength', 'Add strength')}
                    onKeyPress={(e) => e.key === 'Enter' && addStrength()}
                  />
                  <button
                    onClick={addStrength}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.strengths || []).map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center gap-2"
                    >
                      {item}
                      <button onClick={() => removeStrength(index)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.assessment.areasForImprovement', 'Areas for Improvement')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newImprovement}
                    onChange={(e) => setNewImprovement(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                    placeholder={t('tools.assessment.addAreaForImprovement', 'Add area for improvement')}
                    onKeyPress={(e) => e.key === 'Enter' && addImprovement()}
                  />
                  <button
                    onClick={addImprovement}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.areasForImprovement || []).map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm flex items-center gap-2"
                    >
                      {item}
                      <button onClick={() => removeImprovement(index)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('feedback')}
              >
                <label className="text-sm font-medium">{t('tools.assessment.feedbackRecommendations', 'Feedback & Recommendations')}</label>
                {expandedSections.feedback ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              {expandedSections.feedback && (
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('tools.assessment.feedbackForStudent', 'Feedback for Student')}</label>
                    <textarea
                      value={formData.feedback}
                      onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.assessment.detailedFeedbackForTheStudent', 'Detailed feedback for the student...')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('tools.assessment.recommendations', 'Recommendations')}</label>
                    <textarea
                      value={formData.recommendations}
                      onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.assessment.recommendationsForImprovement', 'Recommendations for improvement...')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.parentNotified}
                  onChange={(e) => setFormData({ ...formData, parentNotified: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">{t('tools.assessment.parentNotified', 'Parent Notified')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.retakeAllowed}
                  onChange={(e) => setFormData({ ...formData, retakeAllowed: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">{t('tools.assessment.retakeAllowed2', 'Retake Allowed')}</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('tools.assessment.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveAssessment}
                disabled={isSaving}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {selectedAssessmentId ? t('tools.assessment.updateAssessment', 'Update Assessment') : t('tools.assessment.saveAssessment', 'Save Assessment')}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Assessment */}
      {activeTab === 'view' && selectedAssessment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('tools.assessment.assessmentDetails', 'Assessment Details')}</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditAssessment(selectedAssessment)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('tools.assessment.edit', 'Edit')}
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.assessment.backToList', 'Back to List')}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div>
                <h2 className="text-xl font-bold">{selectedAssessment.title}</h2>
                <p className="text-gray-500">{selectedAssessment.studentName}</p>
              </div>
              <div className="text-center">
                <div
                  className={`text-4xl font-bold px-6 py-3 rounded-lg ${getGradeColor(selectedAssessment.percentage)}`}
                >
                  {selectedAssessment.letterGrade}
                </div>
                <p className="text-sm mt-1">{selectedAssessment.percentage.toFixed(1)}%</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('tools.assessment.subject2', 'Subject')}</p>
                <p className="font-semibold">{selectedAssessment.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.assessment.type2', 'Type')}</p>
                <p className="font-semibold">
                  {ASSESSMENT_TYPES.find((t) => t.value === selectedAssessment.assessmentType)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.assessment.date2', 'Date')}</p>
                <p className="font-semibold">{selectedAssessment.assessmentDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.assessment.score', 'Score')}</p>
                <p className="font-semibold">
                  {selectedAssessment.earnedScore}/{selectedAssessment.maxScore}
                </p>
              </div>
            </div>

            {/* Questions */}
            {selectedAssessment.questions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.assessment.questionBreakdown', 'Question Breakdown')}</h3>
                <div className="space-y-2">
                  {selectedAssessment.questions.map((q, index) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <span>
                        Q{index + 1}: {q.topic}
                      </span>
                      <span
                        className={`font-medium ${
                          q.earnedPoints === q.maxPoints ? 'text-green-600' : 'text-orange-600'
                        }`}
                      >
                        {q.earnedPoints}/{q.maxPoints}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {selectedAssessment.skillsAssessed.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.assessment.skillsAssessed2', 'Skills Assessed')}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAssessment.skillsAssessed.map((skill) => (
                    <span
                      key={skill.id}
                      className={`px-3 py-1 rounded-full text-sm ${getPerformanceLevelColor(skill.level)}`}
                    >
                      {skill.name}: {skill.level.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedAssessment.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">{t('tools.assessment.strengths', 'Strengths')}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedAssessment.strengths.map((item, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedAssessment.areasForImprovement.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-orange-600">{t('tools.assessment.areasForImprovement2', 'Areas for Improvement')}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedAssessment.areasForImprovement.map((item, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Feedback */}
            {selectedAssessment.feedback && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.assessment.feedback', 'Feedback')}</h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedAssessment.feedback}
                </p>
              </div>
            )}

            {selectedAssessment.recommendations && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.assessment.recommendations2', 'Recommendations')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedAssessment.recommendations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics View */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('tools.assessment.performanceBySubject', 'Performance by Subject')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(subjectAnalytics).map(([subject, data]) => (
                  <div key={subject} className="flex items-center gap-4">
                    <span className="w-40 font-medium">{subject}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                      <div
                        className={`h-6 rounded-full ${
                          data.avgScore >= 80 ? 'bg-green-500' : data.avgScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${data.avgScore}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-medium">{data.avgScore.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500">({data.count} tests)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('tools.assessment.recentAssessments', 'Recent Assessments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assessments.slice(0, 10).map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{assessment.title}</p>
                      <p className="text-sm text-gray-500">
                        {assessment.studentName} - {assessment.subject}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getGradeColor(assessment.percentage)}`}>
                      {assessment.letterGrade} ({assessment.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </>
  );
};

export default AssessmentTool;
