'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Calendar,
  Clock,
  Users,
  User,
  Video,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Briefcase,
  MessageSquare,
  Send,
  Link,
  Copy,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
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

interface InterviewSchedulerToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type InterviewType = 'phone' | 'video' | 'onsite' | 'panel' | 'technical' | 'final';
type InterviewStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
type FeedbackRating = 'strong-hire' | 'hire' | 'no-decision' | 'no-hire' | 'strong-no-hire';

interface Interviewer {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobId: string;
  jobTitle: string;
  interviewType: InterviewType;
  status: InterviewStatus;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  timezone: string;
  location: string;
  meetingLink: string;
  interviewers: Interviewer[];
  notes: string;
  feedback: string;
  rating: FeedbackRating | null;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Constants
const INTERVIEW_TYPES: { value: InterviewType; label: string; icon: any }[] = [
  { value: 'phone', label: 'Phone Screen', icon: Phone },
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'onsite', label: 'On-site', icon: Building2 },
  { value: 'panel', label: 'Panel Interview', icon: Users },
  { value: 'technical', label: 'Technical', icon: Briefcase },
  { value: 'final', label: 'Final Round', icon: CheckCircle },
];

const INTERVIEW_STATUSES: { value: InterviewStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'in-progress', label: 'In Progress', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'purple' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'no-show', label: 'No Show', color: 'red' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'orange' },
];

const FEEDBACK_RATINGS: { value: FeedbackRating; label: string; color: string }[] = [
  { value: 'strong-hire', label: 'Strong Hire', color: 'green' },
  { value: 'hire', label: 'Hire', color: 'lime' },
  { value: 'no-decision', label: 'No Decision', color: 'yellow' },
  { value: 'no-hire', label: 'No Hire', color: 'orange' },
  { value: 'strong-no-hire', label: 'Strong No Hire', color: 'red' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  if (hour > 18) return null;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}).filter(Boolean) as string[];

// Column configuration for exports
const INTERVIEW_COLUMNS: ColumnConfig[] = [
  { key: 'candidateName', header: 'Candidate', type: 'string' },
  { key: 'candidateEmail', header: 'Email', type: 'string' },
  { key: 'jobTitle', header: 'Position', type: 'string' },
  { key: 'interviewType', header: 'Interview Type', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'startTime', header: 'Start Time', type: 'string' },
  { key: 'duration', header: 'Duration (min)', type: 'number' },
  { key: 'location', header: 'Location', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'string' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getEndTime = (startTime: string, duration: number) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

const isToday = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
};

const isThisWeek = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays < 7;
};

