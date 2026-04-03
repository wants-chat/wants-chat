'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Target,
  ClipboardCheck,
  MessageSquare,
  FileText,
  CheckCircle2,
  Circle,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Award,
  Clock,
  Phone,
  Mail,
  Download,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | 'College' | 'Adult';
type ProgressStatus = 'improving' | 'maintaining' | 'struggling';
type SkillStatus = 'not_started' | 'in_progress' | 'mastered';

interface Skill {
  id: string;
  name: string;
  status: SkillStatus;
}

interface Subject {
  id: string;
  name: string;
  skills: Skill[];
}

interface Goal {
  id: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
}

interface Assessment {
  id: string;
  date: string;
  subject: string;
  score: number;
  maxScore: number;
  notes: string;
}

interface SessionNote {
  id: string;
  date: string;
  duration: number;
  topics: string;
  notes: string;
  homeworkAssigned: string;
}

interface HomeworkEntry {
  id: string;
  assignedDate: string;
  dueDate: string;
  subject: string;
  description: string;
  completed: boolean;
  completedDate?: string;
}

interface ParentCommunication {
  id: string;
  date: string;
  type: 'email' | 'phone' | 'in_person' | 'text';
  summary: string;
  followUp?: string;
}

interface Student {
  id: string;
  name: string;
  gradeLevel: GradeLevel;
  subjects: Subject[];
  goals: Goal[];
  assessments: Assessment[];
  sessionNotes: SessionNote[];
  homework: HomeworkEntry[];
  parentCommunications: ParentCommunication[];
  strengths: string[];
  areasForImprovement: string[];
  progressStatus: ProgressStatus;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  createdAt: string;
}

const gradeLevels: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College', 'Adult'];

