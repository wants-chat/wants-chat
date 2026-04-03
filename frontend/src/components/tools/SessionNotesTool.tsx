'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import {
  FileText,
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
  Circle,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Filter,
  Loader2,
  Target,
  MessageSquare,
  ClipboardCheck,
  Star,
  AlertCircle,
} from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Types
type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
type HomeworkStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue';

interface TopicCovered {
  id: string;
  name: string;
  duration: number; // minutes
  mastery: 'introduced' | 'practicing' | 'mastered';
}

interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: HomeworkStatus;
  completedDate?: string;
  grade?: number;
  feedback?: string;
}

interface SessionNote {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  status: SessionStatus;
  topicsCovered: TopicCovered[];
  sessionSummary: string;
  studentEngagement: 1 | 2 | 3 | 4 | 5;
  studentUnderstanding: 1 | 2 | 3 | 4 | 5;
  areasOfStruggle: string[];
  improvements: string[];
  homework: Homework[];
  nextSessionFocus: string;
  parentNotes: string;
  privateNotes: string;
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
  'Essay Writing',
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Column configuration for exports and useToolData hook
const COLUMNS: ColumnConfig[] = [
  { key: 'studentName', header: 'Student Name', type: 'string' },
  { key: 'tutorName', header: 'Tutor Name', type: 'string' },
  { key: 'subject', header: 'Subject', type: 'string' },
  { key: 'sessionDate', header: 'Session Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'endTime', header: 'End Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'studentEngagement', header: 'Engagement (1-5)', type: 'number' },
  { key: 'studentUnderstanding', header: 'Understanding (1-5)', type: 'number' },
  { key: 'sessionSummary', header: 'Session Summary', type: 'string' },
  { key: 'nextSessionFocus', header: 'Next Session Focus', type: 'string' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
];

interface SessionNotesToolProps {
  uiConfig?: UIConfig;
}

export const SessionNotesTool: React.FC<SessionNotesToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: sessionNotes,
    setData: setSessionNotes,
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
  } = useToolData<SessionNote>('session-notes', [], COLUMNS);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'view'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<SessionStatus | 'all'>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    topics: true,
    homework: true,
    notes: true,
  });

  // Form states
  const [formData, setFormData] = useState<Partial<SessionNote>>({
    studentName: '',
    tutorName: '',
    subject: 'Mathematics',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    status: 'completed',
    topicsCovered: [],
    sessionSummary: '',
    studentEngagement: 3,
    studentUnderstanding: 3,
    areasOfStruggle: [],
    improvements: [],
    homework: [],
    nextSessionFocus: '',
    parentNotes: '',
    privateNotes: '',
  });

  const [newTopic, setNewTopic] = useState({ name: '', duration: 15, mastery: 'introduced' as const });
  const [newHomework, setNewHomework] = useState({ title: '', description: '', dueDate: '' });
  const [newStruggle, setNewStruggle] = useState('');
  const [newImprovement, setNewImprovement] = useState('');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.studentName || params.student) {
        setFormData((prev) => ({
          ...prev,
          studentName: params.studentName || params.student || '',
          tutorName: params.tutorName || params.tutor || '',
          subject: params.subject || prev.subject,
        }));
        setActiveTab('add');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate duration when times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const [startH, startM] = formData.startTime.split(':').map(Number);
      const [endH, endM] = formData.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const duration = endMinutes - startMinutes;
      if (duration > 0) {
        setFormData((prev) => ({ ...prev, duration }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return sessionNotes.filter((note) => {
      const matchesSearch =
        note.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.sessionSummary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = filterSubject === 'all' || note.subject === filterSubject;
      const matchesStatus = filterStatus === 'all' || note.status === filterStatus;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [sessionNotes, searchQuery, filterSubject, filterStatus]);

  const selectedNote = selectedNoteId ? sessionNotes.find((n) => n.id === selectedNoteId) : null;

  // Handlers
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const addTopic = () => {
    if (newTopic.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        topicsCovered: [...(prev.topicsCovered || []), { id: generateId(), ...newTopic }],
      }));
      setNewTopic({ name: '', duration: 15, mastery: 'introduced' });
    }
  };

  const removeTopic = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      topicsCovered: (prev.topicsCovered || []).filter((t) => t.id !== id),
    }));
  };

  const addHomeworkItem = () => {
    if (newHomework.title.trim()) {
      setFormData((prev) => ({
        ...prev,
        homework: [
          ...(prev.homework || []),
          { id: generateId(), ...newHomework, status: 'assigned' as HomeworkStatus },
        ],
      }));
      setNewHomework({ title: '', description: '', dueDate: '' });
    }
  };

  const removeHomework = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      homework: (prev.homework || []).filter((h) => h.id !== id),
    }));
  };

  const addStruggle = () => {
    if (newStruggle.trim()) {
      setFormData((prev) => ({
        ...prev,
        areasOfStruggle: [...(prev.areasOfStruggle || []), newStruggle.trim()],
      }));
      setNewStruggle('');
    }
  };

  const removeStruggle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      areasOfStruggle: (prev.areasOfStruggle || []).filter((_, i) => i !== index),
    }));
  };

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setFormData((prev) => ({
        ...prev,
        improvements: [...(prev.improvements || []), newImprovement.trim()],
      }));
      setNewImprovement('');
    }
  };

  const removeImprovement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      improvements: (prev.improvements || []).filter((_, i) => i !== index),
    }));
  };

  const handleSaveNote = async () => {
    if (!formData.studentName || !formData.sessionSummary) {
      setValidationMessage('Please fill in required fields: Student Name and Session Summary');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const noteData: SessionNote = {
      id: selectedNoteId || generateId(),
      studentId: generateId(),
      studentName: formData.studentName || '',
      tutorId: generateId(),
      tutorName: formData.tutorName || '',
      subject: formData.subject || 'Mathematics',
      sessionDate: formData.sessionDate || now.split('T')[0],
      startTime: formData.startTime || '10:00',
      endTime: formData.endTime || '11:00',
      duration: formData.duration || 60,
      status: formData.status || 'completed',
      topicsCovered: formData.topicsCovered || [],
      sessionSummary: formData.sessionSummary || '',
      studentEngagement: formData.studentEngagement || 3,
      studentUnderstanding: formData.studentUnderstanding || 3,
      areasOfStruggle: formData.areasOfStruggle || [],
      improvements: formData.improvements || [],
      homework: formData.homework || [],
      nextSessionFocus: formData.nextSessionFocus || '',
      parentNotes: formData.parentNotes || '',
      privateNotes: formData.privateNotes || '',
      createdAt: selectedNoteId
        ? sessionNotes.find((n) => n.id === selectedNoteId)?.createdAt || now
        : now,
      updatedAt: now,
    };

    if (selectedNoteId) {
      await updateItem(selectedNoteId, noteData);
    } else {
      await addItem(noteData);
    }

    resetForm();
    setActiveTab('list');
  };

  const handleDeleteNote = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this session note?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    await deleteItem(id);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setActiveTab('list');
    }
  };

  const handleEditNote = (note: SessionNote) => {
    setFormData(note);
    setSelectedNoteId(note.id);
    setActiveTab('add');
  };

  const handleViewNote = (note: SessionNote) => {
    setSelectedNoteId(note.id);
    setActiveTab('view');
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      tutorName: '',
      subject: 'Mathematics',
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      status: 'completed',
      topicsCovered: [],
      sessionSummary: '',
      studentEngagement: 3,
      studentUnderstanding: 3,
      areasOfStruggle: [],
      improvements: [],
      homework: [],
      nextSessionFocus: '',
      parentNotes: '',
      privateNotes: '',
    });
    setSelectedNoteId(null);
  };

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getMasteryColor = (mastery: string) => {
    switch (mastery) {
      case 'mastered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'practicing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'introduced':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  // Stats
  const stats = useMemo(() => {
    const completed = sessionNotes.filter((n) => n.status === 'completed').length;
    const avgEngagement =
      sessionNotes.length > 0
        ? sessionNotes.reduce((sum, n) => sum + n.studentEngagement, 0) / sessionNotes.length
        : 0;
    const avgUnderstanding =
      sessionNotes.length > 0
        ? sessionNotes.reduce((sum, n) => sum + n.studentUnderstanding, 0) / sessionNotes.length
        : 0;
    const totalHours = sessionNotes.reduce((sum, n) => sum + n.duration, 0) / 60;

    return { completed, avgEngagement, avgUnderstanding, totalHours };
  }, [sessionNotes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">{t('tools.sessionNotes.loadingSessionNotes', 'Loading session notes...')}</span>
      </div>
    );
  }

  return (
    <div className={`p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">{t('tools.sessionNotes.sessionNotes', 'Session Notes')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tools.sessionNotes.documentTutoringSessionsAndTrack', 'Document tutoring sessions and track student progress')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="session-notes" toolName="Session Notes" />

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.sessionNotes.completed', 'Completed')}</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.sessionNotes.totalHours', 'Total Hours')}</p>
                <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.sessionNotes.avgEngagement', 'Avg Engagement')}</p>
                <p className="text-2xl font-bold">{stats.avgEngagement.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.sessionNotes.avgUnderstanding', 'Avg Understanding')}</p>
                <p className="text-2xl font-bold">{stats.avgUnderstanding.toFixed(1)}/5</p>
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
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('tools.sessionNotes.sessionList', 'Session List')}
        </button>
        <button
          onClick={() => {
            setActiveTab('add');
            resetForm();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'add'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('tools.sessionNotes.newNote', 'New Note')}
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
                placeholder={t('tools.sessionNotes.searchNotes', 'Search notes...')}
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
              <option value="all">{t('tools.sessionNotes.allSubjects', 'All Subjects')}</option>
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SessionStatus | 'all')}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="all">{t('tools.sessionNotes.allStatus', 'All Status')}</option>
              <option value="completed">{t('tools.sessionNotes.completed2', 'Completed')}</option>
              <option value="scheduled">{t('tools.sessionNotes.scheduled', 'Scheduled')}</option>
              <option value="cancelled">{t('tools.sessionNotes.cancelled', 'Cancelled')}</option>
              <option value="no_show">{t('tools.sessionNotes.noShow', 'No Show')}</option>
            </select>
          </div>

          {/* Notes List */}
          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t('tools.sessionNotes.noSessionNotesFound', 'No session notes found')}</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {t('tools.sessionNotes.createFirstNote', 'Create First Note')}
                  </button>
                </CardContent>
              </Card>
            ) : (
              filteredNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{note.studentName}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(note.status)}`}>
                            {note.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {note.sessionDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {note.startTime} - {note.endTime} ({note.duration} min)
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {note.subject}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {note.tutorName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {note.sessionSummary}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">{t('tools.sessionNotes.engagement', 'Engagement:')}</span>
                            {renderStars(note.studentEngagement)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">{t('tools.sessionNotes.understanding', 'Understanding:')}</span>
                            {renderStars(note.studentUnderstanding)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewNote(note)}
                          className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
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
            <CardTitle>{selectedNoteId ? t('tools.sessionNotes.editSessionNote', 'Edit Session Note') : t('tools.sessionNotes.newSessionNote', 'New Session Note')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.sessionNotes.studentName', 'Student Name *')}</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.sessionNotes.enterStudentName', 'Enter student name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.sessionNotes.tutorName', 'Tutor Name')}</label>
                <input
                  type="text"
                  value={formData.tutorName}
                  onChange={(e) => setFormData({ ...formData, tutorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.sessionNotes.enterTutorName', 'Enter tutor name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.sessionNotes.subject', 'Subject')}</label>
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
                <label className="block text-sm font-medium mb-1">{t('tools.sessionNotes.sessionDate', 'Session Date')}</label>
                <input
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.sessionNotes.startTime', 'Start Time')}</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.sessionNotes.endTime', 'End Time')}</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('tools.sessionNotes.status', 'Status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as SessionStatus })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="completed">{t('tools.sessionNotes.completed3', 'Completed')}</option>
                  <option value="scheduled">{t('tools.sessionNotes.scheduled2', 'Scheduled')}</option>
                  <option value="cancelled">{t('tools.sessionNotes.cancelled2', 'Cancelled')}</option>
                  <option value="no_show">{t('tools.sessionNotes.noShow2', 'No Show')}</option>
                </select>
              </div>
            </div>

            {/* Session Summary */}
            <div>
              <label className="block text-sm font-medium mb-1">{t('tools.sessionNotes.sessionSummary', 'Session Summary *')}</label>
              <textarea
                value={formData.sessionSummary}
                onChange={(e) => setFormData({ ...formData, sessionSummary: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                placeholder={t('tools.sessionNotes.describeWhatWasCoveredIn', 'Describe what was covered in the session...')}
              />
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.sessionNotes.studentEngagement', 'Student Engagement')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setFormData({ ...formData, studentEngagement: rating as 1 | 2 | 3 | 4 | 5 })
                      }
                      className={`p-2 rounded ${
                        formData.studentEngagement === rating
                          ? 'bg-yellow-100 dark:bg-yellow-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= (formData.studentEngagement || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('tools.sessionNotes.studentUnderstanding', 'Student Understanding')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setFormData({ ...formData, studentUnderstanding: rating as 1 | 2 | 3 | 4 | 5 })
                      }
                      className={`p-2 rounded ${
                        formData.studentUnderstanding === rating
                          ? 'bg-yellow-100 dark:bg-yellow-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= (formData.studentUnderstanding || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Topics Covered */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('topics')}
              >
                <label className="text-sm font-medium">{t('tools.sessionNotes.topicsCovered', 'Topics Covered')}</label>
                {expandedSections.topics ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              {expandedSections.topics && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTopic.name}
                      onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.sessionNotes.topicName', 'Topic name')}
                    />
                    <input
                      type="number"
                      value={newTopic.duration}
                      onChange={(e) => setNewTopic({ ...newTopic, duration: parseInt(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.sessionNotes.min', 'Min')}
                    />
                    <select
                      value={newTopic.mastery}
                      onChange={(e) =>
                        setNewTopic({ ...newTopic, mastery: e.target.value as 'introduced' | 'practicing' | 'mastered' })
                      }
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="introduced">{t('tools.sessionNotes.introduced', 'Introduced')}</option>
                      <option value="practicing">{t('tools.sessionNotes.practicing', 'Practicing')}</option>
                      <option value="mastered">{t('tools.sessionNotes.mastered', 'Mastered')}</option>
                    </select>
                    <button
                      onClick={addTopic}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.topicsCovered || []).map((topic) => (
                      <span
                        key={topic.id}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getMasteryColor(topic.mastery)}`}
                      >
                        {topic.name} ({topic.duration}min)
                        <button onClick={() => removeTopic(topic.id)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Areas of Struggle */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.sessionNotes.areasOfStruggle', 'Areas of Struggle')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newStruggle}
                  onChange={(e) => setNewStruggle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.sessionNotes.addAreaOfStruggle', 'Add area of struggle')}
                  onKeyPress={(e) => e.key === 'Enter' && addStruggle()}
                />
                <button
                  onClick={addStruggle}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.areasOfStruggle || []).map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm flex items-center gap-2"
                  >
                    {item}
                    <button onClick={() => removeStruggle(index)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tools.sessionNotes.improvementsNoticed', 'Improvements Noticed')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newImprovement}
                  onChange={(e) => setNewImprovement(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                  placeholder={t('tools.sessionNotes.addImprovement', 'Add improvement')}
                  onKeyPress={(e) => e.key === 'Enter' && addImprovement()}
                />
                <button
                  onClick={addImprovement}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.improvements || []).map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center gap-2"
                  >
                    {item}
                    <button onClick={() => removeImprovement(index)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Homework */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('homework')}
              >
                <label className="text-sm font-medium">{t('tools.sessionNotes.homeworkAssigned', 'Homework Assigned')}</label>
                {expandedSections.homework ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              {expandedSections.homework && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newHomework.title}
                      onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.sessionNotes.title', 'Title')}
                    />
                    <input
                      type="text"
                      value={newHomework.description}
                      onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                      className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.sessionNotes.description', 'Description')}
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={newHomework.dueDate}
                        onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      />
                      <button
                        onClick={addHomeworkItem}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(formData.homework || []).map((hw) => (
                      <div
                        key={hw.id}
                        className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{hw.title}</p>
                          <p className="text-sm text-gray-500">{hw.description}</p>
                          {hw.dueDate && (
                            <p className="text-xs text-gray-400">Due: {hw.dueDate}</p>
                          )}
                        </div>
                        <button onClick={() => removeHomework(hw.id)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('notes')}
              >
                <label className="text-sm font-medium">{t('tools.sessionNotes.additionalNotes', 'Additional Notes')}</label>
                {expandedSections.notes ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              {expandedSections.notes && (
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('tools.sessionNotes.nextSessionFocus', 'Next Session Focus')}</label>
                    <textarea
                      value={formData.nextSessionFocus}
                      onChange={(e) => setFormData({ ...formData, nextSessionFocus: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.sessionNotes.whatToFocusOnNext', 'What to focus on next time...')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('tools.sessionNotes.notesForParents', 'Notes for Parents')}</label>
                    <textarea
                      value={formData.parentNotes}
                      onChange={(e) => setFormData({ ...formData, parentNotes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.sessionNotes.notesToShareWithParents', 'Notes to share with parents...')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('tools.sessionNotes.privateNotesTutorOnly', 'Private Notes (Tutor Only)')}</label>
                    <textarea
                      value={formData.privateNotes}
                      onChange={(e) => setFormData({ ...formData, privateNotes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      placeholder={t('tools.sessionNotes.privateNotesForYourself', 'Private notes for yourself...')}
                    />
                  </div>
                </div>
              )}
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
                {t('tools.sessionNotes.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveNote}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {selectedNoteId ? t('tools.sessionNotes.updateNote', 'Update Note') : t('tools.sessionNotes.saveNote', 'Save Note')}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Note */}
      {activeTab === 'view' && selectedNote && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('tools.sessionNotes.sessionDetails', 'Session Details')}</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditNote(selectedNote)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('tools.sessionNotes.edit', 'Edit')}
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('tools.sessionNotes.backToList', 'Back to List')}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('tools.sessionNotes.student', 'Student')}</p>
                <p className="font-semibold">{selectedNote.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.sessionNotes.tutor', 'Tutor')}</p>
                <p className="font-semibold">{selectedNote.tutorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.sessionNotes.subject2', 'Subject')}</p>
                <p className="font-semibold">{selectedNote.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.sessionNotes.status2', 'Status')}</p>
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedNote.status)}`}>
                  {selectedNote.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.sessionNotes.date', 'Date')}</p>
                <p className="font-semibold">{selectedNote.sessionDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.sessionNotes.time', 'Time')}</p>
                <p className="font-semibold">
                  {selectedNote.startTime} - {selectedNote.endTime} ({selectedNote.duration} min)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.sessionNotes.engagement2', 'Engagement')}</p>
                {renderStars(selectedNote.studentEngagement)}
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('tools.sessionNotes.understanding2', 'Understanding')}</p>
                {renderStars(selectedNote.studentUnderstanding)}
              </div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="font-semibold mb-2">{t('tools.sessionNotes.sessionSummary2', 'Session Summary')}</h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {selectedNote.sessionSummary}
              </p>
            </div>

            {/* Topics */}
            {selectedNote.topicsCovered.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.sessionNotes.topicsCovered2', 'Topics Covered')}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNote.topicsCovered.map((topic) => (
                    <span
                      key={topic.id}
                      className={`px-3 py-1 rounded-full text-sm ${getMasteryColor(topic.mastery)}`}
                    >
                      {topic.name} ({topic.duration}min - {topic.mastery})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Struggles & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedNote.areasOfStruggle.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-orange-600">{t('tools.sessionNotes.areasOfStruggle2', 'Areas of Struggle')}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedNote.areasOfStruggle.map((item, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedNote.improvements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">{t('tools.sessionNotes.improvements', 'Improvements')}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedNote.improvements.map((item, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Homework */}
            {selectedNote.homework.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.sessionNotes.homeworkAssigned2', 'Homework Assigned')}</h3>
                <div className="space-y-2">
                  {selectedNote.homework.map((hw) => (
                    <div
                      key={hw.id}
                      className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <p className="font-medium">{hw.title}</p>
                      {hw.description && <p className="text-sm text-gray-500">{hw.description}</p>}
                      {hw.dueDate && <p className="text-xs text-gray-400">Due: {hw.dueDate}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Session Focus */}
            {selectedNote.nextSessionFocus && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.sessionNotes.nextSessionFocus2', 'Next Session Focus')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedNote.nextSessionFocus}</p>
              </div>
            )}

            {/* Parent Notes */}
            {selectedNote.parentNotes && (
              <div>
                <h3 className="font-semibold mb-2">{t('tools.sessionNotes.notesForParents2', 'Notes for Parents')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedNote.parentNotes}</p>
              </div>
            )}

            {/* Private Notes */}
            {selectedNote.privateNotes && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t('tools.sessionNotes.privateNotes', 'Private Notes')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedNote.privateNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionNotesTool;