// Main Component
export const InterviewSchedulerTool: React.FC<InterviewSchedulerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: interviews,
    addItem: addInterviewToBackend,
    updateItem: updateInterviewBackend,
    deleteItem: deleteInterviewBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Interview>('interview-scheduler', [], INTERVIEW_COLUMNS);

  // Local UI State
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // New interview form state
  const [newInterview, setNewInterview] = useState<Partial<Interview>>({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    jobId: '',
    jobTitle: '',
    interviewType: 'video',
    status: 'scheduled',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: '',
    meetingLink: '',
    interviewers: [],
    notes: '',
    feedback: '',
    rating: null,
    reminderSent: false,
  });

  // Temp interviewer state
  const [tempInterviewer, setTempInterviewer] = useState<Partial<Interviewer>>({
    name: '',
    email: '',
    role: '',
    department: '',
  });

  // Filter interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const matchesSearch =
        interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || interview.status === filterStatus;
      const matchesType = filterType === 'all' || interview.interviewType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [interviews, searchTerm, filterStatus, filterType]);

  // Interviews by date for calendar
  const interviewsByDate = useMemo(() => {
    const byDate: Record<string, Interview[]> = {};
    interviews.forEach((interview) => {
      if (!byDate[interview.date]) {
        byDate[interview.date] = [];
      }
      byDate[interview.date].push(interview);
    });
    return byDate;
  }, [interviews]);

  // Analytics
  const analytics = useMemo(() => {
    const today = interviews.filter((i) => isToday(i.date) && ['scheduled', 'confirmed'].includes(i.status)).length;
    const thisWeek = interviews.filter((i) => isThisWeek(i.date) && ['scheduled', 'confirmed'].includes(i.status)).length;
    const pending = interviews.filter((i) => i.status === 'scheduled').length;
    const completed = interviews.filter((i) => i.status === 'completed').length;
    const hired = interviews.filter((i) => i.rating === 'strong-hire' || i.rating === 'hire').length;

    return { today, thisWeek, pending, completed, hired };
  }, [interviews]);

  // Add interviewer
  const addInterviewer = () => {
    if (tempInterviewer.name && tempInterviewer.email) {
      const interviewer: Interviewer = {
        id: generateId(),
        name: tempInterviewer.name || '',
        email: tempInterviewer.email || '',
        role: tempInterviewer.role || '',
        department: tempInterviewer.department || '',
      };
      setNewInterview((prev) => ({
        ...prev,
        interviewers: [...(prev.interviewers || []), interviewer],
      }));
      setTempInterviewer({ name: '', email: '', role: '', department: '' });
    }
  };

  // Save interview
  const saveInterview = () => {
    if (!newInterview.candidateName || !newInterview.candidateEmail || !newInterview.date) {
      setValidationMessage('Please fill in required fields (Candidate Name, Email, Date)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const endTime = getEndTime(newInterview.startTime || '09:00', newInterview.duration || 60);

    const interview: Interview = {
      id: editingInterview?.id || generateId(),
      candidateId: editingInterview?.candidateId || generateId(),
      candidateName: newInterview.candidateName || '',
      candidateEmail: newInterview.candidateEmail || '',
      candidatePhone: newInterview.candidatePhone || '',
      jobId: newInterview.jobId || '',
      jobTitle: newInterview.jobTitle || '',
      interviewType: newInterview.interviewType || 'video',
      status: newInterview.status || 'scheduled',
      date: newInterview.date || new Date().toISOString().split('T')[0],
      startTime: newInterview.startTime || '09:00',
      endTime,
      duration: newInterview.duration || 60,
      timezone: newInterview.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: newInterview.location || '',
      meetingLink: newInterview.meetingLink || '',
      interviewers: newInterview.interviewers || [],
      notes: newInterview.notes || '',
      feedback: newInterview.feedback || '',
      rating: newInterview.rating || null,
      reminderSent: editingInterview?.reminderSent || false,
      createdAt: editingInterview?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingInterview) {
      updateInterviewBackend(interview.id, interview);
    } else {
      addInterviewToBackend(interview);
    }

    resetForm();
    setViewMode('list');
  };

  const resetForm = () => {
    setNewInterview({
      candidateName: '',
      candidateEmail: '',
      candidatePhone: '',
      jobId: '',
      jobTitle: '',
      interviewType: 'video',
      status: 'scheduled',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      duration: 60,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: '',
      meetingLink: '',
      interviewers: [],
      notes: '',
      feedback: '',
      rating: null,
      reminderSent: false,
    });
    setEditingInterview(null);
    setTempInterviewer({ name: '', email: '', role: '', department: '' });
  };

  const editInterview = (interview: Interview) => {
    setEditingInterview(interview);
    setNewInterview(interview);
    setViewMode('create');
  };

  const deleteInterview = async (interviewId: string) => {
    const confirmed = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this interview?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteInterviewBackend(interviewId);
    }
  };

  const updateStatus = (interview: Interview, newStatus: InterviewStatus) => {
    updateInterviewBackend(interview.id, {
      ...interview,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateFeedback = (interview: Interview, rating: FeedbackRating, feedback: string) => {
    updateInterviewBackend(interview.id, {
      ...interview,
      rating,
      feedback,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: InterviewStatus) => {
    const statusConfig = INTERVIEW_STATUSES.find((s) => s.value === status);
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[statusConfig?.color || 'gray'];
  };

  const getRatingColor = (rating: FeedbackRating | null) => {
    if (!rating) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    const ratingConfig = FEEDBACK_RATINGS.find((r) => r.value === rating);
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[ratingConfig?.color || 'gray'];
  };

  // Calendar navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Export handlers
  const handleExport = (format: string) => {
    const exportData = filteredInterviews.map((i) => ({
      ...i,
      interviewers: i.interviewers.map((int) => int.name).join('; '),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, INTERVIEW_COLUMNS, 'interviews');
        break;
      case 'excel':
        exportToExcel(exportData, INTERVIEW_COLUMNS, 'interviews');
        break;
      case 'json':
        exportToJSON(exportData, 'interviews');
        break;
      case 'pdf':
        exportToPDF(exportData, INTERVIEW_COLUMNS, 'Interview Schedule Report');
        break;
      case 'print':
        printData(exportData, INTERVIEW_COLUMNS, 'Interview Schedule Report');
        break;
    }
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.interviewScheduler.interviewScheduler', 'Interview Scheduler')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.interviewScheduler.scheduleAndManageInterviews', 'Schedule and manage interviews')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="interview-scheduler" toolName="Interview Scheduler" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          {(['list', 'calendar', 'create'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                if (mode === 'create') resetForm();
                setViewMode(mode);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {mode === 'list' ? 'List View' : mode === 'calendar' ? 'Calendar' : (editingInterview ? t('tools.interviewScheduler.editInterview', 'Edit Interview') : t('tools.interviewScheduler.scheduleInterview2', 'Schedule Interview'))}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{analytics.today}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.interviewScheduler.today', 'Today')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analytics.thisWeek}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.interviewScheduler.thisWeek', 'This Week')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{analytics.pending}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.interviewScheduler.pending', 'Pending')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{analytics.completed}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.interviewScheduler.completed', 'Completed')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{analytics.hired}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.interviewScheduler.recommendedHire', 'Recommended Hire')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.interviewScheduler.searchInterviews', 'Search interviews...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.interviewScheduler.allStatuses', 'All Statuses')}</option>
                {INTERVIEW_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.interviewScheduler.allTypes', 'All Types')}</option>
                {INTERVIEW_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Interview List */}
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tools.interviewScheduler.noInterviewsFound', 'No interviews found')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {interviews.length === 0
                    ? t('tools.interviewScheduler.scheduleYourFirstInterviewTo', 'Schedule your first interview to get started.') : t('tools.interviewScheduler.tryAdjustingYourSearchOr', 'Try adjusting your search or filters.')}
                </p>
                <button
                  onClick={() => setViewMode('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.interviewScheduler.scheduleInterview', 'Schedule Interview')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInterviews
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((interview) => {
                    const TypeIcon = INTERVIEW_TYPES.find((t) => t.value === interview.interviewType)?.icon || Video;
                    return (
                      <Card key={interview.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${
                                isToday(interview.date)
                                  ? 'bg-purple-100 dark:bg-purple-900'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}>
                                <TypeIcon className={`w-6 h-6 ${
                                  isToday(interview.date)
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {interview.candidateName}
                                  </h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                                    {INTERVIEW_STATUSES.find((s) => s.value === interview.status)?.label}
                                  </span>
                                  {interview.rating && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRatingColor(interview.rating)}`}>
                                      {FEEDBACK_RATINGS.find((r) => r.value === interview.rating)?.label}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                  {interview.jobTitle} - {INTERVIEW_TYPES.find((t) => t.value === interview.interviewType)?.label}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(interview.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatTime(interview.startTime)} - {formatTime(interview.endTime)}
                                  </span>
                                  {interview.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {interview.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editInterview(interview)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteInterview(interview.id)}
                                className="p-1.5 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Interviewers and Actions */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              {interview.interviewers.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {interview.interviewers.map((i) => i.name).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {interview.meetingLink && (
                                <button
                                  onClick={() => copyMeetingLink(interview.meetingLink)}
                                  className="flex items-center gap-1 px-2 py-1 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 rounded"
                                >
                                  <Link className="w-4 h-4" />
                                  {t('tools.interviewScheduler.copyLink', 'Copy Link')}
                                </button>
                              )}
                              <select
                                value={interview.status}
                                onChange={(e) => updateStatus(interview, e.target.value as InterviewStatus)}
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                {INTERVIEW_STATUSES.map((status) => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <CardTitle>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                  {getCalendarDays().map((date, idx) => {
                    const dateStr = date?.toISOString().split('T')[0];
                    const dayInterviews = dateStr ? interviewsByDate[dateStr] || [] : [];
                    const isCurrentMonth = date?.getMonth() === currentMonth.getMonth();
                    const isTodayDate = date && isToday(date.toISOString());

                    return (
                      <div
                        key={idx}
                        className={`min-h-[100px] p-2 border border-gray-100 dark:border-gray-700 ${
                          !date ? 'bg-gray-50 dark:bg-gray-800' : ''
                        } ${isTodayDate ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                      >
                        {date && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${
                              isTodayDate
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayInterviews.slice(0, 2).map((interview) => (
                                <div
                                  key={interview.id}
                                  className="text-xs p-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 truncate cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800"
                                  onClick={() => editInterview(interview)}
                                >
                                  {formatTime(interview.startTime)} {interview.candidateName}
                                </div>
                              ))}
                              {dayInterviews.length > 2 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  +{dayInterviews.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'create' && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{editingInterview ? t('tools.interviewScheduler.editInterview2', 'Edit Interview') : t('tools.interviewScheduler.scheduleNewInterview', 'Schedule New Interview')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Candidate Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.candidateName', 'Candidate Name *')}
                    </label>
                    <input
                      type="text"
                      value={newInterview.candidateName}
                      onChange={(e) => setNewInterview({ ...newInterview, candidateName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.candidateEmail', 'Candidate Email *')}
                    </label>
                    <input
                      type="email"
                      value={newInterview.candidateEmail}
                      onChange={(e) => setNewInterview({ ...newInterview, candidateEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.candidatePhone', 'Candidate Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newInterview.candidatePhone}
                      onChange={(e) => setNewInterview({ ...newInterview, candidatePhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.position', 'Position')}
                    </label>
                    <input
                      type="text"
                      value={newInterview.jobTitle}
                      onChange={(e) => setNewInterview({ ...newInterview, jobTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Interview Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.interviewType', 'Interview Type')}
                    </label>
                    <select
                      value={newInterview.interviewType}
                      onChange={(e) => setNewInterview({ ...newInterview, interviewType: e.target.value as InterviewType })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {INTERVIEW_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.date', 'Date *')}
                    </label>
                    <input
                      type="date"
                      value={newInterview.date}
                      onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.startTime', 'Start Time')}
                    </label>
                    <select
                      value={newInterview.startTime}
                      onChange={(e) => setNewInterview({ ...newInterview, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>
                          {formatTime(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.duration', 'Duration')}
                    </label>
                    <select
                      value={newInterview.duration}
                      onChange={(e) => setNewInterview({ ...newInterview, duration: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {DURATIONS.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration} minutes
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.location', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={newInterview.location}
                      onChange={(e) => setNewInterview({ ...newInterview, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.interviewScheduler.officeOrRemote', 'Office or remote')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.interviewScheduler.meetingLink', 'Meeting Link')}
                    </label>
                    <input
                      type="url"
                      value={newInterview.meetingLink}
                      onChange={(e) => setNewInterview({ ...newInterview, meetingLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.interviewScheduler.httpsZoomUs', 'https://zoom.us/...')}
                    />
                  </div>
                </div>

                {/* Interviewers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tools.interviewScheduler.interviewers', 'Interviewers')}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                    <input
                      type="text"
                      value={tempInterviewer.name}
                      onChange={(e) => setTempInterviewer({ ...tempInterviewer, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.interviewScheduler.name', 'Name')}
                    />
                    <input
                      type="email"
                      value={tempInterviewer.email}
                      onChange={(e) => setTempInterviewer({ ...tempInterviewer, email: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.interviewScheduler.email', 'Email')}
                    />
                    <input
                      type="text"
                      value={tempInterviewer.role}
                      onChange={(e) => setTempInterviewer({ ...tempInterviewer, role: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.interviewScheduler.role', 'Role')}
                    />
                    <button
                      onClick={addInterviewer}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {newInterview.interviewers && newInterview.interviewers.length > 0 && (
                    <div className="space-y-2">
                      {newInterview.interviewers.map((interviewer, idx) => (
                        <div key={interviewer.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{interviewer.name}</p>
                            <p className="text-xs text-gray-500">{interviewer.email} - {interviewer.role}</p>
                          </div>
                          <button
                            onClick={() =>
                              setNewInterview({
                                ...newInterview,
                                interviewers: newInterview.interviewers?.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('tools.interviewScheduler.notes', 'Notes')}
                  </label>
                  <textarea
                    value={newInterview.notes}
                    onChange={(e) => setNewInterview({ ...newInterview, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.interviewScheduler.interviewPreparationNotes', 'Interview preparation notes...')}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveInterview}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {editingInterview ? t('tools.interviewScheduler.updateInterview', 'Update Interview') : t('tools.interviewScheduler.scheduleInterview3', 'Schedule Interview')}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setViewMode('list');
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {t('tools.interviewScheduler.cancel', 'Cancel')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default InterviewSchedulerTool;
