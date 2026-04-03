'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  Sparkles,
  Copy,
  Play,
  Pause,
  RotateCcw,
  ListChecks,
  BookMarked,
  ClipboardList,
  GraduationCap,
  Lightbulb,
  PenTool,
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
interface LessonPlannerToolProps {
  uiConfig?: UIConfig;
}

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  duration: number; // in minutes
  date: string;
  startTime: string;
  objectives: string[];
  standards: string[];
  materials: string[];
  activities: Activity[];
  assessment: string;
  differentiation: string;
  homework: string;
  notes: string;
  status: 'draft' | 'ready' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  name: string;
  duration: number;
  type: 'warmup' | 'instruction' | 'practice' | 'assessment' | 'closure';
  description: string;
  resources: string[];
}

interface LessonTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  duration: number;
  activities: Activity[];
  createdAt: string;
}

interface ScheduleItem {
  id: string;
  lessonPlanId: string;
  date: string;
  startTime: string;
  endTime: string;
  classroom: string;
  notes?: string;
}

type ActiveTab = 'plans' | 'templates' | 'schedule' | 'calendar';

// Column configurations for exports
const LESSON_PLAN_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'subject', header: 'Subject', type: 'string' },
  { key: 'gradeLevel', header: 'Grade Level', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'objectives', header: 'Objectives', type: 'string' },
  { key: 'assessment', header: 'Assessment', type: 'string' },
];

// ============ HELPER FUNCTIONS ============
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const SUBJECTS = [
  'Mathematics', 'English Language Arts', 'Science', 'Social Studies', 'History',
  'Art', 'Music', 'Physical Education', 'Foreign Language', 'Computer Science',
  'Health', 'Drama', 'Economics', 'Geography', 'Psychology'
];

const GRADE_LEVELS = ['Pre-K', 'Kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const ACTIVITY_TYPES = [
  { value: 'warmup', label: 'Warm-up', color: 'yellow', icon: '🌅' },
  { value: 'instruction', label: 'Direct Instruction', color: 'blue', icon: '📚' },
  { value: 'practice', label: 'Guided Practice', color: 'green', icon: '✏️' },
  { value: 'assessment', label: 'Assessment', color: 'purple', icon: '📝' },
  { value: 'closure', label: 'Closure', color: 'orange', icon: '🎯' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'bg-gray-900/30', darkText: 'text-gray-400' },
  ready: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/30', darkText: 'text-blue-400' },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', darkBg: 'bg-yellow-900/30', darkText: 'text-yellow-400' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/30', darkText: 'text-green-400' },
};