const defaultSubjects = ['Mathematics', 'Reading', 'Writing', 'Science', 'History', 'Foreign Language', 'Test Prep'];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Column configuration for exports and useToolData hook
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Student Name', type: 'string' },
  { key: 'gradeLevel', header: 'Grade Level', type: 'string' },
  { key: 'progressStatus', header: 'Progress Status', type: 'string' },
  { key: 'subjectCount', header: 'Subjects', type: 'number' },
  { key: 'goalCount', header: 'Total Goals', type: 'number' },
  { key: 'completedGoals', header: 'Completed Goals', type: 'number' },
  { key: 'assessmentCount', header: 'Assessments', type: 'number' },
  { key: 'averageScore', header: 'Avg Score %', type: 'number' },
  { key: 'sessionCount', header: 'Sessions', type: 'number' },
  { key: 'homeworkCount', header: 'Homework Assigned', type: 'number' },
  { key: 'homeworkCompleted', header: 'Homework Completed', type: 'number' },
  { key: 'strengths', header: 'Strengths', type: 'string', format: (value: string[]) => Array.isArray(value) ? value.join(', ') : String(value || '') },
  { key: 'areasForImprovement', header: 'Areas for Improvement', type: 'string', format: (value: string[]) => Array.isArray(value) ? value.join(', ') : String(value || '') },
  { key: 'parentName', header: 'Parent Name', type: 'string' },
  { key: 'parentEmail', header: 'Parent Email', type: 'string' },
  { key: 'parentPhone', header: 'Parent Phone', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

interface StudentProgressToolProps {
  uiConfig?: UIConfig;
}

export const StudentProgressTool: React.FC<StudentProgressToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: students,
    setData: setStudents,
    addItem,
    updateItem: updateStudent,
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
  } = useToolData<Student>('student-progress', [], COLUMNS);

  // Export handlers for ExportDropdown
  const handleExportCSV = () => exportCSV();
  const handleExportExcel = () => exportExcel();
  const handleExportJSON = () => exportJSON();
  const handleExportPDF = () => exportPDF();
  const handlePrint = () => print();
  const handleCopyToClipboard = () => copyToClipboard();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'sessions' | 'homework' | 'communications' | 'reports'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProgressStatus | 'all'>('all');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    subjects: true,
    goals: true,
    strengths: true,
  });

  // Form states
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState<GradeLevel>('6');
  const [newParentName, setNewParentName] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');

  // Set initial selected student when data loads
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Apply prefill data from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.studentName) {
        setNewStudentName(params.studentName as string);
        hasChanges = true;
      }
      if (params.grade) {
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const selectedStudent = useMemo(() =>
    students.find(s => s.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || student.progressStatus === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [students, searchQuery, filterStatus]);

  // Prepare export data with computed fields
  const exportData = useMemo(() => {
    return students.map((student) => {
      const completedGoals = student.goals.filter(g => g.completed).length;
      const homeworkCompleted = student.homework.filter(h => h.completed).length;
      const averageScore = student.assessments.length > 0
        ? Math.round(student.assessments.reduce((acc, a) => acc + (a.score / a.maxScore) * 100, 0) / student.assessments.length)
        : 0;

      return {
        ...student,
        subjectCount: student.subjects.length,
        goalCount: student.goals.length,
        completedGoals,
        assessmentCount: student.assessments.length,
        averageScore,
        sessionCount: student.sessionNotes.length,
        homeworkCount: student.homework.length,
        homeworkCompleted,
      };
    });
  }, [students]);

  // Helper functions
  const getProgressStatusIcon = (status: ProgressStatus) => {
    switch (status) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'maintaining': return <Minus className="w-4 h-4 text-yellow-500" />;
      case 'struggling': return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  const getProgressStatusColor = (status: ProgressStatus) => {
    switch (status) {
      case 'improving': return 'text-green-500 bg-green-500/10';
      case 'maintaining': return 'text-yellow-500 bg-yellow-500/10';
      case 'struggling': return 'text-red-500 bg-red-500/10';
    }
  };

  const getSkillStatusIcon = (status: SkillStatus) => {
    switch (status) {
      case 'mastered': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'not_started': return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const calculateGoalCompletion = (student: Student): number => {
    if (student.goals.length === 0) return 0;
    const completed = student.goals.filter(g => g.completed).length;
    return Math.round((completed / student.goals.length) * 100);
  };

  const calculateAverageScore = (student: Student): number => {
    if (student.assessments.length === 0) return 0;
    const total = student.assessments.reduce((acc, a) => acc + (a.score / a.maxScore) * 100, 0);
    return Math.round(total / student.assessments.length);
  };

  const calculateHomeworkCompletion = (student: Student): number => {
    if (student.homework.length === 0) return 0;
    const completed = student.homework.filter(h => h.completed).length;
    return Math.round((completed / student.homework.length) * 100);
  };

  // CRUD Operations
  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: generateId(),
      name: newStudentName.trim(),
      gradeLevel: newStudentGrade,
      subjects: defaultSubjects.slice(0, 3).map(name => ({
        id: generateId(),
        name,
        skills: [],
      })),
      goals: [],
      assessments: [],
      sessionNotes: [],
      homework: [],
      parentCommunications: [],
      strengths: [],
      areasForImprovement: [],
      progressStatus: 'maintaining',
      parentName: newParentName.trim() || undefined,
      parentEmail: newParentEmail.trim() || undefined,
      parentPhone: newParentPhone.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addItem(newStudent);
    setSelectedStudentId(newStudent.id);
    setIsAddingStudent(false);
    setNewStudentName('');
    setNewStudentGrade('6');
    setNewParentName('');
    setNewParentEmail('');
    setNewParentPhone('');
  };

  const handleDeleteStudent = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Student',
      message: 'Are you sure you want to delete this student? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
      if (selectedStudentId === id) {
        const remaining = students.filter(s => s.id !== id);
        setSelectedStudentId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const handleUpdateStudent = (id: string, updates: Partial<Student>) => {
    updateStudent(id, updates);
  };

  // Subject operations
  const addSubject = (studentId: string, subjectName: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newSubject: Subject = {
      id: generateId(),
      name: subjectName,
      skills: [],
    };

    handleUpdateStudent(studentId, {
      subjects: [...student.subjects, newSubject],
    });
  };

  const removeSubject = (studentId: string, subjectId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleUpdateStudent(studentId, {
      subjects: student.subjects.filter(s => s.id !== subjectId),
    });
  };

  // Skill operations
  const addSkill = (studentId: string, subjectId: string, skillName: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newSkill: Skill = {
      id: generateId(),
      name: skillName,
      status: 'not_started',
    };

    handleUpdateStudent(studentId, {
      subjects: student.subjects.map(subj =>
        subj.id === subjectId
          ? { ...subj, skills: [...subj.skills, newSkill] }
          : subj
      ),
    });
  };

  const updateSkillStatus = (studentId: string, subjectId: string, skillId: string, status: SkillStatus) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleUpdateStudent(studentId, {
      subjects: student.subjects.map(subj =>
        subj.id === subjectId
          ? {
              ...subj,
              skills: subj.skills.map(skill =>
                skill.id === skillId ? { ...skill, status } : skill
              ),
            }
          : subj
      ),
    });
  };

  // Goal operations
  const addGoal = (studentId: string, description: string, targetDate: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newGoal: Goal = {
      id: generateId(),
      description,
      targetDate,
      completed: false,
    };

    handleUpdateStudent(studentId, {
      goals: [...student.goals, newGoal],
    });
  };

  const toggleGoalComplete = (studentId: string, goalId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleUpdateStudent(studentId, {
      goals: student.goals.map(g =>
        g.id === goalId
          ? { ...g, completed: !g.completed, completedDate: !g.completed ? new Date().toISOString() : undefined }
          : g
      ),
    });
  };

  // Assessment operations
  const addAssessment = (studentId: string, assessment: Omit<Assessment, 'id'>) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleUpdateStudent(studentId, {
      assessments: [...student.assessments, { ...assessment, id: generateId() }],
    });
  };

  // Session note operations
  const addSessionNote = (studentId: string, note: Omit<SessionNote, 'id'>) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleUpdateStudent(studentId, {
      sessionNotes: [...student.sessionNotes, { ...note, id: generateId() }],
    });
  };

  // Homework operations
  const addHomework = (studentId: string, hw: Omit<HomeworkEntry, 'id' | 'completed' | 'completedDate'>) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleUpdateStudent(studentId, {
      homework: [...student.homework, { ...hw, id: generateId(), completed: false }],
    });
  };

  const toggleHomeworkComplete = (studentId: string, homeworkId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleUpdateStudent(studentId, {
      homework: student.homework.map(h =>
        h.id === homeworkId
          ? { ...h, completed: !h.completed, completedDate: !h.completed ? new Date().toISOString() : undefined }
          : h
      ),
    });
  };

  // Parent communication operations
  const addCommunication = (studentId: string, comm: Omit<ParentCommunication, 'id'>) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleUpdateStudent(studentId, {
      parentCommunications: [...student.parentCommunications, { ...comm, id: generateId() }],
    });
  };

  // Generate progress report
  const generateProgressReport = (student: Student): string => {
    const avgScore = calculateAverageScore(student);
    const goalCompletion = calculateGoalCompletion(student);
    const hwCompletion = calculateHomeworkCompletion(student);

    const report = `
STUDENT PROGRESS REPORT
=======================
Student: ${student.name}
Grade Level: ${student.gradeLevel}
Report Date: ${new Date().toLocaleDateString()}

OVERALL PROGRESS STATUS: ${student.progressStatus.toUpperCase()}

SUMMARY STATISTICS
------------------
Average Assessment Score: ${avgScore}%
Goal Completion Rate: ${goalCompletion}%
Homework Completion Rate: ${hwCompletion}%
Total Sessions: ${student.sessionNotes.length}

SUBJECTS & SKILLS
-----------------
${student.subjects.map(subj => `
${subj.name}:
${subj.skills.length === 0 ? '  No skills tracked yet' : subj.skills.map(skill =>
  `  - ${skill.name}: ${skill.status.replace('_', ' ').toUpperCase()}`
).join('\n')}`).join('\n')}

LEARNING GOALS
--------------
${student.goals.length === 0 ? 'No goals set' : student.goals.map(g =>
  `- ${g.description} (Target: ${new Date(g.targetDate).toLocaleDateString()}) - ${g.completed ? 'COMPLETED' : 'In Progress'}`
).join('\n')}

STRENGTHS
---------
${student.strengths.length === 0 ? 'Not yet identified' : student.strengths.map(s => `- ${s}`).join('\n')}

AREAS FOR IMPROVEMENT
---------------------
${student.areasForImprovement.length === 0 ? 'Not yet identified' : student.areasForImprovement.map(a => `- ${a}`).join('\n')}

RECENT ASSESSMENTS
------------------
${student.assessments.slice(-5).map(a =>
  `- ${new Date(a.date).toLocaleDateString()}: ${a.subject} - ${a.score}/${a.maxScore} (${Math.round((a.score/a.maxScore)*100)}%)`
).join('\n') || 'No assessments recorded'}

RECENT SESSION NOTES
--------------------
${student.sessionNotes.slice(-3).map(n =>
  `${new Date(n.date).toLocaleDateString()} (${n.duration} min):
  Topics: ${n.topics}
  Notes: ${n.notes}`
).join('\n\n') || 'No session notes recorded'}
`;
    return report;
  };

  const downloadReport = (student: Student) => {
    const report = generateProgressReport(student);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name.replace(/\s+/g, '_')}_progress_report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Form components for adding data
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [showAddCommunication, setShowAddCommunication] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState<string | null>(null);

  // Assessment form state
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [assessmentSubject, setAssessmentSubject] = useState('');
  const [assessmentScore, setAssessmentScore] = useState('');
  const [assessmentMaxScore, setAssessmentMaxScore] = useState('100');
  const [assessmentNotes, setAssessmentNotes] = useState('');

  // Session form state
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionDuration, setSessionDuration] = useState('60');
  const [sessionTopics, setSessionTopics] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionHomework, setSessionHomework] = useState('');

  // Homework form state
  const [hwAssignedDate, setHwAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwSubject, setHwSubject] = useState('');
  const [hwDescription, setHwDescription] = useState('');

  // Communication form state
  const [commDate, setCommDate] = useState(new Date().toISOString().split('T')[0]);
  const [commType, setCommType] = useState<'email' | 'phone' | 'in_person' | 'text'>('email');
  const [commSummary, setCommSummary] = useState('');
  const [commFollowUp, setCommFollowUp] = useState('');

  // Goal form state
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  // Subject form state
  const [newSubjectName, setNewSubjectName] = useState('');

  // Skill form state
  const [newSkillName, setNewSkillName] = useState('');

  // Strength/improvement form state
  const [newStrength, setNewStrength] = useState('');
  const [newImprovement, setNewImprovement] = useState('');

  const handleAddAssessment = () => {
    if (!selectedStudent || !assessmentSubject || !assessmentScore) return;
    addAssessment(selectedStudent.id, {
      date: assessmentDate,
      subject: assessmentSubject,
      score: parseFloat(assessmentScore),
      maxScore: parseFloat(assessmentMaxScore),
      notes: assessmentNotes,
    });
    setShowAddAssessment(false);
    setAssessmentSubject('');
    setAssessmentScore('');
    setAssessmentMaxScore('100');
    setAssessmentNotes('');
  };

  const handleAddSession = () => {
    if (!selectedStudent || !sessionTopics) return;
    addSessionNote(selectedStudent.id, {
      date: sessionDate,
      duration: parseInt(sessionDuration),
      topics: sessionTopics,
      notes: sessionNotes,
      homeworkAssigned: sessionHomework,
    });
    setShowAddSession(false);
    setSessionTopics('');
    setSessionNotes('');
    setSessionHomework('');
  };

  const handleAddHomework = () => {
    if (!selectedStudent || !hwDescription || !hwDueDate) return;
    addHomework(selectedStudent.id, {
      assignedDate: hwAssignedDate,
      dueDate: hwDueDate,
      subject: hwSubject,
      description: hwDescription,
    });
    setShowAddHomework(false);
    setHwSubject('');
    setHwDescription('');
    setHwDueDate('');
  };

  const handleAddCommunication = () => {
    if (!selectedStudent || !commSummary) return;
    addCommunication(selectedStudent.id, {
      date: commDate,
      type: commType,
      summary: commSummary,
      followUp: commFollowUp || undefined,
    });
    setShowAddCommunication(false);
    setCommSummary('');
    setCommFollowUp('');
  };

  const handleAddGoal = () => {
    if (!selectedStudent || !goalDescription || !goalTargetDate) return;
    addGoal(selectedStudent.id, goalDescription, goalTargetDate);
    setShowAddGoal(false);
    setGoalDescription('');
    setGoalTargetDate('');
  };

  const handleAddSubject = () => {
    if (!selectedStudent || !newSubjectName.trim()) return;
    addSubject(selectedStudent.id, newSubjectName.trim());
    setShowAddSubject(false);
    setNewSubjectName('');
  };

  const handleAddSkill = (subjectId: string) => {
    if (!selectedStudent || !newSkillName.trim()) return;
    addSkill(selectedStudent.id, subjectId, newSkillName.trim());
    setShowAddSkill(null);
    setNewSkillName('');
  };

  const handleAddStrength = () => {
    if (!selectedStudent || !newStrength.trim()) return;
    updateStudent(selectedStudent.id, {
      strengths: [...selectedStudent.strengths, newStrength.trim()],
    });
    setNewStrength('');
  };

  const handleAddImprovement = () => {
    if (!selectedStudent || !newImprovement.trim()) return;
    updateStudent(selectedStudent.id, {
      areasForImprovement: [...selectedStudent.areasForImprovement, newImprovement.trim()],
    });
    setNewImprovement('');
  };

  const removeStrength = (index: number) => {
    if (!selectedStudent) return;
    updateStudent(selectedStudent.id, {
      strengths: selectedStudent.strengths.filter((_, i) => i !== index),
    });
  };

  const removeImprovement = (index: number) => {
    if (!selectedStudent) return;
    updateStudent(selectedStudent.id, {
      areasForImprovement: selectedStudent.areasForImprovement.filter((_, i) => i !== index),
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.studentProgress.studentProgressTracker', 'Student Progress Tracker')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.studentProgress.trackLearningGoalsAssessmentsAnd', 'Track learning goals, assessments, and progress for your students')}
                </p>
              </div>
            </div>
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={students.length === 0}
              showImport={false}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student List Sidebar */}
          <div className="lg:col-span-1">
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.studentProgress.students', 'Students')}
                  </CardTitle>
                  <button
                    onClick={() => setIsAddingStudent(true)}
                    className="p-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="mt-3 space-y-2">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('tools.studentProgress.searchStudents', 'Search students...')}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as ProgressStatus | 'all')}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="all">{t('tools.studentProgress.allProgressStatus', 'All Progress Status')}</option>
                    <option value="improving">{t('tools.studentProgress.improving', 'Improving')}</option>
                    <option value="maintaining">{t('tools.studentProgress.maintaining', 'Maintaining')}</option>
                    <option value="struggling">{t('tools.studentProgress.struggling', 'Struggling')}</option>
                  </select>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Add Student Form */}
                {isAddingStudent && (
                  <div className={`mb-4 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder={t('tools.studentProgress.studentName', 'Student name')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                      />
                      <select
                        value={newStudentGrade}
                        onChange={(e) => setNewStudentGrade(e.target.value as GradeLevel)}
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      >
                        {gradeLevels.map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newParentName}
                        onChange={(e) => setNewParentName(e.target.value)}
                        placeholder={t('tools.studentProgress.parentNameOptional', 'Parent name (optional)')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                      />
                      <input
                        type="email"
                        value={newParentEmail}
                        onChange={(e) => setNewParentEmail(e.target.value)}
                        placeholder={t('tools.studentProgress.parentEmailOptional', 'Parent email (optional)')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                      />
                      <input
                        type="tel"
                        value={newParentPhone}
                        onChange={(e) => setNewParentPhone(e.target.value)}
                        placeholder={t('tools.studentProgress.parentPhoneOptional', 'Parent phone (optional)')}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddStudent}
                          className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          {t('tools.studentProgress.add', 'Add')}
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingStudent(false);
                            setNewStudentName('');
                            setNewParentName('');
                            setNewParentEmail('');
                            setNewParentPhone('');
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            theme === 'dark'
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {t('tools.studentProgress.cancel', 'Cancel')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Student List */}
                <div className="space-y-2">
                  {filteredStudents.length === 0 ? (
                    <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {students.length === 0 ? t('tools.studentProgress.noStudentsYetAddYour', 'No students yet. Add your first student!') : t('tools.studentProgress.noStudentsMatchYourSearch', 'No students match your search.')}
                    </p>
                  ) : (
                    filteredStudents.map(student => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedStudentId === student.id
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{student.name}</div>
                            <div className={`text-xs ${selectedStudentId === student.id ? 'text-white/70' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Grade {student.gradeLevel}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getProgressStatusIcon(student.progressStatus)}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStudent(student.id);
                              }}
                              className={`p-1 rounded hover:bg-red-500/20 ${
                                selectedStudentId === student.id ? 'text-white/70 hover:text-red-300' : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedStudent ? (
              <>
                {/* Student Header */}
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} mb-6`}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <User className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedStudent.name}
                          </h2>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Grade {selectedStudent.gradeLevel}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getProgressStatusColor(selectedStudent.progressStatus)}`}>
                              {getProgressStatusIcon(selectedStudent.progressStatus)}
                              {selectedStudent.progressStatus.charAt(0).toUpperCase() + selectedStudent.progressStatus.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <select
                          value={selectedStudent.progressStatus}
                          onChange={(e) => updateStudent(selectedStudent.id, { progressStatus: e.target.value as ProgressStatus })}
                          className={`px-3 py-2 rounded-lg border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-200 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        >
                          <option value="improving">{t('tools.studentProgress.improving2', 'Improving')}</option>
                          <option value="maintaining">{t('tools.studentProgress.maintaining2', 'Maintaining')}</option>
                          <option value="struggling">{t('tools.studentProgress.struggling2', 'Struggling')}</option>
                        </select>
                        <button
                          onClick={() => downloadReport(selectedStudent)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {t('tools.studentProgress.downloadReport', 'Download Report')}
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.avgScore', 'Avg Score')}</div>
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {calculateAverageScore(selectedStudent)}%
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.goalsComplete', 'Goals Complete')}</div>
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {calculateGoalCompletion(selectedStudent)}%
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.hwCompletion', 'HW Completion')}</div>
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {calculateHomeworkCompletion(selectedStudent)}%
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.sessions', 'Sessions')}</div>
                        <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {selectedStudent.sessionNotes.length}
                        </div>
                      </div>
                    </div>

                    {/* Parent Contact Info */}
                    {(selectedStudent.parentName || selectedStudent.parentEmail || selectedStudent.parentPhone) && (
                      <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.parentGuardianContact', 'Parent/Guardian Contact')}</div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {selectedStudent.parentName && (
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{selectedStudent.parentName}</span>
                          )}
                          {selectedStudent.parentEmail && (
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Mail className="w-3.5 h-3.5" /> {selectedStudent.parentEmail}
                            </span>
                          )}
                          {selectedStudent.parentPhone && (
                            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Phone className="w-3.5 h-3.5" /> {selectedStudent.parentPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tabs */}
                <div className={`flex flex-wrap gap-2 mb-6 p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
                    { id: 'sessions', label: 'Sessions', icon: BookOpen },
                    { id: 'homework', label: 'Homework', icon: FileText },
                    { id: 'communications', label: 'Communications', icon: MessageSquare },
                    { id: 'reports', label: 'Reports', icon: Award },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Subjects & Skills */}
                    <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleSection('subjects')}
                            className="flex items-center gap-2"
                          >
                            <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {t('tools.studentProgress.subjectsSkills', 'Subjects & Skills')}
                            </CardTitle>
                            {expandedSections.subjects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setShowAddSubject(true)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" /> Subject
                          </button>
                        </div>
                      </CardHeader>
                      {expandedSections.subjects && (
                        <CardContent>
                          {showAddSubject && (
                            <div className={`mb-4 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newSubjectName}
                                  onChange={(e) => setNewSubjectName(e.target.value)}
                                  placeholder={t('tools.studentProgress.subjectName', 'Subject name')}
                                  className={`flex-1 px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                                />
                                <button
                                  onClick={handleAddSubject}
                                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm"
                                >
                                  {t('tools.studentProgress.add2', 'Add')}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowAddSubject(false);
                                    setNewSubjectName('');
                                  }}
                                  className={`px-4 py-2 rounded-lg text-sm ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {t('tools.studentProgress.cancel2', 'Cancel')}
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedStudent.subjects.length === 0 ? (
                            <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {t('tools.studentProgress.noSubjectsAddedYetAdd', 'No subjects added yet. Add a subject to start tracking skills.')}
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {selectedStudent.subjects.map(subject => (
                                <div
                                  key={subject.id}
                                  className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {subject.name}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => setShowAddSkill(subject.id)}
                                        className={`text-xs px-2 py-1 rounded ${
                                          theme === 'dark'
                                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                      >
                                        {t('tools.studentProgress.skill', '+ Skill')}
                                      </button>
                                      <button
                                        onClick={() => removeSubject(selectedStudent.id, subject.id)}
                                        className="text-red-500 hover:text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {showAddSkill === subject.id && (
                                    <div className="flex gap-2 mb-3">
                                      <input
                                        type="text"
                                        value={newSkillName}
                                        onChange={(e) => setNewSkillName(e.target.value)}
                                        placeholder={t('tools.studentProgress.skillName', 'Skill name')}
                                        className={`flex-1 px-3 py-1.5 rounded border ${
                                          theme === 'dark'
                                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                                      />
                                      <button
                                        onClick={() => handleAddSkill(subject.id)}
                                        className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded text-sm"
                                      >
                                        {t('tools.studentProgress.add3', 'Add')}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowAddSkill(null);
                                          setNewSkillName('');
                                        }}
                                        className={`px-3 py-1.5 rounded text-sm ${
                                          theme === 'dark'
                                            ? 'bg-gray-600 text-gray-300'
                                            : 'bg-gray-200 text-gray-700'
                                        }`}
                                      >
                                        {t('tools.studentProgress.cancel3', 'Cancel')}
                                      </button>
                                    </div>
                                  )}

                                  {subject.skills.length === 0 ? (
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {t('tools.studentProgress.noSkillsTrackedYet', 'No skills tracked yet')}
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      {subject.skills.map(skill => (
                                        <div
                                          key={skill.id}
                                          className={`flex items-center justify-between p-2 rounded ${
                                            theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            {getSkillStatusIcon(skill.status)}
                                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                              {skill.name}
                                            </span>
                                          </div>
                                          <select
                                            value={skill.status}
                                            onChange={(e) => updateSkillStatus(selectedStudent.id, subject.id, skill.id, e.target.value as SkillStatus)}
                                            className={`text-xs px-2 py-1 rounded border ${
                                              theme === 'dark'
                                                ? 'bg-gray-700 border-gray-500 text-white'
                                                : 'bg-gray-50 border-gray-300 text-gray-900'
                                            } focus:outline-none`}
                                          >
                                            <option value="not_started">{t('tools.studentProgress.notStarted', 'Not Started')}</option>
                                            <option value="in_progress">{t('tools.studentProgress.inProgress', 'In Progress')}</option>
                                            <option value="mastered">{t('tools.studentProgress.mastered', 'Mastered')}</option>
                                          </select>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>

                    {/* Goals */}
                    <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleSection('goals')}
                            className="flex items-center gap-2"
                          >
                            <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {t('tools.studentProgress.learningGoals', 'Learning Goals')}
                            </CardTitle>
                            {expandedSections.goals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setShowAddGoal(true)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" /> Goal
                          </button>
                        </div>

                        {/* Goal Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.studentProgress.progress', 'Progress')}</span>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{calculateGoalCompletion(selectedStudent)}%</span>
                          </div>
                          <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className="h-2 rounded-full bg-[#0D9488] transition-all"
                              style={{ width: `${calculateGoalCompletion(selectedStudent)}%` }}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      {expandedSections.goals && (
                        <CardContent>
                          {showAddGoal && (
                            <div className={`mb-4 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={goalDescription}
                                  onChange={(e) => setGoalDescription(e.target.value)}
                                  placeholder={t('tools.studentProgress.goalDescription', 'Goal description')}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                                />
                                <input
                                  type="date"
                                  value={goalTargetDate}
                                  onChange={(e) => setGoalTargetDate(e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 border-gray-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleAddGoal}
                                    className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium"
                                  >
                                    {t('tools.studentProgress.addGoal', 'Add Goal')}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowAddGoal(false);
                                      setGoalDescription('');
                                      setGoalTargetDate('');
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                      theme === 'dark'
                                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {t('tools.studentProgress.cancel4', 'Cancel')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedStudent.goals.length === 0 ? (
                            <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {t('tools.studentProgress.noGoalsSetYetAdd', 'No goals set yet. Add a learning goal to track progress.')}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {selectedStudent.goals.map(goal => (
                                <div
                                  key={goal.id}
                                  className={`flex items-start gap-3 p-3 rounded-lg ${
                                    goal.completed
                                      ? theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                                      : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                                  }`}
                                >
                                  <button
                                    onClick={() => toggleGoalComplete(selectedStudent.id, goal.id)}
                                    className="mt-0.5"
                                  >
                                    {goal.completed ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <Circle className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                    )}
                                  </button>
                                  <div className="flex-1">
                                    <p className={`text-sm ${goal.completed ? 'line-through' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {goal.description}
                                    </p>
                                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                                      {goal.completed && goal.completedDate && (
                                        <span className="text-green-500"> | Completed: {new Date(goal.completedDate).toLocaleDateString()}</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>

                    {/* Strengths & Areas for Improvement */}
                    <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <CardHeader>
                        <button
                          onClick={() => toggleSection('strengths')}
                          className="flex items-center gap-2"
                        >
                          <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('tools.studentProgress.strengthsAreasForImprovement', 'Strengths & Areas for Improvement')}
                          </CardTitle>
                          {expandedSections.strengths ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </CardHeader>
                      {expandedSections.strengths && (
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div>
                              <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                <TrendingUp className="w-4 h-4" /> Strengths
                              </h4>
                              <div className="space-y-2 mb-3">
                                {selectedStudent.strengths.map((strength, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center justify-between p-2 rounded ${
                                      theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                                    }`}
                                  >
                                    <span className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                                      {strength}
                                    </span>
                                    <button
                                      onClick={() => removeStrength(index)}
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newStrength}
                                  onChange={(e) => setNewStrength(e.target.value)}
                                  placeholder={t('tools.studentProgress.addStrength', 'Add strength')}
                                  className={`flex-1 px-3 py-1.5 rounded border ${
                                    theme === 'dark'
                                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`}
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddStrength()}
                                />
                                <button
                                  onClick={handleAddStrength}
                                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                                >
                                  {t('tools.studentProgress.add4', 'Add')}
                                </button>
                              </div>
                            </div>

                            {/* Areas for Improvement */}
                            <div>
                              <h4 className={`font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                                <Target className="w-4 h-4" /> Areas for Improvement
                              </h4>
                              <div className="space-y-2 mb-3">
                                {selectedStudent.areasForImprovement.map((area, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center justify-between p-2 rounded ${
                                      theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'
                                    }`}
                                  >
                                    <span className={`text-sm ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                                      {area}
                                    </span>
                                    <button
                                      onClick={() => removeImprovement(index)}
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newImprovement}
                                  onChange={(e) => setNewImprovement(e.target.value)}
                                  placeholder={t('tools.studentProgress.addAreaForImprovement', 'Add area for improvement')}
                                  className={`flex-1 px-3 py-1.5 rounded border ${
                                    theme === 'dark'
                                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  } focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm`}
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddImprovement()}
                                />
                                <button
                                  onClick={handleAddImprovement}
                                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm"
                                >
                                  {t('tools.studentProgress.add5', 'Add')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                )}

                {activeTab === 'assessments' && (
                  <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.studentProgress.assessmentScores', 'Assessment Scores')}
                        </CardTitle>
                        <button
                          onClick={() => setShowAddAssessment(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Assessment
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showAddAssessment && (
                        <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.studentProgress.addAssessment', 'Add Assessment')}</h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.date', 'Date')}</label>
                              <input
                                type="date"
                                value={assessmentDate}
                                onChange={(e) => setAssessmentDate(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.subject', 'Subject')}</label>
                              <input
                                type="text"
                                value={assessmentSubject}
                                onChange={(e) => setAssessmentSubject(e.target.value)}
                                placeholder={t('tools.studentProgress.eGMathQuiz', 'e.g., Math Quiz')}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.score', 'Score')}</label>
                              <input
                                type="number"
                                value={assessmentScore}
                                onChange={(e) => setAssessmentScore(e.target.value)}
                                placeholder="85"
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.maxScore', 'Max Score')}</label>
                              <input
                                type="number"
                                value={assessmentMaxScore}
                                onChange={(e) => setAssessmentMaxScore(e.target.value)}
                                placeholder="100"
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.notes', 'Notes')}</label>
                              <textarea
                                value={assessmentNotes}
                                onChange={(e) => setAssessmentNotes(e.target.value)}
                                placeholder={t('tools.studentProgress.additionalNotes', 'Additional notes...')}
                                rows={2}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm resize-none`}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={handleAddAssessment}
                              className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium"
                            >
                              {t('tools.studentProgress.addAssessment2', 'Add Assessment')}
                            </button>
                            <button
                              onClick={() => setShowAddAssessment(false)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                theme === 'dark'
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {t('tools.studentProgress.cancel5', 'Cancel')}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Assessment Chart */}
                      {selectedStudent.assessments.length > 0 && (
                        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <h4 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.studentProgress.scoreTrend', 'Score Trend')}</h4>
                          <div className="h-32 flex items-end gap-2">
                            {selectedStudent.assessments.slice(-10).map((assessment, index) => {
                              const percentage = (assessment.score / assessment.maxScore) * 100;
                              return (
                                <div key={assessment.id} className="flex-1 flex flex-col items-center">
                                  <div
                                    className={`w-full rounded-t transition-all ${
                                      percentage >= 80 ? 'bg-green-500' :
                                      percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ height: `${percentage}%` }}
                                    title={`${assessment.subject}: ${assessment.score}/${assessment.maxScore}`}
                                  />
                                  <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {Math.round(percentage)}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Assessment List */}
                      {selectedStudent.assessments.length === 0 ? (
                        <p className={`text-sm text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {t('tools.studentProgress.noAssessmentsRecordedYetAdd', 'No assessments recorded yet. Add an assessment to track scores.')}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {[...selectedStudent.assessments].reverse().map(assessment => (
                            <div
                              key={assessment.id}
                              className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {assessment.subject}
                                  </h5>
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {new Date(assessment.date).toLocaleDateString()}
                                  </p>
                                  {assessment.notes && (
                                    <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                      {assessment.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${
                                    (assessment.score / assessment.maxScore) >= 0.8 ? 'text-green-500' :
                                    (assessment.score / assessment.maxScore) >= 0.6 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {Math.round((assessment.score / assessment.maxScore) * 100)}%
                                  </div>
                                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {assessment.score}/{assessment.maxScore}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'sessions' && (
                  <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.studentProgress.sessionNotesHistory', 'Session Notes History')}
                        </CardTitle>
                        <button
                          onClick={() => setShowAddSession(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Session
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showAddSession && (
                        <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.studentProgress.addSessionNote', 'Add Session Note')}</h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.date2', 'Date')}</label>
                              <input
                                type="date"
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.durationMinutes', 'Duration (minutes)')}</label>
                              <input
                                type="number"
                                value={sessionDuration}
                                onChange={(e) => setSessionDuration(e.target.value)}
                                placeholder="60"
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.topicsCovered', 'Topics Covered')}</label>
                              <input
                                type="text"
                                value={sessionTopics}
                                onChange={(e) => setSessionTopics(e.target.value)}
                                placeholder={t('tools.studentProgress.eGFractionsDecimals', 'e.g., Fractions, Decimals')}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.sessionNotes', 'Session Notes')}</label>
                              <textarea
                                value={sessionNotes}
                                onChange={(e) => setSessionNotes(e.target.value)}
                                placeholder={t('tools.studentProgress.whatWasCoveredStudentProgress', 'What was covered, student progress, challenges...')}
                                rows={3}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm resize-none`}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.homeworkAssigned', 'Homework Assigned')}</label>
                              <input
                                type="text"
                                value={sessionHomework}
                                onChange={(e) => setSessionHomework(e.target.value)}
                                placeholder={t('tools.studentProgress.homeworkAssignedDuringThisSession', 'Homework assigned during this session')}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={handleAddSession}
                              className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium"
                            >
                              {t('tools.studentProgress.addSession', 'Add Session')}
                            </button>
                            <button
                              onClick={() => setShowAddSession(false)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                theme === 'dark'
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {t('tools.studentProgress.cancel6', 'Cancel')}
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedStudent.sessionNotes.length === 0 ? (
                        <p className={`text-sm text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {t('tools.studentProgress.noSessionNotesYetAdd', 'No session notes yet. Add a session to track tutoring history.')}
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {[...selectedStudent.sessionNotes].reverse().map(note => (
                            <div
                              key={note.id}
                              className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {new Date(note.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                  {note.duration} min
                                </span>
                              </div>
                              <div className={`text-sm mb-2 ${theme === 'dark' ? t('tools.studentProgress.text0d9488', 'text-[#0D9488]') : t('tools.studentProgress.text0d94882', 'text-[#0D9488]')}`}>
                                Topics: {note.topics}
                              </div>
                              {note.notes && (
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {note.notes}
                                </p>
                              )}
                              {note.homeworkAssigned && (
                                <div className={`mt-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('tools.studentProgress.homework', 'Homework:')}
                                  </span>
                                  <span className={`text-sm ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {note.homeworkAssigned}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'homework' && (
                  <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.studentProgress.homeworkTracking', 'Homework Tracking')}
                        </CardTitle>
                        <button
                          onClick={() => setShowAddHomework(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Homework
                        </button>
                      </div>

                      {/* Homework completion bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.studentProgress.completionRate', 'Completion Rate')}</span>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{calculateHomeworkCompletion(selectedStudent)}%</span>
                        </div>
                        <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-2 rounded-full bg-[#0D9488] transition-all"
                            style={{ width: `${calculateHomeworkCompletion(selectedStudent)}%` }}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showAddHomework && (
                        <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.studentProgress.addHomework', 'Add Homework')}</h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.assignedDate', 'Assigned Date')}</label>
                              <input
                                type="date"
                                value={hwAssignedDate}
                                onChange={(e) => setHwAssignedDate(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.dueDate', 'Due Date')}</label>
                              <input
                                type="date"
                                value={hwDueDate}
                                onChange={(e) => setHwDueDate(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.subject2', 'Subject')}</label>
                              <input
                                type="text"
                                value={hwSubject}
                                onChange={(e) => setHwSubject(e.target.value)}
                                placeholder={t('tools.studentProgress.eGMathematics', 'e.g., Mathematics')}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.description', 'Description')}</label>
                              <input
                                type="text"
                                value={hwDescription}
                                onChange={(e) => setHwDescription(e.target.value)}
                                placeholder={t('tools.studentProgress.eGCompleteExercises1', 'e.g., Complete exercises 1-10')}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={handleAddHomework}
                              className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium"
                            >
                              {t('tools.studentProgress.addHomework2', 'Add Homework')}
                            </button>
                            <button
                              onClick={() => setShowAddHomework(false)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                theme === 'dark'
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {t('tools.studentProgress.cancel7', 'Cancel')}
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedStudent.homework.length === 0 ? (
                        <p className={`text-sm text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {t('tools.studentProgress.noHomeworkAssignmentsYetAdd', 'No homework assignments yet. Add homework to track completion.')}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {[...selectedStudent.homework].reverse().map(hw => (
                            <div
                              key={hw.id}
                              className={`flex items-start gap-3 p-4 rounded-lg ${
                                hw.completed
                                  ? theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                                  : new Date(hw.dueDate) < new Date() && !hw.completed
                                  ? theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                                  : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                              }`}
                            >
                              <button
                                onClick={() => toggleHomeworkComplete(selectedStudent.id, hw.id)}
                                className="mt-0.5"
                              >
                                {hw.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Circle className={`w-5 h-5 ${
                                    new Date(hw.dueDate) < new Date()
                                      ? 'text-red-500'
                                      : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                  }`} />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className={`font-medium ${hw.completed ? 'line-through' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {hw.description}
                                    </p>
                                    {hw.subject && (
                                      <span className={`text-xs ${theme === 'dark' ? t('tools.studentProgress.text0d94883', 'text-[#0D9488]') : t('tools.studentProgress.text0d94884', 'text-[#0D9488]')}`}>
                                        {hw.subject}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                                    </p>
                                    {hw.completed && hw.completedDate && (
                                      <p className="text-xs text-green-500">
                                        Completed: {new Date(hw.completedDate).toLocaleDateString()}
                                      </p>
                                    )}
                                    {!hw.completed && new Date(hw.dueDate) < new Date() && (
                                      <p className="text-xs text-red-500">{t('tools.studentProgress.overdue', 'Overdue')}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'communications' && (
                  <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.studentProgress.parentCommunicationLog', 'Parent Communication Log')}
                        </CardTitle>
                        <button
                          onClick={() => setShowAddCommunication(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Communication
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showAddCommunication && (
                        <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.studentProgress.logCommunication', 'Log Communication')}</h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.date3', 'Date')}</label>
                              <input
                                type="date"
                                value={commDate}
                                onChange={(e) => setCommDate(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.type', 'Type')}</label>
                              <select
                                value={commType}
                                onChange={(e) => setCommType(e.target.value as typeof commType)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              >
                                <option value="email">{t('tools.studentProgress.email', 'Email')}</option>
                                <option value="phone">{t('tools.studentProgress.phoneCall', 'Phone Call')}</option>
                                <option value="in_person">{t('tools.studentProgress.inPerson', 'In Person')}</option>
                                <option value="text">{t('tools.studentProgress.textMessage', 'Text Message')}</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.summary', 'Summary')}</label>
                              <textarea
                                value={commSummary}
                                onChange={(e) => setCommSummary(e.target.value)}
                                placeholder={t('tools.studentProgress.whatWasDiscussed', 'What was discussed...')}
                                rows={3}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm resize-none`}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.studentProgress.followUpActionsOptional', 'Follow-up Actions (optional)')}</label>
                              <input
                                type="text"
                                value={commFollowUp}
                                onChange={(e) => setCommFollowUp(e.target.value)}
                                placeholder={t('tools.studentProgress.anyFollowUpNeeded', 'Any follow-up needed...')}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm`}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={handleAddCommunication}
                              className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-sm font-medium"
                            >
                              {t('tools.studentProgress.logCommunication2', 'Log Communication')}
                            </button>
                            <button
                              onClick={() => setShowAddCommunication(false)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                theme === 'dark'
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {t('tools.studentProgress.cancel8', 'Cancel')}
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedStudent.parentCommunications.length === 0 ? (
                        <p className={`text-sm text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {t('tools.studentProgress.noCommunicationsLoggedYetLog', 'No communications logged yet. Log parent communications to keep track.')}
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {[...selectedStudent.parentCommunications].reverse().map(comm => (
                            <div
                              key={comm.id}
                              className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {comm.type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                                  {comm.type === 'phone' && <Phone className="w-4 h-4 text-green-500" />}
                                  {comm.type === 'in_person' && <User className="w-4 h-4 text-purple-500" />}
                                  {comm.type === 'text' && <MessageSquare className="w-4 h-4 text-orange-500" />}
                                  <span className={`text-sm font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {comm.type.replace('_', ' ')}
                                  </span>
                                </div>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(comm.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {comm.summary}
                              </p>
                              {comm.followUp && (
                                <div className={`mt-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('tools.studentProgress.followUp', 'Follow-up:')}
                                  </span>
                                  <span className={`text-sm ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {comm.followUp}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'reports' && (
                  <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <CardHeader>
                      <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.studentProgress.progressReport', 'Progress Report')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}>
                        <pre className={`text-sm whitespace-pre-wrap font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {generateProgressReport(selectedStudent)}
                        </pre>
                      </div>
                      <button
                        onClick={() => downloadReport(selectedStudent)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        {t('tools.studentProgress.downloadReportAsTextFile', 'Download Report as Text File')}
                      </button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-12 text-center">
                  <GraduationCap className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.studentProgress.noStudentSelected', 'No Student Selected')}
                  </h3>
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.studentProgress.selectAStudentFromThe', 'Select a student from the list or add a new student to get started.')}
                  </p>
                  <button
                    onClick={() => setIsAddingStudent(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    {t('tools.studentProgress.addYourFirstStudent', 'Add Your First Student')}
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default StudentProgressTool;