// ============ SAMPLE DATA GENERATOR ============
const generateSampleData = () => {
  const now = new Date().toISOString();

  const lessonPlans: LessonPlan[] = [
    {
      id: 'lesson-1',
      title: 'Introduction to Fractions',
      subject: 'Mathematics',
      gradeLevel: '4th',
      duration: 45,
      date: getCurrentDate(),
      startTime: '09:00',
      objectives: ['Understand what fractions represent', 'Identify numerator and denominator', 'Compare simple fractions'],
      standards: ['CCSS.MATH.CONTENT.4.NF.A.1'],
      materials: ['Fraction circles', 'Whiteboard', 'Worksheets'],
      activities: [
        { id: 'act-1', name: 'Warm-up: Pizza Sharing', duration: 5, type: 'warmup', description: 'Discuss how to share a pizza equally', resources: [] },
        { id: 'act-2', name: 'Fraction Basics', duration: 15, type: 'instruction', description: 'Introduce numerator and denominator', resources: ['Fraction circles'] },
        { id: 'act-3', name: 'Hands-on Practice', duration: 15, type: 'practice', description: 'Students work with fraction manipulatives', resources: ['Fraction circles', 'Worksheets'] },
        { id: 'act-4', name: 'Exit Ticket', duration: 5, type: 'assessment', description: 'Quick check on understanding', resources: [] },
        { id: 'act-5', name: 'Summary', duration: 5, type: 'closure', description: 'Review key concepts', resources: [] },
      ],
      assessment: 'Exit ticket with 3 fraction identification problems',
      differentiation: 'Provide visual aids for struggling learners; challenge problems for advanced students',
      homework: 'Worksheet: Identifying fractions in everyday objects',
      notes: 'Prepare extra manipulatives for group work',
      status: 'ready',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lesson-2',
      title: 'The Water Cycle',
      subject: 'Science',
      gradeLevel: '5th',
      duration: 60,
      date: getCurrentDate(),
      startTime: '10:30',
      objectives: ['Describe the stages of the water cycle', 'Explain evaporation and condensation', 'Create a water cycle diagram'],
      standards: ['NGSS 5-ESS2-1'],
      materials: ['Water cycle poster', 'Lab materials', 'Diagram templates'],
      activities: [
        { id: 'act-6', name: 'Water Question', duration: 5, type: 'warmup', description: 'Where does rain come from?', resources: [] },
        { id: 'act-7', name: 'Water Cycle Explanation', duration: 20, type: 'instruction', description: 'Present the water cycle stages', resources: ['Water cycle poster'] },
        { id: 'act-8', name: 'Mini Lab', duration: 20, type: 'practice', description: 'Evaporation demonstration', resources: ['Lab materials'] },
        { id: 'act-9', name: 'Diagram Creation', duration: 10, type: 'assessment', description: 'Create labeled diagram', resources: ['Diagram templates'] },
        { id: 'act-10', name: 'Wrap-up', duration: 5, type: 'closure', description: 'Share diagrams', resources: [] },
      ],
      assessment: 'Labeled water cycle diagram',
      differentiation: 'Pre-labeled diagrams for support; detailed labels for advanced',
      homework: 'Observe and journal water cycle evidence at home',
      notes: 'Set up lab materials before class',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const templates: LessonTemplate[] = [
    {
      id: 'template-1',
      name: '5E Science Lesson',
      subject: 'Science',
      description: 'Engage, Explore, Explain, Elaborate, Evaluate',
      duration: 60,
      activities: [
        { id: 'tact-1', name: 'Engage', duration: 10, type: 'warmup', description: 'Hook activity to capture interest', resources: [] },
        { id: 'tact-2', name: 'Explore', duration: 15, type: 'practice', description: 'Hands-on exploration', resources: [] },
        { id: 'tact-3', name: 'Explain', duration: 15, type: 'instruction', description: 'Direct instruction of concepts', resources: [] },
        { id: 'tact-4', name: 'Elaborate', duration: 15, type: 'practice', description: 'Extended application', resources: [] },
        { id: 'tact-5', name: 'Evaluate', duration: 5, type: 'assessment', description: 'Assessment of learning', resources: [] },
      ],
      createdAt: now,
    },
    {
      id: 'template-2',
      name: 'Math Workshop',
      subject: 'Mathematics',
      description: 'Mini-lesson, Practice, Share',
      duration: 45,
      activities: [
        { id: 'tact-6', name: 'Number Talk', duration: 5, type: 'warmup', description: 'Mental math warm-up', resources: [] },
        { id: 'tact-7', name: 'Mini-lesson', duration: 10, type: 'instruction', description: 'Focused instruction', resources: [] },
        { id: 'tact-8', name: 'Work Time', duration: 20, type: 'practice', description: 'Independent or group practice', resources: [] },
        { id: 'tact-9', name: 'Share & Reflect', duration: 10, type: 'closure', description: 'Students share strategies', resources: [] },
      ],
      createdAt: now,
    },
  ];

  const scheduleItems: ScheduleItem[] = [
    { id: 'sched-1', lessonPlanId: 'lesson-1', date: getCurrentDate(), startTime: '09:00', endTime: '09:45', classroom: 'Room 201' },
    { id: 'sched-2', lessonPlanId: 'lesson-2', date: getCurrentDate(), startTime: '10:30', endTime: '11:30', classroom: 'Science Lab' },
  ];

  return { lessonPlans, templates, scheduleItems };
};

// ============ MAIN COMPONENT ============
export const LessonPlannerTool: React.FC<LessonPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize sample data
  const defaultData = generateSampleData();

  // Use useToolData hooks for backend sync
  const {
    data: lessonPlans,
    addItem: addLessonPlan,
    updateItem: updateLessonPlan,
    deleteItem: deleteLessonPlan,
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
  } = useToolData<LessonPlan>('lesson-planner-plans', defaultData.lessonPlans, LESSON_PLAN_COLUMNS);

  const {
    data: templates,
    addItem: addTemplate,
    deleteItem: deleteTemplate,
  } = useToolData<LessonTemplate>('lesson-planner-templates', defaultData.templates, []);

  const {
    data: scheduleItems,
    addItem: addScheduleItem,
    deleteItem: deleteScheduleItem,
  } = useToolData<ScheduleItem>('lesson-planner-schedule', defaultData.scheduleItems, []);

  // State
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('plans');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterGradeLevel, setFilterGradeLevel] = useState<string>('');

  // Form states
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);

  // Lesson plan form
  const [planForm, setPlanForm] = useState({
    title: '',
    subject: '',
    gradeLevel: '',
    duration: 45,
    date: getCurrentDate(),
    startTime: '09:00',
    objectives: [''],
    standards: [''],
    materials: [''],
    activities: [] as Activity[],
    assessment: '',
    differentiation: '',
    homework: '',
    notes: '',
    status: 'draft' as LessonPlan['status'],
  });

  // Activity form
  const [activityForm, setActivityForm] = useState({
    name: '',
    duration: 10,
    type: 'instruction' as Activity['type'],
    description: '',
    resources: [''],
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.subject) {
        setPlanForm(prev => ({
          ...prev,
          title: params.title || '',
          subject: params.subject || '',
          gradeLevel: params.gradeLevel || '',
        }));
        setShowPlanForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig, isPrefilled]);

  // ============ COMPUTED VALUES ============
  const filteredPlans = useMemo(() => {
    return lessonPlans.filter(plan => {
      const matchesSearch = !searchTerm || plan.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !filterSubject || plan.subject === filterSubject;
      const matchesStatus = !filterStatus || plan.status === filterStatus;
      const matchesGrade = !filterGradeLevel || plan.gradeLevel === filterGradeLevel;
      return matchesSearch && matchesSubject && matchesStatus && matchesGrade;
    });
  }, [lessonPlans, searchTerm, filterSubject, filterStatus, filterGradeLevel]);

  const stats = useMemo(() => {
    return {
      totalPlans: lessonPlans.length,
      drafts: lessonPlans.filter(p => p.status === 'draft').length,
      ready: lessonPlans.filter(p => p.status === 'ready').length,
      completed: lessonPlans.filter(p => p.status === 'completed').length,
      totalDuration: lessonPlans.reduce((sum, p) => sum + p.duration, 0),
      templates: templates.length,
    };
  }, [lessonPlans, templates]);

  const todaysLessons = useMemo(() => {
    const today = getCurrentDate();
    return scheduleItems.filter(item => item.date === today).map(item => {
      const plan = lessonPlans.find(p => p.id === item.lessonPlanId);
      return { ...item, plan };
    });
  }, [scheduleItems, lessonPlans]);

  // ============ HANDLERS ============
  const handleSavePlan = () => {
    if (!planForm.title || !planForm.subject) return;

    const now = new Date().toISOString();
    const filteredObjectives = planForm.objectives.filter(o => o.trim());
    const filteredStandards = planForm.standards.filter(s => s.trim());
    const filteredMaterials = planForm.materials.filter(m => m.trim());

    if (editingPlan) {
      updateLessonPlan(editingPlan.id, {
        ...planForm,
        objectives: filteredObjectives,
        standards: filteredStandards,
        materials: filteredMaterials,
        updatedAt: now,
      });
    } else {
      const newPlan: LessonPlan = {
        ...planForm,
        id: generateId(),
        objectives: filteredObjectives,
        standards: filteredStandards,
        materials: filteredMaterials,
        createdAt: now,
        updatedAt: now,
      };
      addLessonPlan(newPlan);
    }
    resetPlanForm();
  };

  const resetPlanForm = () => {
    setPlanForm({
      title: '',
      subject: '',
      gradeLevel: '',
      duration: 45,
      date: getCurrentDate(),
      startTime: '09:00',
      objectives: [''],
      standards: [''],
      materials: [''],
      activities: [],
      assessment: '',
      differentiation: '',
      homework: '',
      notes: '',
      status: 'draft',
    });
    setEditingPlan(null);
    setShowPlanForm(false);
  };

  const handleEditPlan = (plan: LessonPlan) => {
    setPlanForm({
      title: plan.title,
      subject: plan.subject,
      gradeLevel: plan.gradeLevel,
      duration: plan.duration,
      date: plan.date,
      startTime: plan.startTime,
      objectives: plan.objectives.length > 0 ? plan.objectives : [''],
      standards: plan.standards.length > 0 ? plan.standards : [''],
      materials: plan.materials.length > 0 ? plan.materials : [''],
      activities: plan.activities,
      assessment: plan.assessment,
      differentiation: plan.differentiation,
      homework: plan.homework,
      notes: plan.notes,
      status: plan.status,
    });
    setEditingPlan(plan);
    setShowPlanForm(true);
  };

  const handleAddActivity = () => {
    if (!activityForm.name) return;

    const newActivity: Activity = {
      id: generateId(),
      name: activityForm.name,
      duration: activityForm.duration,
      type: activityForm.type,
      description: activityForm.description,
      resources: activityForm.resources.filter(r => r.trim()),
    };

    if (editingActivityIndex !== null) {
      const updatedActivities = [...planForm.activities];
      updatedActivities[editingActivityIndex] = newActivity;
      setPlanForm({ ...planForm, activities: updatedActivities });
    } else {
      setPlanForm({ ...planForm, activities: [...planForm.activities, newActivity] });
    }

    resetActivityForm();
  };

  const resetActivityForm = () => {
    setActivityForm({
      name: '',
      duration: 10,
      type: 'instruction',
      description: '',
      resources: [''],
    });
    setEditingActivityIndex(null);
    setShowActivityForm(false);
  };

  const handleEditActivity = (index: number) => {
    const activity = planForm.activities[index];
    setActivityForm({
      name: activity.name,
      duration: activity.duration,
      type: activity.type,
      description: activity.description,
      resources: activity.resources.length > 0 ? activity.resources : [''],
    });
    setEditingActivityIndex(index);
    setShowActivityForm(true);
  };

  const handleRemoveActivity = (index: number) => {
    const updatedActivities = planForm.activities.filter((_, i) => i !== index);
    setPlanForm({ ...planForm, activities: updatedActivities });
  };

  const handleDuplicatePlan = (plan: LessonPlan) => {
    const now = new Date().toISOString();
    const newPlan: LessonPlan = {
      ...plan,
      id: generateId(),
      title: `${plan.title} (Copy)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    addLessonPlan(newPlan);
  };

  const handleCreateFromTemplate = (template: LessonTemplate) => {
    setPlanForm({
      title: '',
      subject: template.subject,
      gradeLevel: '',
      duration: template.duration,
      date: getCurrentDate(),
      startTime: '09:00',
      objectives: [''],
      standards: [''],
      materials: [''],
      activities: template.activities.map(a => ({ ...a, id: generateId() })),
      assessment: '',
      differentiation: '',
      homework: '',
      notes: '',
      status: 'draft',
    });
    setShowPlanForm(true);
    setActiveTab('plans');
  };

  const updateArrayField = (field: 'objectives' | 'standards' | 'materials', index: number, value: string) => {
    const updated = [...planForm[field]];
    updated[index] = value;
    setPlanForm({ ...planForm, [field]: updated });
  };

  const addArrayField = (field: 'objectives' | 'standards' | 'materials') => {
    setPlanForm({ ...planForm, [field]: [...planForm[field], ''] });
  };

  const removeArrayField = (field: 'objectives' | 'standards' | 'materials', index: number) => {
    const updated = planForm[field].filter((_, i) => i !== index);
    setPlanForm({ ...planForm, [field]: updated.length > 0 ? updated : [''] });
  };

  const getLessonPlanById = (id: string) => lessonPlans.find(p => p.id === id);
  const getActivityTypeInfo = (type: string) => ACTIVITY_TYPES.find(t => t.value === type);

  // Calculate total activity duration
  const totalActivityDuration = planForm.activities.reduce((sum, a) => sum + a.duration, 0);

  // ============ RENDER ============
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.lessonPlanner.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.lessonPlanner.lessonPlanner', 'Lesson Planner')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.lessonPlanner.createOrganizeAndScheduleYour', 'Create, organize, and schedule your lesson plans')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="lesson-planner" toolName="Lesson Planner" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = filteredPlans.map(p => ({
                    ...p,
                    objectives: p.objectives.join('; '),
                  }));
                  exportCSV(exportData);
                }}
                onExportExcel={() => {
                  const exportData = filteredPlans.map(p => ({
                    ...p,
                    objectives: p.objectives.join('; '),
                  }));
                  exportExcel(exportData);
                }}
                onExportJSON={() => exportJSON(filteredPlans)}
                onExportPDF={() => {
                  const exportData = filteredPlans.map(p => ({
                    ...p,
                    objectives: p.objectives.join('; '),
                  }));
                  exportPDF(exportData, 'Lesson Plans Report');
                }}
                onCopyToClipboard={() => copyToClipboard(filteredPlans)}
                onPrint={() => print(filteredPlans, 'Lesson Plans Report')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lessonPlanner.totalPlans', 'Total Plans')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalPlans}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lessonPlanner.ready', 'Ready')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.ready}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <PenTool className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lessonPlanner.drafts', 'Drafts')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.drafts}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <FileText className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lessonPlanner.templates', 'Templates')}</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.templates}</p>
            </div>
          </div>

          {/* Today's Schedule Quick View */}
          {todaysLessons.length > 0 && (
            <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lessonPlanner.todaySLessons', 'Today\'s Lessons')}</h3>
              <div className="flex flex-wrap gap-2">
                {todaysLessons.map(item => (
                  <div key={item.id} className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-white'} flex items-center gap-2`}>
                    <Clock className="w-3 h-3 text-[#0D9488]" />
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(item.startTime)} - {item.plan?.title || 'Unknown'}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.classroom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'plans', label: 'Lesson Plans', icon: BookOpen },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
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
            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        placeholder={t('tools.lessonPlanner.searchLessonPlans', 'Search lesson plans...')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  <select
                    value={filterSubject}
                    onChange={e => setFilterSubject(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.lessonPlanner.allSubjects', 'All Subjects')}</option>
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">{t('tools.lessonPlanner.allStatuses', 'All Statuses')}</option>
                    <option value="draft">{t('tools.lessonPlanner.draft', 'Draft')}</option>
                    <option value="ready">{t('tools.lessonPlanner.ready2', 'Ready')}</option>
                    <option value="in_progress">{t('tools.lessonPlanner.inProgress', 'In Progress')}</option>
                    <option value="completed">{t('tools.lessonPlanner.completed', 'Completed')}</option>
                  </select>
                  <button
                    onClick={() => setShowPlanForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.lessonPlanner.newLessonPlan', 'New Lesson Plan')}
                  </button>
                </div>

                {/* Plans List */}
                <div className="space-y-4">
                  {filteredPlans.map(plan => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <div
                        className={`flex items-center justify-between p-4 cursor-pointer ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}
                        onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <BookOpen className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.title}</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {plan.subject} | {plan.gradeLevel} | {plan.duration} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(plan.date)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isDark
                              ? STATUS_COLORS[plan.status]?.darkBg + ' ' + STATUS_COLORS[plan.status]?.darkText
                              : STATUS_COLORS[plan.status]?.bg + ' ' + STATUS_COLORS[plan.status]?.text
                          }`}>
                            {plan.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); handleDuplicatePlan(plan); }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                              title={t('tools.lessonPlanner.duplicate', 'Duplicate')}
                            >
                              <Copy className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); handleEditPlan(plan); }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            >
                              <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); deleteLessonPlan(plan.id); }}
                              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          {expandedPlanId === plan.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {/* Expanded View */}
                      {expandedPlanId === plan.id && (
                        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                              <div>
                                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  <Target className="w-4 h-4 inline mr-2" />
                                  {t('tools.lessonPlanner.learningObjectives', 'Learning Objectives')}
                                </h4>
                                <ul className={`list-disc list-inside space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {plan.objectives.map((obj, i) => (
                                    <li key={i}>{obj}</li>
                                  ))}
                                </ul>
                              </div>
                              {plan.standards.length > 0 && plan.standards[0] && (
                                <div>
                                  <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lessonPlanner.standards', 'Standards')}</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {plan.standards.map((std, i) => (
                                      <span key={i} className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                        {std}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {plan.materials.length > 0 && plan.materials[0] && (
                                <div>
                                  <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lessonPlanner.materials', 'Materials')}</h4>
                                  <ul className={`list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {plan.materials.map((mat, i) => (
                                      <li key={i}>{mat}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Right Column - Activities */}
                            <div>
                              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <ListChecks className="w-4 h-4 inline mr-2" />
                                {t('tools.lessonPlanner.activities', 'Activities')}
                              </h4>
                              <div className="space-y-2">
                                {plan.activities.map((activity, i) => {
                                  const typeInfo = getActivityTypeInfo(activity.type);
                                  return (
                                    <div key={activity.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span>{typeInfo?.icon}</span>
                                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.name}</span>
                                        </div>
                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.duration} min</span>
                                      </div>
                                      {activity.description && (
                                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{activity.description}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Assessment & Other Info */}
                          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} grid md:grid-cols-2 gap-4`}>
                            {plan.assessment && (
                              <div>
                                <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lessonPlanner.assessment', 'Assessment')}</h4>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{plan.assessment}</p>
                              </div>
                            )}
                            {plan.homework && (
                              <div>
                                <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lessonPlanner.homework', 'Homework')}</h4>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{plan.homework}</p>
                              </div>
                            )}
                            {plan.differentiation && (
                              <div>
                                <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lessonPlanner.differentiation', 'Differentiation')}</h4>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{plan.differentiation}</p>
                              </div>
                            )}
                            {plan.notes && (
                              <div>
                                <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lessonPlanner.notes', 'Notes')}</h4>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{plan.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredPlans.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.lessonPlanner.noLessonPlansFound', 'No lesson plans found')}</p>
                      <button
                        onClick={() => setShowPlanForm(true)}
                        className="mt-4 text-[#0D9488] hover:underline"
                      >
                        {t('tools.lessonPlanner.createYourFirstLessonPlan', 'Create your first lesson plan')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lessonPlanner.lessonTemplates', 'Lesson Templates')}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <div key={template.id} className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{template.name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {template.duration} min
                        </span>
                      </div>
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{template.description}</p>
                      <div className="space-y-1 mb-4">
                        {template.activities.map((activity, i) => {
                          const typeInfo = getActivityTypeInfo(activity.type);
                          return (
                            <div key={activity.id} className="flex items-center gap-2 text-sm">
                              <span>{typeInfo?.icon}</span>
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{activity.name}</span>
                              <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({activity.duration} min)</span>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handleCreateFromTemplate(template)}
                        className="w-full py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B] transition-colors"
                      >
                        {t('tools.lessonPlanner.useTemplate', 'Use Template')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lessonPlanner.scheduledLessons', 'Scheduled Lessons')}</h2>
                </div>
                <div className="space-y-4">
                  {scheduleItems.map(item => {
                    const plan = getLessonPlanById(item.lessonPlanId);
                    return (
                      <div key={item.id} className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {plan?.title || 'Unknown Lesson'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(item.date)} | {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {item.classroom}
                          </span>
                          <button
                            onClick={() => deleteScheduleItem(item.id)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {scheduleItems.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.lessonPlanner.noScheduledLessons', 'No scheduled lessons')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Plan Form Modal */}
        {showPlanForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 my-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingPlan ? t('tools.lessonPlanner.editLessonPlan', 'Edit Lesson Plan') : t('tools.lessonPlanner.newLessonPlan2', 'New Lesson Plan')}
                </h2>
                <button onClick={resetPlanForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.title', 'Title *')}</label>
                    <input
                      type="text"
                      value={planForm.title}
                      onChange={e => setPlanForm({ ...planForm, title: e.target.value })}
                      placeholder={t('tools.lessonPlanner.eGIntroductionToFractions', 'e.g., Introduction to Fractions')}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.subject', 'Subject *')}</label>
                    <select
                      value={planForm.subject}
                      onChange={e => setPlanForm({ ...planForm, subject: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">{t('tools.lessonPlanner.selectSubject', 'Select Subject')}</option>
                      {SUBJECTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.gradeLevel', 'Grade Level')}</label>
                    <select
                      value={planForm.gradeLevel}
                      onChange={e => setPlanForm({ ...planForm, gradeLevel: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">{t('tools.lessonPlanner.selectGrade', 'Select Grade')}</option>
                      {GRADE_LEVELS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.durationMinutes', 'Duration (minutes)')}</label>
                    <input
                      type="number"
                      value={planForm.duration}
                      onChange={e => setPlanForm({ ...planForm, duration: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.date', 'Date')}</label>
                    <input
                      type="date"
                      value={planForm.date}
                      onChange={e => setPlanForm({ ...planForm, date: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.startTime', 'Start Time')}</label>
                    <input
                      type="time"
                      value={planForm.startTime}
                      onChange={e => setPlanForm({ ...planForm, startTime: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>

                {/* Objectives */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Target className="w-4 h-4 inline mr-1" />
                    {t('tools.lessonPlanner.learningObjectives2', 'Learning Objectives')}
                  </label>
                  {planForm.objectives.map((obj, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={obj}
                        onChange={e => updateArrayField('objectives', i, e.target.value)}
                        placeholder={t('tools.lessonPlanner.studentsWillBeAbleTo', 'Students will be able to...')}
                        className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <button
                        onClick={() => removeArrayField('objectives', i)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayField('objectives')}
                    className="text-[#0D9488] text-sm hover:underline"
                  >
                    {t('tools.lessonPlanner.addObjective', '+ Add Objective')}
                  </button>
                </div>

                {/* Materials */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.materials2', 'Materials')}</label>
                  {planForm.materials.map((mat, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={mat}
                        onChange={e => updateArrayField('materials', i, e.target.value)}
                        placeholder={t('tools.lessonPlanner.eGWhiteboardWorksheets', 'e.g., Whiteboard, Worksheets...')}
                        className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <button
                        onClick={() => removeArrayField('materials', i)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayField('materials')}
                    className="text-[#0D9488] text-sm hover:underline"
                  >
                    {t('tools.lessonPlanner.addMaterial', '+ Add Material')}
                  </button>
                </div>

                {/* Activities */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <ListChecks className="w-4 h-4 inline mr-1" />
                      {t('tools.lessonPlanner.activities2', 'Activities')}
                    </label>
                    <span className={`text-sm ${totalActivityDuration > planForm.duration ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {totalActivityDuration}/{planForm.duration} min
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {planForm.activities.map((activity, i) => {
                      const typeInfo = getActivityTypeInfo(activity.type);
                      return (
                        <div key={activity.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-between`}>
                          <div className="flex items-center gap-3">
                            <span>{typeInfo?.icon}</span>
                            <div>
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.name}</span>
                              <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({activity.duration} min)</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditActivity(i)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRemoveActivity(i)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowActivityForm(true)}
                    className="text-[#0D9488] text-sm hover:underline"
                  >
                    {t('tools.lessonPlanner.addActivity', '+ Add Activity')}
                  </button>
                </div>

                {/* Assessment, Differentiation, Homework */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.assessment2', 'Assessment')}</label>
                    <textarea
                      value={planForm.assessment}
                      onChange={e => setPlanForm({ ...planForm, assessment: e.target.value })}
                      rows={2}
                      placeholder={t('tools.lessonPlanner.howWillYouAssessStudent', 'How will you assess student learning?')}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.homework2', 'Homework')}</label>
                    <textarea
                      value={planForm.homework}
                      onChange={e => setPlanForm({ ...planForm, homework: e.target.value })}
                      rows={2}
                      placeholder={t('tools.lessonPlanner.assignmentForStudents', 'Assignment for students')}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.differentiation2', 'Differentiation')}</label>
                  <textarea
                    value={planForm.differentiation}
                    onChange={e => setPlanForm({ ...planForm, differentiation: e.target.value })}
                    rows={2}
                    placeholder={t('tools.lessonPlanner.howWillYouAccommodateDifferent', 'How will you accommodate different learners?')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.notes2', 'Notes')}</label>
                  <textarea
                    value={planForm.notes}
                    onChange={e => setPlanForm({ ...planForm, notes: e.target.value })}
                    rows={2}
                    placeholder={t('tools.lessonPlanner.additionalNotes', 'Additional notes...')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.status', 'Status')}</label>
                  <select
                    value={planForm.status}
                    onChange={e => setPlanForm({ ...planForm, status: e.target.value as LessonPlan['status'] })}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="draft">{t('tools.lessonPlanner.draft2', 'Draft')}</option>
                    <option value="ready">{t('tools.lessonPlanner.ready3', 'Ready')}</option>
                    <option value="in_progress">{t('tools.lessonPlanner.inProgress2', 'In Progress')}</option>
                    <option value="completed">{t('tools.lessonPlanner.completed2', 'Completed')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetPlanForm}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.lessonPlanner.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSavePlan}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B]"
                >
                  {editingPlan ? t('tools.lessonPlanner.updateLessonPlan', 'Update Lesson Plan') : t('tools.lessonPlanner.createLessonPlan', 'Create Lesson Plan')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Form Modal */}
        {showActivityForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className={`w-full max-w-lg rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingActivityIndex !== null ? t('tools.lessonPlanner.editActivity', 'Edit Activity') : t('tools.lessonPlanner.addActivity2', 'Add Activity')}
                </h3>
                <button onClick={resetActivityForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.activityName', 'Activity Name *')}</label>
                  <input
                    type="text"
                    value={activityForm.name}
                    onChange={e => setActivityForm({ ...activityForm, name: e.target.value })}
                    placeholder={t('tools.lessonPlanner.eGWarmUpDiscussion', 'e.g., Warm-up Discussion')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.type', 'Type')}</label>
                    <select
                      value={activityForm.type}
                      onChange={e => setActivityForm({ ...activityForm, type: e.target.value as Activity['type'] })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {ACTIVITY_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.durationMin', 'Duration (min)')}</label>
                    <input
                      type="number"
                      value={activityForm.duration}
                      onChange={e => setActivityForm({ ...activityForm, duration: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lessonPlanner.description', 'Description')}</label>
                  <textarea
                    value={activityForm.description}
                    onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                    rows={2}
                    placeholder={t('tools.lessonPlanner.whatWillHappenDuringThis', 'What will happen during this activity?')}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetActivityForm}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('tools.lessonPlanner.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleAddActivity}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7B]"
                >
                  {editingActivityIndex !== null ? t('tools.lessonPlanner.updateActivity', 'Update Activity') : t('tools.lessonPlanner.addActivity3', 'Add Activity')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPlannerTool;
